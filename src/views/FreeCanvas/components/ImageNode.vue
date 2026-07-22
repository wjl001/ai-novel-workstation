<template>
  <div 
    class="image-node"
    :class="{ 'is-selected': isSelected, 'is-dragging': isDragging }"
    :style="nodeStyle"
    @mousedown.stop="onMouseDown"
    @click.stop="onSelect"
  >
    <div class="node-header">
      <div class="header-left">
        <div class="node-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
          </svg>
        </div>
        <span class="node-type-badge">图片</span>
      </div>
      <button class="action-btn" @click.stop="$emit('delete')" title="删除节点">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    <div class="node-content">
      <div class="image-preview">
        <img v-if="imageUrl" :src="imageUrl" :alt="imageName" @click.stop="handlePreview" />
        <div v-else class="preview-placeholder">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
          </svg>
          <span>暂无图片</span>
        </div>
      </div>
      <input 
        v-model="imageName"
        class="node-name-input"
        placeholder="图片名称"
        @click.stop
        @input="onNameChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CanvasNode } from '../types'

const props = defineProps<{
  node: CanvasNode
  isSelected: boolean
  isDragging: boolean
}>()

const emit = defineEmits<{
  select: []
  delete: []
  dragStart: [event: MouseEvent]
  updateName: [name: string]
}>()

const imageUrl = computed(() => props.node.data.imageUrl || '')
const imageName = ref(props.node.data.name || '')

const nodeStyle = computed(() => ({
  left: `${props.node.position.x}px`,
  top: `${props.node.position.y}px`,
  width: `${props.node.size.width}px`
}))

const onMouseDown = (event: MouseEvent) => {
  emit('dragStart', event, props.node.id)
}
const onSelect = () => emit('select')
const onNameChange = () => emit('updateName', imageName.value)
const handlePreview = () => {
  if (imageUrl.value) {
    window.open(imageUrl.value, '_blank')
  }
}
</script>

<style scoped>
.image-node {
  position: absolute;
  background: white;
  border-radius: 20px;
  border: 2px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  cursor: move;
  transition: box-shadow 0.2s, border-color 0.2s;
  overflow: hidden;
}
.image-node:hover { box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1); border-color: #cbd5e1; }
.image-node.is-selected { border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.15); }
.image-node.is-dragging { opacity: 0.9; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15); transform: scale(1.02); z-index: 100; }

.node-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px 8px; }
.header-left { display: flex; align-items: center; gap: 8px; }
.node-icon { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 8px; background: #f0fdf4; color: #16a34a; }
.node-type-badge { font-size: 11px; font-weight: 800; color: #16a34a; text-transform: uppercase; letter-spacing: 0.05em; }
.action-btn { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border: none; background: transparent; border-radius: 6px; color: #94a3b8; cursor: pointer; opacity: 0; transition: all 0.2s; }
.image-node:hover .action-btn { opacity: 1; }
.action-btn:hover { background: #fef2f2; color: #ef4444; }

.node-content { padding: 0 16px 16px; }
.image-preview { width: 100%; height: 200px; border-radius: 12px; overflow: hidden; background: #f8fafc; margin-bottom: 12px; cursor: pointer; }
.image-preview img { width: 100%; height: 100%; object-fit: cover; }
.preview-placeholder { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #94a3b8; gap: 4px; }
.preview-placeholder span { font-size: 11px; font-weight: 600; }
.node-name-input { width: 100%; border: none; background: transparent; font-size: 14px; color: #1e293b; text-align: center; outline: none; padding: 4px 8px; border-radius: 8px; transition: background 0.2s; }
.node-name-input:focus { background: #f0fdf4; }
.node-name-input::placeholder { color: #94a3b8; }
</style>