<template>
  <div class="flex h-full w-full overflow-hidden p-6 gap-6 text-[#1f2329] bg-[#F0F2F5]" :class="{'is-left-collapsed': isLeftCollapsed, 'is-right-collapsed': !isRightPanelVisible}">
    
    <!-- Left Info Panel (Workbench) -->
    <div class="left-panel flex flex-col shrink-0 min-h-0 h-full bg-white rounded-[8px] shadow-[0_4px_12px_0_rgba(0,0,0,0.08)] relative transition-all duration-300 z-10" :style="{ width: isLeftCollapsed ? '48px' : leftPanelWidth + 'px' }">
      <!-- Resizer Handle -->
      <div 
        v-if="!isLeftCollapsed"
        class="absolute -right-[6px] top-0 bottom-0 w-[12px] cursor-col-resize z-20 hover:bg-indigo-500/20 transition-colors"
        @mousedown="startResizeLeftPanel"
      ></div>

      <!-- Collapse Button -->
      <div 
        class="absolute -right-3 top-6 w-6 h-6 bg-white rounded-full shadow border border-slate-100 flex items-center justify-center cursor-pointer z-30 text-slate-500 hover:text-indigo-600 hover:scale-110 transition-transform"
        @click="isLeftCollapsed = !isLeftCollapsed"
        tabindex="0"
        @keydown.enter="isLeftCollapsed = !isLeftCollapsed"
        aria-label="切换侧边栏折叠状态"
      >
        <el-icon><ArrowLeft v-if="!isLeftCollapsed" /><ArrowRight v-else /></el-icon>
      </div>

      <!-- Collapsed State -->
      <div v-show="isLeftCollapsed" class="flex flex-col items-center py-6 gap-6 w-[48px] h-full">
        <el-tooltip content="基础设定" placement="right"><el-icon :size="20" class="text-slate-600 cursor-pointer" @click="activeLeftTab = 'basic-settings'; isLeftCollapsed = false"><Setting /></el-icon></el-tooltip>
        <el-tooltip content="剧集大纲" placement="right"><el-icon :size="20" class="text-slate-600 cursor-pointer" @click="activeLeftTab = 'episode-outline'; isLeftCollapsed = false"><Document /></el-icon></el-tooltip>
      </div>

      <!-- Expanded State -->
      <div v-show="!isLeftCollapsed" class="flex flex-col h-full w-full min-h-0 overflow-hidden">
        <!-- Tabs -->
        <div class="flex items-center border-b border-slate-100 shrink-0 px-2 pt-2">
          <div 
            class="px-4 py-2 text-[14px] font-bold cursor-pointer border-b-2 transition-colors"
            :class="activeLeftTab === 'basic-settings' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'"
            @click="activeLeftTab = 'basic-settings'"
          >
            基础设定
          </div>
          <div 
            class="px-4 py-2 text-[14px] font-bold cursor-pointer border-b-2 transition-colors"
            :class="activeLeftTab === 'episode-outline' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'"
            @click="activeLeftTab = 'episode-outline'"
          >
            剧集大纲
          </div>
        </div>

        <!-- 基础设定 (Basic Settings Tab) -->
        <div v-show="activeLeftTab === 'basic-settings'" class="flex-1 overflow-y-auto custom-scrollbar p-3 min-h-0">
          <!-- Loading skeleton -->
          <div v-if="isInfoLoading" class="space-y-4">
            <el-skeleton animated :rows="6" />
          </div>

          <div v-else class="space-y-4 text-[14px] leading-[1.5]">
            <div class="flex flex-col gap-1">
              <label class="font-bold text-slate-700">剧本类型</label>
              <el-select v-model="form.scriptType" class="w-full">
                <el-option label="微短剧" value="short_drama" />
                <el-option label="电影" value="movie" />
                <el-option label="长篇剧集" value="long_drama" />
              </el-select>
            </div>

            <div class="flex flex-col gap-1">
              <label class="font-bold text-slate-700">题材</label>
              <el-select v-model="form.genre" class="w-full">
                <el-option v-for="item in GENRES" :key="item" :label="item" :value="item" />
              </el-select>
            </div>

            <div class="flex flex-col gap-1">
              <label class="font-bold text-slate-700">时代背景</label>
              <el-input v-model="form.eraBackground" placeholder="例如：现代都市" />
            </div>

            <div class="flex flex-col gap-1">
              <label class="font-bold text-slate-700">目标受众</label>
              <el-input v-model="form.targetAudience" placeholder="例如：18-35岁女性" />
            </div>

            <div class="flex gap-4">
              <div class="flex flex-col gap-1 flex-1">
                <label class="font-bold text-slate-700">集数</label>
                <el-input-number v-model="form.episodesCount" :min="1" :max="1000" class="!w-full" controls-position="right" />
              </div>
              <div class="flex flex-col gap-1 flex-1">
                <label class="font-bold text-slate-700">时长 (秒)</label>
                <el-input-number v-model="form.expectedDuration" :min="1" :max="10000" class="!w-full" controls-position="right" />
              </div>
            </div>


          </div>

          <!-- 故事背景 -->
          <div class="flex flex-col gap-2 relative mb-8 group mt-8">
            <div class="flex justify-between items-center mb-1">
              <h3 class="text-[16px] font-bold flex items-center gap-2"><span class="w-1 h-4 bg-indigo-600 rounded-full"></span> 故事背景</h3>
              <el-popover
                v-model:visible="aiPromptPopoverVisible['background']"
                placement="right"
                width="300"
                trigger="click"
              >
                <template #reference>
                  <el-icon class="cursor-pointer text-slate-400 hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100" title="AI 生成"><MagicStick /></el-icon>
                </template>
                <div class="flex flex-col gap-3">
                  <el-input v-model="aiPromptInput" type="textarea" :rows="3" placeholder="请输入生成要求..." />
                  <div class="flex justify-end gap-2">
                    <button 
                      @click="handleAIGenerateAction('background', 'cancel')"
                      class="px-3 py-1 bg-white text-slate-500 border border-slate-200 rounded-full text-[12px] font-bold hover:bg-slate-50 transition-all"
                    >
                      取消
                    </button>
                    <button 
                      @click="handleAIGenerateAction('background', 'append')"
                      class="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[12px] font-bold hover:bg-indigo-100 transition-all"
                    >
                      追加
                    </button>
                    <button 
                      @click="handleAIGenerateAction('background', 'replace')"
                      class="px-3 py-1 bg-indigo-600 text-white rounded-full text-[12px] font-bold hover:bg-indigo-700 transition-all"
                    >
                      替换
                    </button>
                  </div>
                </div>
              </el-popover>
            </div>
            <el-input v-model="form.background" type="textarea" :rows="6" placeholder="请输入故事背景..." class="custom-textarea" :class="{'is-error': errors.background}" @input="validateField('background')" />
            <div class="flex justify-between items-center absolute -bottom-5 left-0 w-full">
              <span v-if="errors.background" class="text-red-500 text-[12px]">{{ errors.background }}</span>
              <span v-else></span>
              <span class="text-[12px]" :class="getWordCountColor('background')">{{ form.background?.length || 0 }} / 675-825</span>
            </div>
          </div>

          <!-- 故事梗概 -->
          <div class="flex flex-col gap-2 relative mb-8 group mt-8">
            <div class="flex justify-between items-center mb-1">
              <h3 class="text-[16px] font-bold flex items-center gap-2"><span class="w-1 h-4 bg-indigo-600 rounded-full"></span> 故事梗概</h3>
              <el-popover
                v-model:visible="aiPromptPopoverVisible['synopsis']"
                placement="right"
                width="300"
                trigger="click"
              >
                <template #reference>
                  <el-icon class="cursor-pointer text-slate-400 hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100" title="AI 生成"><MagicStick /></el-icon>
                </template>
                <div class="flex flex-col gap-3">
                  <el-input v-model="aiPromptInput" type="textarea" :rows="3" placeholder="请输入生成要求..." />
                  <div class="flex justify-end gap-2">
                    <button 
                      @click="handleAIGenerateAction('synopsis', 'cancel')"
                      class="px-3 py-1 bg-white text-slate-500 border border-slate-200 rounded-full text-[12px] font-bold hover:bg-slate-50 transition-all"
                    >
                      取消
                    </button>
                    <button 
                      @click="handleAIGenerateAction('synopsis', 'append')"
                      class="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[12px] font-bold hover:bg-indigo-100 transition-all"
                    >
                      追加
                    </button>
                    <button 
                      @click="handleAIGenerateAction('synopsis', 'replace')"
                      class="px-3 py-1 bg-indigo-600 text-white rounded-full text-[12px] font-bold hover:bg-indigo-700 transition-all"
                    >
                      替换
                    </button>
                  </div>
                </div>
              </el-popover>
            </div>
            <el-input v-model="form.synopsis" type="textarea" :rows="6" placeholder="请输入故事梗概..." class="custom-textarea" :class="{'is-error': errors.synopsis}" @input="validateField('synopsis')" />
            <div class="flex justify-between items-center absolute -bottom-5 left-0 w-full">
              <span v-if="errors.synopsis" class="text-red-500 text-[12px]">{{ errors.synopsis }}</span>
              <span v-else></span>
              <span class="text-[12px]" :class="getWordCountColor('synopsis')">{{ form.synopsis?.length || 0 }} / 450-550</span>
            </div>
          </div>
        </div>
        <div v-show="activeLeftTab === 'episode-outline'" class="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4 min-h-0">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[12px] text-slate-400 font-medium">共 {{ form.episodesData.length }} 集</span>
            <button 
              @click="addEpisode"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[12px] font-bold hover:bg-indigo-100 transition-colors"
            >
              <el-icon><Plus /></el-icon> 新增分集
            </button>
          </div>

          <!-- Virtual/Draggable List -->
          <div class="flex flex-col gap-3">
            <div 
              v-for="(ep, index) in form.episodesData" 
              :key="ep.id"
              class="bg-white border border-slate-100 rounded-xl p-4 shadow-sm cursor-move hover:border-indigo-300 transition-all group relative"
              draggable="true"
              @dragstart="onDragStartEpisode($event, index)"
              @dragover.prevent
              @drop="onDropEpisode($event, index)"
            >
              <div class="flex justify-between items-center mb-3">
                <span class="font-bold text-[14px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">第 {{ index + 1 }} 集</span>
                <button 
                  @click="removeEpisode(index)"
                  class="w-7 h-7 flex items-center justify-center rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                >
                  <el-icon><Delete /></el-icon>
                </button>
              </div>
              <div class="flex flex-col gap-2 text-[12px]">
                <el-input v-model="ep.summary" type="textarea" :rows="2" placeholder="一句话梗概" size="small" />
                <el-input v-model="ep.scenes" placeholder="主要场景 (用逗号分隔)" size="small" />
                <el-input v-model="ep.characters" placeholder="出场角色 (用逗号分隔)" size="small" />
              </div>
              <span v-if="errors[`plot_${index}`]" class="text-red-500 text-[12px] mt-1">{{ errors[`plot_${index}`] }}</span>
            </div>
            <div v-if="form.episodesData.length === 0" class="text-center py-8 text-slate-400 text-[12px]">
              暂无剧集大纲
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Edit Area -->
    <div class="right-panel flex-1 flex gap-6 h-full min-h-0 overflow-hidden transition-all duration-300">
      
      <!-- Central Canvas (Tiptap Script Body & Chapter Flow) -->
      <div class="flex-1 flex flex-col h-full min-h-0 bg-white rounded-[8px] shadow-[0_4px_12px_0_rgba(0,0,0,0.08)] overflow-hidden">
        
        <!-- Canvas Toolbar -->
        <div class="flex items-center justify-between p-4 border-b border-slate-100 shrink-0 bg-white">
          <div class="flex items-center gap-4">
            <h3 class="text-[16px] font-bold flex items-center gap-2">
              <span class="w-1.5 h-4 bg-[#1890ff] rounded-full"></span> 剧本
            </h3>
          </div>
          <div class="flex items-center gap-3">
            <el-tooltip content="Ctrl+\ 切换右侧面板">
              <button 
                @click="isRightPanelVisible = !isRightPanelVisible"
                class="w-8 h-8 flex items-center justify-center bg-white text-slate-500 border border-slate-200 rounded-lg hover:text-indigo-600 hover:border-indigo-300 transition-all shadow-sm"
              >
                <el-icon><Expand /></el-icon>
              </button>
            </el-tooltip>
          </div>
        </div>

        <!-- Canvas Main Body -->
        <div class="flex-1 min-h-0 relative bg-[#F8FAFC] flex flex-col">
          <!-- Tiptap Editor -->
          <div 
            class="flex-1 overflow-y-auto custom-scrollbar p-6"
            @contextmenu.prevent="openContextMenu"
            ref="scriptBodyRef"
          >
            <div class="min-h-full bg-white border border-slate-200 rounded-lg shadow-sm relative">
            <!-- Right Click AI Menu -->
            <div v-show="contextMenuVisible" class="fixed z-50 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden text-[13px] text-slate-700 w-[280px] flex flex-col" :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }" @click.stop>
              <!-- AI Input Area -->
              <div class="p-3 border-b border-slate-100 flex items-center gap-2 bg-indigo-50/50">
                <el-input 
                  v-model="aiPromptInput" 
                  placeholder="输入编辑或优化指令..." 
                  size="small" 
                  class="flex-1 custom-search-input" 
                  @keyup.enter="applyAIAction('自定义指令')" 
                />
                <button 
                  @click="applyAIAction('自定义指令')"
                  class="w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all shadow-md"
                >
                  <el-icon><Top /></el-icon>
                </button>
              </div>

              <!-- Action Icons Row -->
              <div class="flex justify-between items-center p-3 border-b border-slate-100 text-slate-500 bg-white">
                <div class="flex flex-col items-center gap-1 cursor-pointer hover:text-indigo-600 transition-colors" @click="applyAIAction('续写')">
                  <el-icon size="18"><Edit /></el-icon><span class="text-[12px]">续写</span>
                </div>
                <div class="flex flex-col items-center gap-1 cursor-pointer hover:text-indigo-600 transition-colors" @click="applyAIAction('润色')">
                  <el-icon size="18"><MagicStick /></el-icon><span class="text-[12px]">润色</span>
                </div>
                <div class="flex flex-col items-center gap-1 cursor-pointer hover:text-indigo-600 transition-colors" @click="applyAIAction('扩写')">
                  <el-icon size="18"><DocumentAdd /></el-icon><span class="text-[12px]">扩写</span>
                </div>
                <div class="flex flex-col items-center gap-1 cursor-pointer hover:text-indigo-600 transition-colors" @click="applyAIAction('改写')">
                  <el-icon size="18"><Refresh /></el-icon><span class="text-[12px]">改写</span>
                </div>
              </div>

              <!-- Recommend List -->
              <div class="p-2 flex flex-col bg-white max-h-[200px] overflow-y-auto custom-scrollbar">
                <div class="text-[12px] text-slate-400 px-2 py-1 mb-1">推荐指令</div>
                <div class="flex items-center gap-2 px-2 py-2 hover:bg-slate-50 cursor-pointer rounded-md transition-colors" @click="applyAIAction('情感渲染')">
                  <span class="text-[16px]">🎨</span> 情感渲染
                </div>
                <div class="flex items-center gap-2 px-2 py-2 hover:bg-slate-50 cursor-pointer rounded-md transition-colors" @click="applyAIAction('五感填充')">
                  <span class="text-[16px]">👁️</span> 五感填充
                </div>
                <div class="flex items-center gap-2 px-2 py-2 hover:bg-slate-50 cursor-pointer rounded-md transition-colors" @click="applyAIAction('角度转换')">
                  <span class="text-[16px]">🎭</span> 角度转换
                </div>
                <div class="flex items-center gap-2 px-2 py-2 hover:bg-slate-50 cursor-pointer rounded-md transition-colors" @click="applyAIAction('内容升华')">
                  <span class="text-[16px]">✨</span> 内容升华
                </div>
                <div class="flex items-center gap-2 px-2 py-2 hover:bg-slate-50 cursor-pointer rounded-md transition-colors" @click="applyAIAction('加个例子')">
                  <span class="text-[16px]">📌</span> 加个例子
                </div>
                <div class="flex items-center gap-2 px-2 py-2 hover:bg-slate-50 cursor-pointer rounded-md transition-colors" @click="applyAIAction('增加反差')">
                  <span class="text-[16px]">🎯</span> 增加反差
                </div>
                <div class="flex items-center gap-2 px-2 py-2 hover:bg-slate-50 cursor-pointer rounded-md transition-colors" @click="applyAIAction('强化金句')">
                  <span class="text-[16px]">🔑</span> 强化金句
                </div>
              </div>
            </div>
            <editor-content v-if="tiptapEditor" :editor="tiptapEditor as any" class="p-8 outline-none min-h-[400px]" />
            <div v-if="!isGenerating && !editorTextContent && showEmptyPlaceholder" class="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-white/95 z-10 rounded-lg backdrop-blur-[2px]">
                <div class="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200 mb-6 border border-slate-100">
                  <el-icon size="40"><Document /></el-icon>
                </div>
                <p class="mb-8 text-[15px] font-medium text-slate-500">剧本内容为空，快让 AI 帮你生成吧！</p>
                <div class="flex items-center gap-6">
                  <button 
                    @click="generateScriptBody"
                    class="h-14 px-10 bg-indigo-600 text-white rounded-full text-base font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <el-icon><MagicStick /></el-icon> 一键生成剧本正文
                  </button>
                  <button 
                    @click="showEmptyPlaceholder = false"
                    class="h-14 px-10 bg-white text-slate-600 border border-slate-200 rounded-full text-base font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
                  >
                    <el-icon><Edit /></el-icon> 手动输入
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tiptap Footer Stats -->
        <div class="h-10 border-t border-slate-100 flex items-center justify-between px-4 text-[12px] text-slate-500 bg-slate-50 shrink-0">
          <div class="flex items-center gap-4">
            <span>字数: {{ tiptapEditor?.storage.characterCount.characters() || 0 }}</span>
            <span>预计阅读: {{ Math.ceil((tiptapEditor?.storage.characterCount.words() || 0) / 250) }} 分钟</span>
          </div>
          <div class="flex items-center gap-2">
            <el-tooltip content="撤销 (Ctrl+Z)">
              <button 
                @click="tiptapEditor?.commands.undo()"
                class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
              >
                <el-icon><RefreshLeft /></el-icon>
              </button>
            </el-tooltip>
            <el-tooltip content="重做 (Ctrl+Y)">
              <button 
                @click="tiptapEditor?.commands.redo()"
                class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
              >
                <el-icon><RefreshRight /></el-icon>
              </button>
            </el-tooltip>
          </div>
        </div>

        <!-- Action Footer -->
        <div class="flex justify-end items-center p-6 border-t border-slate-100 bg-white shrink-0 gap-4">
          <div v-if="isGenerating" class="flex items-center gap-3 text-indigo-600 text-[14px] mr-auto bg-indigo-50 px-4 py-2 rounded-full font-medium">
            <el-icon class="is-loading" v-if="!isPaused"><Loading /></el-icon> 
            <span>{{ isPaused ? '已暂停' : '正在智能生成中...' }}</span>
            <button 
              @click="isPaused = !isPaused" 
              class="flex items-center gap-1 px-2 py-0.5 bg-white rounded-md text-indigo-600 shadow-sm hover:bg-indigo-100 transition-colors"
            >
              <el-icon><VideoPause v-if="!isPaused"/><VideoPlay v-else/></el-icon> 
              {{ isPaused ? '继续' : '暂停' }}
            </button>
          </div>

          <button 
            v-if="!isGenerating" 
            @click="generateScriptBody"
            class="h-12 px-6 bg-white text-indigo-600 border border-indigo-200 rounded-full text-[15px] font-bold hover:bg-indigo-50 hover:border-indigo-300 transition-all flex items-center gap-2"
          >
            <el-icon v-if="!editorTextContent"><MagicStick /></el-icon>
            <el-icon v-else><Refresh /></el-icon>
            {{ editorTextContent ? '重新生成' : '生成剧本' }}
          </button>

          <button 
            @click="saveScriptContent"
            :disabled="isSavingScript"
            class="h-12 px-10 bg-indigo-600 text-white rounded-full text-[15px] font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center gap-2"
          >
            <el-icon v-if="isSavingScript" class="is-loading"><Loading /></el-icon>
            <span>确认并进入主体设定</span>
            <el-icon v-if="!isSavingScript"><ArrowRight /></el-icon>
          </button>
        </div>
      </div>

      <!-- Right Properties Panel -->
      <div 
        class="shrink-0 flex flex-col gap-6 h-full min-h-0 transition-all duration-300 relative" 
        :style="{ width: isRightPanelVisible ? '320px' : '0px', opacity: isRightPanelVisible ? 1 : 0, marginLeft: isRightPanelVisible ? '0px' : '-24px' }"
      >
        <!-- Collapse Button for Right Panel -->
        <div 
          class="absolute -left-3 top-6 w-6 h-6 bg-white rounded-full shadow border border-slate-100 flex items-center justify-center cursor-pointer z-30 text-slate-500 hover:text-indigo-600 hover:scale-110 transition-transform"
          @click="isRightPanelVisible = !isRightPanelVisible"
        >
          <el-icon><ArrowRight v-if="!isRightPanelVisible" /><ArrowLeft v-else /></el-icon>
        </div>

        <div v-show="isRightPanelVisible" class="flex flex-col gap-6 h-full overflow-hidden">
          <!-- AI Assistant / Properties -->
          <div class="flex-1 min-h-0 bg-white rounded-[8px] shadow-[0_4px_12px_0_rgba(0,0,0,0.08)] flex flex-col overflow-hidden" :class="isAIAssistantExpanded ? 'flex-1' : 'h-auto shrink-0'">
            <div 
              class="h-[48px] px-4 flex items-center justify-between cursor-pointer border-b border-slate-100 font-bold text-[14px] shrink-0 hover:bg-slate-50 transition-colors"
              @click="isAIAssistantExpanded = !isAIAssistantExpanded"
            >
              <span class="flex items-center gap-2"><el-icon><MagicStick /></el-icon> AI 助手</span>
              <el-icon class="transition-transform duration-250" :class="{'rotate-180': isAIAssistantExpanded}"><ArrowDown /></el-icon>
            </div>
            <div v-show="isAIAssistantExpanded" class="flex-1 flex flex-col bg-[#F8FAFC] min-h-0">
              <div class="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 p-4 text-[14px]" ref="rightPanelChatRef">
                <!-- Initial Welcome Message -->
                <div class="flex flex-col gap-1 items-start">
                  <span class="text-[12px] text-slate-400 flex items-center gap-1"><el-icon><MagicStick /></el-icon> AI 助手</span>
                  <div class="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-slate-700 border border-slate-100">我随时可以协助您生成内容或润色剧本。</div>
                </div>
                <!-- Shared Chat logs -->
                <div 
                  v-for="msg in chatMessages" 
                  :key="msg.id"
                  class="flex flex-col gap-1"
                  :class="msg.role === 'ai' ? 'items-start' : 'items-end'"
                >
                  <span class="text-[12px] text-slate-400 flex items-center gap-1">
                    <el-icon v-if="msg.role === 'ai'"><MagicStick /></el-icon>
                    <el-icon v-else><User /></el-icon>
                    {{ msg.role === 'ai' ? 'AI 助手' : '我' }}
                  </span>
                  <div 
                    class="p-3 rounded-2xl text-[13px] leading-relaxed max-w-[90%] break-words shadow-sm"
                    :class="msg.role === 'ai' ? 'bg-white text-slate-700 border border-slate-100 rounded-tl-none' : 'bg-indigo-600 text-white rounded-tr-none'"
                  >
                    {{ msg.content }}
                  </div>
                </div>
              </div>
              
              <!-- Chat Input -->
              <div class="mt-auto shrink-0 flex gap-2 p-4 bg-white border-t border-slate-100 items-center">
                <el-input 
                  v-model="aiPromptInput" 
                  placeholder="告诉 AI 你的想法..." 
                  class="custom-search-input flex-1"
                  @keyup.enter="handleAIGenerateAction('bubble', 'append')" 
                />
                <button 
                  @click="handleAIGenerateAction('bubble', 'append')"
                  class="h-10 px-6 bg-indigo-600 text-white rounded-full text-[14px] font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  发送
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
import { MagicStick, Refresh, Edit, Plus, Delete, Check, Loading, ArrowLeft, ArrowRight, Document, Setting, ArrowDown, Search, Expand, VideoPause, VideoPlay, Picture, Clock, User, RefreshLeft, RefreshRight, Scissor, Switch, ChatLineRound, DocumentCopy, DocumentAdd, Top } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { Editor, EditorContent, BubbleMenu } from '@tiptap/vue-3';
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
      if (actionName === '复制') {
        if (selectedText) {
          navigator.clipboard.writeText(selectedText);
          ElMessage.success('已复制到剪贴板');
        } else {
          ElMessage.warning('没有选中文本可复制');
        }
        return;
      } else if (actionName === '撤销') {
        tiptapEditor.value.commands.undo();
        return;
      } else if (actionName === '粘贴') {
        navigator.clipboard.readText().then(clipText => {
          tiptapEditor.value?.commands.insertContent(clipText);
        });
        return;
      }

      if (selectedText) {
        if (confirm(`确认使用 AI ${actionName} 处理选中文本吗？\n当前选中：${selectedText.substring(0,20)}...`)) {
          tiptapEditor.value.commands.insertContent(`【AI修改：${actionName}】${selectedText} -> ${newText}`);
          ElMessage.success(`AI ${actionName} 已完成，支持 Ctrl+Z 撤销`);
        }
      } else {
        tiptapEditor.value.commands.insertContent(`【AI生成：${actionName}】${newText}`);
        ElMessage.success(`AI ${actionName} 已完成，支持 Ctrl+Z 撤销`);
      }
    }
  }, 500);
};
const isLeftCollapsed = ref(false);
const isQuickSettingsExpanded = ref(true);
const isAIAssistantExpanded = ref(true);
const wordCountMin = ref(500);
const wordCountMax = ref(1500);
const isPreviewEnabled = ref(true);
const scriptBodyRef = ref<HTMLElement | null>(null);
const rightPanelChatRef = ref<HTMLElement | null>(null);
const scriptBodyContent = ref('');
const isRightPanelVisible = ref(true);
const activeLeftTab = ref('basic-settings');
const leftPanelWidth = ref(280);
const tiptapEditor = ref<Editor | null>(null);
const editorTextContent = ref('');
const scriptStyleMode = ref(false);
const enableAnimations = ref(true);
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

