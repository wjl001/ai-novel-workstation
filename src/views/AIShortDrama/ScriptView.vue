<template>
  <div class="h-full flex flex-col p-4 bg-gray-50 dark:bg-gray-900">
    <!-- Header Steps -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 shadow-sm flex items-center justify-between border border-slate-100 dark:border-slate-700">
      <div class="flex items-center gap-3 text-gray-600 dark:text-gray-300">
        <button 
          @click="router.back()" 
          class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <el-icon><ArrowLeft /></el-icon>
        </button>
        <span class="font-bold text-[15px] border-r border-slate-200 dark:border-slate-700 pr-4 mr-2">AI剧本</span>
        <span class="text-[11px] bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full text-indigo-600 font-bold mr-4">短剧共创</span>
        <button 
          @click="showPrototypeHelp = true"
          class="flex items-center gap-1.5 px-3 py-1 bg-white text-indigo-600 border border-indigo-200 rounded-full text-[12px] font-bold hover:bg-indigo-50 transition-all shadow-sm"
        >
          <el-icon><InfoFilled /></el-icon>
          原型说明
        </button>
      </div>
      
      <el-steps :active="activeStep" class="flex-1 max-w-2xl mx-auto custom-steps" finish-status="success">
        <el-step title="剧本设定" />
        <el-step title="大纲生成" />
        <el-step title="剧本生成" />
      </el-steps>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex gap-4 min-h-0">
      <!-- Left Sidebar -->
      <div class="w-64 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 overflow-y-auto">
        <div class="space-y-6">
          <div>
            <div class="text-sm font-medium mb-2 flex items-center gap-1">
              <span>题材设定</span>
              <el-icon class="text-gray-400"><QuestionFilled /></el-icon>
            </div>
            <el-select v-model="form.theme" placeholder="请选择题材" class="w-full">
              <el-option label="逆袭神豪" value="逆袭神豪" />
              <el-option label="古装言情" value="古装言情" />
              <el-option label="悬疑推理" value="悬疑推理" />
            </el-select>
          </div>

          <div>
            <div class="text-sm font-medium mb-2 flex items-center gap-1">
              <span>风格倾向</span>
              <el-icon class="text-gray-400"><QuestionFilled /></el-icon>
            </div>
            <el-select v-model="form.style" placeholder="请选择风格" class="w-full">
              <el-option label="男频爽文风" value="男频爽文风" />
              <el-option label="女频甜宠风" value="女频甜宠风" />
            </el-select>
          </div>

          <div>
            <div class="text-sm font-medium mb-2 flex items-center gap-1">
              <span>核心受众</span>
              <el-icon class="text-gray-400"><QuestionFilled /></el-icon>
            </div>
            <el-radio-group v-model="form.audience" size="small" class="w-full grid grid-cols-2 gap-2">
              <el-radio-button label="大众向" class="w-full text-center" />
              <el-radio-button label="男性向" class="w-full text-center" />
              <el-radio-button label="女性向" class="w-full text-center" />
              <el-radio-button label="二次元" class="w-full text-center" />
            </el-radio-group>
          </div>
          
          <div>
            <div class="text-sm font-medium mb-2 flex items-center gap-1">
              <span>剧本模板</span>
              <el-icon class="text-gray-400"><QuestionFilled /></el-icon>
            </div>
            <el-select v-model="form.template" placeholder="请选择模板" class="w-full">
              <el-option label="短剧模板(画面优先)" value="short-video" />
              <el-option label="传统剧本(对话优先)" value="traditional" />
            </el-select>
          </div>

          <div>
            <div class="text-sm font-medium mb-2 flex items-center gap-1">
              <span>标签</span>
              <el-icon class="text-gray-400"><QuestionFilled /></el-icon>
            </div>
            <el-input v-model="form.tags" placeholder="选择标签" />
          </div>

          <div class="flex gap-4">
            <div class="flex-1">
              <div class="text-sm font-medium mb-2">生成集数</div>
              <el-input-number v-model="form.episodes" :min="1" :max="100" class="w-full" controls-position="right" />
            </div>
            <div class="flex-1">
              <div class="text-sm font-medium mb-2">单集时长(秒)</div>
              <el-input-number v-model="form.duration" :min="10" :max="300" class="w-full" controls-position="right" />
            </div>
          </div>
        </div>
      </div>

      <!-- Right Content -->
      <div class="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 overflow-y-auto flex flex-col">
        <div class="space-y-6 flex-1">
          <!-- Title -->
          <div class="flex items-center gap-4 border-b pb-6 dark:border-gray-700">
            <div class="text-sm font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap"><span class="text-red-500 mr-1">*</span>作品名称</div>
            <el-input v-model="form.title" placeholder="请输入作品名称" maxlength="50" show-word-limit class="flex-1 custom-input-large">
              <template #append>
                <button 
                  @click="form.title = '随机生成的大片名字'"
                  class="px-4 h-full bg-slate-50 hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-slate-600 font-bold text-xs"
                >
                  <el-icon><RefreshRight /></el-icon>
                  随机名字
                </button>
              </template>
            </el-input>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <!-- World Setting -->
            <div class="border rounded-2xl p-5 dark:border-gray-700 bg-slate-50/50">
              <div class="flex justify-between items-center mb-3">
                <div class="text-sm font-bold text-slate-800 flex items-center gap-2"><span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> 世界观设定</div>
                <button 
                  @click="form.worldSetting = 'AI 生成的世界观...'"
                  class="flex items-center gap-1 px-3 py-1 bg-white text-indigo-600 border border-indigo-100 rounded-full text-[12px] font-bold hover:bg-indigo-50 transition-all shadow-sm"
                >
                  <el-icon><MagicStick /></el-icon> AI生成
                </button>
              </div>
              <el-input
                v-model="form.worldSetting"
                type="textarea"
                :rows="4"
                placeholder="描述世界观、背景与规则"
                maxlength="300"
                show-word-limit
                class="custom-textarea-round"
              />
            </div>

            <!-- Core Plot -->
            <div class="border rounded-2xl p-5 dark:border-gray-700 bg-slate-50/50">
              <div class="flex justify-between items-center mb-3">
                <div class="text-sm font-bold text-slate-800 flex items-center gap-2"><span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> 核心金手指</div>
                <button 
                  @click="form.coreCheat = 'AI 生成的金手指...'"
                  class="flex items-center gap-1 px-3 py-1 bg-white text-indigo-600 border border-indigo-100 rounded-full text-[12px] font-bold hover:bg-indigo-50 transition-all shadow-sm"
                >
                  <el-icon><MagicStick /></el-icon> AI生成
                </button>
              </div>
              <el-input
                v-model="form.coreCheat"
                type="textarea"
                :rows="4"
                placeholder="描述主角获取的金手指与目标"
                maxlength="200"
                show-word-limit
                class="custom-textarea-round"
              />
            </div>
          </div>

          <!-- Synopsis -->
          <div class="border rounded-2xl p-5 dark:border-gray-700 bg-slate-50/50">
            <div class="flex justify-between items-center mb-3">
              <div class="text-sm font-bold text-slate-800 flex items-center gap-2"><span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span> 作品简介</div>
              <button 
                @click="form.synopsis = 'AI 生成的简介...'"
                class="flex items-center gap-1 px-3 py-1 bg-white text-indigo-600 border border-indigo-100 rounded-full text-[12px] font-bold hover:bg-indigo-50 transition-all shadow-sm"
              >
                <el-icon><MagicStick /></el-icon> AI生成
              </button>
            </div>
            <el-input
              v-model="form.synopsis"
              type="textarea"
              :rows="4"
              placeholder="用一句话概括故事主线"
              maxlength="500"
              show-word-limit
              class="custom-textarea-round"
            />
          </div>

          <div class="grid grid-cols-2 gap-6">
            <!-- Characters -->
            <div class="border rounded-2xl p-5 dark:border-gray-700 bg-slate-50/50">
              <div class="flex justify-between items-center mb-3">
                <div class="text-sm font-bold text-slate-800 flex items-center gap-2"><span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> 角色档案</div>
                <button 
                  @click="form.characters = 'AI 生成的角色...'"
                  class="flex items-center gap-1 px-3 py-1 bg-white text-indigo-600 border border-indigo-100 rounded-full text-[12px] font-bold hover:bg-indigo-50 transition-all shadow-sm"
                >
                  <el-icon><MagicStick /></el-icon> AI生成
                </button>
              </div>
              <el-input
                v-model="form.characters"
                type="textarea"
                :rows="4"
                placeholder="主角配角：性格、动机与关系"
                maxlength="500"
                show-word-limit
                class="custom-textarea-round"
              />
            </div>

            <!-- Direction -->
            <div class="border rounded-2xl p-5 dark:border-gray-700 bg-slate-50/50">
              <div class="flex justify-between items-center mb-3">
                <div class="text-sm font-bold text-slate-800 flex items-center gap-2"><span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span> 剧情要求</div>
                <button 
                  @click="form.direction = 'AI 生成的剧情要求...'"
                  class="flex items-center gap-1 px-3 py-1 bg-white text-indigo-600 border border-indigo-100 rounded-full text-[12px] font-bold hover:bg-indigo-50 transition-all shadow-sm"
                >
                  <el-icon><MagicStick /></el-icon> AI生成
                </button>
              </div>
              <el-input
                v-model="form.direction"
                type="textarea"
                :rows="4"
                placeholder="例如：开头冲突、节奏、禁用套路"
                maxlength="500"
                show-word-limit
                class="custom-textarea-round"
              />
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="mt-6 flex gap-6 pt-6 border-t dark:border-gray-700">
          <div class="flex-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:bg-indigo-100 transition-all border border-indigo-100 group">
            <div class="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
              <el-icon :size="24"><EditPen /></el-icon>
            </div>
            <div>
              <div class="font-bold text-indigo-700 dark:text-indigo-300">基于设定补全</div>
              <div class="text-xs text-indigo-500/80 mt-1">智能分析已有内容，仅填充缺失的空白项</div>
            </div>
          </div>
          
          <div class="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-all group">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                <el-icon :size="24"><Refresh /></el-icon>
              </div>
              <div>
                <div class="font-bold text-slate-700 dark:text-slate-200">从零生成全部</div>
                <div class="text-xs text-slate-400 mt-1">系统将根据题材设定，重构并覆盖所有内容</div>
              </div>
            </div>
          </div>

          <button class="h-16 px-12 bg-indigo-600 text-white rounded-2xl text-lg font-bold shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center leading-tight">
            <span>开始创作</span>
            <span class="text-[11px] font-normal opacity-70 mt-1">生成剧本大纲</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Prototype Explanation Drawer -->
    <el-drawer
      v-model="showPrototypeHelp"
      title="💡 AI剧本交互原型说明"
      direction="rtl"
      size="400px"
    >
      <div class="space-y-6">
        <div class="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-xl">
          <h4 class="font-bold text-indigo-700 dark:text-indigo-300 mb-2">1. 顶步进度条</h4>
          <p class="text-sm text-slate-600 dark:text-slate-300 mb-2">
            明确展示了剧本创作的三步核心流程：
          </p>
          <ul class="text-sm text-slate-500 dark:text-slate-400 list-decimal pl-4 space-y-1">
            <li><strong>剧本设定：</strong> 确立题材、世界观、人物和主线。</li>
            <li><strong>大纲生成：</strong> 根据设定自动扩写分集大纲。</li>
            <li><strong>剧本生成：</strong> 细化对话与动作，生成最终短剧脚本。</li>
          </ul>
        </div>

        <div class="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-xl">
          <h4 class="font-bold text-purple-700 dark:text-purple-300 mb-2">2. 左侧设定面板</h4>
          <p class="text-sm text-slate-600 dark:text-slate-300 mb-2">
            提供全局的剧本参数控制。
          </p>
          <ul class="text-sm text-slate-500 dark:text-slate-400 list-disc pl-4 space-y-1">
            <li>包含题材、风格、受众的下拉选择，用于微调AI生成的提示词方向。</li>
            <li>可指定集数与单集时长，AI将自动计算整体节奏。</li>
          </ul>
        </div>

        <div class="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-xl">
          <h4 class="font-bold text-yellow-700 dark:text-yellow-300 mb-2">3. 右侧内容编辑区</h4>
          <p class="text-sm text-slate-600 dark:text-slate-300 mb-2">
            灵活的人机共创（Human-in-the-loop）模式。
          </p>
          <ul class="text-sm text-slate-500 dark:text-slate-400 list-disc pl-4 space-y-1">
            <li>每个模块右上角均有 <strong>"AI生成"</strong> 按钮，支持单点突破。</li>
            <li>底部提供 <strong>"基于设定补全"</strong>，保留用户已有输入，仅填充空白项。</li>
            <li><strong>"从零生成全部"</strong> 则一键覆盖所有模块。</li>
          </ul>
        </div>
      </div>
    </el-drawer>

    <!-- Product Design Dialog -->
    <ProductDesignDialog
      v-model="showDesignDialog"
      id="short-drama-script"
      :default-content="{
        title: '剧本编辑台',
        location: '这是整个产品中最为核心和复杂的文本工作台。将大纲或小说源文本转化为结构化、可直接拍摄或生成的“场景、动作、对白”。',
        layout: [
          '**左侧参数区：** 设定剧本的题材、风格倾向、核心受众、集数及时长。',
          '**右侧编辑区：** 采用表单块的形式编辑世界观、核心金手指、简介、角色档案和剧情要求。'
        ],
        interactions: [
          '**局部 AI 生成：** 每个文本块都可以单独呼叫 AI 根据左侧设定的条件进行内容生成。',
          '**智能补全：** 提供“基于设定补全”功能，智能分析已有内容并填充空白项，实现人机共创。',
          '**功能说明 (2.2版本)：** \n - **剧集管理：** 2.2版本已支持在剧本操作页面新增剧集。目前版本暂不支持剧集的删除及排序功能。 \n - **完结状态：** “已完”表示该集已成功合成全集视频；“未完”表示尚未完成全集视频合成。'
        ],
        version: '2.2'
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, QuestionFilled, RefreshRight, MagicStick, EditPen, InfoFilled, Close, Document, Location, Monitor, Pointer } from '@element-plus/icons-vue'
import ProductDesignDialog from '@/components/Common/ProductDesignDialog.vue'

const router = useRouter()
const activeStep = ref(0)
const showPrototypeHelp = ref(false)
const showDesignDialog = ref(false)

const form = reactive({
  theme: '逆袭神豪',
  style: '男频爽文风',
  audience: '大众向',
  template: 'short-video',
  tags: '',
  episodes: 12,
  duration: 30,
  title: '',
  worldSetting: '',
  coreCheat: '',
  synopsis: '',
  characters: '',
  direction: ''
})
</script>

<style scoped>
:deep(.el-radio-button__inner) {
  border-radius: 4px !important;
  border: 1px solid #dcdfe6;
}
:deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-left: 1px solid #dcdfe6;
}
</style>