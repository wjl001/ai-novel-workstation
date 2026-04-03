<template>
  <div class="h-full flex flex-col bg-[#F8FAFC] dark:bg-slate-900 overflow-hidden">
    <!-- Header Steps -->
    <div class="bg-white dark:bg-gray-800 p-4 border-b border-slate-100 dark:border-slate-700 shadow-sm shrink-0 flex justify-center">
      <div class="bg-[#F3F5F9] dark:bg-slate-800/80 rounded-full px-8 py-2.5 flex items-center min-w-[600px] justify-between">
        <!-- Step 1 -->
        <div 
          class="flex items-center gap-2 cursor-pointer group relative"
          @click="$router.push('/ai-short-drama-creator/outline')"
        >
          <div 
            class="w-6 h-6 rounded-full flex items-center justify-center text-[12px] transition-all"
            :class="activeStep >= 0 ? (activeStep > 0 ? 'bg-[#EEF2FF] text-[#6366f1]' : 'bg-[#6366f1] text-white font-bold') : 'border border-slate-300 text-slate-400 bg-white'"
          >
            <el-icon v-if="activeStep > 0"><Check /></el-icon>
            <span v-else>1</span>
          </div>
          <span 
            class="text-[14px] transition-colors"
            :class="activeStep >= 0 ? 'text-slate-900 font-bold' : 'text-slate-400 font-medium'"
          >剧本</span>
          
          <!-- Dashed Line 1-2 -->
          <div class="absolute left-[calc(100%+12px)] w-[120px] border-t border-dashed border-slate-300 top-1/2 -translate-y-1/2"></div>
        </div>

        <!-- Step 2 -->
        <div 
          class="flex items-center gap-2 cursor-pointer group relative ml-12"
          @click="$router.push('/ai-short-drama-creator/assets')"
        >
          <div 
            class="w-6 h-6 rounded-full flex items-center justify-center text-[12px] transition-all"
            :class="activeStep >= 1 ? (activeStep > 1 ? 'bg-[#EEF2FF] text-[#6366f1]' : 'bg-[#6366f1] text-white font-bold') : 'border border-slate-300 text-slate-400 bg-white'"
          >
            <el-icon v-if="activeStep > 1"><Check /></el-icon>
            <span v-else>2</span>
          </div>
          <span 
            class="text-[14px] transition-colors"
            :class="activeStep >= 1 ? 'text-slate-900 font-bold' : 'text-slate-400 font-medium'"
          >主体设置</span>

          <!-- Dashed Line 2-3 -->
          <div class="absolute left-[calc(100%+12px)] w-[120px] border-t border-dashed border-slate-300 top-1/2 -translate-y-1/2"></div>
        </div>

        <!-- Step 3 -->
        <div 
          class="flex items-center gap-2 cursor-pointer group ml-12"
          @click="$router.push('/ai-short-drama-creator/episodes')"
        >
          <div 
            class="w-6 h-6 rounded-full flex items-center justify-center text-[12px] transition-all"
            :class="activeStep >= 2 ? 'bg-[#6366f1] text-white font-bold' : 'border border-slate-300 text-slate-400 bg-white'"
          >
            <span>3</span>
          </div>
          <span 
            class="text-[14px] transition-colors"
            :class="activeStep >= 2 ? 'text-slate-900 font-bold' : 'text-slate-400 font-medium'"
          >分集视频</span>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div class="flex-1 overflow-hidden" :class="{ 'p-4 sm:p-6 lg:p-8': activeStep !== 2 }">
        <div 
          class="h-full bg-white dark:bg-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-700 overflow-hidden"
          :class="activeStep === 2 ? 'rounded-0' : 'rounded-2xl'"
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
