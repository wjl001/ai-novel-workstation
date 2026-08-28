<template>
  <el-dialog
    v-model="visible"
    width="94vw"
    :show-close="false"
    class="custom-subject-dialog"
    destroy-on-close
    :style="{ maxWidth: '1040px' }"
    align-center
  >
    <div class="flex items-start justify-between gap-4 mb-6 px-2">
      <div class="space-y-2">
        <h2 class="text-[24px] font-black text-slate-800 dark:text-slate-100 tracking-tight">{{ title }}</h2>
        <div class="flex items-center gap-4 text-[12px]">
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 font-black border border-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-900/50 dark:text-indigo-300">
              {{ typeLabel }}{{ type === 'storyboard' ? '视频' : '图片' }}管理
            </span>
            <span class="text-slate-400 dark:text-slate-500 font-semibold">
              历史{{ type === 'storyboard' ? '视频' : '图片' }} {{ localSubject.imageHistory.length }} 张，默认选中最新生成
            </span>
          </div>
          <div class="flex items-center gap-2 ml-2">
            <AIModelSelector v-model="modelStore.selectedTextModel" type="text" compact moduleId="subject-edit-text" />
            <AIModelSelector 
              :model-value="type === 'storyboard' ? modelStore.selectedVideoModel : modelStore.selectedImageModel" 
              :type="type === 'storyboard' ? 'video' : 'image'" 
              compact
              moduleId="subject-edit-visual"
              @update:model-value="(val) => {
                if (type === 'storyboard') {
                  modelStore.setVideoModel(val);
                } else {
                  modelStore.setImageModel(val);
                }
              }"
            />
          </div>
        </div>
      </div>
      <button
        @click="visible = false"
        class="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 transition-colors"
      >
        <el-icon size="18"><Close /></el-icon>
      </button>
    </div>

    <div class="px-2 overflow-hidden subject-dialog-shell flex-1 min-h-0">
      <div class="grid grid-cols-[200px_minmax(0,1fr)_240px] gap-3 h-full">
        <aside class="rounded-[22px] border border-slate-100 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 overflow-hidden flex flex-col h-full">
          <div class="shrink-0 px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl">
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0">
                <div class="text-[13px] font-black text-slate-800 dark:text-slate-100 truncate">历史{{ type === 'storyboard' ? '视频' : '图片' }}</div>
                <div class="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">
                  {{ localSubject.imageHistory.length }} {{ type === 'storyboard' ? '个' : '张' }} · 每{{ type === 'storyboard' ? '个' : '张' }}可单独配置
                </div>
              </div>
              <div class="flex items-center gap-1.5 shrink-0">
                <button
                  @click="cloneHistoricalItem"
                  class="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm"
                  title="克隆当前项"
                >
                  <el-icon :size="14"><Plus /></el-icon>
                </button>
              </div>
            </div>
          </div>

          <div v-if="pagedImageHistory.length > 0" class="flex-1 min-h-0 overflow-y-auto custom-history-scrollbar">
            <div class="p-2 space-y-2">
              <div
                v-for="item in pagedImageHistory"
                :key="item.id"
                class="relative group/item"
              >
                <button
                  type="button"
                  class="w-full flex items-center gap-2.5 px-2 py-2 rounded-2xl border text-left transition-all"
                  :class="item.isSelected ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/30' : 'border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/40 hover:border-indigo-200'"
                  @click="applySelectedImage(item.id)"
                >
                  <div class="w-[52px] h-[36px] rounded-xl overflow-hidden border border-white/60 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0 relative group/thumb">
                    <template v-if="item.url">
                      <el-image 
                        :src="item.url" 
                        :preview-src-list="[item.url]"
                        preview-teleported
                        class="w-full h-full object-cover cursor-pointer"
                        @click.stop
                      >
                        <template #error>
                          <div class="w-full h-full flex items-center justify-center text-slate-400 bg-slate-200 dark:bg-slate-700">
                            <el-icon size="14"><Picture /></el-icon>
                          </div>
                        </template>
                      </el-image>
                      <!-- 如果是分镜且有视频，显示播放图标 -->
                      <div 
                        v-if="type === 'storyboard' && item.video" 
                        class="absolute inset-0 bg-black/20 flex items-center justify-center cursor-pointer hover:bg-black/40 transition-colors"
                        @click.stop="openVideoPreview(item.video)"
                      >
                        <el-icon class="text-white" size="14"><VideoPlay /></el-icon>
                      </div>
                    </template>
                    <div v-else class="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-800">
                      <el-icon :size="14" class="text-slate-400"><Picture /></el-icon>
                    </div>
                    <div v-if="item.isSelected" class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md z-10">
                      <el-icon :size="12"><Check /></el-icon>
                    </div>
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between gap-2">
                      <span class="text-[12px] font-black text-slate-800 dark:text-slate-100 truncate">
                        {{ item.name || localSubject.name || `${typeLabel}未命名` }}
                      </span>
                      <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 shrink-0">{{ formatHistoryTime(item.createdAt) }}</span>
                    </div>
                    <div class="flex items-center gap-2 mt-1">
                      <span v-if="item.reference_image" class="px-1.5 py-0.5 rounded-full bg-slate-900/5 dark:bg-white/10 text-[9px] font-black text-slate-500 dark:text-slate-300">参考图</span>
                      <span v-if="type === 'character' && item.voice_description" class="px-1.5 py-0.5 rounded-full bg-slate-900/5 dark:bg-white/10 text-[9px] font-black text-slate-500 dark:text-slate-300">设定</span>
                      <span class="text-[10px] text-slate-400 dark:text-slate-500 font-semibold truncate">
                        {{ item.isSelected ? '当前使用中' : (item.url ? '点击切换' : '待生成图片') }}
                      </span>
                    </div>
                  </div>
                </button>
                
                <!-- 删除按钮 -->
                <button
                  v-if="localSubject.imageHistory.length > 1 && item.id !== localSubject.selectedImageId && item.id !== parentSelectedImageId"
                  @click.stop="deleteHistoricalItem(item.id)"
                  class="absolute -right-1 -top-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all hover:scale-110 shadow-lg z-10"
                  title="删除此项"
                >
                  <el-icon :size="12"><Close /></el-icon>
                </button>
              </div>
            </div>
          </div>

          <div
            v-else
            class="flex-1 min-h-0 p-4 flex flex-col items-center justify-center text-center"
          >
            <el-icon size="28" class="text-slate-300 dark:text-slate-600 mb-2"><Picture /></el-icon>
            <div class="text-[12px] font-black text-slate-700 dark:text-slate-200 mb-1">暂无历史图</div>
            <p class="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
              点击上方「生成」创建首张图片
            </p>
          </div>

          <div v-if="localSubject.imageHistory.length > pageSize" class="shrink-0 px-3 py-2 border-t border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70">
            <el-pagination
              v-model:current-page="imageHistoryPage"
              :page-size="pageSize"
              :total="localSubject.imageHistory.length"
              layout="prev, pager, next"
              small
              background
            />
          </div>
        </aside>

        <main class="min-w-0 overflow-hidden h-full flex flex-col">
          <div class="flex-1 overflow-y-auto custom-history-scrollbar pr-1 min-h-0">
            <div class="flex flex-col gap-3 pb-2">
              <!-- 名称 -->
              <div class="flex flex-col gap-1.5">
                <label class="text-[12px] text-slate-400 font-black uppercase tracking-wider px-1">
                  {{ type === 'character' ? '形象名称' : (type === 'storyboard' ? '分镜名称' : '名称') }} <span class="text-red-500">*</span>
                </label>
                <div class="relative flex-1 min-w-0">
                  <input
                    v-model="localSubject.name"
                    type="text"
                    placeholder="请输入名称"
                    class="w-full px-4 py-2.5 border border-slate-100 dark:border-slate-700 rounded-2xl text-[13px] font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all pr-16 dark:text-slate-200 bg-[#f8fafc] dark:bg-slate-900/50"
                    maxlength="20"
                  />
                  <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-slate-300 font-mono">
                    {{ localSubject.name?.length || 0 }}/20
                  </span>
                </div>
              </div>

              <!-- 描述 -->
              <div class="flex flex-col gap-1.5">
                <div class="flex justify-between items-center px-1">
                  <label class="text-[12px] text-slate-400 font-black uppercase tracking-wider">
                    {{ type === 'character' ? '形象描述' : (type === 'storyboard' ? '分镜脚本' : '详细描述') }}
                  </label>
                  <div class="flex items-center gap-3">
                    <button
                      @click="polishText"
                      class="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 text-[11px] font-black transition-all disabled:opacity-50"
                      :disabled="isPolishingText || !localSubject.description"
                    >
                      <el-icon :class="{ 'animate-spin': isPolishingText }"><Refresh /></el-icon>
                      <span>AI 润色优化</span>
                    </button>
                  </div>
                </div>
                <div class="relative bg-[#f8fafc] dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-[20px] p-3 flex flex-col group transition-all focus-within:ring-4 focus-within:ring-indigo-500/5"
                     :class="type === 'storyboard' ? 'min-h-[360px]' : 'min-h-[100px]'">
                  <textarea
                    v-model="localSubject.description"
                    :placeholder="type === 'storyboard' ? '请输入分镜脚本描述...' : '请输入详细描述...'"
                    class="w-full flex-1 bg-transparent border-none resize-none text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed font-bold focus:outline-none custom-history-scrollbar"
                  ></textarea>
                </div>
              </div>

              <!-- 风格与镜头选择（新增） -->
              <div v-if="type !== 'storyboard'" class="flex flex-col gap-1.5">
                <div class="flex justify-between items-center px-1">
                  <label class="text-[12px] text-slate-400 font-black uppercase tracking-wider">
                    风格与镜头
                  </label>
                  <el-dropdown @command="loadDemoCase" trigger="click">
                    <button class="flex items-center gap-1 text-[10px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors">
                      <el-icon :size="10"><DocumentChecked /></el-icon>
                      <span>加载示例</span>
                      <el-icon :size="10"><ArrowDown /></el-icon>
                    </button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item v-for="(demo, i) in demoCases" :key="i" :command="i" :divided="i > 0">
                          <div class="flex flex-col">
                            <span class="text-[11px] font-black">{{ demo.title }}</span>
                            <span class="text-[9px] text-slate-400">{{ demo.description }}</span>
                          </div>
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
                <div class="flex gap-3">
                  <div class="flex-1">
                    <el-select v-model="selectedStyle" class="w-full" size="default">
                      <el-option v-for="opt in styleOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                    </el-select>
                  </div>
                  <div class="flex-1">
                    <el-select v-model="selectedShot" class="w-full" size="default">
                      <el-option v-for="opt in shotOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                    </el-select>
                  </div>
                  <button
                    @click="handleOptimizePrompt"
                    :disabled="isOptimizingPrompt"
                    class="px-4 h-[32px] flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-[12px] font-black hover:scale-[1.02] active:scale-95 transition-all shadow-md disabled:opacity-50 whitespace-nowrap"
                  >
                    <el-icon :class="{ 'animate-spin': isOptimizingPrompt }"><MagicStick /></el-icon>
                    <span>智能优化提示词</span>
                  </button>
                </div>
                <!-- 当前镜头描述 -->
                <p v-if="currentShotDescription" class="text-[10px] text-slate-400 px-1">
                  <span class="text-indigo-500 font-bold">{{ currentShotLabel }}：</span>{{ currentShotDescription }}
                </p>
              </div>

              <!-- 参考图 (分镜类型隐藏) -->
              <div v-if="type !== 'storyboard'" class="flex flex-col gap-1.5">
                <label class="text-[12px] text-slate-400 font-black uppercase tracking-wider px-1">
                  参考图 <span class="text-slate-300 font-normal ml-1">(可选)</span>
                </label>
                <div class="flex items-center gap-4 bg-[#f8fafc] dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-[20px] p-3.5 transition-all hover:border-indigo-100 dark:hover:border-indigo-900/50">
                  <div class="w-20 h-20 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center overflow-hidden relative group/ref shrink-0 shadow-sm">
                    <el-image 
                      v-if="localSubject.reference_image" 
                      :src="localSubject.reference_image" 
                      :preview-src-list="[localSubject.reference_image]"
                      preview-teleported
                      class="w-full h-full object-cover" 
                    />
                    <el-icon v-else size="24" class="text-slate-200 dark:text-slate-700"><Picture /></el-icon>
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover/ref:opacity-100 transition-all flex items-center justify-center gap-2 pointer-events-none">
                      <el-upload action="#" :auto-upload="false" :show-file-list="false" @change="handleReferenceImageUpload" class="pointer-events-auto">
                        <el-icon class="text-white cursor-pointer hover:scale-110" size="18"><Upload /></el-icon>
                      </el-upload>
                      <el-icon v-if="localSubject.reference_image" class="text-white cursor-pointer hover:scale-110 pointer-events-auto" size="18" @click="localSubject.reference_image = ''">
                        <Delete />
                      </el-icon>
                    </div>
                  </div>
                  <div class="flex-1 flex flex-col gap-2">
                    <p class="text-[11px] text-slate-400 leading-relaxed font-medium">
                      上传参考图可以帮助 AI 更准确地控制{{ typeLabel }}的视觉特征。
                    </p>
                    <el-upload action="#" :auto-upload="false" :show-file-list="false" @change="handleReferenceImageUpload">
                      <button class="px-4 py-1.5 bg-white dark:bg-slate-800 text-indigo-600 border border-indigo-100 dark:border-indigo-900/50 rounded-full text-[11px] font-black hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-all shadow-sm">
                        {{ localSubject.reference_image ? '更换图片' : '上传参考图' }}
                      </button>
                    </el-upload>
                  </div>
                </div>
              </div>

              <!-- 提示词优化与确认区域（新增核心功能） -->
              <div v-if="type !== 'storyboard'" class="flex flex-col gap-1.5">
                <div class="flex justify-between items-center px-1">
                  <label class="text-[12px] text-slate-400 font-black uppercase tracking-wider">
                    智能提示词 <span class="text-indigo-500">（生成前必看）</span>
                  </label>
                  <div class="flex items-center gap-2">
                    <span v-if="optimizedPrompt" class="text-[10px] font-black px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-100">
                      已匹配：{{ optimizedPrompt.matchedTemplate }}
                    </span>
                    <span v-if="hasUserEditedPrompt" class="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-100">
                      已自定义
                    </span>
                    <button
                      @click="showPromptEditor = !showPromptEditor"
                      class="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-[11px] font-black transition-all"
                    >
                      <el-icon><Edit /></el-icon>
                      <span>{{ showPromptEditor ? '收起编辑' : '展开编辑' }}</span>
                    </button>
                  </div>
                </div>

                <!-- 提示词摘要预览 -->
                <div v-if="optimizedPrompt" class="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-[20px] p-3.5">
                  <div class="flex items-start gap-2 mb-2">
                    <span class="text-[10px] font-black px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 shrink-0 mt-0.5">正面</span>
                    <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium line-clamp-3">
                      {{ hasUserEditedPrompt ? customPositivePrompt : optimizedPrompt.positivePrompt }}
                    </p>
                  </div>
                  <div class="flex items-start gap-2">
                    <span class="text-[10px] font-black px-2 py-0.5 rounded bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 shrink-0 mt-0.5">负面</span>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {{ hasUserEditedPrompt ? customNegativePrompt : optimizedPrompt.negativePrompt }}
                    </p>
                  </div>
                  <!-- 优化警告 -->
                  <div v-if="optimizedPrompt.warnings.length > 0" class="mt-2 pt-2 border-t border-indigo-100 dark:border-indigo-900/50">
                    <div v-for="(w, i) in optimizedPrompt.warnings" :key="i" class="flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                      <el-icon><Warning /></el-icon>
                      <span>{{ w }}</span>
                    </div>
                  </div>
                  <!-- 查看优化过程按钮 -->
                  <div class="mt-2 pt-2 border-t border-indigo-100 dark:border-indigo-900/50">
                    <button @click="showOptimizationProcess = !showOptimizationProcess" class="flex items-center gap-1 text-[10px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors">
                      <el-icon :size="10" :class="{ 'rotate-180': showOptimizationProcess }" class="transition-transform"><ArrowDown /></el-icon>
                      <span>{{ showOptimizationProcess ? '收起优化过程' : '查看八步智能优化过程' }}</span>
                    </button>
                  </div>
                </div>

                <!-- 八步优化过程展示 -->
                <div v-if="showOptimizationProcess && optimizedPrompt" class="bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/50 rounded-[20px] p-3 space-y-2 shadow-sm">
                  <div class="text-[11px] font-black text-slate-700 dark:text-slate-200 mb-1">智能优化八步流程</div>
                  <div v-for="step in optimizedPrompt.process" :key="step.step" class="flex gap-2">
                    <div class="flex flex-col items-center shrink-0">
                      <div class="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-[9px] font-black flex items-center justify-center">
                        {{ step.step }}
                      </div>
                      <div v-if="step.step < 8" class="w-px flex-1 bg-indigo-100 dark:bg-indigo-900/50 my-0.5"></div>
                    </div>
                    <div class="flex-1 pb-2">
                      <div class="text-[10px] font-black text-indigo-600 dark:text-indigo-400">{{ step.name }}</div>
                      <div class="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">{{ step.description }}</div>
                      <div class="mt-1 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-1.5 text-[9px] text-slate-600 dark:text-slate-300 space-y-0.5">
                        <div><span class="text-slate-400">输入：</span>{{ step.input }}</div>
                        <div><span class="text-green-600 dark:text-green-400 font-bold">输出：</span>{{ step.output }}</div>
                        <div v-if="step.details && step.details.length > 0" class="text-slate-400">
                          <div v-for="(d, di) in step.details" :key="di">· {{ d }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 未优化提示 -->
                <div v-else class="bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-700 rounded-[20px] p-4 text-center">
                  <el-icon :size="20" class="text-slate-300 dark:text-slate-600 mb-1"><MagicStick /></el-icon>
                  <p class="text-[11px] text-slate-400 dark:text-slate-500 font-medium">点击上方「智能优化提示词」按钮，系统将自动生成六层结构优化提示词</p>
                </div>

                <!-- 提示词编辑区（展开） -->
                <div v-if="showPromptEditor && optimizedPrompt" class="bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/50 rounded-[20px] p-3 space-y-3 shadow-sm">
                  <div>
                    <div class="flex justify-between items-center mb-1.5">
                      <span class="text-[11px] font-black text-indigo-600 dark:text-indigo-400">正面提示词（可编辑）</span>
                      <button @click="restoreRecommendedPrompt" class="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors">恢复推荐</button>
                    </div>
                    <textarea
                      v-model="customPositivePrompt"
                      @input="handlePromptEdit"
                      class="w-full h-24 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-xl p-2.5 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 custom-history-scrollbar"
                      placeholder="正面提示词..."
                    ></textarea>
                  </div>
                  <div>
                    <span class="text-[11px] font-black text-red-500 dark:text-red-400">负面提示词（可编辑）</span>
                    <textarea
                      v-model="customNegativePrompt"
                      @input="handlePromptEdit"
                      class="w-full h-16 mt-1.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-xl p-2.5 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 custom-history-scrollbar"
                      placeholder="负面提示词..."
                    ></textarea>
                  </div>
                  <div class="space-y-1.5">
                    <div class="flex items-center justify-between text-[10px]">
                      <button @click="showParamExplanation = !showParamExplanation" class="flex items-center gap-1 text-slate-400 hover:text-indigo-500 transition-colors">
                        <span>推荐参数：步数 {{ optimizedPrompt.recommendedParams.steps }} · 相关性 {{ optimizedPrompt.recommendedParams.cfgScale }}</span>
                        <el-icon :size="10" :class="{ 'rotate-180': showParamExplanation }" class="transition-transform"><ArrowDown /></el-icon>
                      </button>
                      <span class="text-indigo-500 font-bold">编辑后将使用自定义提示词生成</span>
                    </div>
                    <div v-if="showParamExplanation" class="bg-indigo-50/60 dark:bg-indigo-950/20 rounded-lg p-2 space-y-1.5 text-[10px] text-slate-600 dark:text-slate-300">
                      <div>
                        <span class="font-black text-indigo-600 dark:text-indigo-400">采样步数：</span>
                        {{ paramExplanations.steps.description }}
                      </div>
                      <div>
                        <span class="font-black text-indigo-600 dark:text-indigo-400">提示词相关性：</span>
                        {{ paramExplanations.cfgScale.description }}
                      </div>
                      <div class="text-slate-400">
                        推荐值：{{ paramExplanations.steps.recommended }}；{{ paramExplanations.cfgScale.recommended }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 声音设定 (分镜类型隐藏) -->
              <div v-if="type === 'character'" class="flex flex-col gap-2">
                <label class="text-[12px] text-slate-400 font-black uppercase tracking-wider px-1">角色声音设定</label>
                <div class="bg-[#f8fafc] dark:bg-slate-900/50 rounded-[20px] border border-slate-100 dark:border-slate-700 p-1 flex flex-col min-h-[140px]">
                  <div class="flex-1 flex flex-col p-1.5 min-h-0">
                    <div class="h-full flex flex-col">
                      <div class="flex justify-end items-center gap-3 px-2 mb-1">
                        <button
                          @click="polishVoice"
                          class="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 text-[10px] font-black transition-all disabled:opacity-50"
                          :disabled="isPolishingVoice || !localSubject.voice_description"
                        >
                          <el-icon :class="{ 'animate-spin': isPolishingVoice }"><Refresh /></el-icon>
                          <span>AI 润色优化</span>
                        </button>
                      </div>
                      <textarea
                        v-model="localSubject.voice_description"
                        placeholder="描述角色的音色特点，如：男声，深沉，富有磁性..."
                        class="w-full flex-1 bg-transparent border-none resize-none text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed font-bold focus:outline-none px-2 custom-history-scrollbar"
                        @input="handleVoiceDescriptionInput"
                      ></textarea>

                      <!-- 参考音频上传 -->
                      <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center gap-3">
                        <div class="w-16 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center overflow-hidden relative group/audio shrink-0 shadow-sm">
                          <template v-if="localSubject.voice_audio">
                            <audio :src="localSubject.voice_audio" controls class="w-full h-full object-cover"></audio>
                          </template>
                          <el-icon v-else size="24" class="text-slate-200 dark:text-slate-700"><Headset /></el-icon>
                          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover/audio:opacity-100 transition-all flex items-center justify-center gap-2 pointer-events-none">
                            <el-upload action="#" :auto-upload="false" :show-file-list="false" @change="handleVoiceAudioUpload" class="pointer-events-auto">
                              <el-icon class="text-white cursor-pointer hover:scale-110" size="18"><Upload /></el-icon>
                            </el-upload>
                            <el-icon v-if="localSubject.voice_audio" class="text-white cursor-pointer hover:scale-110 pointer-events-auto" size="18" @click="localSubject.voice_audio = ''">
                              <Delete />
                            </el-icon>
                          </div>
                        </div>
                        <div class="flex-1 flex flex-col gap-1">
                          <p class="text-[11px] text-slate-400 leading-relaxed font-medium">
                            上传参考音频可以帮助 AI 更准确地生成角色声音。
                          </p>
                          <el-upload action="#" :auto-upload="false" :show-file-list="false" @change="handleVoiceAudioUpload">
                            <button class="px-4 py-1.5 bg-white dark:bg-slate-800 text-indigo-600 border border-indigo-100 dark:border-indigo-900/50 rounded-full text-[11px] font-black hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-all shadow-sm">
                              {{ localSubject.voice_audio ? '更换音频' : '上传参考音频' }}
                            </button>
                          </el-upload>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <aside class="w-[240px] flex flex-col gap-3 shrink-0 overflow-hidden h-full">
          <div class="flex-1 flex flex-col gap-3 overflow-y-auto custom-history-scrollbar pr-1 min-h-0">
            <div class="aspect-video rounded-[24px] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 overflow-hidden relative shadow-sm group shrink-0">
            <div v-if="isGeneratingImage" class="absolute inset-0 z-10 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
              <el-icon class="animate-spin text-indigo-600" size="28"><Loading /></el-icon>
              <span class="text-[12px] text-slate-500 dark:text-slate-400 font-black">
                {{ type === 'storyboard' ? '分镜视频' : typeLabel + '图片' }}生成中...
              </span>
            </div>

            <div v-if="type === 'storyboard' && localSubject.video" class="w-full h-full relative rounded-2xl overflow-hidden group bg-black shadow-2xl">
              <video 
                :key="localSubject.video + videoKeySuffix"
                :src="localSubject.video" 
                class="w-full h-full object-contain"
                controls
                autoplay
                loop
                muted
                playsinline
                preload="auto"
              ></video>
              <!-- 放大预览按钮 -->
              <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button 
                  @click="openVideoPreview(localSubject.video)"
                  class="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all"
                >
                  <el-icon><FullScreen /></el-icon>
                </button>
              </div>
            </div>
            <template v-else>
              <el-image
                v-if="localSubject.image"
                :src="localSubject.image"
                :preview-src-list="previewSrcList.length ? previewSrcList : [localSubject.image]"
                :initial-index="previewInitialIndex"
                preview-teleported
                class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 cursor-pointer"
                fit="cover"
              >
                <template #error>
                  <div class="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100 dark:bg-slate-800">
                    <el-icon size="32"><Picture /></el-icon>
                    <span class="text-[12px] mt-2">图片加载失败</span>
                  </div>
                </template>
              </el-image>
              <div v-else class="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 gap-2">
                <el-icon size="40"><Picture /></el-icon>
                <span class="text-[12px] font-black uppercase tracking-widest">暂无预览</span>
              </div>
            </template>

            <div v-if="!hideUpload && type !== 'storyboard'" class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px] pointer-events-none">
              <el-upload
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                @change="handleImageUpload"
                class="pointer-events-auto"
              >
                <button class="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 rounded-full text-[12px] font-black hover:scale-105 active:scale-95 transition-all shadow-xl">
                  <el-icon><Upload /></el-icon>
                  <span>本地上传</span>
                </button>
              </el-upload>
            </div>
          </div>

          <!-- 推荐提示语移到图片下方 -->
          <p class="text-[9px] text-slate-400 text-center font-bold uppercase tracking-widest mt-1">推荐 16:9 · 支持 JPG/PNG</p>

          <div class="rounded-[22px] bg-[#1f2329] dark:bg-slate-800 px-5 py-4 text-white shadow-lg shadow-black/10 dark:shadow-black/30">
            <div class="flex items-center justify-between gap-3 mb-2">
              <span class="text-[13px] font-black">{{ type === 'storyboard' ? '当前选中分镜' : '当前选中图片' }}</span>
              <span class="text-[11px] text-white/60">{{ selectedImageMeta }}</span>
            </div>
            <p class="text-[12px] text-white/70 leading-relaxed">
              {{ type === 'storyboard' 
                ? '当前分镜视频和封面已同步。保存后将更新时间轴上的分镜画面与预览视频。' 
                : `已选中的图片会作为当前${typeLabel}封面，并在保存后回显到父级页面卡片中。` 
              }}
            </p>
          </div>

      <div class="space-y-3">
        <!-- 生成按钮区域（含用户确认状态） -->
        <div class="space-y-1.5">
          <div class="flex items-center gap-2">
            <el-tooltip
              v-if="!canGenerate"
              content="请完善主体描述信息"
              placement="top"
              :show-after="300"
            >
              <button
                disabled
                class="flex-1 h-[40px] flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-400 rounded-full text-[13px] font-black cursor-not-allowed"
              >
                <el-icon :size="16"><MagicStick /></el-icon>
                <span>确认并生成图片</span>
              </button>
            </el-tooltip>
            <button
              v-else
              @click="handleGenerateClick"
              class="flex-1 h-[40px] flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-[13px] font-black hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-indigo-500/20 group/ai disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              :disabled="isGeneratingImage"
            >
              <el-icon :size="16" class="group-hover/ai:rotate-12 transition-transform" :class="{ 'animate-spin': isGeneratingImage }"><MagicStick /></el-icon>
              <span>{{ isGeneratingImage ? '生成中...' : (localSubject.image ? '重新生成' : '确认并生成图片') }}</span>
            </button>
            <span v-if="hasUserEditedPrompt && !isGeneratingImage" class="shrink-0 text-[9px] font-black px-2 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200 whitespace-nowrap">
              已自定义
            </span>
          </div>
          <!-- 提示词长度校验提示 -->
          <div v-if="promptLengthWarning" class="flex items-center gap-1 text-[10px] text-amber-600 px-1">
            <el-icon :size="10"><Warning /></el-icon>
            <span>{{ promptLengthWarning }}</span>
          </div>
        </div>

        <!-- 生成后质量检测报告（新增） -->
        <div v-if="showQualityReport && qualityReport" class="rounded-[20px] border p-3 space-y-2.5"
          :class="qualityReport.passed
            ? 'bg-green-50/80 dark:bg-green-950/20 border-green-200 dark:border-green-900/50'
            : 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-black text-slate-700 dark:text-slate-200">质量检测报告</span>
            <span class="text-[14px] font-black" :class="qualityReport.passed ? 'text-green-600' : 'text-amber-600'">
              {{ qualityReport.overallScore }} 分
            </span>
          </div>
          <div class="grid grid-cols-2 gap-1.5">
            <div v-for="dim in qualityReport.dimensions" :key="dim.key" class="flex items-center justify-between text-[10px]">
              <span class="text-slate-500 dark:text-slate-400">{{ dim.label }}</span>
              <span :class="dim.score >= 80 ? 'text-green-600' : 'text-amber-600'" class="font-bold">{{ dim.score }}</span>
            </div>
          </div>
          <div v-if="qualityReport.issues.length > 0" class="space-y-1 pt-1 border-t border-amber-200/50 dark:border-amber-900/30">
            <div v-for="(issue, i) in qualityReport.issues" :key="i" class="flex items-start gap-1 text-[10px] text-amber-700 dark:text-amber-400">
              <el-icon class="shrink-0 mt-0.5"><Warning /></el-icon>
              <span>{{ issue }}</span>
            </div>
          </div>
          <div class="flex gap-1.5 pt-1">
            <button @click="generateImage" class="flex-1 h-7 px-2 bg-indigo-600 text-white rounded-lg text-[10px] font-black hover:bg-indigo-700 transition-all">
              重新生成
            </button>
            <button @click="showPromptEditor = true" class="flex-1 h-7 px-2 bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg text-[10px] font-black hover:bg-indigo-50 transition-all">
              改提示词
            </button>
          </div>
          <div class="flex gap-1.5">
            <button v-for="issue in issueMarkButtons" :key="issue" @click="markImageIssue(issue)" class="flex-1 h-6 px-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded text-[9px] font-bold hover:bg-red-50 hover:text-red-500 transition-all">
              {{ issue }}
            </button>
          </div>
        </div>
      </div>
          </div>
        </aside>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end items-center gap-3 px-2 pt-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800">
        <button
          @click="visible = false"
          class="px-8 py-2.5 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-400 text-[14px] font-black hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 transition-all"
        >
          取消
        </button>
        
        <!-- 保存当前编辑按钮移到这里 -->
        <button
          @click="handleExplicitSave"
          class="px-8 py-2.5 rounded-full bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 text-[14px] font-black hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:border-indigo-200 transition-all shadow-sm group/save flex items-center gap-2"
        >
          <el-icon :size="16" class="group-hover/save:scale-110 transition-transform"><DocumentChecked /></el-icon>
          <span>保存当前编辑信息</span>
        </button>

        <button
          @click="handleSave"
          class="px-10 py-2.5 rounded-full bg-indigo-600 text-white text-[14px] font-black shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
          :disabled="!localSubject.name || !localSubject.image || isGeneratingImage || isPolishingText || isPolishingVoice"
        >
          确认应用并同步至当前{{ typeLabel }}
        </button>
      </div>
    </template>
  </el-dialog>

  <!-- 提示词确认弹窗（新增） -->
  <el-dialog
    v-model="promptConfirmVisible"
    title="提示词确认"
    width="560px"
    center
    :close-on-click-modal="false"
    class="prompt-confirm-dialog"
  >
    <div class="space-y-4 py-2">
      <div class="flex items-center gap-2 px-1">
        <div class="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
          <el-icon class="text-indigo-600 dark:text-indigo-400" :size="18"><MagicStick /></el-icon>
        </div>
        <div>
          <p class="text-[14px] font-black text-slate-800 dark:text-slate-100">系统已为您智能优化提示词</p>
          <p class="text-[11px] text-slate-400">匹配模板：{{ optimizedPrompt?.matchedTemplate || '默认模板' }}</p>
        </div>
      </div>

      <div class="bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-3 max-h-[200px] overflow-y-auto custom-history-scrollbar">
        <p class="text-[10px] font-black text-indigo-600 dark:text-indigo-400 mb-1">正面提示词</p>
        <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
          {{ hasUserEditedPrompt ? customPositivePrompt : optimizedPrompt?.positivePrompt }}
        </p>
      </div>

      <div class="bg-red-50/60 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-xl p-3 max-h-[120px] overflow-y-auto custom-history-scrollbar">
        <p class="text-[10px] font-black text-red-500 dark:text-red-400 mb-1">负面提示词</p>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          {{ hasUserEditedPrompt ? customNegativePrompt : optimizedPrompt?.negativePrompt }}
        </p>
      </div>

      <div v-if="optimizedPrompt?.warnings && optimizedPrompt.warnings.length > 0" class="space-y-1">
        <div v-for="(w, i) in optimizedPrompt.warnings" :key="i" class="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
          <el-icon><Warning /></el-icon>
          <span>{{ w }}</span>
        </div>
      </div>

      <!-- 提示词长度校验 -->
      <div v-if="promptLengthWarning" class="flex items-start gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg p-2">
        <el-icon class="shrink-0 mt-0.5"><Warning /></el-icon>
        <span>{{ promptLengthWarning }}（警告不阻断生成，可继续）</span>
      </div>

      <!-- 特征完整性提醒 -->
      <div v-if="isCharacterFeaturesIncomplete" class="flex items-start gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg p-2">
        <el-icon class="shrink-0 mt-0.5"><Warning /></el-icon>
        <span>角色特征不完整，缺少：{{ missingFeatures.join('、') }}，可能影响生成效果</span>
      </div>

      <!-- 推荐参数 -->
      <div v-if="optimizedPrompt" class="flex items-center justify-center gap-4 text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-lg py-2">
        <span>推荐步数：<span class="text-indigo-500 font-bold">{{ optimizedPrompt.recommendedParams.steps }}</span></span>
        <span>推荐相关性：<span class="text-indigo-500 font-bold">{{ optimizedPrompt.recommendedParams.cfgScale }}</span></span>
        <span v-if="hasUserEditedPrompt" class="text-orange-500 font-bold">· 已自定义提示词</span>
      </div>

      <p class="text-[11px] text-slate-400 dark:text-slate-500 text-center">
        确认使用以上提示词生成图片？您也可以返回编辑弹窗手动调整。
      </p>
    </div>
    <template #footer>
      <div class="flex justify-center gap-3 pb-2">
        <button
          @click="promptConfirmVisible = false"
          class="px-6 py-2 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-500 text-[13px] font-black border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all"
        >
          再看看
        </button>
        <button
          @click="executeGenerate"
          class="px-8 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[13px] font-black shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          确认生成
        </button>
      </div>
    </template>
  </el-dialog>

  <!-- 特征不完整确认弹窗 -->
  <el-dialog
    v-model="featureIncompleteVisible"
    title="特征信息提醒"
    width="440px"
    center
    :close-on-click-modal="false"
    class="feature-confirm-dialog"
  >
    <div class="space-y-4 py-2">
      <div class="flex items-center gap-3 px-1">
        <div class="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
          <el-icon class="text-amber-600 dark:text-amber-400" :size="22"><Warning /></el-icon>
        </div>
        <div>
          <p class="text-[14px] font-black text-slate-800 dark:text-slate-100">检测到角色特征信息不完整</p>
          <p class="text-[11px] text-slate-400 mt-0.5">缺少关键特征可能导致生成结果不稳定</p>
        </div>
      </div>

      <div class="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 rounded-xl p-3">
        <p class="text-[11px] font-black text-amber-700 dark:text-amber-400 mb-1.5">缺少的特征：</p>
        <div class="flex flex-wrap gap-1.5">
          <span v-for="f in missingFeatures" :key="f" class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
            {{ f }}
          </span>
        </div>
        <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
          建议在描述中补充年龄（如"28岁"）和性别（如"女性"），以提升生成准确率。
        </p>
      </div>

      <p class="text-[11px] text-slate-500 dark:text-slate-400 text-center">
        是否继续生成？您也可以返回补充描述信息。
      </p>
    </div>
    <template #footer>
      <div class="flex justify-center gap-3 pb-2">
        <button
          @click="cancelFeatureIncomplete"
          class="px-6 py-2 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-500 text-[13px] font-black border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all"
        >
          去补充
        </button>
        <button
          @click="confirmFeatureIncompleteAndGenerate"
          class="px-8 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[13px] font-black shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          继续生成
        </button>
      </div>
    </template>
  </el-dialog>

  <!-- 视频放大预览弹窗 -->
  <el-dialog
    v-model="videoPreviewVisible"
    width="80vw"
    :show-close="true"
    destroy-on-close
    class="video-preview-dialog"
    append-to-body
  >
    <div class="aspect-video w-full bg-black rounded-lg overflow-hidden">
      <video 
        :key="videoPreviewUrl"
        :src="videoPreviewUrl" 
        class="w-full h-full" 
        controls 
        autoplay
        playsinline
      ></video>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { generateImageAPI } from '@/utils/imageGenerator';
import { useModelStore } from '@/store/models';
import AIModelSelector from '@/components/Common/ModelSelector.vue';
import { Close, MagicStick, Picture, Refresh, Upload, Loading, Delete, Check, Plus, VideoPlay, FullScreen, DocumentChecked, Coin, Headset, Edit, Warning, ArrowDown } from '@element-plus/icons-vue';
import {
  optimizePrompt,
  analyzeQuality,
  STYLE_OPTIONS,
  getShotOptions,
  getQualityDimensions,
  PARAM_EXPLANATIONS,
  DEMO_CASES,
  type StyleType,
  type ShotType,
  type OptimizedPrompt,
  type QualityReport,
  type OptimizationStep
} from '@/utils/promptOptimizer';

const modelStore = useModelStore();
import { ElMessage, ElMessageBox } from 'element-plus';

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
  video?: string;
}

