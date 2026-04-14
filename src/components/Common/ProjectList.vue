<template>
  <div class="h-full p-8 overflow-y-auto custom-scrollbar transition-colors duration-300" :class="bgClass">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-end mb-8 border-b pb-6 relative" :class="isLight ? 'border-slate-200' : 'border-slate-800'">
         <div class="flex items-center gap-4 pl-12">
           <!-- Floating Back Button (C-end Design) -->
           <div class="absolute -left-2 top-1/2 -translate-y-1/2">
             <button 
               @click="router.back()" 
               class="flex items-center justify-center w-11 h-11 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgba(79,70,229,0.12)] border border-white dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-110 active:scale-95 transition-all duration-300"
             >
               <el-icon :size="20"><ArrowLeft /></el-icon>
             </button>
           </div>
           <div class="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
          <div>
            <h1 class="text-3xl font-bold mb-2 tracking-tight" :class="isLight ? 'text-slate-800' : 'text-white'">{{ title }}</h1>
            <p :class="isLight ? 'text-slate-500' : 'text-slate-400'">{{ description }}</p>
          </div>
        </div>
        <el-button type="primary" size="large" class="shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all bg-indigo-600 border-none" @click="createNew">
          <el-icon class="mr-2"><Plus /></el-icon> 新建剧本
        </el-button>
      </div>

      <!-- Project Grid -->
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 3" :key="i" class="rounded-xl border p-5 shadow-lg animate-pulse" :class="isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'">
          <div class="h-40 rounded-lg mb-4" :class="isLight ? 'bg-slate-200' : 'bg-slate-700'"></div>
          <div class="h-6 rounded w-3/4 mb-2" :class="isLight ? 'bg-slate-200' : 'bg-slate-700'"></div>
          <div class="h-4 rounded w-1/2 mb-4" :class="isLight ? 'bg-slate-200' : 'bg-slate-700'"></div>
          <div class="flex justify-between">
            <div class="h-4 rounded w-1/4" :class="isLight ? 'bg-slate-200' : 'bg-slate-700'"></div>
            <div class="h-4 rounded w-1/4" :class="isLight ? 'bg-slate-200' : 'bg-slate-700'"></div>
          </div>
        </div>
      </div>
      <div v-else-if="projects.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <div 
          v-for="(project, index) in projects" 
          :key="project.id" 
          class="rounded-2xl border shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden flex flex-col animate-fade-slide-up"
          :class="cardClass"
          :style="{ animationDelay: `${index * 100}ms` }"
          @click="openProject(project.id, 'outline')"
        >
          <!-- Cover Image/Placeholder -->
          <div class="aspect-[16/10] relative overflow-hidden transition-all duration-500" :class="isLight ? 'bg-slate-50' : 'bg-slate-900'" @click.stop="openSettings(project.id)">
            <!-- Glass Overlay (Refined for C-end) -->
            <div class="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[6px] flex flex-row items-center justify-center gap-2 px-2">
               <el-upload
                 action="#"
                 :auto-upload="false"
                 :show-file-list="false"
                 :on-change="(file) => handleCoverUpload(file, project)"
                 accept="image/*"
                 @click.stop
               >
                 <button class="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-white text-indigo-600 text-[11px] font-bold hover:bg-indigo-50 transition-all active:scale-95 shadow-lg whitespace-nowrap">
                   <el-icon><Upload /></el-icon> 上传封面
                 </button>
               </el-upload>
               
               <button 
                 class="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-700 hover:scale-105 transition-all active:scale-95 shadow-lg shadow-indigo-500/30 whitespace-nowrap"
                 @click.stop="openAIGenerator(project)"
               >
                 <el-icon><MagicStick /></el-icon> AI 生成
               </button>
            </div>

            <!-- Image Content -->
            <img v-if="project.cover" :src="project.cover" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" @error="handleImageError($event, project)" />
            <div v-else class="w-full h-full relative group-hover:scale-110 transition-transform duration-1000">
              <img :src="generateDefaultCover(project.title)" class="w-full h-full object-cover" />
              <!-- Title Overlay for default cover -->
              <div class="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black/20">
                <div class="text-white text-sm font-bold line-clamp-2 text-center drop-shadow-lg px-4">{{ project.title }}</div>
              </div>
            </div>

            <!-- Status Tag -->
            <div class="absolute top-3 right-3 z-30">
              <div :class="[
                'px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm border',
                getStatusStyle(project.status)
              ]">
                {{ getStatusLabel(project.status) }}
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="p-4 flex-1">
            <h3 class="font-bold text-base mb-1.5 line-clamp-1 group-hover:text-indigo-400 transition-colors" :class="isLight ? 'text-slate-800' : 'text-white'">{{ project.title }}</h3>
            <div class="flex items-center justify-between">
              <p class="text-[10px]" :class="isLight ? 'text-slate-500' : 'text-slate-400'">{{ project.updatedAt }} 更新</p>
              <div class="flex items-center gap-2 text-[10px]" :class="isLight ? 'text-slate-400' : 'text-slate-500'">
                <span class="flex items-center gap-0.5"><el-icon><View /></el-icon>{{ project.views }}</span>
                <span class="flex items-center gap-0.5"><el-icon><Star /></el-icon>{{ project.likes }}</span>
              </div>
            </div>
          </div>

          <!-- Action Footer (Floating on Hover) -->
          <div class="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-30 bg-gradient-to-t from-slate-900/95 to-slate-900/60 backdrop-blur-md border-t border-white/10 flex justify-around">
            <el-tooltip content="设定" placement="top">
              <button class="p-2 text-slate-300 hover:text-white transition-colors" @click.stop="openSettings(project.id)">
                <el-icon :size="16"><Setting /></el-icon>
              </button>
            </el-tooltip>

            <el-tooltip content="编辑" placement="top">
              <button class="p-2 text-slate-300 hover:text-white transition-colors" @click.stop="openProject(project.id, 'outline')">
                <el-icon :size="16"><EditPen /></el-icon>
              </button>
            </el-tooltip>

            <el-tooltip content="章节" placement="top">
              <button class="p-2 text-slate-300 hover:text-white transition-colors" @click.stop="openProject(project.id, 'chapters')">
                <el-icon :size="16"><List /></el-icon>
              </button>
            </el-tooltip>

            <el-tooltip content="导出" placement="top">
              <button class="p-2 text-slate-300 hover:text-green-400 transition-colors" @click.stop="handleDownload(project)">
                <el-icon :size="16"><VideoCamera /></el-icon>
              </button>
            </el-tooltip>

            <el-tooltip content="克隆" placement="top">
              <button class="p-2 text-slate-300 hover:text-blue-400 transition-colors" @click.stop="handleClone(project)">
                <el-icon :size="16"><CopyDocument /></el-icon>
              </button>
            </el-tooltip>

            <el-tooltip content="删除" placement="top">
              <button class="p-2 text-slate-300 hover:text-red-500 transition-colors" @click.stop="deleteProject(project.id)">
                <el-icon :size="16"><Delete /></el-icon>
              </button>
            </el-tooltip>
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

    <!-- AI Generator Dialog (Light Mode) -->
    <el-dialog v-model="showAIDialog" title="AI 封面生成工坊" width="700px" append-to-body class="light-dialog">
      <div class="space-y-6">
        <!-- Prompt Input -->
        <div class="rounded-xl border border-slate-200 bg-white p-4 transition-colors focus-within:border-indigo-500/50 shadow-sm">
           <div class="text-sm mb-2 font-medium text-slate-700">生成描述词 (Prompt)</div>
           <el-input 
             v-model="aiPrompt"
             type="textarea" 
             :rows="4"
             placeholder="例如：古风武侠，边境战火，义军首领手持重锤，背景是燃烧的村庄..."
             class="!text-base"
             :input-style="{ backgroundColor: 'white', color: '#1e293b' }"
           />
           <div class="flex justify-end mt-2">
             <el-button type="primary" :loading="isGenerating" class="shadow-lg shadow-indigo-500/20" @click="generateCoverImages">
               <el-icon class="mr-1"><MagicStick /></el-icon> 开始生成
             </el-button>
           </div>
        </div>

        <!-- Result Grid -->
        <div class="space-y-4">
           <!-- Gallery Tabs -->
           <div class="flex items-center gap-4 mb-2">
             <div class="text-sm font-bold text-slate-700">可选封面素材</div>
             <div class="flex-1 h-px bg-slate-100"></div>
           </div>

           <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 min-h-[200px] relative rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-4 transition-colors">
              <!-- Default Gallery (Always shown initially or when not generating) -->
              <template v-if="generatedImages.length === 0 && !isGenerating">
                <div 
                  v-for="(img, idx) in defaultCovers" 
                  :key="'default-' + idx"
                  class="relative group cursor-pointer rounded-xl overflow-hidden border-4 transition-all aspect-[16/10] shadow-md"
                  :class="selectedImage === img ? 'border-indigo-500 shadow-xl shadow-indigo-500/20 scale-[1.05]' : 'border-transparent hover:border-indigo-300/50'"
                  @click="selectedImage = img"
                >
                  <img :src="img" class="w-full h-full object-cover" />
                  <div class="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity" v-if="selectedImage !== img"></div>
                  <div class="absolute top-2 right-2" v-if="selectedImage === img">
                    <div class="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white">
                      <el-icon><Check /></el-icon>
                    </div>
                  </div>
                  <!-- Label for default -->
                  <div class="absolute bottom-0 inset-x-0 p-1 bg-black/40 backdrop-blur-sm text-[10px] text-white text-center opacity-0 group-hover:opacity-100 transition-opacity">推荐素材</div>
                </div>
              </template>
              
              <!-- AI Generated Image (Single Mode) -->
              <template v-else-if="generatedImages.length > 0">
                <div class="col-span-full flex justify-center py-2">
                  <div 
                    class="relative group cursor-pointer rounded-2xl overflow-hidden border-4 transition-all aspect-[16/10] shadow-2xl w-full max-w-[480px]"
                    :class="selectedImage === generatedImages[0] ? 'border-indigo-500 scale-[1.02]' : 'border-transparent'"
                    @click="selectedImage = generatedImages[0]"
                  >
                    <img :src="generatedImages[0]" class="w-full h-full object-cover" />
                    <div class="absolute top-4 right-4">
                      <div class="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white">
                        <el-icon :size="20"><Check /></el-icon>
                      </div>
                    </div>
                    <div class="absolute bottom-0 inset-x-0 p-3 bg-indigo-600/80 backdrop-blur-md text-sm text-white text-center font-bold">
                      AI 已为您生成专属封面
                    </div>
                  </div>
                </div>
              </template>
              
              <div v-if="isGenerating" class="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/80 backdrop-blur-sm rounded-2xl">
                <div class="loading-spinner mb-4 !border-indigo-500 !border-b-transparent"></div>
                <p class="text-indigo-600 animate-pulse font-bold">AI 正在绘图...</p>
              </div>
           </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <el-button @click="showAIDialog = false">取消</el-button>
          <el-button type="primary" :disabled="!selectedImage" @click="confirmAICover">应用封面</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Picture, User, View, Star, Edit, Delete, FolderAdd, List, EditPen, Setting, Download, CopyDocument, Upload, MagicStick, Check, Loading, VideoCamera, ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UploadFile } from 'element-plus'

