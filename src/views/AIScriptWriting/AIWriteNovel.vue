<template>
<div class="aisw-scale">
    <ProjectList 
      v-if="!isCreating"
      title="一支笔"
      description="智能辅助，激发无限创作灵感"
      type="novel"
      @create="startCreation"
      @open="openProject"
    />

    <div v-else class="h-full flex flex-col relative overflow-hidden bg-slate-50 dark:bg-slate-900">
      <!-- Top Bar: Compact Header & Step Indicator -->
      <div class="shrink-0 px-6 py-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-50">
          <div class="flex items-center gap-4">
             <el-button :icon="ArrowLeft" circle size="small" :class="isLight ? '!bg-white !border-slate-200 !text-slate-600 hover:!bg-slate-100' : '!bg-slate-800 !border-slate-700 !text-slate-300 hover:!text-white hover:!bg-slate-700'" @click="exitCreation" />
             <div>
                <h1 class="text-lg font-bold flex items-center gap-2" :class="isLight ? 'text-slate-800' : 'text-slate-100'">
                   AI剧本工坊
                   <el-tag size="small" effect="plain" round class="ml-2">基础设定</el-tag>
                </h1>
             </div>
          </div>
          
          <div class="flex-1 max-w-2xl mx-8">
             <StepIndicator :active-index="0" class="!mb-0 scale-90 origin-center" />
          </div>

          <div class="flex items-center gap-2">
             <span v-if="isSaving" class="text-xs animate-pulse text-indigo-400 mr-2">保存中...</span>
             <el-tooltip content="保存草稿" placement="bottom">
                <el-button circle size="small" :class="isLight ? '' : '!bg-slate-800 !border-slate-700 !text-slate-300 hover:!text-white'" @click="saveDraft"><el-icon><Files /></el-icon></el-button>
             </el-tooltip>
             <el-dropdown trigger="click" @command="handleExport">
               <el-button circle size="small" :class="isLight ? '' : '!bg-slate-800 !border-slate-700 !text-slate-300 hover:!text-white'"><el-icon><Download /></el-icon></el-button>
               <template #dropdown>
                 <el-dropdown-menu :class="isLight ? '' : 'dark-dropdown'">
                   <el-dropdown-item command="docx">导出 Word</el-dropdown-item>
                   <el-dropdown-item command="pdf">导出 PDF</el-dropdown-item>
                   <el-dropdown-item command="txt">导出 TXT</el-dropdown-item>
                 </el-dropdown-menu>
               </template>
             </el-dropdown>
             <el-popover placement="bottom" :width="300" trigger="click" :effect="isLight ? 'light' : 'dark'">
              <template #reference>
                <el-button circle size="small" :class="isLight ? '' : '!bg-slate-800 !border-slate-700 !text-slate-300 hover:!text-white'">
                  <el-icon><Clock /></el-icon>
                </el-button>
              </template>
              <div class="p-2">
                <h4 class="font-bold mb-2" :class="isLight ? 'text-slate-800' : 'text-slate-200'">历史版本</h4>
                <div v-if="history.length === 0" class="text-sm text-slate-500 text-center py-4">暂无历史记录</div>
                <ul v-else class="space-y-2">
                  <li v-for="(record, idx) in history" :key="idx" class="flex justify-between items-center text-sm p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer" @click="restoreVersion(record)">
                    <span class="text-slate-600 dark:text-slate-300">{{ record.time }}</span>
                    <el-tag size="small">恢复</el-tag>
                  </li>
                </ul>
              </div>
            </el-popover>
          </div>
      </div>

      <!-- Main Content: No Page Scroll -->
      <div class="flex-1 min-h-0 flex gap-0">
        <el-form ref="ruleFormRef" :model="form" :rules="rules" label-position="top" class="w-full h-full flex gap-0">
          
          <!-- Left Panel: Settings (Scrollable internally) -->
          <div class="w-[340px] shrink-0 h-full overflow-y-auto custom-scrollbar border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 pb-20">
             <div class="space-y-6">
                <!-- Genre -->
                <div id="section-genre">
                   <h3 class="font-bold mb-3 flex items-center gap-2 text-sm" :class="isLight ? 'text-slate-700' : 'text-slate-200'">
                      <span class="w-1.5 h-1.5 bg-purple-500 rounded-full"></span> 题材设定
                   </h3>
                   <el-form-item prop="genre" class="!mb-0">
                      <el-popover placement="right" :width="280" trigger="click" :effect="isLight ? 'light' : 'dark'">
                        <template #reference>
                          <el-button class="w-full !justify-between !h-10 !px-3 !rounded-lg !border transition-all" :class="isLight ? '!bg-slate-50 !border-slate-200 !text-slate-700' : '!bg-slate-800/40 !border-slate-700/50 !text-slate-200'">
                             <span :class="!form.genre && 'opacity-50'">{{ form.genre || genrePlaceholder }}</span>
                             <el-icon><ArrowDown /></el-icon>
                          </el-button>
                        </template>
                        <div class="p-2">
                           <div class="flex flex-wrap gap-2">
                             <el-tag v-for="tag in POPULAR_GENRES" :key="tag" size="small" class="cursor-pointer" :effect="isLight ? 'plain' : 'dark'" @click="selectGenre(tag); showGenreDialog=false">{{ tag }}</el-tag>
                           </div>
                           <el-button size="small" text class="w-full mt-2" @click="showGenreDialog = true">更多...</el-button>
                        </div>
                      </el-popover>
                   </el-form-item>
                </div>

                <!-- Style -->
                <div id="section-style">
                   <h3 class="font-bold mb-3 flex items-center gap-2 text-sm" :class="isLight ? 'text-slate-700' : 'text-slate-200'">
                      <span class="w-1.5 h-1.5 bg-pink-500 rounded-full"></span> 风格倾向
                   </h3>
                   <el-form-item prop="styles" class="!mb-0">
                      <div class="w-full min-h-[40px] rounded-lg border p-2 cursor-pointer transition-all flex flex-wrap gap-2 items-center" :class="isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700/50'" @click="showStyleDialog = true">
                         <span v-if="form.styles.length === 0" class="text-xs px-1 opacity-50">{{ stylePlaceholder }}</span>
                         <el-tag v-for="style in form.styles" :key="style" size="small" closable :effect="isLight ? 'light' : 'dark'" @close.stop="removeStyle(style)">{{ style }}</el-tag>
                      </div>
                   </el-form-item>
                </div>

                <!-- Audience -->
                <div id="section-audience">
                   <h3 class="font-bold mb-3 flex items-center gap-2 text-sm" :class="isLight ? 'text-slate-700' : 'text-slate-200'">
                      <span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> 核心受众
                   </h3>
                   <div class="p-1 rounded-lg flex border" :class="isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/80 border-slate-800'">
                      <div v-for="audience in audiences" :key="audience.value" class="flex-1 text-center py-1.5 text-xs font-medium cursor-pointer rounded-md transition-all" :class="form.audience === audience.value ? (isLight ? 'text-indigo-600 bg-white shadow-sm' : 'text-white bg-slate-700 shadow-sm') : 'opacity-60'" @click="form.audience = audience.value">{{ audience.label }}</div>
                   </div>
                </div>

                <!-- Narrative -->
                <div id="section-script-style">
                   <h3 class="font-bold mb-3 flex items-center gap-2 text-sm" :class="isLight ? 'text-slate-700' : 'text-slate-200'">
                      <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span> 剧本叙事
                   </h3>
                   <el-popover placement="right" :width="300" trigger="hover" :effect="isLight ? 'light' : 'dark'">
                      <template #reference>
                        <el-button class="w-full !justify-between !h-10 !px-3 !rounded-lg !border transition-all" :class="isLight ? '!bg-slate-50 !border-slate-200 !text-slate-700' : '!bg-slate-800/40 !border-slate-700/50 !text-slate-200'">
                           <span>{{ getScriptStyleLabel(form.style) || '选择叙事风格' }}</span>
                           <el-icon><ArrowDown /></el-icon>
                        </el-button>
                      </template>
                      <div class="p-2 space-y-1">
                         <div v-for="option in SCRIPT_STYLE_OPTIONS" :key="option.value" class="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer" @click="form.style = option.value">
                            <div class="font-bold text-xs">{{ option.label }}</div>
                            <div class="text-[10px] opacity-60">{{ option.desc }}</div>
                         </div>
                      </div>
                   </el-popover>
                </div>

                <!-- Tags -->
                <div>
                   <h3 class="font-bold mb-3 flex items-center gap-2 text-sm" :class="isLight ? 'text-slate-700' : 'text-slate-200'">
                      标签
                   </h3>
                   <div class="rounded-lg p-2 border min-h-[40px] cursor-pointer" :class="isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700/50'" @click="showTagDialog = true">
                      <div class="flex flex-wrap gap-2">
                         <span v-if="form.tags.length === 0" class="text-xs opacity-50">选择标签...</span>
                         <el-tag v-for="tag in form.tags" :key="tag" size="small" closable :effect="isLight ? 'light' : 'dark'" @close.stop="removeTag(tag)">{{ tag }}</el-tag>
                      </div>
                   </div>
                </div>

                <!-- Specs -->
                <div class="pt-4 border-t border-slate-100 dark:border-slate-800">
                   <h3 class="font-bold mb-3 flex items-center gap-2 text-sm" :class="isLight ? 'text-slate-700' : 'text-slate-200'">
                      <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> 剧本规格
                   </h3>
                   <div class="grid grid-cols-2 gap-3">
                      <div>
                         <div class="text-xs mb-1 opacity-70">生成集数</div>
                         <el-input-number v-model="form.episodeCount" :min="1" :max="100" size="small" class="!w-full" controls-position="right" />
                      </div>
                      <div>
                         <div class="text-xs mb-1 opacity-70">单集时长(分)</div>
                         <el-input-number v-model="form.episodeDuration" :min="1" :max="120" size="small" class="!w-full" controls-position="right" />
                      </div>
                   </div>
                </div>

                <!-- Deep Memory Engine -->
                <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                   <div class="bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl p-4 shadow-lg border border-violet-400/30 relative overflow-hidden group hover:shadow-violet-500/20 transition-all cursor-pointer">
                      <!-- Glow Effect -->
                      <div class="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>
                      
                      <div class="flex items-center justify-between mb-2 relative z-10">
                         <div class="flex items-center gap-2 text-white font-bold text-sm">
                            <el-icon class="text-white animate-pulse"><Cpu /></el-icon> 深度记忆引擎
                         </div>
                         <el-switch v-model="form.longMemory" size="small" active-color="#a855f7" />
                      </div>
                      
                      <div class="text-xs text-white/80 leading-relaxed relative z-10">
                         构建世界知识图谱，保持长篇连贯性。<span class="text-white font-bold ml-1">Pro 版已启用</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <!-- Right Panel: Creative Content (Scrollable internally) -->
          <div class="flex-1 h-full overflow-y-auto custom-scrollbar p-6 relative flex flex-col bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
             <div class="w-full h-full flex flex-col space-y-4 animate-fade-in-up pb-20">
                <!-- Title -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 group transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-indigo-200 dark:hover:border-indigo-500/30 flex items-center gap-4 shrink-0">
                   <div class="shrink-0 text-sm font-bold text-slate-500 flex items-center gap-2 w-24">
                     <span class="w-1 h-4 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span> 作品名称
                   </div>
                   <div class="flex-1 flex items-center gap-2">
                     <el-form-item prop="title" class="!mb-0 flex-1">
                        <el-input 
                          v-model="form.title" 
                          class="!text-xl font-bold custom-input-title transition-all" 
                          :class="isLight ? 'light-input' : 'dark-input'" 
                          placeholder="请输入引人注目的标题..." 
                        />
                     </el-form-item>
                     <el-button link type="primary" size="small" @click="aiHelpWrite('title')" class="hover:rotate-180 transition-transform duration-500"><el-icon class="mr-1"><Refresh /></el-icon> 换个名字</el-button>
                   </div>
                </div>

                <!-- World & Cheat Grid (Compact) -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 flex-[0.8] min-h-[160px]">
                   <!-- World View -->
                   <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col group transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-blue-300 dark:hover:border-blue-500/30 h-full relative overflow-hidden">
                      <div class="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
                      <div class="flex justify-between items-center mb-2 shrink-0 relative z-10">
                         <span class="font-bold text-sm flex items-center gap-2"><el-icon class="text-blue-400 group-hover:animate-bounce"><Place /></el-icon> 世界观设定</span>
                         <el-button size="small" type="primary" plain round @click="aiHelpWrite('worldView')" class="!px-2 !h-6 !text-xs !rounded-lg shadow-sm">AI 生成</el-button>
                      </div>
                      <div class="flex-1 min-h-0 relative z-10">
                        <el-input 
                          v-model="form.worldView" 
                          type="textarea" 
                          resize="none" 
                          :rows="4"
                          placeholder="赛博朋克 / 修仙界 / 维多利亚蒸汽朋克..." 
                          :class="isLight ? 'light-textarea h-full' : 'dark-textarea h-full'" 
                          class="h-full custom-textarea !text-sm leading-relaxed" 
                        />
                      </div>
                   </div>
                   <!-- Cheat -->
                   <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col group transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-yellow-300 dark:hover:border-yellow-500/30 h-full relative overflow-hidden">
                      <div class="absolute top-0 right-0 w-16 h-16 bg-yellow-500/5 rounded-bl-full pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
                      <div class="flex justify-between items-center mb-2 shrink-0 relative z-10">
                         <span class="font-bold text-sm flex items-center gap-2"><el-icon class="text-yellow-400 group-hover:animate-spin-slow"><Key /></el-icon> 核心金手指</span>
                         <el-button size="small" type="primary" plain round @click="aiHelpWrite('goldenFinger')" class="!px-2 !h-6 !text-xs !rounded-lg shadow-sm">AI 生成</el-button>
                      </div>
                      <div class="flex-1 min-h-0 relative z-10">
                        <el-input 
                          v-model="form.goldenFinger" 
                          type="textarea" 
                          resize="none" 
                          :rows="4"
                          placeholder="系统 / 老爷爷 / 特殊异能..." 
                          :class="isLight ? 'light-textarea h-full' : 'dark-textarea h-full'" 
                          class="h-full custom-textarea !text-sm leading-relaxed" 
                        />
                      </div>
                   </div>
                </div>

                <!-- Plot -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 group transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-red-300 dark:hover:border-red-500/30 flex-[0.8] min-h-[120px] flex flex-col relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform duration-700"></div>
                    <div class="flex justify-between items-center mb-2 shrink-0 relative z-10">
                         <span class="font-bold text-sm flex items-center gap-2"><el-icon class="text-red-400 group-hover:scale-110 transition-transform"><TrendCharts /></el-icon> 主线剧情</span>
                         <el-button size="small" type="primary" plain round @click="aiHelpWrite('mainPlot')" class="!px-2 !h-6 !text-xs !rounded-lg shadow-sm">AI 生成</el-button>
                    </div>
                    <div class="flex-1 min-h-0 relative z-10">
                        <el-input 
                          v-model="form.mainPlot" 
                          type="textarea" 
                          resize="none" 
                          :rows="3"
                          placeholder="讲述一个怎样的故事？起承转合..." 
                          :class="isLight ? 'light-textarea h-full' : 'dark-textarea h-full'" 
                          class="h-full custom-textarea !text-sm leading-relaxed" 
                        />
                    </div>
                </div>

                <!-- Character & Synopsis & Requirements Grid (Expanded) -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 flex-[2] min-h-[300px]">
                    <!-- Character Info -->
                    <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-full hover:shadow-md transition-shadow group">
                        <div class="flex justify-between items-center mb-2 shrink-0">
                           <span class="font-bold text-sm group-hover:text-indigo-500 transition-colors">角色档案</span>
                           <el-button size="small" text class="!px-1 !h-6 !text-xs" @click.stop="aiHelpWrite('characterInfo')">AI 生成</el-button>
                        </div>
                        <div class="flex-1 min-h-0">
                            <el-input v-model="form.characterInfo" type="textarea" resize="none" :rows="10" :class="isLight ? 'light-textarea h-full' : 'dark-textarea h-full'" placeholder="主角姓名、性格..." class="h-full custom-textarea !text-sm" />
                        </div>
                    </div>

                    <!-- Synopsis -->
                    <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-full hover:shadow-md transition-shadow group">
                        <div class="flex justify-between items-center mb-2 shrink-0">
                           <span class="font-bold text-sm group-hover:text-indigo-500 transition-colors">作品简介</span>
                           <el-button size="small" text class="!px-1 !h-6 !text-xs" @click.stop="aiHelpWrite('synopsis')">AI 生成</el-button>
                        </div>
                        <div class="flex-1 min-h-0">
                            <el-input v-model="form.synopsis" type="textarea" resize="none" :rows="10" :class="isLight ? 'light-textarea h-full' : 'dark-textarea h-full'" placeholder="吸引读者的简介..." class="h-full custom-textarea !text-sm" />
                        </div>
                    </div>

                    <!-- Requirements -->
                    <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-full hover:shadow-md transition-shadow group">
                        <div class="flex justify-between items-center mb-2 shrink-0">
                           <span class="font-bold text-sm group-hover:text-indigo-500 transition-colors">创作要求</span>
                           <el-button size="small" text class="!px-1 !h-6 !text-xs" @click.stop="aiHelpWrite('requirements')">AI 生成</el-button>
                        </div>
                        <div class="flex-1 min-h-0">
                            <el-input v-model="form.requirements" type="textarea" resize="none" :rows="10" :class="isLight ? 'light-textarea h-full' : 'dark-textarea h-full'" placeholder="额外的创作要求..." class="h-full custom-textarea !text-sm" />
                        </div>
                    </div>
                </div>
             
                 <!-- Bottom Actions Area (Sticky) -->
                 <div class="sticky bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-5 -mx-6 -mb-6 flex gap-5 items-center">
                    <!-- AI Creation Engine -->
                    <div class="flex-1 grid grid-cols-2 gap-5">
                       <!-- Complete Mode -->
                       <div class="rounded-3xl p-[3px] bg-gradient-to-r from-indigo-400 via-sky-400 to-cyan-300 hover:from-indigo-500 hover:via-sky-500 hover:to-cyan-400 transition-all shadow-md">
                         <button type="button" class="w-full flex items-center gap-5 p-5 rounded-[18px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative overflow-hidden group min-h-[88px]" @click.prevent="handleSmartGenerate('complete')">
                           <div class="absolute inset-0 pointer-events-none bg-gradient-to-br from-indigo-50 via-sky-50 to-cyan-50 opacity-0 group-hover:opacity-70 transition-opacity"></div>
                           <div class="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-300 shrink-0 shadow-sm">
                              <el-icon size="20"><EditPen /></el-icon>
                           </div>
                           <div class="text-left relative z-10">
                             <div class="font-extrabold text-base text-slate-800 dark:text-white">基于设定补全</div>
                             <div class="text-sm text-slate-500 dark:text-slate-400">保留已有内容，仅生成空白项</div>
                           </div>
                         </button>
                       </div>
                       
                       <!-- From Scratch Mode -->
                       <div class="rounded-3xl p-[3px] bg-gradient-to-r from-fuchsia-400 via-purple-400 to-violet-400 hover:from-fuchsia-500 hover:via-purple-500 hover:to-violet-500 transition-all shadow-md">
                         <button type="button" class="w-full flex items-center gap-5 p-5 rounded-[18px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative overflow-hidden group min-h-[88px]" @click.prevent="handleSmartGenerate('scratch')">
                           <div class="absolute inset-0 pointer-events-none bg-gradient-to-br from-fuchsia-50 via-purple-50 to-violet-50 opacity-0 group-hover:opacity-70 transition-opacity"></div>
                           <div class="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-300 shrink-0 shadow-sm">
                              <el-icon size="20"><MagicStick /></el-icon>
                           </div>
                           <div class="text-left relative z-10">
                             <div class="font-extrabold text-base text-slate-800 dark:text-white">从零生成全部</div>
                             <div class="text-sm text-slate-500 dark:text-slate-400">将覆盖当前所有内容</div>
                           </div>
                         </button>
                       </div>
                    </div>

                    <!-- Generate Outline Button (Blue, Sticky) -->
                    <div class="w-48">
                       <button 
                         class="w-full h-full min-h-[64px] bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-between px-6 transition-all hover:-translate-y-0.5 active:translate-y-0"
                         @click="createWork"
                       >
                          <div class="flex flex-col items-start">
                             <span class="text-lg font-bold">开始创作</span>
                             <span class="text-xs opacity-80">生成大纲</span>
                          </div>
                          <el-icon size="20"><ArrowRight /></el-icon>
                       </button>
                    </div>
                 </div>
             </div>
          </div>
        </el-form>
      </div>
    </div>

    <!-- Genre Dialog -->
    <el-dialog v-model="showGenreDialog" title="选择题材" width="600px" append-to-body :class="isLight ? '' : 'dark-dialog'">
      <div class="flex flex-col h-[400px]">
        <el-tabs v-model="activeGenreTab" class="mb-4" :class="isLight ? '' : 'dark-tabs'">
          <el-tab-pane v-for="(subGenres, category) in genreCategories" :key="category" :label="category" :name="category" />
        </el-tabs>
        <div class="flex-1 overflow-y-auto custom-scrollbar">
           <div class="grid grid-cols-4 gap-3">
             <div 
               v-for="sub in genreCategories[activeGenreTab]" 
               :key="sub"
               class="px-3 py-3 text-base font-medium text-center rounded border cursor-pointer transition-all hover:border-purple-500 hover:text-purple-400"
               :class="form.genre === sub ? (isLight ? 'border-purple-500 bg-purple-50 text-purple-600' : 'border-purple-500 bg-purple-500/20 text-purple-100') : (isLight ? 'border-slate-200 bg-white text-slate-600' : 'border-slate-700 bg-slate-800 text-slate-200')"
               @click="selectGenre(sub)"
             >
               {{ sub }}
             </div>
           </div>
        </div>
      </div>
    </el-dialog>

    <!-- Style Dialog -->
    <el-dialog v-model="showStyleDialog" title="选择风格" width="700px" append-to-body :class="isLight ? '' : 'dark-dialog'">
      <div class="flex flex-col h-[500px]">
        <el-input v-model="styleSearch" placeholder="搜索风格..." :prefix-icon="Search" class="mb-4" :class="isLight ? '' : 'dark-input'" clearable />
        <div class="flex-1 overflow-y-auto custom-scrollbar p-1">
           <div class="flex flex-wrap gap-2">
             <div 
               v-for="style in filteredStyles" 
               :key="style"
               class="px-4 py-2 text-sm font-bold rounded-full border cursor-pointer transition-all hover:border-pink-500 hover:text-pink-400"
               :class="form.styles.includes(style) ? (isLight ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-pink-500 bg-pink-500/20 text-pink-100') : (isLight ? 'border-slate-200 bg-white text-slate-600' : 'border-slate-700 bg-slate-800 text-slate-200')"
               @click="toggleStyle(style)"
             >
               {{ style }}
             </div>
           </div>
        </div>
      </div>
    </el-dialog>

    <!-- Tag Dialog -->
    <el-dialog v-model="showTagDialog" title="选择标签" width="700px" append-to-body :class="isLight ? '' : 'dark-dialog'">
      <div class="flex flex-col h-[500px]">
        <el-input v-model="tagSearch" placeholder="搜索标签..." :prefix-icon="Search" class="mb-4" :class="isLight ? '' : 'dark-input'" clearable />
        <div class="flex-1 overflow-y-auto custom-scrollbar p-1">
           <div class="flex flex-wrap gap-2">
             <div 
               v-for="tag in filteredTags" 
               :key="tag"
               class="px-4 py-2 text-sm font-bold rounded-full border cursor-pointer transition-all hover:border-indigo-500 hover:text-indigo-400"
               :class="form.tags.includes(tag) ? (isLight ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-indigo-500 bg-indigo-500/20 text-indigo-100') : (isLight ? 'border-slate-200 bg-white text-slate-600' : 'border-slate-700 bg-slate-800 text-slate-200')"
               @click="toggleTag(tag)"
             >
               {{ tag }}
             </div>
           </div>
        </div>
      </div>
    </el-dialog>

    <!-- AI Cover Generator Dialog (Dark Mode) -->
    <el-dialog v-model="showAIDialog" title="AI 封面生成工坊" width="700px" append-to-body :class="isLight ? '' : 'dark-dialog'">
      <div class="space-y-6">
        <!-- Prompt Input -->
        <div class="rounded-xl border p-4 transition-colors" :class="isLight ? 'bg-slate-50 border-slate-200 focus-within:border-indigo-500' : 'bg-slate-800/50 border-slate-700 focus-within:border-indigo-500/50'">
           <div class="text-sm mb-2 font-medium" :class="isLight ? 'text-slate-600' : 'text-slate-300'">生成描述词 (Prompt)</div>
           <el-input 
             v-model="aiPrompt"
             type="textarea" 
             :rows="4"
             placeholder="例如：古风武侠，边境战火，义军首领手持重锤，背景是燃烧的村庄..."
             :class="isLight ? 'light-textarea' : 'dark-textarea'"
             class="!text-base force-white-input"
           />
           <div class="flex justify-end mt-2">
             <el-button type="primary" :loading="isGenerating" class="shadow-lg shadow-indigo-500/20" @click="generateCoverImages">
               <el-icon class="mr-1"><MagicStick /></el-icon> 开始生成
             </el-button>
           </div>
        </div>

        <!-- Result Grid -->
        <div class="grid grid-cols-2 gap-4 min-h-[300px] relative rounded-xl border border-dashed p-4 transition-colors" :class="isLight ? 'bg-slate-50/50 border-slate-300' : 'bg-slate-800/30 border-slate-700'">
           <div v-if="generatedImages.length === 0 && !isGenerating" class="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
             <el-icon size="48" class="mb-4 opacity-50"><Picture /></el-icon>
             <p>输入描述词后点击生成</p>
           </div>
           
           <div v-if="isGenerating" class="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded-xl">
             <div class="loading-spinner mb-4"></div>
             <p class="text-indigo-400 animate-pulse">AI 正在绘图...</p>
           </div>

           <div 
             v-for="(img, idx) in generatedImages" 
             :key="idx"
             class="relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all aspect-[2/3]"
             :class="selectedImage === img ? 'border-indigo-500 shadow-xl shadow-indigo-500/20 scale-[1.02]' : 'border-transparent hover:border-indigo-300'"
             @click="selectedImage = img"
           >
             <img :src="img" class="w-full h-full object-cover" />
             <div class="absolute top-2 right-2" v-if="selectedImage === img">
               <div class="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg">
                 <el-icon><Check /></el-icon>
               </div>
             </div>
           </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3 pt-4 border-t" :class="isLight ? 'border-slate-100' : 'border-slate-800'">
          <el-button @click="showAIDialog = false" :class="isLight ? '' : '!bg-slate-800 !border-slate-700 !text-slate-300'">取消</el-button>
          <el-button type="primary" :disabled="!selectedImage" @click="confirmAICover">应用封面</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, inject, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ProjectList from '@/components/Common/ProjectList.vue'
