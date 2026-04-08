<template>
  <div class="h-screen flex flex-col bg-[#f0f2f5] overflow-hidden">
    <!-- Header -->
    <header class="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 z-20 relative shadow-sm">
      <div class="flex items-center gap-4">
        <button 
          @click="router.back()" 
          class="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-full transition-all font-medium"
        >
          <el-icon><ArrowLeft /></el-icon>
          <span>返回</span>
        </button>
        <el-divider direction="vertical" class="!h-6 !mx-2" />
        
        <el-dropdown trigger="click" @command="handleEpisodeSwitch">
          <div class="flex items-center gap-2 cursor-pointer group px-4 py-2 hover:bg-slate-50 rounded-full transition-all">
            <h1 class="text-[16px] font-extrabold text-slate-800 truncate max-w-[400px] group-hover:text-indigo-600 transition-colors">
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
      
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
          <el-icon class="text-indigo-500"><Menu /></el-icon>
          <el-select v-model="synthesisModel" size="small" class="w-40 !border-none custom-select-transparent">
            <el-option label="Seedance 2.0 • Fast" value="seedance-fast" />
            <el-option label="Seedance 2.0 • Quality" value="seedance-quality" />
          </el-select>
        </div>
        
        <button 
          @click="handleExport"
          class="h-10 px-5 bg-white text-slate-600 border border-slate-200 rounded-full text-[14px] font-bold hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="!timelineScenes[currentSceneIdx]?.video"
        >
          <el-icon><RefreshRight /></el-icon> 导出
        </button>

        <!-- Background Music Button -->
        <el-tooltip 
          :content="!isAllScenesGenerated ? '请先生成所有分镜视频' : (bgmConfig.confirmed ? '已确认配置' : '配置背景音乐')" 
          placement="top"
        >
          <div class="inline-block">
            <button 
              @click="showBgmConfig = true"
              :disabled="!isAllScenesGenerated"
              class="h-10 px-6 rounded-full text-[14px] font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/10 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              :class="bgmConfig.confirmed ? 'bg-emerald-600 text-white shadow-emerald-500/20' : 'bg-indigo-600 text-white shadow-indigo-500/20 theme-primary-btn'"
            >
              <el-icon><Headset /></el-icon> 
              <span>背景音乐</span>
              <span v-if="bgmConfig.status === 'ready'" class="w-2 h-2 rounded-full bg-white animate-pulse ml-1 shadow-sm"></span>
            </button>
          </div>
        </el-tooltip>

        <button 
          v-if="isSynthesisCompleted || episodeStore.episodes.find(e => e.id === episodeId)?.synthesisVideo"
          @click="handlePreviewFull"
          class="h-10 px-5 bg-indigo-50 text-indigo-600 rounded-full text-[14px] font-bold hover:bg-indigo-100 transition-all flex items-center gap-2 shadow-sm"
        >
          <el-icon><VideoPlay /></el-icon> 预览全集
        </button>

        <!-- Synthesize All Button -->
        <el-tooltip 
          :content="synthesisTooltip" 
          placement="top" 
          :disabled="canSynthesizeAll"
        >
          <div class="inline-block">
            <button 
              @click="handleSynthesis"
              :disabled="!canSynthesizeAll"
              class="h-10 px-8 bg-indigo-600 text-white rounded-full text-[14px] font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center gap-2"
            >
              <el-icon><MagicStick /></el-icon>
              合成全集
            </button>
          </div>
        </el-tooltip>
      </div>
    </header>

    <!-- Main Workspace -->
    <main class="flex-1 flex gap-4 overflow-hidden p-4 bg-[#f8fafc]">
      <!-- Left Sidebar: Subject Library -->
      <aside class="w-[300px] bg-white rounded-xl shadow-sm flex flex-col overflow-hidden shrink-0">
        <!-- Subject Library Content -->
        <div class="flex-1 flex flex-col overflow-hidden">
          <div class="p-5 border-b border-slate-50 flex justify-between items-center shrink-0">
            <span class="font-bold text-[16px] text-slate-800 tracking-wide">主体库</span>
            <el-tooltip content="打开主体库弹窗" placement="top">
              <button 
                @click="showLibraryModal = true"
                class="text-slate-500 hover:text-indigo-600 transition-colors"
              >
                <el-icon size="20"><Plus /></el-icon>
              </button>
            </el-tooltip>
          </div>

          <div class="flex-1 overflow-y-auto custom-scrollbar p-5 pb-10">
            <!-- Character Category -->
            <div class="mb-8">
              <div class="flex items-center justify-between mb-4 text-slate-500">
                <div class="flex items-center gap-2">
                  <el-icon size="16"><User /></el-icon>
                  <span class="text-[14px] font-black tracking-wider">角色 ({{ filteredCharacters.length }})</span>
                </div>
                <button class="text-indigo-500 hover:text-indigo-600 transition-colors" @click="handleAddSubject('character')">
                  <el-icon><Plus /></el-icon>
                </button>
              </div>
              <div class="grid grid-cols-2 gap-x-3 gap-y-6">
            <div v-for="char in filteredCharacters" :key="char.id" class="flex flex-col gap-2 group cursor-pointer relative" @click="handleEditSubject(char)">
                  <div class="w-full aspect-[4/3] rounded-2xl bg-white border border-slate-100 overflow-hidden relative transition-all group-hover:shadow-md flex items-center justify-center p-1">
                    <!-- Delete Button -->
                    <button 
                      class="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm text-slate-500 hover:text-red-500 flex items-center justify-center text-[12px] shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10 hover:scale-110 active:scale-90"
                      @click.stop="handleDeleteSubject(char)"
                    >
                      <el-icon><Delete /></el-icon>
                    </button>
                    <!-- White Circle for Avatar -->
                    <div class="w-20 h-20 rounded-full bg-slate-50 overflow-hidden flex items-center justify-center relative">
                      <el-image v-if="char.image" :src="char.image" class="w-full h-full object-cover" loading="lazy" />
                      <el-icon v-else size="32" class="text-slate-300"><User /></el-icon>
                    </div>
                    
                    <!-- Hover Overlay with Edit Icon -->
                    <div class="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-all flex justify-end items-start p-2">
                      <button 
                        class="w-8 h-8 rounded-full bg-white text-indigo-600 flex items-center justify-center transition-all shadow-md hover:scale-110 active:scale-90"
                        @click.stop="handleEditSubject(char)"
                      >
                        <el-icon size="16"><Edit /></el-icon>
                      </button>
                    </div>
                  </div>
                  <span class="text-[13px] text-slate-800 font-bold truncate w-full px-1 text-center group-hover:text-indigo-600 transition-colors">{{ char.name }}</span>
                </div>
              </div>
            </div>

            <!-- Scene Category -->
            <div class="mb-8">
              <div class="flex items-center justify-between mb-4 text-slate-500">
                <div class="flex items-center gap-2">
                  <el-icon size="16"><Location /></el-icon>
                  <span class="text-[14px] font-black tracking-wider">场景 ({{ filteredScenes.length }})</span>
                </div>
                <button class="text-indigo-500 hover:text-indigo-600 transition-colors" @click="handleAddSubject('scene')">
                  <el-icon><Plus /></el-icon>
                </button>
              </div>
              <div class="grid grid-cols-2 gap-x-3 gap-y-6">
            <div v-for="scene in filteredScenes" :key="scene.id" class="flex flex-col gap-2 group cursor-pointer relative" @click="handleEditSubject(scene)">
                  <div class="w-full aspect-[4/3] rounded-2xl bg-white border border-slate-100 overflow-hidden relative transition-all group-hover:shadow-md">
                    <!-- Delete Button -->
                    <button 
                      class="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm text-slate-500 hover:text-red-500 flex items-center justify-center text-[12px] shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10 hover:scale-110 active:scale-90"
                      @click.stop="handleDeleteSubject(scene)"
                    >
                      <el-icon><Delete /></el-icon>
                    </button>
                    <el-image v-if="scene.image" :src="scene.image" class="w-full h-full object-cover" loading="lazy" />
                    <div v-else class="flex flex-col items-center justify-center w-full h-full text-slate-400 bg-slate-50">
                      <el-icon size="28"><Location /></el-icon>
                    </div>
                    
                    <!-- Hover Overlay with Edit Icon -->
                    <div class="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-all flex justify-end items-start p-2">
                      <button 
                        class="w-8 h-8 rounded-full bg-white text-indigo-600 flex items-center justify-center transition-all shadow-md hover:scale-110 active:scale-90"
                        @click.stop="handleEditSubject(scene)"
                      >
                        <el-icon size="16"><Edit /></el-icon>
                      </button>
                    </div>
                  </div>
                  <span class="text-[12px] text-slate-700 font-bold truncate w-full px-1 text-center group-hover:text-indigo-600 transition-colors">{{ scene.name }}</span>
                </div>
              </div>
            </div>

            <!-- Props Category -->
            <div class="mb-8">
              <div class="flex items-center justify-between mb-4 text-slate-400">
                <div class="flex items-center gap-2">
                  <el-icon size="14"><Box /></el-icon>
                  <span class="text-[13px] font-medium tracking-wider">道具 ({{ filteredProps.length }})</span>
                </div>
                <button class="text-indigo-400 hover:text-indigo-600 transition-colors" @click="handleAddSubject('prop')">
                  <el-icon><Plus /></el-icon>
                </button>
              </div>
              <div class="grid grid-cols-2 gap-x-3 gap-y-6">
            <div v-for="prop in filteredProps" :key="prop.id" class="flex flex-col gap-2 group cursor-pointer relative" @click="handleEditSubject(prop)">
                  <div class="w-full aspect-[4/3] rounded-2xl bg-white border border-slate-100 overflow-hidden relative transition-all group-hover:shadow-md">
                    <!-- Delete Button -->
                    <button 
                      class="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm text-slate-400 hover:text-red-500 flex items-center justify-center text-[12px] shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10 hover:scale-110 active:scale-90"
                      @click.stop="handleDeleteSubject(prop)"
                    >
                      <el-icon><Delete /></el-icon>
                    </button>
                    <el-image v-if="prop.image" :src="prop.image" class="w-full h-full object-cover" loading="lazy" />
                    <div v-else class="flex flex-col items-center justify-center w-full h-full text-slate-300 bg-slate-50">
                      <el-icon size="28"><Box /></el-icon>
                    </div>
                    
                    <!-- Hover Overlay with Edit Icon -->
                    <div class="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-all flex justify-end items-start p-2">
                      <button 
                        class="w-8 h-8 rounded-full bg-white text-indigo-600 flex items-center justify-center transition-all shadow-md hover:scale-110 active:scale-90"
                        @click.stop="handleEditSubject(prop)"
                      >
                        <el-icon size="16"><Edit /></el-icon>
                      </button>
                    </div>
                  </div>
                  <span class="text-[12px] text-slate-700 font-bold truncate w-full px-1 text-center group-hover:text-indigo-600 transition-colors">{{ prop.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Right Column: Editor & Timeline -->
      <div class="flex-1 flex flex-col gap-4 min-w-0">
        <!-- Center: Script Editor Area -->
        <section class="flex-1 flex flex-col min-h-0 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden relative">
          <!-- Top Toolbar / Header -->
          <div class="px-6 py-4 bg-white flex justify-between items-center shrink-0">
            <div class="flex items-center gap-3">
              <h1 class="text-[15px] font-bold text-slate-800">分镜 {{ currentSceneIdx + 1 }}</h1>
              <span class="text-[12px] text-slate-400">分镜时长请限制在4-15s，输入“@”可快速调整镜头时长、引用角色、场景、道具</span>
            </div>
            <span class="text-[12px] text-slate-400"></span>
          </div>

          <!-- Content Wrapper for Scroll control and Action buttons -->
          <div class="flex-1 flex flex-col min-h-0 overflow-hidden relative">
            <!-- Content Split Area -->
            <div class="flex-1 flex gap-4 px-6 pb-6 overflow-hidden">
              <!-- Left: Script Content Box -->
              <div 
                class="flex-[3] rounded-xl transition-all relative flex flex-col overflow-hidden"
                :class="isEditingScript ? 'bg-white border border-indigo-200 shadow-lg' : 'bg-[#f8fafc] border border-transparent'"
              >
                <!-- Read-only View -->
                <div 
                  v-if="!isEditingScript"
                  class="p-6 text-[14px] text-slate-700 leading-[1.8] outline-none flex-1 overflow-y-auto custom-scrollbar cursor-text"
                  v-html="currentScript"
                >
                </div>

                <!-- Edit Mode (TipTap) -->
                <div v-else class="flex-1 flex flex-col relative overflow-hidden p-6">
                  <div class="flex-1 overflow-y-auto custom-scrollbar">
                    <editor-content :editor="editor" class="script-editor-content w-full h-full" />
                  </div>
                  
                  <!-- @ Mention Popup (Teleported to body for top-level visibility) -->
                  <teleport to="body">
                    <transition name="el-zoom-in-top">
                      <div 
                        v-if="showMentionMenu" 
                        ref="mentionMenuRef"
                        class="fixed z-[9999] bg-white rounded-xl shadow-2xl border border-slate-100 p-2 min-w-[280px] max-w-[340px]"
                        :style="mentionMenuStyle"
                      >
                        <!-- Search Bar (Optional visual indicator, synced with editor typing) -->
                        <div class="mb-2 px-3 py-1.5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                          <el-icon class="text-slate-400" size="14"><Search /></el-icon>
                          <span class="text-[12px] text-slate-500 font-medium">搜索: </span>
                          <span v-if="mentionSearch" class="text-[12px] text-indigo-600 font-bold">{{ mentionSearch }}</span>
                          <span v-else class="text-[12px] text-slate-300">输入关键词...</span>
                        </div>

                        <div class="flex gap-1 p-1 mb-2 bg-slate-50/50 rounded-lg shrink-0 overflow-x-auto custom-scrollbar">
                          <button 
                          v-for="tab in ['all', 'duration', 'character', 'scene', 'asset']" 
                          :key="tab"
                          @click="mentionActiveTab = tab"
                          class="px-2 py-1 text-[10px] rounded-md transition-all whitespace-nowrap"
                          :class="mentionActiveTab === tab ? 'bg-white text-indigo-600 shadow-sm font-bold' : 'text-slate-400 hover:text-slate-600'"
                        >
                          {{ tab === 'all' ? '全部' : tab === 'duration' ? '时长' : tab === 'character' ? '角色' : tab === 'scene' ? '场景' : '道具' }}
                        </button>
                        </div>

                        <div class="max-h-[300px] overflow-y-auto custom-scrollbar">
                          <!-- Custom Duration Input -->
                          <div v-if="mentionActiveTab === 'duration' || mentionActiveTab === 'all'" class="px-3 py-2 mb-1">
                            <div class="flex gap-2">
                              <el-input 
                                v-model="customDuration" 
                                size="small" 
                                placeholder="自定义秒数..." 
                                @keyup.enter="handleCustomDuration"
                              />
                              <button 
                                @click="handleCustomDuration"
                                class="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-[13px] font-bold hover:bg-indigo-700 transition-all shadow-md"
                              >
                                确定
                              </button>
                            </div>
                          </div>

                          <div 
                            v-for="(item, idx) in mentionItems" 
                            :key="idx"
                            class="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors group"
                            :class="idx === selectedMentionIndex ? 'bg-indigo-50' : 'hover:bg-indigo-50/50'"
                            @click="insertMention(item)"
                          >
                            <div class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-50 relative">
                              <img 
                                v-if="'image' in item && item.image" 
                                :src="item.image" 
                                class="w-full h-full object-cover relative z-10" 
                                @error="(e: any) => e.target.style.opacity = 0"
                              />
                              <el-icon class="text-slate-400 absolute inset-0 m-auto" size="18"><component :is="item.icon" /></el-icon>
                            </div>
                            <div class="flex flex-col min-w-0">
                              <span class="text-[13px] font-bold text-slate-700 truncate">{{ item.name }}</span>
                              <span class="text-[11px] text-slate-400 truncate leading-tight">{{ item.desc }}</span>
                            </div>
                            <div class="ml-auto text-indigo-400 transition-opacity" :class="idx === selectedMentionIndex ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'">
                              <el-icon><Select /></el-icon>
                            </div>
                          </div>
                          <div v-if="mentionItems.length === 0" class="py-8 text-center text-slate-400 text-[12px]">
                            未找到相关项
                          </div>
                        </div>
                      </div>
                    </transition>
                  </teleport>
                </div>

                <!-- Action Buttons Area -->
                <div class="px-6 py-4 flex justify-end gap-3 shrink-0 border-t border-slate-50 bg-white/50">
                  <template v-if="!isEditingScript">
                    <button 
                      @click="handleEditScript"
                      class="h-10 px-6 bg-white text-slate-600 border border-slate-200 rounded-full text-[14px] font-bold hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-md flex items-center gap-2"
                    >
                      <el-icon><Edit /></el-icon>
                      <span>编辑脚本</span>
                    </button>
                    <button 
                      @click="handleBatchGenerate"
                      :disabled="!timelineScenes[currentSceneIdx]?.modified"
                      class="h-10 px-6 rounded-full text-[14px] font-bold transition-all flex items-center gap-2"
                      :class="timelineScenes[currentSceneIdx]?.modified ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700' : 'bg-slate-100 text-slate-400 border border-slate-100 cursor-not-allowed opacity-50'"
                    >
                      <el-icon><MagicStick /></el-icon>
                      <span>再次生成</span>
                    </button>
                  </template>
                  <template v-else>
                    <button 
                      @click="handleCancelEdit"
                      class="h-10 px-8 bg-white text-slate-500 rounded-full text-[14px] font-bold hover:text-slate-700 transition-all border border-slate-200 shadow-sm"
                    >
                      取消
                    </button>
                    <button 
                      @click="handleSaveScriptInline"
                      class="h-10 px-10 bg-indigo-600 text-white rounded-full text-[14px] font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      保存
                    </button>
                    <button 
                      disabled
                      class="h-10 px-6 bg-slate-100 text-slate-400 border border-slate-100 rounded-full text-[14px] font-bold flex items-center gap-2 opacity-50 cursor-not-allowed"
                    >
                      <el-icon><MagicStick /></el-icon>
                      <span>再次生成</span>
                    </button>
                  </template>
                </div>
              </div>

              <!-- Right: Preview/Status Placeholder -->
              <div class="flex-1 rounded-xl bg-[#f8fafc] flex flex-col items-center justify-center border border-transparent overflow-hidden relative">
                <div v-if="timelineScenes[currentSceneIdx]?.status === 'generating'" class="absolute inset-0 z-20 flex flex-col items-center justify-center text-white overflow-hidden">
                  <!-- Blurred Background -->
                  <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/40 to-purple-500/40 backdrop-blur-xl transition-all duration-500"></div>
                  <!-- Content -->
                  <div class="relative flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
                    <div class="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin shadow-lg"></div>
                    <div class="flex flex-col items-center gap-2">
                      <span class="text-[18px] font-bold tracking-widest drop-shadow-md">生成中...</span>
                      <span class="text-[13px] text-white/80 font-medium bg-black/10 px-4 py-1 rounded-full backdrop-blur-sm">大约还需 3 分钟</span>
                    </div>
                  </div>
                </div>

                <div v-else-if="currentPreview" class="w-full h-full relative rounded-xl overflow-hidden group bg-black">
                  <video 
                    :src="currentPreview" 
                    class="w-full h-full object-contain"
                    controls
                    autoplay
                    loop
                    muted
                  ></video>
                  <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      class="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-all shadow-md"
                    >
                      <el-icon><RefreshRight /></el-icon>
                    </button>
                    <button 
                      class="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-all shadow-md"
                    >
                      <el-icon><FullScreen /></el-icon>
                    </button>
                  </div>
                </div>
                <div v-else class="flex flex-col items-center gap-4 text-slate-400 opacity-60">
                  <!-- Film Icon SVG -->
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                    <line x="7" y1="2" x2="7" y2="22"></line>
                    <line x1="17" y1="2" x2="17" y2="22"></line>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <line x1="2" y1="7" x2="7" y2="7"></line>
                    <line x1="2" y1="17" x2="7" y2="17"></line>
                    <line x1="17" y1="17" x2="22" y2="17"></line>
                    <line x1="17" y1="7" x2="22" y2="7"></line>
                  </svg>
                  <span class="text-[14px] font-medium tracking-wide">未生成内容</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Bottom: Timeline / Audio Player Area -->
        <div class="h-[160px] bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col gap-2 shrink-0">
          <!-- Audio Controls Header -->
          <div class="flex items-center justify-between shrink-0 pl-1 pr-2">
            <div class="flex items-center gap-3">
              <button class="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </button>
              <span class="text-[12px] text-slate-500 font-mono font-medium">00:00 / 00:00</span>
            </div>
            
            <!-- Multi-select Controls -->
            <div v-if="isMultiSelectMode" class="flex items-center gap-3">
              <button 
                @click="isAllSelected = !isAllSelected"
                class="h-8 px-4 bg-white text-indigo-600 border border-indigo-100 rounded-full text-[12px] font-bold hover:bg-indigo-50 transition-all shadow-sm flex items-center gap-1.5"
              >
                <el-checkbox 
                  :model-value="isAllSelected" 
                  :indeterminate="isIndeterminate" 
                  class="custom-button-checkbox !mr-0 pointer-events-none"
                />
                {{ isAllSelected ? '取消全选' : '全选' }}
              </button>
              <button 
                @click="toggleMultiSelect"
                class="h-8 px-4 bg-white text-slate-500 rounded-full text-[12px] font-bold hover:text-slate-700 transition-all"
              >
                取消
              </button>
              <button 
                :disabled="selectedScenes.length === 0" 
                @click="handleBatchGenerate"
                class="h-8 px-5 bg-indigo-600 text-white rounded-full text-[12px] font-bold shadow-md shadow-indigo-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center gap-1.5"
              >
                <el-icon><MagicStick /></el-icon>
                批量生成
              </button>
            </div>
            <div v-else>
              <button 
                @click="toggleMultiSelect" 
                class="h-8 px-4 bg-white text-slate-600 border border-slate-200 rounded-full text-[12px] font-bold hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm"
              >
                多选
              </button>
            </div>
          </div>

          <!-- Timeline Items -->
          <div class="flex-1 flex gap-4 overflow-x-auto custom-scrollbar items-center pb-2 pl-1">
            <div v-for="(scene, idx) in timelineScenes" :key="scene.id" 
              class="flex-shrink-0 w-[150px] h-[90px] rounded-2xl bg-slate-50 border shadow-sm flex items-center justify-center relative cursor-pointer transition-all hover:border-indigo-400 overflow-hidden group"
              :class="[
                (!isMultiSelectMode && currentSceneIdx === idx) || (isMultiSelectMode && selectedScenes.includes(idx)) 
                  ? 'border-indigo-500 ring-4 ring-indigo-500/10' 
                  : 'border-slate-100'
              ]"
              @click="toggleSceneSelection(idx)"
            >
              <!-- Background Image if generated -->
              <div v-if="scene.status === 'success' && scene.image" class="absolute inset-0 w-full h-full">
                <img :src="scene.image" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div class="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors"></div>
              </div>

              <!-- Index Badge & Checkbox -->
              <div class="absolute top-2 left-2 flex items-center gap-1.5 z-10">
                <div 
                  v-if="!isMultiSelectMode" 
                  class="w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold shadow-md transition-all"
                  :class="currentSceneIdx === idx ? 'bg-indigo-600 text-white scale-110' : 'bg-white/90 backdrop-blur-sm text-slate-600'"
                >
                  {{ idx + 1 }}
                </div>
                
                <div v-if="isMultiSelectMode" class="w-6 h-6 flex items-center justify-center pointer-events-none">
                  <el-checkbox :model-value="selectedScenes.includes(idx)" class="!mr-0 custom-timeline-checkbox"></el-checkbox>
                </div>
              </div>

              <!-- Delete Button -->
              <button 
                class="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm text-slate-400 hover:text-red-500 flex items-center justify-center text-[12px] shadow-md opacity-0 group-hover:opacity-100 transition-all z-10 hover:scale-110 active:scale-90"
                @click.stop="deleteScene(idx)"
              >
                <el-icon><Delete /></el-icon>
              </button>

              <!-- Center Content -->
              <div class="flex items-center justify-center w-full h-full relative z-10">
                <!-- Generating Progress -->
                <div v-if="scene.status === 'generating'" class="flex flex-col items-center gap-2 w-full h-full justify-center bg-indigo-600/20 backdrop-blur-sm">
                  <div class="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  <span class="text-[11px] font-bold text-white tracking-widest">生成中</span>
                </div>
                
                <!-- Success State -->
                <div v-else-if="scene.status === 'success'" class="flex items-center gap-2 text-white bg-indigo-600/80 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 scale-90 group-hover:scale-100">
                  <el-icon size="16"><VideoPlay /></el-icon>
                  <span class="text-[13px] font-bold">预览</span>
                </div>

                <!-- Default/Pending State -->
                <button 
                  v-else 
                  class="flex items-center gap-2 text-indigo-600 bg-white hover:bg-indigo-600 hover:text-white px-5 py-2 rounded-full shadow-md border border-indigo-100 transition-all font-bold"
                  @click="handleGenerateSingleScene(idx)"
                >
                  <el-icon><MagicStick /></el-icon>
                  <span class="text-[13px]">生成</span>
                </button>
              </div>
            </div>
            
            <!-- Add New Scene Button -->
            <button 
              class="flex-shrink-0 w-14 h-14 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:text-indigo-600 hover:border-indigo-400 transition-all hover:bg-indigo-50/30 group"
              @click="addTimelineScene"
            >
              <el-icon size="24" class="group-hover:scale-125 transition-transform"><Plus /></el-icon>
            </button>
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
            <div class="bg-white px-10 py-8 flex items-center justify-between border-t border-slate-50 shrink-0 z-40 h-[140px]">
              <div class="flex items-center gap-16">
                <!-- Watermark Selector -->
                <div class="flex flex-col gap-3">
                  <span class="text-[13px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">水印设置</span>
                  <div class="flex bg-slate-100 p-1 rounded-full w-fit">
                    <button 
                      v-for="opt in [{l:'带品牌水印',v:'brand'},{l:'无水印',v:'none'}]" 
                      :key="opt.v"
                      @click="exportConfig.watermark = opt.v"
                      class="px-5 py-1.5 rounded-full text-[13px] font-bold transition-all duration-300"
                      :class="exportConfig.watermark === opt.v ? 'bg-white text-[#1890ff] shadow-sm' : 'text-slate-500 hover:text-slate-700'"
                    >
                      {{ opt.l }}
                    </button>
                  </div>
                </div>

                <!-- Resolution Selector -->
                <div class="flex flex-col gap-3">
                  <span class="text-[13px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">导出分辨率</span>
                  <div class="flex bg-slate-100 p-1 rounded-full w-fit">
                    <button 
                      v-for="opt in [{l:'1080P',v:'1080p'},{l:'720P',v:'720p'},{l:'4K',v:'4k'}]" 
                      :key="opt.v"
                      @click="exportConfig.resolution = opt.v"
                      class="px-6 py-1.5 rounded-full text-[13px] font-bold transition-all duration-300"
                      :class="exportConfig.resolution === opt.v ? 'bg-white text-[#1890ff] shadow-sm' : 'text-slate-500 hover:text-slate-700'"
                    >
                      {{ opt.l }}
                    </button>
                  </div>
                </div>
              </div>

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
          @confirm="handleLibraryConfirm"
        />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import CharacterCount from '@tiptap/extension-character-count';
import { Node, mergeAttributes } from '@tiptap/core';

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
  ArrowLeft, ArrowDown, Star, MoreFilled, Plus, User, Location, 
  Box, Edit, Timer, MagicStick, RefreshRight, VideoPlay, Warning, FullScreen,
  Menu, Delete, Search, InfoFilled, Close, Select, Picture, Film, Headset,
  Download, VideoPause, Microphone, Mic, Upload
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useEpisodeStore } from '@/store/episode';
import SubjectEditDialog from '@/components/AIShortDrama/SubjectEditDialog.vue';
import SubjectLibraryModal from '@/components/AIShortDrama/SubjectLibraryModal.vue';

