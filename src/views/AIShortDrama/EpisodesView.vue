<template>
  <div :class="s.page" class="relative">
    <!-- Floating Model Switcher -->
    <FloatingModelSwitcher :is-light="true" />
    
    <!-- Header: Title and Batch Action -->
    <div :class="s.header">
      <div :class="s.left" class="flex items-center gap-4">
        <button 
          @click="router.back()" 
          class="flex items-center justify-center w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-105 active:scale-95 transition-all duration-300 shrink-0"
        >
          <el-icon :size="18"><ArrowLeft /></el-icon>
        </button>
        <div class="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1 shrink-0"></div>
        
        <!-- C-end redesigned "Total Episodes" badge -->
        <div class="relative group ml-1 cursor-default">
          <div class="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
          
          <div class="relative flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl shadow-sm border border-white/50 dark:border-white/10 transform hover:-translate-y-0.5 transition-all duration-300">
            <div class="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-inner">
              <el-icon class="text-white text-sm"><MagicStick /></el-icon>
            </div>
            
            <div class="flex items-baseline gap-1">
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-extrabold text-sm tracking-wider">共</span>
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 font-black text-xl tabular-nums drop-shadow-sm">{{ filteredEpisodes.length }}</span>
              <span class="text-transparent bg-clip-text bg-gradient-to-l from-pink-500 to-purple-600 font-extrabold text-sm tracking-wider">集</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Search & Filters -->
      <div :class="s.searchBar">
        <div :class="s.searchInputWrapper">
          <el-icon><Search /></el-icon>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="搜索剧集集数/标题..." 
            @input="handleSearch"
          />
        </div>
        <!-- <el-select 
          v-model="statusFilter" 
          placeholder="全部状态" 
          clearable 
          :class="s.statusSelect"
          popper-class="status-select-popper"
        >
          <el-option label="剧本创作" value="pending" />
          <el-option label="主体设置" value="assets" />
          <el-option label="分镜视频" value="processing" />
          <el-option label="已完成" value="completed" />
        </el-select> -->
      </div>

      <div :class="s.right" class="flex items-center gap-3">
        <!-- Tab Switcher -->
        <div :class="s.tabSwitcher">
          <button 
            v-for="tab in availableTabs" 
            :key="tab.value"
            :class="[s.tabBtn, s['tabBtn_' + tab.value], { [s.active]: activeTab === tab.value }]"
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
            <span :class="s.tabCount">{{ getTabCount(tab.value) }}</span>
          </button>
        </div>

        <!-- Bulk Import Button (Only shown in Storyboard Video tab) -->
        <button 
          v-if="activeTab === 'assets'"
          @click="handleBatchStoryboard"
          class="h-10 px-6 flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30 rounded-full font-black text-[13px] transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 mr-2"
        >
          <el-icon :size="16"><MagicStick /></el-icon>
          <span>批量生成分镜</span>
        </button>

        <button 
          v-if="activeTab === 'processing'"
          @click="handleBatchSynthesis"
          class="h-10 px-6 flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg hover:shadow-orange-500/30 rounded-full font-black text-[13px] transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 mr-2"
        >
          <el-icon :size="16"><VideoCamera /></el-icon>
          <span>批量生成视频</span>
        </button>

        <button 
          v-if="activeTab === 'processing'"
          @click="showImportMethodDialog = true"
          class="h-10 px-6 flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30 rounded-full font-black text-[13px] transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95"
        >
          <el-icon :size="16"><Plus /></el-icon>
          <span>批量导入分镜</span>
        </button>

        <!-- Associate Entity Button (Global) -->
        <button 
          @click="handleGlobalAssociate"
          class="h-10 px-6 flex items-center gap-2 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:shadow-lg hover:shadow-indigo-500/10 rounded-full font-black text-[13px] border-2 border-indigo-50 dark:border-indigo-900/30 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95"
        >
          <el-icon :size="16"><User /></el-icon>
          <span>关联主体</span>
        </button>

        <!-- AI Video Model Selector (Only in 分镜视频 tab) -->
        <div 
          v-if="activeTab === 'processing'"
          class="flex items-center gap-2 p-1 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-2xl border border-white/60 dark:border-slate-700/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] transition-all"
        >
          <AIModelSelector v-model="modelStore.selectedVideoModel" type="video" moduleId="short-drama-episodes-video" />
        </div>

        <!-- Product Design Info Button -->
        <button 
          @click="showDesignDialog = true"
          class="h-10 px-4 flex items-center gap-2 bg-slate-50 text-slate-500 hover:text-indigo-600 rounded-full font-bold text-[13px] shadow-sm border border-slate-200 transition-all duration-300"
        >
          <el-icon :size="16"><InfoFilled /></el-icon>
          <span>产品设计说明</span>
        </button>
      </div>
    </div>

    <div :class="s.content">
      <div :class="s.container" ref="listRef">
        <div :class="s.gridLayout">
          <div 
            v-for="ep in paginatedTabEpisodes" 
            :key="ep.id" 
            :class="s.gridCard"
            @click="handleCardClick(ep)"
          >
            <div :class="s.posterWrapper">
              <div :class="s.poster">
                <el-image :src="getPosterUrl(ep)" fit="cover">
                  <template #error>
                    <div class="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                      <el-icon :size="32"><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>

                <div :class="s.posterActions">
                  <button :class="s.uploadBtn" @click.stop="handleUploadCover(ep)">
                    <span>上传封面</span>
                  </button>
                  <button :class="s.aiGenBtn" @click.stop="handleAIGenerateCover(ep)">
                    <el-icon :size="12"><MagicStick /></el-icon>
                    <span>AI生成</span>
                  </button>
                </div>

                <div v-if="ep.synthesisStatus === 'success'" :class="s.durationBadge">
                  {{ ep.duration || '01:12' }}
                </div>
                <div :class="s.indexBadge">{{ ep.index }}</div>
              </div>
            </div>

            <div :class="s.info">
              <h3 :class="s.epTitle" :title="ep.title">{{ ep.title }}</h3>
              
              <div :class="[s.singleStatus, s[getSingleStatusType(ep)]]">
                <el-icon v-if="getSingleStatusType(ep) === 'processing'" class="is-loading"><Loading /></el-icon>
                <el-icon v-else-if="getSingleStatusType(ep) === 'completed'"><Check /></el-icon>
                <el-icon v-else-if="getSingleStatusType(ep) === 'assets'"><Box /></el-icon>
                <el-icon v-else><Document /></el-icon>
                <span>{{ getSingleStatusLabel(ep) }}</span>
              </div>
            </div>

            <div :class="s.gridActions">
              <button 
                :class="[s.stepBtn, s.edit]"
                @click.stop="handleEdit(ep)"
                title="编辑"
              >
                <el-icon><EditPen /></el-icon>
                <span>编辑</span>
              </button>
              <button 
                v-if="ep.assetsStatus === 'success'"
                class="flex items-center justify-center h-7 px-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-black text-[11px] hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
                @click.stop="handleSingleBatchStoryboard(ep)"
                title="批量生成分镜"
              >
                <el-icon class="mr-1"><MagicStick /></el-icon>
                <span>生成分镜</span>
              </button>
              <button 
                class="flex items-center justify-center h-7 px-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg font-black text-[11px] hover:bg-indigo-600 hover:text-white transition-all duration-300"
                @click.stop="handleEpisodeAssociate(ep)"
                title="关联主体"
              >
                <el-icon class="mr-1"><User /></el-icon>
                <span>关联主体</span>
              </button>
              <button 
                :class="[s.stepBtn, s.preview]"
                :disabled="ep.synthesisStatus !== 'success'"
                @click.stop="handlePreview(ep)"
                title="预览"
              >
                <el-icon><VideoPlay /></el-icon>
                <span>预览</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="episodes.length === 0" :class="s.empty">
        <el-empty description="暂无分集数据" />
      </div>
    </div>

    <div v-if="currentTabTotal > 0" class="flex justify-center mt-10 relative z-10">
      <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 36, 48]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="currentTabTotal"
          class="custom-pagination-v2"
        />
      </div>
    </div>

    <!-- Edit Drawer -->
    <EpisodesEditDrawer 
      v-model="drawerVisible"
      :episode="editingEpisode"
      @enter-detail="navigateToDetail"
    />

    <!-- Progress Modal -->
    <ProgressModal 
      v-model="progressVisible"
      :progress="batchProgress"
      title="正在批量生成分镜脚本"
      @cancel="progressVisible = false"
    />

    <!-- Video Preview Dialog -->
    <el-dialog
      v-model="previewVisible"
      title="预览全集"
      width="1000px"
      center
      destroy-on-close
      :class="s.previewDialog"
    >
      <div v-if="previewEpisode" :class="s.previewContent">
        <!-- Video Player Section -->
        <div :class="s.videoSection">
          <video 
            ref="previewVideoRef"
            :src="previewEpisode.synthesisVideo" 
            controls 
            autoplay
            class="w-full rounded-xl shadow-2xl"
          ></video>
        </div>

        <!-- Export Settings Section -->
        <div :class="s.exportSettings">
          <div class="flex items-center justify-between mt-8 px-2">
            <div class="flex gap-12">
              <!-- Watermark Setting -->
              <div :class="s.settingGroup">
                <span :class="s.settingLabel">水印设置</span>
                <div :class="s.segmentedControl">
                  <button 
                    :class="{ [s.active]: watermarkType === 'brand' }"
                    @click="watermarkType = 'brand'"
                  >带品牌水印</button>
                  <button 
                    :class="{ [s.active]: watermarkType === 'none' }"
                    @click="watermarkType = 'none'"
                  >无水印</button>
                </div>
              </div>

              <!-- Resolution Setting -->
              <div :class="s.settingGroup">
                <span :class="s.settingLabel">导出分辨率</span>
                <div :class="s.segmentedControl">
                  <button 
                    :class="{ [s.active]: resolution === '1080P' }"
                    @click="resolution = '1080P'"
                  >1080P</button>
                  <button 
                    :class="{ [s.active]: resolution === '720P' }"
                    @click="resolution = '720P'"
                  >720P</button>
                  <button 
                    :class="{ [s.active]: resolution === '4K' }"
                    @click="resolution = '4K'"
                  >4K</button>
                </div>
              </div>
            </div>

            <!-- Export Button -->
            <button 
              :class="s.exportButton"
              @click="handleExport(previewEpisode)"
            >
              <el-icon><Download /></el-icon>
              <span>导出到本地</span>
            </button>
          </div>
        </div>
      </div>
    </el-dialog>

    <ProductDesignDialog
      v-model="showDesignDialog"
      id="short-drama-episodes"
      :default-content="{
        title: '剧集规划',
        location: '管理短剧的单集列表，提供从大纲到分镜图生成的批量控制入口。',
        layout: [
          '**顶部控制：** 提供“多选”、“批量生成”等全局操作。',
          '**单集卡片：** 展示集数、核心情节摘要、包含的角色/场景数量、以及当前生成的封面图或状态。'
        ],
        interactions: [
          {
            text: '**局部/批量生成：** 用户可以选择某几集卡片，点击“批量生成”，系统后台排队处理图文生成（节省 Token 和时间）。',
            image: ''
          },
          {
            text: '**功能说明 (2.2版本)：\n - *剧集管理：** 2.2版本全面支持手动新增剧集大纲，剧集大纲的文字限制20-50，新增剧集大纲是在最后面新增。',
            image: ''
          }
        ],
        version: '2.2'
      }"
    />

    <!-- AI Generator Dialog -->
    <el-dialog v-model="showAIDialog" title="AI 封面生成工坊" width="700px" append-to-body class="ai-generator-dialog">
      <div class="space-y-6">
        <!-- Prompt & Generate -->
        <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-5 transition-colors focus-within:border-indigo-500/50 shadow-inner">
           <el-input 
             v-model="aiPrompt"
             type="textarea" 
             :rows="4"
             placeholder="例如：古风武侠，边境战火，义军首领手持重锤，背景是燃烧的村庄..."
             class="custom-textarea mb-4"
           />
           <div class="flex justify-end items-center gap-3">
             <AIModelSelector v-model="modelStore.selectedImageModel" type="image" moduleId="cover-gen-episodes" compact />
             <el-button type="primary" :loading="isGenerating" class="!rounded-xl px-6 h-11 shadow-lg shadow-indigo-500/20" @click="generateCoverImages">
               <el-icon class="mr-2"><MagicStick /></el-icon> 开始生成
             </el-button>
           </div>
        </div>

        <!-- Result Grid -->
        <div class="space-y-4">
           <!-- Gallery Tabs -->
           <div class="flex items-center gap-4 mb-2">
             <div class="text-sm font-bold text-slate-700 dark:text-slate-300">可选封面素材</div>
             <div class="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
             <!-- Tab Switcher -->
             <div class="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
               <button 
                 @click="coverTab = 'history'"
                 :class="['px-3 py-1.5 text-xs font-bold rounded-md transition-all', coverTab === 'history' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300']"
               >
                 历史记录 ({{ episodeCoverHistory.length }})
               </button>
               <button 
                 @click="coverTab = 'recommend'"
                 :class="['px-3 py-1.5 text-xs font-bold rounded-md transition-all', coverTab === 'recommend' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300']"
               >
                 推荐素材
               </button>
             </div>
           </div>

           <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 min-h-[200px] relative rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 p-4 transition-colors">
              <!-- History Tab: Show previously generated/applied covers -->
              <template v-if="coverTab === 'history' && episodeCoverHistory.length > 0">
                <div 
                  v-for="(img, idx) in episodeCoverHistory" 
                  :key="'history-' + idx"
                  class="relative group cursor-pointer rounded-xl overflow-hidden border-4 transition-all aspect-[16/10] shadow-md"
                  :class="selectedImage === img.url ? 'border-indigo-500 shadow-xl shadow-indigo-500/20 scale-[1.05]' : 'border-transparent hover:border-indigo-300/50'"
                  @click="selectedImage = img.url"
                >
                  <img :src="img.url" class="w-full h-full object-cover" />
                  <div class="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity" v-if="selectedImage !== img.url"></div>
                  <div class="absolute top-2 right-2" v-if="selectedImage === img.url">
                    <div class="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white">
                      <el-icon :size="16"><Check /></el-icon>
                    </div>
                  </div>
                  <!-- Label -->
                  <div class="absolute bottom-0 inset-x-0 p-1 bg-black/40 backdrop-blur-sm text-[10px] text-white text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {{ img.label }}
                  </div>
                </div>
                <!-- Fill remaining slots with placeholders -->
                <div v-for="idx in Math.max(0, 8 - episodeCoverHistory.length)" :key="'empty-' + idx" class="relative rounded-xl overflow-hidden border-4 border-transparent aspect-[16/10] bg-slate-100 dark:bg-slate-800"></div>
              </template>
              
              <!-- Default Gallery (Recommend Tab) -->
              <template v-else>
                <div 
                  v-for="(img, idx) in defaultCovers" 
                  :key="'default-' + idx"
                  class="relative group cursor-pointer rounded-xl overflow-hidden border-4 transition-all aspect-[16/10] shadow-md"
                  :class="selectedImage === img ? 'border-indigo-500 shadow-xl shadow-indigo-500/20 scale-[1.05]' : 'border-transparent hover:border-indigo-300/50'"
                  @click="selectedImage = img"
                >
                  <img :src="img" class="w-full h-full object-cover" />
                  <div class="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity" v-if="selectedImage !== img"></div>
                  <div class="absolute top-2 right-2" v-if="selectedImage === img">
                    <div class="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white">
                      <el-icon :size="16"><Check /></el-icon>
                    </div>
                  </div>
                  <!-- Label for default -->
                  <div class="absolute bottom-0 inset-x-0 p-1 bg-black/40 backdrop-blur-sm text-[10px] text-white text-center opacity-0 group-hover:opacity-100 transition-opacity">推荐素材</div>
                </div>
              </template>
              
              <!-- AI Generated Image (Single Mode) -->
              <template v-if="generatedImages.length > 0 && coverTab === 'recommend'">
                <div class="col-span-full flex justify-center py-2">
                  <div 
                    class="relative group cursor-pointer rounded-2xl overflow-hidden border-4 transition-all aspect-[16/10] shadow-2xl w-full max-w-[480px]"
                    :class="selectedImage === generatedImages[0] ? 'border-indigo-500 scale-[1.02]' : 'border-transparent'"
                    @click="selectedImage = generatedImages[0]"
                  >
                    <img :src="generatedImages[0]" class="w-full h-full object-cover" />
                    <div class="absolute top-4 right-4">
                      <div class="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white">
                        <el-icon :size="20"><Check /></el-icon>
                      </div>
                    </div>
                    <div class="absolute bottom-0 inset-x-0 p-3 bg-indigo-600/80 backdrop-blur-md text-sm text-white text-center font-bold">
                      AI 已为您生成专属封面
                    </div>
                  </div>
                </div>
              </template>
              
              <div v-if="isGenerating" class="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl">
                <div class="loading-spinner-v2 mb-4"></div>
                <p class="text-indigo-600 dark:text-indigo-400 font-bold animate-pulse">AI 正在绘图...</p>
              </div>
           </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
          <el-button @click="showAIDialog = false" class="!rounded-xl px-6 h-11">取消</el-button>
          <el-button type="primary" :disabled="!selectedImage" @click="confirmAICover" class="!rounded-xl px-8 h-11 shadow-lg shadow-indigo-500/20">应用封面</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Recovery Confirm Dialog -->
    <ConfirmDialog
      v-model="recoveryConfirmVisible"
      :title="recoveryConfirmTitle"
      :message="recoveryConfirmMessage"
      confirm-text="继续生成"
      cancel-text="放弃"
      @confirm="handleRecoveryConfirm"
      @cancel="handleRecoveryCancel"
    />

    <!-- Overwrite Confirm Dialog (Styled for C-end) -->
    <ConfirmDialog
      v-model="overwriteConfirmVisible"
      title="覆盖确认"
      :message="`检测到第 ${overwriteConfirmData?.indices} 集已存在分镜内容，导入将覆盖原有脚本。是否继续？`"
      confirm-text="覆盖导入"
      cancel-text="跳过这些"
      @confirm="handleOverwriteConfirm"
    />

    <!-- Batch Synthesis Selection Dialog -->
    <el-dialog
      v-model="showBatchSynthesisSelectDialog"
      title="批量生成视频｜选择剧集"
      width="600px"
      center
      destroy-on-close
      class="modern-dialog-v2 rounded-[32px] overflow-hidden"
      append-to-body
    >
      <div class="py-4 px-2">
        <!-- Select All Checkbox -->
        <div class="flex items-center justify-between mb-4 px-2">
          <div class="flex items-center gap-2">
            <el-checkbox
              :model-value="synthesisAllSelected"
              @change="toggleSynthesisSelectAll"
              class="synthesis-select-checkbox"
            />
            <span class="text-[14px] font-bold text-slate-700 dark:text-slate-200">全选</span>
            <span class="text-[12px] text-slate-400">（共 {{ synthesisSelectEpisodes.length }} 集）</span>
          </div>
          <span class="text-[12px] text-slate-500">已选 {{ synthesisSelectedIds.size }} 集</span>
        </div>

        <!-- Episode List -->
        <div class="max-h-[420px] overflow-y-auto custom-scrollbar rounded-2xl border border-slate-100 dark:border-slate-700">
          <div
            v-for="ep in synthesisSelectEpisodes"
            :key="ep.id"
            class="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-700/50 last:border-b-0"
            @click="toggleSynthesisEpisodeSelection(ep)"
          >
            <el-checkbox
              :model-value="synthesisSelectedIds.has(ep.id)"
              @change="toggleSynthesisEpisodeSelection(ep)"
              class="synthesis-select-checkbox"
            />
            <span class="flex-1 text-[13px] text-slate-700 dark:text-slate-300">第 {{ ep.index }} 集</span>
            <span class="text-[12px] text-slate-500 truncate max-w-[200px]" :title="ep.title">{{ ep.title }}</span>
            <!-- Show storyboard video details if any -->
            <div v-if="getStoryboardVideoIndices(ep).length > 0" class="flex items-center gap-1">
              <el-popover
                v-for="index in getStoryboardVideoIndices(ep)"
                :key="index"
                placement="top"
                :width="150"
                trigger="hover"
              >
                <template #reference>
                  <span class="px-2 py-1 text-[10px] font-bold text-orange-600 bg-orange-50 rounded-full dark:text-orange-400 dark:bg-orange-900/30">
                    分镜{{ index }}
                  </span>
                </template>
                <div class="text-[12px] text-slate-600 dark:text-slate-300">
                  分镜{{ index }}视频已生成
                </div>
              </el-popover>
            </div>
            <!-- Show "全集已合成" badge if synthesisVideo exists -->
            <span
              v-else-if="ep.synthesisVideo"
              class="px-2 py-1 text-[10px] font-bold text-green-600 bg-green-50 rounded-full dark:text-green-400 dark:bg-green-900/30"
            >
              全集已合成
            </span>
            <!-- Show pending status if no videos -->
            <span v-else class="px-2 py-1 text-[10px] font-bold text-slate-400 bg-slate-100 rounded-full dark:text-slate-500 dark:bg-slate-800">
              待生成
            </span>
          </div>
        </div>

        <!-- 生成选项：分辨率、字幕、水印 -->
        <div class="mt-4 p-3 rounded-2xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/15 dark:to-red-900/15 border border-orange-100 dark:border-orange-800/30">
          <div class="flex items-center gap-2 mb-3">
            <el-icon class="text-orange-600 dark:text-orange-400"><Setting /></el-icon>
            <span class="text-[13px] font-black text-orange-700 dark:text-orange-400">视频生成选项</span>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <!-- 分辨率选择 -->
            <div>
              <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">导出分辨率</span>
              <div class="flex gap-1 p-0.5 bg-white/70 dark:bg-slate-800/50 rounded-lg">
                <button
                  :class="['flex-1 text-[11px] font-bold px-2 py-1 rounded-md transition-all', synthesisResolution === '1080P' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:text-orange-600']"
                  @click="synthesisResolution = '1080P'"
                >1080P</button>
                <button
                  :class="['flex-1 text-[11px] font-bold px-2 py-1 rounded-md transition-all', synthesisResolution === '720P' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:text-orange-600']"
                  @click="synthesisResolution = '720P'"
                >720P</button>
                <button
                  :class="['flex-1 text-[11px] font-bold px-2 py-1 rounded-md transition-all', synthesisResolution === '4K' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:text-orange-600']"
                  @click="synthesisResolution = '4K'"
                >4K</button>
              </div>
            </div>

            <!-- 字幕选项 -->
            <div>
              <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">字幕</span>
              <div class="flex gap-1 p-0.5 bg-white/70 dark:bg-slate-800/50 rounded-lg">
                <button
                  :class="['flex-1 text-[11px] font-bold px-2 py-1 rounded-md transition-all', synthesisSubtitle ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:text-orange-600']"
                  @click="synthesisSubtitle = true"
                >开启</button>
                <button
                  :class="['flex-1 text-[11px] font-bold px-2 py-1 rounded-md transition-all', !synthesisSubtitle ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:text-orange-600']"
                  @click="synthesisSubtitle = false"
                >关闭</button>
              </div>
            </div>

            <!-- 水印选项 -->
            <div>
              <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">水印</span>
              <div class="flex gap-1 p-0.5 bg-white/70 dark:bg-slate-800/50 rounded-lg">
                <button
                  :class="['flex-1 text-[11px] font-bold px-2 py-1 rounded-md transition-all', synthesisWatermark === 'brand' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:text-orange-600']"
                  @click="synthesisWatermark = 'brand'"
                >带水印</button>
                <button
                  :class="['flex-1 text-[11px] font-bold px-2 py-1 rounded-md transition-all', synthesisWatermark === 'none' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:text-orange-600']"
                  @click="synthesisWatermark = 'none'"
                >无水印</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-4 pb-2">
          <el-button @click="showBatchSynthesisSelectDialog = false" class="!rounded-xl !px-10 !h-11">取消</el-button>
          <el-button
            type="primary"
            :disabled="synthesisSelectedIds.size === 0"
            @click="confirmBatchSynthesisSelection"
            class="theme-primary-btn !rounded-xl !px-12 !h-11 font-black shadow-lg shadow-indigo-500/20"
          >
            确认生成（{{ synthesisSelectedIds.size }} 集）
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Video Synthesis Overwrite Confirm Dialog -->
    <ConfirmDialog
      v-model="videoOverwriteConfirmVisible"
      title="分镜视频覆盖确认"
      :message="videoOverwriteConfirmData?.detail || ''"
      confirm-text="继续生成"
      cancel-text="取消"
      @confirm="handleVideoOverwriteConfirm"
      @cancel="videoOverwriteConfirmVisible = false"
    />

    <GlobalUIDesignSpecsDialog
      v-model="showUIDesignSpecsDialog"
      title="剧集管理｜UI 设计标注"
      subtitle="Episodes View UI Specs"
      :groups="episodesUIDesignGroups"
    />

    <button
      type="button"
      class="fixed bottom-6 right-6 z-[60] w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 shadow-lg shadow-indigo-500/30 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      title="UI 设计标注"
      @click="showUIDesignSpecsDialog = true"
    >
      <el-icon :size="22"><Monitor /></el-icon>
    </button>

    <GlobalUIDesignSpecsDialog
      v-model="showUIDesignSpecsDialog"
      title="剧集管理｜UI 设计标注"
      subtitle="Episodes View UI Specs"
      :groups="episodesUIDesignGroups"
    />

    <!-- 导入方式选择弹窗 -->
    <el-dialog
      v-model="showImportMethodDialog"
      title="选择导入方式"
      width="600px"
      center
      destroy-on-close
      class="modern-dialog-v2 rounded-[32px] overflow-hidden"
      append-to-body
    >
      <div class="py-6 px-4">
        <!-- 模型切换和自动关联选项（放在上面） -->
        <div class="flex items-center justify-center gap-4 mb-6">
          <!-- 文生文模型选择（无标签无图标） -->
          <div class="bg-slate-50 dark:bg-slate-900/50 px-5 py-2.5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <AIModelSelector v-model="modelStore.selectedTextModel" type="text" moduleId="short-drama-episodes-import-text" />
          </div>

          <!-- 自动关联选项 -->
          <div class="bg-slate-50 dark:bg-slate-900/50 px-6 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3 group hover:border-indigo-500/30 transition-all cursor-pointer" @click="autoAssociateOnImport = !autoAssociateOnImport">
            <el-checkbox v-model="autoAssociateOnImport" @click.stop />
            <div class="flex flex-col">
              <span class="text-[14px] font-black text-slate-700 dark:text-slate-200">导入后自动关联主体</span>
              <span class="text-[11px] text-slate-400 font-medium">开启后，系统将自动为新导入的剧集匹配角色与场景主体</span>
            </div>
          </div>
        </div>

        <!-- 文件导入和手动粘贴（放在下面） -->
        <div class="grid grid-cols-2 gap-6">
          <!-- 文件上传 -->
          <div 
            @click="fileInputBulk?.click()"
            class="group relative p-8 rounded-[24px] bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-2 border-indigo-100 dark:border-indigo-800 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all cursor-pointer flex flex-col items-center gap-4"
          >
            <div class="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
              <el-icon :size="40"><Document /></el-icon>
            </div>
            <div class="text-center">
              <h3 class="text-lg font-black text-slate-800 dark:text-slate-100 mb-1">文件导入</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">支持 txt, docx格式</p>
            </div>
            <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <el-icon class="text-indigo-500"><CircleCheck /></el-icon>
            </div>
          </div>

          <!-- 手动粘贴 -->
          <div 
            @click="showImportMethodDialog = false; showManualImportDialog = true"
            class="group relative p-8 rounded-[24px] bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-100 dark:border-purple-800 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/20 transition-all cursor-pointer flex flex-col items-center gap-4"
          >
            <div class="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
              <el-icon :size="40"><Edit /></el-icon>
            </div>
            <div class="text-center">
              <h3 class="text-lg font-black text-slate-800 dark:text-slate-100 mb-1">手动粘贴</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">直接粘贴脚本内容</p>
            </div>
            <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <el-icon class="text-purple-500"><CircleCheck /></el-icon>
            </div>
          </div>
        </div>

        <!-- 隐藏的文件输入框 -->
        <input 
          ref="fileInputBulk"
          type="file"
          accept=".txt,.md,.docx,.doc"
          class="hidden"
          @change="(e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) handleFileImport(file);
            (e.target as HTMLInputElement).value = '';
          }"
        />
      </div>
    </el-dialog>

    <!-- Manual Import Storyboard Dialog (Multi-Episode Support) -->
    <el-dialog
      v-model="showManualImportDialog"
      title="全剧分镜脚本批量导入"
      width="1600px"
      :close-on-click-modal="false"
      class="modern-dialog manual-import-dialog"
      top="4vh"
      append-to-body
    >
      <div class="flex flex-col gap-4">
        <!-- 1. Input Area (Top) -->
        <el-input
          v-model="manualImportText"
          type="textarea"
          :rows="22"
          placeholder="请在此粘贴全剧或多集的分镜脚本内容..."
          class="custom-textarea import-textarea text-[16px]"
        />

        <!-- 2. Format Instructions (Bottom) -->
        <div class="bg-indigo-50/30 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100/30 dark:border-indigo-800/20 flex items-center justify-between">
          <div class="flex items-center gap-8">
            <!-- 2.1 Import Requirements -->
            <el-popover
              placement="top-start"
              :width="380"
              trigger="hover"
              popper-class="modern-popover"
            >
              <template #reference>
                <div class="flex items-center gap-2 text-indigo-600 cursor-help hover:opacity-80 transition-opacity px-1">
                  <el-icon :size="20"><InfoFilled /></el-icon>
                  <span class="text-[13px] font-bold tracking-wide">批量导入要求说明</span>
                </div>
              </template>
              <div class="p-1">
                <div class="flex items-center gap-2 text-indigo-600 font-black text-[14px] mb-3">
                  <el-icon><InfoFilled /></el-icon>
                  <span>批量导入详细要求</span>
                </div>
                <div class="flex flex-col gap-3 text-[12px] text-indigo-900/80 dark:text-indigo-200/80 leading-relaxed">
                  <p>• <strong>分镜识别</strong>：系统通过“<strong>第x集</strong>”和“<strong>分镜1/分镜一</strong>”等标识自动分发内容。</p>
                  <!-- <p>• <strong>换行保留</strong>：分镜内部的换行将完整保留，不再作为拆分分镜的依据。</p> -->
                  <p>• <strong>主体校验</strong>：仅支持导入已完成“<strong>主体设置</strong>”的剧集。</p>
                </div>
              </div>
            </el-popover>

            <!-- 2.2 Full Import Example (Now Hidden by Popover) -->
            <el-popover
              placement="top"
              :width="600"
              trigger="hover"
              popper-class="modern-popover-wide"
            >
              <template #reference>
                <div class="flex items-center gap-2 text-indigo-500 cursor-help hover:text-indigo-600 transition-colors px-1">
                  <el-icon :size="20"><Picture /></el-icon>
                  <span class="text-[13px] font-bold tracking-wide">查看全剧导入示例</span>
                </div>
              </template>
              <div class="p-2">
                <div class="flex items-center gap-2 text-indigo-600 font-black text-[14px] mb-4">
                  <el-icon><Picture /></el-icon>
                  <span>全剧分镜导入标准格式示例</span>
                </div>
                <div class="font-mono text-[11px] bg-indigo-50/30 dark:bg-black/30 p-5 rounded-xl border border-indigo-100/50 leading-relaxed text-slate-600 dark:text-slate-300 shadow-inner max-h-[400px] overflow-y-auto">
                  <div class="flex flex-col gap-0">
                    <!-- Episode 1 -->
                    <p class="font-black text-indigo-600 text-[13px]">第1集</p>
                    <div class="h-2"></div>
                    <p class="font-bold text-slate-800 dark:text-slate-200">分镜1</p>
                    <p>这是分镜1的内容，可以包含多行。</p>
                    <p>换行会被保留。</p>
                    <div class="h-2"></div>
                    <p class="font-bold text-slate-800 dark:text-slate-200">分镜2</p>
                    <p>这是分镜2的内容...</p>
                    
                    <div class="h-4"></div>

                    <!-- Episode 2 -->
                    <p class="font-black text-indigo-600 text-[13px]">第2集</p>
                    <div class="h-2"></div>
                    <p class="font-bold text-slate-800 dark:text-slate-200">分镜一</p>
                    <p>第二集的分镜一内容...</p>
                  </div>
                </div>
                <p class="mt-4 text-[11px] text-slate-400 text-center italic">温馨提示：分镜标题与内容间不空行，系统会自动识别“分镜”标识</p>
              </div>
            </el-popover>
          </div>

          <!-- 自动关联选项 (手动粘贴弹窗) -->
          <div class="flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30">
            <el-checkbox v-model="autoAssociateOnImport" />
            <span class="text-[13px] font-bold text-slate-600 dark:text-slate-300">导入后自动关联主体</span>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-4 pb-2">
          <el-button @click="showManualImportDialog = false" class="!rounded-xl !px-10 !h-11">取消</el-button>
          <el-button type="primary" @click="handleManualImportConfirm" class="theme-primary-btn !rounded-xl !px-16 !h-11 font-black shadow-lg shadow-indigo-500/20">开始识别并分发导入</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { 
  ArrowLeft, InfoFilled, Search, User, Location, Box, VideoCamera, 
  Document, Picture, Film, MagicStick, Loading, VideoPlay, Check, Download,
  EditPen,
  Monitor,
  Plus,
  CircleCheck,
  Close,
  Delete,
  Warning,
  RefreshRight,
  Setting
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus';
import JSZip from 'jszip';
import { useEpisodeStore } from '@/store/episode';
import { useModelStore } from '@/store/models';
import s from '@/styles/AIShortDrama/EpisodesView.module.scss';
import { taskQueueManager } from '@/utils/taskQueue';

// Components
import EpisodesEditDrawer from '@/components/episode/EpisodesEditDrawer.vue';
import ProgressModal from '@/components/episode/ProgressModal.vue';

import ConfirmDialog from '@/components/Common/ConfirmDialog.vue';
import ProductDesignDialog from '@/components/Common/ProductDesignDialog.vue';
import GlobalUIDesignSpecsDialog from '@/components/Common/GlobalUIDesignSpecsDialog.vue';
import AIModelSelector from '@/components/Common/ModelSelector.vue';
import FloatingModelSwitcher from '@/components/Common/FloatingModelSwitcher.vue';

const router = useRouter();
const episodeStore = useEpisodeStore();
const modelStore = useModelStore();

// State
const showDesignDialog = ref(false);
const showUIDesignSpecsDialog = ref(false);
const showAIDialog = ref(false);
const showManualImportDialog = ref(false);
const showImportMethodDialog = ref(false);
const autoAssociateOnImport = ref(true);
const manualImportText = ref('');
const overwriteConfirmVisible = ref(false);
const overwriteConfirmData = ref<any>(null);

// Video synthesis overwrite confirmation state
const videoOverwriteConfirmVisible = ref(false);
const videoOverwriteConfirmData = ref<any>(null);

// Batch synthesis selection dialog state
const showBatchSynthesisSelectDialog = ref(false);
const synthesisSelectEpisodes = ref<any[]>([]);
const synthesisSelectedIds = ref<Set<string>>(new Set());
const synthesisAllSelected = ref(false);

// Batch synthesis video settings
const synthesisResolution = ref('1080P');
const synthesisSubtitle = ref(false);
const synthesisWatermark = ref('brand'); // 'brand' | 'none'

// Subject Association Logic
const handleGlobalAssociate = () => {
  episodeStore.autoAssociateSubjects();
  ElMessage.success('已自动关联所有主体到全剧');
};

const handleEpisodeAssociate = (ep: any) => {
  episodeStore.autoAssociateSubjects(ep.index);
  ElMessage.success(`第 ${ep.index} 集已自动关联最新主体`);
};

const executeImport = (items: any[]) => {
  items.forEach(item => {
    const { episode, scenes } = item;
    const newScenes = scenes.map((content: string) => ({
      id: `scene-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      video: null,
      image: '',
      progress: 0,
      modified: false,
      script: content.split('\n').map((line: string) => `<p>${line}</p>`).join('')
    }));
    
    episodeStore.updateEpisode(episode.id, {
      storyboardScenes: newScenes,
      storyboardStatus: 'success',
      storyboardGenerated: true
    });

    // 自动关联主体逻辑
    if (autoAssociateOnImport.value) {
      episodeStore.autoAssociateSubjects(episode.index);
    }
  });

  const totalImported = items.length;
  let msg = `成功导入 ${totalImported} 集分镜脚本。`;
  if (autoAssociateOnImport.value) {
    msg += ' 已自动关联最新主体设置。';
  }
  ElMessage.success(msg);
  showManualImportDialog.value = false;
  showImportMethodDialog.value = false;
  manualImportText.value = '';
};

const handleOverwriteConfirm = () => {
  if (overwriteConfirmData.value) {
    executeImport(overwriteConfirmData.value.items);
    overwriteConfirmVisible.value = false;
    overwriteConfirmData.value = null;
  }
};

const processImportText = (text: string) => {
  if (!text.trim()) {
    ElMessage.warning('请输入分镜内容');
    return;
  }

  // 1. 识别剧集标识：支持 "第1集"、"第一集" 等
  const EP_MARKER_REGEX = /\n?\s*(第\s*[\d一二三四五六七八九十]+\s*集)\s*/g;
  const SCENE_MARKER_REGEX = /\n?\s*(分镜\s*[\d一二三四五六七八九十]+)\s*[:：]?\s*/g;

  // 使用剧集标识分割全文
  const epParts = text.split(EP_MARKER_REGEX);
  const episodeDataMap = new Map<number, string[]>();

  // 辅助函数：将中文数字转阿拉伯数字
  const cnToNum = (cn: string) => {
    const map: any = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };
    if (map[cn]) return map[cn];
    const match = cn.match(/\d+/);
    return match ? parseInt(match[0]) : -1;
  };

  // epParts 结构: [之前内容, 第1集标识, 内容1, 第2集标识, 内容2, ...]
  for (let i = 1; i < epParts.length; i += 2) {
    const epMarker = epParts[i];
    const epContent = epParts[i + 1]?.trim();
    if (!epContent) continue;

    const epNumMatch = epMarker.match(/[\d一二三四五六七八九十]+/);
    if (!epNumMatch) continue;
    const epIdx = cnToNum(epNumMatch[0]);
    if (epIdx === -1) continue;

    // 在每一集的内容中，再识别分镜标识
    const sceneParts = epContent.split(SCENE_MARKER_REGEX);
    const scenes: string[] = [];
    
    // 如果该集开头没分镜标识，把开头到第一个标识前的内容作为一个分镜（可选逻辑，根据用户习惯）
    // 但根据用户要求“直接识别分镜1...”，我们只保留匹配到的标识后的内容
    for (let j = 1; j < sceneParts.length; j += 2) {
      const sceneContent = sceneParts[j + 1]?.trim();
      if (sceneContent) {
        let cleanContent = sceneContent.replace(/^内容[:：]\s*/, '').trim();
        scenes.push(cleanContent);
      }
    }

    if (scenes.length > 0) {
      episodeDataMap.set(epIdx, scenes);
    }
  }

  if (episodeDataMap.size === 0) {
    ElMessage.warning('未能识别到“第x集”及对应的“分镜x”标识，请检查格式');
    return;
  }

  // 3. 校验逻辑
  const episodesToImport: any[] = [];
  const episodesToConfirm: any[] = [];
  const episodesSkippedNoAssets: number[] = [];

  episodeDataMap.forEach((contents, epIdx) => {
    const targetEp = episodeStore.episodes.find(e => e.index === epIdx);
    if (!targetEp) return;

    if (targetEp.assetsStatus !== 'success') {
      episodesSkippedNoAssets.push(epIdx);
      return;
    }

    const hasExisting = targetEp.storyboardScenes && targetEp.storyboardScenes.length > 0;
    const item = { episode: targetEp, scenes: contents };
    
    if (hasExisting) {
      episodesToConfirm.push(item);
    } else {
      episodesToImport.push(item);
    }
  });

  if (episodesToImport.length === 0 && episodesToConfirm.length === 0) {
    let msg = '没有符合条件的剧集可供导入。';
    if (episodesSkippedNoAssets.length > 0) {
      msg += `第 ${episodesSkippedNoAssets.join(', ')} 集未完成主体设置，已忽略。`;
    }
    ElMessage.warning(msg);
    return;
  }

  // 4. 处理导入与确认逻辑
  if (episodesToConfirm.length > 0) {
    const epIndices = episodesToConfirm.map(i => i.episode.index).join('、');
    overwriteConfirmData.value = { 
      items: [...episodesToImport, ...episodesToConfirm],
      indices: epIndices 
    };
    overwriteConfirmVisible.value = true;
  } else {
    executeImport(episodesToImport);
  }
};

const handleManualImportConfirm = async () => {
  processImportText(manualImportText.value);
};

const handleFileImport = async (file: File) => {
  const loading = ElLoading.service({
    lock: true,
    text: '正在解析文件...',
    background: 'rgba(0, 0, 0, 0.7)',
  });

  try {
    const extension = file.name.split('.').pop()?.toLowerCase();
    let text = '';

    if (extension === 'txt' || extension === 'md') {
      text = await file.text();
    } else if (extension === 'docx') {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      const docXml = await zip.file('word/document.xml')?.async('text');
      if (docXml) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(docXml, 'text/xml');
        const paragraphs = xmlDoc.getElementsByTagName('w:p');
        const lines = [];
        for (let i = 0; i < paragraphs.length; i++) {
          const texts = paragraphs[i].getElementsByTagName('w:t');
          let pText = '';
          for (let j = 0; j < texts.length; j++) {
            pText += texts[j].textContent;
          }
          lines.push(pText);
        }
        text = lines.join('\n');
      }
    } else if (extension === 'doc') {
      throw new Error('暂不支持旧版 .doc 格式，请转换为 .docx 后再试');
    } else {
      throw new Error('不支持的文件格式');
    }

    if (text) {
      processImportText(text);
    } else {
      throw new Error('未能从文件中提取到文字内容');
    }
  } catch (error: any) {
    ElMessage.error(error.message || '文件解析失败');
  } finally {
     loading.close();
   }
 };
 
 const aiPrompt = ref('');
 const isGenerating = ref(false);
 const generatedImages = ref<string[]>([]);
 const selectedImage = ref('');
 const currentEpisodeForAI = ref<any>(null);
 const coverTab = ref<'history' | 'recommend'>('recommend');
 
 // Episode cover history
 const episodeCoverHistory = computed(() => {
   if (!currentEpisodeForAI.value) return [];
   const ep = currentEpisodeForAI.value;
   const history: { url: string; label: string }[] = [];
   
   // Add current poster
   if (ep.poster) {
     history.push({ url: ep.poster, label: '当前封面' });
   }
   
   // Add generated images
   generatedImages.value.forEach(img => {
     if (!history.find(h => h.url === img)) {
       history.push({ url: img, label: 'AI生成' });
     }
   });
   
   return history;
 });
 
 // Default cover gallery
 const defaultCovers = [
   'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=600&h=375&auto=format&fit=crop', // Sci-fi
   'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=600&h=375&auto=format&fit=crop', // Ancient
   'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&h=375&auto=format&fit=crop', // Movie
   'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&h=375&auto=format&fit=crop', // Forest/Mystery
   'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&h=375&auto=format&fit=crop', // Cyberpunk
   'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=600&h=375&auto=format&fit=crop', // Cinema
   'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=600&h=375&auto=format&fit=crop', // City Night
   'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=600&h=375&auto=format&fit=crop'  // Vintage
 ];
 
 const drawerVisible = ref(false);
 const editingEpisode = ref<any>(null);
 
 const fileInputBulk = ref<HTMLInputElement | null>(null);
const episodesUIDesignGroups = {
  layout: [
    {
      id: 'episodes-view-page',
      title: '页面结构',
      description: '剧集管理（卡片列表）整体布局与容器规格',
      items: [
        { name: '页面内边距', value: '30px', description: '.page padding' },
        { name: '页面背景色', value: '#f0f4f8', description: '.page background-color' },
        { name: '背景光晕', value: 'radial-gradient x2', description: '蓝/紫透明径向渐变' },
        { name: 'Header 间距', value: 'margin-bottom: 30px', description: '.header' },
        { name: 'Header 左右间距', value: 'padding: 0 10px', description: '.header' },
        { name: 'Header 元素间距', value: 'gap: 24px', description: '.header' }
      ]
    },
    {
      id: 'episodes-view-header',
      title: '顶部控件',
      description: '搜索栏 / Tab 切换 / 说明按钮',
      items: [
        { name: '搜索栏最大宽度', value: '500px', description: '.searchBar max-width' },
        { name: '搜索栏圆角', value: '16px', description: '.searchBar border-radius' },
        { name: '搜索栏内边距', value: '6px', description: '.searchBar padding' },
        { name: 'Tab 容器圆角', value: '18px', description: '.tabSwitcher border-radius' },
        { name: 'Tab 容器内边距', value: '6px', description: '.tabSwitcher padding' },
        { name: 'Tab 间距', value: 'gap: 8px', description: '.tabSwitcher' }
      ]
    },
    {
      id: 'episodes-view-cards',
      title: '卡片网格',
      description: '剧集卡片列表与卡片尺寸',
      items: [
        { name: '网格列规则', value: 'auto-fill min 360px', description: '.gridLayout template-columns' },
        { name: '网格间距', value: '16px', description: '.gridLayout gap' },
        { name: '卡片最大宽度', value: '420px', description: '.gridCard max-width' },
        { name: '卡片圆角', value: '20px', description: '.gridCard border-radius' },
        { name: '卡片内边距', value: '12px', description: '.gridCard padding' },
        { name: '卡片内元素间距', value: '16px', description: '.gridCard gap' }
      ]
    },
    {
      id: 'episodes-view-pagination',
      title: '分页区域',
      description: '分页容器与视觉层次',
      items: [
        { name: '分页区对齐', value: 'center', description: '.paginationSection justify-content' },
        { name: '分页卡片背景', value: 'rgba(255,255,255,0.8)', description: '.paginationCard' },
        { name: '分页卡片圆角', value: '18px', description: '.paginationCard border-radius' },
        { name: '分页卡片模糊', value: 'blur(12px)', description: '.paginationCard backdrop-filter' },
        { name: '分页卡片阴影', value: '0 10px 30px -12px', description: '.paginationCard box-shadow' }
      ]
    }
  ],
  style: [
    {
      id: 'episodes-view-typography',
      title: '文字层级',
      description: '页面常用字号/字重与展示规则',
      items: [
        { name: 'Tab 文案', style: { fontSize: '15px', fontWeight: 900, color: '#64748b' } as Record<string, string | number>, description: '.tabBtn font-size/weight/color' },
        { name: 'Tab 数量徽标', style: { fontSize: '12px', fontWeight: 900, color: '#94a3b8' } as Record<string, string | number>, description: '.tabCount' },
        { name: '搜索输入', style: { fontSize: '14px', fontWeight: 400, color: '#1e293b' } as Record<string, string | number>, description: '.searchInputWrapper input' },
        { name: '卡片标题', style: { fontSize: '13px', fontWeight: 800, color: '#1e293b', lineHeight: 1.4 } as Record<string, string | number>, description: '.epTitle 单行省略' },
        { name: '状态胶囊', style: { fontSize: '10px', fontWeight: 800, color: '#ffffff' } as Record<string, string | number>, description: '.singleStatus' },
        { name: '卡片操作按钮', style: { fontSize: '11px', fontWeight: 900, color: '#ffffff' } as Record<string, string | number>, description: '.stepBtn' }
      ]
    }
  ],
  color: [
    {
      id: 'episodes-view-colors',
      title: '颜色与渐变',
      description: '关键色、边框与阴影（用于复刻一致 UI）',
      items: [
        { name: '页面底色', value: '#f0f4f8' },
        { name: '容器边框', value: '#e2e8f0' },
        { name: '弱背景', value: '#f8fafc' },
        { name: '正文主色', value: '#1e293b' },
        { name: '次级文字', value: '#64748b' },
        { name: '占位/提示', value: '#94a3b8' },
        { name: 'Tab-剧本创作', value: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
        { name: 'Tab-主体设置', value: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' },
        { name: 'Tab-分镜视频', value: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' },
        { name: 'Tab-已完成', value: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
        { name: '预览按钮', value: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }
      ]
    }
  ],
  button: [
    {
      id: 'episodes-view-components',
      title: '按钮与组件状态',
      description: '可复用的按钮规格、交互与状态',
      items: [
        {
          name: '返回按钮（左上角）',
          tag: '<button>',
          classes: 'w-10 h-10 rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-slate-100 hover:scale-105 active:scale-95',
          notes: ['hover：文字变为 indigo 系', 'active：scale-95', '暗色模式：bg-slate-800/border-slate-700']
        },
        {
          name: 'Tab 切换按钮',
          tag: '.tabBtn (module)',
          classes: 'padding: 8px 20px; radius: 14px; hover: background #f8fafc + translateY(-1px); active: gradient + translateY(-2px)',
          notes: ['active：根据状态使用不同渐变（pending/assets/processing/completed）', 'active：tabCount 变为半透明白底']
        },
        {
          name: '封面遮罩操作（上传/AI生成）',
          tag: '.posterActions button (module)',
          classes: 'w-80px h-28px radius: 8px; hover: scale(1.05); active: scale(0.95)',
          notes: ['uploadBtn：白底 + indigo 字色', 'aiGenBtn：indigo→purple 渐变 + 白字']
        },
        {
          name: '卡片右侧操作按钮（编辑/预览）',
          tag: '.stepBtn (module)',
          classes: 'h-28px px-12px radius: 8px; hover: translateY(-2px) scale(1.02); disabled: opacity 0.3 grayscale',
          notes: ['编辑：amber 渐变', '预览：purple 渐变（未完成禁用）']
        },
        {
          name: '右下角 UI 标注入口（本按钮）',
          tag: '<button>',
          classes: 'fixed bottom-6 right-6 w-12 h-12 rounded-full gradient indigo→fuchsia shadow hover:scale-105 active:scale-95',
          notes: ['用于前端对照 UI 规范面板（分类 Tab）', 'z-index: 60，确保在卡片与分页之上']
        }
      ]
    }
  ]
};

// Recovery Confirm Dialog State
const recoveryConfirmVisible = ref(false);
const recoveryConfirmTitle = ref('');
const recoveryConfirmMessage = ref('');
const handleRecoveryConfirm = () => {
  const synthesizingEpisodes = episodes.value.filter(ep => ep.synthesisStatus === 'synthesizing');
  synthesizingEpisodes.forEach(ep => handleSynthesis(ep));
};
const handleRecoveryCancel = () => {
  const synthesizingEpisodes = episodes.value.filter(ep => ep.synthesisStatus === 'synthesizing');
  synthesizingEpisodes.forEach(ep => {
    episodeStore.updateEpisode(ep.id, { synthesisStatus: 'pending' });
  });
};
const progressVisible = ref(false);
const batchProgress = ref(0);
const previewVisible = ref(false);
const previewEpisode = ref<any>(null);
const searchQuery = ref('');
const statusFilter = ref('');
const currentPage = ref(1);
const pageSize = ref(12);

// Export Settings
const watermarkType = ref('brand');
const resolution = ref('1080P');
const previewVideoRef = ref<HTMLVideoElement | null>(null);

const episodes = computed(() => episodeStore.episodes);
const filteredEpisodes = computed(() => {
  return episodes.value.filter(ep => {
    const matchesQuery = ep.title.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    if (!statusFilter.value) return matchesQuery;
    
    let matchesStatus = false;
    switch (statusFilter.value) {
      case 'pending':
        matchesStatus = ep.scriptStatus === 'pending';
        break;
      case 'assets':
        matchesStatus = ep.scriptStatus === 'success' && ep.assetsStatus === 'pending';
        break;
      case 'processing':
        matchesStatus = ep.assetsStatus === 'success' && ep.synthesisStatus !== 'success';
        break;
      case 'completed':
        matchesStatus = ep.synthesisStatus === 'success';
        break;
    }
    
    return matchesQuery && matchesStatus;
  });
});

const hasGeneratedAny = computed(() => episodes.value.some(ep => ep.status === 'success'));

const activeTab = ref('pending');
const availableTabs = [
  { label: '剧本创作', value: 'pending' },
  { label: '主体设置', value: 'assets' },
  { label: '分镜视频', value: 'processing' },
  { label: '已完成', value: 'completed' }
];

const getTabCount = (tabValue: string) => {
  switch (tabValue) {
    case 'pending': return episodes.value.filter(ep => ep.scriptStatus === 'pending').length;
    case 'assets': return episodes.value.filter(ep => ep.scriptStatus === 'success' && ep.assetsStatus === 'pending').length;
    case 'processing': return episodes.value.filter(ep => ep.assetsStatus === 'success' && ep.synthesisStatus !== 'success').length;
    case 'completed': return episodes.value.filter(ep => ep.synthesisStatus === 'success').length;
    default: return 0;
  }
};

const currentTabEpisodes = computed(() => {
  return filteredEpisodes.value.filter(ep => {
    if (activeTab.value === 'pending') return ep.scriptStatus === 'pending';
    if (activeTab.value === 'assets') return ep.scriptStatus === 'success' && ep.assetsStatus === 'pending';
    if (activeTab.value === 'processing') return ep.assetsStatus === 'success' && ep.synthesisStatus !== 'success';
    if (activeTab.value === 'completed') return ep.synthesisStatus === 'success';
    return true;
  });
});

const currentTabTotal = computed(() => currentTabEpisodes.value.length);

const paginatedTabEpisodes = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return currentTabEpisodes.value.slice(start, start + pageSize.value);
});

watch([activeTab, searchQuery, statusFilter], () => {
  currentPage.value = 1;
});

watch([currentTabTotal, pageSize], () => {
  const maxPage = Math.max(1, Math.ceil(currentTabTotal.value / pageSize.value));
  if (currentPage.value > maxPage) currentPage.value = maxPage;
});

const getSingleStatusType = (ep: any) => {
  const task = episodeStore.tasks.find(t => t.episodeId === ep.id);
  if (task && (task.status === 'queued' || task.status === 'processing')) return 'processing';
  
  if (ep.synthesisStatus === 'success') return 'completed';
  if (ep.assetsStatus === 'success') return 'processing';
  if (ep.scriptStatus === 'success') return 'assets';
  return 'pending';
};

const getSingleStatusLabel = (ep: any) => {
  const task = episodeStore.tasks.find(t => t.episodeId === ep.id);
  if (task) {
    if (task.status === 'queued') return `排队中 (第${episodeStore.tasks.filter(t => t.status === 'queued' && t.createdAt <= task.createdAt).length}位)`;
    if (task.status === 'processing') return '生成中...';
    if (task.status === 'failed') return '生成失败';
  }

  if (ep.synthesisStatus === 'success') return '已完成';
  if (ep.synthesisStatus === 'synthesizing') return '合成中...';
  if (ep.storyboardStatus === 'generating') return '分镜生成中...';
  if (ep.storyboardStatus === 'success') return '分镜视频';
  if (ep.assetsStatus === 'success') return '分镜视频';
  if (ep.scriptStatus === 'success') return '主体设置';
  return '剧本创作';
};

const concurrency = ref(2);
// 移除 handleConcurrencyChange，并发数由调度器内部控制

const handleSingleBatchStoryboard = (ep: any) => {
  if (ep.storyboardStatus === 'success') {
    ElMessage.warning(`第 ${ep.index} 集已生成分镜，无需重复生成`);
    return;
  }

  // Register individual scene-level tasks instead of one aggregated task
  const totalScenes = ep.storyboardScenes?.length || 6;
  ElMessage.success(`已开始为第 ${ep.index} 集生成 ${totalScenes} 个分镜视频`);
  
  for (let i = 1; i <= totalScenes; i++) {
    taskQueueManager.addTask({
      id: `task-${ep.id}-scene-${i}-single`,
      episodeId: ep.id,
      dramaTitle: episodeStore.currentDramaTitle,
      episodeTitle: ep.title || `第 ${ep.index} 集`,
      episodeIndex: ep.index,
      sceneIndex: i,
      taskSource: 'episodes-single',
      type: 'storyboard-scene',
      priority: 2,
      execute: async () => {
        await executeSceneGeneration(ep, i);
      }
    });
  }
};

// Execute a single scene generation for an episode
const executeSceneGeneration = async (ep: any, sceneNum: number) => {
  // Update the episode's scene progress
  if (!ep.storyboardScenes) {
    ep.storyboardScenes = Array.from({ length: 6 }, (_, i) => ({
      id: `${ep.id}-scene-${i + 1}`,
      index: i + 1,
      image: '',
      video: '',
      description: '',
      status: 'pending',
      progress: 0
    }));
  }
  
  const scene = ep.storyboardScenes[sceneNum - 1];
  if (!scene) return;
  
  scene.status = 'generating';
  scene.progress = 0;
  
  // Simulate generation (in real app this would call the API)
  await new Promise<void>((resolve) => {
    const interval = setInterval(() => {
      scene.progress += 5;
      if (scene.progress >= 100) {
        clearInterval(interval);
        scene.status = 'success';
        scene.video = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
        scene.image = `https://picsum.photos/seed/${ep.id}_${sceneNum}_${Date.now()}/600/338`;
        resolve();
      }
    }, 100);
  });
};

const handleBatchStoryboard = () => {
  const targetEpisodes = currentTabEpisodes.value.filter(ep => ep.storyboardStatus !== 'success');
  if (targetEpisodes.length === 0) {
    ElMessage.warning('没有需要生成分镜的剧集');
    return;
  }

  // Count total scenes
  const totalScenes = targetEpisodes.reduce((sum, ep) => sum + (ep.storyboardScenes?.length || 6), 0);
  ElMessage.success(`已将 ${targetEpisodes.length} 集共 ${totalScenes} 个分镜视频任务加入队列`);
  
  targetEpisodes.forEach(ep => {
    const totalScenes = ep.storyboardScenes?.length || 6;
    for (let i = 1; i <= totalScenes; i++) {
      taskQueueManager.addTask({
        id: `task-${ep.id}-scene-${i}`,
        episodeId: ep.id,
        dramaTitle: episodeStore.currentDramaTitle,
        episodeTitle: ep.title || `第 ${ep.index} 集`,
        episodeIndex: ep.index,
        sceneIndex: i,
        taskSource: 'episodes-batch',
        type: 'storyboard-scene',
        priority: 1,
        execute: async () => {
          await executeSceneGeneration(ep, i);
        }
      });
    }
  });
};

const handleBatchSynthesis = () => {
  // Get all episodes in current tab that have assets completed (主体已设置)
  const allEpisodes = currentTabEpisodes.value.filter(ep => ep.assetsStatus === 'success');
  if (allEpisodes.length === 0) {
    ElMessage.warning('没有可生成分镜视频的剧集');
    return;
  }

  // Open selection dialog with all episodes
  // Pre-select episodes that don't have ALL storyboard videos generated
  synthesisSelectEpisodes.value = allEpisodes;
  synthesisSelectedIds.value = new Set();
  allEpisodes.forEach(ep => {
    const sceneCount = ep.storyboardScenes?.length || 0;
    const generatedCount = ep.storyboardScenes?.filter((s: any) => s.video).length || 0;
    // Pre-select if not all scenes have videos (has pending scenes)
    if (sceneCount > 0 && generatedCount < sceneCount) {
      synthesisSelectedIds.value.add(ep.id);
    } else if (sceneCount === 0) {
      // No scenes at all - also select
      synthesisSelectedIds.value.add(ep.id);
    }
  });
  synthesisAllSelected.value = synthesisSelectedIds.value.size === allEpisodes.length;
  
  // Reset video settings to defaults
  synthesisResolution.value = '1080P';
  synthesisSubtitle.value = false;
  synthesisWatermark.value = 'brand';
  
  showBatchSynthesisSelectDialog.value = true;
};

// Toggle select all in batch synthesis dialog
const toggleSynthesisSelectAll = () => {
  if (synthesisAllSelected.value) {
    synthesisSelectedIds.value.clear();
  } else {
    synthesisSelectEpisodes.value.forEach(ep => synthesisSelectedIds.value.add(ep.id));
  }
  synthesisAllSelected.value = !synthesisAllSelected.value;
};

// Toggle single episode selection
const toggleSynthesisEpisodeSelection = (ep: any) => {
  if (synthesisSelectedIds.value.has(ep.id)) {
    synthesisSelectedIds.value.delete(ep.id);
  } else {
    synthesisSelectedIds.value.add(ep.id);
  }
  synthesisAllSelected.value = synthesisSelectedIds.value.size === synthesisSelectEpisodes.value.length;
};

// Get indices of storyboards that have videos
const getStoryboardVideoIndices = (ep: any) => {
  if (!ep.storyboardScenes) return [];
  return ep.storyboardScenes
    .map((scene: any, index: number) => scene.video ? index + 1 : null)
    .filter((index: number | null) => index !== null);
};

// Get indices of storyboards that don't have videos
const getPendingStoryboardIndices = (ep: any) => {
  if (!ep.storyboardScenes) return [];
  return ep.storyboardScenes
    .map((scene: any, index: number) => scene.video ? null : index + 1)
    .filter((index: number | null) => index !== null);
};

// Confirm batch synthesis selection and check for overwrite
const confirmBatchSynthesisSelection = () => {
  const selectedEpisodes = synthesisSelectEpisodes.value.filter(ep => synthesisSelectedIds.value.has(ep.id));
  
  if (selectedEpisodes.length === 0) {
    ElMessage.warning('请至少选择一集');
    return;
  }

  // Capture current settings
  const settings = {
    resolution: synthesisResolution.value,
    subtitle: synthesisSubtitle.value,
    watermark: synthesisWatermark.value
  };

  showBatchSynthesisSelectDialog.value = false;

  // Check for episodes with some existing storyboard videos among selected
  const episodesWithPartialVideos: any[] = [];
  const episodesWithoutVideos: any[] = [];

  selectedEpisodes.forEach(ep => {
    const sceneCount = ep.storyboardScenes?.length || 0;
    const generatedCount = ep.storyboardScenes?.filter((s: any) => s.video).length || 0;
    
    if (generatedCount > 0) {
      episodesWithPartialVideos.push(ep);
    } else {
      episodesWithoutVideos.push(ep);
    }
  });

  // If some selected episodes already have some videos, show overwrite/skip confirmation
  if (episodesWithPartialVideos.length > 0) {
    const detail = episodesWithPartialVideos.map(ep => {
      const done = getStoryboardVideoIndices(ep).join('、');
      const pending = getPendingStoryboardIndices(ep).join('、');
      return `第${ep.index}集（已生成分镜${done}，待生成分镜${pending}）`;
    }).join('；');
    
    videoOverwriteConfirmData.value = {
      items: [...episodesWithPartialVideos, ...episodesWithoutVideos],
      detail: detail,
      settings: settings
    };
    videoOverwriteConfirmVisible.value = true;
    return;
  }

  // No existing videos, proceed directly
  executeBatchStoryboardGeneration(selectedEpisodes, settings);
};

// Execute batch storyboard video generation for the given episodes
const executeBatchStoryboardGeneration = (episodes: any[], settings: any = {}) => {
  const totalScenes = episodes.reduce((sum, ep) => {
    const pending = getPendingStoryboardIndices(ep);
    return sum + (pending.length > 0 ? pending.length : (ep.storyboardScenes?.length || 6));
  }, 0);
  
  ElMessage.success(`已将 ${episodes.length} 集的分镜视频生成任务加入队列（共 ${totalScenes} 个分镜，${settings.resolution || '1080P'}${settings.subtitle ? ' + 字幕' : ''}${settings.watermark === 'none' ? ' + 无水印' : ''}）`);
  
  episodes.forEach(ep => {
    const sceneCount = ep.storyboardScenes?.length || 6;
    for (let i = 1; i <= sceneCount; i++) {
      taskQueueManager.addTask({
        id: `task-${ep.id}-scene-${i}-video`,
        episodeId: ep.id,
        dramaTitle: episodeStore.currentDramaTitle,
        episodeTitle: ep.title || `第 ${ep.index} 集`,
        episodeIndex: ep.index,
        sceneIndex: i,
        taskSource: 'episodes-batch',
        type: 'storyboard-scene',
        priority: 1,
        ...settings,
        execute: async () => {
          await executeSceneGeneration(ep, i);
        }
      });
    }
  });
};

// Handle video overwrite confirmation
const handleVideoOverwriteConfirm = () => {
  if (videoOverwriteConfirmData.value) {
    executeBatchStoryboardGeneration(videoOverwriteConfirmData.value.items, videoOverwriteConfirmData.value.settings);
    videoOverwriteConfirmVisible.value = false;
    videoOverwriteConfirmData.value = null;
  }
};

// Initialize mock data if empty
onMounted(() => {
  episodeStore.loadFromLocalStorage();

  // 强制加载 30 集真实模拟数据以供测试
  if (episodes.value.length <= 1) {
    const titles = ['命运抉择', '重生归来', '商战风云', '真相大白', '暗流涌动', '最后对决'];
    const posters = [
      '1618005182384-a83a8bd57fbe',
      '1614850523296-d8c1af93d400',
      '1620641788421-7a1c342ea42e',
      '1536440136628-849c177e76a1',
      '1509248961158-e54f6934749c',
      '1478720568477-152d9b164e26'
    ];

    const mockEpisodes = Array.from({ length: 30 }, (_, i) => {
      const epIndex = i + 1;
      const base = {
        id: `${epIndex}`,
        index: epIndex,
        title: `第 ${epIndex} 集：${titles[epIndex % 6]}`,
        poster: `https://images.unsplash.com/photo-${posters[epIndex % 6]}?auto=format&fit=crop&q=80&w=400`,
        scriptStatus: 'success' as const,
        assetsStatus: 'success' as const,
        storyboardStatus: 'pending' as const,
        synthesisStatus: 'pending' as const,
        storyboardGenerated: false,
        duration: '00:00',
        storyboardScenes: [],
        gif: '',
        status: 'pending' as const
      };

      // 模拟部分剧集已生成分镜视频（分镜1、分镜2等），但未合成全集
      // 分镜视频tab会显示这些剧集（assetsStatus成功，synthesisStatus未完成）
      if (epIndex <= 6) {
        // 第1-6集：全部生成分镜视频，未合成全集
        return {
          ...base,
          storyboardStatus: 'success' as const,
          storyboardGenerated: true,
          storyboardScenes: [
            { id: `scene-${epIndex}-1`, status: 'success', video: 'https://www.w3schools.com/html/movie.mp4', image: '', script: '分镜1内容', progress: 100 },
            { id: `scene-${epIndex}-2`, status: 'success', video: 'https://www.w3schools.com/html/movie.mp4', image: '', script: '分镜2内容', progress: 100 },
            { id: `scene-${epIndex}-3`, status: 'success', video: 'https://www.w3schools.com/html/movie.mp4', image: '', script: '分镜3内容', progress: 100 },
            { id: `scene-${epIndex}-4`, status: 'success', video: 'https://www.w3schools.com/html/movie.mp4', image: '', script: '分镜4内容', progress: 100 },
            { id: `scene-${epIndex}-5`, status: 'success', video: 'https://www.w3schools.com/html/movie.mp4', image: '', script: '分镜5内容', progress: 100 },
            { id: `scene-${epIndex}-6`, status: 'success', video: 'https://www.w3schools.com/html/movie.mp4', image: '', script: '分镜6内容', progress: 100 },
          ]
        };
      } else if (epIndex <= 12) {
        // 第7-12集：只生成了部分分镜（分镜1、分镜2）
        return {
          ...base,
          storyboardStatus: 'success' as const,
          storyboardGenerated: true,
          storyboardScenes: [
            { id: `scene-${epIndex}-1`, status: 'success', video: 'https://www.w3schools.com/html/movie.mp4', image: '', script: '分镜1内容', progress: 100 },
            { id: `scene-${epIndex}-2`, status: 'success', video: 'https://www.w3schools.com/html/movie.mp4', image: '', script: '分镜2内容', progress: 100 },
            { id: `scene-${epIndex}-3`, status: 'pending', video: null, image: '', script: '分镜3内容', progress: 0 },
            { id: `scene-${epIndex}-4`, status: 'pending', video: null, image: '', script: '分镜4内容', progress: 0 },
            { id: `scene-${epIndex}-5`, status: 'pending', video: null, image: '', script: '分镜5内容', progress: 0 },
            { id: `scene-${epIndex}-6`, status: 'pending', video: null, image: '', script: '分镜6内容', progress: 0 },
          ]
        };
      } else if (epIndex <= 18) {
        // 第13-18集：只生成了分镜1
        return {
          ...base,
          storyboardStatus: 'success' as const,
          storyboardGenerated: true,
          storyboardScenes: [
            { id: `scene-${epIndex}-1`, status: 'success', video: 'https://www.w3schools.com/html/movie.mp4', image: '', script: '分镜1内容', progress: 100 },
            { id: `scene-${epIndex}-2`, status: 'pending', video: null, image: '', script: '分镜2内容', progress: 0 },
            { id: `scene-${epIndex}-3`, status: 'pending', video: null, image: '', script: '分镜3内容', progress: 0 },
            { id: `scene-${epIndex}-4`, status: 'pending', video: null, image: '', script: '分镜4内容', progress: 0 },
            { id: `scene-${epIndex}-5`, status: 'pending', video: null, image: '', script: '分镜5内容', progress: 0 },
            { id: `scene-${epIndex}-6`, status: 'pending', video: null, image: '', script: '分镜6内容', progress: 0 },
          ]
        };
      } else if (epIndex <= 24) {
        // 第19-24集：已合成全集
        return {
          ...base,
          storyboardStatus: 'success' as const,
          storyboardGenerated: true,
          synthesisStatus: 'success' as const,
          duration: '01:12',
          synthesisVideo: 'https://www.w3schools.com/html/movie.mp4',
          storyboardScenes: [
            { id: `scene-${epIndex}-1`, status: 'success', video: 'https://www.w3schools.com/html/movie.mp4', image: '', script: '分镜1内容', progress: 100 },
            { id: `scene-${epIndex}-2`, status: 'success', video: 'https://www.w3schools.com/html/movie.mp4', image: '', script: '分镜2内容', progress: 100 },
            { id: `scene-${epIndex}-3`, status: 'success', video: 'https://www.w3schools.com/html/movie.mp4', image: '', script: '分镜3内容', progress: 100 },
            { id: `scene-${epIndex}-4`, status: 'success', video: 'https://www.w3schools.com/html/movie.mp4', image: '', script: '分镜4内容', progress: 100 },
            { id: `scene-${epIndex}-5`, status: 'success', video: 'https://www.w3schools.com/html/movie.mp4', image: '', script: '分镜5内容', progress: 100 },
            { id: `scene-${epIndex}-6`, status: 'success', video: 'https://www.w3schools.com/html/movie.mp4', image: '', script: '分镜6内容', progress: 100 },
          ]
        };
      } else {
        // 第25-30集：没有任何视频
        return base;
      }
    });
    episodeStore.setEpisodes(mockEpisodes);
  }

  // Check for interrupted synthesis
  const synthesizingEpisodes = episodes.value.filter(ep => ep.synthesisStatus === 'synthesizing');
  if (synthesizingEpisodes.length > 0) {
    recoveryConfirmTitle.value = '恢复合成';
    recoveryConfirmMessage.value = `检测到有 ${synthesizingEpisodes.length} 集视频合成意外中断，是否恢复合成？`;
    recoveryConfirmVisible.value = true;
  }
});

// Helper Functions
const handleSearch = () => {
  // Computed property handles the filtering
};
const getStoryboardStatusShortLabel = (status: string) => {
  const map: any = {
    pending: '待制作',
    generating: '制作中',
    success: '已生成',
    failed: '失败'
  };
  return map[status] || '未知';
};

const getSynthesisStatusShortLabel = (status: string) => {
  const map: any = {
    pending: '待合成',
    synthesizing: '合成中',
    success: '已完结',
    failed: '失败'
  };
  return map[status] || '未知';
};

const getStepHint = (ep: any) => {
  if (ep.scriptStatus === 'pending') return '故事的起点，快去开启您的剧本创作之旅吧';
  if (ep.assetsStatus === 'pending') return '剧本已就绪，接下来请为您的剧集设置统一的角色与场景形象';
  if (ep.storyboardStatus === 'pending') return '主体形象已锁定，现在可以开始生成精美的分镜脚本了';
  if (ep.storyboardStatus === 'generating') return 'AI 正在为您精心雕琢每一帧画面，请稍候...';
  if (ep.synthesisStatus === 'pending') return '万事俱备，点击视频合成，将分镜转化为完整的短剧大片';
  if (ep.synthesisStatus === 'synthesizing') return '正在将分镜与音轨完美融合，即将为您呈现精彩视频...';
  if (ep.synthesisStatus === 'success') return '恭喜！您的短剧作品已制作完成，点击预览或导出分享吧';
  return '准备就绪';
};

const getPosterUrl = (ep: any) => {
  const defaultImage = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400';
  return ep.poster || defaultImage;
};

const navigateToOutline = (ep: any) => {
  router.push({
    path: '/ai-short-drama-creator/outline',
    query: { id: ep.id }
  });
};

const navigateToAssets = (ep: any) => {
  router.push({
    path: '/ai-short-drama-creator/assets',
    query: { id: ep.id }
  });
};

const handleRegenerate = (task: any) => {
  const ep = episodeStore.episodes.find(e => e.id === task.episodeId);
  if (!ep) return;

  ElMessage.info(`重新提交任务：第 ${ep.index} 集 ${task.type === 'storyboard' ? '分镜生成' : '全集合成'}`);
  
  taskQueueManager.addTask({
    id: `task-${ep.id}-${task.type}-${Date.now()}`,
    episodeId: ep.id,
    dramaTitle: task.dramaTitle || episodeStore.currentDramaTitle,
    episodeTitle: task.episodeTitle || ep.title || `第 ${ep.index} 集`,
    episodeIndex: ep.index,
    type: task.type,
    priority: 1,
    execute: async () => {
      if (task.type === 'storyboard') {
        await handleGenerate(ep);
      } else {
        await handleSynthesis(ep);
      }
    }
  });
};

const handleSynthesis = async (ep: any) => {
  if (ep.synthesisStatus === 'success') {
    handlePreview(ep);
    return;
  }
  
  // Update task status if it's part of a queue
  const task = episodeStore.tasks.find(t => t.episodeId === ep.id && t.type === 'synthesis');
  
  episodeStore.updateEpisode(ep.id, { synthesisStatus: 'synthesizing' });
  
  try {
    // Simulate synthesis process with steps
    const steps = 5;
    for (let i = 1; i <= steps; i++) {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate random failure
          if (i === 4 && Math.random() < 0.15) {
            reject(new Error('视频渲染引擎连接超时，请重试'));
          } else {
            resolve(true);
          }
        }, 1000);
      });
      const progress = Math.round((i / steps) * 100);
      if (task) task.progress = progress;
    }
    
    episodeStore.updateEpisode(ep.id, { 
      synthesisStatus: 'success',
      synthesisVideo: 'https://www.w3schools.com/html/movie.mp4'
    });
  } catch (error: any) {
    episodeStore.updateEpisode(ep.id, { synthesisStatus: 'failed' });
    throw error;
  }
};