const router = useRouter()
const showAIDialog = ref(false)
const aiPrompt = ref('')
const isGenerating = ref(false)
const generatedImages = ref<string[]>([])
const selectedImage = ref('')
const currentProjectForAI = ref<any>(null)

// Default cover gallery
const defaultCovers = [
  'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=600&h=375&auto=format&fit=crop', // Sci-fi
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=600&h=375&auto=format&fit=crop', // Ancient
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&h=375&auto=format&fit=crop', // Movie
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&h=375&auto=format&fit=crop', // Forest/Mystery
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&h=375&auto=format&fit=crop', // Cyberpunk
  'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=600&h=375&auto=format&fit=crop', // Cinema
  'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=600&h=375&auto=format&fit=crop', // City Night
  'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=600&h=375&auto=format&fit=crop'  // Vintage
]

const props = defineProps<{
  title: string
  description: string
  type: 'novel' | 'script'
}>()

const isLoading = ref(true)
const emit = defineEmits(['create', 'open'])

const isLight = inject('isLight', ref(false))
const theme = inject('theme', ref('dark'))

const bgClass = computed(() => {
  if (theme.value === 'dreamy') return 'bg-transparent'
  return isLight.value ? 'bg-white' : 'bg-slate-900'
})

const cardClass = computed(() => {
  if (theme.value === 'dreamy') return 'bg-white/60 border-white/50 hover:shadow-xl hover:bg-white/80 backdrop-blur-sm'
  return isLight.value ? 'bg-white border-slate-200 hover:shadow-xl' : 'bg-slate-800 border-slate-700 hover:shadow-indigo-500/10 hover:border-indigo-500/30'
})

