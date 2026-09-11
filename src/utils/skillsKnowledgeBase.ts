/**
 * Skills 知识库
 * 基于《视频生成 Prompt 智能增强系统产品解决方案》第七章
 *
 * 与原方案"硬编码关键词匹配模板"的本质区别：
 * - Skills是可被Hermes理解的专业知识文档，不是固定输出模板
 * - Hermes通过语义检索自动匹配，不是关键词精确匹配
 * - 支持多Skills组合调用，灵活适配长尾场景
 */

import type { StoryboardContext } from './contextManager';

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
