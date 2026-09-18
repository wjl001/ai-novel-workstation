# -*- coding: utf-8 -*-
"""
敏感词二期产品方案 - 高质量图表生成 V3
4张图：产品架构图、核心业务流程图、角色泳道图、系统时序图
所有图精心布局，确保无重叠、文字清晰可读
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
os.makedirs(OUT_DIR, exist_ok=True)

# 配色
C_DARK = '#1F4E79'
C_MID = '#2E75B6'
C_LIGHT = '#5B9BD5'
C_PALE = '#DEEBF7'
C_ACCENT = '#ED7D31'
C_ACCENT_PALE = '#FCE4D6'
C_GREEN = '#548235'
C_GREEN_PALE = '#E2EFDA'
C_RED = '#C00000'
C_RED_PALE = '#FBE5E5'
C_YELLOW = '#BF9000'
C_YELLOW_PALE = '#FFF2CC'
C_PURPLE = '#7030A0'
C_PURPLE_PALE = '#E8DAEF'
C_GRAY = '#7F7F7F'
C_GRAY_PALE = '#F2F2F2'
C_WHITE = '#FFFFFF'
C_TEXT = '#262626'


def draw_box(ax, x, y, w, h, text, fc=C_WHITE, ec=C_MID, fontsize=10,
             fontcolor=C_TEXT, bold=False, radius=0.04, lw=1.5):
    box = FancyBboxPatch((x, y), w, h, boxstyle=f"round,pad=0.01,rounding_size={radius}",
                          facecolor=fc, edgecolor=ec, linewidth=lw)
    ax.add_patch(box)
    f = fp_bold if bold else fp
    ax.text(x + w/2, y + h/2, text, ha='center', va='center',
            fontproperties=f, fontsize=fontsize, color=fontcolor, wrap=True)
    return box


def draw_arrow(ax, x1, y1, x2, y2, color=C_MID, lw=1.8, style='->', ls='-', rad=0.0):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle=style, color=color, lw=lw, linestyle=ls,
                                connectionstyle=f'arc3,rad={rad}'))


def arrow_label(ax, x, y, text, color=C_TEXT, fontsize=8.5, bg=C_WHITE):
    ax.text(x, y, text, ha='center', va='center', fontproperties=fp, fontsize=fontsize,
            color=color, bbox=dict(boxstyle='round,pad=0.2', facecolor=bg, edgecolor='none', alpha=0.9))


# ================================================================
# 图1：产品架构图（重新优化布局）
# ================================================================
def draw_architecture():
    fig, ax = plt.subplots(1, 1, figsize=(15, 11))
    ax.set_xlim(0, 15)
    ax.set_ylim(0, 11)
    ax.axis('off')
    ax.set_title('敏感词过滤引擎（二期）产品架构图', fontproperties=fp_bold, fontsize=18, color=C_DARK, pad=20)
    ax.text(0.5, 1.015, '四层分层架构 ｜ 核心引擎内置三层过滤流水线 ｜ 模块化可扩展设计',
            transform=ax.transAxes, ha='center', fontproperties=fp, fontsize=10, color=C_GRAY)

    # 各层Y坐标（从顶到底）
    layers = [
        ('接入层', 9.2, 1.0, C_DARK, '#E8F0FE'),
        ('过滤引擎核心层', 6.3, 2.6, C_ACCENT, '#FFF5EE'),
        ('词库管理层', 3.6, 2.3, C_GREEN, '#F0F7EC'),
        ('数据存储层', 1.5, 1.7, C_GRAY, C_GRAY_PALE),
    ]

    for name, y, h, color, bg in layers:
        # 层背景
        rect = mpatches.Rectangle((0.3, y), 13.0, h, facecolor=bg, edgecolor=color, linewidth=2, alpha=0.5)
        ax.add_patch(rect)
        # 层标签
        ax.text(0.6, y + h/2, name, ha='left', va='center', fontproperties=fp_bold, fontsize=12, color=color)

    # 接入层模块
    access_modules = ['对话生成接口', '文本创作接口', '内容审核接口', '第三方API接入']
    for i, m in enumerate(access_modules):
        draw_box(ax, 2.2 + i*2.8, 9.45, 2.4, 0.55, m, fc=C_WHITE, ec=C_LIGHT, fontsize=9.5)

    # 过滤引擎层 - 上排：匹配模块
    match_modules = [
        ('文本预处理\n分词/归一化/去噪', C_WHITE, C_LIGHT, False),
        ('基础词库匹配\nAC自动机/精确模糊', C_WHITE, C_LIGHT, False),
        ('组合词匹配引擎\n前缀+核心词规则', C_ACCENT_PALE, C_ACCENT, True),
        ('白名单反向排除\n语境豁免判定', C_ACCENT_PALE, C_ACCENT, True),
        ('语义匹配增强\n正则/轻量模型', C_WHITE, C_LIGHT, False),
    ]
    for i, (text, fc, ec, bold) in enumerate(match_modules):
        draw_box(ax, 2.0 + i*2.3, 7.85, 2.1, 0.75, text, fc=fc, ec=ec, fontsize=8.5, bold=bold)

    # 过滤引擎层 - 中排：三层流水线标注
    ax.text(7.0, 7.55, '↑ 第一层：增强规则引擎（AC自动机）  ｜  第二层：轻量语义模型  ｜  第三层：大模型复核（可选）',
            ha='center', va='center', fontproperties=fp_bold, fontsize=8.5, color=C_ACCENT)

    # 过滤引擎层 - 下排：决策支撑模块
    support_modules = [
        ('风险分级决策器\n放行/拦截/人工复审', C_DARK, C_DARK, C_WHITE, True),
        ('命中日志与上下文追踪\n匹配路径/词库版本', C_MID, C_MID, C_WHITE, False),
        ('实时性能监控\n延迟/命中率/误杀率', C_MID, C_MID, C_WHITE, False),
    ]
    for i, (text, fc, ec, tc, bold) in enumerate(support_modules):
        draw_box(ax, 2.5 + i*3.6, 6.55, 3.2, 0.7, text, fc=fc, ec=ec, fontsize=9, fontcolor=tc, bold=bold)

    # 词库管理层模块
    lib_modules = [
        ('通用违规词库', '政治/色情/暴力\n/辱骂基础词', C_WHITE, C_LIGHT, False),
        ('组合规则词库', '前缀词+核心词\n关联配置（二期）', C_GREEN_PALE, C_GREEN, True),
        ('白名单词库', '专业术语/固定搭配\n语境豁免（二期）', C_GREEN_PALE, C_GREEN, True),
        ('行业专属词库', '医疗/金融/法律\n领域定制词', C_WHITE, C_LIGHT, False),
        ('动态更新词库', '热点事件/新型变体\n实时同步', C_WHITE, C_LIGHT, False),
    ]
    for i, (name, desc, fc, ec, bold) in enumerate(lib_modules):
        draw_box(ax, 2.0 + i*2.3, 4.0, 2.1, 1.2, f'{name}\n\n{desc}', fc=fc, ec=ec, fontsize=8, bold=bold)

    # 数据存储层模块
    store_modules = ['Redis 热词缓存', 'MySQL 词库配置', 'Elasticsearch 命中日志', '对象存储 审计归档']
    for i, s in enumerate(store_modules):
        draw_box(ax, 2.5 + i*2.8, 1.75, 2.4, 0.6, s, fc=C_WHITE, ec=C_GRAY, fontsize=9.5)

    # 运营管理后台（右侧贯穿）
    draw_box(ax, 13.6, 1.5, 1.2, 8.7, '运营\n管理\n后台\n\n词库配置\n审核管理\n统计看板\n告警通知',
             fc=C_DARK, ec=C_DARK, fontsize=8.5, fontcolor=C_WHITE, bold=True, radius=0.06)

    # 层间箭头
    for x in [4.0, 7.0, 10.0]:
        draw_arrow(ax, x, 9.2, x, 8.65, color=C_DARK, lw=1.5)
        draw_arrow(ax, x, 6.3, x, 5.95, color=C_ACCENT, lw=1.5)
        draw_arrow(ax, x, 3.6, x, 3.25, color=C_GREEN, lw=1.5)

    # 图例
    legend_y = 0.35
    ax.text(0.3, legend_y + 0.2, '图例：', fontproperties=fp_bold, fontsize=9, color=C_TEXT)
    items = [
        ('二期新增核心模块', C_ACCENT_PALE, C_ACCENT),
        ('基础已有模块', C_WHITE, C_LIGHT),
        ('决策/监控模块', C_DARK, C_DARK),
        ('存储模块', C_WHITE, C_GRAY),
    ]
    for i, (label, fc, ec) in enumerate(items):
        x = 1.2 + i * 3.0
        rect = mpatches.Rectangle((x, legend_y), 0.3, 0.3, facecolor=fc, edgecolor=ec, lw=1.2)
        ax.add_patch(rect)
        ax.text(x + 0.4, legend_y + 0.15, label, fontproperties=fp, fontsize=8.5, color=C_TEXT, va='center')

    plt.tight_layout()
    path = os.path.join(OUT_DIR, 'architecture.png')
    plt.savefig(path, dpi=200, bbox_inches='tight', facecolor=C_WHITE)
    plt.close()
    print(f'[OK] 产品架构图: {path}')


# ================================================================
# 图2：核心业务流程图（重新优化，垂直清晰布局，无交叉）
# ================================================================
def draw_flowchart():
    fig, ax = plt.subplots(1, 1, figsize=(13, 14))
    ax.set_xlim(0, 13)
    ax.set_ylim(0, 14)
    ax.axis('off')
    ax.set_title('敏感词过滤核心业务流程图', fontproperties=fp_bold, fontsize=18, color=C_DARK, pad=20)
    ax.text(0.5, 1.012, '三层过滤流水线 ｜ 白名单语境豁免 ｜ 风险分级处置 ｜ 全链路留痕',
            transform=ax.transAxes, ha='center', fontproperties=fp, fontsize=10, color=C_GRAY)

    # 中心X坐标
    cx = 6.5

    # 节点定义 (y, text, fc, ec, w, h, fontsize, bold)
    nodes = [
        (13.2, '用户提交文本内容\n（Prompt / 模型Response）', C_DARK, C_DARK, 3.5, 0.65, 10, True),
        (12.2, '① 文本预处理\n分词 / 归一化 / 去干扰字符\n（原始文本不动，仅生成审核副本）', C_PALE, C_MID, 4.0, 0.85, 9, False),
        (11.0, '② 第一层：AC自动机规则匹配\n精确匹配 + 模糊匹配 + 组合规则', C_ACCENT_PALE, C_ACCENT, 4.2, 0.75, 9.5, True),
    ]

    for y, text, fc, ec, w, h, fs, bold in nodes:
        draw_box(ax, cx - w/2, y - h/2, w, h, text, fc=fc, ec=ec, fontsize=fs, bold=bold,
                 fontcolor=C_WHITE if fc == C_DARK else C_TEXT, lw=2)

    # 箭头：开始→预处理→规则匹配
    draw_arrow(ax, cx, 12.87, cx, 12.63, color=C_DARK, lw=2)
    draw_arrow(ax, cx, 11.77, cx, 11.38, color=C_MID, lw=2)

    # 判定1：规则匹配是否命中高风险
    draw_box(ax, cx - 1.7, 9.85, 3.4, 0.8, '规则层是否命中\n高风险词？', C_YELLOW_PALE, C_YELLOW, fontsize=10, bold=True, radius=0.08)
    draw_arrow(ax, cx, 10.62, cx, 10.65, color=C_ACCENT, lw=2)

    # 是 → 白名单校验（右侧）
    draw_box(ax, 9.5, 9.85, 3.2, 0.8, '③ 白名单语境豁免校验\n固定搭配/场景标签/词性/上下文', C_ACCENT_PALE, C_ACCENT, fontsize=8.5, bold=True)
    arrow_label(ax, 8.5, 10.25, '是（命中）', color=C_RED, fontsize=9)
    draw_arrow(ax, cx + 1.7, 10.25, 9.5, 10.25, color=C_RED, lw=1.8)

    # 否 → 第二层语义模型（下方）
    draw_box(ax, cx - 2.1, 8.5, 4.2, 0.8, '④ 第二层：轻量语义分类模型\n多标签分类 + 风险评分（0~1）', C_PURPLE_PALE, C_PURPLE, fontsize=9.5, bold=True)
    arrow_label(ax, cx - 0.5, 9.4, '否（未命中）', color=C_GREEN, fontsize=9)
    draw_arrow(ax, cx, 9.85, cx, 9.3, color=C_GREEN, lw=1.8)

    # 判定2：语义模型风险等级
    draw_box(ax, cx - 1.8, 7.2, 3.6, 0.85, '语义模型风险等级？', C_YELLOW_PALE, C_YELLOW, fontsize=10.5, bold=True, radius=0.08)
    draw_arrow(ax, cx, 8.1, cx, 8.05, color=C_PURPLE, lw=2)

    # 高风险 → 白名单校验（右侧，和规则命中汇合）
    arrow_label(ax, 9.0, 7.6, '高风险', color=C_RED, fontsize=9)
    draw_arrow(ax, cx + 1.8, 7.6, 11.1, 9.85, color=C_RED, lw=1.8, rad=-0.2)

    # 中风险 → 第三层大模型复核（左侧）
    draw_box(ax, 0.5, 7.0, 3.2, 0.95, '⑤ 第三层：审核大模型复核\n（仅中风险，小流量）\n意图理解 + 隐喻暗语识别', C_GRAY_PALE, C_GRAY, fontsize=8.5, bold=True)
    arrow_label(ax, 4.5, 7.6, '中风险', color=C_YELLOW, fontsize=9)
    draw_arrow(ax, cx - 1.8, 7.6, 3.7, 7.48, color=C_YELLOW, lw=1.8)

    # 低风险 → 直接放行（左下）
    draw_box(ax, 0.5, 5.5, 3.2, 0.7, '【放行】\n低风险，直接通过', C_GREEN_PALE, C_GREEN, fontsize=10, bold=True, fontcolor=C_GREEN)
    arrow_label(ax, 4.5, 6.5, '低风险', color=C_GREEN, fontsize=9)
    draw_arrow(ax, cx - 1.8, 7.2, 3.7, 5.85, color=C_GREEN, lw=1.8, rad=0.15)

    # 大模型复核结果判定
    draw_box(ax, 0.5, 4.0, 3.2, 0.75, '大模型复核结论？', C_YELLOW_PALE, C_YELLOW, fontsize=9.5, bold=True, radius=0.08)
    draw_arrow(ax, 2.1, 7.0, 2.1, 4.75, color=C_GRAY, lw=1.8)

    # 确认违规 → 白名单校验（从大模型到右侧白名单）
    arrow_label(ax, 5.5, 5.5, '确认违规', color=C_RED, fontsize=8.5)
    draw_arrow(ax, 3.7, 4.35, 9.5, 9.85, color=C_RED, lw=1.5, ls='--', rad=-0.3)

    # 排除 → 放行
    arrow_label(ax, 2.1, 3.5, '排除', color=C_GREEN, fontsize=9)
    draw_arrow(ax, 2.1, 4.0, 2.1, 3.5, color=C_GREEN, lw=1.8)
    draw_box(ax, 0.5, 2.6, 3.2, 0.7, '【放行】\n大模型排除违规', C_GREEN_PALE, C_GREEN, fontsize=10, bold=True, fontcolor=C_GREEN)
    draw_arrow(ax, 2.1, 3.5, 2.1, 3.3, color=C_GREEN, lw=1.8)

    # 白名单校验判定
    draw_box(ax, 9.5, 8.5, 3.2, 0.75, '是否命中白名单\n豁免条件？', C_YELLOW_PALE, C_YELLOW, fontsize=9.5, bold=True, radius=0.08)
    draw_arrow(ax, 11.1, 9.85, 11.1, 9.25, color=C_ACCENT, lw=1.8)

    # 是 → 豁免放行（右下）
    draw_box(ax, 9.5, 7.0, 3.2, 0.7, '【豁免放行】\n记录豁免日志', C_GREEN_PALE, C_GREEN, fontsize=10, bold=True, fontcolor=C_GREEN)
    arrow_label(ax, 11.1, 7.9, '是（豁免）', color=C_GREEN, fontsize=9)
    draw_arrow(ax, 11.1, 8.5, 11.1, 7.7, color=C_GREEN, lw=1.8)

    # 否 → 风险分级（下方中心）
    draw_box(ax, cx - 2.0, 5.5, 4.0, 0.8, '⑥ 风险分级判定\n综合规则+语义+白名单结果', C_DARK, C_DARK, fontsize=10, bold=True, fontcolor=C_WHITE)
    arrow_label(ax, 9.0, 6.5, '否（维持违规）', color=C_RED, fontsize=8.5)
    draw_arrow(ax, 9.5, 8.5, cx + 1.5, 5.9, color=C_RED, lw=1.8, rad=0.2)

    # 风险分级 → 高风险拦截
    draw_box(ax, cx - 3.2, 3.8, 2.8, 0.75, '【拦截】\n高风险，返回违规提示', C_RED_PALE, C_RED, fontsize=9.5, bold=True, fontcolor=C_RED)
    arrow_label(ax, cx - 1.8, 4.7, '高风险', color=C_RED, fontsize=9)
    draw_arrow(ax, cx - 1.0, 5.5, cx - 1.8, 4.55, color=C_RED, lw=1.8)

    # 风险分级 → 中风险人工复审
    draw_box(ax, cx + 0.4, 3.8, 2.8, 0.75, '【人工复审】\n中风险，审核员二次判定', C_YELLOW_PALE, C_YELLOW, fontsize=9.5, bold=True)
    arrow_label(ax, cx + 1.5, 4.7, '中风险', color=C_YELLOW, fontsize=9)
    draw_arrow(ax, cx + 1.0, 5.5, cx + 1.8, 4.55, color=C_YELLOW, lw=1.8)

    # 拦截 → 日志归档
    draw_box(ax, cx - 3.2, 2.3, 2.8, 0.65, '命中日志归档\n审计/统计/复盘', C_PALE, C_MID, fontsize=9)
    draw_arrow(ax, cx - 1.8, 3.8, cx - 1.8, 2.95, color=C_MID, lw=1.5)

    # 人工复审 → 回流词库
    draw_box(ax, cx + 0.4, 2.3, 2.8, 0.65, '复审结果回流\n更新词库/白名单', C_PALE, C_MID, fontsize=9)
    draw_arrow(ax, cx + 1.8, 3.8, cx + 1.8, 2.95, color=C_MID, lw=1.5)

    # 全链路留痕标注（底部）
    draw_box(ax, cx - 3.5, 0.8, 7.0, 0.7, '全流程留痕：原始文本 + 归一化文本 + 各阶段命中结果 + 风险分数 + 处置动作 + 操作人',
             C_GRAY_PALE, C_GRAY, fontsize=9, bold=False)

    # 图例
    ax.text(0.3, 0.25, '图例：', fontproperties=fp_bold, fontsize=9, color=C_TEXT)
    legend_items = [
        ('处理步骤', C_PALE, C_MID),
        ('二期新增核心', C_ACCENT_PALE, C_ACCENT),
        ('判定节点', C_YELLOW_PALE, C_YELLOW),
        ('放行路径', C_GREEN_PALE, C_GREEN),
        ('拦截路径', C_RED_PALE, C_RED),
    ]
    for i, (label, fc, ec) in enumerate(legend_items):
        x = 1.2 + i * 2.3
        rect = mpatches.Rectangle((x, 0.15), 0.25, 0.25, facecolor=fc, edgecolor=ec, lw=1.2)
        ax.add_patch(rect)
        ax.text(x + 0.35, 0.27, label, fontproperties=fp, fontsize=8, color=C_TEXT, va='center')

    plt.tight_layout()
    path = os.path.join(OUT_DIR, 'flowchart.png')
    plt.savefig(path, dpi=200, bbox_inches='tight', facecolor=C_WHITE)
    plt.close()
    print(f'[OK] 核心业务流程图: {path}')


# ================================================================
# 图3：角色泳道图（优化间距和布局）
# ================================================================
def draw_swimlane():
    fig, ax = plt.subplots(1, 1, figsize=(17, 11))
    ax.set_xlim(0, 17)
    ax.set_ylim(0, 11)
    ax.axis('off')
    ax.set_title('敏感词过滤系统角色泳道图', fontproperties=fp_bold, fontsize=17, color=C_DARK, pad=25)
    ax.text(0.5, 1.015, '前置Prompt审核 + 后置Response审核 ｜ 三层过滤流水线 ｜ 运营闭环',
            transform=ax.transAxes, ha='center', fontproperties=fp, fontsize=9.5, color=C_GRAY)

    lanes = [
        ('用户 / 前端', C_MID, '#DEEBF7'),
        ('模型平台', C_GREEN, '#E2EFDA'),
        ('内容安全审核服务', C_ACCENT, '#FCE4D6'),
        ('词库与模型管理', C_YELLOW, '#FFF2CC'),
        ('审核运营团队', C_RED, '#FBE5E5'),
        ('外部大模型厂商', C_PURPLE, '#E8DAEF'),
        ('数据存储 / 审计', C_GRAY, '#F2F2F2'),
    ]
    lane_h = 1.2
    lane_start = 1.0
    label_w = 2.1
    n = len(lanes)

    def lane_y(idx):
        return lane_start + (n - 1 - idx) * lane_h + lane_h / 2

    for i, (name, color, bg) in enumerate(lanes):
        y = lane_start + (n - 1 - i) * lane_h
        rect = mpatches.Rectangle((label_w, y), 14.7, lane_h, facecolor=bg, edgecolor='none', alpha=0.35)
        ax.add_patch(rect)
        box = FancyBboxPatch((0.15, y + 0.12), label_w - 0.3, lane_h - 0.24,
                              boxstyle="round,pad=0.01,rounding_size=0.06",
                              facecolor=color, edgecolor=color, linewidth=1)
        ax.add_patch(box)
        ax.text(label_w / 2, y + lane_h / 2, name, ha='center', va='center',
                fontproperties=fp_bold, fontsize=10, color=C_WHITE)
        ax.axhline(y=y, xmin=0, xmax=1, color='#CCCCCC', linewidth=0.7, linestyle='--')

    # 顶部阶段
    phases = [
        ('阶段一：Prompt前置审核', 2.3, 6.2, C_MID),
        ('阶段二：大模型调用', 6.7, 9.2, C_PURPLE),
        ('阶段三：Response后置审核', 9.7, 13.2, C_MID),
        ('阶段四：运营闭环', 13.7, 16.5, C_GREEN),
    ]
    top_y = lane_start + n * lane_h + 0.15
    for name, x1, x2, color in phases:
        ax.plot([x1, x2], [top_y, top_y], color=color, linewidth=3, solid_capstyle='round')
        ax.text((x1 + x2) / 2, top_y + 0.18, name, ha='center', fontproperties=fp_bold, fontsize=9.5, color=color)

    def node(x, lane_idx, text, w=1.6, h=0.6, fc=C_WHITE, ec=C_MID, fontsize=8.5, bold=False):
        y = lane_y(lane_idx)
        box = FancyBboxPatch((x - w/2, y - h/2), w, h,
                              boxstyle="round,pad=0.01,rounding_size=0.06",
                              facecolor=fc, edgecolor=ec, linewidth=1.8)
        ax.add_patch(box)
        f = fp_bold if bold else fp
        ax.text(x, y, text, ha='center', va='center', fontproperties=f, fontsize=fontsize, color=C_TEXT)
        return (x, y, w, h)

    # 阶段一节点
    n1 = node(2.8, 0, '提交创作请求\n(Prompt文本)', w=1.7, ec=C_MID, bold=True)
    n2 = node(4.5, 1, '接收请求\n调用前置审核', w=1.8, ec=C_GREEN)
    n3 = node(6.0, 2, '前置三层流水线\n①AC规则 ②轻量语义\n③(中风险)大模型复核', w=2.2, h=0.9, fc=C_ACCENT_PALE, ec=C_ACCENT, bold=True, fontsize=7.5)
    n4 = node(6.0, 3, '词库/模型查询\n返回标签与分数', w=2.0, ec=C_YELLOW)
    n5 = node(4.5, 6, '原始Prompt留痕\n写入审计日志', w=1.9, ec=C_GRAY)

    # 阶段二节点
    n6 = node(7.5, 1, '审核通过\n转发外部大模型', w=1.7, ec=C_GREEN, bold=True)
    n7 = node(9.0, 5, '大模型推理\n生成返回内容', w=1.7, ec=C_PURPLE, bold=True)

    # 阶段三节点
    n8 = node(10.5, 1, '接收模型返回\n调用后置审核', w=1.8, ec=C_GREEN)
    n9 = node(12.2, 2, '后置三层流水线\n①AC规则 ②轻量语义\n③(中风险)大模型复核', w=2.2, h=0.9, fc=C_ACCENT_PALE, ec=C_ACCENT, bold=True, fontsize=7.5)
    n10 = node(12.2, 6, '返回内容留痕\n命中记录+分数', w=1.9, ec=C_GRAY)

    # 阶段四节点
    n11 = node(14.2, 1, '返回最终结果\n或违规提示', w=1.7, ec=C_GREEN, bold=True)
    n12 = node(15.6, 0, '接收结果\n继续创作', w=1.5, ec=C_MID)
    n13 = node(14.0, 4, '中风险样本\n人工复核判定', w=1.8, ec=C_RED, bold=True)
    n14 = node(15.7, 3, '词库热更新\n模型微调回流', w=1.6, ec=C_YELLOW)

    # 箭头连接
    # 阶段一
    draw_arrow(ax, n1[0] + n1[2]/2, n1[1], n2[0] - n2[2]/2, n2[1], color=C_MID, lw=1.8)
    draw_arrow(ax, n2[0] + n2[2]/2, n2[1], n3[0] - n3[2]/2, n3[1], color=C_GREEN, lw=1.8)
    arrow_label(ax, 5.2, lane_y(1) + 0.42, 'text_scan(prompt)', color=C_GREEN, fontsize=7.5)
    # 审核↔词库
    draw_arrow(ax, n3[0], n3[1] - n3[3]/2, n4[0], n4[1] + n4[3]/2, color=C_YELLOW, lw=1.3)
    draw_arrow(ax, n4[0], n4[1] + n4[3]/2, n3[0], n3[1] - n3[3]/2, color=C_YELLOW, lw=1.3)
    arrow_label(ax, 6.7, (n3[1] + n4[1]) / 2, '查询/返回', color=C_YELLOW, fontsize=7.5)
    # 留痕
    draw_arrow(ax, n3[0] - 0.5, n3[1] - n3[3]/2, n5[0] + 0.3, n5[1] + n5[3]/2, color=C_GRAY, lw=1.2, ls='--')
    arrow_label(ax, 5.0, (n3[1] + n5[1]) / 2 - 0.1, '留痕', color=C_GRAY, fontsize=7.5)

    # 高风险阻断（虚线红色，从审核到模型平台返回）
    draw_arrow(ax, n3[0], n3[1] + n3[3]/2, n2[0] + 0.3, n2[1] + n2[3]/2 + 0.05, color=C_RED, lw=1.5, ls=':', rad=0.3)
    arrow_label(ax, 5.0, n3[1] + 0.75, 'high风险→直接阻断\n(不调用外部模型)', color=C_RED, fontsize=7.5)

    # 阶段一→阶段二
    draw_arrow(ax, n3[0] + n3[2]/2, n3[1], n6[0] - n6[2]/2, n6[1], color=C_ACCENT, lw=2.0)
    arrow_label(ax, 6.9, lane_y(2) + 0.4, 'isPass=true', color=C_GREEN, fontsize=8)
    draw_arrow(ax, n6[0] + n6[2]/2, n6[1], n7[0] - n7[2]/2, n7[1], color=C_PURPLE, lw=1.8)
    arrow_label(ax, 8.2, (n6[1] + n7[1]) / 2 + 0.25, '转发Prompt', color=C_PURPLE, fontsize=8)

    # 阶段二→阶段三
    draw_arrow(ax, n7[0], n7[1] - n7[3]/2, n8[0], n8[1] + n8[3]/2, color=C_PURPLE, lw=1.8, rad=-0.15)
    arrow_label(ax, 9.7, (n7[1] + n8[1]) / 2, '返回Response', color=C_PURPLE, fontsize=8)
    draw_arrow(ax, n8[0] + n8[2]/2, n8[1], n9[0] - n9[2]/2, n9[1], color=C_GREEN, lw=1.8)
    arrow_label(ax, 11.3, lane_y(1) + 0.42, 'text_scan(response)', color=C_GREEN, fontsize=7.5)
    # 后置留痕
    draw_arrow(ax, n9[0], n9[1] - n9[3]/2, n10[0], n10[1] + n10[3]/2, color=C_GRAY, lw=1.2, ls='--')
    arrow_label(ax, 12.9, (n9[1] + n10[1]) / 2, '留痕', color=C_GRAY, fontsize=7.5)

    # 阶段三→阶段四
    draw_arrow(ax, n9[0] + n9[2]/2, n9[1], n11[0] - n11[2]/2, n11[1], color=C_ACCENT, lw=2.0)
    arrow_label(ax, 13.4, lane_y(2) + 0.4, 'isPass=true', color=C_GREEN, fontsize=8)
    draw_arrow(ax, n11[0] + n11[2]/2, n11[1], n12[0] - n12[2]/2, n12[1], color=C_MID, lw=1.8)

    # 中风险→人工复审
    draw_arrow(ax, n9[0] + 0.3, n9[1] - n9[3]/2, n13[0] - 0.2, n13[1] + n13[3]/2, color=C_RED, lw=1.5, rad=0.15)
    arrow_label(ax, 13.2, (n9[1] + n13[1]) / 2 + 0.1, 'medium\n中风险', color=C_RED, fontsize=7.5)
    # 人工复审→词库更新
    draw_arrow(ax, n13[0] + n13[2]/2, n13[1], n14[0] - n14[2]/2, n14[1], color=C_RED, lw=1.5)
    arrow_label(ax, 14.85, n13[1] + 0.35, '复核结论回流', color=C_RED, fontsize=7.5)
    # 词库热更新→审核服务（虚线回流）
    draw_arrow(ax, n14[0], n14[1] - n14[3]/2, n9[0] + 0.8, n9[1] - n9[3]/2 - 0.1, color=C_GRAY, lw=1.2, ls='--', rad=-0.3)
    arrow_label(ax, 15.0, n9[1] - 0.85, '热更新生效', color=C_GRAY, fontsize=7.5)

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
            '注：橙色泳道为核心审核服务，承载AC规则→轻量语义→大模型复核三层流水线；前置审核命中高风险直接阻断，不调用外部大模型',
            fontproperties=fp, fontsize=8, color=C_GRAY, style='italic', va='center')

    plt.tight_layout()
    path = os.path.join(OUT_DIR, 'swimlane.png')
    plt.savefig(path, dpi=200, bbox_inches='tight', facecolor=C_WHITE)
    plt.close()
    print(f'[OK] 角色泳道图: {path}')


# ================================================================
# 图4：系统时序图（新增）
# ================================================================
def draw_sequence():
    fig, ax = plt.subplots(1, 1, figsize=(15, 11))
    ax.set_xlim(0, 15)
    ax.set_ylim(0, 11)
    ax.axis('off')
    ax.set_title('敏感词过滤系统时序图', fontproperties=fp_bold, fontsize=18, color=C_DARK, pad=20)
    ax.text(0.5, 1.015, '完整请求链路：Prompt前置审核 → 大模型调用 → Response后置审核 → 结果返回',
            transform=ax.transAxes, ha='center', fontproperties=fp, fontsize=10, color=C_GRAY)

    # 参与者（从左到右）
    participants = [
        ('用户/前端', C_MID),
        ('模型平台', C_GREEN),
        ('审核服务', C_ACCENT),
        ('词库/模型', C_YELLOW),
        ('外部大模型', C_PURPLE),
        ('数据存储', C_GRAY),
    ]
    px = [1.5, 4.0, 6.5, 9.0, 11.5, 14.0]
    top_y = 9.8
    bottom_y = 0.8

    # 绘制参与者头部和生命线
    for i, (name, color) in enumerate(participants):
        x = px[i]
        # 头部框
        draw_box(ax, x - 1.0, top_y, 2.0, 0.65, name, fc=color, ec=color, fontsize=10, bold=True, fontcolor=C_WHITE, radius=0.08)
        # 生命线（虚线）
        ax.plot([x, x], [top_y, bottom_y], color=color, linewidth=1.2, linestyle='--', alpha=0.6)

    # 消息定义 (from_idx, to_idx, y, label, color, type)
    # type: 'solid' 同步调用, 'dashed' 返回, 'self' 自调用
    messages = [
        # 阶段一：Prompt前置审核
        (0, 1, 9.0, '1. 提交Prompt创作请求', C_MID, 'solid'),
        (1, 2, 8.5, '2. text_scan(scene=prompt)', C_GREEN, 'solid'),
        (2, 3, 8.0, '3. 查询词库/模型配置', C_YELLOW, 'solid'),
        (3, 2, 7.6, '4. 返回标签+风险分数', C_YELLOW, 'dashed'),
        (2, 2, 7.1, '5. 三层流水线：AC规则→轻量语义→(中风险)大模型复核', C_ACCENT, 'self'),
        (2, 5, 6.6, '6. 原始Prompt留痕（异步）', C_GRAY, 'dashed'),
        (2, 1, 6.1, '7. 返回审核结果 isPass/riskLevel', C_ACCENT, 'dashed'),
        # 高风险阻断分支（标注）
        (1, 0, 5.7, '【高风险分支】直接返回违规提示，不调用外部模型', C_RED, 'dashed'),

        # 阶段二：大模型调用（低风险通过后）
        (1, 4, 5.2, '8. 转发Prompt至外部大模型', C_PURPLE, 'solid'),
        (4, 4, 4.7, '9. 大模型推理生成内容', C_PURPLE, 'self'),
        (4, 1, 4.2, '10. 返回模型生成结果', C_PURPLE, 'dashed'),

        # 阶段三：Response后置审核
        (1, 2, 3.7, '11. text_scan(scene=response)', C_GREEN, 'solid'),
        (2, 3, 3.2, '12. 查询词库/模型配置', C_YELLOW, 'solid'),
        (3, 2, 2.8, '13. 返回标签+风险分数', C_YELLOW, 'dashed'),
        (2, 2, 2.4, '14. 三层流水线审核', C_ACCENT, 'self'),
        (2, 5, 2.0, '15. 返回内容留痕（异步）', C_GRAY, 'dashed'),
        (2, 1, 1.6, '16. 返回后置审核结果', C_ACCENT, 'dashed'),

        # 阶段四：返回用户
        (1, 0, 1.1, '17. 返回最终结果 / 违规提示', C_MID, 'solid'),
    ]

    for from_idx, to_idx, y, label, color, mtype in messages:
        x1 = px[from_idx]
        x2 = px[to_idx]
        if mtype == 'self':
            # 自调用：画一个小循环
            ax.annotate('', xy=(x1 + 0.3, y - 0.15), xytext=(x1, y),
                        arrowprops=dict(arrowstyle='->', color=color, lw=1.5,
                                        connectionstyle='arc3,rad=-0.5'))
            ax.text(x1 + 0.5, y - 0.08, label, ha='left', va='center', fontproperties=fp, fontsize=7.5,
                    color=color, bbox=dict(boxstyle='round,pad=0.15', facecolor=C_WHITE, edgecolor='none', alpha=0.9))
        elif mtype == 'dashed':
            ax.annotate('', xy=(x2, y), xytext=(x1, y),
                        arrowprops=dict(arrowstyle='->', color=color, lw=1.3, linestyle='--'))
            mid_x = (x1 + x2) / 2
            ax.text(mid_x, y + 0.12, label, ha='center', va='bottom', fontproperties=fp, fontsize=7.5,
                    color=color, bbox=dict(boxstyle='round,pad=0.15', facecolor=C_WHITE, edgecolor='none', alpha=0.9))
        else:
            ax.annotate('', xy=(x2, y), xytext=(x1, y),
                        arrowprops=dict(arrowstyle='->', color=color, lw=1.8))
            mid_x = (x1 + x2) / 2
            ax.text(mid_x, y + 0.12, label, ha='center', va='bottom', fontproperties=fp, fontsize=7.5,
                    color=color, bbox=dict(boxstyle='round,pad=0.15', facecolor=C_WHITE, edgecolor='none', alpha=0.9))

    # 阶段分隔标注（左侧）
    stage_labels = [
        (9.0, '阶段一\nPrompt前置审核', C_MID),
        (5.2, '阶段二\n大模型调用', C_PURPLE),
        (3.7, '阶段三\nResponse后置审核', C_MID),
        (1.1, '阶段四\n结果返回', C_GREEN),
    ]
    for y, text, color in stage_labels:
        ax.text(0.2, y, text, ha='left', va='center', fontproperties=fp_bold, fontsize=8,
                color=color, bbox=dict(boxstyle='round,pad=0.2', facecolor=color, edgecolor='none', alpha=0.15))

    # 图例
    ax.text(0.3, 0.35, '图例：', fontproperties=fp_bold, fontsize=9, color=C_TEXT)
    legend_items = [
        ('同步调用', C_MID, '-'),
        ('返回/异步', C_GRAY, '--'),
        ('自处理', C_ACCENT, '-'),
        ('阻断分支', C_RED, '--'),
    ]
    for i, (label, color, ls) in enumerate(legend_items):
        x = 1.2 + i * 2.5
        ax.plot([x, x + 0.5], [0.4, 0.4], color=color, linewidth=2, linestyle=ls)
        ax.annotate('', xy=(x + 0.6, 0.4), xytext=(x + 0.5, 0.4),
                    arrowprops=dict(arrowstyle='->', color=color, lw=1.5))
        ax.text(x + 0.75, 0.4, label, fontproperties=fp, fontsize=8.5, color=C_TEXT, va='center')

    plt.tight_layout()
    path = os.path.join(OUT_DIR, 'sequence.png')
    plt.savefig(path, dpi=200, bbox_inches='tight', facecolor=C_WHITE)
    plt.close()
    print(f'[OK] 系统时序图: {path}')


if __name__ == '__main__':
    draw_architecture()
    draw_flowchart()
    draw_swimlane()
    draw_sequence()
    print('\n全部4张图表生成完成！')
