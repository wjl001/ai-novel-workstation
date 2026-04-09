<template>
  <div :class="s.page" class="relative">
    <!-- Header: Title and Batch Action -->
    <div :class="s.header">
      <div :class="s.left" class="flex items-center gap-4">
        <button 
          @click="$router.push('/ai-short-drama-creator/works')" 
          class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <el-icon><ArrowLeft /></el-icon>
        </button>
        <div>
          <h2 class="text-2xl font-black text-slate-800 tracking-tight">共 {{ filteredEpisodes.length }} 集</h2>
          <p class="text-slate-400 text-sm mt-1">智能生成分镜脚本，开启你的短剧创作之旅</p>
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
          <el-option label="剧本待写" value="script_pending" />
          <el-option label="主体待设" value="assets_pending" />
          <el-option label="分镜制作" value="storyboard_generating" />
          <el-option label="视频合成" value="completed" />
        </el-select>
      </div>

      <div :class="s.right" class="flex items-center gap-3">
        <!-- Product Design Info Button -->
        <button 
          @click="showDesignDialog = true"
          class="h-10 px-4 flex items-center gap-2 bg-slate-50 text-slate-500 hover:text-indigo-600 rounded-full font-bold text-[13px] shadow-sm border border-slate-200 transition-all duration-300 mr-2"
        >
          <el-icon :size="16"><InfoFilled /></el-icon>
          <span>产品设计说明</span>
        </button>
      </div>
    </div>

    <!-- Episode Grid Layout -->
    <div :class="[s.container, s.gridLayout]" ref="listRef">
      <div 
        v-for="ep in filteredEpisodes" 
        :key="ep.id" 
        :class="s.gridCard"
        @click="handleCardClick(ep)"
      >
        <div :class="s.index">{{ ep.index }}</div>
        
        <div :class="s.posterWrapper">
          <div :class="s.poster">
            <el-image :src="getPosterUrl(ep)" fit="cover">
              <template #error>
                <div class="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                  <el-icon :size="40"><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <!-- Duration Badge -->
            <div v-if="ep.synthesisStatus === 'success'" :class="s.durationBadge">
              {{ ep.duration || '01:12' }}
            </div>
          </div>
        </div>

        <div :class="s.info">
          <div class="flex items-center justify-between">
            <h3 :class="s.epTitle">{{ ep.title }}</h3>
            <span v-if="ep.synthesisStatus === 'success'" class="flex items-center gap-1 text-emerald-500 font-black text-[12px] bg-emerald-50 px-2 py-0.5 rounded-md">
              <el-icon><Check /></el-icon> 已完成
            </span>
          </div>
          
          <div v-if="ep.scriptStatus === 'success'" :class="s.meta">
            <span><el-icon><User /></el-icon> {{ ep.roleCount }} 角色</span>
            <span><el-icon><Location /></el-icon> {{ ep.sceneCount }} 场景</span>
            <span><el-icon><Box /></el-icon> {{ ep.propCount || 0 }} 道具</span>
            <span><el-icon><VideoCamera /></el-icon> {{ ep.storyboardCount || 16 }} 分镜</span>
          </div>

          <!-- Status Indicator Row -->
          <div :class="s.statusIndicatorRow">
            <div :class="[s.statusBadge, s[ep.scriptStatus]]">
              <el-icon><Document /></el-icon>
              <span>剧本: {{ ep.scriptStatus === 'success' ? '已创作' : '待创作' }}</span>
            </div>
            <div :class="[s.statusBadge, s[ep.assetsStatus || 'pending']]">
              <el-icon><User /></el-icon>
              <span>主体: {{ ep.assetsStatus === 'success' ? '已设置' : '待设置' }}</span>
            </div>
            <div :class="[s.statusBadge, s[ep.storyboardStatus]]">
              <el-icon v-if="ep.storyboardStatus === 'generating'" class="is-loading"><Loading /></el-icon>
              <el-icon v-else><Picture /></el-icon>
              <span>分镜: {{ getStoryboardStatusShortLabel(ep.storyboardStatus) }}</span>
            </div>
            <div :class="[s.statusBadge, s[ep.synthesisStatus]]">
              <el-icon v-if="ep.synthesisStatus === 'synthesizing'" class="is-loading"><Loading /></el-icon>
              <el-icon v-else-if="ep.synthesisStatus === 'success'"><VideoPlay /></el-icon>
              <el-icon v-else><Film /></el-icon>
              <span>合成: {{ getSynthesisStatusShortLabel(ep.synthesisStatus) }}</span>
            </div>
          </div>

          <!-- Step Hint Text -->
          <div :class="s.stepHint">
            <span class="text-indigo-600 font-bold">💡 当前建议: </span>
            <span class="text-slate-600 font-medium">{{ getStepHint(ep) }}</span>
          </div>
          
          <!-- Actions Logic: Stepper Buttons -->
          <div :class="s.gridActions">
            <button 
              :class="[s.stepBtn, { [s.active]: ep.scriptStatus === 'pending' }]"
              @click.stop="navigateToOutline(ep)"
            >
              <el-icon class="mr-1.5"><Document /></el-icon>剧本创作
            </button>
            <button 
              :class="[s.stepBtn, { [s.active]: ep.scriptStatus === 'success' && (ep.assetsStatus === 'pending') }]"
              :disabled="ep.scriptStatus !== 'success'"
              @click.stop="navigateToAssets(ep)"
            >
              <el-icon class="mr-1.5"><User /></el-icon>主体设置
            </button>
            <button 
              :class="[s.stepBtn, { [s.active]: ep.assetsStatus === 'success' && (ep.storyboardStatus === 'pending' || ep.storyboardStatus === 'generating') }]"
              :disabled="ep.assetsStatus !== 'success'"
              @click.stop="navigateToDetail(ep)"
            >
              <el-icon class="mr-1.5"><Picture /></el-icon>分镜生成
            </button>
            <button 
              :class="[s.stepBtn, { [s.active]: ep.storyboardStatus === 'success' && (ep.synthesisStatus === 'pending' || ep.synthesisStatus === 'synthesizing') }]"
              :disabled="ep.storyboardStatus !== 'success'"
              @click.stop="handleSynthesis(ep)"
            >
              <el-icon class="mr-1.5"><MagicStick /></el-icon>视频合成
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
      @cancel="cancelBatchGenerate"
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
  Document, Picture, Film, MagicStick, Loading, VideoPlay, Check, Download
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
      case 'script_pending':
        matchesStatus = ep.scriptStatus === 'pending';
        break;
      case 'assets_pending':
        matchesStatus = ep.scriptStatus === 'success' && ep.assetsStatus === 'pending';
        break;
      case 'storyboard_generating':
        matchesStatus = ep.storyboardStatus === 'generating';
        break;
      case 'completed':
        matchesStatus = ep.synthesisStatus === 'success';
        break;
    }
    
    return matchesQuery && matchesStatus;
  });
});

const hasGeneratedAny = computed(() => episodes.value.some(ep => ep.status === 'success'));

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
        title: '第 2 集：重生归来',
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
        id: '3',
        index: 3,
        title: '第 3 集：商战风云',
        poster: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=400',
        roleCount: 4,
        sceneCount: 2,
        propCount: 2,
        storyboardCount: 10,
        scriptStatus: 'pending',
        assetsStatus: 'pending',
        storyboardStatus: 'pending',
        synthesisStatus: 'pending',
        status: 'pending',
        storyboardGenerated: false,
        duration: '00:45',
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
const handleCardClick = (ep: any) => {
  // 根据当前状态决定点击后的行为
  if (ep.scriptStatus === 'pending') {
    navigateToOutline(ep);
  } else if (ep.assetsStatus === 'pending') {
    navigateToAssets(ep);
  } else if (ep.storyboardStatus === 'pending' || ep.storyboardStatus === 'generating' || ep.storyboardStatus === 'success') {
    navigateToDetail(ep);
  } else if (ep.synthesisStatus === 'success') {
    handlePreview(ep);
  }
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

