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
            placeholder="搜索剧集集数/标题..." 
            @input="handleSearch"
          />
        </div>
        <!-- <el-select 
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
        </el-select> -->
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

    <div :class="s.content">
      <div :class="s.container" ref="listRef">
        <div :class="s.gridLayout">
          <div 
            v-for="ep in paginatedTabEpisodes" 
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

                <div :class="s.posterActions">
                  <button :class="s.uploadBtn" @click.stop="handleUploadCover(ep)">
                    <span>上传封面</span>
                  </button>
                  <button :class="s.aiGenBtn" @click.stop="handleAIGenerateCover(ep)">
                    <el-icon :size="12"><MagicStick /></el-icon>
                    <span>AI生成</span>
                  </button>
                </div>

                <div v-if="ep.synthesisStatus === 'success'" :class="s.durationBadge">
                  {{ ep.duration || '01:12' }}
                </div>
                <div :class="s.indexBadge">{{ ep.index }}</div>
              </div>
            </div>

            <div :class="s.info">
              <h3 :class="s.epTitle" :title="ep.title">{{ ep.title }}</h3>
              
              <div :class="[s.singleStatus, s[getSingleStatusType(ep)]]">
                <el-icon v-if="getSingleStatusType(ep) === 'processing'" class="is-loading"><Loading /></el-icon>
                <el-icon v-else-if="getSingleStatusType(ep) === 'completed'"><Check /></el-icon>
                <el-icon v-else-if="getSingleStatusType(ep) === 'assets'"><Box /></el-icon>
                <el-icon v-else><Document /></el-icon>
                <span>{{ getSingleStatusLabel(ep) }}</span>
              </div>
            </div>

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

      <div v-if="episodes.length === 0" :class="s.empty">
        <el-empty description="暂无分集数据" />
      </div>
    </div>

    <div v-if="currentTabTotal > 0" :class="s.paginationSection">
      <div :class="s.paginationCard">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 36, 48]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="currentTabTotal"
          :class="s.pagination"
        />
      </div>
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

    <ProductDesignDialog
      v-model="showDesignDialog"
      id="short-drama-episodes"
      :default-content="{
        title: '剧集规划',
        location: '管理短剧的单集列表，提供从大纲到分镜图生成的批量控制入口。',
        layout: [
          '**顶部控制：** 提供“多选”、“批量生成”等全局操作。',
          '**单集卡片：** 展示集数、核心情节摘要、包含的角色/场景数量、以及当前生成的封面图或状态。'
        ],
        interactions: [
          {
            text: '**局部/批量生成：** 用户可以选择某几集卡片，点击“批量生成”，系统后台排队处理图文生成（节省 Token 和时间）。',
            image: ''
          },
          {
            text: '**功能说明 (2.2版本)：**\n - **手动新增剧集：** 2.2版本支持手动新增、编辑或删除剧集大纲，赋能更灵活的创作需求。',
            image: ''
          }
        ],
        version: '2.2'
      }"
    />

    <!-- Recovery Confirm Dialog -->
    <ConfirmDialog
      v-model="recoveryConfirmVisible"
      :title="recoveryConfirmTitle"
      :message="recoveryConfirmMessage"
      confirm-text="继续生成"
      cancel-text="放弃"
      @confirm="handleRecoveryConfirm"
      @cancel="handleRecoveryCancel"
    />

    <button
      type="button"
      class="fixed bottom-6 right-6 z-[60] w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 shadow-lg shadow-indigo-500/30 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      title="UI 设计标注"
      @click="showUIDesignSpecsDialog = true"
    >
      <el-icon :size="22"><Monitor /></el-icon>
    </button>

    <GlobalUIDesignSpecsDialog
      v-model="showUIDesignSpecsDialog"
      title="剧集管理｜UI 设计标注"
      subtitle="Episodes View UI Specs"
      :groups="episodesUIDesignGroups"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { 
  ArrowLeft, InfoFilled, Search, User, Location, Box, VideoCamera, 
  Document, Picture, Film, MagicStick, Loading, VideoPlay, Check, Download,
  EditPen,
  Monitor
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useEpisodeStore } from '@/store/episode';
import s from '@/styles/AIShortDrama/EpisodesView.module.scss';

// Components
import EpisodesEditDrawer from '@/components/episode/EpisodesEditDrawer.vue';
import ProgressModal from '@/components/episode/ProgressModal.vue';

import ConfirmDialog from '@/components/Common/ConfirmDialog.vue';
import ProductDesignDialog from '@/components/Common/ProductDesignDialog.vue';
import GlobalUIDesignSpecsDialog from '@/components/Common/GlobalUIDesignSpecsDialog.vue';

