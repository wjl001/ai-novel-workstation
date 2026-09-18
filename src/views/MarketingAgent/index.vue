<template>
  <div class="marketing-agent h-screen flex flex-col bg-slate-50 overflow-hidden">
    <!-- 顶部栏 -->
    <header class="flex-shrink-0 flex items-center justify-between px-6 py-3 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm z-20">
      <div class="flex items-center gap-3">
        <button @click="router.push('/home')" class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-all">
          <el-icon :size="18"><ArrowLeft /></el-icon>
        </button>
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
          <span class="text-white text-lg">🎯</span>
        </div>
        <div>
          <h1 class="text-lg font-black text-slate-800 leading-tight">营销 Agent</h1>
          <p class="text-[10px] text-slate-400">一句话生成爆款营销脚本 · 多风格并行 · 多平台适配</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="store.newProject()"
          class="px-4 py-2 rounded-xl bg-white text-slate-600 text-xs font-bold border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center gap-1.5"
        >
          <el-icon :size="14"><Plus /></el-icon>
          新建项目
        </button>
        <button
          v-if="store.scripts.length > 0"
          @click="store.saveCurrentProject()"
          class="px-4 py-2 rounded-xl bg-white text-slate-600 text-xs font-bold border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center gap-1.5"
        >
          <el-icon :size="14"><FolderOpened /></el-icon>
          保存项目
        </button>
        <button
          v-if="store.selectedScripts.length > 0"
          @click="exportSelected"
          class="px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/30"
        >
          <el-icon :size="14"><Download /></el-icon>
          导出选中 ({{ store.selectedScripts.length }})
        </button>
      </div>
    </header>

    <!-- 主体 -->
    <div class="flex-1 flex overflow-hidden">
      <!-- 左侧步骤导航 -->
      <aside class="w-56 flex-shrink-0 bg-white border-r border-slate-200/50 flex flex-col">
        <div class="p-4 space-y-1">
          <button
            v-for="step in steps"
            :key="step.id"
            @click="store.setActiveTab(step.id)"
            :class="['w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all',
              store.activeTab === step.id
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/30'
                : 'text-slate-600 hover:bg-slate-50']"
          >
            <span :class="['w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0',
              store.activeTab === step.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500']">
              {{ step.icon }}
            </span>
            <div class="flex-1 min-w-0">
              <div class="text-xs font-bold">{{ step.label }}</div>
              <div :class="['text-[9px]', store.activeTab === step.id ? 'text-white/70' : 'text-slate-400']">
                {{ step.desc }}
              </div>
            </div>
            <el-icon v-if="step.id === 'result' && store.scripts.length" :size="12" :class="store.activeTab === step.id ? 'text-white' : 'text-emerald-500'">
              <CircleCheckFilled />
            </el-icon>
          </button>
        </div>

        <!-- 快捷信息 -->
        <div class="mt-auto p-4 border-t border-slate-100">
          <div class="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
            <div class="text-[10px] font-bold text-indigo-600 mb-1">💡 创作提示</div>
            <p class="text-[10px] text-slate-500 leading-relaxed">
              填写商品信息越详细，生成的脚本越精准。建议至少填写3个核心卖点。
            </p>
          </div>
        </div>
      </aside>

      <!-- 主内容区 -->
      <main class="flex-1 overflow-y-auto p-6">
        <div class="max-w-5xl mx-auto">
          <!-- 步骤1：商品信息 -->
          <div v-show="store.activeTab === 'input'">
            <div class="mb-5">
              <h2 class="text-xl font-black text-slate-800 mb-1">📦 商品信息</h2>
              <p class="text-xs text-slate-400">填写要推广的商品信息，AI将基于此生成营销脚本</p>
            </div>
            <div class="bg-white rounded-2xl border border-slate-200/50 shadow-sm p-6">
              <ProductInputPanel :product="store.product" @update="handleProductUpdate" />
            </div>
            <div class="mt-5 flex justify-end">
              <button
                @click="store.setActiveTab('hooks')"
                :disabled="!store.isProductReady"
                :class="['px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2',
                  store.isProductReady
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:-translate-y-0.5'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed']"
              >
                下一步：选择开场钩子
                <el-icon :size="16"><ArrowRight /></el-icon>
              </button>
            </div>
          </div>

          <!-- 步骤2：Hook库 -->
          <div v-show="store.activeTab === 'hooks'">
            <div class="mb-5">
              <h2 class="text-xl font-black text-slate-800 mb-1">🎣 爆款 Hook 库</h2>
              <p class="text-xs text-slate-400">选择一个开场钩子，或自定义你的黄金3秒开场</p>
            </div>
            <div class="bg-white rounded-2xl border border-slate-200/50 shadow-sm p-6">
              <HookLibrary
                :selected-id="store.selectedHookId"
                :custom-hook="store.customHook"
                @select="store.setHook"
                @custom="store.setCustomHook"
              />
            </div>
            <div class="mt-5 flex justify-between">
              <button @click="store.setActiveTab('input')" class="px-5 py-2.5 rounded-xl bg-white text-slate-600 text-sm font-bold border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2">
                <el-icon :size="16"><ArrowLeft /></el-icon>
                上一步
              </button>
              <button @click="store.setActiveTab('templates')" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
                下一步：场景与风格
                <el-icon :size="16"><ArrowRight /></el-icon>
              </button>
            </div>
          </div>

          <!-- 步骤3：配置 -->
          <div v-show="store.activeTab === 'templates'">
            <div class="mb-5">
              <h2 class="text-xl font-black text-slate-800 mb-1">⚙️ 场景 · 风格 · 平台</h2>
              <p class="text-xs text-slate-400">选择营销场景模板、生成风格和目标发布平台</p>
            </div>
            <div class="bg-white rounded-2xl border border-slate-200/50 shadow-sm p-6">
              <ConfigPanel
                :selected-template-id="store.selectedTemplateId"
                :selected-style-ids="store.selectedStyleIds"
                :selected-platform-ids="store.selectedPlatformIds"
                @select-template="store.setTemplate"
                @toggle-style="store.toggleStyle"
                @toggle-platform="store.togglePlatform"
              />
            </div>

            <!-- 生成按钮 -->
            <div class="mt-6 p-5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-xl shadow-purple-500/20">
              <div class="flex items-center justify-between">
                <div class="text-white">
                  <div class="text-sm font-bold mb-0.5">准备就绪，一键生成营销脚本</div>
                  <div class="text-[11px] text-white/80">
                    将生成 {{ store.selectedStyleIds.length }} 种风格 · 适配 {{ store.selectedPlatformIds.length }} 个平台 · {{ store.selectedTemplate?.name || '默认' }}模板
                  </div>
                </div>
                <button
                  @click="handleGenerate"
                  :disabled="store.isGenerating || !store.isProductReady"
                  :class="['px-8 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-2',
                    store.isGenerating
                      ? 'bg-white/20 text-white/70 cursor-wait'
                      : 'bg-white text-indigo-600 hover:bg-white/90 hover:scale-105 shadow-lg']"
                >
                  <el-icon v-if="store.isGenerating" class="animate-spin" :size="18"><Loading /></el-icon>
                  <el-icon v-else :size="18"><MagicStick /></el-icon>
                  {{ store.isGenerating ? `生成中 ${store.generationProgress}%` : '🚀 开始生成' }}
                </button>
              </div>

              <!-- 进度条 -->
              <div v-if="store.isGenerating" class="mt-4">
                <div class="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div class="h-full bg-white rounded-full transition-all duration-500" :style="{ width: store.generationProgress + '%' }"></div>
                </div>
                <p class="text-[10px] text-white/80 mt-1.5">{{ generatingStatus }}</p>
              </div>
            </div>
          </div>

          <!-- 步骤4：生成结果 -->
          <div v-show="store.activeTab === 'result'">
            <div class="mb-5 flex items-center justify-between">
              <div>
                <h2 class="text-xl font-black text-slate-800 mb-1">✨ 生成结果</h2>
                <p class="text-xs text-slate-400">共 {{ store.scripts.length }} 个营销方案，可选择后导出或继续生成</p>
              </div>
              <div v-if="store.scripts.length" class="flex items-center gap-2">
                <button @click="store.selectAllScripts()" class="px-3 py-1.5 rounded-lg bg-white text-slate-600 text-xs font-bold border border-slate-200 hover:bg-slate-50 transition-all">
                  全选
                </button>
                <button @click="store.deselectAllScripts()" class="px-3 py-1.5 rounded-lg bg-white text-slate-600 text-xs font-bold border border-slate-200 hover:bg-slate-50 transition-all">
                  取消全选
                </button>
                <button @click="handleGenerate" class="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold border border-indigo-100 hover:bg-indigo-100 transition-all flex items-center gap-1">
                  <el-icon :size="12"><Refresh /></el-icon>
                  重新生成
                </button>
              </div>
            </div>

            <div v-if="store.scripts.length === 0" class="text-center py-20 bg-white rounded-2xl border border-slate-200/50">
              <div class="text-5xl mb-4">🎬</div>
              <p class="text-sm text-slate-400 mb-2">还没有生成的营销脚本</p>
              <button @click="store.setActiveTab('templates')" class="px-5 py-2 rounded-xl bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-600 transition-all">
                去配置并生成
              </button>
            </div>

            <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ScriptCard
                v-for="script in store.scripts"
                :key="script.id"
                :script="script"
                :show-storyboard="store.showStoryboardFor === script.id"
                @toggle-select="store.toggleScriptSelect"
                @toggle-storyboard="store.setShowStoryboard"
                @copy="handleCopy"
                @export="handleExport"
                @regenerate="handleRegenerate"
                @delete="store.deleteScript"
              />
            </div>
          </div>

          <!-- 步骤5：历史 -->
          <div v-show="store.activeTab === 'history'">
            <div class="mb-5">
              <h2 class="text-xl font-black text-slate-800 mb-1">📂 历史项目</h2>
              <p class="text-xs text-slate-400">查看和管理已保存的营销项目</p>
            </div>
            <div class="bg-white rounded-2xl border border-slate-200/50 shadow-sm p-6">
              <HistoryPanel
                :projects="store.projects"
                @load="handleLoadProject"
                @delete="handleDeleteProject"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  ArrowLeft, ArrowRight, Plus, FolderOpened, Download, MagicStick,
  Loading, Refresh, CircleCheckFilled
} from '@element-plus/icons-vue';
import { useMarketingStore } from '../../store/marketing';
import { generateMarketingScripts, exportScriptAsText, exportAllScripts } from './utils/scriptGenerator';
import { SCRIPT_STYLES } from './data/styles';
import type { ProductInfo, MarketingScript } from '../../store/marketing';
import ProductInputPanel from './components/ProductInputPanel.vue';
import HookLibrary from './components/HookLibrary.vue';
import ConfigPanel from './components/ConfigPanel.vue';
import ScriptCard from './components/ScriptCard.vue';
import HistoryPanel from './components/HistoryPanel.vue';

