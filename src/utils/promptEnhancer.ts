/**
 * 短剧生成 Prompt 智能增强系统
 * 基于《视频生成 Prompt 智能增强系统产品解决方案（Hermes Agent 多轮对话版）》实现
 *
 * 双模式架构：
 * - V1.0 关键词匹配模式（同步，降级用）：enhancePrompt()
 *   基于预置模板库的关键词匹配+模板拼装，单次调用即输出
 *
 * - V2.0 Hermes Agent 多轮对话模式（异步，推荐）：enhancePromptWithHermes()
 *   底层执行5轮自我对话（解析→加载上下文→生成→自检→修正），
 *   界面不显示对话内容，自动注入剧本/角色/场景上下文，
 *   调用Skills知识库，第4轮自检第5轮修正
 *
 * 核心能力（V2.0）：
 * 1. Hermes多轮对话引擎 - 5轮底层自对话，界面不可见
 * 2. 上下文注入 - 自动加载剧本/角色/场景/前后分镜信息
 * 3. Skills知识库 - 16个专业Skills，语义检索自动匹配
 * 4. 质量自检 - 帧对齐/时间轴/参考图/负面提示词/动作连贯性校验
 * 5. 自动修正 - 根据自检结果自动优化输出
 */

import { hermesEnhancePrompt, type HermesEnhanceResult, type HermesOptions } from './hermesAgent';
import { contextManager, type StoryboardContext } from './contextManager';

// ==================== 模板库定义 ====================

/**
 * 通用质量与约束模板（全场景必加）
 */
const QUALITY_TEMPLATES = {
  // 正向基础画质参数
  positiveBase: '电影级画质，8K超高清，专业摄影，光影层次丰富，色彩饱满，细节锐利，景深效果，专业调色，画面稳定，无抖动',
  // 通用负向约束
  negativeBase: '低质量，模糊，像素化，变形，扭曲，多余肢体，缺失肢体，面部崩坏，五官错位，斗鸡眼，颜色溢出，噪点，过曝，欠曝，水印，文字，字幕，logo',
  // 标准结构化输出框架前缀
  structurePrefix: '【画面描述】'
};

/**
 * Top30 高频精细动作模板库
 * 触发规则：识别输入中的动作关键词，自动用标准拆解话术替换笼统描述
 */
