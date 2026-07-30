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

    <!-- Batch Subject Generation Loading (Non-blocking) -->
    <teleport to="body">
      <transition name="el-zoom-in-center">
        <div v-if="isBatchGenerating" class="fixed inset-0 z-[1500] flex items-center justify-center pointer-events-none">
          <div class="relative w-[440px] px-6 flex flex-col items-center gap-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl p-10 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-white dark:border-slate-700 pointer-events-auto">
            <div class="relative">
              <div class="absolute inset-0 bg-teal-500 rounded-2xl blur-xl opacity-20 animate-pulse"></div>
              <div class="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-lg rotate-3 animate-float-slow">
                <el-icon :size="32" class="animate-bounce-subtle"><Document /></el-icon>
              </div>
            </div>
            <div class="text-center space-y-2">
              <h3 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">批量生成中</h3>
              <p class="text-slate-500 dark:text-slate-400 text-[13px] font-medium flex items-center justify-center gap-2">
                <el-icon class="is-loading"><Loading /></el-icon>
                {{ batchCurrentInfo }}
              </p>
            </div>
            <div class="w-full space-y-3 px-2">
              <div class="flex justify-between items-end mb-1">
                <span class="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest">生成进度</span>
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ batchGenerationProgress }}%</span>
              </div>
              <div class="w-full h-2 bg-slate-100 dark:bg-slate-900/50 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50 relative">
                <div
                  class="h-full bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 transition-all duration-500 ease-out relative"
                  :style="{ width: batchGenerationProgress + '%' }"
                >
                  <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-fast"></div>
                </div>
              </div>
            </div>
            <button
              @click="batchSessionId++"
              class="w-full h-11 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-black text-[13px] hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-teal-900/20 transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 group"
            >
              <span>取消生成</span>
              <el-icon><Close /></el-icon>
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
          
          <div class="w-px h-8 bg-slate-100 dark:bg-slate-700/50 mx-2"></div>
          
          <!-- Background Generation Status -->
          <div v-if="isGeneratingAssetsText" class="flex items-center gap-3 px-4 py-1.5 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100/50 dark:border-indigo-500/20 rounded-full animate-in fade-in slide-in-from-left-4 duration-500">
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
        </div>

      </div>

      <!-- Model Selector & Batch Download Overlay - Aligned with Script Title Row -->
      <div class="absolute right-6 top-0 h-[56px] flex items-center z-[100] pointer-events-auto">
        <button
          @click="batchDownloadAssets"
          class="h-10 px-5 flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-full font-bold text-[13px] shadow-sm hover:shadow-md hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500 transition-all duration-300 active:scale-95 mr-3"
          title="批量下载主体图片（角色/道具/场景，含历史图）"
        >
          <el-icon :size="16"><Download /></el-icon>
          <span>批量下载</span>
        </button>
        <AIModelSelector v-model="modelStore.selectedImageModel" type="image" moduleId="assets-view-image" />
      </div>

      <!-- Empty State: 3 Entry Cards -->
      <div
        v-if="isPageEmpty"
        class="flex-1 flex flex-col items-center justify-center p-6 min-h-0"
      >
        <div class="flex flex-col items-center gap-6 max-w-2xl w-full">
          <div class="relative mb-2">
            <div class="absolute inset-0 bg-indigo-500 rounded-3xl blur-2xl opacity-15 animate-pulse"></div>
            <div class="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 rotate-3">
              <el-icon :size="40"><MagicStick /></el-icon>
            </div>
          </div>
          <div class="text-center">
            <h2 class="text-[24px] font-black text-slate-800 dark:text-slate-100 tracking-tight">主体资产中心</h2>
            <p class="text-slate-500 dark:text-slate-400 text-[14px] mt-2">您的主体库目前是空的，请选择一种方式开始创建主体资产</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full mt-4">
            <!-- Card 1: 批量生成描述以及主体图片 -->
            <button
              @click="startSequentialGeneration"
              class="group relative flex flex-col items-center gap-4 p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-[0_4px_20px_rgb(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgb(79,70,229,0.15)] hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
            >
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:rotate-3 transition-transform">
                <el-icon :size="28"><MagicStick /></el-icon>
              </div>
              <div class="text-center">
                <h3 class="text-[15px] font-bold text-slate-800 dark:text-slate-100">批量生成描述+图片</h3>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">AI 全自动解析剧本，批量生成所有主体的文字描述与图片</p>
              </div>
              <span class="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-1 uppercase tracking-wider">推荐 · 全自动</span>
            </button>

            <!-- Card 2: 上传主体资产 -->
            <button
              @click="showUploadModal = true"
              class="group relative flex flex-col items-center gap-4 p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-[0_4px_20px_rgb(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgb(20,184,166,0.15)] hover:border-teal-200 dark:hover:border-teal-500/50 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
            >
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/25 group-hover:rotate-3 transition-transform">
                <el-icon :size="28"><Upload /></el-icon>
              </div>
              <div class="text-center">
                <h3 class="text-[15px] font-bold text-slate-800 dark:text-slate-100">上传主体资产</h3>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">按格式上传本地图片，文件名即主体名称，自定义导入</p>
              </div>
              <span class="text-[11px] font-bold text-teal-600 dark:text-teal-400 mt-1 uppercase tracking-wider">手动导入</span>
            </button>

            <!-- Card 3: 批量生成主体文字描述 -->
            <button
              @click="handleTextOnlyGen"
              class="group relative flex flex-col items-center gap-4 p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-[0_4px_20px_rgb(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgb(234,88,12,0.15)] hover:border-orange-200 dark:hover:border-orange-500/50 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
            >
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/25 group-hover:rotate-3 transition-transform">
                <el-icon :size="28"><Document /></el-icon>
              </div>
              <div class="text-center">
                <h3 class="text-[15px] font-bold text-slate-800 dark:text-slate-100">批量生成文字描述</h3>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">仅生成所有主体的文字描述信息，后续手动上传图片</p>
              </div>
              <span class="text-[11px] font-bold text-orange-600 dark:text-orange-400 mt-1 uppercase tracking-wider">仅文字</span>
            </button>
          </div>

          <p class="text-[11px] text-slate-400 dark:text-slate-500 text-center mt-2">💡 推荐使用「批量生成描述+图片」一键完成所有主体的创建</p>
        </div>
      </div>

      <!-- Main Content (Tabs + Footer) -->
      <template v-if="!isPageEmpty">
        <el-tabs v-model="activeTab" class="flex-1 flex flex-col min-h-0 modern-tabs relative bg-transparent">
      <!-- 角色管理 -->
      <el-tab-pane label="角色管理" name="characters">
        <div class="flex flex-col h-full p-6 pt-4">
          <div class="flex justify-between items-center mb-6">
            <div class="flex items-center gap-2">
              <span class="w-1 h-5 bg-indigo-600 rounded-full"></span>
              <h2 class="text-[18px] font-extrabold text-slate-800 dark:text-slate-100">资产库 · 角色 <span class="text-slate-500 font-normal ml-1">({{ characters.length }})</span></h2>
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
              <!-- 批量生成主体图和文字描述 (Mode 2 - Manual) -->
              <button
                v-if="characters.length > 0"
                @click="handleBatchGenerateSubjectInfo('character')"
                :disabled="isBatchGenerating"
                class="h-10 px-4 flex items-center gap-2 rounded-full font-bold text-[12px] border transition-all duration-300"
                :class="isBatchGenerating ? 'bg-indigo-100 border-indigo-200 text-indigo-600 opacity-60 cursor-not-allowed' : 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white border-transparent shadow-lg shadow-teal-500/20 hover:scale-105 active:scale-95'"
              >
                <el-icon :class="{ 'is-loading': isBatchGenerating }">
                  <Document v-if="!isBatchGenerating" />
                  <Loading v-else />
                </el-icon>
                <span>{{ isBatchGenerating ? `生成中... ${batchGenerationProgress}%` : '批量生成描述和图片' }}</span>
              </button>
              <!-- 新增角色入口 -->
              <button 
                @click="showLibraryModal = true"
                class="h-10 px-6 bg-indigo-50 text-indigo-600 rounded-full text-[14px] font-bold border border-indigo-200 hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2"
              >
                <el-icon><Menu /></el-icon>
                从资产库导入
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
                  <div v-if="char.image && !generatingAssetImages.has(`char-${char.id}`) && !isMultiSelect" class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                    <div 
                      class="w-9 h-9 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-[#1890ff] shadow-lg transform scale-90 group-hover:scale-100 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                      title="编辑主体"
                      @click.stop="openEditModal(char, 'character')"
                    >
                      <el-icon size="18"><Edit /></el-icon>
                    </div>
                    <div 
                      class="w-9 h-9 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-indigo-600 shadow-lg transform scale-90 group-hover:scale-100 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                      :class="{ 'pointer-events-none opacity-50': syncingAssetId === char.id }"
                      title="同步厂商资产库"
                      @click.stop="handleSyncVendorAssets(char)"
                    >
                      <el-icon size="18" :class="{ 'is-loading': syncingAssetId === char.id }">
                        <Refresh v-if="syncingAssetId !== char.id" />
                        <Loading v-else />
                      </el-icon>
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
                          class="w-9 h-9 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-red-500 shadow-xl shadow-red-500/10 transform scale-90 group-hover:scale-100 transition-all hover:scale-110 active:scale-95 hover:bg-red-500 hover:text-white cursor-pointer"
                          title="删除主体"
                          @click.stop
                        >
                          <el-icon size="18"><Delete /></el-icon>
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
              <h2 class="text-[18px] font-extrabold text-slate-800 dark:text-slate-100">资产库 · 场景 <span class="text-slate-400 font-normal ml-1">({{ scenes.length }})</span></h2>
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
              <!-- 批量生成主体图和文字描述 (Mode 2 - Manual) -->
              <button
                v-if="scenes.length > 0"
                @click="handleBatchGenerateSubjectInfo('scene')"
                :disabled="isBatchGenerating"
                class="h-10 px-4 flex items-center gap-2 rounded-full font-bold text-[12px] border transition-all duration-300"
                :class="isBatchGenerating ? 'bg-indigo-100 border-indigo-200 text-indigo-600 opacity-60 cursor-not-allowed' : 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white border-transparent shadow-lg shadow-teal-500/20 hover:scale-105 active:scale-95'"
              >
                <el-icon :class="{ 'is-loading': isBatchGenerating }">
                  <Document v-if="!isBatchGenerating" />
                  <Loading v-else />
                </el-icon>
                <span>{{ isBatchGenerating ? `生成中... ${batchGenerationProgress}%` : '批量生成描述和图片' }}</span>
              </button>
              <!-- 新增场景入口 -->
              <button 
                @click="showLibraryModal = true"
                class="h-10 px-6 bg-indigo-50 text-indigo-600 rounded-full text-[14px] font-bold border border-indigo-200 hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2"
              >
                <el-icon><Menu /></el-icon>
                从资产库导入
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
                  <div v-if="scene.image && !generatingAssetImages.has(`scene-${scene.id}`) && !isMultiSelect" class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                    <div 
                      class="w-9 h-9 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-[#1890ff] shadow-lg transform scale-90 group-hover:scale-100 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                      title="编辑主体"
                      @click.stop="openEditModal(scene, 'scene')"
                    >
                      <el-icon size="18"><Edit /></el-icon>
                    </div>
                    <div 
                      class="w-9 h-9 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-indigo-600 shadow-lg transform scale-90 group-hover:scale-100 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                      :class="{ 'pointer-events-none opacity-50': syncingAssetId === scene.id }"
                      title="同步厂商资产库"
                      @click.stop="handleSyncVendorAssets(scene)"
                    >
                      <el-icon size="18" :class="{ 'is-loading': syncingAssetId === scene.id }">
                        <Refresh v-if="syncingAssetId !== scene.id" />
                        <Loading v-else />
                      </el-icon>
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
                          class="w-9 h-9 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-red-500 shadow-xl shadow-red-500/10 transform scale-90 group-hover:scale-100 transition-all hover:scale-110 active:scale-95 hover:bg-red-500 hover:text-white cursor-pointer"
                          title="删除主体"
                          @click.stop
                        >
                          <el-icon size="18"><Delete /></el-icon>
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
              <h2 class="text-[18px] font-extrabold text-slate-800 dark:text-slate-100">资产库 · 道具 <span class="text-slate-400 font-normal ml-1">({{ propsList.length }})</span></h2>
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
              <!-- 批量生成主体图和文字描述 (Mode 2 - Manual) -->
              <button
                v-if="propsList.length > 0"
                @click="handleBatchGenerateSubjectInfo('prop')"
                :disabled="isBatchGenerating"
                class="h-10 px-4 flex items-center gap-2 rounded-full font-bold text-[12px] border transition-all duration-300"
                :class="isBatchGenerating ? 'bg-indigo-100 border-indigo-200 text-indigo-600 opacity-60 cursor-not-allowed' : 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white border-transparent shadow-lg shadow-teal-500/20 hover:scale-105 active:scale-95'"
              >
                <el-icon :class="{ 'is-loading': isBatchGenerating }">
                  <Document v-if="!isBatchGenerating" />
                  <Loading v-else />
                </el-icon>
                <span>{{ isBatchGenerating ? `生成中... ${batchGenerationProgress}%` : '批量生成描述和图片' }}</span>
              </button>
              <!-- 新增道具入口 -->
              <button 
                @click="showLibraryModal = true"
                class="h-10 px-6 bg-indigo-50 text-indigo-600 rounded-full text-[14px] font-bold border border-indigo-200 hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2"
              >
                <el-icon><Menu /></el-icon>
                从资产库导入
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
                  <div v-if="prop.image && !generatingAssetImages.has(`prop-${prop.id}`) && !isMultiSelect" class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                    <div 
                      class="w-9 h-9 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-[#1890ff] shadow-lg transform scale-90 group-hover:scale-100 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                      title="编辑主体"
                      @click.stop="openEditModal(prop, 'prop')"
                    >
                      <el-icon size="18"><Edit /></el-icon>
                    </div>
                    <div 
                      class="w-9 h-9 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-indigo-600 shadow-lg transform scale-90 group-hover:scale-100 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                      :class="{ 'pointer-events-none opacity-50': syncingAssetId === prop.id }"
                      title="同步厂商资产库"
                      @click.stop="handleSyncVendorAssets(prop)"
                    >
                      <el-icon size="18" :class="{ 'is-loading': syncingAssetId === prop.id }">
                        <Refresh v-if="syncingAssetId !== prop.id" />
                        <Loading v-else />
                      </el-icon>
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
                          class="w-9 h-9 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-red-500 shadow-xl shadow-red-500/10 transform scale-90 group-hover:scale-100 transition-all hover:scale-110 active:scale-95 hover:bg-red-500 hover:text-white cursor-pointer"
                          title="删除主体"
                          @click.stop
                        >
                          <el-icon size="18"><Delete /></el-icon>
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
      </template>

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

    <!-- Upload Asset Modal - ZIP upload -->
    <el-dialog
      v-model="showUploadModal"
      title="上传主体资产"
      width="640px"
      center
      :close-on-click-modal="false"
      :destroy-on-close="true"
    >
      <div class="p-3 space-y-4">
        <!-- Upload zone -->
        <div
          v-if="!parsedSubjects.length"
          @dragover.prevent="uploadDragOver = true"
          @dragleave.prevent="uploadDragOver = false"
          @drop.prevent="handleZipDrop"
          class="border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer"
          :class="uploadDragOver ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50'"
        >
          <input
            ref="zipInputRef"
            type="file"
            accept=".zip"
            class="hidden"
            @change="handleZipSelect"
          />
          <el-icon :size="44" class="text-slate-300 dark:text-slate-500 mb-3"><Upload /></el-icon>
          <p class="text-[15px] font-bold text-slate-600 dark:text-slate-300">
            上传主体资产压缩包 (.zip)
          </p>
          <p class="text-[12px] text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
            请按以下格式组织压缩包文件夹
          </p>

          <!-- 格式说明：三分类 -->
          <div class="mt-5 grid grid-cols-3 gap-3 text-left max-w-md mx-auto">
            <!-- 角色 -->
            <div class="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-700/50">
              <div class="flex items-center gap-2 mb-1.5">
                <el-icon :size="14" class="text-indigo-600 dark:text-indigo-400"><User /></el-icon>
                <span class="text-[12px] font-bold text-indigo-600 dark:text-indigo-400">角色</span>
              </div>
              <div class="font-mono text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                <p>角色/林星/</p>
                <p>&nbsp;&nbsp;├ 图片.jpg</p>
                <p>&nbsp;&nbsp;├ 描述.txt</p>
                <p>&nbsp;&nbsp;└ 音频描述.txt</p>
              </div>
            </div>

            <!-- 场景 -->
            <div class="p-3 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-700/50">
              <div class="flex items-center gap-2 mb-1.5">
                <el-icon :size="14" class="text-teal-600 dark:text-teal-400"><OfficeBuilding /></el-icon>
                <span class="text-[12px] font-bold text-teal-600 dark:text-teal-400">场景</span>
              </div>
              <div class="font-mono text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                <p>场景/会议室/</p>
                <p>&nbsp;&nbsp;├ 图片.jpg</p>
                <p>&nbsp;&nbsp;└ 描述.txt</p>
              </div>
            </div>

            <!-- 道具 -->
            <div class="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-700/50">
              <div class="flex items-center gap-2 mb-1.5">
                <el-icon :size="14" class="text-orange-600 dark:text-orange-400"><Box /></el-icon>
                <span class="text-[12px] font-bold text-orange-600 dark:text-orange-400">道具</span>
              </div>
              <div class="font-mono text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                <p>道具/项链/</p>
                <p>&nbsp;&nbsp;├ 图片.png</p>
                <p>&nbsp;&nbsp;└ 描述.txt</p>
              </div>
            </div>
          </div>

          <p class="text-[10px] text-slate-400 dark:text-slate-500 mt-4 leading-relaxed">
            文件名可自定义，系统自动按类型识别。<br>
            图片：.jpg/.jpeg/.png/.webp/.gif  |  描述：.txt/.md<br>
            音频描述（仅角色）：音频描述.txt — 纯文字描述角色声音特征
          </p>

          <button
            @click="(zipInputRef as any)?.click()"
            class="mt-4 h-10 px-8 bg-indigo-600 text-white rounded-full text-[13px] font-bold hover:bg-indigo-700 active:scale-95 transition-all"
          >
            <el-icon :size="14"><Folder /></el-icon>
            <span class="ml-1">选择 zip 文件</span>
          </button>
        </div>

        <!-- Zip file preview -->
        <div
          v-if="parsedSubjects.length"
          class="relative p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-[12px] font-bold text-slate-600 dark:text-slate-300">
              压缩包：{{ zipFileName }}
            </span>
            <div class="flex gap-2">
              <button
                @click="handleReUpload"
                class="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                重新选择
              </button>
            </div>
          </div>
          <p class="text-[11px] text-slate-400 dark:text-slate-500 mb-3">
            共解析出 {{ parsedSubjects.length }} 个主体
          </p>
          <div class="flex flex-col gap-2 max-h-[320px] overflow-y-auto">
            <div
              v-for="(s, i) in parsedSubjects"
              :key="i"
              class="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
            >
              <div
                v-if="s.imageData"
                class="w-14 h-14 rounded-lg bg-cover bg-center shrink-0 border border-slate-200"
                :style="{ backgroundImage: `url(${s.imageData})` }"
              ></div>
              <div
                v-else
                class="w-14 h-14 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0"
              >
                <el-icon :size="18"><Picture /></el-icon>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-[11px] font-bold px-1.5 rounded-md"
                    :class="s.type === 'character' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : s.type === 'scene' ? 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'">
                    {{ s.type === 'character' ? '角色' : s.type === 'scene' ? '场景' : '道具' }}
                  </span>
                  <p class="text-[13px] font-bold text-slate-700 dark:text-slate-200 truncate">{{ s.name }}</p>
                </div>
                <p v-if="s.description" class="text-[11px] text-slate-500 dark:text-slate-400 truncate">{{ s.description }}</p>
                <p v-if="s.type === 'character' && s.audioDesc" class="text-[11px] text-indigo-500 dark:text-indigo-400 truncate">🎤 {{ s.audioDesc }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Uploading progress -->
        <div v-if="isUploading" class="space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">上传进度</span>
            <span class="text-[11px] font-bold text-slate-400">{{ uploadProgress }}%</span>
          </div>
          <div class="w-full h-2 bg-slate-100 dark:bg-slate-900/50 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              :style="{ width: uploadProgress + '%' }"
            ></div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-center gap-4 pb-2">
          <button
            @click="handleCancelUpload"
            class="h-10 px-8 bg-white text-slate-500 rounded-full text-[14px] font-bold border border-slate-200 transition-all"
          >
            取消
          </button>
          <button
            @click="handleUploadAsset"
            :disabled="isUploading || parsedSubjects.length === 0"
            class="h-10 px-10 bg-indigo-600 text-white rounded-full text-[14px] font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all"
          >
            <span v-if="isUploading">上传中...</span>
            <span v-else>确认上传 {{ parsedSubjects.length }} 个主体</span>
          </button>
        </div>
      </template>
    </el-dialog>

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
          },
          {
            text: '**批量生成主体图和文字描述 (2.9 新增)：**\n - **两种模式：** ① 自动模式（小白用户）：点击【完成，去设置主体】后系统自动生成所有主体；② 手动模式：在各 Tab 页点击【批量生成描述和图片】按钮，手动触发当前分类下所有主体的文字描述与图片批量生成。\n - **操作对象：** 只针对已存在于列表中的主体，不新增、不删除，仅补充描述与图片。\n - **生成流程：** 逐一对每个主体生成文字描述 + 基准图片，生成中展示进度浮层，支持随时取消。',
            image: ''
          }
        ],
        version: '2.9'
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
import { useModelStore } from '@/store/models';
import { VIDEO_MODELS } from '@/config/models';
import AIModelSelector from '@/components/Common/ModelSelector.vue';
import { Plus, Picture, Edit, MagicStick, Refresh, Upload, ArrowRight, ArrowDown, InfoFilled, Close, Document, Location, Monitor, Pointer, Delete, Loading, Check, Finished, Menu, Download, User, OfficeBuilding, Box, Folder } from '@element-plus/icons-vue';

