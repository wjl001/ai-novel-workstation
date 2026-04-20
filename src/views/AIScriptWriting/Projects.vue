<template>
  <div class="aisw-scale p-8 h-full overflow-y-auto transition-colors duration-300" :class="bgClass">
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-4">
        <h1 class="text-3xl font-bold" :class="isLight ? 'text-slate-800' : 'text-white'">我的作品</h1>
        <el-button type="primary" plain class="!rounded-xl" @click="showPrototypeHelp = true">
          <el-icon class="mr-1"><InfoFilled /></el-icon> 原型图交互说明
        </el-button>
      </div>
      <el-button type="primary" size="large" @click="createNewProject" :class="isLight ? 'bg-indigo-600' : 'bg-indigo-600 border-none'">
        <el-icon class="mr-2"><Plus /></el-icon> 新建项目
      </el-button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div
        v-for="project in projects"
        :key="project.id"
        class="group relative rounded-2xl overflow-hidden shadow-lg border transition-all duration-300 hover:-translate-y-1"
        :class="cardClass"
        @click="openProject(project.id)"
      >
          <div class="relative h-48 overflow-hidden group-hover:scale-105 transition-transform duration-700">
            <img 
              v-if="project.cover" 
              :src="project.cover" 
              class="w-full h-full object-cover"
            />
            <div v-else class="flex flex-col items-center justify-center h-full" :class="isLight ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-slate-600'">
              <el-icon :size="48" class="mb-2"><Picture /></el-icon>
              <span class="text-xs">暂无封面</span>
            </div>
            
            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
              <el-button circle type="primary" class="!bg-indigo-600 border-none scale-0 group-hover:scale-100 transition-transform delay-75" @click.stop="openProject(project.id)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button circle type="warning" class="!bg-orange-500 border-none scale-0 group-hover:scale-100 transition-transform delay-100" @click.stop="generateCover(project)">
                <el-icon><MagicStick /></el-icon>
              </el-button>
            </div>
          </div>
          
          <div class="p-5">
            <h3 class="text-lg font-bold truncate mb-1" :class="isLight ? 'text-slate-800' : 'text-slate-200'">{{ project.title }}</h3>
            <div class="flex items-center justify-between text-xs" :class="isLight ? 'text-slate-500' : 'text-slate-500'">
              <span class="flex items-center gap-1"><div class="w-2 h-2 rounded-full" :class="isLight ? 'bg-slate-300' : 'bg-slate-600'"></div> {{ project.wordCount.toLocaleString() }} 字</span>
              <span>{{ project.updatedAt }}</span>
            </div>
          </div>
      </div>
    </div>

    <!-- AI Cover Generation Dialog -->
    <el-dialog v-model="showCoverDialog" title="AI 封面生成器" width="600px" :class="isLight ? '' : 'dark-dialog'">
      <div class="mb-4">
        <p class="mb-2 text-sm" :class="isLight ? 'text-slate-600' : 'text-slate-400'">正在生成封面：<strong :class="isLight ? 'text-slate-900' : 'text-slate-200'">{{ activeProject?.title }}</strong></p>
        <el-input 
          v-model="coverPrompt" 
          type="textarea" 
          :rows="3" 
          placeholder="描述画面场景..."
          :class="isLight ? '' : 'dark-textarea'"
        />
      </div>
      
      <div v-if="generatedCovers.length > 0" class="mb-4">
        <el-carousel trigger="click" height="300px" :autoplay="false" :class="isLight ? '' : 'dark-carousel'">
          <el-carousel-item v-for="(img, index) in generatedCovers" :key="index">
            <img :src="img" class="w-full h-full object-cover rounded-lg" />
            <el-button 
              type="success" 
              class="absolute bottom-4 right-4 shadow-lg" 
              @click="selectCover(img)"
            >
              选择此封面
            </el-button>
          </el-carousel-item>
        </el-carousel>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCoverDialog = false" :class="isLight ? '' : '!bg-slate-700 !border-slate-600 !text-slate-300 hover:!text-white'">取消</el-button>
          <el-button type="primary" :loading="isGenerating" @click="startGeneration" :class="isLight ? '' : '!bg-indigo-600 border-none'">
            生成变体
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Product Design Dialog -->
    <ProductDesignDialog
      v-model="showPrototypeHelp"
      id="script-projects"
      :default-content="{
        title: '作品列表交互原型说明',
        location: '剧本项目管理中心，用于展示和快速进入所有已创建的剧本作品。',
        layout: [
          '**项目卡片：** 卡片式展示剧本标题、字数、更新时间等核心信息。',
          '**智能封面：** 支持 AI 封面生成器为剧本快速创建视觉形象。',
          '**快捷入口：** 悬停卡片可快速进入编辑或封面重绘。'
        ],
        interactions: [
          '**悬停动效：** 鼠标移入卡片时，封面图片会轻微放大，同时浮现操作遮罩层。',
          '**AI 封面生成：** 弹窗内自定义 Prompt 后，系统模拟 AI 作画过程展示变体封面，选中后自动应用。',
          '**快速编辑：** 点击遮罩层上的“编辑”图标直接进入剧本编辑器。'
        ]
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, inject, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Picture, Edit, MagicStick, InfoFilled, Close, Document, Location, Monitor, Pointer } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ProductDesignDialog from '@/components/Common/ProductDesignDialog.vue'

