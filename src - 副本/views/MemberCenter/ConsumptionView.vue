<template>
  <div class="consumption-layout p-6 pb-10 bg-slate-50 dark:bg-slate-950 h-full relative overflow-y-auto flex flex-col">
    <div class="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-amber-100/40 dark:from-amber-900/15 to-transparent pointer-events-none"></div>
    <div class="absolute -top-28 -right-28 w-[520px] h-[520px] bg-indigo-200/35 dark:bg-indigo-900/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute top-32 -left-32 w-[420px] h-[420px] bg-purple-200/25 dark:bg-purple-900/15 rounded-full blur-3xl pointer-events-none"></div>

    <div class="w-full relative z-10 flex flex-col flex-1 min-h-0">
      <section class="rounded-3xl border border-white/60 dark:border-slate-700 bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm p-6 min-h-0 flex flex-col">
        <div class="flex items-center justify-between gap-4 shrink-0">
          <div class="flex items-center gap-3 min-w-0">
            <button type="button" class="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors" @click="router.back()">
              <el-icon class="text-slate-500 dark:text-slate-300"><ArrowLeft /></el-icon>
            </button>
            <div class="min-w-0">
              <div class="text-lg font-black text-slate-800 dark:text-slate-100">算力豆消耗明细</div>
              <div class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                <span class="font-black">{{ filteredConsumptionList.length }}</span> 条消耗记录
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <el-button round class="!rounded-2xl !font-black" @click="exportConsumption">导出报表</el-button>
            <el-button round class="!rounded-2xl !font-black" @click="router.push('/member-center')">前往会员中心</el-button>
          </div>
        </div>

        <!-- 统计信息卡片 -->
        <div class="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 shrink-0 px-1">
          <div class="rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 p-5 flex items-center gap-4 shadow-sm transition-all hover:shadow-md">
            <div class="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 flex items-center justify-center shadow-inner">
              <el-icon class="text-2xl"><Coin /></el-icon>
            </div>
            <div>
              <div class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">总可用算力豆</div>
              <div class="mt-1 text-2xl font-black text-slate-900 dark:text-white font-mono">
                {{ userStore.balance.toLocaleString() }}
              </div>
            </div>
          </div>

          <div class="rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 p-5 flex items-center gap-4 shadow-sm transition-all hover:shadow-md">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-300 flex items-center justify-center shadow-inner">
              <el-icon class="text-2xl"><Coin /></el-icon>
            </div>
            <div>
              <div class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">总计消耗算力豆</div>
              <div class="mt-1 text-2xl font-black text-slate-900 dark:text-white font-mono">
                {{ consumptionStats.totalPoints.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) }}
              </div>
            </div>
          </div>
          
          <div class="rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 p-5 flex items-center gap-4 shadow-sm transition-all hover:shadow-md">
            <div class="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shadow-inner">
              <el-icon class="text-2xl"><Money /></el-icon>
            </div>
            <div>
              <div class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">总计消耗金额</div>
              <div class="mt-1 text-2xl font-black text-slate-900 dark:text-white font-mono">
                ¥{{ consumptionStats.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }) }}
              </div>
            </div>
          </div>
        </div>

        <div class="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 shrink-0 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl">
          <div class="flex flex-col gap-1.5">
            <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">请求流水号</span>
            <el-input v-model="consumptionFilter.id" placeholder="流水号" clearable class="modern-input" />
          </div>
          <div class="flex flex-col gap-1.5">
            <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">模型大类</span>
            <el-select v-model="consumptionFilter.modelCategory" placeholder="全部" clearable class="modern-select">
              <el-option label="全部" value="" />
              <el-option label="图片" value="图片" />
              <el-option label="文本" value="文本" />
            </el-select>
          </div>
          <div class="flex flex-col gap-1.5">
            <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">模型名称</span>
            <el-input v-model="consumptionFilter.modelName" placeholder="模型名称" clearable class="modern-input" />
          </div>
          <div class="flex flex-col gap-1.5">
            <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">短剧名称</span>
            <el-input v-model="consumptionFilter.dramaName" placeholder="短剧名称" clearable class="modern-input" />
          </div>
          <div class="flex flex-col gap-1.5">
            <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">剧集名称</span>
            <el-input v-model="consumptionFilter.episodeName" placeholder="剧集名称" clearable class="modern-input" />
          </div>
          <div class="flex flex-col gap-1.5">
            <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">扣费时间</span>
            <el-date-picker
              v-model="consumptionFilter.dateRange"
              type="daterange"
              range-separator="-"
              start-placeholder="开始"
              end-placeholder="结束"
              class="modern-date-picker !w-full"
            />
          </div>
        </div>

        <div class="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
          <template v-if="isDark">
            <div v-if="filteredConsumptionList.length === 0" class="rounded-3xl border border-slate-700 bg-slate-950/20 p-10 text-center">
              <div class="text-sm font-black text-slate-200">暂无消耗记录</div>
            </div>

            <div v-else class="flex flex-col gap-3">
              <div v-for="c in paginatedConsumptionList" :key="c.id" class="rounded-3xl border border-slate-700 bg-slate-950/20 overflow-hidden">
                <button
                  type="button"
                  class="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-white/5 transition-colors"
                  @click="expandedConsumption[c.id] = !expandedConsumption[c.id]"
                >
                  <div
                    class="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                    :class="c.modelCategory === '图片' ? 'bg-indigo-500/15 text-indigo-300' : 'bg-emerald-500/15 text-emerald-300'"
                  >
                    <el-icon>
                      <Picture v-if="c.modelCategory === '图片'" />
                      <Document v-else />
                    </el-icon>
                  </div>

                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <div class="text-sm font-black text-slate-100 truncate">{{ c.modelName }}</div>
                      <el-tag :type="c.modelCategory === '图片' ? 'primary' : 'success'" size="small" effect="dark" class="!rounded-lg !border-none !scale-90">
                        {{ c.modelCategory }}
                      </el-tag>
                    </div>
                    <div class="mt-1 text-xs text-slate-400 truncate">
                      {{ c.sceneName }} · {{ c.dramaName ? `${c.dramaName} - ${c.episodeName}` : '通用场景' }}
                    </div>
                    <div class="mt-1 text-xs text-slate-500">{{ formatDateTime(c.createdAt) }}</div>
                  </div>

                  <div class="flex flex-col items-end gap-2 shrink-0">
                    <div class="text-base font-black text-rose-400">-{{ c.deductPoints }} 算力豆</div>
                    <el-icon class="text-slate-400 transition-transform" :class="expandedConsumption[c.id] ? 'rotate-180' : ''"><ArrowDown /></el-icon>
                  </div>
                </button>

                <div v-if="expandedConsumption[c.id]" class="px-5 pb-5 pt-0">
                  <div class="mt-2 rounded-3xl border border-slate-700 bg-slate-950/30 p-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-xs">
                      <div class="flex items-center justify-between gap-3">
                        <span class="text-slate-400">流水号</span>
                        <span class="text-slate-200 font-black">{{ c.id }}</span>
                      </div>
                      <div class="flex items-center justify-between gap-3">
                        <span class="text-slate-400">用户编号</span>
                        <span class="text-slate-200 font-black">{{ c.userId }}</span>
                      </div>
                      <div class="flex items-center justify-between gap-3">
                        <span class="text-slate-400">模型编码</span>
                        <span class="text-slate-200 font-black truncate max-w-[120px]">{{ c.modelCode }}</span>
                      </div>
                      <div class="flex items-center justify-between gap-3">
                        <span class="text-slate-400">场景编码</span>
                        <span class="text-slate-200 font-black truncate max-w-[120px]">{{ c.sceneCode }}</span>
                      </div>
                      <div class="flex items-center justify-between gap-3">
                        <span class="text-slate-400">计费维度</span>
                        <span class="text-slate-200 font-black">{{ c.billingDimension }}</span>
                      </div>
                      <div class="flex items-center justify-between gap-3">
                        <span class="text-slate-400">计费基数</span>
                        <span class="text-slate-200 font-black truncate max-w-[150px]">{{ c.billingBase }}</span>
                      </div>
                      <div class="flex items-center justify-between gap-3">
                        <span class="text-slate-400">最终扣减</span>
                        <span class="text-slate-200 font-black">{{ c.finalDeduct }}</span>
                      </div>
                      <div class="flex items-center justify-between gap-3">
                        <span class="text-slate-400">消耗金额</span>
                        <span class="text-slate-200 font-black">¥{{ c.amount.toFixed(3) }}</span>
                      </div>
                      <div class="flex items-center justify-between gap-3">
                        <span class="text-slate-400">消耗前余额</span>
                        <span class="text-slate-200 font-black">{{ c.balanceBefore }}</span>
                      </div>
                      <div class="flex items-center justify-between gap-3">
                        <span class="text-slate-400">消耗后余额</span>
                        <span class="text-cyan-300 font-black">{{ c.balanceAfter }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <el-table
              :data="paginatedConsumptionList"
              height="100%"
              class="modern-table"
              :header-cell-style="{
                background: 'transparent',
                borderBottom: '1px solid rgba(148, 163, 184, 0.25)',
                color: '#94a3b8',
                fontWeight: 900
              }"
            >
              <el-table-column prop="id" label="请求流水号" min-width="140" show-overflow-tooltip />
              <el-table-column prop="userId" label="用户编号" min-width="90" />
              <el-table-column prop="modelCategory" label="模型大类" min-width="90">
                <template #default="{ row }">
                  <el-tag :type="row.modelCategory === '图片' ? 'primary' : 'success'" size="small" class="!rounded-lg">
                    {{ row.modelCategory }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="modelCode" label="模型编码" min-width="130" show-overflow-tooltip />
              <el-table-column prop="modelName" label="模型名称" min-width="150" show-overflow-tooltip />
              <el-table-column prop="sceneCode" label="场景编码" min-width="130" show-overflow-tooltip />
              <el-table-column prop="sceneName" label="场景名称" min-width="130" show-overflow-tooltip />
              <el-table-column prop="billingDimension" label="计费维度" min-width="110" />
              <el-table-column prop="billingBase" label="计费基数" min-width="160" show-overflow-tooltip />
              <el-table-column prop="dramaName" label="短剧名称" min-width="130" show-overflow-tooltip />
              <el-table-column prop="episodeName" label="剧集名称" min-width="110" show-overflow-tooltip />
              <el-table-column prop="deductPoints" label="本次扣减" min-width="90">
                <template #default="{ row }">
                  <span class="font-black text-rose-500">-{{ row.deductPoints }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="finalDeduct" label="最终扣减" min-width="90" />
              <el-table-column prop="amount" label="消耗金额" min-width="90">
                <template #default="{ row }">
                  <span class="font-bold text-slate-700">¥{{ row.amount.toFixed(3) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="balanceBefore" label="前余额" min-width="100" />
              <el-table-column prop="balanceAfter" label="后余额" min-width="100">
                <template #default="{ row }">
                  <span class="font-black text-slate-800">{{ row.balanceAfter }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="扣费时间" min-width="160" fixed="right">
                <template #default="{ row }">
                  <span class="text-slate-500">{{ formatDateTime(row.createdAt) }}</span>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </div>

        <div class="mt-6 flex justify-center px-2 shrink-0">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="filteredConsumptionList.length"
            layout="total, sizes, prev, pager, next, jumper"
            class="modern-pagination"
            background
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useThemeStore } from '@/store/theme'
import { useUserStore } from '@/store/user'
import {
  ArrowDown,
  ArrowLeft,
  Coin,
  Document,
  Money,
  Picture
} from '@element-plus/icons-vue'

interface ConsumptionDetail {
  id: string              // 请求流水号
  userId: string          // 用户编号
  modelCategory: string   // 模型大类
  modelCode: string       // 模型编码
  modelName: string       // 模型名称
  sceneCode: string       // 功能场景编码
  sceneName: string       // 功能场景名称
  billingDimension: string // 主计费维度
  billingBase: string     // 计费基数描述
  dramaName: string       // 短剧名称
  episodeName: string     // 剧集名称
  deductPoints: number    // 本次扣减算力豆
  finalDeduct: number     // 最终扣减值
  amount: number          // 消耗金额 (人民币)
  balanceBefore: number   // 扣费前余额
  balanceAfter: number    // 扣费后余额
  createdAt: number       // 扣费时间
}

const router = useRouter()
const themeStore = useThemeStore()
const userStore = useUserStore()
const isDark = computed(() => themeStore.isDark)

const generateMockData = (count: number): ConsumptionDetail[] => {
  const data: ConsumptionDetail[] = []
  const categories = ['图片', '文本']
  const models = {
    '图片': ['Seedance 超清文生图', 'Midjourney V6', 'DALL-E 3'],
    '文本': ['豆包专业版 32K', 'GPT-4o', 'Claude 3.5 Sonnet']
  }
  const dramas = ['都市逆袭之我当老板', '重生之我在古代搞基建', '霸总的落跑甜心']
  
  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)]
    const modelName = models[category as keyof typeof models][Math.floor(Math.random() * 3)]
    const dramaName = dramas[Math.floor(Math.random() * dramas.length)]
    const deductPoints = Number((Math.random() * 20 + 5).toFixed(1))
    
    data.push({
      id: `${category === '图片' ? 'IMG' : 'TXT'}20260701${String(i + 1).padStart(4, '0')}`,
      userId: 'U20001',
      modelCategory: category,
      modelCode: `${category === '图片' ? 'img' : 'txt'}-model-${i}`,
      modelName: modelName,
      sceneCode: 'scene_playlist_gen',
      sceneName: category === '图片' ? '短剧分镜生成' : '短剧剧本生成',
      billingDimension: category === '图片' ? '按图片张数计费' : '按 Token 计费',
      billingBase: category === '图片' ? '生成 4K 高清分镜图 1 张' : `消耗 ${Math.floor(Math.random() * 10000)} tokens`,
      dramaName: dramaName,
      episodeName: `第 ${Math.floor(Math.random() * 10) + 1} 集`,
      deductPoints: deductPoints,
      finalDeduct: Math.ceil(deductPoints),
      amount: deductPoints * 0.007,
      balanceBefore: 10000 - i * 20,
      balanceAfter: 10000 - (i + 1) * 20,
      createdAt: Date.now() - i * 3600000 * 2 // 每条记录间隔2小时
    })
  }
  return data
}

const consumptionList = ref<ConsumptionDetail[]>(generateMockData(50))

const currentPage = ref(1)
const pageSize = ref(10)

const consumptionFilter = reactive({
  id: '',
  modelCategory: '',
  modelName: '',
  dramaName: '',
  episodeName: '',
  dateRange: [] as [Date, Date] | []
})

const filteredConsumptionList = computed(() => {
  return consumptionList.value.filter(item => {
    const matchId = !consumptionFilter.id || item.id.toLowerCase().includes(consumptionFilter.id.toLowerCase())
    const matchCategory = !consumptionFilter.modelCategory || item.modelCategory === consumptionFilter.modelCategory
    const matchModelName = !consumptionFilter.modelName || item.modelName.toLowerCase().includes(consumptionFilter.modelName.toLowerCase())
    const matchDramaName = !consumptionFilter.dramaName || item.dramaName.toLowerCase().includes(consumptionFilter.dramaName.toLowerCase())
    const matchEpisodeName = !consumptionFilter.episodeName || item.episodeName.toLowerCase().includes(consumptionFilter.episodeName.toLowerCase())
    
    let matchDate = true
    if (consumptionFilter.dateRange && consumptionFilter.dateRange.length === 2) {
      const start = consumptionFilter.dateRange[0].getTime()
      const end = consumptionFilter.dateRange[1].getTime() + 86399999 // end of day
      matchDate = item.createdAt >= start && item.createdAt <= end
    }
    
    return matchId && matchCategory && matchModelName && matchDramaName && matchEpisodeName && matchDate
  })
})

const paginatedConsumptionList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredConsumptionList.value.slice(start, end)
})

