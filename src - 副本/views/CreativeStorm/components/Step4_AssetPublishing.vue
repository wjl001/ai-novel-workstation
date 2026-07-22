<template>
  <div class="h-full flex gap-6 p-6">
    <!-- Left: Shot List for Validation -->
    <div class="w-80 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
      <div class="p-4 border-b border-slate-100 flex items-center gap-2">
        <div class="bg-teal-100 text-teal-600 p-1.5 rounded-lg">
          <el-icon><List /></el-icon>
        </div>
        <h3 class="font-bold text-slate-800">分镜列表</h3>
      </div>
      
      <div class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        <div v-if="!localData.shots || localData.shots.length === 0" class="text-center text-slate-400 mt-10 text-xs">
          暂无分镜数据，请先完成步骤 3
        </div>
        <div 
          v-for="shot in localData.shots" 
          :key="shot.shotId"
          class="p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md"
          :class="activeShotId === shot.shotId ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500' : 'border-slate-200 bg-white'"
          @click="selectShot(shot)"
        >
          <div class="flex justify-between items-center mb-2">
            <span class="font-bold text-slate-800">{{ shot.shotId }}</span>
            <el-tag size="small" type="info">{{ shot.duration }}秒</el-tag>
          </div>
          <div class="text-xs text-slate-500 line-clamp-2 mb-2">{{ shot.prompt }}</div>
          <div class="flex gap-1 flex-wrap">
            <span v-if="shot.previewUrl" class="text-[10px] text-teal-600 bg-teal-100 px-1.5 rounded flex items-center">
              <el-icon class="mr-1"><Picture /></el-icon> 已生成
            </span>
            <span v-if="shot.audioTags" class="text-[10px] text-rose-600 bg-rose-100 px-1.5 rounded flex items-center">
              <el-icon class="mr-1"><Headset /></el-icon> 已配乐
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Pre-viz & Publishing -->
    <div class="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
      <div class="p-4 border-b border-slate-100 flex justify-between items-center">
        <div class="flex items-center gap-2">
          <div class="bg-orange-100 text-orange-600 p-1.5 rounded-lg">
            <el-icon><VideoPlay /></el-icon>
          </div>
          <h3 class="font-bold text-slate-800">资产预演与推流舱</h3>
        </div>
        <el-button type="success" @click="openPushDialog" :disabled="!isReadyToPush">
          <el-icon class="mr-1"><Upload /></el-icon> 推送至 AI 指定作品页面
        </el-button>
      </div>

      <div v-if="activeShot" class="flex-1 p-6 flex flex-col overflow-y-auto">
        
        <!-- Node A: Static Frame Pre-viz -->
        <div class="mb-8">
          <div class="flex justify-between items-center mb-4">
            <h4 class="font-bold text-slate-700 flex items-center gap-2">
              <el-icon class="text-indigo-500"><Picture /></el-icon> 节点 A: 静帧概念图预演
            </h4>
            <el-button type="primary" size="small" plain @click="generatePreview">
              <el-icon class="mr-1"><MagicStick /></el-icon> 生成/刷新画面
            </el-button>
          </div>
          <div class="text-sm text-slate-600 mb-2">
            <span class="font-bold">时长:</span> {{ activeShot.duration }}秒
          </div>
          
          <div class="aspect-video bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center relative group border border-slate-200 shadow-inner">
            <img v-if="activeShot.previewUrl" :src="activeShot.previewUrl" class="w-full h-full object-cover" />
            <div v-else class="text-slate-500 flex flex-col items-center">
              <el-icon :size="48"><Picture /></el-icon>
              <span class="mt-2 text-sm">点击右上角生成预演画面</span>
            </div>
            
            <div v-if="isGenerating" class="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-10">
              <div class="flex flex-col items-center text-white">
                <div class="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-2"></div>
                <span class="text-xs font-bold">SDXL 渲染中...</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Node B: Smart Audio Tagging -->
        <div class="mb-8">
          <div class="flex justify-between items-center mb-4">
            <h4 class="font-bold text-slate-700 flex items-center gap-2">
              <el-icon class="text-rose-500"><Headset /></el-icon> 节点 B: 智能配乐打点
            </h4>
            <el-button type="warning" size="small" plain @click="autoTagAudio">
              <el-icon class="mr-1"><Cpu /></el-icon> AI 情绪分析
            </el-button>
          </div>
          
          <div class="bg-slate-50 p-4 rounded-lg border border-slate-200">
             <div v-if="!activeShot.audioTags || activeShot.audioTags.length === 0" class="text-slate-400 text-xs text-center">
               暂无音频标签
             </div>
             <div v-else class="flex flex-wrap gap-2">
               <el-tag 
                 v-for="tag in activeShot.audioTags" 
                 :key="tag" 
                 effect="dark" 
                 :color="getAudioTagColor(tag)" 
                 class="border-none"
               >
                 {{ tag }}
               </el-tag>
             </div>
          </div>
        </div>

        <!-- Node C: JSON Preview -->
        <div class="flex-1 min-h-[300px] flex flex-col">
          <h4 class="font-bold text-slate-700 mb-2 flex items-center gap-2">
            <el-icon class="text-green-500"><Coin /></el-icon> 节点 C: 数据封包预览
          </h4>
          <div class="flex-1 bg-slate-900 rounded-lg p-4 overflow-auto custom-scrollbar font-mono text-xs text-green-400 shadow-inner whitespace-pre-wrap">
            {{ getJsonPreview() }}
          </div>
        </div>

      </div>
      <div v-else class="flex-1 flex items-center justify-center text-slate-400 text-sm">
        请在左侧选择分镜以进行预演
      </div>
    </div>

    <!-- Push Dialog -->
    <el-dialog
      v-model="pushDialogVisible"
      title="推送到 AI 视频平台"
      width="500px"
      append-to-body
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-2">选择目标作品</label>
          <el-select v-model="selectedProject" placeholder="请选择作品" class="w-full">
            <el-option label="《剑尊归来》" value="1" />
            <el-option label="《重生之我是龙王》" value="2" />
            <el-option label="《霸道总裁爱上我》" value="3" />
          </el-select>
        </div>
        
        <div v-if="selectedProject" class="p-3 bg-indigo-50 rounded border border-indigo-100 text-sm text-indigo-700">
          <div class="flex items-center gap-2 mb-1 font-bold">
            <el-icon><InfoFilled /></el-icon> 确认信息
          </div>
          <div>将推送 {{ localData.shots.length }} 个镜头数据到该作品的 [草稿箱]</div>
        </div>
      </div>
      
      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="pushDialogVisible = false">取消</el-button>
          <el-button type="primary" :disabled="!selectedProject" @click="pushToPlatform" :loading="isPushing">
            确认推送
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { 
  List, Picture, Headset, VideoPlay, Upload, MagicStick, Cpu, Coin, InfoFilled
} from '@element-plus/icons-vue'
import { ElMessage, ElNotification } from 'element-plus'

