<template>
  <div class="flex h-full w-full overflow-hidden p-4 lg:p-6 gap-4 lg:gap-6 text-[#1f2329] bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] dark:from-slate-900 dark:to-slate-800 relative transition-all duration-500" :class="{'is-left-collapsed': isLeftCollapsed, 'is-right-collapsed': !isRightPanelVisible}">
    
    <!-- Decorative background elements -->
    <div class="absolute -top-20 -right-20 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
    <div class="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

    <!-- Left Info Panel (Workbench) -->
    <div class="left-panel flex flex-col shrink-0 min-h-0 h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[24px] shadow-xl shadow-slate-200/50 dark:shadow-none border border-white/40 dark:border-slate-700/50 relative transition-all duration-500 z-10 hover:shadow-2xl hover:shadow-indigo-500/5" :style="{ width: isLeftCollapsed ? '64px' : leftPanelWidth + 'px' }">
      <!-- Resizer Handle -->
      <div 
        v-if="!isLeftCollapsed"
        class="absolute -right-[2px] top-10 bottom-10 w-[4px] cursor-col-resize z-20 hover:bg-indigo-500/40 rounded-full transition-all duration-300"
        @mousedown="startResizeLeftPanel"
      ></div>

      <!-- Collapse Button -->
      <div 
        class="absolute -right-3 top-8 w-7 h-7 bg-white dark:bg-slate-700 rounded-full shadow-lg border border-slate-100 dark:border-slate-600 flex items-center justify-center cursor-pointer z-30 text-slate-500 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-110 active:scale-95 transition-all duration-300 group"
        @click="isLeftCollapsed = !isLeftCollapsed"
      >
        <el-icon class="transition-transform duration-500" :class="isLeftCollapsed ? 'rotate-180' : ''"><ArrowLeft /></el-icon>
      </div>

      <!-- Collapsed State -->
      <div v-show="isLeftCollapsed" class="flex flex-col items-center py-8 gap-8 w-full h-full">
        <el-tooltip content="基础设定" placement="right">
          <div 
            class="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
            :class="activeLeftTab === 'basic-settings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400'"
            @click="activeLeftTab = 'basic-settings'; isLeftCollapsed = false"
          >
            <el-icon :size="20"><Setting /></el-icon>
          </div>
        </el-tooltip>
        <el-tooltip content="剧集大纲" placement="right">
          <div 
            class="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
            :class="activeLeftTab === 'episode-outline' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400'"
            @click="activeLeftTab = 'episode-outline'; isLeftCollapsed = false"
          >
            <el-icon :size="20"><Document /></el-icon>
          </div>
        </el-tooltip>
      </div>

      <!-- Expanded State -->
      <div v-show="!isLeftCollapsed" class="flex flex-col h-full w-full min-h-0 overflow-hidden">
        <!-- Tabs -->
        <div class="flex items-center p-2 shrink-0">
          <div class="flex bg-slate-100/50 dark:bg-slate-900/50 rounded-[18px] p-1 w-full">
            <div 
              class="flex-1 py-2 text-[13px] font-black cursor-pointer rounded-[14px] text-center transition-all duration-300 flex items-center justify-center gap-2"
              :class="activeLeftTab === 'basic-settings' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm scale-[1.02]' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
              @click="activeLeftTab = 'basic-settings'"
            >
              <el-icon><Setting /></el-icon> 基础设定
            </div>
            <div 
              class="flex-1 py-2 text-[13px] font-black cursor-pointer rounded-[14px] text-center transition-all duration-300 flex items-center justify-center gap-2"
              :class="activeLeftTab === 'episode-outline' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm scale-[1.02]' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
              @click="activeLeftTab = 'episode-outline'"
            >
              <el-icon><Document /></el-icon> 剧集大纲
            </div>
          </div>
        </div>

        <!-- 基础设定 (Basic Settings Tab) -->
        <div v-show="activeLeftTab === 'basic-settings'" class="flex-1 overflow-y-auto custom-scrollbar p-5 min-h-0 space-y-6">
          <!-- Loading skeleton -->
          <div v-if="isInfoLoading" class="space-y-6">
            <el-skeleton animated :rows="8" />
          </div>

          <div v-else class="space-y-5 animate-fade-in">
            <div class="grid grid-cols-1 gap-5">
              <div class="space-y-1.5">
                <label class="text-[12px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  剧本类型 <span class="w-1 h-1 rounded-full bg-indigo-400"></span>
                </label>
                <el-select v-model="form.scriptType" class="modern-select w-full" placeholder="请选择剧本类型">
                  <el-option label="微短剧" value="short_drama" />
                  <el-option label="电影" value="movie" />
                  <el-option label="长篇剧集" value="long_drama" />
                </el-select>
              </div>

              <div class="space-y-1.5">
                <label class="text-[12px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  题材 <span class="w-1 h-1 rounded-full bg-indigo-400"></span>
                </label>
                <el-select v-model="form.genre" class="modern-select w-full" placeholder="请选择题材">
                  <el-option v-for="item in GENRES" :key="item" :label="item" :value="item" />
                </el-select>
              </div>

              <div class="space-y-1.5">
                <label class="text-[12px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  时代背景 <span class="w-1 h-1 rounded-full bg-indigo-400"></span>
                </label>
                <el-input v-model="form.eraBackground" placeholder="例如：现代都市" class="modern-input" />
              </div>

              <div class="space-y-1.5">
                <label class="text-[12px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  目标受众 <span class="w-1 h-1 rounded-full bg-indigo-400"></span>
                </label>
                <el-input v-model="form.targetAudience" placeholder="例如：18-35岁女性" class="modern-input" />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-[12px] font-black text-slate-400 uppercase tracking-widest">集数</label>
                  <el-input-number v-model="form.episodesCount" :min="1" :max="1000" class="modern-number-input !w-full" controls-position="right" />
                </div>
                <div class="space-y-1.5">
                  <label class="text-[12px] font-black text-slate-400 uppercase tracking-widest">时长 (秒)</label>
                  <el-input-number v-model="form.expectedDuration" :min="1" :max="10000" class="modern-number-input !w-full" controls-position="right" />
                </div>
              </div>
            </div>

            <!-- 故事背景 -->
            <div class="pt-4 border-t border-slate-100 dark:border-slate-700/50">
              <div class="flex justify-between items-center mb-3 group">
                <h3 class="text-[14px] font-black flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <span class="w-1.5 h-4 bg-indigo-600 rounded-full"></span> 故事背景
                </h3>
                <el-popover
                  v-model:visible="aiPromptPopoverVisible['background']"
                  placement="right"
                  width="300"
                  trigger="click"
                  popper-class="modern-popover"
                >
                  <template #reference>
                    <button class="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100 shadow-sm">
                      <el-icon><MagicStick /></el-icon>
                    </button>
                  </template>
                  <div class="p-1 space-y-3">
                    <p class="text-[12px] font-black text-slate-400 uppercase">AI 生成指令</p>
                    <el-input v-model="aiPromptInput" type="textarea" :rows="3" placeholder="描述你想要的背景细节..." class="modern-textarea-small" />
                    <div class="flex justify-end gap-2">
                      <button @click="handleAIGenerateAction('background', 'cancel')" class="px-3 py-1.5 rounded-xl text-[11px] font-black bg-slate-50 text-slate-500 hover:bg-slate-100 transition-all">取消</button>
                      <button @click="handleAIGenerateAction('background', 'append')" class="px-3 py-1.5 rounded-xl text-[11px] font-black bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all">追加</button>
                      <button @click="handleAIGenerateAction('background', 'replace')" class="px-4 py-1.5 rounded-xl text-[11px] font-black bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all">替换</button>
                    </div>
                  </div>
                </el-popover>
              </div>
              <div class="relative group">
                <el-input v-model="form.background" type="textarea" :rows="5" placeholder="请输入故事背景..." class="modern-textarea" :class="{'is-error': errors.background}" @input="validateField('background')" />
                <div class="absolute bottom-2 right-3 px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-100 dark:border-slate-700 text-[10px] font-black" :class="getWordCountColor('background')">
                  {{ form.background?.length || 0 }} / 675-825
                </div>
              </div>
              <p v-if="errors.background" class="mt-1.5 text-red-500 text-[11px] font-bold flex items-center gap-1">
                <el-icon><InfoFilled /></el-icon> {{ errors.background }}
              </p>
            </div>

            <!-- 故事梗概 -->
            <div class="pt-4 border-t border-slate-100 dark:border-slate-700/50">
              <div class="flex justify-between items-center mb-3 group">
                <h3 class="text-[14px] font-black flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <span class="w-1.5 h-4 bg-purple-600 rounded-full"></span> 故事梗概
                </h3>
                <el-popover
                  v-model:visible="aiPromptPopoverVisible['synopsis']"
                  placement="right"
                  width="300"
                  trigger="click"
                  popper-class="modern-popover"
                >
                  <template #reference>
                    <button class="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100 shadow-sm">
                      <el-icon><MagicStick /></el-icon>
                    </button>
                  </template>
                  <div class="p-1 space-y-3">
                    <p class="text-[12px] font-black text-slate-400 uppercase">AI 生成指令</p>
                    <el-input v-model="aiPromptInput" type="textarea" :rows="3" placeholder="描述你想要的梗概风格..." class="modern-textarea-small" />
                    <div class="flex justify-end gap-2">
                      <button @click="handleAIGenerateAction('synopsis', 'cancel')" class="px-3 py-1.5 rounded-xl text-[11px] font-black bg-slate-50 text-slate-500 hover:bg-slate-100 transition-all">取消</button>
                      <button @click="handleAIGenerateAction('synopsis', 'append')" class="px-3 py-1.5 rounded-xl text-[11px] font-black bg-purple-50 text-purple-600 hover:bg-purple-100 transition-all">追加</button>
                      <button @click="handleAIGenerateAction('synopsis', 'replace')" class="px-4 py-1.5 rounded-xl text-[11px] font-black bg-purple-600 text-white shadow-lg shadow-purple-500/20 hover:bg-purple-700 transition-all">替换</button>
                    </div>
                  </div>
                </el-popover>
              </div>
              <div class="relative group">
                <el-input v-model="form.synopsis" type="textarea" :rows="5" placeholder="请输入故事梗概..." class="modern-textarea" :class="{'is-error': errors.synopsis}" @input="validateField('synopsis')" />
                <div class="absolute bottom-2 right-3 px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-100 dark:border-slate-700 text-[10px] font-black" :class="getWordCountColor('synopsis')">
                  {{ form.synopsis?.length || 0 }} / 450-550
                </div>
              </div>
              <p v-if="errors.synopsis" class="mt-1.5 text-red-500 text-[11px] font-bold flex items-center gap-1">
                <el-icon><InfoFilled /></el-icon> {{ errors.synopsis }}
              </p>
            </div>
          </div>
        </div>

        <!-- 剧集大纲 (Episode Outline Tab) -->
        <div v-show="activeLeftTab === 'episode-outline'" class="flex-1 overflow-y-auto custom-scrollbar p-5 flex flex-col gap-5 min-h-0 animate-fade-in">
          <div class="flex items-center justify-between mb-2">
            <div class="flex flex-col">
              <span class="text-[16px] font-black text-slate-800 dark:text-white">分集列表</span>
              <span class="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total {{ form.episodesData.length }} Episodes</span>
            </div>
            <button 
              @click="addEpisode"
              class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[12px] font-black shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              <el-icon><Plus /></el-icon> 新增分集
            </button>
          </div>

          <!-- Draggable List -->
          <div class="flex flex-col gap-4 pb-10">
            <transition-group name="list">
              <div 
                v-for="(ep, index) in form.episodesData" 
                :key="ep.id"
                class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 group relative cursor-move"
                draggable="true"
                @dragstart="onDragStartEpisode($event, index)"
                @dragover.prevent
                @drop="onDropEpisode($event, index)"
              >
                <!-- Drag Handle Indicator -->
                <div class="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300">
                  <el-icon :size="16"><MoreFilled class="rotate-90" /></el-icon>
                </div>

                <div class="flex justify-between items-center mb-4 pl-2">
                  <div class="flex items-center gap-3">
                    <span class="w-10 h-10 flex items-center justify-center font-black text-[14px] text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                      {{ index + 1 }}
                    </span>
                    <span class="text-[14px] font-black text-slate-700 dark:text-slate-200">第 {{ index + 1 }} 集</span>
                  </div>
                  <button 
                    @click="removeEpisode(index)"
                    class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <el-icon :size="18"><Delete /></el-icon>
                  </button>
                </div>

                <div class="space-y-4 pl-2">
                  <div class="space-y-1">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-tighter">剧情梗概</label>
                    <el-input v-model="ep.summary" type="textarea" :rows="2" placeholder="这一集讲了什么？" class="modern-textarea-v2" />
                  </div>
                  <div class="grid grid-cols-1 gap-3">
                    <div class="space-y-1">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-tighter">核心场景</label>
                      <el-input v-model="ep.scenes" placeholder="地点、时间..." class="modern-input-v2" prefix-icon="Location" />
                    </div>
                    <div class="space-y-1">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-tighter">登场角色</label>
                      <el-input v-model="ep.characters" placeholder="谁在这一集出现？" class="modern-input-v2" prefix-icon="User" />
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
              <h3 class="text-[17px] font-black text-slate-800 dark:text-white flex items-center gap-2">
                剧本正文
              </h3>
              <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Script Content Editing</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <el-tooltip content="全屏模式 (Ctrl+\)" placement="bottom">
              <button 
                @click="isRightPanelVisible = !isRightPanelVisible"
                class="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 border border-slate-100 dark:border-slate-600 rounded-xl hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-100 transition-all shadow-sm hover:shadow-md"
              >
                <el-icon :size="18"><Expand v-if="isRightPanelVisible" /><Fold v-else /></el-icon>
              </button>
            </el-tooltip>
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
              <!-- Context Menu -->
              <transition name="scale">
                <div v-show="contextMenuVisible" class="fixed z-50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-[24px] shadow-2xl shadow-indigo-500/10 border border-white/50 dark:border-slate-700/50 overflow-hidden text-[13px] text-slate-700 dark:text-slate-200 w-[280px] flex flex-col" :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }" @click.stop>
                  <div class="p-4 border-b border-slate-100/50 dark:border-slate-700/50 flex items-center gap-3 bg-indigo-50/30 dark:bg-indigo-900/20">
                    <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                      <el-icon><MagicStick /></el-icon>
                    </div>
                    <el-input 
                      v-model="aiPromptInput" 
                      placeholder="告诉 AI 如何修改..." 
                      size="small" 
                      class="flex-1 modern-input-small" 
                      @keyup.enter="applyAIAction('自定义指令')" 
                    />
                  </div>

                  <div class="grid grid-cols-4 gap-2 p-4 bg-white/50 dark:bg-slate-800/50">
                    <div v-for="action in [{n:'续写', i:Edit}, {n:'润色', i:MagicStick}, {n:'扩写', i:DocumentAdd}, {n:'改写', i:Refresh}]" 
                         :key="action.n"
                         @click="applyAIAction(action.n)"
                         class="flex flex-col items-center gap-2 cursor-pointer group/item"
                    >
                      <div class="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover/item:bg-indigo-600 group-hover/item:text-white transition-all duration-300">
                        <el-icon :size="18"><component :is="action.i" /></el-icon>
                      </div>
                      <span class="text-[11px] font-black">{{ action.n }}</span>
                    </div>
                  </div>

                  <div class="p-3 flex flex-col gap-1 max-h-[200px] overflow-y-auto custom-scrollbar">
                    <div v-for="cmd in ['情感渲染', '五感填充', '角度转换', '内容升华', '增加反差', '强化金句']" 
                         :key="cmd"
                         @click="applyAIAction(cmd)"
                         class="flex items-center justify-between px-3 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer rounded-xl transition-all group/cmd"
                    >
                      <span class="font-bold">{{ cmd }}</span>
                      <el-icon class="text-slate-300 group-hover/cmd:text-indigo-600 transition-colors"><ArrowRight /></el-icon>
                    </div>
                  </div>
                </div>
              </transition>

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
                      <el-icon><MagicStick /></el-icon> 一键智能生成
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
        <div class="h-14 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between px-6 text-[11px] font-black text-slate-400 bg-white dark:bg-slate-800 shrink-0">
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
            {{ editorTextContent ? '不满意？重来' : '帮我写一个' }}
          </button>

          <button 
            @click="saveScriptContent"
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
        :style="{ width: isRightPanelVisible ? '360px' : '0px', opacity: isRightPanelVisible ? 1 : 0, marginLeft: isRightPanelVisible ? '0px' : '-20px' }"
      >
        <div v-show="isRightPanelVisible" class="flex flex-col h-full overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[28px] border border-white dark:border-slate-700/50 shadow-2xl shadow-slate-200/50 dark:shadow-none">
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
              <div class="flex items-center justify-center gap-3 mt-4 overflow-x-auto no-scrollbar py-1">
                <button v-for="tag in ['帮我扩写', '优化对话', '增加冲突']" :key="tag" 
                        @click="aiPromptInput = tag; handleAIGenerateAction('bubble', 'append')"
                        class="whitespace-nowrap px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-700 text-[11px] font-black text-slate-500 dark:text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30 transition-all border border-slate-100 dark:border-slate-600">
                  {{ tag }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useDramaStore } from '../../store/drama';
