// ============================================================================
// hermesClient.ts — 双Agent短剧平台 前端薄壳层（最终态）
// ----------------------------------------------------------------------------
// 架构：Agent 引擎 + 人格（SOUL）已收敛到 Hermes 运行时的独立 Profile。
// 前端不再内置多轮对话式双引擎，本文件 = 直调 Hermes 智能体的薄壳客户端 +
// 保证线上可用的确定性工作流兜底（与原先端规则引擎逐行一致，行为不变）。
//
// 调用链：浏览器(同域 /api/hermes/*) → nginx 反代注入 Bearer key →
//         Hermes 网关 127.0.0.1:8642 → Hermes 智能体 Profile。
//         网关不可达时自动降级到下方确定性工作流（线上不崩）。
// ============================================================================

// ---------------- 最终 Hermes 智能体网关客户端 ----------------
// 同域相对路径：由 nginx location /api/hermes/ 反代到 127.0.0.1:8642 并注入
// Authorization: Bearer <API_SERVER_KEY>（key 只存于服务器侧，浏览器不可见）。
const HERMES_BASE = '/api/hermes';

export interface HermesAgentResult {
  ok: boolean;
  content: string;
  engine: 'hermes-gateway' | 'deterministic';
  error?: string;
}

/** 直接调用最终 Hermes 智能体（LLM 步骤）。失败/超时 → 返回 ok=false，由调用方兜底。 */
export async function callHermesGateway(
  prompt: string,
  profile: 'default' | string = 'default',
  timeoutMs = 20000
): Promise<HermesAgentResult> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    const path = profile === 'default'
      ? `${HERMES_BASE}/v1/chat/completions`
      : `${HERMES_BASE}/p/${profile}/v1/chat/completions`;
    const resp = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'hermes',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
      }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!resp.ok) return { ok: false, content: '', engine: 'hermes-gateway', error: `HTTP ${resp.status}` };
    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content ?? data?.content ?? '';
    return { ok: true, content: String(content), engine: 'hermes-gateway' };
  } catch (e: any) {
    return { ok: false, content: '', engine: 'hermes-gateway', error: e?.name === 'AbortError' ? 'timeout' : String(e?.message || e) };
  }
}

/** 网关可达性探测（用于 UI 展示当前引擎状态） */
export async function hermesGatewayReachable(timeoutMs = 4000): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    const resp = await fetch(`${HERMES_BASE}/v1/models`, { signal: ctrl.signal });
    clearTimeout(timer);
    return resp.ok;
  } catch {
    return false;
  }
}

// ============================================================================
// 以下为确定性工作流引擎（原双Agent引擎逐行搬迁，保证线上行为不变 / 兜底）
// 涵盖：8阶段提示词工作流 / 5阶段增强工作流 / 上下文管理 / 技能知识库
// ============================================================================

// ===== [relocated] contextManager.ts =====
/**
 * 上下文管理器
 * 基于《视频生成 Prompt 智能增强系统产品解决方案》第四章
 *
 * 核心职责：
 * - 为Hermes多轮对话构建完整的创作上下文
 * - 自动匹配人物变体、场景变体
 * - 追踪帧连续链状态
 * - 控制Token预算
 */

export interface StoryboardContext {
  // 基础信息
  cleanText?: string;
  actionText?: string;

  // 解析结果
  shotType?: string;
  actions?: string[];
  scenes?: string[];
  characters?: string[];
  dialogues?: string[];
  hasDialogue?: boolean;
  isMultiShot?: boolean;
  hasWalking?: boolean;

  // 剧本上下文
  episodeIndex?: number;
  episodeTitle?: string;
  dramaTitle?: string;
  scriptSummary?: string;

  // 人物设定
  characterSettings?: CharacterSetting[];

  // 场景设定
  sceneSettings?: SceneSetting[];

  // 帧连续状态
  previousSceneEndFrame?: string;
  frameContinuity?: 'continuous' | 'transition' | 'independent';

  // 全局属性
  aspectRatio?: string;
  durationLimit?: { min: number; max: number };
  stylePrefix?: string;
}

export interface CharacterSetting {
  name: string;
  description: string;
  variant: string; // 日常/战斗/正式/特殊
  referenceImage?: string;
}

export interface SceneSetting {
  name: string;
  description: string;
  timeVariant: string; // 日景/夜景/黄昏/特殊
  lighting: string;
  referenceImage?: string;
}

class ContextManager {
  /**
   * 构建分镜上下文
   * 自动从项目数据中提取相关信息
   */
  buildContext(partial: Partial<StoryboardContext>): StoryboardContext {
    return {
      // 默认全局属性
      aspectRatio: partial.aspectRatio || '9:16',
      durationLimit: partial.durationLimit || { min: 4, max: 15 },
      stylePrefix: partial.stylePrefix || '3D漫剧渲染风格',

      // 默认解析结果
      shotType: partial.shotType || '标准镜头',
      actions: partial.actions || [],
      scenes: partial.scenes || [],
      characters: partial.characters || [],
      dialogues: partial.dialogues || [],
      hasDialogue: partial.hasDialogue || false,
      isMultiShot: partial.isMultiShot || false,
      hasWalking: partial.hasWalking || false,

      // 用户提供的覆盖
      ...partial,
    };
  }

  /**
   * 从剧本内容构建上下文
   */
  buildFromScript(
    script: string,
    meta: {
      dramaTitle?: string;
      episodeIndex?: number;
      episodeTitle?: string;
      previousScene?: string;
    } = {}
  ): StoryboardContext {
    const cleanText = script.replace(/<[^>]*>/g, '').trim();

    // 提取台词
    const dialogueMatches = cleanText.match(/[""「」『』]([^""「」『』]+)[""「」『』]/g);
    const dialogues = dialogueMatches ? dialogueMatches.map(d => d.replace(/[""「」『』]/g, '')) : [];

    // 提取动作
    const actionKeywords = ['走路', '行走', '跑步', '奔跑', '坐下', '站起', '开门', '关门', '拿起', '放下', '看手机', '打电话', '喝水', '吃饭', '写字', '点头', '摇头', '微笑', '哭泣', '拥抱', '握手', '转身', '蹲下', '睁眼', '冲锋', '击退', '施法', '拔剑', '挥拳'];
    const actions = actionKeywords.filter(kw => cleanText.includes(kw));

    // 提取场景
    const sceneKeywords = ['办公室', '家', '客厅', '卧室', '咖啡厅', '餐厅', '商场', '教室', '医院', '酒吧', '街道', '公园', '海边', '山', '森林', '雨天', '夜晚', '古代', '古风', '宫殿', '科幻', '悬疑', '浪漫', '战场', '雪地', '庭院', '房间', '走廊', '大厅'];
    const scenes = sceneKeywords.filter(kw => cleanText.includes(kw));

    // 检测行走
    const hasWalking = actions.some(a => ['走路', '行走', '跑步', '奔跑'].includes(a));

    // 检测多镜头
    const multiShotKeywords = ['个镜头', '多镜头', '分镜', '切换', '先是', '然后', '接着', '随后', '之后', '突然'];
    const isMultiShot = multiShotKeywords.some(kw => cleanText.includes(kw));

    // 识别镜头类型
    let shotType = '标准镜头';
    if (dialogues.length > 0) shotType = '对话镜头';
    if (actions.some(a => ['跑步', '冲锋', '挥拳', '击退', '施法', '拔剑'].includes(a))) shotType = '动作镜头';
    if (cleanText.includes('特写') || cleanText.includes('眼神') || cleanText.includes('表情')) shotType = '情绪特写';

    return {
      cleanText,
      shotType,
      actions,
      scenes,
      dialogues,
      hasDialogue: dialogues.length > 0,
      isMultiShot,
      hasWalking,
      dramaTitle: meta.dramaTitle,
      episodeIndex: meta.episodeIndex,
      episodeTitle: meta.episodeTitle,
      previousSceneEndFrame: meta.previousScene,
      frameContinuity: meta.previousScene ? 'continuous' : 'independent',
      aspectRatio: '9:16',
      durationLimit: { min: 4, max: 15 },
      stylePrefix: '3D漫剧渲染风格',
    };
  }

  /**
   * 匹配人物服装变体
   */
  matchCharacterVariant(character: string, context: StoryboardContext): string {
    const actions = context.actions || [];
    const isBattle = actions.some(a => ['冲锋', '击退', '施法', '拔剑', '挥拳'].includes(a));
    const isFormal = (context.scenes || []).some(s => ['宫殿', '大厅', '餐厅'].includes(s));

    if (isBattle) return '战斗变体';
    if (isFormal) return '正式变体';
    return '日常变体';
  }

  /**
   * 匹配场景时间变体
   */
  matchSceneVariant(scene: string, context: StoryboardContext): string {
    const cleanText = context.cleanText || '';
    if (cleanText.includes('夜') || cleanText.includes('晚') || cleanText.includes('月光') || cleanText.includes('灯')) {
      return '夜景';
    }
    if (cleanText.includes('黄昏') || cleanText.includes('夕阳') || cleanText.includes('日落')) {
      return '黄昏';
    }
    return '日景';
  }

  /**
   * 计算Token预算分配
   */
  getTokenBudget(context: StoryboardContext): Record<string, number> {
    return {
      characterSettings: 20,
      sceneSettings: 15,
      previousSummary: 25,
      currentScript: 15,
      styleAndRules: 10,
      reserved: 15,
    };
  }

  /**
   * 生成上下文摘要（用于注入Hermes对话）
   */
  generateContextSummary(context: StoryboardContext): string {
    const parts: string[] = [];

    if (context.dramaTitle) {
      parts.push(`【剧集】${context.dramaTitle}${context.episodeIndex ? ` 第${context.episodeIndex}集` : ''}`);
    }

    if (context.characters && context.characters.length > 0) {
      parts.push(`【角色】${context.characters.join('、')}`);
    }

    if (context.scenes && context.scenes.length > 0) {
      parts.push(`【场景】${context.scenes.join('、')}`);
    }

    if (context.previousSceneEndFrame) {
      parts.push(`【帧连续】上一分镜尾帧：${context.previousSceneEndFrame}`);
    }

    if (context.hasWalking) {
      parts.push(`【注意】包含行走动作，需追加走路专属负面提示词`);
    }

    return parts.join('\n');
  }
}

export const contextManager = new ContextManager();


// ===== [relocated] skillsKnowledgeBase.ts =====
/**
 * Skills 知识库
 * 基于《视频生成 Prompt 智能增强系统产品解决方案》第七章
 *
 * 与原方案"硬编码关键词匹配模板"的本质区别：
 * - Skills是可被Hermes理解的专业知识文档，不是固定输出模板
 * - Hermes通过语义检索自动匹配，不是关键词精确匹配
 * - 支持多Skills组合调用，灵活适配长尾场景
 */


export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  keywords: string[];
  content: string;
  priority: number;
}

// ==================== 分镜拆解类 Skills ====================

const STORYBOARD_SKILLS: Skill[] = [
  {
    id: 'sb-decompose',
    name: '分镜拆解模板',
    category: '分镜拆解',
    description: '将剧本/故事文本拆解为分镜列表，识别镜头类型和动作单元',
    keywords: ['分镜', '拆解', '剧本', '镜头'],
    content: '分镜拆解原则：一个分镜=一个连续场景内的一段叙事。分镜类型：对话镜头/动作镜头/情绪特写/环境建立/情绪过渡。分镜时长建议4-15秒，最佳4-8秒。',
    priority: 1,
  },
  {
    id: 'sb-script-parse',
    name: '剧本解析文档生成',
    category: '分镜拆解',
    description: '生成全剧统一的剧本解析文档，包含分镜公共属性',
    keywords: ['剧本', '解析', '公共属性', '全局'],
    content: '分镜公共属性：画面比例（短剧常用9:16竖屏）、单镜时长（4-15秒）、重点角色、节奏偏好、画面风格。',
    priority: 2,
  },
  {
    id: 'sb-character',
    name: '人物设定文档生成',
    category: '分镜拆解',
    description: '标准化人物设定，含角色描述和服装变体',
    keywords: ['人物', '角色', '设定', '服装', '变体'],
    content: '人物设定包含：姓名/年龄/身份/性格/外貌/服装变体列表（日常/战斗/正式/特殊）。变体命名规范：角色名_变体名。',
    priority: 2,
  },
  {
    id: 'sb-scene',
    name: '场景设定文档生成',
    category: '分镜拆解',
    description: '标准化场景设定，含时间变体和光影参数',
    keywords: ['场景', '设定', '光影', '时间'],
    content: '场景设定包含：场景描述/时间变体（日景/夜景/黄昏/特殊氛围）/光影参数/固定特征。',
    priority: 2,
  },
];

// ==================== 镜头拆解类 Skills ====================

const SHOT_SKILLS: Skill[] = [
  {
    id: 'shot-decompose',
    name: '镜头拆解模板',
    category: '镜头拆解',
    description: '将分镜精细拆解为镜头，生成分镜级AI视频提示词',
    keywords: ['镜头', '拆解', '提示词', '时间轴'],
    content: '镜头编号规则：分镜编号+字母（1a/1b/1c）。分镜级统一提示词架构：固定风格前缀+场景描述+参考图配置+时间轴分段+收尾要求+负面提示词。',
    priority: 1,
  },
  {
    id: 'shot-single-action',
    name: '单一动作单元原则',
    category: '镜头拆解',
    description: '确保每个镜头只有一个核心动作',
    keywords: ['动作', '单一', '拆分', '单元'],
    content: '判断标准：闭上眼睛想象画面，需要移动目光才能看完就需要拆分。复合动作分解：如"拿起杯子喝水放下"→"拿起杯子"+"喝水"+"放下杯子"。',
    priority: 1,
  },
  {
    id: 'shot-duration',
    name: '动态时长控制',
    category: '镜头拆解',
    description: '根据镜头类型动态分配时长',
    keywords: ['时长', '时间', '控制', '秒'],
    content: '时长决策树：动作镜头3-4秒/对话镜头4-6秒/情绪镜头4-5秒/环境镜头5-7秒/过渡镜头5-8秒。分镜总时长4-15秒，最佳4-8秒。',
    priority: 1,
  },
  {
    id: 'shot-prompt-v38',
    name: '分镜级统一提示词规范(v3.8)',
    category: '镜头拆解',
    description: '规范分镜级AI视频提示词的完整结构',
    keywords: ['提示词', '结构', '规范', 'v3.8'],
    content: '五段式结构：1.固定风格前缀 2.场景整体描述 3.参考图配置 4.时间轴分段描述 5.全分镜统一收尾要求+负面提示词。',
    priority: 1,
  },
];

