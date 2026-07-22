<template>
  <div class="node-panel">
    <!-- 节点类型按钮 -->
    <div class="node-types">
      <button 
        class="node-type-btn"
        :class="{ active: activeType === 'role' }"
        @click="handleAddNode('role')"
        title="添加角色"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span>角色</span>
      </button>

      <button 
        class="node-type-btn"
        :class="{ active: activeType === 'scene' }"
        @click="handleAddNode('scene')"
        title="添加场景"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        <span>场景</span>
      </button>

      <button 
        class="node-type-btn"
        :class="{ active: activeType === 'text' }"
        @click="handleAddNode('text')"
        title="添加文本"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>
        </svg>
        <span>文本</span>
      </button>

      <button 
        class="node-type-btn"
        :class="{ active: activeType === 'image' }"
        @click="handleAddNode('image')"
        title="添加图片"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        <span>图片</span>
      </button>

      <button 
        class="node-type-btn"
        :class="{ active: activeType === 'video' }"
        @click="handleAddNode('video')"
        title="添加视频"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="23 7 16 12 23 17 23 7"/>
          <rect x="1" y="5" width="15" height="14" rx="2"/>
        </svg>
        <span>视频</span>
      </button>

      <button 
        class="node-type-btn"
        :class="{ active: activeType === 'audio' }"
        @click="handleAddNode('audio')"
        title="添加音频"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
        </svg>
        <span>音频</span>
      </button>
    </div>

    <!-- 提示文本 -->
    <div class="panel-tip">点击添加节点<br>到画布</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeType = ref<string>('')

const emit = defineEmits<{
  addNode: [type: string]
}>()

const handleAddNode = (type: string) => {
  activeType.value = type
  emit('addNode', type)
}
</script>

<style scoped>
.node-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 50;
  background: white;
  padding: 12px 6px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.node-types {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.node-type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 4px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.node-type-btn:hover {
  background: #f1f5f9;
  color: #475569;
  transform: scale(1.05);
}

.node-type-btn.active {
  background: #eef2ff;
  color: #6366f1;
}

.node-type-btn svg {
  width: 20px;
  height: 20px;
}

.node-type-btn span {
  font-size: 9px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}

.panel-tip {
  font-size: 8px;
  color: #94a3b8;
  text-align: center;
  line-height: 1.4;
  margin-top: 8px;
  padding: 4px;
  width: 100%;
}
</style>
