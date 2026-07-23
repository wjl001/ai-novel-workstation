<template>
  <div class="free-canvas-container" @contextmenu.prevent="handleContextMenu">
    <!-- 左侧节点面板 -->
    <NodePanel ref="panelRef" @add-node="handleAddNode" />

    <!-- 画布区域 -->
    <div class="canvas-area" ref="canvasAreaRef" @mousedown="onCanvasMouseDown" @wheel="onWheel">
      <!-- 画布视口 -->
      <div class="canvas-viewport" :style="viewportStyle">
        <!-- 网格背景 -->
        <div class="canvas-grid" :style="gridStyle"></div>

        <!-- 连接线层 -->
        <ConnectionLayer
          :connections="canvasStore.connections"
          :nodes="canvasStore.nodes"
          :scale="canvasStore.scale.value"
          :offset="canvasStore.offset"
        />

        <!-- 节点层 -->
        <RoleNode
          v-for="node in canvasStore.getNodesByType('role')"
          :key="node.id"
          :node="node"
          :is-selected="canvasStore.selectedNodeId.value === node.id"
          :is-dragging="draggingNodeId === node.id"
          @select="handleNodeSelect(node.id)"
          @delete="canvasStore.removeNode(node.id)"
          @drag-start="startDrag"
          @open-edit="openNodeDialog(node.id)"
          @open-voice="openNodeDialog(node.id)"
          @add-context="handleAddContext(node.id, $event)"
          @add-generation="handleAddGeneration(node.id, $event)"
        />
        <SceneNode
          v-for="node in canvasStore.getNodesByType('scene')"
          :key="node.id"
          :node="node"
          :is-selected="canvasStore.selectedNodeId.value === node.id"
          :is-dragging="draggingNodeId === node.id"
          @select="handleNodeSelect(node.id)"
          @delete="canvasStore.removeNode(node.id)"
          @drag-start="startDrag"
          @update-label="onNodeLabelUpdate(node.id, $event)"
          @update-desc="onNodeDescUpdate(node.id, $event)"
        />
        <TextNode
          v-for="node in canvasStore.getNodesByType('text')"
          :key="node.id"
          :node="node"
          :is-selected="canvasStore.selectedNodeId.value === node.id"
          :is-dragging="draggingNodeId === node.id"
          @select="handleNodeSelect(node.id)"
          @delete="canvasStore.removeNode(node.id)"
          @drag-start="startDrag"
          @update-content="onNodeContentUpdate(node.id, $event)"
        />
        <ImageNode
          v-for="node in canvasStore.getNodesByType('image')"
          :key="node.id"
          :node="node"
          :is-selected="canvasStore.selectedNodeId.value === node.id"
          :is-dragging="draggingNodeId === node.id"
          @select="handleNodeSelect(node.id)"
          @delete="canvasStore.removeNode(node.id)"
          @drag-start="startDrag"
          @update-name="onNodeNameUpdate(node.id, $event)"
        />
        <VideoNode
          v-for="node in canvasStore.getNodesByType('video')"
          :key="node.id"
          :node="node"
          :is-selected="canvasStore.selectedNodeId.value === node.id"
          :is-dragging="draggingNodeId === node.id"
          @select="handleNodeSelect(node.id)"
          @delete="canvasStore.removeNode(node.id)"
          @drag-start="startDrag"
          @update-name="onNodeNameUpdate(node.id, $event)"
        />
        <AudioNode
          v-for="node in canvasStore.getNodesByType('audio')"
          :key="node.id"
          :node="node"
          :is-selected="canvasStore.selectedNodeId.value === node.id"
          :is-dragging="draggingNodeId === node.id"
          @select="handleNodeSelect(node.id)"
          @delete="canvasStore.removeNode(node.id)"
          @drag-start="startDrag"
        />
      </div>
    </div>

    <!-- 模型选择器弹窗 -->
    <div v-if="showModelPicker" class="picker-overlay" @click="showModelPicker = false">
      <div class="picker-panel" @click.stop>
        <div class="picker-header">
          <span class="picker-title">选择模型</span>
          <button class="picker-close" @click="showModelPicker = false">&times;</button>
        </div>
        <div class="picker-body">
          <div
            v-for="model in currentModels"
            :key="model.value"
            class="picker-item"
            :class="{ active: model.value === currentModel }"
            @click="currentModel = model.value; showModelPicker = false"
          >
            <span class="picker-item-icon">{{ model.icon }}</span>
            <div class="picker-item-info">
              <div class="picker-item-name">{{ model.name }}</div>
              <div class="picker-item-desc">{{ model.desc }}</div>
            </div>
            <svg v-if="model.value === currentModel" class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 比例选择器弹窗 -->
    <div v-if="showRatioPicker" class="picker-overlay" @click="showRatioPicker = false">
      <div class="picker-panel" @click.stop>
        <div class="picker-header">
          <span class="picker-title">画面比例</span>
          <button class="picker-close" @click="showRatioPicker = false">&times;</button>
        </div>
        <div class="picker-body ratio-grid">
          <div
            v-for="ratio in ratioOptions"
            :key="ratio.value"
            class="picker-item ratio-item"
            :class="{ active: ratio.value === selectedRatio }"
            @click="selectedRatio = ratio.value; showRatioPicker = false"
          >
            <div class="ratio-preview" :style="getRatioPreviewStyle(ratio.value)"></div>
            <div class="ratio-label">{{ ratio.label }}</div>
            <div class="ratio-desc">{{ ratio.desc }}</div>
            <svg v-if="ratio.value === selectedRatio" class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 清晰度选择器弹窗 -->
    <div v-if="showQualityPicker" class="picker-overlay" @click="showQualityPicker = false">
      <div class="picker-panel" @click.stop>
        <div class="picker-header">
          <span class="picker-title">清晰度</span>
          <button class="picker-close" @click="showQualityPicker = false">&times;</button>
        </div>
        <div class="picker-body">
          <div
            v-for="quality in qualityOptions"
            :key="quality.value"
            class="picker-item"
            :class="{ active: quality.value === selectedQuality }"
            @click="selectedQuality = quality.value; showQualityPicker = false"
          >
            <span class="picker-item-name quality-name">{{ quality.label }}</span>
            <div class="picker-item-desc">{{ quality.desc }}</div>
            <svg v-if="quality.value === selectedQuality" class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 右键菜单 -->
    <ContextMenu
      v-if="contextMenu.visible"
      :position="contextMenu.position"
      :title="contextMenu.title"
      :items="contextMenu.items"
      @select="handleContextMenuSelect"
      @close="closeContextMenu"
    />

    <!-- 节点对话框 - 通过点击三个点打开 -->
    <NodeDialog
      v-if="showNodeDialog && dialogNode"
      :node="dialogNode"
      :show="showNodeDialog"
      :position="dialogPosition"
      @close="closeNodeDialog"
      @save="handleNodeSave"
      @add-context="handleAddContext(dialogNode.id, $event)"
      @add-generation="handleAddGeneration(dialogNode.id, $event)"
      @remove-context="handleRemoveContext(dialogNode.id, $event)"
      @remove-generation="handleRemoveGeneration(dialogNode.id, $event)"
    />

    <!-- 底部输入栏 - 选中节点时显示 -->
    <div v-if="selectedNode" class="input-bar">
      <div class="input-bar-content">
        <textarea
          class="input-bar-textarea"
          :placeholder="inputPlaceholder"
          v-model="inputContent"
          rows="3"
        />
        <!-- 左侧操作按钮 -->
        <div class="input-bar-left">
          <button class="action-btn" title="添加">+</button>
          <button class="action-btn" title="引用">@</button>
          <select class="style-select" v-model="selectedStyle">
            <option value="">{styleLabel}</option>
            <option v-for="s in styleOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
          <button class="model-select" @click="showModelPicker = true">
            <span class="model-icon">{{ currentModelConfig.icon }}</span>
            <span>{{ currentModelConfig.name }}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <button class="settings-btn" @click="showRatioPicker = true">
            <span>{{ ratioLabel }}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <button class="settings-btn" @click="showQualityPicker = true">
            <span>{{ qualityLabel }}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <button class="upload-btn" @click="handleUpload">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            上传
          </button>
          <button class="polish-btn" @click="handlePolish">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2 5 5 0-4 3 1 5-4-3-4 3 1-5-4-3 5 0z"/></svg>
            润色
          </button>
          <button class="book-btn" title="素材库">📖</button>
        </div>
        <!-- 右侧提交按钮 -->
        <div class="input-bar-right">
          <button class="submit-btn" @click="handleGenerate">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <span>{{ submitLabel }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useCanvasStore } from './composables/useCanvasStore'