const ACTION_TEMPLATES: { keywords: string[]; template: string }[] = [
  { keywords: ['走路', '行走', '步行', '走过来', '走过去'], template: '人物自然行走，双臂随步伐规律摆动，重心平稳转移，脚步落地扎实，身体微微起伏，步态协调自然' },
  { keywords: ['跑步', '奔跑', '跑过来', '跑过去'], template: '人物快速奔跑，双臂前后摆动有力，双腿大步跨越，身体前倾，头发和衣物随风飘动，表情专注' },
  { keywords: ['坐下', '坐下来', '入座'], template: '人物缓缓屈膝坐下，双手轻扶座椅扶手，身体重心平稳下移，背部自然靠向椅背，姿态优雅放松' },
  { keywords: ['站起', '站起来', '起身'], template: '人物双手撑膝或扶桌，腿部发力缓缓站起，身体重心上移，姿态挺拔，动作连贯流畅' },
  { keywords: ['开门', '推门', '拉开门'], template: '人物伸手握住门把手，手腕转动解锁，手臂发力将门拉开/推开，身体微微侧让，目光看向门内' },
  { keywords: ['关门', '带上门'], template: '人物反手拉住门把手，手臂缓缓回收将门闭合，门锁轻响，动作轻柔' },
  { keywords: ['拿', '拿起', '举起', '端起'], template: '人物伸手握住物品，手指自然收拢，手腕平稳发力将物品拿起/举起，手臂动作流畅，物品握持稳固' },
  { keywords: ['放下', '放置', '搁下'], template: '人物手持物品缓缓下移，将物品平稳放置在目标位置，手指轻轻松开，手臂收回，动作轻柔准确' },
  { keywords: ['翻包', '从包里找', '掏东西', '从公文包'], template: '人物单手拉开包袋拉链，另一只手伸入包内翻找，手指触碰到目标物品后捏住取出，动作连贯自然' },
  { keywords: ['看手机', '玩手机', '查看手机'], template: '人物单手持握手机，拇指在屏幕上滑动/点击，目光注视屏幕，表情专注，偶尔嘴角微动' },
  { keywords: ['打电话', '接电话', '通话'], template: '人物将手机举至耳边，头部微倾，嘴唇开合说话，表情随对话内容变化，另一只手自然下垂或做手势' },
  { keywords: ['喝水', '喝咖啡', '喝茶', '喝饮料'], template: '人物手持杯具，手臂抬起将杯口送至唇边，头部微仰，嘴唇轻含杯口小口啜饮，喉结微动，放下杯子后嘴角微抿' },
  { keywords: ['吃饭', '吃东西', '用餐'], template: '人物手持餐具夹取食物，送入口中，嘴唇闭合咀嚼，喉结微动吞咽，表情满足，动作优雅' },
  { keywords: ['写字', '记录', '填写'], template: '人物手持笔，手腕灵活运笔，在纸面上书写，目光注视纸面，表情专注，偶尔停顿思考' },
  { keywords: ['点头', '摇头'], template: '人物头部缓慢上下点头/左右摇头，动作幅度适中，表情配合语气，自然不僵硬' },
  { keywords: ['微笑', '笑', '笑容'], template: '人物嘴角缓缓上扬，眼睛微微弯起，面颊肌肉自然隆起，笑容温暖真诚，眼神柔和' },
  { keywords: ['哭泣', '流泪', '哭'], template: '人物眼眶泛红，泪水从眼角滑落，沿面颊流下，嘴唇微颤，表情悲伤，肩膀微微耸动' },
  { keywords: ['拥抱', '抱'], template: '两人相向靠近，双臂环住对方后背，身体紧贴，头部轻靠，动作温柔，持续数秒后缓缓松开' },
  { keywords: ['握手', '牵手'], template: '两人伸手相握，手指自然交扣，力度适中，上下轻摇两下后松开，表情友好' },
  { keywords: ['转身', '回头', '转过头'], template: '人物以腰为轴缓缓转身，头部先转，身体跟随，目光随转动方向移动，动作流畅不僵硬' },
  { keywords: ['蹲下', '弯腰', '俯身'], template: '人物屈膝下蹲/弯腰俯身，背部保持平直，手臂自然下垂或伸向目标，动作稳当不摇晃' },
  { keywords: ['爬楼梯', '上楼梯', '下楼梯'], template: '人物双脚交替迈上/迈下台阶，手臂自然摆动配合步伐，身体微微前倾，节奏均匀' },
  { keywords: ['开车', '驾驶', '握方向盘'], template: '人物双手握方向盘，目视前方，偶尔转动方向盘调整方向，表情专注，身体随车辆轻微晃动' },
  { keywords: ['穿衣', '脱衣', '换衣服'], template: '人物双手提起衣物，头部伸入领口，手臂依次穿入袖管，整理衣襟，动作连贯自然' },
  { keywords: ['梳头', '整理头发', '扎头发'], template: '人物手持梳子/发圈，从头顶向下梳理头发，手指穿插发丝，动作轻柔，表情放松' },
  { keywords: ['化妆', '涂口红', '补妆'], template: '人物手持化妆工具，对镜细致涂抹，手腕灵活转动，表情专注，动作轻柔' },
  { keywords: ['抽烟', '点烟', '吸烟'], template: '人物手指夹烟，另一只手打火点燃，吸一口后缓缓吐出烟雾，表情放松，动作熟练' },
  { keywords: ['鼓掌', '拍手'], template: '人物双手抬起，掌心相对有节奏地拍击，表情赞许，动作自然不僵硬' },
  { keywords: ['指', '指向', '指着'], template: '人物手臂抬起，食指伸直指向目标方向，其余手指自然弯曲，目光随手指方向看去' },
  { keywords: ['挠头', '摸头', '思考'], template: '人物抬手挠后脑勺/摸下巴，眉头微蹙，目光游移，表情若有所思' }
];

/**
 * 22类场景光影标准模板库
 * 触发规则：识别场景关键词，自动拼接对应光影描述
 */
