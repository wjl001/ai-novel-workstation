<template>
  <div class="px-6 py-4 border-b transition-colors duration-300 shadow-md" :class="isLight ? 'bg-white border-slate-200' : 'bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700/50'">
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center justify-center gap-4">
        <div 
          v-for="(label, index) in steps" 
          :key="index"
          class="relative px-5 py-2 rounded-full border flex items-center gap-2.5 transition-all duration-300 select-none cursor-default"
          :class="[
            index === activeIndex 
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
              : isLight ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-slate-800/50 border-slate-700/50 text-slate-300'
          ]"
        >
          <!-- Number Badge -->
          <div 
            class="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border transition-colors"
            :class="[
              index === activeIndex
                ? 'bg-white/20 text-white border-white/30'
                : isLight ? 'border-slate-300 text-slate-400' : 'border-slate-600 text-slate-400'
            ]"
          >
            <span>{{ index + 1 }}</span>
          </div>
          
          <!-- Label -->
          <span class="text-sm tracking-wide" :class="{ 'font-bold': index === activeIndex }">
            {{ label }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'

const isLight = inject('isLight', ref(false))

withDefaults(defineProps<{
  activeIndex: number
  steps?: string[]
}>(), {
  steps: () => ['基础设定', '大纲生成', '剧本撰写']
})
</script>
