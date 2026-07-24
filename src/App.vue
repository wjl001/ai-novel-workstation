<template>
  <el-container class="h-screen w-screen overflow-hidden transition-colors duration-300" :class="isLight ? 'theme-light bg-[#f5f6fb] text-slate-800' : 'theme-dark bg-slate-950 text-slate-100'">
    <el-header v-if="!isAuthPage" class="border-b flex items-center justify-between px-8 z-10 shadow-sm transition-colors duration-300" :class="isLight ? 'bg-white/80 backdrop-blur-md border-slate-200' : 'bg-slate-900/85 backdrop-blur-md border-slate-700'">
      <div class="flex items-center gap-3">
        <!-- Teleport target for back button -->
        <div id="header-back-button"></div>
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 cursor-pointer" @click="router.push('/')">      
          <el-icon :size="24" class="text-white"><VideoPlay /></el-icon>
        </div>
        <div class="flex flex-col cursor-pointer" @click="router.push('/')">
          <h1 class="text-lg font-black tracking-tight leading-none" :class="isLight ? 'text-slate-800' : 'text-white'">
            智影
          </h1>
          <span class="text-[10px] text-indigo-500 font-black uppercase tracking-[0.2em] mt-1">短剧引擎</span>
        </div>
      </div>
      
      <!-- Teleport target for process nodes -->
      <div id="header-center" class="flex-1 flex justify-center mx-4"></div>

      <div class="flex items-center gap-3">
        <!-- Global Task Center Button -->
        <button 
          @click="showTaskList = true"
          class="group relative flex items-center gap-2.5 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-all duration-300"
        >
          <div class="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
            <el-icon :size="16"><List /></el-icon>
          </div>
          <span class="text-[13px] font-black tracking-tight">任务中心</span>
          
          <div v-if="activeTaskCount > 0" class="absolute -top-1.5 -right-1.5 flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <div class="relative w-5 h-5 bg-indigo-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-lg">
              {{ activeTaskCount }}
            </div>
          </div>
        </button>

        <button
          v-if="userStore.isLoggedIn"
          type="button"
          class="flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition-all duration-300"
          :class="isLight ? 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 shadow-sm' : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-indigo-500 hover:text-indigo-300 shadow-sm shadow-black/20'"
          @click="themeStore.toggleTheme()"
        >
          <el-icon :size="14">
            <Sunny v-if="isLight" />
            <Moon v-else />
          </el-icon>
          <span>{{ isLight ? '浅色' : '深色' }}</span>
        </button>
        <el-dropdown v-if="userStore.isLoggedIn" trigger="click" @command="handleCommand">
          <div class="flex items-center gap-3 cursor-pointer outline-none group">
            <el-avatar :size="32" class="!bg-indigo-600 shadow-inner ring-2 ring-transparent group-hover:ring-indigo-300 transition-all" :src="userStore.userInfo?.avatar">
              {{ userStore.userInfo?.name?.charAt(0) || 'U' }}
            </el-avatar>
            <div class="flex flex-col">
              <span class="text-xs font-black leading-none" :class="isLight ? 'text-slate-800' : 'text-white'">
                {{ userStore.userInfo?.name }}
              </span>
              <span class="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">
                {{ userStore.userInfo?.teamRole || 'Standard User' }}
              </span>
            </div>
            <el-icon class="text-slate-400 ml-1 group-hover:text-indigo-500 transition-colors"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu class="user-dropdown-v4">
              <div class="user-dropdown-header">
                <div class="avatar-wrapper">
                  <el-avatar :size="48" class="!bg-indigo-600 shadow-lg" :src="userStore.userInfo?.avatar">
                    {{ userStore.userInfo?.name?.charAt(0) || 'U' }}
                  </el-avatar>
                </div>
                <div class="user-info-wrapper">
                  <h4 class="name">{{ userStore.userInfo?.name }}</h4>
                  <p class="role">{{ userStore.userInfo?.teamRole || '标准创作者' }}</p>
                  <div class="balance-tag">
                    <el-icon><Coin /></el-icon>
                    <span>{{ userStore.balance.toLocaleString() }} 豆</span>
                  </div>
                </div>
              </div>
              <div class="dropdown-content">
                <el-dropdown-item command="profile">
                  <div class="menu-item-inner">
                    <div class="icon-box blue"><el-icon><User /></el-icon></div>
                    <span>个人资料</span>
                  </div>
                </el-dropdown-item>
                <el-dropdown-item command="team">
                  <div class="menu-item-inner">
                    <div class="icon-box purple"><el-icon><Connection /></el-icon></div>
                    <span>团队管理</span>
                  </div>
                </el-dropdown-item>
                <el-dropdown-item command="member-center">
                  <div class="menu-item-inner">
                    <div class="icon-box gold"><el-icon><GoldMedal /></el-icon></div>
                    <span>会员中心</span>
                  </div>
                </el-dropdown-item>
                <el-dropdown-item command="consumption">
                  <div class="menu-item-inner">
                    <div class="icon-box amber"><el-icon><Coin /></el-icon></div>
                    <span>算力消耗明细</span>
                  </div>
                </el-dropdown-item>
                <div class="divider"></div>
                <el-dropdown-item command="logout" class="logout-item">
                  <div class="menu-item-inner">
                    <div class="icon-box red"><el-icon><SwitchButton /></el-icon></div>
                    <span>退出登录</span>
                  </div>
                </el-dropdown-item>
              </div>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
        <el-button v-else type="primary" size="small" round class="!bg-indigo-600" @click="router.push('/auth/login')">
          登录 / 注册
        </el-button>
      </div>
    </el-header>

    <el-container class="flex-1 overflow-hidden">
      <el-main class="p-0 relative h-full min-h-0 overflow-hidden flex flex-col transition-colors duration-500" :class="mainBgClass">
        <div v-if="runtimeError" class="absolute top-4 left-4 right-4 z-50 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-lg">
          {{ runtimeError }}
        </div>
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <div :key="$route.path" class="flex-1 flex flex-col min-h-0 h-full">
              <component :is="Component" :is-light="isLight" class="flex-1 flex flex-col min-h-0 h-full w-full" />
            </div>
          </transition>
        </router-view>
      </el-main>
    </el-container>

    <!-- 个人信息修改弹窗 -->
    <el-dialog
      v-model="showProfileDialog"
      title="个人信息设置"
      width="460px"
      class="custom-dialog-v4 profile-settings-dialog"
      align-center
    >
      <div class="profile-settings-content">
        <!-- 装饰性背景 -->
        <div class="dialog-bg-decor"></div>
        
        <!-- 头像编辑区 -->
        <div class="avatar-edit-section">
          <div class="avatar-main-view">
            <!-- 当前头像/预览头像容器 -->
            <div class="avatar-wrapper-outer" :class="{ 'is-preview': !!aiPreviewAvatar }">
              <div class="avatar-container" v-loading="isGeneratingAvatar" element-loading-background="rgba(255, 255, 255, 0.8)">
                <el-avatar :size="120" :src="aiPreviewAvatar || profileForm.avatar" class="profile-preview-avatar">
                  <el-icon :size="48"><User /></el-icon>
                </el-avatar>
                
                <!-- AI 生成完成后的确认遮罩 -->
                <div v-if="aiPreviewAvatar && !isGeneratingAvatar" class="preview-confirm-overlay">
                  <el-button type="primary" size="small" circle :icon="Check" @click="useAiAvatar" class="confirm-btn" />
                  <el-button type="info" size="small" circle :icon="Refresh" @click="generateAiAvatar" class="retry-btn" />
                </div>
              </div>
            </div>

            <!-- 操作按钮组 -->
            <div class="avatar-action-bar">
              <el-upload
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleAvatarUpload"
              >
                <el-button class="glass-btn">
                  <el-icon class="mr-1"><Upload /></el-icon> 上传图片
                </el-button>
              </el-upload>
              <el-button class="magic-btn" @click="generateAiAvatar" :loading="isGeneratingAvatar">
                <el-icon class="mr-1"><MagicStick /></el-icon> AI 创作
              </el-button>
            </div>
          </div>
          <p class="avatar-status-text">
            {{ aiPreviewAvatar ? 'AI 已为您生成预览，点击确认应用' : '个性化您的创作者形象' }}
          </p>
        </div>

        <el-form :model="profileForm" label-position="top" class="form-container">
          <el-form-item label="我的昵称">
            <el-input 
              v-model="profileForm.name" 
              placeholder="请输入您的闪亮昵称" 
              size="large" 
              class="modern-input-v2"
            >
              <template #prefix><el-icon class="text-indigo-500"><Edit /></el-icon></template>
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer-v4">
          <el-button round @click="showProfileDialog = false" class="cancel-btn">返回</el-button>
          <el-button 
            type="primary" 
            round 
            class="save-btn" 
            @click="updateProfile"
          >
            保存设置
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Task List Drawer: Redesigned for C-end -->
    <el-drawer
      v-model="showTaskList"
      direction="rtl"
      size="480px"
      custom-class="c-end-drawer"
      :with-header="false"
    >
      <div class="flex flex-col h-full relative px-6 pt-6 pb-4">
        <!-- Close Button -->
        <button 
          @click="showTaskList = false"
          class="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all z-20"
        >
          <el-icon :size="16"><Close /></el-icon>
        </button>

        <!-- Header Info -->
        <div class="mb-5">
          <div class="flex items-baseline gap-2 mb-1">
            <h2 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">任务中心</h2>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TASK CENTER</span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">共 <span class="text-indigo-600 dark:text-indigo-400 font-black">{{ groupedEpisodes.length }}</span> 集 · <span class="text-indigo-600 dark:text-indigo-400 font-black">{{ episodeStore.tasks.length }}</span> 项任务</p>
        </div>

                <!-- Task List Area: Grouped by Episode -->
        <div class="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3">
          <div v-if="episodeStore.tasks.length === 0" class="flex flex-col items-center justify-center py-20 opacity-20 dark:opacity-10">
            <el-icon :size="48"><Box /></el-icon>
            <p class="mt-3 text-sm font-black tracking-widest uppercase">暂无任务</p>
          </div>

          <!-- Episode Group Card -->
          <div 
            v-for="group in groupedEpisodes"
            :key="group.episodeId"
            class="rounded-xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 overflow-hidden"
          >
            <!-- Episode Header (clickable to expand) -->
            <div 
              @click="toggleEpisode(group.episodeId)"
              class="relative p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
            >
              <div class="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-all duration-700" :class="getEpisodeStatusColor(group)"></div>
              <div class="relative z-10 pl-2">
                <div class="flex items-center justify-between gap-2 mb-1.5">
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="text-[10px] font-black text-indigo-500 dark:text-indigo-400 truncate">{{ group.dramaTitle }}</span>
                    <span class="text-[10px] font-black text-slate-400">|</span>
                    <span class="text-[11px] font-black text-slate-700 dark:text-slate-200 truncate">{{ group.episodeTitle }}</span>
                  </div>
                  <div class="flex items-center gap-1.5 shrink-0">
                    <div :class="['px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider', getEpisodeStatusBadge(group)]">{{ getEpisodeStatusText(group) }}</div>
                    <el-icon :size="12" class="text-slate-400 transition-transform duration-300" :class="{ 'rotate-90': expandedEpisodes.includes(group.episodeId) }"><ArrowRight /></el-icon>
                  </div>
                </div>
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-[9px] font-bold text-slate-400 dark:text-slate-500">{{ group.sceneTasks.length }} 个分镜</span>
                  <div class="flex items-center gap-0.5 ml-1">
                    <div v-for="i in group.completedCount" :key="'s'+i" class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <div v-for="i in group.failedCount" :key="'f'+i" class="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                    <div v-for="i in group.processingCount" :key="'p'+i" class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                    <div v-for="i in group.pendingCount" :key="'q'+i" class="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                  </div>
                </div>
                <div class="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1.5">
                  <div class="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-indigo-500 to-purple-500" :style="{ width: group.overallProgress + '%' }"></div>
                </div>
              </div>
            </div>

            <!-- Expandable Scene Detail Panel -->
            <div v-show="expandedEpisodes.includes(group.episodeId)" class="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <div class="p-2 space-y-1.5">
                <div 
                  v-for="scene in group.sceneTasks" 
                  :key="scene.id" 
                  class="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
                >
                  <div class="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg text-[10px] font-black" :class="getSceneBadgeClass(scene)">{{ scene.sceneIndex }}</div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1.5">
                      <span class="text-[10px] font-bold text-slate-600 dark:text-slate-300">分镜 #{{ scene.sceneIndex }}</span>
                      <span v-if="scene.taskSource" class="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">{{ getTaskSourceLabel(scene.taskSource) }}</span>
                    </div>
                    <div class="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-0.5">
                      <div class="h-full rounded-full transition-all duration-700" :class="getSceneProgressColor(scene)" :style="{ width: scene.progress + '%' }"></div>
                    </div>
                  </div>
                  <div :class="['px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider flex-shrink-0', getSceneStatusClass(scene)]">
                    {{ scene.status === 'processing' ? '生成中' : scene.status === 'completed' ? '成功' : scene.status === 'failed' ? '失败' : '排队' }}
                  </div>
                  <button 
                    v-if="scene.status === 'completed' || scene.status === 'failed'" 
                    @click.stop="handleRegenerateScene(scene)" 
                    class="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-500 transition-all flex-shrink-0"
                    title="重新生成"
                  >
                    <el-icon :size="13"><RefreshRight /></el-icon>
                  </button>
                </div>
                <div class="flex items-center justify-between gap-2 px-2 py-1.5">
                  <button @click="handleRegenerateFailed(group)" :disabled="group.failedCount === 0" class="text-[10px] font-bold text-red-500 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">重新生成失败分镜({{ group.failedCount }})</button>
                  <button @click="handleRegenerateAll(group)" class="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 transition-colors">重新生成全部</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Actions -->
        <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between">
          <button @click="clearCompletedTasks" class="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">清除已完成任务</button>
          <button @click="clearAllTasks" class="text-[10px] font-bold text-red-400 hover:text-red-600 transition-colors">清除全部</button>
        </div>
      </div>
    </el-drawer>
  </el-container>
