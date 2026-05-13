import re
import sys

def modify_vue():
    with open(r'd:\phpstudy_pro\WWW\ai-novel-workstation2.3\src\views\MemberCenter\MemberCenterView.vue', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. 算力 -> 算力豆 replacements in UI
    # Note: we should replace '算力' with '算力豆' where it's shown to user, except '算力豆' and other double replacements.
    # Actually, the user says "算力值改成算力豆，（优先用「算力豆」做主计费（对外）" and "内部核算用「算力值」（对内）".
    # So the UI should mostly show "算力豆". Let's do selective replacement.
    content = content.replace('算力与订单', '算力豆与订单')
    content = content.replace('总可用算力<', '总可用算力豆<')
    content = content.replace('赠送算力<', '赠送算力豆<')
    content = content.replace('充值算力<', '充值算力豆<')
    content = content.replace('可用算力<', '可用算力豆<')
    content = content.replace('+{{ plan.bonusPoints.toLocaleString() }}算力', '+{{ plan.bonusPoints.toLocaleString() }}算力豆')
    content = content.replace('算力充值套餐', '算力豆充值套餐')
    content = content.replace('算力包', '算力豆包')
    content = content.replace('充值算力后', '充值算力豆后')
    content = content.replace('赠送算力', '赠送算力豆')
    content = content.replace('算力订单', '算力豆订单')
    content = content.replace('算力充值', '算力豆充值')
    content = content.replace('充值算力，', '充值算力豆，')
    content = content.replace('算力用于生成', '算力豆用于生成')
    content = content.replace('算力/会员', '算力豆/会员')
    content = content.replace('算力折扣', '算力豆折扣')
    content = content.replace('算力状态', '算力豆状态')

    # Add NavKey 'invite'
    content = content.replace("type NavKey = 'overview' | 'orders' | 'invoice' | 'support' | 'tutorial' | 'logout'", "type NavKey = 'overview' | 'orders' | 'invoice' | 'support' | 'tutorial' | 'logout' | 'invite'")
    
    # Add Share to icons
    content = content.replace("SwitchButton,\n  Trophy,\n  User", "Share,\n  SwitchButton,\n  Trophy,\n  User")

    # Add the "invite" nav item
    nav_item = """            <button type="button" class="w-full px-4 py-3 rounded-2xl flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors" @click="activeKey = 'invite'">
              <div class="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-300 flex items-center justify-center">
                <el-icon><Share /></el-icon>
              </div>
              <span class="text-sm font-black text-slate-800 dark:text-slate-100">邀请返利</span>
              <el-icon class="ml-auto text-slate-400"><ArrowRight /></el-icon>
            </button>
            <button type="button" class="w-full px-4 py-3 rounded-2xl flex items-center gap-3 hover:bg-rose-50/70 dark:hover:bg-rose-500/10 transition-colors" @click="activeKey = 'logout'">"""
    content = content.replace("""            <button type="button" class="w-full px-4 py-3 rounded-2xl flex items-center gap-3 hover:bg-rose-50/70 dark:hover:bg-rose-500/10 transition-colors" @click="activeKey = 'logout'">""", nav_item)

    # 2. Replace the Single Item Memberships section
    old_plan_section = """            <div class="rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm p-6">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <div class="text-lg font-black text-slate-900 dark:text-white">单品会员套餐</div>
                  <div class="mt-1 text-sm text-slate-500 dark:text-slate-400">可自由叠加赠送，支持按月开通与续费</div>
                </div>
                <div class="text-xs text-slate-500 dark:text-slate-400 pt-1">支持自动续费 · 支付宝/微信可对接</div>
              </div>

              <div class="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="plan in planCards"
                  :key="plan.id"
                  class="rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 hover:shadow-lg hover:shadow-slate-900/5 dark:hover:shadow-black/25 transition-all overflow-hidden"
                >
                  <div class="p-5">
                    <div class="flex items-start gap-4">
                      <div
                        class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner"
                        :class="plan.accent === 'indigo' ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300' : plan.accent === 'sky' ? 'bg-sky-500/15 text-sky-600 dark:text-sky-300' : plan.accent === 'emerald' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300' : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'"
                      >
                        <el-icon class="text-xl"><component :is="plan.icon" /></el-icon>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                          <div class="text-base font-black text-slate-900 dark:text-white truncate">{{ plan.title }}</div>
                          <span class="px-2 py-0.5 rounded-full text-[11px] font-black bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">+{{ plan.bonusPoints.toLocaleString() }}算力豆</span>
                        </div>
                        <div class="mt-2 flex items-end gap-2">
                          <div class="text-2xl font-black text-slate-900 dark:text-white">¥{{ plan.priceMonthly }}</div>
                          <div class="text-xs font-black text-slate-400 dark:text-slate-500">/月</div>
                          <div class="ml-auto">
                            <span v-if="plan.active" class="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">已开通</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="mt-4 grid grid-cols-1 gap-2 text-xs">
                      <div v-for="f in plan.features" :key="f" class="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <span class="w-1.5 h-1.5 rounded-full" :class="plan.accent === 'indigo' ? 'bg-indigo-400' : plan.accent === 'sky' ? 'bg-sky-400' : plan.accent === 'emerald' ? 'bg-emerald-400' : 'bg-amber-400'"></span>
                        <span class="font-bold">{{ f }}</span>
                      </div>
                    </div>

                    <div class="mt-4 flex items-center justify-between gap-3">
                      <div class="text-xs text-slate-500 dark:text-slate-400">
                        <span class="font-black">到期：</span>{{ plan.active ? formatDate(plan.expireAt) : '-' }}
                      </div>
                      <el-button
                        round
                        class="!h-10 !rounded-2xl !border-none !font-black"
                        :class="plan.accent === 'indigo' ? '!bg-gradient-to-r !from-indigo-500 !to-purple-600 !text-white shadow-lg shadow-indigo-500/15' : plan.accent === 'sky' ? '!bg-gradient-to-r !from-sky-500 !to-indigo-600 !text-white shadow-lg shadow-sky-500/15' : plan.accent === 'emerald' ? '!bg-gradient-to-r !from-emerald-500 !to-teal-600 !text-white shadow-lg shadow-emerald-500/15' : '!bg-gradient-to-r !from-amber-500 !to-orange-600 !text-white shadow-lg shadow-amber-500/15'"
                        @click="openPurchasePlan(plan)"
                      >
                        {{ plan.ctaText }}
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>"""

    new_plan_section = """            <div class="rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm p-6">
              <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <div class="text-lg font-black text-slate-900 dark:text-white">AI会员套餐</div>
                  <div class="mt-1 text-sm text-slate-500 dark:text-slate-400">选择不同类型的会员以解锁对应的专属模型和并发额度</div>
                </div>
                
                <div class="flex items-center bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 shrink-0">
                  <button 
                    type="button" 
                    class="px-4 py-1.5 rounded-xl text-sm font-black transition-all"
                    :class="billingCycle === 'monthly' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
                    @click="billingCycle = 'monthly'"
                  >
                    连续包月
                  </button>
                  <button 
                    type="button" 
                    class="px-4 py-1.5 rounded-xl text-sm font-black transition-all flex items-center gap-1"
                    :class="billingCycle === 'yearly' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
                    @click="billingCycle = 'yearly'"
                  >
                    按年购买
                    <span class="px-1.5 py-0.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] whitespace-nowrap">限时8折</span>
                  </button>
                </div>
              </div>

              <div class="mt-5 flex flex-wrap gap-2">
                <button
                  v-for="mt in membershipTypes"
                  :key="mt.id"
                  type="button"
                  class="px-4 py-2 rounded-2xl text-sm font-black border transition-all"
                  :class="membershipType === mt.id ? 'border-transparent bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 dark:border-indigo-500/30' : 'border-slate-200/70 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'"
                  @click="membershipType = mt.id"
                >
                  {{ mt.name }}
                </button>
              </div>

              <div class="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div
                  v-for="tier in activeTiers"
                  :key="tier.id"
                  class="relative rounded-3xl border transition-all flex flex-col"
                  :class="tier.id === 'pro' || tier.id === 'flagship' ? 'border-indigo-500/30 bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900 shadow-lg shadow-indigo-500/5' : 'border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900'"
                >
                  <div v-if="tier.badge" class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[11px] font-black shadow-sm"
                    :class="tier.id === 'flagship' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'">
                    {{ tier.badge }}
                  </div>
                  
                  <div class="p-6 pb-4">
                    <div class="text-xl font-black text-slate-900 dark:text-white text-center">{{ tier.name }}</div>
                    
                    <div class="mt-4 flex items-baseline justify-center gap-1">
                      <span class="text-sm font-black text-slate-500 dark:text-slate-400">¥</span>
                      <span class="text-4xl font-black text-slate-900 dark:text-white">{{ billingCycle === 'monthly' ? tier.priceMonthly : tier.priceYearly }}</span>
                      <span class="text-sm font-black text-slate-500 dark:text-slate-400">/{{ billingCycle === 'monthly' ? '月' : '年' }}</span>
                    </div>
                    
                    <div class="mt-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 text-center">
                      *实际价格以当前汇率为准
                      <br/>
                      次{{ billingCycle === 'monthly' ? '月' : '年' }}按¥{{ billingCycle === 'monthly' ? tier.priceMonthly : tier.priceYearly }}/{{ billingCycle === 'monthly' ? '月' : '年' }}自动续费
                    </div>

                    <el-button
                      round
                      class="mt-5 w-full !h-11 !rounded-2xl !font-black !border-none transition-all"
                      :class="tier.id === 'pro' || tier.id === 'flagship' ? '!bg-gradient-to-r !from-indigo-500 !to-purple-600 !text-white shadow-lg shadow-indigo-500/15' : '!bg-slate-100 dark:!bg-slate-800 !text-slate-800 dark:!text-slate-100 hover:!bg-slate-200 dark:hover:!bg-slate-700'"
                      @click="openPurchaseTier(tier)"
                    >
                      选择计划
                    </el-button>
                    
                    <div class="mt-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 p-3 text-center">
                      <span class="text-sm font-black" :class="tier.id === 'flagship' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'">{{ tier.points }}</span>
                      <span class="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">积分/{{ billingCycle === 'monthly' ? '月' : '年' }}</span>
                    </div>
                  </div>
                  
                  <div class="p-6 pt-2 border-t border-slate-100 dark:border-slate-800 flex-1">
                    <div class="flex flex-col gap-3 text-xs">
                      <div v-for="(f, i) in getTierFeatures(tier)" :key="i" class="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                        <el-icon class="text-emerald-500 mt-0.5 shrink-0"><Check /></el-icon>
                        <span class="font-bold leading-relaxed">{{ f }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>"""

    content = content.replace(old_plan_section, new_plan_section)

    # 3. Add the 'invite' section
    invite_section = """
          <section v-else-if="activeKey === 'invite'" class="rounded-3xl border border-white/60 dark:border-slate-700 bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm p-6 min-h-0 flex flex-col gap-6">
            <div>
              <div class="text-lg font-black text-slate-800 dark:text-slate-100">邀请返利</div>
              <div class="mt-1 text-sm text-slate-500 dark:text-slate-400">邀请好友注册，双方均可获得丰厚积分奖励。积分可按固定比例兑换算力豆。</div>
            </div>

            <div class="rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/20 p-6 flex flex-col items-center justify-center py-10">
              <div class="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-4">
                <el-icon class="text-white text-3xl"><Share /></el-icon>
              </div>
              <h3 class="text-xl font-black text-slate-900 dark:text-white mb-2">生成您的专属邀请码</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 text-center max-w-md mb-6">
                将邀请码分享给新用户。每成功邀请一位好友，您将获得 <span class="font-black text-amber-500">200 积分</span>奖励。<br/>
                <span class="text-xs">提示：100 积分 = 10 算力豆（固定兑换）</span>
              </p>
              
              <div v-if="inviteCode" class="flex flex-col items-center">
                <div class="px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-dashed border-amber-300 dark:border-amber-700 mb-4">
                  <span class="text-3xl font-black tracking-widest text-amber-600 dark:text-amber-400">{{ inviteCode }}</span>
                </div>
                <el-button
                  round
                  class="!h-10 !rounded-2xl !font-black !bg-gradient-to-r !from-amber-500 !to-orange-600 !text-white !border-none shadow-lg shadow-amber-500/15"
                  @click="copyInviteCode"
                >
                  复制邀请码
                </el-button>
              </div>
              <el-button
                v-else
                round
                class="!h-11 !px-8 !rounded-2xl !font-black !bg-gradient-to-r !from-indigo-500 !to-purple-600 !text-white !border-none shadow-lg shadow-indigo-500/15"
                @click="generateInviteCode"
              >
                立即生成邀请码
              </el-button>
            </div>
            
            <div class="rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5">
              <div class="text-sm font-black text-slate-800 dark:text-slate-100 mb-4">积分兑换算力豆</div>
              <div class="flex items-center gap-4">
                <div class="flex-1 bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-4 flex justify-between items-center">
                  <div>
                    <div class="text-xs text-slate-500 dark:text-slate-400">当前积分</div>
                    <div class="text-2xl font-black text-amber-500 mt-1">{{ currentPoints }}</div>
                  </div>
                  <el-icon class="text-2xl text-slate-300 dark:text-slate-600"><ArrowRight /></el-icon>
                  <div class="text-right">
                    <div class="text-xs text-slate-500 dark:text-slate-400">可兑换算力豆</div>
                    <div class="text-2xl font-black text-cyan-500 mt-1">{{ Math.floor(currentPoints / 100) * 10 }}</div>
                  </div>
                </div>
                <el-button
                  round
                  class="!h-12 !px-6 !rounded-2xl !font-black"
                  type="primary"
                  :disabled="currentPoints < 100"
                  @click="exchangePoints"
                >
                  立即兑换
                </el-button>
              </div>
              <div class="mt-3 text-xs text-slate-400">规则：100 积分 = 10 算力豆，不足 100 积分部分不可兑换。积分不可直接抵扣算力。</div>
            </div>
          </section>
          """
    
    # insert before `<section v-else-if="activeKey === 'logout'`
    content = content.replace("""<section v-else-if="activeKey === 'logout'""", invite_section + """\n          <section v-else-if="activeKey === 'logout'""")

    # 4. Add scripts for the new features
    # Check is imported in icons
    if "Check," not in content and "Check " not in content:
        content = content.replace("from '@element-plus/icons-vue'", "Check,\n  from '@element-plus/icons-vue'")

    # remove old memberPlans and planCards from script
    # actually we can just append new reactive variables and methods
    
    script_additions = """
const billingCycle = ref<'monthly' | 'yearly'>('monthly')
const membershipType = ref<'short-drama' | 'short-video' | 'music' | 'novel' | 'batch'>('short-drama')

const membershipTypes = [
  { id: 'short-drama', name: 'AI短剧会员' },
  { id: 'short-video', name: 'AI短视频会员' },
  { id: 'music', name: 'AI音乐会员' },
  { id: 'novel', name: 'AI小说会员' },
  { id: 'batch', name: '四合一批量开通' }
]

const activeTiers = computed(() => {
  const isBatch = membershipType.value === 'batch'
  const multiplier = isBatch ? 3 : 1
  return [
    { id: 'starter', name: '入门版', priceMonthly: 112 * multiplier, priceYearly: Math.floor(112 * 12 * 0.8 * multiplier), points: 1600 * multiplier, concurrent: 8 * multiplier, badge: '' },
    { id: 'basic', name: '基础版', priceMonthly: 203 * multiplier, priceYearly: Math.floor(203 * 12 * 0.8 * multiplier), points: 2900 * multiplier, concurrent: 10 * multiplier, badge: '' },
    { id: 'pro', name: '专业版', priceMonthly: 483 * multiplier, priceYearly: Math.floor(483 * 12 * 0.8 * multiplier), points: 6900 * multiplier, concurrent: 20 * multiplier, badge: '最受欢迎' },
    { id: 'flagship', name: '旗舰版', priceMonthly: 1393 * multiplier, priceYearly: Math.floor(1393 * 12 * 0.8 * multiplier), points: 20500 * multiplier, concurrent: 40 * multiplier, badge: '最超值' }
  ]
})

const getTierFeatures = (tier: any) => {
  const isVideoOrDrama = ['short-drama', 'short-video', 'batch'].includes(membershipType.value)
  const baseFeatures = [
    `${tier.concurrent}个并发任务`,
    '每日签到可领取积分',
    '支持创建与管理团队，并可分配团队积分',
    '去水印导出',
    '访问所有图片模型',
    '图片批量导出',
    '支持 1080P',
    '包含商用授权（Commercial License）',
    '支持每月自动续费'
  ]
  
  if (isVideoOrDrama) {
    baseFeatures.splice(1, 0, '解锁 Seedance 2.0 Pro 视频模型', '解锁 Seedance 2.0 Fast 视频模型')
    baseFeatures.splice(7, 0, '访问所有视频模型', '视频批量导出')
  }
  
  return baseFeatures
}

const openPurchaseTier = (tier: any) => {
  const cycleText = billingCycle.value === 'monthly' ? '按月' : '按年'
  const price = billingCycle.value === 'monthly' ? tier.priceMonthly : tier.priceYearly
  const mt = membershipTypes.find(m => m.id === membershipType.value)?.name || ''
  
  purchaseDialog.summary = `${mt} - ${tier.name}（${cycleText}）`
  purchaseDialog.amount = price
  purchaseDialog.bonusPoints = tier.points
  purchaseDialog.payload = {
    type: 'member',
    title: `${mt} - ${tier.name}（${cycleText}）`,
    amount: price,
    bonusPoints: tier.points,
    effect: () => {
      memberState.points += tier.points
      ElMessage.success(`成功开通 ${mt} ${tier.name}`)
    }
  }
  purchaseDialog.visible = true
}

const inviteCode = ref('')
const currentPoints = ref(500) // Mock points

const generateInviteCode = () => {
  inviteCode.value = 'AI' + Math.random().toString(36).substring(2, 8).toUpperCase()
  ElMessage.success('邀请码生成成功！')
}

const copyInviteCode = () => {
  navigator.clipboard.writeText(inviteCode.value)
  ElMessage.success('邀请码已复制到剪贴板')
}

const exchangePoints = () => {
  if (currentPoints.value < 100) return
  const exchangeable = Math.floor(currentPoints.value / 100) * 100
  const gainedBeans = (exchangeable / 100) * 10
  currentPoints.value -= exchangeable
  memberState.points += gainedBeans
  ElMessage.success(`成功使用 ${exchangeable} 积分兑换了 ${gainedBeans} 算力豆`)
  saveState()
}
"""
    
    # insert scripts right after `const orderFilter = ref<OrderType | 'all'>('all')`
    content = content.replace("const orderFilter = ref<OrderType | 'all'>('all')", "const orderFilter = ref<OrderType | 'all'>('all')\n" + script_additions)

    # Need to clean up the import of 'Check' and 'Share' to be correct.
    content = content.replace("from '@element-plus/icons-vue'", "  Check,\n  Share,\n} from '@element-plus/icons-vue'")
    # Note: we already added Share, let's fix the icons import carefully.
    
    with open(r'd:\phpstudy_pro\WWW\ai-novel-workstation2.3\src\views\MemberCenter\MemberCenterView.vue', 'w', encoding='utf-8') as f:
        f.write(content)

modify_vue()
