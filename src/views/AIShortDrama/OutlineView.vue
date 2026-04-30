<template>
  <div class="flex h-full w-full overflow-hidden p-4 lg:p-6 gap-4 lg:gap-6 text-[#1f2329] bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] dark:from-slate-900 dark:to-slate-800 relative transition-all duration-500" :class="{'is-left-collapsed': isLeftCollapsed, 'is-right-collapsed': !isRightPanelVisible}">
    
    <!-- Full Screen Loading Overlay for Generation -->
    <teleport to="body">
      <transition name="fade-scale">
        <div v-if="isGeneratingOutline" class="fixed inset-0 z-[10000] flex items-center justify-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
          <!-- Animated Background Particles -->
          <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div v-for="i in 15" :key="i" 
                 class="absolute w-1 h-1 bg-indigo-500/20 rounded-full animate-float"
                 :style="{ 
                   left: Math.random() * 100 + '%', 
                   top: Math.random() * 100 + '%', 
                   animationDelay: Math.random() * 5 + 's',
                   animationDuration: (Math.random() * 10 + 10) + 's'
                 }"></div>
          </div>

          <div class="relative w-full max-w-lg px-6 flex flex-col items-center gap-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl p-10 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white dark:border-slate-700">
            <!-- Central Icon with Pulsing Effect -->
            <div class="relative">
              <div class="absolute inset-0 bg-indigo-500 rounded-3xl blur-[40px] opacity-10 animate-pulse"></div>
              <div class="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 rotate-6 animate-float-slow">
                <el-icon :size="40" class="animate-bounce-subtle"><MagicStick /></el-icon>
              </div>
            </div>

            <!-- Progress Info -->
            <div class="w-full flex flex-col items-center gap-5">
              <div class="text-center">
                <h2 class="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">AI 剧本构思中</h2>
                <p class="text-slate-500 dark:text-slate-400 text-sm font-bold">正在编织第 <span class="text-indigo-600 dark:text-indigo-400 font-black text-lg">{{ currentGeneratingIndex + 1 }}</span> 集 / 共 {{ totalEpisodesToGenerate }} 集</p>
              </div>

              <!-- Progress Bar -->
              <div class="w-full h-2.5 bg-slate-100 dark:bg-slate-900/50 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50 relative">
                <div 
                  class="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out relative"
                  :style="{ width: generationProgress + '%' }"
                >
                  <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-fast"></div>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">创意引擎处理中...</span>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
    <!-- Decorative background elements -->
    <div class="absolute -top-20 -right-20 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
    <div class="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

    <!-- Context Menu (Teleported to body for absolute stability) -->
    <teleport to="body">
      <transition name="scale">
        <div 
          v-show="contextMenuVisible" 
          class="fixed z-[99999] bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200/50 dark:border-slate-700/50 overflow-hidden text-[13px] text-slate-700 dark:text-slate-200 w-[180px] flex flex-col pointer-events-auto" 
          :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }" 
          @click.stop
        >
          <div 
            v-if="isAIAssistantEnabled"
            @click="quoteSelectedText"
            class="flex items-center gap-3 px-4 py-3.5 hover:bg-indigo-600 hover:text-white cursor-pointer transition-all duration-300 group"
          >
            <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-white/20 group-hover:text-white transition-all">
              <el-icon :size="16"><ChatLineSquare /></el-icon>
            </div>
            <div class="flex flex-col">
              <span class="font-black text-[14px]">引用至 AI 助手</span>
              <span class="text-[10px] opacity-60 font-medium group-hover:text-white/80">以此灵感开启对话</span>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- Left Info Panel (Workbench) -->
    <div 
      class="left-panel flex flex-col shrink-0 min-h-0 h-full transition-all duration-500 relative z-20" 
      :style="{ width: isLeftCollapsed ? '0px' : leftPanelWidth + 'px', marginRight: isLeftCollapsed ? '0px' : '0px' }"
    >
      <div v-show="!isLeftCollapsed" class="flex flex-col h-full overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[28px] border border-white dark:border-slate-700/50 shadow-2xl shadow-slate-200/50 dark:shadow-none transition-opacity duration-500 relative" :style="{ opacity: isLeftCollapsed ? 0 : 1 }">
        
        <!-- Product Design Info Button -->
        <div class="absolute top-4 right-4 z-50 flex items-center gap-2">
          <button 
            @click="showDesignDialog = true"
            class="w-8 h-8 flex items-center justify-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-400 hover:text-indigo-600 rounded-full shadow-sm border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300"
            title="查看产品设计说明"
          >
            <el-icon :size="16"><InfoFilled /></el-icon>
          </button>
        </div>

        <!-- Expanded State Content -->
        <div class="flex flex-col h-full w-full min-h-0 overflow-hidden">
          <!-- Sidebar Header -->
          <div class="h-16 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 shrink-0">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                <el-icon :size="18"><Document /></el-icon>
              </div>
              <span class="font-black text-[16px] text-slate-800 dark:text-white">剧集大纲</span>
            </div>
          </div>

          <!-- 剧集大纲 (Episode Outline Tab) -->
          <div class="flex-1 overflow-y-auto custom-scrollbar p-5 flex flex-col gap-5 min-h-0 animate-fade-in">
            <div v-if="isInfoLoading" class="space-y-6">
              <el-skeleton animated :rows="8" />
            </div>
            
            <template v-else-if="form">
              <!-- Streamlined Header: Stats & Add Button in One Row -->
              <div class="mb-4 flex items-center justify-between p-2.5 bg-slate-50/50 dark:bg-slate-900/30 rounded-[20px] border border-slate-100 dark:border-slate-800/50 shadow-sm">
                <!-- Stats Summary -->
                <div class="flex items-center gap-4 px-2">
                  <div class="flex flex-col items-center">
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">总数</span>
                    <span class="text-[15px] font-black text-slate-800 dark:text-white leading-none">{{ episodeStats.total }}</span>
                  </div>
                  <div class="w-px h-5 bg-slate-200 dark:bg-slate-700 opacity-50"></div>
                  <div class="flex flex-col items-center">
                    <span class="text-[9px] font-black text-emerald-500 uppercase tracking-tighter mb-0.5">已完</span>
                    <span class="text-[15px] font-black text-emerald-600 dark:text-emerald-400 leading-none">{{ episodeStats.finished }}</span>
                  </div>
                  <div class="w-px h-5 bg-slate-200 dark:bg-slate-700 opacity-50"></div>
                  <div class="flex flex-col items-center">
                    <span class="text-[9px] font-black text-amber-500 uppercase tracking-tighter mb-0.5">未完</span>
                    <span class="text-[15px] font-black text-amber-600 dark:text-amber-400 leading-none">{{ episodeStats.unfinished }}</span>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button 
                    @click="addNewEpisode"
                    class="h-9 px-4 bg-indigo-600 text-white rounded-xl text-[12px] font-black shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <el-icon><Plus /></el-icon> 新增剧集
                  </button>
                </div>
              </div>

              <!-- Draggable List -->
              <div class="flex flex-col gap-3 pb-6">
                <transition-group name="list">
                  <div 
                    v-for="(ep, relIdx) in displayedEpisodes" 
                    :key="ep.id"
                    class="episode-card relative group cursor-pointer transition-all duration-500 rounded-2xl overflow-hidden border-2"
                    :class="[
                      isCurrentEpisode(ep.id, episodeRange + relIdx)
                        ? 'active-card border-indigo-500/50 bg-gradient-to-br from-indigo-50/90 to-purple-50/90 dark:from-indigo-900/30 dark:to-purple-900/30 shadow-xl shadow-indigo-500/10'
                        : 'inactive-card border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg hover:-translate-y-0.5',
                      isSequentiallyGenerating && (episodeRange + relIdx) === currentGeneratingIndex ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : ''
                    ]"
                    @click="selectEpisode(episodeRange + relIdx)"
                  >
                    <!-- Active Glowing Border Effect -->
                    <div v-if="isCurrentEpisode(ep.id, episodeRange + relIdx)" class="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 opacity-40 animate-pulse-slow"></div>
                    
                    <!-- Loading Overlay for current generating episode -->
                    <div v-if="isSequentiallyGenerating && (episodeRange + relIdx) === currentGeneratingIndex" class="absolute inset-0 z-20 bg-white/60 dark:bg-slate-800/60 backdrop-blur-[2px] flex items-center justify-center">
                      <div class="flex flex-col items-center gap-1">
                        <el-icon class="is-loading text-indigo-600" :size="20"><Loading /></el-icon>
                        <span class="text-[10px] font-black text-indigo-600 uppercase tracking-widest animate-pulse">正在生成...</span>
                      </div>
                    </div>

                    <div class="relative z-10 p-3 flex flex-col gap-2">
                      <div class="flex justify-between items-center">
                        <div class="flex items-center gap-2">
                          <div 
                            class="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-500 shadow-sm"
                            :class="isCurrentEpisode(ep.id, episodeRange + relIdx)
                              ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rotate-6'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 group-hover:rotate-6'"
                          >
                            <el-icon :size="14"><VideoCamera /></el-icon>
                          </div>
                          <span class="text-[14px] font-black tracking-tight"
                            :class="isCurrentEpisode(ep.id, episodeRange + relIdx)
                              ? 'text-indigo-700 dark:text-indigo-300'
                              : 'text-slate-600 dark:text-slate-400 group-hover:text-indigo-600'"
                          >
                            第 {{ episodeRange + relIdx + 1 }} 集
                          </span>
                          <div
                            v-if="isCurrentEpisode(ep.id, episodeRange + relIdx)"
                            class="px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[9px] font-black tracking-widest shadow-lg shadow-indigo-500/20 animate-bounce-subtle"
                          >
                            正在编辑
                          </div>
                        </div>
                      </div>

                      <div class="relative">
                        <el-input 
                          v-model="ep.summary" 
                          type="textarea" 
                          :rows="2" 
                          placeholder="本集看点..." 
                          class="redesign-compact-textarea"
                          @mousedown.stop="selectEpisode(episodeRange + relIdx)"
                        />
                      </div>
                    </div>
                  </div>
                </transition-group>

                <div v-if="!form?.episodesData || form.episodesData.length === 0" class="py-20 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[32px] text-slate-400">
                  <el-icon size="48" class="opacity-20 mb-4"><Document /></el-icon>
                  <p class="font-black text-base">暂无剧集大纲</p>
                  <p class="text-[12px] mt-1 opacity-60">点击上方按钮开始规划你的故事</p>
                </div>
              </div>
            </template>
          </div>

          <!-- Sidebar Pagination Footer (Enhanced for 100+ episodes) -->
          <div v-if="form && (episodeRangeOptions.length > 1 || (form.episodesData && form.episodesData.length > 50))" class="shrink-0 border-t border-slate-100 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl relative">
            <!-- Decorative indicator for scrollable area -->
            <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-indigo-50 dark:bg-indigo-900/50 border border-indigo-100 dark:border-indigo-800 rounded-full text-[9px] font-black text-indigo-500 uppercase tracking-widest shadow-sm z-10">
              剧集导航
            </div>

            <div class="p-4 pt-6 flex flex-col gap-3">
              <!-- Scrollable Range Tabs -->
              <div class="relative flex items-center gap-2 group/nav">
                <div 
                   class="flex-1 overflow-x-auto custom-scrollbar-hide flex items-center gap-2 pb-1 scroll-smooth cursor-grab active:cursor-grabbing select-none" 
                   ref="rangeTabsRef"
                   @mousedown="startDragTabs"
                 >
                  <button 
                    v-for="opt in episodeRangeOptions" 
                    :key="opt.value"
                    @click="episodeRange = opt.value"
                    class="shrink-0 px-4 py-2 rounded-xl text-[11px] font-black transition-all duration-500 border relative overflow-hidden group/tab"
                    :class="episodeRange === opt.value 
                      ? 'bg-indigo-600 text-white border-transparent shadow-lg shadow-indigo-500/20 scale-105' 
                      : 'bg-slate-50 dark:bg-slate-900/50 text-slate-500 border-slate-100 dark:border-slate-800 hover:border-indigo-300 hover:text-indigo-600'"
                  >
                    <span class="relative z-10">{{ opt.label }}</span>
                    <div v-if="episodeRange === opt.value" class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer"></div>
                  </button>
                </div>

                <!-- Quick Jump Button -->
                <el-popover
                  placement="top"
                  :width="280"
                  trigger="click"
                  popper-class="episode-jump-popover"
                >
                  <template #reference>
                    <button class="w-10 h-10 shrink-0 rounded-xl bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:shadow-md transition-all flex items-center justify-center group/jump">
                      <el-icon :size="18" class="group-hover/jump:rotate-12 transition-transform"><Search /></el-icon>
                    </button>
                  </template>
                  
                  <div class="p-4 flex flex-col gap-4">
                    <div class="flex items-center justify-between">
                      <span class="text-[12px] font-black text-slate-800 dark:text-white uppercase tracking-widest">快速跳转</span>
                      <span class="text-[10px] text-slate-400">共 {{ form.episodesData?.length || 0 }} 集</span>
                    </div>
                    
                    <div class="flex gap-2">
                      <el-input-number 
                        v-model="jumpToEpisodeInput" 
                        :min="1" 
                        :max="Math.max(1, form.episodesData?.length || 0)" 
                        size="small"
                        class="flex-1"
                        placeholder="集数"
                      />
                      <button 
                        @click="handleQuickJump"
                        class="px-4 bg-indigo-600 text-white rounded-lg text-[12px] font-black hover:bg-indigo-700 transition-colors"
                      >
                        跳转
                      </button>
                    </div>

                    <div class="grid grid-cols-5 gap-1.5 max-h-[200px] overflow-y-auto custom-scrollbar p-1">
                      <button 
                        v-for="(_, idx) in (form.episodesData || [])" 
                        :key="idx"
                        @click="quickSelectEpisode(idx)"
                        class="aspect-square flex items-center justify-center rounded-lg text-[10px] font-black transition-all border"
                        :class="currentEpisodeIndex === idx 
                          ? 'bg-indigo-600 text-white border-transparent' 
                          : 'bg-slate-50 dark:bg-slate-900/50 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-indigo-300 hover:text-indigo-600'"
                      >
                        {{ idx + 1 }}
                      </button>
                    </div>
                  </div>
                </el-popover>
              </div>

              <!-- Page Indicator Dot Line (Clickable & Larger) -->
               <div v-if="episodeRangeOptions.length > 1" class="flex justify-center items-center gap-2.5 py-1">
                 <button 
                   v-for="opt in episodeRangeOptions" 
                   :key="opt.value"
                   @click="quickSelectRange(opt.value)"
                   class="group/dot relative p-1 transition-all duration-300"
                   :title="opt.label"
                 >
                   <div 
                     class="h-2 rounded-full transition-all duration-500"
                     :class="episodeRange === opt.value 
                       ? 'w-8 bg-indigo-500 shadow-sm shadow-indigo-500/30' 
                       : 'w-2 bg-slate-200 dark:bg-slate-700 group-hover/dot:bg-indigo-300 group-hover/dot:scale-110'"
                   ></div>
                   
                   <!-- Tooltip on hover -->
                   <div class="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded-md opacity-0 group-hover/dot:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                     {{ opt.label }}
                   </div>
                 </button>
               </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Left Panel Floating Collapse Toggle (Consistent with Right) -->
      <div 
        class="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-20 flex items-center justify-center cursor-pointer z-[150] group"
        @click="isLeftCollapsed = !isLeftCollapsed"
      >
        <div class="absolute inset-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md shadow-[0_4px_25px_rgba(99,102,241,0.25)] rounded-full border border-indigo-100/50 dark:border-indigo-900/50 transition-all duration-300 group-hover:scale-y-110 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30"></div>
        <el-icon class="relative z-10 text-indigo-500 group-hover:text-indigo-700 transition-all duration-300" :size="18">
          <ArrowRight v-if="isLeftCollapsed" />
          <ArrowLeft v-else />
        </el-icon>
      </div>

      <!-- Resizer Handle (Only when expanded) -->
      <div 
        v-if="!isLeftCollapsed"
        class="absolute -right-1 top-20 bottom-20 w-[6px] cursor-col-resize z-20 hover:bg-indigo-500/30 rounded-full transition-all duration-300"
        @mousedown="startResizeLeftPanel"
      ></div>
    </div>

    <!-- Right Edit Area -->
    <div v-if="form" class="right-panel flex-1 flex gap-4 lg:gap-6 h-full min-h-0 transition-all duration-500 overflow-visible">
      
      <!-- Central Canvas (Tiptap Script Body) -->
      <div class="flex-1 flex flex-col h-full min-h-0 bg-[#F0F7FF] dark:bg-slate-800/80 backdrop-blur-xl rounded-[32px] shadow-2xl shadow-blue-100 dark:shadow-none border border-blue-100 dark:border-slate-700/50 overflow-hidden relative group z-10">
        
        <!-- Canvas Toolbar -->
        <div class="flex items-center justify-between p-4 border-b border-blue-100/50 dark:border-slate-700/50 shrink-0 bg-white/60 dark:bg-slate-800/50">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 rotate-3 transition-transform group-hover:rotate-0">
              <el-icon :size="20"><Edit /></el-icon>
            </div>
            <div class="min-w-0">
              <transition name="fade" mode="out-in">
                <h3 :key="currentEpisodeIndex + editMode + (currentEpisode?.id || '')" class="text-[18px] font-black text-slate-800 dark:text-white flex items-center gap-2">
                  {{ editMode === 'full' ? '全集剧本正文' : '剧本正文' }}
                  <el-icon 
                    @click.stop="showScriptDesignDialog = true"
                    class="text-slate-300 hover:text-indigo-500 cursor-pointer transition-colors" 
                    :size="16"
                  >
                    <InfoFilled />
                  </el-icon>
                </h3>
              </transition>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-[10px] text-indigo-500 dark:text-indigo-400 font-black uppercase tracking-widest">
                  {{ editMode === 'full' ? '剧本编辑' : `正在编辑: ${currentEpisodeLabel}` }}
                </span>
                <span class="w-1 h-1 rounded-full bg-slate-300"></span>
                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">创作模式</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-3">
              <transition name="fade">
                <span 
                  v-if="editorTextContent"
                  class="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-800"
                >
                  <template v-if="!isSavingScript">
                    <el-icon><Check /></el-icon>
                    已自动保存
                  </template>
                  <template v-else>
                    <el-icon class="animate-spin"><Loading /></el-icon>
                    保存中...
                  </template>
                </span>
              </transition>
          </div>
        </div>

        <!-- Canvas Main Body -->
        <div class="flex-1 min-h-0 relative bg-white/40 dark:bg-slate-900/30 flex flex-col">
          
          <!-- Locked Banner for v2.1 -->
          <transition name="slide-down">
            <div v-if="isScriptLockedGlobal" class="z-30 px-6 py-2.5 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800/50 flex items-center justify-between">
              <div class="flex items-center gap-3 text-amber-700 dark:text-amber-400">
                <el-icon :size="16"><Lock /></el-icon>
                <span class="text-[12px] font-black tracking-wide">由于主体设置和分镜视频已生成，剧本内容已锁定，暂不支持编辑。</span>
              </div>
              <el-tooltip content="2.2版本说明：剧本内容已锁定，暂不支持编辑。" placement="top">
                <el-icon class="text-amber-500 cursor-help" :size="14"><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
          </transition>

          <!-- Loading Overlay -->
          <transition name="fade">
            <div v-if="isSwitchingContent" class="absolute inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-[32px]">
              <div class="flex flex-col items-center gap-3 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-2xl border border-indigo-100 dark:border-slate-700 animate-in zoom-in-95 duration-200">
                <el-icon class="is-loading text-indigo-600 dark:text-indigo-400" :size="32"><Loading /></el-icon>
                <span class="text-[13px] font-black text-indigo-600 dark:text-indigo-400 tracking-widest uppercase">加载中...</span>
              </div>
            </div>
          </transition>

          <!-- Tiptap Editor Wrapper -->
          <div 
            class="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6"
            @contextmenu.prevent="openContextMenu"
            ref="scriptBodyRef"
          >
            <div
              class="min-h-full bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-700/50 rounded-[24px] shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10"
              :class="isSwitchingContent ? 'opacity-50 scale-[0.99]' : 'opacity-100 scale-100'"
            >
              <!-- Selection Bubble Menu -->
              <bubble-menu 
                v-if="tiptapEditor" 
                :editor="tiptapEditor as any"
                :tippy-options="{ duration: 100, zIndex: 9999, moveTransition: 'transform 0.1s ease-out' }"
                class="flex items-center gap-1 bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-slate-200/50 dark:border-slate-700/50 overflow-hidden w-[140px] p-0"
              >
                <div 
                  v-if="isAIAssistantEnabled"
                  @click="quoteSelectedText"
                  class="flex items-center gap-2.5 px-3 py-2 hover:bg-indigo-600 hover:text-white cursor-pointer transition-all duration-300 group w-full"
                >
                  <div class="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-white/20 group-hover:text-white transition-all">
                    <el-icon :size="14"><ChatLineSquare /></el-icon>
                  </div>
                  <div class="flex flex-col">
                    <span class="font-bold text-[13px]">引用至 AI</span>
                  </div>
                </div>
              </bubble-menu>

              <!-- Editor Content -->
              <editor-content v-if="tiptapEditor" :editor="tiptapEditor as any" class="p-6 lg:p-10 outline-none min-h-[400px] prose-modern" />

              <!-- Empty State -->
              <transition name="fade">
                <div v-if="!isGenerating && !editorTextContent && showEmptyPlaceholder && !isEpisodeLocked(currentEpisodeIndex) && !isScriptLockedGlobal" class="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-slate-900 z-10 p-4 text-center">
                  <div class="w-20 h-20 rounded-[32px] bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500 mb-4 border border-white dark:border-slate-700 shadow-inner rotate-3">
                    <el-icon size="40"><Document /></el-icon>
                  </div>
                  <h4 class="text-[20px] font-black text-slate-800 dark:text-white mb-2">
                    {{ editMode === 'full' ? '全集剧本还是一片空白' : `${currentEpisodeLabel}剧本还是一片空白` }}
                  </h4>
                  <p class="mb-8 text-slate-500 dark:text-slate-400 text-[13px] font-medium max-w-md leading-relaxed">
                    {{ editMode === 'full' ? '万事开头难，不如让 AI 助手根据你的大纲，为你创作一个精彩的开场？' : `当前正在查看${currentEpisodeLabel}，${currentEpisodeSummary}` }}
                  </p>
                  <div class="flex items-center gap-4">
                    <button 
                      @click="generateScriptBody"
                      class="h-[48px] px-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[20px] text-[14px] font-black shadow-xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                      <el-icon :size="18"><MagicStick /></el-icon> 
                      {{ editMode === 'full' ? '智能生成全集' : `生成${currentEpisodeLabel}` }}
                    </button>
                    <button 
                      @click="startManualWrite"
                      class="h-[48px] px-8 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700 rounded-[20px] text-[14px] font-black hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm"
                    >
                      <el-icon :size="18"><Edit /></el-icon> 我要自己写
                    </button>
                  </div>
                </div>
              </transition>

              <!-- Locked State Overlay -->
              <transition name="fade">
                <div v-if="isEpisodeLocked(currentEpisodeIndex)" class="absolute inset-0 flex flex-col items-center justify-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10 p-4 text-center">
                  <div class="w-20 h-20 rounded-[32px] bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 mb-4 border border-red-100 dark:border-red-900/50 shadow-inner">
                    <el-icon size="40"><Lock /></el-icon>
                  </div>
                  <h4 class="text-[22px] font-black text-slate-800 dark:text-white mb-2">
                    {{ currentEpisodeLabel }} 已锁定
                  </h4>
                  <p class="text-red-500 text-[14px] font-black uppercase tracking-widest">
                    请先完成上一集的剧本编写
                  </p>
                </div>
              </transition>
            </div>
          </div>
        </div>

        <!-- Tiptap Footer Stats -->
        <div class="h-10 border-t border-blue-100/50 dark:border-slate-700/50 flex items-center justify-between px-6 text-[10px] font-black text-slate-500 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md shrink-0">
          <div class="flex items-center gap-8 uppercase tracking-widest">
            <span class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-indigo-500 shadow-sm"></span> 字数: <span class="text-slate-800 dark:text-white">{{ tiptapEditor?.storage.characterCount.characters() || 0 }}</span></span>
            <span class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-purple-500 shadow-sm"></span> 预计阅读: <span class="text-slate-800 dark:text-white">{{ Math.ceil((tiptapEditor?.storage.characterCount.words() || 0) / 250) }}</span> 分钟</span>
          </div>
          <div class="flex items-center gap-4">
            <button @click="tiptapEditor?.commands.undo()" class="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100">
              <el-icon :size="14"><RefreshLeft /></el-icon>
            </button>
            <button @click="tiptapEditor?.commands.redo()" class="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100">
              <el-icon :size="14"><RefreshRight /></el-icon>
            </button>
          </div>
        </div>

        <!-- Action Footer -->
        <div class="flex justify-end items-center p-5 border-t border-blue-100/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shrink-0 gap-4">
          <div v-if="isGenerating" class="flex items-center gap-4 text-indigo-600 dark:text-indigo-400 text-[13px] mr-auto bg-indigo-50 dark:bg-indigo-900/30 px-5 py-2.5 rounded-2xl font-black animate-pulse border border-indigo-100/50">
            <el-icon class="is-loading" v-if="!isPaused"><Loading /></el-icon> 
            <span class="tracking-wide">{{ isPaused ? '生成已暂停' : 'AI 正在全力构思中...' }}</span>
            <button 
              @click="isPaused = !isPaused" 
              class="flex items-center gap-1.5 px-4 py-1.5 bg-white dark:bg-slate-800 rounded-xl text-indigo-600 shadow-md hover:scale-105 active:scale-95 transition-all border border-indigo-50"
            >
              <el-icon><VideoPause v-if="!isPaused"/><VideoPlay v-else/></el-icon> 
              <span class="font-black">{{ isPaused ? '继续' : '暂停' }}</span>
            </button>
          </div>

          <button 
            v-if="!isGenerating" 
            @click="generateScriptBody"
            :disabled="isScriptLockedGlobal"
            class="h-11 px-6 bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-100 dark:border-indigo-900/50 rounded-2xl text-[13px] font-black hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-md flex items-center gap-2 group disabled:opacity-50 disabled:pointer-events-none"
          >
            <el-icon v-if="!editorTextContent" class="group-hover:rotate-12 transition-transform"><MagicStick /></el-icon>
            <el-icon v-else class="group-hover:rotate-180 transition-transform duration-500"><Refresh /></el-icon>
            {{ editorTextContent ? (editMode === 'full' ? '不满意？重写全集' : `不满意？重写${currentEpisodeLabel}`) : (editMode === 'full' ? '帮我写全集' : `帮我写${currentEpisodeLabel}`) }}
          </button>

          <button 
            @click="goToSubjectSettings"
            :disabled="isSavingScript || (!editorTextContent && !isScriptLockedGlobal) || isGenerating"
            class="h-11 px-10 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-2xl text-[14px] font-black shadow-xl shadow-indigo-500/30 hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center gap-2"
          >
            <el-icon v-if="isSavingScript" class="is-loading"><Loading /></el-icon>
            <span>{{ isScriptLockedGlobal ? '查看主体设置' : '完成，去设置主体' }}</span>
            <el-icon v-if="!isSavingScript" class="animate-bounce-horizontal"><ArrowRight /></el-icon>
          </button>
        </div>
      </div>

      <!-- Right Properties Panel (AI Assistant) -->
      <div 
        v-if="isAIAssistantEnabled"
        class="shrink-0 flex flex-col h-full min-h-0 transition-all duration-500 relative z-20" 
        :style="{ width: isRightPanelVisible ? '360px' : '0px', marginLeft: isRightPanelVisible ? '0px' : '0px' }"
      >
        <div v-show="isRightPanelVisible" class="flex flex-col h-full overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[28px] border border-white dark:border-slate-700/50 shadow-2xl shadow-slate-200/50 dark:shadow-none transition-opacity duration-500" :style="{ opacity: isRightPanelVisible ? 1 : 0 }">
          <div class="h-16 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 -rotate-3 group-hover:rotate-0 transition-transform">
                <el-icon :size="18"><MagicStick /></el-icon>
              </div>
              <div class="flex flex-col">
                <span class="font-black text-[15px] text-slate-800 dark:text-white leading-none">AI 智能助手</span>
                <span class="text-[9px] text-indigo-500 dark:text-indigo-400 font-black uppercase tracking-widest mt-1 opacity-70">智能创意助手</span>
              </div>
            </div>
            <div class="flex items-center">
              <button 
                @click="showInstructionsDialog = true"
                class="h-8 px-3 flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-500 dark:text-slate-400 rounded-full font-bold text-[10px] shadow-sm border border-slate-200/50 dark:border-slate-700/50 hover:text-indigo-600 hover:border-indigo-300 transition-all duration-300"
              >
                <el-icon :size="12"><QuestionFilled /></el-icon>
                <span>指令说明</span>
              </button>
            </div>
          </div>

          <div class="flex-1 flex flex-col bg-[#F9FBFF] dark:bg-slate-900/20 min-h-0">
            <div class="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6 p-6" ref="rightPanelChatRef">
              <!-- Initial Welcome Message -->
              <div class="flex flex-col gap-2 items-start animate-slide-up">
                <div class="flex items-center gap-2 px-1">
                  <div class="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <el-icon :size="12"><MagicStick /></el-icon>
                  </div>
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI 助手</span>
                </div>
                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none shadow-sm text-[13px] leading-relaxed text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700/50 max-w-[90%]">
                  你好！我是你的专属 AI 创作助手。我已经准备好帮你打磨剧本、丰富情节或者提供灵感了。
                </div>
              </div>

              <!-- Shared Chat logs -->
              <transition-group name="chat">
                <!-- Chat History Messages -->
                <div 
                  v-for="msg in chatMessages" 
                  :key="msg.id"
                  class="flex flex-col gap-2"
                  :class="msg.role === 'ai' ? 'items-start' : 'items-end'"
                >
                  <div class="flex items-center gap-2 px-1" :class="msg.role === 'ai' ? 'flex-row' : 'flex-row-reverse'">
                    <div class="w-5 h-5 rounded-md flex items-center justify-center" :class="msg.role === 'ai' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'">
                      <el-icon :size="12"><component :is="msg.role === 'ai' ? MagicStick : User" /></el-icon>
                    </div>
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ msg.role === 'ai' ? 'AI 助手' : '你' }}</span>
                  </div>
                  <div 
                    class="p-4 rounded-2xl text-[13px] leading-relaxed max-w-[90%] break-words shadow-sm border transition-all whitespace-pre-wrap"
                    :class="msg.role === 'ai' 
                      ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-100 dark:border-slate-700/50 rounded-tl-none' 
                      : 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none shadow-indigo-500/10'"
                  >
                    {{ msg.content }}
                    <span v-if="msg.isGenerating" class="inline-block w-1 h-4 bg-indigo-300 animate-pulse ml-1 align-middle"></span>
                  </div>
                </div>

                <!-- AI Proposal / Comparison Card (Now below historical messages) -->
                <div v-if="aiProposal.isActive" key="ai-proposal" class="flex flex-col gap-3 animate-slide-up">
                  <div class="flex items-center gap-2 px-1">
                    <div class="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center text-white">
                      <el-icon :size="12"><MagicStick /></el-icon>
                    </div>
                    <span class="text-[10px] font-black text-indigo-600 uppercase tracking-widest">AI 优化建议 ({{ aiProposal.action }})</span>
                  </div>
                  
                  <div class="bg-white dark:bg-slate-800 rounded-[20px] shadow-xl border border-indigo-100 dark:border-indigo-900/50 overflow-hidden">
                    <!-- Original Content (if any) -->
                    <div v-if="aiProposal.original" class="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                      <div class="text-[10px] font-bold text-slate-400 uppercase mb-2">引用原文</div>
                      <div class="text-[13px] text-slate-500 italic line-clamp-3">"{{ aiProposal.original }}"</div>
                    </div>
                    
                    <!-- Modified Content -->
                    <div class="p-5">
                      <div class="flex items-center gap-2 mb-3">
                        <div class="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black border border-indigo-100 dark:border-indigo-800">
                          优化建议
                        </div>
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI 处理方案</span>
                      </div>
                      
                      <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50">
                        <div class="text-[14px] leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                          {{ aiProposal.modified }}
                          <span v-if="aiProposal.isGenerating" class="inline-block w-1.5 h-4 bg-indigo-500 animate-pulse ml-1 align-middle"></span>
                        </div>
                      </div>
                      
                      <p v-if="!aiProposal.isGenerating" class="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5 px-1">
                        <el-icon><InfoFilled /></el-icon>
                        采纳后仅插入剧本正文，不含提示性文案
                      </p>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div v-if="!aiProposal.isGenerating" class="p-4 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-3">
                      <button 
                        @click="rejectAIProposal"
                        class="flex-1 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 text-[13px] font-black hover:bg-slate-100 transition-all"
                      >
                        放弃
                      </button>
                      <button 
                        @click="acceptAIProposal"
                        class="flex-[2] h-10 rounded-xl bg-indigo-600 text-white text-[13px] font-black shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                      >
                        <el-icon><Check /></el-icon> 采纳并应用
                      </button>
                    </div>
                  </div>
                </div>
              </transition-group>
            </div>
            
            <!-- Chat Input Area -->
            <div class="mt-auto shrink-0 p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700/50">
              <!-- Quoted Content Block -->
              <transition name="fade">
                <div v-if="quotedText" class="mb-4 p-3 bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl relative group/quote">
                  <div class="flex items-center gap-2 mb-1.5">
                    <el-icon class="text-indigo-600 dark:text-indigo-400" :size="12"><ChatLineSquare /></el-icon>
                    <span class="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">引用剧本内容</span>
                    <button 
                      @click="quotedText = ''"
                      class="ml-auto w-5 h-5 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <el-icon :size="10"><Close /></el-icon>
                    </button>
                  </div>
                  <div class="text-[12px] text-slate-600 dark:text-slate-400 line-clamp-2 italic leading-relaxed">
                    "{{ quotedText }}"
                  </div>
                </div>
              </transition>

              <div class="relative group/input mb-3">
                <el-input 
                  v-model="aiPromptInput" 
                  placeholder="告诉我你的想法..." 
                  class="modern-chat-input"
                  @keyup.enter="handleAIGenerateAction('bubble', 'append')" 
                >
                  <template #suffix>
                    <button 
                      @click="handleAIGenerateAction('bubble', 'append')"
                      class="w-10 h-10 -mr-1.5 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all group-hover/input:bg-indigo-500"
                    >
                      <el-icon :size="18"><Top /></el-icon>
                    </button>
                  </template>
                </el-input>
              </div>

              <!-- AI Action Buttons - Moved and Resized -->
              <div class="grid grid-cols-4 gap-2 mb-3">
                <div v-for="action in [{n:'续写', i:Edit}, {n:'润色', i:MagicStick}, {n:'扩写', i:DocumentAdd}, {n:'改写', i:Refresh}]" 
                     :key="action.n"
                     @click="applyAIAction(action.n)"
                     class="flex flex-col items-center gap-1 cursor-pointer group/item"
                >
                  <div class="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover/item:bg-indigo-600 group-hover/item:text-white transition-all duration-300 shadow-sm">
                    <el-icon :size="16"><component :is="action.i" /></el-icon>
                  </div>
                  <span class="text-[10px] font-black text-slate-500 group-hover/item:text-indigo-600 transition-colors">{{ action.n }}</span>
                </div>
              </div>

              <div class="flex flex-wrap items-center justify-center gap-2 py-1">
                <button v-for="tag in ['增加冲突', '情感渲染', '增加反差', '五感填充']" :key="tag" 
                        @click="applyAIAction(tag)"
                        class="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-700 text-[10px] font-black text-slate-500 dark:text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30 transition-all border border-slate-100 dark:border-slate-600 shadow-sm hover:shadow-md">
                  {{ tag }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel Floating Collapse Toggle (Consistent with Left) -->
        <div 
          v-if="isAIAssistantEnabled"
          class="absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-20 flex items-center justify-center cursor-pointer z-[150] group"
          @click="isRightPanelVisible = !isRightPanelVisible"
        >
          <div class="absolute inset-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md shadow-[0_4px_25px_rgba(99,102,241,0.25)] rounded-full border border-indigo-100/50 dark:border-indigo-900/50 transition-all duration-300 group-hover:scale-y-110 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30"></div>
          <el-icon class="relative z-10 text-indigo-500 group-hover:text-indigo-700 transition-all duration-300" :size="18">
            <ArrowLeft v-if="isRightPanelVisible" />
            <ArrowRight v-else />
          </el-icon>
        </div>
      </div>
    </div>

    <!-- Product Design Dialog -->
    <ProductDesignDialog
      v-model="showDesignDialog"
      id="short-drama-outline"
      :default-content="{
        title: '剧本操作页面',
        location: '确立故事主轴和主要人物，后续所有生成基于此展开。将长故事切分为适合短视频平台的单集，并将摘要转化为可拍摄的具体“场景、动作、对白”。',
        layout: [
          '**左侧 (设定与大纲)：** 基础设定（背景、梗概）与剧集分集大纲（支持剧情摘要）。',
          '**中栏 (剧本编辑器)：** 采用好莱坞标准剧本格式排版的富文本编辑器。',
          '**右侧 (AI 助手)：** 2.2 版本新增悬浮侧边栏，支持对话微调、扩写、改写剧本段落。'
        ],
        interactions: [
          {
            text: '**功能说明 (2.2版本)：**\n - **剧集管理：** 2.2111111版本全面支持手动新增剧集大纲，剧集大纲的文字限制20-50，新增剧集大纲是在最后面新增。\n - **AI 智能助手：** 2.2版本全面开启 AI 助手，支持剧本正文引用与实时对话，助力高效创作。',
            image: ''
          },
          {
            text: '**属性规格与名词解释：**\n - **剧集大纲 (episodesData)：** 整个短剧的分集规划列表，2.2版本支持用户完全自定义。\n - **快速跳转 (jumpToEpisodeInput)：** 在大量剧集（如100集）间快速定位特定集数的功能。',
            image: ''
          }
        ],
        version: appVersion
      }"
    />

    <!-- Script Body Design Dialog -->
    <ProductDesignDialog
      v-model="showScriptDesignDialog"
      id="short-drama-script-body"
      :default-content="{
        title: '剧本正文编辑',
        location: '创作的核心区域。在这里，AI 生成的摘要被转化为详细的对白、动作和场景描写。',
        layout: [
          '**编辑区：** 采用好莱坞标准剧本格式的富文本编辑器，支持实时字数统计和预计时长。',
          '**气泡菜单：** 选中文字后自动弹出，提供“引用至 AI 助手”等核心交互入口。'
        ],
        interactions: [
          {
            text: '**自由编辑 (2.2版本)：** 剧本支持持续编辑与手动新增，不再受限于 2.1 版本的锁定规则。',
            image: ''
          },
          {
            text: '**实时保存：** 所有的编辑操作都会实时自动保存到云端，确保内容安全。',
            image: ''
          }
        ],
        version: appVersion
      }"
    />

    <GlobalUIDesignSpecsDialog
      v-model="showUIDesignSpecsDialog"
      title="UI 设计标注 - 剧本创作页"
      subtitle="OutlineView UI Design Specifications"
      :groups="uiDesignGroups as any"
    />

    <button
      @click="showUIDesignSpecsDialog = true"
      class="fixed bottom-6 right-6 z-[1500] w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 shadow-lg shadow-indigo-500/30 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      title="查看UI设计标注"
    >
      <el-icon :size="22"><Monitor /></el-icon>
    </button>

    <!-- AI Feature Instructions Dialog -->
    <el-dialog 
      v-model="showInstructionsDialog" 
      title="AI 智能助手 - 功能使用说明" 
      width="850px" 
      class="rounded-[24px] !bg-[#f8fafc] dark:!bg-slate-900 overflow-hidden" 
      :show-close="false"
    >
      <template #header="{ close, titleId, titleClass }">
        <div class="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
              <el-icon :size="20"><MagicStick /></el-icon>
            </div>
            <h4 :id="titleId" :class="[titleClass, 'text-xl font-black text-slate-800 dark:text-white m-0']">AI 助手功能指令说明</h4>
          </div>
          <button @click="close" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
            <el-icon :size="20"><Close /></el-icon>
          </button>
        </div>
      </template>

      <div class="px-6 py-4 max-h-[65vh] overflow-y-auto custom-scrollbar">
        <div class="mb-6 p-4 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100/50 dark:border-indigo-800/50">
          <div class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-sm mb-2">
            <el-icon><InfoFilled /></el-icon>
            <span>核心工作流：想法优先</span>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            为了获得最佳生成效果，请遵循以下步骤：<br/>
            1. 在 AI 助手的输入框中输入您的具体构思或改进要求。<br/>
            2. (可选) 在左侧编辑器中选中一段文字作为上下文。<br/>
            3. 点击下方对应的功能标签。AI 将结合您的想法与选中的文字进行智能处理。
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            v-for="item in aiInstructions" 
            :key="item.tag"
            class="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all group"
          >
            <div class="flex items-center justify-between mb-3">
              <span class="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-black">{{ item.tag }}</span>
              <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">AI Intelligent Mode</span>
            </div>
            <div class="space-y-3">
              <div>
                <div class="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <span class="w-1 h-1 rounded-full bg-indigo-500"></span>功能描述
                </div>
                <p class="text-[13px] text-slate-700 dark:text-slate-200 font-bold leading-relaxed">{{ item.behavior }}</p>
              </div>
              <div>
                <div class="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <span class="w-1 h-1 rounded-full bg-purple-500"></span>操作指南
                </div>
                <p class="text-[12px] text-slate-500 dark:text-slate-400 font-medium">{{ item.instruction }}</p>
              </div>
              <div class="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <div class="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-1.5">推荐指令示例</div>
                <p class="text-[12px] text-slate-600 dark:text-slate-300 italic font-medium leading-relaxed">{{ item.command }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
        <button @click="showInstructionsDialog = false" class="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition-colors shadow-lg shadow-indigo-500/20">
          我已了解
        </button>
      </div>
    </el-dialog>

    <!-- Central Custom Warning Overlay -->
    <transition name="toast-bounce">
      <div v-if="customWarning.visible" class="fixed inset-0 z-[9999] pointer-events-none flex items-start justify-center pt-[15vh] bg-slate-900/10 dark:bg-slate-900/40 backdrop-blur-[2px]">
        <div class="px-8 py-5 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 dark:from-orange-900/80 dark:via-amber-900/80 dark:to-orange-900/80 border border-orange-200/60 dark:border-orange-500/30 rounded-2xl shadow-[0_20px_50px_-12px_rgba(245,158,11,0.3)] flex items-center gap-4 transform transition-all pointer-events-auto">
          <div class="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-500 shrink-0 shadow-inner">
            <el-icon size="24"><WarningFilled /></el-icon>
          </div>
          <span class="text-orange-600 dark:text-orange-400 font-black text-[15px] tracking-wide">{{ customWarning.message }}</span>
        </div>
      </div>
    </transition>

    <!-- Recovery Confirm Dialog -->
    <ConfirmDialog
      v-model="recoveryConfirmVisible"
      :title="recoveryConfirmTitle"
      :message="recoveryConfirmMessage"
      confirm-text="继续生成"
      cancel-text="放弃"
      :show-cancel="false"
      @confirm="handleRecoveryConfirm"
      @cancel="handleRecoveryCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useDramaStore } from '../../store/drama';
import { useEpisodeStore } from '../../store/episode';
import pkg from '../../../package.json';

const appVersion = pkg.version;
const isAIAssistantEnabled = computed(() => true); // 2.2 版本默认开启 AI 助手与手动新增功能
import { 
  MagicStick, Refresh, Edit, Plus, Delete, Check, Loading, 
  ArrowLeft, ArrowRight, Document, Setting, ArrowDown, 
  Expand, Fold, VideoPause, VideoPlay, User, 
  RefreshLeft, RefreshRight, DocumentAdd, Top, InfoFilled,
  Location, MoreFilled, ChatLineSquare, Close, Lock, Monitor, Pointer,
  Search, WarningFilled, QuestionFilled, Crop, CircleCheck, FullScreen
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Editor, EditorContent, BubbleMenu } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import CharacterCount from '@tiptap/extension-character-count';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import Placeholder from '@tiptap/extension-placeholder';

interface EpisodeData {
  id: string;
  title?: string;
  summary: string;
  scenes?: string;
  characters?: string;
  content: string;
  chatHistory: any[];
}

interface DramaForm {
  title: string;
  scriptType: string;
  genre: string;
  targetAudience: string;
  episodesCount: number;
  expectedDuration: number;
  synopsis: string;
  background: string;
  fullContent: string;
  episodesData: EpisodeData[];
}

import ConfirmDialog from '@/components/Common/ConfirmDialog.vue';
import ProductDesignDialog from '@/components/Common/ProductDesignDialog.vue';
import GlobalUIDesignSpecsDialog from '@/components/Common/GlobalUIDesignSpecsDialog.vue';

const router = useRouter();
const dramaStore = useDramaStore();
const episodeStore = useEpisodeStore();

// State
const isInfoLoading = ref(true);
const isGeneratingOutline = ref(false);
const isSequentiallyGenerating = ref(false);
const currentGeneratingIndex = ref(-1);
const generationProgress = ref(0);
const totalEpisodesToGenerate = ref(100);

// 全局剧本锁定逻辑 (2.2版本已放开)：
// 2.2版本：支持持续编辑，不再锁定剧本
const isScriptLockedGlobal = computed(() => {
  // return dramaStore.isAssetsGenerated; // 2.1 锁定规则
  return false;
});

// Recovery Confirm Dialog State
const recoveryConfirmVisible = ref(false);
const recoveryConfirmTitle = ref('');
const recoveryConfirmMessage = ref('');
const recoveryConfirmType = ref<'outline' | 'script'>('outline');

const handleRecoveryConfirm = () => {
  if (recoveryConfirmType.value === 'outline') {
    const { currentIndex } = dramaStore.generationStatus;
    resumeSequentialGeneration(currentIndex + 1);
  } else {
    const { progress } = dramaStore.generationStatus;
    resumeScriptGeneration(progress);
  }
};

const handleRecoveryCancel = () => {
  dramaStore.setGenerationStatus({ isGenerating: false, type: '' });
  if (recoveryConfirmType.value === 'outline') {
    loadContentFromStore();
  }
};

const isGenerating = ref(false);
const isPaused = ref(false);
const isSavingScript = ref(false);

const editMode = ref<'full' | 'episode'>('episode');
const currentEpisodeIndex = ref(0);

// Pagination State
const episodeRange = ref(0); // 0 for 1-20, 20 for 21-40, etc.
const EPISODES_PER_PAGE = 20;

const displayedEpisodes = computed(() => {
  if (!form.value?.episodesData) return [];
  return form.value.episodesData.slice(episodeRange.value, episodeRange.value + EPISODES_PER_PAGE);
});

const episodeRangeOptions = computed(() => {
  if (!form.value) return [];
  const total = (isGeneratingOutline.value || isSequentiallyGenerating.value) ? totalEpisodesToGenerate.value : (form.value.episodesData?.length || 0);
  const options = [];
  for (let i = 0; i < total; i += EPISODES_PER_PAGE) {
    const end = Math.min(i + EPISODES_PER_PAGE, total);
    options.push({
      label: `${i + 1}-${end}集`,
      value: i
    });
  }
  return options;
});

const episodeStats = computed(() => {
  if (!form.value) {
    return { total: 0, finished: 0, unfinished: 0, percentage: 0 };
  }
  
  const total = (isGeneratingOutline.value || isSequentiallyGenerating.value) ? totalEpisodesToGenerate.value : (form.value.episodesData?.length || 0);
  let finished = 0;
  
  if (form.value.episodesData) {
    for (const ep of form.value.episodesData) {
      const content = ep.content || '';
      const cleanContent = content.replace(/<p><\/p>|<p>------------------<\/p>|<br>|[\s\n\t\r]/g, '').trim();
      if (cleanContent.length > 0) {
        finished++;
      }
    }
  }
  
  const unfinished = total - finished;
  const percentage = total === 0 ? 0 : Math.round((finished / total) * 100);
  return { total, finished, unfinished, percentage };
});

// Form Data
const form = ref<DramaForm | null>(null);
const errors = reactive<Record<string, string>>({});

// UI & Panel State
const isLeftCollapsed = ref(false);
const isRightPanelVisible = ref(isAIAssistantEnabled.value);
const leftPanelWidth = ref(320);
const isEditingLocked = ref(true);
const showInstructionsDialog = ref(false);
const jumpToEpisodeInput = ref(1);
const rangeTabsRef = ref<HTMLElement | null>(null);

// Drag to scroll logic for episode range tabs
let isDraggingTabs = false;
let startXTabs = 0;
let scrollLeftTabs = 0;

const startDragTabs = (e: MouseEvent) => {
  if (!rangeTabsRef.value) return;
  isDraggingTabs = true;
  startXTabs = e.pageX - rangeTabsRef.value.offsetLeft;
  scrollLeftTabs = rangeTabsRef.value.scrollLeft;
  
  // Temporarily disable smooth scroll for direct drag response
  rangeTabsRef.value.style.scrollBehavior = 'auto';
  
  document.addEventListener('mousemove', onDragTabs);
  document.addEventListener('mouseup', stopDragTabs);
};

const onDragTabs = (e: MouseEvent) => {
  if (!isDraggingTabs || !rangeTabsRef.value) return;
  e.preventDefault();
  const x = e.pageX - rangeTabsRef.value.offsetLeft;
  const walk = (x - startXTabs) * 1.5; // multiplier for speed
  rangeTabsRef.value.scrollLeft = scrollLeftTabs - walk;
};

const stopDragTabs = () => {
  isDraggingTabs = false;
  if (rangeTabsRef.value) {
    rangeTabsRef.value.style.scrollBehavior = 'smooth';
  }
  document.removeEventListener('mousemove', onDragTabs);
  document.removeEventListener('mouseup', stopDragTabs);
};

const handleQuickJump = () => {
  const targetIdx = jumpToEpisodeInput.value - 1;
  quickSelectEpisode(targetIdx);
};

const addNewEpisode = () => {
  if (!form.value || !form.value.episodesData) return;
  
  const newIndex = form.value.episodesData.length;
  const newEpisode: EpisodeData = {
    id: `new-${Date.now()}`,
    title: `第 ${newIndex + 1} 集`,
    summary: '',
    content: '',
    chatHistory: []
  };
  
  form.value.episodesData.push(newEpisode);
  
  // Jump to the new episode
  quickSelectEpisode(newIndex);
  
  ElMessage.success(`已新增第 ${newIndex + 1} 集`);
};

const quickSelectEpisode = (index: number) => {
  // Calculate which range this episode belongs to
  const rangeStart = Math.floor(index / EPISODES_PER_PAGE) * EPISODES_PER_PAGE;
  quickSelectRange(rangeStart);
  
  // Select the episode
  selectEpisode(index);
};

const quickSelectRange = (rangeStart: number) => {
  episodeRange.value = rangeStart;
  
  // Auto-scroll the range tabs to center the active range
  nextTick(() => {
    if (rangeTabsRef.value) {
      const activeTab = rangeTabsRef.value.querySelector('.bg-indigo-600') as HTMLElement;
      if (activeTab) {
        const containerWidth = rangeTabsRef.value.offsetWidth;
        const tabWidth = activeTab.offsetWidth;
        const tabLeft = activeTab.offsetLeft;
        
        // Calculate the scroll position to center the active tab
        const scrollTo = tabLeft - (containerWidth / 2) + (tabWidth / 2);
        
        rangeTabsRef.value.scrollTo({
          left: scrollTo,
          behavior: 'smooth'
        });
      }
    }
  });
};

const aiInstructions = [
  { 
    tag: '续写', 
    behavior: '根据当前上下文逻辑，预测并生成后续剧情或对话。', 
    instruction: '输入一段已有的剧情概括或对话开头，点击续写。',
    command: '“沈念安在雨中遇到了周助理，请续写他们的初次交谈。”' 
  },
  { 
    tag: '润色', 
    behavior: '在不改变原意的前提下，优化遣词造句，提升文学性和可读性。', 
    instruction: '在输入框描述你想要的文风（如：凄美、干练），点击润色。',
    command: '“润色这段心理活动，使其显得更加凄美、决绝。”' 
  },
  { 
    tag: '扩写', 
    behavior: '增加细节描写（环境、动作、神态），使干瘪的句子变得丰满。', 
    instruction: '输入需要增加的细节重点（如：环境压抑感），点击扩写。',
    command: '“扩写这段雨景描写，突出环境的压抑感和主角的无助。”' 
  },
  { 
    tag: '改写', 
    behavior: '改变叙述视角、语气或文风，重新演绎同一段剧情。', 
    instruction: '在输入框指定新的视角或语气（如：悬疑感），点击改写。',
    command: '“用更有悬疑感的方式改写这段沈薇薇出场的剧情。”' 
  },
  { 
    tag: '优化对话', 
    behavior: '调整对白，使其更符合人设、更具张力或更具口语化。', 
    instruction: '输入对角色的性格补充或对话目的，直接点击发送按钮。',
    command: '“优化顾承泽的表白对话，让他显得更加深情且带有愧疚。”' 
  },
  { 
    tag: '增加冲突', 
    behavior: '在现有场景中引入突发矛盾或利益对立，提升剧情爆发力。', 
    instruction: '输入冲突的引子或秘密，点击增加冲突。',
    command: '“在对峙中增加一个关于沈家继承权的秘密冲突。”' 
  },
  { 
    tag: '情感渲染', 
    behavior: '强化角色内心波动和氛围营造，引发读者情感共鸣。', 
    instruction: '输入想要强化的情感（如：绝望、狂喜），点击情感渲染。',
    command: '“情感渲染：沈念安看着被撕毁的致辞稿时的绝望心境。”' 
  },
  { 
    tag: '五感填充', 
    behavior: '从视觉、听觉、嗅觉、味觉、触觉多维度补全细节，增强临场感。', 
    instruction: '输入想要重点描写的感官，点击五感填充。',
    command: '“五感填充：描写宴会厅里的香槟味、嘈杂的人声和冰冷的手心。”' 
  },
  { 
    tag: '增加反差', 
    behavior: '制造人物行为与环境、或不同人物之间的强烈对比，突出张力。', 
    instruction: '输入对比的两个元素（如：繁华背景与荒凉内心），点击增加反差。',
    command: '“增加反差：在繁华璀璨的宴会背景下，衬托沈念安内心的荒凉与孤独。”' 
  }
];

// Editor State
const tiptapEditor = ref<Editor | null>(null);
const editorTextContent = ref('');
const showEmptyPlaceholder = ref(true);
const isSwitchingContent = ref(false);
const scriptBodyRef = ref<HTMLElement | null>(null);

// AI Assistant & Chat State
const chatMessages = ref<{id: string, role: 'ai'|'user', content: string, isGenerating?: boolean}[]>([]);
const aiPromptPopoverVisible = ref<Record<string, boolean>>({});
const aiPromptInput = ref('');
const quotedText = ref('');
const rightPanelChatRef = ref<HTMLElement | null>(null);

// AI Proposal State
const aiProposal = reactive({
  isActive: false,
  original: '',
  modified: '',
  action: '',
  selection: { from: 0, to: 0 },
  isGenerating: false
});

// Custom Central Warning State
const customWarning = reactive({
  visible: false,
  message: ''
});

let warningTimer: any = null;
const showCustomWarning = (msg: string) => {
  customWarning.message = msg;
  customWarning.visible = true;
  if (warningTimer) clearTimeout(warningTimer);
  warningTimer = setTimeout(() => {
    customWarning.visible = false;
  }, 3500);
};

// Design Dialog State
const showDesignDialog = ref(false);
const showScriptDesignDialog = ref(false);
const showUIDesignSpecsDialog = ref(false);

const uiDesignGroups = {
  layout: [
    {
      id: 'outlineView',
      title: '剧本创作页 (OutlineView)',
      description: '三栏创作工作台：左侧剧集大纲 + 中栏剧本正文编辑器 + 右侧 AI 智能助手。',
      items: [
        { name: '页面内边距', value: 'p-4 / lg:p-6', description: '三栏整体 padding' },
        { name: '栏间距', value: 'gap-4 / lg:gap-6', description: '左/中/右之间间距' },
        { name: '左侧栏默认宽度', value: '320px', description: 'leftPanelWidth 默认值，可拖拽调整' },
        { name: '右侧助手宽度', value: '360px', description: '展开时固定宽度，支持折叠' },
        { name: '侧栏圆角', value: '28px', description: 'rounded-[28px]（左/右容器）' },
        { name: '中栏圆角', value: '32px', description: 'rounded-[32px]（正文画布容器）' },
        { name: '侧栏头部高度', value: 'h-16', description: '标题栏高度统一' },
        { name: '统计条圆角', value: '20px', description: 'rounded-[20px]' },
        { name: '剧集卡圆角', value: 'rounded-2xl', description: 'episode-card 的基础圆角' },
        { name: '编辑卡圆角', value: '24px', description: 'rounded-[24px]（正文编辑卡）' },
        { name: '正文滚动内边距', value: 'p-4 / lg:p-6', description: '编辑区外层滚动容器' },
        { name: '正文内容内边距', value: 'p-6 / lg:p-10', description: 'editor-content 内部 padding' },
        { name: '折叠把手尺寸', value: 'w-7 h-20', description: '左右侧栏浮动折叠按钮' },
        { name: '范围 Tab 尺寸', value: 'px-4 py-2', description: 'episodeRange Tabs（剧集导航）' }
      ]
    }
  ],
  style: [
    {
      id: 'outlineView',
      title: '剧本创作页 (OutlineView)',
      description: '核心字号、字重与文案层级。',
      items: [
        { name: '页面主容器', style: { fontSize: '14px', fontWeight: '500' }, description: 'text-[#1f2329]（整体文字基色）' },
        { name: '侧栏标题', style: { fontSize: '16px', fontWeight: '900' }, description: 'text-[16px] font-black（剧集大纲）' },
        { name: '统计数字', style: { fontSize: '15px', fontWeight: '900' }, description: 'text-[15px] font-black（总数/已完/未完）' },
        { name: '剧集标签', style: { fontSize: '14px', fontWeight: '900' }, description: 'text-[14px] font-black（第 N 集）' },
        { name: '正文标题', style: { fontSize: '18px', fontWeight: '900' }, description: 'text-[18px] font-black（剧本正文）' },
        { name: '正文状态标签', style: { fontSize: '10px', fontWeight: '900', letterSpacing: '0.12em' }, description: 'text-[10px] font-black uppercase tracking-widest' },
        { name: '空态标题', style: { fontSize: '20px', fontWeight: '900' }, description: 'text-[20px] font-black（空白提示）' },
        { name: '助手标题', style: { fontSize: '15px', fontWeight: '900' }, description: 'text-[15px] font-black（AI 智能助手）' },
        { name: '对话正文', style: { fontSize: '13px', fontWeight: '500', lineHeight: '1.6' }, description: 'text-[13px] leading-relaxed（气泡内容）' },
        { name: '标签/胶囊', style: { fontSize: '10px', fontWeight: '900', letterSpacing: '0.2em' }, description: 'text-[10px] font-black uppercase tracking-[0.2em]' }
      ]
    }
  ],
  color: [
    {
      id: 'outlineView',
      title: '剧本创作页 (OutlineView)',
      description: '页面背景、容器底色与状态色。',
      items: [
        { name: '页面背景渐变', value: 'from-[#F8FAFC] to-[#F1F5F9]' },
        { name: '装饰光晕', value: 'bg-indigo-500/5 + bg-purple-500/5' },
        { name: '侧栏容器', value: 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl' },
        { name: '侧栏分割线', value: 'border-slate-100 dark:border-slate-700/50' },
        { name: '统计条底色', value: 'bg-slate-50/50 dark:bg-slate-900/30' },
        { name: '新增剧集按钮', value: 'bg-indigo-600 text-white shadow-indigo-500/20' },
        { name: '剧集卡-激活', value: 'border-indigo-500/50 + from-indigo-50/90 to-purple-50/90' },
        { name: '剧集卡-未激活', value: 'bg-white dark:bg-slate-800/40 border-slate-100 hover:border-indigo-300' },
        { name: '正文画布底色', value: 'bg-[#F0F7FF]' },
        { name: '正文工具栏', value: 'bg-white/60 dark:bg-slate-800/50 border-blue-100/50' },
        { name: '正文编辑卡', value: 'bg-white dark:bg-slate-900 border-blue-100' },
        { name: '自动保存状态', value: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
        { name: '右侧助手头部渐变', value: 'from-indigo-50/50 to-purple-50/50' },
        { name: '右侧助手背景', value: 'bg-[#F9FBFF] dark:bg-slate-900/20' },
        { name: '对话气泡-AI', value: 'bg-white border-slate-100 rounded-tl-none' },
        { name: '对话气泡-用户', value: 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none' }
      ]
    }
  ],
  button: [
    {
      id: 'outlineView',
      title: '剧本创作页 (OutlineView)',
      description: '关键按钮、卡片与交互态。',
      items: [
        { name: '页面三栏容器', tag: 'div', classes: 'flex h-full w-full overflow-hidden p-4 lg:p-6 gap-4 lg:gap-6 bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9]', notes: ['三栏工作台基座，支持深色模式渐变'] },
        { name: '左侧栏容器', tag: 'div', classes: 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[28px] border border-white dark:border-slate-700/50 shadow-2xl', notes: ['默认宽 320px，可拖拽改变'] },
        { name: 'UI 标注按钮', tag: 'button', classes: 'fixed bottom-6 right-6 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 shadow-lg shadow-indigo-500/30 text-white hover:scale-105 active:scale-95 transition-transform', notes: ['页面右下角悬浮（Monitor 图标）；打开 UI 设计标注弹窗（含分类 Tabs）'] },
        { name: '产品说明按钮', tag: 'button', classes: 'w-8 h-8 bg-white/80 dark:bg-slate-800/80 rounded-full border border-slate-200/50 text-slate-400 hover:text-indigo-600', notes: ['位于左侧栏右上角（InfoFilled 图标）'] },
        { name: '新增剧集按钮', tag: 'button', classes: 'h-9 px-4 bg-indigo-600 text-white rounded-xl text-[12px] font-black shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95', notes: ['用于手动新增剧集（Plus 图标）'] },
        { name: '剧集卡片-激活态', tag: 'div', classes: 'border-indigo-500/50 bg-gradient-to-br from-indigo-50/90 to-purple-50/90 shadow-xl shadow-indigo-500/10', notes: ['显示“正在编辑”徽标；可叠加生成中 ring'] },
        { name: '剧集卡片-未激活态', tag: 'div', classes: 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5', notes: ['Hover: 图标底色/文字变为 indigo'] },
        { name: '剧集导航范围 Tab', tag: 'button', classes: 'px-4 py-2 rounded-xl text-[11px] font-black transition-all duration-500 border relative overflow-hidden', notes: ['Active: bg-indigo-600 text-white border-transparent shadow-indigo-500/20 scale-105', 'Inactive: bg-slate-50 text-slate-500 border-slate-100 hover:border-indigo-300 hover:text-indigo-600'] },
        { name: '中栏画布容器', tag: 'div', classes: 'flex-1 flex flex-col bg-[#F0F7FF] dark:bg-slate-800/80 rounded-[32px] border border-blue-100 dark:border-slate-700/50 overflow-hidden', notes: ['承载工具栏 + 编辑器卡；整体偏蓝氛围'] },
        { name: '正文工具栏', tag: 'div', classes: 'p-4 bg-white/60 dark:bg-slate-800/50 border-b border-blue-100/50 flex items-center justify-between', notes: ['左侧标题与状态；右侧自动保存徽标'] },
        { name: '自动保存徽标', tag: 'span', classes: 'px-4 py-1.5 rounded-full text-[12px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100', notes: ['保存中：Loading + 文案“保存中...”'] },
        { name: '正文编辑卡', tag: 'div', classes: 'bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-700/50 rounded-[24px] shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10', notes: ['内部使用 Tiptap，空态覆盖层提示'] },
        { name: '完成去主体 (主 CTA)', tag: 'button', classes: 'h-11 px-10 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-2xl text-[14px] font-black shadow-xl shadow-indigo-500/30 hover:scale-[1.03] active:scale-95 disabled:opacity-50', notes: ['位于正文区域底部操作栏'] },
        { name: '右侧助手容器', tag: 'div', classes: 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[28px] border border-white dark:border-slate-700/50 shadow-2xl', notes: ['宽 360px，支持折叠'] },
        { name: '发送按钮', tag: 'button', classes: 'w-10 h-10 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95', notes: ['位于输入框 suffix，图标 Top'] },
        { name: '对话气泡-AI', tag: 'div', classes: 'bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-100 text-[13px] leading-relaxed', notes: ['左对齐，带“AI 助手”标识'] },
        { name: '对话气泡-用户', tag: 'div', classes: 'bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-none border border-indigo-500 text-[13px] leading-relaxed', notes: ['右对齐'] },
        { name: '快捷动作按钮组', tag: 'div', classes: 'grid grid-cols-4 gap-2', notes: ['动作：续写/润色/扩写/改写；图标 hover 变 indigo 底色'] },
        { name: '折叠把手', tag: 'div', classes: 'w-7 h-20 rounded-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-indigo-100/50 dark:border-indigo-900/50 shadow-[0_4px_25px_rgba(99,102,241,0.25)]', notes: ['左右两侧一致；Hover: scale-y-110 + 背景变浅'] }
      ]
    }
  ]
};

// Context Menu State
const contextMenuVisible = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);

const SEPARATOR = '<p>------------------</p>';

const isEpisodeLocked = (index: number) => {
  if (editMode.value === 'full') return false;
  if (index === 0) return false;
  if (!form.value || !form.value.episodesData) return false;
  const prevEpisode = form.value.episodesData[index - 1];
  // 检查前一集是否有实际内容（过滤掉空标签、分隔符、空格等）
  const content = prevEpisode?.content || '';
  const cleanContent = content.replace(/<p><\/p>|<p>------------------<\/p>|<br>|[\s\n\t\r]/g, '').trim();
  return cleanContent.length === 0;
};

const currentEpisode = computed(() => {
  if (!form.value?.episodesData?.length) return null;
  return form.value.episodesData[currentEpisodeIndex.value] || null;
});

const currentEpisodeLabel = computed(() => {
  const fallback = `第 ${currentEpisodeIndex.value + 1} 集`;
  const title = currentEpisode.value?.title?.trim();
  return title || fallback;
});

const currentEpisodeSummary = computed(() => {
  const summary = currentEpisode.value?.summary?.trim();
  return summary || '当前分集暂无剧情梗概';
});

const isCurrentEpisode = (episodeId: string, episodeIndex: number) => {
  if (editMode.value !== 'episode') return false;
  return currentEpisodeIndex.value === episodeIndex;
};

let isSwitchingEpisode = false;

const selectEpisode = async (index: number | string) => {
  if (isSwitchingEpisode) return; // 防止快速点击导致状态错乱

  try {
    isSwitchingEpisode = true;
    
    if (!form.value || !Array.isArray(form.value.episodesData)) {
      console.warn('Form or episodesData not ready');
      return;
    }
    
    const targetIndex = Number(index);
    if (isNaN(targetIndex) || targetIndex < 0 || targetIndex >= (form.value?.episodesData?.length || 0)) {
      console.warn('Invalid target index:', index);
      return;
    }
    
    // 如果已经在该集且是分集模式，则不需要切换
    if (editMode.value === 'episode' && currentEpisodeIndex.value === targetIndex) return;

    // 触发切换淡出动画
    isSwitchingContent.value = true;
    
    // 等待 150ms 以允许 fade-out 动画执行
    await new Promise(resolve => setTimeout(resolve, 150));

    // 切换前保存当前分集的数据
    if (editMode.value === 'episode') {
      saveCurrentContentToStore();
      if (form.value.episodesData[currentEpisodeIndex.value]) {
        form.value.episodesData[currentEpisodeIndex.value].chatHistory = [...chatMessages.value];
      }
    }

    // 更新状态
    editMode.value = 'episode';
    currentEpisodeIndex.value = targetIndex;
    isRightPanelVisible.value = true;
    
    // 加载目标分集的内容
    loadContentFromStore();

    // 加载目标分集的聊天历史
    if (form.value.episodesData[targetIndex]) {
      chatMessages.value = [...(form.value.episodesData[targetIndex].chatHistory || [])];
    }
    
    // 滚动到顶部并结束动画
    await nextTick();
    if (rightPanelChatRef.value) rightPanelChatRef.value.scrollTop = 0;
    if (scriptBodyRef.value) scriptBodyRef.value.scrollTop = 0;
    
    // 触发 fade-in
    isSwitchingContent.value = false;
  } catch (error) {
    console.error('Error in selectEpisode:', error);
    isSwitchingContent.value = false;
    // 延迟显示错误，避免在组件卸载或更新过程中触发 Element Plus 内部错误
    setTimeout(() => {
      ElMessage.error('切换剧集失败，请重试');
    }, 100);
  } finally {
    // 稍微延迟释放锁，防止动画期间的二次触发
    setTimeout(() => {
      isSwitchingEpisode = false;
    }, 200);
  }
};

const saveCurrentContentToStore = () => {
  try {
    if (!form.value || isSwitchingContent.value || !tiptapEditor.value) return;
    const content = tiptapEditor.value.getHTML();
    
    if (editMode.value === 'full') {
      form.value.fullContent = content;
      // 使用正则匹配分隔符，允许标签内包含样式属性
      const parts = content.split(/<p[^>]*>------------------<\/p>/g);
      form.value.episodesData.forEach((ep, idx) => {
        if (parts[idx] !== undefined) {
          // 去除多余的空行和 HTML 标签，仅保留纯内容或标准格式
          ep.content = parts[idx].trim();
        }
      });
    } else {
      // 同步当前分集内容
      if (form.value.episodesData && form.value.episodesData[currentEpisodeIndex.value]) {
        form.value.episodesData[currentEpisodeIndex.value].content = content;
        form.value.episodesData[currentEpisodeIndex.value].chatHistory = [...chatMessages.value];
      }
      // 同步全集内容：重新合并所有分集
      form.value.fullContent = form.value.episodesData
        .map(ep => ep.content || '<p></p>')
        .join(SEPARATOR);
    }
    
    // 同步至 Pinia
    if (dramaStore && typeof dramaStore.setOutlineData === 'function') {
      dramaStore.setOutlineData(JSON.parse(JSON.stringify(form.value)));
    }
  } catch (error) {
    console.error('Error in saveCurrentContentToStore:', error);
  }
};

const loadContentFromStore = () => {
  try {
    if (!form.value || !tiptapEditor.value) return;
    
    let content = '';
    if (editMode.value === 'full') {
      const mergedContent = form.value.episodesData
        .map(ep => ep.content || '<p></p>')
        .join(SEPARATOR);
      
      const hasAnyContent = form.value.episodesData.some(ep => ep.content && ep.content.replace(/<p><\/p>/g, '').trim().length > 0);
      if (hasAnyContent) {
        content = mergedContent;
        form.value.fullContent = mergedContent;
      } else {
        content = form.value.fullContent || '';
      }
    } else {
      if (form.value.episodesData && form.value.episodesData[currentEpisodeIndex.value]) {
        content = form.value.episodesData[currentEpisodeIndex.value].content || '';
      }
    }
    
    tiptapEditor.value.commands.setContent(content);
    
    const text = tiptapEditor.value.getText().trim();
    editorTextContent.value = text;
    
    if (!text) {
      isEditingLocked.value = false;
    }
    
    showEmptyPlaceholder.value = !text;
    
    if (dramaStore && typeof dramaStore.setScriptGenerated === 'function') {
      const hasAnyContent = form.value.episodesData && form.value.episodesData.some((ep: any) => ep.content && ep.content.replace(/<p><\/p>/g, '').trim().length > 0);
      dramaStore.setScriptGenerated(hasAnyContent || !!text);
    }
  } catch (error) {
    console.error('Error in loadContentFromStore:', error);
  }
};

// Add watch for other form fields to ensure they are also persisted to Pinia
let isSyncingToStore = false;
watch(() => form.value, (newForm) => {
  if (newForm && !isSyncingToStore) {
    isSyncingToStore = true;
    dramaStore.setOutlineData(JSON.parse(JSON.stringify(newForm)));
    nextTick(() => {
      isSyncingToStore = false;
    });
  }
}, { deep: true });

// Sync chat history back to form when chatMessages changes
watch(chatMessages, (newMsgs) => {
  if (form.value && editMode.value === 'episode' && form.value.episodesData && form.value.episodesData[currentEpisodeIndex.value]) {
    // 避免在此处改变引用的地址，否则会触发上方的 deep watch 造成循环
    form.value.episodesData[currentEpisodeIndex.value].chatHistory = newMsgs;
  }
}, { deep: true });

// Watch for mode or episode changes
watch([editMode, currentEpisodeIndex], (newVal, oldVal) => {
  loadContentFromStore();
});

const saveScriptContent = () => {
  // 此方法现作为内部防抖保存使用
  isSavingScript.value = true;
  setTimeout(() => {
    isSavingScript.value = false;
  }, 600);
};

const goToSubjectSettings = async () => {
  if (isGeneratingOutline.value || isSequentiallyGenerating.value) {
    showCustomWarning('当前剧本的大纲概要正在生成中，预计30秒左右');
    return;
  }
  if (!editorTextContent.value) {
    showCustomWarning('请先生成或编写剧本内容，再进行后续设置');
    return;
  }
  isSavingScript.value = true;
  // 强制同步当前所有内容
  saveCurrentContentToStore();
  
  // 模拟后端持久化 API 调用
  try {
    await new Promise(resolve => setTimeout(resolve, 800)); // 模拟网络请求
    
    ElMessage.success('剧本完全保存成功！正在前往主体设置...');
    router.push('/ai-short-drama-creator/assets');
  } catch (error) {
    ElMessage.error('保存失败，请检查网络后重试');
  } finally {
    isSavingScript.value = false;
  }
};

const validateField = (field: string) => {
  if (!form.value) return;
  if (field === 'background') {
    if (form.value.background.length > 200) {
      errors.background = '故事背景不能超过200字';
    } else {
      errors.background = '';
    }
  }
  if (field === 'synopsis') {
    if (form.value.synopsis.length > 300) {
      errors.synopsis = '故事梗概不能超过300字';
    } else {
      errors.synopsis = '';
    }
  }
};

const getWordCountColor = (field: string) => {
  if (!form.value) return 'text-slate-400';
  const value = form.value[field as keyof typeof form.value];
  const length = typeof value === 'string' ? value.length : 0;
  if (field === 'background') return length > 200 ? 'text-red-500' : 'text-slate-400';
  if (field === 'synopsis') return length > 300 ? 'text-red-500' : 'text-slate-400';
  return 'text-slate-400';
};

const applyAIAction = (actionName: string) => {
  contextMenuVisible.value = false;
  if (!tiptapEditor.value) return;

  // Requirement: First enter user's idea in the input box, then use these labels.
  if (!aiPromptInput.value.trim()) {
    ElMessage.warning('请先在输入框输入你的想法，然后再点击功能标签');
    return;
  }

  const { from, to } = tiptapEditor.value.state.selection;
  const selectedText = tiptapEditor.value.state.doc.textBetween(from, to, ' ');
  
  // Use quotedText if it's set and no new selection is made, or use current selection
  const sourceText = selectedText.trim() || quotedText.value;

  // Combine tag action with manual input
  const userIdea = aiPromptInput.value.trim();
  const fullPrompt = userIdea ? `${actionName}：${userIdea}` : actionName;

  // Initialize proposal state
  aiProposal.isActive = true;
  aiProposal.isGenerating = true;
  aiProposal.action = fullPrompt;
  aiProposal.original = sourceText;
  aiProposal.modified = '';
  aiProposal.selection = { from, to };

  // Clear quote and input after use
  const usedIdea = aiPromptInput.value;
  quotedText.value = '';
  aiPromptInput.value = '';

  // Make right panel visible to show comparison
  isRightPanelVisible.value = true;
  
  // Scroll right panel to bottom to show proposal
  nextTick(() => {
    if (rightPanelChatRef.value) {
      rightPanelChatRef.value.scrollTop = rightPanelChatRef.value.scrollHeight;
    }
  });

  // Mock AI generation insertion - Now using the input to make it feel "combined"
  let i = 0;
  const mockText = sourceText
    ? `【AI ${actionName} 建议】针对您的想法“${usedIdea || '优化内容'}”，我将原文进行了深度调整：此时，沈念安深吸一口气，雨水混合着泪水流下面庞。她缓缓抬起头，迎向那道深邃的目光。每一个毛孔似乎都在颤栗，但她的脊背挺得笔直，像是要在这一场绝望的暴雨中开出一朵带刺的玫瑰。`
    : `【AI ${actionName} 生成】基于您的想法“${usedIdea}”：劳斯莱斯的车门缓缓打开，一个黑影撑着伞走下车，伞尖滴落的水珠在雨幕中划出冰冷的弧线。沈念安看着那双锃亮的皮鞋停在自己面前，听到了一个低沉且富有磁性的声音。`;

  const interval = setInterval(() => {
    aiProposal.modified += mockText.charAt(i);
    i++;
    if (i >= mockText.length) {
      clearInterval(interval);
      aiProposal.isGenerating = false;
      ElMessage.success(`AI ${actionName} 已构思完成，请查看对比`);
    }
  }, 20);
};

const acceptAIProposal = () => {
  if (tiptapEditor.value && aiProposal.isActive) {
    const { from, to } = aiProposal.selection;
    
    // 移除提示性前缀，仅保留正文（处理全角和半角冒号）
    let contentToInsert = aiProposal.modified;
    
    // 查找最后一个冒号，通常提示语以冒号结尾
    const separatorIdx = contentToInsert.lastIndexOf('：');
    const halfSeparatorIdx = contentToInsert.lastIndexOf(':');
    const idx = Math.max(separatorIdx, halfSeparatorIdx);
    
    if (idx !== -1 && idx < contentToInsert.length * 0.4) {
      contentToInsert = contentToInsert.substring(idx + 1).trim();
    }
    
    // 将该次 AI 建议作为正式对话记录保存到历史
    chatMessages.value.push({
      id: Date.now().toString(),
      role: 'ai',
      content: `【已采纳建议】\n${aiProposal.modified}`
    });

    // Replace selected range with modified content
    tiptapEditor.value.commands.insertContentAt({ from, to }, contentToInsert);
    aiProposal.isActive = false;
    
    // 滚动聊天区域到底部
    nextTick(() => {
      if (rightPanelChatRef.value) {
        rightPanelChatRef.value.scrollTop = rightPanelChatRef.value.scrollHeight;
      }
    });
    
    ElMessage.success('已应用 AI 建议到剧本');
  }
};

const rejectAIProposal = () => {
  if (aiProposal.isActive) {
    // 将该次 AI 建议作为已放弃记录保存到历史
    chatMessages.value.push({
      id: Date.now().toString(),
      role: 'ai',
      content: `【已放弃建议】\n${aiProposal.modified}`
    });
    
    aiProposal.isActive = false;
    
    // 滚动聊天区域到底部
    nextTick(() => {
      if (rightPanelChatRef.value) {
        rightPanelChatRef.value.scrollTop = rightPanelChatRef.value.scrollHeight;
      }
    });
    
    ElMessage.info('已放弃 AI 建议');
  }
};

const openContextMenu = (e: MouseEvent) => {
  // Positioning directly under the mouse
  contextMenuX.value = e.clientX;
  contextMenuY.value = e.clientY;
  contextMenuVisible.value = true;
};

const closeContextMenu = () => {
  contextMenuVisible.value = false;
};

const quoteSelectedText = () => {
  if (tiptapEditor.value) {
    const { from, to } = tiptapEditor.value.state.selection;
    const selectedText = tiptapEditor.value.state.doc.textBetween(from, to, ' ');
    if (selectedText.trim()) {
      quotedText.value = selectedText.trim();
      isRightPanelVisible.value = true;
      ElMessage.success('已引用至 AI 助手');
    } else {
      ElMessage.warning('请先选择一段文本');
    }
  }
  closeContextMenu();
};

// --- Mock API for Prefilling Info ---
const fetchAutoPrefillInfo = () => {
  return new Promise((resolve) => {
    const episodes = Array.from({ length: 100 }, (_, i) => ({
      id: `p${i + 1}`,
      title: `第${i + 1}集`,
      summary: i === 0 
        ? '订婚宴上，沈薇薇突然闯入并宣布怀了姐夫顾承泽的孩子，全场震惊，沈念安的世界崩塌。'
        : i === 1
        ? '沈家父母偏袒亲生女儿沈薇薇，当众羞辱沈念安是养女并撕毁其致辞，亲情彻底决裂。'
        : i === 2
        ? '沈念安被保安驱逐，发现工作室被查封，在暴雨中绝望等死时遇到神秘劳斯莱斯。'
        : `这是第 ${i + 1} 集的剧情发展，故事更加扑朔迷离...`,
      scenes: '场景待定',
      characters: '沈念安等',
      content: '',
      chatHistory: []
    }));

    setTimeout(() => {
      resolve({
        title: '沈念安的重生',
        scriptType: 'short_drama',
        genre: '都市情感',
        targetAudience: '女性向',
        episodesCount: 100,
        expectedDuration: 120,
        synopsis: '沈念安本以为订婚是幸福的开始，却在订婚宴上遭遇妹妹沈薇薇怀了未婚夫顾承泽孩子的重击。随后被沈家父母以养女身份驱逐，甚至工作室也被查封。在大雨中，神秘人周助理和他的先生出现在她面前，开启了她的逆袭之路。',
        background: '豪门沈家，表面风光无限。沈念安作为沈家养女，多年来小心翼翼，本以为能通过与顾家的联姻获得真正的家庭归属感。然而，这一切都在沈家亲生女儿沈薇薇回国后化为影。在金钱与亲情的博弈中，沈念安成了被抛弃的棋子。',
        fullContent: '',
        episodesData: episodes
      });
    }, 400);
  });
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.ctrlKey && e.key === '\\') {
    isRightPanelVisible.value = !isRightPanelVisible.value;
    e.preventDefault();
  }
};

onMounted(async () => {
  window.addEventListener('keydown', handleKeydown);
  document.addEventListener('click', closeContextMenu);

  // Load state from localStorage first
  dramaStore.loadFromLocalStorage();

  tiptapEditor.value = new Editor({
    extensions: [
      StarterKit,
      CharacterCount.configure({ limit: 50000 }),
      BubbleMenuExtension,
      Placeholder.configure({
        placeholder: ({ node }) => {
          return editMode.value === 'full' ? '全集剧本还是一片空白' : currentEpisodeLabel.value;
        }
      })
    ],
    content: '',
    onUpdate: ({ editor }) => {
      // 防止在切换内容时产生的 update 触发无限循环
      if (isSwitchingContent.value) return;
      
      const text = editor.getText().trim();
      if (editorTextContent.value !== text) {
        editorTextContent.value = text;
        showEmptyPlaceholder.value = !text;
        
        const hasAnyContent = form.value?.episodesData && form.value.episodesData.some((ep: any) => ep.content && ep.content.replace(/<p><\/p>/g, '').trim().length > 0);
        dramaStore.setScriptGenerated(hasAnyContent || !!text);
        
        saveCurrentContentToStore();
      }
    },
    editorProps: {
      attributes: {
        class: 'prose-modern focus:outline-none'
      },
      editable: () => !isEditingLocked.value && !isEpisodeLocked(currentEpisodeIndex.value) && !isScriptLockedGlobal.value
    }
  });

  // 监听锁定状态、当前分集、编辑模式或分集内容变化，实时更新编辑器可编辑状态
  watch([isEditingLocked, currentEpisodeIndex, editMode, () => form.value?.episodesData, isScriptLockedGlobal], () => {
    // 防止在编辑器加载时频繁切换状态触发循环
    if (isSwitchingContent.value) return;
    tiptapEditor.value?.setEditable(!isEditingLocked.value && !isEpisodeLocked(currentEpisodeIndex.value) && !isScriptLockedGlobal.value);
  }, { deep: true });

  isInfoLoading.value = true;
  try {
    // Check for interrupted generation
    if (dramaStore.generationStatus.isGenerating && dramaStore.generationStatus.type === 'outline') {
      const { currentIndex, totalCount, progress } = dramaStore.generationStatus;
      
      // If we have some data, restore it and potentially resume
      if (dramaStore.outlineData) {
        form.value = JSON.parse(JSON.stringify(dramaStore.outlineData));
        totalEpisodesToGenerate.value = totalCount;
        currentGeneratingIndex.value = currentIndex;
        generationProgress.value = progress;
        
        recoveryConfirmTitle.value = '恢复生成';
        recoveryConfirmMessage.value = `检测到上次大纲生成（第 ${currentIndex + 1}/${totalCount} 集）意外中断，是否继续生成？`;
        recoveryConfirmType.value = 'outline';
        recoveryConfirmVisible.value = true;
      }
    } else if (dramaStore.generationStatus.isGenerating && dramaStore.generationStatus.type === 'script') {
      const { progress } = dramaStore.generationStatus;
      if (dramaStore.outlineData) {
        form.value = JSON.parse(JSON.stringify(dramaStore.outlineData));
        loadContentFromStore();
        
        recoveryConfirmTitle.value = '恢复生成';
        recoveryConfirmMessage.value = `检测到剧本正文生成中断（进度 ${progress}%），是否继续生成？`;
        recoveryConfirmType.value = 'script';
        recoveryConfirmVisible.value = true;
      }
    } else if (dramaStore.outlineData) {
      form.value = JSON.parse(JSON.stringify(dramaStore.outlineData));
      // Sync current chat messages with initial currentEpisodeIndex
      if (form.value && form.value.episodesData && form.value.episodesData[currentEpisodeIndex.value]) {
        chatMessages.value = form.value.episodesData[currentEpisodeIndex.value].chatHistory || [];
      }
      // After loading, update the editor content
      loadContentFromStore();
    } else {
      // Start New Sequential Generation
       isGeneratingOutline.value = true;
       const initialData: any = await fetchInitialDramaInfo();
       form.value = JSON.parse(JSON.stringify(initialData));
       totalEpisodesToGenerate.value = initialData.episodesCount;
       
       // Clear episodesData first to show sequential generation
       if (form.value) {
         form.value.episodesData = [];
       }
       
       // Hide big loading after initial setup
        isGeneratingOutline.value = false;
        isInfoLoading.value = false; // Allow the list to be visible during generation
        isSequentiallyGenerating.value = true;
       
        // Update generation status in store
        dramaStore.setGenerationStatus({
          isGenerating: true,
          type: 'outline',
          totalCount: totalEpisodesToGenerate.value,
          currentIndex: 0,
          progress: 0
        });

       // Generate one by one
       for (let i = 0; i < totalEpisodesToGenerate.value; i++) {
         currentGeneratingIndex.value = i;
         generationProgress.value = Math.round(((i + 1) / totalEpisodesToGenerate.value) * 100);
         
         // Update generation status in store
         dramaStore.setGenerationStatus({
           currentIndex: i,
           progress: generationProgress.value
         });

         // Mock generation delay for each episode
         const delay = i < 3 ? 1200 : 250;
         await new Promise(resolve => setTimeout(resolve, delay));
         
         const newEpisode = {
           id: `p${i + 1}`,
           title: `第${i + 1}集`,
           summary: i === 0 
             ? '订婚宴上，沈薇薇突然闯入并宣布怀了姐夫顾承泽的孩子，全场震惊，沈念安的世界崩塌。'
             : i === 1
             ? '沈家父母偏袒亲生女儿沈薇薇，当众羞辱沈念安是养女并撕毁其致辞，亲情彻底决裂。'
             : i === 2
             ? '沈念安被保安驱逐，发现工作室被查封，在暴雨中绝望等死时遇到神秘劳斯莱斯。'
             : `这是第 ${i + 1} 集的剧情发展，沈念安在逆袭之路上越走越稳，${i % 5 === 0 ? '遇到了新的挑战。' : '逐渐揭开了当年的真相。'}`,
           scenes: '场景待定',
           characters: '沈念安等',
           content: '',
           chatHistory: []
         };
         
         if (form.value) {
           form.value.episodesData.push(newEpisode);
         }
         
         // Update Pinia store incrementally
         dramaStore.setOutlineData(JSON.parse(JSON.stringify(form.value)));
       }
       
       isSequentiallyGenerating.value = false;
       currentGeneratingIndex.value = -1;
       dramaStore.setGenerationStatus({ isGenerating: false, type: '' });
       
       // Final load
       loadContentFromStore();
    }
  } catch (error) {
    console.error('Error during OutlineView initialization:', error);
  } finally {
    isInfoLoading.value = false;
  }
});

const resumeSequentialGeneration = async (startIndex: number) => {
  if (!form.value) return;
  
  isSequentiallyGenerating.value = true;
  isInfoLoading.value = false;

  for (let i = startIndex; i < totalEpisodesToGenerate.value; i++) {
    currentGeneratingIndex.value = i;
    generationProgress.value = Math.round(((i + 1) / totalEpisodesToGenerate.value) * 100);
    
    // Update generation status in store
    dramaStore.setGenerationStatus({
      currentIndex: i,
      progress: generationProgress.value
    });

    const delay = i < startIndex + 3 ? 1200 : 250;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    const newEpisode = {
      id: `p${i + 1}`,
      title: `第${i + 1}集`,
      summary: `这是第 ${i + 1} 集的剧情发展（恢复生成），沈念安在逆袭之路上越走越稳...`,
      scenes: '场景待定',
      characters: '沈念安等',
      content: '',
      chatHistory: []
    };
    
    form.value.episodesData.push(newEpisode);
    dramaStore.setOutlineData(JSON.parse(JSON.stringify(form.value)));
  }
  
  isSequentiallyGenerating.value = false;
  currentGeneratingIndex.value = -1;
  dramaStore.setGenerationStatus({ isGenerating: false, type: '' });
  loadContentFromStore();
};

const fetchInitialDramaInfo = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        title: '沈念安的重生',
        scriptType: 'short_drama',
        genre: '都市情感',
        targetAudience: '女性向',
        episodesCount: 100,
        expectedDuration: 120,
        synopsis: '沈念安本以为订婚是幸福的开始，却在订婚宴上遭遇妹妹沈薇薇怀了未婚夫顾承泽孩子的重击。随后被沈家父母以养女身份驱逐，甚至工作室也被查封。在大雨中，神秘人周助理和他的先生出现在她面前，开启了她的逆袭之路。',
        background: '豪门沈家，表面风光无限。沈念安作为沈家养女，多年来小心翼翼，本以为能通过与顾家的联姻获得真正的家庭归属感。然而，这一切都在沈家亲生女儿沈薇薇回国后化为影。在金钱与亲情的博弈中，沈念安成了被抛弃的棋子。',
        fullContent: '',
        episodesData: []
      });
    }, 800);
  });
};

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
  document.removeEventListener('click', closeContextMenu);
  if (tiptapEditor.value) {
    tiptapEditor.value.destroy();
  }
});

