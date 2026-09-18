<template>
  <div class="h-full flex flex-col bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-900 dark:via-indigo-950/20 dark:to-purple-950/20 overflow-hidden relative ai-drama-container">
    <!-- 背景装饰光晕 -->
    <div class="absolute top-0 left-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl pointer-events-none"></div>

    <!-- Teleport Header Elements -->
    <Teleport to="#header-back-button" v-if="isMounted">
      <div class="group mr-2">
        <button 
          @click="router.back()" 
          class="flex items-center justify-center w-8 h-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-white/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-110 hover:shadow-indigo-500/20 active:scale-95 transition-all duration-300"
        >
          <el-icon :size="16"><ArrowLeft /></el-icon>
        </button>
      </div>
    </Teleport>

    <Teleport to="#header-center" v-if="isMounted">
      <div class="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-full px-6 py-2.5 flex items-center gap-6 justify-between border border-white/60 dark:border-slate-700/60 shadow-[0_8px_32px_rgba(99,102,241,0.12)] relative scale-90 origin-center transform hover:shadow-[0_12px_40px_rgba(99,102,241,0.18)] transition-all duration-500">
        
        <!-- Step 1: 剧本创作 -->
        <div 
          class="flex items-center gap-3 cursor-pointer group relative py-0.5"
          @click="goToStep(0, '/ai-short-drama-creator/outline')"
        >
          <div 
            class="w-9 h-9 rounded-full flex items-center justify-center text-[13px] transition-all duration-500 relative z-10 group-hover:scale-105"
            :class="activeStep >= 0 ? (activeStep > 0 ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white font-black scale-110 shadow-[0_0_24px_rgba(168,85,247,0.5)] ring-4 ring-indigo-500/20') : 'border-2 border-slate-200 text-slate-400 bg-slate-50/80'"
          >
            <el-icon v-if="activeStep > 0" :size="18"><Check /></el-icon>
            <span v-else>01</span>
          </div>
          <div class="flex flex-col justify-center">
            <span 
              class="text-[15px] leading-tight transition-all duration-300"
              :class="activeStep >= 0 ? 'text-slate-900 dark:text-white font-black' : 'text-slate-400 font-bold'"
            >剧本创作</span>
            <span class="text-[9px] font-black uppercase tracking-widest mt-0.5" :class="activeStep >= 0 ? 'text-indigo-500' : 'text-slate-400'">STEP ONE</span>
          </div>
          
          <!-- Connector -->
          <div class="absolute left-[calc(100%+8px)] w-10 h-[3px] bg-slate-100 dark:bg-slate-700 top-1/2 -translate-y-1/2 overflow-hidden rounded-full">
            <div class="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-700 ease-in-out" :style="{ width: activeStep > 0 ? '100%' : '0%' }"></div>
          </div>
        </div>

        <!-- Step 2: 主体设置 -->
        <div 
          class="flex items-center gap-3 group relative py-0.5"
          :class="canGoToAssets ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'"
          @click="goToStep(1, '/ai-short-drama-creator/assets')"
        >
          <div 
            class="w-9 h-9 rounded-full flex items-center justify-center text-[13px] transition-all duration-500 relative z-10 group-hover:scale-105"
            :class="assetsStepActive ? (assetsStepCompleted ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white font-black scale-110 shadow-[0_0_24px_rgba(168,85,247,0.5)] ring-4 ring-indigo-500/20') : 'border-2 border-slate-200 text-slate-400 bg-slate-50/80'"
          >
            <el-icon v-if="assetsStepCompleted" :size="18"><Check /></el-icon>
            <span v-else>02</span>
          </div>
          <div class="flex flex-col justify-center">
            <span 
              class="text-[15px] leading-tight transition-all duration-300"
              :class="assetsStepActive ? 'text-slate-900 dark:text-white font-black' : 'text-slate-400 font-bold'"
            >主体设置</span>
            <span class="text-[9px] font-black uppercase tracking-widest mt-0.5" :class="assetsStepActive ? 'text-indigo-500' : 'text-slate-400'">STEP TWO</span>
          </div>

          <!-- Connector -->
          <div class="absolute left-[calc(100%+8px)] w-10 h-[3px] bg-slate-100 dark:bg-slate-700 top-1/2 -translate-y-1/2 overflow-hidden rounded-full">
            <div class="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-700 ease-in-out" :style="{ width: assetsStepCompleted ? '100%' : '0%' }"></div>
          </div>
        </div>

        <!-- Step 3: 分镜视频 -->
        <div 
          class="flex items-center gap-3 group py-0.5"
          :class="canGoToStoryboard ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'"
          @click="goToStep(2, '/ai-short-drama-creator/storyboard')"
        >
          <div 
            class="w-9 h-9 rounded-full flex items-center justify-center text-[13px] transition-all duration-500 relative z-10 group-hover:scale-105"
            :class="storyboardStepActive ? 'bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white font-black scale-110 shadow-[0_0_24px_rgba(168,85,247,0.5)] ring-4 ring-indigo-500/20' : 'border-2 border-slate-200 text-slate-400 bg-slate-50/80'"
          >
            <span>03</span>
          </div>
          <div class="flex flex-col justify-center">
            <span 
              class="text-[15px] leading-tight transition-all duration-300"
              :class="storyboardStepActive ? 'text-slate-900 dark:text-white font-black' : 'text-slate-400 font-bold'"
            >分镜视频</span>
            <span class="text-[9px] font-black uppercase tracking-widest mt-0.5" :class="storyboardStepActive ? 'text-indigo-500' : 'text-slate-400'">STEP THREE</span>
          </div>
        </div>

        <!-- Product Design Info Button -->
        <button 
          @click="showDesignDialog = true"
          class="ml-2 h-8 px-3 flex items-center gap-1.5 bg-slate-50/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 rounded-full font-black text-[11px] shadow-sm border border-slate-100 dark:border-slate-700 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-indigo-500/10 transition-all duration-300 backdrop-blur-sm"
        >
          <el-icon :size="13"><InfoFilled /></el-icon>
          <span>设计说明</span>
        </button>
      </div>
    </Teleport>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-h-0 overflow-hidden relative z-10">
      <div class="flex-1 overflow-hidden relative" :class="{ 'p-4 sm:p-6 lg:p-8': activeStep !== storyboardStepIndex }">
        <div 
          class="h-full bg-white/75 dark:bg-slate-800/75 backdrop-blur-xl shadow-2xl shadow-indigo-500/8 border border-white/60 dark:border-slate-700/60 overflow-hidden transition-all duration-500 hover:shadow-indigo-500/12"
          :class="activeStep === storyboardStepIndex ? 'rounded-0' : 'rounded-[32px]'"
        >
          <router-view />
        </div>
      </div>
    </div>

    <!-- Product Design Dialog -->
    <ProductDesignDialog
      v-model="showDesignDialog"
      id="short-drama-layout"
      :default-content="{
        title: '创作框架',
        location: '整个短剧创作引擎的母版（Layout），承载全局导航、状态管理和进度指引。',
        layout: [
          '**顶部通栏：** 创作进度步进器，完整流程（剧本创作 ➔ 主体设置 ➔ 分镜视频）。',
          '**中央工作区：** 承载各子路由视图（大纲、资产、分镜等），统一的卡片式内阴影容器。'
        ],
        interactions: [
          '**流程引导：** 需按序创作，剧本创作完成后进入主体设置，主体设置完成后进入分镜视频创作。',
          '**智能引导：** 导航栏支持状态检测，指引用户按序完成创作流。'
        ],
        version: '2.3'
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDramaStore } from '../../store/drama';
import { Check, InfoFilled, ArrowLeft, ArrowRight } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import ProductDesignDialog from '@/components/Common/ProductDesignDialog.vue';

