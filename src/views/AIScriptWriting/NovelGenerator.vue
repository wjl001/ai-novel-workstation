<template>
  <div class="novel-generator h-full overflow-hidden flex flex-col transition-colors duration-300" :class="isLight ? 'bg-slate-50 text-slate-800' : 'bg-slate-900 text-slate-50'">
    <StepIndicator :active-index="activeStepIndex" />
    
    <div class="flex-1 flex overflow-hidden">
      <!-- Left Sidebar: Project Info & Actions (Redesigned) -->
      <aside class="w-80 border-r flex flex-col overflow-y-auto p-0 gap-0 transition-colors duration-300 relative z-10" :class="isLight ? 'bg-white border-slate-200' : 'bg-[#0f172a] border-slate-800'">
        
        <!-- Back Button -->
        <div class="p-4 pb-0">
          <el-button link class="hover:text-indigo-500 mb-2" :class="isLight ? 'text-slate-500' : 'text-slate-300 hover:text-white'" @click="handleBack">
            <el-icon class="mr-1"><ArrowLeft /></el-icon> 返回上一步
          </el-button>
        </div>

        <!-- Cover Area -->
        <div class="aspect-[2/3] rounded-xl relative group overflow-hidden shadow-lg border transition-all duration-300" :class="isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-700'">
          <img v-if="coverUrl" :src="coverUrl" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div v-else class="w-full h-full flex flex-col items-center justify-center" :class="isLight ? 'text-slate-400' : 'text-slate-200'">
            <el-icon :size="48" class="mb-2"><Picture /></el-icon>
            <span class="text-sm">AI 封面生成中...</span>
          </div>
          
          <!-- Hover Actions -->
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4 backdrop-blur-sm" :class="isLight ? 'bg-white/60' : 'bg-slate-900/80'">
             <el-button type="primary" size="small" class="!bg-indigo-600 border-none shadow-md" @click="generateCover">
               <el-icon class="mr-1"><MagicStick /></el-icon> AI 重新生成
             </el-button>
             <el-upload
               action="#"
               :auto-upload="false"
               :show-file-list="false"
               :on-change="handleCoverUpload"
             >
               <el-button size="small" :class="isLight ? '!bg-white !text-slate-700 !border-slate-300' : '!bg-slate-700 !border-slate-600 !text-slate-300 hover:!text-white'">上传封面</el-button>
             </el-upload>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <!-- Project Stats -->
          <div class="grid grid-cols-2 gap-3">
            <div class="p-4 rounded-2xl border transition-all duration-300 group hover:-translate-y-1 h-24 flex flex-col justify-between" :class="isLight ? 'bg-slate-50 border-slate-200 shadow-sm' : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-indigo-500/30'">
              <div class="text-xs font-medium flex items-center gap-1" :class="isLight ? 'text-slate-500' : 'text-slate-300'">
                <el-icon><Edit /></el-icon> 作品字数
              </div>
              <div class="text-lg font-bold tracking-tight" :class="isLight ? 'text-slate-900' : 'text-white'">0</div>
            </div>
            <div class="p-4 rounded-2xl border transition-all duration-300 group hover:-translate-y-1 h-24 flex flex-col justify-between" :class="isLight ? 'bg-slate-50 border-slate-200 shadow-sm' : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-purple-500/30'">
               <div class="text-xs font-medium flex items-center gap-1" :class="isLight ? 'text-slate-500' : 'text-slate-300'">
                 <el-icon><Timer /></el-icon> 预计完本
               </div>
               <div class="text-lg font-bold tracking-tight" :class="isLight ? 'text-slate-900' : 'text-white'">20-50万字</div>
            </div>
          </div>
          
          <!-- Progress -->
          <div class="space-y-2">
             <div class="flex justify-between text-xs" :class="isLight ? 'text-slate-500' : 'text-slate-300'">
               <span>大纲完成度</span>
               <span>{{ outlines.length > 0 ? '100%' : '0%' }}</span>
             </div>
             <div class="h-2 rounded-full overflow-hidden" :class="isLight ? 'bg-slate-100' : 'bg-slate-800'">
               <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000" :style="{ width: outlines.length > 0 ? '100%' : '5%' }"></div>
             </div>
          </div>

          <!-- Quick Actions (Bottom) -->
          <div class="space-y-3 pt-4 border-t" :class="isLight ? 'border-slate-100' : 'border-slate-800'">
             <div class="text-xs font-bold uppercase tracking-wider mb-2" :class="isLight ? 'text-slate-400' : 'text-slate-400'">快捷操作</div>
             <el-button class="w-full !h-12 !rounded-xl !justify-start !font-medium transition-all group" :class="isLight ? '!bg-white !text-slate-600 !border-slate-200 hover:!border-indigo-300 hover:!text-indigo-600 shadow-sm' : '!bg-slate-800/60 !text-slate-200 !border-slate-700/60 hover:!bg-slate-800 hover:!border-indigo-500/50 hover:!text-indigo-400'" @click="showSettingsDialog = true">
               <div class="w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-colors" :class="isLight ? 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600' : 'bg-slate-700/50 text-slate-300 group-hover:bg-indigo-500/20 group-hover:text-indigo-400'">
                 <el-icon><Setting /></el-icon>
               </div>
               作品设置
             </el-button>
             <el-button class="w-full !h-12 !rounded-xl !justify-start !font-medium transition-all group" :class="isLight ? '!bg-white !text-slate-600 !border-slate-200 hover:!border-indigo-300 hover:!text-indigo-600 shadow-sm' : '!bg-slate-800/60 !text-slate-200 !border-slate-700/60 hover:!bg-slate-800 hover:!border-indigo-500/50 hover:!text-indigo-400'" @click="exportScript">
               <div class="w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-colors" :class="isLight ? 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600' : 'bg-slate-700/50 text-slate-300 group-hover:bg-indigo-500/20 group-hover:text-indigo-400'">
                 <el-icon><Download /></el-icon>
               </div>
               导出大纲
             </el-button>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 overflow-y-auto custom-scrollbar transition-colors duration-300 relative" :class="isLight ? 'bg-slate-50' : 'bg-slate-900'">
        <div class="max-w-5xl mx-auto p-8">
          
          <!-- Step 1: Outline Generation -->
          <transition name="el-fade-in-linear">
            <div v-if="step === 'outline'" class="space-y-6 pb-24">
              <!-- Hero Banner -->
              <div class="p-8 rounded-2xl shadow-lg relative overflow-hidden border transition-all" :class="isLight ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-indigo-400' : 'bg-gradient-to-r from-indigo-900 to-purple-900 text-white border-indigo-500/30'">
                <div class="absolute top-0 right-0 p-8 opacity-10">
                  <el-icon :size="120"><Notebook /></el-icon>
                </div>
                <h2 class="text-3xl font-bold mb-3 tracking-tight">AI 智能大纲生成</h2>
                <p class="max-w-xl text-sm opacity-90 leading-relaxed">
                  基于您的设定，AI 正在构建故事骨架。您可以随时修改、调整顺序，或者让 AI 重新发散思维。
                </p>
              </div>

              <!-- Outline List -->
              <div class="rounded-xl shadow-sm border transition-colors" :class="isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'">
                <div class="p-4 border-b flex justify-between items-center rounded-t-xl" :class="isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-700'">
                  <span class="font-bold" :class="isLight ? 'text-slate-700' : 'text-slate-100'">章节大纲预览</span>
                  <el-tag type="info" size="small" effect="dark" :class="isLight ? '!bg-slate-200 !border-slate-300 !text-slate-600' : '!bg-slate-700 !border-slate-600 !text-slate-200'">共 {{ outlines.length }} 章</el-tag>
                </div>
                
                <div v-loading="isGeneratingOutline" :element-loading-background="isLight ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.7)'" class="divide-y min-h-[300px]" :class="isLight ? 'divide-slate-100' : 'divide-slate-700'">
                  <div v-for="(item, index) in outlines" :key="index" class="p-5 group transition-colors" :class="isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-700/50'">
                    <div class="flex gap-5">
                      <div class="w-12 pt-1 flex flex-col items-center">
                        <span class="text-xs font-bold font-mono" :class="isLight ? 'text-slate-400' : 'text-slate-400'">CH.{{ index + 1 }}</span>
                        <div class="h-full w-px my-2 group-last:hidden" :class="isLight ? 'bg-slate-200' : 'bg-slate-700'"></div>
                      </div>
                      <div class="flex-1">
                        <div class="flex items-center justify-between mb-2">
                          <input 
                            v-model="item.title" 
                            class="font-bold text-lg bg-transparent border-none focus:ring-0 p-0 w-full"
                            :class="isLight ? 'text-slate-800 placeholder-slate-400' : 'text-slate-100 placeholder-slate-500'"
                          />
                          <div class="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                             <el-button size="small" circle text :class="isLight ? '!text-indigo-600 hover:!bg-indigo-50' : '!text-indigo-400 hover:!text-indigo-300'" @click="regenerateSingleChapter(index)">
                               <el-icon><Refresh /></el-icon>
                             </el-button>
                             <el-button size="small" circle text :class="isLight ? '!text-blue-600 hover:!bg-blue-50' : '!text-blue-400 hover:!text-blue-300'" @click="viewChapterDetail(index)">
                               <el-icon><View /></el-icon>
                             </el-button>
                             <el-button size="small" circle text type="danger" @click="removeChapter(index)">
                               <el-icon><Delete /></el-icon>
                             </el-button>
                          </div>
                        </div>
                        <textarea 
                          v-model="item.summary" 
                          class="w-full text-base bg-transparent border-none resize-y focus:ring-0 p-2 leading-relaxed rounded-md"
                          :class="isLight ? 'text-slate-700 placeholder-slate-400 hover:bg-slate-100' : 'text-slate-100 placeholder-slate-500 hover:bg-slate-700/30'"
                          rows="4"
                        ></textarea>
                        <div class="mt-3 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                           <el-button size="small" type="primary" plain :class="isLight ? '!bg-indigo-50 !border-indigo-200 !text-indigo-600 hover:!bg-indigo-100' : '!bg-indigo-500/10 !border-indigo-500/30 !text-indigo-400 hover:!bg-indigo-500/20'" @click="regenerateSingleChapter(index)">
                             <el-icon class="mr-1"><MagicStick /></el-icon> AI 重新生成本章
                           </el-button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Add Chapter Button -->
                  <div class="p-4 text-center">
                    <el-button text type="primary" :class="isLight ? '!text-slate-500 hover:!text-indigo-600' : '!text-slate-300 hover:!text-indigo-400'" @click="addChapter">
                      <el-icon class="mr-1"><Plus /></el-icon> 添加章节
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </transition>

          <!-- Step 2: Chapter Management (Details) -->
          <transition name="el-fade-in-linear">
            <div v-if="step === 'chapters'" class="space-y-6 pb-24">
              
              <!-- Top Actions Bar -->
              <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold" :class="isLight ? 'text-slate-800' : 'text-white'">章节列表</h2>
              </div>

              <!-- Summary Card -->
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="p-4 rounded-xl shadow-sm border flex items-center gap-3 transition-colors" :class="isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'">
                   <div class="w-10 h-10 rounded-full flex items-center justify-center border" :class="isLight ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'">
                     <el-icon><List /></el-icon>
                   </div>
                   <div>
                     <div class="text-sm" :class="isLight ? 'text-slate-500' : 'text-slate-300'">总章节</div>
                     <div class="font-bold text-lg" :class="isLight ? 'text-slate-900' : 'text-white'">{{ outlines.length }} 章</div>
                   </div>
                </div>
                <div class="p-4 rounded-xl shadow-sm border flex items-center gap-3 transition-colors" :class="isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'">
                   <div class="w-10 h-10 rounded-full flex items-center justify-center border" :class="isLight ? 'bg-green-50 text-green-600 border-green-100' : 'bg-green-500/10 text-green-400 border-green-500/20'">
                     <el-icon><Check /></el-icon>
                   </div>
                   <div>
                     <div class="text-sm" :class="isLight ? 'text-slate-500' : 'text-slate-300'">已完成</div>
                     <div class="font-bold text-lg" :class="isLight ? 'text-slate-900' : 'text-white'">0 章</div>
                   </div>
                </div>
                <div class="p-4 rounded-xl shadow-sm border flex items-center gap-3 transition-colors" :class="isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'">
                   <div class="w-10 h-10 rounded-full flex items-center justify-center border" :class="isLight ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'">
                     <el-icon><Timer /></el-icon>
                   </div>
                   <div>
                     <div class="text-sm" :class="isLight ? 'text-slate-500' : 'text-slate-300'">最近更新</div>
                     <div class="font-bold text-lg" :class="isLight ? 'text-slate-900' : 'text-white'">刚刚</div>
                   </div>
                </div>
                <!-- Batch Script Button -->
                <div class="p-4 rounded-xl shadow-lg border flex items-center gap-3 cursor-pointer hover:scale-[1.02] transition-transform group" :class="isLight ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-indigo-500' : 'bg-gradient-to-br from-indigo-900 to-purple-900 text-white border-indigo-500/30'" @click="openBatchScriptDialog">
                   <div class="w-10 h-10 rounded-full flex items-center justify-center border transition-colors" :class="isLight ? 'bg-white/20 text-white border-white/30' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 group-hover:bg-indigo-500 group-hover:text-white'">
                     <el-icon><VideoCamera /></el-icon>
                   </div>
                   <div>
                     <div class="text-sm opacity-90">一键对接</div>
                     <div class="font-bold text-lg">批量短剧</div>
                   </div>
                </div>
              </div>

              <!-- Chapter List -->
              <div class="rounded-xl shadow-sm border transition-colors" :class="isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'">
                <div class="p-4 border-b flex justify-between items-center" :class="isLight ? 'border-slate-100' : 'border-slate-700'">
                  <h3 class="font-bold" :class="isLight ? 'text-slate-700' : 'text-white'">章节列表</h3>
                  <div class="flex gap-2">
                    <el-button size="small" :class="isLight ? '!bg-slate-100 !border-slate-200 !text-slate-600' : '!bg-slate-700 !border-slate-600 !text-slate-300 hover:!text-white'">倒序</el-button>
                    <el-button size="small" type="primary" plain :class="isLight ? '!bg-indigo-50 !border-indigo-200 !text-indigo-600' : '!bg-indigo-500/10 !border-indigo-500/30 !text-indigo-400 hover:!bg-indigo-500/20'">批量生成</el-button>
                  </div>
                </div>

                <div class="divide-y" :class="isLight ? 'divide-slate-100' : 'divide-slate-700'">
                   <div v-for="(item, index) in outlines" :key="index" class="p-4 flex items-center justify-between transition-colors" :class="isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-700/50'">
                      <div>
                        <div class="font-medium mb-1" :class="isLight ? 'text-slate-800' : 'text-slate-100'">第 {{ index + 1 }} 章 {{ item.title }}</div>
                        <div class="text-xs flex items-center gap-3" :class="isLight ? 'text-slate-500' : 'text-slate-400'">
                           <span>0 字</span>
                           <span class="w-1 h-1 rounded-full" :class="isLight ? 'bg-slate-300' : 'bg-slate-500'"></span>
                           <span class="text-orange-400">未完成</span>
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                         <el-button size="small" round :class="isLight ? '!bg-purple-50 !border-purple-200 !text-purple-600 hover:!bg-purple-100' : '!bg-purple-500/10 !border-purple-500/30 !text-purple-300 hover:!bg-purple-500/20'" @click="aiWriteChapter(index)">
                           <el-icon class="mr-1"><MagicStick /></el-icon> AI 撰写
                         </el-button>
                         <el-button size="small" round plain :class="isLight ? '!bg-slate-100 !border-slate-200 !text-slate-600 hover:!bg-slate-200' : '!bg-slate-700 !border-slate-600 !text-slate-300 hover:!text-white'" @click="goToEditor(index)">
                           <el-icon class="mr-1"><Edit /></el-icon> 手写
                         </el-button>
                         <el-button size="small" round :class="isLight ? '!bg-orange-50 !border-orange-200 !text-orange-600 hover:!bg-orange-100' : '!bg-orange-500/10 !border-orange-500/30 !text-orange-300 hover:!bg-orange-500/20'" @click="openScriptDialog(index)">
                           <el-icon class="mr-1"><VideoCamera /></el-icon> 对接短剧
                         </el-button>
                         <el-dropdown trigger="click">
                           <el-button size="small" circle text :class="isLight ? '!text-slate-400 hover:!text-slate-600' : '!text-slate-400 hover:!text-white'">
                             <el-icon><MoreFilled /></el-icon>
                           </el-button>
                           <template #dropdown>
                             <el-dropdown-menu :class="isLight ? '' : 'dark-dropdown'">
                               <el-dropdown-item>重命名</el-dropdown-item>
                               <el-dropdown-item class="text-red-500">删除</el-dropdown-item>
                             </el-dropdown-menu>
                           </template>
                         </el-dropdown>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </transition>

        </div>

        <!-- Sticky Bottom Bar -->
        <div class="sticky bottom-0 w-full backdrop-blur-md border-t z-50 transition-all duration-300" :class="isLight ? 'bg-white/90 border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]' : 'bg-slate-900/90 border-slate-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)]'">
          <div class="max-w-5xl mx-auto px-8 py-4 flex items-center justify-between">
             <!-- Left Info -->
             <div class="flex items-center gap-4 text-sm" :class="isLight ? 'text-slate-500' : 'text-slate-400'">
               <div v-if="step === 'outline'" class="flex items-center gap-2">
                  <el-icon class="text-indigo-500"><Notebook /></el-icon>
                  <span>已生成 {{ outlines.length }} 章大纲</span>
               </div>
               <div v-else class="flex items-center gap-2">
                  <el-icon class="text-green-500"><Check /></el-icon>
                  <span>大纲已确认</span>
               </div>
             </div>

             <!-- Right Actions -->
             <div class="flex items-center gap-4">
                <template v-if="step === 'outline'">
                   <el-button plain size="large" class="!h-12 !px-6 !rounded-xl !font-bold transition-all" :class="isLight ? '!bg-white !border-slate-200 !text-slate-600 hover:!border-indigo-300 hover:!text-indigo-600' : '!bg-slate-800 !border-slate-700 !text-slate-300 hover:!bg-slate-700 hover:!text-white'" @click="regenerateOutline">
                      <el-icon class="mr-2"><Refresh /></el-icon> 重新生成
                   </el-button>
                   <el-button type="primary" size="large" class="!h-12 !px-8 !rounded-xl !font-bold shadow-lg shadow-indigo-500/30 !bg-[#4f46e5] !border-[#4f46e5] hover:!bg-[#4338ca] hover:!border-[#4338ca] hover:-translate-y-0.5 transition-all" @click="confirmOutline">
                      确认大纲 <el-icon class="ml-2"><ArrowRight /></el-icon>
                   </el-button>
                </template>
                <template v-else>
                   <el-button type="primary" size="large" class="!h-12 !px-8 !rounded-xl !font-bold shadow-lg shadow-indigo-500/30 !bg-[#4f46e5] !border-[#4f46e5] hover:!bg-[#4338ca] hover:!border-[#4338ca] hover:-translate-y-0.5 transition-all" @click="goToEditor()">
                      <el-icon class="mr-2"><EditPen /></el-icon> 进入写作模式
                   </el-button>
                </template>
             </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Chapter Detail Dialog -->
    <el-dialog v-model="showDetailDialog" title="章节详情" width="600px" :class="isLight ? '' : 'dark-dialog'">
      <div v-if="currentDetailIndex !== -1">
        <el-form label-position="top">
          <el-form-item label="章节标题">
            <el-input v-model="outlines[currentDetailIndex].title" :class="isLight ? '' : 'dark-input'" />
          </el-form-item>
          <el-form-item label="章节概要">
            <el-input 
              v-model="outlines[currentDetailIndex].summary" 
              type="textarea" 
              :rows="8" 
              :class="isLight ? '' : 'dark-textarea'"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="flex justify-between w-full">
           <el-button type="primary" plain :class="isLight ? '!bg-indigo-50 !border-indigo-200 !text-indigo-600' : '!bg-indigo-500/10 !border-indigo-500/30 !text-indigo-400 hover:!bg-indigo-500/20'" @click="regenerateSingleChapter(currentDetailIndex)">
             <el-icon class="mr-1"><MagicStick /></el-icon> AI 重新生成
           </el-button>
           <div>
             <el-button @click="showDetailDialog = false" :class="isLight ? '' : '!bg-slate-700 !border-slate-600 !text-slate-300 hover:!text-white'">关闭</el-button>
             <el-button type="primary" @click="showDetailDialog = false" :class="isLight ? '' : '!bg-indigo-600 border-none'">保存</el-button>
           </div>
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

    <!-- Script Dialog -->
    <el-dialog v-model="showScriptDialog" title="AI 短剧剧本导出" width="800px" :class="isLight ? '' : 'dark-dialog'">
      <div class="flex flex-col h-[500px]">
        <div class="mb-4 p-3 rounded text-sm flex items-start gap-2 border" :class="isLight ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-slate-800 border-slate-700 text-slate-400'">
           <el-icon class="mt-0.5" :class="isLight ? 'text-blue-600' : 'text-indigo-400'"><InfoFilled /></el-icon>
           <div>AI 已根据章节内容自动转换为短剧分镜脚本格式，支持一键导出。此格式可直接用于下游 AI 视频生成工具。</div>
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
        <div class="flex justify-between items-center w-full">
           <div class="flex items-center gap-2">
             <span class="text-sm text-slate-400">推送到项目：</span>
             <el-select 
               v-model="selectedDownstreamProject" 
               placeholder="选择下游短剧项目" 
               class="w-48"
               :class="isLight ? '' : 'dark-select'"
               size="default"
               :effect="isLight ? 'light' : 'dark'"
             >
               <el-option
                 v-for="item in downstreamProjects"
                 :key="item.id"
                 :label="item.title"
                 :value="item.id"
               />
             </el-select>
             <el-button 
               type="success" 
               plain 
               :loading="isPushingToDraft"
               :disabled="!selectedDownstreamProject"
               :class="isLight ? '' : '!bg-green-500/10 !border-green-500/30 !text-green-400 hover:!bg-green-500/20'"
               @click="pushToDraft"
             >
               <el-icon class="mr-1"><Promotion /></el-icon> 推送草稿
             </el-button>
           </div>
           
           <div class="flex gap-2">
              <el-button @click="showScriptDialog = false" :class="isLight ? '' : '!bg-slate-700 !border-slate-600 !text-slate-300 hover:!text-white'">关闭</el-button>
              <el-button type="primary" @click="exportScript" :class="isLight ? '' : '!bg-indigo-600 border-none'">
                 <el-icon class="mr-1"><Download /></el-icon> 导出剧本
              </el-button>
           </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ArrowLeft, ArrowRight, Refresh, EditPen, Picture, MagicStick, 
  Setting, Download, Notebook, Delete, Plus, List, Check, Timer, Edit, MoreFilled, CircleCheck, View, VideoCamera, InfoFilled, Promotion
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useLoreStore } from '@/stores/useLoreStore'
import StepIndicator from '@/components/StepIndicator.vue'

