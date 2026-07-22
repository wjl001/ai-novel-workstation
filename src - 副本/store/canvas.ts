/**
 * 自由画布状态管理 - Pinia Store
 * 复刻小云雀资产创作画布的全部状态管理逻辑
 */
import { defineStore } from 'pinia'
import {
  CanvasState, CanvasNode, NodeType, NodePosition, Edge,
  Group, ToolbarState, CanvasSnapshot, AssetItem,
  DragItem, CommentData, NodeConfig
} from '../types/canvas'

// ============= 默认工具栏状态 =============
const defaultToolbar: ToolbarState = {
  activeTool: 'select',
  showGrid: true,
  showMinimap: true,
  showControls: true,
  snapToGrid: true,
  gridSize: 20,
  showNodeLabels: true,
  showEdgeLabels: true,
  selectionMode: 'single',
  fitToScreen: false,
}

// ============= 节点类型配置 =============
export const NODE_CONFIGS: Record<NodeType, NodeConfig> = {
  [NodeType.CHARACTER]: {
    type: NodeType.CHARACTER,
    label: '角色',
    description: '角色形象资产，支持多角度图片',
    icon: 'User',
    color: '#6366f1',
    defaultSize: { width: 280, height: 320 },
    defaultData: {
      name: '新角色',
      role: '',
      persona: '',
      visualTraits: '',
      images: [],
      prompt: '',
    },
    canDragFromSidebar: true,
    canCreateFromToolbar: true,
  },
  [NodeType.SCENE]: {
    type: NodeType.SCENE,
    label: '场景',
    description: '场景空间资产，支持光影控制',
    icon: 'Palette',
    color: '#22c55e',
    defaultSize: { width: 300, height: 280 },
    defaultData: {
      name: '新场景',
      description: '',
      images: [],
      prompt: '',
      time: '',
      weather: '',
      atmosphere: '',
    },
    canDragFromSidebar: true,
    canCreateFromToolbar: true,
  },
  [NodeType.TEXT]: {
    type: NodeType.TEXT,
    label: '文本',
    description: '添加文本备注',
    icon: 'FileText',
    color: '#3b82f6',
    defaultSize: { width: 240, height: 120 },
    defaultData: {
      content: '双击编辑文本...',
      fontSize: 14,
      color: '#333',
      align: 'left',
    },
    canDragFromSidebar: true,
    canCreateFromToolbar: true,
  },
  [NodeType.IMAGE]: {
    type: NodeType.IMAGE,
    label: '图片',
    description: '添加图片素材',
    icon: 'Image',
    color: '#f97316',
    defaultSize: { width: 240, height: 180 },
    defaultData: {
      url: '',
      alt: '',
      source: 'upload',
    },
    canDragFromSidebar: true,
    canCreateFromToolbar: true,
  },
  [NodeType.VIDEO]: {
    type: NodeType.VIDEO,
    label: '视频',
    description: '添加视频素材',
    icon: 'Video',
    color: '#ef4444',
    defaultSize: { width: 320, height: 180 },
    defaultData: {
      url: '',
      title: '',
      duration: 0,
      source: 'upload',
    },
    canDragFromSidebar: true,
    canCreateFromToolbar: true,
  },
  [NodeType.AUDIO]: {
    type: NodeType.AUDIO,
    label: '音频',
    description: '添加音频素材',
    icon: 'Volume2',
    color: '#a855f7',
    defaultSize: { width: 240, height: 80 },
    defaultData: {
      url: '',
      title: '',
      duration: 0,
      source: 'upload',
    },
    canDragFromSidebar: true,
    canCreateFromToolbar: true,
  },
  [NodeType.NOTE]: {
    type: NodeType.NOTE,
    label: '便签',
    description: '添加彩色便签备注',
    icon: 'StickyNote',
    color: '#eab308',
    defaultSize: { width: 200, height: 160 },
    defaultData: {
      content: '双击编辑便签...',
      color: '#fef08a',
    },
    canDragFromSidebar: true,
    canCreateFromToolbar: true,
  },
  [NodeType.LINK]: {
    type:NodeType.LINK,
    label: '链接',
    description: '添加外部链接',
    icon: 'Link',
    color: '#06b6d4',
    defaultSize: { width: 220, height: 100 },
    defaultData: {
      url: '',
      title: '',
      description: '',
    },
    canDragFromSidebar: true,
    canCreateFromToolbar: true,
  },
  [NodeType.PROMPT]: {
    type: NodeType.PROMPT,
    label: '提示词',
    description: 'AI 生成提示词',
    icon: 'Sparkles',
    color: '#8b5cf6',
    defaultSize: { width: 300, height: 200 },
    defaultData: {
      content: '',
      category: 'character',
      generated: false,
    },
    canDragFromSidebar: true,
    canCreateFromToolbar: true,
  },
  [NodeType.LIGHTING]: {
    type: NodeType.LIGHTING,
    label: '光影控制',
    description: '控制光源方位、色温、亮度',
    icon: 'Sun',
    color: '#f59e0b',
    defaultSize: { width: 260, height: 240 },
    defaultData: {
      direction: 'side',
      color: '#fff4e5',
      intensity: 70,
      temperature: 'warm',
      type: 'key',
      softness: 50,
      description: '',
    },
    canDragFromSidebar: true,
    canCreateFromToolbar: true,
  },
  [NodeType.LENS]: {
    type: NodeType.LENS,
    label: '镜头控制',
    description: '控制镜头焦距、角度、运镜',
    icon: 'Camera',
    color: '#10b981',
    defaultSize: { width: 260, height: 200 },
    defaultData: {
      focalLength: '50mm',
      cameraHeight: 'eye',
      movement: 'static',
      shotType: 'medium',
      angle: '',
      prompt: '',
    },
    canDragFromSidebar: true,
    canCreateFromToolbar: true,
  },
  [NodeType.PANORAMA]: {
    type:NodeType.PANORAMA,
    label: '全景图',
    description: '720°全景场景',
    icon: 'Globe',
    color: '#14b8a6',
    defaultSize: { width: 300, height: 200 },
    defaultData: {
      url: '',
      fov: 90,
      pitch: 0,
      yaw: 0,
      isGenerated: false,
      description: '',
    },
    canDragFromSidebar: true,
    canCreateFromToolbar: true,
  },
  [NodeType.PROPS]: {
    type: NodeType.PROPS,
    label: '道具',
    description: '场景道具资产',
    icon: 'Package',
    color: '#fb923c',
    defaultSize: { width: 220, height: 180 },
    defaultData: {
      name: '新道具',
      description: '',
      image: '',
      material: '',
      usage: '',
    },
    canDragFromSidebar: true,
    canCreateFromToolbar: true,
  },
  [NodeType.STORYBOARD]: {
    type: NodeType.STORYBOARD,
    label: '分镜',
    description: '分镜脚本节点',
    icon: 'Film',
    color: '#ec4899',
    defaultSize: { width: 280, height: 200 },
    defaultData: {
      episode: 1,
      shot: 1,
      title: '',
      prompt: '',
      images: [],
      characters: [],
      scene: '',
    },
    canDragFromSidebar: true,
    canCreateFromToolbar: true,
  },
  [NodeType.DOCUMENT]: {
    type: NodeType.DOCUMENT,
    label: '文档',
    description: '添加文档',
    icon: 'File',
    color: '#64748b',
    defaultSize: { width: 240, height: 180 },
    defaultData: {
      title: '',
      content: '',
      fileType: 'md',
    },
    canDragFromSidebar: true,
    canCreateFromToolbar: true,
  },
  [NodeType.GROUP]: {
    type: NodeType.GROUP,
    label: '分组',
    description: '节点分组',
    icon: 'Layers',
    color: '#94a3b8',
    canDragFromSidebar: false,
    canCreateFromToolbar: true,
  },
  [NodeType.STICKY]: {
    type: NodeType.STICKY,
    label: '贴纸',
    description: '装饰贴纸',
    icon: 'Hexagon',
    color: '#f472b6',
    defaultSize: { width: 120, height: 120 },
    canDragFromSidebar: true,
    canCreateFromToolbar: true,
  },
  [NodeType.THUMBNAIL]: {
    type: NodeType.THUMBNAIL,
    label: '缩略图',
    description: '添加缩略图',
    icon: 'Image',
    color: '#fb923c',
    defaultSize: { width: 160, height: 120 },
    canDragFromSidebar: true,
    canCreateFromToolbar: true,
  },
}

