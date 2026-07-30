<template>
  <div class="export-panel">
    <div class="lib-header">
      <h3 class="lib-title">动态导出</h3>
      <span class="lib-badge" v-if="!isRecording">准备就绪</span>
      <span class="lib-badge recording" v-else>录制中...</span>
    </div>

    <!-- 导出区域选择 -->
    <div class="export-section">
      <label class="section-label">导出区域</label>
      <div class="area-buttons">
        <button
          class="area-btn"
          :class="{ active: exportArea === 'full' }"
          @click="exportArea = 'full'"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
          <span>全视口</span>
        </button>
        <button
          class="area-btn"
          :class="{ active: exportArea === 'viewport' }"
          @click="exportArea = 'viewport'"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="5" width="14" height="14" rx="1"/><rect x="8" y="8" width="8" height="8"/></svg>
          <span>取景框</span>
        </button>
      </div>
    </div>

    <!-- 格式选择 -->
    <div class="export-section">
      <label class="section-label">导出格式</label>
      <div class="format-buttons">
        <button
          class="format-btn"
          :class="{ active: exportFormat === 'mp4' }"
          @click="exportFormat = 'mp4'"
        >
          <span>MP4</span>
          <span class="format-desc">通用视频</span>
        </button>
        <button
          class="format-btn"
          :class="{ active: exportFormat === 'webm' }"
          @click="exportFormat = 'webm'"
        >
          <span>WebM</span>
          <span class="format-desc">Web友好</span>
        </button>
        <button
          class="format-btn"
          :class="{ active: exportFormat === 'gif' }"
          @click="exportFormat = 'gif'"
        >
          <span>GIF</span>
          <span class="format-desc">动画图片</span>
        </button>
      </div>
    </div>

    <!-- 分辨率 -->
    <div class="export-section">
      <label class="section-label">分辨率</label>
      <select v-model="resolution" class="resolution-select">
        <option :value="1280">1280×720 (720p)</option>
        <option :value="1920">1920×1080 (1080p)</option>
        <option :value="2560">2560×1440 (2K)</option>
        <option :value="3840">3840×2160 (4K)</option>
      </select>
    </div>

    <!-- 质量 -->
    <div class="export-section">
      <label class="section-label">质量</label>
      <div class="quality-buttons">
        <button
          class="quality-btn"
          :class="{ active: quality === 'low' }"
          @click="quality = 'low'"
        >
          低
        </button>
        <button
          class="quality-btn"
          :class="{ active: quality === 'medium' }"
          @click="quality = 'medium'"
        >
          中
        </button>
        <button
          class="quality-btn"
          :class="{ active: quality === 'high' }"
          @click="quality = 'high'"
        >
          高
        </button>
      </div>
    </div>

    <!-- FPS -->
    <div class="export-section">
      <label class="section-label">帧率 (FPS)</label>
      <select v-model="exportFps" class="resolution-select">
        <option :value="12">12</option>
        <option :value="24">24</option>
        <option :value="30">30</option>
        <option :value="60">60</option>
      </select>
    </div>

    <!-- 帧范围 -->
    <div class="export-section">
      <label class="section-label">帧范围</label>
      <div class="frame-range">
        <input type="number" v-model="startFrame" min="0" class="range-input" placeholder="起始" />
        <span class="range-separator">→</span>
        <input type="number" v-model="endFrame" min="0" class="range-input" placeholder="结束" />
      </div>
    </div>

    <!-- 导出按钮 -->
    <div class="export-actions">
      <button
        class="export-btn primary"
        @click="startRecording"
        :disabled="isRecording || isExporting"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8"/></svg>
        <span>{{ isRecording ? '停止录制' : '开始录制' }}</span>
      </button>
      <button
        class="export-btn secondary"
        @click="exportToCanvas"
        :disabled="isExporting"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
        <span>发送回画布</span>
      </button>
    </div>

    <!-- 导出状态 -->
    <div v-if="exportStatus" class="export-status">
      <div class="status-bar">
        <div class="status-fill" :style="{ width: exportProgress + '%' }"></div>
      </div>
      <span class="status-text">{{ exportStatus }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Scene3DDirectorData } from '../types'

const props = defineProps<{
  nodeData: Scene3DDirectorData
}>()

const emit = defineEmits<{
  'export:start': [config: any]
  'export:stop': []
  'export:send': [config: any]
}>()

const isRecording = ref(false)
const isExporting = ref(false)
const exportStatus = ref('')
const exportProgress = ref(0)

const exportArea = ref<'full' | 'viewport'>('full')
const exportFormat = ref<'mp4' | 'webm' | 'gif'>('mp4')
const resolution = ref(1920)
const quality = ref<'low' | 'medium' | 'high'>('medium')
const exportFps = ref(24)
const startFrame = ref(props.nodeData.currentFrame || 0)
const endFrame = ref(props.nodeData.totalFrames || 120)