const props = defineProps<{
  modelValue: boolean;
  subject: any;
  isEdit: boolean;
  hideUpload?: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'save']);

const pageSize = 32;
const imageHistoryPage = ref(1);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const createImageHistoryItem = (url: string, meta?: Partial<AssetImageItem>): AssetImageItem => ({
  id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  url,
  isSelected: true,
  createdAt: Date.now(),
  name: meta?.name,
  description: meta?.description,
  reference_image: meta?.reference_image,
  voice_description: meta?.voice_description,
  voice_audio: meta?.voice_audio,
  video: meta?.video
});

const normalizeImageHistory = (subject: any) => {
  const rawHistory = Array.isArray(subject?.imageHistory)
    ? subject.imageHistory.filter((item: any) => item && item.url)
    : [];

  const history: AssetImageItem[] = rawHistory.map((item: any, index: number) => ({
    id: item.id || `img_${Date.now()}_${index}`,
    url: item.url,
    isSelected: Boolean(item.isSelected),
    createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now() - (rawHistory.length - index) * 1000,
    name: item.name ?? subject?.name ?? '',
    description: item.description ?? subject?.description ?? '',
    reference_image: item.reference_image ?? subject?.reference_image ?? '',
    voice_description: item.voice_description ?? subject?.voice_description ?? '',
    voice_audio: item.voice_audio ?? subject?.voice_audio ?? '',
    video: item.video ?? subject?.video ?? ''
  }));

  if (!history.length && subject?.image) {
    history.push(createImageHistoryItem(subject.image, {
      name: subject?.name ?? '',
      description: subject?.description ?? '',
      reference_image: subject?.reference_image ?? '',
      voice_description: subject?.voice_description ?? '',
      voice_audio: subject?.voice_audio ?? '',
      video: subject?.video ?? ''
    }));
  }

  if (!history.length) {
    return {
      ...subject,
      imageHistory: [] as AssetImageItem[],
      selectedImageId: ''
    };
  }

  const selectedById = history.find(item => item.id === subject?.selectedImageId);
  const selectedItem = selectedById || history.find(item => item.isSelected) || history[history.length - 1];

  const normalizedHistory = history.map(item => ({
    ...item,
    isSelected: item.id === selectedItem.id
  }));

  return {
    ...subject,
    name: selectedItem.name ?? subject?.name ?? '',
    description: selectedItem.description ?? subject?.description ?? '',
    reference_image: selectedItem.reference_image ?? subject?.reference_image ?? '',
    voice_description: selectedItem.voice_description ?? subject?.voice_description ?? '',
    voice_audio: selectedItem.voice_audio ?? subject?.voice_audio ?? '',
    video: selectedItem.video ?? subject?.video ?? '',
    image: selectedItem.url,
    selectedImageId: selectedItem.id,
    imageHistory: normalizedHistory
  };
};

