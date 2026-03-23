<template>
  <transition name="fade">
    <div v-if="visible" class="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center p-8 backdrop-blur-sm">
      <!-- Main Content Container -->
      <div class="w-full max-w-6xl h-[85vh] bg-slate-900 rounded-xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-300">
        <!-- Header -->
        <header class="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between shadow-md z-10">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <el-icon :size="20"><MagicStick /></el-icon>
            </div>
            <div>
              <h1 class="text-xl font-bold text-white tracking-wide">AI {{ actionType }}助手</h1>
              <p class="text-xs text-slate-400">为您提供多种{{ actionType }}方案供选择</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <el-button @click="handleClose" class="!bg-slate-700 !border-slate-600 !text-slate-300 hover:!text-white" circle>
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </header>

        <!-- Main Content -->
        <main class="flex-1 flex overflow-hidden">
          <!-- Left: Original Text -->
          <div class="w-1/2 border-r border-slate-700 flex flex-col bg-slate-800/30">
            <div class="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
              <span class="font-bold text-slate-300 flex items-center gap-2">
                <el-icon><Document /></el-icon> 原文
              </span>
              <el-tag type="info" size="small" effect="dark" class="!bg-slate-700 !border-slate-600">只读</el-tag>
            </div>
            <div class="flex-1 p-6 overflow-y-auto custom-scrollbar">
              <div class="prose prose-invert max-w-none text-slate-300 leading-loose whitespace-pre-wrap font-serif text-lg selection:bg-indigo-500/30">
                {{ originalText }}
              </div>
            </div>
          </div>

          <!-- Right: Generated Results -->
          <div class="w-1/2 flex flex-col bg-slate-900/50">
            <div class="p-2 border-b border-slate-700 bg-slate-800/50">
              <el-tabs v-model="activeTab" type="card" class="custom-tabs">
                <el-tab-pane v-for="(result, index) in results" :key="index" :name="String(index)">
                  <template #label>
                    <span class="flex items-center gap-2 px-2">
                      <el-icon v-if="result.loading" class="is-loading"><Loading /></el-icon>
                      <el-icon v-else><Check /></el-icon>
                      方案 {{ index + 1 }}
                    </span>
                  </template>
                </el-tab-pane>
              </el-tabs>
            </div>

            <div class="flex-1 p-6 overflow-y-auto custom-scrollbar relative bg-slate-900">
              <div v-if="currentResult.loading && !currentResult.content" class="flex flex-col items-center justify-center h-full text-slate-500">
                <div class="relative">
                  <div class="w-16 h-16 rounded-full border-4 border-slate-700 border-t-indigo-500 animate-spin mb-4"></div>
                  <div class="absolute inset-0 flex items-center justify-center text-indigo-500">
                    <el-icon :size="24"><MagicStick /></el-icon>
                  </div>
                </div>
                <p class="animate-pulse">AI 正在构思方案 {{ Number(activeTab) + 1 }}...</p>
              </div>
              <div v-else class="prose prose-invert max-w-none text-slate-200 leading-loose whitespace-pre-wrap font-serif text-lg selection:bg-indigo-500/30">
                {{ currentResult.content }}
                <span v-if="currentResult.loading" class="inline-block w-2 h-4 bg-indigo-500 animate-pulse ml-1"></span>
              </div>
            </div>

            <!-- Actions Footer -->
            <div class="p-4 border-t border-slate-700 bg-slate-800 flex justify-between items-center z-10">
              <div class="text-xs text-slate-500 flex items-center gap-2">
                <span v-if="currentResult.loading" class="flex items-center gap-1 text-indigo-400">
                  <el-icon class="is-loading"><Loading /></el-icon> 正在生成中...
                </span>
                <span v-else>生成完毕，共 {{ currentResult.content.length }} 字</span>
              </div>
              <div class="flex gap-3">
                <el-button v-if="!currentResult.loading" type="primary" plain class="!bg-slate-700 !border-slate-600 !text-slate-300 hover:!text-white hover:!bg-slate-600 transition-colors" @click="regenerateCurrent">
                  <el-icon class="mr-2"><Refresh /></el-icon> 重新生成
                </el-button>
                <el-button type="primary" color="#4f46e5" :disabled="currentResult.loading || !currentResult.content" @click="handleApply" class="shadow-lg shadow-indigo-500/30 hover:scale-105 transition-transform">
                  <el-icon class="mr-2"><Select /></el-icon> 采用此方案
                </el-button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Close, MagicStick, Document, Loading, Check, Refresh, Select } from '@element-plus/icons-vue'
import { streamLLMResponse } from '@/utils/llmClient'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  visible: boolean
  originalText: string
  actionType: string
  context?: string
}>()

const emit = defineEmits(['update:visible', 'apply'])

const activeTab = ref('0')
const results = ref([
  { content: '', loading: false },
  { content: '', loading: false },
  { content: '', loading: false }
])

const currentResult = computed(() => results.value[Number(activeTab.value)])

watch(() => props.visible, (newVal) => {
  if (newVal) {
    // Reset and start generation
    results.value = [
      { content: '', loading: false },
      { content: '', loading: false },
      { content: '', loading: false }
    ]
    activeTab.value = '0'
    startGeneration()
  }
})

const handleClose = () => {
  emit('update:visible', false)
}

const handleApply = () => {
  emit('apply', currentResult.value.content)
  handleClose()
}

const startGeneration = () => {
  // Generate 3 variants sequentially or partially parallel
  // Note: Since streamLLMResponse might not support concurrent requests depending on implementation, 
  // we'll stagger them or just do one by one. For better UX, let's try to start all 3.
  
  generateVariant(0)
  setTimeout(() => generateVariant(1), 1000)
  setTimeout(() => generateVariant(2), 2000)
}

const generateVariant = (index: number) => {
  if (index >= results.value.length) return
  
  results.value[index].loading = true
  results.value[index].content = ''
  
  const contextPrompt = props.context ? `\n\n【相关背景信息】：\n${props.context}` : ''
  
  const prompts = [
    `请对以下文本进行【${props.actionType}】。${contextPrompt}\n\n【原文】：\n${props.originalText}`,
    `请尝试另一种风格，对以下文本进行【${props.actionType}】。${contextPrompt}\n\n【原文】：\n${props.originalText}`,
    `请用更大胆的创意，对以下文本进行【${props.actionType}】。${contextPrompt}\n\n【原文】：\n${props.originalText}`
  ]

  streamLLMResponse(
    prompts[index],
    (chunk) => {
      results.value[index].content += chunk
    },
    () => {
      results.value[index].loading = false
    }
  )
}

const regenerateCurrent = () => {
  generateVariant(Number(activeTab.value))
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom Tabs Styling */
:deep(.custom-tabs .el-tabs__header) {
  margin: 0;
  border-bottom: none;
}
:deep(.custom-tabs .el-tabs__nav) {
  border: none !important;
}
:deep(.custom-tabs .el-tabs__item) {
  border: 1px solid #334155 !important;
  margin-right: 8px !important;
  border-radius: 8px 8px 0 0;
  background-color: #1e293b;
  color: #94a3b8;
  transition: all 0.3s;
}
:deep(.custom-tabs .el-tabs__item.is-active) {
  background-color: #0f172a;
  border-bottom-color: #0f172a !important;
  color: #818cf8;
  font-weight: bold;
}
:deep(.custom-tabs .el-tabs__item:hover) {
  color: #cbd5e1;
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style>