const startManualWrite = () => {
  showEmptyPlaceholder.value = false;
  isEditingLocked.value = false;
  nextTick(() => {
    tiptapEditor.value?.commands.focus();
  });
};

const handleAIGenerateAction = (field: string, action: 'replace' | 'append' | 'cancel') => {
  if (field !== 'bubble') {
    aiPromptPopoverVisible.value[field] = false;
  }
  if (action === 'cancel') return;

  if (field === 'bubble') {
    if (!aiPromptInput.value && !quotedText.value) return;
    
    // If there is a quote or selection, we treat manual input as a proposal trigger
    const { from, to } = tiptapEditor.value?.state.selection || { from: 0, to: 0 };
    const selectedText = tiptapEditor.value?.state.doc.textBetween(from, to, ' ') || '';
    
    if (quotedText.value || selectedText.trim()) {
      applyAIAction('智能改写');
      return;
    }

    chatMessages.value.push({ id: Date.now().toString(), role: 'user', content: aiPromptInput.value });
    const aiBubbleId = Date.now().toString() + '_ai';
    chatMessages.value.push({ id: aiBubbleId, role: 'ai', content: '', isGenerating: true });
    
    // Clear quote and input after sending
    quotedText.value = '';
    aiPromptInput.value = '';

    nextTick(() => {
      if (rightPanelChatRef.value) rightPanelChatRef.value.scrollTop = rightPanelChatRef.value.scrollHeight;
    });

    let i = 0;
    const mockText = `好的，我明白您的意思了。正在为您优化“${aiPromptInput.value}”相关的剧情逻辑...`;
    const interval = setInterval(() => {
      const bubble = chatMessages.value.find(b => b.id === aiBubbleId);
      if (bubble) {
        bubble.content += mockText.charAt(i);
        nextTick(() => {
          if (rightPanelChatRef.value) rightPanelChatRef.value.scrollTop = rightPanelChatRef.value.scrollHeight;
        });
      }
      i++;
      if (i >= mockText.length) {
        clearInterval(interval);
        const b = chatMessages.value.find(b => b.id === aiBubbleId);
        if (b) b.isGenerating = false;
      }
    }, 30);
    return;
  }

  // Mock generation for other fields
  const mockResponse = `【AI生成内容】这是基于您的要求“${aiPromptInput.value}”生成的补充内容...`;
  if (action === 'replace') {
    if (field === 'synopsis' && form.value) form.value.synopsis = mockResponse;
    if (field === 'background' && form.value) form.value.background = mockResponse;
  } else {
    if (field === 'synopsis' && form.value) form.value.synopsis += '\n' + mockResponse;
    if (field === 'background' && form.value) form.value.background += '\n' + mockResponse;
  }
  aiPromptInput.value = '';
};

