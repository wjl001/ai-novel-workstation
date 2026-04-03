<template>
  <div class="h-full flex flex-col bg-[#F8FAFC] dark:bg-slate-900 overflow-hidden relative">
    <!-- Header Steps -->
    <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-4 border-b border-slate-100 dark:border-slate-700/50 shadow-sm shrink-0 flex justify-center z-20">
      <div class="bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl px-6 py-1.5 flex items-center min-w-[640px] justify-between border border-slate-200/50 dark:border-slate-700/50">
        <!-- Step 1 -->
        <div 
          class="flex items-center gap-3 cursor-pointer group relative py-1.5"
          @click="$router.push('/ai-short-drama-creator/outline')"
        >
          <div 
            class="w-8 h-8 rounded-xl flex items-center justify-center text-[13px] transition-all duration-300 shadow-sm"
            :class="activeStep >= 0 ? (activeStep > 0 ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-indigo-600 text-white font-black scale-110 shadow-indigo-500/20') : 'border border-slate-300 text-slate-400 bg-white'"
          >
            <el-icon v-if="activeStep > 0"><Check /></el-icon>
            <span v-else>01</span>
          </div>
          <span 
            class="text-[14px] transition-all duration-300"
            :class="activeStep >= 0 ? 'text-slate-900 dark:text-white font-black' : 'text-slate-400 font-bold'"
          >剧本创作</span>
          
          <!-- Connector -->
          <div class="absolute left-[calc(100%+16px)] w-[100px] h-[2px] bg-slate-200 dark:bg-slate-700 top-1/2 -translate-y-1/2 overflow-hidden">
            <div class="h-full bg-indigo-500 transition-all duration-700 ease-in-out" :style="{ width: activeStep > 0 ? '100%' : '0%' }"></div>
          </div>
        </div>

        <!-- Step 2 -->
        <div 
          class="flex items-center gap-3 cursor-pointer group relative ml-16 py-1.5"
          @click="$router.push('/ai-short-drama-creator/assets')"
        >
          <div 
            class="w-8 h-8 rounded-xl flex items-center justify-center text-[13px] transition-all duration-300 shadow-sm"
            :class="activeStep >= 1 ? (activeStep > 1 ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-indigo-600 text-white font-black scale-110 shadow-indigo-500/20') : 'border border-slate-300 text-slate-400 bg-white'"
          >
            <el-icon v-if="activeStep > 1"><Check /></el-icon>
            <span v-else>02</span>
          </div>
          <span 
            class="text-[14px] transition-all duration-300"
            :class="activeStep >= 1 ? 'text-slate-900 dark:text-white font-black' : 'text-slate-400 font-bold'"
          >主体设置</span>

          <!-- Connector -->
          <div class="absolute left-[calc(100%+16px)] w-[100px] h-[2px] bg-slate-200 dark:bg-slate-700 top-1/2 -translate-y-1/2 overflow-hidden">
            <div class="h-full bg-indigo-500 transition-all duration-700 ease-in-out" :style="{ width: activeStep > 1 ? '100%' : '0%' }"></div>
          </div>
        </div>

        <!-- Step 3 -->
        <div 
          class="flex items-center gap-3 cursor-pointer group ml-16 py-1.5"
          @click="$router.push('/ai-short-drama-creator/episodes')"
        >
          <div 
            class="w-8 h-8 rounded-xl flex items-center justify-center text-[13px] transition-all duration-300 shadow-sm"
            :class="activeStep >= 2 ? 'bg-indigo-600 text-white font-black scale-110 shadow-indigo-500/20' : 'border border-slate-300 text-slate-400 bg-white'"
          >
            <span>03</span>
          </div>
          <span 
            class="text-[14px] transition-all duration-300"
            :class="activeStep >= 2 ? 'text-slate-900 dark:text-white font-black' : 'text-slate-400 font-bold'"
          >分集视频</span>
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
import { useRoute } from 'vue-router';

import { Check } from '@element-plus/icons-vue';

const route = useRoute();

const activeStep = computed(() => {
  switch (route.name) {
    case 'drama-outline': return 0;
    case 'drama-assets': return 1;
    case 'drama-episodes': return 2;
    default: return 0;
  }
});
</script>

<style scoped>
/* 整个步骤项 */
.cursor-pointer {
  cursor: pointer;
}
</style>