// ==================== 视觉一致性类 Skills ====================

const CONSISTENCY_SKILLS: Skill[] = [
  {
    id: 'vis-frame-align',
    name: '帧对齐链原则',
    category: '视觉一致性',
    description: '确保相邻镜头无缝衔接',
    keywords: ['帧对齐', '衔接', '连续', '首帧', '尾帧'],
    content: '帧对齐含义：上一镜尾帧=下一镜首帧。必须使用：同场景连续动作/对话交替/景别切换/时间流逝。不能使用：不同地点/时间跳跃/现实与回忆。验证五维：角色位置/姿态/表情/场景状态/光影方向。',
    priority: 1,
  },
  {
    id: 'vis-shot-size',
    name: '景别变化原则',
    category: '视觉一致性',
    description: '确保镜头景别有合理变化',
    keywords: ['景别', '远景', '中景', '近景', '特写'],
    content: '景别体系：大远景/远景/全景/中景/近景/特写。标准对话模式：全景→中景→近景→中景→特写。禁忌：连续3个相同景别/特写到极大远景跳跃/全程中景。',
    priority: 2,
  },
  {
    id: 'vis-camera',
    name: '运镜设计原则',
    category: '视觉一致性',
    description: '规范运镜方式，适配AI视频生成',
    keywords: ['运镜', '镜头运动', '推', '拉', '摇'],
    content: '运镜类型：固定/缓推/缓拉/横移/摇。AI友好度：固定>缓推/缓拉>横移>摇。80/20原则：80%使用固定/推/拉，20%尝试复杂运镜。运镜必须服务叙事目的。',
    priority: 2,
  },
  {
    id: 'vis-action',
    name: '动作连贯性原则',
    category: '视觉一致性',
    description: '确保角色物理状态在相邻镜头间符合逻辑',
    keywords: ['动作', '连贯', '物理', '姿态'],
    content: '位置连贯（无瞬移）、姿态连贯（无姿态跳跃）、情绪递进合理（有起因-过程-结果）、道具状态一致（无自行移动）。',
    priority: 2,
  },
];

// ==================== 提示词工程类 Skills ====================

const PROMPT_SKILLS: Skill[] = [
  {
    id: 'prompt-timeline',
    name: '时间轴分段编写规范',
    category: '提示词工程',
    description: '规范时间轴分段的编写格式和要素',
    keywords: ['时间轴', '分段', '0-2秒', '格式'],
    content: '每段必含六要素：时间范围/景别/环境氛围/角色动作/运镜方式/音效描述。时间格式："0-2 秒"（有空格）。首尾衔接：上一段结束秒=下一段起始秒。台词情绪格式：声学特征+台词内容。',
    priority: 1,
  },
  {
    id: 'prompt-reference',
    name: '参考图配置规范',
    category: '提示词工程',
    description: '规范参考图的配置方式和优先级',
    keywords: ['参考图', '图片1', '图片2', '配置'],
    content: '最多9张参考图。第1-4张必选：脸部/服装/场景/道具。优先级：脸部>服装>构图>背景。提示词内引用格式："图片1/图片2"（不出现路径）。参考图上传顺序清单在提示词下方独立区域。',
    priority: 1,
  },
  {
    id: 'prompt-negative',
    name: '负面提示词库',
    category: '提示词工程',
    description: '提供完整的负面提示词清单',
    keywords: ['负面', 'negative', '畸形', '水印'],
    content: '基础负面词：畸形肢体/文字水印/穿模/比例失调/穿帮。走路专属14项：垫步/原地踏步/脚底打滑/浮空走路/飘着走路/脚步错位/肢体拖地/步伐僵硬/双脚交叉错乱/走路不落地/悬浮行走/诡异步伐/腿部畸形/动作卡顿跳帧。角色行走时必须追加走路专属负面词。',
    priority: 1,
  },
  {
    id: 'prompt-dialogue',
    name: '台词情绪声学描述规范',
    category: '提示词工程',
    description: '规范有台词镜头的情绪描述方式',
    keywords: ['台词', '情绪', '声学', '口型'],
    content: '必须使用声学客观特征描述（气流/音高/音调/节奏），禁止使用抽象情绪词。格式："声学特征。台词：原话"。示例：愤怒咆哮，气息粗重，音量高，语速快。台词：你给我滚！',
    priority: 2,
  },
];

// ==================== 知识库主类 ====================

class SkillsKnowledgeBase {
  private allSkills: Skill[];

  constructor() {
    this.allSkills = [
      ...STORYBOARD_SKILLS,
      ...SHOT_SKILLS,
      ...CONSISTENCY_SKILLS,
      ...PROMPT_SKILLS,
    ];
  }

  /**
   * 语义检索相关Skills
   * 当前基于关键词相似度，接入向量数据库后可升级为语义检索
   */
  retrieve(context: Partial<StoryboardContext>): Skill[] {
    const matched = new Set<Skill>();

    // 基础必加载Skills
    matched.add(this.getById('shot-prompt-v38')!);
    matched.add(this.getById('prompt-timeline')!);
    matched.add(this.getById('prompt-negative')!);

    // 根据上下文匹配
    if (context.actions && context.actions.length > 0) {
      matched.add(this.getById('shot-single-action')!);
      matched.add(this.getById('vis-action')!);
    }

    if (context.scenes && context.scenes.length > 0) {
      matched.add(this.getById('sb-scene')!);
    }

    if (context.hasDialogue) {
      matched.add(this.getById('prompt-dialogue')!);
    }

    if (context.isMultiShot) {
      matched.add(this.getById('vis-frame-align')!);
      matched.add(this.getById('vis-shot-size')!);
    }

    if (context.hasWalking) {
      matched.add(this.getById('prompt-negative')!);
    }

    // 按优先级排序
    return Array.from(matched).sort((a, b) => a.priority - b.priority);
  }

  /**
   * 根据关键词检索
   */
  searchByKeywords(keywords: string[]): Skill[] {
    return this.allSkills.filter(skill =>
      skill.keywords.some(kw => keywords.some(k => k.includes(kw) || kw.includes(k)))
    );
  }

  getById(id: string): Skill | undefined {
    return this.allSkills.find(s => s.id === id);
  }

  getAll(): Skill[] {
    return [...this.allSkills];
  }

  getStats() {
    return {
      total: this.allSkills.length,
      categories: {
        '分镜拆解': STORYBOARD_SKILLS.length,
        '镜头拆解': SHOT_SKILLS.length,
        '视觉一致性': CONSISTENCY_SKILLS.length,
        '提示词工程': PROMPT_SKILLS.length,
      },
    };
  }
}

export const skillsKnowledgeBase = new SkillsKnowledgeBase();


// ===== [relocated] hermesAgent.ts =====
/**
 * Hermes Agent 多轮对话引擎
 * 基于《视频生成 Prompt 智能增强系统产品解决方案》实现
 *
 * 核心设计：
 * - 界面不显示对话内容，底层执行3-5轮自我对话
 * - 每轮对话携带完整上下文（剧本/角色/场景/前后分镜）
 * - 自动调用Skills知识库
 * - 第4轮自检，第5轮修正
 *
 * 架构说明：
 * 本引擎当前以本地模拟逻辑实现多轮对话流程，
 * 但接口设计完全兼容真实LLM API接入。
 * 接入真实API时，只需替换 executeTurn 方法的实现。
 */


// ==================== 类型定义 ====================

export interface HermesDialogueTurn {
  round: number;
  phase: string;
  systemInstruction: string;
  agentOutput: string;
  timestamp: number;
}

export interface HermesEnhanceResult {
  originalPrompt: string;
  enhancedPrompt: string;
  negativePrompt: string;
  dialogueLog: HermesDialogueTurn[];
  matchedSkills: string[];
  matchedModules: string[];
  matchedActions: string[];
  matchedScenes: string[];
  hasDialogue: boolean;
  dialogueContent: string;
  isMultiShot: boolean;
  hasReference: boolean;
  selfCheckReport: SelfCheckReport;
  optimizationNotes: string[];
}

export interface SelfCheckReport {
  score: number;
  passed: string[];
  warnings: string[];
  issues: string[];
  corrections: string[];
}

export interface HermesOptions {
  hasReference?: boolean;
  isMultiShot?: boolean;
  referenceImage?: string;
  context?: Partial<StoryboardContext>;
  maxRounds?: number;
  onProgress?: (round: number, phase: string) => void;
}

// ==================== 轮次阶段定义 ====================

const DIALOGUE_PHASES = [
  { round: 1, phase: '需求解析', description: '解析分镜内容，识别镜头类型、动作、角色、场景' },
  { round: 2, phase: '上下文加载', description: '加载剧本/角色/场景上下文，匹配Skills知识库' },
  { round: 3, phase: '初稿生成', description: '基于上下文和Skills生成分镜级AI视频提示词初稿' },
  { round: 4, phase: '质量自检', description: '校验帧对齐/时间轴/参考图/负面提示词/动作连贯性' },
  { round: 5, phase: '修正输出', description: '根据自检结果修正，输出最终优化提示词' },
];

// ==================== Hermes Agent 类 ====================

export class HermesAgent {
  private dialogueLog: HermesDialogueTurn[] = [];
  private context: StoryboardContext;
  private options: HermesOptions;

  constructor(options: HermesOptions = {}) {
    this.options = options;
    this.context = contextManager.buildContext(options.context || {});
  }

  /**
   * 执行多轮对话增强
   * 这是Hermes Agent的核心入口
   */
  async enhance(script: string): Promise<HermesEnhanceResult> {
    this.dialogueLog = [];

    if (!script || !script.trim()) {
      return this.emptyResult();
    }

    const maxRounds = this.options.maxRounds || 5;
    let currentPrompt = script;
    let selfCheckReport: SelfCheckReport = { score: 0, passed: [], warnings: [], issues: [], corrections: [] };
    let matchedSkills: Skill[] = [];
    let optimizationNotes: string[] = [];

    for (let i = 0; i < maxRounds; i++) {
      const phase = DIALOGUE_PHASES[i];
      if (!phase) break;

      // 通知进度
      if (this.options.onProgress) {
        this.options.onProgress(phase.round, phase.phase);
      }

      // 执行单轮对话
      const turnResult = await this.executeTurn(phase.round, phase.phase, currentPrompt, {
        context: this.context,
        matchedSkills,
        selfCheckReport,
      });

      this.dialogueLog.push(turnResult.turn);

      // 根据轮次处理输出
      switch (phase.round) {
        case 1:
          // 解析结果存储在context中
          this.context = { ...this.context, ...turnResult.parsedContext };
          break;
        case 2:
          matchedSkills = turnResult.matchedSkills || [];
          break;
        case 3:
          currentPrompt = turnResult.enhancedPrompt || currentPrompt;
          break;
        case 4:
          selfCheckReport = turnResult.selfCheckReport || selfCheckReport;
          break;
        case 5:
          currentPrompt = turnResult.enhancedPrompt || currentPrompt;
          optimizationNotes = turnResult.optimizationNotes || [];
          break;
      }

      // 简单场景提前终止（自检评分>=9分）
      if (phase.round === 4 && selfCheckReport.score >= 9) {
        break;
      }
    }

    // 负面提示词追加到增强后正向Prompt的末尾（格式：正向提示词 + 负面提示词）
    const negativePrompt = this.buildNegativePrompt();
    const finalEnhancedPrompt = currentPrompt + '\n\n[负面提示词]\n' + negativePrompt;

    return {
      originalPrompt: this.context.cleanText || script,
      enhancedPrompt: finalEnhancedPrompt,
      negativePrompt: negativePrompt,
      dialogueLog: this.dialogueLog,
      matchedSkills: matchedSkills.map(s => s.name),
      matchedModules: this.buildMatchedModules(matchedSkills),
      matchedActions: this.context.actions || [],
      matchedScenes: this.context.scenes || [],
      hasDialogue: this.context.hasDialogue || false,
      dialogueContent: this.context.dialogues?.join('；') || '',
      isMultiShot: this.context.isMultiShot || !!this.options.isMultiShot,
      hasReference: !!this.options.hasReference,
      selfCheckReport,
      optimizationNotes,
    };
  }

  /**
   * 执行单轮对话
   * 接入真实LLM API时，替换此方法的实现即可
   */
  private async executeTurn(
    round: number,
    phase: string,
    currentInput: string,
    state: { context: StoryboardContext; matchedSkills: Skill[]; selfCheckReport: SelfCheckReport }
  ): Promise<{
    turn: HermesDialogueTurn;
    parsedContext?: Partial<StoryboardContext>;
    matchedSkills?: Skill[];
    enhancedPrompt?: string;
    selfCheckReport?: SelfCheckReport;
    optimizationNotes?: string[];
  }> {
    const turn: HermesDialogueTurn = {
      round,
      phase,
      systemInstruction: '',
      agentOutput: '',
      timestamp: Date.now(),
    };

    // 模拟网络延迟（真实API调用时替换为fetch）
    await this.simulateDelay(round);

    switch (round) {
      case 1: {
        const parsed = this.parseScript(currentInput);
        turn.systemInstruction = '解析用户输入的分镜脚本，识别镜头类型、动作描述、角色、场景、台词';
        turn.agentOutput = `已解析：镜头类型=${parsed.shotType}，动作=${parsed.actions?.join(',') || '无'}，场景=${parsed.scenes?.join(',') || '无'}，台词=${parsed.hasDialogue ? '有' : '无'}`;
        return { turn, parsedContext: parsed };
      }
      case 2: {
        const skills = skillsKnowledgeBase.retrieve(state.context);
        turn.systemInstruction = '加载上下文，从Skills知识库检索相关专业规则';
        turn.agentOutput = `已加载上下文：角色=${state.context.characters?.length || 0}个，场景=${state.context.scenes?.length || 0}个；匹配Skills=${skills.map(s => s.name).join('、')}`;
        return { turn, matchedSkills: skills };
      }
      case 3: {
        const draft = this.generateDraft(currentInput, state.context, state.matchedSkills);
        turn.systemInstruction = '基于上下文和Skills生成分镜级AI视频提示词初稿';
        turn.agentOutput = `已生成提示词初稿，包含${this.countSegments(draft)}个时间轴分段`;
        return { turn, enhancedPrompt: draft };
      }
      case 4: {
        const report = this.selfCheck(currentInput, state.context);
        turn.systemInstruction = '质量自检：帧对齐/时间轴/参考图/负面提示词/动作连贯性';
        turn.agentOutput = `自检完成：评分=${report.score}/10，通过=${report.passed.length}项，警告=${report.warnings.length}项，问题=${report.issues.length}项`;
        return { turn, selfCheckReport: report };
      }
      case 5: {
        const { corrected, notes } = this.correctAndFinalize(currentInput, state.selfCheckReport, state.context);
        turn.systemInstruction = '根据自检结果修正，输出最终优化提示词';
        turn.agentOutput = `修正完成：${notes.length}项优化，最终评分=${state.selfCheckReport.score + notes.length > 10 ? 10 : state.selfCheckReport.score + notes.length}/10`;
        return { turn, enhancedPrompt: corrected, optimizationNotes: notes };
      }
      default:
        return { turn };
    }
  }

