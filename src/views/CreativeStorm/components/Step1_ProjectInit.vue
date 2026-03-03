<template>
  <div class="h-full flex p-6 gap-6">
    <!-- Left: Source Selection -->
    <div class="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
      <div class="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
        <div class="bg-blue-100 text-blue-600 p-2 rounded-lg">
          <el-icon><Notebook /></el-icon>
        </div>
        <h3 class="font-bold text-lg text-slate-800">节点 A: 来源选择</h3>
      </div>

      <div class="flex-1 space-y-6">
        <el-radio-group v-model="localData.sourceType" class="w-full grid grid-cols-2 gap-4">
          <div 
            class="cursor-pointer border-2 rounded-xl p-4 transition-all hover:border-blue-400 relative"
            :class="localData.sourceType === 'novel' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white'"
            @click="localData.sourceType = 'novel'"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold text-slate-800">路径 1: 小说IP库导入</span>
              <el-icon v-if="localData.sourceType === 'novel'" class="text-blue-600"><Select /></el-icon>
            </div>
            <p class="text-xs text-slate-500 leading-relaxed">
              直接选择已连载小说，AI自动拉取世界观和角色库。
            </p>
          </div>

          <div 
            class="cursor-pointer border-2 rounded-xl p-4 transition-all hover:border-purple-400 relative"
            :class="localData.sourceType === 'original' ? 'border-purple-600 bg-purple-50' : 'border-slate-200 bg-white'"
            @click="localData.sourceType = 'original'"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold text-slate-800">路径 2: 原创短剧剧本</span>
              <el-icon v-if="localData.sourceType === 'original'" class="text-purple-600"><Select /></el-icon>
            </div>
            <p class="text-xs text-slate-500 leading-relaxed">
              从零开始，使用一句话灵感生成。
            </p>
          </div>
        </el-radio-group>

        <!-- Content for Novel Selection -->
        <div v-if="localData.sourceType === 'novel'" class="mt-6 animate-fade-in">
          <div class="text-sm font-bold text-slate-700 mb-3">选择已连载作品</div>
          <div class="grid grid-cols-1 gap-3">
            <div 
              class="flex gap-4 p-3 border border-blue-200 bg-blue-50/50 rounded-lg cursor-pointer ring-2 ring-blue-500 ring-offset-2"
            >
              <img src="https://images.unsplash.com/photo-1614726365723-49cfa0959a46?w=200&h=300&fit=crop" class="w-20 h-28 object-cover rounded shadow-sm" />
              <div class="flex-1">
                <div class="flex justify-between items-start">
                  <h4 class="font-bold text-slate-900">《剑尊归来》</h4>
                  <el-tag size="small" type="success">连载中</el-tag>
                </div>
                <div class="text-xs text-slate-500 mt-1 mb-2">作者: 墨香铜臭 | 字数: 230万</div>
                <p class="text-xs text-slate-600 line-clamp-2">
                  一代剑尊楚寒陨落百年后重生，发现当年背叛自己的徒弟已成仙盟盟主...
                </p>
                <div class="mt-2 flex gap-1">
                  <el-tag size="small" effect="plain" type="info">仙侠</el-tag>
                  <el-tag size="small" effect="plain" type="info">复仇</el-tag>
                </div>
              </div>
            </div>
            <!-- Mock other items -->
            <div class="flex gap-4 p-3 border border-slate-200 rounded-lg opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
              <div class="w-20 h-28 bg-slate-200 rounded flex items-center justify-center text-slate-400 text-xs">Cover</div>
              <div class="flex-1">
                <h4 class="font-bold text-slate-700">《霸道总裁爱上我》</h4>
                <div class="text-xs text-slate-400 mt-1">都市言情</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Content for Original Idea -->
        <div v-else class="mt-6 animate-fade-in">
          <div class="text-sm font-bold text-slate-700 mb-2">一句话灵感</div>
          <el-input
            v-model="localData.originalIdea"
            type="textarea"
            :rows="6"
            placeholder="例如：一个拥有读心术的古代王妃，穿越到现代娱乐圈成为金牌经纪人..."
            maxlength="200"
            show-word-limit
          />
          <div class="mt-4 flex justify-end">
            <el-button type="primary" plain size="small">
              <el-icon class="mr-1"><MagicStick /></el-icon> AI 扩充灵感
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Specs Setting -->
    <div class="w-96 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
      <div class="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
        <div class="bg-orange-100 text-orange-600 p-2 rounded-lg">
          <el-icon><Setting /></el-icon>
        </div>
        <h3 class="font-bold text-lg text-slate-800">节点 B: 短剧规格设定</h3>
      </div>

      <div class="space-y-8">
        <!-- Scale Selection -->
        <div>
          <div class="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <el-icon><Film /></el-icon> 剧集规模
          </div>
          <el-radio-group v-model="localData.seriesScale" class="flex flex-col gap-3">
            <el-radio border label="single" class="!ml-0 !w-full !mr-0">
              <div class="flex flex-col py-1">
                <span class="font-bold">单集 (漫剪/短视频)</span>
                <span class="text-xs text-slate-400 mt-1">约 3-5 分钟，适合抖音/快手</span>
              </div>
            </el-radio>
            <el-radio border label="series" class="!ml-0 !w-full !mr-0">
              <div class="flex flex-col py-1">
                <span class="font-bold">连载季 (小程序剧)</span>
                <span class="text-xs text-slate-400 mt-1">100集 x 1.5分钟，高留存结构</span>
              </div>
            </el-radio>
          </el-radio-group>
        </div>

        <!-- Audience Tags -->
        <div>
          <div class="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <el-icon><User /></el-icon> 受众标签
          </div>
          <div class="grid grid-cols-1 gap-3">
            <div 
              class="p-3 border rounded-lg cursor-pointer transition-all flex items-center gap-3"
              :class="localData.audienceTag === 'female_romance' ? 'border-pink-400 bg-pink-50' : 'border-slate-200 hover:border-pink-200'"
              @click="localData.audienceTag = 'female_romance'"
            >
              <div class="w-8 h-8 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center">
                <el-icon><Female /></el-icon>
              </div>
              <div>
                <div class="font-bold text-sm text-slate-800">女频甜宠</div>
                <div class="text-[10px] text-slate-500">高甜/虐恋/大女主</div>
              </div>
              <el-icon v-if="localData.audienceTag === 'female_romance'" class="ml-auto text-pink-500"><Select /></el-icon>
            </div>

            <div 
              class="p-3 border rounded-lg cursor-pointer transition-all flex items-center gap-3"
              :class="localData.audienceTag === 'male_warrior' ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-200'"
              @click="localData.audienceTag = 'male_warrior'"
            >
              <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center">
                <el-icon><Male /></el-icon>
              </div>
              <div>
                <div class="font-bold text-sm text-slate-800">男频战神</div>
                <div class="text-[10px] text-slate-500">赘婿/神豪/无敌流</div>
              </div>
              <el-icon v-if="localData.audienceTag === 'male_warrior'" class="ml-auto text-blue-500"><Select /></el-icon>
            </div>

            <div 
              class="p-3 border rounded-lg cursor-pointer transition-all flex items-center gap-3"
              :class="localData.audienceTag === 'suspense' ? 'border-purple-400 bg-purple-50' : 'border-slate-200 hover:border-purple-200'"
              @click="localData.audienceTag = 'suspense'"
            >
              <div class="w-8 h-8 rounded-full bg-purple-100 text-purple-500 flex items-center justify-center">
                <el-icon><WarnTriangleFilled /></el-icon>
              </div>
              <div>
                <div class="font-bold text-sm text-slate-800">悬疑惊悚</div>
                <div class="text-[10px] text-slate-500">反转/烧脑/无限流</div>
              </div>
              <el-icon v-if="localData.audienceTag === 'suspense'" class="ml-auto text-purple-500"><Select /></el-icon>
            </div>
          </div>
          
          <div class="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded text-xs text-yellow-700 flex gap-2">
            <el-icon class="mt-0.5"><InfoFilled /></el-icon>
            <span>AI 将根据标签自动调整后续剧本节奏 (例如: 男频更注重打脸速度，女频更注重情感拉扯)</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { 
  Notebook, Setting, Select, MagicStick, Film, User, 
  Female, Male, WarnTriangleFilled, InfoFilled 
} from '@element-plus/icons-vue'

const props = defineProps<{
  projectData: any
}>()

const emit = defineEmits(['update:projectData'])

const localData = ref(props.projectData)

watch(localData, (newVal) => {
  emit('update:projectData', newVal)
}, { deep: true })
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
