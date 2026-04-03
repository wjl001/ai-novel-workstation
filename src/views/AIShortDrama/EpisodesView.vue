<template>
  <div :class="s.page">
    <!-- Header: Title and Batch Action -->
    <div :class="s.header">
      <div :class="s.left">
        <h2 :class="s.title">共 {{ episodes.length }} 集</h2>
        <p :class="s.subtitle"></p>
      </div>
      <div :class="s.right">
        <el-button v-if="!isMultiSelect" @click="isMultiSelect = true" :class="s.batchBtn">多选</el-button>
        <template v-else>
          <el-button @click="cancelMultiSelect">取消</el-button>
          <el-button type="primary" :disabled="selectedIds.length === 0" @click="handleBatchGenerate">批量生成</el-button>
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
                <el-button size="small" :icon="VideoPlay" @click.stop="handlePreview(ep)">预览</el-button>
                <el-button size="small" :icon="Edit" @click.stop="navigateToDetail(ep)">编辑</el-button>
                <el-button size="small" :icon="Download" class="!bg-black !text-white !border-black" @click.stop="handleExport(ep)">导出</el-button>
              </template>
              <template v-else>
                <el-button size="small" :icon="Edit" @click.stop="navigateToDetail(ep)">编辑</el-button>
              </template>
            </template>

            <!-- 未生成状态显示生成按钮 -->
            <el-button 
              v-else-if="ep.status === 'pending' || ep.status === 'failed'" 
              type="primary" 
              size="small"
              @click.stop="handleGenerate(ep)"
            >
              生成
            </el-button>
            
            <div v-else :class="s.status">
              <span v-if="ep.status === 'generating'" :class="s.generating">分镜脚本生成中...</span>
<span>
                <el-icon><Warning /></el-icon> 生成失败
                <el-button link type="primary" size="small" @click.stop="handleGenerate(ep)">重试</el-button>
              </span>
            </div>
          </div>

          <!-- Pending/Generating Status Text -->
          <div v-if="ep.status !== 'success'" :class="s.statusText">
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

