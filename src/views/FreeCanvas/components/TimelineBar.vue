<template>
  <div class="timeline-bar">
    <!-- 播放控制 -->
    <div class="playback-controls">
      <button class="ctrl-btn" @click="goToStart" title="跳转至起始">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21 5,3"/></svg>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="3" width="3" height="18"/></svg>
      </button>
      <button class="ctrl-btn" @click="stepBack" title="上一步">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="20,6 8,12 20,18 20,6"/></svg>
      </button>
      <button
        class="ctrl-btn play-main"
        :class="{ playing: isPlaying }"
        @click="togglePlay"
        :title="isPlaying ? '暂停' : '播放'"
      >
        <svg v-if="!isPlaying" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21 5,3"/></svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
      </button>
      <button class="ctrl-btn" @click="stepForward" title="下一步">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="4,18 16,12 4,6 4,18"/></svg>
      </button>
      <button class="ctrl-btn" @click="goToEnd" title="跳转至结尾">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="16" y="3" width="3" height="18"/><polygon points="5,3 19,12 5,21 5,3"/></svg>
      </button>

      <!-- 帧显示 -->
      <div class="frame-display">
        <input type="number" v-model.number="displayFrame" min="0" @change="onFrameInput" class="frame-input" />
        <span class="frame-total">/ {{ totalFrames }}</span>
      </div>

      <!-- 时间显示 -->
      <div class="time-display">
        <span class="time-label">{{ formatTime(currentFrame / fps) }}</span>
      </div>

      <!-- FPS 设置 -->
      <div class="fps-control">
        <label>FPS</label>
        <select v-model.number="displayFps" @change="onFpsChange">
          <option :value="12">12</option>
          <option :value="24">24</option>
          <option :value="30">30</option>
          <option :value="60">60</option>
        </select>
      </div>

      <!-- 总帧数设置 -->
      <div class="total-frames-control">
        <label>总帧</label>
        <input type="number" v-model.number="displayTotalFrames" min="1" @change="onTotalFramesChange" class="frame-input" />
      </div>
    </div>

    <!-- 缩放控制 -->
    <div class="zoom-control">
      <button class="zoom-btn" @click="zoomTimeline(0.5)" title="缩小">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="10" r="6"/><line x1="20" y1="20" x2="16" y2="16"/></svg>
      </button>
      <span class="zoom-label">{{ Math.round(zoomLevel * 100) }}%</span>
      <button class="zoom-btn" @click="zoomTimeline(2)" title="放大">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="10" r="6"/><line x1="20" y1="20" x2="16" y2="16"/><line x1="10" y1="7" x2="10" y2="13"/><line x1="7" y1="10" x2="13" y2="10"/></svg>
      </button>
    </div>

    <!-- 轨道区域 -->
    <div class="tracks-area" ref="tracksAreaRef">
      <!-- 轨道头部 -->
      <div class="track-header">
        <div class="track-header-left">
          <span class="track-label">轨道</span>
        </div>
        <div class="track-header-timeline" :style="{ left: trackLabelWidth + 'px' }">
          <div class="track-header-ruler" :style="{ width: trackWidth + 'px' }">
            <div
              v-for="tick in visibleTicks"
              :key="tick.frame"
              class="tick"
              :style="{ left: tick.position + 'px', height: tick.isMajor ? '100%' : '40%' }"
            >
              <span v-if="tick.isMajor" class="tick-label">{{ tick.frame }}</span>
            </div>
          </div>
        </div>
        <div class="track-header-right">
          <button class="header-btn" @click="addTrack" title="添加轨道">+</button>
        </div>
      </div>

      <!-- 轨道列表 -->
      <div class="tracks-list" :style="{ maxHeight: trackListHeight + 'px' }">
        <!-- 轨道行 -->
        <div
          v-for="(track, idx) in tracks"
          :key="track.id"
          class="track-row"
          :class="{ active: activeTrackIndex === idx, disabled: !track.enabled }"
          @click="activeTrackIndex = idx"
        >
          <div class="track-name-cell">
            <span class="track-name">{{ track.name }}</span>
            <span class="track-property">{{ track.property }}</span>
            <label class="toggle" @click.stop>
              <input type="checkbox" v-model="track.enabled" />
              <span class="toggle-slider"></span>
            </label>
            <button class="track-delete-btn" @click.stop="removeTrack(idx)" title="删除轨道">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="track-timeline" :style="{ left: trackLabelWidth + 'px' }">
            <div class="track-timeline-area" :style="{ width: trackWidth + 'px' }">
              <div class="track-timeline-line"></div>
              <!-- 关键帧 -->
              <div
                v-for="(kf, kfIdx) in track.keyframes"
                :key="kf.time"
                class="keyframe-marker"
                :class="{ active: activeKeyframeTrack === idx && activeKeyframeIndex === kfIdx }"
                :style="{ left: getFramePosition(kf.time) + 'px' }"
                @click.stop="selectKeyframe(idx, kfIdx)"
                @dblclick.stop="editKeyframe(idx, kfIdx)"
              >
                <div class="keyframe-diamond" :style="{ transform: getKeyframeRotation(kf.interpolation) }"></div>
                <div class="keyframe-label">{{ Math.round(kf.value) }}</div>
              </div>
            </div>
            <!-- 添加关键帧按钮 -->
            <div class="track-add-kf" @click.stop="addKeyframeAtCurrent(idx)">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 时间轴底部 ruler -->
      <div class="timeline-ruler-bottom" :style="{ left: trackLabelWidth + 'px' }">
        <div class="timeline-ruler-bar" :style="{ width: trackWidth + 'px' }">
          <!-- 播放头 -->
          <div
            class="playhead"
            :style="{ left: getFramePosition(currentFrame) + 'px' }"
          >
            <div class="playhead-handle"></div>
            <div class="playhead-line"></div>
          </div>
          <!-- 进度填充 -->
          <div
            class="timeline-progress-fill"
            :style="{ width: getFramePosition(currentFrame) + 'px' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- 关键帧编辑弹窗 -->
    <div v-if="showKeyframeEditor" class="kf-editor-overlay" @click="showKeyframeEditor = false">
      <div class="kf-editor-panel" @click.stop>
        <div class="kf-editor-header">
          <span class="kf-editor-title">编辑关键帧</span>
          <button class="kf-editor-close" @click="showKeyframeEditor = false">&times;</button>
        </div>
        <div class="kf-editor-body">
          <div class="kf-field">
            <label>时间 (帧)</label>
            <input type="number" v-model.number="editKfFrame" min="0" />
          </div>
          <div class="kf-field">
            <label>值</label>
            <input type="number" v-model.number="editKfValue" step="0.01" />
          </div>
          <div class="kf-field">
            <label>插值方式</label>
            <select v-model="editKfInterpolation">
              <option value="linear">线性</option>
              <option value="ease-in">缓入</option>
              <option value="ease-out">缓出</option>
              <option value="ease-in-out">缓入缓出</option>
              <option value="hold">保持</option>
            </select>
          </div>
        </div>
        <div class="kf-editor-footer">
          <button class="kf-cancel-btn" @click="showKeyframeEditor = false">取消</button>
          <button class="kf-save-btn" @click="saveKeyframeEdit">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { Scene3DDirectorData, TimelineTrack, TimelineKeyframe, InterpolationMode } from '../types'