const modelStore = useModelStore();
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
const syncingAssetId = ref<string | null>(null);

const handleSyncVendorAssets = async (asset: any) => {
  syncingAssetId.value = asset.id;
  const currentModel = modelStore.selectedVideoModel;
  const vendorName = VIDEO_MODELS.find(v => v.models.some(m => m.id === currentModel))?.name || '当前视频厂商';
  
  ElMessage({
    message: `正在为 ${asset.name} 从 ${vendorName} 同步预置资产库...`,
    type: 'info',
    duration: 2000
  });

  // 模拟同步过程
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  syncingAssetId.value = null;
  ElMessage.success(`${asset.name} 已成功同步 ${vendorName} 的最新资产数据`);
};

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
        { name: '模块标题', style: { fontSize: '18px', fontWeight: '800' }, description: 'text-[18px] font-extrabold（资产库 · 角色/场景/道具）' },
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
        { name: '卡片-同步', tag: 'div', classes: 'w-9 h-9 rounded-full bg-white text-indigo-600 shadow-lg scale-90 group-hover:scale-100 hover:scale-110 active:scale-95', notes: ['新增功能；从当前视频生成厂商同步该主体的预置资产'] },
        { name: '卡片-编辑', tag: 'div', classes: 'w-9 h-9 rounded-full bg-white text-[#1890ff] shadow-lg scale-90 group-hover:scale-100 hover:scale-110 active:scale-95', notes: ['卡片 hover 时显示；点击打开编辑弹窗'] },
        { name: '卡片-删除', tag: 'div', classes: 'w-9 h-9 rounded-full bg-white text-red-500 shadow-xl shadow-red-500/10 scale-90 group-hover:scale-100 hover:scale-110 active:scale-95 hover:bg-red-500 hover:text-white', notes: ['卡片 hover 时显示；带 Popconfirm 二次确认'] },
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
import JSZip from 'jszip';
import FileSaver from 'file-saver';

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

