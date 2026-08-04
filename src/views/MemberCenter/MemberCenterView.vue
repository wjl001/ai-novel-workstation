<template>
  <div class="member-center-layout p-6 pb-10 bg-slate-50 dark:bg-slate-950 h-full relative overflow-y-auto flex flex-col">
    <div class="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-amber-100/40 dark:from-amber-900/15 to-transparent pointer-events-none"></div>
    <div class="absolute -top-28 -right-28 w-[520px] h-[520px] bg-indigo-200/35 dark:bg-indigo-900/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute top-32 -left-32 w-[420px] h-[420px] bg-purple-200/25 dark:bg-purple-900/15 rounded-full blur-3xl pointer-events-none"></div>

    <div class="w-full relative z-10 flex flex-col flex-1 min-h-0">
      <div class="mb-6 px-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
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
            <button 
              @click="showRulesDialog = true"
              class="ml-1 h-7 px-3 flex items-center gap-2 rounded-full font-bold text-[10px] shadow-sm border transition-all duration-300 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/50 hover:border-cyan-400 dark:hover:border-cyan-500/50"
            >
              <el-icon :size="12"><Reading /></el-icon>
              <span>算力豆规则说明</span>
            </button>
            <button 
              @click="showModelPriceDialog = true"
              class="ml-1 h-7 px-3 flex items-center gap-2 rounded-full font-bold text-[10px] shadow-sm border transition-all duration-300 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/50 hover:border-purple-400 dark:hover:border-purple-500/50"
            >
              <el-icon :size="12"><PriceTag /></el-icon>
              <span>模型价格说明</span>
            </button>
          </h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-2 ml-13 font-medium">管理会员、算力豆与充值，解锁更强创作能力</p>
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
                <div class="text-[11px] font-bold opacity-80">算力豆/会员/充值控制台</div>
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
                超级会员
              </button>
            </div>
          </div>

          <div class="rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm p-5">
            <div class="flex items-center justify-between">
              <div class="text-sm font-black text-slate-800 dark:text-slate-100">算力管理</div>
              <div class="text-xs font-black text-slate-400 dark:text-slate-500">总可用 {{ formatPointsCompact(totalAvailablePoints) }}</div>
            </div>
            <div class="mt-3 flex items-baseline gap-1">
              <span class="text-3xl font-black text-slate-900 dark:text-white">{{ formatPointsCompact(totalAvailablePoints) }}</span>
              <span class="text-xs font-bold text-slate-400 dark:text-slate-500">算力豆</span>
            </div>
            <div class="mt-4 flex flex-col gap-3">
              <div class="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100/70 dark:border-indigo-800/30">
                <div class="w-8 h-8 rounded-xl bg-indigo-500/15 flex items-center justify-center shrink-0">
                  <el-icon class="text-indigo-500 dark:text-indigo-300"><Calendar /></el-icon>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <span class="text-[11px] font-black text-indigo-600 dark:text-indigo-300">会员算力豆</span>
                    <div class="flex items-center gap-3">
                      <span v-if="remainingDays > 0" class="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        有效期 {{ formatDate(pointsExpireAt) }} · 剩 {{ remainingDays }} 天
                      </span>
                      <span class="text-sm font-black text-slate-900 dark:text-white">{{ formatPointsCompact(memberPoints) }}</span>
                    </div>
                  </div>
                  <div class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">会员套餐赠送 · 随会员到期清零 · 升级时算力豆合并</div>
                </div>
              </div>
              <div class="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100/70 dark:border-emerald-800/30">
                <div class="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                  <el-icon class="text-emerald-500 dark:text-emerald-300"><Coin /></el-icon>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <span class="text-[11px] font-black text-emerald-600 dark:text-emerald-300">充值算力豆</span>
                    <span class="text-sm font-black text-slate-900 dark:text-white">{{ formatPointsCompact(rechargeBalance) }}</span>
                  </div>
                  <div class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">充值购买 · 永久有效 · 会员过期后仍可继续使用</div>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm p-2">
            <button type="button" class="w-full px-4 py-3 rounded-2xl flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors" @click="activeKey = 'recharge-records'">
              <div class="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
                <el-icon><Document /></el-icon>
              </div>
              <span class="text-sm font-black text-slate-800 dark:text-slate-100">充值记录</span>
              <el-icon class="ml-auto text-slate-400"><ArrowRight /></el-icon>
            </button>
            <button type="button" class="w-full px-4 py-3 rounded-2xl flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors" @click="activeKey = 'consumption'">
              <div class="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-300 flex items-center justify-center">
                <el-icon><Coin /></el-icon>
              </div>
              <span class="text-sm font-black text-slate-800 dark:text-slate-100">算力消耗明细</span>
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
                      <span class="px-3 py-1 rounded-full text-xs font-black bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25">AI短剧会员</span>
                      <span class="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">超级会员</span>
                    </div>
                    <div class="mt-4 text-sm text-slate-500 dark:text-slate-400">
                      {{ isSuperMember ? `到期时间：${formatDate(memberState.superExpireAt)}` : '未开通：开通后可享受算力豆折扣与优先权益' }}
                    </div>
                    <div class="mt-5 flex items-center gap-2">
                      <el-button round class="!h-10 !rounded-2xl !font-black" @click="activeKey = 'recharge-records'">充值记录</el-button>
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
                        <div class="text-xs font-black text-slate-300">总可用算力豆</div>
                        <el-icon class="text-amber-300"><Coin /></el-icon>
                      </div>
                      <div class="mt-4 text-4xl font-black text-cyan-300">{{ formatPointsCompact(totalAvailablePoints) }}</div>
                      <div class="mt-3 space-y-1.5">
                        <div class="flex items-center justify-between text-xs">
                          <span class="text-slate-400 font-bold flex items-center gap-1">
                            <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>会员豆
                          </span>
                          <span class="text-cyan-300 font-black">{{ formatPointsCompact(memberPoints) }}</span>
                        </div>
                        <div class="flex items-center justify-between text-xs">
                          <span class="text-slate-400 font-bold flex items-center gap-1">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>充值豆
                          </span>
                          <span class="text-cyan-300 font-black">{{ formatPointsCompact(rechargeBalance) }}</span>
                        </div>
                      </div>
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
              </div>

              <div class="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <div
                  v-for="tier in activeTiers"
                  :key="tier.id"
                  class="relative rounded-3xl border transition-all flex flex-col cursor-pointer hover:translate-y-[-4px]"
                  :class="[
                    selectedTierId === tier.id 
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-xl shadow-indigo-500/10' 
                      : (tier.id === 'pro' || tier.id === 'studio' 
                          ? 'border-indigo-500/30 bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900 shadow-lg shadow-indigo-500/5' 
                          : 'border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900')
                  ]"
                  @click="selectedTierId = tier.id"
                >
                  <div v-if="tier.badge" class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[11px] font-black shadow-sm"
                    :class="tier.id === 'studio' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'">
                    {{ tier.badge }}
                  </div>
                  
                  <div class="p-6 pb-4">
                    <div class="text-xl font-black text-slate-900 dark:text-white text-center">{{ tier.name }}</div>
                    
                    <div class="mt-4 flex items-baseline justify-center gap-1">
                      <span class="text-sm font-black text-slate-500 dark:text-slate-400">¥</span>
                      <span class="text-4xl font-black text-slate-900 dark:text-white">{{ billingCycle === 'monthly' ? tier.priceMonthly : tier.priceYearly }}</span>
                      <span class="text-sm font-black text-slate-500 dark:text-slate-400">/{{ billingCycle === 'monthly' ? '月' : '年' }}</span>
                    </div>
                    
                    <!-- <div class="mt-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 text-center">
                      <br/>
                      次{{ billingCycle === 'monthly' ? '月' : '年' }}按¥{{ billingCycle === 'monthly' ? tier.priceMonthly : tier.priceYearly }}/{{ billingCycle === 'monthly' ? '月' : '年' }}自动续费
                    </div> -->

                    <el-button
                      round
                      class="mt-5 w-full !h-11 !rounded-2xl !font-black !border-none transition-all"
                      :class="tier.id === 'pro' || tier.id === 'studio' ? '!bg-gradient-to-r !from-indigo-500 !to-purple-600 !text-white shadow-lg shadow-indigo-500/15' : '!bg-slate-100 dark:!bg-slate-800 !text-slate-800 dark:!text-slate-100 hover:!bg-slate-200 dark:hover:!bg-slate-700'"
                      @click="openPurchaseTier(tier)"
                    >
                      选择计划
                    </el-button>
                    
                    <div class="mt-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 p-3 text-center border border-indigo-100 dark:border-indigo-800/30">
                      <div class="flex items-center justify-center gap-1">
                        <span class="text-[10px] font-black text-indigo-500 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/50 px-1.5 py-0.5 rounded">算力豆</span>
                        <span class="text-sm font-black" :class="tier.id === 'studio' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'">{{ tier.points.toLocaleString() }}</span>
                      </div>
                      <div class="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1">随会员周期发放，到期清零</div>
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
                  <div class="mt-1 text-sm text-slate-500 dark:text-slate-400">即时到账 · 充值获得「长效算力豆」永久有效 · 订单可在“充值记录”查看</div>
                </div>
                <button type="button" class="text-sm font-black text-cyan-600 dark:text-cyan-300 hover:underline" @click="ElMessage.info('演示版：可扩展完整充值包与支付方式')">
                  查看完整充值包
                </button>
              </div>

              <div class="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                  <div class="mt-4 text-2xl font-black text-slate-900 dark:text-white">{{ formatPointsCompact(pkg.points) }}</div>
                  <div class="mt-2 text-sm font-black text-slate-700 dark:text-slate-200">
                    ¥{{ pkg.price.toLocaleString() }}
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

                <div class="rounded-3xl p-5 border border-slate-200/70 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/20 hover:shadow-lg hover:shadow-slate-900/5 dark:hover:shadow-black/25 transition-all">
                  <div class="flex items-center justify-between">
                    <div class="text-xs font-black text-slate-500 dark:text-slate-400">自定义金额</div>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/25">
                      灵活充值
                    </span>
                  </div>
                  <div class="mt-4 flex items-center gap-2">
                    <span class="text-2xl font-black text-slate-900 dark:text-white">¥</span>
                    <el-input
                      v-model.number="customRechargeAmount"
                      type="number"
                      min="100"
                      placeholder="最低100"
                      class="flex-1 !rounded-2xl !h-8"
                    />
                  </div>
                  <div class="mt-2 text-xs font-black text-slate-400 dark:text-slate-500">
                    获{{ (customRechargeAmount || 100) * 100 }}算力豆 · 最低100元起
                  </div>
                  <el-button
                    round
                    class="mt-3 w-full !h-10 !rounded-2xl !border-none !font-black !bg-gradient-to-r !from-cyan-500 !to-blue-600 !text-white shadow-lg shadow-cyan-500/15"
                    :disabled="!customRechargeAmount || customRechargeAmount < 100"
                    @click="openRechargeCustom"
                  >
                    立即充值
                  </el-button>
                </div>
              </div>
            </div>
          </section>

          <section v-else-if="activeKey === 'recharge-records'" class="rounded-3xl border border-white/60 dark:border-slate-700 bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm p-6 min-h-0 flex flex-col">
            <div class="flex items-center justify-between gap-4 shrink-0">
              <div class="flex items-center gap-3 min-w-0">
                <button type="button" class="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors" @click="activeKey = 'overview'">
                  <el-icon class="text-slate-500 dark:text-slate-300"><ArrowLeft /></el-icon>
                </button>
                <div class="min-w-0">
                  <div class="text-lg font-black text-slate-800 dark:text-slate-100">充值记录</div>
                  <div class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    <span class="font-black">{{ filteredOrders.length }}</span> 条充值记录
                  </div>
                </div>
              </div>
              <el-button round class="!rounded-2xl !font-black" @click="activeKey = 'overview'">返回会员中心</el-button>
            </div>

            <div class="mt-5 flex flex-col md:flex-row items-center gap-4 shrink-0">
              <div class="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl">
                <button
                  type="button"
                  class="px-4 py-2 rounded-xl text-sm font-black transition-all"
                  :class="orderFilter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
                  @click="orderFilter = 'all'"
                >
                  全部
                </button>
                <button
                  type="button"
                  class="px-4 py-2 rounded-xl text-sm font-black transition-all"
                  :class="orderFilter === 'member' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
                  @click="orderFilter = 'member'"
                >
                  充值套餐记录
                </button>
                <button
                  type="button"
                  class="px-4 py-2 rounded-xl text-sm font-black transition-all"
                  :class="orderFilter === 'recharge' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
                  @click="orderFilter = 'recharge'"
                >
                  充值算力豆记录
                </button>
              </div>
              
              <div class="flex-1 w-full md:w-auto">
                <el-input
                  v-model="rechargeSearchQuery"
                  placeholder="搜索订单号或商品名称"
                  class="modern-input"
                  clearable
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
              </div>
            </div>

            <div class="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
              <template v-if="isDark">
                <div v-if="filteredOrders.length === 0" class="rounded-3xl border border-slate-700 bg-slate-950/20 p-10 text-center">
                  <div class="text-sm font-black text-slate-200">暂无记录</div>
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

          <section v-else-if="activeKey === 'consumption'" class="rounded-3xl border border-white/60 dark:border-slate-700 bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm p-6 min-h-0 flex flex-col">
            <div class="flex items-center justify-between gap-4 shrink-0">
              <div class="flex items-center gap-3 min-w-0">
                <button type="button" class="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors" @click="activeKey = 'overview'">
                  <el-icon class="text-slate-500 dark:text-slate-300"><ArrowLeft /></el-icon>
                </button>
                <div class="min-w-0">
                  <div class="text-lg font-black text-slate-800 dark:text-slate-100">算力消耗明细</div>
                  <div class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    <span class="font-black">{{ filteredConsumptionList.length }}</span> 条消耗记录
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <el-button round class="!rounded-2xl !font-black" @click="exportConsumption">导出报表</el-button>
                <el-button round class="!rounded-2xl !font-black" @click="activeKey = 'overview'">返回会员中心</el-button>
              </div>
            </div>

            <!-- 统计信息卡片 -->
            <div class="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 shrink-0 px-1">
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
                v-model:current-page="consumptionCurrentPage"
                v-model:page-size="consumptionPageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="filteredConsumptionList.length"
                layout="total, sizes, prev, pager, next, jumper"
                class="modern-pagination"
                background
              />
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
              <div class="mt-1 text-sm text-slate-500 dark:text-slate-400">邀请好友注册，双方均可获得丰厚算力豆奖励。</div>
            </div>

            <div class="rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/20 p-6 flex flex-col items-center justify-center py-10">
              <div class="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-4">
                <el-icon class="text-white text-3xl"><Share /></el-icon>
              </div>
              <h3 class="text-xl font-black text-slate-900 dark:text-white mb-2">生成您的专属邀请码</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 text-center max-w-md mb-6">
                将邀请码分享给新用户。每成功邀请一位好友，您将获得 <span class="font-black text-amber-500">20 算力豆</span>奖励。
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
              <div class="text-sm font-black text-slate-800 dark:text-slate-100 mb-4">领取邀请奖励</div>
              <div class="flex items-center gap-4">
                <div class="flex-1 bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-4 flex justify-between items-center">
                  <div>
                    <div class="text-xs text-slate-500 dark:text-slate-400">待领取算力豆</div>
                    <div class="text-2xl font-black text-amber-500 mt-1">{{ pendingBeans }}</div>
                  </div>
                  <el-icon class="text-2xl text-slate-300 dark:text-slate-600"><ArrowRight /></el-icon>
                  <div class="text-right">
                    <div class="text-xs text-slate-500 dark:text-slate-400">总可用算力豆</div>
                    <div class="text-2xl font-black text-cyan-500 mt-1">{{ userStore.balance }}</div>
                  </div>
                </div>
                <el-button
                  round
                  class="!h-12 !px-6 !rounded-2xl !font-black"
                  type="primary"
                  :disabled="pendingBeans <= 0"
                  @click="claimPendingBeans"
                >
                  立即领取
                </el-button>
              </div>
              <div class="mt-3 text-xs text-slate-400">规则：成功邀请好友后，奖励的算力豆将发放至“待领取”账户，点击领取后可进入可用余额。</div>
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
        <!-- 订单信息 -->
        <div class="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-900/40 p-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs font-black text-slate-500 dark:text-slate-400">订单号</div>
              <div class="mt-1 text-sm font-black text-slate-800 dark:text-slate-200 font-mono">{{ purchaseOrderInfo.orderId }}</div>
            </div>
            <div class="text-right">
              <div class="text-xs font-black text-slate-500 dark:text-slate-400">创建时间</div>
              <div class="mt-1 text-sm font-black text-slate-800 dark:text-slate-200">{{ purchaseOrderInfo.createdAt }}</div>
            </div>
          </div>
          <div class="mt-3 flex items-center justify-between">
            <div>
              <div class="text-xs font-black text-slate-500 dark:text-slate-400">商品</div>
              <div class="mt-1 text-sm font-black text-slate-800 dark:text-slate-200 truncate max-w-64">{{ purchaseDialog.summary }}</div>
            </div>
            <div class="text-right">
              <div class="text-xs font-black text-slate-500 dark:text-slate-400">支付金额</div>
              <div class="mt-1 text-2xl font-black bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">¥{{ purchaseDialog.amount }}</div>
            </div>
          </div>
          <div v-if="purchaseDialog.bonusPoints" class="mt-3 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span v-if="purchaseDialog.pointType === 'monthly'" class="text-[10px] font-black text-indigo-500 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/50 px-1.5 py-0.5 rounded">月度</span>
              <span v-else class="text-[10px] font-black text-emerald-500 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-1.5 py-0.5 rounded">长效</span>
              <span class="text-sm font-black text-slate-700 dark:text-slate-300">算力豆</span>
            </div>
            <div class="text-sm font-black text-amber-600 dark:text-amber-300">+{{ purchaseDialog.bonusPoints.toLocaleString() }}</div>
          </div>
        </div>

        <!-- 支付方式选择 -->
        <div class="mt-5">
          <div class="text-sm font-black text-slate-800 dark:text-slate-100 mb-3">选择支付方式</div>
          <div class="flex gap-3">
            <button
              type="button"
              class="flex-1 py-3 rounded-2xl border-2 text-sm font-black transition-all flex items-center justify-center gap-2"
              :class="payMethod === 'alipay' ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-300 dark:border-indigo-500' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'"
              @click="payMethod = 'alipay'"
            >
              <el-icon><Iphone /></el-icon>
              支付宝
            </button>
            <button
              type="button"
              class="flex-1 py-3 rounded-2xl border-2 text-sm font-black transition-all flex items-center justify-center gap-2"
              :class="payMethod === 'wechat' ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-500' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'"
              @click="payMethod = 'wechat'"
            >
              <el-icon><ChatDotRound /></el-icon>
              微信支付
            </button>
          </div>
        </div>

        <!-- 二维码区域 -->
        <div class="mt-5 flex flex-col items-center">
          <!-- 倒计时 + 刷新按钮 -->
          <div class="w-full flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full" :class="qrExpired ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500 animate-pulse'"></div>
              <span v-if="!qrExpired" class="text-sm font-black text-slate-600 dark:text-slate-300">
                二维码将在 <span class="text-amber-500">{{ qrCountdownText }}</span> 后失效
              </span>
              <span v-else class="text-sm font-black text-rose-500">
                二维码已失效，请刷新
              </span>
            </div>
            <el-button
              size="small"
              :loading="qrRefreshing"
              round
              class="!rounded-2xl !font-black !h-8"
              :type="qrExpired ? 'danger' : 'default'"
              @click="refreshQrCode"
            >
              <el-icon><Refresh /></el-icon>
              {{ qrExpired ? '已失效·点击刷新' : '刷新二维码' }}
            </el-button>
          </div>

          <div class="w-48 h-48 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 flex items-center justify-center relative overflow-hidden">
            <!-- 固定二维码方块图案 -->
            <div class="w-full h-full relative">
              <div class="absolute inset-0 grid grid-cols-6 grid-rows-6 gap-1">
                <div class="bg-slate-900 dark:bg-slate-100 rounded-sm col-span-2 row-span-2"></div>
                <div class="bg-slate-900 dark:bg-slate-100 rounded-sm col-start-4 col-span-2 row-span-1"></div>
                <div class="bg-slate-900 dark:bg-slate-100 rounded-sm col-start-3 row-start-2 col-span-1 row-span-1"></div>
                <div class="bg-slate-900 dark:bg-slate-100 rounded-sm col-start-5 row-start-2 col-span-1 row-span-2"></div>
                <div class="bg-slate-900 dark:bg-slate-100 rounded-sm col-start-1 row-start-3 col-span-1 row-span-3"></div>
                <div class="bg-slate-900 dark:bg-slate-100 rounded-sm col-start-3 row-start-3 col-span-2 row-span-2"></div>
                <div class="bg-slate-900 dark:bg-slate-100 rounded-sm col-start-6 row-start-3 col-span-1 row-span-1"></div>
                <div class="bg-slate-900 dark:bg-slate-100 rounded-sm col-start-4 row-start-4 col-span-1 row-span-2"></div>
                <div class="bg-slate-900 dark:bg-slate-100 rounded-sm col-start-6 row-start-4 col-span-1 row-span-3"></div>
                <div class="bg-slate-900 dark:bg-slate-100 rounded-sm col-start-2 row-start-5 col-span-1 row-span-1"></div>
                <div class="bg-slate-900 dark:bg-slate-100 rounded-sm col-start-3 row-start-6 col-span-3 row-span-1"></div>
                <div class="bg-slate-900 dark:bg-slate-100 rounded-sm col-start-5 row-start-5 col-span-1 row-span-1"></div>
              </div>
            </div>
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div class="px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-lg border border-slate-200 dark:border-slate-700">
                <div class="text-xs font-black text-slate-800 dark:text-slate-100">{{ payMethod === 'alipay' ? '支付宝' : '微信' }}扫码</div>
              </div>
            </div>
          </div>
          <div class="mt-3 text-xs text-slate-500 dark:text-slate-400 text-center">请使用{{ payMethod === 'alipay' ? '支付宝' : '微信' }}扫描上方二维码完成支付</div>
        </div>
      </div>

      <template #footer>
        <span></span>
      </template>
    </el-dialog>

    <!-- 产品设计说明弹窗 -->
    <ProductDesignDialog 
      v-model="showDesignDialog" 
      id="member-center"
      :default-content="memberCenterDesign"
    />
    <!-- 算力豆规则说明弹窗 -->
    <MemberRulesDialog v-model="showRulesDialog" />
    <!-- 模型价格说明弹窗 -->
    <ModelPriceExplanationDialog v-model="showModelPriceDialog" :model-tiers="activeTiers" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ProductDesignDialog from '@/components/Common/ProductDesignDialog.vue'
