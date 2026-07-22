<template>
  <el-dialog
    v-model="visible"
    width="94vw"
    :show-close="false"
    class="custom-subject-dialog"
    destroy-on-close
    :style="{ maxWidth: '1040px' }"
    align-center
  >
    <div class="flex items-start justify-between gap-4 mb-6 px-2">
      <div class="space-y-2">
        <h2 class="text-[24px] font-black text-slate-800 dark:text-slate-100 tracking-tight">{{ title }}</h2>
        <div class="flex items-center gap-4 text-[12px]">
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 font-black border border-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-900/50 dark:text-indigo-300">
              {{ typeLabel }}{{ type === 'storyboard' ? '视频' : '图片' }}管理
            </span>
            <span class="text-slate-400 dark:text-slate-500 font-semibold">
              历史{{ type === 'storyboard' ? '视频' : '图片' }} {{ localSubject.imageHistory.length }} 张，默认选中最新生成
            </span>
          </div>
          <div class="flex items-center gap-2 ml-2">
            <AIModelSelector v-model="modelStore.selectedTextModel" type="text" compact moduleId="subject-edit-text" />
            <AIModelSelector 
              :model-value="type === 'storyboard' ? modelStore.selectedVideoModel : modelStore.selectedImageModel" 
              :type="type === 'storyboard' ? 'video' : 'image'" 
              compact
              moduleId="subject-edit-visual"
              @update:model-value="(val) => {
                if (type === 'storyboard') {
                  modelStore.setVideoModel(val);
                } else {
                  modelStore.setImageModel(val);
                }
              }"
            />
          </div>
        </div>
      </div>
      <button
        @click="visible = false"
        class="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 transition-colors"
      >
        <el-icon size="18"><Close /></el-icon>
      </button>
    </div>

    <div class="px-2 overflow-hidden subject-dialog-shell flex-1 min-h-0">
      <div class="grid grid-cols-[200px_minmax(0,1fr)_240px] gap-3 h-full">
        <aside class="rounded-[22px] border border-slate-100 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 overflow-hidden flex flex-col h-full">
          <div class="shrink-0 px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl">
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0">
                <div class="text-[13px] font-black text-slate-800 dark:text-slate-100 truncate">历史{{ type === 'storyboard' ? '视频' : '图片' }}</div>
                <div class="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">
                  {{ localSubject.imageHistory.length }} {{ type === 'storyboard' ? '个' : '张' }} · 每{{ type === 'storyboard' ? '个' : '张' }}可单独配置
                </div>
              </div>
              <div class="flex items-center gap-1.5 shrink-0">
                <button
                  @click="cloneHistoricalItem"
                  class="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm"
                  title="克隆当前项"
                >
                  <el-icon :size="14"><Plus /></el-icon>
                </button>
              </div>
            </div>
          </div>

          <div v-if="pagedImageHistory.length > 0" class="flex-1 min-h-0 overflow-y-auto custom-history-scrollbar">
            <div class="p-2 space-y-2">
              <div
                v-for="item in pagedImageHistory"
                :key="item.id"
                class="relative group/item"
              >
                <button
                  type="button"
                  class="w-full flex items-center gap-2.5 px-2 py-2 rounded-2xl border text-left transition-all"
                  :class="item.isSelected ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/30' : 'border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/40 hover:border-indigo-200'"
                  @click="applySelectedImage(item.id)"
                >
                  <div class="w-[52px] h-[36px] rounded-xl overflow-hidden border border-white/60 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0 relative group/thumb">
                    <template v-if="item.url">
                      <el-image 
                        :src="item.url" 
                        :preview-src-list="[item.url]"
                        preview-teleported
                        class="w-full h-full object-cover cursor-pointer"
                        @click.stop
                      >
                        <template #error>
                          <div class="w-full h-full flex items-center justify-center text-slate-400 bg-slate-200 dark:bg-slate-700">
                            <el-icon size="14"><Picture /></el-icon>
                          </div>
                        </template>
                      </el-image>
                      <!-- 如果是分镜且有视频，显示播放图标 -->
                      <div 
                        v-if="type === 'storyboard' && item.video" 
                        class="absolute inset-0 bg-black/20 flex items-center justify-center cursor-pointer hover:bg-black/40 transition-colors"
                        @click.stop="openVideoPreview(item.video)"
                      >
                        <el-icon class="text-white" size="14"><VideoPlay /></el-icon>
                      </div>
                    </template>
                    <div v-else class="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-800">
                      <el-icon :size="14" class="text-slate-400"><Picture /></el-icon>
                    </div>
                    <div v-if="item.isSelected" class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md z-10">
                      <el-icon :size="12"><Check /></el-icon>
                    </div>
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between gap-2">
                      <span class="text-[12px] font-black text-slate-800 dark:text-slate-100 truncate">
                        {{ item.name || localSubject.name || `${typeLabel}未命名` }}
                      </span>
                      <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 shrink-0">{{ formatHistoryTime(item.createdAt) }}</span>
                    </div>
                    <div class="flex items-center gap-2 mt-1">
                      <span v-if="item.reference_image" class="px-1.5 py-0.5 rounded-full bg-slate-900/5 dark:bg-white/10 text-[9px] font-black text-slate-500 dark:text-slate-300">参考图</span>
                      <span v-if="type === 'character' && item.voice_description" class="px-1.5 py-0.5 rounded-full bg-slate-900/5 dark:bg-white/10 text-[9px] font-black text-slate-500 dark:text-slate-300">设定</span>
                      <span class="text-[10px] text-slate-400 dark:text-slate-500 font-semibold truncate">
                        {{ item.isSelected ? '当前使用中' : (item.url ? '点击切换' : '待生成图片') }}
                      </span>
                    </div>
                  </div>
                </button>
                
                <!-- 删除按钮 -->
                <button
                  v-if="localSubject.imageHistory.length > 1 && item.id !== localSubject.selectedImageId && item.id !== parentSelectedImageId"
                  @click.stop="deleteHistoricalItem(item.id)"
                  class="absolute -right-1 -top-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all hover:scale-110 shadow-lg z-10"
                  title="删除此项"
                >
                  <el-icon :size="12"><Close /></el-icon>
                </button>
              </div>
            </div>
          </div>

          <div
            v-else
            class="flex-1 min-h-0 p-4 flex flex-col items-center justify-center text-center"
          >
            <el-icon size="28" class="text-slate-300 dark:text-slate-600 mb-2"><Picture /></el-icon>
            <div class="text-[12px] font-black text-slate-700 dark:text-slate-200 mb-1">暂无历史图</div>
            <p class="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
              点击上方「生成」创建首张图片
            </p>
          </div>

          <div v-if="localSubject.imageHistory.length > pageSize" class="shrink-0 px-3 py-2 border-t border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70">
            <el-pagination
              v-model:current-page="imageHistoryPage"
              :page-size="pageSize"
              :total="localSubject.imageHistory.length"
              layout="prev, pager, next"
              small
              background
            />
          </div>
        </aside>

        <main class="min-w-0 overflow-hidden h-full flex flex-col">
          <div class="flex-1 overflow-y-auto custom-history-scrollbar pr-1 min-h-0">
            <div class="flex flex-col gap-3 pb-2">
              <!-- 名称 -->
              <div class="flex flex-col gap-1.5">
                <label class="text-[12px] text-slate-400 font-black uppercase tracking-wider px-1">
                  {{ type === 'character' ? '形象名称' : (type === 'storyboard' ? '分镜名称' : '名称') }} <span class="text-red-500">*</span>
                </label>
                <div class="relative flex-1 min-w-0">
                  <input
                    v-model="localSubject.name"
                    type="text"
                    placeholder="请输入名称"
                    class="w-full px-4 py-2.5 border border-slate-100 dark:border-slate-700 rounded-2xl text-[13px] font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all pr-16 dark:text-slate-200 bg-[#f8fafc] dark:bg-slate-900/50"
                    maxlength="20"
                  />
                  <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-slate-300 font-mono">
                    {{ localSubject.name?.length || 0 }}/20
                  </span>
                </div>
              </div>

              <!-- 描述 -->
              <div class="flex flex-col gap-1.5">
                <div class="flex justify-between items-center px-1">
                  <label class="text-[12px] text-slate-400 font-black uppercase tracking-wider">
                    {{ type === 'character' ? '形象描述' : (type === 'storyboard' ? '分镜脚本' : '详细描述') }}
                  </label>
                  <div class="flex items-center gap-3">
                    <button
                      @click="polishText"
                      class="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 text-[11px] font-black transition-all disabled:opacity-50"
                      :disabled="isPolishingText || !localSubject.description"
                    >
                      <el-icon :class="{ 'animate-spin': isPolishingText }"><Refresh /></el-icon>
                      <span>AI 润色优化</span>
                    </button>
                  </div>
                </div>
                <div class="relative bg-[#f8fafc] dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-[20px] p-3 flex flex-col group transition-all focus-within:ring-4 focus-within:ring-indigo-500/5"
                     :class="type === 'storyboard' ? 'min-h-[360px]' : 'min-h-[100px]'">
                  <textarea
                    v-model="localSubject.description"
                    :placeholder="type === 'storyboard' ? '请输入分镜脚本描述...' : '请输入详细描述...'"
                    class="w-full flex-1 bg-transparent border-none resize-none text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed font-bold focus:outline-none custom-history-scrollbar"
                  ></textarea>
                </div>
              </div>

              <!-- 参考图 (分镜类型隐藏) -->
              <div v-if="type !== 'storyboard'" class="flex flex-col gap-1.5">
                <label class="text-[12px] text-slate-400 font-black uppercase tracking-wider px-1">
                  参考图 <span class="text-slate-300 font-normal ml-1">(可选)</span>
                </label>
                <div class="flex items-center gap-4 bg-[#f8fafc] dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-[20px] p-3.5 transition-all hover:border-indigo-100 dark:hover:border-indigo-900/50">
                  <div class="w-20 h-20 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center overflow-hidden relative group/ref shrink-0 shadow-sm">
                    <el-image 
                      v-if="localSubject.reference_image" 
                      :src="localSubject.reference_image" 
                      :preview-src-list="[localSubject.reference_image]"
                      preview-teleported
                      class="w-full h-full object-cover" 
                    />
                    <el-icon v-else size="24" class="text-slate-200 dark:text-slate-700"><Picture /></el-icon>
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover/ref:opacity-100 transition-all flex items-center justify-center gap-2 pointer-events-none">
                      <el-upload action="#" :auto-upload="false" :show-file-list="false" @change="handleReferenceImageUpload" class="pointer-events-auto">
                        <el-icon class="text-white cursor-pointer hover:scale-110" size="18"><Upload /></el-icon>
                      </el-upload>
                      <el-icon v-if="localSubject.reference_image" class="text-white cursor-pointer hover:scale-110 pointer-events-auto" size="18" @click="localSubject.reference_image = ''">
                        <Delete />
                      </el-icon>
                    </div>
                  </div>
                  <div class="flex-1 flex flex-col gap-2">
                    <p class="text-[11px] text-slate-400 leading-relaxed font-medium">
                      上传参考图可以帮助 AI 更准确地控制{{ typeLabel }}的视觉特征。
                    </p>
                    <el-upload action="#" :auto-upload="false" :show-file-list="false" @change="handleReferenceImageUpload">
                      <button class="px-4 py-1.5 bg-white dark:bg-slate-800 text-indigo-600 border border-indigo-100 dark:border-indigo-900/50 rounded-full text-[11px] font-black hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-all shadow-sm">
                        {{ localSubject.reference_image ? '更换图片' : '上传参考图' }}
                      </button>
                    </el-upload>
                  </div>
                </div>
              </div>

              <!-- 声音设定 (分镜类型隐藏) -->
              <div v-if="type === 'character'" class="flex flex-col gap-2">
                <label class="text-[12px] text-slate-400 font-black uppercase tracking-wider px-1">角色声音设定</label>
                <div class="bg-[#f8fafc] dark:bg-slate-900/50 rounded-[20px] border border-slate-100 dark:border-slate-700 p-1 flex flex-col min-h-[140px]">
                  <div class="flex-1 flex flex-col p-1.5 min-h-0">
                    <div class="h-full flex flex-col">
                      <div class="flex justify-end items-center gap-3 px-2 mb-1">
                        <button
                          @click="polishVoice"
                          class="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 text-[10px] font-black transition-all disabled:opacity-50"
                          :disabled="isPolishingVoice || !localSubject.voice_description"
                        >
                          <el-icon :class="{ 'animate-spin': isPolishingVoice }"><Refresh /></el-icon>
                          <span>AI 润色优化</span>
                        </button>
                      </div>
                      <textarea
                        v-model="localSubject.voice_description"
                        placeholder="描述角色的音色特点，如：男声，深沉，富有磁性..."
                        class="w-full flex-1 bg-transparent border-none resize-none text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed font-bold focus:outline-none px-2 custom-history-scrollbar"
                        @input="handleVoiceDescriptionInput"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <aside class="w-[240px] flex flex-col gap-3 shrink-0 overflow-hidden h-full">
          <div class="flex-1 flex flex-col gap-3 overflow-y-auto custom-history-scrollbar pr-1 min-h-0">
            <div class="aspect-video rounded-[24px] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 overflow-hidden relative shadow-sm group shrink-0">
            <div v-if="isGeneratingImage" class="absolute inset-0 z-10 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
              <el-icon class="animate-spin text-indigo-600" size="28"><Loading /></el-icon>
              <span class="text-[12px] text-slate-500 dark:text-slate-400 font-black">
                {{ type === 'storyboard' ? '分镜视频' : typeLabel + '图片' }}生成中...
              </span>
            </div>

            <div v-if="type === 'storyboard' && localSubject.video" class="w-full h-full relative rounded-2xl overflow-hidden group bg-black shadow-2xl">
              <video 
                :key="localSubject.video + videoKeySuffix"
                :src="localSubject.video" 
                class="w-full h-full object-contain"
                controls
                autoplay
                loop
                muted
                playsinline
                preload="auto"
              ></video>
              <!-- 放大预览按钮 -->
              <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button 
                  @click="openVideoPreview(localSubject.video)"
                  class="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all"
                >
                  <el-icon><FullScreen /></el-icon>
                </button>
              </div>
            </div>
            <template v-else>
              <el-image
                v-if="localSubject.image"
                :src="localSubject.image"
                :preview-src-list="previewSrcList.length ? previewSrcList : [localSubject.image]"
                :initial-index="previewInitialIndex"
                preview-teleported
                class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 cursor-pointer"
                fit="cover"
              >
                <template #error>
                  <div class="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100 dark:bg-slate-800">
                    <el-icon size="32"><Picture /></el-icon>
                    <span class="text-[12px] mt-2">图片加载失败</span>
                  </div>
                </template>
              </el-image>
              <div v-else class="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 gap-2">
                <el-icon size="40"><Picture /></el-icon>
                <span class="text-[12px] font-black uppercase tracking-widest">暂无预览</span>
              </div>
            </template>

            <div v-if="!hideUpload && type !== 'storyboard'" class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px] pointer-events-none">
              <el-upload
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                @change="handleImageUpload"
                class="pointer-events-auto"
              >
                <button class="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 rounded-full text-[12px] font-black hover:scale-105 active:scale-95 transition-all shadow-xl">
                  <el-icon><Upload /></el-icon>
                  <span>本地上传</span>
                </button>
              </el-upload>
            </div>
          </div>

          <!-- 推荐提示语移到图片下方 -->
          <p class="text-[9px] text-slate-400 text-center font-bold uppercase tracking-widest mt-1">推荐 16:9 · 支持 JPG/PNG</p>

          <div class="rounded-[22px] bg-[#1f2329] dark:bg-slate-800 px-5 py-4 text-white shadow-lg shadow-black/10 dark:shadow-black/30">
            <div class="flex items-center justify-between gap-3 mb-2">
              <span class="text-[13px] font-black">{{ type === 'storyboard' ? '当前选中分镜' : '当前选中图片' }}</span>
              <span class="text-[11px] text-white/60">{{ selectedImageMeta }}</span>
            </div>
            <p class="text-[12px] text-white/70 leading-relaxed">
              {{ type === 'storyboard' 
                ? '当前分镜视频和封面已同步。保存后将更新时间轴上的分镜画面与预览视频。' 
                : `已选中的图片会作为当前${typeLabel}封面，并在保存后回显到父级页面卡片中。` 
              }}
            </p>
          </div>

      <div class="space-y-3">
        <button
          @click="generateImage"
          class="w-full h-[40px] flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-[13px] font-black hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-indigo-500/20 group/ai"
          :disabled="isGeneratingImage"
        >
          <el-icon :size="16" class="group-hover/ai:rotate-12 transition-transform" :class="{ 'animate-spin': isGeneratingImage }"><MagicStick /></el-icon>
          <span>{{ localSubject.image ? '重新生成' : '开始生成' }}</span>
        </button>
      </div>
          </div>
        </aside>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end items-center gap-3 px-2 pt-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800">
        <button
          @click="visible = false"
          class="px-8 py-2.5 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-400 text-[14px] font-black hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 transition-all"
        >
          取消
        </button>
        
        <!-- 保存当前编辑按钮移到这里 -->
        <button
          @click="handleExplicitSave"
          class="px-8 py-2.5 rounded-full bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 text-[14px] font-black hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:border-indigo-200 transition-all shadow-sm group/save flex items-center gap-2"
        >
          <el-icon :size="16" class="group-hover/save:scale-110 transition-transform"><DocumentChecked /></el-icon>
          <span>保存当前编辑信息</span>
        </button>

        <button
          @click="handleSave"
          class="px-10 py-2.5 rounded-full bg-indigo-600 text-white text-[14px] font-black shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
          :disabled="!localSubject.name || !localSubject.image || isGeneratingImage || isPolishingText || isPolishingVoice"
        >
          确认应用并同步至当前{{ typeLabel }}
        </button>
      </div>
    </template>
  </el-dialog>

  <!-- 视频放大预览弹窗 -->
  <el-dialog
    v-model="videoPreviewVisible"
    width="80vw"
    :show-close="true"
    destroy-on-close
    class="video-preview-dialog"
    append-to-body
  >
    <div class="aspect-video w-full bg-black rounded-lg overflow-hidden">
      <video 
        :key="videoPreviewUrl"
        :src="videoPreviewUrl" 
        class="w-full h-full" 
        controls 
        autoplay
        playsinline
      ></video>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { generateImageAPI } from '@/utils/imageGenerator';