const isLight = inject('isLight', ref(false))
const route = useRoute()
const router = useRouter()
const loreStore = useLoreStore()

// State
const step = ref<'outline' | 'chapters'>('outline')
const coverUrl = ref('')
const isGeneratingOutline = ref(false)
const saveStatus = ref('')
const showDetailDialog = ref(false)
const showSettingsDialog = ref(false)
const showScriptDialog = ref(false)
const scriptContent = ref('')
const currentDetailIndex = ref(-1)
const currentScriptChapterIndex = ref(-1)

// Mock Downstream Projects
const downstreamProjects = ref([
  { id: 'p1', title: '《霸道总裁爱上我》短剧版' },
  { id: 'p2', title: '《重生之豪门复仇》' },
  { id: 'p3', title: '《都市龙王》' },
  { id: 'p4', title: '新建短剧项目...' }
])
const selectedDownstreamProject = ref('')
const isPushingToDraft = ref(false)

interface OutlineItem {
  title: string
  summary: string
}

const outlines = ref<OutlineItem[]>([])

// Computed
const currentStepLabel = computed(() => {
  return step.value === 'outline' ? '大纲生成' : '章节管理'
})

const activeStepIndex = computed(() => {
  return step.value === 'outline' ? 1 : 2
})

const handleBack = () => {
  if (step.value === 'chapters') {
    step.value = 'outline'
  } else {
    router.push({ path: '/ai-write-novel', query: { mode: 'create' } })
  }
}

