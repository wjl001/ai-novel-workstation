// 道具库数据 - 150+ 模型资源库
import { computed } from 'vue'
import type { PropModel, PropCategory } from '../types'

const categories: Record<string, { label: string; items: Array<{ id: string; name: string; desc?: string; bb: { w: number; h: number; d: number }; tags: string[] }> }> = {
  furniture: {
    label: '家具',
    items: [
      { id: 'furn_001', name: '办公桌椅套装', desc: '现代简约办公桌椅组合', bb: { w: 1.8, h: 1.2, d: 1.0 }, tags: ['办公', '桌椅'] },
      { id: 'furn_002', name: '沙发-L型', bb: { w: 2.8, h: 0.9, d: 1.8 }, tags: ['客厅', '沙发'] },
      { id: 'furn_003', name: '沙发-单人', bb: { w: 0.9, h: 0.9, d: 0.9 }, tags: ['客厅', '沙发'] },
      { id: 'furn_004', name: '茶几-方形', bb: { w: 1.2, h: 0.45, d: 1.2 }, tags: ['客厅', '茶几'] },
      { id: 'furn_005', name: '茶几-圆形', bb: { w: 0.8, h: 0.45, d: 0.8 }, tags: ['客厅', '茶几'] },
      { id: 'furn_006', name: '餐桌-4人', bb: { w: 1.5, h: 0.75, d: 0.9 }, tags: ['餐厅', '桌子'] },
      { id: 'furn_007', name: '餐桌-6人', bb: { w: 1.8, h: 0.75, d: 1.0 }, tags: ['餐厅', '桌子'] },
      { id: 'furn_008', name: '餐椅-现代', bb: { w: 0.45, h: 0.85, d: 0.5 }, tags: ['餐厅', '椅子'] },
      { id: 'furn_009', name: '书柜-落地', bb: { w: 0.8, h: 2.0, d: 0.35 }, tags: ['书房', '储物'] },
      { id: 'furn_010', name: '书架-壁挂', bb: { w: 1.0, h: 0.15, d: 0.25 }, tags: ['书房', '储物'] },
      { id: 'furn_011', name: '床头柜', bb: { w: 0.45, h: 0.55, d: 0.4 }, tags: ['卧室', '储物'] },
      { id: 'furn_012', name: '衣柜-双门', bb: { w: 1.2, h: 2.1, d: 0.55 }, tags: ['卧室', '储物'] },
      { id: 'furn_013', name: '梳妆台', bb: { w: 1.2, h: 1.0, d: 0.45 }, tags: ['卧室', '梳妆'] },
      { id: 'furn_014', name: '电视柜-落地', bb: { w: 2.0, h: 0.5, d: 0.45 }, tags: ['客厅', '电视'] },
      { id: 'furn_015', name: '电视柜-悬空', bb: { w: 2.0, h: 0.35, d: 0.35 }, tags: ['客厅', '电视'] },
      { id: 'furn_016', name: '鞋柜', bb: { w: 0.8, h: 1.0, d: 0.3 }, tags: ['玄关', '储物'] },
      { id: 'furn_017', name: '花架-三层', bb: { w: 0.5, h: 1.0, d: 0.5 }, tags: ['装饰', '花架'] },
      { id: 'furn_018', name: '梯子-折叠', bb: { w: 0.35, h: 1.2, d: 0.08 }, tags: ['工具', '梯子'] },
      { id: 'furn_019', name: '办公椅-转椅', bb: { w: 0.6, h: 1.1, d: 0.6 }, tags: ['办公', '椅子'] },
      { id: 'furn_020', name: '会议桌-长桌', bb: { w: 3.0, h: 0.75, d: 1.2 }, tags: ['办公', '会议'] },
      { id: 'furn_021', name: '文件柜-矮柜', bb: { w: 0.5, h: 0.8, d: 0.4 }, tags: ['办公', '储物'] },
      { id: 'furn_022', name: '吧台-高桌', bb: { w: 1.5, h: 1.1, d: 0.6 }, tags: ['酒吧', '桌子'] },
      { id: 'furn_023', name: '吧台凳', bb: { w: 0.4, h: 0.75, d: 0.4 }, tags: ['酒吧', '椅子'] },
      { id: 'furn_024', name: '展示柜-玻璃', bb: { w: 0.8, h: 1.8, d: 0.35 }, tags: ['商店', '展示'] },
      { id: 'furn_025', name: '收银台', bb: { w: 1.2, h: 1.1, d: 0.5 }, tags: ['商店', '收银'] },
      { id: 'furn_026', name: '柜台', bb: { w: 1.5, h: 0.9, d: 0.6 }, tags: ['商店', '柜台'] },
      { id: 'furn_027', name: '货架-落地', bb: { w: 1.2, h: 2.0, d: 0.4 }, tags: ['商店', '货架'] },
      { id: 'furn_028', name: '储物箱', bb: { w: 0.6, h: 0.5, d: 0.4 }, tags: ['储物', '箱子'] },
      { id: 'furn_029', name: '椅子-扶手', bb: { w: 0.6, h: 0.9, d: 0.6 }, tags: ['客厅', '椅子'] },
      { id: 'furn_030', name: '椅子-餐椅', bb: { w: 0.45, h: 0.95, d: 0.45 }, tags: ['餐厅', '椅子'] },
    ]
  },
  props: {
    label: '道具',
    items: [
      { id: 'prop_001', name: '咖啡杯', bb: { w: 0.08, h: 0.1, d: 0.08 }, tags: ['饮品', '杯子'] },
      { id: 'prop_002', name: '马克杯', bb: { w: 0.1, h: 0.12, d: 0.1 }, tags: ['饮品', '杯子'] },
      { id: 'prop_003', name: '玻璃杯', bb: { w: 0.08, h: 0.15, d: 0.08 }, tags: ['饮品', '杯子'] },
      { id: 'prop_004', name: '水瓶-保温', bb: { w: 0.07, h: 0.25, d: 0.07 }, tags: ['饮品', '瓶子'] },
      { id: 'prop_005', name: '矿泉水瓶', bb: { w: 0.08, h: 0.3, d: 0.08 }, tags: ['饮品', '瓶子'] },
      { id: 'prop_006', name: '手机-智能手机', bb: { w: 0.07, h: 0.15, d: 0.01 }, tags: ['电子', '手机'] },
      { id: 'prop_007', name: '笔记本电脑', bb: { w: 0.35, h: 0.03, d: 0.25 }, tags: ['电子', '电脑'] },
      { id: 'prop_008', name: '平板电脑', bb: { w: 0.25, h: 0.02, d: 0.18 }, tags: ['电子', '平板'] },
      { id: 'prop_009', name: '台式电脑显示器', bb: { w: 0.5, h: 0.35, d: 0.08 }, tags: ['电子', '电脑'] },
      { id: 'prop_010', name: '键盘', bb: { w: 0.4, h: 0.02, d: 0.15 }, tags: ['电子', '外设'] },
      { id: 'prop_011', name: '鼠标', bb: { w: 0.06, h: 0.03, d: 0.1 }, tags: ['电子', '外设'] },
      { id: 'prop_012', name: '耳机-头戴式', bb: { w: 0.2, h: 0.2, d: 0.15 }, tags: ['电子', '耳机'] },
      { id: 'prop_013', name: '耳机-入耳式', bb: { w: 0.03, h: 0.03, d: 0.03 }, tags: ['电子', '耳机'] },
      { id: 'prop_014', name: '相机-单反', bb: { w: 0.13, h: 0.09, d: 0.08 }, tags: ['电子', '相机'] },
      { id: 'prop_015', name: '相机-微单', bb: { w: 0.12, h: 0.08, d: 0.07 }, tags: ['电子', '相机'] },
      { id: 'prop_016', name: '三脚架', bb: { w: 0.5, h: 1.5, d: 0.5 }, tags: ['工具', '摄影'] },
      { id: 'prop_017', name: '台灯', bb: { w: 0.2, h: 0.45, d: 0.2 }, tags: ['照明', '灯具'] },
      { id: 'prop_018', name: '落地灯', bb: { w: 0.3, h: 1.5, d: 0.3 }, tags: ['照明', '灯具'] },
      { id: 'prop_019', name: '吊灯', bb: { w: 0.4, h: 0.6, d: 0.4 }, tags: ['照明', '灯具'] },
      { id: 'prop_020', name: '蜡烛', bb: { w: 0.06, h: 0.15, d: 0.06 }, tags: ['照明', '装饰'] },
      { id: 'prop_021', name: '花瓶', bb: { w: 0.15, h: 0.3, d: 0.15 }, tags: ['装饰', '花器'] },
      { id: 'prop_022', name: '盆栽-小型', bb: { w: 0.12, h: 0.2, d: 0.12 }, tags: ['装饰', '植物'] },
      { id: 'prop_023', name: '盆栽-大型', bb: { w: 0.4, h: 0.8, d: 0.4 }, tags: ['装饰', '植物'] },
      { id: 'prop_024', name: '书籍-单本', bb: { w: 0.15, h: 0.03, d: 0.22 }, tags: ['书房', '书籍'] },
      { id: 'prop_025', name: '书籍-堆叠', bb: { w: 0.2, h: 0.2, d: 0.28 }, tags: ['书房', '书籍'] },
      { id: 'prop_026', name: '杂志', bb: { w: 0.22, h: 0.02, d: 0.3 }, tags: ['书房', '杂志'] },
      { id: 'prop_027', name: '报纸', bb: { w: 0.4, h: 0.01, d: 0.3 }, tags: ['书房', '报纸'] },
      { id: 'prop_028', name: '行李箱-大型', bb: { w: 0.6, h: 1.0, d: 0.28 }, tags: ['旅行', '行李'] },
      { id: 'prop_029', name: '行李箱-小型', bb: { w: 0.4, h: 0.6, d: 0.25 }, tags: ['旅行', '行李'] },
      { id: 'prop_030', name: '背包', bb: { w: 0.4, h: 0.5, d: 0.2 }, tags: ['旅行', '背包'] },
      { id: 'prop_031', name: '手提包', bb: { w: 0.3, h: 0.25, d: 0.12 }, tags: ['旅行', '手提'] },
      { id: 'prop_032', name: '钱包', bb: { w: 0.12, h: 0.08, d: 0.02 }, tags: ['配饰', '钱包'] },
      { id: 'prop_033', name: '钥匙串', bb: { w: 0.04, h: 0.08, d: 0.02 }, tags: ['配饰', '钥匙'] },
      { id: 'prop_034', name: '眼镜-框架', bb: { w: 0.14, h: 0.05, d: 0.04 }, tags: ['配饰', '眼镜'] },
      { id: 'prop_035', name: '太阳镜', bb: { w: 0.14, h: 0.06, d: 0.04 }, tags: ['配饰', '眼镜'] },
      { id: 'prop_036', name: '领带', bb: { w: 0.04, h: 0.6, d: 0.01 }, tags: ['配饰', '领带'] },
      { id: 'prop_037', name: '帽子-棒球帽', bb: { w: 0.2, h: 0.2, d: 0.2 }, tags: ['配饰', '帽子'] },
      { id: 'prop_038', name: '帽子-礼帽', bb: { w: 0.25, h: 0.25, d: 0.25 }, tags: ['配饰', '帽子'] },
      { id: 'prop_039', name: '钟表-挂钟', bb: { w: 0.4, h: 0.4, d: 0.05 }, tags: ['装饰', '钟表'] },
      { id: 'prop_040', name: '钟表-座钟', bb: { w: 0.3, h: 0.5, d: 0.2 }, tags: ['装饰', '钟表'] },
      { id: 'prop_041', name: '相框-立式', bb: { w: 0.15, h: 0.2, d: 0.03 }, tags: ['装饰', '相框'] },
      { id: 'prop_042', name: '相框-壁挂', bb: { w: 0.4, h: 0.3, d: 0.02 }, tags: ['装饰', '相框'] },
      { id: 'prop_043', name: '海报-竖版', bb: { w: 0.6, h: 0.9, d: 0.01 }, tags: ['装饰', '海报'] },
      { id: 'prop_044', name: '海报-横版', bb: { w: 0.9, h: 0.6, d: 0.01 }, tags: ['装饰', '海报'] },
      { id: 'prop_045', name: '画笔-调色板', bb: { w: 0.2, h: 0.02, d: 0.15 }, tags: ['艺术', '绘画'] },
      { id: 'prop_046', name: '画布-画架', bb: { w: 0.8, h: 0.6, d: 0.02 }, tags: ['艺术', '画架'] },
      { id: 'prop_047', name: '颜料-管装', bb: { w: 0.03, h: 0.1, d: 0.03 }, tags: ['艺术', '颜料'] },
      { id: 'prop_048', name: '吉他', bb: { w: 0.35, h: 1.0, d: 0.12 }, tags: ['乐器', '吉他'] },
      { id: 'prop_049', name: '钢琴-立式', bb: { w: 1.2, h: 1.3, d: 0.45 }, tags: ['乐器', '钢琴'] },
      { id: 'prop_050', name: '音响-落地', bb: { w: 0.4, h: 0.8, d: 0.4 }, tags: ['电子', '音响'] },
    ]
  },
  architecture: {
    label: '建筑构件',
    items: [
      { id: 'arch_001', name: '门-单扇', bb: { w: 0.9, h: 2.1, d: 0.08 }, tags: ['建筑', '门'] },
      { id: 'arch_002', name: '门-双扇', bb: { w: 1.6, h: 2.1, d: 0.08 }, tags: ['建筑', '门'] },
      { id: 'arch_003', name: '门-旋转门', bb: { w: 1.5, h: 2.4, d: 1.5 }, tags: ['建筑', '门'] },
      { id: 'arch_004', name: '窗-推拉窗', bb: { w: 1.2, h: 1.4, d: 0.06 }, tags: ['建筑', '窗'] },
      { id: 'arch_005', name: '窗-平开窗', bb: { w: 0.8, h: 1.2, d: 0.06 }, tags: ['建筑', '窗'] },
      { id: 'arch_006', name: '窗-落地窗', bb: { w: 2.0, h: 2.4, d: 0.06 }, tags: ['建筑', '窗'] },
      { id: 'arch_007', name: '窗-天窗', bb: { w: 1.0, h: 0.06, d: 1.0 }, tags: ['建筑', '窗'] },
      { id: 'arch_008', name: '柱子-圆柱', bb: { w: 0.3, h: 2.5, d: 0.3 }, tags: ['建筑', '柱子'] },
      { id: 'arch_009', name: '柱子-方柱', bb: { w: 0.35, h: 2.5, d: 0.35 }, tags: ['建筑', '柱子'] },
      { id: 'arch_010', name: '台阶-单段', bb: { w: 2.0, h: 0.2, d: 0.3 }, tags: ['建筑', '台阶'] },
      { id: 'arch_011', name: '楼梯-直梯', bb: { w: 1.0, h: 2.5, d: 3.0 }, tags: ['建筑', '楼梯'] },
      { id: 'arch_012', name: '楼梯-旋转梯', bb: { w: 1.5, h: 2.5, d: 1.5 }, tags: ['建筑', '楼梯'] },
      { id: 'arch_013', name: '栏杆-阳台', bb: { w: 3.0, h: 1.1, d: 0.05 }, tags: ['建筑', '栏杆'] },
      { id: 'arch_014', name: '栏杆-楼梯', bb: { w: 1.0, h: 1.0, d: 0.05 }, tags: ['建筑', '栏杆'] },
      { id: 'arch_015', name: '拱门', bb: { w: 1.5, h: 2.5, d: 0.3 }, tags: ['建筑', '拱门'] },
      { id: 'arch_016', name: '柱子-罗马柱', bb: { w: 0.4, h: 2.5, d: 0.4 }, tags: ['建筑', '装饰柱'] },
      { id: 'arch_017', name: '柱子-中式柱', bb: { w: 0.3, h: 2.5, d: 0.3 }, tags: ['建筑', '中式'] },
      { id: 'arch_018', name: '瓦片-中式', bb: { w: 0.5, h: 0.15, d: 0.3 }, tags: ['建筑', '中式'] },
      { id: 'arch_019', name: '墙-砖墙段', bb: { w: 2.0, h: 2.5, d: 0.2 }, tags: ['建筑', '墙'] },
      { id: 'arch_020', name: '墙-矮墙', bb: { w: 2.0, h: 1.0, d: 0.15 }, tags: ['建筑', '墙'] },
      { id: 'arch_021', name: '围栏-木质', bb: { w: 1.5, h: 1.2, d: 0.05 }, tags: ['建筑', '围栏'] },
      { id: 'arch_022', name: '围栏-金属', bb: { w: 1.5, h: 1.2, d: 0.05 }, tags: ['建筑', '围栏'] },
      { id: 'arch_023', name: '招牌-横幅', bb: { w: 1.5, h: 0.4, d: 0.05 }, tags: ['商业', '招牌'] },
      { id: 'arch_024', name: '招牌-灯箱', bb: { w: 0.8, h: 1.2, d: 0.1 }, tags: ['商业', '招牌'] },
      { id: 'arch_025', name: '霓虹灯管', bb: { w: 1.0, h: 0.1, d: 0.05 }, tags: ['商业', '霓虹'] },
    ]
  },
  nature: {
    label: '自然',
    items: [
      { id: 'nat_001', name: '石头-小石块', bb: { w: 0.15, h: 0.1, d: 0.12 }, tags: ['自然', '石头'] },
      { id: 'nat_002', name: '石头-大岩石', bb: { w: 1.0, h: 0.6, d: 0.8 }, tags: ['自然', '石头'] },
      { id: 'nat_003', name: '石头-鹅卵石堆', bb: { w: 0.6, h: 0.3, d: 0.5 }, tags: ['自然', '石头'] },
      { id: 'nat_004', name: '树-松树', bb: { w: 1.5, h: 5.0, d: 1.5 }, tags: ['自然', '树'] },
      { id: 'nat_005', name: '树-橡树', bb: { w: 2.5, h: 4.0, d: 2.5 }, tags: ['自然', '树'] },
      { id: 'nat_006', name: '树-棕榈树', bb: { w: 1.5, h: 8.0, d: 1.5 }, tags: ['自然', '树'] },
      { id: 'nat_007', name: '树-樱花树', bb: { w: 2.0, h: 4.5, d: 2.0 }, tags: ['自然', '树'] },
      { id: 'nat_008', name: '树-枯树', bb: { w: 0.5, h: 5.0, d: 0.5 }, tags: ['自然', '树'] },
      { id: 'nat_009', name: '灌木-圆形', bb: { w: 1.0, h: 0.8, d: 1.0 }, tags: ['自然', '灌木'] },
      { id: 'nat_010', name: '灌木-方形', bb: { w: 0.6, h: 0.6, d: 0.6 }, tags: ['自然', '灌木'] },
      { id: 'nat_011', name: '花朵-玫瑰', bb: { w: 0.1, h: 0.3, d: 0.1 }, tags: ['自然', '花'] },
      { id: 'nat_012', name: '花朵-雏菊', bb: { w: 0.08, h: 0.25, d: 0.08 }, tags: ['自然', '花'] },
      { id: 'nat_013', name: '花朵-向日葵', bb: { w: 0.12, h: 0.5, d: 0.12 }, tags: ['自然', '花'] },
      { id: 'nat_014', name: '花朵-薰衣草', bb: { w: 0.06, h: 0.4, d: 0.06 }, tags: ['自然', '花'] },
      { id: 'nat_015', name: '草丛', bb: { w: 1.0, h: 0.15, d: 1.0 }, tags: ['自然', '草'] },
      { id: 'nat_016', name: '草地-长草', bb: { w: 1.5, h: 0.3, d: 1.5 }, tags: ['自然', '草'] },
      { id: 'nat_017', name: '石头-巨石', bb: { w: 2.0, h: 1.5, d: 1.8 }, tags: ['自然', '巨石'] },
      { id: 'nat_018', name: '石头-岩石堆', bb: { w: 3.0, h: 2.0, d: 2.0 }, tags: ['自然', '岩石'] },
      { id: 'nat_019', name: '石头-悬崖', bb: { w: 4.0, h: 3.0, d: 2.0 }, tags: ['自然', '悬崖'] },
      { id: 'nat_020', name: '蘑菇-小朵', bb: { w: 0.1, h: 0.1, d: 0.1 }, tags: ['自然', '蘑菇'] },
      { id: 'nat_021', name: '蘑菇-大型', bb: { w: 0.4, h: 0.3, d: 0.4 }, tags: ['自然', '蘑菇'] },
      { id: 'nat_022', name: '棕榈叶', bb: { w: 0.8, h: 0.1, d: 0.3 }, tags: ['自然', '叶子'] },
      { id: 'nat_023', name: '枫叶', bb: { w: 0.15, h: 0.02, d: 0.12 }, tags: ['自然', '叶子'] },
      { id: 'nat_024', name: '芦苇丛', bb: { w: 1.0, h: 1.5, d: 0.5 }, tags: ['自然', '芦苇'] },
      { id: 'nat_025', name: '竹子', bb: { w: 0.05, h: 4.0, d: 0.05 }, tags: ['自然', '竹子'] },
      { id: 'nat_026', name: '竹子-丛', bb: { w: 1.0, h: 3.0, d: 1.0 }, tags: ['自然', '竹子'] },
      { id: 'nat_027', name: '树根', bb: { w: 1.5, h: 0.3, d: 0.8 }, tags: ['自然', '根'] },
      { id: 'nat_028', name: '树桩', bb: { w: 0.6, h: 0.8, d: 0.6 }, tags: ['自然', '树桩'] },
      { id: 'nat_029', name: '落叶堆', bb: { w: 0.5, h: 0.1, d: 0.4 }, tags: ['自然', '落叶'] },
      { id: 'nat_030', name: '珊瑚-大型', bb: { w: 0.8, h: 1.2, d: 0.8 }, tags: ['自然', '珊瑚'] },
    ]
  },
  vehicles: {
    label: '交通工具',
    items: [
      { id: 'veh_001', name: '轿车-现代', bb: { w: 2.0, h: 1.4, d: 4.5 }, tags: ['车', '轿车'] },
      { id: 'veh_002', name: '跑车-敞篷', bb: { w: 2.0, h: 1.2, d: 4.0 }, tags: ['车', '跑车'] },
      { id: 'veh_003', name: 'SUV', bb: { w: 2.0, h: 1.6, d: 4.5 }, tags: ['车', 'SUV'] },
      { id: 'veh_004', name: '面包车', bb: { w: 2.0, h: 2.0, d: 4.5 }, tags: ['车', '面包'] },
      { id: 'veh_005', name: '卡车-厢式', bb: { w: 2.5, h: 2.8, d: 6.0 }, tags: ['车', '卡车'] },
      { id: 'veh_006', name: '摩托车-跑车', bb: { w: 0.8, h: 1.2, d: 2.0 }, tags: ['车', '摩托'] },
      { id: 'veh_007', name: '摩托车-巡航', bb: { w: 0.8, h: 1.0, d: 2.2 }, tags: ['车', '摩托'] },
      { id: 'veh_008', name: '自行车', bb: { w: 0.6, h: 1.0, d: 1.8 }, tags: ['车', '单车'] },
      { id: 'veh_009', name: '电动车-单车', bb: { w: 0.6, h: 1.1, d: 1.8 }, tags: ['车', '单车'] },
      { id: 'veh_010', name: '共享单车', bb: { w: 0.6, h: 1.0, d: 1.8 }, tags: ['车', '单车'] },
      { id: 'veh_011', name: '滑板车', bb: { w: 0.2, h: 1.0, d: 1.2 }, tags: ['车', '滑板车'] },
      { id: 'veh_012', name: '滑板', bb: { w: 0.2, h: 0.03, d: 0.8 }, tags: ['车', '滑板'] },
      { id: 'veh_013', name: '飞机-客机', bb: { w: 15.0, h: 5.0, d: 55.0 }, tags: ['航空', '飞机'] },
      { id: 'veh_014', name: '飞机-螺旋桨', bb: { w: 8.0, h: 3.0, d: 20.0 }, tags: ['航空', '飞机'] },
      { id: 'veh_015', name: '直升机', bb: { w: 6.0, h: 3.0, d: 6.0 }, tags: ['航空', '直升机'] },
      { id: 'veh_016', name: '帆船', bb: { w: 5.0, h: 12.0, d: 12.0 }, tags: ['船', '帆船'] },
      { id: 'veh_017', name: '游艇', bb: { w: 3.0, h: 2.0, d: 10.0 }, tags: ['船', '游艇'] },
      { id: 'veh_018', name: '小船-划艇', bb: { w: 0.8, h: 0.5, d: 3.0 }, tags: ['船', '小舟'] },
      { id: 'veh_019', name: '救生艇', bb: { w: 1.0, h: 0.6, d: 3.5 }, tags: ['船', '救生'] },
      { id: 'veh_020', name: '火车-高铁', bb: { w: 3.2, h: 3.5, d: 20.0 }, tags: ['铁路', '火车'] },
      { id: 'veh_021', name: '火车-绿皮车', bb: { w: 3.0, h: 3.5, d: 25.0 }, tags: ['铁路', '火车'] },
      { id: 'veh_022', name: '地铁车厢', bb: { w: 2.8, h: 3.2, d: 18.0 }, tags: ['铁路', '地铁'] },
      { id: 'veh_023', name: '拖拉机', bb: { w: 1.8, h: 1.5, d: 3.5 }, tags: ['车', '农用'] },
      { id: 'veh_024', name: '压路机', bb: { w: 2.5, h: 2.0, d: 5.0 }, tags: ['车', '工程'] },
      { id: 'veh_025', name: '挖掘机', bb: { w: 2.5, h: 2.5, d: 5.0 }, tags: ['车', '工程'] },
    ]
  },
  clothing: {
    label: '服饰',
    items: [
      { id: 'cloth_001', name: '西装-男士', bb: { w: 0.3, h: 0.5, d: 0.15 }, tags: ['服装', '西装'] },
      { id: 'cloth_002', name: '衬衫-男士', bb: { w: 0.25, h: 0.4, d: 0.12 }, tags: ['服装', '衬衫'] },
      { id: 'cloth_003', name: 'T恤-短袖', bb: { w: 0.25, h: 0.35, d: 0.1 }, tags: ['服装', 'T恤'] },
      { id: 'cloth_004', name: '连衣裙', bb: { w: 0.4, h: 0.9, d: 0.2 }, tags: ['服装', '裙装'] },
      { id: 'cloth_005', name: '牛仔裤', bb: { w: 0.25, h: 0.9, d: 0.15 }, tags: ['服装', '裤子'] },
      { id: 'cloth_006', name: '西装裤', bb: { w: 0.25, h: 0.9, d: 0.15 }, tags: ['服装', '裤子'] },
      { id: 'cloth_007', name: '运动鞋', bb: { w: 0.25, h: 0.1, d: 0.1 }, tags: ['鞋', '运动'] },
      { id: 'cloth_008', name: '皮鞋', bb: { w: 0.25, h: 0.1, d: 0.1 }, tags: ['鞋', '正式'] },
      { id: 'cloth_009', name: '高跟鞋', bb: { w: 0.1, h: 0.15, d: 0.1 }, tags: ['鞋', '女鞋'] },
      { id: 'cloth_010', name: '围巾', bb: { w: 0.15, h: 0.6, d: 0.02 }, tags: ['配饰', '围巾'] },
      { id: 'cloth_011', name: '手套', bb: { w: 0.1, h: 0.2, d: 0.05 }, tags: ['配饰', '手套'] },
      { id: 'cloth_012', name: '领带', bb: { w: 0.04, h: 0.6, d: 0.01 }, tags: ['配饰', '领带'] },
      { id: 'cloth_013', name: '腰带', bb: { w: 0.3, h: 0.04, d: 0.02 }, tags: ['配饰', '腰带'] },
      { id: 'cloth_014', name: '胸针', bb: { w: 0.04, h: 0.04, d: 0.01 }, tags: ['配饰', '胸针'] },
      { id: 'cloth_015', name: '手表', bb: { w: 0.05, h: 0.04, d: 0.02 }, tags: ['配饰', '手表'] },
      { id: 'cloth_016', name: '戒指', bb: { w: 0.03, h: 0.01, d: 0.03 }, tags: ['配饰', '戒指'] },
      { id: 'cloth_017', name: '项链', bb: { w: 0.15, h: 0.2, d: 0.01 }, tags: ['配饰', '项链'] },
      { id: 'cloth_018', name: '耳环', bb: { w: 0.02, h: 0.04, d: 0.02 }, tags: ['配饰', '耳环'] },
      { id: 'cloth_019', name: '外套-风衣', bb: { w: 0.3, h: 0.7, d: 0.15 }, tags: ['服装', '外套'] },
      { id: 'cloth_020', name: '外套-皮夹克', bb: { w: 0.28, h: 0.55, d: 0.14 }, tags: ['服装', '外套'] },
    ]
  },
  food: {
    label: '食物',
    items: [
      { id: 'food_001', name: '苹果', bb: { w: 0.08, h: 0.08, d: 0.08 }, tags: ['水果', '苹果'] },
      { id: 'food_002', name: '香蕉', bb: { w: 0.06, h: 0.15, d: 0.04 }, tags: ['水果', '香蕉'] },
      { id: 'food_003', name: '橙子', bb: { w: 0.09, h: 0.08, d: 0.09 }, tags: ['水果', '橙子'] },
      { id: 'food_004', name: '葡萄串', bb: { w: 0.08, h: 0.12, d: 0.06 }, tags: ['水果', '葡萄'] },
      { id: 'food_005', name: '西瓜', bb: { w: 0.25, h: 0.2, d: 0.2 }, tags: ['水果', '西瓜'] },
      { id: 'food_006', name: '蛋糕-生日', bb: { w: 0.25, h: 0.2, d: 0.25 }, tags: ['甜点', '蛋糕'] },
      { id: 'food_007', name: '蛋糕-切片', bb: { w: 0.12, h: 0.15, d: 0.15 }, tags: ['甜点', '蛋糕'] },
      { id: 'food_008', name: '面包-法棍', bb: { w: 0.06, h: 0.06, d: 0.3 }, tags: ['主食', '面包'] },
      { id: 'food_009', name: '面包-吐司', bb: { w: 0.12, h: 0.1, d: 0.12 }, tags: ['主食', '面包'] },
      { id: 'food_010', name: '三明治', bb: { w: 0.12, h: 0.06, d: 0.12 }, tags: ['主食', '三明治'] },
      { id: 'food_011', name: '汉堡包', bb: { w: 0.15, h: 0.08, d: 0.15 }, tags: ['主食', '汉堡'] },
      { id: 'food_012', name: '披萨-整盘', bb: { w: 0.3, h: 0.03, d: 0.3 }, tags: ['主食', '披萨'] },
      { id: 'food_013', name: '披萨-切片', bb: { w: 0.15, h: 0.03, d: 0.12 }, tags: ['主食', '披萨'] },
      { id: 'food_014', name: '意大利面', bb: { w: 0.2, h: 0.08, d: 0.15 }, tags: ['主食', '意面'] },
      { id: 'food_015', name: '寿司-盘子', bb: { w: 0.25, h: 0.04, d: 0.18 }, tags: ['主食', '寿司'] },
      { id: 'food_016', name: '寿司-卷', bb: { w: 0.06, h: 0.04, d: 0.08 }, tags: ['主食', '寿司'] },
      { id: 'food_017', name: '面条-碗装', bb: { w: 0.15, h: 0.08, d: 0.15 }, tags: ['主食', '面条'] },
      { id: 'food_018', name: '米饭-碗装', bb: { w: 0.12, h: 0.06, d: 0.12 }, tags: ['主食', '米饭'] },
      { id: 'food_019', name: '碗-大', bb: { w: 0.18, h: 0.1, d: 0.18 }, tags: ['餐具', '碗'] },
      { id: 'food_020', name: '盘子-餐盘', bb: { w: 0.25, h: 0.02, d: 0.25 }, tags: ['餐具', '盘子'] },
      { id: 'food_021', name: '盘子-沙拉', bb: { w: 0.2, h: 0.04, d: 0.2 }, tags: ['餐具', '盘子'] },
      { id: 'food_022', name: '叉子', bb: { w: 0.02, h: 0.01, d: 0.2 }, tags: ['餐具', '叉子'] },
      { id: 'food_023', name: '勺子', bb: { w: 0.04, h: 0.02, d: 0.18 }, tags: ['餐具', '勺子'] },
      { id: 'food_024', name: '筷子', bb: { w: 0.01, h: 0.01, d: 0.25 }, tags: ['餐具', '筷子'] },
      { id: 'food_025', name: '刀', bb: { w: 0.03, h: 0.01, d: 0.25 }, tags: ['餐具', '刀'] },
    ]
  },
  electronic: {
    label: '电子设备',
    items: [
      { id: 'elec_001', name: '电视机-55寸', bb: { w: 1.2, h: 0.7, d: 0.08 }, tags: ['电视', '大屏'] },
      { id: 'elec_002', name: '电视机-壁挂', bb: { w: 1.2, h: 0.7, d: 0.05 }, tags: ['电视', '壁挂'] },
      { id: 'elec_003', name: '投影仪', bb: { w: 0.35, h: 0.12, d: 0.25 }, tags: ['投影', '设备'] },
      { id: 'elec_004', name: '打印机', bb: { w: 0.4, h: 0.35, d: 0.35 }, tags: ['打印', '设备'] },
      { id: 'elec_005', name: '扫描仪', bb: { w: 0.35, h: 0.06, d: 0.25 }, tags: ['扫描', '设备'] },
      { id: 'elec_006', name: '路由器', bb: { w: 0.2, h: 0.05, d: 0.15 }, tags: ['网络', '路由'] },
      { id: 'elec_007', name: '智能音箱', bb: { w: 0.15, h: 0.2, d: 0.15 }, tags: ['音响', '智能'] },
      { id: 'elec_008', name: '空调-壁挂', bb: { w: 0.8, h: 0.25, d: 0.2 }, tags: ['空调', '壁挂'] },
      { id: 'elec_009', name: '空调-立式', bb: { w: 0.4, h: 1.6, d: 0.4 }, tags: ['空调', '立式'] },
      { id: 'elec_010', name: '冰箱-双门', bb: { w: 0.8, h: 1.8, d: 0.65 }, tags: ['冰箱', '双门'] },
      { id: 'elec_011', name: '冰箱-单门', bb: { w: 0.55, h: 1.5, d: 0.55 }, tags: ['冰箱', '单门'] },
      { id: 'elec_012', name: '洗衣机', bb: { w: 0.6, h: 0.85, d: 0.5 }, tags: ['洗衣机', '家电'] },
      { id: 'elec_013', name: '微波炉', bb: { w: 0.45, h: 0.3, d: 0.35 }, tags: ['微波炉', '厨房'] },
      { id: 'elec_014', name: '烤箱', bb: { w: 0.55, h: 0.65, d: 0.55 }, tags: ['烤箱', '厨房'] },
      { id: 'elec_015', name: '电磁炉', bb: { w: 0.5, h: 0.03, d: 0.6 }, tags: ['电磁炉', '厨房'] },
      { id: 'elec_016', name: '咖啡机', bb: { w: 0.3, h: 0.35, d: 0.2 }, tags: ['咖啡', '厨房'] },
      { id: 'elec_017', name: '榨汁机', bb: { w: 0.2, h: 0.3, d: 0.2 }, tags: ['榨汁', '厨房'] },
      { id: 'elec_018', name: '搅拌机', bb: { w: 0.18, h: 0.3, d: 0.18 }, tags: ['搅拌', '厨房'] },
      { id: 'elec_019', name: '电吹风', bb: { w: 0.12, h: 0.25, d: 0.06 }, tags: ['电吹风', '个护'] },
      { id: 'elec_020', name: '熨斗', bb: { w: 0.2, h: 0.1, d: 0.12 }, tags: ['熨斗', '个护'] },
      { id: 'elec_021', name: '吸尘器', bb: { w: 0.3, h: 0.9, d: 0.3 }, tags: ['吸尘器', '清洁'] },
      { id: 'elec_022', name: '扫地机器人', bb: { w: 0.3, h: 0.08, d: 0.3 }, tags: ['扫地机', '清洁'] },
      { id: 'elec_023', name: '监控摄像头', bb: { w: 0.08, h: 0.06, d: 0.1 }, tags: ['监控', '安防'] },
      { id: 'elec_024', name: '无人机', bb: { w: 0.5, h: 0.1, d: 0.5 }, tags: ['无人机', '航拍'] },
      { id: 'elec_025', name: 'VR头显', bb: { w: 0.2, h: 0.1, d: 0.12 }, tags: ['VR', '设备'] },
      { id: 'elec_026', name: '游戏手柄', bb: { w: 0.15, h: 0.05, d: 0.1 }, tags: ['游戏', '手柄'] },
      { id: 'elec_027', name: '游戏机', bb: { w: 0.25, h: 0.05, d: 0.15 }, tags: ['游戏', '主机'] },
      { id: 'elec_028', name: '服务器', bb: { w: 0.5, h: 1.8, d: 0.6 }, tags: ['服务器', 'IT'] },
      { id: 'elec_029', name: 'UPS电源', bb: { w: 0.4, h: 0.2, d: 0.35 }, tags: ['电源', 'IT'] },
      { id: 'elec_030', name: '充电宝', bb: { w: 0.08, h: 0.05, d: 0.15 }, tags: ['电源', '移动'] },
    ]
  },
  weapons: {
    label: '武器/工具',
    items: [
      { id: 'weap_001', name: '锤子', bb: { w: 0.05, h: 0.05, d: 0.25 }, tags: ['工具', '锤子'] },
      { id: 'weap_002', name: '螺丝刀', bb: { w: 0.03, h: 0.03, d: 0.2 }, tags: ['工具', '螺丝刀'] },
      { id: 'weap_003', name: '扳手', bb: { w: 0.04, h: 0.04, d: 0.25 }, tags: ['工具', '扳手'] },
      { id: 'weap_004', name: '锯子', bb: { w: 0.04, h: 0.03, d: 0.4 }, tags: ['工具', '锯子'] },
      { id: 'weap_005', name: '钳子', bb: { w: 0.05, h: 0.04, d: 0.18 }, tags: ['工具', '钳子'] },
      { id: 'weap_006', name: '卷尺', bb: { w: 0.12, h: 0.08, d: 0.06 }, tags: ['工具', '测量'] },
      { id: 'weap_007', name: '水平尺', bb: { w: 0.04, h: 0.03, d: 0.4 }, tags: ['工具', '测量'] },
      { id: 'weap_008', name: '电钻', bb: { w: 0.08, h: 0.08, d: 0.25 }, tags: ['工具', '电钻'] },
      { id: 'weap_009', name: '工具箱', bb: { w: 0.45, h: 0.3, d: 0.3 }, tags: ['工具', '箱子'] },
      { id: 'weap_010', name: '灭火器', bb: { w: 0.2, h: 0.45, d: 0.2 }, tags: ['安全', '灭火器'] },
      { id: 'weap_011', name: '警示牌', bb: { w: 0.3, h: 0.25, d: 0.02 }, tags: ['安全', '警示'] },
      { id: 'weap_012', name: '路障', bb: { w: 0.3, h: 0.5, d: 1.0 }, tags: ['安全', '路障'] },
      { id: 'weap_013', name: '梯子-直梯', bb: { w: 0.5, h: 2.0, d: 0.08 }, tags: ['工具', '梯子'] },
      { id: 'weap_014', name: '梯子-A型梯', bb: { w: 0.5, h: 1.8, d: 0.5 }, tags: ['工具', '梯子'] },
      { id: 'weap_015', name: '拖把', bb: { w: 0.05, h: 0.05, d: 1.2 }, tags: ['清洁', '拖把'] },
      { id: 'weap_016', name: '扫帚', bb: { w: 0.08, h: 0.08, d: 1.0 }, tags: ['清洁', '扫帚'] },
      { id: 'weap_017', name: '垃圾桶', bb: { w: 0.4, h: 0.6, d: 0.4 }, tags: ['清洁', '垃圾桶'] },
      { id: 'weap_018', name: '垃圾桶-带盖', bb: { w: 0.4, h: 0.7, d: 0.4 }, tags: ['清洁', '垃圾桶'] },
      { id: 'weap_019', name: '雨伞-打开', bb: { w: 0.8, h: 1.0, d: 0.8 }, tags: ['雨具', '雨伞'] },
      { id: 'weap_020', name: '雨伞-收起', bb: { w: 0.04, h: 0.04, d: 0.8 }, tags: ['雨具', '雨伞'] },
      { id: 'weap_021', name: '手电筒', bb: { w: 0.04, h: 0.04, d: 0.2 }, tags: ['照明', '手电'] },
      { id: 'weap_022', name: '绳索-卷', bb: { w: 0.2, h: 0.15, d: 0.2 }, tags: ['工具', '绳索'] },
      { id: 'weap_023', name: '胶带-卷', bb: { w: 0.1, h: 0.06, d: 0.1 }, tags: ['工具', '胶带'] },
      { id: 'weap_024', name: '剪刀', bb: { w: 0.04, h: 0.02, d: 0.15 }, tags: ['工具', '剪刀'] },
      { id: 'weap_025', name: '胶带-切割器', bb: { w: 0.12, h: 0.08, d: 0.08 }, tags: ['工具', '胶带'] },
    ]
  },
  decorative: {
    label: '装饰',
    items: [
      { id: 'deco_001', name: '地球仪', bb: { w: 0.3, h: 0.35, d: 0.3 }, tags: ['装饰', '地球仪'] },
      { id: 'deco_002', name: '奖杯', bb: { w: 0.2, h: 0.3, d: 0.2 }, tags: ['装饰', '奖杯'] },
      { id: 'deco_003', name: '奖牌', bb: { w: 0.1, h: 0.1, d: 0.02 }, tags: ['装饰', '奖牌'] },
      { id: 'deco_004', name: '皇冠', bb: { w: 0.15, h: 0.1, d: 0.15 }, tags: ['装饰', '皇冠'] },
      { id: 'deco_005', name: '烛台', bb: { w: 0.15, h: 0.3, d: 0.15 }, tags: ['装饰', '烛台'] },
      { id: 'deco_006', name: '花瓶-水晶', bb: { w: 0.12, h: 0.4, d: 0.12 }, tags: ['装饰', '花瓶'] },
      { id: 'deco_007', name: '花瓶-陶瓷', bb: { w: 0.15, h: 0.3, d: 0.15 }, tags: ['装饰', '花瓶'] },
      { id: 'deco_008', name: '雕塑-抽象', bb: { w: 0.4, h: 0.6, d: 0.4 }, tags: ['装饰', '雕塑'] },
      { id: 'deco_009', name: '雕塑-人像', bb: { w: 0.3, h: 0.8, d: 0.3 }, tags: ['装饰', '雕塑'] },
      { id: 'deco_010', name: '灯笼-中式', bb: { w: 0.25, h: 0.3, d: 0.25 }, tags: ['装饰', '灯笼'] },
      { id: 'deco_011', name: '灯笼-日式', bb: { w: 0.2, h: 0.3, d: 0.2 }, tags: ['装饰', '灯笼'] },
      { id: 'deco_012', name: '彩带', bb: { w: 0.02, h: 0.01, d: 1.0 }, tags: ['装饰', '彩带'] },
      { id: 'deco_013', name: '气球-单个', bb: { w: 0.15, h: 0.2, d: 0.15 }, tags: ['装饰', '气球'] },
      { id: 'deco_014', name: '气球-束', bb: { w: 0.5, h: 0.6, d: 0.5 }, tags: ['装饰', '气球'] },
      { id: 'deco_015', name: '拉花-横幅', bb: { w: 1.5, h: 0.2, d: 0.02 }, tags: ['装饰', '拉花'] },
      { id: 'deco_016', name: '圣诞树', bb: { w: 1.0, h: 2.5, d: 1.0 }, tags: ['装饰', '圣诞'] },
      { id: 'deco_017', name: '圣诞礼物', bb: { w: 0.2, h: 0.2, d: 0.2 }, tags: ['装饰', '圣诞'] },
      { id: 'deco_018', name: '彩灯-串灯', bb: { w: 0.02, h: 0.02, d: 2.0 }, tags: ['装饰', '彩灯'] },
      { id: 'deco_019', name: '挂饰-风铃', bb: { w: 0.1, h: 0.4, d: 0.1 }, tags: ['装饰', '风铃'] },
      { id: 'deco_020', name: '挂饰-中国结', bb: { w: 0.2, h: 0.3, d: 0.1 }, tags: ['装饰', '中国结'] },
      { id: 'deco_021', name: '镜子-壁挂', bb: { w: 0.6, h: 1.2, d: 0.04 }, tags: ['装饰', '镜子'] },
      { id: 'deco_022', name: '镜子-落地', bb: { w: 0.6, h: 1.5, d: 0.05 }, tags: ['装饰', '镜子'] },
      { id: 'deco_023', name: '地毯-方形', bb: { w: 2.0, h: 0.02, d: 2.0 }, tags: ['装饰', '地毯'] },
      { id: 'deco_024', name: '地毯-圆形', bb: { w: 2.0, h: 0.02, d: 2.0 }, tags: ['装饰', '地毯'] },
      { id: 'deco_025', name: '窗帘-落地', bb: { w: 0.05, h: 2.4, d: 2.0 }, tags: ['装饰', '窗帘'] },
      { id: 'deco_026', name: '窗帘-半截', bb: { w: 0.05, h: 1.2, d: 1.0 }, tags: ['装饰', '窗帘'] },
      { id: 'deco_027', name: '壁炉', bb: { w: 1.2, h: 1.2, d: 0.5 }, tags: ['装饰', '壁炉'] },
      { id: 'deco_028', name: '书架装饰摆件', bb: { w: 0.15, h: 0.2, d: 0.1 }, tags: ['装饰', '摆件'] },
      { id: 'deco_029', name: '招财猫摆件', bb: { w: 0.15, h: 0.2, d: 0.12 }, tags: ['装饰', '摆件'] },
      { id: 'deco_030', name: '花瓶-干花', bb: { w: 0.12, h: 0.5, d: 0.12 }, tags: ['装饰', '花瓶'] },
    ]
  }
}

