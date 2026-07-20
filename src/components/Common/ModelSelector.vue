<template>
  <div class="premium-model-selector" :class="{ 'is-dark': !isLight }">
    <el-popover
      v-model:visible="visible"
      placement="bottom-end"
      :width="340"
      trigger="click"
      popper-class="premium-model-popper"
      :offset="8"
      :show-arrow="false"
    >
      <template #reference>
        <div class="model-trigger" :class="{ 'is-generating': isGenerating }">
          <div 
            class="trigger-pill"
          >
            <div class="trigger-icon">
              <el-icon><Cpu v-if="type === 'text'" /><Picture v-else-if="type === 'image'" /><VideoCamera v-else /></el-icon>
            </div>
            <div class="trigger-model-wrap">
              <span class="trigger-model-name">{{ getDisplayModelName(selectedModel) }}</span>
              <span v-if="getVersionTag(selectedModel)" class="trigger-version">{{ getVersionTag(selectedModel) }}</span>
            </div>
            <el-icon class="trigger-arrow" :class="{ 'is-rotated': visible }"><ArrowDown /></el-icon>
          </div>
        </div>
      </template>

      <div class="popper-container">
        <!-- Header -->
        <div class="popper-header">
          <div class="header-gradient-bar"></div>
          <h3 class="popper-title">智能引擎切换</h3>
          <p class="popper-subtitle">选择最适合的AI模型</p>
        </div>

        <!-- Vendor List -->
        <div class="vendor-scroll">
          <div v-for="vendor in vendors" :key="vendor.id" class="vendor-block">
            <div class="vendor-header">
              <div class="vendor-badge">
                <img v-if="vendor.logo" :src="vendor.logo" class="vendor-logo-img" />
                <span class="vendor-dot"></span>
                <span class="vendor-name">{{ vendor.name }}</span>
              </div>
            </div>
            
            <div class="model-cards">
              <div 
                v-for="model in vendor.models" 
                :key="model.id"
                class="model-card"
                :class="{ 'is-active': currentModelId === model.id, 'is-disabled': isGenerating }"
                @click="!isGenerating && selectModel(model)"
              >
                <div class="card-layout">
                  <div class="card-main">
                    <div class="card-title-row">
                      <span class="card-title">{{ model.name }}</span>
                      <span v-if="model.tags?.length" class="card-tags">
                        <span 
                          v-for="tag in model.tags" 
                          :key="tag" 
                          class="card-tag"
                          :class="getTagClass(tag)"
                        >{{ tag }}</span>
                      </span>
                    </div>
                    <p class="card-desc">{{ model.description }}</p>
                  </div>
                  <div class="card-check">
                    <div v-if="currentModelId === model.id" class="check-circle">
                      <el-icon><CircleCheckFilled /></el-icon>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue';
import { Cpu, Picture, VideoCamera, ArrowDown, CircleCheckFilled } from '@element-plus/icons-vue';
import { TEXT_MODELS, IMAGE_MODELS, VIDEO_MODELS, type AIModel } from '@/config/models';
import { useModelStore } from '@/store/models';
import { ElMessage } from 'element-plus';

const props = defineProps<{
  modelValue?: string;
  type: 'text' | 'image' | 'video';
  compact?: boolean;
  moduleId?: string;
}>();

const emit = defineEmits(['update:modelValue', 'change']);

const isLight = inject('isLight', ref(true));
const modelStore = useModelStore();
const visible = ref(false);
const hovered = ref(false);

const isGenerating = computed(() => props.moduleId ? modelStore.isGenerating(props.moduleId) : false);

const vendors = computed(() => {
  if (props.type === 'text') return TEXT_MODELS;
  if (props.type === 'image') return IMAGE_MODELS;
  return VIDEO_MODELS;
});

const currentModelId = computed(() => {
  if (props.modelValue) return props.modelValue;
  return modelStore.getModelForModule(props.moduleId || '', props.type);
});

const selectedModel = computed(() => {
  const id = currentModelId.value;
  for (const vendor of vendors.value) {
    const found = vendor.models.find(m => m.id === id);
    if (found) return found;
  }
  return vendors.value[0]?.models[0];
});

// 提取版本号
const getVersionTag = (model: AIModel | undefined): string => {
  if (!model) return '';
  const match = model.name.match(/(\d+\.?\d*)/);
  return match ? match[1] : '';
};

