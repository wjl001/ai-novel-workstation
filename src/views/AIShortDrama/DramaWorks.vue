<template>
  <div class="h-full flex flex-col bg-[#F8FAFC] dark:bg-slate-900 p-6 lg:p-10 relative overflow-hidden">
    <!-- Decorative background elements for C-end feel -->
    <div class="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

    <!-- Header Section -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 relative z-10">
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <el-icon :size="20"><VideoCamera /></el-icon>
          </div>
          <h1 class="text-3xl lg:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">
            我的作品
          </h1>
          <div class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Library
          </div>
        </div>
        <p class="text-slate-500 dark:text-slate-400 text-base font-medium pl-[52px]">释放 AI 生产力，从这里开启您的爆款短剧创作之旅</p>
      </div>

      <div class="flex items-center gap-4">
        <!-- Product Design Info Button -->
        <button 
          @click="showDesignDialog = true"
          class="h-14 px-6 flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-[24px] font-bold text-sm shadow-sm border border-slate-200 dark:border-slate-700 hover:text-indigo-600 hover:border-indigo-300 transition-all duration-300"
        >
          <el-icon :size="18"><InfoFilled /></el-icon>
          <span>产品设计说明</span>
        </button>

        <!-- New Script Button - Redesigned -->
        <button 
          @click="$router.push('/ai-short-drama-creator/new')"
          class="relative group h-14 pl-4 pr-8 flex items-center gap-4 bg-indigo-600 text-white rounded-[24px] font-black text-base shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:-translate-y-1 transition-all duration-500 overflow-hidden"
        >
          <!-- Animated Background Decoration -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-xl -ml-12 -mb-12 group-hover:scale-150 transition-transform duration-700"></div>

          <div class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
            <el-icon :size="20" class="stroke-2"><Plus /></el-icon>
          </div>
          <div class="flex flex-col items-start leading-none">
            <span class="text-[15px]">新建剧本</span>
            <span class="text-[10px] opacity-60 font-medium uppercase tracking-widest mt-1">Start New Project</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Toolbar Section -->
    <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[28px] p-5 shadow-sm border border-white/40 dark:border-slate-700/50 mb-8 flex flex-wrap justify-between items-center gap-6 relative z-10">
      <div class="flex items-center gap-4 flex-1 min-w-[300px]">
        <el-input 
          v-model="searchQuery" 
          placeholder="搜索作品标题..." 
          class="custom-search-input-v2 !w-72"
          clearable
        >
          <template #prefix>
            <el-icon class="text-indigo-500"><Search /></el-icon>
          </template>
        </el-input>
        
        <div class="h-8 w-px bg-slate-100 dark:bg-slate-700 mx-1 hidden md:block"></div>
        
        <div class="flex gap-3">
          <el-select v-model="statusFilter" placeholder="作品状态" class="custom-select-v2 !w-36" clearable>
            <el-option label="全部状态" value="" />
            <el-option label="草稿" value="draft" />
            <el-option label="创作中" value="in_progress" />
            <el-option label="已完成" value="completed" />
          </el-select>
          
          <el-select v-model="sortBy" placeholder="排序方式" class="custom-select-v2 !w-40">
            <el-option label="最近修改" value="updated_desc" />
            <el-option label="最近创建" value="created_desc" />
            <el-option label="名称排序" value="name_asc" />
          </el-select>
        </div>
      </div>
      
      <div class="flex items-center bg-slate-100/50 dark:bg-slate-900/50 p-1 rounded-2xl border border-slate-100 dark:border-slate-700">
        <button 
          @click="viewMode = 'grid'"
          class="px-4 h-9 rounded-xl flex items-center justify-center gap-2 transition-all text-sm font-bold"
          :class="viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'"
        >
          <el-icon :size="18"><Grid /></el-icon>
          <span>网格</span>
        </button>
        <button 
          @click="viewMode = 'list'"
          class="px-4 h-9 rounded-xl flex items-center justify-center gap-2 transition-all text-sm font-bold"
          :class="viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'"
        >
          <el-icon :size="18"><List /></el-icon>
          <span>列表</span>
        </button>
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-auto custom-scrollbar pr-2 relative z-10">
      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
        <div v-for="work in filteredWorks" :key="work.id" 
          class="bg-white dark:bg-slate-800 rounded-[32px] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 transition-all duration-500 cursor-pointer flex flex-col group relative"
          @click="openWork(work)"
        >
          <!-- Card Header/Poster Area -->
          <div class="h-44 bg-slate-100 dark:bg-slate-900 relative overflow-hidden">
            <!-- Animated Background Gradient if no image -->
            <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 group-hover:scale-110 transition-transform duration-700"></div>
            
            <!-- Centered Icon -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-16 h-16 rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-lg flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <el-icon :size="32"><VideoCamera /></el-icon>
              </div>
            </div>

            <!-- Status Badge (Top Left) -->
            <div class="absolute top-4 left-4 z-20">
              <span 
                class="px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase backdrop-blur-md border"
                :class="{
                  'bg-indigo-500/10 text-indigo-600 border-indigo-200/50': work.status === 'in_progress',
                  'bg-emerald-500/10 text-emerald-600 border-emerald-200/50': work.status === 'completed',
                  'bg-slate-500/10 text-slate-500 border-slate-200/50': work.status === 'draft'
                }"
              >
                {{ getStatusLabel(work.status) }}
              </span>
            </div>

            <!-- More Actions (Top Right) -->
            <div class="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <el-dropdown trigger="click" @command="(cmd) => handleCommand(cmd, work)">
                <button 
                  class="w-9 h-9 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-all"
                  @click.stop
                >
                  <el-icon><MoreFilled /></el-icon>
                </button>
                <template #dropdown>
                  <el-dropdown-menu class="!rounded-2xl !p-2 shadow-2xl border-none">
                    <el-dropdown-item command="edit" class="!rounded-xl !py-2.5 !px-4">
                      <el-icon class="mr-2"><Edit /></el-icon>编辑作品
                    </el-dropdown-item>
                    <el-dropdown-item command="delete" class="!rounded-xl !py-2.5 !px-4 !text-red-500">
                      <el-icon class="mr-2"><Delete /></el-icon>删除作品
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          
          <!-- Card Content -->
          <div class="p-6 flex flex-col flex-1">
            <h3 class="font-black text-lg text-slate-800 dark:text-slate-100 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors duration-300" :title="work.title">
              {{ work.title }}
            </h3>
            <p class="text-[13px] text-slate-400 dark:text-slate-500 mb-6 line-clamp-2 leading-relaxed flex-1">
              {{ work.description || '暂无作品简介内容，快去开始创作吧，释放你的无限可能' }}
            </p>
            
            <div class="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700/50 mt-auto">
              <div class="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                <el-icon class="text-indigo-400"><Clock /></el-icon>
                <span>{{ work.updatedAt.split(' ')[0] }}</span>
              </div>
              
              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                <span class="text-[12px] font-bold text-indigo-600">立即编辑</span>
                <el-icon class="text-indigo-600"><ArrowRight /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden relative z-10">
        <el-table :data="filteredWorks" style="width: 100%" @row-click="openWork" class="custom-table-v2">
          <el-table-column prop="title" label="作品名称" min-width="240">
            <template #default="{ row }">
              <div class="flex items-center gap-4 py-2">
                <div class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center shadow-sm">
                  <el-icon :size="20"><VideoCamera /></el-icon>
                </div>
                <div>
                  <div class="font-black text-slate-800 dark:text-slate-200 text-[15px]">{{ row.title }}</div>
                  <div class="text-[12px] text-slate-400 mt-0.5 line-clamp-1 max-w-[300px] font-medium">{{ row.description || '暂无简介' }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="140">
            <template #default="{ row }">
              <span 
                class="px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase border"
                :class="{
                  'bg-indigo-50 text-indigo-600 border-indigo-100': row.status === 'in_progress',
                  'bg-emerald-50 text-emerald-600 border-emerald-100': row.status === 'completed',
                  'bg-slate-50 text-slate-500 border-slate-200': row.status === 'draft'
                }"
              >
                {{ getStatusLabel(row.status) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="updatedAt" label="最后修改" width="180">
             <template #default="{ row }">
               <span class="text-[13px] font-medium text-slate-500">{{ row.updatedAt }}</span>
             </template>
          </el-table-column>
          <el-table-column label="操作" width="160" align="right">
            <template #default="{ row }">
              <div class="flex items-center justify-end gap-3 px-4">
                <button 
                  @click.stop="openWork(row)"
                  class="w-10 h-10 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                  title="编辑"
                >
                  <el-icon><Edit /></el-icon>
                </button>
                <button 
                  @click.stop="deleteWork(row)"
                  class="w-10 h-10 flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  title="删除"
                >
                  <el-icon><Delete /></el-icon>
                </button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Empty State -->
      <div v-if="filteredWorks.length === 0" class="flex flex-col items-center justify-center py-32 text-slate-400 relative z-10">
        <div class="relative mb-10">
          <div class="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full scale-150"></div>
          <div class="w-40 h-40 bg-white dark:bg-slate-800 rounded-[40px] shadow-2xl flex items-center justify-center relative">
            <el-icon :size="80" class="text-indigo-200 dark:text-indigo-900/50"><VideoCamera /></el-icon>
          </div>
        </div>
        <h3 class="text-2xl font-black text-slate-800 dark:text-slate-100 mb-3">暂无短剧作品</h3>
        <p class="text-base font-medium text-slate-400 mb-10 max-w-xs text-center leading-relaxed">还没开始创作吗？快去开启您的第一场 AI 剧本创作之旅吧</p>
        <button 
          @click="$router.push('/ai-short-drama-creator/new')"
          class="h-14 px-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl text-lg font-bold shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-3"
        >
          <el-icon><Plus /></el-icon>
          立即开始创作
        </button>
      </div>
    </div>

    <!-- Pagination Section -->
    <div class="flex justify-center mt-10 relative z-10" v-if="filteredWorks.length > 0">
      <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 36, 48]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredWorks.length"
          class="custom-pagination-v2"
        />
      </div>
    </div>

    <!-- Product Design Dialog -->
    <el-dialog v-model="showDesignDialog" title="产品设计说明 - 作品库管理" width="700px" class="rounded-[24px] !bg-[#f8fafc] dark:!bg-slate-900 overflow-hidden" :show-close="false">
      <template #header="{ close, titleId, titleClass }">
        <div class="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
              <el-icon :size="20"><Document /></el-icon>
            </div>
            <h4 :id="titleId" :class="[titleClass, 'text-xl font-black text-slate-800 dark:text-white m-0']">产品设计说明 - 作品库</h4>
          </div>
          <button @click="close" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
            <el-icon :size="20"><Close /></el-icon>
          </button>
        </div>
      </template>
      
      <div class="px-6 py-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
        <div class="prose dark:prose-invert max-w-none">
          <h3 class="text-indigo-600 font-bold flex items-center gap-2 mb-4"><el-icon><Location /></el-icon>页面定位</h3>
          <p class="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">创作者的主页，管理所有历史短剧项目。承载了项目状态流转和全局操作的入口。</p>

          <h3 class="text-indigo-600 font-bold flex items-center gap-2 mb-4"><el-icon><Monitor /></el-icon>原型布局概要</h3>
          <ul class="space-y-3 mb-6">
            <li class="flex items-start gap-2 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-50 dark:border-slate-700/50">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
              <span class="text-slate-600 dark:text-slate-300"><strong>顶部：</strong>搜索框（按剧名、标签搜索）、状态筛选项（草稿、生成中、已完成）。</span>
            </li>
            <li class="flex items-start gap-2 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-50 dark:border-slate-700/50">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
              <span class="text-slate-600 dark:text-slate-300"><strong>主体区域：</strong>卡片式网格布局（Grid）。每个卡片代表一部短剧，封面为 AI 生成的海报或第一帧。</span>
            </li>
            <li class="flex items-start gap-2 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-50 dark:border-slate-700/50">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
              <span class="text-slate-600 dark:text-slate-300"><strong>卡片内容：</strong>封面图、剧名、集数、更新时间、当前进度标签、操作按钮（...菜单：复制项目、删除、导出）。</span>
            </li>
          </ul>

          <h3 class="text-indigo-600 font-bold flex items-center gap-2 mb-4"><el-icon><Pointer /></el-icon>核心交互</h3>
          <ul class="space-y-3">
            <li class="flex items-start gap-2 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-50 dark:border-slate-700/50">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
              <span class="text-slate-600 dark:text-slate-300"><strong>Hover效果：</strong>鼠标悬停在短剧卡片上，封面图自动静音播放预告片或精彩片段（如果有成片）。</span>
            </li>
            <li class="flex items-start gap-2 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-50 dark:border-slate-700/50">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
              <span class="text-slate-600 dark:text-slate-300"><strong>进度直达：</strong>点击卡片，直接进入该项目最后一次编辑的节点页面（如直接跳到分镜台）。</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
        <button @click="showDesignDialog = false" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-sm">
          我已了解
        </button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Plus, Search, Grid, List, MoreFilled, VideoCamera, Clock, Edit, Delete, ArrowRight, InfoFilled, Close, Document, Location, Monitor, Pointer } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();
