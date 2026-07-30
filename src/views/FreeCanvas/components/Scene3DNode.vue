<template>
  <div
    class="scene3d-card"
    :class="{ 'is-selected': isSelected, 'is-dragging': isDragging }"
    :style="nodeStyle"
    @mousedown.stop="onMouseDown"
  >
    <div class="node-title" @click.stop="onSelect">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="title-icon">
        <path d="M2 3l10 6 10-6-10 6z"/>
        <path d="M2 12l10 6 10-6"/>
        <path d="M2 21l10 6 10-6"/>
      </svg>
      <span class="title-text">3D 导演台</span>
    </div>

    <div class="card-inner" @click.stop="handleOpen">
      <div class="icon-badge">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28">
          <circle cx="12" cy="4" r="2"/>
          <line x1="12" y1="6" x2="12" y2="14"/>
          <line x1="6" y1="9" x2="18" y2="9"/>
          <line x1="12" y1="14" x2="8" y2="20"/>
          <line x1="12" y1="14" x2="16" y2="20"/>
          <line x1="6" y1="20" x2="18" y2="20"/>
          <path d="M9 20 L9 22 M15 20 L15 22"/>
        </svg>
      </div>
      <div class="card-title">3D 导演台</div>
      <div class="card-desc">打开后可编辑镜头和场景预演</div>
      <button class="open-btn">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="5 12 11 18 19 6"/>
        </svg>
        <span>打开导演台</span>
      </button>
    </div>

    <div class="action-row" v-if="isSelected">
      <button class="del-btn" @click.stop="$emit('delete')" title="删除">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CanvasNode } from '../types'

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
}>()

const nodeStyle = computed(() => ({
  left: `${props.node.position.x}px`,
  top: `${props.node.position.y}px`,
  width: `${props.node.size.width}px`
}))

const onMouseDown = (event: MouseEvent) => {
  emit('dragStart', event, props.node.id)
}

const onSelect = () => {
  emit('select')
}

const handleOpen = () => {
  emit('openEdit')
}
</script>

<style scoped>
.scene3d-card {
  position: absolute;
  background: #ffffff;
  border: 1.5px solid #e0d4fc;
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(139, 92, 246, 0.08), 0 0 0 1px rgba(139, 92, 246, 0.04);
  cursor: move;
  transition: box-shadow 0.2s, border-color 0.2s;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 220px;
  box-sizing: border-box;
}

.scene3d-card:hover {
  border-color: #c4b5fd;
  box-shadow: 0 8px 32px rgba(139, 92, 246, 0.15), 0 0 0 1px rgba(139, 92, 246, 0.08);
}

.scene3d-card.is-selected {
  border-color: #8b5cf6;
  border-width: 2px;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.12), 0 8px 32px rgba(139, 92, 246, 0.15);
}

.scene3d-card.is-dragging {
  opacity: 0.92;
  transform: scale(1.02);
  z-index: 100;
  box-shadow: 0 20px 60px rgba(139, 92, 246, 0.25);
}

/* 节点标题栏 */
.node-title {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px 6px;
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  flex-shrink: 0;
}

.title-icon {
  flex-shrink: 0;
  opacity: 0.6;
}

.title-text {
  letter-spacing: 0.02em;
}

/* 卡片主体 */
.card-inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px 12px;
  cursor: pointer;
}

.icon-badge {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%);
  border-radius: 16px;
  color: #7c3aed;
  box-shadow: inset 0 1px 3px rgba(124, 58, 237, 0.08);
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: 0.01em;
}

.card-desc {
  font-size: 11px;
  color: #6b7280;
  margin-bottom: 4px;
}

.open-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 20px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  color: #374151;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.15s;
}

.open-btn:hover {
  background: #8b5cf6;
  border-color: #8b5cf6;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
}

.open-btn span {
  letter-spacing: 0.01em;
}

/* 删除按钮 */
.action-row {
  position: absolute;
  top: 6px;
  right: 8px;
  z-index: 10;
}

.del-btn {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #9ca3af;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.15s;
}

.del-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}
</style>
