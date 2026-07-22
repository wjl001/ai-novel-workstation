<template>
  <div class="node-editor-panel" :class="{ collapsed: isCollapsed }">
    <!-- 面板头部 -->
    <div class="panel-header">
      <span class="panel-title">{{ panelTitle }}</span>
      <div class="header-actions">
        <button @click="onToggleCollapse" class="collapse-btn" title="折叠/展开">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6" v-if="!isCollapsed" />
            <polyline points="15 18 9 12 15 6" v-else />
          </svg>
        </button>
      </div>
    </div>

    <!-- 面板内容 -->
    <div v-if="!isCollapsed" class="panel-content">
      <!-- 无选中节点 -->
      <div v-if="!selectedNode" class="empty-panel">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
        <p>选择画布上的节点以编辑属性</p>
        <div class="quick-actions">
          <button @click="onAddNode('character' as any)" class="quick-btn">+ 添加角色</button>
          <button @click="onAddNode('scene' as any)" class="quick-btn">+ 添加场景</button>
          <button @click="onAddNode('text' as any)" class="quick-btn">+ 添加文本</button>
        </div>
      </div>

      <!-- 表单区域 (简化版) -->
      <div v-else class="editor-form">
        <!-- 基本信息 -->
        <div class="form-section">
          <div class="section-title">基本信息</div>
          <div class="form-group">
            <label>名称</label>
            <input v-model="editForm.name" @input="updateField('name')" type="text" class="form-input" placeholder="节点名称" />
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="editForm.description" @input="updateField('description')" class="form-textarea" rows="3" placeholder="描述..."></textarea>
          </div>
        </div>

        <!-- 提示词 -->
        <div class="form-section" v-if="editForm.prompt !== undefined">
          <div class="section-title">AI 提示词</div>
          <div class="form-group">
            <textarea v-model="editForm.prompt" @input="updateField('prompt')" class="form-textarea" rows="4" placeholder="输入提示词..."></textarea>
            <button @click="onGenerate" class="form-btn">
              ✨ AI 生成
            </button>
          </div>
        </div>

        <!-- 图片列表 -->
        <div class="form-section" v-if="editForm.images && editForm.images.length > 0">
          <div class="section-title">图片</div>
          <div class="image-grid">
            <div v-for="(img, i) in editForm.images" :key="i" class="image-item">
              <img :src="img.url" :alt="img.angle" class="image-thumb" />
              <div class="image-overlay">
                <button @click="onDeleteImage(Number(i))" class="delete-img-btn">×</button>
              </div>
              <div class="image-label">{{ img.angle }}</div>
            </div>
            <div @click="onGenerateImage" class="image-add">
              <span>+</span>
            </div>
          </div>
        </div>

        <!-- 位置与透明度 -->
        <div class="form-section">
          <div class="section-title">位置与样式</div>
          <div class="form-group row">
            <div class="col">
              <label>X: {{ editForm.positionX }}</label>
              <input v-model="editForm.positionX" @input="updatePosition('x')" type="number" class="form-input" />
            </div>
            <div class="col">
              <label>Y: {{ editForm.positionY }}</label>
              <input v-model="editForm.positionY" @input="updatePosition('y')" type="number" class="form-input" />
            </div>
          </div>
          <div class="form-group">
            <label>透明度: {{ editForm.opacity }}%</label>
            <input v-model="editForm.opacity" @input="updateOpacity" type="range" min="0" max="100" class="form-range" />
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="form-footer">
          <button @click="onDuplicate" class="form-btn secondary">📋 复制</button>
          <button @click="onDelete" class="form-btn danger">🗑 删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCanvasStore } from '../../store/canvas'
import { NodeType } from '../../types/canvas'

const props = defineProps<{ collapsed?: boolean }>()
const emit = defineEmits<{
  'add-node': [type: NodeType]
  'update-field': [nodeId: string, data: Record<string, any>]
  'update-position': [nodeId: string, key: 'x' | 'y', value: number]
  'update-opacity': [nodeId: string, value: number]
  'duplicate': [nodeId: string]
  'delete': [nodeId: string]
  'generate': [nodeId: string]
  'generate-image': [nodeId: string]
}>()

const canvasStore = useCanvasStore()
const isCollapsed = ref(props.collapsed || false)

const selectedNode = computed(() => {
  if (canvasStore.selectedNodes.length === 0) return null
  return canvasStore.findNode(canvasStore.selectedNodes[0])
})

const panelTitle = computed(() => {
  if (!selectedNode.value) return '属性面板'
  const names: Record<NodeType, string> = {
    [NodeType.CHARACTER]: '角色编辑',
    [NodeType.SCENE]: '场景编辑',
    [NodeType.TEXT]: '文本编辑',
    [NodeType.IMAGE]: '图片编辑',
    [NodeType.VIDEO]: '视频编辑',
    [NodeType.AUDIO]: '音频编辑',
    [NodeType.NOTE]: '便签编辑',
    [NodeType.LINK]: '链接编辑',
    [NodeType.PROMPT]: '提示词编辑',
    [NodeType.LIGHTING]: '光影控制',
    [NodeType.LENS]: '镜头控制',
    [NodeType.PANORAMA]: '全景编辑',
    [NodeType.PROPS]: '道具编辑',
    [NodeType.STORYBOARD]: '分镜编辑',
    [NodeType.DOCUMENT]: '文档编辑',
    [NodeType.GROUP]: '分组编辑',
    [NodeType.STICKY]: '贴纸编辑',
    [NodeType.THUMBNAIL]: '缩略图编辑',
  }
  return names[selectedNode.value.type] || '节点编辑'
})

const editForm = ref<any>({
  name: '', description: '', prompt: '', images: [],
  opacity: 100, positionX: 0, positionY: 0,
})