// Resizing logic
let startX = 0;
let startWidth = 0;
const doDrag = (e: MouseEvent) => {
  const newWidth = startWidth + (e.clientX - startX);
  if (newWidth > 240 && newWidth < 500) leftPanelWidth.value = newWidth;
};
const stopDrag = () => {
  document.removeEventListener('mousemove', doDrag);
  document.removeEventListener('mouseup', stopDrag);
};
const startResizeLeftPanel = (e: MouseEvent) => {
  startX = e.clientX;
  startWidth = leftPanelWidth.value;
  document.addEventListener('mousemove', doDrag);
  document.addEventListener('mouseup', stopDrag);
};
const executeRemoveEpisode = (index: number) => {
  if (!form.value || !form.value.episodesData) return;
  
  const isRemovingCurrent = currentEpisodeIndex.value === index;
  form.value.episodesData.splice(index, 1);
  
  // If we removed the current episode or an episode before it, update the index
  if (isRemovingCurrent || currentEpisodeIndex.value >= form.value.episodesData.length) {
    currentEpisodeIndex.value = Math.max(0, Math.min(currentEpisodeIndex.value, form.value.episodesData.length - 1));
  } else if (currentEpisodeIndex.value > index) {
    currentEpisodeIndex.value--;
  }

  // Ensure episodeRange is still valid
  const total = form.value.episodesData.length;
  if (episodeRange.value >= total && total > 0) {
    episodeRange.value = Math.max(0, Math.floor((total - 1) / EPISODES_PER_PAGE) * EPISODES_PER_PAGE);
  }
  
  // Always reload to ensure state is consistent
  loadContentFromStore();
  saveCurrentContentToStore();
  ElMessage({
    message: '剧集已成功删除',
    type: 'success',
    customClass: 'modern-message-success'
  });
};

