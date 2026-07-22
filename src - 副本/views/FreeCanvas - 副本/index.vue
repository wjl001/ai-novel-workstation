<template>
  <div class="free-canvas-app">
    <!-- 顶部工具栏 -->
    <CanvasToolbar />

    <div class="canvas-main">
      <!-- 左侧：资产库侧边栏 -->
      <div class="sidebar" :class="{ collapsed: sidebarCollapsed }">
        <AssetLibraryPanel
          @create-node="onCreateNode"
          @select-node="onSelectNode"
          @clear-canvas="onClearCanvas"
          @collapse="sidebarCollapsed = !sidebarCollapsed"
        />
      </div>

      <!-- 中间：画布区域 -->
      <div class="canvas-area" @contextmenu.prevent="onContextMenu">
        <!-- 画布容器 -->
        <div
          class="canvas-viewport"
          :style="viewportStyle"
          @mousedown="onCanvasMouseDown"
          @mousemove="onCanvasMouseMove"
          @mouseup="onCanvasMouseUp"
          @mouseleave="onCanvasMouseUp"
        >
          <!-- 网格背景 -->
          <div class="grid-bg" :style="gridStyle"></div>

          <!-- 画布节点列表 -->
          <div class="nodes-container">
            <CanvasNode
              v-for="node in visibleNodes"
              :key="node.id"
              :node="node"
              :is-selected="canvasStore.isSelected(node.id)"
              @node-click="onNodeClick"
              @node-dblclick="onNodeDblClick"
              @lock-toggle="canvasStore.toggleNodeLock($event)"
              @delete="canvasStore.removeNode($event)"
              @dragstart="onNodeDragStart($event)"
              @drag="onNodeDrag($event)"
              @dragend="onNodeDragEnd"
            />
          </div>

          <!-- 空白区域点击取消选择 -->
          <div
            class="canvas-bg-click"
            @click="onCanvasClick"
            @dblclick="onCanvasDblClick"
          ></div>
        </div>

        <!-- 画布底部信息栏 -->
        <div class="canvas-footer">
          <span class="footer-info">{{ canvasStore.nodes.length }} 节点 · {{ canvasStore.edges.length }} 连接</span>
          <span class="footer-info">视口: {{ Math.round(canvasStore.viewport.x) }}, {{ Math.round(canvasStore.viewport.y) }} · {{ Math.round(canvasStore.viewport.zoom * 100) }}%</span>
        </div>
      </div>

      <!-- 右侧：属性编辑器 -->
      <div class="editor" :class="{ collapsed: editorCollapsed }">
        <NodeEditorPanel
          @add-node="onCreateNode"
          @update-field="onUpdateNodeField"
          @update-position="onUpdateNodePosition"
          @update-opacity="canvasStore.setNodeOpacity"
          @duplicate="canvasStore.duplicateNode"
          @delete="canvasStore.removeNode"
          @generate="onGenerateAI"
          @generate-image="onGenerateImage"
        />
      </div>

      <!-- 评论面板 -->
      <CommentSystem
        v-if="showComments"
        @close="showComments = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCanvasStore } from '../../store/canvas'
import { NodeType } from '../../types/canvas'
import CanvasToolbar from '../../components/canvas/CanvasToolbar.vue'
import AssetLibraryPanel from '../../components/canvas/AssetLibraryPanel.vue'
import NodeEditorPanel from '../../components/canvas/NodeEditorPanel.vue'
import CanvasNode from '../../components/canvas/CanvasNode.vue'
import CommentSystem from '../../components/canvas/CommentSystem.vue'

const canvasStore = useCanvasStore()

// 状态
const sidebarCollapsed = ref(false)
const editorCollapsed = ref(false)
const showComments = ref(false)
const dragState = ref<{
  isDragging: boolean
  isPanning: boolean
  nodeId?: string
  startX: number
  startY: number
  startNodeX: number
  startNodeY: number
  startViewX: number
  startViewY: number
}>({
  isDragging: false,
  isPanning: false,
  startX: 0,
  startY: 0,
  startNodeX: 0,
  startNodeY: 0,
  startViewX: 0,
  startViewY: 0,
})

// 可见节点
const visibleNodes = computed(() =>
  canvasStore.nodes.filter((n: any) => !n.hidden)
)

// 视口样式
const viewportStyle = computed(() => ({
  transform: `translate(${canvasStore.viewport.x}px, ${canvasStore.viewport.y}px) scale(${canvasStore.viewport.zoom})`,
  transformOrigin: '0 0',
}))

// 网格样式
const gridStyle = computed(() => ({
  backgroundSize: `${canvasStore.toolbar.snapToGrid ? 20 : 40}px ${canvasStore.toolbar.snapToGrid ? 20 : 40}px`,
  opacity: canvasStore.toolbar.showGrid ? 1 : 0,
}))

// 节点创建
function onCreateNode(type: NodeType) {
  canvasStore.addNode(type, {
    x: -canvasStore.viewport.x + 300,
    y: -canvasStore.viewport.y + 200,
  })
}

// 节点选择
function onSelectNode(id: string) {
  canvasStore.selectNode(id)
}

// 节点点击
function onNodeClick(id: string) {
  if (dragState.value.isDragging) return
  canvasStore.selectNode(id)
}

// 节点双击
function onNodeDblClick(id: string) {
  // 双击进入编辑模式
  canvasStore.selectNode(id)
}

// 画布点击
function onCanvasClick() {
  canvasStore.clearSelection()
}

// 画布双击创建节点
function onCanvasDblClick() {
  // 可选：双击画布创建文本节点
}

