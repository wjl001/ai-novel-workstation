<template>
  <div class="h-full flex flex-col bg-[#F8FAFC] dark:bg-slate-900 relative overflow-x-hidden overflow-y-auto custom-scrollbar p-6 lg:p-10">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 relative z-10 pl-4 md:pl-0">
      <div class="flex-1 flex items-center gap-4">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <el-icon :size="20"><VideoCamera /></el-icon>
            </div>
            <h1 class="text-3xl lg:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">
              我的作品
            </h1>
            <div class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Library
            </div>
          </div>
          <p class="text-slate-500 dark:text-slate-400 text-base font-medium pl-[52px]">释放 AI 生产力，从这里开启您的爆款短剧创作之旅</p>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <!-- Product Design Info Button -->
        <button 
          @click="showDesignDialog = true"
          class="h-14 px-6 flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-[24px] font-bold text-sm shadow-sm border border-slate-200 dark:border-slate-700 hover:text-indigo-600 hover:border-indigo-300 transition-all duration-300"
        >
          <el-icon :size="18"><InfoFilled /></el-icon>
          <span>产品设计说明</span>
        </button>

        <!-- New Script Button - Redesigned -->
        <button 
          @click="$router.push('/ai-short-drama-creator/new')"
          class="relative group h-14 pl-4 pr-8 flex items-center gap-4 bg-indigo-600 text-white rounded-[24px] font-black text-base shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:-translate-y-1 transition-all duration-500 overflow-hidden"
        >
          <!-- Animated Background Decoration -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-xl -ml-12 -mb-12 group-hover:scale-150 transition-transform duration-700"></div>

          <div class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
            <el-icon :size="20" class="stroke-2"><Plus /></el-icon>
          </div>
          <div class="flex flex-col items-start leading-none">
            <span class="text-[15px]">新建剧本</span>
            <span class="text-[10px] opacity-60 font-medium uppercase tracking-widest mt-1">Start New Project</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Toolbar Section -->
    <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[28px] p-5 shadow-sm border border-white/40 dark:border-slate-700/50 mb-8 flex flex-wrap justify-between items-center gap-6 relative z-10">
      <div class="flex items-center gap-4 flex-1 min-w-[300px]">
        <el-input 
          v-model="searchQuery" 
          placeholder="搜索作品标题/描述" 
          class="custom-search-input-v2 !w-72"
          clearable
        >
          <template #prefix>
            <el-icon class="text-indigo-500"><Search /></el-icon>
          </template>
        </el-input>
        
        <div class="h-8 w-px bg-slate-100 dark:bg-slate-700 mx-1 hidden md:block"></div>
        
        <div class="flex gap-3">
          <el-select v-model="sortBy" placeholder="排序方式" class="custom-select-v2 !w-40">
            <el-option label="最近修改" value="updated_desc" />
            <el-option label="最近创建" value="created_desc" />
            <el-option label="名称排序" value="name_asc" />
          </el-select>
        </div>
      </div>
      
      <div class="flex items-center bg-slate-100/50 dark:bg-slate-900/50 p-1 rounded-2xl border border-slate-100 dark:border-slate-700">
        <button 
          @click="viewMode = 'grid'"
          class="px-4 h-9 rounded-xl flex items-center justify-center gap-2 transition-all text-sm font-bold"
          :class="viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'"
        >
          <el-icon :size="18"><Grid /></el-icon>
          <span>网格</span>
        </button>
        <button 
          @click="viewMode = 'list'"
          class="px-4 h-9 rounded-xl flex items-center justify-center gap-2 transition-all text-sm font-bold"
          :class="viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'"
        >
          <el-icon :size="18"><List /></el-icon>
          <span>列表</span>
        </button>
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-auto custom-scrollbar pr-2 relative z-10">
      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 pb-10">
        <div v-for="work in filteredWorks" :key="work.id" 
          class="bg-white dark:bg-slate-800 rounded-[24px] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 transition-all duration-500 cursor-pointer flex flex-col group relative"
          @click="openWork(work)"
        >
          <!-- Card Header/Poster Area (16:10 Aspect Ratio - Shorter) -->
          <div class="aspect-[16/10] bg-slate-100 dark:bg-slate-900 relative overflow-hidden">
            <!-- Image Content -->
            <img v-if="work.cover" :src="work.cover" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
            <div v-else class="w-full h-full relative group-hover:scale-105 transition-transform duration-1000">
              <!-- Default Background - Colorful & Impactful -->
              <div class="absolute inset-0 bg-gradient-to-br transition-colors duration-500" 
                :class="[
                  work.id % 4 === 0 ? 'from-indigo-600 to-purple-700' : 
                  work.id % 4 === 1 ? 'from-rose-500 to-orange-600' : 
                  work.id % 4 === 2 ? 'from-emerald-500 to-teal-700' : 
                  'from-blue-600 to-indigo-800'
                ]"
              ></div>
              
              <!-- Abstract Shapes for Visual Impact -->
              <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-black/20 rounded-full blur-2xl"></div>
              <div class="absolute inset-0 opacity-10" :style="{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }"></div>
              
              <!-- Centered Content for Placeholder -->
              <div class="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/20 shadow-2xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-all duration-500">
                  <el-icon :size="24"><VideoCamera /></el-icon>
                </div>
                <div class="text-white/90 text-sm font-bold line-clamp-2 leading-tight drop-shadow-md px-4">{{ work.title }}</div>
              </div>
            </div>

            <!-- Glass Overlay (Refined for C-end) -->
            <div class="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[6px] flex flex-row items-center justify-center gap-3">
               <el-upload
                 action="#"
                 :auto-upload="false"
                 :show-file-list="false"
                 :on-change="(file) => handleCoverUpload(file, work)"
                 accept="image/*"
                 @click.stop
               >
                 <button class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white text-indigo-600 text-[12px] font-bold hover:bg-indigo-50 transition-all active:scale-95 shadow-xl whitespace-nowrap">
                   <el-icon><Upload /></el-icon> 上传封面
                 </button>
               </el-upload>
               
               <button 
                 class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-[12px] font-bold hover:bg-indigo-700 hover:scale-105 transition-all active:scale-95 shadow-xl shadow-indigo-500/30 whitespace-nowrap"
                 @click.stop="openAIGenerator(work)"
               >
                 <el-icon><MagicStick /></el-icon> AI 生成
               </button>
            </div>

            <!-- Status Badge (Top Left) -->
            <div class="absolute top-4 left-4 z-30">
              <span 
                class="px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase backdrop-blur-md border shadow-sm"
                :class="{
                  'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-500/30': work.status === 'in_progress',
                  'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30': work.status === 'completed',
                  'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30': work.status === 'draft'
                }"
              >
                {{ getStatusLabel(work.status) }}
              </span>
            </div>

            <!-- More Actions (Top Right) -->
            <div class="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
              <el-dropdown trigger="click" @command="(cmd) => handleCommand(cmd, work)">
                <button 
                  class="w-10 h-10 rounded-xl bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 backdrop-blur-md border border-slate-200 dark:border-white/20 shadow-lg flex items-center justify-center text-slate-600 dark:text-white transition-all"
                  @click.stop
                >
                  <el-icon><MoreFilled /></el-icon>
                </button>
                <template #dropdown>
                  <el-dropdown-menu class="!rounded-2xl !p-2 shadow-2xl border-none">
                    <el-dropdown-item command="edit" class="!rounded-xl !py-2.5 !px-4">
                      <el-icon class="mr-2"><Edit /></el-icon>编辑作品
                    </el-dropdown-item>
                    <el-dropdown-item command="delete" class="!rounded-xl !py-2.5 !px-4 !text-red-500">
                      <el-icon class="mr-2"><Delete /></el-icon>删除作品
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>

            <!-- Bottom Title Mask (Visible on Hover) -->
            <div class="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-white/90 dark:from-black/90 via-white/40 dark:via-black/40 to-transparent pt-20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-10">
               <div class="text-slate-500 dark:text-white text-xs font-medium opacity-60 mb-1">最后更新于</div>
               <div class="text-slate-700 dark:text-white text-xs font-bold">{{ work.updatedAt }}</div>
            </div>
          </div>
          
          <!-- Card Content -->
          <div class="p-4 flex flex-col flex-1">
            <h3 class="font-bold text-[15px] text-slate-800 dark:text-slate-100 mb-1.5 line-clamp-1 group-hover:text-indigo-600 transition-colors duration-300" :title="work.title">
              {{ work.title }}
            </h3>
            <p class="text-[12px] text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed flex-1 mb-3">
              {{ work.description || '暂无作品简介内容，快去开始创作吧' }}
            </p>
            
            <div class="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-700/50 mt-auto">
              <div class="flex items-center gap-2.5 text-[10px] font-bold text-slate-400">
                <span class="flex items-center gap-1"><el-icon><View /></el-icon> 2.4k</span>
                <span class="flex items-center gap-1"><el-icon><Star /></el-icon> 856</span>
              </div>
              
              <div class="flex items-center gap-1 text-indigo-600 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                <span class="text-[11px] font-bold">立即编辑</span>
                <el-icon :size="12"><ArrowRight /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden relative z-10">
        <el-table :data="filteredWorks" style="width: 100%" @row-click="openWork" class="custom-table-v2">
          <el-table-column prop="title" label="作品名称" min-width="240">
            <template #default="{ row }">
              <div class="flex items-center gap-4 py-2">
                <div class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center shadow-sm">
                  <el-icon :size="20"><VideoCamera /></el-icon>
                </div>
                <div>
                  <div class="font-black text-slate-800 dark:text-slate-200 text-[15px]">{{ row.title }}</div>
                  <div class="text-[12px] text-slate-400 mt-0.5 line-clamp-1 max-w-[300px] font-medium">{{ row.description || '暂无简介' }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="140">
            <template #default="{ row }">
              <span 
                class="px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase border"
                :class="{
                  'bg-indigo-50 text-indigo-600 border-indigo-100': row.status === 'in_progress',
                  'bg-emerald-50 text-emerald-600 border-emerald-100': row.status === 'completed',
                  'bg-slate-50 text-slate-500 border-slate-200': row.status === 'draft'
                }"
              >
                {{ getStatusLabel(row.status) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="updatedAt" label="最后修改" width="180">
             <template #default="{ row }">
               <span class="text-[13px] font-medium text-slate-500">{{ row.updatedAt }}</span>
             </template>
          </el-table-column>
          <el-table-column label="操作" width="160" align="right">
            <template #default="{ row }">
              <div class="flex items-center justify-end gap-3 px-4">
                <button 
                  @click.stop="openWork(row)"
                  class="w-10 h-10 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                  title="编辑"
                >
                  <el-icon><Edit /></el-icon>
                </button>
                <button 
                  @click.stop="deleteWork(row)"
                  class="w-10 h-10 flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  title="删除"
                >
                  <el-icon><Delete /></el-icon>
                </button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Empty State -->
      <div v-if="filteredWorks.length === 0" class="flex flex-col items-center justify-center py-32 text-slate-400 relative z-10">
        <div class="relative mb-10">
          <div class="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full scale-150"></div>
          <div class="w-40 h-40 bg-white dark:bg-slate-800 rounded-[40px] shadow-2xl flex items-center justify-center relative">
            <el-icon :size="80" class="text-indigo-200 dark:text-indigo-900/50"><VideoCamera /></el-icon>
          </div>
        </div>
        <h3 class="text-2xl font-black text-slate-800 dark:text-slate-100 mb-3">暂无短剧作品</h3>
        <p class="text-base font-medium text-slate-400 mb-10 max-w-xs text-center leading-relaxed">还没开始创作吗？快去开启您的第一场 AI 剧本创作之旅吧</p>
        <button 
          @click="$router.push('/ai-short-drama-creator/new')"
          class="h-14 px-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl text-lg font-bold shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-3"
        >
          <el-icon><Plus /></el-icon>
          立即开始创作
        </button>
      </div>
    </div>

    <!-- Pagination Section -->
    <div class="flex justify-center mt-10 relative z-10" v-if="filteredWorks.length > 0">
      <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 36, 48]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredWorks.length"
          class="custom-pagination-v2"
        />
      </div>
    </div>

    <!-- Product Design Dialog -->
    <ProductDesignDialog
      v-model="showDesignDialog"
      id="short-drama-works"
      :default-content="{
        title: '作品库管理',
        location: '创作者的个人主页，用于集中管理所有历史短剧项目，并提供项目状态监控与全局操作。',
        layout: [
          '**顶部工具栏：** 集成全局搜索（标题搜索）、状态过滤（草稿/进行中/完成）及网格/列表视图切换。',
          '**网格视图 (Grid)：** 以 16:10 的卡片展示项目，包含封面、状态标签、简介及最后更新时间。',
          '**列表视图 (List)：** 适合快速浏览大量项目，展示作品名称、状态、最后修改时间及操作按钮。',
          '**AI 封面生成器：** 独立弹窗交互。支持输入 Prompt 描述词，为作品生成具有视觉冲击力的专属海报。'
        ],
        interactions: [
          '**打开作品 (触发动作)：** 点击项目卡片或列表行。**动作：** 执行 `router.push`。**流程：** 系统加载该项目的所有章节数据，并平滑跳转至剧集规划页（EpisodesView）。',
          '**AI 封面生成 (触发动作)：** 悬停卡片点击“AI 生成”。**动作：** 弹出生成工坊。**流程：** 用户输入 Prompt -> 后端调用绘图模型渲染预览图 -> 用户选中并应用。',
          '**作品删除 (触发动作)：** 点击操作菜单中的“删除”。**动作：** 弹出二次确认框（ConfirmDialog）。**异常：** 删除操作不可逆，点击确认后该作品的所有剧本、分镜及视频数据将永久从服务器移除。',
          '**功能说明 (2.2版本)：** \n - **剧集管理：** 2.2版本支持手动新增剧集，赋能更灵活的创作需求。 \n - **AI 助手：** 全面开启 AI 智能助手，支持剧本正文引用与实时对话。',
          '**异常逻辑：** \n - **搜索缺省：** 若搜索无匹配结果，展示“暂无作品”占位图，并引导用户点击“立即开始创作”。\n - **封面加载失败：** 若项目封面链接失效，卡片将自动切换为基于作品 ID 生成的唯一渐变色占位背景。',
          '**流程环节：** 本页面是创作流的 **管理中枢**。它是用户进入具体创作工作流之前的预览、筛选与历史任务恢复环节。'
        ],
        version: '2.2'
      }"
    />

    <GlobalUIDesignSpecsDialog
      v-model="showUIDesignSpecsDialog"
      title="UI 设计标注 - 作品管理"
      subtitle="DramaWorks UI Design Specifications"
      :groups="uiDesignGroups as any"
    />

    <button
      @click="showUIDesignSpecsDialog = true"
      class="fixed bottom-6 right-6 z-[1500] w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 shadow-lg shadow-indigo-500/30 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      title="查看UI设计标注"
    >
      <el-icon :size="22"><Monitor /></el-icon>
    </button>

    <!-- AI Generator Dialog -->
    <el-dialog v-model="showAIDialog" title="AI 封面生成工坊" width="700px" append-to-body class="ai-generator-dialog">
      <div class="space-y-6">
        <!-- Prompt Input -->
        <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-5 transition-colors focus-within:border-indigo-500/50 shadow-inner">
           <div class="text-sm mb-3 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
             <el-icon class="text-indigo-500"><Edit /></el-icon>
             生成描述词 (Prompt)
           </div>
           <el-input 
             v-model="aiPrompt"
             type="textarea" 
             :rows="4"
             placeholder="例如：古风武侠，边境战火，义军首领手持重锤，背景是燃烧的村庄..."
             class="custom-textarea"
           />
           <div class="flex justify-end mt-4">
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
           </div>

           <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 min-h-[200px] relative rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 p-4 transition-colors">
              <!-- Default Gallery (Always shown initially or when not generating) -->
              <template v-if="generatedImages.length === 0 && !isGenerating">
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
              <template v-else-if="generatedImages.length > 0">
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
                <div class="loading-spinner mb-4"></div>
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

    <!-- Delete Confirm Dialog -->
    <ConfirmDialog
      v-model="deleteConfirmVisible"
      :title="deleteConfirmTitle"
      :message="deleteConfirmMessage"
      confirm-text="确认删除"
      cancel-text="取消"
      @confirm="handleConfirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import ConfirmDialog from '@/components/Common/ConfirmDialog.vue';
