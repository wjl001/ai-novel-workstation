<template>
  <div class="app-container flex flex-col h-screen overflow-hidden bg-slate-50 text-slate-800 font-sans">
    <!-- Topbar -->
    <header class="topbar flex items-center justify-between px-6 py-3 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 shadow-sm z-20">
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
          <span class="text-xs font-mono font-medium">Run ID</span>
          <span class="text-sm font-bold">{{ RUN_ID }}</span>
        </div>
        <div class="flex items-center gap-2 px-3 py-1.5 bg-white text-slate-600 rounded-full border border-slate-200 shadow-sm">
          <span class="text-xs font-medium">当前阶段</span>
          <span class="text-sm font-bold text-slate-800">{{ SCRIPT.user.style ? SCRIPT.user.style + '剧本' : '剧本' }}</span>
        </div>
        <div class="flex items-center gap-2 px-3 py-1.5 bg-white text-slate-600 rounded-full border border-slate-200 shadow-sm">
          <span class="text-xs font-medium">目标</span>
          <span class="text-sm font-bold text-slate-800">{{ SCRIPT.user.duration }} · {{ SCRIPT.user.ratio }}</span>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
          <span class="text-sm">🛡️</span>
          <span class="text-xs font-bold">输入护栏 PASS</span>
          <span class="text-slate-300 mx-1">|</span>
          <span class="text-xs font-medium">成片闸门</span>
          <span class="text-xs font-bold text-amber-500">待审</span>
        </div>
        <el-button type="info" plain round size="small" @click="router.push('/')">返回首页</el-button>
      </div>
    </header>

    <main class="flex-1 flex overflow-hidden relative z-10">
      <!-- Left Sidebar -->
      <aside :class="['flex flex-col bg-white/80 backdrop-blur-2xl border-r border-slate-200/50 shadow-[8px_0_30px_rgba(0,0,0,0.03)] z-10 transition-all duration-300',
                     isLeftSidebarCollapsed ? 'w-12' : 'w-72']">
        <div v-if="!isLeftSidebarCollapsed" class="px-6 py-5 border-b border-slate-200/50 bg-gradient-to-b from-slate-50/50 to-transparent">
          <h2 class="text-base font-black tracking-wide text-slate-800 flex items-center gap-2">
            <span class="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">📦</span> 
            资产管理
          </h2>
        </div>
        <div v-if="!isLeftSidebarCollapsed" class="flex-1 overflow-y-auto p-5 custom-scrollbar">
          
          <div class="mb-6">
            <div class="flex gap-2 mb-4 overflow-x-auto pb-1 custom-scrollbar hide-scrollbar-if-possible">
              <button v-for="tab in ['全部','人物','场景','道具']" :key="tab"
                      @click="assetFilter = tab"
                      :class="['px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap', 
                               assetFilter === tab ? 'bg-slate-800 text-white shadow-md shadow-slate-800/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200']">
                {{ tab }}
              </button>
            </div>

            <div v-if="filteredAssets.length" class="grid grid-cols-2 gap-3">
              <div v-for="asset in filteredAssets" :key="asset.id" 
                   @click="scrollToAsset(asset.id)"
                   class="relative aspect-[4/5] rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-200/60 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-indigo-500/15 hover:border-indigo-300 group">
                <div class="absolute inset-0 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-500">
                  {{ asset.emoji }}
                </div>
                <div class="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-md text-slate-700 rounded-lg text-[10px] font-bold shadow-sm">
                  {{ asset.type }}
                </div>
                <div class="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/60 via-black/30 to-transparent backdrop-blur-[2px]">
                  <div class="text-white font-bold text-sm truncate drop-shadow-md">{{ asset.name }}</div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">无相关资产</div>
          </div>
          
          <div>
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">本次剧本</h3>
            <div class="grid grid-cols-2 gap-3">
              <div v-for="shot in SHOTS" :key="shot.id"
                   @click="scrollToShot(shot.id)"
                   :class="['relative aspect-video rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group overflow-hidden border', shot.vidStale ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 hover:shadow-amber-500/20 hover:border-amber-400' : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100 hover:shadow-emerald-500/20 hover:border-emerald-300']">
                <span :class="['absolute top-1.5 left-1.5 text-[9px] px-1.5 py-0.5 rounded-md font-bold backdrop-blur-sm', shot.vidStale ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700']">{{ shot.id }}</span>
                <span class="text-2xl mt-2 group-hover:scale-110 transition-transform">{{ shot.vid }}</span>
                <span class="absolute bottom-1.5 inset-x-1.5 text-[9px] text-center bg-white/80 backdrop-blur-sm text-slate-700 font-bold py-0.5 rounded shadow-sm truncate px-1">{{ shot.cam }} · {{ shot.dur }}</span>
              </div>
            </div>
          </div>
        </div>
        <button @click="toggleLeftSidebar" class="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-md hover:bg-slate-50 text-slate-500 hover:text-indigo-600 transition-all duration-300 z-50">
          <el-icon><component :is="isLeftSidebarCollapsed ? 'ArrowRight' : 'ArrowLeft'" /></el-icon>
        </button>
      </aside>

      <!-- Center Canvas -->
      <section class="flex-1 flex flex-col relative bg-[#F8F9FB] overflow-hidden">
        <div class="flex items-center justify-between px-6 py-3 bg-white/40 backdrop-blur-md border-b border-slate-200/50 z-10 relative">
          <div class="text-sm font-medium text-slate-500">工作流可视化</div>
          <div class="flex gap-3">
            <button @click="runDemo" class="px-5 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-sm font-bold rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all active:translate-y-0">▶ 演示流程</button>
            <button @click="resetAll" class="px-5 py-2 bg-white text-slate-600 text-sm font-bold rounded-full shadow-sm border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all active:translate-y-0.5">重置</button>
          </div>
        </div>

        <div class="flex-1 relative z-0">
          <VueFlow :nodes="flowNodes" :edges="flowEdges" :default-viewport="{ zoom: 0.8 }" fit-view-on-init nodes-draggable="true">
            <Background pattern-color="#000" :gap="24" :size="1" :opacity="0.03" />
            <Controls />

            <!-- Stage 1: Script Node -->
            <template #node-script="props">
              <div :class="['stage-card flex flex-col bg-white rounded-2xl shadow-xl shadow-slate-200/50 border transition-all duration-500 min-w-[300px] min-h-[200px]', activeStage === 'script' ? 'border-indigo-400 ring-4 ring-indigo-500/10' : 'border-slate-200 opacity-90 hover:opacity-100 hover:border-indigo-200']" @click="setActiveStage('script')" style="width: 420px; resize: both; overflow: hidden;" id="card-script">
                <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl shrink-0">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <h3 class="font-black text-slate-800 tracking-wide text-base">阶段 1: 剧本</h3>
                  </div>
                  <div class="flex items-center gap-3">
                    <span v-if="STALE.script" class="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-md shadow-sm">⚠ 待刷新</span>
                    <button @click.stop="openScriptEdit" class="text-indigo-500 hover:text-indigo-600 p-1.5 hover:bg-indigo-50 rounded-lg transition-colors"><el-icon><Edit /></el-icon></button>
                  </div>
                </div>
                <div class="p-6 flex-1 overflow-y-auto custom-scrollbar text-sm text-slate-600 nodrag">
                  <div v-if="STALE.script" class="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs flex justify-between items-center">
                    <span>此阶段因上游修改需重新生成</span>
                    <button @click.stop="refreshStage('script')" class="px-3 py-1 bg-amber-500 text-white rounded-lg font-bold shadow-sm hover:bg-amber-600">重新生成</button>
                  </div>
                  
                  <h4 class="font-bold text-slate-800 mb-2 text-base">创意设计</h4>
                  <p class="mb-5 bg-slate-50 p-3 rounded-xl border border-slate-100">{{ SCRIPT.concept }}</p>
                  
                  <h4 class="font-bold text-slate-800 mb-2 text-base">用户设定</h4>
                  <div class="grid grid-cols-2 gap-2 mb-5">
                    <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100"><span class="text-slate-400 text-xs block mb-1">风格</span><span class="font-medium">{{ SCRIPT.user.style }}</span></div>
                    <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100"><span class="text-slate-400 text-xs block mb-1">时长</span><span class="font-medium">{{ SCRIPT.user.duration }}</span></div>
                    <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100"><span class="text-slate-400 text-xs block mb-1">比例</span><span class="font-medium">{{ SCRIPT.user.ratio }}</span></div>
                    <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100"><span class="text-slate-400 text-xs block mb-1">旁白</span><span class="font-medium">{{ SCRIPT.user.voice }}</span></div>
                    <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100"><span class="text-slate-400 text-xs block mb-1">平台</span><span class="font-medium">{{ SCRIPT.user.platform }}</span></div>
                    <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100"><span class="text-slate-400 text-xs block mb-1">受众</span><span class="font-medium">{{ SCRIPT.user.audience }}</span></div>
                  </div>

                  <h4 class="font-bold text-slate-800 mb-2 text-base">具体剧本</h4>
                  <div class="space-y-3">
                    <div v-for="(sec, idx) in SCRIPT.sections" :key="idx" class="bg-slate-50 p-3 rounded-xl border border-slate-100 relative group">
                      <div class="flex items-center justify-between mb-1">
                        <span class="font-bold text-indigo-600 text-xs">{{ sec.t }}</span>
                        <span class="text-slate-400 text-xs font-mono">{{ sec.d }}</span>
                      </div>
                      <p class="text-slate-700 leading-relaxed">{{ sec.text }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- Stage 2: Asset Node -->
            <template #node-asset="props">
              <div :class="['stage-card flex flex-col bg-white rounded-2xl shadow-xl shadow-slate-200/50 border transition-all duration-500 min-w-[300px] min-h-[200px]', activeStage === 'asset' ? 'border-blue-400 ring-4 ring-blue-500/10' : 'border-slate-200 opacity-90 hover:opacity-100 hover:border-blue-200']" @click="setActiveStage('asset')" style="width: 480px; resize: both; overflow: hidden;" id="card-asset">
                <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl shrink-0">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                    <h3 class="font-black text-slate-800 tracking-wide text-base">阶段 2: 资产</h3>
                  </div>
                  <div class="flex items-center gap-3">
                    <span v-if="STALE.asset" class="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-md shadow-sm">⚠ 待刷新</span>
                  </div>
                </div>
                <div class="p-6 flex-1 overflow-y-auto custom-scrollbar nodrag">
                  <div v-if="STALE.asset" class="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs flex justify-between items-center">
                    <span>此阶段因上游修改需重新生成</span>
                    <button @click.stop="refreshStage('asset')" class="px-3 py-1 bg-amber-500 text-white rounded-lg font-bold shadow-sm hover:bg-amber-600">重新生成</button>
                  </div>

                  <div class="flex gap-2 mb-5">
                    <button v-for="tab in ['全部','人物','场景','道具']" :key="tab"
                            @click.stop="assetFilter = tab"
                            :class="['px-4 py-1.5 rounded-full text-xs font-bold transition-all', assetFilter === tab ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30' : 'bg-slate-100 text-slate-500 hover:bg-slate-200']">
                      {{ tab }}
                    </button>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div v-for="asset in filteredAssets" :key="asset.id" class="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all">
                      <div class="aspect-[16/10] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-4xl relative" :id="'thumb-'+asset.id">
                        <span class="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-md font-medium backdrop-blur-sm">{{ asset.type }}</span>
                        <span>{{ asset.emoji }}</span>
                        <button @click.stop="downloadAsset(asset)" class="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-md shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-blue-50 hover:text-blue-600 transition-all"><el-icon><Download /></el-icon></button>
                      </div>
                      <div class="p-3">
                        <div class="font-bold text-slate-800 text-sm mb-1 truncate">{{ asset.name }}</div>
                        <div class="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3 h-8">{{ asset.desc }}</div>
                        <div class="flex gap-2">
                          <button @click.stop="openAssetEdit(asset)" class="flex-1 py-1.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-600 text-xs font-bold rounded-lg border border-slate-200 hover:border-blue-200 transition-colors">编辑</button>
                          <button @click.stop="regenAsset(asset.id)" class="flex-1 py-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 text-slate-600 text-xs font-bold rounded-lg border border-slate-200 hover:border-emerald-200 transition-colors">重生成</button>
                        </div>
                        <div :id="'regen-note-'+asset.id" class="text-[10px] text-emerald-500 mt-2 font-mono hidden"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- Stage 3: Storyboard Node -->
            <template #node-storyboard="props">
              <div :class="['stage-card flex flex-col bg-white rounded-2xl shadow-xl shadow-slate-200/50 border transition-all duration-500 min-w-[300px] min-h-[200px]', activeStage === 'storyboard' ? 'border-emerald-400 ring-4 ring-emerald-500/10' : 'border-slate-200 opacity-90 hover:opacity-100 hover:border-emerald-200']" @click="setActiveStage('storyboard')" style="width: 460px; resize: both; overflow: hidden;" id="card-storyboard">
                <div class="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl shrink-0">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <h3 class="font-black text-slate-800 tracking-wide text-base">阶段 3: 分镜</h3>
                  </div>
                  <div class="flex items-center gap-2">
                    <span v-if="STALE.storyboard" class="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-md shadow-sm">⚠ 待刷新</span>
                    <button @click.stop="downloadAllVideos" class="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white hover:bg-blue-600 rounded-lg text-xs font-bold transition-colors shadow-sm"><el-icon><Download /></el-icon> 批量下载</button>
                    <button @click.stop="downloadAllVideos" class="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg text-xs font-bold transition-colors shadow-sm"><el-icon><VideoPlay /></el-icon> 播放全部</button>
                    <button class="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><el-icon><Setting /></el-icon></button>
                  </div>
                </div>
                <div class="p-4 flex-1 overflow-y-auto custom-scrollbar nodrag bg-slate-50/30">
                  <div v-if="STALE.storyboard" class="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs flex justify-between items-center">
                    <span>此阶段因上游修改需重新生成</span>
                    <button @click.stop="refreshStage('storyboard')" class="px-3 py-1 bg-amber-500 text-white rounded-lg font-bold shadow-sm hover:bg-amber-600">重新生成</button>
                  </div>

                 <!-- 分镜表格 -->
                 <div class="mb-6">
                   <h4 class="font-black text-slate-800 text-sm mb-3">分镜表格总览</h4>
                   <el-table :data="SHOTS" border style="width: 100%" size="small">
                     <el-table-column prop="id" label="ID" width="60"></el-table-column>
                     <el-table-column prop="time" label="时间轴" width="100"></el-table-column>
                     <el-table-column prop="dur" label="时长" width="60"></el-table-column>
                     <el-table-column prop="cam" label="镜头" width="80"></el-table-column>
                     <el-table-column prop="desc" label="画面描述" show-overflow-tooltip></el-table-column>
                     <el-table-column prop="script" label="旁白" show-overflow-tooltip></el-table-column>
                     <el-table-column label="关联资产" width="120" show-overflow-tooltip>
                       <template #default="scope">
                         <span v-for="(tag, index) in scope.row.tags" :key="tag">
                           {{ getAssetName(tag) }}{{ index < scope.row.tags.length - 1 ? ', ' : '' }}
                         </span>
                       </template>
                     </el-table-column>
                   </el-table>
                 </div>

                 <div class="space-y-4">
                    <div v-for="shot in SHOTS" :key="shot.id" class="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow group relative">
                      <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button @click.stop="openShotEdit(shot)" class="w-6 h-6 flex items-center justify-center bg-white/90 text-slate-500 hover:text-indigo-600 rounded shadow-sm border border-slate-200"><el-icon><Edit /></el-icon></button>
                      </div>
                      
                      <!-- Header -->
                      <div class="flex justify-between items-center mb-2.5">
                        <div class="font-black text-slate-800 text-sm flex items-center gap-1.5">
                          <span class="w-1 h-3.5 bg-emerald-400 rounded-full"></span>
                          分镜 {{ shot.id }}
                        </div>
                        <div class="text-xs text-slate-400 font-mono font-medium">{{ shot.time }}</div>
                      </div>
                      
                      <!-- Body -->
                      <div class="flex gap-3">
                        <!-- Media -->
                        <div class="w-28 shrink-0 relative rounded-lg overflow-hidden bg-slate-100 aspect-[4/3] flex flex-col items-center justify-center border border-slate-200 cursor-pointer group/media" @click.stop="regenShotMedia(shot.id, 'vid')">
                          <div class="text-3xl transition-transform group-hover/media:scale-110">{{ shot.vid }}</div>
                          <div class="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] font-mono px-1.5 rounded backdrop-blur-sm">{{ shot.dur }}</div>
                          <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/media:opacity-100 transition-opacity backdrop-blur-[1px]">
                             <el-icon class="text-white text-2xl"><RefreshRight /></el-icon>
                          </div>
                          <div v-if="shot.vidStale" class="absolute top-1 left-1 w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_4px_rgba(245,158,11,0.8)]"></div>
                        </div>
                        
                        <!-- Info -->
                        <div class="flex-1 space-y-2 text-[13px] leading-relaxed">
                          <div class="flex">
                            <span class="text-slate-400 font-medium w-[65px] shrink-0">镜头：</span>
                            <span class="text-slate-700 font-bold">{{ shot.cam }}</span>
                          </div>
                          <div class="flex">
                            <span class="text-slate-400 font-medium w-[65px] shrink-0">画面描述：</span>
                            <span class="text-slate-700">{{ shot.desc }}</span>
                          </div>
                          <div class="flex">
                            <span class="text-slate-400 font-medium w-[65px] shrink-0">旁白：</span>
                            <span class="text-slate-700">{{ shot.script }}</span>
                          </div>
                          <div class="flex flex-wrap gap-1.5 pt-1">
                            <span v-for="tag in shot.tags" :key="tag" class="px-2 py-0.5 bg-slate-50 text-slate-600 text-[11px] font-medium rounded border border-slate-200 flex items-center gap-1">
                              <span class="opacity-80">{{ ASSETS.find(a => a.id === tag)?.emoji }}</span>
                              {{ getAssetName(tag) }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <!-- Stage 4: Video Node -->
            <template #node-video="props">
              <div :class="['stage-card flex flex-col bg-white rounded-2xl shadow-xl shadow-slate-200/50 border transition-all duration-500 min-w-[300px] min-h-[200px]', activeStage === 'video' ? 'border-orange-400 ring-4 ring-orange-500/10' : 'border-slate-200 opacity-90 hover:opacity-100 hover:border-orange-200']" @click="setActiveStage('video')" style="width: 420px; resize: both; overflow: hidden;" id="card-video">
                <div class="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl shrink-0">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-orange-500"></span>
                    <h3 class="font-black text-slate-800 tracking-wide text-base">阶段 4: 成片合成</h3>
                  </div>
                  <div class="flex items-center gap-2">
                    <span v-if="STALE.video" class="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-md shadow-sm">⚠ 待刷新</span>
                    <button class="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white hover:bg-orange-600 rounded-lg text-xs font-bold transition-colors shadow-sm"><el-icon><VideoPlay /></el-icon> 合成全片</button>
                  </div>
                </div>
                <div class="p-4 flex-1 overflow-y-auto custom-scrollbar nodrag bg-slate-50/30">
                  <!-- Final Video Player Placeholder -->
                  <div class="w-full aspect-video bg-black rounded-xl mb-5 relative flex items-center justify-center overflow-hidden shadow-inner group cursor-pointer border border-slate-200/80">
                     <el-icon class="text-white/80 text-5xl group-hover:scale-110 transition-transform"><VideoPlay /></el-icon>
                     <div class="absolute top-3 left-3 px-2.5 py-1 bg-black/60 text-white text-[10px] rounded-md backdrop-blur-md font-bold tracking-wide border border-white/10">预览成片 (待合成)</div>
                  </div>
                  
                  <!-- Grid of Shot Videos -->
                  <div class="flex justify-between items-center mb-3">
                    <h4 class="font-black text-slate-800 text-sm">分镜片段状态</h4>
                    <span class="text-xs text-slate-500 font-medium">{{ SHOTS.length }} 个片段</span>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                     <div v-for="shot in SHOTS" :key="'vid-'+shot.id" class="bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2">
                        <div class="aspect-video bg-slate-100 rounded-lg flex items-center justify-center relative overflow-hidden group/mini border border-slate-100">
                           <div class="text-2xl transition-transform group-hover/mini:scale-110">{{ shot.vid }}</div>
                           <div class="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1 rounded backdrop-blur-[2px] font-mono">{{ shot.dur }}</div>
                           <div v-if="shot.vidStale" class="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                              <span class="text-amber-500 text-xs font-bold animate-pulse">待重生成</span>
                           </div>
                        </div>
                        <div class="flex items-center justify-between px-1">
                           <span class="text-[11px] font-bold text-slate-700">镜头 {{ shot.id }}</span>
                           <span v-if="!shot.vidStale" class="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold border border-emerald-100/50">已生成</span>
                           <span v-else class="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-bold border border-amber-100/50">排队中</span>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </template>
          </VueFlow>
        </div>
      </section>

      <!-- Right Chat Panel -->
      <aside class="w-[420px] flex flex-col bg-white/90 backdrop-blur-2xl border-l border-slate-200/50 shadow-[-8px_0_30px_rgba(0,0,0,0.03)] z-20 relative">
        <div class="px-6 py-5 border-b border-slate-200/50 flex flex-col gap-3 bg-gradient-to-b from-slate-50/50 to-transparent">
          <div class="flex items-center gap-3">
            <div class="relative flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <h2 class="font-black text-slate-800 text-base tracking-wide flex-1">多 Agent 协作网络</h2>
            <el-select v-model="currentAgent" placeholder="选择 Agent" size="small" class="w-[120px] agent-select" @change="agentSay(`当前 Agent 已切换至：${agentConfigs[currentAgent].name}`, currentAgent)">
              <el-option
                v-for="key in agentKeys"
                :key="key"
                :label="agentConfigs[key].name"
                :value="key"
              />
            </el-select>
          </div>
          <!-- Agent Legend -->
          <div class="flex gap-2 overflow-x-auto hide-scrollbar-if-possible pb-1">
            <div v-for="(cfg, key) in agentConfigs" :key="key" class="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
              <span :class="['w-4 h-4 rounded-full bg-gradient-to-br flex items-center justify-center text-[10px] text-white border-2 border-white', cfg.color]">{{ cfg.icon }}</span>
              <span class="text-[10px] font-bold text-slate-500">{{ cfg.name }}</span>
            </div>
          </div>
        </div>
        
        <div class="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-slate-50/30" ref="msgsContainer">
          <div v-for="(msg, i) in messages" :key="i" :class="['flex w-full', msg.role === 'user' ? 'justify-end' : msg.role === 'sys' ? 'justify-center' : 'justify-start']">
            
            <div v-if="msg.role === 'sys'" class="px-4 py-1.5 rounded-full bg-black/5 backdrop-blur-sm text-xs text-slate-500 font-medium max-w-[90%] text-center border border-slate-200/50">
              {{ msg.text }}
            </div>
            
            <div v-else-if="msg.role === 'user'" class="max-w-[80%]">
              <div class="bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-3xl rounded-tr-sm px-5 py-3 shadow-lg shadow-indigo-500/20 text-sm leading-relaxed">
                {{ msg.text }}
              </div>
            </div>

            <div v-else class="max-w-[90%] flex gap-3">
              <div :class="['w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-sm shadow-md shrink-0 mt-1 text-white border-2 border-white', agentConfigs[msg.agentType || 'director'].color]">
                {{ agentConfigs[msg.agentType || 'director'].icon }}
              </div>
              <div class="flex-1">
                <div class="text-xs font-bold text-slate-500 mb-1 ml-1 flex items-center gap-2">
                  {{ agentConfigs[msg.agentType || 'director'].name }}
                  <span class="text-[10px] font-normal text-slate-400 font-mono">{{ msg.time || '' }}</span>
                </div>
                <div class="bg-white border border-slate-100/80 text-slate-700 rounded-3xl rounded-tl-sm px-5 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] text-sm leading-relaxed">
                  {{ msg.text }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 bg-white/90 backdrop-blur-md border-t border-slate-200/50">
          <div class="flex gap-2">
            <button @click="addMoreTurns" class="shrink-0 w-11 h-11 flex items-center justify-center bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-2xl border border-slate-200 transition-colors" title="追加示范对话">
              <el-icon><ChatLineRound /></el-icon>
            </button>
            <div class="flex-1 relative">
              <input v-model="userInput" @keydown.enter="sendChat" type="text" placeholder="输入消息，Agent 协作网络将自动响应..." class="w-full h-11 pl-4 pr-12 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all text-slate-700 shadow-inner">
              <button @click="sendChat" class="absolute right-1.5 top-1.5 bottom-1.5 w-8 flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95">
                <el-icon><Position /></el-icon>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </main>

    <!-- Modals -->
    <!-- Script Edit Modal -->
    <el-dialog v-model="showScriptModal" title="编辑剧本" width="800px" class="custom-dialog glass-dialog" :close-on-click-modal="false">
      <div class="space-y-6">
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">创意设计</label>
          <el-input type="textarea" v-model="editScript.concept" :rows="3" resize="none" class="custom-input"></el-input>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">用户设定</label>
          <div class="grid grid-cols-3 gap-4">
            <el-input v-model="editScript.user.style" placeholder="风格" class="custom-input"><template #prepend>风格</template></el-input>
            <el-input v-model="editScript.user.duration" placeholder="时长" class="custom-input"><template #prepend>时长</template></el-input>
            <el-input v-model="editScript.user.ratio" placeholder="比例" class="custom-input"><template #prepend>比例</template></el-input>
            <el-input v-model="editScript.user.platform" placeholder="平台" class="custom-input"><template #prepend>平台</template></el-input>
            <el-input v-model="editScript.user.voice" placeholder="旁白" class="custom-input"><template #prepend>旁白</template></el-input>
            <el-input v-model="editScript.user.audience" placeholder="受众" class="custom-input"><template #prepend>受众</template></el-input>
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">具体剧本 (按段落)</label>
          <div class="space-y-3">
            <div v-for="(sec, idx) in editScript.sections" :key="idx" class="flex gap-3">
              <div class="w-24 shrink-0"><el-input v-model="sec.t" class="custom-input" readonly></el-input></div>
              <div class="flex-1"><el-input type="textarea" v-model="sec.text" :rows="2" resize="none" class="custom-input"></el-input></div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="showScriptModal = false" round>取消</el-button>
          <el-button type="primary" @click="saveScriptEdit" round class="bg-indigo-500 border-indigo-500 shadow-md shadow-indigo-500/30">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Asset Edit Modal -->
    <el-dialog v-model="showAssetModal" title="编辑资产" width="500px" class="custom-dialog glass-dialog">
      <div class="space-y-5">
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">类型</label>
          <el-input v-model="editAsset.type" disabled class="custom-input"></el-input>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">名称</label>
          <el-input v-model="editAsset.name" class="custom-input"></el-input>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">描述</label>
          <el-input type="textarea" v-model="editAsset.desc" :rows="4" resize="none" class="custom-input"></el-input>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="showAssetModal = false" round>取消</el-button>
          <el-button type="primary" @click="saveAssetEdit" round class="bg-blue-500 border-blue-500 shadow-md shadow-blue-500/30">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Shot Edit Modal -->
    <el-dialog v-model="showShotModal" :title="`编辑分镜 ${editShot.id || ''}`" width="600px" class="custom-dialog glass-dialog">
      <div class="space-y-5">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">镜头</label>
            <el-input v-model="editShot.cam" class="custom-input"></el-input>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">时长</label>
            <el-input v-model="editShot.dur" class="custom-input"></el-input>
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">画面描述</label>
          <el-input type="textarea" v-model="editShot.desc" :rows="2" resize="none" class="custom-input"></el-input>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">旁白</label>
          <el-input type="textarea" v-model="editShot.script" :rows="2" resize="none" class="custom-input"></el-input>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">关联资产</label>
          <div class="flex flex-wrap gap-2">
            <div v-for="asset in ASSETS" :key="asset.id"
                 @click="toggleEditShotTag(asset.id)"
                 :class="['px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all border', 
                          editShot.tags.includes(asset.id) ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/30' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-emerald-300']">
              #{{ asset.name }}
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="showShotModal = false" round>取消</el-button>
          <el-button type="primary" @click="saveShotEdit" round class="bg-emerald-500 border-emerald-500 shadow-md shadow-emerald-500/30">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElTable, ElTableColumn } from 'element-plus'; // Add ElTable, ElTableColumn
import { Edit, Download, RefreshRight, ChatLineRound, Position, ArrowLeft, ArrowRight, VideoPlay, Setting, Film } from '@element-plus/icons-vue';
import { VueFlow, useVueFlow } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import '@vue-flow/controls/dist/style.css';

const router = useRouter();
const RUN_ID = 'vid_8f3a7c2e91';

// --- State ---
const SCRIPT = reactive({
  concept: '围绕深海生物发光展开科普，通过场景对比、生物细节展示，吸引小学生的注意力。',
  user: { style: '活泼卡通', duration: '180s', ratio: '9:16 竖屏', platform: '抖音', voice: '沉稳男声', audience: '小学生' },
  sections: [
    { t: '第1段', d: '60s', text: '水面以下一千米，阳光永远无法到达，但并非完全黑暗……' },
    { t: '第2段', d: '50s', text: '黑暗中亮起一点蓝光，然后是两点三点，像海底星空……' },
    { t: '第3段', d: '40s', text: '这些光不是为了美丽——是一场跨越深海的无声对话……' },
    { t: '第4段', d: '30s', text: '最黑暗的地方，也藏着最璀璨的生命。' },
  ]
});

const ASSETS = reactive([
  { id: 'char_zhujiang', type: '人物', emoji: '🧑', name: '旁白者', desc: '沉稳中年男声形象，知识向导。圆脸、细框眼镜，浅蓝讲解员制服，冷蓝色统一。' },
  { id: 'char_qianshuiyuan', type: '人物', emoji: '🤿', name: '潜水员', desc: '年轻活力探索者。橙色潜水服、护目镜，姿态前倾具探索感，主色橙对比冷蓝。' },
  { id: 'scene_dehai', type: '场景', emoji: '🌊', name: '深海全景', desc: '海面下约1000米，无自然光，冷蓝调，悬浮颗粒感，远景渐隐。' },
  { id: 'scene_faguang', type: '场景', emoji: '✨', name: '生物发光', desc: '暗背景中蓝绿光点，点光源柔和晕染，营造"海底星空"。' },
  { id: 'scene_haimian', type: '场景', emoji: '🌌', name: '海面夜景', desc: '夜晚海面，星空倒映，上方微光、下方深蓝，用作转场衔接。' },
  { id: 'prop_qianshuiqi', type: '道具', emoji: '🛥️', name: '潜水器', desc: '黄色小型探测潜水器，圆润机身、前置探照灯，辨识度高。' },
  { id: 'prop_tanzhaodeng', type: '道具', emoji: '🔦', name: '探照灯', desc: '强光束道具，锥形光束，亮黄白，用于突出主体。' },
]);

const SHOTS = reactive([
  { id: '1-1', dur: '8s', cam: '固定', desc: '海面阳光灿烂，镜头缓缓下移，画面渐暗过渡到深海。', script: '水面以下一千米，阳光永远无法到达，但并非完全黑暗……', tags: ['scene_dehai', 'prop_qianshuiqi'], img: '🎨', vid: '🎬', imgNote: '', vidNote: '', vidStale: false, time: '00:00 - 00:08' },
  { id: '1-2', dur: '5s', cam: '特写', desc: '黑暗中浮现一点蓝光，镜头拉近，光芒扩散。', script: '黑暗中亮起一点蓝光，然后是两点三点，像海底星空……', tags: ['scene_faguang'], img: '🎨', vid: '🎬', imgNote: '', vidNote: '', vidStale: false, time: '00:08 - 00:13' },
  { id: '1-3', dur: '7s', cam: '跟随', desc: '潜水员穿过微光区，与发光生物擦身而过。', script: '这些光不是为了美丽——是一场跨越深海的无声对话……', tags: ['char_qianshuiyuan', 'scene_faguang'], img: '🎨', vid: '🎬', imgNote: '', vidNote: '', vidStale: false, time: '00:13 - 00:20' },
  { id: '2-1', dur: '6s', cam: '摇移', desc: '横扫海底，发光生物与潜水员同框，如海底星空。', script: '最黑暗的地方，也藏着最璀璨的生命。', tags: ['scene_dehai', 'char_qianshuiyuan'], img: '🎨', vid: '🎬', imgNote: '', vidNote: '', vidStale: false, time: '00:20 - 00:26' },
  { id: '2-2', dur: '6s', cam: '推进', desc: '单只生物发出特定频率的光，仿佛在彼此交流。', script: '每一束光，都是生命的奇迹。', tags: ['scene_faguang', 'char_qianshuiyuan'], img: '🎨', vid: '🎬', imgNote: '', vidNote: '', vidStale: false, time: '00:26 - 00:32' },
]);

const STALE = reactive({ script: false, asset: false, storyboard: false });
const activeStage = ref('script');
const assetFilter = ref('全部');

const filteredAssets = computed(() => {
  if (assetFilter.value === '全部') return ASSETS;
  return ASSETS.filter(a => a.type === assetFilter.value);
});

const getAssetName = (id: string) => {
  return ASSETS.find(a => a.id === id)?.name || id;
};

// --- Vue Flow State ---
const { setCenter } = useVueFlow();

const flowNodes = ref([
  { id: 'script', type: 'script', position: { x: 50, y: 50 } },
  { id: 'asset', type: 'asset', position: { x: 550, y: 50 } },
  { id: 'storyboard', type: 'storyboard', position: { x: 1100, y: 50 } },
  { id: 'video', type: 'video', position: { x: 1650, y: 50 } },
]);

const flowEdges = ref([
  { id: 'e1', source: 'script', target: 'asset', animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } },
  { id: 'e2', source: 'asset', target: 'storyboard', animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } },
  { id: 'e3', source: 'storyboard', target: 'video', animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } },
]);