import { 
  MagicStick, Refresh, Edit, Plus, Delete, Check, Loading, 
  ArrowLeft, ArrowRight, Document, Setting, ArrowDown, 
  Expand, Fold, VideoPause, VideoPlay, User, 
  RefreshLeft, RefreshRight, DocumentAdd, Top, InfoFilled,
  Location, MoreFilled
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { Editor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import CharacterCount from '@tiptap/extension-character-count';

const router = useRouter();
const dramaStore = useDramaStore();

const GENRES = ['古装权谋', '民国谍战', '都市情感', '科幻未来', '草根逆袭', '历史战争', '越狱风云', '揭竿而起'];

// State
const isInfoLoading = ref(true);
const isGenerating = ref(false);
const isPaused = ref(false);
const isSavingScript = ref(false);

const saveScriptContent = () => {
  isSavingScript.value = true;
  setTimeout(() => {
    isSavingScript.value = false;
    ElMessage.success('剧本保存成功，版本已更新');
    setTimeout(() => {
      router.push('/ai-short-drama-creator/assets');
    }, 500);
  }, 600);
};

const applyAIAction = (actionName: string) => {
  contextMenuVisible.value = false;
  ElMessage.success(`正在执行: AI ${actionName}...`);
  // Mock AI action insertion
  setTimeout(() => {
    if (tiptapEditor.value) {
      const selectedText = tiptapEditor.value.state.doc.textBetween(
        tiptapEditor.value.state.selection.from,
        tiptapEditor.value.state.selection.to,
        ' '
      );
      
      let newText = ` [AI ${actionName} 生成内容] `;
      if (selectedText) {
        tiptapEditor.value.commands.insertContent(`【AI修改：${actionName}】${selectedText} -> ${newText}`);
        ElMessage.success(`AI ${actionName} 已完成`);
      } else {
        tiptapEditor.value.commands.insertContent(`【AI生成：${actionName}】${newText}`);
        ElMessage.success(`AI ${actionName} 已完成`);
      }
    }
  }, 500);
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

// Context Menu State
const contextMenuVisible = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);

const openContextMenu = (e: MouseEvent) => {
  contextMenuX.value = e.clientX;
  contextMenuY.value = e.clientY;
  contextMenuVisible.value = true;
};

const closeContextMenu = () => {
  contextMenuVisible.value = false;
};

// Form Data
const form = reactive({
  title: '',
  scriptType: '',
  genre: '',
  eraBackground: '',
  targetAudience: '',
  episodesCount: null as number | null,
  expectedDuration: null as number | null,
  synopsis: '',
  background: '',
  episodesData: [] as any[]
});

const errors = reactive<Record<string, string>>({});

// --- Mock API for Prefilling Info ---
const fetchAutoPrefillInfo = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        title: '淮西烽火',
        scriptType: 'short_drama',
        genre: '揭竿而起',
        eraBackground: '元末明初',
        targetAudience: '历史爱好者，热血青年',
        episodesCount: 12,
        expectedDuration: 120,
        synopsis: '公元1356年，元军残暴，淮西村落化作焦土。农夫赵铁牛在父母被杀后被俘，在监狱中遇到志同道合的王二狗。两人密谋越狱，从此开启了一段波澜壮阔的反抗生涯。故事展现了底层人民在绝境中的觉醒与勇气。'.padEnd(500, ' '),
        background: '元朝末年，政治腐败，社会动荡。元军铁蹄肆意践踏中原大地，百姓生活在水深火热之中。淮西地区作为反元势力的活跃地带，遭到了元军的残酷镇压。在这一片废墟之上，反抗的种子正在悄然生根发芽。'.padEnd(750, ' '),
        episodesData: [
          { id: 'p1', title: '第一集', summary: '赵铁牛亲眼目睹家园被毁，父母双亡，愤怒反抗却不幸被俘。', scenes: '淮西村落, 废墟', characters: '赵铁牛, 元军士兵' },
          { id: 'p2', title: '第二集', summary: '赵铁牛在监狱中遇到王二狗，两人在阴暗的牢房中达成共识，计划越狱。', scenes: '元廷监狱, 牢房', characters: '赵铁牛, 王二狗' }
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
      CharacterCount.configure({ limit: 50000 })
    ],
    content: '',
    onUpdate: ({ editor }) => {
      editorTextContent.value = editor.getText().trim();
    },
    editorProps: {
      attributes: {
        class: 'prose-modern focus:outline-none'
      }
    }
  });

  isInfoLoading.value = true;
  const data: any = await fetchAutoPrefillInfo();
  Object.assign(form, data);
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
    if (!aiPromptInput.value) return;
    chatMessages.value.push({ id: Date.now().toString(), role: 'user', content: aiPromptInput.value });
    const aiBubbleId = Date.now().toString() + '_ai';
    chatMessages.value.push({ id: aiBubbleId, role: 'ai', content: '', isGenerating: true });
    
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
    aiPromptInput.value = '';
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