</template>

<script setup lang="ts">
import { ref, reactive, provide, computed, onErrorCaptured, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  VideoPlay, User, SwitchButton, Connection, ArrowDown, MagicStick, Upload, 
  Edit, Check, Refresh, Sunny, Moon, GoldMedal, List, Box, Warning, RefreshRight, Coin, ArrowRight
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useDramaStore } from '@/store/drama'
import { useEpisodeStore } from '@/store/episode'
import { useUserStore } from '@/store/user'
import { useThemeStore } from '@/store/theme'
import { taskQueueManager } from '@/utils/taskQueue'

const runtimeError = ref<string | null>(null)
const router = useRouter()

const isAuthPage = computed(() => {
  return ['login', 'sso-auth'].includes(router.currentRoute.value.name as string)
})

const dramaStore = useDramaStore()
const episodeStore = useEpisodeStore()
const userStore = useUserStore()
const themeStore = useThemeStore()
const isLight = computed(() => themeStore.isLight)

// Task Center State
const showTaskList = ref(false)
const expandedEpisodes = ref<string[]>([])
const activeTaskCount = computed(() => episodeStore.tasks.filter(t => t.status === 'processing' || t.status === 'queued').length)

const groupedEpisodes = computed(() => {
  const groups: Record<string, any> = {}
  for (const task of episodeStore.tasks) {
    const key = task.episodeId
    if (!groups[key]) {
      groups[key] = { episodeId: task.episodeId, dramaTitle: task.dramaTitle, episodeTitle: task.episodeTitle, sceneTasks: [] }
    }
    groups[key].sceneTasks.push(task)
  }
  return Object.values(groups).map(group => {
    group.sceneTasks.sort((a: any, b: any) => (a.sceneIndex || 0) - (b.sceneIndex || 0))
    group.completedCount = group.sceneTasks.filter((t: any) => t.status === 'completed').length
    group.failedCount = group.sceneTasks.filter((t: any) => t.status === 'failed').length
    group.processingCount = group.sceneTasks.filter((t: any) => t.status === 'processing').length
    group.pendingCount = group.sceneTasks.filter((t: any) => t.status === 'queued' || t.status === 'pending').length
    const total = group.sceneTasks.length
    group.overallProgress = total > 0 ? Math.round(group.sceneTasks.reduce((sum: number, t: any) => sum + t.progress, 0) / total) : 0
    return group
  })
})

