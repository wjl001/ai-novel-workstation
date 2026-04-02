<template>
  <div v-show="!showAiOverlay && !showFiveSensesDialog" class="aisw-scale h-full flex flex-col transition-colors duration-300" :class="bgClass">
    <el-container class="flex-1 overflow-hidden relative">
    <div 
      class="absolute top-1/2 z-50 transform -translate-y-1/2 -translate-x-1/2 cursor-pointer w-3 h-12 flex items-center justify-center rounded-r border-y border-r shadow-md transition-all"
      :style="{ left: showLeftSidebar ? '220px' : '0px' }"
      :class="isLight ? 'bg-white border-slate-200 hover:bg-slate-50' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'"
      @click="showLeftSidebar = !showLeftSidebar"
      :title="showLeftSidebar ? '收起侧边栏' : '展开侧边栏'"
    >
      <el-icon :size="12" :class="isLight ? 'text-slate-400' : 'text-slate-500'">
        <DArrowLeft v-if="showLeftSidebar" />
        <DArrowRight v-else />
      </el-icon>
    </div>
    <!-- Module B: Lore Hub (左侧侧边栏) -->
    <div class="relative transition-all duration-300 border-r flex flex-col h-full overflow-visible" 
      :style="{ width: showLeftSidebar ? '220px' : '0px' }"
      :class="sidebarClass"
    >
      <!-- Content (Only visible when width > 0) -->
      <div v-show="showLeftSidebar" class="flex flex-col h-full w-full overflow-hidden">
        <!-- 顶部返回 -->
        <div class="p-4 border-b flex-shrink-0 flex items-center justify-between" :class="isLight ? 'border-slate-200' : 'border-slate-700'">
           <el-button link class="hover:text-indigo-500" :class="isLight ? 'text-slate-500' : 'text-slate-300 hover:text-white'" @click="goBack">
              <el-icon class="mr-1"><ArrowLeft /></el-icon> 返回
           </el-button>
           <el-button type="primary" plain size="small" class="!rounded-full !px-3" @click="showPrototypeHelp = true">
             <el-icon class="mr-1"><InfoFilled /></el-icon> 说明
           </el-button>
        </div>

        <!-- 中部：导航与内容树 -->
        <div class="flex-1 overflow-y-auto p-2 custom-scrollbar">
          <el-collapse v-model="activeSidePanel" accordion class="border-none" :class="isLight ? 'light-collapse' : 'dark-collapse'">
            
            <!-- 章节列表 -->
            <el-collapse-item name="chapters">
              <template #title>
                <div class="flex items-center gap-2 font-medium px-2" :class="isLight ? 'text-slate-700' : 'text-slate-200'">
                  <el-icon><Reading /></el-icon> 剧集列表
                </div>
              </template>
              
              <div v-if="loreStore.currentNovel.chapters.length === 0" class="text-center py-4 text-sm" :class="isLight ? 'text-slate-400' : 'text-slate-400'">
                暂无剧集，请先生成大纲
              </div>

              <div 
                v-for="(chapter, index) in loreStore.currentNovel.chapters" 
                :key="chapter.id"
                class="group flex items-center justify-between p-2 rounded-lg cursor-pointer mb-1 transition-all border hover:shadow-sm"
                :class="[
                  isLight 
                    ? (currentChapterId === chapter.id ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'hover:bg-slate-50 border-transparent hover:border-slate-200 text-slate-700') 
                    : (currentChapterId === chapter.id ? 'bg-indigo-500/20 text-indigo-200 border-indigo-500/30' : 'hover:bg-slate-700 border-transparent hover:border-slate-600 text-slate-300')
                ]"
                @click="switchChapter(chapter.id)"
              >
                <div class="truncate text-sm flex-1">
                  <span class="mr-2 opacity-60 font-mono text-xs">{{ index + 1 }}</span>
                  {{ chapter.title }}
                </div>
                <el-tag v-if="!chapter.content" size="small" type="info" :effect="isLight ? 'light' : 'dark'" class="scale-75 origin-right" :class="isLight ? '!bg-slate-100 !border-slate-200' : '!bg-slate-700 !border-slate-600 !text-slate-300'">未写</el-tag>
              </div>
            </el-collapse-item>

          </el-collapse>
        </div>
      </div>
    </div>

    <!-- Module C: Immersive Editor (中间编辑器) -->
    <el-main class="relative flex flex-col items-center pt-6 px-4 custom-scrollbar transition-colors" :class="isLight ? 'bg-slate-50 bg-dot-pattern-light' : 'bg-slate-900 bg-dot-pattern-dark'">
      <!-- 编辑器顶部工具栏 -->
      <div class="w-full max-w-full mb-6 flex items-center justify-between text-sm sticky top-0 backdrop-blur z-10 py-2 mt-6 border-b transition-colors" :class="isLight ? 'bg-slate-50/90 border-slate-200 text-slate-500' : 'bg-slate-900/90 border-slate-800 text-slate-300'">
        <div class="flex items-center gap-2">
           <span class="font-bold" :class="isLight ? 'text-slate-800' : 'text-slate-100'">{{ currentChapter?.title || '未选择剧集' }}</span>
           <el-tag v-if="isAutoWriting" type="success" size="small" :effect="isLight ? 'light' : 'dark'" class="animate-pulse" :class="isLight ? '!bg-green-50 !border-green-200 !text-green-600' : '!bg-green-900/50 !border-green-800 !text-green-300'">AI 正在撰写中...</el-tag>
        </div>
        <div class="flex items-center gap-4">
           <el-tooltip content="字数统计" placement="bottom">
              <span class="flex items-center gap-1"><el-icon><DataLine /></el-icon> {{ editor?.storage.characterCount.words() || 0 }} 字</span>
           </el-tooltip>
           <el-button size="small" :class="isLight ? '!bg-indigo-50 !border-indigo-200 !text-indigo-600 hover:!bg-indigo-100' : '!bg-indigo-600/20 !border-indigo-500/30 !text-indigo-300 hover:!bg-indigo-600/30'" @click="startConversion">
             <el-icon class="mr-1"><VideoCamera /></el-icon> 对接AI短剧
           </el-button>
           <el-popover placement="bottom" :width="200" trigger="hover" :effect="isLight ? 'light' : 'dark'">
              <template #reference>
                <el-button circle size="small" :class="isLight ? '!bg-white !border-slate-200 !text-slate-600 hover:!border-indigo-300 hover:!text-indigo-600' : '!bg-slate-800 !border-slate-700 !text-slate-300 hover:!text-white'">
                  <el-icon><InfoFilled /></el-icon>
                </el-button>
              </template>
              <div class="text-xs space-y-1">
                <div class="font-bold mb-2">脚本格式标签说明</div>
                <div class="grid grid-cols-[40px_1fr] gap-2">
                  <span class="font-mono text-indigo-500">[EP]</span><span>剧集</span>
                  <span class="font-mono text-indigo-500">[INFO]</span><span>信息</span>
                  <span class="font-mono text-indigo-500">[ROLE]</span><span>角色</span>
                  <span class="font-mono text-indigo-500">[PROP]</span><span>道具</span>
                  <span class="font-mono text-indigo-500">[SCENE]</span><span>场景</span>
                  <span class="font-mono text-indigo-500">[STORY]</span><span>大纲</span>
                  <span class="font-mono text-indigo-500">[SHOT]</span><span>分镜</span>
                  <span class="font-mono text-indigo-500">[CAM]</span><span>镜头</span>
                  <span class="font-mono text-indigo-500">[SFX]</span><span>音效</span>
                  <span class="font-mono text-indigo-500">[TIME]</span><span>时长</span>
                  <span class="font-mono text-indigo-500">[BGM]</span><span>背景音乐</span>
                </div>
              </div>
           </el-popover>
           <el-tooltip v-if="!showAiSidePanel" content="打开 AI 助手" placement="bottom">
              <el-button circle size="small" :icon="ChatDotRound" :class="isLight ? '!bg-white !border-slate-300 !text-slate-500 hover:!text-slate-700' : '!bg-slate-800 !border-slate-700 !text-slate-300 hover:!text-white'" @click="{ showAiSidePanel = true; activeRightTab = 'chat'; }" />
           </el-tooltip>
           <el-button circle size="small" :icon="MoreFilled" :class="isLight ? '!bg-white !border-slate-300 !text-slate-500 hover:!text-slate-700' : '!bg-slate-800 !border-slate-700 !text-slate-300 hover:!text-white'" @click="showSettingsDialog = true" />
        </div>
      </div>

      <div class="w-full max-w-full h-full relative">
        <editor-content :editor="editor" class="prose max-w-none focus:outline-none min-h-[70vh] pb-40 w-full" :class="isLight ? 'prose-slate' : 'prose-invert prose-slate'" />
        <div class="sticky bottom-0 z-30 py-3 backdrop-blur-md border-t flex justify-end" :class="isLight ? 'bg-white/90 border-slate-200' : 'bg-slate-900/90 border-slate-800'">
          <el-button type="primary" size="large" class="!h-11 !px-8 !rounded-xl !font-bold shadow-lg shadow-indigo-500/30 !bg-[#4f46e5] !border-[#4f46e5] hover:!bg-[#4338ca] hover:!border-[#4338ca] hover:-translate-y-0.5 transition-all" @click="saveCurrentChapter">
            <el-icon class="mr-2"><Check /></el-icon> 保存
          </el-button>
        </div>
        
        <!-- Enhanced Bubble Menu -->
        <bubble-menu
          v-if="editor"
          :editor="editor"
          :tippy-options="{ duration: 100, maxWidth: 400, placement: 'bottom-start' }"
          class="shadow-2xl border rounded-xl overflow-hidden flex flex-col w-80 z-50 animate-in fade-in zoom-in-95 duration-200"
          :class="isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'"
        >
          <!-- Input Area -->
          <div class="p-2 border-b flex items-center gap-2" :class="bubbleMenuInputClass">
             <div class="flex-1 relative">
                <input 
                  v-model="aiCommandInput" 
                  class="w-full text-sm border rounded-lg py-1.5 px-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  :class="isLight ? 'bg-white border-slate-300 text-slate-800 placeholder-slate-400' : 'bg-slate-900 border-slate-600 text-slate-200 placeholder-slate-500'"
                  placeholder="输入编辑或优化指令..."
                  @keyup.enter="executeAiCommand"
                />
             </div>
             <button 
               class="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-sm"
               @click="executeAiCommand"
             >
               <el-icon><Top /></el-icon>
             </button>
          </div>

          <!-- Quick Actions -->
          <div class="grid grid-cols-4 gap-1 p-2 border-b" :class="bubbleMenuSectionClass">
             <button class="flex flex-col items-center justify-center gap-1 py-2 rounded transition-colors text-xs" :class="isLight ? 'hover:bg-slate-100 text-slate-500 hover:text-indigo-600' : 'hover:bg-slate-700 text-slate-400 hover:text-indigo-400'" @click="aiAction('continue')">
               <el-icon><EditPen /></el-icon> 续写
             </button>
             <button class="flex flex-col items-center justify-center gap-1 py-2 rounded transition-colors text-xs" :class="isLight ? 'hover:bg-slate-100 text-slate-500 hover:text-indigo-600' : 'hover:bg-slate-700 text-slate-400 hover:text-indigo-400'" @click="aiAction('polish')">
               <el-icon><MagicStick /></el-icon> 润色
             </button>
             <button class="flex flex-col items-center justify-center gap-1 py-2 rounded transition-colors text-xs" :class="isLight ? 'hover:bg-slate-100 text-slate-500 hover:text-indigo-600' : 'hover:bg-slate-700 text-slate-400 hover:text-indigo-400'" @click="aiAction('expand')">
               <el-icon><ScaleToOriginal /></el-icon> 扩写
             </button>
             <button class="flex flex-col items-center justify-center gap-1 py-2 rounded transition-colors text-xs" :class="isLight ? 'hover:bg-slate-100 text-slate-500 hover:text-indigo-600' : 'hover:bg-slate-700 text-slate-400 hover:text-indigo-400'" @click="aiAction('rewrite')">
               <el-icon><Refresh /></el-icon> 改写
             </button>
          </div>

          <!-- Recommendations -->
          <div class="p-3" :class="bubbleMenuFooterClass">
             <div class="text-xs mb-2 font-medium" :class="isLight ? 'text-slate-500' : 'text-slate-500'">推荐指令</div>
             <div class="space-y-1">
                <button 
                  v-for="cmd in recommendedCommands" 
                  :key="cmd.label"
                  class="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors group border border-transparent"
                  :class="isLight ? 'hover:bg-slate-100 text-slate-600 hover:text-slate-900 hover:border-slate-200' : 'hover:bg-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'"
                  @click="applyRecommendedCommand(cmd.label)"
                >
                   <span class="text-lg group-hover:scale-110 transition-transform">{{ cmd.icon }}</span>
                   <span>{{ cmd.label }}</span>
                </button>
             </div>
          </div>
        </bubble-menu>

        <!-- Floating Menu (悬浮菜单) -->
        <floating-menu
          v-if="editor"
          :editor="editor"
          :tippy-options="{ duration: 100 }"
          class="flex items-center gap-2 -ml-10"
        >
          <el-button circle size="default" type="primary" color="#4f46e5" class="shadow-lg hover:scale-110 transition-transform" @click="aiContinue">
            <el-icon><EditPen /></el-icon>
          </el-button>
        </floating-menu>
      </div>
    </el-main>

    <!-- Module D: Right AI Assistant Panel (右侧侧边栏) -->
    <div class="relative transition-all duration-300 border-l flex flex-col h-full overflow-hidden" 
      :style="{ width: showAiSidePanel ? '320px' : '0px' }"
      :class="rightPanelClass"
    >
      <div v-show="showAiSidePanel" class="flex flex-col h-full w-full">
        <!-- Panel Header -->
        <div class="flex items-center justify-between p-3 border-b shrink-0" :class="rightPanelHeaderClass">
          <div class="flex gap-1 bg-slate-100/50 p-1 rounded-lg" :class="isLight ? 'bg-slate-100' : 'bg-slate-700/50'">
            <button 
              class="px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1"
              :class="activeTabClass(activeRightTab === 'chat')"
              @click="activeRightTab = 'chat'"
            >
              <el-icon><ChatDotRound /></el-icon> AI 助手
            </button>
            <button 
              class="px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1"
              :class="activeTabClass(activeRightTab === 'optimize')"
              @click="activeRightTab = 'optimize'"
            >
              <el-icon><VideoCamera /></el-icon> 短剧优化
            </button>
          </div>
          <el-button link size="small" :class="isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-slate-300'" @click="showAiSidePanel = false">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>

        <!-- Panel Content -->
        <div class="flex-1 overflow-hidden relative">
          <!-- Chat Mode -->
          <div v-show="activeRightTab === 'chat'" class="h-full flex flex-col">
            <div class="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              <div v-if="chatHistory.length === 0" class="flex flex-col items-center justify-center h-full text-center opacity-40 space-y-4">
                <div class="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-2">
                   <el-icon :size="32" class="text-indigo-500"><ChatDotRound /></el-icon>
                </div>
                <div class="text-sm">有什么可以帮你的吗？<br>你可以问我关于剧情的建议</div>
              </div>
              <div v-for="(msg, i) in chatHistory" :key="i" class="flex flex-col gap-1" :class="msg.role === 'user' ? 'items-end' : 'items-start'">
                <div class="text-xs opacity-50 ml-1">{{ msg.role === 'user' ? '你' : 'AI 助手' }}</div>
                <div class="p-3 rounded-2xl text-sm max-w-[90%] shadow-sm border"
                  :class="msg.role === 'user' 
                    ? (isLight ? 'bg-indigo-600 text-white border-indigo-600 rounded-br-none' : 'bg-indigo-600 text-white border-indigo-600 rounded-br-none')
                    : (isLight ? 'bg-white border-slate-200 text-slate-700 rounded-bl-none' : 'bg-slate-700 border-slate-600 text-slate-200 rounded-bl-none')"
                >
                  {{ msg.content }}
                </div>
              </div>
              <div v-if="isAiThinking" class="flex items-center gap-2 text-xs opacity-50 ml-2">
                <el-icon class="is-loading"><Loading /></el-icon> AI 正在思考...
              </div>
            </div>
            <div class="p-3 border-t" :class="isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'">
              <div class="relative">
                <input 
                  v-model="chatInput" 
                  class="w-full text-sm border rounded-xl py-2.5 pl-3 pr-10 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
                  :class="isLight ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400' : 'bg-slate-900 border-slate-600 text-slate-200 placeholder-slate-500'"
                  placeholder="输入问题..."
                  @keyup.enter="sendChatMessage"
                />
                <button 
                  class="absolute right-1.5 top-1.5 p-1.5 rounded-lg text-white transition-colors"
                  :class="chatInput ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-slate-300 cursor-not-allowed dark:bg-slate-700'"
                  :disabled="!chatInput"
                  @click="sendChatMessage"
                >
                  <el-icon><Position /></el-icon>
                </button>
              </div>
            </div>
          </div>

          <!-- Optimization Mode (短剧优化) -->
          <div v-show="activeRightTab === 'optimize'" class="h-full flex flex-col overflow-y-auto custom-scrollbar p-4 space-y-4">
            <div class="mb-2">
              <h3 class="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-2">
                AI 短剧剧本优化引擎
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                专为短视频节奏打造，一键解决口语化、节奏感、连贯性与爽点痛点。
              </p>
            </div>

            <!-- Optimization Modules -->
            <div class="space-y-4">
              
              <!-- Module 1: 口语化重写 -->
              <div class="border rounded-xl p-4 transition-all" :class="isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-800/50 border-slate-700'">
                <div class="flex items-center justify-between mb-4">
                  <div class="font-bold flex items-center gap-2 text-sm" :class="isLight ? 'text-slate-800' : 'text-slate-200'">
                    <span class="text-purple-500">🗣️</span> 口语化重写
                  </div>
                  <el-switch v-model="optConfig.spoken.enabled" size="small" />
                </div>
                
                <div v-if="optConfig.spoken.enabled" class="space-y-3 animate-fade-in-up">
                  <div>
                    <div class="text-xs text-slate-500 mb-1 flex justify-between">
                      <span>句式拆解强度</span>
                    </div>
                    <el-slider v-model="optConfig.spoken.intensity" :step="10" size="small" />
                  </div>
                  
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-slate-600 dark:text-slate-300">语气词注入</span>
                    <el-switch v-model="optConfig.spoken.particles" size="small" />
                  </div>
                  
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-slate-600 dark:text-slate-300">第二人称互动</span>
                    <el-switch v-model="optConfig.spoken.interactive" size="small" />
                  </div>

                  <el-button type="primary" plain size="small" class="w-full mt-2 !rounded-lg" @click="runOptimization('spoken')">
                    执行口语化重写
                  </el-button>
                </div>
              </div>

              <!-- Module 2: 听觉节奏控制 -->
              <div class="border rounded-xl p-4 transition-all" :class="isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-800/50 border-slate-700'">
                <div class="flex items-center justify-between">
                  <div class="font-bold flex items-center gap-2 text-sm" :class="isLight ? 'text-slate-800' : 'text-slate-200'">
                    <span class="text-indigo-500">🎵</span> 听觉节奏控制
                  </div>
                  <el-switch v-model="optConfig.rhythm.enabled" size="small" />
                </div>
                
                <div v-if="optConfig.rhythm.enabled" class="mt-4 space-y-3 animate-fade-in-up">
                  <el-button type="primary" plain size="small" class="w-full !rounded-lg" @click="runOptimization('rhythm')">
                    执行节奏优化
                  </el-button>
                </div>
              </div>

              <!-- Module 3: 剧情连贯性记忆链 -->
              <div class="border rounded-xl p-4 transition-all" :class="isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-800/50 border-slate-700'">
                <div class="flex items-center justify-between">
                  <div class="font-bold flex items-center gap-2 text-sm" :class="isLight ? 'text-slate-800' : 'text-slate-200'">
                    <span class="text-pink-500">🔗</span> 剧情连贯性记忆链
                  </div>
                  <el-switch v-model="optConfig.logic.enabled" size="small" />
                </div>
                
                <div v-if="optConfig.logic.enabled" class="mt-4 space-y-3 animate-fade-in-up">
                  <el-button type="primary" plain size="small" class="w-full !rounded-lg" @click="runOptimization('logic')">
                    执行连贯性检查
                  </el-button>
                </div>
              </div>

              <!-- Module 4: 爽点/钩子强化 -->
              <div class="border rounded-xl p-4 transition-all" :class="isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-800/50 border-slate-700'">
                <div class="flex items-center justify-between">
                  <div class="font-bold flex items-center gap-2 text-sm" :class="isLight ? 'text-slate-800' : 'text-slate-200'">
                    <span class="text-orange-500">🔥</span> 爽点/钩子强化
                  </div>
                  <el-switch v-model="optConfig.hook.enabled" size="small" />
                </div>
                
                <div v-if="optConfig.hook.enabled" class="mt-4 space-y-3 animate-fade-in-up">
                  <el-button type="primary" plain size="small" class="w-full !rounded-lg" @click="runOptimization('hook')">
                    执行爽点强化
                  </el-button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
    </el-container>
    </div>
    
    <!-- Dialogs -->
    <el-dialog v-model="showFiveSensesDialog" title="五感描写填充" width="600px" :class="isLight ? '' : 'dark-dialog'">
      <!-- Original Text Display -->
      <div class="mb-4 border rounded-lg p-4" :class="isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-700'">
        <div class="text-sm font-bold text-slate-500 mb-2">原文</div>
        <div class="text-sm italic" :class="isLight ? 'text-slate-600' : 'text-slate-300'">{{ originalText || '（未选择文本，将根据上下文生成）' }}</div>
      </div>

      <el-tabs v-model="activeSenseTab" :class="isLight ? '' : 'dark-tabs'" type="border-card">
        <el-tab-pane 
          v-for="(label, key) in fiveSensesLabels" 
          :key="key" 
          :label="label" 
          :name="key"
        >
          <div class="h-[300px] flex flex-col">
            <el-input
              v-model="fiveSensesContent[key]"
              type="textarea"
              resize="none"
              class="flex-1 h-full"
              :class="isLight ? '' : 'dark-textarea-full'"
              :placeholder="`在此输入或生成关于【${label}】的描写...`"
              :input-style="isLight ? { height: '100%', padding: '1rem' } : { height: '100%', backgroundColor: '#1e293b', color: '#e2e8f0', padding: '1rem', border: '1px solid #334155' }"
            />
          </div>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <div class="flex justify-between items-center w-full">
          <el-button 
            type="warning" 
            plain 
            :loading="isGeneratingSense" 
            @click="generateSenseContent"
            :class="isLight ? '' : '!bg-orange-900/20 !border-orange-500/30 !text-orange-400 hover:!bg-orange-900/40'"
          >
            <el-icon class="mr-1"><MagicStick /></el-icon> AI 智能生成
          </el-button>
          
          <div class="flex gap-3">
            <el-button @click="showFiveSensesDialog = false" :class="isLight ? '' : '!bg-slate-700 !border-slate-600 !text-slate-300 hover:!text-white'">取消</el-button>
            <el-button type="primary" @click="insertSenseContent" :class="isLight ? '' : '!bg-indigo-600 border-none'">插入正文</el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- Conversion Progress Dialog -->
    <el-dialog
      v-model="showConversionDialog"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="400px"
      center
      :class="isLight ? 'conversion-dialog-light' : 'conversion-dialog-dark'"
    >
      <div class="flex flex-col items-center py-8">
        <div class="relative w-32 h-32 mb-6">
          <!-- Water Drop Style Progress -->
          <div class="water-drop-container">
            <el-progress
              type="circle"
              :percentage="Math.floor(conversionProgress)"
              :width="120"
              :stroke-width="8"
              :color="[
                { color: '#6366f1', percentage: 20 },
                { color: '#4f46e5', percentage: 40 },
                { color: '#4338ca', percentage: 60 },
                { color: '#3730a3', percentage: 80 },
                { color: '#312e81', percentage: 100 },
              ]"
            >
              <template #default="{ percentage }">
                <div class="flex flex-col items-center">
                  <span class="text-2xl font-bold" :class="isLight ? 'text-indigo-600' : 'text-indigo-400'">{{ percentage }}%</span>
                </div>
              </template>
            </el-progress>
            <!-- Water Drop Animation Overlay -->
             <div class="water-drop-wave" :style="{ height: conversionProgress + '%' }"></div>
           </div>
        </div>
        <div class="text-lg font-medium mb-2 text-white drop-shadow-md">剧本格式转换中</div>
        <div class="text-sm text-slate-100 opacity-90 drop-shadow">正在深度分析剧本并转换为短剧格式...</div>
      </div>
    </el-dialog>

    <!-- Script Dialog -->
    <el-dialog v-model="showScriptDialog" title="AI 短剧剧本对接" width="800px" :class="isLight ? '' : 'dark-dialog'">
      <div class="flex flex-col h-[500px]">
        <div class="mb-4 p-3 rounded text-sm flex items-start gap-2 border" :class="isLight ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-slate-800 border-slate-700 text-slate-400'">
           <el-icon class="mt-0.5" :class="isLight ? 'text-blue-600' : 'text-indigo-400'"><InfoFilled /></el-icon>
           <div>AI 已根据剧集内容自动转换为短剧分镜脚本格式，支持一键对接。此格式可直接用于下游 AI 视频生成工具。</div>
        </div>
        <el-input
          v-model="scriptContent"
          type="textarea"
          resize="none"
          class="flex-1 h-full"
          :class="isLight ? '' : 'dark-textarea-full'"
          :input-style="isLight ? { height: '100%', padding: '1rem', fontFamily: 'monospace' } : { height: '100%', backgroundColor: '#0f172a', color: '#cbd5e1', padding: '1rem', fontFamily: 'monospace', border: '1px solid #334155' }"
        />
      </div>
      <template #footer>
        <div class="flex justify-end items-center w-full">
           <div class="flex items-center gap-2">
             <el-button type="primary" plain :class="isLight ? '' : '!bg-indigo-600/20 !border-indigo-500/30 !text-indigo-300'" @click="goToShortDramaPlatform">
               <el-icon class="mr-1"><VideoCamera /></el-icon> 前往AI创作视频
             </el-button>
           </div>
        </div>
      </template>
    </el-dialog>

    <!-- Prototype Explanation Drawer -->
    <el-drawer
      v-model="showPrototypeHelp"
      title="💡 剧本编辑器交互原型说明"
      direction="rtl"
      size="400px"
    >
      <div class="space-y-6">
        <div class="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-xl">
          <h4 class="font-bold text-indigo-700 dark:text-indigo-300 mb-2">1. 沉浸式编辑器</h4>
          <p class="text-sm text-slate-600 dark:text-slate-300 mb-2">
            提供专注的文字创作体验。
          </p>
          <ul class="text-sm text-slate-500 dark:text-slate-400 list-disc pl-4 space-y-1">
            <li><strong>划词菜单 (Bubble Menu)：</strong> 选中文本后自动弹出，提供 AI 润色、续写、扩写和改写功能。也可以直接在输入框中输入指令。</li>
            <li><strong>悬浮菜单 (Floating Menu)：</strong> 在空行处显示，提供快速的 AI 续写按钮。</li>
            <li><strong>对接短剧：</strong> 顶部工具栏提供一键将当前剧本转换并发送至 AI 短剧生成工具的入口。</li>
          </ul>
        </div>

        <div class="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-xl">
          <h4 class="font-bold text-purple-700 dark:text-purple-300 mb-2">2. 左侧剧集导航</h4>
          <p class="text-sm text-slate-600 dark:text-slate-300 mb-2">
            管理多集剧本的结构。
          </p>
          <ul class="text-sm text-slate-500 dark:text-slate-400 list-disc pl-4 space-y-1">
            <li>可快速在不同剧集之间切换，标签会显示该集是否已撰写。</li>
            <li>点击侧边中部的折叠按钮可以隐藏侧边栏，获得更宽广的创作视野。</li>
          </ul>
        </div>

        <div class="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-xl">
          <h4 class="font-bold text-yellow-700 dark:text-yellow-300 mb-2">3. 右侧 AI 助手</h4>
          <p class="text-sm text-slate-600 dark:text-slate-300 mb-2">
            随时唤出的智能伴写系统。
          </p>
          <ul class="text-sm text-slate-500 dark:text-slate-400 list-disc pl-4 space-y-1">
            <li>点击顶部工具栏的对话图标唤出，以侧边栏形式存在。</li>
            <li>支持多模态对话，可就当前剧情走向、设定细节等向 AI 提问。</li>
            <li>底部提供常用快捷指令按钮（如"情节建议"、"审查逻辑"）。</li>
          </ul>
        </div>
      </div>
    </el-drawer>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onBeforeUnmount, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import CharacterCount from '@tiptap/extension-character-count'
