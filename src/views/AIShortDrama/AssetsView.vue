<template>
  <div class="h-full flex flex-col overflow-hidden relative">
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
            <button 
              @click="addAsset('character')"
              class="h-10 px-6 bg-indigo-600 text-white rounded-full text-[14px] font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <el-icon><Plus /></el-icon>
              新增角色
            </button>
          </div>
          <div class="flex-1 pr-2">
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 pb-6">
              <div 
                v-for="char in characters" 
                :key="char.id" 
                class="group relative flex flex-col bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 cursor-pointer hover:-translate-y-1"
                @click="openEditModal(char, 'character')"
              >
                <div class="aspect-[3/4] bg-slate-50 relative overflow-hidden">
                  <el-image 
                    v-if="char.image" 
                    :src="char.image" 
                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    fit="cover"
                  />
                  <div v-else class="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <el-icon size="40" class="mb-2"><Picture /></el-icon>
                    <span class="text-[14px]">暂无画面</span>
                  </div>
                  <!-- Overlay Action -->
                  <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1890ff] shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                      <el-icon size="20"><Edit /></el-icon>
                    </div>
                  </div>
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
            <button 
              @click="addAsset('scene')"
              class="h-10 px-6 bg-indigo-600 text-white rounded-full text-[14px] font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <el-icon><Plus /></el-icon>
              新增场景
            </button>
          </div>
          <div class="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-6">
              <div 
                v-for="scene in scenes" 
                :key="scene.id" 
                class="group relative flex flex-col bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 cursor-pointer hover:-translate-y-1"
                @click="openEditModal(scene, 'scene')"
              >
                <div class="aspect-video bg-slate-50 relative overflow-hidden">
                  <el-image 
                    v-if="scene.image" 
                    :src="scene.image" 
                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    fit="cover"
                  />
                  <div v-else class="w-full h-full flex flex-col items-center justify-center text-slate-300">
                    <el-icon size="40" class="mb-2"><Picture /></el-icon>
                    <span class="text-[13px]">暂无画面</span>
                  </div>
                  <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1890ff] shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                      <el-icon size="20"><Edit /></el-icon>
                    </div>
                  </div>
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
            <button 
              @click="addAsset('prop')"
              class="h-10 px-6 bg-indigo-600 text-white rounded-full text-[14px] font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <el-icon><Plus /></el-icon>
              新增道具
            </button>
          </div>
          <div class="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 pb-6">
              <div 
                v-for="prop in propsList" 
                :key="prop.id" 
                class="group relative flex flex-col bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 cursor-pointer hover:-translate-y-1"
                @click="openEditModal(prop, 'prop')"
              >
                <div class="aspect-square bg-slate-50 relative overflow-hidden">
                  <el-image 
                    v-if="prop.image" 
                    :src="prop.image" 
                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    fit="cover"
                  />
                  <div v-else class="w-full h-full flex flex-col items-center justify-center text-slate-300">
                    <el-icon size="40" class="mb-2"><Picture /></el-icon>
                    <span class="text-[13px]">暂无画面</span>
                  </div>
                  <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1890ff] shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                      <el-icon size="20"><Edit /></el-icon>
                    </div>
                  </div>
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
        content="请先完成主体设置"
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
    <el-dialog v-model="showDesignDialog" title="产品设计说明 - 视觉与听觉资产中心" width="700px" class="rounded-[24px] !bg-[#f8fafc] dark:!bg-slate-900 overflow-hidden" :show-close="false">
      <template #header="{ close, titleId, titleClass }">
        <div class="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
              <el-icon :size="20"><Document /></el-icon>
            </div>
            <h4 :id="titleId" :class="[titleClass, 'text-xl font-black text-slate-800 dark:text-white m-0']">产品设计说明 - 资产中心</h4>
          </div>
          <button @click="close" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
            <el-icon :size="20"><Close /></el-icon>
          </button>
        </div>
      </template>
      
      <div class="px-6 py-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
        <div class="prose dark:prose-invert max-w-none">
          <h3 class="text-indigo-600 font-bold flex items-center gap-2 mb-4"><el-icon><Location /></el-icon>页面定位</h3>
          <p class="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">AI 创作最大的痛点是“人脸一致性”，这是解决此问题的核心页面。管理剧本中所有的角色、场景、道具，并固定其形象特征。</p>

          <h3 class="text-indigo-600 font-bold flex items-center gap-2 mb-4"><el-icon><Monitor /></el-icon>原型布局概要</h3>
          <ul class="space-y-3 mb-6">
            <li class="flex items-start gap-2 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-50 dark:border-slate-700/50">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
              <span class="text-slate-600 dark:text-slate-300"><strong>Tabs 导航：</strong>分类管理【角色库】、【场景库】、【道具库】。</span>
            </li>
            <li class="flex items-start gap-2 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-50 dark:border-slate-700/50">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
              <span class="text-slate-600 dark:text-slate-300"><strong>卡片网格：</strong>每个主体（角色/场景）以卡片形式展示，包含基准图（Reference Image）、名字、特征描述。</span>
            </li>
          </ul>

          <h3 class="text-indigo-600 font-bold flex items-center gap-2 mb-4"><el-icon><Pointer /></el-icon>核心交互</h3>
          <ul class="space-y-3">
            <li class="flex items-start gap-2 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-50 dark:border-slate-700/50">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
              <span class="text-slate-600 dark:text-slate-300"><strong>AI 捏脸/生成：</strong>点击卡片进入编辑模式，可修改 Prompt，重新生成多张备选图，并挑选一张作为全局“锁定形象 (Seed/LoRA)”。</span>
            </li>
            <li class="flex items-start gap-2 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-50 dark:border-slate-700/50">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
              <span class="text-slate-600 dark:text-slate-300"><strong>强制前置校验：</strong>必须至少完成一个角色和一个场景的设定，才能点击“下一步：分镜视频”。</span>
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
import { ref, reactive, computed } from 'vue';
import { Plus, Picture, Edit, MagicStick, Upload, ArrowRight, InfoFilled, Close, Document, Location, Monitor, Pointer } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import SubjectEditDialog from '@/components/AIShortDrama/SubjectEditDialog.vue';

