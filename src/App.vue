<template>
  <el-container class="h-screen w-screen overflow-hidden transition-colors duration-300" :class="isLight ? 'bg-slate-50 text-slate-800' : 'bg-slate-900 text-slate-200'">
    <el-header class="border-b flex items-center justify-between px-6 z-10 shadow-md transition-colors duration-300" :class="isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">      
          <el-icon :size="24" class="text-white"><VideoPlay /></el-icon>
        </div>
        <h1 class="text-xl font-bold tracking-wide hidden sm:block" :class="isLight ? 'text-slate-800' : 'text-white'">
          跃影
        </h1>
      </div>
      
      <div class="flex items-center gap-4">
        <!-- Global Settings moved from AIWriteNovel.vue -->
        <div class="flex items-center gap-4 mr-4 p-1.5 rounded-full border transition-colors duration-300" :class="isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-700/50 border-slate-600/50'">
           <!-- Model Selector -->
           <div class="flex items-center gap-2 px-2">
              <el-icon class="text-indigo-400"><Cpu /></el-icon>
              <el-select v-model="loreStore.currentNovel.model" size="small" class="w-32 custom-header-select" :effect="isLight ? 'light' : 'dark'" :teleported="false">
                <el-option label="GPT-4-Turbo" value="gpt-4-turbo" />
                <el-option label="Claude-3-Opus" value="claude-3-opus" />
                <el-option label="Gemini-Pro" value="gemini-pro" />
              </el-select>
           </div>
           
           <div class="w-px h-4" :class="isLight ? 'bg-slate-300' : 'bg-slate-600'"></div>

           <!-- Theme Selector -->
           <div class="flex items-center gap-2 px-2">
              <el-icon class="text-purple-400"><Brush /></el-icon>
              <el-select v-model="currentTheme" size="small" class="w-28 custom-header-select" :effect="isLight ? 'light' : 'dark'" @change="updateTheme" :teleported="false">
                <el-option label="默认深蓝" value="dark" />
                <el-option label="清爽亮白" value="light" />
                <el-option label="梦幻紫罗兰" value="dreamy" />
              </el-select>
           </div>
        </div>

        <div class="flex items-center gap-2 pl-2 border-l" :class="isLight ? 'border-slate-200' : 'border-slate-700'">
           <el-avatar :size="32" class="!bg-indigo-600">A</el-avatar>
           <span class="text-sm font-medium" :class="isLight ? 'text-slate-600' : 'text-slate-300'">Admin</span>
        </div>
      </div>
    </el-header>

    <el-container class="flex-1 overflow-hidden">
      <el-aside width="240px" class="border-r flex flex-col transition-colors duration-300" :class="isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'">
        <el-menu
          router
          :default-active="$route.path"
          class="border-none bg-transparent flex-1 py-4"
          :text-color="isLight ? '#475569' : '#ffffff'"
          active-text-color="#818cf8"
        >
          <el-menu-item index="/home" class="menu-item-hover">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/ai-write-novel" class="menu-item-hover">        
            <el-icon><EditPen /></el-icon>
            <span>AI 剧本</span>
          </el-menu-item>
          <el-menu-item index="/ai-video" class="menu-item-hover">  
             <el-icon><VideoCameraFilled /></el-icon>
            <span>AI 短剧</span>
          </el-menu-item>
          <el-menu-item index="/ai-short-drama-creator/new" class="menu-item-hover">
            <el-icon><MagicStick /></el-icon>
            <span>AI短剧创作</span>
          </el-menu-item>
        </el-menu>
        
        <div class="p-4 border-t" :class="isLight ? 'border-slate-200' : 'border-slate-700'">
          <div class="text-xs text-center" :class="isLight ? 'text-slate-400' : 'text-slate-400'">Version 2.0.0 Pro</div>
        </div>
      </el-aside>

      <el-main class="p-0 relative h-full min-h-0 overflow-hidden flex flex-col transition-colors duration-500" :class="mainBgClass">
        <div v-if="runtimeError" class="absolute top-4 left-4 right-4 z-50 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-lg">
          {{ runtimeError }}
        </div>
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <div :key="$route.path" class="flex-1 flex flex-col min-h-0 h-full">
              <component :is="Component" :is-light="isLight" class="flex-1 flex flex-col min-h-0 h-full w-full" />
            </div>
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, provide, watch, computed, onErrorCaptured } from 'vue'
import { EditPen, VideoPlay, VideoCameraFilled, Picture, MagicStick, Refresh, 
Cpu, Brush, HomeFilled } from '@element-plus/icons-vue'
import { useLoreStore } from '@/stores/useLoreStore'