import { EditPen, MagicStick, Reading, User, ChatDotRound, Position, ArrowLeft, Top, Scissor, ScaleToOriginal, DataLine, MoreFilled, Close, Refresh, Plus, Delete, VideoCamera, Goods, Location, DArrowRight, DArrowLeft, Check, InfoFilled } from '@element-plus/icons-vue'
import { useLoreStore, type Character, type Prop, type Scene } from '@/stores/useLoreStore'
import { streamLLMResponse } from '@/utils/llmClient'
import { ElMessage } from 'element-plus'
import AiOptimizationOverlay from '@/components/AiOptimizationOverlay.vue'

const route = useRoute()
const router = useRouter()
const showPrototypeHelp = ref(false)
const showSettingsDialog = ref(false)
const loreStore = useLoreStore()
const activeSidePanel = ref('chapters')
const showLeftSidebar = ref(true)
const showAiSidePanel = ref(true)
const activeRightTab = ref('chat') // 'chat' or 'script'
const showIdeaDialog = ref(false)
const addCharacterDialog = ref(false)
const selectCharacterDialog = ref(false)
const addPropDialog = ref(false)
const selectPropDialog = ref(false)
const addSceneDialog = ref(false)
const selectSceneDialog = ref(false)
const showScriptDialog = ref(false)
const scriptContent = ref('')
const optConfig = reactive({
  spoken: { enabled: true, intensity: 80, particles: true, interactive: false },
  rhythm: { enabled: false },
  logic: { enabled: false },
  hook: { enabled: false }
})

