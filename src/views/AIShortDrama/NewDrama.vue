<template>
  <div class="h-full flex flex-col bg-[#F8FAFC] dark:bg-slate-900 relative overflow-hidden">
    <!-- Decorative background elements -->
    <div class="absolute -top-40 -right-40 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none"></div>

    <!-- Main Content: Top Creation Area -->
    <div class="flex-1 overflow-hidden p-4 lg:p-6 relative z-10 flex flex-col min-h-0">
      <div class="max-w-7xl mx-auto flex flex-col items-center w-full h-full">
        <!-- Header: More compact -->
        <div class="text-center mb-6 max-w-3xl shrink-0">
          <h1 class="text-3xl md:text-4xl font-black mb-3 tracking-tight leading-tight">
            <span class="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
              智能极速创作，打造爆款短剧
            </span>
          </h1>
          <p class="text-slate-500 dark:text-slate-400 text-base md:text-lg font-medium leading-relaxed opacity-80">
            AI全流程辅助，零门槛创作，内置高转化剧情模板，让创意触手可及。
          </p>
        </div>

        <!-- Creation Card: Wider and Flatter -->
        <div class="w-full max-w-6xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl rounded-[32px] shadow-2xl shadow-indigo-500/5 border border-white/40 dark:border-slate-700/50 overflow-hidden mb-8 transition-all duration-500 hover:shadow-indigo-500/10 shrink-0">
          <div class="p-1.5 bg-slate-100/50 dark:bg-slate-900/50 flex m-3 rounded-[20px]">
            <button 
              class="flex-1 py-3 text-[15px] font-black transition-all rounded-[16px] flex items-center justify-center gap-2.5"
              :class="activeTab === 'ai' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-md scale-[1.01]' : 'text-slate-500 hover:text-slate-700'"
              @click="activeTab = 'ai'"
            >
              <el-icon :size="18"><MagicStick /></el-icon> AI 灵感生成
            </button>
            <button 
              class="flex-1 py-3 text-[15px] font-black transition-all rounded-[16px] flex items-center justify-center gap-2.5"
              :class="activeTab === 'upload' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-md scale-[1.01]' : 'text-slate-500 hover:text-slate-700'"
              @click="activeTab = 'upload'"
            >
              <el-icon :size="18"><Upload /></el-icon> 导入已有剧本
            </button>
          </div>

          <div class="px-6 py-4 md:px-8 md:py-6 pt-2">
            <div class="h-[320px] flex flex-col justify-center">
              <!-- AI Tab Content -->
              <div v-if="activeTab === 'ai'" class="flex flex-col gap-6 animate-fade-in h-full justify-center">
                <div class="relative group">
                  <div class="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-[28px] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                  <textarea 
                    v-model="aiPrompt"
                    class="relative w-full h-40 md:h-44 resize-none bg-slate-50/50 dark:bg-slate-900/50 border-2 border-slate-100/50 dark:border-slate-700/50 focus:border-indigo-500/20 rounded-[28px] outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-[18px] p-7 transition-all font-bold leading-relaxed shadow-inner"
                    placeholder="在此输入你构想的故事内容。例如：一个穷小子意外获得超能力，重返校园改写人生..."
                  ></textarea>
                  <button 
                    class="absolute bottom-5 right-5 flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-[13px] font-black text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all shadow-md hover:shadow-lg active:scale-95"
                    @click="showAssistant = true"
                  >
                    <el-icon><EditPen /></el-icon> 灵感助手
                  </button>
                </div>
                
                <div class="flex items-center justify-center relative">
                  <!-- Divider Line -->
                  <div class="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent"></div>
                  
                  <button 
                    class="relative z-10 h-16 px-16 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white rounded-2xl text-[18px] font-black shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.05] active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-3 border border-white/20"
                    :disabled="(!aiPrompt.trim() && !isGenerating) || isGenerating"
                    @click="startCreation"
                  >
                    <el-icon v-if="isGenerating" class="is-loading" :size="24"><Loading /></el-icon>
                    <el-icon v-else :size="24"><MagicStick /></el-icon>
                    <span>立即开启 AI 创作之旅</span>
                  </button>
                </div>
              </div>

              <!-- Upload Tab Content -->
              <div v-if="activeTab === 'upload'" class="py-2 animate-fade-in h-full flex flex-col justify-center">
                <el-upload
                  drag
                  action="#"
                  :auto-upload="false"
                  class="custom-upload-v2 w-full h-full"
                  @change="handleFileUpload"
                >
                  <div class="py-10">
                    <div class="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                      <el-icon :size="32"><upload-filled /></el-icon>
                    </div>
                    <div class="el-upload__text text-slate-500 dark:text-slate-400 font-bold text-lg mb-2">
                      将剧本文件拖到此处，或 <em class="text-indigo-600 dark:text-indigo-400 not-italic">点击上传</em>
                    </div>
                    <div class="text-slate-400 text-sm font-medium">
                      支持 docx, pdf, txt 格式，不超过 20MB
                    </div>
                  </div>
                </el-upload>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Projects Section -->
        <div class="w-full relative flex-1 min-h-0 flex flex-col">
          <div class="flex items-center justify-between mb-4 shrink-0">
            <h2 class="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
              <span class="w-2 h-7 bg-indigo-600 rounded-full"></span>
              近期作品
              <span class="text-slate-300 font-light text-xl">/</span>
              <span class="text-[11px] font-black text-slate-500 uppercase tracking-widest mt-1">Recent Projects</span>
            </h2>
            <button 
              @click="router.push('/ai-short-drama-creator/works')" 
              class="group h-10 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[13px] transition-all flex items-center gap-2 shadow-xl shadow-slate-200 dark:shadow-none hover:scale-105 active:scale-95"
            >
              <span>管理作品</span>
              <el-icon class="group-hover:translate-x-1 transition-transform"><ArrowRight /></el-icon>
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
            <div 
              v-for="work in recentWorks.slice(0, 4)" 
              :key="work.id"
              class="bg-white dark:bg-slate-800 rounded-[24px] overflow-hidden border border-slate-100 dark:border-slate-700 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-500 cursor-pointer group flex flex-col"
              @click="router.push('/ai-short-drama-creator/outline')"
            >
              <!-- Previews Area -->
              <div class="h-32 bg-slate-100 dark:bg-slate-900 flex p-1.5 gap-1.5 overflow-hidden relative shrink-0">
                <template v-if="work.previews && work.previews.length > 0">
                  <div 
                    v-for="(img, idx) in work.previews" 
                    :key="idx"
                    class="flex-1 h-full rounded-xl overflow-hidden bg-slate-200"
                  >
                    <img :src="img" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                </template>
                <div v-else class="w-full h-full flex items-center justify-center text-indigo-200 dark:text-indigo-900/30 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 rounded-xl">
                   <el-icon size="32" class="opacity-40 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500"><VideoCamera /></el-icon>
                </div>
                <div v-if="work.isExample" class="absolute top-3 left-3 px-2 py-0.5 bg-purple-600/90 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-widest rounded-md shadow-lg z-10">
                  Example
                </div>
              </div>

              <div class="p-4 flex flex-col gap-2.5">
                <h3 class="font-black text-slate-900 dark:text-white truncate text-[18px] group-hover:text-indigo-600 transition-colors" :title="work.title">
                  {{ work.title }}
                </h3>
                <div class="flex items-center justify-between text-[13px] font-black text-slate-500 uppercase tracking-tighter">
                  <div class="flex items-center gap-1.5">
                    <el-icon class="text-indigo-500"><Clock /></el-icon>
                    <span>{{ work.updatedAt.split(' ')[0] }}</span>
                  </div>
                  <span v-if="work.episodes" class="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md text-slate-700 dark:text-slate-300">
                    <span class="text-[14px]">{{ work.episodes }}</span> 集
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State for Recent Projects -->
          <div v-if="recentWorks.length === 0" class="py-20 flex flex-col items-center justify-center bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400">
            <div class="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-4">
              <el-icon size="32" class="opacity-20"><VideoCamera /></el-icon>
            </div>
            <p class="font-bold text-lg mb-1">暂无制作中的短剧</p>
            <p class="text-sm opacity-60">开启您的第一场 AI 剧本创作之旅吧</p>
          </div>
        </div>
      </div>
    </div>

    <!-- AI Assistant Dialog -->
    <el-dialog
      v-model="showAssistant"
      title="AI 创作助手"
      width="640px"
      class="inspiration-dialog-v3"
      destroy-on-close
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <el-icon :size="24"><MagicStick /></el-icon>
          </div>
          <div>
            <h3 class="text-2xl font-black text-slate-800 dark:text-white leading-none">AI 创作助手</h3>
            <p class="text-[13px] text-slate-500 font-black mt-2 uppercase tracking-widest">AI Creative Assistant</p>
          </div>
        </div>
      </template>

      <div class="grid grid-cols-2 gap-6 p-1">
        <div 
          v-for="feature in assistantFeatures" 
          :key="feature.key"
          class="relative group cursor-pointer"
          @click="applyAssistant(feature.key)"
        >
          <!-- Card Background & Border -->
          <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div class="relative p-6 rounded-[32px] bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 shadow-sm group-hover:shadow-xl group-hover:shadow-indigo-500/10 group-hover:-translate-y-1 transition-all duration-500">
            <div class="flex flex-col gap-5">
              <div class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm">
                <el-icon :size="24"><component :is="feature.icon" /></el-icon>
              </div>
              <div>
                <h4 class="text-[18px] font-black text-slate-800 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors">
                  {{ feature.label }}
                </h4>
                <p class="text-[14px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {{ feature.desc }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-500/10 flex items-center gap-4">
        <div class="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-600 shadow-sm">
          <el-icon :size="20"><InfoFilled /></el-icon>
        </div>
        <p class="text-xs text-indigo-700 dark:text-indigo-300 font-bold">
          点击上方功能，AI 将立即为您提供创作灵感或优化现有内容。
        </p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Upload, 
  UploadFilled, 
  MagicStick, 
  EditPen, 
  DocumentAdd, 
  Refresh,
  Brush,
  Picture,
  Clock,
  ArrowRight,
  VideoCamera,
  InfoFilled
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const router = useRouter();
const isLight = inject('isLight', ref(true));

