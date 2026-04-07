<template>
  <div class="ai-synthesis-container p-6 bg-slate-50 min-h-screen font-sans text-slate-900">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <header class="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 class="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            AI 短剧视频合成工作台
          </h1>
          <p class="text-slate-500 text-sm mt-1">基于 BGM 节奏自动对齐分镜，开启智能创作</p>
        </div>
        <div class="flex items-center gap-4">
          <div :class="['px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2', 
            isDurationValid ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100']">
            <span class="w-2 h-2 rounded-full" :class="isDurationValid ? 'bg-emerald-500' : 'bg-amber-500'"></span>
            {{ durationStatusText }}
          </div>
          <button 
            @click="handleFullSynthesis"
            :disabled="!canSynthesize || isSynthesizing"
            class="h-11 px-8 rounded-full font-bold text-white shadow-lg transition-all flex items-center gap-2
              enabled:bg-indigo-600 enabled:hover:bg-indigo-700 enabled:hover:scale-105 enabled:active:scale-95
              disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            <span v-if="isSynthesizing" class="animate-spin text-xl">◌</span>
            {{ isSynthesizing ? '合成中...' : '合成全集' }}
          </button>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left Column: Configuration Panels -->
        <div class="lg:col-span-4 space-y-6">
          <!-- 1. BGM Configuration Panel -->
          <section class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-bold flex items-center gap-2">
                <span class="flex items-center justify-center w-6 h-6 bg-indigo-100 text-indigo-600 rounded-lg text-xs">1</span>
                BGM 背景音乐
              </h2>
              <span v-if="bgm.duration" class="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">
                {{ formatDuration(bgm.duration) }}
              </span>
            </div>

            <div v-if="!bgm.file && !bgm.name" class="space-y-3">
              <div 
                @click="triggerFileUpload"
                class="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/30 cursor-pointer transition-all group"
              >
                <div class="text-3xl mb-2 group-hover:scale-110 transition-transform">🎵</div>
                <p class="text-sm font-medium text-slate-600">点击上传或拖拽音频文件</p>
                <p class="text-xs text-slate-400 mt-1">支持 mp3, wav, m4a</p>
                <input type="file" ref="fileInput" class="hidden" accept="audio/*" @change="handleFileUpload" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <button @click="handleOnlineSelect" class="py-2 px-4 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">在线库选择</button>
                <button @click="handleAiGenerate" class="py-2 px-4 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-black transition-colors">AI 智能生成</button>
              </div>
            </div>

            <div v-else class="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xl">
                  {{ isPlaying ? '⏸' : '▶' }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-slate-800 truncate">{{ bgm.name }}</p>
                  <p class="text-xs text-indigo-600 font-medium">时长锁定: {{ formatDuration(bgm.duration) }}</p>
                </div>
                <button @click="resetBgm" class="text-slate-400 hover:text-red-500 p-1">✕</button>
              </div>
            </div>
          </section>

          <!-- 2. AI Beat Matching Panel -->
          <section class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100" :class="{'opacity-50 pointer-events-none': !bgm.duration}">
            <h2 class="text-lg font-bold flex items-center gap-2 mb-4">
              <span class="flex items-center justify-center w-6 h-6 bg-indigo-100 text-indigo-600 rounded-lg text-xs">2</span>
              AI 卡点配置
            </h2>
            <div class="space-y-4">
              <div v-for="(val, key) in aiConfig" :key="key" class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div class="flex items-center gap-3">
                  <span class="text-xl">{{ aiConfigIcons[key] }}</span>
                  <div>
                    <p class="text-sm font-bold">{{ aiConfigLabels[key] }}</p>
                    <p class="text-[10px] text-slate-400">{{ aiConfigDesc[key] }}</p>
                  </div>
                </div>
                <button 
                  @click="aiConfig[key] = !aiConfig[key]"
                  :class="['w-10 h-5 rounded-full transition-all relative', aiConfig[key] ? 'bg-indigo-600' : 'bg-slate-300']"
                >
                  <div :class="['absolute top-1 w-3 h-3 bg-white rounded-full transition-all', aiConfig[key] ? 'left-6' : 'left-1']"></div>
                </button>
              </div>
            </div>
            
            <!-- Rhythm Visualizer Simulation -->
            <div v-if="bgm.duration" class="mt-6">
              <p class="text-xs font-bold text-slate-500 mb-2 flex justify-between">
                <span>节奏强度探测</span>
                <span class="text-indigo-600">已识别 24 个鼓点</span>
              </p>
              <div class="flex items-end gap-[2px] h-12 overflow-hidden">
                <div 
                  v-for="n in 40" 
                  :key="n" 
                  class="flex-1 bg-indigo-100 rounded-t-sm transition-all duration-500"
                  :style="{ height: `${Math.random() * 100}%`, backgroundColor: Math.random() > 0.8 ? '#4f46e5' : '' }"
                ></div>
              </div>
            </div>
          </section>
        </div>

        <!-- Right Column: Storyboard List -->
        <div class="lg:col-span-8">
          <section class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-full flex flex-col">
            <div class="p-6 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
              <h2 class="text-lg font-bold flex items-center gap-2">
                <span class="flex items-center justify-center w-6 h-6 bg-indigo-100 text-indigo-600 rounded-lg text-xs">3</span>
                分镜列表
              </h2>
              <div class="flex items-center gap-6">
                <div class="text-right">
                  <p class="text-xs text-slate-400">当前总时长</p>
                  <p :class="['text-xl font-black font-mono', isDurationValid ? 'text-slate-900' : 'text-red-500']">
                    {{ formatDuration(totalStoryboardDuration) }}
                  </p>
                </div>
                <button 
                  @click="addStoryboard"
                  class="h-10 px-4 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors flex items-center gap-2"
                >
                  <span>+</span> 添加分镜
                </button>
              </div>
            </div>

            <div class="flex-1 overflow-y-auto p-6 space-y-4 max-h-[calc(100vh-300px)]">
              <TransitionGroup name="list">
                <div 
                  v-for="(scene, index) in storyboards" 
                  :key="scene.id"
                  class="group flex gap-4 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/5 transition-all bg-white relative"
                >
                  <!-- Scene Number -->
                  <div class="w-10 h-10 flex-shrink-0 bg-slate-50 rounded-xl flex items-center justify-center font-bold text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    {{ String(index + 1).padStart(2, '0') }}
                  </div>

                  <!-- Scene Content -->
                  <div class="flex-1 space-y-3">
                    <div class="flex items-start justify-between gap-4">
                      <textarea 
                        v-model="scene.content"
                        placeholder="输入分镜描述或台词..."
                        class="w-full text-sm bg-transparent border-none p-0 focus:ring-0 resize-none h-auto min-h-[40px] font-medium placeholder:text-slate-300"
                        rows="2"
                      ></textarea>
                      <button @click="removeStoryboard(scene.id)" class="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all">✕</button>
                    </div>

                    <div class="flex items-center gap-4">
                      <!-- Duration Editor -->
                      <div class="flex items-center gap-2 bg-slate-50 rounded-lg p-1 px-3 border border-slate-100">
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">时长</span>
                        <input 
                          type="number" 
                          v-model.number="scene.duration" 
                          class="w-12 bg-transparent border-none p-0 text-sm font-bold text-indigo-600 focus:ring-0 text-center"
                          min="1"
                          max="60"
                        />
                        <span class="text-xs text-slate-400 font-medium">秒</span>
                      </div>
                      
                      <!-- AI Status Badge -->
                      <div v-if="bgm.duration" class="flex items-center gap-1.5">
                        <span class="w-1.5 h-1.5 rounded-full animate-pulse bg-indigo-400"></span>
                        <span class="text-[11px] font-medium text-indigo-400 italic">AI 自动对齐中...</span>
                      </div>
                    </div>
                  </div>

                  <!-- Scene Preview Placeholder -->
                  <div class="w-32 aspect-video bg-slate-100 rounded-xl flex items-center justify-center text-slate-300 overflow-hidden relative">
                    <img v-if="scene.preview" :src="scene.preview" class="w-full h-full object-cover" />
                    <span v-else class="text-[10px] font-bold uppercase">PREVIEW</span>
                  </div>
                </div>
              </TransitionGroup>
            </div>

            <!-- Empty State -->
            <div v-if="storyboards.length === 0" class="flex-1 flex flex-col items-center justify-center text-slate-400 py-20">
              <div class="text-5xl mb-4">🎬</div>
              <p class="text-sm font-medium">暂无分镜，点击上方按钮开始创作</p>
            </div>

            <!-- Footer Warning -->
            <div v-if="!isDurationValid && storyboards.length > 0" class="p-4 bg-amber-50 border-t border-amber-100 flex items-center gap-3">
              <span class="text-xl">⚠️</span>
              <div>
                <p class="text-sm font-bold text-amber-800">时长超出限制</p>
                <p class="text-xs text-amber-600">当前分镜总时长 ({{ formatDuration(totalStoryboardDuration) }}) 已超过 BGM 总时长 ({{ formatDuration(bgm.duration) }})，请调整分镜时长或更换更长的 BGM。</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- Synthesis Progress Overlay -->
    <div v-if="isSynthesizing" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div class="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl text-center space-y-6">
        <div class="relative w-32 h-32 mx-auto">
          <svg class="w-full h-full transform -rotate-90">
            <circle cx="64" cy="64" r="60" stroke="currentColor" stroke-width="8" fill="transparent" class="text-slate-100" />
            <circle cx="64" cy="64" r="60" stroke="currentColor" stroke-width="8" fill="transparent" 
              class="text-indigo-600 transition-all duration-300"
              :stroke-dasharray="377"
              :stroke-dashoffset="377 - (377 * synthesisProgress / 100)"
            />
          </svg>
          <div class="absolute inset-0 flex items-center justify-center text-2xl font-black text-indigo-600">
            {{ synthesisProgress }}%
          </div>
        </div>
        <div>
          <h3 class="text-xl font-bold text-slate-900">正在合成短剧全集</h3>
          <p class="text-slate-500 text-sm mt-2">{{ synthesisStatusMsg }}</p>
        </div>
        <div class="space-y-2">
          <div v-for="(step, i) in synthesisSteps" :key="i" class="flex items-center gap-3 text-sm">
            <div :class="['w-5 h-5 rounded-full flex items-center justify-center text-[10px]', 
              i < currentStep ? 'bg-emerald-500 text-white' : i === currentStep ? 'bg-indigo-600 text-white animate-pulse' : 'bg-slate-100 text-slate-400']">
              {{ i < currentStep ? '✓' : i + 1 }}
            </div>
            <span :class="[i === currentStep ? 'text-indigo-600 font-bold' : i < currentStep ? 'text-slate-900' : 'text-slate-400']">
              {{ step }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue';

// --- Types ---
interface BGM {
  name: string;
  duration: number; // in seconds
  file: File | null;
  status: 'none' | 'ready';
}

interface Storyboard {
  id: number;
  content: string;
  duration: number; // in seconds
  preview?: string;
}

// --- State ---
const bgm = reactive<BGM>({
  name: '',
  duration: 0,
  file: null,
  status: 'none'
});

const storyboards = ref<Storyboard[]>([
  { id: 1, content: '在繁华的都市街头，男主孤独地走着。', duration: 6 },
  { id: 2, content: '突然，一辆豪车停在面前。', duration: 3 },
  { id: 3, content: '车窗缓缓降下，露出一张熟悉的脸。', duration: 6 }
]);

const aiConfig = reactive<Record<string, boolean>>({
  rhythm: true,
  transition: true,
  emotion: true
});

const aiConfigLabels: Record<string, string> = {
  rhythm: 'BGM 节奏同步',
  transition: '智能转场卡点',
  emotion: '情绪氛围匹配'
};

const aiConfigDesc: Record<string, string> = {
  rhythm: '自动识别重音鼓点，对齐剪辑点',
  transition: '根据画面内容自动选择转场特效',
  emotion: '根据台词意境自动调节色调和特效'
};

const aiConfigIcons: Record<string, string> = {
  rhythm: '🥁',
  transition: '🎬',
  emotion: '✨'
};

const isSynthesizing = ref(false);
const synthesisProgress = ref(0);
const currentStep = ref(0);
const synthesisSteps = [
  '正在提取音频特征及节奏点...',
  '智能对齐分镜台词与画面...',
  '正在进行渲染与后期转场合成...',
  '正在生成 4K 超清正片文件...'
];

const fileInput = ref<HTMLInputElement | null>(null);
const isPlaying = ref(false);

// --- Computed ---
const totalStoryboardDuration = computed(() => {
  return storyboards.value.reduce((acc, curr) => acc + (curr.duration || 0), 0);
});

const isDurationValid = computed(() => {
  if (!bgm.duration) return false;
  return bgm.duration >= totalStoryboardDuration.value;
});

const durationStatusText = computed(() => {
  if (!bgm.duration) return '待配置 BGM';
  if (isDurationValid.value) return '时长匹配成功';
  return `时长不足 (差 ${totalStoryboardDuration.value - bgm.duration}s)`;
});

const canSynthesize = computed(() => {
  return bgm.status === 'ready' && isDurationValid.value && storyboards.value.length > 0;
});

const synthesisStatusMsg = computed(() => {
  return synthesisSteps[currentStep.value] || '即将完成...';
});

// --- Methods ---
const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const triggerFileUpload = () => {
  fileInput.value?.click();
};

const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    bgm.file = file;
    bgm.name = file.name;
    // 模拟获取时长 (实际应用中需使用 AudioContext 或 Audio 对象获取)
    bgm.duration = Math.floor(Math.random() * 60) + 60; // 随机 60-120s
    bgm.status = 'ready';
  }
};