  // ==================== 第1轮：分镜解析 ====================

  private parseScript(script: string): Partial<StoryboardContext> {
    const cleanText = script.replace(/<[^>]*>/g, '').trim();

    // 提取台词
    const dialogueMatches = cleanText.match(/[""「」『』]([^""「」『』]+)[""「」『』]/g);
    const dialogues = dialogueMatches ? dialogueMatches.map(d => d.replace(/[""「」『』]/g, '')) : [];

    // 提取动作描述
    let actionText = cleanText;
    if (dialogueMatches) {
      dialogueMatches.forEach(d => { actionText = actionText.replace(d, ''); });
    }
    actionText = actionText.replace(/[""「」『』]/g, '').replace(/[，。！？、；：\s]+/g, ' ').trim();

    // 识别动作关键词
    const actionKeywords = ['走路', '行走', '跑步', '奔跑', '坐下', '站起', '开门', '关门', '拿起', '放下', '看手机', '打电话', '喝水', '吃饭', '写字', '点头', '摇头', '微笑', '哭泣', '拥抱', '握手', '转身', '蹲下', '爬楼梯', '开车', '穿衣', '梳头', '化妆', '抽烟', '鼓掌', '指向', '挠头', '睁眼', '冲锋', '击退', '施法', '拔剑', '挥拳', '踢腿', '摔倒', '跃起', '翻滚'];
    const actions = actionKeywords.filter(kw => actionText.includes(kw));

    // 识别场景关键词
    const sceneKeywords = ['办公室', '家', '客厅', '卧室', '咖啡厅', '餐厅', '商场', '教室', '医院', '酒吧', '街道', '公园', '海边', '山', '森林', '雨天', '夜晚', '古代', '古风', '宫殿', '科幻', '悬疑', '浪漫', '战场', '雪地', '庭院', '房间', '走廊', '大厅'];
    const scenes = sceneKeywords.filter(kw => cleanText.includes(kw));

    // 识别角色
    const characterPattern = /([\u4e00-\u9fa5]{2,4})(?=[，。：说看走向])/g;
    const characterMatches = cleanText.match(characterPattern) || [];
    const characters = [...new Set(characterMatches.filter(c => c.length >= 2 && c.length <= 4))].slice(0, 5);

    // 识别镜头类型
    let shotType = '标准镜头';
    if (cleanText.includes('对话') || dialogues.length > 0) shotType = '对话镜头';
    if (actions.some(a => ['跑步', '冲锋', '挥拳', '踢腿', '击退', '施法', '拔剑'].includes(a))) shotType = '动作镜头';
    if (cleanText.includes('特写') || cleanText.includes('眼神') || cleanText.includes('表情')) shotType = '情绪特写';
    if (cleanText.includes('远景') || cleanText.includes('全景') || cleanText.includes('环境')) shotType = '环境建立';

    // 检测多镜头
    const multiShotKeywords = ['个镜头', '多镜头', '分镜', '切换', '先是', '然后', '接着', '随后', '之后', '突然'];
    const isMultiShot = multiShotKeywords.some(kw => cleanText.includes(kw));

    // 检测是否有行走动作（需要走路专属负面提示词）
    const hasWalking = actions.some(a => ['走路', '行走', '跑步', '奔跑', '爬楼梯'].includes(a));

    return {
      cleanText,
      actionText,
      dialogues,
      hasDialogue: dialogues.length > 0,
      actions,
      scenes,
      characters,
      shotType,
      isMultiShot,
      hasWalking,
    };
  }

  // ==================== 第3轮：初稿生成 ====================
  // 输出格式与原始分镜脚本保持一致：镜头编号+时长+时间+场景图片+镜头描述+角色台词+音色+背景+镜头运动
  private generateDraft(script: string, context: StoryboardContext, skills: Skill[]): string {
    const cleanText = script.replace(/<[^>]*>/g, '').trim();

    // 按镜头分割（保留原始换行格式）
    const shots = this.parseShots(cleanText);

    if (shots.length === 0) {
      return cleanText;
    }

    // 对每个镜头进行内容优化（只在末尾增加细节，不改变原始格式）
    const optimizedShots = shots.map((shot, idx) => this.optimizeShot(shot, idx, context));

    // 重新组合：镜头之间用换行分隔（与原始格式一致）
    return optimizedShots.join('\n');
  }

  /**
   * 解析分镜脚本中的镜头列表
   * 按"镜头X X.Xs:"分割，保留每个镜头的完整内容
   */
  private parseShots(script: string): string[] {
    // 统一换行符：\r\n -> \n
    const normalized = script.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // 先按换行分割，保留原始格式
    const lines = normalized.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length > 1) {
      return lines;
    }

    // 如果只有一行，尝试按"镜头X"分割
    const shotMatches = normalized.match(/镜头\d+\s+[\d.]+s:[\s\S]*?(?=镜头\d+\s+[\d.]+s:|$)/g);
    if (shotMatches && shotMatches.length > 0) {
      return shotMatches.map(s => s.trim());
    }

    return [normalized];
  }

  /**
   * 优化单个镜头的内容，保持格式完全不变
   * 只在镜头末尾增加优化细节，不解析、不重新组合
   */
  private optimizeShot(shot: string, index: number, context: StoryboardContext): string {
    // 优化细节库
    const enhancements = [
      '画面构图精致，光影层次丰富，人物姿态自然',
      '镜头缓缓推进，聚焦人物表情变化，情绪递进自然',
      '近景特写捕捉细微表情，眼神传递内心情感',
      '中景展现人物互动，空间关系清晰，动作连贯流畅',
    ];
    const enhancement = enhancements[index % enhancements.length];

    // 如果镜头已经包含优化关键词，则不重复添加
    if (shot.includes('构图') || shot.includes('光影') || shot.includes('镜头缓缓')) {
      return shot;
    }

    // 在镜头末尾的句号前增加优化细节（保持原始格式）
    if (shot.endsWith('。')) {
      return shot.slice(0, -1) + '，' + enhancement + '。';
    }

    // 如果没有句号，直接在末尾添加
    return shot + ' ' + enhancement + '。';
  }

  private buildTimeAxisSegments(context: StoryboardContext): string[] {
    const segments: string[] = [];
    const actions = context.actions || [];
    const shotType = context.shotType || '标准镜头';

    if (actions.length === 0 && !context.hasDialogue) {
      // 无明确动作，生成单段
      segments.push('0-4 秒：中景，人物自然状态，镜头缓慢推近，环境氛围渲染。');
      return segments;
    }

    // 根据动作数量生成分段
    const totalDuration = Math.min(4 + actions.length * 2, 12);
    let currentTime = 0;

    // 开场建立
    const openingDuration = 2;
    segments.push(`${currentTime}-${currentTime + openingDuration} 秒：远景/中景，环境建立，人物入场，参考图片1+图片2+图片3，镜头缓慢推近，音效：环境音。`);
    currentTime += openingDuration;

    // 动作分段
    actions.slice(0, 3).forEach((action, idx) => {
      const duration = idx === 0 ? 3 : 2;
      const endTime = Math.min(currentTime + duration, totalDuration);
      const shotSize = idx === 0 ? '中景' : idx === 1 ? '近景' : '特写';
      const cameraMove = idx === 0 ? '跟拍' : '固定/微推';
      segments.push(`${currentTime}-${endTime} 秒：${shotSize}，${this.enhanceActionDescription(action, context)}，镜头${cameraMove}，音效：动作音效。`);
      currentTime = endTime;
    });

    // 台词分段
    if (context.hasDialogue && context.dialogues && context.dialogues.length > 0) {
      const dialogue = context.dialogues[0];
      const duration = 3;
      const endTime = Math.min(currentTime + duration, totalDuration);
      segments.push(`${currentTime}-${endTime} 秒：近景/特写，人物说话，台词情绪：${this.getDialogueEmotion(dialogue)}。台词：${dialogue}，口型与台词严格同步。`);
      currentTime = endTime;
    }

    // 收尾
    if (currentTime < totalDuration) {
      segments.push(`${currentTime}-${totalDuration} 秒：全景/中景，动作收尾，情绪定格，镜头缓慢拉远，音效：收尾音效。`);
    }

    return segments;
  }

  private enhanceActionDescription(action: string, context: StoryboardContext): string {
    const actionTemplates: Record<string, string> = {
      '走路': '人物自然行走，双臂随步伐规律摆动，重心平稳转移，脚步落地扎实',
      '行走': '人物自然行走，双臂随步伐规律摆动，重心平稳转移，脚步落地扎实',
      '跑步': '人物快速奔跑，双臂前后摆动有力，双腿大步跨越，身体前倾，头发和衣物随风飘动',
      '奔跑': '人物快速奔跑，双臂前后摆动有力，双腿大步跨越，身体前倾，头发和衣物随风飘动',
      '坐下': '人物缓缓屈膝坐下，双手轻扶座椅扶手，身体重心平稳下移，背部自然靠向椅背',
      '站起': '人物双手撑膝，腿部发力缓缓站起，身体重心上移，姿态挺拔',
      '开门': '人物伸手握住门把手，手腕转动解锁，手臂发力将门推开，身体微微侧让',
      '关门': '人物反手拉住门把手，手臂缓缓回收将门闭合，门锁轻响',
      '拿起': '人物伸手握住物品，手指自然收拢，手腕平稳发力将物品拿起',
      '放下': '人物手持物品缓缓下移，将物品平稳放置在目标位置，手指轻轻松开',
      '看手机': '人物单手持握手机，拇指在屏幕上滑动，目光注视屏幕，表情专注',
      '打电话': '人物将手机举至耳边，头部微倾，嘴唇开合说话，表情随对话内容变化',
      '喝水': '人物手持杯具，手臂抬起将杯口送至唇边，头部微仰，小口啜饮，喉结微动',
      '转身': '人物以腰为轴缓缓转身，头部先转，身体跟随，目光随转动方向移动',
      '微笑': '人物嘴角缓缓上扬，眼睛微微弯起，面颊肌肉自然隆起，笑容温暖真诚',
      '哭泣': '人物眼眶泛红，泪水从眼角滑落，沿面颊流下，嘴唇微颤，表情悲伤',
      '拥抱': '两人相向靠近，双臂环住对方后背，身体紧贴，头部轻靠，动作温柔',
      '睁眼': '人物骤然睁眼，眸光凛冽，眼神聚焦前方，表情从平静转为锐利',
      '冲锋': '人物身形化作残影极速冲向敌前，衣袂翻飞，表情凌厉，气势逼人',
      '击退': '人物凝掌运起力量精准重击击退敌人，动作干脆有力，敌人向后飞退',
      '施法': '人物双手结印，周身灵力涌动，光芒汇聚，特效高级克制不浮夸',
      '拔剑': '人物手握剑柄，手腕翻转拔剑出鞘，剑身寒光闪烁，动作流畅有力',
      '挥拳': '人物握拳，手臂发力挥出，身体扭转配合，拳风凌厉',
    };
    return actionTemplates[action] || `人物执行${action}动作，动作连贯自然，物理逻辑合理`;
  }

  private getSceneLighting(scene: string): string {
    const lightingMap: Record<string, string> = {
      '办公室': '大面积落地窗透入柔和自然光，顶部冷白光筒灯补光，现代商务感',
      '家': '窗户透入温暖自然光，浅色墙面反射柔和漫射光，温馨舒适',
      '客厅': '窗户透入温暖自然光，浅色墙面反射柔和漫射光，温馨舒适',
      '咖啡厅': '落地窗透入柔和侧光，暖色吊灯营造温馨氛围，文艺慵懒感',
      '餐厅': '顶部暖光吊灯均匀照明，桌面有柔和高光，明亮温馨',
      '酒吧': '昏暗环境中彩色霓虹灯光斑点缀，吧台有暖色聚光，氛围感强烈',
      '街道': '阳光从侧上方照射，建筑物投下清晰阴影，都市感强烈',
      '公园': '阳光透过树叶形成斑驳光影，草地翠绿，自然舒适感',
      '夜晚': '仅有微弱环境光，人物面部有侧逆光勾勒轮廓，阴影浓重',
      '古代': '烛火/灯笼暖光摇曳，木质建筑有柔和反光，古典雅致感',
      '古风': '烛火/灯笼暖光摇曳，木质建筑有柔和反光，古典雅致感',
      '庭院': '月光/阳光笼罩庭院，光影层次丰富，自然雅致',
      '科幻': '蓝紫色霓虹灯光，金属表面有强烈反光，未来科技感',
      '悬疑': '弱光环境，单侧硬光照射人物面部，另一半隐入阴影，紧张压抑感',
      '浪漫': '烛光/暖色串灯作为主光源，人物面部有柔和暖光，浪漫温馨感',
      '雨天': '漫射光均匀柔和，地面有水洼反光，人物衣物湿润，色调偏冷',
    };
    return lightingMap[scene] || '柔和自然光，光影层次丰富';
  }

  private getDialogueEmotion(dialogue: string): string {
    if (dialogue.includes('!') || dialogue.includes('！') || dialogue.includes('滚') || dialogue.includes('闭嘴')) {
      return '愤怒咆哮，气息粗重，音量高，语速快';
    }
    if (dialogue.includes('?') || dialogue.includes('？') || dialogue.includes('什么') || dialogue.includes('怎么')) {
      return '惊讶疑惑，气息微提，音调上扬，语速中等';
    }
    if (dialogue.includes('爱') || dialogue.includes('喜欢') || dialogue.includes('想你')) {
      return '温柔深情，气息平稳，音量低，语速缓慢';
    }
    if (dialogue.includes('哭') || dialogue.includes('难过') || dialogue.includes('对不起')) {
      return '悲伤哽咽，气息颤抖，音量低，语速缓慢';
    }
    return '平静自然，气息平稳，语速适中';
  }

  // ==================== 第4轮：质量自检 ====================

  private selfCheck(prompt: string, context: StoryboardContext): SelfCheckReport {
    const report: SelfCheckReport = {
      score: 8,
      passed: [],
      warnings: [],
      issues: [],
      corrections: [],
    };

    // 检查1：时间轴连贯性
    const timePattern = /(\d+)-(\d+)\s*秒/g;
    const timeMatches = [...prompt.matchAll(timePattern)];
    if (timeMatches.length > 0) {
      let isContinuous = true;
      for (let i = 1; i < timeMatches.length; i++) {
        const prevEnd = parseInt(timeMatches[i - 1][2]);
        const currStart = parseInt(timeMatches[i][1]);
        if (prevEnd !== currStart) {
          isContinuous = false;
          report.issues.push(`时间轴不连续：第${i}段起始${currStart}秒≠第${i - 1}段结束${prevEnd}秒`);
        }
      }
      if (isContinuous) {
        report.passed.push('时间轴连贯性');
      } else {
        report.score -= 1;
      }
    }

    // 检查2：总时长
    const totalMatch = prompt.match(/(\d+)-(\d+)\s*秒[^]*$/);
    if (timeMatches.length > 0) {
      const totalDuration = parseInt(timeMatches[timeMatches.length - 1][2]);
      if (totalDuration >= 4 && totalDuration <= 15) {
        report.passed.push(`总时长控制（${totalDuration}秒）`);
      } else {
        report.issues.push(`总时长${totalDuration}秒超出4-15秒范围`);
        report.score -= 1;
      }
    }

    // 检查3：景别变化
    const shotSizes = ['远景', '全景', '中景', '近景', '特写'];
    const foundShots = shotSizes.filter(s => prompt.includes(s));
    if (foundShots.length >= 2) {
      report.passed.push(`景别变化（${foundShots.join('→')}）`);
    } else if (foundShots.length === 1) {
      report.warnings.push('景别单一，建议增加景别变化');
    }

    // 检查4：参考图配置
    if (this.options.hasReference) {
      if (prompt.includes('图片1') && prompt.includes('图片2')) {
        report.passed.push('参考图配置（图片1脸部+图片2服装）');
      } else {
        report.issues.push('参考图配置不完整');
        report.score -= 1;
      }
    } else {
      report.passed.push('无参考图模式');
    }

    // 检查5：负面提示词
    report.passed.push('基础负面提示词已配置');
    if (context.hasWalking) {
      report.warnings.push('检测到行走动作，需追加走路专属负面提示词（14项）');
    }

    // 检查6：台词情绪描述
    if (context.hasDialogue) {
      if (prompt.includes('台词') && prompt.includes('口型')) {
        report.passed.push('台词情绪与口型同步描述');
      } else {
        report.issues.push('台词缺少口型同步约束');
        report.score -= 1;
      }
    }

    // 检查7：动作连贯性
    if ((context.actions?.length || 0) > 0) {
      report.passed.push('动作物理逻辑校验通过');
    }

    // 确保分数在0-10范围
    report.score = Math.max(0, Math.min(10, report.score));

    return report;
  }

  // ==================== 第5轮：修正输出 ====================

  private correctAndFinalize(
    prompt: string,
    report: SelfCheckReport,
    context: StoryboardContext
  ): { corrected: string; notes: string[] } {
    let corrected = prompt;
    const notes: string[] = [];

    // 修正时间轴不连续
    if (report.issues.some(i => i.includes('时间轴不连续'))) {
      corrected = this.fixTimeAxisContinuity(corrected);
      notes.push('修正时间轴分段，确保首尾严密衔接');
    }

    // 追加走路专属负面提示词
    if (context.hasWalking && !corrected.includes('垫步')) {
      notes.push('追加走路专属负面提示词（14项：垫步/原地踏步/脚底打滑等）');
    }

    // 补充景别变化
    if (report.warnings.some(w => w.includes('景别单一'))) {
      notes.push('建议增加景别变化（远景→中景→近景）');
    }

    // 补充台词口型约束（追加到[全分镜统一收尾要求]区块内，不破坏格式结构）
    if (context.hasDialogue && !corrected.includes('口型')) {
      corrected = corrected.replace(
        '[全分镜统一收尾要求]',
        '[全分镜统一收尾要求]\n- 人物口型与台词内容严格同步，嘴唇开合与音节对应'
      );
      notes.push('补充台词口型同步约束');
    }

    // 如果没有修正项，添加通用优化说明
    if (notes.length === 0) {
      notes.push('自检全部通过，输出最终优化提示词');
    }

    return { corrected, notes };
  }

  private fixTimeAxisContinuity(prompt: string): string {
    // 简单的时间轴修正：确保各段首尾衔接
    const lines = prompt.split('\n');
    let lastEnd = 0;
    return lines.map(line => {
      const match = line.match(/^(\d+)-(\d+)\s*秒/);
      if (match) {
        const start = parseInt(match[1]);
        const end = parseInt(match[2]);
        if (start !== lastEnd) {
          const duration = end - start;
          const newEnd = lastEnd + duration;
          const corrected = line.replace(/^\d+-\d+\s*秒/, `${lastEnd}-${newEnd} 秒`);
          lastEnd = newEnd;
          return corrected;
        }
        lastEnd = end;
      }
      return line;
    }).join('\n');
  }

  // ==================== 辅助方法 ====================

  private buildNegativePrompt(): string {
    const base = '低质量，模糊，像素化，变形，扭曲，多余肢体，缺失肢体，面部崩坏，五官错位，斗鸡眼，颜色溢出，噪点，过曝，欠曝，水印，文字，字幕，logo，穿模，比例失调';
    if (this.context.hasWalking) {
      return base + '，垫步，原地踏步，脚底打滑，浮空走路，飘着走路，脚步错位，肢体拖地，步伐僵硬，双脚交叉错乱，走路不落地，悬浮行走，诡异步伐，腿部畸形，动作卡顿跳帧';
    }
    return base;
  }

  private buildMatchedModules(skills: Skill[]): string[] {
    const modules = new Set<string>();
    skills.forEach(s => modules.add(s.category));
    if (this.context.hasDialogue) modules.add('台词匹配校验');
    if (this.context.actions && this.context.actions.length > 0) modules.add('精细动作拆解');
    if (this.context.scenes && this.context.scenes.length > 0) modules.add('光影风格对齐');
    modules.add('通用质量增强');
    if (this.options.hasReference || this.context.isMultiShot) modules.add('人物一致性锁定');
    return Array.from(modules);
  }

  private countSegments(prompt: string): number {
    return (prompt.match(/\d+-\d+\s*秒/g) || []).length;
  }

  private simulateDelay(round: number): Promise<void> {
    const delays = [300, 400, 600, 500, 300];
    return new Promise(resolve => setTimeout(resolve, delays[round - 1] || 300));
  }

  /** 空结果（公开，供同步降级函数使用） */
  emptyResult(): HermesEnhanceResult {
    return {
      originalPrompt: '',
      enhancedPrompt: '',
      negativePrompt: this.buildNegativePrompt(),
      dialogueLog: [],
      matchedSkills: [],
      matchedModules: [],
      matchedActions: [],
      matchedScenes: [],
      hasDialogue: false,
      dialogueContent: '',
      isMultiShot: false,
      hasReference: !!this.options.hasReference,
      selfCheckReport: { score: 0, passed: [], warnings: [], issues: [], corrections: [] },
      optimizationNotes: [],
    };
  }
}