const localSubject = ref<any>({
  id: '',
  name: '',
  description: '',
  voice_description: '',
  voice_audio: '',
  video: '',
  type: 'character',
  image: '',
  reference_image: '',
  imageHistory: [] as AssetImageItem[],
  selectedImageId: '',
  appeared_episodes: []
});

const isGeneratingImage = ref(false);
const isPolishingText = ref(false);
const isPolishingVoice = ref(false);
const videoPreviewVisible = ref(false);
const videoPreviewUrl = ref('');
const parentSelectedImageId = ref('');

// ==================== 提示词优化与确认（新增） ====================
const selectedStyle = ref<StyleType>('realistic');
const selectedShot = ref<ShotType>('halfbody');
const optimizedPrompt = ref<OptimizedPrompt | null>(null);
const isOptimizingPrompt = ref(false);
const showPromptEditor = ref(false);
const customPositivePrompt = ref('');
const customNegativePrompt = ref('');
const hasUserEditedPrompt = ref(false);
const qualityReport = ref<QualityReport | null>(null);
const showQualityReport = ref(false);
const promptConfirmVisible = ref(false);
const showParamExplanation = ref(false);
const featureIncompleteVisible = ref(false);
const pendingGenerateAfterFeatureConfirm = ref(false);

// 敏感词列表（基础版，可扩展）
const SENSITIVE_WORDS = ['暴力', '血腥', '色情', '裸体', '政治', '反动', '恐怖', '毒品', '武器', '枪支', '炸药'];

