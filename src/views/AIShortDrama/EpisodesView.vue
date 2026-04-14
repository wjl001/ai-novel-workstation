<template>
  <div :class="s.page" class="relative">
    <!-- Header: Title and Batch Action -->
    <div :class="s.header">
      <div :class="s.left" class="flex items-center gap-4">
        <button 
          @click="router.back()" 
          class="flex items-center justify-center w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-105 active:scale-95 transition-all duration-300 shrink-0"
        >
          <el-icon :size="18"><ArrowLeft /></el-icon>
        </button>
        <div class="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1 shrink-0"></div>
        
        <!-- C-end redesigned "Total Episodes" badge -->
        <div class="relative group ml-1 cursor-default">
          <div class="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
          
          <div class="relative flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl shadow-sm border border-white/50 dark:border-white/10 transform hover:-translate-y-0.5 transition-all duration-300">
            <div class="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-inner">
              <el-icon class="text-white text-sm"><MagicStick /></el-icon>
            </div>
            
            <div class="flex items-baseline gap-1">
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-extrabold text-sm tracking-wider">共</span>
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 font-black text-xl tabular-nums drop-shadow-sm">{{ filteredEpisodes.length }}</span>
              <span class="text-transparent bg-clip-text bg-gradient-to-l from-pink-500 to-purple-600 font-extrabold text-sm tracking-wider">集</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Search & Filters -->
      <div :class="s.searchBar">
        <div :class="s.searchInputWrapper">
          <el-icon><Search /></el-icon>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="搜索剧集标题..." 
            @input="handleSearch"
          />
        </div>
        <el-select 
          v-model="statusFilter" 
          placeholder="全部状态" 
          clearable 
          :class="s.statusSelect"
          popper-class="status-select-popper"
        >
          <el-option label="剧本待写" value="pending" />
          <el-option label="主体待设" value="assets" />
          <el-option label="分镜制作" value="processing" />
          <el-option label="已完成" value="completed" />
        </el-select>
      </div>

      <div :class="s.right" class="flex items-center gap-3">
        <!-- Tab Switcher -->
        <div :class="s.tabSwitcher">
          <button 
            v-for="tab in availableTabs" 
            :key="tab.value"
            :class="[s.tabBtn, s['tabBtn_' + tab.value], { [s.active]: activeTab === tab.value }]"
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
            <span :class="s.tabCount">{{ getTabCount(tab.value) }}</span>
          </button>
        </div>

        <!-- Product Design Info Button -->
        <button 
          @click="showDesignDialog = true"
          class="h-10 px-4 flex items-center gap-2 bg-slate-50 text-slate-500 hover:text-indigo-600 rounded-full font-bold text-[13px] shadow-sm border border-slate-200 transition-all duration-300"
        >
          <el-icon :size="16"><InfoFilled /></el-icon>
          <span>产品设计说明</span>
        </button>
      </div>
    </div>

    <!-- Episode Grid Layout -->
    <div :class="s.container" ref="listRef">
      <div :class="s.gridLayout">
        <div 
          v-for="ep in currentTabEpisodes" 
          :key="ep.id" 
          :class="s.gridCard"
          @click="handleCardClick(ep)"
        >
          <div :class="s.posterWrapper">
            <div :class="s.poster">
              <el-image :src="getPosterUrl(ep)" fit="cover">
                <template #error>
                  <div class="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                    <el-icon :size="32"><Picture /></el-icon>
                  </div>
                </template>
              </el-image>

              <!-- Poster Actions Overlay -->
              <div :class="s.posterActions">
                <button :class="s.uploadBtn" @click.stop="handleUploadCover(ep)">
                  <span>上传封面</span>
                </button>
                <button :class="s.aiGenBtn" @click.stop="handleAIGenerateCover(ep)">
                  <el-icon :size="12"><MagicStick /></el-icon>
                  <span>AI生成</span>
                </button>
              </div>

              <!-- Duration Badge -->
              <div v-if="ep.synthesisStatus === 'success'" :class="s.durationBadge">
                {{ ep.duration || '01:12' }}
              </div>
              <div :class="s.indexBadge">{{ ep.index }}</div>
            </div>
          </div>

          <div :class="s.info">
            <h3 :class="s.epTitle" :title="ep.title">{{ ep.title }}</h3>
            
            <!-- Single Status Indicator -->
            <div :class="[s.singleStatus, s[getSingleStatusType(ep)]]">
              <el-icon v-if="getSingleStatusType(ep) === 'processing'" class="is-loading"><Loading /></el-icon>
              <el-icon v-else-if="getSingleStatusType(ep) === 'completed'"><Check /></el-icon>
              <el-icon v-else-if="getSingleStatusType(ep) === 'assets'"><Box /></el-icon>
              <el-icon v-else><Document /></el-icon>
              <span>{{ getSingleStatusLabel(ep) }}</span>
            </div>
          </div>

          <!-- Actions Logic: Two Mini Buttons Only -->
          <div :class="s.gridActions">
            <button 
              :class="[s.stepBtn, s.edit]"
              @click.stop="handleEdit(ep)"
              title="编辑"
            >
              <el-icon><EditPen /></el-icon>
              <span>编辑</span>
            </button>
            <button 
              :class="[s.stepBtn, s.preview]"
              :disabled="ep.synthesisStatus !== 'success'"
              @click.stop="handlePreview(ep)"
              title="预览"
            >
              <el-icon><VideoPlay /></el-icon>
              <span>预览</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="episodes.length === 0" :class="s.empty">
      <el-empty description="暂无分集数据" />
    </div>

    <!-- Edit Drawer -->
    <EpisodesEditDrawer 
      v-model="drawerVisible"
      :episode="editingEpisode"
      @enter-detail="navigateToDetail"
    />

    <!-- Progress Modal -->
    <ProgressModal 
      v-model="progressVisible"
      :progress="batchProgress"
      title="正在批量生成分镜脚本"
      @cancel="progressVisible = false"
    />

    <!-- Video Preview Dialog -->
    <el-dialog
      v-model="previewVisible"
      title="预览全集"
      width="1000px"
      center
      destroy-on-close
      :class="s.previewDialog"
    >
      <div v-if="previewEpisode" :class="s.previewContent">
        <!-- Video Player Section -->
        <div :class="s.videoSection">
          <video 
            ref="previewVideoRef"
            :src="previewEpisode.synthesisVideo" 
            controls 
            autoplay
            class="w-full rounded-xl shadow-2xl"
          ></video>
        </div>

        <!-- Export Settings Section -->
        <div :class="s.exportSettings">
          <div class="flex items-center justify-between mt-8 px-2">
            <div class="flex gap-12">
              <!-- Watermark Setting -->
              <div :class="s.settingGroup">
                <span :class="s.settingLabel">水印设置</span>
                <div :class="s.segmentedControl">
                  <button 
                    :class="{ [s.active]: watermarkType === 'brand' }"
                    @click="watermarkType = 'brand'"
                  >带品牌水印</button>
                  <button 
                    :class="{ [s.active]: watermarkType === 'none' }"
                    @click="watermarkType = 'none'"
                  >无水印</button>
                </div>
              </div>

              <!-- Resolution Setting -->
              <div :class="s.settingGroup">
                <span :class="s.settingLabel">导出分辨率</span>
                <div :class="s.segmentedControl">
                  <button 
                    :class="{ [s.active]: resolution === '1080P' }"
                    @click="resolution = '1080P'"
                  >1080P</button>
                  <button 
                    :class="{ [s.active]: resolution === '720P' }"
                    @click="resolution = '720P'"
                  >720P</button>
                  <button 
                    :class="{ [s.active]: resolution === '4K' }"
                    @click="resolution = '4K'"
                  >4K</button>
                </div>
              </div>
            </div>

            <!-- Export Button -->
            <button 
              :class="s.exportButton"
              @click="handleExport(previewEpisode)"
            >
              <el-icon><Download /></el-icon>
              <span>导出到本地</span>
            </button>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- Product Design Dialog -->
    <el-dialog v-model="showDesignDialog" title="产品设计说明 - 剧集拆解规划图" width="700px" class="rounded-[24px] !bg-[#f8fafc] dark:!bg-slate-900 overflow-hidden" :show-close="false">
      <template #header="{ close, titleId, titleClass }">
        <div class="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
              <el-icon :size="20"><Document /></el-icon>
            </div>
            <h4 :id="titleId" :class="[titleClass, 'text-xl font-black text-slate-800 dark:text-white m-0']">产品设计说明 - 剧集规划</h4>
          </div>
          <button @click="close" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
            <el-icon :size="20"><Close /></el-icon>
          </button>
        </div>
      </template>
      
      <div class="px-6 py-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
        <div class="prose dark:prose-invert max-w-none">
          <h3 class="text-indigo-600 font-bold flex items-center gap-2 mb-4"><el-icon><Location /></el-icon>页面定位</h3>
          <p class="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">管理短剧的单集列表，提供从大纲到分镜图生成的批量控制入口。</p>

          <h3 class="text-indigo-600 font-bold flex items-center gap-2 mb-4"><el-icon><Monitor /></el-icon>原型布局概要</h3>
          <ul class="space-y-3 mb-6">
            <li class="flex items-start gap-2 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-50 dark:border-slate-700/50">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
              <span class="text-slate-600 dark:text-slate-300"><strong>顶部控制：</strong>提供“多选”、“批量生成”等全局操作。</span>
            </li>
            <li class="flex items-start gap-2 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-50 dark:border-slate-700/50">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
              <span class="text-slate-600 dark:text-slate-300"><strong>单集卡片：</strong>展示集数、核心情节摘要、包含的角色/场景数量、以及当前生成的封面图或状态。</span>
            </li>
          </ul>

          <h3 class="text-indigo-600 font-bold flex items-center gap-2 mb-4"><el-icon><Pointer /></el-icon>核心交互</h3>
          <ul class="space-y-3">
            <li class="flex items-start gap-2 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-50 dark:border-slate-700/50">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
              <span class="text-slate-600 dark:text-slate-300"><strong>局部/批量生成：</strong>用户可以选择某几集卡片，点击“批量生成”，系统后台排队处理图文生成（节省 Token 和时间）。</span>
            </li>
            <li class="flex items-start gap-2 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-50 dark:border-slate-700/50">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
              <span class="text-slate-600 dark:text-slate-300"><strong>状态流转：</strong>生成完成后，卡片上的“立即生成”按钮变为“进入编辑”，引导用户进入 StoryboardView。</span>
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
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  ArrowLeft, InfoFilled, Search, User, Location, Box, VideoCamera, 
  Document, Picture, Film, MagicStick, Loading, VideoPlay, Check, Download,
  EditPen
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useEpisodeStore } from '@/store/episode';
import s from '@/styles/AIShortDrama/EpisodesView.module.scss';