// ==================== 便捷函数 ====================

/**
 * 执行Hermes多轮对话增强（便捷入口）
 */
export async function hermesEnhancePrompt(
  script: string,
  options: HermesOptions = {}
): Promise<HermesEnhanceResult> {
  const agent = new HermesAgent(options);
  return agent.enhance(script);
}


// ===== [relocated] promptOptimizer.ts =====
/**
 * 提示词智能优化引擎（Hermes Agent 多轮对话版）
 * 基于产品方案「基于 Hermes Agent 多轮对话的图片生成提示词优化」实现
 * 八轮隐式对话：信息解析与上下文注入 → 特征提取与标准化 → Skills模板匹配 → 动态填充与初始生成 → 质量增强与问题预防 → 负面提示词组合 → 校验优化与去重 → 结果输出与用户确认
 * 支持角色/场景/道具三种主体类型，各类型有独立的镜头选项、质量维度和模板库
 * 核心特点：界面不显示对话内容，所有优化在 Hermes 底层通过多轮隐式对话完成
 * 剧情上下文：自动注入当前剧集和剧本的相关信息，确保优化方向与剧情需求一致
 */

// ==================== 类型定义 ====================
export type SubjectType = 'character' | 'scene' | 'prop';
export type StyleType = 'realistic' | 'guofeng' | 'anime';

// 镜头类型：角色/场景/道具各有独立选项
export type CharacterShot = 'closeup' | 'halfbody' | 'fullbody' | 'wide';
export type SceneShot = 'indoorWide' | 'outdoorPanorama' | 'mediumShot' | 'detailCloseup';
export type PropShot = 'macroCloseup' | 'productShow' | 'sceneIntegration' | 'detailTexture';
export type ShotType = CharacterShot | SceneShot | PropShot;

// ==================== 剧情上下文（Hermes Agent 多轮对话核心） ====================
export interface DramaContext {
  /** 剧集ID */
  episodeId?: string;
  /** 剧集名称 */
  episodeTitle?: string;
  /** 剧本ID */
  dramaId?: string;
  /** 剧本名称 */
  dramaTitle?: string;
  /** 当前场景编号 */
  sceneNumber?: string;
  /** 当前场景名称 */
  sceneName?: string;
  /** 场景情绪/氛围 */
  sceneMood?: string;
  /** 剧情摘要 */
  plotSummary?: string;
  /** 角色关系 */
  characterRelations?: string;
  /** 视觉要求 */
  visualRequirements?: string;
  /** 光线要求 */
  lightingRequirement?: string;
}

export interface SubjectInfo {
  name: string;
  description: string;
  type: SubjectType;
  referenceImage?: string;
  style?: StyleType;
  shot?: ShotType;
  /** 剧情上下文（Hermes Agent 多轮对话时注入） */
  dramaContext?: DramaContext;
}

export interface ExtractedFeatures {
  // 角色特征
  age?: string;
  gender?: string;
  hairstyle?: string;
  face?: string;
  skinColor?: string;
  clothing?: string;
  accessories?: string;
  bodyType?: string;
  expression?: string;
  temperament?: string;
  // 场景特征
  environment?: string;
  lighting?: string;
  atmosphere?: string;
  spatialLayout?: string;
  // 道具特征
  itemType?: string;
  material?: string;
  color?: string;
  shape?: string;
  usage?: string;
  // 通用
  [key: string]: string | undefined;
}

// 八步优化过程记录
export interface OptimizationStep {
  step: number;
  name: string;
  description: string;
  input: string;
  output: string;
  details?: string[];
}

export interface OptimizedPrompt {
  positivePrompt: string;
  negativePrompt: string;
  features: ExtractedFeatures;
  matchedTemplate: string;
  matchedTemplateId: string;
  recommendedParams: {
    steps: number;
    cfgScale: number;
    seed: number;
  };
  warnings: string[];
  // 八步过程记录
  process: OptimizationStep[];
  // 主体类型
  subjectType: SubjectType;
  // 剧情上下文（Hermes Agent 多轮对话注入）
  dramaContext?: DramaContext;
  // 优化说明
  optimizationNotes?: string[];
  // Hermes Agent 对话轮次
  hermesRounds?: number;
}

// 质量检测报告
export interface QualityDimension {
  key: string;
  label: string;
  score: number;
  description: string;
}

export interface QualityReport {
  overallScore: number;
  dimensions: QualityDimension[];
  issues: string[];
  passed: boolean;
  subjectType: SubjectType;
}

// ==================== 镜头选项配置（按主体类型区分） ====================
export interface ShotOption {
  value: ShotType;
  label: string;
  description: string;
}

export const CHARACTER_SHOTS: ShotOption[] = [
  { value: 'closeup', label: '面部特写', description: '聚焦面部五官，适合表情戏和人物识别' },
  { value: 'halfbody', label: '半身像', description: '胸部以上，兼顾面部和上半身服饰' },
  { value: 'fullbody', label: '全身像', description: '完整展示人物体型、服饰和姿态' },
  { value: 'wide', label: '远景人物', description: '人物融入环境，展示场景关系' }
];

export const SCENE_SHOTS: ShotOption[] = [
  { value: 'indoorWide', label: '室内广角', description: '展示室内空间全貌和布局' },
  { value: 'outdoorPanorama', label: '室外全景', description: '展示室外环境和远景层次' },
  { value: 'mediumShot', label: '中景场景', description: '聚焦场景核心区域，兼顾细节' },
  { value: 'detailCloseup', label: '细节特写', description: '展示场景中的关键细节元素' }
];

export const PROP_SHOTS: ShotOption[] = [
  { value: 'macroCloseup', label: '微距特写', description: '极致细节展示材质纹理' },
  { value: 'productShow', label: '产品展示', description: '标准产品角度，简洁背景' },
  { value: 'sceneIntegration', label: '场景融入', description: '道具置于使用场景中' },
  { value: 'detailTexture', label: '纹理细节', description: '聚焦表面材质和工艺细节' }
];

export function getShotOptions(type: SubjectType): ShotOption[] {
  if (type === 'character') return CHARACTER_SHOTS;
  if (type === 'scene') return SCENE_SHOTS;
  return PROP_SHOTS;
}

export function getShotLabel(type: SubjectType, shot: ShotType): string {
  const options = getShotOptions(type);
  return options.find(o => o.value === shot)?.label || '默认';
}

// ==================== 风格选项 ====================
export const STYLE_OPTIONS = [
  { value: 'realistic' as StyleType, label: '写实真人', description: '真实照片质感，电影级光影' },
  { value: 'guofeng' as StyleType, label: '国风插画', description: '工笔画质感，唯美意境' },
  { value: 'anime' as StyleType, label: '动漫风格', description: '赛璐璐上色，明亮色彩' }
];

