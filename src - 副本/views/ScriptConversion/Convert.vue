<template>
  <el-container class="h-full transition-colors duration-300" :class="containerClass">
    <!-- 1. 小说/剧本原文 -->
    <el-aside width="320px" class="border-r flex flex-col" :class="asideClass">
      <div class="p-4 border-b" :class="headerClass">
        <h2 class="text-lg font-bold mb-2" :class="textClass">1. 剧本/小说原文</h2>
        <div class="flex items-center justify-between mb-2">
          <el-select v-model="selectedChapter" placeholder="选择小说章节" size="small" class="w-40" @change="importChapter">
            <el-option 
              v-for="chap in loreStore.currentNovel.chapters" 
              :key="chap.id" 
              :label="chap.title" 
              :value="chap.id" 
            />
          </el-select>
          <el-button type="primary" link size="small" @click="importChapter">导入</el-button>
        </div>
      </div>
      <div class="flex-1 p-4 overflow-hidden flex flex-col">
        <el-input
          v-model="sourceText"
          type="textarea"
          class="flex-1 h-full"
          :input-style="{ height: '100%', resize: 'none' }"
          placeholder="在此粘贴小说片段或从上方导入..."
        />
      </div>
      <div class="p-4 border-t" :class="isLight ? 'bg-gray-50' : 'bg-slate-800'">
        <el-button type="primary" class="w-full" @click="convertToStandardScript">
          <el-icon class="mr-1"><MagicStick /></el-icon> AI 提取标准剧本
        </el-button>
      </div>
    </el-aside>

    <!-- 2. 标准剧本 -->
    <el-aside width="350px" class="border-r flex flex-col" :class="[asideClass, isLight ? 'bg-gray-50' : 'bg-slate-900']">
      <div class="p-4 border-b" :class="headerClass">
        <h2 class="text-lg font-bold" :class="textClass">2. 标准剧本</h2>
        <div class="text-xs mt-1" :class="subTextClass">含画面、环境、对白/旁白</div>
        <div class="mt-2 flex gap-2">
          <el-select v-model="aspectRatio" size="small" class="flex-1" placeholder="画幅">
             <el-option label="16:9 (横屏)" value="16:9" />
             <el-option label="9:16 (竖屏)" value="9:16" />
          </el-select>
          <el-select v-model="visualStyle" size="small" class="flex-1" placeholder="风格">
            <el-option label="二次元" value="anime" />
            <el-option label="写实电影" value="realistic" />
            <el-option label="皮克斯3D" value="pixar" />
          </el-select>
        </div>
      </div>
      
      <div class="flex-1 overflow-y-auto p-3 space-y-3">
        <div v-if="scripts.length === 0" class="text-center mt-10" :class="subTextClass">
          <el-icon :size="40"><Document /></el-icon>
          <p class="mt-2 text-sm">等待提取...</p>
        </div>
        
        <div v-for="(script, idx) in scripts" :key="idx" class="p-3 rounded border border-l-4 border-l-blue-500 relative transition-colors" :class="cardClass">
          <div class="absolute right-2 top-2 text-xs" :class="subTextClass">#{{ idx + 1 }}</div>
          <div class="mb-2">
            <el-tag size="small" effect="plain" class="mr-1">画面</el-tag>
            <span class="text-sm font-medium" :class="textClass">{{ script.visual }}</span>
          </div>
          <div class="mb-2">
             <el-tag size="small" type="success" effect="plain" class="mr-1">环境</el-tag>
             <span class="text-xs" :class="subTextClass">{{ script.environment }}</span>
          </div>
          <div>
             <el-tag size="small" type="warning" effect="plain" class="mr-1">对白</el-tag>
             <span class="text-xs italic" :class="isLight ? 'text-gray-800' : 'text-slate-300'">{{ script.dialogue }}</span>
          </div>
        </div>
      </div>

      <div class="p-4 border-t" :class="headerClass">
        <div class="flex items-center justify-between mb-2">
           <span class="text-xs" :class="subTextClass">每10秒生成一个分镜</span>
           <el-input-number v-model="totalDuration" size="small" :min="10" :step="10" style="width: 100px" />
        </div>
        <el-button type="success" class="w-full" @click="generateVisualStoryboards">
          生成可视化分镜 <el-icon class="ml-1"><ArrowRight /></el-icon>
        </el-button>
      </div>
    </el-aside>

    <!-- 3. 可视化分镜 -->
    <el-main class="flex flex-col p-0 transition-colors" :class="mainClass">
      <div class="p-4 border-b flex justify-between items-center" :class="headerClass">
        <h2 class="text-lg font-bold" :class="textClass">3. 可视化分镜 ({{ storyboards.length }} 镜)</h2>
        <el-button type="warning" @click="pushToVideoProduction">
          推送制作 <el-icon class="ml-1"><Upload /></el-icon>
        </el-button>
      </div>
      
      <div class="flex-1 overflow-y-auto p-4">
        <div v-if="storyboards.length === 0" class="text-center mt-20" :class="subTextClass">
          <el-icon :size="48"><VideoCamera /></el-icon>
          <p class="mt-2">等待生成分镜...</p>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div v-for="(shot, index) in storyboards" :key="shot.id" class="rounded-lg shadow flex flex-col overflow-hidden transition-colors" :class="cardClass">
            <!-- 头部信息 -->
            <div class="p-2 border-b flex justify-between items-center" :class="isLight ? 'bg-gray-50' : 'bg-slate-800/50'">
              <span class="font-bold" :class="isLight ? 'text-gray-700' : 'text-slate-300'">分镜 #{{ index + 1 }} ({{ shot.timeStart }}s - {{ shot.timeEnd }}s)</span>
              <el-button size="small" type="danger" link @click="removeShot(index)">删除</el-button>
            </div>

            <div class="flex flex-col md:flex-row min-h-[250px]">
              <!-- 模拟图片占位 -->
              <div class="w-full md:w-1/3 bg-gray-800 relative group flex-shrink-0 min-h-[200px]">
                <img v-if="shot.imageUrl" :src="shot.imageUrl" class="w-full h-full object-cover transition-opacity duration-500" />
                <div v-else class="w-full h-full flex flex-col items-center justify-center text-gray-500 absolute inset-0">
                  <el-icon class="animate-spin mb-2"><Refresh /></el-icon>
                  <span class="text-xs text-white opacity-70">AI 图片生成中...</span>
                </div>
                <div v-if="shot.imageUrl" class="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center">
                  <el-button circle size="small" @click="regenerateImage(index)"><el-icon><Refresh /></el-icon></el-button>
                </div>
              </div>
              
              <div class="flex-1 p-4 flex flex-col gap-3">
                <div class="flex justify-between items-center border-b pb-2" :class="isLight ? 'border-gray-100' : 'border-slate-700'">
                  <span class="font-bold" :class="isLight ? 'text-gray-800' : 'text-slate-200'">#{{ index + 1 }}</span>
                  <div class="flex items-center gap-2">
                    <span class="text-xs" :class="subTextClass">时长</span>
                    <el-input-number v-model="shot.duration" :min="1" :max="10" size="small" controls-position="right" style="width: 80px" />
                  </div>
                </div>
                
                <div>
                  <div class="text-xs font-bold mb-1" :class="subTextClass">首帧图描 (Prompt)</div>
                  <el-input 
                    v-model="shot.imagePrompt" 
                    type="textarea" 
                    :autosize="{ minRows: 2, maxRows: 4 }" 
                    size="small" 
                    class="text-xs" 
                  />
                </div>
                
                <div>
                  <div class="text-xs font-bold mb-1" :class="subTextClass">画面描述</div>
                  <div class="text-sm p-2 rounded" :class="isLight ? 'bg-gray-50 text-gray-800' : 'bg-slate-800 text-slate-300'">{{ shot.visualDesc }}</div>
                </div>
                
                <div>
                  <div class="text-xs font-bold mb-1" :class="subTextClass">配音/台词</div>
                  <div class="text-sm bg-blue-50 text-blue-800 p-2 rounded border border-blue-100 italic">"{{ shot.audioContent }}"</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref, inject, computed } from 'vue'
