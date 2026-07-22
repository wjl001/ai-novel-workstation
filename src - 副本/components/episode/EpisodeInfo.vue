<template>
  <div :class="s.info">
    <div :class="s.header">
      <h2 :class="s.title">{{ currentEpisode?.title }}</h2>
      <div :class="s.meta">
        <span :class="s.rating">评分 {{ dramaInfo.rating }}</span>
        <span :class="s.date">2026-04-02 12:00</span>
        <span :class="s.stats">播放量 1.2M+</span>
      </div>
    </div>

    <div :class="s.tags">
      <el-tag 
        v-for="tag in dramaInfo.tags" 
        :key="tag" 
        size="small" 
        effect="plain" 
        :class="s.tag"
      >
        {{ tag }}
      </el-tag>
    </div>

    <div :class="s.actions">
      <el-button link :icon="Star"><span :class="s.actionText">收藏 {{ dramaInfo.collections }}</span></el-button>
      <el-button link :icon="Share"><span :class="s.actionText">分享 {{ dramaInfo.shares }}</span></el-button>
      <el-button link :icon="Download"><span :class="s.actionText">下载 {{ dramaInfo.downloads }}</span></el-button>
    </div>

    <div :class="s.intro">
      <div :class="s.introTitle">剧集简介</div>
      <p :class="s.introText">{{ dramaInfo.description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Star, Share, Download } from '@element-plus/icons-vue';
import s from './EpisodeInfo.module.scss';

defineProps<{
  dramaInfo: any;
  currentEpisode: any;
}>();
</script>
