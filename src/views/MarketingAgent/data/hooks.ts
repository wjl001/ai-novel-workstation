/**
 * 爆款 Hook 库 —— 仿照小云雀营销Agent的开场钩子体系
 * 按类型分类，每条包含钩子模板、适用场景、情绪标签
 */

export interface HookItem {
  id: string;
  type: 'pain' | 'suspense' | 'contrast' | 'welfare' | 'story' | 'authority' | 'scene' | 'question';
  typeLabel: string;
  template: string;
  scenario: string;
  emotion: string;
  heat: number; // 热度 0-100
  usage: number; // 使用次数
}

export const HOOK_LIBRARY: HookItem[] = [
  // ===== 痛点型 =====
  {
    id: 'pain-001',
    type: 'pain',
    typeLabel: '痛点型',
    template: '你是不是也遇到过{痛点}？花了{代价}还是没解决？',
    scenario: '美妆、护肤、家居清洁、健康产品',
    emotion: '共鸣、焦虑',
    heat: 92,
    usage: 12800
  },
  {
    id: 'pain-002',
    type: 'pain',
    typeLabel: '痛点型',
    template: '别再{错误做法}了！90%的人都在踩这个坑。',
    scenario: '知识付费、健身、理财、育儿',
    emotion: '警示、紧迫',
    heat: 88,
    usage: 9600
  },
  {
    id: 'pain-003',
    type: 'pain',
    typeLabel: '痛点型',
    template: '每次{场景}都很尴尬？这个问题终于有解了。',
    scenario: '个护、服饰、社交场景产品',
    emotion: '尴尬、释然',
    heat: 85,
    usage: 7200
  },
  // ===== 悬念型 =====
  {
    id: 'suspense-001',
    type: 'suspense',
    typeLabel: '悬念型',
    template: '我敢打赌，你绝对想不到{产品}还能这样用！',
    scenario: '创意好物、多功能产品、DIY教程',
    emotion: '好奇、惊喜',
    heat: 95,
    usage: 15600
  },
  {
    id: 'suspense-002',
    type: 'suspense',
    typeLabel: '悬念型',
    template: '用了{天数}天，我发现了一个惊人的秘密……',
    scenario: '护肤、保健品、效果类产品',
    emotion: '期待、探秘',
    heat: 90,
    usage: 11200
  },
  {
    id: 'suspense-003',
    type: 'suspense',
    typeLabel: '悬念型',
    template: '最后3秒才是重点！千万别划走。',
    scenario: '所有品类通用，配合反转结尾',
    emotion: '紧张、期待',
    heat: 87,
    usage: 8900
  },
  // ===== 对比型 =====
  {
    id: 'contrast-001',
    type: 'contrast',
    typeLabel: '对比型',
    template: '同样是{品类}，为什么别人{优势}而你{劣势}？',
    scenario: '美妆、服饰、数码、食品',
    emotion: '对比、反思',
    heat: 89,
    usage: 10100
  },
  {
    id: 'contrast-002',
    type: 'contrast',
    typeLabel: '对比型',
    template: '{低价} vs {高价}，实测结果让我震惊了。',
    scenario: '测评类、性价比产品',
    emotion: '惊讶、信服',
    heat: 93,
    usage: 13400
  },
  {
    id: 'contrast-003',
    type: 'contrast',
    typeLabel: '对比型',
    template: '用之前 vs 用之后，这变化也太离谱了！',
    scenario: '效果可视化产品（美白、清洁、收纳）',
    emotion: '震撼、信服',
    heat: 91,
    usage: 11800
  },
  // ===== 福利型 =====
  {
    id: 'welfare-001',
    type: 'welfare',
    typeLabel: '福利型',
    template: '今天直播间{价格}带走{数量}件，手慢无！',
    scenario: '直播带货、限时促销',
    emotion: '兴奋、紧迫',
    heat: 94,
    usage: 14500
  },
  {
    id: 'welfare-002',
    type: 'welfare',
    typeLabel: '福利型',
    template: '老板不在家，全场{折扣}，错过等一年！',
    scenario: '大促节点、清仓活动',
    emotion: '占便宜、紧迫',
    heat: 86,
    usage: 8200
  },
  {
    id: 'welfare-003',
    type: 'welfare',
    typeLabel: '福利型',
    template: '评论区扣1，抽{数量}位免费送{产品}！',
    scenario: '互动涨粉、新品推广',
    emotion: '期待、参与',
    heat: 84,
    usage: 6800
  },
  // ===== 故事型 =====
  {
    id: 'story-001',
    type: 'story',
    typeLabel: '故事型',
    template: '自从用了{产品}，我的{生活方面}彻底变了。',
    scenario: '生活方式、家居、个护',
    emotion: '温暖、向往',
    heat: 82,
    usage: 5600
  },
  {
    id: 'story-002',
    type: 'story',
    typeLabel: '故事型',
    template: '给{对象}买了这个，她/他的反应让我没想到。',
    scenario: '礼品、情感向产品',
    emotion: '感动、惊喜',
    heat: 88,
    usage: 9100
  },
  // ===== 权威型 =====
  {
    id: 'authority-001',
    type: 'authority',
    typeLabel: '权威型',
    template: '{专业身份}推荐：选{品类}认准这{数字}个标准。',
    scenario: '母婴、健康、数码、食品',
    emotion: '信任、专业',
    heat: 87,
    usage: 7800
  },
  {
    id: 'authority-002',
    type: 'authority',
    typeLabel: '权威型',
    template: '销量{数字}万+，复购率{百分比}，这款{产品}凭什么？',
    scenario: '爆款产品、口碑好物',
    emotion: '信服、好奇',
    heat: 90,
    usage: 10500
  },
  // ===== 场景型 =====
  {
    id: 'scene-001',
    type: 'scene',
    typeLabel: '场景型',
    template: '{场景}必备！有了它再也不用{麻烦事}了。',
    scenario: '旅行、办公、户外、厨房',
    emotion: '便利、向往',
    heat: 85,
    usage: 6900
  },
  {
    id: 'scene-002',
    type: 'scene',
    typeLabel: '场景型',
    template: '打工人的{时间段}续命神器，{效果描述}。',
    scenario: '办公、咖啡、提神、午休',
    emotion: '共鸣、治愈',
    heat: 83,
    usage: 5400
  },
  // ===== 提问型 =====
  {
    id: 'question-001',
    type: 'question',
    typeLabel: '提问型',
    template: '{数字}块钱和{数字}块钱的{品类}，到底差在哪？',
    scenario: '测评、性价比、成分党',
    emotion: '好奇、理性',
    heat: 89,
    usage: 9800
  },
  {
    id: 'question-002',
    type: 'question',
    typeLabel: '提问型',
    template: '你家的{物品}多久没换了？专家说超过{时间}必须扔！',
    scenario: '家居、个护、健康提醒',
    emotion: '警觉、紧迫',
    heat: 86,
    usage: 7500
  }
];

export const HOOK_TYPES = [
  { value: 'all', label: '全部', color: '#6366f1' },
  { value: 'pain', label: '痛点型', color: '#ef4444' },
  { value: 'suspense', label: '悬念型', color: '#8b5cf6' },
  { value: 'contrast', label: '对比型', color: '#f59e0b' },
  { value: 'welfare', label: '福利型', color: '#10b981' },
  { value: 'story', label: '故事型', color: '#ec4899' },
  { value: 'authority', label: '权威型', color: '#3b82f6' },
  { value: 'scene', label: '场景型', color: '#14b8a6' },
  { value: 'question', label: '提问型', color: '#f97316' }
];
