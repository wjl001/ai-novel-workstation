<template>
  <el-dialog 
    v-model="visible" 
    :title="`产品设计说明 - ${editingDesign.title}`" 
    width="850px" 
    class="product-design-dialog rounded-[24px] !bg-[#f8fafc] dark:!bg-slate-900 overflow-hidden" 
    :show-close="false"
  >
    <template #header="{ close, titleId, titleClass }">
      <div class="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
            <el-icon :size="20"><Document /></el-icon>
          </div>
          <div class="flex flex-col">
            <h4 :id="titleId" :class="[titleClass, 'text-xl font-black text-slate-800 dark:text-white m-0']">
              {{ isEditing ? '编辑产品设计' : editingDesign.title }}
            </h4>
            <span class="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Version {{ editingDesign.version || '2.1' }}</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button 
            v-if="!isEditing"
            @click="startEditing" 
            class="px-4 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-sm font-bold transition-colors flex items-center gap-1"
          >
            <el-icon><EditPen /></el-icon>
            编辑说明
          </button>
          <button @click="closeDialog" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
            <el-icon :size="20"><Close /></el-icon>
          </button>
        </div>
      </div>
    </template>

    <div class="px-8 py-10 max-h-[75vh] overflow-y-auto custom-scrollbar bg-[#f8fafc] dark:bg-slate-900/50 font-chinese">
      <!-- View Mode -->
      <div v-if="!isEditing" class="max-w-3xl mx-auto space-y-16">
        <!-- 页面定位 -->
        <section class="space-y-6">
          <h3 class="text-[#6366f1] dark:text-indigo-400 font-black flex items-center gap-3 text-xl tracking-tight">
            <el-icon :size="22"><Location /></el-icon>
            页面定位
          </h3>
          <div class="bg-white dark:bg-slate-800/80 p-8 rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-700/50 relative overflow-hidden group">
            <div class="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p class="text-slate-600 dark:text-slate-300 leading-relaxed text-base font-bold">
              {{ editingDesign.location }}
            </p>
          </div>
        </section>

        <!-- 原型布局概要 -->
        <section class="space-y-8">
          <h3 class="text-[#6366f1] dark:text-indigo-400 font-black flex items-center gap-3 text-xl tracking-tight">
            <el-icon :size="22"><Monitor /></el-icon>
            原型布局概要
          </h3>
          <div class="space-y-5">
            <div 
              v-for="(point, idx) in editingDesign.layout" 
              :key="idx" 
              class="flex items-start gap-5 bg-white dark:bg-slate-800/80 p-6 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-slate-700/50 transition-all hover:border-indigo-200 dark:hover:border-indigo-800/50 hover:shadow-xl hover:shadow-indigo-500/5"
            >
              <span class="w-2.5 h-2.5 rounded-full bg-[#6366f1] mt-2 shrink-0 shadow-[0_0_12px_rgba(99,102,241,0.6)] animate-pulse"></span>
              <span class="text-slate-700 dark:text-slate-200 text-[16px] leading-relaxed font-bold" v-html="formatRichText(point)"></span>
            </div>
          </div>
        </section>

        <!-- 核心交互 -->
        <section class="space-y-8">
          <h3 class="text-[#6366f1] dark:text-indigo-400 font-black flex items-center gap-3 text-xl tracking-tight">
            <el-icon :size="22"><Pointer /></el-icon>
            核心交互
          </h3>
          <div class="space-y-6">
            <div 
              v-for="(point, idx) in editingDesign.interactions" 
              :key="idx" 
              class="bg-white dark:bg-slate-800/80 p-6 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-slate-700/50 transition-all hover:border-indigo-200 dark:hover:border-indigo-800/50 hover:shadow-xl hover:shadow-indigo-500/5"
            >
              <div class="flex items-start gap-5">
                <span class="w-2.5 h-2.5 rounded-full bg-[#6366f1] mt-2 shrink-0 shadow-[0_0_12px_rgba(99,102,241,0.6)] animate-pulse"></span>
                <div class="flex-1 space-y-4">
                  <span class="text-slate-700 dark:text-slate-200 text-[16px] leading-relaxed font-bold block" v-html="formatRichText(point.text)"></span>
                  
                  <!-- Interaction Image -->
                  <div v-if="point.image" class="relative max-w-[280px] rounded-2xl overflow-hidden border-4 border-slate-50 dark:border-slate-700 shadow-lg">
                    <img :src="normalizeDesignImageUrl(point.image)" class="w-full object-contain" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Prototype Screenshots - Strong Visual C-end Style -->
        <section v-if="editingDesign.images && editingDesign.images.length > 0" class="space-y-12 pt-10 border-t border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-6 justify-center">
            <div class="h-px w-16 bg-gradient-to-r from-transparent to-indigo-500/50"></div>
            <h3 class="text-[#6366f1] dark:text-indigo-400 font-black flex items-center gap-3 text-2xl tracking-tighter">
              <el-icon :size="24"><Picture /></el-icon>
              界面视觉呈现
            </h3>
            <div class="h-px w-16 bg-gradient-l from-transparent to-indigo-500/50"></div>
          </div>

          <div class="space-y-20">
            <div v-for="(img, idx) in editingDesign.images" :key="idx" class="group relative animate-in">
              <!-- Top Labels - Pill Style -->
              <div class="flex items-center justify-between mb-6 px-2">
                <div class="flex items-center gap-2.5 px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
                  <span class="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
                  <span class="text-[12px] font-black text-slate-500 dark:text-slate-400 tracking-[0.1em] uppercase">Visual Concept {{ idx + 1 }}</span>
                </div>
                <div v-if="img.caption" class="px-5 py-2 bg-indigo-50/80 dark:bg-indigo-900/40 backdrop-blur-md rounded-full border border-indigo-100/50 dark:border-indigo-800/50 shadow-sm">
                  <span class="text-indigo-600 dark:text-indigo-300 font-black text-[12px]">{{ img.caption }}</span>
                </div>
              </div>
              
              <!-- Main Image Card -->
              <div class="prototype-image-card relative rounded-[48px] overflow-hidden border-[16px] border-white dark:border-slate-800 shadow-[0_40px_100px_rgba(0,0,0,0.12)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.4)] transition-all duration-700 bg-white dark:bg-slate-800">
                <img :src="normalizeDesignImageUrl(img.url)" :alt="img.caption || 'Prototype Screenshot'" class="w-full object-contain select-none transition-transform duration-1000 group-hover:scale-[1.03]" />
                <!-- Subtle Inner Glow -->
                <div class="absolute inset-0 pointer-events-none border border-black/[0.03] dark:border-white/[0.05] rounded-[32px]"></div>
              </div>
              
              <!-- Bottom Centered Caption Pill -->
              <div v-if="img.caption" class="mt-8 flex justify-center">
                <div class="px-10 py-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-[30px] border border-slate-100 dark:border-slate-700 shadow-xl shadow-indigo-500/5 transition-all duration-500 hover:shadow-indigo-500/10">
                  <p class="text-slate-700 dark:text-slate-200 text-base font-black tracking-tight">
                    {{ img.caption }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Edit Mode -->
      <div v-else class="space-y-8">
        <!-- Title & Version -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">说明标题</label>
            <el-input v-model="editingDesign.title" placeholder="输入说明标题..." />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">版本号</label>
            <el-input v-model="editingDesign.version" placeholder="2.1" />
          </div>
        </div>

        <!-- Image Upload -->
        <div class="space-y-4">
          <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">原型截图 (支持多图)</label>
          
          <div v-if="editingDesign.images && editingDesign.images.length > 0" class="grid grid-cols-1 gap-6">
            <div v-for="(img, idx) in editingDesign.images" :key="idx" class="relative group border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-white dark:bg-slate-800">
              <div class="flex gap-4">
                <div class="w-32 h-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 shrink-0">
                  <img :src="normalizeDesignImageUrl(img.url)" class="w-full h-full object-cover" />
                </div>
                <div class="flex-1 space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">截图 {{ idx + 1 }} 说明</span>
                    <button @click="removeImage(idx)" class="text-red-500 hover:text-red-600 p-1">
                      <el-icon><Delete /></el-icon>
                    </button>
                  </div>
                  <el-input 
                    v-model="img.caption" 
                    placeholder="输入此截图的说明 (例如: 侧边栏交互状态)" 
                    size="small"
                  />
                  <div class="flex gap-2">
                    <button @click="moveImage(idx, -1)" :disabled="idx === 0" class="text-xs text-slate-400 hover:text-indigo-500 disabled:opacity-30">上移</button>
                    <button @click="moveImage(idx, 1)" :disabled="idx === editingDesign.images.length - 1" class="text-xs text-slate-400 hover:text-indigo-500 disabled:opacity-30">下移</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div 
            class="upload-area border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:border-indigo-400 transition-colors cursor-pointer group"
            @click="triggerImageUpload"
          >
            <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleImageChange" />
            <el-icon :size="32" class="text-slate-300 group-hover:text-indigo-400 transition-colors"><Plus /></el-icon>
            <p class="text-xs text-slate-400">点击上传新的原型页面截图</p>
          </div>
        </div>

        <!-- Location -->
        <div class="space-y-2">
          <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">页面定位</label>
          <el-input 
            v-model="editingDesign.location" 
            type="textarea" 
            :rows="3" 
            placeholder="描述此页面的核心功能和定位..." 
          />
        </div>

        <!-- Layout Points -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">原型布局概要</label>
            <button @click="addLayoutPoint" class="text-indigo-600 hover:text-indigo-700 text-xs font-bold flex items-center gap-1">
              <el-icon><Plus /></el-icon>添加要点
            </button>
          </div>
          <div class="space-y-3">
            <div v-for="(point, idx) in editingDesign.layout" :key="idx" class="flex gap-2">
              <el-input v-model="editingDesign.layout[idx]" placeholder="输入布局说明 (支持 **加粗**)" />
              <button @click="removeLayoutPoint(idx)" class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500"><el-icon><Delete /></el-icon></button>
            </div>
          </div>
        </div>

        <!-- Interaction Points -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">核心交互 (着重突出按钮等)</label>
            <button @click="addInteractionPoint" class="text-purple-600 hover:text-purple-700 text-xs font-bold flex items-center gap-1">
              <el-icon><Plus /></el-icon>添加交互
            </button>
          </div>
          <div class="space-y-4">
            <div v-for="(point, idx) in editingDesign.interactions" :key="idx" class="space-y-2 p-4 border border-slate-100 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800">
              <div class="flex gap-2">
                <el-input v-model="point.text" placeholder="输入交互说明 (支持 **加粗**)" />
                <button @click="removeInteractionPoint(idx)" class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 shrink-0"><el-icon><Delete /></el-icon></button>
              </div>
              
              <div class="flex items-center gap-4">
                <div v-if="point.image" class="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 shrink-0">
                  <img :src="normalizeDesignImageUrl(point.image)" class="w-full h-full object-cover" />
                  <button @click="point.image = ''" class="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors">
                    <el-icon :size="10"><Close /></el-icon>
                  </button>
                </div>
                
                <button 
                  v-else
                  @click="triggerInteractionImageUpload(idx)" 
                  class="w-20 h-20 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-400 transition-all shrink-0"
                >
                  <el-icon :size="20"><Picture /></el-icon>
                  <span class="text-[10px] mt-1">配图</span>
                </button>
                
                <p class="text-[10px] text-slate-400 italic">上传一张小图来直观展示此交互动作（例如按钮点击后的状态或流程环节图片）。</p>
              </div>
            </div>
          </div>
          <input type="file" ref="interactionFileInput" class="hidden" accept="image/*" @change="handleInteractionImageChange" />
        </div>
      </div>
    </div>

    <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
      <div v-if="isEditing" class="text-xs text-slate-400 italic">
        提示: 使用 **文本** 来加粗显示重点按钮或交互。
      </div>
      <div v-else></div>
      <div class="flex items-center gap-3">
        <button 
          v-if="isEditing"
          @click="saveChanges" 
          class="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center gap-2"
        >
          <el-icon><Check /></el-icon>
          保存修改
        </button>
        <button @click="closeDialog" class="px-8 py-2.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 font-black rounded-xl transition-all border border-slate-200 dark:border-slate-600 active:scale-95">
          {{ isEditing ? '退出编辑' : '我已了解' }}
        </button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue';
import { 
  Document, Close, Location, Monitor, Pointer, EditPen, 
  Check, Picture, Delete, Plus, Refresh, MagicStick 
} from '@element-plus/icons-vue';
import { useProductDesignStore } from '@/store/productDesign';
import { ElMessage } from 'element-plus';

const props = defineProps<{
  modelValue: boolean;
  id: string;
  defaultContent: {
    title: string;
    location: string;
    layout: string[];
    interactions: (string | { text: string; image?: string })[];
    images?: { url: string; caption: string }[];
    image?: string;
    version?: string;
  };
}>();

const emit = defineEmits(['update:modelValue']);

const store = useProductDesignStore();
const visible = ref(props.modelValue);
const isEditing = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const interactionFileInput = ref<HTMLInputElement | null>(null);
const currentInteractionIndex = ref(-1);

const editingDesign = reactive({
  title: '',
  location: '',
  layout: [] as string[],
  interactions: [] as { text: string; image?: string }[],
  images: [] as { url: string; caption: string }[],
  version: '2.1'
});

// Load data when dialog opens
watch(() => props.modelValue, async (newVal) => {
  visible.value = newVal;
  if (newVal) {
    await store.loadFromServer();
    const data = store.getDesign(props.id, {
      id: props.id,
      version: '2.1',
      ...props.defaultContent
    });
    
    // Migration for reactive object if needed
    if (data.image && (!data.images || data.images.length === 0)) {
      data.images = [{ url: data.image, caption: '原型截图' }];
    }
    
    // Normalize interactions to object array
    const normalizedInteractions = (data.interactions || []).map(item => {
      if (typeof item === 'string') {
        return { text: item, image: '' };
      }
      return { ...item };
    });
    
    Object.assign(editingDesign, {
      ...data,
      images: data.images || [],
      interactions: normalizedInteractions
    });
    isEditing.value = false;
  }
});

watch(visible, (newVal) => {
  emit('update:modelValue', newVal);
});

const closeDialog = () => {
  visible.value = false;
};

const startEditing = () => {
  isEditing.value = true;
};

const saveChanges = () => {
  store.updateDesign(props.id, { ...editingDesign });
  isEditing.value = false;
  ElMessage.success('产品设计说明已保存');
};

const persistEditingDesign = () => {
  store.updateDesign(props.id, JSON.parse(JSON.stringify(editingDesign)));
};

const normalizeDesignImageUrl = (url?: string) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) return url;
  if (url.startsWith('/ai-short-drama-creator/images/')) return url;
  if (url.startsWith('/images/')) return `/ai-short-drama-creator${url}`;
  if (url.startsWith('images/')) return `/ai-short-drama-creator/${url}`;
  if (url.startsWith('/')) return url;
  return url;
};

