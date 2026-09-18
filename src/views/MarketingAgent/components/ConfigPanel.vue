<template>
  <div class="config-panel space-y-6">
    <!-- 场景模板 -->
    <div>
      <h3 class="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
        <span class="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">1</span>
        选择营销场景模板
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          v-for="tpl in templates"
          :key="tpl.id"
          @click="$emit('selectTemplate', tpl.id)"
          :class="['relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:-translate-y-0.5',
            selectedTemplateId === tpl.id
              ? 'shadow-lg'
              : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md']"
          :style="selectedTemplateId === tpl.id ? { borderColor: tpl.color, backgroundColor: tpl.color + '08' } : {}"
        >
          <div class="text-2xl mb-2">{{ tpl.icon }}</div>
          <div class="text-sm font-bold text-slate-800 mb-1">{{ tpl.name }}</div>
          <div class="text-[10px] text-slate-400 leading-relaxed line-clamp-2">{{ tpl.description }}</div>
          <div class="text-[10px] text-slate-400 mt-2">{{ tpl.avgDuration }}</div>
          <div v-if="selectedTemplateId === tpl.id" class="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center" :style="{ backgroundColor: tpl.color }">
            <el-icon :size="10" class="text-white"><Check /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 脚本风格（多选） -->
    <div>
      <h3 class="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
        <span class="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-xs">2</span>
        选择生成风格
        <span class="text-[10px] font-normal text-slate-400 ml-1">（可多选，并行生成）</span>
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          v-for="style in styles"
          :key="style.id"
          @click="$emit('toggleStyle', style.id)"
          :class="['relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:-translate-y-0.5',
            selectedStyleIds.includes(style.id)
              ? 'shadow-lg'
              : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md']"
          :style="selectedStyleIds.includes(style.id) ? { borderColor: style.color, backgroundColor: style.color + '08' } : {}"
        >
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">{{ style.emoji }}</span>
            <span class="text-sm font-bold text-slate-800">{{ style.name }}</span>
          </div>
          <div class="text-[10px] text-slate-400 leading-relaxed line-clamp-2">{{ style.description }}</div>
          <div class="text-[10px] text-slate-400 mt-2">{{ style.tone }}</div>
          <div v-if="selectedStyleIds.includes(style.id)" class="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center" :style="{ backgroundColor: style.color }">
            <el-icon :size="10" class="text-white"><Check /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 目标平台（多选） -->
    <div>
      <h3 class="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
        <span class="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">3</span>
        适配发布平台
        <span class="text-[10px] font-normal text-slate-400 ml-1">（自动适配尺寸、时长、字幕规范）</span>
      </h3>
      <div class="grid grid-cols-3 md:grid-cols-6 gap-3">
        <div
          v-for="plat in platforms"
          :key="plat.id"
          @click="$emit('togglePlatform', plat.id)"
          :class="['relative p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 text-center hover:-translate-y-0.5',
            selectedPlatformIds.includes(plat.id)
              ? 'shadow-lg'
              : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md']"
          :style="selectedPlatformIds.includes(plat.id) ? { borderColor: plat.color, backgroundColor: plat.color + '08' } : {}"
        >
          <div class="text-xl mb-1">{{ plat.icon }}</div>
          <div class="text-xs font-bold text-slate-800">{{ plat.name }}</div>
          <div class="text-[9px] text-slate-400 mt-0.5">{{ plat.ratio }} · {{ plat.duration.recommended }}s</div>
          <div v-if="selectedPlatformIds.includes(plat.id)" class="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center" :style="{ backgroundColor: plat.color }">
            <el-icon :size="9" class="text-white"><Check /></el-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check } from '@element-plus/icons-vue';
import { MARKETING_TEMPLATES } from '../data/templates';
import { PLATFORM_CONFIGS } from '../data/platforms';
import { SCRIPT_STYLES } from '../data/styles';

defineProps<{
  selectedTemplateId: string;
  selectedStyleIds: string[];
  selectedPlatformIds: string[];
}>();

defineEmits<{
  (e: 'selectTemplate', id: string): void;
  (e: 'toggleStyle', id: string): void;
  (e: 'togglePlatform', id: string): void;
}>();

const templates = MARKETING_TEMPLATES;
const styles = SCRIPT_STYLES;
const platforms = PLATFORM_CONFIGS;
</script>
