<template>
  <div class="h-full flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden">
    <!-- Main Content: Top Creation Area -->
    <div class="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10">
      <div class="max-w-6xl mx-auto flex flex-col items-center">
        <!-- Header: Centered and Attractive -->
        <div class="text-center mb-10 max-w-2xl">
          <h1 class="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white mb-4 tracking-tight">
            智能极速创作，打造爆款短剧
          </h1>
          <p class="text-slate-500 dark:text-slate-400 text-base md:text-lg leading-relaxed">
            AI全流程辅助，零门槛创作，内置高转化剧情模板，让创意触手及。
          </p>
        </div>

        <!-- Creation Card: Simplified for speed -->
        <div class="w-full max-w-4xl bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden mb-16 transition-all duration-300">
          <div class="p-1 bg-slate-50/50 dark:bg-slate-900/50 flex border-b border-slate-100 dark:border-slate-700">
            <button 
              class="flex-1 py-3 text-sm font-bold transition-all rounded-xl m-1 flex items-center justify-center gap-2"
              :class="activeTab === 'ai' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500'"
              @click="activeTab = 'ai'"
            >
              <el-icon><MagicStick /></el-icon> AI 生成剧本
            </button>
            <button 
              class="flex-1 py-3 text-sm font-bold transition-all rounded-xl m-1 flex items-center justify-center gap-2"
              :class="activeTab === 'upload' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500'"
              @click="activeTab = 'upload'"
            >
              <el-icon><Upload /></el-icon> 上传我的剧本
            </button>
          </div>

          <div class="p-6 md:p-8">
            <div v-if="activeTab === 'ai'" class="flex flex-col">
              <div class="relative group">
                <textarea 
                  v-model="aiPrompt"
                  class="w-full h-40 md:h-52 resize-none bg-slate-50/30 dark:bg-slate-900/30 border-2 border-transparent focus:border-indigo-500/30 rounded-2xl outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 text-lg p-5 transition-all"
                  placeholder="在此输入你构想的故事内容。可以尝试输入这些要素：故事设定、主角特征、剧情脉络、最终结局等等"
                ></textarea>
                <button 
                  class="absolute bottom-4 right-4 flex items-center gap-1.5 px-4 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-full text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 transition-colors shadow-sm"
                  @click="showAssistant = true"
                >
                  <el-icon><EditPen /></el-icon> 灵感助手
                </button>
              </div>
              
              <div class="flex flex-col items-center gap-4 mt-8">
                <el-button 
                  type="primary" 
                  size="large" 
                  class="!px-16 !h-14 !rounded-full !text-lg !font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
                  :disabled="!aiPrompt.trim() && !isGenerating"
                  :loading="isGenerating"
                  @click="startCreation"
                >
                  立即开始创作
                </el-button>
                <p class="text-xs text-slate-400">目前支持：微短剧、电影大纲、长篇剧集等多种体裁</p>
              </div>
            </div>

            <div v-if="activeTab === 'upload'" class="py-10">
              <el-upload
                drag
                action="#"
                :auto-upload="false"
                class="w-full"
                @change="handleFileUpload"
              >
                <el-icon class="el-icon--upload !text-indigo-500/40"><upload-filled /></el-icon>
                <div class="el-upload__text text-slate-500">
                  将文件拖到此处，或 <em>点击上传</em>
                </div>
                <template #tip>
                  <div class="el-upload__tip text-center mt-4 text-slate-400">
                    支持 docx, pdf, txt 格式，单个文件不超过 20MB
                  </div>
                </template>
              </el-upload>
            </div>
          </div>
        </div>

        <!-- Recent Projects Section -->
        <div class="w-full">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              我的项目 <span class="text-slate-400 font-normal text-sm">(最近制作)</span>
            </h2>
            <el-button text @click="router.push('/ai-short-drama-creator/works')" class="!bg-slate-100 hover:!bg-slate-200 !px-4 !rounded-lg text-slate-600 font-medium">
              管理 <el-icon class="ml-1"><ArrowRight /></el-icon>
            </el-button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div 
              v-for="work in recentWorks" 
              :key="work.id"
              class="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              @click="router.push('/ai-short-drama-creator/outline')"
            >
              <!-- Previews Area -->
              <div class="h-40 bg-slate-100 dark:bg-slate-900 flex p-2 gap-1.5 overflow-hidden relative">
                <template v-if="work.previews && work.previews.length > 0">
                  <!-- Case for 3 images like in the screenshot -->
                  <div 
                    v-for="(img, idx) in work.previews" 
                    :key="idx"
                    class="flex-1 h-full rounded-lg overflow-hidden bg-slate-200"
                  >
                    <img :src="img" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                </template>
                <!-- Large gray placeholder if no previews -->
                <div v-else class="w-full h-full flex items-center justify-center text-slate-300 bg-[#E5E7EB] rounded-lg">
                   <el-icon size="48" class="opacity-20"><Picture /></el-icon>
                </div>
                <!-- Overlay badge for status/example -->
                <div v-if="work.isExample" class="absolute top-3 left-3 px-2 py-0.5 bg-purple-500 text-white text-[10px] font-bold rounded shadow-sm z-10">示例</div>
              </div>

              <div class="p-4 bg-slate-50/30">
                <h3 class="font-bold text-slate-800 dark:text-white mb-1.5 truncate text-[15px]" :title="work.title">
                  {{ work.title }}
                </h3>
                <div class="flex items-center text-[12px] text-slate-400 gap-3">
                  <span v-if="work.episodes">{{ work.episodes }} 集</span>
                  <span class="flex items-center gap-1"><el-icon><Clock /></el-icon> {{ work.updatedAt }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State for Recent Projects -->
          <div v-if="recentWorks.length === 0" class="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400">
            <el-icon size="40" class="mb-2 opacity-30"><VideoCamera /></el-icon>
            <p>暂无制作中的短剧</p>
          </div>
        </div>
      </div>
    </div>

    <!-- AI Assistant Dialog -->
    <el-dialog
      v-model="showAssistant"
      title="AI 创作助手"
      width="540px"
      class="inspiration-dialog !rounded-3xl"
    >
      <div class="grid grid-cols-2 gap-4 p-2">
        <div 
          v-for="feature in assistantFeatures" 
          :key="feature.key"
          class="p-4 rounded-2xl border border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/30 cursor-pointer transition-all group"
          @click="applyAssistant(feature.key)"
        >
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
              <el-icon :size="20"><component :is="feature.icon" /></el-icon>
            </div>
            <span class="font-bold text-slate-800">{{ feature.label }}</span>
          </div>
          <p class="text-xs text-slate-500">{{ feature.desc }}</p>
        </div>
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
  VideoCamera
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

:deep(.inspiration-dialog .el-dialog__header) {
  margin-right: 0;
  padding-bottom: 0;
}

:deep(.inspiration-dialog .el-dialog__title) {
  font-weight: 800;
  font-size: 1.25rem;
  color: #1e293b;
}

:deep(.el-upload-dragger) {
  border-radius: 1.5rem;
  border-width: 2px;
  background-color: transparent;
  padding: 40px 20px;
}
</style>
