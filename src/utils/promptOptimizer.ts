/**
 * 提示词智能组装引擎
 * 基于产品方案「提示词优化方案设计」实现的前端提示词优化工具
 * 八步流程：信息解析 → 特征提取 → 模板匹配 → 动态填充 → 质量增强 → 负面词组合 → 校验优化 → 输出结果
 * 支持角色/场景/道具三种主体类型，各类型有独立的镜头选项、质量维度和模板库
 */

// ==================== 类型定义 ====================
export type SubjectType = 'character' | 'scene' | 'prop';
export type StyleType = 'realistic' | 'guofeng' | 'anime';

// 镜头类型：角色/场景/道具各有独立选项
export type CharacterShot = 'closeup' | 'halfbody' | 'fullbody' | 'wide';
export type SceneShot = 'indoorWide' | 'outdoorPanorama' | 'mediumShot' | 'detailCloseup';
export type PropShot = 'macroCloseup' | 'productShow' | 'sceneIntegration' | 'detailTexture';
export type ShotType = CharacterShot | SceneShot | PropShot;

export interface SubjectInfo {
  name: string;
  description: string;
  type: SubjectType;
  referenceImage?: string;
  style?: StyleType;
  shot?: ShotType;
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

// ==================== 第一步：信息解析 ====================
export function parseSubjectInfo(info: SubjectInfo): { parsed: SubjectInfo; step: OptimizationStep } {
  const parsed: SubjectInfo = {
    ...info,
    name: (info.name || '').trim(),
    description: (info.description || '').trim(),
    style: info.style || 'realistic',
    shot: info.shot || getDefaultShot(info.type)
  };

  const typeLabel = info.type === 'character' ? '角色' : info.type === 'scene' ? '场景' : '道具';
  const styleLabel = getStyleLabel(parsed.style as StyleType);
  const shotLabel = getShotLabel(info.type, parsed.shot as ShotType);

  return {
    parsed,
    step: {
      step: 1,
      name: '信息解析',
      description: '解析用户填写的主体名称、描述、参考图、风格偏好、镜头类型等信息',
      input: `主体名称：${info.name || '（未填写）'}\n主体描述：${info.description || '（未填写）'}\n主体类型：${typeLabel}\n风格偏好：${info.style ? styleLabel : '（未选择，默认写实）'}\n镜头类型：${info.shot ? shotLabel : '（未选择，默认）'}`,
      output: `解析完成：${typeLabel}「${parsed.name}」，风格=${styleLabel}，镜头=${shotLabel}`,
      details: [
        `主体类型：${typeLabel}`,
        `名称长度：${parsed.name.length}字`,
        `描述长度：${parsed.description.length}字`,
        `是否有参考图：${info.referenceImage ? '是' : '否'}`
      ]
    }
  };
}

function getDefaultShot(type: SubjectType): ShotType {
  if (type === 'character') return 'halfbody';
  if (type === 'scene') return 'indoorWide';
  return 'productShow';
}

// ==================== 第二步：特征提取 ====================
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

export function extractFeatures(description: string, type: SubjectType): { features: ExtractedFeatures; step: OptimizationStep } {
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

  const typeLabel = type === 'character' ? '角色' : type === 'scene' ? '场景' : '道具';
  return {
    features,
    step: {
      step: 2,
      name: '特征提取',
      description: `从描述文本中提取${typeLabel}特征`,
      input: `原始描述：${desc || '（空）'}`,
      output: `提取到 ${Object.keys(features).length} 个特征：${extracted.join('、') || '（无明确特征，使用默认）'}`,
      details: extracted.length > 0 ? extracted : ['未提取到明确特征，将使用通用默认值']
    }
  };
}

// ==================== 第三步：模板匹配 ====================
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
      name: '模板匹配',
      description: '根据主体类型+风格+镜头等标签，从模板库中匹配最佳模板',
      input: `匹配条件：类型=${typeLabel}，风格=${styleLabel}，镜头=${shotLabel}`,
      output: `匹配结果：${(matched || fallback).name}（${matchLevel}）`,
      details: [
        `模板库总数：${TEMPLATE_LIBRARY.length}套`,
        `角色模板：${TEMPLATE_LIBRARY.filter(t => t.type === 'character').length}套`,
        `场景模板：${TEMPLATE_LIBRARY.filter(t => t.type === 'scene').length}套`,
        `道具模板：${TEMPLATE_LIBRARY.filter(t => t.type === 'prop').length}套`,
        `匹配层级：${matchLevel}`
      ]
    }
  };
}

// ==================== 第四步：动态填充 ====================
export function fillTemplate(template: PromptTemplate, info: SubjectInfo, features: ExtractedFeatures): { prompt: string; step: OptimizationStep } {
  const { name, description, type } = info;
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

  return {
    prompt,
    step: {
      step: 4,
      name: '动态填充',
      description: '将提取的特征填入模板占位符，生成初始正面提示词',
      input: `模板：${template.name}\n特征：${featureParts.join('、') || '（默认）'}`,
      output: `初始提示词（${prompt.length}字）：${prompt.slice(0, 80)}${prompt.length > 80 ? '...' : ''}`,
      details: [
        `主体描述层：${subjectDesc}`,
        `特征锁定层：${featureLock}`,
        `构图视角层：${template.structure[2] || '（模板默认）'}`,
        `填充后总长度：${prompt.length}字`
      ]
    }
  };
}