// Batch Generation (Mode 2 - Manual) State
const isBatchGenerating = ref(false);
const batchGenerationProgress = ref(0);
const batchCurrentInfo = ref('');
const batchSessionId = ref(0);

// Mock descriptions database for batch generation
const mockDescriptions: Record<string, Record<string, { description: string; prompt: string }>> = {
  character: {
    default: {
      description: '根据剧本角色设定，AI 自动生成详细的角色外貌、性格与背景描述。',
      prompt: '1个角色，写实风格，电影级光影，8k分辨率'
    },
    '林星': {
      description: '28岁，广告公司创意总监，外表坚强内心柔软，职场女强人，一头利落的短发，眼神坚定。',
      prompt: '1个女孩，28岁，短发，职业装，办公室女性，坚强独立，自信表情，写实风格，电影级光影，8k分辨率'
    },
    '陈宇': {
      description: '30岁，自由摄影师，随性洒脱，林星的青梅竹马，温和笑容，文艺气质。',
      prompt: '1个男孩，30岁，休闲装，摄影师气质，温和笑容，文艺风，写实风格，电影级光影，8k分辨率'
    }
  },
  scene: {
    default: {
      description: '根据剧本场景设定，AI 自动生成详细的环境氛围与空间描述。',
      prompt: '场景环境，电影级光影，8k分辨率'
    },
    '公司会议室': {
      description: '现代感十足的会议室，落地窗，能看到繁华的都市夜景，冷色调灯光。',
      prompt: '现代办公室会议室，大落地窗，繁华城市夜景，冷色调灯光，电影级光影，8k分辨率'
    },
    '林星公寓': {
      description: '温馨的单身公寓，布置得很有格调，暖色调灯光，简约北欧风。',
      prompt: '温馨单身公寓，室内设计时尚，暖色调灯光，北欧风，写实风格，8k分辨率'
    }
  },
  prop: {
    default: {
      description: '根据剧本道具设定，AI 自动生成详细的物品外观与质感描述。',
      prompt: '物品特写，细节质感丰富，电影级光影，8k分辨率'
    },
    '复古相机': {
      description: '陈宇常用的老式胶片相机，带有岁月痕迹，金属质感机身。',
      prompt: '复古胶片相机，金属机身，岁月痕迹，细节质感丰富，电影级光影，8k分辨率'
    },
    '定情项链': {
      description: '一条星星形状的银质项链，闪耀光泽，象征两人的感情纽带。',
      prompt: '星形纯银项链，闪耀光泽，精致工艺，微距摄影，8k分辨率'
    }
  }
};

