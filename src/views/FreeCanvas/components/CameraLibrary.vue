<template>
  <div class="camera-library">
    <!-- 头部 -->
    <div class="lib-header">
      <h3 class="lib-title">运镜库</h3>
      <span class="lib-badge">{{ totalPositions }}</span>
    </div>

    <!-- Tab 切换 -->
    <div class="lib-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="lib-tab"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <component :is="tab.icon" class="tab-icon" />
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <div class="lib-body">
      <!-- 机位预设 -->
      <div v-if="activeTab === 'presets'" class="preset-grid">
        <div
          v-for="preset in presetList"
          :key="preset.key"
          class="preset-card"
          :class="{ selected: activeCameraPreset === preset.key }"
          @click="selectPreset(preset)"
        >
          <div class="preset-preview" :style="getPresetPreviewStyle(preset.key)">
            <div class="camera-icon"></div>
            <div class="target-dot"></div>
            <div class="view-line"></div>
          </div>
          <span class="preset-name">{{ preset.name }}</span>
        </div>
      </div>

      <!-- 机位列表 -->
      <div v-if="activeTab === 'positions'" class="positions-list">
        <div class="positions-toolbar">
          <button class="tool-btn primary" @click="captureCurrentCamera" title="保存当前机位">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 6l-6.5 6.5-3-3L6 19v-7L15 3l3 3z"/></svg>
            <span>保存当前机位</span>
          </button>
          <div class="position-count">{{ nodeData.cameraPositions.length }} 个机位</div>
        </div>

        <div
          v-for="(pos, idx) in nodeData.cameraPositions"
          :key="pos.id"
          class="position-item"
          :class="{ active: idx === nodeData.activeCameraIndex }"
        >
          <div class="position-info" @click="selectCameraPosition(idx)">
            <span class="position-name">{{ pos.name }}</span>
            <span class="position-meta">{{ pos.shotType }}</span>
          </div>
          <div class="position-actions">
            <button class="pos-apply-btn" @click="applyCameraPosition(idx)" title="应用机位">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
            <button class="pos-del-btn" @click="deleteCameraPosition(idx)" title="删除机位">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 运镜预设 -->
      <div v-if="activeTab === 'motions'" class="motion-grid">
        <div
          v-for="motion in motionPresets"
          :key="motion.key"
          class="motion-card"
          :class="{ selected: motion.key === nodeData.camera.motion }"
          @click="applyMotion(motion.key)"
        >
          <div class="motion-icon-wrap">
            <svg v-html="getMotionIcon(motion.key)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="motion-icon-svg" />
          </div>
          <span class="motion-name">{{ motion.name }}</span>
          <span class="motion-desc">{{ motion.desc }}</span>
        </div>
      </div>

      <!-- 机位参数 -->
      <div v-if="activeTab === 'params'" class="params-section">
        <div v-for="(pos, idx) in nodeData.cameraPositions" :key="pos.id" class="param-card">
          <div class="param-header" @click="expandedParam = expandedParam === idx ? -1 : idx">
            <span class="param-name">{{ pos.name }}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline :points="expandedParam === idx ? '6 9 12 15 18 9' : '6 15 12 9 18 15'"/></svg>
          </div>
          <div v-if="expandedParam === idx" class="param-body">
            <div class="param-row">
              <label>X</label>
              <input type="number" v-model="pos.position.x" step="0.1" />
              <label>Y</label>
              <input type="number" v-model="pos.position.y" step="0.1" />
              <label>Z</label>
              <input type="number" v-model="pos.position.z" step="0.1" />
            </div>
            <div class="param-row">
              <label>FOV</label>
              <input type="number" v-model="pos.fov" min="10" max="120" />
              <label>焦距</label>
              <input type="number" v-model="pos.focalLength" min="5" max="200" />
            </div>
            <div class="param-row">
              <label>景别</label>
              <select v-model="pos.shotType">
                <option v-for="shot in shotTypes" :key="shot.value" :value="shot.value">{{ shot.label }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Scene3DDirectorData, CameraPosition, CameraPresetType, CameraMotion, ShotType } from '../types'

