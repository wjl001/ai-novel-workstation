#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""生成AI润色优化按钮方案的对比图表"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

# ==================== 图1：优化前后四类问题发生率对比 ====================
def draw_problem_comparison(output_path):
    fig, ax = plt.subplots(figsize=(10, 6))

    problems = ['人脸崩坏', '斗鸡眼', '色彩异常', '精度不高']
    before = [25, 28, 32, 45]
    after = [5, 3, 8, 12]

    x = np.arange(len(problems))
    width = 0.35

    bars1 = ax.bar(x - width/2, before, width, label='优化前（原始提示词）',
                   color='#DC2626', alpha=0.85, edgecolor='white', linewidth=1.5)
    bars2 = ax.bar(x + width/2, after, width, label='优化后（AI润色提示词）',
                   color='#10B981', alpha=0.85, edgecolor='white', linewidth=1.5)

    # 添加数值标签
    for bar in bars1:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height + 0.8,
                f'{height}%', ha='center', va='bottom', fontsize=11, fontweight='bold', color='#DC2626')
    for bar in bars2:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height + 0.8,
                f'{height}%', ha='center', va='bottom', fontsize=11, fontweight='bold', color='#10B981')

    # 添加降低幅度标注
    for i in range(len(problems)):
        reduction = before[i] - after[i]
        pct = (reduction / before[i]) * 100
        ax.annotate(f'↓{pct:.0f}%', xy=(x[i], max(before[i], after[i]) + 6),
                    ha='center', fontsize=10, color='#7C3AED', fontweight='bold',
                    bbox=dict(boxstyle='round,pad=0.3', facecolor='#FDF4FF', edgecolor='#7C3AED', alpha=0.8))

    ax.set_ylabel('问题发生率（%）', fontsize=12, fontweight='bold')
    ax.set_title('AI润色优化前后 · 四类高频问题发生率对比', fontsize=14, fontweight='bold', color='#1E3A8A', pad=15)
    ax.set_xticks(x)
    ax.set_xticklabels(problems, fontsize=11)
    ax.legend(loc='upper right', fontsize=10, framealpha=0.9)
    ax.set_ylim(0, 55)
    ax.grid(axis='y', alpha=0.3, linestyle='--')
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    plt.tight_layout()
    plt.savefig(output_path, dpi=200, bbox_inches='tight', facecolor='white')
    plt.close()
    print(f'问题对比图已生成：{output_path}')

# ==================== 图2：图片质量维度雷达图 ====================
def draw_quality_radar(output_path):
    fig, ax = plt.subplots(figsize=(8, 8), subplot_kw=dict(projection='polar'))

    categories = ['面部准确度', '色彩还原度', '细节精度', '构图合理性', '风格一致性', '整体质感']
    N = len(categories)

    before_scores = [55, 60, 50, 65, 58, 52]
    after_scores = [88, 90, 85, 92, 91, 87]

    angles = [n / float(N) * 2 * np.pi for n in range(N)]
    angles += angles[:1]
    before_scores += before_scores[:1]
    after_scores += after_scores[:1]

    ax.plot(angles, before_scores, 'o-', linewidth=2, color='#DC2626', label='优化前', alpha=0.8)
    ax.fill(angles, before_scores, alpha=0.15, color='#DC2626')
    ax.plot(angles, after_scores, 'o-', linewidth=2, color='#10B981', label='优化后', alpha=0.8)
    ax.fill(angles, after_scores, alpha=0.2, color='#10B981')

    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(categories, fontsize=11, fontweight='bold')
    ax.set_ylim(0, 100)
    ax.set_yticks([20, 40, 60, 80, 100])
    ax.set_yticklabels(['20', '40', '60', '80', '100'], fontsize=9)
    ax.set_title('AI润色优化前后 · 图片质量六维对比', fontsize=14, fontweight='bold', color='#1E3A8A', pad=25)
    ax.legend(loc='upper right', bbox_to_anchor=(1.3, 1.1), fontsize=11)

    plt.tight_layout()
    plt.savefig(output_path, dpi=200, bbox_inches='tight', facecolor='white')
    plt.close()
    print(f'质量雷达图已生成：{output_path}')

