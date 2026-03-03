<template>
  <div class="h-full flex">
    <!-- Left: Script Editor (Node A) -->
    <div class="flex-1 bg-white border-r border-slate-200 flex flex-col">
      <div class="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div class="flex items-center gap-2">
          <div class="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg">
            <el-icon><Document /></el-icon>
          </div>
          <h3 class="font-bold text-slate-800">节点 A: 文学转译台本</h3>
        </div>
        <el-button type="primary" size="small" plain @click="autoTranslate">
          <el-icon class="mr-1"><MagicStick /></el-icon> AI 自动转译
        </el-button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-100 pb-20">
        <div v-if="localData.script.length === 0" class="flex flex-col items-center justify-center h-full text-slate-400">
          <el-icon :size="48" class="mb-4"><DocumentCopy /></el-icon>
          <p>点击上方“AI 自动转译”生成台本</p>
        </div>
        
        <div 
          v-for="(block, idx) in localData.script" 
          :key="idx"
          class="bg-white rounded-lg shadow-sm border-l-4 p-4 cursor-pointer transition-all hover:shadow-md"
          :class="[
            getBlockColor(block.type),
            activeShotId === block.id ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
          ]"
          @click="selectShot(block)"
        >
          <div class="flex justify-between items-start mb-2">
            <el-tag size="small" :type="getBlockTagType(block.type)" effect="light" class="tracking-wider">{{ getBlockTypeLabel(block.type) }}</el-tag>
            <span v-if="block.shotId" class="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              {{ block.shotId }}
            </span>
          </div>
          
          <div v-if="block.type === 'scene'" class="font-bold text-slate-900 border-b border-slate-100 pb-2 mb-2">
            {{ block.content }}
          </div>
          <div v-else-if="block.type === 'character'" class="font-bold text-slate-800 mb-1 flex items-center gap-2">
            {{ block.content }}
            <span v-if="block.emotion" class="text-xs font-normal text-slate-500 bg-slate-100 px-1.5 rounded">({{ block.emotion }})</span>
          </div>
          <div v-else class="text-slate-700 leading-relaxed whitespace-pre-wrap">
            <span v-if="block.type === 'os'" class="text-slate-400 italic mr-1">(内心独白)</span>
            {{ block.content }}
          </div>

          <!-- Source Text Mapping (Educational) -->
          <div v-if="block.sourceText" class="mt-3 pt-2 border-t border-dashed border-slate-100 text-[10px] text-slate-400 flex gap-2 justify-between items-center">
            <div class="flex gap-2">
              <el-icon class="mt-0.5"><Link /></el-icon>
              <span class="line-clamp-1">源文: {{ block.sourceText }}</span>
            </div>
            <el-button type="primary" link size="small" class="!p-0 !h-auto text-[10px]" @click.stop="openFiveSenses(block)">
              <el-icon class="mr-1"><View /></el-icon> 五感填充
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Five Senses Modal -->
    <el-dialog
      v-model="fiveSensesVisible"
      title="五感填充引擎"
      width="600px"
      append-to-body
      class="five-senses-dialog"
    >
      <div class="bg-slate-900 text-white p-4 rounded-lg mb-4 text-sm leading-relaxed border border-slate-700">
        <div class="text-xs text-slate-400 mb-2">原文</div>
        {{ activeBlockForSenses?.sourceText || activeBlockForSenses?.content }}
      </div>
      
      <el-tabs v-model="activeSense" type="border-card" class="custom-tabs">
        <el-tab-pane label="视觉" name="visual">
          <template #label>
            <span class="flex items-center gap-1"><el-icon><View /></el-icon> 视觉</span>
          </template>
          <div class="p-4 bg-slate-50 min-h-[120px] text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
            {{ sensesData.visual }}
          </div>
        </el-tab-pane>
        <el-tab-pane label="听觉" name="auditory">
          <template #label>
            <span class="flex items-center gap-1"><el-icon><Headset /></el-icon> 听觉</span>
          </template>
           <div class="p-4 bg-slate-50 min-h-[120px] text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
            {{ sensesData.auditory }}
          </div>
        </el-tab-pane>
        <el-tab-pane label="嗅觉" name="olfactory">
          <template #label>
            <span class="flex items-center gap-1"><el-icon><WindPower /></el-icon> 嗅觉</span>
          </template>
           <div class="p-4 bg-slate-50 min-h-[120px] text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
            {{ sensesData.olfactory }}
          </div>
        </el-tab-pane>
        <el-tab-pane label="味觉" name="gustatory">
           <template #label>
            <span class="flex items-center gap-1"><el-icon><Cherry /></el-icon> 味觉</span>
          </template>
           <div class="p-4 bg-slate-50 min-h-[120px] text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
            {{ sensesData.gustatory }}
          </div>
        </el-tab-pane>
        <el-tab-pane label="触觉" name="tactile">
           <template #label>
            <span class="flex items-center gap-1"><el-icon><Pointer /></el-icon> 触觉</span>
          </template>
           <div class="p-4 bg-slate-50 min-h-[120px] text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
            {{ sensesData.tactile }}
          </div>
        </el-tab-pane>
      </el-tabs>
      
      <template #footer>
        <div class="flex justify-between items-center w-full">
           <el-button type="warning" plain size="small" @click="generateSenses" :loading="isGeneratingSenses">
            <el-icon class="mr-1"><MagicStick /></el-icon> AI 智能生成
          </el-button>
          <div>
            <el-button @click="fiveSensesVisible = false">取消</el-button>
            <el-button type="primary" @click="applySense">插入正文</el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- Right: Visual & Shot Details (Node B & C) -->
    <div class="w-[450px] bg-white flex flex-col">
      <div class="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div class="flex items-center gap-2">
          <div class="bg-purple-100 text-purple-600 p-1.5 rounded-lg">
            <el-icon><VideoCamera /></el-icon>
          </div>
          <h3 class="font-bold text-slate-800">节点 B & C: 镜头与视觉</h3>
        </div>
      </div>

      <div v-if="activeShot" class="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar pb-20">
        <!-- Shot Info -->
        <div class="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div class="flex justify-between items-center mb-3">
            <span class="text-lg font-bold text-indigo-700">{{ activeShot.shotId }}</span>
            <div class="flex gap-2">
              <el-tag size="small" effect="dark" type="info">{{ activeShot.camera.shotType }}</el-tag>
              <el-tag size="small" effect="dark" type="warning">{{ activeShot.camera.movement }}</el-tag>
            </div>
          </div>
          <div class="text-sm text-slate-600 mb-2">
            <span class="font-bold">时长:</span> {{ activeShot.duration }}s
          </div>
          <p class="text-xs text-slate-500 bg-white p-2 rounded border border-slate-100 italic">
            "AI 根据台词长度和动作幅度自动划分镜号"
          </p>
        </div>

        <!-- Visual Prompt Fusion -->
        <div>
          <div class="flex items-center gap-2 mb-3">
            <el-icon class="text-purple-600"><Cpu /></el-icon>
            <span class="font-bold text-slate-800">节点 C: 视觉 Prompt 融合</span>
          </div>
          
          <!-- Character Injection -->
          <div v-if="activeShot.characters.length > 0" class="space-y-2 mb-4">
            <div v-for="char in activeShot.characters" :key="char.name" class="flex items-center gap-2 bg-purple-50 p-2 rounded border border-purple-100">
              <el-avatar :size="24" :src="char.avatar" />
              <div class="flex-1 min-w-0">
                <div class="flex justify-between">
                  <span class="text-xs font-bold text-purple-900">{{ char.name }}</span>
                  <span class="text-[10px] text-purple-400">自动注入</span>
                </div>
                <div class="text-[10px] text-purple-600 truncate">{{ char.visualTags }}</div>
              </div>
            </div>
          </div>

          <!-- Final Prompt -->
          <div class="relative group">
            <el-input
              v-model="activeShot.prompt"
              type="textarea"
              :rows="6"
              class="text-xs font-mono"
            />
            <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <el-button type="primary" size="small" circle><el-icon><Edit /></el-icon></el-button>
            </div>
          </div>
          
          <div class="mt-2 flex flex-wrap gap-1">
            <el-tag v-for="tag in activeShot.tags" :key="tag" size="small" type="info" effect="plain">{{ tag }}</el-tag>
          </div>
        </div>

      </div>
      <div v-else class="flex-1 flex items-center justify-center text-slate-400 text-sm p-8 text-center">
        请在左侧选择一个包含镜号的脚本块以查看视觉详情
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { 
  Document, MagicStick, VideoCamera, Cpu, Edit, Link, DocumentCopy,
  View, Headset, WindPower, Cherry, Pointer
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  projectData: any
}>()

