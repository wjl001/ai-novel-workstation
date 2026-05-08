<template>
  <div class="login-container min-h-screen flex items-center justify-center p-4">
    <!-- 动态背景装饰 -->
    <div class="bg-decor absolute inset-0 overflow-hidden pointer-events-none">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <div class="login-card relative z-10 w-full max-w-[1100px] min-h-[600px] flex bg-white/80 backdrop-blur-xl rounded-[32px] shadow-[0_20px_80px_rgba(0,0,0,0.1)] border border-white/50 overflow-hidden">
      <!-- 左侧：品牌展示区 -->
      <div class="hidden lg:flex w-1/2 bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#d946ef] p-12 flex-col justify-between relative overflow-hidden">
        <div class="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        <div class="relative z-10">
          <div class="flex items-center space-x-3 mb-8">
            <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <el-icon class="text-2xl text-[#8b5cf6]"><VideoCamera /></el-icon>
            </div>
            <span class="text-2xl font-black text-white tracking-tight">智影</span>
          </div>
          
          <h1 class="text-5xl font-black text-white leading-tight mb-6">
            智影 <br/>
            <span class="text-white/80">AI 视频创作引擎</span>
          </h1>
          <p class="text-white/70 text-lg leading-relaxed max-w-md">
            连接创意与技术，为影视创作者提供最前沿的 AI 驱动工具集。
          </p>
        </div>

        <div class="relative z-10 grid grid-cols-2 gap-4">
          <div class="feature-item p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
            <div class="text-white font-bold mb-1">AI 编剧</div>
            <div class="text-white/60 text-xs">灵感瞬间爆发</div>
          </div>
          <div class="feature-item p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
            <div class="text-white font-bold mb-1">自动剪辑</div>
            <div class="text-white/60 text-xs">效率提升 10 倍</div>
          </div>
        </div>
      </div>

      <!-- 右侧：登录表单区 -->
      <div class="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-center relative">
        <div class="w-full max-w-[400px] mx-auto">
          <div class="mb-10 text-center lg:text-left">
            <h2 class="text-3xl font-bold text-slate-900 mb-2">
              {{ isRegister ? '加入智影' : '欢迎回来' }}
            </h2>
            <p class="text-slate-500 font-medium">
              {{ isRegister ? '开启您的 AI 创作新篇章' : '请登录您的账号以开始工作' }}
            </p>
          </div>

          <!-- 登录/注册切换 -->
          <div class="custom-tabs-container">
            <el-tabs v-if="!isRegister" v-model="activeTab" class="modern-tabs">
              <!-- 短信登录（默认） -->
              <el-tab-pane label="短信登录" name="sms">
                <el-form ref="smsFormRef" :model="smsForm" :rules="smsRules" class="mt-8 space-y-5">
                  <el-form-item prop="phone">
                    <el-input 
                      v-model="smsForm.phone" 
                      placeholder="请输入手机号" 
                      size="large"
                      class="modern-input"
                    >
                      <template #prefix><el-icon class="text-[#8b5cf6]"><Iphone /></el-icon></template>
                    </el-input>
                  </el-form-item>
                  <el-form-item prop="captcha">
                    <GraphicCaptcha ref="smsCaptchaRef" v-model="smsForm.captcha" />
                  </el-form-item>
                  <el-form-item prop="code">
                    <div class="flex space-x-3 w-full">
                      <el-input 
                        v-model="smsForm.code" 
                        placeholder="验证码" 
                        size="large" 
                        class="flex-1 modern-input"
                      >
                        <template #prefix><el-icon class="text-[#8b5cf6]"><ChatDotRound /></el-icon></template>
                      </el-input>
                      <el-button 
                        size="large" 
                        class="sms-code-btn"
                        :disabled="countdown > 0" 
                        @click="sendSmsCode"
                      >
                        {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
                      </el-button>
                    </div>
                  </el-form-item>
                  <el-form-item>
                    <el-button 
                      type="primary" 
                      class="w-full submit-btn" 
                      size="large" 
                      :loading="loading" 
                      @click="handleSmsLogin"
                    >
                      立即登录
                    </el-button>
                  </el-form-item>
                </el-form>
              </el-tab-pane>

              <!-- 密码登录 -->
              <el-tab-pane label="密码登录" name="password">
                <el-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" class="mt-8 space-y-5">
                  <el-form-item prop="username">
                    <el-input 
                      v-model="pwdForm.username" 
                      placeholder="账号 / 手机号" 
                      size="large"
                      class="modern-input"
                    >
                      <template #prefix><el-icon class="text-[#8b5cf6]"><User /></el-icon></template>
                    </el-input>
                  </el-form-item>
                  <el-form-item prop="password">
                    <el-input 
                      v-model="pwdForm.password" 
                      type="password" 
                      placeholder="请输入密码" 
                      show-password 
                      size="large"
                      class="modern-input"
                    >
                      <template #prefix><el-icon class="text-[#8b5cf6]"><Lock /></el-icon></template>
                    </el-input>
                  </el-form-item>
                  <el-form-item prop="captcha">
                    <GraphicCaptcha ref="pwdCaptchaRef" v-model="pwdForm.captcha" />
                  </el-form-item>
                  <div class="flex items-center justify-between text-sm px-1">
                    <el-checkbox v-model="rememberMe" label="记住我" />
                    <a href="#" class="text-[#8b5cf6] font-semibold hover:underline">忘记密码？</a>
                  </div>
                  <el-form-item>
                    <el-button 
                      type="primary" 
                      class="w-full submit-btn" 
                      size="large" 
                      :loading="loading" 
                      @click="handlePwdLogin"
                    >
                      安全登录
                    </el-button>
                  </el-form-item>
                </el-form>
              </el-tab-pane>
            </el-tabs>

            <!-- 注册表单 -->
            <div v-else class="mt-8">
              <el-form ref="regFormRef" :model="regForm" :rules="regRules" class="space-y-5">
                <el-form-item prop="phone">
                  <el-input 
                    v-model="regForm.phone" 
                    placeholder="请输入手机号" 
                    size="large"
                    class="modern-input"
                  >
                    <template #prefix><el-icon class="text-[#8b5cf6]"><Iphone /></el-icon></template>
                  </el-input>
                </el-form-item>
                <el-form-item prop="password">
                  <el-input 
                    v-model="regForm.password" 
                    type="password" 
                    placeholder="请设置 6-16 位登录密码" 
                    show-password 
                    size="large"
                    class="modern-input"
                  >
                    <template #prefix><el-icon class="text-[#8b5cf6]"><Lock /></el-icon></template>
                  </el-input>
                </el-form-item>
                <el-form-item prop="captcha">
                  <GraphicCaptcha ref="regCaptchaRef" v-model="regForm.captcha" />
                </el-form-item>
                <el-form-item prop="code">
                  <div class="flex space-x-3 w-full">
                    <el-input 
                      v-model="regForm.code" 
                      placeholder="短信验证码" 
                      size="large" 
                      class="flex-1 modern-input"
                    >
                      <template #prefix><el-icon class="text-[#8b5cf6]"><ChatDotRound /></el-icon></template>
                    </el-input>
                    <el-button 
                      size="large" 
                      class="sms-code-btn"
                      :disabled="countdown > 0" 
                      @click="sendRegSmsCode"
                    >
                      {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
                    </el-button>
                  </div>
                </el-form-item>
                <el-form-item>
                  <el-button 
                    type="primary" 
                    class="w-full submit-btn register" 
                    size="large" 
                    :loading="loading" 
                    @click="handleRegister"
                  >
                    立即注册
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>

          <!-- 底部操作 -->
          <div class="mt-8 text-center">
            <p class="text-slate-500 text-sm">
              {{ isRegister ? '已经有账号了？' : '还没有智影账号？' }}
              <a href="javascript:void(0)" class="text-[#8b5cf6] font-bold hover:underline ml-1" @click="toggleRegister">
                {{ isRegister ? '立即登录' : '免费注册' }}
              </a>
            </p>
          </div>

          <!-- 第三方登录 -->
          <div class="mt-10">
            <div class="relative flex items-center justify-center mb-6">
              <span class="absolute w-full border-t border-slate-200"></span>
              <span class="relative bg-white px-4 text-xs text-slate-400 font-medium">其他登录方式</span>
            </div>
            <div class="flex justify-center">
              <button 
                class="sso-btn flex items-center space-x-2 px-8 py-3 rounded-full border border-slate-200 hover:border-[#8b5cf6] hover:bg-[#8b5cf6]/5 transition-all group"
                @click="router.push('/auth/sso?token=mock')"
              >
                <div class="w-5 h-5 bg-[#8b5cf6] rounded-md flex items-center justify-center text-[10px] text-white font-bold group-hover:rotate-12 transition-transform">H</div>
                <span class="text-sm font-semibold text-slate-600 group-hover:text-[#8b5cf6]">恒智易单点登录</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'
import { User, Lock, Iphone, ChatDotRound, VideoCamera, EditPen } from '@element-plus/icons-vue'
import GraphicCaptcha from './components/GraphicCaptcha.vue'

const router = useRouter()
const userStore = useUserStore()

// 默认开启短信登录
const activeTab = ref('sms')
const isRegister = ref(false)
const loading = ref(false)
const countdown = ref(0)
const rememberMe = ref(true)

const pwdCaptchaRef = ref()
const smsCaptchaRef = ref()
const regCaptchaRef = ref()

const pwdFormRef = ref()
const smsFormRef = ref()
const regFormRef = ref()

const pwdForm = reactive({ username: '', password: '', captcha: '' })
const smsForm = reactive({ phone: '', code: '', captcha: '' })
const regForm = reactive({ phone: '', password: '', code: '', captcha: '' })

const pwdRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  captcha: [{ required: true, message: '请输入图形验证码', trigger: 'blur' }]
}

const smsRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
  captcha: [{ required: true, message: '请输入图形验证码', trigger: 'blur' }]
}

const regRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请设置密码', trigger: 'blur' },
    { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
  ],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
  captcha: [{ required: true, message: '请输入图形验证码', trigger: 'blur' }]
}

const toggleRegister = () => {
  isRegister.value = !isRegister.value
}

const startCountdown = () => {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const sendSmsCode = () => {
  if (!smsForm.phone) return ElMessage.warning('请先输入手机号')
  if (!/^1[3-9]\d{9}$/.test(smsForm.phone)) return ElMessage.warning('手机号格式不正确')
  if (!smsCaptchaRef.value?.validate()) {
    smsCaptchaRef.value?.refreshCaptcha()
    return ElMessage.error('图形验证码不正确')
  }
  ElMessage.success('验证码发送成功（模拟: 123456）')
  startCountdown()
}

const sendRegSmsCode = () => {
  if (!regForm.phone) return ElMessage.warning('请先输入手机号')
  if (!/^1[3-9]\d{9}$/.test(regForm.phone)) return ElMessage.warning('手机号格式不正确')
  if (!regCaptchaRef.value?.validate()) {
    regCaptchaRef.value?.refreshCaptcha()
    return ElMessage.error('图形验证码不正确')
  }
  ElMessage.success('验证码发送成功（模拟: 123456）')
  startCountdown()
}

const handlePwdLogin = async () => {
  if (!pwdFormRef.value) return
  await pwdFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      if (!pwdCaptchaRef.value?.validate()) {
        pwdCaptchaRef.value?.refreshCaptcha()
        return ElMessage.error('图形验证码不正确')
      }
      loading.value = true
      try {
        await userStore.loginByPassword(pwdForm)
        ElMessage.success('欢迎回到智影')
        router.push('/ai-short-drama-creator/new')
      } catch (e) {
        ElMessage.error('登录失败')
        pwdCaptchaRef.value?.refreshCaptcha()
      } finally {
        loading.value = false
      }
    }
  })
}

