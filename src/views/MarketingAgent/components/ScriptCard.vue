<template>
  <div
    :class="['script-card relative rounded-2xl border-2 overflow-hidden transition-all duration-300 hover:shadow-xl',
      script.selected ? 'shadow-lg' : 'border-slate-100 bg-white hover:border-slate-200']"
    :style="script.selected ? { borderColor: script.styleColor, backgroundColor: script.styleColor + '05' } : {}"
  >
    <!-- 顶部色条 -->
    <div class="h-1.5" :style="{ backgroundColor: script.styleColor }"></div>

    <div class="p-5">
      <!-- 头部 -->
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center gap-2">
          <span class="text-xl">{{ script.styleEmoji }}</span>
          <div>
            <h4 class="text-sm font-bold text-slate-800 leading-tight">{{ script.styleName }}</h4>
            <p class="text-[10px] text-slate-400 mt-0.5">预估 {{ script.estimatedDuration }}s · {{ script.storyboard.length }} 个分镜</p>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <button
            @click="$emit('toggleSelect', script.id)"
            :class="['w-7 h-7 rounded-lg flex items-center justify-center transition-all',
              script.selected ? 'text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200']"
            :style="script.selected ? { backgroundColor: script.styleColor } : {}"
          >
            <el-icon :size="14"><Check /></el-icon>
          </button>
          <el-dropdown trigger="click" @command="handleCommand">
            <button class="w-7 h-7 rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 flex items-center justify-center transition-all">
              <el-icon :size="14"><MoreFilled /></el-icon>
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="copy">复制文案</el-dropdown-item>
                <el-dropdown-item command="export">导出脚本</el-dropdown-item>
                <el-dropdown-item command="regenerate">重新生成</el-dropdown-item>
                <el-dropdown-item command="delete" divided>删除方案</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 钩子 -->
      <div class="mb-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
        <div class="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">🎯 开场钩子</div>
        <p class="text-sm font-medium text-slate-800 leading-relaxed">{{ script.hook }}</p>
      </div>

      <!-- 正文预览 -->
      <div class="mb-3 space-y-2">
        <p v-for="(para, idx) in script.body.slice(0, 2)" :key="idx" class="text-xs text-slate-600 leading-relaxed line-clamp-2">
          {{ para }}
        </p>
        <p v-if="script.body.length > 2" class="text-[10px] text-slate-400">...还有 {{ script.body.length - 2 }} 段正文</p>
      </div>

      <!-- CTA -->
      <div class="mb-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
        <span class="text-[10px] font-bold text-slate-500">行动号召：</span>
        <span class="text-xs font-medium text-slate-700">{{ script.cta }}</span>
      </div>

      <!-- 话题标签 -->
      <div class="flex flex-wrap gap-1 mb-4">
        <span v-for="tag in script.hashtags.slice(0, 4)" :key="tag" class="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-medium">
          {{ tag }}
        </span>
        <span v-if="script.hashtags.length > 4" class="px-2 py-0.5 text-slate-400 text-[10px]">+{{ script.hashtags.length - 4 }}</span>
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-2">
        <button
          @click="$emit('toggleStoryboard', script.id)"
          :class="['flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1',
            showStoryboard ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200']"
          :style="showStoryboard ? { backgroundColor: script.styleColor } : {}"
        >
          <el-icon :size="13"><VideoCamera /></el-icon>
          {{ showStoryboard ? '收起分镜' : '查看分镜' }}
        </button>
        <button
          @click="$emit('copy', script)"
          class="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold transition-all flex items-center gap-1"
        >
          <el-icon :size="13"><CopyDocument /></el-icon>
          复制
        </button>
      </div>
    </div>

    <!-- 分镜展开 -->
    <div v-if="showStoryboard" class="border-t border-slate-100 bg-slate-50/50 p-4">
      <StoryboardPanel :storyboard="script.storyboard" :style-color="script.styleColor" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Check, MoreFilled, VideoCamera, CopyDocument } from '@element-plus/icons-vue';
import type { MarketingScript } from '../../../store/marketing';
import StoryboardPanel from './StoryboardPanel.vue';

const props = defineProps<{
  script: MarketingScript;
  showStoryboard: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggleSelect', id: string): void;
  (e: 'toggleStoryboard', id: string): void;
  (e: 'copy', script: MarketingScript): void;
  (e: 'export', script: MarketingScript): void;
  (e: 'regenerate', id: string): void;
  (e: 'delete', id: string): void;
}>();

function handleCommand(cmd: string) {
  if (cmd === 'copy') emit('copy', props.script);
  if (cmd === 'export') emit('export', props.script);
  if (cmd === 'regenerate') emit('regenerate', props.script.id);
  if (cmd === 'delete') emit('delete', props.script.id);
}
</script>
