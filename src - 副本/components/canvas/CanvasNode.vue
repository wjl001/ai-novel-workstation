<template>
  <div
    class="canvas-node"
    :class="[`node-${node.type}`, { selected: isSelected, locked: node.locked, hidden: node.hidden }]"
    :style="nodeStyle"
    @click="onNodeClick"
    @dblclick="onNodeDblClick"
  >
    <!-- 节点头部 -->
    <div class="node-header" :style="{ backgroundColor: getHeaderColor }">
      <span class="node-type-badge">
        <component :is="getTypeIcon" :width="14" :height="14" />
      </span>
      <span class="node-title">{{ getNodeTitle }}</span>
      <div class="node-header-actions">
        <button v-if="!node.locked" @click.stop="onLockClick" class="lock-btn" :title="node.locked ? '解锁' : '锁定'">
          <svg v-if="node.locked" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 9.9-1" />
          </svg>
        </button>
        <button @click.stop="onDeleteClick" class="delete-btn" title="删除">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 节点内容区 -->
    <div class="node-content">
      <!-- 角色节点 -->
      <div v-if="node.type === NodeType.CHARACTER" class="character-content">
        <div class="character-preview">
          <img v-if="getMainImage" :src="getMainImage" :alt="getNodeTitle" class="preview-img" />
          <div v-else class="preview-placeholder">
            <User :width="32" :height="32" />
          </div>
          <div class="image-count" v-if="getImageCount > 1">+{{ getImageCount - 1 }}</div>
        </div>
        <div class="character-info">
          <div class="info-row" v-if="getNodeData('role')">
            <span class="info-label">角色</span>
            <span class="info-value">{{ getNodeData('role') }}</span>
          </div>
          <div class="info-row" v-if="getNodeData('persona')">
            <span class="info-label">人设</span>
            <span class="info-value">{{ truncate(getNodeData('persona'), 60) }}</span>
          </div>
        </div>
      </div>

      <!-- 场景节点 -->
      <div v-else-if="node.type === NodeType.SCENE" class="scene-content">
        <div class="scene-preview">
          <img v-if="getMainImage" :src="getMainImage" :alt="getNodeTitle" class="preview-img" />
          <div v-else class="preview-placeholder">
            <Palette :width="32" :height="32" />
          </div>
          <div class="scene-meta">
            <span v-if="getNodeData('time')">🕐 {{ getNodeData('time') }}</span>
            <span v-if=" getNodeData('weather')">🌤 {{ getNodeData('weather') }}</span>
          </div>
        </div>
        <div class="scene-info">
          <div class="info-row" v-if="getNodeData('atmosphere')">
            <span class="info-label">氛围</span>
            <span class="info-value">{{ getNodeData('atmosphere') }}</span>
          </div>
          <div class="info-row" v-if="getNodeData('description')">
            <span class="info-label">描述</span>
            <span class="info-value">{{ truncate(getNodeData('description'), 60) }}</span>
          </div>
        </div>
      </div>

      <!-- 文本节点 -->
      <div v-else-if="node.type === NodeType.TEXT" class="text-content">
        <div class="text-body" :style="{ fontSize: getTextFontSize + 'px', color: getTextColor, textAlign: getTextAlign }">
          {{ getNodeData('content') }}
        </div>
      </div>

      <!-- 图片节点 -->
      <div v-else-if="node.type === NodeType.IMAGE" class="image-content">
        <div class="image-frame">
          <img v-if="getNodeData('url')" :src="getNodeData('url')" :alt="getNodeData('alt')" class="frame-img" />
          <div v-else class="frame-placeholder">
            <Image :width="32" :height="32" />
          </div>
          <span v-if="getNodeData('source') === 'ai_generate'" class="ai-badge">AI</span>
        </div>
      </div>

      <!-- 视频节点 -->
      <div v-else-if="node.type === NodeType.VIDEO" class="video-content">
        <div class="video-frame">
          <video v-if="getNodeData('url')" :src="getNodeData('url')" :poster="getNodeData('thumbnail')" class="frame-video" controls></video>
          <div v-else class="frame-placeholder">
            <Video :width="32" :height="32" />
          </div>
          <span v-if="getNodeData('duration')" class="duration-badge">{{ formatDuration(getNodeData('duration')) }}</span>
        </div>
      </div>

      <!-- 音频节点 -->
      <div v-else-if="node.type === NodeType.AUDIO" class="audio-content">
        <div class="audio-player">
          <div class="audio-info">
            <Volume2 :width="20" :height="20" />
            <span class="audio-title">{{ getNodeData('title') || '音频' }}</span>
          </div>
          <audio v-if="getNodeData('url')" :src="getNodeData('url')" controls class="audio-control"></audio>
          <span v-if="getNodeData('duration')" class="audio-duration">{{ formatDuration(getNodeData('duration')) }}</span>
        </div>
      </div>

      <!-- 便签节点 -->
      <div v-else-if="node.type === NodeType.NOTE" class="note-content">
        <div class="note-body" :style="{ backgroundColor: getNoteColor }">
          {{ getNodeData('content') }}
        </div>
      </div>

      <!-- 链接节点 -->
      <div v-else-if="node.type === NodeType.LINK" class="link-content">
        <div class="link-body">
          <span class="link-icon">🔗</span>
          <div class="link-info">
            <div class="link-title">{{ getNodeData('title') || '外部链接' }}</div>
            <div class="link-url">{{ getNodeData('url') || '#' }}</div>
          </div>
        </div>
      </div>

      <!-- 提示词节点 -->
      <div v-else-if="node.type === NodeType.PROMPT" class="prompt-content">
        <div class="prompt-category" v-if="getNodeData('category')">
          <span class="category-badge">{{ getCategoryLabel(getNodeData('category')) }}</span>
        </div>
        <div class="prompt-body">
          {{ getNodeData('content') || '输入提示词...' }}
        </div>
        <div class="prompt-actions">
          <button class="prompt-btn" @click.stop="onGeneratePrompt">✨ AI生成</button>
          <button class="prompt-btn" @click.stop="onCopyPrompt">📋 复制</button>
        </div>
      </div>

      <!-- 光影控制节点 -->
      <div v-else-if="node.type === NodeType.LIGHTING" class="lighting-content">
        <div class="lighting-preview">
          <div class="light-direction" :style="getLightDirectionStyle">
            <div class="light-source"></div>
          </div>
          <div class="light-label">{{ getLightDirectionLabel }}</div>
        </div>
        <div class="lighting-info">
          <div class="info-row">
            <span class="info-label">类型</span>
            <span class="info-value">{{ getLightTypeLabel }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">色温</span>
            <span class="info-value">{{ getLightTempLabel }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">强度</span>
            <div class="info-value">
              <div class="intensity-bar">
                <div class="intensity-fill" :style="{ width: getNodeData('intensity') + '%', backgroundColor: getNodeData('color') }"></div>
              </div>
              {{ getNodeData('intensity') }}%
            </div>
          </div>
          <div class="info-row" v-if="getNodeData('description')">
            <span class="info-label">描述</span>
            <span class="info-value">{{ truncate(getNodeData('description'), 50) }}</span>
          </div>
        </div>
      </div>

      <!-- 镜头控制节点 -->
      <div v-else-if="node.type === NodeType.LENS" class="lens-content">
        <div class="lens-preview">
          <Camera :width="36" :height="36" />
          <span class="lens-focal">{{ getNodeData('focalLength') || '50mm' }}</span>
        </div>
        <div class="lens-info">
          <div class="info-row">
            <span class="info-label">景别</span>
            <span class="info-value">{{ getShotTypeLabel }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">机位</span>
            <span class="info-value">{{ getCameraHeightLabel }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">运镜</span>
            <span class="info-value">{{ getMovementLabel }}</span>
          </div>
          <div class="info-row" v-if="getNodeData('prompt')">
            <span class="info-label">提示</span>
            <span class="info-value">{{ truncate(getNodeData('prompt'), 50) }}</span>
          </div>
        </div>
      </div>

      <!-- 全景图节点 -->
      <div v-else-if="node.type === NodeType.PANORAMA" class="panorama-content">
        <div class="panorama-frame">
          <img v-if="getNodeData('url')" :src="getNodeData('url')" :alt="getNodeData('description')" class="panorama-img" />
          <div v-else class="panorama-placeholder">
            <Globe :width="32" :height="32" />
          </div>
          <span class="panorama-badge">720°</span>
          <span v-if="getNodeData('isGenerated')" class="generated-badge">AI</span>
        </div>
      </div>

      <!-- 道具节点 -->
      <div v-else-if="node.type === NodeType.PROPS" class="props-content">
        <div class="props-preview">
          <img v-if="getNodeData('image')" :src="getNodeData('image')" :alt="getNodeData('name')" class="props-img" />
          <div v-else class="props-placeholder">
            <Package :width="32" :height="32" />
          </div>
        </div>
        <div class="props-info">
          <div class="info-row" v-if="getNodeData('material')">
            <span class="info-label">材质</span>
            <span class="info-value">{{ getNodeData('material') }}</span>
          </div>
          <div class="info-row" v-if="getNodeData('usage')">
            <span class="info-label">用途</span>
            <span class="info-value">{{ getNodeData('usage') }}</span>
          </div>
        </div>
      </div>

      <!-- 分镜节点 -->
      <div v-else-if="node.type === NodeType.STORYBOARD" class="storyboard-content">
        <div class="storyboard-preview">
          <div class="shot-info">
            <span>第{{ getNodeData('episode') }}集</span>
            <span>镜头{{ getNodeData('shot') }}</span>
          </div>
          <img v-if="getStoryboardImage" :src="getStoryboardImage" :alt="getNodeData('title')" class="storyboard-img" />
          <div v-else class="storyboard-placeholder">
            <Film :width="32" :height="32" />
          </div>
          <span v-if="getNodeData('duration')" class="duration-badge">{{ formatDuration(getNodeData('duration')) }}</span>
        </div>
      </div>

      <!-- 文档节点 -->
      <div v-else-if="node.type === NodeType.DOCUMENT" class="document-content">
        <div class="document-body">
          <span class="document-icon">{{ getDocumentIcon }}</span>
          <div class="document-info">
            <div class="document-title">{{ getNodeData('title') || '文档' }}</div>
            <div class="document-preview">{{ truncate(getNodeData('content'), 80) }}</div>
          </div>
        </div>
      </div>

      <!-- 默认节点 -->
      <div v-else class="default-content">
        <span class="default-label">{{ getNodeTitle }}</span>
      </div>
    </div>

    <!-- 调整手柄 -->
    <div v-if="isSelected && !node.locked" class="resize-handles">
      <div class="resize-handle top-left" :data-handle="'top-left'"></div>
      <div class="resize-handle top" :data-handle="'top'"></div>
      <div class="resize-handle top-right" :data-handle="'top-right'"></div>
      <div class="resize-handle right" :data-handle="'right'"></div>
      <div class="resize-handle bottom-right" :data-handle="'bottom-right'"></div>
      <div class="resize-handle bottom" :data-handle="'bottom'"></div>
      <div class="resize-handle bottom-left" :data-handle="'bottom-left'"></div>
      <div class="resize-handle left" :data-handle="'left'"></div>
    </div>

    <!-- 连接手柄 -->
    <div v-if="!node.locked" class="connection-handles">
      <div class="connection-handle top-handle"></div>
      <div class="connection-handle bottom-handle"></div>
    </div>

    <!-- 选中状态指示器 -->
    <div v-if="isSelected" class="selection-indicator"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  User, Palette, FileText, Image, Video, Volume2, StickyNote,
  Link, Sparkles, Sun, Camera, Globe, Package, Film, File
} from 'lucide-vue-next'
import { NodeType } from '../../types/canvas'

interface Props {
  node: any
  isSelected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false,
})

const emit = defineEmits<{
  'node-click': [id: string]
  'node-dblclick': [id: string]
  'lock-toggle': [id: string]
  'delete': [id: string]
  'resize': [id: string, size: { width: number; height: number }]
}>()

const NodeTypeEnum = NodeType

// 计算样式
const nodeStyle = computed(() => {
  return {
    width: (props.node.size?.width || 200) + 'px',
    height: (props.node.size?.height || 150) + 'px',
    left: props.node.position.x + 'px',
    top: props.node.position.y + 'px',
    opacity: props.node.opacity || 100,
    zIndex: 10,
  }
})

// 头部颜色
const getHeaderColor = computed(() => {
  const colors: Record<string, string> = {
    character: '#6366f1',
    scene: '#22c55e',
    text: '#3b82f6',
    image: '#f97316',
    video: '#ef4444',
    audio: '#a855f7',
    note: '#eab308',
    link: '#06b6d4',
    prompt: '#8b5cf6',
    lighting: '#f59e0b',
    lens: '#10b981',
    panorama: '#14b8a6',
    props: '#fb923c',
    storyboard: '#ec4899',
    document: '#64748b',
  }
  return colors[props.node.type] || '#94a3b8'
})

// 节点标题
const getNodeTitle = computed(() => {
  if (props.node.type === NodeType.CHARACTER) return props.node.data?.name || '角色'
  if (props.node.type === NodeType.SCENE) return props.node.data?.name || '场景'
  if (props.node.type === NodeType.TEXT) return props.node.data?.title || '文本'
  if (props.node.type === NodeType.IMAGE) return props.node.data?.alt || '图片'
  if (props.node.type === NodeType.VIDEO) return props.node.data?.title || '视频'
  if (props.node.type === NodeType.AUDIO) return props.node.data?.title || '音频'
  if (props.node.type === NodeType.NOTE) return '便签'
  if (props.node.type === NodeType.LINK) return props.node.data?.title || '链接'
  if (props.node.type === NodeType.PROMPT) return '提示词'
  if (props.node.type === NodeType.LIGHTING) return '光影控制'
  if (props.node.type === NodeType.LENS) return '镜头控制'
  if (props.node.type === NodeType.PANORAMA) return '全景图'
  if (props.node.type === NodeType.PROPS) return props.node.data?.name || '道具'
  if (props.node.type === NodeType.STORYBOARD) return props.node.data?.title || '分镜'
  if (props.node.type === NodeType.DOCUMENT) return props.node.data?.title || '文档'
  return '节点'
})

// 类型图标
const getTypeIcon = computed(() => {
  const icons: Record<string, any> = {
    character: User,
    scene: Palette,
    text: FileText,
    image: Image,
    video: Video,
    audio: Volume2,
    note: StickyNote,
    link: Link,
    prompt: Sparkles,
    lighting: Sun,
    lens: Camera,
    panorama: Globe,
    props: Package,
    storyboard: Film,
    document: File,
  }
  return icons[props.node.type] || File
})

// 数据辅助方法
function getNodeData(key: string): any {
  return props.node.data?.[key]
}

// 角色/场景主图
const getMainImage = computed(() => {
  const images = getNodeData('images')
  if (images && Array.isArray(images)) {
    return images[0]?.url || images[0]?.thumbnail || ''
  }
  return ''
})

const getImageCount = computed(() => {
  const images = getNodeData('images')
  return images && Array.isArray(images) ? images.length : 0
})

// 文本节点样式
const getTextFontSize = computed(() => getNodeData('fontSize') || 14)
const getTextColor = computed(() => getNodeData('color') || '#333')
const getTextAlign = computed(() => getNodeData('align') || 'left')

// 便签颜色
const getNoteColor = computed(() => {
  return getNodeData('color') || '#fef08a'
})

// 链接 URL
const getDocumentIcon = computed(() => {
  const type = getNodeData('fileType') || 'md'
  const icons: Record<string, string> = {
    md: '📝',
    txt: '📄',
    docx: '📎',
  }
  return icons[type] || '📄'
})

// 分镜图片
const getStoryboardImage = computed(() => {
  const images = getNodeData('images')
  return images && Array.isArray(images) && images.length > 0 ? images[0] : ''
})

// 光影控制
const getLightDirectionStyle = computed(() => {
  const directions: Record<string, string> = {
    top: 'top: 10px; left: 50%; transform: translateX(-50%);',
    bottom: 'bottom: 10px; left: 50%; transform: translateX(-50%);',
    left: 'left: 10px; top: 50%; transform: translateY(-50%);',
    right: 'right: 10px; top: 50%; transform: translateY(-50%);',
    back: 'bottom: 10px; right: 10px;',
    side: 'left: 50%; top: 50%; transform: translate(-50%, -50%);',
    front: 'top: 10px; left: 10px;',
  }
  return directions[getNodeData('direction')] || directions.side
})

const getLightDirectionLabel = computed(() => {
  const labels: Record<string, string> = {
    top: '顶部光',
    bottom: '底部光',
    left: '左侧光',
    right: '右侧光',
    back: '逆光',
    side: '侧光',
    front: '正面光',
  }
  return labels[getNodeData('direction')] || '侧光'
})

const getLightTypeLabel = computed(() => {
  const labels: Record<string, string> = {
    key: '主光',
    fill: '补光',
    rim: '轮廓光',
    ambient: '环境光',
    accent: '强调光',
  }
  return labels[getNodeData('type')] || '主光'
})

const getLightTempLabel = computed(() => {
  const labels: Record<string, string> = {
    warm: '暖光',
    neutral: '中性光',
    cool: '冷光',
  }
  return labels[getNodeData('temperature')] || '暖光'
})

// 镜头控制
const getShotTypeLabel = computed(() => {
  const labels: Record<string, string> = {
    extreme_close_up: '大特写',
    close_up: '特写',
    medium_close_up: '近景',
    medium: '中景',
    medium_long: '中远景',
    long: '远景',
    extreme_long: '大远景',
  }
  return labels[getNodeData('shotType')] || '中景'
})

const getCameraHeightLabel = computed(() => {
  const labels: Record<string, string> = {
    high: '俯拍',
    eye: '平视',
    low: '仰拍',
    ground: '贴地',
  }
  return labels[getNodeData('cameraHeight')] || '平视'
})

const getMovementLabel = computed(() => {
  const labels: Record<string, string> = {
    static: '固定',
    pan: '摇镜',
    tilt: '俯仰',
    dolly: '推轨',
    track: '跟拍',
    push: '推进',
    pull: '拉远',
    arc: '环绕',
  }
  return labels[getNodeData('movement')] || '固定'
})

// 分类标签
const getCategoryLabel = computed(() => {
  const cat = getNodeData('category')
  const labels: Record<string, string> = {
    character: '角色',
    scene: '场景',
    shot: '分镜',
    style: '风格',
  }
  return labels[cat] || cat
})

// 工具方法
function truncate(str: string, length: number): string {
  if (!str) return ''
  return str.length > length ? str.slice(0, length) + '...' : str
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// 事件处理
function onNodeClick() {
  emit('node-click', props.node.id)
}

function onNodeDblClick() {
  emit('node-dblclick', props.node.id)
}

function onLockClick() {
  emit('lock-toggle', props.node.id)
}

function onDeleteClick() {
  emit('delete', props.node.id)
}

function onGeneratePrompt() {
  emit('node-dblclick', props.node.id)
}

function onCopyPrompt() {
  const content = getNodeData('content')
  if (content) {
    navigator.clipboard.writeText(content)
  }
}
</script>

<style scoped>
.canvas-node {
  position: absolute;
  background: #ffffff;
  border: 2px solid transparent;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: grab;
  transition: box-shadow 0.15s, border-color 0.15s;
  overflow: hidden;
  user-select: none;
}

.canvas-node:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.canvas-node.selected {
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15), 0 4px 16px rgba(0, 0, 0, 0.12);
  cursor: move;
}

.canvas-node.locked {
  cursor: not-allowed;
  opacity: 0.85;
}

.canvas-node.hidden {
  opacity: 0.3;
}

.canvas-node.dragging {
  cursor: grabbing;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.node-header {
  height: 32px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  color: white;
  font-size: 12px;
  font-weight: 500;
  border-radius: 8px 8px 0 0;
  gap: 6px;
}

.node-type-badge {
  display: flex;
  align-items: center;
  justify-content: center;
}

.node-title {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.node-header-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s;
}

.canvas-node:hover .node-header-actions {
  opacity: 1;
}

.lock-btn, .delete-btn {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  cursor: pointer;
  color: white;
}

.lock-btn:hover, .delete-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.node-content {
  flex: 1;
  padding: 8px;
  overflow: hidden;
  min-height: 0;
}

/* 角色节点 */
.character-content {
  display: flex;
  gap: 8px;
  height: 100%;
}

.character-preview {
  width: 60px;
  height: 100%;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.character-preview .preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.character-preview .preview-placeholder {
  color: #94a3b8;
}

.image-count {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
}

.character-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
}

/* 场景节点 */
.scene-content {
  display: flex;
  gap: 8px;
  height: 100%;
}

.scene-preview {
  width: 80px;
  height: 100%;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.scene-preview .preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scene-preview .preview-placeholder {
  color: #94a3b8;
}

.scene-meta {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 9px;
  padding: 2px 4px;
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.scene-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
}

/* 通用信息行 */
.info-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-label {
  font-size: 9px;
  color: #94a3b8;
  text-transform: uppercase;
}

.info-value {
  font-size: 11px;
  color: #334155;
  line-height: 1.4;
  word-break: break-word;
}

.intensity-bar {
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 2px;
}

.intensity-fill {
  height: 100%;
  transition: width 0.2s;
}

/* 文本节点 */
.text-content {
  height: 100%;
  overflow: hidden;
}

.text-body {
  height: 100%;
  overflow-y: auto;
  line-height: 1.5;
}

/* 图片/视频/全景 */
.image-content, .video-content, .panorama-content {
  height: 100%;
}

.image-frame, .video-frame, .panorama-frame {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.frame-img, .frame-video, .panorama-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.frame-placeholder, .panorama-placeholder {
  color: #94a3b8;
}

.frame-video {
  width: 100%;
  height: auto;
}

.ai-badge, .generated-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
}

.duration-badge {
  position: absolute;
  bottom: 6px;
  right: 6px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
}

.panorama-badge {
  position: absolute;
  top: 6px;
  left: 6px;
  background: linear-gradient(135deg, #14b8a6, #06b6d4);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
}

/* 音频节点 */
.audio-content {
  height: 100%;
  display: flex;
  align-items: center;
}

.audio-player {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
}

.audio-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  flex-shrink: 0;
}

.audio-title {
  font-size: 12px;
  color: #334155;
}

.audio-control {
  flex: 1;
  height: 24px;
}

.audio-duration {
  font-size: 10px;
  color: #94a3b8;
  flex-shrink: 0;
}

/* 便签节点 */
.note-content {
  height: 100%;
  border-radius: 8px;
  padding: 12px;
  overflow: hidden;
}

.note-body {
  height: 100%;
  font-size: 13px;
  color: #334155;
  line-height: 1.5;
  word-break: break-word;
}

/* 链接节点 */
.link-content {
  height: 100%;
  display: flex;
  align-items: center;
}

.link-body {
  width: 100%;
  display: flex;
  gap: 8px;
  align-items: center;
}

.link-icon {
  font-size: 20px;
}

.link-info {
  flex: 1;
  min-width: 0;
}

.link-title {
  font-size: 12px;
  font-weight: 500;
  color: #334155;
}

.link-url {
  font-size: 10px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 提示词节点 */
.prompt-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.prompt-category {
  display: flex;
  align-items: center;
}

.category-badge {
  font-size: 10px;
  background: #f1f5f9;
  color: #64748b;
  padding: 2px 8px;
  border-radius: 10px;
}

.prompt-body {
  flex: 1;
  font-size: 12px;
  color: #334155;
  line-height: 1.5;
  overflow-y: auto;
  word-break: break-word;
}

.prompt-actions {
  display: flex;
  gap: 6px;
}

.prompt-btn {
  flex: 1;
  padding: 6px;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
}

.prompt-btn:hover {
  background: #e2e8f0;
  color: #334155;
}

/* 光影控制 */
.lighting-content {
  height: 100%;
  display: flex;
  gap: 10px;
}

.lighting-preview {
  width: 60px;
  height: 100%;
  border-radius: 6px;
  background: #1e293b;
  position: relative;
  flex-shrink: 0;
}

.light-direction {
  position: absolute;
  inset: 0;
}

.light-source {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 220, 100, 0.8), transparent 70%);
}

.light-label {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.7);
  font-size: 9px;
  white-space: nowrap;
}

.lighting-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
}

/* 镜头控制 */
.lens-content {
  height: 100%;
  display: flex;
  gap: 10px;
}

.lens-preview {
  width: 60px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #64748b;
  flex-shrink: 0;
  gap: 4px;
}

.lens-focal {
  font-size: 10px;
  color: #94a3b8;
}

.lens-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
}