// Components
import EpisodesEditDrawer from '@/components/episode/EpisodesEditDrawer.vue';
import ProgressModal from '@/components/episode/ProgressModal.vue';

const router = useRouter();
const episodeStore = useEpisodeStore();

// State
const showDesignDialog = ref(false);
const drawerVisible = ref(false);
const editingEpisode = ref<any>(null);
const progressVisible = ref(false);
const batchProgress = ref(0);
const previewVisible = ref(false);
const previewEpisode = ref<any>(null);
const searchQuery = ref('');
const statusFilter = ref('');

// Export Settings
const watermarkType = ref('brand');
const resolution = ref('1080P');
const previewVideoRef = ref<HTMLVideoElement | null>(null);

const episodes = computed(() => episodeStore.episodes);
const filteredEpisodes = computed(() => {
  return episodes.value.filter(ep => {
    const matchesQuery = ep.title.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    if (!statusFilter.value) return matchesQuery;
    
    let matchesStatus = false;
    switch (statusFilter.value) {
      case 'pending':
        matchesStatus = ep.scriptStatus === 'pending';
        break;
      case 'assets':
        matchesStatus = ep.scriptStatus === 'success' && ep.assetsStatus === 'pending';
        break;
      case 'processing':
        matchesStatus = ep.assetsStatus === 'success' && ep.synthesisStatus !== 'success';
        break;
      case 'completed':
        matchesStatus = ep.synthesisStatus === 'success';
        break;
    }
    
    return matchesQuery && matchesStatus;
  });
});