// Node drag state
const onDragEnd = (e: DragEvent) => {
  // Add some visual bounce if enabled
  if (enableAnimations.value) {
    const target = e.target as HTMLElement;
    target.style.transform = 'translateY(10px)';
    setTimeout(() => {
      target.style.transition = 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
      target.style.transform = 'translateY(0)';
      setTimeout(() => {
        target.style.transition = '';
      }, 200);
    }, 10);
  }
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
  characters: [] as any[],
  synopsis: '',
  background: '',
  episodesData: [
    { id: '1', title: '第一集', summary: '林星在提案中成功，却发现男友背叛', scenes: '公司会议室, 餐厅', characters: '林星, 男友' }
  ] as any[]
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
        characters: [
          { id: '1', name: '赵铁牛', description: '淮西农夫，父母双亡，心中燃起反抗元廷的烈火。' },
          { id: '2', name: '王二狗', description: '赵铁牛的狱友，机智幽默，同样有着深仇大恨。' }
        ],
        synopsis: '公元1356年，元军残暴，淮西村落化作焦土。农夫赵铁牛在父母被杀后被俘，在监狱中遇到志同道合的王二狗。两人密谋越狱，从此开启了一段波澜壮阔的反抗生涯。故事展现了底层人民在绝境中的觉醒与勇气。'.padEnd(500, ' '),
        background: '元朝末年，政治腐败，社会动荡。元军铁蹄肆意践踏中原大地，百姓生活在水深火热之中。淮西地区作为反元势力的活跃地带，遭到了元军的残酷镇压。在这一片废墟之上，反抗的种子正在悄然生根发芽。'.padEnd(750, ' '),
        episodesData: [
          { id: 'p1', title: '第一集', summary: '赵铁牛亲眼目睹家园被毁，父母双亡，愤怒反抗却不幸被俘。', scenes: '淮西村落, 废墟', characters: '赵铁牛, 元军士兵' },
          { id: 'p2', title: '第二集', summary: '赵铁牛在监狱中遇到王二狗，两人在阴暗的牢房中达成共识，计划越狱。', scenes: '元廷监狱, 牢房', characters: '赵铁牛, 王二狗' }
        ]
      });
    }, 400); // <= 800ms
  });
};