const generateSubjectDescription = (name: string, type: string): { description: string; prompt: string } => {
  const typeDict = mockDescriptions[type] || mockDescriptions.character;
  return typeDict[name] || typeDict.default;
};

const handleBatchGenerateSubjectInfo = async (type: 'character' | 'scene' | 'prop') => {
  if (isBatchGenerating.value) {
    ElMessage.warning('批量生成正在进行中，请稍候...');
    return;
  }

  const targetType = type;
  let currentAssets: any[] = [];
  if (targetType === 'character') currentAssets = characters.value;
  else if (targetType === 'scene') currentAssets = scenes.value;
  else currentAssets = propsList.value;

  if (currentAssets.length === 0) {
    ElMessage.warning(`暂无${getAssetTypeName(targetType)}，请先添加主体`);
    return;
  }

  const sessionId = ++batchSessionId.value;
  isBatchGenerating.value = true;
  batchGenerationProgress.value = 0;
  const typeName = getAssetTypeName(targetType);

  for (let i = 0; i < currentAssets.length; i++) {
    if (sessionId !== batchSessionId.value) {
      isBatchGenerating.value = false;
      return;
    }

    const asset = currentAssets[i];
    batchCurrentInfo.value = `正在为 ${typeName}「${asset.name}」生成描述和图片...`;
    batchGenerationProgress.value = Math.round(((i + 1) / currentAssets.length) * 100);

    // Generate description
    const { description, prompt } = generateSubjectDescription(asset.name, targetType);
    if (description && asset.description !== description) {
      episodeStore.updateSubject(asset.id, { description });
    }

    // Generate image
    const typePrefix = targetType === 'character' ? 'char' : targetType;
    const loadingKey = `${typePrefix}-${asset.id}`;
    generatingAssetImages.add(loadingKey);

    if (targetType === 'character') activeTab.value = 'characters';
    else if (targetType === 'scene') activeTab.value = 'scenes';
    else activeTab.value = 'props';

    await new Promise(resolve => setTimeout(resolve, 500));
    if (sessionId !== batchSessionId.value) {
      generatingAssetImages.delete(loadingKey);
      continue;
    }

    const nextUrl = await generateImageAPI(prompt);
    const patch = buildAssetImagePatch(asset, nextUrl);
    episodeStore.updateSubject(asset.id, { ...patch, description });

    generatingAssetImages.delete(loadingKey);
  }

  if (sessionId === batchSessionId.value) {
    isBatchGenerating.value = false;
    ElMessage.success(`批量生成完成！共生成 ${currentAssets.length} 个${typeName}的描述与图片`);
  }
};

