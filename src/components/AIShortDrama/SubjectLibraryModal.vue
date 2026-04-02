<template>
  <el-dialog
    v-model="visible"
    title="主体库"
    width="800px"
    class="subject-library-modal"
    destroy-on-close
    append-to-body
  >
    <div class="flex flex-col h-[600px] gap-4">
      <!-- Search & Filter -->
      <div class="flex items-center gap-4">
        <el-input
          v-model="searchQuery"
          placeholder="搜索主体名称..."
          :prefix-icon="Search"
          clearable
          class="flex-1"
        />
        <el-radio-group v-model="activeCategory" size="default">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="character">角色</el-radio-button>
          <el-radio-button label="scene">场景</el-radio-button>
          <el-radio-button label="prop">道具</el-radio-button>
        </el-radio-group>
      </div>

      <!-- Content Grid -->
      <div class="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <div v-if="filteredItems.length === 0" class="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
          <el-icon size="48"><Search /></el-icon>
          <span>未找到相关主体</span>
        </div>
        
        <div v-else class="grid grid-cols-4 gap-4">
          <div 
            v-for="item in filteredItems" 
            :key="item.id"
            class="flex flex-col gap-2 group cursor-pointer relative"
            @click="toggleSelection(item)"
          >
            <div 
              class="w-full aspect-[3/4] rounded-xl bg-slate-50 border-2 overflow-hidden relative transition-all"
              :class="isSelected(item) ? 'border-indigo-500 shadow-md' : 'border-transparent group-hover:border-slate-200'"
            >
              <el-image :src="item.image" class="w-full h-full object-cover" loading="lazy" />
              
              <!-- Selection Badge -->
              <div 
                v-if="isSelected(item)"
                class="absolute top-2 right-2 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-lg z-10"
              >
                <el-icon><Check /></el-icon>
              </div>

              <!-- Category Badge -->
              <div class="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-sm text-[10px] text-white">
                {{ getCategoryLabel(item.type) }}
              </div>
            </div>
            <span class="text-[12px] text-slate-700 font-medium truncate px-1">{{ item.name }}</span>
          </div>
        </div>
      </div>

      <!-- Selection Bar & Footer -->
      <div class="flex items-center justify-between pt-4 border-t border-slate-100">
        <div class="flex items-center gap-2">
          <span class="text-[13px] text-slate-500">已选 {{ selectedItems.length }} 个主体</span>
          <div class="flex -space-x-2 overflow-hidden">
            <div 
              v-for="item in selectedItems.slice(0, 5)" 
              :key="item.id"
              class="w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-sm"
            >
              <img :src="item.image" class="w-full h-full object-cover" />
            </div>
            <div v-if="selectedItems.length > 5" class="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] text-slate-500 font-bold">
              +{{ selectedItems.length - 5 }}
            </div>
          </div>
        </div>
        
        <div class="flex gap-3">
          <el-button @click="visible = false">取消</el-button>
          <el-button 
            type="primary" 
            class="!px-8 bg-indigo-600 hover:bg-indigo-700 border-none"
            :disabled="selectedItems.length === 0"
            @click="handleConfirm"
          >
            确认导入
          </el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Search, Check } from '@element-plus/icons-vue';

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