// Mock Data
const projects = ref<any[]>([])

// Simulate loading
setTimeout(() => {
  projects.value = [
    { 
      id: 1, 
      title: props.type === 'novel' ? '开局一根棍，我掀了元廷这烂摊子！' : '开局一根棍，我掀了元廷这烂摊子！(短剧)', 
      cover: '', // Empty cover to trigger default generation
      status: 'writing', 
      updatedAt: '2023-10-24',
      author: 'Admin',
      views: 128,
      likes: 45
    },
    { 
      id: 2, 
      title: props.type === 'novel' ? '剑指天涯' : '剑指天涯 (短剧)', 
      cover: '', // Empty cover to trigger default generation
      status: 'published', 
      updatedAt: '2023-10-20',
      author: 'Admin',
      views: 1024,
      likes: 356
    },
    { 
      id: 3, 
      title: '星际迷航：失落的文明', 
      cover: '', // Empty cover to trigger default generation
      status: 'outline', 
      updatedAt: '2023-10-25',
      author: 'Admin',
      views: 56,
      likes: 12
    }
  ]
  isLoading.value = false
}, 800)


const getStatusStyle = (status: string) => {
  const map: Record<string, string> = {
    draft: 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30',
    outline: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30',
    writing: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30',
    completed: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30',
    published: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30',
    archived: 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30'
  }
  return map[status] || 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30'
}