const router = useRouter();
const activeTab = ref('characters');
const showDesignDialog = ref(false);

// Navigation Logic
const confirmVisible = ref(false);
const hasUnsavedChanges = ref(false); // For demo, let's say true if we edited anything

const isAssetsComplete = computed(() => {
  return characters.value.length > 0 && scenes.value.length > 0;
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

// Mock Data
const characters = ref([
  { id: '1', name: '林星', description: '28岁，广告公司创意总监，外表坚强内心柔软，职场女强人。', prompt: '1个女孩，美丽，职业装，办公室女性，坚强独立，写实风格，8k分辨率', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: '2', name: '陈宇', description: '30岁，自由摄影师，随性洒脱，林星的青梅竹马。', prompt: '1个男孩，英俊，休闲装，摄影师，轻松自然，写实风格，8k分辨率', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
]);

const scenes = ref([
  { id: '1', name: '公司会议室', description: '现代感十足的会议室，落地窗，能看到繁华的都市夜景。', prompt: '现代办公室会议室，大落地窗，繁华城市夜景，电影级光影，8k分辨率', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: '2', name: '林星公寓', description: '温馨的单身公寓，布置得很有格调。', prompt: '温馨单身公寓，室内设计时尚，暖色调灯光，写实风格，8k分辨率', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
]);

const propsList = ref([
  { id: '1', name: '复古相机', description: '陈宇常用的老式胶片相机，带有岁月痕迹。', prompt: '复古胶片相机，细节质感丰富，电影级光影，8k分辨率', image: 'https://images.unsplash.com/photo-1516961642265-531546e84af2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: '2', name: '定情项链', description: '一条星星形状的银质项链。', prompt: '星形纯银项链，闪耀光泽，微距摄影，8k分辨率', image: 'https://images.unsplash.com/photo-1599643478514-4a42080164c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
]);

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
  
  let targetList;
  if (data.type === 'character') targetList = characters.value;
  else if (data.type === 'scene') targetList = scenes.value;
  else targetList = propsList.value;

  const index = targetList.findIndex((a: any) => a.id === data.id);
  if (index > -1) {
    targetList[index] = data;
  } else {
    targetList.push(data);
  }
  
  ElMessage.success('保存成功');
  editModalVisible.value = false;
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
</style>