// Actions
const handleUploadCover = (ep: any) => {
  ElMessage.info(`正在为第 ${ep.index} 集上传封面...`);
  // Add real upload logic here
};

// --- Manual Import Logic End ---

const handleAIGenerateCover = (ep: any) => {
  currentEpisodeForAI.value = ep;
  aiPrompt.value = `${ep.title}，短剧海报风格，高清，唯美`;
  generatedImages.value = [];
  selectedImage.value = '';
  coverTab.value = 'recommend';
  showAIDialog.value = true;
};

const generateCoverImages = () => {
  if (!aiPrompt.value) return ElMessage.warning('请输入描述词');
  isGenerating.value = true;
  generatedImages.value = [];
  setTimeout(() => {
    // Generate only ONE image as requested
    const newImg = 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1200&h=750&auto=format&fit=crop';
    generatedImages.value = [newImg];
    selectedImage.value = newImg; // Auto-select the only generated image
    isGenerating.value = false;
  }, 2000);
};

const confirmAICover = () => {
  if (currentEpisodeForAI.value && selectedImage.value) {
    episodeStore.updateEpisode(currentEpisodeForAI.value.id, { poster: selectedImage.value });
    showAIDialog.value = false;
    ElMessage.success('封面应用成功');
  }
};

const handleEdit = (ep: any) => {
  if (ep.scriptStatus === 'pending') {
    navigateToOutline(ep);
  } else if (ep.assetsStatus === 'pending') {
    navigateToAssets(ep);
  } else {
    navigateToDetail(ep);
  }
};

