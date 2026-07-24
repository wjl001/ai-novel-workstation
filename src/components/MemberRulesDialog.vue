<template>
  <el-dialog
    v-model="visible"
    title="算力豆规则说明"
    width="820px"
    class="member-rules-dialog rounded-[24px] !bg-[#f8fafc] dark:!bg-slate-900 overflow-hidden"
    :show-close="false"
  >
    <template #header="{ close }">
      <div class="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <el-icon class="text-white" :size="20"><Reading /></el-icon>
          </div>
          <div class="flex flex-col">
            <h4 class="text-xl font-black text-slate-800 dark:text-white m-0">算力豆规则说明</h4>
            <span class="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-widest">v2.8 · 敬龙版（积分合并模式）</span>
          </div>
        </div>
        <button @click="closeDialog" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
          <el-icon :size="20"><Close /></el-icon>
        </button>
      </div>
    </template>

    <div class="px-8 py-8 max-h-[75vh] overflow-y-auto custom-scrollbar bg-[#f8fafc] dark:bg-slate-900/50 font-chinese">
      <div class="max-w-3xl mx-auto space-y-8">

        <!-- Section 1: 基础关联类 -->
        <section class="space-y-6">
          <div class="flex items-center gap-4">
            <div class="flex items-center justify-center w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
              <span class="text-sm font-black">01</span>
            </div>
            <div>
              <h3 class="text-xl font-black text-slate-900 dark:text-white m-0">基础关联类</h3>
              <p class="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold mt-0.5">Basic Association Rules</p>
            </div>
          </div>

          <!-- Rule 1: 单一积分池 -->
          <div class="bg-white dark:bg-slate-800/80 p-6 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-slate-700/50">
            <div class="flex items-start gap-4">
              <span class="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <el-icon class="text-indigo-500 dark:text-indigo-400"><Grid /></el-icon>
              </span>
              <div class="flex-1">
                <h4 class="text-base font-black text-slate-900 dark:text-white m-0">单一积分池</h4>
                <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-bold mt-2">
                  所有算力豆为<span class="text-indigo-600 dark:text-indigo-400 font-black">单一积分池</span>，会员套餐赠送的算力豆与充值购买的算力豆<span class="text-indigo-600 dark:text-indigo-400 font-black">合并到同一个池</span>。
                </p>
                <div class="mt-3 flex items-center gap-3 px-4 py-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
                  <el-icon class="text-indigo-500 dark:text-indigo-400"><Coin /></el-icon>
                  <span class="text-sm font-black text-indigo-600 dark:text-indigo-300">积分按 "1元 = 100积分" 等面值发放</span>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 font-bold mt-2">
                  会员档位之间不存在赠送比例差异（溢价体现在功能权益，不在积分数量）
                </p>
              </div>
            </div>
          </div>

          <!-- Rule 2: 有效期定义 -->
          <div class="bg-white dark:bg-slate-800/80 p-6 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-slate-700/50">
            <div class="flex items-start gap-4">
              <span class="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <el-icon class="text-sky-500 dark:text-sky-400"><Calendar /></el-icon>
              </span>
              <div class="flex-1">
                <h4 class="text-base font-black text-slate-900 dark:text-white m-0">"当月"的定义</h4>
                <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-bold mt-2">
                  "当月"按<span class="text-sky-600 dark:text-sky-400 font-black">会员周期月</span>计算，即<span class="text-sky-600 dark:text-sky-400 font-black">开通日起30天</span>，不是自然月。
                </p>
                <div class="mt-3 bg-sky-50 dark:bg-sky-950/20 rounded-2xl p-4 border border-sky-100 dark:border-sky-800/30">
                  <p class="text-sm text-slate-700 dark:text-slate-200 font-bold m-0">
                    例：7月20日开通，有效期至 <span class="text-sky-600 dark:text-sky-400 font-black">8月19日</span>
                  </p>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 font-bold mt-3">
                  月中开通用户如果用自然月只能用几天，会产生大量客诉。
                </p>
              </div>
            </div>
          </div>

          <!-- Rule 3: 非会员规则 -->
          <div class="bg-white dark:bg-slate-800/80 p-6 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-slate-700/50">
            <div class="flex items-start gap-4">
              <span class="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <el-icon class="text-amber-500 dark:text-amber-400"><Coin /></el-icon>
              </span>
              <div class="flex-1">
                <h4 class="text-base font-black text-slate-900 dark:text-white m-0">非会员使用规则</h4>
                <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-bold mt-2">
                  不买会员、仅充值算力豆：可正常使用基础生成功能，但受非会员限制。
                </p>
                <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800/30">
                    <div class="flex items-center gap-2 mb-2">
                      <el-icon class="text-emerald-500 dark:text-emerald-400"><Check /></el-icon>
                      <span class="text-[11px] font-black text-emerald-600 dark:text-emerald-300 uppercase tracking-wider">可用功能</span>
                    </div>
                    <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-bold m-0">
                      480P/720P视频 · 图片 · 文本
                    </p>
                  </div>
                  <div class="bg-rose-50 dark:bg-rose-950/20 rounded-2xl p-4 border border-rose-100 dark:border-rose-800/30">
                    <div class="flex items-center gap-2 mb-2">
                      <el-icon class="text-rose-500 dark:text-rose-400"><CloseIcon /></el-icon>
                      <span class="text-[11px] font-black text-rose-600 dark:text-rose-300 uppercase tracking-wider">非会员限制</span>
                    </div>
                    <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-bold m-0">
                      带水印 · 仅个人用途 · 并发1个 · 标准队列 · 无API
                    </p>
                  </div>
                </div>
                <p class="text-[11px] text-amber-600 dark:text-amber-400 font-bold mt-3">
                  1080P、去水印商用授权、多并发、优先队列、API均为会员专属
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 2: 会员过期 -->
        <section class="space-y-6">
          <div class="flex items-center gap-4">
            <div class="flex items-center justify-center w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
              <span class="text-sm font-black">02</span>
            </div>
            <div>
              <h3 class="text-xl font-black text-slate-900 dark:text-white m-0">会员过期</h3>
              <p class="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold mt-0.5">Membership Expiration</p>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-800/80 p-6 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-slate-700/50">
            <div class="flex items-start gap-4">
              <span class="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <el-icon class="text-rose-500 dark:text-rose-400"><Clock /></el-icon>
              </span>
              <div class="flex-1">
                <h4 class="text-base font-black text-slate-900 dark:text-white m-0">积分随会员到期清零</h4>
                <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-bold mt-2">
                  会员套餐赠送的算力豆，<span class="text-rose-600 dark:text-rose-400 font-black">随会员到期日一起清零</span>，不结转、不返还。
                </p>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-800/80 p-6 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-slate-700/50">
            <div class="flex items-start gap-4">
              <span class="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <el-icon class="text-emerald-500 dark:text-emerald-400"><Check /></el-icon>
              </span>
              <div class="flex-1">
                <h4 class="text-base font-black text-slate-900 dark:text-white m-0">纯充值积分永久保留</h4>
                <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-bold mt-2">
                  单独充值（不购买会员）的算力豆<span class="text-emerald-600 dark:text-emerald-400 font-black">永久有效</span>，无会员状态下可继续使用，但按非会员权限执行（带水印、480P/720P、1并发）。
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 3: 跨档位升级 -->
        <section class="space-y-6">
          <div class="flex items-center gap-4">
            <div class="flex items-center justify-center w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
              <span class="text-sm font-black">03</span>
            </div>
            <div>
              <h3 class="text-xl font-black text-slate-900 dark:text-white m-0">跨档位升级</h3>
              <p class="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold mt-0.5">Tier Upgrade</p>
            </div>
          </div>

          <!-- 示例场景 -->
          <div class="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-6 rounded-[28px] border-2 border-amber-200 dark:border-amber-800/40">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
                <el-icon class="text-white" :size="20"><Lightning /></el-icon>
              </div>
              <h4 class="text-lg font-black text-slate-900 dark:text-white m-0">示例场景</h4>
            </div>
            <div class="bg-white dark:bg-slate-800/90 rounded-2xl p-4 space-y-3">
              <div class="flex items-center gap-3">
                <span class="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs font-black shrink-0">①</span>
                <span class="text-sm font-bold text-slate-600 dark:text-slate-300">购买 <span class="text-amber-600 dark:text-amber-400 font-black">¥100 A套餐</span>（100积分），使用15天后还剩 <span class="text-amber-600 dark:text-amber-400 font-black">15天 + 200积分</span></span>
              </div>
              <div class="flex items-center gap-3">
                <span class="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs font-black shrink-0">②</span>
                <span class="text-sm font-bold text-slate-600 dark:text-slate-300">再购买 <span class="text-emerald-600 dark:text-emerald-400 font-black">¥1000 B套餐</span>（1000积分）</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs font-black shrink-0">③</span>
                <span class="text-sm font-bold text-slate-600 dark:text-slate-300">结果：</span>
              </div>
            </div>
            <div class="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="bg-white dark:bg-slate-800/90 rounded-2xl p-3 text-center border border-amber-200 dark:border-amber-700/50">
                <div class="text-xs text-slate-400 dark:text-slate-500 font-bold">积分</div>
                <div class="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">1200</div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400 font-bold">200剩余 + 1000新</div>
              </div>
              <div class="bg-white dark:bg-slate-800/90 rounded-2xl p-3 text-center border border-amber-200 dark:border-amber-700/50">
                <div class="text-xs text-slate-400 dark:text-slate-500 font-bold">有效期</div>
                <div class="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">45天</div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400 font-bold">15剩余 + 30新</div>
              </div>
              <div class="bg-white dark:bg-slate-800/90 rounded-2xl p-3 text-center border border-amber-200 dark:border-amber-700/50">
                <div class="text-xs text-slate-400 dark:text-slate-500 font-bold">权益</div>
                <div class="text-lg font-black text-amber-600 dark:text-amber-400 mt-1">B套餐</div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400 font-bold">立即升级</div>
              </div>
            </div>
          </div>

          <!-- Rule 1: 积分合并 -->
          <div class="bg-white dark:bg-slate-800/80 p-6 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-slate-700/50">
            <div class="flex items-start gap-4">
              <span class="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <el-icon class="text-indigo-500 dark:text-indigo-400"><Grid /></el-icon>
              </span>
              <div class="flex-1">
                <h4 class="text-base font-black text-slate-900 dark:text-white m-0">积分合并</h4>
                <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-bold mt-2">
                  新套餐积分与剩余积分<span class="text-indigo-600 dark:text-indigo-400 font-black">相加</span>，用户不吃亏。
                </p>
              </div>
            </div>
          </div>

          <!-- Rule 2: 有效期延长 -->
          <div class="bg-white dark:bg-slate-800/80 p-6 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-slate-700/50">
            <div class="flex items-start gap-4">
              <span class="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <el-icon class="text-sky-500 dark:text-sky-400"><Calendar /></el-icon>
              </span>
              <div class="flex-1">
                <h4 class="text-base font-black text-slate-900 dark:text-white m-0">有效期延长</h4>
                <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-bold mt-2">
                  新套餐天数<span class="text-sky-600 dark:text-sky-400 font-black">加到</span>剩余天数上，不做重置。
                </p>
              </div>
            </div>
          </div>

          <!-- Rule 3: 权益即时升级 -->
          <div class="bg-white dark:bg-slate-800/80 p-6 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-slate-700/50">
            <div class="flex items-start gap-4">
              <span class="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <el-icon class="text-cyan-500 dark:text-cyan-400"><Lightning /></el-icon>
              </span>
              <div class="flex-1">
                <h4 class="text-base font-black text-slate-900 dark:text-white m-0">权益即时升级</h4>
                <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-bold mt-2">
                  会员权益<span class="text-cyan-600 dark:text-cyan-400 font-black">立即切换</span>为新档位全套，即时生效。
                </p>
              </div>
            </div>
          </div>

          <!-- Rule 4: 纯充值不受影响 -->
          <div class="bg-white dark:bg-slate-800/80 p-6 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-slate-700/50">
            <div class="flex items-start gap-4">
              <span class="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <el-icon class="text-emerald-500 dark:text-emerald-400"><Lock /></el-icon>
              </span>
              <div class="flex-1">
                <h4 class="text-base font-black text-slate-900 dark:text-white m-0">纯充值不受影响</h4>
                <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-bold mt-2">
                  此前单独充值（非会员套餐）的算力豆<span class="text-emerald-600 dark:text-emerald-400 font-black">完全不受升级影响，永久保留</span>。
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 4: 补充底层规则 -->
        <section class="space-y-6">
          <div class="flex items-center gap-4">
            <div class="flex items-center justify-center w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400">
              <span class="text-sm font-black">04</span>
            </div>
            <div>
              <h3 class="text-xl font-black text-slate-900 dark:text-white m-0">补充底层规则</h3>
              <p class="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold mt-0.5">Underlying Rules</p>
            </div>
          </div>

          <div class="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 p-6 rounded-[28px] border border-purple-200 dark:border-purple-800/30">
            <div class="flex items-start gap-4">
              <span class="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/25">
                <el-icon class="text-white" :size="20"><Coin /></el-icon>
              </span>
              <div class="flex-1">
                <h4 class="text-base font-black text-slate-900 dark:text-white m-0">等面值发放 · 无套利空间</h4>
                <p class="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-bold mt-3">
                  所有算力豆均按 <span class="text-purple-600 dark:text-purple-400 font-black">"1元 = 100积分"</span> 等面值发放，会员档位之间<span class="text-purple-600 dark:text-purple-400 font-black">不存在赠送比例差异</span>。
                </p>
                <p class="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-bold mt-2">
                  溢价体现在<span class="text-purple-600 dark:text-purple-400 font-black">功能权益</span>，不在积分数量——上述规则下不存在套利空间，可以放心实现。
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- Footer -->
        <div class="text-center pt-4">
          <p class="text-[11px] text-slate-400 dark:text-slate-500 font-bold">
            敬龙版 · 2026年7月 · AI短剧创作平台 v2.8
          </p>
        </div>
      </div>
    </div>

    <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
      <button @click="closeDialog" class="px-8 py-2.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 font-black rounded-xl transition-all border border-slate-200 dark:border-slate-600 active:scale-95">
        我已了解
      </button>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { 
  Close, Reading, Grid, Coin, Calendar,
  Check, Close as CloseIcon, Clock, Lightning,
  Lock, ShoppingCart
} from '@element-plus/icons-vue';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(['update:modelValue']);

const visible = ref(props.modelValue);

watch(() => props.modelValue, (newVal) => {
  visible.value = newVal;
});

watch(visible, (newVal) => {
  emit('update:modelValue', newVal);
});

const closeDialog = () => {
  visible.value = false;
};
</script>

<style scoped>
.member-rules-dialog :deep(.el-dialog__header) {
  padding: 0;
  margin: 0;
}

.member-rules-dialog :deep(.el-dialog__body) {
  padding: 0;
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

.font-chinese {
  font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
