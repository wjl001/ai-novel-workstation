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
                </div>
              </div>
              <div class="dropdown-content">
                <el-dropdown-item command="profile">
                  <div class="menu-item-inner">
                    <div class="icon-box blue"><el-icon><User /></el-icon></div>
                    <span>个人中心</span>
                  </div>
                </el-dropdown-item>
                <el-dropdown-item command="team">
                  <div class="menu-item-inner">
                    <div class="icon-box purple"><el-icon><Connection /></el-icon></div>
                    <span>团队管理</span>
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
  </el-container>
</template>

<script setup lang="ts">
import { ref, reactive, provide, computed, onErrorCaptured, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { VideoPlay, User, SwitchButton, Connection, ArrowDown, MagicStick, Upload, Edit, Check, Refresh, Sunny, Moon } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useDramaStore } from '@/store/drama'
import { useEpisodeStore } from '@/store/episode'
import { useUserStore } from '@/store/user'
import { useThemeStore } from '@/store/theme'

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

/* 个人中心弹窗专项样式 */
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