const props = defineProps<{
  nodeData: Scene3DDirectorData
  zoomLevel?: number
}>()

const emit = defineEmits<{
  'update:data': [data: Scene3DDirectorData]
  'update:zoomLevel': [level: number]
  select: [frame: number]
}>()

const directorData = computed(() => props.nodeData)
const tracks = computed(() => directorData.value.tracks)
const currentFrame = computed(() => directorData.value.currentFrame)
const isPlaying = computed(() => directorData.value.isPlaying)
const totalFrames = computed(() => directorData.value.totalFrames || 120)
const fps = computed(() => directorData.value.fps || 24)

const activeTrackIndex = ref(0)
const activeKeyframeTrack = ref(-1)
const activeKeyframeIndex = ref(-1)
const zoomLevel = ref(props.zoomLevel || 1)
const trackLabelWidth = 160
const trackListHeight = 180

// 时间轴宽度（可视区域）
const tracksAreaRef = ref<HTMLElement>()
let timelineAreaWidth = 600

onMounted(() => {
  if (tracksAreaRef.value) {
    timelineAreaWidth = tracksAreaRef.value.clientWidth - trackLabelWidth - 30
  }
})

const trackWidth = computed(() => totalFrames.value * zoomLevel.value * 3)
const visibleTicks = computed(() => {
  const ticks: { frame: number; position: number; isMajor: boolean }[] = []
  const step = zoomLevel.value >= 2 ? 5 : zoomLevel.value >= 1 ? 20 : 60
  for (let f = 0; f <= totalFrames.value; f += step) {
    ticks.push({ frame: f, position: getFramePositionRaw(f), isMajor: true })
  }
  return ticks
})

