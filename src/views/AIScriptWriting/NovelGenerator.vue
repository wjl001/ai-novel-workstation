<template>
  <div class="novel-generator h-full overflow-hidden flex flex-col transition-colors duration-300" :class="isLight ? 'bg-slate-50 text-slate-800' : 'bg-slate-900 text-slate-50'">
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
                  <span class="font-bold" :class="isLight ? 'text-slate-700' : 'text-slate-100'">章节大纲预览</span>
                  <el-tag type="info" size="small" effect="dark" :class="isLight ? '!bg-slate-200 !border-slate-300 !text-slate-600' : '!bg-slate-700 !border-slate-600 !text-slate-200'">共 {{ outlines.length }} 章</el-tag>
                </div>
                
                <div v-loading="isGeneratingOutline" :element-loading-background="isLight ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.7)'" class="divide-y min-h-[300px]" :class="isLight ? 'divide-slate-100' : 'divide-slate-700'">
                  <div v-for="(item, index) in outlines" :key="index" class="p-5 group transition-colors relative" :class="isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-700/50'">
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
                        <div class="mt-3 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <!-- Insert Button -->
                           <el-button size="small" link type="primary" :class="isLight ? '!text-indigo-500 hover:!text-indigo-600' : '!text-indigo-400 hover:!text-indigo-300'" @click="addChapter(index + 1)">
                             <el-icon class="mr-1"><Plus /></el-icon> 在下方插入新章
                           </el-button>
                           
                           <el-button size="small" type="primary" plain :class="isLight ? '!bg-indigo-50 !border-indigo-200 !text-indigo-600 hover:!bg-indigo-100' : '!bg-indigo-500/10 !border-indigo-500/30 !text-indigo-400 hover:!bg-indigo-500/20'" @click="regenerateSingleChapter(index)">
                             <el-icon class="mr-1"><MagicStick /></el-icon> AI 重新生成本章
                           </el-button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Add Chapter Button -->
                  <div class="p-4 text-center">
                    <el-button text type="primary" :class="isLight ? '!text-slate-500 hover:!text-indigo-600' : '!text-slate-300 hover:!text-indigo-400'" @click="addChapter(undefined)">
                      <el-icon class="mr-1"><Plus /></el-icon> 添加章节
                    </el-button>
                  </div>
                </div>
              </div>
              
              <!-- Sticky Bottom Bar (Within Outline Step) -->
              <div class="sticky bottom-0 z-40 py-4 -mx-8 px-8 backdrop-blur-md transition-colors border-t mt-6 flex items-center justify-end gap-4" :class="isLight ? 'bg-white/90 border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]' : 'bg-slate-900/90 border-slate-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)]'">
                 <div class="text-sm mr-auto flex items-center gap-2" :class="isLight ? 'text-slate-500' : 'text-slate-400'">
                    <el-icon class="text-indigo-500"><Notebook /></el-icon>
                    <span>已生成 {{ outlines.length }} 章大纲</span>
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
                        <div class="text-xs opacity-60" :class="isLight ? 'text-slate-500' : 'text-slate-400'">总章节</div>
                        <div class="text-lg font-bold" :class="isLight ? 'text-slate-800' : 'text-white'">{{ outlines.length }} 章</div>
                     </div>
                  </div>
                  <div class="p-3 rounded-xl border flex items-center gap-3 transition-all hover:-translate-y-0.5" :class="isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-800 border-slate-700 shadow-lg'">
                     <div class="w-9 h-9 rounded-full flex items-center justify-center" :class="isLight ? 'bg-green-50 text-green-600' : 'bg-green-500/20 text-green-400'">
                        <el-icon :size="18"><CircleCheck /></el-icon>
                     </div>
                     <div>
                        <div class="text-xs opacity-60" :class="isLight ? 'text-slate-500' : 'text-slate-400'">已完成</div>
                        <div class="text-lg font-bold" :class="isLight ? 'text-slate-800' : 'text-white'">0 章</div>
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
                     <h3 class="font-bold text-lg" :class="isLight ? 'text-slate-700' : 'text-white'">章节列表</h3>
                     <div class="flex gap-2">
                        <el-button size="small" :class="isLight ? '' : '!bg-slate-700 !border-slate-600 !text-slate-300'">倒序</el-button>
                        <el-button size="small" type="primary" plain :class="isLight ? '' : '!bg-indigo-500/20 !border-indigo-500/50 !text-indigo-300'">批量生成</el-button>
                     </div>
                  </div>
                  <div class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                      <div v-for="(item, index) in outlines" :key="index" class="p-4 rounded-xl flex items-center justify-between transition-colors border group" :class="isLight ? 'hover:bg-indigo-50 border-slate-100 hover:border-indigo-100' : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700 hover:border-indigo-500/30'">
                         <div>
                            <div class="font-bold text-lg mb-1 flex items-center" :class="isLight ? 'text-slate-800' : 'text-slate-200 group-hover:text-indigo-300'">
                              <span class="opacity-50 mr-3 text-base font-normal">第 {{ index + 1 }} 章</span>
                              {{ item.title }}
                            </div>
                            <div class="text-sm line-clamp-1 max-w-2xl" :class="isLight ? 'text-slate-400' : 'text-slate-500 group-hover:text-slate-400'">
                              <span class="mr-2 inline-block w-1.5 h-1.5 rounded-full" :class="item.summary ? 'bg-orange-500' : 'bg-slate-600'"></span>
                              {{ item.summary || '暂无概要' }}
                            </div>
                            <!-- Insert Chapter Button (Hover) -->
                            <div class="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <el-button size="small" link type="primary" :class="isLight ? '!text-indigo-500 hover:!text-indigo-600' : '!text-indigo-400 hover:!text-indigo-300'" @click="addChapter(index + 1)">
                                 <el-icon class="mr-1"><Plus /></el-icon> 在下方插入新章
                               </el-button>
                            </div>
                         </div>
                         <div class="flex items-center gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                            <el-tag size="small" :type="item.summary ? 'warning' : 'info'" effect="dark" class="mr-2">
                               {{ item.summary ? '未完成' : '待设定' }}
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
                                  <el-dropdown-item divided class="!text-red-500" @click="removeChapter(index)"><el-icon><Delete /></el-icon> 删除章节</el-dropdown-item>
                                </el-dropdown-menu>
                              </template>
                            </el-dropdown>
                         </div>
                      </div>
                   </div>
                   
                   <!-- Add Chapter Button -->
                   <div class="p-4 border-t" :class="isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'">
                      <el-button class="w-full !h-12 !text-lg !rounded-xl border-dashed transition-all" :class="isLight ? '!bg-white !border-slate-300 !text-slate-500 hover:!border-indigo-500 hover:!text-indigo-600' : '!bg-slate-800/50 !border-slate-600 !text-slate-400 hover:!bg-slate-800 hover:!border-indigo-500/50 hover:!text-indigo-400'" @click="addChapter">
                        <el-icon class="mr-2"><Plus /></el-icon> 添加新章节
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
    step.value = 'outline'
    generateOutline()
  }
  generateCover()
})

