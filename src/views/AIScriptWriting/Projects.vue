<template>
  <div class="p-8 h-full overflow-y-auto transition-colors duration-300" :class="isLight ? 'bg-slate-50' : 'bg-slate-900'">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold" :class="isLight ? 'text-slate-800' : 'text-white'">我的作品</h1>
      <el-button type="primary" size="large" @click="createNewProject" :class="isLight ? 'bg-indigo-600' : 'bg-indigo-600 border-none'">
        <el-icon class="mr-2"><Plus /></el-icon> 新建项目
      </el-button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div
        v-for="project in projects"
        :key="project.id"
        class="group relative rounded-2xl overflow-hidden shadow-lg border transition-all duration-300 hover:-translate-y-1"
        :class="isLight ? 'bg-white border-slate-200 hover:shadow-xl' : 'bg-slate-800 border-slate-700 hover:shadow-indigo-500/10 hover:border-indigo-500/30'"
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
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Picture, Edit, MagicStick } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const isLight = inject('isLight', ref(false))

interface Project {
  id: string
  title: string
  wordCount: number
  updatedAt: string
  cover?: string
}

const projects = ref<Project[]>([
  { id: '1', title: '赛博侦探', wordCount: 12500, updatedAt: '2小时前', cover: 'https://images.unsplash.com/photo-1614726365723-49cfae973d4d?w=800' },
  { id: '2', title: '巨龙的最后一口气', wordCount: 45000, updatedAt: '1天前' },
  { id: '3', title: '量子之恋', wordCount: 8200, updatedAt: '3天前' },
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
  const mockImages = [
    'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800',
    'https://images.unsplash.com/photo-1635322966219-b75ed3a90e2d?w=800',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800'
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