// Lifecycle
onMounted(() => {
  if (route.query.step === 'chapters') {
    step.value = 'chapters'
    // Restore from store if available
    if (loreStore.currentNovel.chapters.length > 0) {
      outlines.value = loreStore.currentNovel.chapters.map(c => ({
        title: c.title,
        summary: c.outline || ''
      }))
    }
  } else {
    generateOutline()
  }
  generateCover()
})

// Methods
const generateCover = async () => {
  coverUrl.value = ''
  // Simulate AI generation
  setTimeout(() => {
    coverUrl.value = 'https://picsum.photos/600/900?random=' + Date.now()
  }, 100) // Reduced delay for better UX
}

const handleCoverUpload = (file: any) => {
  coverUrl.value = URL.createObjectURL(file.raw)
}

const generateOutline = async () => {
  isGeneratingOutline.value = true
  outlines.value = []
  
  // Simulate streaming AI response
  const mockChapters = [
    { title: "霓虹雨下的交易", summary: "V接到了中间人‘老船长’的电话，前往歌舞伎区的一个地下诊所取一份神秘的数据芯片。雨夜中，他感觉有人在跟踪自己。" },
    { title: "荒坂塔的阴影", summary: "芯片解码失败，V不得不寻求黑客朋友T-Bug的帮助。T-Bug发现芯片内竟藏着荒坂公司的最高机密——‘灵魂杀手’2.0的源代码。" },
    { title: "生死时速", summary: "荒坂的特工部队突袭了藏身处，T-Bug牺牲，V带着芯片驾驶跑车在夜之城的高速公路上展开了一场惊心动魄的追逐战。" },
    { title: "潜入", summary: "为了彻底摆脱追杀，V决定反其道而行之，潜入荒坂塔底层的数据中心，试图从源头抹除自己的追踪痕迹。" },
    { title: "觉醒", summary: "在数据中心，V意外激活了芯片中的AI人格。那个传说中的黑客之神‘奥特’的声音在他脑海中响起：‘醒醒，武士，我们要把这座城市烧成灰。’" }
  ]

  for (const chapter of mockChapters) {
    await new Promise(resolve => setTimeout(resolve, 800))
    outlines.value.push(chapter)
  }
  
  isGeneratingOutline.value = false
  saveStatus.value = '大纲已自动保存'
}