let draggedIndex = -1;
const onDragStartEpisode = (e: DragEvent, index: number) => { draggedIndex = index; };
const onDropEpisode = (e: DragEvent, index: number) => {
  if (!form.value || draggedIndex === -1 || draggedIndex === index) return;
  
  // Save ID of current episode to restore index after move
  const selectedEpId = form.value.episodesData[currentEpisodeIndex.value]?.id;
  
  const item = form.value.episodesData.splice(draggedIndex, 1)[0];
  form.value.episodesData.splice(index, 0, item);
  
  // Update currentEpisodeIndex if needed
  if (selectedEpId) {
    const newIdx = form.value.episodesData.findIndex((ep: any) => ep.id === selectedEpId);
    if (newIdx !== -1) currentEpisodeIndex.value = newIdx;
  }
  
  draggedIndex = -1;
  saveCurrentContentToStore();
};

const generateScriptBody = () => {
  isGenerating.value = true;
  isPaused.value = false;
  
  // Update generation status in store
  dramaStore.setGenerationStatus({
    isGenerating: true,
    type: 'script',
    currentIndex: currentEpisodeIndex.value,
    totalCount: form.value?.episodesData?.length || 0,
    progress: 0
  });

  let i = 0;
  let mockText = '';

  // Use expanded prompt as context if available
  const promptContext = dramaStore.expandedPrompt ? `基于设定：${dramaStore.expandedPrompt}\n\n` : '';

  const EPISODE_SCRIPTS: Record<number, string> = {
    0: `第1集\n` +
       `1-1 日 内 豪华酒店宴会厅\n` +
       `人物：沈念安, 顾承泽, 沈薇薇, 沈母, 沈父, 宾客若干, 司仪\n` +
       `△宴会厅内鲜花簇拥，水晶灯璀璨夺目，宾客们衣着华丽，举杯交谈。\n` +
       `△舞台中央，司仪手持话筒，面带微笑。\n` +
       `司仪：今天，是沈家千金沈念安小姐与顾家少爷顾承泽先生的订婚之喜。\n` +
       `△聚光灯下，沈念安身着一袭纯白礼服，挽着顾承泽的手臂，脸上洋溢着幸福的笑容。\n` +
       `沈念安（含情脉脉）：承泽，我好像在做梦。\n` +
       `顾承泽（温柔凝视）：念安，这不是梦。从今天起，你就是我唯一的未婚妻。\n` +
       `△台下，沈父沈母满面春风地接受着宾客的祝贺。\n` +
       `宾客甲：沈总，沈夫人，恭喜啊！念安真是越来越出色了！\n` +
       `沈母（得意）：这孩子，从小就懂事，是我们沈家的骄傲。\n` +
       `△沈念安看着台下为她祝福的亲友，眼眶微湿，充满了对未来的憧憬。\n` +
       `沈念安OS：二十年了，我终于要嫁给最爱的人，拥有自己的家了。\n` +
       `△突然，宴会厅的大门被人猛地推开，发出一声巨响。\n` +
       `△音乐戛而止，所有人的目光都被吸引过去。\n` +
       `△沈薇薇衣衫不整，头发凌乱地冲了进来，妆容哭花了，看起来狼狈不堪.\n` +
       `沈薇薇（凄厉哭喊）：承泽哥！\n` +
       `△宾客们纷纷避让，窃窃私语。\n` +
       `宾客乙：那不是沈家的小女儿沈薇薇吗？她这是怎么了？\n` +
       `宾客丙：看样子是来砸场子的啊！\n` +
       `△沈念安脸上的笑容僵住。\n` +
       `沈念安（错愕）：薇薇？\n` +
       `△沈母和沈父脸色大变，立刻上前试图阻拦。\n` +
       `沈母（厉声）：沈薇薇！你疯了吗！滚出去！\n` +
       `沈父：保安！保安在哪里！\n` +
       `△沈薇薇不管不顾，一把推开父母，跌跌撞撞地冲向舞台。\n` +
       `△她扑到顾承泽面前，死死抓住他的手臂。\n` +
       `沈薇薇（泣不成声）：承泽哥……\n` +
       `顾承泽（慌乱，试图推开她）：薇薇，你冷静点！有什么事我们回家再说！\n` +
       `沈薇薇（抬头，泪眼婆娑地看着沈念安）：姐姐，对不起……\n` +
       `△沈薇薇一手抚上自己的小腹，声音颤抖却清晰地传遍整个宴会厅。\n` +
       `沈薇薇（哭着宣布）：我……我怀了承泽哥的孩子！\n` +
       `△话音落下，全场瞬间陷入一片死寂。\n` +
       `△宾客们倒吸一口凉气，现场瞬间炸开了锅。\n` +
       `宾客甲：天合！我没听错吧？妹妹怀了姐夫的孩子？\n` +
       `宾客乙：这……这简直是豪门丑闻啊！\n` +
       `△沈念安如遭雷击，浑身冰冷，大脑一片空白。她难以置信地看着顾承泽，又看看哭倒在他怀里的妹妹。\n` +
       `沈念安（声音发颤）：承泽……她说的，是真的吗？\n` +
       `△顾承泽眼神躲闪，嘴唇翕动，却一个字都说不出来。\n` +
       `△沈薇薇见状，哭得更凶了。\n` +
       `沈薇薇（紧紧抱着顾承澤）：承泽哥，你告诉姐姐，我们是真心相爱的！你快告诉她啊！\n` +
       `△特写镜头，沈念安脸上的笑容彻底凝固，眼中所有的光芒瞬间熄灭，世界在她眼前崩塌。`,
    1: `第2集\n` +
       `2-1 日 内 豪华酒店宴会厅\n` +
       `人物：沈念安, 顾承泽, 沈薇薇, 沈母, 沈父, 宾客若干\n` +
       `△聚光灯下，沈念安脸色煞白，身体微微颤抖，紧紧盯着顾承泽。\n` +
       `△全场的宾客都在窃窃私语，指指点点。\n` +
       `宾客甲：这下有好戏看了，未婚夫搞大了小姨子的肚子。\n` +
       `宾客乙：沈家这脸可丢大了。\n` +
       `沈念安（声音颤抖）：承泽，你说话啊！她说的……是不是真的？\n` +
       `△顾承泽的眼神躲闪，不敢直视沈念安，愧疚地低下了头。\n` +
       `△这无声的沉默，像一把最锋利的刀，狠狠刺进沈念安的心脏。\n` +
       `沈念安（绝望地后退一步）：所以……是真的。\n` +
       `△沈薇薇见状，哭着抱紧顾承泽。\n` +
       `沈薇薇（抽泣）：姐姐，你不要怪承泽哥，都是我的错！我们是真心相爱的……\n` +
       `△沈母和沈父脸色铁青，快步冲上舞台。\n` +
       `△沈念安以为他们是来安慰自己的，眼中燃起一丝希望.\n` +
       `沈念安（哽咽）：妈……\n` +
       `△沈母却看也不看她，径直走到她面前，扬手就想打她。\n` +
       `△顾承泽下意识地挡了一下。\n` +
       `顾承泽：阿姨，别……\n` +
       `沈母（怒不可遏，指着沈念安的鼻子）：你还有脸哭！你这个白眼狼！\n` +
       `沈念安（难以置信）：妈，你说什么？\n` +
       `沈母（尖声）：我们沈家养了你二十年，好吃好喝地供着你，你就是这么回报我们的？占着薇薇的位置不说，现在还想毁了薇薇的幸福！\n` +
       `沈父（附和，满脸嫌恶）：念安，你怎么这么不懂事！薇薇才是我们的亲生女儿！你一个养女，有什么资格跟她争！\n` +
       `沈念安（心如刀绞）：爸，妈……我也是你们的女儿啊！\n` +
       `沈母（冷笑）：女儿？你配吗？你不过是我们沈家养的一条狗！现在竟然还想鸠占鹊巢！\n` +
       `△沈念安踉跄着，手里紧紧攥着为订婚准备的致辞稿，那是她熬了好几个通宵，写满了对未来憧憬的文字。\n` +
       `△沈母的视线落在稿纸上，眼中闪过一丝狠毒。\n` +
       `△她一把抢过沈念安手中的致辞稿。\n` +
       `沈念安（惊慌）：妈，你干什么！还给我！\n` +
       `△沈母看也不看，当着所有人的面，将稿纸“撕拉”一声撕成两半，然后疯狂地撕扯，直到变成一堆碎片。\n` +
       `沈母（咬牙切齿）：你的幸福？你的未来？你也配！\n` +
       `△沈母扬起手，将满手的纸屑，狠狠地砸在沈念安的脸上，身上。\n` +
       `△纸屑纷飞，像一场绝望的雪，将沈念安彻底淹没。\n` +
       `沈母（指着她，对众人宣布）：我们沈家，没有你这种不知感恩、丢人现眼的东西！`,
    2: `第3集\n` +
       `3-1 夜 内 豪华酒店宴会厅\n` +
       `人物：沈念安, 沈母, 顾承泽, 沈薇薇, 沈父, 保安2名, 宾客若干\n` +
       `△沈母指着沈念安，脸上满是鄙夷和厌恶。\n` +
       `沈母（对保安厉声）：还愣着干什么！把这个丢人现眼的东西给我扔出去！\n` +
       `△两名保安立刻上前，一左一右架住沈念安的胳膊。\n` +
       `沈念安（挣扎，难以置信地看向沈父）：爸！\n` +
       `△沈父眼神躲闪，转过头去，不敢看她。\n` +
       `沈念安（心碎地望向顾承泽）：承泽……救我……\n` +
       `△顾承泽嘴唇动了动，最终只是痛苦地闭上眼。\n` +
       `顾承泽（低声）：念安，对不起。\n` +
       `△沈薇薇靠在顾承泽怀里，嘴角勾起一抹得意的冷笑，眼中却还挂着泪。\n` +
       `沈薇薇（啜泣）：姐姐，你别怪我们，要怪就怪你……不该占着不属于你的东西。\n` +
       `沈念安（绝望大笑）：不属于我的？哈哈哈哈……\n` +
       `△保安不再迟疑，用力拖拽着沈念安往外走。\n` +
       `△沈念安的挣扎在他们看来微不足道。\n` +
       `△“撕拉”一声，她身上华美的纯白礼服，在粗暴的拉扯中被撕开一道长长的口子。\n` +
       `△宾客们纷纷避让，对着她指指点点，满是嘲讽和看戏的目光。\n` +
       `宾客甲：真是活该，一个养女还真把自己当凤凰了。\n` +
       `宾客乙：这下好了，被赶出去了吧，一无所有。\n` +
       `△沈念安被拖过长长的走廊，像一件被丢弃的垃圾，最后被狠狠地推出了酒店大门。\n` +
       `3-2 夜 外 沈家大门/街道（大雨）\n` +
       `人物：沈念安\n` +
       `△沈念安被保安粗暴地推倒在地，摔在冰冷的石阶上。\n` +
       `△身后，沈家大门“砰”的一声，决绝地关上了。\n` +
       `△天空突然划过一道闪电，紧接着，倾盆大雨瞬间落下.\n` +
       `△冰冷的雨水疯狂地浇在她身上，撕裂的礼服紧紧贴着皮肤，狼狈不堪。\n` +
       `△她赤着脚，麻木地从地上站起来，雨水混合着泪水，模糊了她的视线。\n` +
       `△她漫无目的地走在空无一人的街道上，身无分文，无处可去。\n` +
       `△一辆跑车飞驰而过，溅起一大片污水，将她淋得更加透彻。\n` +
       `沈念安OS：二十年的家，二十年的爱人，原来都是假的。\n` +
       `△她踉踉跄跄地走着，心中只剩下一个念头，一个最后的避风港。\n` +
       `△她来到一栋小楼前，抬头看去，牌子上写着“念安设计工作室”。\n` +
       `△这是她亲手创立，倾注了所有心血的地方。\n` +
       `△她颤抖着手，想从破碎的礼服口袋里找钥匙，却摸了个空。\n` +
       `△她的目光落在工作室的大门上，瞳孔骤然紧缩。\n` +
       `△门上，一张白色的封条赫然在目，上面“沈氏集团查封”的字样，在雨中显得格外刺眼。\n` +
       `沈念安（喃喃自语）：连这里……也被收走了吗……\n` +
       `△她伸出手，轻轻触摸着那冰冷的封条，仿佛那是压垮她的最后一根稻草。\n` +
       `△沈念安再也支撑不住，沿着墙壁缓缓滑落在地。\n` +
       `△她蜷缩在角落里，任由雨水冲刷，眼神空洞，仿佛失去了所有灵魂。\n` +
       `△就在这时，一辆黑色的劳斯莱斯悄无悄无声息地停在她面前。\n` +
       `△车窗缓缓降下，露出一张轮廓分明的侧脸。\n` +
       `周助理VO（恭敬）：先生，就是她。\n` +
       `△沈念安缓缓抬头，看向车内，一道深邃的目光穿透雨幕，落在她身上。`
  };

  if (editMode.value === 'full') {
    mockText = ``;
    form.value?.episodesData.forEach((_, idx) => {
      mockText += (EPISODE_SCRIPTS[idx] || `基于您的灵感：${dramaStore.expandedPrompt.substring(0, 30)}... \n 第 ${idx + 1} 集内容正在智能创作中...`) + '\n\n' + SEPARATOR.replace(/<p>|<\/p>/g, '') + '\n\n';
    });
  } else {
    mockText = EPISODE_SCRIPTS[currentEpisodeIndex.value] || `基于您的灵感：${dramaStore.expandedPrompt.substring(0, 30)}... \n 第 ${currentEpisodeIndex.value + 1} 集剧本正文正在智能创作中...`;
  }
  
  const interval = setInterval(() => {
    if (isPaused.value) return;
    const chars = mockText.substring(i, i + 8);
    tiptapEditor.value?.commands.insertContent(chars.replace(/\n/g, '<br>'));
    i += 8;

    // Update progress in store
    const progress = Math.round((i / mockText.length) * 100);
    dramaStore.setGenerationStatus({ progress });

    if (i >= mockText.length) {
      clearInterval(interval);
      isGenerating.value = false;
      dramaStore.setGenerationStatus({ isGenerating: false, type: '' });
      ElMessage.success('剧本生成完毕');
    }
  }, 40);
};