// ============= 画布 Store =============
export const useCanvasStore = defineStore('canvas', {
  state: (): CanvasState => ({
    canvasId: '',
    canvasName: '新建画布',
    description: '',
    threadId: '',
    nodes: [],
    edges: [],
    groups: [],
    viewport: {
      x: 0,
      y: 0,
      zoom: 1,
    },
    selectedNodes: [],
    selectedEdges: [],
    clipboard: [],
    tags: [],
    comments: [],
    collaborators: [],
    history: [],
    historyIndex: -1,
    saved: true,
    created: Date.now(),
    updated: Date.now(),
    permissions: {
      canEdit: true,
      canDelete: true,
      canShare: true,
      canExport: true,
      canInvite: true,
    },
  }),

  getters: {
    /** 当前选中的节点对象 */
    selectedNodeObjects: (state): CanvasNode[] => {
      return state.nodes.filter(n => state.selectedNodes.includes(n.id))
    },

    /** 按类型统计节点数量 */
    nodeCountByType: (state): Record<NodeType, number> => {
      const counts: Partial<Record<NodeType, number>> = {}
      for (const type of Object.values(NodeType)) {
        counts[type] = state.nodes.filter(n => n.type === type).length
      }
      return counts as Record<NodeType, number>
    },

    /** 画布总节点数 */
    totalNodes: (state): number => state.nodes.length,

    /** 角色节点列表 */
    characterNodes: (state): CanvasNode[] =>
      state.nodes.filter(n => n.type === NodeType.CHARACTER),

    /** 场景节点列表 */
    sceneNodes: (state): CanvasNode[] =>
      state.nodes.filter(n => n.type === NodeType.SCENE),

    /** 图片节点列表 */
    imageNodes: (state): CanvasNode[] =>
      state.nodes.filter(n => n.type === NodeType.IMAGE),

    /** 视频节点列表 */
    videoNodes: (state): CanvasNode[] =>
      state.nodes.filter(n => n.type === NodeType.VIDEO),

    /** 可撤销 */
    canUndo: (state): boolean => state.historyIndex >= 0 && state.history.length > 0,

    /** 可重做 */
    canRedo: (state): boolean => state.historyIndex < state.history.length - 1,

    /** 是否有未保存的更改 */
    hasUnsavedChanges: (state): boolean => !state.saved,

    /** 当前工具栏状态 */
    toolbar: (): ToolbarState => {
      const saved = localStorage.getItem('canvas_toolbar')
      if (saved) {
        try {
          return { ...defaultToolbar, ...JSON.parse(saved) }
        } catch {
          return { ...defaultToolbar }
        }
      }
      return { ...defaultToolbar }
    },

    /** 资产库 */
    assetLibrary: (): Record<string, AssetItem[]> => {
      const saved = localStorage.getItem('canvas_assets')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          return {}
        }
      }
      return {}
    },

    /** 拖拽中项目 */
    dragItem: (): DragItem | null => {
      const saved = localStorage.getItem('canvas_drag')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          return null
        }
      }
      return null
    },
  },

  actions: {
    // ============= 画布基础操作 =============

    /** 初始化画布 */
    initCanvas(canvasId?: string, threadId?: string) {
      this.canvasId = canvasId || this.generateId()
      this.threadId = threadId || ''
      this.saveToLocalStorage()
    },

    /** 设置画布名称 */
    setCanvasName(name: string) {
      this.canvasName = name
      this.markUnsaved()
    },

    /** 设置画布描述 */
    setDescription(desc: string) {
      this.description = desc
      this.markUnsaved()
    },

    // ============= 节点操作 =============

    /** 生成唯一 ID */
    generateId(): string {
      return `${NodeType}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    },

    /** 创建节点 */
    addNode(type: NodeType, position?: NodePosition, size?: any): string {
      const config = NODE_CONFIGS[type]
      const nodeId = this.generateId()
      const node: CanvasNode = {
        id: nodeId,
        type,
        position: position || {
          x: (Math.random() * 400 - 200) + this.viewport.x,
          y: (Math.random() * 400 - 200) + this.viewport.y,
        },
        size: config?.defaultSize || { width: 200, height: 150 },
        locked: false,
        hidden: false,
        opacity: 100,
        created: Date.now(),
        updated: Date.now(),
        data: config?.defaultData ? { ...config.defaultData } : {},
      } as CanvasNode

      this.nodes.push(node)
      this.markUnsaved()
      this.pushHistory('add_node')
      return nodeId
    },

    /** 批量添加节点 */
    addNodes(nodes: CanvasNode[]) {
      nodes.forEach(n => {
        n.id = this.generateId()
        n.created = Date.now()
        n.updated = Date.now()
        this.nodes.push(n)
      })
      this.markUnsaved()
      this.pushHistory('add_nodes_batch')
    },

    /** 更新节点 */
    updateNode(nodeId: string, updates: Partial<CanvasNode>) {
      const node = this.nodes.find(n => n.id === nodeId)
      if (!node) return
      Object.assign(node, updates, { updated: Date.now() })
      this.markUnsaved()
      this.pushHistory('update_node')
    },

    /** 更新节点数据 */
    updateNodeData(nodeId: string, dataUpdates: Record<string, any>) {
      const node = this.nodes.find(n => n.id === nodeId)
      if (!node || !node.data) return
      Object.assign(node.data, dataUpdates)
      node.updated = Date.now()
      this.markUnsaved()
      this.pushHistory('update_node_data')
    },

    /** 更新节点位置 */
    updateNodePosition(nodeId: string, position: NodePosition) {
      const node = this.nodes.find(n => n.id === nodeId)
      if (!node) return
      node.position = { ...position }
      node.updated = Date.now()
      // 高频更新不存历史
    },

    /** 更新节点尺寸 */
    updateNodeSize(nodeId: string, size: { width: number; height: number }) {
      const node = this.nodes.find(n => n.id === nodeId)
      if (!node) return
      node.size = { ...size }
      node.updated = Date.now()
      this.pushHistory('resize_node')
    },

    /** 删除节点 */
    removeNode(nodeId: string) {
      this.nodes = this.nodes.filter(n => n.id !== nodeId)
      this.edges = this.edges.filter(e => e.source !== nodeId && e.target !== nodeId)
      this.selectedNodes = this.selectedNodes.filter(id => id !== nodeId)
      this.comments = this.comments.filter(c => c.nodeId !== nodeId)
      this.markUnsaved()
      this.pushHistory('remove_node')
    },

    /** 批量删除节点 */
    removeNodes(nodeIds: string[]) {
      this.nodes = this.nodes.filter(n => !nodeIds.includes(n.id))
      this.edges = this.edges.filter(e => !nodeIds.includes(e.source) && !nodeIds.includes(e.target))
      this.selectedNodes = this.selectedNodes.filter(id => !nodeIds.includes(id))
      this.comments = this.comments.filter(c => !nodeIds.includes(c.nodeId || ''))
      this.markUnsaved()
      this.pushHistory('remove_nodes_batch')
    },

    /** 锁定/解锁节点 */
    toggleNodeLock(nodeId: string) {
      const node = this.nodes.find(n => n.id === nodeId)
      if (node) {
        node.locked = !node.locked
        this.markUnsaved()
        this.pushHistory('toggle_lock')
      }
    },

    /** 隐藏/显示节点 */
    toggleNodeVisibility(nodeId: string) {
      const node = this.nodes.find(n => n.id === nodeId)
      if (node) {
        node.hidden = !node.hidden
        this.markUnsaved()
        this.pushHistory('toggle_visibility')
      }
    },

    /** 设置节点透明度 */
    setNodeOpacity(nodeId: string, opacity: number) {
      const node = this.nodes.find(n => n.id === nodeId)
      if (node) {
        node.opacity = Math.max(0, Math.min(100, opacity))
        this.markUnsaved()
      }
    },

    /** 复制节点 */
    duplicateNode(nodeId: string): string {
      const node = this.nodes.find(n => n.id === nodeId)
      if (!node) return ''
      const newNodeId = this.generateId()
      const newNode = JSON.parse(JSON.stringify(node))
      newNode.id = newNodeId
      newNode.position = { x: node.position.x + 20, y: node.position.y + 20 }
      newNode.created = Date.now()
      newNode.updated = Date.now()
      this.nodes.push(newNode)
      this.markUnsaved()
      this.pushHistory('duplicate_node')
      return newNodeId
    },

    /** 批量复制节点 */
    duplicateNodes(nodeIds: string[]) {
      const newIds: string[] = []
      nodeIds.forEach(id => {
        const newId = this.duplicateNode(id)
        if (newId) newIds.push(newId)
      })
      return newIds
    },

    /** 发送节点到最前面 */
    bringToFront(nodeId: string) {
      const idx = this.nodes.findIndex(n => n.id === nodeId)
      if (idx >= 0) {
        const node = this.nodes.splice(idx, 1)[0]
        this.nodes.push(node)
        this.markUnsaved()
      }
    },

    /** 将节点发送到最后面 */
    sendToBack(nodeId: string) {
      const idx = this.nodes.findIndex(n => n.id === nodeId)
      if (idx >= 0) {
        const node = this.nodes.splice(idx, 1)[0]
        this.nodes.unshift(node)
        this.markUnsaved()
      }
    },

    // ============= 选择操作 =============

    /** 选中节点 */
    selectNode(nodeId: string) {
      this.selectedNodes = [nodeId]
    },

    /** 多选节点 */
    selectNodes(nodeIds: string[]) {
      this.selectedNodes = [...nodeIds]
    },

    /** 清空选择 */
    clearSelection() {
      this.selectedNodes = []
      this.selectedEdges = []
    },

    /** 全选 */
    selectAll() {
      this.selectedNodes = this.nodes.map(n => n.id)
    },

    /** 是否选中 */
    isSelected(nodeId: string): boolean {
      return this.selectedNodes.includes(nodeId)
    },

    /** 批量选中同类型节点 */
    selectAllOfType(type: NodeType) {
      this.selectedNodes = this.nodes
        .filter(n => n.type === type)
        .map(n => n.id)
    },

    // ============= 边缘连接 =============

    /** 添加边缘 */
    addEdge(source: string, target: string, label?: string): string {
      const edgeId = `edge_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
      const edge: Edge = {
        id: edgeId,
        source,
        target,
        label,
        animated: true,
      }
      this.edges.push(edge)
      this.markUnsaved()
      this.pushHistory('add_edge')
      return edgeId
    },

    /** 删除边缘 */
    removeEdge(edgeId: string) {
      this.edges = this.edges.filter(e => e.id !== edgeId)
      this.selectedEdges = this.selectedEdges.filter(id => id !== edgeId)
      this.markUnsaved()
      this.pushHistory('remove_edge')
    },

    /** 更新边缘标签 */
    updateEdgeLabel(edgeId: string, label: string) {
      const edge = this.edges.find(e => e.id === edgeId)
      if (edge) {
        edge.label = label
        this.markUnsaved()
      }
    },

    /** 选中边缘 */
    selectEdge(edgeId: string) {
      this.selectedEdges = [edgeId]
    },

    // ============= 分组 =============

    /** 创建分组 */
    createGroup(label: string, color: string, nodeIds: string[]) {
      const groupId = `group_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
      // 计算包围盒
      const nodes = this.nodes.filter(n => nodeIds.includes(n.id))
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      nodes.forEach(n => {
        minX = Math.min(minX, n.position.x)
        minY = Math.min(minY, n.position.y)
        maxX = Math.max(maxX, n.position.x + (n.size?.width || 200))
        maxY = Math.max(maxY, n.position.y + (n.size?.height || 150))
      })
      const group: Group = {
        id: groupId,
        label,
        color,
        nodes: nodeIds,
        position: { x: minX - 10, y: minY - 10 },
        size: { width: maxX - minX + 20, height: maxY - minY + 20 },
      }
      this.groups.push(group)
      this.nodes.forEach(n => {
        if (nodeIds.includes(n.id)) n.groupId = groupId
      })
      this.markUnsaved()
      this.pushHistory('create_group')
      return groupId
    },

    /** 删除分组 */
    removeGroup(groupId: string) {
      this.groups = this.groups.filter(g => g.id !== groupId)
      this.nodes.forEach(n => {
        if (n.groupId === groupId) n.groupId = undefined
      })
      this.markUnsaved()
      this.pushHistory('remove_group')
    },

    /** 向分组添加节点 */
    addNodesToGroup(groupId: string, nodeIds: string[]) {
      const group = this.groups.find(g => g.id === groupId)
      if (group) {
        nodeIds.forEach(id => {
          if (!group.nodes.includes(id)) {
            group.nodes.push(id)
          }
          const node = this.nodes.find(n => n.id === id)
          if (node) node.groupId = groupId
        })
        this.markUnsaved()
        this.pushHistory('add_to_group')
      }
    },

    /** 从分组移除节点 */
    removeNodesFromGroup(groupId: string, nodeIds: string[]) {
      const group = this.groups.find(g => g.id === groupId)
      if (group) {
        group.nodes = group.nodes.filter(id => !nodeIds.includes(id))
        nodeIds.forEach(id => {
          const node = this.nodes.find(n => n.id === id)
          if (node) node.groupId = undefined
        })
        this.markUnsaved()
        this.pushHistory('remove_from_group')
      }
    },

    /** 展开/折叠分组 */
    toggleGroupVisibility(groupId: string) {
      const group = this.groups.find(g => g.id === groupId)
      if (group) {
        // 切换分组内节点的 hidden 状态
        group.nodes.forEach(id => {
          const node = this.nodes.find(n => n.id === id)
          if (node) node.hidden = !node.hidden
        })
        this.markUnsaved()
      }
    },

    // ============= 视图操作 =============

    /** 更新视口 */
    updateViewport(viewport: Partial<CanvasState['viewport']>) {
      Object.assign(this.viewport, viewport)
    },

    /** 缩放 */
    setZoom(zoom: number) {
      this.viewport.zoom = Math.max(0.1, Math.min(5, zoom))
    },

    /** 适配屏幕 */
    fitToScreen() {
      if (this.nodes.length === 0) {
        this.viewport = { x: 0, y: 0, zoom: 1 }
        return
      }
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      this.nodes.forEach(n => {
        const w = n.size?.width || 200
        const h = n.size?.height || 150
        minX = Math.min(minX, n.position.x)
        minY = Math.min(minY, n.position.y)
        maxX = Math.max(maxX, n.position.x + w)
        maxY = Math.max(maxY, n.position.y + h)
      })
      const padding = 100
      const width = maxX - minX + padding * 2
      const height = maxY - minY + padding * 2
      this.viewport.x = -minX - padding
      this.viewport.y = -minY - padding
      this.viewport.zoom = Math.min(1, 1000 / Math.max(width, height))
    },

    /** 重置视图 */
    resetViewport() {
      this.viewport = { x: 0, y: 0, zoom: 1 }
    },

    // ============= 剪切板 =============

    /** 复制选中 */
    copySelected() {
      this.clipboard = [
        ...this.nodes.filter(n => this.selectedNodes.includes(n.id)),
        ...this.edges.filter(e => this.selectedEdges.includes(e.id)),
      ]
    },

    /** 剪切选中 */
    cutSelected() {
      this.clipboard = [
        ...this.nodes.filter(n => this.selectedNodes.includes(n.id)),
        ...this.edges.filter(e => this.selectedEdges.includes(e.id)),
      ]
      this.removeNodes(this.selectedNodes)
    },

    /** 粘贴 */
    paste() {
      if (this.clipboard.length === 0) return
      const offset = 30
      const newNodes: CanvasNode[] = []
      this.clipboard.forEach(item => {
        if ('type' in item && 'position' in item) {
          const node = JSON.parse(JSON.stringify(item)) as CanvasNode
          node.id = this.generateId()
          node.position = {
            x: node.position.x + offset,
            y: node.position.y + offset,
          }
          node.created = Date.now()
          node.updated = Date.now()
          newNodes.push(node)
        }
      })
      this.nodes.push(...newNodes)
      this.selectedNodes = newNodes.map(n => n.id)
      this.markUnsaved()
      this.pushHistory('paste')
    },

    // ============= 历史/撤销/重做 =============

    /** 推送历史快照 */
    pushHistory(action: string) {
      // 移除当前索引之后的所有历史
      if (this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1)
      }
      const snapshot: CanvasSnapshot = {
        timestamp: Date.now(),
        nodes: JSON.parse(JSON.stringify(this.nodes)),
        edges: JSON.parse(JSON.stringify(this.edges)),
        groups: JSON.parse(JSON.stringify(this.groups)),
        viewport: { ...this.viewport },
        action,
      }
      this.history.push(snapshot)
      // 限制历史长度
      if (this.history.length > 100) {
        this.history = this.history.slice(-100)
      }
      this.historyIndex = this.history.length - 1
    },

    /** 撤销 */
    undo() {
      if (this.historyIndex < 0 || this.history.length === 0) return
      const snapshot = this.history[this.historyIndex]
      this.nodes = JSON.parse(JSON.stringify(snapshot.nodes))
      this.edges = JSON.parse(JSON.stringify(snapshot.edges))
      this.groups = JSON.parse(JSON.stringify(snapshot.groups))
      this.viewport = { ...snapshot.viewport }
      this.selectedNodes = []
      this.selectedEdges = []
      this.historyIndex--
      this.markUnsaved()
    },

    /** 重做 */
    redo() {
      if (this.historyIndex >= this.history.length - 1) return
      this.historyIndex++
      const snapshot = this.history[this.historyIndex]
      this.nodes = JSON.parse(JSON.stringify(snapshot.nodes))
      this.edges = JSON.parse(JSON.stringify(snapshot.edges))
      this.groups = JSON.parse(JSON.stringify(snapshot.groups))
      this.viewport = { ...snapshot.viewport }
      this.selectedNodes = []
      this.selectedEdges = []
      this.markUnsaved()
    },

    /** 清空历史 */
    clearHistory() {
      this.history = []
      this.historyIndex = -1
    },

    // ============= 评论系统 =============

    /** 添加评论 */
    addComment(
      content: string,
      nodeId?: string,
      position?: NodePosition,
      directedTo?: { userId: string; name: string }
    ): string {
      const commentId = `comment_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
      const comment = {
        id: commentId,
        nodeId,
        x: position?.x,
        y: position?.y,
        content,
        author: this.getUserInfo().name,
        avatar: this.getUserInfo().avatar,
        created: Date.now(),
        replies: [],
        resolved: false,
      }
      this.comments.push(comment)
      this.markUnsaved()
      return commentId
    },

    /** 回复评论 */
    replyComment(commentId: string, content: string): string {
      const comment = this.comments.find(c => c.id === commentId)
      if (!comment) return ''
      const replyId = `reply_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
      const reply = {
        id: replyId,
        author: this.getUserInfo().name,
        content,
        created: Date.now(),
      }
      if (!comment.replies) comment.replies = []
      comment.replies.push(reply)
      this.markUnsaved()
      return replyId
    },

    /** 删除评论 */
    removeComment(commentId: string) {
      this.comments = this.comments.filter(c => c.id !== commentId)
      this.markUnsaved()
    },

    /** 切换评论解决状态 */
    toggleCommentResolved(commentId: string) {
      const comment = this.comments.find(c => c.id === commentId)
      if (comment) {
        comment.resolved = !comment.resolved
        this.markUnsaved()
      }
    },

    // ============= 标签 =============

    /** 添加标签 */
    addTag(name: string, color: string): string {
      const tagId = `tag_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
      this.tags.push({ id: tagId, name, color })
      this.markUnsaved()
      return tagId
    },

    /** 删除标签 */
    removeTag(tagId: string) {
      this.tags = this.tags.filter(t => t.id !== tagId)
      this.markUnsaved()
    },

    // ============= 协作 =============

    /** 添加协作者 */
    addCollaborator(userId: string, name: string, role: 'owner' | 'editor' | 'viewer') {
      const exists = this.collaborators.find(c => c.userId === userId)
      if (exists) return
      this.collaborators.push({
        userId,
        name,
        role,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      })
      this.markUnsaved()
    },

    /** 移除协作者 */
    removeCollaborator(userId: string) {
      this.collaborators = this.collaborators.filter(c => c.userId !== userId)
      this.markUnsaved()
    },

    /** 更新协作者角色 */
    updateCollaboratorRole(userId: string, role: 'owner' | 'editor' | 'viewer') {
      const collab = this.collaborators.find(c => c.userId === userId)
      if (collab) {
        collab.role = role
        this.markUnsaved()
      }
    },

    // ============= 权限 =============

    /** 更新工具栏状态 */
    updateToolbarState(updates: Partial<ToolbarState>) {
      const current = this.toolbar
      const updated = { ...current, ...updates }
      localStorage.setItem('canvas_toolbar', JSON.stringify(updated))
    },

    /** 更新权限 */
    updatePermissions(permissions: Partial<CanvasState['permissions']>) {
      Object.assign(this.permissions, permissions)
    },

    /** 是否可以编辑 */
    canEditNode(nodeId?: string): boolean {
      if (!this.permissions.canEdit) return false
      if (nodeId) {
        const node = this.nodes.find(n => n.id === nodeId)
        if (node?.locked) return false
      }
      return true
    },

    /** 是否可以删除 */
    canDeleteNode(nodeId?: string): boolean {
      return this.permissions.canDelete && !this.nodes.find(n => n.id === nodeId)?.locked
    },

    // ============= 保存/加载 =============

    /** 标记为未保存 */
    markUnsaved() {
      this.saved = false
      this.updated = Date.now()
    },

    /** 保存到本地 */
    saveToLocalStorage() {
      try {
        const stateToSave = {
          canvasId: this.canvasId,
          canvasName: this.canvasName,
          description: this.description,
          threadId: this.threadId,
          nodes: this.nodes,
          edges: this.edges,
          groups: this.groups,
          viewport: this.viewport,
          tags: this.tags,
          comments: this.comments,
          collaborators: this.collaborators,
          saved: this.saved,
          created: this.created,
          updated: this.updated,
          permissions: this.permissions,
        }
        const key = `canvas_${this.canvasId}`
        localStorage.setItem(key, JSON.stringify(stateToSave))
        this.saved = true
      } catch (e) {
        console.warn('Failed to save canvas to localStorage', e)
      }
    },

    /** 从本地加载 */
    loadFromLocalStorage(canvasId?: string) {
      const id = canvasId || this.canvasId
      if (!id) return false
      const saved = localStorage.getItem(`canvas_${id}`)
      if (!saved) return false
      try {
        const parsed = JSON.parse(saved)
        this.canvasId = parsed.canvasId
        this.canvasName = parsed.canvasName || '加载的画布'
        this.description = parsed.description || ''
        this.threadId = parsed.threadId || ''
        this.nodes = parsed.nodes || []
        this.edges = parsed.edges || []
        this.groups = parsed.groups || []
        this.viewport = parsed.viewport || { x: 0, y: 0, zoom: 1 }
        this.tags = parsed.tags || []
        this.comments = parsed.comments || []
        this.collaborators = parsed.collaborators || []
        this.permissions = parsed.permissions || this.permissions
        this.created = parsed.created || Date.now()
        this.updated = parsed.updated || Date.now()
        this.clearHistory()
        this.pushHistory('load')
        return true
      } catch (e) {
        console.error('Failed to parse canvas from localStorage', e)
        return false
      }
    },

    /** 清空画布 */
    clearCanvas() {
      this.nodes = []
      this.edges = []
      this.groups = []
      this.comments = []
      this.tags = []
      this.clipboard = []
      this.selectedNodes = []
      this.selectedEdges = []
      this.clearHistory()
      this.pushHistory('clear')
      this.markUnsaved()
    },

    /** 获取用户信息 */
    getUserInfo(): { name: string; avatar?: string; id: string } {
      try {
        const saved = localStorage.getItem('canvas_user')
        if (saved) return JSON.parse(saved)
      } catch {}
      return { name: '当前用户', id: 'user_' + Date.now() }
    },

    // ============= 资产库操作 =============

    /** 添加资产到资产库 */
    addAsset(asset: AssetItem) {
      const library = this.assetLibrary
      const type = asset.type
      if (!library[type]) library[type] = []
      // 检查是否已存在
      const exists = library[type].find(a => a.id === asset.id)
      if (!exists) {
        library[type].push(asset)
        localStorage.setItem('canvas_assets', JSON.stringify(library))
      }
    },

    /** 从资产库获取某类资产 */
    getAssetsByType(type: string): AssetItem[] {
      const library = this.assetLibrary
      return library[type] || []
    },

    /** 从资产库删除 */
    removeAsset(type: string, assetId: string) {
      const library = this.assetLibrary
      if (library[type]) {
        library[type] = library[type].filter(a => a.id !== assetId)
        localStorage.setItem('canvas_assets', JSON.stringify(library))
      }
    },

    /** 设置拖拽项 */
    setDragItem(item: DragItem | null) {
      if (item) {
        localStorage.setItem('canvas_drag', JSON.stringify(item))
      } else {
        localStorage.removeItem('canvas_drag')
      }
    },

    /** 查找节点 */
    findNode(nodeId: string): CanvasNode | undefined {
      return this.nodes.find(n => n.id === nodeId)
    },

    /** 搜索节点 */
    searchNodes(keyword: string): CanvasNode[] {
      if (!keyword) return this.nodes
      const lower = keyword.toLowerCase()
      return this.nodes.filter(n => {
        if (n.data && typeof n.data === 'object') {
          return Object.values(n.data).some(v =>
            typeof v === 'string' && v.toLowerCase().includes(lower)
          )
        }
        return false
      })
    },

    /** 导出画布数据 */
    exportData() {
      return {
        version: '1.0',
        canvasId: this.canvasId,
        canvasName: this.canvasName,
        description: this.description,
        nodes: this.nodes,
        edges: this.edges,
        groups: this.groups,
        tags: this.tags,
        comments: this.comments,
        collaborators: this.collaborators,
        exportTime: Date.now(),
      }
    },

    /** 导入画布数据 */
    importData(data: any) {
      if (data.nodes) this.nodes = data.nodes
      if (data.edges) this.edges = data.edges
      if (data.groups) this.groups = data.groups
      if (data.tags) this.tags = data.tags
      if (data.comments) this.comments = data.comments
      if (data.canvasName) this.canvasName = data.canvasName
      if (data.description) this.description = data.description
      this.markUnsaved()
      this.pushHistory('import')
    },

    /** 生成示例画布数据 */
    generateSampleData() {
      this.clearCanvas()
      const now = Date.now()

      // 示例角色
      this.addNode(NodeType.CHARACTER, { x: 100, y: 100 }, { width: 280, height: 320 })
      const char1 = this.nodes[0]
      if (char1) {
        ;(char1.data as any).name = '赵铁牛'
        ;(char1.data as any).role = '男主角'
        ;(char1.data as any).persona = '淮西铁匠，义军领袖。性格暴烈如火却粗中有细，力大无穷，善使玄铁重锤。'
        ;(char1.data as any).images = [{
          url: 'https://picsum.photos/seed/zhao/400/500',
          angle: '正面',
          isMain: true,
        }]
        ;(char1.data as any).prompt = '古代中国男性战士，虬髯大汉，粗布短打，手持铁锤，愤怒表情'
      }

      // 示例场景
      this.addNode(NodeType.SCENE, { x: 500, y: 100 }, { width: 300, height: 280 })
      const scene1 = this.nodes[1]
      if (scene1) {
        ;(scene1.data as any).name = '淮西村庄外荒野官道'
        ;(scene1.data as any).description = '阴沉天空下的荒野官道，远处村庄燃烧黑烟，战马践踏土地，尸体散落。'
        ;(scene1.data as any).images = [{
          url: 'https://picsum.photos/seed/scene1/600/400',
          angle: '全景',
          isMain: true,
        }]
        ;(scene1.data as any).time = '白天'
        ;(scene1.data as any).weather = '阴天/风沙'
        ;(scene1.data as any).atmosphere = '压迫、残酷、悲愤'
      }

      // 示例文本
      this.addNode(NodeType.TEXT, { x: 100, y: 450 }, { width: 260, height: 120 })
      const text1 = this.nodes[2]
      if (text1) {
        ;(text1.data as any).content = '**第一集：烽火初燃**\n边境村庄突遭敌军铁骑践踏，烈火吞噬了家园。主角赵铁牛目睹亲人惨死，在废墟中立誓复仇。'
      }

      // 示例光影控制
      this.addNode(NodeType.LIGHTING, { x: 500, y: 450 }, { width: 260, height: 240 })
      const light1 = this.nodes[3]
      if (light1) {
        ;(light1.data as any).direction = 'side'
        ;(light1.data as any).color = '#ff9944'
        ;(light1.data as any).intensity = 60
        ;(light1.data as any).temperature = 'warm'
        ;(light1.data as any).type = 'key'
        ;(light1.data as any).softness = 40
        ;(light1.data as any).description = '侧逆光，营造悲壮氛围'
      }

      // 示例镜头控制
      this.addNode(NodeType.LENS, { x: 900, y: 100 }, { width: 260, height: 200 })
      const lens1 = this.nodes[4]
      if (lens1) {
        ;(lens1.data as any).focalLength = '50mm'
        ;(lens1.data as any).cameraHeight = 'eye'
        ;(lens1.data as any).movement = 'push'
        ;(lens1.data as any).shotType = 'medium'
        ;(lens1.data as any).angle = '平视'
        ;(lens1.data as any).prompt = '镜头缓慢推进，聚焦主角愤怒的面容'
      }

      // 示例图片
      this.addNode(NodeType.IMAGE, { x: 900, y: 350 }, { width: 280, height: 200 })
      const img1 = this.nodes[5]
      if (img1) {
        ;(img1.data as any).url = 'https://picsum.photos/seed/refer1/600/400'
        ;(img1.data as any).alt = '参考图：战场氛围'
        ;(img1.data as any).source = 'upload'
      }

      // 示例便签
      this.addNode(NodeType.NOTE, { x: 350, y: 500 }, { width: 200, height: 160 })
      const note1 = this.nodes[6]
      if (note1) {
        ;(note1.data as any).content = '注意：这一集要突出主角内心的挣扎与决绝！'
        ;(note1.data as any).color = '#fef08a'
      }

      // 示例提示词
      this.addNode(NodeType.PROMPT, { x: 1200, y: 100 }, { width: 300, height: 200 })
      const prompt1 = this.nodes[7]
      if (prompt1) {
        ;(prompt1.data as any).content = '古代中国战场，黄昏时分，烟雾弥漫，战马奔腾，远景，电影感，高对比度'
        ;(prompt1.data as any).category = 'scene'
        ;(prompt1.data as any).generated = true
      }

      // 示例链接
      this.addNode(NodeType.LINK, { x: 1200, y: 350 }, { width: 220, height: 100 })
      const link1 = this.nodes[8]
      if (link1) {
        ;(link1.data as any).url = 'https://example.com/reference'
        ;(link1.data as any).title = '参考链接：战争场面分析'
        ;(link1.data as any).description = '分析经典战争片镜头语言'
      }

      // 添加连接
      this.addEdge(char1?.id || '', scene1?.id || '', '出场')
      this.addEdge(scene1?.id || '', light1?.id || '', '布光')

      this.markUnsaved()
      this.pushHistory('generate_sample')
      this.fitToScreen()
    },
  },
})