const regenerateOutline = () => {
  generateOutline()
}

const regenerateSingleChapter = (index: number) => {
  ElMessage.info(`正在重新构思第 ${index + 1} 章...`)
  // Mock update
  setTimeout(() => {
    outlines.value[index].summary = "（AI 重新生成的剧情走向...）" + outlines.value[index].summary.substring(0, 10) + "..."
  }, 1000)
}

const viewChapterDetail = (index: number) => {
  currentDetailIndex.value = index
  showDetailDialog.value = true
}

const removeChapter = (index: number) => {
  outlines.value.splice(index, 1)
}

const addChapter = () => {
  outlines.value.push({
    title: "新章节",
    summary: "请输入章节概要..."
  })
}

const confirmOutline = () => {
  step.value = 'chapters'
  saveStatus.value = '大纲已确认'
  
  // Sync to store
  loreStore.currentNovel.chapters = outlines.value.map((o, i) => ({
    id: Date.now().toString() + i,
    title: o.title,
    outline: o.summary,
    content: ''
  }))
  
  ElMessage.success('大纲已确认，进入章节管理')
}

const aiWriteChapter = (index: number) => {
  ElMessage.success(`AI 开始撰写第 ${index + 1} 章...`)
  // Navigate to editor with auto-write param
  router.push({
    path: `/editor/${Date.now()}`,
    query: { 
      chapterTitle: outlines.value[index].title,
      autoStart: 'true' 
    }
  })
}

