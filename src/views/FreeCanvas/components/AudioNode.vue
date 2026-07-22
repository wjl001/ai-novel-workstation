<template>
  <div 
    class="audio-node"
    :class="{ 'is-selected': isSelected, 'is-dragging': isDragging }"
    :style="nodeStyle"
    @mousedown.stop="onMouseDown"
    @click.stop="onSelect"
  >
    <div class="node-header">
      <div class="header-left">
        <div class="node-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
          </svg>
        </div>
        <span class="node-type-badge">音频</span>
      </div>
      <button class="action-btn" @click.stop="$emit('delete')" title="删除节点">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    <div class="node-content">
      <div class="audio-preview">
        <div v-if="audioUrl" class="audio-player">
          <button class="play-btn" @click.stop="togglePlay" v-html="isPlaying ? pauseIcon : playIcon"></button>
          <div class="audio-info">
            <span class="audio-name">{{ audioName || '音频文件' }}</span>
            <span class="audio-duration">{{ duration }}</span>
          </div>
          <audio 
            ref="audioRef"
            :src="audioUrl"
            @timeupdate="onTimeUpdate"
            @ended="isPlaying = false"
            @loadedmetadata="onLoadedMetadata"
          ></audio>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
            <input 
              type="range" 
              v-model="currentTime" 
              :min="0" 
              :max="totalTime" 
              step="0.1"
              class="progress-input"
              @input="onProgressInput"
            />
          </div>
        </div>
        <div v-else class="preview-placeholder">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
          </svg>
          <span>暂无音频</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
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
}>()

const audioUrl = computed(() => props.node.data.audioUrl || '')
const audioName = ref(props.node.data.name || '')
const audioRef = ref<HTMLAudioElement | null>(null)

const isPlaying = ref(false)
const currentTime = ref(0)
const totalTime = ref(0)
const duration = ref('00:00')

const progressPercent = computed(() => {
  if (totalTime.value === 0) return 0
  return (currentTime.value / totalTime.value) * 100
})

const playIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
const pauseIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const togglePlay = () => {
  if (!audioRef.value) return
  if (isPlaying.value) {
    audioRef.value.pause()
    isPlaying.value = false
  } else {
    audioRef.value.play()
    isPlaying.value = true
  }
}

const onTimeUpdate = () => {
  if (audioRef.value) {
    currentTime.value = audioRef.value.currentTime
  }
}

const onLoadedMetadata = () => {
  if (audioRef.value) {
    totalTime.value = audioRef.value.duration
    duration.value = formatTime(totalTime.value)
  }
}

const onProgressInput = () => {
  if (audioRef.value) {
    audioRef.value.currentTime = currentTime.value
  }
}

const nodeStyle = computed(() => ({
  left: `${props.node.position.x}px`,
  top: `${props.node.position.y}px`,
  width: `${props.node.size.width}px`
}))

const onMouseDown = (event: MouseEvent) => {
  emit('dragStart', event, props.node.id)
}
const onSelect = () => emit('select')
</script>

<style scoped>
.audio-node {
  position: absolute;
  background: white;
  border-radius: 20px;
  border: 2px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  cursor: move;
  transition: box-shadow 0.2s, border-color 0.2s;
  overflow: hidden;
}
.audio-node:hover { box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1); border-color: #cbd5e1; }
.audio-node.is-selected { border-color: #8b5cf6; box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15); }
.audio-node.is-dragging { opacity: 0.9; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15); transform: scale(1.02); z-index: 100; }

.node-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px 8px; }
.header-left { display: flex; align-items: center; gap: 8px; }
.node-icon { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 8px; background: #f5f3ff; color: #8b5cf6; }
.node-type-badge { font-size: 11px; font-weight: 800; color: #8b5cf6; text-transform: uppercase; letter-spacing: 0.05em; }
.action-btn { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border: none; background: transparent; border-radius: 6px; color: #94a3b8; cursor: pointer; opacity: 0; transition: all 0.2s; }
.audio-node:hover .action-btn { opacity: 1; }
.action-btn:hover { background: #fef2f2; color: #ef4444; }

.node-content { padding: 0 16px 16px; }
.audio-preview { width: 100%; min-height: 100px; border-radius: 12px; overflow: hidden; background: #f8fafc; }

.audio-player {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.play-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #8b5cf6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}
.play-btn:hover { background: #7c3aed; transform: scale(1.1); }

.audio-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.audio-name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.audio-duration {
  font-size: 11px;
  color: #94a3b8;
  font-variant-numeric: tabular-nums;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  position: relative;
  margin-top: 8px;
}
.progress-fill {
  height: 100%;
  background: #8b5cf6;
  border-radius: 2px;
  transition: width 0.1s;
}
.progress-input {
  position: absolute;
  top: -4px;
  left: 0;
  width: 100%;
  height: 12px;
  opacity: 0;
  cursor: pointer;
}

.preview-placeholder {
  width: 100%;
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  gap: 4px;
}
.preview-placeholder span { font-size: 11px; font-weight: 600; }
</style>