<template>
  <div class="canvas-toolbar">
    <!-- 左侧：画布名称 -->
    <div class="toolbar-left">
      <div class="canvas-title-wrapper">
        <span class="title-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
        </span>
        <input
          v-model="canvasName"
          class="canvas-title-input"
          placeholder="画布名称"
        />
        <span v-if="!saved" class="unsaved-dot" title="有未保存的更改"></span>
      </div>
    </div>

    <!-- 中间：工具选择 -->
    <div class="toolbar-center">
      <!-- 选择/平移工具 -->
      <div class="tool-group">
        <button
          :class="['tool-btn', { active: activeTool === 'select' }]"
          @click="setTool('select')"
          title="选择 (V)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
            <path d="M13 13l6 6" />
          </svg>
        </button>
        <button
          :class="['tool-btn', { active: activeTool === 'pan' }]"
          @click="setTool('pan')"
          title="平移 (H)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 11V6a2 2 0 0 0-2-2v4a2 2 0 0 1-2 2v-4a2 2 0 0 0-2-2v4a2 2 0 0 1-2 2v-4a2 2 0 0 0-2-2v4a2 2 0 0 1-2 2v4" />
            <path d="M5 11V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5" />
            <path d="M5 11h14v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3z" />
          </svg>
        </button>
      </div>

      <!-- 视图控制 -->
      <div class="tool-divider"></div>
      <div class="tool-group">
        <button
          :class="['tool-btn', { active: toolbar.showGrid }]"
          @click="toggleGrid"
          title="网格"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="3" y1="15" x2="21" y2="15" />
            <line x1="9" y1="3" x2="9" y2="21" />
            <line x1="15" y1="3" x2="15" y2="21" />
          </svg>
        </button>
        <button
          :class="['tool-btn', { active: toolbar.snapToGrid }]"
          @click="toggleSnapToGrid"
          title="对齐网格"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 7 10 7 10 21" />
            <polyline points="14 21 14 7 21 7" />
            <polyline points="3 17 21 17" />
          </svg>
        </button>
        <button
          :class="['tool-btn', { active: toolbar.showMinimap }]"
          @click="toggleMinimap"
          title="缩略图导航"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <rect x="7" y="7" width="6" height="6" rx="1" fill="currentColor" opacity="0.5" />
          </svg>
        </button>
      </div>

      <!-- 缩放控制 -->
      <div class="tool-divider"></div>
      <div class="zoom-group">
        <button @click="zoomOut" class="zoom-btn" title="缩小 (−)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <span class="zoom-level">{{ Math.round(viewport.zoom * 100) }}%</span>
        <button @click="zoomIn" class="zoom-btn" title="放大 (+)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button @click="fitToScreen" class="zoom-btn" title="适配屏幕">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 右侧：操作按钮 -->
    <div class="toolbar-right">
      <!-- 撤销/重做 -->
      <div class="tool-group">
        <button
          :class="['tool-btn', { disabled: !canUndo }]"
          :disabled="!canUndo"
          @click="undo"
          title="撤销 (Ctrl+Z)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </button>
        <button
          :class="['tool-btn', { disabled: !canRedo }]"
          :disabled="!canRedo"
          @click="redo"
          title="重做 (Ctrl+Y)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10" />
          </svg>
        </button>
      </div>

      <div class="tool-divider"></div>

      <!-- 剪切板 -->
      <div class="tool-group">
        <button
          @click="copy"
          :disabled="selectedNodes.length === 0"
          :class="['tool-btn', { disabled: selectedNodes.length === 0 }]"
          title="复制 (Ctrl+C)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
        <button
          @click="paste"
          :disabled="clipboard.length === 0"
          :class="['tool-btn', { disabled: clipboard.length === 0 }]"
          title="粘贴 (Ctrl+V)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          </svg>
        </button>
      </div>

      <div class="tool-divider"></div>

      <!-- 选择操作 -->
      <div class="tool-group">
        <button
          @click="selectAll"
          class="tool-btn"
          title="全选 (Ctrl+A)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" opacity="0.15" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </button>
        <button
          @click="deleteSelected"
          :disabled="selectedNodes.length === 0"
          :class="['tool-btn', { disabled: selectedNodes.length === 0 }]"
          title="删除 (Delete)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>

      <div class="tool-divider"></div>

      <!-- AI 功能 -->
      <div class="tool-group">
        <button
          @click="onAIGenerate"
          class="tool-btn ai-btn"
          title="AI 生成"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z" />
          </svg>
          <span>AI</span>
        </button>
      </div>

      <div class="tool-divider"></div>

      <!-- 评论 -->
      <button
        @click="toggleComments"
        :class="['tool-btn', { active: showComments }]"
        title="评论"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span v-if="comments.length > 0" class="comment-badge">{{ comments.length }}</span>
      </button>

      <!-- 分享 -->
      <button
        @click="onShare"
        class="tool-btn"
        title="分享"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      </button>

      <!-- 导出/导入 -->
      <button
        @click="onExport"
        class="tool-btn"
        title="导出"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </button>

      <button
        @click="onImport"
        class="tool-btn"
        title="导入"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 13 7 8" />
          <line x1="12" y1="3" x2="12" y2="13" />
        </svg>
      </button>

      <!-- 保存 -->
      <button
        @click="onSave"
        :class="['tool-btn save-btn', { unsaved: !saved }]"
        title="保存 (Ctrl+S)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCanvasStore } from '../../store/canvas'