const handleSmsLogin = async () => {
  if (!smsFormRef.value) return
  await smsFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      if (!smsCaptchaRef.value?.validate()) {
        smsCaptchaRef.value?.refreshCaptcha()
        return ElMessage.error('图形验证码不正确')
      }
      loading.value = true
      try {
        await userStore.loginBySms(smsForm)
        ElMessage.success('欢迎回到智影')
        router.push('/ai-short-drama-creator/new')
      } catch (e) {
        ElMessage.error('登录失败')
        smsCaptchaRef.value?.refreshCaptcha()
      } finally {
        loading.value = false
      }
    }
  })
}

const handleRegister = async () => {
  if (!regFormRef.value) return
  await regFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      if (!regCaptchaRef.value?.validate()) {
        regCaptchaRef.value?.refreshCaptcha()
        return ElMessage.error('图形验证码不正确')
      }
      loading.value = true
      try {
        await userStore.loginByPassword({ username: regForm.phone, password: regForm.password })
        ElMessage.success('智影账号注册成功')
        router.push('/ai-short-drama-creator/new')
      } catch (e) {
        ElMessage.error('注册失败')
        regCaptchaRef.value?.refreshCaptcha()
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped lang="scss">
.login-container {
  background-color: #f3f4f6;
  position: relative;
  overflow: hidden;
}

.bg-decor {
  .circle {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.4;
  }
  .circle-1 {
    width: 600px;
    height: 600px;
    background: #818cf8;
    top: -200px;
    left: -200px;
    animation: move 20s infinite alternate;
  }
  .circle-2 {
    width: 500px;
    height: 500px;
    background: #c084fc;
    bottom: -150px;
    right: -100px;
    animation: move 15s infinite alternate-reverse;
  }
  .circle-3 {
    width: 300px;
    height: 300px;
    background: #fb7185;
    top: 20%;
    right: 10%;
    animation: move 25s infinite alternate;
  }
}

@keyframes move {
  from { transform: translate(0, 0); }
  to { transform: translate(100px, 50px); }
}

.login-card {
  transition: all 0.5s ease;
}

.modern-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.modern-tabs :deep(.el-tabs__active-bar) {
  height: 4px;
  border-radius: 4px;
  background: linear-gradient(to right, #6366f1, #8b5cf6);
}

.modern-tabs :deep(.el-tabs__item) {
  font-size: 18px;
  font-weight: 600;
  color: #94a3b8;
  padding: 0 20px;
  height: 50px;
  
  &.is-active {
    color: #1e293b;
  }
}

.modern-input :deep(.el-input__wrapper) {
  background-color: #f8fafc;
  box-shadow: none;
  border: 2px solid transparent;
  border-radius: 16px;
  padding-left: 16px;
  height: 56px;
  transition: all 0.3s;
  
  &:hover {
    background-color: #f1f5f9;
  }
  
  &.is-focus {
    background-color: #fff;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 6px rgba(139, 92, 246, 0.1);
  }
}

.submit-btn {
  height: 56px;
  font-size: 18px;
  font-weight: 700;
  border-radius: 16px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
  margin-top: 10px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 35px rgba(99, 102, 241, 0.4);
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  }

  &.register {
    background: linear-gradient(135deg, #ec4899 0%, #d946ef 100%);
    box-shadow: 0 10px 25px rgba(236, 72, 153, 0.3);
    
    &:hover {
      background: linear-gradient(135deg, #db2777 0%, #c026d3 100%);
      box-shadow: 0 15px 35px rgba(236, 72, 153, 0.4);
    }
  }
}

.sms-code-btn {
  height: 56px;
  border-radius: 16px;
  border: 2px solid #e2e8f0;
  font-weight: 600;
  color: #64748b;
  min-width: 120px;
  
  &:hover:not(:disabled) {
    color: #8b5cf6;
    border-color: #8b5cf6;
    background-color: #f5f3ff;
  }
}

.sso-btn {
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  }
}
</style>
