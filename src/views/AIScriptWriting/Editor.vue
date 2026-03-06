<template>
  <div v-show="!showAiOverlay && !showFiveSensesDialog" class="h-full flex flex-col transition-colors duration-300" :class="bgClass">
    <StepIndicator :active-index="2" />
    <el-container class="flex-1 overflow-hidden">
    <!-- Module B: Lore Hub (左侧侧边栏) -->
    <div class="relative transition-all duration-300 border-r flex flex-col h-full overflow-visible" 
      :style="{ width: showLeftSidebar ? '280px' : '0px' }"
      :class="sidebarClass"
    >
      <!-- Toggle Button (Floating outside when closed, or inside when open?) -->
      <div 
        class="absolute top-1/2 -right-3 z-50 transform -translate-y-1/2 cursor-pointer w-3 h-12 flex items-center justify-center rounded-r border-y border-r shadow-md transition-colors"
        :class="isLight ? 'bg-white border-slate-200 hover:bg-slate-50' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'"
        @click="showLeftSidebar = !showLeftSidebar"
        :title="showLeftSidebar ? '收起侧边栏' : '展开侧边栏'"
      >
        <el-icon :size="12" :class="isLight ? 'text-slate-400' : 'text-slate-500'">
          <DArrowLeft v-if="showLeftSidebar" />
          <DArrowRight v-else />
        </el-icon>
      </div>

      <!-- Content (Only visible when width > 0) -->
      <div v-show="showLeftSidebar" class="flex flex-col h-full w-full overflow-hidden">
        <!-- 顶部返回 -->
        <div class="p-4 border-b flex-shrink-0" :class="isLight ? 'border-slate-200' : 'border-slate-700'">
           <el-button link class="hover:text-indigo-500" :class="isLight ? 'text-slate-500' : 'text-slate-300 hover:text-white'" @click="goBack">
              <el-icon class="mr-1"><ArrowLeft /></el-icon> 返回章节管理
           </el-button>
        </div>

        <!-- 中部：导航与内容树 -->
        <div class="flex-1 overflow-y-auto p-2 custom-scrollbar">
          <el-collapse v-model="activeSidePanel" accordion class="border-none" :class="isLight ? 'light-collapse' : 'dark-collapse'">
            
            <!-- 章节列表 -->
            <el-collapse-item name="chapters">
              <template #title>
                <div class="flex items-center gap-2 font-medium px-2" :class="isLight ? 'text-slate-700' : 'text-slate-200'">
                  <el-icon><Reading /></el-icon> 章节列表
                </div>
              </template>
              
              <div v-if="loreStore.currentNovel.chapters.length === 0" class="text-center py-4 text-sm" :class="isLight ? 'text-slate-400' : 'text-slate-400'">
                暂无章节，请先生成大纲
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

            <!-- 角色管理 -->
            <el-collapse-item name="characters">
              <template #title>
                <div class="flex items-center gap-2 font-medium px-2" :class="isLight ? 'text-slate-700' : 'text-slate-200'">
                  <el-icon><User /></el-icon> 角色卡片
                </div>
              </template>
              <div class="px-2 mb-2 flex gap-2">
                 <el-button 
                   class="flex-1"
                   :class="isLight ? '!bg-indigo-50 !border-indigo-200 !text-indigo-600 hover:!bg-indigo-100' : '!bg-indigo-600/20 !border-indigo-500/30 !text-indigo-200 hover:!bg-indigo-600/30'"
                   size="small" 
                   :loading="isGeneratingCharacters"
                   @click="autoGenerateCharacters"
                 >
                   <el-icon class="mr-1"><MagicStick /></el-icon> AI 生成
                 </el-button>
                 <el-button 
                   class="px-3"
                   :class="isLight ? '!bg-white !border-slate-300 !text-slate-600 hover:!bg-slate-50' : '!bg-slate-700 !border-slate-600 !text-slate-300 hover:!text-white'"
                   plain 
                   size="small" 
                   @click="openSelectCharacterDialog"
                 >
                   <el-icon><MoreFilled /></el-icon>
                 </el-button>
                 <el-button 
                   class="px-3"
                   :class="isLight ? '!bg-white !border-slate-300 !text-slate-600 hover:!bg-slate-50' : '!bg-slate-700 !border-slate-600 !text-slate-300 hover:!text-white'"
                   plain 
                   size="small" 
                   @click="openAddCharacterDialog"
                 >
                   <el-icon><Plus /></el-icon>
                 </el-button>
              </div>
              
              <div v-if="loreStore.characters.length === 0" class="text-center py-4 text-xs" :class="isLight ? 'text-slate-400' : 'text-slate-400'">
                暂无角色，点击上方按钮生成或添加
              </div>

              <div v-for="char in loreStore.characters" :key="char.id" class="mb-2 p-3 border rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer group relative" :class="isLight ? 'bg-white border-slate-200 hover:border-slate-300' : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'" @click="editCharacter(char)">
                <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <el-icon class="hover:text-red-400" :class="isLight ? 'text-slate-400' : 'text-slate-300'" @click.stop="deleteCharacter(char.id)"><Delete /></el-icon>
                </div>
                <div class="flex items-center gap-2 mb-1">
                   <el-avatar :size="24" :src="'https://api.dicebear.com/7.x/avataaars/svg?seed=' + char.name" />
                   <div class="font-bold text-sm" :class="isLight ? 'text-slate-800' : 'text-slate-100'">{{ char.name }}</div>
                </div>
                <div class="text-xs line-clamp-2 mb-1" :class="isLight ? 'text-slate-500' : 'text-slate-300'">{{ char.role }}</div>
                <div class="flex gap-1 flex-wrap">
                  <el-tag v-if="char.age" size="small" type="info" :effect="isLight ? 'light' : 'dark'" class="scale-90 origin-left !px-1">{{ char.age }}</el-tag>
                  <el-tag v-if="char.gender" size="small" type="info" :effect="isLight ? 'light' : 'dark'" class="scale-90 origin-left !px-1">{{ char.gender }}</el-tag>
                </div>
              </div>
            </el-collapse-item>

            <!-- 道具管理 -->
            <el-collapse-item name="props">
              <template #title>
                <div class="flex items-center gap-2 font-medium px-2" :class="isLight ? 'text-slate-700' : 'text-slate-200'">
                  <el-icon><Goods /></el-icon> 道具物品
                </div>
              </template>
              <div class="px-2 mb-2 flex gap-2">
                 <el-button 
                   class="flex-1"
                   :class="isLight ? '!bg-indigo-50 !border-indigo-200 !text-indigo-600 hover:!bg-indigo-100' : '!bg-indigo-600/20 !border-indigo-500/30 !text-indigo-200 hover:!bg-indigo-600/30'"
                   size="small" 
                   :loading="isGeneratingProps"
                   @click="autoGenerateProps"
                 >
                   <el-icon class="mr-1"><MagicStick /></el-icon> AI 生成
                 </el-button>
                 <el-button 
                   class="px-3"
                   :class="isLight ? '!bg-white !border-slate-300 !text-slate-600 hover:!bg-slate-50' : '!bg-slate-700 !border-slate-600 !text-slate-300 hover:!text-white'"
                   plain 
                   size="small" 
                   @click="openSelectPropDialog"
                 >
                   <el-icon><MoreFilled /></el-icon>
                 </el-button>
                 <el-button 
                   class="px-3"
                   :class="isLight ? '!bg-white !border-slate-300 !text-slate-600 hover:!bg-slate-50' : '!bg-slate-700 !border-slate-600 !text-slate-300 hover:!text-white'"
                   plain 
                   size="small" 
                   @click="openAddPropDialog"
                 >
                   <el-icon><Plus /></el-icon>
                 </el-button>
              </div>
              
              <div v-if="loreStore.props.length === 0" class="text-center py-4 text-xs" :class="isLight ? 'text-slate-400' : 'text-slate-400'">
                暂无道具，点击上方按钮生成或添加
              </div>

              <div v-for="prop in loreStore.props" :key="prop.id" class="mb-2 p-3 border rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer group relative" :class="isLight ? 'bg-white border-slate-200 hover:border-slate-300' : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'" @click="editProp(prop)">
                <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <el-icon class="hover:text-red-400" :class="isLight ? 'text-slate-400' : 'text-slate-300'" @click.stop="deleteProp(prop.id)"><Delete /></el-icon>
                </div>
                <div class="font-bold text-sm mb-1" :class="isLight ? 'text-slate-800' : 'text-slate-100'">{{ prop.name }}</div>
                <div class="text-xs line-clamp-2" :class="isLight ? 'text-slate-500' : 'text-slate-300'">{{ prop.description }}</div>
              </div>
            </el-collapse-item>

            <!-- 场景管理 -->
            <el-collapse-item name="scenes">
              <template #title>
                <div class="flex items-center gap-2 font-medium px-2" :class="isLight ? 'text-slate-700' : 'text-slate-200'">
                  <el-icon><Location /></el-icon> 场景地点
                </div>
              </template>
              <div class="px-2 mb-2 flex gap-2">
                 <el-button 
                   class="flex-1"
                   :class="isLight ? '!bg-indigo-50 !border-indigo-200 !text-indigo-600 hover:!bg-indigo-100' : '!bg-indigo-600/20 !border-indigo-500/30 !text-indigo-200 hover:!bg-indigo-600/30'"
                   size="small" 
                   :loading="isGeneratingScenes"
                   @click="autoGenerateScenes"
                 >
                   <el-icon class="mr-1"><MagicStick /></el-icon> AI 生成
                 </el-button>
                 <el-button 
                   class="px-3"
                   :class="isLight ? '!bg-white !border-slate-300 !text-slate-600 hover:!bg-slate-50' : '!bg-slate-700 !border-slate-600 !text-slate-300 hover:!text-white'"
                   plain 
                   size="small" 
                   @click="openSelectSceneDialog"
                 >
                   <el-icon><MoreFilled /></el-icon>
                 </el-button>
                 <el-button 
                   class="px-3"
                   :class="isLight ? '!bg-white !border-slate-300 !text-slate-600 hover:!bg-slate-50' : '!bg-slate-700 !border-slate-600 !text-slate-300 hover:!text-white'"
                   plain 
                   size="small" 
                   @click="openAddSceneDialog"
                 >
                   <el-icon><Plus /></el-icon>
                 </el-button>
              </div>
              
              <div v-if="loreStore.scenes.length === 0" class="text-center py-4 text-xs" :class="isLight ? 'text-slate-400' : 'text-slate-400'">
                暂无场景，点击上方按钮生成或添加
              </div>

              <div v-for="scene in loreStore.scenes" :key="scene.id" class="mb-2 p-3 border rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer group relative" :class="isLight ? 'bg-white border-slate-200 hover:border-slate-300' : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'" @click="editScene(scene)">
                <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <el-icon class="hover:text-red-400" :class="isLight ? 'text-slate-400' : 'text-slate-300'" @click.stop="deleteScene(scene.id)"><Delete /></el-icon>
                </div>
                <div class="font-bold text-sm mb-1" :class="isLight ? 'text-slate-800' : 'text-slate-100'">{{ scene.name }}</div>
                <div class="text-xs line-clamp-2" :class="isLight ? 'text-slate-500' : 'text-slate-300'">{{ scene.description }}</div>
              </div>
            </el-collapse-item>

          </el-collapse>
        </div>
      </div>
    </div>

    <!-- Module C: Immersive Editor (中间编辑器) -->
    <el-main class="relative flex flex-col items-center pt-8 px-8 custom-scrollbar transition-colors" :class="isLight ? 'bg-slate-50 bg-dot-pattern-light' : 'bg-slate-900 bg-dot-pattern-dark'">
      <!-- Process Indicator -->
       <!-- Removed as requested -->

      <!-- 编辑器顶部工具栏 -->
      <div class="w-full max-w-full mb-6 flex items-center justify-between text-sm sticky top-0 backdrop-blur z-10 py-2 mt-6 border-b transition-colors" :class="isLight ? 'bg-slate-50/90 border-slate-200 text-slate-500' : 'bg-slate-900/90 border-slate-800 text-slate-300'">
        <div class="flex items-center gap-2">
           <span class="font-bold" :class="isLight ? 'text-slate-800' : 'text-slate-100'">{{ currentChapter?.title || '未选择章节' }}</span>
           <el-tag v-if="isAutoWriting" type="success" size="small" :effect="isLight ? 'light' : 'dark'" class="animate-pulse" :class="isLight ? '!bg-green-50 !border-green-200 !text-green-600' : '!bg-green-900/50 !border-green-800 !text-green-300'">AI 正在撰写中...</el-tag>
        </div>
        <div class="flex items-center gap-4">
           <el-tooltip content="字数统计" placement="bottom">
              <span class="flex items-center gap-1"><el-icon><DataLine /></el-icon> {{ editor?.storage.characterCount.words() || 0 }} 字</span>
           </el-tooltip>
           <el-tooltip content="影视化对接" placement="bottom">
              <el-button size="small" :class="isLight ? '!bg-purple-50 !border-purple-200 !text-purple-600 hover:!bg-purple-100' : '!bg-purple-600/20 !border-purple-500/30 !text-purple-300 hover:!bg-purple-600/30'" @click="{ showAiSidePanel = true; activeRightTab = 'script'; }">
                <el-icon class="mr-1"><VideoCamera /></el-icon> 对接 AI 短剧
              </el-button>
           </el-tooltip>
           <el-tooltip v-if="!showAiSidePanel" content="打开 AI 助手" placement="bottom">
              <el-button circle size="small" :icon="ChatDotRound" :class="isLight ? '!bg-white !border-slate-300 !text-slate-500 hover:!text-slate-700' : '!bg-slate-800 !border-slate-700 !text-slate-300 hover:!text-white'" @click="{ showAiSidePanel = true; activeRightTab = 'chat'; }" />
           </el-tooltip>
           <el-button circle size="small" :icon="MoreFilled" :class="isLight ? '!bg-white !border-slate-300 !text-slate-500 hover:!text-slate-700' : '!bg-slate-800 !border-slate-700 !text-slate-300 hover:!text-white'" @click="showSettingsDialog = true" />
        </div>
      </div>

      <div class="w-full max-w-full h-full relative">
        <editor-content :editor="editor" class="prose max-w-none focus:outline-none min-h-[70vh] pb-40 w-full" :class="isLight ? 'prose-slate' : 'prose-invert prose-slate'" />
        
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

    <!-- Right Panel: AI Assistant (右侧 AI 助手) -->
    <div class="relative transition-all duration-300 border-l flex flex-col h-full overflow-visible" 
      :style="{ width: showAiSidePanel ? '320px' : '0px' }"
      :class="rightPanelClass"
    >
      <!-- Toggle Button -->
      <div 
        class="absolute top-1/2 -left-3 z-50 transform -translate-y-1/2 cursor-pointer w-3 h-12 flex items-center justify-center rounded-l border-y border-l shadow-md transition-colors"
        :class="isLight ? 'bg-white border-slate-200 hover:bg-slate-50' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'"
        @click="showAiSidePanel = !showAiSidePanel"
        :title="showAiSidePanel ? '收起 AI 助手' : '展开 AI 助手'"
      >
        <el-icon :size="12" :class="isLight ? 'text-slate-400' : 'text-slate-500'">
          <DArrowRight v-if="showAiSidePanel" />
          <DArrowLeft v-else />
        </el-icon>
      </div>

      <!-- Content -->
      <div v-show="showAiSidePanel" class="flex flex-col h-full w-full overflow-hidden">
        <div class="p-0 border-b flex items-center justify-between" :class="rightPanelHeaderClass">
          <div class="flex-1 flex">
             <div 
               class="flex-1 py-3 text-center cursor-pointer text-sm font-bold border-b-2 transition-colors"
               :class="activeTabClass(activeRightTab === 'chat')"
               @click="activeRightTab = 'chat'"
             >
                <el-icon class="mr-1"><ChatDotRound /></el-icon> AI 助手
             </div>
             <div 
               class="flex-1 py-3 text-center cursor-pointer text-sm font-bold border-b-2 transition-colors"
               :class="activeTabClass(activeRightTab === 'script')"
               @click="activeRightTab = 'script'"
             >
                <el-icon class="mr-1"><VideoCamera /></el-icon> 短剧优化
             </div>
          </div>
        </div>
        
        <!-- Tab 1: Chat Assistant -->
        <div v-if="activeRightTab === 'chat'" class="flex flex-col h-full overflow-hidden">
          <div class="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" :class="isLight ? 'bg-slate-50' : 'bg-slate-900'">
            <div class="p-3 rounded-2xl rounded-tl-none shadow-sm border self-start text-sm" :class="isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-slate-800 border-slate-700 text-slate-300'">
              你好！我是你的 AI 写作搭档。我可以帮你构思大纲、描写场景，或者梳理剧情逻辑。选中文字即可唤起 AI 快捷指令。
            </div>
            <div v-for="(msg, i) in chatHistory" :key="i" 
              class="p-3 rounded-2xl max-w-[90%] text-sm shadow-sm"
              :class="msg.role === 'user' ? 'bg-indigo-600 text-white self-end ml-auto rounded-tr-none' : (isLight ? 'bg-white border border-slate-200 text-slate-600 self-start rounded-tl-none' : 'bg-slate-800 border border-slate-700 text-slate-300 self-start rounded-tl-none')"
            >
              {{ msg.content }}
            </div>
            <div v-if="isAiThinking" class="flex items-center gap-2 text-xs pl-2" :class="isLight ? 'text-slate-500' : 'text-slate-500'">
               <div class="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
               <div class="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-75"></div>
               <div class="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
               AI 正在思考...
            </div>
          </div>

          <div class="p-4 border-t" :class="isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'">
            <div class="flex gap-2 relative">
              <el-input 
                v-model="chatInput" 
                placeholder="输入指令..." 
                :class="isLight ? '' : 'dark-input'"
                @keyup.enter="sendChatMessage" 
              >
                 <template #suffix>
                    <el-button link type="primary" :disabled="!chatInput" @click="sendChatMessage">
                       <el-icon class="text-lg"><Position /></el-icon>
                    </el-button>
                 </template>
              </el-input>
            </div>
          </div>
        </div>

        <!-- Tab 2: Script Optimizer -->
         <div v-if="activeRightTab === 'script'" class="flex-1 overflow-hidden relative">
            <ScriptOptimizerPanel 
              :current-content="editor?.getText() || ''"
              :previous-chapter-content="''"
              @apply-optimization="handleScriptOptimizationApply"
            />
         </div>
      </div>
    </div>

    <!-- Dialog: 创意生成大纲 -->
    <el-dialog v-model="showIdeaDialog" title="AI 创意风暴" width="600px" :class="isLight ? '' : 'dark-dialog'">
      <el-form label-position="top">
        <el-form-item label="作品类型">
          <el-radio-group v-model="ideaForm.genre" :class="isLight ? '' : 'dark-radio-group'">
            <el-radio-button label="玄幻" />
            <el-radio-button label="科幻" />
            <el-radio-button label="悬疑" />
            <el-radio-button label="都市" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="核心梗 / 一句话简介">
          <el-input 
            v-model="ideaForm.premise" 
            type="textarea" 
            :rows="3" 
            placeholder="例如：一个能听见古董说话的鉴定师，卷入了一场跨越千年的阴谋。"
            :class="isLight ? '' : 'dark-textarea'"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showIdeaDialog = false" :class="isLight ? '' : '!bg-slate-700 !border-slate-600 !text-slate-300 hover:!text-white'">取消</el-button>
        <el-button type="primary" :loading="isGeneratingOutline" @click="startGenerateOutline" :class="isLight ? '' : '!bg-indigo-600 border-none'">
          生成完整大纲与章节
        </el-button>
      </template>
    </el-dialog>

    <!-- Select Character Dialog -->
    <el-dialog v-model="selectCharacterDialog" title="选择已有角色" width="600px" :class="isLight ? '' : 'dark-dialog'">
      <div class="max-h-96 overflow-y-auto custom-scrollbar">
        <el-checkbox-group v-model="selectedCharacterIds">
        <div v-for="char in existingCharacters" :key="char.id" 
          class="flex items-center p-3 mb-2 border rounded cursor-pointer transition-colors" 
          :class="[
            selectedCharacterIds.includes(char.id) 
              ? (isLight ? 'border-indigo-500 bg-indigo-50' : 'border-indigo-500 bg-indigo-900/30') 
              : (isLight ? 'border-slate-200 hover:bg-slate-50' : 'border-slate-700 hover:bg-slate-700/50')
          ]" 
          @click="selectedCharacterIds.includes(char.id) ? selectedCharacterIds = selectedCharacterIds.filter(id => id !== char.id) : selectedCharacterIds.push(char.id)"
        >
           <el-checkbox :label="char.id" class="mr-3" @click.stop />
           <div class="flex-1">
             <div class="font-bold" :class="isLight ? 'text-slate-800' : 'text-slate-200'">{{ char.name }}</div>
             <div class="text-xs" :class="isLight ? 'text-slate-500' : 'text-slate-400'">{{ char.role }}</div>
           </div>
        </div>
        </el-checkbox-group>
      </div>
      <template #footer>
        <el-button @click="selectCharacterDialog = false" :class="isLight ? '' : '!bg-slate-700 !border-slate-600 !text-slate-300 hover:!text-white'">取消</el-button>
        <el-button type="primary" @click="confirmSelectCharacters" :class="isLight ? '' : '!bg-indigo-600 border-none'">确认添加</el-button>
      </template>
    </el-dialog>

    <!-- Select Prop Dialog -->
    <el-dialog v-model="selectPropDialog" title="选择已有道具" width="600px" :class="isLight ? '' : 'dark-dialog'">
      <div class="max-h-96 overflow-y-auto custom-scrollbar">
        <el-checkbox-group v-model="selectedPropIds">
        <div v-for="prop in existingProps" :key="prop.id" 
          class="flex items-center p-3 mb-2 border rounded cursor-pointer transition-colors" 
          :class="[
            selectedPropIds.includes(prop.id) 
              ? (isLight ? 'border-indigo-500 bg-indigo-50' : 'border-indigo-500 bg-indigo-900/30') 
              : (isLight ? 'border-slate-200 hover:bg-slate-50' : 'border-slate-700 hover:bg-slate-700/50')
          ]" 
          @click="selectedPropIds.includes(prop.id) ? selectedPropIds = selectedPropIds.filter(id => id !== prop.id) : selectedPropIds.push(prop.id)"
        >
           <el-checkbox :label="prop.id" class="mr-3" @click.stop />
           <div class="flex-1">
             <div class="font-bold" :class="isLight ? 'text-slate-800' : 'text-slate-200'">{{ prop.name }}</div>
             <div class="text-xs" :class="isLight ? 'text-slate-500' : 'text-slate-400'">{{ prop.type }}</div>
           </div>
        </div>
        </el-checkbox-group>
      </div>
      <template #footer>
        <el-button @click="selectPropDialog = false" :class="isLight ? '' : '!bg-slate-700 !border-slate-600 !text-slate-300 hover:!text-white'">取消</el-button>
        <el-button type="primary" @click="confirmSelectProps" :class="isLight ? '' : '!bg-indigo-600 border-none'">确认添加</el-button>
      </template>
    </el-dialog>

    <!-- Select Scene Dialog -->
    <el-dialog v-model="selectSceneDialog" title="选择已有场景" width="600px" :class="isLight ? '' : 'dark-dialog'">
      <div class="max-h-96 overflow-y-auto custom-scrollbar">
        <el-checkbox-group v-model="selectedSceneIds">
        <div v-for="scene in existingScenes" :key="scene.id" 
          class="flex items-center p-3 mb-2 border rounded cursor-pointer transition-colors" 
          :class="[
            selectedSceneIds.includes(scene.id) 
              ? (isLight ? 'border-indigo-500 bg-indigo-50' : 'border-indigo-500 bg-indigo-900/30') 
              : (isLight ? 'border-slate-200 hover:bg-slate-50' : 'border-slate-700 hover:bg-slate-700/50')
          ]" 
          @click="selectedSceneIds.includes(scene.id) ? selectedSceneIds = selectedSceneIds.filter(id => id !== scene.id) : selectedSceneIds.push(scene.id)"
        >
           <el-checkbox :label="scene.id" class="mr-3" @click.stop />
           <div class="flex-1">
             <div class="font-bold" :class="isLight ? 'text-slate-800' : 'text-slate-200'">{{ scene.name }}</div>
             <div class="text-xs" :class="isLight ? 'text-slate-500' : 'text-slate-400'">{{ scene.atmosphere }}</div>
           </div>
        </div>
        </el-checkbox-group>
      </div>
      <template #footer>
        <el-button @click="selectSceneDialog = false" :class="isLight ? '' : '!bg-slate-700 !border-slate-600 !text-slate-300 hover:!text-white'">取消</el-button>
        <el-button type="primary" @click="confirmSelectScenes" :class="isLight ? '' : '!bg-indigo-600 border-none'">确认添加</el-button>
      </template>
    </el-dialog>

    <!-- Character Dialog -->
    <el-dialog v-model="addCharacterDialog" title="新建角色" :class="isLight ? '' : 'dark-dialog'" width="700px">
      <el-form :model="newChar" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名">
              <el-input v-model="newChar.name" :class="isLight ? '' : 'dark-input'" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="定位">
              <el-input v-model="newChar.role" placeholder="如：男主角" :class="isLight ? '' : 'dark-input'" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="年龄">
              <el-input v-model="newChar.age" :class="isLight ? '' : 'dark-input'" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别">
              <el-input v-model="newChar.gender" :class="isLight ? '' : 'dark-input'" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="性格">
          <el-input v-model="newChar.personality" type="textarea" :rows="2" placeholder="性格特征描述" :class="isLight ? '' : 'dark-textarea'" />
        </el-form-item>
        
        <el-form-item label="背景故事">
          <el-input v-model="newChar.backstory" type="textarea" :rows="3" placeholder="角色的过往经历" :class="isLight ? '' : 'dark-textarea'" />
        </el-form-item>

        <el-divider :class="isLight ? '' : '!border-slate-700'"><span :class="isLight ? 'text-slate-500' : 'text-slate-500'">外貌特征 (Visual Traits)</span></el-divider>
        <el-row :gutter="10">
          <el-col :span="12"><el-input v-model="newChar.visual_traits.hair" placeholder="发型/发色" :class="isLight ? '' : 'dark-input'" /></el-col>
          <el-col :span="12"><el-input v-model="newChar.visual_traits.eyes" placeholder="眼睛/瞳色" :class="isLight ? '' : 'dark-input'" /></el-col>
          <el-col :span="12" class="mt-2"><el-input v-model="newChar.visual_traits.clothing" placeholder="常穿服装" :class="isLight ? '' : 'dark-input'" /></el-col>
          <el-col :span="12" class="mt-2"><el-input v-model="newChar.visual_traits.accessories" placeholder="配饰/特征" :class="isLight ? '' : 'dark-input'" /></el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="addCharacterDialog = false" :class="isLight ? '' : '!bg-slate-700 !border-slate-600 !text-slate-300 hover:!text-white'">取消</el-button>
        <el-button type="primary" @click="saveCharacter" :class="isLight ? '' : '!bg-indigo-600 border-none'">保存</el-button>
      </template>
    </el-dialog>

    <!-- Prop Dialog -->
    <el-dialog v-model="addPropDialog" title="新建道具" :class="isLight ? '' : 'dark-dialog'">
      <el-form :model="newProp" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="newProp.name" :class="isLight ? '' : 'dark-input'" />
        </el-form-item>
        <el-form-item label="类型">
          <el-input v-model="newProp.type" placeholder="例如：武器、宝物、日常用品" :class="isLight ? '' : 'dark-input'" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="newProp.description" type="textarea" :rows="3" :class="isLight ? '' : 'dark-textarea'" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addPropDialog = false" :class="isLight ? '' : '!bg-slate-700 !border-slate-600 !text-slate-300 hover:!text-white'">取消</el-button>
        <el-button type="primary" @click="saveProp" :class="isLight ? '' : '!bg-indigo-600 border-none'">保存</el-button>
      </template>
    </el-dialog>

    <!-- Scene Dialog -->
    <el-dialog v-model="addSceneDialog" title="新建场景" :class="isLight ? '' : 'dark-dialog'">
      <el-form :model="newScene" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="newScene.name" :class="isLight ? '' : 'dark-input'" />
        </el-form-item>
        <el-form-item label="氛围">
          <el-input v-model="newScene.atmosphere" placeholder="例如：压抑、明快、紧张" :class="isLight ? '' : 'dark-input'" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="newScene.description" type="textarea" :rows="3" :class="isLight ? '' : 'dark-textarea'" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addSceneDialog = false" :class="isLight ? '' : '!bg-slate-700 !border-slate-600 !text-slate-300 hover:!text-white'">取消</el-button>
        <el-button type="primary" @click="saveScene" :class="isLight ? '' : '!bg-indigo-600 border-none'">保存</el-button>
      </template>
    </el-dialog>
  </el-container>
  </div>

  <!-- Comparison Dialog -->
  <el-dialog v-model="showDiffDialog" :title="`AI 结果 - ${currentAiAction}`" width="900px" destroy-on-close :class="isLight ? '' : 'dark-dialog'">
    <div class="grid grid-cols-2 gap-6 mb-6 h-[500px]">
      <!-- Original Text -->
      <div class="flex flex-col h-full">
        <div class="text-sm font-bold mb-2 flex justify-between" :class="isLight ? 'text-slate-500' : 'text-slate-500'">
           <span>原文</span>
           <el-tag size="small" type="info" :effect="isLight ? 'light' : 'dark'" :class="isLight ? '!bg-slate-100 !border-slate-200' : '!bg-slate-700 !border-slate-600'">只读</el-tag>
        </div>
        <div class="flex-1 rounded-lg p-4 overflow-y-auto border leading-relaxed whitespace-pre-wrap custom-scrollbar" :class="isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-800 border-slate-700 text-slate-400'">
           {{ originalText }}
        </div>
      </div>
      
      <!-- AI Generated Text -->
      <div class="flex flex-col h-full relative">
        <div class="text-sm font-bold text-indigo-400 mb-2 flex justify-between items-center">
          <span>AI {{ currentAiAction }}结果</span>
          <span v-if="isAutoWriting" class="text-xs animate-pulse bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">生成中...</span>
        </div>
        <el-input
          v-model="generatedText"
          type="textarea"
          resize="none"
          class="flex-1 h-full !p-0"
          :class="isLight ? '' : 'dark-textarea-full'"
          :input-style="isLight ? { height: '100%', padding: '1rem' } : { height: '100%', backgroundColor: '#1e293b', color: '#e2e8f0', padding: '1rem', border: '1px solid #334155' }"
        />
      </div>
    </div>
    
    <template #footer>
      <div class="flex justify-end gap-3">
        <el-button @click="showDiffDialog = false" :class="isLight ? '' : '!bg-slate-700 !border-slate-600 !text-slate-300 hover:!text-white'">取消</el-button>
        <el-button type="primary" plain :disabled="isAutoWriting" @click="appendAiChanges" :class="isLight ? '!bg-indigo-50 !border-indigo-200 !text-indigo-600' : '!bg-indigo-500/10 !border-indigo-500/30 !text-indigo-400 hover:!bg-indigo-500/20'">
          保留原文并追加
        </el-button>
        <el-button type="primary" color="#4f46e5" :disabled="isAutoWriting" @click="applyAiChanges" :class="isLight ? '' : '!bg-indigo-600 border-none'">
          替换原文
        </el-button>
      </div>
    </template>
  </el-dialog>
  
  <!-- Settings Dialog -->
  <el-dialog v-model="showSettingsDialog" title="作品设置" width="700px" :class="isLight ? '' : 'dark-dialog'">
      <el-descriptions :column="2" border :class="isLight ? '' : 'dark-descriptions'">
        <el-descriptions-item label="作品名称">{{ loreStore.currentNovel.title }}</el-descriptions-item>
        <el-descriptions-item label="题材">{{ loreStore.currentNovel.genre }}</el-descriptions-item>
        <el-descriptions-item label="生成集数">{{ loreStore.currentNovel.episodeCount }}</el-descriptions-item>
        <el-descriptions-item label="每集时长">{{ loreStore.currentNovel.episodeDuration }}分钟</el-descriptions-item>
        <el-descriptions-item label="目标受众">{{ loreStore.currentNovel.targetAudience }}</el-descriptions-item>
        <el-descriptions-item label="叙事风格">{{ loreStore.currentNovel.style }}</el-descriptions-item>
      </el-descriptions>
      
      <div class="mt-4">
        <div class="text-sm text-slate-400 mb-2">世界观设定</div>
        <div class="p-3 rounded text-sm max-h-32 overflow-y-auto border custom-scrollbar" :class="isLight ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-slate-900 text-slate-300 border-slate-700'">{{ loreStore.currentNovel.worldView || '无' }}</div>
      </div>
      
      <div class="mt-4">
        <div class="text-sm text-slate-400 mb-2">核心金手指</div>
        <div class="p-3 rounded text-sm max-h-32 overflow-y-auto border custom-scrollbar" :class="isLight ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-slate-900 text-slate-300 border-slate-700'">{{ loreStore.currentNovel.goldenFinger || '无' }}</div>
      </div>

      <template #footer>
        <el-button @click="showSettingsDialog = false" :class="isLight ? '' : '!bg-slate-700 !border-slate-600 !text-slate-300 hover:!text-white'">关闭</el-button>
      </template>
    </el-dialog>

    <!-- Five Senses Dialog -->
    <el-dialog 
      v-model="showFiveSensesDialog" 
      title="五感填充引擎" 
      width="800px" 
      :class="isLight ? '' : 'dark-dialog'" 
      :close-on-click-modal="false"
      :show-close="true"
    >
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

    <!-- Full Screen AI Optimization Overlay -->
    <AiOptimizationOverlay
      v-model:visible="showAiOverlay"
      :original-text="aiOverlayOriginalText"
      :action-type="aiOverlayActionType"
      @apply="handleAiOverlayApply"
    />