import MemberRulesDialog from '@/components/MemberRulesDialog.vue'
import ModelPriceExplanationDialog from '@/components/Common/ModelPriceExplanationDialog.vue'
import { useUserStore } from '@/store/user'
import { useThemeStore } from '@/store/theme'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Calendar,
  ChatDotRound,
  Coin,
  CopyDocument,
  Document,
  Goods,
  GoldMedal,
  Headset,
  Iphone,
  InfoFilled,
  Money,
  Picture,
  Phone,
  Reading,
  Refresh,
  Search,
  StarFilled,
  Share,
  SwitchButton,
  Trophy,
  User,
  Check,
  PriceTag
} from '@element-plus/icons-vue'

type NavKey = 'overview' | 'recharge-records' | 'consumption' | 'invoice' | 'support' | 'tutorial' | 'logout' | 'invite'

type OrderType = 'member' | 'recharge'

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

interface MemberPointsPool {
  totalPoints: number    // 当前总算力豆（单一算力豆池）
  expireAt: number       // 到期时间（开通日起算，升级时延长）
  currentTier: string    // 当前权益档位
}

interface MemberState {
  superExpireAt: number
  planExpireAt: Record<string, number>
  pointsPool: MemberPointsPool | null
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
const showRulesDialog = ref(false)
const showModelPriceDialog = ref(false)

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
      createdAt: Date.now() - i * 3600000 * 2
    })
  }
  return data
}

