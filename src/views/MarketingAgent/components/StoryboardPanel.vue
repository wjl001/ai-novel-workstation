<template>
  <div class="storyboard-panel">
    <div class="flex items-center justify-between mb-3">
      <h5 class="text-xs font-bold text-slate-700 flex items-center gap-1.5">
        <el-icon :size="14" :style="{ color: styleColor }"><Film /></el-icon>
        分镜脚本（{{ storyboard.length }} 镜）
      </h5>
      <span class="text-[10px] text-slate-400">总时长约 {{ totalDuration }}s</span>
    </div>

    <!-- 分镜时间轴 -->
    <div class="flex gap-1 mb-4 overflow-x-auto pb-1">
      <div
        v-for="shot in storyboard"
        :key="shot.id"
        class="flex-shrink-0 relative"
      >
        <div
          :class="['h-8 rounded-md flex items-center justify-center text-[10px] font-bold cursor-pointer transition-all',
            activeShot === shot.id ? 'text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300']"
          :style="activeShot === shot.id ? { backgroundColor: styleColor, minWidth: '48px' } : { minWidth: '40px' }"
          @click="activeShot = shot.id"
        >
          {{ shot.id }}
        </div>
        <div class="text-[8px] text-center text-slate-400 mt-0.5">{{ shot.duration }}</div>
      </div>
    </div>

    <!-- 当前分镜详情 -->
    <div v-if="currentShot" class="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold" :style="{ color: styleColor }">
          镜头 {{ currentShot.id }} · {{ currentShot.scene }}
        </span>
        <span class="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">{{ currentShot.duration }}</span>
      </div>

      <div class="grid grid-cols-1 gap-2.5">
        <div class="flex gap-2">
          <span class="flex-shrink-0 w-14 text-[10px] font-bold text-slate-400 pt-0.5">画面</span>
          <span class="text-xs text-slate-700 leading-relaxed flex-1">{{ currentShot.visual }}</span>
        </div>
        <div class="flex gap-2">
          <span class="flex-shrink-0 w-14 text-[10px] font-bold text-slate-400 pt-0.5">音频</span>
          <span class="text-xs text-slate-700 leading-relaxed flex-1">{{ currentShot.audio }}</span>
        </div>
        <div class="flex gap-2">
          <span class="flex-shrink-0 w-14 text-[10px] font-bold text-slate-400 pt-0.5">字幕</span>
          <span class="text-xs text-slate-700 leading-relaxed flex-1">{{ currentShot.textOverlay }}</span>
        </div>
        <div class="flex gap-3">
          <div class="flex gap-2">
            <span class="flex-shrink-0 text-[10px] font-bold text-slate-400 pt-0.5">运镜</span>
            <span class="text-xs text-slate-600">{{ currentShot.camera }}</span>
          </div>
          <div class="flex gap-2">
            <span class="flex-shrink-0 text-[10px] font-bold text-slate-400 pt-0.5">BGM</span>
            <span class="text-xs text-slate-600">{{ currentShot.bgm }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Film } from '@element-plus/icons-vue';
import type { StoryboardShot } from '../../../store/marketing';

const props = defineProps<{
  storyboard: StoryboardShot[];
  styleColor: string;
}>();

const activeShot = ref(1);

const currentShot = computed(() =>
  props.storyboard.find(s => s.id === activeShot.value) || props.storyboard[0]
);

const totalDuration = computed(() =>
  props.storyboard.reduce((sum, s) => sum + parseInt(s.duration) || 0, 0)
);
</script>
