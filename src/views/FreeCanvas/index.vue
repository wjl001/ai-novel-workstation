<template>
  <div class="free-canvas-container" @contextmenu.prevent="handleContextMenu">
    <!-- 左侧节点面板 -->
    <NodePanel ref="panelRef" @add-node="handleAddNode" />

    <!-- 画布区域 -->
    <div class="canvas-area" ref="canvasAreaRef" @mousedown="onCanvasMouseDown" @wheel="onWheel">
      <!-- 画布视口 -->
      <div class="canvas-viewport" :style="viewportStyle">
        <!-- 网格背景 -->
        <div class="canvas-grid" :style="gridStyle"></div>

        <!-- 连接线层 -->
        <ConnectionLayer
          :connections="canvasStore.connections"
          :nodes="canvasStore.nodes"
          :scale="canvasStore.scale.value"
          :offset="canvasStore.offset"
        />

        <!-- 节点层 -->
        <RoleNode
          v-for="node in canvasStore.getNodesByType('role')"
          :key="node.id"
          :node="node"
          :is-selected="canvasStore.selectedNodeId.value === node.id"
          :is-dragging="draggingNodeId === node.id"
          @select="handleNodeSelect(node.id)"
          @delete="canvasStore.removeNode(node.id)"
          @drag-start="startDrag"
          @open-edit="openNodeDialog(node.id)"
          @open-voice="openNodeDialog(node.id)"
          @add-context="handleAddContext(node.id, $event)"
          @add-generation="handleAddGeneration(node.id, $event)"
        />
        <SceneNode
          v-for="node in canvasStore.getNodesByType('scene')"
          :key="node.id"
          :node="node"
          :is-selected="canvasStore.selectedNodeId.value === node.id"
          :is-dragging="draggingNodeId === node.id"
          @select="handleNodeSelect(node.id)"
          @delete="canvasStore.removeNode(node.id)"
          @drag-start="startDrag"
          @update-label="onNodeLabelUpdate(node.id, $event)"
          @update-desc="onNodeDescUpdate(node.id, $event)"
        />
        <TextNode
          v-for="node in canvasStore.getNodesByType('text')"
          :key="node.id"
          :node="node"
          :is-selected="canvasStore.selectedNodeId.value === node.id"
          :is-dragging="draggingNodeId === node.id"
          @select="handleNodeSelect(node.id)"
          @delete="canvasStore.removeNode(node.id)"
          @drag-start="startDrag"
          @update-content="onNodeContentUpdate(node.id, $event)"
        />
        <ImageNode
          v-for="node in canvasStore.getNodesByType('image')"
          :key="node.id"
          :node="node"
          :is-selected="canvasStore.selectedNodeId.value === node.id"
          :is-dragging="draggingNodeId === node.id"
          @select="handleNodeSelect(node.id)"
          @delete="canvasStore.removeNode(node.id)"
          @drag-start="startDrag"
          @update-name="onNodeNameUpdate(node.id, $event)"
        />
        <VideoNode
          v-for="node in canvasStore.getNodesByType('video')"
          :key="node.id"
          :node="node"
          :is-selected="canvasStore.selectedNodeId.value === node.id"
          :is-dragging="draggingNodeId === node.id"
          @select="handleNodeSelect(node.id)"
          @delete="canvasStore.removeNode(node.id)"
          @drag-start="startDrag"
          @update-name="onNodeNameUpdate(node.id, $event)"
        />
        <AudioNode
          v-for="node in canvasStore.getNodesByType('audio')"
          :key="node.id"
          :node="node"
          :is-selected="canvasStore.selectedNodeId.value === node.id"
          :is-dragging="draggingNodeId === node.id"
          @select="handleNodeSelect(node.id)"
          @delete="canvasStore.removeNode(node.id)"
          @drag-start="startDrag"
        />
      </div>
    </div>

    <!-- 右键菜单 -->
    <ContextMenu
      v-if="contextMenu.visible"
      :position="contextMenu.position"
      :title="contextMenu.title"
      :items="contextMenu.items"
      @select="handleContextMenuSelect"
      @close="closeContextMenu"
    />

    <!-- 节点对话框 -->
    <NodeDialog
      v-if="showNodeDialog && dialogNode"
      :node="dialogNode"
      :show="showNodeDialog"
      :position="dialogPosition"
      @close="closeNodeDialog"
      @save="handleNodeSave"
      @add-context="handleAddContext(dialogNode.id, $event)"
      @add-generation="handleAddGeneration(dialogNode.id, $event)"
      @remove-context="handleRemoveContext(dialogNode.id, $event)"
      @remove-generation="handleRemoveGeneration(dialogNode.id, $event)"
    />

    <!-- 底部工具栏 -->
    <div class="bottom-toolbar">
      <div class="toolbar-center">
        <button class="toolbar-btn" @click="canvasStore.zoomOut">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>
        <span class="zoom-level">{{ Math.round(canvasStore.scale.value * 100) }}%</span>
        <button class="toolbar-btn" @click="canvasStore.zoomIn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>
      </div>

      <div class="toolbar-right">
        <button class="toolbar-btn" @click="canvasStore.clearCanvas" title="清空画布">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
        <button class="toolbar-btn toolbar-btn-primary" @click="saveCanvas" title="保存">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
          </svg>
          <span>保存</span>
        </button>
      </div>
    </div>

    <!-- 信息提示 -->
    <div class="canvas-hint">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="4 4"/>
        <line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
      <span>点击左侧工具添加节点到画布</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCanvasStore } from './composables/useCanvasStore'