const props = defineProps<{
  nodeData: Scene3DDirectorData
}>()

const emit = defineEmits<{
  'update:data': [data: Scene3DDirectorData]
  selectPreset: [preset: CameraPresetType]
  selectCamera: [idx: number]
}>()

const activeTab = ref('presets')
const activeCameraPreset = ref<CameraPresetType>('front')
const expandedParam = ref(-1)

const tabs = [
  { key: 'presets', label: '预设', icon: 'presetIcon' },
  { key: 'positions', label: '机位', icon: 'positionIcon' },
  { key: 'motions', label: '运镜', icon: 'motionIcon' },
  { key: 'params', label: '参数', icon: 'paramsIcon' }
]

const shotTypes = [
  { value: 'close-up' as ShotType, label: '特写' },
  { value: 'medium' as ShotType, label: '中景' },
  { value: 'wide' as ShotType, label: '全景' },
  { value: 'extreme-wide' as ShotType, label: '远景' },
  { value: 'extreme-close' as ShotType, label: '大特写' },
  { value: 'medium-full' as ShotType, label: '长镜头' }
] as const

const presetList = [
  { key: 'front' as CameraPresetType, name: '正视', pos: [0, 1.5, 5] as [number, number, number], target: [0, 1, 0] as [number, number, number], fov: 50, shot: 'medium' },
  { key: 'back' as CameraPresetType, name: '背后', pos: [0, 1.5, -5] as [number, number, number], target: [0, 1, 0] as [number, number, number], fov: 50, shot: 'medium' },
  { key: 'side-left' as CameraPresetType, name: '左侧', pos: [5, 1.5, 0] as [number, number, number], target: [0, 1, 0] as [number, number, number], fov: 50, shot: 'medium' },
  { key: 'side-right' as CameraPresetType, name: '右侧', pos: [-5, 1.5, 0] as [number, number, number], target: [0, 1, 0] as [number, number, number], fov: 50, shot: 'medium' },
  { key: 'top' as CameraPresetType, name: '俯视', pos: [0, 5, 3] as [number, number, number], target: [0, 0, 0] as [number, number, number], fov: 60, shot: 'wide' },
  { key: 'close-up' as CameraPresetType, name: '近景', pos: [0, 1.5, 1.5] as [number, number, number], target: [0, 1.5, 0] as [number, number, number], fov: 30, shot: 'close-up' },
  { key: 'medium' as CameraPresetType, name: '中景', pos: [0, 1.5, 4] as [number, number, number], target: [0, 1, 0] as [number, number, number], fov: 40, shot: 'medium' },
  { key: 'wide' as CameraPresetType, name: '全景', pos: [0, 2, 8] as [number, number, number], target: [0, 1, 0] as [number, number, number], fov: 70, shot: 'wide' },
  { key: 'low-angle' as CameraPresetType, name: '仰视', pos: [2, 0.3, 4] as [number, number, number], target: [0, 1.5, 0] as [number, number, number], fov: 60, shot: 'medium' },
  { key: 'high-angle' as CameraPresetType, name: '鸟瞰', pos: [3, 10, 8] as [number, number, number], target: [0, 0, 0] as [number, number, number], fov: 80, shot: 'extreme-wide' },
  { key: 'over-shoulder' as CameraPresetType, name: '过肩', pos: [-3, 1.8, 3] as [number, number, number], target: [0, 1.2, 0] as [number, number, number], fov: 35, shot: 'medium' }
]

