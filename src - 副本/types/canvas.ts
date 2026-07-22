/**
 * 自由画布 / 资产创作画布 - 核心类型定义
 * 复刻小云雀短剧 Agent 资产创作画布全部数据类型
 */

// ============= 画布节点类型 =============

/** 画布节点类型枚举 */
export enum NodeType {
  CHARACTER = 'character',
  SCENE = 'scene',
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  NOTE = 'note',
  LINK = 'link',
  STICKY = 'sticky',
  THUMBNAIL = 'thumbnail',
  GROUP = 'group',
  PROMPT = 'prompt',
  LIGHTING = 'lighting',
  LENS = 'lens',
  PANORAMA = 'panorama',
  STORYBOARD = 'storyboard',
  PROPS = 'props',
  DOCUMENT = 'document',
}

/** 节点在画布上的定位 */
export interface NodePosition {
  x: number
  y: number
}

/** 节点尺寸 */
export interface NodeSize {
  width: number
  height: number
}

/** 角色节点 */
export interface CharacterNode extends BaseNode {
  type: NodeType.CHARACTER
  data: {
    name: string
    role: string
    persona: string
    visualTraits: string
    images: Array<{
      url: string
      angle: string
      thumbnail?: string
      isMain?: boolean
    }>
    prompt: string
    age?: string
    gender?: string
    costume?: string
    voice?: string
    expressions?: string[]
  }
}

/** 场景节点 */
export interface SceneNode extends BaseNode {
  type:NodeType.SCENE
  data: {
    name: string
    description: string
    images: Array<{
      url: string
      angle: string
      thumbnail?: string
      isMain?: boolean
    }>
    prompt: string
    time?: string
    weather?: string
    atmosphere?: string
    lighting?: {
      direction: string
      color: string
      intensity: number
      type: 'soft' | 'hard' | 'ambient' | 'rim' | 'fill'
    }
    panorama?: {
      url: string
      fov: number
      isGenerated: boolean
    }
    props?: string[]
  }
}

/** 文本节点 */
export interface TextNode extends BaseNode {
  type: NodeType.TEXT
  data: {
    content: string
    title?: string
    fontSize?: number
    color?: string
    align?: 'left' | 'center' | 'right'
    markdown?: boolean
  }
}

/** 图片节点 */
export interface ImageNode extends BaseNode {
  type: NodeType.IMAGE
  data: {
    url: string
    alt?: string
    source?: 'upload' | 'ai_generate' | 'asset_library' | 'storyboard'
    prompt?: string
    thumbnail?: string
  }
}

/** 视频节点 */
export interface VideoNode extends BaseNode {
  type: NodeType.VIDEO
  data: {
    url: string
    title?: string
    thumbnail?: string
    duration?: number
    source?: 'upload' | 'storyboard' | 'external'
  }
}

/** 音频节点 */
export interface AudioNode extends BaseNode {
  type: NodeType.AUDIO
  data: {
    url: string
    title?: string
    duration?: number
    source?: 'upload' | 'bgm' | 'sfx' | 'voice'
  }
}

/** 备注节点 */
export interface NoteNode extends BaseNode {
  type: NodeType.NOTE
  data: {
    content: string
    color?: string
  }
}

/** 链接节点 */
export interface LinkNode extends BaseNode {
  type: NodeType.LINK
  data: {
    url: string
    title: string
    description?: string
    thumbnail?: string
  }
}

/** 提示词节点 */
export interface PromptNode extends BaseNode {
  type: NodeType.PROMPT
  data: {
    content: string
    category?: 'character' | 'scene' | 'shot' | 'style'
    generated?: boolean
  }
}

/** 光影控制节点 */
export interface LightingNode extends BaseNode {
  type: NodeType.LIGHTING
  data: {
    direction: 'top' | 'bottom' | 'left' | 'right' | 'back' | 'side' | 'front'
    color: string
    intensity: number
    temperature: 'warm' | 'neutral' | 'cool'
    type: 'key' | 'fill' | 'rim' | 'ambient' | 'accent'
    softness: number
    description: string
  }
}

/** 镜头控制节点 */
export interface LensNode extends BaseNode {
  type: NodeType.LENS
  data: {
    focalLength: string
    cameraHeight: 'high' | 'eye' | 'low' | 'ground'
    movement: 'static' | 'pan' | 'tilt' | 'dolly' | 'track' | 'push' | 'pull' | 'arc'
    shotType: 'extreme_close_up' | 'close_up' | 'medium_close_up' | 'medium' | 'medium_long' | 'long' | 'extreme_long'
    angle: string
    prompt: string
  }
}

/** 全景图节点 */
export interface PanoramaNode extends BaseNode {
  type: NodeType.PANORAMA
  data: {
    url: string
    originalUrl?: string
    fov: number
    pitch: number
    yaw: number
    isGenerated: boolean
    description: string
  }
}

/** 道具节点 */
export interface PropsNode extends BaseNode {
  type: NodeType.PROPS
  data: {
    name: string
    description: string
    image?: string
    material?: string
    usage?: string
  }
}

/** 分镜节点 */
export interface StoryboardNode extends BaseNode {
  type: NodeType.STORYBOARD
  data: {
    episode: number
    shot: number
    title: string
    prompt: string
    images: string[]
    duration?: number
    characters?: string[]
    scene?: string
  }
}