const goToEditor = (index?: number) => {
  router.push(`/editor/${Date.now()}`)
}

const openBatchScriptDialog = () => {
  currentScriptChapterIndex.value = -1 // -1 indicates batch mode
  let script = `【短剧剧本集】${loreStore.currentNovel.title}\n`
  script += `共 ${outlines.value.length} 集\n`
  script += `================================\n\n`
  
  outlines.value.forEach((chapter, index) => {
    script += `第 ${index + 1} 集：${chapter.title}\n`
    script += `时长：1-2分钟\n`
    script += `--------------------------------\n`
    
    script += `【SCENE 01】\n`
    const summaryParts = chapter.summary.split(/，|。/)
    script += `场景：${summaryParts[0] || '未知场景'}\n`
    script += `时间：夜\n`
    script += `人物：主角，配角\n\n`
    
    script += `【ACTION】\n`
    script += `(镜头推进) ${chapter.summary}\n\n`
    
    script += `主角\n`
    script += `(神情紧张)\n`
    script += `这就是那个...传说中的东西？\n\n`
    
    script += `反派\n`
    script += `(冷笑)\n`
    script += `你以为你能带走它？\n\n`
    
    script += `【CUT】\n\n`
    script += `================================\n\n`
  })
  
  scriptContent.value = script
  selectedDownstreamProject.value = '' // Reset selection
  showScriptDialog.value = true
}