const formatRichText = (text: string) => {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-600 dark:text-indigo-400">$1</strong>')
    .replace(/\\n/g, '<br />')
    .replace(/\n/g, '<br />');
};

const uploadDesignImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/design-images/upload', {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload?.message || 'Upload failed');
  }
  const payload = await res.json();
  if (!payload?.url) throw new Error('Upload failed');
  
  const baseUrl = import.meta.env.BASE_URL;
  const rawUrl = payload.url as string;
  if (rawUrl.startsWith(baseUrl)) return rawUrl;
  if (rawUrl.startsWith('/')) return `${baseUrl.replace(/\/$/, '')}${rawUrl}`;
  return `${baseUrl}${rawUrl}`;
};

// Image Upload Handlers
const triggerImageUpload = () => {
  fileInput.value?.click();
};

const handleImageChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      ElMessage.warning('图片大小不能超过 2MB');
      return;
    }
    try {
      const url = await uploadDesignImage(file);
      if (!editingDesign.images) editingDesign.images = [];
      editingDesign.images.push({ url, caption: '' });
      if (fileInput.value) fileInput.value.value = '';
      ElMessage.success('图片上传成功');
    } catch (err: any) {
      ElMessage.error(err?.message || '图片上传失败');
    }
  }
};

const removeImage = (index: number) => {
  editingDesign.images.splice(index, 1);
};