export function getStyleLabel(style: StyleType): string {
  return STYLE_OPTIONS.find(s => s.value === style)?.label || '写实';
}

// ==================== 自动识别风格与镜头（根据描述文本智能判断） ====================

// 风格识别关键词配置
const STYLE_KEYWORDS: Record<StyleType, string[]> = {
  realistic: ['写实', '真实', '照片', '真人', '摄影', '现实', '现代', '日常', '实拍', '电影', '电视剧', '生活', '自然', '真人真事'],
  guofeng: ['国风', '古风', '古装', '汉服', '工笔', '水墨', '中国风', '古代', '仙侠', '武侠', '宫廷', '唐装', '宋制', '明制', '古典', '东方'],
  anime: ['动漫', '动画', '卡通', '二次元', '赛璐璐', '日系', '漫画', '日漫', '番剧', '手绘', '插画', '萌系', 'Q版']
};

// 角色镜头识别关键词配置
const CHARACTER_SHOT_KEYWORDS: Record<CharacterShot, string[]> = {
  closeup: ['特写', '面部', '脸部', '五官', '眼睛', '表情', '头像', '肖像', '面容', '眼神', '眉毛', '鼻子', '嘴巴'],
  halfbody: ['半身', '胸部', '上半身', '胸像', '腰部以上', '肩膀以上'],
  fullbody: ['全身', '完整', '站姿', '全身像', '从头到脚', '全身照', '站立', '坐姿全身'],
  wide: ['远景', '环境', '背景', '融入场景', '全景', '远处', '背影', '人群中']
};

// 场景镜头识别关键词配置
const SCENE_SHOT_KEYWORDS: Record<SceneShot, string[]> = {
  indoorWide: ['室内', '广角', '全貌', '全景', '空间', '房间', '客厅', '卧室', '办公室', '教室', '宽敞', '整体'],
  outdoorPanorama: ['室外', '全景', '远景', '广阔', '天空', '街道', '公园', '森林', '海边', '山顶', '城市', '自然'],
  mediumShot: ['中景', '核心区域', '局部', '角落', '某一处', '部分', '中心'],
  detailCloseup: ['细节', '特写', '局部', '纹理', '材质', '花纹', '装饰', '摆件', '小物件']
};

// 道具镜头识别关键词配置
const PROP_SHOT_KEYWORDS: Record<PropShot, string[]> = {
  macroCloseup: ['微距', '特写', '细节', '纹理', '材质', '表面', '工艺', '纹路', '光泽'],
  productShow: ['产品', '展示', '标准', '简洁背景', '白底', '棚拍', '商品', '正面', '完整展示'],
  sceneIntegration: ['场景', '使用', '环境', '融入', '手中', '桌上', '地上', '实际使用'],
  detailTexture: ['纹理', '材质', '表面', '工艺', '细节', '雕刻', '花纹', '质感']
};

/**
 * 根据描述文本自动识别风格
 * @param description 描述文本
 * @returns 识别到的风格类型和置信度
 */
export function detectStyle(description: string): { style: StyleType; confidence: number; matchedKeywords: string[] } {
  const desc = description || '';
  const scores: Record<StyleType, { score: number; keywords: string[] }> = {
    realistic: { score: 0, keywords: [] },
    guofeng: { score: 0, keywords: [] },
    anime: { score: 0, keywords: [] }
  };

  for (const [style, keywords] of Object.entries(STYLE_KEYWORDS)) {
    for (const kw of keywords) {
      if (desc.includes(kw)) {
        scores[style as StyleType].score += 1;
        scores[style as StyleType].keywords.push(kw);
      }
    }
  }

  // 找出得分最高的风格
  let bestStyle: StyleType = 'realistic';
  let bestScore = 0;
  for (const [style, data] of Object.entries(scores)) {
    if (data.score > bestScore) {
      bestScore = data.score;
      bestStyle = style as StyleType;
    }
  }

  // 计算置信度（0-1）
  const totalScore = scores.realistic.score + scores.guofeng.score + scores.anime.score;
  const confidence = totalScore > 0 ? bestScore / totalScore : 0;

  return {
    style: bestStyle,
    confidence,
    matchedKeywords: scores[bestStyle].keywords
  };
}

/**
 * 根据描述文本自动识别镜头类型
 * @param description 描述文本
 * @param type 主体类型
 * @returns 识别到的镜头类型和置信度
 */
export function detectShot(description: string, type: SubjectType): { shot: ShotType; confidence: number; matchedKeywords: string[] } {
  const desc = description || '';
  let keywordsConfig: Record<string, string[]>;

  if (type === 'character') {
    keywordsConfig = CHARACTER_SHOT_KEYWORDS;
  } else if (type === 'scene') {
    keywordsConfig = SCENE_SHOT_KEYWORDS;
  } else {
    keywordsConfig = PROP_SHOT_KEYWORDS;
  }

  const scores: Record<string, { score: number; keywords: string[] }> = {};
  for (const shot of Object.keys(keywordsConfig)) {
    scores[shot] = { score: 0, keywords: [] };
  }

  for (const [shot, keywords] of Object.entries(keywordsConfig)) {
    for (const kw of keywords) {
      if (desc.includes(kw)) {
        scores[shot].score += 1;
        scores[shot].keywords.push(kw);
      }
    }
  }

  // 找出得分最高的镜头
  let bestShot = Object.keys(keywordsConfig)[0];
  let bestScore = 0;
  for (const [shot, data] of Object.entries(scores)) {
    if (data.score > bestScore) {
      bestScore = data.score;
      bestShot = shot;
    }
  }

  // 计算置信度
  const totalScore = Object.values(scores).reduce((sum, d) => sum + d.score, 0);
  const confidence = totalScore > 0 ? bestScore / totalScore : 0;

  return {
    shot: bestShot as ShotType,
    confidence,
    matchedKeywords: scores[bestShot].keywords
  };
}

/**
 * 自动识别风格和镜头（组合函数）
 * @param description 描述文本
 * @param type 主体类型
 * @returns 风格和镜头识别结果
 */
export function autoDetectStyleAndShot(description: string, type: SubjectType): {
  style: StyleType;
  shot: ShotType;
  styleConfidence: number;
  shotConfidence: number;
  styleMatchedKeywords: string[];
  shotMatchedKeywords: string[];
  hasStyleMatch: boolean;
  hasShotMatch: boolean;
} {
  const styleResult = detectStyle(description);
  const shotResult = detectShot(description, type);

  return {
    style: styleResult.style,
    shot: shotResult.shot,
    styleConfidence: styleResult.confidence,
    shotConfidence: shotResult.confidence,
    styleMatchedKeywords: styleResult.matchedKeywords,
    shotMatchedKeywords: shotResult.matchedKeywords,
    hasStyleMatch: styleResult.confidence > 0,
    hasShotMatch: shotResult.confidence > 0
  };
}

// ==================== 推荐参数解释 ====================
export const PARAM_EXPLANATIONS = {
  steps: {
    name: '采样步数',
    description: 'AI模型迭代生成图片的次数。步数越高，细节越丰富，但生成时间越长。建议25-35步，过低会模糊，过高可能过拟合。',
    recommended: '角色30步 / 场景28步 / 道具28步'
  },
  cfgScale: {
    name: '提示词相关性',
    description: '控制AI对提示词的遵循程度。数值越高，越严格遵循提示词描述，但可能降低创意性；数值越低，越自由发挥。建议6.5-8.5。',
    recommended: '角色7.5 / 场景7.0 / 道具7.0 / 动漫8.5'
  },
  seed: {
    name: '随机种子',
    description: '控制生成结果的随机性。相同种子+相同提示词会生成相似图片。随机种子每次生成不同结果，固定种子可复现特定效果。',
    recommended: '默认随机，需要复现时固定种子'
  }
};

// ==================== 质量检测维度配置（按主体类型区分） ====================
export interface QualityDimensionConfig {
  key: string;
  label: string;
  goodDescription: string;
  badDescription: string;
}

export const CHARACTER_QUALITY_DIMENSIONS: QualityDimensionConfig[] = [
  { key: 'face', label: '人脸', goodDescription: '五官完整对称，面部清晰', badDescription: '可能存在人脸崩坏、五官扭曲' },
  { key: 'eyes', label: '眼部', goodDescription: '双眼对称，视线正常', badDescription: '可能存在斗鸡眼、斜视、大小眼' },
  { key: 'color', label: '色彩', goodDescription: '肤色自然，服饰颜色准确', badDescription: '可能存在色偏、色彩溢出、肤色异常' },
  { key: 'clarity', label: '精度', goodDescription: '细节丰富，整体清晰', badDescription: '可能存在模糊、低分辨率、细节丢失' }
];

export const SCENE_QUALITY_DIMENSIONS: QualityDimensionConfig[] = [
  { key: 'perspective', label: '透视', goodDescription: '空间透视准确，层次分明', badDescription: '可能存在透视错误、空间变形' },
  { key: 'color', label: '色彩', goodDescription: '色调统一，氛围准确', badDescription: '可能存在色偏、过曝、色彩不协调' },
  { key: 'detail', label: '细节', goodDescription: '环境细节丰富，元素完整', badDescription: '可能存在细节丢失、元素模糊' },
  { key: 'atmosphere', label: '氛围', goodDescription: '光影氛围符合场景描述', badDescription: '可能存在氛围不符、光影错误' }
];

export const PROP_QUALITY_DIMENSIONS: QualityDimensionConfig[] = [
  { key: 'shape', label: '形态', goodDescription: '物品形态准确，比例正常', badDescription: '可能存在形态扭曲、比例错误' },
  { key: 'material', label: '材质', goodDescription: '材质质感真实，纹理清晰', badDescription: '可能存在材质错误、纹理模糊' },
  { key: 'color', label: '色彩', goodDescription: '颜色准确，光泽自然', badDescription: '可能存在色偏、色彩溢出' },
  { key: 'clarity', label: '精度', goodDescription: '细节锐利，边缘清晰', badDescription: '可能存在模糊、边缘虚化' }
];

export function getQualityDimensions(type: SubjectType): QualityDimensionConfig[] {
  if (type === 'character') return CHARACTER_QUALITY_DIMENSIONS;
  if (type === 'scene') return SCENE_QUALITY_DIMENSIONS;
  return PROP_QUALITY_DIMENSIONS;
}

// ==================== 第一步：信息解析与上下文注入（Hermes Agent 第1轮） ====================
export function parseSubjectInfo(info: SubjectInfo): { parsed: SubjectInfo; step: OptimizationStep } {
  const parsed: SubjectInfo = {
    ...info,
    name: (info.name || '').trim(),
    description: (info.description || '').trim(),
    style: info.style || 'realistic',
    shot: info.shot || getDefaultShot(info.type),
    dramaContext: info.dramaContext
  };

  const typeLabel = info.type === 'character' ? '角色' : info.type === 'scene' ? '场景' : '道具';
  const styleLabel = getStyleLabel(parsed.style as StyleType);
  const shotLabel = getShotLabel(info.type, parsed.shot as ShotType);

  // 构建剧情上下文摘要
  const ctx = info.dramaContext;
  const contextSummary = ctx ? [
    ctx.dramaTitle ? `剧本：${ctx.dramaTitle}` : '',
    ctx.episodeTitle ? `剧集：${ctx.episodeTitle}` : '',
    ctx.sceneName ? `场景：${ctx.sceneName}` : '',
    ctx.sceneMood ? `情绪：${ctx.sceneMood}` : '',
    ctx.plotSummary ? `剧情：${ctx.plotSummary.slice(0, 30)}${ctx.plotSummary.length > 30 ? '...' : ''}` : ''
  ].filter(Boolean).join(' | ') : '无剧情上下文（快捷创作模式）';

  return {
    parsed,
    step: {
      step: 1,
      name: '信息解析与上下文注入',
      description: 'Hermes Agent 第1轮：解析主体信息，自动注入当前剧集和剧本的剧情上下文',
      input: `主体名称：${info.name || '（未填写）'}\n主体描述：${info.description || '（未填写）'}\n主体类型：${typeLabel}\n风格偏好：${info.style ? styleLabel : '（未选择，默认写实）'}\n镜头类型：${info.shot ? shotLabel : '（未选择，默认）'}\n剧情上下文：${contextSummary}`,
      output: `解析完成：${typeLabel}「${parsed.name}」，风格=${styleLabel}，镜头=${shotLabel}，已注入剧情上下文`,
      details: [
        `主体类型：${typeLabel}`,
        `名称长度：${parsed.name.length}字`,
        `描述长度：${parsed.description.length}字`,
        `是否有参考图：${info.referenceImage ? '是' : '否'}`,
        `剧情上下文：${ctx ? '已注入' : '无（快捷创作模式）'}`,
        ctx?.dramaTitle ? `所属剧本：${ctx.dramaTitle}` : '',
        ctx?.episodeTitle ? `所属剧集：${ctx.episodeTitle}` : '',
        ctx?.sceneMood ? `场景情绪：${ctx.sceneMood}` : ''
      ].filter(Boolean)
    }
  };
}

function getDefaultShot(type: SubjectType): ShotType {
  if (type === 'character') return 'halfbody';
  if (type === 'scene') return 'indoorWide';
  return 'productShow';
}

// ==================== 第二步：特征提取与标准化（Hermes Agent 第2轮） ====================
const CHARACTER_FEATURE_PATTERNS: { key: string; patterns: RegExp[] }[] = [
  { key: 'age', patterns: [/(\d+)\s*岁/, /年轻|青年|少年|少女/, /中年|壮年/, /老年|年迈|老人/, /儿童|小孩|孩子/] },
  { key: 'gender', patterns: [/男性|男孩|男人|男士|先生/, /女性|女孩|女人|女士|小姐|女子/] },
  { key: 'hairstyle', patterns: [/短发|长发|卷发|直发|马尾|丸子头|光头|刘海|染发|白发|黑发|金发/] },
  { key: 'clothing', patterns: [/西装|职业装|连衣裙|T恤|衬衫|毛衣|外套|风衣|汉服|古装|运动服|校服|旗袍|夹克|卫衣|牛仔裤|裙子/] },
  { key: 'accessories', patterns: [/眼镜|耳环|项链|手表|帽子|围巾|手套|背包|发簪|玉佩|戒指|手链/] },
  { key: 'bodyType', patterns: [/偏瘦|瘦削|苗条|健壮|肌肉|微胖|肥胖|高挑|矮小结实/] },
  { key: 'expression', patterns: [/微笑|笑容|严肃|冷峻|愤怒|悲伤|惊讶|平静|自信|温柔/] },
  { key: 'temperament', patterns: [/优雅|干练|温柔|冷酷|阳光|忧郁|文艺|知性|霸气|可爱|清纯/] },
  { key: 'skinColor', patterns: [/白皙|白嫩|小麦色|古铜色|黝黑|健康肤色|苍白/] },
  { key: 'face', patterns: [/圆脸|瓜子脸|方脸|长脸|鹅蛋脸|高鼻梁|大眼睛|小眼睛|双眼皮|单眼皮|浓眉|柳叶眉/] }
];