const resolutionMap: Record<string, { width: number; height: number }> = {
  1280: { width: 1280, height: 720 },
  1920: { width: 1920, height: 1080 },
  2560: { width: 2560, height: 1440 },
  3840: { width: 3840, height: 2160 }
}

function startRecording() {
  if (isRecording.value) {
    emit('export:stop')
    isRecording.value = false
    return
  }

  isRecording.value = true
  exportStatus.value = '录制中...'
  exportProgress.value = 0

  const config = {
    area: exportArea.value,
    format: exportFormat.value,
    quality: quality.value,
    fps: exportFps.value,
    width: resolutionMap[resolution.value].width,
    height: resolutionMap[resolution.value].height,
    startFrame: startFrame.value,
    endFrame: endFrame.value
  }

  emit('export:start', config)

  // 模拟录制进度
  let progress = 0
  const interval = setInterval(() => {
    progress += 2
    exportProgress.value = Math.min(progress, 100)
    if (progress >= 100) {
      clearInterval(interval)
      exportStatus.value = '录制完成'
      setTimeout(() => {
        exportStatus.value = ''
        exportProgress.value = 0
        isRecording.value = false
      }, 2000)
    }
  }, 100)
}

function exportToCanvas() {
  const config = {
    area: exportArea.value,
    format: exportFormat.value,
    quality: quality.value,
    fps: exportFps.value,
    width: resolutionMap[resolution.value].width,
    height: resolutionMap[resolution.value].height,
    startFrame: startFrame.value,
    endFrame: endFrame.value
  }

  isExporting.value = true
  exportStatus.value = '正在发送到画布...'
  exportProgress.value = 0

  emit('export:send', config)

  let progress = 0
  const interval = setInterval(() => {
    progress += 5
    exportProgress.value = Math.min(progress, 100)
    if (progress >= 100) {
      clearInterval(interval)
      exportStatus.value = '发送成功'
      isExporting.value = false
      setTimeout(() => {
        exportStatus.value = ''
        exportProgress.value = 0
      }, 2000)
    }
  }, 150)
}
</script>

<style scoped>
.export-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.lib-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #1e1e2e;
}

.lib-title {
  font-size: 13px;
  font-weight: 700;
  color: #e2e8f0;
}

.lib-badge {
  font-size: 10px;
  color: #22c55e;
  background: rgba(34, 197, 94, 0.15);
  padding: 2px 8px;
  border-radius: 10px;
  font-family: monospace;
}

.lib-badge.recording {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.15);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.export-section {
  margin: 8px 0;
}

.section-label {
  display: block;
  font-size: 10px;
  color: #64748b;
  margin-bottom: 4px;
  font-weight: 500;
}

.area-buttons {
  display: flex;
  gap: 4px;
}

.area-btn {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  border: 1px solid #1e293b;
  background: #0f172a;
  color: #64748b;
  border-radius: 6px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  transition: all 0.15s;
}

.area-btn:hover {
  border-color: #475569;
}

.area-btn.active {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.15);
  color: #6366f1;
}

.format-buttons {
  display: flex;
  gap: 4px;
}

.format-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 4px;
  border: 1px solid #1e293b;
  background: #0f172a;
  color: #64748b;
  border-radius: 6px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  transition: all 0.15s;
}

.format-btn:hover {
  border-color: #475569;
}

.format-btn.active {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.15);
  color: #6366f1;
}

.format-desc {
  font-size: 8px;
  font-weight: 400;
  color: #475569;
}

.resolution-select {
  width: 100%;
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 6px;
  padding: 6px 8px;
  color: #e2e8f0;
  font-size: 11px;
  outline: none;
}

.resolution-select:focus {
  border-color: #6366f1;
}

.quality-buttons {
  display: flex;
  gap: 4px;
}

.quality-btn {
  flex: 1;
  padding: 5px;
  border: 1px solid #1e293b;
  background: #0f172a;
  color: #64748b;
  border-radius: 6px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  transition: all 0.15s;
}

.quality-btn:hover {
  border-color: #475569;
}

.quality-btn.active {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.15);
  color: #6366f1;
}

.frame-range {
  display: flex;
  align-items: center;
  gap: 4px;
}

.range-input {
  flex: 1;
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 6px;
  padding: 5px 6px;
  color: #e2e8f0;
  font-size: 11px;
  font-family: monospace;
  outline: none;
}

.range-input:focus {
  border-color: #6366f1;
}

.range-separator {
  color: #475569;
  font-size: 12px;
}

.export-actions {
  display: flex;
  gap: 4px;
  margin-top: 10px;
}

.export-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  transition: all 0.15s;
}

.export-btn.primary {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.export-btn.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.export-btn.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
}

.export-btn.secondary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
}

.export-btn.secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.export-btn.secondary:hover:not(:disabled) {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
}

.export-status {
  margin-top: 10px;
}

.status-bar {
  width: 100%;
  height: 4px;
  background: #1e293b;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.status-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  transition: width 0.3s ease;
}

.status-text {
  font-size: 10px;
  color: #94a3b8;
  font-family: monospace;
}
</style>