</template>

<script setup lang="ts">
import { ref, reactive, computed, onBeforeUnmount, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import CharacterCount from '@tiptap/extension-character-count'
import { EditPen, MagicStick, Reading, User, ChatDotRound, Position, ArrowLeft, Top, Scissor, ScaleToOriginal, DataLine, MoreFilled, Close, Refresh, Plus, Delete, VideoCamera, Goods, Location, DArrowRight, DArrowLeft } from '@element-plus/icons-vue'
import { useLoreStore, type Character, type Prop, type Scene } from '@/stores/useLoreStore'
import { streamLLMResponse } from '@/utils/llmClient'
import { ElMessage } from 'element-plus'
import AiOptimizationOverlay from '@/components/AiOptimizationOverlay.vue'
import ScriptOptimizerPanel from '@/components/ScriptOptimizerPanel.vue'
import StepIndicator from '@/components/StepIndicator.vue'

const route = useRoute()
const router = useRouter()
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
const showSettingsDialog = ref(false)

// Selected Items for Dialog
const selectedCharacterIds = ref<string[]>([])
const selectedPropIds = ref<string[]>([])
const selectedSceneIds = ref<string[]>([])

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
    }
  }
})

const currentChapter = computed(() => {
  return loreStore.currentNovel.chapters.find(c => c.id === currentChapterId.value)
})