const toggleEpisode = (episodeId: string) => {
  const idx = expandedEpisodes.value.indexOf(episodeId)
  if (idx > -1) { expandedEpisodes.value.splice(idx, 1) } else { expandedEpisodes.value.push(episodeId) }
}
const getEpisodeStatusColor = (g: any) => g.processingCount > 0 ? 'bg-indigo-500' : g.failedCount > 0 ? 'bg-red-500' : g.completedCount === g.sceneTasks.length ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
const getEpisodeStatusBadge = (g: any) => g.processingCount > 0 ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 animate-pulse' : g.failedCount > 0 ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' : g.completedCount === g.sceneTasks.length ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
const getEpisodeStatusText = (g: any) => g.processingCount > 0 ? '生成中' : g.failedCount > 0 ? '部分失败' : g.completedCount === g.sceneTasks.length ? '已完成' : '排队中'
const getSceneBadgeClass = (s: any) => s.status === 'completed' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' : s.status === 'failed' ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' : s.status === 'processing' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
const getSceneProgressColor = (s: any) => s.status === 'processing' ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : s.status === 'completed' ? 'bg-emerald-500' : s.status === 'failed' ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-700'
const getSceneStatusClass = (s: any) => s.status === 'processing' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 animate-pulse' : s.status === 'completed' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' : s.status === 'failed' ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
const getTaskSourceLabel = (src: string) => ({'episodes-batch':'批量','episodes-single':'单集','storyboard-single':'单分镜','storyboard-batch':'批量分镜','storyboard-timeline':'时间轴','storyboard-history':'历史','video-batch':'视频批量','video-single':'视频单分镜','regenerate':'重新生成'})[src] || ''