// --- State Management ---
const activeTab = ref('ai'); 
const aiPrompt = ref('');
const showAssistant = ref(false);
const isGenerating = ref(false);

// Mock Recent Works Data based on user screenshot
const recentWorks = ref([
  { 
    id: 1, 
    title: '誓要掀', 
    episodes: 1, 
    updatedAt: '2026-04-01 14:11',
    previews: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=300&fit=crop',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=300&fit=crop'
    ]
  },
  { 
    id: 2, 
    title: '烽火铁牛：开局掀翻元廷', 
    updatedAt: '2026-03-23 12:01',
    previews: [] // Test empty state
  },
  { 
    id: 3, 
    title: '从弃女到巅峰：苏家千金归来', 
    episodes: 5, 
    updatedAt: '2026-03-19 10:48',
    isExample: true,
    previews: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=300&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=300&fit=crop',
      'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&h=300&fit=crop'
    ]
  },
  { 
    id: 4, 
    title: '末世：我以为我是废柴，其实我是神', 
    episodes: 5, 
    updatedAt: '2026-03-16 14:10',
    isExample: true,
    previews: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&h=300&fit=crop',
      'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200&h=300&fit=crop',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=300&fit=crop'
    ]
  }
]);

const assistantFeatures = [
  { key: 'generate', label: '一键生成', desc: '根据热门趋势生成完整短剧大纲', icon: DocumentAdd },
  { key: 'polish', label: '文本润色', desc: '修饰语言，使对白更具戏剧张力', icon: Brush },
  { key: 'expand', label: '情节扩写', desc: '增加细节描述，丰富故事层次感', icon: EditPen },
  { key: 'rewrite', label: '创意改写', desc: '变换故事角度，发掘更多可能性', icon: Refresh }
];