const hasGeneratedAny = computed(() => episodes.value.some(ep => ep.status === 'success'));

const activeTab = ref('pending');
const availableTabs = [
  { label: '剧本待写', value: 'pending' },
  { label: '主体待设', value: 'assets' },
  { label: '分镜制作', value: 'processing' },
  { label: '已完成', value: 'completed' }
];

const getTabCount = (tabValue: string) => {
  switch (tabValue) {
    case 'pending': return episodes.value.filter(ep => ep.scriptStatus === 'pending').length;
    case 'assets': return episodes.value.filter(ep => ep.scriptStatus === 'success' && ep.assetsStatus === 'pending').length;
    case 'processing': return episodes.value.filter(ep => ep.assetsStatus === 'success' && ep.synthesisStatus !== 'success').length;
    case 'completed': return episodes.value.filter(ep => ep.synthesisStatus === 'success').length;
    default: return 0;
  }
};

const currentTabEpisodes = computed(() => {
  return filteredEpisodes.value.filter(ep => {
    if (activeTab.value === 'pending') return ep.scriptStatus === 'pending';
    if (activeTab.value === 'assets') return ep.scriptStatus === 'success' && ep.assetsStatus === 'pending';
    if (activeTab.value === 'processing') return ep.assetsStatus === 'success' && ep.synthesisStatus !== 'success';
    if (activeTab.value === 'completed') return ep.synthesisStatus === 'success';
    return true;
  });
});