const loreStore = useLoreStore()
const currentTheme = ref('dreamy')
const isLight = ref(true)
const runtimeError = ref<string | null>(null)

const updateTheme = (val: string) => {
  isLight.value = val === 'light' || val === 'dreamy'
}

const mainBgClass = computed(() => {
  if (currentTheme.value === 'dreamy') {
    return 'bg-gradient-to-br from-[#F5F3FF] via-[#F8FAFC] to-[#ECFEFF]'
  }
  return isLight.value ? 'bg-slate-50' : 'bg-slate-900'
})

provide('isLight', isLight)
provide('theme', currentTheme)

onErrorCaptured((error) => {
  runtimeError.value = error instanceof Error ? error.message : String(error)
  return false
})
</script>

<style>
/* Global C-end UI Styles */
.custom-steps :deep(.el-step__title) {
  font-size: 13px;
  font-weight: 800;
  color: #94a3b8 !important;
}
.custom-steps :deep(.el-step__title.is-success) {
  color: #6366f1 !important;
}
.custom-steps :deep(.el-step__title.is-process) {
  color: #1e293b !important;
}
.custom-steps :deep(.el-step__head.is-success) {
  color: #6366f1 !important;
  border-color: #6366f1 !important;
}
.custom-steps :deep(.el-step__head.is-process) {
  color: #fff !important;
  border-color: #6366f1 !important;
}
.custom-steps :deep(.el-step__head.is-process .el-step__icon.is-text) {
  background-color: #6366f1 !important;
  border-radius: 50%;
}

.custom-textarea-round :deep(.el-textarea__inner) {
  border-radius: 16px !important;
  padding: 12px 16px !important;
  border: 1px solid #f1f5f9 !important;
  background-color: #fff !important;
  transition: all 0.3s ease !important;
}
.custom-textarea-round :deep(.el-textarea__inner:focus) {
  border-color: #6366f1 !important;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
}

.custom-select-round :deep(.el-input__wrapper) {
  border-radius: 9999px !important;
  padding-left: 16px !important;
  padding-right: 12px !important;
  box-shadow: 0 0 0 1px #f1f5f9 inset !important;
  background-color: #f8fafc !important;
}
.custom-select-round :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #6366f1 inset !important;
}

.custom-search-input :deep(.el-input__wrapper) {
  border-radius: 9999px !important;
  padding-left: 20px !important;
  background-color: #f8fafc !important;
  box-shadow: 0 0 0 1px #f1f5f9 inset !important;
}
.custom-search-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #6366f1 inset !important;
}

.custom-input-large :deep(.el-input__wrapper) {
  border-radius: 12px 0 0 12px !important;
  height: 48px !important;
  font-size: 15px !important;
}
.custom-input-large :deep(.el-input-group__append) {
  border-radius: 0 12px 12px 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  border: none !important;
}

.custom-select-transparent :deep(.el-input__wrapper) {
  background-color: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
}
.custom-select-transparent :deep(.el-input__inner) {
  font-weight: 700 !important;
  color: #1e293b !important;
}

/* Animations */
@keyframes pulse-indigo {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
.animate-pulse-indigo {
  animation: pulse-indigo 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.menu-item-hover:hover {
  background-color: rgba(79, 70, 229, 0.1) !important;
  color: #6366f1 !important;
}
.menu-item-hover.is-active {
  background-color: rgba(79, 70, 229, 0.1) !important;
  border-right: 3px solid #6366f1;
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-thumb {
  background: #94a3b8;
  border-radius: 3px;
}
::-webkit-scrollbar-track {
  background: transparent;
}

/* Custom Header Select Styling */
.custom-header-select .el-select__wrapper {
  background-color: transparent !important;
  box-shadow: none !important;
  padding: 0 8px !important;
}
.custom-header-select .el-select__wrapper:hover,
.custom-header-select .el-select__wrapper.is-focused {
  box-shadow: none !important;
}
.custom-header-select .el-select__placeholder {
  font-weight: 500;
}
.custom-header-select .el-select__suffix {
  color: #94a3b8;
}
</style>
