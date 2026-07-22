<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="context-menu"
      :style="{ left: position.x + 'px', top: position.y + 'px' }"
      @click="onSelect"
      @contextmenu.prevent="hide"
    >
      <div class="menu-item" v-for="item in items" :key="item.id">
        <span class="menu-icon" v-html="item.icon || ''"></span>
        <span class="menu-label">{{ item.label }}</span>
        <span class="menu-shortcut" v-if="item.shortcut">{{ item.shortcut }}</span>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)
const position = ref({ x: 0, y: 0 })
const items = ref<Array<{ id: string; label: string; icon?: string; shortcut?: string }>>([])

function show(x: number, y: number, menuItems: typeof items.value) {
  position.value = { x, y }
  items.value = menuItems
  visible.value = true
}

function hide() {
  visible.value = false
}

function onSelect() {
  hide()
}

defineExpose({ show, hide })
</script>

<style scoped>
.context-menu {
  position: fixed;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  padding: 4px;
  z-index: 1000;
  min-width: 180px;
}
.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  color: #334155;
  font-size: 13px;
}
.menu-item:hover { background: #f1f5f9; }
.menu-item.danger { color: #ef4444; }
.menu-item.danger:hover { background: #fee2e2; }
.menu-item.disabled { opacity: 0.4; cursor: not-allowed; }
.menu-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 4px 0;
}
.menu-icon { width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; }
.menu-label { flex: 1; }
.menu-shortcut { color: #94a3b8; font-size: 12px; }
</style>
