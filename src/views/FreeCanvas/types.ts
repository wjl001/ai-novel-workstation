// 自由画布节点类型定义

/** 节点基础类型 */
export type NodeType = 'role' | 'scene' | 'text' | 'image' | 'video' | 'audio' | 'scene3d'

/** 添加上下文类型 */
export type ContextType = 'text' | 'image' | 'role'

/** 生成内容类型 */
export type GenerateType = 'image' | 'video' | 'audio' | 'role'

/** 节点位置 */
export interface NodePosition {
  x: number
  y: number
}

/** 节点尺寸 */
export interface NodeSize {
  width: number
  height: number
}

/** 连接线 */
export interface NodeConnection {
  id: string
  sourceId: string
  targetId: string
  label?: string
}

/** 媒体内容 */
export interface MediaContent {
  id: string
  type: 'text' | 'image' | 'video' | 'audio' | 'role'
  url?: string
  content?: string
  name?: string
  thumbnail?: string
  duration?: number
  size?: number
}

/** 上下文条目 */
export interface ContextEntry {
  id: string
  type: ContextType
  content: MediaContent
}

/** 生成结果 */
export interface GenerateResult {
  id: string
  type: GenerateType
  content: MediaContent
  status: 'pending' | 'generating' | 'completed' | 'failed'
  progress: number
  createdAt: number
}

/** 画布节点 */
export interface CanvasNode {
  id: string
  type: NodeType
  label: string
  position: NodePosition
  size: NodeSize
  /** 节点数据 */
  data: {
    // 角色数据
    name?: string
    description?: string
    avatar?: string
    prompt?: string
    imageName?: string
    voiceDescription?: string
    voiceType?: string
    episodeCount?: number
    thumbnail?: string
    // 场景数据
    sceneName?: string
    sceneDescription?: string
    sceneImage?: string
    // 文本数据
    textContent?: string
    // 图片数据
    imageUrl?: string
    imagePrompt?: string
    // 视频数据
    videoUrl?: string
    videoPrompt?: string
    // 音频数据
    audioUrl?: string
    audioPrompt?: string
    // 3D 导演台数据
    directorData?: Scene3DDirectorData
  }
  /** 上下文列表（左侧添加） */
  contexts: ContextEntry[]
  /** 生成结果列表（右侧生成） */
  generations: GenerateResult[]
  /** 创建时间 */
  createdAt: number
  /** 更新时间 */
  updatedAt: number
}

/** 画布状态 */
export interface CanvasState {
  nodes: CanvasNode[]
  connections: NodeConnection[]
  selectedNodeId: string | null
  scale: number
  offset: NodePosition
  viewport: {
    width: number
    height: number
  }
}

/** 添加节点参数 */
export interface AddNodeParams {
  type: NodeType
  label: string
  position?: NodePosition
  data?: Partial<CanvasNode['data']>
}

/** 更新节点参数 */
export interface UpdateNodeParams {
  id: string
  label?: string
  position?: NodePosition
  data?: Partial<CanvasNode['data']>
}

/** 菜单项 */
export interface MenuItem {
  id: string
  label: string
  icon: string
  type: ContextType | GenerateType
  action: 'addContext' | 'generate'
}

// ============= 3D 导演台节点相关类型 =============

/** 灯光类型 */
export type LightType = 'key' | 'fill' | 'rim' | 'ambient' | 'accent'

/** 灯光方向 */
export type LightDirection = 'top' | 'bottom' | 'left' | 'right' | 'back' | 'side' | 'front'

/** 镜头运动类型 */
export type CameraMotion = 'static' | 'pan' | 'tilt' | 'dolly' | 'truck' | 'orbit' | 'push' | 'pull' | 'dolly-in' | 'dolly-out' | 'truck-left' | 'truck-right' | 'pan-left' | 'pan-right' | 'tilt-up' | 'tilt-down' | 'orbit-clockwise' | 'orbit-ccw' | 'crane-up' | 'crane-down' | 'arc' | 'zoom-in' | 'zoom-out' | 'shake' | 'snap-zoom'

/** 景别类型 */
export type ShotType = 'extreme-close-up' | 'extreme-close' | 'close-up' | 'medium-close' | 'medium' | 'medium-full' | 'full' | 'wide' | 'extreme-wide' | 'long'

/** 3D 灯光配置 */
export interface LightConfig {
  id: string
  name: string
  type: LightType
  direction: LightDirection
  color: string
  intensity: number
  temperature: number
  softness: number
  enabled: boolean
}

