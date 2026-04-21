<template>
  <el-drawer
    v-model="visible"
    direction="rtl"
    size="90%"
    :with-header="false"
    destroy-on-close
    class="episode-edit-drawer"
  >
    <div class="h-full flex flex-col overflow-hidden bg-[#f8fafc]">
      <!-- Header -->
      <div class="flex justify-between items-center px-6 py-4 bg-white border-b border-slate-100">
        <div class="flex items-center gap-4">
          <h2 class="text-[18px] font-bold text-slate-800">{{ episode?.title }}</h2>
          <el-tag type="success" size="small">已生成分镜</el-tag>
        </div>
        <div class="flex items-center gap-3">
          <el-button @click="visible = false">取消</el-button>
          <el-button type="primary" class="theme-primary-btn" @click="$emit('enter-detail', episode)">进入详情</el-button>
        </div>
      </div>

      <!-- Main Body -->
      <div class="flex-1 flex overflow-hidden p-4 gap-4">
        <!-- Left: Subject Library (主体库) -->
        <div class="w-[280px] bg-white rounded-xl border border-slate-100 flex flex-col overflow-hidden">
          <div class="p-4 border-b border-slate-50 flex justify-between items-center">
            <span class="font-bold text-slate-800">主体库</span>
            <el-icon class="cursor-pointer text-slate-400"><Plus /></el-icon>
          </div>
          <el-tabs v-model="activeAssetTab" class="asset-tabs flex-1 flex flex-col overflow-hidden">
            <el-tab-pane label="角色 (8)" name="roles">
              <!-- Content -->
            </el-tab-pane>
            <el-tab-pane label="场景 (3)" name="scenes">
              <!-- Content -->
            </el-tab-pane>
            <el-tab-pane label="道具 (5)" name="props">
              <div class="p-3 grid grid-cols-2 gap-3 overflow-y-auto custom-scrollbar">
                <div v-for="i in 5" :key="i" class="flex flex-col gap-1 items-center">
                  <div class="w-full aspect-square rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <el-icon size="24" class="text-slate-300"><Box /></el-icon>
                  </div>
                  <span class="text-[12px] text-slate-600">道具 {{ i }}</span>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>

        <!-- Middle: Editor -->
        <div class="flex-1 flex flex-col gap-4 overflow-hidden">
          <div class="flex-1 bg-white rounded-xl border border-slate-100 p-6 overflow-y-auto custom-scrollbar">
            <div class="flex justify-between items-center mb-6">
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-800">片段 1</span>
                <span class="text-[12px] text-slate-400">片段时长限制在 4-15s，输入 "@" 可快速调整镜头时长、引用角色、场景、素材</span>
              </div>
              <span class="text-[12px] text-slate-400">分镜耗时消耗2积分，以实际生成为准</span>
            </div>
            
            <div class="flex flex-col gap-6">
              <div class="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <p class="text-[14px] text-slate-600 leading-relaxed">
                  画面风格和类型：真人写实,电影风格,复古调色,男频古装。<br/>
                  生成一个由以下 2 个分镜组成的视频。<br/>
                  本片场提示设定在：@港西村落_0。<br/>
                  分镜1 5.0s：真人写实电影风格，复古调色，阳光柔和地洒在宁静的港西村落田埂上。@赵铁牛 基础形象 亦正亦邪 赤着上身，古铜色的皮肤淌着汗水，正奋力地用锄头锄着地。他面部朝向田地，视线专注地看着脚下的泥土，动作充满了年轻人的力量感。画面中所有角色全程不说话。
                </p>
              </div>

              <div class="flex justify-end gap-3">
                <el-button v-if="false" :icon="Edit" class="!bg-indigo-50 !text-indigo-600 !border-indigo-100 hover:!bg-indigo-600 hover:!text-white transition-all">编辑脚本</el-button>
                <el-button type="primary" :icon="RefreshRight" class="theme-primary-btn">再次生成</el-button>
              </div>
            </div>
          </div>

          <!-- Bottom: Timeline -->
          <div class="h-[120px] bg-white rounded-xl border border-slate-100 p-4 flex gap-4 overflow-x-auto custom-scrollbar">
            <div v-for="i in 5" :key="i" class="flex-shrink-0 w-[160px] h-full rounded-lg border border-slate-100 bg-slate-50 flex flex-col items-center justify-center gap-2 relative group">
              <div v-if="i === 1 || i === 3" class="absolute inset-0 bg-red-50/50 flex flex-col items-center justify-center text-red-500 gap-1 p-2">
                <el-icon><Warning /></el-icon>
                <span class="text-[11px] text-center">积分不足，生成失败</span>
              </div>
              <template v-else>
                <el-icon class="text-slate-300"><VideoPlay /></el-icon>
                <span class="text-[12px] text-slate-400">生成</span>
              </template>
              <div class="absolute top-1 left-1 w-5 h-5 rounded bg-slate-200 text-[10px] flex items-center justify-center text-slate-600">{{ i }}</div>
            </div>
            <div class="flex-shrink-0 w-[60px] flex items-center justify-center text-slate-300 cursor-pointer hover:text-slate-500">
              <el-icon size="24"><Plus /></el-icon>
            </div>
          </div>
        </div>

        <!-- Right: Preview -->
        <div class="w-[320px] bg-white rounded-xl border border-slate-100 flex flex-col items-center justify-center text-slate-300 gap-4">
          <el-icon size="48"><VideoPlay /></el-icon>
          <span class="text-[14px]">未生成内容</span>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Plus, Edit, RefreshRight, Warning, VideoPlay, Box } from '@element-plus/icons-vue';

const props = defineProps<{
  modelValue: boolean;
  episode: any;
}>();

const emit = defineEmits(['update:modelValue', 'enter-detail']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const activeAssetTab = ref('roles');
</script>

<style scoped>
.episode-edit-drawer :deep(.el-drawer__body) {
  padding: 0;
}

.asset-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
  padding: 0 16px;
}

.asset-tabs :deep(.el-tabs__item) {
  font-size: 13px;
  height: 40px;
  line-height: 40px;
}

.theme-primary-btn {
  background-color: #1890ff !important;
  border-color: #1890ff !important;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 4px;
}
</style>