import { useModelStore } from '@/store/models';
import AIModelSelector from '@/components/Common/ModelSelector.vue';
import { Close, MagicStick, Picture, Refresh, Upload, Loading, Delete, Check, Plus, VideoPlay, FullScreen, DocumentChecked, Coin } from '@element-plus/icons-vue';

const modelStore = useModelStore();
import { ElMessage, ElMessageBox } from 'element-plus';

interface AssetImageItem {
  id: string;
  url: string;
  isSelected: boolean;
  createdAt: number;
  name?: string;
  description?: string;
  reference_image?: string;
  voice_description?: string;
  voice_audio?: string;
  video?: string;
}

const props = defineProps<{
  modelValue: boolean;
  subject: any;
  isEdit: boolean;
  hideUpload?: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'save']);

const pageSize = 32;
const imageHistoryPage = ref(1);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const createImageHistoryItem = (url: string, meta?: Partial<AssetImageItem>): AssetImageItem => ({
  id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  url,
  isSelected: true,
  createdAt: Date.now(),
  name: meta?.name,
  description: meta?.description,
  reference_image: meta?.reference_image,
  voice_description: meta?.voice_description,
  voice_audio: meta?.voice_audio,
  video: meta?.video
});

const normalizeImageHistory = (subject: any) => {
  const rawHistory = Array.isArray(subject?.imageHistory)
    ? subject.imageHistory.filter((item: any) => item && item.url)
    : [];

  const history: AssetImageItem[] = rawHistory.map((item: any, index: number) => ({
    id: item.id || `img_${Date.now()}_${index}`,
    url: item.url,
    isSelected: Boolean(item.isSelected),
    createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now() - (rawHistory.length - index) * 1000,
    name: item.name ?? subject?.name ?? '',
    description: item.description ?? subject?.description ?? '',
    reference_image: item.reference_image ?? subject?.reference_image ?? '',
    voice_description: item.voice_description ?? subject?.voice_description ?? '',
    voice_audio: item.voice_audio ?? subject?.voice_audio ?? '',
    video: item.video ?? subject?.video ?? ''
  }));

  if (!history.length && subject?.image) {
    history.push(createImageHistoryItem(subject.image, {
      name: subject?.name ?? '',
      description: subject?.description ?? '',
      reference_image: subject?.reference_image ?? '',
      voice_description: subject?.voice_description ?? '',
      voice_audio: subject?.voice_audio ?? '',
      video: subject?.video ?? ''
    }));
  }

  if (!history.length) {
    return {
      ...subject,
      imageHistory: [] as AssetImageItem[],
      selectedImageId: ''
    };
  }

  const selectedById = history.find(item => item.id === subject?.selectedImageId);
  const selectedItem = selectedById || history.find(item => item.isSelected) || history[history.length - 1];

  const normalizedHistory = history.map(item => ({
    ...item,
    isSelected: item.id === selectedItem.id
  }));

  return {
    ...subject,
    name: selectedItem.name ?? subject?.name ?? '',
    description: selectedItem.description ?? subject?.description ?? '',
    reference_image: selectedItem.reference_image ?? subject?.reference_image ?? '',
    voice_description: selectedItem.voice_description ?? subject?.voice_description ?? '',
    voice_audio: selectedItem.voice_audio ?? subject?.voice_audio ?? '',
    video: selectedItem.video ?? subject?.video ?? '',
    image: selectedItem.url,
    selectedImageId: selectedItem.id,
    imageHistory: normalizedHistory
  };
};