import StepIndicator from '@/components/StepIndicator.vue'
import StickyNav from '@/components/AIScriptWriting/StickyNav.vue'
import { 
  ArrowLeft, Check, Trophy, Delete, UserFilled, Collection, 
  Select, MagicStick, Refresh, Reading, Place, Key, 
  TrendCharts, EditPen, More, Cpu, Aim, Search, VideoCamera, QuestionFilled, ArrowRight, ArrowDown, Files, Download, Clock, Warning, CircleCheck,
  Star, Picture
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useLoreStore } from '@/stores/useLoreStore'
import _ from 'lodash'

const router = useRouter()
const route = useRoute()
const loreStore = useLoreStore()
const isCreating = ref(false)
const ruleFormRef = ref<FormInstance>()
const activeCollapse = ref(['characterInfo', 'synopsis', 'requirements']) // Default open

// Nav Items
const navItems = [
  { id: 'section-genre', label: '题材设定' },
  { id: 'section-style', label: '风格倾向' },
  { id: 'section-audience', label: '核心受众' },
  { id: 'section-script-style', label: '剧本叙事' },
  { id: 'section-specs', label: '剧本规格' }, // Now at bottom of left panel
  { id: 'section-title', label: '作品名称' },
  { id: 'section-world', label: '世界观' },
  { id: 'section-golden', label: '金手指' },
  { id: 'section-plot', label: '主线剧情' },
  { id: 'section-character', label: '角色档案' },
  { id: 'section-synopsis', label: '作品简介' },
  { id: 'section-requirements', label: '创作要求' }
]

