<template>
  <div class="novel-generator aisw-scale h-full overflow-hidden flex flex-col transition-colors duration-300" :class="isLight ? 'bg-slate-50 text-slate-800' : 'bg-slate-900 text-slate-50'">
    <StepIndicator :active-index="activeStepIndex" />
    
    <div class="flex-1 flex overflow-hidden">
      <!-- Main Content Area (Full Width) -->
      <main class="flex-1 overflow-y-auto custom-scrollbar transition-colors duration-300 relative" :class="isLight ? 'bg-slate-50' : 'bg-slate-900'">
        <div class="max-w-full mx-auto p-8 min-h-full flex flex-col">
          
          <!-- Step 1: Outline Generation -->
          <transition name="el-fade-in-linear">
            <div v-if="step === 'outline'" class="space-y-6 flex-1 flex flex-col">
              <div class="flex items-center justify-between mb-2">
                <el-button link :class="isLight ? 'text-slate-600 hover:text-indigo-600' : 'text-slate-300 hover:text-indigo-300'" @click="handleBack">
                  <el-icon class="mr-1"><ArrowLeft /></el-icon> 返回基础设置
                </el-button>
              </div>
              <!-- Hero Banner (Compact Row) -->
              <div class="flex items-center gap-6 p-4 rounded-xl border transition-all" :class="isLight ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700'">
                <!-- Cover Image (Mini) -->
                <div class="w-20 h-28 flex-shrink-0 rounded-lg relative group overflow-hidden shadow-sm border transition-all" :class="isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-700'">
                   <img v-if="coverUrl" :src="coverUrl" class="w-full h-full object-cover" @error="useFallbackCover" />
                   <div v-else class="w-full h-full flex flex-col items-center justify-center" :class="isLight ? 'text-slate-400' : 'text-slate-200'">
                     <el-icon :size="24"><Picture /></el-icon>
                   </div>
                   
                   <!-- Hover Actions -->
                   <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1 backdrop-blur-sm" :class="isLight ? 'bg-white/80' : 'bg-slate-900/80'">
                      <el-button link type="primary" size="small" @click="generateCover">重绘</el-button>
                      <el-upload action="#" :auto-upload="false" :show-file-list="false" :on-change="handleCoverUpload">
                        <el-button link size="small">上传</el-button>
                      </el-upload>
                   </div>
                </div>

                <!-- Title & Info -->
                <div class="flex-1">
                   <h1 class="text-xl font-bold mb-1" :class="isLight ? 'text-slate-900' : 'text-white'">{{ loreStore.currentNovel.title || '未命名作品' }}</h1>
                   <div class="text-sm opacity-70 mb-2" :class="isLight ? 'text-slate-500' : 'text-slate-400'">{{ loreStore.currentNovel.genre }} · {{ loreStore.currentNovel.episodeCount }}集</div>
                   <div class="flex items-center gap-2">
                      <el-tag size="small" effect="plain" :type="isLight ? 'primary' : 'info'">AI 智能大纲生成中</el-tag>
                      <el-button link size="small" type="primary" @click="showSettingsDialog = true">
                        <el-icon class="mr-1"><Setting /></el-icon> 作品设置
                      </el-button>
                   </div>
                </div>
              </div>

              <!-- Outline List -->
              <div class="rounded-xl shadow-sm border transition-colors flex-1" :class="isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'">
                <div class="p-4 border-b flex justify-between items-center rounded-t-xl" :class="isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-700'">
                  <span class="font-bold" :class="isLight ? 'text-slate-700' : 'text-slate-100'">剧集大纲预览</span>
                  <el-tag type="info" size="small" effect="dark" :class="isLight ? '!bg-slate-200 !border-slate-300 !text-slate-600' : '!bg-slate-700 !border-slate-600 !text-slate-200'">共 {{ outlines.length }} 集</el-tag>
                </div>
                
                <div v-loading="isGeneratingOutline" :element-loading-background="isLight ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.7)'" class="divide-y min-h-[260px]" :class="isLight ? 'divide-slate-100' : 'divide-slate-700'">
                  <div v-for="(item, index) in outlines" :key="index" class="p-4 group transition-colors relative" :class="isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-700/50'">
                    <div class="flex gap-4">
                      <div class="w-10 pt-1 flex flex-col items-center">
                        <span class="text-xs font-bold font-mono" :class="isLight ? 'text-slate-400' : 'text-slate-400'">第{{ index + 1 }}集</span>
                        <div class="h-full w-px my-2 group-last:hidden" :class="isLight ? 'bg-slate-200' : 'bg-slate-700'"></div>
                      </div>
                      <div class="flex-1">
                        <div class="flex items-center justify-between gap-3 mb-2">
                          <div class="flex-1 flex items-center gap-2">
                            <input 
                              v-model="item.title" 
                              class="font-bold text-base bg-transparent border-none focus:ring-0 p-0 w-full"
                              :class="isLight ? 'text-slate-800 placeholder-slate-400' : 'text-slate-100 placeholder-slate-500'"
                            />
                            <div class="flex items-center gap-1.5 shrink-0">
                              <el-button size="small" round class="!h-7 !px-2.5 !text-xs !border-slate-200 !bg-white hover:!border-indigo-300 hover:!text-indigo-600" :class="isLight ? '' : '!bg-slate-800 !border-slate-700 !text-slate-300 hover:!text-indigo-300'" @click="openMetaDialog('scene', index)">
                                <el-icon class="mr-1"><Picture /></el-icon> 场景
                              </el-button>
                              <el-button size="small" round class="!h-7 !px-2.5 !text-xs !border-slate-200 !bg-white hover:!border-indigo-300 hover:!text-indigo-600" :class="isLight ? '' : '!bg-slate-800 !border-slate-700 !text-slate-300 hover:!text-indigo-300'" @click="openMetaDialog('roles', index)">
                                <el-icon class="mr-1"><UserFilled /></el-icon> 角色
                              </el-button>
                              <el-button size="small" round class="!h-7 !px-2.5 !text-xs !border-slate-200 !bg-white hover:!border-indigo-300 hover:!text-indigo-600" :class="isLight ? '' : '!bg-slate-800 !border-slate-700 !text-slate-300 hover:!text-indigo-300'" @click="openMetaDialog('props', index)">
                                <el-icon class="mr-1"><Promotion /></el-icon> 道具
                              </el-button>
                              <el-button size="small" round class="!h-7 !px-2.5 !text-xs !border-slate-200 !bg-white hover:!border-indigo-300 hover:!text-indigo-600" :class="isLight ? '' : '!bg-slate-800 !border-slate-700 !text-slate-300 hover:!text-indigo-300'" @click="openMetaDialog('conflict', index)">
                                <el-icon class="mr-1"><CircleCheck /></el-icon> 冲突
                              </el-button>
                              <el-button size="small" round class="!h-7 !px-2.5 !text-xs !border-slate-200 !bg-white hover:!border-indigo-300 hover:!text-indigo-600" :class="isLight ? '' : '!bg-slate-800 !border-slate-700 !text-slate-300 hover:!text-indigo-300'" @click="openMetaDialog('hook', index)">
                                <el-icon class="mr-1"><Timer /></el-icon> 黄金3秒
                              </el-button>
                              <el-button size="small" round class="!h-7 !px-2.5 !text-xs !border-slate-200 !bg-white hover:!border-indigo-300 hover:!text-indigo-600" :class="isLight ? '' : '!bg-slate-800 !border-slate-700 !text-slate-300 hover:!text-indigo-300'" @click="openMetaDialog('relation', index)">
                                <el-icon class="mr-1"><UserFilled /></el-icon> 关系图谱
                              </el-button>
                            </div>
                          </div>
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
                          class="w-full text-sm bg-transparent border-none resize-y focus:ring-0 p-2 leading-relaxed rounded-md"
                          :class="isLight ? 'text-slate-700 placeholder-slate-400 hover:bg-slate-100' : 'text-slate-100 placeholder-slate-500 hover:bg-slate-700/30'"
                          rows="3"
                        ></textarea>
                        <div class="mt-2 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                           <div class="flex gap-2">
                             <el-button size="small" link type="primary" :class="isLight ? '!text-indigo-500 hover:!text-indigo-600' : '!text-indigo-400 hover:!text-indigo-300'" @click="addChapter(index + 1)">
                               <el-icon class="mr-1"><Plus /></el-icon> 插入新集
                             </el-button>
                             <el-button size="small" type="primary" plain :class="isLight ? '!bg-indigo-50 !border-indigo-200 !text-indigo-600 hover:!bg-indigo-100' : '!bg-indigo-500/10 !border-indigo-500/30 !text-indigo-400 hover:!bg-indigo-500/20'" @click="regenerateSingleChapter(index)">
                               <el-icon class="mr-1"><MagicStick /></el-icon> AI 重新生成
                             </el-button>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Add Chapter Button -->
                  <div class="p-4 text-center">
                    <el-button text type="primary" :class="isLight ? '!text-slate-500 hover:!text-indigo-600' : '!text-slate-300 hover:!text-indigo-400'" @click="addChapter(undefined)">
                      <el-icon class="mr-1"><Plus /></el-icon> 添加剧集
                    </el-button>
                  </div>
                </div>
              </div>
              
              <!-- Sticky Bottom Bar (Within Outline Step) -->
              <div class="sticky bottom-0 z-40 py-4 -mx-8 px-8 backdrop-blur-md transition-colors border-t mt-6 flex items-center justify-end gap-4" :class="isLight ? 'bg-white/90 border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]' : 'bg-slate-900/90 border-slate-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)]'">
                 <div class="text-sm mr-auto flex items-center gap-2" :class="isLight ? 'text-slate-500' : 'text-slate-400'">
                    <el-icon class="text-indigo-500"><Notebook /></el-icon>
                    <span>已生成 {{ outlines.length }} 集大纲</span>
                 </div>
                 
                 <el-button plain size="large" class="!h-12 !px-6 !rounded-xl !font-bold transition-all" :class="isLight ? '!bg-white !border-slate-200 !text-slate-600 hover:!border-indigo-300 hover:!text-indigo-600' : '!bg-slate-800 !border-slate-700 !text-slate-300 hover:!bg-slate-700 hover:!text-white'" @click="regenerateOutline">
                    <el-icon class="mr-2"><Refresh /></el-icon> 重新生成
                 </el-button>
                 <el-button type="primary" size="large" class="!h-12 !px-8 !rounded-xl !font-bold shadow-lg shadow-indigo-500/30 !bg-[#4f46e5] !border-[#4f46e5] hover:!bg-[#4338ca] hover:!border-[#4338ca] hover:-translate-y-0.5 transition-all" @click="confirmOutline">
                    确认大纲 <el-icon class="ml-2"><ArrowRight /></el-icon>
                 </el-button>
              </div>

            </div>
          </transition>

          <!-- Step 2: Chapter Management (Full Screen) -->
          <transition name="el-fade-in-linear">
            <div v-if="step === 'chapters'" class="flex-1 flex flex-col h-full overflow-hidden">
               <!-- Stats Row: small and compact, shares line with cover -->
               <div class="grid grid-cols-4 gap-3 mb-3 items-center">
                  <div class="p-3 rounded-xl border flex items-center gap-3 transition-all hover:-translate-y-0.5 cursor-pointer group" :class="isLight ? 'bg-white border-slate-200 shadow-sm hover:border-indigo-300' : 'bg-slate-800 border-slate-700 shadow-lg hover:border-indigo-500/50'" @click="handleBack">
                     <div class="w-9 h-9 rounded-full flex items-center justify-center transition-colors group-hover:bg-indigo-500/20" :class="isLight ? 'bg-slate-50 text-slate-500 group-hover:text-indigo-600' : 'bg-slate-700/50 text-slate-400 group-hover:text-indigo-400'">
                        <el-icon :size="18"><ArrowLeft /></el-icon>
                     </div>
                     <div>
                        <div class="text-xs opacity-60" :class="isLight ? 'text-slate-500' : 'text-slate-400'">返回</div>
                        <div class="text-lg font-bold" :class="isLight ? 'text-slate-800' : 'text-white'">大纲列表</div>
                     </div>
                  </div>
                  <div class="p-3 rounded-xl border flex items-center gap-3 transition-all hover:-translate-y-0.5" :class="isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-800 border-slate-700 shadow-lg'">
                     <div class="w-9 h-9 rounded-full flex items-center justify-center" :class="isLight ? 'bg-blue-50 text-blue-600' : 'bg-blue-500/20 text-blue-400'">
                        <el-icon :size="18"><List /></el-icon>
                     </div>
                     <div>
                        <div class="text-xs opacity-60" :class="isLight ? 'text-slate-500' : 'text-slate-400'">总集数</div>
                        <div class="text-lg font-bold" :class="isLight ? 'text-slate-800' : 'text-white'">{{ outlines.length }} 集</div>
                     </div>
                  </div>
                  <div class="p-3 rounded-xl border flex items-center gap-3 transition-all hover:-translate-y-0.5" :class="isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-800 border-slate-700 shadow-lg'">
                     <div class="w-9 h-9 rounded-full flex items-center justify-center" :class="isLight ? 'bg-green-50 text-green-600' : 'bg-green-500/20 text-green-400'">
                        <el-icon :size="18"><CircleCheck /></el-icon>
                     </div>
                     <div>
                        <div class="text-xs opacity-60" :class="isLight ? 'text-slate-500' : 'text-slate-400'">已完成</div>
                        <div class="text-lg font-bold" :class="isLight ? 'text-slate-800' : 'text-white'">0 集</div>
                     </div>
                  </div>
                  <!-- Batch Action Card (Compact) -->
                  <div class="p-3 rounded-xl border border-dashed flex flex-col justify-center items-center cursor-pointer transition-all hover:scale-[1.02] group shadow-lg" :class="isLight ? 'bg-indigo-50 border-indigo-300 shadow-indigo-100' : 'bg-indigo-900/20 border-indigo-500/50 shadow-indigo-900/20'" @click="openBatchScriptDialog">
                      <div class="text-indigo-500 font-bold mb-1 group-hover:scale-105 transition-transform flex items-center text-base">
                         <el-icon class="mr-2"><VideoCamera /></el-icon> 批量短剧转换
                      </div>
                      <div class="text-xs opacity-80 text-center" :class="isLight ? 'text-indigo-400' : 'text-indigo-300'">转换为分镜脚本</div>
                  </div>
               </div>

               <!-- Chapter List -->
               <div class="flex-1 overflow-hidden rounded-2xl border shadow-inner flex flex-col" :class="isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'">
                  <div class="p-4 border-b flex justify-between items-center" :class="isLight ? 'border-slate-100 bg-slate-50' : 'border-slate-700 bg-slate-800'">
                     <h3 class="font-bold text-lg" :class="isLight ? 'text-slate-700' : 'text-white'">剧集列表</h3>
                     <div class="flex gap-2">
                        <el-button size="small" :class="isLight ? '' : '!bg-slate-700 !border-slate-600 !text-slate-300'">倒序</el-button>
                        <el-button size="small" type="primary" plain :class="isLight ? '' : '!bg-indigo-500/20 !border-indigo-500/50 !text-indigo-300'">批量生成</el-button>
                     </div>
                  </div>
                  <div class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                      <div v-for="(item, index) in outlines" :key="index" class="p-4 rounded-xl flex items-center justify-between transition-colors border group" :class="isLight ? 'hover:bg-indigo-50 border-slate-100 hover:border-indigo-100' : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700 hover:border-indigo-500/30'">
                         <div class="flex items-center gap-4 flex-1">
                            <el-checkbox v-model="item.isSelected" size="large" @click.stop />
                            <div>
                                <div class="font-bold text-lg mb-1 flex items-center" :class="isLight ? 'text-slate-800' : 'text-slate-200 group-hover:text-indigo-300'">
                                  <span class="opacity-50 mr-3 text-base font-normal">第 {{ index + 1 }} 集</span>
                                  {{ item.title }}
                                </div>
                                <div class="text-sm line-clamp-1 max-w-2xl" :class="isLight ? 'text-slate-400' : 'text-slate-500 group-hover:text-slate-400'">
                                  <span class="mr-2 inline-block w-1.5 h-1.5 rounded-full" :class="item.summary ? 'bg-orange-500' : 'bg-slate-600'"></span>
                                  {{ item.summary || '暂无概要' }}
                                </div>
                                <!-- Insert Chapter Button (Hover) -->
                                <div class="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <el-button size="small" link type="primary" :class="isLight ? '!text-indigo-500 hover:!text-indigo-600' : '!text-indigo-400 hover:!text-indigo-300'" @click="addChapter(index + 1)">
                                     <el-icon class="mr-1"><Plus /></el-icon> 在下方插入新集
                                   </el-button>
                                </div>
                             </div>
                         </div>
                         <div class="flex items-center gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                            <el-tag size="small" :type="item.hasContent ? 'success' : (item.summary ? 'warning' : 'info')" effect="dark" class="mr-2">
                               {{ item.hasContent ? '已完成' : (item.summary ? '待撰写' : '待设定') }}
                            </el-tag>
                            <el-button size="default" round class="!px-4 transition-transform hover:scale-105" :class="isLight ? '' : '!bg-indigo-600 !border-indigo-500 !text-white shadow-lg shadow-indigo-500/20'" @click="aiWriteChapter(index)">
                              <el-icon class="mr-1"><MagicStick /></el-icon> AI 撰写
                            </el-button>
                            <el-button size="default" round class="!px-4" :class="isLight ? '' : '!bg-slate-700 !border-slate-600 !text-slate-300 hover:!text-white'" @click="goToEditor(index)">
                              <el-icon class="mr-1"><Edit /></el-icon> 手写
                            </el-button>
                            <el-button size="default" round class="!px-4" type="warning" plain :class="isLight ? '' : '!bg-orange-500/10 !border-orange-500/30 !text-orange-400 hover:!bg-orange-500/20'" @click="openScriptDialog(index)">
                              <el-icon class="mr-1"><VideoCamera /></el-icon> 对接短剧
                            </el-button>
                            
                            <el-dropdown trigger="click">
                              <el-button circle size="default" :class="isLight ? '' : '!bg-slate-700 !border-slate-600 !text-slate-400 hover:!text-white'">
                                <el-icon><MoreFilled /></el-icon>
                              </el-button>
                              <template #dropdown>
                                <el-dropdown-menu>
                                  <el-dropdown-item @click="viewChapterDetail(index)"><el-icon><View /></el-icon> 查看详情</el-dropdown-item>
                                  <el-dropdown-item @click="regenerateSingleChapter(index)"><el-icon><Refresh /></el-icon> 重生成概要</el-dropdown-item>
                                  <el-dropdown-item divided class="!text-red-500" @click="removeChapter(index)"><el-icon><Delete /></el-icon> 删除剧集</el-dropdown-item>
                                </el-dropdown-menu>
                              </template>
                            </el-dropdown>
                         </div>
                      </div>
                   </div>
                   
                   <!-- Add Chapter Button -->
                   <div class="p-4 border-t" :class="isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'">
                      <el-button class="w-full !h-12 !text-lg !rounded-xl border-dashed transition-all" :class="isLight ? '!bg-white !border-slate-300 !text-slate-500 hover:!border-indigo-500 hover:!text-indigo-600' : '!bg-slate-800/50 !border-slate-600 !text-slate-400 hover:!bg-slate-800 hover:!border-indigo-500/50 hover:!text-indigo-400'" @click="addChapter">
                        <el-icon class="mr-2"><Plus /></el-icon> 添加新剧集
                      </el-button>
                   </div>
               </div>
               
               <!-- Bottom Action Bar (Chapter Mode) -->
               <div class="sticky bottom-0 z-40 py-4 -mx-8 px-8 backdrop-blur-md transition-colors border-t mt-6 flex items-center justify-end gap-4" :class="isLight ? 'bg-white/90 border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]' : 'bg-slate-900/90 border-slate-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)]'">
                 <div class="text-sm mr-auto flex items-center gap-2" :class="isLight ? 'text-slate-500' : 'text-slate-400'">
                    <el-icon class="text-green-500"><Check /></el-icon>
                    <span>大纲已确认</span>
                 </div>
                 
                 <el-button type="primary" size="large" class="!h-12 !px-8 !rounded-xl !font-bold shadow-lg shadow-indigo-500/30 !bg-[#4f46e5] !border-[#4f46e5] hover:!bg-[#4338ca] hover:!border-[#4338ca] hover:-translate-y-0.5 transition-all" @click="goToEditor()">
                    <el-icon class="mr-2"><EditPen /></el-icon> 进入写作模式
                 </el-button>
              </div>

            </div>
          </transition>

        </div>
      </main>
    </div>

    <!-- Chapter Detail Dialog -->
    <el-dialog v-model="showDetailDialog" title="剧集详情" width="600px" :class="isLight ? '' : 'dark-dialog'">
      <div v-if="currentDetailIndex !== -1">
        <el-form label-position="top">
          <el-form-item label="剧集标题">
            <el-input v-model="outlines[currentDetailIndex].title" :class="isLight ? '' : 'dark-input'" />
          </el-form-item>
          <el-form-item label="剧集概要">
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
             <el-button type="primary" @click="saveChapterDetail" :class="isLight ? '' : '!bg-indigo-600 border-none'">保存</el-button>
           </div>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="showMetaDialog" :title="metaDialogTitle" width="520px" :class="isLight ? '' : 'dark-dialog'">
      <div class="space-y-2">
        <div v-for="(line, idx) in metaDialogItems" :key="idx" class="px-3 py-2 rounded text-sm border" :class="isLight ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-slate-900 text-slate-300 border-slate-700'">
          {{ line }}
        </div>
      </div>
      <template #footer>
        <el-button @click="showMetaDialog = false" :class="isLight ? '' : '!bg-slate-700 !border-slate-600 !text-slate-300 hover:!text-white'">关闭</el-button>
      </template>
    </el-dialog>

    <!-- Settings Dialog -->
    <el-dialog v-model="showSettingsDialog" title="作品设置" width="900px" :class="isLight ? '' : 'dark-dialog'">
      <div class="grid grid-cols-2 gap-6">
        <el-descriptions :column="1" border :class="isLight ? '' : 'dark-descriptions'">
          <el-descriptions-item label="作品名称">{{ loreStore.currentNovel.title }}</el-descriptions-item>
          <el-descriptions-item label="题材">{{ loreStore.currentNovel.genre }}</el-descriptions-item>
          <el-descriptions-item label="生成集数">{{ loreStore.currentNovel.episodeCount }}</el-descriptions-item>
          <el-descriptions-item label="每集时长">{{ loreStore.currentNovel.episodeDuration }}分钟</el-descriptions-item>
          <el-descriptions-item label="目标受众">{{ loreStore.currentNovel.targetAudience }}</el-descriptions-item>
          <el-descriptions-item label="模型">{{ loreStore.currentNovel.model }}</el-descriptions-item>
          <el-descriptions-item label="是否长记忆">{{ loreStore.currentNovel.longMemory ? '是' : '否' }}</el-descriptions-item>
          <el-descriptions-item label="叙事风格">{{ loreStore.currentNovel.style || '未设定' }}</el-descriptions-item>
          <el-descriptions-item label="视角">{{ loreStore.currentNovel.perspective || '未设定' }}</el-descriptions-item>
          <el-descriptions-item label="标签">{{ (loreStore.currentNovel.tags || []).join('，') || '未设定' }}</el-descriptions-item>
        </el-descriptions>
        <div class="space-y-4">
          <div>
            <div class="text-sm text-slate-400 mb-2">作品简介（Premise）</div>
            <div class="p-3 rounded text-sm max-h-32 overflow-y-auto border custom-scrollbar" :class="isLight ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-slate-900 text-slate-300 border-slate-700'">{{ loreStore.currentNovel.premise || '无' }}</div>
          </div>
          <div>
            <div class="text-sm text-slate-400 mb-2">世界观设定</div>
            <div class="p-3 rounded text-sm max-h-32 overflow-y-auto border custom-scrollbar" :class="isLight ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-slate-900 text-slate-300 border-slate-700'">{{ loreStore.currentNovel.worldView || '无' }}</div>
          </div>
          <div>
            <div class="text-sm text-slate-400 mb-2">核心金手指</div>
            <div class="p-3 rounded text-sm max-h-32 overflow-y-auto border custom-scrollbar" :class="isLight ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-slate-900 text-slate-300 border-slate-700'">{{ loreStore.currentNovel.goldenFinger || '无' }}</div>
          </div>
          <div>
            <div class="text-sm text-slate-400 mb-2">主线剧情（Main Plot）</div>
            <div class="p-3 rounded text-sm max-h-32 overflow-y-auto border custom-scrollbar" :class="isLight ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-slate-900 text-slate-300 border-slate-700'">{{ loreStore.currentNovel.mainPlot || '未设定' }}</div>
          </div>
          <div>
            <div class="text-sm text-slate-400 mb-2">剧情梗概（Synopsis）</div>
            <div class="p-3 rounded text-sm max-h-32 overflow-y-auto border custom-scrollbar" :class="isLight ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-slate-900 text-slate-300 border-slate-700'">{{ loreStore.currentNovel.synopsis || '未设定' }}</div>
          </div>
          <div>
            <div class="text-sm text-slate-400 mb-2">角色设定（Character Info）</div>
            <div class="p-3 rounded text-sm max-h-32 overflow-y-auto border custom-scrollbar" :class="isLight ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-slate-900 text-slate-300 border-slate-700'">{{ loreStore.currentNovel.characterInfo || '未设定' }}</div>
          </div>
        </div>
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
           <div>AI 已根据剧集内容自动转换为短剧分镜脚本格式，支持一键导出。此格式可直接用于下游 AI 视频生成工具。</div>
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
             <el-button type="primary" plain :class="isLight ? '' : '!bg-indigo-600/20 !border-indigo-500/30 !text-indigo-300'" @click="goToVideoStudio">
               <el-icon class="mr-1"><VideoCamera /></el-icon> 前往AI创作视频
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
import { ref, computed, onMounted, inject, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ArrowLeft, ArrowRight, Refresh, EditPen, Picture, MagicStick, 
  Setting, Download, Notebook, Delete, Plus, List, Check, Timer, Edit, MoreFilled, CircleCheck, View, VideoCamera, InfoFilled, Promotion, UserFilled
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useLoreStore, type Chapter } from '@/stores/useLoreStore'
import StepIndicator from '@/components/StepIndicator.vue'

