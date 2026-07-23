<template>
  <div class="scene3d-edit-overlay" @click="handleOverlayClick">
    <div class="edit-panel" @click.stop>
      <!-- 面板头部 -->
      <div class="panel-header">
        <div class="header-left">
          <div class="panel-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 3l10 6 10-6-10 6z"/>
              <path d="M2 12l10 6 10-6"/>
              <path d="M2 21l10 6 10-6"/>
            </svg>
          </div>
          <div class="header-info">
            <h2 class="panel-title">3D 导演台编辑</h2>
            <span class="panel-subtitle">{{ directorData.name || '未命名场景' }}</span>
          </div>
        </div>
        <button class="close-btn" @click="handleClose" title="关闭">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- 选项卡 -->
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path :d="tab.icon"/>
          </svg>
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <!-- 面板内容 -->
      <div class="panel-body">
        <!-- 相机参数 -->
        <div class="tab-content" v-show="activeTab === 'camera'">
          <div class="section">
            <h3 class="section-title">相机位置</h3>
            <div class="param-row">
              <div class="param-item">
                <label>X</label>
                <input type="number" v-model.number="camera.position.x" step="0.1" />
              </div>
              <div class="param-item">
                <label>Y</label>
                <input type="number" v-model.number="camera.position.y" step="0.1" />
              </div>
              <div class="param-item">
                <label>Z</label>
                <input type="number" v-model.number="camera.position.z" step="0.1" />
              </div>
            </div>
          </div>

          <div class="section">
            <h3 class="section-title">目标点</h3>
            <div class="param-row">
              <div class="param-item">
                <label>X</label>
                <input type="number" v-model.number="camera.target.x" step="0.1" />
              </div>
              <div class="param-item">
                <label>Y</label>
                <input type="number" v-model.number="camera.target.y" step="0.1" />
              </div>
              <div class="param-item">
                <label>Z</label>
                <input type="number" v-model.number="camera.target.z" step="0.1" />
              </div>
            </div>
          </div>

          <div class="section">
            <h3 class="section-title">镜头参数</h3>
            <div class="param-row">
              <div class="param-item full">
                <label>焦距 (mm)</label>
                <input type="range" v-model.number="camera.focalLength" min="14" max="200" />
                <span class="value">{{ camera.focalLength }}mm</span>
              </div>
            </div>
            <div class="param-row">
              <div class="param-item full">
                <label>视场角 (FOV)</label>
                <input type="range" v-model.number="camera.fov" min="10" max="120" />
                <span class="value">{{ camera.fov }}°</span>
              </div>
            </div>
          </div>

          <div class="section">
            <h3 class="section-title">景别</h3>
            <div class="shot-grid">
              <button
                v-for="shot in shotOptions"
                :key="shot.value"
                class="shot-btn"
                :class="{ active: camera.shotType === shot.value }"
                @click="camera.shotType = shot.value as ShotType"
              >
                <span class="shot-label">{{ shot.label }}</span>
                <span class="shot-desc">{{ shot.desc }}</span>
              </button>
            </div>
          </div>

          <div class="section">
            <h3 class="section-title">镜头运动</h3>
            <div class="motion-grid">
              <button
                v-for="motion in motionOptions"
                :key="motion.value"
                class="motion-btn"
                :class="{ active: camera.motion === motion.value }"
                @click="camera.motion = motion.value as CameraMotion"
              >
                <span class="motion-label">{{ motion.label }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 灯光参数 -->
        <div class="tab-content" v-show="activeTab === 'lights'">
          <div class="section">
            <h3 class="section-title">灯光列表</h3>
            <div class="light-list">
              <div
                v-for="(light, index) in lights"
                :key="light.id"
                class="light-item"
                :class="{ active: activeLightIndex === index }"
                @click="activeLightIndex = index"
              >
                <div class="light-info">
                  <div class="light-color-preview" :style="{ background: light.color }"></div>
                  <div class="light-details">
                    <span class="light-name">{{ light.name }}</span>
                    <span class="light-type">{{ lightTypeLabel(light.type) }}</span>
                  </div>
                </div>
                <div class="light-controls">
                  <label class="toggle">
                    <input type="checkbox" v-model="light.enabled" />
                    <span class="toggle-slider"></span>
                  </label>
                  <button
                    v-if="index > 0"
                    class="remove-light-btn"
                    @click.stop="removeLight(index)"
                    title="删除"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <button class="add-light-btn" @click="addLight">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              添加灯光
            </button>
          </div>

          <!-- 当前选中灯光参数 -->
          <div class="section" v-if="activeLight">
            <h3 class="section-title">{{ activeLight.name }} 参数</h3>
            <div class="param-row">
              <div class="param-item full">
                <label>颜色</label>
                <div class="color-picker">
                  <input type="color" v-model="activeLight.color" />
                  <input type="text" v-model="activeLight.color" />
                </div>
              </div>
            </div>
            <div class="param-row">
              <div class="param-item">
                <label>强度</label>
                <input type="range" v-model.number="activeLight.intensity" min="0" max="2" step="0.05" />
                <span class="value">{{ activeLight.intensity.toFixed(2) }}</span>
              </div>
              <div class="param-item">
                <label>色温 (K)</label>
                <input type="number" v-model.number="activeLight.temperature" min="2000" max="10000" />
              </div>
            </div>
            <div class="param-row">
              <div class="param-item full">
                <label>柔光度</label>
                <input type="range" v-model.number="activeLight.softness" min="0" max="1" step="0.05" />
                <span class="value">{{ activeLight.softness.toFixed(2) }}</span>
              </div>
            </div>
            <div class="param-row">
              <div class="param-item full">
                <label>方向</label>
                <div class="direction-grid">
                  <button
                    v-for="dir in directionOptions"
                    :key="dir.value"
                    class="dir-btn"
                    :class="{ active: activeLight.direction === dir.value }"
                    @click="activeLight.direction = dir.value"
                  >
                    {{ dir.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 材质参数 -->
        <div class="tab-content" v-show="activeTab === 'material'">
          <div class="section">
            <h3 class="section-title">材质列表</h3>
            <div class="material-list">
              <div
                v-for="(material, index) in materials"
                :key="material.id"
                class="material-item"
                :class="{ active: activeMaterialIndex === index }"
                @click="activeMaterialIndex = index"
              >
                <div class="material-color-preview" :style="{ background: material.color }"></div>
                <span class="material-name">{{ material.name }}</span>
              </div>
              <button class="add-material-btn" @click="addMaterial">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- 当前选中材质参数 -->
          <div class="section" v-if="activeMaterial">
            <h3 class="section-title">{{ activeMaterial.name }} 参数</h3>
            <div class="param-row">
              <div class="param-item full">
                <label>颜色</label>
                <div class="color-picker">
                  <input type="color" v-model="activeMaterial.color" />
                  <input type="text" v-model="activeMaterial.color" />
                </div>
              </div>
            </div>
            <div class="param-row">
              <div class="param-item">
                <label>粗糙度</label>
                <input type="range" v-model.number="activeMaterial.roughness" min="0" max="1" step="0.01" />
                <span class="value">{{ activeMaterial.roughness.toFixed(2) }}</span>
              </div>
              <div class="param-item">
                <label>金属度</label>
                <input type="range" v-model.number="activeMaterial.metalness" min="0" max="1" step="0.01" />
                <span class="value">{{ activeMaterial.metalness.toFixed(2) }}</span>
              </div>
            </div>
            <div class="param-row">
              <div class="param-item full">
                <label>自发光</label>
                <div class="emissive-row">
                  <input type="color" v-model="activeMaterial.emissive" />
                  <input type="text" v-model="activeMaterial.emissive" />
                  <input type="range" v-model.number="activeMaterial.emissiveIntensity" min="0" max="2" step="0.05" />
                  <span class="value">{{ activeMaterial.emissiveIntensity.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 环境参数 -->
        <div class="tab-content" v-show="activeTab === 'environment'">
          <div class="section">
            <h3 class="section-title">天空</h3>
            <div class="param-row">
              <div class="param-item full">
                <label>类型</label>
                <select v-model="environment.skyType">
                  <option value="gradient">渐变</option>
                  <option value="solid">纯色</option>
                  <option value="hdri">HDRI</option>
                </select>
              </div>
            </div>
            <div class="param-row">
              <div class="param-item">
                <label>顶部颜色</label>
                <div class="color-picker">
                  <input type="color" v-model="environment.skyTopColor" />
                </div>
              </div>
              <div class="param-item">
                <label>底部颜色</label>
                <div class="color-picker">
                  <input type="color" v-model="environment.skyBottomColor" />
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <h3 class="section-title">曝光与雾效</h3>
            <div class="param-row">
              <div class="param-item full">
                <label>曝光</label>
                <input type="range" v-model.number="environment.exposure" min="0" max="3" step="0.1" />
                <span class="value">{{ environment.exposure.toFixed(1) }}</span>
              </div>
            </div>
            <div class="param-row">
              <div class="param-item full">
                <label>雾效</label>
                <div class="fog-toggle">
                  <label class="toggle">
                    <input type="checkbox" v-model="environment.fogEnabled" />
                    <span class="toggle-slider"></span>
                  </label>
                  <span v-if="environment.fogEnabled">已启用</span>
                </div>
              </div>
            </div>
            <div class="param-row" v-if="environment.fogEnabled">
              <div class="param-item">
                <label>雾色</label>
                <div class="color-picker">
                  <input type="color" v-model="environment.fogColor" />
                </div>
              </div>
              <div class="param-item">
                <label>近</label>
                <input type="number" v-model.number="environment.fogNear" min="0" step="0.5" />
              </div>
              <div class="param-item">
                <label>远</label>
                <input type="number" v-model.number="environment.fogFar" min="0" step="0.5" />
              </div>
            </div>
          </div>
        </div>

        <!-- 元素管理 -->
        <div class="tab-content" v-show="activeTab === 'objects'">
          <div class="section">
            <h3 class="section-title">场景元素</h3>
            <div class="object-list">
              <div
                v-for="(obj, index) in objects"
                :key="obj.id"
                class="object-item"
                :class="{ active: activeObjectIndex === index }"
                @click="activeObjectIndex = index"
              >
                <span class="object-type-icon">{{ objectTypeIcon(obj.type) }}</span>
                <span class="object-name">{{ obj.name }}</span>
                <span class="object-type">{{ objectTypeLabel(obj.type) }}</span>
                <label class="toggle">
                  <input type="checkbox" v-model="obj.visible" @click.stop />
                  <span class="toggle-slider"></span>
                </label>
              </div>
              <button class="add-object-btn" @click="addObject">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                添加元素
              </button>
            </div>
          </div>

          <!-- 选中元素参数 -->
          <div class="section" v-if="activeObject">
            <h3 class="section-title">{{ activeObject.name }} 参数</h3>
            <div class="section-subtitle">位置</div>
            <div class="param-row">
              <div class="param-item">
                <label>X</label>
                <input type="number" v-model.number="activeObject.position.x" step="0.1" />
              </div>
              <div class="param-item">
                <label>Y</label>
                <input type="number" v-model.number="activeObject.position.y" step="0.1" />
              </div>
              <div class="param-item">
                <label>Z</label>
                <input type="number" v-model.number="activeObject.position.z" step="0.1" />
              </div>
            </div>
            <div class="section-subtitle">旋转</div>
            <div class="param-row">
              <div class="param-item">
                <label>X</label>
                <input type="number" v-model.number="activeObject.rotation.x" step="0.01" />
              </div>
              <div class="param-item">
                <label>Y</label>
                <input type="number" v-model.number="activeObject.rotation.y" step="0.01" />
              </div>
              <div class="param-item">
                <label>Z</label>
                <input type="number" v-model.number="activeObject.rotation.z" step="0.01" />
              </div>
            </div>
            <div class="section-subtitle">缩放</div>
            <div class="param-row">
              <div class="param-item">
                <label>X</label>
                <input type="number" v-model.number="activeObject.scale.x" step="0.1" min="0" />
              </div>
              <div class="param-item">
                <label>Y</label>
                <input type="number" v-model.number="activeObject.scale.y" step="0.1" min="0" />
              </div>
              <div class="param-item">
                <label>Z</label>
                <input type="number" v-model.number="activeObject.scale.z" step="0.1" min="0" />
              </div>
            </div>
          </div>
        </div>

        <!-- 动画参数 -->
        <div class="tab-content" v-show="activeTab === 'animation'">
          <div class="section">
            <h3 class="section-title">动画列表</h3>
            <div class="animation-list">
              <div
                v-for="(anim, index) in animations"
                :key="anim.id"
                class="animation-item"
              >
                <div class="anim-info">
                  <span class="anim-name">{{ anim.name }}</span>
                  <span class="anim-target">{{ anim.targetId }}</span>
                </div>
                <div class="anim-controls">
                  <span class="anim-duration">{{ anim.duration }} 帧</span>
                  <span class="anim-loop" v-if="anim.loop">🔄 循环</span>
                </div>
              </div>
              <div v-if="animations.length === 0" class="empty-state">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M9 9l6 6M15 9l-6 6"/>
                </svg>
                <span>暂无动画</span>
              </div>
            </div>
            <button class="add-animation-btn" @click="addAnimation">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              添加动画
            </button>
          </div>

          <div class="section" v-if="animations.length > 0">
            <h3 class="section-title">播放控制</h3>
            <div class="playback-controls">
              <button
                class="play-btn-large"
                :class="{ playing: isPlaying }"
                @click="togglePlay"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" v-if="!isPlaying">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" v-else>
                  <rect x="6" y="4" width="4" height="16"/>
                  <rect x="14" y="4" width="4" height="16"/>
                </svg>
                <span>{{ isPlaying ? '暂停' : '播放' }}</span>
              </button>
              <button class="reset-btn" @click="resetFrame">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="1 4 1 10 7 10"/>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                </svg>
                <span>重置</span>
              </button>
              <div class="frame-display">
                <span class="frame-text">{{ currentFrame }} / {{ totalFrames }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 面板底部 -->
      <div class="panel-footer">
        <div class="footer-left">
          <span class="frame-info">帧: {{ currentFrame }}</span>
          <span class="playing-indicator" v-if="isPlaying">
            <span class="dot"></span> 播放中
          </span>
        </div>
        <div class="footer-right">
          <button class="save-btn" @click="handleSave">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type {
  Scene3DDirectorData,
  CameraConfig,
  LightConfig,
  MaterialConfig,
  EnvironmentConfig,
  Scene3DObject,
  KeyframeAnimation,
  LightType,
  LightDirection,
  CameraMotion,
  ShotType
} from '../types'

const props = defineProps<{
  show: boolean
  nodeData: Scene3DDirectorData
}>()

const emit = defineEmits<{
  close: []
  save: [data: Scene3DDirectorData]
}>()

// 选项卡
const activeTab = ref('camera')
const tabs = [
  { id: 'camera', label: '相机', icon: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M8.5 13.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z' },
  { id: 'lights', label: '灯光', icon: 'M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z' },
  { id: 'material', label: '材质', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
  { id: 'environment', label: '环境', icon: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.27 6.96L12 12l8.73-5.04' },
  { id: 'objects', label: '元素', icon: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' },
  { id: 'animation', label: '动画', icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
]

// 导演台数据
const directorData = computed(() => props.nodeData)
const camera = computed(() => directorData.value.camera)
const lights = computed(() => directorData.value.lights)
const materials = computed(() => directorData.value.materials)
const environment = computed(() => directorData.value.environment)
const objects = computed(() => directorData.value.objects)
const animations = computed(() => directorData.value.animations)
const currentFrame = computed(() => directorData.value.currentFrame)
const isPlaying = computed(() => directorData.value.isPlaying)
const totalFrames = computed(() => {
  if (animations.value.length === 0) return 120
  return Math.max(...animations.value.map(a => a.duration), 120)
})

// 灯光索引
const activeLightIndex = ref(0)
const activeLight = computed(() => lights.value[activeLightIndex.value])

// 材质索引
const activeMaterialIndex = ref(0)
const activeMaterial = computed(() => materials.value[activeMaterialIndex.value])

// 元素索引
const activeObjectIndex = ref(0)
const activeObject = computed(() => objects.value[activeObjectIndex.value])

// 选项数据
const shotOptions = [
  { value: 'extreme-close-up', label: '特写', desc: '90°' },
  { value: 'close-up', label: '近景', desc: '70°' },
  { value: 'medium-close', label: '中近景', desc: '60°' },
  { value: 'medium', label: '中景', desc: '50°' },
  { value: 'medium-full', label: '中全景', desc: '40°' },
  { value: 'full', label: '全景', desc: '30°' },
  { value: 'wide', label: '远景', desc: '25°' },
  { value: 'extreme-wide', label: '大远景', desc: '15°' },
]

const motionOptions = [
  { value: 'static', label: '静态' },
  { value: 'pan', label: '摇移' },
  { value: 'tilt', label: '俯仰' },
  { value: 'dolly', label: '推拉' },
  { value: 'truck', label: '横移' },
  { value: 'orbit', label: '环绕' },
  { value: 'push', label: '推近' },
  { value: 'pull', label: '拉远' },
]

const directionOptions: Array<{ value: LightDirection; label: string }> = [
  { value: 'top', label: '顶光' },
  { value: 'bottom', label: '底光' },
  { value: 'left', label: '左光' },
  { value: 'right', label: '右光' },
  { value: 'front', label: '前光' },
  { value: 'back', label: '后光' },
  { value: 'side', label: '侧光' },
]

const lightTypeLabel = (type: LightType): string => {
  const map: Record<LightType, string> = {
    key: '主光',
    fill: '辅光',
    rim: '轮廓光',
    ambient: '环境光',
    accent: '点缀光'
  }
  return map[type] || type
}

const objectTypeIcon = (type: string): string => {
  const map: Record<string, string> = {
    mesh: '📦',
    character: '👤',
    prop: '🧱',
    light: '💡',
    camera: '📷'
  }
  return map[type] || '📦'
}

const objectTypeLabel = (type: string): string => {
  const map: Record<string, string> = {
    mesh: '网格',
    character: '角色',
    prop: '道具',
    light: '灯光',
    camera: '相机'
  }
  return map[type] || type
}

// 操作
const handleClose = () => emit('close')
const handleOverlayClick = () => emit('close')
const handleSave = () => emit('save', { ...directorData.value })

const togglePlay = () => {
  emit('save', { ...directorData.value, isPlaying: !isPlaying.value })
}

const resetFrame = () => {
  emit('save', { ...directorData.value, currentFrame: 0, isPlaying: false })
}

const addLight = () => {
  const newLight: LightConfig = {
    id: `light_${Date.now()}`,
    name: '新灯光',
    type: 'fill',
    direction: 'front',
    color: '#ffffff',
    intensity: 0.5,
    temperature: 5600,
    softness: 0.5,
    enabled: true
  }
  const updatedLights = [...lights.value, newLight]
  emit('save', { ...directorData.value, lights: updatedLights })
  activeLightIndex.value = lights.value.length
}

const removeLight = (index: number) => {
  if (index === 0) return
  const updatedLights = lights.value.filter((_, i) => i !== index)
  emit('save', { ...directorData.value, lights: updatedLights })
  if (activeLightIndex.value >= index) activeLightIndex.value = Math.max(0, activeLightIndex.value - 1)
}

const addMaterial = () => {
  const newMaterial: MaterialConfig = {
    id: `mat_${Date.now()}`,
    name: '新材质',
    color: '#888888',
    roughness: 0.5,
    metalness: 0.0,
    emissive: '#000000',
    emissiveIntensity: 0,
    bumpScale: 0
  }
  const updatedMaterials = [...materials.value, newMaterial]
  emit('save', { ...directorData.value, materials: updatedMaterials })
  activeMaterialIndex.value = materials.value.length
}

const addObject = () => {
  const newObj: Scene3DObject = {
    id: `obj_${Date.now()}`,
    name: '新物体',
    type: 'prop',
    visible: true,
    position: { x: 0, y: 0.5, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    materialId: 'mat_default'
  }
  const updatedObjects = [...objects.value, newObj]
  emit('save', { ...directorData.value, objects: updatedObjects })
  activeObjectIndex.value = objects.value.length
}

const addAnimation = () => {
  const newAnim: KeyframeAnimation = {
    id: `anim_${Date.now()}`,
    name: '新动画',
    targetId: '',
    property: 'position.x',
    keyframes: [
      { time: 0, value: 0 },
      { time: 60, value: 2 },
      { time: 120, value: 0 }
    ],
    loop: true,
    duration: 120
  }
  const updatedAnimations = [...animations.value, newAnim]
  emit('save', { ...directorData.value, animations: updatedAnimations })
}
</script>

<style scoped>
.scene3d-edit-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  z-index: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.edit-panel {
  width: 720px;
  max-width: calc(100% - 48px);
  height: 80vh;
  max-height: 720px;
  background: #0f172a;
  border-radius: 20px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(99, 102, 241, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.2s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* 面板头部 */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  border-bottom: 1px solid #1e293b;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.panel-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.panel-title {
  font-size: 16px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0;
}

.panel-subtitle {
  font-size: 12px;
  color: #94a3b8;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #1e293b;
  color: #94a3b8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.close-btn:hover {
  background: #334155;
  color: #f1f5f9;
}

/* 选项卡 */
.tabs {
  display: flex;
  gap: 4px;
  padding: 8px 16px;
  background: #0f172a;
  border-bottom: 1px solid #1e293b;
  flex-shrink: 0;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s;
}

.tab-btn:hover {
  background: #1e293b;
  color: #94a3b8;
}

.tab-btn.active {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
}

/* 面板内容 */
.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #0f172a;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 分组 */
.section {
  background: #1e293b;
  border-radius: 12px;
  padding: 14px;
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0 0 10px;
}

.section-subtitle {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 8px 0 6px;
}

/* 参数行 */
.param-row {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.param-row:last-child {
  margin-bottom: 0;
}

.param-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.param-item.full {
  flex: 1 1 100%;
}

.param-item label {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
}

.param-item input[type="number"],
.param-item input[type="text"],
.param-item select {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 6px 8px;
  color: #e2e8f0;
  font-size: 12px;
  outline: none;
  transition: border-color 0.15s;
}

.param-item input[type="number"]:focus,
.param-item input[type="text"]:focus,
.param-item select:focus {
  border-color: #6366f1;
}

.param-item input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: #334155;
  border-radius: 2px;
  outline: none;
}

.param-item input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #6366f1;
  cursor: pointer;
}

.param-item input[type="range"]::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #6366f1;
  cursor: pointer;
  border: none;
}

.value {
  font-size: 11px;
  color: #6366f1;
  font-family: monospace;
}

/* 颜色选择器 */
.color-picker {
  display: flex;
  gap: 6px;
  align-items: center;
}

.color-picker input[type="color"] {
  width: 32px;
  height: 28px;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 2px;
  background: #0f172a;
  cursor: pointer;
}

.color-picker input[type="text"] {
  flex: 1;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 6px 8px;
  color: #e2e8f0;
  font-size: 12px;
  font-family: monospace;
}

/* 自发光行 */
.emissive-row {
  display: flex;
  gap: 6px;
  align-items: center;
}

.emissive-row input[type="color"] {
  width: 32px;
  height: 28px;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 2px;
  background: #0f172a;
}

.emissive-row input[type="text"] {
  flex: 1;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 6px 8px;
  color: #e2e8f0;
  font-size: 12px;
  font-family: monospace;
}

.emissive-row input[type="range"] {
  flex: 1;
  height: 4px;
  background: #334155;
  border-radius: 2px;
}

/* 景别网格 */
.shot-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.shot-btn {
  padding: 8px 6px;
  border: 1px solid #334155;
  border-radius: 8px;
  background: #0f172a;
  color: #94a3b8;
  cursor: pointer;
  text-align: center;
  transition: all 0.15s;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.shot-btn:hover {
  border-color: #6366f1;
  color: #e2e8f0;
}

.shot-btn.active {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-color: transparent;
  color: white;
}

.shot-label {
  font-size: 11px;
  font-weight: 600;
}

.shot-desc {
  font-size: 9px;
  opacity: 0.7;
}

/* 镜头运动网格 */
.motion-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.motion-btn {
  padding: 8px 6px;
  border: 1px solid #334155;
  border-radius: 8px;
  background: #0f172a;
  color: #94a3b8;
  cursor: pointer;
  text-align: center;
  font-size: 12px;
  transition: all 0.15s;
}

.motion-btn:hover {
  border-color: #6366f1;
  color: #e2e8f0;
}

.motion-btn.active {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-color: transparent;
  color: white;
}

.motion-label {
  font-size: 11px;
  font-weight: 600;
}

/* 方向网格 */
.direction-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.dir-btn {
  padding: 8px 6px;
  border: 1px solid #334155;
  border-radius: 8px;
  background: #0f172a;
  color: #94a3b8;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.15s;
}

.dir-btn:hover {
  border-color: #6366f1;
  color: #e2e8f0;
}

.dir-btn.active {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-color: transparent;
  color: white;
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
  width: 32px;
  height: 18px;
  background: #334155;
  border-radius: 9px;
  position: relative;
  transition: all 0.15s;
}

.toggle-slider::after {
  content: '';
  position: absolute;
  width: 14px;
  height: 14px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: all 0.15s;
}

.toggle input:checked + .toggle-slider {
  background: #6366f1;
}

.toggle input:checked + .toggle-slider::after {
  left: 16px;
}

/* 灯光列表 */
.light-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.light-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 10px;
  background: #0f172a;
  border: 1px solid #334155;
  cursor: pointer;
  transition: all 0.15s;
}

.light-item:hover {
  border-color: #475569;
}

.light-item.active {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
}

.light-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.light-color-preview {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.light-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.light-name {
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
}

.light-type {
  font-size: 10px;
  color: #94a3b8;
}

.light-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.remove-light-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.remove-light-btn:hover {
  background: #fef2f2;
  color: #ef4444;
}

.add-light-btn,
.add-material-btn,
.add-object-btn,
.add-animation-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px;
  border: 1px dashed #475569;
  border-radius: 10px;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s;
}

.add-light-btn:hover,
.add-material-btn:hover,
.add-object-btn:hover,
.add-animation-btn:hover {
  border-color: #6366f1;
  color: #e2e8f0;
  background: rgba(99, 102, 241, 0.05);
}

/* 材质列表 */
.material-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.material-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  background: #0f172a;
  border: 1px solid #334155;
  cursor: pointer;
  transition: all 0.15s;
}

.material-item:hover {
  border-color: #475569;
}

.material-item.active {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
}

.material-color-preview {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.material-name {
  font-size: 12px;
  color: #e2e8f0;
}

.add-material-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 8px;
}

/* 元素列表 */
.object-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.object-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  background: #0f172a;
  border: 1px solid #334155;
  cursor: pointer;
  transition: all 0.15s;
}

.object-item:hover {
  border-color: #475569;
}

.object-item.active {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
}

.object-type-icon {
  font-size: 16px;
}

.object-name {
  flex: 1;
  font-size: 13px;
  color: #e2e8f0;
}

.object-type {
  font-size: 10px;
  color: #64748b;
  background: #1e293b;
  padding: 2px 6px;
  border-radius: 4px;
}

.add-object-btn {
  margin-top: 4px;
}

/* 动画列表 */
.animation-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.animation-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 10px;
  background: #0f172a;
  border: 1px solid #334155;
}

.anim-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.anim-name {
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
}

.anim-target {
  font-size: 10px;
  color: #64748b;
  font-family: monospace;
}

.anim-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.anim-duration {
  font-size: 11px;
  color: #6366f1;
  font-family: monospace;
}

.anim-loop {
  font-size: 11px;
  color: #94a3b8;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  color: #64748b;
}

.empty-state span {
  font-size: 13px;
}

/* 播放控制 */
.playback-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.play-btn-large {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.15s;
}

.play-btn-large:hover {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
}

.play-btn-large.playing {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border: 1px solid #475569;
  background: #0f172a;
  color: #94a3b8;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s;
}

.reset-btn:hover {
  border-color: #6366f1;
  color: #e2e8f0;
}

.frame-display {
  flex: 1;
  text-align: right;
}

.frame-text {
  font-size: 14px;
  font-family: monospace;
  color: #6366f1;
  font-weight: 600;
}

/* 面板底部 */
.panel-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #0f172a;
  border-top: 1px solid #1e293b;
  flex-shrink: 0;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.frame-info {
  font-size: 12px;
  font-family: monospace;
  color: #94a3b8;
}

.playing-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #f59e0b;
}

.playing-indicator .dot {
  width: 6px;
  height: 6px;
  background: #f59e0b;
  border-radius: 50%;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.15s;
}

.save-btn:hover {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}
</style>