// Constants
const POPULAR_GENRES = ['东方玄幻', '赛博朋克', '家族世仇', '大女主', '无限流', '克苏鲁', '规则怪谈', '末世求生']
const POPULAR_STYLES = ['轻松', '黑暗', '热血', '正剧', '群像', '智斗', '治愈', '反转']

// Placeholders
const genrePlaceholderIndex = ref(0)
const stylePlaceholderIndex = ref(0)
const genrePlaceholders = ['例如：东方玄幻', '例如：赛博朋克', '例如：都市异能']
const stylePlaceholders = ['例如：轻松、搞笑', '例如：黑暗、深沉', '例如：热血、升级']

const genrePlaceholder = computed(() => genrePlaceholders[genrePlaceholderIndex.value])
const stylePlaceholder = computed(() => stylePlaceholders[stylePlaceholderIndex.value])

// Auto-save & History
const isSaving = ref(false)
const lastSavedTime = ref('')
const history = ref<{time: string, data: any}[]>([])

// Dialog States
const showGenreDialog = ref(false)
const showStyleDialog = ref(false)
const showTagDialog = ref(false)
const showAIDialog = ref(false)
const aiPrompt = ref('')
const generatedImages = ref<string[]>([])
const selectedImage = ref('')
const isGenerating = ref(false)