// Keyboard shortcuts
const handleKeydown = (e: KeyboardEvent) => {
  if (e.ctrlKey && e.key === '\\') {
    isRightPanelVisible.value = !isRightPanelVisible.value;
    e.preventDefault();
  }
};

onMounted(async () => {
  window.addEventListener('keydown', handleKeydown);
  document.addEventListener('click', closeContextMenu);

  // Initialize Tiptap
  tiptapEditor.value = new Editor({
    extensions: [
      StarterKit,
      CharacterCount.configure({ limit: 50000 })
    ],
    content: '<p></p>',
    onUpdate: ({ editor }) => {
      editorTextContent.value = editor.getText().trim();
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate focus:outline-none min-h-[300px]'
      }
    }
  });

  isInfoLoading.value = true;
  const data: any = await fetchAutoPrefillInfo();
  Object.assign(form, data);
  isInfoLoading.value = false;
  
  // Re-validate silently
  validateField('title');
  validateField('synopsis');
  validateField('background');
  form.episodesData.forEach((_, i) => validatePlotNode(i));
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

    // mock streaming
    let i = 0;
    const mockText = `【AI助手回复】您刚刚说：“${aiPromptInput.value}”。我已经将相关剧情记录，并且更新了人物动机。`;
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
    }, 50);
    aiPromptInput.value = '';
    return;
  }

  let targetLen = 100;
  if (field === 'synopsis') targetLen = 500;
  else if (field === 'background') targetLen = 750;
  
  const mockSentence = `【AI生成】根据您的提示词：“${aiPromptInput.value}” 生成的内容。这是一个关于成长与救赎的故事，展现了人物内心深处的挣扎与觉醒。`;
  let mockResponse = '';
  while (mockResponse.length < targetLen) {
    mockResponse += mockSentence;
  }
  mockResponse = mockResponse.substring(0, targetLen);

  if (action === 'replace') {
    if (field === 'synopsis') form.synopsis = mockResponse;
    if (field === 'background') form.background = mockResponse;
  } else if (action === 'append') {
    if (field === 'synopsis') form.synopsis += '\n' + mockResponse;
    if (field === 'background') form.background += '\n' + mockResponse;
  }
  
  validateField(field);
  ElMessage.success(`AI已${action === 'replace' ? '替换' : '追加'}内容`);
  aiPromptInput.value = '';
};