const isLight = inject('isLight', ref(false))
const theme = inject('theme', ref('dark'))
const route = useRoute()
const router = useRouter()
const loreStore = useLoreStore()

const bgClass = computed(() => {
  if (theme.value === 'dreamy') return 'bg-transparent text-slate-800'
  return isLight.value ? 'bg-slate-50 text-slate-800' : 'bg-slate-900 text-slate-50'
})

const mainClass = computed(() => {
  if (theme.value === 'dreamy') return 'bg-transparent'
  return isLight.value ? 'bg-slate-50' : 'bg-slate-900'
})

const cardClass = computed(() => {
  if (theme.value === 'dreamy') return 'bg-white/60 border-white/50 shadow-sm backdrop-blur-sm'
  return isLight.value ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700'
})

const outlineListClass = computed(() => {
  if (theme.value === 'dreamy') return 'bg-white/60 border-white/50 shadow-sm backdrop-blur-sm'
  return isLight.value ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'
})

const outlineHeaderClass = computed(() => {
  if (theme.value === 'dreamy') return 'bg-white/40 border-white/50'
  return isLight.value ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-700'
})

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
  isSelected?: boolean
  hasContent?: boolean
  id?: string
}

const outlines = ref<OutlineItem[]>([])
const showMetaDialog = ref(false)
const metaDialogTitle = ref('')
const metaDialogItems = ref<string[]>([])