/** 3D 相机/镜头配置 */
export interface CameraConfig {
  focalLength: number
  cameraHeight: number
  motion: CameraMotion
  shotType: ShotType
  fov: number
  position: { x: number; y: number; z: number }
  target: { x: number; y: number; z: number }
  nearClip: number
  farClip: number
}

/** 3D 材质配置 */
export interface MaterialConfig {
  id: string
  name: string
  color: string
  roughness: number
  metalness: number
  emissive: string
  emissiveIntensity: number
  bumpScale: number
}

/** 3D 环境配置 */
export interface EnvironmentConfig {
  skyType: 'gradient' | 'hdri' | 'solid'
  skyTopColor: string
  skyBottomColor: string
  exposure: number
  fogEnabled: boolean
  fogColor: string
  fogNear: number
  fogFar: number
}

/** 3D 场景元素 */
export interface Scene3DObject {
  id: string
  name: string
  type: 'mesh' | 'character' | 'prop' | 'light' | 'camera'
  visible: boolean
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  scale: { x: number; y: number; z: number }
  materialId?: string
}

/** 3D 关键帧动画 */
export interface KeyframeAnimation {
  id: string
  name: string
  targetId: string
  property: string
  keyframes: Array<{ time: number; value: number; interpolation?: InterpolationMode }>
  loop: boolean
  duration: number
}

/** 3D 导演台节点数据 */
export interface Scene3DDirectorData {
  name?: string
  description?: string
  camera: CameraConfig
  lights: LightConfig[]
  materials: MaterialConfig[]
  environment: EnvironmentConfig
  objects: Scene3DObject[]
  animations: KeyframeAnimation[]
  currentFrame: number
  totalFrames: number
  fps: number
  isPlaying: boolean
  thumbnail?: string
  // 机位列表
  cameraPositions: CameraPosition[]
  activeCameraIndex: number
  // 时间轴轨道
  tracks: TimelineTrack[]
  // 选中对象
  selectedObjectId: string | null
  selectedObjectProperty: string
}

// ============= 机位 / 运镜相关 =============

/** 机位类型 */
export type CameraPresetType = 'front' | 'back' | 'side-left' | 'side-right' | 'top' | 'close-up' | 'medium' | 'wide' | 'low-angle' | 'high-angle' | 'over-shoulder'

/** 机位预设 */
export interface CameraPosition {
  id: string
  name: string
  preset: CameraPresetType | 'custom'
  position: { x: number; y: number; z: number }
  target: { x: number; y: number; z: number }
  fov: number
  focalLength: number
  shotType: ShotType
  motion: CameraMotion
  thumbnail?: string
}

// ============= 时间轴相关 =============

/** 插值方式 */
export type InterpolationMode = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'hold' | 'bezier'

/** 单个关键帧 */
export interface TimelineKeyframe {
  time: number
  value: number
  interpolation: InterpolationMode
}

/** 时间轴轨道 */
export interface TimelineTrack {
  id: string
  name: string
  targetId: string
  property: string
  keyframes: TimelineKeyframe[]
  enabled: boolean
  loop: boolean
}

// ============= 道具库相关 =============

/** 道具分类 */
export type PropCategory = 'furniture' | 'props' | 'architecture' | 'nature' | 'vehicles' | 'clothing' | 'food' | 'electronic' | 'weapons' | 'decorative'

/** 道具模型 */
export interface PropModel {
  id: string
  name: string
  category: PropCategory
  description?: string
  thumbnail?: string
  boundingBox: { width: number; height: number; depth: number }
  polygonCount?: number
  tags: string[]
}

// ============= 动作库相关 =============

/** 动作分类 */
export type ActionCategory = 'walk' | 'run' | 'jump' | 'sit' | 'stand' | 'fight' | 'dance' | 'gesture' | 'emote' | 'interact'

/** 动作素材 */
export interface ActionClip {
  id: string
  name: string
  category: ActionCategory
  description?: string
  thumbnail?: string
  previewUrl?: string
  duration: number
  fps: number
  frameCount: number
  tags: string[]
  isLoop: boolean
}

// ============= 导出相关 =============

/** 导出格式 */
export type ExportFormat = 'mp4' | 'webm' | 'gif'

/** 导出区域 */
export type ExportArea = 'full' | 'viewport' | 'custom'

/** 导出配置 */
export interface ExportConfig {
  format: ExportFormat
  area: ExportArea
  quality: 'low' | 'medium' | 'high'
  fps: number
  width: number
  height: number
}