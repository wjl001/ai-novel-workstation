<template>
  <div 
    class="role-node"
    :class="{ 'is-selected': isSelected, 'is-dragging': isDragging }"
    :style="nodeStyle"
    @mousedown.stop="onMouseDown"
    @click.stop="onSelect"
  >
    <!-- 角色图像区 -->
    <div class="role-preview">
      <div class="preview-placeholder">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
    </div>

    <!-- 底部操作区 -->
    <div class="node-bottom">
      <div class="bottom-actions">
        <button class="circle-btn" @click.stop="handleVoiceClick" title="音色">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 3v18M9 8c0-2 1-3 3-3s3 1 3 3M9 16c0 2 1 3 3 3s3-1 3-3"/>
          </svg>
        </button>
        <button class="circle-btn" @click.stop="onAddRightClick" title="生成">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>
      <div class="header-actions">
        <button class="dot-btn" @click.stop="onMoreClick">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 角色信息 -->
    <div class="role-info">
      <div class="info-row">
        <span class="info-label">{{ node.data.name || '基础形象' }}</span>
        <span class="info-badge pending">{{ node.data.avatar ? '已补充' : '待补充' }}</span>
      </div>
    </div>

    <!-- 左侧 + 按钮 -->
    <button class="add-btn add-left" @click.stop="onAddLeftClick" title="添加上下文">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    </button>

    <!-- 右侧 + 按钮 -->
    <button class="add-btn add-right" @click.stop="onAddRightClick" title="连接生成">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    </button>
  </div>

  <!-- 左侧添加上下文菜单 -->
  <div v-if="contextMenuVisible" class="context-overlay" @click="closeContextMenus">
    <div class="context-menu" :style="contextMenuStyle" @click.stop>
      <div class="menu-title">添加上下文</div>
      <div class="menu-items">
        <div class="menu-item" @click="handleAddContext('text')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>
          </svg>
          <span>文本</span>
        </div>
        <div class="menu-item" @click="handleAddContext('image')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
          </svg>
          <span>图片</span>
        </div>
        <div class="menu-item" @click="handleAddContext('role')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <span>角色</span>
        </div>
      </div>
    </div>
  </div>

  <!-- 右侧引用生成菜单 -->
  <div v-if="generateMenuVisible" class="context-overlay" @click="closeContextMenus">
    <div class="context-menu" :style="generateMenuStyle" @click.stop>
      <div class="menu-title">生成内容</div>
      <div class="menu-items">
        <div class="menu-item" @click="handleAddGeneration('image')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
          </svg>
          <span>图片</span>
        </div>
        <div class="menu-item" @click="handleAddGeneration('video')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
          </svg>
          <span>视频</span>
        </div>
        <div class="menu-item" @click="handleAddGeneration('audio')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
          </svg>
          <span>音频</span>
        </div>
        <div class="menu-item" @click="handleAddGeneration('role')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <span>角色</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CanvasNode, ContextType, GenerateType } from '../types'

const props = defineProps<{
  node: CanvasNode
  isSelected: boolean
  isDragging: boolean
}>()

const emit = defineEmits<{
  select: []
  delete: []
  dragStart: [event: MouseEvent, nodeId: string]
  openEdit: []
  addContext: [type: ContextType]
  addGeneration: [type: GenerateType]
}>()

const contextMenuVisible = ref(false)
const generateMenuVisible = ref(false)
const contextMenuStyle = ref<Record<string, string>>({})
const generateMenuStyle = ref<Record<string, string>>({})

const nodeStyle = computed(() => ({
  left: `${props.node.position.x}px`,
  top: `${props.node.position.y}px`,
  width: `${props.node.size.width}px`
}))

const onMouseDown = (event: MouseEvent) => {
  event.preventDefault()
  emit('dragStart', event, props.node.id)
}

const onSelect = () => {
  emit('select')
}

const onMoreClick = () => {
  emit('openEdit')
}

const handleVoiceClick = () => {
  emit('openEdit')
}

const onAddLeftClick = (event: MouseEvent) => {
  const btn = event.currentTarget as HTMLElement
  const rect = btn.getBoundingClientRect()
  contextMenuStyle.value = {
    position: 'fixed',
    left: `${rect.left - 160}px`,
    top: `${rect.top}px`
  }
  contextMenuVisible.value = true
  generateMenuVisible.value = false
}

const onAddRightClick = (event: MouseEvent) => {
  const btn = event.currentTarget as HTMLElement
  const rect = btn.getBoundingClientRect()
  generateMenuStyle.value = {
    position: 'fixed',
    left: `${rect.right + 10}px`,
    top: `${rect.top}px`
  }
  generateMenuVisible.value = true
  contextMenuVisible.value = false
}

const closeContextMenus = () => {
  contextMenuVisible.value = false
  generateMenuVisible.value = false
}

const handleAddContext = (type: string) => {
  emit('addContext', type as ContextType)
  closeContextMenus()
}

const handleAddGeneration = (type: string) => {
  emit('addGeneration', type as GenerateType)
  closeContextMenus()
}
</script>

<style scoped>
.role-node {
  position: absolute;
  background: white;
  border-radius: 24px;
  border: 2px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  cursor: move;
  transition: box-shadow 0.2s, border-color 0.2s;
  overflow: visible;
  width: 240px;
  z-index: 2;
}

.role-node:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e1;
}

.role-node.is-selected {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15), 0 8px 30px rgba(99, 102, 241, 0.1);
}

.role-node.is-dragging {
  opacity: 0.9;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  transform: scale(1.02);
  z-index: 100;
}

/* 角色图像区 */
.role-preview {
  width: 100%;
  height: 280px;
  background: #f1f5f9;
  border-radius: 24px 24px 0 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-placeholder {
  color: #94a3b8;
}

/* 底部操作区 */
.node-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px 8px;
}

.bottom-actions {
  display: flex;
  gap: 8px;
}

.circle-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #64748b;
}

.circle-btn:hover {
  background: #e2e8f0;
  color: #475569;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.dot-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 6px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}

.dot-btn:hover {
  background: #f1f5f9;
  color: #475569;
}

/* 角色信息 */
.role-info {
  padding: 8px 14px 14px;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.info-label {
  font-size: 12px;
  font-weight: 600;
  color: #334155;
}

.info-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  background: #fff7ed;
  color: #ea580c;
}

/* 左右+按钮 */
.add-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10;
  color: #64748b;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.add-btn:hover {
  background: #6366f1;
  color: white;
  transform: translateY(-50%) scale(1.15);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.add-left {
  left: -14px;
}

.add-right {
  right: -14px;
}

/* 菜单 */
.context-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: transparent;
}

.context-menu {
  min-width: 160px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
  padding: 8px;
  animation: menuIn 0.15s ease-out;
  z-index: 1001;
}

@keyframes menuIn {
  from { opacity: 0; transform: scale(0.95) translateY(-5px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.menu-title {
  padding: 8px 12px 6px;
  font-size: 11px;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 4px;
}

.menu-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #334155;
}

.menu-item:hover {
  background: #f1f5f9;
}

.menu-item span {
  font-size: 13px;
  font-weight: 600;
}
</style>