const localSubject = ref<any>({
  id: '',
  name: '',
  description: '',
  voice_description: '',
  voice_audio: '',
  video: '',
  type: 'character',
  image: '',
  reference_image: '',
  imageHistory: [] as AssetImageItem[],
  selectedImageId: '',
  appeared_episodes: []
});

const isGeneratingImage = ref(false);
const isPolishingText = ref(false);
const isPolishingVoice = ref(false);
const videoPreviewVisible = ref(false);
const videoPreviewUrl = ref('');
const parentSelectedImageId = ref('');

// 监听弹窗打开状态，重置父级选中的 ID 记录
watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      parentSelectedImageId.value = '';
    }
  }
);

const openVideoPreview = (url: string) => {
  videoPreviewUrl.value = url;
  videoPreviewVisible.value = true;
};

const type = computed(() => localSubject.value.type);
const typeLabel = computed(() => {
  if (type.value === 'character') return '角色';
  if (type.value === 'scene') return '场景';
  if (type.value === 'storyboard') return '分镜';
  return '道具';
});
const title = computed(() => {
  if (type.value === 'character') return '角色历史管理';
  if (type.value === 'scene') return '场景历史管理';
  if (type.value === 'storyboard') return '分镜视频历史管理';
  return '道具历史管理';
});