const mapChaptersToOutlines = (chapters: Chapter[]) => {
  return chapters.map(c => ({
    id: c.id,
    title: c.title,
    summary: c.outline || '',
    isSelected: true,
    hasContent: !!c.content && c.content.length > 20 // 简单的完成判定
  }))
}

const openMetaDialog = (type: 'scene' | 'roles' | 'props' | 'conflict' | 'hook' | 'relation', index: number) => {
  const chapter = outlines.value[index]
  const summary = chapter?.summary?.replace(/\s+/g, ' ') || '暂无'
  const brief = summary.length > 50 ? summary.slice(0, 50) + '…' : summary
  const title = chapter?.title ? `CH.${index + 1} ${chapter.title}` : `CH.${index + 1}`

  const config = {
    scene: {
      title: `场景 · 关键地点`,
      items: [
        `场景摘要：${brief}`,
        `地点提示：${summary.includes('雨') ? '雨夜街区' : '未知地点'}`,
        `氛围：紧张 · 悬疑 · 快节奏`
      ]
    },
    roles: {
      title: `角色 · 主角/盟友`,
      items: [
        `核心人物：主角 · 盟友 · 反派`,
        `角色动机：围绕“${chapter?.title || '目标' }”展开`,
        `角色关系：对立与合作并存`
      ]
    },
    props: {
      title: `道具 · 关键物件`,
      items: [
        `关键道具：数据芯片 / 信物 / 机密文档`,
        `用途提示：推动冲突升级`,
        `出现时机：剧情转折点`
      ]
    },
    conflict: {
      title: `核心冲突`,
      items: [
        `冲突主题：争夺 / 背叛 / 逃脱`,
        `矛盾焦点：${brief}`,
        `对抗走向：逐步升级`
      ]
    },
    hook: {
      title: `黄金3秒`,
      items: [
        `开场钩子：强对比画面 + 紧迫音效`,
        `短爆点：一句高压台词或突发事件`,
        `目标：3秒内抓住注意力`
      ]
    },
    relation: {
      title: `人物关系图谱`,
      items: [
        `主角 → 盟友：目标一致，互相试探`,
        `主角 ↔ 反派：核心对立，利益冲突`,
        `盟友 → 反派：潜在背叛或双面身份`
      ]
    }
  }[type]

  metaDialogTitle.value = `${title} · ${config.title}`
  metaDialogItems.value = config.items
  showMetaDialog.value = true
}

