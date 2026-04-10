<template>
  <div class="h-full flex flex-col bg-[#F8FAFC] dark:bg-slate-900 relative overflow-hidden">
    <!-- Decorative background elements -->
    <div class="absolute -top-40 -right-40 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none"></div>

    <!-- Main Content: Top Creation Area -->
    <div class="flex-1 overflow-y-auto p-4 lg:p-6 relative z-10 flex flex-col min-h-0 custom-scrollbar">
      <div class="max-w-7xl mx-auto flex flex-col items-center w-full">
        <!-- Header: More compact -->
        <div class="text-center mb-4 max-w-3xl shrink-0 relative w-full">
          <!-- Product Design Info Button -->
          <button 
            @click="showDesignDialog = true"
            class="absolute top-0 right-0 md:right-[-40px] h-8 px-3 flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-500 dark:text-slate-400 rounded-full font-bold text-[10px] shadow-sm border border-slate-200/50 dark:border-slate-700/50 hover:text-indigo-600 hover:border-indigo-300 transition-all duration-300"
          >
            <el-icon :size="12"><InfoFilled /></el-icon>
            <span>产品设计说明</span>
          </button>
          
          <h1 class="text-2xl md:text-3xl font-black mb-2 tracking-tight leading-tight">
            <span class="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
              智能极速创作，打造爆款短剧
            </span>
          </h1>
          <p class="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium leading-relaxed opacity-70">
            AI全流程辅助，内置高转化剧情模板，让创意触手可及。
          </p>
        </div>

        <!-- Creation Card: More compact and color-distinguished -->
        <div class="w-full max-w-5xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl rounded-[32px] shadow-xl shadow-indigo-500/5 border border-white dark:border-slate-700/50 overflow-hidden mb-6 transition-all duration-500 shrink-0">
          <div class="p-1 bg-slate-100/50 dark:bg-slate-900/50 flex m-2 rounded-[18px]">
            <button 
              class="flex-1 py-2 text-[14px] font-black transition-all rounded-[14px] flex items-center justify-center gap-2"
              :class="activeTab === 'ai' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm scale-[1.01]' : 'text-slate-500 hover:text-slate-700'"
              @click="activeTab = 'ai'"
            >
              <el-icon :size="16"><MagicStick /></el-icon> AI 灵感生成
            </button>
            <button 
              class="flex-1 py-2 text-[14px] font-black transition-all rounded-[14px] flex items-center justify-center gap-2"
              :class="activeTab === 'upload' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm scale-[1.01]' : 'text-slate-500 hover:text-slate-700'"
              @click="activeTab = 'upload'"
            >
              <el-icon :size="16"><Upload /></el-icon> 导入已有剧本
            </button>
          </div>

          <div class="px-6 py-4 md:px-8 md:py-5 pt-1">
            <div class="min-h-[280px] flex flex-col">
              <!-- AI Tab Content -->
              <div v-if="activeTab === 'ai'" class="flex flex-col gap-5 animate-fade-in h-full">
                <div class="relative group mt-4">
                  <!-- Dynamic Glowing Border -->
                  <div 
                    class="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[30px] blur-xl opacity-0 transition-all duration-1000"
                    :class="isGenerating ? 'opacity-30 animate-pulse' : 'group-focus-within:opacity-15'"
                  ></div>
                  
                  <div class="relative bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 group-focus-within:border-indigo-500/40 transition-all overflow-hidden shadow-2xl shadow-indigo-500/5">
                    <textarea 
                      v-model="aiPrompt"
                      class="w-full h-40 md:h-48 resize-none bg-transparent outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400/60 text-lg p-8 transition-all font-medium leading-relaxed"
                      placeholder="在此输入你构想的故事内容。比如：一个在赛博朋克世界里寻找失踪妹妹的私家侦探..."
                    ></textarea>
                    
                    <!-- Textarea Bottom Toolbar -->
                    <div class="px-6 py-4 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                      <div class="flex items-center gap-4 text-slate-400">
                        <span class="text-[11px] font-bold flex items-center gap-1.5 bg-white dark:bg-slate-700 px-3 py-1 rounded-full shadow-sm">
                          <el-icon class="text-indigo-500"><EditPen /></el-icon> {{ aiPrompt.length }} 字
                        </span>
                        <div class="w-px h-4 bg-slate-200 dark:bg-slate-700"></div>
                        <div class="flex items-center gap-1">
                          <button class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 hover:text-indigo-600 transition-all shadow-sm" title="清空内容" @click="aiPrompt = ''" v-if="aiPrompt">
                            <el-icon :size="14"><Delete /></el-icon>
                          </button>
                          <button class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 hover:text-indigo-600 transition-all shadow-sm" title="优化描述">
                            <el-icon :size="14"><Brush /></el-icon>
                          </button>
                        </div>
                      </div>
                      
                      <div class="flex items-center gap-3">
                         <span v-if="isGenerating" class="text-[11px] font-bold text-indigo-600 animate-pulse mr-2 flex items-center gap-1.5">
                           <el-icon class="is-loading"><Loading /></el-icon> 正在为您构思精彩剧情...
                         </span>
                         <button 
                          class="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl text-[14px] font-black hover:shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-40 disabled:grayscale"
                          :disabled="!aiPrompt.trim() || isGenerating"
                          @click="startCreation"
                        >
                          <el-icon v-if="!isGenerating" :size="18"><MagicStick /></el-icon>
                          <span>立即创作</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Featured Categories -->
                <div class="flex flex-col items-center gap-4 mt-2">
                  <div class="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-60">
                    <span class="w-8 h-[1px] bg-slate-200"></span>
                    热门题材灵感
                    <span class="w-8 h-[1px] bg-slate-200"></span>
                  </div>
                  <div class="flex flex-wrap items-center justify-center gap-3">
                    <div 
                      v-for="topic in hotTopics" 
                      :key="topic.label" 
                      @click="selectHotTopic(topic)"
                      class="px-5 py-2 rounded-2xl text-[13px] font-bold cursor-pointer transition-all flex items-center gap-2 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md hover:-translate-y-0.5 group"
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-indigo-400 transition-colors"></span>
                      {{ topic.label }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Upload Tab Content -->
              <div v-if="activeTab === 'upload'" class="py-1 animate-fade-in h-full flex flex-col justify-center">
                <el-upload
                  drag
                  action="#"
                  :auto-upload="false"
                  class="custom-upload-v2 w-full h-full"
                  @change="handleFileUpload"
                >
                  <div class="py-6">
                    <div class="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <el-icon :size="24"><upload-filled /></el-icon>
                    </div>
                    <div class="el-upload__text text-slate-500 dark:text-slate-400 font-bold text-base mb-1">
                      将剧本文件拖到此处，或 <em class="text-indigo-600 dark:text-indigo-400 not-italic">点击上传</em>
                    </div>
                    <div class="text-slate-400 text-[12px] font-medium">
                      支持 docx, pdf, txt 格式，不超过 20MB
                    </div>
                  </div>
                </el-upload>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Projects Section -->
        <div class="w-full relative flex-1 min-h-0 flex flex-col bg-slate-50/50 dark:bg-slate-900/30 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800">
          <div class="flex items-center justify-between mb-4 shrink-0">
            <h2 class="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              <span class="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
              近期作品
              <span class="text-slate-300 font-light text-lg">/</span>
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Recent Projects</span>
            </h2>
            <button 
              @click="router.push('/ai-short-drama-creator/works')" 
              class="group h-8 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-black text-[11px] transition-all flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95"
            >
              <span>管理作品</span>
              <el-icon class="group-hover:translate-x-1 transition-transform" :size="12"><ArrowRight /></el-icon>
            </button>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 overflow-hidden">
            <div 
              v-for="work in recentWorks.slice(0, 4)" 
              :key="work.id"
              class="bg-white dark:bg-slate-800 rounded-[20px] overflow-hidden border border-slate-100/50 dark:border-slate-700 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-500 cursor-pointer group flex flex-col"
              @click="router.push('/ai-short-drama-creator/outline')"
            >
              <!-- Previews Area: More compact -->
              <div class="h-24 bg-slate-100 dark:bg-slate-900 flex p-1 gap-1 overflow-hidden relative shrink-0">
                <template v-if="work.previews && work.previews.length > 0">
                  <div 
                    v-for="(img, idx) in work.previews" 
                    :key="idx"
                    class="flex-1 h-full rounded-lg overflow-hidden bg-slate-200"
                  >
                    <img :src="img" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  </div>
                </template>
                <div v-else class="w-full h-full flex items-center justify-center text-indigo-200 dark:text-indigo-900/30 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 rounded-lg">
                   <el-icon size="24" class="opacity-40 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500"><VideoCamera /></el-icon>
                </div>
                <div v-if="work.isExample" class="absolute top-2 left-2 px-1.5 py-0.5 bg-purple-600/90 backdrop-blur-sm text-white text-[8px] font-black uppercase tracking-widest rounded shadow-lg z-10">
                  Example
                </div>
              </div>

              <div class="p-3 flex flex-col gap-1.5">
                <h3 class="font-black text-slate-800 dark:text-white truncate text-[14px] group-hover:text-indigo-600 transition-colors" :title="work.title">
                  {{ work.title }}
                </h3>
                <div class="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                  <div class="flex items-center gap-1">
                    <el-icon class="text-indigo-500" :size="10"><Clock /></el-icon>
                    <span>{{ work.updatedAt.split(' ')[0] }}</span>
                  </div>
                  <span v-if="work.episodes" class="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
                    {{ work.episodes }} 集
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State for Recent Projects -->
          <div v-if="recentWorks.length === 0" class="py-20 flex flex-col items-center justify-center bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400">
            <div class="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-4">
              <el-icon size="32" class="opacity-20"><VideoCamera /></el-icon>
            </div>
            <p class="font-bold text-lg mb-1">暂无制作中的短剧</p>
            <p class="text-sm opacity-60">开启您的第一场 AI 剧本创作之旅吧</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Hot Topic Configuration Dialog -->
    <el-dialog 
      v-model="showHotTopicDialog" 
      :title="null"
      width="800px" 
      class="hot-topic-dialog rounded-[32px] overflow-hidden" 
      :show-close="false"
      destroy-on-close
    >
      <div class="relative min-h-[500px] flex flex-col bg-white dark:bg-slate-900">
        <!-- Close Button -->
        <button 
          @click="showHotTopicDialog = false" 
          class="absolute top-6 right-6 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100/50 dark:bg-slate-800/50 text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
        >
          <el-icon :size="20"><Close /></el-icon>
        </button>

        <!-- Sidebar / Progress -->
        <div class="flex flex-1">
          <div class="w-1/3 bg-slate-50 dark:bg-slate-800/50 p-8 border-r border-slate-100 dark:border-slate-800 flex flex-col">
            <div class="mb-10">
              <div class="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-500/20">
                <el-icon :size="24"><MagicStick /></el-icon>
              </div>
              <h2 class="text-xl font-black text-slate-800 dark:text-white">基础设定</h2>
              <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Basic Settings</p>
            </div>

            <div class="space-y-6 flex-1">
              <div 
                v-for="step in [1, 2, 3]" 
                :key="step"
                class="flex items-center gap-4 transition-all duration-500"
                :class="currentStep >= step ? 'opacity-100' : 'opacity-30'"
              >
                <div 
                  class="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-black transition-all duration-500"
                  :class="currentStep === step ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-500/30' : (currentStep > step ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500')"
                >
                  <el-icon v-if="currentStep > step"><Check /></el-icon>
                  <span v-else>{{ step }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-[13px] font-black" :class="currentStep === step ? 'text-indigo-600' : 'text-slate-500'">
                    {{ step === 1 ? '主角设定' : (step === 2 ? '核心冲突' : '发行参数') }}
                  </span>
                  <span class="text-[10px] text-slate-400 font-medium">{{ step === 1 ? '塑造灵魂人物' : (step === 2 ? '引爆剧情张力' : '设定目标受众') }}</span>
                </div>
              </div>
            </div>

            <div class="mt-auto p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
              <p class="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold leading-relaxed">
                <el-icon class="mr-1"><InfoFilled /></el-icon>
                AI 将根据您的选择，为您生成专属的爆款剧本大纲。
              </p>
            </div>
          </div>

          <!-- Content Area -->
          <div class="w-2/3 p-10 flex flex-col h-full overflow-y-auto custom-scrollbar">
            <!-- Step 1: Protagonist -->
            <div v-if="currentStep === 1" class="animate-fade-in space-y-6">
              <div class="mb-6">
                <h3 class="text-2xl font-black text-slate-800 dark:text-white mb-2">选择主角设定</h3>
                <p class="text-slate-400 text-sm">主角是故事的核心，选择一个最具张力的设定。</p>
              </div>

              <div class="grid grid-cols-1 gap-4">
                <div 
                  v-for="opt in protagonistOptions" 
                  :key="opt.label"
                  @click="configForm.protagonistSetting = opt.label"
                  class="p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center gap-4 group hover:-translate-y-1"
                  :class="configForm.protagonistSetting === opt.label ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/20 shadow-xl shadow-indigo-500/5' : 'border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-700 bg-white dark:bg-slate-800'"
                >
                  <div class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all" :class="configForm.protagonistSetting === opt.label ? 'bg-indigo-600 text-white' : ''">
                    <el-icon :size="24"><component :is="opt.icon" /></el-icon>
                  </div>
                  <div class="flex-1">
                    <h4 class="font-black text-slate-800 dark:text-white mb-1">{{ opt.label }}</h4>
                    <p class="text-xs text-slate-400 leading-relaxed">{{ opt.desc }}</p>
                  </div>
                  <div v-if="configForm.protagonistSetting === opt.label" class="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                    <el-icon><Check /></el-icon>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 2: Conflict -->
            <div v-if="currentStep === 2" class="animate-fade-in space-y-6">
              <div class="mb-6">
                <h3 class="text-2xl font-black text-slate-800 dark:text-white mb-2">设定核心冲突</h3>
                <p class="text-slate-400 text-sm">冲突决定了故事的节奏与看点，选择一个吸睛的设定。</p>
              </div>

              <div class="grid grid-cols-1 gap-4">
                <div 
                  v-for="opt in conflictOptions" 
                  :key="opt.label"
                  @click="configForm.conflictSetting = opt.label"
                  class="p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center gap-4 group hover:-translate-y-1"
                  :class="configForm.conflictSetting === opt.label ? 'border-purple-500 bg-purple-50/30 dark:bg-purple-900/20 shadow-xl shadow-purple-500/5' : 'border-slate-100 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-700 bg-white dark:bg-slate-800'"
                >
                  <div class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-purple-600 group-hover:text-white transition-all" :class="configForm.conflictSetting === opt.label ? 'bg-purple-600 text-white' : ''">
                    <el-icon :size="24"><component :is="opt.icon" /></el-icon>
                  </div>
                  <div class="flex-1">
                    <h4 class="font-black text-slate-800 dark:text-white mb-1">{{ opt.label }}</h4>
                    <p class="text-xs text-slate-400 leading-relaxed">{{ opt.desc }}</p>
                  </div>
                  <div v-if="configForm.conflictSetting === opt.label" class="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white">
                    <el-icon><Check /></el-icon>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 3: Parameters -->
            <div v-if="currentStep === 3" class="animate-fade-in space-y-8">
              <div class="mb-6">
                <h3 class="text-2xl font-black text-slate-800 dark:text-white mb-2">发行与参数</h3>
                <p class="text-slate-400 text-sm">设定剧本的目标受众与体量，优化内容产出。</p>
              </div>

              <div class="space-y-6">
                <div class="space-y-3">
                  <label class="text-sm font-black text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <span class="w-1 h-4 bg-indigo-500 rounded-full"></span> 目标受众
                  </label>
                  <div class="flex flex-wrap gap-3">
                    <div 
                      v-for="aud in audienceOptions" 
                      :key="aud"
                      @click="configForm.targetAudience = aud"
                      class="px-6 py-2.5 rounded-xl border-2 font-bold text-sm cursor-pointer transition-all"
                      :class="configForm.targetAudience === aud ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-indigo-200'"
                    >
                      {{ aud }}
                    </div>
                  </div>
                </div>

                <div class="space-y-3">
                  <label class="text-sm font-black text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <span class="w-1 h-4 bg-indigo-500 rounded-full"></span> 剧本集数
                  </label>
                  <div class="grid grid-cols-3 gap-4">
                    <div 
                      v-for="opt in episodeOptions" 
                      :key="opt.label"
                      @click="configForm.episodesCount = opt.count"
                      class="p-4 rounded-2xl border-2 cursor-pointer transition-all text-center group"
                      :class="configForm.episodesCount === opt.count ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/20' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-indigo-200'"
                    >
                      <div class="text-lg font-black mb-1" :class="configForm.episodesCount === opt.count ? 'text-indigo-600' : 'text-slate-800 dark:text-white'">{{ opt.count }} 集</div>
                      <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{{ opt.label }}</div>
                      <p class="text-[10px] text-slate-400 leading-tight group-hover:text-slate-500">{{ opt.desc }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer Buttons -->
            <div class="mt-auto pt-10 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <button 
                v-if="currentStep > 1"
                @click="prevStep" 
                class="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <el-icon><ArrowLeft /></el-icon> 上一步
              </button>
              <div v-else></div>

              <button 
                @click="nextStep"
                :disabled="currentStep === 1 && !configForm.protagonistSetting || currentStep === 2 && !configForm.conflictSetting"
                class="flex items-center gap-2 px-10 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/20 hover:scale-[1.03] active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                <span>{{ currentStep === 3 ? '开始智能创作' : '下一步' }}</span>
                <el-icon v-if="currentStep < 3"><ArrowRight /></el-icon>
                <el-icon v-else><MagicStick /></el-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- Product Design Dialog -->
    <el-dialog v-model="showDesignDialog" title="产品设计说明 - 新建短剧" width="700px" class="rounded-[24px] !bg-[#f8fafc] dark:!bg-slate-900 overflow-hidden" :show-close="false">
      <template #header="{ close, titleId, titleClass }">
        <div class="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
              <el-icon :size="20"><Document /></el-icon>
            </div>
            <h4 :id="titleId" :class="[titleClass, 'text-xl font-black text-slate-800 dark:text-white m-0']">产品设计说明 - 新建短剧</h4>
          </div>
          <button @click="close" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
            <el-icon :size="20"><Close /></el-icon>
          </button>
        </div>
      </template>
      
      <div class="px-6 py-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
        <div class="prose dark:prose-invert max-w-none">
          <h3 class="text-indigo-600 font-bold flex items-center gap-2 mb-4"><el-icon><Location /></el-icon>页面定位</h3>
          <p class="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">项目初始化页面，决定内容生成的输入源（灵感/现有剧本）。</p>

          <h3 class="text-indigo-600 font-bold flex items-center gap-2 mb-4"><el-icon><Monitor /></el-icon>原型布局概要</h3>
          <ul class="space-y-3 mb-6">
            <li class="flex items-start gap-2 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-50 dark:border-slate-700/50">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
              <span class="text-slate-600 dark:text-slate-300"><strong>模式 A：一句话灵感生成</strong>（输入文本框：“霸道总裁爱上我，但我是来复仇的”）。</span>
            </li>
            <li class="flex items-start gap-2 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-50 dark:border-slate-700/50">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
              <span class="text-slate-600 dark:text-slate-300"><strong>模式 B：导入小说/剧本</strong>（支持上传 txt/docx/pdf 文件）。</span>
            </li>
          </ul>

          <h3 class="text-indigo-600 font-bold flex items-center gap-2 mb-4"><el-icon><Pointer /></el-icon>核心交互</h3>
          <ul class="space-y-3">
            <li class="flex items-start gap-2 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-50 dark:border-slate-700/50">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
              <span class="text-slate-600 dark:text-slate-300">用户选择模式 A 或 B 并输入内容后，点击“生成大纲”按钮。按钮呈现 Loading 状态，页面平滑过渡到 OutlineView。</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
        <button @click="showDesignDialog = false" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-sm">
          我已了解
        </button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Upload, 
  UploadFilled, 
  MagicStick, 
  EditPen, 
  DocumentAdd, 
  Refresh,
  Brush,
  Picture,
  Clock,
  ArrowRight,
  ArrowLeft,
  VideoCamera,
  InfoFilled,
  Close,
  Document,
  Location,
  Monitor,
  Pointer,
  Delete,
  Star,
  Lightning,
  Collection,
  Check,
  User,
  Avatar,
  UserFilled,
  StarFilled,
  Link,
  Warning,
  Heart,
  GoldMedal
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

import { useDramaStore } from '../../store/drama';

const router = useRouter();
const dramaStore = useDramaStore();
const isLight = inject('isLight', ref(true));
const showDesignDialog = ref(false);
const showHotTopicDialog = ref(false);
const currentStep = ref(1);
const selectedTopic = ref<any>(null);

// --- State Management ---
const activeTab = ref('ai'); 
const aiPrompt = ref('');
const isGenerating = ref(false);

// Configuration state
const configForm = reactive({
  scriptType: 'short_drama',
  genre: '',
  targetAudience: '女性向',
  episodesCount: 80,
  expectedDuration: 120,
  protagonistSetting: '',
  conflictSetting: '',
  themeSetting: ''
});

// Hot Topics with templates
const hotTopics = [
  { 
    label: '霸道总裁', 
    template: '【霸道总裁题材】\n剧名：《傲娇总裁的契约娇妻》\n核心冲突：平凡少女意外撞破财阀继承人的秘密，被迫签订为期一年的“假结婚”协议。在豪门恩怨与商战博弈中，冷酷总裁逐渐卸下心防。\n名场面：总裁将她抵在墙角，声音低沉：“既然签了字，这辈子你都别想逃出我的手掌心。”' 
  },
  { 
    label: '都市异能', 
    template: '【都市异能题材】\n剧名：《我能看见万物价值》\n核心冲突：外卖小哥意外觉醒“神之眼”，能看穿任何物品的真实价值与未来走势。他凭借异能从捡漏开始，一步步建立属于自己的商业帝国，同时对抗隐藏在都市阴影下的神秘组织。' 
  },
  { 
    label: '玄幻重生', 
    template: '【玄幻重生题材】\n剧名：《万古剑帝：重回少年时》\n核心冲突：一代剑帝陨落后重生回十六岁。这一世，他要弥补所有遗憾，守护至亲，将前世背叛他的诸神一一斩落于剑下。' 
  },
  { 
    label: '无限流', 
    template: '【无限流题材】\n剧名：《规则怪谈：只有我能看到提示》\n核心冲突：全球被卷入诡异恐怖的规则游戏。主角在充满死亡陷阱的任务中，发现自己能看到隐藏的提示信息。在绝望中寻找生机，在惊悚中探寻世界的真相。' 
  }
];

// Mock Recent Works Data
const recentWorks = ref([
  { 
    id: 1, 
    title: '誓要掀', 
    episodes: 1, 
    updatedAt: '2026-04-01 14:11',
    previews: [
      'https://picsum.photos/id/1011/200/300',
      'https://picsum.photos/id/1027/200/300',
      'https://picsum.photos/id/1005/200/300'
    ]
  },
  { 
    id: 2, 
    title: '烽火铁牛：开局掀翻元廷', 
    updatedAt: '2026-03-23 12:01',
    previews: [
      'https://picsum.photos/id/1015/200/300',
      'https://picsum.photos/id/1016/200/300'
    ]
  },
  { 
    id: 3, 
    title: '从弃女到巅峰：苏家千金归来', 
    episodes: 5, 
    updatedAt: '2026-03-19 10:48',
    isExample: true,
    previews: [
      'https://picsum.photos/id/1024/200/300',
      'https://picsum.photos/id/1025/200/300',
      'https://picsum.photos/id/1012/200/300'
    ]
  },
  { 
    id: 4, 
    title: '末世：我以为我是废柴，其实我是神', 
    episodes: 5, 
    updatedAt: '2026-03-16 14:10',
    isExample: true,
    previews: [
      'https://picsum.photos/id/1035/200/300',
      'https://picsum.photos/id/1039/200/300',
      'https://picsum.photos/id/1043/200/300'
    ]
  }
]);

const protagonistOptions = [
  { label: '落魄千金', desc: '家族破产，背负巨债，却拥有一手惊人的调香/设计才华。', icon: 'User' },
  { label: '冷面总裁', desc: '商界奇才，性格孤僻，因童年阴影不再相信爱情。', icon: 'Avatar' },
  { label: '平民少女', desc: '乐观坚韧，为了给母亲治病，卷入豪门恩怨。', icon: 'UserFilled' },
  { label: '神秘杀手', desc: '隐姓埋名在都市中，执行最后一次任务。', icon: 'StarFilled' }
];

const conflictOptions = [
  { label: '契约婚姻', desc: '被迫签订为期一年的“假结婚”协议，日久生情。', icon: 'Link' },
  { label: '复仇归来', desc: '隐姓埋名五年，只为夺回属于自己的一切。', icon: 'Warning' },
  { label: '命中注定', desc: '失忆后的重逢，即使忘记姓名也依然心动。', icon: 'Heart' },
  { label: '商战博弈', desc: '在利益与情感的边缘徘徊，最终选择守护对方。', icon: 'GoldMedal' }
];

const audienceOptions = ['男性向', '女性向', '青少年', '中老年', '大众向'];
const episodeOptions = [
  { label: '精简版', count: 24, desc: '快节奏，适合碎片化观看' },
  { label: '标准版', count: 80, desc: '主流配置，内容充实' },
  { label: '长篇版', count: 120, desc: '宏大叙事，深度刻画' }
];

const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++;
  } else {
    finishConfig();
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const finishConfig = () => {
  isGenerating.value = true;
  showHotTopicDialog.value = false;
  
  // Combine all selections into a prompt
  const finalPrompt = `【题材】${selectedTopic.value.label}
【主角设定】${configForm.protagonistSetting}
【核心冲突】${configForm.conflictSetting}
【受众】${configForm.targetAudience}
【集数】${configForm.episodesCount}集`;

  dramaStore.setExpandedPrompt(finalPrompt);
  
  setTimeout(() => {
    router.push('/ai-short-drama-creator/outline');
    isGenerating.value = false;
  }, 1000);
};

const selectHotTopic = (topic: any) => {
  if (isGenerating.value) return;
  selectedTopic.value = topic;
  configForm.genre = topic.label;
  currentStep.value = 1;
  showHotTopicDialog.value = true;
};

const typeText = (text: string) => {
  isGenerating.value = true;
  aiPrompt.value = '';
  let currentPos = 0;
  const speed = 15;
  
  const timer = setInterval(() => {
    if (currentPos < text.length) {
      aiPrompt.value += text.charAt(currentPos);
      currentPos++;
    } else {
      clearInterval(timer);
      isGenerating.value = false;
    }
  }, speed);
};

const startCreation = () => {
  if (!aiPrompt.value.trim()) {
    ElMessage.warning('请输入创作灵感或点击上方建议');
    return;
  }
  isGenerating.value = true;

  const expandedContent = `【故事设定】
这是一个充满未知与冲突的世界，规则残酷但机遇并存。主角所在的环境看似寻常，实则暗流涌动，各方势力在此交织博弈。

【主角特征】
- 身份背景：身处低谷或看似平凡，但拥有某种不为人知的特质。
- 核心性格：外冷内热，行事果断，在关键时刻能够爆发出惊人的意志力。
- 核心动机：为了打破不公的命运，或是守护内心最珍视的信念。

【剧情脉络】
1. 起因：主角因一场意外（或必然的安排）被卷入风暴中心，原本平静的生活被彻底打破。
2. 发展：在应对危机的过程中，主角逐渐觉醒并结识了性格各异的同伴。他们一路披荆斩棘，发现了隐藏在表象之下的惊天秘密。
3. 高潮：各方矛盾彻底激化，主角团队面临生死存亡的绝境。在最黑暗的时刻，主角利用关键线索完成绝地反击，局势瞬间逆转。
4. 结尾：危机解除，最大的反派倒台。主角完成了自己的使命，但也付出了相应的代价。

【最终结局】
世界迎来了新的黎明，旧的秩序被打破。主角没有选择留在聚光灯下，而是带着同伴踏上了新的旅程，留下了一段属于他们的传奇。

（基于您的灵感：“${aiPrompt.value}”生成）`;

  dramaStore.setExpandedPrompt(expandedContent);
  
  setTimeout(() => {
    router.push('/ai-short-drama-creator/outline');
    isGenerating.value = false;
  }, 1000);
};

const handleFileUpload = (file: any) => {
  ElMessage.success(`文件解析中...`);
  setTimeout(() => router.push('/ai-short-drama-creator/outline'), 1000);
};
</script>

<style scoped>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in-up 0.5s ease-out forwards;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
}

:deep(.el-tooltip__wrapper) {
  display: inline-block;
}

:deep(.custom-upload-v2) {
  height: 100%;
}
:deep(.custom-upload-v2 .el-upload) {
  height: 100%;
}
:deep(.custom-upload-v2 .el-upload-dragger) {
  border-radius: 32px;
  border: 2px dashed #e2e8f0;
  background-color: rgba(248, 250, 252, 0.5);
  transition: all 0.3s ease;
  width: 100% !important;
  height: 100% !important;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.dark :deep(.custom-upload-v2 .el-upload-dragger) {
  border-color: #334155;
  background-color: rgba(15, 23, 42, 0.5);
}
:deep(.custom-upload-v2 .el-upload-dragger:hover) {
  border-color: #6366f1;
  background-color: rgba(99, 102, 241, 0.05);
}
</style>