// --- Layout State ---
const isLeftSidebarCollapsed = ref(false);

const toggleLeftSidebar = () => {
  isLeftSidebarCollapsed.value = !isLeftSidebarCollapsed.value;
};

// --- Actions ---
const setActiveStage = (stage: string) => {
  activeStage.value = stage;
};

const refreshStage = (stage: string) => {
  STALE[stage as keyof typeof STALE] = false;
  agentSay(`↻ 已重新生成「${stage === 'script' ? '剧本' : stage === 'asset' ? '资产' : '分镜'}」，与最新 run_state 对齐。`);
};

const applyStale = (source: string, downstream: string[]) => {
  downstream.forEach(s => STALE[s as keyof typeof STALE] = true);
  const names = downstream.map(s => s === 'asset' ? '资产' : '分镜').join('、');
  agentSay(`✎ 同步：你修改了「${source === 'script' ? '剧本' : '资产'}」，已写入 run_state。下游「${names}」标记为待刷新，需重新生成后保持一致。`);
};

// --- Script Edit ---
const showScriptModal = ref(false);
const editScript = reactive({ concept: '', user: {} as any, sections: [] as any[] });

const openScriptEdit = () => {
  editScript.concept = SCRIPT.concept;
  editScript.user = { ...SCRIPT.user };
  editScript.sections = JSON.parse(JSON.stringify(SCRIPT.sections));
  showScriptModal.value = true;
};

