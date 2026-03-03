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
          class="bg-slate-800 rounded-xl border border-slate-700 shadow-lg hover:shadow-xl hover:border-indigo-500/50 transition-all cursor-pointer group relative overflow-hidden flex flex-col"
          @click="openProject(project.id, 'outline')"
        >
          <!-- Cover Image/Placeholder -->
          <div class="h-40 bg-slate-900 relative overflow-hidden group-hover:opacity-90 transition-opacity">
            <img v-if="project.cover" :src="project.cover" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" @error="(e) => (e.target as HTMLImageElement).src = generateDefaultCover(project.title)" />
            <img v-else :src="generateDefaultCover(project.title)" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div class="absolute top-2 right-2">
              <el-tag size="small" effect="dark" :type="getStatusType(project.status) as any" class="!bg-opacity-80 backdrop-blur-sm shadow-sm">{{ getStatusLabel(project.status) }}</el-tag>
            </div>
            
            <!-- Cover Actions Overlay -->
            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm z-10">
               <el-upload
                 action="#"
                 :auto-upload="false"
                 :show-file-list="false"
                 :on-change="(file) => handleCoverUpload(file, project)"
                 accept="image/*"
               >
                 <el-button size="small" type="primary" plain class="!bg-white/10 !border-white/20 !text-white hover:!bg-white/20">
                   <el-icon class="mr-1"><Upload /></el-icon> 上传封面
                 </el-button>
               </el-upload>
               
               <el-button size="small" type="success" plain class="!bg-emerald-500/20 !border-emerald-500/30 !text-emerald-300 hover:!bg-emerald-500/30" @click.stop="openAIGenerator(project)">
                 <el-icon class="mr-1"><MagicStick /></el-icon> AI 生成
               </el-button>
            </div>
          </div>

          <!-- Content -->
          <div class="p-5 flex-1">
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

          <!-- Action Footer -->
          <div class="p-3 bg-slate-800/80 border-t border-slate-700 grid grid-cols-6 gap-1">
            <el-tooltip content="管理章节" placement="top">
              <el-button text class="!text-slate-400 hover:!text-indigo-400 !px-0" @click.stop="openProject(project.id, 'chapters')">
                <el-icon><List /></el-icon>
              </el-button>
            </el-tooltip>
            
            <el-tooltip content="编辑大纲" placement="top">
              <el-button text class="!text-slate-400 hover:!text-indigo-400 !px-0" @click.stop="openProject(project.id, 'outline')">
                <el-icon><EditPen /></el-icon>
              </el-button>
            </el-tooltip>

            <el-tooltip content="基础设定" placement="top">
              <el-button text class="!text-slate-400 hover:!text-indigo-400 !px-0" @click.stop="openProject(project.id, 'settings')">
                <el-icon><Setting /></el-icon>
              </el-button>
            </el-tooltip>

            <el-tooltip content="下载导出" placement="top">
              <el-button text class="!text-slate-400 hover:!text-green-400 !px-0" @click.stop="handleDownload(project)">
                <el-icon><Download /></el-icon>
              </el-button>
            </el-tooltip>

            <el-tooltip content="克隆项目" placement="top">
              <el-button text class="!text-slate-400 hover:!text-blue-400 !px-0" @click.stop="handleClone(project)">
                <el-icon><CopyDocument /></el-icon>
              </el-button>
            </el-tooltip>

            <el-tooltip content="删除项目" placement="top">
              <el-button text class="!text-slate-400 hover:!text-red-500 !px-0" @click.stop="deleteProject(project.id)">
                <el-icon><Delete /></el-icon>
              </el-button>
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

    <!-- AI Cover Generator Dialog -->
    <el-dialog v-model="showAIDialog" title="AI 封面生成工坊" width="600px" append-to-body custom-class="dark-dialog">
      <div class="space-y-4">
        <div class="p-4 bg-slate-800 rounded-lg border border-slate-700">
           <div class="text-sm text-slate-400 mb-2">生成描述词 (Prompt)</div>
           <el-input 
             v-model="aiPrompt" 
             type="textarea" 
             :rows="3" 
             placeholder="例如：一个赛博朋克风格的女杀手，站在霓虹灯下的雨夜街头，冷酷，高科技义体..."
             class="dark-textarea"
           />
           <div class="mt-2 flex justify-end">
             <el-button type="primary" size="small" :loading="isGenerating" @click="generateCoverImages">
               <el-icon class="mr-1"><MagicStick /></el-icon> 开始生成
             </el-button>
           </div>
        </div>

        <div v-if="generatedImages.length > 0" class="grid grid-cols-2 gap-4">
           <div 
             v-for="(img, idx) in generatedImages" 
             :key="idx" 
             class="relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all aspect-[2/3]"
             :class="selectedImage === img ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' : 'border-transparent hover:border-slate-500'"
             @click="selectedImage = img"
           >
             <img :src="img" class="w-full h-full object-cover" />
             <div v-if="selectedImage === img" class="absolute inset-0 bg-indigo-500/20 flex items-center justify-center">
               <div class="bg-indigo-500 text-white rounded-full p-1">
                 <el-icon><Check /></el-icon>
               </div>
             </div>
           </div>
        </div>
        
        <div v-else-if="isGenerating" class="flex flex-col items-center justify-center py-12 text-slate-500">
           <el-icon class="is-loading text-indigo-500 mb-2" :size="32"><Loading /></el-icon>
           <p>AI 正在挥毫泼墨...</p>
        </div>
        
        <div v-else class="text-center py-12 text-slate-600 bg-slate-800/30 rounded-lg border border-dashed border-slate-700">
           <el-icon :size="48" class="mb-2 opacity-50"><Picture /></el-icon>
           <p>输入描述词后点击生成</p>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAIDialog = false" class="!bg-slate-700 !border-slate-600 !text-slate-300 hover:!text-white">取消</el-button>
          <el-button type="primary" :disabled="!selectedImage" @click="confirmAICover" class="!bg-indigo-600 border-none">
            应用封面
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Picture, User, View, Star, Edit, Delete, FolderAdd, List, EditPen, Setting, Download, CopyDocument, Upload, MagicStick, Check, Loading } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UploadFile } from 'element-plus'