const syncOutlinesFromChapters = () => {
  if (loreStore.currentNovel.chapters && loreStore.currentNovel.chapters.length > 0) {
    outlines.value = [...mapChaptersToOutlines(loreStore.currentNovel.chapters)]
  }
}

const hydrateChaptersFromSessionCache = () => {
  const cache = sessionStorage.getItem('novel_generator_chapters_cache')
  if (!cache) return
  
  try {
    const parsed = JSON.parse(cache)
    if (Array.isArray(parsed) && parsed.length > 0) {
      // 只有当 store 中没有数据，或者缓存中的数据更多时才更新
      if (!loreStore.currentNovel.chapters || loreStore.currentNovel.chapters.length === 0) {
        loreStore.currentNovel.chapters = parsed
      }
    }
  } catch (error) {
    console.error('Failed to parse chapters cache:', error)
  } finally {
    // 成功读取一次后就清除，防止干扰其他会话
    sessionStorage.removeItem('novel_generator_chapters_cache')
  }
}

// Computed
const currentStepLabel = computed(() => {
  return step.value === 'outline' ? '大纲生成' : '剧集管理'
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
  generateCover()
})

// Consolidated Route Initialization Logic
watch(() => route.query, (query) => {
  const stepQuery = Array.isArray(query.step) ? query.step[0] : query.step
  
  if (stepQuery === 'chapters') {
    step.value = 'chapters'
    hydrateChaptersFromSessionCache()
    syncOutlinesFromChapters()
  } else {
    // 强制设为 outline 步骤，防止显示空白
    step.value = 'outline'
    
    if (stepQuery === 'settings') {
      showSettingsDialog.value = true
    }
    
    // 如果没有大纲数据，则自动生成
    // 检查 Store 和当前 outlines 列表
    if (loreStore.currentNovel.chapters.length === 0 && outlines.value.length === 0 && !isGeneratingOutline.value) {
      generateOutline()
    } else if (loreStore.currentNovel.chapters.length > 0 && outlines.value.length === 0) {
      // 如果 Store 有数据但列表没同步，手动触发同步
      syncOutlinesFromChapters()
    }
  }
}, { immediate: true, deep: true })