const consumptionList = ref<ConsumptionDetail[]>(generateMockData(50))

const consumptionCurrentPage = ref(1)
const consumptionPageSize = ref(10)

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
  const start = (consumptionCurrentPage.value - 1) * consumptionPageSize.value
  const end = start + consumptionPageSize.value
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

const exportConsumption = () => {
  ElMessage.success('报表导出成功（演示版：已生成 Excel 任务）')
}

const memberCenterDesign = {
  title: '会员中心',
  location: '用户管理个人会员权益、算力豆余额及充值记录的核心枢纽，承载 C 端变现转化的关键功能。',
  layout: [
    '**左侧导航栏**：采用玻璃拟态卡片，集成会员权益、算力管理、充值记录、算力消耗明细、开票申请、人工客服、使用教程、邀请返利及退出登录等入口。',
    '**右侧内容区**：动态加载不同功能模块，默认显示“我的会员中心”总览。',
    '**总览页头部**：展示超级会员状态、核心权益标签及总可用算力豆（会员算力豆 + 充值算力豆合并显示）。',
    '**算力管理面板**：显示「会员算力豆」（会员套餐赠送，随会员到期清零，升级时算力豆合并）与「充值算力豆」（充值购买，永久有效），单一算力豆池模型。',
    '**会员套餐区**：支持“按月/按年购买”切换，套餐赠送会员算力豆（随会员周期发放，到期清零），所有算力豆等值。',
    '**算力豆充值套餐**：充值获得永久有效算力豆，直接写入用户余额，与会员算力豆独立存储。',
    '**算力消耗明细**：详细展示每一笔算力消耗的流水号、模型、场景、扣费额度及余额变化。'
  ],
  interactions: [
    '**算力豆类型说明**：会员算力豆（会员套餐赠送，随会员周期发放，到期清零，升级时算力豆合并）与充值算力豆（充值购买，永久有效）为独立的两笔余额，无消耗优先级差异。',
    '**会员过期规则**：会员算力豆随会员到期清零，不结转、不返还；充值算力豆全部保留、永久有效，无会员状态下可继续使用。',
    '**跨档位升级规则**：采用“全额购买新档”，不做差价计算。升级时新档算力豆直接合并到现有算力豆池，到期时间延长，避免算力豆浪费。',
    '**计费规则**：所有算力豆均按“1元=100算力豆”等面值发放，会员档位之间不存在赠送比例差异（溢价体现在功能权益，不在算力豆数量），不存在套利空间。',
    '**支付确认弹窗**：点击"选择计划"或"立即充值"触发确认支付弹窗，展示金额、算力豆数量及有效期说明。',
    '**充值记录详情**：点击充值列表项可展开查看详细订单号及开票入口。',
    '**消耗明细查看**：支持横向滚动查看完整的消耗字段，并提供报表导出功能。',
    '**算力豆领取**：在邀请返利页面，支持用户将获得的算力豆奖励领取到可用余额。'
  ]
}