// Navigation Logic
const confirmVisible = ref(false);
const hasUnsavedChanges = ref(false);

// Empty state: no subjects at all
const isPageEmpty = computed(() => {
  const allAssets = [...(characters.value || []), ...(scenes.value || []), ...(propsList.value || [])];
  return allAssets.length === 0 && !isGeneratingAssetsText.value && generatingAssetImages.size === 0;
});

// Upload modal - ZIP upload: folder per subject (image + text desc + audio desc)
const showUploadModal = ref(false);
const uploadProgress = ref(0);
const isUploading = ref(false);
const uploadDragOver = ref(false);
const zipInputRef = ref<HTMLInputElement | null>(null);

interface ParsedSubject {
  name: string;
  type: 'character' | 'scene' | 'prop';
  imageData: string;
  description: string;
  audioDesc: string;
}

const zipFileName = ref('');
const parsedSubjects = reactive<ParsedSubject[]>([]);

const handleCancelUpload = () => {
  isUploading.value = false;
  uploadProgress.value = 0;
  uploadDragOver.value = false;
  zipFileName.value = '';
  parsedSubjects.length = 0;
  showUploadModal.value = false;
};

const handleReUpload = () => {
  zipFileName.value = '';
  parsedSubjects.length = 0;
};

const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const parseZipAsSubjects = async (file: File): Promise<void> => {
  zipFileName.value = file.name;
  parsedSubjects.length = 0;

  try {
    const zip = await JSZip.loadAsync(file);

    // Collect top-level folder names
    const folderNames = new Set<string>();
    zip.forEach((relativePath, entry) => {
      if (entry.dir) {
        const parts = relativePath.split('/');
        if (parts.length === 2 && parts[1]) {
          folderNames.add(parts[1]);
        }
      }
    });

    if (folderNames.size === 0) {
      throw new Error('未识别到文件夹结构，请按主体文件夹打包');
    }

    const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp']);
    const textExtensions = new Set(['.txt', '.md']);

    // Try category structure first (角色/林星/image.jpg)
    const typeFolders = new Map<string, 'character' | 'scene' | 'prop'>();
    zip.forEach((relativePath, entry) => {
      if (entry.dir) {
        const parts = relativePath.split('/').filter(Boolean);
        if (parts.length === 1) {
          const fn = parts[0];
          if (fn === '角色' || fn === 'characters' || fn === 'character' || fn === '角色库' || fn === 'role') {
            typeFolders.set(fn, 'character');
          } else if (fn === '场景' || fn === 'scenes' || fn === 'scene' || fn === '场景库') {
            typeFolders.set(fn, 'scene');
          } else if (fn === '道具' || fn === 'props' || fn === 'prop' || fn === '道具库') {
            typeFolders.set(fn, 'prop');
          }
        }
      }
    });

    let categorySubjectFiles: Map<string, { type: 'character' | 'scene' | 'prop'; path: string; name: string; ext: string }>;

    if (typeFolders.size > 0) {
      // Category structure: /角色/林星/image.jpg
      categorySubjectFiles = new Map();
      zip.forEach((relativePath, entry) => {
        if (!entry.dir && relativePath.split('/').filter(Boolean).length >= 2) {
          const parts = relativePath.split('/').filter(Boolean);
          const category = typeFolders.get(parts[0]);
          if (category && parts.length >= 2) {
            const subjectName = parts.slice(1).join('/');
            const fileName = parts[parts.length - 1] || '';
            const ext = fileName.toLowerCase().split('.').pop() || '';
            const key = `${category}|${subjectName}|${fileName}`;
            categorySubjectFiles.set(key, { type: category, path: relativePath, name: fileName, ext });
          }
        }
      });
    } else {
      // Flat structure: /林星/image.jpg — default to character
      categorySubjectFiles = new Map();
      zip.forEach((relativePath, entry) => {
        if (!entry.dir && relativePath.includes('/')) {
          const parts = relativePath.split('/');
          const folder = parts[0];
          const fileName = parts[1] || '';
          const ext = fileName.toLowerCase().split('.').pop() || '';
          const key = `character|${folder}|${fileName}`;
          categorySubjectFiles.set(key, { type: 'character', path: relativePath, name: fileName, ext });
        }
      });
    }

    // Group files by subject
    const subjectGroups = new Map<string, Array<{ type: 'character' | 'scene' | 'prop'; path: string; name: string; ext: string }>>();
    for (const [key, fileInfo] of categorySubjectFiles) {
      const subjectName = key.split('|').slice(1).join('|');
      if (!subjectGroups.has(subjectName)) subjectGroups.set(subjectName, []);
      subjectGroups.get(subjectName)!.push(fileInfo);
    }

    for (const [subjectName, files] of subjectGroups) {
      const fileInfo = files[0];
      const type = fileInfo.type;
      const subject: ParsedSubject = { name: subjectName, type, imageData: '', description: '', audioDesc: '' };

      for (const file of files) {
        const entry = zip.file(file.path);
        if (!entry) continue;

        if (imageExtensions.has(file.ext) && !subject.imageData) {
          const blob = await entry.async('blob');
          subject.imageData = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } else if (textExtensions.has(file.ext)) {
          const text = await entry.async('text');
          const trimmed = text.trim();
          const fileName = file.name.toLowerCase();
          // 音频描述.txt — 仅角色，存储为 audioDesc
          if ((fileName.includes('音频描述') || fileName.includes('audio') || fileName.includes('voice')) && type === 'character' && !subject.audioDesc) {
            subject.audioDesc = trimmed;
          } else if (!subject.description) {
            subject.description = trimmed;
          }
        }
      }

      parsedSubjects.push(subject);
    }

    if (parsedSubjects.length === 0) {
      throw new Error('压缩包内未解析到主体数据');
    }
  } catch (error: any) {
    ElMessage.error(error.message || '压缩包解析失败');
    parsedSubjects.length = 0;
    zipFileName.value = '';
  }
};

