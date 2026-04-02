<template>
  <el-dialog
    v-model="visible"
    width="900px"
    :show-close="false"
    class="custom-subject-dialog"
    destroy-on-close
    align-center
  >
    <!-- Custom Header -->
    <div class="flex justify-between items-center mb-6 px-2">
      <h2 class="text-[20px] font-bold text-slate-900">{{ title }}</h2>
      <button @click="visible = false" class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
        <el-icon size="16"><Close /></el-icon>
      </button>
    </div>

    <!-- Main Content -->
    <div class="flex gap-8 px-2">
      <!-- Left: Form Fields -->
      <div class="flex-1 flex flex-col gap-6">
        <!-- Subject Name -->
        <div class="flex flex-col gap-2">
          <label class="text-[14px] text-slate-700 font-medium">
            {{ type === 'character' ? '形象名称' : '名称' }} <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <input 
              v-model="localSubject.name" 
              type="text" 
              placeholder="请输入名称"
              class="w-full px-4 py-3 bg-[#f8fafc] border border-slate-100 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all pr-16"
              maxlength="20"
            />
            <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-slate-300 font-mono">
              {{ localSubject.name?.length || 0 }}/20
            </span>
          </div>
        </div>

        <!-- Subject Description -->
        <div class="flex flex-col gap-2">
          <div class="flex justify-between items-center">
            <label class="text-[14px] text-slate-700 font-medium">
              {{ type === 'character' ? '形象描述' : '详细描述' }}
            </label>
            <button 
              @click="polishText" 
              class="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-[12px] font-medium transition-colors disabled:opacity-50"
              :disabled="isPolishingText || !localSubject.description"
            >
              <el-icon :class="{'animate-spin': isPolishingText}"><Refresh /></el-icon>
              <span>{{ isPolishingText ? '正在优化...' : '润色优化' }}</span>
            </button>
          </div>
          <div class="relative bg-[#f8fafc] border border-slate-100 rounded-2xl p-4 min-h-[160px] flex flex-col group transition-all focus-within:ring-2 focus-within:ring-indigo-500/20">
            <textarea 
              v-model="localSubject.description" 
              placeholder="请输入详细描述..."
              class="w-full flex-1 bg-transparent border-none resize-none text-[14px] text-slate-600 leading-relaxed focus:outline-none"
            ></textarea>
          </div>
        </div>

        <!-- Appeared Episodes (Scene & Prop Only) -->
        <div v-if="type !== 'character'" class="flex flex-col gap-2">
          <label class="text-[14px] text-slate-700 font-medium">出现集数</label>
          <el-select
            v-model="localSubject.appeared_episodes"
            multiple
            placeholder="请选择集数"
            class="custom-select"
          >
            <el-option
              v-for="item in [1, 2, 3]"
              :key="item"
              :label="'第 ' + item + ' 集'"
              :value="item"
            />
          </el-select>
        </div>

        <!-- Voice Description (Character Only) -->
        <div v-if="type === 'character'" class="flex flex-col gap-2">
          <label class="text-[14px] text-slate-700 font-medium">音色描述</label>
          <div class="bg-[#f8fafc] border border-slate-100 rounded-2xl p-4 min-h-[100px] flex flex-col transition-all focus-within:ring-2 focus-within:ring-indigo-500/20">
            <textarea 
              v-model="localSubject.voice_description" 
              placeholder="描述角色的音色特点，如：男声，深沉，富有磁性..."
              class="w-full flex-1 bg-transparent border-none resize-none text-[14px] text-slate-600 leading-relaxed focus:outline-none"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Right: Preview -->
      <div class="w-[400px] flex flex-col gap-4">
        <div class="aspect-[3/4] rounded-[24px] bg-slate-50 border border-slate-100 overflow-hidden relative shadow-sm group">
          <div v-if="isGeneratingImage" class="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
            <el-icon class="animate-spin text-indigo-600" size="32"><Loading /></el-icon>
            <span class="text-[13px] text-slate-500 font-medium">AI 正在构思画面...</span>
          </div>

          <img 
            v-if="localSubject.image" 
            :src="localSubject.image" 
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div v-else class="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-3">
            <el-icon size="48"><Picture /></el-icon>
            <span class="text-[13px]">暂无预览图</span>
          </div>
          
          <!-- Realistic Overlay Info -->
          <div v-if="localSubject.image" class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>

          <!-- Hover Upload Overlay -->
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
            <el-upload
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              @change="handleImageUpload"
            >
              <button class="flex items-center gap-2 px-6 py-2.5 bg-white text-slate-900 rounded-xl text-[14px] font-medium hover:bg-slate-50 transition-colors shadow-lg">
                <el-icon><Upload /></el-icon>
                <span>更换图片</span>
              </button>
            </el-upload>
          </div>
        </div>

        <!-- New Centered AI Generate Button BELOW the image -->
        <div class="mt-4 flex justify-center">
          <button 
            @click="generateImage"
            class="w-[40%] min-w-[140px] h-[44px] flex items-center justify-center gap-2 bg-slate-900 text-white rounded-full text-[14px] font-bold hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-lg"
            :disabled="isGeneratingImage"
          >
            <el-icon :class="{'animate-spin': isGeneratingImage}"><MagicStick /></el-icon>
            <span>{{ isGeneratingImage ? '生成中...' : 'AI 生成' }}</span>
            <span class="font-mono text-[10px] opacity-70" v-if="!isGeneratingImage">3</span>
          </button>
        </div>

        <p class="text-[12px] text-slate-400 text-center">建议尺寸 3:4，支持 JPG、PNG 格式</p>
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="flex justify-end gap-3 px-2 pt-4 border-t border-slate-50">
        <button 
          @click="visible = false" 
          class="px-8 py-2.5 rounded-xl bg-[#f1f3f5] text-slate-600 text-[14px] font-medium hover:bg-slate-200 transition-colors"
        >
          取消
        </button>
        <button 
          @click="handleSave" 
          class="px-8 py-2.5 rounded-xl bg-slate-900 text-white text-[14px] font-medium hover:bg-black transition-all shadow-md active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
          :disabled="!localSubject.name || isGeneratingImage || isPolishingText"
        >
          保存
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { Close, MagicStick, Picture, Refresh, Upload, Loading } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const props = defineProps<{
  modelValue: boolean;
  subject: any;
  isEdit: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'save']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const localSubject = ref<any>({
  id: '',
  name: '',
  description: '',
  voice_description: '',
  type: 'character',
  image: '',
  appeared_episodes: []
});