// 获取显示名称 - 智能简写
const getDisplayModelName = (model: AIModel | undefined): string => {
  if (!model) return '-';
  const name = model.name;
  
  // 文本模型 - 保留更多上下文
  if (props.type === 'text') {
    // deepseek-v4 → deepseek v4
    // 千问-plus → 千问 plus
    const parts = name.split('-');
    if (parts.length > 2) {
      // 取最后两部分
      return parts.slice(-2).join(' ');
    }
    return name;
  }
  
  // 图像模型 - 保留有意义的部分
  if (props.type === 'image') {
    // seedream-5.0-lite → seedream 5.0
    // gemini-3.1-flash-lite-image → gemini flash 3.1
    const parts = name.split('-');
    if (parts.length <= 2) return name;
    
    // 去掉无意义的后缀
    const meaningfulParts = parts.filter(p => !['image'].includes(p.toLowerCase()));
    
    // 找版本号位置
    const versionIdx = meaningfulParts.findIndex(p => /^\d/.test(p));
    if (versionIdx >= 0) {
      // 取版本号前1-2个词 + 版本号及之后
      const start = Math.max(0, versionIdx - 1);
      return meaningfulParts.slice(start).join(' ');
    }
    
    return meaningfulParts.slice(-2).join(' ');
  }
  
  // 视频模型 - 保持当前逻辑
  if (props.type === 'video') {
    const parts = name.split('-');
    if (parts.length <= 2) return name;
    
    // 找版本号
    const versionIdx = parts.findIndex(p => /^\d/.test(p));
    if (versionIdx > 0) {
      const before = parts[versionIdx - 1];
      const after = parts.slice(versionIdx);
      return [before, ...after].join(' ');
    }
    
    return parts.slice(-2).join(' ');
  }
  
  return name;
};

const getTagClass = (tag: string) => {
  if (tag === '推荐' || tag === '旗舰' || tag === '顶尖' || tag === '新一代') return 'tag-highlight';
  if (tag === '极速' || tag === '高效' || tag === '快速') return 'tag-speed';
  if (tag === '稳定' || tag === '经典') return 'tag-stable';
  return 'tag-default';
};

const selectModel = (model: AIModel) => {
  if (isGenerating.value) return;

  try {
    emit('update:modelValue', model.id);
    emit('change', model);
    
    if (props.type === 'text') modelStore.setTextModel(model.id);
    else if (props.type === 'image') modelStore.setImageModel(model.id);
    else modelStore.setVideoModel(model.id);

    if (props.moduleId) {
      modelStore.lockModel(props.moduleId, props.type, model.id);
    }

    ElMessage({
      message: '模型切换成功',
      type: 'success',
      duration: 1500
    });
    
    visible.value = false;
  } catch (error) {
    ElMessage.error('当前模型服务暂不可用，请稍后重试');
  }
};

watch(() => {
  if (props.type === 'text') return modelStore.selectedTextModel;
  if (props.type === 'image') return modelStore.selectedImageModel;
  return modelStore.selectedVideoModel;
}, (newVal) => {
  if (newVal !== props.modelValue) {
    emit('update:modelValue', newVal);
  }
});
</script>

<style lang="scss" scoped>
.premium-model-selector {
  display: inline-flex;
  align-items: center;
}

.model-trigger {
  cursor: pointer;
  user-select: none;
  
  &.is-generating {
    cursor: not-allowed;
    opacity: 0.7;
  }
}

.trigger-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px 5px 5px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1.5px solid rgba(99, 102, 241, 0.2);
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.06);
  transition: all 0.25s ease;
  cursor: pointer;
  
  &:hover {
    background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
    border-color: rgba(99, 102, 241, 0.4);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.12);
  }
}

.trigger-icon {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.25);
  
  .el-icon {
    font-size: 10px;
  }
}

.trigger-model-wrap {
  display: flex;
  align-items: baseline;
  gap: 3px;
}