// 节点拖拽
function onNodeDragStart(event: { nodeId: string; x: number; y: number }) {
  const node = canvasStore.findNode(event.nodeId)
  if (!node || node.locked) return
  canvasStore.selectNode(event.nodeId)
  dragState.value = {
    isDragging: true,
    isPanning: false,
    nodeId: event.nodeId,
    startX: event.x,
    startY: event.y,
    startNodeX: node.position.x,
    startNodeY: node.position.y,
    startViewX: canvasStore.viewport.x,
    startViewY: canvasStore.viewport.y,
  }
}

function onNodeDrag(event: { x: number; y: number }) {
  if (!dragState.value.isDragging || !dragState.value.nodeId) return
  const dx = event.x - dragState.value.startX
  const dy = event.y - dragState.value.startY
  const node = canvasStore.findNode(dragState.value.nodeId)
  if (!node) return

  let newX = dragState.value.startNodeX + dx
  let newY = dragState.value.startNodeY + dy

  // 网格对齐
  if (canvasStore.toolbar.snapToGrid) {
    newX = Math.round(newX / canvasStore.toolbar.gridSize) * canvasStore.toolbar.gridSize
    newY = Math.round(newY / canvasStore.toolbar.gridSize) * canvasStore.toolbar.gridSize
  }

  canvasStore.updateNodePosition(dragState.value.nodeId, { x: newX, y: newY })
}

function onNodeDragEnd() {
  dragState.value.isDragging = false
  dragState.value.nodeId = undefined
}

// 画布平移
function onCanvasMouseDown(event: MouseEvent) {
  // 检查是否点击了空白区域
  const target = event.target as HTMLElement
  if (target.classList.contains('canvas-area') || target.classList.contains('canvas-viewport')) {
    dragState.value = {
      isDragging: false,
      isPanning: true,
      startX: event.clientX,
      startY: event.clientY,
      startNodeX: 0,
      startNodeY: 0,
      startViewX: canvasStore.viewport.x,
      startViewY: canvasStore.viewport.y,
    }
  }
}

function onCanvasMouseMove(event: MouseEvent) {
  if (dragState.value.isPanning) {
    const dx = event.clientX - dragState.value.startX
    const dy = event.clientY - dragState.value.startY
    canvasStore.updateViewport({
      x: dragState.value.startViewX + dx,
      y: dragState.value.startViewY + dy,
    })
  }
}

function onCanvasMouseUp() {
  dragState.value.isPanning = false
}

// 节点字段更新
function onUpdateNodeField(nodeId: string, data: Record<string, any>) {
  canvasStore.updateNodeData(nodeId, data)
}

function onUpdateNodePosition(nodeId: string, key: 'x' | 'y', value: number) {
  const node = canvasStore.findNode(nodeId)
  if (!node) return
  const position = { ...node.position, [key]: value }
  canvasStore.updateNodePosition(nodeId, position)
}

// 缩放
function onWheel(event: WheelEvent) {
  if (event.ctrlKey) {
    event.preventDefault()
    const delta = event.deltaY > 0 ? -0.1 : 0.1
    canvasStore.setZoom(canvasStore.viewport.zoom + delta)
  }
}

// 右键菜单
function onContextMenu(event: MouseEvent) {
  // 可以在这里实现右键菜单
}

// 导入/导出
function onImport() {
  // 实现导入功能
}

function onExport() {
  // 实现导出功能
}

// 分享
function onShare() {
  // 实现分享功能
}

// 保存
function onSave() {
  canvasStore.saveToLocalStorage()
}

// 清空画布
function onClearCanvas() {
  if (confirm('确定要清空画布吗？此操作不可撤销。')) {
    canvasStore.clearCanvas()
  }
}

// 生成 AI 内容
function onGenerateAI(nodeId: string) {
  // 调用 LLM API 生成内容
}

function onGenerateImage(nodeId: string) {
  // 调用图像生成 API
}

// 生命周期
onMounted(() => {
  window.addEventListener('wheel', onWheel, { passive: false })
  // 加载画布数据
  if (!canvasStore.canvasId) {
    canvasStore.initCanvas()
  } else {
    canvasStore.loadFromLocalStorage()
  }
})

onUnmounted(() => {
  window.removeEventListener('wheel', onWheel)
  // 保存画布数据
  if (canvasStore.hasUnsavedChanges) {
    canvasStore.saveToLocalStorage()
  }
})
</script>

<style scoped>
.free-canvas-app {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f8fafc;
}

.canvas-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  height: 100%;
  transition: width 0.2s ease;
  flex-shrink: 0;
}

.sidebar.collapsed {
  width: 52px;
}

.canvas-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  background: #f1f5f9;
}

.canvas-viewport {
  flex: 1;
  position: relative;
  overflow: hidden;
  cursor: default;
}

.grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, #e2e8f0 1px, transparent 1px),
    linear-gradient(to bottom, #e2e8f0 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 1;
  pointer-events: none;
  transition: opacity 0.2s;
}

.nodes-container {
  position: absolute;
  inset: 0;
}

.canvas-bg-click {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.canvas-footer {
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  font-size: 12px;
  color: #64748b;
}

.editor {
  height: 100%;
  transition: width 0.2s ease;
  flex-shrink: 0;
}

.editor.collapsed {
  width: 48px;
}

/* 画布节点样式 */
.canvas-node {
  position: absolute;
  z-index: 10;
  transition: box-shadow 0.15s;
}

/* 滚动条 */
.canvas-area::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.canvas-area::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.canvas-area::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