const isGeneratingImage = ref(false);
const isPolishingText = ref(false);

const type = computed(() => localSubject.value.type);
const title = computed(() => {
  if (type.value === 'character') return props.isEdit ? '编辑形象' : '新增形象';
  if (type.value === 'scene') return props.isEdit ? '编辑场景' : '新增场景';
  return props.isEdit ? '编辑道具' : '新增道具';
});

watch(() => props.subject, (newVal) => {
  if (newVal) {
    localSubject.value = { 
      ...newVal,
      name: newVal.name || '',
      description: newVal.description || '',
      type: newVal.type || 'character',
      voice_description: newVal.voice_description || '',
      image: newVal.image || '',
      appeared_episodes: newVal.appeared_episodes || []
    };
  }
}, { immediate: true, deep: true });

// AI Functions
const generateImage = async () => {
  if (!localSubject.value.description) {
    return ElMessage.warning('请先输入描述，以便 AI 生成更准确的图片');
  }

  isGeneratingImage.value = true;
  try {
    // Simulate AI Image Generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockImages = {
      character: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
      scene: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=600',
      prop: 'https://images.unsplash.com/photo-1544111306-03732873493d?auto=format&fit=crop&q=80&w=400'
    };
    
    const typeKey = (type.value || 'character') as keyof typeof mockImages;
    localSubject.value.image = mockImages[typeKey] || mockImages.character;
    ElMessage.success('AI 图片生成成功');
  } catch (error) {
    ElMessage.error('图片生成失败，请稍后重试');
  } finally {
    isGeneratingImage.value = false;
  }
};

const polishText = async () => {
  if (!localSubject.value.description) return;

  isPolishingText.value = true;
  try {
    // Simulate AI Text Polishing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const originalText = localSubject.value.description;
    localSubject.value.description = `【已润色】${originalText}\n\n这段描写经过 AI 优化，增强了视觉张力和氛围感，使其更符合剧本创作的专业水准。`;
    
    ElMessage.success('文本润色完成');
  } catch (error) {
    ElMessage.error('润色失败，请稍后重试');
  } finally {
    isPolishingText.value = false;
  }
};

const handleImageUpload = (file: any) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    localSubject.value.image = e.target?.result as string;
    ElMessage.success('图片上传成功');
  };
  reader.readAsDataURL(file.raw);
};

const handleSave = () => {
  emit('save', { ...localSubject.value });
  visible.value = false;
};
</script>

<style>
.custom-subject-dialog {
  border-radius: 24px !important;
  padding: 24px !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15) !important;
}

.custom-subject-dialog .el-dialog__header {
  display: none;
}

.custom-subject-dialog .el-dialog__body {
  padding: 0 !important;
}

.custom-subject-dialog .el-dialog__footer {
  padding: 16px 0 0 0 !important;
}

.custom-select .el-select__wrapper {
  background-color: #f8fafc !important;
  border-radius: 12px !important;
  padding: 8px 12px !important;
  border: 1px solid #f1f5f9 !important;
  box-shadow: none !important;
}

/* Animations */
.custom-subject-dialog.el-overlay-dialog {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.custom-subject-dialog .el-dialog {
  transform-origin: center;
  animation: dialog-zoom-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes dialog-zoom-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