export function usePropLibrary() {
  const allProps = computed<PropModel[]>(() => {
    const result: PropModel[] = []
    Object.entries(categories).forEach(([catKey, cat]) => {
      cat.items.forEach(item => {
        result.push({
          id: item.id,
          name: item.name,
          category: catKey as PropCategory,
          description: item.desc,
          boundingBox: { width: item.bb.w, height: item.bb.h, depth: item.bb.d },
          tags: item.tags
        })
      })
    })
    return result
  })

  const categoriesList = computed(() => {
    return Object.entries(categories).map(([key, val]) => ({
      key,
      label: val.label,
      icon: getIconForCategory(key),
      count: val.items.length
    }))
  })

  const categoryIconMap: Record<string, string> = {
    furniture: 'M19 13V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v8m0 0V7h10v6M19 13H7m0 0v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2z M9 18v2 M15 18v2',
    props: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    architecture: 'M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3',
    nature: 'M12 2C7.5 2 4 5.5 4 10c0 3.5 2 6 4 8h8c2-2 4-4.5 4-8 0-4.5-3.5-8-8-8z M12 18c-2 1.5-4 3-4 5h8c0-1.5-2-3.5-4-5z',
    vehicles: 'M1 14h3v7h16v-7h3l-1-8H2l-1 8zm5 7v-3h8v3M2 12h20M4 4l1-2h14l1 2',
    clothing: 'M20.5 7c-.5-2.5-2.5-3.5-4-3-1.5.5-1.5 2.5-1 4l-3 1.5L9.5 8c.5-1.5.5-3.5-1-4-1.5-.5-3.5.5-4 3l2 4v7h12V11l2-4z',
    food: 'M5 5v14h14V5H5zm2 2h10v10H7V7z M7 3h10v2H7V3z',
    electronic: 'M4 6h16v12H4V6z M6 18v2h12v-2 M12 8h4v8h-4V8z',
    weapons: 'M14.5 2l6 6-2 2-1.5-1.5L6 18.5 2 22l3.5-3.5 9.5-9.5-1.5-1.5L12 5.5z',
    decorative: 'M12 2l2.5 6.5L21 9l-5 4.5L17.5 21 12 17.5 6.5 21 8 13.5 3 9l6.5-.5L12 2z'
  }

  function getIconForCategory(key: string): string {
    return categoryIconMap[key] || 'M19 11H5v-2h14v2z'
  }

  function searchProps(query: string, category?: string): PropModel[] {
    const q = query.toLowerCase()
    return allProps.value.filter((prop: PropModel) => {
      const matchCategory = !category || prop.category === (category as PropCategory)
      const matchQuery = !q || prop.name.toLowerCase().includes(q) || prop.tags.some((t: string) => t.includes(q)) || (prop.description && prop.description.includes(q))
      return matchCategory && matchQuery
    })
  }

  function getPropsByCategory(category: string): PropModel[] {
    return allProps.value.filter((p: PropModel) => p.category === (category as PropCategory))
  }

  return {
    allProps,
    categoriesList,
    searchProps,
    getPropsByCategory
  }
}