// --- Resizing Left Panel ---
let startX = 0;
let startWidth = 0;

const doDrag = (e: MouseEvent) => {
  const newWidth = startWidth + (e.clientX - startX);
  if (newWidth > 200 && newWidth < 600) {
    leftPanelWidth.value = newWidth;
  }
};

const stopDrag = () => {
  document.removeEventListener('mousemove', doDrag);
  document.removeEventListener('mouseup', stopDrag);
  document.body.style.cursor = 'default';
};

const startResizeLeftPanel = (e: MouseEvent) => {
  startX = e.clientX;
  startWidth = leftPanelWidth.value;
  document.addEventListener('mousemove', doDrag);
  document.addEventListener('mouseup', stopDrag);
  document.body.style.cursor = 'col-resize';
  e.preventDefault();
};

// --- Validation ---
const validateField = (field: string) => {
  errors[field] = '';
  if (field === 'title' && !form.title.trim()) errors.title = '作品名称不能为空';
  
  if (field === 'synopsis') {
    const len = form.synopsis?.length || 0;
    if (len < 450 || len > 550) errors.synopsis = '字数需在450-550之间 (预设区间中位值±10%)';
  }
  if (field === 'background') {
    const len = form.background?.length || 0;
    if (len < 675 || len > 825) errors.background = '字数需在675-825之间 (预设区间中位值±10%)';
  }
};

