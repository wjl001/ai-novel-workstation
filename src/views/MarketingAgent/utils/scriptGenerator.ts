/**
 * 营销脚本生成引擎
 * 仿照小云雀营销Agent：智能意图解析 → 多风格并行生成 → 分镜拆解
 */

import type { ProductInfo, MarketingScript, StoryboardShot } from '../../../store/marketing';
import type { MarketingTemplate } from '../data/templates';
import type { PlatformConfig } from '../data/platforms';
import type { ScriptStyle } from '../data/styles';
import type { HookItem } from '../data/hooks';
import { HOOK_LIBRARY } from '../data/hooks';

// ===== 工具函数 =====
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateId(): string {
  return `script_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function fillHookTemplate(template: string, product: ProductInfo): string {
  const painPoint = product.sellingPoints[0] ? `没有${product.sellingPoints[0]}` : '效果不好';
  const cost = product.originalPrice || '几百块';
  const wrongWay = '盲目跟风买';
  const scene = product.category || '日常';
  const days = Math.floor(Math.random() * 20) + 3;
  const category = product.category || '这类产品';
  const advantage = product.sellingPoints[0] || '效果好';
  const disadvantage = '花冤枉钱';
  const lowPrice = product.price || '几十块';
  const highPrice = product.originalPrice || '几百块';
  const productName = product.name || '这款产品';
  const lifeAspect = product.category || '生活';
  const object = '爸妈/对象/朋友';
  const professional = '资深买手/行业专家';
  const num = Math.floor(Math.random() * 5) + 3;
  const sales = (Math.random() * 50 + 10).toFixed(1);
  const repurchase = (Math.random() * 30 + 50).toFixed(0);
  const time = '3个月';
  const item = product.category || '日用品';

  return template
    .replace('{痛点}', painPoint)
    .replace('{代价}', cost)
    .replace('{错误做法}', wrongWay)
    .replace('{场景}', scene)
    .replace('{天数}', String(days))
    .replace('{品类}', category)
    .replace('{优势}', advantage)
    .replace('{劣势}', disadvantage)
    .replace('{低价}', lowPrice)
    .replace('{高价}', highPrice)
    .replace('{产品}', productName)
    .replace('{生活方面}', lifeAspect)
    .replace('{对象}', object)
    .replace('{专业身份}', professional)
    .replace('{数字}', String(num))
    .replace('{数量}', String(Math.floor(Math.random() * 10) + 1))
    .replace('{价格}', product.price || 'XX元')
    .replace('{折扣}', `${Math.floor(Math.random() * 3) + 3}折`)
    .replace('{效果描述}', product.sellingPoints[0] || '效果立竿见影')
    .replace('{时间段}', pickRandom(['早上', '下午', '加班', '午休']))
    .replace('{麻烦事}', '手忙脚乱')
    .replace('{物品}', item)
    .replace('{时间}', time)
    .replace('{销量}', sales)
    .replace('{复购率}', `${repurchase}%`);
}

// ===== 分镜生成 =====
function generateStoryboard(
  product: ProductInfo,
  style: ScriptStyle,
  template: MarketingTemplate,
  platform: PlatformConfig,
  hook: string
): StoryboardShot[] {
  const shots: StoryboardShot[] = [];
  const totalDuration = platform.duration.recommended;
  const structure = template.scriptStructure;
  const shotDuration = Math.max(2, Math.floor(totalDuration / structure.length));

  const cameraAngles = ['特写', '中景', '全景', '近景', '过肩镜头', '俯拍', '仰拍', '跟拍', '环绕镜头'];
  const transitions = ['硬切', '淡入淡出', '缩放转场', '滑动转场', '旋转转场'];

  structure.forEach((step, idx) => {
    let visual = '';
    let audio = '';
    let textOverlay = '';

    if (idx === 0) {
      // 开场钩子
      visual = `${pickRandom(['快切 montage', '产品特写', '人物反应镜头', '悬念画面'])}，${hook.slice(0, 20)}...`;
      audio = `(音效：${pickRandom(['急促鼓点', '悬念音效', '清脆叮声', '倒吸一口气'])}) ${hook}`;
      textOverlay = hook.length > 20 ? hook.slice(0, 18) + '...' : hook;
    } else if (idx === structure.length - 1) {
      // CTA结尾
      visual = `产品全景+品牌Logo，${pickRandom(['价格标签弹出', '二维码/链接展示', '购物车动画', '点赞关注引导'])}`;
      audio = `${style.ctaStyle}！${pickRandom(['现在下单立享优惠', '评论区扣1获取专属福利', '关注我了解更多好物'])}`;
      textOverlay = `${product.price ? product.price + ' 限时抢' : '立即购买'}`;
    } else if (step.includes('卖点') || step.includes('功能') || step.includes('演示')) {
      const sp = product.sellingPoints[Math.min(idx - 1, product.sellingPoints.length - 1)] || '核心优势';
      visual = `${pickRandom(cameraAngles)}展示${sp}，${pickRandom(['使用过程演示', '效果对比', '细节微距', '拆解展示'])}`;
      audio = `第${idx}个亮点：${sp}。${pickRandom(['实测真的有用', '这一点太戳我了', '细节决定品质'])}`;
      textOverlay = `亮点${idx}：${sp.slice(0, 12)}`;
    } else if (step.includes('价格') || step.includes('福利')) {
      visual = `价格对比动画，${product.originalPrice ? `${product.originalPrice} → ${product.price}` : '超值价格'}，${pickRandom(['倒计时', '库存条', '满减标签'])}`;
      audio = `原价${product.originalPrice || 'XXX'}，今天只要${product.price || 'XX'}！${pickRandom(['前100名再送赠品', '满两件再打8折', '限时24小时'])}`;
      textOverlay = `${product.price || 'XX元'} ${product.originalPrice ? '(' + product.originalPrice + ')' : ''}`;
    } else if (step.includes('品牌') || step.includes('故事') || step.includes('情感')) {
      visual = `${pickRandom(['暖光生活场景', '品牌工坊', '人物使用场景', '日出/黄昏氛围'])}，${product.brand || product.name}融入生活`;
      audio = `${pickRandom(['好的产品值得被看见', '生活需要一点仪式感', '用心做好每一个细节'])}，${product.brand || product.name}懂你所需。`;
      textOverlay = product.brand || product.name;
    } else {
      visual = `${pickRandom(cameraAngles)}，${product.name}${pickRandom(['使用场景', '外观展示', '包装开箱', '效果呈现'])}`;
      audio = `${step}：${product.description || product.name}，${pickRandom(['品质看得见', '用过就回不去了', '真心推荐'])}`;
      textOverlay = step;
    }

    shots.push({
      id: idx + 1,
      duration: `${shotDuration}s`,
      scene: step,
      visual,
      audio,
      textOverlay,
      camera: pickRandom(cameraAngles),
      bgm: pickRandom(['动感电子', '轻快流行', '温暖钢琴', '紧张鼓点', '清新民谣', '科技感纯音乐'])
    });
  });

  return shots;
}

// ===== 单条脚本生成 =====
function generateSingleScript(
  product: ProductInfo,
  style: ScriptStyle,
  template: MarketingTemplate,
  platform: PlatformConfig,
  hookText: string
): MarketingScript {
  const title = `${style.emoji} ${style.name}｜${product.name || '产品'}${pickRandom(['爆款脚本', '种草方案', '营销文案', '带货视频'])}`;

  // 正文段落
  const body: string[] = [];
  const spCount = Math.min(product.sellingPoints.length, 3);
  for (let i = 0; i < spCount; i++) {
    const sp = product.sellingPoints[i];
    const templates = [
      `说到${sp}，这款${product.name}真的做到了极致。${pickRandom(['实测下来', '用了一段时间', '对比了好几款', '深入了解后'])}，${pickRandom(['效果超出预期', '细节非常到位', '性价比很高', '体验感拉满'])}。`,
      `第${i + 1}个必须说的点就是${sp}。${product.description || '它'}在这方面下足了功夫，${pickRandom(['用过的都懂', '新手也能轻松上手', '效果肉眼可见', '完全不输大牌'])}。`,
      `很多人问我${product.category || '这类产品'}怎么选，我的答案是——认准${sp}。${product.name}在这一点上${pickRandom(['几乎没有对手', '做到了同价位最优', '给了我惊喜', '诚意满满'])}。`
    ];
    body.push(pickRandom(templates));
  }

  if (body.length === 0) {
    body.push(`${product.name}是一款${product.category || '非常值得入手'}的产品。${product.description || '品质优秀，体验出色。'}`);
  }

  // 话题标签
  const baseTags = [product.category, product.name, style.name.replace('型', '')].filter(Boolean);
  const platformTags: Record<string, string[]> = {
    douyin: ['#好物推荐', '#种草', '#抖音好物', '#爆款'],
    xiaohongshu: ['#好物分享', '#种草笔记', '#测评', '#宝藏好物'],
    shipinhao: ['#好物推荐', '#生活好物', '#实用分享'],
    taobao: ['#主图视频', '#好物推荐'],
    bilibili: ['#测评', '#好物分享', '#开箱', '#种草'],
    kuaishou: ['#好物推荐', '#性价比', '#老铁好物']
  };
  const hashtags = [...new Set([...baseTags.map(t => `#${t}`), ...(platformTags[platform.id] || [])])].slice(0, platform.hashtagsCount || 5);

  // 文案
  const caption = `${hookText}\n\n${body.join('\n\n')}\n\n${style.ctaStyle}\n${hashtags.join(' ')}`.slice(0, platform.captionLimit);

  // 分镜
  const storyboard = generateStoryboard(product, style, template, platform, hookText);

  return {
    id: generateId(),
    styleId: style.id,
    styleName: style.name,
    styleEmoji: style.emoji,
    styleColor: style.color,
    title,
    hook: hookText,
    body,
    cta: style.ctaStyle,
    hashtags,
    caption,
    storyboard,
    estimatedDuration: platform.duration.recommended,
    createdAt: Date.now(),
    status: 'completed',
    selected: false
  };
}

