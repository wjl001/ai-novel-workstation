<template>
  <div class="h-full flex flex-col bg-[#F8FAFC] dark:bg-slate-900 overflow-hidden relative">
    <!-- Big Loading Overlay for Storyboard Script Generation -->
    <teleport to="body">
      <transition name="fade-scale">
        <div v-if="isGeneratingStoryboardText" class="fixed inset-0 z-[10000] flex items-center justify-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
          <div class="relative w-full max-w-lg px-6 flex flex-col items-center gap-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl p-10 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white dark:border-slate-700">
            <!-- Central Icon -->
            <div class="relative">
              <div class="absolute inset-0 bg-purple-500 rounded-3xl blur-[40px] opacity-10 animate-pulse"></div>
              <div class="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-purple-500/20 rotate-6 animate-float-slow">
                <el-icon :size="40" class="animate-bounce-subtle"><Film /></el-icon>
              </div>
            </div>

            <!-- Progress Info -->
            <div class="w-full flex flex-col items-center gap-5">
              <div class="text-center">
                <h2 class="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">AI 分镜规划中</h2>
                <p class="text-slate-500 dark:text-slate-400 text-sm font-bold">{{ currentStoryboardInfo }}</p>
              </div>

              <!-- Progress Bar -->
              <div class="w-full h-2.5 bg-slate-100 dark:bg-slate-900/50 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50 relative">
                <div 
                  class="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 transition-all duration-500 ease-out relative"
                  :style="{ width: generationProgress + '%' }"
                >
                  <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-fast"></div>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Storyboard Intelligence Engine...</span>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- Decorative background elements for C-end feel -->
    <div class="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0"></div>
    <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none z-0"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

    <!-- Header -->
    <header class="h-14 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between px-6 shrink-0 z-30 relative shadow-sm transition-all duration-300">
      <!-- Product Design Info Button -->
      <button 
        @click="showDesignDialog = true"
        class="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 h-8 px-4 flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full font-bold text-[12px] shadow-sm border border-slate-200/50 dark:border-slate-600/50 transition-all duration-300 z-50"
      >
        <el-icon :size="14"><InfoFilled /></el-icon>
        <span>产品设计说明</span>
      </button>

      <div class="flex items-center gap-4 pl-12">
        <el-dropdown trigger="click" @command="handleEpisodeSwitch">
          <div class="flex items-center gap-2 cursor-pointer group px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-full transition-all">
            <h1 class="text-[15px] font-black text-slate-800 dark:text-white truncate max-w-[300px] group-hover:text-indigo-600 transition-colors">
              <template v-if="episodeNotFound">
                视频不存在
              </template>
              <template v-else>
                {{ episode?.title || '第 1 集：命运抉择系统自毁' }}
              </template>
            </h1>
            <el-icon class="text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:rotate-180 duration-300"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu class="!rounded-2xl !p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
              <el-dropdown-item 
                v-for="ep in episodeStore.episodes" 
                :key="ep.id" 
                :command="ep.id"
                :disabled="ep.id === episodeId"
                class="!rounded-xl !py-3 !px-4"
                :class="{ '!text-indigo-600 !bg-indigo-50 !font-bold': ep.id === episodeId }"
              >
                {{ ep.title }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      
      <div class="flex items-center gap-3">
        <div v-if="false" class="flex items-center gap-2 bg-slate-100/50 dark:bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-200/50 dark:border-slate-700/50">
          <el-icon class="text-indigo-500"><Menu /></el-icon>
          <el-select v-model="synthesisModel" size="small" class="w-36 !border-none custom-select-transparent">
            <el-option label="Seedance 2.0 • Fast" value="seedance-fast" />
            <el-option label="Seedance 2.0 • Quality" value="seedance-quality" />
          </el-select>
        </div>
        
        <button 
          v-if="false"
          @click="handleExport"
          class="h-9 px-4 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-full text-[13px] font-bold hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center gap-2 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="!timelineScenes[currentSceneIdx]?.video"
        >
          <el-icon><RefreshRight /></el-icon> 导出
        </button>

        <button 
          v-if="false"
          @click="showBgmConfig = true"
          :disabled="!isAllScenesGenerated"
          class="h-9 px-4 rounded-full text-[13px] font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/10 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          :class="bgmConfig.confirmed ? 'bg-emerald-600 text-white shadow-emerald-500/20' : 'bg-indigo-600 text-white shadow-indigo-500/20'"
        >
          <el-icon><Headset /></el-icon> 
          <span>背景音乐</span>
        </button>

        <button 
          v-if="isSynthesisCompleted || episodeStore.episodes.find(e => e.id === episodeId)?.synthesisVideo"
          @click="handlePreviewFull"
          class="h-9 px-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[13px] font-bold hover:bg-indigo-100 dark:hover:bg-indigo-800 transition-all flex items-center gap-2 shadow-sm"
        >
          <el-icon><VideoPlay /></el-icon> 预览全集
        </button>

        <button 
          @click="handleSynthesis"
          :disabled="!canSynthesizeAll"
          class="h-9 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-[13px] font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center gap-2"
        >
          <el-icon><MagicStick /></el-icon>
          合成全集
        </button>
      </div>
    </header>

    <!-- Main Workspace -->
    <main class="flex-1 flex gap-3 overflow-hidden p-3 bg-transparent relative z-10">
      <!-- Left Sidebar: Subject Library -->
      <aside 
        class="bg-indigo-50/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[32px] shadow-xl shadow-indigo-100/50 dark:shadow-none flex flex-col overflow-hidden shrink-0 transition-all duration-500 relative border border-indigo-100 dark:border-slate-700/50"
        :style="{ width: isLeftCollapsed ? '0px' : '220px', opacity: isLeftCollapsed ? 0 : 1, marginRight: isLeftCollapsed ? '-12px' : '0' }"
      >
        <div class="flex-1 flex flex-col overflow-hidden" v-show="!isLeftCollapsed">
          <div class="p-4 border-b border-indigo-100 dark:border-slate-700 flex justify-between items-center shrink-0">
            <span class="font-black text-[14px] text-indigo-900 dark:text-white tracking-wide">主体库</span>
            <button 
              @click="showLibraryModal = true"
              class="w-7 h-7 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all flex items-center justify-center shadow-lg shadow-indigo-200"
            >
              <el-icon :size="16"><Plus /></el-icon>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto custom-scrollbar p-3 pb-10 space-y-4 bg-white/40">
            <!-- Character Category Area -->
            <div class="bg-white/90 dark:bg-indigo-900/10 rounded-[20px] p-3 border border-indigo-100 dark:border-indigo-800/30 transition-all hover:shadow-md">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <el-icon :size="14"><User /></el-icon>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[12px] font-black text-slate-800 dark:text-white leading-tight">角色管理</span>
                    <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider">({{ filteredCharacters.length }})</span>
                  </div>
                </div>
                <button 
                  @click="handleAddSubject('character')"
                  class="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center border border-indigo-100 dark:border-indigo-800/50"
                >
                  <el-icon :size="12"><Plus /></el-icon>
                </button>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div v-for="char in filteredCharacters" :key="char.id" class="flex flex-col gap-1.5 group cursor-default">
                  <div class="w-full aspect-square rounded-[16px] bg-white dark:bg-slate-900 border-2 border-transparent overflow-hidden relative transition-all p-1">
                    <div class="w-full h-full rounded-[12px] overflow-hidden relative">
                      <el-image v-if="char.image" :src="char.image" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                      <el-icon v-else :size="20" class="text-slate-200 absolute inset-0 m-auto"><User /></el-icon>
                    </div>
                    <div class="absolute inset-0 bg-gradient-to-t from-indigo-600/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div class="w-8 h-8 rounded-xl bg-white/90 flex items-center justify-center text-indigo-600 shadow-xl shadow-indigo-500/10 transform scale-0 group-hover:scale-100 transition-all hover:scale-110 active:scale-95 hover:bg-indigo-600 hover:text-white cursor-pointer" @click.stop="handleEditSubject(char)">
                        <el-icon :size="16"><Edit /></el-icon>
                      </div>
                    </div>
                  </div>
                  <span class="text-[10px] text-slate-700 dark:text-slate-300 font-black truncate px-1 text-center transition-colors">{{ char.name.split('-')[0] }}</span>
                </div>
              </div>
            </div>

            <!-- Scene Category Area -->
            <div class="bg-white/90 dark:bg-emerald-900/10 rounded-[20px] p-3 border border-emerald-100 dark:border-emerald-800/30 transition-all hover:shadow-md">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <el-icon :size="14"><Location /></el-icon>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[12px] font-black text-slate-800 dark:text-white leading-tight">场景管理</span>
                    <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider">({{ filteredScenes.length }})</span>
                  </div>
                </div>
                <button 
                  @click="handleAddSubject('scene')"
                  class="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center border border-emerald-100 dark:border-emerald-800/50"
                >
                  <el-icon :size="12"><Plus /></el-icon>
                </button>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div v-for="scene in filteredScenes" :key="scene.id" class="flex flex-col gap-1.5 group cursor-default">
                  <div class="w-full aspect-square rounded-[16px] bg-white dark:bg-slate-900 border-2 border-transparent overflow-hidden relative transition-all p-1">
                    <div class="w-full h-full rounded-[12px] overflow-hidden relative">
                      <el-image v-if="scene.image" :src="scene.image" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                      <el-icon v-else :size="20" class="text-slate-200 absolute inset-0 m-auto"><Location /></el-icon>
                    </div>
                    <div class="absolute inset-0 bg-gradient-to-t from-emerald-600/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div class="w-8 h-8 rounded-xl bg-white/90 flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-500/10 transform scale-0 group-hover:scale-100 transition-all hover:scale-110 active:scale-95 hover:bg-emerald-600 hover:text-white cursor-pointer" @click.stop="handleEditSubject(scene)">
                        <el-icon :size="16"><Edit /></el-icon>
                      </div>
                    </div>
                  </div>
                  <span class="text-[10px] text-slate-700 dark:text-slate-300 font-black truncate px-1 text-center transition-colors">{{ scene.name }}</span>
                </div>
              </div>
            </div>

            <!-- Props Category Area -->
            <div class="bg-white/90 dark:bg-amber-900/10 rounded-[20px] p-3 border border-amber-100 dark:border-amber-800/30 transition-all hover:shadow-md">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <el-icon :size="14"><Box /></el-icon>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[12px] font-black text-slate-800 dark:text-white leading-tight">道具管理</span>
                    <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider">({{ filteredProps.length }})</span>
                  </div>
                </div>
                <button 
                  @click="handleAddSubject('prop')"
                  class="w-6 h-6 rounded-lg bg-amber-50 dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm hover:bg-amber-600 hover:text-white transition-all flex items-center justify-center border border-amber-100 dark:border-amber-800/50"
                >
                  <el-icon :size="12"><Plus /></el-icon>
                </button>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div v-for="prop in filteredProps" :key="prop.id" class="flex flex-col gap-1.5 group cursor-default">
                  <div class="w-full aspect-square rounded-[16px] bg-white dark:bg-slate-900 border-2 border-transparent overflow-hidden relative transition-all p-1">
                    <div class="w-full h-full rounded-[12px] overflow-hidden relative">
                      <el-image v-if="prop.image" :src="prop.image" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                      <el-icon v-else :size="20" class="text-slate-200 absolute inset-0 m-auto"><Box /></el-icon>
                    </div>
                    <div class="absolute inset-0 bg-gradient-to-t from-amber-600/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div class="w-8 h-8 rounded-xl bg-white/90 flex items-center justify-center text-amber-600 shadow-xl shadow-amber-500/10 transform scale-0 group-hover:scale-100 transition-all hover:scale-110 active:scale-95 hover:bg-amber-600 hover:text-white cursor-pointer" @click.stop="handleEditSubject(prop)">
                        <el-icon :size="16"><Edit /></el-icon>
                      </div>
                    </div>
                  </div>
                  <span class="text-[10px] text-slate-700 dark:text-slate-300 font-black truncate px-1 text-center transition-colors">{{ prop.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Sidebar Collapse Toggle Button -->
      <div 
        class="absolute left-[206px] top-1/2 -translate-y-1/2 w-6 h-16 flex items-center justify-center cursor-pointer z-[150] group transition-all duration-500"
        :style="{ left: isLeftCollapsed ? '-12px' : '206px' }"
        @click="isLeftCollapsed = !isLeftCollapsed"
      >
        <div class="absolute inset-0 bg-indigo-600 shadow-[0_4px_20px_rgba(99,102,241,0.3)] rounded-full transition-all duration-300 group-hover:scale-y-110 group-hover:bg-indigo-700"></div>
        <el-icon class="relative z-10 text-white" :size="14">
          <ArrowLeft v-if="!isLeftCollapsed" />
          <ArrowRight v-else />
        </el-icon>
      </div>

      <!-- Right Column: Editor & Timeline -->
      <div class="flex-1 flex flex-col gap-3 min-w-0 transition-all duration-500">
        <!-- Center: Script Editor Area -->
        <section class="flex-1 flex flex-col min-h-0 bg-[#F0F7FF] dark:bg-slate-900/50 backdrop-blur-xl rounded-[32px] shadow-2xl shadow-blue-100 dark:shadow-none border border-blue-100 dark:border-slate-800 overflow-hidden relative">
          <!-- Top Toolbar / Header -->
          <div class="px-6 py-2.5 bg-white/60 dark:bg-slate-900/40 flex justify-between items-center shrink-0 border-b border-blue-100/50 dark:border-slate-800/50">
            <div class="flex items-center gap-3">
              <div class="px-3 py-1 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/20">分镜 {{ currentSceneIdx + 1 }}</div>
              <span class="text-[12px] text-indigo-400 dark:text-slate-500 font-bold">输入“@”可快速引用主体，分镜建议 4-15s</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1.5 px-3 py-1 bg-white/80 dark:bg-slate-900/50 rounded-full border border-blue-100/50 shadow-sm">
                <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span class="text-[11px] font-bold text-slate-600 dark:text-slate-400">创作模式已开启</span>
              </div>
            </div>
          </div>

          <!-- Content Wrapper -->
          <div class="flex-1 flex flex-col min-h-0 overflow-hidden relative">
            <div class="flex-1 flex gap-4 px-6 pb-4 overflow-hidden mt-3">
              <!-- Left: Script Content Box -->
              <div 
                class="flex-[4] rounded-[24px] transition-all duration-500 relative flex flex-col overflow-hidden"
                :class="isEditingScript ? 'bg-white dark:bg-slate-900 border-2 border-indigo-500 shadow-2xl shadow-indigo-200/50' : 'bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-700 shadow-sm'"
              >
                <!-- Read-only View -->
                <div 
                  v-if="!isEditingScript"
                  class="px-6 py-4 text-[16px] text-slate-700 dark:text-slate-200 leading-[1.8] outline-none flex-1 overflow-y-auto custom-scrollbar cursor-text font-medium"
                  v-html="currentScript"
                >
                </div>

                <!-- Edit Mode (TipTap) -->
                <div v-else class="flex-1 flex flex-col relative overflow-hidden px-6 py-4">
                  <div class="flex-1 overflow-y-auto custom-scrollbar">
                    <editor-content :editor="editor" class="script-editor-content w-full h-full text-[16px]" />
                  </div>
                  
                  <!-- @ Mention Popup -->
                  <teleport to="body">
                    <transition name="el-zoom-in-top">
                      <div 
                        v-if="showMentionMenu" 
                        ref="mentionMenuRef"
                        class="fixed z-[9999] bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200/50 dark:border-slate-700/50 p-2 min-w-[280px] max-w-[340px]"
                        :style="mentionMenuStyle"
                      >
                        <div class="mb-2 px-3 py-1.5 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                          <el-icon class="text-slate-400" size="14"><Search /></el-icon>
                          <span class="text-[12px] text-slate-500 font-bold uppercase tracking-wider">快捷引用</span>
                        </div>

                        <div class="flex gap-1 p-1 mb-2 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl shrink-0 overflow-x-auto custom-scrollbar">
                          <button 
                            v-for="tab in ['all', 'duration', 'character', 'scene', 'asset']" 
                            :key="tab"
                            @click="mentionActiveTab = tab"
                            class="px-3 py-1.5 text-[11px] rounded-lg transition-all whitespace-nowrap font-black"
                            :class="mentionActiveTab === tab ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'"
                          >
                            {{ tab === 'all' ? '全部' : tab === 'duration' ? '时长' : tab === 'character' ? '角色' : tab === 'scene' ? '场景' : '道具' }}
                          </button>
                        </div>

                        <div class="max-h-[300px] overflow-y-auto custom-scrollbar">
                          <div 
                            v-for="(item, idx) in mentionItems" 
                            :key="idx"
                            class="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all group"
                            :class="idx === selectedMentionIndex ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-700 dark:text-slate-200'"
                            @click="insertMention(item)"
                          >
                            <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 border border-slate-50 dark:border-slate-700 relative">
                              <img v-if="'image' in item && item.image" :src="item.image" class="w-full h-full object-cover relative z-10" />
                              <el-icon class="text-slate-400 absolute inset-0 m-auto" size="18"><component :is="item.icon" /></el-icon>
                            </div>
                            <div class="flex flex-col min-w-0">
                              <span class="text-[13px] font-black truncate">{{ item.name }}</span>
                              <span class="text-[10px] opacity-60 truncate font-medium">{{ item.desc }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </transition>
                  </teleport>
                </div>

                <!-- Action Buttons Area -->
                <div class="px-6 py-2 flex justify-end gap-3 shrink-0 border-t border-slate-50 dark:border-slate-800 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md">
                  <template v-if="!isEditingScript">
                    <button 
                      @click="handleEditScript"
                      class="h-8 px-6 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-200 dark:border-indigo-800 rounded-full text-[13px] font-black hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-md flex items-center gap-2 group"
                    >
                      <el-icon class="group-hover:rotate-12 transition-transform"><Edit /></el-icon>
                      <span>编辑脚本</span>
                    </button>
                    <button 
                      @click="handleBatchGenerate"
                      :disabled="!timelineScenes[currentSceneIdx]?.modified"
                      class="h-8 px-8 rounded-full text-[13px] font-black transition-all flex items-center gap-2"
                      :class="timelineScenes[currentSceneIdx]?.modified ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 active:scale-95' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-50'"
                    >
                      <el-icon class="animate-pulse"><MagicStick /></el-icon>
                      <span>重新生成分镜</span>
                    </button>
                    <button 
                      @click="openCropDialog"
                      :disabled="!currentPreview"
                      class="h-8 px-6 rounded-full text-[13px] font-black transition-all shadow-md flex items-center gap-2 group"
                      :class="currentPreview ? (isLight ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-600 hover:text-white shadow-sm' : 'bg-teal-500/10 text-teal-400 border border-teal-500/30 hover:bg-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.1)]') : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-50'"
                    >
                      <el-icon class="group-hover:rotate-12 transition-transform"><Scissor /></el-icon>
                      <span>分镜剪辑</span>
                    </button>
                  </template>
                  <template v-else>
                    <button 
                      @click="handleCancelEdit"
                      class="h-8 px-6 bg-white dark:bg-slate-800 text-slate-500 rounded-full text-[13px] font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
                    >
                      取消
                    </button>
                    <button 
                      @click="handleSaveScriptInline"
                      class="h-8 px-12 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-full text-[13px] font-black shadow-xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all"
                    >
                      确认保存
                    </button>
                  </template>
                </div>
              </div>

              <!-- Right: Preview Area -->
              <div class="flex-1 rounded-[24px] bg-slate-900 flex flex-col items-center justify-center border border-slate-800 overflow-hidden relative shadow-2xl">
                <div v-if="timelineScenes[currentSceneIdx]?.status === 'generating'" class="absolute inset-0 z-20 flex flex-col items-center justify-center text-white overflow-hidden">
                  <div class="absolute inset-0 bg-gradient-to-br from-indigo-600/60 to-purple-600/60 backdrop-blur-2xl"></div>
                  <div class="relative flex flex-col items-center gap-4">
                    <div class="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span class="text-[16px] font-black tracking-widest">生成中...</span>
                  </div>
                </div>

                <div v-else-if="currentPreview" class="w-full h-full relative rounded-2xl overflow-hidden group bg-black shadow-2xl">
                  <video 
                    ref="centerVideoRef"
                    :src="currentPreview" 
                    class="w-full h-full object-contain"
                    controls
                    autoplay
                    :loop="!isSequentialPlaying"
                    muted
                    @ended="handleSceneVideoEnded"
                    @timeupdate="onCenterVideoTimeUpdate"
                  ></video>
                  <!-- Hover Crop Button -->
                  <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button 
                      @click="openCropDialog"
                      class="h-8 px-4 backdrop-blur-md rounded-full text-[12px] font-bold transition-all shadow-lg flex items-center gap-2"
                      :class="isLight ? 'bg-indigo-50/90 text-indigo-600 border border-indigo-200 hover:bg-indigo-600 hover:text-white' : 'bg-teal-500/20 text-teal-400 border border-teal-500/30 hover:bg-teal-500/30'"
                    >
                      <el-icon><Scissor /></el-icon>
                      <span>分镜剪辑</span>
                    </button>
                  </div>
                </div>
                <div v-else class="flex flex-col items-center gap-6 text-slate-400">
                  <div class="relative">
                    <div class="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl animate-pulse"></div>
                    <el-icon :size="80" class="relative z-10"><Film /></el-icon>
                  </div>
                  <div class="flex flex-col items-center gap-2 text-center">
                    <span class="text-[16px] font-black text-slate-300 tracking-widest uppercase">分镜视频待生成</span>
                    <p class="text-[12px] text-slate-500 font-medium">请点击下方时间轴上的图标开始生成</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Bottom: Timeline Area -->
        <div class="h-[140px] bg-[#F5F3FF] dark:bg-slate-900/50 backdrop-blur-xl rounded-[32px] shadow-xl shadow-purple-100 dark:shadow-none border border-purple-100 dark:border-slate-800 p-3.5 flex flex-col gap-2 shrink-0 transition-all duration-500">
          <div class="flex items-center justify-between shrink-0 pl-1 pr-1">
            <div class="flex items-center gap-3">
              <div 
                class="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-200 cursor-pointer hover:scale-110 active:scale-95 transition-all"
                @click="handleSequentialPlay"
              >
                <el-icon :size="12">
                  <VideoPause v-if="isSequentialPlaying" />
                  <VideoPlay v-else />
                </el-icon>
              </div>
              <span class="text-[11px] text-purple-600 dark:text-slate-400 font-black font-mono tracking-tight">
                {{ formatTime(isSequentialPlaying ? sequentialCurrentTime : 0) }} / {{ formatTime(totalStoryboardDuration) }}
              </span>
            </div>
            
            <div class="flex items-center gap-2">
              <el-checkbox
                v-if="isMultiSelectMode"
                v-model="isAllSelected"
                :indeterminate="isIndeterminate"
                class="custom-timeline-checkbox mr-2"
              >
                <span class="text-[10px] font-black text-purple-600 dark:text-slate-400">全选</span>
              </el-checkbox>

              <button 
                v-if="isMultiSelectMode && selectedScenes.length > 0"
                @click="handleBatchGenerate"
                class="h-6 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-[10px] font-black hover:shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center gap-1.5 animate-in fade-in slide-in-from-right-2 duration-300"
              >
                <el-icon :size="10"><MagicStick /></el-icon>
                <span>批量生成视频 ({{ selectedScenes.length }})</span>
              </button>
              
              <button 
                @click="toggleMultiSelect" 
                class="h-6 px-3 bg-white dark:bg-slate-700 text-purple-600 dark:text-slate-300 rounded-full text-[10px] font-black hover:bg-purple-600 hover:text-white transition-all shadow-sm border border-purple-100"
              >
                {{ isMultiSelectMode ? '退出多选' : '多选管理' }}
              </button>
            </div>
          </div>

          <!-- Timeline Items -->
          <div class="flex-1 flex gap-2.5 overflow-x-auto custom-scrollbar items-center pb-0.5 pl-0.5 relative">
            <transition-group name="list">
              <div v-for="(scene, idx) in timelineScenes" :key="scene.id" 
                class="flex-shrink-0 w-[70px] h-[95px] rounded-[14px] bg-white dark:bg-slate-900 border-2 shadow-sm flex items-center justify-center relative cursor-pointer transition-all hover:scale-105 overflow-hidden group"
                :class="[
                  (!isMultiSelectMode && currentSceneIdx === idx) || (isMultiSelectMode && selectedScenes.includes(idx)) 
                    ? 'border-purple-500 ring-4 ring-purple-500/10' 
                    : 'border-white dark:border-slate-700',
                  isSequentiallyGeneratingStoryboard && idx === currentGeneratingStoryboardIndex ? 'ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-slate-900' : ''
                ]"
                @click="toggleSceneSelection(idx)"
              >
                <!-- Active Glowing Border Effect -->
                <div v-if="currentSceneIdx === idx" class="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-blue-500/20 opacity-40 animate-pulse-slow z-[2]"></div>

                <div v-if="scene.image" class="absolute inset-0 w-full h-full z-0">
                  <img :src="scene.image" class="absolute inset-0 w-full h-full object-cover" />
                  <div class="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                </div>

                <!-- Duration Badge (New Request) -->
                <div class="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-white text-[8px] font-black z-10">
                  {{ getSceneDuration(scene.script) }}s
                </div>

                <!-- Index Badge -->
                <div class="absolute top-1.5 left-1.5 z-10 flex items-center gap-1">
                  <div class="w-4 h-4 rounded flex items-center justify-center text-[9px] font-black shadow-md"
                    :class="currentSceneIdx === idx ? 'bg-purple-600 text-white' : 'bg-white text-slate-800'">
                    {{ idx + 1 }}
                  </div>
                  <div 
                    v-if="false"
                    class="w-4 h-4 rounded bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md active:scale-90"
                    @click.stop="deleteScene(idx)"
                  >
                    <el-icon :size="10"><Delete /></el-icon>
                  </div>
                </div>

                <!-- Playback Progress Overlay -->
                <div 
                  v-if="isSequentialPlaying && currentSceneIdx === idx"
                  class="absolute inset-0 bg-black/30 pointer-events-none z-[5]"
                >
                  <div 
                    class="absolute bottom-0 left-0 h-1 bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)] transition-all duration-100 ease-linear"
                    :style="{ width: `${(currentSceneVideoTime / getSceneDuration(scene.script)) * 100}%` }"
                  ></div>
                </div>

                <div class="flex items-center justify-center w-full h-full relative z-10">
                  <div v-if="scene.status === 'script_generating'" class="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1">
                    <el-icon class="is-loading text-purple-600" :size="20"><Loading /></el-icon>
                    <span class="text-[9px] font-black text-purple-600 uppercase tracking-widest animate-pulse text-center px-1">分镜脚本生成</span>
                  </div>
                  <div v-else-if="scene.status === 'generating'" class="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1">
                    <el-icon class="is-loading text-purple-600" :size="20"><Loading /></el-icon>
                    <span class="text-[8px] font-black text-purple-600 uppercase tracking-widest animate-pulse">视频生成中</span>
                  </div>
                  <div v-else-if="scene.status === 'success'" class="opacity-0 group-hover:opacity-100 transition-all">
                    <el-icon :size="18" class="text-white drop-shadow-lg"><VideoPlay /></el-icon>
                  </div>
                  <div 
                    v-else 
                    class="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-purple-600 transition-all shadow-lg border border-white/30"
                    @click.stop="handleGenerateSingleScene(idx)"
                  >
                    <el-icon :size="18"><MagicStick /></el-icon>
                  </div>
                </div>
              </div>
            </transition-group>
            
            <!-- <button 
              class="flex-shrink-0 w-[40px] h-[95px] rounded-xl border-2 border-dashed border-purple-200 dark:border-slate-700 flex items-center justify-center text-purple-300 hover:text-purple-600 hover:border-purple-400 transition-all group"
              @click="addTimelineScene"
            >
              <el-icon :size="18" class="group-hover:scale-125 transition-transform"><Plus /></el-icon>
            </button> -->
          </div>
        </div>
      </div>
    </main>

      <!-- Synthesis Progress Modal -->
      <el-dialog 
        v-model="showSynthesisConfig" 
        width="1000px" 
        center 
        class="synthesis-progress-dialog"
        :show-close="!isSynthesizing"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
      >
        <template #header>
          <div class="flex items-center justify-between px-2">
            <span class="text-[18px] font-bold text-slate-800">{{ isSynthesizing ? '合成全集' : '预览全集' }}</span>
          </div>
        </template>
        
        <div class="p-0 min-h-[600px] flex flex-col items-center justify-center relative bg-[#111] rounded-xl overflow-hidden group">
          <!-- State 1: Synthesizing (Progress) -->
          <div v-if="isSynthesizing" class="absolute inset-0 z-10 flex flex-col items-center justify-center text-white">
            <!-- Background Preview (First scene blurred) -->
            <img :src="timelineScenes[0]?.image" class="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm" />
            <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
            
            <div class="relative flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
              <div v-if="synthesisProgress < 10" class="flex flex-col items-center gap-4">
                <div class="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin shadow-lg"></div>
                <span class="text-[18px] font-bold tracking-widest drop-shadow-md">正在提交合成任务...</span>
              </div>
              <div v-else class="flex flex-col items-center gap-2">
                <span class="text-[64px] font-black tracking-tighter drop-shadow-2xl">{{ synthesisProgress }}%</span>
                <span class="text-[16px] font-bold tracking-widest text-white/80 drop-shadow-md">合成中...</span>
              </div>
            </div>
          </div>

          <!-- State 2: Synthesis Success (Preview & Export) -->
          <div v-else-if="isSynthesisCompleted" class="absolute inset-0 w-full h-full flex flex-col bg-[#111] animate-in fade-in duration-500 z-20">
            <!-- Video Player -->
            <div class="flex-1 relative group/player flex items-center justify-center min-h-[400px] bg-black">
              <video 
                ref="fullVideoRef"
                :src="fullSynthesisVideoUrl" 
                class="w-full h-full object-contain"
                autoplay
                loop
                playsinline
                muted
                @timeupdate="onVideoTimeUpdate"
                @loadedmetadata="onVideoLoaded"
                @error="handleSynthesisVideoError"
                @play="isPlaying = true"
                @pause="isPlaying = false"
              ></video>
              
              <!-- Video Controls Overlay -->
              <div class="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent flex flex-col gap-3 opacity-0 group-hover/player:opacity-100 transition-opacity z-20">
                <div class="flex items-center gap-4">
                  <button @click="togglePlay" class="text-white hover:text-indigo-400 transition-colors">
                    <el-icon size="28"><VideoPause v-if="isPlaying"/><VideoPlay v-else/></el-icon>
                  </button>
                  <span class="text-[14px] text-white font-mono">{{ formatTime(currentTime) }} | {{ formatTime(duration) }}</span>
                  <div class="flex-1 h-1.5 bg-white/20 rounded-full relative cursor-pointer" @click="seekVideo">
                    <div class="absolute top-0 left-0 h-full bg-indigo-500 rounded-full" :style="{ width: `${(currentTime/duration)*100}%` }"></div>
                  </div>
                  <div class="flex items-center gap-4">
                    <el-icon class="text-white cursor-pointer hover:text-indigo-400" size="20"><Microphone /></el-icon>
                    <el-icon class="text-white cursor-pointer hover:text-indigo-400" size="24" @click="toggleFullScreen"><FullScreen /></el-icon>
                  </div>
                </div>
              </div>
            </div>

            <!-- Export Options Panel (Redesigned for C-end users) -->
            <div class="bg-white px-10 py-8 flex items-center justify-end border-t border-slate-50 shrink-0 z-40 h-[140px]">
              <!-- Primary Export Button -->
              <el-button 
                type="primary" 
                class="!h-[56px] !px-14 !rounded-2xl !text-[18px] font-bold shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all theme-primary-btn"
                @click="downloadVideo"
              >
                <el-icon class="mr-2" size="20"><Download /></el-icon>
                导出到本地
              </el-button>
            </div>
          </div>
          <div v-else class="absolute inset-0 flex items-center justify-center text-white/70 text-[14px]">
            等待开始合成
          </div>
        </div>
      </el-dialog>

      <!-- BGM Configuration Dialog -->
      <el-dialog
        v-model="showBgmConfig"
        title="配置背景音乐"
        width="480px"
        class="bgm-config-dialog"
        destroy-on-close
      >
        <div class="space-y-2 py-0">
          <!-- 1. AI 智能生成 (主要功能) -->
          <div class="bg-indigo-50/50 rounded-xl p-3 border border-indigo-100/50">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                  <el-icon size="14"><MagicStick /></el-icon>
                </div>
                <span class="text-[13px] font-bold text-slate-800">AI 智能配乐</span>
              </div>
              <span class="text-[9px] font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded-full uppercase tracking-wider">官方推荐</span>
            </div>

            <div v-if="isAiGeneratingBgm" class="py-4 flex flex-col items-center justify-center gap-2">
              <div class="w-10 h-10 relative">
                <svg class="w-full h-full transform -rotate-90">
                  <circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="2" fill="transparent" class="text-indigo-100" />
                  <circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="2" fill="transparent" 
                    class="text-indigo-600 transition-all duration-300"
                    stroke-dasharray="113.1"
                    :stroke-dashoffset="113.1 - (113.1 * aiBgmProgress / 100)"
                  />
                </svg>
                <div class="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-indigo-600">
                  {{ aiBgmProgress }}%
                </div>
              </div>
              <p class="text-[11px] font-medium text-slate-600 animate-pulse">正在生成专属配乐...</p>
            </div>

            <div v-else class="space-y-2">
              <!-- Style Grid (Very Compact) -->
              <div class="grid grid-cols-4 gap-1.5 max-h-[120px] overflow-y-auto custom-scrollbar pr-1">
                <button 
                  v-for="item in bgmStyles" 
                  :key="item.label"
                  @click="handleAiBgmGenerate(item.label)"
                  class="flex flex-col items-center justify-center gap-0.5 p-1.5 bg-white rounded-lg border border-slate-100 hover:border-indigo-400 hover:shadow-sm transition-all group relative overflow-hidden"
                >
                  <div class="absolute inset-0 bg-indigo-50/0 group-hover:bg-indigo-50/50 transition-colors"></div>
                  <span class="text-base group-hover:scale-110 transition-transform relative z-10">{{ item.icon }}</span>
                  <span class="text-[9px] font-bold text-slate-600 truncate w-full text-center relative z-10">{{ item.label }}</span>
                </button>
              </div>

              <!-- Manual Prompt Generation (Very Compact) -->
              <div class="space-y-1.5">
                <div class="flex items-center justify-between px-1">
                  <span class="text-[10px] font-bold text-slate-500">自定义提示词</span>
                  <button 
                    @click="handleAiBgmGenerate(bgmStyles[Math.floor(Math.random() * bgmStyles.length)].label)"
                    class="text-[9px] text-indigo-600 font-bold hover:underline"
                  >
                    🎲 随机
                  </button>
                </div>
                <div class="flex items-center gap-1.5 bg-white p-1.5 rounded-lg border border-slate-100 focus-within:border-indigo-400 transition-all">
                  <input 
                    v-model="bgmPrompt" 
                    placeholder="输入提示词..." 
                    class="flex-1 bg-transparent border-none text-[11px] focus:ring-0 placeholder:text-slate-300 h-6"
                    @keyup.enter="bgmPrompt && handleAiBgmGenerate('', bgmPrompt)"
                  />
                  <button 
                    @click="handleAiBgmGenerate('', bgmPrompt)"
                    :disabled="!bgmPrompt"
                    class="h-6 px-3 bg-indigo-600 text-white rounded-md text-[10px] font-bold disabled:opacity-40 hover:bg-indigo-700 active:scale-95 flex items-center gap-1"
                  >
                    生成
                  </button>
                </div>
                
                <!-- Hot Tags (Very Compact) -->
                <div class="flex flex-wrap gap-1 px-1">
                  <button 
                    v-for="tag in hotPromptTags.slice(0, 8)" 
                    :key="tag"
                    @click="addHotTag(tag)"
                    class="px-1.5 py-0.5 rounded bg-slate-100 text-[9px] text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors font-medium"
                  >
                    # {{ tag }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. 当前选中的 BGM (Very Compact) -->
          <div v-if="bgmConfig.status === 'ready'" class="bg-emerald-50 border border-emerald-100 rounded-xl p-2 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                <el-icon size="14"><Headset /></el-icon>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[12px] font-bold text-slate-800 truncate">{{ bgmConfig.name }}</p>
                <p class="text-[10px] text-emerald-600 font-medium">
                  {{ bgmConfig.style ? `${bgmConfig.style} | ` : '' }}{{ Math.floor(bgmConfig.duration / 60) }}:{{ (bgmConfig.duration % 60).toString().padStart(2, '0') }}
                </p>
              </div>
            </div>
            <el-button link type="danger" size="small" @click="resetBgm" class="!font-bold !text-[11px]">移除</el-button>
          </div>

          <!-- 3. 本地上传 (Very Compact) -->
          <div class="flex items-center gap-3 px-1">
            <div class="flex-1 h-px bg-slate-100"></div>
            <span class="text-[9px] font-bold text-slate-300 uppercase tracking-widest">或</span>
            <div class="flex-1 h-px bg-slate-100"></div>
          </div>

          <div 
            @click="(e: Event) => { const input = (e.target as HTMLElement).closest('div')?.nextElementSibling as HTMLInputElement; input?.click(); }"
            class="flex items-center gap-2 p-2 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-all group"
          >
            <div class="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
              <el-icon size="14"><Upload /></el-icon>
            </div>
            <div class="flex-1">
              <p class="text-[12px] font-bold text-slate-700">上传本地音乐</p>
              <p class="text-[10px] text-slate-400">支持 mp3, wav, m4a</p>
            </div>
            <input type="file" ref="bgmFileInput" class="hidden" accept="audio/*" @change="handleBgmUpload" />
          </div>
        </div>
        <template #footer>
          <div class="flex justify-end gap-2 border-t border-slate-50 pt-2">
            <el-button @click="showBgmConfig = false" class="!rounded-lg !px-4" size="small">取消</el-button>
            <el-button 
              type="primary" 
              @click="handleBgmConfirm" 
              class="theme-primary-btn !rounded-lg !px-6"
              size="small"
              :disabled="bgmConfig.status !== 'ready'"
            >确定</el-button>
          </div>
        </template>
      </el-dialog>

      <!-- Subject Edit Modal -->
      <SubjectEditDialog
          v-model="showSubjectEdit"
          :subject="editingSubject"
          :is-edit="isEdit"
          @save="saveSubject"
        />

        <!-- Subject Library Modal -->
        <SubjectLibraryModal
          v-model="showLibraryModal"
          :subjects="subjects"
          :current-project-name="dramaSettings.title"
          @confirm="handleLibraryConfirm"
        />

    <ProductDesignDialog
      v-model="showDesignDialog"
      id="short-drama-storyboard-v2.2"
      :default-content="{
        title: '分镜工作台',
        location: '流程环节：本页面是创作流的 Step 3 (画面生成)。它是从“静态资产”向“动态视频”跨越的最关键步骤。',
        layout: [
          '**名词解释 (Terminology)：**',
          '- **分镜 (Storyboard)：** 将文字剧本拆解后的最小视觉单位，对应一段 3-10 秒的画面。',
          '- **合成全集 (Combine Episode)：** 将本集内所有生成完毕的分镜视频拼接成一段完整的短剧视频。',
          '**界面布局：**',
          '- **左侧主体库：** 快速查阅和插入角色、场景、道具。支持从主题库直接导入，或在当前页面直接新增。',
          '- **中间编辑区：** 核心展示区。左侧为分镜脚本编辑，支持“@”快捷引用主体；修改后可重新生成分镜视频。',
          '- **底部时间轴：** 分镜队列管理。展示缩略图、时长，并支持多选批量操作。'
        ],
        interactions: [
          {
            text: '**主体资产管理 (2.2新增)：**\n - **流程：** 点击左侧面板的“+”号。\n - **动作：** 顶部“+”号可从主题库选择已有元素导入；各分类“+”号可直接创建新角色/场景/道具。鼠标悬停在卡片上可点击编辑按钮修改资产属性，实现本页面内资产的完全闭环管理。',
            image: ''
          },
          {
            text: '**分镜脚本深度编辑 (2.2新增)：**\n - **流程：** 选中某个分镜卡片，在中间编辑区点击“编辑脚本”。\n - **动作：** 进入富文本编辑模式，使用“@”符号快速插入或关联资产库中的主体。编辑保存后，可点击“重新生成分镜”将修改后的内容同步至视频生成引擎。',
            image: ''
          },
          {
            text: '**合成预览 (关键节点)：**\n - **流程：** 点击“合成全集”。\n - **动作：** 系统检查所有分镜是否均已生成。异常：若存在空缺，弹出提示“分镜X尚未生成，无法合成”。成功：将拼接成完整视频。',
            image: ''
          }
        ],
        version: '2.2.0'
      }"
    />

    <GlobalUIDesignSpecsDialog
      v-model="showUIDesignSpecsDialog"
      title="UI 设计标注 - 分镜视频页"
      subtitle="StoryboardView UI Design Specifications"
      :groups="uiDesignGroups as any"
    />

    <button
      @click="showUIDesignSpecsDialog = true"
      class="fixed bottom-6 right-6 z-[1500] w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 shadow-lg shadow-indigo-500/30 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      title="查看UI设计标注"
    >
      <el-icon :size="22"><Monitor /></el-icon>
    </button>

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

    <!-- Crop Video Dialog -->
    <el-dialog 
      v-model="showCropDialog" 
      title="分镜剪辑" 
      width="1100px" 
      :class="['crop-video-dialog', isLight ? 'is-light' : 'is-dark']"
      :append-to-body="true"
      destroy-on-close
      :close-on-click-modal="false"
      align-center
      @closed="onCropDialogClosed"
    >
      <div class="crop-container flex flex-col overflow-hidden h-[620px] transition-all duration-500 relative">
        <!-- Top: Video Player Area -->
        <div class="h-[400px] flex items-center justify-center relative group/crop-player shrink-0 border-b transition-colors duration-500"
             :class="isLight ? 'bg-slate-900 border-slate-200/20' : 'bg-black border-[#333]'">
          <video 
            ref="cropVideoRef" 
            :src="currentPreview" 
            class="h-full w-auto object-contain shadow-2xl"
            @timeupdate="onCropVideoTimeUpdate"
            @loadedmetadata="onCropVideoLoaded"
          ></video>
          <!-- Play/Pause Overlay -->
          <button @click="toggleCropPlay" class="absolute inset-0 w-full h-full flex items-center justify-center bg-black/10 opacity-0 group-hover/crop-player:opacity-100 transition-opacity z-10">
            <el-icon :size="56" class="text-white drop-shadow-2xl filter blur-[0.5px]"><VideoPause v-if="isCropPlaying" /><VideoPlay v-else /></el-icon>
          </button>
        </div>
        
        <!-- Middle: Toolbar -->
        <div class="h-14 flex items-center justify-between px-6 shrink-0 select-none transition-all duration-500 relative z-10"
             :class="isLight ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]' : 'bg-[#222228] border-b border-[#111] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]'">
          <div class="flex items-center gap-5 transition-colors duration-500"
               :class="isLight ? 'text-slate-600' : 'text-[#888]'">
            <div class="flex items-center gap-2">
              <button 
                @click="undoCrop" 
                title="撤销"
                class="p-2 rounded-xl transition-all border shadow-sm"
                :disabled="cropHistoryIndex <= 0"
                :class="cropHistoryIndex > 0 ? (isLight ? 'bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:shadow-lg hover:-translate-y-0.5' : 'bg-[#2a2a32] text-white border-[#3d3d4a] hover:bg-teal-500 hover:border-teal-500 hover:shadow-[0_4px_12px_rgba(20,184,166,0.3)] hover:-translate-y-0.5') : 'opacity-30 cursor-not-allowed bg-transparent border-transparent'"
              >
                <el-icon :size="18"><Back /></el-icon>
              </button>
              <button 
                @click="redoCrop" 
                title="重做"
                class="p-2 rounded-xl transition-all border shadow-sm"
                :disabled="cropHistoryIndex >= cropHistory.length - 1"
                :class="cropHistoryIndex < cropHistory.length - 1 ? (isLight ? 'bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:shadow-lg hover:-translate-y-0.5' : 'bg-[#2a2a32] text-white border-[#3d3d4a] hover:bg-teal-500 hover:border-teal-500 hover:shadow-[0_4px_12px_rgba(20,184,166,0.3)] hover:-translate-y-0.5') : 'opacity-30 cursor-not-allowed bg-transparent border-transparent'"
              >
                <el-icon :size="18"><Right /></el-icon>
              </button>
            </div>
            <template v-if="selectedTrack && !selectedTrack.locked">
              <div class="w-px h-6 transition-colors duration-500"
                   :class="isLight ? 'bg-slate-200' : 'bg-[#444]'"></div>
              <div class="flex items-center gap-2">
                <button 
                  @click="splitCropClip" 
                  title="分割 (Ctrl+K)"
                  class="p-2 rounded-xl transition-all border shadow-sm"
                  :class="isLight ? 'bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:shadow-lg hover:-translate-y-0.5' : 'bg-[#2a2a32] text-[#aaa] border-[#3d3d4a] hover:bg-teal-500 hover:text-white hover:border-teal-500 hover:shadow-[0_4px_12px_rgba(20,184,166,0.3)] hover:-translate-y-0.5'"
                >
                  <el-icon :size="18"><Scissor /></el-icon>
                </button>
                <button 
                  @click="deleteCropClip" 
                  title="删除 (Delete)"
                  class="p-2 rounded-xl transition-all border shadow-sm"
                  :class="isLight ? 'bg-white text-red-500 border-red-100 hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-lg hover:-translate-y-0.5' : 'bg-[#2a2a32] text-[#aaa] border-[#3d3d4a] hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-[0_4px_12px_rgba(239,68,68,0.3)] hover:-translate-y-0.5'"
                >
                  <el-icon :size="18"><Delete /></el-icon>
                </button>
              </div>
            </template>
          </div>
          <div class="flex items-center gap-6">
            <div class="flex items-center gap-3">
              <span class="text-[14px] font-black font-mono tracking-tight transition-colors duration-500"
                    :class="isLight ? 'text-slate-800' : 'text-white'">{{ formatCropTime(cropCurrentTime) }} <span class="opacity-30">/</span> {{ formatCropTime(cropDuration) }}</span>
            </div>
            <div class="flex items-center gap-3 bg-white/50 dark:bg-white/5 px-4 py-1.5 rounded-full border border-slate-200/50 dark:border-transparent w-[200px]">
              <el-icon class="cursor-pointer transition-colors text-slate-400 hover:text-indigo-600" 
                       title="缩小时间轴" @click="zoomOutCrop"><Minus /></el-icon>
              <el-slider v-model="cropZoom" :min="1" :max="100" size="small" :show-tooltip="false" 
                         :class="['crop-zoom-slider', isLight ? 'is-light' : 'is-dark']" @input="drawRuler" />
              <el-icon class="cursor-pointer transition-colors text-slate-400 hover:text-indigo-600" 
                       title="放大时间轴" @click="zoomInCrop"><Plus /></el-icon>
              <el-icon class="cursor-pointer transition-colors text-slate-400 hover:text-indigo-600 ml-1" 
                       title="自适应时间轴" @click="zoomFitCrop"><Position /></el-icon>
            </div>
          </div>
        </div>

        <!-- Bottom: Timeline Track (Like CapCut) -->
        <div class="flex-1 relative overflow-hidden flex flex-col min-h-0 select-none transition-colors duration-500"
             :class="isLight ? 'bg-slate-50' : 'bg-[#1a1a1f]'">
          <!-- Ruler -->
          <div class="h-8 border-b flex items-end relative shrink-0 overflow-hidden transition-colors duration-500" 
               :class="isLight ? 'bg-white border-slate-200/60' : 'bg-[#25252b] border-[#111]'"
               @mousedown="onRulerMouseDown">
            <!-- Offset to align with right track area -->
            <div class="absolute bottom-0 left-[80px] right-0 h-full">
                <canvas ref="rulerCanvas" class="w-full h-full block cursor-pointer"></canvas>
            </div>
          </div>
          
          <!-- Tracks Area -->
          <div class="flex-1 relative flex overflow-hidden" @wheel="onTimelineWheel">
            
            <!-- Left Track Header -->
            <div class="w-[80px] shrink-0 border-r flex flex-col z-30 transition-all duration-500 justify-center"
                 :class="isLight ? 'bg-white border-slate-200/60 shadow-[4px_0_15px_rgba(0,0,0,0.03)]' : 'bg-[#25252b] border-[#111] shadow-[2px_0_5px_rgba(0,0,0,0.5)]'">
              <div v-for="track in cropTracks" :key="track.id" class="h-16 px-2 flex flex-col items-center justify-center gap-3">
                <button 
                  @click="toggleTrackMute(track)"
                  :title="track.muted ? '取消静音' : '轨道静音'"
                  class="transition-all p-1.5 rounded-lg border shadow-sm"
                  :class="track.muted ? (isLight ? 'bg-amber-500 text-white border-amber-500 shadow-amber-200 hover:-translate-y-0.5' : 'bg-teal-500/20 text-teal-400 border-transparent') : (isLight ? 'bg-white text-slate-400 border-slate-100 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-md hover:-translate-y-0.5' : 'bg-white/5 text-[#888] border-transparent hover:text-white')"
                >
                  <el-icon :size="16"><Mute v-if="track.muted" /><Microphone v-else /></el-icon>
                </button>
                <button 
                  @click="track.locked = !track.locked"
                  :title="track.locked ? '解锁轨道' : '锁定轨道'"
                  class="transition-all p-1.5 rounded-lg border shadow-sm"
                  :class="track.locked ? (isLight ? 'bg-red-500 text-white border-red-500 shadow-red-200 hover:-translate-y-0.5' : 'bg-teal-500/20 text-teal-400 border-transparent') : (isLight ? 'bg-white text-slate-400 border-slate-100 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-md hover:-translate-y-0.5' : 'bg-white/5 text-[#888] border-transparent hover:text-white')"
                >
                  <el-icon :size="16"><Lock /></el-icon>
                </button>
              </div>
            </div>

            <!-- Track Content with Scrollbar at bottom -->
            <div class="flex-1 relative overflow-x-auto overflow-y-hidden flex flex-col justify-center transition-colors duration-500" 
                 :class="[
                   isLight ? 'bg-[#f8fafc] scrollbar-thumb-slate-300 scrollbar-track-transparent' : 'bg-[#1a1a1f] scrollbar-thumb-[#444] scrollbar-track-[#1a1a1f]',
                   'scrollbar-thin'
                 ]"
                 ref="tracksContainerRef" @scroll="onTimelineScroll" @mousemove="onTimelineMouseMove" @mouseup="onTimelineMouseUp" @mouseleave="onTimelineMouseUp"
                 @mousedown="onTracksBackgroundMouseDown($event)">
              <div class="relative h-16" :style="{ width: timelineWidth + 'px' }">
                <!-- Playhead -->
                <div 
                  class="absolute top-[-32px] bottom-[-32px] w-[2px] z-20 flex flex-col items-center transition-all duration-300"
                  :class="isLight ? 'bg-indigo-500' : 'bg-white'"
                  :style="{ left: playheadPosition + 'px' }"
                  style="cursor: ew-resize;"
                  @mousedown.stop="onPlayheadMouseDown"
                >
                  <!-- Top Handle -->
                  <div class="w-4 h-5 rounded-[4px] -mt-2 shadow-md flex items-center justify-center border-2 transition-colors"
                       :class="isLight ? 'bg-white border-indigo-500' : 'bg-[#25252b] border-white'">
                    <div class="w-0.5 h-2 rounded-full" :class="isLight ? 'bg-indigo-300' : 'bg-white/50'"></div>
                  </div>
                  <!-- Line -->
                  <div class="flex-1 w-[2px]"
                       :class="isLight ? 'bg-indigo-500/60' : 'bg-white/60'"></div>
                  <!-- Bottom Handle -->
                  <div class="w-4 h-5 rounded-[4px] -mb-2 shadow-md flex items-center justify-center border-2 transition-colors"
                       :class="isLight ? 'bg-white border-indigo-500' : 'bg-[#25252b] border-white'">
                    <div class="w-0.5 h-2 rounded-full" :class="isLight ? 'bg-indigo-300' : 'bg-white/50'"></div>
                  </div>
                </div>
                
                <!-- Video Track -->
                <div v-for="track in cropTracks" :key="track.id" class="h-16 relative w-full" :class="{'pointer-events-none': track.locked}">
                  <div v-for="clip in track.clips" :key="clip.id"
                        class="absolute top-0 h-full rounded-2xl overflow-hidden border-2 cursor-pointer group transition-all duration-300 shadow-sm hover:shadow-md"
                        :class="clip.selected ? (isLight ? 'border-indigo-600 ring-4 ring-indigo-600/15 z-10' : 'border-teal-400 z-10') : (isLight ? 'border-slate-200/80 bg-white z-0' : 'border-[#333] z-0')"
                        :style="{ left: timeToPx(clip.startTime) + 'px', width: timeToPx(clip.endTime - clip.startTime) + 'px' }"
                        @mousedown.stop="onClipMouseDown($event, clip, track)"
                  >
                    <!-- thumbnails -->
                    <div class="absolute inset-0 flex overflow-hidden pointer-events-none transition-colors duration-500"
                         :class="isLight ? 'bg-slate-100' : 'bg-[#2a2a32]'">
                      <div v-for="i in Math.max(1, Math.ceil((clip.endTime - clip.startTime) * cropZoom / 2))" :key="i" 
                           class="h-full w-12 shrink-0 border-r relative transition-colors duration-500"
                           :class="isLight ? 'border-white/60' : 'border-white/5'">
                          <img :src="getFrameThumbnail(clip, i-1)" 
                               class="w-full h-full object-cover opacity-100 block" 
                               @error="(e: any) => { e.target.style.display = 'none'; e.target.parentElement.classList.add('has-error'); }" />
                          <div class="absolute inset-0 flex items-center justify-center opacity-20 error-placeholder hidden">
                            <el-icon :size="16"><Picture /></el-icon>
                          </div>
                          <div v-if="!getFrameThumbnail(clip, i-1)" class="w-full h-full flex items-center justify-center opacity-20">
                            <el-icon :size="16"><Picture /></el-icon>
                          </div>
                      </div>
                    </div>
                    
                    <!-- Left Trim Handle -->
                    <div 
                      class="absolute left-0 top-0 bottom-0 w-4 bg-white/95 cursor-col-resize flex items-center justify-center shadow-[2px_0_10px_rgba(0,0,0,0.1)] z-20 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                      :class="{'opacity-100': clip.selected}"
                      @mousedown.stop="onTrimHandleMouseDown($event, clip, 'left')"
                    >
                      <div class="w-1 h-6 bg-slate-300 rounded-full pointer-events-none"></div>
                    </div>
                    
                    <!-- Right Trim Handle -->
                    <div 
                      class="absolute right-0 top-0 bottom-0 w-4 bg-white/95 cursor-col-resize flex items-center justify-center shadow-[-2px_0_10px_rgba(0,0,0,0.1)] z-20 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                      :class="{'opacity-100': clip.selected}"
                      @mousedown.stop="onTrimHandleMouseDown($event, clip, 'right')"
                    >
                      <div class="w-1 h-6 bg-slate-300 rounded-full pointer-events-none"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="flex justify-end gap-4 pt-5 pb-2 px-6 relative z-10 transition-colors duration-500 rounded-b-[24px]"
             :class="isLight ? 'bg-transparent' : 'bg-transparent'">
          <el-button @click="showCropDialog = false" 
                     class="!rounded-xl !h-11 !px-8 !border-2 transition-all font-bold text-[15px]"
                     :class="isLight ? '!bg-white !border-slate-200 !text-slate-600 hover:!bg-slate-50 hover:!border-slate-300 hover:!text-slate-800' : '!bg-[#2a2a32] !border-[#3d3d4a] !text-white hover:!bg-[#33333b] hover:!border-[#4d4d5a]'">取消</el-button>
          <el-button type="primary" @click="confirmCrop" 
                     class="!rounded-xl !h-11 !px-10 !border-none transition-all font-bold text-[15px] hover:-translate-y-0.5"
                     :class="isLight ? '!bg-gradient-to-r !from-indigo-600 !to-violet-600 hover:!from-indigo-500 hover:!to-violet-500 shadow-[0_6px_16px_rgba(79,70,229,0.3)] hover:shadow-[0_8px_20px_rgba(79,70,229,0.4)]' : '!bg-gradient-to-r !from-teal-600 !to-emerald-600 hover:!from-teal-500 hover:!to-emerald-500 shadow-[0_6px_16px_rgba(20,184,166,0.3)] hover:shadow-[0_8px_20px_rgba(20,184,166,0.4)]'">确认剪辑</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, watch, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import CharacterCount from '@tiptap/extension-character-count';
import { Node, mergeAttributes } from '@tiptap/core';

const isLight = inject('isLight', ref(false));
const theme = inject('theme', ref('dark'));

// Custom TipTap Extension to handle mention-pills and its nested elements
const MentionPill = Node.create({
  name: 'mentionPill',
  group: 'inline',
  inline: true,
  content: 'inline*', // allow nested i or img
  selectable: true,
  addAttributes() {
    return {
      class: {
        default: 'mention-pill',
        parseHTML: element => element.getAttribute('class'),
      }
    }
  },
  parseHTML() {
    return [{ tag: 'span.mention-pill' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0]
  },
})

const PillIcon = Node.create({
  name: 'pillIcon',
  group: 'inline',
  inline: true,
  selectable: false,
  atom: true,
  addAttributes() {
    return {
      class: {
        default: null,
        parseHTML: element => element.getAttribute('class'),
      }
    }
  },
  parseHTML() {
    return [{ tag: 'i' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['i', mergeAttributes(HTMLAttributes)]
  }
})

const PillImage = Node.create({
  name: 'pillImage',
  group: 'inline',
  inline: true,
  selectable: false,
  atom: true,
  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: element => element.getAttribute('src'),
      }
    }
  },
  parseHTML() {
    return [{ tag: 'img' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes)]
  }
})

import { 
  ArrowLeft, ArrowRight, ArrowDown, Star, MoreFilled, Plus, User, Location, 
  Box, Edit, Timer, MagicStick, RefreshRight, VideoPlay, Warning, FullScreen,
  Menu, Delete, Search, InfoFilled, Close, Select, Picture, Film, Headset,
  Download, VideoPause, Microphone, Mic, Upload, Monitor,
  Scissor, Back, Right, View, Lock, Minus, Position, Mute
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useEpisodeStore } from '@/store/episode';
import SubjectEditDialog from '@/components/AIShortDrama/SubjectEditDialog.vue';
import SubjectLibraryModal from '@/components/AIShortDrama/SubjectLibraryModal.vue';

const route = useRoute();
import ConfirmDialog from '@/components/Common/ConfirmDialog.vue';
import ProductDesignDialog from '@/components/Common/ProductDesignDialog.vue';
import GlobalUIDesignSpecsDialog from '@/components/Common/GlobalUIDesignSpecsDialog.vue';

const router = useRouter();
const episodeStore = useEpisodeStore();

// UI States
const synthesisModel = ref('seedance-fast');
const activeAssetTab = ref('roles');
const isSynthesizing = ref(false);
const synthesisProgress = ref(0);
const searchQuery = ref('');
const showGuide = ref(true);
const currentSceneIdx = ref(0);
const showLibraryModal = ref(false);
const isEditingScript = ref(false);
const isLeftCollapsed = ref(false);
const activeLeftTab = ref('basic-settings');
const showDesignDialog = ref(false);
const showUIDesignSpecsDialog = ref(false);

const uiDesignGroups = {
  layout: [
    {
      id: 'storyboardView',
      title: '分镜视频页 (StoryboardView)',
      description: '分镜视频工作台：顶部全局操作 + 左侧主体库 + 中间脚本编辑/预览 + 底部时间轴。',
      items: [
        { name: '页面主容器', value: 'h-full flex flex-col overflow-hidden', description: '背景：bg-[#F8FAFC]（暗色：dark:bg-slate-900）' },
        { name: '顶部栏高度', value: 'h-14', description: 'header 固定高度' },
        { name: '全屏生成遮罩', value: 'fixed inset-0 z-[10000]', description: '分镜规划中 Loading Overlay（teleport 到 body）' },
        { name: '主工作区内边距', value: 'p-3', description: 'main 区域 padding' },
        { name: '主工作区列间距', value: 'gap-3', description: '左侧栏与右侧工作区间距' },
        { name: '左侧主体库宽度', value: '220px', description: '折叠时 width=0 + marginRight=-12px' },
        { name: '左侧栏圆角', value: 'rounded-[32px]', description: '主体库容器' },
        { name: '中间编辑区圆角', value: 'rounded-[32px]', description: '脚本+预览容器' },
        { name: '脚本/预览卡圆角', value: 'rounded-[24px]', description: '脚本卡与预览卡统一圆角' },
        { name: '底部时间轴高度', value: 'h-[140px]', description: 'Timeline 固定高度' },
        { name: '时间轴卡片尺寸', value: 'w-[70px] h-[95px]', description: '单个分镜缩略卡' },
        { name: '侧栏折叠把手尺寸', value: 'w-6 h-16', description: '左侧栏折叠按钮' },
        { name: '合成弹窗宽度', value: 'width="850px"', description: 'Synthesis Progress Modal / 成功预览与导出面板' },
        { name: 'BGM 弹窗宽度', value: 'width="750px"', description: '背景音乐配置弹层' }
      ]
    }
  ],
  style: [
    {
      id: 'storyboardView',
      title: '分镜视频页 (StoryboardView)',
      description: '字号、字重、层级与典型文案样式。',
      items: [
        { name: '顶部剧集标题', style: { fontSize: '15px', fontWeight: '900' }, description: 'text-[15px] font-black（下拉标题）' },
        { name: '分镜编号徽标', style: { fontSize: '12px', fontWeight: '900', letterSpacing: '0.12em' }, description: 'text-xs uppercase tracking-widest（“分镜 N”）' },
        { name: '脚本文字', style: { fontSize: '16px', fontWeight: '500', lineHeight: '1.8' }, description: 'text-[16px] leading-[1.8] font-medium（阅读/编辑主体）' },
        { name: '提示辅助文案', style: { fontSize: '12px', fontWeight: '700' }, description: 'text-[12px] font-bold（输入@提示、空态提示）' },
        { name: '时间轴计时', style: { fontSize: '11px', fontWeight: '900' }, description: 'text-[11px] font-black font-mono（00:00 / 00:15）' },
        { name: '时间轴角标', style: { fontSize: '8px', fontWeight: '900' }, description: 'text-[8px] font-black（时长 badge）' },
        { name: '多选按钮', style: { fontSize: '10px', fontWeight: '900' }, description: 'text-[10px] font-black（多选管理/批量生成）' }
      ]
    }
  ],
  color: [
    {
      id: 'storyboardView',
      title: '分镜视频页 (StoryboardView)',
      description: '背景、容器、强调色与状态色。',
      items: [
        { name: '页面背景', value: 'bg-[#F8FAFC] / dark:bg-slate-900' },
        { name: '装饰光晕', value: 'indigo/purple/blue 低透明 blur' },
        { name: '顶部栏底色', value: 'bg-white/80 dark:bg-slate-800/80 + backdrop-blur-xl' },
        { name: '全屏生成遮罩', value: 'bg-white/40 dark:bg-slate-900/40 + backdrop-blur-md' },
        { name: '左侧主体库', value: 'bg-indigo-50/80 dark:bg-slate-800/80 + border-indigo-100' },
        { name: '中间编辑区底色', value: 'bg-[#F0F7FF] dark:bg-slate-800/80 + border-blue-100' },
        { name: '预览区底色', value: 'bg-slate-900 + border-slate-800' },
        { name: '底部时间轴底色', value: 'bg-[#F5F3FF] dark:bg-slate-900/50 + border-purple-100' },
        { name: '主 CTA', value: 'from-indigo-600 to-purple-600 text-white shadow-indigo-500/20' },
        { name: '强调/激活态', value: 'border-purple-500 + ring-purple-500/10' },
        { name: '生成中遮罩', value: 'from-indigo-600/60 to-purple-600/60 + backdrop-blur-2xl' },
        { name: '合成弹窗背景', value: 'rounded-[24px] !bg-[#f8fafc] dark:!bg-slate-900' },
        { name: '导出主按钮', value: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20' }
      ]
    }
  ],
  button: [
    {
      id: 'storyboardView',
      title: '分镜视频页 (StoryboardView)',
      description: '关键按钮/卡片/弹层的类名与交互状态。',
      items: [
        { name: 'UI 标注按钮', tag: 'button', classes: 'fixed bottom-6 right-6 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 shadow-lg shadow-indigo-500/30 text-white hover:scale-105 active:scale-95 transition-transform', notes: ['右下角固定悬浮（Monitor 图标）'] },
        { name: '产品设计说明按钮', tag: 'button', classes: 'h-8 px-4 bg-slate-50 dark:bg-slate-700/50 rounded-full border border-slate-200/50 text-slate-500 hover:text-indigo-600', notes: ['位于顶部栏中间，InfoFilled 图标'] },
        { name: '合成全集 (主 CTA)', tag: 'button', classes: 'h-9 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-[13px] font-bold shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50', notes: ['顶部栏右侧；disabled：pointer-events-none'] },
        { name: '预览全集', tag: 'button', classes: 'h-9 px-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-full text-[13px] font-bold hover:bg-indigo-100', notes: ['仅合成完成后出现'] },
        { name: '主体库容器', tag: 'aside', classes: 'bg-indigo-50/80 dark:bg-slate-800/80 rounded-[32px] border border-indigo-100 shadow-xl overflow-hidden', notes: ['折叠时 width=0 + opacity=0'] },
        { name: '主体库-新增按钮', tag: 'button', classes: 'w-7 h-7 rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-200', notes: ['主体库标题行右侧 + 号（导入/管理）'] },
        { name: '分类新增按钮(角色/场景/道具)', tag: 'button', classes: 'w-6 h-6 rounded-lg bg-*-50 text-*-600 hover:bg-*-600 hover:text-white border border-*-100', notes: ['按分类切换颜色：indigo / emerald / amber'] },
        { name: '主体卡片-悬停编辑', tag: 'div', classes: 'absolute inset-0 bg-gradient-to-t from-*-600/40 opacity-0 group-hover:opacity-100', notes: ['Hover 显示编辑按钮：bg-white/90 hover:bg-*-600 hover:text-white'] },
        { name: '左侧栏折叠把手', tag: 'div', classes: 'absolute w-6 h-16 rounded-full bg-indigo-600 shadow-[0_4px_20px_rgba(99,102,241,0.3)]', notes: ['Hover: bg-indigo-700 + scale-y-110'] },
        { name: '脚本卡(未编辑)', tag: 'div', classes: 'bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-700 rounded-[24px] shadow-sm', notes: ['只读：v-html 渲染，cursor-text'] },
        { name: '脚本卡(编辑态)', tag: 'div', classes: 'bg-white dark:bg-slate-900 border-2 border-indigo-500 shadow-2xl shadow-indigo-200/50', notes: ['编辑态高亮边框 + 更强阴影'] },
        { name: '@ 引用弹层', tag: 'div', classes: 'fixed z-[9999] bg-white/95 dark:bg-slate-800/95 rounded-2xl border border-slate-200/50 p-2 min-w-[280px] max-w-[340px] shadow-[0_20px_50px_rgba(0,0,0,0.15)]', notes: ['Tab：active bg-white text-indigo-600；inactive text-slate-400'] },
        { name: '编辑脚本', tag: 'button', classes: 'h-8 px-6 bg-indigo-50 text-indigo-600 border-2 border-indigo-200 rounded-full text-[13px] font-black hover:bg-indigo-600 hover:text-white', notes: ['按钮内图标 Hover: rotate-12'] },
        { name: '重新生成分镜', tag: 'button', classes: 'h-8 px-8 rounded-full text-[13px] font-black', notes: ['Enabled: bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white shadow-xl', 'Disabled: bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-50'] },
        { name: '预览区视频容器', tag: 'div', classes: 'flex-1 rounded-[24px] bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden', notes: ['空态：Film 大图标 + 文案；生成中遮罩覆盖'] },
        { name: '时间轴播放按钮', tag: 'button', classes: 'w-7 h-7 rounded-full bg-purple-600 text-white shadow-lg shadow-purple-200 hover:scale-110 active:scale-95', notes: ['切换 VideoPlay/VideoPause'] },
        { name: '多选管理按钮', tag: 'button', classes: 'h-6 px-3 bg-white dark:bg-slate-700 text-purple-600 rounded-full text-[10px] font-black border border-purple-100 hover:bg-purple-600 hover:text-white', notes: ['右上角控制区'] },
        { name: '批量生成视频', tag: 'button', classes: 'h-6 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-[10px] font-black hover:shadow-lg hover:shadow-indigo-500/20', notes: ['多选模式且选中数量>0 时出现'] },
        { name: '全选复选框', tag: 'el-checkbox', classes: 'custom-timeline-checkbox mr-2', notes: ['多选模式出现；支持 indeterminate'] },
        { name: '时间轴分镜卡', tag: 'div', classes: 'w-[70px] h-[95px] rounded-[14px] bg-white dark:bg-slate-900 border-2 hover:scale-105 transition-all overflow-hidden', notes: ['激活/多选：border-purple-500 ring-4 ring-purple-500/10；角标：duration badge text-[8px]'] },
        { name: '时间轴单个生成按钮', tag: 'button', classes: 'w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-purple-600 border border-white/30', notes: ['点按 MagicStick 触发生成'] },
        { name: '全屏生成遮罩(规划中)', tag: 'div', classes: 'fixed inset-0 z-[10000] bg-white/40 dark:bg-slate-900/40 backdrop-blur-md flex items-center justify-center', notes: ['中心卡片：rounded-[40px]；渐变图标：from-purple-600 to-indigo-600'] },
        { name: '合成弹窗', tag: 'el-dialog', classes: 'rounded-[24px] !bg-[#f8fafc] dark:!bg-slate-900 overflow-hidden', notes: ['进度态：遮罩 + 进度条；成功态：Video Player + 导出面板'] },
        { name: 'BGM 配置弹窗', tag: 'el-dialog', classes: 'rounded-[24px] !bg-[#f8fafc] dark:!bg-slate-900 overflow-hidden', notes: ['AI 生成 / 热门标签 / 本地上传'] },
        { name: '主体编辑弹窗', tag: 'SubjectEditDialog', classes: 'v-model="showSubjectEdit"', notes: ['角色/场景/道具统一编辑'] },
        { name: '主体库弹窗', tag: 'SubjectLibraryModal', classes: 'v-model="showLibraryModal"', notes: ['从主题库批量导入主体'] },
        { name: '恢复确认弹窗', tag: 'ConfirmDialog', classes: 'v-model="recoveryConfirmVisible"', notes: ['用于断点续生成确认'] }
      ]
    }
  ]
};

// Loading States
const isGeneratingStoryboardText = ref(false);
const currentGeneratingStoryboardIndex = ref(-1);
const generationProgress = ref(0);

// Recovery Confirm Dialog State
const recoveryConfirmVisible = ref(false);
const recoveryConfirmTitle = ref('');
const recoveryConfirmMessage = ref('');
const handleRecoveryConfirm = () => {
  startStoryboardSequentialGeneration();
};
const handleRecoveryCancel = () => {
  episodeStore.setGenerationStatus({ isGenerating: false, type: '' });
};
const currentStoryboardInfo = ref('');
const isSequentiallyGeneratingStoryboard = ref(false);

const centerVideoRef = ref<HTMLVideoElement | null>(null);
const isSequentialPlaying = ref(false);
const sequentialCurrentTime = ref(0);
const currentSceneVideoTime = ref(0);

// Helper function to extract and sum durations from script HTML
const getSceneDuration = (script: string) => {
  if (!script) return 0;
  // Regex to find duration values like "6.0s", "15s", etc inside mention-pill duration tags
  // The structure is usually <span class="mention-pill duration">...6.0s</span>
  const durationRegex = /<span class="mention-pill duration">.*?([\d.]+)\s*s<\/span>/g;
  let total = 0;
  let match;
  while ((match = durationRegex.exec(script)) !== null) {
    total += parseFloat(match[1]);
  }
  return total || 0;
};

const totalStoryboardDuration = computed(() => {
  return timelineScenes.value.reduce((acc, scene) => acc + (getSceneDuration(scene.script) || 0), 0);
});

const handleSequentialPlay = () => {
  if (isSequentialPlaying.value) {
    isSequentialPlaying.value = false;
    sequentialCurrentTime.value = 0; // Reset time
    currentSceneVideoTime.value = 0; // Reset scene time
    if (centerVideoRef.value) centerVideoRef.value.pause();
    return;
  }

  // 从第一个有视频的分镜开始播放
  const firstVideoIdx = timelineScenes.value.findIndex(s => s.video);
  if (firstVideoIdx === -1) {
    return ElMessage.warning('暂无已生成的视频可播放');
  }

  currentSceneIdx.value = firstVideoIdx;
  isSequentialPlaying.value = true;
  
  nextTick(() => {
    if (centerVideoRef.value) {
      centerVideoRef.value.currentTime = 0;
      centerVideoRef.value.play();
    }
  });
};

const handleSceneVideoEnded = () => {
  if (!isSequentialPlaying.value) return;

  // 寻找下一个有视频的分镜
  let nextIdx = -1;
  for (let i = currentSceneIdx.value + 1; i < timelineScenes.value.length; i++) {
    if (timelineScenes.value[i].video) {
      nextIdx = i;
      break;
    }
  }

  if (nextIdx !== -1) {
    currentSceneIdx.value = nextIdx;
    currentSceneVideoTime.value = 0; // Reset scene time for the next scene
    nextTick(() => {
      if (centerVideoRef.value) {
        centerVideoRef.value.currentTime = 0;
        centerVideoRef.value.play();
      }
    });
  } else {
    isSequentialPlaying.value = false;
    sequentialCurrentTime.value = 0;
    currentSceneVideoTime.value = 0; // Reset scene time
    ElMessage.success('所有分镜视频已播放完毕');
  }
};

const onCenterVideoTimeUpdate = () => {
  if (centerVideoRef.value) {
    currentSceneVideoTime.value = centerVideoRef.value.currentTime;
  }

  if (!isSequentialPlaying.value) {
    sequentialCurrentTime.value = 0;
    return;
  }
  
  let elapsed = 0;
  for (let i = 0; i < currentSceneIdx.value; i++) {
    elapsed += getSceneDuration(timelineScenes.value[i].script);
  }
  if (centerVideoRef.value) {
    elapsed += centerVideoRef.value.currentTime;
  }
  sequentialCurrentTime.value = elapsed;
};

const dramaSettings = reactive({
  title: '沈念安与顾承泽的订婚',
  type: 'short_drama',
  genre: '都市情感',
  era: '现代都市',
  synopsis: '一名身着纯白礼服的年轻女性, 温婉而真诚。一名身着正装的年轻男性, 眼神专注而深情。'
});

// @ Mention Menu Logic
const showMentionMenu = ref(false);
const mentionMenuRef = ref<HTMLElement | null>(null);
const mentionMenuStyle = ref({ top: '0px', left: '0px' });
const mentionActiveTab = ref('all');
const mentionSearch = ref('');
const customDuration = ref('');

const mentionItems = computed(() => {
  const baseItems = [
    { name: '4.0s', desc: '镜头时长: 极短', icon: Timer, type: 'duration', category: 'duration', image: `https://picsum.photos/40/40?random=dur1` },
    { name: '7.0s', desc: '镜头时长: 标准', icon: Timer, type: 'duration', category: 'duration', image: `https://picsum.photos/40/40?random=dur2` },
    { name: '15.0s', desc: '镜头时长: 极长', icon: Timer, type: 'duration', category: 'duration', image: `https://picsum.photos/40/40?random=dur3` },
    ...subjects.value.map(s => ({
      name: s.name,
      desc: s.description?.slice(0, 30) + '...',
      image: s.image || `https://picsum.photos/40/40?random=${s.id}`,
      icon: s.type === 'character' ? User : s.type === 'scene' ? Location : Box,
      type: s.type,
      category: s.type === 'character' ? 'character' : s.type === 'scene' ? 'scene' : 'asset'
    })),
    { name: '古风背景音', desc: '音频道具', icon: Headset, type: 'asset', category: 'asset', image: `https://picsum.photos/40/40?random=bgm` },
    { name: '雨天特效', desc: '视频道具', icon: Film, type: 'asset', category: 'asset', image: `https://picsum.photos/40/40?random=fx` },
  ];

  let filtered = baseItems;
  if (mentionActiveTab.value !== 'all') {
    filtered = baseItems.filter(item => item.category === mentionActiveTab.value);
  }
  
  if (mentionSearch.value) {
    const search = mentionSearch.value.toLowerCase();
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(search) || 
      item.desc.toLowerCase().includes(search)
    );
  }

  return filtered;
});

const handleCustomDuration = () => {
  if (customDuration.value && !isNaN(Number(customDuration.value))) {
    insertMention({ name: `${customDuration.value}s`, type: 'duration' });
    customDuration.value = '';
  }
};

const selectedMentionIndex = ref(0);

// TipTap Editor
const activeMentionNodePos = ref<{from: number, to: number} | null>(null);

const editor = useEditor({
  content: '',
  extensions: [
    StarterKit,
    CharacterCount,
    MentionPill,
    PillIcon,
    PillImage,
  ],
  onUpdate: ({ editor }) => {
    // 检查光标前是否有 @ 符号
    const { state } = editor;
    const { selection } = state;
    const { from } = selection;
    const textBefore = state.doc.textBetween(Math.max(0, from - 20), from, '\n');
    const match = /@([^@\s]*)$/.exec(textBefore);

    if (match) {
        showMentionMenu.value = true;
        mentionSearch.value = match[1];
        selectedMentionIndex.value = 0;
        
        // 更新位置 (Teleported to body, use fixed coordinates)
        const view = editor.view;
        // 计算 @ 符号起始位置的坐标，而不是当前光标位置
        const anchorPos = from - match[0].length;
        const coords = view.coordsAtPos(anchorPos);
        
        if (coords) {
          // 考虑菜单宽度，防止右侧溢出视口
          const menuWidth = 340; // 对应 max-w-[340px]
          let left = coords.left;
          if (left + menuWidth > window.innerWidth) {
            left = window.innerWidth - menuWidth - 20; // 预留 20px 间距
          }

          mentionMenuStyle.value = {
            top: `${coords.bottom + 10}px`, // 增加 10px 间距，看起来更舒服
            left: `${Math.max(20, left)}px` // 确保左侧也不会溢出
          };
        }
      } else {
      showMentionMenu.value = false;
    }
  },
  editorProps: {
    attributes: {
      class: 'prose prose-sm focus:outline-none max-w-none w-full h-full text-[14px] text-slate-700 leading-[1.8] m-0 p-0',
    },
    handleDOMEvents: {
      click: (view, event) => {
        const target = event.target as HTMLElement;
        const pill = target.closest('.mention-pill');
        if (pill) {
          event.preventDefault();
          
          const pos = view.posAtDOM(pill, 0);
          if (pos !== undefined && pos >= 0) {
            try {
              const $pos = view.state.doc.resolve(pos);
              
              if ($pos.parent && $pos.parent.type.name === 'mentionPill') {
                activeMentionNodePos.value = {
                  from: $pos.before(),
                  to: $pos.after()
                };
              } else {
                // If it resolves exactly before the node
                const nodeAfter = $pos.nodeAfter;
                if (nodeAfter && nodeAfter.type.name === 'mentionPill') {
                  activeMentionNodePos.value = {
                    from: pos,
                    to: pos + nodeAfter.nodeSize
                  };
                } else {
                  activeMentionNodePos.value = null;
                }
              }
              
              if (activeMentionNodePos.value) {
                let tab = 'all';
                if (pill.classList.contains('role')) tab = 'character';
                else if (pill.classList.contains('location')) tab = 'scene';
                else if (pill.classList.contains('prop')) tab = 'asset';
                else if (pill.classList.contains('duration')) tab = 'duration';
                
                mentionActiveTab.value = tab;
                showMentionMenu.value = true;
                mentionSearch.value = '';
                
                const rect = pill.getBoundingClientRect();
                const menuWidth = 340;
                let left = rect.left;
                if (left + menuWidth > window.innerWidth) {
                  left = window.innerWidth - menuWidth - 20;
                }
                
                mentionMenuStyle.value = {
                  top: `${rect.bottom + 10}px`,
                  left: `${Math.max(20, left)}px`
                };
                
                return true;
              }
            } catch (e) {
              console.error(e);
            }
          }
        }
        return false;
      }
    },
    handleKeyDown: (view, event) => {
      if (showMentionMenu.value) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          selectedMentionIndex.value = (selectedMentionIndex.value + 1) % mentionItems.value.length;
          return true;
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          selectedMentionIndex.value = (selectedMentionIndex.value - 1 + mentionItems.value.length) % mentionItems.value.length;
          return true;
        }
        if (event.key === 'Enter') {
          event.preventDefault();
          if (mentionItems.value[selectedMentionIndex.value]) {
            insertMention(mentionItems.value[selectedMentionIndex.value]);
          }
          return true;
        }
        if (event.key === 'Escape') {
          event.preventDefault();
          showMentionMenu.value = false;
          return true;
        }
      }
      return false;
    }
  }
});

