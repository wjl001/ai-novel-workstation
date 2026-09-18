# -*- coding: utf-8 -*-
"""
重新生成角色泳道图
体现：前置Prompt审核 + 后置Response审核 + 三层过滤流水线 + 运营闭环
"""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch
from matplotlib.font_manager import FontProperties
import os

FONT_PATH = r'C:\Windows\Fonts\msyh.ttc'
fp = FontProperties(fname=FONT_PATH)
fp_bold = FontProperties(fname=FONT_PATH, weight='bold')

OUT_DIR = r'D:\phpstudy_pro\WWW\ai-novel-workstation1.2.0\sensitive_word_v2'

C_DARK = '#1F4E79'
C_MID = '#2E75B6'
C_LIGHT = '#5B9BD5'
C_PALE = '#DEEBF7'
C_ACCENT = '#ED7D31'
C_GREEN = '#548235'
C_RED = '#C00000'
C_GRAY = '#7F7F7F'
C_PURPLE = '#7030A0'
C_WHITE = '#FFFFFF'
C_TEXT = '#262626'

fig, ax = plt.subplots(1, 1, figsize=(17, 11))
ax.set_xlim(0, 17)
ax.set_ylim(0, 11)
ax.axis('off')

ax.set_title('敏感词过滤系统角色泳道图（前置+后置双审核 · 三层流水线）',
             fontproperties=fp_bold, fontsize=17, color=C_DARK, pad=25)
ax.text(0.5, 1.015, '模型平台 → 外部厂商大模型架构 ｜ Prompt前置审核 + Response后置审核 ｜ 规则→语义→大模型三层拦截',
        transform=ax.transAxes, ha='center', fontproperties=fp, fontsize=9.5, color=C_GRAY)

# 泳道定义
lanes = [
    ('用户 / 前端', C_MID, '#DEEBF7'),
    ('模型平台', C_GREEN, '#E2EFDA'),
    ('内容安全审核服务', C_ACCENT, '#FCE4D6'),
    ('词库与模型管理', '#BF9000', '#FFF2CC'),
    ('审核运营团队', C_RED, '#FBE5E5'),
    ('外部大模型厂商', C_PURPLE, '#E8DAEF'),
    ('数据存储 / 审计', C_GRAY, '#F2F2F2'),
]
lane_h = 1.25
lane_start = 1.0
label_w = 2.1
n = len(lanes)

def lane_y(idx):
    return lane_start + (n - 1 - idx) * lane_h + lane_h / 2

# 绘制泳道背景和标签
for i, (name, color, bg) in enumerate(lanes):
    y = lane_start + (n - 1 - i) * lane_h
    # 背景
    rect = mpatches.Rectangle((label_w, y), 14.7, lane_h, facecolor=bg, edgecolor='none', alpha=0.35)
    ax.add_patch(rect)
    # 标签
    box = FancyBboxPatch((0.15, y + 0.12), label_w - 0.3, lane_h - 0.24,
                          boxstyle="round,pad=0.01,rounding_size=0.06",
                          facecolor=color, edgecolor=color, linewidth=1)
    ax.add_patch(box)
    ax.text(label_w / 2, y + lane_h / 2, name, ha='center', va='center',
            fontproperties=fp_bold, fontsize=10, color=C_WHITE)
    # 分隔线
    ax.axhline(y=y, xmin=0, xmax=1, color='#CCCCCC', linewidth=0.7, linestyle='--')

# 顶部阶段分隔
phases = [
    ('阶段一：Prompt前置审核', 2.2, 6.3, C_MID),
    ('阶段二：大模型调用', 6.8, 9.3, C_PURPLE),
    ('阶段三：Response后置审核', 9.8, 13.3, C_MID),
    ('阶段四：运营闭环', 13.8, 16.5, C_GREEN),
]
top_y = lane_start + n * lane_h + 0.15
for name, x1, x2, color in phases:
    ax.plot([x1, x2], [top_y, top_y], color=color, linewidth=3, solid_capstyle='round')
    ax.text((x1 + x2) / 2, top_y + 0.18, name, ha='center', fontproperties=fp_bold,
            fontsize=9.5, color=color)

# 节点绘制函数
def node(x, lane_idx, text, w=1.6, h=0.62, fc=C_WHITE, ec=C_MID, fontsize=8.5, bold=False):
    y = lane_y(lane_idx)
    box = FancyBboxPatch((x - w/2, y - h/2), w, h,
                          boxstyle="round,pad=0.01,rounding_size=0.06",
                          facecolor=fc, edgecolor=ec, linewidth=1.8)
    ax.add_patch(box)
    f = fp_bold if bold else fp
    ax.text(x, y, text, ha='center', va='center', fontproperties=f, fontsize=fontsize, color=C_TEXT)
    return (x, y, w, h)

