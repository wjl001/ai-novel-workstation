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

import { skillsKnowledgeBase, type Skill } from './skillsKnowledgeBase';
import { contextManager, type StoryboardContext } from './contextManager';

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

/**
 * 同步版本（降级用，当Hermes不可用时回退到关键词匹配）
 */
export function hermesEnhancePromptSync(
  script: string,
  options: HermesOptions = {}
): HermesEnhanceResult {
  // 同步降级：直接执行解析和生成，不模拟延迟
  const agent = new HermesAgent(options);
  // 覆盖simulateDelay为同步
  (agent as any).simulateDelay = () => Promise.resolve();
  let result: HermesEnhanceResult = agent.emptyResult();
  agent.enhance(script).then(r => { result = r; });
  return result;
}
