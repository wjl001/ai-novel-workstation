<template>
  <div
    class="scene3d-node"
    :class="{ 'is-selected': isSelected, 'is-dragging': isDragging }"
    :style="nodeStyle"
    @mousedown.stop="onMouseDown"
    @click.stop="onSelect"
  >
    <!-- 节点头部 -->
    <div class="node-header">
      <div class="header-left">
        <div class="node-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 3l10 6 10-6-10 6z"/>
            <path d="M2 12l10 6 10-6"/>
            <path d="M2 21l10 6 10-6"/>
          </svg>
        </div>
        <span class="node-type-badge">3D 导演台</span>
      </div>
      <div class="header-actions">
        <button
          v-if="directorData.isPlaying"
          class="play-btn is-playing"
          @click.stop="togglePlay"
          title="暂停"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16"/>
            <rect x="14" y="4" width="4" height="16"/>
          </svg>
        </button>
        <button
          v-else
          class="play-btn"
          @click.stop="togglePlay"
          title="播放"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </button>
        <button class="action-btn" @click.stop="$emit('openEdit')" title="编辑场景">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="action-btn" @click.stop="$emit('delete')" title="删除节点">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 3D 视口 -->
    <div class="viewport" ref="viewportRef">
      <canvas ref="canvasRef" class="preview-canvas"></canvas>

      <!-- 视口工具栏 -->
      <div class="viewport-toolbar">
        <button
          v-for="tool in viewportTools"
          :key="tool.id"
          class="tool-btn"
          :class="{ active: activeTool === tool.id }"
          @click.stop="activeTool = tool.id"
          :title="tool.label"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path :d="tool.icon"/>
          </svg>
        </button>
        <div class="toolbar-divider"></div>
        <button class="tool-btn" @click.stop="resetCamera" title="重置相机">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
          </svg>
        </button>
      </div>

      <!-- 时间轴（有动画时显示） -->
      <div class="timeline" v-if="hasAnimations">
        <div class="timeline-track">
          <div class="timeline-progress" :style="{ width: framePercent + '%' }"></div>
          <div class="timeline-handle" :style="{ left: framePercent + '%' }"></div>
        </div>
        <div class="timeline-info">
          <span class="frame-label">{{ currentFrame }} / {{ totalFrames }}</span>
        </div>
      </div>
    </div>

    <!-- 场景参数快速面板 -->
    <div class="quick-panel">
      <div class="panel-row">
        <span class="panel-label">镜头</span>
        <span class="panel-value">{{ cameraShotLabel }}</span>
      </div>
      <div class="panel-row">
        <span class="panel-label">焦距</span>
        <span class="panel-value">{{ camera.focalLength }}mm</span>
      </div>
      <div class="panel-row">
        <span class="panel-label">灯光</span>
        <span class="panel-value">{{ activeLightCount }}/{{ lights.length }}</span>
      </div>
    </div>

    <!-- 节点标签 -->
    <div class="node-label">
      <input
        v-model="nodeLabel"
        class="node-name-input"
        placeholder="3D 场景名称"
        @click.stop
        @input="onLabelChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import type { CanvasNode, Scene3DDirectorData, CameraConfig, LightConfig } from '../types'
import { render3DPreview, createDefaultDirectorData } from '../utils/Scene3DPreview'

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
  updateLabel: [label: string]
  updateCamera: [camera: CameraConfig]
  updateLights: [lights: LightConfig[]]
  togglePlay: [playing: boolean]
}>()

// ============= 状态 =============
const canvasRef = ref<HTMLCanvasElement | null>(null)
const viewportRef = ref<HTMLDivElement | null>(null)
const nodeLabel = ref(props.node.label)
const activeTool = ref('orbit')
const renderFrameId = ref<number>(0)

// 3D 导演台数据
const directorData = computed<Scene3DDirectorData>(() => {
  const raw = props.node.data.directorData
  if (raw && raw.camera && raw.lights && raw.materials && raw.environment && raw.objects) {
    return raw as Scene3DDirectorData
  }
  return createDefaultDirectorData()
})

const camera = computed(() => directorData.value.camera)
const lights = computed(() => directorData.value.lights)
const materials = computed(() => directorData.value.materials)
const environment = computed(() => directorData.value.environment)
const objects = computed(() => directorData.value.objects)
const currentFrame = computed(() => directorData.value.currentFrame)
const isPlaying = computed(() => directorData.value.isPlaying)

const hasAnimations = computed(() => directorData.value.animations && directorData.value.animations.length > 0)
const totalFrames = computed(() => {
  const anims = directorData.value.animations
  if (!anims || anims.length === 0) return 0
  return Math.max(...anims.map(a => a.duration), 120)
})
const framePercent = computed(() => totalFrames.value > 0 ? (currentFrame.value / totalFrames.value) * 100 : 0)

const activeLightCount = computed(() => lights.value.filter(l => l.enabled).length)

const cameraShotLabel = computed(() => {
  const shot = camera.value.shotType
  return shot.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
})

// ============= 节点样式 =============
const nodeStyle = computed(() => ({
  left: `${props.node.position.x}px`,
  top: `${props.node.position.y}px`,
  width: `${props.node.size.width}px`
}))

