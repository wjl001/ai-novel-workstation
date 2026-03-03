<template>
  <div class="h-full flex flex-col bg-slate-50">
    <!-- Top Progress Bar -->
    <header class="bg-white border-b border-slate-200 px-6 py-3 shadow-sm z-10">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <div class="bg-indigo-600 text-white p-1.5 rounded-lg">
            <el-icon><VideoCameraFilled /></el-icon>
          </div>
          <div>
            <h1 class="font-bold text-lg leading-tight text-slate-800">AI 剧本创作</h1>
            <div class="text-xs text-slate-500">从网文 IP 到视觉工业化生产</div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <el-button size="small" plain>保存项目</el-button>
          <el-button type="primary" size="small" color="#4f46e5" @click="nextStep">
            下一步 <el-icon class="ml-1"><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
      
      <el-steps :active="activeStep" finish-status="success" align-center class="custom-steps">
        <el-step title="立项导入" description="IP来源与规格" />
        <el-step title="切分与节拍" description="Beat Sheet" />
        <el-step title="视觉转译" description="镜头与Prompt" />
        <el-step title="预演推流" description="资产校验" />
      </el-steps>
    </header>

    <!-- Main Workspace (3-Column Layout) -->
    <div class="flex-1 flex overflow-hidden">
      
      <!-- Left Column: Source Material -->
      <aside class="w-80 bg-white border-r border-slate-200 flex flex-col">
        <div class="p-3 border-b border-slate-100 font-bold text-slate-700 flex justify-between items-center">
          <span>源素材库</span>
          <el-tag size="small" type="info">小说 IP</el-tag>
        </div>
        
        <div class="flex-1 overflow-y-auto p-4 space-y-6">
          <!-- Novel Source -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm text-slate-500">
              <span>《剑尊归来》- 第3章</span>
              <el-button link type="primary" size="small">切换</el-button>
            </div>
            <div class="bg-slate-50 p-3 rounded-lg text-sm leading-relaxed text-slate-600 border border-slate-100 max-h-60 overflow-y-auto custom-scrollbar">
              <p class="mb-2">月夜下的灵幻山谷，寒气砭骨。楚寒玄色劲装上银线云纹流转，手中寒渊剑出鞘三寸，玄铁链与剑鞘摩擦出刺耳声响。</p>
              <p class="mb-2">他正与一头三眼巨狼对峙，剑气如霜瞬间冻结整片岩壁，巨狼利爪在冰面上划出火星。</p>
              <p class="mb-2">“挡我者死！”楚寒冷喝一声，剑光暴涨。</p>
              <p>青鸾清唳划破夜空，云璃月白广袖掠过树梢，淡青色药雾凝成实体撞偏寒渊剑轨迹。</p>
            </div>
          </div>

          <!-- Character Cards -->
          <div>
            <div class="text-sm font-bold text-slate-700 mb-3">角色视觉图谱</div>
            <div class="space-y-3">
              <div v-for="char in characters" :key="char.name" class="flex gap-3 bg-white p-2 rounded-lg border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors cursor-pointer group">
                <img :src="char.avatar" class="w-12 h-12 rounded object-cover" />
                <div class="flex-1 min-w-0">
                  <div class="font-bold text-sm text-slate-800 flex justify-between">
                    {{ char.name }}
                    <el-icon class="opacity-0 group-hover:opacity-100 text-indigo-500"><CopyDocument /></el-icon>
                  </div>
                  <div class="text-xs text-slate-500 truncate mt-1">{{ char.desc }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Center Column: Script Editor -->
      <main class="flex-1 bg-slate-100 flex flex-col relative">
        <div class="p-3 border-b border-slate-200 bg-white flex justify-between items-center shadow-sm z-10">
          <div class="flex gap-2">
            <el-radio-group v-model="scriptMode" size="small">
              <el-radio-button label="block">块状模式</el-radio-button>
              <el-radio-button label="text">文本模式</el-radio-button>
            </el-radio-group>
          </div>
          <div class="flex gap-2">
            <el-button type="warning" plain size="small" @click="autoGenerateScript">
              <el-icon class="mr-1"><MagicStick /></el-icon> AI 自动转译
            </el-button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div class="max-w-3xl mx-auto space-y-4 min-h-[500px]">
            
            <div v-if="scriptBlocks.length === 0" class="flex flex-col items-center justify-center h-full text-slate-400 mt-20">
              <el-icon :size="64" class="mb-4"><DocumentAdd /></el-icon>
              <p>暂无剧本内容</p>
              <p class="text-xs mt-2">点击上方“AI 自动转译”从左侧小说提取</p>
            </div>

            <div 
              v-for="(block, idx) in scriptBlocks" 
              :key="idx" 
              class="script-block bg-white rounded-lg shadow-sm border-l-4 p-4 transition-all hover:shadow-md relative group"
              :class="getBlockColor(block.type)"
              @mouseenter="activeBlockIndex = idx"
            >
              <!-- Type Label -->
              <div class="absolute right-2 top-2">
                <el-tag size="small" :type="getBlockTagType(block.type)" effect="light" class="uppercase text-[10px] tracking-wider">{{ block.type }}</el-tag>
              </div>

              <!-- Content -->
              <div class="pr-12">
                <div v-if="block.type === 'scene'" class="font-bold text-slate-800 border-b border-slate-100 pb-1 mb-2">
                  {{ block.content }}
                </div>
                <div v-else-if="block.type === 'character'" class="font-bold text-slate-700 mb-1 flex items-center gap-2">
                  {{ block.content }}
                  <span v-if="block.emotion" class="text-xs font-normal text-slate-400 bg-slate-100 px-1.5 rounded">({{ block.emotion }})</span>
                </div>
                <div v-else class="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {{ block.content }}
                </div>
              </div>

              <!-- Inline Actions -->
              <div class="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                <el-button size="small" circle text><el-icon><Edit /></el-icon></el-button>
                <el-button size="small" circle text><el-icon><Delete /></el-icon></el-button>
                <el-button size="small" circle text><el-icon><Plus /></el-icon></el-button>
              </div>
            </div>

          </div>
        </div>
      </main>

      <!-- Right Column: Multimodal & Pre-viz -->
      <aside class="w-96 bg-white border-l border-slate-200 flex flex-col">
        <div class="p-3 border-b border-slate-100 font-bold text-slate-700 flex items-center gap-2">
          <el-icon class="text-indigo-500"><View /></el-icon>
          多模态视窗
        </div>

        <div v-if="activeBlockIndex !== -1 && scriptBlocks[activeBlockIndex]" class="flex-1 overflow-y-auto p-4 space-y-6">
          <!-- Context Info -->
          <div class="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
            <div class="text-xs text-indigo-500 font-bold mb-1 uppercase tracking-wider">Current Selection</div>
            <div class="text-sm font-medium text-indigo-900 line-clamp-2">
              {{ scriptBlocks[activeBlockIndex].content }}
            </div>
          </div>

          <!-- Visual Prompt -->
          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-bold text-slate-700">视觉 Prompt (SDXL)</span>
              <el-button type="primary" link size="small" @click="optimizePrompt">
                <el-icon class="mr-1"><MagicStick /></el-icon> 优化
              </el-button>
            </div>
            <el-input 
              v-model="currentPrompt"
              type="textarea" 
              :rows="4" 
              class="text-xs"
              placeholder="Waiting for selection..."
            />
            <div class="mt-2 flex flex-wrap gap-1">
              <el-tag size="small" effect="plain" type="info">8k</el-tag>
              <el-tag size="small" effect="plain" type="info">cinematic</el-tag>
              <el-tag size="small" effect="plain" type="info">highly detailed</el-tag>
            </div>
          </div>

          <!-- Pre-viz Image -->
          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-bold text-slate-700">静帧预演</span>
              <el-button type="success" size="small" plain @click="generatePreviewImage">
                <el-icon class="mr-1"><Picture /></el-icon> 生成草图
              </el-button>
            </div>
            <div class="aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center relative group">
              <img v-if="previewImage" :src="previewImage" class="w-full h-full object-cover" />
              <div v-else class="text-slate-400 flex flex-col items-center">
                <el-icon :size="32"><Picture /></el-icon>
                <span class="text-xs mt-1">暂无预览</span>
              </div>
              <div v-if="isGeneratingImage" class="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-sm">
                <div class="flex flex-col items-center">
                  <div class="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <span class="text-xs text-indigo-600 font-bold">渲染中...</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Camera & Audio -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-xs font-bold text-slate-500 mb-1">运镜</div>
              <el-select v-model="cameraMove" size="small">
                <el-option label="推 (Dolly In)" value="push" />
                <el-option label="拉 (Pull Back)" value="pull" />
                <el-option label="摇 (Pan)" value="pan" />
                <el-option label="跟 (Tracking)" value="track" />
              </el-select>
            </div>
            <div>
              <div class="text-xs font-bold text-slate-500 mb-1">预估时长</div>
              <el-input-number v-model="duration" size="small" :min="1" :max="10" controls-position="right" class="w-full" />
            </div>
          </div>

          <div class="pt-4 border-t border-slate-100">
            <el-button type="primary" class="w-full" color="#059669" @click="pushToVideoPlatform">
              <el-icon class="mr-2"><Upload /></el-icon> 推送至 AI 视频平台
            </el-button>
          </div>

        </div>
        
        <div v-else class="flex-1 flex items-center justify-center text-slate-400 text-sm p-8 text-center">
          请在中间剧本区域选择一行以查看视觉参数
        </div>
      </aside>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { 
  VideoCameraFilled, ArrowRight, DocumentAdd, Edit, Delete, Plus, 
  View, MagicStick, Picture, Upload, CopyDocument
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// --- State ---
const activeStep = ref(2) // Default to step 3 for demo
const scriptMode = ref('block')
const activeBlockIndex = ref(-1)
const isGeneratingImage = ref(false)
const previewImage = ref('')
const currentPrompt = ref('')
const cameraMove = ref('push')
const duration = ref(3)

// --- Mock Data ---
const characters = [
  { name: '楚寒', desc: '玄色劲装，银线云纹，手持寒渊剑，冷峻剑客', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chuhan' },
  { name: '云璃', desc: '月白广袖流仙裙，淡青色药雾缭绕，温婉医仙', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yunli' },
]

interface ScriptBlock {
  type: 'scene' | 'action' | 'character' | 'dialogue' | 'os'
  content: string
  emotion?: string
}

const scriptBlocks = ref<ScriptBlock[]>([
  { type: 'scene', content: 'EXT. 灵幻山谷 - 夜晚 (Night)' },
  { type: 'action', content: '寒气逼人，岩壁上结着薄霜。楚寒手持寒渊剑，与一只三眼巨狼对峙。' },
  { type: 'character', content: '楚寒', emotion: '冷厉' },
  { type: 'dialogue', content: '挡我者死！' },
  { type: 'action', content: '剑光暴涨，瞬间冻结了巨狼的利爪。' },
  { type: 'character', content: '云璃', emotion: '焦急' },
  { type: 'os', content: '（内心）不能让他伤了灵兽！' },
  { type: 'action', content: '一道青色药雾横空出现，撞偏了剑锋。' }
])

// --- Methods ---

const nextStep = () => {
  if (activeStep.value < 4) activeStep.value++
}

const getBlockColor = (type: string) => {
  const map: Record<string, string> = {
    scene: 'border-l-slate-800 bg-slate-50',
    action: 'border-l-orange-400',
    character: 'border-l-blue-500 mt-4',
    dialogue: 'border-l-blue-200 ml-4 border-l-2',
    os: 'border-l-purple-400 ml-4 border-l-2 italic'
  }
  return map[type] || 'border-l-gray-200'
}

const getBlockTagType = (type: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' | undefined => {
  const map: Record<string, string> = {
    scene: 'info',
    action: 'warning',
    character: 'primary',
    dialogue: 'info',
    os: 'success'
  }
  const val = map[type] || 'info'
  return val as 'primary' | 'success' | 'warning' | 'info' | 'danger'
}

const autoGenerateScript = () => {
  ElMessage.success('AI 正在分析原文并提取剧本...')
  // Mock generation delay
  setTimeout(() => {
    ElMessage.success('转译完成')
  }, 1000)
}

const optimizePrompt = () => {
  if (!currentPrompt.value) return
  currentPrompt.value = `(Best Quality), (Masterpiece), 8k, cinematic lighting, ${currentPrompt.value}, detailed background, dramatic atmosphere`
}

const generatePreviewImage = () => {
  isGeneratingImage.value = true
  // Mock image gen
  setTimeout(() => {
    previewImage.value = 'https://images.unsplash.com/photo-1514539079130-25950c84af65?w=800'
    isGeneratingImage.value = false
  }, 2000)
}

const pushToVideoPlatform = () => {
  ElMessage.success({
    message: '成功推送至 AI 视频平台 (2.0)',
    type: 'success',
    duration: 3000
  })
}

// Watch selection to update right panel
watch(activeBlockIndex, (newVal) => {
  if (newVal !== -1) {
    const block = scriptBlocks.value[newVal]
    // Mock prompt generation based on content
    if (block.type === 'scene') {
      currentPrompt.value = `Landscape view of a mystical valley at night, cold atmosphere, frost on rocks, moonlight`
    } else if (block.type === 'action') {
      currentPrompt.value = `Action shot, ${block.content}, dynamic angle, motion blur, particle effects`
    } else if (block.type === 'character') {
      const charInfo = characters.find(c => block.content.includes(c.name))
      currentPrompt.value = charInfo ? `Portrait of ${charInfo.desc}, ${block.emotion} expression, detailed face` : `Character portrait`
    } else {
      currentPrompt.value = `Close up shot, character speaking, cinematic depth of field`
    }
    previewImage.value = '' // Reset preview
  }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

:deep(.el-step__title) {
  font-size: 14px;
}
</style>