import { useRouter } from 'vue-router';
import { Plus, Search, Grid, List, MoreFilled, VideoCamera, Clock, Edit, Delete, ArrowRight, ArrowLeft, InfoFilled, Close, Document, Location, Monitor, Pointer, Upload, MagicStick, View, Star, Check } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { UploadFile } from 'element-plus';
import ProductDesignDialog from '@/components/Common/ProductDesignDialog.vue';
import GlobalUIDesignSpecsDialog from '@/components/Common/GlobalUIDesignSpecsDialog.vue';

const router = useRouter();
const showDesignDialog = ref(false);
const showUIDesignSpecsDialog = ref(false);
const showAIDialog = ref(false);
const aiPrompt = ref('');
const isGenerating = ref(false);
const generatedImages = ref<string[]>([]);
const selectedImage = ref('');
const currentWorkForAI = ref<any>(null);

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

const searchQuery = ref('');
const statusFilter = ref('');
const sortBy = ref('updated_desc');
const viewMode = ref('grid');

// Delete Confirm Dialog State
const deleteConfirmVisible = ref(false);
const deleteConfirmTitle = ref('');
const deleteConfirmMessage = ref('');
const workToDelete = ref<any>(null);

const handleConfirmDelete = () => {
  if (workToDelete.value) {
    works.value = works.value.filter(w => w.id !== workToDelete.value.id);
    ElMessage.success('删除成功');
  }
};
const currentPage = ref(1);
const pageSize = ref(12);

