/**
 * 多平台适配配置 —— 仿照小云雀一次生成、多端分发
 */

export interface PlatformConfig {
  id: string;
  name: string;
  icon: string;
  ratio: string;
  width: number;
  height: number;
  duration: { min: number; max: number; recommended: number };
  subtitleStyle: string;
  captionLimit: number;
  hashtagsCount: number;
  features: string[];
  color: string;
}

export const PLATFORM_CONFIGS: PlatformConfig[] = [
  {
    id: 'douyin',
    name: '抖音',
    icon: '🎵',
    ratio: '9:16',
    width: 1080,
    height: 1920,
    duration: { min: 15, max: 60, recommended: 30 },
    subtitleStyle: '底部居中，大号粗体，描边+阴影',
    captionLimit: 55,
    hashtagsCount: 5,
    features: ['黄金3秒钩子', '热门BGM', '话题挑战赛', 'DOU+投放'],
    color: '#000000'
  },
  {
    id: 'xiaohongshu',
    name: '小红书',
    icon: '📕',
    ratio: '3:4',
    width: 1080,
    height: 1440,
    duration: { min: 30, max: 90, recommended: 45 },
    subtitleStyle: '顶部/底部，清新字体，柔和配色',
    captionLimit: 1000,
    hashtagsCount: 10,
    features: ['种草笔记风', '封面大字报', '合集标签', '店铺挂载'],
    color: '#ff2442'
  },
  {
    id: 'shipinhao',
    name: '视频号',
    icon: '💚',
    ratio: '9:16',
    width: 1080,
    height: 1920,
    duration: { min: 15, max: 60, recommended: 30 },
    subtitleStyle: '底部居中，清晰易读，微信生态适配',
    captionLimit: 1000,
    hashtagsCount: 3,
    features: ['社交裂变', '公众号联动', '直播预约', '私域导流'],
    color: '#07c160'
  },
  {
    id: 'taobao',
    name: '淘宝/天猫',
    icon: '🛒',
    ratio: '1:1',
    width: 1080,
    height: 1080,
    duration: { min: 15, max: 30, recommended: 20 },
    subtitleStyle: '卖点标签化，价格突出，行动按钮',
    captionLimit: 150,
    hashtagsCount: 0,
    features: ['主图视频', '详情页联动', '直播切片', '猜你喜欢'],
    color: '#ff5000'
  },
  {
    id: 'bilibili',
    name: 'B站',
    icon: '📺',
    ratio: '16:9',
    width: 1920,
    height: 1080,
    duration: { min: 60, max: 300, recommended: 120 },
    subtitleStyle: '底部居中，弹幕友好，二次元风格可选',
    captionLimit: 2000,
    hashtagsCount: 10,
    features: ['长视频深度', '弹幕互动', '分区标签', '充电计划'],
    color: '#fb7299'
  },
  {
    id: 'kuaishou',
    name: '快手',
    icon: '⚡',
    ratio: '9:16',
    width: 1080,
    height: 1920,
    duration: { min: 15, max: 60, recommended: 27 },
    subtitleStyle: '底部居中，接地气，老铁文化',
    captionLimit: 200,
    hashtagsCount: 5,
    features: ['老铁经济', '直播带货', '本地生活', '信任电商'],
    color: '#ff4906'
  }
];