// ===== 对外API：批量生成 =====
export async function generateMarketingScripts(
  product: ProductInfo,
  styles: ScriptStyle[],
  template: MarketingTemplate,
  platforms: PlatformConfig[],
  hook: HookItem | undefined,
  customHook: string,
  onProgress?: (current: number, total: number, styleName: string) => void
): Promise<MarketingScript[]> {
  const results: MarketingScript[] = [];
  const primaryPlatform = platforms[0];
  const total = styles.length;

  for (let i = 0; i < styles.length; i++) {
    const style = styles[i];

    // 确定Hook文本
    let hookText = customHook.trim();
    if (!hookText && hook) {
      hookText = fillHookTemplate(hook.template, product);
    }
    if (!hookText) {
      // 根据风格自动选hook
      const preferredHooks = ['suspense-001', 'contrast-002', 'story-001', 'welfare-001'];
      const hookMap: Record<string, string> = {
        'style-suspense': 'suspense-001',
        'style-review': 'contrast-002',
        'style-emotion': 'story-001',
        'style-promo': 'welfare-001'
      };
      const hookId = hookMap[style.id] || pickRandom(preferredHooks);
      const defaultHook = HOOK_LIBRARY.find(h => h.id === hookId);
      hookText = defaultHook ? fillHookTemplate(defaultHook.template, product) : '你绝对想不到这款产品有多好用！';
    }

    // 模拟AI生成延迟
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 600));

    const script = generateSingleScript(product, style, template, primaryPlatform, hookText);
    results.push(script);

    if (onProgress) {
      onProgress(i + 1, total, style.name);
    }
  }

  return results;
}

