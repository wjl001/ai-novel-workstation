<template>
  <div class="action-library">
    <div class="lib-header">
      <h3 class="lib-title">动作库</h3>
      <span class="lib-badge">{{ allActions.length }}+</span>
    </div>

    <!-- 搜索 -->
    <div class="search-bar">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="10" r="6"/><line x1="20" y1="20" x2="16" y2="16"/></svg>
      <input v-model="searchQuery" placeholder="搜索动作..." />
    </div>

    <!-- 分类标签 -->
    <div class="category-bar">
      <button
        v-for="cat in categoryList"
        :key="cat.key"
        class="cat-chip"
        :class="{ active: activeCategory === cat.key }"
        @click="toggleCategory(cat.key)"
      >
        <svg v-html="cat.icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="10" height="10"/>
        <span>{{ cat.label }}</span>
      </button>
    </div>

    <!-- 动作列表 -->
    <div class="actions-grid">
      <div
        v-for="action in filteredActions"
        :key="action.id"
        class="action-item"
        :class="{ selected: selectedAction?.id === action.id }"
        @click="selectAction(action)"
      >
        <div class="action-thumb">
          <svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="#6366f1" stroke-width="1.5">
            <circle cx="16" cy="8" r="3"/>
            <line x1="16" y1="11" x2="16" y2="22"/>
            <line x1="16" y1="14" x2="9" y2="19"/>
            <line x1="16" y1="14" x2="23" y2="19"/>
            <line x1="16" y1="22" x2="10" y2="29"/>
            <line x1="16" y1="22" x2="22" y2="29"/>
          </svg>
        </div>
        <div class="action-info">
          <span class="action-name">{{ action.name }}</span>
          <span class="action-meta">{{ formatDuration(action.duration) }} · {{ action.fps }}fps</span>
        </div>
        <button
          v-if="selectedAction?.id === action.id"
          class="action-apply-btn"
          @click.stop="applyAction(action)"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        </button>
      </div>
    </div>

    <!-- 选中动作详情 -->
    <div v-if="selectedAction" class="action-detail">
      <div class="detail-header">
        <span class="detail-name">{{ selectedAction.name }}</span>
        <span class="detail-category">{{ categoryLabels[selectedAction.category] }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">时长</span>
        <span class="detail-value">{{ formatDuration(selectedAction.duration) }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">帧数</span>
        <span class="detail-value">{{ selectedAction.frameCount }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">FPS</span>
        <span class="detail-value">{{ selectedAction.fps }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">循环</span>
        <span class="detail-value">{{ selectedAction.isLoop ? '是' : '否' }}</span>
      </div>
      <div class="detail-desc">{{ selectedAction.description }}</div>
      <button class="apply-detail-btn" @click="applyAction(selectedAction)">
        应用至当前对象
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Scene3DDirectorData, ActionClip } from '../types'
import { useActionLibrary } from '../composables/useActionLibrary'

const props = defineProps<{
  nodeData: Scene3DDirectorData
}>()

const emit = defineEmits<{
  'update:data': [data: Scene3DDirectorData]
  apply: [action: ActionClip]
}>()

const { allActions, categoryList, searchActions, getActionsByCategory } = useActionLibrary()

const searchQuery = ref('')
const activeCategories = ref<string[]>(['all'])
const selectedAction = ref<ActionClip | null>(null)

const categoryLabels: Record<string, string> = {
  walk: '行走', run: '跑步', jump: '跳跃', sit: '坐卧',
  stand: '站立', fight: '战斗', dance: '舞蹈', gesture: '手势',
  emote: '表情', interact: '交互'
}

const activeCategory = computed(() => {
  const cats = activeCategories.value.filter(c => c !== 'all')
  if (cats.length === 0) return 'all'
  return cats[0]
})

const filteredActions = computed(() => {
  if (activeCategory.value === 'all') {
    return searchActions(searchQuery.value)
  }
  return searchActions(searchQuery.value, activeCategory.value as any)
})

function toggleCategory(key: string) {
  const idx = activeCategories.value.indexOf(key)
  if (key === 'all') {
    activeCategories.value = ['all']
  } else if (idx >= 0) {
    activeCategories.value = activeCategories.value.filter(c => c !== key)
    if (activeCategories.value.length === 0) activeCategories.value = ['all']
  } else {
    activeCategories.value = [key]
  }
}

function selectAction(action: ActionClip) {
  selectedAction.value = action
}

function applyAction(action: ActionClip) {
  emit('apply', action)
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.action-library {
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
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.15);
  padding: 2px 8px;
  border-radius: 10px;
  font-family: monospace;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 8px;
  margin: 6px 0;
  color: #64748b;
}

.search-bar input {
  flex: 1;
  background: transparent;
  border: none;
  color: #e2e8f0;
  font-size: 11px;
  outline: none;
}

.category-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  padding: 4px 0;
}

.cat-chip {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 4px 8px;
  border: 1px solid #1e293b;
  background: #0f172a;
  color: #64748b;
  border-radius: 12px;
  cursor: pointer;
  font-size: 10px;
  font-weight: 500;
  transition: all 0.15s;
}

.cat-chip:hover {
  border-color: #475569;
  color: #94a3b8;
}

.cat-chip.active {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.15);
  color: #6366f1;
}

.actions-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
  overflow-y: auto;
  padding: 4px 0;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 8px;
  padding: 6px 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.action-item:hover {
  border-color: #334155;
}

.action-item.selected {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
}

.action-thumb {
  width: 28px;
  height: 28px;
  background: #0a0a0f;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.action-name {
  font-size: 11px;
  color: #e2e8f0;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-meta {
  font-size: 9px;
  color: #64748b;
  font-family: monospace;
}

.action-apply-btn {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  border-radius: 4px;
  cursor: pointer;
  flex-shrink: 0;
}

.action-detail {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05));
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 8px;
  padding: 8px 10px;
  margin-top: 6px;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.detail-name {
  font-size: 12px;
  color: #e2e8f0;
  font-weight: 700;
}

.detail-category {
  font-size: 9px;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.15);
  padding: 2px 6px;
  border-radius: 4px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 2px 0;
  font-size: 10px;
}

.detail-label {
  color: #64748b;
}

.detail-value {
  color: #e2e8f0;
  font-family: monospace;
}

.detail-desc {
  font-size: 10px;
  color: #94a3b8;
  margin-top: 4px;
  line-height: 1.4;
}

.apply-detail-btn {
  width: 100%;
  padding: 6px;
  margin-top: 6px;
  border: none;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
}
</style>
