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
          placeholder="搜索作品名称或主体名称..."
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
              class="w-full aspect-video rounded-[16px] bg-white border-2 overflow-hidden relative transition-all duration-300 hover:-translate-y-1"
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

              <!-- Project Badge -->
              <div class="absolute top-2 left-2 px-2 py-1 rounded-md bg-white/90 backdrop-blur-sm text-[9px] font-black text-indigo-600 shadow-sm border border-indigo-100">
                {{ item.projectName }}
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
import { ref, computed, watch } from 'vue';
import { Search, Check, Close } from '@element-plus/icons-vue';

const props = defineProps<{
  modelValue: boolean;
  subjects: any[]; // 已导入的主体
  currentProjectName: string; // 当前作品名称
}>();

const emit = defineEmits(['update:modelValue', 'confirm']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const searchQuery = ref(props.currentProjectName);
const activeCategory = ref('all');
const selectedItems = ref<any[]>([]);

// 监听弹窗显示状态，打开时重置搜索词为当前作品名
watch(visible, (newVal) => {
  if (newVal) {
    searchQuery.value = props.currentProjectName;
    selectedItems.value = [];
  }
});

// 模拟所有作品的主体库数据
const allLibrarySubjects = ref([
  // 当前作品的主体 - 更多未导入的选项
  { id: 'lib_20', name: '沈念安-职场装', type: 'character', projectName: props.currentProjectName, image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400', description: '干练的职业装束。' },
  { id: 'lib_21', name: '顾承泽-休闲装', type: 'character', projectName: props.currentProjectName, image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=400', description: '简约的灰色卫衣。' },
  { id: 'lib_22', name: '订婚戒指', type: 'prop', projectName: props.currentProjectName, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=400&auto=format&fit=crop', description: '闪耀着幸福光芒的钻戒。' },
  { id: 'lib_23', name: '酒店休息室', type: 'scene', projectName: props.currentProjectName, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop', description: '安静私密的休息空间。' },
  
  // 《代号：零》作品
  { id: 'lib_6', name: '林汐-特工形象', type: 'character', projectName: '代号：零', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400', description: '眼神凌厉，身手不凡。' },
  { id: 'lib_7', name: '废弃工厂', type: 'scene', projectName: '代号：零', image: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?q=80&w=600&auto=format&fit=crop', description: '光线昏暗，充满工业废土气息。' },
  { id: 'lib_8', name: '黑客笔记本', type: 'prop', projectName: '代号：零', image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=400&auto=format&fit=crop', description: '贴满了各种黑客组织的贴纸。' },
  { id: 'lib_24', name: '雷克-反派头目', type: 'character', projectName: '代号：零', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400', description: '阴沉狡诈，幕后主使。' },

  // 《梦回江南》作品
  { id: 'lib_9', name: '苏梦-古风少女', type: 'character', projectName: '梦回江南', image: 'https://images.unsplash.com/photo-1518544831912-3269f88c7f3b?auto=format&fit=crop&q=80&w=400', description: '身着汉服，温婉如水。' },
  { id: 'lib_10', name: '江南水乡', type: 'scene', projectName: '梦回江南', image: 'https://images.unsplash.com/photo-1528660493888-ab6f4761e036?q=80&w=600&auto=format&fit=crop', description: '小桥流水人家。' },
  { id: 'lib_11', name: '纸伞', type: 'prop', projectName: '梦回江南', image: 'https://images.unsplash.com/photo-1560114928-40f1f1eb26a0?q=80&w=400&auto=format&fit=crop', description: '绘有精致梅花的油纸伞。' },
  { id: 'lib_25', name: '青石板路', type: 'scene', projectName: '梦回江南', image: 'https://images.unsplash.com/photo-1596435682942-da3075195326?q=80&w=600&auto=format&fit=crop', description: '雨后微湿的青石小径。' },

  // 《末日余晖》作品
  { id: 'lib_30', name: '老约翰', type: 'character', projectName: '末日余晖', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400', description: '经验丰富的拾荒者。' },
  { id: 'lib_31', name: '避难所入口', type: 'scene', projectName: '末日余晖', image: 'https://images.unsplash.com/photo-1473163928189-39a0c8a95167?q=80&w=600&auto=format&fit=crop', description: '厚重的铁门，布满锈迹。' },
  { id: 'lib_32', name: '能量电池', type: 'prop', projectName: '末日余晖', image: 'https://images.unsplash.com/photo-1548169874-52e85c70733f?q=80&w=400&auto=format&fit=crop', description: '散发着幽幽蓝光的稀有资源。' },
]);

const filteredItems = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  
  // 获取已导入主体的名称列表，用于去重
  const importedNames = props.subjects.map(s => s.name);
  
  return allLibrarySubjects.value.filter(item => {
    // 排除已经在侧边栏（已导入）显示的主体
    if (importedNames.includes(item.name)) {
      return false;
    }

    const matchesCategory = activeCategory.value === 'all' || item.type === activeCategory.value;
    
    // 如果没有搜索词，默认显示当前作品的主体
    if (!query) {
      return matchesCategory && item.projectName === props.currentProjectName;
    }
    
    // 如果有搜索词，搜索作品名称或主体名称
    const matchesSearch = item.name.toLowerCase().includes(query) || 
                         item.projectName.toLowerCase().includes(query);
                         
    return matchesCategory && matchesSearch;
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