const motionPresets = [
  { key: 'static' as CameraMotion, name: '静止', desc: '相机静止' },
  { key: 'dolly-in' as CameraMotion, name: '推镜头', desc: '向前推进' },
  { key: 'dolly-out' as CameraMotion, name: '拉镜头', desc: '向后拉远' },
  { key: 'truck-left' as CameraMotion, name: '左移', desc: '向左平移' },
  { key: 'truck-right' as CameraMotion, name: '右移', desc: '向右平移' },
  { key: 'pan-left' as CameraMotion, name: '左摇', desc: '向左转动' },
  { key: 'pan-right' as CameraMotion, name: '右摇', desc: '向右转动' },
  { key: 'tilt-up' as CameraMotion, name: '上摇', desc: '向上转动' },
  { key: 'tilt-down' as CameraMotion, name: '下摇', desc: '向下转动' },
  { key: 'orbit-clockwise' as CameraMotion, name: '顺时针环绕', desc: '围绕目标顺时针旋转' },
  { key: 'orbit-ccw' as CameraMotion, name: '逆时针环绕', desc: '围绕目标逆时针旋转' },
  { key: 'crane-up' as CameraMotion, name: '上升', desc: '向上爬升' },
  { key: 'crane-down' as CameraMotion, name: '下降', desc: '向下降低' },
  { key: 'arc' as CameraMotion, name: '弧形', desc: '弧形运动轨迹' },
  { key: 'zoom-in' as CameraMotion, name: '放大', desc: '推近放大' },
  { key: 'zoom-out' as CameraMotion, name: '缩小', desc: '拉远缩小' },
  { key: 'shake' as CameraMotion, name: '震动', desc: '手持抖动效果' },
  { key: 'snap-zoom' as CameraMotion, name: '快速推近', desc: '猛地推进' }
]

const totalPositions = computed(() => props.nodeData.cameraPositions.length)

function selectPreset(preset: { key: CameraPresetType; name: string; pos: [number, number, number]; target: [number, number, number]; fov: number; shot: string }) {
  activeCameraPreset.value = preset.key
  emit('selectPreset', preset.key)

  // 创建新的机位
  const newPos: CameraPosition = {
    id: `cam_${Date.now()}`,
    name: preset.name,
    preset: preset.key,
    position: { x: preset.pos[0], y: preset.pos[1], z: preset.pos[2] },
    target: { x: preset.target[0], y: preset.target[1], z: preset.target[2] },
    fov: preset.fov,
    focalLength: 50,
    shotType: preset.shot as unknown as ShotType,
    motion: 'static'
  }

  const newPositions = [...props.nodeData.cameraPositions, newPos]
  emit('update:data', { ...props.nodeData, cameraPositions: newPositions })
}

function selectCameraPosition(idx: number) {
  emit('selectCamera', idx)
  emit('update:data', { ...props.nodeData, activeCameraIndex: idx })
}

function applyCameraPosition(idx: number) {
  const pos = props.nodeData.cameraPositions[idx]
  if (!pos) return
  emit('selectCamera', idx)
}

function deleteCameraPosition(idx: number) {
  const newPositions = [...props.nodeData.cameraPositions]
  newPositions.splice(idx, 1)
  emit('update:data', {
    ...props.nodeData,
    cameraPositions: newPositions,
    activeCameraIndex: Math.max(0, Math.min(props.nodeData.activeCameraIndex, newPositions.length - 1))
  })
}

function captureCurrentCamera() {
  const cam = props.nodeData.camera
  const newPos: CameraPosition = {
    id: `cam_${Date.now()}`,
    name: `自定义机位 ${props.nodeData.cameraPositions.length + 1}`,
    preset: 'custom',
    position: { x: cam.position.x, y: cam.position.y, z: cam.position.z },
    target: { x: cam.target.x, y: cam.target.y, z: cam.target.z },
    fov: cam.fov,
    focalLength: cam.focalLength,
    shotType: cam.shotType,
    motion: cam.motion
  }
  const newPositions = [...props.nodeData.cameraPositions, newPos]
  emit('update:data', { ...props.nodeData, cameraPositions: newPositions })
}

function applyMotion(motion: CameraMotion) {
  emit('update:data', { ...props.nodeData, camera: { ...props.nodeData.camera, motion } })
}

