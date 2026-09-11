#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""生成专业的产品架构图、流程图、泳道图"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Polygon, Rectangle
import numpy as np

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei', 'Arial Unicode MS']
plt.rcParams['axes.unicode_minus'] = False

# 颜色配置
COLORS = {
    'user': '#1E3A8A',
    'app': '#2563EB',
    'hermes': '#7C3AED',
    'service': '#10B981',
    'data': '#D97706',
    'process': '#3B82F6',
    'decision': '#F59E0B',
    'start_end': '#10B981',
    'io': '#8B5CF6',
    'arrow': '#1E3A8A',
    'lane_bg': ['#EFF6FF', '#F0FDF4', '#FDF4FF', '#FFFBEB', '#FEF2F2'],
    'lane_header': ['#1E3A8A', '#10B981', '#7C3AED', '#D97706', '#DC2626']
}

def draw_rounded_box(ax, x, y, width, height, text, color, fontsize=9, text_color='white'):
    """绘制圆角矩形框"""
    box = FancyBboxPatch((x, y), width, height,
                          boxstyle="round,pad=0.02,rounding_size=0.1",
                          facecolor=color, edgecolor='white', linewidth=1.5, alpha=0.95)
    ax.add_patch(box)
    ax.text(x + width/2, y + height/2, text, ha='center', va='center',
            fontsize=fontsize, color=text_color, fontweight='bold', wrap=True)

def draw_arrow(ax, x1, y1, x2, y2, color='#1E3A8A', style='->', lw=1.5):
    """绘制箭头"""
    arrow = FancyArrowPatch((x1, y1), (x2, y2),
                            arrowstyle=style, color=color, lw=lw,
                            connectionstyle="arc3,rad=0")
    ax.add_patch(arrow)

# ==================== 1. 产品架构图 ====================
def draw_architecture_diagram(output_path):
    fig, ax = plt.subplots(1, 1, figsize=(14, 10))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 10)
    ax.axis('off')

    # 标题
    ax.text(7, 9.6, '基于 Hermes Agent 多轮对话的图片生成提示词优化产品架构图',
            ha='center', va='center', fontsize=14, fontweight='bold', color='#1E3A8A')

    # 定义各层
    layers = [
        {'name': '用户层', 'y': 8.2, 'color': COLORS['user'], 'components': [
            '短剧创作者', '运营人员', '质检人员'
        ]},
        {'name': '应用层', 'y': 6.5, 'color': COLORS['app'], 'components': [
            '主体设置模块\n(含用户确认)', '图片生成模块', '质量检测模块', '资产库管理模块'
        ]},
        {'name': 'Hermes Agent 多轮对话层（核心）', 'y': 4.3, 'color': COLORS['hermes'], 'components': [
            'Skills调度器', '多轮对话\n管理器', '上下文注入器\n(剧集/剧本)', '提示词优化\nAgent', '质量分析\nAgent', '迭代优化\nAgent'
        ]},
        {'name': '服务层', 'y': 2.5, 'color': COLORS['service'], 'components': [
            '提示词Skills\n模板库(92套)', '人物特征\n锁定服务', '模型网关', '图像质量\n分析服务', '剧情上下文\n服务'
        ]},
        {'name': '数据层', 'y': 0.8, 'color': COLORS['data'], 'components': [
            '主体资产库', '提示词知识库', '生成历史库', '对话上下文存储', '剧本剧集数据库'
        ]},
    ]

    # 绘制各层
    for layer in layers:
        # 层标签
        ax.text(0.3, layer['y'] + 0.55, layer['name'], ha='left', va='center',
                fontsize=10, fontweight='bold', color=layer['color'])

        # 层背景
        layer_bg = FancyBboxPatch((0.8, layer['y']), 12.8, 1.1,
                                   boxstyle="round,pad=0.02,rounding_size=0.1",
                                   facecolor=layer['color'], alpha=0.08, edgecolor=layer['color'], linewidth=1)
        ax.add_patch(layer_bg)

        # 组件
        n = len(layer['components'])
        total_width = 12.4
        comp_width = total_width / n - 0.15
        start_x = 1.0

        for i, comp in enumerate(layer['components']):
            x = start_x + i * (comp_width + 0.15)
            draw_rounded_box(ax, x, layer['y'] + 0.15, comp_width, 0.8,
                            comp, layer['color'], fontsize=8)

    # 绘制层间箭头
    for i in range(len(layers) - 1):
        y_top = layers[i]['y']
        y_bottom = layers[i+1]['y'] + 1.1
        for x_pos in [3.5, 7, 10.5]:
            draw_arrow(ax, x_pos, y_top, x_pos, y_bottom, color='#6B7280', lw=1)

    # 图例
    legend_y = 0.1
    ax.text(7, legend_y, '数据流向：用户层 → 应用层 → Hermes Agent层 → 服务层 → 数据层（双向交互）',
            ha='center', va='center', fontsize=9, color='#6B7280', style='italic')

    plt.tight_layout()
    plt.savefig(output_path, dpi=200, bbox_inches='tight', facecolor='white')
    plt.close()
    print(f'产品架构图已生成：{output_path}')