const router = useRouter();
const episodeStore = useEpisodeStore();

// State
const showDesignDialog = ref(false);
const showUIDesignSpecsDialog = ref(false);
const drawerVisible = ref(false);
const editingEpisode = ref<any>(null);

const episodesUIDesignGroups = {
  layout: [
    {
      id: 'episodes-view-page',
      title: '页面结构',
      description: '剧集管理（卡片列表）整体布局与容器规格',
      items: [
        { name: '页面内边距', value: '30px', description: '.page padding' },
        { name: '页面背景色', value: '#f0f4f8', description: '.page background-color' },
        { name: '背景光晕', value: 'radial-gradient x2', description: '蓝/紫透明径向渐变' },
        { name: 'Header 间距', value: 'margin-bottom: 30px', description: '.header' },
        { name: 'Header 左右间距', value: 'padding: 0 10px', description: '.header' },
        { name: 'Header 元素间距', value: 'gap: 24px', description: '.header' }
      ]
    },
    {
      id: 'episodes-view-header',
      title: '顶部控件',
      description: '搜索栏 / Tab 切换 / 说明按钮',
      items: [
        { name: '搜索栏最大宽度', value: '500px', description: '.searchBar max-width' },
        { name: '搜索栏圆角', value: '16px', description: '.searchBar border-radius' },
        { name: '搜索栏内边距', value: '6px', description: '.searchBar padding' },
        { name: 'Tab 容器圆角', value: '18px', description: '.tabSwitcher border-radius' },
        { name: 'Tab 容器内边距', value: '6px', description: '.tabSwitcher padding' },
        { name: 'Tab 间距', value: 'gap: 8px', description: '.tabSwitcher' }
      ]
    },
    {
      id: 'episodes-view-cards',
      title: '卡片网格',
      description: '剧集卡片列表与卡片尺寸',
      items: [
        { name: '网格列规则', value: 'auto-fill min 360px', description: '.gridLayout template-columns' },
        { name: '网格间距', value: '16px', description: '.gridLayout gap' },
        { name: '卡片最大宽度', value: '420px', description: '.gridCard max-width' },
        { name: '卡片圆角', value: '20px', description: '.gridCard border-radius' },
        { name: '卡片内边距', value: '12px', description: '.gridCard padding' },
        { name: '卡片内元素间距', value: '16px', description: '.gridCard gap' }
      ]
    },
    {
      id: 'episodes-view-pagination',
      title: '分页区域',
      description: '分页容器与视觉层次',
      items: [
        { name: '分页区对齐', value: 'center', description: '.paginationSection justify-content' },
        { name: '分页卡片背景', value: 'rgba(255,255,255,0.8)', description: '.paginationCard' },
        { name: '分页卡片圆角', value: '18px', description: '.paginationCard border-radius' },
        { name: '分页卡片模糊', value: 'blur(12px)', description: '.paginationCard backdrop-filter' },
        { name: '分页卡片阴影', value: '0 10px 30px -12px', description: '.paginationCard box-shadow' }
      ]
    }
  ],
  style: [
    {
      id: 'episodes-view-typography',
      title: '文字层级',
      description: '页面常用字号/字重与展示规则',
      items: [
        { name: 'Tab 文案', style: { fontSize: '15px', fontWeight: 900, color: '#64748b' } as Record<string, string | number>, description: '.tabBtn font-size/weight/color' },
        { name: 'Tab 数量徽标', style: { fontSize: '12px', fontWeight: 900, color: '#94a3b8' } as Record<string, string | number>, description: '.tabCount' },
        { name: '搜索输入', style: { fontSize: '14px', fontWeight: 400, color: '#1e293b' } as Record<string, string | number>, description: '.searchInputWrapper input' },
        { name: '卡片标题', style: { fontSize: '13px', fontWeight: 800, color: '#1e293b', lineHeight: 1.4 } as Record<string, string | number>, description: '.epTitle 单行省略' },
        { name: '状态胶囊', style: { fontSize: '10px', fontWeight: 800, color: '#ffffff' } as Record<string, string | number>, description: '.singleStatus' },
        { name: '卡片操作按钮', style: { fontSize: '11px', fontWeight: 900, color: '#ffffff' } as Record<string, string | number>, description: '.stepBtn' }
      ]
    }
  ],
  color: [
    {
      id: 'episodes-view-colors',
      title: '颜色与渐变',
      description: '关键色、边框与阴影（用于复刻一致 UI）',
      items: [
        { name: '页面底色', value: '#f0f4f8' },
        { name: '容器边框', value: '#e2e8f0' },
        { name: '弱背景', value: '#f8fafc' },
        { name: '正文主色', value: '#1e293b' },
        { name: '次级文字', value: '#64748b' },
        { name: '占位/提示', value: '#94a3b8' },
        { name: 'Tab-剧本待写', value: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
        { name: 'Tab-主体待设', value: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' },
        { name: 'Tab-分镜制作', value: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' },
        { name: 'Tab-已完成', value: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
        { name: '预览按钮', value: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }
      ]
    }
  ],
  button: [
    {
      id: 'episodes-view-components',
      title: '按钮与组件状态',
      description: '可复用的按钮规格、交互与状态',
      items: [
        {
          name: '返回按钮（左上角）',
          tag: '<button>',
          classes: 'w-10 h-10 rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-slate-100 hover:scale-105 active:scale-95',
          notes: ['hover：文字变为 indigo 系', 'active：scale-95', '暗色模式：bg-slate-800/border-slate-700']
        },
        {
          name: 'Tab 切换按钮',
          tag: '.tabBtn (module)',
          classes: 'padding: 8px 20px; radius: 14px; hover: background #f8fafc + translateY(-1px); active: gradient + translateY(-2px)',
          notes: ['active：根据状态使用不同渐变（pending/assets/processing/completed）', 'active：tabCount 变为半透明白底']
        },
        {
          name: '封面遮罩操作（上传/AI生成）',
          tag: '.posterActions button (module)',
          classes: 'w-80px h-28px radius: 8px; hover: scale(1.05); active: scale(0.95)',
          notes: ['uploadBtn：白底 + indigo 字色', 'aiGenBtn：indigo→purple 渐变 + 白字']
        },
        {
          name: '卡片右侧操作按钮（编辑/预览）',
          tag: '.stepBtn (module)',
          classes: 'h-28px px-12px radius: 8px; hover: translateY(-2px) scale(1.02); disabled: opacity 0.3 grayscale',
          notes: ['编辑：amber 渐变', '预览：purple 渐变（未完成禁用）']
        },
        {
          name: '右下角 UI 标注入口（本按钮）',
          tag: '<button>',
          classes: 'fixed bottom-6 right-6 w-12 h-12 rounded-full gradient indigo→fuchsia shadow hover:scale-105 active:scale-95',
          notes: ['用于前端对照 UI 规范面板（分类 Tab）', 'z-index: 60，确保在卡片与分页之上']
        }
      ]
    }
  ]
};

// Recovery Confirm Dialog State
const recoveryConfirmVisible = ref(false);
const recoveryConfirmTitle = ref('');
const recoveryConfirmMessage = ref('');
const handleRecoveryConfirm = () => {
  const synthesizingEpisodes = episodes.value.filter(ep => ep.synthesisStatus === 'synthesizing');
  synthesizingEpisodes.forEach(ep => handleSynthesis(ep));
};
const handleRecoveryCancel = () => {
  const synthesizingEpisodes = episodes.value.filter(ep => ep.synthesisStatus === 'synthesizing');
  synthesizingEpisodes.forEach(ep => {
    episodeStore.updateEpisode(ep.id, { synthesisStatus: 'pending' });
  });
};
const progressVisible = ref(false);
const batchProgress = ref(0);
const previewVisible = ref(false);
const previewEpisode = ref<any>(null);
const searchQuery = ref('');
const statusFilter = ref('');
const currentPage = ref(1);
const pageSize = ref(12);

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

const currentTabTotal = computed(() => currentTabEpisodes.value.length);

const paginatedTabEpisodes = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return currentTabEpisodes.value.slice(start, start + pageSize.value);
});

watch([activeTab, searchQuery, statusFilter], () => {
  currentPage.value = 1;
});

watch([currentTabTotal, pageSize], () => {
  const maxPage = Math.max(1, Math.ceil(currentTabTotal.value / pageSize.value));
  if (currentPage.value > maxPage) currentPage.value = maxPage;
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
  episodeStore.loadFromLocalStorage();

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

  // Check for interrupted synthesis
  const synthesizingEpisodes = episodes.value.filter(ep => ep.synthesisStatus === 'synthesizing');
  if (synthesizingEpisodes.length > 0) {
    recoveryConfirmTitle.value = '恢复合成';
    recoveryConfirmMessage.value = `检测到有 ${synthesizingEpisodes.length} 集视频合成意外中断，是否恢复合成？`;
    recoveryConfirmVisible.value = true;
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