const generateCoverImages = () => {
  if (!aiPrompt.value) return ElMessage.warning('请输入描述词')
  
  isGenerating.value = true
  generatedImages.value = []
  
  // Simulate AI Generation
  setTimeout(() => {
    // High quality fantasy/cyberpunk/character portraits from Unsplash
    generatedImages.value = [
      'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?q=80&w=600&auto=format&fit=crop', // Cyberpunk city
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop', // Portrait
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop', // Fantasy landscape
      'https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=600&auto=format&fit=crop'  // Abstract/Sci-fi
    ]
    isGenerating.value = false
  }, 2500)
}

const confirmAICover = () => {
  // This logic is actually handled inside ProjectList.vue usually, but here we just simulate closing or using it if this component supports it
  // Since AIWriteNovel doesn't have a cover field in `form` yet, we might need to add it or just emit an event.
  // However, the user request specifically mentioned "Second image AI Cover Generator Workshop dialog white background to black".
  // This dialog seems to be part of ProjectList component based on previous context, but I see I am editing AIWriteNovel.vue.
  // Wait, let me check if ProjectList.vue has this dialog.
  
  showAIDialog.value = false
  ElMessage.success('AI 封面已应用')
}

// Data
const form = reactive({
  episodeCount: 12,
  episodeDuration: 30,
  audience: 'general',
  genre: '',
  tags: [] as string[],
  styles: [] as string[],
  style: 'cinematic',
  perspective: 'third',
  longMemory: true,
  worldView: '',
  goldenFinger: '',
  mainPlot: '',
  characterInfo: '',
  synopsis: '',
  title: '',
  requirements: ''
})

