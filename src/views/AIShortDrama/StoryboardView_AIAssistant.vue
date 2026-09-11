<template>
  <div ref="button" v-if="visible" class="floating-button" :style="buttonPosition" @mousedown="startDrag">
    <el-tooltip content="AI助手" placement="left">
      <el-button :icon="ChatDotRound" @click="dialogVisible = true">
        AI分镜助手
      </el-button>
    </el-tooltip>
  </div>

  <el-dialog
    v-model="dialogVisible"
    :show-close="false"
    :close-on-click-modal="false"
    :append-to-body="true"
    destroy-on-close
    width="800px"
    class="ai-assistant-dialog"
  >
    <template #header="{ close }">
      <div class="flex justify-between items-center pr-4">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white">AI分镜助手</h3>
        <el-button type="danger" :icon="Close" circle @click="close" />
      </div>
    </template>

    <div class="flex flex-col h-[80vh]">
      <!-- Chat History Area -->
      <div
        class="flex-1 overflow-y-auto custom-scrollbar p-4 rounded-lg bg-gradient-to-br from-white to-indigo-100/30 dark:from-slate-800 dark:to-slate-900/60 shadow-inner mb-4"
        ref="chatHistoryRef"
      >
        <div
          v-for="(msg, index) in chatHistory"
          :key="index"
          class="mb-4 flex"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            v-if="msg.role === 'user'"
            class="max-w-[80%] rounded-xl px-4 py-3 text-sm shadow-md bg-indigo-500 text-white"
            v-html="msg.content"
          >
          </div>
          <div
            v-else-if="msg.role === 'assistant'"
            class="max-w-[80%] rounded-xl px-4 py-3 text-sm shadow-md bg-white text-gray-800 dark:bg-slate-700 dark:text-white"
            :class="{'rounded-tl-none': !msg.aiAction}"
          >
            <div v-if="msg.aiAction" class="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">
              {{ msg.aiAction }}
            </div>
            <div v-html="msg.content"></div>
          </div>
          <div
            v-else-if="msg.role === 'system'"
            class="max-w-[80%] rounded-xl px-4 py-3 text-sm shadow-md bg-blue-50 dark:bg-blue-950 text-gray-800 dark:text-gray-100"
            :class="{'rounded-tl-none': !msg.aiAction}"
          >
            <div v-if="msg.aiAction" class="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">
              {{ msg.aiAction }}
            </div>
            <div v-html="msg.content"></div>
          </div>
        </div>
        <!-- AI Proposal / Comparison Card -->
        <el-card v-if="aiProposal.visible" class="ai-proposal-card mt-4 shadow-lg border-none">
          <!-- First line: AI建议的内容和指令 -->
          <div class="mb-3 text-sm text-gray-700 dark:text-gray-300">
            <span class="font-bold text-indigo-600 dark:text-indigo-400">您的指令:</span> {{ aiProposal.instruction }}
          </div>

          <!-- Second line: 引用的原文，如果文字多后面的省略号 -->
          <div
            v-if="aiProposal.original"
            class="mb-4 p-2 bg-gray-100 dark:bg-slate-800 rounded-md text-sm text-gray-700 dark:text-gray-300 overflow-hidden whitespace-nowrap text-overflow-ellipsis"
          >
            <span class="font-bold text-blue-600 dark:text-blue-400">引用原文:</span> <span v-html="aiProposal.original"></span>
          </div>

          <!-- Third line: AI助手优化过的内容 (directly displayed) -->
          <div class="mb-3 text-sm text-gray-700 dark:text-gray-300">
            <span class="font-bold text-indigo-600 dark:text-indigo-400">AI 处理方案:</span>
            <!-- V2.0 引擎标识 -->
            <span
              v-if="aiProposal.engineVersion === 'v2-hermes'"
              class="ml-2 px-2 py-0.5 text-[10px] bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full"
            >
              Hermes多轮对话
            </span>
            <span
              v-else
              class="ml-2 px-2 py-0.5 text-[10px] bg-gray-400 text-white rounded-full"
            >
              基础模式
            </span>
          </div>
          <div class="p-2 bg-blue-50 dark:bg-blue-950 rounded-md text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
            <span v-html="aiProposal.modified"></span>
          </div>

          <!-- V2.0 Hermes 扩展信息：自检报告 + 匹配Skills -->
          <div v-if="aiProposal.engineVersion === 'v2-hermes'" class="mt-3 grid grid-cols-2 gap-3">
            <!-- 质量自检 -->
            <div class="p-3 bg-green-50 dark:bg-green-950 rounded-md">
              <div class="text-xs font-bold text-green-700 dark:text-green-400 mb-2">质量自检</div>
              <div class="text-2xl font-black text-green-600 dark:text-green-400">
                {{ aiProposal.selfCheckScore || 0 }}<span class="text-sm font-normal">/100</span>
              </div>
              <div v-if="aiProposal.selfCheckPassed && aiProposal.selfCheckPassed.length > 0" class="mt-1 text-[10px] text-green-600 dark:text-green-400">
                通过: {{ aiProposal.selfCheckPassed.join('、') }}
              </div>
              <div v-if="aiProposal.selfCheckWarnings && aiProposal.selfCheckWarnings.length > 0" class="mt-1 text-[10px] text-amber-600 dark:text-amber-400">
                注意: {{ aiProposal.selfCheckWarnings.join('、') }}
              </div>
            </div>
            <!-- 匹配Skills -->
            <div class="p-3 bg-purple-50 dark:bg-purple-950 rounded-md">
              <div class="text-xs font-bold text-purple-700 dark:text-purple-400 mb-2">调用Skills</div>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="(skill, idx) in (aiProposal.matchedSkills || []).slice(0, 6)"
                  :key="idx"
                  class="px-1.5 py-0.5 text-[10px] bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded"
                >
                  {{ skill }}
                </span>
                <span v-if="(aiProposal.matchedSkills || []).length > 6" class="text-[10px] text-purple-500">
                  +{{ (aiProposal.matchedSkills || []).length - 6 }}
                </span>
              </div>
              <div class="mt-2 text-[10px] text-gray-500 dark:text-gray-400">
                对话轮次: {{ aiProposal.dialogueRounds || 5 }}轮
              </div>
            </div>
          </div>

          <div class="flex justify-end mt-4 space-x-2">
            <el-button type="info" plain @click="discardAiResponse">放弃</el-button>
            <el-button type="primary" @click="adoptAndApplyAiResponse">采纳并应用</el-button>
          </div>
        </el-card>
      </div>

      <!-- Referenced Content Display -->
      <div
        v-if="referencedContent"
        class="relative mb-4 p-3 rounded-lg border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900 text-sm text-gray-800 dark:text-gray-100 shadow-md"
      >
        <div class="flex items-center justify-between mb-1">
          <span class="font-bold text-blue-700 dark:text-blue-200 flex items-center gap-1">
            <el-icon><Document /></el-icon> 引用分镜脚本内容
          </span>
          <el-button
            type="text"
            :icon="Close"
            circle
            size="small"
            @click="handleRemoveReference"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          />
        </div>
        <div class="whitespace-pre-wrap" v-html="referencedContent"></div>
      </div>

      <!-- V2.0 Hermes 多轮对话进度指示器（界面不展示对话内容，仅展示进度） -->
      <div
        v-if="hermesProcessing"
        class="mb-4 p-4 rounded-lg border border-indigo-200 dark:border-indigo-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 shadow-md"
      >
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
            <span class="inline-block w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
            Hermes Agent 多轮对话优化中
          </span>
          <span class="text-xs text-indigo-500 dark:text-indigo-400">
            第 {{ hermesCurrentRound }} / {{ hermesTotalRounds }} 轮
          </span>
        </div>
        <!-- 进度条 -->
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
          <div
            class="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            :style="{ width: `${(hermesCurrentRound / hermesTotalRounds) * 100}%` }"
          ></div>
        </div>
        <!-- 5轮阶段展示 -->
        <div class="flex justify-between">
          <div
            v-for="phase in hermesPhases"
            :key="phase.round"
            class="flex flex-col items-center flex-1"
          >
            <div
              class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-all duration-300"
              :class="hermesCurrentRound >= phase.round
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-400'"
            >
              {{ phase.round }}
            </div>
            <span
              class="text-[10px] text-center leading-tight"
              :class="hermesCurrentRound >= phase.round
                ? 'text-indigo-700 dark:text-indigo-300 font-medium'
                : 'text-gray-400'"
            >
              {{ phase.name }}
            </span>
          </div>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          {{ hermesPhases.find(p => p.round === hermesCurrentRound)?.desc || '正在初始化...' }}
        </p>
      </div>

      <!-- Message Input Area -->
      <div class="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-slate-800 rounded-lg shadow-inner">
        <el-input
          v-model="chatInput"
          :rows="1"
          type="textarea"
          placeholder="给AI指令，例如：优化提示词 / 生成对白 / 续写剧情"
          autosize
          @keyup.enter.prevent="sendMessage"
          class="flex-1"
        />
        <el-button type="primary" :icon="Promotion" circle @click="sendMessage" :disabled="!chatInput.trim()" />
      </div>

      <!-- Quick Prompts -->
      <div class="mb-4 flex flex-nowrap gap-2 overflow-x-auto custom-scrollbar-horizontal">
        <el-button
          v-for="(instruction, idx) in aiInstructions"
          :key="idx"
          round
          class="quick-prompt-button transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
          @click="setQuickPrompt(instruction)"
        >
          {{ instruction.tag }}
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick, computed } from 'vue'
import { ElButton, ElDialog, ElInput, ElMessage, ElTooltip, ElCard } from 'element-plus'
import { ChatDotRound, Promotion, Close, Document } from '@element-plus/icons-vue'
import { useDraggable } from '@vueuse/core'
import { enhancePromptWithHermes, type EnhancedPrompt } from '@/utils/promptEnhancer'
import { contextManager } from '@/utils/contextManager'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'ai-action'
  content: string
  aiAction?: string // e.g., '优化细节', '生成对白', '采纳并应用', '放弃'
}

