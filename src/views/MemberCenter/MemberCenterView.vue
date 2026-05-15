<template>
  <div class="member-center-layout p-6 pb-10 bg-slate-50 dark:bg-slate-950 h-full relative overflow-y-auto flex flex-col">
    <div class="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-amber-100/40 dark:from-amber-900/15 to-transparent pointer-events-none"></div>
    <div class="absolute -top-28 -right-28 w-[520px] h-[520px] bg-indigo-200/35 dark:bg-indigo-900/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute top-32 -left-32 w-[420px] h-[420px] bg-purple-200/25 dark:bg-purple-900/15 rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-7xl mx-auto w-full relative z-10 flex flex-col flex-1 min-h-0">
      <div class="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
        <div>
          <h2 class="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <el-icon class="text-white text-xl"><GoldMedal /></el-icon>
            </div>
            会员中心
            <button 
              @click="showDesignDialog = true"
              class="ml-2 h-7 px-3 flex items-center gap-2 rounded-full font-bold text-[10px] shadow-sm border transition-all duration-300 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-300 dark:hover:border-amber-500/50"
            >
              <el-icon :size="12"><InfoFilled /></el-icon>
              <span>产品设计说明</span>
            </button>
          </h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-2 ml-13 font-medium">管理会员、算力豆与订单，解锁更强创作能力</p>
        </div>

        <div class="flex items-center gap-3">
          <div class="px-4 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border border-white/60 dark:border-slate-700 shadow-sm flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-inner">
              <el-icon class="text-white"><User /></el-icon>
            </div>
            <div class="flex flex-col">
              <span class="text-[10px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500 leading-none">当前账号</span>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-sm font-black text-slate-800 dark:text-slate-100 leading-none truncate max-w-[160px]">
                  {{ userStore.userInfo?.name || '未命名用户' }}
                </span>
                <el-tag v-if="isSuperMember" size="small" type="warning" effect="dark" class="!rounded-lg !border-none">超级会员</el-tag>
                <el-tag v-else size="small" type="info" effect="plain" class="!rounded-lg">普通用户</el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        <aside class="lg:col-span-4 xl:col-span-3 flex flex-col gap-4 min-h-0">
          <div class="rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm p-4">
            <button
              type="button"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all"
              :class="activeKey === 'overview' ? 'border-transparent bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/20' : 'border-slate-200/70 dark:border-slate-700 bg-white/50 dark:bg-slate-950/20 text-slate-700 dark:text-slate-100'"
              @click="activeKey = 'overview'"
            >
              <div class="w-9 h-9 rounded-2xl bg-white/15 flex items-center justify-center">
                <el-icon class="text-white"><GoldMedal /></el-icon>
              </div>
              <div class="flex-1 text-left">
                <div class="text-sm font-black">我的会员中心</div>
                <div class="text-[11px] font-bold opacity-80">算力豆/会员/订单控制台</div>
              </div>
              <el-icon class="opacity-80"><ArrowRight /></el-icon>
            </button>
          </div>

          <div class="rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm overflow-hidden">
            <div class="p-5 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 relative">
              <div class="absolute -right-12 -top-12 w-40 h-40 bg-cyan-400/10 rounded-full blur-3xl"></div>
              <div class="absolute -left-16 -bottom-16 w-44 h-44 bg-indigo-400/10 rounded-full blur-3xl"></div>
              <div class="relative z-10 flex items-center gap-4">
                <div class="relative shrink-0">
                  <el-avatar :size="56" class="!bg-indigo-600 shadow-lg ring-2 ring-white/10" :src="userStore.userInfo?.avatar">
                    {{ userStore.userInfo?.name?.charAt(0) || 'U' }}
                  </el-avatar>
                  <div class="absolute -left-2 -bottom-2 w-7 h-7 rounded-full bg-slate-900/80 border border-white/15 flex items-center justify-center text-[11px] font-black text-cyan-300">
                    16
                  </div>
                </div>
                <div class="min-w-0">
                  <div class="text-white font-black text-base leading-none truncate">{{ userStore.userInfo?.name || '本地用户' }}</div>
                  <div class="mt-2 flex items-center gap-2 text-[11px] font-bold text-slate-300 min-w-0">
                    <span class="px-2 py-1 rounded-lg bg-white/10 truncate">ID: {{ userStore.userInfo?.id || '-' }}</span>
                    <span class="px-2 py-1 rounded-lg bg-white/10 uppercase">{{ userStore.userInfo?.teamRole || 'owner' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="p-5">
              <div class="grid grid-cols-2 gap-3 text-xs">
                <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  账号状态
                  <span class="ml-auto font-black text-emerald-500 dark:text-emerald-300">正常</span>
                </div>
                <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <span class="w-1.5 h-1.5 rounded-full" :class="isSuperMember ? 'bg-amber-400' : 'bg-slate-400'"></span>
                  会员身份
                  <span class="ml-auto font-black" :class="isSuperMember ? 'text-amber-600 dark:text-amber-300' : 'text-slate-600 dark:text-slate-300'">
                    {{ isSuperMember ? '超级会员' : '普通用户' }}
                  </span>
                </div>
                <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  到期时间
                  <span class="ml-auto font-black text-slate-700 dark:text-slate-200">{{ isSuperMember ? formatDate(memberState.superExpireAt) : '-' }}</span>
                </div>
                <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  安全状态
                  <span class="ml-auto font-black text-emerald-500 dark:text-emerald-300">已验证</span>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm p-5">
            <div class="text-sm font-black text-slate-800 dark:text-slate-100">会员管理</div>
            <div class="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                class="px-3 py-1.5 rounded-2xl text-xs font-black border transition-all"
                :class="selectedMemberKey === 'music' ? 'border-transparent bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 dark:border-cyan-500/30' : 'border-slate-200/70 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'"
                @click="selectedMemberKey = 'music'"
              >
                AI音乐会员
              </button>
              <button
                type="button"
                class="px-3 py-1.5 rounded-2xl text-xs font-black border transition-all"
                :class="selectedMemberKey === 'short-drama' ? 'border-transparent bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 dark:border-indigo-500/30' : 'border-slate-200/70 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'"
                @click="selectedMemberKey = 'short-drama'"
              >
                AI短剧会员
              </button>
              <button
                type="button"
                class="px-3 py-1.5 rounded-2xl text-xs font-black border transition-all"
                :class="selectedMemberKey === 'super' ? 'border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-300 dark:border-amber-500/30' : 'border-slate-200/70 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'"
                @click="selectedMemberKey = 'super'"
              >
                super
              </button>
            </div>

            <div class="mt-4 rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/20 p-4">
                <div class="flex items-center justify-between">
                  <div class="text-xs font-black text-slate-500 dark:text-slate-400">算力豆折扣</div>
                  <div class="text-xs font-black text-slate-800 dark:text-slate-100">{{ superDiscount.toFixed(1) }}折</div>
                </div>
              <div class="mt-3 flex items-center gap-2">
                <el-button round class="!h-9 !rounded-2xl !font-black" @click="activeKey = 'overview'">查看套餐</el-button>
                <el-button
                  round
                  type="primary"
                  class="!h-9 !rounded-2xl !border-none !bg-gradient-to-r !from-amber-500 !to-orange-600 !text-white !font-black shadow-lg shadow-amber-500/15"
                  @click="openPurchaseSuper()"
                >
                  {{ isSuperMember ? '续费升级' : '立即升级' }}
                </el-button>
              </div>
            </div>
          </div>

          <div class="rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm p-5">
            <div class="flex items-center justify-between">
              <div class="text-sm font-black text-slate-800 dark:text-slate-100">算力管理</div>
              <div class="text-xs font-black text-slate-400 dark:text-slate-500">总可用算力豆</div>
            </div>
            <div class="mt-3 text-3xl font-black text-slate-900 dark:text-white">{{ pointsCompact }}</div>
            <div class="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div class="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>赠送算力豆</span>
                <span class="font-black text-slate-700 dark:text-slate-200">{{ giftPointsTotal.toLocaleString() }}</span>
              </div>
              <div class="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>充值算力豆</span>
                <span class="font-black text-slate-700 dark:text-slate-200">{{ rechargePointsTotal.toLocaleString() }}</span>
              </div>
              <div class="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>今日消耗</span>
                <span class="font-black text-amber-600 dark:text-amber-300">0</span>
              </div>
              <div class="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>累计消耗</span>
                <span class="font-black text-amber-600 dark:text-amber-300">0</span>
              </div>
            </div>
            <div class="mt-4 flex items-center gap-2">
              <el-button
                round
                class="flex-1 !h-10 !rounded-2xl !border-none !bg-gradient-to-r !from-indigo-500 !to-purple-600 !text-white !font-black shadow-lg shadow-indigo-500/15"
                @click="openRechargeQuick()"
              >
                立即充值
              </el-button>
              <el-button round class="!h-10 !rounded-2xl !font-black" @click="activeKey = 'orders'">订单记录</el-button>
            </div>
          </div>

          <div class="rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm p-2">
            <button type="button" class="w-full px-4 py-3 rounded-2xl flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors" @click="activeKey = 'orders'">
              <div class="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
                <el-icon><Document /></el-icon>
              </div>
              <span class="text-sm font-black text-slate-800 dark:text-slate-100">订单记录</span>
              <el-icon class="ml-auto text-slate-400"><ArrowRight /></el-icon>
            </button>
            <button type="button" class="w-full px-4 py-3 rounded-2xl flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors" @click="activeKey = 'invoice'">
              <div class="w-9 h-9 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-300 flex items-center justify-center">
                <el-icon><StarFilled /></el-icon>
              </div>
              <span class="text-sm font-black text-slate-800 dark:text-slate-100">开票申请</span>
              <el-icon class="ml-auto text-slate-400"><ArrowRight /></el-icon>
            </button>
            <button type="button" class="w-full px-4 py-3 rounded-2xl flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors" @click="activeKey = 'support'">
              <div class="w-9 h-9 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-300 flex items-center justify-center">
                <el-icon><ChatDotRound /></el-icon>
              </div>
              <span class="text-sm font-black text-slate-800 dark:text-slate-100">人工客服</span>
              <el-icon class="ml-auto text-slate-400"><ArrowRight /></el-icon>
            </button>
            <button type="button" class="w-full px-4 py-3 rounded-2xl flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors" @click="activeKey = 'tutorial'">
              <div class="w-9 h-9 rounded-2xl bg-slate-500/10 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                <el-icon><Reading /></el-icon>
              </div>
              <span class="text-sm font-black text-slate-800 dark:text-slate-100">使用教程</span>
              <el-icon class="ml-auto text-slate-400"><ArrowRight /></el-icon>
            </button>
            <button type="button" class="w-full px-4 py-3 rounded-2xl flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors" @click="activeKey = 'invite'">
              <div class="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-300 flex items-center justify-center">
                <el-icon><Share /></el-icon>
              </div>
              <span class="text-sm font-black text-slate-800 dark:text-slate-100">邀请返利</span>
              <el-icon class="ml-auto text-slate-400"><ArrowRight /></el-icon>
            </button>
            <button type="button" class="w-full px-4 py-3 rounded-2xl flex items-center gap-3 hover:bg-rose-50/70 dark:hover:bg-rose-500/10 transition-colors" @click="activeKey = 'logout'">
              <div class="w-9 h-9 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-300 flex items-center justify-center">
                <el-icon><SwitchButton /></el-icon>
              </div>
              <span class="text-sm font-black text-rose-600 dark:text-rose-300">退出登录</span>
              <el-icon class="ml-auto text-slate-400"><ArrowRight /></el-icon>
            </button>
          </div>

          <div class="rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm p-5">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                <el-icon class="text-indigo-500 dark:text-indigo-400"><InfoFilled /></el-icon>
              </div>
              <div class="min-w-0">
                <div class="text-sm font-black text-slate-800 dark:text-slate-100">提示</div>
                <div class="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  演示版：开通/续费/充值会生成本地订单并写入浏览器缓存，后续可替换为真实支付接口。
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main class="lg:col-span-8 xl:col-span-9 min-h-0 flex flex-col gap-6">
          <section v-if="activeKey === 'overview'" class="flex flex-col gap-6 min-h-0">
            <div class="rounded-3xl overflow-hidden border border-slate-200/70 dark:border-slate-800 bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm">
              <div class="p-6 md:p-7 bg-gradient-to-r from-amber-500/10 via-transparent to-cyan-500/10 relative">
                <div class="absolute -right-24 -top-24 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl"></div>
                <div class="absolute -left-28 -bottom-28 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl"></div>

                <div class="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <div class="w-9 h-9 rounded-2xl bg-amber-500/15 flex items-center justify-center">
                        <el-icon class="text-amber-600 dark:text-amber-300"><Trophy /></el-icon>
                      </div>
                      <div class="text-xl font-black text-slate-900 dark:text-white">超级会员</div>
                      <span class="text-xs font-black text-slate-500 dark:text-slate-400">已解锁 3 项权益 · 折扣率 {{ superDiscount.toFixed(1) }} 折</span>
                    </div>
                    <div class="mt-3 flex flex-wrap gap-2">
                      <span class="px-3 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">AI音乐会员</span>
                      <span class="px-3 py-1 rounded-full text-xs font-black bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25">AI短剧会员</span>
                      <span class="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">超级会员</span>
                    </div>
                    <div class="mt-4 text-sm text-slate-500 dark:text-slate-400">
                      {{ isSuperMember ? `到期时间：${formatDate(memberState.superExpireAt)}` : '未开通：开通后可享受算力豆折扣与优先权益' }}
                    </div>
                    <div class="mt-5 flex items-center gap-2">
                      <el-button round class="!h-10 !rounded-2xl !font-black" @click="activeKey = 'orders'">订单记录</el-button>
                      <el-button
                        round
                        type="primary"
                        class="!h-10 !rounded-2xl !border-none !bg-gradient-to-r !from-amber-500 !to-orange-600 !text-white !font-black shadow-lg shadow-amber-500/15"
                        @click="openPurchaseSuper()"
                      >
                        {{ isSuperMember ? '续费超级会员' : '立即开通' }}
                      </el-button>
                    </div>
                  </div>

                  <div class="shrink-0 w-full md:w-[220px]">
                    <div class="rounded-3xl bg-slate-900/80 dark:bg-slate-950/70 border border-white/10 p-5">
                      <div class="flex items-center justify-between">
                        <div class="text-xs font-black text-slate-300">可用算力豆</div>
                        <el-icon class="text-amber-300"><Coin /></el-icon>
                      </div>
                      <div class="mt-4 text-4xl font-black text-cyan-300">{{ pointsCompact }}</div>
                      <div class="mt-2 text-xs text-slate-300/80">可用算力豆</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm p-6">
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
@click="membershipType = mt.id as 'short-drama' | 'short-video' | 'music' | 'novel' | 'batch'"
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
                      <span class="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">算力豆/{{ billingCycle === 'monthly' ? '月' : '年' }}</span>
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
            </div>

            <div class="rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm p-6">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <div class="text-lg font-black text-slate-900 dark:text-white">算力豆充值套餐</div>
                  <div class="mt-1 text-sm text-slate-500 dark:text-slate-400">即时到账；订单可在“订单记录”查看</div>
                </div>
                <button type="button" class="text-sm font-black text-cyan-600 dark:text-cyan-300 hover:underline" @click="ElMessage.info('演示版：可扩展完整充值包与支付方式')">
                  查看完整充值包
                </button>
              </div>

              <div class="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  v-for="pkg in rechargePackages"
                  :key="pkg.points"
                  class="rounded-3xl p-5 border border-slate-200/70 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/20 hover:shadow-lg hover:shadow-slate-900/5 dark:hover:shadow-black/25 transition-all"
                >
                  <div class="flex items-center justify-between">
                    <div class="text-xs font-black text-slate-500 dark:text-slate-400">算力豆包</div>
                    <span v-if="pkg.badge" class="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                      {{ pkg.badge }}
                    </span>
                  </div>
                  <div class="mt-4 text-3xl font-black text-slate-900 dark:text-white">{{ formatPointsCompact(pkg.points) }}</div>
                  <div class="mt-2 text-sm font-black text-slate-700 dark:text-slate-200">
                    ¥{{ pkg.price }}
                    <span class="ml-1 text-xs font-black text-slate-400 dark:text-slate-500">{{ pkg.note }}</span>
                  </div>
                  <el-button
                    round
                    class="mt-4 w-full !h-10 !rounded-2xl !border-none !font-black !bg-gradient-to-r !from-indigo-500 !to-purple-600 !text-white shadow-lg shadow-indigo-500/15"
                    @click="openRechargePackage(pkg)"
                  >
                    立即充值
                  </el-button>
                </div>
              </div>
            </div>
          </section>

          <section v-else-if="activeKey === 'orders'" class="rounded-3xl border border-white/60 dark:border-slate-700 bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm p-6 min-h-0 flex flex-col">
            <div class="flex items-center justify-between gap-4 shrink-0">
              <div class="flex items-center gap-3 min-w-0">
                <button type="button" class="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors" @click="activeKey = 'overview'">
                  <el-icon class="text-slate-500 dark:text-slate-300"><ArrowLeft /></el-icon>
                </button>
                <div class="min-w-0">
                  <div class="text-lg font-black text-slate-800 dark:text-slate-100">订单记录</div>
                  <div class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    <span class="font-black">{{ filteredOrders.length }}</span> 条订单
                  </div>
                </div>
              </div>
              <el-button round class="!rounded-2xl !font-black" @click="activeKey = 'overview'">返回会员中心</el-button>
            </div>

            <div v-if="isDark" class="mt-5 flex items-center gap-2 shrink-0">
              <button
                type="button"
                class="px-4 py-2 rounded-2xl text-sm font-black border transition-all"
                :class="orderFilter === 'all' ? 'bg-sky-500/15 text-sky-300 border-sky-500/30' : 'bg-slate-950/10 text-slate-300 border-slate-700 hover:border-slate-500'"
                @click="orderFilter = 'all'"
              >
                全部
              </button>
              <button
                type="button"
                class="px-4 py-2 rounded-2xl text-sm font-black border transition-all"
                :class="orderFilter === 'member' ? 'bg-sky-500/15 text-sky-300 border-sky-500/30' : 'bg-slate-950/10 text-slate-300 border-slate-700 hover:border-slate-500'"
                @click="orderFilter = 'member'"
              >
                会员订单
              </button>
              <button
                type="button"
                class="px-4 py-2 rounded-2xl text-sm font-black border transition-all"
                :class="orderFilter === 'recharge' ? 'bg-sky-500/15 text-sky-300 border-sky-500/30' : 'bg-slate-950/10 text-slate-300 border-slate-700 hover:border-slate-500'"
                @click="orderFilter = 'recharge'"
              >
                算力豆订单
              </button>
            </div>

            <div class="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
              <template v-if="isDark">
                <div v-if="filteredOrders.length === 0" class="rounded-3xl border border-slate-700 bg-slate-950/20 p-10 text-center">
                  <div class="text-sm font-black text-slate-200">暂无订单</div>
                  <div class="mt-2 text-xs text-slate-400">开通会员或充值算力豆后会在此显示</div>
                  <el-button round class="mt-6 !rounded-2xl !font-black !border-none !bg-gradient-to-r !from-indigo-500 !to-purple-600 !text-white shadow-lg shadow-indigo-500/15" @click="activeKey = 'overview'">
                    去开通/充值
                  </el-button>
                </div>

                <div v-else class="flex flex-col gap-3">
                  <div v-for="o in filteredOrders" :key="o.id" class="rounded-3xl border border-slate-700 bg-slate-950/20 overflow-hidden">
                    <button
                      type="button"
                      class="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-white/5 transition-colors"
                      @click="toggleOrderExpand(o.id)"
                    >
                      <div
                        class="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                        :class="o.type === 'recharge' ? 'bg-amber-500/15 text-amber-300' : 'bg-indigo-500/15 text-indigo-300'"
                      >
                        <el-icon>
                          <Coin v-if="o.type === 'recharge'" />
                          <GoldMedal v-else />
                        </el-icon>
                      </div>

                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                          <div class="text-sm font-black text-slate-100 truncate">{{ o.type === 'recharge' ? '算力豆充值' : '会员开通' }}</div>
                          <span class="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">已支付</span>
                        </div>
                        <div class="mt-1 text-xs text-slate-400 truncate">
                          {{ o.title }} · +{{ o.bonusPoints.toLocaleString() }} 算力
                        </div>
                        <div class="mt-1 text-xs text-slate-500">{{ formatDateTime(o.createdAt) }}</div>
                      </div>

                      <div class="flex flex-col items-end gap-2 shrink-0">
                        <div class="text-base font-black text-cyan-300">¥{{ o.amount.toFixed(2) }}</div>
                        <el-icon class="text-slate-400 transition-transform" :class="expandedOrders[o.id] ? 'rotate-180' : ''"><ArrowDown /></el-icon>
                      </div>
                    </button>

                    <div v-if="expandedOrders[o.id]" class="px-5 pb-5 pt-0">
                      <div class="mt-2 rounded-3xl border border-slate-700 bg-slate-950/30 p-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div class="flex items-center justify-between gap-3">
                            <span class="text-slate-400">订单号</span>
                            <span class="text-slate-200 font-black">{{ o.id }}</span>
                          </div>
                          <div class="flex items-center justify-between gap-3">
                            <span class="text-slate-400">类型</span>
                            <span class="text-slate-200 font-black">{{ o.typeLabel }}</span>
                          </div>
                          <div class="flex items-center justify-between gap-3">
                            <span class="text-slate-400">赠送算力豆</span>
                            <span class="text-amber-200 font-black">+{{ o.bonusPoints.toLocaleString() }}</span>
                          </div>
                          <div class="flex items-center justify-between gap-3">
                            <span class="text-slate-400">支付金额</span>
                            <span class="text-cyan-200 font-black">¥{{ o.amount.toFixed(2) }}</span>
                          </div>
                        </div>
                        <div class="mt-4 flex items-center justify-end">
                          <el-button
                            round
                            class="!h-10 !rounded-2xl !border-none !bg-gradient-to-r !from-indigo-500 !to-purple-600 !text-white !font-black shadow-lg shadow-indigo-500/15"
                            @click.stop="openInvoiceFromOrder(o)"
                          >
                            申请开票
                          </el-button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else>
                <el-table
                  :data="filteredOrders"
                  height="100%"
                  class="modern-table"
                  :header-cell-style="{
                    background: 'transparent',
                    borderBottom: '1px solid rgba(148, 163, 184, 0.25)',
                    color: '#94a3b8',
                    fontWeight: 900
                  }"
                >
                  <el-table-column prop="id" label="订单号" min-width="170" />
                  <el-table-column prop="typeLabel" label="类型" min-width="120" />
                  <el-table-column prop="title" label="商品" min-width="220" />
                  <el-table-column prop="amount" label="金额" min-width="100">
                    <template #default="{ row }">
                      <span class="font-black text-slate-800 dark:text-slate-100">¥{{ row.amount }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="createdAt" label="时间" min-width="170">
                    <template #default="{ row }">
                      <span class="text-slate-500 dark:text-slate-400">{{ formatDateTime(row.createdAt) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" min-width="120" fixed="right">
                    <template #default="{ row }">
                      <el-button text type="primary" class="!font-black" @click="openInvoiceFromOrder(row)">开票</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </template>
            </div>
          </section>

          <section v-else-if="activeKey === 'invoice'" class="rounded-3xl border border-white/60 dark:border-slate-700 bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm p-6 min-h-0 flex flex-col gap-6">
            <div>
              <div class="text-lg font-black text-slate-800 dark:text-slate-100">开票申请</div>
              <div class="mt-1 text-sm text-slate-500 dark:text-slate-400">填写信息生成本地开票记录（演示版）</div>
            </div>

            <el-form :model="invoiceForm" label-position="top" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <el-form-item label="关联订单号">
                <el-select v-model="invoiceForm.orderId" placeholder="请选择订单" filterable class="w-full">
                  <el-option
                    v-for="o in memberState.orders"
                    :key="o.id"
                    :label="`${o.id} - ${o.title}`"
                    :value="o.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="发票抬头">
                <el-input v-model="invoiceForm.title" placeholder="个人/公司名称" />
              </el-form-item>
              <el-form-item label="税号（选填）">
                <el-input v-model="invoiceForm.taxNo" placeholder="公司税号/统一社会信用代码" />
              </el-form-item>
              <el-form-item label="接收邮箱">
                <el-input v-model="invoiceForm.email" placeholder="用于接收电子发票" />
              </el-form-item>
              <el-form-item class="md:col-span-2">
                <el-button
                  round
                  class="!h-11 !rounded-2xl !border-none !bg-gradient-to-r !from-indigo-500 !to-purple-600 !text-white !font-black shadow-lg shadow-indigo-500/15"
                  @click="submitInvoice()"
                >
                  提交申请
                </el-button>
              </el-form-item>
            </el-form>

            <div class="rounded-3xl border border-slate-200/70 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-950/20 p-5 min-h-0 flex-1 overflow-hidden">
              <div class="flex items-center justify-between">
                <div class="text-sm font-black text-slate-800 dark:text-slate-100">申请记录</div>
                <el-tag size="small" effect="plain" class="!rounded-lg">本地缓存</el-tag>
              </div>
              <div class="mt-4 min-h-0 h-full overflow-y-auto pr-1">
                <template v-if="isDark">
                  <div v-if="memberState.invoices.length === 0" class="rounded-3xl border border-slate-700 bg-slate-950/20 p-8 text-center">
                    <div class="text-sm font-black text-slate-400">暂无开票记录</div>
                  </div>
                  <div v-else class="flex flex-col gap-3">
                    <div v-for="inv in memberState.invoices" :key="inv.orderId" class="rounded-3xl border border-slate-700 bg-slate-950/20 p-5 flex items-center gap-4">
                      <div class="w-11 h-11 rounded-2xl bg-purple-500/15 text-purple-300 flex items-center justify-center shrink-0">
                        <el-icon><StarFilled /></el-icon>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                          <div class="text-sm font-black text-slate-100 truncate">{{ inv.title }}</div>
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">申请成功</span>
                        </div>
                        <div class="mt-1 text-xs text-slate-400 truncate">订单号: {{ inv.orderId }}</div>
                        <div class="mt-1 text-xs text-slate-500">{{ formatDateTime(inv.createdAt) }}</div>
                      </div>
                      <div class="text-right hidden sm:block">
                        <div class="text-xs text-slate-300 font-bold mb-1">{{ inv.email }}</div>
                        <div class="text-[10px] text-slate-500 uppercase tracking-wider">接收邮箱</div>
                      </div>
                    </div>
                  </div>
                </template>
                <el-table 
                  v-else
                  :data="memberState.invoices" 
                  height="100%" 
                  class="modern-table"
                  :header-cell-style="{
                    background: 'transparent',
                    borderBottom: '1px solid rgba(148, 163, 184, 0.25)',
                    color: '#64748b',
                    fontWeight: 900
                  }"
                >
                  <el-table-column prop="orderId" label="订单号" min-width="170" />
                  <el-table-column prop="title" label="抬头" min-width="180" />
                  <el-table-column prop="email" label="邮箱" min-width="200" />
                  <el-table-column prop="createdAt" label="时间" min-width="170">
                    <template #default="{ row }">
                      <span class="text-slate-500">{{ formatDateTime(row.createdAt) }}</span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </section>

          <section v-else-if="activeKey === 'support'" class="rounded-3xl border border-white/60 dark:border-slate-700 bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm p-6">
            <div class="text-lg font-black text-slate-800 dark:text-slate-100">人工客服</div>
            <div class="mt-1 text-sm text-slate-500 dark:text-slate-400">这里提供客服入口（演示版占位）</div>

            <div class="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="rounded-3xl border border-slate-200/70 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-950/20 p-5">
                <div class="flex items-center gap-3">
                  <div class="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                    <el-icon class="text-indigo-500 dark:text-indigo-400"><ChatDotRound /></el-icon>
                  </div>
                  <div>
                    <div class="text-sm font-black text-slate-800 dark:text-slate-100">在线工单</div>
                    <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">提交问题与截图，支持追踪处理进度</div>
                  </div>
                </div>
                <el-button round class="mt-4 !rounded-2xl !font-black" type="primary" @click="ElMessage.info('演示版：此处接入工单系统/IM')">去提交</el-button>
              </div>

              <div class="rounded-3xl border border-slate-200/70 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-950/20 p-5">
                <div class="flex items-start gap-4">
                  <div class="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 shrink-0 shadow-sm group relative">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=智影-专属顾问" alt="QR Code" class="w-full h-full rounded-lg object-cover" />
                    <div class="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900">
                      <el-icon size="12"><ChatDotRound /></el-icon>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-black text-slate-800 dark:text-slate-100">专属顾问</div>
                    <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">扫码添加企业微信，获取 1对1 优先支持与排障建议</div>
                    
                    <div class="mt-3 flex flex-col gap-1.5">
                      <div class="flex items-center gap-2 group cursor-pointer" @click="copyText('智影-小助手')">
                        <div class="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                          <el-icon size="12"><ChatDotRound /></el-icon>
                        </div>
                        <span class="text-[11px] font-bold text-slate-600 dark:text-slate-300">智影-小助手</span>
                        <el-icon size="10" class="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"><CopyDocument /></el-icon>
                      </div>
                      <div class="flex items-center gap-2 group cursor-pointer" @click="copyText('400-888-6666')">
                        <div class="w-5 h-5 rounded-md bg-sky-500/10 text-sky-600 flex items-center justify-center">
                          <el-icon size="12"><Iphone /></el-icon>
                        </div>
                        <span class="text-[11px] font-bold text-slate-600 dark:text-slate-300">400-888-6666</span>
                        <el-icon size="10" class="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"><Phone /></el-icon>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section v-else-if="activeKey === 'tutorial'" class="rounded-3xl border border-white/60 dark:border-slate-700 bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm p-6">
            <div class="text-lg font-black text-slate-800 dark:text-slate-100">使用教程</div>
            <div class="mt-1 text-sm text-slate-500 dark:text-slate-400">快速上手：开通会员、充值算力、查看订单与开票</div>

            <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="step in tutorialSteps" :key="step.title" class="rounded-3xl border border-slate-200/70 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-950/20 p-5">
                <div class="flex items-center gap-3">
                  <div class="w-11 h-11 rounded-2xl flex items-center justify-center shadow-inner" :class="step.iconBg">
                    <el-icon class="text-white"><component :is="step.icon" /></el-icon>
                  </div>
                  <div class="min-w-0">
                    <div class="text-sm font-black text-slate-800 dark:text-slate-100 truncate">{{ step.title }}</div>
                    <div class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{{ step.desc }}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          
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
          
          <section v-else-if="activeKey === 'logout'" class="rounded-3xl border border-white/60 dark:border-slate-700 bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm p-6">
            <div class="text-lg font-black text-slate-800 dark:text-slate-100">退出登录</div>
            <div class="mt-1 text-sm text-slate-500 dark:text-slate-400">确认退出后将返回登录页</div>
            <el-button
              round
              class="mt-6 !h-11 !rounded-2xl !border-none !bg-gradient-to-r !from-rose-500 !to-red-600 !text-white !font-black shadow-lg shadow-rose-500/20"
              @click="doLogout()"
            >
              确认退出
            </el-button>
          </section>
        </main>
      </div>
    </div>

    <el-dialog v-model="purchaseDialog.visible" width="520px" align-center class="purchase-dialog">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <el-icon class="text-white"><Goods /></el-icon>
          </div>
          <div class="min-w-0">
            <div class="text-base font-black text-slate-800 dark:text-slate-100 truncate">确认支付</div>
            <div class="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{{ purchaseDialog.summary }}</div>
          </div>
        </div>
      </template>

      <div class="rounded-3xl border border-slate-200/70 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-950/20 p-5">
        <div class="flex items-center justify-between">
          <div class="text-sm font-black text-slate-800 dark:text-slate-100">支付金额</div>
          <div class="text-2xl font-black text-slate-900 dark:text-white">¥{{ purchaseDialog.amount }}</div>
        </div>
        <div v-if="purchaseDialog.bonusPoints" class="mt-3 flex items-center justify-between">
          <div class="text-sm font-black text-slate-800 dark:text-slate-100">赠送算力豆</div>
          <div class="text-sm font-black text-amber-600 dark:text-amber-300">+{{ purchaseDialog.bonusPoints.toLocaleString() }}</div>
        </div>
        <div class="mt-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          演示版支付：点击“完成支付”将自动生成一条本地订单，并更新会员/算力豆状态。
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <el-button round class="!rounded-2xl !font-black" @click="purchaseDialog.visible = false">取消</el-button>
          <el-button
            round
            type="primary"
            class="!rounded-2xl !border-none !bg-gradient-to-r !from-indigo-500 !to-purple-600 !text-white !font-black shadow-lg shadow-indigo-500/15"
            @click="confirmPurchase()"
          >
            完成支付
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 产品设计说明弹窗 -->
    <ProductDesignDialog 
      v-model="showDesignDialog" 
      id="member-center"
      :default-content="memberCenterDesign"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ProductDesignDialog from '@/components/Common/ProductDesignDialog.vue'
import { useUserStore } from '@/store/user'
import { useThemeStore } from '@/store/theme'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChatDotRound,
  Coin,
  CopyDocument,
  Document,
  Goods,
  GoldMedal,
  Headset,
  Iphone,
  InfoFilled,
  Picture,
  Phone,
  Reading,
  StarFilled,
  Share,
  SwitchButton,
  Trophy,
  User,
  Check
} from '@element-plus/icons-vue'

type NavKey = 'overview' | 'orders' | 'invoice' | 'support' | 'tutorial' | 'logout' | 'invite'

type OrderType = 'member' | 'recharge'

interface LocalOrder {
  id: string
  type: OrderType
  typeLabel: string
  title: string
  amount: number
  bonusPoints: number
  createdAt: number
}

interface LocalInvoice {
  orderId: string
  title: string
  taxNo: string
  email: string
  createdAt: number
}

interface MemberState {
  points: number
  superExpireAt: number
  planExpireAt: Record<string, number>
  orders: LocalOrder[]
  invoices: LocalInvoice[]
}

interface MemberPlan {
  id: string
  title: string
  priceMonthly: number
  bonusPoints: number
  icon: any
  accent: 'indigo' | 'sky' | 'emerald' | 'amber'
  features: string[]
}

interface RechargePackage {
  points: number
  price: number
  note: string
  badge?: string
}

const STORAGE_KEY = 'member-center-state-v1'

const router = useRouter()
const userStore = useUserStore()
const themeStore = useThemeStore()

const showDesignDialog = ref(false)

const memberCenterDesign = {
  title: '会员中心',
  location: '用户管理个人会员权益、算力豆余额及订单记录的核心枢纽，承载 C 端变现转化的关键功能。',
  layout: [
    '**左侧导航栏**：采用玻璃拟态卡片，集成会员权益、算力管理、订单记录、开票申请、人工客服、使用教程、邀请返利及退出登录等入口。',
    '**右侧内容区**：动态加载不同功能模块，默认显示“我的会员中心”总览。',
    '**总览页头部**：展示超级会员状态、核心权益标签及可用算力豆大数值显示。',
    '**会员套餐区**：支持“连续包月/按年购买”切换，并按业务线（短剧、视频、音乐、小说）分类展示不同档位套餐。',
    '**算力包充值**：提供不同额度的算力豆充值包，并带有折扣标签提示。'
  ],
  interactions: [
    '**套餐切换交互**：点击不同业务线标签，下方的会员套餐卡片将实时更新，伴随平滑的过渡动画。',
    '**支付确认弹窗**：点击“选择计划”或“立即充值”触发确认支付弹窗，展示金额及赠送算力豆详情。',
    '**订单记录详情**：点击订单列表项可展开查看详细订单号及开票入口。',
    '**积分兑换**：在邀请返利页面，支持用户将积累的积分按 100:10 比例兑换为算力豆。'
  ]
}

const activeKey = ref<NavKey>('overview')
const orderFilter = ref<OrderType | 'all'>('all')

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
    '支持创建与管理团队，并可分配团队算力豆',
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
  const inviteLink = `${window.location.origin}/auth/login?inviteCode=${inviteCode.value}`
  navigator.clipboard.writeText(inviteLink)
  ElMessage.success('邀请链接已复制到剪贴板')
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

const expandedOrders = reactive<Record<string, boolean>>({})
const selectedMemberKey = ref<'music' | 'short-drama' | 'super'>('super')

const isDark = computed(() => themeStore.isDark)

const memberState = reactive<MemberState>({
  points: 0,
  superExpireAt: 0,
  planExpireAt: {},
  orders: [],
  invoices: []
})

const isSuperMember = computed(() => {
  return memberState.superExpireAt > Date.now()
})

const filteredOrders = computed(() => {
  if (orderFilter.value === 'all') return memberState.orders
  return memberState.orders.filter(o => o.type === orderFilter.value)
})

const superDiscount = computed(() => (isSuperMember.value ? 7.5 : 10))

const formatPointsCompact = (points: number) => {
  if (points >= 10000) {
    const v = (points / 10000).toFixed(1).replace(/\.0$/, '')
    return `${v}w`
  }
  return points.toLocaleString()
}

const pointsCompact = computed(() => formatPointsCompact(memberState.points))

const giftPointsTotal = computed(() => memberState.orders.filter(o => o.type === 'member').reduce((acc, o) => acc + (o.bonusPoints || 0), 0))
const rechargePointsTotal = computed(() => memberState.orders.filter(o => o.type === 'recharge').reduce((acc, o) => acc + (o.bonusPoints || 0), 0))

const getPlanExpireAt = (planId: string) => {
  return memberState.planExpireAt?.[planId] || 0
}

const isPlanActive = (planId: string) => {
  return getPlanExpireAt(planId) > Date.now()
}

const memberPlans = computed<MemberPlan[]>(() => {
  return [
    {
      id: 'short-drama',
      title: 'AI短剧会员',
      priceMonthly: 98,
      bonusPoints: 1000,
      icon: GoldMedal,
      accent: 'indigo',
      features: ['无限AI短剧生成', '高质量视频输出', '自定义角色风格']
    },
    {
      id: 'music',
      title: 'AI音乐会员',
      priceMonthly: 88,
      bonusPoints: 1000,
      icon: Headset,
      accent: 'sky',
      features: ['无限AI音乐生成', '多风格音乐创作', '高品质音频导出']
    },
    {
      id: 'copywriting',
      title: 'AI图文会员',
      priceMonthly: 78,
      bonusPoints: 1000,
      icon: Document,
      accent: 'emerald',
      features: ['无限AI图文生成', 'AI绘画全功能', '多格式内容输出']
    },
    {
      id: 'image',
      title: 'AI碎片会员',
      priceMonthly: 68,
      bonusPoints: 1000,
      icon: Picture,
      accent: 'amber',
      features: ['专属AI角色定制', '无限互动对话', '情绪记忆保存']
    }
  ]
})

const planCards = computed(() => {
  return memberPlans.value.map((p) => {
    const expireAt = getPlanExpireAt(p.id)
    const active = expireAt > Date.now()
    return {
      ...p,
      expireAt,
      active,
      ctaText: active ? '续费' : '开通'
    }
  })
})

const rechargePackages = computed<RechargePackage[]>(() => {
  return [
    { points: 100, price: 10, note: '标准价' },
    { points: 500, price: 45, note: '9折' },
    { points: 1200, price: 96, note: '8折', badge: '热门' },
    { points: 3000, price: 210, note: '7折', badge: '最划算' }
  ]
})

const tutorialSteps = computed(() => {
  return [
    { title: '开通会员', desc: '在“我的会员”选择单品或超级会员，完成支付后立即生效。', icon: GoldMedal, iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600' },
    { title: '充值算力', desc: '选择算力豆包一键充值，算力豆用于生成/优化/素材等功能。', icon: Coin, iconBg: 'bg-gradient-to-br from-indigo-500 to-purple-600' },
    { title: '查看订单', desc: '在“订单记录”查看开通/充值记录，并可快速发起开票。', icon: Document, iconBg: 'bg-gradient-to-br from-sky-500 to-indigo-600' },
    { title: '开票申请', desc: '选择关联订单填写抬头与邮箱提交申请，便于财务归档。', icon: StarFilled, iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600' }
  ]
})

const purchaseDialog = reactive<{
  visible: boolean
  summary: string
  amount: number
  bonusPoints: number
  payload: { type: OrderType; title: string; amount: number; bonusPoints: number; effect?: () => void } | null
}>({
  visible: false,
  summary: '',
  amount: 0,
  bonusPoints: 0,
  payload: null
})

const invoiceForm = reactive({
  orderId: '',
  title: '',
  taxNo: '',
  email: ''
})

const loadState = () => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const monthMs = 30 * 24 * 60 * 60 * 1000
    memberState.points = 11000
    memberState.superExpireAt = Date.now() + monthMs
    memberState.planExpireAt = {
      'short-drama': Date.now() + monthMs,
      music: Date.now() + monthMs
    }
    memberState.orders = []
    memberState.invoices = []
    return
  }

  try {
    const parsed = JSON.parse(raw) as Partial<MemberState>
    memberState.points = typeof parsed.points === 'number' ? parsed.points : 0
    memberState.superExpireAt = typeof parsed.superExpireAt === 'number' ? parsed.superExpireAt : 0
    memberState.planExpireAt = parsed.planExpireAt && typeof parsed.planExpireAt === 'object' ? (parsed.planExpireAt as Record<string, number>) : {}
    memberState.orders = Array.isArray(parsed.orders) ? (parsed.orders as LocalOrder[]) : []
    memberState.invoices = Array.isArray(parsed.invoices) ? (parsed.invoices as LocalInvoice[]) : []
  } catch {
    memberState.points = 0
    memberState.superExpireAt = 0
    memberState.planExpireAt = {}
    memberState.orders = []
    memberState.invoices = []
  }
}

const saveState = () => {
  const toSave: MemberState = {
    points: memberState.points,
    superExpireAt: memberState.superExpireAt,
    planExpireAt: memberState.planExpireAt,
    orders: memberState.orders,
    invoices: memberState.invoices
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
}

watch(
  () => ({ ...memberState, orders: memberState.orders.length, invoices: memberState.invoices.length }),
  () => saveState(),
  { deep: true }
)

onMounted(() => {
  loadState()
})

const formatDate = (timestamp: number) => {
  if (!timestamp) return '-'
  const d = new Date(timestamp)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const formatDateTime = (timestamp: number) => {
  const d = new Date(timestamp)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm}`
}

const genOrderId = () => {
  return `OD${Date.now()}${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')}`
}

const openPurchaseSuper = () => {
  const amount = 298
  const bonusPoints = 3000
  const nextExpireAt = Date.now() + 30 * 24 * 60 * 60 * 1000
  purchaseDialog.summary = '超级会员（按月）'
  purchaseDialog.amount = amount
  purchaseDialog.bonusPoints = bonusPoints
  purchaseDialog.payload = {
    type: 'member',
    title: '超级会员（按月）',
    amount,
    bonusPoints,
    effect: () => {
      memberState.superExpireAt = Math.max(memberState.superExpireAt, Date.now())
      memberState.superExpireAt = memberState.superExpireAt + 30 * 24 * 60 * 60 * 1000
      memberState.points += bonusPoints
      if (memberState.superExpireAt < nextExpireAt) memberState.superExpireAt = nextExpireAt
    }
  }
  purchaseDialog.visible = true
}

const openPurchasePlan = (plan: MemberPlan) => {
  purchaseDialog.summary = `${plan.title}（按月）`
  purchaseDialog.amount = plan.priceMonthly
  purchaseDialog.bonusPoints = plan.bonusPoints
  purchaseDialog.payload = {
    type: 'member',
    title: `${plan.title}（按月）`,
    amount: plan.priceMonthly,
    bonusPoints: plan.bonusPoints,
    effect: () => {
      const monthMs = 30 * 24 * 60 * 60 * 1000
      const currentExpireAt = getPlanExpireAt(plan.id)
      memberState.planExpireAt[plan.id] = Math.max(currentExpireAt, Date.now()) + monthMs
      memberState.points += plan.bonusPoints
    }
  }
  purchaseDialog.visible = true
}

const openRechargePackage = (pkg: RechargePackage) => {
  purchaseDialog.summary = `算力豆充值 ${pkg.points.toLocaleString()}`
  purchaseDialog.amount = pkg.price
  purchaseDialog.bonusPoints = pkg.points
  purchaseDialog.payload = {
    type: 'recharge',
    title: `算力豆充值 ${pkg.points.toLocaleString()}`,
    amount: pkg.price,
    bonusPoints: pkg.points,
    effect: () => {
      memberState.points += pkg.points
    }
  }
  purchaseDialog.visible = true
}

const openRechargeQuick = () => {
  openRechargePackage(rechargePackages.value[2])
}

const confirmPurchase = () => {
  if (!purchaseDialog.payload) return
  const payload = purchaseDialog.payload
  payload.effect?.()

  const order: LocalOrder = {
    id: genOrderId(),
    type: payload.type,
    typeLabel: payload.type === 'member' ? '会员' : '充值',
    title: payload.title,
    amount: payload.amount,
    bonusPoints: payload.bonusPoints,
    createdAt: Date.now()
  }
  memberState.orders = [order, ...memberState.orders]

  purchaseDialog.visible = false
  purchaseDialog.payload = null
  ElMessage.success('支付完成：状态已更新（演示版）')
}

const submitInvoice = () => {
  if (!invoiceForm.orderId) return ElMessage.warning('请选择关联订单')
  if (!invoiceForm.title.trim()) return ElMessage.warning('请输入发票抬头')
  if (!invoiceForm.email.trim()) return ElMessage.warning('请输入接收邮箱')

  memberState.invoices = [
    {
      orderId: invoiceForm.orderId,
      title: invoiceForm.title.trim(),
      taxNo: invoiceForm.taxNo.trim(),
      email: invoiceForm.email.trim(),
      createdAt: Date.now()
    },
    ...memberState.invoices
  ]
  invoiceForm.orderId = ''
  invoiceForm.title = ''
  invoiceForm.taxNo = ''
  invoiceForm.email = ''
  ElMessage.success('已提交开票申请（演示版）')
}

const openInvoiceFromOrder = (order: LocalOrder) => {
  activeKey.value = 'invoice'
  invoiceForm.orderId = order.id
}

const toggleOrderExpand = (orderId: string) => {
  expandedOrders[orderId] = !expandedOrders[orderId]
}

const showContactInfo = ref(false)

const copyText = (text: string) => {
  navigator.clipboard.writeText(text)
  ElMessage.success(`已复制: ${text}`)
}

const doLogout = async () => {
  await userStore.logout()
  router.push('/auth/login')
}
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
</style>
