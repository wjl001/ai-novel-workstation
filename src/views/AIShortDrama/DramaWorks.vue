<template>
  <div class="h-full flex flex-col bg-slate-50 dark:bg-slate-900 p-6">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h2 class="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">我的短剧作品</h2>
        <p class="text-slate-400 dark:text-slate-500 mt-2 text-base font-medium">管理和创作您的 AI 爆款短剧</p>
      </div>
      <button 
        @click="$router.push('/ai-short-drama-creator/new')"
        class="h-12 px-8 bg-indigo-600 text-white rounded-full text-[15px] font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
      >
        <el-icon><Plus /></el-icon>
        新建剧本
      </button>
    </div>

    <!-- Toolbar -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 mb-8 flex justify-between items-center gap-6">
      <div class="flex items-center gap-4 flex-1">
        <el-input 
          v-model="searchQuery" 
          placeholder="搜索作品标题..." 
          prefix-icon="Search"
          class="w-80 custom-search-input"
          clearable
        />
        <div class="h-8 w-px bg-slate-100 dark:bg-slate-700 mx-2"></div>
        <el-select v-model="statusFilter" placeholder="作品状态" class="w-36 custom-select-round" clearable>
          <el-option label="草稿" value="draft" />
          <el-option label="创作中" value="in_progress" />
          <el-option label="已完成" value="completed" />
        </el-select>
        <el-select v-model="sortBy" placeholder="排序方式" class="w-44 custom-select-round">
          <el-option label="最近修改" value="updated_desc" />
          <el-option label="最近创建" value="created_desc" />
          <el-option label="名称排序" value="name_asc" />
        </el-select>
      </div>
      <div class="flex items-center bg-slate-50 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-100 dark:border-slate-700">
        <button 
          @click="viewMode = 'grid'"
          class="w-10 h-10 rounded-lg flex items-center justify-center transition-all"
          :class="viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'"
        >
          <el-icon><Grid /></el-icon>
        </button>
        <button 
          @click="viewMode = 'list'"
          class="w-10 h-10 rounded-lg flex items-center justify-center transition-all"
          :class="viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'"
        >
          <el-icon><List /></el-icon>
        </button>
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-auto">
      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="work in filteredWorks" :key="work.id" 
          class="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full group"
          @click="openWork(work)"
        >
          <div class="flex justify-between items-start mb-4">
            <div class="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center text-xl">
              <el-icon><VideoCamera /></el-icon>
            </div>
            <el-dropdown trigger="click" @command="(cmd) => handleCommand(cmd, work)">
              <button 
                class="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-all"
                @click.stop
              >
                <el-icon><MoreFilled /></el-icon>
              </button>
              <template #dropdown>
                <el-dropdown-menu class="!rounded-xl !p-1.5 shadow-xl border-slate-100">
                  <el-dropdown-item command="edit" class="!rounded-lg !py-2">编辑</el-dropdown-item>
                  <el-dropdown-item command="delete" class="!rounded-lg !py-2 !text-red-500">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          
          <h3 class="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2 line-clamp-1" :title="work.title">{{ work.title }}</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 flex-1">{{ work.description || '暂无简介' }}</p>
          
          <div class="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-700 mt-auto">
            <span class="flex items-center gap-1"><el-icon><Clock /></el-icon> {{ work.updatedAt }}</span>
            <el-tag size="small" :type="getStatusType(work.status)" effect="plain">{{ getStatusLabel(work.status) }}</el-tag>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <el-table :data="filteredWorks" style="width: 100%" @row-click="openWork">
          <el-table-column prop="title" label="作品名称" min-width="200">
            <template #default="{ row }">
              <div class="flex items-center gap-3 font-medium text-slate-800 dark:text-slate-200">
                <el-icon class="text-indigo-500 text-lg"><VideoCamera /></el-icon>
                {{ row.title }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="120">
            <template #default="{ row }">
              <el-tag size="small" :type="getStatusType(row.status)" effect="plain">{{ getStatusLabel(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="160" sortable />
          <el-table-column prop="updatedAt" label="最后修改" width="160" sortable />
          <el-table-column label="操作" width="120" align="right">
            <template #default="{ row }">
              <div class="flex items-center justify-end gap-2">
                <button 
                  @click.stop="openWork(row)"
                  class="px-3 py-1 text-indigo-600 font-bold hover:bg-indigo-50 rounded-lg transition-all"
                >
                  编辑
                </button>
                <button 
                  @click.stop="deleteWork(row)"
                  class="px-3 py-1 text-red-500 font-bold hover:bg-red-50 rounded-lg transition-all"
                >
                  删除
                </button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Empty State -->
      <div v-if="filteredWorks.length === 0" class="flex flex-col items-center justify-center py-24 text-slate-400">
        <el-empty description="暂无短剧作品" />
        <button 
          @click="$router.push('/ai-short-drama-creator/new')"
          class="h-12 px-10 bg-indigo-600 text-white rounded-full text-[15px] font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mt-4"
        >
          <el-icon><Plus /></el-icon>
          立即创建
        </button>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex justify-end mt-6" v-if="filteredWorks.length > 0">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[12, 24, 36, 48]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="filteredWorks.length"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Plus, Search, Grid, List, MoreFilled, VideoCamera, Clock } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();

const searchQuery = ref('');
const statusFilter = ref('');
const sortBy = ref('updated_desc');
const viewMode = ref('grid');
const currentPage = ref(1);
const pageSize = ref(12);

// Mock Data
const works = ref([
  { id: 1, title: '《重生之我在古代当首富》', description: '一个现代社畜意外穿越回古代，利用现代商业知识打造商业帝国的爆笑爽文故事。', status: 'in_progress', createdAt: '2023-10-01 10:00', updatedAt: '2023-10-05 14:30' },
  { id: 2, title: '《冷面总裁的千金娇妻》', description: '豪门联姻背后的真情流露，从互相防备到相知相爱的都市情感短剧。', status: 'completed', createdAt: '2023-09-15 09:20', updatedAt: '2023-09-28 16:45' },
  { id: 3, title: '《末日拾荒者》', description: '废土世界中，主角依靠一个神秘的系统，在废墟中寻找生存资源并建立避难所。', status: 'draft', createdAt: '2023-10-10 11:15', updatedAt: '2023-10-10 11:15' },
  { id: 4, title: '《星际迷航：觉醒》', description: '讲述人类首次踏出太阳系，与外星文明发生接触并引发一系列危机的科幻史诗。', status: 'in_progress', createdAt: '2023-10-08 08:00', updatedAt: '2023-10-12 09:30' },
]);

const filteredWorks = computed(() => {
  let result = works.value;
  
  if (searchQuery.value) {
    result = result.filter(w => w.title.includes(searchQuery.value));
  }
  
  if (statusFilter.value) {
    result = result.filter(w => w.status === statusFilter.value);
  }
  
  result.sort((a, b) => {
    if (sortBy.value === 'updated_desc') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    if (sortBy.value === 'created_desc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy.value === 'name_asc') return a.title.localeCompare(b.title);
    return 0;
  });
  
  return result;
});

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = { draft: '草稿', in_progress: '创作中', completed: '已完成' };
  return map[status] || '未知';
};

const getStatusType = (status: string) => {
  const map: Record<string, "primary" | "success" | "warning" | "info" | "danger"> = { 
    draft: 'info', 
    in_progress: 'primary', 
    completed: 'success' 
  };
  return map[status] || 'info';
};

const openWork = (work: any) => {
  router.push('/ai-short-drama-creator/outline');
};

const handleCommand = (command: string, work: any) => {
  if (command === 'edit') {
    openWork(work);
  } else if (command === 'delete') {
    deleteWork(work);
  }
};

const deleteWork = (work: any) => {
  ElMessageBox.confirm(`确定要删除作品《${work.title}》吗？此操作不可恢复。`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    works.value = works.value.filter(w => w.id !== work.id);
    ElMessage.success('删除成功');
  }).catch(() => {});
};
</script>