const getFeatureColorClass = (key: string) => {
  const map: Record<string, string> = {
    generate: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    polish: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
    expand: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
    rewrite: 'bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400'
  };
  return map[key] || 'bg-slate-50 text-slate-600';
};

const applyAssistant = (key: string) => {
  showAssistant.value = false;
  isGenerating.value = true;
  setTimeout(() => {
    aiPrompt.value = '【灵感内容】：这是一个关于重生与反击的爆爽故事...';
    isGenerating.value = false;
  }, 1000);
};

const startCreation = () => {
  if (!aiPrompt.value.trim()) {
    showAssistant.value = true;
    return;
  }
  isGenerating.value = true;
  setTimeout(() => {
    router.push('/ai-short-drama-creator/outline');
    isGenerating.value = false;
  }, 1000);
};

const handleFileUpload = (file: any) => {
  ElMessage.success(`文件解析中...`);
  setTimeout(() => router.push('/ai-short-drama-creator/outline'), 1000);
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
}

:deep(.inspiration-dialog-v3 .el-dialog) {
  border-radius: 48px !important;
  padding: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 25px 50px -12px rgba(99, 102, 241, 0.1) !important;
}
.dark :deep(.inspiration-dialog-v3 .el-dialog) {
  background-color: #0f172a !important;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

:deep(.inspiration-dialog-v3 .el-dialog__header) {
  margin-right: 0;
  padding: 40px 40px 20px;
}

:deep(.inspiration-dialog-v3 .el-dialog__body) {
  padding: 0 40px 40px;
}

:deep(.inspiration-dialog-v3 .el-dialog__headerbtn) {
  top: 40px;
  right: 40px;
  width: 40px;
  height: 40px;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.3s;
}
.dark :deep(.inspiration-dialog-v3 .el-dialog__headerbtn) {
  background: #1e293b;
}
:deep(.inspiration-dialog-v3 .el-dialog__headerbtn:hover) {
  background: #fee2e2;
  transform: rotate(90deg);
}
:deep(.inspiration-dialog-v3 .el-dialog__headerbtn:hover .el-dialog__close) {
  color: #ef4444;
}

:deep(.custom-upload-v2) {
  height: 100%;
}
:deep(.custom-upload-v2 .el-upload) {
  height: 100%;
}
:deep(.custom-upload-v2 .el-upload-dragger) {
  border-radius: 32px;
  border: 2px dashed #e2e8f0;
  background-color: rgba(248, 250, 252, 0.5);
  transition: all 0.3s ease;
  width: 100% !important;
  height: 100% !important;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.dark :deep(.custom-upload-v2 .el-upload-dragger) {
  border-color: #334155;
  background-color: rgba(15, 23, 42, 0.5);
}
:deep(.custom-upload-v2 .el-upload-dragger:hover) {
  border-color: #6366f1;
  background-color: rgba(99, 102, 241, 0.05);
}
</style>