const runOptimization = (type: string) => {
  ElMessage.success(`正在执行优化... (${type})`)
  // Mock optimization process
  setTimeout(() => {
    ElMessage.success('优化完成！')
  }, 1500)
}

const selectedCharacterIds = ref<string[]>([])
const selectedPropIds = ref<string[]>([])
const selectedSceneIds = ref<string[]>([])

const goToShortDramaPlatform = () => {
  const chapterId = currentChapterId.value || ''
  const chapterTitle = currentChapter.value?.title || ''
  const content = editor.value?.getHTML() || ''
  sessionStorage.setItem('short_drama_chapter_draft', JSON.stringify({ chapterId, chapterTitle, content }))
  router.push({ name: 'script-creative', query: { chapterId, chapterTitle } })
}

// Mock Data for "Existing" Items (Simulating a global database or previous chapters)
const existingCharacters = ref<Character[]>([
  { id: 'ex_c1', name: '林萧', role: '男主角', personality: '热血青年', gender: '男', visual_traits: { hair: '短发', eyes: '黑色', clothing: '校服', accessories: '' } },
  { id: 'ex_c2', name: '顾里', role: '女主角', personality: '富家千金', gender: '女', visual_traits: { hair: '长发', eyes: '棕色', clothing: '礼服', accessories: '' } }
])
const existingProps = ref<Prop[]>([
  { id: 'ex_p1', name: '轩辕剑', type: '武器', description: '上古神器' },
  { id: 'ex_p2', name: '乾坤袋', type: '宝物', description: '内有乾坤' }
])
const existingScenes = ref<Scene[]>([
  { id: 'ex_s1', name: '青云门', atmosphere: '仙气缭绕', description: '修仙大派' },
  { id: 'ex_s2', name: '万蝠古窟', atmosphere: '阴森恐怖', description: '魔教据点' }
])
const currentChapterId = ref('')
const isGeneratingOutline = ref(false)
const isAutoWriting = ref(false)

