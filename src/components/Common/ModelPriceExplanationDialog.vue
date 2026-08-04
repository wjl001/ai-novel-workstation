<template>
  <el-dialog
    v-model="visible"
    title="AI 模型价格说明"
    width="600px"
    align-center
    class="model-price-dialog"
  >
    <div class="leading-relaxed text-sm text-slate-600 dark:text-slate-300">
      <div class="space-y-4">
        <div v-for="(models, type) in groupedModelsByType" :key="type">
          <h3 class="text-lg font-black text-slate-800 dark:text-slate-100 mb-3">
            {{ type === 'video' ? '视频模型' : type === 'image' ? '图片模型' : '其他模型' }}
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div v-for="model in models" :key="model.name" class="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50">
              <el-icon :class="model.costCategory === '高端' || model.costCategory === '旗舰' ? 'text-amber-500' : 'text-emerald-500'"><PriceTag /></el-icon>
              <div class="flex-1">
                <div class="text-base font-black text-slate-700 dark:text-slate-200">
                  {{ model.name }}
                  <span :class="model.costCategory === '高端' || model.costCategory === '旗舰' ? 'text-amber-500' : 'text-emerald-500'">
                    ({{ model.costCategory === '高端' || model.costCategory === '旗舰' ? '较贵' : '较便宜' }})
                  </span>
                </div>
                <div class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  单价: {{ model.unitPrice }}
                </div>
                <div class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  适用场景: {{ model.usageScenario }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button round class="!rounded-2xl !font-black" @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { PriceTag } from '@element-plus/icons-vue'

interface ModelInfo {
  name: string
  type: 'image' | 'video' | 'text'
  costCategory: string
  unitPrice: string
  usageScenario: string
}

interface Tier {
  id: string
  name: string
  modelInfo?: ModelInfo[]
}

const props = defineProps<{
  modelTiers: Tier[]
  modelValue: boolean
}>()

const emit = defineEmits<{'update:modelValue': [value: boolean]}>()

const visible = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

const allModels = computed<ModelInfo[]>(() => {
  const modelsMap = new Map<string, ModelInfo>()
  props.modelTiers.forEach(tier => {
    if (tier.modelInfo) {
      tier.modelInfo.forEach(model => {
        modelsMap.set(model.name, model)
      })
    }
  })
  return Array.from(modelsMap.values())
})

const groupedModelsByType = computed(() => {
  const groups: Record<string, ModelInfo[]> = {}
  allModels.value.forEach(model => {
    const type = model.type
    if (!groups[type]) {
      groups[type] = []
    }
    groups[type].push(model)
  })
  // Sort to show video first, then image
  return Object.keys(groups).sort((a, b) => {
    if (a === 'video') return -1;
    if (b === 'video') return 1;
    return 0;
  }).reduce((obj, key) => {
    obj[key] = groups[key];
    return obj;
  }, {} as Record<string, ModelInfo[]>)
})
</script>

<style scoped lang="scss">
.model-price-dialog {
  .el-dialog__header {
    padding-bottom: 0;
  }
  .el-dialog__body {
    padding-top: 0;
  }
}
</style>