const activeKey = ref<NavKey>('overview')
const orderFilter = ref<OrderType | 'all'>('all')
const rechargeSearchQuery = ref('')

const billingCycle = ref<'monthly' | 'yearly'>('monthly')
const membershipType = ref<'short-drama'>('short-drama')
const selectedTierId = ref('basic')

const membershipTypes = [
  { id: 'short-drama', name: 'AI短剧会员' }
]

const activeTiers = computed(() => {
  return [
    {
      id: 'basic',
      name: '基础版',
      priceMonthly: 99,
      priceYearly: Math.floor(99 * 12 * 0.8),
      points: 9900,
      concurrent: 2,
      badge: '',
      modelInfo: [
        { name: 'doubao-seedance-2.0', type: 'video', costCategory: '基础', unitPrice: '0.005 算力豆/秒', usageScenario: '稳定经典视频生成' },
        { name: 'HappyHorse 1.1', type: 'video', costCategory: '基础', unitPrice: '0.005 算力豆/秒', usageScenario: '高效快速视频预览' },
        { name: 'gemini-3.1-flash-lite-image', type: 'image', costCategory: '基础', unitPrice: '5 算力豆/张', usageScenario: '极速多模态影像生成' },
        { name: 'doubao-seedream-5.0-lite', type: 'image', costCategory: '基础', unitPrice: '5 算力豆/张', usageScenario: '专业级生图' }
      ]
    },
    {
      id: 'pro',
      name: '专业版',
      priceMonthly: 299,
      priceYearly: Math.floor(299 * 12 * 0.8),
      points: 29900,
      concurrent: 4,
      badge: '最受欢迎',
      modelInfo: [
        { name: 'doubao-seedance-2.5', type: 'video', costCategory: '高端', unitPrice: '0.05 算力豆/秒', usageScenario: '新一代高质量视频生成' },
        { name: 'ChatGPT Images 2.0', type: 'image', costCategory: '高端', unitPrice: '50 算力豆/张', usageScenario: '顶尖精美绘图' }
      ]
    },
    {
      id: 'studio',
      name: '工作室版',
      priceMonthly: 999,
      priceYearly: Math.floor(999 * 12 * 0.8),
      points: 99900,
      concurrent: 8,
      badge: '最超值',
      modelInfo: [
        { name: '可灵3.0 Omni', type: 'video', costCategory: '旗舰', unitPrice: '0.1 算力豆/秒', usageScenario: '顶级物理模拟视频生成' }
      ]
    }
  ]
})

