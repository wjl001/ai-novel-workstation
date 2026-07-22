<template>
  <div :class="[s.list, { [s.isMobile]: isMobile }]" ref="listRef">
    <el-scrollbar ref="scrollbarRef">
      <div :class="s.scrollContent">
        <div 
          v-for="ep in episodes" 
          :key="ep.id"
          :id="`ep-${ep.id}`"
          :class="[s.item, { [s.active]: activeId === ep.id }]"
          @click="$emit('select', ep.id)"
          @mouseenter="handleMouseEnter(ep.id)"
          @mouseleave="handleMouseLeave"
        >
          <!-- Thumbnail with GIF on hover -->
          <div :class="s.thumbWrapper">
            <img 
              :src="hoverId === ep.id ? ep.gif : ep.poster" 
              :class="s.thumb" 
              alt="Episode Thumbnail"
              loading="lazy"
            />
            <div :class="s.duration">{{ ep.duration }}</div>
            <div v-if="activeId === ep.id" :class="s.playingOverlay">
              <el-icon><VideoPlay /></el-icon>
              <span>正在播放</span>
            </div>
          </div>

          <!-- Episode Info -->
          <div :class="s.info">
            <div :class="s.index">第 {{ ep.index }} 集</div>
            <div :class="s.title" :title="ep.title">{{ ep.title }}</div>
          </div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import { VideoPlay } from '@element-plus/icons-vue';
import s from './EpisodeList.module.scss';

const props = defineProps<{
  episodes: any[];
  activeId: string;
  isMobile?: boolean;
}>();

const emit = defineEmits(['select']);

const listRef = ref<HTMLElement | null>(null);
const scrollbarRef = ref<any>(null);
const hoverId = ref<string | null>(null);

const handleMouseEnter = (id: string) => {
  hoverId.value = id;
};

const handleMouseLeave = () => {
  hoverId.value = null;
};

const scrollToActive = () => {
  if (!scrollbarRef.value) return;
  const activeEl = document.getElementById(`ep-${props.activeId}`);
  if (activeEl) {
    activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

onMounted(() => {
  nextTick(scrollToActive);
});

watch(() => props.activeId, () => {
  nextTick(scrollToActive);
});
</script>
