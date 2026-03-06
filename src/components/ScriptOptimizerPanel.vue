<template>
  <div class="script-optimizer-panel flex flex-col h-full p-4 overflow-y-auto custom-scrollbar transition-colors duration-300" :class="panelClass">
    <div class="mb-6">
      <h3 class="text-lg font-bold mb-2 flex items-center gap-2" :class="isLight ? 'text-indigo-600' : 'text-indigo-400'">
        <el-icon><VideoCamera /></el-icon> AI 短剧剧本优化引擎
      </h3>
      <p class="text-xs" :class="isLight ? 'text-slate-500' : 'text-slate-400'">专为短视频节奏打造，一键解决口语化、节奏感、连贯性与爽点痛点。</p>
    </div>

    <!-- 1. 口语化重写引擎 -->
    <div class="feature-card mb-4 p-4 rounded-lg border transition-colors" :class="cardClass('indigo')">
      <div class="flex justify-between items-center mb-2">
        <div class="font-bold text-sm" :class="textClass">🗣️ 口语化重写</div>
        <el-switch v-model="settings.colloquial.enabled" size="small" active-color="#4f46e5" />
      </div>
      <div v-if="settings.colloquial.enabled" class="space-y-2">
        <div class="flex items-center justify-between text-xs" :class="subTextClass">
          <span>句式拆解强度</span>
          <el-slider v-model="settings.colloquial.sentenceSplit" :max="10" size="small" class="w-24" />
        </div>
        <div class="flex items-center justify-between text-xs" :class="subTextClass">
          <span>语气词注入</span>
          <el-switch v-model="settings.colloquial.addParticles" size="small" active-text="开启" inactive-text="关闭" inline-prompt />
        </div>
        <div class="flex items-center justify-between text-xs" :class="subTextClass">
          <span>第二人称互动</span>
          <el-switch v-model="settings.colloquial.interactive" size="small" active-text="开启" inactive-text="关闭" inline-prompt />
        </div>
        <el-button type="primary" size="small" class="w-full mt-2" :class="buttonClass('indigo')" @click="runOptimization('colloquial')">
          执行口语化重写
        </el-button>
      </div>
    </div>

    <!-- 2. 听觉节奏控制器 -->
    <div class="feature-card mb-4 p-4 rounded-lg border transition-colors" :class="cardClass('orange')">
      <div class="flex justify-between items-center mb-2">
        <div class="font-bold text-sm" :class="textClass">🎵 听觉节奏控制</div>
        <el-switch v-model="settings.rhythm.enabled" size="small" active-color="#f97316" />
      </div>
      <div v-if="settings.rhythm.enabled" class="space-y-2">
        <div class="flex items-center justify-between text-xs" :class="subTextClass">
          <span>目标时长 (秒)</span>
          <el-input-number v-model="settings.rhythm.targetDuration" :min="15" :max="300" size="small" class="!w-24" controls-position="right" />
        </div>
        <div class="text-xs flex justify-between" :class="subTextClass">
           <span>预估字数: {{ Math.round(settings.rhythm.targetDuration * (220/60)) }} 字</span>
           <span>语速: 220字/分</span>
        </div>
        <div class="flex items-center justify-between text-xs mt-2" :class="subTextClass">
          <span>情绪标记注入 (TTS)</span>
          <el-switch v-model="settings.rhythm.addEmotions" size="small" active-text="开启" inactive-text="关闭" inline-prompt />
        </div>
        <div class="flex items-center justify-between text-xs" :class="subTextClass">
          <span>黄金三秒开头优化</span>
          <el-switch v-model="settings.rhythm.goldenOpener" size="small" active-text="开启" inactive-text="关闭" inline-prompt />
        </div>
        <el-button type="warning" size="small" class="w-full mt-2" :class="buttonClass('orange')" @click="runOptimization('rhythm')">
          调整节奏与时长
        </el-button>
      </div>
    </div>

    <!-- 3. 剧情连贯性记忆链 -->
    <div class="feature-card mb-4 p-4 rounded-lg border transition-colors" :class="cardClass('cyan')">
      <div class="flex justify-between items-center mb-2">
        <div class="font-bold text-sm" :class="textClass">🔗 剧情连贯性记忆链</div>
        <el-switch v-model="settings.consistency.enabled" size="small" active-color="#06b6d4" />
      </div>
      <div v-if="settings.consistency.enabled" class="space-y-2">
        <div class="text-xs mb-2" :class="subTextClass">
          检测上一章悬念、人物状态及伏笔回收情况。
        </div>
        <div class="flex gap-1 flex-wrap mb-2">
           <el-tag v-for="tag in detectedContextTags" :key="tag" size="small" type="info" effect="dark" class="!bg-slate-700 !border-slate-600">{{ tag }}</el-tag>
        </div>
        <el-button type="info" size="small" class="w-full" :class="buttonClass('cyan')" @click="runOptimization('consistency')">
          检查并修复连贯性
        </el-button>
      </div>
    </div>

    <!-- 4. 爽点/钩子强化器 -->
    <div class="feature-card mb-4 p-4 rounded-lg border transition-colors" :class="cardClass('red')">
      <div class="flex justify-between items-center mb-2">
        <div class="font-bold text-sm" :class="textClass">🔥 爽点/钩子强化</div>
        <el-switch v-model="settings.hooks.enabled" size="small" active-color="#ef4444" />
      </div>
      <div v-if="settings.hooks.enabled" class="space-y-2">
        <div class="flex items-center justify-between text-xs" :class="subTextClass">
          <span>废话过滤器</span>
          <el-switch v-model="settings.hooks.filterFluff" size="small" active-text="开启" inactive-text="关闭" inline-prompt />
        </div>
        <div class="flex items-center justify-between text-xs" :class="subTextClass">
          <span>冲突前置 (倒叙/插叙)</span>
          <el-switch v-model="settings.hooks.frontLoadConflict" size="small" active-text="开启" inactive-text="关闭" inline-prompt />
        </div>
        <div class="flex items-center justify-between text-xs" :class="subTextClass">
          <span>卡点结尾生成 (强悬念)</span>
          <el-switch v-model="settings.hooks.cliffhanger" size="small" active-text="开启" inactive-text="关闭" inline-prompt />
        </div>
        <el-button type="danger" size="small" class="w-full mt-2" :class="buttonClass('red')" @click="runOptimization('hooks')">
          强化爽点与悬念
        </el-button>
      </div>
    </div>

    <!-- 5. 影视化对接 (AI Video Bridge) -->
    <div class="feature-card mb-4 p-4 rounded-lg border transition-colors" :class="cardClass('purple')">
      <div class="flex justify-between items-center mb-2">
        <div class="font-bold text-sm" :class="textClass">🎥 影视化对接</div>
        <el-switch v-model="settings.videoBridge.enabled" size="small" active-color="#a855f7" />
      </div>
      <div v-if="settings.videoBridge.enabled" class="space-y-2">
        <div class="text-xs mb-2" :class="subTextClass">
          生成下游视频制作所需的提示词与分镜脚本。
        </div>
        <el-button type="primary" size="small" class="w-full" :class="buttonClass('purple')" @click="runOptimization('visual_prompts')">
          提取画面提示词 (Midjourney/SD)
        </el-button>
        <el-button type="primary" size="small" class="w-full mt-2" :class="buttonClass('purple')" @click="runOptimization('script_format')">
          生成分镜脚本表格
        </el-button>
      </div>
    </div>

    <!-- Result Display Dialog -->
    <el-dialog v-model="showResultDialog" :title="resultTitle" width="600px" :class="dialogClass" append-to-body>
      <div class="flex flex-col gap-4 h-[400px]">
         <div class="flex-1 rounded p-4 border overflow-y-auto whitespace-pre-wrap leading-relaxed custom-scrollbar text-sm" :class="dialogContentClass">
            <div v-if="isProcessing" class="flex items-center justify-center h-full gap-2" :class="subTextClass">
               <el-icon class="is-loading"><Loading /></el-icon> AI 正在处理中...
            </div>
            <span v-else>{{ optimizationResult }}</span>
         </div>
         <div class="text-xs" :class="subTextClass">
            <el-icon><InfoFilled /></el-icon> 优化逻辑：{{ resultLogic }}
         </div>
      </div>
      <template #footer>
        <el-button @click="showResultDialog = false" :class="isLight ? '' : '!bg-slate-700 !border-slate-600 !text-slate-300 hover:!text-white'">取消</el-button>
        <el-button type="primary" :disabled="isProcessing" @click="applyResult" :class="isLight ? '!bg-indigo-600 border-none' : '!bg-indigo-600 border-none'">应用修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, inject, computed } from 'vue'
