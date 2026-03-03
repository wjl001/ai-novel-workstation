<template>
  <div class="h-full transition-colors duration-500" :class="isLight ? 'bg-slate-50 text-slate-800' : 'text-slate-100'">
    <ProjectList 
      v-if="!isCreating"
      title="一支笔"
      description="智能辅助，激发无限创作灵感"
      type="novel"
      @create="startCreation"
      @open="openProject"
    />

    <div v-else class="h-full overflow-y-auto p-0 scrollbar-thin relative" :class="isLight ? 'scrollbar-thumb-slate-300' : 'scrollbar-thumb-slate-700 scrollbar-track-transparent'" id="scroll-container">
      <StickyNav :items="navItems" />
      <StepIndicator :active-index="0" />
      
      <div class="max-w-7xl mx-auto p-6">
        <!-- Header & Top Actions -->
        <div class="flex items-center justify-between mb-8 sticky top-0 z-50 p-4 rounded-xl backdrop-blur-md transition-colors" :class="isLight ? 'bg-white/80 shadow-sm' : 'bg-slate-900/80 shadow-md border border-slate-700/50'">
          <div class="flex items-center">
            <el-button :icon="ArrowLeft" circle class="mr-4 transition-colors" :class="isLight ? '!bg-white !border-slate-200 !text-slate-600 hover:!bg-slate-100' : '!bg-slate-800 !border-slate-700 !text-slate-300 hover:!text-white hover:!bg-slate-700'" @click="isCreating = false" />
            <div>
              <h1 class="text-2xl font-bold tracking-tight" :class="isLight ? 'text-slate-900' : 'text-white'">AI剧本工坊</h1>
              <p class="text-xs mt-1 flex items-center gap-2" :class="isLight ? 'text-slate-500' : 'text-slate-400'">
                <span v-if="lastSavedTime">已保存 {{ lastSavedTime }}</span>
                <span v-else>未保存</span>
                <span v-if="isSaving" class="animate-pulse text-indigo-400">正在保存...</span>
              </p>
            </div>
          </div>

          <!-- Right Side Actions -->
          <div class="flex items-center gap-3">
            <el-tooltip content="保存草稿 (Ctrl+S)" placement="bottom">
              <el-button circle :class="isLight ? '' : '!bg-slate-800 !border-slate-700 !text-slate-300 hover:!text-white'" @click="saveDraft">
                <el-icon><files /></el-icon>
              </el-button>
            </el-tooltip>

            <el-dropdown trigger="click" @command="handleExport">
              <el-button circle :class="isLight ? '' : '!bg-slate-800 !border-slate-700 !text-slate-300 hover:!text-white'">
                <el-icon><Download /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu :class="isLight ? '' : 'dark-dropdown'">
                  <el-dropdown-item command="docx">导出为 Word (.docx)</el-dropdown-item>
                  <el-dropdown-item command="pdf">导出为 PDF (.pdf)</el-dropdown-item>
                  <el-dropdown-item command="txt">导出为 Text (.txt)</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-popover placement="bottom" :width="300" trigger="click" :effect="isLight ? 'light' : 'dark'">
              <template #reference>
                <el-button circle :class="isLight ? '' : '!bg-slate-800 !border-slate-700 !text-slate-300 hover:!text-white'">
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

        <el-form ref="ruleFormRef" :model="form" :rules="rules" label-position="top" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Left Column: Core Settings -->
        <div class="lg:col-span-4 space-y-6">
          
          <!-- Control Panel -->
          <div class="rounded-3xl border shadow-2xl relative overflow-hidden group transition-all" :class="isLight ? 'bg-white border-slate-200' : 'bg-[#0B1120] border-slate-800/60'">
            <!-- Background Decorations -->
            <div class="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none" :class="isLight ? 'bg-indigo-200/20' : 'bg-indigo-500/5'"></div>
            <div class="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl pointer-events-none" :class="isLight ? 'bg-purple-200/20' : 'bg-purple-500/5'"></div>
            
            <!-- 1. Project Specs -->
            <div class="mb-8 relative z-10 p-6 pb-0" id="section-specs">
              <h3 class="font-bold mb-4 flex items-center gap-2" :class="isLight ? 'text-slate-800' : 'text-slate-100'">
                <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full glow-dot"></span>
                剧本规格
              </h3>
              
              <div class="grid grid-cols-2 gap-4">
                <div class="rounded-xl p-3 border transition-all group/item" :class="isLight ? 'bg-slate-50 border-slate-200 hover:border-indigo-300' : 'bg-slate-800/40 border-slate-700/50 hover:border-indigo-500/30'">
                  <div class="text-sm font-bold mb-1 transition-colors group-hover/item:text-indigo-400" :class="isLight ? 'text-slate-700' : 'text-slate-100'">生成集数</div>
                  <el-input-number 
                    v-model="form.episodeCount" 
                    :min="1" 
                    :max="100" 
                    class="w-full !bg-transparent custom-input-number"
                    :class="isLight ? 'light-number' : ''"
                    controls-position="right" 
                  />
                </div>
                <div class="rounded-xl p-3 border transition-all group/item" :class="isLight ? 'bg-slate-50 border-slate-200 hover:border-indigo-300' : 'bg-slate-800/40 border-slate-700/50 hover:border-indigo-500/30'">
                  <div class="text-sm font-bold mb-1 transition-colors group-hover/item:text-indigo-400" :class="isLight ? 'text-slate-700' : 'text-slate-100'">单集时长 (分钟)</div>
                  <el-input-number 
                    v-model="form.episodeDuration" 
                    :min="1" 
                    :max="120" 
                    class="w-full !bg-transparent custom-input-number"
                    :class="isLight ? 'light-number' : ''"
                    controls-position="right" 
                  />
                </div>
              </div>
            </div>

            <!-- 2. Genre Selection -->
            <div class="mb-8 relative z-10 px-6" id="section-genre">
               <h3 class="font-bold mb-4 flex items-center gap-2" :class="isLight ? 'text-slate-800' : 'text-slate-100'">
                <span class="w-1.5 h-1.5 bg-purple-500 rounded-full glow-dot"></span>
                题材设定
              </h3>
              
              <el-form-item prop="genre">
                <el-popover
                  placement="right"
                  :width="280"
                  trigger="hover"
                  :effect="isLight ? 'light' : 'dark'"
                >
                  <template #reference>
                    <el-button 
                      class="w-full !justify-between !h-12 !px-4 !rounded-xl !border transition-all group"
                      :class="isLight ? '!bg-slate-50 !border-slate-200 hover:!border-purple-300 !text-slate-700' : '!bg-slate-800/40 !border-slate-700/50 hover:!border-purple-500/30 !text-slate-200'"
                      @click="showGenreDialog = true"
                    >
                      <span :class="!form.genre && 'opacity-50'">
                         {{ form.genre || genrePlaceholder }}
                      </span>
                      <div class="flex items-center gap-2">
                        <el-icon class="opacity-0 group-hover:opacity-100 transition-opacity text-purple-400"><Star /></el-icon>
                        <el-icon><ArrowDown /></el-icon>
                      </div>
                    </el-button>
                  </template>
                  <div class="p-2">
                    <div class="text-xs font-bold mb-2 flex items-center gap-1" :class="isLight ? 'text-slate-500' : 'text-slate-400'">
                      <el-icon class="text-yellow-500"><Star /></el-icon> 热门推荐
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <el-tag 
                        v-for="tag in POPULAR_GENRES" 
                        :key="tag" 
                        size="small" 
                        class="cursor-pointer hover:scale-105 transition-transform"
                        :effect="isLight ? 'plain' : 'dark'"
                        @click="selectGenre(tag)"
                      >
                        {{ tag }}
                      </el-tag>
                    </div>
                  </div>
                </el-popover>
              </el-form-item>
            </div>

            <!-- 3. Core Audience & Style -->
            <div class="mb-6 relative z-10 px-6 pb-6" id="section-style">
              <h3 class="font-bold mb-4 flex items-center gap-2" :class="isLight ? 'text-slate-800' : 'text-slate-100'">
                <span class="w-1.5 h-1.5 bg-pink-500 rounded-full glow-dot"></span>
                核心受众
              </h3>
              
              <div class="p-1 rounded-xl flex mb-6 border" :class="isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/80 border-slate-800'">
                 <div 
                    v-for="audience in audiences"
                    :key="audience.value"
                    class="flex-1 text-center py-1.5 text-xs font-medium cursor-pointer rounded-lg transition-all relative z-10"
                    :class="form.audience === audience.value ? (isLight ? 'text-indigo-600 bg-white shadow-sm' : 'text-white bg-slate-700 shadow-sm') : (isLight ? 'text-slate-500 hover:text-slate-700' : 'text-slate-400 hover:text-slate-200')"
                    @click="form.audience = audience.value"
                 >
                    {{ audience.label }}
                 </div>
              </div>

              <!-- Style Selection -->
              <div class="mb-4 relative z-20">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="font-bold flex items-center gap-2" :class="isLight ? 'text-slate-800' : 'text-slate-100'">
                    <span class="w-1.5 h-1.5 bg-pink-500 rounded-full glow-dot"></span>
                    风格倾向
                  </h3>
                  <el-tooltip content="推荐搭配：玄幻+热血=主流男频；都市+甜宠=热门女频" placement="top">
                    <span class="text-xs cursor-help underline decoration-dashed" :class="isLight ? 'text-slate-400' : 'text-slate-500'">搭配建议</span>
                  </el-tooltip>
                </div>

                <el-form-item prop="styles">
                  <el-popover
                    placement="right"
                    :width="280"
                    trigger="hover"
                    :effect="isLight ? 'light' : 'dark'"
                  >
                    <template #reference>
                      <div 
                        class="w-full min-h-[48px] rounded-xl border p-2 cursor-pointer transition-all hover:border-pink-500/50 flex flex-wrap gap-2 items-center group relative"
                        :class="isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700/50'"
                        @click="showStyleDialog = true"
                      >
                        <span v-if="form.styles.length === 0" class="text-sm px-2 opacity-50 transition-opacity" :class="isLight ? 'text-slate-500' : 'text-slate-400'">
                          {{ stylePlaceholder }}
                        </span>
                        <el-tag 
                          v-for="style in form.styles" 
                          :key="style" 
                          size="small" 
                          :effect="isLight ? 'light' : 'dark'"
                          closable
                          class="pointer-events-auto"
                          :class="isLight ? '!bg-pink-50 !border-pink-200 !text-pink-600' : '!bg-pink-500/20 !border-pink-500/30 !text-pink-200'"
                          @close.stop="removeStyle(style)"
                        >
                          {{ style }}
                        </el-tag>
                        <div class="ml-auto px-2 flex items-center gap-2">
                           <el-icon class="opacity-0 group-hover:opacity-100 transition-opacity text-pink-400"><Star /></el-icon>
                           <el-icon :class="isLight ? 'text-slate-400' : 'text-slate-500'"><ArrowDown /></el-icon>
                        </div>
                      </div>
                    </template>
                    <div class="p-2">
                      <div class="text-xs font-bold mb-2 flex items-center gap-1" :class="isLight ? 'text-slate-500' : 'text-slate-400'">
                        <el-icon class="text-yellow-500"><Star /></el-icon> 热门推荐
                      </div>
                      <div class="flex flex-wrap gap-2">
                        <el-tag 
                          v-for="tag in POPULAR_STYLES" 
                          :key="tag" 
                          size="small" 
                          class="cursor-pointer hover:scale-105 transition-transform"
                          :effect="isLight ? 'plain' : 'dark'"
                          @click="toggleStyle(tag)"
                        >
                          {{ tag }}
                        </el-tag>
                      </div>
                    </div>
                  </el-popover>
                </el-form-item>
              </div>

              <!-- Tags Selection -->
              <div class="relative z-20">
                <div class="font-bold mb-2 flex items-center gap-1" :class="isLight ? 'text-slate-800' : 'text-slate-100'">
                  标签
                </div>
                <div class="rounded-xl p-3 border transition-all cursor-pointer group/tags min-h-[46px]" :class="isLight ? 'bg-slate-50 border-slate-200 hover:border-indigo-300' : 'bg-slate-800/40 border-slate-700/50 hover:border-indigo-500/30'" @click.stop="showTagDialog = true">
                  <div class="flex flex-wrap gap-2 pointer-events-none">
                    <span v-if="form.tags.length === 0" class="text-sm" :class="isLight ? 'text-slate-400' : 'text-slate-400'">点击选择标签...</span>
                    <el-tag 
                      v-for="tag in form.tags" 
                      :key="tag" 
                      size="small" 
                      :effect="isLight ? 'light' : 'dark'"
                      closable
                      class="pointer-events-auto"
                      :class="isLight ? '!bg-indigo-50 !border-indigo-200 !text-indigo-600' : '!bg-indigo-500/20 !border-indigo-500/30 !text-indigo-200'"
                      @close.stop="removeTag(tag)"
                    >
                      {{ tag }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Creative Content -->
        <div class="lg:col-span-8 space-y-6">
          
          <!-- Title Input (Required) -->
          <div class="rounded-2xl shadow-lg border p-6" :class="isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'" id="section-title">
             <div class="flex justify-between items-center mb-3">
              <span class="font-bold flex items-center" :class="isLight ? 'text-slate-800' : 'text-slate-100'">
                <span class="text-red-500 mr-1">*</span> 作品名称
              </span>
              <el-button link type="primary" @click="aiHelpWrite('title')">
                <el-icon class="mr-1"><Refresh /></el-icon> 换个名字
              </el-button>
            </div>
            <el-form-item prop="title">
              <el-input
                v-model="form.title"
                placeholder="请输入引人注目的标题..."
                size="large"
                maxlength="50"
                show-word-limit
                class="text-lg font-bold"
                :class="isLight ? 'light-input' : 'dark-input'"
              >
                <template #prefix>
                  <el-icon class="text-slate-500"><Reading /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </div>

          <!-- World & Plot -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="rounded-2xl shadow-lg border p-5 flex flex-col h-full transition-colors" :class="isLight ? 'bg-white border-slate-200 hover:border-blue-300' : 'bg-slate-800 border-slate-700 hover:border-blue-500/30'" id="section-world">
              <div class="flex justify-between items-center mb-3">
                <span class="font-bold flex items-center" :class="isLight ? 'text-slate-800' : 'text-slate-100'">
                  <el-icon class="mr-1 text-blue-400"><Place /></el-icon> 世界观设定
                </span>
                <el-button size="small" type="primary" plain round @click="aiHelpWrite('worldView')" :class="isLight ? '!bg-blue-50 !border-blue-200 !text-blue-600' : '!bg-blue-500/10 !border-blue-500/30 !text-blue-400 hover:!bg-blue-500/20'">
                   <el-icon class="mr-1"><MagicStick /></el-icon> AI 生成
                </el-button>
              </div>
              <el-input
                v-model="form.worldView"
                type="textarea"
                :rows="6"
                maxlength="500"
                show-word-limit
                placeholder="赛博朋克 / 修仙界 / 维多利亚蒸汽朋克..."
                class="flex-1"
                :class="isLight ? 'light-textarea' : 'dark-textarea'"
              />
            </div>

            <div class="rounded-2xl shadow-lg border p-5 flex flex-col h-full transition-colors" :class="isLight ? 'bg-white border-slate-200 hover:border-yellow-300' : 'bg-slate-800 border-slate-700 hover:border-yellow-500/30'" id="section-golden">
              <div class="flex justify-between items-center mb-3">
                <span class="font-bold flex items-center" :class="isLight ? 'text-slate-800' : 'text-slate-100'">
                  <el-icon class="mr-1 text-yellow-400"><Key /></el-icon> 核心金手指
                </span>
                <el-button size="small" type="primary" plain round @click="aiHelpWrite('goldenFinger')" :class="isLight ? '!bg-yellow-50 !border-yellow-200 !text-yellow-600' : '!bg-yellow-500/10 !border-yellow-500/30 !text-yellow-400 hover:!bg-yellow-500/20'">
                   <el-icon class="mr-1"><MagicStick /></el-icon> AI 生成
                </el-button>
              </div>
              <el-input
                v-model="form.goldenFinger"
                type="textarea"
                :rows="6"
                maxlength="300"
                show-word-limit
                placeholder="系统 / 老爷爷 / 特殊异能..."
                class="flex-1"
                :class="isLight ? 'light-textarea' : 'dark-textarea'"
              />
            </div>
          </div>

          <!-- Main Plot -->
          <div class="rounded-2xl shadow-lg border p-5 transition-colors" :class="isLight ? 'bg-white border-slate-200 hover:border-red-300' : 'bg-slate-800 border-slate-700 hover:border-red-500/30'" id="section-plot">
             <div class="flex justify-between items-center mb-3">
                <span class="font-bold flex items-center" :class="isLight ? 'text-slate-800' : 'text-slate-100'">
                  <span class="text-red-500 mr-1">*</span>
                  <el-icon class="mr-1 text-red-400"><TrendCharts /></el-icon> 主线剧情
                </span>
                <el-button size="small" type="primary" plain round @click="aiHelpWrite('mainPlot')" :class="isLight ? '!bg-red-50 !border-red-200 !text-red-600' : '!bg-red-500/10 !border-red-500/30 !text-red-400 hover:!bg-red-500/20'">
                   <el-icon class="mr-1"><MagicStick /></el-icon> AI 生成
                </el-button>
              </div>
              <el-form-item prop="mainPlot">
                <el-input
                  v-model="form.mainPlot"
                  type="textarea"
                  :rows="4"
                  maxlength="800"
                  show-word-limit
                  placeholder="讲述一个怎样的故事？起承转合..."
                  :class="isLight ? 'light-textarea' : 'dark-textarea'"
                />
              </el-form-item>
          </div>

           <!-- Accordion: Character & Synopsis & Requirements -->
          <div class="rounded-2xl shadow-lg border overflow-hidden" :class="isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'">
             <el-collapse v-model="activeCollapse" :class="isLight ? 'light-collapse' : 'dark-collapse'">
               
               <!-- Character Info -->
               <el-collapse-item name="characterInfo" id="section-character">
                 <template #title>
                   <div class="flex items-center gap-2 font-bold px-4 text-base w-full">
                     <span class="text-red-500">*</span> 角色档案
                     <el-tag size="small" type="info" class="ml-auto">核心</el-tag>
                   </div>
                 </template>
                 <div class="p-4 pt-0">
                    <div class="flex justify-end mb-2 gap-2">
                       <el-button size="small" link @click.stop="fillExample('characterInfo')">填充示例</el-button>
                       <el-button size="small" type="primary" plain round @click="aiHelpWrite('characterInfo')" :class="isLight ? '!bg-indigo-50 !border-indigo-200 !text-indigo-600' : '!bg-indigo-500/10 !border-indigo-500/30 !text-indigo-400 hover:!bg-indigo-500/20'">
                         <el-icon class="mr-1"><MagicStick /></el-icon> AI 生成
                       </el-button>
                    </div>
                    <el-form-item prop="characterInfo">
                      <el-input
                        v-model="form.characterInfo"
                        type="textarea"
                        :rows="6"
                        maxlength="1000"
                        show-word-limit
                        placeholder="主角姓名、性格、外貌..."
                        :class="isLight ? 'light-textarea' : 'dark-textarea'"
                      />
                    </el-form-item>
                 </div>
               </el-collapse-item>

               <!-- Synopsis -->
               <el-collapse-item name="synopsis" id="section-synopsis">
                 <template #title>
                   <div class="flex items-center gap-2 font-bold px-4 text-base w-full">
                     <span class="text-red-500">*</span> 作品简介
                   </div>
                 </template>
                 <div class="p-4 pt-0">
                    <div class="flex justify-end mb-2 gap-2">
                       <el-button size="small" link @click.stop="fillExample('synopsis')">填充示例</el-button>
                       <el-button size="small" type="primary" plain round @click="aiHelpWrite('synopsis')" :class="isLight ? '!bg-indigo-50 !border-indigo-200 !text-indigo-600' : '!bg-indigo-500/10 !border-indigo-500/30 !text-indigo-400 hover:!bg-indigo-500/20'">
                         <el-icon class="mr-1"><MagicStick /></el-icon> AI 生成
                       </el-button>
                    </div>
                    <el-form-item prop="synopsis">
                      <el-input
                        v-model="form.synopsis"
                        type="textarea"
                        :rows="6"
                        maxlength="500"
                        show-word-limit
                        placeholder="吸引读者的简介..."
                        :class="isLight ? 'light-textarea' : 'dark-textarea'"
                      />
                    </el-form-item>
                 </div>
               </el-collapse-item>

               <!-- Requirements -->
               <el-collapse-item name="requirements" id="section-requirements">
                 <template #title>
                   <div class="flex items-center gap-2 font-bold px-4 text-base w-full">
                     创作要求
                     <el-tag size="small" type="warning" effect="dark" class="ml-2">⚠️ 重要</el-tag>
                   </div>
                 </template>
                 <div class="p-4 pt-0">
                    <div class="mb-3 text-xs opacity-70 flex items-center gap-1" :class="isLight ? 'text-slate-500' : 'text-slate-400'">
                      <el-icon><InfoFilled /></el-icon> 在此指定写作风格、伏笔或主题深度，将直接影响 AI 生成质量。
                    </div>
                    <div class="flex justify-end mb-2 gap-2">
                       <el-button size="small" link @click.stop="fillExample('requirements')">填充示例</el-button>
                       <el-button size="small" type="primary" plain round @click="aiHelpWrite('requirements')" :class="isLight ? '!bg-indigo-50 !border-indigo-200 !text-indigo-600' : '!bg-indigo-500/10 !border-indigo-500/30 !text-indigo-400 hover:!bg-indigo-500/20'">
                         <el-icon class="mr-1"><MagicStick /></el-icon> AI 生成
                       </el-button>
                    </div>
                    <el-form-item prop="requirements">
                      <el-input
                        v-model="form.requirements"
                        type="textarea"
                        :rows="6"
                        maxlength="500"
                        show-word-limit
                        placeholder="额外的创作要求、避雷点等..."
                        :class="isLight ? 'light-textarea' : 'dark-textarea'"
                      />
                    </el-form-item>
                 </div>
               </el-collapse-item>

             </el-collapse>
          </div>
          
          <!-- Submit Area (Optimized) -->
          <div class="sticky bottom-0 z-40 py-4 -mx-6 px-6 backdrop-blur-md transition-colors border-t mt-6 flex items-center justify-end gap-4" :class="isLight ? 'bg-white/90 border-slate-200' : 'bg-slate-900/90 border-slate-800'">
             <div class="text-sm mr-auto" :class="isLight ? 'text-slate-500' : 'text-slate-400'">
               <span v-if="!form.title" class="text-red-400 flex items-center"><el-icon class="mr-1"><Warning /></el-icon> 请先输入作品名称</span>
               <span v-else class="text-green-500 flex items-center"><el-icon class="mr-1"><CircleCheck /></el-icon> 准备就绪</span>
             </div>
             
             <el-dropdown split-button type="primary" size="large" class="custom-split-button !h-12" @click="createWork" @command="handleSmartGenerate">
               <span class="flex items-center text-lg font-bold px-4">
                 <el-icon class="mr-2"><EditPen /></el-icon> 开始创作
               </span>
               <template #dropdown>
                 <el-dropdown-menu :class="isLight ? '' : 'dark-dropdown'">
                   <el-dropdown-item command="complete">
                     <div class="flex flex-col py-1">
                       <span class="font-bold">基于设定补全</span>
                       <span class="text-xs opacity-70">保留已有内容，仅生成空白项</span>
                     </div>
                   </el-dropdown-item>
                   <el-dropdown-item command="scratch" divided>
                     <div class="flex flex-col py-1 text-red-400">
                       <span class="font-bold">从零生成全部</span>
                       <span class="text-xs opacity-70">将覆盖当前所有内容</span>
                     </div>
                   </el-dropdown-item>
                 </el-dropdown-menu>
               </template>
             </el-dropdown>
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
  Star
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
  { id: 'section-specs', label: '剧本规格' },
  { id: 'section-genre', label: '题材设定' },
  { id: 'section-style', label: '风格倾向' },
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
  styles: [{ type: 'array', required: true, message: '请至少选择一个风格', trigger: 'change' }]
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

onMounted(() => {
  // Placeholder rotation
  setInterval(() => {
    genrePlaceholderIndex.value = (genrePlaceholderIndex.value + 1) % genrePlaceholders.length
    stylePlaceholderIndex.value = (stylePlaceholderIndex.value + 1) % stylePlaceholders.length
  }, 3000)

  if (route.query.mode === 'create') {
    isCreating.value = true
  }
  
  // Load draft if exists
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
  isCreating.value = true
}

const openProject = (id: number) => {
  isCreating.value = true
  // In a real app, you would load the project data here
  ElMessage.success(`打开项目 #${id}`)
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
    worldView: "2077年，世界被巨型企业'荒坂'与'军用科技'瓜分。神经接口技术普及，人类意识可以上传至云端'灵魂杀手'。",
    goldenFinger: "主角拥有名为'幽灵协议'的神秘代码，可以无痕入侵任何未物理隔绝的系统。",
    mainPlot: "黑客'V'在一次常规的数据窃取任务中，意外下载了一份加密文件，该文件揭示了企业高层利用AI操控人类意识的惊天阴谋。",
    characterInfo: "主角：V (文森特/瓦莱丽)，24岁，前荒坂情报部特工，现自由佣兵。性格冷酷但重情义，装配有军用级斯安威斯坦义体。",
    synopsis: "在霓虹闪烁的夜之城，肉体是脆弱的，唯有数据永存。当顶尖黑客触碰到世界的真相，是选择沉默地消亡，还是化作燃烧城市的烈火？",
    title: "夜之城：数据幽灵",
    requirements: "1. 突出赛博朋克的高科技低生活特点\n2. 战斗场面要充满速度感和暴力美学"
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

  ElMessage.success('正在构建虚拟世界...')
  setTimeout(() => {
    router.push('/novel-generator')
  }, 1000)
}
</script>

<style scoped>
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
</style>

<style>
/* Global Dialog Styles */
.dark-dialog {
  background-color: #1e293b !important; /* slate-800 */
  border: 1px solid #334155 !important;
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