const rules = reactive<FormRules>({
  title: [{ required: true, message: '请输入作品名称', trigger: 'blur' }],
  mainPlot: [{ required: true, message: '请生成或输入主线剧情', trigger: 'blur' }],
  characterInfo: [{ required: true, message: '请完善角色档案', trigger: 'blur' }],
  synopsis: [{ required: true, message: '请输入作品简介', trigger: 'blur' }],
  genre: [{ required: true, message: '请选择题材', trigger: 'change' }],
  // styles is optional, no required rule
})

// Genre Logic
const activeGenreTab = ref('玄幻')
const customGenre = ref('')
const genreCategories: Record<string, string[]> = {
  '玄幻': ['东方玄幻', '王朝争霸', '异世大陆', '异术超能', '远古神话', '高武世界', '转世重生', '西方玄幻'],
  '奇幻': ['奇妙魔法', '魔法', '史诗奇幻', '诡秘', '异界', '神话', '龙与地下城'],
  '武侠': ['传统武侠', '新派武侠', '国术无双', '古武未来'],
  '仙侠': ['修真文明', '幻想修仙', '现代修真', '神话修真', '古典仙侠'],
  '都市': ['都市生活', '异术超能', '青春校园', '娱乐明星', '商战职场'],
  '历史': ['架空历史', '秦汉三国', '两晋隋唐', '五代十国', '宋元明清', '外国历史'],
  '军事': ['战争幻想', '谍战特工', '军旅生涯', '抗战烽火'],
  '科幻': ['星际文明', '古武机甲', '未来世界', '进化变异', '末世危机', '时空穿梭'],
  '游戏': ['电子竞技', '虚拟网游', '游戏异界', '游戏系统'],
  '悬疑': ['侦探推理', '诡秘悬疑', '探险生存', '奇妙世界']
}

const SCRIPT_STYLE_OPTIONS = [
  { value: 'cinematic', label: '电影感（画面优先）', desc: '强调视觉冲击、镜头语言和动作细节，弱化心理独白，适合改编影视。' },
  { value: 'novelistic', label: '小说感（心理描写）', desc: '注重人物内心世界、细腻的情感流动和环境烘托，文字感染力强。' },
  { value: 'plain', label: '白描（动作对白）', desc: '极简风格，只记录动作和对白，节奏快，干脆利落，适合快节奏网文。' }
]

const getScriptStyleLabel = (value: string) => {
  const option = SCRIPT_STYLE_OPTIONS.find(opt => opt.value === value)
  return option ? option.label : ''
}

const selectGenre = (genre: string) => {
  form.genre = genre
  showGenreDialog.value = false
}

const addCustomGenre = () => {
  if (customGenre.value) {
    form.genre = customGenre.value
    customGenre.value = ''
    showGenreDialog.value = false
  }
}

// Style Logic
const styleSearch = ref('')
const customStyle = ref('')
const allStyles = [
  '马', '契约婚姻', '先婚后爱', '欢喜冤家', '前世情缘', '主仆羁绊', '死对头', '契约情侣', '家族联姻', 
  '师徒禁忌', '兄弟阋墙', '爱而不得', '杀父之仇', '家族世仇', '利益联姻', '阶级鸿沟', '病娇', '黑化', 
  '逆袭', '团宠', '马甲文', '女强', '男强', '双强', '女尊', '男尊', '女扮男装', '男扮女装', '真假千金', 
  '真假少爷', '盗贼', '特工', '黑客', '明星', '特种兵', '杀手', '老师', '学生', '胖子', '医生', '鉴宝师', 
  '孤儿', '宅男', '冷酷', '腹黑', '阳光', '狡猾', '机智', '猥琐', '嚣张', '淡定', '女王', '公主', '王子', 
  '骑士', '贵族', '平民', '奴隶', '反派', '英雄', '兽化人', '变种人', '穿越者', '重生者', 'AI角色', '言灵之力', 
  '召唤契约', '天赋异能', '娱乐圈', '电竞圈', '电竞文', '娱乐圈文', '娱圈甜宠', '娱圈虐恋', '热血', '爽文', 
  '励志', '搞笑', '恶搞', '爆笑', '日常', '短故事', '中短篇', '蜀山', '魔王附体', '亡灵', '吸血鬼', '龙', 
  '鬼怪', '僵尸', '丧尸', '魔兽', '玄学', '阵法', '丹药', '西游', '位面', '洪荒流', '学院流', '种田文', 
  '争霸流', '异兽流', '系统流', '随身流', '软饭流', '迪化流', '无敌文', '练功流', '召唤流', '群穿', '重生', 
  '穿越', '无限流', '技术流', '凡人流', '变身', '强者回归', '星际', '机甲', '末世', '灵异', '道士', '妖修', 
  '修真', '仙侠', '江湖', '武侠', '权谋', '宫斗', '商战', '间谍', '侦探', '探险', '秘境', '异能', '超能力', 
  '神话', '传说', '史诗', '战争', '和平', '职场', '赚钱', '宠物', '卡片', '手游', 'LOL', '机器人', '人工智能', 
  '虚拟现实', '梦境', '幻觉', '心理', '艺术', '音乐', '舞蹈', '美食', '旅行', '自然', '生态', '环保', '科技', 
  '历史', '现代', '古代', '东方', '西方', '海洋', '天空', '地下', '森林', '沙漠', '草原', '雪山', '河流', 
  '湖泊', '岛屿', '城市', '乡村', '校园', '家庭', '社会', '国家', '民族', '文化', '宗教', '信仰', '习俗', 
  '传统', '节日', '庆典', '仪式', '婚礼', '葬礼', '生日', '纪念日', '未来星际', '修仙时代', '蒸汽朋克', '末日废墟', 
  '魔法大陆', '赛博都市', '修仙门派', '奴隶社会', '星际帝国', '修真世界', '异能世界', '理想国度', '反乌托邦', '联邦政府', 
  '灵气爆发', '元素魔法', '科技主宰', '神力体系', '机械进化', '基因变异', '废土世界', '星际联邦', '时间循环', '平行宇宙', 
  '魔法学院', '基因锁界', '双生灵魂', '亡灵魔法', '修真境界', '仙星融合', '武蒸结合', '校园异能', '历史系统', '职场玄幻', 
  '末日萌宠', '古风悬疑', '科幻宫斗', '乙女无限', '上古神话', '商周时期', '秦汉岁月', '唐宋风华', '盛唐气象', '北宋烟云', 
  '架空古代', '未来星际历', '平行世界', '远古洪荒', '近未来', '中世纪', '民国时期', '蒸汽时代', '修仙小世界', '星际联盟', 
  '废土沙漠', '深海秘境', '兽人部落', '精灵森林', '亡灵国度', '机械城邦', '海底亚特兰蒂斯', '奴隶制王朝', '联邦制星际帝国', 
  '修真门派林立', '兽人母系社会', '虫族蜂巢文明', '末世基地市', '魔法学院制', '封建贵族社会', '星际海盗联盟', '异能者公会', 
  '灵气枯竭世界', '无魔世界', '丧尸病毒爆发区', '精神力统治时代', '基因锁世界', '机械文明巅峰', '兽潮平原', '神魔古战场', 
  '时间紊乱区', '星际流放地', '修真文明', '魔法文明', '科技修真融合', '虫族文明', '机械文明', '亚特兰蒂斯文明', 
  '精灵文明', '矮人锻造文明', '亡灵魔法文明', '共生体文明', '契约升级', '荒野求生', '种族战争', '宫廷政变', '宗门大比', 
  '星际大战', '丧尸围城', '正邪对抗', '资源争夺', '拍卖会', '阴谋诡计', '灭门惨案', '时空裂缝', '反转逆袭', '真相揭露', 
  '身份互换', '时空穿越', '记忆复苏', '卧底潜伏', '假死逃生', '魂穿夺舍', '预言成真', '秘境探险', '星际漫游', '重生复仇', 
  '科举之路', '主角光环', '温暖治愈', '虐心催泪', '暗黑压抑', '悬疑惊悚', '热血燃情', '悲伤哀婉', '温情脉脉', '冷峻肃杀', 
  '快节奏', '慢节奏', '一路开挂', '逆袭流', '群像戏', '单元剧', '平铺直叙', '跌宕起伏', '奇幻瑰丽', '科幻硬核', 
  '古风古韵', '现代都市', '末日废土', '蒸汽朋克', '赛博朋克', '童话风格', '现实向', '架空历史', '轻小说', '正剧', 
  '爽虐交织', '致郁治愈', '无厘头', '意识流', '哥特风', '清新脱俗', '科幻迷', '推理爱好者', '古风爱好', '游戏玩家', 
  '二次元', '青少年向', '成年向', '儿童亲子', '耽美腐向', '乙女恋爱', '百合情感', '中老年读者', '游戏玩家向', 
  'ABO设定', '克苏鲁风', '星际机甲', '萌宠兽世', '修罗情场', '打脸逆袭', '伪骨科', '末世基建', '逆后宫', '女尊男卑', 
  '因果武器', '机器定律', '血契之约', '能量晶核', '神格之力', '轮回转世'
]

