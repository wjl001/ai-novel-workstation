<template>
  <div
    ref="floatingRef"
    class="floating-model-switcher"
    :class="{ 'is-dark': !isLight, 'is-dragging': isDragging }"
    @mousedown="startDrag"
    @touchstart.stop="startDrag"
  >
    <!-- Title -->
    <div class="switcher-title">模型选择</div>
    
    <!-- Single Large Circle with 3 Positions -->
    <div 
      class="model-type-circle" 
      :class="{ 'is-active': popoverVisible }"
      @click.stop="togglePopover"
    >
      <div class="circle-bg-animation"></div>
      <div class="circle-inner">
        <!-- Top: 生文 -->
        <div
          class="tab-position tab-top"
          :class="{ 'is-active': activeTab === 'text' }"
          @click.stop.prevent="switchTab('text')"
        >
          <el-icon><Cpu /></el-icon>
          <span class="tab-tooltip">生文</span>
        </div>
        
        <!-- Bottom Left: 生图 -->
        <div
          class="tab-position tab-bottom-left"
          :class="{ 'is-active': activeTab === 'image' }"
          @click.stop.prevent="switchTab('image')"
        >
          <el-icon><Picture /></el-icon>
          <span class="tab-tooltip">生图</span>
        </div>
        
        <!-- Bottom Right: 生视频 -->
        <div
          class="tab-position tab-bottom-right"
          :class="{ 'is-active': activeTab === 'video' }"
          @click.stop.prevent="switchTab('video')"
        >
          <el-icon><VideoCamera /></el-icon>
          <span class="tab-tooltip">生视频</span>
        </div>
      </div>
    </div>
    
    <!-- Popover positioned below circle -->
    <el-popover
      v-model:visible="popoverVisible"
      placement="bottom-start"
      :width="280"
      trigger="click"
      popper-class="floating-model-popper"
      :offset="12"
      :show-arrow="false"
      :teleported="false"
    >
      <div class="popper-body">
        <div class="vendor-list">
          <div v-for="vendor in currentVendors" :key="vendor.id" class="vendor-section">
            <div class="vendor-label">{{ vendor.name }}</div>
            <div class="model-options">
              <div
                v-for="model in vendor.models"
                :key="model.id"
                class="model-option"
                :class="{ 'is-active': currentModelId === model.id }"
                @click="selectModel(model)"
              >
                <div class="option-info">
                  <span class="option-name">{{ model.name }}</span>
                  <span class="option-desc">{{ model.description }}</span>
                </div>
                <div class="option-check">
                  <el-icon v-if="currentModelId === model.id" class="check-icon"><CircleCheckFilled /></el-icon>
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
import { ref, computed, onBeforeUnmount } from 'vue';
import { Cpu, Picture, VideoCamera, CircleCheckFilled } from '@element-plus/icons-vue';
import { TEXT_MODELS, IMAGE_MODELS, VIDEO_MODELS, type AIModel } from '@/config/models';
import { useModelStore } from '@/store/models';
import { ElMessage } from 'element-plus';

defineProps<{
  isLight?: boolean;
}>();

const modelStore = useModelStore();
const activeTab = ref('text');
const popoverVisible = ref(false);
const floatingRef = ref<HTMLElement | null>(null);

const currentVendors = computed(() => {
  if (activeTab.value === 'text') return TEXT_MODELS;
  if (activeTab.value === 'image') return IMAGE_MODELS;
  return VIDEO_MODELS;
});

const currentModelId = computed(() => {
  if (activeTab.value === 'text') return modelStore.selectedTextModel;
  if (activeTab.value === 'image') return modelStore.selectedImageModel;
  return modelStore.selectedVideoModel;
});

const currentModelName = computed(() => {
  const id = currentModelId.value;
  for (const vendor of currentVendors.value) {
    const found = vendor.models.find(m => m.id === id);
    if (found) return found;
  }
  return null;
});

const getCurrentDisplayName = () => {
  if (!currentModelName.value) return '-';
  const name = currentModelName.value.name;
  const parts = name.split('-');
  
  if (activeTab.value === 'text') {
    if (parts.length > 2) return parts.slice(-2).join(' ');
    return name;
  }
  
  if (activeTab.value === 'image') {
    const meaningfulParts = parts.filter((p: string) => !['image'].includes(p.toLowerCase()));
    const versionIdx = meaningfulParts.findIndex((p: string) => /^\d/.test(p));
    if (versionIdx >= 0) {
      const start = Math.max(0, versionIdx - 1);
      return meaningfulParts.slice(start).join(' ');
    }
    return meaningfulParts.slice(-2).join(' ');
  }
  
  if (activeTab.value === 'video') {
    const versionIdx = parts.findIndex(p => /^\d/.test(p));
    if (versionIdx > 0) {
      return [parts[versionIdx - 1], ...parts.slice(versionIdx)].join(' ');
    }
    return parts.slice(-2).join(' ');
  }
  
  return name;
};