// Ensure step reacts to query changes if navigated with different params
watch(() => route.query.step, (val) => {
  if (val === 'chapters') {
    step.value = 'chapters'
    if (loreStore.currentNovel.chapters.length > 0) {
      outlines.value = loreStore.currentNovel.chapters.map(c => ({
        title: c.title,
        summary: c.outline || ''
      }))
    }
  } else if (val === 'settings') {
     // If step is settings, we stay on the current view (likely outline or chapters) but open the dialog
     // Default to outline if step is just settings
     if (step.value === '') step.value = 'outline' 
     showSettingsDialog.value = true
  } else {
    step.value = 'outline'
  }
}, { immediate: true })
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
const generateOutline = async () => {
  isGeneratingOutline.value = true
  if (loreStore.currentNovel.chapters.length > 0) {
    outlines.value = loreStore.currentNovel.chapters.map(c => ({
      title: c.title,
      summary: c.outline || ''
    }))
    isGeneratingOutline.value = false
  } else {
    outlines.value = []
    isGeneratingOutline.value = true
    try {
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

const removeChapter = (index: number) => {
  outlines.value.splice(index, 1)
}

const addChapter = (index?: number | MouseEvent) => {
  const newChapter = {
    title: "新章节",
    summary: "请输入章节概要..."
  }
  
  if (typeof index === 'number') {
    outlines.value.splice(index, 0, newChapter)
  } else {
    outlines.value.push(newChapter)
  }
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

const openBatchScriptDialog = () => {
  currentScriptChapterIndex.value = -1 // -1 indicates batch mode
  let script = `【短剧分镜剧本集】${loreStore.currentNovel.title}\n`
  script += `共 ${outlines.value.length} 集\n`
  script += `================================\n\n`
  
  const roleList = loreStore.characters.length > 0 
    ? loreStore.characters.map(c => `${c.name}（${c.role}）`).join('，') 
    : '主角，配角'

  outlines.value.forEach((chapter, index) => {
    const summaryParts = chapter.summary.split(/，|。/)
    const location = summaryParts[0] || '未知场景'
    const timeHint = '夜'
    const propsGuess: string[] = []
    if (chapter.summary.match(/剑|刀/)) propsGuess.push('武器：长剑')
    if (chapter.summary.match(/车|驾驶/)) propsGuess.push('交通工具：跑车')
    if (chapter.summary.match(/酒|酒杯/)) propsGuess.push('道具：酒杯')
    if (propsGuess.length === 0) propsGuess.push('道具：待定')

    script += `第 ${index + 1} 集：${chapter.title}\n`
    script += `时长：1-2分钟\n`
    script += `--------------------------------\n\n`
    script += `【角色清单】\n${roleList}\n\n`
    script += `【道具清单】\n${propsGuess.join('；')}\n\n`
    script += `【场景信息】\n地点：${location}\n时间：${timeHint}\n氛围：紧张、悬疑\n\n`
    script += `【SCENE 01】\n镜头：中景/推镜头（Dolly In）\n人物：${roleList}\n动作：${chapter.summary}\n对白：\n  主角（紧张）：这就是传说中的东西？\n  反派（冷笑）：你以为你能带走它？\n\n`
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
  
  // 标准化短剧剧本格式（包含角色/道具/场景等要素）
  const summaryParts = chapter.summary.split(/，|。/)
  const location = summaryParts[0] || '未知场景'
  const timeHint = '夜'
  const roleList = loreStore.characters.length > 0 
    ? loreStore.characters.map(c => `${c.name}（${c.role}）`).join('，') 
    : '主角，配角'
  const propsGuess = []
  if (chapter.summary.match(/剑|刀/)) propsGuess.push('武器：长剑')
  if (chapter.summary.match(/车|驾驶/)) propsGuess.push('交通工具：跑车')
  if (chapter.summary.match(/酒|酒杯/)) propsGuess.push('道具：酒杯')
  if (propsGuess.length === 0) propsGuess.push('道具：待定')

  let script = `【短剧分镜剧本】${loreStore.currentNovel.title}\n`
  script += `第 ${index + 1} 集：${chapter.title}\n`
  script += `时长：1-2分钟\n`
  script += `================================\n\n`

  script += `【角色清单】\n${roleList}\n\n`
  script += `【道具清单】\n${propsGuess.join('；')}\n\n`
  script += `【场景信息】\n地点：${location}\n时间：${timeHint}\n氛围：紧张、悬疑\n\n`

  script += `【SCENE 01】\n`
  script += `镜头：中景/推镜头（Dolly In）\n`
  script += `人物：${roleList}\n`
  script += `动作：${chapter.summary}\n`
  script += `对白：\n  主角（紧张）：这就是传说中的东西？\n  反派（冷笑）：你以为你能带走它？\n\n`
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