import type { NodePosition, ContextType, GenerateType, MenuItem, AddNodeParams, CanvasNode } from './types'
import NodePanel from './components/NodePanel.vue'
import ContextMenu from './components/ContextMenu.vue'
import ConnectionLayer from './components/ConnectionLayer.vue'
import RoleNode from './components/RoleNode.vue'
import SceneNode from './components/SceneNode.vue'
import TextNode from './components/TextNode.vue'
import ImageNode from './components/ImageNode.vue'
import VideoNode from './components/VideoNode.vue'
import AudioNode from './components/AudioNode.vue'
import NodeDialog from './components/NodeDialog.vue'

const canvasStore = useCanvasStore()
const panelRef = ref()
const canvasAreaRef = ref<HTMLElement>()
const draggingNodeId = ref<string | null>(null)
const dragOffset = ref<NodePosition>({ x: 0, y: 0 })

// 对话框状态
const showNodeDialog = ref(false)
const dialogNodeId = ref<string | null>(null)
const dialogPosition = ref<NodePosition>({ x: 0, y: 0 })

// 右键菜单状态
const contextMenu = ref<{
  visible: boolean
  position: { x: number; y: number }
  title: string
  items: MenuItem[]
}>({
  visible: false,
  position: { x: 0, y: 0 },
  title: '',
  items: []
})