// 是否可以生成（描述非空）
const canGenerate = computed(() => {
  return localSubject.value.description && localSubject.value.description.trim().length > 0;
});

// 当前使用的正面/负面提示词
const currentPositivePrompt = computed(() => {
  return hasUserEditedPrompt.value ? customPositivePrompt.value : (optimizedPrompt.value?.positivePrompt || '');
});
const currentNegativePrompt = computed(() => {
  return hasUserEditedPrompt.value ? customNegativePrompt.value : (optimizedPrompt.value?.negativePrompt || '');
});

// 提示词长度校验警告
const promptLengthWarning = computed(() => {
  if (!optimizedPrompt.value && !hasUserEditedPrompt.value) return '';
  const positive = currentPositivePrompt.value;
  const negative = currentNegativePrompt.value;
  const warnings: string[] = [];
  if (positive.length > 0 && positive.length < 50) {
    warnings.push(`正面提示词偏短（${positive.length}字），建议50-300字`);
  }
  if (positive.length > 300) {
    warnings.push(`正面提示词偏长（${positive.length}字），建议50-300字`);
  }
  if (negative.length > 0 && negative.length < 20) {
    warnings.push(`负面提示词偏短（${negative.length}字），建议20-100字`);
  }
  if (negative.length > 100) {
    warnings.push(`负面提示词偏长（${negative.length}字），建议20-100字`);
  }
  return warnings.join('；');
});