const resumeScriptGeneration = (startProgress: number) => {
  isGenerating.value = true;
  isPaused.value = false;
  
  let mockText = '';
  const EPISODE_SCRIPTS: Record<number, string> = {
    0: `第1集\n` +
       `1-1 日 内 豪华酒店宴会厅\n` +
       `人物：沈念安, 顾承泽, 沈薇薇, 沈母, 沈父, 宾客若干, 司仪\n` +
       `△宴会厅内鲜花簇拥，水晶灯璀璨夺目，宾客们衣着华丽，举杯交谈。\n` +
       `△舞台中央，司仪手持话筒，面带微笑。\n` +
       `司仪：今天，是沈家千金沈念安小姐与顾家少爷顾承泽先生的订婚之喜。\n` +
       `△聚光灯下，沈念安身着一袭纯白礼服，挽着顾承泽的手臂，脸上洋溢着幸福的笑容。\n` +
       `沈念安（含情脉脉）：承泽，我好像在做梦。\n` +
       `顾承泽（温柔凝视）：念安，这不是梦。从今天起，你就是我唯一的未婚妻。\n` +
       `△台下，沈父沈母满面春风地接受着宾客的祝贺。\n` +
       `宾客甲：沈总，沈夫人，恭喜啊！念安真是越来越出色了！\n` +
       `沈母（得意）：这孩子，从小就懂事，是我们沈家的骄傲。\n` +
       `△沈念安看着台下为她祝福的亲友，眼眶微湿，充满了对未来的憧憬。\n` +
       `沈念安OS：二十年了，我终于要嫁给最爱的人，拥有自己的家了。\n` +
       `△突然，宴会厅的大门被人猛地推开，发出一声巨响。\n` +
       `△音乐戛而止，所有人的目光都被吸引过去。\n` +
       `△沈薇薇衣衫不整，头发凌乱地冲了进来，妆容哭花了，看起来狼狈不堪.\n` +
       `沈薇薇（凄厉哭喊）：承泽哥！\n` +
       `△宾客们纷纷避让，窃窃虚语。\n` +
       `宾客乙：那不是沈家的小女儿沈薇薇吗？她这是怎么了？\n` +
       `宾客丙：看样子是来砸场子的啊！\n` +
       `△沈念安脸上的笑容僵住。\n` +
       `沈念安（错愕）：薇薇？\n` +
       `△沈母和沈父脸色大变，立刻上前试图阻拦。\n` +
       `沈母（厉声）：沈薇薇！你疯了吗！滚出去！\n` +
       `沈父：保安！保安在哪里！\n` +
       `△沈薇薇不管不顾，一把推开父母，跌跌撞撞地冲向舞台。\n` +
       `△她扑到顾承泽面前，死死抓住他的手臂。\n` +
       `沈薇薇（泣不成声）：承泽哥……\n` +
       `顾承泽（慌乱，试图推开她）：薇薇，你冷静点！有什么事我们回家再说！\n` +
       `沈薇薇（抬头，泪眼婆娑地看着沈念安）：姐姐，对不起……\n` +
       `△沈薇薇一手抚上自己的小腹，声音颤抖却清晰地传遍整个宴会厅。\n` +
       `沈薇薇（哭着宣布）：我……我怀了承泽哥的孩子！\n` +
       `△话音落下，全场瞬间陷入一片死寂。\n` +
       `△宾客们倒吸一个凉气，现场瞬间炸开了锅。\n` +
       `宾客甲：天合！我没听错吧？妹妹怀了姐夫的孩子？\n` +
       `宾客乙：这……这简直是豪门丑闻啊！\n` +
       `△沈念安如遭雷击，浑身冰冷，大脑一片空白。她难以置信地看着顾承泽，又看看哭倒在他怀里的妹妹。\n` +
       `沈念安（声音发颤）：承泽……她说的，是真的吗？\n` +
       `△顾承泽眼神躲闪，嘴唇翕动，却一个字都说不出来。\n` +
       `△沈薇薇见状，哭得更凶了。\n` +
       `沈薇薇（紧紧抱着顾承澤）：承泽哥，你告诉姐姐，我们是真心相爱的！你快告诉她啊！\n` +
       `△特写镜头，沈念安脸上的笑容彻底凝固，眼中所有的光芒瞬间熄灭，世界在眼前崩塌。`,
    1: `第2集\n` +
       `2-1 日 内 豪华酒店宴会厅\n` +
       `人物：沈念安, 顾承泽, 沈薇薇, 沈母, 沈父, 宾客若干\n` +
       `△聚光灯下，沈念安脸色煞白，身体微微颤抖，紧紧盯着顾承泽。\n` +
       `△全场的宾客都在窃窃虚语，指指点点。\n` +
       `宾客甲：这下有好戏看了，未婚夫搞大了小姨子的肚子。\n` +
       `宾客乙：沈家这脸可丢大了。\n` +
       `沈念安（声音颤抖）：承泽，你说话啊！她说的……是不是真的？\n` +
       `△顾承泽的眼神躲闪，不敢直视沈念安，愧疚地低下了头。\n` +
       `△这无声的沉默，像一把最锋利的刀，狠狠刺进沈念安的心脏。\n` +
       `沈念安（绝望地后退一步）：所以……是真的。\n` +
       `△沈薇薇见状，哭着抱紧顾承泽。\n` +
       `沈薇薇（抽泣）：姐姐，你不要怪承泽哥，都是我的错！我们是真心相爱的……\n` +
       `△沈母和沈父脸色铁青，快步冲上舞台。\n` +
       `△沈念安以为他们是来安慰自己的，眼中燃起一丝希望.\n` +
       `沈念安（哽咽）：妈……\n` +
       `△沈母却看也不看她，径直走到她面前，扬手就想打她。\n` +
       `△顾承泽下意识地挡了一下。\n` +
       `顾承泽：阿姨，别……\n` +
       `沈母（怒不可遏，指着沈念安的鼻子）：你还有脸哭！你这个白眼狼！\n` +
       `沈念安（难以置信）：妈，你说什么？\n` +
       `沈母（尖声）：我们沈家养了你二十年，好吃好喝地供着你，你就是这么回报我们的？占着薇薇的位置不说，现在还想毁了薇薇的幸福！\n` +
       `沈父（附和，满脸嫌恶）：念安，你怎么这么不懂事！薇薇才是我们的亲生女儿！你一个养女，有什么资格跟她争！\n` +
       `沈念安（心如刀绞）：爸，妈……我也是你们的女儿啊！\n` +
       `沈母（冷笑）：女儿？你配吗？你不过是我们沈家养的一条狗！现在竟然还想鸠占窃巢！\n` +
       `△沈念安踉跄着，手里紧紧攥着为订婚准备的致辞稿，那是她熬了好几个通宵，写满了对未来憧憬的文字。\n` +
       `△沈母的视线落在稿纸上，眼中闪过一丝狠毒。\n` +
       `△她一把抢过沈念安手中的致辞稿。\n` +
       `沈念安（惊慌）：妈，你干什么！还给我！\n` +
       `△沈母看也不看，当着所有人的面，将稿纸“撕拉”一声撕成两半，然后疯狂地撕扯，直到变成一堆碎片。\n` +
       `沈母（咬牙切齿）：你的幸福？你的未来？你也配！\n` +
       `△沈母扬起手，将满手的纸屑，狠狠地砸在沈念安的脸上，身上。\n` +
       `△纸屑纷飞，像一场绝望的雪，将沈念安彻底淹没。\n` +
       `沈母（指着她，对众人宣布）：我们沈家，没有你这种不知感恩、丢人现眼的东西！`,
    2: `第3集\n` +
       `3-1 夜 内 豪华酒店宴会厅\n` +
       `人物：沈念安, 沈母, 顾承泽, 沈薇薇, 沈父, 保安2名, 宾客若干\n` +
       `△沈母指着沈念安，脸上满是鄙夷和厌恶。\n` +
       `沈母（对保安厉声）：还愣着干什么！把这个丢人现眼的东西给我扔出去！\n` +
       `△两名保安立刻上前，一左一右架住沈念安的胳膊。\n` +
       `沈念安（挣扎，难以置信地看向沈父）：爸！\n` +
       `△沈父眼神躲闪，转过头去，不敢看她。\n` +
       `沈念安（心碎地望向顾承泽）：承泽……救我……\n` +
       `△顾承泽嘴唇动了动，最终只是痛苦地闭上眼.\n` +
       `顾承泽（低声）：念安，对不起。\n` +
       `△沈薇薇靠在顾承泽怀里，嘴角勾起一抹得意的冷笑，眼中却还挂着泪。\n` +
       `沈薇薇（抽泣）：姐姐，你别怪我们，要怪就怪你……不该占着不属于你的东西。\n` +
       `沈念安（绝望大笑）：不属于我的？哈哈哈哈……\n` +
       `△保安不再迟疑，用力拖拽着沈念安往外走.\n` +
       `△沈念安的挣扎在他们看来微不足道。\n` +
       `△“撕拉”一声，她身上华美的纯白礼服，在粗暴的拉扯中被撕开一道长长的口子。\n` +
       `△宾客们纷纷避让，对着她指指点点，满是嘲讽和看戏的目光。\n` +
       `宾客甲：真是活该，一个养女还真把自己当凤凰了。\n` +
       `宾客乙：这下好了，被赶出去了吧，一无所有。\n` +
       `△沈念安被拖过长长的走廊，像一件被丢弃的垃圾，最后被狠狠地推出了酒店大门。\n` +
       `3-2 夜 外 沈家大门/街道（大雨）\n` +
       `人物：沈念安\n` +
       `△沈念安被保安粗暴地推倒在地，摔在冰冷的石阶上。\n` +
       `△身后，沈家大门“砰”的一声，决绝地关上了。\n` +
       `△天空突然划过一道闪电，紧接着，倾盆大雨瞬间落下.\n` +
       `△冰冷的雨水疯狂地浇在她身上，撕裂的礼服紧紧贴着皮肤，狼狈不堪。\n` +
       `△她赤着脚，麻木地从地上站起来，雨水混合着泪水，模糊了她的视线。\n` +
       `△她漫无目的地走在空无一人的街道上，身无分文，无处可去.\n` +
       `△一辆跑车飞驰而过，溅起一大片污水，将她淋得更加透彻。\n` +
       `沈念安OS：二十年的家，二十年的爱人，原来都是假的.\n` +
       `△她踉踉跄跄地走着，心中只剩下一个念头，一个最后的避风港。\n` +
       `△她来到一栋小楼前，抬头看去，牌子上写着“念安设计工作室”。\n` +
       `△这是 she 亲手创立，倾注了所有心血的地方。\n` +
       `△她颤抖着手，想从破碎的礼服口袋里找钥匙，却摸了个空。\n` +
       `△她的目光落在工作室的大门上，瞳孔骤然紧缩。\n` +
       `△门上，一张白色的封条赫然在目，上面“沈氏集团查封”的字样，在雨中显得格外刺眼。\n` +
       `沈念安（喃喃自语）：连这里……也被收走了吗……\n` +
       `△她伸出手，轻轻触摸着那冰冷的封条，仿佛那是压垮她的最后一根稻草。\n` +
       `沈念安再也支撑不住，沿着墙壁缓缓滑落在地。\n` +
       `△她蜷缩在角落里，任由雨水冲刷，眼神空洞，仿佛失去了所有灵魂。\n` +
       `△就在这时，一辆黑色的劳斯莱斯悄无悄无声息地停在她面前.\n` +
       `△车窗缓缓降下，露出一张轮廓分明的侧脸。\n` +
       `周助理VO（恭敬）：先生，就是她。\n` +
       `△沈念安缓缓抬头，看向车内，一道深邃的目光穿透雨幕，落在她身上。`
  };

  if (editMode.value === 'full') {
    form.value?.episodesData.forEach((_, idx) => {
      mockText += (EPISODE_SCRIPTS[idx] || `基于您的灵感：${dramaStore.expandedPrompt.substring(0, 30)}... \n 第 ${idx + 1} 集内容正在智能创作中...`) + '\n\n' + SEPARATOR.replace(/<p>|<\/p>/g, '') + '\n\n';
    });
  } else {
    mockText = EPISODE_SCRIPTS[currentEpisodeIndex.value] || `基于您的灵感：${dramaStore.expandedPrompt.substring(0, 30)}... \n 第 ${currentEpisodeIndex.value + 1} 集剧本正文正在智能创作中...`;
  }

  let i = Math.floor((startProgress / 100) * mockText.length);
  
  const interval = setInterval(() => {
    if (isPaused.value) return;
    const chars = mockText.substring(i, i + 8);
    tiptapEditor.value?.commands.insertContent(chars.replace(/\n/g, '<br>'));
    i += 8;
    
    const progress = Math.round((i / mockText.length) * 100);
    dramaStore.setGenerationStatus({ progress });

    if (i >= mockText.length) {
      clearInterval(interval);
      isGenerating.value = false;
      dramaStore.setGenerationStatus({ isGenerating: false, type: '' });
      ElMessage.success('剧本生成完毕');
    }
  }, 40);
};
</script>

