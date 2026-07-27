<template>
  <div class="h-full flex flex-col p-8 overflow-hidden">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-8">
      <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
        <el-icon :size="26" class="text-white"><Document /></el-icon>
      </div>
      <div>
        <h1 class="text-2xl font-black tracking-tight leading-none" :class="isLight ? 'text-slate-800' : 'text-white'">
          更新日志
        </h1>
        <span class="text-xs text-indigo-500 font-black uppercase tracking-[0.2em] mt-1">CHANGELOG</span>
      </div>
      <div class="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors"
           :class="isLight ? 'bg-white border-indigo-200 shadow-sm' : 'bg-slate-800 border-slate-700'">
        <el-icon :size="14" class="text-indigo-500"><InfoFilled /></el-icon>
        <span class="text-sm font-black" :class="isLight ? 'text-slate-700' : 'text-slate-200'">当前版本</span>
        <span class="text-sm font-black text-indigo-500">{{ currentVersion }}</span>
      </div>
    </div>

    <!-- Timeline -->
    <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar relative">
      <div class="space-y-6">
        <div v-for="entry in sortedEntries" :key="entry.version" class="relative pl-12">
          <!-- Timeline line & dot -->
          <div class="absolute left-5 top-2 w-0.5 h-full" :class="isLight ? 'bg-slate-200' : 'bg-slate-700'"></div>
          <div class="absolute left-3.5 top-3.5 w-4 h-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 ring-4"
               :class="isLight ? 'ring-white' : 'ring-slate-950'" />

          <div class="rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-lg"
               :class="isLight
                 ? 'bg-white border-slate-200 hover:border-indigo-300 shadow-sm'
                 : 'bg-slate-900/60 border-slate-700 hover:border-indigo-500/50 shadow-sm shadow-black/20'">
            <!-- Card header -->
            <div class="flex items-center justify-between px-6 py-4"
                 :class="isLight ? 'bg-slate-50 border-b border-slate-100' : 'bg-slate-800/50 border-b border-slate-700'">
              <div class="flex items-center gap-3">
                <span class="px-3 py-1 rounded-lg text-xs font-black tracking-wide"
                      :class="isLight ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-900/40 text-indigo-400'">
                  {{ entry.version }}
                </span>
                <span class="text-xs font-bold" :class="isLight ? 'text-slate-400' : 'text-slate-500'">
                  {{ entry.date }}
                </span>
              </div>
              <el-icon :size="16" :class="isLight ? 'text-slate-300' : 'text-slate-600'"><Calendar /></el-icon>
            </div>

            <!-- Highlights -->
            <div class="px-6 py-4">
              <ul class="space-y-3">
                <li v-for="(item, idx) in entry.highlights" :key="idx"
                    class="flex items-start gap-3">
                  <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                  <span class="text-sm font-medium leading-relaxed"
                        :class="isLight ? 'text-slate-600' : 'text-slate-300'">
                    {{ item }}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div v-if="sortedEntries.length === 0" class="flex flex-col items-center justify-center py-20">
          <el-icon :size="48" :class="isLight ? 'text-slate-300' : 'text-slate-700'"><Document /></el-icon>
          <p class="mt-3 text-sm font-bold tracking-widest uppercase" :class="isLight ? 'text-slate-400' : 'text-slate-600'">暂无更新记录</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Document, InfoFilled, Calendar } from '@element-plus/icons-vue'
import { APP_VERSION, changelogHistory } from '@/constants/version'

const isLight = computed(() => {
  return document.documentElement.classList.contains('theme-light') || !document.documentElement.classList.contains('theme-dark')
})

const currentVersion = APP_VERSION
const sortedEntries = computed(() => changelogHistory)
</script>
