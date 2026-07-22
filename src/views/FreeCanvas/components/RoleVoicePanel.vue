<template>
  <div class="voice-panel-overlay" @click="$emit('close')">
    <div class="voice-panel" @click.stop>
      <div class="panel-header">
        <h3>形象音色</h3>
      </div>

      <!-- 音色类型选择 -->
      <div class="voice-type-section">
        <div class="radio-group">
          <label class="radio-item" :class="{ active: voiceType === 'text' }">
            <input type="radio" name="voiceType" value="text" v-model="voiceType" />
            <span class="radio-dot"></span>
            <span>文本音色</span>
          </label>
          <label class="radio-item" :class="{ active: voiceType === 'audio' }">
            <input type="radio" name="voiceType" value="audio" v-model="voiceType" />
            <span class="radio-dot"></span>
            <span>音频音色</span>
          </label>
        </div>

        <!-- 文本音色 -->
        <div v-if="voiceType === 'text'" class="text-voice-section">
          <textarea
            v-model="voiceDescription"
            class="voice-textarea"
            placeholder="请输入音色描述"
            rows="4"
          ></textarea>

          <div class="voice-actions">
            <div class="upload-btn" @click="handleUploadAudio">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span>上传音频</span>
            </div>
            <div class="ai-gen-btn" @click="handleAiGenerate">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              <span>AI 生成</span>
            </div>
          </div>

          <div class="bind-exist-btn" @click="handleBindExist">
            绑定已有音频
          </div>
        </div>

        <!-- 音频音色 -->
        <div v-if="voiceType === 'audio'" class="audio-voice-section">
          <div class="audio-upload-area">
            <div class="upload-placeholder">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
              </svg>
              <span>拖拽或点击上传音频文件</span>
              <span class="upload-hint">支持 MP3、WAV、M4A 格式</span>
            </div>
            <input type="file" ref="audioFileInput" accept="audio/*" @change="handleAudioFileSelect" style="display:none" />
          </div>

          <div v-if="audioFile" class="audio-preview">
            <div class="audio-info">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
              </svg>
              <span class="audio-name">{{ audioFile.name }}</span>
            </div>
            <audio ref="audioPreview" :src="audioFileUrl" controls class="audio-player"></audio>
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
import { ref } from 'vue'

const emit = defineEmits<{
  close: []
  save: [data: { voiceType: string; voiceDescription: string; audioFile: File | null }]
}>()

const voiceType = ref('text')
const voiceDescription = ref('')
const audioFile = ref<File | null>(null)
const audioFileUrl = ref('')
const audioFileInput = ref<HTMLInputElement>()
const audioPreview = ref<HTMLAudioElement>()

const handleUploadAudio = () => {
  audioFileInput.value?.click()
}

const handleAudioFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    audioFile.value = input.files[0]
    audioFileUrl.value = URL.createObjectURL(input.files[0])
  }
}

const handleAiGenerate = () => {
  if (!voiceDescription.value.trim()) {
    alert('请先输入音色描述')
    return
  }
  // TODO: 调用 AI 生成接口
  alert('AI 生成功能开发中...')
}

const handleBindExist = () => {
  // TODO: 绑定已有音频
  alert('绑定已有音频功能开发中...')
}

const handleSave = () => {
  emit('save', {
    voiceType: voiceType.value,
    voiceDescription: voiceDescription.value,
    audioFile: audioFile.value
  })
  emit('close')
}
</script>

<style scoped>
.voice-panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.voice-panel {
  width: 480px;
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: panelIn 0.2s ease-out;
}

@keyframes panelIn {
  from { opacity: 0; transform: scale(0.95) translateY(-10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.panel-header {
  margin-bottom: 20px;
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: #1e293b;
}

.voice-type-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.radio-group {
  display: flex;
  gap: 24px;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  transition: all 0.2s;
}

.radio-item input[type="radio"] {
  display: none;
}

.radio-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #cbd5e1;
  position: relative;
  transition: all 0.2s;
}

.radio-item.active .radio-dot {
  border-color: #6366f1;
}

.radio-item.active .radio-dot::after {
  content: '';
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  background: #6366f1;
}

.radio-item.active {
  color: #6366f1;
}

.text-voice-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.voice-textarea {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px;
  font-size: 14px;
  color: #1e293b;
  outline: none;
  resize: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.voice-textarea:focus {
  border-color: #6366f1;
}

.voice-textarea::placeholder {
  color: #94a3b8;
}

.voice-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.upload-btn, .ai-gen-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 16px;
  border-radius: 16px;
  background: #f8fafc;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e2e8f0;
}

.upload-btn:hover, .ai-gen-btn:hover {
  background: #eef2ff;
  color: #6366f1;
  border-color: #6366f1;
}

.upload-btn span, .ai-gen-btn span {
  font-size: 13px;
  font-weight: 600;
}

.bind-exist-btn {
  text-align: right;
  font-size: 12px;
  color: #6366f1;
  cursor: pointer;
  font-weight: 600;
  padding: 4px;
  transition: color 0.2s;
}

.bind-exist-btn:hover {
  color: #4f46e5;
}

.audio-voice-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.audio-upload-area {
  width: 100%;
  min-height: 120px;
  border: 2px dashed #e2e8f0;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.audio-upload-area:hover {
  border-color: #6366f1;
  background: #f8fafc;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
}

.upload-placeholder span {
  font-size: 14px;
  font-weight: 600;
}

.upload-hint {
  font-size: 12px !important;
  font-weight: 400 !important;
  color: #cbd5e1 !important;
}

.audio-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.audio-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 12px;
  color: #64748b;
}

.audio-name {
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.audio-player {
  width: 100%;
  height: 32px;
}

.panel-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.cancel-btn {
  padding: 10px 24px;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #e2e8f0;
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