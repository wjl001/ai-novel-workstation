<template>
  <div :class="[s.bar, { [s.mini]: mini }]">
    <div :class="s.container">
      <div :class="s.content">
        <div :class="s.info">
          <span :class="s.label">当前进度</span>
          <span :class="s.status">{{ current }} / {{ total }} 集</span>
        </div>
        
        <div :class="s.track">
          <div :class="s.progress" :style="{ width: `${(current / total) * 100}%` }"></div>
        </div>

        <div :class="s.actions" v-if="!mini">
          <el-button type="primary" size="small" class="theme-primary-btn">一键生成全集</el-button>
          <el-button size="small">导出视频</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import s from './BottomProgressBar.module.scss';

defineProps<{
  total: number;
  current: number;
  mini: boolean;
}>();
</script>
