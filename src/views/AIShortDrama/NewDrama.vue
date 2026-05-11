<template>
  <div class="relative h-full flex flex-col overflow-hidden transition-colors duration-500" :class="isLight ? 'bg-slate-50' : 'bg-slate-950'">
    
    <!-- Cinematic Blockbuster Background -->
    <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <!-- Ambient Video Layer: 60% for Light, 80% for Dark -->
      <div class="absolute inset-0 transition-opacity duration-1000" :class="isLight ? 'opacity-60' : 'opacity-80'">
        <video 
          autoplay 
          muted 
          loop 
          playsinline 
          class="w-full h-full object-cover scale-100"
          style="filter: saturate(1.3) contrast(1.2) brightness(0.8) hue-rotate(-5deg);"
        >
          <source src="/assets/video_07e1234349e0e3972393d879f1c65c53.mp4" type="video/mp4">
        </video>
      </div>

      <!-- Theme-aware Gradient Overlays: Light/Dark compatibility -->
      <div 
        class="absolute inset-0 transition-all duration-700"
        :class="isLight 
          ? 'bg-gradient-to-b from-white/20 via-transparent to-white/40' 
          : 'bg-gradient-to-b from-black/30 via-transparent to-black/50'"
      ></div>

      <!-- Cinematic Elements -->
      <div class="absolute inset-0 pointer-events-none">
        <!-- Film Grain: Reduced opacity for clarity -->
        <div class="absolute inset-0 opacity-[0.05] dark:opacity-[0.1] mix-blend-overlay bg-noise-pattern"></div>
        
        <!-- Vignette -->
        <div class="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_0_200px_rgba(0,0,0,0.4)]"></div>
        
        <!-- Dynamic Glows -->
        <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div class="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[120px] animate-pulse-slow-delayed"></div>
      </div>
    </div>

    <!-- Main Content: Top Creation Area -->
    <div class="flex-1 overflow-y-auto p-4 lg:p-6 relative z-10 flex flex-col min-h-0 custom-scrollbar">
      <div class="max-w-7xl mx-auto flex flex-col items-center w-full">
        <!-- Header: More compact -->
        <div class="text-center mb-2 max-w-3xl shrink-0 relative w-full">
          <!-- Product Design Info Button -->
          <div class="absolute top-0 right-0 md:right-[-40px] flex items-center gap-2">
            <button 
              @click="showDesignDialog = true"
              class="h-8 px-3 flex items-center gap-2 rounded-full font-bold text-[10px] shadow-sm border transition-all duration-300"
              :class="isLight ? 'bg-white text-slate-600 border-slate-200 hover:text-indigo-600 hover:border-indigo-300' : 'bg-slate-800/50 backdrop-blur-md text-slate-300 border-slate-700/50 hover:text-indigo-400 hover:border-indigo-400/50'"
            >
              <el-icon :size="12"><InfoFilled /></el-icon>
              <span>产品设计说明</span>
            </button>
          </div>
          
          <h1 class="text-2xl md:text-3xl font-black mb-1 tracking-tight leading-tight">
            <span class="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              智能极速创作，打造爆款短剧
            </span>
          </h1>
          <p class="text-xs md:text-sm font-medium leading-relaxed opacity-80" :class="isLight ? 'text-slate-400' : 'text-slate-300'">
            AI全流程辅助，内置高转化剧情模板，让创意触手可及。
          </p>
        </div>

        <!-- Creation Card: More compact and color-distinguished -->
        <div
          class="w-full max-w-5xl rounded-[32px] overflow-hidden mb-4 transition-all duration-500 shrink-0"
          :class="isLight ? 'bg-white/80 backdrop-blur-xl shadow-sm border border-slate-200' : 'bg-slate-900/40 backdrop-blur-2xl shadow-2xl shadow-black/20 border border-slate-700/50'"
        >
          <div class="p-1 flex m-2 rounded-[18px]" :class="isLight ? 'bg-slate-50/50 border border-slate-100' : 'bg-slate-900/50'">
            <button 
              class="flex-1 py-1.5 text-[14px] font-black transition-all rounded-[14px] flex items-center justify-center gap-2"
              :class="activeTab === 'ai'
                ? (isLight ? 'bg-white text-indigo-600 shadow-sm scale-[1.01] border border-slate-100' : 'bg-white/10 text-white shadow-sm scale-[1.01]')
                : (isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-white')"
              @click="activeTab = 'ai'"
            >
              <el-icon :size="16"><MagicStick /></el-icon> AI 灵感生成
            </button>
            <button 
              class="flex-1 py-1.5 text-[14px] font-black transition-all rounded-[14px] flex items-center justify-center gap-2"
              :class="activeTab === 'upload'
                ? (isLight ? 'bg-white text-indigo-600 shadow-sm scale-[1.01] border border-slate-100' : 'bg-white/10 text-white shadow-sm scale-[1.01]')
                : (isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-white')"
              @click="activeTab = 'upload'"
            >
              <el-icon :size="16"><Upload /></el-icon> 导入已有小说
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
                  
                  <div
                    class="relative rounded-[28px] border-2 transition-all overflow-hidden"
                    :class="isLight ? 'bg-white border-slate-200 group-focus-within:border-indigo-400 shadow-sm' : 'bg-slate-900 border-slate-800 group-focus-within:border-indigo-500/40 shadow-2xl shadow-black/20'"
                  >
                    <textarea 
                      v-model="aiPrompt"
                      class="w-full h-24 md:h-28 resize-none bg-transparent outline-none text-lg p-6 transition-all font-medium leading-relaxed"
                      :class="isLight ? 'text-slate-700 placeholder:text-slate-300' : 'text-white placeholder:text-slate-500'"
                      placeholder="在此输入你构想的故事内容。比如：一个在赛博朋克世界里寻找失踪妹妹的私家侦探..."
                    ></textarea>
                    
                    <!-- Textarea Bottom Toolbar -->
                    <div class="px-6 py-3 border-t flex items-center justify-between" :class="isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-800/80 border-white/5 backdrop-blur-xl'">
                      <div class="flex items-center gap-4" :class="isLight ? 'text-slate-400' : 'text-slate-400'">
                        <span
                          class="text-[11px] font-bold flex items-center gap-1.5 px-3 py-1 rounded-full shadow-sm"
                          :class="isLight ? 'bg-white text-slate-500 border border-slate-100' : 'bg-white/10 text-slate-300'"
                        >
                          <el-icon class="text-indigo-400"><EditPen /></el-icon> {{ aiPrompt.length }} 字
                        </span>
                        <div class="w-px h-4" :class="isLight ? 'bg-slate-200' : 'bg-white/10'"></div>
                        <div class="flex items-center gap-1">
                          <button
                            class="w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm"
                            :class="isLight ? 'hover:bg-slate-100 hover:text-indigo-500' : 'hover:bg-white/10 hover:text-indigo-400'"
                            title="清空内容"
                            @click="aiPrompt = ''"
                            v-if="aiPrompt"
                          >
                            <el-icon :size="14" class="text-rose-400"><Delete /></el-icon>
                          </button>
                          <button
                            class="h-8 px-3 rounded-full flex items-center gap-1.5 transition-all shadow-sm text-[11px] font-black border"
                            :class="isLight ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-100' : 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border-indigo-500/20'"
                            title="优化描述"
                          >
                            <el-icon :size="14" class="text-indigo-400"><Brush /></el-icon>
                            <span>AI 润色</span>
                          </button>
                        </div>
                      </div>
                      
                      <div class="flex items-center gap-3">
                         <span v-if="isGenerating" class="text-[11px] font-bold text-indigo-400 animate-pulse mr-2 flex items-center gap-1.5">
                           <el-icon class="is-loading"><Loading /></el-icon> 正在为您构思精彩剧情...
                         </span>
                         <button 
                          class="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl text-[14px] font-black hover:shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-40 disabled:grayscale"
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
                  <div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-80" :class="isLight ? 'text-slate-400' : 'text-slate-500'">
                    <span class="w-8 h-[1px]" :class="isLight ? 'bg-slate-200' : 'bg-white/10'"></span>
                    热门题材灵感
                    <span class="w-8 h-[1px]" :class="isLight ? 'bg-slate-200' : 'bg-white/10'"></span>
                  </div>
                  <div class="flex flex-wrap items-center justify-center gap-2">
                    <div 
                      v-for="topic in hotTopics" 
                      :key="topic.label" 
                      @click="selectHotTopic(topic)"
                      class="px-4 py-1.5 rounded-2xl text-[12px] font-bold cursor-pointer transition-all flex items-center gap-2 border group"
                      :class="isLight ? 'border-slate-100 bg-white text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 hover:shadow-md hover:-translate-y-0.5' : 'border-white/5 bg-white/5 text-slate-300 hover:border-indigo-400/50 hover:text-indigo-400 hover:bg-white/10 hover:shadow-lg hover:-translate-y-0.5'"
                    >
                      <span class="w-1.5 h-1.5 rounded-full transition-colors" :class="isLight ? 'bg-slate-400 group-hover:bg-indigo-500' : 'bg-slate-500 group-hover:bg-indigo-400'"></span>
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
                  class="custom-upload-v3 w-full h-full"
                  @change="handleFileUpload"
                >
                  <div class="py-4">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm" :class="isLight ? 'bg-indigo-50 text-indigo-500' : 'bg-indigo-500/30 text-indigo-300'">
                      <el-icon :size="20"><upload-filled /></el-icon>
                    </div>
                    <div class="el-upload__text font-black text-[15px] mb-1 drop-shadow-md" :class="isLight ? 'text-slate-700' : '!text-white'">
                      <span :class="isLight ? 'text-slate-700' : 'text-white'">将小说文件拖到此处，或</span> 
                      <em 
                        class="not-italic font-[1000] underline underline-offset-4 transition-colors"
                        :class="isLight ? 'text-indigo-600 hover:text-indigo-500' : 'text-indigo-300 hover:text-indigo-200'"
                      >点击上传</em>
                    </div>
                    <div class="text-[12px] font-black drop-shadow-sm" :class="isLight ? 'text-slate-500' : 'text-white'">
                      支持 docx, pdf, txt 格式，不超过3万字
                    </div>
                  </div>
                </el-upload>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Projects Section -->
        <div class="w-full relative flex-1 min-h-0 flex flex-col rounded-[32px] p-4 border" :class="isLight ? 'bg-white/70 backdrop-blur-xl border-slate-200' : 'bg-slate-900/30 backdrop-blur-2xl border-white/10'">
          <div class="flex items-center justify-between mb-4 shrink-0">
            <h2 class="text-xl font-black flex items-center gap-2" :class="isLight ? 'text-slate-900' : 'text-white'">
              <span class="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
              近期作品
              <span class="text-slate-600 font-light text-lg">/</span>
              <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Recent Projects</span>
            </h2>
            <button 
              @click="router.push('/ai-short-drama-creator/works')" 
              class="group h-8 px-4 rounded-lg font-black text-[11px] transition-all flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95"
              :class="isLight ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'"
            >
              <span>管理作品</span>
              <el-icon class="group-hover:translate-x-1 transition-transform" :size="12"><ArrowRight /></el-icon>
            </button>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 overflow-hidden">
            <div 
              v-for="work in recentWorks.slice(0, 4)" 
              :key="work.id"
              class="rounded-[20px] overflow-hidden transition-all duration-500 cursor-pointer group flex flex-col"
              :class="isLight ? 'bg-white/60 backdrop-blur-md border border-slate-100 hover:shadow-xl hover:border-slate-200 hover:-translate-y-1' : 'bg-black/40 backdrop-blur-xl border border-white/5 hover:shadow-2xl hover:shadow-black/30 hover:border-white/20 hover:-translate-y-1'"
              @click="router.push('/ai-short-drama-creator/outline')"
            >
              <!-- Previews Area: More compact -->
              <div class="h-24 flex p-1 gap-1 overflow-hidden relative shrink-0" :class="isLight ? 'bg-slate-100' : 'bg-black/40'">
                <template v-if="work.previews && work.previews.length > 0">
                  <div 
                    v-for="(img, idx) in work.previews" 
                    :key="idx"
                    class="flex-1 h-full rounded-lg overflow-hidden"
                    :class="isLight ? 'bg-slate-200' : 'bg-slate-800'"
                  >
                    <img :src="img" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  </div>
                </template>
                <div v-else class="w-full h-full flex items-center justify-center rounded-lg" :class="isLight ? 'text-indigo-300 bg-white' : 'text-indigo-400/30 bg-white/5'">
                   <el-icon size="24" class="opacity-40 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500"><VideoCamera /></el-icon>
                </div>
                <div v-if="work.isExample" class="absolute top-2 left-2 px-1.5 py-0.5 bg-purple-600/90 backdrop-blur-sm text-white text-[8px] font-black uppercase tracking-widest rounded shadow-lg z-10">
                  Example
                </div>
              </div>

              <div class="p-3 flex flex-col gap-1.5">
                <h3 class="font-black truncate text-[14px] transition-colors" :class="isLight ? 'text-slate-800 group-hover:text-indigo-600' : 'text-slate-200 group-hover:text-indigo-400'" :title="work.title">
                  {{ work.title }}
                </h3>
                <div class="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                  <div class="flex items-center gap-1">
                    <el-icon class="text-indigo-400" :size="10"><Clock /></el-icon>
                    <span>{{ work.updatedAt.split(' ')[0] }}</span>
                  </div>
                  <span v-if="work.episodes" class="px-1.5 py-0.5 rounded" :class="isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/10 text-slate-400'">
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
      width="1200px" 
      class="hot-topic-dialog-v3 overflow-hidden rounded-[40px]" 
      :show-close="false"
      destroy-on-close
      top="1vh"
    >
      <div class="relative flex flex-col bg-[#F8FAFC] dark:bg-slate-950 max-h-[98vh] rounded-[36px] overflow-hidden border border-white/40 dark:border-slate-800/40">
        <!-- Premium Background Elements -->
        <div class="absolute -top-32 -left-32 w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none"></div>
        <div class="absolute top-1/2 -right-32 w-[400px] h-[400px] bg-purple-500/15 rounded-full blur-[120px] pointer-events-none"></div>
        <div class="absolute -bottom-32 left-1/4 w-[350px] h-[350px] bg-pink-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <!-- Header: Immersive Hero Style -->
        <div class="relative px-10 pt-4 pb-3 shrink-0 overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-indigo-600/15 via-purple-600/10 to-transparent dark:from-indigo-400/15 dark:via-purple-400/10"></div>
          
          <!-- Close Button: Premium Style -->
          <div class="absolute top-4 right-10 z-50 flex items-center gap-3">
            <button 
              @click="showHotTopicDialog = false" 
              class="w-9 h-9 flex items-center justify-center rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-700 transition-all duration-500 shadow-xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-700 hover:rotate-90"
            >
              <el-icon :size="18"><Close /></el-icon>
            </button>
          </div>

          <div class="relative flex items-center gap-6">
            <div class="w-12 h-12 rounded-[20px] bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-[0_12px_40px_rgba(79,70,229,0.3)] ring-4 ring-white dark:ring-slate-900 transition-all hover:scale-110 hover:rotate-6 duration-500 group">
              <el-icon :size="24" class="group-hover:animate-pulse"><MagicStick /></el-icon>
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-4">
                <h2 class="text-2xl font-[1000] tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-600 to-purple-600 dark:from-white dark:via-indigo-300 dark:to-purple-300 drop-shadow-sm">
                  开启灵感之门
                </h2>
                <span class="px-3 py-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white text-[10px] font-[1000] uppercase tracking-[0.2em] rounded-xl shadow-[0_6px_20px_rgba(79,70,229,0.3)] border border-white/20">
                  AI PRO
                </span>
              </div>
              <p class="text-[13px] text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2 mt-1">
                每一项都可以由 <span class="text-indigo-600 dark:text-indigo-400 font-black">AI 深度润色</span>，打造爆款短剧。
              </p>
            </div>
          </div>
        </div>

        <!-- Body: Refined Card Layout -->
        <div class="flex-1 overflow-y-auto px-10 pb-4 flex flex-col gap-4 relative z-10 custom-scrollbar-v2">
          
          <div class="grid grid-cols-2 gap-4">
            <!-- Section 0: Work Title -->
            <div class="group p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[28px] border border-white dark:border-slate-800 shadow-xl shadow-indigo-500/5 animate-fade-in transition-all duration-500 hover:shadow-indigo-500/10 hover:border-indigo-500/30">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-[10px] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all shadow-sm">
                    <el-icon :size="14"><EditPen /></el-icon>
                  </div>
                  <div>
                    <label class="text-[12px] font-[1000] text-slate-400 dark:text-slate-500 tracking-tight uppercase">作品名称</label>
                  </div>
                </div>
                <button 
                  @click="handleAIFeature('title', 'polish')" 
                  :disabled="isGeneratingField.title" 
                  class="group/btn flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all duration-500 text-[11px] font-black shadow-sm border border-indigo-100 dark:border-indigo-900 overflow-hidden relative"
                >
                  <div class="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                  <el-icon :size="12" class="relative z-10 group-hover/btn:rotate-12 transition-transform duration-500" :class="{'is-loading': isGeneratingField.title}"><Brush /></el-icon>
                  <span class="relative z-10">AI 润色</span>
                </button>
              </div>
              <el-input 
                v-model="configForm.title" 
                placeholder="为您的短剧起一个吸睛的名字..." 
                class="custom-input-v5 !h-14 !text-[15px]"
              />
            </div>

            <!-- Section 0.1: Genre Select -->
              <div class="group p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[28px] border border-white dark:border-slate-800 shadow-xl shadow-indigo-500/5 animate-fade-in transition-all duration-500 hover:shadow-indigo-500/10 hover:border-indigo-500/30">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-7 h-7 rounded-[10px] bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all shadow-sm">
                    <el-icon :size="14"><CollectionTag /></el-icon>
                  </div>
                  <div>
                    <label class="text-[12px] font-[1000] text-slate-400 dark:text-slate-500 tracking-tight uppercase">题材类型</label>
                  </div>
                </div>
                
                <div class="relative">
                  <el-select 
                    v-if="configForm.genre !== '自定义'"
                    v-model="configForm.genre" 
                    filterable 
                    allow-create 
                    default-first-option
                    placeholder="选择或输入题材..." 
                    class="w-full custom-select-v4 !h-14 !text-[15px]"
                  >
                    <el-option
                      v-for="item in hotTopics"
                      :key="item.label"
                      :label="item.label"
                      :value="item.label"
                    />
                  </el-select>
                  
                  <div v-else class="flex items-center bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-700 overflow-hidden h-14 shadow-sm transition-all hover:border-indigo-500 focus-within:border-indigo-500 focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.1)]">
                    <input 
                      v-model="configForm.customGenre" 
                      placeholder="输入自定义题材名称" 
                      class="flex-1 px-4 bg-transparent border-none outline-none text-[15px] text-slate-700 dark:text-slate-200 font-bold"
                    />
                    <div class="flex items-center px-3 h-full gap-2 border-l border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                      <button @click="handleGenreConfirm" class="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg transition-all group/confirm" title="确认">
                        <el-icon :size="20" class="text-purple-600 dark:text-purple-400 group-hover/confirm:scale-110 transition-transform"><Check /></el-icon>
                      </button>
                      <button @click="configForm.genre = ''; configForm.customGenre = ''" class="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all group/cancel" title="取消">
                        <el-icon :size="20" class="text-slate-500 dark:text-slate-400 group-hover/cancel:scale-110 transition-transform"><Close /></el-icon>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
          </div>

          <!-- Section 1: Strategic Options -->
          <div class="grid grid-cols-4 gap-4">
            <!-- Protagonist -->
            <div class="col-span-1 group bg-white dark:bg-slate-900 p-4 rounded-[24px] border border-slate-200/50 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 transition-all duration-500">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-7 h-7 rounded-[10px] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all shadow-sm">
                  <el-icon :size="14"><User /></el-icon>
                </div>
                <label class="text-[12px] font-[1000] text-slate-400 dark:text-slate-500 tracking-tight uppercase">主角设定</label>
              </div>
              <div class="relative">
                <el-select 
                  v-if="configForm.protagonistSetting !== '自定义'"
                  v-model="configForm.protagonistSetting" 
                  @change="handleProtagonistChange" 
                  class="w-full custom-select-v4 !h-12" 
                >
                  <el-option v-for="opt in protagonistOptions" :key="opt.label" :label="opt.label" :value="opt.label">
                    <div class="flex items-center justify-between w-full">
                      <span class="font-bold text-[14px] text-slate-700 dark:text-slate-200">{{ opt.label }}</span>
                      <el-icon v-if="configForm.protagonistSetting === opt.label" class="text-indigo-500" :size="12"><Check /></el-icon>
                    </div>
                  </el-option>
                </el-select>
                <div v-else class="flex items-center bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-700 overflow-hidden h-12 shadow-sm transition-all hover:border-indigo-500 focus-within:border-indigo-500 focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.1)]">
                  <input 
                    v-model="configForm.customProtagonistName" 
                    placeholder="自定义名称" 
                    class="flex-1 px-3 bg-transparent border-none outline-none text-[14px] text-slate-700 dark:text-slate-200 font-bold"
                  />
                  <div class="flex items-center px-2 h-full gap-1 border-l border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <button @click="handleProtagonistConfirm" class="p-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-all group/confirm" title="确认">
                      <el-icon :size="16" class="text-indigo-600 dark:text-indigo-400 group-hover/confirm:scale-110 transition-transform"><Check /></el-icon>
                    </button>
                    <button @click="configForm.protagonistSetting = protagonistOptions[0].label; configForm.customProtagonistName = ''" class="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all group/cancel" title="取消">
                      <el-icon :size="16" class="text-slate-500 dark:text-slate-400 group-hover/cancel:scale-110 transition-transform"><Close /></el-icon>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Video Style -->
            <div class="col-span-1 group bg-white dark:bg-slate-900 p-4 rounded-[24px] border border-slate-200/50 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/30 transition-all duration-500">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-7 h-7 rounded-[10px] bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-all shadow-sm">
                  <el-icon :size="14"><Picture /></el-icon>
                </div>
                <label class="text-[12px] font-[1000] text-slate-400 dark:text-slate-500 tracking-tight uppercase">视频风格</label>
              </div>
              <el-select v-model="configForm.videoStyle" class="w-full custom-select-v4 !h-12" >
                <el-option v-for="opt in videoStyleOptions" :key="opt.label" :label="opt.label" :value="opt.label">
                  <div class="flex items-center justify-between w-full">
                    <span class="text-[14px] font-bold text-slate-700 dark:text-slate-200">{{ opt.label }}</span>
                    <el-icon v-if="configForm.videoStyle === opt.label" class="text-purple-500" :size="12"><Check /></el-icon>
                  </div>
                </el-option>
              </el-select>
            </div>

            <!-- Audience -->
            <div class="col-span-1 group bg-white dark:bg-slate-900 p-4 rounded-[24px] border border-slate-200/50 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-pink-500/10 hover:border-pink-500/30 transition-all duration-500">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-7 h-7 rounded-[10px] bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all shadow-sm">
                  <el-icon :size="14"><Star /></el-icon>
                </div>
                <label class="text-[12px] font-[1000] text-slate-400 dark:text-slate-500 tracking-tight uppercase">目标受众</label>
              </div>
              <el-select v-model="configForm.targetAudience" class="w-full custom-select-v4 !h-12" >
                <el-option v-for="aud in audienceOptions" :key="aud" :label="aud" :value="aud">
                  <div class="flex items-center justify-between w-full">
                    <span class="text-[14px] font-bold text-slate-700 dark:text-slate-200">{{ aud }}</span>
                    <el-icon v-if="configForm.targetAudience === aud" class="text-pink-500" :size="12"><Check /></el-icon>
                  </div>
                </el-option>
              </el-select>
            </div>

            <!-- Creation Specs: White Premium Style -->
            <div class="col-span-1 group bg-white dark:bg-slate-900 p-4 rounded-[24px] border border-slate-200/50 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 transition-all duration-500 flex flex-col justify-center gap-4">
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-2 shrink-0 w-24">
                  <div class="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-sm">
                    <el-icon :size="14"><Collection /></el-icon>
                  </div>
                  <span class="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">生成集数</span>
                </div>
                <div class="flex-1 relative">
                  <el-input v-model="configForm.episodesCount" placeholder="80" class="custom-input-v5 !h-10 !text-[14px]" />
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-indigo-400/80 uppercase tracking-tighter">EPS</span>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <div class="flex items-center gap-2 shrink-0 w-24">
                  <div class="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-sm">
                    <el-icon :size="14"><Timer /></el-icon>
                  </div>
                  <span class="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">单集时长</span>
                </div>
                <div class="flex-1 relative">
                  <el-input-number v-model="configForm.expectedDuration" :min="30" :max="300" :step="10" controls-position="right" class="custom-number-v5 w-full !h-10" />
                  <span class="absolute right-10 top-1/2 -translate-y-1/2 text-[9px] font-black text-indigo-400/80 uppercase tracking-tighter pointer-events-none">SEC</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: Story Background (Featured Card) -->
          <div class="relative group">
            <div class="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[30px] blur opacity-5 group-focus-within:opacity-20 transition duration-500"></div>
            <div class="relative flex flex-col gap-2 p-4 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/40">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-[10px] bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                    <el-icon :size="14"><Location /></el-icon>
                  </div>
                  <div>
                    <h3 class="text-[12px] font-[1000] text-slate-400 dark:text-slate-500 uppercase tracking-wider">故事背景</h3>
                  </div>
                </div>
                <button 
                  @click="handleAIFeature('storyBackground', 'polish')" 
                  :disabled="isGeneratingField.storyBackground" 
                  class="group/btn flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all duration-500 text-[11px] font-black shadow-sm border border-indigo-100 dark:border-indigo-900 overflow-hidden relative"
                >
                  <div class="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                  <el-icon :size="12" class="relative z-10 group-hover/btn:rotate-12 transition-transform duration-500" :class="{'is-loading': isGeneratingField.storyBackground}"><Brush /></el-icon>
                  <span class="relative z-10">AI 润色</span>
                </button>
              </div>
              <el-input v-model="configForm.storyBackground" type="textarea" :rows="3" placeholder="构建世界观、时代与环境设定..." class="custom-textarea-v4 !text-[15px]" />
            </div>
          </div>

          <!-- Section 3: Character Profile -->
          <div class="group flex flex-col gap-2 p-4 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-500">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-[10px] bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <el-icon :size="14"><Avatar /></el-icon>
                </div>
                <div>
                  <h3 class="text-[12px] font-[1000] text-slate-400 dark:text-slate-500 uppercase tracking-wider">角色档案</h3>
                </div>
              </div>
              <button 
                @click="handleAIFeature('storySetting', 'polish')"
                :disabled="isGeneratingField.protagonistDesc" 
                class="group/btn flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white transition-all duration-500 text-[11px] font-black shadow-sm border border-purple-100 dark:border-purple-900 overflow-hidden relative"
              >
                <div class="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                <el-icon :size="12" class="relative z-10 group-hover/btn:rotate-12 transition-transform duration-500" :class="{'is-loading': isGeneratingField.protagonistDesc}"><Brush /></el-icon>
                <span class="relative z-10">AI 润色</span>
              </button>
            </div>
            <el-input v-model="configForm.protagonistDesc" type="textarea" :rows="3" placeholder="描述主角的性格、身份背景..." class="custom-textarea-v4 !text-[15px]" />
          </div>

          <!-- Section 4: Story Setting -->
          <div class="group flex flex-col gap-2 p-4 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-500">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-[10px] bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                  <el-icon :size="14"><Connection /></el-icon>
                </div>
                <div>
                  <h3 class="text-[12px] font-[1000] text-slate-400 dark:text-slate-500 uppercase tracking-wider">故事设定</h3>
                </div>
              </div>
              <button 
                @click="handleAIFeature('storySetting', 'polish')" 
                :disabled="isGeneratingField.storySetting" 
                class="group/btn flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 hover:bg-amber-600 hover:text-white transition-all duration-500 text-[11px] font-black shadow-sm border border-amber-100 dark:border-amber-900 overflow-hidden relative"
              >
                <div class="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                <el-icon :size="12" class="relative z-10 group-hover/btn:rotate-12 transition-transform duration-500" :class="{'is-loading': isGeneratingField.storySetting}"><Brush /></el-icon>
                <span class="relative z-10">AI 润色</span>
              </button>
            </div>
            <el-input v-model="configForm.storySetting" type="textarea" :rows="3" placeholder="人物关系、核心矛盾设定..." class="custom-textarea-v4 !text-[15px]" />
          </div>

          <!-- Section 5: Synopsis (Full Width) -->
          <div class="group flex flex-col gap-2 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-[24px] border border-emerald-100 dark:border-emerald-900/30 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-500/30">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-[10px] bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <el-icon :size="14"><Document /></el-icon>
                </div>
                <div>
                  <h3 class="text-[12px] font-[1000] text-slate-400 dark:text-slate-500 uppercase tracking-wider">故事梗概</h3>
                </div>
              </div>
              <button 
                @click="handleAIFeature('storySynopsis', 'polish')" 
                :disabled="isGeneratingField.storySynopsis" 
                class="group/btn flex items-center gap-2 px-3 py-1 rounded-lg bg-white dark:bg-slate-800 text-emerald-600 hover:text-white transition-all duration-500 text-[11px] font-black shadow-sm border border-emerald-100 dark:border-emerald-900/30 overflow-hidden relative"
              >
                <div class="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                <el-icon :size="12" class="relative z-10 group-hover/btn:rotate-12 transition-transform duration-500" :class="{'is-loading': isGeneratingField.storySynopsis}"><Brush /></el-icon>
                <span class="relative z-10">AI 补全大纲</span>
              </button>
            </div>
            <el-input v-model="configForm.storySynopsis" type="textarea" :rows="4" placeholder="详细描述整个故事的发展脉络..." class="custom-textarea-v4 !text-[15px]" />
          </div>

        </div>

        <!-- Footer: High-Impact Action Center -->
        <div class="px-10 py-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0 relative z-20 shadow-[0_-15px_40px_rgba(0,0,0,0.02)]">
          <div class="flex items-center gap-8">
            <!-- Left: AI Intelligence Block -->
            <div class="flex-1 flex items-center justify-between gap-6 p-4 bg-slate-50 dark:bg-indigo-500/5 rounded-[24px] border border-slate-200/50 dark:border-indigo-500/20 group relative overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-indigo-500/10">
              <div class="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div class="flex flex-col relative z-10">
                <div class="flex items-center gap-3 mb-1">
                  <div class="flex h-2.5 w-2.5 relative">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
                  </div>
                  <span class="text-lg font-[1000] text-slate-800 dark:text-white tracking-tighter">智能灵感补全</span>
                </div>
                <p class="text-[13px] text-slate-500 dark:text-slate-400 font-bold tracking-tight">只需基础信息，<span class="text-indigo-600 dark:text-indigo-400">AI</span> 自动构建全案</p>
              </div>

              <!-- AI One-click Generation Button: Colored Premium Style -->
              <button 
                @click="generateInspirationData" 
                :disabled="isGeneratingInspiration"
                class="relative z-10 flex items-center gap-3 px-6 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-500 text-[14px] font-[1000] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 group/btn"
              >
                <div class="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                <el-icon :class="{'is-loading': isGeneratingInspiration}" :size="20" class="relative z-10 group-hover/btn:rotate-12 transition-transform">
                  <MagicStick v-if="!isGeneratingInspiration"/>
                  <Loading v-else/>
                </el-icon>
                <span class="relative z-10 tracking-wider">{{ isGeneratingInspiration ? '构思中...' : '一键生成' }}</span>
              </button>
            </div>

            <!-- Right: The Primary Action -->
            <button 
              @click="finishConfig"
              :disabled="!isFormComplete"
              class="group relative px-10 h-12 flex items-center justify-center gap-4 bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 text-white rounded-[24px] font-[1000] text-lg shadow-[0_10px_20px_-5px_rgba(79,70,229,0.4)] active:scale-[0.96] transition-all duration-500 disabled:opacity-40 disabled:grayscale disabled:pointer-events-none overflow-hidden"
              :class="{'hover:shadow-[0_15px_30px_-8px_rgba(79,70,229,0.5)] hover:-translate-y-0.5 animate-pulse-indigo': isFormComplete}"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
              <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <el-icon :size="24" class="group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 animate-float"><Lightning /></el-icon>
              <span class="tracking-[0.1em] uppercase">开启创作</span>
            </button>
          </div>
        </div>
      </div>
    </el-dialog>


    <ProductDesignDialog
      v-model="showDesignDialog"
      id="short-drama-new"
      :default-content="{
        title: '新建短剧',
        location: '系统创作入口，支持“AI灵感生成”与“外部剧本导入”双模式切换，决定后续生成的所有核心输入源。',
        layout: [
          '**灵感输入区：** 中央大型 TextArea 容器，支持多行输入。底部状态栏包含字数实时统计、清空与 AI 润色功能。',
          '**题材灵感区：** 提供热门题材标签云，点击可触发高级配置弹窗 (HotTopicDialog)。',
          '**创作规格区：** 2.2 版本新增“AI+手动”混合模式，允许用户在生成前自定义集数、时长及核心设定。'
        ],
        interactions: [
          {
            text: '**立即创作 (核心动作)：**\n - **流程：** 用户输入灵感 -> 点击按钮 -> 系统启动 AI 扩展引擎 -> 自动构建完整的“故事设定、主角人设、核心冲突及结局预览” -> 数据持久化至 Store -> 自动重定向至大纲工作台\n - **状态：** 按钮点击后立即进入 Loading 状态，防止多次点击导致重复生成。',
            image: imgNewDramaCreate
          },
          {
            text: '**功能说明 (2.2版本)：**\n - **创作模式：** 2.2版本支持 AI 灵感生成与手动精修模式，确保创作的原创性与灵活性。\n - **自由操作：** 全面支持手动新增、编辑或删除剧本、主体、分镜等，实现 AI 自动化与人工干预的深度结合。',
            image: ''
          },
          {
            text: '**属性规格与名词解释：**\n - **灵感输入 (aiPrompt)：** 创作的最初源动力。**字数限制：10-500字**\n - **生成集数 (episodesCount)：** 2.2版本支持 1-100 集自由设定。\n - **单集时长 (expectedDuration)：** 每集视频的预期时长。**数值限制：30-300秒**。',
            image: ''
          }
        ],
        version: '2.2'
      }"
    />

    <GlobalUIDesignSpecsDialog
      v-model="showUIDesignSpecsDialog"
      title="UI 设计标注 - 新建短剧"
      subtitle="NewDrama UI Design Specifications"
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
import { ref, inject, reactive, computed } from 'vue';
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
  Loading,
  Crop,
  CircleCheck,
  FullScreen
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import ProductDesignDialog from '@/components/Common/ProductDesignDialog.vue';
import GlobalUIDesignSpecsDialog from '@/components/Common/GlobalUIDesignSpecsDialog.vue';
// 导入产品设计图片以确保被 Vite 编译进源代码
import imgNewDramaCreate from '@/assets/images/design/1776419701211-0ff82d3e790e7432.png';

import { useDramaStore } from '../../store/drama';

const router = useRouter();
const dramaStore = useDramaStore();
const isLight = inject('isLight', ref(true));
const showDesignDialog = ref(false);
const showUIDesignSpecsDialog = ref(false);
const showHotTopicDialog = ref(false);
const currentStep = ref(1);
const selectedTopic = ref<any>(null);

const uiDesignGroups = {
  layout: [
    {
      id: 'newDrama',
      title: '短剧创作首页 (NewDrama)',
      description: '短剧创作入口页：AI 灵感输入 / 剧本导入 / 近期作品。',
      items: [
        { name: '页面内边距', value: 'p-4 / lg:p-6', description: '主滚动容器 padding' },
        { name: '主容器宽度', value: 'max-w-7xl', description: '整体内容水平居中' },
        { name: '创作卡宽度', value: 'max-w-5xl', description: 'AI 输入与导入区域' },
        { name: '创作卡圆角', value: '32px', description: 'rounded-[32px]' },
        { name: 'Tab 容器圆角', value: '18px / 14px', description: 'rounded-[18px] + rounded-[14px]' },
        { name: '输入框圆角', value: '28px', description: 'rounded-[28px]（含 2px 边框）' },
        { name: '输入框高度', value: 'h-24 / md:h-28', description: '文本域高度' },
        { name: '按钮圆角', value: 'rounded-2xl', description: '立即创作主按钮' },
        { name: '近期作品区圆角', value: '32px', description: 'rounded-[32px]' },
        { name: '作品卡圆角', value: '20px', description: 'rounded-[20px]' },
        { name: '作品预览区高度', value: 'h-24', description: '卡片顶部预览区域高度' },
        { name: '作品网格列数', value: '2 / 4', description: 'grid-cols-2 lg:grid-cols-4，gap-4' }
      ]
    },
    {
      id: 'hotTopicDialog',
      title: '弹窗：开启灵感之门 (HotTopicDialog)',
      description: '高级创作规格配置弹窗：标题/题材/主角/风格/受众/集数/时长/背景等。',
      items: [
        { name: 'Dialog 宽度', value: '1200px', description: 'el-dialog width="1200px"' },
        { name: 'Dialog 顶部偏移', value: 'top: 1vh', description: 'top="1vh"' },
        { name: 'Dialog 圆角', value: '40px', description: 'rounded-[40px]（外层）' },
        { name: 'Dialog 内层圆角', value: '36px', description: 'rounded-[36px]（内容容器）' },
        { name: '头部内边距', value: 'px-10 pt-4 pb-3', description: '沉浸式 Hero Header' },
        { name: '内容区内边距', value: 'px-10 pb-4', description: '滚动内容区' },
        { name: '内容区间距', value: 'gap-4', description: '纵向模块间距' },
        { name: '顶部两列栅格', value: 'grid-cols-2 gap-4', description: '标题/题材' },
        { name: '策略选项栅格', value: 'grid-cols-4 gap-4', description: '主角/风格/受众/规格' },
        { name: '底部操作区', value: 'px-10 py-4', description: '固定 Footer（Action Center）' },
        { name: '关闭按钮尺寸', value: '36x36', description: 'w-9 h-9 rounded-2xl' },
        { name: '主CTA尺寸', value: 'h-12', description: '开启创作按钮高度' }
      ]
    }
  ],
  style: [
    {
      id: 'newDrama',
      title: '短剧创作首页 (NewDrama)',
      description: '入口页字号、层级与组件文本规范。',
      items: [
        { name: '主标题 (Hero H1)', style: { fontSize: '30px', fontWeight: '900', letterSpacing: '-0.02em' }, description: 'text-2xl md:text-3xl font-black tracking-tight leading-tight' },
        { name: '副标题 (Hero Desc)', style: { fontSize: '14px', fontWeight: '500', opacity: '0.7' }, description: 'text-xs md:text-sm font-medium leading-relaxed opacity-70 text-slate-500' },
        { name: 'Tab 标题', style: { fontSize: '14px', fontWeight: '900' }, description: 'text-[14px] font-black' },
        { name: '输入正文', style: { fontSize: '18px', fontWeight: '500', lineHeight: '1.6' }, description: 'text-lg font-medium leading-relaxed placeholder:text-slate-400/60' },
        { name: '工具条统计', style: { fontSize: '11px', fontWeight: '700' }, description: 'text-[11px] font-bold（字数统计/状态提示）' },
        { name: '区块标题', style: { fontSize: '20px', fontWeight: '900' }, description: 'text-xl font-black（近期作品）' }
      ]
    },
    {
      id: 'hotTopicDialog',
      title: '弹窗：开启灵感之门 (HotTopicDialog)',
      description: '弹窗标题层级、字段标签与按钮字重。',
      items: [
        { name: '弹窗标题', style: { fontSize: '24px', fontWeight: '1000', letterSpacing: '-0.03em' }, description: 'text-2xl font-[1000] tracking-tighter（渐变文字）' },
        { name: '弹窗副文案', style: { fontSize: '13px', fontWeight: '700' }, description: 'text-[13px] font-bold text-slate-500' },
        { name: '字段 Label', style: { fontSize: '12px', fontWeight: '1000', textTransform: 'uppercase' }, description: 'text-[12px] font-[1000] tracking-tight uppercase' },
        { name: '输入内容', style: { fontSize: '15px', fontWeight: '700' }, description: '!text-[15px]（custom-input-v5 / custom-select-v4）' },
        { name: '辅助单位标签', style: { fontSize: '9px', fontWeight: '900', opacity: '0.8' }, description: 'text-[9px] font-black text-indigo-400/80 uppercase' },
        { name: '底部主按钮', style: { fontSize: '18px', fontWeight: '1000', letterSpacing: '0.1em' }, description: 'text-lg font-[1000] tracking-[0.1em] uppercase' }
      ]
    }
  ],
  color: [
    {
      id: 'newDrama',
      title: '短剧创作首页 (NewDrama)',
      description: '入口页背景、毛玻璃与渐变主题色。',
      items: [
        { name: '页面背景', value: '#F8FAFC' },
        { name: '标题渐变', value: 'from-indigo-600 via-purple-600 to-pink-500' },
        { name: '装饰光晕', value: 'bg-indigo-500/5 + bg-purple-500/5' },
        { name: '主卡片毛玻璃', value: 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl' },
        { name: '输入区边框', value: 'border-slate-100 dark:border-slate-800' },
        { name: '输入聚焦高亮', value: 'group-focus-within:border-indigo-500/40' },
        { name: '工具条底色', value: 'bg-slate-50/80 dark:bg-slate-800/80' },
        { name: '主按钮渐变', value: 'from-indigo-600 to-purple-600' },
        { name: '热门题材标签', value: 'bg-white border-slate-100 hover:border-indigo-300 hover:text-indigo-600' },
        { name: '近期作品标题条', value: 'bg-indigo-600 (left bar)' },
        { name: '管理作品按钮', value: 'bg-slate-900 dark:bg-white' }
      ]
    },
    {
      id: 'hotTopicDialog',
      title: '弹窗：开启灵感之门 (HotTopicDialog)',
      description: '弹窗背景、Hero 渐变遮罩与主 CTA 色彩。',
      items: [
        { name: '弹窗背景', value: '#F8FAFC / dark:bg-slate-950' },
        { name: '头部渐变遮罩', value: 'from-indigo-600/15 via-purple-600/10 to-transparent' },
        { name: '光晕装饰', value: 'bg-indigo-500/15 + bg-purple-500/15 + bg-pink-500/10' },
        { name: '标题渐变', value: 'from-slate-900 via-indigo-600 to-purple-600' },
        { name: 'AI PRO 徽标', value: 'from-indigo-600 via-purple-600 to-pink-500' },
        { name: '卡片毛玻璃', value: 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl' },
        { name: '卡片边框', value: 'border-white dark:border-slate-800' },
        { name: '卡片 Hover 边框', value: 'hover:border-indigo-500/30' },
        { name: 'AI 润色按钮', value: 'bg-indigo-50 hover:bg-indigo-600（渐变覆盖）' },
        { name: '关闭按钮 Hover', value: 'hover:text-rose-500 hover:rotate-90' },
        { name: '一键生成按钮', value: 'from-indigo-600 to-purple-600' },
        { name: '开启创作按钮', value: 'from-indigo-600 via-indigo-500 to-purple-600' }
      ]
    }
  ],
  button: [
    {
      id: 'newDrama',
      title: '短剧创作首页 (NewDrama)',
      description: '入口页关键组件与交互态。',
      items: [
        { name: '模式切换 Tab', tag: 'button', classes: 'flex-1 py-1.5 text-[14px] font-black rounded-[14px] flex items-center justify-center gap-2', notes: ['Active: bg-white/dark:bg-slate-700 + text-indigo-600 + shadow-sm + scale-[1.01]', 'Inactive: text-slate-500 hover:text-slate-700'] },
        { name: '灵感输入容器', tag: 'div', classes: 'relative bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 group-focus-within:border-indigo-500/40 shadow-2xl shadow-indigo-500/5', notes: ['外围使用渐变 blur 作为动态描边（focus/生成时）'] },
        { name: '灵感输入 Textarea', tag: 'textarea', classes: 'w-full h-24 md:h-28 resize-none bg-transparent outline-none text-slate-800 dark:text-slate-100 text-lg p-6 font-medium leading-relaxed', notes: ['Placeholder: text-slate-400/60'] },
        { name: '底部工具条', tag: 'div', classes: 'px-6 py-3 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between', notes: ['左侧字数统计/清空/AI润色；右侧主CTA'] },
        { name: '立即创作 (主 CTA)', tag: 'button', classes: 'px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl text-[14px] font-black hover:shadow-lg hover:shadow-indigo-500/30 active:scale-95 disabled:opacity-40 disabled:grayscale', notes: ['Disabled: 无输入或生成中', 'Loading: 图标切换为 Loading'] },
        { name: '热门题材标签', tag: 'div', classes: 'px-4 py-1.5 rounded-2xl text-[12px] font-bold border border-slate-100 bg-white hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md hover:-translate-y-0.5', notes: ['点击触发“开启灵感之门”弹窗'] },
        { name: '管理作品按钮', tag: 'button', classes: 'h-8 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-black text-[11px] shadow-md hover:scale-105 active:scale-95', notes: ['右侧箭头 hover 平移 translate-x-1'] },
        { name: '近期作品卡片', tag: 'div', classes: 'bg-white dark:bg-slate-800 rounded-[20px] border border-slate-100/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-500', notes: ['Hover: 预览图 scale-110；标题变色 text-indigo-600'] }
      ]
    },
    {
      id: 'hotTopicDialog',
      title: '弹窗：开启灵感之门 (HotTopicDialog)',
      description: '弹窗关键组件、输入控件与主 CTA。',
      items: [
        { name: '关闭按钮', tag: 'button', classes: 'w-9 h-9 rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl text-slate-400 hover:text-rose-500 hover:bg-white hover:rotate-90 shadow-xl border border-white', notes: ['点击关闭弹窗', 'Hover: 旋转 90° + 颜色变红'] },
        { name: '弹窗标题块', tag: 'h2', classes: 'text-2xl font-[1000] tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-600 to-purple-600', notes: ['与左侧 Icon 卡形成 Hero 区域'] },
        { name: 'AI 润色按钮', tag: 'button', classes: 'px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 hover:bg-indigo-600 hover:text-white text-[11px] font-black border border-indigo-100 overflow-hidden relative', notes: ['Hover: 渐变层覆盖 from-indigo-600 to-purple-600', 'Loading: icon is-loading'] },
        { name: '字段卡片', tag: 'div', classes: 'p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[28px] border border-white dark:border-slate-800 shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/30', notes: ['用于作品名称/题材等重要字段'] },
        { name: 'Select 选择器', tag: 'el-select', classes: 'custom-select-v4 !h-14 / !h-12', notes: ['下拉项右侧显示 Check 选中态', '支持 allow-create（题材）'] },
        { name: 'Input 输入框', tag: 'el-input', classes: 'custom-input-v5 !h-14 !text-[15px]', notes: ['用于作品名称/集数等'] },
        { name: 'InputNumber 数字输入', tag: 'el-input-number', classes: 'custom-number-v5 w-full !h-10 controls-position="right"', notes: ['右侧单位 SEC 叠加在输入上'] },
        { name: '一键生成 (智能补全)', tag: 'button', classes: 'px-6 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:-translate-y-0.5 active:scale-95 disabled:opacity-50', notes: ['Loading: 图标切换为 Loading', 'Hover: 渐变反转层覆盖'] },
        { name: '开启创作 (主动作)', tag: 'button', classes: 'px-10 h-12 bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 text-white rounded-[24px] text-lg font-[1000] shadow-[0_10px_20px_-5px_rgba(79,70,229,0.4)] active:scale-[0.96] disabled:opacity-40', notes: ['表单完整时增加 shimmer 光带与 hover 阴影'] }
      ]
    }
  ]
};

const designImageUrl = (fileName: string) => `${import.meta.env.BASE_URL}images/design/${fileName}`;

// --- State Management ---
const activeTab = ref('ai'); 
const aiPrompt = ref('');
const isGenerating = ref(false);
const isGeneratingInspiration = ref(false);
const isGeneratingField = reactive<Record<string, boolean>>({
  title: false,
  storySynopsis: false,
  storyBackground: false,
  storySetting: false,
  episodesCount: false
});

// Configuration state
const configForm = reactive({
  title: '',
  scriptType: 'short_drama',
  genre: '',
  customGenre: '',
  targetAudience: '女频',
  videoStyle: '写实',
  episodesCount: '80',
  expectedDuration: 120,
  protagonistSetting: '落魄千金',
  customProtagonistName: '',
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

const protagonistOptions = ref([
  { label: '落魄千金', desc: '家族破产，背负巨债，却拥有一手惊人的调香/设计才华。' },
  { label: '冷面总裁', desc: '商界奇才，性格孤僻，因童年阴影不再相信爱情。' },
  { label: '平民少女', desc: '乐观坚韧，为了给母亲治病，卷入豪门恩怨。' },
  { label: '神秘杀手', desc: '隐姓埋名在都市中，执行最后一次任务。' },
  { label: '自定义', desc: '手动输入或 AI 生成您心目中的完美主角。', isCustom: true }
]);

const isCustomProtagonist = computed(() => {
  const opt = protagonistOptions.value.find(o => o.label === configForm.protagonistSetting);
  return opt?.isCustom || configForm.protagonistSetting === '自定义';
});

const isFormComplete = computed(() => {
  const isGenreValid = configForm.genre === '自定义' 
    ? configForm.customGenre.trim().length > 0 
    : (configForm.genre && configForm.genre.trim().length > 0);

  return configForm.title &&
         isGenreValid && 
         configForm.protagonistSetting && 
         configForm.protagonistDesc && 
         configForm.storySynopsis && 
         configForm.storyBackground && 
         configForm.storySetting && 
         configForm.targetAudience && 
         configForm.videoStyle;
});

const handleProtagonistChange = (val: string) => {
  if (val === '自定义') {
    // Focus or simple logic can be added here if needed, but ElMessageBox is removed for better C-end UX.
  }
};

const handleProtagonistConfirm = () => {
  if (configForm.customProtagonistName.trim()) {
    ElMessage.success(`已确认主角设定：${configForm.customProtagonistName}`);
    // Optional: could add more logic here to "lock" the selection if needed
  } else {
    ElMessage.warning('请输入主角设定名称');
  }
};

const handleGenreConfirm = () => {
  if (configForm.genre.trim()) {
    ElMessage.success(`已确认题材：${configForm.genre}`);
  } else {
    ElMessage.warning('请选择或输入题材名称');
  }
};

const audienceOptions = ['男频', '女频', '大众'];

const handleAIFeature = (field: 'title' | 'storySynopsis' | 'storyBackground' | 'storySetting' | 'episodesCount', action: 'generate' | 'polish') => {
  isGeneratingField[field] = true;
  
  // Mock AI behavior
  setTimeout(() => {
    if (field === 'title') {
      configForm.title = configForm.title || '未命名作品';
      configForm.title = configForm.title.replace('（已由 AI 润色）', '') + '（已由 AI 润色）';
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
  const finalProtagonistName = isCustomProtagonist.value && configForm.customProtagonistName.trim()
    ? configForm.customProtagonistName.trim()
    : configForm.protagonistSetting;

  const protagonist = `【主角设定】${finalProtagonistName}`;

  const finalGenre = configForm.genre === '自定义' && configForm.customGenre.trim()
    ? configForm.customGenre.trim()
    : (configForm.genre || selectedTopic.value.label);

  const finalPrompt = `【作品名称】${configForm.title || '未命名短剧'}
【题材】${finalGenre}
${protagonist}
【角色档案】${configForm.protagonistDesc}
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
  configForm.title = ''; // Reset title
  
  configForm.episodesCount = '80';
  configForm.expectedDuration = 120;
  
  // Set default selections for the first row
  configForm.protagonistSetting = protagonistOptions.value[0].label;
  configForm.targetAudience = audienceOptions[0];
  configForm.videoStyle = videoStyleOptions[0].label;
  
  // Clear the fields by default as requested by user
  configForm.storySynopsis = '';
  configForm.storyBackground = '';
  configForm.storySetting = '';
  configForm.protagonistDesc = '';
  
  currentStep.value = 1;
  showHotTopicDialog.value = true;
};

const generateInspirationData = () => {
  const topic = selectedTopic.value;
  if (!topic) return;

  isGeneratingInspiration.value = true;
  
  setTimeout(() => {
    if (topic.template) {
      const parts = topic.template.split('\n');
      if (!configForm.storySynopsis) {
        configForm.storySynopsis = parts.find((p: string) => p.includes('核心冲突'))?.replace('核心冲突：', '') || '';
      }
      if (!configForm.storyBackground) {
        configForm.storyBackground = `在典型的${topic.label}环境下展开，注重情感张力与快节奏转折。`;
      }
      if (!configForm.protagonistDesc) {
        configForm.protagonistDesc = `主角拥有符合${topic.label}设定的特殊身份与技能，在危机中展现出非凡的智慧与勇气。`;
      }
      if (!configForm.storySetting) {
        configForm.storySetting = `主角通过不懈努力，最终实现${topic.label}题材中常见的逆袭。`;
      }
    } else {
      if (!configForm.storySynopsis) {
        configForm.storySynopsis = '这是一个充满未知与挑战的故事，讲述了主角如何在逆境中寻找希望并完成自我救赎。';
      }
      if (!configForm.storyBackground) {
        configForm.storyBackground = '现代都市，繁华表象下隐藏着复杂的权谋与深厚的情感纠葛。';
      }
      if (!configForm.protagonistDesc) {
        configForm.protagonistDesc = '性格坚韧、外冷内热，拥有不为人知的神秘过往，擅长在绝境中寻找生机。';
      }
      if (!configForm.storySetting) {
        configForm.storySetting = '故事注重细节刻画，力求在真实的社会背景下展现人性的光辉与阴暗面。';
      }
    }
    
    isGeneratingInspiration.value = false;
    ElMessage.success('补全灵感内容成功');
  }, 1000);
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
  
  // Instead of direct creation, open the config dialog
  selectedTopic.value = { label: 'AI 灵感创作', isCustom: true };
  configForm.genre = 'AI 灵感创作';
  configForm.title = '';
  configForm.storySynopsis = aiPrompt.value;
  configForm.storyBackground = '';
  configForm.storySetting = '';
  configForm.protagonistDesc = '';
  
  configForm.episodesCount = '80';
  configForm.expectedDuration = 120;
  configForm.protagonistSetting = protagonistOptions.value[0].label;
  configForm.targetAudience = audienceOptions[0];
  configForm.videoStyle = videoStyleOptions[0].label;

  showHotTopicDialog.value = true;
};

const handleFileUpload = (file: any) => {
  if (!file.raw) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    if (!content) return;

    ElMessage({
      message: '正在智能提取剧本关键信息...',
      type: 'info',
      duration: 2000
    });

    // 智能提取逻辑 (模拟 AI 提取)
    const extractedInfo = {
      title: content.match(/(?:剧名|书名|作品名)[:：]\s*(.*)/)?.[1] || file.name.replace(/\.[^/.]+$/, ""),
      genre: content.match(/(?:题材|类型)[:：]\s*(.*)/)?.[1] || '',
      protagonistSetting: content.match(/(?:主角设定|主角身份|主角姓名)[:：]\s*(.*)/)?.[1] || '',
      protagonistDesc: content.match(/(?:主角描述|主角性格|角色简介)[:：]\s*(.*)/)?.[1] || '',
      storySynopsis: content.match(/(?:故事梗概|剧情简介|故事大纲)[:：]\s*(.*)/)?.[1] || '',
      storyBackground: content.match(/(?:故事背景|背景设定|世界观)[:：]\s*(.*)/)?.[1] || '',
      storySetting: content.match(/(?:核心冲突|特殊设定|故事设定)[:：]\s*(.*)/)?.[1] || '',
      targetAudience: content.match(/(?:目标受众|受众|频道)[:：]\s*(.*)/)?.[1] || '女频',
      videoStyle: content.match(/(?:视频风格|视觉风格|画风)[:：]\s*(.*)/)?.[1] || '写实'
    };

    // 设置选中主题，使其与“输入一句话”逻辑保持一致
    selectedTopic.value = { label: '外部剧本导入', isCustom: true };
    
    // 清空表单，确保回显的是新提取的内容
    configForm.title = '';
    configForm.genre = '';
    configForm.customGenre = '';
    configForm.protagonistSetting = '';
    configForm.customProtagonistName = '';
    configForm.protagonistDesc = '';
    configForm.storySynopsis = '';
    configForm.storyBackground = '';
    configForm.storySetting = '';
    
    // 回显到表单
    if (extractedInfo.title) configForm.title = extractedInfo.title;
    
    // 题材处理：如果匹配到预设题材则回显，否则设为自定义
    if (extractedInfo.genre) {
      const matchedTopic = hotTopics.find(t => extractedInfo.genre.includes(t.label));
      if (matchedTopic) {
        configForm.genre = matchedTopic.label;
      } else {
        configForm.genre = '自定义';
        configForm.customGenre = extractedInfo.genre;
      }
    } else {
      configForm.genre = 'AI 灵感创作'; // 默认值
    }

    // 主角设定处理
    if (extractedInfo.protagonistSetting) {
      const matchedProtagonist = protagonistOptions.value.find(p => extractedInfo.protagonistSetting.includes(p.label));
      if (matchedProtagonist) {
        configForm.protagonistSetting = matchedProtagonist.label;
      } else {
        configForm.protagonistSetting = '自定义';
        configForm.customProtagonistName = extractedInfo.protagonistSetting;
      }
    }

    if (extractedInfo.protagonistDesc) configForm.protagonistDesc = extractedInfo.protagonistDesc;
    if (extractedInfo.storySynopsis) configForm.storySynopsis = extractedInfo.storySynopsis;
    if (extractedInfo.storyBackground) configForm.storyBackground = extractedInfo.storyBackground;
    if (extractedInfo.storySetting) configForm.storySetting = extractedInfo.storySetting;
    
    // 受众匹配
    if (extractedInfo.targetAudience) {
      const matchedAudience = audienceOptions.find(a => extractedInfo.targetAudience.includes(a));
      if (matchedAudience) configForm.targetAudience = matchedAudience;
    }

    // 风格匹配
    if (extractedInfo.videoStyle) {
      const matchedStyle = videoStyleOptions.find(s => extractedInfo.videoStyle.includes(s.label));
      if (matchedStyle) configForm.videoStyle = matchedStyle.label;
    }

    // 确保弹窗显示正确步骤
    currentStep.value = 1;

    // 延迟打开弹窗，增加仪式感
    setTimeout(() => {
      showHotTopicDialog.value = true;
      ElMessage.success('剧本信息提取成功，已为您回显至配置页');
    }, 1000);
  };

  reader.readAsText(file.raw);
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

/* Premium Upload Styles V3 */
:deep(.custom-upload-v3 .el-upload-dragger) {
  border-radius: 24px;
  border: 2px dashed #e2e8f0;
  background-color: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100% !important;
  height: 100% !important;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.dark :deep(.custom-upload-v3 .el-upload-dragger) {
  border-color: rgba(255, 255, 255, 0.25);
  background-color: rgba(15, 23, 42, 0.75);
  box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.3);
}
.dark :deep(.custom-upload-v3 .el-upload__text) {
   color: #ffffff;
 }
 .dark :deep(.custom-upload-v3 .el-upload__text em) {
   color: #a5b4fc !important; /* text-indigo-300 */
 }
:deep(.custom-upload-v3 .el-upload-dragger:hover) {
  border-color: #6366f1;
  background-color: rgba(99, 102, 241, 0.1);
  transform: translateY(-2px);
}

:deep(.custom-slider .el-slider__bar) {
  background-color: #6366f1;
}
:deep(.custom-slider .el-slider__button) {
  border-color: #6366f1;
}

/* New V3 UI Styles */
.hot-topic-dialog-v3 :deep(.el-dialog) {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
}

.custom-scrollbar-v2::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar-v2::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar-v2::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.1);
  border-radius: 10px;
  transition: all 0.3s;
}
.custom-scrollbar-v2::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.3);
}
.dark .custom-scrollbar-v2::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.2);
}
.dark .custom-scrollbar-v2::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.4);
}

/* Premium Input Styles V5 */
:deep(.custom-input-v5 .el-input__wrapper) {
  border-radius: 10px;
  background-color: #fff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02) !important;
  padding: 4px 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.dark :deep(.custom-input-v5 .el-input__wrapper) {
  background-color: #0f172a;
  border-color: #334155;
}
:deep(.custom-input-v5 .el-input__wrapper:hover) {
  border-color: #6366f1;
}
:deep(.custom-input-v5 .el-input__wrapper.is-focus) {
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
}

/* Premium Select Styles V4 */
:deep(.custom-select-v4 .el-input__wrapper) {
  border-radius: 10px;
  background-color: #fff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02) !important;
  padding: 4px 10px;
  transition: all 0.3s ease;
}
.dark :deep(.custom-select-v4 .el-input__wrapper) {
  background-color: #0f172a;
  border-color: #334155;
}
:deep(.custom-select-v4 .el-input__wrapper:hover) {
  border-color: #6366f1;
}
:deep(.custom-select-v4 .el-input__wrapper.is-focus) {
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
}

/* Dark Theme Dashboard Inputs */
:deep(.custom-input-dark .el-input__wrapper) {
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: none !important;
  padding: 0 8px;
}
:deep(.custom-input-dark .el-input__inner) {
  color: #fff !important;
  font-weight: 900;
  font-size: 11px;
}
:deep(.custom-input-dark .el-input__wrapper.is-focus) {
  border-color: #6366f1;
  background-color: rgba(255, 255, 255, 0.1);
}

:deep(.custom-number-dark .el-input__wrapper) {
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: none !important;
}
:deep(.custom-number-dark .el-input__inner) {
  color: #fff !important;
  font-weight: 900;
  font-size: 11px;
}
:deep(.custom-number-dark .el-input-number__increase),
:deep(.custom-number-dark .el-input-number__decrease) {
  background-color: transparent;
  border-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

/* Premium Number V5 */
:deep(.custom-number-v5 .el-input__wrapper) {
  border-radius: 10px;
  background-color: #fff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02) !important;
  padding: 0 8px;
  transition: all 0.3s ease;
}
.dark :deep(.custom-number-v5 .el-input__wrapper) {
  background-color: #0f172a;
  border-color: #334155;
}
:deep(.custom-number-v5 .el-input__inner) {
  font-weight: 700;
  font-size: 11px;
}
:deep(.custom-number-v5 .el-input-number__increase),
:deep(.custom-number-v5 .el-input-number__decrease) {
  background-color: #f8fafc;
  border-color: #e2e8f0;
  color: #64748b;
}
.dark :deep(.custom-number-v5 .el-input-number__increase),
.dark :deep(.custom-number-v5 .el-input-number__decrease) {
  background-color: #1e293b;
  border-color: #334155;
  color: #94a3b8;
}
:deep(.custom-number-v5 .el-input-number__increase:hover),
:deep(.custom-number-v5 .el-input-number__decrease:hover) {
  color: #6366f1;
}

/* Premium Textarea V4 */
:deep(.custom-textarea-v4 .el-textarea__inner) {
  border-radius: 10px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  box-shadow: none !important;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.4;
  resize: none;
  transition: all 0.3s ease;
  min-height: unset !important;
}
.dark :deep(.custom-textarea-v4 .el-textarea__inner) {
  background-color: #0f172a;
  border-color: #334155;
  color: #f1f5f9;
}
:deep(.custom-textarea-v4 .el-textarea__inner:focus) {
  border-color: #6366f1;
  background-color: #fff;
  box-shadow: 0 8px 30px rgba(99, 102, 241, 0.05) !important;
}
.dark :deep(.custom-textarea-v4 .el-textarea__inner:focus) {
  background-color: #0f172a;
}

/* Animations */
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.animate-shimmer {
  animation: shimmer 2s infinite;
}

/* Cinematic Background Elements */
.bg-noise-pattern {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.1); }
}

@keyframes pulse-slow-delayed {
  0%, 100% { opacity: 0.2; transform: scale(1.1); }
  50% { opacity: 0.4; transform: scale(1); }
}

.animate-pulse-slow {
  animation: pulse-slow 8s ease-in-out infinite;
}

.animate-pulse-slow-delayed {
  animation: pulse-slow-delayed 10s ease-in-out infinite;
  animation-delay: 2s;
}

@keyframes pulse-indigo {
  0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(79, 70, 229, 0); }
  100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
}
.animate-pulse-indigo {
  animation: pulse-indigo 2s infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
.animate-float {
  animation: float 3s infinite ease-in-out;
}

/* Legacy Styles Cleanup */
:deep(.custom-select-v3 .el-input__wrapper),
:deep(.custom-input-v3 .el-input__wrapper),
:deep(.custom-textarea-v3 .el-textarea__inner),
:deep(.custom-number-v3 .el-input__wrapper),
:deep(.custom-input-v4 .el-input__wrapper),
:deep(.custom-number-v4 .el-input__wrapper) {
  /* Keep these for now if used elsewhere, but v5/v4 are preferred for the dialog */
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
