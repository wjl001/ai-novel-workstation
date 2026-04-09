<template>
  <div class="h-full flex flex-col bg-[#F8FAFC] dark:bg-slate-900 relative overflow-hidden">
    <!-- Decorative background elements -->
    <div class="absolute -top-40 -right-40 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none"></div>

    <!-- Main Content: Top Creation Area -->
    <div class="flex-1 overflow-y-auto p-4 lg:p-6 relative z-10 flex flex-col min-h-0 custom-scrollbar">
      <div class="max-w-7xl mx-auto flex flex-col items-center w-full">
        <!-- Header: More compact -->
        <div class="text-center mb-4 max-w-3xl shrink-0 relative w-full">
          <!-- Product Design Info Button -->
          <button 
            @click="showDesignDialog = true"
            class="absolute top-0 right-0 md:right-[-40px] h-8 px-3 flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-500 dark:text-slate-400 rounded-full font-bold text-[10px] shadow-sm border border-slate-200/50 dark:border-slate-700/50 hover:text-indigo-600 hover:border-indigo-300 transition-all duration-300"
          >
            <el-icon :size="12"><InfoFilled /></el-icon>
            <span>产品设计说明</span>
          </button>
          
          <h1 class="text-2xl md:text-3xl font-black mb-2 tracking-tight leading-tight">
            <span class="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
              智能极速创作，打造爆款短剧
            </span>
          </h1>
          <p class="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium leading-relaxed opacity-70">
            AI全流程辅助，内置高转化剧情模板，让创意触手可及。
          </p>
        </div>

        <!-- Creation Card: More compact and color-distinguished -->
        <div class="w-full max-w-5xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl rounded-[32px] shadow-xl shadow-indigo-500/5 border border-white dark:border-slate-700/50 overflow-hidden mb-6 transition-all duration-500 shrink-0">
          <div class="p-1 bg-slate-100/50 dark:bg-slate-900/50 flex m-2 rounded-[18px]">
            <button 
              class="flex-1 py-2 text-[14px] font-black transition-all rounded-[14px] flex items-center justify-center gap-2"
              :class="activeTab === 'ai' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm scale-[1.01]' : 'text-slate-500 hover:text-slate-700'"
              @click="activeTab = 'ai'"
            >
              <el-icon :size="16"><MagicStick /></el-icon> AI 灵感生成
            </button>
            <button 
              class="flex-1 py-2 text-[14px] font-black transition-all rounded-[14px] flex items-center justify-center gap-2"
              :class="activeTab === 'upload' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm scale-[1.01]' : 'text-slate-500 hover:text-slate-700'"
              @click="activeTab = 'upload'"
            >
              <el-icon :size="16"><Upload /></el-icon> 导入已有剧本
            </button>
          </div>

          <div class="px-6 py-4 md:px-8 md:py-5 pt-1">
            <div class="min-h-[280px] flex flex-col">
              <!-- AI Tab Content -->
              <div v-if="activeTab === 'ai'" class="flex flex-col gap-4 animate-fade-in h-full">
                <!-- AI Assistant Features -->
                <div class="flex flex-wrap items-center gap-2 mb-0.5">
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1 flex items-center gap-1">
                    <el-icon><MagicStick /></el-icon> 灵感建议:
                  </span>
                  <button 
                    v-for="feature in assistantFeatures" 
                    :key="feature.key"
                    @click="applyAssistant(feature.key)"
                    class="px-3 py-1.5 rounded-full text-[12px] font-bold border border-slate-100 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all flex items-center gap-1.5 group bg-white dark:bg-slate-800"
                  >
                    <el-icon class="group-hover:rotate-12 transition-transform" :size="14"><component :is="feature.icon" /></el-icon>
                    {{ feature.label }}
                  </button>
                </div>

                <div class="relative group">
                  <!-- Dynamic Glowing Border -->
                  <div 
                    class="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[24px] blur-lg opacity-0 transition-opacity duration-1000"
                    :class="isGenerating ? 'opacity-30 animate-pulse' : 'group-focus-within:opacity-10'"
                  ></div>
                  
                  <div class="relative bg-slate-50/50 dark:bg-slate-900/50 rounded-[22px] border border-slate-200/60 dark:border-slate-700 group-focus-within:border-indigo-500/30 transition-all overflow-hidden shadow-inner">
                    <textarea 
                      v-model="aiPrompt"
                      class="w-full h-32 md:h-36 resize-none bg-transparent outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-base p-6 transition-all font-bold leading-relaxed"
                      placeholder="在此输入你构想的故事内容。比如：一个在赛博朋克世界里寻找失踪妹妹的私家侦探..."
                    ></textarea>
                    
                    <!-- Textarea Bottom Toolbar -->
                    <div class="px-5 py-2.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <div class="flex items-center gap-3 text-slate-400">
                        <span class="text-[10px] font-bold flex items-center gap-1">
                          <el-icon><EditPen /></el-icon> {{ aiPrompt.length }} 字
                        </span>
                        <div class="w-px h-3 bg-slate-200 dark:bg-slate-700"></div>
                        <button class="hover:text-indigo-600 transition-colors" title="插入常用模版">
                          <el-icon :size="14"><Document /></el-icon>
                        </button>
                        <button class="hover:text-indigo-600 transition-colors" title="优化描述">
                          <el-icon :size="14"><Brush /></el-icon>
                        </button>
                      </div>
                      
                      <div class="flex items-center gap-2">
                         <span v-if="isGenerating" class="text-[10px] font-bold text-indigo-600 animate-pulse mr-1 flex items-center gap-1">
                           <el-icon class="is-loading"><Loading /></el-icon> 正在构思...
                         </span>
                         <button 
                          class="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
                          :disabled="!aiPrompt.trim() || isGenerating"
                          @click="startCreation"
                        >
                          <el-icon v-if="!isGenerating" :size="14"><MagicStick /></el-icon>
                          <span>立即创作</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Featured Categories -->
                <div class="flex items-center justify-center gap-6 mt-1 opacity-50 hover:opacity-100 transition-opacity">
                   <div v-for="tag in ['都市异能', '玄幻重生', '霸道总裁', '无限流']" :key="tag" class="text-[10px] font-black text-slate-500 cursor-pointer hover:text-indigo-600 flex items-center gap-1">
                     <span class="w-1 h-1 rounded-full bg-slate-300"></span>
                     {{ tag }}
                   </div>
                </div>
              </div>

              <!-- Upload Tab Content -->
              <div v-if="activeTab === 'upload'" class="py-1 animate-fade-in h-full flex flex-col justify-center">
                <el-upload
                  drag
                  action="#"
                  :auto-upload="false"
                  class="custom-upload-v2 w-full h-full"
                  @change="handleFileUpload"
                >
                  <div class="py-6">
                    <div class="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <el-icon :size="24"><upload-filled /></el-icon>
                    </div>
                    <div class="el-upload__text text-slate-500 dark:text-slate-400 font-bold text-base mb-1">
                      将剧本文件拖到此处，或 <em class="text-indigo-600 dark:text-indigo-400 not-italic">点击上传</em>
                    </div>
                    <div class="text-slate-400 text-[12px] font-medium">
                      支持 docx, pdf, txt 格式，不超过 20MB
                    </div>
                  </div>
                </el-upload>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Projects Section -->
        <div class="w-full relative flex-1 min-h-0 flex flex-col bg-slate-50/50 dark:bg-slate-900/30 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800">
          <div class="flex items-center justify-between mb-4 shrink-0">
            <h2 class="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              <span class="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
              近期作品
              <span class="text-slate-300 font-light text-lg">/</span>
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Recent Projects</span>
            </h2>
            <button 
              @click="router.push('/ai-short-drama-creator/works')" 
              class="group h-8 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-black text-[11px] transition-all flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95"
            >
              <span>管理作品</span>
              <el-icon class="group-hover:translate-x-1 transition-transform" :size="12"><ArrowRight /></el-icon>
            </button>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 overflow-hidden">
            <div 
              v-for="work in recentWorks.slice(0, 4)" 
              :key="work.id"
              class="bg-white dark:bg-slate-800 rounded-[20px] overflow-hidden border border-slate-100/50 dark:border-slate-700 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-500 cursor-pointer group flex flex-col"
              @click="router.push('/ai-short-drama-creator/outline')"
            >
              <!-- Previews Area: More compact -->
              <div class="h-24 bg-slate-100 dark:bg-slate-900 flex p-1 gap-1 overflow-hidden relative shrink-0">
                <template v-if="work.previews && work.previews.length > 0">
                  <div 
                    v-for="(img, idx) in work.previews" 
                    :key="idx"
                    class="flex-1 h-full rounded-lg overflow-hidden bg-slate-200"
                  >
                    <img :src="img" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  </div>
                </template>
                <div v-else class="w-full h-full flex items-center justify-center text-indigo-200 dark:text-indigo-900/30 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 rounded-lg">
                   <el-icon size="24" class="opacity-40 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500"><VideoCamera /></el-icon>
                </div>
                <div v-if="work.isExample" class="absolute top-2 left-2 px-1.5 py-0.5 bg-purple-600/90 backdrop-blur-sm text-white text-[8px] font-black uppercase tracking-widest rounded shadow-lg z-10">
                  Example
                </div>
              </div>

              <div class="p-3 flex flex-col gap-1.5">
                <h3 class="font-black text-slate-800 dark:text-white truncate text-[14px] group-hover:text-indigo-600 transition-colors" :title="work.title">
                  {{ work.title }}
                </h3>
                <div class="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                  <div class="flex items-center gap-1">
                    <el-icon class="text-indigo-500" :size="10"><Clock /></el-icon>
                    <span>{{ work.updatedAt.split(' ')[0] }}</span>
                  </div>
                  <span v-if="work.episodes" class="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
                    {{ work.episodes }} 集
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

    <!-- Product Design Dialog -->
    <el-dialog v-model="showDesignDialog" title="产品设计说明 - 新建短剧" width="700px" class="rounded-[24px] !bg-[#f8fafc] dark:!bg-slate-900 overflow-hidden" :show-close="false">
      <template #header="{ close, titleId, titleClass }">
        <div class="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
              <el-icon :size="20"><Document /></el-icon>
            </div>
            <h4 :id="titleId" :class="[titleClass, 'text-xl font-black text-slate-800 dark:text-white m-0']">产品设计说明 - 新建短剧</h4>
          </div>
          <button @click="close" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
            <el-icon :size="20"><Close /></el-icon>
          </button>
        </div>
      </template>
      
      <div class="px-6 py-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
        <div class="prose dark:prose-invert max-w-none">
          <h3 class="text-indigo-600 font-bold flex items-center gap-2 mb-4"><el-icon><Location /></el-icon>页面定位</h3>
          <p class="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">项目初始化页面，决定内容生成的输入源（灵感/现有剧本）。</p>

          <h3 class="text-indigo-600 font-bold flex items-center gap-2 mb-4"><el-icon><Monitor /></el-icon>原型布局概要</h3>
          <ul class="space-y-3 mb-6">
            <li class="flex items-start gap-2 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-50 dark:border-slate-700/50">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
              <span class="text-slate-600 dark:text-slate-300"><strong>模式 A：一句话灵感生成</strong>（输入文本框：“霸道总裁爱上我，但我是来复仇的”）。</span>
            </li>
            <li class="flex items-start gap-2 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-50 dark:border-slate-700/50">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
              <span class="text-slate-600 dark:text-slate-300"><strong>模式 B：导入小说/剧本</strong>（支持上传 txt/docx/pdf 文件）。</span>
            </li>
          </ul>

          <h3 class="text-indigo-600 font-bold flex items-center gap-2 mb-4"><el-icon><Pointer /></el-icon>核心交互</h3>
          <ul class="space-y-3">
            <li class="flex items-start gap-2 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-50 dark:border-slate-700/50">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
              <span class="text-slate-600 dark:text-slate-300">用户选择模式 A 或 B 并输入内容后，点击“生成大纲”按钮。按钮呈现 Loading 状态，页面平滑过渡到 OutlineView。</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
        <button @click="showDesignDialog = false" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-sm">
          我已了解
        </button>
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
  InfoFilled,
  Close,
  Document,
  Location,
  Monitor,
  Pointer
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const router = useRouter();
const isLight = inject('isLight', ref(true));
const showDesignDialog = ref(false);

