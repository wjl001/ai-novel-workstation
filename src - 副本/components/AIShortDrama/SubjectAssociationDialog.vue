<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="720px"
    class="modern-dialog-v2 subject-association-dialog"
    destroy-on-close
    append-to-body
  >
    <div class="p-6">
      <div class="flex flex-col gap-6">
        <!-- Search & Filter -->
        <div class="flex items-center gap-4">
          <el-input
            v-model="searchQuery"
            placeholder="搜索主体名称..."
            :prefix-icon="Search"
            clearable
            class="flex-1 custom-search-input-v3"
          />
          <el-radio-group v-model="activeCategory" size="large" class="custom-radio-group-v3">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="character">角色</el-radio-button>
            <el-radio-button label="scene">场景</el-radio-button>
            <el-radio-button label="prop">道具</el-radio-button>
          </el-radio-group>
        </div>

        <!-- Subject List -->
        <div class="grid grid-cols-3 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
          <div 
            v-for="subject in filteredSubjects" 
            :key="subject.id"
            class="group relative flex flex-col gap-2 cursor-pointer"
            @click="toggleSelection(subject)"
          >
            <div 
              class="relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300"
              :class="[
                isSelected(subject) 
                  ? 'border-indigo-500 ring-4 ring-indigo-500/10 shadow-lg' 
                  : 'border-slate-100 dark:border-slate-800 hover:border-indigo-300'
              ]"
            >
              <el-image 
                v-if="subject.image" 
                :src="subject.image" 
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              <div v-else class="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                <el-icon size="32"><component :is="getIcon(subject.type)" /></el-icon>
              </div>

              <!-- Selection Overlay -->
              <div 
                class="absolute inset-0 bg-indigo-600/10 flex items-center justify-center transition-opacity duration-300"
                :class="isSelected(subject) ? 'opacity-100' : 'opacity-0'"
              >
                <div class="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-lg border-2 border-white">
                  <el-icon><Check /></el-icon>
                </div>
              </div>

              <!-- Category Badge -->
              <div class="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md text-[10px] text-white font-bold">
                {{ getCategoryLabel(subject.type) }}
              </div>
            </div>
            <span class="text-[13px] font-bold text-slate-700 dark:text-slate-200 truncate text-center group-hover:text-indigo-600 transition-colors">
              {{ subject.name }}
            </span>
          </div>
        </div>

        <div v-if="filteredSubjects.length === 0" class="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
          <el-icon size="48" class="opacity-20"><Search /></el-icon>
          <span>未找到相关主体</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3 px-6 pb-6">
        <el-button @click="visible = false" class="!rounded-xl px-6 h-11">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleConfirm"
          class="!rounded-xl px-10 h-11 shadow-lg shadow-indigo-500/20"
          :loading="loading"
        >
          确认关联
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Search, Check, User, Location, Box } from '@element-plus/icons-vue';
import { useEpisodeStore } from '@/store/episode';
import { ElMessage } from 'element-plus';

const props = defineProps<{
  modelValue: boolean;
  episodeId?: string; // 如果提供，则关联到单集；否则关联到整个剧本
  episodeIndex?: number;
}>();

const emit = defineEmits(['update:modelValue', 'confirm']);

const episodeStore = useEpisodeStore();
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const searchQuery = ref('');
const activeCategory = ref('all');
const selectedSubjectIds = ref<string[]>([]);
const loading = ref(false);

const dialogTitle = computed(() => {
  if (props.episodeIndex) {
    return `关联主体到第 ${props.episodeIndex} 集`;
  }
  return '关联主体到整个剧本';
});

const filteredSubjects = computed(() => {
  return episodeStore.subjects.filter(s => {
    const matchesCategory = activeCategory.value === 'all' || s.type === activeCategory.value;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchesCategory && matchesSearch;
  });
});