const filteredStyles = computed(() => {
  if (!styleSearch.value) return allStyles
  return allStyles.filter(s => s.toLowerCase().includes(styleSearch.value.toLowerCase()))
})

const toggleStyle = (style: string) => {
  if (form.styles.includes(style)) {
    removeStyle(style)
  } else {
    form.styles.push(style)
  }
}

const removeStyle = (style: string) => {
  form.styles = form.styles.filter(s => s !== style)
}

const addCustomStyle = () => {
  if (customStyle.value && !form.styles.includes(customStyle.value)) {
    form.styles.push(customStyle.value)
    customStyle.value = ''
  }
}

// Tag Logic
const tagSearch = ref('')
const customTag = ref('')
const tagOptions = ['反乌托邦', '人工智能', '时间旅行', '复仇', '治愈', '群像剧', '烧脑', '搞笑']

const filteredTags = computed(() => {
  if (!tagSearch.value) return tagOptions
  return tagOptions.filter(t => t.toLowerCase().includes(tagSearch.value.toLowerCase()))
})

const canAutoGenerate = computed(() => {
  return form.genre && 
         form.audience && 
         form.styles.length > 0 && 
         form.tags.length > 0 &&
         form.episodeCount > 0 &&
         form.episodeDuration > 0
})

const toggleTag = (tag: string) => {
  if (form.tags.includes(tag)) {
    removeTag(tag)
  } else {
    form.tags.push(tag)
  }
}

const removeTag = (tag: string) => {
  form.tags = form.tags.filter(t => t !== tag)
}

const addCustomTag = () => {
  if (customTag.value && !form.tags.includes(customTag.value)) {
    form.tags.push(customTag.value)
    customTag.value = ''
  }
}

const isLight = inject('isLight', ref(false))

watch(() => route.query.mode, (newMode) => {
  if (newMode === 'create') {
    isCreating.value = true
  } else {
    isCreating.value = false
  }
})

const loadProjectData = (id: string) => {
  // Mock loading data for existing project
  const existingProject = {
    title: "义军崛起",
    genre: "东方玄幻",
    episodeCount: 12,
    episodeDuration: 30,
    audience: "general",
    worldView: "乱世之中，朝廷腐败，民不聊生。边境战火连天，各路义军揭竿而起。",
    goldenFinger: "主角赵铁牛天生神力，且拥有祖传兵法《武穆遗书》残卷。",
    mainPlot: "赵铁牛本是边境村庄的铁匠，村庄被官兵血洗后，他立誓复仇。在牢狱中结识豪杰，越狱后聚民为军，最终推翻暴政。",
    characterInfo: "主角：赵铁牛，20岁，铁匠出身。性格耿直，嫉恶如仇，力大无穷，善使一把玄铁重锤。",
    synopsis: "边境村庄突遭官兵屠戮，幸存少年赵铁牛背负血海深仇。从死牢囚犯到义军统帅，他将用手中的铁锤砸碎这黑暗的旧世道！",
    requirements: "1. 突出战争的残酷和兄弟情义\n2. 打斗场面要拳拳到肉，硬桥硬马",
    tags: ["复仇", "热血", "群像剧"],
    styles: ["热血", "黑暗", "正剧"],
    style: "cinematic",
    perspective: "third",
    longMemory: true
  }
  Object.assign(form, existingProject)
  ElNotification({
    title: '正在编辑项目',
    message: `正在载入《${existingProject.title}》的基础设定`,
    type: 'info'
  })
}

watch(() => route.query.id, (newId) => {
  if (newId && route.query.mode === 'create') {
    loadProjectData(newId as string)
  }
})

onMounted(() => {
  // Placeholder rotation
  setInterval(() => {
    genrePlaceholderIndex.value = (genrePlaceholderIndex.value + 1) % genrePlaceholders.length
    stylePlaceholderIndex.value = (stylePlaceholderIndex.value + 1) % stylePlaceholders.length
  }, 3000)

  if (route.query.mode === 'create') {
    isCreating.value = true
    
    // If ID is provided, simulate loading project data
    if (route.query.id) {
      loadProjectData(route.query.id as string)
    }
  }
  
  // Load draft if exists (only if not loading a specific project)
  if (!route.query.id) {
    const saved = localStorage.getItem('ai_novel_draft')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        Object.assign(form, data)
        ElNotification({
          title: '已恢复上次进度',
          message: '您的创作已自动加载',
          type: 'success',
          duration: 3000
        })
      } catch (e) {}
    } else {
      // First time guide
      setTimeout(() => {
         ElNotification({
          title: '自动保存开启',
          message: '您的创作会自动保存，随时可恢复',
          type: 'info',
          duration: 5000
        })
      }, 1000)
    }
  }
})

