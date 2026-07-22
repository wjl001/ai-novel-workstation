<template>
  <el-dialog
    v-model="visible"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="360px"
    class="confirm-dialog-c-end"
    center
    align-center
    destroy-on-close
  >
    <div class="confirm-content p-1">
      <!-- Icon Header -->
      <div class="flex justify-center mb-5">
        <div class="icon-wrapper w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30 animate-bounce-subtle">
          <el-icon :size="32" class="text-white"><component :is="icon" /></el-icon>
        </div>
      </div>

      <!-- Text Content -->
      <div class="text-center mb-6">
        <h3 class="text-lg font-black text-slate-800 dark:text-white mb-2 tracking-tight">{{ title }}</h3>
        <p class="text-slate-500 dark:text-slate-400 text-[13px] leading-relaxed px-2 font-medium">
          {{ message }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col gap-2.5 px-1">
        <button 
          @click="handleConfirm"
          class="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-black text-[14px] shadow-xl shadow-indigo-500/20 transform transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group"
        >
          <span>{{ confirmText }}</span>
          <el-icon class="group-hover:translate-x-1 transition-transform"><ArrowRightBold /></el-icon>
        </button>
        
        <button 
          v-if="showCancel"
          @click="handleCancel"
          class="w-full py-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl font-bold text-[13px] transition-all hover:text-slate-700 dark:hover:text-slate-200 border border-slate-100 dark:border-slate-700/50"
        >
          {{ cancelText }}
        </button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ArrowRightBold, WarningFilled } from '@element-plus/icons-vue';

interface Props {
  modelValue: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  icon?: any;
  showCancel?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  title: '提示',
  message: '确认执行此操作吗？',
  confirmText: '确认',
  cancelText: '取消',
  icon: WarningFilled,
  showCancel: true
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

const visible = ref(props.modelValue);

watch(() => props.modelValue, (val) => {
  visible.value = val;
});

watch(visible, (val) => {
  emit('update:modelValue', val);
});

const handleConfirm = () => {
  visible.value = false;
  emit('confirm');
};

const handleCancel = () => {
  visible.value = false;
  emit('cancel');
};
</script>

<style lang="scss">
.confirm-dialog-c-end {
  border-radius: 32px !important;
  overflow: hidden;
  border: none !important;
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px) saturate(180%);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;

  .el-dialog__header {
    display: none;
  }

  .el-dialog__body {
    padding: 24px !important;
  }
}

.dark {
  .confirm-dialog-c-end {
    background: rgba(30, 41, 59, 0.9) !important;
    border: 1px solid rgba(255, 255, 255, 0.05) !important;
  }
}

@keyframes bounce-subtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.animate-bounce-subtle {
  animation: bounce-subtle 3s ease-in-out infinite;
}
</style>
