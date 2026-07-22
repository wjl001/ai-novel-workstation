<template>
  <div 
    class="video-node"
    :class="{ 'is-selected': isSelected, 'is-dragging': isDragging }"
    :style="nodeStyle"
    @mousedown.stop="onMouseDown"
    @click.stop="onSelect"
  >
    <div class="node-header">
      <div class="header-left">
        <div class="node-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
          </svg>
        </div>
        <span class="node-type-badge">视频</span>
      </div>
      <button class="action-btn" @click.stop="$emit('delete')" title="删除节点">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    <div class="node-content">
      <div class="video-preview">
        <video 
          v-if="videoUrl" 
          :src="videoUrl" 
          :poster="thumbnail"
          controls 
          class="video-player"
        />
        <div v-else class="preview-placeholder">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
          </svg>
          <span>暂无视频</span>
        </div>
      </div>
      <input 
        v-model="videoName"
        class="node-name-input"
        placeholder="视频名称"
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

const videoUrl = computed(() => props.node.data.videoUrl || '')
const thumbnail = computed(() => props.node.data.thumbnail || '')
const videoName = ref(props.node.data.name || '')

const nodeStyle = computed(() => ({
  left: `${props.node.position.x}px`,
  top: `${props.node.position.y}px`,
  width: `${props.node.size.width}px`
}))

const onMouseDown = (event: MouseEvent) => {
  emit('dragStart', event, props.node.id)
}
const onSelect = () => emit('select')
const onNameChange = () => emit('updateName', videoName.value)
</script>

<style scoped>
.video-node {
  position: absolute;
  background: white;
  border-radius: 20px;
  border: 2px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  cursor: move;
  transition: box-shadow 0.2s, border-color 0.2s;
  overflow: hidden;
}
.video-node:hover { box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1); border-color: #cbd5e1; }
.video-node.is-selected { border-color: #ca8a04; box-shadow: 0 0 0 3px rgba(202, 138, 4, 0.15); }
.video-node.is-dragging { opacity: 0.9; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15); transform: scale(1.02); z-index: 100; }

.node-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px 8px; }
.header-left { display: flex; align-items: center; gap: 8px; }
.node-icon { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 8px; background: #fefce8; color: #ca8a04; }
.node-type-badge { font-size: 11px; font-weight: 800; color: #ca8a04; text-transform: uppercase; letter-spacing: 0.05em; }
.action-btn { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border: none; background: transparent; border-radius: 6px; color: #94a3b8; cursor: pointer; opacity: 0; transition: all 0.2s; }
.video-node:hover .action-btn { opacity: 1; }
.action-btn:hover { background: #fef2f2; color: #ef4444; }

.node-content { padding: 0 16px 16px; }
.video-preview { width: 100%; height: 200px; border-radius: 12px; overflow: hidden; background: #0f172a; margin-bottom: 12px; }
.video-player { width: 100%; height: 100%; object-fit: cover; }
.preview-placeholder { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #94a3b8; gap: 4px; }
.preview-placeholder span { font-size: 11px; font-weight: 600; }
.node-name-input { width: 100%; border: none; background: transparent; font-size: 14px; color: #1e293b; text-align: center; outline: none; padding: 4px 8px; border-radius: 8px; transition: background 0.2s; }
.node-name-input:focus { background: #fefce8; }
.node-name-input::placeholder { color: #94a3b8; }
</style>