// 计算属性
const selectedNode = computed(() => {
  if (!canvasStore.selectedNodeId.value) return null
  return canvasStore.getNode(canvasStore.selectedNodeId.value)
})
const dialogNode = computed(() => {
  if (!dialogNodeId.value) return null
  return canvasStore.getNode(dialogNodeId.value)
})

const inputContent = ref('')
const selectedStyle = ref('')
const showModelPicker = ref(false)
const showRatioPicker = ref(false)
const showQualityPicker = ref(false)

// 节点类型对应的生成模式
const nodeTypeToMode = (type: string | undefined): 'image' | 'video' | 'role' | 'scene' | 'other' => {
  if (!type) return 'other'
  if (type === 'video') return 'video'
  if (type === 'role' || type === 'image' || type === 'scene') return 'image'
  return 'other'
}

// 当前模式
const currentMode = computed(() => nodeTypeToMode(selectedNode.value?.type))

// 模型配置
const modelConfigs: Record<string, Array<{ value: string; name: string; icon: string; desc: string }>> = {
  image: [
    { value: 'anycook', name: '小云雀 AnyCook', icon: '🎨', desc: '图片生成' },
    { value: 'flux', name: 'Flux Dev', icon: '✨', desc: '高精度生图' },
    { value: 'sd3', name: 'Stable Diffusion 3', icon: '🖼️', desc: '通用生图' },
    { value: 'dalle3', name: 'DALL-E 3', icon: '🎭', desc: '创意生图' },
  ],
  video: [
    { value: 'anycook', name: '小云雀 AnyCook', icon: '🎬', desc: '视频生成' },
    { value: 'kling', name: 'Kling 可灵', icon: '🎥', desc: '文生视频' },
    { value: 'runway', name: 'Runway Gen-3', icon: '📽️', desc: '视频生成' },
    { value: 'pika', name: 'Pika 1.5', icon: '🎞️', desc: '视频生成' },
  ],
  role: [
    { value: 'anycook', name: '小云雀 AnyCook', icon: '👤', desc: '角色生成' },
    { value: 'character', name: 'Character Gen', icon: '🎭', desc: '角色设计' },
  ],
}

const currentModels = computed(() => modelConfigs[currentMode.value] || modelConfigs.image)

const currentModel = ref('anycook')
const currentModelConfig = computed(() => {
  const modeModels = modelConfigs[currentMode.value] || modelConfigs.image
  return modeModels.find(m => m.value === currentModel.value) || modeModels[0]
})

