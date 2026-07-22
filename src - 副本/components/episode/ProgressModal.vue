<template>
  <el-dialog
    v-model="visible"
    width="440px"
    center
    destroy-on-close
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    class="custom-progress-dialog"
  >
    <div class="flex flex-col items-center pt-4 pb-2 px-2">
      <!-- Title -->
      <h3 class="text-xl font-black text-slate-800 tracking-tight mb-8">{{ title }}</h3>
      
      <!-- Progress Circle -->
      <div class="relative flex items-center justify-center mb-8">
        <el-progress 
          type="circle" 
          :percentage="progress" 
          :stroke-width="8"
          :color="progressColor"
          :width="180"
          :show-text="false"
          class="progress-circle"
        />
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-4xl font-black text-slate-800 tracking-tighter">{{ progress }}%</span>
          <span class="text-sm font-bold text-indigo-600 mt-2 bg-indigo-50 px-3 py-1 rounded-full">正在处理中...</span>
        </div>
      </div>
      
      <!-- Description -->
      <div class="text-center space-y-2 mb-8">
        <p class="text-base font-bold text-slate-700">正在为您精心制作分镜脚本</p>
        <p class="text-sm text-slate-400 px-8 leading-relaxed">
          预计还需要 <span class="text-indigo-600 font-bold">2</span> 分钟，您可以点击下方按钮在后台运行，生成完成后我们将通知您
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="w-full grid grid-cols-2 gap-3 mt-4">
        <button 
          @click="handleCancel"
          class="h-12 px-4 bg-slate-50 text-slate-400 rounded-2xl text-[14px] font-bold hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-95"
        >
          取消并停止
        </button>
        <button 
          @click="visible = false"
          class="h-12 px-4 bg-indigo-600 text-white rounded-2xl text-[14px] font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all"
        >
          后台运行
        </button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: boolean;
  progress: number;
  title: string;
}>();

const emit = defineEmits(['update:modelValue', 'cancel']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

// Primary theme color
const progressColor = '#4f46e5'; // indigo-600

const handleCancel = () => {
  emit('cancel');
};
</script>

<style lang="scss">
.custom-progress-dialog {
  border-radius: 24px !important;
  overflow: hidden;
  
  .el-dialog__header {
    display: none;
  }
  
  .el-dialog__body {
    padding: 24px !important;
  }
}

.progress-circle {
  .el-progress-circle__track {
    stroke: #f1f5f9; // slate-100
  }
}
</style>
