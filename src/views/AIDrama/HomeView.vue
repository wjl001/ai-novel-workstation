<template>
  <div class="h-full p-6 overflow-y-auto bg-slate-50/50 dark:bg-[#0f172a]">
    <div class="max-w-7xl mx-auto space-y-8 pb-10">
      
      <!-- User Welcome & Stats Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <span>早上好，创作者</span>
            <span class="text-2xl">👋</span>
          </h1>
          <p class="text-slate-500 dark:text-slate-400 mt-2">今天想创作点什么？跃影为您提供全方位的 AI 创作工具。</p>
        </div>
        <div class="flex items-center gap-4">
          <el-button type="primary" plain class="!rounded-xl" @click="showPrototypeHelp = true">
            <el-icon class="mr-1"><InfoFilled /></el-icon> 原型图交互说明
          </el-button>
          <div class="flex items-center gap-4 bg-white dark:bg-slate-800 px-6 py-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div class="text-center px-4 border-r border-slate-100 dark:border-slate-700">
              <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">12</div>
              <div class="text-xs text-slate-500">剧本数</div>
            </div>
            <div class="text-center px-4 border-r border-slate-100 dark:border-slate-700">
              <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">5</div>
              <div class="text-xs text-slate-500">视频数</div>
            </div>
            <div class="text-center px-4">
              <div class="text-2xl font-bold text-pink-600 dark:text-pink-400">2.4k</div>
              <div class="text-xs text-slate-500">算力点</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Core Tools Grid (The Workbench) -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <el-icon class="text-indigo-500"><Grid /></el-icon>
            核心工具台
          </h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <!-- AI Script Tool -->
          <div 
            class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 to-blue-600 p-1 cursor-pointer group hover:shadow-2xl hover:shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-1"
            @click="router.push('/ai-write-novel')"
          >
            <div class="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
            <div class="relative h-full bg-white/10 backdrop-blur-sm rounded-[22px] p-6 flex flex-col border border-white/20">
              <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 shadow-inner backdrop-blur-md">
                <el-icon class="text-2xl text-white"><EditPen /></el-icon>
              </div>
              <h3 class="text-2xl font-bold text-white mb-2">AI 剧本</h3>
              <p class="text-indigo-100 text-sm mb-6 flex-1 line-clamp-2">一句话生成爆款设定、大纲与多集对话剧本，网文短剧高效创作利器。</p>
              <div class="flex items-center justify-between mt-auto">
                <div class="flex -space-x-2">
                  <el-avatar :size="24" class="border-2 border-indigo-500 !bg-blue-400">A</el-avatar>
                  <el-avatar :size="24" class="border-2 border-indigo-500 !bg-purple-400">B</el-avatar>
                  <span class="text-xs text-indigo-100 ml-3">等1.2w人正在使用</span>
                </div>
                <div class="w-8 h-8 rounded-full bg-white text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                  <el-icon><ArrowRight /></el-icon>
                </div>
              </div>
            </div>
          </div>

          <!-- AI Video Tool -->
          <div 
            class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 to-fuchsia-600 p-1 cursor-pointer group hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1"
            @click="router.push('/ai-video')"
          >
            <div class="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3"></div>
            <div class="relative h-full bg-white/10 backdrop-blur-sm rounded-[22px] p-6 flex flex-col border border-white/20">
              <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 shadow-inner backdrop-blur-md">
                <el-icon class="text-2xl text-white"><VideoCamera /></el-icon>
              </div>
              <h3 class="text-2xl font-bold text-white mb-2">AI 短剧</h3>
              <p class="text-purple-100 text-sm mb-6 flex-1 line-clamp-2">智能分镜解析，高质量视频生成，一键将文字剧本转化为视觉盛宴。</p>
              <div class="flex items-center justify-between mt-auto">
                <span class="px-2 py-1 bg-white/20 rounded text-xs text-white backdrop-blur-sm border border-white/30">推荐使用</span>
                <div class="w-8 h-8 rounded-full bg-white text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                  <el-icon><ArrowRight /></el-icon>
                </div>
              </div>
            </div>
          </div>

          <!-- AI Music Tool (Coming Soon Placeholder) -->
          <div class="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-800 p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col group">
            <div class="absolute top-4 right-4">
              <span class="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs rounded-full font-medium">敬请期待</span>
            </div>
            <div class="w-12 h-12 bg-slate-50 dark:bg-slate-700/50 rounded-xl flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-600">
              <el-icon class="text-2xl text-slate-400 dark:text-slate-500"><Headset /></el-icon>
            </div>
            <h3 class="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">AI 音乐</h3>
            <p class="text-slate-500 dark:text-slate-400 text-sm mb-6 flex-1">为您的短剧智能匹配BGM、音效及配音，打造沉浸式听觉体验。</p>
            <div class="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 text-sm">
              即将上线...
            </div>
          </div>

        </div>
      </div>

      <!-- Main Workspace Area -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left Col: Recent Projects (Takes up 2 columns) -->
        <div class="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 flex flex-col">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <el-icon class="text-purple-500"><FolderOpened /></el-icon>
              最近项目
            </h2>
            <el-button link type="primary" class="!text-indigo-500">查看全部</el-button>
          </div>
          
          <div class="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            <div v-for="(item, index) in recentProjects" :key="index" 
              class="group flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-transparent hover:border-slate-100 dark:hover:border-slate-600 transition-all cursor-pointer">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" 
                  :class="item.type === '短剧视频' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'">
                  <el-icon class="text-xl"><component :is="item.type === '短剧视频' ? VideoCamera : EditPen" /></el-icon>
                </div>
                <div>
                  <h4 class="font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{{ item.title }}</h4>
                  <div class="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span class="flex items-center gap-1"><el-icon><Document /></el-icon>{{ item.desc }}</span>
                    <span
                      class="px-2 py-0.5 rounded-full font-medium"
                      :class="item.type === '短剧视频' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'"
                    >
                      {{ item.type === '短剧视频' ? '短剧' : '剧本' }}
                    </span>
                    <span class="flex items-center gap-1"><el-icon><Clock /></el-icon>{{ item.time }}</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <el-button circle size="small" :icon="VideoPlay" v-if="item.type === '短剧视频'" />
                <el-button circle size="small" :icon="EditPen" v-else />
                <el-button circle size="small" :icon="More" />
              </div>
            </div>
          </div>
        </div>

        <!-- Right Col: Inspiration & News -->
        <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 flex flex-col">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <el-icon class="text-yellow-500"><MagicStick /></el-icon>
              创作灵感
            </h2>
            <el-button circle size="small" :icon="Refresh" />
          </div>

          <div class="space-y-4">
            <div class="p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border border-orange-100 dark:border-orange-800/30 relative overflow-hidden">
              <div class="absolute right-[-10px] top-[-10px] text-4xl opacity-20">🔥</div>
              <div class="text-xs font-bold text-orange-600 dark:text-orange-400 mb-1">今日热榜题材</div>
              <h4 class="font-bold text-slate-800 dark:text-slate-200 mb-2"># 真假千金 # 逆袭打脸</h4>
              <p class="text-xs text-slate-600 dark:text-slate-400 mb-3">当前受众群体对"反转期待感"的偏好上升了24%。</p>
              <el-button size="small" round class="bg-white/80 border-orange-200 text-orange-600 hover:bg-white">
                使用此模板创作
              </el-button>
            </div>

            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 cursor-pointer hover:border-indigo-300 transition-colors">
              <div class="flex justify-between items-start mb-2">
                <div class="text-sm font-bold text-slate-800 dark:text-slate-200">系统公告</div>
                <span class="text-[10px] text-slate-400">03-23</span>
              </div>
              <p class="text-xs text-slate-500 line-clamp-2">V2.0.0 大版本更新！全新的视频生成模型 SeedDream 上线，画质提升 40%，支持更精准的主体控制。</p>
            </div>
            
            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 cursor-pointer hover:border-indigo-300 transition-colors">
              <div class="flex justify-between items-start mb-2">
                <div class="text-sm font-bold text-slate-800 dark:text-slate-200">新手教程</div>
                <span class="text-[10px] text-slate-400">常驻</span>
              </div>
              <p class="text-xs text-slate-500 line-clamp-2">如何写出让 AI 听懂的分镜提示词？3分钟掌握画面描述的核心技巧。</p>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Prototype Explanation Dialog -->
    <ProductDesignDialog
      v-model="showPrototypeHelp"
      id="home-view"
      :default-content="{
        title: '工作台首页',
        location: '系统入口大厅，集成核心 AI 工具入口、个人创作数据统计及项目管理中心。',
        layout: [
          '**数据统计面板：** 实时展示剧本总数、已生成视频数及剩余算力点，辅助用户规划创作资源。',
          '**核心工具卡片：** 提供“AI 剧本”与“AI 短剧”两大核心模块的快速入口，通过渐变视觉引导。',
          '**最近项目列表：** 流式展示最近编辑的项目，支持按类型（剧本/视频）自动分类标识。',
          '**创作灵感区：** 动态拉取当前热门题材标签，并提供“使用此模板创作”一键套用功能。'
        ],
        interactions: [
          '**工具跳转 (触发动作)：** 点击卡片执行 `router.push`。**动作：** 平滑跳转至对应工作流起始页（`/ai-write-novel` 或 `/ai-video`）。',
          '**项目快捷操作：** 鼠标悬停列表项。**动作：** 右侧渐显“继续编辑”或“预览”按钮。点击直接恢复该项目的编辑现场。',
          '**模板套用 (触发动作)：** 点击热榜下的“使用此模板创作”。**动作：** 系统自动将该题材的 Prompt 注入新建流程，跳过手动输入环节。',
          '**异常逻辑：** \n - **算力预警：** 若算力点（Credit）低于 100，点击卡片会弹出“余额不足”提示。\n - **列表异常：** 若接口请求超时，项目列表将展示占位符并提供“刷新”重试按钮。',
          '**功能说明 (2.2版本)：** \n - **剧集管理：** 2.2版本支持手动新增剧集，赋能更灵活的创作需求。 \n - **AI 助手：** 全面开启 AI 智能助手，支持剧本正文引用与实时对话。'
        ],
        version: '2.2'
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  EditPen, VideoCamera, ArrowRight, More, Headset, Grid, 
  FolderOpened, Document, Clock, VideoPlay, MagicStick, Refresh, InfoFilled 
} from '@element-plus/icons-vue'
import ProductDesignDialog from '@/components/Common/ProductDesignDialog.vue'

const router = useRouter()
const showPrototypeHelp = ref(false)

const recentProjects = ref([
  { title: '《逆袭神豪之绝世龙王》', type: '短剧剧本', desc: '共 12 集', time: '2 小时前' },
  { title: '《废物苏醒成至尊》', type: '短剧视频', desc: '共 1 集', time: '5 小时前' },
  { title: '《重生之我在古代当首富》', type: '短剧剧本', desc: '共 50 集', time: '昨天 14:30' },
  { title: '《冰山总裁的贴身保镖》', type: '短剧视频', desc: '共 3 集', time: '3 天前' },
  { title: '《废土纪元：黎明》', type: '短剧剧本', desc: '共 8 集', time: '1 周前' }
])
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #475569;
}
</style>