const getTierFeatures = (tier: any) => {
  const features = [
    `算力豆：${tier.points.toLocaleString()}（随会员周期发放，到期清零）`,
    '月产能参照（720P标准视频）：约 100 秒'
  ]
  
  if (tier.modelInfo && tier.modelInfo.length > 0) {
    features.push('\n--- AI 模型能力 ---')
    tier.modelInfo.forEach((model: any) => {
      features.push(`模型：${model.name} (${model.costCategory}级)`) // 显示模型名称和级别
      features.push(`  单价：${model.unitPrice}`) // 显示单价
      features.push(`  适用场景：${model.usageScenario}`) // 显示适用场景
    })
  }

  if (tier.id === 'basic') {
    features.push('视频分辨率：480P / 720P')
    features.push('并发任务数：2')
    features.push('生成队列：标准')
    features.push('支持服务：工单')
    features.push('注：1080P/4K、去水印、商用授权、多并发、API 需升级专业版')
  } else if (tier.id === 'pro') {
    features.push('视频分辨率：+ 1080P / 4K')
    features.push('并发任务数：4')
    features.push('生成队列：优先')
    features.push('水印/授权：去水印 + 去字幕 + 商用授权')
    features.push('API 接入：不支持')
    features.push('支持服务：工单优先')
  } else if (tier.id === 'studio') {
    features.push('视频分辨率：+ 1080P / 4K')
    features.push('并发任务数：8')
    features.push('生成队列：最高优先')
    features.push('水印/授权：去水印 + 去字幕 + 商用授权')
    features.push('API 接入：支持')
    features.push('支持服务：专属对接')
  }
  return features
}

