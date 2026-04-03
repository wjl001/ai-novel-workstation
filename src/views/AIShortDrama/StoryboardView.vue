<template>
  <div class="h-screen flex flex-col bg-[#f0f2f5] overflow-hidden">
    <!-- Header -->
    <header class="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 z-10 relative shadow-sm">
      <div class="flex items-center gap-4">
        <el-button link :icon="ArrowLeft" @click="router.back()" class="!text-slate-600 hover:!text-slate-900 font-medium">返回</el-button>
        <el-divider direction="vertical" class="!h-4" />
        
        <el-dropdown trigger="click" @command="handleEpisodeSwitch">
          <div class="flex items-center gap-2 cursor-pointer group">
            <h1 class="text-[15px] font-bold text-slate-800 truncate max-w-[400px] group-hover:text-indigo-600 transition-colors">
              <template v-if="episodeNotFound">
                视频不存在
              </template>
              <template v-else>
                {{ episode?.title || '分镜详情编辑' }}
              </template>
            </h1>
            <el-icon class="text-slate-400 group-hover:text-indigo-600"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu class="max-h-[400px] overflow-y-auto custom-scrollbar">
              <el-dropdown-item 
                v-for="ep in episodeStore.episodes" 
                :key="ep.id" 
                :command="ep.id"
                :disabled="ep.id === episodeId"
                :class="{ '!text-indigo-600 !font-bold': ep.id === episodeId }"
              >
                {{ ep.title }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      
      <div class="flex items-center gap-3">
        <el-select v-model="synthesisModel" size="small" class="w-40 !border-none">
          <template #prefix>
            <el-icon><Menu /></el-icon>
          </template>
          <el-option label="Seedance 2.0 • Fast" value="seedance-fast" />
          <el-option label="Seedance 2.0 • Quality" value="seedance-quality" />
        </el-select>
        
        <el-button 
          @click="handleExport"
          class="!rounded-lg border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 shadow-sm font-medium"
          :disabled="!timelineScenes[currentSceneIdx]?.video"
        >
          <el-icon class="mr-1.5"><RefreshRight /></el-icon> 导出
        </el-button>
        <el-button 
          v-if="episodeStore.episodes.find(e => e.id === episodeId)?.synthesisStatus === 'success'"
          @click="handlePreviewFull"
          class="!rounded-lg border-indigo-100 text-indigo-600 hover:bg-indigo-50 shadow-sm font-medium"
        >
          <el-icon class="mr-1.5"><VideoPlay /></el-icon> 预览全集
        </el-button>
        <el-button 
          type="primary" 
          class="!rounded-lg shadow-sm font-medium"
          :class="{'opacity-50 cursor-not-allowed': !canSynthesizeAll}"
          :disabled="!canSynthesizeAll"
          @click="handleSynthesis"
        >
          合成全集
        </el-button>
      </div>
    </header>

    <!-- Main Workspace -->
    <main class="flex-1 flex gap-4 overflow-hidden p-4 bg-[#f8fafc]">
      <!-- Left Sidebar: Subject Library -->
      <aside class="w-[300px] bg-white rounded-xl shadow-sm flex flex-col overflow-hidden shrink-0">
        <!-- Subject Library Content -->
        <div class="flex-1 flex flex-col overflow-hidden">
          <div class="p-5 border-b border-slate-50 flex justify-between items-center shrink-0">
            <span class="font-bold text-[14px] text-slate-800 tracking-wide">主体库</span>
            <el-tooltip content="打开主体库弹窗" placement="top">
              <button 
                @click="showLibraryModal = true"
                class="text-slate-400 hover:text-indigo-600 transition-colors"
              >
                <el-icon size="20"><Plus /></el-icon>
              </button>
            </el-tooltip>
          </div>

          <div class="flex-1 overflow-y-auto custom-scrollbar p-5 pb-10">
            <!-- Character Category -->
            <div class="mb-8">
              <div class="flex items-center justify-between mb-4 text-slate-400">
                <div class="flex items-center gap-2">
                  <el-icon size="14"><User /></el-icon>
                  <span class="text-[13px] font-medium tracking-wider">角色 ({{ filteredCharacters.length }})</span>
                </div>
                <button class="text-indigo-400 hover:text-indigo-600 transition-colors" @click="handleAddSubject('character')">
                  <el-icon><Plus /></el-icon>
                </button>
              </div>
              <div class="grid grid-cols-2 gap-x-3 gap-y-6">
                <div v-for="char in filteredCharacters" :key="char.id" class="flex flex-col gap-2 group cursor-pointer relative" @click="handleEditSubject(char)">
                  <div class="w-full aspect-[4/3] rounded-2xl bg-white border border-slate-100 overflow-hidden relative transition-all group-hover:shadow-md flex items-center justify-center p-1">
                    <!-- Delete Button -->
                    <button 
                      class="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center text-[12px] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      @click.stop="handleDeleteSubject(char)"
                    >
                      <el-icon><Delete /></el-icon>
                    </button>
                    <!-- White Circle for Avatar -->
                    <div class="w-20 h-20 rounded-full bg-slate-50 overflow-hidden flex items-center justify-center relative">
                      <el-image v-if="char.image" :src="char.image" class="w-full h-full object-cover" loading="lazy" />
                      <el-icon v-else size="32" class="text-slate-200"><User /></el-icon>
                    </div>
                    
                    <!-- Hover Overlay with Edit Icon -->
                    <div class="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-all flex justify-end items-start p-2">
                      <button 
                        class="w-7 h-7 rounded-full bg-white text-slate-400 hover:text-indigo-600 flex items-center justify-center transition-all shadow-md hover:scale-105 active:scale-95"
                        @click.stop="handleEditSubject(char)"
                      >
                        <el-icon size="14"><Edit /></el-icon>
                      </button>
                    </div>
                  </div>
                  <span class="text-[12px] text-slate-700 font-medium truncate w-full px-1 text-center">{{ char.name }}</span>
                </div>
              </div>
            </div>

            <!-- Scene Category -->
            <div class="mb-8">
              <div class="flex items-center justify-between mb-4 text-slate-400">
                <div class="flex items-center gap-2">
                  <el-icon size="14"><Location /></el-icon>
                  <span class="text-[13px] font-medium tracking-wider">场景 ({{ filteredScenes.length }})</span>
                </div>
                <button class="text-indigo-400 hover:text-indigo-600 transition-colors" @click="handleAddSubject('scene')">
                  <el-icon><Plus /></el-icon>
                </button>
              </div>
              <div class="grid grid-cols-2 gap-x-3 gap-y-6">
                <div v-for="scene in filteredScenes" :key="scene.id" class="flex flex-col gap-2 group cursor-pointer relative" @click="handleEditSubject(scene)">
                  <div class="w-full aspect-[4/3] rounded-2xl bg-white border border-slate-100 overflow-hidden relative transition-all group-hover:shadow-md">
                    <!-- Delete Button -->
                    <button 
                      class="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center text-[12px] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      @click.stop="handleDeleteSubject(scene)"
                    >
                      <el-icon><Delete /></el-icon>
                    </button>
                    <el-image v-if="scene.image" :src="scene.image" class="w-full h-full object-cover" loading="lazy" />
                    <div v-else class="flex flex-col items-center justify-center w-full h-full text-slate-300 bg-slate-50">
                      <el-icon size="28"><Location /></el-icon>
                    </div>
                    
                    <!-- Hover Overlay with Edit Icon -->
                    <div class="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-all flex justify-end items-start p-2">
                      <button 
                        class="w-7 h-7 rounded-full bg-white text-slate-400 hover:text-indigo-600 flex items-center justify-center transition-all shadow-md hover:scale-105 active:scale-95"
                        @click.stop="handleEditSubject(scene)"
                      >
                        <el-icon size="14"><Edit /></el-icon>
                      </button>
                    </div>
                  </div>
                  <span class="text-[12px] text-slate-700 font-medium truncate w-full px-1 text-center">{{ scene.name }}</span>
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
                      class="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center text-[12px] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      @click.stop="handleDeleteSubject(prop)"
                    >
                      <el-icon><Delete /></el-icon>
                    </button>
                    <el-image v-if="prop.image" :src="prop.image" class="w-full h-full object-cover" loading="lazy" />
                    <div v-else class="flex flex-col items-center justify-center w-full h-full text-slate-300 bg-slate-50">
                      <el-icon size="28"><Box /></el-icon>
                    </div>
                    
                    <!-- Hover Overlay with Edit Icon -->
                    <div class="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-all flex justify-end items-start p-2">
                      <button 
                        class="w-7 h-7 rounded-full bg-white text-slate-400 hover:text-indigo-600 flex items-center justify-center transition-all shadow-md hover:scale-105 active:scale-95"
                        @click.stop="handleEditSubject(prop)"
                      >
                        <el-icon size="14"><Edit /></el-icon>
                      </button>
                    </div>
                  </div>
                  <span class="text-[12px] text-slate-700 font-medium truncate w-full px-1 text-center">{{ prop.name }}</span>
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
              <h1 class="text-[15px] font-bold text-slate-800">片段 {{ currentSceneIdx + 1 }}</h1>
              <span class="text-[12px] text-slate-400">片段时长请限制在4-15s，输入“@”可快速调整镜头时长、引用角色、场景、素材</span>
            </div>
            <span class="text-[12px] text-slate-400"></span>
          </div>

          <!-- Content Split Area -->
          <div class="flex-1 flex gap-4 px-6 pb-6 overflow-y-auto custom-scrollbar">
            <!-- Left: Script Content Box -->
            <div 
              class="flex-[2] rounded-xl transition-all relative flex flex-col"
              :class="isEditingScript ? 'bg-white border border-indigo-200 shadow-lg' : 'bg-[#f8fafc] border border-transparent'"
            >
              <!-- Read-only View -->
              <div 
                v-if="!isEditingScript"
                class="p-6 text-[14px] text-slate-700 leading-[1.8] outline-none flex-1 min-h-[400px] cursor-text"
                v-html="currentScript"
                @click="handleEditScript"
              >
              </div>

              <!-- Edit Mode (TipTap) -->
              <div v-else class="flex-1 flex flex-col relative min-h-[400px] p-6 pb-20">
                <editor-content :editor="editor" class="flex-1 script-editor-content w-full h-full" />
                
                <!-- @ Mention Popup -->
                <transition name="el-zoom-in-top">
                  <div 
                    v-if="showMentionMenu" 
                    ref="mentionMenuRef"
                    class="absolute z-[100] bg-white rounded-xl shadow-2xl border border-slate-100 p-2 min-w-[280px] max-w-[340px]"
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
                        {{ tab === 'all' ? '全部' : tab === 'duration' ? '时长' : tab === 'character' ? '角色' : tab === 'scene' ? '场景' : '素材' }}
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
                          <el-button type="primary" size="small" @click="handleCustomDuration">确定</el-button>
                        </div>
                      </div>

                      <div 
                        v-for="(item, idx) in mentionItems" 
                        :key="idx"
                        class="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors group"
                        :class="idx === selectedMentionIndex ? 'bg-indigo-50' : 'hover:bg-indigo-50/50'"
                        @click="insertMention(item)"
                      >
                        <div class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-50">
                          <img v-if="'image' in item && item.image" :src="item.image" class="w-full h-full object-cover" />
                          <el-icon v-else class="text-slate-400" size="18"><component :is="item.icon" /></el-icon>
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

                <!-- Edit Action Buttons -->
                <div class="absolute bottom-6 right-6 flex justify-end gap-4 shrink-0">
                  <el-button class="!rounded-full !px-8 bg-white hover:bg-slate-50 border-slate-200 shadow-sm" @click="handleCancelEdit">取消</el-button>
                  <el-button 
                    type="primary" 
                    class="!rounded-full !px-10 shadow-md font-bold" 
                    style="background: #6366f1; border-color: #6366f1;"
                    @click="handleSaveScriptInline"
                  >
                    保存
                  </el-button>
                </div>
              </div>
              
              <!-- Floating Edit Button (Read-only mode) -->
              <div v-if="!isEditingScript" class="absolute bottom-4 right-4 z-10 flex gap-3">
                <el-button 
                  class="!rounded-full shadow-md bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 !px-6 transition-all" 
                  @click="handleEditScript"
                >
                  <el-icon class="mr-1"><Edit /></el-icon>编辑脚本
                </el-button>
                <el-button 
                  class="!rounded-full shadow-md bg-slate-200 !text-slate-500 border-none !px-6 opacity-80" 
                  @click="handleBatchGenerate"
                >
                  <el-icon class="mr-1"><MagicStick /></el-icon>再次生成
                </el-button>
              </div>
            </div>

            <!-- Right: Preview/Status Placeholder -->
            <div class="flex-1 rounded-xl bg-[#f8fafc] flex flex-col items-center justify-center min-h-[400px] border border-transparent">
              <div v-if="currentPreview" class="w-full h-full relative rounded-xl overflow-hidden group bg-black">
                <video 
                  :src="currentPreview" 
                  class="w-full h-full object-contain"
                  controls
                  autoplay
                  loop
                  muted
                ></video>
                <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <el-button circle size="small" class="!bg-black/50 !border-0 !text-white hover:!bg-black/70 backdrop-blur-md">
                    <el-icon><RefreshRight /></el-icon>
                  </el-button>
                  <el-button circle size="small" class="!bg-black/50 !border-0 !text-white hover:!bg-black/70 backdrop-blur-md">
                    <el-icon><FullScreen /></el-icon>
                  </el-button>
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
        </section>

        <!-- Bottom: Timeline / Audio Player Area -->
        <div class="h-[200px] bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col gap-2 shrink-0">
          <!-- Audio Controls Header -->
          <div class="flex items-center justify-between shrink-0 pl-1 pr-2">
            <div class="flex items-center gap-3">
              <button class="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </button>
              <span class="text-[12px] text-slate-500 font-mono font-medium">00:00 / 00:00</span>
            </div>
            
            <!-- Multi-select Controls -->
            <div v-if="isMultiSelectMode" class="flex items-center gap-4 text-[13px]">
              <el-checkbox v-model="isAllSelected" :indeterminate="isIndeterminate" class="!mr-0">
                <span class="text-slate-600">全选</span>
              </el-checkbox>
              <button class="text-indigo-600 font-medium hover:text-indigo-700 transition-colors" @click="handleBatchGenerate">
                批量生成
              </button>
              <button class="text-slate-400 hover:text-slate-600 transition-colors" @click="toggleMultiSelect">
                取消选择
              </button>
            </div>
            <div v-else>
              <el-button link type="primary" size="small" class="!text-slate-500 hover:!text-indigo-600" @click="toggleMultiSelect">多选</el-button>
            </div>
          </div>

          <!-- Timeline Items -->
          <div class="flex-1 flex gap-3 overflow-x-auto custom-scrollbar items-center pb-2 pl-1">
            <div v-for="(scene, idx) in timelineScenes" :key="scene.id" 
              class="flex-shrink-0 w-[180px] h-[100px] rounded-xl bg-slate-50 border shadow-sm flex items-center justify-center relative cursor-pointer transition-all hover:border-indigo-300 overflow-hidden group"
              :class="[
                (!isMultiSelectMode && currentSceneIdx === idx) || (isMultiSelectMode && selectedScenes.includes(idx)) 
                  ? 'border-indigo-500 ring-1 ring-indigo-500/20' 
                  : 'border-slate-200'
              ]"
              @click="toggleSceneSelection(idx)"
            >
              <!-- Background Image if generated -->
              <div v-if="scene.status === 'success' && scene.image" class="absolute inset-0 w-full h-full opacity-40">
                <img :src="scene.image" class="w-full h-full object-cover" />
              </div>

              <!-- Index Badge & Checkbox -->
              <div class="absolute top-2 left-2 flex items-center gap-1.5 z-10">
                <div 
                  v-if="!isMultiSelectMode" 
                  class="w-5 h-5 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center text-[11px] font-bold shadow-sm"
                  :class="currentSceneIdx === idx ? '!bg-indigo-500' : ''"
                >
                  {{ idx + 1 }}
                </div>
                
                <div v-if="isMultiSelectMode" class="w-5 h-5 flex items-center justify-center pointer-events-none">
                  <el-checkbox :model-value="selectedScenes.includes(idx)" class="!mr-0"></el-checkbox>
                </div>
              </div>

              <!-- Delete Button -->
              <button 
                class="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center text-[12px] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                @click.stop="deleteScene(idx)"
              >
                <el-icon><Delete /></el-icon>
              </button>

              <!-- Center Content -->
              <div class="flex items-center justify-center w-full h-full relative z-10">
                <!-- Generating Progress -->
                <div v-if="scene.status === 'generating'" class="flex flex-col items-center gap-1 w-full px-3">
                  <span class="text-[12px] font-bold text-indigo-600">{{ scene.progress }}%</span>
                  <div class="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div class="h-full bg-indigo-500 transition-all duration-300" :style="{ width: `${scene.progress}%` }"></div>
                  </div>
                </div>
                
                <!-- Success State -->
                <div v-else-if="scene.status === 'success'" class="flex items-center gap-1.5 text-indigo-600 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <el-icon><VideoPlay /></el-icon>
                  <span class="text-[12px] font-bold">播放</span>
                </div>

                <!-- Default/Pending State -->
                <button 
                  v-else 
                  class="flex items-center gap-1.5 text-slate-600 bg-white hover:bg-indigo-50 hover:text-indigo-600 px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 transition-all"
                  @click.stop="handleGenerateSingleScene(idx)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                    <line x1="7" y1="2" x2="7" y2="22"></line>
                    <line x1="17" y1="2" x2="17" y2="22"></line>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <line x1="2" y1="7" x2="7" y2="7"></line>
                    <line x1="2" y1="17" x2="7" y2="17"></line>
                    <line x1="17" y1="17" x2="22" y2="17"></line>
                    <line x1="17" y1="7" x2="22" y2="7"></line>
                  </svg>
                  <span class="text-[12px] font-medium">生成</span>
                </button>
              </div>
            </div>
            
            <!-- Add New Scene Button -->
            <div class="flex-shrink-0 w-[64px] h-[64px] rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 cursor-pointer hover:text-indigo-500 hover:border-indigo-300 transition-all hover:bg-white" @click="addTimelineScene">
              <el-icon size="24"><Plus /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </main>

      <!-- Synthesis Config Modal -->
      <el-dialog v-model="showSynthesisConfig" title="视频合成设置" width="450px" center class="synthesis-dialog">
        <div class="p-4">
          <el-form label-position="top">
            <el-form-item label="背景音乐">
              <el-select v-model="synthesisConfig.bgm" placeholder="选择背景音乐" class="w-full">
                <el-option label="热血战斗" value="battle" />
                <el-option label="凄美忧伤" value="sad" />
                <el-option label="宁静乡村" value="rural" />
              </el-select>
            </el-form-item>
            <el-form-item label="画面特效">
              <el-checkbox-group v-model="synthesisConfig.effects">
                <el-checkbox label="电影胶片感" value="film" />
                <el-checkbox label="动态运镜" value="motion" />
                <el-checkbox label="智能转场" value="transition" />
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="字幕样式">
              <el-radio-group v-model="synthesisConfig.subtitleStyle">
                <el-radio label="classic">经典白</el-radio>
                <el-radio label="modern">现代黑</el-radio>
                <el-radio label="neon">霓虹金</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </div>
        <template #footer>
          <div class="flex justify-center gap-4">
            <el-button @click="showSynthesisConfig = false">取消</el-button>
            <el-button type="primary" class="theme-primary-btn !px-8" @click="startSynthesis">确认合成</el-button>
          </div>
        </template>
      </el-dialog>

      <!-- Preview Full Video Modal -->
      <el-dialog 
        v-model="showFullPreview" 
        :title="`预览全集: ${episode?.title}`" 
        width="800px" 
        center 
        destroy-on-close
        class="preview-dialog"
      >
        <div class="aspect-video bg-black rounded-lg overflow-hidden">
          <video 
            v-if="episodeStore.episodes.find(e => e.id === episodeId)?.synthesisVideo"
            :src="episodeStore.episodes.find(e => e.id === episodeId)?.synthesisVideo" 
            class="w-full h-full"
            controls
            autoplay
          ></video>
          <div v-else class="w-full h-full flex items-center justify-center text-white">
            视频加载失败
          </div>
        </div>
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

    <!-- Global Loading Overlay for Synthesis -->
    <el-overlay v-if="isSynthesizing" class="!z-[2000] backdrop-blur-sm bg-black/40">
      <div class="h-full w-full flex flex-col items-center justify-center gap-6">
        <div class="relative">
          <el-progress type="circle" :percentage="synthesisProgress" :stroke-width="10" color="#1890ff" :width="180" />
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-[32px] font-bold text-white">{{ synthesisProgress }}%</span>
          </div>
        </div>
        <div class="bg-white/10 backdrop-blur-md border border-white/20 px-8 py-4 rounded-3xl shadow-2xl flex flex-col items-center gap-2">
          <span class="text-[18px] font-bold text-white">正在合成全集视频</span>
          <span class="text-[13px] text-white/70">正在处理分镜 {{ Math.floor(synthesisProgress / 10) + 1 }} / 10，请保持页面开启</span>
        </div>
      </div>
    </el-overlay>
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
  Menu, Delete, Search, InfoFilled, Close, Select, Picture, Film, Headset
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useEpisodeStore } from '@/store/episode';
import SubjectEditDialog from '@/components/AIShortDrama/SubjectEditDialog.vue';
import SubjectLibraryModal from '@/components/AIShortDrama/SubjectLibraryModal.vue';
import video_c2e5d372661c95731e129f2eb4d56054 from '@/assets/video_c2e5d372661c95731e129f2eb4d56054.mp4';

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
const showFullPreview = ref(false);
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
    { name: '4.0s', desc: '镜头时长: 极短', icon: Timer, type: 'duration', category: 'duration' },
    { name: '7.0s', desc: '镜头时长: 标准', icon: Timer, type: 'duration', category: 'duration' },
    { name: '15.0s', desc: '镜头时长: 极长', icon: Timer, type: 'duration', category: 'duration' },
    ...subjects.value.map(s => ({
      name: s.name,
      desc: s.description?.slice(0, 30) + '...',
      image: s.image,
      icon: s.type === 'character' ? User : s.type === 'scene' ? Location : Box,
      type: s.type,
      category: s.type === 'character' ? 'character' : s.type === 'scene' ? 'scene' : 'asset'
    })),
    { name: '古风背景音', desc: '音频素材', icon: Headset, type: 'asset', category: 'asset' },
    { name: '雨天特效', desc: '视频素材', icon: Film, type: 'asset', category: 'asset' },
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
      
      // 更新位置
      const view = editor.view;
      const coords = view.coordsAtPos(from);
      const container = view.dom.closest('.relative');
      if (container) {
        const rect = container.getBoundingClientRect();
        mentionMenuStyle.value = {
          top: `${coords.bottom - rect.top + 5}px`,
          left: `${coords.left - rect.left}px`
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
  { id: '4', name: '豪华酒店宴会厅_0', type: 'scene', image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600', description: '鲜花簇拥的舞台和璀璨的水晶灯, 氛围喜庆。' },
  { id: '5', name: '破旧木棍', type: 'prop', name_ext: '道具', image: 'https://images.unsplash.com/photo-1544111306-03732873493d?auto=format&fit=crop&q=80&w=400', description: '一根被火烧焦了一半的粗木棍。' },
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
    image: type === 'character' ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400' : 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=600',
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
    video: video_c2e5d372661c95731e129f2eb4d56054, 
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600',
    duration: 6.0,
    progress: 0,
    script: `画面风格和类型: 真人写实, 电影风格, 暖色调, 都市女频<br>
生成一个由以下 3 个分镜组成的视频:<br>
场景: <br>
分镜过渡: 镜头平滑切换, 从司仪转向主角, 焦点始终在舞台中央, 氛围喜庆。<br><br>
分镜1 <span class="mention-pill duration"><i class="timer-icon"></i> 6.0s</span>: 时间: 日, 场景图片: <span class="mention-pill location"><i class="location-icon"></i> 豪华酒店宴会厅_0</span>, 镜头: 中景镜头, 从舞台正下方略仰视角度拍摄, 舞台中央位置, <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=20&h=20&fit=crop" /> 司仪-基础形象</span> 手持话筒, 面带职业微笑, 他的面部朝向台下的宾客, 视线扫过全场, <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=20&h=20&fit=crop" /> 司仪-基础形象</span> 说: 「今天, 是沈家千金沈念安小姐与顾家少爷顾承泽先生的订婚之喜。」 音色: 男声, 青年音色, 音调中等, 音色明亮圆润, 声音厚度适中, 发音标准, 气息沉稳, 吐字清晰, 字正腔圆, 富有亲和力与舞台感染力。 背景是鲜花簇拥的舞台和璀璨的水晶灯。 镜头静止。<br><br>
分镜2 <span class="mention-pill duration"><i class="timer-icon"></i> 3.0s</span>: 时间: 日, 场景图片: <span class="mention-pill location"><i class="location-icon"></i> 豪华酒店宴会厅_0</span>, 镜头: 近景, 从 <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=20&h=20&fit=crop" /> 顾承泽-基础形象</span> 右侧方与角色视线平齐高度拍摄。 <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=20&h=20&fit=crop" /> 沈念安-基础形象</span> 身着纯白礼服, 挽着 <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=20&h=20&fit=crop" /> 顾承泽-基础形象</span> 的手臂, 她仰起头, 侧脸对着镜头, 面部朝向身旁的 <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=20&h=20&fit=crop" /> 顾承泽-基础形象</span>, 视线充满爱意地聚焦于他的脸庞, 脸上洋溢着幸福的笑容, <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=20&h=20&fit=crop" /> 沈念安-基础形象</span> 说: 「承泽, 我好像在做梦。」 音色: 女声, 青年音色, 音调中等偏高, 音色质感明亮、清脆, 声音清亮柔和, 发音方式干净, 气息充沛平稳, 吐字清晰, 带有一种与生俱来的温婉与真诚感。 聚光灯照在他们身上。<br><br>
分镜3 <span class="mention-pill duration"><i class="timer-icon"></i> 6.0s</span>: 时间: 日, 场景图片: <span class="mention-pill location"><i class="location-icon"></i> 豪华酒店宴会厅_0</span>, 镜头: 过肩近景, 从 <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=20&h=20&fit=crop" /> 沈念安-基础形象</span> 的背后拍摄, 焦点在 <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=20&h=20&fit=crop" /> 顾承泽-基础形象</span> 的脸上。 <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=20&h=20&fit=crop" /> 顾承泽-基础形象</span> 低下头, 温柔地凝视着 <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=20&h=20&fit=crop" /> 沈念安-基础形象</span>, 他的面部朝向 <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=20&h=20&fit=crop" /> 沈念安-基础形象</span>, 眼神专注而深情, <span class="mention-pill role"><img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=20&h=20&fit=crop" /> 顾承泽-基础形象</span> 说: 「念安, 这不是梦。从今天起, 你就是我唯一的未婚妻。」 音色: 男声, 青年音色, 音调中等, 音色质感干净但偏扁平, 声音不够厚重, 发音方式清晰, 但语速偏快且气息不稳, 尤其在紧张时会带有轻微的颤抖, 吐字清晰却缺乏力量感, 常在句末音量减弱, 给人一种底气不足的感觉。 镜头缓慢向前推进, 加强情感氛围。`
  },
  { 
    id: 'scene-2',
    status: 'pending', 
    video: null,
    image: 'https://picsum.photos/seed/scene2/180/100',
    duration: 7.0,
    progress: 0,
    script: '分镜2：光线灰暗，空气中弥漫着血腥与尘土的气息。镜头从一片瓦砾堆中摇过...'
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
const isMultiSelectMode = ref(false);
const selectedScenes = ref<number[]>([]);

const synthesisConfig = reactive({
  bgm: 'battle',
  effects: ['film', 'motion'],
  subtitleStyle: 'modern'
});

const toggleMultiSelect = () => {
  isMultiSelectMode.value = !isMultiSelectMode.value;
  if (!isMultiSelectMode.value) {
    selectedScenes.value = [];
  }
};

const toggleSceneSelection = (idx: number) => {
  if (!isMultiSelectMode.value) {
    currentSceneIdx.value = idx;
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

const canSynthesizeAll = computed(() => {
  return timelineScenes.value.length > 0 && timelineScenes.value.every(s => s.status === 'success' && s.video);
});

const handleGenerateSingleScene = (idx: number) => {
  const scene = timelineScenes.value[idx];
  if (scene.status === 'generating') return;
  
  scene.status = 'generating';
  scene.progress = 0;
  
  const interval = setInterval(() => {
    scene.progress += Math.floor(Math.random() * 10) + 5;
    if (scene.progress >= 100) {
      scene.progress = 100;
      clearInterval(interval);
      setTimeout(() => {
        scene.status = 'success';
        scene.video = 'https://www.w3schools.com/html/mov_bbb.mp4';
        ElMessage.success(`分镜 ${idx + 1} 视频生成成功！`);
      }, 500);
    }
  }, 500);
};

const handleBatchGenerate = () => {
  // 如果没有在多选模式，或者在多选模式但没有选中任何分镜，则生成当前分镜
  if (!isMultiSelectMode.value || selectedScenes.value.length === 0) {
    handleGenerateSingleScene(currentSceneIdx.value);
  } else {
    // 多选模式且有选中的分镜
    ElMessage.success(`开始批量生成 ${selectedScenes.value.length} 个分镜`);
    selectedScenes.value.forEach(idx => {
      handleGenerateSingleScene(idx);
    });
  }
  
  // 重置模式
  isMultiSelectMode.value = false;
  selectedScenes.value = [];
};

const handleExport = () => {
  const currentVideo = timelineScenes.value[currentSceneIdx.value]?.video;
  if (currentVideo) {
    const link = document.createElement('a');
    link.href = currentVideo;
    link.download = `storyboard-${currentSceneIdx.value + 1}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    ElMessage.success('正在导出当前分镜视频...');
  } else {
    ElMessage.warning('当前分镜尚未生成视频');
  }
};

const handleSynthesis = () => {
  showSynthesisConfig.value = true;
};

const handlePreviewFull = () => {
  const currentEp = episodeStore.episodes.find(e => e.id === episodeId);
  if (currentEp?.synthesisVideo) {
    showFullPreview.value = true;
  } else {
    ElMessage.warning('全集视频尚未合成，无法预览');
  }
};

const startSynthesis = () => {
  showSynthesisConfig.value = false;
  isSynthesizing.value = true;
  synthesisProgress.value = 0;
  
  const timer = setInterval(() => {
    synthesisProgress.value += 1;
    if (synthesisProgress.value >= 100) {
      clearInterval(timer);
      isSynthesizing.value = false;
      // 更新 store 中的状态，记录全集合成已完成
      episodeStore.updateEpisode(episodeId, { 
        synthesisStatus: 'success',
        synthesisVideo: 'https://www.w3schools.com/html/mov_bbb.mp4' // 模拟合成后的全集视频 URL
      });
      ElMessage({
        message: '全集合成完成！已保存至“我的作品”',
        type: 'success',
        duration: 5000,
        showClose: true
      });
    }
  }, 100);
};

const addTimelineScene = () => {
  timelineScenes.value.push({ 
    id: `scene-${Date.now()}`,
    status: 'pending', 
    video: null,
    image: '',
    duration: 0,
    progress: 0,
    script: ''
  });
  currentSceneIdx.value = timelineScenes.value.length - 1;
};

const deleteCurrentScene = () => {
  if (timelineScenes.value.length <= 1) return ElMessage.warning('至少保留一个分镜');
  timelineScenes.value.splice(currentSceneIdx.value, 1);
  if (currentSceneIdx.value >= timelineScenes.value.length) currentSceneIdx.value = timelineScenes.value.length - 1;
};

const deleteScene = (idx: number) => {
  if (timelineScenes.value.length <= 1) return ElMessage.warning('至少保留一个分镜');
  ElMessageBox.confirm('项目被删除后，将不可恢复，请确认要删除吗?', '删除当前片段?', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
    customClass: 'delete-confirm-dialog', // Add a custom class for styling
  })
    .then(() => {
      console.log('Before delete - timelineScenes:', timelineScenes.value.length, timelineScenes.value);
      console.log('Before delete - currentSceneIdx:', currentSceneIdx.value);
      
      timelineScenes.value.splice(idx, 1);
      
      // Adjust currentSceneIdx if the deleted scene was before or is the current scene
      if (idx < currentSceneIdx.value) {
        currentSceneIdx.value--;
      } else if (idx === currentSceneIdx.value && currentSceneIdx.value === timelineScenes.value.length) {
        // If the last scene was deleted and it was the current one, move to the new last scene
        currentSceneIdx.value--;
      }
      
      console.log('After delete - timelineScenes:', timelineScenes.value.length, timelineScenes.value);
      console.log('After delete - currentSceneIdx:', currentSceneIdx.value);
      
      ElMessage.success('删除成功');
    })
    .catch(() => {});
};

// Setup
const episodeId = route.params.id as string;
const episode = ref<any>(null);
const episodeNotFound = ref(false);

onMounted(() => {
  const found = episodeStore.episodes.find(e => e.id === episodeId);
  if (found) {
    episode.value = found;
  } else {
    episodeNotFound.value = true;
  }
  
  setTimeout(() => showGuide.value = true, 1000);
});

const goBack = () => router.back();

const handleEpisodeSwitch = (id: string) => {
  if (id === episodeId) return;
  router.push({
    path: `/storyboard/${id}`,
    query: { subjectId: episodeStore.subjectId }
  });
  // 因为是同一个组件，需要手动刷新数据
  const found = episodeStore.episodes.find(e => e.id === id);
  if (found) {
    episode.value = found;
    episodeNotFound.value = false;
  }
};

// Expose internal state for testing
defineExpose({
  searchQuery,
  filteredCharacters,
  filteredScenes,
  filteredProps,
  handleGenerateSingleScene,
  timelineScenes,
  addTimelineScene,
  deleteCurrentScene,
  startSynthesis,
  isSynthesizing,
  synthesisProgress,
  currentSceneIdx,
  handleEpisodeSwitch,
  handlePreviewFull,
  showFullPreview
});
</script>

<style>
.mention-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  margin: 0 4px;
  border: 1px solid #e2e8f0;
  line-height: 1.4;
  vertical-align: middle;
  background-color: #f1f5f9;
  color: #475569;
  transition: all 0.2s ease;
  cursor: default;
}

.mention-pill:hover {
  border-color: #cbd5e1;
  background-color: #e2e8f0;
}

.mention-pill i {
  display: inline-block;
  width: 14px;
  height: 14px;
  margin-right: 4px;
  background-repeat: no-repeat;
  background-size: contain;
  opacity: 0.7;
}

.mention-pill.location i.location-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'%3E%3C/path%3E%3Ccircle cx='12' cy='10' r='3'%3E%3C/circle%3E%3C/svg%3E");
}

.mention-pill.duration i.timer-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cpolyline points='12 6 12 12 16 14'%3E%3C/polyline%3E%3C/svg%3E");
}

.mention-pill.role {
  padding-left: 2px;
  background-color: #f1f5f9;
  color: #334155;
  border-color: #e2e8f0;
}

.mention-pill.role img {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 6px;
  object-fit: cover;
  border: 1px solid #fff;
}

.mention-pill.location {
  color: #64748b;
  background-color: #f8fafc;
}

.mention-pill.duration {
  color: #64748b;
  background-color: #f8fafc;
}

/* TipTap Editor Styles */
.script-editor-content .ProseMirror {
  min-height: 400px;
  outline: none;
  padding: 0;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.8;
  color: #334155;
}

.script-editor-content .ProseMirror p {
  margin-bottom: 0.8em;
}

/* Ensure pills look correct inside editor */
.script-editor-content .ProseMirror .mention-pill {
  cursor: text;
}

.search-input .el-input__wrapper {
  border-radius: 8px;
  background-color: #f8fafc;
}

.theme-primary-btn {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  opacity: 0.9;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

/* Animations */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
