<template>
  <div class="h-full flex flex-col bg-[#F8FAFC] dark:bg-slate-900 relative overflow-hidden">
    <!-- Decorative background elements -->
    <div class="absolute -top-40 -right-40 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none"></div>

    <!-- Main Content: Top Creation Area -->
    <div class="flex-1 overflow-y-auto p-4 lg:p-6 relative z-10 flex flex-col min-h-0 custom-scrollbar">
      <div class="max-w-7xl mx-auto flex flex-col items-center w-full">
        <!-- Header: More compact -->
        <div class="text-center mb-2 max-w-3xl shrink-0 relative w-full">
          <!-- Product Design Info Button -->
          <button 
            @click="showDesignDialog = true"
            class="absolute top-0 right-0 md:right-[-40px] h-8 px-3 flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-500 dark:text-slate-400 rounded-full font-bold text-[10px] shadow-sm border border-slate-200/50 dark:border-slate-700/50 hover:text-indigo-600 hover:border-indigo-300 transition-all duration-300"
          >
            <el-icon :size="12"><InfoFilled /></el-icon>
            <span>产品设计说明</span>
          </button>
          
          <h1 class="text-2xl md:text-3xl font-black mb-1 tracking-tight leading-tight">
            <span class="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
              智能极速创作，打造爆款短剧
            </span>
          </h1>
          <p class="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-medium leading-relaxed opacity-70">
            AI全流程辅助，内置高转化剧情模板，让创意触手可及。
          </p>
        </div>

        <!-- Creation Card: More compact and color-distinguished -->
        <div class="w-full max-w-5xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl rounded-[32px] shadow-xl shadow-indigo-500/5 border border-white dark:border-slate-700/50 overflow-hidden mb-4 transition-all duration-500 shrink-0">
          <div class="p-1 bg-slate-100/50 dark:bg-slate-900/50 flex m-2 rounded-[18px]">
            <button 
              class="flex-1 py-1.5 text-[14px] font-black transition-all rounded-[14px] flex items-center justify-center gap-2"
              :class="activeTab === 'ai' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm scale-[1.01]' : 'text-slate-500 hover:text-slate-700'"
              @click="activeTab = 'ai'"
            >
              <el-icon :size="16"><MagicStick /></el-icon> AI 灵感生成
            </button>
            <button 
              class="flex-1 py-1.5 text-[14px] font-black transition-all rounded-[14px] flex items-center justify-center gap-2"
              :class="activeTab === 'upload' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm scale-[1.01]' : 'text-slate-500 hover:text-slate-700'"
              @click="activeTab = 'upload'"
            >
              <el-icon :size="16"><Upload /></el-icon> 导入已有剧本
            </button>
          </div>

          <div class="px-6 py-3 md:px-8 md:py-4 pt-1">
            <div class="min-h-[180px] flex flex-col">
              <!-- AI Tab Content -->
              <div v-if="activeTab === 'ai'" class="flex flex-col gap-3 animate-fade-in h-full">
                <div class="relative group mt-2">
                  <!-- Dynamic Glowing Border -->
                  <div 
                    class="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[30px] blur-xl opacity-0 transition-all duration-1000"
                    :class="isGenerating ? 'opacity-30 animate-pulse' : 'group-focus-within:opacity-15'"
                  ></div>
                  
                  <div class="relative bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 group-focus-within:border-indigo-500/40 transition-all overflow-hidden shadow-2xl shadow-indigo-500/5">
                    <textarea 
                      v-model="aiPrompt"
                      class="w-full h-24 md:h-28 resize-none bg-transparent outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400/60 text-lg p-6 transition-all font-medium leading-relaxed"
                      placeholder="在此输入你构想的故事内容。比如：一个在赛博朋克世界里寻找失踪妹妹的私家侦探..."
                    ></textarea>
                    
                    <!-- Textarea Bottom Toolbar -->
                    <div class="px-6 py-3 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                      <div class="flex items-center gap-4 text-slate-400">
                        <span class="text-[11px] font-bold flex items-center gap-1.5 bg-white dark:bg-slate-700 px-3 py-1 rounded-full shadow-sm">
                          <el-icon class="text-indigo-500"><EditPen /></el-icon> {{ aiPrompt.length }} 字
                        </span>
                        <div class="w-px h-4 bg-slate-200 dark:bg-slate-700"></div>
                        <div class="flex items-center gap-1">
                          <button class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 hover:text-indigo-600 transition-all shadow-sm" title="清空内容" @click="aiPrompt = ''" v-if="aiPrompt">
                            <el-icon :size="14" class="text-rose-400 dark:text-rose-500"><Delete /></el-icon>
                          </button>
                          <button class="h-8 px-3 rounded-full flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 hover:bg-indigo-100 transition-all shadow-sm text-[11px] font-black border border-indigo-100 dark:border-indigo-800" title="优化描述">
                            <el-icon :size="14" class="text-indigo-500"><Brush /></el-icon>
                            <span>AI 润色</span>
                          </button>
                        </div>
                      </div>
                      
                      <div class="flex items-center gap-3">
                         <span v-if="isGenerating" class="text-[11px] font-bold text-indigo-600 animate-pulse mr-2 flex items-center gap-1.5">
                           <el-icon class="is-loading"><Loading /></el-icon> 正在为您构思精彩剧情...
                         </span>
                         <button 
                          class="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl text-[14px] font-black hover:shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-40 disabled:grayscale"
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
                <div class="flex flex-col items-center gap-3 mt-1">
                  <div class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-60">
                    <span class="w-8 h-[1px] bg-slate-200"></span>
                    热门题材灵感
                    <span class="w-8 h-[1px] bg-slate-200"></span>
                  </div>
                  <div class="flex flex-wrap items-center justify-center gap-2">
                    <div 
                      v-for="topic in hotTopics" 
                      :key="topic.label" 
                      @click="selectHotTopic(topic)"
                      class="px-4 py-1.5 rounded-2xl text-[12px] font-bold cursor-pointer transition-all flex items-center gap-2 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md hover:-translate-y-0.5 group"
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
                  <div class="py-4">
                    <div class="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm">
                      <el-icon :size="20"><upload-filled /></el-icon>
                    </div>
                    <div class="el-upload__text text-slate-500 dark:text-slate-400 font-bold text-sm mb-1">
                      将剧本文件拖到此处，或 <em class="text-indigo-600 dark:text-indigo-400 not-italic">点击上传</em>
                    </div>
                    <div class="text-slate-400 text-[11px] font-medium">
                      支持 docx, pdf, txt 格式，不超过10万字
                    </div>
                  </div>
                </el-upload>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Projects Section -->
        <div class="w-full relative flex-1 min-h-0 flex flex-col bg-slate-50/50 dark:bg-slate-900/30 rounded-[32px] p-4 border border-slate-100 dark:border-slate-800">
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

    <el-dialog 
      v-model="showHotTopicDialog" 
      :title="undefined"
      width="860px" 
      class="hot-topic-dialog-v2 overflow-hidden" 
      :show-close="false"
      destroy-on-close
      top="2vh"
    >
      <div class="relative flex flex-col bg-slate-50 dark:bg-slate-950 max-h-[96vh]">
        <!-- Glassmorphism Background Elements -->
        <div class="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div class="absolute top-1/2 -right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        
        <!-- Header: Hero Style -->
        <div class="relative px-8 pt-5 pb-3 shrink-0 overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5 dark:from-indigo-400/5 dark:to-purple-400/5"></div>
          
          <!-- Close Button -->
          <button 
            @click="showHotTopicDialog = false" 
            class="absolute top-4 right-8 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-md text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm border border-white/20 dark:border-slate-700/20"
          >
            <el-icon :size="18"><Close /></el-icon>
          </button>

          <div class="relative flex items-end gap-4">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 ring-4 ring-white dark:ring-slate-800">
              <el-icon :size="24"><MagicStick /></el-icon>
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <h2 class="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                  开启灵感之门
                </h2>
                <span class="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-md">
                  AI Creator
                </span>
              </div>
              <p class="text-[12px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">
                为您精心准备了默认配置，每一项都可以由 AI 深度润色。
              </p>
            </div>
          </div>
        </div>

        <!-- Body: Card Layout -->
        <div class="flex-1 overflow-y-hidden px-8 pb-4 space-y-3 relative z-10">
          
          <!-- Custom Genre Input (Conditional) -->
          <div v-if="selectedTopic?.isCustom" class="p-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white dark:border-slate-800 shadow-sm animate-fade-in">
            <label class="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">自定义题材</label>
            <el-input 
              v-model="configForm.genre" 
              placeholder="输入题材名称，如：未来末世、职场逆袭..." 
              class="custom-input-v3"
            />
          </div>

          <!-- Section 1: Story Background (World & Era) -->
          <div class="flex flex-col gap-2 p-4 bg-gradient-to-br from-indigo-50/90 to-white/90 dark:from-indigo-950/30 dark:to-slate-900/90 backdrop-blur-2xl rounded-[24px] border border-white dark:border-slate-700 shadow-xl shadow-indigo-200/20 dark:shadow-none relative overflow-hidden group">
            <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div class="flex items-center justify-between relative z-10">
              <div class="flex items-center gap-2">
                <!-- <span class="px-2 py-0.5 bg-indigo-500 text-white text-[10px] font-black rounded-md">1. 最先写</span> -->
                <span class="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">故事背景</span>
              </div>
              <button @click="handleAIFeature('storyBackground', 'polish')" :disabled="isGeneratingField.storyBackground" class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100/50 dark:bg-indigo-900/30 text-indigo-600 hover:bg-indigo-100 transition-all text-[11px] font-black shadow-sm border border-indigo-200 dark:border-indigo-800">
                <el-icon :size="14" class="text-indigo-500" :class="{'is-loading': isGeneratingField.storyBackground}"><Brush /></el-icon>
                <span>AI 润色</span>
              </button>
            </div>
            <p class="text-[10px] text-slate-400 font-medium -mt-1">世界观、时代背景、生存环境（告诉 AI：故事发生在什么地方、什么时代）</p>
            <el-input v-model="configForm.storyBackground" type="textarea" :rows="1" placeholder="例如：2077年的霓虹都市，贫富差距巨大，底层人民在赛博阴影中挣扎..." class="custom-textarea-v3 flex-1" />
          </div>

          <!-- Section 2: Identity & Style -->
          <div class="grid grid-cols-3 gap-4">
            <!-- Protagonist -->
            <div class="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-[20px] border border-white dark:border-slate-800 shadow-sm hover:shadow-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300">
              <div class="flex items-center gap-2 mb-3">
                <div class="w-7 h-7 rounded-lg bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <el-icon><User /></el-icon>
                </div>
                <div class="flex flex-col">
                  <div class="flex items-center gap-2">
                    <!-- <span class="text-[10px] font-black text-indigo-500">2</span> -->
                    <label class="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">主角设定</label>
                  </div>
                </div>
              </div>
              <el-select v-model="configForm.protagonistSetting" class="w-full custom-select-v3" size="default">
                <el-option v-for="opt in protagonistOptions" :key="opt.label" :label="opt.label" :value="opt.label">
                   <div class="flex items-center justify-between w-full">
                    <span class="font-bold text-[13px] text-slate-700 dark:text-slate-200">{{ opt.label }}</span>
                    <el-icon v-if="configForm.protagonistSetting === opt.label" class="text-indigo-500" :size="14"><Check /></el-icon>
                  </div>
                </el-option>
              </el-select>
            </div>

            <!-- Video Style -->
            <div class="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-[20px] border border-white dark:border-slate-800 shadow-sm hover:shadow-purple-500/10 hover:border-purple-500/30 transition-all duration-300">
              <div class="flex items-center gap-2 mb-3">
                <div class="w-7 h-7 rounded-lg bg-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <el-icon><Picture /></el-icon>
                </div>
                <label class="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">视频风格</label>
              </div>
              <el-select v-model="configForm.videoStyle" class="w-full custom-select-v3" size="default">
                <el-option v-for="opt in videoStyleOptions" :key="opt.label" :label="opt.label" :value="opt.label">
                  <div class="flex items-center justify-between w-full">
                    <span class="text-[13px] font-bold text-slate-700 dark:text-slate-200">{{ opt.label }}</span>
                    <el-icon v-if="configForm.videoStyle === opt.label" class="text-purple-500" :size="14"><Check /></el-icon>
                  </div>
                </el-option>
              </el-select>
            </div>

            <!-- Audience -->
            <div class="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-[20px] border border-white dark:border-slate-800 shadow-sm hover:shadow-pink-500/10 hover:border-pink-500/30 transition-all duration-300">
              <div class="flex items-center gap-2 mb-3">
                <div class="w-7 h-7 rounded-lg bg-pink-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/20">
                  <el-icon><Star /></el-icon>
                </div>
                <label class="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">目标受众</label>
              </div>
              <el-select v-model="configForm.targetAudience" class="w-full custom-select-v3" size="default">
                <el-option v-for="aud in audienceOptions" :key="aud" :label="aud" :value="aud">
                  <div class="flex items-center justify-between w-full">
                    <span class="text-[13px] font-bold">{{ aud }}</span>
                    <el-icon v-if="configForm.targetAudience === aud" class="text-pink-500" :size="14"><Check /></el-icon>
                  </div>
                </el-option>
              </el-select>
            </div>
          </div>

          <!-- Section 3: Story Setting & Synopsis -->
          <div class="grid grid-cols-2 gap-4">
            <!-- Setting -->
            <div class="flex flex-col gap-2 p-4 bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-900/90 dark:to-slate-800/90 backdrop-blur-2xl rounded-[24px] border border-white dark:border-slate-700 shadow-xl shadow-slate-200/20 dark:shadow-none relative overflow-hidden group">
              <div class="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              <div class="flex items-center justify-between relative z-10">
                <div class="flex items-center gap-2">
                  <!-- <span class="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-black rounded-md">3</span> -->
                  <span class="text-[11px] font-black text-amber-600 uppercase tracking-widest">故事设定</span>
                </div>
                <button @click="handleAIFeature('storySetting', 'polish')" :disabled="isGeneratingField.storySetting" class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/50 dark:bg-amber-900/30 text-amber-600 hover:bg-amber-100 transition-all text-[11px] font-black shadow-sm border border-amber-200 dark:border-amber-800">
                  <el-icon :size="14" class="text-amber-500" :class="{'is-loading': isGeneratingField.storySetting}"><Brush /></el-icon>
                  <span>AI 润色</span>
                </button>
              </div>
              <p class="text-[10px] text-slate-400 font-medium -mt-1">人物关系、核心矛盾、金手指、规则</p>
              <el-input v-model="configForm.storySetting" type="textarea" :rows="1" placeholder="例如：主角拥有一种能听见植物心声的能力..." class="custom-textarea-v3 flex-1" />
            </div>

            <!-- Synopsis -->
            <div class="flex flex-col gap-2 p-4 bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-900/90 dark:to-slate-800/90 backdrop-blur-2xl rounded-[24px] border border-white dark:border-slate-700 shadow-xl shadow-slate-200/20 dark:shadow-none relative overflow-hidden group border-indigo-500/30">
              <div class="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              <div class="flex items-center justify-between relative z-10">
                <div class="flex items-center gap-2">
                  <!-- <span class="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-black rounded-md">4. 最后写</span> -->
                  <span class="text-[11px] font-black text-emerald-600 uppercase tracking-widest">故事梗概</span>
                </div>
                <button @click="handleAIFeature('storySynopsis', 'polish')" :disabled="isGeneratingField.storySynopsis" class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-600 hover:bg-emerald-100 transition-all text-[11px] font-black shadow-sm border border-emerald-200 dark:border-emerald-800">
                  <el-icon :size="14" class="text-emerald-500" :class="{'is-loading': isGeneratingField.storySynopsis}"><Brush /></el-icon>
                  <span>AI 润色</span>
                </button>
              </div>
              <p class="text-[10px] text-slate-400 font-medium -mt-1">完整剧情（起承转合）</p>
              <el-input v-model="configForm.storySynopsis" type="textarea" :rows="1" placeholder="例如：原本平凡的少年意外救下了财阀之女，从此开启了..." class="custom-textarea-v3 flex-1" />
            </div>
          </div>

          <!-- Section 4: Technical Specs & Custom Settings -->
          <div class="grid grid-cols-2 gap-4">
            <!-- Creation Specs Card -->
            <div class="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10 p-4 rounded-[24px] border border-indigo-100/50 dark:border-indigo-500/20 shadow-inner flex flex-col gap-3">
              <div class="flex items-center gap-2">
                <div class="w-6 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
                <span class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">创作规格 Specs</span>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <!-- Episodes -->
                <div class="space-y-1">
                  <div class="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <el-icon :size="12" class="text-indigo-500"><Collection /></el-icon>
                    <label class="text-[11px] font-bold">生成集数</label>
                  </div>
                  <div class="relative group/input">
                    <el-input v-model="configForm.episodesCount" placeholder="如：80" class="custom-input-v4" />
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-indigo-600/40">集</span>
                  </div>
                </div>

                <!-- Duration -->
                <div class="space-y-1">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <el-icon :size="12" class="text-purple-500"><Clock /></el-icon>
                      <label class="text-[11px] font-bold">单集时长</label>
                    </div>
                  </div>
                  <div class="relative group/input">
                    <el-input-number v-model="configForm.expectedDuration" :min="30" :max="300" :step="10" controls-position="right" class="custom-number-v4 w-full" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Custom Protagonist Detail (Conditional) -->
            <div v-if="configForm.protagonistSetting === '自定义'" class="p-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[24px] border border-white dark:border-slate-800 shadow-sm animate-fade-in flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <el-icon><EditPen /></el-icon>
                  </div>
                  <label class="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">主角详细设定</label>
                </div>
                <button @click="handleAIFeature('protagonist', 'generate')" :disabled="isGeneratingField.protagonist" class="flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 hover:bg-indigo-100 transition-all text-[11px] font-black shadow-sm border border-indigo-100 dark:border-indigo-900/30">
                  <el-icon class="text-indigo-500" :class="{'is-loading': isGeneratingField.protagonist}"><MagicStick /></el-icon>
                  <span>AI 生成</span>
                </button>
              </div>
              <el-input v-model="configForm.protagonistDesc" type="textarea" :rows="1" placeholder="主角身份、性格、核心目标、弱点..." class="custom-textarea-v3 flex-1" />
            </div>
            
            <!-- Placeholder for alignment if not custom -->
            <div v-else class="flex items-center justify-center p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[24px] opacity-40">
              <div class="text-center">
                <el-icon :size="20" class="text-slate-300 mb-1"><MagicStick /></el-icon>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">自定义主角细节</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer: Massive CTA -->
        <div class="px-8 py-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border-t border-white dark:border-slate-800 flex items-center justify-center shrink-0">
          <button 
            @click="finishConfig"
            :disabled="!configForm.protagonistSetting"
            class="group relative w-full max-w-md h-12 flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-right text-white rounded-2xl font-black text-base shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-[0.98] transition-all duration-500 disabled:opacity-40 disabled:grayscale disabled:pointer-events-none"
          >
            <!-- Animated Light Streak -->
            <div class="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <div class="absolute top-0 -left-[100%] w-[50%] h-full bg-white/20 skew-x-[45deg] animate-light-streak"></div>
            </div>
            
            <el-icon class="group-hover:rotate-12 transition-transform duration-300" :size="20"><MagicStick /></el-icon>
            <span class="tracking-widest">开启 AI 剧本创作</span>
            
            <!-- Floating Particles Effect (Optional) -->
            <div class="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full blur-[2px] animate-ping opacity-0 group-hover:opacity-40"></div>
            <div class="absolute -bottom-1 -left-1 w-2 h-2 bg-indigo-400 rounded-full blur-[1px] animate-ping opacity-0 group-hover:opacity-40" style="animation-delay: 0.5s"></div>
          </button>
        </div>
      </div>
    </el-dialog>

    <!-- Product Design Dialog -->
    <ProductDesignDialog
      v-model="showDesignDialog"
      id="short-drama-new"
      :default-content="{
        title: '新建短剧',
        location: '系统创作入口，支持“AI灵感生成”与“外部剧本导入”双模式切换，决定后续生成的所有核心输入源。',
        layout: [
          '**Tab 切换区：** 顶部提供“AI 灵感生成”与“导入已有剧本”两个模式，支持动态组件切换。',
          '**灵感输入区：** 中央大型 TextArea 容器，支持多行输入。底部状态栏包含字数实时统计、清空与 AI 润色功能。',
          '**题材灵感区：** 提供热门题材标签云，点击可触发高级配置弹窗（HotTopicDialog）。',
          '**近期作品区：** 采用 Grid 布局展示最近 4 个项目的多图预览及创作进度。'
        ],
        interactions: [
          {
            text: '**立即创作 (核心动作)：**',
            image: imgNewDramaCreate
          },
          '**流程：** 用户输入灵感 -> 点击按钮 -> 系统启动 AI 扩展引擎 -> 自动构建完整的“故事设定、主角人设、核心冲突及结局预览” -> 数据持久化至 Store -> 自动重定向至大纲工作台。',
          '**状态：** 按钮点击后立即进入 Loading 状态，防止多次点击导致重复扣费或生成。',
          '**灵感导入 (外部源)：**',
          '**流程：** 选择文件 -> 上传至服务器 -> AI 进行语义解析 -> 提取核心人设与情节 -> 跳转至大纲。',
          '**异常：** 若文件加密、格式不符（非 docx/pdf/txt）或超过 20MB，系统将弹出错误提示并终止流程。',
          '**异常处理：**',
          '**空内容校验：** 灵感输入为空时点击按钮，触发 `ElMessage.warning` 拦截并高亮输入框。',
          '**网络超时：** 若 AI 扩展接口无响应，系统会重置按钮状态并提示“生成超时，请稍后重试”。',
          '**功能说明 (2.1版本)：**',
          '**剧集管理：** 2.1版本由系统自动规划剧集，暂不支持手动新增、编辑、删除或排序剧集。',
          '**完结状态：** “已完”表示该集已成功合成全集视频；“未完”表示尚未完成全集视频合成。',
          '**流程环节：** 本页面是全流程的 **Step 0 (初始化)**。在此确定的 Expanded Prompt 是后续所有环节（大纲、资产、分镜）的基因，确保了长内容生成的连贯性。'
        ],
        version: '2.1'
      }"
    />
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
  GoldMedal,
  QuestionFilled,
  Loading
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import ProductDesignDialog from '@/components/Common/ProductDesignDialog.vue';
// 导入产品设计图片以确保被 Vite 编译进源代码
import imgNewDramaCreate from '@/assets/images/design/1776419701211-0ff82d3e790e7432.png';