function getMotionIcon(motion: string): string {
  const icons: Record<string, string> = {
    'static': '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8" stroke-dasharray="2 2"/>',
    'dolly-in': '<polygon points="12,4 18,12 12,20"/><line x1="5" y1="12" x2="11" y2="12"/>',
    'dolly-out': '<polygon points="12,4 6,12 12,20"/><line x1="13" y1="12" x2="19" y2="12"/>',
    'truck-left': '<polygon points="5,12 12,5 12,19"/><line x1="13" y1="12" x2="19" y2="12"/>',
    'truck-right': '<polygon points="19,12 12,5 12,19"/><line x1="5" y1="12" x2="11" y2="12"/>',
    'pan-left': '<path d="M4 12a8 8 0 0 1 16 0"/><polyline points="20 8 20 12 16 12"/>',
    'pan-right': '<path d="M20 12a8 8 0 0 1-16 0"/><polyline points="4 8 4 12 8 12"/>',
    'tilt-up': '<polygon points="12,4 18,10 6,10"/><line x1="12" y1="14" x2="12" y2="20"/>',
    'tilt-down': '<polygon points="12,20 18,14 6,14"/><line x1="12" y1="4" x2="12" y2="10"/>',
    'orbit-clockwise': '<circle cx="12" cy="12" r="6"/><polyline points="17 6 19 9 16 10"/><polyline points="18 18 15 19 16 16"/>',
    'orbit-ccw': '<circle cx="12" cy="12" r="6"/><polyline points="7 6 5 9 8 10"/><polyline points="6 18 9 19 8 16"/>',
    'crane-up': '<polygon points="12,4 18,12 6,12"/><line x1="12" y1="14" x2="12" y2="20"/>',
    'crane-down': '<polygon points="12,20 18,12 6,12"/><line x1="12" y1="4" x2="12" y2="10"/>',
    'arc': '<path d="M4 16 Q12 4 20 16"/><circle cx="12" cy="12" r="1"/>',
    'zoom-in': '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/>',
    'zoom-out': '<circle cx="12" cy="12" r="2"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="10"/>',
    'shake': '<line x1="3" y1="12" x2="21" y2="12" stroke-dasharray="1 1"/><line x1="3" y1="8" x2="21" y2="16" stroke-dasharray="1 1"/><line x1="3" y1="16" x2="21" y2="8" stroke-dasharray="1 1"/>',
    'snap-zoom': '<polygon points="12,3 18,12 12,21 6,12"/><circle cx="12" cy="12" r="2" fill="currentColor"/>',
  }
  return icons[motion] || icons['static']
}

function getPresetPreviewStyle(presetKey: string): any {
  const styles: Record<string, any> = {
    'front': { '--camera-x': '50%', '--camera-y': '50%' },
    'back': { '--camera-x': '50%', '--camera-y': '50%' },
    'side-left': { '--camera-x': '20%', '--camera-y': '50%' },
    'side-right': { '--camera-x': '80%', '--camera-y': '50%' },
    'top': { '--camera-x': '50%', '--camera-y': '15%' },
    'close-up': { '--camera-x': '50%', '--camera-y': '55%' },
    'medium': { '--camera-x': '50%', '--camera-y': '50%' },
    'wide': { '--camera-x': '50%', '--camera-y': '45%' },
    'low-angle': { '--camera-x': '35%', '--camera-y': '70%' },
    'high-angle': { '--camera-x': '65%', '--camera-y': '20%' },
    'over-shoulder': { '--camera-x': '30%', '--camera-y': '40%' }
  }
  return styles[presetKey] || styles['front']
}
</script>

<style scoped>
.camera-library {
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
  color: #6366f1;
  background: rgba(99, 102, 241, 0.15);
  padding: 2px 8px;
  border-radius: 10px;
  font-family: monospace;
}

.lib-tabs {
  display: flex;
  gap: 2px;
  padding: 6px 0;
}

.lib-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 8px;
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 6px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  transition: all 0.15s;
}