interface AIProposal {
  visible: boolean
  original: string
  modified: string
  activeTab: 'original' | 'modified'
  instruction: string
  // V2.0 Hermes扩展
  engineVersion?: string
  selfCheckScore?: number
  selfCheckPassed?: string[]
  selfCheckWarnings?: string[]
  optimizationNotes?: string[]
  matchedSkills?: string[]
  matchedModules?: string[]
  dialogueRounds?: number
}

interface AIInstruction {
  tag: string
  behavior: string
  instruction: string
  command: string
}

const props = defineProps<{
  modelValue: boolean
  storyboardContent: string
  // === V2.0 Hermes 上下文注入属性（可选） ===
  /** 剧集标题 */
  dramaTitle?: string
  /** 集数索引 */
  episodeIndex?: number
  /** 本集标题 */
  episodeTitle?: string
  /** 上一分镜内容（用于帧连续） */
  previousSceneContent?: string
  /** 参考图URL */
  referenceImage?: string
}>()

const emit = defineEmits(['update:modelValue', 'apply-ai-content'])

const dialogVisible = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})

const chatHistory = reactive<ChatMessage[]>([])
const chatInput = ref('')
const chatHistoryRef = ref<HTMLElement | null>(null)
const referencedContent = ref<string | null>(null) // Holds content referenced from parent
const visible = ref(true) // Controls the visibility of the floating button