// ============= 视口工具 =============
const viewportTools = [
  { id: 'orbit', label: '轨道旋转', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v6h-2zm0 8h2v2h-2z' },
  { id: 'pan', label: '平移', icon: 'M15 3l2.3 2.3-2.89 2.87 1.42 1.42L18.7 6.7V11h2V3h-5.7z M5 12h2.1l.3-2H7V8h2v2h2V8h2v2h-2.1l.3 2H11v2h2v2h-2v2h-2v-2H9v2H7v-2h2v-2H5z' },
  { id: 'zoom', label: '缩放', icon: 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z' },
  { id: 'lights', label: '灯光', icon: 'M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z' },
]

// ============= 事件处理 =============
const onMouseDown = (event: MouseEvent) => {
  emit('dragStart', event, props.node.id)
}

const onSelect = () => {
  emit('select')
}

const onLabelChange = () => {
  emit('updateLabel', nodeLabel.value)
}

// ============= 播放控制 =============
const togglePlay = () => {
  emit('togglePlay', !isPlaying.value)
}

// ============= 相机重置 =============
const resetCamera = () => {
  emit('updateCamera', {
    ...camera.value,
    position: { x: 0, y: 1.5, z: 5 },
    target: { x: 0, y: 1, z: 0 },
    fov: 60,
    focalLength: 50,
    motion: 'static'
  })
}

// ============= 渲染循环 =============
let animFrameId: number = 0
let lastTime = 0

const render = (timestamp: number) => {
  if (!canvasRef.value) return

  // 自动播放动画
  if (isPlaying.value && hasAnimations.value) {
    const deltaTime = timestamp - lastTime
    lastTime = timestamp
    const newFrame = (currentFrame.value + deltaTime / 16.67) % totalFrames.value
    emit('updateCamera', { ...camera.value } as CameraConfig)
  }

  render3DPreview(
    canvasRef.value,
    camera.value,
    lights.value,
    materials.value,
    environment.value,
    objects.value
  )

  animFrameId = requestAnimationFrame(render)
}

const startRender = () => {
  if (animFrameId) cancelAnimationFrame(animFrameId)
  lastTime = performance.now()
  animFrameId = requestAnimationFrame(render)
}

// ============= 生命周期 =============
onMounted(async () => {
  await nextTick()
  startRender()
})

onUnmounted(() => {
  if (animFrameId) cancelAnimationFrame(animFrameId)
})

// 监听数据变化，重新渲染
watch([camera, lights, environment], () => {
  startRender()
}, { deep: true })
</script>

<style scoped>
.scene3d-node {
  position: absolute;
  background: #0a0a0f;
  border-radius: 16px;
  border: 2px solid #1e1e2e;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.1);
  cursor: move;
  transition: box-shadow 0.2s, border-color 0.2s;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.scene3d-node:hover {
  box-shadow: 0 8px 30px rgba(99, 102, 241, 0.15);
  border-color: #2d2d44;
}

.scene3d-node.is-selected {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2), 0 8px 30px rgba(99, 102, 241, 0.15);
}

.scene3d-node.is-dragging {
  opacity: 0.9;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  transform: scale(1.02);
  z-index: 100;
}

/* ============= 节点头部 ============= */
.node-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: linear-gradient(180deg, #12121a 0%, #0a0a0f 100%);
  border-bottom: 1px solid #1e1e2e;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.node-icon {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
}

.node-type-badge {
  font-size: 10px;
  font-weight: 800;
  color: #a5b4fc;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.play-btn {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #1e1e2e;
  color: #6366f1;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.play-btn:hover {
  background: #2d2d44;
  color: #818cf8;
}

.play-btn.is-playing {
  background: #6366f1;
  color: white;
}

.play-btn.is-playing:hover {
  background: #4f46e5;
}

.action-btn {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
}

.scene3d-node:hover .action-btn { opacity: 1; }
.action-btn:hover { background: #1e1e2e; color: #94a3b8; }

/* ============= 3D 视口 ============= */
.viewport {
  position: relative;
  width: 100%;
  height: 140px;
  background: #0a0a0f;
  overflow: hidden;
}

.preview-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

/* 视口工具栏 */
.viewport-toolbar {
  position: absolute;
  top: 6px;
  left: 6px;
  display: flex;
  align-items: center;
  gap: 2px;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(8px);
  border-radius: 6px;
  padding: 2px;
  z-index: 10;
}

.tool-btn {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #94a3b8;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
}

.tool-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

.tool-btn.active {
  background: rgba(99, 102, 241, 0.3);
  color: #a5b4fc;
}

.toolbar-divider {
  width: 1px;
  height: 16px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0 2px;
}

/* 时间轴 */
.timeline {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 4px 8px 6px;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(8px);
  z-index: 10;
}

.timeline-track {
  position: relative;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  cursor: pointer;
}

.timeline-progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 2px;
  transition: width 0.1s;
}

.timeline-handle {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.timeline-info {
  display: flex;
  justify-content: space-between;
  margin-top: 2px;
}

.frame-label {
  font-size: 8px;
  color: #94a3b8;
  font-family: monospace;
}

/* ============= 快速参数面板 ============= */
.quick-panel {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 6px 12px;
  background: #0f0f18;
  border-top: 1px solid #1e1e2e;
}

.panel-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}

.panel-label {
  font-size: 8px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.panel-value {
  font-size: 11px;
  color: #e2e8f0;
  font-weight: 600;
  font-family: monospace;
}

/* ============= 节点标签 ============= */
.node-label {
  padding: 4px 12px 8px;
  text-align: center;
}

.node-name-input {
  width: 100%;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
  text-align: center;
  outline: none;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.node-name-input:focus {
  background: #1e1e2e;
}

.node-name-input::placeholder {
  color: #475569;
}
</style>