.trigger-model-name {
  font-size: 11px;
  font-weight: 700;
  color: #1e293b;
  white-space: nowrap;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trigger-version {
  font-size: 10px;
  font-weight: 800;
  color: #6366f1;
  white-space: nowrap;
}

.trigger-arrow {
  font-size: 9px;
  color: #6366f1;
  transition: transform 0.25s ease;
  
  &.is-rotated {
    transform: rotate(180deg);
  }
}

/* Popper Container */
.popper-container {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px -12px rgba(99, 102, 241, 0.15), 0 8px 24px -8px rgba(0, 0, 0, 0.08);
}

.popper-header {
  position: relative;
  padding: 16px 16px 12px;
  background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
  border-bottom: 1px solid rgba(99, 102, 241, 0.08);
}

.header-gradient-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
  border-radius: 2px;
}

.popper-title {
  margin: 0 0 4px 12px;
  font-size: 14px;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.01em;
}

.popper-subtitle {
  margin: 0 0 0 12px;
  font-size: 10px;
  font-weight: 500;
  color: #64748b;
}

.vendor-scroll {
  max-height: 380px;
  overflow-y: auto;
  padding: 8px 0;
}

.vendor-block {
  &:not(:last-child) {
    border-bottom: 1px solid #f1f5f9;
  }
}

.vendor-header {
  padding: 8px 12px 6px;
}

.vendor-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.vendor-logo-img {
  width: 14px;
  height: 14px;
  object-fit: contain;
  opacity: 0.7;
}

.vendor-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #a855f7);
}

.vendor-name {
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.model-cards {
  padding: 0 8px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.model-card {
  position: relative;
  padding: 10px 12px;
  border-radius: 10px;
  background: #fafbfc;
  border: 1.5px solid transparent;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover:not(.is-disabled) {
    background: white;
    border-color: rgba(99, 102, 241, 0.2);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.08);
    transform: translateY(-1px);
  }
  
  &.is-active {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%);
    border-color: rgba(99, 102, 241, 0.3);
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.12);
  }
  
  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      transform: none;
      box-shadow: none;
    }
  }
}

.card-layout {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.card-main {
  flex: 1;
  min-width: 0;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 3px;
  flex-wrap: wrap;
}

.card-title {
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.3;
}

.card-tags {
  display: inline-flex;
  gap: 3px;
}

.card-tag {
  font-size: 9px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 4px;
  line-height: 1.4;
  
  &.tag-highlight {
    background: linear-gradient(135deg, #fef3c7, #fde68a);
    color: #92400e;
  }
  
  &.tag-speed {
    background: linear-gradient(135deg, #d1fae5, #a7f3d0);
    color: #065f46;
  }
  
  &.tag-stable {
    background: #f1f5f9;
    color: #475569;
  }
  
  &.tag-default {
    background: #e0e7ff;
    color: #3730a3;
  }
}

.card-desc {
  margin: 0;
  font-size: 10px;
  font-weight: 400;
  color: #64748b;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-check {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-circle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.3);
  
  .el-icon {
    font-size: 10px;
  }
}

/* Dark Mode */
:global(.dark .trigger-pill) {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-color: rgba(99, 102, 241, 0.2);
  
  &:hover {
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
    border-color: rgba(99, 102, 241, 0.4);
  }
}

:global(.dark .trigger-model-name) {
  color: #f1f5f9;
}

:global(.dark .popper-container) {
  background: #1e293b;
}

:global(.dark .popper-header) {
  background: linear-gradient(135deg, #1e293b 0%, #1e1b4b 100%);
  border-bottom-color: rgba(99, 102, 241, 0.15);
}

:global(.dark .popper-title) {
  color: #f1f5f9;
}

:global(.dark .popper-subtitle) {
  color: #94a3b8;
}

:global(.dark .vendor-block:not(:last-child)) {
  border-bottom-color: #334155;
}

:global(.dark .model-card) {
  background: #0f172a;
  
  &:hover:not(.is-disabled) {
    background: #1e293b;
  }
  
  &.is-active {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%);
    border-color: rgba(99, 102, 241, 0.4);
  }
}

:global(.dark .card-title) {
  color: #f1f5f9;
}

:global(.dark .card-desc) {
  color: #94a3b8;
}

/* Scrollbar */
.vendor-scroll::-webkit-scrollbar {
  width: 4px;
}

.vendor-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.vendor-scroll::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.2);
  border-radius: 10px;
}

.vendor-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.4);
}

/* Popper Override */
:global(.premium-model-popper) {
  padding: 0 !important;
  border-radius: 16px !important;
  overflow: hidden !important;
  border: none !important;
}
</style>