const openPurchaseTier = (tier: any) => {
  const cycleText = billingCycle.value === 'monthly' ? '按月' : '按年'
  const price = billingCycle.value === 'monthly' ? tier.priceMonthly : tier.priceYearly
  const mt = membershipTypes.find(m => m.id === membershipType.value)?.name || ''
  
  purchaseDialog.summary = `${mt} - ${tier.name}（${cycleText}）`
  purchaseDialog.amount = price
  purchaseDialog.bonusPoints = tier.points
  purchaseDialog.pointType = 'monthly'  // 会员套餐赠送的是会员算力豆
  purchaseDialog.payload = {
    type: 'member',
    title: `${mt} - ${tier.name}（${cycleText}）`,
    amount: price,
    bonusPoints: tier.points,
    pointType: 'monthly',
    effect: () => {
      const dayMs = 24 * 60 * 60 * 1000
      const periodDays = billingCycle.value === 'monthly' ? 30 : 365
      if (memberState.pointsPool) {
        // 算力豆池已存在，升级合并
        memberState.pointsPool.totalPoints += tier.points
        memberState.pointsPool.expireAt += periodDays * dayMs
        memberState.pointsPool.currentTier = tier.id
      } else {
        // 首次开通，创建新算力豆池
        memberState.pointsPool = {
          totalPoints: tier.points,
          expireAt: Date.now() + periodDays * dayMs,
          currentTier: tier.id
        }
      }
      ElMessage.success(`成功开通 ${mt} ${tier.name}，获得 ${tier.points.toLocaleString()} 会员算力豆`)
    }
  }
  purchaseDialog.visible = true
}

const inviteCode = ref('')
const pendingBeans = ref(50) // Mock pending beans (was 500 points)

const generateInviteCode = () => {
  inviteCode.value = 'AI' + Math.random().toString(36).substring(2, 8).toUpperCase()
  ElMessage.success('邀请码生成成功！')
}

const copyInviteCode = () => {
  const inviteLink = `${window.location.origin}/auth/login?inviteCode=${inviteCode.value}`
  navigator.clipboard.writeText(inviteLink)
  ElMessage.success('邀请链接已复制到剪贴板')
}

const claimPendingBeans = () => {
  if (pendingBeans.value <= 0) return
  const gainedBeans = pendingBeans.value
  pendingBeans.value = 0
  userStore.setBalance(userStore.balance + gainedBeans)
  ElMessage.success(`成功领取了 ${gainedBeans} 算力豆`)
  saveState()
}

const expandedOrders = reactive<Record<string, boolean>>({})
const expandedConsumption = reactive<Record<string, boolean>>({})
const selectedMemberKey = ref<'short-drama' | 'super'>('short-drama')

const isDark = computed(() => themeStore.isDark)

const memberState = reactive<MemberState>({
  superExpireAt: 0,
  planExpireAt: {},
  pointsPool: null,
  orders: [],
  invoices: []
})

const isSuperMember = computed(() => {
  return memberState.superExpireAt > Date.now()
})

const filteredOrders = computed(() => {
  let orders = memberState.orders
  
  if (orderFilter.value !== 'all') {
    orders = orders.filter(o => o.type === orderFilter.value)
  }
  
  if (rechargeSearchQuery.value.trim()) {
    const q = rechargeSearchQuery.value.toLowerCase()
    orders = orders.filter(o => 
      o.id.toLowerCase().includes(q) || 
      o.title.toLowerCase().includes(q)
    )
  }
  
  return orders
})

