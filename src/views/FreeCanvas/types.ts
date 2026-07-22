// 自由画布节点类型定义

/** 节点基础类型 */
export type NodeType = 'role' | 'scene' | 'text' | 'image' | 'video' | 'audio'

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