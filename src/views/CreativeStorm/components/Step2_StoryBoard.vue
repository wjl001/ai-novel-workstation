<template>
  <div class="h-full flex flex-col p-6 space-y-6">
    <!-- Top: Highlight Extraction & Beat Sheet -->
    <div class="flex-1 flex gap-6 min-h-0">
      
      <!-- Node A: Highlight Extraction -->
      <div class="w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
        <div class="p-4 border-b border-slate-100 flex justify-between items-center">
          <div class="flex items-center gap-2">
            <div class="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg">
              <el-icon><Filter /></el-icon>
            </div>
            <h3 class="font-bold text-slate-800">节点 A: 高光提取</h3>
          </div>
          <el-button type="primary" size="small" link @click="extractHighlights">
            <el-icon class="mr-1"><Refresh /></el-icon> 重新提取
          </el-button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          <div v-if="localData.highlights.length === 0" class="h-full flex flex-col items-center justify-center text-slate-400">
            <el-button type="primary" @click="extractHighlights">开始提取核心事件</el-button>
            <p class="text-xs mt-2">AI 将自动剔除环境描写与冗长对话</p>
          </div>
          <div v-else class="space-y-3">
            <div v-for="(item, idx) in localData.highlights" :key="idx" class="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm">
              <div class="flex justify-between items-start mb-1">
                <span class="font-bold text-slate-700">事件 #{{ Number(idx) + 1 }}</span>
                <el-tag size="small" type="warning" effect="plain">{{ item.type }}</el-tag>
              </div>
              <p class="text-slate-600 leading-relaxed">{{ item.content }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Node B: Beat Sheet (Waveform) -->
      <div class="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
        <div class="p-4 border-b border-slate-100 flex justify-between items-center">
          <div class="flex items-center gap-2">
            <div class="bg-rose-100 text-rose-600 p-1.5 rounded-lg">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <h3 class="font-bold text-slate-800">节点 B: 剧本节拍器</h3>
          </div>
          <div class="flex gap-2">
            <el-tag size="small" type="danger" effect="dark">冲突检测: 3项待优化</el-tag>
          </div>
        </div>

        <div class="flex-1 p-6 flex flex-col justify-center relative">
          <!-- Waveform Visualization -->
          <div class="h-48 flex items-end justify-between gap-1 px-4 relative">
            <div 
              v-for="(beat, idx) in beats" 
              :key="idx"
              class="flex-1 bg-slate-200 rounded-t transition-all hover:bg-indigo-400 cursor-pointer relative group"
              :class="{'bg-rose-500': beat.isConflict, 'bg-indigo-500': beat.isHook}"
              :style="{ height: beat.intensity + '%' }"
            >
              <!-- Tooltip -->
              <div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-slate-800 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none z-10">
                <div class="font-bold mb-1">{{ beat.time }}s - {{ beat.label }}</div>
                <div>{{ beat.desc }}</div>
              </div>
            </div>
            
            <!-- Axis -->
            <div class="absolute bottom-0 left-0 w-full h-px bg-slate-300"></div>
          </div>

          <!-- Conflict Checks -->
          <div class="mt-8 grid grid-cols-3 gap-4">
            <div class="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
              <el-icon class="text-red-500 mt-0.5"><Warning /></el-icon>
              <div>
                <div class="font-bold text-xs text-slate-700">第 10 秒: 缺乏冲突</div>
                <div class="text-[10px] text-slate-500 mt-1">建议: 增加反派挑衅或突发危机</div>
                <el-button type="danger" link size="small" class="mt-1 p-0 h-auto text-[10px]">一键优化</el-button>
              </div>
            </div>
            <div class="p-3 bg-green-50 border border-green-100 rounded-lg flex items-start gap-3">
              <el-icon class="text-green-500 mt-0.5"><CircleCheck /></el-icon>
              <div>
                <div class="font-bold text-xs text-slate-700">第 45 秒: 打脸爽点</div>
                <div class="text-[10px] text-slate-500 mt-1">情绪曲线达标，节奏紧凑</div>
              </div>
            </div>
            <div class="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
              <el-icon class="text-red-500 mt-0.5"><Warning /></el-icon>
              <div>
                <div class="font-bold text-xs text-slate-700">第 89 秒: 悬念不足</div>
                <div class="text-[10px] text-slate-500 mt-1">建议: 抛出致命钩子 (Hook)</div>
                <el-button type="danger" link size="small" class="mt-1 p-0 h-auto text-[10px]">生成悬念</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom: Episode Slicing -->
    <div class="h-1/3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
      <div class="p-4 border-b border-slate-100 flex justify-between items-center">
        <div class="flex items-center gap-2">
          <div class="bg-green-100 text-green-600 p-1.5 rounded-lg">
            <el-icon><Files /></el-icon>
          </div>
          <h3 class="font-bold text-slate-800">节点 C: 自动分集切片</h3>
        </div>
        <el-button type="success" plain size="small" @click="sliceEpisodes">
          <el-icon class="mr-1"><Scissor /></el-icon> 智能切分
        </el-button>
      </div>

      <div class="flex-1 overflow-x-auto p-4 flex gap-4 custom-scrollbar">
        <div v-if="localData.episodes.length === 0" class="w-full flex items-center justify-center text-slate-400">
          <span class="flex items-center gap-2"><el-icon><ArrowLeft /></el-icon> 点击右上角“智能切分”生成分集大纲</span>
        </div>
        <div 
          v-for="(ep, idx) in localData.episodes" 
          :key="idx" 
          class="min-w-[240px] bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col hover:shadow-md transition-shadow"
        >
          <div class="flex justify-between items-center mb-2">
            <span class="font-bold text-slate-800">第 {{ Number(idx) + 1 }} 集</span>
            <el-tag size="small" type="info">{{ ep.duration }}</el-tag>
          </div>
          <div class="font-bold text-sm text-slate-700 mb-2 line-clamp-1">{{ ep.title }}</div>
          <p class="text-xs text-slate-500 line-clamp-4 flex-1">{{ ep.summary }}</p>
          <div class="mt-3 pt-3 border-t border-slate-200 flex justify-between text-xs text-slate-400">
            <span>{{ ep.wordCount }} 字</span>
            <span class="text-indigo-500 cursor-pointer hover:underline">查看详情</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { 
  Filter, TrendCharts, Warning, CircleCheck, Files, Scissor, Refresh, ArrowLeft 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  projectData: any
}>()

const emit = defineEmits(['update:projectData'])

const localData = ref(props.projectData)

// Mock Data for Beats
const beats = ref([
  { time: 5, intensity: 20, label: '开场', desc: '环境铺垫', isConflict: false, isHook: false },
  { time: 10, intensity: 30, label: '铺垫', desc: '主角登场', isConflict: false, isHook: false },
  { time: 15, intensity: 10, label: '低谷', desc: '遭遇嘲讽', isConflict: true, isHook: false }, // Low intensity but needs conflict
  { time: 20, intensity: 40, label: '上升', desc: '情绪积累', isConflict: false, isHook: false },
  { time: 30, intensity: 60, label: '小高潮', desc: '初步反击', isConflict: false, isHook: false },
  { time: 45, intensity: 90, label: '打脸', desc: '核心爽点', isConflict: false, isHook: false },
  { time: 60, intensity: 50, label: '回落', desc: '事态发酵', isConflict: false, isHook: false },
  { time: 75, intensity: 70, label: '危机', desc: '新的威胁', isConflict: false, isHook: false },
  { time: 89, intensity: 95, label: '悬念', desc: '致命钩子', isConflict: false, isHook: true },
])

const extractHighlights = () => {
  ElMessage.success('正在提取核心冲突事件...')
  setTimeout(() => {
    localData.value.highlights = [
      { type: '冲突', content: '楚寒与三眼巨狼对峙，剑气冻结岩壁。' },
      { type: '反转', content: '云璃突然出现，用药雾撞偏了楚寒的致命一剑。' },
      { type: '情感', content: '楚寒认出云璃是当年的救命恩人，杀意骤减。' },
      { type: '悬念', content: '巨狼眼中闪过一丝人性化的嘲弄，似乎在等待什么。' }
    ]
    emit('update:projectData', localData.value)
  }, 1000)
}

const sliceEpisodes = () => {
  ElMessage.success('正在进行智能分集...')
  setTimeout(() => {
    localData.value.episodes = [
      { title: '重生剑尊', duration: '1:30', wordCount: 450, summary: '楚寒重生归来，在灵幻山谷遭遇三眼巨狼，正欲斩杀时被神秘女子阻拦。' },
      { title: '昔日恩人', duration: '1:45', wordCount: 520, summary: '楚寒认出女子是云璃，回忆起百年前的恩情。此时巨狼突然狂暴化。' },
      { title: '狼王之怒', duration: '1:20', wordCount: 400, summary: '巨狼变身为妖族统领，实力碾压二人。楚寒不得不使出禁忌剑术。' },
      { title: '绝境求生', duration: '1:35', wordCount: 480, summary: '剑术反噬，楚寒吐血倒地。云璃为救楚寒，不惜燃烧本命元神。' },
    ]
    emit('update:projectData', localData.value)
  }, 1000)
}

watch(localData, (newVal) => {
  emit('update:projectData', newVal)
}, { deep: true })
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
</style>
