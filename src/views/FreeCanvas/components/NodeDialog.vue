<template>
  <div v-if="showDialog" class="node-dialog-overlay" @click="handleOverlayClick">
    <div class="node-dialog" :class="`dialog-${node.type}`" :style="dialogStyle" @click.stop>
      <div class="dialog-header">
        <div class="header-title">
          <span class="type-badge" :class="node.type">{{ nodeTypeLabel }}</span>
          <span class="node-title">{{ node.label }}</span>
        </div>
        <button class="icon-btn" @click="$emit('close')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="dialog-body">
        <template v-if="node.type === 'role'">
          <div class="form-section">
            <div class="form-group">
              <label class="form-label">角色名称</label>
              <div class="input-row">
                <input v-model="editData.roleName" class="form-input" placeholder="请输入角色名称" />
                <button class="select-btn" @click="showRoleDropdown = !showRoleDropdown">
                  已有角色
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
              </div>
              <div v-if="showRoleDropdown" class="dropdown-list">
                <div v-for="role in existingRoles" :key="role.id" class="dropdown-item" @click="selectRole(role)">
                  <div class="role-avatar" :style="{ background: role.color }">{{ role.name.charAt(0) }}</div>
                  <span>{{ role.name }}</span>
                </div>
                <div v-if="existingRoles.length === 0" class="dropdown-empty">暂无已有角色</div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">形象名称</label>
              <input v-model="editData.imageName" class="form-input" placeholder="请输入形象名称" />
            </div>
          </div>

          <div class="form-section">
            <div class="section-title">形象音色</div>
            <div class="radio-row">
              <label class="radio-item" :class="{ active: voiceType === 'text' }">
                <input type="radio" name="voice" value="text" v-model="voiceType" />
                <span class="radio-dot"></span>
                <span>文本音色</span>
              </label>
              <label class="radio-item" :class="{ active: voiceType === 'audio' }">
                <input type="radio" name="voice" value="audio" v-model="voiceType" />
                <span class="radio-dot"></span>
                <span>音频音色</span>
              </label>
            </div>
            <textarea v-model="editData.voiceDescription" class="voice-textarea" placeholder="请输入音色描述" rows="3"></textarea>
            <div class="voice-actions">
              <button class="voice-action-btn" @click="handleUploadAudio">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                上传音频
              </button>
              <button class="voice-action-btn" @click="handleAiGenerate">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                AI 生成
              </button>
            </div>
            <button class="bind-btn" @click="handleBindExist">绑定已有音频</button>
          </div>

          <div class="form-section">
            <div class="section-title">上下文与生成</div>
            <div v-if="node.contexts && node.contexts.length > 0" class="item-list">
              <div class="item-chip" v-for="(ctx, i) in node.contexts" :key="i" :class="'item-' + ctx.type">
                <span>{{ ctx.content?.name || ctx.type }}</span>
                <button @click="removeContext(i)">×</button>
              </div>
            </div>
            <div v-if="node.generations && node.generations.length > 0" class="item-list">
              <div class="item-chip" v-for="(gen, i) in node.generations" :key="i" :class="'item-' + gen.type">
                <span>{{ gen.content?.name || gen.type }}</span>
                <button @click="removeGeneration(i)">×</button>
              </div>
            </div>
            <div v-if="!(node.contexts && node.contexts.length > 0) && !(node.generations && node.generations.length > 0)" class="empty-hint">
              暂无上下文或生成内容
            </div>
          </div>
        </template>

        <template v-else>
          <div class="form-section">
            <div class="form-group">
              <label class="form-label">名称</label>
              <input v-model="editData.name" class="form-input" placeholder="请输入名称" />
            </div>
            <div class="form-group">
              <label class="form-label">描述</label>
              <textarea v-model="editData.description" class="form-input form-textarea" placeholder="请输入描述" rows="3"></textarea>
            </div>
          </div>
        </template>
      </div>

      <div class="dialog-footer">
        <button class="cancel-btn" @click="$emit('close')">取消</button>
        <button class="save-btn" @click="handleSave">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CanvasNode, ContextType } from '../types'

