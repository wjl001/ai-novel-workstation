<template>
  <div class="flex h-full w-full overflow-hidden p-4 lg:p-6 gap-4 lg:gap-6 text-[#1f2329] bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] dark:from-slate-900 dark:to-slate-800 relative transition-all duration-500" :class="{'is-left-collapsed': isLeftCollapsed, 'is-right-collapsed': !isRightPanelVisible}">
    
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
      class="left-panel flex flex-col shrink-0 min-h-0 h-full transition-all duration-500 relative" 
      :style="{ width: isLeftCollapsed ? '0px' : leftPanelWidth + 'px', marginRight: isLeftCollapsed ? '0px' : '0px' }"
    >
      <div v-show="!isLeftCollapsed" class="flex flex-col h-full overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[28px] border border-white dark:border-slate-700/50 shadow-2xl shadow-slate-200/50 dark:shadow-none transition-opacity duration-500" :style="{ opacity: isLeftCollapsed ? 0 : 1 }">
        <!-- Expanded State Content -->
        <div class="flex flex-col h-full w-full min-h-0 overflow-hidden">
          <!-- Tabs -->
          <div class="h-16 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 shrink-0">
            <div class="flex bg-slate-100/50 dark:bg-slate-900/50 rounded-[18px] p-1 w-full">
              <div 
                class="flex-1 py-1.5 text-[13px] font-black cursor-pointer rounded-[14px] text-center transition-all duration-300 flex items-center justify-center gap-2"
                :class="activeLeftTab === 'basic-settings' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm scale-[1.02]' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
                @click="activeLeftTab = 'basic-settings'"
              >
                <el-icon><Setting /></el-icon> 基础设定
              </div>
              <div 
                class="flex-1 py-1.5 text-[13px] font-black cursor-pointer rounded-[14px] text-center transition-all duration-300 flex items-center justify-center gap-2"
                :class="activeLeftTab === 'episode-outline' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm scale-[1.02]' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
                @click="activeLeftTab = 'episode-outline'"
              >
                <el-icon><Document /></el-icon> 剧集大纲
              </div>
            </div>
          </div>

          <!-- 基础设定 (Basic Settings Tab) -->
          <div v-show="activeLeftTab === 'basic-settings'" class="flex-1 overflow-y-auto custom-scrollbar p-5 min-h-0 space-y-8">
            <!-- Loading skeleton -->
            <div v-if="isInfoLoading" class="space-y-6">
              <el-skeleton animated :rows="8" />
            </div>

            <div v-else class="space-y-8 animate-fade-in">
              <!-- Basic Info Card -->
              <div class="bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl p-5 space-y-6 border border-slate-100 dark:border-slate-800">
                <div class="grid grid-cols-1 gap-5">
                  <div class="space-y-2">
                    <label class="text-[14px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> 剧本类型
                    </label>
                    <el-select v-model="form.scriptType" class="modern-select-v2 w-full" placeholder="请选择剧本类型">
                      <el-option label="微短剧" value="short_drama" />
                      <el-option label="电影" value="movie" />
                      <el-option label="长篇剧集" value="long_drama" />
                    </el-select>
                  </div>

                  <div class="space-y-2">
                    <label class="text-[14px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> 题材
                    </label>
                    <el-select v-model="form.genre" class="modern-select-v2 w-full" placeholder="请选择题材">
                      <el-option v-for="item in GENRES" :key="item" :label="item" :value="item" />
                    </el-select>
                  </div>

                  <div class="space-y-2">
                    <label class="text-[14px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> 目标受众
                    </label>
                    <el-select v-model="form.targetAudience" class="modern-select-v2 w-full" placeholder="请选择目标受众">
                      <el-option v-for="item in AUDIENCES" :key="item" :label="item" :value="item" />
                    </el-select>
                  </div>

                  <div class="grid grid-cols-2 gap-8">
                    <div class="space-y-2">
                      <label class="text-[14px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> 集数
                      </label>
                      <el-input-number v-model="form.episodesCount" :min="1" :max="1000" class="modern-number-input-v2 !w-full" controls-position="right" />
                    </div>

                    <div class="space-y-2">
                      <label class="text-[14px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> 时长 (秒)
                      </label>
                      <el-input-number v-model="form.expectedDuration" :min="1" :max="10000" class="modern-number-input-v2 !w-full" controls-position="right" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- 故事背景 -->
              <div class="space-y-4">
                <div class="flex justify-between items-center group">
                  <h3 class="text-[15px] font-black flex items-center gap-2 text-slate-800 dark:text-slate-100">
                    <span class="w-1.5 h-5 bg-indigo-600 rounded-full"></span> 故事背景
                  </h3>
                  <el-popover
                    v-model:visible="aiPromptPopoverVisible['background']"
                    placement="right"
                    width="320"
                    trigger="click"
                    popper-class="modern-popover-v2"
                  >
                    <template #reference>
                      <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[12px] font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                        <el-icon><MagicStick /></el-icon> AI 优化
                      </button>
                    </template>
                    <div class="p-2 space-y-4">
                      <div class="flex items-center gap-2 text-indigo-600">
                        <el-icon><MagicStick /></el-icon>
                        <span class="text-[13px] font-black uppercase tracking-wider">AI 创作助手</span>
                      </div>
                      <el-input v-model="aiPromptInput" type="textarea" :rows="3" placeholder="描述你想要的背景细节，如：增加反转、强化冲突..." class="modern-textarea-small" />
                      <div class="flex justify-end gap-2">
                        <button @click="handleAIGenerateAction('background', 'cancel')" class="px-4 py-2 rounded-xl text-[12px] font-bold bg-slate-50 text-slate-500 hover:bg-slate-100 transition-all">取消</button>
                        <button @click="handleAIGenerateAction('background', 'append')" class="px-4 py-2 rounded-xl text-[12px] font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all">追加</button>
                        <button @click="handleAIGenerateAction('background', 'replace')" class="px-5 py-2 rounded-xl text-[12px] font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all">替换</button>
                      </div>
                    </div>
                  </el-popover>
                </div>
                <div class="relative group">
                  <el-input v-model="form.background" type="textarea" :rows="6" placeholder="描述故事发生的宏大背景..." class="modern-textarea-v3" :class="{'is-error': errors.background}" @input="validateField('background')" />
                  <div class="absolute bottom-3 right-4 px-2 py-1 rounded-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-100 dark:border-slate-700 text-[11px] font-bold shadow-sm" :class="getWordCountColor('background')">
                    {{ form.background?.length || 0 }} <span class="text-slate-300 mx-1">/</span> 200
                  </div>
                </div>
                <p v-if="errors.background" class="mt-2 text-red-500 text-[12px] font-bold flex items-center gap-1.5">
                  <el-icon><InfoFilled /></el-icon> {{ errors.background }}
                </p>
              </div>

              <!-- 故事梗概 -->
              <div class="space-y-4">
                <div class="flex justify-between items-center group">
                  <h3 class="text-[15px] font-black flex items-center gap-2 text-slate-800 dark:text-slate-100">
                    <span class="w-1.5 h-5 bg-purple-600 rounded-full"></span> 故事梗概
                  </h3>
                  <el-popover
                    v-model:visible="aiPromptPopoverVisible['synopsis']"
                    placement="right"
                    width="320"
                    trigger="click"
                    popper-class="modern-popover-v2"
                  >
                    <template #reference>
                      <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[12px] font-bold hover:bg-purple-600 hover:text-white transition-all shadow-sm">
                        <el-icon><MagicStick /></el-icon> AI 优化
                      </button>
                    </template>
                    <div class="p-2 space-y-4">
                      <div class="flex items-center gap-2 text-purple-600">
                        <el-icon><MagicStick /></el-icon>
                        <span class="text-[13px] font-black uppercase tracking-wider">AI 创作助手</span>
                      </div>
                      <el-input v-model="aiPromptInput" type="textarea" :rows="3" placeholder="描述你想要的梗概风格，如：快节奏、反转多..." class="modern-textarea-small" />
                      <div class="flex justify-end gap-2">
                        <button @click="handleAIGenerateAction('synopsis', 'cancel')" class="px-4 py-2 rounded-xl text-[12px] font-bold bg-slate-50 text-slate-500 hover:bg-slate-100 transition-all">取消</button>
                        <button @click="handleAIGenerateAction('synopsis', 'append')" class="px-4 py-2 rounded-xl text-[12px] font-bold bg-purple-50 text-purple-600 hover:bg-purple-100 transition-all">追加</button>
                        <button @click="handleAIGenerateAction('synopsis', 'replace')" class="px-5 py-2 rounded-xl text-[12px] font-bold bg-purple-600 text-white shadow-lg shadow-purple-500/20 hover:bg-purple-700 transition-all">替换</button>
                      </div>
                    </div>
                  </el-popover>
                </div>
                <div class="relative group">
                  <el-input v-model="form.synopsis" type="textarea" :rows="6" placeholder="精炼地概括故事的核心冲突与结局..." class="modern-textarea-v3" :class="{'is-error': errors.synopsis}" @input="validateField('synopsis')" />
                  <div class="absolute bottom-3 right-4 px-2 py-1 rounded-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-100 dark:border-slate-700 text-[11px] font-bold shadow-sm" :class="getWordCountColor('synopsis')">
                    {{ form.synopsis?.length || 0 }} <span class="text-slate-300 mx-1">/</span> 300
                  </div>
                </div>
                <p v-if="errors.synopsis" class="mt-2 text-red-500 text-[12px] font-bold flex items-center gap-1.5">
                  <el-icon><InfoFilled /></el-icon> {{ errors.synopsis }}
                </p>
              </div>
            </div>
          </div>

          <!-- 剧集大纲 (Episode Outline Tab) -->
          <div v-show="activeLeftTab === 'episode-outline'" class="flex-1 overflow-y-auto custom-scrollbar p-5 flex flex-col gap-5 min-h-0 animate-fade-in">
            <div class="flex items-center justify-between mb-2">
              <div class="flex flex-col">
                <span class="text-[17px] font-black text-slate-800 dark:text-white">分集列表</span>
                <span class="text-[12px] text-slate-500 font-black uppercase tracking-widest">共 {{ form.episodesData.length }} 集</span>
              </div>
              <button 
                @click="addEpisode"
                class="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[13px] font-black shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                <el-icon><Plus /></el-icon> 新增分集
              </button>
            </div>

            <!-- Draggable List -->
            <div class="flex flex-col gap-6 pb-10">
              <transition-group name="list">
                <div 
                  v-for="(ep, index) in form.episodesData" 
                  :key="ep.id"
                  class="bg-indigo-50/40 dark:bg-indigo-900/10 border-2 border-indigo-100/50 dark:border-indigo-500/20 rounded-2xl p-6 shadow-md hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-1 transition-all duration-300 group relative cursor-move border-l-[6px] border-l-indigo-500"
                  draggable="true"
                  @dragstart="onDragStartEpisode($event, index)"
                  @dragover.prevent
                  @drop="onDropEpisode($event, index)"
                >
                  <!-- Drag Handle Indicator -->
                  <div class="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-300">
                    <el-icon :size="16"><MoreFilled class="rotate-90" /></el-icon>
                  </div>

                  <div class="flex justify-between items-center mb-5 pl-2 -mx-6 -mt-6 p-4 bg-white/40 dark:bg-slate-800/40 border-b border-indigo-100/50 dark:border-indigo-500/10 rounded-tr-2xl backdrop-blur-md">
                    <div class="flex items-center gap-2">
                      <div class="w-1.5 h-6 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full mr-1.5"></div>
                      <span class="text-[18px] font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                        第 {{ index + 1 }} 集
                      </span>
                    </div>
                    <button 
                      @click="removeEpisode(index)"
                      class="w-9 h-9 flex items-center justify-center rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <el-icon :size="20"><Delete /></el-icon>
                    </button>
                  </div>

                  <div class="space-y-5 pl-2">
                    <div class="space-y-2">
                      <label class="text-[12px] font-black text-indigo-400 dark:text-indigo-300 uppercase tracking-wider">剧情梗概</label>
                      <el-input v-model="ep.summary" type="textarea" :rows="3" placeholder="这一集讲了什么？" class="modern-textarea-v3" />
                    </div>
                    <div class="grid grid-cols-1 gap-4">
                      <div class="space-y-2">
                        <label class="text-[12px] font-black text-indigo-400 dark:text-indigo-300 uppercase tracking-wider">核心场景</label>
                        <el-input v-model="ep.scenes" placeholder="地点、时间..." class="modern-input-v3" prefix-icon="Location" />
                      </div>
                      <div class="space-y-2">
                        <label class="text-[12px] font-black text-indigo-400 dark:text-indigo-300 uppercase tracking-wider">登场角色</label>
                        <el-input v-model="ep.characters" placeholder="谁在这一集出现？" class="modern-input-v3" prefix-icon="User" />
                      </div>
                    </div>
                  </div>
                </div>
              </transition-group>

              <div v-if="form.episodesData.length === 0" class="py-20 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[32px] text-slate-400">
                <el-icon size="48" class="opacity-20 mb-4"><Document /></el-icon>
                <p class="font-black text-base">暂无剧集大纲</p>
                <p class="text-[12px] mt-1 opacity-60">点击上方按钮开始规划你的故事</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Left Panel Floating Collapse Toggle (Consistent with Right) -->
      <div 
        class="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-16 flex items-center justify-center cursor-pointer z-[100] group"
        @click="isLeftCollapsed = !isLeftCollapsed"
      >
        <div class="absolute inset-0 bg-white dark:bg-slate-800 shadow-[0_4px_20px_rgba(99,102,241,0.2)] rounded-full border border-indigo-100 dark:border-indigo-900/50 transition-all duration-300 group-hover:scale-y-110 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30"></div>
        <el-icon class="relative z-10 text-indigo-500 group-hover:text-indigo-700 transition-all duration-300" :size="16">
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
    <div class="right-panel flex-1 flex gap-4 lg:gap-6 h-full min-h-0 overflow-hidden transition-all duration-500">
      
      <!-- Central Canvas (Tiptap Script Body) -->
      <div class="flex-1 flex flex-col h-full min-h-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-[28px] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-700/50 overflow-hidden relative group">
        
        <!-- Canvas Toolbar -->
        <div class="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700/50 shrink-0 bg-white/50 dark:bg-slate-800/50">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <el-icon :size="20"><Edit /></el-icon>
            </div>
            <div>
              <h3 class="text-[18px] font-black text-slate-800 dark:text-white flex items-center gap-2">
                剧本正文
              </h3>
              <p class="text-[12px] text-slate-500 font-black uppercase tracking-widest mt-0.5">剧本正文编辑</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
              <transition name="fade">
                <button 
                  v-if="editorTextContent"
                  @click="saveScriptContent"
                  class="flex items-center gap-2 px-4 py-1.5 rounded-xl text-[13px] font-black transition-all duration-300 border shadow-sm"
                  :class="!isEditingLocked ? 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700' : 'bg-white dark:bg-slate-700 text-slate-500 border-slate-100 dark:border-slate-600 hover:text-indigo-600'"
                >
                  <template v-if="!isSavingScript">
                    <el-icon><Edit v-if="isEditingLocked" /><Check v-else /></el-icon>
                    {{ isEditingLocked ? '编辑剧本' : '保存剧本' }}
                  </template>
                  <template v-else>
                    <el-icon class="animate-spin"><Loading /></el-icon>
                    保存中...
                  </template>
                </button>
              </transition>

              <!-- Episode Selector -->
              <div class="flex items-center gap-2 mr-4 bg-slate-100/50 dark:bg-slate-700/50 p-1 rounded-xl">
              <div 
                v-for="mode in ['full', 'episode']" 
                :key="mode"
                class="px-4 py-1.5 rounded-lg text-[13px] font-black cursor-pointer transition-all duration-300"
                :class="editMode === mode ? 'bg-white dark:bg-slate-600 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
                @click="editMode = mode as 'full' | 'episode'"
              >
                {{ mode === 'full' ? '全集' : '分集' }}
              </div>
            </div>

            <el-select 
              v-if="editMode === 'episode'" 
              v-model="currentEpisodeIndex" 
              class="modern-select-v2 !w-32 mr-2" 
              placeholder="选择分集"
            >
              <el-option 
                v-for="(ep, idx) in form.episodesData" 
                :key="ep.id" 
                :label="`第 ${idx + 1} 集`" 
                :value="idx" 
              />
            </el-select>
          </div>
        </div>

        <!-- Canvas Main Body -->
        <div class="flex-1 min-h-0 relative bg-[#FDFDFD] dark:bg-slate-900/30 flex flex-col">
          <!-- Tiptap Editor Wrapper -->
          <div 
            class="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10"
            @contextmenu.prevent="openContextMenu"
            ref="scriptBodyRef"
          >
            <div class="min-h-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-[32px] shadow-sm relative overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-indigo-500/5">
              <!-- Selection Bubble Menu -->
              <bubble-menu 
                v-if="tiptapEditor" 