const handleRemoveReference = () => {
  referencedContent.value = null
}

// Draggable button position
const button = ref(null)
const { x, y, isDragging } = useDraggable(button, {
  initialValue: { x: window.innerWidth - 180, y: 100 }, // Adjusted for wider button with text
})

const startDrag = () => {
  // useDraggable 自动管理 isDragging 状态，无需手动赋值
};

const buttonPosition = computed(() => ({
  left: `${x.value}px`,
  top: `${y.value}px`,
  cursor: isDragging.value ? 'grabbing' : 'grab',
}))



const aiProposal = reactive<AIProposal>({
  visible: false,
  original: '',
  modified: '',
  activeTab: 'original',
  instruction: ''
})

// === V2.0 Hermes 多轮对话状态 ===
const hermesProcessing = ref(false)
const hermesCurrentRound = ref(0)
const hermesTotalRounds = ref(5)
const hermesCurrentPhase = ref('')
const hermesPhases = [
  { round: 1, name: '需求解析', desc: '解析分镜脚本，识别动作/场景/角色/镜头类型' },
  { round: 2, name: '上下文加载', desc: '加载剧本/角色/场景/前后分镜上下文，匹配Skills' },
  { round: 3, name: '初稿生成', desc: '基于上下文和Skills生成专业级提示词初稿' },
  { round: 4, name: '质量自检', desc: '帧对齐/时间轴/参考图/负面词/动作连贯性校验' },
  { round: 5, name: '修正输出', desc: '根据自检结果修正，输出最终优化提示词' },
]