const router = useRouter();
const store = useMarketingStore();

const generatingStatus = ref('');

const steps = [
  { id: 'input' as const, label: '商品信息', desc: '填写推广商品', icon: '📦' },
  { id: 'hooks' as const, label: '开场钩子', desc: '黄金3秒', icon: '🎣' },
  { id: 'templates' as const, label: '场景配置', desc: '风格与平台', icon: '⚙️' },
  { id: 'result' as const, label: '生成结果', desc: '脚本与分镜', icon: '✨' },
  { id: 'history' as const, label: '历史项目', desc: '项目管理', icon: '📂' }
];

onMounted(() => {
  store.restore();
});

function handleProductUpdate(product: ProductInfo) {
  Object.assign(store.product, product);
}

async function handleGenerate() {
  if (!store.isProductReady) {
    ElMessage.warning('请先填写商品名称和至少一个核心卖点');
    store.setActiveTab('input');
    return;
  }

  store.setGenerating(true);
  store.setActiveTab('result');
  generatingStatus.value = 'AI正在分析商品信息...';

  try {
    const styles = SCRIPT_STYLES.filter(s => store.selectedStyleIds.includes(s.id));
    const template = store.selectedTemplate!;
    const platforms = store.selectedPlatforms;
    const hook = store.selectedHook;

    const results = await generateMarketingScripts(
      store.product,
      styles,
      template,
      platforms,
      hook,
      store.customHook,
      (current, total, styleName) => {
        store.setProgress(Math.round((current / total) * 100));
        generatingStatus.value = `正在生成「${styleName}」风格方案... (${current}/${total})`;
      }
    );

    store.setScripts(results);
    store.setGenerating(false);
    generatingStatus.value = '';
    ElMessage.success(`成功生成 ${results.length} 个营销方案！`);
  } catch (e) {
    console.error(e);
    store.setGenerating(false);
    ElMessage.error('生成失败，请重试');
  }
}

