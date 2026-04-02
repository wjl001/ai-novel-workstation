<template>
  <div class="h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-6 overflow-y-auto custom-scrollbar">
    <!-- Header: Redesigned for attraction -->
    <div class="text-center mb-10 max-w-2xl px-4">
      <h1 class="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white mb-4 tracking-tight">
        {{ t('hero.title') }}
      </h1>
      <p class="text-slate-500 dark:text-slate-400 text-base md:text-lg leading-relaxed">
        {{ t('hero.description') }}
      </p>
    </div>

    <!-- Main Card -->
    <div class="w-full max-w-4xl bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700 transition-all duration-300">
      <!-- Tabs Header: Custom designed for clarity -->
      <div class="flex border-b border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30 p-1">
        <button 
          class="flex-1 py-4 text-center font-bold transition-all duration-300 flex items-center justify-center gap-2 rounded-2xl m-1"
          :class="activeTab === 'ai' 
            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
            : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'"
          @click="activeTab = 'ai'"
        >
          <el-icon><Document /></el-icon> {{ t('tabs.ai') }}
        </button>
        <button 
          class="flex-1 py-4 text-center font-bold transition-all duration-300 flex items-center justify-center gap-2 rounded-2xl m-1"
          :class="activeTab === 'upload' 
            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
            : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'"
          @click="activeTab = 'upload'"
        >
          <el-icon><Upload /></el-icon> {{ t('tabs.upload') }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="p-8">
        <!-- AI Generate Tab -->
        <div v-if="activeTab === 'ai'" class="flex flex-col min-h-[300px]">
          <div class="relative flex-1 group">
            <textarea 
              v-model="aiPrompt"
              class="w-full h-48 md:h-64 resize-none bg-slate-50/50 dark:bg-slate-900/50 border-2 border-transparent focus:border-indigo-500/50 rounded-2xl outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 text-lg p-5 transition-all duration-300"
              :placeholder="t('ai.placeholder')"
            ></textarea>
            
            <!-- AI Inspiration Button -->
            <button 
              class="absolute bottom-4 right-4 flex items-center gap-1.5 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-full text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors shadow-sm"
              @click="showAssistant = true"
            >
              <el-icon><MagicStick /></el-icon> {{ t('ai.noInspiration') }}
            </button>
          </div>
          
          <div class="flex flex-col items-center gap-3 mt-8">
            <el-button 
              type="primary" 
              size="large" 
              class="!px-12 !h-14 !rounded-full !text-lg !font-bold shadow-lg shadow-indigo-500/30 hover:scale-105 transition-transform"
              :disabled="!aiPrompt.trim() && !isGenerating"
              :loading="isGenerating"
              @click="startCreation"
            >
              {{ t('ai.startBtn') }}
            </el-button>
            <span class="text-xs text-slate-400 dark:text-slate-500">
              {{ t('billing.freeHint') }}
            </span>
          </div>
        </div>

        <!-- Upload Tab -->
        <div v-if="activeTab === 'upload'" class="flex flex-col items-center justify-center min-h-[300px]">
          <el-upload
            class="w-full"
            drag
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            @change="handleFileUpload"
          >
            <div class="py-10">
              <el-icon class="text-6xl text-indigo-500/50 mb-4"><UploadFilled /></el-icon>
              <div class="text-slate-600 dark:text-slate-300 text-xl font-medium mb-2">{{ t('upload.dragHint') }}</div>
              <div class="text-slate-400 text-sm">{{ t('upload.formatHint') }}</div>
            </div>
          </el-upload>
        </div>
      </div>
    </div>

    <!-- AI Inspiration Assistant Dialog -->
    <el-dialog
      v-model="showAssistant"
      :title="t('assistant.title')"
      width="90%"
      max-width="600px"
      class="inspiration-dialog !rounded-3xl overflow-hidden"
      append-to-body
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
        <div 
          v-for="feature in assistantFeatures" 
          :key="feature.key"
          class="p-5 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 cursor-pointer transition-all group"
          @click="applyAssistant(feature.key)"
        >
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <el-icon :size="20"><component :is="feature.icon" /></el-icon>
            </div>
            <span class="font-bold text-slate-800 dark:text-slate-100">{{ t(`assistant.features.${feature.key}.label`) }}</span>
          </div>
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ t(`assistant.features.${feature.key}.desc`) }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, computed } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Upload, 
  Document, 
  UploadFilled, 
  MagicStick, 
  EditPen, 
  DocumentAdd, 
  Refresh,
  Brush,
  TrendCharts
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const router = useRouter();
const isLight = inject('isLight', ref(true));
const isDark = computed(() => !isLight.value);

// --- State Management ---
const activeTab = ref('ai'); // 'ai' | 'upload'
const aiPrompt = ref('');
const showAssistant = ref(false);
const isGenerating = ref(false);