// 敏感词检测
const detectedSensitiveWords = computed(() => {
  const text = currentPositivePrompt.value + currentNegativePrompt.value + localSubject.value.description;
  return SENSITIVE_WORDS.filter(w => text.includes(w));
});

// 角色特征完整性检查
const isCharacterFeaturesIncomplete = computed(() => {
  if (localSubject.value.type !== 'character') return false;
  const desc = localSubject.value.description || '';
  const hasAge = /\d+\s*岁|年轻|青年|少年|少女|中年|老年|儿童|小孩/.test(desc);
  const hasGender = /男性|女性|男孩|女孩|男人|女人|男士|女士|先生|小姐|他|她/.test(desc);
  return !hasAge || !hasGender;
});
const missingFeatures = computed(() => {
  const desc = localSubject.value.description || '';
  const missing: string[] = [];
  if (!/\d+\s*岁|年轻|青年|少年|少女|中年|老年|儿童|小孩/.test(desc)) missing.push('年龄');
  if (!/男性|女性|男孩|女孩|男人|女人|男士|女士|先生|小姐|他|她/.test(desc)) missing.push('性别');
  return missing;
});

const styleOptions = STYLE_OPTIONS;
const shotOptions = computed(() => getShotOptions(localSubject.value.type as any));
const qualityDimensions = computed(() => getQualityDimensions(localSubject.value.type as any));
const paramExplanations = PARAM_EXPLANATIONS;
const demoCases = DEMO_CASES;

