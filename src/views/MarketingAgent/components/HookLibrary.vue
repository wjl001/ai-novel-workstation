<template>
  <div class="hook-library">
    <!-- 自定义Hook -->
    <div class="mb-5 p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-lg">✨</span>
        <span class="text-sm font-bold text-indigo-700">自定义开场钩子</span>
      </div>
      <el-input
        v-model="localCustomHook"
        type="textarea"
        :rows="2"
        placeholder="输入你自己的开场话术，如：姐妹们！这个东西我真的后悔没早买！"
        class="!rounded-xl"
        resize="none"
        @input="handleCustomHook"
      />
    </div>

    <!-- 类型筛选 -->
    <div class="flex flex-wrap gap-2 mb-4">
      <button
        v-for="t in hookTypes"
        :key="t.value"
        @click="activeType = t.value"
        :class="['px-3 py-1.5 rounded-full text-xs font-bold transition-all border',
          activeType === t.value
            ? 'text-white shadow-md'
            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300']"
        :style="activeType === t.value ? { backgroundColor: t.color, borderColor: t.color } : {}"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- Hook列表 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
      <div
        v-for="hook in filteredHooks"
        :key="hook.id"
        @click="selectHook(hook.id)"
        :class="['relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:-translate-y-0.5',
          selectedId === hook.id
            ? 'border-indigo-500 bg-indigo-50/50 shadow-lg shadow-indigo-500/10'
            : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md']"
      >
        <!-- 选中标记 -->
        <div v-if="selectedId === hook.id" class="absolute top-3 right-3 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
          <el-icon :size="12" class="text-white"><Check /></el-icon>
        </div>

        <!-- 类型标签 -->
        <span
          class="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold mb-2"
          :style="{ backgroundColor: getTypeColor(hook.type) + '15', color: getTypeColor(hook.type) }"
        >
          {{ hook.typeLabel }}
        </span>

        <!-- 钩子模板 -->
        <p class="text-sm font-medium text-slate-800 leading-relaxed mb-2">{{ hook.template }}</p>

        <!-- 元信息 -->
        <div class="flex items-center gap-3 text-[10px] text-slate-400">
          <span class="flex items-center gap-1">
            <el-icon :size="11"><TrendCharts /></el-icon>
            热度 {{ hook.heat }}
          </span>
          <span class="flex items-center gap-1">
            <el-icon :size="11"><User /></el-icon>
            {{ (hook.usage / 1000).toFixed(1) }}k人用过
          </span>
        </div>

        <!-- 适用场景 -->
        <p class="text-[10px] text-slate-400 mt-1.5 truncate">适用：{{ hook.scenario }}</p>
      </div>
    </div>

    <div v-if="filteredHooks.length === 0" class="text-center py-12 text-slate-400 text-sm">
      该分类暂无钩子
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Check, TrendCharts, User } from '@element-plus/icons-vue';
import { HOOK_LIBRARY, HOOK_TYPES } from '../data/hooks';

const props = defineProps<{
  selectedId: string;
  customHook: string;
}>();

const emit = defineEmits<{
  (e: 'select', id: string): void;
  (e: 'custom', text: string): void;
}>();

const activeType = ref('all');
const localCustomHook = ref(props.customHook);

const hookTypes = HOOK_TYPES;

const filteredHooks = computed(() => {
  if (activeType.value === 'all') return HOOK_LIBRARY;
  return HOOK_LIBRARY.filter(h => h.type === activeType.value);
});

function getTypeColor(type: string): string {
  return HOOK_TYPES.find(t => t.value === type)?.color || '#6366f1';
}

function selectHook(id: string) {
  localCustomHook.value = '';
  emit('custom', '');
  emit('select', id);
}

function handleCustomHook() {
  if (localCustomHook.value.trim()) {
    emit('select', '');
  }
  emit('custom', localCustomHook.value);
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}
</style>