const emit = defineEmits(['update:projectData'])
const localData = ref(props.projectData)
const activeShotId = ref('')
const fiveSensesVisible = ref(false)
const activeBlockForSenses = ref<any>(null)
const activeSense = ref('visual')
const isGeneratingSenses = ref(false)

const sensesData = ref({
  visual: '',
  auditory: '',
  olfactory: '',
  gustatory: '',
  tactile: ''
})

const activeShot = computed(() => {
  if (!activeShotId.value) return null
  return localData.value.shots.find((s: any) => s.shotId === activeShotId.value)
})

const selectShot = (block: any) => {
  if (block.shotId) {
    activeShotId.value = block.shotId
  }
}

const getBlockColor = (type: string) => {
  const map: Record<string, string> = {
    scene: 'border-l-slate-800 bg-slate-50',
    action: 'border-l-orange-400',
    character: 'border-l-blue-500 mt-4',
    dialogue: 'border-l-blue-200 ml-4 border-l-2',
    os: 'border-l-purple-400 ml-4 border-l-2'
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

const getBlockTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    scene: '场景',
    action: '动作',
    character: '角色',
    dialogue: '对白',
    os: '内心'
  }
  return map[type] || type
}

const autoTranslate = () => {
  ElMessage.success('正在进行文学转译与镜头切分...')
  setTimeout(() => {
    // Generate Script Blocks
    localData.value.script = [
      { id: 'b1', type: 'scene', content: '场景. 灵幻山谷 - 夜晚', shotId: 'S01' },
      { id: 'b2', type: 'action', content: '寒气逼人，岩壁上结着薄霜。楚寒手持寒渊剑，与一只三眼巨狼对峙。', sourceText: '月夜下的灵幻山谷，寒气砭骨...', shotId: 'S01' },
      { id: 'b3', type: 'character', content: '楚寒', emotion: '冷厉', shotId: 'S02' },
      { id: 'b4', type: 'dialogue', content: '挡我者死！', shotId: 'S02' },
      { id: 'b5', type: 'action', content: '剑光暴涨，瞬间冻结了巨狼的利爪。', shotId: 'S02' },
      { id: 'b6', type: 'character', content: '云璃', emotion: '焦急', shotId: 'S03' },
      { id: 'b7', type: 'os', content: '（内心）不能让他伤了灵兽！', sourceText: '她心想，这人好生霸道', shotId: 'S03' },
      { id: 'b8', type: 'action', content: '一道青色药雾横空出现，撞偏了剑锋。', shotId: 'S03' }
    ]

    // Generate Shots Data
    localData.value.shots = [
      {
        shotId: 'S01',
        camera: { shotType: '远景', movement: '拉' },
        duration: Math.floor(Math.random() * (10 - 5 + 1)) + 5,
        characters: [],
        prompt: '远景，夜晚神秘的山谷，岩石上的霜，月光，寒冷的气氛，(杰作)，8k',
        tags: ['电影感', '黑暗', '奇幻']
      },
      {
        shotId: 'S02',
        camera: { shotType: '中景', movement: '推' },
        duration: Math.floor(Math.random() * (10 - 5 + 1)) + 5,
        characters: [{ name: '楚寒', avatar: '', visualTags: '18岁少年，黑袍，持剑，冷漠表情' }],
        prompt: '中景，18岁少年，黑袍，手持发光的冰剑，冷漠表情，战斗姿态，动态光照',
        tags: ['动作', '聚焦']
      },
      {
        shotId: 'S03',
        camera: { shotType: '特写', movement: '摇' },
        duration: Math.floor(Math.random() * (10 - 5 + 1)) + 5,
        characters: [{ name: '云璃', avatar: '', visualTags: '16岁少女，白裙，绿色光环，温柔面容' }],
        prompt: '特写，16岁少女，白裙，担忧的表情，绿色魔法光环，柔和光照，景深',
        tags: ['肖像', '魔法']
      }
    ]
    
    emit('update:projectData', localData.value)
    activeShotId.value = 'S01'
  }, 1000)
}