const superDiscount = computed(() => (isSuperMember.value ? 7.5 : 10))

const formatPointsCompact = (points: number) => {
  if (points >= 10000) {
    const v = (points / 10000).toFixed(1).replace(/\.0$/, '')
    return `${v}w`
  }
  return points.toLocaleString()
}

const giftPointsTotal = computed(() => memberState.orders.filter(o => o.type === 'member').reduce((acc, o) => acc + (o.bonusPoints || 0), 0))
const rechargePointsTotal = computed(() => memberState.orders.filter(o => o.type === 'recharge').reduce((acc, o) => acc + (o.bonusPoints || 0), 0))

// 单一算力豆池：会员套餐算力豆 + 充值算力豆
// 会员套餐算力豆（随会员到期清零）
const memberPoints = computed(() => memberState.pointsPool ? memberState.pointsPool.totalPoints : 0)
// 充值算力豆（永久有效，无会员状态下仍可用）
const rechargeBalance = computed(() => userStore.balance)
// 总可用算力豆 = 会员算力豆 + 充值算力豆
const totalAvailablePoints = computed(() => memberPoints.value + rechargeBalance.value)

// 当前会员算力豆池到期时间
const pointsExpireAt = computed(() => memberState.pointsPool ? memberState.pointsPool.expireAt : 0)
// 当前权益档位
const currentTier = computed(() => memberState.pointsPool ? memberState.pointsPool.currentTier : '')
// 剩余天数
const remainingDays = computed(() => {
  const expire = pointsExpireAt.value
  if (!expire) return 0
  const diff = expire - Date.now()
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)))
})

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
      priceMonthly: 99,
      bonusPoints: 9900,
      icon: GoldMedal,
      accent: 'indigo',
      features: ['无限AI短剧生成', '高质量视频输出', '自定义角色风格']
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
    { points: 10000, price: 100, note: '1元=100算力豆', badge: '最低' },
    { points: 100000, price: 1000, note: '1元=100算力豆', badge: '常用' },
    { points: 500000, price: 5000, note: '1元=100算力豆', badge: '高效' },
    { points: 10000000, price: 100000, note: '1元=100算力豆', badge: '超值' }
  ]
})