const previewSrcList = computed(() =>
  (localSubject.value.imageHistory || [])
    .map((item: AssetImageItem) => item.url)
    .filter((url: string) => !!url)
);

const previewInitialIndex = computed(() => {
  const selectedId = localSubject.value.selectedImageId;
  if (!selectedId) return 0;
  const selectedItem = (localSubject.value.imageHistory || []).find((item: AssetImageItem) => item.id === selectedId);
  const selectedUrl = selectedItem?.url;
  if (!selectedUrl) return 0;
  const idx = previewSrcList.value.findIndex((url: string) => url === selectedUrl);
  return idx >= 0 ? idx : 0;
});

const isImageReachable = (url: string, timeoutMs = 8000) =>
  new Promise<boolean>((resolve) => {
    if (!url) return resolve(false);
    let done = false;
    const img = new Image();
    const timer = window.setTimeout(() => {
      if (done) return;
      done = true;
      resolve(false);
    }, timeoutMs);
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      resolve(ok);
    };
    img.onload = () => finish(true);
    img.onerror = () => finish(false);
    img.referrerPolicy = 'no-referrer';
    img.src = url;
  });

const pickFirstReachableImage = async (urls: string[]) => {
  for (const url of urls) {
    if (await isImageReachable(url)) return url;
  }
  return urls.find(Boolean) || '';
};

