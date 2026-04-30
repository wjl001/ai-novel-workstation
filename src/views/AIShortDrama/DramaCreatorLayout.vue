<template>
  <div class="h-full flex flex-col bg-[#F8FAFC] dark:bg-slate-900 overflow-hidden relative ai-drama-container">
    <!-- Teleport Header Elements -->
    <Teleport to="#header-back-button" v-if="isMounted">
      <div class="group mr-2">
        <button 
          @click="router.back()" 
          class="flex items-center justify-center w-8 h-8 bg-white dark:bg-slate-800 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-white dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-110 active:scale-95 transition-all duration-300"
        >
          <el-icon :size="16"><ArrowLeft /></el-icon>
        </button>
      </div>
    </Teleport>

    <Teleport to="#header-center" v-if="isMounted">
      <div class="bg-white dark:bg-slate-900 rounded-full px-8 py-2 flex items-center gap-10 justify-between border border-white dark:border-slate-700 shadow-[0_4px_20px_rgba(0,0,0,0.08)] relative scale-90 origin-center transform">
        
        <!-- Step 1 -->
        <div 
          class="flex items-center gap-4 cursor-pointer group relative py-0.5"
          @click="goToStep(0, '/ai-short-drama-creator/outline')"
        >
          <div 
            class="w-10 h-10 rounded-full flex items-center justify-center text-[14px] transition-all duration-500 relative z-10"
            :class="activeStep >= 0 ? (activeStep > 0 ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-200' : 'bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white font-black scale-110 shadow-[0_0_20px_rgba(168,85,247,0.5)] ring-4 ring-indigo-500/20') : 'border-2 border-slate-200 text-slate-400 bg-slate-50'"
          >
            <el-icon v-if="activeStep > 0" :size="20"><Check /></el-icon>
            <span v-else>01</span>
          </div>
          <div class="flex flex-col justify-center">
            <span 
              class="text-[16px] leading-tight transition-all duration-300"
              :class="activeStep >= 0 ? 'text-slate-900 dark:text-white font-black' : 'text-slate-400 font-bold'"
            >剧本创作</span>
            <span class="text-[10px] font-black uppercase tracking-widest mt-0.5" :class="activeStep >= 0 ? 'text-indigo-500' : 'text-slate-400'">STEP ONE</span>
          </div>
          
          <!-- Connector -->
          <div class="absolute left-[calc(100%+12px)] w-8 h-[2px] bg-slate-100 dark:bg-slate-700 top-1/2 -translate-y-1/2 overflow-hidden rounded-full">
            <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 ease-in-out" :style="{ width: activeStep > 0 ? '100%' : '0%' }"></div>
          </div>
        </div>

        <!-- Step 2 -->
        <div 
          class="flex items-center gap-4 group relative py-0.5"
          :class="isScriptGenerated ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'"
          @click="goToStep(1, '/ai-short-drama-creator/assets')"
        >
          <div 
            class="w-10 h-10 rounded-full flex items-center justify-center text-[14px] transition-all duration-500 relative z-10"
            :class="activeStep >= 1 ? (activeStep > 1 ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-200' : 'bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white font-black scale-110 shadow-[0_0_20px_rgba(168,85,247,0.5)] ring-4 ring-indigo-500/20') : 'border-2 border-slate-200 text-slate-400 bg-slate-50'"
          >
            <el-icon v-if="activeStep > 1" :size="20"><Check /></el-icon>
            <span v-else>02</span>
          </div>
          <div class="flex flex-col justify-center">
            <span 
              class="text-[16px] leading-tight transition-all duration-300"
              :class="activeStep >= 1 ? 'text-slate-900 dark:text-white font-black' : 'text-slate-400 font-bold'"
            >主体设置</span>
            <span class="text-[10px] font-black uppercase tracking-widest mt-0.5" :class="activeStep >= 1 ? 'text-indigo-500' : 'text-slate-400'">STEP TWO</span>
          </div>

          <!-- Connector -->
          <div class="absolute left-[calc(100%+12px)] w-8 h-[2px] bg-slate-100 dark:bg-slate-700 top-1/2 -translate-y-1/2 overflow-hidden rounded-full">
            <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 ease-in-out" :style="{ width: activeStep > 1 ? '100%' : '0%' }"></div>
          </div>
        </div>

        <!-- Step 3 -->
        <div 
          class="flex items-center gap-4 group py-0.5"
          :class="isAssetsGenerated ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'"
          @click="goToStep(2, '/ai-short-drama-creator/storyboard')"
        >
          <div 
            class="w-10 h-10 rounded-full flex items-center justify-center text-[14px] transition-all duration-500 relative z-10"
            :class="activeStep >= 2 ? 'bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white font-black scale-110 shadow-[0_0_20px_rgba(168,85,247,0.5)] ring-4 ring-indigo-500/20' : 'border-2 border-slate-200 text-slate-400 bg-slate-50'"
          >
            <span>03</span>
          </div>
          <div class="flex flex-col justify-center">
            <span 
              class="text-[16px] leading-tight transition-all duration-300"
              :class="activeStep >= 2 ? 'text-slate-900 dark:text-white font-black' : 'text-slate-400 font-bold'"
            >分镜视频</span>
            <span class="text-[10px] font-black uppercase tracking-widest mt-0.5" :class="activeStep >= 2 ? 'text-indigo-500' : 'text-slate-400'">STEP THREE</span>
          </div>
        </div>

        <!-- Product Design Info Button -->
        <button 
          @click="showDesignDialog = true"
          class="ml-6 h-9 px-4 flex items-center gap-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full font-black text-[12px] shadow-sm border border-slate-100 dark:border-slate-700 hover:text-indigo-600 hover:border-indigo-200 transition-all duration-300 backdrop-blur-sm"
        >
          <el-icon :size="14"><InfoFilled /></el-icon>
          <span>设计说明</span>
        </button>
      </div>
    </Teleport>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-h-0 overflow-hidden relative z-10">
      <div class="flex-1 overflow-hidden relative" :class="{ 'p-4 sm:p-6 lg:p-8': activeStep !== 2 }">
        <div 
          class="h-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-2xl shadow-indigo-500/5 border border-slate-100 dark:border-slate-700 overflow-hidden transition-all duration-500"
          :class="activeStep === 2 ? 'rounded-0' : 'rounded-[40px]'"
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
          '**顶部通栏：** 创作进度步进器（剧本创作 ➔ 主体设置 ➔ 分集视频），视觉上通过渐变进度条连接。',
          '**中央工作区：** 承载各子路由视图（大纲、资产、分镜等），统一的卡片式内阴影容器。'
        ],
        interactions: [
          '**智能引导 (2.2版本)：** 导航栏支持状态检测，指引用户按序完成创作流，同时 2.2 版本放开了剧本编辑锁定限制。',
          '**功能说明 (2.2版本)：** \n - **剧集管理：** 2.2版本全面支持手动新增剧集大纲，剧集大纲的文字限制20-50，新增剧集大纲是在最后面新增。 \n - **AI 助手：** 全面开启 AI 智能助手，支持剧本正文引用与实时对话。'
        ],
        version: '2.2'
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDramaStore } from '../../store/drama';
import { Check, InfoFilled, Close, Document, Location, Monitor, Pointer, ArrowLeft, ArrowRight } from '@element-plus/icons-vue';
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

const activeStep = computed(() => {
  switch (route.name) {
    case 'drama-outline': return 0;
    case 'drama-assets': return 1;
    case 'drama-storyboard': return 2;
    default: return 0;
  }
});

const isScriptGenerated = computed(() => dramaStore.isScriptGenerated);
const isAssetsGenerated = computed(() => dramaStore.isAssetsGenerated);

const goToStep = (step: number, path: string) => {
  if (step === 0) {
    router.push(path);
    return;
  }
  
  // 如果没有生成剧本，且不是当前步骤（防止刷新状态没同步时的误判，虽然有 store 应该没问题）
  if (!isScriptGenerated.value && step === 1) {
    ElMessage.warning('请先生成剧本正文内容，再进行后续设置');
    return;
  }

  if (!isAssetsGenerated.value && step === 2) {
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