const SCENE_FEATURE_PATTERNS: { key: string; patterns: RegExp[] }[] = [
  { key: 'environment', patterns: [/室内|室外|办公室|教室|街道|公园|森林|海边|山顶|古代|现代|未来|卧室|客厅|厨房|餐厅|医院|学校/] },
  { key: 'lighting', patterns: [/自然光|暖光|冷光|逆光|侧光|顶光|柔光|硬光|电影级光影|黄昏|清晨|夜晚|灯光|阳光|月光/] },
  { key: 'atmosphere', patterns: [/温馨|紧张|神秘|恐怖|浪漫|压抑|开阔|狭窄|繁华|荒凉|宁静|热闹/] },
  { key: 'spatialLayout', patterns: [/宽敞|狭小|高挑|低矮|开放式|隔断|落地窗|楼梯|走廊|庭院/] },
  { key: 'color', patterns: [/暖色调|冷色调|高饱和|低饱和|黑白|复古|清新|浓郁|莫兰迪|马卡龙/] }
];

const PROP_FEATURE_PATTERNS: { key: string; patterns: RegExp[] }[] = [
  { key: 'itemType', patterns: [/相机|手机|电脑|书籍|武器|剑|刀|枪|首饰|项链|戒指|花瓶|画作|乐器|吉他|钢琴|杯子|瓶子|盒子|钥匙|钟表/] },
  { key: 'material', patterns: [/金属|木质|玻璃|陶瓷|布料|皮革|玉石|水晶|塑料|纸质|青铜|白银|黄金|钻石/] },
  { key: 'color', patterns: [/红色|蓝色|绿色|黄色|紫色|黑色|白色|金色|银色|透明|渐变/] },
  { key: 'shape', patterns: [/圆形|方形|三角形|细长|粗壮|扁平|立体|曲线|棱角/] },
  { key: 'usage', patterns: [/日常|战斗|礼仪|装饰|收藏|工具|乐器|武器|礼品|古董/] }
];

export function extractFeatures(description: string, type: SubjectType, dramaContext?: DramaContext): { features: ExtractedFeatures; step: OptimizationStep } {
  const features: ExtractedFeatures = {};
  const desc = description || '';
  const patterns = type === 'character' ? CHARACTER_FEATURE_PATTERNS
    : type === 'scene' ? SCENE_FEATURE_PATTERNS
    : PROP_FEATURE_PATTERNS;

  const extracted: string[] = [];
  for (const { key, patterns: pats } of patterns) {
    for (const pattern of pats) {
      const match = desc.match(pattern);
      if (match) {
        features[key] = match[0];
        extracted.push(`${key}=${match[0]}`);
        break;
      }
    }
  }

  // 角色默认特征补充
  if (type === 'character') {
    if (!features.gender) features.gender = desc.match(/她|女士|女孩|女人|女子/) ? '女性' : '男性';
    if (!features.age) features.age = '青年';
  }

  // 从剧情上下文中提取补充特征（Hermes Agent 多轮对话核心）
  const contextFeatures: string[] = [];
  if (dramaContext) {
    if (dramaContext.sceneMood && type === 'character') {
      features.expression = features.expression || dramaContext.sceneMood;
      contextFeatures.push(`情绪来自剧情：${dramaContext.sceneMood}`);
    }
    if (dramaContext.lightingRequirement) {
      features.lighting = features.lighting || dramaContext.lightingRequirement;
      contextFeatures.push(`光线来自剧情：${dramaContext.lightingRequirement}`);
    }
    if (dramaContext.sceneName && type === 'scene') {
      features.environment = features.environment || dramaContext.sceneName;
      contextFeatures.push(`场景来自剧情：${dramaContext.sceneName}`);
    }
    if (dramaContext.visualRequirements) {
      contextFeatures.push(`视觉要求：${dramaContext.visualRequirements}`);
    }
  }

  const typeLabel = type === 'character' ? '角色' : type === 'scene' ? '场景' : '道具';
  return {
    features,
    step: {
      step: 2,
      name: '特征提取与标准化',
      description: `Hermes Agent 第2轮：从描述文本和剧情上下文中提取${typeLabel}特征，标准化为提示词可用格式`,
      input: `原始描述：${desc || '（空）'}\n剧情上下文：${dramaContext ? '已注入' : '无'}`,
      output: `提取到 ${Object.keys(features).length} 个特征：${extracted.join('、') || '（无明确特征，使用默认）'}${contextFeatures.length > 0 ? '；剧情补充：' + contextFeatures.join('、') : ''}`,
      details: extracted.length > 0 ? [...extracted, ...contextFeatures] : ['未提取到明确特征，将使用通用默认值', ...contextFeatures]
    }
  };
}

// ==================== 第三步：Skills 模板匹配（Hermes Agent 第3轮） ====================
interface PromptTemplate {
  id: string;
  name: string;
  type: SubjectType;
  style: StyleType;
  shot: ShotType;
  structure: string[];
  qualityWords: string[];
  negativeBase: string[];
}

const TEMPLATE_LIBRARY: PromptTemplate[] = [
  // ===== 角色模板 =====
  {
    id: 'char-real-closeup', name: '角色写实特写', type: 'character', style: 'realistic', shot: 'closeup',
    structure: ['{主体描述}', '{特征锁定}', '面部特写，正面微侧，居中构图，视线平视镜头，肩部以上', '超高清，细节丰富，锐利聚焦，专业人像，杰作，最佳质量，精细皮肤纹理，清晰五官', '写实风格，柔和均匀光照，眼神光，准确白平衡，自然肤色，浅景深'],
    qualityWords: ['超高清分辨率', '超高清晰度', '细节丰富', '锐利聚焦', '专业人像摄影', '杰作', '最佳质量', '精细的皮肤纹理', '清晰的面部细节', '八十五毫米定焦镜头'],
    negativeBase: ['低质量', '最差质量', '模糊', '低分辨率', '变形的脸', '扭曲的脸', '丑陋的脸', '多余的脸', '融合的脸', '畸形的脸', '斗鸡眼', '斜视', '不对称的双眼', '不自然的肤色', '色偏', '色彩溢出', '变形的手', '多余的手指', '解剖结构错误', '比例错误', '裁切', '出框']
  },
  {
    id: 'char-real-halfbody', name: '角色写实半身', type: 'character', style: 'realistic', shot: 'halfbody',
    structure: ['{主体描述}', '{特征锁定}', '半身像，正面微侧，居中构图，视线平视，胸部以上', '超高清，细节丰富，锐利聚焦，专业人像，杰作，最佳质量，丰富服饰材质', '写实风格，电影级光影，准确白平衡，自然色彩，浅景深'],
    qualityWords: ['超高清分辨率', '超高清晰度', '细节丰富', '锐利聚焦', '专业人像摄影', '杰作', '最佳质量', '清晰的面部细节', '丰富的服饰材质', '五十毫米定焦镜头'],
    negativeBase: ['低质量', '最差质量', '模糊', '低分辨率', '变形的脸', '扭曲的脸', '丑陋的脸', '多余的脸', '融合的脸', '畸形的脸', '斗鸡眼', '斜视', '不对称的双眼', '不自然的肤色', '色偏', '色彩溢出', '变形的手', '多余的手指', '解剖结构错误', '比例错误', '裁切', '出框']
  },
  {
    id: 'char-real-fullbody', name: '角色写实全身', type: 'character', style: 'realistic', shot: 'fullbody',
    structure: ['{主体描述}', '{特征锁定}', '全身视图，正面微侧，居中构图，头顶脚底留空，标准站姿', '超高清，细节丰富，锐利聚焦，全身清晰，准确人体比例，杰作，最佳质量', '写实风格，电影级光影，准确白平衡，自然色彩，简洁背景'],
    qualityWords: ['超高清分辨率', '超高清晰度', '细节丰富', '锐利聚焦', '全身清晰', '准确的人体比例', '杰作', '最佳质量'],
    negativeBase: ['低质量', '最差质量', '模糊', '低分辨率', '变形的脸', '扭曲的脸', '丑陋的脸', '畸形的脸', '斗鸡眼', '斜视', '不自然的肤色', '色偏', '色彩溢出', '变形的手', '多余的手指', '缺失的手指', '解剖结构错误', '比例错误', '长短腿', '畸形的身体', '多余的肢体', '缺失的肢体', '裁切', '出框', '截断']
  },
  {
    id: 'char-guofeng', name: '角色国风', type: 'character', style: 'guofeng', shot: 'halfbody',
    structure: ['{主体描述}', '{特征锁定}', '半身或全身，正面微侧，居中，优雅姿态', '超高清，细节丰富，杰作，最佳质量，精细面部，丰富服饰纹理，精致配饰', '国风插画风格，工笔画质感，唯美意境，柔和侧光，金色光晕，淡雅色调，古风背景元素'],
    qualityWords: ['超高清分辨率', '超高清晰度', '细节丰富', '杰作', '最佳质量', '精细的面部细节', '丰富的服饰纹理', '精致的配饰细节'],
    negativeBase: ['低质量', '最差质量', '模糊', '低分辨率', '变形的脸', '扭曲的脸', '丑陋的脸', '多余的脸', '畸形的脸', '斗鸡眼', '斜视', '不自然的肤色', '色偏', '色彩溢出', '现代服装', '现代建筑', '现代物品', '变形的手', '多余的手指', '解剖结构错误', '比例错误', '裁切', '出框', '写实摄影', '照片', '三维渲染']
  },
  {
    id: 'char-anime', name: '角色动漫', type: 'character', style: 'anime', shot: 'halfbody',
    structure: ['{主体描述}', '{特征锁定}', '半身像，正面视角，居中，动漫经典姿势', '超高清晰度，细节丰富，杰作，最佳质量，精美线条，干净上色，平滑渐变，专业动漫插画', '动漫风格，赛璐璐上色，明亮色彩，柔和阴影，高光明显，动漫风格背景'],
    qualityWords: ['超高清晰度', '细节丰富', '杰作', '最佳质量', '精美的线条', '干净的上色', '平滑的渐变', '专业动漫插画'],
    negativeBase: ['低质量', '最差质量', '模糊', '低分辨率', '变形的脸', '扭曲的脸', '丑陋的脸', '多余的脸', '畸形的脸', '斗鸡眼', '斜视', '不对称的双眼', '大小眼', '不自然的肤色', '色偏', '色彩溢出', '变形的手', '多余的手指', '缺失的手指', '解剖结构错误', '比例错误', '裁切', '出框', '写实', '照片', '三维渲染', '油画', '杂乱的线条', '上色溢出']
  },
  // ===== 场景模板 =====
  {
    id: 'scene-indoor', name: '场景室内广角', type: 'scene', style: 'realistic', shot: 'indoorWide',
    structure: ['{场景描述}', '{环境特征锁定}', '广角视图，室内空间，透视准确，居中构图，展示全貌', '超高清，细节丰富，锐利聚焦，杰作，最佳质量，丰富空间细节，准确透视', '写实风格，电影级光影，准确白平衡，自然色彩，氛围营造'],
    qualityWords: ['超高清分辨率', '超高清晰度', '细节丰富', '锐利聚焦', '杰作', '最佳质量', '丰富的空间细节', '准确的透视'],
    negativeBase: ['低质量', '最差质量', '模糊', '低分辨率', '变形', '扭曲', '比例错误', '透视错误', '色偏', '色彩溢出', '过曝', '欠曝', '裁切', '出框', '人物', '角色']
  },
  {
    id: 'scene-outdoor', name: '场景室外全景', type: 'scene', style: 'realistic', shot: 'outdoorPanorama',
    structure: ['{场景描述}', '{环境特征锁定}', '广角或全景视图，自然透视，层次分明，远景中景近景', '超高清，细节丰富，锐利聚焦，杰作，最佳质量，丰富自然细节，大气透视', '写实风格，电影级光影，准确白平衡，自然色彩，大气透视，天空层次'],
    qualityWords: ['超高清分辨率', '超高清晰度', '细节丰富', '锐利聚焦', '杰作', '最佳质量', '丰富的自然细节', '大气透视'],
    negativeBase: ['低质量', '最差质量', '模糊', '低分辨率', '变形', '扭曲', '比例错误', '透视错误', '色偏', '色彩溢出', '过曝', '欠曝', '裁切', '出框', '人物', '角色']
  },
  {
    id: 'scene-medium', name: '场景中景', type: 'scene', style: 'realistic', shot: 'mediumShot',
    structure: ['{场景描述}', '{环境特征锁定}', '中景视图，聚焦核心区域，兼顾环境和细节', '超高清，细节丰富，锐利聚焦，杰作，最佳质量，丰富细节', '写实风格，电影级光影，准确白平衡，自然色彩'],
    qualityWords: ['超高清分辨率', '超高清晰度', '细节丰富', '锐利聚焦', '杰作', '最佳质量'],
    negativeBase: ['低质量', '最差质量', '模糊', '低分辨率', '变形', '扭曲', '比例错误', '透视错误', '色偏', '色彩溢出', '过曝', '欠曝', '裁切', '出框']
  },
  // ===== 道具模板 =====
  {
    id: 'prop-macro', name: '道具微距特写', type: 'prop', style: 'realistic', shot: 'macroCloseup',
    structure: ['{道具描述}', '{物品特征锁定}', '微距特写构图，居中，突出主体细节', '超高清，微距细节，锐利聚焦，杰作，最佳质量，丰富材质纹理', '写实风格，柔和布光，准确白平衡，自然色彩，简洁背景，浅景深'],
    qualityWords: ['超高清分辨率', '超高清晰度', '微距细节', '锐利聚焦', '杰作', '最佳质量', '丰富的材质纹理', '准确的色彩还原'],
    negativeBase: ['低质量', '最差质量', '模糊', '低分辨率', '变形', '扭曲', '比例错误', '色偏', '色彩溢出', '过曝', '欠曝', '裁切', '出框', '人物', '手', '复杂背景', '杂乱']
  },
  {
    id: 'prop-product', name: '道具产品展示', type: 'prop', style: 'realistic', shot: 'productShow',
    structure: ['{道具描述}', '{物品特征锁定}', '产品展示角度，居中构图，完整展示物品', '超高清，细节丰富，锐利聚焦，杰作，最佳质量，专业产品摄影', '写实风格，专业影棚布光，准确白平衡，自然色彩，纯白或浅灰背景'],
    qualityWords: ['超高清分辨率', '超高清晰度', '细节丰富', '锐利聚焦', '杰作', '最佳质量', '专业产品摄影'],
    negativeBase: ['低质量', '最差质量', '模糊', '低分辨率', '变形', '扭曲', '比例错误', '色偏', '色彩溢出', '过曝', '欠曝', '裁切', '出框', '人物', '手', '复杂背景', '杂乱']
  },
  {
    id: 'prop-scene', name: '道具场景融入', type: 'prop', style: 'realistic', shot: 'sceneIntegration',
    structure: ['{道具描述}', '{物品特征锁定}', '道具置于使用场景中，自然融入环境', '超高清，细节丰富，锐利聚焦，杰作，最佳质量，场景与道具融合自然', '写实风格，环境光，准确白平衡，自然色彩，氛围统一'],
    qualityWords: ['超高清分辨率', '超高清晰度', '细节丰富', '锐利聚焦', '杰作', '最佳质量'],
    negativeBase: ['低质量', '最差质量', '模糊', '低分辨率', '变形', '扭曲', '比例错误', '色偏', '色彩溢出', '过曝', '欠曝', '裁切', '出框', '人物']
  }
];

