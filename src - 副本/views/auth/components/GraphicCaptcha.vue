<template>
  <div class="flex items-center space-x-3">
    <el-input 
      v-model="code" 
      placeholder="验证码" 
      @input="emitChange"
      class="captcha-input flex-1"
    />
    <div 
      class="captcha-box w-32 h-[48px] cursor-pointer flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold tracking-[0.2em] select-none rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 hover:border-blue-400 transition-all italic text-lg"
      @click="refreshCaptcha"
      title="点击刷新"
    >
      {{ captchaText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits(['update:modelValue'])

const code = ref(props.modelValue)
const captchaText = ref('')

const generateRandomCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const refreshCaptcha = () => {
  captchaText.value = generateRandomCaptcha()
  code.value = ''
  emitChange()
}

const emitChange = () => {
  emit('update:modelValue', code.value)
}

// 暴露给父组件用于校验
const validate = () => {
  return code.value.toLowerCase() === captchaText.value.toLowerCase()
}

defineExpose({
  validate,
  refreshCaptcha
})

onMounted(() => {
  refreshCaptcha()
})
</script>

<style scoped lang="scss">
.captcha-input :deep(.el-input__wrapper) {
  background-color: #f8fafc;
  box-shadow: none;
  border: 1px solid #e2e8f0;
  height: 48px;
  border-radius: 8px;
  
  &.is-focus {
    background-color: #fff;
    border-color: #3b82f6;
  }
}

.dark .captcha-input :deep(.el-input__wrapper) {
  background-color: #1e293b;
  border-color: #334155;
  
  &.is-focus {
    background-color: #0f172a;
    border-color: #8b5cf6;
  }

  .el-input__inner {
    color: #fff;
  }
}

.captcha-box {
  background-image: linear-gradient(45deg, rgba(59, 130, 246, 0.05) 25%, transparent 25%, transparent 50%, rgba(59, 130, 246, 0.05) 50%, rgba(59, 130, 246, 0.05) 75%, transparent 75%, transparent);
  background-size: 20px 20px;
  text-shadow: 2px 2px 4px rgba(59, 130, 246, 0.1);
}
</style>
