<template>
  <!-- Floating Action Button -->
  <button
    @click="openAiAssistant"
    class="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 z-[4000]"
  >
    <el-icon size="32" class="text-white drop-shadow-md transform group-hover:rotate-12 transition-transform duration-300">
      <ChatHeadRound />
    </el-icon>
  </button>

  <!-- AI Assistant Dialog -->
  <el-dialog
    title="AI 分镜助手"
    v-model="aiAssistantOpen"
    width="500px"
    append-to-body
    :close-on-click-modal="false"
  >
    <div class="flex flex-col h-[500px]">
      <!-- Chat Messages Area -->
      <div
        class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-white/50 dark:bg-slate-800/50 rounded-xl"
      >
        <div
          v-for="(msg, i) in chatHistory"
          :key="i"
          class="flex"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-[80%] rounded-lg px-3 py-2 text-sm"
            :class="msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-700 dark:text-slate-800'"
          >
            {{ msg.content }}
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="p-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
        <input
          v-model="chatInput"
          @keyup.enter="sendMessage"
          class="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
          placeholder="输入请求..."
        />
        <div class="flex gap-2 mt-2">
          <button
            @click="setQuickPrompt('润色文字')"
            class="px-3 py-1.5 rounded-full text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
          >
            润色文字
          </button>
          <button
            @click="setQuickPrompt('增加细节')"
            class="px-3 py-1.5 rounded-full text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
          >
            增加细节
          </button>
          <button
            @click="setQuickPrompt('缩短内容')"
            class="px-3 py-1.5 rounded-full text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
          >
            缩短内容
          </button>
          <button
            @click="clearChatHistory"
            class="ml-auto px-3 py-1.5 rounded-full text-xs bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all text-red-600 dark:text-red-400"
          >
            清空
          </button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage, ElDialog } from 'element-plus';
import { ChatRound } from '@element-plus/icons-vue';

// State
const aiAssistantOpen = ref(false);
const chatInput = ref('');
const chatHistory = ref<{ content: string; role: string }[]>([]);

// Functions
const openAiAssistant = () => {
  aiAssistantOpen.value = true;
  if (chatHistory.value.length === 0) {
    chatHistory.value.push({
      content: '你好！我是AI分镜助手，我可以帮你润色、修改和优化分镜脚本。',
      role: 'assistant'
    });
  }
};

const closeAiAssistant = () => {
  aiAssistantOpen.value = false;
};

const sendMessage = () => {
  const input = chatInput.value.trim();
  if (!input) return;

  // Add user message
  chatHistory.value.push({ content: input, role: 'user' });
  chatInput.value = '';

  // Simulate AI response (connect to real API later)
  setTimeout(() => {
    let response = '收到你的请求："' + input + '"。在真实集成中，这里会调用AI模型来处理你的分镜脚本修改建议。';
    chatHistory.value.push({ content: response, role: 'assistant' });
  }, 500);
};

const setQuickPrompt = (prompt: string) => {
  chatInput.value = prompt;
  sendMessage();
};

const clearChatHistory = () => {
  chatHistory.value = [];
  ElMessage.info('聊天记录已清空');
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(99, 102, 241, 0.3);
  border-radius: 3px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(99, 102, 241, 0.5);
}
</style>