/* 道具节点 */
.props-content {
  display: flex;
  gap: 8px;
  height: 100%;
}

.props-preview {
  width: 60px;
  height: 100%;
  border-radius: 6px;
  overflow: hidden;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.props-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.props-placeholder {
  color: #94a3b8;
}

.props-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
}

/* 分镜节点 */
.storyboard-content {
  height: 100%;
  position: relative;
}

.storyboard-preview {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  overflow: hidden;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.storyboard-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.storyboard-placeholder {
  color: #94a3b8;
}

.shot-info {
  position: absolute;
  top: 6px;
  left: 6px;
  display: flex;
  gap: 4px;
}

.shot-info span {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
}

/* 文档节点 */
.document-content {
  height: 100%;
  display: flex;
  align-items: center;
}

.document-body {
  width: 100%;
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.document-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.document-info {
  flex: 1;
  min-width: 0;
}

.document-title {
  font-size: 12px;
  font-weight: 500;
  color: #334155;
  margin-bottom: 4px;
}

.document-preview {
  font-size: 11px;
  color: #64748b;
  line-height: 1.5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* 默认 */
.default-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
}

.default-label {
  font-size: 13px;
}

/* 调整手柄 */
.resize-handles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.resize-handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #6366f1;
  border-radius: 50%;
  pointer-events: all;
  cursor: pointer;
}

.resize-handle.top-left { top: -4px; left: -4px; cursor: nwse-resize; }
.resize-handle.top { top: -4px; left: 50%; transform: translateX(-50%); cursor: ns-resize; }
.resize-handle.top-right { top: -4px; right: -4px; cursor: nesw-resize; }
.resize-handle.right { top: 50%; right: -4px; transform: translateY(-50%); cursor: ew-resize; }
.resize-handle.bottom-right { bottom: -4px; right: -4px; cursor: nwse-resize; }
.resize-handle.bottom { bottom: -4px; left: 50%; transform: translateX(-50%); cursor: ns-resize; }
.resize-handle.bottom-left { bottom: -4px; left: -4px; cursor: nesw-resize; }
.resize-handle.left { top: 50%; left: -4px; transform: translateY(-50%); cursor: ew-resize; }

/* 连接手柄 */
.connection-handles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.connection-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #6366f1;
  border: 2px solid white;
  border-radius: 50%;
  pointer-events: all;
  cursor: crosshair;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.connection-handle.top-handle {
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
}

.connection-handle.bottom-handle {
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
}

/* 选中指示器 */
.selection-indicator {
  position: absolute;
  inset: -1px;
  border: 2px solid #6366f1;
  border-radius: 10px;
  pointer-events: none;
}

/* 滚动条 */
.character-info::-webkit-scrollbar,
.scene-info::-webkit-scrollbar,
.lighting-info::-webkit-scrollbar,
.lens-info::-webkit-scrollbar,
.props-info::-webkit-scrollbar,
.text-body::-webkit-scrollbar,
.prompt-body::-webkit-scrollbar {
  width: 3px;
}

.character-info::-webkit-scrollbar-thumb,
.scene-info::-webkit-scrollbar-thumb,
.lighting-info::-webkit-scrollbar-thumb,
.lens-info::-webkit-scrollbar-thumb,
.props-info::-webkit-scrollbar-thumb,
.text-body::-webkit-scrollbar-thumb,
.prompt-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}
</style>
