<template>
  <div class="h-full flex flex-col transition-colors duration-300" :class="bgClass">
    <ProjectList 
      v-if="!isCreating"
      title="AI 剧本创作"
      description="从网文 IP 到视觉工业化生产，AI 辅助全流程短剧创作"
      type="script"
      @create="startCreation"
      @open="openProject"
    />

    <div v-else class="h-full flex flex-col">
      <!-- Top Progress Bar -->
      <header class="px-6 py-3 z-10 transition-colors duration-300" :class="headerClass">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <el-button circle size="small" :icon="ArrowLeft" class="mr-2" @click="isCreating = false" />
            <div class="bg-indigo-600 text-white p-1.5 rounded-lg">
              <el-icon><VideoCameraFilled /></el-icon>
            </div>
            <div>
              <h1 class="font-bold text-lg leading-tight" :class="isLight ? 'text-slate-800' : 'text-white'">AI 剧本创作</h1>
              <div class="text-xs" :class="isLight ? 'text-slate-500' : 'text-slate-400'">从网文 IP 到视觉工业化生产</div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <el-button size="small" plain @click="saveProject">保存项目</el-button>
            <el-button v-if="activeStep > 1" size="small" @click="prevStep">
              <el-icon class="mr-1"><ArrowLeft /></el-icon> 上一步
            </el-button>
            <el-button v-if="activeStep < 4" type="primary" size="small" color="#4f46e5" @click="nextStep">
              下一步 <el-icon class="ml-1"><ArrowRight /></el-icon>
            </el-button>
            <el-button v-else type="success" size="small" @click="finishProject">
              完成 <el-icon class="ml-1"><Check /></el-icon>
            </el-button>
          </div>
        </div>
        
        <el-steps :active="activeStep - 1" finish-status="success" align-center class="custom-steps">
          <el-step title="剧本立项与灵感池" description="确定来源与规格" />
          <el-step title="AI 故事板与节拍器" description="提取高光与分集" />
          <el-step title="台本与视觉转译" description="文学转镜头语言" />
          <el-step title="资产预演与推流" description="静帧校验与交付" />
        </el-steps>
      </header>

      <!-- Main Content Area -->
      <div class="flex-1 overflow-hidden relative">
        <keep-alive>
          <component :is="currentStepComponent" 
            v-model:projectData="projectData"
            @next="nextStep"
            @prev="prevStep"
          />
        </keep-alive>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { VideoCameraFilled, ArrowRight, ArrowLeft, Check } from '@element-plus/icons-vue'
import ProjectList from '@/components/Common/ProjectList.vue'
import Step1_ProjectInit from './components/Step1_ProjectInit.vue'
import Step2_StoryBoard from './components/Step2_StoryBoard.vue'
import Step3_VisualTranslation from './components/Step3_VisualTranslation.vue'
import Step4_AssetPublishing from './components/Step4_AssetPublishing.vue'
import { ElMessage } from 'element-plus'

const isLight = inject('isLight', ref(false))
const theme = inject('theme', ref('dark'))
const route = useRoute()

const bgClass = computed(() => {
  if (theme.value === 'dreamy') return 'bg-transparent'
  return isLight.value ? 'bg-slate-50' : 'bg-slate-900'
})

const headerClass = computed(() => {
  if (theme.value === 'dreamy') return 'bg-white/60 border-b border-white/50 shadow-sm backdrop-blur-md'
  return isLight.value ? 'bg-white border-b border-slate-200 shadow-sm' : 'bg-slate-800 border-b border-slate-700 shadow-sm'
})

const isCreating = ref(false)
const activeStep = ref(1)

const startCreation = () => {
  isCreating.value = true
  activeStep.value = 1
}

const openProject = (id: number) => {
  isCreating.value = true
  activeStep.value = 1
  ElMessage.success(`打开项目 #${id}`)
}

// Shared data object for the entire project flow
const projectData = ref({
  // Step 1 Data
  sourceType: 'novel', // 'novel' or 'original'
  novelSource: null as any,
  originalIdea: '',
  seriesScale: 'series', // 'single' or 'series'
  audienceTag: 'female_romance', // 'female_romance', 'male_warrior', 'suspense'
  
  // Step 2 Data
  highlights: [] as any[],
  beatSheet: [] as any[],
  episodes: [] as any[],
  
  // Step 3 Data
  script: [] as any[],
  shots: [] as any[],
  prompts: [] as any[],
  
  // Step 4 Data
  assets: [] as any[],
})

const hydrateFromRoute = () => {
  const chapterId = Array.isArray(route.query.chapterId) ? route.query.chapterId[0] : route.query.chapterId
  const chapterTitle = Array.isArray(route.query.chapterTitle) ? route.query.chapterTitle[0] : route.query.chapterTitle
  if (!chapterId && !chapterTitle) return
  isCreating.value = true
  activeStep.value = 2
  if (chapterTitle) {
    projectData.value.originalIdea = `章节：${chapterTitle}`
    projectData.value.episodes = [
      { title: chapterTitle, summary: '从编辑器导入', duration: '1-2分钟', wordCount: 0 }
    ]
  }
  const cached = sessionStorage.getItem('short_drama_chapter_draft')
  if (cached) {
    try {
      const parsed = JSON.parse(cached)
      if (parsed?.chapterTitle) {
        projectData.value.originalIdea = `章节：${parsed.chapterTitle}`
        projectData.value.episodes = [
          { title: parsed.chapterTitle, summary: '从编辑器导入', duration: '1-2分钟', wordCount: (parsed.content || '').length }
        ]
      }
    } catch (e) {
    } finally {
      sessionStorage.removeItem('short_drama_chapter_draft')
    }
  }
}

const currentStepComponent = computed(() => {
  switch (activeStep.value) {
    case 1: return Step1_ProjectInit
    case 2: return Step2_StoryBoard
    case 3: return Step3_VisualTranslation
    case 4: return Step4_AssetPublishing
    default: return Step1_ProjectInit
  }
})

const nextStep = () => {
  if (activeStep.value < 4) activeStep.value++
}

const prevStep = () => {
  if (activeStep.value > 1) activeStep.value--
}

const saveProject = () => {
  ElMessage.success('项目保存成功')
}

const finishProject = () => {
  ElMessage.success('项目已完成并推流')
}

onMounted(hydrateFromRoute)
watch(() => route.query, hydrateFromRoute, { deep: true })
</script>

<style scoped>
:deep(.el-step__title) {
  font-size: 14px;
}
</style>