const getSingleStatusType = (ep: any) => {
  if (ep.synthesisStatus === 'success') return 'completed';
  if (ep.assetsStatus === 'success') return 'processing';
  if (ep.scriptStatus === 'success') return 'assets';
  return 'pending';
};

const getSingleStatusLabel = (ep: any) => {
  if (ep.synthesisStatus === 'success') return '已完成';
  if (ep.synthesisStatus === 'synthesizing') return '合成中...';
  if (ep.storyboardStatus === 'generating') return '分镜生成中...';
  if (ep.storyboardStatus === 'success') return '待合成视频';
  if (ep.assetsStatus === 'success') return '分镜制作';
  if (ep.scriptStatus === 'success') return '主体待设';
  return '剧本待写';
};

// Initialize mock data if empty
onMounted(() => {
  if (episodes.value.length === 0) {
    episodeStore.setEpisodes([
      {
        id: '1',
        index: 1,
        title: '第 1 集：命运抉择系统自毁',
        poster: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400',
        roleCount: 7,
        sceneCount: 2,
        propCount: 5,
        storyboardCount: 16,
        scriptStatus: 'success',
        assetsStatus: 'success',
        storyboardStatus: 'success',
        synthesisStatus: 'success',
        status: 'success',
        storyboardGenerated: true,
        duration: '01:12',
        gif: '',
        synthesisVideo: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
      },
      {
        id: '2',
        index: 2,
        title: '第 2 集：重生归来之境',
        poster: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=400',
        roleCount: 5,
        sceneCount: 3,
        propCount: 3,
        storyboardCount: 12,
        scriptStatus: 'success',
        assetsStatus: 'success',
        storyboardStatus: 'generating',
        synthesisStatus: 'pending',
        status: 'generating',
        storyboardGenerated: false,
        duration: '00:38',
        gif: '',
      },
      {
        id: '4',
        index: 4,
        title: '第 4 集：真相大白',
        poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=400',
        roleCount: 8,
        sceneCount: 4,
        propCount: 6,
        storyboardCount: 20,
        scriptStatus: 'success',
        assetsStatus: 'success',
        storyboardStatus: 'success',
        synthesisStatus: 'synthesizing',
        status: 'generating',
        storyboardGenerated: true,
        duration: '01:45',
        gif: '',
      },
      {
        id: '5',
        index: 5,
        title: '第 5 集：暗流涌动',
        poster: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=400',
        roleCount: 3,
        sceneCount: 2,
        propCount: 4,
        storyboardCount: 0,
        scriptStatus: 'success',
        assetsStatus: 'pending',
        storyboardStatus: 'pending',
        synthesisStatus: 'pending',
        status: 'pending',
        storyboardGenerated: false,
        duration: '00:00',
        gif: '',
      },
      {
        id: '3',
        index: 3,
        title: '第 3 集：商战风云',
        poster: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=400',
        roleCount: 4,
        sceneCount: 2,
        propCount: 2,
        storyboardCount: 0,
        scriptStatus: 'pending',
        assetsStatus: 'pending',
        storyboardStatus: 'pending',
        synthesisStatus: 'pending',
        status: 'pending',
        storyboardGenerated: false,
        duration: '00:45',
        gif: '',
      },
      {
        id: '6',
        index: 6,
        title: '第 6 集：最后对决',
        poster: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=400',
        roleCount: 10,
        sceneCount: 5,
        propCount: 8,
        storyboardCount: 0,
        scriptStatus: 'pending',
        assetsStatus: 'pending',
        storyboardStatus: 'pending',
        synthesisStatus: 'pending',
        status: 'pending',
        storyboardGenerated: false,
        duration: '00:00',
        gif: '',
      }
    ]);
  }
});

