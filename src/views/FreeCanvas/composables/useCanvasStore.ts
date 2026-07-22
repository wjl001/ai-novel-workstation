import { ref, reactive, computed } from 'vue'
import type { CanvasNode, NodeConnection, NodePosition, NodeType, AddNodeParams, UpdateNodeParams, ContextEntry, GenerateResult, ContextType, GenerateType, MediaContent } from '../types'

// 生成唯一 ID
const generateId = (): string => {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 默认节点尺寸
const NODE_SIZES: Record<NodeType, { width: number; height: number }> = {
  role: { width: 240, height: 180 },
  scene: { width: 240, height: 180 },
  text: { width: 260, height: 160 },
  image: { width: 240, height: 260 },
  video: { width: 240, height: 260 },
  audio: { width: 240, height: 160 }
}

// 全局状态
const nodes = ref<CanvasNode[]>([])
const connections = ref<NodeConnection[]>([])
const selectedNodeId = ref<string | null>(null)
const scale = ref(1)
const offset = reactive<NodePosition>({ x: 0, y: 0 })
const viewport = reactive({ width: 1200, height: 800 })

// 自动布局 - 将新节点放在合适位置
const getNextPosition = (type: NodeType): NodePosition => {
  const baseX = 100
  const baseY = 100
  const spacing = 80
  
  // 按类型分组统计
  const typeNodes = nodes.value.filter(n => n.type === type)
  const count = typeNodes.length
  
  if (count === 0) {
    // 不同类型放在不同起始位置
    const startPositions: Record<NodeType, NodePosition> = {
      role: { x: 100, y: 100 },
      scene: { x: 500, y: 100 },
      text: { x: 100, y: 400 },
      image: { x: 500, y: 400 },
      video: { x: 100, y: 700 },
      audio: { x: 500, y: 700 }
    }
    return startPositions[type] || { x: baseX, y: baseY }
  }
  
  // 找到最后一个同类型节点，在其下方放置
  const lastNode = typeNodes[typeNodes.length - 1]
  return {
    x: lastNode.position.x,
    y: lastNode.position.y + lastNode.size.height + spacing
  }
}

export function useCanvasStore() {
  // 添加节点
  const addNode = (params: AddNodeParams): CanvasNode => {
    const newNode: CanvasNode = {
      id: generateId(),
      type: params.type,
      label: params.label,
      position: params.position || getNextPosition(params.type),
      size: { ...NODE_SIZES[params.type] },
      data: params.data || {},
      contexts: [],
      generations: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    nodes.value.push(newNode)
    return newNode
  }

  // 更新节点
  const updateNode = (params: UpdateNodeParams) => {
    const index = nodes.value.findIndex(n => n.id === params.id)
    if (index === -1) return
    const node = nodes.value[index]
    if (params.label !== undefined) node.label = params.label
    if (params.position !== undefined) node.position = { ...params.position }
    if (params.data !== undefined) node.data = { ...node.data, ...params.data }
    node.updatedAt = Date.now()
  }

  // 删除节点
  const removeNode = (nodeId: string) => {
    nodes.value = nodes.value.filter(n => n.id !== nodeId)
    connections.value = connections.value.filter(c => c.sourceId !== nodeId && c.targetId !== nodeId)
    if (selectedNodeId.value === nodeId) {
      selectedNodeId.value = null
    }
  }

  // 选择节点
  const selectNode = (nodeId: string | null) => {
    selectedNodeId.value = nodeId
  }

  // 更新节点位置
  const updateNodePosition = (nodeId: string, position: NodePosition) => {
    const node = nodes.value.find(n => n.id === nodeId)
    if (node) {
      node.position = { ...position }
      node.updatedAt = Date.now()
    }
  }

  // 更新节点尺寸
  const updateNodeSize = (nodeId: string, size: { width: number; height: number }) => {
    const node = nodes.value.find(n => n.id === nodeId)
    if (node) {
      node.size = { ...size }
      node.updatedAt = Date.now()
    }
  }

  // 添加上下文到节点
  const addContext = (nodeId: string, type: ContextType, content: Omit<MediaContent, 'id'>) => {
    const node = nodes.value.find(n => n.id === nodeId)
    if (!node) return null
    const entry: ContextEntry = {
      id: `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type,
      content: { ...content, id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 6)}` }
    }
    node.contexts.push(entry)
    node.updatedAt = Date.now()
    return entry
  }

  // 删除上下文
  const removeContext = (nodeId: string, contextId: string) => {
    const node = nodes.value.find(n => n.id === nodeId)
    if (node) {
      node.contexts = node.contexts.filter(c => c.id !== contextId)
      node.updatedAt = Date.now()
    }
  }

  // 添加生成结果
  const addGeneration = (nodeId: string, type: GenerateType, content: Omit<MediaContent, 'id'>) => {
    const node = nodes.value.find(n => n.id === nodeId)
    if (!node) return null
    const result: GenerateResult = {
      id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type,
      content: { ...content, id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 6)}` },
      status: 'completed',
      progress: 100,
      createdAt: Date.now()
    }
    node.generations.push(result)
    node.updatedAt = Date.now()
    return result
  }

  // 删除生成结果
  const removeGeneration = (nodeId: string, generationId: string) => {
    const node = nodes.value.find(n => n.id === nodeId)
    if (node) {
      node.generations = node.generations.filter(g => g.id !== generationId)
      node.updatedAt = Date.now()
    }
  }

  // 添加连接线
  const addConnection = (sourceId: string, targetId: string, label?: string): NodeConnection => {
    const conn: NodeConnection = {
      id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      sourceId,
      targetId,
      label
    }
    connections.value.push(conn)
    return conn
  }

  // 删除连接线
  const removeConnection = (connectionId: string) => {
    connections.value = connections.value.filter(c => c.id !== connectionId)
  }

  // 缩放控制
  const zoomIn = () => {
    scale.value = Math.min(scale.value + 0.1, 3)
  }
  const zoomOut = () => {
    scale.value = Math.max(scale.value - 0.1, 0.3)
  }
  const resetZoom = () => {
    scale.value = 1
    offset.x = 0
    offset.y = 0
  }

  // 更新视口
  const updateViewport = (width: number, height: number) => {
    viewport.width = width
    viewport.height = height
  }

  // 获取节点
  const getNode = (nodeId: string) => nodes.value.find(n => n.id === nodeId)

  // 按类型获取节点
  const getNodesByType = (type: NodeType) => nodes.value.filter(n => n.type === type)

  // 获取节点的连接
  const getNodeConnections = (nodeId: string) => {
    return {
      incoming: connections.value.filter(c => c.targetId === nodeId),
      outgoing: connections.value.filter(c => c.sourceId === nodeId)
    }
  }

  // 清空画布
  const clearCanvas = () => {
    nodes.value = []
    connections.value = []
    selectedNodeId.value = null
  }

  // 保存到 localStorage
  const saveToLocalStorage = () => {
    const state = {
      nodes: nodes.value,
      connections: connections.value,
      scale: scale.value,
      offset: { ...offset }
    }
    localStorage.setItem('free_canvas_state', JSON.stringify(state))
  }

  // 从 localStorage 加载
  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem('free_canvas_state')
    if (saved) {
      try {
        const state = JSON.parse(saved)
        nodes.value = state.nodes || []
        connections.value = state.connections || []
        scale.value = state.scale || 1
        if (state.offset) {
          offset.x = state.offset.x
          offset.y = state.offset.y
        }
      } catch (e) {
        console.error('Failed to load canvas state', e)
      }
    }
  }

  return {
    // 状态
    nodes,
    connections,
    selectedNodeId,
    scale,
    offset,
    viewport,
    
    // 计算属性
    selectedNode: computed(() => nodes.value.find(n => n.id === selectedNodeId.value)),
    
    // 操作方法
    addNode,
    updateNode,
    removeNode,
    selectNode,
    updateNodePosition,
    updateNodeSize,
    addContext,
    removeContext,
    addGeneration,
    removeGeneration,
    addConnection,
    removeConnection,
    zoomIn,
    zoomOut,
    resetZoom,
    updateViewport,
    getNode,
    getNodesByType,
    getNodeConnections,
    clearCanvas,
    saveToLocalStorage,
    loadFromLocalStorage
  }
}