const openScriptDialog = (index: number) => {
  currentScriptChapterIndex.value = index
  const chapter = outlines.value[index]
  
  // 简单的剧本格式生成逻辑 (Mock)
  let script = `【短剧剧本】${loreStore.currentNovel.title}\n`
  script += `第 ${index + 1} 集：${chapter.title}\n`
  script += `时长：1-2分钟\n`
  script += `--------------------------------\n\n`
  
  script += `【SCENE 01】\n`
  // 尝试提取场景信息
  const summaryParts = chapter.summary.split(/，|。/)
  script += `场景：${summaryParts[0] || '未知场景'}\n`
  script += `时间：夜\n`
  script += `人物：主角，配角\n\n`
  
  script += `【ACTION】\n`
  script += `(镜头推进) ${chapter.summary}\n\n`
  
  script += `主角\n`
  script += `(神情紧张)\n`
  script += `这就是那个...传说中的东西？\n\n`
  
  script += `反派\n`
  script += `(冷笑)\n`
  script += `你以为你能带走它？\n\n`
  
  script += `【CUT】\n`
  
  scriptContent.value = script
  selectedDownstreamProject.value = '' // Reset selection
  showScriptDialog.value = true
}

const exportScript = () => {
  navigator.clipboard.writeText(scriptContent.value).then(() => {
    ElMessage.success('短剧剧本已复制到剪贴板')
  }).catch(() => {
    ElMessage.success('导出成功')
  })
}

