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
    <el-dialog v-model="showDesignDialog" title="产品设计说明 - 多模态合成引擎" width="700px" class="rounded-[24px] !bg-[#1f2937] dark:!bg-gray-900 overflow-hidden" :show-close="false">
      <template #header="{ close, titleId, titleClass }">
        <div class="flex justify-between items-center px-6 py-4 border-b border-gray-700 bg-gray-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-900/30 flex items-center justify-center text-indigo-400">
              <el-icon :size="20"><Document /></el-icon>
            </div>
            <h4 :id="titleId" :class="[titleClass, 'text-xl font-black text-white m-0']">产品设计说明 - 视频合成与成片</h4>
          </div>
          <button @click="close" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700 text-gray-400 transition-colors">
            <el-icon :size="20"><Close /></el-icon>
          </button>
        </div>
      </template>
      
      <div class="px-6 py-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
        <div class="prose prose-invert max-w-none">
          <h3 class="text-indigo-400 font-bold flex items-center gap-2 mb-4"><el-icon><Location /></el-icon>页面定位</h3>
          <p class="text-gray-300 leading-relaxed mb-6 bg-gray-800 p-4 rounded-xl border border-gray-700">将静止的分镜图片与配音（TTS）、音乐（BGM）、字幕结合，最终生成连贯短视频的多模态合成引擎。</p>

          <h3 class="text-indigo-400 font-bold flex items-center gap-2 mb-4"><el-icon><Monitor /></el-icon>原型布局概要</h3>
          <ul class="space-y-3 mb-6">
            <li class="flex items-start gap-2 bg-gray-800 p-3 rounded-lg border border-gray-700/50">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
              <span class="text-gray-300"><strong>顶部左侧 (Preview)：</strong>16:9 或 9:16 的实时视频播放器。</span>
            </li>
            <li class="flex items-start gap-2 bg-gray-800 p-3 rounded-lg border border-gray-700/50">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
              <span class="text-gray-300"><strong>顶部右侧 (Assets Bin)：</strong>分镜素材和声音素材库。</span>
            </li>
            <li class="flex items-start gap-2 bg-gray-800 p-3 rounded-lg border border-gray-700/50">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
              <span class="text-gray-300"><strong>底部 (Timeline)：</strong>多轨道时间线编辑区（视频、配音、音效、字幕）。</span>
            </li>
          </ul>

          <h3 class="text-indigo-400 font-bold flex items-center gap-2 mb-4"><el-icon><Pointer /></el-icon>核心交互</h3>
          <ul class="space-y-3">
            <li class="flex items-start gap-2 bg-gray-800 p-3 rounded-lg border border-gray-700/50">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
              <span class="text-gray-300"><strong>一键合成：</strong>自动抓取分镜视频和对应台词音频，并在时间线上对齐。</span>
            </li>
            <li class="flex items-start gap-2 bg-gray-800 p-3 rounded-lg border border-gray-700/50">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
              <span class="text-gray-300"><strong>唇形同步 (Wav2Lip)：</strong>选中视频块和音频块，点击“一键对口型”，后台调用 Wav2Lip 引擎渲染同步。</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div class="px-6 py-4 border-t border-gray-700 bg-gray-800/50 flex justify-end">
        <button @click="showDesignDialog = false" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-sm">
          我已了解
        </button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { InfoFilled, Close, Document, Location, Monitor, Pointer } from '@element-plus/icons-vue';

const showDesignDialog = ref(false);
</script>

<style scoped>
/* Scoped styles for SynthesisView */
</style>