// 优化过程展示
const showOptimizationProcess = ref(false);
const currentProcessStep = ref(0);

// 按主体类型的问题标记按钮
const issueMarkButtons = computed(() => {
  const type = localSubject.value.type;
  if (type === 'character') {
    return ['人脸崩坏', '斗鸡眼', '色偏', '精度低'];
  } else if (type === 'scene') {
    return ['透视错误', '色偏', '细节丢失', '氛围不符'];
  }
  return ['形态扭曲', '材质错误', '色偏', '精度低'];
});

// 当前镜头描述
const currentShotDescription = computed(() => {
  const options = shotOptions.value;
  const current = options.find(o => o.value === selectedShot.value);
  return current?.description || '';
});
const currentShotLabel = computed(() => {
  const options = shotOptions.value;
  const current = options.find(o => o.value === selectedShot.value);
  return current?.label || '';
});

// 加载示例案例
const loadDemoCase = (index: number) => {
  const demo = demoCases[index];
  if (!demo) return;
  localSubject.value.name = demo.input.name;
  localSubject.value.description = demo.input.description;
  selectedStyle.value = demo.input.style as StyleType;
  selectedShot.value = demo.input.shot as ShotType;
  ElMessage.success(`已加载示例：${demo.title}，点击「智能优化提示词」查看完整八步过程`);
};

// 主体类型变化时，重置镜头为该类型的默认值
watch(() => localSubject.value.type, (newType) => {
  const options = getShotOptions(newType as any);
  if (options.length > 0 && !options.find(o => o.value === selectedShot.value)) {
    selectedShot.value = options[0].value;
  }
});

// 描述变化时重置确认状态，确保修改后重新生成会再次确认
watch(() => localSubject.value.description, () => {
  hasPromptConfirmed.value = false;
});

// 执行提示词智能优化
const handleOptimizePrompt = async () => {
  if (!localSubject.value.description) {
    return ElMessage.warning('请先输入描述，以便智能优化提示词');
  }
  isOptimizingPrompt.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 600));
    const result = optimizePrompt({
      name: localSubject.value.name,
      description: localSubject.value.description,
      type: localSubject.value.type as any,
      referenceImage: localSubject.value.reference_image,
      style: selectedStyle.value,
      shot: selectedShot.value
    });
    optimizedPrompt.value = result;
    customPositivePrompt.value = result.positivePrompt;
    customNegativePrompt.value = result.negativePrompt;
    hasUserEditedPrompt.value = false;
    if (result.warnings.length > 0) {
      ElMessage.warning(`提示词优化完成，存在${result.warnings.length}条建议`);
    } else {
      ElMessage.success('提示词智能优化完成');
    }
  } catch (e) {
    ElMessage.error('提示词优化失败，请稍后重试');
  } finally {
    isOptimizingPrompt.value = false;
  }
};

// 恢复系统推荐提示词
const restoreRecommendedPrompt = () => {
  if (optimizedPrompt.value) {
    customPositivePrompt.value = optimizedPrompt.value.positivePrompt;
    customNegativePrompt.value = optimizedPrompt.value.negativePrompt;
    hasUserEditedPrompt.value = false;
    ElMessage.success('已恢复系统推荐提示词');
  }
};

// 用户手动编辑提示词
const handlePromptEdit = () => {
  hasUserEditedPrompt.value = true;
};

// 确认并生成（带提示词确认）
const confirmAndGenerate = async () => {
  if (!optimizedPrompt.value && !customPositivePrompt.value) {
    await handleOptimizePrompt();
  }
  promptConfirmVisible.value = true;
};

// 生成按钮点击：完整确认前校验流程
const hasPromptConfirmed = ref(false);
const handleGenerateClick = async () => {
  // 第一步：主体描述非空校验
  if (!localSubject.value.description || !localSubject.value.description.trim()) {
    return ElMessage.warning('请先输入描述，以便 AI 生成更准确的图片');
  }

  // 第二步：敏感词校验
  if (detectedSensitiveWords.value.length > 0) {
    return ElMessage.error(`检测到敏感词：${detectedSensitiveWords.value.join('、')}，请修改后再生成`);
  }

  // 第三步：如果没有优化过提示词，先自动优化
  if (!optimizedPrompt.value) {
    await handleOptimizePrompt();
  }

  // 第四步：角色特征完整性检查
  if (isCharacterFeaturesIncomplete.value && !hasPromptConfirmed.value) {
    pendingGenerateAfterFeatureConfirm.value = true;
    featureIncompleteVisible.value = true;
    return;
  }

  // 第五步：首次生成弹出提示词确认
  if (!hasPromptConfirmed.value) {
    promptConfirmVisible.value = true;
  } else {
    await generateImage();
  }
};

// 特征不完整确认后继续生成
const confirmFeatureIncompleteAndGenerate = async () => {
  featureIncompleteVisible.value = false;
  pendingGenerateAfterFeatureConfirm.value = false;
  promptConfirmVisible.value = true;
};

// 取消特征不完整确认
const cancelFeatureIncomplete = () => {
  featureIncompleteVisible.value = false;
  pendingGenerateAfterFeatureConfirm.value = false;
  ElMessage.info('请补充角色特征信息后再生成');
};

// 执行最终生成
const executeGenerate = async () => {
  promptConfirmVisible.value = false;
  hasPromptConfirmed.value = true;
  await generateImage();
};

