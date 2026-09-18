/**
 * 营销脚本风格预设 —— 多风格并行生成
 * 仿照小云雀"单次指令自动生成多条不同风格脚本"
 */

export interface ScriptStyle {
  id: string;
  name: string;
  description: string;
  tone: string;
  pace: string;
  hookPreference: string[];
  ctaStyle: string;
  color: string;
  emoji: string;
}

export const SCRIPT_STYLES: ScriptStyle[] = [
  {
    id: 'style-suspense',
    name: '悬念种草',
    description: '制造好奇与期待，反转结尾揭示产品，适合新品首发',
    tone: '神秘、好奇、引人入胜',
    pace: '中速，节奏递进',
    hookPreference: ['suspense', 'question'],
    ctaStyle: '想知道答案？点击下方链接',
    color: '#8b5cf6',
    emoji: '🔮'
  },
  {
    id: 'style-review',
    name: '硬核测评',
    description: '客观数据+真实体验，优缺点全说，建立信任后种草',
    tone: '专业、客观、有说服力',
    pace: '中速，信息密度高',
    hookPreference: ['contrast', 'authority', 'question'],
    ctaStyle: '综合评分X.X，值得入手',
    color: '#3b82f6',
    emoji: '🔬'
  },
  {
    id: 'style-emotion',
    name: '情感共鸣',
    description: '故事化叙事，触动用户情感，产品自然融入生活场景',
    tone: '温暖、走心、有代入感',
    pace: '慢速，情感铺垫充分',
    hookPreference: ['story', 'scene', 'pain'],
    ctaStyle: '给爱的人一份心意',
    color: '#ec4899',
    emoji: '💝'
  },
  {
    id: 'style-promo',
    name: '福利促销',
    description: '价格冲击+限时紧迫，直接驱动下单转化，适合大促',
    tone: '亢奋、紧迫、有感染力',
    pace: '快速，节奏感强',
    hookPreference: ['welfare', 'contrast'],
    ctaStyle: '限时XX元，手慢无！',
    color: '#ef4444',
    emoji: '🔥'
  }
];