const uiDesignGroups = {
  layout: [
    {
      id: 'drama-works',
      title: '作品管理页 (DramaWorks)',
      description: '作品库管理：顶部标题区 + 工具条（搜索/排序/视图切换）+ 网格/列表展示 + 分页 + 多种弹窗。',
      items: [
        { name: '页面容器', value: 'h-full flex flex-col p-6 lg:p-10', description: '整体可滚动：overflow-y-auto custom-scrollbar' },
        { name: '页面背景', value: 'bg-[#F8FAFC] dark:bg-slate-900', description: '浅色主背景 + 深色模式' },
        { name: '标题区间距', value: 'mb-10 gap-6', description: 'Header Section 与内容区间距' },
        { name: '工具条容器', value: 'rounded-[28px] p-5', description: 'bg-white/80 + backdrop-blur-xl + border' },
        { name: '搜索框宽度', value: '!w-72', description: 'el-input 搜索作品标题/描述' },
        { name: '排序选择宽度', value: '!w-40', description: 'el-select 最近修改/创建/名称' },
        { name: '视图切换容器', value: 'p-1 rounded-2xl', description: 'grid/list 切换按钮组' },
        { name: '内容滚动区', value: 'flex-1 overflow-auto pr-2', description: '卡片或表格承载区' },
        { name: '网格列数', value: '2/3/4/5/6', description: 'grid-cols-2 ... 2xl:grid-cols-6 gap-6' },
        { name: '作品卡圆角', value: 'rounded-[24px]', description: '卡片容器与海报区域统一圆角体系' },
        { name: '封面比例', value: 'aspect-[16/10]', description: '作品海报区域' },
        { name: '列表容器圆角', value: 'rounded-[32px]', description: '表格外壳（玻璃感容器）' },
        { name: '分页容器', value: 'rounded-2xl p-2', description: '居中浮层：bg-white/80 + backdrop-blur-md' },
        { name: 'AI 生成弹窗宽度', value: 'width="700px"', description: 'AI 封面生成工坊弹层' }
      ]
    }
  ],
  style: [
    {
      id: 'drama-works-typography',
      title: '字体与层级',
      description: '标题、工具条、卡片与表格的字号/字重规范。',
      items: [
        { name: '页面标题', style: { fontSize: '30-36px', fontWeight: '900' }, description: 'text-3xl lg:text-4xl font-black（渐变文字）' },
        { name: '副标题', style: { fontSize: '16px', fontWeight: '500' }, description: 'text-base font-medium（pl-[52px]）' },
        { name: '工具条按钮', style: { fontSize: '14px', fontWeight: '700' }, description: '网格/列表：text-sm font-bold' },
        { name: '卡片标题', style: { fontSize: '15px', fontWeight: '700' }, description: 'text-[15px] font-bold line-clamp-1' },
        { name: '卡片描述', style: { fontSize: '12px', fontWeight: '400', lineHeight: '1.5' }, description: 'text-[12px] leading-relaxed line-clamp-2' },
        { name: '状态徽标', style: { fontSize: '10px', fontWeight: '900', letterSpacing: '0.08em' }, description: 'text-[10px] font-black tracking-wider uppercase' },
        { name: '列表行标题', style: { fontSize: '15px', fontWeight: '900' }, description: 'font-black text-[15px]' },
        { name: '空态标题', style: { fontSize: '24px', fontWeight: '900' }, description: 'text-2xl font-black' }
      ]
    }
  ],
  color: [
    {
      id: 'drama-works-color',
      title: '颜色规范',
      description: '背景、主色、容器与状态色。',
      items: [
        { name: '页面背景', value: '#F8FAFC' },
        { name: '主色', value: 'indigo-600（#4F46E5 近似）' },
        { name: '工具条容器', value: 'bg-white/80 dark:bg-slate-800/80 + backdrop-blur-xl' },
        { name: '描边/分割线', value: 'border-slate-100/200 dark:border-slate-700/50' },
        { name: '卡片 Hover 阴影', value: 'hover:shadow-2xl hover:shadow-indigo-500/10' },
        { name: '封面 Hover 蒙层', value: 'bg-black/40 + backdrop-blur-[6px]' },
        { name: '状态-进行中', value: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
        { name: '状态-已完成', value: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
        { name: '状态-草稿', value: 'bg-slate-50 text-slate-500 border-slate-200' },
        { name: '删除态', value: 'text-red-500 hover:bg-red-500 hover:text-white' }
      ]
    }
  ],
  button: [
    {
      id: 'drama-works-components',
      title: '按钮与组件元素',
      description: '关键交互点位与典型类名（含 hover/active/禁用态）。',
      items: [
        { name: '产品设计说明', tag: 'button', classes: 'h-14 px-6 bg-white dark:bg-slate-800 rounded-[24px] border border-slate-200 hover:text-indigo-600 hover:border-indigo-300', notes: ['顶部右侧入口（InfoFilled）'] },
        { name: '新建剧本', tag: 'button', classes: 'h-14 bg-indigo-600 text-white rounded-[24px] font-black shadow-2xl shadow-indigo-500/40 hover:-translate-y-1', notes: ['顶部右侧主 CTA（Plus）'] },
        { name: '视图切换-激活', tag: 'button', classes: 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm rounded-xl', notes: ['网格/列表切换 active 态'] },
        { name: '作品卡容器', tag: 'div', classes: 'bg-white dark:bg-slate-800 rounded-[24px] border border-slate-100 hover:-translate-y-1.5 hover:shadow-2xl', notes: ['点击进入作品'] },
        { name: '卡片封面操作层', tag: 'div', classes: 'opacity-0 group-hover:opacity-100 bg-black/40 backdrop-blur-[6px] rounded-[24px] flex items-center justify-center gap-3', notes: ['Hover 显示：上传封面/AI 生成'] },
        { name: '上传封面', tag: 'button', classes: 'px-3 py-2 bg-white text-indigo-600 rounded-xl text-[12px] font-bold hover:bg-indigo-50 shadow-xl', notes: ['位于卡片封面 hover 层'] },
        { name: 'AI 生成封面', tag: 'button', classes: 'px-3 py-2 bg-indigo-600 text-white rounded-xl text-[12px] font-bold hover:bg-indigo-700 hover:scale-105 shadow-xl shadow-indigo-500/30', notes: ['位于卡片封面 hover 层'] },
        { name: '更多操作菜单', tag: 'button', classes: 'w-10 h-10 rounded-xl bg-white/80 backdrop-blur-md border border-slate-200 shadow-lg', notes: ['卡片右上角 MoreFilled，下拉编辑/删除'] },
        { name: '列表-编辑', tag: 'button', classes: 'w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white shadow-sm', notes: ['el-table 行操作'] },
        { name: '列表-删除', tag: 'button', classes: 'w-10 h-10 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white shadow-sm', notes: ['el-table 行操作'] },
        { name: '空态主按钮', tag: 'button', classes: 'h-14 px-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-2xl hover:-translate-y-1 active:scale-95', notes: ['无作品时引导创建'] },
        { name: 'AI 工坊-开始生成', tag: 'el-button', classes: 'type=primary !rounded-xl px-6 h-11 shadow-lg shadow-indigo-500/20', notes: ['位于 AI 封面生成弹窗内'] },
        { name: 'AI 工坊-应用封面', tag: 'el-button', classes: 'type=primary !rounded-xl px-8 h-11 shadow-lg shadow-indigo-500/20', notes: ['选中图片后可用'] },
        { name: '删除确认弹窗', tag: 'ConfirmDialog', classes: 'v-model=deleteConfirmVisible', notes: ['确认删除作品（不可逆）'] },
        { name: 'UI 标注入口', tag: 'button', classes: 'fixed bottom-6 right-6 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 shadow-lg shadow-indigo-500/30 text-white hover:scale-105 active:scale-95 transition-transform', notes: ['页面右下角悬浮（Monitor 图标）；打开 UI 设计标注弹窗（含分类 Tabs）'] }
      ]
    }
  ]
};

// Mock Data
const works = ref([
  { id: 1, title: '《星际迷航：觉醒》', description: '讲述人类首次踏出太阳系，与外星文明发生接触并引发一系列危机的科幻史诗。', status: 'in_progress', createdAt: '2023-10-08 08:00', updatedAt: '2023-10-12 09:30', cover: '' },
  { id: 2, title: '《末日拾荒者》', description: '废土世界中，主角依靠一个神秘的系统，在废墟中寻找生存资源并建立避难所。', status: 'draft', createdAt: '2023-10-10 11:15', updatedAt: '2023-10-10 11:15', cover: '' },
  { id: 3, title: '《重生之我在古代当首富》', description: '一个现代社畜意外穿越回古代，利用现代商业知识打造商业帝国的爆笑爽文故事。', status: 'in_progress', createdAt: '2023-10-01 10:00', updatedAt: '2023-10-05 14:30', cover: '' },
  { id: 4, title: '《冷面总裁的千金娇妻》', description: '豪门联姻背后的真情流露，从互相防备到相知相爱的都市情感短剧。', status: 'completed', createdAt: '2023-09-15 09:20', updatedAt: '2023-09-28 16:45', cover: '' },
]);

const filteredWorks = computed(() => {
  let result = works.value;
  
  if (searchQuery.value) {
    result = result.filter(w => w.title.includes(searchQuery.value));
  }
  
  if (statusFilter.value) {
    result = result.filter(w => w.status === statusFilter.value);
  }
  
  result.sort((a, b) => {
    if (sortBy.value === 'updated_desc') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    if (sortBy.value === 'created_desc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy.value === 'name_asc') return a.title.localeCompare(b.title);
    return 0;
  });
  
  return result;
});

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = { draft: '草稿', in_progress: '创作中', completed: '已完成' };
  return map[status] || '未知';
};

const openWork = (work: any) => {
  router.push('/ai-short-drama-creator/episodes');
};

const handleCommand = (command: string, work: any) => {
  if (command === 'edit') {
    openWork(work);
  } else if (command === 'delete') {
    deleteWork(work);
  }
};

const deleteWork = (work: any) => {
  workToDelete.value = work;
  deleteConfirmTitle.value = '删除作品';
  deleteConfirmMessage.value = `确定要删除作品《${work.title}》吗？此操作不可恢复。`;
  deleteConfirmVisible.value = true;
};

// Cover Handlers
const handleCoverUpload = (uploadFile: UploadFile, work: any) => {
  if (uploadFile.raw) {
    const reader = new FileReader();
    reader.onload = (e) => {
      work.cover = e.target?.result as string;
      ElMessage.success('封面上传成功');
    };
    reader.readAsDataURL(uploadFile.raw);
  }
};

const openAIGenerator = (work: any) => {
  currentWorkForAI.value = work;
  aiPrompt.value = `${work.title}，短剧海报风格，高清，唯美`;
  generatedImages.value = [];
  selectedImage.value = '';
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
  if (currentWorkForAI.value && selectedImage.value) {
    currentWorkForAI.value.cover = selectedImage.value;
    showAIDialog.value = false;
    ElMessage.success('封面应用成功');
  }
};
</script>

<style scoped>
/* Scrollbar */
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

/* Input & Select Customization */
:deep(.custom-search-input-v2 .el-input__wrapper) {
  border-radius: 16px;
  background-color: transparent !important;
  box-shadow: 0 0 0 1px #f1f5f9 inset !important;
  padding-left: 12px;
  height: 44px;
}
.dark :deep(.custom-search-input-v2 .el-input__wrapper) {
  box-shadow: 0 0 0 1px #334155 inset !important;
}
:deep(.custom-search-input-v2 .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #6366f1 inset !important;
}

:deep(.custom-select-v2 .el-input__wrapper) {
  border-radius: 16px;
  background-color: transparent !important;
  box-shadow: 0 0 0 1px #f1f5f9 inset !important;
  height: 44px;
}
.dark :deep(.custom-select-v2 .el-input__wrapper) {
  box-shadow: 0 0 0 1px #334155 inset !important;
}

/* Table Customization */
.custom-table-v2 {
  --el-table-border-color: transparent;
  --el-table-header-bg-color: #F8FAFC;
  background-color: transparent !important;
}
.dark .custom-table-v2 {
  --el-table-header-bg-color: #0f172a;
}
:deep(.custom-table-v2 th.el-table__cell) {
  background-color: var(--el-table-header-bg-color) !important;
  color: #94a3b8;
  font-weight: 800;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 20px 0;
}
:deep(.custom-table-v2 td.el-table__cell) {
  border-bottom: 1px solid #f8fafc;
  padding: 12px 0;
}
.dark :deep(.custom-table-v2 td.el-table__cell) {
  border-bottom: 1px solid #1e293b;
}
:deep(.custom-table-v2 .el-table__row:hover td) {
  background-color: #f1f5f9/50 !important;
}
.dark :deep(.custom-table-v2 .el-table__row:hover td) {
  background-color: #1e293b/50 !important;
}

/* Pagination Customization */
.custom-pagination-v2 :deep(.el-pagination__total),
.custom-pagination-v2 :deep(.el-pagination__jump) {
  color: #94a3b8;
  font-weight: 600;
  font-size: 13px;
}
.custom-pagination-v2 {
  --el-font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', 'Source Han Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-family: var(--el-font-family);
}
.custom-pagination-v2 :deep(*) {
  font-family: var(--el-font-family);
}
.custom-pagination-v2 :deep(.el-pager li) {
  background: transparent !important;
  color: #64748b;
  font-weight: 700;
  border-radius: 10px;
  margin: 0 2px;
}
.custom-pagination-v2 :deep(.el-pager li.is-active) {
  background: #6366f1 !important;
  color: white !important;
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

.loading-spinner {
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
</style>