const ratioOptions = [
  { value: '16:9', label: '16:9', desc: '横屏宽屏' },
  { value: '9:16', label: '9:16', desc: '竖屏手机' },
  { value: '1:1', label: '1:1', desc: '正方形' },
  { value: '4:3', label: '4:3', desc: '标准比例' },
  { value: '3:4', label: '3:4', desc: '竖版标准' },
]
const selectedRatio = ref('9:16')
const ratioLabel = computed(() => {
  const r = ratioOptions.find(o => o.value === selectedRatio.value)
  return r ? `${r.label} · ${r.desc}` : '9:16 · 竖屏手机'
})

const qualityOptions = [
  { value: '1k', label: '1K', desc: '标清' },
  { value: '2k', label: '2K', desc: '高清' },
  { value: '3k', label: '3K', desc: '超清' },
  { value: '4k', label: '4K', desc: '极清' },
]
const selectedQuality = ref('3k')
const qualityLabel = computed(() => {
  const q = qualityOptions.find(o => o.value === selectedQuality.value)
  return q ? `${q.label}` : '3K'
})

const styleOptions = computed(() => {
  if (currentMode.value === 'video') {
    return [
      { value: 'cinematic', label: '电影风格', desc: '高质感电影画面' },
      { value: 'anime', label: '动漫风格', desc: '日系动漫' },
      { value: 'realistic', label: '写实风格', desc: '真实摄影' },
      { value: 'cartoon', label: '卡通风格', desc: '卡通动画' },
      { value: 'cyberpunk', label: '赛博朋克', desc: '未来科技' },
    ]
  }
  return [
    { value: 'realistic', label: '写实风格', desc: '真实摄影感' },
    { value: 'anime', label: '动漫风格', desc: '日系动漫' },
    { value: 'oil', label: '油画风格', desc: '经典油画' },
    { value: 'watercolor', label: '水彩风格', desc: '清新水彩' },
    { value: 'cyberpunk', label: '赛博朋克', desc: '未来科技' },
    { value: 'fantasy', label: '奇幻风格', desc: '魔幻世界' },
  ]
})

const styleLabel = computed(() => {
  const s = styleOptions.value.find(o => o.value === selectedStyle.value)
  return s ? `${s.label}` : '风格'
})

const submitLabel = computed(() => {
  if (currentMode.value === 'video') return '生成视频'
  if (currentMode.value === 'role') return '生成角色'
  return '生成图片'
})

const inputPlaceholder = computed(() => {
  if (currentMode.value === 'video') return '描述你想要生成的视频内容，@引用素材'
  if (currentMode.value === 'role') return '描述你想要生成的角色形象，@引用素材'
  if (currentMode.value === 'scene') return '描述你想要生成的场景画面，@引用素材'
  return '描述你想要生成的图片内容，@引用素材'
})

// 比例预览样式
const getRatioPreviewStyle = (ratio: string) => {
  const styles: Record<string, string> = {
    '16:9': 'width:40px;height:23px',
    '9:16': 'width:23px;height:40px',
    '1:1': 'width:32px;height:32px',
    '4:3': 'width:36px;height:27px',
    '3:4': 'width:27px;height:36px',
  }
  return styles[ratio] || 'width:32px;height:32px'
}

// 切换模式时重置模型
watch(currentMode, (newMode) => {
  const modeModels = modelConfigs[newMode] || modelConfigs.image
  if (!modeModels.find(m => m.value === currentModel.value)) {
    currentModel.value = modeModels[0].value
  }
})

const viewportStyle = computed(() => ({
  transform: `translate(${canvasStore.offset.x}px, ${canvasStore.offset.y}px) scale(${canvasStore.scale.value})`
}))

const gridStyle = computed(() => ({
  backgroundImage: `radial-gradient(circle, #e2e8f0 1px, transparent 1px)`,
  backgroundSize: `${20 * canvasStore.scale.value}px ${20 * canvasStore.scale.value}px`,
  backgroundPosition: `${canvasStore.offset.x}px ${canvasStore.offset.y}px`
}))

// 节点选择 - 只选中，不打开对话框
const handleNodeSelect = (nodeId: string) => {
  canvasStore.selectNode(nodeId)
}