const handleZipSelect = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    parseZipAsSubjects(target.files[0]);
    target.value = '';
  }
};

const handleZipDrop = (e: DragEvent) => {
  uploadDragOver.value = false;
  const files = e.dataTransfer?.files;
  if (files && files.length > 0 && files[0].name.endsWith('.zip')) {
    parseZipAsSubjects(files[0]);
  } else {
    ElMessage.warning('请选择 .zip 格式的文件');
  }
};

const handleUploadAsset = async () => {
  if (parsedSubjects.length === 0) {
    ElMessage.warning('请先选择 zip 文件');
    return;
  }

  isUploading.value = true;
  uploadProgress.value = 0;

  for (let i = 0; i < parsedSubjects.length; i++) {
    uploadProgress.value = Math.round(((i + 1) / parsedSubjects.length) * 100);
    const subject = parsedSubjects[i];
    const now = Date.now();
    const imgId = `img_${now}_${Math.random().toString(36).slice(2, 8)}`;
    const subjectId = `upload_${now}_${Math.random().toString(36).slice(2, 8)}`;

    episodeStore.addSubject({
      id: subjectId,
      name: subject.name,
      type: subject.type,
      image: subject.imageData,
      reference_image: '',
      description: subject.description,
      selectedImageId: imgId,
      imageHistory: [{
        id: imgId,
        url: subject.imageData,
        isSelected: true,
        createdAt: now,
        name: subject.name,
        description: subject.description,
      }],
    });
  }

  isUploading.value = false;
  const count = parsedSubjects.length;
  uploadProgress.value = 0;
  parsedSubjects.length = 0;
  zipFileName.value = '';
  showUploadModal.value = false;
  ElMessage.success(`成功上传 ${count} 个主体资产`);
};