const saveScriptEdit = () => {
  SCRIPT.concept = editScript.concept;
  Object.assign(SCRIPT.user, editScript.user);
  SCRIPT.sections = editScript.sections;
  showScriptModal.value = false;
  applyStale('script', ['asset', 'storyboard']);
};

// --- Asset Edit ---
const showAssetModal = ref(false);
const editAsset = reactive({ id: '', type: '', name: '', desc: '' });

const openAssetEdit = (asset: any) => {
  editAsset.id = asset.id;
  editAsset.type = asset.type;
  editAsset.name = asset.name;
  editAsset.desc = asset.desc;
  showAssetModal.value = true;
};

const saveAssetEdit = () => {
  const asset = ASSETS.find(a => a.id === editAsset.id);
  if (asset) {
    asset.name = editAsset.name;
    asset.desc = editAsset.desc;
    applyStale('asset', ['storyboard']);
  }
  showAssetModal.value = false;
};

const EMOJI_POOL = ['🧑','🤿','🌊','✨','🌌','🛥️','🔦','🐋','🪼','💡','🌠','🔭'];
const regenAsset = (id: string) => {
  const asset = ASSETS.find(a => a.id === id);
  if (asset) {
    const el = document.getElementById('thumb-' + id);
    if (el) el.innerHTML = '<span class="animate-spin text-2xl border-4 border-slate-200 border-t-blue-500 rounded-full w-8 h-8"></span>';
    setTimeout(() => {
      let ne; do { ne = EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)]; } while (ne === asset.emoji);
      asset.emoji = ne;
      if (el) el.innerHTML = `<span>${ne}</span>`;
      const note = document.getElementById('regen-note-' + id);
      if (note) {
        note.textContent = `↻ 已重新生成 · ${new Date().toLocaleTimeString('zh-CN', { hour12: false })}`;
        note.classList.remove('hidden');
      }
      STALE.storyboard = true;
      agentSay(`✎ 同步：你重新生成了资产「${asset.name}」的锚定图，已写入 run_state。下游「分镜」标记为待刷新。`);
    }, 800);
  }
};