function handleRegenerate(id: string) {
  const script = store.scripts.find(s => s.id === id);
  if (!script) return;
  ElMessage.info(`正在重新生成「${script.styleName}」方案...`);
  // 简化处理：标记为生成中后重新生成单条
  store.updateScript(id, { status: 'generating' });
  setTimeout(() => {
    handleGenerate();
  }, 500);
}

async function handleCopy(script: MarketingScript) {
  const text = exportScriptAsText(script);
  try {
    await navigator.clipboard.writeText(text);
    ElMessage.success('文案已复制到剪贴板');
  } catch {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    ElMessage.success('文案已复制到剪贴板');
  }
}

function handleExport(script: MarketingScript) {
  const text = exportScriptAsText(script);
  downloadText(text, `${script.styleName}_营销脚本.txt`);
  ElMessage.success('脚本已导出');
}

function exportSelected() {
  const selected = store.selectedScripts;
  if (selected.length === 0) {
    ElMessage.warning('请先选择要导出的方案');
    return;
  }
  const text = exportAllScripts(selected);
  downloadText(text, `营销脚本_${selected.length}个方案.txt`);
  ElMessage.success(`已导出 ${selected.length} 个方案`);
}

function downloadText(text: string, filename: string) {
  const blob = new Blob(['\ufeff' + text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function handleLoadProject(id: string) {
  store.loadProject(id);
  ElMessage.success('项目已加载');
}

async function handleDeleteProject(id: string) {
  try {
    await ElMessageBox.confirm('确定要删除这个项目吗？删除后无法恢复。', '确认删除', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    });
    store.deleteProject(id);
    ElMessage.success('项目已删除');
  } catch {
    // cancelled
  }
}
</script>