function getFramePositionRaw(frame: number): number {
  return (frame / totalFrames.value) * trackWidth.value
}

function getFramePosition(frame: number): number {
  return getFramePositionRaw(frame)
}

// 显示用值
const displayFrame = ref(currentFrame.value)
const displayFps = ref(fps.value)
const displayTotalFrames = ref(totalFrames.value)

function onFrameInput() {
  const f = Math.max(0, Math.min(displayFrame.value, totalFrames.value))
  emit('update:data', { ...directorData.value, currentFrame: f })
}

function onFpsChange() {
  emit('update:data', { ...directorData.value, fps: displayFps.value })
}

function onTotalFramesChange() {
  const t = Math.max(1, displayTotalFrames.value)
  emit('update:data', { ...directorData.value, totalFrames: t })
}

function togglePlay() {
  emit('update:data', { ...directorData.value, isPlaying: !isPlaying.value })
}

function stepForward() {
  const next = Math.min(currentFrame.value + 1, totalFrames.value)
  emit('update:data', { ...directorData.value, currentFrame: next, isPlaying: false })
}

function stepBack() {
  const prev = Math.max(currentFrame.value - 1, 0)
  emit('update:data', { ...directorData.value, currentFrame: prev, isPlaying: false })
}

function goToStart() {
  emit('update:data', { ...directorData.value, currentFrame: 0, isPlaying: false })
}

function goToEnd() {
  emit('update:data', { ...directorData.value, currentFrame: totalFrames.value, isPlaying: false })
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function zoomTimeline(factor: number) {
  const newZoom = Math.max(0.25, Math.min(8, zoomLevel.value * factor))
  zoomLevel.value = newZoom
  emit('update:zoomLevel', newZoom)
}

// 关键帧编辑
const showKeyframeEditor = ref(false)
const editKfTrack = ref(-1)
const editKfIndex = ref(-1)
const editKfFrame = ref(0)
const editKfValue = ref(0)
const editKfInterpolation = ref<InterpolationMode>('linear')

function selectKeyframe(trackIdx: number, kfIdx: number) {
  activeKeyframeTrack.value = trackIdx
  activeKeyframeIndex.value = kfIdx
}

function editKeyframe(trackIdx: number, kfIdx: number) {
  const track = tracks.value[trackIdx]
  if (!track) return
  const kf = track.keyframes[kfIdx]
  if (!kf) return
  editKfTrack.value = trackIdx
  editKfIndex.value = kfIdx
  editKfFrame.value = kf.time
  editKfValue.value = kf.value
  editKfInterpolation.value = kf.interpolation
  showKeyframeEditor.value = true
}

function saveKeyframeEdit() {
  if (editKfTrack.value < 0 || editKfIndex.value < 0) return
  const updatedTracks = [...tracks.value]
  const track = { ...updatedTracks[editKfTrack.value] }
  const updatedKFs = [...track.keyframes]
  updatedKFs[editKfIndex.value] = {
    time: editKfFrame.value,
    value: editKfValue.value,
    interpolation: editKfInterpolation.value
  }
  track.keyframes = updatedKFs
  updatedTracks[editKfTrack.value] = track
  emit('update:data', { ...directorData.value, tracks: updatedTracks })
  showKeyframeEditor.value = false
}

function addTrack() {
  const newObjId = directorData.value.selectedObjectId || 'camera'
  const newObjProp = directorData.value.selectedObjectProperty || 'position.x'
  const newTrack: TimelineTrack = {
    id: `track_${Date.now()}`,
    name: newObjId === 'camera' ? '相机' : newObjId,
    targetId: newObjId,
    property: newObjProp,
    keyframes: [],
    enabled: true,
    loop: false
  }
  const updatedTracks = [...tracks.value, newTrack]
  emit('update:data', { ...directorData.value, tracks: updatedTracks })
}

function removeTrack(idx: number) {
  const updatedTracks = [...tracks.value]
  updatedTracks.splice(idx, 1)
  emit('update:data', { ...directorData.value, tracks: updatedTracks })
  if (activeTrackIndex.value >= updatedTracks.length) {
    activeTrackIndex.value = Math.max(0, updatedTracks.length - 1)
  }
}

function addKeyframeAtCurrent(idx: number) {
  const updatedTracks = tracks.value.map((t, i) => {
    if (i !== idx) return t
    const existing = t.keyframes.find(k => k.time === currentFrame.value)
    if (existing) return t
    return {
      ...t,
      keyframes: [...t.keyframes, { time: currentFrame.value, value: 0, interpolation: 'linear' as InterpolationMode }].sort((a, b) => a.time - b.time)
    }
  })
  emit('update:data', { ...directorData.value, tracks: updatedTracks })
}

function getKeyframeRotation(interpolation: InterpolationMode): string {
  const map: Record<string, string> = {
    'linear': 'rotate(45deg)',
    'ease-in': 'rotate(45deg) scale(1.2)',
    'ease-out': 'rotate(45deg) scale(0.8)',
    'ease-in-out': 'rotate(45deg) scale(1)',
    'hold': 'rotate(0deg)'
  }
  return map[interpolation] || 'rotate(45deg)'
}

watch(() => currentFrame.value, (val) => {
  displayFrame.value = val
})

// 播放时自动推进帧
let playInterval: number = 0
watch(isPlaying, (playing) => {
  if (playing) {
    playInterval = window.setInterval(() => {
      if (currentFrame.value >= totalFrames.value) {
        emit('update:data', { ...directorData.value, currentFrame: 0, isPlaying: false })
      } else {
        emit('update:data', { ...directorData.value, currentFrame: currentFrame.value + 1 })
      }
    }, 1000 / fps.value)
  } else {
    if (playInterval) {
      clearInterval(playInterval)
      playInterval = 0
    }
  }
})

onUnmounted(() => {
  if (playInterval) clearInterval(playInterval)
})
</script>

<style scoped>
.timeline-bar {
  background: #0a0a0f;
  border-top: 1px solid #1e1e2e;
  border-radius: 0 0 16px 16px;
  padding: 8px 12px;
  flex-shrink: 0;
}

.playback-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
}