// Helper Functions
const handleSearch = () => {
  // Computed property handles the filtering
};
const getStoryboardStatusShortLabel = (status: string) => {
  const map: any = {
    pending: '待制作',
    generating: '制作中',
    success: '已生成',
    failed: '失败'
  };
  return map[status] || '未知';
};

const getSynthesisStatusShortLabel = (status: string) => {
  const map: any = {
    pending: '待合成',
    synthesizing: '合成中',
    success: '已完结',
    failed: '失败'
  };
  return map[status] || '未知';
};

const getStepHint = (ep: any) => {
  if (ep.scriptStatus === 'pending') return '故事的起点，快去开启您的剧本创作之旅吧';
  if (ep.assetsStatus === 'pending') return '剧本已就绪，接下来请为您的剧集设置统一的角色与场景形象';
  if (ep.storyboardStatus === 'pending') return '主体形象已锁定，现在可以开始生成精美的分镜脚本了';
  if (ep.storyboardStatus === 'generating') return 'AI 正在为您精心雕琢每一帧画面，请稍候...';
  if (ep.synthesisStatus === 'pending') return '万事俱备，点击视频合成，将分镜转化为完整的短剧大片';
  if (ep.synthesisStatus === 'synthesizing') return '正在将分镜与音轨完美融合，即将为您呈现精彩视频...';
  if (ep.synthesisStatus === 'success') return '恭喜！您的短剧作品已制作完成，点击预览或导出分享吧';
  return '准备就绪';
};

const getPosterUrl = (ep: any) => {
  const defaultImage = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400';
  if (ep.storyboardStatus === 'success' || ep.synthesisStatus === 'success') {
    return ep.poster || defaultImage;
  }
  return defaultImage;
};

const navigateToOutline = (ep: any) => {
  router.push({
    path: '/ai-short-drama-creator/outline',
    query: { id: ep.id }
  });
};

const navigateToAssets = (ep: any) => {
  router.push({
    path: '/ai-short-drama-creator/assets',
    query: { id: ep.id }
  });
};

