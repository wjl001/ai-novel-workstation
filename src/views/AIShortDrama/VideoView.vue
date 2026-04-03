<template>
  <div class="h-full flex flex-col p-4 bg-gray-50 dark:bg-gray-900">
    <!-- Header Steps -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 shadow-sm flex items-center justify-between border border-slate-100 dark:border-slate-700">
      <div class="flex items-center gap-3 text-gray-600 dark:text-gray-300">
        <button 
          @click="router.back()" 
          class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <el-icon><ArrowLeft /></el-icon>
        </button>
        <span class="font-bold text-[15px] border-r border-slate-200 dark:border-slate-700 pr-4 mr-2">短剧《废物苏醒成至尊》</span>
        <span class="text-[11px] bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full text-indigo-600 font-bold mr-4">共1集</span>
        <button 
          @click="showPrototypeHelp = true"
          class="flex items-center gap-1.5 px-3 py-1 bg-white text-indigo-600 border border-indigo-200 rounded-full text-[12px] font-bold hover:bg-indigo-50 transition-all shadow-sm"
        >
          <el-icon><InfoFilled /></el-icon>
          原型说明
        </button>
      </div>
      
      <el-steps :active="3" class="flex-1 max-w-3xl mx-auto custom-steps" finish-status="success" align-center>
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
            <h2 class="text-2xl font-black text-slate-800 tracking-tight">视频生成</h2>
            <p class="text-sm text-slate-400 mt-1 font-medium">为分镜生成高质量视频内容，支持批量处理</p>
          </div>
          <button 
            class="h-10 px-8 bg-indigo-600 text-white rounded-full text-[14px] font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <el-icon><VideoPlay /></el-icon>
            批量生成
          </button>
        </div>

        <div class="flex-1 flex gap-4 min-h-0">
          <!-- Center: Video Preview & Storyboards -->
          <div class="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center relative border border-slate-100 dark:border-slate-700">
            
            <!-- Video Player Placeholder -->
            <div class="w-full max-w-lg aspect-video bg-slate-50 dark:bg-gray-900 rounded-[32px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 mb-8 transition-all hover:border-indigo-400 group cursor-pointer">
              <div class="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <div class="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center shadow-xl shadow-indigo-500/30">
                  <el-icon class="text-white text-3xl"><VideoCamera /></el-icon>
                </div>
              </div>
              <div class="text-lg font-bold text-slate-700 dark:text-gray-200 mb-1">待生成分镜视频</div>
              <div class="text-sm text-slate-400">选择下方分镜并点击生成按钮开始创作</div>
            </div>

            <!-- Storyboard Thumbnails -->
            <div class="w-full mt-auto">
              <!-- Background Music -->
              <button class="w-full bg-slate-50 dark:bg-gray-700 rounded-xl p-3 mb-6 flex items-center justify-center text-[13px] text-slate-600 font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100 dark:border-slate-600 shadow-sm">
                <el-icon class="mr-2" size="18"><Headset /></el-icon> 一键生成背景音乐 (AI BGM)
              </button>

              <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
                <div 
                  v-for="(item, index) in storyboards" 
                  :key="index"
                  class="flex-shrink-0 w-36 aspect-[3/4] rounded-2xl border-2 cursor-pointer flex flex-col items-center justify-center relative transition-all"
                  :class="activeStoryboard === index ? 'border-indigo-600 bg-indigo-50/30 shadow-lg shadow-indigo-500/10' : 'border-slate-50 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800 hover:border-indigo-300'"
                  @click="activeStoryboard = index"
                >
                  <div class="w-14 h-14 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                    <div class="w-10 h-10 bg-indigo-100 rounded-lg opacity-40"></div>
                  </div>
                  <div class="text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">{{ item.name }}</div>
                  <div class="text-[11px] text-slate-400 font-medium">等待生成</div>
                  
                  <div v-if="activeStoryboard === index" class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-indigo-600 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Prompt Configuration -->
          <div class="w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 flex flex-col border border-slate-100 dark:border-slate-700">
            <div class="space-y-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              
              <!-- Prompt -->
              <div>
                <div class="text-[14px] font-bold text-slate-800 mb-3 flex items-center gap-2"><span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> 画面描述</div>
                <el-input
                  v-model="prompt"
                  type="textarea"
                  :rows="6"
                  class="custom-textarea-round"
                  placeholder="输入详细的画面描述..."
                />
              </div>

              <!-- Reference Subjects -->
              <div>
                <div class="text-[14px] font-bold text-slate-800 mb-3 flex items-center gap-2"><span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> 参考主体</div>
                <div class="grid grid-cols-2 gap-3">
                  <button class="border-2 border-dashed border-slate-200 dark:border-gray-600 rounded-2xl p-4 flex flex-col items-center justify-center text-slate-400 text-[12px] font-bold hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 hover:border-indigo-300 transition-all gap-2">
                    <el-icon size="20"><Plus /></el-icon> 参考图片
                  </button>
                  <button class="border-2 border-dashed border-slate-200 dark:border-gray-600 rounded-2xl p-4 flex flex-col items-center justify-center text-slate-400 text-[12px] font-bold hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 hover:border-indigo-300 transition-all gap-2">
                    <el-icon size="20"><Plus /></el-icon> 引用主体
                  </button>
                </div>
              </div>

              <!-- Model Selection -->
              <div>
                <div class="text-[14px] font-bold text-slate-800 mb-3 flex items-center gap-2"><span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> 模型选择</div>
                <div class="border border-slate-100 rounded-2xl p-4 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 cursor-pointer flex justify-between items-center hover:border-indigo-400 hover:bg-white transition-all shadow-sm group">
                  <div>
                    <div class="font-bold text-[14px] text-slate-800">SeedDream 2.0</div>
                    <div class="text-[11px] text-slate-400 mt-1 font-medium">高品质极速视频生成</div>
                  </div>
                  <el-icon class="text-slate-300 group-hover:text-indigo-600"><ArrowDown /></el-icon>
                </div>
              </div>
            </div>

            <!-- Generate Button -->
            <div class="pt-6 mt-6 border-t border-slate-100 dark:border-gray-700">
              <button 
                class="w-full h-14 bg-indigo-600 text-white rounded-full text-lg font-bold shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <el-icon><MagicStick /></el-icon>
                立即生成
              </button>
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