const moveImage = (index: number, direction: number) => {
  const newIndex = index + direction;
  if (newIndex >= 0 && newIndex < editingDesign.images.length) {
    const temp = editingDesign.images[index];
    editingDesign.images[index] = editingDesign.images[newIndex];
    editingDesign.images[newIndex] = temp;
  }
};

// Interaction Image Handlers
const triggerInteractionImageUpload = (index: number) => {
  currentInteractionIndex.value = index;
  interactionFileInput.value?.click();
};

const handleInteractionImageChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file && currentInteractionIndex.value !== -1) {
    if (file.size > 1 * 1024 * 1024) { // Interaction images should be smaller
      ElMessage.warning('交互配图不能超过 1MB');
      return;
    }
    try {
      const url = normalizeDesignImageUrl(await uploadDesignImage(file));
      editingDesign.interactions[currentInteractionIndex.value].image = url;
      persistEditingDesign();
      if (interactionFileInput.value) interactionFileInput.value.value = '';
      currentInteractionIndex.value = -1;
      ElMessage.success('配图上传成功');
    } catch (err: any) {
      ElMessage.error(err?.message || '配图上传失败');
    }
  }
};

// List Handlers
const addLayoutPoint = () => {
  editingDesign.layout.push('');
};

const removeLayoutPoint = (index: number) => {
  editingDesign.layout.splice(index, 1);
};

const addInteractionPoint = () => {
  editingDesign.interactions.push({ text: '', image: '' });
};

const removeInteractionPoint = (index: number) => {
  editingDesign.interactions.splice(index, 1);
};
</script>

<style scoped>
.interaction-card {
  border-left: 4px solid #8b5cf6;
}

.product-design-dialog :deep(.el-dialog__header) {
  padding: 0;
  margin: 0;
}

.product-design-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.upload-area {
  min-height: 200px;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
}

/* C-end High Quality Typography & Effects */
.font-chinese {
  font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.prototype-image-card {
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.1);
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.prototype-image-card:hover {
  transform: translateY(-10px);
}
</style>