// ==================== 第五步：质量增强 ====================
export function enhanceQuality(prompt: string, template: PromptTemplate, type: SubjectType): { prompt: string; step: OptimizationStep } {
  const qualityWords = template.qualityWords.join('，');
  const enhanced = `${prompt}，${qualityWords}`;
  const typeLabel = type === 'character' ? '角色' : type === 'scene' ? '场景' : '道具';

  return {
    prompt: enhanced,
    step: {
      step: 5,
      name: '质量增强',
      description: `根据${typeLabel}类型自动注入对应质量增强词和问题预防词`,
      input: `初始提示词长度：${prompt.length}字`,
      output: `增强后长度：${enhanced.length}字，注入${template.qualityWords.length}个质量词`,
      details: template.qualityWords.map((w, i) => `质量词${i + 1}：${w}`)
    }
  };
}

// ==================== 第六步：负面词组合 ====================
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
      name: '负面词组合',
      description: '按优先级组合负面提示词，控制总长度在合理范围',
      input: `基础负面词：${template.negativeBase.length}个\n类型专属负面词：${specific.length}个`,
      output: `组合后：${finalNegatives.length}个负面词，总长度${prompt.length}字`,
      details: [
        `基础模板负面词：${template.negativeBase.length}个`,
        `${type === 'character' ? '角色' : type === 'scene' ? '场景' : '道具'}专属负面词：${specific.length}个`,
        `去重后：${uniqueNegatives.length}个`,
        `最终保留：${finalNegatives.length}个（上限45个）`,
        `负面词预览：${finalNegatives.slice(0, 8).join('、')}...`
      ]
    }
  };
}

// ==================== 第七步：校验优化 ====================
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
      name: '校验优化',
      description: '检查关键词冲突、重复、长度超限，进行去重和优化排序',
      input: `正面提示词：${positive.length}字\n负面提示词：${negative.length}字`,
      output: `校验完成：${warnings.length > 0 ? warnings.length + '条警告' : '无问题'}，优化后${prompt.length}字`,
      details: warnings.length > 0 ? warnings : ['无重复关键词', '长度在合理范围', '无风格冲突', '校验通过']
    }
  };
}

// ==================== 第八步：输出结果（主入口） ====================
export function optimizePrompt(info: SubjectInfo): OptimizedPrompt {
  const process: OptimizationStep[] = [];

  // 第一步：信息解析
  const { parsed, step: step1 } = parseSubjectInfo(info);
  process.push(step1);

  // 第二步：特征提取
  const { features, step: step2 } = extractFeatures(parsed.description, parsed.type);
  process.push(step2);

  // 第三步：模板匹配
  const { template, step: step3 } = matchTemplate(parsed);
  process.push(step3);

  // 第四步：动态填充
  const { prompt: initialPrompt, step: step4 } = fillTemplate(template, parsed, features);
  process.push(step4);

  // 第五步：质量增强
  const { prompt: enhancedPrompt, step: step5 } = enhanceQuality(initialPrompt, template, parsed.type);
  process.push(step5);

  // 第六步：负面词组合
  const { prompt: negativePrompt, step: step6 } = buildNegativePrompt(template, parsed.type);
  process.push(step6);

  // 第七步：校验优化
  const { prompt: finalPrompt, warnings, step: step7 } = validateAndOptimize(enhancedPrompt, negativePrompt);
  process.push(step7);

  // 第八步：输出结果
  const recommendedParams = {
    steps: parsed.style === 'anime' ? 25 : parsed.type === 'prop' ? 28 : parsed.type === 'scene' ? 28 : 30,
    cfgScale: parsed.style === 'anime' ? 8.5 : parsed.type === 'character' ? 7.5 : 7.0,
    seed: Math.floor(Math.random() * 2147483647)
  };

  process.push({
    step: 8,
    name: '输出结果',
    description: '输出正面提示词、负面提示词、推荐生成参数，供前端预览和用户确认',
    input: '校验优化后的最终提示词',
    output: `正面${finalPrompt.length}字 / 负面${negativePrompt.length}字 / 推荐步数${recommendedParams.steps} / 相关性${recommendedParams.cfgScale}`,
    details: [
      `正面提示词：${finalPrompt.slice(0, 60)}...`,
      `负面提示词：${negativePrompt.slice(0, 60)}...`,
      `推荐采样步数：${recommendedParams.steps}步`,
      `推荐提示词相关性：${recommendedParams.cfgScale}`,
      `随机种子：${recommendedParams.seed}`
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
    subjectType: parsed.type
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
