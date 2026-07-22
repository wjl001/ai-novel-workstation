<template>
  <div 
    class="context-menu-overlay" 
    @click.self="$emit('close')"
    @contextmenu.prevent="$emit('close')"
  >
    <div 
      class="context-menu"
      :style="{ left: position.x + 'px', top: position.y + 'px' }"
    >
      <div class="menu-header">
        <span class="menu-title">{{ title }}</span>
      </div>
      <div class="menu-items">
        <div 
          v-for="item in items" 
          :key="item.id"
          class="menu-item"
          @click="handleClick(item)"
        >
          <span class="menu-item-icon" v-html="item.icon"></span>
          <span class="menu-item-label">{{ item.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MenuItem } from '../types'

const props = defineProps<{
  position: { x: number; y: number }
  title: string
  items: MenuItem[]
}>()

const emit = defineEmits<{
  select: [item: MenuItem]
  close: []
}>()

const handleClick = (item: MenuItem) => {
  emit('select', item)
  emit('close')
}
</script>

<style scoped>
.context-menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: transparent;
}

.context-menu {
  position: absolute;
  min-width: 180px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
  padding: 8px;
  animation: menuIn 0.15s ease-out;
  z-index: 1001;
}

@keyframes menuIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-5px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.menu-header {
  padding: 8px 12px 6px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 4px;
}

.menu-title {
  font-size: 11px;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.menu-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.menu-item:hover {
  background: #f1f5f9;
}

.menu-item:active {
  transform: scale(0.98);
}

.menu-item-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 16px;
  flex-shrink: 0;
}

.menu-item-label {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  white-space: nowrap;
}
</style>