# ==================== 图3：用户操作流程对比 ====================
def draw_workflow_comparison(output_path):
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))

    # 优化前流程
    ax1.set_title('优化前：无AI润色按钮', fontsize=13, fontweight='bold', color='#DC2626', pad=10)
    steps_before = ['用户手动写\n提示词', '生成图片', '发现问题\n(人脸崩坏等)', '手动修改\n提示词', '重新生成', '反复调整\n(平均2.8次)', '最终合格']
    colors_before = ['#FEE2E2', '#FECACA', '#FCA5A5', '#F87171', '#EF4444', '#DC2626', '#991B1B']

    for i, (step, color) in enumerate(zip(steps_before, colors_before)):
        y = 6 - i * 0.85
        box = plt.Rectangle((0.5, y - 0.3), 3, 0.6, facecolor=color, edgecolor='white', linewidth=1.5)
        ax1.add_patch(box)
        ax1.text(2, y, step, ha='center', va='center', fontsize=9, fontweight='bold', color='white')
        if i < len(steps_before) - 1:
            ax1.annotate('', xy=(2, y - 0.35), xytext=(2, y - 0.5),
                        arrowprops=dict(arrowstyle='->', color='#991B1B', lw=1.5))

    ax1.set_xlim(0, 4)
    ax1.set_ylim(0, 7)
    ax1.axis('off')
    ax1.text(2, 0.3, '总耗时：约5-8分钟\n成功率：55%', ha='center', fontsize=11,
             fontweight='bold', color='#DC2626',
             bbox=dict(boxstyle='round,pad=0.5', facecolor='#FEF2F2', edgecolor='#DC2626'))

    # 优化后流程
    ax2.set_title('优化后：AI润色按钮一键优化', fontsize=13, fontweight='bold', color='#10B981', pad=10)
    steps_after = ['用户简单\n描述角色', '点击\nAI润色按钮', 'Hermes 8轮\n隐式优化', '用户确认\n优化结果', '生成图片', '自动质量\n检测', '合格保存']
    colors_after = ['#D1FAE5', '#A7F3D0', '#6EE7B7', '#34D399', '#10B981', '#059669', '#047857']

    for i, (step, color) in enumerate(zip(steps_after, colors_after)):
        y = 6 - i * 0.85
        box = plt.Rectangle((0.5, y - 0.3), 3, 0.6, facecolor=color, edgecolor='white', linewidth=1.5)
        ax2.add_patch(box)
        ax2.text(2, y, step, ha='center', va='center', fontsize=9, fontweight='bold', color='white')
        if i < len(steps_after) - 1:
            ax2.annotate('', xy=(2, y - 0.35), xytext=(2, y - 0.5),
                        arrowprops=dict(arrowstyle='->', color='#047857', lw=1.5))

    ax2.set_xlim(0, 4)
    ax2.set_ylim(0, 7)
    ax2.axis('off')
    ax2.text(2, 0.3, '总耗时：约30秒-1分钟\n成功率：85%', ha='center', fontsize=11,
             fontweight='bold', color='#10B981',
             bbox=dict(boxstyle='round,pad=0.5', facecolor='#ECFDF5', edgecolor='#10B981'))

    plt.suptitle('AI润色优化按钮 · 用户操作流程对比', fontsize=15, fontweight='bold', color='#1E3A8A', y=1.02)
    plt.tight_layout()
    plt.savefig(output_path, dpi=200, bbox_inches='tight', facecolor='white')
    plt.close()
    print(f'流程对比图已生成：{output_path}')