const handleSynthesis = async (ep: any) => {
  if (ep.synthesisStatus === 'success') {
    handlePreview(ep);
  } else {
    // Start synthesis simulation
    episodeStore.updateEpisode(ep.id, { synthesisStatus: 'synthesizing' });
    ElMessage.info(`正在开始合成《${ep.title}》...`);
    
    // Simulate synthesis process
    setTimeout(() => {
      episodeStore.updateEpisode(ep.id, { 
        synthesisStatus: 'success',
        synthesisVideo: 'https://www.w3schools.com/html/movie.mp4'
      });
      ElMessage.success(`《${ep.title}》合成完成！`);
      // After success, show the preview dialog automatically
      handlePreview(episodeStore.episodes.find(e => e.id === ep.id));
    }, 2000);
  }
};

// Actions
const handleUploadCover = (ep: any) => {
  ElMessage.info(`正在为第 ${ep.index} 集上传封面...`);
  // Add real upload logic here
};

const handleAIGenerateCover = (ep: any) => {
  ElMessage({
    message: `正在为第 ${ep.index} 集 AI 生成封面...`,
    icon: MagicStick,
    customClass: 'modern-message-success'
  });
  // Add real AI generation logic here
};

const handleEdit = (ep: any) => {
  if (ep.scriptStatus === 'pending') {
    navigateToOutline(ep);
  } else if (ep.assetsStatus === 'pending') {
    navigateToAssets(ep);
  } else {
    navigateToDetail(ep);
  }
};

const handleCardClick = (ep: any) => {
  handleEdit(ep);
};

const handleGenerate = async (ep: any) => {
  episodeStore.updateEpisode(ep.id, { 
    status: 'generating',
    storyboardStatus: 'generating' 
  });
  
  // Track event
  trackEvent('shortDrama_generate_storyboard', { episodeId: ep.id });

  try {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    episodeStore.updateEpisode(ep.id, { 
      status: 'success', 
      storyboardStatus: 'success',
      storyboardGenerated: true 
    });
    
    ElMessage.success('分镜脚本生成成功');
  } catch (error) {
    episodeStore.updateEpisode(ep.id, { 
      status: 'failed', 
      storyboardStatus: 'failed',
      errorReason: '网络超时，请稍后重试' 
    });
    ElMessage.error('分镜脚本生成失败');
  }
};

const handlePreview = (ep: any) => {
  // Use a mock video URL for simulation (Storyboard 1 video)
  const sampleVideo = 'https://www.w3schools.com/html/movie.mp4';
  previewEpisode.value = {
    ...ep,
    synthesisVideo: ep.synthesisVideo || sampleVideo
  };
  previewVisible.value = true;
};

const handleExport = (ep: any) => {
  if (ep.synthesisVideo || ep.synthesisStatus === 'success') {
    const link = document.createElement('a');
    link.href = ep.synthesisVideo || 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    link.download = `${ep.title}-full.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    ElMessage.success(`正在导出全集视频: ${ep.title}`);
  } else {
    ElMessage.warning('全集视频尚未合成，无法导出');
  }
};

const openEditDrawer = (ep: any) => {
  editingEpisode.value = ep;
  drawerVisible.value = true;
  trackEvent('shortDrama_open_drawer', { episodeId: ep.id });
};

const navigateToDetail = (ep: any) => {
  drawerVisible.value = false;
  trackEvent('shortDrama_enter_detail', { episodeId: ep.id });
  router.push({
    path: `/ai-short-drama-creator/storyboard`,
    query: { subjectId: episodeStore.subjectId, id: ep.id }
  });
};

const trackEvent = (eventName: string, params: any) => {
  console.log(`[Tracking] ${eventName}`, {
    ...params,
    subjectId: episodeStore.subjectId,
    timestamp: Date.now()
  });
  // Here you would integrate with your tracking SDK
};

const cancelNext = () => {
  // Logic for canceling next countdown if needed
};

</script>