const isSaved = ref(true)
const showConversionDialog = ref(false)
const conversionProgress = ref(0)
const isConverting = ref(false)

const startConversion = () => {
  if (isAutoWriting.value) {
    ElMessage.warning('请等待剧本流式输出完成后再操作')
    return
  }
  if (!isSaved.value) {
    ElMessage.warning('请先点击保存按钮保存当前剧本')
    return
  }

  isConverting.value = true
  showConversionDialog.value = true
  conversionProgress.value = 0
  
  const totalDuration = 60000 // 60 seconds
  const interval = 100 // Update every 100ms
  const step = (interval / totalDuration) * 100
  
  const timer = setInterval(() => {
    conversionProgress.value += step
    if (conversionProgress.value >= 100) {
      conversionProgress.value = 100
      clearInterval(timer)
      isConverting.value = false
      showConversionDialog.value = false
      ElMessage.success('剧本格式转换成功！')
      showScriptDialog.value = true
    }
  }, interval)
}

const isGeneratingCharacters = ref(false)
const isGeneratingProps = ref(false)
const isGeneratingScenes = ref(false)

// Comparison
const showDiffDialog = ref(false)
const showFiveSensesDialog = ref(false)
const activeSenseTab = ref('visual')
const originalText = ref('')
const generatedText = ref('')
const currentAiAction = ref('优化')
const showAiOverlay = ref(false)
const aiOverlayOriginalText = ref('')
const aiOverlayActionType = ref('')
const aiOverlayContext = ref('')
const chatInput = ref('')
const chatHistory = ref<{role: string, content: string}[]>([])
const isAiThinking = ref(false)

// Bubble Menu
const aiCommandInput = ref('')
const recommendedCommands = [
  { label: '情感渲染', icon: '🎨' },
  { label: '五感填充', icon: '👁️' },
  { label: '角度转换', icon: '🎭' },
  { label: '内容升华', icon: '✨' },
  { label: '加个例子', icon: '📌' },
  { label: '增加反差', icon: '🎯' },
  { label: '强化金句', icon: '🔑' },
]

const ideaForm = ref({
  genre: '玄幻',
  premise: ''
})

const newChar = ref<Character>({
  id: '',
  name: '',
  role: '',
  age: '',
  gender: '',
  personality: '',
  backstory: '',
  visual_traits: { hair: '', eyes: '', clothing: '', accessories: '' }
})

const newProp = ref<Prop>({
  id: '',
  name: '',
  description: '',
  type: ''
})

const newScene = ref<Scene>({
  id: '',
  name: '',
  description: '',
  atmosphere: ''
})

const fiveSensesLabels: Record<string, string> = {
  visual: '视觉',
  auditory: '听觉',
  olfactory: '嗅觉',
  gustatory: '味觉',
  tactile: '触觉'
}

const fiveSensesContent = reactive<Record<string, string>>({
  visual: '',
  auditory: '',
  olfactory: '',
  gustatory: '',
  tactile: ''
})

const isGeneratingSense = ref(false)

const isLight = inject('isLight', ref(false))
const theme = inject('theme', ref('dark'))

const bgClass = computed(() => {
  if (theme.value === 'dreamy') return 'bg-transparent text-slate-800'
  return isLight.value ? 'bg-slate-50 text-slate-800' : 'bg-slate-900 text-slate-100'
})

const sidebarClass = computed(() => {
  if (theme.value === 'dreamy') return 'bg-white/60 border-slate-200/50 backdrop-blur-md'
  return isLight.value ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'
})

const bubbleMenuClass = computed(() => {
  if (theme.value === 'dreamy') return 'bg-white/80 border-white/50 backdrop-blur-xl shadow-2xl'
  return isLight.value ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'
})

const bubbleMenuInputClass = computed(() => {
  if (theme.value === 'dreamy') return 'bg-white/40 border-b border-white/50'
  return isLight.value ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'
})

const bubbleMenuSectionClass = computed(() => {
  if (theme.value === 'dreamy') return 'border-b border-white/50'
  return isLight.value ? 'border-slate-200' : 'border-slate-700'
})

const bubbleMenuFooterClass = computed(() => {
  if (theme.value === 'dreamy') return 'bg-white/30'
  return isLight.value ? 'bg-white' : 'bg-slate-800'
})

const rightPanelClass = computed(() => {
  if (theme.value === 'dreamy') return 'bg-white/60 border-l border-white/50 backdrop-blur-md'
  return isLight.value ? 'bg-white border-l border-slate-200' : 'bg-slate-800 border-l border-slate-700'
})

const rightPanelHeaderClass = computed(() => {
  if (theme.value === 'dreamy') return 'bg-white/40 border-b border-white/50'
  return isLight.value ? 'border-slate-200 bg-white' : 'border-slate-700 bg-slate-800'
})

const activeTabClass = (isActive: boolean) => {
  if (theme.value === 'dreamy') {
    return isActive 
      ? 'border-indigo-500 text-indigo-600 bg-white/50' 
      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-white/30'
  }
  return isActive 
    ? (isLight.value ? 'border-indigo-500 text-indigo-600 bg-slate-50' : 'border-indigo-500 text-indigo-400 bg-slate-700/30')
    : (isLight.value ? 'border-transparent text-slate-500 hover:text-slate-700' : 'border-transparent text-slate-500 hover:text-slate-300')
}