<style scoped>
/* Redesigned Episode Card Styles */
.episode-card {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.active-card {
  z-index: 5;
  transform: scale(1.02);
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}
.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}

@keyframes bounce-subtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}
.animate-bounce-subtle {
  animation: bounce-subtle 2s ease-in-out infinite;
}

:deep(.redesign-compact-textarea .el-textarea__inner) {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
  font-size: 12px;
  line-height: 1.5;
  color: inherit;
  font-weight: 500;
  resize: none;
  min-height: unset !important;
}

.active-card :deep(.redesign-compact-textarea .el-textarea__inner) {
  color: #4338ca; /* indigo-700 */
}

.dark .active-card :deep(.redesign-compact-textarea .el-textarea__inner) {
  color: #a5b4fc; /* indigo-300 */
}

.inactive-card :deep(.redesign-compact-textarea .el-textarea__inner) {
  color: #64748b; /* slate-500 */
}

.inactive-card:hover :deep(.redesign-compact-textarea .el-textarea__inner) {
  color: #475569; /* slate-600 */
}

/* Modern Scrollbar */
.active-episode {
  border-left-color: #7c3aed !important; /* Use purple-600 color */
  background-color: rgba(224, 231, 255, 0.4) !important;
  outline: 1px solid rgba(99, 102, 241, 0.1);
}