const route = useRoute();
const router = useRouter();
const dramaStore = useDramaStore();
const showDesignDialog = ref(false);
const isMounted = ref(false);

onMounted(() => {
  isMounted.value = true;
});

// 步骤索引：0=剧本, 1=主体, 2=分镜
const activeStep = computed(() => {
  switch (route.name) {
    case 'drama-outline': return 0;
    case 'drama-assets': return 1;
    case 'drama-storyboard': return 2;
    default: return 0;
  }
});

// 分镜步骤的索引（用于判断是否全屏）
const storyboardStepIndex = computed(() => 2);

// 主体设置步骤状态
const assetsStepActive = computed(() => {
  return activeStep.value >= 1;
});
const assetsStepCompleted = computed(() => {
  return activeStep.value > 1;
});

// 分镜步骤状态
const storyboardStepActive = computed(() => {
  return activeStep.value >= 2;
});

// 跳转权限
const canGoToAssets = computed(() => {
  return dramaStore.isScriptGenerated || activeStep.value >= 1;
});
const canGoToStoryboard = computed(() => {
  return dramaStore.isAssetsGenerated || activeStep.value >= storyboardStepIndex.value;
});

const goToStep = (step: number, path: string) => {
  // 允许跳转到当前步骤或之前的步骤
  if (step <= activeStep.value) {
    router.push(path);
    return;
  }
  
  // 跳转到后续步骤时的逻辑
  if (step === 1 && !dramaStore.isScriptGenerated) {
    ElMessage.warning('请先生成剧本正文内容，再进行后续设置');
    return;
  }

  if (step === storyboardStepIndex.value && !dramaStore.isAssetsGenerated) {
    ElMessage.warning('请先完成主体设置，再进行分镜视频创作');
    return;
  }
  
  router.push(path);
};


</script>

<style scoped>
/* 整个步骤项 */
.cursor-pointer {
  cursor: pointer;
}

</style>