# ==================== 2. 主体创建与图片生成主流程图 ====================
def draw_main_flow_diagram(output_path):
    fig, ax = plt.subplots(1, 1, figsize=(12, 16))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 16)
    ax.axis('off')

    # 标题
    ax.text(6, 15.6, '主体创建与图片生成主流程图',
            ha='center', va='center', fontsize=14, fontweight='bold', color='#1E3A8A')

    # 流程节点定义 (x, y, width, height, text, type)
    nodes = [
        # 开始
        (4.5, 14.5, 3, 0.7, '开始', 'start'),
        # 进入主体设置页
        (4, 13.3, 4, 0.7, '进入主体设置页\n（携带剧集ID、剧本ID）', 'process'),
        # 填写主体信息
        (4, 12.1, 4, 0.7, '填写主体信息\n名称/描述/参考图/风格/镜头', 'process'),
        # 自动识别风格镜头
        (4, 10.9, 4, 0.7, '自动识别风格与镜头\n（根据描述关键词）', 'process'),
        # 点击智能优化
        (4, 9.7, 4, 0.7, '点击"智能优化提示词"\n触发Hermes Agent', 'process'),
        # Hermes 8轮优化
        (4, 8.3, 4, 1.0, 'Hermes Agent 8轮隐式对话优化\n第1轮:信息解析+上下文注入\n第2轮:特征提取  第3轮:模板匹配\n第4轮:动态填充  第5轮:质量增强\n第6轮:负面词组合  第7轮:校验优化\n第8轮:结果输出', 'hermes'),
        # 展示优化结果
        (4, 7.0, 4, 0.7, '展示优化结果\n正面/负面提示词+推荐参数', 'process'),
        # 用户确认判断
        (4.5, 5.8, 3, 0.8, '用户确认？', 'decision'),
        # 确认生成
        (1, 4.5, 3, 0.7, '确认并生成图片', 'process'),
        # 手动编辑
        (8, 4.5, 3, 0.7, '手动编辑提示词', 'process'),
        # 生成图片
        (1, 3.3, 3, 0.7, '调用图片生成模型', 'process'),
        # 质量检测
        (1, 2.1, 3, 0.7, '自动质量检测\n（四类问题检测）', 'process'),
        # 达标判断
        (1.5, 0.9, 2, 0.8, '达标？', 'decision'),
        # 保存资产
        (-1, -0.3, 2.5, 0.7, '保存到主体资产库', 'process'),
        # 迭代优化
        (5, 0.9, 3, 0.7, '触发迭代优化\n（最多3轮）', 'process'),
        # 结束
        (-1, -1.5, 2.5, 0.7, '结束', 'end'),
    ]

    # 绘制节点
    for node in nodes:
        x, y, w, h, text, ntype = node
        if ntype == 'start' or ntype == 'end':
            color = COLORS['start_end']
            box = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.02,rounding_size=0.35",
                                 facecolor=color, edgecolor='white', linewidth=2, alpha=0.95)
            ax.add_patch(box)
            ax.text(x+w/2, y+h/2, text, ha='center', va='center', fontsize=10, color='white', fontweight='bold')
        elif ntype == 'decision':
            # 菱形判断节点
            diamond = Polygon([(x+w/2, y+h), (x+w, y+h/2), (x+w/2, y), (x, y+h/2)],
                             facecolor=COLORS['decision'], edgecolor='white', linewidth=2, alpha=0.95)
            ax.add_patch(diamond)
            ax.text(x+w/2, y+h/2, text, ha='center', va='center', fontsize=9, color='white', fontweight='bold')
        elif ntype == 'hermes':
            color = COLORS['hermes']
            box = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.02,rounding_size=0.1",
                                 facecolor=color, edgecolor='#FBBF24', linewidth=2.5, alpha=0.95)
            ax.add_patch(box)
            ax.text(x+w/2, y+h/2, text, ha='center', va='center', fontsize=7.5, color='white', fontweight='bold')
        else:
            color = COLORS['process']
            box = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.02,rounding_size=0.1",
                                 facecolor=color, edgecolor='white', linewidth=1.5, alpha=0.95)
            ax.add_patch(box)
            ax.text(x+w/2, y+h/2, text, ha='center', va='center', fontsize=8.5, color='white', fontweight='bold')

    # 绘制箭头
    arrows = [
        # 主流程
        (6, 14.5, 6, 14.0),  # 开始→进入页面
        (6, 13.3, 6, 12.8),  # 进入页面→填写信息
        (6, 12.1, 6, 11.6),  # 填写信息→自动识别
        (6, 10.9, 6, 10.4),  # 自动识别→点击优化
        (6, 9.7, 6, 9.3),    # 点击优化→Hermes优化
        (6, 8.3, 6, 7.7),    # Hermes优化→展示结果
        (6, 7.0, 6, 6.6),    # 展示结果→用户确认判断
        # 用户确认分支
        (4.5, 5.8, 2.5, 5.2),  # 是→确认生成
        (7.5, 5.8, 9.5, 5.2),  # 否→手动编辑
        (9.5, 4.5, 9.5, 3.6),  # 手动编辑→回到生成（绕路）
        (9.5, 3.6, 4, 3.6),    # 手动编辑后→生成
        # 生成流程
        (2.5, 4.5, 2.5, 4.0),  # 确认生成→调用模型
        (2.5, 3.3, 2.5, 2.8),  # 调用模型→质量检测
        (2.5, 2.1, 2.5, 1.7),  # 质量检测→达标判断
        # 达标分支
        (1.5, 0.9, 0.25, 0.4),  # 是→保存资产
        (0.25, -0.3, 0.25, -0.8),  # 保存→结束
        (3.5, 1.3, 5, 1.3),    # 否→迭代优化
        (6.5, 1.3, 6.5, 3.3),  # 迭代→回到生成（循环）
    ]

    for arrow in arrows:
        x1, y1, x2, y2 = arrow
        draw_arrow(ax, x1, y1, x2, y2, color=COLORS['arrow'], lw=1.5)

    # 标注判断分支
    ax.text(3.2, 5.3, '是', fontsize=9, color='#10B981', fontweight='bold')
    ax.text(8.2, 5.3, '否', fontsize=9, color='#DC2626', fontweight='bold')
    ax.text(0.5, 0.5, '是', fontsize=9, color='#10B981', fontweight='bold')
    ax.text(4.0, 1.0, '否', fontsize=9, color='#DC2626', fontweight='bold')

    # 迭代循环标注
    ax.text(7.5, 2.3, '迭代优化循环\n(最多3轮)', fontsize=8, color='#7C3AED', fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='#FDF4FF', edgecolor='#7C3AED', alpha=0.8))

    plt.tight_layout()
    plt.savefig(output_path, dpi=200, bbox_inches='tight', facecolor='white')
    plt.close()
    print(f'主流程图已生成：{output_path}')