.bg-indigo-50\/40.border-l-indigo-50.dark\:border-l-indigo-900\/30 {
  border-left-color: transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.2);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.4);
}

.custom-scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.custom-scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.animate-shimmer {
  animation: shimmer 2s infinite;
}

.episode-jump-popover {
  border-radius: 20px !important;
  padding: 0 !important;
  overflow: hidden;
  border: 1px solid rgba(99, 102, 241, 0.1) !important;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1) !important;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-slide-up {
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.animate-float {
  animation: float 4s ease-in-out infinite;
}

/* Transitions */
.list-enter-active, .list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from, .list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.chat-enter-active {
  transition: all 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}
.chat-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}

.scale-enter-active, .scale-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.scale-enter-from, .scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Modern Input Styles */
:deep(.modern-input .el-input__wrapper),
:deep(.modern-select .el-select__wrapper),
:deep(.modern-number-input .el-input__wrapper),
:deep(.modern-input-small .el-input__wrapper) {
  background-color: rgba(248, 250, 252, 0.8) !important;
  border-radius: 14px !important;
  box-shadow: none !important;
  border: 1.5px solid #F1F5F9 !important;
  padding: 4px 12px !important;
  transition: all 0.3s ease;
}
.dark :deep(.modern-input .el-input__wrapper),
.dark :deep(.modern-select .el-select__wrapper),
.dark :deep(.modern-number-input .el-input__wrapper) {
  background-color: rgba(15, 23, 42, 0.5) !important;
  border-color: #334155 !important;
}