const handleCardClick = (ep: any) => {
  handleEdit(ep);
};

const handleGenerate = async (ep: any) => {
  const task = episodeStore.tasks.find(t => t.episodeId === ep.id && t.type === 'storyboard');
  
  episodeStore.updateEpisode(ep.id, { 
    status: 'generating',
    storyboardStatus: 'generating' 
  });
  
  try {
    // Simulate generation with steps (representing scenes)
    const steps = 5;
    for (let i = 1; i <= steps; i++) {
      if (task) task.sceneIndex = i;
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate random failure
          if (i === 3 && Math.random() < 0.1) {
            reject(new Error('AI 模型计算资源紧张，请重试'));
          } else {
            resolve(true);
          }
        }, 1200); // Slower for more realistic feeling
      });
      const progress = Math.round((i / steps) * 100);
      if (task) task.progress = progress;
    }
    
    episodeStore.updateEpisode(ep.id, { 
      status: 'success', 
      storyboardStatus: 'success',
      storyboardGenerated: true 
    });
    if (task) task.sceneIndex = undefined; // Clear after completion
  } catch (error: any) {
    episodeStore.updateEpisode(ep.id, { 
      status: 'failed', 
      storyboardStatus: 'failed',
      errorReason: error.message 
    });
    throw error;
  }
};

