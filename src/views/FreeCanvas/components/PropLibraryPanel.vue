<template>
  <div class="prop-library">
    <div class="lib-header">
      <h3 class="lib-title">道具库</h3>
      <span class="lib-badge">{{ allProps.length }}+</span>
    </div>

    <!-- 搜索 -->
    <div class="search-bar">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="10" r="6"/><line x1="20" y1="20" x2="16" y2="16"/></svg>
      <input v-model="searchQuery" placeholder="搜索道具 (150+ 模型)..." />
    </div>

    <!-- 分类侧栏 -->
    <div class="prop-body">
      <div class="category-sidebar">
        <button
          v-for="cat in categoriesList"
          :key="cat.key"
          class="cat-item"
          :class="{ active: activeCategory === cat.key }"
          @click="activeCategory = cat.key"
        >
          <svg v-html="cat.icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"/>
          <span class="cat-label">{{ cat.label }}</span>
          <span class="cat-count">{{ cat.count }}</span>
        </button>
      </div>

      <!-- 道具网格 -->
      <div class="prop-grid-area">
        <div class="prop-grid">
          <div
            v-for="prop in filteredProps"
            :key="prop.id"
            class="prop-card"
            :class="{ selected: selectedProp?.id === prop.id }"
            @click="selectProp(prop)"
          >
            <div class="prop-thumb" :style="getThumbColor(prop.id)">
              <svg v-html="getThumbIcon(prop.category)" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.2" width="28" height="28"/>
            </div>
            <span class="prop-name">{{ prop.name }}</span>
          </div>
        </div>

        <!-- 选中道具详情 -->
        <div v-if="selectedProp" class="prop-detail">
          <div class="detail-row">
            <span class="detail-label">尺寸</span>
            <span class="detail-value">{{ selectedProp.boundingBox.width.toFixed(1) }}×{{ selectedProp.boundingBox.height.toFixed(1) }}×{{ selectedProp.boundingBox.depth.toFixed(1) }} m</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">标签</span>
            <span class="detail-value">{{ selectedProp.tags.join(', ') }}</span>
          </div>
          <button class="add-prop-btn" @click="addProp(selectedProp)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            添加至场景
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Scene3DDirectorData, PropModel, Scene3DObject } from '../types'
import { usePropLibrary } from '../composables/usePropLibrary'

const props = defineProps<{
  nodeData: Scene3DDirectorData
}>()

const emit = defineEmits<{
  'update:data': [data: Scene3DDirectorData]
}>()

const { allProps, categoriesList, searchProps } = usePropLibrary()

const searchQuery = ref('')
const activeCategory = ref<string>('furniture')
const selectedProp = ref<PropModel | null>(null)

const filteredProps = computed(() => {
  return searchProps(searchQuery.value, activeCategory.value)
})

function selectProp(prop: PropModel) {
  selectedProp.value = prop
}

function addProp(prop: PropModel) {
  const newObj: Scene3DObject = {
    id: `obj_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: prop.name,
    type: 'prop',
    visible: true,
    position: { x: 0, y: 0.5, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    materialId: 'mat_default'
  }
  const newObjects = [...props.nodeData.objects, newObj]
  emit('update:data', { ...props.nodeData, objects: newObjects })
}

function getThumbColor(id: string): any {
  const colors = [
    { bg: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.05))', fg: '#6366f1' },
    { bg: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(22,163,74,0.05))', fg: '#22c55e' },
    { bg: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.05))', fg: '#f59e0b' },
    { bg: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(185,28,28,0.05))', fg: '#ef4444' },
    { bg: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(109,40,217,0.05))', fg: '#8b5cf6' }
  ]
  const idx = Math.abs(id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % colors.length
  return { background: colors[idx].bg, color: colors[idx].fg }
}

function getThumbIcon(category: string): string {
  const icons: Record<string, string> = {
    furniture: '<rect x="6" y="10" width="20" height="12" rx="1"/><rect x="9" y="13" width="14" height="3"/><circle cx="10" cy="25" r="2"/><circle cx="22" cy="25" r="2"/>',
    props: '<path d="M9 7h14l-2 8H9z"/><rect x="10" y="15" width="12" height="11" rx="1"/>',
    architecture: '<rect x="4" y="6" width="16" height="18" rx="1"/><rect x="8" y="12" width="8" height="10"/><rect x="9" y="8" width="3" height="3"/><rect x="14" y="8" width="3" height="3"/>',
    nature: '<circle cx="16" cy="18" r="10"/><circle cx="11" cy="14" r="6"/><circle cx="21" cy="14" r="6"/>',
    vehicles: '<rect x="4" y="10" width="24" height="8" rx="2"/><circle cx="9" cy="19" r="3"/><circle cx="23" cy="19" r="3"/><rect x="8" y="6" width="12" height="5"/>',
    clothing: '<path d="M8 6l4 4 8-2v14H8z"/><circle cx="14" cy="9" r="1"/>',
    food: '<circle cx="14" cy="16" r="8"/><path d="M10 8c1 2 3 2 4 0"/>',
    electronic: '<rect x="4" y="7" width="20" height="13" rx="1"/><circle cx="14" cy="13.5" r="2"/><rect x="13" y="22" width="4" height="2"/>',
    weapons: '<path d="M5 20L20 5l-3 3L8 21l-3-1z"/><circle cx="14" cy="9" r="2"/>',
    decorative: '<circle cx="14" cy="14" r="10"/><path d="M4 14c5 0 14 0 14 0"/><path d="M14 4c0 5 0 20 0 20"/>'
  }
  return icons[category] || '<circle cx="14" cy="14" r="10"/>'
}
</script>

<style scoped>
.prop-library {
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
  color: #22c55e;
  background: rgba(34, 197, 94, 0.15);
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

.prop-body {
  flex: 1;
  display: flex;
  gap: 6px;
  overflow: hidden;
}

.category-sidebar {
  width: 56px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

.cat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 6px 2px;
  border: 1px solid transparent;
  background: #0f172a;
  color: #64748b;
  border-radius: 6px;
  cursor: pointer;
  font-size: 8px;
  transition: all 0.15s;
  text-align: center;
}

.cat-item:hover {
  border-color: #334155;
}

.cat-item.active {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.15);
  color: #6366f1;
}

.cat-label {
  font-weight: 500;
  line-height: 1;
}

.cat-count {
  font-family: monospace;
  font-size: 7px;
  opacity: 0.7;
}

.prop-grid-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.prop-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 3px;
  overflow-y: auto;
  padding: 4px 0;
}

.prop-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 6px;
  padding: 4px 2px;
  cursor: pointer;
  transition: all 0.15s;
}

.prop-card:hover {
  border-color: #475569;
}

.prop-card.selected {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
}

.prop-thumb {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  margin-bottom: 3px;
}

.prop-name {
  font-size: 8px;
  color: #e2e8f0;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.prop-detail {
  background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05));
  border: 1px solid rgba(99,102,241,0.2);
  border-radius: 8px;
  padding: 8px 10px;
  margin-top: 4px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  padding: 2px 0;
}

.detail-label {
  color: #64748b;
}

.detail-value {
  color: #e2e8f0;
  font-family: monospace;
}

.add-prop-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
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