:editor="tiptapEditor as any"
                :tippy-options="{ duration: 100, zIndex: 9999 }"
                class="flex items-center gap-1 p-1 bg-white dark:bg-slate-800 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-slate-700 overflow-hidden"
              >
                <button 
                  @click="quoteSelectedText"
                  class="flex items-center gap-2 px-3 py-1.5 hover:bg-indigo-600 hover:text-white rounded-lg transition-all duration-300 group"
                >
                  <el-icon :size="14"><ChatLineSquare /></el-icon>
                  <span class="text-[12px] font-black">引用至 AI 助手</span>
                </button>
              </bubble-menu>

              <!-- Editor Content -->
              <editor-content v-if="tiptapEditor" :editor="tiptapEditor as any" class="p-10 lg:p-14 outline-none min-h-[500px] prose-modern" />

              <!-- Empty State -->
              <transition name="fade">
                <div v-if="!isGenerating && !editorTextContent && showEmptyPlaceholder" class="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-md z-10 p-10 text-center">
                  <div class="w-24 h-24 rounded-[40px] bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-900 flex items-center justify-center text-indigo-200 dark:text-indigo-900/30 mb-8 border border-white dark:border-slate-700 shadow-inner animate-float">
                    <el-icon size="48"><Document /></el-icon>
                  </div>
                  <h4 class="text-2xl font-black text-slate-800 dark:text-white mb-3">剧本还是一片空白</h4>
                  <p class="mb-10 text-slate-400 font-medium max-w-sm">
                    万事开头难，不如让 AI 助手根据你的大纲，为你创作一个精彩的开场？
                  </p>
                  <div class="flex items-center gap-6">
                    <button 
                      @click="generateScriptBody"
                      class="h-14 px-10 bg-indigo-600 text-white rounded-[20px] text-[15px] font-black shadow-2xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                    >
                      <el-icon><MagicStick /></el-icon> 
                      {{ editMode === 'full' ? '一键全集智能生成' : `第 ${currentEpisodeIndex + 1} 集智能生成` }}
                    </button>
                    <button 
                      @click="showEmptyPlaceholder = false"
                      class="h-14 px-10 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 border border-slate-100 dark:border-slate-600 rounded-[20px] text-[15px] font-black hover:bg-slate-50 dark:hover:bg-slate-600 transition-all flex items-center gap-3"
                    >
                      <el-icon><Edit /></el-icon> 我要自己写
                    </button>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>

        <!-- Tiptap Footer Stats -->
        <div class="h-14 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between px-6 text-[13px] font-black text-slate-500 bg-white dark:bg-slate-800 shrink-0">
          <div class="flex items-center gap-6 uppercase tracking-widest">
            <span class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> 字数: {{ tiptapEditor?.storage.characterCount.characters() || 0 }}</span>
            <span class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span> 预计阅读: {{ Math.ceil((tiptapEditor?.storage.characterCount.words() || 0) / 250) }} 分钟</span>
          </div>
          <div class="flex items-center gap-3">
            <button @click="tiptapEditor?.commands.undo()" class="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all">
              <el-icon :size="16"><RefreshLeft /></el-icon>
            </button>
            <button @click="tiptapEditor?.commands.redo()" class="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all">
              <el-icon :size="16"><RefreshRight /></el-icon>
            </button>
          </div>
        </div>

        <!-- Action Footer -->
        <div class="flex justify-end items-center p-6 border-t border-slate-100 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shrink-0 gap-4">
          <div v-if="isGenerating" class="flex items-center gap-4 text-indigo-600 dark:text-indigo-400 text-[13px] mr-auto bg-indigo-50 dark:bg-indigo-900/30 px-5 py-2.5 rounded-2xl font-black animate-pulse">
            <el-icon class="is-loading" v-if="!isPaused"><Loading /></el-icon> 
            <span>{{ isPaused ? '生成已暂停' : 'AI 正在全力构思中...' }}</span>
            <button 
              @click="isPaused = !isPaused" 
              class="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 rounded-lg text-indigo-600 shadow-sm hover:scale-105 active:scale-95 transition-all"
            >
              <el-icon><VideoPause v-if="!isPaused"/><VideoPlay v-else/></el-icon> 
              {{ isPaused ? '继续' : '暂停' }}
            </button>
          </div>

          <button 
            v-if="!isGenerating" 
            @click="generateScriptBody"
            class="h-12 px-8 bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl text-[14px] font-black hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all flex items-center gap-2"
          >
            <el-icon v-if="!editorTextContent"><MagicStick /></el-icon>
            <el-icon v-else><Refresh /></el-icon>
            {{ editorTextContent ? '不满意？重来' : (editMode === 'full' ? '帮我写全集' : `帮我写第 ${currentEpisodeIndex + 1} 集`) }}
          </button>

          <button 
            @click="goToSubjectSettings"
            :disabled="isSavingScript"
            class="h-12 px-10 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl text-[14px] font-black shadow-xl shadow-indigo-500/20 hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center gap-2"
          >
            <el-icon v-if="isSavingScript" class="is-loading"><Loading /></el-icon>
            <span>完成，去设置主体</span>
            <el-icon v-if="!isSavingScript"><ArrowRight /></el-icon>
          </button>
        </div>
      </div>

      <!-- Right Properties Panel (AI Assistant) -->
      <div 
        class="shrink-0 flex flex-col h-full min-h-0 transition-all duration-500 relative" 
        :style="{ width: isRightPanelVisible ? '360px' : '0px', marginLeft: isRightPanelVisible ? '0px' : '0px' }"
      >
        <div v-show="isRightPanelVisible" class="flex flex-col h-full overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[28px] border border-white dark:border-slate-700/50 shadow-2xl shadow-slate-200/50 dark:shadow-none transition-opacity duration-500" :style="{ opacity: isRightPanelVisible ? 1 : 0 }">
          <div class="h-16 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <el-icon><MagicStick /></el-icon>
              </div>
              <span class="font-black text-[15px] text-slate-800 dark:text-white">AI 智能助手</span>
            </div>
            <div class="flex gap-2">
              <button class="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-slate-500 transition-colors"><el-icon><Setting /></el-icon></button>
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
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assistant</span>
                </div>
                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none shadow-sm text-[13px] leading-relaxed text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700/50 max-w-[90%]">
                  你好！我是你的专属 AI 创作助手。我已经准备好帮你打磨剧本、丰富情节或者提供灵感了。
                </div>
              </div>

              <!-- Shared Chat logs -->
              <transition-group name="chat">
                <!-- AI Proposal / Comparison Card -->
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
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ msg.role === 'ai' ? 'Assistant' : 'You' }}</span>
                  </div>
                  <div 
                    class="p-4 rounded-2xl text-[13px] leading-relaxed max-w-[90%] break-words shadow-sm border transition-all"
                    :class="msg.role === 'ai' 
                      ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-100 dark:border-slate-700/50 rounded-tl-none' 
                      : 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none shadow-indigo-500/10'"
                  >
                    {{ msg.content }}
                    <span v-if="msg.isGenerating" class="inline-block w-1 h-4 bg-indigo-300 animate-pulse ml-1 align-middle"></span>
                  </div>
                </div>
              </transition-group>
            </div>
            
            <!-- Chat Input Area -->
            <div class="mt-auto shrink-0 p-5 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700/50">
              <!-- AI Action Buttons -->
              <div class="grid grid-cols-4 gap-2 mb-4">
                <div v-for="action in [{n:'续写', i:Edit}, {n:'润色', i:MagicStick}, {n:'扩写', i:DocumentAdd}, {n:'改写', i:Refresh}]" 
                     :key="action.n"
                     @click="applyAIAction(action.n)"
                     class="flex flex-col items-center gap-1.5 cursor-pointer group/item"
                >
                  <div class="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover/item:bg-indigo-600 group-hover/item:text-white transition-all duration-300 shadow-sm">
                    <el-icon :size="18"><component :is="action.i" /></el-icon>
                  </div>
                  <span class="text-[11px] font-black text-slate-500 group-hover/item:text-indigo-600 transition-colors">{{ action.n }}</span>
                </div>
              </div>

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

              <div class="relative group/input">
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
              <div class="flex flex-wrap items-center justify-center gap-2 mt-4 py-1">
                <button v-for="tag in ['优化对话', '增加冲突', '情感渲染', '五感填充', '内容升华', '增加反差']" :key="tag" 
                        @click="applyAIAction(tag)"
                        class="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-700 text-[11px] font-black text-slate-500 dark:text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30 transition-all border border-slate-100 dark:border-slate-600 shadow-sm hover:shadow-md">
                  {{ tag }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel Floating Collapse Toggle (Consistent with Left) -->
        <div 
          class="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-16 flex items-center justify-center cursor-pointer z-[100] group"
          @click="isRightPanelVisible = !isRightPanelVisible"
        >
          <div class="absolute inset-0 bg-white dark:bg-slate-800 shadow-[0_4px_20px_rgba(99,102,241,0.2)] rounded-full border border-indigo-100 dark:border-indigo-900/50 transition-all duration-300 group-hover:scale-y-110 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30"></div>
          <el-icon class="relative z-10 text-indigo-500 group-hover:text-indigo-700 transition-all duration-300" :size="16">
            <ArrowLeft v-if="isRightPanelVisible" />
            <ArrowRight v-else />
          </el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useDramaStore } from '../../store/drama';
