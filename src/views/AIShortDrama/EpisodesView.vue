<template>
  <div :class="s.page">
    <!-- Header: Title and Batch Action -->
    <div :class="s.header">
      <div :class="s.left">
        <h2 class="text-2xl font-black text-slate-800 tracking-tight">共 {{ episodes.length }} 集</h2>
        <p class="text-slate-400 text-sm mt-1">智能生成分镜脚本，开启你的短剧创作之旅</p>
      </div>
      <div :class="s.right" class="flex items-center gap-3">
        <button 
          v-if="!isMultiSelect" 
          @click="isMultiSelect = true" 
          class="h-10 px-6 bg-white text-slate-600 border border-slate-200 rounded-full text-[14px] font-bold hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm"
        >
          多选
        </button>
        <template v-else>
          <button 
            @click="cancelMultiSelect"
            class="h-10 px-6 bg-white text-slate-500 rounded-full text-[14px] font-bold hover:text-slate-700 transition-all"
          >
            取消
          </button>
          <button 
            :disabled="selectedIds.length === 0" 
            @click="handleBatchGenerate"
            class="h-10 px-8 bg-indigo-600 text-white rounded-full text-[14px] font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center gap-2"
          >
            <el-icon><MagicStick /></el-icon>
            批量生成
          </button>
        </template>
      </div>
    </div>

    <!-- Episode Grid Layout -->
    <div :class="[s.container, s.gridLayout]" ref="listRef">
      <div 
        v-for="ep in episodes" 
        :key="ep.id" 
        :class="[
          s.gridCard, 
          { [s.selected]: selectedIds.includes(ep.id) }
        ]"
        @click="handleCardClick(ep)"
      >
        <div v-if="isMultiSelect" :class="s.checkbox">
          <el-checkbox :model-value="selectedIds.includes(ep.id)" @change="toggleSelect(ep.id)" @click.stop />
        </div>
        
        <div :class="s.index">{{ ep.index }}</div>
        
        <div :class="s.posterWrapper">
          <div :class="s.poster">
            <el-image :src="ep.poster" fit="cover" />
            <div v-if="ep.status === 'generating'" :class="s.generatingOverlay">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>生成中</span>
            </div>
            <!-- Duration Badge -->
            <div v-if="ep.status === 'success' && ep.storyboardGenerated" :class="s.durationBadge">
              {{ ep.duration || '01:12' }}
            </div>
          </div>
        </div>

        <div :class="s.info">
          <h3 :class="s.epTitle">{{ ep.title }}</h3>
          <div :class="s.meta">
            <span><el-icon><User /></el-icon> {{ ep.roleCount }} 角色</span>
            <span><el-icon><Location /></el-icon> {{ ep.sceneCount }} 场景</span>
            <span><el-icon><Box /></el-icon> {{ ep.propCount || 0 }} 道具</span>
            <span><el-icon><VideoCamera /></el-icon> {{ ep.storyboardCount || 16 }} 分镜</span>
          </div>
          
          <!-- Actions Logic -->
          <div :class="s.gridActions">
            <!-- 脚本生成后且未合成全集，只显示编辑按钮 -->
            <template v-if="ep.status === 'success' && ep.storyboardGenerated">
              <template v-if="ep.synthesisStatus === 'success'">
                <button 
                  class="h-9 px-4 bg-indigo-50 text-indigo-600 rounded-lg text-[13px] font-bold hover:bg-indigo-100 transition-all flex items-center gap-1.5"
                  @click.stop="handlePreview(ep)"
                >
                  <el-icon><VideoPlay /></el-icon> 预览
                </button>
                <button 
                  class="h-9 px-4 bg-white text-slate-600 border border-slate-200 rounded-lg text-[13px] font-bold hover:text-indigo-600 hover:border-indigo-100 transition-all flex items-center gap-1.5"
                  @click.stop="navigateToDetail(ep)"
                >
                  <el-icon><Edit /></el-icon> 编辑
                </button>
                <button 
                  class="h-9 px-4 bg-slate-900 text-white rounded-lg text-[13px] font-bold hover:bg-black transition-all flex items-center gap-1.5 shadow-sm"
                  @click.stop="handleExport(ep)"
                >
                  <el-icon><Download /></el-icon> 导出
                </button>
              </template>
              <template v-else>
                <button 
                  class="h-10 px-6 bg-indigo-600 text-white rounded-full text-[14px] font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-md shadow-indigo-500/10"
                  @click.stop="navigateToDetail(ep)"
                >
                  <el-icon><Edit /></el-icon> 进入编辑
                </button>
              </template>
            </template>

            <!-- 未生成状态显示生成按钮 -->
            <button 
              v-else-if="ep.status === 'pending' || ep.status === 'failed'" 
              @click.stop="handleGenerate(ep)"
              class="h-10 px-8 bg-indigo-600 text-white rounded-full text-[14px] font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-md shadow-indigo-500/10"
            >
              <el-icon><MagicStick /></el-icon>
              立即生成
            </button>
            
            <div v-else :class="s.status" class="flex items-center gap-2">
              <span v-if="ep.status === 'generating'" class="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <el-icon class="is-loading"><Loading /></el-icon> 分镜脚本生成中...
              </span>
            </div>
                <span class="text-red-500 flex items-center gap-1 text-sm"><el-icon><Warning /></el-icon> 生成失败</span>
                <button 
                  @click.stop="handleGenerate(ep)"
                  class="text-indigo-600 font-bold text-sm hover:underline"
                >
                  重试
                </button>
            </div>
            </template>
            </div>
          </div>

          <!-- Pending/Generating Status Text -->
          <div v-if="ep.status !== 'success'" :class="s.statusText">
            <span v-if="ep.status === 'pending'" :class="s.pending">等待生成</span>
            <span v-else-if="ep.status === 'failed'" :class="s.failed">生成失败</span>
          </div>
            <span v-if="ep.status === 'pending'" :class="s.pending">等待生成</span>
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

    <!-- Preview Modal for Synthesized Video -->
    <el-dialog
      v-model="previewVisible"
      :title="`预览全集: ${previewEpisode?.title}`"
      width="800px"
      destroy-on-close
      center
      class="preview-dialog"
    >
      <div class="aspect-video bg-black rounded-lg overflow-hidden">
        <video 
          v-if="previewEpisode?.synthesisVideo"
          :src="previewEpisode.synthesisVideo" 
          class="w-full h-full"
          controls
          autoplay
        ></video>
        <div v-else class="w-full h-full flex items-center justify-center text-white">
          视频加载失败
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Loading, User, Location, Check, Warning, QuestionFilled, 
  VideoCamera, VideoPlay, Edit, Download, Box 
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useEpisodeStore } from '@/store/episode';
import s from './EpisodesView.module.scss';

