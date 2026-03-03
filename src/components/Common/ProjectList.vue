<template>
  <div class="h-full bg-slate-900 text-slate-200 p-8 overflow-y-auto custom-scrollbar">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-end mb-8 border-b border-slate-800 pb-6">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2 tracking-tight">{{ title }}</h1>
          <p class="text-slate-400">{{ description }}</p>
        </div>
        <el-button type="primary" size="large" class="shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all bg-indigo-600 border-none" @click="createNew">
          <el-icon class="mr-2"><Plus /></el-icon> 新建剧本
        </el-button>
      </div>

      <!-- Project Grid -->
      <div v-if="projects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="project in projects" 
          :key="project.id" 
          class="bg-slate-800 rounded-xl border border-slate-700 shadow-lg hover:shadow-xl hover:border-indigo-500/50 transition-all cursor-pointer group relative overflow-hidden"
          @click="openProject(project.id)"
        >
          <!-- Cover Image/Placeholder -->
          <div class="h-40 bg-slate-900 relative overflow-hidden group-hover:opacity-90 transition-opacity">
            <img v-if="project.cover" :src="project.cover" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div v-else class="w-full h-full flex items-center justify-center text-slate-600 bg-slate-900">
              <el-icon :size="48"><Picture /></el-icon>
            </div>
            <div class="absolute top-2 right-2">
              <el-tag size="small" effect="dark" :type="getStatusType(project.status) as any" class="!bg-opacity-80 backdrop-blur-sm shadow-sm">{{ getStatusLabel(project.status) }}</el-tag>
            </div>
          </div>

          <!-- Content -->
          <div class="p-5">
            <h3 class="font-bold text-lg text-white mb-1 line-clamp-1 group-hover:text-indigo-400 transition-colors">{{ project.title }}</h3>
            <p class="text-xs text-slate-500 mb-4">更新于 {{ project.updatedAt }}</p>
            
            <div class="flex items-center justify-between text-xs text-slate-400">
              <div class="flex items-center gap-2">
                <el-icon><User /></el-icon> <span>{{ project.author || '我' }}</span>
              </div>
              <div class="flex items-center gap-3">
                 <span class="flex items-center"><el-icon class="mr-1"><View /></el-icon> {{ project.views }}</span>
                 <span class="flex items-center"><el-icon class="mr-1"><Star /></el-icon> {{ project.likes }}</span>
              </div>
            </div>
          </div>

          <!-- Actions Overlay -->
          <div class="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
            <el-button circle type="primary" :icon="Edit" class="!bg-indigo-600 !border-none" @click.stop="openProject(project.id)" />
            <el-button circle type="danger" :icon="Delete" class="!bg-red-500 !border-none" @click.stop="deleteProject(project.id)" />
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center py-20 bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-700">
        <div class="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center text-slate-600 mb-4 shadow-inner">
          <el-icon :size="40"><FolderAdd /></el-icon>
        </div>
        <h3 class="text-xl font-bold text-slate-300 mb-2">暂无剧本</h3>
        <p class="text-slate-500 mb-6 text-sm">创建一个新剧本开始您的创作之旅</p>
        <el-button type="primary" plain class="!bg-transparent !border-indigo-500 !text-indigo-400 hover:!bg-indigo-500 hover:!text-white" @click="createNew">立即创建</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Picture, User, View, Star, Edit, Delete, FolderAdd } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps<{
  title: string
  description: string
  type: 'novel' | 'script'
}>()

const emit = defineEmits(['create', 'open'])

// Mock Data
const projects = ref([
  { 
    id: 1, 
    title: props.type === 'novel' ? '星际迷航：深空' : '霸道总裁爱上我 (短剧)', 
    cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400', 
    status: 'draft', 
    updatedAt: '2023-10-24',
    author: 'Admin',
    views: 128,
    likes: 45
  },
  { 
    id: 2, 
    title: props.type === 'novel' ? '修仙模拟器' : '重生之我是龙王 (短剧)', 
    cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400', 
    status: 'published', 
    updatedAt: '2023-10-20',
    author: 'Admin',
    views: 1024,
    likes: 356
  }
])

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    draft: 'info',
    published: 'success',
    archived: 'warning'
  }
  return map[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
    archived: '归档'
  }
  return map[status] || status
}

const createNew = () => {
  emit('create')
}

const openProject = (id: number) => {
  emit('open', id)
}

const deleteProject = (id: number) => {
  ElMessageBox.confirm(
    '确定要删除这个项目吗？此操作无法撤销。',
    '警告',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
      customClass: 'dark-message-box'
    }
  )
    .then(() => {
      projects.value = projects.value.filter(p => p.id !== id)
      ElMessage.success('项目已删除')
    })
    .catch(() => {})
}
</script>

<style>
/* Dark Message Box Global Override */
.dark-message-box {
  background-color: #1e293b !important; /* slate-800 */
  border: 1px solid #334155 !important;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
}
.dark-message-box .el-message-box__title {
  color: #f1f5f9 !important;
}
.dark-message-box .el-message-box__message {
  color: #94a3b8 !important;
}
</style>