// --- i18n Logic (Local) ---
const locale = ref('zh-CN');
const messages: Record<string, any> = {
  'zh-CN': {
    hero: {
      title: '智能极速创作，打造爆款短剧',
      description: 'AI全流程辅助，零门槛创作，内置高转化剧情模板，让创意触手可及。'
    },
    tabs: {
      ai: 'AI 生成剧本',
      upload: '上传我的剧本'
    },
    ai: {
      placeholder: '在此输入你构想的故事内容。可以尝试输入这些要素：故事设定、主角特征、剧情脉络、最终结局等等',
      noInspiration: '灵感枯竭？',
      startBtn: '开始创作'
    },
    billing: {
      freeHint: '当前处于免费试用阶段，生成剧本暂不消耗积分',
      toast: '免费试用中'
    },
    upload: {
      dragHint: '点击或将文件拖拽到这里上传',
      formatHint: '支持 txt, doc, docx, pdf 格式'
    },
    assistant: {
      title: 'AI 灵感助手',
      features: {
        generate: { label: '一键生成', desc: '根据热门趋势生成完整短剧大纲', icon: 'DocumentAdd' },
        polish: { label: '文本润色', desc: '修饰语言，使对白更具戏剧张力', icon: 'Brush' },
        expand: { label: '情节扩写', desc: '增加细节描述，丰富故事层次感', icon: 'EditPen' },
        rewrite: { label: '创意改写', desc: '变换故事角度，发掘更多可能性', icon: 'Refresh' }
      }
    }
  },
  'en-US': {
    hero: {
      title: 'Intelligent Speed Creation, Build Hit Dramas',
      description: 'AI full-process assistance, zero-threshold creation, built-in high-conversion templates.'
    },
    tabs: {
      ai: 'AI Script Generation',
      upload: 'Upload My Script'
    },
    ai: {
      placeholder: 'Enter your story ideas here. Try elements like setting, characters, plot points, etc.',
      noInspiration: 'No inspiration?',
      startBtn: 'Start Creation'
    },
    billing: {
      freeHint: 'Currently in free trial, no points consumed for generation.',
      toast: 'Free trial in progress'
    },
    upload: {
      dragHint: 'Click or drag file here to upload',
      formatHint: 'Supports txt, doc, docx, pdf formats'
    },
    assistant: {
      title: 'AI Inspiration Assistant',
      features: {
        generate: { label: 'One-click Generate', desc: 'Generate full outline based on trends', icon: 'DocumentAdd' },
        polish: { label: 'Polish Text', desc: 'Refine language for dramatic tension', icon: 'Brush' },
        expand: { label: 'Expand Plot', desc: 'Add detail and enrich story layers', icon: 'EditPen' },
        rewrite: { label: 'Creative Rewrite', desc: 'Change perspectives for more possibilities', icon: 'Refresh' }
      }
    }
  }
};

const t = (path: string) => {
  const keys = path.split('.');
  let result = messages[locale.value];
  for (const key of keys) {
    if (result) result = result[key];
  }
  return result || path;
};

// --- Features Data ---
const assistantFeatures = [
  { key: 'generate', icon: DocumentAdd },
  { key: 'polish', icon: Brush },
  { key: 'expand', icon: EditPen },
  { key: 'rewrite', icon: Refresh }
];

// --- Handlers ---
const applyAssistant = (key: string) => {
  showAssistant.value = false;
  isGenerating.value = true;
  
  // Mock AI response
  setTimeout(() => {
    const mockResponses: Record<string, string> = {
      generate: '【一键生成结果】：这是一段由AI为您精心构思的爆款短剧大纲。背景设定在繁华都市，讲述了一个关于身份反转与救赎的故事...',
      polish: aiPrompt.value ? `【润色后】：${aiPrompt.value}（已针对对白张力和叙事节奏进行深度优化）` : '请先输入一段内容，我再为您润色。',
      expand: aiPrompt.value ? `【扩写后】：${aiPrompt.value}。窗外的雨越下越大，仿佛在诉说着她内心无法言说的忧伤...` : '请先输入内容，我将为您扩写细节。',
      rewrite: aiPrompt.value ? `【改写后】：换个角度看这个故事——如果这一切其实是一场梦中梦？${aiPrompt.value}` : '请输入内容，让我为您换个思路。'
    };
    
    aiPrompt.value = mockResponses[key] || '';
    isGenerating.value = false;
    ElMessage.success(t('billing.toast'));
  }, 1500);
};

const startCreation = () => {
  if (!aiPrompt.value.trim()) {
    showAssistant.value = true;
    return;
  }
  
  ElMessage.success(t('billing.toast'));
  ElMessage.info('正在为您处理剧本...');
  
  setTimeout(() => {
    router.push('/ai-short-drama-creator/outline');
  }, 800);
};

const handleFileUpload = (file: any) => {
  ElMessage.success(`文件 ${file.name} 解析中...`);
  setTimeout(() => {
    router.push('/ai-short-drama-creator/outline');
  }, 1000);
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

.dark :deep(.inspiration-dialog .el-dialog__title) {
  color: #f1f5f9;
}

:deep(.el-upload-dragger) {
  border-radius: 1.5rem;
  border-width: 2px;
  background-color: transparent;
}

.dark :deep(.el-upload-dragger) {
  border-color: #334155;
}

.dark :deep(.el-upload-dragger:hover) {
  border-color: #6366f1;
}
</style>