import type { NodePosition, ContextType, GenerateType, MenuItem, AddNodeParams, CanvasNode } from './types'
import NodePanel from './components/NodePanel.vue'
import ContextMenu from './components/ContextMenu.vue'
import ConnectionLayer from './components/ConnectionLayer.vue'
import RoleNode from './components/RoleNode.vue'
import SceneNode from './components/SceneNode.vue'
import TextNode from './components/TextNode.vue'
import ImageNode from './components/ImageNode.vue'
import VideoNode from './components/VideoNode.vue'
import AudioNode from './components/AudioNode.vue'
import NodeDialog from './components/NodeDialog.vue'

const canvasStore = useCanvasStore()
const panelRef = ref()
const canvasAreaRef = ref<HTMLElement>()
const draggingNodeId = ref<string | null>(null)
const dragOffset = ref<NodePosition>({ x: 0, y: 0 })

// 对话框状态
const showNodeDialog = ref(false)
const dialogNodeId = ref<string | null>(null)
const dialogPosition = ref<NodePosition>({ x: 0, y: 0 })

// 右键菜单状态
const contextMenu = ref<{
  visible: boolean
  position: { x: number; y: number }
  title: string
  items: MenuItem[]
}>({
  visible: false,
  position: { x: 0, y: 0 },
  title: '',
  items: []
})

// 计算属性
const dialogNode = computed(() => {
  if (!dialogNodeId.value) return null
  return canvasStore.getNode(dialogNodeId.value)
})

const viewportStyle = computed(() => ({
  transform: `translate(${canvasStore.offset.x}px, ${canvasStore.offset.y}px) scale(${canvasStore.scale.value})`
}))

const gridStyle = computed(() => ({
  backgroundImage: `radial-gradient(circle, #e2e8f0 1px, transparent 1px)`,
  backgroundSize: `${20 * canvasStore.scale.value}px ${20 * canvasStore.scale.value}px`,
  backgroundPosition: `${canvasStore.offset.x}px ${canvasStore.offset.y}px`
}))

// 节点选择 - 显示对话框
const handleNodeSelect = (nodeId: string) => {
  canvasStore.selectNode(nodeId)
  // 点击节点时显示对话框
  openNodeDialog(nodeId)
}

// 打开对话框
const openNodeDialog = (nodeId: string) => {
  const node = canvasStore.getNode(nodeId)
  if (!node) return
  dialogNodeId.value = nodeId
  showNodeDialog.value = true
  // 对话框跟随节点位置
  updateDialogPosition(node)
}

// 更新对话框位置（转换为屏幕坐标）
const updateDialogPosition = (node: CanvasNode) => {
  if (!canvasAreaRef.value) return
  const canvasRect = canvasAreaRef.value.getBoundingClientRect()
  // 将画布坐标转换为屏幕坐标：(画布坐标 * scale + offset) + canvasArea位置
  const dialogX = (node.position.x + node.size.width + 16) * canvasStore.scale.value + canvasStore.offset.x + canvasRect.left
  const dialogY = (node.position.y + 30) * canvasStore.scale.value + canvasStore.offset.y + canvasRect.top
  dialogPosition.value = { x: dialogX, y: dialogY }
}