const insertMention = (item: any) => {
  if (!editor.value) return;
  
  let html = '';
  if (item.type === 'duration') {
    html = `<span class="mention-pill duration"><i class="timer-icon"></i>${item.name}</span>&nbsp;`;
  } else if (item.type === 'character') {
    html = `<span class="mention-pill role"><img src="${item.image}" />${item.name}</span>&nbsp;`;
  } else if (item.type === 'scene') {
    html = `<span class="mention-pill location"><i class="location-icon"></i>${item.name}</span>&nbsp;`;
  } else if (item.type === 'prop') {
    html = `<span class="mention-pill prop"><i class="prop-icon"></i>${item.name}</span>&nbsp;`;
  } else {
    html = ` @${item.name} `;
  }

  // 如果是通过点击 mention-pill 打开的菜单，直接替换该节点
  if (activeMentionNodePos.value) {
    editor.value.chain().focus().deleteRange(activeMentionNodePos.value).insertContent(html).run();
    activeMentionNodePos.value = null;
  } else {
    // 获取当前光标位置，删除前面刚输入的 "@" 及其后的搜索字符
    const { state } = editor.value;
    const { from } = state.selection;
    const textBefore = state.doc.textBetween(Math.max(0, from - 20), from, '\n');
    const match = /@([^@]*)$/.exec(textBefore);
    
    if (match) {
      editor.value.chain().focus().deleteRange({ from: from - match[0].length, to: from }).insertContent(html).run();
    } else {
      editor.value.chain().focus().insertContent(html).run();
    }
  }
  
  showMentionMenu.value = false;
};