const openFiveSenses = (block: any) => {
  activeBlockForSenses.value = block
  sensesData.value = {
    visual: '',
    auditory: '',
    olfactory: '',
    gustatory: '',
    tactile: ''
  }
  activeSense.value = 'visual'
  fiveSensesVisible.value = true
}

const generateSenses = () => {
  if (!activeBlockForSenses.value) return
  isGeneratingSenses.value = true
  
  setTimeout(() => {
    // Mock AI generation based on content
    const content = activeBlockForSenses.value.content || ''
    sensesData.value = {
      visual: `光线：幽暗的月光透过稀疏的树叶洒落。\n色彩：冷冽的银白与深邃的墨蓝交织。\n细节：${content.substring(0, 10)}...的轮廓在阴影中若隐若现，空气中漂浮着微小的冰晶。`,
      auditory: `主音：寒风呼啸穿过岩缝的呜咽声。\n背景：远处的狼嚎与近处沉重的呼吸声交织。\n细节：脚踩在碎石上的细微摩擦声清晰可闻。`,
      olfactory: `气味：空气中弥漫着一股凛冽的寒气，混合着淡淡的血腥味和松针的清香。`,
      gustatory: `口感：喉咙里仿佛吞下了一块冰，带着一丝铁锈般的血腥味。`,
      tactile: `触感：刺骨的寒风如刀割般划过皮肤，手中的剑柄冰凉彻骨，手心却微微出汗。`
    }
    isGeneratingSenses.value = false
    ElMessage.success('五感详情已生成')
  }, 1500)
}

const applySense = () => {
  if (!activeBlockForSenses.value) return
  const currentSenseContent = sensesData.value[activeSense.value as keyof typeof sensesData.value]
  if (currentSenseContent) {
    // Append to content
    activeBlockForSenses.value.content += `\n[${activeSense.value === 'visual' ? '视觉' : activeSense.value === 'auditory' ? '听觉' : '其他'}补充] ${currentSenseContent.split('\n')[0]}`
    ElMessage.success('已插入正文')
    fiveSensesVisible.value = false
  } else {
    ElMessage.warning('当前感官无内容')
  }
}

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
