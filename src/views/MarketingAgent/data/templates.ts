/**
 * 营销场景模板库 —— 仿照小云雀全场景模板覆盖
 * 每个模板包含：场景定义、脚本结构、风格关键词、适用品类
 */

export interface MarketingTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  categories: string[];
  scriptStructure: string[];
  styleKeywords: string[];
  avgDuration: string;
  ctaType: string;
  color: string;
}

export const MARKETING_TEMPLATES: MarketingTemplate[] = [
  {
    id: 'tpl-promo',
    name: '电商促销',
    icon: '🔥',
    description: '限时优惠、价格锚点、紧迫感拉满，直接驱动转化',
    categories: ['全品类', '服饰', '食品', '家居', '美妆'],
    scriptStructure: ['痛点开场', '产品亮相', '核心卖点×3', '价格冲击', '限时福利', '行动号召'],
    styleKeywords: ['快节奏', '高饱和', '大字报', '动感转场', '促销音效'],
    avgDuration: '15-30s',
    ctaType: '立即下单',
    color: '#ef4444'
  },
  {
    id: 'tpl-brand',
    name: '品牌宣讲',
    icon: '🏆',
    description: '品牌故事、理念传递、质感画面，建立品牌认知与信任',
    categories: ['高端品牌', '数码', '汽车', '奢侈品'],
    scriptStructure: ['品牌愿景', '匠心工艺', '产品美学', '用户证言', '品牌升华'],
    styleKeywords: ['电影感', '慢镜头', '高级灰', '品牌音乐', '旁白叙事'],
    avgDuration: '30-60s',
    ctaType: '了解更多',
    color: '#6366f1'
  },
  {
    id: 'tpl-holiday',
    name: '节日营销',
    icon: '🎉',
    description: '借势节日氛围，情感共鸣+节日限定，提升品牌温度',
    categories: ['礼品', '食品', '美妆', '服饰', '全品类'],
    scriptStructure: ['节日场景', '情感共鸣', '产品融入', '节日限定', '祝福收尾'],
    styleKeywords: ['节日氛围', '暖色调', '家庭温情', '礼盒特写', '祝福音乐'],
    avgDuration: '20-45s',
    ctaType: '节日礼遇',
    color: '#f59e0b'
  },
  {
    id: 'tpl-product',
    name: '产品讲解',
    icon: '📦',
    description: '功能拆解、使用演示、细节特写，让用户秒懂产品价值',
    categories: ['数码', '家电', '工具', '智能设备'],
    scriptStructure: ['问题引入', '产品登场', '功能演示×3', '细节特写', '效果展示', '总结推荐'],
    styleKeywords: ['科技感', '特写镜头', '信息图', '演示节奏', '清晰旁白'],
    avgDuration: '30-60s',
    ctaType: '查看详情',
    color: '#3b82f6'
  },
  {
    id: 'tpl-digital-human',
    name: '数字人口播',
    icon: '🎙️',
    description: '数字人主播口播带货，24小时不间断，专业感强',
    categories: ['全品类', '知识付费', '课程', '服务'],
    scriptStructure: ['主播问候', '痛点提问', '产品介绍', '卖点罗列', '优惠信息', '引导下单'],
    styleKeywords: ['数字人', '口播节奏', '字幕强调', '产品贴片', '直播间氛围'],
    avgDuration: '30-90s',
    ctaType: '点击购买',
    color: '#8b5cf6'
  },
  {
    id: 'tpl-unboxing',
    name: '开箱测评',
    icon: '📷',
    description: '真实开箱、上手体验、优缺点客观呈现，种草力强',
    categories: ['数码', '美妆', '潮玩', '服饰', '食品'],
    scriptStructure: ['期待开场', '开箱过程', '外观展示', '上手体验', '优缺点总结', '购买建议'],
    styleKeywords: ['真实感', '第一视角', '细节微距', '测评话术', '轻松BGM'],
    avgDuration: '45-90s',
    ctaType: '同款链接',
    color: '#10b981'
  },
  {
    id: 'tpl-emotion',
    name: '情感共鸣',
    icon: '💝',
    description: '故事化叙事、情感触动，让产品成为情感载体',
    categories: ['礼品', '母婴', '家居', '珠宝', '服饰'],
    scriptStructure: ['生活场景', '情感冲突', '产品出现', '情感转折', '温暖收尾'],
    styleKeywords: ['电影质感', '柔光', '生活流', '钢琴BGM', '留白叙事'],
    avgDuration: '30-60s',
    ctaType: '传递心意',
    color: '#ec4899'
  },
  {
    id: 'tpl-knowledge',
    name: '知识科普',
    icon: '📚',
    description: '干货输出、专业背书，建立权威认知后自然种草',
    categories: ['母婴', '健康', '护肤', '食品', '教育'],
    scriptStructure: ['知识提问', '误区纠正', '原理讲解', '产品方案', '行动建议'],
    styleKeywords: ['信息图', '专业旁白', '数据可视化', '实验室感', '理性节奏'],
    avgDuration: '30-60s',
    ctaType: '收藏关注',
    color: '#14b8a6'
  }
];