.ctrl-btn {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #1e1e2e;
  color: #94a3b8;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  padding: 0;
}

.ctrl-btn:hover {
  background: #2d2d44;
  color: #e2e8f0;
}

.ctrl-btn.play-main {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
}

.ctrl-btn.play-main.playing {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.ctrl-btn.play-main svg {
  margin-left: 1px;
}

.frame-display {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: 8px;
}

.frame-input {
  width: 50px;
  background: #1e1e2e;
  border: 1px solid #334155;
  border-radius: 4px;
  padding: 4px 6px;
  color: #e2e8f0;
  font-size: 12px;
  font-family: monospace;
  outline: none;
}

.frame-input:focus {
  border-color: #6366f1;
}

.frame-total {
  font-size: 11px;
  color: #64748b;
  font-family: monospace;
}

.time-display {
  margin-left: 8px;
  font-size: 12px;
  color: #6366f1;
  font-family: monospace;
}

.time-label {
  font-weight: 600;
}

.fps-control {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
}

.fps-control label {
  font-size: 10px;
  color: #64748b;
}

.fps-control select {
  background: #1e1e2e;
  border: 1px solid #334155;
  border-radius: 4px;
  padding: 3px 6px;
  color: #e2e8f0;
  font-size: 11px;
  outline: none;
}

.total-frames-control {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 4px;
}

.total-frames-control label {
  font-size: 10px;
  color: #64748b;
}

.total-frames-control .frame-input {
  width: 40px;
}

.zoom-control {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
  justify-content: flex-end;
}

.zoom-btn {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #1e1e2e;
  color: #94a3b8;
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
}

.zoom-btn:hover {
  background: #2d2d44;
  color: #e2e8f0;
}

.zoom-label {
  font-size: 11px;
  color: #64748b;
  min-width: 30px;
  text-align: center;
}

.tracks-area {
  position: relative;
}

.track-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.track-header-left {
  width: 150px;
  padding-right: 8px;
}

.track-label {
  font-size: 10px;
  color: #64748b;
  font-weight: 600;
}

.track-header-timeline {
  position: relative;
  flex: 1;
}

.track-header-ruler {
  position: relative;
  height: 20px;
  background: #0f172a;
  border-radius: 4px;
  overflow: hidden;
}

.tick {
  position: absolute;
  top: 0;
  width: 1px;
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(-0.5px);
}

.tick-label {
  position: absolute;
  top: 4px;
  left: 4px;
  font-size: 8px;
  color: #64748b;
  font-family: monospace;
}

.track-header-right {
  width: 30px;
  text-align: right;
}

.header-btn {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #1e1e2e;
  color: #6366f1;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
}

.tracks-list {
  overflow-y: auto;
}

.track-row {
  display: flex;
  align-items: center;
  height: 36px;
  background: #0f172a;
  border-radius: 6px;
  margin-bottom: 2px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s;
}

.track-row:hover {
  border-color: #334155;
}

.track-row.active {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
}

.track-row.disabled {
  opacity: 0.5;
}

.track-name-cell {
  width: 150px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.track-name {
  font-size: 11px;
  color: #e2e8f0;
  font-weight: 600;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-property {
  font-size: 9px;
  color: #64748b;
  font-family: monospace;
}

.track-delete-btn {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  border-radius: 3px;
  opacity: 0;
  transition: all 0.15s;
}

.track-row:hover .track-delete-btn {
  opacity: 1;
}

.track-delete-btn:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.track-timeline {
  position: relative;
  flex: 1;
  height: 36px;
}

.track-timeline-area {
  position: relative;
  height: 36px;
}

.track-timeline-line {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(99, 102, 241, 0.2);
}

.track-add-kf {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #6366f1;
  border-radius: 3px;
  cursor: pointer;
  opacity: 0;
  transition: all 0.15s;
}

.track-row:hover .track-add-kf {
  opacity: 0.5;
}

.track-add-kf:hover {
  opacity: 1;
  background: rgba(99, 102, 241, 0.1);
}

.keyframe-marker {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
}

.keyframe-diamond {
  width: 10px;
  height: 10px;
  background: #6366f1;
  border: 1px solid #818cf8;
  box-shadow: 0 0 4px rgba(99, 102, 241, 0.5);
}

.keyframe-marker.active .keyframe-diamond {
  background: #f59e0b;
  border-color: #fbbf24;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.6);
}

.keyframe-label {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 8px;
  color: #94a3b8;
  font-family: monospace;
  opacity: 0;
  transition: all 0.15s;
}

.keyframe-marker:hover .keyframe-label,
.keyframe-marker.active .keyframe-label {
  opacity: 1;
}

.timeline-ruler-bottom {
  position: relative;
  margin-top: 4px;
}

.timeline-ruler-bar {
  position: relative;
  height: 24px;
  background: #0f172a;
  border-radius: 4px;
}

.timeline-progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1));
}

