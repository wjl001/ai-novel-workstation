<template>
  <div class="history-panel">
    <div v-if="projects.length === 0" class="text-center py-16">
      <div class="text-5xl mb-4">📭</div>
      <p class="text-sm text-slate-400 mb-2">暂无历史营销项目</p>
      <p class="text-xs text-slate-300">生成的营销脚本会自动保存在这里</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="project in projects"
        :key="project.id"
        class="group relative p-4 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 cursor-pointer"
        @click="$emit('load', project.id)"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-bold text-slate-800 truncate mb-1">{{ project.name }}</h4>
            <p class="text-[10px] text-slate-400 mb-2">
              {{ formatDate(project.updatedAt) }} · {{ project.scripts.length }} 个方案 · {{ project.platformIds.length }} 个平台
            </p>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="pid in project.platformIds.slice(0, 3)"
                :key="pid"
                class="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-medium"
              >
                {{ getPlatformName(pid) }}
              </span>
              <span v-if="project.platformIds.length > 3" class="px-1.5 py-0.5 text-slate-400 text-[9px]">
                +{{ project.platformIds.length - 3 }}
              </span>
              <span class="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-medium ml-1">
                {{ getTemplateName(project.templateId) }}
              </span>
            </div>
          </div>
          <div class="flex items-center gap-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              @click.stop="$emit('load', project.id)"
              class="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center justify-center transition-all"
              title="加载项目"
            >
              <el-icon :size="13"><FolderOpened /></el-icon>
            </button>
            <button
              @click.stop="$emit('delete', project.id)"
              class="w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-all"
              title="删除项目"
            >
              <el-icon :size="13"><Delete /></el-icon>
            </button>
          </div>
        </div>

        <!-- 卖点预览 -->
        <div v-if="project.product.sellingPoints.length" class="mt-3 flex flex-wrap gap-1">
          <span
            v-for="sp in project.product.sellingPoints.slice(0, 3)"
            :key="sp"
            class="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-medium"
          >
            {{ sp }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FolderOpened, Delete } from '@element-plus/icons-vue';
import type { MarketingProject } from '../../../store/marketing';
import { PLATFORM_CONFIGS } from '../data/platforms';
import { MARKETING_TEMPLATES } from '../data/templates';

defineProps<{
  projects: MarketingProject[];
}>();

defineEmits<{
  (e: 'load', id: string): void;
  (e: 'delete', id: string): void;
}>();

function getPlatformName(id: string): string {
  return PLATFORM_CONFIGS.find(p => p.id === id)?.name || id;
}

function getTemplateName(id: string): string {
  return MARKETING_TEMPLATES.find(t => t.id === id)?.name || id;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
</script>