// --- State Management ---
const activeTab = ref('ai'); 
const aiPrompt = ref('');
const isGenerating = ref(false);

// Mock Recent Works Data with more reliable image placeholders
const recentWorks = ref([
  { 
    id: 1, 
    title: '誓要掀', 
    episodes: 1, 
    updatedAt: '2026-04-01 14:11',
    previews: [
      'https://picsum.photos/id/1011/200/300',
      'https://picsum.photos/id/1027/200/300',
      'https://picsum.photos/id/1005/200/300'
    ]
  },
  { 
    id: 2, 
    title: '烽火铁牛：开局掀翻元廷', 
    updatedAt: '2026-03-23 12:01',
    previews: [
      'https://picsum.photos/id/1015/200/300',
      'https://picsum.photos/id/1016/200/300'
    ]
  },
  { 
    id: 3, 
    title: '从弃女到巅峰：苏家千金归来', 
    episodes: 5, 
    updatedAt: '2026-03-19 10:48',
    isExample: true,
    previews: [
      'https://picsum.photos/id/1024/200/300',
      'https://picsum.photos/id/1025/200/300',
      'https://picsum.photos/id/1012/200/300'
    ]
  },
  { 
    id: 4, 
    title: '末世：我以为我是废柴，其实我是神', 
    episodes: 5, 
    updatedAt: '2026-03-16 14:10',
    isExample: true,
    previews: [
      'https://picsum.photos/id/1035/200/300',
      'https://picsum.photos/id/1039/200/300',
      'https://picsum.photos/id/1043/200/300'
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
  if (isGenerating.value) return;
  
  isGenerating.value = true;
  const originalPrompt = aiPrompt.value;
  aiPrompt.value = ''; // Clear for typing effect

  const mockPrompts: Record<string, string> = {
    generate: `【剧本大纲生成】\n剧名：《逆袭：从赘婿到世界首富》\n故事设定：现代都市，隐藏身份的顶级豪门继承人沈浩。\n主角特征：沈浩（隐忍、睿智），苏晴（坚韧、美丽）。\n剧情脉络：\n1. 沈浩入赘苏家三年，受尽羞辱，只为守护报恩。\n2. 苏家面临破产危机，竞争对手赵公子步步紧逼。\n3. 沈浩在关键时刻动用百亿财团资源，反杀赵家，震惊全城。\n最终结局：沈浩身份揭晓，两人携手登顶商界巅峰，让所有看不起他的人悔恨终生。`,
    polish: `【文本润色】\n沈浩冷冷地看着赵公子：“你说苏家不配，那我配吗？”他随手丢出一张通体漆黑的至尊龙卡。赵公子的脸色瞬间从张狂变得煞白，冷汗顺着额头流下。这张卡，全球仅此一张，代表着那个富可敌国的沈氏家族！`,
    expand: `【情节扩写】\n昏暗的走廊里，苏晴紧紧攥着那份破产协议，指尖因为用力而泛白。沈浩走到她身后，轻轻拍了拍她的肩膀，声音低沉而有力：“别怕，有我在。”苏晴猛地转过头，在沈浩那双平日里平淡无奇的眸子里，她第一次看到了足以吞噬一切的深邃与霸气。`,
    rewrite: `【创意改写】\n如果沈浩不是为了报恩入赘，而是为了寻找失踪的亲生父亲而潜伏呢？他每在苏家受一次委屈，就离真相更近一步。当他最终发现苏家老爷子正是当年陷害父亲的真凶之一，他该如何在爱人与仇恨之间做出最终的抉择？`
  };

  const targetText = mockPrompts[key] || '【灵感内容】：这是一个关于重生与反击的爆爽故事...';
  
  // Simulated Typing Effect
  let currentPos = 0;
  const speed = 20; // ms per character
  
  const typeNextChar = () => {
    if (currentPos < targetText.length) {
      aiPrompt.value += targetText.charAt(currentPos);
      currentPos++;
      setTimeout(typeNextChar, speed);
    } else {
      isGenerating.value = false;
    }
  };

  setTimeout(typeNextChar, 500); // Initial delay
};

const startCreation = () => {
  if (!aiPrompt.value.trim()) {
    ElMessage.warning('请输入创作灵感或点击上方建议');
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
