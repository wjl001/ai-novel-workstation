<template>
  <div class="short-video-creation-container">
    <header class="header">
      <h1>AI 短视频创作</h1>
      <p>通过对话和问答，轻松生成您的专属短视频。</p>
    </header>
    <main class="main-content">
      <div v-if="activeChannel === 'creation'" class="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col min-h-0 custom-scrollbar">
        <div class="max-w-4xl mx-auto w-full flex flex-col h-full">
          <h1 class="text-3xl font-black mb-4 text-slate-800 dark:text-white">AI 短视频创作</h1>
          <p class="text-lg text-slate-500 dark:text-slate-400 mb-6">通过对话和问答，轻松生成您的专属短视频。</p>

          <!-- Model and Aspect Ratio Selection -->
          <div class="flex items-center gap-4 mb-6 p-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <span class="font-bold text-slate-600 dark:text-slate-300">模型选择:</span>
            <el-select v-model="selectedVideoModel" placeholder="选择视频模型" class="flex-1 custom-select-v4">
              <el-option label="AI Video Model 1" value="video_model_1"></el-option>
              <el-option label="AI Video Model 2" value="video_model_2"></el-option>
            </el-select>
            <el-select v-model="selectedImageModel" placeholder="选择图片模型" class="flex-1 custom-select-v4">
              <el-option label="AI Image Model 1" value="image_model_1"></el-option>
              <el-option label="AI Image Model 2" value="image_model_2"></el-option>
            </el-select>
            <span class="font-bold text-slate-600 dark:text-slate-300">视频比例:</span>
            <el-select v-model="selectedAspectRatio" placeholder="选择比例" class="w-32 custom-select-v4">
              <el-option label="16:9" value="16:9"></el-option>
              <el-option label="9:16" value="9:16"></el-option>
              <el-option label="1:1" value="1:1"></el-option>
            </el-select>
          </div>

          <!-- Chat Area (from short-video-creation/index.vue) -->
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
        </div>
      </div>
    </main>
    <footer class="footer">
      <p>© 2026 AI短视频创作</p>
    </footer>
  </div>
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

<style scoped lang="scss">
.short-video-creation-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #f0f2f5 0%, #e0e5ec 100%);
  color: #333;

  .header {
    background: linear-gradient(45deg, #6a11cb 0%, #2575fc 100%);
    color: white;
    padding: 20px 40px;
    text-align: center;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    h1 {
      margin: 0;
      font-size: 2.5em;
      letter-spacing: 1px;
    }
    p {
      margin-top: 5px;
      font-size: 1.1em;
      opacity: 0.9;
    }
  }

  .main-content {
    flex: 1;
    display: flex;
    padding: 20px;
    gap: 20px;

    .sidebar {
      flex: 0 0 250px; /* 固定宽度 */
      background-color: rgba(255, 255, 255, 0.8);
      border-radius: 15px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15); /* Enhanced shadow */
      padding: 20px;
      display: flex;
      flex-direction: column;
      backdrop-filter: blur(10px); /* Glassmorphism effect */
      -webkit-backdrop-filter: blur(10px); /* For Safari */
      p {
        font-size: 1.3em;
        font-weight: bold;
        color: #007bff;
        margin-bottom: 15px;
        border-bottom: 2px solid #007bff;
        padding-bottom: 10px;
      }
      ul {
        list-style: none;
        padding: 0;
        li {
          padding: 10px 0;
          font-size: 1.05em;
          color: #555;
          cursor: pointer;
          transition: color 0.3s ease, transform 0.2s ease;
          &:hover {
            color: #0056b3;
            transform: translateX(5px);
          }
        }
      }
    }

    .chat-area {
      flex: 1;
      background-color: rgba(255, 255, 255, 0.8); /* Semi-transparent background */
      border-radius: 15px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15); /* Enhanced shadow */
      display: flex;
      flex-direction: column;
      overflow: hidden;
      backdrop-filter: blur(10px); /* Glassmorphism effect */
      -webkit-backdrop-filter: blur(10px); /* For Safari */

      .messages {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 15px;

        .message {
          max-width: 70%;
          padding: 12px 18px;
          border-radius: 20px;
          line-height: 1.6;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          position: relative;

          &.ai-message {
            align-self: flex-start;
            background-color: #e6f7ff; /* Light blue */
            color: #262626;
            border-bottom-left-radius: 5px;
          }

          &.user-message {
            align-self: flex-end;
            background-color: #007bff; /* Primary blue */
            color: white;
            border-bottom-right-radius: 5px;
          }
        }
      }

      .input-area {
        display: flex;
        padding: 20px;
        border-top: 1px solid #eee;
        background-color: #f9f9f9;

        input {
          flex: 1;
          border: 1px solid #ccc;
          border-radius: 25px;
          padding: 12px 20px;
          font-size: 1em;
          outline: none;
          transition: border-color 0.3s ease;
          &:focus {
            border-color: #007bff;
            box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
          }
        }

        button {
          background-color: #28a745; /* Green send button */
          color: white;
          border: none;
          border-radius: 25px;
          padding: 12px 25px;
          margin-left: 10px;
          cursor: pointer;
          font-size: 1em;
          font-weight: bold;
          transition: background-color 0.3s ease, transform 0.2s ease;
          &:hover {
            background-color: #218838;
            transform: translateY(-2px);
          }
          &:active {
            transform: translateY(0);
          }
        }
      }
    }
  }

  .footer {
    background-color: #343a40;
    color: white;
    text-align: center;
    padding: 15px 0;
    font-size: 0.9em;
  }
}</style>