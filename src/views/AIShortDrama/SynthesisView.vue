<template>
  <div class="h-full flex flex-col bg-gray-800 text-white">
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
  </div>
</template>

<script setup lang="ts">
// Script setup area
</script>

<style scoped>
/* Scoped styles for SynthesisView */
</style>
