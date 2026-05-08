<template>
  <div class="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
    <!-- 背景装饰 -->
    <div class="absolute inset-0 z-0">
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-600/10 rounded-full blur-[160px]"></div>
    </div>

    <div class="relative z-10 text-center max-w-sm w-full">
      <div class="mb-8 flex justify-center">
        <div class="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 animate-bounce">
          <el-icon class="text-4xl text-white"><Loading /></el-icon>
        </div>
      </div>
      
      <h1 class="text-3xl font-bold text-white mb-4 tracking-tight">智影</h1>
      <h2 class="text-xl font-medium text-slate-300 mb-2">安全验证中...</h2>
      <p class="text-slate-500 text-sm leading-relaxed">
        正在同步来自恒智易平台的账号信息，请稍候
      </p>

      <!-- 进度条装饰 -->
      <div class="mt-8 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div class="h-full bg-blue-500 rounded-full animate-progress shadow-[0_0_12px_rgba(59,130,246,0.5)]"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

onMounted(async () => {
  const token = route.query.token as string
  if (token) {
    try {
      // 模拟一点延迟以展示精美的加载动画
      await new Promise(resolve => setTimeout(resolve, 1500))
      await userStore.ssoLogin(token)
      ElMessage({
          message: '认证成功，正在进入智影',
          type: 'success',
          duration: 2000
        })
        router.replace('/ai-short-drama-creator/new')
      } catch (error) {
      ElMessage.error('认证失败，请重新登录')
      router.replace('/auth/login')
    }
  } else {
    ElMessage.error('无效的访问请求')
    router.replace('/auth/login')
  }
})
</script>

<style scoped>
@keyframes progress {
  0% { width: 0%; transform: translateX(-100%); }
  50% { width: 70%; transform: translateX(0); }
  100% { width: 100%; transform: translateX(100%); }
}

.animate-progress {
  animation: progress 2s infinite ease-in-out;
}
</style>