const getPosterUrl = (ep: any) => {
  if (!ep) return 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cinematic+movie+poster+placeholder&image_size=portrait_4_3'
  return ep.poster || `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(ep.title + ' cinematic movie poster')}&image_size=portrait_4_3`
}

const handleRegenerate = (task: any) => {
  const ep = episodeStore.episodes.find(e => e.id === task.episodeId)
  if (!ep) return

  ElMessage.info(`重新提交任务：第 ${ep.index} 集 ${task.type === 'storyboard' ? '分镜生成' : '全集合成'}`)
  
  taskQueueManager.addTask({
    id: `task-${ep.id}-${task.type}-${Date.now()}`,
    episodeId: ep.id,
    dramaTitle: task.dramaTitle || episodeStore.currentDramaTitle,
    episodeTitle: task.episodeTitle || ep.title || `第 ${ep.index} 集`,
    episodeIndex: ep.index,
    type: task.type,
    priority: 1,
    execute: async () => {
      if (task.type === 'storyboard') {
        await handleGenerate(ep)
      } else {
        await handleSynthesis(ep)
      }
    }
  })
}

// Regenerate a single scene
const handleRegenerateScene = (scene: any) => {
  ElMessage.info(`重新生成分镜 #${scene.sceneIndex}`)
  taskQueueManager.addTask({
    id: `task-${scene.episodeId}-scene-${scene.sceneIndex}-${Date.now()}`,
    episodeId: scene.episodeId,
    dramaTitle: scene.dramaTitle || episodeStore.currentDramaTitle,
    episodeTitle: scene.episodeTitle || `第 ${scene.episodeIndex || 1} 集`,
    episodeIndex: scene.episodeIndex || 1,
    sceneIndex: scene.sceneIndex,
    taskSource: 'regenerate',
    type: 'storyboard-scene',
    priority: 2,
    execute: async () => { await new Promise(r => setTimeout(r, 2000)) }
  })
}

// Regenerate failed scenes
const handleRegenerateFailed = (group: any) => {
  if (group.failedCount === 0) return
  ElMessage.info(`重新生成第 ${group.episodeIndex || 1} 集 ${group.failedCount} 个失败分镜`)
  group.sceneTasks.filter((s: any) => s.status === 'failed').forEach((scene: any) => {
    taskQueueManager.addTask({
      id: `task-${scene.episodeId}-scene-${scene.sceneIndex}-${Date.now()}`,
      episodeId: scene.episodeId,
      dramaTitle: scene.dramaTitle || episodeStore.currentDramaTitle,
      episodeTitle: scene.episodeTitle || `第 ${scene.episodeIndex || 1} 集`,
      episodeIndex: scene.episodeIndex || 1,
      sceneIndex: scene.sceneIndex,
      taskSource: 'regenerate',
      type: 'storyboard-scene',
      priority: 2,
      execute: async () => { await new Promise(r => setTimeout(r, 2000)) }
    })
  })
}

