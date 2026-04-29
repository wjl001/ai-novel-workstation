<template>
  <el-dialog 
    v-model="visible" 
    :title="titleText" 
    width="1000px" 
    class="global-ui-design-specs-dialog rounded-[24px] !bg-[#f8fafc] dark:!bg-slate-900 overflow-hidden" 
    :show-close="false"
  >
    <template #header="{ close, titleId, titleClass }">
      <div class="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
            <el-icon :size="20"><Monitor /></el-icon>
          </div>
          <div class="flex flex-col">
            <h4 :id="titleId" :class="[titleClass, 'text-xl font-black text-slate-800 dark:text-white m-0']">
              {{ titleText }}
            </h4>
            <span class="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">{{ subtitleText }}</span>
          </div>
        </div>
        <button @click="closeDialog" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
          <el-icon :size="20"><Close /></el-icon>
        </button>
      </div>
    </template>

    <div class="flex flex-col h-[75vh] bg-[#f8fafc] dark:bg-slate-900/50">
      <!-- 顶部 Tab 切换 -->
      <div class="px-6 pt-2 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <el-tabs v-model="activeCategory" class="custom-design-tabs">
          <el-tab-pane name="layout">
            <template #label>
              <div class="flex items-center gap-2 font-bold text-base"><el-icon><Box /></el-icon> 布局与间距</div>
            </template>
          </el-tab-pane>
          <el-tab-pane name="style">
            <template #label>
              <div class="flex items-center gap-2 font-bold text-base"><el-icon><Edit /></el-icon> 字体与样式</div>
            </template>
          </el-tab-pane>
          <el-tab-pane name="color">
            <template #label>
              <div class="flex items-center gap-2 font-bold text-base"><el-icon><Brush /></el-icon> 颜色规范</div>
            </template>
          </el-tab-pane>
          <el-tab-pane name="button">
            <template #label>
              <div class="flex items-center gap-2 font-bold text-base"><el-icon><Pointer /></el-icon> 按钮与组件</div>
            </template>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 内容区 -->
      <div class="flex-1 px-8 py-6 overflow-y-auto custom-scrollbar">
        <div class="max-w-4xl mx-auto space-y-10">
          
          <!-- 布局与间距 (Layout / Metrics) -->
          <template v-if="activeCategory === 'layout'">
            <div v-for="page in groupedSpecs.layout" :key="page.id" class="space-y-4">
              <div class="pb-2 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                <h2 class="text-xl font-black text-slate-800 dark:text-white">{{ page.title }}</h2>
                <span class="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{{ page.description }}</span>
              </div>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div v-for="item in page.items" :key="item.name" class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                  <div class="text-xs font-black text-slate-800 dark:text-white mb-1">{{ item.name }}</div>
                  <div class="text-sm font-mono text-indigo-600 dark:text-indigo-400 font-bold my-1">{{ item.value }}</div>
                  <div class="text-[10px] text-slate-400">{{ item.description }}</div>
                </div>
              </div>
            </div>
          </template>

          <!-- 字体与样式 (Style / Typography) -->
          <template v-if="activeCategory === 'style'">
            <div v-for="page in groupedSpecs.style" :key="page.id" class="space-y-4">
              <div class="pb-2 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                <h2 class="text-xl font-black text-slate-800 dark:text-white">{{ page.title }}</h2>
                <span class="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{{ page.description }}</span>
              </div>
              <div class="space-y-3">
                <div v-for="font in page.items" :key="font.name" class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                  <div class="flex-1">
                    <div class="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{{ font.name }}</div>
                    <div :style="font.style" class="text-slate-800 dark:text-white truncate">示例文本 / Example Text</div>
                  </div>
                  <div class="text-[10px] text-slate-500 font-mono bg-slate-50 dark:bg-slate-900 p-2 rounded-lg md:max-w-xs break-all">
                    {{ font.description }}
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- 颜色规范 (Colors) -->
          <template v-if="activeCategory === 'color'">
            <div v-for="page in groupedSpecs.color" :key="page.id" class="space-y-4">
              <div class="pb-2 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                <h2 class="text-xl font-black text-slate-800 dark:text-white">{{ page.title }}</h2>
                <span class="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{{ page.description }}</span>
              </div>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div v-for="color in page.items" :key="color.name" class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                  <div class="w-full h-12 rounded-lg mb-3 border border-slate-100 dark:border-slate-600 flex items-center justify-center text-[10px] text-slate-500 font-bold" 
                       :style="color.value.startsWith('#') || color.value.startsWith('rgb') ? { backgroundColor: color.value } : {}"
                       :class="!color.value.startsWith('#') && !color.value.startsWith('rgb') ? (color.value.includes('from-') ? `bg-gradient-to-r ${color.value}` : color.value) : ''"
                  >
                    <span v-if="color.value.startsWith('border-')">Border</span>
                  </div>
                  <div class="text-xs font-black text-slate-800 dark:text-white mb-1">{{ color.name }}</div>
                  <div class="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                    <span class="truncate pr-2">{{ color.value }}</span>
                    <el-icon class="cursor-pointer hover:text-indigo-500 flex-shrink-0" @click="copyToClipboard(color.value)"><DocumentCopy /></el-icon>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- 按钮与组件 (Buttons & Elements) -->
          <template v-if="activeCategory === 'button'">
            <div v-for="page in groupedSpecs.button" :key="page.id" class="space-y-4">
              <div class="pb-2 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                <h2 class="text-xl font-black text-slate-800 dark:text-white">{{ page.title }}</h2>
                <span class="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{{ page.description }}</span>
              </div>
              <div class="space-y-4">
                <div v-for="comp in page.items" :key="comp.name" class="bg-white dark:bg-slate-800 p-5 rounded-[24px] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                  <div class="flex items-start justify-between mb-3">
                    <span class="font-black text-slate-800 dark:text-white">{{ comp.name }}</span>
                    <span class="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-mono text-slate-500">{{ comp.tag }}</span>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-1">
                      <div class="text-[10px] font-black text-slate-400 uppercase">Tailwind 类名</div>
                      <div class="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs font-mono text-indigo-600 dark:text-indigo-400 break-all">
                        {{ comp.classes }}
                      </div>
                    </div>
                    <div class="space-y-1">
                      <div class="text-[10px] font-black text-slate-400 uppercase">交互/状态说明</div>
                      <ul class="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 pl-2 list-disc">
                        <li v-for="note in comp.notes" :key="note">{{ note }}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

        </div>
      </div>
    </div>

    <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
      <span class="text-xs text-slate-400 font-medium">开发人员专用设计标注面板，按分类查看本页面UI规范</span>
      <button @click="closeDialog" class="px-8 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
        关闭面板
      </button>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { 
  Close, Monitor, DocumentCopy, Box, Edit, Brush, Pointer
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

type MetricsItem = { name: string; value: string; description?: string };
type TypographyItem = { name: string; style: Record<string, string | number>; description?: string };
type ColorItem = { name: string; value: string };
type ComponentItem = { name: string; tag: string; classes: string; notes: string[] };
type SpecsGroup<TItem> = { id: string; title: string; description?: string; items: TItem[] };
type UIDesignGroups = {
  layout?: SpecsGroup<MetricsItem>[];
  style?: SpecsGroup<TypographyItem>[];
  color?: SpecsGroup<ColorItem>[];
  button?: SpecsGroup<ComponentItem>[];
};

const props = defineProps<{
  modelValue: boolean;
  title?: string;
  subtitle?: string;
  groups?: UIDesignGroups;
}>();

const emit = defineEmits(['update:modelValue']);

const visible = ref(props.modelValue);

watch(() => props.modelValue, (newVal) => {
  visible.value = newVal;
});

watch(visible, (newVal) => {
  emit('update:modelValue', newVal);
});

const closeDialog = () => {
  visible.value = false;
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  ElMessage.success(`已复制: ${text}`);
};

const activeCategory = ref('layout');

const titleText = computed(() => props.title || 'UI 设计标注');
const subtitleText = computed(() => props.subtitle || 'UI Design Specifications');

const groupedSpecs = computed(() => {
  return {
    layout: props.groups?.layout || [],
    style: props.groups?.style || [],
    color: props.groups?.color || [],
    button: props.groups?.button || []
  };
});

</script>

<style scoped>
.global-ui-design-specs-dialog :deep(.el-dialog__header) {
  padding: 0;
  margin: 0;
}
.global-ui-design-specs-dialog :deep(.el-dialog__body) {
  padding: 0;
}
.custom-design-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}
.custom-design-tabs :deep(.el-tabs__item) {
  color: #64748b;
}
.custom-design-tabs :deep(.el-tabs__item.is-active) {
  color: #4f46e5;
}
.custom-design-tabs :deep(.el-tabs__active-bar) {
  background-color: #4f46e5;
  height: 3px;
  border-radius: 3px;
}
.custom-design-tabs :deep(.el-tabs__content) {
  display: none;
}
</style>