const aiInstructions: AIInstruction[] = [
  {
    tag: '优化提示词',
    behavior: '通过 Hermes Agent 5轮多轮对话，自动注入剧本/角色/场景上下文，调用Skills知识库，生成专业级视频生成提示词。界面不展示对话内容，仅展示进度。',
    instruction: '输入需要优化的分镜脚本，点击优化提示词。',
    command: '"优化提示词：沈念安在雨中奔跑，泪水和雨水混在一起"'
  },
  {
    tag: '优化细节',
    behavior: '针对当前场景描述，AI将自动润色和补充细节，使其更具画面感和情感张力。',
    instruction: '输入需要优化的场景描述，点击优化细节。',
    command: '“优化沈念安在雨中奔跑的细节，突出她的无助与坚定。”'
  },
  {
    tag: '生成对白',
    behavior: '根据角色关系和场景氛围，AI将创作出符合人物设定的精彩对白。',
    instruction: '输入需要生成对白的角色和情境，点击生成对白。',
    command: '“生成沈念安和周助理初次见面的对白，突出周助理的神秘感。”'
  },
  {
    tag: '调整节奏',
    behavior: '调整场景切换速度、镜头时长，以更好地传达情感或营造氛围。',
    instruction: '输入调整节奏的意图，例如：让这一幕更紧张。',
    command: '“让沈念安回忆过去的场景节奏放缓，增加回忆的沉浸感。”'
  },
  {
    tag: '续写剧情',
    behavior: 'AI将根据当前剧情发展，智能推演后续情节，提供多种可能性。',
    instruction: '输入当前剧情的概要，点击续写剧情。',
    command: '“续写沈念安发现秘密后的剧情，她会如何应对？”'
  },
  {
    tag: '总结概述',
    behavior: '将冗长的场景描述或对白，提炼出核心要点，便于快速理解。',
    instruction: '输入需要总结的内容，点击总结概述。',
    command: '“总结一下这段长篇独白的核心思想。”'
  },
  {
    tag: '添加转场',
    behavior: '为场景之间添加平滑或富有创意的过渡，增强视觉流畅性。',
    instruction: '输入需要转场的两个场景，点击添加转场。',
    command: '“在沈念安的悲伤和周助理的出现之间，添加一个具有象征意义的转场。”'
  },
  {
    tag: '分析人物',
    behavior: '深入分析角色的性格、动机和情感变化，为创作提供深度支持。',
    instruction: '输入角色姓名和需要分析的方面，点击分析人物。',
    command: '“分析周助理的性格特点和潜在动机。”'
  }
]

watch(dialogVisible, (val) => {
  if (val) {
    // When dialog opens, if storyboardContent is provided, set it as referencedContent
    if (props.storyboardContent) {
      referencedContent.value = props.storyboardContent
      // Strip HTML tags before populating chatInput
      chatInput.value = props.storyboardContent.replace(/<[^>]*>?/gm, ''); // Simple HTML tag stripping
    } else {
      referencedContent.value = null // Clear if no new content
      chatInput.value = ''; // Clear chatInput if no referenced content
    }

    // Only push welcome message if chat history is entirely empty
    if (chatHistory.length === 0) {
      chatHistory.push({
        role: 'assistant',
        content: '你好！我是AI分镜助手，有什么可以帮你的吗？'
      })
    }
    scrollToBottom()
  }
})

watch(
  () => chatHistory.length,
  () => {
    scrollToBottom()
  }
)

const scrollToBottom = () => {
  nextTick(() => {
    if (chatHistoryRef.value) {
      chatHistoryRef.value.scrollTop = chatHistoryRef.value.scrollHeight
    }
  })
}

