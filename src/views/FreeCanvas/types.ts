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
export type CameraMotion = 'static' | 'pan' | 'tilt' | 'dolly' | 'truck' | 'orbit' | 'push' | 'pull'

/** 景别类型 */
export type ShotType = 'extreme-close-up' | 'close-up' | 'medium-close' | 'medium' | 'medium-full' | 'full' | 'wide' | 'extreme-wide'

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
  keyframes: Array<{ time: number; value: number }>
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
  isPlaying: boolean
  thumbnail?: string
}