const route = useRoute();
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
const activeLeftTab = ref('basic-settings');

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

const handleDeleteSubject = (subject: any) => {
  ElMessageBox.confirm(`确定要删除主体 "${subject.name}" 吗？项目被删除后，将不可恢复，请确认要删除吗?`, '删除主体?', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
    customClass: 'delete-confirm-dialog',
  })
    .then(() => {
      subjects.value = subjects.value.filter(s => s.id !== subject.id);
      ElMessage.success('删除成功');
    })
    .catch(() => {});
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

const timelineScenes = ref([
  { 
    id: 'scene-1',
    status: 'success', 
    video: '/dist/assets/video_ad7d18db73187a9e4ede04391370a29c.mp4', 
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600',
    duration: 6.0,
    progress: 0,
    modified: false,
    script: `画面风格和类型: 真人写实, 电影风格, 暖色调, 都市女频<br>
生成一个由以下 3 个镜头组成的视频:<br>
场景: <br>
镜头过渡: 镜头平滑切换, 从司仪转向主角, 焦点始终在舞台中央, 氛围喜庆。<br><br>
镜头1 <span class="mention-pill duration"><i class="timer-icon"></i> 6.0s</span>: 时间: 日, 场景图片: <span class="mention-pill location"><i class="location-icon"></i> 豪华酒店宴会厅_0</span>, 镜头: 中景镜头, 从舞台正下方略仰视角度拍摄, 舞台中央位置, <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=20&h=20&fit=crop" /> 司仪-基础形象</span> 手持话筒, 面带职业微笑, 他的面部朝向台下的宾客, 视线扫过全场, <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=20&h=20&fit=crop" /> 司仪-基础形象</span> 说: 「今天, 是沈家千金沈念安小姐与顾家少爷顾承泽先生的订婚之喜。」 音色: 男声, 青年音色, 音调中等, 音色明亮圆润, 声音厚度适中, 发音标准, 气息沉稳, 吐字清晰, 字正腔圆, 富有亲和力与舞台感染力。 背景是鲜花簇拥的舞台和璀璨的水晶灯。 镜头静止。<br><br>
镜头2 <span class="mention-pill duration"><i class="timer-icon"></i> 3.0s</span>: 时间: 日, 场景图片: <span class="mention-pill location"><i class="location-icon"></i> 豪华酒店宴会厅_0</span>, 镜头: 近景, 从 <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=20&h=20&fit=crop" /> 顾承泽-基础形象</span> 右侧方与角色视线平齐高度拍摄。 <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=20&h=20&fit=crop" /> 沈念安-基础形象</span> 身着纯白礼服, 挽着 <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=20&h=20&fit=crop" /> 顾承泽-基础形象</span> 的手臂, 她仰起头, 侧脸对着镜头, 面部朝向身旁的 <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=20&h=20&fit=crop" /> 顾承泽-基础形象</span>, 视线充满爱意地聚焦于他的脸庞, 脸上洋溢着幸福的笑容, <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=20&h=20&fit=crop" /> 沈念安-基础形象</span> 说: 「承泽, 我好像在做梦。」 音色: 女声, 青年音色, 音调中等偏高, 音色质感明亮、清脆, 声音清亮柔和, 发音方式干净, 气息充沛平稳, 吐字清晰, 带有一种与生俱来的温婉与真诚感。 聚光灯照在他们身上。<br><br>
镜头3 <span class="mention-pill duration"><i class="timer-icon"></i> 6.0s</span>: 时间: 日, 场景图片: <span class="mention-pill location"><i class="location-icon"></i> 豪华酒店宴会厅_0</span>, 镜头: 过肩近景, 从 <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=20&h=20&fit=crop" /> 沈念安-基础形象</span> 的背后拍摄, 焦点在 <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=20&h=20&fit=crop" /> 顾承泽-基础形象</span> 的脸上。 <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=20&h=20&fit=crop" /> 顾承泽-基础形象</span> 低下头, 温柔地凝视着 <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=20&h=20&fit=crop" /> 沈念安-基础形象</span>, 他的面部朝向 <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=20&h=20&fit=crop" /> 沈念安-基础形象</span>, 眼神专注而深情, <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=20&h=20&fit=crop" /> 顾承泽-基础形象</span> 说: 「念安, 这不是梦。从今天起, 你就是我唯一的未婚妻。」 音色: 男声, 青年音色, 音调中等, 音色质感干净但偏扁平, 声音不够厚重, 发音方式清晰, 但语速偏快且气息不稳, 尤其在紧张时会带有轻微的颤抖, 吐字清晰却缺乏力量感, 常在句末音量减弱, 给人一种底气不足的感觉。 镜头缓慢向前推进, 加强情感氛围。`
  },
  { 
    id: 'scene-2',
    status: 'pending', 
    video: null,
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600',
    duration: 4.0,
    progress: 0,
    modified: false,
    script: `镜头2 <span class="mention-pill duration"><i class="timer-icon"></i> 4.0s</span> : 时间: 日，场景图片: <span class="mention-pill location"><i class="location-icon"></i> 豪华酒店宴会厅_0</span>，镜头: 近景，从宾客的过肩视角拍摄，焦点在 <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=20&h=20&fit=crop" /> 沈母-基础形象-基础形象</span> 身上。她脸上带着得意的笑容，面部朝向面前的宾客，视线看着对方，<span class="mention-pill role"><img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=20&h=20&fit=crop" /> 沈母-基础形象-基础形象</span> 说: 「这孩子，从小就懂事，是我们沈家的骄傲。」音色: 女声，中年音色，音调中偏高，音色质感清亮、干脆，但缺乏暖意，声音偏薄，发音方式精准，气息平稳，吐字清晰，语速不快，但字与字之间没有犹豫，带有一种习惯于发号施令的、不容置疑的权威感。<br><br><span class="mention-pill role"><img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=20&h=20&fit=crop" /> 沈父-基础形象-基础形象</span> 在旁边微笑着点头附和。`
  },
]);

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
    if (timelineScenes.value[currentSceneIdx.value]) {
      timelineScenes.value[currentSceneIdx.value].modified = true;
    }
    isEditingScript.value = false;
    showMentionMenu.value = false;
    ElMessage.success('脚本已保存');
  }
};