const handlePreview = (ep: any) => {
  // Use a mock video URL for simulation (Storyboard 1 video)
  const sampleVideo = 'https://www.w3schools.com/html/movie.mp4';
  previewEpisode.value = {
    ...ep,
    synthesisVideo: ep.synthesisVideo || sampleVideo
  };
  previewVisible.value = true;
};

const handleExport = (ep: any) => {
  if (ep.synthesisVideo || ep.synthesisStatus === 'success') {
    const link = document.createElement('a');
    link.href = ep.synthesisVideo || 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    link.download = `${ep.title}-full.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    ElMessage.success(`正在导出全集视频: ${ep.title}`);
  } else {
    ElMessage.warning('全集视频尚未合成，无法导出');
  }
};

const openEditDrawer = (ep: any) => {
  editingEpisode.value = ep;
  drawerVisible.value = true;
  trackEvent('shortDrama_open_drawer', { episodeId: ep.id });
};

const navigateToDetail = (ep: any) => {
  drawerVisible.value = false;
  trackEvent('shortDrama_enter_detail', { episodeId: ep.id });
  router.push({
    path: `/ai-short-drama-creator/storyboard`,
    query: { subjectId: episodeStore.subjectId, id: ep.id }
  });
};

const trackEvent = (eventName: string, params: any) => {
  console.log(`[Tracking] ${eventName}`, {
    ...params,
    subjectId: episodeStore.subjectId,
    timestamp: Date.now()
  });
  // Here you would integrate with your tracking SDK
};

const cancelNext = () => {
  // Logic for canceling next countdown if needed
};

</script>

<style scoped>
/* Modern Dialog Styles */
:deep(.modern-dialog-v2) {
  border-radius: 32px !important;
  overflow: hidden !important;
  border: none !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
}

:deep(.modern-dialog-v2 .el-dialog__header) {
  padding: 24px 24px 0 !important;
  margin-right: 0 !important;
}

:deep(.modern-dialog-v2 .el-dialog__title) {
  font-size: 20px !important;
  font-weight: 900 !important;
  color: #1e293b !important;
  letter-spacing: -0.025em !important;
}

.dark :deep(.modern-dialog-v2 .el-dialog__title) {
  color: #f1f5f9 !important;
}

:deep(.modern-dialog-v2 .el-dialog__body) {
  padding: 0 !important;
}

/* Pagination Customization (Match DramaWorks) */
.custom-pagination-v2 :deep(.el-pagination__total),
.custom-pagination-v2 :deep(.el-pagination__jump) {
  color: #94a3b8;
  font-weight: 600;
  font-size: 13px;
}
.dark .custom-pagination-v2 :deep(.el-pagination__total),
.dark .custom-pagination-v2 :deep(.el-pagination__jump),
.dark .custom-pagination-v2 :deep(.el-pagination__classifier) {
  color: #64748b;
}
.custom-pagination-v2 {
  --el-font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', 'Source Han Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-family: var(--el-font-family);
}
.custom-pagination-v2 :deep(*) {
  font-family: var(--el-font-family);
}
.custom-pagination-v2 :deep(.el-pager li) {
  background-color: #f8fafc !important;
  color: #64748b;
  font-weight: 700;
  border-radius: 10px;
  margin: 0 2px;
  border: 1px solid #e2e8f0;
}
.dark .custom-pagination-v2 :deep(.el-pager li) {
  background-color: #1e293b !important;
  border-color: #334155;
  color: #94a3b8;
}
.custom-pagination-v2 :deep(.el-pager li.is-active) {
  background: #6366f1 !important;
  color: white !important;
  border-color: #6366f1 !important;
}
.custom-pagination-v2 :deep(.btn-prev),
.custom-pagination-v2 :deep(.btn-next) {
  background-color: #fff !important;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  color: #64748b;
  margin: 0 4px;
}
.dark .custom-pagination-v2 :deep(.btn-prev),
.dark .custom-pagination-v2 :deep(.btn-next) {
  background-color: #1e293b !important;
  border-color: #334155;
  color: #94a3b8;
}
.custom-pagination-v2 :deep(.el-input__wrapper) {
  border-radius: 8px;
}
.dark .custom-pagination-v2 :deep(.el-input__wrapper) {
  background-color: #1e293b !important;
  box-shadow: 0 0 0 1px #334155 inset !important;
}
.dark .custom-pagination-v2 :deep(.el-input__inner) {
  color: #cbd5e1 !important;
  background-color: transparent !important;
}

/* AI Generator Dialog */
:deep(.ai-generator-dialog) {
  border-radius: 24px;
  overflow: hidden;
  background-color: #f8fafc;
}
.dark :deep(.ai-generator-dialog) {
  background-color: #0f172a;
}

:deep(.ai-generator-dialog .el-dialog__header) {
  margin-right: 0;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}
.dark :deep(.ai-generator-dialog .el-dialog__header) {
  border-bottom: 1px solid #1e293b;
}

:deep(.custom-textarea .el-textarea__inner) {
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0;
  font-size: 15px;
  font-weight: 500;
  color: #1e293b;
}
.dark :deep(.custom-textarea .el-textarea__inner) {
  color: #f1f5f9;
}

.loading-spinner-v2 {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(99, 102, 241, 0.1);
  border-top: 3px solid #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.custom-number-input :deep(.el-input__wrapper) {
  padding: 0 4px !important;
  border-radius: 8px !important;
  background: rgba(255, 255, 255, 0.5) !important;
}

.dark .custom-number-input :deep(.el-input__wrapper) {
  background: rgba(30, 41, 59, 0.5) !important;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
}
</style>