// Subject Management
const showSubjectEdit = ref(false);
const isEdit = ref(false);
const editingSubject = ref({
  id: '',
  name: '',
  description: '',
  voice_description: '',
  type: 'character' as 'character' | 'scene' | 'prop',
  image: '',
  appeared_episodes: []
});

const subjects = ref([
  { 
    id: '1', 
    name: '沈念安-基础形象', 
    type: 'character', 
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    description: '一名身着纯白礼服的年轻女性, 温婉而真诚。',
    voice_description: '女声, 青年音色, 音调中等偏高, 音色质感明亮、清脆, 声音清亮柔和, 发音方式干净, 气息充沛平稳, 吐字清晰'
  },
  { 
    id: '2', 
    name: '顾承泽-基础形象', 
    type: 'character', 
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
    description: '一名身着正装的年轻男性, 眼神专注而深情。',
    voice_description: '男声, 青年音色, 音调中等, 音色质感干净但偏扁平, 声音不够厚重, 发音方式清晰, 但语速偏快且气息不稳'
  },
  { 
    id: '3', 
    name: '司仪-基础形象', 
    type: 'character', 
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    description: '手持话筒的司仪, 面带职业微笑。',
    voice_description: '男声, 青年音色, 音调中等, 音色明亮圆润, 声音厚度适中, 发音标准, 气息沉稳, 吐字清晰, 字正腔圆'
  },
  { id: '4', name: '豪华酒店宴会厅_0', type: 'scene', image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=600&auto=format&fit=crop', description: '鲜花簇拥的舞台和璀璨的水晶灯, 氛围喜庆。' },
  { id: '5', name: '破旧木棍', type: 'prop', name_ext: '道具', image: 'https://images.unsplash.com/photo-1589987607627-616cbd5bb245?q=80&w=400&auto=format&fit=crop', description: '一根被火烧焦了一半的粗木棍。' },
]);

const filteredCharacters = computed(() => subjects.value.filter(s => s.type === 'character' && s.name.includes(searchQuery.value)));
const filteredScenes = computed(() => subjects.value.filter(s => s.type === 'scene' && s.name.includes(searchQuery.value)));
const filteredProps = computed(() => subjects.value.filter(s => s.type === 'prop' && s.name.includes(searchQuery.value)));

const handleAddSubject = (type: 'character' | 'scene' | 'prop') => {
  isEdit.value = false;
  editingSubject.value = {
    id: Date.now().toString(),
    name: '',
    description: '',
    voice_description: '',
    type: type,
    image: type === 'character' 
      ? `https://picsum.photos/400/533?random=char_${Date.now()}` 
      : type === 'scene' 
        ? `https://picsum.photos/600/450?random=scene_${Date.now()}`
        : `https://picsum.photos/400/400?random=prop_${Date.now()}`,
    appeared_episodes: []
  };
  showSubjectEdit.value = true;
};

const handleEditSubject = (subject: any) => {
  isEdit.value = true;
  editingSubject.value = { ...subject };
  showSubjectEdit.value = true;
};

const executeDeleteSubject = (subject: any) => {
  subjects.value = subjects.value.filter(s => s.id !== subject.id);
  ElMessage({
    message: '删除成功',
    type: 'success',
    customClass: 'modern-message-success'
  });
};

const saveSubject = (data: any) => {
  if (!data.name) return ElMessage.warning('名称不能为空');
  if (isEdit.value) {
    const idx = subjects.value.findIndex(s => s.id === data.id);
    if (idx > -1) subjects.value[idx] = { ...data };
  } else {
    subjects.value.push({ ...data });
  }
  showSubjectEdit.value = false;
  ElMessage.success('保存成功');
};

const handleLibraryConfirm = (selectedItems: any[]) => {
  const startTime = performance.now();
  
  selectedItems.forEach(item => {
    // 检查是否已存在，如果不存在则添加
    if (!subjects.value.find(s => s.id === item.id)) {
      subjects.value.push({ ...item });
    }
  });
  
  const endTime = performance.now();
  console.log(`Selection import took ${endTime - startTime}ms`);
  
  ElMessage.success(`成功导入 ${selectedItems.length} 个主体`);
  showLibraryModal.value = false;
};

// Script & Generation
const currentScript = computed({
  get: () => timelineScenes.value[currentSceneIdx.value]?.script || '',
  set: (val) => {
    if (timelineScenes.value[currentSceneIdx.value]) {
      timelineScenes.value[currentSceneIdx.value].script = val;
    }
  }
});

const handleScriptInput = (e: any) => {
  currentScript.value = e.target.innerText;
};

const timelineScenes = ref<any[]>([]);

const cloneScenes = (scenes: any[]) => JSON.parse(JSON.stringify(scenes || []));

const persistStoryboardForEpisode = (targetEpisodeId: string) => {
  if (!targetEpisodeId) return;
  const targetEpisode = episodeStore.episodes.find(e => e.id === targetEpisodeId);
  if (!targetEpisode) return;

  const hasScenes = timelineScenes.value.length > 0;
  const hasGenerating = timelineScenes.value.some(s => s.status === 'generating' || s.status === 'script_generating');
  const isAllSuccess = hasScenes && timelineScenes.value.every(s => s.status === 'success');

  episodeStore.updateEpisode(targetEpisodeId, {
    storyboardScenes: cloneScenes(timelineScenes.value),
    storyboardGenerated: hasScenes,
    storyboardStatus: hasGenerating ? 'generating' : (isAllSuccess ? 'success' : 'pending')
  });
};

const restoreStoryboardForEpisode = (targetEpisodeId: string) => {
  const targetEpisode = episodeStore.episodes.find(e => e.id === targetEpisodeId);
  const cachedScenes = targetEpisode?.storyboardScenes;
  if (!Array.isArray(cachedScenes) || cachedScenes.length === 0) return false;

  timelineScenes.value = cloneScenes(cachedScenes);
  currentSceneIdx.value = Math.min(currentSceneIdx.value, timelineScenes.value.length - 1);
  if (currentSceneIdx.value < 0) currentSceneIdx.value = 0;

  nextTick(() => {
    if (currentScript.value) {
      editor.value?.commands.setContent(currentScript.value);
    }
  });
  return true;
};

const handleEditScript = () => {
  isEditingScript.value = true;
  editor.value?.commands.setContent(currentScript.value);
  nextTick(() => {
    editor.value?.commands.focus();
  });
};

const handleCancelEdit = () => {
  isEditingScript.value = false;
  showMentionMenu.value = false;
};

const handleSaveScriptInline = () => {
  if (editor.value) {
    // 使用 getHTML() 确保保存时保留标签结构（胶囊样式）
    const newScript = editor.value.getHTML();
    currentScript.value = newScript;
      console.log(newScript);
    if (timelineScenes.value[currentSceneIdx.value]) {
    
      timelineScenes.value[currentSceneIdx.value].modified = true;
    }
    persistStoryboardForEpisode(episodeId.value);
    isEditingScript.value = false;
    showMentionMenu.value = false;
    ElMessage.success('脚本已保存');
  }
};

const handleSaveScript = (data: { index: number, script: string }) => {
  if (timelineScenes.value[data.index]) {
    timelineScenes.value[data.index].script = data.script;
    persistStoryboardForEpisode(episodeId.value);
    ElMessage.success('脚本更新成功');
  }
};

const currentPreview = computed(() => timelineScenes.value[currentSceneIdx.value]?.video);

// Synthesis
const showSynthesisConfig = ref(false);
const showBgmConfig = ref(false); // 控制 BGM 配置弹窗
const isMultiSelectMode = ref(false);
const selectedScenes = ref<number[]>([]);

const bgmConfig = reactive({
  name: '',
  duration: 0,
  file: null as File | null,
  status: 'none' as 'none' | 'ready' | 'generating',
  style: '',
  confirmed: false
});

const isAiGeneratingBgm = ref(false);
const aiBgmProgress = ref(0);
const bgmPrompt = ref('');

const bgmStyles = [
  { label: '悬疑反转', icon: '🔍', desc: '神秘紧张' },
  { label: '都市情感', icon: '🏙️', desc: '现代柔和' },
  { label: '热血逆袭', icon: '🔥', desc: '激昂励志' },
  { label: '古风仙侠', icon: '⚔️', desc: '悠扬唯美' },
  { label: '惊悚恐怖', icon: '👻', desc: '阴森压抑' },
  { label: '欢快喜剧', icon: '🤡', desc: '活泼幽默' },
  { label: '励志感人', icon: '🌅', desc: '温情正向' },
  { label: '唯美浪漫', icon: '💕', desc: '浪漫甜美' },
  { label: '史诗战争', icon: '🛡️', desc: '宏大震撼' },
  { label: '赛博朋克', icon: '🤖', desc: '科幻电子' },
  { label: '田园清新', icon: '🌿', desc: '自然宁静' },
  { label: '动感电子', icon: '⚡', desc: '潮流快频' },
  { label: '紧张对峙', icon: '⏳', desc: '扣人心弦' },
  { label: '忧郁伤感', icon: '💧', desc: '深沉孤独' },
  { label: '职场竞争', icon: '💼', desc: '快节奏感' },
  { label: '玄幻魔幻', icon: '🧙', desc: '奇异宏大' }
];

const hotPromptTags = ['钢琴', '大提琴', '快节奏', '忧郁', '舒缓', '震撼', '电音', '民乐', '鼓点', '唯美'];

const addHotTag = (tag: string) => {
  if (bgmPrompt.value) {
    if (!bgmPrompt.value.endsWith(', ') && !bgmPrompt.value.endsWith(',')) {
      bgmPrompt.value += ', ';
    }
    bgmPrompt.value += tag;
  } else {
    bgmPrompt.value = tag;
  }
};

const handleAiBgmGenerate = (style: string, customPrompt?: string) => {
  bgmConfig.style = customPrompt ? '自定义' : style;
  bgmConfig.status = 'generating';
  isAiGeneratingBgm.value = true;
  aiBgmProgress.value = 0;
  
  const timer = setInterval(() => {
    aiBgmProgress.value += 2;
    if (aiBgmProgress.value >= 100) {
      clearInterval(timer);
      setTimeout(() => {
        bgmConfig.name = customPrompt ? `AI 生成 - ${customPrompt.slice(0, 10)}...` : `AI 生成 - ${style}风格配乐`;
        bgmConfig.duration = 120 + Math.floor(Math.random() * 60);
        bgmConfig.status = 'ready';
        isAiGeneratingBgm.value = false;
        synthesisConfig.bgm = bgmConfig.name;
        bgmPrompt.value = ''; // Reset prompt after generation
        ElMessage.success('AI 背景音乐生成成功');
      }, 500);
    }
  }, 50);
};

const synthesisConfig = reactive({
  bgm: 'battle',
  effects: ['film', 'motion'],
  subtitleStyle: 'modern'
});

const handleBgmUpload = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files?.[0]) {
    bgmConfig.file = target.files[0];
    bgmConfig.name = bgmConfig.file.name;
    bgmConfig.duration = 60 + Math.floor(Math.random() * 60); // 模拟获取时长
    bgmConfig.status = 'ready';
    synthesisConfig.bgm = bgmConfig.name;
    ElMessage.success('BGM 已上传');
  }
};