// --- Shot Edit ---
const showShotModal = ref(false);
const editShot = reactive({ id: '', cam: '', dur: '', desc: '', script: '', tags: [] as string[] });

const openShotEdit = (shot: any) => {
  editShot.id = shot.id;
  editShot.cam = shot.cam;
  editShot.dur = shot.dur;
  editShot.desc = shot.desc;
  editShot.script = shot.script;
  editShot.tags = [...shot.tags];
  showShotModal.value = true;
};

const toggleEditShotTag = (id: string) => {
  const idx = editShot.tags.indexOf(id);
  if (idx > -1) editShot.tags.splice(idx, 1);
  else editShot.tags.push(id);
};

const saveShotEdit = () => {
  const shot = SHOTS.find(s => s.id === editShot.id);
  if (shot) {
    shot.cam = editShot.cam;
    shot.dur = editShot.dur;
    shot.desc = editShot.desc;
    shot.script = editShot.script;
    shot.tags = [...editShot.tags];
    shot.vidStale = true;
    agentSay(`✎ 同步：你修改了分镜「${shot.id}」，已写入 run_state。该分镜的视频已标记待重生成。`);
  }
  showShotModal.value = false;
};

const MEDIA_POOL = ['🎨','🖼️','🎞️','🌅','🪸','🐠','🫧','🐙'];
const regenShotMedia = (id: string, kind: 'img' | 'vid') => {
  const shot = SHOTS.find(s => s.id === id);
  if (shot) {
    const key = kind === 'img' ? 'img' : 'vid';
    const noteKey = kind === 'img' ? 'imgNote' : 'vidNote';
    const el = document.getElementById(`${key}-${id}`);
    if (el) el.innerHTML = '<span class="animate-spin text-2xl border-4 border-slate-200 border-t-emerald-500 rounded-full w-8 h-8"></span>';
    setTimeout(() => {
      let ne; do { ne = MEDIA_POOL[Math.floor(Math.random() * MEDIA_POOL.length)]; } while (ne === shot[key]);
      shot[key] = ne;
      shot[noteKey] = `${kind === 'img' ? '🎨 分镜图' : '🎬 视频'} ↻ 已重新生成 · ${new Date().toLocaleTimeString('zh-CN', { hour12: false })}`;
      if (kind === 'img') shot.vidStale = true;
      else shot.vidStale = false;
      agentSay(`↻ 已重新生成分镜「${id}」的${kind === 'img' ? '分镜图（其视频已标记待重生成）' : '视频，已与最新分镜对齐'}。`);
    }, 800);
  }
};