const getWordCountColor = (field: 'synopsis' | 'background') => {
  const len = form[field]?.length || 0;
  if (field === 'synopsis') {
    return (len >= 450 && len <= 550) ? 'text-slate-400' : 'text-red-500';
  } else {
    return (len >= 675 && len <= 825) ? 'text-slate-400' : 'text-red-500';
  }
};

const validatePlotNode = (index: number) => {
  // No longer validating title as it's removed
};

const isFormValid = computed(() => {
  if (!form.title || !form.synopsis || !form.background) return false;
  if ((form.synopsis?.length || 0) < 450 || (form.synopsis?.length || 0) > 550) return false;
  if ((form.background?.length || 0) < 675 || (form.background?.length || 0) > 825) return false;
  if (form.episodesData.length === 0) return false;
  return Object.values(errors).every(err => !err);
});

// --- Character Actions ---
const addCharacter = () => {
  form.characters.push({ id: Date.now().toString(), name: '', description: '' });
};

const removeCharacter = (index: number) => {
  form.characters.splice(index, 1);
};

const saveCharacter = (char: any) => {
  char._saved = true;
  setTimeout(() => {
    char._saved = false;
  }, 2000);
};

let draggedIndex = -1;

// --- Plot Actions ---
const addEpisode = () => {
  form.episodesData.push({ id: Date.now().toString(), title: '', summary: '', scenes: '', characters: '' });
};
const removeEpisode = (index: number) => {
  form.episodesData.splice(index, 1);
  delete errors[`plot_${index}`];
};

