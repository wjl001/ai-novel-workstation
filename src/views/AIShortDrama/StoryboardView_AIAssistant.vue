<template>
  <div v-if="visible" class="floating-button" :style="buttonPosition" @mousedown="startDrag">
    <el-tooltip content="AI助手" placement="left">
      <el-button type="primary" :icon="ChatDotRound" circle @click="dialogVisible = true" />
    </el-tooltip>
  </div>

  <el-dialog
    v-model="dialogVisible"
    :show-close="false"
    :close-on-click-modal="false"
    :append-to-body="true"
    destroy-on-close
    width="600px"
    class="ai-assistant-dialog"
  >
    <template #header="{ close }">
      <div class="flex justify-between items-center pr-4">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white">AI分镜助手</h3>
        <el-button type="danger" :icon="Close" circle @click="close" />
      </div>
    </template>

    <div class="flex flex-col h-[70vh]">
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
          >
            {{ msg.content }}
          </div>
          <div
            v-else-if="msg.role === 'assistant'"
            class="max-w-[80%] rounded-xl px-4 py-3 text-sm shadow-md bg-white text-gray-800 dark:bg-slate-700 dark:text-white"
            :class="{'rounded-tl-none': !msg.aiAction}"
          >
            <div v-if="msg.aiAction" class="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">
              {{ msg.aiAction }}
            </div>
            {{ msg.content }}
          </div>
          <div
            v-else-if="msg.role === 'system'"
            class="max-w-[80%] rounded-xl px-4 py-3 text-sm shadow-md bg-blue-50 dark:bg-blue-950 text-gray-800 dark:text-gray-100"
            :class="{'rounded-tl-none': !msg.aiAction}"
          >
            <div v-if="msg.aiAction" class="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">
              {{ msg.aiAction }}
            </div>
            {{ msg.content }}
          </div>
        </div>
        <!-- AI Proposal / Comparison Card -->
        <el-card v-if="aiProposal.visible" class="ai-proposal-card mt-4 shadow-lg border-none">
          <!-- First line: AI建议的内容和指令 -->
          <div class="mb-3 text-sm text-gray-700 dark:text-gray-300">
            <span class="font-bold text-indigo-600 dark:text-indigo-400">AI 建议:</span> {{ aiProposal.instruction }}
          </div>

          <!-- Second line: 引用的原文，如果文字多后面的省略号 -->
          <div
            v-if="aiProposal.original"
            class="mb-4 p-2 bg-gray-100 dark:bg-slate-800 rounded-md text-sm text-gray-700 dark:text-gray-300 overflow-hidden whitespace-nowrap text-overflow-ellipsis"
          >
            <span class="font-bold text-blue-600 dark:text-blue-400">引用原文:</span> {{ aiProposal.original }}
          </div>

          <!-- Third line: AI助手优化过的内容 (directly displayed) -->
          <div class="mb-3 text-sm text-gray-700 dark:text-gray-300">
            <span class="font-bold text-indigo-600 dark:text-indigo-400">AI 处理方案:</span>
          </div>
          <div class="p-2 bg-blue-50 dark:bg-blue-950 rounded-md text-sm text-gray-800 dark:text-gray-100">
            {{ aiProposal.modified }}
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
        <p class="whitespace-pre-wrap">{{ referencedContent }}</p>
      </div>

      <!-- Quick Prompts -->
      <div class="mb-4 flex flex-wrap gap-2">
        <el-button
          v-for="(instruction, idx) in aiInstructions"
          :key="idx"
          round
          class="transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
          @click="setQuickPrompt(instruction)"
        >
          {{ instruction.tag }}
        </el-button>
      </div>

      <!-- Message Input Area -->
      <div class="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-slate-800 rounded-lg shadow-inner">
        <el-input
          v-model="chatInput"
          :rows="1"
          type="textarea"
          placeholder="给AI一些指令，例如：生成场景描述"
          autosize
          @keyup.enter.prevent="sendMessage"
          class="flex-1"
        />
        <el-button type="primary" :icon="Promotion" circle @click="sendMessage" :disabled="!chatInput.trim()" />
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick, computed } from 'vue'
import { ElButton, ElDialog, ElInput, ElMessage, ElTooltip, ElCard } from 'element-plus'
import { ChatDotRound, Promotion, Close, Document } from '@element-plus/icons-vue'
import { useDraggable } from '@vueuse/core'

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
  initialValue: { x: window.innerWidth - 80, y: 100 },
})

const buttonPosition = computed(() => ({
  left: `${x.value}px`,
  top: `${y.value}px`,
  cursor: isDragging.value ? 'grabbing' : 'grab',
}))

const startDrag = (event: MouseEvent) => {
  if (event.target && (event.target as HTMLElement).closest('.el-button')) {
    // If click originated from the button itself, don't start drag
    return;
  }
  isDragging.value = true;
};

const aiProposal = reactive<AIProposal>({
  visible: false,
  original: '',
  modified: '',
  activeTab: 'original',
  instruction: ''
})

const aiInstructions: AIInstruction[] = [
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
    } else {
      referencedContent.value = null // Clear if no new content
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
  if (!message) {
    return
  }

  // If there's referenced content, add it to chat history first, then clear it
  if (referencedContent.value) {
    chatHistory.push({
      role: 'system', // or 'user' based on desired appearance
      content: referencedContent.value,
      aiAction: '引用剧本内容' // Tag for referenced content in chat history
    })
    referencedContent.value = null // Clear the temporary display
  }

  chatHistory.push({ role: 'user', content: message })
  chatInput.value = ''
  aiProposal.visible = false // Hide previous proposal

  // Simulate AI response
  const assistantMessage: ChatMessage = {
    role: 'assistant',
    content: '正在思考中...',
    aiAction: 'AI助手'
  }
  chatHistory.push(assistantMessage)
  scrollToBottom()

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const originalContent = props.storyboardContent
  const aiGeneratedContent = `AI根据您的指令："${message}"，对内容进行了智能处理。这是处理后的结果。`;

  aiProposal.original = originalContent;
  aiProposal.modified = aiGeneratedContent;
  aiProposal.instruction = message;
  aiProposal.activeTab = 'modified'; // Show modified content by default
  aiProposal.visible = true;

  // Update the assistant's last message to indicate a proposal is ready
  chatHistory[chatHistory.length - 1] = {
    role: 'assistant',
    content: '已为您生成AI处理方案，请查看并采纳。',
    aiAction: '方案已就绪'
  }
  scrollToBottom()
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
    // Emit the modified content. The parent component should handle how to apply it.
    emit('apply-ai-content', {
      original: aiProposal.original,
      modified: aiProposal.modified,
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
  chatInput.value = instruction.command
  // Optionally, send the message immediately or let the user review/edit
  // sendMessage();
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
  // Use transform for smooth dragging and prevent layout reflows
  transition: transform 0.1s ease-out;
  &:active {
    cursor: grabbing;
  }
}

.ai-proposal-card {
  .el-card__body {
    padding: 20px !important; // Important to override default padding
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
</style>
