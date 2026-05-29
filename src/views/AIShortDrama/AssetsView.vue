<template>
  <div class="h-full flex flex-col overflow-hidden relative bg-[#f8fafc] dark:bg-slate-900">
    <!-- Small Loading Floating Card for Assets Generation (Non-blocking) -->
    <teleport to="body">
      <transition name="el-zoom-in-center">
        <div v-if="isGeneratingAssetsText" class="fixed inset-0 z-[1500] flex items-center justify-center pointer-events-none">
          <div class="relative w-[440px] px-6 flex flex-col items-center gap-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl p-10 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-white dark:border-slate-700 pointer-events-auto">
            <!-- Central Icon with Pulse -->
            <div class="relative">
              <div class="absolute inset-0 bg-indigo-500 rounded-2xl blur-xl opacity-20 animate-pulse"></div>
              <div class="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg rotate-3 animate-float-slow">
                <el-icon :size="32" class="animate-bounce-subtle"><MagicStick /></el-icon>
              </div>
            </div>

            <div class="text-center space-y-2">
              <h3 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">AI 资产规划中</h3>
              <p class="text-slate-500 dark:text-slate-400 text-[13px] font-medium flex items-center justify-center gap-2">
                <el-icon class="is-loading"><Loading /></el-icon>
                {{ currentAssetInfo }}
              </p>
            </div>

            <!-- Progress Bar -->
            <div class="w-full space-y-3 px-2">
              <div class="flex justify-between items-end mb-1">
                <span class="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">分析进度</span>
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">预计耗时 1 分钟</span>
              </div>
              <div class="w-full h-2 bg-slate-100 dark:bg-slate-900/50 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50 relative">
                <div 
                  class="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out relative"
                  :style="{ width: generationProgress + '%' }"
                >
                  <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-fast"></div>
                </div>
              </div>
            </div>

            <!-- Background Button -->
            <button 
              @click="isGeneratingAssetsText = false"
              class="w-full h-11 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-black text-[13px] hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/20 transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 group"
            >
              <span>好的，后台运行</span>
              <el-icon class="group-hover:translate-x-1 transition-transform"><Right /></el-icon>
            </button>
          </div>
        </div>
      </transition>
    </teleport>

    <div class="flex-1 flex flex-col min-h-0 relative">
      <!-- Work Info Overlay - Integrated into Tabs Row -->
      <div class="absolute left-6 top-0 h-[56px] flex items-center z-[100] pointer-events-auto">
        <div class="flex items-center gap-4">
          <div class="flex flex-col">
            <span class="text-[14px] font-black text-slate-800 dark:text-white truncate max-w-[200px]">{{ dramaStore.outlineData?.title || '未命名剧本' }}</span>
            <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider">主体资产管理</span>
          </div>
          <div class="w-px h-6 bg-slate-200 dark:bg-slate-700/50 mx-1"></div>
          <!-- Background Generation Status -->
        <div v-if="isGeneratingAssetsText" class="flex items-center gap-3 px-4 py-1.5 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100/50 dark:border-indigo-500/20 rounded-full animate-in fade-in slide-in-from-left-4 duration-500 mr-4">
          <div class="relative flex items-center justify-center">
            <el-icon class="is-loading text-indigo-600 dark:text-indigo-400" :size="14"><Loading /></el-icon>
          </div>
          <div class="flex flex-col">
            <div class="flex items-center gap-2">
              <span class="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">正在分析资产...</span>
              <span class="text-[10px] font-black text-indigo-600 dark:text-indigo-400">{{ generationProgress }}%</span>
            </div>
            <div class="w-24 h-1 bg-slate-200 dark:bg-slate-800 rounded-full mt-0.5 overflow-hidden">
              <div 
                class="h-full bg-indigo-500 transition-all duration-500"
                :style="{ width: generationProgress + '%' }"
              ></div>
            </div>
          </div>
          <button 
            @click="isGeneratingAssetsText = true" 
            class="ml-2 w-6 h-6 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <el-icon :size="12"><FullScreen /></el-icon>
          </button>
        </div>

        <el-dropdown trigger="click" @command="handleEpisodeSwitch">
            <div class="flex items-center gap-2 cursor-pointer group px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-full transition-all">
              <h1 class="text-[13px] font-black text-slate-600 dark:text-slate-300 truncate max-w-[200px] group-hover:text-indigo-600 transition-colors">
                <template v-if="episodeNotFound">暂无剧集</template>
                <template v-else>{{ episode?.title || '请选择剧集' }}</template>
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
          <div class="w-px h-8 bg-slate-100 dark:bg-slate-700/50 mx-4"></div>
        </div>
      </div>

      <el-tabs v-model="activeTab" class="flex-1 flex flex-col min-h-0 modern-tabs relative bg-transparent">
      <!-- 角色管理 -->
      <el-tab-pane label="角色管理" name="characters">
        <div class="flex flex-col h-full p-6 pt-4">
          <div class="flex justify-between items-center mb-6">
            <div class="flex items-center gap-2">
              <span class="w-1 h-5 bg-indigo-600 rounded-full"></span>
              <h2 class="text-[18px] font-extrabold text-slate-800 dark:text-slate-100">主体库 · 角色 <span class="text-slate-500 font-normal ml-1">({{ characters.length }})</span></h2>
            </div>
            <div class="flex items-center gap-3">
              <!-- Multi-select Toggle -->
              <button 
                @click="toggleMultiSelect"
                class="h-10 px-4 flex items-center gap-2 rounded-full font-bold text-[13px] border transition-all duration-300"
                :class="isMultiSelect ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-indigo-600'"
              >
                <el-icon :size="16"><Pointer /></el-icon>
                <span>{{ isMultiSelect ? '取消多选' : '多选' }}</span>
              </button>

              <!-- Select All / Deselect All -->
              <template v-if="isMultiSelect">
                <button 
                  @click="handleSelectAll"
                  class="h-10 px-4 flex items-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-full font-bold text-[13px] border border-indigo-100 transition-all duration-300"
                >
                  <el-icon :size="16"><Finished /></el-icon>
                  <span>全选</span>
                </button>
                <button 
                  @click="handleDeselectAll"
                  class="h-10 px-4 flex items-center gap-2 bg-slate-50 text-slate-500 hover:text-indigo-600 rounded-full font-bold text-[13px] border border-slate-200 transition-all duration-300"
                >
                  <el-icon :size="16"><Close /></el-icon>
                  <span>取消全选</span>
                </button>
              </template>

              <!-- Batch Delete Button -->
              <transition name="fade">
                <button 
                  v-if="isMultiSelect && selectedAssetIds.size > 0"
                  @click="handleBatchDelete"
                  class="h-10 px-4 flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-full font-bold text-[13px] border border-red-100 transition-all duration-300"
                >
                  <el-icon :size="16"><Delete /></el-icon>
                  <span>删除 ({{ selectedAssetIds.size }})</span>
                </button>
              </transition>

              <!-- Product Design Info Button -->
              <button 
                @click="showDesignDialog = true"
                class="h-10 px-4 flex items-center gap-2 bg-slate-50 text-slate-500 hover:text-indigo-600 rounded-full font-bold text-[12px] border border-slate-200 transition-all duration-300"
              >
                <el-icon :size="14"><InfoFilled /></el-icon>
                <span>产品设计说明</span>
              </button>
              <!-- 批量生成角色图片 -->
              <button 
                v-if="!isMultiSelect"
                @click="toggleMultiSelect"
                class="h-10 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-[14px] font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <el-icon><MagicStick /></el-icon>
                批量生成角色
              </button>
              <button 
                v-else
                @click="handleBatchGenerate('character')"
                :disabled="selectedAssetIds.size === 0 || generatingAssetImages.size > 0"
                class="h-10 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-[14px] font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <el-icon><MagicStick /></el-icon>
                确认生成 ({{ Array.from(selectedAssetIds).filter(id => id.startsWith('char')).length }})
              </button>
              <!-- 新增角色入口 -->
              <button 
                @click="showLibraryModal = true"
                class="h-10 px-6 bg-indigo-50 text-indigo-600 rounded-full text-[14px] font-bold border border-indigo-200 hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2"
              >
                <el-icon><Menu /></el-icon>
                从主体库导入
              </button>
              <button 
                @click="addAsset('character')"
                class="h-10 px-6 bg-indigo-600 text-white rounded-full text-[14px] font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <el-icon><Plus /></el-icon>
                新增角色
              </button>
            </div>
          </div>
          <div class="flex-1 pr-2">
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 pb-6">
                <div 
                v-for="char in characters" 
                :key="char.id" 
                class="group relative flex flex-col bg-white dark:bg-slate-800 border rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300"
                :class="[
                  generatingAssetImages.has(`char-${char.id}`) ? 'ring-2 ring-indigo-500 ring-offset-2' : '',
                  isAssetSelected(char.id) ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/30' : 'border-slate-100 dark:border-slate-700',
                  isMultiSelect ? 'cursor-pointer' : 'cursor-default'
                ]"
                @click="toggleAssetSelection(char.id)"
              >
                <!-- Selection Overlay -->
                <div v-if="isMultiSelect" class="absolute top-3 right-3 z-20">
                  <div 
                    class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300"
                    :class="isAssetSelected(char.id) ? 'bg-indigo-600 border-indigo-600 text-white scale-110' : 'bg-white/80 border-slate-300 text-transparent'"
                  >
                    <el-icon :size="14" v-if="isAssetSelected(char.id)"><Check /></el-icon>
                  </div>
                </div>

                <div
                  class="aspect-video bg-slate-50 dark:bg-slate-900 relative overflow-hidden"
                  :class="!isMultiSelect ? 'cursor-pointer' : 'cursor-default'"
                  @click.stop="!isMultiSelect && openEditModal(char, 'character')"
                >
                  <!-- Loading Indicator for Image Generation -->
                  <div v-if="generatingAssetImages.has(`char-${char.id}`)" class="absolute inset-0 z-10 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm flex flex-col items-center justify-center">
                    <el-icon class="is-loading text-indigo-600 mb-2" :size="30"><Loading /></el-icon>
                    <span class="text-[12px] font-black text-indigo-600 uppercase tracking-widest animate-pulse">角色图片生成中...</span>
                  </div>

                  <div
                    v-if="getAssetImageCount(char) > 0 && !generatingAssetImages.has(`char-${char.id}`)"
                    class="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-slate-950/65 text-white text-[11px] font-black tracking-wide backdrop-blur-md border border-white/20"
                  >
                    {{ getAssetImageCount(char) }} 张历史图
                  </div>

                  <el-image 
                    v-if="char.image" 
                    :src="char.image" 
                    :preview-src-list="[char.image]"
                    preview-teleported
                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    fit="cover"
                    @click.stop
                  >
                    <template #error>
                      <div class="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100 dark:bg-slate-800">
                        <el-icon size="24"><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                  <div v-else-if="!generatingAssetImages.has(`char-${char.id}`)" class="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                    <el-icon size="40" class="mb-2"><Picture /></el-icon>
                    <span class="text-[14px]">暂无画面</span>
                  </div>
                  <!-- 编辑/删除功能 -->
                  <div v-if="char.image && !generatingAssetImages.has(`char-${char.id}`) && !isMultiSelect" class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
                    <div 
                      class="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-[#1890ff] shadow-lg transform scale-90 group-hover:scale-100 transition-all hover:scale-110 active:scale-95"
                      @click.stop="openEditModal(char, 'character')"
                    >
                      <el-icon size="20"><Edit /></el-icon>
                    </div>
                    <el-popconfirm
                      width="180"
                      confirm-button-text="确认"
                      cancel-button-text="取消"
                      confirm-button-type="danger"
                      :title="`确认删除角色 ${char.name}？`"
                      popper-class="modern-popconfirm-c-end"
                      @confirm="executeDeleteAsset(char, 'character')"
                    >
                      <template #reference>
                        <div 
                          class="w-10 h-10 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center text-red-500 shadow-xl shadow-red-500/10 transform scale-90 group-hover:scale-100 transition-all hover:scale-110 active:scale-95 hover:bg-red-500 hover:text-white"
                          @click.stop
                        >
                          <el-icon size="20"><Delete /></el-icon>
                        </div>
                      </template>
                    </el-popconfirm>
                  </div>
                </div>
                <div class="p-4 flex flex-col gap-1.5">
                  <div class="font-bold text-[16px] text-slate-800 dark:text-slate-100 truncate">{{ char.name }}</div>
                  <div class="text-[13px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed" :title="char.description">{{ char.description || '暂无描述' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 场景管理 -->
      <el-tab-pane label="场景管理" name="scenes">
        <div class="flex flex-col h-full p-6 pt-4">
          <div class="flex justify-between items-center mb-6">
            <div class="flex items-center gap-2">
              <span class="w-1 h-5 bg-indigo-600 rounded-full"></span>
              <h2 class="text-[18px] font-extrabold text-slate-800 dark:text-slate-100">主体库 · 场景 <span class="text-slate-400 font-normal ml-1">({{ scenes.length }})</span></h2>
            </div>
            <div class="flex items-center gap-3">
              <!-- Multi-select Toggle -->
              <button 
                @click="toggleMultiSelect"
                class="h-10 px-4 flex items-center gap-2 rounded-full font-bold text-[13px] border transition-all duration-300"
                :class="isMultiSelect ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-indigo-600'"
              >
                <el-icon :size="16"><Pointer /></el-icon>
                <span>{{ isMultiSelect ? '取消多选' : '多选' }}</span>
              </button>

              <!-- Select All / Deselect All -->
              <template v-if="isMultiSelect">
                <button 
                  @click="handleSelectAll"
                  class="h-10 px-4 flex items-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-full font-bold text-[13px] border border-indigo-100 transition-all duration-300"
                >
                  <el-icon :size="16"><Finished /></el-icon>
                  <span>全选</span>
                </button>
                <button 
                  @click="handleDeselectAll"
                  class="h-10 px-4 flex items-center gap-2 bg-slate-50 text-slate-500 hover:text-indigo-600 rounded-full font-bold text-[13px] border border-slate-200 transition-all duration-300"
                >
                  <el-icon :size="16"><Close /></el-icon>
                  <span>取消全选</span>
                </button>
              </template>

              <!-- Batch Delete Button -->
              <transition name="fade">
                <button 
                  v-if="isMultiSelect && selectedAssetIds.size > 0"
                  @click="handleBatchDelete"
                  class="h-10 px-4 flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-full font-bold text-[13px] border border-red-100 transition-all duration-300"
                >
                  <el-icon :size="16"><Delete /></el-icon>
                  <span>删除 ({{ selectedAssetIds.size }})</span>
                </button>
              </transition>

              <!-- Product Design Info Button -->
              <button 
                @click="showDesignDialog = true"
                class="h-10 px-4 flex items-center gap-2 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 rounded-full font-bold text-[12px] border border-slate-200 dark:border-slate-700 transition-all duration-300"
              >
                <el-icon :size="14"><InfoFilled /></el-icon>
                <span>产品设计说明</span>
              </button>
              <!-- 批量生成场景图片 -->
              <button 
                v-if="!isMultiSelect"
                @click="toggleMultiSelect"
                class="h-10 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-[14px] font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <el-icon><MagicStick /></el-icon>
                批量生成场景
              </button>
              <button 
                v-else
                @click="handleBatchGenerate('scene')"
                :disabled="selectedAssetIds.size === 0 || generatingAssetImages.size > 0"
                class="h-10 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-[14px] font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <el-icon><MagicStick /></el-icon>
                确认生成 ({{ Array.from(selectedAssetIds).filter(id => id.startsWith('scene')).length }})
              </button>
              <!-- 新增场景入口 -->
              <button 
                @click="showLibraryModal = true"
                class="h-10 px-6 bg-indigo-50 text-indigo-600 rounded-full text-[14px] font-bold border border-indigo-200 hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2"
              >
                <el-icon><Menu /></el-icon>
                从主体库导入
              </button>
              <button 
                @click="addAsset('scene')"
                class="h-10 px-6 bg-indigo-600 text-white rounded-full text-[14px] font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <el-icon><Plus /></el-icon>
                新增场景
              </button>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-6">
              <div 
                v-for="scene in scenes" 
                :key="scene.id" 
                class="group relative flex flex-col bg-white dark:bg-slate-800 border rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300"
                :class="[
                  generatingAssetImages.has(`scene-${scene.id}`) ? 'ring-2 ring-indigo-500 ring-offset-2' : '',
                  isAssetSelected(scene.id) ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/30' : 'border-slate-100 dark:border-slate-700',
                  isMultiSelect ? 'cursor-pointer' : 'cursor-default'
                ]"
                @click="toggleAssetSelection(scene.id)"
              >
                <!-- Selection Overlay -->
                <div v-if="isMultiSelect" class="absolute top-3 right-3 z-20">
                  <div 
                    class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300"
                    :class="isAssetSelected(scene.id) ? 'bg-indigo-600 border-indigo-600 text-white scale-110' : 'bg-white/80 border-slate-300 text-transparent'"
                  >
                    <el-icon :size="14" v-if="isAssetSelected(scene.id)"><Check /></el-icon>
                  </div>
                </div>

                <div
                  class="aspect-video bg-slate-50 dark:bg-slate-900 relative overflow-hidden"
                  :class="!isMultiSelect ? 'cursor-pointer' : 'cursor-default'"
                  @click.stop="!isMultiSelect && openEditModal(scene, 'scene')"
                >
                  <!-- Loading Indicator for Image Generation -->
                  <div v-if="generatingAssetImages.has(`scene-${scene.id}`)" class="absolute inset-0 z-10 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm flex flex-col items-center justify-center">
                    <el-icon class="is-loading text-indigo-600 mb-2" :size="30"><Loading /></el-icon>
                    <span class="text-[12px] font-black text-indigo-600 uppercase tracking-widest animate-pulse">场景图片生成中...</span>
                  </div>

                  <div
                    v-if="getAssetImageCount(scene) > 0 && !generatingAssetImages.has(`scene-${scene.id}`)"
                    class="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-slate-950/65 text-white text-[11px] font-black tracking-wide backdrop-blur-md border border-white/20"
                  >
                    {{ getAssetImageCount(scene) }} 张历史图
                  </div>

                  <el-image 
                    v-if="scene.image" 
                    :src="scene.image" 
                    :preview-src-list="[scene.image]"
                    preview-teleported
                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    fit="cover"
                    @click.stop
                  >
                    <template #error>
                      <div class="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100 dark:bg-slate-800">
                        <el-icon size="24"><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                  <div v-else-if="!generatingAssetImages.has(`scene-${scene.id}`)" class="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-500">
                    <el-icon size="40" class="mb-2"><Picture /></el-icon>
                    <span class="text-[13px]">暂无画面</span>
                  </div>
                  <!-- 编辑/删除功能 -->
                  <div v-if="scene.image && !generatingAssetImages.has(`scene-${scene.id}`) && !isMultiSelect" class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
                    <div 
                      class="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-[#1890ff] shadow-lg transform scale-90 group-hover:scale-100 transition-all hover:scale-110 active:scale-95"
                      @click.stop="openEditModal(scene, 'scene')"
                    >
                      <el-icon size="20"><Edit /></el-icon>
                    </div>
                    <el-popconfirm
                      width="180"
                      confirm-button-text="确认"
                      cancel-button-text="取消"
                      confirm-button-type="danger"
                      :title="`确认删除场景 ${scene.name}？`"
                      popper-class="modern-popconfirm-c-end"
                      @confirm="executeDeleteAsset(scene, 'scene')"
                    >
                      <template #reference>
                        <div 
                          class="w-10 h-10 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center text-red-500 shadow-xl shadow-red-500/10 transform scale-90 group-hover:scale-100 transition-all hover:scale-110 active:scale-95 hover:bg-red-500 hover:text-white"
                          @click.stop
                        >
                          <el-icon size="20"><Delete /></el-icon>
                        </div>
                      </template>
                    </el-popconfirm>
                  </div>
                </div>
                <div class="p-4 flex flex-col gap-1.5">
                  <div class="font-bold text-[15px] text-slate-800 dark:text-slate-100 truncate">{{ scene.name }}</div>
                  <div class="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed" :title="scene.description">{{ scene.description || '暂无描述' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 道具管理 -->
      <el-tab-pane label="道具管理" name="props">
        <div class="flex flex-col h-full p-6 pt-4">
          <div class="flex justify-between items-center mb-6">
            <div class="flex items-center gap-2">
              <span class="w-1 h-5 bg-indigo-600 rounded-full"></span>
              <h2 class="text-[18px] font-extrabold text-slate-800 dark:text-slate-100">主体库 · 道具 <span class="text-slate-400 font-normal ml-1">({{ propsList.length }})</span></h2>
            </div>
            <div class="flex items-center gap-3">
              <!-- Multi-select Toggle -->
              <button 
                @click="toggleMultiSelect"
                class="h-10 px-4 flex items-center gap-2 rounded-full font-bold text-[13px] border transition-all duration-300"
                :class="isMultiSelect ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-indigo-600'"
              >
                <el-icon :size="16"><Pointer /></el-icon>
                <span>{{ isMultiSelect ? '取消多选' : '多选' }}</span>
              </button>

              <!-- Select All / Deselect All -->
              <template v-if="isMultiSelect">
                <button 
                  @click="handleSelectAll"
                  class="h-10 px-4 flex items-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-full font-bold text-[13px] border border-indigo-100 transition-all duration-300"
                >
                  <el-icon :size="16"><Finished /></el-icon>
                  <span>全选</span>
                </button>
                <button 
                  @click="handleDeselectAll"
                  class="h-10 px-4 flex items-center gap-2 bg-slate-50 text-slate-500 hover:text-indigo-600 rounded-full font-bold text-[13px] border border-slate-200 transition-all duration-300"
                >
                  <el-icon :size="16"><Close /></el-icon>
                  <span>取消全选</span>
                </button>
              </template>

              <!-- Batch Delete Button -->
              <transition name="fade">
                <button 
                  v-if="isMultiSelect && selectedAssetIds.size > 0"
                  @click="handleBatchDelete"
                  class="h-10 px-4 flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-full font-bold text-[13px] border border-red-100 transition-all duration-300"
                >
                  <el-icon :size="16"><Delete /></el-icon>
                  <span>删除 ({{ selectedAssetIds.size }})</span>
                </button>
              </transition>

              <!-- Product Design Info Button -->
              <button 
                @click="showDesignDialog = true"
                class="h-10 px-4 flex items-center gap-2 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 rounded-full font-bold text-[12px] border border-slate-200 dark:border-slate-700 transition-all duration-300"
              >
                <el-icon :size="14"><InfoFilled /></el-icon>
                <span>产品设计说明</span>
              </button>
              <!-- 批量生成道具图片 -->
              <button 
                v-if="!isMultiSelect"
                @click="toggleMultiSelect"
                class="h-10 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-[14px] font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <el-icon><MagicStick /></el-icon>
                批量生成道具
              </button>
              <button 
                v-else
                @click="handleBatchGenerate('prop')"
                :disabled="selectedAssetIds.size === 0 || generatingAssetImages.size > 0"
                class="h-10 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-[14px] font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <el-icon><MagicStick /></el-icon>
                确认生成 ({{ Array.from(selectedAssetIds).filter(id => id.startsWith('prop')).length }})
              </button>
              <!-- 新增道具入口 -->
              <button 
                @click="showLibraryModal = true"
                class="h-10 px-6 bg-indigo-50 text-indigo-600 rounded-full text-[14px] font-bold border border-indigo-200 hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2"
              >
                <el-icon><Menu /></el-icon>
                从主体库导入
              </button>
              <button 
                @click="addAsset('prop')"
                class="h-10 px-6 bg-indigo-600 text-white rounded-full text-[14px] font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <el-icon><Plus /></el-icon>
                新增道具
              </button>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 pb-6">
              <div 
                v-for="prop in propsList" 
                :key="prop.id" 
                class="group relative flex flex-col bg-white dark:bg-slate-800 border rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300"
                :class="[
                  generatingAssetImages.has(`prop-${prop.id}`) ? 'ring-2 ring-indigo-500 ring-offset-2' : '',
                  isAssetSelected(prop.id) ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/30' : 'border-slate-100 dark:border-slate-700',
                  isMultiSelect ? 'cursor-pointer' : 'cursor-default'
                ]"
                @click="toggleAssetSelection(prop.id)"
              >
                <!-- Selection Overlay -->
                <div v-if="isMultiSelect" class="absolute top-3 right-3 z-20">
                  <div 
                    class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300"
                    :class="isAssetSelected(prop.id) ? 'bg-indigo-600 border-indigo-600 text-white scale-110' : 'bg-white/80 border-slate-300 text-transparent'"
                  >
                    <el-icon :size="14" v-if="isAssetSelected(prop.id)"><Check /></el-icon>
                  </div>
                </div>

                <div
                  class="aspect-video bg-slate-50 dark:bg-slate-900 relative overflow-hidden"
                  :class="!isMultiSelect ? 'cursor-pointer' : 'cursor-default'"
                  @click.stop="!isMultiSelect && openEditModal(prop, 'prop')"
                >
                  <!-- Loading Indicator for Image Generation -->
                  <div v-if="generatingAssetImages.has(`prop-${prop.id}`)" class="absolute inset-0 z-10 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm flex flex-col items-center justify-center">
                    <el-icon class="is-loading text-indigo-600 mb-2" :size="30"><Loading /></el-icon>
                    <span class="text-[12px] font-black text-indigo-600 uppercase tracking-widest animate-pulse">道具图片生成中...</span>
                  </div>

                  <div
                    v-if="getAssetImageCount(prop) > 0 && !generatingAssetImages.has(`prop-${prop.id}`)"
                    class="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-slate-950/65 text-white text-[11px] font-black tracking-wide backdrop-blur-md border border-white/20"
                  >
                    {{ getAssetImageCount(prop) }} 张历史图
                  </div>

                  <el-image 
                    v-if="prop.image" 
                    :src="prop.image" 
                    :preview-src-list="[prop.image]"
                    preview-teleported
                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    fit="cover"
                    @click.stop
                  >
                    <template #error>
                      <div class="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100 dark:bg-slate-800">
                        <el-icon size="24"><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                  <div v-else-if="!generatingAssetImages.has(`prop-${prop.id}`)" class="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-500">
                    <el-icon size="40" class="mb-2"><Picture /></el-icon>
                    <span class="text-[13px]">暂无画面</span>
                  </div>
                  <!-- 编辑/删除功能 -->
                  <div v-if="prop.image && !generatingAssetImages.has(`prop-${prop.id}`) && !isMultiSelect" class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
                    <div 
                      class="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-[#1890ff] shadow-lg transform scale-90 group-hover:scale-100 transition-all hover:scale-110 active:scale-95"
                      @click.stop="openEditModal(prop, 'prop')"
                    >
                      <el-icon size="20"><Edit /></el-icon>
                    </div>
                    <el-popconfirm
                      width="180"
                      confirm-button-text="确认"
                      cancel-button-text="取消"
                      confirm-button-type="danger"
                      :title="`确认删除道具 ${prop.name}？`"
                      popper-class="modern-popconfirm-c-end"
                      @confirm="executeDeleteAsset(prop, 'prop')"
                    >
                      <template #reference>
                        <div 
                          class="w-10 h-10 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center text-red-500 shadow-xl shadow-red-500/10 transform scale-90 group-hover:scale-100 transition-all hover:scale-110 active:scale-95 hover:bg-red-500 hover:text-white"
                          @click.stop
                        >
                          <el-icon size="20"><Delete /></el-icon>
                        </div>
                      </template>
                    </el-popconfirm>
                  </div>
                </div>
                <div class="p-4 flex flex-col gap-1.5">
                  <div class="font-bold text-[15px] text-slate-800 dark:text-slate-100 truncate">{{ prop.name }}</div>
                  <div class="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed" :title="prop.description">{{ prop.description || '暂无描述' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>

    <div class="flex justify-end items-center p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
      <el-tooltip
        :disabled="isAssetsComplete"
        :content="incompleteMessage"
        placement="top"
      >
        <span class="inline-block">
          <button 
            @click="handleNextStep"
            :disabled="!isAssetsComplete"
            class="h-12 px-10 bg-indigo-600 text-white rounded-full text-[15px] font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center gap-2"
          >
            <span>下一步：分镜视频</span>
            <el-icon><ArrowRight /></el-icon>
          </button>
        </span>
      </el-tooltip>
    </div>

    <!-- Unsaved Changes Confirm Dialog -->
    <el-dialog
      v-model="confirmVisible"
      title="提示"
      width="400px"
      center
    >
      <div class="text-center py-4">
        <p class="text-[15px] text-slate-700">您还有未保存的修改，确定要离开吗？</p>
      </div>
      <template #footer>
        <div class="flex justify-center gap-4 pb-2">
          <button 
            @click="confirmVisible = false"
            class="h-10 px-8 bg-white text-slate-500 rounded-full text-[14px] font-bold hover:text-slate-700 transition-all border border-slate-200"
          >
            取消
          </button>
          <button 
            @click="goToEpisodes"
            class="h-10 px-10 bg-indigo-600 text-white rounded-full text-[14px] font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            确定
          </button>
        </div>
      </template>
    </el-dialog>

    <!-- Asset Edit Modal -->
    <SubjectEditDialog
      v-model="editModalVisible"
      :subject="editingAsset"
      :is-edit="isEditAsset"
      :hide-upload="currentAssetType === 'character'"
      @save="saveAsset"
    />

    <!-- Subject Library Modal -->
    <SubjectLibraryModal
      v-model="showLibraryModal"
      :subjects="episodeStore.subjects"
      :current-project-name="dramaStore.outlineData?.title || '未命名剧本'"
      @confirm="handleLibraryConfirm"
    />

    <!-- Product Design Dialog -->
    <ProductDesignDialog
      v-model="showDesignDialog"
      id="short-drama-assets"
      :default-content="{
        title: '资产中心 (主体设置)',
        location: '承接剧本创作环节，将文字描述转化为视觉资产。管理剧本中所有的角色、场景、道具，并固定其视觉特征，为后续视频生成提供基准。',
        layout: [
          '**分类导航：** 顶部分类管理【角色库】、【场景库】、【道具库】。',
          '**主体卡片：** 包含基准图 (Main Image)、名称及 AI 自动提取的特征描述。',
          '**编辑弹窗：** 核心交互区，支持精修主体信息、新增参考图（可选）、生成形象及上传本地资源。'
        ],
        interactions: [
          {
            text: '**主体资产管理 (2.2 & 2.4 升级)：**\n - **手动模式：** 2.2 版本全面开放手动【新增主体】及【批量生成】（角色、场景、道具）功能。\n - **智能规划：** 支持一键批量生成更多角色、场景或道具，AI 自动解析剧本提取特征。\n - **批量操作：** 新增【多选】模式，支持批量选中主体进行删除等快捷操作。\n - **克隆主体 (2.4)：** 在编辑弹窗侧边栏，支持一键克隆当前选中的历史记录，方便基于现有设定进行快速衍生。',
            image: ''
          },
          {
            text: '**图片历史管理 (2.4 新增)：**\n - **版本回溯：** 每个资产卡片左上角显示历史图片数量角标。\n - **历史看板：** 编辑弹窗左侧新增历史看板，记录每一次生成的图片、参考图及配置参数，支持一键应用历史版本，实现视觉资产的精细化版本控制。',
            image: ''
          },
          {
            text: '**AI 自动规划：** 系统仍支持深度扫描剧本自动提取角色、场景及道具信息，作为创作基准。',
            image: ''
          }
        ],
        version: '2.2'
      }"
    />

    <GlobalUIDesignSpecsDialog
      v-model="showUIDesignSpecsDialog"
      title="UI 设计标注 - 主体设置"
      subtitle="Assets UI Design Specifications"
      :groups="uiDesignGroups as any"
    />

    <button
      @click="showUIDesignSpecsDialog = true"
      class="fixed bottom-6 right-6 z-[1500] w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 shadow-lg shadow-indigo-500/30 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      title="查看UI设计标注"
    >
      <el-icon :size="22"><Monitor /></el-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { Plus, Picture, Edit, MagicStick, Upload, ArrowRight, ArrowDown, InfoFilled, Close, Document, Location, Monitor, Pointer, Delete, Loading, Check, Finished, Menu } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import { useDramaStore } from '../../store/drama';
import { useEpisodeStore } from '../../store/episode';
import SubjectEditDialog from '@/components/AIShortDrama/SubjectEditDialog.vue';
import SubjectLibraryModal from '@/components/AIShortDrama/SubjectLibraryModal.vue';
import ProductDesignDialog from '@/components/Common/ProductDesignDialog.vue';
import GlobalUIDesignSpecsDialog from '@/components/Common/GlobalUIDesignSpecsDialog.vue';

const router = useRouter();
const dramaStore = useDramaStore();
const episodeStore = useEpisodeStore();
const activeTab = ref('characters');
const showDesignDialog = ref(false);
const showUIDesignSpecsDialog = ref(false);
const showLibraryModal = ref(false);

const handleLibraryConfirm = (selectedItems: any[]) => {
  selectedItems.forEach(item => {
    // 检查是否已存在同名主体
    if (!episodeStore.subjects.find(s => s.name === item.name)) {
      episodeStore.addSubject({
        id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: item.name,
        type: item.type,
        image: item.image,
        reference_image: item.reference_image || '',
        description: item.description || ''
      });
    }
  });
  ElMessage.success(`成功导入 ${selectedItems.length} 个主体`);
};

// Episode Switching Logic
const episodeId = ref(episodeStore.episodes[0]?.id);
const episode = computed(() => episodeStore.episodes.find(e => e.id === episodeId.value));
const episodeNotFound = computed(() => episodeStore.episodes.length === 0);

const handleEpisodeSwitch = (id: string) => {
  episodeId.value = id;
};

// Selection State
const isMultiSelect = ref(false);
const selectedAssetIds = reactive<Set<string>>(new Set());

const toggleMultiSelect = () => {
  isMultiSelect.value = !isMultiSelect.value;
  if (!isMultiSelect.value) {
    selectedAssetIds.clear();
  }
};

const toggleAssetSelection = (id: string) => {
  if (!isMultiSelect.value) return;
  if (selectedAssetIds.has(id)) {
    selectedAssetIds.delete(id);
  } else {
    selectedAssetIds.add(id);
  }
};

const isAssetSelected = (id: string) => selectedAssetIds.has(id);

const handleSelectAll = () => {
  let currentAssets: any[] = [];
  if (activeTab.value === 'characters') currentAssets = characters.value;
  else if (activeTab.value === 'scenes') currentAssets = scenes.value;
  else if (activeTab.value === 'props') currentAssets = propsList.value;

  currentAssets.forEach(asset => {
    selectedAssetIds.add(asset.id);
  });
};

const handleDeselectAll = () => {
  let currentAssets: any[] = [];
  if (activeTab.value === 'characters') currentAssets = characters.value;
  else if (activeTab.value === 'scenes') currentAssets = scenes.value;
  else if (activeTab.value === 'props') currentAssets = propsList.value;

  currentAssets.forEach(asset => {
    selectedAssetIds.delete(asset.id);
  });
};

const handleBatchDelete = () => {
  if (selectedAssetIds.size === 0) return;
  
  ElMessageBox.confirm(
    `确认删除选中的 ${selectedAssetIds.size} 个主体？`,
    '批量删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      buttonSize: 'default',
      customClass: 'modern-message-box'
    }
  ).then(() => {
    selectedAssetIds.forEach(id => {
      episodeStore.deleteSubject(id);
    });
    selectedAssetIds.clear();
    isMultiSelect.value = false;
    ElMessage.success('批量删除成功');
  }).catch(() => {});
};

const uiDesignGroups = {
  layout: [
    {
      id: 'assets-page',
      title: '资产中心 (主体设置)',
      description: '三类资产管理：角色 / 场景 / 道具；卡片化瀑布网格 + 底部下一步。',
      items: [
        { name: '页面容器', value: 'h-full flex flex-col overflow-hidden', description: '固定全高，内部滚动交由 Tabs Content 承担' },
        { name: '页面背景', value: 'bg-[#f8fafc]', description: '浅灰蓝底色（暗色模式：dark:bg-slate-900）' },
        { name: 'Tabs Header', value: 'height: 56px', description: '.modern-tabs el-tabs__item 高度/行高' },
        { name: 'Tabs Header Padding', value: 'px: 24px', description: '.modern-tabs el-tabs__header padding: 0 24px' },
        { name: '内容区内边距', value: 'p-6 pt-4', description: '每个 Tab 内部主容器 padding' },
        { name: 'Header 间距', value: 'mb-6', description: '标题行与网格间距' },
        { name: '卡片圆角', value: 'rounded-2xl', description: '资产卡片统一 16px 级别圆角' },
        { name: '卡片图片比例', value: 'aspect-video', description: '统一 16:9 基准图展示' },
        { name: '角色网格列数', value: '2/3/4/5/6/8', description: 'grid-cols-2...2xl:grid-cols-8 gap-4' },
        { name: '场景网格列数', value: '1/2/3/4', description: 'grid-cols-1...lg:grid-cols-4 gap-6' },
        { name: '道具网格列数', value: '2/3/4/6', description: 'grid-cols-2...lg:grid-cols-6 gap-6' },
        { name: '底部操作区', value: 'p-6 border-t', description: 'footer 操作条（下一步按钮容器）' },
        { name: '生成中遮罩层', value: 'fixed inset-0 z-[10000]', description: '大 Loading Overlay（主体文字生成阶段）' },
        { name: '遮罩卡片尺寸', value: 'max-w-lg p-10 rounded-[40px]', description: 'Overlay 中央卡片' }
      ]
    }
  ],
  style: [
    {
      id: 'assets-typography',
      title: '字体与层级',
      description: '页内标题、Tab、卡片与按钮的字号/字重规范。',
      items: [
        { name: 'Tab 文本', style: { fontSize: '15px', fontWeight: '600' }, description: '.modern-tabs el-tabs__item（默认态）' },
        { name: '模块标题', style: { fontSize: '18px', fontWeight: '800' }, description: 'text-[18px] font-extrabold（主体库 · 角色/场景/道具）' },
        { name: '计数弱化', style: { fontSize: '14px', fontWeight: '400', opacity: '0.7' }, description: '标题后计数：text-slate-400/500 font-normal' },
        { name: '卡片名称', style: { fontSize: '15-16px', fontWeight: '700' }, description: '角色 text-[16px]；场景/道具 text-[15px]（truncate）' },
        { name: '卡片描述', style: { fontSize: '12-13px', fontWeight: '400', lineHeight: '1.5' }, description: 'line-clamp-2 leading-relaxed' },
        { name: '信息按钮', style: { fontSize: '12px', fontWeight: '700' }, description: '产品设计说明：text-[12px] font-bold' },
        { name: '批量生成按钮', style: { fontSize: '14px', fontWeight: '700' }, description: '批量生成角色/场景/道具：text-[14px] font-bold，渐变背景' },
        { name: '新增按钮', style: { fontSize: '14px', fontWeight: '700' }, description: '新增角色/场景/道具：text-[14px] font-bold' },
        { name: '下一步按钮', style: { fontSize: '15px', fontWeight: '700' }, description: 'text-[15px] font-bold（含 icon）' },
        { name: '生成中标题', style: { fontSize: '24px', fontWeight: '900' }, description: 'Overlay H2：text-2xl font-black tracking-tight' },
        { name: '生成中状态', style: { fontSize: '10px', fontWeight: '900', letterSpacing: '0.2em' }, description: 'Asset Analysis Engine...：uppercase tracking-[0.2em]' }
      ]
    }
  ],
  color: [
    {
      id: 'assets-color',
      title: '颜色规范',
      description: '背景、主色、文字、边框与状态色。',
      items: [
        { name: '页面背景', value: '#F8FAFC' },
        { name: '卡片底色', value: 'bg-white' },
        { name: '内容底色', value: '#FCFDFE' },
        { name: '主色条', value: 'bg-indigo-600（标题左侧竖条）' },
        { name: '主按钮', value: 'bg-indigo-600 text-white' },
        { name: 'Tabs 激活色', value: '#1890ff' },
        { name: 'Tabs Border', value: '#F1F5F9' },
        { name: '卡片边框', value: 'border-slate-100' },
        { name: '提示按钮底色', value: 'bg-slate-50 border-slate-200' },
        { name: '卡片 Hover 阴影', value: 'shadow-[0_8px_30px_rgb(0,0,0,0.12)]' },
        { name: '生成中高亮渐变', value: 'from-indigo-500 via-purple-500 to-pink-500' },
        { name: '删除态', value: 'text-red-500 hover:bg-red-500 hover:text-white' },
        { name: 'Ring 高亮', value: 'ring-2 ring-indigo-500 ring-offset-2' }
      ]
    }
  ],
  button: [
    {
      id: 'assets-components',
      title: '按钮与组件元素',
      description: '关键交互点位：产品说明、新增、编辑/删除、下一步、UI 标注入口。',
      items: [
        { name: '产品设计说明', tag: 'button', classes: 'h-10 px-4 bg-slate-50 text-slate-500 hover:text-indigo-600 rounded-full font-bold text-[12px] border border-slate-200', notes: ['右上角入口；打开产品设计说明弹窗'] },
        { name: '批量生成主体按钮', tag: 'button', classes: 'h-10 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-[14px] font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 flex items-center gap-2', notes: ['角色/场景/道具三处一致；MagicStick 图标 + 文案'] },
        { name: '新增主体按钮', tag: 'button', classes: 'h-10 px-6 bg-indigo-600 text-white rounded-full text-[14px] font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 flex items-center gap-2', notes: ['角色/场景/道具三处一致；Plus 图标 + 文案'] },
        { name: '卡片-编辑', tag: 'div', classes: 'w-10 h-10 rounded-full bg-white text-[#1890ff] shadow-lg scale-90 group-hover:scale-100 hover:scale-110 active:scale-95', notes: ['卡片 hover 时显示；点击打开编辑弹窗'] },
        { name: '卡片-删除', tag: 'div', classes: 'w-10 h-10 rounded-2xl bg-white text-red-500 shadow-xl shadow-red-500/10 scale-90 group-hover:scale-100 hover:scale-110 active:scale-95 hover:bg-red-500 hover:text-white', notes: ['卡片 hover 时显示；带 Popconfirm 二次确认'] },
        { name: '下一步：分镜视频', tag: 'button', classes: 'h-12 px-10 bg-indigo-600 text-white rounded-full text-[15px] font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2', notes: ['禁用态由 isAssetsComplete 控制；外层 tooltip 提示未完成原因'] },
        { name: '未保存确认-取消', tag: 'button', classes: 'h-10 px-8 bg-white text-slate-500 rounded-full text-[14px] font-bold border border-slate-200', notes: ['关闭 confirmVisible'] },
        { name: '未保存确认-确定', tag: 'button', classes: 'h-10 px-10 bg-indigo-600 text-white rounded-full text-[14px] font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95', notes: ['跳转至分镜视频页'] },
        { name: 'UI 标注入口', tag: 'button', classes: 'fixed bottom-6 right-6 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 shadow-lg shadow-indigo-500/30 text-white hover:scale-105 active:scale-95 transition-transform', notes: ['页面右下角悬浮（Monitor 图标）；打开 UI 设计标注弹窗（含分类 Tabs）'] }
      ]
    }
  ]
};

// Asset Lists
const characters = computed({
  get: () => episodeStore.subjects.filter(s => s.type === 'character'),
  set: (val) => {
    const otherSubjects = episodeStore.subjects.filter(s => s.type !== 'character');
    episodeStore.setSubjects([...otherSubjects, ...val]);
  }
});

const scenes = computed({
  get: () => episodeStore.subjects.filter(s => s.type === 'scene'),
  set: (val) => {
    const otherSubjects = episodeStore.subjects.filter(s => s.type !== 'scene');
    episodeStore.setSubjects([...otherSubjects, ...val]);
  }
});

const propsList = computed({
  get: () => episodeStore.subjects.filter(s => s.type === 'prop'),
  set: (val) => {
    const otherSubjects = episodeStore.subjects.filter(s => s.type !== 'prop');
    episodeStore.setSubjects([...otherSubjects, ...val]);
  }
});

interface AssetImageItem {
  id: string;
  url: string;
  isSelected: boolean;
  createdAt: number;
  name?: string;
  description?: string;
  reference_image?: string;
  voice_description?: string;
  voice_audio?: string;
}

const createImageHistoryItem = (
  url: string,
  createdAt = Date.now(),
  meta?: Partial<Pick<AssetImageItem, 'name' | 'description' | 'reference_image' | 'voice_description' | 'voice_audio'>>
): AssetImageItem => ({
  id: `img_${createdAt}_${Math.random().toString(36).slice(2, 8)}`,
  url,
  isSelected: true,
  createdAt,
  name: meta?.name,
  description: meta?.description,
  reference_image: meta?.reference_image,
  voice_description: meta?.voice_description,
  voice_audio: meta?.voice_audio
});

const normalizeAssetImageState = (asset: any) => {
  const rawHistory = Array.isArray(asset?.imageHistory)
    ? asset.imageHistory.filter((item: any) => item && item.url)
    : [];

  const imageHistory: AssetImageItem[] = rawHistory.map((item: any, index: number) => ({
    id: item.id || `img_${Date.now()}_${index}`,
    url: item.url,
    isSelected: Boolean(item.isSelected),
    createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now() - (rawHistory.length - index) * 1000,
    name: item.name ?? asset?.name ?? '',
    description: item.description ?? asset?.description ?? '',
    reference_image: item.reference_image ?? asset?.reference_image ?? '',
    voice_description: item.voice_description ?? asset?.voice_description ?? '',
    voice_audio: item.voice_audio ?? asset?.voice_audio ?? ''
  }));

  if (!imageHistory.length && asset?.image) {
    imageHistory.push(
      createImageHistoryItem(asset.image, Date.now() - 1000, {
        name: asset?.name ?? '',
        description: asset?.description ?? '',
        reference_image: asset?.reference_image ?? '',
        voice_description: asset?.voice_description ?? '',
        voice_audio: asset?.voice_audio ?? ''
      })
    );
  }

  if (!imageHistory.length) {
    return {
      image: asset?.image || '',
      selectedImageId: '',
      imageHistory: [] as AssetImageItem[]
    };
  }

  const selectedItem =
    imageHistory.find(item => item.id === asset?.selectedImageId) ||
    imageHistory.find(item => item.isSelected) ||
    imageHistory[imageHistory.length - 1];

  return {
    image: selectedItem.url,
    selectedImageId: selectedItem.id,
    imageHistory: imageHistory.map(item => ({
      ...item,
      isSelected: item.id === selectedItem.id
    }))
  };
};

const normalizeAssetPayload = (asset: any) => ({
  ...asset,
  ...normalizeAssetImageState(asset)
});

const buildAssetImagePatch = (asset: any, nextUrl: string) => {
  const normalized = normalizeAssetImageState(asset);
  const nextItem = createImageHistoryItem(nextUrl, Date.now(), {
    name: asset?.name ?? '',
    description: asset?.description ?? '',
    reference_image: asset?.reference_image ?? '',
    voice_description: asset?.voice_description ?? '',
    voice_audio: asset?.voice_audio ?? ''
  });

  return {
    image: nextUrl,
    selectedImageId: nextItem.id,
    imageHistory: [
      ...normalized.imageHistory.map(item => ({ ...item, isSelected: false })),
      nextItem
    ]
  };
};

const getAssetTypeTheme = (type: string) => {
  if (type === 'character') {
    return {
      bgStart: '#4f46e5',
      bgEnd: '#a855f7',
      badge: 'ROLE',
      label: '角色'
    };
  }
  if (type === 'scene') {
    return {
      bgStart: '#0f766e',
      bgEnd: '#06b6d4',
      badge: 'SCENE',
      label: '场景'
    };
  }
  return {
    bgStart: '#ea580c',
    bgEnd: '#f59e0b',
    badge: 'PROP',
    label: '道具'
  };
};

const escapeSvgText = (value: string) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const wrapSvgLines = (value: string, maxChars = 18, maxLines = 2) => {
  const text = String(value || '').trim();
  if (!text) return [];
  const lines: string[] = [];
  for (let i = 0; i < text.length && lines.length < maxLines; i += maxChars) {
    lines.push(text.slice(i, i + maxChars));
  }
  return lines;
};

const createInstantAssetImage = (asset: any, variant = Date.now()) => {
  const theme = getAssetTypeTheme(asset?.type);
  const titleLines = wrapSvgLines(asset?.name || `${theme.label}预览`, 12, 2);
  const descLines = wrapSvgLines(asset?.description || `已生成${theme.label}视觉预览`, 22, 2);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${theme.bgStart}" />
          <stop offset="100%" stop-color="${theme.bgEnd}" />
        </linearGradient>
        <linearGradient id="glass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.28)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0.10)" />
        </linearGradient>
      </defs>
      <rect width="1280" height="720" fill="url(#bg)" />
      <circle cx="1080" cy="120" r="180" fill="rgba(255,255,255,0.16)" />
      <circle cx="180" cy="620" r="220" fill="rgba(255,255,255,0.10)" />
      <rect x="76" y="72" rx="36" ry="36" width="1128" height="576" fill="rgba(15,23,42,0.18)" stroke="rgba(255,255,255,0.24)" />
      <rect x="124" y="118" rx="24" ry="24" width="200" height="54" fill="rgba(255,255,255,0.18)" />
      <text x="224" y="153" text-anchor="middle" font-size="28" font-family="Arial, PingFang SC, Microsoft YaHei, sans-serif" font-weight="700" fill="#ffffff">${escapeSvgText(theme.badge)}</text>
      <text x="124" y="250" font-size="78" font-family="Arial, PingFang SC, Microsoft YaHei, sans-serif" font-weight="800" fill="#ffffff">${escapeSvgText(theme.label)}</text>
      ${titleLines.map((line, index) => `<text x="124" y="${340 + index * 76}" font-size="62" font-family="Arial, PingFang SC, Microsoft YaHei, sans-serif" font-weight="800" fill="#ffffff">${escapeSvgText(line)}</text>`).join('')}
      ${descLines.map((line, index) => `<text x="128" y="${500 + index * 42}" font-size="30" font-family="Arial, PingFang SC, Microsoft YaHei, sans-serif" font-weight="500" fill="rgba(255,255,255,0.92)">${escapeSvgText(line)}</text>`).join('')}
      <text x="124" y="604" font-size="22" font-family="Arial, PingFang SC, Microsoft YaHei, sans-serif" font-weight="700" letter-spacing="3" fill="rgba(255,255,255,0.72)">AI SHORT DRAMA ASSET ${escapeSvgText(String(variant).slice(-6))}</text>
    </svg>
  `.trim();
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

import { generateImageAPI } from '@/utils/imageGenerator';

const shouldRepairAssetImage = (url: string | undefined) => {
  if (!url || url === 'FAILED') return true;
  return /image\.pollinations\.ai|picsum\.photos|placehold\.co|unsplash\.com/i.test(url);
};

const getAssetImageCount = (asset: any) => normalizeAssetImageState(asset).imageHistory.length;

const needsAssetImageNormalization = (asset: any) => {
  const history = Array.isArray(asset?.imageHistory) ? asset.imageHistory : [];
  if (asset?.image && history.length === 0) return true;
  if (!history.length) return false;

  const selectedCount = history.filter((item: any) => item?.isSelected).length;
  const hasSelectedId = history.some((item: any) => item?.id === asset?.selectedImageId);
  return selectedCount !== 1 || !hasSelectedId;
};

const normalizeAllSubjectImageHistories = () => {
  if (!episodeStore.subjects.length) return;

  let hasChanges = false;
  const normalizedSubjects = episodeStore.subjects.map(subject => {
    if (!needsAssetImageNormalization(subject)) return subject;
    hasChanges = true;
    return normalizeAssetPayload(subject);
  });

  if (hasChanges) {
    episodeStore.setSubjects(normalizedSubjects as any);
  }
};

// Loading States
const isGeneratingAssetsText = ref(false);
const generationSessionId = ref(0);
const generatingAssetImages = reactive<Set<string>>(new Set());
const generationProgress = ref(0);
const currentAssetInfo = ref('');

// Navigation Logic
const confirmVisible = ref(false);
const hasUnsavedChanges = ref(false); // For demo, let's say true if we edited anything

const isAssetsComplete = computed(() => {
  const hasBasicAssets = (characters.value?.length || 0) > 0 && (scenes.value?.length || 0) > 0;
  const isGenerating = isGeneratingAssetsText.value || generatingAssetImages.size > 0;
  
  // Check if any asset is missing a description or image (or has a failed image)
  const allAssets = [...(characters.value || []), ...(scenes.value || []), ...(propsList.value || [])];
  const hasIncompleteAssets = allAssets.some(asset => {
    // Check for empty name or description
    if (!asset.name || !asset.description) return true;
    // Check for empty image or failed image
    if (!asset.image || asset.image === 'FAILED') return true;
    return false;
  });

  return hasBasicAssets && !isGenerating && !hasIncompleteAssets;
});

watch(isAssetsComplete, (newVal) => {
  if (dramaStore && typeof dramaStore.setAssetsGenerated === 'function') {
    dramaStore.setAssetsGenerated(newVal);
  }
}, { immediate: true });

const incompleteMessage = computed(() => {
  if (isGeneratingAssetsText.value) return '正在生成主体文字信息...';
  if (generatingAssetImages.size > 0) return '正在生成主体图片...';
  if ((characters.value?.length || 0) === 0 || (scenes.value?.length || 0) === 0) return '请至少添加一个角色和一个场景';
  
  const allAssets = [...(characters.value || []), ...(scenes.value || []), ...(propsList.value || [])];
  
  // Check specifically for what's missing
  const missingText = allAssets.find(asset => !asset.name || !asset.description);
  if (missingText) return `请完善主体 ${missingText.name || '未命名'} 的描述信息`;
  
  const missingImage = allAssets.find(asset => !asset.image || asset.image === 'FAILED');
  if (missingImage) return `请为 ${missingImage.name} 生成或上传一张图片`;

  return '请先完成主体设置';
});

const handleNextStep = () => {
  if (hasUnsavedChanges.value) {
    confirmVisible.value = true;
  } else {
    goToEpisodes();
  }
};

const goToEpisodes = () => {
  confirmVisible.value = false;
  router.push('/ai-short-drama-creator/storyboard');
};

onMounted(async () => {
  // Check if we need to generate assets (mock check)
  // If coming from script page and no assets yet, trigger generation
  // 模拟真实历史数据：如果 episodeStore 中已经有主体数据，则不再重新生成
  if (episodeStore.subjects.length === 0) {
    await startSequentialGeneration();
  } else {
    // 数据修正逻辑：如果检测到旧版数字 ID 导致图片错位，进行自动修复
    const hasOldIds = episodeStore.subjects.some(s => s.id === '1' || s.id === '2');
    if (hasOldIds) {
      console.log('检测到旧版数据 ID，正在执行自动修复以确保图片正确...');
      const fixedSubjects = episodeStore.subjects.map(s => {
        if (s.type === 'character') {
          if (s.name === '林星') return { ...s, id: 'char-1', image: createInstantAssetImage({ ...s, id: 'char-1' }) };
          if (s.name === '陈宇') return { ...s, id: 'char-2', image: createInstantAssetImage({ ...s, id: 'char-2' }) };
        }
        if (s.type === 'scene') {
          if (s.name === '公司会议室') return { ...s, id: 'scene-1', image: createInstantAssetImage({ ...s, id: 'scene-1' }) };
          if (s.name === '林星公寓') return { ...s, id: 'scene-2', image: createInstantAssetImage({ ...s, id: 'scene-2' }) };
        }
        if (s.type === 'prop') {
          if (s.name === '复古相机') return { ...s, id: 'prop-1', image: createInstantAssetImage({ ...s, id: 'prop-1' }) };
          if (s.name === '定情项链') return { ...s, id: 'prop-2', image: createInstantAssetImage({ ...s, id: 'prop-2' }) };
        }
        return s;
      });
      episodeStore.setSubjects(fixedSubjects);
    }
    normalizeAllSubjectImageHistories();
    console.log('检测到已有主体数据，保留历史记录，跳过自动生成。');

    const snapshot = [...episodeStore.subjects];
    for (const asset of snapshot) {
      if (!shouldRepairAssetImage(asset.image)) continue;
      const nextUrl = createInstantAssetImage(asset);
      const patch = buildAssetImagePatch(asset, nextUrl);
      episodeStore.updateSubject(asset.id, patch);
    }
  }
});

const startSequentialGeneration = async () => {
  const sessionId = ++generationSessionId.value;
  isGeneratingAssetsText.value = true;
  currentAssetInfo.value = '正在解析剧本，提取核心角色与场景...';
  
  // Phase 1: Text Generation (Big Loading)
  const mockAssets = {
    characters: [
      { id: 'char-1', name: '林星', description: '28岁，广告公司创意总监，外表坚强内心柔软，职场女强人。', prompt: '1个女孩，漂亮，头像，职业装，办公室女性，坚强独立，写实风格，8k分辨率', image: '' },
      { id: 'char-2', name: '陈宇', description: '30岁，自由摄影师，随性洒刺，林星的青梅竹马。', prompt: '1个男孩，帅气，头像，休闲装，摄影师，轻松自然，写实风格，8k分辨率', image: '' }
    ],
    scenes: [
      { id: 'scene-1', name: '公司会议室', description: '现代感十足的会议室，落地窗，能看到繁华的都市夜景。', prompt: '现代办公室会议室，大落地窗，繁华城市夜景，电影级光影，8k分辨率', image: '' },
      { id: 'scene-2', name: '林星公寓', description: '温馨的单身公寓，布置得很有格调。', prompt: '温馨单身公寓，室内设计时尚，暖色调灯光，写实风格，8k分辨率', image: '' }
    ],
    props: [
      { id: 'prop-1', name: '复古相机', description: '陈宇常用的老式胶片相机，带有岁月痕迹。', prompt: '复古胶片相机，细节质感丰富，电影级光影，8k分辨率', image: '' },
      { id: 'prop-2', name: '定情项链', description: '一条星星形状的银质项链。', prompt: '星形纯银项链，闪耀光泽，微距摄影，8k分辨率', image: '' }
    ]
  };

  const steps = ['提取角色特征', '规划场景氛围', '锁定核心道具'];
  for (let i = 0; i < steps.length; i++) {
    if (sessionId !== generationSessionId.value) return;
    currentAssetInfo.value = steps[i];
    generationProgress.value = Math.round(((i + 1) / steps.length) * 100);
    await new Promise(resolve => setTimeout(resolve, 160));
  }

  // Populate text info
  const allGeneratedSubjects = [
    ...mockAssets.characters.map(c => ({ ...c, type: 'character' as const })),
    ...mockAssets.scenes.map(s => ({ ...s, type: 'scene' as const })),
    ...mockAssets.props.map(p => ({ ...p, type: 'prop' as const }))
  ];
  
  episodeStore.setSubjects(allGeneratedSubjects);
  
  if (sessionId !== generationSessionId.value) return;
  isGeneratingAssetsText.value = false;
  
  // Phase 2: Sequential Image Generation (Per-asset loading)
  await generateImagesForAssets(allGeneratedSubjects, sessionId);
  
  ElMessage.success('主体资产生成完毕');
};

const generateImagesForAssets = async (assets: any[], sessionId: number) => {
  for (const asset of assets) {
    if (sessionId !== generationSessionId.value) return;
    const typePrefix = asset.type === 'character' ? 'char' : asset.type;
    const loadingKey = `${typePrefix}-${asset.id}`;
    generatingAssetImages.add(loadingKey);
    
    // Switch tab automatically to show progress
    if (asset.type === 'character') activeTab.value = 'characters';
    else if (asset.type === 'scene') activeTab.value = 'scenes';
    else activeTab.value = 'props';

    await new Promise(resolve => setTimeout(resolve, 120));
    if (sessionId !== generationSessionId.value) return;

    const prompt = `${asset.name}, ${asset.description}, realistic, high quality`;
    const nextUrl = await generateImageAPI(prompt);
    const patch = buildAssetImagePatch(asset, nextUrl);
    episodeStore.updateSubject(asset.id, patch);
    
    generatingAssetImages.delete(loadingKey);
  }
};

const handleBatchGenerate = async (type: 'character' | 'scene' | 'prop') => {
  if (generatingAssetImages.size > 0) return;

  const selectedItems = episodeStore.subjects.filter(s => s.type === type && selectedAssetIds.has(s.id));
  
  if (selectedItems.length === 0) {
    ElMessage.warning(`请先选择要生成的${getAssetTypeName(type)}`);
    return;
  }

  // Generate images for selected existing assets (will show loading on cards)
  await generateImagesForAssets(selectedItems, generationSessionId.value);
  
  // Clear selection and exit multi-select after successful generation
  selectedAssetIds.clear();
  isMultiSelect.value = false;
  
  ElMessage.success(`批量生成 ${selectedItems.length} 张图片成功`);
};

// Modal State
const editModalVisible = ref(false);
const isEditAsset = ref(false);
const currentAssetType = ref<'character' | 'scene' | 'prop'>('character');
const editingAsset = ref<any>(null);

const getAssetTypeName = (type: string) => {
  if (type === 'character') return '角色';
  if (type === 'scene') return '场景';
  if (type === 'prop') return '道具';
  return '';
};

const openEditModal = (asset: any, type: 'character' | 'scene' | 'prop') => {
  currentAssetType.value = type;
  editingAsset.value = normalizeAssetPayload(JSON.parse(JSON.stringify(asset)));
  editingAsset.value.type = type;
  isEditAsset.value = true;
  editModalVisible.value = true;
};

const addAsset = (type: 'character' | 'scene' | 'prop') => {
  currentAssetType.value = type;
  editingAsset.value = {
    id: Date.now().toString(),
    name: '',
    description: '',
    prompt: '',
    type: type,
    image: '',
    reference_image: '',
    selectedImageId: '',
    imageHistory: []
  };
  isEditAsset.value = false;
  editModalVisible.value = true;
};

const saveAsset = (data: any) => {
  if (!data.name) {
    ElMessage.warning('请输入名称');
    return;
  }
  
  const normalizedData = normalizeAssetPayload(data);
  const index = episodeStore.subjects.findIndex((s: any) => s.id === normalizedData.id);
  if (index > -1) {
    episodeStore.updateSubject(normalizedData.id, normalizedData as any);
  } else {
    episodeStore.addSubject(normalizedData as any);
  }
  
  ElMessage.success('保存成功');
  editModalVisible.value = false;
};

const executeDeleteAsset = (asset: any, type: 'character' | 'scene' | 'prop') => {
  episodeStore.deleteSubject(asset.id);
  ElMessage({
    message: '删除成功',
    type: 'success',
    customClass: 'modern-message-success'
  });
};

// Expose internal state for testing
defineExpose({
  hasUnsavedChanges,
  confirmVisible,
  isAssetsComplete,
  handleNextStep,
  goToEpisodes,
  characters,
  scenes,
  propsList
});

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
.theme-primary-text {
  color: #1890ff !important;
}
.theme-primary-border {
  border-color: #1890ff !important;
}
.theme-primary-outline-btn {
  color: #1890ff !important;
  border-color: #1890ff !important;
  border-radius: 8px !important;
}
.theme-primary-outline-btn:hover {
  background-color: #e6f7ff !important;
}

.modern-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
  padding: 0 24px;
  background-color: #fff;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: center;
}
.dark .modern-tabs :deep(.el-tabs__header) {
  padding: 0 24px;
  background-color: #1e293b;
  border-bottom-color: #334155;
}
.modern-tabs :deep(.el-tabs__nav-wrap) {
  margin-bottom: 0;
}
.modern-tabs :deep(.el-tabs__nav-scroll) {
  display: flex;
  justify-content: center;
}
.modern-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}
.modern-tabs :deep(.el-tabs__item) {
  font-size: 15px;
  font-weight: 800;
  color: #64748b;
  padding: 0 32px;
  height: 56px;
  line-height: 56px;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  letter-spacing: 0.02em;
}
.dark .modern-tabs :deep(.el-tabs__item) {
  color: #94a3b8;
}
.modern-tabs :deep(.el-tabs__item.is-active) {
  color: #4f46e5;
  transform: scale(1.05);
}
.modern-tabs :deep(.el-tabs__active-bar) {
  background: linear-gradient(90deg, #4f46e5, #9333ea);
  height: 4px;
  border-radius: 4px 4px 0 0;
  box-shadow: 0 -2px 10px rgba(79, 70, 229, 0.3);
}
.modern-tabs :deep(.el-tabs__item:hover) {
  color: #4f46e5;
  opacity: 0.8;
}
.modern-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow-y: hidden;
  background-color: #f8fafc;
}
.dark .modern-tabs :deep(.el-tabs__content) {
  background-color: #0f172a;
}
.modern-tabs .el-tab-pane {
  height: 100%;
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

.asset-edit-modal :deep(.el-dialog__body) {
  padding-top: 10px;
  padding-bottom: 10px;
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

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
