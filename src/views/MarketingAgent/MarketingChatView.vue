<template>
  <div class="marketing-chat flex-1 min-h-0 flex flex-col overflow-hidden" :style="{ background: '#f7f7f8' }">

    <!-- ===== 对话模式 ===== -->
    <template v-if="store.isChatMode">
      <!-- 顶部标签栏 -->
      <div class="flex-shrink-0 flex items-center justify-between px-5 py-2.5 bg-white border-b border-slate-200">
        <div class="flex items-center gap-1">
          <button @click="store.setChatTab('chat')" :class="['flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all', store.activeChatTab === 'chat' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50']">
            <el-icon :size="13"><Comment /></el-icon>对话
          </button>
          <button @click="store.setChatTab('files')" :class="['flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all', store.activeChatTab === 'files' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50']">
            <el-icon :size="13"><Document /></el-icon>对话文件
          </button>
          <button class="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 ml-1"><el-icon :size="14"><Share /></el-icon></button>
        </div>
        <div class="flex items-center gap-2">
          <button @click="store.toggleResourcePanel" class="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"><el-icon :size="15"><FullScreen /></el-icon></button>
          <button @click="resetChat" class="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"><el-icon :size="15"><Refresh /></el-icon></button>
        </div>
      </div>

      <!-- 中间内容区 -->
      <div class="flex-1 flex overflow-hidden min-h-0">
        <!-- 对话列表 -->
        <div class="flex-1 flex flex-col min-w-0 min-h-0">
          <div ref="chatContainer" class="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
            <div class="max-w-3xl mx-auto space-y-6">
              <div v-for="msg in store.chatMessages" :key="msg.id" class="animate-fade-in">

                <!-- 用户消息 - 复杂输入（技能标签+内容） -->
                <div v-if="msg.role === 'user' && msg.type === 'input'" class="flex justify-end mb-4">
                  <div class="max-w-[85%]">
                    <div v-if="msg.skillTags && msg.skillTags.length" class="flex flex-wrap justify-end gap-1.5 mb-2">
                      <span v-for="tag in msg.skillTags" :key="tag" class="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600">
                        <el-icon :size="11"><MagicStick /></el-icon>{{ tag }}
                      </span>
                    </div>
                    <div class="bg-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-slate-700 leading-relaxed border border-slate-100 shadow-sm">
                      {{ msg.content }}
                    </div>
                  </div>
                </div>

                <!-- 用户消息 - 简单回复（右对齐气泡） -->
                <div v-else-if="msg.role === 'user' && msg.type === 'reply'" class="flex justify-end mb-4">
                  <div class="max-w-[60%] bg-slate-800 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed">
                    {{ msg.content }}
                  </div>
                </div>

                <!-- 用户消息 - 选择结果 -->
                <div v-else-if="msg.role === 'user' && msg.type === 'selection'" class="mb-4">
                  <div class="max-w-[80%] bg-slate-50 rounded-xl px-4 py-2.5 text-sm text-slate-600 border border-slate-200">
                    {{ msg.content }}
                  </div>
                  <div class="text-[10px] text-slate-400 mt-1.5 px-1">{{ formatTime(msg.timestamp) }}</div>
                </div>

                <!-- AI回复 -->
                <div v-else-if="msg.role === 'assistant'" class="flex gap-3 mb-6">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <span class="text-white text-xs font-bold">AI</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <!-- 思考中 -->
                    <div v-if="msg.status === 'thinking'" class="flex items-center gap-2 text-slate-400 text-sm py-2">
                      <span class="flex gap-1">
                        <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                        <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style="animation-delay:150ms"></span>
                        <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style="animation-delay:300ms"></span>
                      </span>
                      <span class="text-xs">正在思考营销方案...</span>
                    </div>

                    <template v-else>
                      <!-- 思考步骤（可折叠） -->
                      <div v-if="msg.steps && msg.steps.length" class="mb-3 space-y-1">
                        <div v-for="(step, idx) in msg.steps" :key="idx" class="group">
                          <div @click="step.expanded = !step.expanded" class="flex items-center gap-2 py-1 cursor-pointer hover:bg-slate-50 rounded-lg px-2 -mx-2">
                            <el-icon :size="13" class="text-emerald-500 flex-shrink-0"><Check /></el-icon>
                            <span class="text-[11px] font-bold text-slate-500">{{ step.type }}</span>
                            <span class="text-[11px] text-slate-600">{{ step.title }}</span>
                            <el-icon :size="11" class="text-slate-400 ml-auto transition-transform" :class="step.expanded ? 'rotate-180' : ''"><ArrowDown /></el-icon>
                          </div>
                          <div v-show="step.expanded && step.detail" class="ml-7 mt-1 mb-2 text-[11px] text-slate-500 leading-relaxed">
                            {{ step.detail }}
                          </div>
                        </div>
                      </div>

                      <!-- 分析文字内容 -->
                      <div v-if="msg.content" class="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-3">{{ msg.content }}</div>

                      <!-- 素材盘点 -->
                      <div v-if="msg.materialCheck" class="mb-3">
                        <div class="text-sm font-bold text-slate-800 mb-2">素材盘点：</div>
                        <div class="space-y-1.5">
                          <div v-for="(item, idx) in msg.materialCheck" :key="idx" class="flex items-start gap-2 text-[12px] text-slate-600">
                            <span class="text-slate-400 mt-0.5">•</span>
                            <div><span class="font-bold text-slate-700">{{ item.label }}</span>：{{ item.desc }}</div>
                          </div>
                        </div>
                      </div>

                      <!-- 生成前方案检查 -->
                      <div v-if="msg.preCheck" class="mb-3">
                        <div class="text-sm font-bold text-slate-800 mb-2">生成前方案检查完成：</div>
                        <div class="space-y-1">
                          <div v-for="(item, idx) in msg.preCheck" :key="idx" class="flex items-start gap-2 text-[12px] text-slate-600">
                            <span class="text-slate-400 mt-0.5">•</span>
                            <div><span class="font-bold text-slate-700">{{ item.label }}</span>：{{ item.desc }}</div>
                          </div>
                        </div>
                      </div>

                      <!-- 问题卡片 / 确认卡片 -->
                      <div v-if="msg.question" class="mt-3 bg-white rounded-2xl border border-slate-200 overflow-hidden max-w-lg">
                        <div class="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                          <span class="text-xs font-bold text-slate-700">{{ msg.question.title }}</span>
                          <div class="flex items-center gap-2">
                            <span v-if="msg.question.submitted" class="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold">已提交</span>
                            <div class="flex items-center gap-1">
                              <button class="w-5 h-5 rounded hover:bg-slate-100 flex items-center justify-center text-slate-400"><el-icon :size="11"><ArrowLeft /></el-icon></button>
                              <span class="text-[10px] text-slate-500">{{ msg.question.page || 1 }}/{{ msg.question.total || 2 }}</span>
                              <button class="w-5 h-5 rounded hover:bg-slate-100 flex items-center justify-center text-slate-400"><el-icon :size="11"><ArrowRight /></el-icon></button>
                            </div>
                          </div>
                        </div>
                        <div class="p-3 space-y-2">
                          <div v-for="(opt, idx) in msg.question.options" :key="opt.id"
                               @click="handleOptionClick(msg, opt)"
                               :class="['p-3 rounded-xl border cursor-pointer transition-all', opt.selected ? 'border-slate-300 bg-slate-50' : 'border-slate-100 hover:border-slate-200']">
                            <div class="flex items-center gap-2">
                              <span class="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 flex-shrink-0">{{ idx + 1 }}</span>
                              <span class="text-xs font-bold text-slate-800">{{ opt.label }}</span>
                            </div>
                            <p class="text-[11px] text-slate-500 mt-1 ml-7">{{ opt.desc }}</p>
                          </div>
                        </div>
                      </div>

                      <!-- 发送产物 -->
                      <div v-if="msg.deliverables && msg.deliverables.length" class="mt-3">
                        <div class="flex items-center gap-1.5 text-[11px] text-slate-500 mb-2 cursor-pointer" @click="msg.showDeliverables = !msg.showDeliverables">
                          <el-icon :size="11" :class="msg.showDeliverables !== false ? 'rotate-90' : ''"><ArrowRight /></el-icon>
                          <span class="font-bold">发送产物</span>
                        </div>
                        <div v-show="msg.showDeliverables !== false" class="space-y-2">
                          <div v-for="d in msg.deliverables" :key="d.id" class="flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 border border-slate-200 hover:border-indigo-300 cursor-pointer max-w-md">
                            <div class="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                              <el-icon :size="18" class="text-blue-500"><Document /></el-icon>
                            </div>
                            <div class="flex-1 min-w-0">
                              <div class="text-xs font-bold text-slate-800 truncate">{{ d.name }}</div>
                              <div class="text-[10px] text-slate-400 truncate">{{ d.path }}</div>
                            </div>
                            <button class="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold flex-shrink-0">查看文件<el-icon :size="10" class="ml-0.5"><ArrowRight /></el-icon></button>
                          </div>
                        </div>
                      </div>

                      <!-- 生成视频任务 -->
                      <div v-if="msg.videoTask" class="mt-3 bg-white rounded-xl border border-slate-200 p-3 max-w-md">
                        <div class="flex items-center gap-2">
                          <el-icon :size="14" :class="msg.videoTask.status === 'running' ? 'text-orange-500 animate-spin' : 'text-emerald-500'">
                            <Loading v-if="msg.videoTask.status === 'running'" /><Check v-else />
                          </el-icon>
                          <span class="text-xs font-bold text-slate-700">生成视频</span>
                          <span class="text-[10px] text-slate-400">时长：{{ msg.videoTask.duration }}</span>
                          <span class="text-[10px] text-slate-400">比例：{{ msg.videoTask.ratio }}</span>
                        </div>
                        <div class="text-[11px] text-slate-500 mt-1.5 ml-6">{{ msg.videoTask.title }}</div>
                        <div v-if="msg.videoTask.status === 'running'" class="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse" style="width: 60%"></div>
                        </div>
                      </div>
                    </template>
                    <div class="text-[10px] text-slate-400 mt-2">{{ formatTime(msg.timestamp) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部输入区（始终可见） -->
          <div class="flex-shrink-0 px-6 pb-3 pt-2 bg-transparent">
            <div class="max-w-3xl mx-auto">
              <div class="flex items-center justify-center gap-2 mb-2">
                <button class="w-6 h-6 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400"><el-icon :size="14"><ArrowDown /></el-icon></button>
                <span class="text-[11px] text-slate-400 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  Seedance 2.0 Fast VIP · 720P
                </span>
              </div>
              <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <textarea v-model="store.chatInput" rows="2" placeholder="与综合助手对话，支持多种能力..." class="w-full resize-none border-0 outline-none text-sm text-slate-700 placeholder-slate-400 px-4 py-3 leading-relaxed" @keydown.enter.exact.prevent="sendMessage"></textarea>
                <div class="flex items-center justify-between px-3 py-2 border-t border-slate-100">
                  <div class="flex items-center gap-1">
                    <button class="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"><el-icon :size="15"><Plus /></el-icon></button>
                    <button class="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-100 text-slate-500 text-[11px] font-bold"><el-icon :size="12"><Setting /></el-icon>自定义模型</button>
                    <button class="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-100 text-slate-500 text-[11px] font-bold">创作偏好<el-icon :size="11"><ArrowDown /></el-icon></button>
                    <button class="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-100 text-slate-500 text-[11px] font-bold"><el-icon :size="12"><MagicStick /></el-icon>技能</button>
                  </div>
                  <button @click="sendMessage" :disabled="!store.chatInput.trim() || store.isSending" :class="['w-8 h-8 rounded-full flex items-center justify-center transition-all', store.chatInput.trim() && !store.isSending ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-300']"><el-icon :size="15" class="rotate-[-45deg]"><Top /></el-icon></button>
                </div>
              </div>
              <div class="text-center text-[10px] text-slate-400 mt-2">AI可能会犯错，内容仅供参考，请核查重要信息。</div>
            </div>
          </div>
        </div>

        <!-- 右侧资源面板 -->
        <div v-if="store.showResourcePanel" class="w-72 flex-shrink-0 bg-white border-l border-slate-200 flex flex-col overflow-hidden">
          <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 class="text-sm font-bold text-slate-800">资源</h3>
            <div class="flex items-center gap-1">
              <button class="w-6 h-6 rounded hover:bg-slate-100 flex items-center justify-center text-slate-400"><el-icon :size="13"><Grid /></el-icon></button>
              <button class="w-6 h-6 rounded hover:bg-slate-100 flex items-center justify-center text-slate-400"><el-icon :size="13"><List /></el-icon></button>
            </div>
          </div>
          <div class="px-3 py-2 border-b border-slate-100">
            <el-input v-model="resourceSearch" placeholder="查找..." size="small" :prefix-icon="Search" clearable />
          </div>
          <div class="flex-1 overflow-y-auto p-3 custom-scrollbar">
            <div class="mb-5">
              <div class="text-[11px] font-bold text-slate-500 mb-2">文稿 共{{ docResources.length }}个</div>
              <div class="grid grid-cols-3 gap-2">
                <div v-for="r in docResources" :key="r.id" class="cursor-pointer group">
                  <div class="aspect-[3/4] rounded-lg bg-slate-50 border border-slate-200 p-1.5 flex flex-col relative overflow-hidden">
                    <span class="absolute top-1 left-1 text-[8px] font-bold text-indigo-600 bg-indigo-50 px-1 rounded">MD</span>
                    <div class="flex-1 flex flex-col gap-0.5 mt-3">
                      <div class="h-1 w-3/4 bg-slate-200 rounded"></div>
                      <div class="h-1 w-full bg-slate-200/60 rounded"></div>
                      <div class="h-1 w-5/6 bg-slate-200/60 rounded"></div>
                      <div class="h-1 w-2/3 bg-slate-200/40 rounded"></div>
                    </div>
                  </div>
                  <div class="text-[10px] font-bold text-slate-700 truncate mt-1">{{ r.name }}</div>
                  <div class="text-[9px] text-slate-400">文稿·{{ r.time }}</div>
                </div>
              </div>
            </div>
            <div class="mb-5">
              <div class="text-[11px] font-bold text-slate-500 mb-2">图片 共{{ imageResources.length }}个</div>
              <div class="grid grid-cols-2 gap-2">
                <div v-for="r in imageResources" :key="r.id" class="cursor-pointer group">
                  <div class="aspect-square rounded-lg overflow-hidden relative" :style="{ background: r.name.includes('character') ? 'linear-gradient(135deg,#e0e7ff,#c7d2fe)' : 'linear-gradient(135deg,#fef3c7,#fde68a)' }">
                    <span class="absolute top-1 left-1 text-[8px] font-bold text-white bg-black/40 px-1 rounded">{{ r.ext?.toUpperCase() || 'JPG' }}</span>
                    <div class="w-full h-full flex items-center justify-center text-3xl opacity-60">{{ r.name.includes('character') ? '👩' : '🍎' }}</div>
                  </div>
                  <div class="text-[10px] font-bold text-slate-700 truncate mt-1">{{ r.name }}</div>
                  <div class="text-[9px] text-slate-400">{{ r.time }}</div>
                </div>
              </div>
            </div>
            <div v-if="videoResources.length" class="mb-5">
              <div class="text-[11px] font-bold text-slate-500 mb-2">视频 共{{ videoResources.length }}个</div>
              <div class="space-y-2">
                <div v-for="r in videoResources" :key="r.id" class="cursor-pointer group">
                  <div class="aspect-video rounded-lg overflow-hidden relative" :style="{ background: r.gradient || 'linear-gradient(135deg,#1a1a2e,#16213e)' }">
                    <span class="absolute top-1 left-1 text-[8px] font-bold text-white bg-black/50 px-1.5 py-0.5 rounded">{{ r.ext?.toUpperCase() || 'MP4' }}</span>
                    <div class="w-full h-full flex items-center justify-center">
                      <div class="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-all">
                        <el-icon :size="16" class="text-white ml-0.5"><VideoPlay /></el-icon>
                      </div>
                    </div>
                    <span class="absolute bottom-1 right-1 text-[9px] font-bold text-white bg-black/50 px-1.5 py-0.5 rounded">{{ r.duration || '0:04' }}</span>
                  </div>
                  <div class="text-[10px] font-bold text-slate-700 truncate mt-1">{{ r.name }}</div>
                  <div class="text-[9px] text-slate-400">视频·{{ r.time }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ===== 初始模式 ===== -->
    <template v-else>
      <div class="flex-1 overflow-y-auto relative">
        <div class="max-w-5xl mx-auto px-6 py-10 pb-20">
          <div class="text-center mb-8">
            <h1 class="text-5xl font-bold text-slate-800 mb-3" style="font-family: Georgia, 'Times New Roman', serif;">营销Agent</h1>
            <p class="text-sm text-slate-500">多种创意类型、Hook 与风格随取随用，让每次生成都从创意出发</p>
          </div>

          <div class="bg-white rounded-3xl shadow-sm border border-slate-200/60 mb-5 relative">
            <div class="flex items-start gap-4 p-5 pb-0">
              <div v-if="showProductCard" class="relative group">
                <div @click="openPicker('product')" class="w-24 h-28 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-300 transition-all">
                  <span class="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 bg-slate-800 text-white rounded-full">商品</span>
                  <el-icon :size="22" class="text-slate-300 group-hover:text-indigo-400 transition-colors"><Plus /></el-icon>
                </div>
                <button v-if="selectedProduct" @click.stop="selectedProduct = null; showProductCard = false" class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 shadow-sm"><el-icon :size="11"><Close /></el-icon></button>
              </div>
              <div v-if="showCharacterCard" class="relative group">
                <div @click="openPicker('character')" class="w-24 h-28 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-300 transition-all">
                  <span class="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 bg-slate-800 text-white rounded-full">角色</span>
                  <el-icon :size="22" class="text-slate-300 group-hover:text-indigo-400 transition-colors"><Plus /></el-icon>
                </div>
                <button v-if="selectedCharacter" @click.stop="selectedCharacter = null; showCharacterCard = false" class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 shadow-sm"><el-icon :size="11"><Close /></el-icon></button>
              </div>
              <div class="flex gap-2 pt-1">
                <button v-if="!showProductCard" @click="showProductCard = true" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-indigo-100 flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-all"><el-icon :size="14"><Plus /></el-icon></button>
                <button v-if="!showCharacterCard" @click="showCharacterCard = true" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-indigo-100 flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-all"><el-icon :size="14"><Plus /></el-icon></button>
              </div>
              <div class="flex-1 pt-1.5">
                <textarea v-model="mainInput" rows="3" placeholder="添加商品，写下核心卖点或创意方向，让 Agent 为你补全生成方案" class="w-full resize-none border-0 outline-none text-sm text-slate-700 placeholder-slate-400 bg-transparent leading-relaxed"></textarea>
              </div>
            </div>

            <div class="flex items-center justify-between px-5 py-3 mt-2 relative">
              <div class="flex items-center gap-1">
                <button class="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"><el-icon :size="15"><Plus /></el-icon></button>
                <button class="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"><el-icon :size="14"><Link /></el-icon></button>
                <div class="w-px h-4 bg-slate-200 mx-1"></div>
                <button @click.stop="toggleDropdown('skill')" :class="['flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border', activeDropdown === 'skill' ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300']"><el-icon :size="12"><MagicStick /></el-icon>技能<el-icon :size="10"><ArrowDown /></el-icon></button>
                <button @click.stop="toggleDropdown('creative')" :class="['flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border', activeDropdown === 'creative' ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300']">创意<el-icon :size="10"><ArrowDown /></el-icon></button>
                <button @click.stop="toggleDropdown('hook')" :class="['flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border', activeDropdown === 'hook' ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300']">Hook<el-icon :size="10"><ArrowDown /></el-icon></button>
                <button @click.stop="toggleDropdown('style')" :class="['flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border', activeDropdown === 'style' ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300']">风格<el-icon :size="10"><ArrowDown /></el-icon></button>
                <button @click.stop="toggleDropdown('model')" :class="['flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border', activeDropdown === 'model' ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300']"><el-icon :size="12"><Monitor /></el-icon>智能匹配模型<el-icon :size="10"><ArrowDown /></el-icon></button>
                <button @click.stop="toggleDropdown('preference')" :class="['flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border', activeDropdown === 'preference' ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300']">创作偏好<el-icon :size="10"><ArrowDown /></el-icon></button>
              </div>
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-1.5"><span class="text-[11px] text-slate-400">画布</span><el-switch v-model="canvasMode" size="small" /></div>
                <button @click="startChat" :disabled="!mainInput.trim()" :class="['w-9 h-9 rounded-full flex items-center justify-center transition-all', mainInput.trim() ? 'bg-slate-800 text-white hover:bg-slate-700 shadow-md' : 'bg-slate-100 text-slate-300']"><el-icon :size="16" class="rotate-[-45deg]"><Top /></el-icon></button>
              </div>

              <div v-if="activeDropdown" @click.stop class="absolute left-5 right-5 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden" style="max-height: 420px;">
                <div v-if="activeDropdown === 'skill'" class="flex">
                  <div class="w-36 flex-shrink-0 border-r border-slate-100 py-3">
                    <div class="px-3 pb-2"><el-input v-model="searchSkill" placeholder="搜索技能" size="small" :prefix-icon="Search" clearable /></div>
                    <div class="space-y-0.5">
                      <div v-for="cat in skillCategories" :key="cat" @click="skillCategory = cat" :class="['px-4 py-2 text-xs cursor-pointer transition-all flex items-center gap-2', skillCategory === cat ? 'bg-slate-100 text-slate-800 font-bold' : 'text-slate-500 hover:bg-slate-50']"><el-icon v-if="skillCategory === cat" :size="12" class="text-indigo-500"><Check /></el-icon><span v-else class="w-3"></span>{{ cat }}</div>
                    </div>
                  </div>
                  <div class="flex-1 flex">
                    <div class="w-56 flex-shrink-0 border-r border-slate-100 p-3 overflow-y-auto">
                      <div v-for="skill in filteredSkills" :key="skill.id" @click="selectedSkill = skill" :class="['p-2.5 rounded-xl cursor-pointer transition-all mb-1.5', selectedSkill?.id === skill.id ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-slate-50 border border-transparent']">
                        <div class="text-xs font-bold text-slate-800">{{ skill.name }}</div>
                        <div class="text-[10px] text-slate-400 mt-0.5">{{ skill.models }}</div>
                      </div>
                    </div>
                    <div class="flex-1 p-4 flex flex-col">
                      <div v-if="selectedSkill" class="flex-1">
                        <div class="aspect-video rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 mb-3 flex items-center justify-center relative overflow-hidden">
                          <span class="text-white text-4xl opacity-30">🎬</span>
                          <el-icon class="absolute top-2 right-2 text-white/60" :size="16"><Star /></el-icon>
                        </div>
                        <div class="text-xs font-bold text-slate-700 mb-1">{{ selectedSkill.models }}</div>
                        <p class="text-[11px] text-slate-500 leading-relaxed">{{ selectedSkill.desc }}</p>
                        <div class="flex gap-1.5 mt-3"><span v-for="t in selectedSkill.tags" :key="t" class="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">{{ t }}</span></div>
                        <button class="mt-3 w-full py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1">详情<el-icon :size="12"><ArrowRight /></el-icon></button>
                      </div>
                      <div class="flex justify-end pt-2 border-t border-slate-100 mt-2"><button class="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600">创建技能<el-icon :size="12"><Setting /></el-icon></button></div>
                    </div>
                  </div>
                  <div class="absolute top-3 right-4"><button class="text-xs text-slate-500 hover:text-indigo-600 font-bold flex items-center gap-0.5">全部<el-icon :size="11"><ArrowRight /></el-icon></button></div>
                </div>

                <div v-else-if="activeDropdown === 'creative' || activeDropdown === 'hook' || activeDropdown === 'style'" class="flex h-full">
                  <div class="w-36 flex-shrink-0 border-r border-slate-100 py-3">
                    <div class="px-3 pb-2"><el-input v-model="searchText" :placeholder="'搜索' + dropdownLabel" size="small" :prefix-icon="Search" clearable /></div>
                    <div class="space-y-0.5">
                      <div v-for="cat in currentCategories" :key="cat" @click="currentCategory = cat" :class="['px-4 py-2 text-xs cursor-pointer transition-all', currentCategory === cat ? 'bg-slate-100 text-slate-800 font-bold' : 'text-slate-500 hover:bg-slate-50']">{{ cat }}</div>
                    </div>
                  </div>
                  <div class="flex-1 p-4 overflow-y-auto">
                    <div class="grid grid-cols-3 gap-3">
                      <div v-for="item in filteredItems" :key="item.id" @click="selectItem(item)" class="group cursor-pointer">
                        <div class="aspect-[3/4] rounded-xl overflow-hidden relative mb-2" :style="{ background: item.gradient }">
                          <el-icon class="absolute top-2 right-2 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity" :size="14"><Star /></el-icon>
                        </div>
                        <div class="text-xs font-bold text-slate-700 truncate">{{ item.name }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="absolute top-3 right-4"><button class="text-xs text-slate-500 hover:text-indigo-600 font-bold flex items-center gap-0.5">全部<el-icon :size="11"><ArrowRight /></el-icon></button></div>
                </div>

                <div v-else-if="activeDropdown === 'model'" class="flex">
                  <div class="w-64 flex-shrink-0 border-r border-slate-100 p-4">
                    <div class="flex gap-1 mb-4">
                      <button @click="modelTab = 'video'" :class="['px-3 py-1.5 rounded-lg text-xs font-bold transition-all', modelTab === 'video' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100']">视频偏好</button>
                      <button @click="modelTab = 'image'" :class="['px-3 py-1.5 rounded-lg text-xs font-bold transition-all', modelTab === 'image' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100']">图片偏好</button>
                    </div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">模型选择</div>
                    <div class="space-y-1">
                      <div v-for="m in currentModels" :key="m.id" @click="selectedModel = m.id" :class="['p-2.5 rounded-xl cursor-pointer transition-all', selectedModel === m.id ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-slate-50 border border-transparent']">
                        <div class="flex items-center gap-2">
                          <el-icon v-if="selectedModel === m.id" :size="13" class="text-indigo-500"><Check /></el-icon>
                          <span class="text-xs font-bold text-slate-800">{{ m.name }}</span>
                          <span v-if="m.badge" :class="['text-[9px] px-1.5 py-0.5 rounded font-bold', m.badge === '限时优惠' ? 'bg-purple-100 text-purple-600' : 'bg-amber-100 text-amber-600']">{{ m.badge }}</span>
                          <span v-if="m.new" class="text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-600 rounded font-bold">NEW</span>
                        </div>
                        <p class="text-[10px] text-slate-400 mt-1 ml-5">{{ m.desc }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="flex-1 p-5">
                    <div class="mb-5">
                      <div class="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">画面比例 <el-icon :size="11" class="text-slate-400"><QuestionFilled /></el-icon></div>
                      <div class="flex gap-2">
                        <button v-for="r in ratios" :key="r.value" @click="selectedRatio = r.value" :class="['flex-1 py-2 rounded-xl border-2 text-xs font-bold transition-all flex flex-col items-center gap-1', selectedRatio === r.value ? 'border-slate-800 bg-slate-50' : 'border-slate-200 text-slate-500 hover:border-slate-300']">
                          <div :class="['border-2 rounded-sm', selectedRatio === r.value ? 'border-slate-800' : 'border-slate-300']" :style="{ width: r.iconW + 'px', height: r.iconH + 'px' }"></div>
                          {{ r.label }}
                        </button>
                      </div>
                    </div>
                    <div class="mb-5" v-if="modelTab === 'video'">
                      <div class="text-xs font-bold text-slate-700 mb-2">视频分辨率</div>
                      <div class="flex gap-2">
                        <button v-for="r in resolutions" :key="r" @click="selectedResolution = r" :class="['flex-1 py-2 rounded-xl border-2 text-xs font-bold transition-all', selectedResolution === r ? 'border-slate-800 bg-slate-50 text-slate-800' : 'border-slate-200 text-slate-500 hover:border-slate-300']">{{ r }}</button>
                      </div>
                    </div>
                    <div class="mb-5" v-else>
                      <div class="text-xs font-bold text-slate-700 mb-2">图片分辨率</div>
                      <div class="flex gap-2">
                        <button v-for="r in imageResolutions" :key="r" @click="selectedImageResolution = r" :class="['flex-1 py-2 rounded-xl border-2 text-xs font-bold transition-all', selectedImageResolution === r ? 'border-slate-800 bg-slate-50 text-slate-800' : 'border-slate-200 text-slate-500 hover:border-slate-300']">{{ r }}</button>
                      </div>
                    </div>
                    <div v-if="modelTab === 'video'">
                      <div class="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">时长 <el-icon :size="11" class="text-slate-400"><QuestionFilled /></el-icon></div>
                      <div class="flex gap-2">
                        <button @click="durationMode = 'auto'" :class="['flex-1 py-2.5 rounded-xl border-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5', durationMode === 'auto' ? 'border-slate-800 bg-slate-50 text-slate-800' : 'border-slate-200 text-slate-500 hover:border-slate-300']"><el-icon :size="12"><MagicStick /></el-icon>智能时长</button>
                        <button @click="durationMode = 'custom'" :class="['flex-1 py-2.5 rounded-xl border-2 text-xs font-bold transition-all', durationMode === 'custom' ? 'border-slate-800 bg-slate-50 text-slate-800' : 'border-slate-200 text-slate-500 hover:border-slate-300']">自定义时长</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else-if="activeDropdown === 'preference'" class="p-5">
                  <div class="text-xs font-bold text-slate-700 mb-3">创作偏好设置</div>
                  <div class="grid grid-cols-2 gap-4">
                    <div><div class="text-[11px] text-slate-500 mb-1.5">字幕风格</div><el-select v-model="prefSubtitle" size="small" class="w-full"><el-option label="底部居中" value="bottom" /><el-option label="顶部居中" value="top" /><el-option label="弹幕式" value="danmaku" /></el-select></div>
                    <div><div class="text-[11px] text-slate-500 mb-1.5">BGM风格</div><el-select v-model="prefBgm" size="small" class="w-full"><el-option label="动感电子" value="electronic" /><el-option label="温暖钢琴" value="piano" /><el-option label="轻快流行" value="pop" /><el-option label="紧张鼓点" value="drum" /></el-select></div>
                    <div><div class="text-[11px] text-slate-500 mb-1.5">语速</div><el-select v-model="prefSpeed" size="small" class="w-full"><el-option label="慢速" value="slow" /><el-option label="中速" value="normal" /><el-option label="快速" value="fast" /></el-select></div>
                    <div><div class="text-[11px] text-slate-500 mb-1.5">色调</div><el-select v-model="prefTone" size="small" class="w-full"><el-option label="暖色调" value="warm" /><el-option label="冷色调" value="cold" /><el-option label="高饱和" value="saturated" /><el-option label="电影感" value="cinematic" /></el-select></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap justify-center gap-2.5 mb-8">
            <button v-for="tag in quickTags" :key="tag.label" @click="useQuickTag(tag)" class="flex items-center gap-1.5 px-3.5 py-1.5 bg-white rounded-full border border-slate-200 text-xs text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm transition-all">
              <span>{{ tag.icon }}</span>{{ tag.label }}
            </button>
          </div>

          <div class="mb-5">
            <div class="flex items-center gap-1 overflow-x-auto pb-1">
              <button v-for="cat in templateCategories" :key="cat" @click="store.setTemplateCategory(cat)" :class="['px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all', store.selectedTemplateCategory === cat ? 'text-slate-800 border-b-2 border-slate-800 rounded-none' : 'text-slate-500 hover:text-slate-700']">{{ cat }}</button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div v-for="work in filteredWorks" :key="work.id" @click="useTemplate(work)" class="bg-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100">
              <div class="flex h-36">
                <div v-for="(img, idx) in work.images" :key="idx" class="flex-1 overflow-hidden" :style="{ background: img, borderRight: idx < 2 ? '1px solid white' : 'none' }"></div>
              </div>
              <div class="p-3">
                <div class="text-sm font-bold text-slate-800 truncate">{{ work.title }}</div>
                <div class="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{{ work.desc }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ===== 商品选择弹窗 ===== -->
    <el-dialog v-model="pickerVisible" :title="pickerType === 'product' ? '商品' : '角色'" width="700px" :close-on-click-modal="false" class="picker-dialog" align-center>
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-base font-bold text-slate-800">{{ pickerType === 'product' ? '商品' : '角色' }}</span>
          <div class="flex items-center gap-3">
            <template v-if="pickerType === 'character'">
              <button @click="charTab = 'my'" :class="['px-3 py-1 rounded-full text-xs font-bold transition-all', charTab === 'my' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50']">我的</button>
              <button @click="charTab = 'marketing'" :class="['px-3 py-1 rounded-full text-xs font-bold transition-all', charTab === 'marketing' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50']">营销角色</button>
            </template>
            <div class="flex items-center gap-2">
              <button class="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50">排序<el-icon :size="11"><ArrowDown /></el-icon></button>
              <div class="w-px h-4 bg-slate-200"></div>
              <button class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-50 font-bold"><el-icon :size="13"><Plus /></el-icon>新增</button>
            </div>
          </div>
        </div>
      </template>
      <div class="py-4" style="min-height: 320px;">
        <div v-if="pickerType === 'product'" class="grid grid-cols-4 gap-4">
          <div v-for="p in products" :key="p.id" @click="tempSelected = p.id" :class="['cursor-pointer rounded-xl overflow-hidden border-2 transition-all', tempSelected === p.id ? 'border-indigo-500' : 'border-transparent hover:border-slate-200']">
            <div class="aspect-square rounded-xl overflow-hidden" :style="{ background: p.gradient }">
              <div class="w-full h-full flex items-center justify-center text-4xl">{{ p.emoji }}</div>
            </div>
            <div class="text-xs font-bold text-slate-700 mt-2 text-center">{{ p.name }}</div>
          </div>
        </div>
        <div v-else class="grid grid-cols-6 gap-3">
          <div v-for="c in filteredCharacters" :key="c.id" @click="tempSelected = c.id" :class="['cursor-pointer rounded-xl overflow-hidden border-2 transition-all', tempSelected === c.id ? 'border-indigo-500' : 'border-transparent hover:border-slate-200']">
            <div class="aspect-[3/4] rounded-xl overflow-hidden relative" :style="{ background: c.gradient }">
              <div class="w-full h-full flex items-center justify-center text-3xl">{{ c.gender === 'female' ? '👩' : '👨' }}</div>
              <div v-if="c.featured" class="absolute top-1.5 left-1.5 w-3.5 h-3.5 bg-red-500 rounded-sm"></div>
            </div>
            <div class="text-xs font-bold text-slate-700 mt-1.5 text-center">{{ c.name }}</div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button @click="pickerVisible = false" class="px-5 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 font-bold">取消</button>
          <button @click="confirmPicker" class="px-5 py-2 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700">添加</button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Comment, Document, FullScreen, Refresh, Plus, Close, ArrowDown, ArrowLeft, ArrowRight, Check, Top, Setting, MagicStick, Monitor, Link, Collection, List, Search, Star, QuestionFilled, Share, Grid, Folder, Loading, VideoPlay } from '@element-plus/icons-vue';
import { useMarketingStore, type ChatMessage } from '../../store/marketing';

const store = useMarketingStore();

const mainInput = ref('');
const canvasMode = ref(false);
const showProductCard = ref(true);
const showCharacterCard = ref(true);
const selectedProduct = ref<any>(null);
const selectedCharacter = ref<any>(null);
const resourceSearch = ref('');
const chatContainer = ref<HTMLElement>();

const activeDropdown = ref<string | null>(null);
const searchSkill = ref('');
const skillCategory = ref('全部');
const selectedSkill = ref<any>(null);
const searchText = ref('');
const currentCategory = ref('全部分类');
const modelTab = ref<'video' | 'image'>('video');
const selectedModel = ref('auto');
const selectedRatio = ref('9:16');
const selectedResolution = ref('720P');
const selectedImageResolution = ref('2K');
const durationMode = ref<'auto' | 'custom'>('auto');
const prefSubtitle = ref('bottom');
const prefBgm = ref('electronic');
const prefSpeed = ref('normal');
const prefTone = ref('cinematic');

const pickerVisible = ref(false);
const pickerType = ref<'product' | 'character'>('product');
const tempSelected = ref<string | null>(null);
const charTab = ref<'my' | 'marketing'>('marketing');

const quickTags = [
  { icon: '🎬', label: '视频翻译' }, { icon: '📦', label: '批量生成' },
  { icon: '🔥', label: '每日热点趋势' }, { icon: '📈', label: '生意增长顾问' },
  { icon: '💥', label: '爆款素材裂变' }
];

const templateCategories = ['全部', '剧情广告', '抖音爆款', '跨境电商', '达人口播', 'MiniMax H3', 'Seedance 2.5', '开箱试用', '品牌TVC', 'AI炫酷视觉'];

const templateWorks = [
  { id: 1, title: '甜宠短剧带货', desc: '用甜宠关系、暧昧拉扯和情绪反转，让商品成...', category: '剧情广告', images: ['linear-gradient(135deg,#1a1a2e,#16213e)', 'linear-gradient(135deg,#e94560,#533483)', 'linear-gradient(135deg,#0f3460,#1a1a2e)'] },
  { id: 2, title: '水果人短剧广告', desc: '通过AI将商品、口味、颜色、原料或SKU拟人...', category: '剧情广告', images: ['linear-gradient(135deg,#ff6b6b,#ee5a24)', 'linear-gradient(135deg,#f368e0,#be2edd)', 'linear-gradient(135deg,#f9ca24,#f0932b)'] },
  { id: 3, title: '达人开箱逛买', desc: '用达人试穿、开箱或购物分享的节奏，制造丰...', category: '开箱试用', images: ['linear-gradient(135deg,#dfe6e9,#b2bec3)', 'linear-gradient(135deg,#fdcb6e,#e17055)', 'linear-gradient(135deg,#fab1a0,#e17055)'] },
  { id: 4, title: '达人口播种草', desc: '达人对镜真心分享，朋友式安利可信度高', category: '达人口播', images: ['linear-gradient(135deg,#a29bfe,#6c5ce7)', 'linear-gradient(135deg,#fd79a8,#e84393)', 'linear-gradient(135deg,#81ecec,#00cec9)'] },
  { id: 5, title: '抖音爆款带货', desc: '黄金3秒钩子+快节奏剪辑+价格冲击', category: '抖音爆款', images: ['linear-gradient(135deg,#2d3436,#636e72)', 'linear-gradient(135deg,#e17055,#d63031)', 'linear-gradient(135deg,#fdcb6e,#e17055)'] },
  { id: 6, title: '跨境电商展示', desc: '多语言适配+全球化视觉+产品功能拆解', category: '跨境电商', images: ['linear-gradient(135deg,#74b9ff,#0984e3)', 'linear-gradient(135deg,#81ecec,#00cec9)', 'linear-gradient(135deg,#a29bfe,#6c5ce7)'] },
  { id: 7, title: '品牌TVC大片', desc: '电影级质感+品牌叙事+情感升华', category: '品牌TVC', images: ['linear-gradient(135deg,#2d3436,#000000)', 'linear-gradient(135deg,#636e72,#2d3436)', 'linear-gradient(135deg,#b2bec3,#636e72)'] },
  { id: 8, title: 'AI炫酷视觉', desc: '赛博朋克+未来感+特效转场', category: 'AI炫酷视觉', images: ['linear-gradient(135deg,#6c5ce7,#a29bfe)', 'linear-gradient(135deg,#fd79a8,#e84393)', 'linear-gradient(135deg,#00cec9,#0984e3)'] }
];

const skillCategories = ['全部', '我的', '收藏', '营销视频', '跨境电商', '营销小工具', '投放与增长', '营销洞察'];
const skillList = [
  { id: 's1', name: '反转短剧带货视频', models: 'SD 2.0 Fast VIP · Seedream 5.0', desc: '为商品生成一支狗血反差和强反转爽点的短剧风格带货视频。', tags: ['视频', '营销视频'], category: '营销视频' },
  { id: 's2', name: '营销视频', models: 'SD 2.0 Fast VIP · Seedream 5.0', desc: '通用营销视频生成技能，支持多场景适配。', tags: ['视频', '营销视频'], category: '营销视频' },
  { id: 's3', name: '达人带货', models: 'SD 2.0 Fast VIP · Seedream 5.0', desc: '达人口播风格带货视频生成。', tags: ['视频', '达人口播'], category: '营销视频' },
  { id: 's4', name: '品牌大片', models: 'SD 2.0 Fast VIP · Seedream 5.0', desc: '品牌级高质量宣传片生成。', tags: ['视频', '品牌TVC'], category: '营销视频' },
  { id: 's5', name: '视频局部精修', models: 'SD 2.5 · Seedream 5.0 Pro', desc: '对已生成视频进行局部修改和精修。', tags: ['视频', '工具'], category: '营销小工具' }
];

const creativeCategories = ['全部分类', '剧情广告', '抖音爆款', '跨境电商', '达人口播', 'MiniMax H3', 'Seedance 2.5', '开箱试用'];
const creativeItems = [
  { id: 'c1', name: '甜宠短剧带货', category: '剧情广告', gradient: 'linear-gradient(135deg,#1a1a2e,#e94560)' },
  { id: 'c2', name: '水果人短剧广告', category: '剧情广告', gradient: 'linear-gradient(135deg,#ff6b6b,#f9ca24)' },
  { id: 'c3', name: '达人开箱逛买', category: '开箱试用', gradient: 'linear-gradient(135deg,#dfe6e9,#fdcb6e)' },
  { id: 'c4', name: '抖音爆款带货', category: '抖音爆款', gradient: 'linear-gradient(135deg,#2d3436,#e17055)' },
  { id: 'c5', name: '跨境电商展示', category: '跨境电商', gradient: 'linear-gradient(135deg,#74b9ff,#00cec9)' },
  { id: 'c6', name: '达人口播种草', category: '达人口播', gradient: 'linear-gradient(135deg,#a29bfe,#fd79a8)' }
];

const hookCategories = ['全部分类', '画面吸睛', '爆款脚本', '口播留人', '抓耳音效', '花式特效'];
const hookItems = [
  { id: 'h1', name: '巨物产品飞入', category: '画面吸睛', gradient: 'linear-gradient(135deg,#dfe6e9,#b2bec3)' },
  { id: 'h2', name: '巨物产品互动', category: '画面吸睛', gradient: 'linear-gradient(135deg,#636e72,#2d3436)' },
  { id: 'h3', name: '高空机翼奇观', category: '画面吸睛', gradient: 'linear-gradient(135deg,#74b9ff,#0984e3)' },
  { id: 'h4', name: '快闪文字钩子', category: '爆款脚本', gradient: 'linear-gradient(135deg,#fd79a8,#e84393)' },
  { id: 'h5', name: '反问式口播', category: '口播留人', gradient: 'linear-gradient(135deg,#fdcb6e,#e17055)' },
  { id: 'h6', name: '音效反转', category: '抓耳音效', gradient: 'linear-gradient(135deg,#a29bfe,#6c5ce7)' }
];

const styleCategories = ['全部分类', '自然生活', '东方美学', '高级质感', '年轻潮流', '科技未来'];
const styleItems = [
  { id: 'st1', name: '邵氏复古喜剧风格', category: '东方美学', gradient: 'linear-gradient(135deg,#e17055,#fdcb6e)' },
  { id: 'st2', name: '户外森林自然光风格', category: '自然生活', gradient: 'linear-gradient(135deg,#00b894,#55efc4)' },
  { id: 'st3', name: '新中式东方美学风格', category: '东方美学', gradient: 'linear-gradient(135deg,#2d3436,#636e72)' },
  { id: 'st4', name: '赛博朋克未来感', category: '科技未来', gradient: 'linear-gradient(135deg,#6c5ce7,#fd79a8)' },
  { id: 'st5', name: '极简高级质感', category: '高级质感', gradient: 'linear-gradient(135deg,#b2bec3,#dfe6e9)' },
  { id: 'st6', name: 'Y2K年轻潮流', category: '年轻潮流', gradient: 'linear-gradient(135deg,#fd79a8,#fdcb6e)' }
];

const videoModels = [
  { id: 'auto', name: '智能匹配模型', desc: '当 Agent 识别到视频生成诉求时为你智能选择视频模型', badge: '', new: false },
  { id: 'sd25', name: 'Seedance 2.5', desc: '720P带参考视频4.7折，无参考7.7折', badge: '限时优惠', new: false },
  { id: 'sd20fast', name: 'Seedance 2.0 Fast VIP', desc: '极速推理，会员专属通道，积分消耗5.5折', badge: '限时优惠', new: false },
  { id: 'sd20vip', name: 'Seedance 2.0 VIP', desc: '全模态能力，会员专属通道，音视频均可参考', badge: '', new: false }
];
const imageModels = [
  { id: 'auto', name: '智能匹配模型', desc: '当 Agent 识别到图片生成诉求时为你智能选择图片模型', badge: '', new: false },
  { id: 'sd5pro', name: 'Seedream 5.0 Pro', desc: '支持交互式编辑，精准改图更可控', badge: '限次', new: true },
  { id: 'img25pro', name: '智能图片V2.5 Pro', desc: '精准生成与编辑，image 2.5水准', badge: '', new: true },
  { id: 'img25fast', name: '智能图片V2.5 Fast', desc: '高速高质量图片生成，image 2.5水准', badge: '', new: true },
  { id: 'img2', name: '智能图片V2', desc: '稳定高质量图片生成', badge: '', new: true }
];
const ratios = [
  { label: '智能', value: 'auto', iconW: 14, iconH: 10 },
  { label: '16:9', value: '16:9', iconW: 16, iconH: 9 },
  { label: '21:9', value: '21:9', iconW: 18, iconH: 8 },
  { label: '9:16', value: '9:16', iconW: 9, iconH: 16 },
  { label: '4:3', value: '4:3', iconW: 12, iconH: 9 },
  { label: '3:4', value: '3:4', iconW: 9, iconH: 12 }
];
const resolutions = ['480P', '720P', '1080P', '4K'];
const imageResolutions = ['2K', '4K'];

const products = [
  { id: 'p1', name: '苹果', emoji: '🍎', gradient: 'linear-gradient(135deg,#ffeaa7,#fab1a0)' },
  { id: 'p2', name: '流程图', emoji: '📊', gradient: 'linear-gradient(135deg,#dfe6e9,#b2bec3)' }
];
const characters = [
  { id: 'ch1', name: '许清源', gender: 'male', featured: false, gradient: 'linear-gradient(135deg,#dfe6e9,#b2bec3)' },
  { id: 'ch2', name: '林跃', gender: 'male', featured: false, gradient: 'linear-gradient(135deg,#74b9ff,#0984e3)' },
  { id: 'ch3', name: '陆廷', gender: 'male', featured: false, gradient: 'linear-gradient(135deg,#2d3436,#636e72)' },
  { id: 'ch4', name: '沈清', gender: 'female', featured: false, gradient: 'linear-gradient(135deg,#fab1a0,#e17055)' },
  { id: 'ch5', name: '苏慧', gender: 'female', featured: false, gradient: 'linear-gradient(135deg,#a29bfe,#6c5ce7)' },
  { id: 'ch6', name: '肖阳', gender: 'male', featured: false, gradient: 'linear-gradient(135deg,#81ecec,#00cec9)' },
  { id: 'ch7', name: '顾菁', gender: 'female', featured: false, gradient: 'linear-gradient(135deg,#fd79a8,#e84393)' },
  { id: 'ch8', name: '姜婉', gender: 'female', featured: false, gradient: 'linear-gradient(135deg,#fdcb6e,#e17055)' },
  { id: 'ch9', name: '严博文', gender: 'male', featured: false, gradient: 'linear-gradient(135deg,#55efc4,#00b894)' },
  { id: 'ch10', name: '岳峰', gender: 'male', featured: true, gradient: 'linear-gradient(135deg,#e17055,#d63031)' },
  { id: 'ch11', name: '梁淑', gender: 'female', featured: false, gradient: 'linear-gradient(135deg,#00cec9,#0984e3)' },
  { id: 'ch12', name: '周诚', gender: 'male', featured: false, gradient: 'linear-gradient(135deg,#ffeaa7,#fdcb6e)' }
];

const dropdownLabel = computed(() => {
  if (activeDropdown.value === 'creative') return '创意';
  if (activeDropdown.value === 'hook') return 'Hook';
  if (activeDropdown.value === 'style') return '风格';
  return '';
});
const currentCategories = computed(() => {
  if (activeDropdown.value === 'creative') return creativeCategories;
  if (activeDropdown.value === 'hook') return hookCategories;
  if (activeDropdown.value === 'style') return styleCategories;
  return [];
});
const currentItems = computed(() => {
  if (activeDropdown.value === 'creative') return creativeItems;
  if (activeDropdown.value === 'hook') return hookItems;
  if (activeDropdown.value === 'style') return styleItems;
  return [];
});
const filteredItems = computed(() => {
  let items = currentItems.value;
  if (currentCategory.value !== '全部分类') items = items.filter(i => i.category === currentCategory.value);
  if (searchText.value) items = items.filter(i => i.name.includes(searchText.value));
  return items;
});
const filteredSkills = computed(() => {
  let list = skillList;
  if (skillCategory.value !== '全部') list = list.filter(s => s.category === skillCategory.value || skillCategory.value === '我的' || skillCategory.value === '收藏');
  if (searchSkill.value) list = list.filter(s => s.name.includes(searchSkill.value));
  return list;
});
const currentModels = computed(() => modelTab.value === 'video' ? videoModels : imageModels);
const filteredWorks = computed(() => {
  if (store.selectedTemplateCategory === '全部') return templateWorks;
  return templateWorks.filter(w => w.category === store.selectedTemplateCategory);
});
const filteredCharacters = computed(() => characters);
const docResources = computed(() => store.resources.filter(r => r.type === 'doc'));
const imageResources = computed(() => store.resources.filter(r => r.type === 'image'));
const videoResources = computed(() => store.resources.filter(r => r.type === 'video'));

function toggleDropdown(type: string) {
  activeDropdown.value = activeDropdown.value === type ? null : type;
  if (activeDropdown.value) { currentCategory.value = '全部分类'; searchText.value = ''; }
}
function selectItem(item: any) { ElMessage.success(`已选择「${item.name}」`); activeDropdown.value = null; }
function useQuickTag(tag: { icon: string; label: string }) { mainInput.value = `【${tag.label}】`; }
function useTemplate(work: any) { mainInput.value = `使用「${work.title}」模板，生成一个${work.category}风格的营销视频`; ElMessage.success(`已加载「${work.title}」模板`); }
function openPicker(type: 'product' | 'character') { pickerType.value = type; tempSelected.value = null; pickerVisible.value = true; }
function confirmPicker() {
  if (!tempSelected.value) { ElMessage.warning('请先选择一个项目'); return; }
  if (pickerType.value === 'product') { selectedProduct.value = products.find(p => p.id === tempSelected.value); ElMessage.success(`已添加商品「${selectedProduct.value.name}」`); }
  else { selectedCharacter.value = characters.find(c => c.id === tempSelected.value); ElMessage.success(`已添加角色「${selectedCharacter.value.name}」`); }
  pickerVisible.value = false;
}
function formatTime(ts: number): string { const d = new Date(ts); return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; }

// ===== 一问一答多轮对话逻辑 =====
let qaRound = 0;
const aiReplies = [
  // 第1轮：分析素材 + 提问风格匹配
  {
    steps: [
      { type: '技能学习', title: '反转短剧带货视频', expanded: false, detail: '加载反转短剧带货视频技能，包含狗血反差、强反转爽点、短剧节奏等核心要素。' },
      { type: '读取文件', title: '查看用户上传的商品图片', expanded: false, detail: '商品为陕西红苹果，深红果皮、水珠、果型饱满、果柄，覆盖正面外观。' },
      { type: '技能学习', title: '营销视频大师', expanded: false, detail: '加载营销视频大师技能，包含Hook设计、节奏控制、CTA优化等。' },
      { type: '读取文件', title: '查看用户上传的角色图片', expanded: false, detail: '角色为林小鹿，东亚女性，覆盖五官、发型、妆容、服装风格、体型。' }
    ],
    content: `我已分析商品（陕西红苹果）和角色（林小鹿）的素材信息。\n\n检测到一个风格匹配问题需要确认：brief 要求使用快节奏的短剧带货风格，但上传的角色图偏清新自然风。如何处理这个冲突？`,
    question: {
      title: '风格匹配确认', submitted: true, page: 1, total: 4,
      options: [
        { id: 'keep', label: '保持现有搭配', desc: '使用上传的角色图，通过运镜和剪辑营造短剧节奏', selected: false },
        { id: 'replace', label: '调整角色风格', desc: '保留角色身份，调整妆容和服装以匹配短剧风格', selected: false },
        { id: 'custom', label: '自定义调整', desc: '以上都不合适，我想自己描述需求', selected: false }
      ]
    }
  },
  // 第2轮：执行 + 产物 + 最终确认
  {
    steps: [
      { type: '任务规划', title: '制定执行计划', expanded: false, detail: '根据用户选择，制定完整的视频生成执行计划。' },
      { type: '读取文件', title: '读取创意与分镜参考文件', expanded: false, detail: '加载Hook库、风格模板、分镜参考等素材。' },
      { type: '执行命令', title: '核算台词时长', expanded: false, detail: '剧情带货短剧类型，台词占比65%，15秒视频约9.75秒台词。' },
      { type: '写入文件', title: '创建故事脚本', expanded: false, detail: '生成4幕短剧结构：开场Hook→产品亮相→卖点拆解→行动号召。' },
      { type: '写入文件', title: '创建视频生成Prompt', expanded: false, detail: '按照Seedance 2.0规范编写视频生成提示词。' },
      { type: '任务规划', title: '生成前检查', expanded: false, detail: '完成素材盘点、卖点覆盖、空间锚定、时间轴等检查项。' }
    ],
    content: `故事脚本和视频生成Prompt已写好，先给你过目一下，这是接下来素材准备和最终生成方案的基础。`,
    materialCheck: [
      { label: '产品1（陕西红苹果）', desc: '用户上传商品图，覆盖正面外观（深红果皮、水珠、果型饱满、果柄），是唯一主锚点。' },
      { label: '主体1（林小鹿）', desc: '用户上传角色图，覆盖五官、发型、妆容、服装风格、体型。是人物身份唯一主锚点。' }
    ],
    preCheck: [
      { label: '商品尺寸台账', desc: '陕西红苹果，约掌心可单手握持的中型水果，已内联进Prompt' },
      { label: '卖点覆盖矩阵', desc: 'USP + 卖点#1(P00) + 卖点#2(P00) + 卖点#3(P0) 全部覆盖' },
      { label: '素材隔离', desc: '产品图只采用苹果外观、角色图只采用人物形象，已显式声明' },
      { label: '空间锚定', desc: '全局在场景段落一次性定住，各镜沿用' },
      { label: '时间轴', desc: '请求本地从0s起，15秒整片单次生成' },
      { label: '口播CTA', desc: '最后2秒有可听口播"Search Shaanxi red apple and grab yours today!"' }
    ],
    deliverables: [
      { id: 'd1', name: '故事脚本.md', type: 'md', path: '/workspace/video-projects/20250917-0930-...', status: 'ready' },
      { id: 'd2', name: '视频生成Prompt.md', type: 'md', path: '/workspace/video-projects/20250917-0930-...', status: 'ready' }
    ],
    question: {
      title: '最终生成方案确认', submitted: true, page: 1, total: 2,
      options: [
        { id: 'confirm', label: '确认，按此继续', desc: '按此方案生成15秒竖版视频并交付', selected: false },
        { id: 'modify', label: '需要修改', desc: '在下方说明具体改动内容，我会更新方案后重新确认', selected: false },
        { id: 'custom', label: '自定义 / 其他', desc: '以上都不合适，我想自己描述', selected: false }
      ]
    }
  },
  // 第3轮：生成视频
  {
    steps: [
      { type: '任务规划', title: '调整生成方案', expanded: false, detail: '将15秒整片拆分为分段生成，先生成第一镜（0-4秒）。' }
    ],
    content: `明白了，你希望先只生成前4秒看看效果，满意后再继续。我来调整方案，先只生成第一个分镜（0-4秒）。`,
    videoTask: { status: 'running', duration: '4秒', ratio: '9:16', title: '生成营销带货视频片段：《Shaanxi Red Apple - 开箱红绸露出苹果》' }
  },
  // 第4轮：视频完成 + 后续建议
  {
    steps: [
      { type: '任务规划', title: '视频生成完成', expanded: false, detail: '第一镜（0-4秒）已生成完毕，等待用户确认效果。' }
    ],
    content: `第一镜（0-4秒）已生成完成！效果如何？\n\n如果满意，我可以继续生成剩余分镜（4-15秒）并拼接成完整视频。如果需要调整，请告诉我具体修改方向。`,
    question: {
      title: '下一步操作', submitted: true, page: 1, total: 1,
      options: [
        { id: 'continue', label: '继续生成剩余分镜', desc: '按当前方案生成4-15秒并拼接完整视频', selected: false },
        { id: 'adjust', label: '调整当前分镜', desc: '告诉我需要修改的地方，我重新生成第一镜', selected: false },
        { id: 'restart', label: '重新开始', desc: '清空当前对话，重新输入需求', selected: false }
      ]
    }
  }
];

function addResourcesForRound(round: number) {
  if (round === 1) {
    store.addResource({ id: 'r1', name: '故事脚本.md', type: 'doc', ext: 'md', time: '1分钟前' });
    store.addResource({ id: 'r2', name: '视频生成Prompt.md', type: 'doc', ext: 'md', time: '1分钟前' });
    store.addResource({ id: 'r3', name: '营销脑图.md', type: 'doc', ext: 'md', time: '1分钟前' });
    store.addResource({ id: 'r4', name: 'character_林小鹿.jpg', type: 'image', ext: 'jpg', time: '2分钟前' });
    store.addResource({ id: 'r5', name: 'user_upload_image_1.jpeg', type: 'image', ext: 'jpeg', time: '2分钟前' });
  }
}

function playAiReply(round: number) {
  const reply = aiReplies[Math.min(round, aiReplies.length - 1)];
  const thinkingMsg: ChatMessage = { id: `msg_${Date.now()}_a_${round}`, role: 'assistant', content: '', timestamp: Date.now(), status: 'thinking' };
  store.addMessage(thinkingMsg);
  store.setSending(true);
  nextTick(() => scrollToBottom());

  setTimeout(() => {
    addResourcesForRound(round);
    const update: any = { status: 'done', ...reply };
    if (reply.question) update.question = JSON.parse(JSON.stringify(reply.question));
    store.updateMessage(thinkingMsg.id, update);
    store.setSending(false);
    nextTick(() => scrollToBottom());

    // 第3轮视频生成完成后自动推进
    if (round === 2) {
      setTimeout(() => {
        const lastMsg = store.chatMessages[store.chatMessages.length - 1];
        if (lastMsg && lastMsg.videoTask) lastMsg.videoTask.status = 'done';
        // 视频生成完成，添加到右侧资源面板
        store.addResource({
          id: 'video_' + Date.now(),
          name: 'Shaanxi_Red_Apple_第一镜.mp4',
          type: 'video',
          ext: 'mp4',
          time: '刚刚',
          duration: '0:04',
          gradient: 'linear-gradient(135deg,#e17055,#d63031)'
        });
        qaRound = 3;
        playAiReply(3);
      }, 4000);
    }
  }, 2000 + round * 500);
}

async function startChat() {
  if (!mainInput.value.trim()) { ElMessage.warning('请输入商品信息或创意方向'); return; }
  qaRound = 0;
  store.setChatMode(true);
  store.chatMessages = [];
  store.resources = [];

  const userMsg: ChatMessage = {
    id: `msg_${Date.now()}_u`,
    role: 'user', type: 'input',
    content: mainInput.value,
    skillTags: ['反转短剧带货视频', '达人开箱逛买', '邵氏复古喜剧风格'],
    timestamp: Date.now()
  };
  store.addMessage(userMsg);
  mainInput.value = '';
  await nextTick(); scrollToBottom();

  // 自动播放第1轮AI回复
  setTimeout(() => { qaRound = 1; playAiReply(0); }, 800);
}

function handleOptionClick(msg: ChatMessage, opt: any) {
  if (msg.question?.options) {
    msg.question.options.forEach(o => o.selected = false);
    opt.selected = true;
  }
  // 用户选择结果消息
  const selectionMsg: ChatMessage = {
    id: `msg_${Date.now()}_sel`, role: 'user', type: 'selection',
    content: opt.label + '：' + opt.desc, timestamp: Date.now()
  };
  store.addMessage(selectionMsg);
  nextTick(() => scrollToBottom());

  // 推进到下一轮
  const nextRound = qaRound;
  qaRound = Math.min(qaRound + 1, aiReplies.length - 1);
  setTimeout(() => playAiReply(nextRound), 600);
}

async function sendMessage() {
  if (!store.chatInput.trim() || store.isSending) return;
  const text = store.chatInput;
  store.setChatInput('');

  // 用户回复消息（右对齐气泡）
  const userMsg: ChatMessage = { id: `msg_${Date.now()}_u_reply`, role: 'user', type: 'reply', content: text, timestamp: Date.now() };
  store.addMessage(userMsg);
  await nextTick(); scrollToBottom();

  // 按当前轮次推进AI回复
  const nextRound = qaRound;
  qaRound = Math.min(qaRound + 1, aiReplies.length - 1);
  setTimeout(() => playAiReply(nextRound), 600);
}

function scrollToBottom() { if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight; }
function resetChat() { store.setChatMode(false); store.chatMessages = []; store.resources = []; qaRound = 0; mainInput.value = ''; }

onMounted(() => { document.addEventListener('click', closeDropdown); });
onUnmounted(() => { document.removeEventListener('click', closeDropdown); });
function closeDropdown() { activeDropdown.value = null; }

watch(() => store.chatMessages.length, () => { nextTick(() => scrollToBottom()); });
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
:deep(.picker-dialog .el-dialog__body) { padding-top: 0; padding-bottom: 0; }
:deep(.picker-dialog .el-dialog__header) { margin-right: 0; padding-bottom: 0; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>