import { Upload, Delete, MagicStick, VideoCamera, Document, ArrowRight, Refresh, Picture } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useLoreStore } from '@/stores/useLoreStore'

const loreStore = useLoreStore()
const isLight = inject('isLight', ref(false))
const theme = inject('theme', ref('dark'))

const containerClass = computed(() => {
  if (theme.value === 'dreamy') return 'bg-transparent'
  return isLight.value ? 'bg-slate-50' : 'bg-slate-900'
})

const asideClass = computed(() => {
  if (theme.value === 'dreamy') return 'bg-white/60 border-white/50 backdrop-blur-md'
  return isLight.value ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'
})

const headerClass = computed(() => {
  if (theme.value === 'dreamy') return 'bg-white/40 border-b border-white/50'
  return isLight.value ? 'bg-white border-b border-slate-200' : 'bg-slate-800 border-b border-slate-700'
})

const mainClass = computed(() => {
  if (theme.value === 'dreamy') return 'bg-transparent'
  return isLight.value ? 'bg-gray-100' : 'bg-slate-900'
})

const cardClass = computed(() => {
  if (theme.value === 'dreamy') return 'bg-white/60 border-white/50 shadow-sm backdrop-blur-sm'
  return isLight.value ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-700 border-slate-600 shadow-sm'
})

const textClass = computed(() => {
  if (theme.value === 'dreamy') return 'text-slate-800'
  return isLight.value ? 'text-slate-800' : 'text-slate-200'
})

const subTextClass = computed(() => {
  if (theme.value === 'dreamy') return 'text-slate-500'
  return isLight.value ? 'text-gray-500' : 'text-slate-400'
})