// Regenerate all scenes
const handleRegenerateAll = (group: any) => {
  ElMessage.info(`重新生成第 ${group.episodeIndex || 1} 集全部 ${group.sceneTasks.length} 个分镜`)
  group.sceneTasks.forEach((scene: any) => {
    taskQueueManager.addTask({
      id: `task-${scene.episodeId}-scene-${scene.sceneIndex}-${Date.now()}`,
      episodeId: scene.episodeId,
      dramaTitle: scene.dramaTitle || episodeStore.currentDramaTitle,
      episodeTitle: scene.episodeTitle || `第 ${scene.episodeIndex || 1} 集`,
      episodeIndex: scene.episodeIndex || 1,
      sceneIndex: scene.sceneIndex,
      taskSource: 'regenerate',
      type: 'storyboard-scene',
      priority: 1,
      execute: async () => { await new Promise(r => setTimeout(r, 2000)) }
    })
  })
}

// Clear tasks
const clearCompletedTasks = () => {
  const ids = episodeStore.tasks.filter((t: any) => t.status === 'completed').map((t: any) => t.id)
  ids.forEach((id: string) => taskQueueManager.removeTask(id))
  ElMessage.success(`已清除 ${ids.length} 个已完成任务`)
}
const clearAllTasks = () => {
  episodeStore.tasks.slice().forEach((t: any) => taskQueueManager.removeTask(t.id))
  ElMessage.success('已清除全部任务')
}

const handleGenerate = async (ep: any) => {
  const task = episodeStore.tasks.find(t => t.episodeId === ep.id && t.type === 'storyboard')
  
  episodeStore.updateEpisode(ep.id, { 
    status: 'generating',
    storyboardStatus: 'generating' 
  })
  
  try {
    const steps = 5
    for (let i = 1; i <= steps; i++) {
      if (task) task.sceneIndex = i
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (i === 3 && Math.random() < 0.1) {
            reject(new Error('AI 模型计算资源紧张，请重试'))
          } else {
            resolve(true)
          }
        }, 1200)
      })
      const progress = Math.round((i / steps) * 100)
      if (task) task.progress = progress
    }
    
    episodeStore.updateEpisode(ep.id, { 
      status: 'success', 
      storyboardStatus: 'success',
      storyboardGenerated: true 
    })
    if (task) task.sceneIndex = undefined
  } catch (error: any) {
    episodeStore.updateEpisode(ep.id, { 
      status: 'failed', 
      storyboardStatus: 'failed',
      errorReason: error.message 
    })
    throw error
  }
}

const handleSynthesis = async (ep: any) => {
  const task = episodeStore.tasks.find(t => t.episodeId === ep.id && t.type === 'synthesis')
  episodeStore.updateEpisode(ep.id, { synthesisStatus: 'synthesizing' })
  
  try {
    const steps = 5
    for (let i = 1; i <= steps; i++) {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (i === 4 && Math.random() < 0.15) {
            reject(new Error('视频渲染引擎连接超时，请重试'))
          } else {
            resolve(true)
          }
        }, 1000)
      })
      const progress = Math.round((i / steps) * 100)
      if (task) task.progress = progress
    }
    
    episodeStore.updateEpisode(ep.id, { 
      synthesisStatus: 'success',
      synthesisVideo: 'https://www.w3schools.com/html/movie.mp4'
    })
  } catch (error: any) {
    episodeStore.updateEpisode(ep.id, { synthesisStatus: 'failed' })
    throw error
  }
}

const showProfileDialog = ref(false)
const isGeneratingAvatar = ref(false)
const aiPreviewAvatar = ref('') // AI 生成的预览头像
const profileForm = reactive({
  name: '',
  avatar: ''
})

const handleCommand = (command: string) => {
  if (command === 'logout') {
    userStore.logout()
    router.push('/auth/login')
  } else if (command === 'profile') {
    profileForm.name = userStore.userInfo?.name || ''
    profileForm.avatar = userStore.userInfo?.avatar || ''
    aiPreviewAvatar.value = ''
    showProfileDialog.value = true
  } else if (command === 'team') {
    router.push('/team-management')
  } else if (command === 'member-center') {
    router.push('/member-center')
  } else if (command === 'consumption') {
    router.push('/member-center/consumption')
  }
}