const syncPageToSelected = () => {
  const selectedIndex = localSubject.value.imageHistory.findIndex((item: AssetImageItem) => item.isSelected);
  if (selectedIndex < 0) {
    imageHistoryPage.value = 1;
    return;
  }
  imageHistoryPage.value = Math.floor(selectedIndex / pageSize) + 1;
};

const pagedImageHistory = computed(() => {
  const start = (imageHistoryPage.value - 1) * pageSize;
  return localSubject.value.imageHistory.slice(start, start + pageSize);
});

const selectedImageMeta = computed(() => {
  const current = localSubject.value.imageHistory.find((item: AssetImageItem) => item.isSelected);
  return current ? formatHistoryTime(current.createdAt) : '未选择';
});

const isSyncingFromHistory = ref(false);

const syncFieldsFromSelectedHistory = () => {
  const selected = localSubject.value.imageHistory.find((item: AssetImageItem) => item.id === localSubject.value.selectedImageId);
  if (!selected) return;
  isSyncingFromHistory.value = true;
  localSubject.value.name = selected.name ?? localSubject.value.name ?? '';
  localSubject.value.description = selected.description ?? localSubject.value.description ?? '';
  localSubject.value.reference_image = selected.reference_image ?? localSubject.value.reference_image ?? '';
  localSubject.value.voice_description = selected.voice_description ?? localSubject.value.voice_description ?? '';
  localSubject.value.voice_audio = selected.voice_audio ?? localSubject.value.voice_audio ?? '';
  localSubject.value.video = selected.video ?? localSubject.value.video ?? '';
  isSyncingFromHistory.value = false;
};

