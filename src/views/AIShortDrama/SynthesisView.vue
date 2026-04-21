<template>
  <div class="h-full flex flex-col bg-gray-800 text-white relative">
    <!-- Product Design Info Button -->
    <button 
      @click="showDesignDialog = true"
      class="absolute top-4 right-4 z-50 h-8 px-4 flex items-center gap-2 bg-gray-700/80 backdrop-blur-md text-gray-300 hover:text-white rounded-full font-bold text-[12px] shadow-sm border border-gray-600 transition-all duration-300"
    >
      <el-icon :size="14"><InfoFilled /></el-icon>
      <span>产品设计说明</span>
    </button>

    <!-- Main Area: Media, Preview, and Inspector -->
    <div class="flex-1 flex min-h-0">
      <!-- Left: Media Library -->
      <div class="w-1/4 bg-gray-900 p-4 flex flex-col">
        <h2 class="text-lg font-bold mb-4">媒体库</h2>
        <div class="flex-1 bg-gray-800 rounded p-2 text-sm text-gray-400">分镜视频素材将显示在这里...</div>
      </div>

      <!-- Center: Preview -->
      <div class="flex-1 flex flex-col p-4">
        <div class="flex-1 bg-black flex items-center justify-center rounded-lg mb-4">
          <span class="text-gray-500">视频预览</span>
        </div>
      </div>

      <!-- Right: Inspector/Export -->
      <div class="w-1/4 bg-gray-900 p-4">
        <h2 class="text-lg font-bold mb-4">导出设置</h2>
        <div class="text-sm text-gray-400">导出参数将显示在这里...</div>
      </div>
    </div>

    <!-- Bottom: Timeline -->
    <div class="h-48 bg-gray-900 border-t border-gray-700 p-4">
      <h2 class="text-lg font-bold mb-2">时间轴</h2>
      <div class="bg-gray-800 h-full rounded p-2 text-sm text-gray-400">视频、音频、字幕轨道将显示在这里...</div>
    </div>

    <!-- Product Design Dialog -->
    <ProductDesignDialog
      v-model="showDesignDialog"
      id="short-drama-synthesis"
      :default-content="{
        title: '多模态合成引擎',
        location: '将静止的分镜图片与配音（TTS）、音乐（BGM）、字幕结合，最终生成连贯短视频的多模态合成引擎。',
        layout: [
          '**顶部左侧 (Preview)：** 16:9 或 9:16 的实时视频播放器。',
          '**顶部右侧 (Assets Bin)：** 分镜素材和声音素材库。',
          '**底部 (Timeline)：** 多轨道时间线编辑区（视频、配音、音效、字幕）。'
        ],
        interactions: [
          '**一键合成：** 自动抓取分镜视频和对应台词音频，并在时间线上对齐。',
          '**唇形同步 (Wav2Lip)：** 选中视频块和音频块，点击“一键对口型”，后台调用 Wav2Lip 引擎渲染同步。',
          '**功能说明 (2.1版本)：** \n - **剧集管理：** 2.1版本由系统自动规划剧集，暂不支持手动新增、编辑、删除或排序剧集。 \n - **完结状态：** “已完”表示该集已成功合成全集视频；“未完”表示尚未完成全集视频合成。'
        ],
        version: '2.1'
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { InfoFilled, Document, Close, Location, Monitor, Pointer } from '@element-plus/icons-vue'
import ProductDesignDialog from '@/components/Common/ProductDesignDialog.vue'

const showDesignDialog = ref(false)
</script>

<style scoped>
/* Scoped styles for SynthesisView */
</style>