const consumptionStats = computed(() => {
  return filteredConsumptionList.value.reduce(
    (acc, item) => {
      acc.totalPoints += item.deductPoints
      acc.totalAmount += item.amount
      return acc
    },
    { totalPoints: 0, totalAmount: 0 }
  )
})

const formatDateTime = (timestamp: number) => {
  const d = new Date(timestamp)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm}`
}

const exportConsumption = () => {
  ElMessage.success('报表导出成功（演示版：已生成 Excel 任务）')
}

const expandedConsumption = reactive<Record<string, boolean>>({})
</script>

<style scoped lang="scss">
.modern-table {
  :deep(.el-table) {
    background: transparent !important;
    --el-table-bg-color: transparent !important;
    --el-table-tr-bg-color: transparent !important;
    --el-table-header-bg-color: transparent !important;
  }
  :deep(.el-table__header-wrapper),
  :deep(.el-table__body-wrapper),
  :deep(.el-table__inner-wrapper) {
    background: transparent !important;
  }
  :deep(.el-table__inner-wrapper::before) {
    display: none;
  }
  :deep(.el-table tr) {
    background: transparent !important;
  }
  :deep(.el-table td.el-table__cell),
  :deep(.el-table th.el-table__cell) {
    background: transparent !important;
    border-bottom-color: rgba(148, 163, 184, 0.18) !important;
    color: inherit;
  }
  :deep(.el-table__row:hover > td.el-table__cell) {
    background-color: rgba(99, 102, 241, 0.08) !important;
  }

  /* 字体颜色适配 */
  :deep(.el-table__body) {
    .el-table__cell {
      color: #334155;
    }
  }
}

.dark .modern-table {
  :deep(.el-table__body) {
    .el-table__cell {
      color: #cbd5e1;
    }
  }
}

.modern-input .el-input__wrapper,
.modern-select .el-select__wrapper {
  background-color: #f8fafc;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: none;
  transition: all 0.3s;
  height: 40px;
}

.dark {
  .modern-input .el-input__wrapper,
  .modern-select .el-select__wrapper {
    background-color: rgba(15, 23, 42, 0.6);
    border-color: rgba(51, 65, 85, 0.8);
    color: #f1f5f9;
  }
}
</style>