const syncSelectedHistoryFromFields = () => {
  if (isSyncingFromHistory.value) return;
  const selectedId = localSubject.value.selectedImageId;
  if (!selectedId) return;
  localSubject.value.imageHistory = localSubject.value.imageHistory.map((item: AssetImageItem) => {
    if (item.id !== selectedId) return item;
    return {
      ...item,
      name: localSubject.value.name ?? '',
      description: localSubject.value.description ?? '',
      reference_image: localSubject.value.reference_image ?? '',
      voice_description: localSubject.value.voice_description ?? '',
      voice_audio: localSubject.value.voice_audio ?? '',
      video: localSubject.value.video ?? ''
    };
  });
};

watch(
  () => props.subject,
  (newVal) => {
    if (!newVal) return;
    const normalized = normalizeImageHistory({
      ...newVal,
      name: newVal.name || '',
      description: newVal.description || '',
      type: newVal.type || 'character',
      voice_description: newVal.voice_description || (newVal.type === 'character' ? '沉稳大气，富有磁性' : ''),
      voice_audio: newVal.voice_audio || '',
      video: newVal.video || '',
      image: newVal.image || '',
      reference_image: newVal.reference_image || '',
      appeared_episodes: newVal.appeared_episodes && newVal.appeared_episodes.length > 0 ? newVal.appeared_episodes : [1]
    });

    localSubject.value = normalized;
    if (!parentSelectedImageId.value) {
      parentSelectedImageId.value = normalized.selectedImageId;
    }
    syncPageToSelected();
    syncFieldsFromSelectedHistory();
  },
  { immediate: true, deep: true }
);