const showDesignDialog = ref(false);

const searchQuery = ref('');
const statusFilter = ref('');
const sortBy = ref('updated_desc');
const viewMode = ref('grid');
const currentPage = ref(1);
const pageSize = ref(12);

// Mock Data
const works = ref([
  { id: 1, title: '《星际迷航：觉醒》', description: '讲述人类首次踏出太阳系，与外星文明发生接触并引发一系列危机的科幻史诗。', status: 'in_progress', createdAt: '2023-10-08 08:00', updatedAt: '2023-10-12 09:30' },
  { id: 2, title: '《末日拾荒者》', description: '废土世界中，主角依靠一个神秘的系统，在废墟中寻找生存资源并建立避难所。', status: 'draft', createdAt: '2023-10-10 11:15', updatedAt: '2023-10-10 11:15' },
  { id: 3, title: '《重生之我在古代当首富》', description: '一个现代社畜意外穿越回古代，利用现代商业知识打造商业帝国的爆笑爽文故事。', status: 'in_progress', createdAt: '2023-10-01 10:00', updatedAt: '2023-10-05 14:30' },
  { id: 4, title: '《冷面总裁的千金娇妻》', description: '豪门联姻背后的真情流露，从互相防备到相知相爱的都市情感短剧。', status: 'completed', createdAt: '2023-09-15 09:20', updatedAt: '2023-09-28 16:45' },
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
    confirmButtonClass: 'rounded-full px-8 bg-red-500 border-red-500',
    cancelButtonClass: 'rounded-full px-8'
  }).then(() => {
    works.value = works.value.filter(w => w.id !== work.id);
    ElMessage.success('删除成功');
  }).catch(() => {});
};
</script>