const togglePopover = () => {
  // When opening, ensure activeTab matches the current selected model type
  if (!popoverVisible.value) {
    const selectedModelId = modelStore.selectedTextModel;
    const isText = TEXT_MODELS.some(v => v.models.some(m => m.id === selectedModelId));
    if (isText) activeTab.value = 'text';
    
    const imageModelId = modelStore.selectedImageModel;
    const isImage = IMAGE_MODELS.some(v => v.models.some(m => m.id === imageModelId));
    if (isImage) activeTab.value = 'image';
    
    const videoModelId = modelStore.selectedVideoModel;
    const isVideo = VIDEO_MODELS.some(v => v.models.some(m => m.id === videoModelId));
    if (isVideo) activeTab.value = 'video';
  }
  popoverVisible.value = !popoverVisible.value;
};

const switchTab = (tab: string) => {
  // Only switch tab if popover is closed, otherwise toggle popover
  if (!popoverVisible.value) {
    activeTab.value = tab;
  }
  popoverVisible.value = !popoverVisible.value;
};

const selectModel = (model: AIModel) => {
  if (activeTab.value === 'text') modelStore.setTextModel(model.id);
  else if (activeTab.value === 'image') modelStore.setImageModel(model.id);
  else modelStore.setVideoModel(model.id);

  ElMessage({
    message: '模型切换成功',
    type: 'success',
    duration: 1500
  });
  
  popoverVisible.value = false;
};

// Drag functionality
let isDragging = ref(false);
let startX = 0;
let startY = 0;
let initialLeft = 0;
let initialTop = 0;

const startDrag = (e: MouseEvent | TouchEvent) => {
  // Allow dragging from anywhere except the interactive elements
  if ((e.target as HTMLElement).closest('.tab-position') || (e.target as HTMLElement).closest('.model-option')) {
    return;
  }
  
  isDragging.value = true;
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
  
  startX = clientX;
  startY = clientY;
  
  if (floatingRef.value) {
    const rect = floatingRef.value.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;
    
    floatingRef.value.style.position = 'fixed';
    floatingRef.value.style.left = initialLeft + 'px';
    floatingRef.value.style.top = initialTop + 'px';
    floatingRef.value.style.zIndex = '9999';
  }
  
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('touchmove', onDrag, { passive: false });
  document.addEventListener('touchend', stopDrag);
};

const onDrag = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return;
  e.preventDefault();
  
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
  
  const deltaX = clientX - startX;
  const deltaY = clientY - startY;
  
  if (floatingRef.value) {
    floatingRef.value.style.left = (initialLeft + deltaX) + 'px';
    floatingRef.value.style.top = (initialTop + deltaY) + 'px';
  }
};

const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
  document.removeEventListener('touchmove', onDrag);
  document.removeEventListener('touchend', stopDrag);
};

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
  document.removeEventListener('touchmove', onDrag);
  document.removeEventListener('touchend', stopDrag);
});
</script>

<style lang="scss" scoped>
.floating-model-switcher {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9998;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: grab;
  user-select: none;
  
  &.is-dragging {
    cursor: grabbing;
  }
}