const onDragStartEpisode = (e: DragEvent, index: number) => {
  draggedIndex = index;
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
};
const onDropEpisode = (e: DragEvent, index: number) => {
  if (draggedIndex === -1 || draggedIndex === index) return;
  const item = form.episodesData.splice(draggedIndex, 1)[0];
  form.episodesData.splice(index, 0, item);
  draggedIndex = -1;
  form.episodesData.forEach((_, i) => validatePlotNode(i));
};

// --- AI Generation Mock ---
const generateAI = (field: string) => {
  aiPromptPopoverVisible.value[field] = true;
};

// --- Streaming Generation & Word Count ---
const reportToSentry = (msg: string, meta: any) => {
  console.error('[Sentry Mock Report]', msg, meta);
};

const isInteger = (val: any): val is number => typeof val === 'number' && Number.isInteger(val);

const getTargetWordCount = (): number => {
  const min = isInteger(wordCountMin.value) ? wordCountMin.value : 500;
  const max = isInteger(wordCountMax.value) ? wordCountMax.value : 1500;
  // Default to middle with ±5% variance if we want to simulate
  const mid = Math.floor((min + max) / 2);
  const variance = Math.floor(Math.abs(mid) * 0.05);
  return mid + (Math.floor(Math.random() * variance * 2) - variance);
};