# ==================== 图4：投入产出对比 ====================
def draw_roi_comparison(output_path):
    fig, ax = plt.subplots(figsize=(10, 6))

    metrics = ['单次生成耗时', '重生成次数', '算力消耗', '用户满意度', '图片合格率']
    before = [8, 2.8, 100, 6.2, 55]
    after = [1, 1.2, 70, 8.5, 85]

    # 归一化用于对比展示（满意度和合格率方向相反，需要转换）
    before_norm = [8, 2.8, 100, 10-6.2, 100-55]
    after_norm = [1, 1.2, 70, 10-8.5, 100-85]

    x = np.arange(len(metrics))
    width = 0.35

    bars1 = ax.bar(x - width/2, before_norm, width, label='优化前',
                   color='#DC2626', alpha=0.85, edgecolor='white', linewidth=1.5)
    bars2 = ax.bar(x + width/2, after_norm, width, label='优化后',
                   color='#10B981', alpha=0.85, edgecolor='white', linewidth=1.5)

    # 实际数值标签
    for i, (b, a) in enumerate(zip(before, after)):
        unit = ['分钟', '次', '%', '分', '%'][i]
        ax.text(x[i] - width/2, before_norm[i] + 1, f'{b}{unit}', ha='center', fontsize=9, color='#DC2626', fontweight='bold')
        ax.text(x[i] + width/2, after_norm[i] + 1, f'{a}{unit}', ha='center', fontsize=9, color='#10B981', fontweight='bold')

    ax.set_ylabel('数值（越低越好，满意度/合格率已转换）', fontsize=10)
    ax.set_title('AI润色优化按钮 · 投入产出综合对比', fontsize=14, fontweight='bold', color='#1E3A8A', pad=15)
    ax.set_xticks(x)
    ax.set_xticklabels(metrics, fontsize=11)
    ax.legend(fontsize=11)
    ax.grid(axis='y', alpha=0.3, linestyle='--')
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    plt.tight_layout()
    plt.savefig(output_path, dpi=200, bbox_inches='tight', facecolor='white')
    plt.close()
    print(f'ROI对比图已生成：{output_path}')

# ==================== 图5：三种主体类型优化效果对比 ====================
def draw_subject_type_comparison(output_path):
    fig, ax = plt.subplots(figsize=(10, 6))

    types = ['角色四视图', '场景', '道具']
    before_success = [55, 60, 65]
    after_success = [85, 88, 90]
    improvement = [30, 28, 25]

    x = np.arange(len(types))
    width = 0.3

    bars1 = ax.bar(x - width, before_success, width, label='优化前合格率',
                   color='#94A3B8', alpha=0.85, edgecolor='white')
    bars2 = ax.bar(x, after_success, width, label='优化后合格率',
                   color='#10B981', alpha=0.85, edgecolor='white')
    bars3 = ax.bar(x + width, improvement, width, label='提升幅度',
                   color='#7C3AED', alpha=0.85, edgecolor='white')

    for bars in [bars1, bars2, bars3]:
        for bar in bars:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height + 0.8,
                    f'{height}%', ha='center', va='bottom', fontsize=10, fontweight='bold')

    ax.set_ylabel('合格率（%）', fontsize=12)
    ax.set_title('三种主体类型 · AI润色优化效果对比', fontsize=14, fontweight='bold', color='#1E3A8A', pad=15)
    ax.set_xticks(x)
    ax.set_xticklabels(types, fontsize=12)
    ax.legend(fontsize=10)
    ax.set_ylim(0, 105)
    ax.grid(axis='y', alpha=0.3, linestyle='--')
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    plt.tight_layout()
    plt.savefig(output_path, dpi=200, bbox_inches='tight', facecolor='white')
    plt.close()
    print(f'主体类型对比图已生成：{output_path}')

# 执行生成
if __name__ == '__main__':
    output_dir = r'D:\phpstudy_pro\WWW\ai-novel-workstation1.2.0'
    draw_problem_comparison(f'{output_dir}\\ai_polish_problem_comparison.png')
    draw_quality_radar(f'{output_dir}\\ai_polish_quality_radar.png')
    draw_workflow_comparison(f'{output_dir}\\ai_polish_workflow_comparison.png')
    draw_roi_comparison(f'{output_dir}\\ai_polish_roi_comparison.png')
    draw_subject_type_comparison(f'{output_dir}\\ai_polish_subject_type.png')
    print('所有图表生成完成！')