.switcher-title {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

// Single large circle with animated background and 3 positions
.model-type-circle {
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  // Animated gradient background
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899);
    opacity: 0.15;
    transition: all 0.4s ease;
    animation: pulse-bg 3s ease-in-out infinite;
  }
  
  &:hover::before {
    opacity: 0.25;
    transform: scale(1.05);
  }
  
  &.is-active {
    &::before {
      opacity: 0.35;
      transform: scale(1.08);
    }
  }
  
  &.is-active-text::before {
    background: linear-gradient(135deg, #6366f1, #818cf8);
    opacity: 0.3;
  }
  
  &.is-active-image::before {
    background: linear-gradient(135deg, #ec4899, #f472b6);
    opacity: 0.3;
  }
  
  &.is-active-video::before {
    background: linear-gradient(135deg, #10b981, #34d399);
    opacity: 0.3;
  }
  
  .circle-bg-animation {
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    background: conic-gradient(from 0deg, #6366f1, #a855f7, #ec4899, #6366f1);
    opacity: 0;
    transition: opacity 0.4s ease;
    animation: rotate-gradient 4s linear infinite;
    z-index: -1;
  }
  
  &:hover .circle-bg-animation {
    opacity: 0.3;
  }
  
  .circle-inner {
    position: relative;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    // Changed from white to purple tint
    background: linear-gradient(145deg, #eef2ff, #e0e7ff);
    box-shadow: 
      4px 4px 12px rgba(99, 102, 241, 0.15),
      -4px -4px 12px rgba(255, 255, 255, 0.8),
      inset 0 0 0 2px rgba(99, 102, 241, 0.2);
    transition: all 0.4s ease;
    z-index: 1;
    
    // Bottom shadow for depth separation
    &::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 10%;
      right: 10%;
      height: 10px;
      background: radial-gradient(ellipse at center, rgba(99, 102, 241, 0.2) 0%, transparent 70%);
      filter: blur(4px);
      z-index: -1;
    }
  }
  
  &:hover .circle-inner {
    box-shadow: 
      6px 6px 16px rgba(99, 102, 241, 0.2),
      -6px -6px 16px rgba(255, 255, 255, 0.9),
      inset 0 0 0 2px rgba(99, 102, 241, 0.3);
  }
}

@keyframes pulse-bg {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
}

@keyframes rotate-gradient {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.tab-position {
  position: absolute;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: transparent;
  
  .el-icon {
    font-size: 15px;
    color: #6366f1;
    transition: all 0.3s ease;
  }
  
  &:hover {
    .el-icon {
      color: #4f46e5;
      transform: scale(1.15);
    }
  }
  
  &.is-active {
    .el-icon {
      color: #4f46e5;
      font-size: 17px;
    }
  }
  
  .tab-tooltip {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    padding: 4px 10px;
    background: linear-gradient(135deg, #1e293b, #334155);
    color: white;
    font-size: 11px;
    font-weight: 600;
    border-radius: 6px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: all 0.3s ease;
    
    &::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 5px solid transparent;
      border-top-color: #1e293b;
    }
  }
  
  &:hover .tab-tooltip {
    opacity: 1;
    bottom: calc(100% + 10px);
  }
  
  // Top position (生文)
  &.tab-top {
    top: 6px;
    left: 50%;
    transform: translateX(-50%);
    
    &:hover {
      transform: translateX(-50%) scale(1.15);
    }
    
    &.is-active {
      transform: translateX(-50%) scale(1.2);
      background: rgba(99, 102, 241, 0.15);
    }
  }
  
  // Bottom left position (生图)
  &.tab-bottom-left {
    bottom: 8px;
    left: 8px;
    
    &:hover {
      transform: scale(1.15);
    }
    
    &.is-active {
      transform: scale(1.2);
      background: rgba(99, 102, 241, 0.15);
    }
  }
  
  // Bottom right position (生视频)
  &.tab-bottom-right {
    bottom: 8px;
    right: 8px;
    
    &:hover {
      transform: scale(1.15);
    }
    
    &.is-active {
      transform: scale(1.2);
      background: rgba(99, 102, 241, 0.15);
    }
  }
}

/* Dark Mode */
:global(.dark .switcher-title) {
  color: #94a3b8;
}

:global(.dark .model-type-circle .circle-inner) {
  background: linear-gradient(145deg, #1e1b4b, #312e81);
  box-shadow: 
    4px 4px 12px rgba(99, 102, 241, 0.3),
    -4px -4px 12px rgba(40, 50, 70, 0.3),
    inset 0 0 0 2px rgba(99, 102, 241, 0.4);
}

:global(.dark .model-type-circle:hover .circle-inner) {
  box-shadow: 
    6px 6px 16px rgba(99, 102, 241, 0.4),
    -6px -6px 16px rgba(40, 50, 70, 0.4),
    inset 0 0 0 2px rgba(99, 102, 241, 0.5);
}

:global(.dark .tab-position .el-icon) {
  color: #818cf8;
}

:global(.dark .tab-position.is-active) {
  background: rgba(99, 102, 241, 0.3);
}

:global(.dark .tab-tooltip) {
  background: linear-gradient(135deg, #334155, #475569);
  
  &::after {
    border-top-color: #334155;
  }
}
</style>

<style lang="scss">
.floating-model-popper {
  padding: 0 !important;
  border-radius: 14px !important;
  overflow: hidden !important;
  border: none !important;
  box-shadow: 
    8px 8px 24px rgba(0, 0, 0, 0.12),
    -8px -8px 24px rgba(255, 255, 255, 0.9);
}

.popper-body {
  max-height: 320px;
  overflow-y: auto;
  background: white;
}

.vendor-list {
  padding: 4px 0;
}

.vendor-section {
  padding: 4px 0;
  
  &:not(:last-child) {
    border-bottom: 1px solid #f1f5f9;
  }
}

.vendor-label {
  padding: 3px 10px;
  font-size: 9px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.model-options {
  padding: 0 6px 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.model-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 8px;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.15s ease;
  
  &:hover {
    background: rgba(99, 102, 241, 0.06);
  }
  
  &.is-active {
    background: rgba(99, 102, 241, 0.1);
  }
}

.option-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
  min-width: 0;
}

.option-name {
  font-size: 11px;
  font-weight: 600;
  color: #1e293b;
}

.option-desc {
  font-size: 9px;
  font-weight: 400;
  color: #64748b;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.option-check {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.check-icon {
  font-size: 12px;
  color: #6366f1;
}

:global(.dark .popper-body) {
  background: #1e293b;
}

:global(.dark .vendor-section:not(:last-child)) {
  border-bottom-color: #334155;
}

:global(.dark .option-name) {
  color: #f1f5f9;
}

:global(.dark .option-desc) {
  color: #94a3b8;
}

:global(.dark .model-option:hover) {
  background: rgba(99, 102, 241, 0.15);
}

:global(.dark .model-option.is-active) {
  background: rgba(99, 102, 241, 0.2);
}

.popper-body::-webkit-scrollbar {
  width: 3px;
}

.popper-body::-webkit-scrollbar-track {
  background: transparent;
}

.popper-body::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.2);
  border-radius: 10px;
}
</style>