// --- Lifecycle ---

onMounted(() => {
  const { autoStart, chapterTitle } = route.query
  
  if (autoStart === 'true' && chapterTitle) {
    // 查找或创建章节
    let targetChapter = loreStore.currentNovel.chapters.find(c => c.title === chapterTitle)
    
    if (!targetChapter) {
      targetChapter = {
        id: Date.now().toString(),
        title: chapterTitle as string,
        outline: 'AI 自动生成的章节大纲...',
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
  sessionStorage.setItem('novel_generator_chapters_cache', JSON.stringify(loreStore.currentNovel.chapters || []))
  router.push({ name: 'novel-generator', query: { step: 'chapters' } })
}

const startAutoAiWriting = (title: string) => {
  isAutoWriting.value = true
  if (editor.value) {
    editor.value.commands.setContent(`<h2>${title}</h2><p><i>（AI 正在构思场景...）</i></p><br>`)
    
    setTimeout(() => {
      if (editor.value) {
        editor.value.commands.setContent(`<h2>${title}</h2>`)
        streamLLMResponse(
          `撰写章节：${title}。风格：${loreStore.currentNovel.genre}。`,
          (chunk) => {
            editor.value?.commands.insertContent(chunk)
          },
          () => {
             isAutoWriting.value = false
             ElMessage.success('AI 撰写完成！')
          }
        )
      }
    }, 1500)
  }
}

const switchChapter = (id: string) => {
  currentChapterId.value = id
  const chapter = loreStore.currentNovel.chapters.find(c => c.id === id)
  if (chapter && editor.value) {
    editor.value.commands.setContent(chapter.content || `<p><h2>${chapter.title}</h2><p>${chapter.outline}</p></p>`)
  }
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
    { title: '第一章：神秘的开端', outline: '主角在日常生活中发现了异常...' },
    { title: '第二章：意外的相遇', outline: '遇到了一位神秘的导师...' },
    { title: '第三章：初次试炼', outline: '主角被迫面对第一次挑战...' },
    { title: '第四章：真相的一角', outline: '发现世界背后的秘密...' },
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
    '地下诊所','数据中心','荒坂塔','高速公路','酒吧','旅店','森林','山谷','海滩','学校',
    '病房','办公室','仓库','码头','公寓','街区','小巷','车站','广场','工厂','屋顶','射击场'
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
  if (/雨|夜|黑暗|霓虹/.test(chapters.map(c => c.outline || '').join(''))) return '霓虹街区'
  if (/塔|公司|系统|数据/.test(chapters.map(c => c.outline || '').join(''))) return '数据中心'
  return '地下诊所'
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
      atmosphere: summary.match(/夜|黑暗|雨/) ? '阴郁' : '紧张',
      description: summary.slice(0, 60)
    })
  })
  if (scenes.length === 0) {
    scenes.push({ name: '地下诊所', atmosphere: '紧张', description: '狭窄走廊与闪烁灯光，空气中弥漫消毒水味' })
    scenes.push({ name: '数据中心', atmosphere: '冰冷', description: '机柜纵横的密集空间，风扇嗡鸣如潮' })
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
  isAutoWriting.value = true
  streamLLMResponse('续写', (chunk) => {
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