:deep(.modern-input .el-input__wrapper.is-focus),
:deep(.modern-select .el-select__wrapper.is-focused),
:deep(.modern-number-input .el-input__wrapper.is-focus) {
  border-color: #6366f1 !important;
  background-color: #fff !important;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.08) !important;
}

:deep(.modern-textarea .el-textarea__inner),
:deep(.modern-textarea-small .el-textarea__inner) {
  background-color: rgba(248, 250, 252, 0.8) !important;
  border-radius: 20px !important;
  border: 1.5px solid #F1F5F9 !important;
  padding: 12px 16px !important;
  font-size: 15px;
  line-height: 1.6;
  resize: none;
  transition: all 0.3s ease;
  box-shadow: none !important;
  color: #1e293b;
}
.dark :deep(.modern-textarea .el-textarea__inner) {
  background-color: rgba(15, 23, 42, 0.5) !important;
  border-color: #334155 !important;
  color: #E2E8F0;
}

:deep(.modern-textarea-v2 .el-textarea__inner) {
  background-color: #F8FAFC !important;
  border-radius: 12px !important;
  border: 1px solid #F1F5F9 !important;
  font-size: 15px;
  padding: 10px 14px !important;
  resize: none;
  box-shadow: none !important;
  color: #1e293b;
}

:deep(.modern-input-v2 .el-input__wrapper) {
  background-color: #F8FAFC !important;
  border-radius: 12px !important;
  border: 1px solid #F1F5F9 !important;
  font-size: 15px;
  box-shadow: none !important;
  color: #1e293b;
}

:deep(.modern-chat-input .el-input__wrapper) {
  background-color: #F1F5F9 !important;
  border-radius: 20px !important;
  padding-left: 16px !important;
  border: 1.5px solid transparent !important;
  box-shadow: none !important;
  transition: all 0.3s;
  height: 52px;
}
.dark :deep(.modern-chat-input .el-input__wrapper) {
  background-color: #0F172A !important;
  border-color: #334155 !important;
}

/* Modern Input Styles V2 & V3 */
:deep(.modern-select-v2 .el-select__wrapper),
:deep(.modern-input-v2 .el-input__wrapper),
:deep(.modern-number-input-v2 .el-input__wrapper),
:deep(.modern-input-v3 .el-input__wrapper) {
  background-color: #fff !important;
  border-radius: 16px !important;
  box-shadow: none !important;
  border: 1.5px solid #F1F5F9 !important;
  padding: 8px 16px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: auto !important;
  min-height: 48px !important;
}
.dark :deep(.modern-select-v2 .el-select__wrapper),
.dark :deep(.modern-input-v2 .el-input__wrapper),
.dark :deep(.modern-number-input-v2 .el-input__wrapper),
.dark :deep(.modern-input-v3 .el-input__wrapper) {
  background-color: #1e293b !important;
  border-color: #334155 !important;
}

:deep(.modern-select-v2 .el-select__wrapper.is-focused),
:deep(.modern-input-v2 .el-input__wrapper.is-focus),
:deep(.modern-number-input-v2 .el-input__wrapper.is-focus),
:deep(.modern-input-v3 .el-input__wrapper.is-focus) {
  border-color: #6366f1 !important;
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.1) !important;
  transform: translateY(-1px);
}

:deep(.modern-textarea-v3 .el-textarea__inner) {
  background-color: #fff !important;
  border-radius: 20px !important;
  border: 1.5px solid #F1F5F9 !important;
  padding: 16px 20px !important;
  font-size: 15px;
  line-height: 1.7;
  resize: none;
  transition: all 0.3s ease;
  box-shadow: none !important;
  color: #1e293b;
}
.dark :deep(.modern-textarea-v3 .el-textarea__inner) {
  background-color: #1e293b !important;
  border-color: #334155 !important;
  color: #E2E8F0;
}
:deep(.modern-textarea-v3 .el-textarea__inner:focus) {
  border-color: #6366f1 !important;
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.1) !important;
  background-color: #fff !important;
}

:deep(.modern-popover-v2) {
  border-radius: 24px !important;
  padding: 16px !important;
  border: 1px solid rgba(99, 102, 241, 0.1) !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1) !important;
}

:deep(.ultra-compact-textarea .el-textarea__inner) {
  background-color: transparent !important;
  border-radius: 8px !important;
  border: 1px solid #F1F5F9 !important;
  padding: 6px 10px !important;
  font-size: 12px;
  line-height: 1.4;
  resize: none;
  transition: all 0.2s ease;
  box-shadow: none !important;
  color: #475569;
}
.dark :deep(.ultra-compact-textarea .el-textarea__inner) {
  border-color: #334155 !important;
  color: #94a3b8;
}
:deep(.ultra-compact-textarea .el-textarea__inner:focus) {
  border-color: #6366f1 !important;
  background-color: #fff !important;
  color: #1e293b;
}
.dark :deep(.ultra-compact-textarea .el-textarea__inner:focus) {
  background-color: #1e293b !important;
  color: #f1f5f9;
}

/* Prose Modern Styling */
.prose-modern {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1e293b;
  line-height: 1.8;
  font-size: 16px;
}
.dark .prose-modern {
  color: #CBD5E1;
}

/* Tiptap Placeholder */
.prose-modern p.is-editor-empty:first-child::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
.dark .prose-modern p.is-editor-empty:first-child::before {
  color: #475569;
}

/* Modern Popconfirm C-End Styles - Redesigned for Premium C-End Look */
:deep(.modern-popconfirm-c-end) {
  background: linear-gradient(135deg, #fff1f2 0%, #ffffff 100%) !important;
  border-radius: 24px !important;
  padding: 18px !important;
  border: 1px solid rgba(251, 113, 133, 0.3) !important;
  box-shadow: 
    0 10px 25px -5px rgba(225, 29, 72, 0.15),
    0 20px 40px -10px rgba(0, 0, 0, 0.1) !important;
  backdrop-filter: blur(10px);
}

:deep(.modern-popconfirm-c-end .el-popconfirm__main) {
  margin-bottom: 16px !important;
  font-weight: 900 !important;
  color: #9f1239 !important; /* rose-900 */
  font-size: 14px !important;
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.modern-popconfirm-c-end .el-popconfirm__main .el-popconfirm__icon) {
  color: #f43f5e !important; /* rose-500 */
  font-size: 18px !important;
}

:deep(.modern-popconfirm-c-end .el-button--primary) {
  background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%) !important;
  border: none !important;
  border-radius: 12px !important;
  font-weight: 900 !important;
  font-size: 12px !important;
  height: 34px !important;
  padding: 0 16px !important;
  box-shadow: 0 4px 12px rgba(225, 29, 72, 0.3) !important;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
}

:deep(.modern-popconfirm-c-end .el-button--primary:hover) {
  transform: translateY(-1px) scale(1.05) !important;
  box-shadow: 0 6px 15px rgba(225, 29, 72, 0.4) !important;
}

:deep(.modern-popconfirm-c-end .el-button--default) {
  border-radius: 12px !important;
  font-weight: 800 !important;
  font-size: 12px !important;
  height: 34px !important;
  background: rgba(255, 255, 255, 0.8) !important;
  border: 1px solid rgba(251, 113, 133, 0.2) !important;
  color: #e11d48 !important;
  transition: all 0.2s ease !important;
}

:deep(.modern-popconfirm-c-end .el-button--default:hover) {
  background: #ffffff !important;
  color: #be123c !important;
  border-color: rgba(251, 113, 133, 0.4) !important;
}

:deep(.modern-message-success) {
  border-radius: 16px !important;
  padding: 12px 24px !important;
  background: #10b981 !important;
  border: none !important;
}

:deep(.modern-message-success .el-message__content) {
  color: white !important;
  font-weight: 900 !important;
}

:deep(.modern-message-success .el-message__icon) {
  color: white !important;
}

/* No Scrollbar helper */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Sequential Generation Loading Styles */
@keyframes float {
  0%, 100% { transform: translateY(0) translateX(0); }
  25% { transform: translateY(-20px) translateX(10px); }
  50% { transform: translateY(-10px) translateX(20px); }
  75% { transform: translateY(10px) translateX(10px); }
}

@keyframes float-slow {
  0%, 100% { transform: rotate(12deg) translateY(0); }
  50% { transform: rotate(8deg) translateY(-10px); }
}

@keyframes slide-up-fade {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer-fast {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-float {
  animation: float 15s infinite ease-in-out;
}

.animate-float-slow {
  animation: float-slow 4s infinite ease-in-out;
}

.animate-slide-up-fade {
  animation: slide-up-fade 0.8s ease-out forwards;
}

.animate-shimmer-fast {
  animation: shimmer-fast 1.5s infinite linear;
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

/* Custom Warning Animation */
.toast-bounce-enter-active {
  animation: toast-bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-bounce-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.toast-bounce-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

@keyframes toast-bounce-in {
  0% { opacity: 0; transform: scale(0.85) translateY(-20px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