const tutorialSteps = computed(() => {
  return [
    { title: '开通会员', desc: '在“我的会员”选择单品或超级会员，完成支付后立即生效。', icon: GoldMedal, iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600' },
    { title: '充值算力', desc: '选择算力豆包一键充值，算力豆用于生成/优化/素材等功能。', icon: Coin, iconBg: 'bg-gradient-to-br from-indigo-500 to-purple-600' },
    { title: '查看充值', desc: '在“充值记录”查看开通/充值记录，并可快速发起开票。', icon: Document, iconBg: 'bg-gradient-to-br from-sky-500 to-indigo-600' },
    { title: '开票申请', desc: '选择关联订单填写抬头与邮箱提交申请，便于财务归档。', icon: StarFilled, iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600' }
  ]
})

const purchaseDialog = reactive<{
  visible: boolean
  summary: string
  amount: number
  bonusPoints: number
  pointType: 'monthly' | 'permanent'
  payload: { type: OrderType; title: string; amount: number; bonusPoints: number; pointType: 'monthly' | 'permanent'; effect?: () => void } | null
}>({
  visible: false,
  summary: '',
  amount: 0,
  bonusPoints: 0,
  pointType: 'monthly',
  payload: null
})

const payMethod = ref<'alipay' | 'wechat'>('alipay')
const customRechargeAmount = ref<number | undefined>(undefined)

// 二维码倒计时相关
const qrCountdown = ref<number>(180)
const qrRefreshing = ref<boolean>(false)
let qrTimer: ReturnType<typeof setInterval> | null = null

const purchaseOrderInfo = reactive<{ orderId: string; createdAt: string }>({
  orderId: '',
  createdAt: ''
})

const qrExpired = computed(() => qrCountdown.value <= 0)

const qrCountdownText = computed(() => {
  if (qrCountdown.value <= 0) return '已失效'
  const min = Math.floor(qrCountdown.value / 60)
  const sec = qrCountdown.value % 60
  return `${min}:${String(sec).padStart(2, '0')}`
})

const startQrCountdown = () => {
  stopQrCountdown()
  qrCountdown.value = 180
  qrTimer = setInterval(() => {
    qrCountdown.value--
    if (qrCountdown.value <= 0) {
      stopQrCountdown()
    }
  }, 1000)
}

const stopQrCountdown = () => {
  if (qrTimer) {
    clearInterval(qrTimer)
    qrTimer = null
  }
}

const refreshQrCode = () => {
  qrRefreshing.value = true
  // 模拟刷新接口调用
  setTimeout(() => {
    qrRefreshing.value = false
    startQrCountdown()
  }, 800)
}

const closePurchaseDialog = () => {
  stopQrCountdown()
  purchaseDialog.visible = false
}

// 监听弹窗打开/关闭，自动管理倒计时
watch(
  () => purchaseDialog.visible,
  (visible) => {
    if (visible) {
      purchaseOrderInfo.orderId = genOrderId()
      purchaseOrderInfo.createdAt = formatDateTime(Date.now())
      startQrCountdown()
    } else {
      stopQrCountdown()
    }
  }
)

onUnmounted(() => {
  stopQrCountdown()
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
    memberState.superExpireAt = Date.now() + monthMs
    memberState.planExpireAt = {
      'short-drama': Date.now() + monthMs
    }
    // 演示数据：会员算力豆池，有效期 30 天后
    memberState.pointsPool = {
      totalPoints: 9900,
      expireAt: Date.now() + monthMs,
      currentTier: 'pro'
    }
    memberState.orders = []
    memberState.invoices = []
    return
  }

  try {
    const parsed = JSON.parse(raw) as Partial<MemberState>
    memberState.superExpireAt = typeof parsed.superExpireAt === 'number' ? parsed.superExpireAt : 0
    memberState.planExpireAt = parsed.planExpireAt && typeof parsed.planExpireAt === 'object' ? (parsed.planExpireAt as Record<string, number>) : {}
    if (parsed.pointsPool && typeof parsed.pointsPool === 'object') {
      const p = parsed.pointsPool as any
      memberState.pointsPool = {
        totalPoints: typeof p.totalPoints === 'number' ? p.totalPoints : 0,
        expireAt: typeof p.expireAt === 'number' ? p.expireAt : 0,
        currentTier: typeof p.currentTier === 'string' ? p.currentTier : ''
      }
    } else {
      memberState.pointsPool = null
    }
    // 如果无算力豆池或已过期，注入演示数据
    if (!memberState.pointsPool || memberState.pointsPool.expireAt <= Date.now()) {
      const monthMs = 30 * 24 * 60 * 60 * 1000
      memberState.pointsPool = {
        totalPoints: 9900,
        expireAt: Date.now() + monthMs,
        currentTier: 'pro'
      }
    }
    memberState.orders = Array.isArray(parsed.orders) ? (parsed.orders as LocalOrder[]) : []
    memberState.invoices = Array.isArray(parsed.invoices) ? (parsed.invoices as LocalInvoice[]) : []
  } catch {
    memberState.superExpireAt = 0
    memberState.planExpireAt = {}
    memberState.pointsPool = null
    memberState.orders = []
    memberState.invoices = []
  }
}

const saveState = () => {
  const toSave: Omit<MemberState, 'points'> = {
    superExpireAt: memberState.superExpireAt,
    planExpireAt: memberState.planExpireAt,
    pointsPool: memberState.pointsPool,
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
  const dayMs = 24 * 60 * 60 * 1000
  const periodDays = 30
  purchaseDialog.summary = '超级会员（按月）'
  purchaseDialog.amount = amount
  purchaseDialog.bonusPoints = bonusPoints
  purchaseDialog.pointType = 'monthly'  // 超级会员赠送的也是会员算力豆
  purchaseDialog.payload = {
    type: 'member',
    title: '超级会员（按月）',
    amount,
    bonusPoints,
    pointType: 'monthly',
    effect: () => {
      memberState.superExpireAt = Math.max(memberState.superExpireAt, Date.now())
      memberState.superExpireAt = memberState.superExpireAt + 30 * 24 * 60 * 60 * 1000
      if (memberState.pointsPool) {
        // 算力豆池已存在，升级合并
        memberState.pointsPool.totalPoints += bonusPoints
        memberState.pointsPool.expireAt += periodDays * dayMs
        memberState.pointsPool.currentTier = 'super'
      } else {
        // 首次开通，创建新算力豆池
        memberState.pointsPool = {
          totalPoints: bonusPoints,
          expireAt: Date.now() + periodDays * dayMs,
          currentTier: 'super'
        }
      }
      ElMessage.success(`成功开通超级会员，获得 ${bonusPoints.toLocaleString()} 会员算力豆`)
    }
  }
  purchaseDialog.visible = true
}

const openPurchasePlan = (plan: MemberPlan) => {
  purchaseDialog.summary = `${plan.title}（按月）`
  purchaseDialog.amount = plan.priceMonthly
  purchaseDialog.bonusPoints = plan.bonusPoints
  purchaseDialog.pointType = 'monthly'  // 会员套餐赠送的也是会员算力豆
  purchaseDialog.payload = {
    pointType: 'monthly',
    type: 'member',
    title: `${plan.title}（按月）`,
    amount: plan.priceMonthly,
    bonusPoints: plan.bonusPoints,
    effect: () => {
      const monthMs = 30 * 24 * 60 * 60 * 1000
      const currentExpireAt = getPlanExpireAt(plan.id)
      memberState.planExpireAt[plan.id] = Math.max(currentExpireAt, Date.now()) + monthMs
      userStore.setBalance(userStore.balance + plan.bonusPoints)
    }
  }
  purchaseDialog.visible = true
}

const openRechargePackage = (pkg: RechargePackage) => {
  purchaseDialog.summary = `长效算力豆充值 ${pkg.points.toLocaleString()}`
  purchaseDialog.amount = pkg.price
  purchaseDialog.bonusPoints = pkg.points
  purchaseDialog.pointType = 'permanent'  // 充值购买的是长效算力豆
  purchaseDialog.payload = {
    type: 'recharge',
    title: `长效算力豆充值 ${pkg.points.toLocaleString()}`,
    amount: pkg.price,
    bonusPoints: pkg.points,
    pointType: 'permanent',
    effect: () => {
      // 长效算力豆：写入 userStore.balance，永久有效
      userStore.setBalance(userStore.balance + pkg.points)
    }
  }
  purchaseDialog.visible = true
}

const openRechargeQuick = () => {
  openRechargePackage(rechargePackages.value[2])
}

const openRechargeCustom = () => {
  if (!customRechargeAmount.value || customRechargeAmount.value < 100) {
    ElMessage.warning('自定义充值最低金额为100元')
    return
  }
  const amount = customRechargeAmount.value
  const points = amount * 100
  purchaseDialog.summary = `长效算力豆充值 ${points.toLocaleString()}`
  purchaseDialog.amount = amount
  purchaseDialog.bonusPoints = points
  purchaseDialog.pointType = 'permanent'
  purchaseDialog.payload = {
    type: 'recharge',
    title: `长效算力豆充值 ${points.toLocaleString()}（自定义）`,
    amount: amount,
    bonusPoints: points,
    pointType: 'permanent',
    effect: () => {
      userStore.setBalance(userStore.balance + points)
    }
  }
  purchaseDialog.visible = true
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