const props = defineProps<{
  node: CanvasNode
  show: boolean
  position: { x: number; y: number }
}>()

const emit = defineEmits<{
  close: []
  save: [data: any]
  removeContext: [index: number]
  removeGeneration: [index: number]
}>()

const showDialog = computed(() => props.show)

const dialogStyle = computed(() => ({
  left: `${props.position.x}px`,
  top: `${props.position.y}px`,
  width: '420px'
}))

const nodeTypeLabel = computed(() => {
  const labels: Record<string, string> = {
    role: '角色', scene: '场景', text: '文本', image: '图片', video: '视频', audio: '音频'
  }
  return labels[props.node.type] || '节点'
})

const editData = ref({
  roleName: props.node.label || '未命名角色',
  imageName: (props.node.data as any).imageName || '基础形象',
  episodeCount: (props.node.data as any).episodeCount || 1,
  voiceDescription: (props.node.data as any).voiceDescription || '',
  name: props.node.label || '',
  description: props.node.data.description || ''
})

const voiceType = ref('text')
const showRoleDropdown = ref(false)
const showEpisodeDropdown = ref(false)

const existingRoles = ref([
  { id: '1', name: '林星', color: '#6366f1' },
  { id: '2', name: '陈宇', color: '#ec4899' },
  { id: '3', name: '王总', color: '#10b981' }
])

const selectRole = (role: any) => {
  editData.value.roleName = role.name
  showRoleDropdown.value = false
}

const handleUploadAudio = () => alert('上传音频功能开发中')
const handleAiGenerate = () => alert('AI生成功能开发中')
const handleBindExist = () => alert('绑定已有音频功能开发中')

const handleSave = () => {
  emit('save', { ...editData.value, voiceType: voiceType.value })
}

const handleOverlayClick = (event: MouseEvent) => {
  if ((event.target as HTMLElement).classList.contains('node-dialog-overlay')) {
    emit('close')
  }
}

const removeContext = (index: number) => emit('removeContext', index)
const removeGeneration = (index: number) => emit('removeGeneration', index)
</script>

<style scoped>
.node-dialog-overlay {
  position: fixed; inset: 0; z-index: 500;
  background: rgba(0, 0, 0, 0.3); backdrop-filter: blur(4px);
}

.node-dialog {
  position: fixed; background: white; border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
  display: flex; flex-direction: column; max-height: 80vh;
  animation: dialogIn 0.2s ease-out; z-index: 501;
}

@keyframes dialogIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

.dialog-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; border-bottom: 1px solid #f1f5f9; flex-shrink: 0;
}

.header-title { display: flex; align-items: center; gap: 10px; }