/** 文档节点 */
export interface DocumentNode extends BaseNode {
  type: NodeType.DOCUMENT
  data: {
    title: string
    content: string
    fileType?: 'md' | 'txt' | 'docx'
    size?: string
  }
}

/** 通用画布节点基类 */
export interface BaseNode {
  id: string
  type: NodeType
  position: NodePosition
  size?: NodeSize
  locked?: boolean
  hidden?: boolean
  opacity?: number
  groupId?: string
  created: number
  updated: number
}

/** 所有画布节点类型的联合 */
export type CanvasNode =
  | CharacterNode
  | SceneNode
  | TextNode
  | ImageNode
  | VideoNode
  | AudioNode
  | NoteNode
  | LinkNode
  | PromptNode
  | LightingNode
  | LensNode
  | PanoramaNode
  | PropsNode
  | StoryboardNode
  | DocumentNode

/** 画布边缘连接 */
export interface Edge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  label?: string
  animated?: boolean
  style?: Record<string, any>
  type?: string
}

/** 画布分组 */
export interface Group {
  id: string
  label: string
  color: string
  nodes: string[]
  position: NodePosition
  size?: NodeSize
}

// ============= 画布整体状态 =============

export interface CanvasState {
  canvasId: string
  canvasName: string
  description: string
  threadId: string
  nodes: CanvasNode[]
  edges: Edge[]
  groups: Group[]
  viewport: {
    x: number
    y: number
    zoom: number
  }
  selectedNodes: string[]
  selectedEdges: string[]
  clipboard: Array<CanvasNode | Edge>
  tags: Array<{
    id: string
    name: string
    color: string
  }>
  comments: Array<{
    id: string
    nodeId?: string
    x?: number
    y?: number
    content: string
    author: string
    avatar?: string
    created: number
    replies?: Array<{
      id: string
      author: string
      content: string
      created: number
    }>
    resolved?: boolean
  }>
  collaborators: Array<{
    userId: string
    name: string
    avatar?: string
    role: 'owner' | 'editor' | 'viewer'
    cursor?: NodePosition
    color?: string
  }>
  history: CanvasSnapshot[]
  historyIndex: number
  saved: boolean
  created: number
  updated: number
  permissions: {
    canEdit: boolean
    canDelete: boolean
    canShare: boolean
    canExport: boolean
    canInvite: boolean
  }
}

/** 画布历史快照 */
export interface CanvasSnapshot {
  timestamp: number
  nodes: CanvasNode[]
  edges: Edge[]
  groups: Group[]
  viewport: CanvasState['viewport']
  action: string
}

// ============= 资产库 =============

/** 资产库分类 */
export type AssetCategory =
  | 'characters'
  | 'scenes'
  | 'props'
  | 'images'
  | 'videos'
  | 'audios'
  | 'documents'
  | 'links'
  | 'panoramas'
  | 'storyboards'

/** 资产库条目 */
export interface AssetItem {
  id: string
  type: AssetCategory
  name: string
  thumbnail?: string
  previewUrl?: string
  tags?: string[]
  usedInCanvas: string[]
  created: number
  updated: number
  data?: Record<string, any>
}

// ============= 拖拽 =============

export interface DragItem {
  type: 'asset' | 'node' | 'file'
  data: any
  from: 'sidebar' | 'canvas' | 'external'
}

// ============= 导出/导入 =============

export interface ExportOptions {
  format: 'png' | 'jpg' | 'svg' | 'json' | 'zip'
  includeNodes: string[]
  includeEdges: boolean
  resolution: number
  backgroundColor?: string
}

export interface ImportData {
  version: string
  nodes: CanvasNode[]
  edges: Edge[]
  groups: Group[]
  comments?: CanvasState['comments']
  tags?: CanvasState['tags']
}

// ============= 工具栏状态 =============

export type ToolMode = 'select' | 'pan' | 'draw' | 'lasso' | 'hand' | 'text' | 'image'

export interface ToolbarState {
  activeTool: ToolMode
  showGrid: boolean
  showMinimap: boolean
  showControls: boolean
  snapToGrid: boolean
  gridSize: number
  showNodeLabels: boolean
  showEdgeLabels: boolean
  selectionMode: 'single' | 'multi' | 'box'
  fitToScreen: boolean
}

// ============= 评论 =============

export type CommentVisibility = 'public' | 'private' | 'directed'

export interface CommentData {
  id: string
  content: string
  author: { name: string; avatar?: string }
  nodeId?: string
  position?: NodePosition
  created: number
  updated?: number
  visibility: CommentVisibility
  directedTo?: { userId: string; name: string }
  replies: Array<{
    id: string
    author: { name: string; avatar?: string }
    content: string
    created: number
  }>
  resolved: boolean
  reactions?: Record<string, number>
}

// ============= 右键菜单项 =============

export interface ContextMenuAction {
  id: string
  label: string
  icon?: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
  dividerBefore?: boolean
}

// ============= 节点配置 =============

export interface NodeConfig {
  type: NodeType
  label: string
  description: string
  icon: string
  color: string
  defaultSize?: NodeSize
  defaultData?: any
  canDragFromSidebar: boolean
  canCreateFromToolbar: boolean
}