const pushToDraft = () => {
  if (!selectedDownstreamProject.value) {
    ElMessage.warning('请选择要推送的短剧项目')
    return
  }
  
  isPushingToDraft.value = true
  // Simulate API call
  setTimeout(() => {
    isPushingToDraft.value = false
    const project = downstreamProjects.value.find(p => p.id === selectedDownstreamProject.value)
    ElMessage.success(`已成功推送至项目「${project?.title}」的草稿箱`)
    showScriptDialog.value = false
  }, 1500)
}
</script>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #94a3b8;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

/* Global Dialog Styles */
:deep(.dark-dialog) {
  background-color: #1e293b !important; /* slate-800 */
  border: 1px solid #334155 !important;
  border-radius: 16px !important;
}
:deep(.dark-dialog .el-dialog__title) {
  color: #f1f5f9 !important;
  font-size: 1.1rem;
}
:deep(.dark-dialog .el-dialog__body) {
  color: #e2e8f0 !important;
  font-size: 1rem;
}
:deep(.dark-descriptions .el-descriptions__label) {
  background-color: #0f172a !important; /* slate-900 */
  color: #cbd5e1 !important; /* slate-300 */
  font-weight: 600;
}
:deep(.dark-descriptions .el-descriptions__content) {
  background-color: #1e293b !important; /* slate-800 */
  color: #f1f5f9 !important; /* slate-100 */
  font-size: 1rem;
}
:deep(.dark-input .el-input__wrapper), :deep(.dark-textarea .el-textarea__inner) {
  background-color: #0f172a;
  box-shadow: 0 0 0 1px #334155;
  color: #f1f5f9; /* slate-100 */
}
:deep(.dark-dropdown) {
  background-color: #1e293b;
  border: 1px solid #334155;
}
:deep(.dark-select .el-input__wrapper) {
  background-color: #0f172a;
  box-shadow: 0 0 0 1px #334155;
}
:deep(.dark-select .el-input__inner) {
  color: #f1f5f9; /* slate-100 */
}
/* Custom Select Styling */
:deep(.custom-dark-select .el-select__wrapper) {
  background-color: #0f172a !important; /* slate-900 */
  box-shadow: 0 0 0 1px #334155 !important;
}
:deep(.custom-dark-select .el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #6366f1 !important; /* indigo-500 */
}
:deep(.custom-dark-select .el-select__placeholder) {
  color: #cbd5e1; /* slate-300 */
}
</style>