.type-badge {
  font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 6px; text-transform: uppercase;
}
.type-badge.role { background: #eef2ff; color: #6366f1; }
.type-badge.scene { background: #f0fdf4; color: #0d9488; }
.type-badge.text { background: #fdf2f8; color: #d946ef; }
.type-badge.image { background: #f0fdf4; color: #16a34a; }
.type-badge.video { background: #fefce8; color: #ca8a04; }
.type-badge.audio { background: #f5f3ff; color: #8b5cf6; }

.node-title { font-size: 14px; font-weight: 700; color: #1e293b; }

.icon-btn {
  width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
  border: none; background: #f1f5f9; color: #64748b; border-radius: 6px; cursor: pointer; transition: all 0.2s;
}
.icon-btn:hover { background: #e2e8f0; color: #ef4444; }

.dialog-body {
  padding: 16px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px;
}

.form-section { display: flex; flex-direction: column; gap: 10px; }

.section-title { font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }

.form-group { display: flex; flex-direction: column; gap: 6px; position: relative; }

.form-label { font-size: 12px; font-weight: 700; color: #64748b; }

.form-input {
  width: 100%; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 10px;
  font-size: 13px; color: #1e293b; background: #f8fafc; outline: none; transition: all 0.2s; box-sizing: border-box;
}
.form-input:focus { border-color: #6366f1; background: white; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
.form-textarea { resize: none; }

.input-row { display: flex; gap: 8px; }
.input-row .form-input { flex: 1; }

.select-btn {
  display: flex; align-items: center; gap: 4px; padding: 8px 12px; border: 1px solid #e2e8f0;
  background: white; color: #64748b; border-radius: 10px; cursor: pointer;
  font-size: 13px; font-weight: 600; transition: all 0.2s; white-space: nowrap;
}
.select-btn:hover { border-color: #6366f1; color: #6366f1; }

.dropdown-list {
  position: absolute; top: calc(100% + 4px); left: 0; right: 0;
  background: white; border: 1px solid #e2e8f0; border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); z-index: 10; max-height: 150px; overflow-y: auto;
}

.dropdown-item {
  display: flex; align-items: center; gap: 8px; padding: 8px 12px; cursor: pointer;
  font-size: 13px; font-weight: 600; color: #334155; transition: background 0.2s;
}
.dropdown-item:hover { background: #f1f5f9; }

.role-avatar {
  width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  color: white; font-size: 11px; font-weight: 800;
}

.dropdown-empty { padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; }

.radio-row { display: flex; gap: 16px; }

.radio-item {
  display: flex; align-items: center; gap: 6px; cursor: pointer;
  font-size: 13px; font-weight: 600; color: #64748b; transition: all 0.2s;
}
.radio-item input[type="radio"] { display: none; }

.radio-dot {
  width: 16px; height: 16px; border-radius: 50%; border: 2px solid #cbd5e1;
  position: relative; transition: all 0.2s;
}
.radio-item.active .radio-dot { border-color: #6366f1; }
.radio-item.active .radio-dot::after { content: ''; position: absolute; inset: 2px; border-radius: 50%; background: #6366f1; }
.radio-item.active { color: #6366f1; }

.voice-textarea {
  width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 10px;
  font-size: 13px; color: #1e293b; background: #f8fafc; outline: none;
  resize: none; transition: all 0.2s; box-sizing: border-box;
}
.voice-textarea:focus { border-color: #6366f1; background: white; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
.voice-textarea::placeholder { color: #94a3b8; }

.voice-actions { display: flex; gap: 8px; }

.voice-action-btn {
  display: flex; align-items: center; gap: 6px; padding: 10px 16px;
  border: 1px solid #e2e8f0; background: #f8fafc; color: #64748b;
  border-radius: 10px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s;
}
.voice-action-btn:hover { border-color: #6366f1; background: #eef2ff; color: #6366f1; }

.bind-btn {
  text-align: right; font-size: 12px; color: #6366f1; cursor: pointer;
  font-weight: 600; padding: 4px; transition: color 0.2s; background: none; border: none;
}
.bind-btn:hover { color: #4f46e5; }

.item-list { display: flex; flex-wrap: wrap; gap: 6px; }

.item-chip {
  display: flex; align-items: center; gap: 4px; padding: 4px 8px;
  border-radius: 8px; font-size: 11px; font-weight: 600; background: #f1f5f9; color: #475569;
}
.item-chip.item-text { background: #f0f9ff; color: #0284c7; }
.item-chip.item-image { background: #f0fdf4; color: #16a34a; }
.item-chip.item-role { background: #eef2ff; color: #6366f1; }
.item-chip.item-video { background: #fefce8; color: #ca8a04; }
.item-chip.item-audio { background: #f5f3ff; color: #8b5cf6; }

.item-chip button {
  width: 14px; height: 14px; display: flex; align-items: center; justify-content: center;
  border: none; background: transparent; color: inherit; cursor: pointer; font-size: 10px; opacity: 0.5;
}
.item-chip button:hover { opacity: 1; }

.empty-hint { font-size: 12px; color: #94a3b8; text-align: center; padding: 12px; }

.dialog-footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 12px 16px; border-top: 1px solid #f1f5f9; flex-shrink: 0;
}

.cancel-btn {
  padding: 8px 20px; border: 1px solid #e2e8f0; background: white;
  color: #64748b; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.cancel-btn:hover { background: #f1f5f9; color: #475569; }

.save-btn {
  padding: 8px 24px; border: none; background: #1e293b; color: white;
  border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s;
}
.save-btn:hover { background: #0f172a; }
</style>