const generateAiAvatar = async () => {
  isGeneratingAvatar.value = true
  // 模拟 AI 生成过程
  setTimeout(() => {
    const randomId = Math.floor(Math.random() * 1000)
    aiPreviewAvatar.value = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomId}`
    isGeneratingAvatar.value = false
    ElMessage.success('AI 已为您创作了一个新头像')
  }, 1500)
}

const useAiAvatar = () => {
  if (aiPreviewAvatar.value) {
    profileForm.avatar = aiPreviewAvatar.value
    aiPreviewAvatar.value = ''
    ElMessage.success('已应用新头像')
  }
}

const handleAvatarUpload = (file: any) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    profileForm.avatar = e.target?.result as string
    aiPreviewAvatar.value = '' // 清除预览
    ElMessage.success('头像上传成功')
  }
  reader.readAsDataURL(file.raw)
}

const updateProfile = () => {
  if (userStore.userInfo) {
    userStore.setUserInfo({
      ...userStore.userInfo,
      name: profileForm.name,
      avatar: profileForm.avatar
    })
    ElMessage.success('个人信息已更新')
    showProfileDialog.value = false
  }
}

onMounted(() => {
  // Migrate legacy 'storyboard' type tasks to 'storyboard-scene' with sceneIndex
  const legacyTasks = episodeStore.tasks.filter((t: any) => t.type === 'storyboard')
  legacyTasks.forEach((task: any) => {
    const idx = episodeStore.tasks.findIndex((t: any) => t.id === task.id)
    if (idx > -1) episodeStore.tasks.splice(idx, 1)
    for (let i = 1; i <= 6; i++) {
      episodeStore.tasks.push({
        ...task,
        id: `task-${task.episodeId}-scene-${i}-migrated`,
        sceneIndex: i,
        taskSource: task.taskSource || 'episodes-batch',
        type: 'storyboard-scene',
        status: task.status === 'completed' ? 'completed' : task.status,
        progress: task.status === 'completed' ? 100 : task.progress,
        execute: async () => {}
      })
    }
  })
  episodeStore.saveToLocalStorage()

  // Save state before window closes or refreshes
  window.addEventListener('beforeunload', () => {
    dramaStore.saveToLocalStorage()
    episodeStore.saveToLocalStorage()
  })
})

const mainBgClass = computed(() => {
  if (isLight.value) {
    return 'bg-[#f5f6fb]'
  }
  return 'bg-slate-950'
})

provide('isLight', isLight)
provide('theme', computed(() => themeStore.theme))

onErrorCaptured((error) => {
  runtimeError.value = error instanceof Error ? error.message : String(error)
  return false
})
</script>

<style>
/* Global C-end UI Styles */
.custom-steps .el-step__title {
  font-size: 13px;
  font-weight: 800;
  color: #94a3b8 !important;
}
.custom-steps .el-step__title.is-success {
  color: #6366f1 !important;
}
.custom-steps .el-step__title.is-process {
  color: #1e293b !important;
  font-weight: 900;
}
.custom-steps .el-step__head.is-success {
  color: #6366f1 !important;
  border-color: #6366f1 !important;
}
.custom-steps .el-step__head.is-process {
  color: #6366f1 !important;
  border-color: #6366f1 !important;
}
.custom-steps .el-step__head.is-process .el-step__icon.is-text {
  background-color: #6366f1;
  color: #fff;
}

.custom-textarea-round .el-textarea__inner {
  border-radius: 16px !important;
  padding: 12px 16px !important;
  border: 1px solid #e2e8f0 !important;
  background-color: #f8fafc !important;
  transition: all 0.3s !important;
}
.custom-textarea-round .el-textarea__inner:focus {
  border-color: #6366f1 !important;
  background-color: #fff !important;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
}

.custom-select-round .el-input__wrapper {
  border-radius: 12px !important;
  padding: 4px 12px !important;
  border: 1px solid #e2e8f0 !important;
  background-color: #f8fafc !important;
  box-shadow: none !important;
}
.custom-select-round .el-input__wrapper.is-focus {
  border-color: #6366f1 !important;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
}

.custom-search-input .el-input__wrapper {
  border-radius: 20px !important;
  padding: 2px 16px !important;
  background-color: #f1f5f9 !important;
  border: 1px solid transparent !important;
}
.custom-search-input .el-input__wrapper.is-focus {
  background-color: #fff !important;
  border-color: #6366f1 !important;
}

.custom-input-large .el-input__wrapper {
  height: 48px !important;
  border-radius: 12px 0 0 12px !important;
}

.custom-input-large .el-input-group__append {
  border-radius: 0 12px 12px 0 !important;
  background-color: #6366f1 !important;
  color: #fff !important;
  border: none !important;
}

.custom-select-transparent .el-input__wrapper {
  background-color: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
}
.custom-select-transparent .el-input__inner {
  font-weight: 700 !important;
  color: inherit !important;
}

/* Animations */
@keyframes pulse-indigo {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
.animate-pulse-indigo {
  animation: pulse-indigo 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.menu-item-hover:hover {
  background-color: rgba(79, 70, 229, 0.1) !important;
  color: #6366f1 !important;
}
.menu-item-hover.is-active {
  background-color: rgba(79, 70, 229, 0.1) !important;
  border-right: 3px solid #6366f1;
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-thumb {
  background: #94a3b8;
  border-radius: 3px;
}
::-webkit-scrollbar-track {
  background: transparent;
}

/* Custom Header Select Styling */
.custom-header-select .el-select__wrapper {
  background-color: transparent !important;
  box-shadow: none !important;
  padding: 0 8px !important;
}
.custom-header-select .el-select__wrapper:hover,
.custom-header-select .el-select__wrapper.is-focused {
  box-shadow: none !important;
}
.custom-header-select .el-select__placeholder {
  font-weight: 500;
}
.custom-header-select .el-select__suffix {
  color: #94a3b8;
}

.modern-input .el-input__wrapper {
  background-color: #f8fafc;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: none;
  transition: all 0.3s;
}
.modern-input .el-input__wrapper.is-focus {
  background-color: #fff;
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.user-dropdown-v4 {
  border-radius: 24px !important;
  padding: 0 !important;
  border: none !important;
  box-shadow: 0 20px 50px rgba(0,0,0,0.15) !important;
  overflow: hidden;
  width: 260px;
}

.user-dropdown-header {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid #e2e8f0;

  .avatar-wrapper {
    flex-shrink: 0;
  }

  .user-info-wrapper {
    overflow: hidden;
    .name {
      margin: 0;
      font-size: 16px;
      font-weight: 900;
      color: #1e293b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .role {
      margin: 4px 0 0;
      font-size: 11px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .balance-tag {
      margin-top: 8px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 10px;
      color: #d97706;
      font-size: 14px;
      font-weight: 900;
      box-shadow: 0 2px 10px rgba(245, 158, 11, 0.1);
      
      .el-icon {
        font-size: 16px;
      }
    }
  }
}

.dropdown-content {
  padding: 12px;

  .el-dropdown-menu__item {
    padding: 0 !important;
    background: transparent !important;
    margin: 4px 0;

    &:hover, &:focus {
      outline: none;
      background: transparent !important;
      .menu-item-inner {
        background-color: #f8fafc;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        transform: translateX(4px);
        
        .icon-box {
          transform: scale(1.1);
          &.blue { background-color: #3b82f6; color: white; }
          &.purple { background-color: #8b5cf6; color: white; }
          &.gold { background-color: #f59e0b; color: white; }
          &.amber { background-color: #f59e0b; color: white; }
          &.red { background-color: #ef4444; color: white; }
        }
      }
    }
  }

  .menu-item-inner {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 14px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    width: 100%;

    span {
      font-size: 14px;
      font-weight: 600;
      color: #475569;
    }

    .icon-box {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      
      &.blue { background-color: #eff6ff; color: #3b82f6; }
      &.purple { background-color: #f5f3ff; color: #8b5cf6; }
      &.gold { background-color: #fffbeb; color: #f59e0b; }
      &.amber { background-color: #fffbeb; color: #f59e0b; }
      &.red { background-color: #fef2f2; color: #ef4444; }

      .el-icon {
        font-size: 16px;
      }
    }
  }

  .divider {
    height: 1px;
    background-color: #f1f5f9;
    margin: 8px 12px;
  }

  .logout-item {
    span { color: #ef4444 !important; }
  }
}

.custom-dialog-v4 .el-dialog {
  border-radius: 24px !important;
  overflow: hidden !important;
}
.custom-dialog-v4 .el-dialog__header {
  margin-right: 0 !important;
  padding: 24px 24px 10px !important;
}
.custom-dialog-v4 .el-dialog__title {
  font-size: 18px !important;
  font-weight: 900 !important;
}
.custom-dialog-v4 .el-dialog__body {
  padding: 24px !important;
}

.modern-input-v2 .el-input__wrapper {
  background-color: #f8fafc;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding-left: 16px;
  height: 56px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.modern-input-v2 .el-input__wrapper.is-focus {
  background-color: #fff;
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1), 0 4px 12px rgba(99, 102, 241, 0.05);
  transform: translateY(-1px);
}

/* 个人资料弹窗专项样式 */
.profile-settings-dialog .el-dialog {
  background: #f8fafc;
  border: none;
  border-radius: 32px !important;
  box-shadow: 0 30px 60px rgba(0,0,0,0.12) !important;
  overflow: hidden;
}

.profile-settings-dialog .el-dialog__header {
  background: white;
  margin: 0 !important;
  padding: 24px 32px !important;
  border-bottom: 1px solid #f1f5f9;
}

.profile-settings-dialog {
  .profile-settings-content {
    padding: 32px;
    position: relative;
    z-index: 1;
  }

  .dialog-bg-decor {
    position: absolute;
    top: 0;
    right: 0;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle at 70% 30%, rgba(99, 102, 241, 0.08) 0%, transparent 70%);
    pointer-events: none;
    z-index: -1;
  }

  .avatar-edit-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 32px;

    .avatar-main-view {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }

    .avatar-wrapper-outer {
      padding: 10px;
      background: white;
      border-radius: 40px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.04);
      transition: all 0.4s ease;

      &.is-preview {
        background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%);
        box-shadow: 0 15px 35px rgba(99, 102, 241, 0.15);
        transform: scale(1.05);
      }
    }

    .avatar-container {
      position: relative;
      border-radius: 32px;
      overflow: hidden;

      .profile-preview-avatar {
        background: #f1f5f9;
        border: 2px solid white;
      }

      .preview-confirm-overlay {
        position: absolute;
        inset: 0;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(2px);
        display: flex;
        align-items: flex-end;
        justify-content: center;
        gap: 20px;
        padding-bottom: 12px;
        animation: fadeIn 0.3s ease;
        background: linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%);

        .confirm-btn {
          width: 36px;
          height: 36px;
          background: #10b981;
          border: none;
          font-size: 18px;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
          &:hover { transform: scale(1.1) translateY(-2px); }
        }

        .retry-btn {
          width: 36px;
          height: 36px;
          background: white;
          border: none;
          color: #64748b;
          font-size: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          &:hover { background: #f8fafc; transform: scale(1.1) translateY(-2px); }
        }
      }
    }

    .avatar-action-bar {
      display: flex;
      gap: 12px;

      .glass-btn {
        height: 42px;
        padding: 0 20px;
        border-radius: 14px;
        background: white;
        border: 1px solid #e2e8f0;
        color: #64748b;
        font-weight: 600;
        box-shadow: 0 4px 6px rgba(0,0,0,0.02);
        &:hover { border-color: #cbd5e1; color: #475569; }
      }

      .magic-btn {
        height: 42px;
        padding: 0 20px;
        border-radius: 14px;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        border: none;
        color: white;
        font-weight: 700;
        box-shadow: 0 6px 15px rgba(99, 102, 241, 0.25);
        &:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3); }
      }
    }

    .avatar-status-text {
      margin-top: 16px;
      font-size: 13px;
      color: #94a3b8;
      font-weight: 500;
    }
  }

  .form-container {
    background: white;
    padding: 24px;
    border-radius: 24px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.02);
  }

  .el-form-item__label {
    font-size: 14px;
    font-weight: 800;
    color: #64748b;
    margin-bottom: 8px !important;
    padding-left: 4px;
  }

  .dialog-footer-v4 {
    background: white;
    padding: 20px 32px 32px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    .cancel-btn {
      height: 48px;
      padding: 0 28px;
      font-weight: 600;
      color: #94a3b8;
      border: 1px solid #e2e8f0;
      &:hover { background: #f8fafc; color: #64748b; }
    }

    .save-btn {
      height: 48px;
      padding: 0 36px;
      font-weight: 700;
      background: #1e293b;
      border: none;
      box-shadow: 0 10px 20px rgba(30, 41, 59, 0.15);
      &:hover { background: #0f172a; transform: translateY(-1px); }
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes progress-bar-stripes {
  from { background-position: 20px 0; }
  to { background-position: 0 0; }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #475569;
}

:deep(.c-end-drawer) {
  background: rgba(255, 255, 255, 0.7) !important;
  backdrop-filter: blur(40px) saturate(180%) !important;
  border-left: 1px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow: -20px 0 80px rgba(0, 0, 0, 0.1) !important;
}

.dark :deep(.c-end-drawer) {
  background: rgba(15, 23, 42, 0.7) !important;
  border-left: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.c-end-pagination :deep(.el-pager li) {
  background: white !important;
  border-radius: 10px;
  margin: 0 3px;
  font-weight: 800;
  color: #64748b;
  box-shadow: 0 2px 5px rgba(0,0,0,0.02);
  transition: all 0.3s;
}

.dark .c-end-pagination :deep(.el-pager li) {
  background: #1e293b !important;
  color: #94a3b8;
}

.c-end-pagination :deep(.el-pager li.is-active) {
  background: #6366f1 !important;
  color: white !important;
  transform: scale(1.1);
  box-shadow: 0 5px 15px rgba(99, 102, 241, 0.3);
}

.dark {
  .user-dropdown-v4 {
    background: #0f172a !important;
    border: 1px solid #334155 !important;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35) !important;
  }

  .user-dropdown-header {
    background: linear-gradient(135deg, #111827 0%, #0f172a 100%);
    border-bottom-color: #334155;

    .user-info-wrapper {
      .name {
        color: #f8fafc;
      }

      .role {
        color: #94a3b8;
      }
    }
  }

  .dropdown-content {
    .menu-item-inner {
      span {
        color: #cbd5e1;
      }

      .icon-box {
        &.blue { background-color: rgba(59, 130, 246, 0.15); color: #60a5fa; }
        &.purple { background-color: rgba(139, 92, 246, 0.15); color: #a78bfa; }
        &.gold { background-color: rgba(245, 158, 11, 0.18); color: #fbbf24; }
        &.amber { background-color: rgba(245, 158, 11, 0.18); color: #fbbf24; }
        &.red { background-color: rgba(239, 68, 68, 0.15); color: #f87171; }
      }
    }

    .divider {
      background-color: #334155;
    }

    .el-dropdown-menu__item {
      &:hover, &:focus {
        outline: none;
        background: transparent !important;
        .menu-item-inner {
          background-color: #1e293b !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          transform: translateX(4px);

          span {
            color: #ffffff !important;
          }

          .icon-box {
            &.blue { background-color: #3b82f6 !important; color: #ffffff !important; }
            &.purple { background-color: #8b5cf6 !important; color: #ffffff !important; }
            &.gold { background-color: #f59e0b !important; color: #ffffff !important; }
            &.amber { background-color: #f59e0b !important; color: #ffffff !important; }
            &.red { background-color: #ef4444 !important; color: #ffffff !important; }
          }
        }
      }
    }
  }

  .profile-settings-dialog {
    .el-dialog {
      background: #0f172a;
      border: 1px solid #334155;
    }

    .el-dialog__header {
      background: #111827;
      border-bottom-color: #334155;
    }

    .avatar-wrapper-outer,
    .form-container,
    .dialog-footer-v4,
    .avatar-action-bar .glass-btn {
      background: #111827;
      border-color: #334155;
      color: #cbd5e1;
    }

    .avatar-status-text,
    .el-form-item__label,
    .dialog-footer-v4 .cancel-btn {
      color: #94a3b8;
    }

    .dialog-footer-v4 .cancel-btn {
      border-color: #334155;
    }

    .avatar-container {
      .profile-preview-avatar {
        background: #1e293b;
        border-color: #334155;
      }

      .preview-confirm-overlay {
        background: linear-gradient(to top, rgba(2, 6, 23, 0.65) 0%, transparent 60%);

        .retry-btn {
          background: #1e293b;
          color: #cbd5e1;
        }
      }
    }
  }
}
</style>