const router = useRouter()
const showAIDialog = ref(false)
const aiPrompt = ref('')
const isGenerating = ref(false)
const generatedImages = ref<string[]>([])
const selectedImage = ref('')
const currentProjectForAI = ref<any>(null)

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
    cover: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=400&auto=format&fit=crop&q=60', // Changed to a more "character-like" or interesting image
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

const generateDefaultCover = (title: string) => {
  const encodedTitle = encodeURIComponent(title || '未命名作品')
  // SVG with abstract character silhouette
  const svg = `
  <svg xmlns='http://www.w3.org/2000/svg' width='600' height='900' viewBox='0 0 600 900'>
    <defs>
      <linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='#1e1b4b'/>
        <stop offset='50%' stop-color='#312e81'/>
        <stop offset='100%' stop-color='#4338ca'/>
      </linearGradient>
      <linearGradient id='char' x1='0.5' y1='0' x2='0.5' y2='1'>
        <stop offset='0%' stop-color='#818cf8'/>
        <stop offset='100%' stop-color='#6366f1'/>
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    <!-- Background -->
    <rect width='100%' height='100%' fill='url(#bg)'/>
    
    <!-- Abstract Character Silhouette (Shoulders and Head) -->
    <path d='M300 550 C 200 550, 150 650, 120 900 L 480 900 C 450 650, 400 550, 300 550 Z' fill='rgba(255,255,255,0.1)' />
    <circle cx='300' cy='420' r='100' fill='rgba(255,255,255,0.15)' />
    
    <!-- Title Area -->
    <rect x='40' y='60' width='520' height='200' rx='12' fill='rgba(0,0,0,0.3)' />
    <text x='300' y='160' font-size='48' fill='#ffffff' font-family='Arial, sans-serif' font-weight='bold' text-anchor="middle" filter="url(#glow)">${title}</text>
    
    <!-- Decorative Circle -->
    <circle cx='300' cy='420' r='90' fill='none' stroke='url(#char)' stroke-width='4' opacity='0.5' />
  </svg>`
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg)
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
  
  // Simulate AI Generation with high-quality placeholders
  // In a real app, call Stable Diffusion / Midjourney API here
  setTimeout(() => {
    // Using Unsplash source with specific keywords related to the prompt (simulated)
    // To ensure different images, we add random params
    const keywords = ['fantasy', 'cyberpunk', 'portrait', 'anime']
    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)]
    
    generatedImages.value = [
      `https://images.unsplash.com/photo-1614726365723-498aa67c5f7b?w=400&q=80&auto=format&fit=crop&t=${Date.now()}`, // Fantasy character
      `https://images.unsplash.com/photo-1563089145-599997674d42?w=400&q=80&auto=format&fit=crop&t=${Date.now()+1}`, // Neon/Cyberpunk
      `https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80&auto=format&fit=crop&t=${Date.now()+2}`, // Portrait
      `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80&auto=format&fit=crop&t=${Date.now()+3}`  // Portrait
    ]
    isGenerating.value = false
  }, 2000)
}

const confirmAICover = () => {
  if (currentProjectForAI.value && selectedImage.value) {
    currentProjectForAI.value.cover = selectedImage.value
    showAIDialog.value = false
    ElMessage.success('AI 封面已应用')
  }
}

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

const openProject = (id: number, step: string = 'outline') => {
  router.push({ name: 'novel-generator', query: { id: id.toString(), step } })
}

const handleDownload = (project: any) => {
  ElMessage.success(`正在打包下载项目《${project.title}》...`)
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
</style>