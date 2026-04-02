<template>
  <div :class="s.player" ref="playerRef">
    <!-- Video Content Area -->
    <div :class="s.videoArea">
      <img v-if="poster" :src="poster" :class="s.poster" alt="Video Poster" />
      <div v-else :class="s.placeholder">
        <el-icon :size="64"><VideoPlay /></el-icon>
        <span>视频准备中...</span>
      </div>
      
      <!-- Overlay: Top info -->
      <div :class="s.topOverlay">
        <span :class="s.episodeTitle">{{ title }}</span>
      </div>

      <!-- Overlay: Center Play/Pause (Animated) -->
      <transition name="scale">
        <div v-if="showPlayHint" :class="s.playHint">
          <el-icon :size="48"><VideoPlay /></el-icon>
        </div>
      </transition>

      <!-- Overlay: Next Episode Countdown (Floating) -->
      <transition name="fade">
        <div v-if="showNextCountdown" :class="s.countdownOverlay">
          <div :class="s.countdownContent">
            <span :class="s.countdownLabel">下一集即将播放</span>
            <div :class="s.countdownTimer">{{ countdown }}s</div>
            <el-button type="primary" size="small" @click="cancelNext">取消</el-button>
          </div>
        </div>
      </transition>
    </div>

    <!-- Custom Controls Bar -->
    <div :class="s.controls">
      <div :class="s.left">
        <el-button link :icon="VideoPause" />
        <el-button link :icon="ArrowRight" @click="$emit('next')" />
        <span :class="s.time">03:45 / 10:45</span>
      </div>
      
      <div :class="s.center">
        <div :class="s.progressBar">
          <div :class="s.progressInner" style="width: 35%"></div>
        </div>
      </div>

      <div :class="s.right">
        <!-- Settings popovers -->
        <el-popover placement="top" width="100" trigger="hover">
          <template #reference>
            <span :class="s.ctrlText">清晰度</span>
          </template>
          <div :class="s.popMenu">
            <div :class="s.popItem">4K 极致</div>
            <div :class="[s.popItem, s.active]">1080P 高清</div>
            <div :class="s.popItem">720P 标清</div>
          </div>
        </el-popover>

        <el-popover placement="top" width="100" trigger="hover">
          <template #reference>
            <span :class="s.ctrlText">倍速</span>
          </template>
          <div :class="s.popMenu">
            <div :class="s.popItem">2.0x</div>
            <div :class="s.popItem">1.5x</div>
            <div :class="[s.popItem, s.active]">1.0x</div>
            <div :class="s.popItem">0.5x</div>
          </div>
        </el-popover>

        <el-button link :icon="ChatLineRound" title="字幕" />
        <el-button link :icon="CopyDocument" title="画中画" />
        <el-button link :icon="FullScreen" title="全屏" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { VideoPlay, VideoPause, ArrowRight, FullScreen, ChatLineRound, CopyDocument } from '@element-plus/icons-vue';
import s from './VideoPlayer.module.scss';

const props = defineProps<{
  poster?: string;
  title?: string;
}>();

const emit = defineEmits(['next']);

const showPlayHint = ref(false);
const showNextCountdown = ref(false);
const countdown = ref(5);
const countdownTimer = ref<any>(null);

const triggerNextCountdown = () => {
  showNextCountdown.value = true;
  countdown.value = 5;
  countdownTimer.value = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(countdownTimer.value);
      showNextCountdown.value = false;
      emit('next');
    }
  }, 1000);
};

const cancelNext = () => {
  clearInterval(countdownTimer.value);
  showNextCountdown.value = false;
};

onMounted(() => {
  // Demo: trigger next countdown after 10s
  // setTimeout(triggerNextCountdown, 10000);
});
</script>