const validateGeneratedWordCount = (content: string, min: number, max: number): boolean => {
  const length = content.replace(/\s+/g, '').length; // Count characters without whitespace
  return length >= min && length <= max;
};

const generateScriptBody = async () => {
  if (!isFormValid.value) {
    ElMessage.warning('请确认基础设定后生成剧本');
    return;
  }
  isGenerating.value = true;
  scriptBodyContent.value = '';
  
  const minWords = isInteger(wordCountMin.value) ? wordCountMin.value : 500;
  const maxWords = isInteger(wordCountMax.value) ? wordCountMax.value : 1500;
  const targetWords = getTargetWordCount();

  let retryCount = 0;
  const maxRetries = 3;

  const attemptGeneration = async (): Promise<boolean> => {
    scriptBodyContent.value = '';
    if (tiptapEditor.value) {
      tiptapEditor.value.commands.clearContent();
    }
    isPaused.value = false;
    
    return new Promise((resolve) => {
      // 使用用户提供的剧本内容
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
      
      // Simulate First-byte latency <= 800ms
      setTimeout(() => {
        let i = 0;
        const streamInterval = setInterval(() => {
          if (isPaused.value) return; // Wait if paused

          // 模拟流式输出，每次输出 3-8 个字符，模仿打字机效果
          const charsCount = Math.floor(Math.random() * 5) + 3;
          const chars = mockText.substring(i, i + charsCount);
          scriptBodyContent.value += chars;
          if (tiptapEditor.value) {
            // 将换行符转换为 <p> 标签或 <br>，以便在编辑器中正确显示
            const formattedChars = chars.replace(/\n/g, '<br>');
            tiptapEditor.value.commands.insertContent(formattedChars);
          }
          i += charsCount;
          
          scrollToBottom();

          if (i >= mockText.length) {
            clearInterval(streamInterval);
            resolve(true);
          }
        }, Math.random() * 20 + 30); // 30-50ms，稍微快一点的打字速度
      }, 500); 
    });
  };

  while (retryCount <= maxRetries) {
    if (retryCount > 0) {
      ElMessage.warning('字数未达标，已重新生成...');
    }
    
    const success = await attemptGeneration();
    if (success) {
      ElMessage.success('剧本正文生成完毕');
      isGenerating.value = false;
      return;
    }
    
    retryCount++;
    reportToSentry('Generation Word Count Mismatch', { retryCount, length: scriptBodyContent.value.length });
  }

  ElMessage.error('生成多次均未达到设定字数，请修改提示词或字数限制。');
  isGenerating.value = false;
};

