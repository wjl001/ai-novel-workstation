<template>
  <el-dialog
    v-model="visible"
    width="800px"
    :show-close="false"
    class="custom-subject-dialog"
    destroy-on-close
    align-center
  >
    <!-- Custom Header -->
    <div class="flex justify-between items-center mb-6 px-2">
      <h2 class="text-[20px] font-black text-slate-800">{{ title }}</h2>
      <button @click="visible = false" class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
        <el-icon size="16"><Close /></el-icon>
      </button>
    </div>

    <!-- Main Content -->
    <div class="px-2 overflow-hidden">
      <div class="flex gap-6 pb-2">
        <!-- Left: Form Fields -->
        <div class="flex-1 flex flex-col gap-4">
          <!-- Subject Name -->
          <div class="flex flex-col gap-1.5">
            <label class="text-[12px] text-slate-400 font-black uppercase tracking-wider px-1">
              {{ type === 'character' ? '形象名称' : '名称' }} <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input 
                v-model="localSubject.name" 
                type="text" 
                placeholder="请输入名称"
                class="w-full px-4 py-2.5 border border-slate-100 rounded-2xl text-[13px] font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all pr-16"
                :class="isEdit ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-[#f8fafc]'"
                maxlength="20"
                :disabled="isEdit"
              />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-slate-300 font-mono">
                {{ localSubject.name?.length || 0 }}/20
              </span>
            </div>
          </div>

          <!-- Subject Description -->
          <div class="flex flex-col gap-1.5">
            <div class="flex justify-between items-center px-1">
              <label class="text-[12px] text-slate-400 font-black uppercase tracking-wider">
                {{ type === 'character' ? '形象描述' : '详细描述' }}
              </label>
              <button 
                @click="polishText" 
                class="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 text-[11px] font-black transition-all disabled:opacity-50"
                :disabled="isPolishingText || !localSubject.description"
              >
                <el-icon :class="{'animate-spin': isPolishingText}"><Refresh /></el-icon>
                <span>AI 润色优化</span>
              </button>
            </div>
            <div class="relative bg-[#f8fafc] border border-slate-100 rounded-[20px] p-3.5 min-h-[90px] flex flex-col group transition-all focus-within:ring-4 focus-within:ring-indigo-500/5">
              <textarea 
                v-model="localSubject.description" 
                placeholder="请输入详细描述..."
                class="w-full flex-1 bg-transparent border-none resize-none text-[13px] text-slate-600 leading-relaxed font-bold focus:outline-none"
              ></textarea>
            </div>
          </div>

          <!-- Appeared Episodes (Scene & Prop Only) - Hidden as requested -->
          <!-- <div v-if="type !== 'character'" class="flex flex-col gap-1.5">
            <label class="text-[12px] text-slate-400 font-black uppercase tracking-wider px-1">出现集数</label>
            <el-select
              v-model="localSubject.appeared_episodes"
              multiple
              placeholder="请选择集数"
              class="custom-select-v3"
            >
              <el-option
                v-for="item in [1, 2, 3]"
                :key="item"
                :label="'第 ' + item + ' 集'"
                :value="item"
              />
            </el-select>
          </div> -->

          <!-- Voice Description (Character Only) -->
          <div v-if="type === 'character'" class="flex flex-col gap-2">
            <label class="text-[12px] text-slate-400 font-black uppercase tracking-wider px-1">角色声音设定</label>
            <div class="bg-[#f8fafc] rounded-[20px] border border-slate-100 p-1 flex flex-col min-h-[160px]">
              <!-- Content -->
              <div class="flex-1 flex flex-col p-1.5 min-h-0">
                <div class="h-full flex flex-col">
                  <div class="flex justify-end px-2 mb-1">
                    <button 
                      @click="polishVoice" 
                      class="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 text-[10px] font-black transition-all disabled:opacity-50"
                      :disabled="isPolishingVoice || !localSubject.voice_description"
                    >
                      <el-icon :class="{'animate-spin': isPolishingVoice}"><Refresh /></el-icon>
                      <span>AI 润色优化</span>
                    </button>
                  </div>
                  <textarea 
                    v-model="localSubject.voice_description" 
                    placeholder="描述角色的音色特点，如：男声，深沉，富有磁性..."
                    class="w-full flex-1 bg-transparent border-none resize-none text-[12px] text-slate-600 leading-relaxed font-bold focus:outline-none px-2"
                    @input="handleVoiceDescriptionInput"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Preview -->
        <div class="w-[300px] flex flex-col gap-3 shrink-0 overflow-hidden">
          <div class="aspect-video rounded-[24px] bg-slate-50 border border-slate-100 overflow-hidden relative shadow-sm group">
            <div v-if="isGeneratingImage" class="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
              <el-icon class="animate-spin text-indigo-600" size="28"><Loading /></el-icon>
              <span class="text-[12px] text-slate-500 font-black">AI 绘图中...</span>
            </div>

            <img 
              v-if="localSubject.image" 
              :src="localSubject.image" 
              class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div v-else class="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
              <el-icon size="40"><Picture /></el-icon>
              <span class="text-[12px] font-black uppercase tracking-widest">暂无预览</span>
            </div>
            
            <!-- Hover Action -->
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
              <el-upload
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                @change="handleImageUpload"
              >
                <button class="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 rounded-full text-[12px] font-black hover:scale-105 active:scale-95 transition-all shadow-xl">
                  <el-icon><Upload /></el-icon>
                  <span>本地上传</span>
                </button>
              </el-upload>
            </div>
          </div>

          <!-- New Centered AI Generate Button BELOW the image -->
          <div class="flex justify-center">
            <button 
              @click="generateImage"
              class="w-full h-[40px] flex items-center justify-center gap-2 bg-[#1f2329] text-white rounded-full text-[13px] font-black hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-black/10 dark:shadow-black/40 group/ai"
              :disabled="isGeneratingImage"
            >
              <el-icon :size="16" class="group-hover/ai:rotate-12 transition-transform" :class="{'animate-spin': isGeneratingImage}"><MagicStick /></el-icon>
              <span>AI 一键生成{{ type === 'character' ? '形象' : type === 'scene' ? '场景' : '道具' }}</span>
            </button>
          </div>

          <p class="text-[9px] text-slate-400 text-center font-bold uppercase tracking-widest">推荐 16:9 · 支持 JPG/PNG</p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="flex justify-end gap-3 px-2 pt-4 border-t border-slate-100 bg-white">
        <button 
          @click="visible = false" 
          class="px-8 py-2.5 rounded-full bg-slate-50 text-slate-400 text-[14px] font-black hover:bg-slate-100 hover:text-slate-600 transition-all"
        >
          取消
        </button>
        <button 
          @click="handleSave" 
          class="px-10 py-2.5 rounded-full bg-indigo-600 text-white text-[14px] font-black shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
          :disabled="!localSubject.name || isGeneratingImage || isPolishingText || isPolishingVoice"
        >
          确认保存
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { Close, MagicStick, Picture, Refresh, Upload, Loading, Delete } from '@element-plus/icons-vue';
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
  voice_audio: '',
  type: 'character',
  image: '',
  appeared_episodes: []
});

