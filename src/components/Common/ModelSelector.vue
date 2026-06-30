<template>
  <div class="model-selector-container" :class="{ 'is-dark': !isLight }">
    <el-popover
      placement="bottom"
      :width="480"
      trigger="click"
      popper-class="model-selector-popper"
      @show="handleShow"
    >
      <template #reference>
        <div class="current-model-trigger group">
          <div 
            class="flex items-center rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 hover:border-indigo-500/50 transition-all cursor-pointer shadow-lg shadow-indigo-500/5 group-hover:shadow-indigo-500/20"
            :class="compact ? 'gap-2 px-3 py-1' : 'gap-3 px-4 py-2'"
          >
            <div 
              class="rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
              :class="compact ? 'w-7 h-7' : 'w-9 h-9'"
            >
              <el-icon :size="compact ? 16 : 20"><Cpu v-if="type === 'text'" /><Picture v-else-if="type === 'image'" /><VideoCamera v-else /></el-icon>
            </div>
            <div class="flex flex-col min-w-0">
              <span 
                class="uppercase tracking-[0.2em] opacity-60 font-black text-indigo-600 dark:text-indigo-400"
                :class="compact ? 'text-[7px]' : 'text-[9px]'"
              >AI Engine</span>
              <span 
                class="font-black flex items-center gap-2 text-slate-800 dark:text-slate-100 truncate"
                :class="compact ? 'text-[12px]' : 'text-sm'"
              >
                {{ selectedModel?.name || '选择模型' }}
                <el-icon class="text-indigo-500 transition-transform group-hover:translate-y-0.5"><ArrowDown /></el-icon>
              </span>
            </div>
          </div>
        </div>
      </template>

      <div class="model-picker-content overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
          <h4 class="font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 tracking-tight">
            <div class="w-2 h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full mr-1"></div>
            智能引擎切换
          </h4>
          <el-tag size="small" effect="dark" round class="!bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-none !px-3 !font-black !text-[10px] shadow-sm">
            {{ typeLabel }}
          </el-tag>
        </div>

        <div class="p-3 max-h-[450px] overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
          <div v-for="vendor in vendors" :key="vendor.id" class="mb-6 last:mb-0">
            <div class="px-3 py-2 text-[10px] uppercase tracking-[0.25em] font-black text-slate-400 flex items-center gap-3 mb-2">
              <img v-if="vendor.logo" :src="vendor.logo" class="h-4 w-auto opacity-70 grayscale hover:grayscale-0 transition-all" />
              <div v-else class="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
              {{ vendor.name }}
              <div class="flex-1 h-px bg-slate-100 dark:bg-slate-800 ml-2"></div>
            </div>
            <div class="grid grid-cols-1 gap-2">
              <div 
                v-for="model in vendor.models" 
                :key="model.id"
                class="model-item group"
                :class="{ 'is-active': modelValue === model.id }"
                @click="selectModel(model)"
              >
                <div class="flex items-start gap-4 p-4 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-indigo-500/20 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 relative overflow-hidden">
                  <!-- Active Indicator -->
                  <div v-if="modelValue === model.id" class="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                  
                  <div class="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:to-purple-600 group-hover:text-white transition-all duration-500 shadow-sm border border-slate-100 dark:border-slate-700 group-hover:border-transparent group-hover:scale-105 group-hover:rotate-2">
                    <el-icon :size="24"><Cpu v-if="type === 'text'" /><Picture v-else-if="type === 'image'" /><VideoCamera v-else /></el-icon>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="font-black text-[15px] text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight">{{ model.name }}</span>
                      <div class="flex gap-1.5">
                        <el-tag v-for="tag in model.tags" :key="tag" size="small" class="!text-[9px] !px-2 !h-4.5 !leading-none border-none !font-black tracking-tighter" :type="getTagType(tag)">{{ tag }}</el-tag>
                      </div>
                    </div>
                    <div class="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors font-medium mb-1.5">{{ model.description }}</div>
                    
                    <!-- Cost Badge -->
                    <div class="flex items-center gap-1.5">
                      <div class="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 font-black text-[10px]">
                        <el-icon :size="10"><Coin /></el-icon>
                        {{ model.cost }} 算力豆/次
                      </div>
                    </div>
                  </div>
                  <div v-if="modelValue === model.id" class="flex items-center">
                    <div class="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/40">
                      <el-icon :size="14"><CircleCheckFilled /></el-icon>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { Cpu, Picture, VideoCamera, MagicStick, ArrowDown, CircleCheckFilled, Coin } from '@element-plus/icons-vue';