const SCENE_LIGHTING_TEMPLATES: { keywords: string[]; lighting: string; category: string }[] = [
  // 室内日景类
  { keywords: ['办公室', '写字楼', '工位'], lighting: '室内白天，大面积落地窗透入柔和自然光，顶部冷白光筒灯补光，桌面有清晰投影，整体明亮通透，现代商务感', category: '室内日景' },
  { keywords: ['家', '客厅', '卧室', '公寓', '房间'], lighting: '室内白天，窗户透入温暖自然光，浅色墙面反射柔和漫射光，家居环境温馨舒适，色调偏暖', category: '室内日景' },
  { keywords: ['咖啡厅', '咖啡馆', '咖啡店'], lighting: '室内白天，落地窗透入柔和侧光，暖色吊灯营造温馨氛围，木质桌面有柔和反光，文艺慵懒感', category: '室内日景' },
  { keywords: ['餐厅', '饭店', '食堂'], lighting: '室内白天，顶部暖光吊灯均匀照明，桌面有柔和高光，整体明亮温馨，食欲感强', category: '室内日景' },
  { keywords: ['商场', '超市', '店铺'], lighting: '室内白天，顶部密集冷白光筒灯均匀照明，空间明亮通透，商品陈列有清晰光泽，现代商业感', category: '室内日景' },
  { keywords: ['教室', '学校', '图书馆'], lighting: '室内白天，大面积窗户透入自然光，顶部荧光灯均匀补光，整体明亮整洁，学习氛围浓厚', category: '室内日景' },
  { keywords: ['医院', '诊所'], lighting: '室内白天，顶部冷白光均匀照明，墙面洁白，整体明亮干净，专业医疗感', category: '室内日景' },
  // 室内夜景/弱光类
  { keywords: ['酒吧', '夜店', '酒馆'], lighting: '室内夜景，昏暗环境中彩色霓虹灯光斑点缀，吧台有暖色聚光，人物面部有侧光勾勒，氛围感强烈', category: '室内夜景' },
  { keywords: ['夜景', '夜晚室内', '关灯'], lighting: '室内夜景，仅有微弱环境光，人物面部有侧逆光勾勒轮廓，阴影浓重，神秘氛围感', category: '室内夜景' },
  { keywords: ['电影院', '剧场'], lighting: '室内弱光，银幕光线作为主光源映照人物面部，周围环境昏暗，光影对比强烈', category: '室内夜景' },
  // 户外场景类
  { keywords: ['街道', '马路', '城市', '街头'], lighting: '户外白天，阳光从侧上方照射，建筑物投下清晰阴影，地面有反光，都市感强烈', category: '户外日景' },
  { keywords: ['公园', '花园', '草坪'], lighting: '户外白天，阳光透过树叶形成斑驳光影，草地翠绿，整体明亮清新，自然舒适感', category: '户外日景' },
  { keywords: ['海边', '海滩', '沙滩'], lighting: '户外白天，强烈阳光照射，海面反光耀眼，沙滩明亮，天空湛蓝，空气通透', category: '户外日景' },
  { keywords: ['山', '森林', '树林', '野外'], lighting: '户外白天，阳光透过树冠形成丁达尔效应，林间光影斑驳，自然原始感', category: '户外日景' },
  { keywords: ['雨天', '下雨', '雨中'], lighting: '户外阴天，漫射光均匀柔和，地面有水洼反光，人物衣物湿润，整体色调偏冷，氛围感强', category: '户外日景' },
  { keywords: ['夜晚街道', '夜景户外', '路灯'], lighting: '户外夜景，路灯暖光作为主光源，地面有湿润反光，远处霓虹灯点缀，都市夜景氛围感', category: '户外夜景' },
  // 特殊氛围类
  { keywords: ['古代', '古风', '古装', '宫殿'], lighting: '室内白天，烛火/灯笼暖光摇曳，木质建筑有柔和反光，整体色调偏暖黄，古典雅致感', category: '特殊氛围' },
  { keywords: ['科幻', '未来', '赛博朋克', '科技'], lighting: '室内/外，蓝紫色霓虹灯光，金属表面有强烈反光，全息投影光效，未来科技感强烈', category: '特殊氛围' },
  { keywords: ['悬疑', '恐怖', '惊悚'], lighting: '弱光环境，单侧硬光照射人物面部，另一半隐入阴影，光影对比强烈，紧张压抑感', category: '特殊氛围' },
  { keywords: ['浪漫', '约会', '烛光'], lighting: '弱光环境，烛光/暖色串灯作为主光源，人物面部有柔和暖光，背景虚化有光斑，浪漫温馨感', category: '特殊氛围' },
  { keywords: ['战场', '战争', '爆炸'], lighting: '户外，爆炸火光作为强光源，烟尘弥漫，光影剧烈变化，紧张激烈感', category: '特殊氛围' },
  { keywords: ['雪地', '冬天', '冰雪'], lighting: '户外白天，雪地强烈反光，整体明亮偏冷调，天空灰白，空气清透', category: '特殊氛围' }
];