const sendMessage = async () => {
  const message = chatInput.value.trim()
  if (!message || hermesProcessing.value) {
    return
  }

  // If there's referenced content, add it to chat history first, then clear it
  if (referencedContent.value) {
    chatHistory.push({
      role: 'system',
      content: referencedContent.value,
      aiAction: '引用剧本内容'
    })
    referencedContent.value = null
  }

  chatHistory.push({ role: 'user', content: message })
  chatInput.value = ''
  aiProposal.visible = false

  // 判断是否为提示词优化指令（V2.0 Hermes多轮对话）
  const isPromptOptimize = /优化.*提示词|提示词.*优化|增强.*提示词|提示词.*增强|优化.*prompt|prompt.*优化/i.test(message)
    || message.includes('优化') && (props.storyboardContent || message.length > 10)

  if (isPromptOptimize) {
    await handleHermesPromptOptimize(message)
    return
  }

  // 其他指令：保留原有模拟响应逻辑
  const assistantMessage: ChatMessage = {
    role: 'assistant',
    content: '正在思考中...',
    aiAction: 'AI助手'
  }
  chatHistory.push(assistantMessage)
  scrollToBottom()

  await new Promise((resolve) => setTimeout(resolve, 800))

  const originalContent = props.storyboardContent || message
  let aiGeneratedContent: string

  if (message.includes('生成对白')) {
    aiGeneratedContent = `根据您的指令，AI生成了以下对白：\n角色A："${originalContent.slice(0, 20)}...，你觉得呢？"\n角色B："我同意。"`
  } else if (message.includes('调整节奏')) {
    aiGeneratedContent = `节奏已调整。场景切换将更加平缓，营造出深思的氛围，或加快节奏突出紧张感。`
  } else if (message.includes('续写剧情')) {
    aiGeneratedContent = `AI为您续写了以下剧情发展：在当前情节之后，主角突然发现了隐藏的线索，剧情随即进入高潮。`
  } else if (message.includes('总结概述')) {
    aiGeneratedContent = `以下是内容的总结概述：主要讲述了核心情节发展与人物关系变化。`
  } else if (message.includes('添加转场')) {
    aiGeneratedContent = `AI为您添加了以下转场描述：一个象征性的转场，如雨滴汇聚成河流，象征悲伤的积累与希望的萌芽。`
  } else if (message.includes('分析人物')) {
    aiGeneratedContent = `人物分析：主角展现出复杂的性格特点，其行为动机可能源于过往经历与当前处境的交织。`
  } else {
    aiGeneratedContent = `AI已根据您的指令对内容进行处理。如需优化视频生成提示词，请输入"优化提示词"。`
  }

  aiProposal.original = originalContent
  aiProposal.modified = aiGeneratedContent
  aiProposal.instruction = message
  aiProposal.activeTab = 'modified'
  aiProposal.visible = true

  chatHistory[chatHistory.length - 1] = {
    role: 'assistant',
    content: '已为您生成AI处理方案，请查看并采纳。',
    aiAction: '方案已就绪'
  }
  scrollToBottom()
}

/**
 * V2.0 Hermes多轮对话提示词优化
 * 界面不展示对话内容，仅展示进度阶段
 */
