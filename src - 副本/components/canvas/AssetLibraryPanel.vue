<template>
  <div class="canvas-sidebar">
    <!-- 顶部工具栏 -->
    <div class="sidebar-header">
      <div class="header-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
        <span>资产创作画布</span>
      </div>
      <div class="header-actions">
        <button @click="onCollapse" class="collapse-btn" title="折叠侧边栏">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 搜索框 -->
    <div class="sidebar-search">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        v-model="searchKeyword"
        type="text"
        placeholder="搜索资产..."
        class="search-input"
      />
    </div>

    <!-- 资产类型标签 -->
    <div class="asset-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-btn', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        <component :is="tab.icon" class="tab-icon" />
        <span>{{ tab.label }}</span>
        <span v-if="toValue(tab.count) > 0" class="tab-count">{{ toValue(tab.count) }}</span>
      </button>
    </div>

    <!-- 节点创建区域 -->
    <div v-show="activeTab === 'all' || activeTab === 'create'" class="create-section">
      <div class="section-title">快速添加</div>
      <div class="create-grid">
        <div
          v-for="config in creatableConfigs"
          :key="config.type"
          class="create-card"
          :style="{ borderColor: config.color }"
          @click="onCreateNode(config.type)"
          @dragstart="onDragStart({ type: config.type })"
          draggable="true"
        >
          <div class="card-icon" :style="{ backgroundColor: config.color + '20', color: config.color }">
            <component :is="config.icon" :width="20" :height="20" />
          </div>
          <div class="card-label">{{ config.label }}</div>
        </div>
      </div>
    </div>

    <!-- 资产库区域 -->
    <div v-if="activeTab !== 'all' && activeTab !== 'create'" class="asset-list">
      <div v-if="filteredAssets.length === 0" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <p>暂无{{ getTabLabel(activeTab) }}</p>
        <button v-if="getNodeType(activeTab)" @click="onCreateNode(getNodeType(activeTab)!)" class="add-btn">
          + 添加
        </button>
      </div>
      <div v-else class="asset-items">
        <div
          v-for="asset in filteredAssets"
          :key="asset.id"
          class="asset-card"
          @click="onAssetClick(asset)"
          @dragstart="onDragStart({ assetId: asset.id, type: asset.type })"
          @dblclick="onAssetDblClick(asset)"
          draggable="true"
        >
          <div class="asset-thumb" :style="{ backgroundColor: asset.thumbnail ? 'transparent' : '#f1f5f9' }">
            <img v-if="asset.thumbnail" :src="asset.thumbnail" :alt="asset.name" class="thumb-img" />
            <div v-else class="thumb-placeholder">
              <component :is="getNodeIcon(asset.type)" :width="24" :height="24" />
            </div>
          </div>
          <div class="asset-info">
            <div class="asset-name">{{ asset.name }}</div>
            <div class="asset-meta">
              {{ formatDate(asset.updated) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 画布节点预览 -->
    <div v-show="activeTab === 'nodes'" class="node-preview">
      <div class="section-title">画布中的节点</div>
      <div v-if="canvasNodes.length === 0" class="empty-state">
        <p>画布上还没有节点</p>
      </div>
      <div v-else class="node-items">
        <div
          v-for="node in canvasNodes"
          :key="node.id"
          class="node-item"
          :class="{ selected: isSelected(node.id) }"
          @click="onSelectNode(node.id)"
        >
          <div class="node-icon" :style="{ backgroundColor: getNodeColor(node.type) + '20', color: getNodeColor(node.type) }">
            <component :is="getNodeIcon(node.type)" :width="16" :height="16" />
          </div>
          <div class="node-content">
            <div class="node-label">{{ getNodeLabel(node) }}</div>
            <div class="node-type">{{ getNodeTypeName(node.type) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="sidebar-footer">
      <div class="stats">
        <span>节点: {{ totalNodes }}</span>
        <span>连接: {{ totalEdges }}</span>
        <span>分组: {{ totalGroups }}</span>
      </div>
      <button @click="onClearCanvas" class="clear-btn" title="清空画布">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { toValue } from 'vue'
import { useCanvasStore } from '../../store/canvas'
import {
  User, Palette, FileText, Image, Video, Volume2, StickyNote,
  Link, Sparkles, Sun, Camera, Globe, Package, Film, File,
  Layers, Hexagon, Search, Plus, Trash2
} from 'lucide-vue-next'
import { NodeType } from '../../types/canvas'

interface Props {
  collapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
})

const emit = defineEmits<{
  'create-node': [type: NodeType]
  'select-node': [id: string]
  'asset-click': [id: string]
  'asset-dblclick': [id: string]
  'clear-canvas': []
  'drag-start': [data: any]
  'collapse': []
}>()

const canvasStore = useCanvasStore()
const searchKeyword = ref('')
const activeTab = ref('all')

// 侧边栏标签配置
const tabs = [
  { key: 'all', label: '全部', icon: Layers, count: computed(() => canvasStore.totalNodes) },
  { key: 'create', label: '添加', icon: Plus, count: 0 },
  { key: 'characters', label: '角色', icon: User, count: computed(() => canvasStore.nodeCountByType[NodeType.CHARACTER]) },
  { key: 'scenes', label: '场景', icon: Palette, count: computed(() => canvasStore.nodeCountByType[NodeType.SCENE]) },
  { key: 'assets', label: '素材', icon: Image, count: computed(() => canvasStore.nodeCountByType[NodeType.IMAGE] + canvasStore.nodeCountByType[NodeType.VIDEO] + canvasStore.nodeCountByType[NodeType.AUDIO]) },
  { key: 'tools', label: '工具', icon: Sparkles, count: computed(() => canvasStore.nodeCountByType[NodeType.LIGHTING] + canvasStore.nodeCountByType[NodeType.LENS] + canvasStore.nodeCountByType[NodeType.PROMPT]) },
  { key: 'nodes', label: '画布', icon: Layers, count: computed(() => canvasStore.totalNodes) },
]

// 可创建的节点类型
const creatableConfigs = computed(() => [
  { type: NodeType.CHARACTER, label: '角色', icon: User, color: '#6366f1' },
  { type: NodeType.SCENE, label: '场景', icon: Palette, color: '#22c55e' },
  { type: NodeType.TEXT, label: '文本', icon: FileText, color: '#3b82f6' },
  { type: NodeType.IMAGE, label: '图片', icon: Image, color: '#f97316' },
  { type: NodeType.VIDEO, label: '视频', icon: Video, color: '#ef4444' },
  { type: NodeType.AUDIO, label: '音频', icon: Volume2, color: '#a855f7' },
  { type: NodeType.NOTE, label: '便签', icon: StickyNote, color: '#eab308' },
  { type: NodeType.LINK, label: '链接', icon: Link, color: '#06b6d4' },
  { type: NodeType.PROMPT, label: '提示词', icon: Sparkles, color: '#8b5cf6' },
  { type: NodeType.LIGHTING, label: '光影', icon: Sun, color: '#f59e0b' },
  { type: NodeType.LENS, label: '镜头', icon: Camera, color: '#10b981' },
  { type: NodeType.PANORAMA, label: '全景', icon: Globe, color: '#14b8a6' },
  { type: NodeType.PROPS, label: '道具', icon: Package, color: '#fb923c' },
  { type: NodeType.STORYBOARD, label: '分镜', icon: Film, color: '#ec4899' },
  { type: NodeType.DOCUMENT, label: '文档', icon: File, color: '#64748b' },
])

// 画布中的节点
const canvasNodes = computed(() => canvasStore.nodes)

// 筛选后的资产
const filteredAssets = computed(() => {
  if (activeTab.value === 'characters') {
    return canvasNodes.value.filter(n => n.type === NodeType.CHARACTER) as any[]
  } else if (activeTab.value === 'scenes') {
    return canvasNodes.value.filter(n => n.type === NodeType.SCENE) as any[]
  } else if (activeTab.value === 'assets') {
    return canvasNodes.value.filter(n =>
      n.type === NodeType.IMAGE || n.type === NodeType.VIDEO || n.type === NodeType.AUDIO
    ) as any[]
  } else if (activeTab.value === 'tools') {
    return canvasNodes.value.filter(n =>
      n.type === NodeType.LIGHTING || n.type === NodeType.LENS || n.type === NodeType.PROMPT
    ) as any[]
  }
  return canvasNodes.value as any[]
})

const totalNodes = computed(() => canvasStore.totalNodes)
const totalEdges = computed(() => canvasStore.edges.length)
const totalGroups = computed(() => canvasStore.groups.length)

function isSelected(nodeId: string): boolean {
  return canvasStore.selectedNodes.includes(nodeId)
}

function onCreateNode(type: NodeType) {
  emit('create-node', type)
}

function onSelectNode(id: string) {
  emit('select-node', id)
}

function onAssetClick(asset: any) {
  emit('asset-click', asset.id)
}

function onAssetDblClick(asset: any) {
  emit('asset-dblclick', asset.id)
}

function onClearCanvas() {
  emit('clear-canvas')
}

function onDragStart(data: any) {
  emit('drag-start', data)
}

function onCollapse() {
  emit('collapse')
}

function getTabLabel(tab: string): string {
  const map: Record<string, string> = {
    characters: '角色',
    scenes: '场景',
    assets: '素材',
    tools: '工具',
  }
  return map[tab] || tab
}

function getNodeType(tab: string): NodeType | null {
  const map: Record<string, NodeType> = {
    characters: NodeType.CHARACTER,
    scenes: NodeType.SCENE,
  }
  return map[tab] || null
}

function getNodeColor(type: NodeType): string {
  const colors: Record<NodeType, string> = {
    [NodeType.CHARACTER]: '#6366f1',
    [NodeType.SCENE]: '#22c55e',
    [NodeType.TEXT]: '#3b82f6',
    [NodeType.IMAGE]: '#f97316',
    [NodeType.VIDEO]: '#ef4444',
    [NodeType.AUDIO]: '#a855f7',
    [NodeType.NOTE]: '#eab308',
    [NodeType.LINK]: '#06b6d4',
    [NodeType.PROMPT]: '#8b5cf6',
    [NodeType.LIGHTING]: '#f59e0b',
    [NodeType.LENS]: '#10b981',
    [NodeType.PANORAMA]: '#14b8a6',
    [NodeType.PROPS]: '#fb923c',
    [NodeType.STORYBOARD]: '#ec4899',
    [NodeType.DOCUMENT]: '#64748b',
    [NodeType.GROUP]: '#94a3b8',
    [NodeType.STICKY]: '#f472b6',
    [NodeType.THUMBNAIL]: '#fb923c',
  }
  return colors[type] || '#94a3b8'
}

function getNodeIcon(type: NodeType) {
  const icons: Record<NodeType, any> = {
    [NodeType.CHARACTER]: User,
    [NodeType.SCENE]: Palette,
    [NodeType.TEXT]: FileText,
    [NodeType.IMAGE]: Image,
    [NodeType.VIDEO]: Video,
    [NodeType.AUDIO]: Volume2,
    [NodeType.NOTE]: StickyNote,
    [NodeType.LINK]: Link,
    [NodeType.PROMPT]: Sparkles,
    [NodeType.LIGHTING]: Sun,
    [NodeType.LENS]: Camera,
    [NodeType.PANORAMA]: Globe,
    [NodeType.PROPS]: Package,
    [NodeType.STORYBOARD]: Film,
    [NodeType.DOCUMENT]: File,
    [NodeType.GROUP]: Layers,
    [NodeType.STICKY]: Hexagon,
    [NodeType.THUMBNAIL]: Image,
  }
  return icons[type] || File
}

function getNodeLabel(node: any): string {
  if (node.type === NodeType.CHARACTER) return node.data?.name || '新角色'
  if (node.type === NodeType.SCENE) return node.data?.name || '新场景'
  if (node.type === NodeType.TEXT) return node.data?.title || '文本'
  if (node.type === NodeType.IMAGE) return node.data?.alt || '图片'
  if (node.type === NodeType.VIDEO) return node.data?.title || '视频'
  if (node.type === NodeType.AUDIO) return node.data?.title || '音频'
  if (node.type === NodeType.NOTE) return '便签'
  if (node.type === NodeType.LINK) return node.data?.title || '链接'
  if (node.type === NodeType.PROMPT) return '提示词'
  if (node.type === NodeType.LIGHTING) return '光影控制'
  if (node.type === NodeType.LENS) return '镜头控制'
  if (node.type === NodeType.PANORAMA) return '全景图'
  if (node.type === NodeType.PROPS) return node.data?.name || '道具'
  if (node.type === NodeType.STORYBOARD) return node.data?.title || '分镜'
  if (node.type === NodeType.DOCUMENT) return node.data?.title || '文档'
  return '节点'
}

function getNodeTypeName(type: NodeType): string {
  const names: Record<NodeType, string> = {
    [NodeType.CHARACTER]: '角色',
    [NodeType.SCENE]: '场景',
    [NodeType.TEXT]: '文本',
    [NodeType.IMAGE]: '图片',
    [NodeType.VIDEO]: '视频',
    [NodeType.AUDIO]: '音频',
    [NodeType.NOTE]: '便签',
    [NodeType.LINK]: '链接',
    [NodeType.PROMPT]: '提示词',
    [NodeType.LIGHTING]: '光影',
    [NodeType.LENS]: '镜头',
    [NodeType.PANORAMA]: '全景',
    [NodeType.PROPS]: '道具',
    [NodeType.STORYBOARD]: '分镜',
    [NodeType.DOCUMENT]: '文档',
    [NodeType.GROUP]: '分组',
    [NodeType.STICKY]: '贴纸',
    [NodeType.THUMBNAIL]: '缩略图',
  }
  return names[type] || '节点'
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${date.getMonth() + 1}月${date.getDate()}日`
}
</script>

<style scoped>
.canvas-sidebar {
  width: 260px;
  height: 100%;
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 0.2s ease, opacity 0.2s ease;
}

.canvas-sidebar.collapsed {
  width: 52px;
}

.canvas-sidebar.collapsed .sidebar-header .header-title span,
.canvas-sidebar.collapsed .sidebar-search,
.canvas-sidebar.collapsed .asset-tabs,
.canvas-sidebar.collapsed .create-section,
.canvas-sidebar.collapsed .asset-list,
.canvas-sidebar.collapsed .node-preview,
.canvas-sidebar.collapsed .sidebar-footer .stats {
  display: none;
}

.sidebar-header {
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border-bottom: 1px solid #e2e8f0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1e293b;
  font-weight: 600;
  font-size: 14px;
}

.collapse-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: #64748b;
}

.collapse-btn:hover {
  background: #f1f5f9;
}

.sidebar-search {
  height: 40px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  border-bottom: 1px solid #e2e8f0;
}

.search-icon {
  color: #94a3b8;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 13px;
  color: #334155;
  background: transparent;
}

.search-input::placeholder {
  color: #94a3b8;
}

.asset-tabs {
  display: flex;
  gap: 4px;
  padding: 8px;
  border-bottom: 1px solid #e2e8f0;
  flex-wrap: wrap;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: #64748b;
  font-size: 12px;
  transition: all 0.15s;
}

.tab-btn:hover {
  background: #f1f5f9;
  color: #334155;
}

.tab-btn.active {
  background: #eef2ff;
  color: #6366f1;
}

.tab-icon {
  width: 14px;
  height: 14px;
}

.tab-count {
  font-size: 10px;
  background: #e2e8f0;
  color: #64748b;
  padding: 1px 4px;
  border-radius: 8px;
  margin-left: 2px;
}

.create-section {
  padding: 12px;
  flex: 1;
  overflow-y: auto;
}

.section-title {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.create-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.create-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 4px;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  background: #f8fafc;
}

.create-card:hover {
  background: #f1f5f9;
  border-color: currentColor;
}

.card-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.card-label {
  font-size: 10px;
  color: #64748b;
  text-align: center;
}

.asset-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #94a3b8;
}

.empty-state p {
  margin: 8px 0 16px;
  font-size: 13px;
}

.add-btn {
  padding: 6px 16px;
  border: none;
  background: #6366f1;
  color: white;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.15s;
}

.add-btn:hover {
  background: #4f46e5;
}

.asset-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.asset-card {
  display: flex;
  gap: 10px;
  padding: 8px;
  background: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.asset-card:hover {
  background: #f1f5f9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.asset-thumb {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-placeholder {
  color: #94a3b8;
}

.asset-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.asset-name {
  font-size: 13px;
  color: #1e293b;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.asset-meta {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

.node-preview {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.node-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.node-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}

.node-item:hover {
  background: #f1f5f9;
}

.node-item.selected {
  background: #eef2ff;
}

.node-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  flex-shrink: 0;
}

.node-content {
  flex: 1;
  min-width: 0;
}

.node-label {
  font-size: 13px;
  color: #1e293b;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-type {
  font-size: 11px;
  color: #94a3b8;
}

.sidebar-footer {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.stats {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: #64748b;
}

.clear-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: #94a3b8;
}

.clear-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}

/* 滚动条样式 */
.create-section::-webkit-scrollbar,
.asset-list::-webkit-scrollbar,
.node-preview::-webkit-scrollbar {
  width: 4px;
}

.create-section::-webkit-scrollbar-thumb,
.asset-list::-webkit-scrollbar-thumb,
.node-preview::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.create-section::-webkit-scrollbar-thumb:hover,
.asset-list::-webkit-scrollbar-thumb:hover,
.node-preview::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