const isGeneratingImage = ref(false);
const isPolishingText = ref(false);
const isPolishingVoice = ref(false);

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
      voice_description: newVal.voice_description || (newVal.type === 'character' ? '沉稳大气，富有磁性' : ''),
      voice_audio: newVal.voice_audio || '',
      image: newVal.image || '',
      appeared_episodes: newVal.appeared_episodes && newVal.appeared_episodes.length > 0 ? newVal.appeared_episodes : [1]
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
      character: `https://picsum.photos/960/540?random=char_${Date.now()}`,
      scene: `https://picsum.photos/960/540?random=scene_${Date.now()}`,
      prop: `https://picsum.photos/960/540?random=prop_${Date.now()}`
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
    localSubject.value.description = `${originalText}（经过AI润色：增强了视觉张力和氛围感，使其更符合剧作水准。）`;
    
    ElMessage.success('文本润色完成');
  } catch (error) {
    ElMessage.error('润色失败，请稍后重试');
  } finally {
    isPolishingText.value = false;
  }
};

const polishVoice = async () => {
  if (!localSubject.value.voice_description) return;

  isPolishingVoice.value = true;
  try {
    // Simulate AI Voice Description Polishing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const originalText = localSubject.value.voice_description;
    localSubject.value.voice_description = `${originalText}（AI优化：增加了音色质感和情感表现力的描述）`;
    
    ElMessage.success('音色描述润色完成');
  } catch (error) {
    ElMessage.error('润色失败，请稍后重试');
  } finally {
    isPolishingVoice.value = false;
  }
};

const handleImageUpload = (file: any) => {
  localSubject.value.image = URL.createObjectURL(file.raw);
  ElMessage.success('预览图更新成功');
};

const handleVoiceDescriptionInput = () => {
  if (localSubject.value.voice_description) {
    localSubject.value.voice_audio = '';
  }
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

/* Custom Select */
.custom-select-v3 .el-select__wrapper {
  background-color: #f8fafc !important;
  border-radius: 16px !important;
  padding: 8px 16px !important;
  border: 1px solid #f1f5f9 !important;
  box-shadow: none !important;
  min-height: 44px !important;
}

/* Animations */
.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