// Auto Save
const saveDraft = () => {
  isSaving.value = true
  localStorage.setItem('ai_novel_draft', JSON.stringify(form))
  
  // Add to history (max 5)
  history.value.unshift({
    time: new Date().toLocaleTimeString(),
    data: JSON.parse(JSON.stringify(form))
  })
  if (history.value.length > 5) history.value.pop()
  
  setTimeout(() => {
    isSaving.value = false
    lastSavedTime.value = new Date().toLocaleTimeString()
  }, 500)
}

watch(form, _.debounce(() => {
  saveDraft()
}, 3000), { deep: true })

const restoreVersion = (record: any) => {
  Object.assign(form, record.data)
  ElMessage.success('已恢复到 ' + record.time + ' 的版本')
}

const handleExport = (command: string) => {
  ElMessage.success(`正在导出为 ${command.toUpperCase()} 格式...`)
}

const startCreation = () => {
  router.push({ query: { mode: 'create' } })
}

const exitCreation = () => {
  router.push({ name: 'ai-write-novel' })
}

const openProject = (id: number) => {
  // isCreating.value = true
  // In a real app, you would load the project data here
  // ElMessage.success(`打开项目 #${id}`)
  router.push({ name: 'novel-generator', query: { id: id.toString() } })
}

const audiences = [
  { label: '大众向', value: 'general' },
  { label: '硬核向', value: 'hardcore' },
  { label: '情感向', value: 'emotional' },
  { label: '二次元', value: 'acg' },
]

const aiHelpWrite = async (field: keyof typeof form) => {
  ElMessage.info('AI 正在连接神经元网络...')
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200))

  const mockData: Record<string, string> = {
    worldView: "乱世之中，朝廷腐败，民不聊生。边境战火连天，各路义军揭竿而起。",
    goldenFinger: "主角赵铁牛天生神力，且拥有祖传兵法《武穆遗书》残卷。",
    mainPlot: "赵铁牛本是边境村庄的铁匠，村庄被官兵血洗后，他立誓复仇。在牢狱中结识豪杰，越狱后聚民为军，最终推翻暴政。",
    characterInfo: "主角：赵铁牛，20岁，铁匠出身。性格耿直，嫉恶如仇，力大无穷，善使一把玄铁重锤。",
    synopsis: "边境村庄突遭官兵屠戮，幸存少年赵铁牛背负血海深仇。从死牢囚犯到义军统帅，他将用手中的铁锤砸碎这黑暗的旧世道！",
    title: "义军崛起",
    requirements: "1. 突出战争的残酷和兄弟情义\n2. 打斗场面要拳拳到肉，硬桥硬马"
  }

  if (mockData[field]) {
    // @ts-ignore
    form[field] = mockData[field]
    ElMessage.success('创意已生成！')
  }
}

const autoFillAll = async () => {
  const fields: (keyof typeof form)[] = ['title', 'worldView', 'goldenFinger', 'mainPlot', 'characterInfo', 'synopsis', 'requirements']
  for (const field of fields) {
    if (!form[field]) {
      await aiHelpWrite(field)
    }
  }
}

const handleSmartGenerate = (command: string) => {
  if (command === 'scratch') {
    ElMessageBox.confirm('这将清空当前所有内容并重新生成，确定吗？', '警告', {
      confirmButtonText: '确定重写',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      // Clear form except settings
      form.title = ''
      form.worldView = ''
      form.goldenFinger = ''
      form.mainPlot = ''
      form.characterInfo = ''
      form.synopsis = ''
      form.requirements = ''
      autoFillAll()
    })
  } else if (command === 'complete') {
     autoFillAll()
  }
}

const fillExample = (field: string) => {
  if (field === 'characterInfo') {
    form.characterInfo = "姓名：李逍遥\n年龄：19岁\n性格：玩世不恭，重情重义\n外貌：剑眉星目，身背一把破旧铁剑"
  } else if (field === 'synopsis') {
    form.synopsis = "原本只是余杭镇的一个小混混，却因为一壶酒被卷入仙魔之争..."
  } else if (field === 'requirements') {
    form.requirements = "1. 开头要有冲突，吸引读者\n2. 感情线要细腻，不要突兀\n3. 每章结尾留悬念"
  }
}

const createWork = async () => {
  if (!ruleFormRef.value) return
  
  await ruleFormRef.value.validate((valid, fields) => {
    if (valid) {
      // Check for empty requirements with filled plot
      if (!form.requirements && form.mainPlot) {
         ElNotification({
           title: '温馨提示',
           message: '是否要补充一些特殊的创作要求以获得更精准的结果？',
           type: 'warning',
           duration: 5000,
           position: 'bottom-right'
         })
         // We still proceed after a short delay or let user decide? 
         // The prompt says "pop up a gentle Toast prompt". Usually this implies blocking or non-blocking.
         // "Before Start Creation button triggers" implies we might want to pause.
         // But "Toast" is usually non-blocking. 
         // Let's use MessageBox for a decision or just a notification and proceed?
         // "弹出一个温和的 Toast 提示" -> usually just notification.
         // But if we want to give them a chance to edit, we should probably pause?
         // Let's ask via confirm, but make it look gentle.
         // Actually, let's just use ElMessageBox.confirm for "Gentle prompt"
         
         ElMessageBox.confirm(
            '您填写了主线剧情但未指定创作要求。补充“创作要求”（如：文风、伏笔、避雷）能让 AI 生成更精准。是否现在补充？',
            '创作建议',
            {
              confirmButtonText: '去补充',
              cancelButtonText: '直接开始',
              type: 'info',
              distinguishCancelAndClose: true
            }
          )
          .then(() => {
             // User wants to edit
             const el = document.getElementById('section-requirements')
             if (el) el.scrollIntoView({ behavior: 'smooth' })
             if (!activeCollapse.value.includes('requirements')) activeCollapse.value.push('requirements')
          })
          .catch((action) => {
            if (action === 'cancel') {
               proceedCreation()
            }
          })
          return
      }

      proceedCreation()
    } else {
      ElMessage.error('请完善必填信息')
      // Auto expand collapse if error is inside
      if (fields?.characterInfo) activeCollapse.value.push('characterInfo')
      if (fields?.synopsis) activeCollapse.value.push('synopsis')
    }
  })
}

const proceedCreation = () => {
  // Save to Store
  loreStore.updateNovelInfo({
    title: form.title,
    genre: form.genre,
    episodeCount: form.episodeCount,
    episodeDuration: form.episodeDuration,
    targetAudience: form.audience,
    worldView: form.worldView,
    goldenFinger: form.goldenFinger,
    mainPlot: form.mainPlot,
    synopsis: form.synopsis,
    characterInfo: form.characterInfo,
    tags: form.tags,
    style: form.styles.join(','),
    perspective: form.perspective,
    longMemory: form.longMemory,
  })

  // Clear existing chapters to force new generation
  loreStore.currentNovel.chapters = []

  ElMessage.success('正在构建虚拟世界...')
  router.replace({ name: 'novel-generator', query: { step: 'outline' } })
}
</script>

<style scoped>
/* Custom Textarea Styling to fill container */
:deep(.custom-textarea .el-textarea__inner) {
  height: 100% !important;
  min-height: 100% !important;
  resize: none !important;
}