const generateDefaultCover = (title: string, variant: number = 0) => {
  const gradients = [
    ['#4f46e5', '#7c3aed'], // Indigo to Violet
    ['#f43f5e', '#fb923c'], // Rose to Orange
    ['#10b981', '#06b6d4'], // Emerald to Cyan
    ['#3b82f6', '#2563eb'], // Blue
    ['#ec4899', '#8b5cf6'], // Pink to Purple
    ['#f59e0b', '#ef4444'], // Amber to Red
    ['#06b6d4', '#3b82f6'], // Cyan to Blue
    ['#8b5cf6', '#d946ef']  // Purple to Fuchsia
  ]
  
  let hash = variant;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % gradients.length;
  const [c1, c2] = gradients[colorIndex];
  
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="600" height="375" viewBox="0 0 600 375">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}" />
        <stop offset="100%" stop-color="${c2}" />
      </linearGradient>
      <filter id="f" x="0" y="0" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="30" />
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)" />
    <circle cx="500" cy="50" r="150" fill="white" fill-opacity="0.1" filter="url(#f)" />
    <circle cx="50" cy="300" r="100" fill="black" fill-opacity="0.1" filter="url(#f)" />
    <rect x="20" y="20" width="560" height="335" rx="15" fill="none" stroke="white" stroke-opacity="0.1" stroke-width="1" />
  </svg>`
  
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg.trim().replace(/\s+/g, ' '))
}

// Upload Handler
const handleCoverUpload = (uploadFile: UploadFile, project: any) => {
  if (uploadFile.raw) {
    const reader = new FileReader()
    reader.onload = (e) => {
      project.cover = e.target?.result as string
      ElMessage.success('封面上传成功')
    }
    reader.readAsDataURL(uploadFile.raw)
  }
}

// AI Generator Logic
const openAIGenerator = (project: any) => {
  currentProjectForAI.value = project
  aiPrompt.value = `${project.title}，封面图，高清，${project.type === 'novel' ? '小说封面' : '短剧海报'}风格`
  generatedImages.value = []
  selectedImage.value = ''
  showAIDialog.value = true
}

const generateCoverImages = () => {
  if (!aiPrompt.value) return ElMessage.warning('请输入描述词')
  
  isGenerating.value = true
  generatedImages.value = []
  
  // Simulate AI generation delay
  setTimeout(() => {
    // Generate only ONE image as requested
    const newImg = 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1200&h=750&auto=format&fit=crop'
    generatedImages.value = [newImg]
    selectedImage.value = newImg // Auto-select the only generated image
    isGenerating.value = false
  }, 1500)
}

const confirmAICover = () => {
  if (currentProjectForAI.value && selectedImage.value) {
    currentProjectForAI.value.cover = selectedImage.value
    showAIDialog.value = false
    ElMessage.success('封面更新成功')
  }
}

const handleImageError = (e: Event, project: any) => {
  if (e.target) {
    (e.target as HTMLImageElement).src = generateDefaultCover(project.title)
  }
}

const getStatusType = (status: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    draft: 'info',
    outline: 'warning',
    writing: 'primary',
    completed: 'success',
    published: 'success',
    archived: 'info'
  }
  return map[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    draft: '草稿',
    outline: '大纲已成',
    writing: '连载中',
    completed: '已完结',
    published: '已完结',
    archived: '已归档'
  }
  return map[status] || status
}

const createNew = () => {
  emit('create')
}

const openProject = (id: number, step: string = 'outline') => {
  router.push({ name: 'novel-generator', query: { id: id.toString(), step } })
}

const openSettings = (id: number) => {
  // Navigate to AIWriteNovel with mode=create to show the "Basic Settings" page
  // In a real app, this would also pass the ID to load that project's settings
  router.push({ name: 'ai-write-novel', query: { mode: 'create', id: id.toString() } })
}

const handleDownload = (project: any) => {
  ElMessage.success(`正在对接短剧项目《${project.title}》...`)
}

const handleClone = (project: any) => {
  const newProject = { ...project, id: Date.now(), title: project.title + ' (副本)', status: 'draft', updatedAt: new Date().toISOString().split('T')[0] }
  projects.value.unshift(newProject)
  ElMessage.success('项目克隆成功')
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

/* Force white input for AI Dialog */
:deep(.force-white-input .el-textarea__inner) {
  background-color: #ffffff !important;
  color: #000000 !important;
  border-color: #e2e8f0 !important;
}
:deep(.force-white-input .el-textarea__inner::placeholder) {
  color: #94a3b8 !important;
}

@keyframes fade-slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-slide-up {
  animation: fade-slide-up 0.5s ease-out forwards;
  opacity: 0; /* Start hidden */
}
</style>