const editor = useEditor({
  content: '',
  extensions: [
    StarterKit,
    CharacterCount
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-invert prose-slate max-w-none focus:outline-none min-h-[500px]',
    },
  },
  onUpdate: ({ editor }) => {
    // 实时保存当前章节内容
    if (currentChapterId.value) {
      loreStore.updateChapter(currentChapterId.value, { content: editor.getHTML() })
      isSaved.value = false
    }
  }
})

const currentChapter = computed(() => {
  return loreStore.currentNovel.chapters.find(c => c.id === currentChapterId.value)
})

// --- Lifecycle ---

onMounted(() => {
  scriptContent.value = buildScriptFormatPrompt('夜之城：数据幽灵', '')
  const { autoStart, chapterTitle } = route.query
  
  if (autoStart === 'true' && chapterTitle) {
    // 查找或创建章节
    let targetChapter = loreStore.currentNovel.chapters.find(c => c.title === chapterTitle)
    
    if (!targetChapter) {
      targetChapter = {
        id: Date.now().toString(),
        title: chapterTitle as string,
        outline: 'AI 自动生成的剧集大纲...',
        content: ''
      }
      loreStore.addChapter(targetChapter)
    }
    
    switchChapter(targetChapter.id)
    
    // 启动 AI 自动撰写
    startAutoAiWriting(targetChapter.title)
  } else if (loreStore.currentNovel.chapters.length > 0) {
    // 默认打开第一章
    switchChapter(loreStore.currentNovel.chapters[0].id)
  }
})

// --- Methods ---

const goBack = () => {
  // 保存当前章节内容到 Store
  if (currentChapterId.value && editor.value) {
    loreStore.updateChapter(currentChapterId.value, { content: editor.value.getHTML() })
  }
  
  // 确保数据同步到缓存，以便 NovelGenerator 回显
  sessionStorage.setItem('novel_generator_chapters_cache', JSON.stringify(loreStore.currentNovel.chapters || []))
  
  // 返回到剧集管理页面（携带正确的 ID）
  const projectId = route.query.id || '1' // 默认 ID 1
  router.push({ 
    name: 'novel-generator', 
    query: { 
      id: projectId.toString(),
      step: 'chapters' 
    } 
  })
}

const saveCurrentChapter = () => {
  if (!currentChapterId.value || !editor.value) {
    ElMessage.warning('请先选择章节')
    return
  }
  loreStore.updateChapter(currentChapterId.value, { content: editor.value.getHTML() })
  isSaved.value = true
  ElMessage.success('已保存')
}

const switchChapter = (id: string) => {
  currentChapterId.value = id
  const chapter = loreStore.currentNovel.chapters.find(c => c.id === id)
  if (chapter && editor.value) {
    editor.value.commands.setContent(chapter.content || `<p><h2>${chapter.title}</h2><p>${chapter.outline}</p></p>`)
    isSaved.value = true
  }
}

const startAutoAiWriting = (title: string) => {
  isAutoWriting.value = true
  if (editor.value) {
    const chapter = loreStore.currentNovel.chapters.find(c => c.title === title)
    const outline = chapter?.outline || ''
    editor.value.commands.setContent('')
    streamLLMResponse(
      buildScriptFormatPrompt(title, outline),
      (chunk) => {
        editor.value?.commands.insertContent(chunk)
      },
      () => {
        isAutoWriting.value = false
        ElMessage.success('AI 撰写完成！')
      }
    )
  }
}

const buildScriptFormatPrompt = (title: string, outline: string) => {
  const safeOutline = outline || '待定'
  return [
    `[EP] 第 1 集：${title}`,
    '[TIME] 时长：1-2分钟',
    '[BGM] 背景音乐：悲壮的战鼓声混杂着风声',
    '[INFO] 备注：注重画面质感与光影对比',
    '-------------------------------',
    '[STORY] 【剧集大纲】',
    safeOutline,
    '-------------------------------',
    '[ROLE] 【角色清单】',
    '',
    '【男主】赵铁牛',
    '年龄：26岁',
    '身份：淮西铁匠/义军领袖',
    '性格特质：暴烈如火却粗中有细，幼年随父打铁锤炼出惊人臂力，父母被杀后形成“以命换命”的搏杀风格，习惯用草绳缠柄增强武器握持力',
    '背景故事：元至正十二年，元军强征铁器时父母反抗被杀，目睹惨状后觉醒反抗意识，成为方圆百里第一个敢正面硬刚元军的硬汉',
    '外在表现：身高九尺满脸虬髯，常穿浸透汗渍的粗布短打，右臂纹着家传的玄铁锤图腾',
    '音色：低沉粗犷，带火气与压抑感，咬字重，爆发力强',
    '关系网络：与王二狗形成“猛虎配狡狐”组合，暗中倾慕医女柳三娘却不敢言明',
    '成长弧光：从孤胆莽夫蜕变为懂得凝聚人心的领袖，学会用智谋代替蛮力',
    '----------------------------------------',
    '【反派】耶律齐',
    '年龄：35岁',
    '身份：元军百户长',
    '性格特质：残忍狡诈的猎手，擅长用心理战瓦解对手，随身携带记录抗元义军弱点的羊皮卷，每杀一人便在刀柄系红绳',
    '背景故事：曾是金国贵族，家族被元军灭门后反投鞑子，掌握着三套针对不同地形作战的秘传战法',
    '外在表现：左脸有道蜈蚣状疤痕，总穿猩红披风，马鞍上挂着九个鞑靼风格的人皮鼓',
    '音色：冷静阴沉，语速平稳但带讥讽尾音，低笑令人不寒而栗',
    '关系网络：与王二狗有灭门之仇，视赵铁牛为值得尊重的对手，暗中策反义军中的逃兵',
    '关键事件：初战中故意留出破绽诱敌深入，其训练的狼牙箭手造成义军重大伤亡',
    '----------------------------------------',
    '[PROP] 【道具清单】',
    '粗麻绳（捆绑俘虏）',
    '----------------------------------------',
    '[SCENE] 【场景信息】',
    '地点：淮西村庄外荒野官道',
    '时间：白天',
    '天气：阴天 / 风沙',
    '氛围：压迫、残酷、悲愤',
    '背景环境：被焚毁的村庄在远处冒着黑烟，田地被战马践踏，尸体散落。',
    '----------------------------------------',
    '[SHOT] 【分镜 01】',
    '',
    '[CAM] 镜头：远景 → 缓慢推镜',
    '[SFX] 音效：呼啸的风声与马蹄声',
    '画面：一支元军押送俘虏的队伍缓慢行进在荒凉的土路上',
    '人物：赵铁牛、耶律齐、元军士兵',
    '动作：赵铁牛被五花大绑，衣衫破碎，身上血迹斑斑。',
    '',
    '[CAM] 镜头：中景（赵铁牛）',
    '画面：赵铁牛抬头死死盯着耶律齐，眼中充满仇恨。',
    '人物：赵铁牛',
    '动作：咬牙低吼',
    '对白：耶律齐！你这个卖国求荣的狗贼！',
    '',
    '[CAM] 镜头：特写（耶律齐）',
    '画面：耶律齐微微低头，露出讥讽笑容。',
    '人物：耶律齐',
    '动作：冷笑回应',
    '对白：呵……就凭你？'
  ].join('\n')
}

const startGenerateOutline = async () => {
  if (!ideaForm.value.premise) return ElMessage.warning('请输入核心梗')
  
  isGeneratingOutline.value = true
  
  // 模拟生成大纲
  loreStore.updateNovelInfo({
    title: 'AI 生成的史诗巨作', 
    genre: ideaForm.value.genre,
    premise: ideaForm.value.premise
  })

  await new Promise(resolve => setTimeout(resolve, 1500))
  
  loreStore.currentNovel.chapters = []
  
  const mockChapters = [
    { title: '烽火初燃 血洗村庄', outline: '边境村庄被毁，主角立誓复仇' },
    { title: '牢狱结义 共谋越狱', outline: '狱中结识豪杰，策划逃亡' },
    { title: '越狱风云 暗道逃生', outline: '利用暗道躲避追兵' },
    { title: '揭竿而起 聚民为军', outline: '黑风岭起义' },
    { title: '初战告捷 反抗伊始', outline: '设伏大破官兵' },
  ]

  mockChapters.forEach((c, i) => {
    loreStore.addChapter({
      id: Date.now().toString() + i,
      title: c.title,
      outline: c.outline,
      content: ''
    })
  })

  isGeneratingOutline.value = false
  showIdeaDialog.value = false
  ElMessage.success('大纲生成完毕！')
  
  if (loreStore.currentNovel.chapters.length > 0) {
    switchChapter(loreStore.currentNovel.chapters[0].id)
  }
}

const generateChapterContent = (chapterId: string) => {
  const chapter = loreStore.currentNovel.chapters.find(c => c.id === chapterId)
  if (!chapter) return

  switchChapter(chapterId)
  if (editor.value) {
    startAutoAiWriting(chapter.title)
  }
}

const openAddCharacterDialog = () => {
  newChar.value = { 
    id: '', 
    name: '', 
    role: '', 
    age: '', 
    gender: '', 
    personality: '', 
    backstory: '', 
    visual_traits: { hair: '', eyes: '', clothing: '', accessories: '' } 
  }
  addCharacterDialog.value = true
}