const handleOnlineBgmSelect = (name: string, duration: number) => {
  bgmConfig.name = name;
  bgmConfig.duration = duration;
  bgmConfig.status = 'ready';
  bgmConfig.confirmed = true;
  synthesisConfig.bgm = bgmConfig.name;
  showBgmConfig.value = false;
  ElMessage.success(`已选择 BGM: ${name}`);
};

const handleBgmConfirm = () => {
  if (bgmConfig.status === 'ready') {
    bgmConfig.confirmed = true;
    showBgmConfig.value = false;
    ElMessage.success('背景音乐配置已确认');
  }
};

const resetBgm = () => {
  bgmConfig.name = '';
  bgmConfig.duration = 0;
  bgmConfig.file = null;
  bgmConfig.status = 'none';
  bgmConfig.confirmed = false;
  synthesisConfig.bgm = 'battle';
};

const toggleMultiSelect = () => {
  isMultiSelectMode.value = !isMultiSelectMode.value;
  if (!isMultiSelectMode.value) {
    selectedScenes.value = [];
  }
};

const toggleSceneSelection = (idx: number) => {
  // 无论是否多选，点击分镜卡片都应当切换当前的预览/编辑器视图
  currentSceneIdx.value = idx;
  
  if (!isMultiSelectMode.value) {
    activeLeftTab.value = 'basic-settings'; // 切换节点时默认显示基础设定
    return;
  }
  
  const pos = selectedScenes.value.indexOf(idx);
  if (pos > -1) {
    selectedScenes.value.splice(pos, 1);
  } else {
    selectedScenes.value.push(idx);
  }
};