const router = useRouter()
const showPrototypeHelp = ref(false)
const isLight = inject('isLight', ref(false))
const theme = inject('theme', ref('dark'))

const bgClass = computed(() => {
  if (theme.value === 'dreamy') return 'bg-transparent'
  return isLight.value ? 'bg-slate-50' : 'bg-slate-900'
})

const cardClass = computed(() => {
  if (theme.value === 'dreamy') return 'bg-white/60 border-white/50 hover:shadow-xl hover:bg-white/80 backdrop-blur-sm'
  return isLight.value ? 'bg-white border-slate-200 hover:shadow-xl' : 'bg-slate-800 border-slate-700 hover:shadow-indigo-500/10 hover:border-indigo-500/30'
})

interface Project {
  id: string
  title: string
  wordCount: number
  updatedAt: string
  cover?: string
}

const generateDefaultCover = (title: string, variant: number = 0) => {
  const gradients = [
    ['#4f46e5', '#0ea5e9'], // Indigo to Sky
    ['#db2777', '#9333ea'], // Pink to Purple
    ['#059669', '#10b981'], // Emerald
    ['#d97706', '#f59e0b'], // Amber
    ['#2563eb', '#3b82f6'], // Blue
    ['#ef4444', '#f97316'], // Red to Orange
    ['#8b5cf6', '#6366f1'], // Violet to Indigo
    ['#10b981', '#3b82f6']  // Emerald to Blue
  ]
  
  // Deterministic selection based on title hash
  let hash = variant;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % gradients.length;
  const [c1, c2] = gradients[colorIndex];
  
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}" />
        <stop offset="100%" stop-color="${c2}" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)" />
    <rect x="60" y="60" width="480" height="780" rx="30" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.3)">
      ${title.length > 6 ? title.substring(0, 6) + '...' : title}
    </text>
  </svg>`
  
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg.trim().replace(/\s+/g, ' '))
}

const projects = ref<Project[]>([
  { id: '1', title: '义军崛起', wordCount: 12500, updatedAt: '2小时前', cover: '' },
  { id: '2', title: '剑指天涯', wordCount: 45000, updatedAt: '1天前' },
  { id: '3', title: '深宫谍影', wordCount: 8200, updatedAt: '3天前' },
])

const showCoverDialog = ref(false)
const activeProject = ref<Project | null>(null)
const coverPrompt = ref('')
const isGenerating = ref(false)
const generatedCovers = ref<string[]>([])

const createNewProject = () => {
  const newId = Date.now().toString()
  projects.value.unshift({
    id: newId,
    title: '未命名项目',
    wordCount: 0,
    updatedAt: '刚刚'
  })
  openProject(newId)
}

const openProject = (id: string) => {
  router.push(`/editor/${id}`)
}

const generateCover = (project: Project) => {
  activeProject.value = project
  coverPrompt.value = `"${project.title}" 的电影感封面，高细节，8k分辨率`
  showCoverDialog.value = true
  generatedCovers.value = []
}

const startGeneration = async () => {
  if (!coverPrompt.value) {
    ElMessage.warning('请输入封面描述')
    return
  }
  isGenerating.value = true
  generatedCovers.value = []
  
  // 模拟 AI 生成过程，分批次返回图片
  // 使用本地 SVG 生成替代 Unsplash
  const mockImages = [
    generateDefaultCover(activeProject.value?.title || '封面', Date.now()),
    generateDefaultCover(activeProject.value?.title || '封面', Date.now() + 1),
    generateDefaultCover(activeProject.value?.title || '封面', Date.now() + 2),
    generateDefaultCover(activeProject.value?.title || '封面', Date.now() + 3)
  ]

  // 模拟进度条或逐步加载
  for (let i = 0; i < mockImages.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1000)) // 随机延迟
    generatedCovers.value.push(mockImages[i])
  }
  
  isGenerating.value = false
  ElMessage.success('封面生成完成！')
}

const selectCover = (url: string) => {
  if (activeProject.value) {
    activeProject.value.cover = url
    showCoverDialog.value = false
  }
}
</script>

<style scoped>
.el-carousel__item h3 {
  color: #475669;
  opacity: 0.75;
  margin: 0;
  text-align: center;
}

:deep(.dark-dialog) {
  background-color: #1e293b;
  border: 1px solid #334155;
}
:deep(.dark-dialog .el-dialog__title) {
  color: #f1f5f9;
}
:deep(.dark-textarea .el-textarea__inner) {
  background-color: #0f172a;
  box-shadow: 0 0 0 1px #334155;
  color: #e2e8f0;
}
</style>
