# -*- coding: utf-8 -*-
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import os

# 中文字体
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

OUT = r'D:\phpstudy_pro\WWW\ai-novel-workstation1.2.0\提示词智能组装引擎流程图.png'

fig, ax = plt.subplots(figsize=(14, 16), dpi=150)
ax.set_xlim(0, 14)
ax.set_ylim(0, 16)
ax.axis('off')

# 颜色
C_START = '#4A5FC1'
C_STEP = '#5B7BDB'
C_PROCESS = '#6B8CE8'
C_CHECK = '#E8A33D'
C_OUTPUT = '#3DA86B'
C_LOOP = '#D9534F'
C_TEXT = '#FFFFFF'

def draw_box(x, y, w, h, text, color, fontsize=11, bold=True, text_color='#FFFFFF'):
    box = FancyBboxPatch((x - w/2, y - h/2), w, h,
                         boxstyle="round,pad=0.08", linewidth=1.5,
                         edgecolor='#333333', facecolor=color, zorder=2)
    ax.add_patch(box)
    ax.text(x, y, text, ha='center', va='center', fontsize=fontsize,
            fontweight='bold' if bold else 'normal', color=text_color, zorder=3,
            linespacing=1.5)

def draw_arrow(x1, y1, x2, y2, color='#555555', style='->', lw=2, label='', label_offset=(0,0)):
    arr = FancyArrowPatch((x1, y1), (x2, y2), arrowstyle=style,
                          mutation_scale=18, color=color, lw=lw, zorder=1)
    ax.add_patch(arr)
    if label:
        mx, my = (x1+x2)/2 + label_offset[0], (y1+y2)/2 + label_offset[1]
        ax.text(mx, my, label, ha='center', va='center', fontsize=9,
                color=color, fontweight='bold', zorder=3,
                bbox=dict(boxstyle='round,pad=0.2', facecolor='#FFF8E7', edgecolor=color, alpha=0.9))

# 标题
ax.text(7, 15.5, '提示词智能组装引擎·完整流程图', ha='center', va='center',
        fontsize=20, fontweight='bold', color='#2C3E6B')
ax.text(7, 15.0, '八步智能组装 · 校验闭环 · 输出供用户确认', ha='center', va='center',
        fontsize=12, color='#666666')

# 起始
draw_box(7, 14.2, 3.2, 0.7, '接收用户输入的主体信息', C_START, 12)

# 第一步
draw_box(7, 13.1, 5.5, 0.8, '第一步  信息解析\n解析主体名称、描述、参考图、风格偏好、镜头类型', C_STEP, 10.5)
draw_arrow(7, 13.85, 7, 13.5)

# 第二步
draw_box(7, 11.9, 5.5, 0.8, '第二步  特征提取\n从描述中提取人物特征（年龄/性别/发型/服饰/肤色）\n或场景/道具特征', C_STEP, 10)
draw_arrow(7, 12.7, 7, 12.3)

# 第三步
draw_box(7, 10.6, 5.5, 0.8, '第三步  模板匹配\n根据主体类型+风格+镜头标签，从模板库匹配最佳模板', C_STEP, 10.5)
draw_arrow(7, 11.5, 7, 11.0)

# 第四步
draw_box(7, 9.3, 5.5, 0.8, '第四步  动态填充\n将提取的特征填入模板占位符，生成初始正面提示词', C_PROCESS, 10.5)
draw_arrow(7, 10.2, 7, 9.7)

# 第五步
draw_box(7, 8.0, 5.5, 0.8, '第五步  质量增强\n根据主体类型自动注入质量增强词和问题预防词', C_PROCESS, 10.5)
draw_arrow(7, 8.9, 7, 8.4)

# 第六步
draw_box(7, 6.7, 5.5, 0.8, '第六步  负面词组合\n按优先级组合负面提示词，控制总长度在合理范围', C_PROCESS, 10.5)
draw_arrow(7, 7.6, 7, 7.1)

# 第七步 校验（菱形判断）
draw_box(7, 5.3, 5.8, 0.9, '第七步  校验优化\n检查关键词冲突、重复、长度超限\n进行去重和优化排序', C_CHECK, 10, text_color='#333333')
draw_arrow(7, 6.3, 7, 5.75)

# 判断分支：不通过 → 返回第四步
draw_arrow(4.1, 5.3, 2.0, 5.3, color=C_LOOP, lw=2, label='校验不通过')
draw_arrow(2.0, 5.3, 2.0, 9.3, color=C_LOOP, lw=2)
draw_arrow(2.0, 9.3, 4.25, 9.3, color=C_LOOP, lw=2, label='返回动态填充重新组装', label_offset=(0, 0.25))

# 通过 → 第八步
draw_arrow(7, 4.85, 7, 4.4, color=C_OUTPUT, lw=2.5, label='校验通过', label_offset=(1.2, 0))

# 第八步 输出
draw_box(7, 3.7, 6.0, 0.9, '第八步  输出结果\n输出正面提示词 + 负面提示词 + 推荐生成参数', C_OUTPUT, 10.5)

# 最终交付
draw_arrow(7, 3.25, 7, 2.8, color=C_OUTPUT, lw=2.5)
draw_box(7, 2.2, 5.0, 0.8, '前端预览 · 用户确认 · 进入图片生成', '#2C7A4E', 11)

# 底部说明
ax.text(7, 1.0, '说明：校验环节形成闭环，不通过则返回动态填充步骤重新组装，确保输出提示词无冲突、无重复、长度合理。',
        ha='center', va='center', fontsize=9.5, color='#888888', style='italic')
ax.text(7, 0.5, '恒智影AI短剧系统 · 提示词优化引擎', ha='center', va='center',
        fontsize=9, color='#AAAAAA')

plt.tight_layout()
plt.savefig(OUT, dpi=150, bbox_inches='tight', facecolor='white')
plt.close()
print(f'流程图已生成: {OUT}')
print(f'文件大小: {os.path.getsize(OUT)/1024:.1f} KB')