const validateField = (field: string) => {
  errors[field] = '';
  const len = form[field]?.length || 0;
  if (field === 'synopsis' && (len < 450 || len > 550)) errors.synopsis = '字数建议在 450-550 之间';
  if (field === 'background' && (len < 675 || len > 825)) errors.background = '字数建议在 675-825 之间';
};

const getWordCountColor = (field: string) => {
  const len = form[field]?.length || 0;
  if (field === 'synopsis') return (len >= 450 && len <= 550) ? 'text-slate-400' : 'text-red-500';
  return (len >= 675 && len <= 825) ? 'text-slate-400' : 'text-red-500';
};

const addEpisode = () => {
  form.episodesData.push({ id: Date.now().toString(), summary: '', scenes: '', characters: '' });
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
  const mockText = `1-1日 外 场景：淮西村落-废墟
人物：赵铁牛、元军士兵
服装：赵铁牛（破布麻衣）、元军士兵（铁甲布衫）
道具：木棍、屠刀
旁白：公元1356年，淮西村落化作一片焦土，元军铁蹄践踏过的地方，连野草都不敢生长。
旁白：废墟之中，一个叫赵铁牛的汉子攥着染血的木棍，眼睁睁看着父母倒在血泊里。
△元军士兵挥舞屠刀，在村中肆意杀戮。
△赵铁牛咬牙切齿，攥紧手中的木棍，浑身颤抖。
赵铁牛（咬牙切齿）：总有一天……总有一天我要掀翻这元廷！
△赵铁牛怒吼着冲向元军士兵，木棍狠狠砸下。
△元军士兵转身，轻松制服赵铁牛，将他踩在脚下。
元军士兵（冷笑）：找死！
旁白：赵铁牛被俘了，可他心里那团火，灭不了。


1-2日 内 场景：元廷监狱-牢房
人物：赵铁牛、王二狗
服装：赵铁牛（囚服）、王二狗（囚服）
道具：破旧稻草、铁链
旁白：铁链锁住的不只是手脚，还有那颗想要复仇的心。
旁白：阴暗潮湿的牢房里，赵铁牛靠在冰冷的墙壁上，手脚的铁链随着他的动作发出刺耳的响声。
△王二狗从稻草堆里爬过来，一屁股坐在赵铁牛身旁。
△王二狗伸出手，在赵铁牛肩膀上重重拍了一下。
王二狗（压低声音）：兄弟，这元廷早该反了！
△赵铁牛猛地转头，目光如炬地盯着王二狗。
△两人对视，眼神中燃起同样的火焰。
旁白：一个眼神，胜过千言万语，两人心中都有一颗想要掀翻元廷的种子。
赵铁牛（低声）：你也有这心思？
王二狗（嘿嘿一笑）：俺家也被元军害惨了，早就想找个机会干一票大的！
△赵铁牛嘴角微微上扬，握紧了拳头。
赵铁牛（沉声道）：好汉所见略同，这破地方，咱们得想办法出去。
△王二狗凑近赵铁牛，两人脑袋凑在一起，低声密谋。
旁白：越狱的念头，在这阴暗的牢房里悄然生根发芽。`;
  
  const interval = setInterval(() => {
    if (isPaused.value) return;
    const chars = mockText.substring(i, i + 8); // 稍微加快点速度，从5字符到8字符
    tiptapEditor.value?.commands.insertContent(chars.replace(/\n/g, '<br>'));
    i += 8;
    if (i >= mockText.length) {
      clearInterval(interval);
      isGenerating.value = false;
      ElMessage.success('剧本生成完毕');
    }
  }, 40); // 稍微加快点频率，从50ms到40ms
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
  font-size: 13px;
  line-height: 1.6;
  resize: none;
  transition: all 0.3s ease;
  box-shadow: none !important;
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
  font-size: 12px;
  padding: 8px 12px !important;
  resize: none;
  box-shadow: none !important;
}

:deep(.modern-input-v2 .el-input__wrapper) {
  background-color: #F8FAFC !important;
  border-radius: 12px !important;
  border: 1px solid #F1F5F9 !important;
  font-size: 12px;
  box-shadow: none !important;
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

/* Prose Modern Styling */
.prose-modern {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #334155;
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