.playhead {
  position: absolute;
  top: -2px;
  width: 2px;
  height: 28px;
  transform: translateX(-1px);
  z-index: 10;
}

.playhead-handle {
  width: 10px;
  height: 10px;
  background: #f59e0b;
  border-radius: 50%;
  margin: 0 auto;
  box-shadow: 0 0 4px rgba(245, 158, 11, 0.5);
}

.playhead-line {
  width: 2px;
  height: 16px;
  background: #f59e0b;
  margin: 0 auto;
}

/* 开关 */
.toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.toggle input {
  display: none;
}

.toggle-slider {
  width: 24px;
  height: 12px;
  background: #334155;
  border-radius: 6px;
  position: relative;
  transition: all 0.15s;
}

.toggle-slider::after {
  content: '';
  position: absolute;
  width: 10px;
  height: 10px;
  background: white;
  border-radius: 50%;
  top: 1px;
  left: 1px;
  transition: all 0.15s;
}

.toggle input:checked + .toggle-slider {
  background: #6366f1;
}

.toggle input:checked + .toggle-slider::after {
  left: 13px;
}

/* 关键帧编辑弹窗 */
.kf-editor-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kf-editor-panel {
  background: #1e293b;
  border-radius: 12px;
  padding: 16px 20px;
  min-width: 320px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.3);
}

.kf-editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.kf-editor-title {
  font-size: 14px;
  font-weight: 700;
  color: #e2e8f0;
}

.kf-editor-close {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #0f172a;
  color: #94a3b8;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.kf-editor-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.kf-field {
  display: flex;
  align-items: center;
  gap: 10px;
}

.kf-field label {
  font-size: 12px;
  color: #94a3b8;
  min-width: 60px;
}

.kf-field input,
.kf-field select {
  flex: 1;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 6px 10px;
  color: #e2e8f0;
  font-size: 12px;
  outline: none;
}

.kf-field input:focus,
.kf-field select:focus {
  border-color: #6366f1;
}

.kf-editor-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

.kf-cancel-btn {
  padding: 6px 14px;
  border: 1px solid #475569;
  background: transparent;
  color: #94a3b8;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}

.kf-save-btn {
  padding: 6px 14px;
  border: none;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}
</style>