const handleSelectAll = (val: boolean) => {
  if (val) {
    selectedScenes.value = timelineScenes.value.map((_, i) => i);
  } else {
    selectedScenes.value = [];
  }
};

const isAllSelected = computed({
  get: () => timelineScenes.value.length > 0 && selectedScenes.value.length === timelineScenes.value.length,
  set: (val) => handleSelectAll(val)
});

const isIndeterminate = computed(() => {
  return selectedScenes.value.length > 0 && selectedScenes.value.length < timelineScenes.value.length;
});

// Video Preview & Export States
const fullVideoRef = ref<HTMLVideoElement | null>(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const isSynthesisCompleted = ref(false);
const fullSynthesisVideoUrl = ref('');
const synthesisVideoCandidates = [
  '/assets/video_c2e5d372661c95731e129f2eb4d56054.mp4',
  '/assets/astronaut_moon.mp4' 
];
const synthesisVideoCandidateIndex = ref(0);
const exportConfig = reactive({
  watermark: 'brand',
  resolution: '1080p'
});

const togglePlay = () => {
  if (!fullVideoRef.value) return;
  if (isPlaying.value) {
    fullVideoRef.value.pause();
  } else {
    fullVideoRef.value.play();
  }
  isPlaying.value = !isPlaying.value;
};

const onVideoTimeUpdate = () => {
  if (fullVideoRef.value) {
    currentTime.value = fullVideoRef.value.currentTime;
  }
};

const onVideoLoaded = () => {
  if (fullVideoRef.value) {
    duration.value = fullVideoRef.value.duration;
  }
};

const handleSynthesisVideoError = () => {
  console.error('Synthesis video load error, trying next candidate...');
  synthesisVideoCandidateIndex.value++;
  if (synthesisVideoCandidateIndex.value < synthesisVideoCandidates.length) {
    fullSynthesisVideoUrl.value = synthesisVideoCandidates[synthesisVideoCandidateIndex.value];
  } else {
    ElMessage.error('无法加载合成视频，请检查网络或资源文件');
  }
};

const seekVideo = (e: MouseEvent) => {
  if (!fullVideoRef.value) return;
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const pos = (e.clientX - rect.left) / rect.width;
  fullVideoRef.value.currentTime = pos * duration.value;
};

// --- Crop Feature States & Logic ---
interface CropClip {
  id: string;
  startTime: number;
  endTime: number;
  sourceStartTime: number;
  sourceEndTime: number;
  selected: boolean;
}

interface CropTrack {
  id: string;
  clips: CropClip[];
  muted: boolean;
  locked: boolean;
}

const showCropDialog = ref(false);
const cropVideoRef = ref<HTMLVideoElement | null>(null);
const isCropPlaying = ref(false);
const isMicEnabled = ref(false);
const cropCurrentTime = ref(0);
const cropDuration = ref(0);
const cropZoom = ref(5);

// 视频帧提取状态
const extractedThumbnails = ref<string[]>([]); // 存储提取的 base64 帧
const isExtracting = ref(false);
const thumbnailInterval = 1; // 每隔 1 秒提取一帧

const extractThumbnails = async (url: string) => {
  if (!url || isExtracting.value) return;
  isExtracting.value = true;
  extractedThumbnails.value = [];
  
  const video = document.createElement('video');
  video.src = url;
  video.crossOrigin = 'anonymous';
  video.muted = true;
  
  try {
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = resolve;
      video.onerror = reject;
      setTimeout(reject, 5000);
    });
    
    const duration = video.duration;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 设定缩略图尺寸，保持较小以提高性能
    const thumbWidth = 160;
    const thumbHeight = (video.videoHeight / video.videoWidth) * thumbWidth;
    canvas.width = thumbWidth;
    canvas.height = thumbHeight;
    
    for (let t = 0; t < duration; t += thumbnailInterval) {
      video.currentTime = t;
      await new Promise(r => video.onseeked = r);
      ctx?.drawImage(video, 0, 0, thumbWidth, thumbHeight);
      extractedThumbnails.value.push(canvas.toDataURL('image/jpeg', 0.6));
    }
  } catch (err) {
    console.error('Failed to extract thumbnails:', err);
  } finally {
    isExtracting.value = false;
    video.remove();
  }
};