// Sync outlines with store changes
watch(() => loreStore.currentNovel.chapters, (newChapters) => {
  if (newChapters && newChapters.length > 0) {
    outlines.value = [...mapChaptersToOutlines(newChapters)]
  } else {
    // 如果 Store 中没有章节数据，清空当前大纲列表
    outlines.value = []
  }
}, { deep: true, immediate: true })

// Methods
const generateCover = async () => {
  coverUrl.value = ''
  // Simulate AI generation
  setTimeout(() => {
    coverUrl.value = defaultCover()
  }, 100) // Reduced delay for better UX
}

const handleCoverUpload = (file: any) => {
  coverUrl.value = URL.createObjectURL(file.raw)
}

const defaultCover = () => {
  const title = encodeURIComponent(loreStore.currentNovel.title || '未命名作品')
  const svg = `
  <svg xmlns='http://www.w3.org/2000/svg' width='600' height='900'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='#4f46e5'/>
        <stop offset='100%' stop-color='#0ea5e9'/>
      </linearGradient>
    </defs>
    <rect width='100%' height='100%' fill='url(#g)'/>
    <rect x='40' y='40' width='520' height='820' rx='24' fill='rgba(255,255,255,0.12)'/>
    <text x='50' y='120' font-size='40' fill='#ffffff' font-family='Arial, sans-serif'>${title}</text>
  </svg>`
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg)
}