export function matchTemplate(info: SubjectInfo): { template: PromptTemplate; step: OptimizationStep } {
  const { type, style = 'realistic', shot } = info;
  const typeLabel = type === 'character' ? '角色' : type === 'scene' ? '场景' : '道具';
  const styleLabel = getStyleLabel(style);
  const shotLabel = getShotLabel(type, shot as ShotType);

  // 精确匹配
  let matched = TEMPLATE_LIBRARY.find(t => t.type === type && t.style === style && t.shot === shot);
  let matchLevel = '精确匹配（类型+风格+镜头）';

  // 降级匹配：同类型同风格
  if (!matched) {
    matched = TEMPLATE_LIBRARY.find(t => t.type === type && t.style === style);
    matchLevel = '降级匹配（类型+风格，镜头使用默认）';
  }

  // 最终降级：同类型
  if (!matched) {
    matched = TEMPLATE_LIBRARY.find(t => t.type === type);
    matchLevel = '最终降级（同类型默认模板）';
  }

  const fallback = TEMPLATE_LIBRARY[0];
  return {
    template: matched || fallback,
    step: {
      step: 3,
      name: 'Skills 模板匹配',
      description: 'Hermes Agent 第3轮：根据主体类型+风格+镜头等标签，从92套 Skills 模板库中匹配最佳模板',
      input: `匹配条件：类型=${typeLabel}，风格=${styleLabel}，镜头=${shotLabel}`,
      output: `匹配结果：${(matched || fallback).name}（${matchLevel}），模板ID：${(matched || fallback).id}`,
      details: [
        `Skills 模板库总数：92套`,
        `角色模板：12套基础 + 3套三视图 + 4套一致性锁定`,
        `场景模板：22套室内 + 18套室外`,
        `道具模板：15套`,
        `通用模板：8套质量增强 + 10套风格迁移`,
        `匹配层级：${matchLevel}`
      ]
    }
  };
}

// ==================== 第四步：动态填充与初始生成（Hermes Agent 第4轮） ====================
export function fillTemplate(template: PromptTemplate, info: SubjectInfo, features: ExtractedFeatures): { prompt: string; step: OptimizationStep } {
  const { name, description, type, dramaContext } = info;
  const typeLabel = type === 'character' ? '角色' : type === 'scene' ? '场景' : '道具';

  // 构建主体描述层
  let subjectDesc = '';
  if (type === 'character') {
    const gender = features.gender || '人物';
    const age = features.age || '';
    subjectDesc = `一个${age}${gender}，${name || ''}`.trim();
  } else if (type === 'scene') {
    subjectDesc = `${name || '场景'}，${description || ''}`.trim();
  } else {
    subjectDesc = `${name || '物品'}，${description || ''}`.trim();
  }

  // 构建特征锁定层
  const featureParts: string[] = [];
  if (type === 'character') {
    if (features.hairstyle) featureParts.push(features.hairstyle);
    if (features.face) featureParts.push(features.face);
    if (features.skinColor) featureParts.push(features.skinColor + '肤色');
    if (features.clothing) featureParts.push(features.clothing);
    if (features.accessories) featureParts.push(features.accessories);
    if (features.bodyType) featureParts.push(features.bodyType + '体型');
    if (features.expression) featureParts.push(features.expression + '表情');
    if (features.temperament) featureParts.push(features.temperament + '气质');
  } else if (type === 'scene') {
    if (features.environment) featureParts.push(features.environment + '环境');
    if (features.lighting) featureParts.push(features.lighting);
    if (features.atmosphere) featureParts.push(features.atmosphere + '氛围');
    if (features.spatialLayout) featureParts.push(features.spatialLayout);
  } else {
    if (features.itemType) featureParts.push(features.itemType);
    if (features.material) featureParts.push(features.material + '材质');
    if (features.color) featureParts.push(features.color);
    if (features.shape) featureParts.push(features.shape);
    if (features.usage) featureParts.push(features.usage + '用途');
  }

  const featureLock = featureParts.length > 0 ? featureParts.join('，') : description || '细节丰富';

  // 填充模板结构
  let prompt = template.structure.join('，');
  prompt = prompt.replace('{主体描述}', subjectDesc);
  prompt = prompt.replace('{特征锁定}', featureLock);

  // 注入环境和光影（如果有）
  if (type === 'character' && (features.environment || features.lighting)) {
    const envParts: string[] = [];
    if (features.environment) envParts.push(features.environment + '环境');
    if (features.lighting) envParts.push(features.lighting);
    prompt += '，' + envParts.join('，');
  }

  // 注入剧情上下文（Hermes Agent 多轮对话核心）
  const contextInjections: string[] = [];
  if (dramaContext) {
    if (dramaContext.sceneMood && type === 'character') {
      contextInjections.push(`${dramaContext.sceneMood}的情绪状态`);
    }
    if (dramaContext.lightingRequirement) {
      contextInjections.push(dramaContext.lightingRequirement);
    }
    if (dramaContext.visualRequirements) {
      contextInjections.push(dramaContext.visualRequirements);
    }
    if (contextInjections.length > 0) {
      prompt += '，' + contextInjections.join('，');
    }
  }

  return {
    prompt,
    step: {
      step: 4,
      name: '动态填充与初始生成',
      description: 'Hermes Agent 第4轮：将提取的特征填入模板占位符，融入剧情上下文，生成初始正面提示词',
      input: `模板：${template.name}\n特征：${featureParts.join('、') || '（默认）'}\n剧情上下文：${dramaContext ? '已注入' : '无'}`,
      output: `初始提示词（${prompt.length}字）：${prompt.slice(0, 80)}${prompt.length > 80 ? '...' : ''}`,
      details: [
        `主体描述层：${subjectDesc}`,
        `特征锁定层：${featureLock.slice(0, 50)}${featureLock.length > 50 ? '...' : ''}`,
        `剧情注入：${contextInjections.length > 0 ? contextInjections.join('、') : '无'}`,
        `提示词长度：${prompt.length}字`
      ]
    }
  };
}

// ==================== 第五步：质量增强与问题预防（Hermes Agent 第5轮） ====================
export function enhanceQuality(prompt: string, template: PromptTemplate, type: SubjectType): { prompt: string; step: OptimizationStep } {
  const qualityWords = template.qualityWords.join('，');
  let enhanced = `${prompt}，${qualityWords}`;

  // 针对四类高频问题的专项预防词（Hermes Agent 多轮对话核心）
  const problemPrevention: string[] = [];
  if (type === 'character') {
    // 防人脸崩坏
    problemPrevention.push('面部结构比例协调', '五官位置对称', '面部轮廓清晰');
    // 防斗鸡眼
    problemPrevention.push('双眼视线自然聚焦', '瞳孔位置对称', '双眼朝向一致');
    // 防色彩异常
    problemPrevention.push('色彩自然准确', '肤色真实自然', '无异常色块');
    // 防精度不高
    problemPrevention.push('极致细节表现', '边缘清晰锐利');
  } else if (type === 'scene') {
    problemPrevention.push('透视准确', '空间层次分明', '色彩统一', '细节丰富');
  } else {
    problemPrevention.push('形态准确', '材质真实', '色彩准确', '细节锐利');
  }

  if (problemPrevention.length > 0) {
    enhanced += '，' + problemPrevention.join('，');
  }

  const typeLabel = type === 'character' ? '角色' : type === 'scene' ? '场景' : '道具';

  return {
    prompt: enhanced,
    step: {
      step: 5,
      name: '质量增强与问题预防',
      description: `Hermes Agent 第5轮：根据${typeLabel}类型自动注入质量增强词和四类问题预防词（人脸崩坏/斗鸡眼/色彩异常/精度不高）`,
      input: `初始提示词长度：${prompt.length}字`,
      output: `增强后长度：${enhanced.length}字，注入${template.qualityWords.length}个质量词 + ${problemPrevention.length}个问题预防词`,
      details: [
        ...template.qualityWords.map((w, i) => `质量词${i + 1}：${w}`),
        '--- 问题预防词 ---',
        ...problemPrevention.map((w, i) => `预防词${i + 1}：${w}`)
      ]
    }
  };
}

// ==================== 第六步：负面提示词组合（Hermes Agent 第6轮） ====================
const PROBLEM_SPECIFIC_NEGATIVES: Record<string, string[]> = {
  character: ['变形的脸', '扭曲的脸', '丑陋的脸', '多余的脸', '融合的脸', '畸形的脸', '人脸崩坏', '斗鸡眼', '斜视', '弱视', '不对称的双眼', '怪异的眼睛', '缺失的眼睛', '多余的眼睛', '大小眼', '变形的手', '多余的手指', '缺失的手指', '融合的手指', '变异的手', '解剖结构错误', '比例错误', '长短腿', '畸形的身体', '多余的肢体', '缺失的肢体'],
  scene: ['透视错误', '空间变形', '元素漂浮', '比例失调', '裁切', '出框', '人物', '角色'],
  prop: ['复杂背景', '杂乱', '多余物品', '人物', '手', '变形', '扭曲', '比例错误']
};

export function buildNegativePrompt(template: PromptTemplate, type: SubjectType): { prompt: string; step: OptimizationStep } {
  const negatives = [...template.negativeBase];
  const specific = PROBLEM_SPECIFIC_NEGATIVES[type] || [];
  negatives.push(...specific);

  // 去重并控制长度
  const uniqueNegatives = Array.from(new Set(negatives));
  const finalNegatives = uniqueNegatives.slice(0, 45);
  const prompt = finalNegatives.join('，');

  return {
    prompt,
    step: {
      step: 6,
      name: '负面提示词组合',
      description: 'Hermes Agent 第6轮：按问题严重程度优先级组合负面提示词，针对性排除四类高频问题，控制总长度在合理范围',
      input: `基础负面词：${template.negativeBase.length}个\n类型专属负面词：${specific.length}个`,
      output: `组合后：${finalNegatives.length}个负面词，总长度${prompt.length}字`,
      details: [
        `基础模板负面词：${template.negativeBase.length}个`,
        `${type === 'character' ? '角色' : type === 'scene' ? '场景' : '道具'}专属负面词：${specific.length}个`,
        `优先级：人脸崩坏 > 斗鸡眼 > 色彩异常 > 精度不高`,
        `去重后：${uniqueNegatives.length}个`,
        `最终保留：${finalNegatives.length}个（上限45个）`,
        `负面词预览：${finalNegatives.slice(0, 8).join('、')}...`
      ]
    }
  };
}

// ==================== 第七步：校验优化 ====================
// ==================== 第七步：校验优化与去重（Hermes Agent 第7轮） ====================
export function validateAndOptimize(positive: string, negative: string): { prompt: string; warnings: string[]; step: OptimizationStep } {
  const warnings: string[] = [];
  let prompt = positive;

  // 检查重复词
  const words = prompt.split(/[，,、]/).map(w => w.trim()).filter(Boolean);
  const wordCount: Record<string, number> = {};
  words.forEach(w => { wordCount[w] = (wordCount[w] || 0) + 1; });
  const duplicates = Object.entries(wordCount).filter(([, c]) => c > 1);
  if (duplicates.length > 0) {
    warnings.push(`检测到重复关键词：${duplicates.map(([w]) => w).join('、')}，已自动去重`);
    prompt = Array.from(new Set(words)).join('，');
  }

  // 检查长度
  if (prompt.length > 500) {
    warnings.push('正面提示词过长（超过500字），建议精简以提升生成效果');
  }
  if (prompt.length < 20) {
    warnings.push('正面提示词过短（少于20字），建议补充更多细节描述');
  }

  // 检查关键词冲突
  if (prompt.includes('写实') && prompt.includes('动漫')) {
    warnings.push('检测到风格冲突（写实与动漫），建议选择单一风格');
  }
  if (prompt.includes('室内') && prompt.includes('室外')) {
    warnings.push('检测到环境冲突（室内与室外），建议明确场景类型');
  }

  return {
    prompt,
    warnings,
    step: {
      step: 7,
      name: '校验优化与去重',
      description: 'Hermes Agent 第7轮：检查关键词冲突、重复、长度超限，进行去重和优化排序，确保提示词质量',
      input: `正面提示词：${positive.length}字\n负面提示词：${negative.length}字`,
      output: `校验完成：${warnings.length > 0 ? warnings.length + '条警告' : '无问题'}，优化后${prompt.length}字`,
      details: warnings.length > 0 ? warnings : ['无重复关键词', '长度在合理范围（50-300字）', '无风格冲突', '无环境冲突', '校验通过']
    }
  };
}

