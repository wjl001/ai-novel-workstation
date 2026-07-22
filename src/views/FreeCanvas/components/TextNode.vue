<template>
  <div 
    class="text-node"
    :class="{ 'is-selected': isSelected, 'is-dragging': isDragging }"
    :style="nodeStyle"
    @mousedown.stop="onMouseDown"
    @click.stop="onSelect"
  >
    <div class="node-header">
      <div class="header-left">
        <div class="node-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>
          </svg>
        </div>
        <span class="node-type-badge">文本</span>
      </div>
      <button class="action-btn" @click.stop="$emit('delete')" title="删除节点">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    <div class="node-content">
      <textarea
        v-model="textContent"
        class="text-input"
        placeholder="请输入文本内容..."
        @click.stop
        @input="onContentChange"
      ></textarea>
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
  dragStart: [event: MouseEvent, nodeId: string]
  updateContent: [content: string]
}>()

const textContent = ref(props.node.data.textContent || '')

const nodeStyle = computed(() => ({
  left: `${props.node.position.x}px`,
  top: `${props.node.position.y}px`,
  width: `${props.node.size.width}px`
}))

const onMouseDown = (event: MouseEvent) => {
  emit('dragStart', event, props.node.id)
}
const onSelect = () => emit('select')
const onContentChange = () => emit('updateContent', textContent.value)
</script>

<style scoped>
.text-node {
  position: absolute;
  background: white;
  border-radius: 20px;
  border: 2px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  cursor: move;
  transition: box-shadow 0.2s, border-color 0.2s;
  overflow: hidden;
}
.text-node:hover { box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1); border-color: #cbd5e1; }
.text-node.is-selected { border-color: #d946ef; box-shadow: 0 0 0 3px rgba(217, 70, 239, 0.15); }
.text-node.is-dragging { opacity: 0.9; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15); transform: scale(1.02); z-index: 100; }

.node-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 8px;
}
.header-left { display: flex; align-items: center; gap: 8px; }
.node-icon { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 8px; background: #fdf2f8; color: #d946ef; }
.node-type-badge { font-size: 11px; font-weight: 800; color: #d946ef; text-transform: uppercase; letter-spacing: 0.05em; }
.action-btn { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border: none; background: transparent; border-radius: 6px; color: #94a3b8; cursor: pointer; opacity: 0; transition: all 0.2s; }
.text-node:hover .action-btn { opacity: 1; }
.action-btn:hover { background: #fef2f2; color: #ef4444; }

.node-content { padding: 0 16px 16px; }
.text-input {
  width: 100%;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #1e293b;
  outline: none;
  padding: 12px 8px;
  border-radius: 8px;
  resize: vertical;
  min-height: 80px;
  line-height: 1.6;
  transition: background 0.2s;
}
.text-input:focus { background: #fdf2f8; }
.text-input::placeholder { color: #94a3b8; }
</style>