import { TEXT_MODELS, IMAGE_MODELS, VIDEO_MODELS, type AIModel } from '@/config/models';
import { useModelStore } from '@/store/models';

const props = defineProps<{
  modelValue: string;
  type: 'text' | 'image' | 'video';
  compact?: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'change']);

const isLight = inject('isLight', ref(true));
const modelStore = useModelStore();

const vendors = computed(() => {
  if (props.type === 'text') return TEXT_MODELS;
  if (props.type === 'image') return IMAGE_MODELS;
  return VIDEO_MODELS;
});

const typeLabel = computed(() => {
  if (props.type === 'text') return '生文模型';
  if (props.type === 'image') return '生图模型';
  return '视频生成';
});

const selectedModel = computed(() => {
  for (const vendor of vendors.value) {
    const found = vendor.models.find(m => m.id === props.modelValue);
    if (found) return found;
  }
  // Fallback to store value if prop is not found in vendors
  const storeValue = props.type === 'text' ? modelStore.selectedTextModel : 
                     props.type === 'image' ? modelStore.selectedImageModel : 
                     modelStore.selectedVideoModel;
  
  for (const vendor of vendors.value) {
    const found = vendor.models.find(m => m.id === storeValue);
    if (found) return found;
  }

  return vendors.value[0]?.models[0];
});

const selectModel = (model: AIModel) => {
  emit('update:modelValue', model.id);
  emit('change', model);
  
  // Sync with store
  if (props.type === 'text') modelStore.setTextModel(model.id);
  else if (props.type === 'image') modelStore.setImageModel(model.id);
  else modelStore.setVideoModel(model.id);
};

const getTagType = (tag: string) => {
  if (tag === '推荐' || tag === '极速') return 'success';
  if (tag === '强力' || tag === '写实') return 'warning';
  if (tag === '期待') return 'info';
  return 'danger';
};

const handleShow = () => {
  // Logic when popover shows
};
</script>

<style scoped>
.model-selector-container {
  display: inline-block;
}

.current-model-trigger {
  position: relative;
  z-index: 10;
}

.current-model-trigger::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(45deg, #6366f1, #a855f7, #ec4899);
  border-radius: 18px;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
  filter: blur(8px);
}

.current-model-trigger:hover::before {
  opacity: 0.4;
}

.model-item {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.model-item:hover {
  background: rgba(99, 102, 241, 0.05);
  transform: translateX(4px);
}

.model-item.is-active {
  background: rgba(99, 102, 241, 0.08);
  border-color: rgba(99, 102, 241, 0.3) !important;
  box-shadow: 0 10px 20px -10px rgba(99, 102, 241, 0.2);
}

.is-dark .model-item:hover {
  background: rgba(129, 140, 248, 0.1);
}

.is-dark .model-item.is-active {
  background: rgba(129, 140, 248, 0.12);
  border-color: rgba(129, 140, 248, 0.4) !important;
}

.is-dark .model-item.is-active {
  background: rgba(129, 140, 248, 0.15);
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.is-dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
}

:global(.model-selector-popper) {
  padding: 0 !important;
  border-radius: 24px !important;
  overflow: hidden !important;
  border: 1px solid rgba(99, 102, 241, 0.2) !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
}

:global(.dark .model-selector-popper) {
  background: #1e293b !important;
  border: 1px solid rgba(129, 140, 248, 0.2) !important;
}
</style>