const getFrameThumbnail = (clip: CropClip, index: number) => {
  if (extractedThumbnails.value.length === 0) return currentPreviewThumbnail.value;
  
  // 根据 index 计算对应的时间点
  // 每个缩略图宽度为 48px (w-12)，pxPerSec = cropZoom * 20
  // 每个缩略图代表的时间长度 = 48 / pxPerSec
  const timePerThumb = 48 / pxPerSec.value;
  const timeAtThumb = clip.sourceStartTime + (index * timePerThumb);
  
  // 找到最接近提取帧索引
  const frameIndex = Math.floor(timeAtThumb / thumbnailInterval);
  return extractedThumbnails.value[Math.min(frameIndex, extractedThumbnails.value.length - 1)] || currentPreviewThumbnail.value;
};

const currentPreviewThumbnail = computed(() => {
  const scene = timelineScenes.value[currentSceneIdx.value];
  if (!scene) return '';
  // 增加更多可能的图片字段回退
  return scene.image || scene.targetImage || scene.cover || scene.poster || scene.thumbnail || scene.gif || '';
});

const cropTracks = ref<CropTrack[]>([]);
const selectedTrack = computed(() => {
  return cropTracks.value.find(t => t.clips.some(c => c.selected));
});
const cropHistory = ref<CropTrack[][]>([]);
const cropHistoryIndex = ref(-1);

const pxPerSec = computed(() => cropZoom.value * 20); 

const toggleMic = () => {
  isMicEnabled.value = !isMicEnabled.value;
  if (cropVideoRef.value) {
    cropVideoRef.value.muted = !isMicEnabled.value;
  }
  if (isMicEnabled.value) {
    ElMessage.success('视频声音已恢复');
  } else {
    ElMessage.info('视频已静音');
  }
};

const toggleTrackMute = (track: CropTrack) => {
  track.muted = !track.muted;
  isMicEnabled.value = !track.muted;
  if (cropVideoRef.value) {
    cropVideoRef.value.muted = track.muted;
  }
  if (!track.muted) {
    ElMessage.success('轨道声音已恢复');
  } else {
    ElMessage.info('轨道已静音');
  }
};

const maxTimelineDuration = computed(() => {
  let maxTime = cropDuration.value;
  cropTracks.value.forEach(t => t.clips.forEach(c => maxTime = Math.max(maxTime, c.endTime)));
  return Math.max(maxTime + 10, cropDuration.value + 10); 
});
const timelineWidth = computed(() => maxTimelineDuration.value * pxPerSec.value);
const timeToPx = (time: number) => time * pxPerSec.value;
const pxToTime = (px: number) => px / pxPerSec.value;
const playheadPosition = computed(() => timeToPx(cropCurrentTime.value));

const zoomInCrop = () => {
  cropZoom.value = Math.min(100, cropZoom.value + 5);
  drawRuler();
};

const zoomOutCrop = () => {
  cropZoom.value = Math.max(1, cropZoom.value - 5);
  drawRuler();
};

const zoomFitCrop = () => {
  if (tracksContainerRef.value && cropDuration.value > 0) {
    const containerWidth = tracksContainerRef.value.clientWidth - 80;
    const targetPxPerSec = containerWidth / (cropDuration.value + 2); 
    cropZoom.value = Math.max(1, Math.min(100, targetPxPerSec / 20));
    drawRuler();
  }
};

const onTimelineWheel = (e: WheelEvent) => {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault();
    if (e.deltaY > 0) {
      zoomOutCrop();
    } else {
      zoomInCrop();
    }
  }
};

const saveCropHistory = () => {
  cropHistory.value = cropHistory.value.slice(0, cropHistoryIndex.value + 1);
  cropHistory.value.push(JSON.parse(JSON.stringify(cropTracks.value)));
  cropHistoryIndex.value = cropHistory.value.length - 1;
};

const undoCrop = () => {
  if (cropHistoryIndex.value > 0) {
    cropHistoryIndex.value--;
    cropTracks.value = JSON.parse(JSON.stringify(cropHistory.value[cropHistoryIndex.value]));
  }
};

const redoCrop = () => {
  if (cropHistoryIndex.value < cropHistory.value.length - 1) {
    cropHistoryIndex.value++;
    cropTracks.value = JSON.parse(JSON.stringify(cropHistory.value[cropHistoryIndex.value]));
  }
};