const handleSaveScript = (data: { index: number, script: string }) => {
  if (timelineScenes.value[data.index]) {
    timelineScenes.value[data.index].script = data.script;
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
  '/dist/assets/video_ad7d18db73187a9e4ede04391370a29c.mp4',
  '/assets/video_ad7d18db73187a9e4ede04391370a29c.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
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
        timelineScenes.value[idx].video = '/dist/assets/video_ad7d18db73187a9e4ede04391370a29c.mp4';
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
  return isAllScenesGenerated.value && bgmConfig.confirmed;
});

const synthesisTooltip = computed(() => {
  if (!isAllScenesGenerated.value) return '请先生成所有分镜视频';
  if (!bgmConfig.confirmed) return '请先配置背景音乐';
  return '';
});

const handleExport = () => {
  ElMessage.success('正在准备导出数据...');
};

const handleEpisodeSwitch = (id: string) => {
  router.push({ query: { ...route.query, id } });
  ElMessage.info(`已切换至 ${episodeStore.episodes.find(e => e.id === id)?.title}`);
};

const episodeId = computed(() => route.query.id as string);
const episode = computed(() => episodeStore.episodes.find(e => e.id === episodeId.value));
const episodeNotFound = computed(() => episodeId.value && !episode.value);

const addTimelineScene = () => {
  const newId = `scene-${timelineScenes.value.length + 1}`;
  timelineScenes.value.push({
    id: newId,
    status: 'pending',
    video: null,
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600',
    duration: 5.0,
    progress: 0,
    modified: false,
    script: ''
  });
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
  });
};

onMounted(() => {
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
        synthesisStatus: 'pending'
      },
      {
        id: '2',
        index: 2,
        title: '第 2 集：重生归来',
        poster: 'https://picsum.photos/seed/2/200/300',
        roleCount: 5,
        sceneCount: 3,
        propCount: 3,
        storyboardCount: 12,
        status: 'pending',
        storyboardGenerated: false,
        duration: '00:38',
        gif: '',
        synthesisStatus: 'pending'
      }
    ]);
  }

  if (currentScript.value) {
    editor.value?.commands.setContent(currentScript.value);
  }
});
</script>

<style scoped>
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
:deep(.custom-timeline-checkbox .el-checkbox__inner) {
  width: 20px;
  height: 20px;
  border-radius: 6px;
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

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-in {
  animation: fadeIn 0.3s ease-out;
}
</style>