// 标记图片问题
const markImageIssue = (issue: string) => {
  ElMessage.success(`已标记问题：${issue}，将用于后续优化`);
};

// 监听弹窗打开状态，重置父级选中的 ID 记录
watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      parentSelectedImageId.value = '';
    }
  }
);

const openVideoPreview = (url: string) => {
  videoPreviewUrl.value = url;
  videoPreviewVisible.value = true;
};

const type = computed(() => localSubject.value.type);
const typeLabel = computed(() => {
  if (type.value === 'character') return '角色';
  if (type.value === 'scene') return '场景';
  if (type.value === 'storyboard') return '分镜';
  return '道具';
});
const title = computed(() => {
  if (type.value === 'character') return '角色历史管理';
  if (type.value === 'scene') return '场景历史管理';
  if (type.value === 'storyboard') return '分镜视频历史管理';
  return '道具历史管理';
});

const previewSrcList = computed(() =>
  (localSubject.value.imageHistory || [])
    .map((item: AssetImageItem) => item.url)
    .filter((url: string) => !!url)
);

const previewInitialIndex = computed(() => {
  const selectedId = localSubject.value.selectedImageId;
  if (!selectedId) return 0;
  const selectedItem = (localSubject.value.imageHistory || []).find((item: AssetImageItem) => item.id === selectedId);
  const selectedUrl = selectedItem?.url;
  if (!selectedUrl) return 0;
  const idx = previewSrcList.value.findIndex((url: string) => url === selectedUrl);
  return idx >= 0 ? idx : 0;
});

const isImageReachable = (url: string, timeoutMs = 8000) =>
  new Promise<boolean>((resolve) => {
    if (!url) return resolve(false);
    let done = false;
    const img = new Image();
    const timer = window.setTimeout(() => {
      if (done) return;
      done = true;
      resolve(false);
    }, timeoutMs);
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      resolve(ok);
    };
    img.onload = () => finish(true);
    img.onerror = () => finish(false);
    img.referrerPolicy = 'no-referrer';
    img.src = url;
  });

const pickFirstReachableImage = async (urls: string[]) => {
  for (const url of urls) {
    if (await isImageReachable(url)) return url;
  }
  return urls.find(Boolean) || '';
};

const syncPageToSelected = () => {
  const selectedIndex = localSubject.value.imageHistory.findIndex((item: AssetImageItem) => item.isSelected);
  if (selectedIndex < 0) {
    imageHistoryPage.value = 1;
    return;
  }
  imageHistoryPage.value = Math.floor(selectedIndex / pageSize) + 1;
};

const pagedImageHistory = computed(() => {
  const start = (imageHistoryPage.value - 1) * pageSize;
  return localSubject.value.imageHistory.slice(start, start + pageSize);
});

const selectedImageMeta = computed(() => {
  const current = localSubject.value.imageHistory.find((item: AssetImageItem) => item.isSelected);
  return current ? formatHistoryTime(current.createdAt) : '未选择';
});

const isSyncingFromHistory = ref(false);

const syncFieldsFromSelectedHistory = () => {
  const selected = localSubject.value.imageHistory.find((item: AssetImageItem) => item.id === localSubject.value.selectedImageId);
  if (!selected) return;
  isSyncingFromHistory.value = true;
  localSubject.value.name = selected.name ?? localSubject.value.name ?? '';
  localSubject.value.description = selected.description ?? localSubject.value.description ?? '';
  localSubject.value.reference_image = selected.reference_image ?? localSubject.value.reference_image ?? '';
  localSubject.value.voice_description = selected.voice_description ?? localSubject.value.voice_description ?? '';
  localSubject.value.voice_audio = selected.voice_audio ?? localSubject.value.voice_audio ?? '';
  localSubject.value.video = selected.video ?? localSubject.value.video ?? '';
  isSyncingFromHistory.value = false;
};

const syncSelectedHistoryFromFields = () => {
  if (isSyncingFromHistory.value) return;
  const selectedId = localSubject.value.selectedImageId;
  if (!selectedId) return;
  localSubject.value.imageHistory = localSubject.value.imageHistory.map((item: AssetImageItem) => {
    if (item.id !== selectedId) return item;
    return {
      ...item,
      name: localSubject.value.name ?? '',
      description: localSubject.value.description ?? '',
      reference_image: localSubject.value.reference_image ?? '',
      voice_description: localSubject.value.voice_description ?? '',
      voice_audio: localSubject.value.voice_audio ?? '',
      video: localSubject.value.video ?? ''
    };
  });
};

watch(
  () => props.subject,
  (newVal) => {
    if (!newVal) return;
    const normalized = normalizeImageHistory({
      ...newVal,
      name: newVal.name || '',
      description: newVal.description || '',
      type: newVal.type || 'character',
      voice_description: newVal.voice_description || (newVal.type === 'character' ? '沉稳大气，富有磁性' : ''),
      voice_audio: newVal.voice_audio || '',
      video: newVal.video || '',
      image: newVal.image || '',
      reference_image: newVal.reference_image || '',
      appeared_episodes: newVal.appeared_episodes && newVal.appeared_episodes.length > 0 ? newVal.appeared_episodes : [1]
    });

    localSubject.value = normalized;
    if (!parentSelectedImageId.value) {
      parentSelectedImageId.value = normalized.selectedImageId;
    }
    syncPageToSelected();
    syncFieldsFromSelectedHistory();
  },
  { immediate: true, deep: true }
);

const applySelectedImage = (imageId: string) => {
  const target = localSubject.value.imageHistory.find((item: AssetImageItem) => item.id === imageId);
  if (!target) return;

  localSubject.value.imageHistory = localSubject.value.imageHistory.map((item: AssetImageItem) => ({
    ...item,
    isSelected: item.id === imageId
  }));
  localSubject.value.selectedImageId = imageId;
  localSubject.value.image = target.url;
  localSubject.value.video = target.video;
  syncFieldsFromSelectedHistory();
};