// 生成/提交
const handleGenerate = () => {
  console.log('生成内容', {
    mode: currentMode.value,
    model: currentModel.value,
    style: selectedStyle.value,
    ratio: selectedRatio.value,
    quality: selectedQuality.value,
    content: inputContent.value,
    node: selectedNode.value
  })
}

// 上传
const handleUpload = () => {
  console.log('上传素材')
}

// 润色
const handlePolish = () => {
  if (!inputContent.value) {
    inputContent.value = '请描述你想要生成的内容...'
  }
}

// 打开对话框
const openNodeDialog = (nodeId: string) => {
  const node = canvasStore.getNode(nodeId)
  if (!node) return
  dialogNodeId.value = nodeId
  showNodeDialog.value = true
  // 对话框跟随节点位置
  updateDialogPosition(node)
}

// 更新对话框位置（转换为屏幕坐标）
const updateDialogPosition = (node: CanvasNode) => {
  if (!canvasAreaRef.value) return
  const canvasRect = canvasAreaRef.value.getBoundingClientRect()
  // 将画布坐标转换为屏幕坐标：(画布坐标 * scale + offset) + canvasArea位置
  const dialogX = (node.position.x + node.size.width + 16) * canvasStore.scale.value + canvasStore.offset.x + canvasRect.left
  const dialogY = (node.position.y + 30) * canvasStore.scale.value + canvasStore.offset.y + canvasRect.top
  dialogPosition.value = { x: dialogX, y: dialogY }
}

// 关闭对话框
const closeNodeDialog = () => {
  showNodeDialog.value = false
  dialogNodeId.value = null
}

// 对话框保存
const handleNodeSave = (data: any) => {
  const node = dialogNode.value
  if (!node) return
  if (node.type === 'role') {
    canvasStore.updateNode({
      id: node.id,
      label: data.roleName,
      data: {
        imageName: data.imageName,
        voiceDescription: data.voiceDescription,
        voiceType: data.voiceType
      }
    })
  } else {
    canvasStore.updateNode({
      id: node.id,
      label: data.name || node.label,
      data: {
        description: data.description
      }
    })
  }
  closeNodeDialog()
}