const applySelectedImage = (imageId: string) => {
  const target = localSubject.value.imageHistory.find((item: AssetImageItem) => item.id === imageId);
  if (!target) return;

  localSubject.value.imageHistory = localSubject.value.imageHistory.map((item: AssetImageItem) => ({
    ...item,
    isSelected: item.id === imageId
  }));
  localSubject.value.selectedImageId = imageId;
  localSubject.value.image = target.url;
  localSubject.value.video = target.video;
  syncFieldsFromSelectedHistory();
};

const deleteHistoricalItem = async (imageId: string) => {
  if (localSubject.value.imageHistory.length <= 1) {
    return ElMessage.warning('至少保留一条历史记录');
  }

  if (imageId === localSubject.value.selectedImageId) {
    return ElMessage.warning('不能删除当前正在使用的项目');
  }

  try {
    await ElMessageBox.confirm('确定要删除这个历史记录吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    const index = localSubject.value.imageHistory.findIndex((item: AssetImageItem) => item.id === imageId);
    if (index === -1) return;

    localSubject.value.imageHistory.splice(index, 1);
    ElMessage.success('历史记录已删除');

  } catch (error) {
    // 用户取消了删除操作
    ElMessage.info('已取消删除');
  }
};

const cloneHistoricalItem = () => {
  const selected = localSubject.value.imageHistory.find((item: AssetImageItem) => item.id === localSubject.value.selectedImageId);
  if (!selected) return;

  // 克隆时不复制图片 URL
  const newItem = createImageHistoryItem('', {
    name: selected.name,
    description: selected.description,
    reference_image: selected.reference_image,
    voice_description: selected.voice_description,
    voice_audio: selected.voice_audio,
    video: ''
  });

  localSubject.value.imageHistory = [
    ...localSubject.value.imageHistory.map((item: AssetImageItem) => ({ ...item, isSelected: false })),
    newItem
  ];
  localSubject.value.selectedImageId = newItem.id;
  localSubject.value.image = '';
  localSubject.value.video = '';
  syncFieldsFromSelectedHistory();
  imageHistoryPage.value = Math.ceil(localSubject.value.imageHistory.length / pageSize);
  ElMessage.success('已克隆当前项（请重新生成图片）');
};

const appendHistoryImage = (url: string) => {
  const nextItem = createImageHistoryItem(url, {
    name: localSubject.value.name ?? '',
    description: localSubject.value.description ?? '',
    reference_image: localSubject.value.reference_image ?? '',
    voice_description: localSubject.value.voice_description ?? '',
    voice_audio: localSubject.value.voice_audio ?? '',
    video: localSubject.value.video ?? ''
  });
  localSubject.value.imageHistory = [
    ...localSubject.value.imageHistory.map((item: AssetImageItem) => ({ ...item, isSelected: false })),
    nextItem
  ];
  localSubject.value.selectedImageId = nextItem.id;
  localSubject.value.image = nextItem.url;
  imageHistoryPage.value = Math.ceil(localSubject.value.imageHistory.length / pageSize);
};

const videoKeySuffix = ref(0);

const generateImage = async () => {
  if (!localSubject.value.description) {
    return ElMessage.warning('请先输入描述，以便 AI 生成更准确的图片');
  }

  isGeneratingImage.value = true;
  try {
    const isStoryboard = type.value === 'storyboard';
    const prompt = `${typeLabel.value} ${localSubject.value.name}, ${localSubject.value.description}, realistic, high quality`;
    
    // 如果是分镜，生成视频；否则生成图片
    const resultUrl = await generateImageAPI(prompt, isStoryboard ? 'video' : 'image');
    
    // 对于分镜，我们需要一个额外的图片作为缩略图预览
    let thumbnailUrl = resultUrl;
    if (isStoryboard) {
      // 随机获取一张图片作为视频的封面图
      thumbnailUrl = `https://picsum.photos/seed/${Date.now()}/1280/720`;
    }

    // 只生成当前的图片：更新当前选中的历史项 URL
    const selectedId = localSubject.value.selectedImageId;
    if (selectedId) {
      localSubject.value.imageHistory = localSubject.value.imageHistory.map((item: AssetImageItem) => {
        if (item.id !== selectedId) return item;
        const updates: any = { ...item, url: thumbnailUrl };
        if (isStoryboard) {
          updates.video = resultUrl;
        } else {
          updates.video = '';
        }
        return updates;
      });
      
      localSubject.value.image = thumbnailUrl;
      if (isStoryboard) {
        localSubject.value.video = resultUrl;
        videoKeySuffix.value++; // 强制刷新视频播放器
      } else {
        localSubject.value.video = '';
      }
    } else {
      const nextItem = createImageHistoryItem(thumbnailUrl, {
        name: localSubject.value.name ?? '',
        description: localSubject.value.description ?? '',
        reference_image: localSubject.value.reference_image ?? '',
        voice_description: localSubject.value.voice_description ?? '',
        voice_audio: localSubject.value.voice_audio ?? '',
        video: isStoryboard ? resultUrl : ''
      });
      localSubject.value.imageHistory = [
        ...localSubject.value.imageHistory.map((item: AssetImageItem) => ({ ...item, isSelected: false })),
        nextItem
      ];
      localSubject.value.selectedImageId = nextItem.id;
      localSubject.value.image = nextItem.url;
      localSubject.value.video = nextItem.video;
      imageHistoryPage.value = Math.ceil(localSubject.value.imageHistory.length / pageSize);
    }

    if (localSubject.value.reference_image) {
      ElMessage.success('已结合参考图重新生成');
    } else {
      ElMessage.success(`已生成新${isStoryboard ? '视频' : '图片'}`);
    }
  } catch (error) {
    ElMessage.error(`${typeLabel.value}生成失败，请稍后重试`);
  } finally {
    isGeneratingImage.value = false;
  }
};

const polishText = async () => {
  if (!localSubject.value.description) return;

  isPolishingText.value = true;
  try {
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
  const nextUrl = URL.createObjectURL(file.raw);
  appendHistoryImage(nextUrl);
  ElMessage.success('预览图更新成功');
};

const handleReferenceImageUpload = (file: any) => {
  localSubject.value.reference_image = URL.createObjectURL(file.raw);
  syncSelectedHistoryFromFields();
  ElMessage.success('参考图上传成功');
};

const handleVoiceDescriptionInput = () => {
  if (localSubject.value.voice_description) {
    localSubject.value.voice_audio = '';
  }
  syncSelectedHistoryFromFields();
};

const formatHistoryTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}`;
};

watch(
  () => [
    localSubject.value.name, 
    localSubject.value.description, 
    localSubject.value.reference_image, 
    localSubject.value.voice_description, 
    localSubject.value.voice_audio,
    localSubject.value.video
  ],
  () => {
    syncSelectedHistoryFromFields();
  }
);

const handleExplicitSave = () => {
  if (!localSubject.value.name) {
    return ElMessage.warning('名称不能为空');
  }
  
  // 确保当前编辑的信息已同步到历史记录中
  syncSelectedHistoryFromFields();
  
  ElMessage({
    message: '当前编辑信息已保存',
    type: 'success',
    duration: 2000,
    customClass: 'modern-message-success'
  });
};

const handleSave = () => {
  const normalized = normalizeImageHistory(localSubject.value);
  emit('save', { ...normalized });
  visible.value = false;
};
</script>

<style>
.custom-subject-dialog {
  border-radius: 24px !important;
  padding: 16px !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid transparent !important;
  transition: all 0.3s ease;
  height: 85vh !important;
  max-height: 820px !important;
  min-height: 500px !important;
  display: flex;
  flex-direction: column;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  top: 0 !important;
}

.custom-history-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-history-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-history-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.2);
  border-radius: 10px;
}

.custom-history-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.4);
}

.dark .custom-history-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.1);
}

.dark .custom-history-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.2);
}

.dark .custom-subject-dialog {
  background-color: #1e293b !important; /* slate-800 */
  border: 1px solid #334155 !important; /* slate-700 */
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) !important;
}

.custom-subject-dialog .el-dialog__header {
  display: none;
}

.custom-subject-dialog .el-dialog__body {
  padding: 0 !important;
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.subject-dialog-shell {
  flex: 1;
  min-height: 0;
}

.custom-subject-dialog .el-dialog__footer {
  padding: 16px 0 0 0 !important;
  background-color: transparent !important;
}

.modern-message-success {
  border-radius: 16px !important;
  padding: 12px 24px !important;
  background: #10b981 !important;
  border: none !important;
}

.modern-message-success .el-message__content {
  color: white !important;
  font-weight: 900 !important;
}

.modern-message-success .el-message__icon {
  color: white !important;
}

.dark .custom-subject-dialog .el-dialog__footer {
  border-top-color: #334155 !important;
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

.video-preview-dialog {
  background: transparent !important;
  box-shadow: none !important;
}

.video-preview-dialog .el-dialog__header {
  display: block !important;
  padding: 0 !important;
}

.video-preview-dialog .el-dialog__body {
  padding: 0 !important;
}

.video-preview-dialog .el-dialog__headerbtn {
  top: -40px !important;
  right: -40px !important;
  width: 40px !important;
  height: 40px !important;
  background: rgba(255, 255, 255, 0.2) !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.video-preview-dialog .el-dialog__headerbtn .el-dialog__close {
  color: white !important;
  font-size: 20px !important;
}
</style>