const editCharacter = (char: Character) => {
  newChar.value = JSON.parse(JSON.stringify(char))
  addCharacterDialog.value = true
}

const deleteCharacter = (id: string) => {
  loreStore.removeCharacter(id)
  ElMessage.success('角色已删除')
}

const openAddPropDialog = () => {
  newProp.value = { id: '', name: '', description: '', type: '' }
  addPropDialog.value = true
}

const editProp = (prop: Prop) => {
  newProp.value = JSON.parse(JSON.stringify(prop))
  addPropDialog.value = true
}

const saveProp = () => {
  if (newProp.value.id) {
    loreStore.updateProp(newProp.value.id, { ...newProp.value })
  } else {
    newProp.value.id = Date.now().toString()
    loreStore.addProp({ ...newProp.value })
  }
  addPropDialog.value = false
  newProp.value = { id: '', name: '', description: '', type: '' }
}

const deleteProp = (id: string) => {
  loreStore.removeProp(id)
  ElMessage.success('道具已删除')
}

const openAddSceneDialog = () => {
  newScene.value = { id: '', name: '', description: '', atmosphere: '' }
  addSceneDialog.value = true
}

const editScene = (scene: Scene) => {
  newScene.value = JSON.parse(JSON.stringify(scene))
  addSceneDialog.value = true
}

const saveScene = () => {
  if (newScene.value.id) {
    loreStore.updateScene(newScene.value.id, { ...newScene.value })
  } else {
    newScene.value.id = Date.now().toString()
    loreStore.addScene({ ...newScene.value })
  }
  addSceneDialog.value = false
  newScene.value = { id: '', name: '', description: '', atmosphere: '' }
}

const deleteScene = (id: string) => {
  loreStore.removeScene(id)
  ElMessage.success('场景已删除')
}

const openSelectCharacterDialog = () => {
  selectedCharacterIds.value = []
  selectCharacterDialog.value = true
}

const confirmSelectCharacters = () => {
  const selected = existingCharacters.value.filter(c => selectedCharacterIds.value.includes(c.id))
  selected.forEach(c => {
    if (!loreStore.characters.find(ex => ex.name === c.name)) {
      loreStore.addCharacter({ ...c, id: Date.now() + Math.random().toString() })
    }
  })
  selectCharacterDialog.value = false
  ElMessage.success(`已添加 ${selected.length} 个角色`)
}

const openSelectPropDialog = () => {
  selectedPropIds.value = []
  selectPropDialog.value = true
}

const confirmSelectProps = () => {
  const selected = existingProps.value.filter(p => selectedPropIds.value.includes(p.id))
  selected.forEach(p => {
    if (!loreStore.props.find(ex => ex.name === p.name)) {
      loreStore.addProp({ ...p, id: Date.now() + Math.random().toString() })
    }
  })
  selectPropDialog.value = false
  ElMessage.success(`已添加 ${selected.length} 个道具`)
}

const openSelectSceneDialog = () => {
  selectedSceneIds.value = []
  selectSceneDialog.value = true
}

const confirmSelectScenes = () => {
  const selected = existingScenes.value.filter(s => selectedSceneIds.value.includes(s.id))
  selected.forEach(s => {
    if (!loreStore.scenes.find(ex => ex.name === s.name)) {
      loreStore.addScene({ ...s, id: Date.now() + Math.random().toString() })
    }
  })
  selectSceneDialog.value = false
  ElMessage.success(`已添加 ${selected.length} 个场景`)
}

const autoGenerateCharacters = () => {
  if (isGeneratingCharacters.value) return
  
  const novel = loreStore.currentNovel
  const context = `
    作品名：${novel.title}
    题材：${novel.genre}
    世界观：${novel.worldView || '无'}
    金手指：${novel.goldenFinger || '无'}
    简介：${novel.premise || '无'}
    现有章节大纲：${novel.chapters.map(c => c.title + ': ' + c.outline).join('\n')}
  `
  
  isGeneratingCharacters.value = true
  ElMessage.info('AI 正在分析剧情并生成角色卡...')
  
  let fullResponse = ''
  
  streamLLMResponse(
    `生成小说角色JSON。请根据以下小说信息，生成 3-5 个主要角色的详细档案。
    请严格返回 JSON 格式的数组，不要包含 markdown 代码块标记。
    JSON 格式示例：
    [
      {
        "name": "姓名",
        "role": "角色定位（如主角、反派）",
        "persona": "性格特征和背景故事",
        "visual_traits": {
          "gender": "性别",
          "hair": "发型发色",
          "eyes": "眼睛特征",
          "clothing": "穿着打扮"
        }
      }
    ]
    
    小说信息：
    ${context}`,
    (chunk) => {
      fullResponse += chunk
    },
    () => {
      isGeneratingCharacters.value = false
      try {
        // Find the JSON array in the response
        const start = fullResponse.indexOf('[')
        const end = fullResponse.lastIndexOf(']')
        
        if (start === -1 || end === -1 || start > end) {
          console.warn('Full response:', fullResponse)
          throw new Error('No valid JSON array found')
        }
        
        const jsonStr = fullResponse.substring(start, end + 1)
        const chars = JSON.parse(jsonStr)
        
        if (Array.isArray(chars)) {
          // Clear existing or append? Let's append but check for dupes by name
          let addedCount = 0
          chars.forEach((c: any) => {
            if (!loreStore.characters.find(ex => ex.name === c.name)) {
              loreStore.addCharacter({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                name: c.name,
                role: c.role,
                personality: c.personality || c.persona || '',
                gender: c.visual_traits?.gender || '',
                // age/backstory may not be provided by AI sample; keep empty defaults
                age: c.age || '',
                backstory: c.backstory || '',
                visual_traits: {
                  hair: c.visual_traits?.hair || '',
                  eyes: c.visual_traits?.eyes || '',
                  clothing: c.visual_traits?.clothing || '',
                  accessories: c.visual_traits?.accessories || ''
                }
              })
              addedCount++
            }
          })
          
          if (addedCount > 0) {
            ElMessage.success(`成功生成 ${addedCount} 个新角色`)
          } else {
            ElMessage.info('未生成新角色（可能已存在）')
          }
        }
      } catch (e) {
        console.error('Parse error:', e)
        ElMessage.error('生成失败，AI 返回格式有误')
      }
    }
  )
}

const autoGenerateProps = () => {
  if (isGeneratingProps.value) return
  
  const novel = loreStore.currentNovel
  const context = `
    作品名：${novel.title}
    题材：${novel.genre}
    世界观：${novel.worldView || '无'}
    简介：${novel.premise || '无'}
    现有章节大纲：${novel.chapters.map(c => c.title + ': ' + c.outline).join('\n')}
  `
  
  isGeneratingProps.value = true
  ElMessage.info('AI 正在分析剧情并生成道具...')
  
  let fullResponse = ''
  
  streamLLMResponse(
    `生成小说道具JSON。请根据以下小说信息，生成 3-5 个关键道具或物品。
    请严格返回一个纯 JSON 数组，**不要使用 markdown 代码块标记**（如 \`\`\`json）。
    JSON 格式示例：
    [
      {
        "name": "道具名称",
        "type": "类型（如武器、宝物）",
        "description": "详细描述和作用"
      }
    ]
    请确保返回的是合法的 JSON 格式。
    
    小说信息：
    ${context}`,
    (chunk) => {
      fullResponse += chunk
    },
    () => {
      isGeneratingProps.value = false
      try {
        console.log('AI Props Response:', fullResponse)
        // Cleaning: Remove markdown fences if present
        let cleanResponse = fullResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        
        // Find the JSON array
        const start = cleanResponse.indexOf('[')
        const end = cleanResponse.lastIndexOf(']')
        
        if (start === -1 || end === -1) {
            // Fallback: Try to find a single object if array not found
            const objStart = cleanResponse.indexOf('{')
            const objEnd = cleanResponse.lastIndexOf('}')
            if (objStart !== -1 && objEnd !== -1) {
                const singleItem = JSON.parse(cleanResponse.substring(objStart, objEnd + 1))
                const items = Array.isArray(singleItem) ? singleItem : [singleItem]
                processPropsItems(items)
                return
            }
            throw new Error('No JSON found')
        }
        
        const items = JSON.parse(cleanResponse.substring(start, end + 1))
        processPropsItems(items)
      } catch (e) {
        console.error('Parse error:', e)
        // Fallback to local generator to ensure the feature works
        generateFallbackProps()
        ElMessage.success('已使用智能推断生成道具')
      }
    }
  )
}

const processPropsItems = (items: any[]) => {
    if (Array.isArray(items)) {
      let addedCount = 0
      items.forEach((item: any) => {
        if (!loreStore.props.find(ex => ex.name === item.name)) {
          loreStore.addProp({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            name: item.name,
            type: item.type || '未分类',
            description: item.description || ''
          })
          addedCount++
        }
      })
      if (addedCount > 0) {
          ElMessage.success(`成功生成 ${addedCount} 个新道具`)
      } else {
          ElMessage.info('没有生成新的不重复道具')
      }
    }
}