def arrow(x1, y1, x2, y2, color=C_MID, lw=1.6, style='->', ls='-', rad=0.0):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle=style, color=color, lw=lw, linestyle=ls,
                                connectionstyle=f'arc3,rad={rad}'))

def label_arrow(x, y, text, color=C_TEXT, fontsize=8):
    ax.text(x, y, text, ha='center', va='center', fontproperties=fp, fontsize=fontsize,
            color=color, bbox=dict(boxstyle='round,pad=0.15', facecolor=C_WHITE, edgecolor='none', alpha=0.85))

# ===== 阶段一：Prompt前置审核 =====
n1 = node(2.8, 0, '提交创作请求\n(Prompt文本)', w=1.7, ec=C_MID, bold=True)
n2 = node(4.5, 1, '接收请求\n调用前置审核接口', w=1.8, ec=C_GREEN)
n3 = node(6.0, 2, '前置三层流水线\n①AC自动机规则匹配\n②轻量语义模型分类\n③(中风险)大模型复核', w=2.2, h=0.95, fc='#FFF2E8', ec=C_ACCENT, bold=True, fontsize=8)
n4 = node(6.0, 3, '词库/模型查询\n返回标签与风险分数', w=2.0, ec='#BF9000')
n5 = node(4.5, 6, '原始Prompt留痕\n写入审计日志', w=1.9, ec=C_GRAY)

# 阶段一箭头
arrow(n1[0] + n1[2]/2, n1[1], n2[0] - n2[2]/2, n2[1], color=C_MID)
arrow(n2[0] + n2[2]/2, n2[1], n3[0] - n3[2]/2, n3[1], color=C_GREEN)
label_arrow(5.2, lane_y(1) + 0.45, 'text_scan(scene=prompt)', color=C_GREEN, fontsize=7.5)
# 审核服务↔词库管理（垂直双向）
arrow(n3[0], n3[1] - n3[3]/2, n4[0], n4[1] + n4[3]/2, color='#BF9000', lw=1.3)
arrow(n4[0], n4[1] + n4[3]/2, n3[0], n3[1] - n3[3]/2, color='#BF9000', lw=1.3, style='->')
label_arrow(6.7, (n3[1] + n4[1]) / 2, '查询/返回', color='#BF9000', fontsize=7.5)
# 审核服务→数据存储（留痕）
arrow(n3[0] - 0.5, n3[1] - n3[3]/2, n5[0] + 0.3, n5[1] + n5[3]/2, color=C_GRAY, lw=1.2, ls='--')
label_arrow(5.0, (n3[1] + n5[1]) / 2 - 0.1, '留痕', color=C_GRAY, fontsize=7.5)

# ===== 阶段二：大模型调用 =====
n6 = node(7.5, 1, '审核通过\n转发外部大模型', w=1.7, ec=C_GREEN, bold=True)
n7 = node(9.0, 5, '大模型推理\n生成返回内容', w=1.7, ec=C_PURPLE, bold=True)

# 阶段一→阶段二
arrow(n3[0] + n3[2]/2, n3[1], n6[0] - n6[2]/2, n6[1], color=C_ACCENT, lw=2.0)
label_arrow(6.9, lane_y(2) + 0.4, 'isPass=true', color=C_GREEN, fontsize=8)
# 模型平台→外部厂商
arrow(n6[0] + n6[2]/2, n6[1], n7[0] - n7[2]/2, n7[1], color=C_PURPLE, lw=1.8)
label_arrow(8.2, (n6[1] + n7[1]) / 2 + 0.25, '转发Prompt', color=C_PURPLE, fontsize=8)

# ===== 阶段三：Response后置审核 =====
n8 = node(10.5, 1, '接收模型返回\n调用后置审核接口', w=1.8, ec=C_GREEN)
n9 = node(12.2, 2, '后置三层流水线\n①AC自动机规则匹配\n②轻量语义模型分类\n③(中风险)大模型复核', w=2.2, h=0.95, fc='#FFF2E8', ec=C_ACCENT, bold=True, fontsize=8)
n10 = node(12.2, 6, '返回内容留痕\n命中记录+风险分数', w=1.9, ec=C_GRAY)