const useFallbackCover = () => {
  coverUrl.value = defaultCover()
}
async function generateOutline() {
  isGeneratingOutline.value = true
  if (loreStore.currentNovel.chapters.length > 0) {
    outlines.value = mapChaptersToOutlines(loreStore.currentNovel.chapters)
    isGeneratingOutline.value = false
  } else {
    outlines.value = []
    isGeneratingOutline.value = true
    try {
      // Simulate streaming AI response
      const mockChapters = [
      { title: "烽火初燃 血洗村庄", summary: "边境村庄被毁，主角立誓复仇" },
      { title: "牢狱结义 共谋越狱", summary: "狱中结识豪杰，策划逃亡" },
      { title: "越狱风云 暗道逃生", summary: "利用暗道躲避追兵" },
      { title: "揭竿而起 聚民为军", summary: "黑风岭起义" },
      { title: "初战告捷 反抗伊始", summary: "设伏大破官兵" }
    ]

    for (const chapter of mockChapters) {
      await new Promise(resolve => setTimeout(resolve, 800))
      outlines.value.push(chapter)
    }
    saveStatus.value = '大纲已自动保存'
  } catch (e) {
    console.error(e)
    ElMessage.error('生成大纲失败，请重试')
  } finally {
    isGeneratingOutline.value = false
  }
  } // End else
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

const saveChapterDetail = () => {
  if (currentDetailIndex.value === -1) return
  
  const item = outlines.value[currentDetailIndex.value]
  // 同步回 Store
  if (item.id) {
    loreStore.updateChapter(item.id, {
      title: item.title,
      outline: item.summary
    })
  } else {
    // 如果没有 ID，说明是新添加的但还没同步过，可以重新同步整个列表
    syncOutlinesToStore()
  }
  
  showDetailDialog.value = false
  ElMessage.success('保存成功')
}

const syncOutlinesToStore = () => {
  loreStore.currentNovel.chapters = outlines.value.map((o, i) => ({
    id: o.id || (Date.now().toString() + i),
    title: o.title,
    outline: o.summary,
    content: loreStore.currentNovel.chapters.find(c => c.id === o.id)?.content || ''
  }))
}

const removeChapter = (index: number) => {
  outlines.value.splice(index, 1)
  syncOutlinesToStore()
}

const addChapter = (index?: number | MouseEvent) => {
  const newChapter = {
    title: "新剧集",
    summary: "请输入剧集概要...",
    isSelected: true
  }
  
  if (typeof index === 'number') {
    outlines.value.splice(index, 0, newChapter)
  } else {
    outlines.value.push(newChapter)
  }
  syncOutlinesToStore()
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
  
  ElMessage.success('大纲已确认，进入剧集管理')
}

const aiWriteChapter = (index: number) => {
  ElMessage.success(`AI 开始撰写第 ${index + 1} 集...`)
  
  // Sync all chapters to store before navigating
  loreStore.currentNovel.chapters = outlines.value.map((o, i) => ({
    id: loreStore.currentNovel.chapters[i]?.id || (Date.now().toString() + i),
    title: o.title,
    outline: o.summary,
    content: loreStore.currentNovel.chapters[i]?.content || ''
  }))

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

const zhaoTieniuTitles = [
  '烽火初燃 血洗村庄',
  '牢狱结义 共谋越狱',
  '越狱风云 暗道逃生',
  '揭竿而起 聚民为军',
  '初战告捷 反抗伊始'
]

const isZhaoTieniuChapter = (title: string) => {
  return zhaoTieniuTitles.includes(title)
}

const shortDramaExportTemplate = `【短剧分镜剧本集】夜之城：数据幽灵
共 5 集
================================
第 1 集：烽火初燃 血洗村庄
时长：1-2分钟
-------------------------------
【角色清单】

【男主】赵铁牛
年龄：26岁
身份：淮西铁匠/义军领袖
性格特质：暴烈如火却粗中有细，幼年随父打铁锤炼出惊人臂力，父母被杀后形成“以命换命”的搏杀风格，习惯用草绳缠柄增强武器握持力
背景故事：元至正十二年，元军强征铁器时父母反抗被杀，目睹惨状后觉醒反抗意识，成为方圆百里第一个敢正面硬刚元军的硬汉
外在表现：身高九尺满脸虬髯，常穿浸透汗渍的粗布短打，右臂纹着家传的玄铁锤图腾
音色：低沉粗犷，带火气与压抑感，咬字重，爆发力强
关系网络：与王二狗形成“猛虎配狡狐”组合，暗中倾慕医女柳三娘却不敢言明
成长弧光：从孤胆莽夫蜕变为懂得凝聚人心的领袖，学会用智谋代替蛮力
----------------------------------------
【反派】耶律齐
年龄：35岁
身份：元军百户长
性格特质：残忍狡诈的猎手，擅长用心理战瓦解对手，随身携带记录抗元义军弱点的羊皮卷，每杀一人便在刀柄系红绳
背景故事：曾是金国贵族，家族被元军灭门后反投鞑子，掌握着三套针对不同地形作战的秘传战法
外在表现：左脸有道蜈蚣状疤痕，总穿猩红披风，马鞍上挂着九个鞑靼风格的人皮鼓
音色：冷静阴沉，语速平稳但带讥讽尾音，低笑令人不寒而栗
关系网络：与王二狗有灭门之仇，视赵铁牛为值得尊重的对手，暗中策反义军中的逃兵
关键事件：初战中故意留出破绽诱敌深入，其训练的狼牙箭手造成义军重大伤亡
----------------------------------------
【道具清单】
粗麻绳（捆绑俘虏）
----------------------------------------
【场景信息】
地点：淮西村庄外荒野官道
时间：白天
天气：阴天 / 风沙
氛围：压迫、残酷、悲愤
背景环境：被焚毁的村庄在远处冒着黑烟，田地被战马践踏，尸体散落。
----------------------------------------
【分镜 01】

镜头：远景 → 缓慢推镜
画面：一支元军押送俘虏的队伍缓慢行进在荒凉的土路上
人物：赵铁牛、耶律齐、元军士兵
动作：赵铁牛被五花大绑，衣衫破碎，身上血迹斑斑。

镜头：中景（赵铁牛）
画面：赵铁牛抬头死死盯着耶律齐，眼中充满仇恨。
人物：赵铁牛
动作：咬牙低吼
对白：耶律齐！你这个卖国求荣的狗贼！

镜头：特写（耶律齐）
画面：耶律齐微微低头，露出讥讽笑容。
人物：耶律齐
动作：冷笑回应
对白：呵……就凭你？`

const buildZhaoTieniuEpisodeBlock = (episodeNumber: number, chapterTitle: string, isFirst: boolean) => {
  if (isFirst) {
    return `第 ${episodeNumber} 集：${chapterTitle}
时长：1-2分钟
-------------------------------
【角色清单】

【男主】赵铁牛
年龄：26岁
身份：淮西铁匠/义军领袖
性格特质：暴烈如火却粗中有细，幼年随父打铁锤炼出惊人臂力，父母被杀后形成“以命换命”的搏杀风格，习惯用草绳缠柄增强武器握持力
背景故事：元至正十二年，元军强征铁器时父母反抗被杀，目睹惨状后觉醒反抗意识，成为方圆百里第一个敢正面硬刚元军的硬汉
外在表现：身高九尺满脸虬髯，常穿浸透汗渍的粗布短打，右臂纹着家传的玄铁锤图腾
音色：低沉粗犷，带火气与压抑感，咬字重，爆发力强
关系网络：与王二狗形成“猛虎配狡狐”组合，暗中倾慕医女柳三娘却不敢言明
成长弧光：从孤胆莽夫蜕变为懂得凝聚人心的领袖，学会用智谋代替蛮力
----------------------------------------
【反派】耶律齐
年龄：35岁
身份：元军百户长
性格特质：残忍狡诈的猎手，擅长用心理战瓦解对手，随身携带记录抗元义军弱点的羊皮卷，每杀一人便在刀柄系红绳
背景故事：曾是金国贵族，家族被元军灭门后反投鞑子，掌握着三套针对不同地形作战的秘传战法
外在表现：左脸有道蜈蚣状疤痕，总穿猩红披风，马鞍上挂着九个鞑靼风格的人皮鼓
音色：冷静阴沉，语速平稳但带讥讽尾音，低笑令人不寒而栗
关系网络：与王二狗有灭门之仇，视赵铁牛为值得尊重的对手，暗中策反义军中的逃兵
关键事件：初战中故意留出破绽诱敌深入，其训练的狼牙箭手造成义军重大伤亡
----------------------------------------
【道具清单】
粗麻绳（捆绑俘虏）
----------------------------------------
【场景信息】
地点：淮西村庄外荒野官道
时间：白天
天气：阴天 / 风沙
氛围：压迫、残酷、悲愤
背景环境：被焚毁的村庄在远处冒着黑烟，田地被战马践踏，尸体散落。
----------------------------------------
【分镜 01】

镜头：远景 → 缓慢推镜
画面：一支元军押送俘虏的队伍缓慢行进在荒凉的土路上
人物：赵铁牛、耶律齐、元军士兵
动作：赵铁牛被五花大绑，衣衫破碎，身上血迹斑斑。

镜头：中景（赵铁牛）
画面：赵铁牛抬头死死盯着耶律齐，眼中充满仇恨。
人物：赵铁牛
动作：咬牙低吼
对白：耶律齐！你这个卖国求荣的狗贼！

镜头：特写（耶律齐）
画面：耶律齐微微低头，露出讥讽笑容。
人物：耶律齐
动作：冷笑回应
对白：呵……就凭你？`
  }

  return `第 ${episodeNumber} 集：${chapterTitle}
时长：1-2分钟
-------------------------------
【角色清单】

【男主】赵铁牛
年龄：26岁
身份：淮西铁匠/义军领袖
性格特质：暴烈如火却粗中有细，幼年随父打铁锤炼出惊人臂力，父母被杀后形成“以命换命”的搏杀风格，习惯用草绳缠柄增强武器握持力
背景故事：元至正十二年，元军强征铁器时父母反抗被杀，目睹惨状后觉醒反抗意识，成为方圆百里第一个敢正面硬刚元军的硬汉
外在表现：身高九尺满脸虬髯，常穿浸透汗渍的粗布短打，右臂纹着家传的玄铁锤图腾
音色：低沉粗犷，带火气与压抑感，咬字重，爆发力强
关系网络：与王二狗形成“猛虎配狡狐”组合，暗中倾慕医女柳三娘却不敢言明
成长弧光：从孤胆莽夫蜕变为懂得凝聚人心的领袖，学会用智谋代替蛮力
----------------------------------------
【反派】耶律齐
年龄：35岁
身份：元军百户长
性格特质：残忍狡诈的猎手，擅长用心理战瓦解对手，随身携带记录抗元义军弱点的羊皮卷，每杀一人便在刀柄系红绳
背景故事：曾是金国贵族，家族被元军灭门后反投鞑子，掌握着三套针对不同地形作战的秘传战法
外在表现：左脸有道蜈蚣状疤痕，总穿猩红披风，马鞍上挂着九个鞑靼风格的人皮鼓
音色：冷静阴沉，语速平稳但带讥讽尾音，低笑令人不寒而栗
关系网络：与王二狗有灭门之仇，视赵铁牛为值得尊重的对手，暗中策反义军中的逃兵
关键事件：初战中故意留出破绽诱敌深入，其训练的狼牙箭手造成义军重大伤亡
----------------------------------------
【道具清单】
粗麻绳（捆绑俘虏）
----------------------------------------
【场景信息】
地点：淮西村庄外荒野官道
时间：白天
天气：阴天 / 风沙
氛围：压迫、残酷、悲愤
背景环境：被焚毁的村庄在远处冒着黑烟，田地被战马践踏，尸体散落。
----------------------------------------
【分镜 01】

镜头：远景 → 缓慢推镜
画面：一支元军押送俘虏的队伍缓慢行进在荒凉的土路上
人物：赵铁牛、耶律齐、元军士兵
动作：赵铁牛被五花大绑，衣衫破碎，身上血迹斑斑。

镜头：中景（赵铁牛）
画面：赵铁牛抬头死死盯着耶律齐，眼中充满仇恨。
人物：赵铁牛
动作：咬牙低吼
对白：耶律齐！你这个卖国求荣的狗贼！

镜头：特写（耶律齐）
画面：耶律齐微微低头，露出讥讽笑容。
人物：耶律齐
动作：冷笑回应
对白：呵……就凭你？`
}

const openBatchScriptDialog = () => {
  currentScriptChapterIndex.value = -1 // -1 indicates batch mode
  const script = shortDramaExportTemplate
  
  scriptContent.value = script
  selectedDownstreamProject.value = '' // Reset selection
  showScriptDialog.value = true
}

const openScriptDialog = (index: number) => {
  currentScriptChapterIndex.value = index
  const script = shortDramaExportTemplate
  
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

const goToVideoStudio = () => {
  router.push({ path: '/script-creative', query: { from: 'generator' } })
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