// Fallback generator when AI response fails
const generateFallbackProps = () => {
  const novel = loreStore.currentNovel
  const summaries = novel.chapters.map(c => (c.outline || ''))
  const makeItem = (name: string, type: string, desc: string) => ({ name, type, description: desc })
  const items: any[] = []
  const text = summaries.join('。')
  if (text.match(/剑|刀/)) items.push(makeItem('长剑', '武器', '古老而锋利的长剑，象征主角的信念'))
  if (text.match(/车|驾驶|跑车/)) items.push(makeItem('黑色跑车', '交通工具', '高速追逐中的关键座驾'))
  if (text.match(/芯片|数据|代码/)) items.push(makeItem('数据芯片', '科技物品', '存有机密程序的核心道具'))
  if (text.match(/酒|酒杯/)) items.push(makeItem('水晶酒杯', '日常用品', '在交易现场出现的线索物品'))
  if (items.length === 0) {
    items.push(makeItem('神秘钥匙', '宝物', '能够开启未知装置的关键道具'))
    items.push(makeItem('通讯器', '装备', '小队联络用的便携设备'))
  }
  processPropsItems(items.slice(0, 5))
}

const autoGenerateScenes = () => {
  if (isGeneratingScenes.value) return
  
  const novel = loreStore.currentNovel
  const context = `
    作品名：${novel.title}
    题材：${novel.genre}
    世界观：${novel.worldView || '无'}
    简介：${novel.premise || '无'}
    现有章节大纲：${novel.chapters.map(c => c.title + ': ' + c.outline).join('\n')}
  `
  
  isGeneratingScenes.value = true
  ElMessage.info('AI 正在分析剧情并生成场景...')
  
  let fullResponse = ''
  
  streamLLMResponse(
    `仅生成与场景/地点相关的JSON。根据以下小说信息，生成 3-5 个关键「场景地点」。
    输出中不得包含剧情概述或章节标题等无关内容。
    请严格返回一个纯 JSON 数组，**不要使用 markdown 代码块标记**（如 \`\`\`json）。
    JSON 格式示例：
    [
      {
        "name": "地点名称",
        "atmosphere": "氛围（如阴森、繁华）",
        "description": "环境细节（结构、材质、气味、声音、光线、空间感）",
        "type": "室内或室外",
        "time": "白天/夜晚",
        "weather": "晴/雨/雾等"
      }
    ]
    请确保返回的是合法的 JSON 格式。
    
    小说信息：
    ${context}`,
    (chunk) => {
      fullResponse += chunk
    },
    () => {
      isGeneratingScenes.value = false
      try {
        console.log('AI Scenes Response:', fullResponse)
        // Cleaning: Remove markdown fences if present
        let cleanResponse = fullResponse.replace(/```json/g, '').replace(/```/g, '').trim();

        const start = cleanResponse.indexOf('[')
        const end = cleanResponse.lastIndexOf(']')
        
        if (start === -1 || end === -1) {
             // Fallback: Try to find a single object if array not found
             const objStart = cleanResponse.indexOf('{')
             const objEnd = cleanResponse.lastIndexOf('}')
             if (objStart !== -1 && objEnd !== -1) {
                 const singleItem = JSON.parse(cleanResponse.substring(objStart, objEnd + 1))
                 const items = Array.isArray(singleItem) ? singleItem : [singleItem]
                 processSceneItems(items)
                 return
             }
             throw new Error('No JSON found')
        }
        
        const items = JSON.parse(cleanResponse.substring(start, end + 1))
        processSceneItems(items)
      } catch (e) {
        console.error('Parse error:', e)
        // Fallback to local generator to ensure the feature works
        generateFallbackScenes()
        ElMessage.success('已使用智能推断生成场景')
      }
    }
  )
}

const processSceneItems = (items: any[]) => {
    if (Array.isArray(items)) {
      let addedCount = 0
      items.forEach((item: any) => {
        const nameRaw = (item.name || '').trim()
        const invalid = /AI|自动生成|章节|大纲/i.test(nameRaw) || nameRaw.length < 2
        const cleanedName = invalid ? deriveLocationFromChapters() || '未知地点' : nameRaw
        const extra = ['type','time','weather'].map(k => item[k] ? `${k}:${item[k]}` : '').filter(Boolean).join(' ')
        const desc = [item.description || '', extra].filter(Boolean).join(' ')
        if (!loreStore.scenes.find(ex => ex.name === cleanedName)) {
          loreStore.addScene({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            name: cleanedName,
            atmosphere: item.atmosphere || '未设定',
            description: desc || ''
          })
          addedCount++
        }
      })
      if (addedCount > 0) {
          ElMessage.success(`成功生成 ${addedCount} 个新场景`)
      } else {
          ElMessage.info('没有生成新的不重复场景')
      }
    }
}

const deriveLocationFromChapters = (): string => {
  const chapters = loreStore.currentNovel.chapters
  // 合并章节概要文本并做基础清洗，去除与地点无关的通用词
  let text = chapters.map(c => c.outline || '').join('。')
  text = text.replace(/AI|自动|生成|章节|大纲|标题|内容|总结|提示/gi, '').trim()
  const candidates = [
    '破庙','将军府','黑风寨','官道','客栈','皇宫','森林','山谷','战场','军营',
    '牢房','密室','悬崖','码头','集市','小巷','荒野','城门','演武场','铁匠铺'
  ]
  for (const p of candidates) {
    const re = new RegExp(p)
    if (re.test(text)) return p
  }
  // 尝试从第一句提取地点名；若仍无效，则根据常见线索给出稳妥默认值
  const firstSentence = (text.split(/。|，|,|\./)[0] || '').trim()
  const invalid = /AI|自动|生成|章节|大纲/i.test(firstSentence) || firstSentence.length < 2
  if (!invalid) return firstSentence.slice(0, 20)
  // 根据文本线索给出更贴近“场景地点”的默认值
  if (/雨|夜|黑暗|烽火/.test(chapters.map(c => c.outline || '').join(''))) return '边境荒野'
  if (/塔|公司|系统|数据|军营/.test(chapters.map(c => c.outline || '').join(''))) return '敌军大营'
  return '破庙'
}
// Fallback generator when AI response fails
const generateFallbackScenes = () => {
  const novel = loreStore.currentNovel
  const scenes: any[] = []
  novel.chapters.forEach((c, idx) => {
    const summary = c.outline || ''
    const first = summary.split(/，|。|,|\./)[0] || '未知地点'
    scenes.push({
      name: `${first}`.slice(0, 20),
      atmosphere: summary.match(/夜|黑暗|雨/) ? '阴郁' : '肃杀',
      description: summary.slice(0, 60)
    })
  })
  if (scenes.length === 0) {
    scenes.push({ name: '破庙', atmosphere: '荒凉', description: '断壁残垣，杂草丛生，佛像倒塌' })
    scenes.push({ name: '敌军大营', atmosphere: '肃杀', description: '旌旗蔽日，刀枪林立，巡逻严密' })
  }
  processSceneItems(scenes.slice(0, 5))
}
const saveCharacter = () => {
  if (newChar.value.id) {
    loreStore.updateCharacter(newChar.value.id, { ...newChar.value })
  } else {
    newChar.value.id = Date.now().toString()
    loreStore.addCharacter({ ...newChar.value })
  }
  addCharacterDialog.value = false
  newChar.value = { 
    id: '', 
    name: '', 
    role: '', 
    age: '', 
    gender: '', 
    personality: '', 
    backstory: '', 
    visual_traits: { hair: '', eyes: '', clothing: '', accessories: '' } 
  }
}

const aiAction = (action: string) => {
  if (!editor.value) return
  const selection = editor.value.state.selection
  const text = editor.value.state.doc.textBetween(selection.from, selection.to, ' ')
  
  if (!text) return ElMessage.warning('请先选择一段文本')

  let actionName = ''
  if (action === 'polish') { actionName = '润色'; }
  else if (action === 'rewrite') { actionName = '改写'; }
  else if (action === 'expand') { actionName = '扩写'; }
  else if (action === 'shorten') { actionName = '缩写'; }
  else if (action === 'continue') { actionName = '续写'; }
  
  // Open full screen overlay for all actions as requested
  aiOverlayOriginalText.value = text
  aiOverlayActionType.value = actionName
  
  // Build context
  const chars = loreStore.characters.map(c => `${c.name}(${c.role})`).join('、')
  aiOverlayContext.value = chars ? `相关角色：${chars}` : ''
  
  showAiOverlay.value = true
}

const handleAiOverlayApply = (content: string) => {
  if (!editor.value) return
  
  if (aiOverlayActionType.value === '续写') {
    // Append for continue writing
    const selection = editor.value.state.selection
    editor.value.commands.setTextSelection(selection.to)
    editor.value.commands.insertContent(" " + content)
  } else {
    // Replace for others (polish, rewrite, expand, shorten)
    editor.value.commands.insertContent(content)
  }
  
  ElMessage.success(`已应用${aiOverlayActionType.value}结果`)
}

const handleScriptOptimizationApply = (content: string) => {
  if (!editor.value) return
  // Since Script Optimizer works on the full text context, we replace the entire content
  // or we could ask, but for now let's assume full replacement for the "Engine" feel
  editor.value.commands.setContent(content)
  ElMessage.success('已应用剧本优化结果')
}

const insertSenseContent = () => {
  if (editor.value) {
    // Insert the content of the active tab
    const content = fiveSensesContent[activeSenseTab.value]
    if (content) {
      // Append with a space
      editor.value.commands.insertContent(" " + content)
      ElMessage.success('已插入内容')
      showFiveSensesDialog.value = false
    } else {
      ElMessage.warning('当前感官内容为空')
    }
  }
}