// Components
import EpisodesEditDrawer from '@/components/episode/EpisodesEditDrawer.vue';
import ProgressModal from '@/components/episode/ProgressModal.vue';

const router = useRouter();
const episodeStore = useEpisodeStore();

// State
const isMultiSelect = ref(false);
const selectedIds = ref<string[]>([]);
const drawerVisible = ref(false);
const editingEpisode = ref<any>(null);
const progressVisible = ref(false);
const batchProgress = ref(0);
const previewVisible = ref(false);
const previewEpisode = ref<any>(null);

const episodes = computed(() => episodeStore.episodes);
const hasGeneratedAny = computed(() => episodes.value.some(ep => ep.status === 'success'));

// Initialize mock data if empty
onMounted(() => {
  if (episodes.value.length === 0) {
    episodeStore.setEpisodes([
      {
        id: '1',
        index: 1,
        title: '第 1 集：命运抉择系统自毁',
        poster: 'https://picsum.photos/seed/1/200/300',
        roleCount: 7,
        sceneCount: 2,
        propCount: 5,
        storyboardCount: 16,
        status: 'pending',
        storyboardGenerated: false,
        duration: '01:12',
        gif: '',
        synthesisStatus: 'pending'
      },
      {
        id: '2',
        index: 2,
        title: '第 2 集：重生归来',
        poster: 'https://picsum.photos/seed/2/200/300',
        roleCount: 5,
        sceneCount: 3,
        propCount: 3,
        storyboardCount: 12,
        status: 'pending',
        storyboardGenerated: false,
        duration: '00:38',
        gif: '',
        synthesisStatus: 'pending'
      }
    ]);
  }
});

// Actions
const toggleSelect = (id: string) => {
  const index = selectedIds.value.indexOf(id);
  if (index > -1) {
    selectedIds.value.splice(index, 1);
  } else {
    selectedIds.value.push(id);
  }
};

const cancelMultiSelect = () => {
  isMultiSelect.value = false;
  selectedIds.value = [];
};

const handleCardClick = (ep: any) => {
  if (isMultiSelect.value) {
    toggleSelect(ep.id);
  } else {
    if (ep.status === 'success') {
      // 如果已经生成，点击卡片默认进入详情编辑
      navigateToDetail(ep);
    } else {
      handleGenerate(ep);
    }
  }
};

const handleGenerate = async (ep: any) => {
  episodeStore.updateEpisode(ep.id, { status: 'generating' });
  
  // Track event
  trackEvent('shortDrama_generate_storyboard', { episodeId: ep.id });

  try {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    episodeStore.updateEpisode(ep.id, { 
      status: 'success', 
      storyboardGenerated: true 
    });
    
    ElMessage.success('分镜脚本生成成功');
    // 如果是第一集生成，刷新页面布局
    if (!hasGeneratedAny.value) {
      // 触发计算属性更新
    }
  } catch (error) {
    episodeStore.updateEpisode(ep.id, { 
      status: 'failed', 
      errorReason: '网络超时，请稍后重试' 
    });
    ElMessage.error('分镜脚本生成失败');
  }
};

const handlePreview = (ep: any) => {
  if (ep.synthesisVideo) {
    previewEpisode.value = ep;
    previewVisible.value = true;
  } else {
    ElMessage.warning('全集视频尚未合成，无法预览');
  }
};

const handleExport = (ep: any) => {
  if (ep.synthesisVideo) {
    const link = document.createElement('a');
    link.href = ep.synthesisVideo;
    link.download = `${ep.title}-full.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    ElMessage.success(`正在导出全集视频: ${ep.title}`);
  } else {
    ElMessage.warning('全集视频尚未合成，无法导出');
  }
};

const handleBatchGenerate = async () => {
  progressVisible.value = true;
  batchProgress.value = 0;
  
  trackEvent('shortDrama_batchGenerate_storyboard', { count: selectedIds.value.length });

  const total = selectedIds.value.length;
  for (let i = 0; i < total; i++) {
    const id = selectedIds.value[i];
    episodeStore.updateEpisode(id, { status: 'generating' });
    
    // Simulate progress
    await new Promise(resolve => setTimeout(resolve, 1000));
    batchProgress.value = Math.floor(((i + 1) / total) * 100);
    
    episodeStore.updateEpisode(id, { 
      status: 'success', 
      storyboardGenerated: true 
    });
  }
  
  setTimeout(() => {
    progressVisible.value = false;
    isMultiSelect.value = false;
    selectedIds.value = [];
    ElMessage.success('批量生成成功');
  }, 500);
};

const cancelBatchGenerate = () => {
  progressVisible.value = false;
  ElMessage.info('批量生成已取消');
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
    path: `/storyboard/${ep.id}`,
    query: { subjectId: episodeStore.subjectId }
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

