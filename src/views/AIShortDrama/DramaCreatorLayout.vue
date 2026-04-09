<template>
  <div class="h-full flex flex-col bg-[#F8FAFC] dark:bg-slate-900 overflow-hidden relative ai-drama-container">
    <!-- Header Steps -->
    <div class="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md p-3 border-b border-slate-100 dark:border-slate-700/50 shadow-sm shrink-0 flex justify-center z-20 relative">
      <div class="bg-white/80 dark:bg-slate-900/80 rounded-full px-6 py-1.5 flex items-center gap-12 justify-between border border-white dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
        <!-- Product Design Info Button -->
        <button 
          @click="showDesignDialog = true"
          class="absolute -right-12 translate-x-full top-1/2 -translate-y-1/2 h-8 px-3 flex items-center gap-1.5 bg-white/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 rounded-full font-medium text-[11px] shadow-sm border border-slate-100 dark:border-slate-700 hover:text-indigo-600 hover:border-indigo-200 transition-all duration-300 backdrop-blur-sm"
        >
          <el-icon :size="12"><InfoFilled /></el-icon>
          <span>设计说明</span>
        </button>

        <!-- Step 1 -->
        <div 
          class="flex items-center gap-3 cursor-pointer group relative py-1"
          @click="goToStep(0, '/ai-short-drama-creator/outline')"
        >
          <div 
            class="w-8 h-8 rounded-full flex items-center justify-center text-[12px] transition-all duration-500 relative z-10"
            :class="activeStep >= 0 ? (activeStep > 0 ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-200' : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white font-bold scale-110 shadow-xl shadow-indigo-500/30 ring-4 ring-indigo-500/10') : 'border-2 border-slate-200 text-slate-400 bg-slate-50'"
          >
            <el-icon v-if="activeStep > 0" :size="16"><Check /></el-icon>
            <span v-else>01</span>
          </div>
          <div class="flex flex-col justify-center">
            <span 
              class="text-[13px] leading-tight transition-all duration-300"
              :class="activeStep >= 0 ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-400 font-medium'"
            >剧本创作</span>
            <span class="text-[9px] opacity-60 font-bold uppercase tracking-tighter" :class="activeStep >= 0 ? 'text-indigo-600' : 'text-slate-400'">STEP ONE</span>
          </div>
          
          <!-- Connector -->
          <div class="absolute left-[calc(100%+12px)] w-6 h-[2px] bg-slate-100 dark:bg-slate-700 top-1/2 -translate-y-1/2 overflow-hidden rounded-full">
            <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 ease-in-out" :style="{ width: activeStep > 0 ? '100%' : '0%' }"></div>
          </div>
        </div>

        <!-- Step 2 -->
        <div 
          class="flex items-center gap-3 group relative py-1"
          :class="isScriptGenerated ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'"
          @click="goToStep(1, '/ai-short-drama-creator/assets')"
        >
          <div 
            class="w-8 h-8 rounded-full flex items-center justify-center text-[12px] transition-all duration-500 relative z-10"
            :class="activeStep >= 1 ? (activeStep > 1 ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-200' : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white font-bold scale-110 shadow-xl shadow-indigo-500/30 ring-4 ring-indigo-500/10') : 'border-2 border-slate-200 text-slate-400 bg-slate-50'"
          >
            <el-icon v-if="activeStep > 1" :size="16"><Check /></el-icon>
            <span v-else>02</span>
          </div>
          <div class="flex flex-col justify-center">
            <span 
              class="text-[13px] leading-tight transition-all duration-300"
              :class="activeStep >= 1 ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-400 font-medium'"
            >主体设置</span>
            <span class="text-[9px] opacity-60 font-bold uppercase tracking-tighter" :class="activeStep >= 1 ? 'text-indigo-600' : 'text-slate-400'">STEP TWO</span>
          </div>

          <!-- Connector -->
          <div class="absolute left-[calc(100%+12px)] w-6 h-[2px] bg-slate-100 dark:bg-slate-700 top-1/2 -translate-y-1/2 overflow-hidden rounded-full">
            <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 ease-in-out" :style="{ width: activeStep > 1 ? '100%' : '0%' }"></div>
          </div>
        </div>

        <!-- Step 3 -->
        <div 
          class="flex items-center gap-3 group py-1"
          :class="isScriptGenerated ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'"
          @click="goToStep(2, '/ai-short-drama-creator/storyboard')"
        >
          <div 
            class="w-8 h-8 rounded-full flex items-center justify-center text-[12px] transition-all duration-500 relative z-10"
            :class="activeStep >= 2 ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white font-bold scale-110 shadow-xl shadow-indigo-500/30 ring-4 ring-indigo-500/10' : 'border-2 border-slate-200 text-slate-400 bg-slate-50'"
          >
            <span>03</span>
          </div>
          <div class="flex flex-col justify-center">
            <span 
              class="text-[13px] leading-tight transition-all duration-300"
              :class="activeStep >= 2 ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-400 font-medium'"
            >分镜视频</span>
            <span class="text-[9px] opacity-60 font-bold uppercase tracking-tighter" :class="activeStep >= 2 ? 'text-indigo-600' : 'text-slate-400'">STEP THREE</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-h-0 overflow-hidden relative z-10">
      <div class="flex-1 overflow-hidden" :class="{ 'p-4 sm:p-6 lg:p-8': activeStep !== 2 }">
        <div 
          class="h-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-2xl shadow-indigo-500/5 border border-slate-100 dark:border-slate-700 overflow-hidden transition-all duration-500"
          :class="activeStep === 2 ? 'rounded-0' : 'rounded-[40px]'"
        >
          <router-view />
        </div>
      </div>
    </div>

    <!-- Product Design Dialog -->
    <el-dialog v-model="showDesignDialog" title="产品设计说明 - 全局工作台" width="700px" class="rounded-[24px] !bg-[#f8fafc] dark:!bg-slate-900 overflow-hidden" :show-close="false">
      <template #header="{ close, titleId, titleClass }">
        <div class="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
              <el-icon :size="20"><Document /></el-icon>
            </div>
            <h4 :id="titleId" :class="[titleClass, 'text-xl font-black text-slate-800 dark:text-white m-0']">产品设计说明 - 创作框架</h4>
          </div>
          <button @click="close" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
            <el-icon :size="20"><Close /></el-icon>
          </button>
        </div>
      </template>
      
      <div class="px-6 py-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
        <div class="prose dark:prose-invert max-w-none">
          <h3 class="text-indigo-600 font-bold flex items-center gap-2 mb-4"><el-icon><Location /></el-icon>页面定位</h3>
          <p class="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">整个短剧创作引擎的母版（Layout），承载全局导航、状态管理和进度指引。</p>

          <h3 class="text-indigo-600 font-bold flex items-center gap-2 mb-4"><el-icon><Monitor /></el-icon>原型布局概要</h3>
          <ul class="space-y-3 mb-6">
            <li class="flex items-start gap-2 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-50 dark:border-slate-700/50">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
              <span class="text-slate-600 dark:text-slate-300"><strong>顶部通栏：</strong>创作进度步进器（剧本创作 ➔ 主体设置 ➔ 分集视频），视觉上通过渐变进度条连接。</span>
            </li>
            <li class="flex items-start gap-2 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-50 dark:border-slate-700/50">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
              <span class="text-slate-600 dark:text-slate-300"><strong>中央工作区：</strong>承载各子路由视图（大纲、资产、分镜等），统一的卡片式内阴影容器。</span>
            </li>
          </ul>

          <h3 class="text-indigo-600 font-bold flex items-center gap-2 mb-4"><el-icon><Pointer /></el-icon>核心交互</h3>
          <ul class="space-y-3">
            <li class="flex items-start gap-2 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-50 dark:border-slate-700/50">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
              <span class="text-slate-600 dark:text-slate-300"><strong>非线性跳转与校验：</strong>点击顶部的进度节点切换视图。如果未完成前置步骤（如未生成剧本），系统会拦截跳转并提示“请先生成剧本正文内容”。</span>
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
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDramaStore } from '../../store/drama';
import { Check, InfoFilled, Close, Document, Location, Monitor, Pointer } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const dramaStore = useDramaStore();
const showDesignDialog = ref(false);

const activeStep = computed(() => {
  switch (route.name) {
    case 'drama-outline': return 0;
    case 'drama-assets': return 1;
    case 'drama-storyboard': return 2;
    default: return 0;
  }
});

const isScriptGenerated = computed(() => dramaStore.isScriptGenerated);

const goToStep = (step: number, path: string) => {
  if (step === 0) {
    router.push(path);
    return;
  }
  
  // 如果没有生成剧本，且不是当前步骤（防止刷新状态没同步时的误判，虽然有 store 应该没问题）
  if (!isScriptGenerated.value && step > 0) {
    ElMessage.warning('请先生成剧本正文内容，再进行后续设置');
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