# 阶段二→阶段三
arrow(n7[0], n7[1] - n7[3]/2, n8[0], n8[1] + n8[3]/2, color=C_PURPLE, lw=1.8, rad=-0.15)
label_arrow(9.7, (n7[1] + n8[1]) / 2, '返回Response', color=C_PURPLE, fontsize=8)
# 模型平台→审核服务
arrow(n8[0] + n8[2]/2, n8[1], n9[0] - n9[2]/2, n9[1], color=C_GREEN)
label_arrow(11.3, lane_y(1) + 0.45, 'text_scan(scene=response)', color=C_GREEN, fontsize=7.5)
# 审核服务→数据存储
arrow(n9[0], n9[1] - n9[3]/2, n10[0], n10[1] + n10[3]/2, color=C_GRAY, lw=1.2, ls='--')
label_arrow(12.9, (n9[1] + n10[1]) / 2, '留痕', color=C_GRAY, fontsize=7.5)

# ===== 阶段四：结果返回 + 运营闭环 =====
n11 = node(14.2, 1, '返回最终结果\n或违规提示', w=1.7, ec=C_GREEN, bold=True)
n12 = node(15.6, 0, '接收结果\n继续创作', w=1.5, ec=C_MID)
n13 = node(14.0, 4, '中风险样本\n人工复核判定', w=1.8, ec=C_RED, bold=True)
n14 = node(15.7, 3, '词库热更新\n模型微调回流', w=1.6, ec='#BF9000')

# 后置审核→返回
arrow(n9[0] + n9[2]/2, n9[1], n11[0] - n11[2]/2, n11[1], color=C_ACCENT, lw=2.0)
label_arrow(13.4, lane_y(2) + 0.4, 'isPass=true', color=C_GREEN, fontsize=8)
# 模型平台→用户
arrow(n11[0] + n11[2]/2, n11[1], n12[0] - n12[2]/2, n12[1], color=C_MID, lw=1.8)

# 审核服务→审核运营（中风险）
arrow(n9[0] + 0.3, n9[1] - n9[3]/2, n13[0] - 0.2, n13[1] + n13[3]/2, color=C_RED, lw=1.5, rad=0.15)
label_arrow(13.2, (n9[1] + n13[1]) / 2 + 0.1, 'medium\n中风险', color=C_RED, fontsize=7.5)
# 审核运营→词库管理
arrow(n13[0] + n13[2]/2, n13[1], n14[0] - n14[2]/2, n14[1], color=C_RED, lw=1.5)
label_arrow(14.85, n13[1] + 0.35, '复核结论回流', color=C_RED, fontsize=7.5)
# 词库管理→审核服务（热更新，虚线回流）
arrow(n14[0], n14[1] - n14[3]/2, n9[0] + 0.8, n9[1] - n9[3]/2 - 0.1, color=C_GRAY, lw=1.2, ls='--', rad=-0.3)
label_arrow(15.0, n9[1] - 0.85, '热更新生效', color=C_GRAY, fontsize=7.5)

# 阻断路径标注（从前置审核直接返回用户）
arrow(n3[0], n3[1] + n3[3]/2, n2[0] + 0.3, n2[1] + n2[3]/2 + 0.1, color=C_RED, lw=1.5, ls=':', rad=0.3)
label_arrow(5.0, n3[1] + 0.75, 'high风险→直接阻断\n(不调用外部模型,省钱)', color=C_RED, fontsize=7.5)

# 图例
legend_y = 0.35
ax.text(0.3, legend_y + 0.25, '图例：', fontproperties=fp_bold, fontsize=9, color=C_TEXT)
legend_items = [
    ('主流程调用', C_MID, '-'),
    ('审核服务调用', C_ACCENT, '-'),
    ('中风险/阻断', C_RED, ':'),
    ('留痕/热更新(回流)', C_GRAY, '--'),
]
for i, (label, color, ls) in enumerate(legend_items):
    x = 1.2 + i * 3.2
    ax.plot([x, x + 0.5], [legend_y + 0.35, legend_y + 0.35], color=color, linewidth=2, linestyle=ls)
    ax.annotate('', xy=(x + 0.6, legend_y + 0.35), xytext=(x + 0.5, legend_y + 0.35),
                arrowprops=dict(arrowstyle='->', color=color, lw=1.5))
    ax.text(x + 0.75, legend_y + 0.35, label, fontproperties=fp, fontsize=8.5, color=C_TEXT, va='center')

ax.text(8.5, legend_y + 0.05,
        '注：橙色泳道为核心审核服务，承载AC规则→轻量语义→大模型复核三层流水线；前置审核命中高风险直接阻断，不调用外部大模型，节省调用成本',
        fontproperties=fp, fontsize=8, color=C_GRAY, style='italic', va='center')

plt.tight_layout()
path = os.path.join(OUT_DIR, 'swimlane.png')
plt.savefig(path, dpi=200, bbox_inches='tight', facecolor=C_WHITE)
plt.close()
print(f'[OK] 角色泳道图已重新生成: {path}')