:deep(.custom-textarea) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Hide scrollbars but allow scrolling */
.custom-scrollbar {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

.custom-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

/* Highlight Animation */
@keyframes highlight {
  0% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0); }
  50% { box-shadow: 0 0 0 4px rgba(234, 179, 8, 0.5); }
  100% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0); }
}

:deep(.highlight-section) {
  animation: highlight 1.5s ease-in-out;
  border-color: #eab308 !important; /* yellow-500 */
}

/* Light Theme Overrides */
:deep(.light-input .el-input__wrapper) {
  background-color: white !important;
  box-shadow: 0 0 0 1px #e2e8f0 !important;
  border-radius: 12px;
}
:deep(.light-input .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #6366f1 !important;
}
:deep(.light-textarea .el-textarea__inner) {
  background-color: white !important;
  box-shadow: 0 0 0 1px #e2e8f0 !important;
  color: #475569;
  border-radius: 12px;
  padding: 16px;
}
:deep(.light-number .el-input__inner) {
  color: #1e293b !important;
}
:deep(.light-number .el-input-number__decrease),
:deep(.light-number .el-input-number__increase) {
  color: #94a3b8;
}

/* Dark Theme Overrides */
:deep(.dark-input .el-input__wrapper) {
  background-color: rgba(15, 23, 42, 0.6) !important; /* slate-900 with opacity */
  box-shadow: 0 0 0 1px rgba(71, 85, 105, 0.6) !important; /* slate-600/60 */
  border-radius: 12px;
  transition: all 0.3s ease;
}
:deep(.dark-input .el-input__wrapper.is-focus) {
  background-color: rgba(15, 23, 42, 0.9) !important;
  box-shadow: 0 0 0 1px #818cf8 !important; /* indigo-400 */
}
:deep(.dark-input .el-input__inner) {
  color: #ffffff; /* pure white */
  height: 48px;
  font-weight: 500;
}
:deep(.dark-textarea .el-textarea__inner) {
  background-color: rgba(15, 23, 42, 0.6) !important;
  box-shadow: 0 0 0 1px rgba(71, 85, 105, 0.6) !important;
  color: #e2e8f0; /* slate-200 */
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}
:deep(.dark-textarea .el-textarea__inner:focus) {
  background-color: rgba(15, 23, 42, 0.9) !important;
  box-shadow: 0 0 0 1px #818cf8 !important;
  color: #ffffff;
}
:deep(.el-textarea .el-input__count) {
  background: transparent !important;
  bottom: 8px !important;
  right: 12px !important;
  opacity: 0.6;
}

/* Custom Input Number Styling */
:deep(.custom-input-number .el-input__wrapper) {
  background-color: transparent !important;
  box-shadow: none !important;
  padding-left: 0;
  padding-right: 0;
}
:deep(.custom-input-number .el-input__inner) {
  color: #f1f5f9 !important;
  font-family: monospace;
  font-size: 1.1rem;
  font-weight: bold;
  text-align: left !important;
}
:deep(.custom-input-number .el-input-number__decrease),
:deep(.custom-input-number .el-input-number__increase) {
  background-color: transparent !important;
  border: none !important;
  color: #94a3b8;
}
:deep(.custom-input-number .el-input-number__decrease:hover),
:deep(.custom-input-number .el-input-number__increase:hover) {
  color: #c7d2fe;
}

/* Force white input for AI Dialog */
:deep(.force-white-input .el-textarea__inner) {
  background-color: #ffffff !important;
  color: #000000 !important;
  border-color: #e2e8f0 !important;
}
:deep(.force-white-input .el-textarea__inner::placeholder) {
  color: #94a3b8 !important;
}

/* Custom Split Button Styling */
:deep(.custom-split-button .el-button) {
  background-color: #4f46e5 !important;
  border-color: #4f46e5 !important;
  color: white !important;
  height: 48px;
  border-radius: 12px 0 0 12px;
  box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
  transition: all 0.3s ease;
}
:deep(.custom-split-button .el-dropdown__caret-button) {
  background-color: #4338ca !important; /* darker indigo */
  border-color: #4338ca !important;
  border-radius: 0 12px 12px 0;
  height: 48px;
}
:deep(.custom-split-button .el-button:hover) {
  background-color: #4338ca !important;
  transform: translateY(-1px);
}
:deep(.custom-split-button .el-dropdown__caret-button:hover) {
  background-color: #3730a3 !important;
}

/* Glow Dot Animation */
.glow-dot {
  box-shadow: 0 0 10px currentColor;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
  100% { opacity: 0.5; transform: scale(1); }
}

:deep(.dark-tabs .el-tabs__item) {
  color: #cbd5e1; /* slate-300 */
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
}
:deep(.dark-tabs .el-tabs__item.is-active) {
  color: #f1f5f9; /* slate-100 */
  font-weight: 800;
  font-size: 18px;
  text-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
}
:deep(.dark-tabs .el-tabs__item:hover) {
  color: #e2e8f0;
}
:deep(.dark-tabs .el-tabs__nav-wrap::after) {
  background-color: #334155; /* slate-700 underline */
}
:deep(.dark-tabs .el-tabs__active-bar) {
  background-color: #818cf8; /* indigo-400 */
  height: 3px;
  border-radius: 3px;
}
:deep(.el-form-item__label) {
  color: #cbd5e1 !important; /* slate-300 */
}
:deep(.el-step__title) {
  color: #94a3b8 !important;
}
:deep(.el-step__title.is-process) {
  color: #fff !important;
  font-weight: bold;
}
:deep(.el-step__title.is-finish) {
  color: #818cf8 !important;
}

/* Collapse Styles */
:deep(.dark-collapse) {
  --el-collapse-border-color: #334155;
  --el-collapse-header-bg-color: #1e293b;
  --el-collapse-content-bg-color: #1e293b;
  --el-collapse-header-text-color: #f1f5f9;
  --el-collapse-content-text-color: #cbd5e1;
}
:deep(.dark-collapse .el-collapse-item__header) {
  border-bottom-color: #334155;
}
:deep(.dark-collapse .el-collapse-item__wrap) {
  border-bottom-color: #334155;
}

:deep(.light-collapse) {
  --el-collapse-header-bg-color: #fff;
  --el-collapse-content-bg-color: #fff;
}

/* Dropdown */
:deep(.dark-dropdown) {
  background-color: #1e293b !important;
  border-color: #334155 !important;
}
:deep(.dark-dropdown .el-dropdown-menu__item) {
  color: #cbd5e1 !important;
}
:deep(.dark-dropdown .el-dropdown-menu__item:hover) {
  background-color: #334155 !important;
  color: #fff !important;
}
:deep(.dark-dropdown .el-dropdown-menu__item--divided) {
  border-top-color: #334155 !important;
}

/* Custom Split Button */
:deep(.custom-split-button .el-button--primary) {
  --el-button-bg-color: #4f46e5;
  --el-button-border-color: #4f46e5;
  --el-button-hover-bg-color: #4338ca;
  --el-button-hover-border-color: #4338ca;
  height: 56px;
}
.aisw-scale {
  font-size: 1.1rem;
}
</style>

<style>
/* Global Dialog Styles */
.dark-dialog {
  background-color: #0f172a !important; /* slate-900 instead of slate-800 */
  border: 1px solid #1e293b !important;
  border-radius: 16px !important;
}
.dark-dialog .el-dialog__title {
  color: #f1f5f9 !important;
}
.dark-dialog .el-dialog__body {
  padding-top: 10px !important;
  color: #cbd5e1 !important;
}
.dark-dialog .el-dialog__headerbtn .el-dialog__close {
  color: #94a3b8 !important;
}
.dark-dialog .el-dialog__headerbtn:hover .el-dialog__close {
  color: #f1f5f9 !important;
}
</style>