const canvasStore = useCanvasStore()

const activeTool = ref('select')
const showComments = ref(false)

// 从 store 计算属性
const canvasName = computed({
  get: () => canvasStore.canvasName,
  set: (val: string) => canvasStore.setCanvasName(val),
})

const viewport = computed(() => canvasStore.viewport)
const toolbar = computed(() => canvasStore.toolbar)
const selectedNodes = computed(() => canvasStore.selectedNodes)
const clipboard = computed(() => canvasStore.clipboard)
const comments = computed(() => canvasStore.comments)
const saved = computed(() => canvasStore.saved)
const canUndo = computed(() => canvasStore.canUndo)
const canRedo = computed(() => canvasStore.canRedo)

// 工具切换
function setTool(tool: string) {
  activeTool.value = tool
}

// 视图切换
function toggleGrid() {
  canvasStore.updateToolbarState({ showGrid: !canvasStore.toolbar.showGrid })
}

function toggleSnapToGrid() {
  canvasStore.updateToolbarState({ snapToGrid: !canvasStore.toolbar.snapToGrid })
}

function toggleMinimap() {
  canvasStore.updateToolbarState({ showMinimap: !canvasStore.toolbar.showMinimap })
}

// 缩放
function zoomIn() {
  canvasStore.setZoom(canvasStore.viewport.zoom + 0.1)
}

function zoomOut() {
  canvasStore.setZoom(canvasStore.viewport.zoom - 0.1)
}

function fitToScreen() {
  canvasStore.fitToScreen()
}

// 历史
function undo() {
  canvasStore.undo()
}

function redo() {
  canvasStore.redo()
}

// 剪切板
function copy() {
  canvasStore.copySelected()
}

function paste() {
  canvasStore.paste()
}

// 选择
function selectAll() {
  canvasStore.selectAll()
}

function deleteSelected() {
  if (canvasStore.selectedNodes.length > 0) {
    canvasStore.removeNodes(canvasStore.selectedNodes)
  }
}

// AI
function onAIGenerate() {
  emit('ai-generate')
}

// 评论
function toggleComments() {
  showComments.value = !showComments.value
  emit('toggle-comments', showComments.value)
}

// 分享/导出/导入/保存
function onShare() {
  emit('share')
}

function onExport() {
  emit('export')
}

function onImport() {
  emit('import')
}

function onSave() {
  canvasStore.saveToLocalStorage()
}

// 快捷键
function handleKeydown(e: KeyboardEvent) {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key.toLowerCase()) {
      case 'z':
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
        break
      case 'y':
        e.preventDefault()
        redo()
        break
      case 'c':
        e.preventDefault()
        copy()
        break
      case 'v':
        e.preventDefault()
        paste()
        break
      case 'a':
        e.preventDefault()
        selectAll()
        break
      case 's':
        e.preventDefault()
        onSave()
        break
    }
  } else if (e.key === 'Delete' || e.key === 'Backspace') {
    deleteSelected()
  } else if (e.key === 'Escape') {
    canvasStore.clearSelection()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// 需要添加 updateToolbarState 方法到 store
// 这里我们调用一个新的方法
const emit = defineEmits<{
  'ai-generate': []
  'toggle-comments': [show: boolean]
  'share': []
  'export': []
  'import': []
}>()
</script>

<style scoped>
.canvas-toolbar {
  height: 48px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 8px;
}

.toolbar-left {
  flex-shrink: 0;
}

.canvas-title-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
}

.title-icon {
  color: #6366f1;
}

.canvas-title-input {
  border: none;
  outline: none;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  background: transparent;
  width: 180px;
}

.canvas-title-input:focus {
  background: #f1f5f9;
  border-radius: 4px;
  padding: 2px 6px;
}

.unsaved-dot {
  width: 6px;
  height: 6px;
  background: #f97316;
  border-radius: 50%;
  flex-shrink: 0;
}

.toolbar-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.toolbar-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.tool-group {
  display: flex;
  gap: 2px;
}

.tool-divider {
  width: 1px;
  height: 24px;
  background: #e2e8f0;
  margin: 0 4px;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.15s;
  font-size: 13px;
}

.tool-btn:hover:not(.disabled) {
  background: #f1f5f9;
  color: #334155;
}

.tool-btn.active {
  background: #eef2ff;
  color: #6366f1;
}

.tool-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.tool-btn.ai-btn {
  color: #8b5cf6;
}

.tool-btn.ai-btn:hover {
  background: #f3e8ff;
  color: #7c3aed;
}

.tool-btn.save-btn {
  background: #6366f1;
  color: white;
}

.tool-btn.save-btn:hover {
  background: #4f46e5;
}

.tool-btn.save-btn.unsaved {
  background: #f97316;
}

.tool-btn.save-btn.unsaved:hover {
  background: #ea580c;
}

.zoom-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.zoom-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.15s;
}

.zoom-btn:hover {
  background: #f1f5f9;
  color: #334155;
}

.zoom-level {
  font-size: 13px;
  color: #64748b;
  min-width: 50px;
  text-align: center;
  font-weight: 500;
}

.comment-badge {
  font-size: 10px;
  background: #ef4444;
  color: white;
  padding: 1px 5px;
  border-radius: 8px;
  font-weight: 600;
  min-width: 16px;
  text-align: center;
}
</style>