// 初始化已选中的主体
watch(visible, (newVal) => {
  if (newVal) {
    const allEpisodesCount = episodeStore.episodes.length;
    if (props.episodeIndex) {
      // 单集：选中 appeared_episodes 包含该集的主体
      selectedSubjectIds.value = episodeStore.subjects
        .filter(s => s.appeared_episodes?.includes(props.episodeIndex!))
        .map(s => s.id);
    } else {
      // 整个剧本：选中 appeared_episodes 包含所有剧集的主体
      selectedSubjectIds.value = episodeStore.subjects
        .filter(s => {
          if (!s.appeared_episodes || s.appeared_episodes.length === 0) return false;
          // 如果出现在所有集，或者是大部分集（这里简单判断为出现在第1集且长度等于总集数，或者逻辑自定）
          // 简单起见：只要 appeared_episodes 包含所有索引
          const allIndices = Array.from({ length: allEpisodesCount }, (_, i) => i + 1);
          return allIndices.every(idx => s.appeared_episodes?.includes(idx));
        })
        .map(s => s.id);
    }
  }
});

const isSelected = (subject: any) => selectedSubjectIds.value.includes(subject.id);

const toggleSelection = (subject: any) => {
  const index = selectedSubjectIds.value.indexOf(subject.id);
  if (index > -1) {
    selectedSubjectIds.value.splice(index, 1);
  } else {
    selectedSubjectIds.value.push(subject.id);
  }
};

const getIcon = (type: string) => {
  switch (type) {
    case 'character': return User;
    case 'scene': return Location;
    case 'prop': return Box;
    default: return User;
  }
};

const getCategoryLabel = (type: string) => {
  switch (type) {
    case 'character': return '角色';
    case 'scene': return '场景';
    case 'prop': return '道具';
    default: return '其他';
  }
};

const handleConfirm = async () => {
  loading.value = true;
  try {
    const allEpisodesCount = episodeStore.episodes.length;
    
    // 更新所有主体
    episodeStore.subjects.forEach(subject => {
      let appeared = [...(subject.appeared_episodes || [])];
      const isCurrentlySelected = selectedSubjectIds.value.includes(subject.id);

      if (props.episodeIndex) {
        // 单集关联逻辑
        if (isCurrentlySelected) {
          if (!appeared.includes(props.episodeIndex)) {
            appeared.push(props.episodeIndex);
          }
        } else {
          appeared = appeared.filter(idx => idx !== props.episodeIndex);
        }
      } else {
        // 整个剧本关联逻辑
        const allIndices = Array.from({ length: allEpisodesCount }, (_, i) => i + 1);
        if (isCurrentlySelected) {
          // 选中：确保包含所有剧集
          appeared = Array.from(new Set([...appeared, ...allIndices]));
        } else {
          // 未选中：从所有剧集中移除（慎重，但符合“整个剧本”的关联逻辑）
          appeared = appeared.filter(idx => !allIndices.includes(idx));
        }
      }

      episodeStore.updateSubject(subject.id, { appeared_episodes: appeared });
    });

    ElMessage.success('关联成功');
    visible.value = false;
    emit('confirm');
  } catch (error) {
    ElMessage.error('操作失败');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.subject-association-dialog :deep(.el-dialog) {
  border-radius: 24px !important;
  overflow: hidden;
}

.subject-association-dialog :deep(.el-dialog__header) {
  padding: 24px 24px 0 !important;
  margin-right: 0 !important;
}

.subject-association-dialog :deep(.el-dialog__title) {
  font-size: 20px !important;
  font-weight: 900 !important;
  color: #1e293b !important;
}

.custom-search-input-v3 :deep(.el-input__wrapper) {
  border-radius: 12px;
  background-color: #f8fafc;
  box-shadow: none !important;
  border: 1px solid #e2e8f0;
}

.custom-radio-group-v3 :deep(.el-radio-button__inner) {
  border-radius: 12px !important;
  margin: 0 4px;
  border: 1px solid #e2e8f0 !important;
  font-weight: 700;
}

.custom-radio-group-v3 :deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-radius: 12px !important;
}

.custom-radio-group-v3 :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: #6366f1 !important;
  border-color: #6366f1 !important;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}
</style>