const openCropDialog = () => {
  if (!currentPreview.value) {
    ElMessage.warning('请先生成分镜视频');
    return;
  }
  showCropDialog.value = true;
  isCropPlaying.value = false;
  isMicEnabled.value = false; 
  cropCurrentTime.value = 0;
  cropZoom.value = 5;

  // 开始提取视频帧
  extractThumbnails(currentPreview.value);
  
  // init tracks
  cropTracks.value = [
    {
      id: 'track-1',
      muted: true,
      locked: false,
      clips: [
        {
          id: 'clip-1',
          startTime: 0,
          endTime: cropDuration.value || 5,
          sourceStartTime: 0,
          sourceEndTime: cropDuration.value || 5,
          selected: true
        }
      ]
    }
  ];
  cropHistory.value = [JSON.parse(JSON.stringify(cropTracks.value))];
  cropHistoryIndex.value = 0;

  nextTick(() => {
    if (cropVideoRef.value) {
      cropVideoRef.value.currentTime = 0;
      cropVideoRef.value.muted = true; 
    }
    drawRuler();
    window.addEventListener('resize', drawRuler);
    window.addEventListener('keydown', onCropKeyDown);
  });
};

const onCropDialogClosed = () => {
  window.removeEventListener('resize', drawRuler);
  window.removeEventListener('keydown', onCropKeyDown);
};

const toggleCropPlay = () => {
  if (!cropVideoRef.value) return;
  if (isCropPlaying.value) {
    cropVideoRef.value.pause();
  } else {
    cropVideoRef.value.play();
  }
  isCropPlaying.value = !isCropPlaying.value;
};

const onCropVideoTimeUpdate = () => {
  if (cropVideoRef.value && !dragState.type) {
    cropCurrentTime.value = cropVideoRef.value.currentTime;
    // auto scroll if playhead goes out of view
    if (tracksContainerRef.value && isCropPlaying.value) {
      const containerWidth = tracksContainerRef.value.clientWidth;
      const playheadX = timeToPx(cropCurrentTime.value);
      if (playheadX > tracksContainerRef.value.scrollLeft + containerWidth * 0.8) {
        tracksContainerRef.value.scrollLeft = playheadX - containerWidth * 0.2;
      }
    }
  }
};

const onCropVideoLoaded = () => {
  if (cropVideoRef.value) {
    const dur = cropVideoRef.value.duration || 5;
    cropDuration.value = dur;
    if (cropTracks.value.length === 1 && cropTracks.value[0].clips.length === 1 && cropHistoryIndex.value === 0) {
      cropTracks.value[0].clips[0].endTime = dur;
      cropTracks.value[0].clips[0].sourceEndTime = dur;
      cropHistory.value[0] = JSON.parse(JSON.stringify(cropTracks.value));
      drawRuler();
    }
  }
};

const formatCropTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) seconds = 0;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 30);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
};

// --- Timeline Interaction Logic ---
const dragState = reactive({
  type: null as 'playhead' | 'clip' | 'trim-left' | 'trim-right' | null,
  clipId: '',
  startX: 0,
  startClipStartTime: 0,
  startClipEndTime: 0,
  startSourceStartTime: 0,
  startSourceEndTime: 0,
});

const tracksContainerRef = ref<HTMLElement | null>(null);
const rulerCanvas = ref<HTMLCanvasElement | null>(null);

const onRulerMouseDown = (e: MouseEvent) => {
  if (!tracksContainerRef.value) return;
  const rect = tracksContainerRef.value.getBoundingClientRect();
  const x = e.clientX - rect.left + tracksContainerRef.value.scrollLeft;
  // Always allow clicking in the ruler row, but clamp x to 0
  cropCurrentTime.value = Math.max(0, pxToTime(x));
  seekCropVideo();
  dragState.type = 'playhead';
};

const onPlayheadMouseDown = () => {
  dragState.type = 'playhead';
};

const onClipMouseDown = (e: MouseEvent, clip: CropClip, track: CropTrack) => {
  if (track.locked) return;
  cropTracks.value.forEach(t => t.clips.forEach(c => c.selected = false));
  clip.selected = true;
  
  dragState.type = 'clip';
  dragState.clipId = clip.id;
  dragState.startX = e.clientX;
  dragState.startClipStartTime = clip.startTime;
  dragState.startClipEndTime = clip.endTime;
};

const onTrimHandleMouseDown = (e: MouseEvent, clip: CropClip, side: 'left' | 'right') => {
  const track = cropTracks.value.find(t => t.clips.some(c => c.id === clip.id));
  if (track?.locked) return;
  
  cropTracks.value.forEach(t => t.clips.forEach(c => c.selected = false));
  clip.selected = true;
  
  dragState.type = `trim-${side}`;
  dragState.clipId = clip.id;
  dragState.startX = e.clientX;
  dragState.startClipStartTime = clip.startTime;
  dragState.startClipEndTime = clip.endTime;
  dragState.startSourceStartTime = clip.sourceStartTime;
  dragState.startSourceEndTime = clip.sourceEndTime;
};

const onTracksBackgroundMouseDown = (e: MouseEvent) => {
  // 移除点击背景时取消选中的逻辑，避免分割/删除按钮消失
  // cropTracks.value.forEach(t => t.clips.forEach(c => c.selected = false));
  
  // Also move playhead when clicking empty track area
  if (!tracksContainerRef.value) return;
  const rect = tracksContainerRef.value.getBoundingClientRect();
  const x = e.clientX - rect.left + tracksContainerRef.value.scrollLeft;
  if (x >= 0) {
    cropCurrentTime.value = Math.max(0, pxToTime(x));
    seekCropVideo();
    dragState.type = 'playhead';
  }
};

const onTimelineMouseMove = (e: MouseEvent) => {
  if (!dragState.type || !tracksContainerRef.value) return;
  
  if (dragState.type === 'playhead') {
    const rect = tracksContainerRef.value.getBoundingClientRect();
    const x = e.clientX - rect.left + tracksContainerRef.value.scrollLeft;
    cropCurrentTime.value = Math.max(0, pxToTime(x));
    seekCropVideo();
  } else {
    const dx = e.clientX - dragState.startX;
    const dt = pxToTime(dx);
    
    let clip: CropClip | undefined;
    cropTracks.value.forEach(t => {
      const c = t.clips.find(c => c.id === dragState.clipId);
      if (c) clip = c;
    });
    if (!clip) return;

    if (dragState.type === 'clip') {
      const newStart = Math.max(0, dragState.startClipStartTime + dt);
      const duration = dragState.startClipEndTime - dragState.startClipStartTime;
      clip.startTime = newStart;
      clip.endTime = newStart + duration;
    } else if (dragState.type === 'trim-left') {
      const newStart = Math.max(0, dragState.startClipStartTime + dt);
      if (newStart < clip.endTime - 0.1) {
        clip.startTime = newStart;
        clip.sourceStartTime = Math.max(0, dragState.startSourceStartTime + dt);
      }
    } else if (dragState.type === 'trim-right') {
      const newEnd = Math.max(clip.startTime + 0.1, dragState.startClipEndTime + dt);
      clip.endTime = newEnd;
      clip.sourceEndTime = dragState.startSourceEndTime + dt;
    }
  }
};

const onTimelineMouseUp = () => {
  if (dragState.type && dragState.type !== 'playhead') {
    saveCropHistory();
  }
  dragState.type = null;
};

const seekCropVideo = () => {
  if (cropVideoRef.value) {
    cropVideoRef.value.currentTime = cropCurrentTime.value;
  }
};

const onTimelineScroll = () => {
  drawRuler();
};

const drawRuler = () => {
  if (!rulerCanvas.value || !tracksContainerRef.value) return;
  const ctx = rulerCanvas.value.getContext('2d');
  if (!ctx) return;
  
  const width = rulerCanvas.value.clientWidth;
  const height = rulerCanvas.value.clientHeight;
  
  rulerCanvas.value.width = width;
  rulerCanvas.value.height = height;
  
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = isLight.value ? '#475569' : '#888'; // Darker slate for better readability
  ctx.font = '600 10px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  
  const fps = 30;
  const pxPerSec = cropZoom.value * 20;
  const scrollLeft = tracksContainerRef.value.scrollLeft;
  
  // Calculate time intervals based on zoom
  let intervalSec = 1;
  if (cropZoom.value < 2) intervalSec = 10;
  else if (cropZoom.value < 5) intervalSec = 5;
  else if (cropZoom.value < 10) intervalSec = 2;
  else if (cropZoom.value < 20) intervalSec = 1;
  else intervalSec = 0.5;

  const startSec = Math.floor(scrollLeft / pxPerSec);
  const endSec = Math.ceil((scrollLeft + width) / pxPerSec);
  
  ctx.beginPath();
  ctx.strokeStyle = isLight.value ? '#cbd5e1' : '#444'; // More visible ruler lines
  ctx.lineWidth = 1;
  
  for (let s = startSec; s <= endSec; s += intervalSec / 10) {
    const x = s * pxPerSec - scrollLeft;
    if (x < 0 || x > width) continue;
    
    const isMajor = Math.abs(s % intervalSec) < 0.001;
    const isMid = Math.abs(s % (intervalSec / 2)) < 0.001;
    
    if (isMajor) {
      ctx.moveTo(x, height - 10);
      ctx.lineTo(x, height);
      
      // Format time: 00:00:00:00 or 00f/10f...
      const totalFrames = Math.round(s * fps);
      const mins = Math.floor(s / 60);
      const secs = Math.floor(s % 60);
      const frames = totalFrames % fps;
      
      let timeStr = "";
      if (cropZoom.value > 50) {
        timeStr = `${frames}f`;
      } else {
        timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        if (cropZoom.value > 30) timeStr += `:${frames.toString().padStart(2, '0')}`;
      }
      ctx.fillText(timeStr, x, 4);
    } else if (isMid) {
      ctx.moveTo(x, height - 7);
      ctx.lineTo(x, height);
    } else {
      ctx.moveTo(x, height - 4);
      ctx.lineTo(x, height);
    }
  }
  ctx.stroke();
};

const getSelectedClipInfo = () => {
  for (let t of cropTracks.value) {
    const idx = t.clips.findIndex(c => c.selected);
    if (idx > -1) return { track: t, clip: t.clips[idx], idx };
  }
  return null;
};

const splitCropClip = () => {
  const info = getSelectedClipInfo();
  if (!info) return ElMessage.warning('请先选中一个片段');
  const { track, clip, idx } = info;
  if (track.locked) return ElMessage.warning('轨道已锁定');
  
  if (cropCurrentTime.value <= clip.startTime || cropCurrentTime.value >= clip.endTime) {
    return ElMessage.warning('播放头需在选中片段内部');
  }
  
  const splitTime = cropCurrentTime.value;
  const splitSourceTime = clip.sourceStartTime + (splitTime - clip.startTime);
  
  const newClip1 = { ...clip, endTime: splitTime, sourceEndTime: splitSourceTime, selected: false };
  const newClip2 = { 
    ...clip, 
    id: 'clip-' + Date.now(), 
    startTime: splitTime, 
    sourceStartTime: splitSourceTime,
    selected: true 
  };
  
  track.clips.splice(idx, 1, newClip1, newClip2);
  saveCropHistory();
};

const deleteCropClip = () => {
  const info = getSelectedClipInfo();
  if (!info) return ElMessage.warning('请先选中一个片段');
  if (info.track.locked) return ElMessage.warning('轨道已锁定');
  info.track.clips.splice(info.idx, 1);
  saveCropHistory();
};

const onCropKeyDown = (e: KeyboardEvent) => {
  if (!showCropDialog.value) return;
  if (e.key === 'Delete' || e.key === 'Backspace') {
    deleteCropClip();
  } else if (e.key === 'k' && e.ctrlKey) {
    e.preventDefault();
    splitCropClip();
  } else if (e.key === 'z' && e.ctrlKey && !e.shiftKey) {
    e.preventDefault();
    undoCrop();
  } else if (e.key === 'z' && e.ctrlKey && e.shiftKey) {
    e.preventDefault();
    redoCrop();
  }
};

const confirmCrop = () => {
  ElMessage.success('裁剪设置已保存，将在合成全集时生效');
  showCropDialog.value = false;
};

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const toggleFullScreen = () => {
  if (fullVideoRef.value) {
    if (fullVideoRef.value.requestFullscreen) {
      fullVideoRef.value.requestFullscreen();
    }
  }
};

const downloadVideo = () => {
  ElMessage.success(`视频正在以 ${exportConfig.resolution} 分辨率导出...`);
  setTimeout(() => {
    ElMessage.success('导出成功，请在下载目录查看');
  }, 1500);
};

// --- Single Scene Generation Mock ---
const handleGenerateSingleScene = (idx: number) => {
  if (timelineScenes.value[idx]) {
    timelineScenes.value[idx].status = 'generating';
    timelineScenes.value[idx].progress = 0;
    
    const interval = setInterval(() => {
      timelineScenes.value[idx].progress += 5;
      if (timelineScenes.value[idx].progress >= 100) {
        clearInterval(interval);
        timelineScenes.value[idx].status = 'success';
        timelineScenes.value[idx].video = '/assets/video_4f375ecf2bb7eba03f6809581de8120b.mp4';
        // 同时设置预览图，确保时间轴能看到画面
        timelineScenes.value[idx].image = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600';
        persistStoryboardForEpisode(episodeId.value);
        ElMessage.success(`分镜 ${idx + 1} 生成成功`);
      }
    }, 100);
  }
};

const handleBatchGenerate = () => {
  const targets = isMultiSelectMode.value ? selectedScenes.value : [currentSceneIdx.value];
  if (targets.length === 0) return ElMessage.warning('请先选择要生成的分镜');
  
  ElMessage.success(`开始批量生成 ${targets.length} 个分镜...`);
  targets.forEach(idx => handleGenerateSingleScene(idx));
};

const handleSynthesis = () => {
  isSynthesizing.value = true;
  synthesisProgress.value = 0;
  showSynthesisConfig.value = true;
  
  const timer = setInterval(() => {
    synthesisProgress.value += 1;
    if (synthesisProgress.value >= 100) {
      clearInterval(timer);
      isSynthesizing.value = false;
      isSynthesisCompleted.value = true;
      fullSynthesisVideoUrl.value = synthesisVideoCandidates[0];
      ElMessage.success('全集视频合成成功');
    }
  }, 50);
};

const handlePreviewFull = () => {
  isSynthesisCompleted.value = true;
  fullSynthesisVideoUrl.value = synthesisVideoCandidates[0];
  showSynthesisConfig.value = true;
};

const isAllScenesGenerated = computed(() => {
  return timelineScenes.value.every(s => s.status === 'success');
});

const canSynthesizeAll = computed(() => {
  return isAllScenesGenerated.value;
});

const synthesisTooltip = computed(() => {
  if (!isAllScenesGenerated.value) return '请先生成所有分镜视频';
  return '';
});

const handleExport = () => {
  ElMessage.success('正在准备导出数据...');
};

const handleEpisodeSwitch = (id: string) => {
  persistStoryboardForEpisode(episodeId.value);
  router.push({ query: { ...route.query, id } });
  ElMessage.info(`已切换至 ${episodeStore.episodes.find(e => e.id === id)?.title}`);
};

const episodeId = computed(() => (route.query.id as string) || episodeStore.episodes[0]?.id || '1');
const episode = computed(() => episodeStore.episodes.find(e => e.id === episodeId.value));
const episodeNotFound = computed(() => episodeId.value && !episode.value);

const addTimelineScene = () => {
  const newId = `scene-${timelineScenes.value.length + 1}`;
  timelineScenes.value.push({
    id: newId,
    status: 'pending',
    video: null,
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600',
    progress: 0,
    modified: false,
    script: ''
  });
  persistStoryboardForEpisode(episodeId.value);
};

const deleteScene = (idx: number) => {
  ElMessageBox.confirm('确定要删除这个分镜吗？', '删除分镜', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    timelineScenes.value.splice(idx, 1);
    if (currentSceneIdx.value >= timelineScenes.value.length) {
      currentSceneIdx.value = Math.max(0, timelineScenes.value.length - 1);
    }
    persistStoryboardForEpisode(episodeId.value);
  });
};

onMounted(async () => {
  // Load state from localStorage first
  episodeStore.loadFromLocalStorage();

  // Initialize mock data if store is empty
  if (episodeStore.episodes.length === 0) {
    episodeStore.setEpisodes([
      {
        id: '1',
        index: 1,
        title: '第 1 集：命运抉择系统自毁',
        poster: 'https://picsum.photos/seed/1/200/300',
        roleCount: 7,
        sceneCount: 2,
        propCount: 5,
        storyboardCount: 16,
        status: 'pending',
        storyboardGenerated: false,
        duration: '01:12',
        gif: '',
        synthesisStatus: 'pending',
        scriptStatus: 'pending',
        assetsStatus: 'pending',
        storyboardStatus: 'pending'
      }
    ]);
  }

  // Check for interrupted generation
  if (episodeStore.generationStatus.isGenerating && episodeStore.generationStatus.type === 'storyboard') {
    recoveryConfirmTitle.value = '恢复生成';
    recoveryConfirmMessage.value = `检测到分镜脚本生成意外中断，是否恢复生成？`;
    recoveryConfirmVisible.value = true;
  } else if (!restoreStoryboardForEpisode(episodeId.value)) {
    // Trigger sequential generation for storyboard only when no cached data
    await startStoryboardSequentialGeneration();
  }

  if (currentScript.value) {
    editor.value?.commands.setContent(currentScript.value);
  }
});

watch(isLight, () => {
  if (showCropDialog.value) {
    nextTick(() => {
      drawRuler();
    });
  }
});

