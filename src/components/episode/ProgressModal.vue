<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="480px"
    center
    destroy-on-close
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  >
    <div class="flex flex-col items-center py-8 gap-6">
      <el-progress 
        type="circle" 
        :percentage="progress" 
        :stroke-width="10"
        :color="customColors"
        width="160"
      >
        <template #default="{ percentage }">
          <div class="flex flex-col items-center">
            <span class="text-[28px] font-bold text-slate-800">{{ percentage }}%</span>
            <span class="text-[12px] text-slate-400 mt-1">处理中...</span>
          </div>
        </template>
      </el-progress>
      
      <div class="text-center">
        <p class="text-[14px] text-slate-600 mb-2">正在为您生成分镜脚本，请耐心等待</p>
        <p class="text-[12px] text-slate-400">大约还需 2 分钟，您可以先行离开，稍后查看进度</p>
      </div>
    </div>
    
    <template #footer>
      <div class="flex justify-center gap-4 border-t border-slate-50 pt-4">
        <el-button @click="handleCancel">取消并停止生成</el-button>
        <el-button type="primary" class="theme-primary-btn" @click="visible = false">后台运行</el-button>
      </div>
    </template>
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

const customColors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#5cb87a', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#6f7ad3', percentage: 100 },
];

const handleCancel = () => {
  emit('cancel');
};
</script>

<style scoped>
.theme-primary-btn {
  background-color: #1890ff !important;
  border-color: #1890ff !important;
}
</style>
