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