.lib-tab:hover {
  background: #1e1e2e;
  color: #94a3b8;
}

.lib-tab.active {
  background: rgba(99, 102, 241, 0.15);
  color: #6366f1;
}

.tab-icon {
  width: 12px;
  height: 12px;
}

.lib-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.preset-card {
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 8px;
  padding: 8px 6px;
  cursor: pointer;
  text-align: center;
  transition: all 0.15s;
}

.preset-card:hover {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.05);
}

.preset-card.selected {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.15);
}

.preset-preview {
  height: 50px;
  background: #0a0a0f;
  border-radius: 4px;
  margin-bottom: 6px;
  position: relative;
}

.camera-icon {
  width: 8px;
  height: 8px;
  background: #6366f1;
  border-radius: 50%;
  position: absolute;
  left: var(--camera-x);
  top: var(--camera-y);
  transform: translate(-50%, -50%);
  box-shadow: 0 0 4px rgba(99, 102, 241, 0.5);
}

.target-dot {
  width: 6px;
  height: 6px;
  background: #f59e0b;
  border-radius: 50%;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.preset-name {
  font-size: 10px;
  color: #e2e8f0;
  font-weight: 500;
}

.positions-list {
  display: flex;
  flex-direction: column;
}

.positions-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border: none;
  background: #0f172a;
  color: #94a3b8;
  border-radius: 6px;
  cursor: pointer;
  font-size: 11px;
}

.tool-btn.primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
}

.position-count {
  font-size: 10px;
  color: #64748b;
  font-family: monospace;
}

.position-item {
  display: flex;
  align-items: center;
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 8px;
  padding: 8px 10px;
  margin-bottom: 4px;
  cursor: pointer;
  transition: all 0.15s;
}

.position-item:hover {
  border-color: #334155;
}

.position-item.active {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
}

.position-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.position-name {
  font-size: 12px;
  color: #e2e8f0;
  font-weight: 600;
}

.position-meta {
  font-size: 9px;
  color: #64748b;
  font-family: monospace;
}

.position-actions {
  display: flex;
  gap: 2px;
}

.pos-apply-btn,
.pos-del-btn {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 5px;
  cursor: pointer;
}

.pos-apply-btn:hover {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}

.pos-del-btn:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.motion-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
}

.motion-card {
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 8px;
  padding: 8px 6px;
  cursor: pointer;
  text-align: center;
  transition: all 0.15s;
}

.motion-card:hover {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.05);
}

.motion-card.selected {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

.motion-icon-wrap {
  width: 36px;
  height: 36px;
  background: #0a0a0f;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 4px;
  color: #6366f1;
}

.motion-card.selected .motion-icon-wrap {
  color: #f59e0b;
}

.motion-icon-svg {
  width: 20px;
  height: 20px;
}

.motion-name {
  font-size: 10px;
  color: #e2e8f0;
  font-weight: 500;
  display: block;
}

.motion-desc {
  font-size: 8px;
  color: #64748b;
  display: block;
}

.params-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.param-card {
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 8px;
  overflow: hidden;
}

.param-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  cursor: pointer;
}

.param-name {
  font-size: 12px;
  color: #e2e8f0;
  font-weight: 600;
}

.param-body {
  padding: 0 10px 8px;
}

.param-row {
  display: grid;
  grid-template-columns: 30px 1fr 30px 1fr;
  gap: 4px;
  margin-bottom: 4px;
  align-items: center;
}

.param-row label {
  font-size: 10px;
  color: #64748b;
}

.param-row input {
  background: #0a0a0f;
  border: 1px solid #334155;
  border-radius: 4px;
  padding: 4px 6px;
  color: #e2e8f0;
  font-size: 11px;
  font-family: monospace;
  outline: none;
}

.param-row select {
  grid-column: 3 / 5;
  background: #0a0a0f;
  border: 1px solid #334155;
  border-radius: 4px;
  padding: 4px 6px;
  color: #e2e8f0;
  font-size: 11px;
  outline: none;
}
</style>