const props = defineProps<{
  projectData: any
}>()

const emit = defineEmits(['update:projectData'])
const localData = ref(props.projectData)
const activeShotId = ref('')
const isGenerating = ref(false)
const pushDialogVisible = ref(false)
const selectedProject = ref('')
const isPushing = ref(false)

const activeShot = computed(() => {
  if (!activeShotId.value) return null
  return localData.value.shots?.find((s: any) => s.shotId === activeShotId.value)
})

const isReadyToPush = computed(() => {
  return localData.value.shots && localData.value.shots.length > 0
})

const selectShot = (shot: any) => {
  activeShotId.value = shot.shotId
}

const generatePreview = () => {
  isGenerating.value = true
  setTimeout(() => {
    if (activeShot.value) {
      // Mock different images based on shot ID
      const images: Record<string, string> = {
        'S01': 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800', // Mountains/Night
        'S02': 'https://images.unsplash.com/photo-1535673774502-327ae89dd0f7?w=800', // Action/Sword
        'S03': 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800', // Portrait
      }
      activeShot.value.previewUrl = images[activeShot.value.shotId] || 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=800'
      emit('update:projectData', localData.value)
    }
    isGenerating.value = false
    ElMessage.success('静帧生成完成')
  }, 1500)
}

const autoTagAudio = () => {
  if (!activeShot.value) return
  
  // Mock analysis based on tags/content
  const tags = []
  const prompt = activeShot.value.prompt.toLowerCase()
  
  if (prompt.includes('动作') || prompt.includes('action')) {
    tags.push('情绪: 史诗', '配乐: 战斗交响', '音效: 剑鸣')
  } else if (prompt.includes('神秘') || prompt.includes('magic')) {
    tags.push('情绪: 神秘', '配乐: 空灵人声', '音效: 风啸')
  } else if (prompt.includes('担忧') || prompt.includes('sad')) {
    tags.push('情绪: 悲伤钢琴', '配乐: 抒情弦乐')
  } else {
    tags.push('情绪: 中性', '配乐: 环境音')
  }
  
  activeShot.value.audioTags = tags
  emit('update:projectData', localData.value)
  ElMessage.success('音频情绪标签已注入')
}

const getAudioTagColor = (tag: string) => {
  if (tag.includes('史诗')) return '#b91c1c'
  if (tag.includes('悲伤')) return '#4338ca'
  if (tag.includes('神秘')) return '#7e22ce'
  return '#475569'
}

const getJsonPreview = () => {
  if (!activeShot.value) return '{}'
  
  const packet = {
    meta: {
      project: "Sword Venerable Returns",
      episode: 1,
      resolution: "1080x1920 (9:16)"
    },
    shot: {
      id: activeShot.value.shotId,
      duration: activeShot.value.duration,
      camera: activeShot.value.camera,
      visual_prompt: activeShot.value.prompt,
      audio_profile: activeShot.value.audioTags || [],
      control_net: {
        pose: "openpose_v1",
        depth: "depth_midas"
      }
    }
  }
  return JSON.stringify(packet, null, 2)
}

const openPushDialog = () => {
  selectedProject.value = ''
  pushDialogVisible.value = true
}

const pushToPlatform = () => {
  isPushing.value = true
  setTimeout(() => {
    isPushing.value = false
    pushDialogVisible.value = false
    
    // Get project name
    const map: Record<string, string> = {
      '1': '《剑尊归来》',
      '2': '《重生之我是龙王》',
      '3': '《霸道总裁爱上我》'
    }
    const projectName = map[selectedProject.value] || '未知作品'

    ElNotification({
      title: '推流成功',
      message: `已将 ${localData.value.shots.length} 个镜头封包推送至 ${projectName}`,
      type: 'success',
      duration: 5000
    })
  }, 1500)
}

// Select first shot on mount if available
onMounted(() => {
  if (localData.value.shots && localData.value.shots.length > 0) {
    activeShotId.value = localData.value.shots[0].shotId
  }
})

watch(localData, (newVal) => {
  emit('update:projectData', newVal)
}, { deep: true })
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
</style>