import { VideoCamera, Loading, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { streamLLMResponse } from '@/utils/llmClient'

const emit = defineEmits(['apply-optimization'])
const props = defineProps<{
  currentContent: string
  previousChapterContent?: string
}>()

const isLight = inject('isLight', ref(false))
const theme = inject('theme', ref('dark'))

// Theme Computeds
const panelClass = computed(() => {
  if (theme.value === 'dreamy') return 'bg-white/60 backdrop-blur-md text-slate-800 border-l border-white/50'
  return isLight.value ? 'bg-white text-slate-800 border-l border-slate-200' : 'bg-slate-900 text-slate-200 border-l border-slate-700'
})

const textClass = computed(() => {
  if (theme.value === 'dreamy') return 'text-slate-700'
  return isLight.value ? 'text-slate-700' : 'text-slate-300'
})

const subTextClass = computed(() => {
  if (theme.value === 'dreamy') return 'text-slate-500'
  return isLight.value ? 'text-slate-500' : 'text-slate-400'
})

const cardClass = (color: string) => {
  const base = 'mb-4 p-4 rounded-lg border transition-colors'
  if (theme.value === 'dreamy') {
    return `${base} bg-white/50 border-white/60 shadow-sm hover:shadow-md hover:border-${color}-300 backdrop-blur-sm`
  }
  return isLight.value 
    ? `${base} bg-slate-50 border-slate-200 hover:border-${color}-500/50`
    : `${base} bg-slate-800 border-slate-700 hover:border-${color}-500/50`
}

const buttonClass = (color: string) => {
  if (theme.value === 'dreamy') {
    return `!bg-${color}-50 !border-${color}-200 !text-${color}-600 hover:!bg-${color}-100`
  }
  return isLight.value
    ? `!bg-${color}-50 !border-${color}-200 !text-${color}-600 hover:!bg-${color}-100`
    : `!bg-${color}-600/20 !border-${color}-500/30 !text-${color}-300 hover:!bg-${color}-600/30`
}

const dialogClass = computed(() => {
  if (theme.value === 'dreamy') return 'dreamy-dialog'
  return isLight.value ? '' : 'dark-dialog'
})

const dialogContentClass = computed(() => {
  if (theme.value === 'dreamy') return 'bg-white/40 border-white/50 text-slate-700'
  return isLight.value ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-700 text-slate-300'
})

// Settings State
const settings = reactive({
  colloquial: {
    enabled: true,
    sentenceSplit: 8,
    addParticles: true,
    interactive: false
  },
  rhythm: {
    enabled: false,
    targetDuration: 60,
    addEmotions: true,
    goldenOpener: true
  },
  consistency: {
    enabled: false
  },
  hooks: {
    enabled: false,
    filterFluff: true,
    frontLoadConflict: false,
    cliffhanger: true
  },
  videoBridge: {
    enabled: false
  }
})

const detectedContextTags = ref(['上一章悬念：未知', '主角状态：正常'])
const showResultDialog = ref(false)
const isProcessing = ref(false)
const resultTitle = ref('')
const optimizationResult = ref('')
const resultLogic = ref('')

// Methods

const runOptimization = (type: string) => {
  if (!props.currentContent) {
    ElMessage.warning('请先在编辑器中输入内容')
    return
  }

  showResultDialog.value = true
  isProcessing.value = true
  optimizationResult.value = ''
  
  let prompt = ''
  let logicDescription = ''

  // Construct Prompt based on type
  if (type === 'colloquial') {
    resultTitle.value = '口语化重写结果'
    logicDescription = '拆解长难句，降维词汇，注入语气词'
    prompt = `请将以下文本进行【口语化重写】。
    要求：
    1. 句式拆解：将超过20字的长句拆分为短句。
    2. 词汇降维：将书面语（如“甚为惶恐”）改为口语（如“吓坏了”）。
    3. 语气词：${settings.colloquial.addParticles ? '适当加入“哎”、“那个”、“好家伙”等语气词' : '不加语气词'}。
    4. 互动：${settings.colloquial.interactive ? '加入第二人称互动（如“你猜怎么着”）' : '不加互动'}。
    
    原文：
    ${props.currentContent}`
  } else if (type === 'rhythm') {
    resultTitle.value = '听觉节奏优化结果'
    logicDescription = `按${settings.rhythm.targetDuration}秒时长（220字/分）调整，注入情绪标记`
    prompt = `请将以下文本进行【听觉节奏优化】。
    要求：
    1. 时长控制：目标时长 ${settings.rhythm.targetDuration} 秒（约 ${Math.round(settings.rhythm.targetDuration * (220/60))} 字）。
    2. 情绪标记：${settings.rhythm.addEmotions ? '插入 [语速加快][紧张][停顿] 等TTS标签' : '不插入标签'}。
    3. 开头优化：${settings.rhythm.goldenOpener ? '重写前三秒开头，确保吸引人' : '保持原开头'}。
    
    原文：
    ${props.currentContent}`
  } else if (type === 'consistency') {
    resultTitle.value = '连贯性修复结果'
    logicDescription = '检查上下文连贯性，承接悬念，统一称呼'
    prompt = `请检查以下文本的【剧情连贯性】。
    上一章结尾（如有）：${props.previousChapterContent ? props.previousChapterContent.slice(-200) : '无'}
    
    要求：
    1. 确保开头自然承接上一章悬念。
    2. 检查人物状态是否符合逻辑。
    3. 统一人物称呼。
    
    原文：
    ${props.currentContent}`
  } else if (type === 'hooks') {
    resultTitle.value = '爽点与悬念强化结果'
    logicDescription = '过滤废话，前置冲突，生成卡点悬念'
    prompt = `请将以下文本进行【爽点强化】。
    要求：
    1. 废话过滤：${settings.hooks.filterFluff ? '删除无意义的环境描写和心理独白' : '保留描写'}。
    2. 结构调整：${settings.hooks.frontLoadConflict ? '将冲突或高潮前置' : '保持原结构'}。
    3. 结尾：${settings.hooks.cliffhanger ? '在结尾处制造强悬念（卡点）' : '保持原结尾'}。
    
    原文：
    ${props.currentContent}`
  } else if (type === 'visual_prompts') {
    resultTitle.value = 'AI 画面提示词生成'
    logicDescription = '提取视觉元素，生成 Midjourney/Stable Diffusion 提示词'
    prompt = `请根据以下文本生成【AI 绘画提示词】。
    要求：
    1. 提取关键画面信息：主体、环境、光影、镜头角度、艺术风格。
    2. 格式：英文提示词，逗号分隔。
    3. 每个场景生成一组提示词。
    
    原文：
    ${props.currentContent}`
  } else if (type === 'script_format') {
    resultTitle.value = '分镜脚本生成'
    logicDescription = '将文本转换为包含镜号、画面、旁白、时长的表格格式'
    prompt = `请将以下文本转换为【AI 视频分镜脚本】。
    要求：
    1. 输出为 Markdown 表格。
    2. 列包含：镜号、画面描述(Visual)、旁白/台词(Audio)、预估时长。
    3. 画面描述需包含具体的镜头语言（如特写、全景）。
    
    原文：
    ${props.currentContent}`
  }

  // Call LLM (Simulated)
  streamLLMResponse(prompt, (chunk) => {
    optimizationResult.value += chunk
  }, () => {
    isProcessing.value = false
    resultLogic.value = logicDescription
  })
}

const applyResult = () => {
  emit('apply-optimization', optimizationResult.value)
  showResultDialog.value = false
}
</script>

<style scoped>
/* Scrollbar styles matching the app */
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

:deep(.dark-dialog) {
  background-color: #1e293b;
  border: 1px solid #334155;
}
:deep(.dark-dialog .el-dialog__title) {
  color: #f1f5f9;
}

:deep(.dreamy-dialog) {
  background-color: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  border-radius: 16px;
}
:deep(.dreamy-dialog .el-dialog__title) {
  color: #334155; /* Slate 700 */
}
:deep(.dreamy-dialog .el-dialog__body) {
  padding-top: 10px;
}
</style>