import { 
  MagicStick, Refresh, Edit, Plus, Delete, Check, Loading, 
  ArrowLeft, ArrowRight, Document, Setting, ArrowDown, 
  Expand, Fold, VideoPause, VideoPlay, User, 
  RefreshLeft, RefreshRight, DocumentAdd, Top, InfoFilled,
  Location, MoreFilled, ChatLineSquare, Close, Lock
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { Editor, EditorContent, BubbleMenu } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import CharacterCount from '@tiptap/extension-character-count';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';

const router = useRouter();
const dramaStore = useDramaStore();

const GENRES = ['古装权谋', '民国谍战', '都市情感', '科幻未来', '草根逆袭', '历史战争', '越狱风云', '揭竿而起'];
const AUDIENCES = ['热血青年', '大众向', '男性向', '女性向', '青少年', '中老年', '二次元'];

// State
const isInfoLoading = ref(true);
const isGenerating = ref(false);
const isPaused = ref(false);
const isSavingScript = ref(false);

const editMode = ref<'full' | 'episode'>('full');
const currentEpisodeIndex = ref(0);

// Form Data
const form = reactive({
  title: '',
  scriptType: '',
  genre: '',
  targetAudience: '',
  episodesCount: null as number | null,
  expectedDuration: null as number | null,
  synopsis: '',
  background: '',
  fullContent: '',
  episodesData: [] as any[]
});

const errors = reactive<Record<string, string>>({});

// Use a flag to avoid infinite loops when switching content
const isSwitchingContent = ref(false);

const saveCurrentContentToStore = () => {
  if (isSwitchingContent.value || !tiptapEditor.value) return;
  const content = tiptapEditor.value.getHTML();
  if (editMode.value === 'full') {
    form.fullContent = content;
  } else if (form.episodesData[currentEpisodeIndex.value]) {
    form.episodesData[currentEpisodeIndex.value].content = content;
  }
  // Sync to Pinia store for cross-route persistence
  dramaStore.setOutlineData(JSON.parse(JSON.stringify(form)));
};

const loadContentFromStore = () => {
  if (!tiptapEditor.value) return;
  isSwitchingContent.value = true;
  let content = '';
  if (editMode.value === 'full') {
    content = form.fullContent || '';
  } else if (form.episodesData[currentEpisodeIndex.value]) {
    content = form.episodesData[currentEpisodeIndex.value].content || '';
  }
  tiptapEditor.value.commands.setContent(content);
  editorTextContent.value = tiptapEditor.value.getText().trim();
  // If the new content is empty, we might want to show the placeholder again
  if (!editorTextContent.value) {
    showEmptyPlaceholder.value = true;
  }
  isSwitchingContent.value = false;
};

// Add watch for other form fields to ensure they are also persisted to Pinia
watch(form, (newForm) => {
  dramaStore.setOutlineData(JSON.parse(JSON.stringify(newForm)));
}, { deep: true });

// Watch for mode or episode changes
watch([editMode, currentEpisodeIndex], (newVal, oldVal) => {
  loadContentFromStore();
});

const saveScriptContent = () => {
  if (!isEditingLocked.value) {
    isSavingScript.value = true;
    setTimeout(() => {
      isSavingScript.value = false;
      isEditingLocked.value = true; // Lock after saving
      ElMessage.success('剧本保存成功');
    }, 600);
  } else {
    isEditingLocked.value = false; // Unlock for editing
  }
};

const goToSubjectSettings = () => {
  isSavingScript.value = true;
  // Sync current content before leaving
  saveCurrentContentToStore();
  
  setTimeout(() => {
    isSavingScript.value = false;
    ElMessage.success('正在前往主体设置...');
    router.push('/ai-short-drama-creator/assets');
  }, 500);
};

const validateField = (field: string) => {
  if (field === 'background') {
    if (form.background.length > 200) {
      errors.background = '故事背景不能超过200字';
    } else {
      errors.background = '';
    }
  }
  if (field === 'synopsis') {
    if (form.synopsis.length > 300) {
      errors.synopsis = '故事梗概不能超过300字';
    } else {
      errors.synopsis = '';
    }
  }
};

const getWordCountColor = (field: string) => {
  const value = form[field as keyof typeof form];
  const length = typeof value === 'string' ? value.length : 0;
  if (field === 'background') return length > 200 ? 'text-red-500' : 'text-slate-400';
  if (field === 'synopsis') return length > 300 ? 'text-red-500' : 'text-slate-400';
  return 'text-slate-400';
};

const applyAIAction = (actionName: string) => {
  contextMenuVisible.value = false;
  if (!tiptapEditor.value) return;

  const { from, to } = tiptapEditor.value.state.selection;
  const selectedText = tiptapEditor.value.state.doc.textBetween(from, to, ' ');
  
  // Use quotedText if it's set and no new selection is made, or use current selection
  const sourceText = selectedText.trim() || quotedText.value;

  // Combine tag action with manual input if exists
  const fullPrompt = aiPromptInput.value.trim() 
    ? `${actionName}：${aiPromptInput.value.trim()}`
    : actionName;

  // Initialize proposal state
  aiProposal.isActive = true;
  aiProposal.isGenerating = true;
  aiProposal.action = fullPrompt;
  aiProposal.original = sourceText;
  aiProposal.modified = '';
  aiProposal.selection = { from, to };

  // Clear quote and input after use
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

  // Mock AI generation insertion
  let i = 0;
  const mockText = sourceText
    ? `此时，沈念安深吸一口气，雨水混合着泪水流下面庞。她缓缓抬起头，迎向那道深邃的目光。每一个毛孔似乎都在颤栗，但她的脊背挺得笔直，像是要在这一场绝望的暴雨中开出一朵带刺的玫瑰。`
    : `劳斯莱斯的车门缓缓打开，一个黑影撑着伞走下车，伞尖滴落的水珠在雨幕中划出冰冷的弧线。沈念安看着那双锃亮的皮鞋停在自己面前，听到了一个低沉且富有磁性的声音。`;

  const interval = setInterval(() => {
    aiProposal.modified += mockText.charAt(i);
    i++;
    if (i >= mockText.length) {
      clearInterval(interval);
      aiProposal.isGenerating = false;
      ElMessage.success(`AI ${actionName} 已构思完成，请查看对比`);
    }
  }, 25);
};

const acceptAIProposal = () => {
  if (tiptapEditor.value && aiProposal.isActive) {
    const { from, to } = aiProposal.selection;
    // Replace selected range with modified content
    tiptapEditor.value.commands.insertContentAt({ from, to }, aiProposal.modified);
    aiProposal.isActive = false;
    ElMessage.success('已应用 AI 建议到剧本');
  }
};

const rejectAIProposal = () => {
  aiProposal.isActive = false;
  ElMessage.info('已放弃 AI 建议');
};

const isLeftCollapsed = ref(false);
const isRightPanelVisible = ref(true);
const activeLeftTab = ref('basic-settings');
const leftPanelWidth = ref(320);
const tiptapEditor = ref<Editor | null>(null);
const editorTextContent = ref('');
const showEmptyPlaceholder = ref(true);
const chatMessages = ref<{id: string, role: 'ai'|'user', content: string, isGenerating?: boolean}[]>([]);
const aiPromptPopoverVisible = ref<Record<string, boolean>>({});
const aiPromptInput = ref('');
const quotedText = ref('');
const isEditingLocked = ref(true);

// AI Proposal State
const aiProposal = reactive({
  isActive: false,
  original: '',
  modified: '',
  action: '',
  selection: { from: 0, to: 0 },
  isGenerating: false
});

// Context Menu State
const contextMenuVisible = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);

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
    setTimeout(() => {
      resolve({
        title: '沈念安的重生',
        scriptType: 'short_drama',
        genre: '都市情感',
        targetAudience: '女性向',
        episodesCount: 3,
        expectedDuration: 120,
        synopsis: '沈念安本以为订婚是幸福的开始，却在订婚宴上遭遇妹妹沈薇薇怀了未婚夫顾承泽孩子的重击。随后被沈家父母以养女身份驱逐，甚至工作室也被查封。在大雨中，神秘人周助理和他的先生出现在她面前，开启了她的逆袭之路。',
        background: '豪门沈家，表面风光无限。沈念安作为沈家养女，多年来小心翼翼，本以为能通过与顾家的联姻获得真正的家庭归属感。然而，这一切都在沈家亲生女儿沈薇薇回国后化为泡影。在金钱与亲情的博弈中，沈念安成了被抛弃的棋子。',
        fullContent: '',
        episodesData: [
          { id: 'p1', title: '第一集', summary: '订婚宴上，沈薇薇突然闯入并宣布怀了姐夫顾承泽的孩子，全场震惊，沈念安的世界崩塌。', scenes: '豪华酒店宴会厅', characters: '沈念安, 顾承泽, 沈薇薇, 沈母, 沈父, 司仪', content: '' },
          { id: 'p2', title: '第二集', summary: '沈家父母偏袒亲生女儿沈薇薇，当众羞辱沈念安是养女并撕毁其致辞，亲情彻底决裂。', scenes: '豪华酒店宴会厅', characters: '沈念安, 顾承泽, 沈薇薇, 沈母, 沈父', content: '' },
          { id: 'p3', title: '第三集', summary: '沈念安被保安驱逐，发现工作室被查封，在暴雨中绝望等死时遇到神秘劳斯莱斯。', scenes: '酒店门口, 街道, 工作室', characters: '沈念安, 周助理, 神秘先生', content: '' }
        ]
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

  tiptapEditor.value = new Editor({
    extensions: [
      StarterKit,
      CharacterCount.configure({ limit: 50000 }),
      BubbleMenuExtension.configure({
        element: document.querySelector('.bubble-menu-element') as HTMLElement,
      })
    ],
    content: '',
    onUpdate: ({ editor }) => {
      editorTextContent.value = editor.getText().trim();
      saveCurrentContentToStore();
    },
    editorProps: {
      attributes: {
        class: 'prose-modern focus:outline-none'
      },
      editable: () => !isEditingLocked.value
    }
  });

  // Watch for lock status to update editor
  watch(isEditingLocked, (locked) => {
    tiptapEditor.value?.setEditable(!locked);
  });

  isInfoLoading.value = true;
  // Load from Pinia store if available (survives route changes but not refresh)
  if (dramaStore.outlineData) {
    Object.assign(form, dramaStore.outlineData);
    // After loading, update the editor content
    loadContentFromStore();
  } else {
    const data: any = await fetchAutoPrefillInfo();
    Object.assign(form, data);
    // Initially update Pinia store
    dramaStore.setOutlineData({ ...form });
  }
  isInfoLoading.value = false;
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
  document.removeEventListener('click', closeContextMenu);
  if (tiptapEditor.value) {
    tiptapEditor.value.destroy();
  }
});

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
    if (field === 'synopsis') form.synopsis = mockResponse;
    if (field === 'background') form.background = mockResponse;
  } else {
    if (field === 'synopsis') form.synopsis += '\n' + mockResponse;
    if (field === 'background') form.background += '\n' + mockResponse;
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

const addEpisode = () => {
  form.episodesData.push({ id: Date.now().toString(), summary: '', scenes: '', characters: '', content: '' });
};
const removeEpisode = (index: number) => {
  form.episodesData.splice(index, 1);
};

let draggedIndex = -1;
const onDragStartEpisode = (e: DragEvent, index: number) => { draggedIndex = index; };
const onDropEpisode = (e: DragEvent, index: number) => {
  if (draggedIndex === -1 || draggedIndex === index) return;
  const item = form.episodesData.splice(draggedIndex, 1)[0];
  form.episodesData.splice(index, 0, item);
  draggedIndex = -1;
};

const generateScriptBody = () => {
  isGenerating.value = true;
  isPaused.value = false;
  
  let i = 0;
  let mockText = '';

  const EPISODE_SCRIPTS: Record<number, string> = {
    0: `第1集 \n 1-1 日 内 豪华酒店宴会厅 \n 人物：沈念安, 顾承泽, 沈薇薇, 沈母, 沈父, 宾客若干, 司仪 \n △宴会厅内鲜花簇拥，水晶灯璀璨夺目，宾客们衣着华丽，举杯交谈。 \n △舞台中央，司仪手持话筒，面带微笑。 \n 司仪：今天，是沈家千金沈念安小姐与顾家少爷顾承泽先生的订婚之喜。 \n △聚光灯下，沈念安身着一袭纯白礼服，挽着顾承泽的手臂，脸上洋溢着幸福的笑容。 \n 沈念安（含情脉脉）：承泽，我好像在做梦。 \n 顾承泽（温柔凝视）：念安，这不是梦。从今天起，你就是我唯一的未婚妻。 \n △台下，沈父沈母满面春风地接受着宾客的祝贺。 \n 宾客甲：沈总，沈夫人，恭喜啊！念安真是越来越出色了！ \n 沈母（得意）：这孩子，从小就懂事，是我们沈家的骄傲。 \n △沈念安看着台下为她祝福的亲友，眼眶微湿，充满了对未来的憧憬。 \n 沈念安OS：二十年了，我终于要嫁给最爱的人，拥有自己的家了。 \n △突然，宴会厅的大门被人猛地推开，发出一声巨响。 \n △音乐戛然而止，所有人的目光都被吸引过去。 \n △沈薇薇衣衫不整，头发凌乱地冲了进来，妆容哭花了，看起来狼狈不堪。 \n 沈薇薇（凄厉哭喊）：承泽哥！ \n △宾客们纷纷避让，窃窃私语。 \n 宾客乙：那不是沈家的小女儿沈薇薇吗？她这是怎么了？ \n 宾客丙：看样子是来砸场子的啊！ \n △沈念安脸上的笑容僵住。 \n 沈念安（错愕）：薇薇？ \n △沈母和沈父脸色大变，立刻上前试图阻拦。 \n 沈母（厉声）：沈薇薇！你疯了吗！滚出去！ \n 沈父：保安！保安在哪里！ \n △沈薇薇不管不顾，一把推开父母，跌跌撞撞地冲向舞台。 \n △她扑到顾承泽面前，死死抓住他的手臂。 \n 沈薇薇（泣不成声）：承泽哥…… \n 顾承泽（慌乱，试图推开她）：薇薇，你冷静点！有什么事我们回家再说！ \n 沈薇薇（抬头，泪眼婆娑地看着沈念安）：姐姐，对不起…… \n △沈薇薇一手抚上自己的小腹，声音颤抖却清晰地传遍整个宴会厅。 \n 沈薇薇（哭着宣布）：我……我怀了承泽哥的孩子！ \n △话音落下，全场瞬间陷入一片死寂。 \n △宾客们倒吸一口凉气，现场瞬间炸开了锅。 \n 宾客甲：天合！我没听错吧？妹妹怀了姐夫的孩子？ \n 宾客乙：这……这简直是豪门丑闻啊！ \n △沈念安如遭雷击，浑身冰冷，大脑一片空白。她难以置信地看着顾承泽，又看看哭倒在他怀里的妹妹。 \n 沈念安（声音发颤）：承泽……她说的，是真的吗？ \n △顾承泽眼神躲闪，嘴唇翕动，却一个字都说不出来。 \n △沈薇薇见状，哭得更凶了。 \n 沈薇薇（紧紧抱着顾承澤）：承泽哥，你告诉姐姐，我们是真心相爱的！你快告诉她啊！ \n △特写镜头，沈念安脸上的笑容彻底凝固，眼中所有的光芒瞬间熄灭，世界在她眼前崩塌。`,
    1: `第2集 \n 2-1 日 内 豪华酒店宴会厅 \n 人物：沈念安, 顾承泽, 沈薇薇, 沈母, 沈父, 宾客若干 \n △聚光灯下，沈念安脸色煞白，身体微微颤抖，紧紧盯着顾承泽。 \n △全场的宾客都在窃窃私语，指指点点。 \n 宾客甲：这下有好戏看了，未婚夫搞大了小姨子的肚子。 \n 宾客乙：沈家这脸可丢大了。 \n 沈念安（声音颤抖）：承泽，你说话啊！她说的……是不是真的？ \n △顾承泽的眼神躲闪，不敢直视沈念安，愧疚地低下了头。 \n △这无声的沉默，像一把最锋利的刀，狠狠刺进沈念安的心脏。 \n 沈念安（绝望地后退一步）：所以……是真的。 \n △沈薇薇见状，哭着抱紧顾承泽。 \n 沈薇薇（抽泣）：姐姐，你不要怪承泽哥，都是我的错！我们是真心相爱的…… \n △沈母和沈父脸色铁青，快步冲上舞台。 \n △沈念安以为他们是来安慰自己的，眼中燃起一丝希望。 \n 沈念安（哽咽）：妈…… \n △沈母却看也不看她，径直走到她面前，扬手就想打她。 \n △顾承泽下意识地挡了一下。 \n 顾承泽：阿姨，别…… \n 沈母（怒不可遏，指着沈念安的鼻子）：你还有脸哭！你这个白眼狼！ \n 沈念安（难以置信）：妈，你说什么？ \n 沈母（尖声）：我们沈家养了你二十年，好吃好喝地供着你，你就是这么回报我们的？占着薇薇的位置不说，现在还想毁了薇薇的幸福！ \n 沈父（附和，满脸嫌恶）：念安，你怎么这么不懂事！薇薇才是我们的亲生女儿！你一个养女，有什么资格跟她争！ \n 沈念安（心如刀绞）：爸，妈……我也是你们的女儿啊！ \n 沈母（冷笑）：女儿？你配吗？你不过是我们沈家养的一条狗！现在竟然还想鸠占鹊巢！ \n △沈念安踉跄着，手里紧紧攥着为订婚准备的致辞稿，那是她熬了好几个通宵，写满了对未来憧憬的文字。 \n △沈母的视线落在稿纸上，眼中闪过一丝狠毒。 \n △她一把抢过沈念安手中的致辞稿。 \n 沈念安（惊慌）：妈，你干什么！还给我！ \n △沈母看也不看，当着所有人的面，将稿纸“撕拉”一声撕成两半，然后疯狂地撕扯，直到变成一堆碎片。 \n 沈母（咬牙切齿）：你的幸福？你的未来？你也配！ \n △沈母扬起手，将满手的纸屑，狠狠地砸在沈念安的脸上，身上。 \n △纸屑纷飞，像一场绝望的雪，将沈念安彻底淹没。 \n 沈母（指着她，对众人宣布）：我们沈家，没有你这种不知感恩、丢人现眼的东西！`,
    2: `第3集 \n 3-1 夜 内 豪华酒店宴会厅 \n 人物：沈念安, 沈母, 顾承泽, 沈薇薇, 沈父, 保安2名, 宾客若干 \n △沈母指着沈念安，脸上满是鄙夷和厌恶。 \n 沈母（对保安厉声）：还愣着干什么！把这个丢人现眼的东西给我扔出去！ \n △两名保安立刻上前，一左一右架住沈念安的胳膊。 \n 沈念安（挣扎，难以置信地看向沈父）：爸！ \n △沈父眼神躲闪，转过头去，不敢看她。 \n 沈念安（心碎地望向顾承泽）：承泽……救我…… \n △顾承泽嘴唇动了动，最终只是痛苦地闭上眼。 \n 顾承泽（低声）：念安，对不起。 \n △沈薇薇靠在顾承泽怀里，嘴角勾起一抹得意的冷笑，眼中却还挂着泪。 \n 沈薇薇（啜泣）：姐姐，你别怪我们，要怪就怪你……不该占着不属于你的东西。 \n 沈念安（绝望大笑）：不属于我的？哈哈哈哈…… \n △保安不再迟疑，用力拖拽着沈念安往外走。 \n △沈念安的挣扎在他们看来微不足道。 \n △“撕拉”一声，她身上华美的纯白礼服，在粗暴的拉扯中被撕开一道长长的口子。 \n △宾客们纷纷避让，对着她指指点点，满是嘲讽和看戏的目光。 \n 宾客甲：真是活该，一个养女还真把自己当凤凰了。 \n 宾客乙：这下好了，被赶出去了吧，一无所有。 \n △沈念安被拖过长长的走廊，像一件被丢弃的垃圾，最后被狠狠地推出了酒店大门。 \n \n 3-2 夜 外 沈家大门/街道（大雨） \n 人物：沈念安 \n △沈念安被保安粗暴地推倒在地，摔在冰冷的石阶上。 \n △身后，沈家大门“砰”的一声，决绝地关上了。 \n △天空突然划过一道闪电，紧接着，倾盆大雨瞬间落下。 \n △冰冷的雨水疯狂地浇在她身上，撕裂的礼服紧紧贴着皮肤，狼狈不堪。 \n △她赤着脚，麻木地从地上站起来，雨水混合着泪水，模糊了她的视线。 \n △她漫无目的地走在空无一人的街道上，身无分文，无处可去。 \n △一辆跑车飞驰而过，溅起一大片污水，将她淋得更加透彻。 \n 沈念安OS：二十年的家，二十年的爱人，原来都是假的。 \n △她踉踉跄跄地走着，心中只剩下一个念头，一个最后的避风港。 \n △她来到一栋小楼前，抬头看去，牌子上写着“念安设计工作室”。 \n △这是她亲手创立，倾注了所有心血的地方。 \n △她颤抖着手，想从破碎的礼服口袋里找钥匙，却摸了个空。 \n △她的目光落在工作室的大门上，瞳孔骤然紧缩。 \n △门上，一张白色的封条赫然在目，上面“沈氏集团查封”的字样，在雨中显得格外刺眼。 \n 沈念安（喃喃自语）：连这里……也被收走了吗…… \n △她伸出手，轻轻触摸着那冰冷的封条，仿佛那是压垮她的最后一根稻草。 \n △沈念安再也支撑不住，沿着墙壁缓缓滑落在地。 \n △她蜷缩在角落里，任由雨水冲刷，眼神空洞，仿佛失去了所有灵魂。 \n △就在这时，一辆黑色的劳斯莱斯悄无悄无声息地停在她面前。 \n △车窗缓缓降下，露出一张轮廓分明的侧脸。 \n 周助理VO（恭敬）：先生，就是她。 \n △沈念安缓缓抬头，看向车内，一道深邃的目光穿透雨幕，落在她身上。`
  };

  if (editMode.value === 'full') {
    mockText = ``;
    form.episodesData.forEach((_, idx) => {
      mockText += (EPISODE_SCRIPTS[idx] || `第 ${idx + 1} 集内容生成中...`) + '\n\n' + '------------------' + '\n\n';
    });
  } else {
    mockText = EPISODE_SCRIPTS[currentEpisodeIndex.value] || `第 ${currentEpisodeIndex.value + 1} 集剧本正文生成中...`;
  }
  
  const interval = setInterval(() => {
    if (isPaused.value) return;
    const chars = mockText.substring(i, i + 8);
    tiptapEditor.value?.commands.insertContent(chars.replace(/\n/g, '<br>'));
    i += 8;
    if (i >= mockText.length) {
      clearInterval(interval);
      isGenerating.value = false;
      ElMessage.success('剧本生成完毕');
    }
  }, 40);
};

const rightPanelChatRef = ref<HTMLElement | null>(null);
const scriptBodyRef = ref<HTMLElement | null>(null);
</script>

<style scoped>
/* Modern Scrollbar */
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

/* No Scrollbar helper */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>