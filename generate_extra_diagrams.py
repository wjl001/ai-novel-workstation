#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""生成领导汇报版所需的额外图形：四视图结构图、八轮对话流程图、质量闭环图"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Polygon, Rectangle
import numpy as np

plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei', 'Arial Unicode MS']
plt.rcParams['axes.unicode_minus'] = False

def draw_rounded_box(ax, x, y, width, height, text, color, fontsize=9, text_color='white'):
    box = FancyBboxPatch((x, y), width, height,
                          boxstyle="round,pad=0.02,rounding_size=0.1",
                          facecolor=color, edgecolor='white', linewidth=1.5, alpha=0.95)
    ax.add_patch(box)
    ax.text(x + width/2, y + height/2, text, ha='center', va='center',
            fontsize=fontsize, color=text_color, fontweight='bold', wrap=True)

def draw_arrow(ax, x1, y1, x2, y2, color='#1E3A8A', style='->', lw=1.5):
    arrow = FancyArrowPatch((x1, y1), (x2, y2),
                            arrowstyle=style, color=color, lw=lw,
                            connectionstyle="arc3,rad=0")
    ax.add_patch(arrow)

# ==================== 1. 四视图结构示意图 ====================
def draw_four_view_diagram(output_path):
    fig, ax = plt.subplots(1, 1, figsize=(14, 6))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 6)
    ax.axis('off')

    ax.text(7, 5.6, '角色四视图结构示意图（单模板一次性生成）',
            ha='center', va='center', fontsize=14, fontweight='bold', color='#1E3A8A')

    # 四个视图框
    views = [
        {'x': 0.5, 'name': '面部特写', 'desc': '肩部以上\n正面朝向\n五官细节\n眼部锁定', 'color': '#7C3AED'},
        {'x': 3.8, 'name': '正面全身', 'desc': '正面站立\n双臂下垂\n全身完整\n服饰正面', 'color': '#2563EB'},
        {'x': 7.1, 'name': '侧面全身', 'desc': '左侧面\n轮廓清晰\n鼻梁线条\n发型侧面', 'color': '#10B981'},
        {'x': 10.4, 'name': '背面全身', 'desc': '背面站立\n不回头\n后脑勺\n服饰背面', 'color': '#D97706'},
    ]

    for view in views:
        # 视图框
        box = FancyBboxPatch((view['x'], 1.5), 2.8, 3.2,
                              boxstyle="round,pad=0.02,rounding_size=0.1",
                              facecolor=view['color'], edgecolor='white', linewidth=2, alpha=0.9)
        ax.add_patch(box)
        # 视图名称
        ax.text(view['x']+1.4, 4.2, view['name'], ha='center', va='center',
                fontsize=12, color='white', fontweight='bold')
        # 视图描述
        ax.text(view['x']+1.4, 2.8, view['desc'], ha='center', va='center',
                fontsize=9, color='white')
        # 人物简笔画位置（用圆形和矩形表示）
        head = plt.Circle((view['x']+1.4, 2.0), 0.25, color='white', alpha=0.8)
        ax.add_patch(head)
        body = Rectangle((view['x']+1.15, 1.6), 0.5, 0.35, color='white', alpha=0.8)
        ax.add_patch(body)

    # 箭头连接
    for i in range(3):
        x_start = views[i]['x'] + 2.8
        x_end = views[i+1]['x']
        draw_arrow(ax, x_start, 3.1, x_end, 3.1, color='#9CA3AF', lw=2)

    # 底部说明
    ax.text(7, 0.8, '统一提示词 → 一次性生成 → 同一张图片包含四个角度 → 人物特征完全一致',
            ha='center', va='center', fontsize=11, color='#1E3A8A', fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.5', facecolor='#EFF6FF', edgecolor='#2563EB', alpha=0.8))

    ax.text(7, 0.2, '核心优势：单模板生成确保脸型、五官、发型、发色、服饰、身材100%一致，从根本上避免多模板一致性问题',
            ha='center', va='center', fontsize=9, color='#6B7280', style='italic')

    plt.tight_layout()
    plt.savefig(output_path, dpi=200, bbox_inches='tight', facecolor='white')
    plt.close()
    print(f'四视图结构图已生成：{output_path}')

# ==================== 2. Hermes Agent 八轮对话流程图 ====================
def draw_eight_round_diagram(output_path):
    fig, ax = plt.subplots(1, 1, figsize=(14, 8))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 8)
    ax.axis('off')

    ax.text(7, 7.6, 'Hermes Agent 八轮隐式对话优化流程图',
            ha='center', va='center', fontsize=14, fontweight='bold', color='#1E3A8A')

    rounds = [
        {'x': 0.5, 'y': 5.5, 'num': '第1轮', 'name': '信息解析\n+上下文注入', 'desc': '解析主体信息\n注入剧集剧本上下文', 'color': '#1E3A8A'},
        {'x': 3.7, 'y': 5.5, 'num': '第2轮', 'name': '特征提取\n与标准化', 'desc': '提取人物/场景/道具\n特征标准化', 'color': '#2563EB'},
        {'x': 6.9, 'y': 5.5, 'num': '第3轮', 'name': 'Skills模板\n匹配', 'desc': '根据类型+风格+镜头\n匹配最佳模板', 'color': '#7C3AED'},
        {'x': 10.1, 'y': 5.5, 'num': '第4轮', 'name': '动态填充\n初始生成', 'desc': '特征填入模板\n融入剧情上下文', 'color': '#10B981'},
        {'x': 0.5, 'y': 1.5, 'num': '第5轮', 'name': '质量增强\n+问题预防', 'desc': '注入质量增强词\n四类问题预防词', 'color': '#D97706'},
        {'x': 3.7, 'y': 1.5, 'num': '第6轮', 'name': '负面提示词\n组合', 'desc': '按优先级组合\n控制总长度', 'color': '#DC2626'},
        {'x': 6.9, 'y': 1.5, 'num': '第7轮', 'name': '校验优化\n与去重', 'desc': '去重、冲突检查\n长度控制、排序', 'color': '#BE185D'},
        {'x': 10.1, 'y': 1.5, 'num': '第8轮', 'name': '结果输出\n用户确认', 'desc': '输出正面/负面提示词\n推荐参数+优化说明', 'color': '#1E3A8A'},
    ]

    for r in rounds:
        # 轮次标签
        ax.text(r['x']+1.4, r['y']+1.6, r['num'], ha='center', va='center',
                fontsize=10, color=r['color'], fontweight='bold')
        # 主框
        box = FancyBboxPatch((r['x'], r['y']), 2.8, 1.4,
                              boxstyle="round,pad=0.02,rounding_size=0.1",
                              facecolor=r['color'], edgecolor='white', linewidth=2, alpha=0.9)
        ax.add_patch(box)
        ax.text(r['x']+1.4, r['y']+1.0, r['name'], ha='center', va='center',
                fontsize=10, color='white', fontweight='bold')
        ax.text(r['x']+1.4, r['y']+0.4, r['desc'], ha='center', va='center',
                fontsize=8, color='white', alpha=0.9)

    # 第一排箭头
    for i in range(3):
        x1 = rounds[i]['x'] + 2.8
        x2 = rounds[i+1]['x']
        draw_arrow(ax, x1, 6.2, x2, 6.2, color='#6B7280', lw=1.5)

    # 第二排箭头
    for i in range(4, 7):
        x1 = rounds[i]['x'] + 2.8
        x2 = rounds[i+1]['x']
        draw_arrow(ax, x1, 2.2, x2, 2.2, color='#6B7280', lw=1.5)

    # 换行箭头（第4轮到第5轮）
    arrow = FancyArrowPatch((11.5, 5.5), (11.5, 2.9),
                            arrowstyle='->', color='#7C3AED', lw=2,
                            connectionstyle="arc3,rad=-0.3")
    ax.add_patch(arrow)
    ax.text(12.2, 4.2, '继续优化', fontsize=9, color='#7C3AED', fontweight='bold', rotation=90)

    # 中间说明
    ax.text(7, 3.8, '界面不显示对话内容，用户仅看到最终优化结果',
            ha='center', va='center', fontsize=11, color='#7C3AED', fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.5', facecolor='#FDF4FF', edgecolor='#7C3AED', alpha=0.8))

    ax.text(7, 0.5, '总耗时≤8秒 | 隐式对话 | 剧情感知 | 质量闭环',
            ha='center', va='center', fontsize=10, color='#6B7280', style='italic')

    plt.tight_layout()
    plt.savefig(output_path, dpi=200, bbox_inches='tight', facecolor='white')
    plt.close()
    print(f'八轮对话流程图已生成：{output_path}')

# ==================== 3. 质量迭代优化闭环图 ====================
def draw_quality_loop_diagram(output_path):
    fig, ax = plt.subplots(1, 1, figsize=(12, 8))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 8)
    ax.axis('off')

    ax.text(6, 7.5, '质量迭代优化闭环图',
            ha='center', va='center', fontsize=14, fontweight='bold', color='#1E3A8A')

    # 中心节点
    center = FancyBboxPatch((4.5, 3.2), 3, 1.2,
                             boxstyle="round,pad=0.02,rounding_size=0.15",
                             facecolor='#7C3AED', edgecolor='#FBBF24', linewidth=3, alpha=0.95)
    ax.add_patch(center)
    ax.text(6, 3.8, 'Hermes Agent\n迭代优化引擎', ha='center', va='center',
            fontsize=11, color='white', fontweight='bold')

    # 四个环节节点
    nodes = [
        {'x': 4.5, 'y': 5.8, 'name': '生成图片', 'desc': '调用图片生成模型', 'color': '#2563EB'},
        {'x': 8.5, 'y': 3.5, 'name': '质量检测', 'desc': '四类问题自动检测', 'color': '#10B981'},
        {'x': 4.5, 'y': 1.2, 'name': '达标判断', 'desc': '是→保存 | 否→迭代', 'color': '#F59E0B'},
        {'x': 0.5, 'y': 3.5, 'name': '迭代优化', 'desc': '最多3轮针对性调整', 'color': '#DC2626'},
    ]

    for n in nodes:
        box = FancyBboxPatch((n['x'], n['y']), 3, 1.0,
                              boxstyle="round,pad=0.02,rounding_size=0.1",
                              facecolor=n['color'], edgecolor='white', linewidth=2, alpha=0.9)
        ax.add_patch(box)
        ax.text(n['x']+1.5, n['y']+0.65, n['name'], ha='center', va='center',
                fontsize=11, color='white', fontweight='bold')
        ax.text(n['x']+1.5, n['y']+0.25, n['desc'], ha='center', va='center',
                fontsize=8, color='white', alpha=0.9)

    # 闭环箭头
    # 生成图片 → 质量检测
    draw_arrow(ax, 7.5, 6.3, 8.5, 4.5, color='#6B7280', lw=2)
    # 质量检测 → 达标判断
    draw_arrow(ax, 8.5, 3.5, 7.5, 2.2, color='#6B7280', lw=2)
    # 达标判断 → 迭代优化（否分支）
    draw_arrow(ax, 4.5, 1.7, 3.5, 3.5, color='#DC2626', lw=2)
    ax.text(3.2, 2.3, '否', fontsize=10, color='#DC2626', fontweight='bold')
    # 迭代优化 → 生成图片
    draw_arrow(ax, 3.5, 4.5, 4.5, 5.8, color='#6B7280', lw=2)

    # 达标保存分支
    save_box = FancyBboxPatch((8.5, 1.2), 3, 1.0,
                               boxstyle="round,pad=0.02,rounding_size=0.1",
                               facecolor='#10B981', edgecolor='white', linewidth=2, alpha=0.9)
    ax.add_patch(save_box)
    ax.text(10, 1.7, '保存为资产', ha='center', va='center',
            fontsize=11, color='white', fontweight='bold')
    draw_arrow(ax, 7.5, 1.7, 8.5, 1.7, color='#10B981', lw=2)
    ax.text(7.8, 1.9, '是', fontsize=10, color='#10B981', fontweight='bold')

    # 迭代轮次说明
    ax.text(6, 0.3, '迭代策略：第1轮调整负面词 | 第2轮调整生成参数 | 第3轮提示用户手动调整',
            ha='center', va='center', fontsize=9, color='#6B7280', style='italic')

    plt.tight_layout()
    plt.savefig(output_path, dpi=200, bbox_inches='tight', facecolor='white')
    plt.close()
    print(f'质量闭环图已生成：{output_path}')

# 执行生成
if __name__ == '__main__':
    output_dir = r'D:\phpstudy_pro\WWW\ai-novel-workstation1.2.0'
    draw_four_view_diagram(f'{output_dir}\\four_view_structure.png')
    draw_eight_round_diagram(f'{output_dir}\\eight_round_flow.png')
    draw_quality_loop_diagram(f'{output_dir}\\quality_loop.png')
    print('所有额外图形生成完成！')
