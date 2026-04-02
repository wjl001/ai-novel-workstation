<template>
  <el-dialog
    v-model="visible"
    title="编辑脚本"
    width="1000px"
    class="script-editor-dialog"
    destroy-on-close
    :show-close="false"
    append-to-body
  >
    <template #header>
      <div class="flex justify-between items-center w-full pr-8">
        <div class="flex items-center gap-4">
          <h2 class="text-[18px] font-bold text-slate-900">编辑脚本 - 片段 {{ sceneIndex + 1 }}</h2>
          <div class="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[12px] font-medium">
            时长: {{ scene?.duration || 5.0 }}s
          </div>
          <div v-if="isSaving" class="text-[12px] text-slate-400 flex items-center gap-1">
            <el-icon class="animate-spin"><Loading /></el-icon>
            自动保存中...
          </div>
          <div v-else class="text-[12px] text-slate-400">
            已保存 ({{ lastSavedTime }})
          </div>
        </div>
        <div class="flex items-center gap-2">
          <el-button-group size="small">
            <el-button :icon="ArrowLeft" @click="editor?.chain().focus().undo().run()" :disabled="!editor?.can().undo()">撤销</el-button>
            <el-button :icon="ArrowRight" @click="editor?.chain().focus().redo().run()" :disabled="!editor?.can().redo()">重做</el-button>
          </el-button-group>
          <el-divider direction="vertical" />
          <el-button link :icon="Search" size="small" @click="showFindReplace = !showFindReplace">查找</el-button>
          <el-button link :icon="Brush" size="small">格式刷</el-button>
          <el-button circle :icon="Close" size="small" @click="handleClose" />
        </div>
      </div>
    </template>

    <div class="flex h-[600px] gap-6 overflow-hidden">
      <!-- Left: Editor Area -->
      <div class="flex-1 flex flex-col gap-4 overflow-hidden">
        <!-- Toolbar -->
        <div class="flex items-center gap-1 p-1 bg-slate-50 rounded-lg border border-slate-100 overflow-x-auto shrink-0">
          <el-button-group size="small">
            <el-button @click="editor?.chain().focus().toggleBold().run()" :class="{ 'is-active': editor?.isActive('bold') }">B</el-button>
            <el-button @click="editor?.chain().focus().toggleItalic().run()" :class="{ 'is-active': editor?.isActive('italic') }">I</el-button>
          </el-button-group>
          <el-divider direction="vertical" />
          <el-select v-model="currentLanguage" size="small" style="width: 100px">
            <el-option label="中文 (简体)" value="zh-CN" />
            <el-option label="English" value="en-US" />
            <el-option label="日本語" value="ja-JP" />
          </el-select>
        </div>

        <!-- Find & Replace -->
        <div v-if="showFindReplace" class="p-3 bg-slate-50 rounded-lg border border-slate-100 flex gap-3 shrink-0">
          <el-input v-model="findText" placeholder="查找..." size="small" class="flex-1" />
          <el-input v-model="replaceText" placeholder="替换为..." size="small" class="flex-1" />
          <el-button type="primary" size="small" @click="handleReplace">全部替换</el-button>
        </div>

        <!-- Editor Container -->
        <div class="flex-1 relative bg-[#f8fafc] rounded-xl border border-slate-100 p-4 overflow-hidden flex flex-col">
          <editor-content :editor="editor" class="flex-1 overflow-y-auto custom-scrollbar script-tiptap-editor" />
          
          <!-- @ Mention Popup -->
          <transition name="el-zoom-in-top">
            <div 
              v-if="showMentionMenu" 
              ref="mentionMenuRef"
              class="absolute z-[3000] bg-white rounded-xl shadow-2xl border border-slate-100 p-2 min-w-[200px]"
              :style="mentionMenuStyle"
            >
              <div class="px-3 py-2 text-[12px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 mb-1">
                智能建议
              </div>
              <div class="max-h-[300px] overflow-y-auto custom-scrollbar">
                <div 
                  v-for="(item, idx) in mentionItems" 
                  :key="idx"
                  class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-indigo-50 cursor-pointer transition-colors group"
                  @click="insertMention(item)"
                >
                  <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                    <img v-if="item.image" :src="item.image" class="w-full h-full object-cover" />
                    <el-icon v-else class="text-slate-400"><component :is="item.icon" /></el-icon>
                  </div>
                  <div class="flex flex-col min-w-0">
                    <span class="text-[13px] font-medium text-slate-700 truncate">{{ item.name }}</span>
                    <span class="text-[11px] text-slate-400 truncate">{{ item.desc }}</span>
                  </div>
                  <div class="ml-auto opacity-0 group-hover:opacity-100 text-indigo-400">
                    <el-icon><Select /></el-icon>
                  </div>
                </div>
              </div>
            </div>
          </transition>

          <!-- Guide Line -->
          <div class="mt-4 p-3 bg-white/60 rounded-lg border border-indigo-50 flex items-start gap-2">
            <el-icon class="text-indigo-400 mt-0.5"><InfoFilled /></el-icon>
            <div class="text-[12px] text-slate-500 leading-relaxed">
              输入 <span class="px-1 py-0.5 bg-indigo-50 text-indigo-600 rounded font-bold">@</span> 引用主体库内容，或通过快捷菜单调整参数。
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Preview Area -->
      <div class="w-[320px] flex flex-col gap-4 shrink-0">
        <div class="aspect-[16/9] rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative shadow-sm group">
          <img v-if="scene?.image" :src="scene.image" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
            <el-icon size="32"><Picture /></el-icon>
            <span class="text-[12px]">预览图待生成</span>
          </div>
          <div class="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/60 backdrop-blur-sm text-white text-[11px]">
            实时预览
          </div>
        </div>

        <div class="flex-1 bg-white rounded-xl border border-slate-100 p-4 flex flex-col gap-3 overflow-hidden">
          <h3 class="text-[14px] font-bold text-slate-800 flex items-center gap-2">
            <el-icon class="text-indigo-500"><MagicStick /></el-icon>
            预览渲染 (Preview)
          </h3>
          <div class="flex-1 bg-slate-50 rounded-lg p-3 text-[13px] text-slate-600 leading-relaxed overflow-y-auto custom-scrollbar italic">
            {{ editor?.getText() || '输入脚本内容以查看渲染效果...' }}
          </div>
          <div class="flex justify-between items-center text-[11px] text-slate-400 px-1">
            <span>字数统计: {{ editor?.storage.characterCount.characters() || 0 }}</span>
            <span>当前语言: {{ currentLanguage }}</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3 px-2 pt-4 border-t border-slate-50">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" class="!px-8 bg-slate-900 border-none hover:!bg-black" @click="handleSave">保存修改</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed, nextTick } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import CharacterCount from '@tiptap/extension-character-count';