// 拖拽处理 - 同步更新对话框位置
const startDrag = (event: MouseEvent, nodeId: string) => {
  const node = canvasStore.getNode(nodeId)
  if (!node) return
  draggingNodeId.value = nodeId
  // 屏幕坐标 → 画布局部坐标的偏移
  dragOffset.value = {
    x: event.clientX - (node.position.x * canvasStore.scale.value + canvasStore.offset.x),
    y: event.clientY - (node.position.y * canvasStore.scale.value + canvasStore.offset.y)
  }
  // 如果对话框打开的是当前节点，关闭它避免干扰
  if (dialogNodeId.value === nodeId) {
    closeNodeDialog()
  }
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

const onDrag = (event: MouseEvent) => {
  if (!draggingNodeId.value) return
  // 屏幕坐标 → 画布局部坐标
  canvasStore.updateNodePosition(draggingNodeId.value, {
    x: (event.clientX - dragOffset.value.x - canvasStore.offset.x) / canvasStore.scale.value,
    y: (event.clientY - dragOffset.value.y - canvasStore.offset.y) / canvasStore.scale.value
  })
}

const stopDrag = () => {
  draggingNodeId.value = null
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// 画布操作
const onCanvasMouseDown = (event: MouseEvent) => {
  // 点击空白处取消选择并关闭对话框
  const target = event.target as HTMLElement
  if (!target.closest('[class*="-node"]')) {
    canvasStore.selectNode(null)
    closeNodeDialog()
  }
}

const onWheel = (event: WheelEvent) => {
  event.preventDefault()
  if (event.deltaY > 0) {
    canvasStore.zoomOut()
  } else {
    canvasStore.zoomIn()
  }
}

// 节点操作
const handleAddNode = (type: string) => {
  const params: AddNodeParams = {
    type: type as any,
    label: type === 'role' ? '未命名角色' :
           type === 'scene' ? '新场景' :
           type === 'text' ? '新文本' :
           type === 'image' ? '新图片' :
           type === 'video' ? '新视频' : '新音频'
  }
  canvasStore.addNode(params)
}

const onNodeLabelUpdate = (nodeId: string, label: string) => {
  canvasStore.updateNode({ id: nodeId, label })
}

const onNodeDescUpdate = (nodeId: string, description: string) => {
  canvasStore.updateNode({ id: nodeId, data: { description } })
}

const onNodeContentUpdate = (nodeId: string, content: string) => {
  canvasStore.updateNode({ id: nodeId, data: { textContent: content } })
}

const onNodeNameUpdate = (nodeId: string, name: string) => {
  canvasStore.updateNode({ id: nodeId, data: { name } })
}

// 添加上下文 - 创建新节点并连接
const handleAddContext = (nodeId: string, type: ContextType) => {
  const sourceNode = canvasStore.getNode(nodeId)
  if (!sourceNode) return
  
  // 创建新节点
  const labelMap: Record<string, string> = {
    text: '新文本',
    image: '新图片',
    role: '未命名角色'
  }
  const newNode = canvasStore.addNode({
    type: type as any,
    label: labelMap[type] || '新节点'
  })
  
  // 将新节点放在源节点左侧
  canvasStore.updateNodePosition(newNode.id, {
    x: sourceNode.position.x - newNode.size.width - 40,
    y: sourceNode.position.y + sourceNode.size.height / 2 - newNode.size.height / 2
  })
  
  // 添加连接线（新节点 → 源节点）
  canvasStore.addConnection(newNode.id, sourceNode.id, type)
}

// 添加生成结果 - 创建新节点并连接
const handleAddGeneration = (nodeId: string, type: GenerateType) => {
  const sourceNode = canvasStore.getNode(nodeId)
  if (!sourceNode) return
  
  // 创建新节点
  const labelMap: Record<string, string> = {
    image: '生成图片',
    video: '生成视频',
    audio: '生成音频',
    role: '生成角色'
  }
  const newNode = canvasStore.addNode({
    type: type as any,
    label: labelMap[type] || '生成内容'
  })
  
  // 将新节点放在源节点右侧
  canvasStore.updateNodePosition(newNode.id, {
    x: sourceNode.position.x + sourceNode.size.width + 40,
    y: sourceNode.position.y + sourceNode.size.height / 2 - newNode.size.height / 2
  })
  
  // 添加连接线（源节点 → 新节点）
  canvasStore.addConnection(sourceNode.id, newNode.id, type)
}

// 删除上下文
const handleRemoveContext = (nodeId: string, index: number) => {
  const node = canvasStore.getNode(nodeId)
  if (node && node.contexts && node.contexts[index]) {
    canvasStore.removeContext(nodeId, node.contexts[index].id)
  }
}

// 删除生成结果
const handleRemoveGeneration = (nodeId: string, index: number) => {
  const node = canvasStore.getNode(nodeId)
  if (node && node.generations && node.generations[index]) {
    canvasStore.removeGeneration(nodeId, node.generations[index].id)
  }
}

// 右键菜单
const handleContextMenu = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (target.closest('[class*="-node"]')) return

  contextMenu.value = {
    visible: true,
    position: { x: event.clientX, y: event.clientY },
    title: '添加节点',
    items: [
      { id: 'role', label: '角色', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>', type: 'role' as any, action: 'addContext' },
      { id: 'scene', label: '场景', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>', type: 'scene' as any, action: 'addContext' },
      { id: 'text', label: '文本', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>', type: 'text' as any, action: 'addContext' },
      { id: 'image', label: '图片', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>', type: 'image' as any, action: 'addContext' },
      { id: 'video', label: '视频', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>', type: 'video' as any, action: 'addContext' },
      { id: 'audio', label: '音频', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>', type: 'audio' as any, action: 'addContext' }
    ]
  }
}

const handleContextMenuSelect = (item: MenuItem) => {
  const params: AddNodeParams = {
    type: item.type,
    label: item.label
  }
  canvasStore.addNode(params)
  closeContextMenu()
}

const closeContextMenu = () => {
  contextMenu.value.visible = false
}

// 工具栏操作
const saveCanvas = () => {
  canvasStore.saveToLocalStorage()
}

// 键盘事件
const onKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Delete' && canvasStore.selectedNodeId && !showNodeDialog.value) {
    canvasStore.removeNode(canvasStore.selectedNodeId.value!)
  }
  if (event.key === 'Escape') {
    canvasStore.selectNode(null)
    closeContextMenu()
    closeNodeDialog()
  }
}

onMounted(() => {
  canvasStore.loadFromLocalStorage()
  document.addEventListener('keydown', onKeyDown)
  window.addEventListener('resize', () => {
    canvasStore.updateViewport(window.innerWidth, window.innerHeight)
  })
})

onUnmounted(() => {
  canvasStore.saveToLocalStorage()
  document.removeEventListener('keydown', onKeyDown)
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})
</script>

<style scoped>
.free-canvas-container {
  width: 100%;
  height: 100%;
  background: #f8fafc;
  position: relative;
  overflow: hidden;
}

.canvas-area {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  cursor: default;
}

.canvas-viewport {
  width: 100%;
  height: 100%;
  transform-origin: 0 0;
  position: relative;
}

.canvas-grid {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
}

.input-bar {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: 920px;
  max-width: calc(100% - 48px);
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  padding: 16px 20px;
  z-index: 200;
  border: 1px solid #e2e8f0;
}

.input-bar-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-bar-left {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.input-bar-right {
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
}

.input-bar-textarea {
  width: 100%;
  min-height: 72px;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  color: #1e293b;
  resize: none;
  background: #f8fafc;
  line-height: 1.5;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-bar-textarea:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  background: #ffffff;
}

.input-bar-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #f1f5f9;
  color: #475569;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.style-select {
  height: 32px;
  padding: 0 8px;
  border: none;
  background: #f1f5f9;
  color: #475569;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  outline: none;
}

.model-select {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border: none;
  background: #f1f5f9;
  color: #475569;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.model-select:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.model-icon {
  font-size: 14px;
}

.settings-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border: none;
  background: #f1f5f9;
  color: #475569;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.settings-btn:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border: none;
  background: #f1f5f9;
  color: #475569;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.upload-btn:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.polish-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border: none;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #fff;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
}

.polish-btn:hover {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
}

.book-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #f1f5f9;
  color: #475569;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.book-btn:hover {
  background: #e2e8f0;
}

.divider {
  width: 1px;
  height: 24px;
  background: #e2e8f0;
  margin: 0 4px;
}

.submit-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  height: 36px;
  border: none;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.submit-btn:hover {
  background: linear-gradient(135deg, #4f46e5, #4338ca);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  transform: translateY(-1px);
}

.canvas-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #94a3b8;
  pointer-events: none;
}

.canvas-hint span {
  font-size: 14px;
  font-weight: 600;
}

/* Picker 弹窗通用样式 */
.picker-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.picker-panel {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.15);
  min-width: 320px;
  max-width: 420px;
  overflow: hidden;
  animation: slideUp 0.2s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid #f1f5f9;
}

.picker-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.picker-close {
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
  font-size: 16px;
  transition: all 0.15s;
}

.picker-close:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.picker-body {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.picker-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
}

.picker-item:hover {
  background: #f1f5f9;
}

.picker-item.active {
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
}

.picker-item-icon {
  font-size: 22px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-radius: 8px;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.picker-item-info {
  flex: 1;
  min-width: 0;
}

.picker-item-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.picker-item-desc {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.check-icon {
  color: #6366f1;
  flex-shrink: 0;
}

/* 清晰度选择器 */
.quality-name {
  font-size: 15px;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  padding: 4px 10px;
  border-radius: 6px;
  background-color: #f1f5f9;
  min-width: 48px;
  text-align: center;
}

/* 比例选择器网格 */
.ratio-grid {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 6px;
  padding: 12px;
}

.ratio-item {
  flex: 0 0 calc(20% - 6px);
  min-width: 60px;
  flex-direction: column;
  gap: 6px;
  padding: 12px 8px;
  text-align: center;
}

.ratio-item:hover {
  background: #f1f5f9;
}

.ratio-item.active {
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
}

.ratio-preview {
  border: 2px solid #cbd5e1;
  border-radius: 4px;
  background: #f8fafc;
  transition: all 0.15s;
}

.ratio-item.active .ratio-preview {
  border-color: #6366f1;
  background: linear-gradient(135deg, #c7d2fe, #a5b4fc);
}

.ratio-label {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
}

.ratio-desc {
  font-size: 11px;
  color: #94a3b8;
}
</style>