const scrollToBottom = () => {
  nextTick(() => {
    if (scriptBodyRef.value) {
      scriptBodyRef.value.scrollTop = scriptBodyRef.value.scrollHeight;
    }
    if (tiptapEditor.value) {
      tiptapEditor.value.commands.scrollIntoView();
    }
  });
};

// --- Confirm & Jump ---
const confirmAndSave = () => { // unused
  if (!isFormValid.value) {
    ElMessage.error('请完善大纲必填项');
    return;
  }
  
  isSavingScript.value = true;
  
  // Mock /api/v1/story/confirm
  setTimeout(() => {
    isSavingScript.value = false;
    const newId = `drama_${Date.now()}`;
    dramaStore.setCurrentDramaId(newId);
    dramaStore.setOutlineData(form);
    
    ElMessage.success('保存成功');
    setTimeout(() => {
      router.push('/ai-short-drama-creator/assets');
    }, 150); // <= 200ms
  }, 500);
};

</script>

<style scoped>
.theme-primary-btn {
  background-color: #1890ff !important;
  border-color: #1890ff !important;
  color: white !important;
  border-radius: 8px !important;
}
.theme-primary-btn:hover {
  background-color: #40a9ff !important;
  border-color: #40a9ff !important;
}
.theme-primary-outline-btn {
  color: #1890ff !important;
  border-color: #1890ff !important;
  border-radius: 8px !important;
}
.theme-primary-outline-btn:hover {
  background-color: #e6f7ff !important;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.custom-textarea :deep(.el-textarea__inner) {
  border-radius: 8px;
  padding: 0.75rem 1rem;
  background-color: #f8fafc;
  border-color: #f1f5f9;
  transition: all 0.3s;
}
.custom-textarea :deep(.el-textarea__inner:focus) {
  background-color: #ffffff;
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}
.is-error :deep(.el-input__wrapper),
.is-error :deep(.el-textarea__inner),
.is-error.el-select {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 1px #ef4444 inset !important;
}

@keyframes fade-out {
  0% { opacity: 1; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-5px); }
  100% { opacity: 0; transform: translateY(-10px); }
}
.animate-fade-out {
  animation: fade-out 1.5s forwards;
}

.duration-250 {
  transition-duration: 250ms;
}

:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
  border-radius: 8px !important;
}
/* Node Flow Animations */
.node-flow-enter-active,
.node-flow-leave-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.node-flow-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}
.node-flow-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(-20px);
}
.node-flow-move {
  transition: transform 0.35s ease;
}

/* Node connecting line animation */
.node-line {
  background: transparent;
  border-left: 2px dashed #c7d2fe;
}
.node-line.is-animated {
  background: transparent;
  position: absolute;
  left: 39px;
  top: 10px;
  bottom: 10px;
  width: 2px;
  overflow: hidden;
}
.node-line.is-animated::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #6366f1;
  animation: draw-line 0.6s ease-out forwards;
  transform-origin: top;
}
@keyframes draw-line {
  0% { transform: scaleY(0); }
  100% { transform: scaleY(1); }
}

/* Script Style Typography */
.script-style-node .el-textarea__inner {
  font-family: "Courier New", Courier, "Songti SC", serif !important;
  font-size: 16px !important;
  line-height: 1.8 !important;
  font-weight: 500;
  color: #1e293b;
  padding-left: 24px;
}
</style>