// --- Multi-Agent Configuration ---
const agentConfigs = {
  director: { name: '总导演 Agent', icon: '🎬', color: 'from-indigo-500 to-blue-600', bg: 'bg-indigo-50' },
  script: { name: '剧本 Agent', icon: '📝', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50' },
  asset: { name: '资产 Agent', icon: '🎨', color: 'from-pink-500 to-rose-500', bg: 'bg-pink-50' },
  storyboard: { name: '分镜 Agent', icon: '📋', color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50' },
  video: { name: '视频 Agent', icon: '🎥', color: 'from-orange-500 to-amber-500', bg: 'bg-orange-50' }
};

type AgentType = keyof typeof agentConfigs;

interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'sys';
  agentType?: AgentType;
  text: string;
  time?: string;
}

// --- Chat Logic ---
const userInput = ref('');
const messages = ref<ChatMessage[]>([]);
const msgsContainer = ref<HTMLElement | null>(null);
const currentAgent = ref<AgentType>('director'); // New state for current active agent

const agentKeys = computed(() => Object.keys(agentConfigs));



const scrollToBottom = () => {
  nextTick(() => {
    if (msgsContainer.value) msgsContainer.value.scrollTop = msgsContainer.value.scrollHeight;
  });
};

const addMsg = (text: string, role: 'user' | 'agent' | 'sys', agentType: AgentType = 'director') => {
  messages.value.push({ 
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    role, 
    agentType,
    text,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  });
  scrollToBottom();
};

const agentSay = (t: string, type: AgentType = 'director') => {
  currentAgent.value = type; // Update current agent when an agent speaks
  addMsg(t, 'agent', type);
};
const sysSay = (t: string) => addMsg(t, 'sys');

const sendChat = async () => { // Changed to async function
  const v = userInput.value.trim();
  if (!v) return;
  addMsg(v, 'user');
  userInput.value = '';
  
  const summary = v.length > 22 ? v.slice(0, 22) + '…' : v;
  
  // Simulate API call and agent response
  // In a real application, you would replace these setTimeout calls with actual API calls
  // using axios to interact with your backend agents.

  let handled = false;

  if (v.includes('剧本') || v.includes('设定') || v.includes('时长') || v.includes('比例') || v.includes('风格') || currentAgent.value === 'script') {
    currentAgent.value = 'script';
    agentSay('收到关于剧本的修改需求，正在为您重新规划大纲结构...', 'script');
    handled = true;
    try {
      // await axios.post('/api/script-agent', { query: v, context: messages.value });
      // const response = await axios.post('/api/script-agent', { query: v, context: messages.value });
      // agentSay(response.data.message, 'script');
      setTimeout(() => { // Simulate API response
        agentSay('剧本已更新完毕。' + (STALE.script ? '' : '已同步至画布，请查阅。'), 'script');
        if (v.includes('潜') || v.includes('海') || v.includes('光') || v.includes('色') || v.includes('节奏') || v.includes('慢') || v.includes('快') || v.includes('亮') || v.includes('暗') || v.includes('声音') || v.includes('旁白') || v.includes('儿童') || v.includes('小学生') || v.includes('科普')) {
          applyStale('script', ['asset', 'storyboard']);
        }
        currentAgent.value = 'director'; // Hand back to director after task
      }, 1500);
    } catch (error) {
      console.error('Script agent error:', error);
      agentSay('剧本 Agent 出了点问题，请稍后再试。', 'script');
      currentAgent.value = 'director';
    }
  } 
  
  if (!handled && (v.includes('资产') || v.includes('人物') || v.includes('场景') || v.includes('道具') || v.includes('换') || v.includes('改') || v.includes('重新') || v.includes('重生') || v.includes('新') || currentAgent.value === 'asset')) {
    currentAgent.value = 'asset';
    agentSay('好的，我来为您调整资产库。', 'asset');
    handled = true;
    try {
      // await axios.post('/api/asset-agent', { query: v, context: messages.value });
      setTimeout(() => { // Simulate API response
        const hit = ASSETS.find(a => v.includes(a.name));
        if (hit) {
          regenAsset(hit.id);
          agentSay(`资产「${hit.name}」已为您重新生成并入库。`, 'asset');
        } else {
          agentSay('资产列表已刷新，你可以直接点击左侧资产卡片进行单独编辑或重生成。', 'asset');
        }
        currentAgent.value = 'director'; // Hand back to director after task
      }, 1200);
    } catch (error) {
      console.error('Asset agent error:', error);
      agentSay('资产 Agent 出了点问题，请稍后再试。', 'asset');
      currentAgent.value = 'director';
    }
  } 
  
  if (!handled && (v.includes('分镜图') || v.includes('画面') || v.includes('镜头') || currentAgent.value === 'storyboard')) {
    currentAgent.value = 'storyboard';
    agentSay('收到，正在重新规划分镜画面设计...', 'storyboard');
    handled = true;
    try {
      // await axios.post('/api/storyboard-agent', { query: v, context: messages.value });
      setTimeout(() => { // Simulate API response
        const m = v.match(/(\d-\d)/);
        const hit = m ? SHOTS.find(s => s.id === m[1]) : null;
        if (hit) {
          regenShotMedia(hit.id, 'img');
          agentSay(`分镜 ${hit.id} 的画面已重新设计，您可以点击卡片查看详情。`, 'storyboard');
        } else {
          agentSay('分镜图已更新。', 'storyboard');
        }
        currentAgent.value = 'director'; // Hand back to director after task
      }, 1500);
    } catch (error) {
      console.error('Storyboard agent error:', error);
      agentSay('分镜 Agent 出了点问题，请稍后再试。', 'storyboard');
      currentAgent.value = 'director';
    }
  } 
  
  if (!handled && (v.includes('视频') || v.includes('动画') || v.includes('动') || currentAgent.value === 'video')) {
    currentAgent.value = 'video';
    agentSay('视频生成任务已加入队列，正在为您合成最新视频片段。', 'video');
    handled = true;
    try {
      // await axios.post('/api/video-agent', { query: v, context: messages.value });
      setTimeout(() => { // Simulate API response
        const m = v.match(/(\d-\d)/);
        const hit = m ? SHOTS.find(s => s.id === m[1]) : null;
        if (hit) {
          regenShotMedia(hit.id, 'vid');
        }
        else {
          agentSay('所有标记为待重生成的视频已开始合成，请稍后预览。', 'video');
        }
        currentAgent.value = 'director'; // Hand back to director after task
      }, 2000);
    } catch (error) {
      console.error('Video agent error:', error);
      agentSay('视频 Agent 出了点问题，请稍后再试。', 'video');
      currentAgent.value = 'director';
    }
  } 
  
  if (!handled) {
    // Default director agent
    currentAgent.value = 'director';
    agentSay('作为总导演，我会协调各个 Agent 完成您的需求。已将您的意图：「' + summary + '」记录并下发。', 'director');
    // try {
    //   await axios.post('/api/director-agent', { query: v, context: messages.value });
    //   agentSay(response.data.message, 'director');
    // } catch (error) {
    //   console.error('Director agent error:', error);
    //   agentSay('总导演 Agent 出了点问题，请稍后再试。', 'director');
    // }
  }
};

const SAMPLE_TURNS: [role: 'user' | 'agent' | 'sys', text: string, agentType?: AgentType][] = [
  ['user', '我想做一个关于深海生物的科普视频，3 分钟给小学生看。'],
  ['agent', '好的，先核对需求：📍 抖音 · 🎨 活泼卡通 · 📐 9:16 · 🎙 沉稳男声 · 🎯 小学生。', 'director'],
  ['sys', '✓ 需求锁定 · 时长 180s 已写入 run_state · 输入护栏 PASS'],
  ['user', '对了，旁白节奏稍微慢一点，知识点要讲透。'],
  ['agent', '收到，已把「语速偏慢 + 知识点展开」作为剧本的隐含约束写入。开始生成剧本 + 绑定关系表。', 'script'],
  ['sys', '✓ 剧本已生成（4 段 · 180s） · 点击左下剧本卡片可逐段审阅'],
];

const MORE_TURNS: [role: 'user' | 'agent' | 'sys', text: string, agentType?: AgentType][] = [
  ['user', '整体节奏再慢一点，前两段可以更长一些。'],
  ['agent', '好的，把第1段 60s→70s、第2段 50s→55s，总时长仍保持 180s。', 'script'],
  ['sys', '✓ 剧本时长已重新分配 · 你可以直接点剧本右上 ✎ 微调具体秒数'],
  ['user', '第 3 段那个分镜潜水器几乎没出现，换一个亮一点的场景。'],
  ['agent', '收到，正在为您替换相关资产并更新分镜配置。', 'asset'],
  ['agent', '分镜 2-1 已追加关联 prop_qianshuiqi；并已重新规划画面。', 'storyboard'],
  ['agent', '正在为您重新合成该分镜的视频。', 'video'],
  ['sys', '↻ 分镜 2-1 视频已重生成 · prop_qianshuiqi 已嵌入远景'],
];

const addMoreTurns = () => {
  const before = messages.value.length;
  MORE_TURNS.forEach(([r, t, a]) => addMsg(t, r, a));
  sysSay(`本次新增 ${messages.value.length - before} 轮多 Agent 协作对话演示`);
};

let demoTimer: any = null;
const resetAll = () => {
  clearTimeout(demoTimer);
  STALE.script = STALE.asset = STALE.storyboard = false;
  SHOTS.forEach(s => { s.vidStale = false; s.imgNote = ''; s.vidNote = ''; });
  activeStage.value = 'script';
  messages.value = [];
  SAMPLE_TURNS.forEach(([r, t, a]) => addMsg(t, r, a));
};

const runDemo = () => {
  resetAll();
  const stages = ['script', 'asset', 'storyboard'];
  let k = 0;
  
  const demoMsgs: Record<string, { role: 'agent' | 'sys', text: string, type?: AgentType }[]> = {
    script: [
      { role: 'agent', text: '已确认需求：📍 抖音 · 🎨 活泼卡通 · 📐 9:16 · 🎙 沉稳男声 · 🎯 小学生 3 分钟科普。', type: 'director' },
      { role: 'agent', text: '正在按"主体/场景/道具"提取核心元素：深海 · 发光生物 · 旁白者 + 潜航者。', type: 'script' },
      { role: 'agent', text: '生成 4 段式剧本 + 用户设定 + 绑定关系表，共耗时 1.2s。等待你在剧本卡片右上 ✎ 处微调。', type: 'script' },
    ],
    asset: [
      { role: 'agent', text: '正在生成锚定图：旁白者 / 潜航者 / 深海全景 / 生物发光 / 潜水器 / 探照灯。', type: 'asset' },
      { role: 'agent', text: '锚定图全部完成 ✅ — 所有引用一律通过实体 ID，避免跨幕漂移。', type: 'asset' },
    ],
    storyboard: [
      { role: 'agent', text: '按幕并发生成 5 个分镜的脚本 + 分镜图 + 视频（mock）。', type: 'storyboard' },
      { role: 'agent', text: '视频占位已生成完毕，正在进行质量校验。', type: 'video' },
      { role: 'agent', text: '整个工作流已就绪。你可在分镜卡片上点击「✎ 编辑」或回到任意上一步骤改动。', type: 'director' },
    ],
  };
  
  const step = () => {
    if (k < stages.length) {
      activeStage.value = stages[k];
      const stageName = stages[k] === 'script' ? '剧本' : stages[k] === 'asset' ? '资产' : '分镜';
      agentSay(`▶ 阶段 ${k+1}/${stages.length}：${stageName}`, 'director');
      
      const subs = demoMsgs[stages[k]];
      subs.forEach((msg, i) => {
        demoTimer = setTimeout(() => {
          if (msg.role === 'agent') agentSay(msg.text, msg.type); else sysSay(msg.text);
        }, 500 + i * 600);
      });
      k++;
      demoTimer = setTimeout(step, 500 + subs.length * 600 + 400);
    } else {
      clearTimeout(demoTimer);
      sysSay('演示完成。您可向协作网络发送指令，相关 Agent 会自动响应。');
    }
  };
  setTimeout(step, 400);
};

// --- Navigation ---
const scrollToAsset = (id: string) => {
  activeStage.value = 'asset';
  setCenter(550 + 240, 50 + 300, { zoom: 0.8, duration: 800 });
  const asset = ASSETS.find(a => a.id === id);
  if (asset) openAssetEdit(asset);
};

const scrollToShot = (id: string) => {
  activeStage.value = 'storyboard';
  setCenter(1100 + 270, 50 + 300, { zoom: 0.8, duration: 800 });
  const shot = SHOTS.find(s => s.id === id);
  if (shot) openShotEdit(shot);
};

// --- Utilities ---
const downloadAsset = (asset: any) => {
  ElMessage.success(`已触发下载资产：${asset.name}`);
};

const downloadShotImg = (shot: any) => {
  ElMessage.success(`已触发下载分镜图：${shot.id}`);
};

const downloadShotVid = (shot: any) => {
  ElMessage.success(`已触发下载视频占位：${shot.id}`);
};

const downloadAllVideos = () => {
  ElMessage.success(`已批量触发 ${SHOTS.length} 个视频下载`);
};

// Init
setTimeout(resetAll, 100);

</script>

<style scoped lang="scss">
.custom-scrollbar {
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 6px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
}

:deep(.custom-dialog) {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  
  .el-dialog__header {
    padding: 20px 24px;
    margin: 0;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    .el-dialog__title {
      font-weight: 900;
      color: #1e293b;
      font-size: 16px;
    }
  }
  
  .el-dialog__body {
    padding: 24px;
    background: #ffffff;
  }
  
  .el-dialog__footer {
    padding: 16px 24px;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
  }
}

:deep(.custom-input) {
  .el-input__wrapper, .el-textarea__inner {
    border-radius: 12px;
    box-shadow: 0 0 0 1px #e2e8f0 inset;
    background-color: #f8fafc;
    transition: all 0.2s ease;
    
    &:hover {
      box-shadow: 0 0 0 1px #cbd5e1 inset;
    }
    
    &.is-focus, &:focus {
      box-shadow: 0 0 0 2px #6366f1 inset !important;
      background-color: #ffffff;
    }
  }
  .el-input-group__prepend {
    border-radius: 12px 0 0 12px;
    background-color: #f1f5f9;
    color: #64748b;
    font-weight: 600;
    border-right: 0;
    box-shadow: 0 0 0 1px #e2e8f0 inset;
  }
}

.glass-dialog {
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

:deep(.agent-select) {
  .el-input__wrapper {
    border-radius: 12px;
    background-color: #f5f7fa; /* Slightly brighter default background */
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.08); /* Enhanced 3D texture */
    border: none;
    transition: all 0.3s ease; /* Smooth transitions */

    &:hover {
      background-color: #e8ebf0; /* Slightly darker hover background */
      box-shadow: inset 0 2px 5px rgba(0,0,0,0.1), 0 2px 5px rgba(0,0,0,0.12); /* More pronounced hover shadow */
    }

    &.is-focus {
      background-color: #ffffff;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3), inset 0 2px 4px rgba(0,0,0,0.08); /* Stronger focus ring with depth */
      border-color: #6366f1; /* Accent border color */
    }

    .el-input__inner {
      color: #1e293b;
      font-weight: 600;
    }
  }

  .el-select__suffix {
    color: #64748b; // 下拉箭头颜色
  }

  .el-select-dropdown {
    border-radius: 16px; /* Slightly larger border-radius */
    box-shadow: 0 15px 30px rgba(0,0,0,0.15), 0 5px 10px rgba(0,0,0,0.08); /* More pronounced shadow */
    border: 1px solid #e2e8f0; /* Add a subtle border */
    overflow: hidden; /* Ensure rounded corners are respected */
    background-color: #ffffff; /* Explicit background for consistency */

    .el-select-dropdown__item {
      border-radius: 10px; /* Slightly larger border-radius for items */
      margin: 6px 10px; /* Adjusted margin for better spacing */
      padding: 10px 15px; /* Added padding */
      font-size: 14px; /* Slightly larger font size */
      transition: all 0.2s ease; /* Smooth transitions */
      color: #334155; /* Default text color */

      &:hover {
        background-color: #e0e7ff; /* Lighter indigo hover background */
        color: #4f46e5; /* Stronger indigo text color */
        transform: translateY(-1px); /* Slight lift effect */
        box-shadow: 0 4px 8px rgba(0,0,0,0.08); /* Subtle shadow on hover */
      }

      &.is-selected {
        background-color: #6366f1; /* Stronger indigo for selected item */
        color: #ffffff; /* White text for selected item */
        font-weight: 700;
        box-shadow: 0 4px 10px rgba(0,0,0,0.15); /* Distinct shadow for selected */
      }
    }
  }
}
</style>