<style scoped>
/* Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
}

/* Input & Select Customization */
:deep(.custom-search-input-v2 .el-input__wrapper) {
  border-radius: 16px;
  background-color: transparent !important;
  box-shadow: 0 0 0 1px #f1f5f9 inset !important;
  padding-left: 12px;
  height: 44px;
}
.dark :deep(.custom-search-input-v2 .el-input__wrapper) {
  box-shadow: 0 0 0 1px #334155 inset !important;
}
:deep(.custom-search-input-v2 .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #6366f1 inset !important;
}

:deep(.custom-select-v2 .el-input__wrapper) {
  border-radius: 16px;
  background-color: transparent !important;
  box-shadow: 0 0 0 1px #f1f5f9 inset !important;
  height: 44px;
}
.dark :deep(.custom-select-v2 .el-input__wrapper) {
  box-shadow: 0 0 0 1px #334155 inset !important;
}

/* Table Customization */
.custom-table-v2 {
  --el-table-border-color: transparent;
  --el-table-header-bg-color: #F8FAFC;
  background-color: transparent !important;
}
.dark .custom-table-v2 {
  --el-table-header-bg-color: #0f172a;
}
:deep(.custom-table-v2 th.el-table__cell) {
  background-color: var(--el-table-header-bg-color) !important;
  color: #94a3b8;
  font-weight: 800;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 20px 0;
}
:deep(.custom-table-v2 td.el-table__cell) {
  border-bottom: 1px solid #f8fafc;
  padding: 12px 0;
}
.dark :deep(.custom-table-v2 td.el-table__cell) {
  border-bottom: 1px solid #1e293b;
}
:deep(.custom-table-v2 .el-table__row:hover td) {
  background-color: #f1f5f9/50 !important;
}
.dark :deep(.custom-table-v2 .el-table__row:hover td) {
  background-color: #1e293b/50 !important;
}

/* Pagination Customization */
.custom-pagination-v2 :deep(.el-pagination__total),
.custom-pagination-v2 :deep(.el-pagination__jump) {
  color: #94a3b8;
  font-weight: 600;
  font-size: 13px;
}
.custom-pagination-v2 :deep(.el-pager li) {
  background: transparent !important;
  color: #64748b;
  font-weight: 700;
  border-radius: 10px;
  margin: 0 2px;
}
.custom-pagination-v2 :deep(.el-pager li.is-active) {
  background: #6366f1 !important;
  color: white !important;
}
</style>