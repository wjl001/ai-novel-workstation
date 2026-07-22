<template>
  <div class="node-panel-bottom">
    <div class="panel-header">
      <div class="header-left">
        <span class="node-type-badge" :class="selectedNode?.type">{{ nodeTypeLabel }}</span>
        <span class="node-name">{{ selectedNode?.label }}</span>
      </div>
      <div class="header-right">
        <button class="close-btn" @click="$emit('close')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 描述输入区 -->
    <div class="description-section">
      <textarea
        v-model="description"
        class="description-textarea"
        :placeholder="getPlaceholder()"
        rows="2"
      ></textarea>
    </div>

    <!-- 工具栏 -->
    <div class="panel-toolbar">
      <!-- 左侧工具 -->
      <div class="toolbar-left">
        <button class="tool-btn" @click="handleAddAsset" title="添加素材">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
        <button class="tool-btn" @click="handleAddReference" title="添加参考">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>
          </svg>
        </button>
        <button class="tool-btn" @click="handleStyleSelect" title="风格选择">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
          </svg>
          <span>风格</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>

      <!-- 中间配置 -->
      <div class="toolbar-center">
        <button class="config-btn" @click="handleModelSelect" title="模型选择">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
          <span>小云雀 AnyCook</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <button class="config-btn" @click="handleRatioSelect" title="比例选择">
          <span>{{ currentRatio }}</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <button class="config-btn" @click="handleQualitySelect" title="质量选择">
          <span>{{ currentQuality }}</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>

      <!-- 右侧操作 -->
      <div class="toolbar-right">
        <button class="tool-btn" @click="handleDuplicate" title="复制">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
        <button class="tool-btn" @click="handleGenerateCount" title="生成数量">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          <span>+ {{ generateCount }}</span>
        </button>
        <button class="generate-btn" @click="handleGenerate" title="生成">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 素材预览区 -->
    <div v-if="referencedAssets.length > 0" class="assets-section">
      <div class="assets-header">
        <span>引用素材</span>
        <button class="add-asset-btn" @click="handleAddAsset">+</button>
      </div>
      <div class="assets-grid">
        <div 
          v-for="(asset, index) in referencedAssets" 
          :key="index"
          class="asset-item"
          :class="asset.type"
        >
          <img v-if="asset.type === 'image'" :src="asset.url || defaultImage" alt="素材" />
          <div v-else class="asset-placeholder">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
            </svg>
            <span>{{ asset.type }}</span>
          </div>
          <button class="asset-remove" @click="removeAsset(index)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CanvasNode } from '../types'

const props = defineProps<{
  selectedNode: CanvasNode | null
}>()

const emit = defineEmits<{
  close: []
  generate: [prompt: string]
  addAsset: [type: string]
}>()

const description = ref('')
const generateCount = ref(1)
const currentRatio = ref('9:16')
const currentQuality = ref('3K')
const referencedAssets = ref<any[]>([])
const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMTAwIDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iODAiIGZpbGw9IiNlOGViZjEiLz48cGF0aCBkPSJNMjUgNDBbYzAtMy4zIDItNiA0LjUtOGwyLjUgLTJsNC40IDQuNEw1Ny45IDc2aC00LjVsLTEyLjUtMTIuNHYtNC42SDI1em0tMy0zdjM2aDU1di0zM2wtOS05LTkgOS05LTlsLTIgMnoiIGZpbGw9IiNlOGViZjEiLz48L3N2Zz4='

const nodeTypeLabel = computed(() => {
  const labels: Record<string, string> = {
    role: '角色',
    scene: '场景',
    text: '文本',
    image: '图片',
    video: '视频',
    audio: '音频'
  }
  return labels[props.selectedNode?.type || ''] || '节点'
})

const getPlaceholder = () => {
  const placeholders: Record<string, string> = {
    role: '描述你想要生成的角色画面内容，@引用素材',
    scene: '描述你想要生成的场景画面内容，@引用素材',
    image: '描述你想要生成的图片内容，@引用素材',
    video: '描述你想要生成的视频内容，@引用素材',
    audio: '描述音频内容或角色对白...',
    text: '请输入文本内容...'
  }
  return placeholders[props.selectedNode?.type || ''] || '描述内容...'
}

const handleAddAsset = () => {
  emit('addAsset', 'image')
}

const handleAddReference = () => {
  emit('addAsset', 'reference')
}

const handleStyleSelect = () => {
  // TODO: 打开风格选择器
}

const handleModelSelect = () => {
  // TODO: 打开模型选择器
}

const handleRatioSelect = () => {
  // TODO: 切换比例
}

const handleQualitySelect = () => {
  // TODO: 切换质量
}

const handleDuplicate = () => {
  // TODO: 复制节点
}

const handleGenerateCount = () => {
  generateCount.value = generateCount.value >= 4 ? 1 : generateCount.value + 1
}

const handleGenerate = () => {
  if (!description.value.trim()) {
    alert('请先输入描述')
    return
  }
  emit('generate', description.value)
}

const removeAsset = (index: number) => {
  referencedAssets.value.splice(index, 1)
}
</script>

<style scoped>
.node-panel-bottom {
  position: absolute;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%);
  width: 720px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  padding: 16px 20px;
  z-index: 50;
  animation: panelIn 0.2s ease-out;
}

@keyframes panelIn {
  from { opacity: 0; transform: translate(-50%, 20px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.node-type-badge {
  font-size: 11px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 8px;
  text-transform: uppercase;
}

.node-type-badge.role { background: #eef2ff; color: #6366f1; }
.node-type-badge.scene { background: #f0fdf4; color: #0d9488; }
.node-type-badge.text { background: #fdf2f8; color: #d946ef; }
.node-type-badge.image { background: #f0fdf4; color: #16a34a; }
.node-type-badge.video { background: #fefce8; color: #ca8a04; }
.node-type-badge.audio { background: #f5f3ff; color: #8b5cf6; }

.node-name {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.close-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #475569;
}

.description-section {
  margin-bottom: 12px;
}

.description-textarea {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 14px;
  color: #1e293b;
  outline: none;
  resize: none;
  transition: all 0.2s;
  box-sizing: border-box;
}

.description-textarea:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.description-textarea::placeholder {
  color: #94a3b8;
}

.panel-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.toolbar-left, .toolbar-center, .toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border: none;
  background: #f8fafc;
  color: #64748b;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  font-weight: 600;
}

.tool-btn:hover {
  background: #eef2ff;
  color: #6366f1;
}

.config-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  font-weight: 600;
}

.config-btn:hover {
  border-color: #6366f1;
  color: #6366f1;
}

.generate-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #1e293b;
  color: white;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.generate-btn:hover {
  background: #0f172a;
  transform: translateY(-1px);
}

.assets-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.assets-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.assets-header span {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
}

.add-asset-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.add-asset-btn:hover {
  border-color: #6366f1;
  color: #6366f1;
}

.assets-grid {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.asset-item {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 10px;
  overflow: hidden;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.asset-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.asset-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: #94a3b8;
}

.asset-placeholder span {
  font-size: 10px;
  font-weight: 600;
}

.asset-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.asset-item:hover .asset-remove {
  opacity: 1;
}
</style>