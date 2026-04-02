<template>
  <div class="h-full flex flex-col p-4 bg-gray-50 dark:bg-gray-900">
    <!-- Header Steps -->
    <div class="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm flex items-center justify-between">
      <div class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
        <el-button @click="router.back()" :icon="ArrowLeft" circle size="small" />
        <span class="font-medium text-sm border-r pr-4 mr-2">短剧《废物苏醒成至尊》</span>
        <span class="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-500 mr-2">共1集</span>
        <el-button type="primary" plain size="small" class="!rounded-full !px-3" @click="showPrototypeHelp = true">
          <el-icon class="mr-1"><InfoFilled /></el-icon> 原型说明
        </el-button>
      </div>
      
      <el-steps :active="3" class="flex-1 max-w-3xl mx-auto" finish-status="success" align-center>
        <el-step title="角色剧本" />
        <el-step title="提取主体" />
        <el-step title="分镜剧本" />
        <el-step title="生成视频" />
      </el-steps>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex gap-4 min-h-0">
      <!-- Left Sidebar (Episodes) -->
      <div class="w-48 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div class="p-3 border-b dark:border-gray-700 font-medium text-sm">集数</div>
        <div class="flex-1 overflow-y-auto p-2">
          <div class="bg-indigo-600 text-white rounded-lg p-3 text-sm cursor-pointer mb-2 flex justify-between items-center shadow-sm">
            <span>第1集</span>
            <el-icon><ArrowRight /></el-icon>
          </div>
          <!-- Mock additional episodes -->
          <div v-for="i in 11" :key="i" class="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-3 text-sm cursor-pointer mb-1 transition-colors">
            第{{ i + 1 }}集
          </div>
        </div>
      </div>

      <!-- Center & Right Content Area -->
      <div class="flex-1 flex flex-col gap-4 min-h-0">
        <!-- Top Section: Title & Actions -->
        <div class="flex justify-between items-end px-2">
          <div>
            <h2 class="text-xl font-bold mb-1">视频生成</h2>
            <p class="text-xs text-gray-500">为封面对分镜生成视频内容</p>
          </div>
          <el-button type="primary" :icon="VideoPlay" class="bg-purple-600 hover:bg-purple-700 border-none">
            批量生成
          </el-button>
        </div>

        <div class="flex-1 flex gap-4 min-h-0">
          <!-- Center: Video Preview & Storyboards -->
          <div class="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex flex-col items-center justify-center relative">
            
            <!-- Video Player Placeholder -->
            <div class="w-full max-w-lg aspect-video bg-gray-50 dark:bg-gray-900 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 mb-8 transition-all hover:border-purple-400">
              <div class="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                <div class="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <el-icon class="text-white text-2xl"><VideoCamera /></el-icon>
                </div>
              </div>
              <div class="text-lg font-medium text-gray-700 dark:text-gray-200 mb-1">待生成分镜</div>
              <div class="text-sm text-gray-400">选择分镜并点击生成按钮开始创作</div>
            </div>

            <!-- Storyboard Thumbnails -->
            <div class="w-full mt-auto">
              <!-- Background Music -->
              <div class="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-2 mb-4 flex items-center justify-center text-sm text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors border border-gray-100 dark:border-gray-600">
                <el-icon class="mr-2"><Headset /></el-icon> 生成背景音乐
              </div>

              <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                <div 
                  v-for="(item, index) in storyboards" 
                  :key="index"
                  class="flex-shrink-0 w-32 aspect-[3/4] rounded-lg border-2 cursor-pointer flex flex-col items-center justify-center relative transition-all"
                  :class="activeStoryboard === index ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10' : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-purple-300'"
                  @click="activeStoryboard = index"
                >
                  <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3">
                    <div class="w-8 h-8 bg-purple-400 rounded-full opacity-50"></div>
                  </div>
                  <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{{ item.name }}</div>
                  <div class="text-[10px] text-gray-400">待生成分镜</div>
                  
                  <div v-if="activeStoryboard === index" class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-purple-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Prompt Configuration -->
          <div class="w-80 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex flex-col">
            <div class="space-y-6 flex-1 overflow-y-auto pr-2">
              
              <!-- Prompt -->
              <div>
                <div class="text-sm font-medium mb-2">画面描述</div>
                <el-input
                  v-model="prompt"
                  type="textarea"
                  :rows="6"
                  class="text-sm"
                  placeholder="输入画面描述..."
                />
              </div>

              <!-- Reference Subjects -->
              <div>
                <div class="text-sm font-medium mb-2">参考主体</div>
                <div class="space-y-2">
                  <div class="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 flex items-center justify-center text-gray-400 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-purple-500 hover:border-purple-400 transition-all">
                    <el-icon class="mr-1"><Plus /></el-icon> 图片
                  </div>
                  <div class="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 flex items-center justify-center text-gray-400 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-purple-500 hover:border-purple-400 transition-all">
                    <el-icon class="mr-1"><Plus /></el-icon> 主体
                  </div>
                </div>
              </div>

              <!-- Model Selection -->
              <div>
                <div class="text-sm font-medium mb-2">模型选择</div>
                <div class="border rounded-lg p-3 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 cursor-pointer flex justify-between items-center hover:border-purple-400 transition-colors">
                  <div>
                    <div class="font-medium text-sm">SeedDream</div>
                    <div class="text-xs text-gray-500 mt-0.5">高品质图像生成</div>
                  </div>
                  <el-icon><ArrowDown /></el-icon>
                </div>
              </div>
            </div>

            <!-- Generate Button -->
            <div class="pt-4 mt-4 border-t dark:border-gray-700">
              <el-button type="primary" size="large" class="w-full bg-purple-600 hover:bg-purple-700 border-none rounded-lg text-base" :icon="MagicStick">
                生成
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Prototype Explanation Drawer -->
    <el-drawer
      v-model="showPrototypeHelp"
      title="💡 AI短剧交互原型说明"
      direction="rtl"
      size="400px"
    >
      <div class="space-y-6">
        <div class="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-xl">
          <h4 class="font-bold text-indigo-700 dark:text-indigo-300 mb-2">1. 顶步进度条</h4>
          <p class="text-sm text-slate-600 dark:text-slate-300 mb-2">
            明确展示了短剧视频生成的四个阶段：
          </p>
          <ul class="text-sm text-slate-500 dark:text-slate-400 list-decimal pl-4 space-y-1">
            <li><strong>角色剧本：</strong> 确立分集对白与基本场景。</li>
            <li><strong>提取主体：</strong> AI自动分析并锁定关键角色与视觉元素。</li>
            <li><strong>分镜剧本：</strong> 将文字转译为具体的镜头画面描述。</li>
            <li><strong>生成视频：</strong> 基于分镜渲染最终短剧片段。</li>
          </ul>
        </div>

        <div class="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-xl">
          <h4 class="font-bold text-purple-700 dark:text-purple-300 mb-2">2. 左侧集数导航与底部时间轴</h4>
          <p class="text-sm text-slate-600 dark:text-slate-300 mb-2">
            提供清晰的时空维度导航。
          </p>
          <ul class="text-sm text-slate-500 dark:text-slate-400 list-disc pl-4 space-y-1">
            <li>左侧可以快速在多集之间切换，管理整个项目的庞大内容。</li>
            <li>底部分镜缩略图类似视频剪辑软件的时间轴，点击即可切换中间主画布的待生成镜头。</li>
            <li>支持一键生成全局背景音乐。</li>
          </ul>
        </div>

        <div class="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-xl">
          <h4 class="font-bold text-yellow-700 dark:text-yellow-300 mb-2">3. 右侧生成控制面板</h4>
          <p class="text-sm text-slate-600 dark:text-slate-300 mb-2">
            精准控制单一镜头的生成质量。
          </p>
          <ul class="text-sm text-slate-500 dark:text-slate-400 list-disc pl-4 space-y-1">
            <li><strong>画面描述：</strong> 允许用户对AI解析的提示词进行手动修改。</li>
            <li><strong>参考主体：</strong> 用户可上传特定的图片或设定，确保人物长相和场景在各镜头间保持一致性（垫图功能）。</li>
            <li><strong>模型选择：</strong> 提供不同风格的模型切换（如 SeedDream 高品质模型）。</li>
          </ul>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, VideoPlay, VideoCamera, Headset, Plus, ArrowDown, MagicStick, InfoFilled } from '@element-plus/icons-vue'

const router = useRouter()
const activeStoryboard = ref(0)
const showPrototypeHelp = ref(false)
const prompt = ref('一个唯美的极简剖面，展现故事的发生场景和主要人物。画面构图提取，色彩鲜明，具有强烈的视觉冲击力')

const storyboards = ref([
  { id: 0, name: '封面' },
  { id: 1, name: '镜头 1' },
  { id: 2, name: '镜头 2' },
  { id: 3, name: '镜头 3' },
  { id: 4, name: '镜头 4' },
  { id: 5, name: '镜头 5' }
])
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  height: 6px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 20px;
}
.dark .scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: #374151;
}
</style>