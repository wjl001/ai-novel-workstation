<template>
  <div class="product-input-panel space-y-5">
    <!-- 商品基础信息 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          商品名称 <span class="text-red-500">*</span>
        </label>
        <el-input
          v-model="localProduct.name"
          placeholder="例如：XX品牌保湿精华液"
          size="large"
          class="!rounded-xl"
          @input="emitUpdate"
        />
      </div>
      <div>
        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          商品类目
        </label>
        <el-select
          v-model="localProduct.category"
          placeholder="选择类目"
          size="large"
          class="w-full !rounded-xl"
          filterable
          allow-create
          @change="emitUpdate"
        >
          <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
        </el-select>
      </div>
      <div>
        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          品牌
        </label>
        <el-input
          v-model="localProduct.brand"
          placeholder="品牌名称（选填）"
          size="large"
          class="!rounded-xl"
          @input="emitUpdate"
        />
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            促销价
          </label>
          <el-input
            v-model="localProduct.price"
            placeholder="¥99"
            size="large"
            class="!rounded-xl"
            @input="emitUpdate"
          >
            <template #prefix>¥</template>
          </el-input>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            原价
          </label>
          <el-input
            v-model="localProduct.originalPrice"
            placeholder="¥199"
            size="large"
            class="!rounded-xl"
            @input="emitUpdate"
          >
            <template #prefix>¥</template>
          </el-input>
        </div>
      </div>
    </div>

    <!-- 目标人群 -->
    <div>
      <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
        目标人群
      </label>
      <div class="flex flex-wrap gap-2 mb-2">
        <button
          v-for="aud in audiencePresets"
          :key="aud"
          @click="localProduct.targetAudience = aud; emitUpdate()"
          :class="['px-3 py-1.5 rounded-full text-xs font-bold transition-all border',
            localProduct.targetAudience === aud
              ? 'bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/30'
              : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600']"
        >
          {{ aud }}
        </button>
      </div>
      <el-input
        v-model="localProduct.targetAudience"
        placeholder="或自定义目标人群，如：25-35岁都市白领女性"
        size="large"
        class="!rounded-xl"
        @input="emitUpdate"
      />
    </div>

    <!-- 核心卖点 -->
    <div>
      <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
        核心卖点 <span class="text-red-500">*</span>
        <span class="text-slate-400 font-normal normal-case ml-2">建议3-5个，回车添加</span>
      </label>
      <div class="flex flex-wrap gap-2 mb-2">
        <span
          v-for="(point, idx) in localProduct.sellingPoints"
          :key="idx"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200"
        >
          {{ point }}
          <button @click="removePoint(idx)" class="hover:text-emerald-900 transition-colors">
            <el-icon :size="12"><Close /></el-icon>
          </button>
        </span>
      </div>
      <el-input
        v-model="newPoint"
        placeholder="输入卖点后回车添加，如：深层补水、24小时持久"
        size="large"
        class="!rounded-xl"
        @keyup.enter="addPoint"
      >
        <template #append>
          <button @click="addPoint" class="px-4 text-indigo-600 font-bold hover:bg-indigo-50 transition-colors">
            添加
          </button>
        </template>
      </el-input>
    </div>

    <!-- 商品描述 -->
    <div>
      <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
        商品描述
      </label>
      <el-input
        v-model="localProduct.description"
        type="textarea"
        :rows="3"
        placeholder="简单描述商品特点、使用场景、差异化优势等（选填，越详细生成越精准）"
        class="!rounded-xl"
        resize="none"
        @input="emitUpdate"
      />
    </div>

    <!-- 参考素材 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          参考视频链接（爆款复刻）
        </label>
        <el-input
          v-model="localProduct.referenceVideoUrl"
          placeholder="粘贴抖音/小红书爆款视频链接"
          size="large"
          class="!rounded-xl"
          @input="emitUpdate"
        >
          <template #prefix>
            <el-icon class="text-slate-400"><Link /></el-icon>
          </template>
        </el-input>
        <p class="text-[10px] text-slate-400 mt-1.5">AI将分析视频结构与节奏，生成同款风格脚本</p>
      </div>
      <div>
        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          参考图片
        </label>
        <div class="flex items-center gap-2">
          <div class="flex-1 h-[52px] border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs hover:border-indigo-300 hover:text-indigo-500 transition-colors cursor-pointer">
            <el-icon class="mr-1"><Upload /></el-icon>
            点击上传商品图
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { Close, Link, Upload } from '@element-plus/icons-vue';
import type { ProductInfo } from '../../../store/marketing';

const props = defineProps<{
  product: ProductInfo;
}>();

const emit = defineEmits<{
  (e: 'update', product: ProductInfo): void;
}>();

const localProduct = reactive<ProductInfo>({ ...props.product });
const newPoint = ref('');

const categories = [
  '美妆护肤', '食品饮料', '服饰鞋包', '家居日用', '数码家电',
  '母婴用品', '个护清洁', '运动户外', '珠宝配饰', '图书文具', '其他'
];

const audiencePresets = [
  '18-25岁学生党', '25-35岁都市白领', '35-45岁精致妈妈',
  '45岁+成熟人群', '男性用户', '下沉市场用户', 'Z世代潮流人群'
];

watch(() => props.product, (val) => {
  Object.assign(localProduct, val);
}, { deep: true });

function emitUpdate() {
  emit('update', { ...localProduct });
}

function addPoint() {
  const val = newPoint.value.trim();
  if (val && !localProduct.sellingPoints.includes(val)) {
    localProduct.sellingPoints.push(val);
    newPoint.value = '';
    emitUpdate();
  }
}

function removePoint(idx: number) {
  localProduct.sellingPoints.splice(idx, 1);
  emitUpdate();
}
</script>