// ===== 导出文案 =====
export function exportScriptAsText(script: MarketingScript): string {
  const lines = [
    `【标题】${script.title}`,
    `【风格】${script.styleEmoji} ${script.styleName}`,
    `【预估时长】${script.estimatedDuration}秒`,
    '',
    '【开场钩子】',
    script.hook,
    '',
    '【正文】',
    ...script.body.map((p: string, i: number) => `${i + 1}. ${p}`),
    '',
    '【行动号召】',
    script.cta,
    '',
    '【话题标签】',
    script.hashtags.join(' '),
    '',
    '【发布文案】',
    script.caption,
    '',
    '【分镜脚本】',
    ...script.storyboard.map((s: StoryboardShot) =>
      `\n镜头${s.id}（${s.duration}）｜${s.scene}\n` +
      `  画面：${s.visual}\n` +
      `  音频：${s.audio}\n` +
      `  字幕：${s.textOverlay}\n` +
      `  运镜：${s.camera}｜BGM：${s.bgm}`
    )
  ];
  return lines.join('\n');
}

// ===== 批量导出 =====
export function exportAllScripts(scripts: MarketingScript[]): string {
  return scripts.map((s, i) =>
    `========== 方案 ${i + 1} / ${scripts.length} ==========\n${exportScriptAsText(s)}`
  ).join('\n\n\n');
}