/**
 * 人物一致性约束模板库
 */
const CHARACTER_CONSISTENCY_TEMPLATES = {
  // 通用版（单镜头）
  general: '人物五官特征保持一致，发型发色固定，服饰穿搭不变，肤色统一，身形比例稳定',
  // 多镜头强化版
  multiShot: '【人物一致性锁定】全镜头人物五官完全一致，发型发色不变，服饰穿搭统一，肤色稳定，身形比例固定，面部特征不随角度变化，同一人物在不同镜头中形象完全统一',
  // 带参考图强化版
  withReference: '【人物一致性强制对齐】严格参考参考图中的人物形象，五官、发型、服饰、肤色完全一致，不得有任何偏差，多角度保持形象统一'
};

/**
 * 台词匹配规则模板库
 */
const DIALOGUE_TEMPLATES = {
  // 台词结构化封装前缀
  dialoguePrefix: '【台词内容】',
  // 时长与口型绑定模板
  lipSync: '人物口型与台词内容严格同步，说话节奏自然，嘴唇开合与音节对应，无口型错位，无漏说台词',
  // 旁白模板
  narration: '【旁白】画外音叙述，人物无需对口型，表情与旁白情绪匹配'
};

// ==================== 核心增强引擎 ====================

export interface EnhancedPrompt {
  originalPrompt: string;
  enhancedPrompt: string;
  negativePrompt: string;
  matchedModules: string[];
  matchedActions: string[];
  matchedScenes: string[];
  hasDialogue: boolean;
  dialogueContent: string;
  isMultiShot: boolean;
  hasReference: boolean;
  // === V2.0 Hermes 多轮对话扩展字段（可选） ===
  /** 使用的增强引擎版本 */
  engineVersion?: 'v1-keyword' | 'v2-hermes';
  /** Hermes多轮对话日志（界面不展示，用于调试） */
  dialogueLog?: HermesEnhanceResult['dialogueLog'];
  /** 匹配的Skills名称列表 */
  matchedSkills?: string[];
  /** 自检报告 */
  selfCheckReport?: HermesEnhanceResult['selfCheckReport'];
  /** 优化说明 */
  optimizationNotes?: string[];
  /** 上下文摘要 */
  contextSummary?: string;
}

export interface EnhanceOptions {
  hasReference?: boolean;
  isMultiShot?: boolean;
  referenceImage?: string;
  // === V2.0 Hermes 选项 ===
  /** 是否使用Hermes多轮对话引擎（默认true） */
  useHermes?: boolean;
  /** 剧本/剧集上下文 */
  context?: Partial<StoryboardContext>;
  /** 进度回调 */
  onProgress?: (round: number, phase: string) => void;
  /** 最大对话轮次（默认5） */
  maxRounds?: number;
}

/**
 * 第一步：信息解析
 * 解析用户输入的分镜脚本，提取关键信息
 */
function parseScript(script: string) {
  // 去除HTML标签
  const cleanText = script.replace(/<[^>]*>/g, '').trim();
  
  // 提取台词（引号内的内容）
  const dialogueMatches = cleanText.match(/[""「」『』]([^""「」『』]+)[""「」『』]/g);
  const dialogues = dialogueMatches ? dialogueMatches.map(d => d.replace(/[""「」『』]/g, '')) : [];
  
  // 提取动作描述（去除台词后的内容）
  let actionText = cleanText;
  if (dialogueMatches) {
    dialogueMatches.forEach(d => {
      actionText = actionText.replace(d, '');
    });
  }
  actionText = actionText.replace(/[""「」『』]/g, '').replace(/[，。！？、；：\s]+/g, ' ').trim();
  
  // 检测多镜头关键词
  const multiShotKeywords = ['个镜头', '多镜头', '分镜', '切换', '先是', '然后', '接着', '随后', '之后'];
  const isMultiShot = multiShotKeywords.some(kw => cleanText.includes(kw));
  
  return {
    cleanText,
    actionText,
    dialogues,
    hasDialogue: dialogues.length > 0,
    isMultiShot
  };
}

