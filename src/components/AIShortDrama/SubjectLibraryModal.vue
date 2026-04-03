<template>
  <el-dialog
    v-model="visible"
    width="800px"
    :show-close="false"
    class="custom-subject-dialog"
    destroy-on-close
    append-to-body
  >
    <!-- Custom Header -->
    <div class="flex justify-between items-center mb-6 px-2">
      <h2 class="text-[20px] font-bold text-slate-900">主体库</h2>
      <button @click="visible = false" class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
        <el-icon size="16"><Close /></el-icon>
      </button>
    </div>

    <div class="flex flex-col h-[550px] gap-6 px-2">
      <!-- Search & Filter -->
      <div class="flex items-center gap-4">
        <el-input
          v-model="searchQuery"
          placeholder="搜索主体名称..."
          :prefix-icon="Search"
          clearable
          class="flex-1 custom-search-input"
        />
        <el-radio-group v-model="activeCategory" size="large" class="custom-radio-group">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="character">角色</el-radio-button>
          <el-radio-button label="scene">场景</el-radio-button>
          <el-radio-button label="prop">道具</el-radio-button>
        </el-radio-group>
      </div>

      <!-- Content Grid -->
      <div class="flex-1 overflow-y-auto custom-scrollbar pr-2 bg-[#f8fafc] rounded-2xl p-4 border border-slate-100">
        <div v-if="filteredItems.length === 0" class="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
          <el-icon size="48" class="text-slate-300"><Search /></el-icon>
          <span class="text-[14px]">未找到相关主体</span>
        </div>
        
        <div v-else class="grid grid-cols-4 gap-4">
          <div 
            v-for="item in filteredItems" 
            :key="item.id"
            class="flex flex-col gap-2 group cursor-pointer relative"
            @click="toggleSelection(item)"
          >
            <div 
              class="w-full aspect-[3/4] rounded-[16px] bg-white border-2 overflow-hidden relative transition-all duration-300 hover:-translate-y-1"
              :class="isSelected(item) ? 'border-indigo-500 shadow-md ring-4 ring-indigo-500/10' : 'border-transparent hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]'"
            >
              <el-image :src="item.image" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
              
              <!-- Selection Badge -->
              <div 
                class="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 z-10 shadow-sm"
                :class="isSelected(item) ? 'bg-indigo-500 text-white scale-100' : 'bg-white/80 backdrop-blur-sm text-transparent scale-90 opacity-0 group-hover:opacity-100 group-hover:text-slate-300 border border-slate-200'"
              >
                <el-icon><Check /></el-icon>
              </div>

              <!-- Category Badge -->
              <div class="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/50 backdrop-blur-md text-[10px] font-medium text-white shadow-sm">
                {{ getCategoryLabel(item.type) }}
              </div>
            </div>
            <span class="text-[13px] text-slate-800 font-bold truncate px-1 text-center transition-colors group-hover:text-indigo-600">{{ item.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="flex items-center justify-between px-2 pt-4 border-t border-slate-50 mt-2">
        <div class="flex items-center gap-3">
          <span class="text-[13px] font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">已选 {{ selectedItems.length }} 个</span>
          <div class="flex -space-x-2 overflow-hidden">
            <div 
              v-for="item in selectedItems.slice(0, 5)" 
              :key="item.id"
              class="w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-sm bg-slate-50"
            >
              <img :src="item.image" class="w-full h-full object-cover" />
            </div>
            <div v-if="selectedItems.length > 5" class="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[11px] text-slate-600 font-bold shadow-sm z-10">
              +{{ selectedItems.length - 5 }}
            </div>
          </div>
        </div>
        
        <div class="flex gap-3">
          <button 
            @click="visible = false" 
            class="px-8 py-2.5 rounded-xl bg-[#f1f3f5] text-slate-600 text-[14px] font-medium hover:bg-slate-200 transition-colors"
          >
            取消
          </button>
          <button 
            @click="handleConfirm" 
            class="px-8 py-2.5 rounded-xl bg-slate-900 text-white text-[14px] font-medium hover:bg-black transition-all shadow-md active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            :disabled="selectedItems.length === 0"
          >
            确认导入
          </button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Search, Check, Close } from '@element-plus/icons-vue';

const props = defineProps<{
  modelValue: boolean;
  subjects: any[];
}>();

const emit = defineEmits(['update:modelValue', 'confirm']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const searchQuery = ref('');
const activeCategory = ref('all');
const selectedItems = ref<any[]>([]);

const filteredItems = computed(() => {
  return props.subjects.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesCategory = activeCategory.value === 'all' || item.type === activeCategory.value;
    return matchesSearch && matchesCategory;
  });
});

const isSelected = (item: any) => selectedItems.value.some(i => i.id === item.id);

const toggleSelection = (item: any) => {
  const index = selectedItems.value.findIndex(i => i.id === item.id);
  if (index > -1) {
    selectedItems.value.splice(index, 1);
  } else {
    selectedItems.value.push(item);
  }
};

const getCategoryLabel = (type: string) => {
  const labels: Record<string, string> = {
    character: '角色',
    scene: '场景',
    prop: '道具'
  };
  return labels[type] || '其他';
};

const handleConfirm = () => {
  emit('confirm', [...selectedItems.value]);
  visible.value = false;
  selectedItems.value = [];
};
</script>

<style>
.subject-library-modal .el-dialog {
  border-radius: 20px !important;
  overflow: hidden;
}

.subject-library-modal .el-dialog__header {
  margin-right: 0;
  padding: 20px 24px 10px;
  border-bottom: 1px solid #f8fafc;
}

.subject-library-modal .el-dialog__title {
  font-weight: 800;
  font-size: 18px;
  color: #1e293b;
}

.subject-library-modal .el-dialog__body {
  padding: 20px 24px;
}
</style>