const sourceText = ref('')
const selectedChapter = ref('')
const visualStyle = ref('realistic')
const aspectRatio = ref('16:9')
const totalDuration = ref(30) // 默认30秒

interface StandardScript {
  visual: string;      // 画面
  environment: string; // 环境信息
  dialogue: string;    // 对白/旁白
}

interface VisualStoryboard {
  id: number
  timeStart: number
  timeEnd: number
  duration: number // Add explicit duration field
  imageUrl?: string
  imagePrompt: string 
  visualDesc: string  
  audioContent: string 
}

const scripts = ref<StandardScript[]>([])
const storyboards = ref<VisualStoryboard[]>([])

// --- Actions ---

const importChapter = () => {
  if (!selectedChapter.value) return
  const chapter = loreStore.currentNovel.chapters.find(c => c.id === selectedChapter.value)
  if (chapter) {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = chapter.content
    sourceText.value = tempDiv.textContent || tempDiv.innerText || ''
    ElMessage.success(`已导入章节：${chapter.title}`)
  }
}

const convertToStandardScript = async () => {
  if (!sourceText.value) return ElMessage.warning('请先输入原文')
  
  ElMessage.info('AI 正在提取标准剧本...')
  scripts.value = []
  
  // 模拟 AI 提取标准剧本 (画面、环境、对白)
  const mockScripts = [
    { 
      visual: '艾伦推开布满青苔的石门，阳光透过缝隙洒入，尘埃飞舞。', 
      environment: '古城废墟，白天，光线斑驳，静谧压抑。', 
      dialogue: '（旁白）这里的寂静，比深海更令人窒息。' 
    },
    { 
      visual: '巨大的机械核心正在缓慢运转，发出幽蓝的光芒，艾伦仰头注视，表情震惊。', 
      environment: '大殿内部，科技与古老结合，昏暗，核心发光。', 
      dialogue: '艾伦：这...这是什么科技？' 
    },
    { 
      visual: '阴影中走出一位机械少女，左臂是银色的义肢，眼神冷漠。', 
      environment: '大殿深处，阴影，神秘。', 
      dialogue: '守门人：你不该来这里，人类。' 
    }
  ]

  for (const s of mockScripts) {
    await new Promise(r => setTimeout(r, 800))
    scripts.value.push(s)
  }
  ElMessage.success('标准剧本提取完成！')
}

const generateVisualStoryboards = async () => {
  if (scripts.value.length === 0) return ElMessage.warning('请先生成标准剧本')
  
  ElMessage.info('AI 正在生成可视化分镜...')
  storyboards.value = []
  
  const shotCount = Math.ceil(totalDuration.value / 10) // 每10秒一个分镜
  const durationPerShot = 10
  
  for (let i = 0; i < shotCount; i++) {
    await new Promise(r => setTimeout(r, 1000))
    
    // 循环使用剧本内容来模拟生成
    const scriptIdx = i % scripts.value.length
    const script = scripts.value[scriptIdx]
    
    // 模拟图片 (使用更稳定的颜色占位符服务，或者确保 Unsplash 有效)
    // 使用 Picsum 或 Placehold.co 作为 fallback
    const mockImages = [
       'https://picsum.photos/seed/1/400/225',
       'https://picsum.photos/seed/2/400/225',
       'https://picsum.photos/seed/3/400/225',
       'https://picsum.photos/seed/4/400/225'
    ]

    const newShot = {
      id: i + 1,
      timeStart: i * durationPerShot,
      timeEnd: (i + 1) * durationPerShot,
      duration: durationPerShot, // Set default duration
      imageUrl: '', 
      imagePrompt: `${visualStyle.value === 'anime' ? '二次元' : '写实'}风格, ${aspectRatio.value}, ${script.environment}, ${script.visual}, 电影级光照, 8k分辨率`,
      visualDesc: script.visual + " " + script.environment,
      audioContent: script.dialogue
    }
    
    storyboards.value.push(newShot)

    // 延迟 1.5s 后显示图片
    setTimeout(() => {
        newShot.imageUrl = mockImages[i % mockImages.length]
    }, 1500 + Math.random() * 1000)
  }
  ElMessage.success('可视化分镜生成完毕！')
}

const regenerateImage = (index: number) => {
  ElMessage.success(`正在重新生成分镜 #${index + 1} 的图片...`)
  storyboards.value[index].imageUrl = '' // 先清空，显示 loading
  // 模拟重绘
  setTimeout(() => {
     storyboards.value[index].imageUrl = `https://picsum.photos/seed/${Date.now()}/400/225`
  }, 1500)
}

const removeShot = (index: number) => {
  storyboards.value.splice(index, 1)
}

const pushToVideoProduction = () => {
  console.log('Pushing to Video Backend:', storyboards.value)
  ElMessage.success('成功推送至视频制作流水线！')
}
</script>