// 关闭对话框
const closeNodeDialog = () => {
  showNodeDialog.value = false
  dialogNodeId.value = null
}

// 对话框保存
const handleNodeSave = (data: any) => {
  const node = dialogNode.value
  if (!node) return
  if (node.type === 'role') {
    canvasStore.updateNode({
      id: node.id,
      label: data.roleName,
      data: {
        imageName: data.imageName,
        voiceDescription: data.voiceDescription,
        voiceType: data.voiceType
      }
    })
  } else {
    canvasStore.updateNode({
      id: node.id,
      label: data.name || node.label,
      data: {
        description: data.description
      }
    })
  }
  closeNodeDialog()
}

// 拖拽处理 - 同步更新对话框位置
const startDrag = (event: MouseEvent, nodeId: string) => {
  const node = canvasStore.getNode(nodeId)
  if (!node) return
  draggingNodeId.value = nodeId
  // 屏幕坐标 → 画布局部坐标的偏移
  dragOffset.value = {
    x: event.clientX - (node.position.x * canvasStore.scale.value + canvasStore.offset.x),
    y: event.clientY - (node.position.y * canvasStore.scale.value + canvasStore.offset.y)
  }
  // 如果对话框打开的是当前节点，关闭它避免干扰
  if (dialogNodeId.value === nodeId) {
    closeNodeDialog()
  }
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

const onDrag = (event: MouseEvent) => {
  if (!draggingNodeId.value) return
  // 屏幕坐标 → 画布局部坐标
  canvasStore.updateNodePosition(draggingNodeId.value, {
    x: (event.clientX - dragOffset.value.x - canvasStore.offset.x) / canvasStore.scale.value,
    y: (event.clientY - dragOffset.value.y - canvasStore.offset.y) / canvasStore.scale.value
  })
}

const stopDrag = () => {
  draggingNodeId.value = null
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// 画布操作
const onCanvasMouseDown = (event: MouseEvent) => {
  // 点击空白处取消选择并关闭对话框
  const target = event.target as HTMLElement
  if (!target.closest('[class*="-node"]')) {
    canvasStore.selectNode(null)
    closeNodeDialog()
  }
}

const onWheel = (event: WheelEvent) => {
  event.preventDefault()
  if (event.deltaY > 0) {
    canvasStore.zoomOut()
  } else {
    canvasStore.zoomIn()
  }
}

// 节点操作
const handleAddNode = (type: string) => {
  const params: AddNodeParams = {
    type: type as any,
    label: type === 'role' ? '未命名角色' :
           type === 'scene' ? '新场景' :
           type === 'text' ? '新文本' :
           type === 'image' ? '新图片' :
           type === 'video' ? '新视频' : '新音频'
  }
  canvasStore.addNode(params)
}

const onNodeLabelUpdate = (nodeId: string, label: string) => {
  canvasStore.updateNode({ id: nodeId, label })
}

const onNodeDescUpdate = (nodeId: string, description: string) => {
  canvasStore.updateNode({ id: nodeId, data: { description } })
}

const onNodeContentUpdate = (nodeId: string, content: string) => {
  canvasStore.updateNode({ id: nodeId, data: { textContent: content } })
}

const onNodeNameUpdate = (nodeId: string, name: string) => {
  canvasStore.updateNode({ id: nodeId, data: { name } })
}

// 添加上下文 - 创建新节点并连接
const handleAddContext = (nodeId: string, type: ContextType) => {
  const sourceNode = canvasStore.getNode(nodeId)
  if (!sourceNode) return
  
  // 创建新节点
  const labelMap: Record<string, string> = {
    text: '新文本',
    image: '新图片',
    role: '未命名角色'
  }
  const newNode = canvasStore.addNode({
    type: type as any,
    label: labelMap[type] || '新节点'
  })
  
  // 将新节点放在源节点左侧
  canvasStore.updateNodePosition(newNode.id, {
    x: sourceNode.position.x - newNode.size.width - 40,
    y: sourceNode.position.y + sourceNode.size.height / 2 - newNode.size.height / 2
  })
  
  // 添加连接线（新节点 → 源节点）
  canvasStore.addConnection(newNode.id, sourceNode.id, type)
}

// 添加生成结果 - 创建新节点并连接
const handleAddGeneration = (nodeId: string, type: GenerateType) => {
  const sourceNode = canvasStore.getNode(nodeId)
  if (!sourceNode) return
  
  // 创建新节点
  const labelMap: Record<string, string> = {
    image: '生成图片',
    video: '生成视频',
    audio: '生成音频',
    role: '生成角色'
  }
  const newNode = canvasStore.addNode({
    type: type as any,
    label: labelMap[type] || '生成内容'
  })
  
  // 将新节点放在源节点右侧
  canvasStore.updateNodePosition(newNode.id, {
    x: sourceNode.position.x + sourceNode.size.width + 40,
    y: sourceNode.position.y + sourceNode.size.height / 2 - newNode.size.height / 2
  })
  
  // 添加连接线（源节点 → 新节点）
  canvasStore.addConnection(sourceNode.id, newNode.id, type)
}

// 删除上下文
const handleRemoveContext = (nodeId: string, index: number) => {
  const node = canvasStore.getNode(nodeId)
  if (node && node.contexts && node.contexts[index]) {
    canvasStore.removeContext(nodeId, node.contexts[index].id)
  }
}

// 删除生成结果
const handleRemoveGeneration = (nodeId: string, index: number) => {
  const node = canvasStore.getNode(nodeId)
  if (node && node.generations && node.generations[index]) {
    canvasStore.removeGeneration(nodeId, node.generations[index].id)
  }
}

// 右键菜单
const handleContextMenu = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (target.closest('[class*="-node"]')) return

  contextMenu.value = {
    visible: true,
    position: { x: event.clientX, y: event.clientY },
    title: '添加节点',
    items: [
      { id: 'role', label: '角色', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>', type: 'role' as any, action: 'addContext' },
      { id: 'scene', label: '场景', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>', type: 'scene' as any, action: 'addContext' },
      { id: 'text', label: '文本', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>', type: 'text' as any, action: 'addContext' },
      { id: 'image', label: '图片', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>', type: 'image' as any, action: 'addContext' },
      { id: 'video', label: '视频', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>', type: 'video' as any, action: 'addContext' },
      { id: 'audio', label: '音频', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>', type: 'audio' as any, action: 'addContext' }
    ]
  }
}

const handleContextMenuSelect = (item: MenuItem) => {
  const params: AddNodeParams = {
    type: item.type,
    label: item.label
  }
  canvasStore.addNode(params)
  closeContextMenu()
}

const closeContextMenu = () => {
  contextMenu.value.visible = false
}

// 工具栏操作
const saveCanvas = () => {
  canvasStore.saveToLocalStorage()
}

// 键盘事件
const onKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Delete' && canvasStore.selectedNodeId && !showNodeDialog.value) {
    canvasStore.removeNode(canvasStore.selectedNodeId.value!)
  }
  if (event.key === 'Escape') {
    canvasStore.selectNode(null)
    closeContextMenu()
    closeNodeDialog()
  }
}

onMounted(() => {
  canvasStore.loadFromLocalStorage()
  document.addEventListener('keydown', onKeyDown)
  window.addEventListener('resize', () => {
    canvasStore.updateViewport(window.innerWidth, window.innerHeight)
  })
})

onUnmounted(() => {
  canvasStore.saveToLocalStorage()
  document.removeEventListener('keydown', onKeyDown)
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})
</script>

<style scoped>
.free-canvas-container {
  width: 100%;
  height: 100%;
  background: #f8fafc;
  position: relative;
  overflow: hidden;
}

.canvas-area {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  cursor: default;
}

.canvas-viewport {
  width: 100%;
  height: 100%;
  transform-origin: 0 0;
  position: relative;
}

.canvas-grid {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
}

.bottom-toolbar {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  z-index: 100;
}

.toolbar-center, .toolbar-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background: #f1f5f9;
  color: #475569;
}

.toolbar-btn-primary {
  background: #6366f1;
  color: white;
}

.toolbar-btn-primary:hover {
  background: #4f46e5;
}

.zoom-level {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  padding: 0 8px;
  min-width: 50px;
  text-align: center;
}

.canvas-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #94a3b8;
  pointer-events: none;
}

.canvas-hint span {
  font-size: 14px;
  font-weight: 600;
}
</style>