const deleteHistoricalItem = async (imageId: string) => {
  if (localSubject.value.imageHistory.length <= 1) {
    return ElMessage.warning('至少保留一条历史记录');
  }

  if (imageId === localSubject.value.selectedImageId) {
    return ElMessage.warning('不能删除当前正在使用的项目');
  }

  try {
    await ElMessageBox.confirm('确定要删除这个历史记录吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    const index = localSubject.value.imageHistory.findIndex((item: AssetImageItem) => item.id === imageId);
    if (index === -1) return;

    localSubject.value.imageHistory.splice(index, 1);
    ElMessage.success('历史记录已删除');

  } catch (error) {
    // 用户取消了删除操作
    ElMessage.info('已取消删除');
  }
};

const cloneHistoricalItem = () => {
  const selected = localSubject.value.imageHistory.find((item: AssetImageItem) => item.id === localSubject.value.selectedImageId);
  if (!selected) return;

  // 克隆时不复制图片 URL
  const newItem = createImageHistoryItem('', {
    name: selected.name,
    description: selected.description,
    reference_image: selected.reference_image,
    voice_description: selected.voice_description,
    voice_audio: selected.voice_audio,
    video: ''
  });

  localSubject.value.imageHistory = [
    ...localSubject.value.imageHistory.map((item: AssetImageItem) => ({ ...item, isSelected: false })),
    newItem
  ];
  localSubject.value.selectedImageId = newItem.id;
  localSubject.value.image = '';
  localSubject.value.video = '';
  syncFieldsFromSelectedHistory();
  imageHistoryPage.value = Math.ceil(localSubject.value.imageHistory.length / pageSize);
  ElMessage.success('已克隆当前项（请重新生成图片）');
};

const appendHistoryImage = (url: string) => {
  const nextItem = createImageHistoryItem(url, {
    name: localSubject.value.name ?? '',
    description: localSubject.value.description ?? '',
    reference_image: localSubject.value.reference_image ?? '',
    voice_description: localSubject.value.voice_description ?? '',
    voice_audio: localSubject.value.voice_audio ?? '',
    video: localSubject.value.video ?? ''
  });
  localSubject.value.imageHistory = [
    ...localSubject.value.imageHistory.map((item: AssetImageItem) => ({ ...item, isSelected: false })),
    nextItem
  ];
  localSubject.value.selectedImageId = nextItem.id;
  localSubject.value.image = nextItem.url;
  imageHistoryPage.value = Math.ceil(localSubject.value.imageHistory.length / pageSize);
};

const videoKeySuffix = ref(0);

const generateImage = async () => {
  if (!localSubject.value.description) {
    return ElMessage.warning('请先输入描述，以便 AI 生成更准确的图片');
  }

  // 如果没有优化过提示词，先自动优化
  if (!optimizedPrompt.value) {
    await handleOptimizePrompt();
  }

  isGeneratingImage.value = true;
  qualityReport.value = null;
  showQualityReport.value = false;

  try {
    const isStoryboard = type.value === 'storyboard';
    // 使用优化后的提示词（用户自定义或系统推荐）
    const promptToUse = hasUserEditedPrompt.value
      ? customPositivePrompt.value
      : (optimizedPrompt.value?.positivePrompt || `${typeLabel.value} ${localSubject.value.name}, ${localSubject.value.description}, realistic, high quality`);
    const negativePromptToUse = hasUserEditedPrompt.value
      ? customNegativePrompt.value
      : (optimizedPrompt.value?.negativePrompt || '');

    const resultUrl = await generateImageAPI(promptToUse, isStoryboard ? 'video' : 'image', undefined, negativePromptToUse);
    
    // 对于分镜，我们需要一个额外的图片作为缩略图预览
    let thumbnailUrl = resultUrl;
    if (isStoryboard) {
      // 随机获取一张图片作为视频的封面图
      thumbnailUrl = `https://picsum.photos/seed/${Date.now()}/1280/720`;
    }

    // 只生成当前的图片：更新当前选中的历史项 URL
    const selectedId = localSubject.value.selectedImageId;
    if (selectedId) {
      localSubject.value.imageHistory = localSubject.value.imageHistory.map((item: AssetImageItem) => {
        if (item.id !== selectedId) return item;
        const updates: any = { ...item, url: thumbnailUrl };
        if (isStoryboard) {
          updates.video = resultUrl;
        } else {
          updates.video = '';
        }
        return updates;
      });
      
      localSubject.value.image = thumbnailUrl;
      if (isStoryboard) {
        localSubject.value.video = resultUrl;
        videoKeySuffix.value++; // 强制刷新视频播放器
      } else {
        localSubject.value.video = '';
      }
    } else {
      const nextItem = createImageHistoryItem(thumbnailUrl, {
        name: localSubject.value.name ?? '',
        description: localSubject.value.description ?? '',
        reference_image: localSubject.value.reference_image ?? '',
        voice_description: localSubject.value.voice_description ?? '',
        voice_audio: localSubject.value.voice_audio ?? '',
        video: isStoryboard ? resultUrl : ''
      });
      localSubject.value.imageHistory = [
        ...localSubject.value.imageHistory.map((item: AssetImageItem) => ({ ...item, isSelected: false })),
        nextItem
      ];
      localSubject.value.selectedImageId = nextItem.id;
      localSubject.value.image = nextItem.url;
      localSubject.value.video = nextItem.video;
      imageHistoryPage.value = Math.ceil(localSubject.value.imageHistory.length / pageSize);
    }

    // 生成后自动质量检测
    if (!isStoryboard) {
      qualityReport.value = analyzeQuality(thumbnailUrl, localSubject.value.type as any);
      showQualityReport.value = true;
      if (!qualityReport.value.passed) {
        ElMessage.warning(`图片生成完成，检测到${qualityReport.value.issues.length}个潜在问题，建议查看质量报告`);
      } else {
        ElMessage.success(`已生成新图片，综合评分 ${qualityReport.value.overallScore} 分`);
      }
    } else {
      ElMessage.success(`已生成新视频`);
    }
  } catch (error) {
    ElMessage.error(`${typeLabel.value}生成失败，请稍后重试`);
  } finally {
    isGeneratingImage.value = false;
  }
};

const polishText = async () => {
  if (!localSubject.value.description) return;

  isPolishingText.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const originalText = localSubject.value.description;
    localSubject.value.description = `${originalText}（经过AI润色：增强了视觉张力和氛围感，使其更符合剧作水准。）`;

    ElMessage.success('文本润色完成');
  } catch (error) {
    ElMessage.error('润色失败，请稍后重试');
  } finally {
    isPolishingText.value = false;
  }
};

const polishVoice = async () => {
  if (!localSubject.value.voice_description) return;

  isPolishingVoice.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const originalText = localSubject.value.voice_description;
    localSubject.value.voice_description = `${originalText}（AI优化：增加了音色质感和情感表现力的描述）`;

    ElMessage.success('音色描述润色完成');
  } catch (error) {
    ElMessage.error('润色失败，请稍后重试');
  } finally {
    isPolishingVoice.value = false;
  }
};

const handleImageUpload = (file: any) => {
  const nextUrl = URL.createObjectURL(file.raw);
  appendHistoryImage(nextUrl);
  ElMessage.success('预览图更新成功');
};

const handleReferenceImageUpload = (file: any) => {
  localSubject.value.reference_image = URL.createObjectURL(file.raw);
  syncSelectedHistoryFromFields();
  ElMessage.success('参考图上传成功');
};

const handleVoiceAudioUpload = (file: any) => {
  localSubject.value.voice_audio = URL.createObjectURL(file.raw);
  syncSelectedHistoryFromFields();
  ElMessage.success('参考音频上传成功');
};

const handleVoiceDescriptionInput = () => {
  if (localSubject.value.voice_description) {
    localSubject.value.voice_audio = '';
  }
  syncSelectedHistoryFromFields();
};

const formatHistoryTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}`;
};

watch(
  () => [
    localSubject.value.name, 
    localSubject.value.description, 
    localSubject.value.reference_image, 
    localSubject.value.voice_description, 
    localSubject.value.voice_audio,
    localSubject.value.video
  ],
  () => {
    syncSelectedHistoryFromFields();
  }
);

const handleExplicitSave = () => {
  if (!localSubject.value.name) {
    return ElMessage.warning('名称不能为空');
  }
  
  // 确保当前编辑的信息已同步到历史记录中
  syncSelectedHistoryFromFields();
  
  ElMessage({
    message: '当前编辑信息已保存',
    type: 'success',
    duration: 2000,
    customClass: 'modern-message-success'
  });
};

const handleSave = () => {
  const normalized = normalizeImageHistory(localSubject.value);
  emit('save', { ...normalized });
  visible.value = false;
};
</script>

<style>
.custom-subject-dialog {
  border-radius: 24px !important;
  padding: 16px !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid transparent !important;
  transition: all 0.3s ease;
  height: 85vh !important;
  max-height: 820px !important;
  min-height: 500px !important;
  display: flex;
  flex-direction: column;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  top: 0 !important;
}

.custom-history-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-history-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-history-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.2);
  border-radius: 10px;
}

.custom-history-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.4);
}

.dark .custom-history-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.1);
}

.dark .custom-history-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.2);
}

.dark .custom-subject-dialog {
  background-color: #1e293b !important; /* slate-800 */
  border: 1px solid #334155 !important; /* slate-700 */
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) !important;
}

.custom-subject-dialog .el-dialog__header {
  display: none;
}

.custom-subject-dialog .el-dialog__body {
  padding: 0 !important;
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.subject-dialog-shell {
  flex: 1;
  min-height: 0;
}

.custom-subject-dialog .el-dialog__footer {
  padding: 16px 0 0 0 !important;
  background-color: transparent !important;
}

.modern-message-success {
  border-radius: 16px !important;
  padding: 12px 24px !important;
  background: #10b981 !important;
  border: none !important;
}

.modern-message-success .el-message__content {
  color: white !important;
  font-weight: 900 !important;
}

.modern-message-success .el-message__icon {
  color: white !important;
}

.dark .custom-subject-dialog .el-dialog__footer {
  border-top-color: #334155 !important;
}

.custom-select .el-select__wrapper {
  background-color: #f8fafc !important;
  border-radius: 12px !important;
  padding: 8px 12px !important;
  border: 1px solid #f1f5f9 !important;
  box-shadow: none !important;
}

/* Custom Select */
.custom-select-v3 .el-select__wrapper {
  background-color: #f8fafc !important;
  border-radius: 16px !important;
  padding: 8px 16px !important;
  border: 1px solid #f1f5f9 !important;
  box-shadow: none !important;
  min-height: 44px !important;
}

/* Animations */
.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.video-preview-dialog {
  background: transparent !important;
  box-shadow: none !important;
}

.video-preview-dialog .el-dialog__header {
  display: block !important;
  padding: 0 !important;
}

.video-preview-dialog .el-dialog__body {
  padding: 0 !important;
}

.video-preview-dialog .el-dialog__headerbtn {
  top: -40px !important;
  right: -40px !important;
  width: 40px !important;
  height: 40px !important;
  background: rgba(255, 255, 255, 0.2) !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.video-preview-dialog .el-dialog__headerbtn .el-dialog__close {
  color: white !important;
  font-size: 20px !important;
}
</style>
