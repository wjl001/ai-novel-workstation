<template>
  <div class="role-edit-overlay" @click="$emit('close')">
    <div class="role-edit-panel" @click.stop>
      <div class="edit-section">
        <!-- 角色名称 -->
        <div class="form-group">
          <label class="form-label">角色名称</label>
          <div class="input-with-select">
            <input v-model="roleName" class="form-input" placeholder="请输入角色名称" />
            <div class="select-wrapper select-dropdown" @click="toggleRoleDropdown">
              <span>{{ existingRole ? existingRole.name : '已有角色' }}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
              <!-- 已有角色下拉列表 -->
              <div v-if="showRoleDropdown" class="role-dropdown-list">
                <div v-for="role in existingRoles" :key="role.id" class="dropdown-item" @click.stop="selectRole(role)">
                  <div class="role-avatar" :style="{ background: role.color }">{{ role.name.charAt(0) }}</div>
                  <span>{{ role.name }}</span>
                </div>
                <div v-if="existingRoles.length === 0" class="dropdown-empty">暂无已有角色</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 形象名称 -->
        <div class="form-group">
          <label class="form-label">形象名称</label>
          <input v-model="imageName" class="form-input" placeholder="请输入形象名称" />
        </div>

        <!-- 出现集数 -->
        <div class="form-group">
          <label class="form-label">出现集数</label>
          <div class="select-wrapper select-episode" @click="toggleEpisodeDropdown">
            <span>{{ selectedEpisode }}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
            <!-- 集数下拉列表 -->
            <div v-if="showEpisodeDropdown" class="episode-dropdown-list">
              <div v-for="ep in episodes" :key="ep.id" class="dropdown-item" @click.stop="selectEpisode(ep)">
                <span>{{ ep.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="panel-footer">
        <button class="cancel-btn" @click="$emit('close')">取消</button>
        <button class="save-btn" @click="handleSave">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  node: any
}>()

const emit = defineEmits<{
  close: []
  save: [data: { roleName: string; imageName: string; episodeCount: number; existingRole?: any }]
}>()

const roleName = ref(props.node?.label || '未命名角色')
const imageName = ref(props.node?.data?.imageName || '基础形象')
const episodeCount = ref(props.node?.data?.episodeCount || 1)
const showRoleDropdown = ref(false)
const showEpisodeDropdown = ref(false)

// 模拟已有角色数据
const existingRoles = ref([
  { id: '1', name: '林星', color: '#6366f1' },
  { id: '2', name: '陈宇', color: '#ec4899' },
  { id: '3', name: '王总', color: '#10b981' }
])

const existingRole = ref<any>(null)
const selectedEpisode = ref(`第 ${episodeCount.value} 集`)

// 模拟集数数据
const episodes = ref(
  Array.from({ length: 10 }, (_, i) => ({
    id: String(i + 1),
    name: `第 ${i + 1} 集`
  }))
)

const toggleRoleDropdown = () => {
  showRoleDropdown.value = !showRoleDropdown.value
  showEpisodeDropdown.value = false
}

const toggleEpisodeDropdown = () => {
  showEpisodeDropdown.value = !showEpisodeDropdown.value
  showRoleDropdown.value = false
}

const selectRole = (role: any) => {
  existingRole.value = role
  showRoleDropdown.value = false
}

const selectEpisode = (ep: any) => {
  episodeCount.value = Number(ep.id)
  selectedEpisode.value = ep.name
  showEpisodeDropdown.value = false
}

const handleSave = () => {
  emit('save', {
    roleName: roleName.value,
    imageName: imageName.value,
    episodeCount: episodeCount.value,
    existingRole: existingRole.value
  })
  emit('close')
}
</script>

<style scoped>
.role-edit-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.role-edit-panel {
  width: 440px;
  background: #f8fafc;
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: panelIn 0.2s ease-out;
}

@keyframes panelIn {
  from { opacity: 0; transform: scale(0.95) translateY(-10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.edit-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  color: #1e293b;
  background: white;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.input-with-select {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.input-with-select .form-input {
  flex: 1;
  border-radius: 12px;
}

.select-dropdown {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  transition: all 0.2s;
  white-space: nowrap;
}

.select-dropdown:hover {
  border-color: #6366f1;
  color: #6366f1;
}

.select-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  transition: all 0.2s;
  position: relative;
}

.select-wrapper:hover {
  border-color: #6366f1;
}

.role-dropdown-list, .episode-dropdown-list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f1f5f9;
}

.role-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 800;
}

.dropdown-empty {
  padding: 20px;
  text-align: center;
  font-size: 13px;
  color: #94a3b8;
}

.panel-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.cancel-btn {
  padding: 10px 24px;
  border: none;
  background: white;
  color: #64748b;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e2e8f0;
}

.cancel-btn:hover {
  background: #f1f5f9;
  color: #475569;
}

.save-btn {
  padding: 10px 32px;
  border: none;
  background: #1e293b;
  color: white;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn:hover {
  background: #0f172a;
  transform: translateY(-1px);
}
</style>