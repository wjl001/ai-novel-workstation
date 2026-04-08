<template>
  <div class="h-full flex flex-col bg-[#F8FAFC] dark:bg-slate-900 overflow-hidden relative ai-drama-container">
    <!-- Header Steps -->
    <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-4 border-b border-slate-100 dark:border-slate-700/50 shadow-sm shrink-0 flex justify-center z-20">
      <div class="bg-slate-50 dark:bg-slate-900/50 rounded-2xl px-8 py-2 flex items-center min-w-[720px] justify-between border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
        <!-- Step 1 -->
        <div 
          class="flex items-center gap-4 cursor-pointer group relative py-1.5"
          @click="goToStep(0, '/ai-short-drama-creator/outline')"
        >
          <div 
            class="w-10 h-10 rounded-2xl flex items-center justify-center text-[13px] transition-all duration-500 shadow-sm"
            :class="activeStep >= 0 ? (activeStep > 0 ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black scale-110 shadow-xl shadow-indigo-500/40 ring-4 ring-indigo-500/10') : 'border border-slate-300 text-slate-400 bg-white'"
          >
            <el-icon v-if="activeStep > 0" :size="20"><Check /></el-icon>
            <span v-else class="text-[14px]">01</span>
          </div>
          <div class="flex flex-col">
            <span 
              class="text-[15px] transition-all duration-300"
              :class="activeStep >= 0 ? 'text-slate-900 dark:text-white font-black' : 'text-slate-500 font-bold'"
            >剧本创作</span>
            <span class="text-[11px] text-slate-500 font-black uppercase tracking-widest -mt-0.5">Step One</span>
          </div>
          
          <!-- Connector -->
          <div class="absolute left-[calc(100%+24px)] w-[80px] h-[3px] bg-slate-200 dark:bg-slate-700 top-1/2 -translate-y-1/2 overflow-hidden rounded-full">
            <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 ease-in-out" :style="{ width: activeStep > 0 ? '100%' : '0%' }"></div>
          </div>
        </div>

        <!-- Step 2 -->
        <div 
          class="flex items-center gap-4 group relative py-1.5"
          :class="isScriptGenerated ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'"
          @click="goToStep(1, '/ai-short-drama-creator/assets')"
        >
          <div 
            class="w-10 h-10 rounded-2xl flex items-center justify-center text-[13px] transition-all duration-500 shadow-sm"
            :class="activeStep >= 1 ? (activeStep > 1 ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black scale-110 shadow-xl shadow-indigo-500/40 ring-4 ring-indigo-500/10') : 'border border-slate-300 text-slate-400 bg-white'"
          >
            <el-icon v-if="activeStep > 1" :size="20"><Check /></el-icon>
            <span v-else class="text-[14px]">02</span>
          </div>
          <div class="flex flex-col">
            <span 
              class="text-[15px] transition-all duration-300"
              :class="activeStep >= 1 ? 'text-slate-900 dark:text-white font-black' : 'text-slate-500 font-bold'"
            >主体设置</span>
            <span class="text-[11px] text-slate-500 font-black uppercase tracking-widest -mt-0.5">Step Two</span>
          </div>

          <!-- Connector -->
          <div class="absolute left-[calc(100%+24px)] w-[80px] h-[3px] bg-slate-200 dark:bg-slate-700 top-1/2 -translate-y-1/2 overflow-hidden rounded-full">
            <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 ease-in-out" :style="{ width: activeStep > 1 ? '100%' : '0%' }"></div>
          </div>
        </div>

        <!-- Step 3 -->
        <div 
          class="flex items-center gap-4 group py-1.5"
          :class="isScriptGenerated ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'"
          @click="goToStep(2, '/ai-short-drama-creator/episodes')"
        >
          <div 
            class="w-10 h-10 rounded-2xl flex items-center justify-center text-[13px] transition-all duration-500 shadow-sm"
            :class="activeStep >= 2 ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black scale-110 shadow-xl shadow-indigo-500/40 ring-4 ring-indigo-500/10' : 'border border-slate-300 text-slate-400 bg-white'"
          >
            <span class="text-[14px]">03</span>
          </div>
          <div class="flex flex-col">
            <span 
              class="text-[15px] transition-all duration-300"
              :class="activeStep >= 2 ? 'text-slate-900 dark:text-white font-black' : 'text-slate-500 font-bold'"
            >分集视频</span>
            <span class="text-[11px] text-slate-500 font-black uppercase tracking-widest -mt-0.5">Step Three</span>
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDramaStore } from '../../store/drama';
import { Check } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const dramaStore = useDramaStore();

const activeStep = computed(() => {
  switch (route.name) {
    case 'drama-outline': return 0;
    case 'drama-assets': return 1;
    case 'drama-episodes': return 2;
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