const handleOnlineSelect = () => {
  bgm.name = '在线库背景音 - 悬疑热血';
  bgm.duration = 90;
  bgm.status = 'ready';
};

const handleAiGenerate = () => {
  bgm.name = 'AI 智能生成背景音乐';
  bgm.duration = 120;
  bgm.status = 'ready';
};

const resetBgm = () => {
  bgm.file = null;
  bgm.name = '';
  bgm.duration = 0;
  bgm.status = 'none';
};

const addStoryboard = () => {
  const newId = storyboards.value.length > 0 ? Math.max(...storyboards.value.map(s => s.id)) + 1 : 1;
  storyboards.value.push({
    id: newId,
    content: '',
    duration: 5
  });
};

const removeStoryboard = (id: number) => {
  storyboards.value = storyboards.value.filter(s => s.id !== id);
};

const handleFullSynthesis = () => {
  if (!canSynthesize.value) return;
  
  isSynthesizing.value = true;
  synthesisProgress.value = 0;
  currentStep.value = 0;
  
  const timer = setInterval(() => {
    synthesisProgress.value += 1;
    
    // 模拟步骤切换
    if (synthesisProgress.value === 25) currentStep.value = 1;
    if (synthesisProgress.value === 50) currentStep.value = 2;
    if (synthesisProgress.value === 75) currentStep.value = 3;
    
    if (synthesisProgress.value >= 100) {
      clearInterval(timer);
      setTimeout(() => {
        isSynthesizing.value = false;
        alert('✨ 合成成功！已生成 AI 短剧正片。');
      }, 500);
    }
  }, 100);
};

// 监听分镜时长变化，触发 AI 卡点逻辑（模拟）
watch(totalStoryboardDuration, (newVal) => {
  console.log(`总时长变化: ${newVal}s, 正在重新计算 AI 卡点参数...`);
});
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* 隐藏输入框上下箭头 */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
}

.ai-synthesis-container {
  /* 自定义滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}

.ai-synthesis-container::-webkit-scrollbar {
  width: 6px;
}

.ai-synthesis-container::-webkit-scrollbar-track {
  background: transparent;
}

.ai-synthesis-container::-webkit-scrollbar-thumb {
  background-color: #e2e8f0;
  border-radius: 20px;
}
</style>