/**
 * 第二步：特征提取
 * 从描述文本中提取动作、场景、人物特征
 */
function extractFeatures(actionText: string) {
  // 匹配动作关键词
  const matchedActions: { keyword: string; template: string }[] = [];
  ACTION_TEMPLATES.forEach(action => {
    const found = action.keywords.find(kw => actionText.includes(kw));
    if (found) {
      matchedActions.push({ keyword: found, template: action.template });
    }
  });
  
  // 匹配场景关键词
  const matchedScenes: { keyword: string; lighting: string; category: string }[] = [];
  SCENE_LIGHTING_TEMPLATES.forEach(scene => {
    const found = scene.keywords.find(kw => actionText.includes(kw));
    if (found) {
      matchedScenes.push({ keyword: found, lighting: scene.lighting, category: scene.category });
    }
  });
  
  return { matchedActions, matchedScenes };
}

/**
 * 第三步：模板匹配与动态填充
 * 根据提取的特征匹配最佳模板
 */
function matchAndFill(
  parsed: ReturnType<typeof parseScript>,
  features: ReturnType<typeof extractFeatures>,
  options: EnhanceOptions
): { positive: string; negative: string; matchedModules: string[] } {
  const matchedModules: string[] = [];
  const parts: string[] = [];
  
  // 结构化前缀
  parts.push(QUALITY_TEMPLATES.structurePrefix);
  
  // 1. 通用质量增强（必加）
  matchedModules.push('通用质量增强');
  
  // 2. 精细动作拆解
  if (features.matchedActions.length > 0) {
    matchedModules.push('精细动作拆解');
    // 用专业动作模板替换笼统描述
    let enhancedAction = parsed.actionText;
    features.matchedActions.forEach(action => {
      // 替换第一个匹配的关键词为完整动作描述
      const regex = new RegExp(action.keyword, 'g');
      enhancedAction = enhancedAction.replace(regex, `【${action.keyword}】${action.template}`);
    });
    parts.push(enhancedAction);
  } else {
    parts.push(parsed.actionText || '人物自然状态');
  }
  
  // 3. 光影风格对齐
  if (features.matchedScenes.length > 0) {
    matchedModules.push('光影风格对齐');
    // 使用第一个匹配的场景光影模板
    parts.push(`【场景光影】${features.matchedScenes[0].lighting}`);
  }
  
  // 4. 人物一致性锁定
  if (parsed.cleanText.match(/[男人女人女孩男孩人物角色]/) || parsed.dialogues.length > 0) {
    matchedModules.push('人物一致性锁定');
    if (options.hasReference) {
      parts.push(CHARACTER_CONSISTENCY_TEMPLATES.withReference);
    } else if (parsed.isMultiShot || options.isMultiShot) {
      parts.push(CHARACTER_CONSISTENCY_TEMPLATES.multiShot);
    } else {
      parts.push(CHARACTER_CONSISTENCY_TEMPLATES.general);
    }
  }
  
  // 5. 台词匹配校验
  if (parsed.hasDialogue) {
    matchedModules.push('台词匹配校验');
    const dialogueText = parsed.dialogues.join('；');
    parts.push(`${DIALOGUE_TEMPLATES.dialoguePrefix}${dialogueText}`);
    parts.push(DIALOGUE_TEMPLATES.lipSync);
  }
  
  // 拼接正向基础画质参数
  parts.push(`【画质增强】${QUALITY_TEMPLATES.positiveBase}`);
  
  // 构建负向提示词
  const negative = QUALITY_TEMPLATES.negativeBase;
  
  return {
    positive: parts.filter(p => p.trim()).join('\n'),
    negative,
    matchedModules
  };
}

/**
 * 第四步：校验优化
 * 检查关键词冲突、重复、长度超限
 */
