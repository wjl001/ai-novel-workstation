<template>
  <div class="h-full flex flex-col bg-[#F8FAFC] dark:bg-slate-900 overflow-hidden">
    <!-- Header Steps -->
    <div class="bg-white dark:bg-gray-800 p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
      <div class="max-w-7xl mx-auto">
        <div class="bg-[#F8FAFC] dark:bg-slate-900/50 rounded-full px-10 py-3">
          <el-steps :active="activeStep" finish-status="success" class="custom-steps">
            <el-step title="剧本" @click="$router.push('/ai-short-drama-creator/outline')" />
            <el-step title="主体设置" @click="$router.push('/ai-short-drama-creator/assets')" />
            <el-step title="分集视频" @click="$router.push('/ai-short-drama-creator/episodes')" />
          </el-steps>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div class="flex-1 overflow-hidden" :class="{ 'p-4 sm:p-6 lg:p-8': activeStep !== 2 }">
        <div 
          class="h-full bg-white dark:bg-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-700 overflow-hidden"
          :class="activeStep === 2 ? 'rounded-0' : 'rounded-2xl'"
        >
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const activeStep = computed(() => {
  switch (route.name) {
    case 'drama-outline': return 0;
    case 'drama-assets': return 1;
    case 'drama-episodes': return 2;
    default: return 0;
  }
});
</script>

<style scoped>
/* 容器样式 */
.custom-steps {
  --step-active-color: #6366f1;
  --step-success-bg: #eef2ff;
  --step-text-color: #1f2329;
}

/* 强制横向排列图标和文字 */
.custom-steps :deep(.el-step) {
  flex-basis: auto !important;
  flex-shrink: 0;
  flex-grow: 1;
  display: flex !important;
  flex-direction: row !important;
  align-items: center;
}

.custom-steps :deep(.el-step.is-center .el-step__main) {
  text-align: left !important;
}

.custom-steps :deep(.el-step__head) {
  flex-grow: 0;
  width: auto;
  display: flex;
  align-items: center;
}

.custom-steps :deep(.el-step__main) {
  display: flex !important;
  align-items: center;
  padding-left: 8px !important; /* 文字紧贴图标右侧 */
  white-space: nowrap;
}

/* 标题样式调整 */
.custom-steps :deep(.el-step__title) {
  margin-top: 0 !important;
  line-height: 24px !important;
}

/* 隐藏默认图标背景 */
.custom-steps :deep(.el-step__icon) {
  background: transparent;
  width: 24px;
  height: 24px;
  font-size: 13px;
}

/* 未完成节点 */
.custom-steps :deep(.el-step__head.is-wait) {
  color: #94a3b8;
  border-color: #e2e8f0;
}

/* 进行中节点样式 */
.custom-steps :deep(.el-step__head.is-process .el-step__icon) {
  background-color: var(--step-active-color);
  color: #fff;
  border: none;
  border-radius: 50%;
}
.custom-steps :deep(.el-step__title.is-process) {
  color: var(--step-text-color);
  font-weight: 800;
  font-size: 14px;
}

/* 已完成节点样式 */
.custom-steps :deep(.el-step__head.is-success .el-step__icon) {
  background-color: var(--step-success-bg);
  color: var(--step-active-color);
  border: none;
  border-radius: 50%;
}
.custom-steps :deep(.el-step__title.is-success) {
  color: var(--step-text-color);
  font-weight: 800;
  font-size: 14px;
}

/* 连接线样式 - 虚线效果 */
.custom-steps :deep(.el-step__line) {
  background-color: transparent;
  border-top: 1px dashed #cbd5e1;
  top: 50% !important;
  transform: translateY(-50%);
  left: auto !important;
  right: 10px !important;
  width: calc(100% - 100px) !important; /* 动态计算长度，避开左侧图标和文字 */
}

.custom-steps :deep(.el-step__line-inner) {
  display: none;
}

/* 最后一个节点的线隐藏 */
.custom-steps :deep(.el-step:last-of-type .el-step__line) {
  display: none;
}

/* 整个步骤项 */
.el-step {
  cursor: pointer;
}
</style>