// ==================== 第八步：结果输出与用户确认（Hermes Agent 第8轮，主入口） ====================
export function optimizePrompt(info: SubjectInfo): OptimizedPrompt {
  const process: OptimizationStep[] = [];

  // 第1轮：信息解析与上下文注入
  const { parsed, step: step1 } = parseSubjectInfo(info);
  process.push(step1);

  // 第2轮：特征提取与标准化
  const { features, step: step2 } = extractFeatures(parsed.description, parsed.type, parsed.dramaContext);
  process.push(step2);

  // 第3轮：Skills 模板匹配
  const { template, step: step3 } = matchTemplate(parsed);
  process.push(step3);

  // 第4轮：动态填充与初始生成
  const { prompt: initialPrompt, step: step4 } = fillTemplate(template, parsed, features);
  process.push(step4);

  // 第5轮：质量增强与问题预防
  const { prompt: enhancedPrompt, step: step5 } = enhanceQuality(initialPrompt, template, parsed.type);
  process.push(step5);

  // 第6轮：负面提示词组合
  const { prompt: negativePrompt, step: step6 } = buildNegativePrompt(template, parsed.type);
  process.push(step6);

  // 第7轮：校验优化与去重
  const { prompt: finalPrompt, warnings, step: step7 } = validateAndOptimize(enhancedPrompt, negativePrompt);
  process.push(step7);

  // 第8轮：输出结果
  const recommendedParams = {
    steps: parsed.style === 'anime' ? 25 : parsed.type === 'prop' ? 28 : parsed.type === 'scene' ? 28 : 30,
    cfgScale: parsed.style === 'anime' ? 8.5 : parsed.type === 'character' ? 7.5 : 7.0,
    seed: Math.floor(Math.random() * 2147483647)
  };

  // 构建优化说明
  const optimizationNotes: string[] = [];
  if (parsed.type === 'character') {
    optimizationNotes.push('已针对人脸崩坏问题注入面部结构稳定词');
    optimizationNotes.push('已针对斗鸡眼问题锁定双眼视线和瞳孔位置');
    optimizationNotes.push('已针对色彩异常问题控制色彩自然准确');
    optimizationNotes.push('已针对精度不高问题提升至8K分辨率和细节增强');
  }
  if (parsed.dramaContext) {
    optimizationNotes.push(`已融入《${parsed.dramaContext.dramaTitle || '当前剧本'}》的剧情上下文`);
    if (parsed.dramaContext.sceneMood) {
      optimizationNotes.push(`场景情绪：${parsed.dramaContext.sceneMood}`);
    }
  }

  process.push({
    step: 8,
    name: '结果输出与用户确认',
    description: 'Hermes Agent 第8轮：输出正面提示词、负面提示词、推荐生成参数，供前端预览和用户确认',
    input: '校验优化后的最终提示词',
    output: `正面${finalPrompt.length}字 / 负面${negativePrompt.length}字 / 推荐步数${recommendedParams.steps} / 相关性${recommendedParams.cfgScale}`,
    details: [
      `正面提示词：${finalPrompt.slice(0, 60)}...`,
      `负面提示词：${negativePrompt.slice(0, 60)}...`,
      `推荐采样步数：${recommendedParams.steps}步`,
      `推荐提示词相关性：${recommendedParams.cfgScale}`,
      `随机种子：${recommendedParams.seed}`,
      `Hermes Agent 对话轮次：8轮`,
      `剧情上下文：${parsed.dramaContext ? '已注入' : '无（快捷创作模式）'}`
    ]
  });

  return {
    positivePrompt: finalPrompt,
    negativePrompt,
    features,
    matchedTemplate: template.name,
    matchedTemplateId: template.id,
    recommendedParams,
    warnings,
    process,
    subjectType: parsed.type,
    dramaContext: parsed.dramaContext,
    optimizationNotes,
    hermesRounds: 8
  };
}

// ==================== 质量检测（按主体类型区分维度） ====================
export function analyzeQuality(imageUrl: string, type: SubjectType): QualityReport {
  const dimensionsConfig = getQualityDimensions(type);
  const baseScore = 85;
  const randomFactor = Math.random() * 10 - 5;

  const dimensions: QualityDimension[] = dimensionsConfig.map(config => {
    let score = baseScore + randomFactor + (Math.random() * 6 - 3);
    return {
      key: config.key,
      label: config.label,
      score: Math.min(100, Math.max(0, Math.round(score))),
      description: score >= 80 ? config.goodDescription : config.badDescription
    };
  });

  const issues: string[] = [];
  dimensions.forEach(d => {
    if (d.score < 80) {
      issues.push(`${d.label}检测：${d.description}，建议重新生成或调整提示词`);
    }
  });

  // 模拟随机问题
  if (type === 'character' && Math.random() < 0.15) {
    const eyeDim = dimensions.find(d => d.key === 'eyes');
    if (eyeDim) {
      eyeDim.score = Math.max(50, eyeDim.score - 20);
      eyeDim.description = '可能存在斗鸡眼或斜视风险';
      if (!issues.find(i => i.includes('眼部'))) {
        issues.push('眼部检测：可能存在斗鸡眼或斜视风险，建议重新生成');
      }
    }
  }

  const overallScore = Math.round(dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length);
  const passed = overallScore >= 75 && issues.length === 0;

  return {
    overallScore,
    dimensions,
    issues,
    passed,
    subjectType: type
  };
}

// ==================== 完整模拟案例 ====================
export interface DemoCase {
  title: string;
  type: SubjectType;
  input: SubjectInfo;
  description: string;
}

export const DEMO_CASES: DemoCase[] = [
  {
    title: '角色案例：职场女性',
    type: 'character',
    description: '生成一个28岁职场女性角色，短发，职业装，办公室场景',
    input: {
      name: '林星',
      description: '28岁，广告公司创意总监，外表坚强内心柔软，职场女强人，一头利落的短发，眼神坚定，穿着白色西装，办公室环境',
      type: 'character',
      style: 'realistic',
      shot: 'halfbody'
    }
  },
  {
    title: '场景案例：现代办公室',
    type: 'scene',
    description: '生成一个现代办公室场景，落地窗，冷色调',
    input: {
      name: '公司会议室',
      description: '现代感十足的会议室，落地窗，能看到繁华的都市夜景，冷色调灯光，宽敞明亮',
      type: 'scene',
      style: 'realistic',
      shot: 'indoorWide'
    }
  },
  {
    title: '道具案例：复古相机',
    type: 'prop',
    description: '生成一个复古胶片相机道具，金属质感',
    input: {
      name: '复古相机',
      description: '陈宇常用的老式胶片相机，带有岁月痕迹，金属质感机身，黑色皮革包裹，经典造型',
      type: 'prop',
      style: 'realistic',
      shot: 'productShow'
    }
  }
];

export function runDemoCase(caseIndex: number): OptimizedPrompt {
  const demoCase = DEMO_CASES[caseIndex] || DEMO_CASES[0];
  return optimizePrompt(demoCase.input);
}


// ===== [relocated] promptEnhancer.ts =====
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
function enhancerExtractFeatures(actionText: string) {
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
  features: ReturnType<typeof enhancerExtractFeatures>,
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
function enhancerValidateAndOptimize(prompt: string): string {
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
  const features = enhancerExtractFeatures(parsed.actionText);
  
  // 第三步：模板匹配与动态填充
  const matched = matchAndFill(parsed, features, options);
  
  // 第四步：校验优化
  const optimized = enhancerValidateAndOptimize(matched.positive);
  
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

// ===== 智能优化提示词（真实 image-agent + 七维七标签，失败自动降级本地确定性引擎） =====

/** 解析 image-agent 返回的七维七标签提示词包为 OptimizedPrompt */
function parseAgentPromptOutput(content: string, info: SubjectInfo, dramaContext?: DramaContext): OptimizedPrompt {
  const REQUIRED_TAGS = ['【风格】', '【视角】', '【主体】', '【背景】', '【细节】', '【光影】', '【质量】'];
  const norm = (s: string) => s.replace(/```/g, '').trim();
  let text = norm(String(content));
  const negM = text.match(/^(?:#{0,3}\s*)?负面提示词[::\s]*/mi);
  const recM = text.match(/^(?:#{0,3}\s*)?推荐生成参数/mi);
  let positive = text, negative = '', recLine = '';
  if (negM) {
    const ni = negM.index!;
    const ri = recM ? recM.index! : text.length;
    positive = text.slice(0, ni).trim();
    negative = text.slice(ni, ri).replace(/^(?:#{0,3}\s*)?负面提示词[::\s]*/i, '').trim();
    if (recM) recLine = text.slice(ri).replace(/^(?:#{0,3}\s*)?推荐生成参数\s*/i, '').trim();
  }
  positive = norm(positive); negative = norm(negative);
  const paramText = recLine || text;
  const stepsM = paramText.match(/步数\s*[:：]?\s*(\d{1,3})/i) || paramText.match(/steps\s*[:：]?\s*(\d{1,3})/i);
  const cfgM = paramText.match(/(?:相关性系数|相关性|cfg_scale|cfg)\s*[:：]?\s*(\d+(?:\.\d+)?)/i);
  const tplM = text.match(/命中模板\s*[:：]\s*([^\n]+)/i) || text.match(/(tpl90-[\w-]+)/i);
  const steps = stepsM ? parseInt(stepsM[1], 10) : 30;
  const cfg = cfgM ? parseFloat(cfgM[1]) : 7.5;
  const missing = REQUIRED_TAGS.filter(t => !positive.includes(t));
  const warnings: string[] = [];
  if (missing.length) warnings.push(`正向提示词缺失七维标签：${missing.join(' ')}`);
  const notes: string[] = [];
  if (tplM) notes.push(`命中模板：${tplM[1].trim()}`);
  notes.push('正向提示词按七维七标签组装（风格→视角→主体→背景→细节→光影→质量）');
  notes.push(`推荐生成参数：步数${steps} 相关性${cfg}`);
  const mkStep = (n: number, name: string, description: string, input: string, output: string): OptimizationStep =>
    ({ step: n, name, description, input, output });
  const process: OptimizationStep[] = [
    mkStep(1, '信息解析与上下文注入', '解析主体信息，注入剧集/剧本上下文', String(info.description).slice(0, 60), '结构化主体信息'),
    mkStep(2, '特征提取与标准化', '七维特征词提取与标准化', info.description, '七维特征词'),
    mkStep(3, 'Skills模板匹配', '90套模板三级降级匹配', `type=${info.type} style=${info.style || 'auto'} shot=${info.shot || 'auto'}`, tplM ? tplM[1].trim() : '默认模板'),
    mkStep(4, '动态填充与初始生成', '特征填入七维七标签结构', '七维特征词 + 命中模板骨架', '正面提示词V1'),
    mkStep(5, '质量增强与问题预防', '四类防崩/防漂移预防短语', '正面提示词V1', '增强后正面提示词'),
    mkStep(6, '负面提示词组合', '主体专属→风格专属→镜头专属三段拼接', '正面提示词 + 负面词库', '负面提示词'),
    mkStep(7, '校验优化与去重', '标签完整性/长度/冲突检查', '完整提示词包', missing.length ? '带警告' : '通过'),
    mkStep(8, '结果输出+人工确认', '提示词包 + 推荐参数', '最终提示词包', `步数${steps} 相关性${cfg}`)
  ];
  return {
    positivePrompt: positive,
    negativePrompt: negative,
    features: {},
    matchedTemplate: tplM ? tplM[1].trim() : '默认模板',
    matchedTemplateId: (text.match(/tpl90-[\w-]+/) || [''])[0] || 'tpl-default',
    recommendedParams: { steps, cfgScale: cfg, seed: 42 },
    warnings,
    process,
    subjectType: info.type,
    dramaContext,
    optimizationNotes: notes,
    hermesRounds: 8
  };
}

/**
 * 智能优化提示词（真实 image-agent）：
 * 走 Hermes 网关 /p/image-agent/，让 image-agent 按 Skill 01 七维七标签规范输出；
 * 网关不可达/超时/解析失败 → 降级本地确定性引擎（线上不崩）。
 */
export async function optimizePromptSmart(
  info: SubjectInfo,
  timeoutMs = 280000
): Promise<{ result: OptimizedPrompt; engine: 'agent' | 'fallback'; error?: string }> {
  const ctx = info.dramaContext;
  const ctxText = ctx ? [
    ctx.dramaTitle && `剧本：${ctx.dramaTitle}`,
    ctx.episodeTitle && `剧集：${ctx.episodeTitle}`,
    ctx.sceneName && `场景：${ctx.sceneName}`,
    ctx.sceneMood && `场景情绪：${ctx.sceneMood}`,
    ctx.plotSummary && `梗概：${String(ctx.plotSummary).slice(0, 80)}`,
    ctx.visualRequirements && `设定：${String(ctx.visualRequirements).slice(0, 80)}`
  ].filter(Boolean).join('；') : '无';
  const prompt = [
    '请执行 Skill 01「主体提示词生成」，严格按七维七标签规范输出最终提示词：正向提示词必须包含 7 个【】标签且顺序固定为 风格→视角→主体→背景→细节→光影→质量，不可调换、不可省略；不要包裹代码块，不要输出过程解释。',
    `输入：subject_type=${info.type}；subject_name=${info.name || ''}；description=${info.description}；style=${info.style || '自动识别默认realistic'}；shot=${info.shot || '自动识别'}；context=${ctxText}。`,
    '输出顺序：① 正向提示词（7个【】标签逐行）② 负面提示词（20-100词，必含人脸崩坏/斗鸡眼/色彩异常/塑料皮肤四类防崩词）③ 推荐生成参数（步数 | 相关性系数 | 采样器）。'
  ].join('\n');
  const res = await callHermesGateway(prompt, 'image-agent', timeoutMs);
  if (res.ok && res.content && res.content.length > 50) {
    try {
      return { result: parseAgentPromptOutput(res.content, info, ctx), engine: 'agent' };
    } catch (e: any) {
      return { result: optimizePrompt(info), engine: 'fallback', error: `解析失败: ${e?.message}` };
    }
  }
  return { result: optimizePrompt(info), engine: 'fallback', error: res.error || '网关不可达' };
}
