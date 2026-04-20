<template>
  <div class="h-full flex flex-col overflow-hidden relative bg-[#f8fafc] dark:bg-slate-900">
    <!-- Big Loading Overlay for Assets Text Generation -->
    <teleport to="body">
      <transition name="fade-scale">
        <div v-if="isGeneratingAssetsText" class="fixed inset-0 z-[10000] flex items-center justify-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
          <div class="relative w-full max-w-lg px-6 flex flex-col items-center gap-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl p-10 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white dark:border-slate-700">
            <!-- Central Icon -->
            <div class="relative">
              <div class="absolute inset-0 bg-indigo-500 rounded-3xl blur-[40px] opacity-10 animate-pulse"></div>
              <div class="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 rotate-6 animate-float-slow">
                <el-icon :size="40" class="animate-bounce-subtle"><MagicStick /></el-icon>
              </div>
            </div>

            <!-- Progress Info -->
            <div class="w-full flex flex-col items-center gap-5">
              <div class="text-center">
                <h2 class="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">AI 资产规划中</h2>
                <p class="text-slate-500 dark:text-slate-400 text-sm font-bold">{{ currentAssetInfo }}</p>
              </div>

              <!-- Progress Bar -->
              <div class="w-full h-2.5 bg-slate-100 dark:bg-slate-900/50 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50 relative">
                <div 
                  class="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out relative"
                  :style="{ width: generationProgress + '%' }"
                >
                  <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-fast"></div>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Asset Analysis Engine...</span>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <el-tabs v-model="activeTab" class="flex-1 flex flex-col min-h-0 modern-tabs relative">
      <!-- Custom Header Content for Tabs -->
      <div class="absolute right-6 top-3 z-50">
        <!-- Product Design Info Button -->
        <button 
          @click="showDesignDialog = true"
          class="h-8 px-4 flex items-center gap-2 bg-slate-50 text-slate-500 hover:text-indigo-600 rounded-full font-bold text-[12px] shadow-sm border border-slate-200 transition-all duration-300"
        >
          <el-icon :size="14"><InfoFilled /></el-icon>
          <span>产品设计说明</span>
        </button>
      </div>

      <!-- 角色管理 -->
      <el-tab-pane label="角色管理" name="characters">
        <div class="flex flex-col h-full p-6">
          <div class="flex justify-between items-center mb-6">
            <div class="flex items-center gap-2">
              <span class="w-1 h-5 bg-indigo-600 rounded-full"></span>
              <h2 class="text-[18px] font-extrabold text-slate-800">主体库 · 角色 <span class="text-slate-500 font-normal ml-1">({{ characters.length }})</span></h2>
            </div>
            <!-- v2.1 禁用新增角色 -->
            <!-- <button 
              @click="addAsset('character')"
              class="h-10 px-6 bg-indigo-600 text-white rounded-full text-[14px] font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <el-icon><Plus /></el-icon>
              新增角色
            </button> -->
          </div>
          <div class="flex-1 pr-2">
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 pb-6">
                <div 
                v-for="char in characters" 
                :key="char.id" 
                class="group relative flex flex-col bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 cursor-default"
                :class="generatingAssetImages.has(`char-${char.id}`) ? 'ring-2 ring-indigo-500 ring-offset-2' : ''"
              >
                <div class="aspect-[3/4] bg-slate-50 relative overflow-hidden">
                  <!-- Loading Indicator for Image Generation -->
                  <div v-if="generatingAssetImages.has(`char-${char.id}`)" class="absolute inset-0 z-10 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm flex flex-col items-center justify-center">
                    <el-icon class="is-loading text-indigo-600 mb-2" :size="30"><Loading /></el-icon>
                    <span class="text-[12px] font-black text-indigo-600 uppercase tracking-widest animate-pulse">形象生成中...</span>
                  </div>

                  <el-image 
                    v-if="char.image" 
                    :src="char.image" 
                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    fit="cover"
                  />
                  <div v-else-if="!generatingAssetImages.has(`char-${char.id}`)" class="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <el-icon size="40" class="mb-2"><Picture /></el-icon>
                    <span class="text-[14px]">暂无画面</span>
                  </div>
                  <!-- Overlay Action - v2.1 隐藏编辑和删除 -->
                  <!-- <div v-if="char.image && !generatingAssetImages.has(`char-${char.id}`)" class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
                    <div 
                      class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1890ff] shadow-lg transform scale-90 group-hover:scale-100 transition-all hover:scale-110 active:scale-95"
                      @click.stop="openEditModal(char, 'character')"
                    >
                      <el-icon size="20"><Edit /></el-icon>
                    </div>
                    <el-popconfirm
                      width="180"
                      confirm-button-text="确认"
                      cancel-button-text="取消"
                      confirm-button-type="danger"
                      :title="`确认删除角色 ${char.name}？`"
                      popper-class="modern-popconfirm-c-end"
                      @confirm="executeDeleteAsset(char, 'character')"
                    >
                      <template #reference>
                        <div 
                          class="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-red-500 shadow-xl shadow-red-500/10 transform scale-90 group-hover:scale-100 transition-all hover:scale-110 active:scale-95 hover:bg-red-500 hover:text-white"
                          @click.stop
                        >
                          <el-icon size="20"><Delete /></el-icon>
                        </div>
                      </template>
                    </el-popconfirm>
                  </div> -->
                </div>
                <div class="p-4 flex flex-col gap-1.5">
                  <div class="font-bold text-[16px] text-slate-800 truncate">{{ char.name }}</div>
                  <div class="text-[13px] text-slate-600 line-clamp-2 leading-relaxed" :title="char.description">{{ char.description || '暂无描述' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 场景管理 -->
      <el-tab-pane label="场景管理" name="scenes">
        <div class="flex flex-col h-full p-6">
          <div class="flex justify-between items-center mb-6">
            <div class="flex items-center gap-2">
              <span class="w-1 h-5 bg-indigo-600 rounded-full"></span>
              <h2 class="text-[18px] font-extrabold text-slate-800">主体库 · 场景 <span class="text-slate-400 font-normal ml-1">({{ scenes.length }})</span></h2>
            </div>
            <!-- v2.1 禁用新增场景 -->
            <!-- <button 
              @click="addAsset('scene')"
              class="h-10 px-6 bg-indigo-600 text-white rounded-full text-[14px] font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <el-icon><Plus /></el-icon>
              新增场景
            </button> -->
          </div>
          <div class="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-6">
              <div 
                v-for="scene in scenes" 
                :key="scene.id" 
                class="group relative flex flex-col bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 cursor-default"
                :class="generatingAssetImages.has(`scene-${scene.id}`) ? 'ring-2 ring-indigo-500 ring-offset-2' : ''"
              >
                <div class="aspect-video bg-slate-50 relative overflow-hidden">
                  <!-- Loading Indicator for Image Generation -->
                  <div v-if="generatingAssetImages.has(`scene-${scene.id}`)" class="absolute inset-0 z-10 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm flex flex-col items-center justify-center">
                    <el-icon class="is-loading text-indigo-600 mb-2" :size="30"><Loading /></el-icon>
                    <span class="text-[12px] font-black text-indigo-600 uppercase tracking-widest animate-pulse">画面生成中...</span>
                  </div>

                  <el-image 
                    v-if="scene.image" 
                    :src="scene.image" 
                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    fit="cover"
                  />
                  <div v-else-if="!generatingAssetImages.has(`scene-${scene.id}`)" class="w-full h-full flex flex-col items-center justify-center text-slate-300">
                    <el-icon size="40" class="mb-2"><Picture /></el-icon>
                    <span class="text-[13px]">暂无画面</span>
                  </div>
                  <!-- v2.1 隐藏编辑和删除 -->
                  <!-- <div v-if="scene.image && !generatingAssetImages.has(`scene-${scene.id}`)" class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
                    <div 
                      class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1890ff] shadow-lg transform scale-90 group-hover:scale-100 transition-all hover:scale-110 active:scale-95"
                      @click.stop="openEditModal(scene, 'scene')"
                    >
                      <el-icon size="20"><Edit /></el-icon>
                    </div>
                    <el-popconfirm
                      width="180"
                      confirm-button-text="确认"
                      cancel-button-text="取消"
                      confirm-button-type="danger"
                      :title="`确认删除场景 ${scene.name}？`"
                      popper-class="modern-popconfirm-c-end"
                      @confirm="executeDeleteAsset(scene, 'scene')"
                    >
                      <template #reference>
                        <div 
                          class="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-red-500 shadow-xl shadow-red-500/10 transform scale-90 group-hover:scale-100 transition-all hover:scale-110 active:scale-95 hover:bg-red-500 hover:text-white"
                          @click.stop
                        >
                          <el-icon size="20"><Delete /></el-icon>
                        </div>
                      </template>
                    </el-popconfirm>
                  </div> -->
                </div>
                <div class="p-4 flex flex-col gap-1.5">
                  <div class="font-bold text-[15px] text-slate-800 truncate">{{ scene.name }}</div>
                  <div class="text-[12px] text-slate-500 line-clamp-2 leading-relaxed" :title="scene.description">{{ scene.description || '暂无描述' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 道具管理 -->
      <el-tab-pane label="道具管理" name="props">
        <div class="flex flex-col h-full p-6">
          <div class="flex justify-between items-center mb-6">
            <div class="flex items-center gap-2">
              <span class="w-1 h-5 bg-indigo-600 rounded-full"></span>
              <h2 class="text-[18px] font-extrabold text-slate-800">主体库 · 道具 <span class="text-slate-400 font-normal ml-1">({{ propsList.length }})</span></h2>
            </div>
            <!-- v2.1 禁用新增道具 -->
            <!-- <button 
              @click="addAsset('prop')"
              class="h-10 px-6 bg-indigo-600 text-white rounded-full text-[14px] font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <el-icon><Plus /></el-icon>
              新增道具
            </button> -->
          </div>
          <div class="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 pb-6">
              <div 
                v-for="prop in propsList" 
                :key="prop.id" 
                class="group relative flex flex-col bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 cursor-default"
                :class="generatingAssetImages.has(`prop-${prop.id}`) ? 'ring-2 ring-indigo-500 ring-offset-2' : ''"
              >
                <div class="aspect-square bg-slate-50 relative overflow-hidden">
                  <!-- Loading Indicator for Image Generation -->
                  <div v-if="generatingAssetImages.has(`prop-${prop.id}`)" class="absolute inset-0 z-10 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm flex flex-col items-center justify-center">
                    <el-icon class="is-loading text-indigo-600 mb-2" :size="30"><Loading /></el-icon>
                    <span class="text-[12px] font-black text-indigo-600 uppercase tracking-widest animate-pulse">道具生成中...</span>
                  </div>

                  <el-image 
                    v-if="prop.image" 
                    :src="prop.image" 
                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    fit="cover"
                  />
                  <div v-else-if="!generatingAssetImages.has(`prop-${prop.id}`)" class="w-full h-full flex flex-col items-center justify-center text-slate-300">
                    <el-icon size="40" class="mb-2"><Picture /></el-icon>
                    <span class="text-[13px]">暂无画面</span>
                  </div>
                  <!-- v2.1 隐藏编辑和删除 -->
                  <!-- <div v-if="prop.image && !generatingAssetImages.has(`prop-${prop.id}`)" class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
                    <div 
                      class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1890ff] shadow-lg transform scale-90 group-hover:scale-100 transition-all hover:scale-110 active:scale-95"
                      @click.stop="openEditModal(prop, 'prop')"
                    >
                      <el-icon size="20"><Edit /></el-icon>
                    </div>
                    <el-popconfirm
                      width="180"
                      confirm-button-text="确认"
                      cancel-button-text="取消"
                      confirm-button-type="danger"
                      :title="`确认删除道具 ${prop.name}？`"
                      popper-class="modern-popconfirm-c-end"
                      @confirm="executeDeleteAsset(prop, 'prop')"
                    >
                      <template #reference>
                        <div 
                          class="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-red-500 shadow-xl shadow-red-500/10 transform scale-90 group-hover:scale-100 transition-all hover:scale-110 active:scale-95 hover:bg-red-500 hover:text-white"
                          @click.stop
                        >
                          <el-icon size="20"><Delete /></el-icon>
                        </div>
                      </template>
                    </el-popconfirm>
                  </div> -->
                </div>
                <div class="p-4 flex flex-col gap-1.5">
                  <div class="font-bold text-[15px] text-slate-800 truncate">{{ prop.name }}</div>
                  <div class="text-[12px] text-slate-500 line-clamp-2 leading-relaxed" :title="prop.description">{{ prop.description || '暂无描述' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <div class="flex justify-end items-center p-6 border-t border-slate-100 bg-white shrink-0">
      <el-tooltip
        :disabled="isAssetsComplete"
        :content="incompleteMessage"
        placement="top"
      >
        <span class="inline-block">
          <button 
            @click="handleNextStep"
            :disabled="!isAssetsComplete"
            class="h-12 px-10 bg-indigo-600 text-white rounded-full text-[15px] font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center gap-2"
          >
            <span>下一步：分镜视频</span>
            <el-icon><ArrowRight /></el-icon>
          </button>
        </span>
      </el-tooltip>
    </div>

    <!-- Unsaved Changes Confirm Dialog -->
    <el-dialog
      v-model="confirmVisible"
      title="提示"
      width="400px"
      center
    >
      <div class="text-center py-4">
        <p class="text-[15px] text-slate-700">您还有未保存的修改，确定要离开吗？</p>
      </div>
      <template #footer>
        <div class="flex justify-center gap-4 pb-2">
          <button 
            @click="confirmVisible = false"
            class="h-10 px-8 bg-white text-slate-500 rounded-full text-[14px] font-bold hover:text-slate-700 transition-all border border-slate-200"
          >
            取消
          </button>
          <button 
            @click="goToEpisodes"
            class="h-10 px-10 bg-indigo-600 text-white rounded-full text-[14px] font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            确定
          </button>
        </div>
      </template>
    </el-dialog>

    <!-- Asset Edit Modal -->
    <SubjectEditDialog
      v-model="editModalVisible"
      :subject="editingAsset"
      :is-edit="isEditAsset"
      @save="saveAsset"
    />

    <!-- Product Design Dialog -->
    <ProductDesignDialog
      v-model="showDesignDialog"
      id="short-drama-assets"
      :default-content="{
        title: '资产中心 (主体设置)',
        location: '承接剧本创作环节，将文字描述转化为视觉资产。管理剧本中所有的角色、场景、道具，并固定其视觉特征，为后续视频生成提供基准。',
        layout: [
          '**分类导航：** 顶部分类管理【角色库】、【场景库】、【道具库】。',
          '**主体卡片：** 包含基准图（Reference Image）、名称及 AI 自动提取的特征描述。',
          '**编辑弹窗：** 核心交互区，支持精修主体信息、生成形象及上传本地资源。'
        ],
        interactions: [
          '**AI 自动规划 (触发动作)：** \n - **流程：** 首次进入页面时系统自动执行。 \n - **动作：** 深度扫描全集剧本，提取角色、场景及道具信息。 \n - **产生数据：** 自动填充主体库的名称、描述及 AI 绘图提示词（Prompt）。',
          '**编辑与删除主体 (v2.1 暂不开发)：** \n - **说明：** **2.1 版本暂不需要开发此功能**。 \n - **状态：** 编辑入口（点击卡片）及删除按钮已在界面上隐藏。 \n - **逻辑：** 当前版本采用全自动生成逻辑，用户只需确认生成结果即可进入下一步。',
          '**形象生成与锁定 (视觉基准)：** \n - **流程：** 在弹窗中点击“AI 一键生成”。 \n - **动作：** 后台调用绘图模型，根据描述生成唯一基准图。 \n - **产生数据：** 更新主体的 `image` 字段。 \n - **异常：** 若接口超时或算力不足导致失败，系统展示“暂无画面”并提示重试。',
          '**本地上传 (补偿机制)：** \n - **动作：** 用户点击“本地上传”覆盖 AI 生成图。 \n - **处理：** 前端即时预览并保存至 Store。**异常：** 限制文件格式为 JPG/PNG，非法格式将被系统过滤。',
          '**校验拦截 (流程控制)：** \n - **流程：** 点击右下角“下一步”。 \n - **动作：** 系统检查所有主体（角色、场景）是否均已补全名称、描述及图片。 \n - **处理：** 若有缺失，按钮处于禁用状态，悬停显示具体缺失项提示。',
          '**逻辑说明 (流程简化)：** \n - **灵活性：** 2.1 版本为了简化流程，暂不开放手动微调，由 AI 自动完成全链路资产初始化。 \n - **一致性风险：** **注意：** 一旦进入后续“分镜视频”环节并开始生成，资产将完全锁定，以保证视觉风格的高度统一。'
        ]
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { Plus, Picture, Edit, MagicStick, Upload, ArrowRight, InfoFilled, Close, Document, Location, Monitor, Pointer, Delete, Loading } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import { useDramaStore } from '../../store/drama';
import { useEpisodeStore } from '../../store/episode';
import SubjectEditDialog from '@/components/AIShortDrama/SubjectEditDialog.vue';
import ProductDesignDialog from '@/components/Common/ProductDesignDialog.vue';

const router = useRouter();
const dramaStore = useDramaStore();
const episodeStore = useEpisodeStore();
const activeTab = ref('characters');
const showDesignDialog = ref(false);

// Asset Lists
const characters = computed({
  get: () => episodeStore.subjects.filter(s => s.type === 'character'),
  set: (val) => {
    const otherSubjects = episodeStore.subjects.filter(s => s.type !== 'character');
    episodeStore.setSubjects([...otherSubjects, ...val]);
  }
});

const scenes = computed({
  get: () => episodeStore.subjects.filter(s => s.type === 'scene'),
  set: (val) => {
    const otherSubjects = episodeStore.subjects.filter(s => s.type !== 'scene');
    episodeStore.setSubjects([...otherSubjects, ...val]);
  }
});

const propsList = computed({
  get: () => episodeStore.subjects.filter(s => s.type === 'prop'),
  set: (val) => {
    const otherSubjects = episodeStore.subjects.filter(s => s.type !== 'prop');
    episodeStore.setSubjects([...otherSubjects, ...val]);
  }
});

// Loading States
const isGeneratingAssetsText = ref(false);
const generatingAssetImages = reactive<Set<string>>(new Set());
const generationProgress = ref(0);
const currentAssetInfo = ref('');

// Navigation Logic
const confirmVisible = ref(false);
const hasUnsavedChanges = ref(false); // For demo, let's say true if we edited anything

const isAssetsComplete = computed(() => {
  const hasBasicAssets = (characters.value?.length || 0) > 0 && (scenes.value?.length || 0) > 0;
  const isGenerating = isGeneratingAssetsText.value || generatingAssetImages.size > 0;
  
  // Check if any asset is missing a description or image (or has a failed image)
  const allAssets = [...(characters.value || []), ...(scenes.value || []), ...(propsList.value || [])];
  const hasIncompleteAssets = allAssets.some(asset => {
    // Check for empty name or description
    if (!asset.name || !asset.description) return true;
    // Check for empty image or failed image
    if (!asset.image || asset.image === 'FAILED') return true;
    return false;
  });

  return hasBasicAssets && !isGenerating && !hasIncompleteAssets;
});

watch(isAssetsComplete, (newVal) => {
  if (dramaStore && typeof dramaStore.setAssetsGenerated === 'function') {
    dramaStore.setAssetsGenerated(newVal);
  }
}, { immediate: true });

const incompleteMessage = computed(() => {
  if (isGeneratingAssetsText.value) return '正在生成主体文字信息...';
  if (generatingAssetImages.size > 0) return '正在生成主体图片...';
  if ((characters.value?.length || 0) === 0 || (scenes.value?.length || 0) === 0) return '请至少添加一个角色和一个场景';
  
  const allAssets = [...(characters.value || []), ...(scenes.value || []), ...(propsList.value || [])];
  
  // Check specifically for what's missing
  const missingText = allAssets.find(asset => !asset.name || !asset.description);
  if (missingText) return `请完善主体 ${missingText.name || '未命名'} 的描述信息`;
  
  const missingImage = allAssets.find(asset => !asset.image || asset.image === 'FAILED');
  if (missingImage) return `请为 ${missingImage.name} 生成或上传一张图片`;

  return '请先完成主体设置';
});

const handleNextStep = () => {
  if (hasUnsavedChanges.value) {
    confirmVisible.value = true;
  } else {
    goToEpisodes();
  }
};

const goToEpisodes = () => {
  confirmVisible.value = false;
  router.push('/ai-short-drama-creator/storyboard');
};

onMounted(async () => {
  // Check if we need to generate assets (mock check)
  // If coming from script page and no assets yet, trigger generation
  // 模拟真实历史数据：如果 episodeStore 中已经有主体数据，则不再重新生成
  if (episodeStore.subjects.length === 0) {
    await startSequentialGeneration();
  } else {
    // 数据修正逻辑：如果检测到旧版数字 ID 导致图片错位，进行自动修复
    const hasOldIds = episodeStore.subjects.some(s => s.id === '1' || s.id === '2');
    if (hasOldIds) {
      console.log('检测到旧版数据 ID，正在执行自动修复以确保图片正确...');
      const fixedSubjects = episodeStore.subjects.map(s => {
        if (s.type === 'character') {
          if (s.name === '林星') return { ...s, id: 'char-1', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=400&q=80' };
          if (s.name === '陈宇') return { ...s, id: 'char-2', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80' };
        }
        if (s.type === 'scene') {
          if (s.name === '公司会议室') return { ...s, id: 'scene-1', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80' };
          if (s.name === '林星公寓') return { ...s, id: 'scene-2', image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80' };
        }
        if (s.type === 'prop') {
          if (s.name === '复古相机') return { ...s, id: 'prop-1', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80' };
          if (s.name === '定情项链') return { ...s, id: 'prop-2', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80' };
        }
        return s;
      });
      episodeStore.setSubjects(fixedSubjects);
    }
    console.log('检测到已有主体数据，保留历史记录，跳过自动生成。');
  }
});

const startSequentialGeneration = async () => {
  isGeneratingAssetsText.value = true;
  currentAssetInfo.value = '正在解析剧本，提取核心角色与场景...';
  
  // Phase 1: Text Generation (Big Loading)
  const mockAssets = {
    characters: [
      { id: 'char-1', name: '林星', description: '28岁，广告公司创意总监，外表坚强内心柔软，职场女强人。', prompt: '1个女孩，漂亮，头像，职业装，办公室女性，坚强独立，写实风格，8k分辨率', image: '' },
      { id: 'char-2', name: '陈宇', description: '30岁，自由摄影师，随性洒脱，林星的青梅竹马。', prompt: '1个男孩，帅气，头像，休闲装，摄影师，轻松自然，写实风格，8k分辨率', image: '' }
    ],
    scenes: [
      { id: 'scene-1', name: '公司会议室', description: '现代感十足的会议室，落地窗，能看到繁华的都市夜景。', prompt: '现代办公室会议室，大落地窗，繁华城市夜景，电影级光影，8k分辨率', image: '' },
      { id: 'scene-2', name: '林星公寓', description: '温馨的单身公寓，布置得很有格调。', prompt: '温馨单身公寓，室内设计时尚，暖色调灯光，写实风格，8k分辨率', image: '' }
    ],
    props: [
      { id: 'prop-1', name: '复古相机', description: '陈宇常用的老式胶片相机，带有岁月痕迹。', prompt: '复古胶片相机，细节质感丰富，电影级光影，8k分辨率', image: '' },
      { id: 'prop-2', name: '定情项链', description: '一条星星形状的银质项链。', prompt: '星形纯银项链，闪耀光泽，微距摄影，8k分辨率', image: '' }
    ]
  };

  const steps = ['提取角色特征', '规划场景氛围', '锁定核心道具'];
  for (let i = 0; i < steps.length; i++) {
    currentAssetInfo.value = steps[i];
    generationProgress.value = Math.round(((i + 1) / steps.length) * 100);
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  // Populate text info
  const allGeneratedSubjects = [
    ...mockAssets.characters.map(c => ({ ...c, type: 'character' as const })),
    ...mockAssets.scenes.map(s => ({ ...s, type: 'scene' as const })),
    ...mockAssets.props.map(p => ({ ...p, type: 'prop' as const }))
  ];
  
  episodeStore.setSubjects(allGeneratedSubjects);
  
  isGeneratingAssetsText.value = false;
  
  // Phase 2: Sequential Image Generation (Per-asset loading)
  const allAssets = [
    ...characters.value.map(a => ({ ...a, type: 'character' })),
    ...scenes.value.map(a => ({ ...a, type: 'scene' })),
    ...propsList.value.map(a => ({ ...a, type: 'prop' }))
  ];

  const mockImages: Record<string, string> = {
    'char-1': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=400&q=80',
    'char-2': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
    'scene-1': 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    'scene-2': 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80',
    'prop-1': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    'prop-2': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80'
  };

  for (const asset of allAssets) {
    const key = asset.id;
    const loadingKey = `${asset.type.substring(0, 4)}-${asset.id}`;
    generatingAssetImages.add(loadingKey);
    
    // Switch tab automatically to show progress
    if (asset.type === 'character') activeTab.value = 'characters';
    else if (asset.type === 'scene') activeTab.value = 'scenes';
    else activeTab.value = 'props';

    await new Promise(resolve => setTimeout(resolve, 1500)); // Image generation takes longer
    
    // Update the image in store
    episodeStore.updateSubject(asset.id, { image: mockImages[key] });
    
    generatingAssetImages.delete(loadingKey);
  }
  
  ElMessage.success('主体资产生成完毕');
};

// Modal State
const editModalVisible = ref(false);
const isEditAsset = ref(false);
const currentAssetType = ref<'character' | 'scene' | 'prop'>('character');
const editingAsset = ref<any>(null);

const getAssetTypeName = (type: string) => {
  if (type === 'character') return '角色';
  if (type === 'scene') return '场景';
  if (type === 'prop') return '道具';
  return '';
};

const openEditModal = (asset: any, type: 'character' | 'scene' | 'prop') => {
  currentAssetType.value = type;
  editingAsset.value = JSON.parse(JSON.stringify(asset)); // clone
  editingAsset.value.type = type;
  isEditAsset.value = true;
  editModalVisible.value = true;
};

const addAsset = (type: 'character' | 'scene' | 'prop') => {
  currentAssetType.value = type;
  editingAsset.value = {
    id: Date.now().toString(),
    name: '',
    description: '',
    prompt: '',
    type: type,
    image: ''
  };
  isEditAsset.value = false;
  editModalVisible.value = true;
};

const saveAsset = (data: any) => {
  if (!data.name) {
    ElMessage.warning('请输入名称');
    return;
  }
  
  const index = episodeStore.subjects.findIndex((s: any) => s.id === data.id);
  if (index > -1) {
    episodeStore.updateSubject(data.id, data);
  } else {
    episodeStore.addSubject(data);
  }
  
  ElMessage.success('保存成功');
  editModalVisible.value = false;
};

const executeDeleteAsset = (asset: any, type: 'character' | 'scene' | 'prop') => {
  episodeStore.deleteSubject(asset.id);
  ElMessage({
    message: '删除成功',
    type: 'success',
    customClass: 'modern-message-success'
  });
};

// Expose internal state for testing
defineExpose({
  hasUnsavedChanges,
  confirmVisible,
  isAssetsComplete,
  handleNextStep,
  goToEpisodes,
  characters,
  scenes,
  propsList
});

</script>

<style scoped>
.theme-primary-btn {
  background-color: #1890ff !important;
  border-color: #1890ff !important;
  color: white !important;
  border-radius: 8px !important;
}
.theme-primary-btn:hover {
  background-color: #40a9ff !important;
  border-color: #40a9ff !important;
}
.theme-primary-text {
  color: #1890ff !important;
}
.theme-primary-border {
  border-color: #1890ff !important;
}
.theme-primary-outline-btn {
  color: #1890ff !important;
  border-color: #1890ff !important;
  border-radius: 8px !important;
}
.theme-primary-outline-btn:hover {
  background-color: #e6f7ff !important;
}

.modern-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
  padding: 0 24px;
  background-color: #fff;
  border-bottom: 1px solid #f1f5f9;
}
.modern-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}
.modern-tabs :deep(.el-tabs__item) {
  font-size: 15px;
  font-weight: 600;
  color: #64748b;
  padding: 0 20px;
  height: 56px;
  line-height: 56px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.modern-tabs :deep(.el-tabs__item.is-active) {
  color: #1890ff;
}
.modern-tabs :deep(.el-tabs__active-bar) {
  background-color: #1890ff;
  height: 3px;
  border-radius: 3px 3px 0 0;
}
.modern-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow-y: hidden;
  background-color: #fcfdfe;
}
.modern-tabs .el-tab-pane {
  height: 100%;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.asset-edit-modal :deep(.el-dialog__body) {
  padding-top: 10px;
  padding-bottom: 10px;
}

/* Modern Popconfirm C-End Styles - Redesigned for Premium C-End Look */
:deep(.modern-popconfirm-c-end) {
  background: linear-gradient(135deg, #fff1f2 0%, #ffffff 100%) !important;
  border-radius: 24px !important;
  padding: 18px !important;
  border: 1px solid rgba(251, 113, 133, 0.3) !important;
  box-shadow: 
    0 10px 25px -5px rgba(225, 29, 72, 0.15),
    0 20px 40px -10px rgba(0, 0, 0, 0.1) !important;
  backdrop-filter: blur(10px);
}

:deep(.modern-popconfirm-c-end .el-popconfirm__main) {
  margin-bottom: 16px !important;
  font-weight: 900 !important;
  color: #9f1239 !important; /* rose-900 */
  font-size: 14px !important;
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.modern-popconfirm-c-end .el-popconfirm__main .el-popconfirm__icon) {
  color: #f43f5e !important; /* rose-500 */
  font-size: 18px !important;
}

:deep(.modern-popconfirm-c-end .el-button--primary) {
  background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%) !important;
  border: none !important;
  border-radius: 12px !important;
  font-weight: 900 !important;
  font-size: 12px !important;
  height: 34px !important;
  padding: 0 16px !important;
  box-shadow: 0 4px 12px rgba(225, 29, 72, 0.3) !important;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
}

:deep(.modern-popconfirm-c-end .el-button--primary:hover) {
  transform: translateY(-1px) scale(1.05) !important;
  box-shadow: 0 6px 15px rgba(225, 29, 72, 0.4) !important;
}

:deep(.modern-popconfirm-c-end .el-button--default) {
  border-radius: 12px !important;
  font-weight: 800 !important;
  font-size: 12px !important;
  height: 34px !important;
  background: rgba(255, 255, 255, 0.8) !important;
  border: 1px solid rgba(251, 113, 133, 0.2) !important;
  color: #e11d48 !important;
  transition: all 0.2s ease !important;
}

:deep(.modern-popconfirm-c-end .el-button--default:hover) {
  background: #ffffff !important;
  color: #be123c !important;
  border-color: rgba(251, 113, 133, 0.4) !important;
}

:deep(.modern-message-success) {
  border-radius: 16px !important;
  padding: 12px 24px !important;
  background: #10b981 !important;
  border: none !important;
}

:deep(.modern-message-success .el-message__content) {
  color: white !important;
  font-weight: 900 !important;
}

:deep(.modern-message-success .el-message__icon) {
  color: white !important;
}
/* Sequential Generation Loading Styles */
@keyframes float-slow {
  0%, 100% { transform: rotate(6deg) translateY(0); }
  50% { transform: rotate(2deg) translateY(-10px); }
}

@keyframes bounce-subtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes shimmer-fast {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-float-slow {
  animation: float-slow 4s infinite ease-in-out;
}

.animate-bounce-subtle {
  animation: bounce-subtle 2s infinite ease-in-out;
}

.animate-shimmer-fast {
  animation: shimmer-fast 1.5s infinite linear;
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(1.1);
}
</style>