import { useDramaStore } from '../../store/drama';

const router = useRouter();
const dramaStore = useDramaStore();
const isLight = inject('isLight', ref(true));
const showDesignDialog = ref(false);
const showHotTopicDialog = ref(false);
const currentStep = ref(1);
const selectedTopic = ref<any>(null);

const designImageUrl = (fileName: string) => `${import.meta.env.BASE_URL}images/design/${fileName}`;

// --- State Management ---
const activeTab = ref('ai'); 
const aiPrompt = ref('');
const isGenerating = ref(false);
const isGeneratingField = reactive<Record<string, boolean>>({
  protagonist: false,
  storySynopsis: false,
  storyBackground: false,
  storySetting: false,
  episodesCount: false
});

// Configuration state
const configForm = reactive({
  scriptType: 'short_drama',
  genre: '',
  targetAudience: '女频',
  videoStyle: '写实',
  episodesCount: '80',
  expectedDuration: 120,
  protagonistSetting: '',
  protagonistDesc: '',
  storySynopsis: '',
  storyBackground: '',
  storySetting: '',
  themeSetting: ''
});

const videoStyleOptions = [
  { label: '写实' },
  { label: '二次元' },
  { label: '赛博朋克' },
  { label: '古风' },
  { label: '都市丽人' }
];