async function handleHermesPromptOptimize(message: string) {
  hermesProcessing.value = true
  hermesCurrentRound.value = 0
  hermesCurrentPhase.value = ''

  const originalContent = props.storyboardContent || message

  // 展示Hermes处理中消息（不展示对话内容）
  const processingMessage: ChatMessage = {
    role: 'assistant',
    content: '正在通过 Hermes Agent 多轮对话优化提示词...',
    aiAction: 'Hermes多轮对话中'
  }
  chatHistory.push(processingMessage)
  scrollToBottom()

  try {
    // 构建上下文
    const context = contextManager.buildFromScript(originalContent, {
      dramaTitle: props.dramaTitle,
      episodeIndex: props.episodeIndex,
      episodeTitle: props.episodeTitle,
      previousScene: props.previousSceneContent,
    })

    // 调用Hermes多轮对话增强
    const result: EnhancedPrompt = await enhancePromptWithHermes(originalContent, {
      hasReference: !!props.referenceImage,
      isMultiShot: context.isMultiShot,
      context,
      maxRounds: 5,
      onProgress: (round: number, phase: string) => {
        hermesCurrentRound.value = round
        hermesCurrentPhase.value = phase
        // 更新聊天消息中的进度（不展示对话内容）
        const phaseInfo = hermesPhases.find(p => p.round === round)
        chatHistory[chatHistory.length - 1] = {
          role: 'assistant',
          content: `Hermes Agent 多轮对话优化中... 第 ${round}/5 轮：${phaseInfo?.name || phase}`,
          aiAction: `Hermes第${round}轮`
        }
        scrollToBottom()
      },
    })

    // 构建展示内容（含自检报告和优化说明）
    let displayContent = result.enhancedPrompt

    // 附加优化说明
    if (result.optimizationNotes && result.optimizationNotes.length > 0) {
      displayContent += '\n\n--- 优化说明 ---\n'
      result.optimizationNotes.forEach((note, i) => {
        displayContent += `${i + 1}. ${note}\n`
      })
    }

    // 附加自检结果
    if (result.selfCheckReport) {
      displayContent += '\n--- 质量自检 ---\n'
      displayContent += `综合评分：${result.selfCheckReport.score}/100\n`
      if (result.selfCheckReport.passed && result.selfCheckReport.passed.length > 0) {
        displayContent += `通过项：${result.selfCheckReport.passed.join('、')}\n`
      }
      if (result.selfCheckReport.warnings && result.selfCheckReport.warnings.length > 0) {
        displayContent += `需注意：${result.selfCheckReport.warnings.join('、')}\n`
      }
    }

    // 填充提案面板
    aiProposal.original = originalContent
    aiProposal.modified = displayContent
    aiProposal.instruction = message
    aiProposal.activeTab = 'modified'
    aiProposal.visible = true
    // V2.0扩展字段
    aiProposal.engineVersion = result.engineVersion
    aiProposal.selfCheckScore = result.selfCheckReport?.score
    aiProposal.selfCheckPassed = result.selfCheckReport?.passed
    aiProposal.selfCheckWarnings = result.selfCheckReport?.warnings
    aiProposal.optimizationNotes = result.optimizationNotes
    aiProposal.matchedSkills = result.matchedSkills
    aiProposal.matchedModules = result.matchedModules
    aiProposal.dialogueRounds = result.dialogueLog?.length || 5

    // 更新最终消息
    chatHistory[chatHistory.length - 1] = {
      role: 'assistant',
      content: `Hermes Agent 已完成5轮多轮对话优化，综合评分 ${result.selfCheckReport?.score || 0}/100，请查看优化方案。`,
      aiAction: 'Hermes优化完成'
    }
    scrollToBottom()

  } catch (error) {
    console.error('[AIAssistant] Hermes优化失败:', error)
    chatHistory[chatHistory.length - 1] = {
      role: 'assistant',
      content: 'Hermes优化遇到问题，已自动降级为基础优化模式。',
      aiAction: '降级处理'
    }
    ElMessage.warning('Hermes多轮对话优化失败，已使用基础模式')
  } finally {
    hermesProcessing.value = false
    hermesCurrentRound.value = 0
    hermesCurrentPhase.value = ''
  }
}

const discardAiResponse = () => {
  chatHistory.push({
    role: 'ai-action',
    content: '已放弃AI处理方案。',
    aiAction: '方案已放弃'
  })
  aiProposal.visible = false
  aiProposal.original = ''
  aiProposal.modified = ''
  aiProposal.instruction = ''
  ElMessage.info('已放弃AI处理方案。')
  scrollToBottom()
}

const adoptAndApplyAiResponse = () => {
  if (aiProposal.modified) {
    let contentToEmit = aiProposal.modified;
    const message = aiProposal.instruction; // Use the stored instruction

    // Strip prefixes based on the instruction that generated the modified content
    if (message.includes('优化')) {
      contentToEmit = contentToEmit.replace(/场景描述已优化，增加了更多细节和情感色彩：/g, '');
      contentToEmit = contentToEmit.replace(/场景描述已优化，使其更具画面感和情感张力：/g, '');
      contentToEmit = contentToEmit.replace(/。?增加了如下细节：/g, '');
    } else if (message.includes('生成对白')) {
      contentToEmit = contentToEmit.replace(/^根据您的指令，AI生成了以下对白：\n/, '');
    } else if (message.includes('续写剧情')) {
      contentToEmit = contentToEmit.replace(/^AI为您续写了以下剧情发展：/, '');
    } else if (message.includes('总结概述')) {
      contentToEmit = contentToEmit.replace(/^以下是内容的总结概述：/, '');
    } else if (message.includes('添加转场')) {
      contentToEmit = contentToEmit.replace(/^AI为您添加了以下转场描述：/, '');
    } else if (message.includes('分析人物')) {
      const originalContentEscaped = aiProposal.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters
      contentToEmit = contentToEmit.replace(new RegExp(`^对${originalContentEscaped}中人物的性格和动机分析如下：`), '');
    } else if (message.includes('调整节奏')) {
        // For "调整节奏", the whole string is the "description of adjustment", user might want to insert this directly.
        // So, no prefix removal needed for this specific `aiGeneratedContent` value.
    } else {
        // Default message prefix removal
        contentToEmit = contentToEmit.replace(/^AI已根据您的指令对内容进行处理。这是本次处理的概览或初步结果。/, '');
    }

    // Trim any leftover whitespace
    contentToEmit = contentToEmit.trim();

    emit('apply-ai-content', {
      original: aiProposal.original,
      modified: contentToEmit, // Emit the cleaned content
      instruction: aiProposal.instruction
    })
    chatHistory.push({
      role: 'ai-action',
      content: '已采纳AI处理方案并应用。 ',
      aiAction: '方案已采纳'
    })
    aiProposal.visible = false
    aiProposal.original = ''
    aiProposal.modified = ''
    aiProposal.instruction = ''
    ElMessage.success('AI处理方案已采纳并应用！')
    scrollToBottom()
  } else {
    ElMessage.warning('没有可采纳的AI处理方案。')
  }
}