# ==================== 3. 跨角色协作泳道图 ====================
def draw_swimlane_diagram(output_path):
    fig, ax = plt.subplots(1, 1, figsize=(16, 10))
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 10)
    ax.axis('off')

    # 标题
    ax.text(8, 9.6, '提示词优化跨角色协作泳道图',
            ha='center', va='center', fontsize=14, fontweight='bold', color='#1E3A8A')

    # 泳道定义
    lanes = [
        {'name': '用户', 'x': 0.5, 'width': 2.8},
        {'name': '前端应用', 'x': 3.5, 'width': 2.8},
        {'name': 'Hermes Agent', 'x': 6.5, 'width': 3.0},
        {'name': '图片生成服务', 'x': 9.7, 'width': 2.8},
        {'name': '质量检测服务', 'x': 12.7, 'width': 2.8},
    ]

    # 绘制泳道背景和标题
    for i, lane in enumerate(lanes):
        # 泳道标题
        header = FancyBboxPatch((lane['x'], 8.5), lane['width'], 0.6,
                                boxstyle="round,pad=0.02,rounding_size=0.05",
                                facecolor=COLORS['lane_header'][i], edgecolor='white', linewidth=1.5)
        ax.add_patch(header)
        ax.text(lane['x'] + lane['width']/2, 8.8, lane['name'], ha='center', va='center',
                fontsize=10, color='white', fontweight='bold')

        # 泳道背景
        bg = Rectangle((lane['x'], 0.5), lane['width'], 7.8,
                       facecolor=COLORS['lane_bg'][i], edgecolor='#D1D5DB', linewidth=1, alpha=0.5)
        ax.add_patch(bg)

    # 动作节点定义 (lane_index, y, text, type)
    actions = [
        # 第一阶段：输入与优化
        (0, 7.5, '填写主体描述\n点击优化按钮', 'user'),
        (1, 7.5, '接收请求\n显示加载动画', 'app'),
        (2, 7.5, '开始8轮隐式\n对话优化', 'hermes'),
        (1, 6.3, '接收优化结果\n展示对比卡片', 'app'),
        (2, 6.3, '返回优化后\n提示词', 'hermes'),

        # 第二阶段：确认与生成
        (0, 5.1, '确认并生成\n（可编辑）', 'user'),
        (1, 5.1, '提交生成请求', 'app'),
        (3, 5.1, '生成图片', 'generate'),
        (1, 3.9, '接收图片', 'app'),
        (3, 3.9, '返回图片', 'generate'),

        # 第三阶段：检测与迭代
        (1, 2.7, '提交质量检测', 'app'),
        (4, 2.7, '执行检测\n返回报告', 'detect'),
        (0, 1.5, '查看结果\n达标保存', 'user'),
        (1, 1.5, '达标保存\n不达标触发迭代', 'app'),
        (2, 1.5, '针对性调整\n提示词', 'hermes'),
    ]

    # 绘制动作节点
    action_positions = []
    for i, (lane_idx, y, text, atype) in enumerate(actions):
        lane = lanes[lane_idx]
        x = lane['x'] + 0.2
        w = lane['width'] - 0.4
        h = 0.8

        if atype == 'user':
            color = COLORS['lane_header'][0]
        elif atype == 'app':
            color = COLORS['lane_header'][1]
        elif atype == 'hermes':
            color = COLORS['lane_header'][2]
        elif atype == 'generate':
            color = COLORS['lane_header'][3]
        elif atype == 'detect':
            color = COLORS['lane_header'][4]
        else:
            color = '#6B7280'

        box = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.02,rounding_size=0.08",
                             facecolor=color, edgecolor='white', linewidth=1.5, alpha=0.95)
        ax.add_patch(box)
        ax.text(x + w/2, y + h/2, text, ha='center', va='center',
                fontsize=7.5, color='white', fontweight='bold')

        action_positions.append((x + w/2, y + h/2, x, y, w, h))

    # 绘制箭头（按时间顺序和跨角色交互）
    arrow_pairs = [
        (0, 1),   # 用户→前端
        (1, 2),   # 前端→Hermes
        (2, 4),   # Hermes→前端（返回结果）
        (4, 3),   # 前端展示→用户确认
        (5, 6),   # 用户确认→前端提交
        (6, 7),   # 前端→生成服务
        (7, 9),   # 生成→前端（返回图片）
        (9, 8),   # 前端接收→用户查看
        (8, 10),  # 用户→前端提交检测
        (10, 11), # 前端→检测服务
        (11, 13), # 检测→前端（返回报告）
        (13, 12), # 前端→用户查看结果
        (13, 14), # 前端不达标→Hermes迭代
    ]

    for i, j in arrow_pairs:
        if i < len(action_positions) and j < len(action_positions):
            x1, y1, _, _, _, _ = action_positions[i]
            x2, y2, _, _, _, _ = action_positions[j]
            # 调整箭头起点和终点到框边缘
            if abs(x1 - x2) < 0.5:  # 同一泳道，垂直箭头
                if y1 > y2:
                    y1 -= 0.4
                    y2 += 0.4
                else:
                    y1 += 0.4
                    y2 -= 0.4
            else:  # 跨泳道，水平箭头
                if x1 < x2:
                    x1 += 1.0
                    x2 -= 1.0
                else:
                    x1 -= 1.0
                    x2 += 1.0
            draw_arrow(ax, x1, y1, x2, y2, color='#6B7280', lw=1.2)

    # 阶段分隔线和标注
    for y_pos, label in [(7.0, '第一阶段：提示词优化'), (4.5, '第二阶段：图片生成'), (2.0, '第三阶段：质量检测与迭代')]:
        ax.plot([0.5, 15.5], [y_pos, y_pos], '--', color='#9CA3AF', lw=0.8, alpha=0.5)
        ax.text(0.6, y_pos + 0.1, label, fontsize=8, color='#6B7280', fontweight='bold', alpha=0.7)

    plt.tight_layout()
    plt.savefig(output_path, dpi=200, bbox_inches='tight', facecolor='white')
    plt.close()
    print(f'泳道图已生成：{output_path}')

# 执行生成
if __name__ == '__main__':
    output_dir = r'D:\phpstudy_pro\WWW\ai-novel-workstation1.2.0'
    draw_architecture_diagram(f'{output_dir}\\architecture_diagram.png')
    draw_main_flow_diagram(f'{output_dir}\\main_flow_diagram.png')
    draw_swimlane_diagram(f'{output_dir}\\swimlane_diagram.png')
    print('所有图形生成完成！')