// Hot Topics with templates
const hotTopics = [
  { 
    label: '霸道总裁', 
    template: '【霸道总裁题材】\n' +
              '剧名：《傲娇总裁的契约娇妻》\n' +
              '核心冲突：平凡少女意外撞破财阀继承人的秘密，被迫签订为期一年的“假结婚”协议。在豪门恩怨与商战博弈中，冷酷总裁逐渐卸下心防。\n' +
              '名场面：总裁将她抵在墙角，声音低沉：“既然签了字，这辈子你都别想逃出我的手掌心。”' 
  },
  { 
    label: '都市异能', 
    template: '【都市异能题材】\n' +
              '剧名：《我能看见万物价值》\n' +
              '核心冲突：外卖小哥意外觉醒“神之眼”，能看穿任何物品的真实价值与未来走势。他凭借异能从捡漏开始，一步步建立属于自己的商业帝国，同时对抗隐藏在都市阴影下的神秘组织。' 
  },
  { 
    label: '玄幻重生', 
    template: '【玄幻重生题材】\n' +
              '剧名：《万古剑帝：重回少年时》\n' +
              '核心冲突：一代剑帝陨落后重生回十六岁。这一世，他要弥补所有遗憾，守护至亲，将前世背叛他的诸神一一斩落于剑下。' 
  },
  { 
    label: '无限流', 
    template: '【无限流题材】\n' +
              '剧名：《规则怪谈：只有我能看到提示》\n' +
              '核心冲突：全球被卷入诡异恐怖的规则游戏。主角在充满死亡陷阱的任务中，发现自己能看到隐藏的提示信息。在绝望中寻找生机，在惊悚中探寻世界的真相。' 
  },
  {
    label: '自定义',
    template: '',
    isCustom: true
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
  { label: '落魄千金', desc: '家族破产，背负巨债，却拥有一手惊人的调香/设计才华。' },
  { label: '冷面总裁', desc: '商界奇才，性格孤僻，因童年阴影不再相信爱情。' },
  { label: '平民少女', desc: '乐观坚韧，为了给母亲治病，卷入豪门恩怨。' },
  { label: '神秘杀手', desc: '隐姓埋名在都市中，执行最后一次任务。' },
  { label: '自定义', desc: '手动输入或 AI 生成您心目中的完美主角。' }
];

const audienceOptions = ['男频', '女频', '大众'];

const handleAIFeature = (field: 'protagonist' | 'storySynopsis' | 'storyBackground' | 'storySetting' | 'episodesCount', action: 'generate' | 'polish') => {
  isGeneratingField[field] = true;
  
  // Mock AI behavior
  setTimeout(() => {
    if (field === 'protagonist') {
      if (action === 'generate') {
        configForm.protagonistDesc = '【身份】隐秘豪门的弃子，现任送餐员。',
          '【性格】隐忍冷静，拥有超强记忆力。',
          '【目标】查明当年母亲被害真相，拿回属于自己的继承权。';
      } else {
        configForm.protagonistDesc = configForm.protagonistDesc + '（已由 AI 润色，强化了冲突感与人设张力）';
      }
    } else if (field === 'storySynopsis') {
      configForm.storySynopsis = configForm.storySynopsis || '在赛博朋克的未来，一个底层少年意外发现自己能连接已故天才的意识...';
      configForm.storySynopsis = configForm.storySynopsis + '（已由 AI 深度润色，增加了剧情转折的不可预测性）';
    } else if (field === 'storyBackground') {
      configForm.storyBackground = configForm.storyBackground || '2077年的霓虹之城，阶级分明，贫民窟与科技云端并存...';
      configForm.storyBackground = configForm.storyBackground + '（已由 AI 润色，强化了世界观设定）';
    } else if (field === 'storySetting') {
      configForm.storySetting = configForm.storySetting || '所有的意识都可以被数据化，但灵魂的重量依然无法衡量...';
      configForm.storySetting = configForm.storySetting + '（已由 AI 润色，细化了设定逻辑）';
    } else if (field === 'episodesCount') {
      configForm.episodesCount = '80-100';
      ElMessage.success('AI 已建议最优集数');
    }
    
    if (field !== 'episodesCount') {
      ElMessage.success(action === 'generate' ? 'AI 生成成功' : 'AI 润色成功');
    }
    isGeneratingField[field] = false;
  }, 1500);
};

const finishConfig = () => {
  isGenerating.value = true;
  showHotTopicDialog.value = false;
  
  // Combine all selections into a prompt
  const protagonist = configForm.protagonistSetting === '自定义' 
    ? `【主角设定】${configForm.protagonistDesc}` 
    : `【主角设定】${configForm.protagonistSetting}`;

  const finalPrompt = `【题材】${configForm.genre || selectedTopic.value.label}
${protagonist}
【故事梗概】${configForm.storySynopsis}
【故事背景】${configForm.storyBackground}
【故事设定】${configForm.storySetting}
【视频风格】${configForm.videoStyle}
【受众】${configForm.targetAudience}
【规格】${configForm.episodesCount}集，单集时长${configForm.expectedDuration}秒`;

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
  
  // Auto-generate default contents when dialog opens
  configForm.protagonistSetting = protagonistOptions[0].label;
  configForm.targetAudience = audienceOptions[1]; // 女频
  configForm.videoStyle = '写实';
  configForm.episodesCount = '80';
  configForm.expectedDuration = 120;
  
  // Use template to generate synopsis if available, or use defaults
  if (topic.template) {
    const parts = topic.template.split('\n');
    configForm.storySynopsis = parts.find((p: string) => p.includes('核心冲突'))?.replace('核心冲突：', '') || '';
    configForm.storyBackground = `在典型的${topic.label}环境下展开，注重情感张力与快节奏转折。`;
    configForm.storySetting = `主角通过不懈努力，最终实现${topic.label}题材中常见的逆袭。`;
  } else {
    configForm.storySynopsis = '这是一个充满未知与挑战的故事，讲述了主角如何在逆境中寻找希望并完成自我救赎。';
    configForm.storyBackground = '现代都市，繁华表象下隐藏着复杂的权谋与深厚的情感纠葛。';
    configForm.storySetting = '故事注重细节刻画，力求在真实的社会背景下展现人性的光辉与阴暗面。';
  }
  
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

:deep(.custom-input-v2 .el-input__wrapper) {
  border-radius: 12px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  box-shadow: none !important;
  padding: 4px 12px;
}
.dark :deep(.custom-input-v2 .el-input__wrapper) {
  background-color: #0f172a;
  border-color: #334155;
}
:deep(.custom-input-v2 .el-input__wrapper.is-focus) {
  border-color: #6366f1;
}

:deep(.custom-textarea-v2 .el-textarea__inner) {
  border-radius: 16px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  box-shadow: none !important;
  padding: 12px;
  font-size: 13px;
  line-height: 1.6;
  resize: none;
}
.dark :deep(.custom-textarea-v2 .el-textarea__inner) {
  background-color: #0f172a;
  border-color: #334155;
  color: #f1f5f9;
}
:deep(.custom-textarea-v2 .el-textarea__inner:focus) {
  border-color: #6366f1;
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

:deep(.custom-slider .el-slider__bar) {
  background-color: #6366f1;
}
:deep(.custom-slider .el-slider__button) {
  border-color: #6366f1;
}

/* New V3 UI Styles */
.hot-topic-dialog-v2 :deep(.el-dialog) {
  background: transparent !important;
  box-shadow: none !important;
}

.custom-scrollbar-v2::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar-v2::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.2);
  border-radius: 10px;
}

:deep(.custom-select-v3 .el-input__wrapper) {
  border-radius: 20px;
  background-color: #fff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03) !important;
  padding: 10px 20px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.dark :deep(.custom-select-v3 .el-input__wrapper) {
  background-color: #1e293b;
  border-color: #334155;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
}
:deep(.custom-select-v3 .el-input__wrapper:hover) {
  border-color: #6366f1;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.08) !important;
}
:deep(.custom-select-v3 .el-input__wrapper.is-focus) {
  border-color: #6366f1;
  background-color: #fff;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12), 0 8px 24px rgba(99, 102, 241, 0.1) !important;
}

/* Option List Styling */
:deep(.el-select-dropdown__item) {
  margin: 4px 8px;
  border-radius: 12px;
  transition: all 0.2s ease;
  height: auto !important;
  line-height: normal !important;
  padding: 8px 12px !important;
}
:deep(.el-select-dropdown__item.hover), 
:deep(.el-select-dropdown__item:hover) {
  background-color: rgba(99, 102, 241, 0.05) !important;
  color: #6366f1 !important;
}
:deep(.el-select-dropdown__item.selected) {
  background-color: #6366f1 !important;
  color: #fff !important;
}
:deep(.el-select-dropdown__item.selected .text-slate-400),
:deep(.el-select-dropdown__item.selected .text-slate-500) {
  color: rgba(255, 255, 255, 0.7) !important;
}

:deep(.custom-input-v3 .el-input__wrapper) {
  border-radius: 16px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  box-shadow: none !important;
  padding: 8px 16px;
}
.dark :deep(.custom-input-v3 .el-input__wrapper) {
  background-color: #0f172a;
  border-color: #334155;
}

:deep(.custom-textarea-v3 .el-textarea__inner) {
  border-radius: 20px;
  background-color: rgba(248, 250, 252, 0.8);
  border: 1px solid #e2e8f0;
  box-shadow: none !important;
  padding: 12px 16px;
  font-size: 13px;
  line-height: 1.6;
  resize: none;
  transition: all 0.3s ease;
}
.dark :deep(.custom-textarea-v3 .el-textarea__inner) {
  background-color: rgba(15, 23, 42, 0.8);
  border-color: #334155;
  color: #f1f5f9;
}
:deep(.custom-textarea-v3 .el-textarea__inner:focus) {
  border-color: #6366f1;
  background-color: #fff;
}

:deep(.custom-number-v3 .el-input__wrapper) {
  border-radius: 12px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
}

:deep(.custom-input-v4 .el-input__wrapper) {
  border-radius: 14px;
  background-color: #fff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02) !important;
  padding: 4px 12px;
  transition: all 0.3s ease;
}
.dark :deep(.custom-input-v4 .el-input__wrapper) {
  background-color: #1e293b;
  border-color: #334155;
}
:deep(.custom-input-v4 .el-input__wrapper.is-focus) {
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
}

:deep(.custom-number-v4 .el-input__wrapper) {
  border-radius: 14px;
  background-color: #fff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02) !important;
  padding-right: 0;
}
.dark :deep(.custom-number-v4 .el-input__wrapper) {
  background-color: #1e293b;
  border-color: #334155;
}
:deep(.custom-number-v4 .el-input-number__increase),
:deep(.custom-number-v4 .el-input-number__decrease) {
  background-color: #f8fafc;
  border-left-color: #e2e8f0;
  border-radius: 0 14px 14px 0;
}
.dark :deep(.custom-number-v4 .el-input-number__increase),
.dark :deep(.custom-number-v4 .el-input-number__decrease) {
  background-color: #0f172a;
  border-left-color: #334155;
}

@keyframes light-streak {
  0% { left: -100%; }
  50% { left: 100%; }
  100% { left: 100%; }
}

.animate-light-streak {
  animation: light-streak 3s infinite ease-in-out;
}
</style>