function validateAndOptimize(prompt: string): string {
  // 去除多余空白
  let optimized = prompt.replace(/\n{3,}/g, '\n\n').trim();
  
  // 去重（简单的连续重复检测）
  const lines = optimized.split('\n');
  const seen = new Set<string>();
  const uniqueLines = lines.filter(line => {
    const normalized = line.trim();
    if (seen.has(normalized) && normalized.length > 10) {
      return false;
    }
    seen.add(normalized);
    return true;
  });
  
  return uniqueLines.join('\n');
}

/**
 * 主入口：Prompt 智能增强
 * 接收用户原始分镜脚本，输出增强后的专业生成指令
 */
export function enhancePrompt(script: string, options: EnhanceOptions = {}): EnhancedPrompt {
  if (!script || !script.trim()) {
    return {
      originalPrompt: '',
      enhancedPrompt: '',
      negativePrompt: QUALITY_TEMPLATES.negativeBase,
      matchedModules: [],
      matchedActions: [],
      matchedScenes: [],
      hasDialogue: false,
      dialogueContent: '',
      isMultiShot: false,
      hasReference: !!options.hasReference
    };
  }
  
  // 第一步：信息解析
  const parsed = parseScript(script);
  
  // 第二步：特征提取
  const features = extractFeatures(parsed.actionText);
  
  // 第三步：模板匹配与动态填充
  const matched = matchAndFill(parsed, features, options);
  
  // 第四步：校验优化
  const optimized = validateAndOptimize(matched.positive);
  
  return {
    originalPrompt: parsed.cleanText,
    enhancedPrompt: optimized,
    negativePrompt: matched.negative,
    matchedModules: matched.matchedModules,
    matchedActions: features.matchedActions.map(a => a.keyword),
    matchedScenes: features.matchedScenes.map(s => `${s.category}：${s.keyword}`),
    hasDialogue: parsed.hasDialogue,
    dialogueContent: parsed.dialogues.join('；'),
    isMultiShot: parsed.isMultiShot,
    hasReference: !!options.hasReference
  };
}

/**
 * 批量增强多个分镜脚本
 */
export function batchEnhancePrompts(
  scripts: { id: string; script: string }[],
  options: EnhanceOptions = {}
): { id: string; result: EnhancedPrompt }[] {
  return scripts.map(item => ({
    id: item.id,
    result: enhancePrompt(item.script, options)
  }));
}

/**
 * 获取增强模块说明（用于UI展示）
 */
export function getModuleDescriptions() {
  return [
    { name: '通用质量增强', desc: '全场景默认植入影视级基础参数与负向约束，拉高生成质量下限', icon: 'Quality' },
    { name: '精细动作拆解', desc: '将笼统动作描述替换为分步连续的专业动作拆解话术，补充物理逻辑约束', icon: 'Action' },
    { name: '人物一致性锁定', desc: '提取人物特征多点重复强化，多镜头切换时维持形象统一', icon: 'Character' },
    { name: '台词匹配校验', desc: '结构化隔离台词内容，自动按字数匹配时长，补充口型同步约束', icon: 'Dialogue' },
    { name: '光影风格对齐', desc: '自动补全场景光影属性描述，保证同场景光线统一', icon: 'Lighting' }
  ];
}

/**
 * 获取模板库统计信息
 */
export function getTemplateStats() {
  return {
    actionTemplates: ACTION_TEMPLATES.length,
    sceneTemplates: SCENE_LIGHTING_TEMPLATES.length,
    characterTemplates: Object.keys(CHARACTER_CONSISTENCY_TEMPLATES).length,
    dialogueTemplates: Object.keys(DIALOGUE_TEMPLATES).length,
    // V2.0 新增
    engine: 'dual-mode (v1-keyword + v2-hermes)',
  };
}

// ==================== V2.0 Hermes Agent 多轮对话增强 ====================

/**
 * V2.0 主入口：使用 Hermes Agent 多轮对话增强 Prompt
 *
 * 与 V1.0 enhancePrompt 的区别：
 * - 异步执行，底层进行5轮自我对话（界面不可见）
 * - 自动注入剧本/角色/场景/前后分镜上下文
 * - 调用Skills知识库（16个专业Skills）
 * - 第4轮质量自检，第5轮自动修正
 * - 输出包含对话日志、自检报告、优化说明
 *
 * @param script 原始分镜脚本
 * @param options 增强选项（含上下文、进度回调等）
 * @returns 增强后的Prompt（含Hermes扩展字段）
 */
