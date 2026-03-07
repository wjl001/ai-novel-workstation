<template>
  <div class="h-full p-8 overflow-y-auto custom-scrollbar transition-colors duration-300" :class="bgClass">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-end mb-8 border-b pb-6" :class="isLight ? 'border-slate-200' : 'border-slate-800'">
        <div>
          <h1 class="text-3xl font-bold mb-2 tracking-tight" :class="isLight ? 'text-slate-800' : 'text-white'">{{ title }}</h1>
          <p :class="isLight ? 'text-slate-500' : 'text-slate-400'">{{ description }}</p>
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
      <div v-else-if="projects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="(project, index) in projects" 
          :key="project.id" 
          class="rounded-xl border shadow-lg hover:shadow-xl hover:border-indigo-500/50 transition-all cursor-pointer group relative overflow-hidden flex flex-col animate-fade-slide-up"
          :class="cardClass"
          :style="{ animationDelay: `${index * 100}ms` }"
          @click="openProject(project.id, 'outline')"
        >
          <!-- Cover Image/Placeholder -->
          <div class="h-40 relative overflow-hidden group-hover:opacity-90 transition-opacity" :class="isLight ? 'bg-slate-100' : 'bg-slate-900'" @click.stop="openSettings(project.id)">
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
                 @click.stop
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
            <h3 class="font-bold text-lg mb-1 line-clamp-1 group-hover:text-indigo-400 transition-colors" :class="isLight ? 'text-slate-800' : 'text-white'">{{ project.title }}</h3>
            <p class="text-xs mb-4" :class="isLight ? 'text-slate-500' : 'text-slate-500'">更新于 {{ project.updatedAt }}</p>
            
            <div class="flex items-center justify-between text-xs" :class="isLight ? 'text-slate-400' : 'text-slate-400'">
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
          <div class="p-3 border-t grid grid-cols-6 gap-1" :class="isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-800/80 border-slate-700'">
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
              <el-button text class="!text-slate-400 hover:!text-indigo-400 !px-0" @click.stop="openSettings(project.id)">
                <el-icon><Setting /></el-icon>
              </el-button>
            </el-tooltip>

            <el-tooltip content="对接短剧" placement="top">
              <el-button text class="!text-slate-400 hover:!text-green-400 !px-0" @click.stop="handleDownload(project)">
                <el-icon><VideoCamera /></el-icon>
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
        <div class="grid grid-cols-2 gap-4 min-h-[300px] relative rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 transition-colors">
           <div v-if="generatedImages.length === 0 && !isGenerating" class="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
             <el-icon size="48" class="mb-4 opacity-50"><Picture /></el-icon>
             <p>输入描述词后点击生成</p>
           </div>
           
           <div v-if="isGenerating" class="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/80 backdrop-blur-sm rounded-xl">
             <div class="loading-spinner mb-4 !border-indigo-500 !border-b-transparent"></div>
             <p class="text-indigo-600 animate-pulse">AI 正在绘图...</p>
           </div>

           <div 
             v-for="(img, idx) in generatedImages" 
             :key="idx"
             class="relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all aspect-[2/3]"
             :class="selectedImage === img ? 'border-indigo-500 shadow-xl shadow-indigo-500/20 scale-[1.02]' : 'border-transparent hover:border-indigo-300'"
             @click="selectedImage = img"
           >
             <img :src="img" class="w-full h-full object-cover" />
             <div class="absolute top-2 right-2" v-if="selectedImage === img">
               <div class="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg">
                 <el-icon><Check /></el-icon>
               </div>
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
import { Plus, Picture, User, View, Star, Edit, Delete, FolderAdd, List, EditPen, Setting, Download, CopyDocument, Upload, MagicStick, Check, Loading, VideoCamera } from '@element-plus/icons-vue'
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

const isLoading = ref(true)
const emit = defineEmits(['create', 'open'])

const isLight = inject('isLight', ref(false))
const theme = inject('theme', ref('dark'))

const bgClass = computed(() => 'bg-white')

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
      title: props.type === 'novel' ? '义军崛起' : '义军崛起 (短剧)', 
      cover: 'https://images.unsplash.com/photo-1533158307587-828f0a76ef93?q=80&w=600&auto=format&fit=crop', 
      status: 'draft', 
      updatedAt: '2023-10-24',
      author: 'Admin',
      views: 128,
      likes: 45
    },
    { 
      id: 2, 
      title: props.type === 'novel' ? '剑指天涯' : '剑指天涯 (短剧)', 
      cover: 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=600&auto=format&fit=crop', 
      status: 'published', 
      updatedAt: '2023-10-20',
      author: 'Admin',
      views: 1024,
      likes: 356
    }
  ]
  isLoading.value = false
}, 800)


const generateDefaultCover = (title: string) => {
  const encodedTitle = encodeURIComponent(title)
  // Use a reliable set of high-quality placeholder images instead of SVG to ensure "real image" look
  const covers = [
    'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=600&auto=format&fit=crop', // Dark gloomy background
    'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=600&auto=format&fit=crop', // Fantasy forest
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop', // Mine/Cave
    'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?q=80&w=600&auto=format&fit=crop', // Space/Nebula
    'https://images.unsplash.com/photo-1614726365723-498aa67c5f7b?q=80&w=600&auto=format&fit=crop', // Character art
    'https://images.unsplash.com/photo-1626544827763-d516dce335ca?q=80&w=600&auto=format&fit=crop', // Anime/Cyberpunk style
    'https://images.unsplash.com/photo-1516410541193-6dbf071727d7?q=80&w=600&auto=format&fit=crop', // Pink clouds
    'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&auto=format&fit=crop'  // Urban night
  ]
  
  // Deterministic selection based on title hash
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % covers.length;
  
  return covers[index]
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