const handleTextOnlyGen = async () => {
  if (isBatchGenerating.value) {
    ElMessage.warning('批量生成正在进行中，请稍候...');
    return;
  }

  const sessionId = ++batchSessionId.value;
  isBatchGenerating.value = true;
  batchGenerationProgress.value = 0;
  batchCurrentInfo.value = '正在批量生成文字描述...';

  // 检查是否已有主体数据
  const allExisting = [...(characters.value || []), ...(scenes.value || []), ...(propsList.value || [])];

  if (allExisting.length === 0) {
    // 空页面：生成 mock 主体的文字描述并填充到列表
    const mockCharacters = [
      { id: `char-${Date.now()}-1`, name: '林星', description: '28岁，广告公司创意总监，外表坚强内心柔软，职场女强人，一头利落的短发，眼神坚定。', type: 'character' as const },
      { id: `char-${Date.now()}-2`, name: '陈宇', description: '30岁，自由摄影师，随性洒脱，林星的青梅竹马，温和笑容，文艺气质。', type: 'character' as const },
    ];
    const mockScenes = [
      { id: `scene-${Date.now()}-1`, name: '公司会议室', description: '现代感十足的会议室，落地窗，能看到繁华的都市夜景，冷色调灯光。', type: 'scene' as const },
      { id: `scene-${Date.now()}-2`, name: '林星公寓', description: '温馨的单身公寓，布置得很有格调，暖色调灯光，简约北欧风。', type: 'scene' as const },
    ];
    const mockProps = [
      { id: `prop-${Date.now()}-1`, name: '复古相机', description: '陈宇常用的老式胶片相机，带有岁月痕迹，金属质感机身。', type: 'prop' as const },
      { id: `prop-${Date.now()}-2`, name: '定情项链', description: '一条星星形状的银质项链，闪耀光泽，象征两人的感情纽带。', type: 'prop' as const },
    ];

    const steps = ['生成角色描述', '生成场景描述', '生成道具描述'];
    const datasets = [
      { list: mockCharacters, label: '角色' },
      { list: mockScenes, label: '场景' },
      { list: mockProps, label: '道具' },
    ];

    for (let i = 0; i < datasets.length; i++) {
      if (sessionId !== batchSessionId.value) { isBatchGenerating.value = false; return; }
      batchCurrentInfo.value = steps[i];
      batchGenerationProgress.value = Math.round(((i + 1) / datasets.length) * 100);

      for (const item of datasets[i].list) {
        if (sessionId !== batchSessionId.value) break;
        episodeStore.addSubject({
          id: item.id,
          name: item.name,
          type: item.type,
          description: item.description,
          image: '',
          reference_image: '',
          selectedImageId: '',
          imageHistory: [],
        });
        await new Promise(resolve => setTimeout(resolve, 400));
      }
    }
  } else {
    // 已有数据：仅更新缺失的描述
    const typeConfigs: Array<{ type: 'character' | 'scene' | 'prop'; label: string }> = [
      { type: 'character', label: '角色' },
      { type: 'scene', label: '场景' },
      { type: 'prop', label: '道具' },
    ];

    for (const { type, label } of typeConfigs) {
      if (sessionId !== batchSessionId.value) {
        isBatchGenerating.value = false;
        return;
      }

      let currentAssets: any[] = [];
      if (type === 'character') currentAssets = characters.value;
      else if (type === 'scene') currentAssets = scenes.value;
      else currentAssets = propsList.value;

      if (currentAssets.length === 0) continue;

      for (const asset of currentAssets) {
        if (sessionId !== batchSessionId.value) break;
        batchCurrentInfo.value = `正在为 ${label}「${asset.name}」生成文字描述...`;

        const { description } = generateSubjectDescription(asset.name, type);
        if (description && asset.description !== description) {
          episodeStore.updateSubject(asset.id, { description });
        }
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  }

  if (sessionId === batchSessionId.value) {
    isBatchGenerating.value = false;
    ElMessage.success('批量文字描述生成完成');
  }
};

const isAssetsComplete = computed(() => {
  const hasBasicAssets = (characters.value?.length || 0) > 0 && (scenes.value?.length || 0) > 0;
  const isGenerating = isGeneratingAssetsText.value || generatingAssetImages.size > 0;

  const allAssets = [...(characters.value || []), ...(scenes.value || []), ...(propsList.value || [])];
  const hasIncompleteAssets = allAssets.some(asset => {
    if (!asset.name || !asset.description) return true;
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
  // 主体数据为空时，不自动生成，直接展示空状态让用户选择操作方式
  if (episodeStore.subjects.length === 0) {
    console.log('主体数据为空，展示空状态入口页面');
    return;
  }

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

const getTypeFolderLabel = (type: string) => {
  if (type === 'character') return '角色道具';
  if (type === 'scene') return '场景';
  if (type === 'prop') return '道具';
  return '其他';
};

const getFileNameSuffix = (url: string) => {
  if (!url) return '.png';
  if (url.startsWith('data:image/svg')) return '.svg';
  const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  return match ? '.' + match[1] : '.png';
};

const downloadImage = async (url: string): Promise<Blob | null> => {
  if (!url) return null;
  try {
    // Handle base64 data URLs
    if (url.startsWith('data:')) {
      const base64 = url.replace(/^data:image\/\w+;base64,/, '');
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return new Blob([bytes]);
    }
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.blob();
  } catch {
    return null;
  }
};

const batchDownloadAssets = async () => {
  const allAssets = [...characters.value, ...scenes.value, ...propsList.value];
  if (allAssets.length === 0) {
    ElMessage.warning('暂无可下载的主体');
    return;
  }

  // 时间戳（生成时保持一致）
  const now = new Date();
  const timestamp = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0');

  const projectName = (dramaStore.outlineData?.title || '未命名剧本').replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '_');
  let grandSuccessCount = 0;
  let grandTotalCount = 0;

  // 三种类型打包进同一个 ZIP
  const zip = new JSZip();
  const typeConfigs = [
    { label: '角色', assets: characters.value },
    { label: '场景', assets: scenes.value },
    { label: '道具', assets: propsList.value },
  ];

  for (const { label, assets } of typeConfigs) {
    const withImages = assets.filter(a => (normalizeAssetImageState(a).imageHistory || []).length > 0);
    if (withImages.length === 0) continue;

    const typeFolder = zip.folder(label)!;

    for (const asset of withImages) {
      const safeName = asset.name?.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '_') || '未命名';
      const assetFolder = typeFolder.folder(safeName);
      if (!assetFolder) continue;

      const imageState = normalizeAssetImageState(asset);
      const sorted = [...imageState.imageHistory].sort((a, b) => {
        if (a.id === imageState.selectedImageId) return -1;
        if (b.id === imageState.selectedImageId) return 1;
        return (a.createdAt || 0) - (b.createdAt || 0);
      });

      for (let i = 0; i < sorted.length; i++) {
        const img = sorted[i];
        const blob = await downloadImage(img.url);
        grandTotalCount++;
        if (blob) {
          grandSuccessCount++;
          const isApplied = img.id === imageState.selectedImageId;
          const name = isApplied ? `_应用图${getFileNameSuffix(img.url)}` : `历史_${i}${getFileNameSuffix(img.url)}`;
          assetFolder.file(name, blob);
        }
      }
    }
  }

  const fileName = `${projectName}_角色/场景/道具_${timestamp}.zip`;
  const blob = await zip.generateAsync({ type: 'blob' });
  FileSaver.saveAs(blob, fileName);

  ElMessage.success(`下载完成！共 ${grandSuccessCount}/${grandTotalCount} 张图片已打包`);
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