export async function enhancePromptWithHermes(
  script: string,
  options: EnhanceOptions = {}
): Promise<EnhancedPrompt> {
  if (!script || !script.trim()) {
    return {
      originalPrompt: '',
      enhancedPrompt: '',
      negativePrompt: QUALITY_TEMPLATES.negativeBase,
      matchedModules: [],
      matchedActions: [],
      matchedScenes: [],
      hasDialogue: false,
      dialogueContent: '',
      isMultiShot: false,
      hasReference: !!options.hasReference,
      engineVersion: 'v2-hermes',
    };
  }

  try {
    // 构建上下文
    const context = contextManager.buildContext({
      ...options.context,
      isMultiShot: options.isMultiShot,
    });

    // 调用Hermes Agent执行多轮对话
    const hermesResult = await hermesEnhancePrompt(script, {
      hasReference: options.hasReference,
      isMultiShot: options.isMultiShot,
      referenceImage: options.referenceImage,
      context,
      maxRounds: options.maxRounds || 5,
      onProgress: options.onProgress,
    });

    // 转换为EnhancedPrompt格式（兼容V1.0接口）
    return {
      originalPrompt: hermesResult.originalPrompt,
      enhancedPrompt: hermesResult.enhancedPrompt,
      negativePrompt: hermesResult.negativePrompt,
      matchedModules: hermesResult.matchedModules,
      matchedActions: hermesResult.matchedActions,
      matchedScenes: hermesResult.matchedScenes,
      hasDialogue: hermesResult.hasDialogue,
      dialogueContent: hermesResult.dialogueContent,
      isMultiShot: hermesResult.isMultiShot,
      hasReference: hermesResult.hasReference,
      // V2.0扩展字段
      engineVersion: 'v2-hermes',
      dialogueLog: hermesResult.dialogueLog,
      matchedSkills: hermesResult.matchedSkills,
      selfCheckReport: hermesResult.selfCheckReport,
      optimizationNotes: hermesResult.optimizationNotes,
      contextSummary: contextManager.generateContextSummary(context),
    };
  } catch (error) {
    console.warn('[PromptEnhancer] Hermes增强失败，降级为V1.0关键词匹配:', error);
    // 降级：使用V1.0关键词匹配
    const fallbackResult = enhancePrompt(script, options);
    fallbackResult.engineVersion = 'v1-keyword';
    return fallbackResult;
  }
}

/**
 * 智能增强入口：自动选择最优引擎
 * - 默认使用Hermes多轮对话（V2.0）
 * - Hermes失败时自动降级为关键词匹配（V1.0）
 * - 当 options.useHermes === false 时直接使用V1.0
 */
export async function enhancePromptSmart(
  script: string,
  options: EnhanceOptions = {}
): Promise<EnhancedPrompt> {
  if (options.useHermes === false) {
    const result = enhancePrompt(script, options);
    result.engineVersion = 'v1-keyword';
    return result;
  }
  return enhancePromptWithHermes(script, options);
}

/**
 * V2.0 批量增强（使用Hermes多轮对话）
 * 支持进度回调，逐个分镜依次处理
 */
export async function batchEnhancePromptsWithHermes(
  scripts: { id: string; script: string }[],
  options: EnhanceOptions = {},
  onItemProgress?: (index: number, total: number, result: EnhancedPrompt) => void
): Promise<{ id: string; result: EnhancedPrompt }[]> {
  const results: { id: string; result: EnhancedPrompt }[] = [];

  for (let i = 0; i < scripts.length; i++) {
    const item = scripts[i];
    const result = await enhancePromptWithHermes(item.script, options);
    results.push({ id: item.id, result });

    if (onItemProgress) {
      onItemProgress(i + 1, scripts.length, result);
    }
  }

  return results;
}

/**
 * 获取Hermes引擎状态信息
 */
export function getHermesEngineInfo() {
  return {
    version: 'v2.0',
    name: 'Hermes Agent 多轮对话引擎',
    maxRounds: 5,
    phases: ['需求解析', '上下文加载', '初稿生成', '质量自检', '修正输出'],
    skillsCount: 16,
    contextInjection: true,
    selfCheck: true,
    autoCorrection: true,
    dialogueVisible: false, // 界面不显示对话内容
  };
}