watch(episodeId, async (newId, oldId) => {
  if (!newId || newId === oldId) return;
  if (oldId) persistStoryboardForEpisode(oldId);

  isEditingScript.value = false;
  showMentionMenu.value = false;
  selectedScenes.value = [];
  isMultiSelectMode.value = false;
  currentSceneIdx.value = 0;

  if (!restoreStoryboardForEpisode(newId)) {
    timelineScenes.value = [];
    await startStoryboardSequentialGeneration();
  }
});

const startStoryboardSequentialGeneration = async () => {
  isGeneratingStoryboardText.value = true;
  currentStoryboardInfo.value = '正在解析资产库，规划分镜脚本...';
  
  // Phase 1: Text Planning (Big Loading)
  const planningSteps = ['分析角色动态', '匹配场景构图', '设计镜头语言'];
  for (let i = 0; i < planningSteps.length; i++) {
    currentStoryboardInfo.value = planningSteps[i];
    generationProgress.value = Math.round(((i + 1) / planningSteps.length) * 100);
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  // Hide big loading
  isGeneratingStoryboardText.value = false;
  isSequentiallyGeneratingStoryboard.value = true;

  // Update store
  episodeStore.setGenerationStatus({
    isGenerating: true,
    type: 'storyboard',
    totalCount: 2, // Mocking 2 scenes
    currentIndex: 0,
    progress: 0
  });

  // Initial storyboard data (text content)
  const sceneData: any[] = [
    // ... same scene data ...
    {
      id: 'scene-1',
      script: `画面风格和类型: 真人写实, 电影风格, 暖色调, 都市女频<br>
生成一个由以下 3 个镜头组成的视频:<br>
场景: <br>
镜头过渡: 镜头平滑切换, 从司仪转向主角, 焦点始终在舞台中央, 氛围喜庆。<br><br>
镜头1 <span class="mention-pill duration"><i class="timer-icon"></i> 6.0s</span>: 时间: 日, 场景图片: <span class="mention-pill location"><i class="location-icon"></i> 豪华酒店宴会厅_0</span>, 镜头: 中景镜头, 从舞台正下方略仰视角度拍摄, 舞台中央位置, <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=20&h=20&fit=crop" /> 司仪-基础形象</span> 手持话筒, 面带职业微笑, 他的面部朝向台下的宾客, 视线扫过全场, <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=20&h=20&fit=crop" /> 司仪-基础形象</span> 说: 「今天, 是沈家千金沈念安小姐与顾家少爷顾承泽先生的订婚之喜。」 音色: 男声, 青年音色, 音调中等, 音色明亮圆润, 声音厚度适中, 发音标准, 气息沉稳, 吐字清晰, 字正腔圆, 富有亲和力与舞台感染力。 背景是鲜花簇拥的舞台和璀璨的水晶灯。 镜头静止。<br><br>
镜头2 <span class="mention-pill duration"><i class="timer-icon"></i> 3.0s</span>: 时间: 日, 场景图片: <span class="mention-pill location"><i class="location-icon"></i> 豪华酒店宴会厅_0</span>, 镜头: 近景, 从 <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=20&h=20&fit=crop" /> 顾承泽-基础形象</span> 右侧方与角色视线平齐高度拍摄。 <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=20&h=20&fit=crop" /> 沈念安-基础形象</span> 身着纯白礼服, 挽着 <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=20&h=20&fit=crop" /> 顾承泽-基础形象</span> 的手臂, 她仰起头, 侧脸对着镜头, 面部朝向身旁的 <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=20&h=20&fit=crop" /> 顾承泽-基础形象</span>, 视线充满爱意地聚焦于他的脸庞, 脸上洋溢着幸福的笑容, <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=20&h=20&fit=crop" /> 沈念安-基础形象</span> 说: 「承泽, 我好像在做梦。」 音色: 女声, 青年音色, 音调中等偏高, 音色质感明亮、清脆, 声音清亮柔和, 发音方式干净, 气息充沛平稳, 吐字清晰, 带有一种与生俱来的温婉与真诚感。 聚光灯照在他们身上。<br><br>
镜头3 <span class="mention-pill duration"><i class="timer-icon"></i> 6.0s</span>: 时间: 日, 场景图片: <span class="mention-pill location"><i class="location-icon"></i> 豪华酒店宴会厅_0</span>, 镜头: 过肩近景, 从 <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=20&h=20&fit=crop" /> 沈念安-基础形象</span> 的背后拍摄, 焦点在 <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=20&h=20&fit=crop" /> 顾承泽-基础形象</span> 的脸上。 <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=20&h=20&fit=crop" /> 顾承泽-基础形象</span> 低下头, 温柔地凝视着 <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=20&h=20&fit=crop" /> 沈念安-基础形象</span>, 他的面部朝向 <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=20&h=20&fit=crop" /> 沈念安-基础形象</span>, 眼神专注而深情, <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=20&h=20&fit=crop" /> 顾承泽-基础形象</span> 说: 「念安, 这不是梦。从今天起, 你就是我唯一的未婚妻。」 音色: 男声, 青年音色, 音调中等, 音色质感干净但偏扁平, 声音不够厚重, 发音方式清晰, 但语速偏快且气息不稳, 尤其在紧张时会带有轻微的颤抖, 吐字清晰却缺乏力量感, 常在句末音量减弱, 给人一种底气不足的感觉。 镜头缓慢向前推进, 加强情感氛围。`,
      targetImage: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600',
      targetVideo: '/assets/video_4f375ecf2bb7eba03f6809581de8120b.mp4'
    },
    {
      id: 'scene-2',
      script: `镜头2 <span class="mention-pill duration"><i class="timer-icon"></i> 4.0s</span> : 时间: 日，场景图片: <span class="mention-pill location"><i class="location-icon"></i> 豪华酒店宴会厅_0</span>，镜头: 近景，从宾客的过肩视角拍摄，焦点在 <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=20&h=20&fit=crop" /> 沈母-基础形象-基础形象</span> 身上。她脸上带着得意的笑容，面部朝向面前的宾客，视线看着对方，<span class="mention-pill role"><img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=20&h=20&fit=crop" /> 沈母-基础形象-基础形象</span> 说: 「这孩子，从小就懂事，是我们沈家的骄傲。」音色: 女声，中年音色，音调中偏高，音色质感清亮、干脆，但缺乏暖意，声音偏薄，发音方式精准，气息平稳，吐字清晰，语速不快，但字与字之间没有犹豫，带有一种习惯于发号施令的、不容置疑的权威感。<br><br><span class="mention-pill role"><img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=20&h=20&fit=crop" /> 沈父-基础形象-基础形象</span> 在旁边微笑着点头附和。`,
      targetImage: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600',
      targetVideo: '/assets/video_4f375ecf2bb7eba03f6809581de8120b.mp4'
    }
  ];

  // Clear existing scenes
  timelineScenes.value = [];

    // Phase 2: Sequential Scene Generation (Per-item loading)
    for (let i = 0; i < sceneData.length; i++) {
      currentGeneratingStoryboardIndex.value = i;
      
      // Add new scene with loading state
      const newScene = {
        ...sceneData[i],
        status: 'script_generating', // Use script_generating while text is being made
        image: '',
        video: '',
        script: '' // Start with empty script for streaming effect
      };
      timelineScenes.value.push(newScene);
      
      // Auto-select the first scene to show it in the editor/player immediately
      if (i === 0) {
        currentSceneIdx.value = 0;
      }
      
      // Mock generation delay and streaming text effect
      const fullScript = sceneData[i].script;
      
      // Custom logic to handle HTML tags during streaming
      // We want to avoid breaking tags like <span ...> or <img> during the stream
      let currentHtml = '';
      let j = 0;
      while (j < fullScript.length) {
        if (fullScript[j] === '<') {
          // Find the end of the tag
          const endIdx = fullScript.indexOf('>', j);
          if (endIdx !== -1) {
            currentHtml += fullScript.slice(j, endIdx + 1);
            j = endIdx + 1;
          } else {
            currentHtml += fullScript[j];
            j++;
          }
        } else {
          // Output a small chunk of text
          const chunkSize = Math.floor(Math.random() * 3) + 1; // 1-3 chars at a time for natural typing
          currentHtml += fullScript.slice(j, j + chunkSize);
          j += chunkSize;
          await new Promise(resolve => setTimeout(resolve, 20)); // typing delay
        }
        
        timelineScenes.value[i].script = currentHtml;
        
        // Update editor content in real-time if this is the currently viewed scene
        if (i === currentSceneIdx.value && !isEditingScript.value) {
          editor.value?.commands.setContent(timelineScenes.value[i].script);
        }
      }
      
      // Only set status to pending after script is done (video stays null)
      timelineScenes.value[i].status = 'pending';
      
      // Update store progress
      episodeStore.setGenerationStatus({
        currentIndex: i,
        progress: Math.round(((i + 1) / sceneData.length) * 100)
      });
    }

    isSequentiallyGeneratingStoryboard.value = false;
    currentGeneratingStoryboardIndex.value = -1;
    episodeStore.setGenerationStatus({ isGenerating: false, type: '' });
    persistStoryboardForEpisode(episodeId.value);
    ElMessage.success('分镜脚本生成完毕，点击“生成视频”开始制作画面');
  };
</script>

<style scoped>
.has-error .error-placeholder {
  display: flex !important;
}

/* TipTap Styling */
:deep(.script-editor-content) {
  height: 100%;
}
:deep(.ProseMirror) {
  min-height: 100%;
}
:deep(.ProseMirror p) {
  margin: 0;
}

/* Mention Pill Styles */
:deep(.mention-pill) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 13px;
  margin: 0 2px;
  vertical-align: middle;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

:deep(.mention-pill.duration) {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #dcfce7;
}

:deep(.mention-pill.role) {
  background: #fdf2f8;
  color: #db2777;
  border: 1px solid #fce7f3;
}

:deep(.mention-pill.location) {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #dbeafe;
}

:deep(.mention-pill.prop) {
  background: #fff7ed;
  color: #ea580c;
  border: 1px solid #ffedd5;
}

:deep(.mention-pill img) {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  object-cover: cover;
}

:deep(.timer-icon::before) { content: "⏱️"; }
:deep(.location-icon::before) { content: "📍"; }
:deep(.prop-icon::before) { content: "📦"; }

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
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

.custom-select-transparent :deep(.el-select__wrapper) {
  background-color: transparent !important;
  box-shadow: none !important;
  padding-left: 0 !important;
  font-weight: bold;
  color: #475569;
}

/* Checkbox Styles */
:deep(.custom-button-checkbox) {
  height: auto;
}
:deep(.custom-timeline-checkbox) {
  display: inline-flex;
  align-items: center;
}
:deep(.custom-timeline-checkbox .el-checkbox__inner) {
  width: 14px;
  height: 14px;
  border-radius: 4px;
}
:deep(.custom-timeline-checkbox .el-checkbox__label) {
  padding-left: 6px;
}

/* Animations */
.theme-primary-btn {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
}
.theme-primary-btn:hover {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  transform: translateY(-1px);
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.2);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.4);
}

/* Mention Pill Styles */
:deep(.mention-pill) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: #EEF2FF;
  border: 1px solid #E0E7FF;
  border-radius: 6px;
  color: #4F46E5;
  font-weight: 700;
  font-size: 13px;
  margin: 0 2px;
  vertical-align: middle;
  line-height: 1.2;
}

.dark :deep(.mention-pill) {
  background: rgba(99, 102, 241, 0.15);
  border-color: rgba(99, 102, 241, 0.3);
  color: #818CF8;
}

:deep(.mention-pill.role) {
  background: #FDF2F8;
  border-color: #FCE7F3;
  color: #DB2777;
}

.dark :deep(.mention-pill.role) {
  background: rgba(219, 39, 119, 0.15);
  border-color: rgba(219, 39, 119, 0.3);
  color: #F472B6;
}

:deep(.mention-pill.role img) {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  object-cover: cover;
}

:deep(.mention-pill.location) {
  background: #F0FDF4;
  border-color: #DCFCE7;
  color: #16A34A;
}

.dark :deep(.mention-pill.location) {
  background: rgba(22, 163, 74, 0.15);
  border-color: rgba(22, 163, 74, 0.3);
  color: #4ADE80;
}

:deep(.mention-pill.duration) {
  background: #FFFBEB;
  border-color: #FEF3C7;
  color: #D97706;
}

.dark :deep(.mention-pill.duration) {
  background: rgba(217, 119, 6, 0.15);
  border-color: rgba(217, 119, 6, 0.3);
  color: #FBBF24;
}

:deep(.mention-pill i.timer-icon) {
  width: 12px;
  height: 12px;
  display: inline-block;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23D97706'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'%3E%3C/path%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-in {
  animation: fadeIn 0.3s ease-out;
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
/* Sequential Generation Loading Styles */
@keyframes float-slow {
  0%, 100% { transform: rotate(6deg) translateY(0); }
  50% { transform: rotate(2deg) translateY(-10px); }
}

@keyframes bounce-subtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes shimmer-fast {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-float-slow {
  animation: float-slow 4s infinite ease-in-out;
}

.animate-bounce-subtle {
  animation: bounce-subtle 2s infinite ease-in-out;
}

.animate-shimmer-fast {
  animation: shimmer-fast 1.5s infinite linear;
}

.animate-pulse-slow {
  animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse-slow {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.1;
  }
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

/* Crop Dialog Styles */
:deep(.crop-video-dialog) {
  --el-dialog-border-radius: 24px !important;
  --el-dialog-box-shadow: none !important;
}

:deep(.crop-video-dialog .el-dialog) {
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

:deep(.crop-video-dialog.is-dark .el-dialog) {
  background-color: #1e1e24 !important;
  border: 1px solid rgba(20, 184, 166, 0.3) !important;
  box-shadow: 0 0 40px rgba(20, 184, 166, 0.15), inset 0 0 0 1px rgba(20, 184, 166, 0.1) !important;
}

:deep(.crop-video-dialog.is-light .el-dialog) {
  background-color: #f1f5f9 !important;
  border: 1px solid rgba(79, 70, 229, 0.2) !important;
  box-shadow: 0 0 40px rgba(79, 70, 229, 0.1) !important;
}

/* Subtle Glow Effect for Dark Mode */
:deep(.crop-video-dialog.is-dark .el-dialog::before) {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(to bottom, rgba(20, 184, 166, 0.1), transparent);
  z-index: 0;
}

:deep(.crop-video-dialog.is-dark .el-dialog__header) {
  background-color: transparent !important;
  margin-right: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: 20px 24px;
  position: relative;
  z-index: 1;
}
:deep(.crop-video-dialog.is-light .el-dialog__header) {
  background-color: transparent !important;
  margin-right: 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 20px 24px;
  position: relative;
  z-index: 1;
}

:deep(.crop-video-dialog.is-dark .el-dialog__title) {
  color: #fff !important;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.025em;
}
:deep(.crop-video-dialog.is-light .el-dialog__title) {
  color: #0f172a !important;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.025em;
}

:deep(.crop-video-dialog .el-dialog__body) {
  padding: 0 !important;
  background-color: transparent !important;
}

:deep(.crop-video-dialog .el-dialog__footer) {
  padding: 0 24px 24px !important;
  background-color: transparent !important;
}
:deep(.crop-video-dialog.is-dark .el-dialog__footer) {
  background-color: transparent !important;
}
:deep(.crop-video-dialog.is-light .el-dialog__footer) {
  background-color: transparent !important;
}

:deep(.crop-video-dialog.is-dark .el-dialog__headerbtn .el-dialog__close) {
  color: #888;
}
:deep(.crop-video-dialog.is-light .el-dialog__headerbtn .el-dialog__close) {
  color: #64748b;
}

:deep(.crop-video-dialog.is-dark .el-dialog__headerbtn:hover .el-dialog__close) {
  color: #fff;
}
:deep(.crop-video-dialog.is-light .el-dialog__headerbtn:hover .el-dialog__close) {
  color: #0f172a;
}

:deep(.crop-video-dialog.is-dark .crop-zoom-slider .el-slider__runway) {
  background-color: #333 !important;
  height: 4px;
}
:deep(.crop-video-dialog.is-light .crop-zoom-slider .el-slider__runway) {
  background-color: #e2e8f0 !important;
  height: 4px;
  border-radius: 2px;
}

:deep(.crop-video-dialog.is-dark .crop-zoom-slider .el-slider__bar) {
  background-color: #0d9488 !important;
  height: 4px;
}
:deep(.crop-video-dialog.is-light .crop-zoom-slider .el-slider__bar) {
  background-color: #6366f1 !important;
  height: 4px;
  border-radius: 2px;
}

:deep(.crop-video-dialog .crop-zoom-slider .el-slider__button) {
  border: 2px solid currentColor !important;
  width: 10px;
  height: 10px;
  background-color: #fff !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
  transition: transform 0.2s;
}
:deep(.crop-video-dialog .crop-zoom-slider .el-slider__button:hover) {
  transform: scale(1.2);
}
:deep(.crop-video-dialog.is-dark .crop-zoom-slider .el-slider__button) {
  color: #0d9488 !important;
}
:deep(.crop-video-dialog.is-light .crop-zoom-slider .el-slider__button) {
  color: #6366f1 !important;
}

/* Custom Scrollbar for Tracks Area */
.scrollbar-thin::-webkit-scrollbar {
  height: 10px;
  width: 8px;
}
.is-dark .scrollbar-thin::-webkit-scrollbar-track {
  background: #1a1a1f;
  border-radius: 4px;
}
.is-light .scrollbar-thin::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}
.is-dark .scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: #333;
  border-radius: 10px;
  border: 2px solid #1a1a1f;
}
.is-light .scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
  border: 2px solid #f1f5f9;
}
.is-dark .scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background-color: #444;
}
.is-light .scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}
</style>