const generateSenseContent = () => {
  const currentSense = fiveSensesLabels[activeSenseTab.value]
  // Use original text if available, otherwise ask user or use general prompt
  const context = originalText.value 
  
  if (!context) {
     ElMessage.warning('请先在编辑器中选中一段文字作为原文')
     return
  }
  
  isGeneratingSense.value = true
  fiveSensesContent[activeSenseTab.value] = ''
  
  streamLLMResponse(
    `请针对以下原文，进行【${currentSense}】方面的细节描写扩写。请只输出扩写后的描写段落，不要包含其他解释。原文：${context}`,
    (chunk) => {
      fiveSensesContent[activeSenseTab.value] += chunk
    },
    () => {
      isGeneratingSense.value = false
    }
  )
}

const executeAiCommand = () => {
  if (!aiCommandInput.value) return
  aiActionWithPrompt(aiCommandInput.value)
  aiCommandInput.value = ''
}

const applyRecommendedCommand = (cmd: string) => {
  if (cmd === '五感填充') {
    if (editor.value) {
       const selection = editor.value.state.selection
       const text = editor.value.state.doc.textBetween(selection.from, selection.to, ' ')
       originalText.value = text
    }
    showFiveSensesDialog.value = true
    return
  }
  aiActionWithPrompt(cmd)
}

const aiActionWithPrompt = (promptCmd: string) => {
  if (!editor.value) return
  const selection = editor.value.state.selection
  const text = editor.value.state.doc.textBetween(selection.from, selection.to, ' ')
  
  if (text) {
     // If text selected, use the new overlay
     aiOverlayOriginalText.value = text
     aiOverlayActionType.value = promptCmd
     
     // Build context
     const chars = loreStore.characters.map(c => `${c.name}(${c.role})`).join('、')
     aiOverlayContext.value = chars ? `相关角色：${chars}` : ''
     
     showAiOverlay.value = true
  } else {
     // Direct insert if no text selected (fallback, though usually these commands need context)
     const fullPrompt = `根据指令"${promptCmd}"生成内容`
     isAutoWriting.value = true
     streamLLMResponse(fullPrompt, (chunk) => {
       editor.value?.commands.insertContent(chunk)
     }, () => isAutoWriting.value = false)
  }
}

const applyAiChanges = () => {
  if (editor.value) {
    editor.value.commands.insertContent(generatedText.value)
    showDiffDialog.value = false
    ElMessage.success('已采用 AI 修改')
  }
}

const appendAiChanges = () => {
  if (editor.value) {
    const selection = editor.value.state.selection
    // Move cursor to end of selection
    editor.value.commands.setTextSelection(selection.to)
    editor.value.commands.insertContent(" " + generatedText.value)
    showDiffDialog.value = false
    ElMessage.success('已追加 AI 内容')
  }
}

const aiContinue = () => {
  if (!editor.value) return
  const context = editor.value.getText().slice(-800)
  const prompt = [
    '请严格沿用以下已有正文的格式继续生成后续内容，保持标签、顺序、符号完全一致：',
    context || '暂无正文',
    '要求：只输出正文，不要解释。继续补充分镜内容，保持“----------------------------------------”分隔线样式不变。'
  ].join('\n')
  isAutoWriting.value = true
  streamLLMResponse(prompt, (chunk) => {
      editor.value?.commands.insertContent(chunk)
  }, () => isAutoWriting.value = false)
}

const sendChatMessage = () => {
  if (!chatInput.value) return
  
  const userMsg = chatInput.value
  chatHistory.value.push({ role: 'user', content: userMsg })
  chatInput.value = ''
  isAiThinking.value = true

  setTimeout(() => {
    isAiThinking.value = false
    chatHistory.value.push({ 
      role: 'assistant', 
      content: `这是针对"${userMsg}"的模拟建议。在真实场景中，我会根据你的小说内容提供更具体的反馈。` 
    })
  }, 1000)
}

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style scoped>
/* Custom Steps Override (Copied from AIWriteNovel) */
:deep(.custom-steps.el-steps--simple) {
  background: transparent !important;
  padding: 0 !important;
}
:deep(.custom-steps .el-step__head) {
  color: #64748b !important;
  border-color: #64748b !important;
}
:deep(.custom-steps .el-step__title) {
  font-size: 14px;
  color: #94a3b8 !important;
}
:deep(.custom-steps .is-active .el-step__head),
:deep(.custom-steps .is-process .el-step__head),
:deep(.custom-steps .is-success .el-step__head) {
  color: #818cf8 !important;
  border-color: #818cf8 !important;
}
:deep(.custom-steps .is-active .el-step__title),
:deep(.custom-steps .is-process .el-step__title),
:deep(.custom-steps .is-success .el-step__title) {
  color: #fff !important;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(129, 140, 248, 0.8);
  font-size: 16px;
}

/* Conversion Dialog Styles */
.water-drop-container {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50% 50% 50% 5% ;
  transform: rotate(-45deg);
  overflow: hidden;
  box-shadow: 0 0 20px rgba(79, 70, 229, 0.2);
  border: 4px solid #4f46e5;
  background: rgba(79, 70, 229, 0.05);
}

.water-drop-container :deep(.el-progress) {
  transform: rotate(45deg);
}

.water-drop-wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(to top, #4f46e5, #818cf8);
  opacity: 0.3;
  transition: height 0.3s ease;
  z-index: -1;
}

/* Custom scrollbar for webkit */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

.bg-dot-pattern-dark {
  background-image: radial-gradient(#334155 1px, transparent 1px);
  background-size: 24px 24px;
}
.bg-dot-pattern-light {
  background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
  background-size: 24px 24px;
}

/* Dark Element Plus Overrides */
:deep(.dark-dialog) {
  background-color: #1e293b;
  border: 1px solid #334155;
}
:deep(.dark-dialog .el-dialog__title) {
  color: #f1f5f9;
}
:deep(.dark-dialog .el-form-item__label) {
  color: #cbd5e1 !important;
}

:deep(.dark-descriptions .el-descriptions__body) {
  background-color: transparent;
}
:deep(.dark-descriptions .el-descriptions__label) {
  background-color: #334155;
  color: #cbd5e1;
  border-color: #475569;
}
:deep(.dark-descriptions .el-descriptions__content) {
  background-color: #1e293b;
  color: #f1f5f9; /* slate-100 */
  border-color: #475569;
}
:deep(.dark-input .el-input__wrapper), :deep(.dark-textarea .el-textarea__inner) {
  background-color: #0f172a;
  box-shadow: 0 0 0 1px #334155;
  color: #f1f5f9; /* slate-100 */
}
:deep(.dark-textarea-full .el-textarea__inner) {
  background-color: #0f172a !important;
  color: #f1f5f9 !important;
  border-color: #334155 !important;
}
:deep(.dark-collapse .el-collapse-item__header) {
  background-color: transparent;
  color: #cbd5e1;
  border-bottom: 1px solid #334155;
}
:deep(.dark-collapse .el-collapse-item__wrap) {
  background-color: transparent;
  border-bottom: 1px solid #334155;
}
:deep(.dark-radio-group .el-radio-button__inner) {
  background-color: #1e293b;
  color: #cbd5e1;
  border-color: #334155;
}
:deep(.dark-radio-group .el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: #6366f1;
  border-color: #6366f1;
  color: white;
  box-shadow: -1px 0 0 0 #6366f1;
}

/* Dark Tabs */
:deep(.dark-tabs.el-tabs--border-card) {
  background-color: #1e293b;
  border: 1px solid #334155;
}
:deep(.dark-tabs.el-tabs--border-card .el-tabs__header) {
  background-color: #0f172a;
  border-bottom: 1px solid #334155;
}
:deep(.dark-tabs.el-tabs--border-card .el-tabs__item) {
  color: #94a3b8;
  border-right: 1px solid #334155;
  transition: all 0.3s;
}
:deep(.dark-tabs.el-tabs--border-card .el-tabs__item:hover) {
  color: #cbd5e1;
}
:deep(.dark-tabs.el-tabs--border-card .el-tabs__item.is-active) {
  background-color: #1e293b;
  border-right-color: #334155;
  border-left-color: #334155;
  color: #818cf8;
  font-weight: bold;
}
:deep(.dark-tabs.el-tabs--border-card .el-tabs__content) {
  padding: 1rem;
  background-color: #1e293b;
}
</style>

<style>
/* Conversion Dialog Styles (Global to affect teleported el-dialog) */
.el-dialog.conversion-dialog-light,
.el-dialog.conversion-dialog-dark,
.conversion-dialog-light .el-dialog,
.conversion-dialog-dark .el-dialog {
  --el-dialog-bg-color: transparent !important;
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
}

.el-dialog.conversion-dialog-light .el-dialog__header,
.el-dialog.conversion-dialog-dark .el-dialog__header,
.el-dialog.conversion-dialog-light .el-dialog__body,
.el-dialog.conversion-dialog-dark .el-dialog__body,
.el-dialog.conversion-dialog-light .el-dialog__footer,
.el-dialog.conversion-dialog-dark .el-dialog__footer,
.conversion-dialog-light .el-dialog .el-dialog__header,
.conversion-dialog-dark .el-dialog .el-dialog__header,
.conversion-dialog-light .el-dialog .el-dialog__body,
.conversion-dialog-dark .el-dialog .el-dialog__body,
.conversion-dialog-light .el-dialog .el-dialog__footer,
.conversion-dialog-dark .el-dialog .el-dialog__footer {
  background: transparent !important;
  border: none !important;
}
</style>