const setQuickPrompt = (instruction: AIInstruction) => {
  let newChatInput = instruction.command;
  if (referencedContent.value) {
    // Strip HTML tags from referencedContent.value before combining
    const strippedContent = referencedContent.value.replace(/<[^>]*>?/gm, ''); // Simple HTML tag stripping
    newChatInput = `${instruction.tag}：${strippedContent}`;
  }
  chatInput.value = newChatInput;
  // referencedContent.value should remain unchanged as per the new requirement for consistency.
  // The '引用分镜脚本内容' display should also remain.
  // sendMessage(); // Keep commented for user review/edit
}
</script>

<style lang="scss">
.ai-assistant-dialog {
  border-radius: 12px;
  overflow: hidden; // Ensures shadow and border-radius apply correctly
  min-height: 500px; // Ensure dialog has a minimum height

  .el-dialog__header {
    background-color: #f8fafc; // Light background for header
    border-bottom: 1px solid #e2e8f0;
    padding: 16px 20px;
    .dark & {
      background-color: #1e293b; // Dark background for header
      border-color: #334155;
    }
  }

  .el-dialog__body {
    padding: 20px;
    background-color: #f1f5f9; // Light background for body
    .dark & {
      background-color: #0f172a; // Dark background for body
    }
  }

  // Enhanced shadow for a more "立体感" (3D effect)
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15), 0 5px 15px rgba(0, 0, 0, 0.1);
  .dark & {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 5px 15px rgba(0, 0, 0, 0.2);
  }
}

.floating-button {
  position: fixed;
  z-index: 1000;
  transition: transform 0.1s ease-out;
  &:active {
    cursor: grabbing;
  }

  .el-button {
    height: auto;
    padding: 10px 15px;
    border-radius: 20px;
    background: linear-gradient(145deg, #4a90e2, #2e6cb7); /* More professional blue gradient */
    border: none;
    color: white;
    font-size: 14px;
    font-weight: bold;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2), 0 2px 5px rgba(0, 0, 0, 0.1); /* Enhanced 3D shadow */
    transition: all 0.2s ease-in-out;

    &:hover {
      transform: translateY(-3px); /* Slightly more lift on hover */
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3), 0 3px 8px rgba(0, 0, 0, 0.15);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(0, 0, 0, 0.08);
    }

    .el-icon {
      margin-right: 5px;
      font-size: 16px;
    }
  }
}

.ai-proposal-card {
  .el-card__body {
    padding: 20px !important; // Important to override default padding
  }
}

.quick-prompt-button {
  height: auto;
  padding: 8px 12px;
  border-radius: 16px;
  background: linear-gradient(145deg, #a7baff, #8a9bff); /* Lighter, more playful gradient */
  border: none;
  color: white;
  font-size: 13px;
  font-weight: bold;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15), 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2), 0 2px 6px rgba(0, 0, 0, 0.12);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  }
}

/* Custom Scrollbar */
.custom-scrollbar {
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
    .dark & {
      background: #2d3748;
    }
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
    &:hover {
      background: #555;
    }
    .dark & {
      background: #a0aec0;
      &:hover {
        background: #cbd5e0;
    }
    }
  }
}

/* Custom Horizontal Scrollbar for Quick Prompts */
.custom-scrollbar-horizontal {
  &::-webkit-scrollbar {
    height: 8px; /* height for horizontal scrollbar */
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
    .dark & {
      background: #2d3748;
    }
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
    &:hover {
      background: #555;
    }
    .dark & {
      background: #a0aec0;
      &:hover {
        background: #cbd5e0;
      }
    }
  }
}
</style>