import { 
  Close, ArrowLeft, ArrowRight, Search, Brush, MagicStick, 
  Picture, InfoFilled, Loading, Select, User, Location, Box, Timer 
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const props = defineProps<{
  modelValue: boolean;
  scene: any;
  sceneIndex: number;
  subjects: any[];
  canEdit?: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'save']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const isSaving = ref(false);
const lastSavedTime = ref(new Date().toLocaleTimeString());
const showFindReplace = ref(false);
const findText = ref('');
const replaceText = ref('');
const currentLanguage = ref('zh-CN');

// Mention Menu Logic
const showMentionMenu = ref(false);
const mentionMenuRef = ref<HTMLElement | null>(null);
const mentionMenuStyle = ref({ top: '0px', left: '0px' });
const mentionItems = computed(() => {
  const items = [
    { name: '调整时长', desc: '快速修改当前分镜时长', icon: Timer, type: 'duration' },
    ...props.subjects.map(s => ({
      name: s.name,
      desc: s.description?.slice(0, 20) + '...',
      image: s.image,
      icon: s.type === 'character' ? User : s.type === 'scene' ? Location : Box,
      type: s.type
    }))
  ];
  return items;
});

const editor = useEditor({
  content: props.scene?.script || '',
  extensions: [
    StarterKit,
    CharacterCount,
  ],
  onUpdate: ({ editor }) => {
    // 检查光标前是否有 @ 符号
    const { state } = editor;
    const { selection } = state;
    const { from } = selection;
    const textBefore = state.doc.textBetween(Math.max(0, from - 20), from, '\n');
    const match = /@([^@\s]*)$/.exec(textBefore);

    if (match) {
      showMentionMenu.value = true;
      mentionSearch.value = match[1];
      
      // 更新位置
      const view = editor.view;
      const coords = view.coordsAtPos(from);
      const container = view.dom.closest('.relative');
      if (container) {
        const rect = container.getBoundingClientRect();
        mentionMenuStyle.value = {
          top: `${coords.bottom - rect.top + 5}px`,
          left: `${coords.left - rect.left}px`
        };
      }
    } else {
      showMentionMenu.value = false;
    }
    
    // Auto-save simulation
    triggerAutoSave();
  },
  editorProps: {
    attributes: {
      class: 'prose prose-sm focus:outline-none max-w-none h-full',
    },
    handleKeyDown: (view, event) => {
      if (showMentionMenu.value) {
        if (event.key === 'Escape') {
          showMentionMenu.value = false;
          return true;
        }
      }
      return false;
    }
  }
});

const triggerAutoSave = () => {
  isSaving.value = true;
  setTimeout(() => {
    isSaving.value = false;
    lastSavedTime.value = new Date().toLocaleTimeString();
    // In a real app, we would emit a partial update here
  }, 1000);
};

const insertMention = (item: any) => {
  if (!editor.value) return;
  
  const label = item.type === 'duration' ? ' [5.0s] ' : ` @${item.name} `;
  editor.value.chain().focus().insertContent(label).run();
  showMentionMenu.value = false;
};

const handleReplace = () => {
  if (!findText.value) return;
  const content = editor.value?.getHTML() || '';
  const newContent = content.replaceAll(findText.value, replaceText.value);
  editor.value?.commands.setContent(newContent);
  ElMessage.success('替换完成');
};

const handleSave = () => {
  if (props.canEdit === false) {
    return ElMessage.error('您没有权限编辑此脚本');
  }
  emit('save', {
    index: props.sceneIndex,
    script: editor.value?.getText(),
    html: editor.value?.getHTML()
  });
  visible.value = false;
};

const handleClose = () => {
  visible.value = false;
};

// Handle clicks outside mention menu
const handleClickOutside = (event: MouseEvent) => {
  if (mentionMenuRef.value && !mentionMenuRef.value.contains(event.target as Node)) {
    showMentionMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside);
  editor.value?.destroy();
});

watch(() => props.scene, (newScene) => {
  if (newScene && editor.value && editor.value.getText() !== newScene.script) {
    editor.value.commands.setContent(newScene.script || '');
  }
}, { deep: true });
</script>

<style>
.script-editor-dialog .el-dialog {
  border-radius: 24px !important;
  overflow: hidden;
}

.script-editor-dialog .el-dialog__header {
  padding: 20px 24px !important;
  margin-right: 0 !important;
  border-bottom: 1px solid #f1f5f9;
}

.script-editor-dialog .el-dialog__body {
  padding: 24px !important;
}

.script-tiptap-editor .ProseMirror {
  min-height: 200px;
  outline: none;
}

.script-tiptap-editor .ProseMirror p {
  margin-bottom: 0.5em;
  color: #475569;
  line-height: 1.8;
}

.script-tiptap-editor .ProseMirror strong {
  color: #1e293b;
}

.is-active {
  background-color: #e0e7ff !important;
  color: #4f46e5 !important;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
