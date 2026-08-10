<template>
  <section class="chat-area flex-1 flex flex-col rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
    <div class="messages flex-1 p-4 overflow-y-auto flex flex-col gap-3" ref="messagesContainer">
      <div v-for="(message, index) in messages" :key="index" :class="['message', message.sender === 'ai' ? 'ai-message' : 'user-message']">
        <p>{{ message.text }}</p>
      </div>
    </div>
    <div class="input-area flex p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700">
      <input type="text" placeholder="输入您的回答或指令..." v-model="userInput" @keyup.enter="sendMessage" class="flex-1 border border-slate-300 dark:border-slate-600 rounded-full px-4 py-2 bg-white dark:bg-slate-600 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
      <button @click="sendMessage" class="ml-3 px-6 py-2 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-colors">发送</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';

interface Message {
  text: string;
  sender: 'ai' | 'user';
}

const messages = ref<Message[]>([
  { text: '您好！我是您的AI短视频创作助手。我们今天想创作什么类型的短视频呢？', sender: 'ai' },
]);
const userInput = ref('');
const messagesContainer = ref<HTMLElement | null>(null); // Ref for the messages container

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const sendMessage = async () => {
  if (userInput.value.trim()) {
    const userMessageText = userInput.value;
    messages.value.push({ text: userMessageText, sender: 'user' });
    userInput.value = '';
    scrollToBottom();

    // Simulate API call to backend for AI response
    try {
      const aiResponseText = await mockApiCall(userMessageText);
      messages.value.push({ text: aiResponseText, sender: 'ai' });
    } catch (error) {
      console.error("Error simulating AI response:", error);
      messages.value.push({ text: "抱歉，AI助手暂时无法响应，请稍后再试。", sender: 'ai' });
    }
    scrollToBottom();
  }
};

// Mock API call function
const mockApiCall = (message: string): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let response = '好的，我明白了。请问您有什么具体的情节或者想表达的主题吗？';
      if (message.includes('未来科技')) {
        response = '好的，未来科技短片！这是一个很棒的主题。您希望视频的风格是写实、赛博朋克还是其他？';
      } else if (message.includes('电影')) {
        response = '电影主题很有趣。您有偏好的电影类型或故事情节吗？';
      } else if (message.includes('赛博朋克')) {
        response = '赛博朋克风格很酷！我会为您生成一些相关的视觉元素和音乐建议。您对主角有什么想法吗？';
      }
      resolve(response);
    }, 800);
  });
};

onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
/* Styling for AIChatCreation.vue - adapted from original index.vue */
.chat-area {
  /* flex-1; flex; flex-col; rounded-xl; shadow-lg; border; bg-white; dark:bg-slate-800; */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.messages {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem; /* 12px */
}

.message {
  max-width: 70%;
  padding: 0.75rem 1rem; /* 12px 16px */
  border-radius: 1.25rem; /* 20px */
  line-height: 1.6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

.ai-message {
  align-self: flex-start;
  background-color: #e6f7ff; /* Light blue */
  color: #262626;
  border-bottom-left-radius: 0.3125rem; /* 5px */
}

.user-message {
  align-self: flex-end;
  background-color: #007bff; /* Primary blue */
  color: white;
  border-bottom-right-radius: 0.3125rem; /* 5px */
}

.input-area {
  display: flex;
  padding: 1rem;
  border-top: 1px solid #e2e8f0; /* slate-200 */
  background-color: #f8fafc; /* slate-50 */
}

.dark .input-area {
  border-top: 1px solid #334155; /* slate-700 */
  background-color: #1e293b; /* slate-700 */
}

.input-area input {
  flex: 1;
  border: 1px solid #cbd5e1; /* slate-300 */
  border-radius: 9999px; /* rounded-full */
  padding: 0.5rem 1rem; /* px-4 py-2 */
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease;
}

.dark .input-area input {
  border-color: #475569; /* slate-600 */
  background-color: #475569; /* slate-600 */
  color: #f1f5f9; /* white */
}

.input-area input:focus {
  border-color: #6366f1; /* indigo-500 */
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25); /* focus:ring-2 focus:ring-indigo-500 */
}

.input-area button {
  margin-left: 0.75rem; /* ml-3 */
  padding: 0.5rem 1.5rem; /* px-6 py-2 */
  background-color: #6366f1; /* indigo-600 */
  color: white;
  border: none;
  border-radius: 9999px; /* rounded-full */
  font-weight: 700; /* font-bold */
  transition: background-color 0.3s ease, transform 0.2s ease;
  cursor: pointer;
}

.input-area button:hover {
  background-color: #4f46e5; /* indigo-700 */
}

.input-area button:active {
  transform: translateY(1px); /* slight press effect */
}
</style>