watch(selectedNode, (node) => {
  if (!node) return
  const data = (node.data as any) || {}
  editForm.value = {
    name: data.name || '',
    description: data.description || '',
    prompt: data.prompt || '',
    images: data.images || [],
    opacity: node.opacity || 100,
    positionX: node.position?.x || 0,
    positionY: node.position?.y || 0,
  }
})

function updateField(key: string) {
  if (!selectedNode.value) return
  emit('update-field', selectedNode.value.id, { [key]: editForm.value[key] })
}

function updatePosition(key: 'x' | 'y') {
  if (!selectedNode.value) return
  const value = parseInt(String(editForm.value[`position${key.toUpperCase()}`])) || 0
  emit('update-position', selectedNode.value.id, key, value)
}

function updateOpacity() {
  if (!selectedNode.value) return
  const value = parseInt(editForm.value.opacity) || 100
  emit('update-opacity', selectedNode.value.id, value)
}

function onDeleteImage(index: number) {
  const images = [...editForm.value.images]
  images.splice(index, 1)
  editForm.value.images = images
  if (selectedNode.value) {
    emit('update-field', selectedNode.value.id, { images })
  }
}

function onAddNode(type: NodeType) {
  emit('add-node', type)
}

function onGenerate() {
  if (!selectedNode.value) return
  emit('generate', selectedNode.value.id)
}

function onGenerateImage() {
  if (!selectedNode.value) return
  emit('generate-image', selectedNode.value.id)
}

function onDuplicate() {
  if (!selectedNode.value) return
  emit('duplicate', selectedNode.value.id)
}

function onDelete() {
  if (!selectedNode.value) return
  emit('delete', selectedNode.value.id)
}

function onToggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
.node-editor-panel {
  width: 320px;
  height: 100%;
  background: #ffffff;
  border-left: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 0.2s ease;
}
.node-editor-panel.collapsed { width: 48px; }
.node-editor-panel.collapsed .panel-content { display: none; }

.panel-header {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}
.panel-title { font-size: 14px; font-weight: 600; color: #1e293b; }
.collapse-btn {
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
  border: none; background: transparent; border-radius: 4px;
  cursor: pointer; color: #64748b;
}
.collapse-btn:hover { background: #f1f5f9; }

.panel-content { flex: 1; overflow-y: auto; padding: 16px; }

.empty-panel {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 40px 20px; color: #94a3b8;
}
.empty-panel p { margin: 8px 0 20px; font-size: 13px; }
.quick-actions { display: flex; flex-direction: column; gap: 6px; width: 100%; }
.quick-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 12px; border: 1px solid #e2e8f0; background: #f8fafc;
  border-radius: 6px; cursor: pointer; color: #64748b; font-size: 12px;
  transition: all 0.15s; width: 100%;
}
.quick-btn:hover { background: #f1f5f9; border-color: #cbd5e1; color: #334155; }

.editor-form { display: flex; flex-direction: column; gap: 16px; }
.form-section { display: flex; flex-direction: column; gap: 12px; }
.section-title {
  font-size: 11px; font-weight: 600; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;
}
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-group.row { flex-direction: row; gap: 8px; }
.form-group.row .col { flex: 1; }
.form-group label { font-size: 12px; font-weight: 500; color: #475569; }

.form-input {
  padding: 8px 10px; border: 1px solid #e2e8f0; border-radius: 6px;
  font-size: 13px; color: #334155; outline: none; transition: border-color 0.15s;
}
.form-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
.form-textarea {
  padding: 8px 10px; border: 1px solid #e2e8f0; border-radius: 6px;
  font-size: 13px; color: #334155; outline: none; resize: vertical;
  font-family: inherit; transition: border-color 0.15s;
}
.form-textarea:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }

.form-range {
  width: 100%; height: 4px; background: #e2e8f0; border-radius: 2px;
  outline: none; -webkit-appearance: none;
}
.form-range::-webkit-slider-thumb {
  -webkit-appearance: none; width: 14px; height: 14px;
  background: #6366f1; border-radius: 50%; cursor: pointer;
}

.form-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 10px 14px; border: none; background: #6366f1; color: white;
  border-radius: 8px; font-size: 13px; font-weight: 500;
  cursor: pointer; transition: all 0.15s;
}
.form-btn:hover { background: #4f46e5; }
.form-btn.secondary { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
.form-btn.secondary:hover { background: #e2e8f0; }
.form-btn.danger { background: #fee2e2; color: #ef4444; }
.form-btn.danger:hover { background: #fecaca; }

.form-footer { display: flex; gap: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0; }

.image-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.image-item { aspect-ratio: 1; border-radius: 8px; overflow: hidden; position: relative; background: #f1f5f9; }
.image-thumb { width: 100%; height: 100%; object-fit: cover; }
.image-overlay {
  position: absolute; inset: 0; background: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.15s;
}
.image-item:hover .image-overlay { opacity: 1; }
.delete-img-btn {
  width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
  border: none; background: #ef4444; color: white; border-radius: 50%;
  cursor: pointer; font-size: 14px;
}
.image-label {
  position: absolute; bottom: 4px; left: 4px;
  font-size: 10px; color: white; background: rgba(0, 0, 0, 0.5);
  padding: 1px 6px; border-radius: 10px;
}
.image-add {
  aspect-ratio: 1; border-radius: 8px; border: 2px dashed #cbd5e1;
  display: flex; align-items: center; justify-content: center;
  color: #94a3b8; cursor: pointer; transition: all 0.15s; font-size: 24px;
}
.image-add:hover { border-color: #6366f1; color: #6366f1; background: #f8fafc; }
</style>
