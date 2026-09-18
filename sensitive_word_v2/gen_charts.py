# -*- coding: utf-8 -*-
"""
敏感词二期产品方案 - 图表生成脚本
生成：产品架构图、核心业务流程图、角色泳道图
"""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
from matplotlib.font_manager import FontProperties
import os

# 微软雅黑字体
FONT_PATH = r'C:\Windows\Fonts\msyh.ttc'
fp = FontProperties(fname=FONT_PATH)
fp_bold = FontProperties(fname=FONT_PATH, weight='bold')

OUT_DIR = r'D:\phpstudy_pro\WWW\ai-novel-workstation1.2.0\sensitive_word_v2'
os.makedirs(OUT_DIR, exist_ok=True)

# 配色方案（专业商务蓝）
C_DARK = '#1F4E79'
C_MID = '#2E75B6'
C_LIGHT = '#5B9BD5'
C_PALE = '#DEEBF7'
C_ACCENT = '#ED7D31'
C_GREEN = '#548235'
C_RED = '#C00000'
C_GRAY = '#7F7F7F'
C_BG = '#F8F9FA'
C_WHITE = '#FFFFFF'
C_TEXT = '#262626'


def set_title(ax, title, subtitle=None):
    ax.set_title(title, fontproperties=fp_bold, fontsize=18, color=C_DARK, pad=20)
    if subtitle:
        ax.text(0.5, 1.02, subtitle, transform=ax.transAxes, ha='center',
                fontproperties=fp, fontsize=10, color=C_GRAY)


def draw_box(ax, x, y, w, h, text, fc=C_PALE, ec=C_MID, fontsize=10,
             fontcolor=C_TEXT, bold=False, radius=0.02):
    box = FancyBboxPatch((x, y), w, h, boxstyle=f"round,pad=0.01,rounding_size={radius}",
                          facecolor=fc, edgecolor=ec, linewidth=1.5)
    ax.add_patch(box)
    f = fp_bold if bold else fp
    ax.text(x + w/2, y + h/2, text, ha='center', va='center',
            fontproperties=f, fontsize=fontsize, color=fontcolor, wrap=True)
    return box


def draw_arrow(ax, x1, y1, x2, y2, color=C_MID, style='->', lw=1.8):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle=style, color=color, lw=lw,
                                connectionstyle='arc3,rad=0'))


# ============================================================
# 图1：产品架构图
# ============================================================
def draw_architecture():
    fig, ax = plt.subplots(1, 1, figsize=(14, 10))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 10)
    ax.axis('off')
    set_title(ax, '敏感词过滤引擎（二期）产品架构图', '分层架构 · 模块化设计 · 可扩展词库体系')

    # 第一层：接入层
    draw_box(ax, 0.3, 8.6, 13.4, 0.9, '', fc='#E8F0FE', ec=C_DARK, radius=0.03)
    ax.text(0.6, 9.05, '接入层', fontproperties=fp_bold, fontsize=12, color=C_DARK, va='center')
    modules_top = ['对话生成接口', '文本创作接口', '内容审核接口', '第三方API接入']
    for i, m in enumerate(modules_top):
        draw_box(ax, 2.0 + i*3.0, 8.72, 2.6, 0.65, m, fc=C_WHITE, ec=C_LIGHT, fontsize=9.5)

    # 第二层：过滤引擎核心层
    draw_box(ax, 0.3, 5.6, 13.4, 2.7, '', fc='#FFF2E8', ec=C_ACCENT, radius=0.03)
    ax.text(0.6, 8.05, '过滤引擎核心层（二期新增）', fontproperties=fp_bold, fontsize=12, color=C_ACCENT, va='center')

    # 预处理子层
    draw_box(ax, 0.7, 7.2, 2.4, 0.7, '文本预处理\n（分词/归一化/去噪）', fc=C_WHITE, ec=C_LIGHT, fontsize=9)
    # 基础匹配
    draw_box(ax, 3.4, 7.2, 2.4, 0.7, '基础词库匹配\n（精确/模糊匹配）', fc=C_WHITE, ec=C_LIGHT, fontsize=9)
    # 组合匹配（二期核心）
    draw_box(ax, 6.1, 7.2, 2.4, 0.7, '组合词匹配引擎\n（前缀+核心词）', fc='#FCE4D6', ec=C_ACCENT, fontsize=9, bold=True)
    # 白名单校验（二期核心）
    draw_box(ax, 8.8, 7.2, 2.4, 0.7, '白名单反向排除\n（语境豁免判定）', fc='#FCE4D6', ec=C_ACCENT, fontsize=9, bold=True)
    # 语义增强
    draw_box(ax, 11.5, 7.2, 2.0, 0.7, '语义匹配增强\n（正则/语义模型）', fc=C_WHITE, ec=C_LIGHT, fontsize=9)

    # 决策子层
    draw_box(ax, 0.7, 6.0, 4.0, 0.85, '风险分级决策器\n（放行 / 拦截 / 人工复审）', fc=C_DARK, ec=C_DARK, fontsize=10, fontcolor=C_WHITE, bold=True)
    draw_box(ax, 5.2, 6.0, 4.0, 0.85, '命中日志与上下文追踪\n（记录匹配路径与词库版本）', fc=C_MID, ec=C_MID, fontsize=10, fontcolor=C_WHITE)
    draw_box(ax, 9.7, 6.0, 3.8, 0.85, '实时性能监控\n（延迟/命中率/误杀率）', fc=C_MID, ec=C_MID, fontsize=10, fontcolor=C_WHITE)

    # 第三层：词库管理层
    draw_box(ax, 0.3, 3.2, 13.4, 2.1, '', fc='#E8F5E9', ec=C_GREEN, radius=0.03)
    ax.text(0.6, 5.05, '词库管理层（精细化标签体系）', fontproperties=fp_bold, fontsize=12, color=C_GREEN, va='center')

    libs = [
        ('通用违规词库', '政治敏感/色情/暴力\n/辱骂等基础词'),
        ('组合规则词库', '前缀词+核心词\n关联配置（二期）'),
        ('白名单词库', '专业术语/固定搭配\n语境豁免（二期）'),
        ('行业专属词库', '医疗/金融/法律\n等领域定制词'),
        ('动态更新词库', '热点事件/新型变体\n实时同步'),
    ]
    for i, (name, desc) in enumerate(libs):
        x = 0.7 + i * 2.62
        fc = '#E2EFDA' if i in [1, 2] else C_WHITE
        ec = C_GREEN if i in [1, 2] else C_LIGHT
        draw_box(ax, x, 3.5, 2.4, 1.3, f'{name}\n\n{desc}', fc=fc, ec=ec, fontsize=8.5,
                 bold=(i in [1, 2]))

    # 第四层：数据存储层
    draw_box(ax, 0.3, 1.5, 13.4, 1.4, '', fc='#F2F2F2', ec=C_GRAY, radius=0.03)
    ax.text(0.6, 2.65, '数据存储层', fontproperties=fp_bold, fontsize=12, color=C_GRAY, va='center')
    stores = ['Redis 热词缓存', 'MySQL 词库配置', 'Elasticsearch 命中日志', '对象存储 审计归档']
    for i, s in enumerate(stores):
        draw_box(ax, 2.5 + i*2.9, 1.7, 2.5, 0.7, s, fc=C_WHITE, ec=C_GRAY, fontsize=9.5)

    # 右侧：运营管理后台（贯穿）
    draw_box(ax, 12.0, 0.2, 1.7, 1.0, '运营管理后台\n词库配置/审核/统计', fc=C_DARK, ec=C_DARK,
             fontsize=8.5, fontcolor=C_WHITE, bold=True, radius=0.03)

    # 层间箭头
    for x in [3.3, 6.9, 10.5]:
        draw_arrow(ax, x, 8.6, x, 8.35)
        draw_arrow(ax, x, 5.6, x, 5.35)
        draw_arrow(ax, x, 3.2, x, 2.95)

    # 图例
    legend_y = 0.15
    ax.text(0.3, legend_y + 0.3, '图例：', fontproperties=fp_bold, fontsize=9, color=C_TEXT)
    items = [('二期新增核心模块', '#FCE4D6', C_ACCENT), ('基础已有模块', C_WHITE, C_LIGHT),
             ('决策/监控模块', C_DARK, C_DARK), ('存储模块', C_WHITE, C_GRAY)]
    for i, (label, fc, ec) in enumerate(items):
        x = 1.2 + i * 2.8
        rect = mpatches.Rectangle((x, legend_y + 0.15), 0.25, 0.25, facecolor=fc, edgecolor=ec, lw=1.2)
        ax.add_patch(rect)
        ax.text(x + 0.35, legend_y + 0.27, label, fontproperties=fp, fontsize=8.5, color=C_TEXT, va='center')

    plt.tight_layout()
    path = os.path.join(OUT_DIR, 'architecture.png')
    plt.savefig(path, dpi=200, bbox_inches='tight', facecolor=C_WHITE)
    plt.close()
    print(f'[OK] 产品架构图: {path}')


# ============================================================
# 图2：核心业务流程图
# ============================================================
def draw_flowchart():
    fig, ax = plt.subplots(1, 1, figsize=(14, 11))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 11)
    ax.axis('off')
    set_title(ax, '敏感词过滤核心业务流程图', '正向组合拦截 + 反向语境豁免 双引擎判定')

    # 起始
    draw_box(ax, 5.5, 10.0, 3.0, 0.65, '用户提交文本内容', fc=C_DARK, ec=C_DARK,
             fontsize=11, fontcolor=C_WHITE, bold=True, radius=0.3)

    # 步骤1 预处理
    draw_box(ax, 5.0, 8.9, 4.0, 0.75, '① 文本预处理\n分词 / 大小写归一 / 特殊字符过滤', fc=C_PALE, ec=C_MID, fontsize=10)
    draw_arrow(ax, 7.0, 10.0, 7.0, 9.65)

    # 步骤2 基础词库匹配
    draw_box(ax, 5.0, 7.7, 4.0, 0.75, '② 基础违规词库匹配\n精确匹配 + 模糊匹配（编辑距离）', fc=C_PALE, ec=C_MID, fontsize=10)
    draw_arrow(ax, 7.0, 8.9, 7.0, 8.45)

    # 判定1：是否命中基础词库
    draw_box(ax, 5.3, 6.4, 3.4, 0.85, '是否命中\n基础违规词？', fc='#FFF2CC', ec='#BF9000',
             fontsize=10.5, bold=True, radius=0.1)
    draw_arrow(ax, 7.0, 7.7, 7.0, 7.25)

    # 否 → 组合词匹配
    draw_box(ax, 0.5, 6.4, 3.5, 0.85, '③ 组合词匹配引擎\n扫描"前缀+核心词"组合规则', fc='#FCE4D6', ec=C_ACCENT,
             fontsize=9.5, bold=True)
    ax.annotate('否', xy=(5.3, 6.82), xytext=(4.2, 6.82),
                fontproperties=fp_bold, fontsize=10, color=C_GREEN, ha='center')
    draw_arrow(ax, 5.3, 6.82, 4.0, 6.82)

    # 判定2：是否命中组合规则
    draw_box(ax, 0.5, 5.0, 3.5, 0.85, '是否命中\n组合规则？', fc='#FFF2CC', ec='#BF9000',
             fontsize=10.5, bold=True, radius=0.1)
    draw_arrow(ax, 2.25, 6.4, 2.25, 5.85)

    # 是（基础命中）→ 白名单校验
    draw_box(ax, 9.8, 6.4, 3.7, 0.85, '④ 白名单反向排除校验\n检查是否属于豁免语境/固定搭配', fc='#FCE4D6', ec=C_ACCENT,
             fontsize=9.5, bold=True)
    ax.annotate('是', xy=(8.7, 6.82), xytext=(9.2, 6.82),
                fontproperties=fp_bold, fontsize=10, color=C_RED, ha='center')
    draw_arrow(ax, 8.7, 6.82, 9.8, 6.82)

    # 组合命中 → 也进入白名单校验（从下方绕）
    ax.annotate('是', xy=(2.25, 5.0), xytext=(2.25, 4.5),
                fontproperties=fp_bold, fontsize=10, color=C_RED, ha='center')
    draw_arrow(ax, 2.25, 5.0, 2.25, 3.8)
    draw_arrow(ax, 2.25, 3.8, 11.65, 3.8)
    draw_arrow(ax, 11.65, 3.8, 11.65, 6.4)

    # 判定3：白名单是否豁免
    draw_box(ax, 9.8, 5.0, 3.7, 0.85, '是否命中\n白名单豁免？', fc='#FFF2CC', ec='#BF9000',
             fontsize=10.5, bold=True, radius=0.1)
    draw_arrow(ax, 11.65, 6.4, 11.65, 5.85)

    # 组合未命中 → 直接放行
    draw_box(ax, 0.5, 3.5, 3.5, 0.7, '【放行】\n无违规命中', fc='#E2EFDA', ec=C_GREEN,
             fontsize=10, bold=True, fontcolor=C_GREEN)
    ax.annotate('否', xy=(2.25, 5.0), xytext=(1.5, 4.2),
                fontproperties=fp_bold, fontsize=10, color=C_GREEN, ha='center')
    # 箭头从组合判定"否"到放行
    draw_arrow(ax, 1.5, 5.0, 1.5, 4.2, color=C_GREEN)

    # 白名单豁免 → 放行
    draw_box(ax, 9.8, 3.5, 3.7, 0.7, '【豁免放行】\n记录豁免日志', fc='#E2EFDA', ec=C_GREEN,
             fontsize=10, bold=True, fontcolor=C_GREEN)
    ax.annotate('是', xy=(11.65, 5.0), xytext=(11.65, 4.4),
                fontproperties=fp_bold, fontsize=10, color=C_GREEN, ha='center')
    draw_arrow(ax, 11.65, 5.0, 11.65, 4.2, color=C_GREEN)

    # 白名单未豁免 → 风险分级
    draw_box(ax, 5.0, 3.5, 4.0, 0.75, '⑤ 风险分级判定\n高风险拦截 / 中风险复审', fc=C_DARK, ec=C_DARK,
             fontsize=10, bold=True, fontcolor=C_WHITE)
    ax.annotate('否', xy=(9.8, 5.42), xytext=(9.2, 4.0),
                fontproperties=fp_bold, fontsize=10, color=C_RED, ha='center')
    draw_arrow(ax, 9.8, 5.42, 9.0, 4.0, color=C_RED)

    # 高风险拦截
    draw_box(ax, 2.5, 2.0, 3.5, 0.75, '【拦截】\n返回命中词/规则/等级', fc='#FBE5E5', ec=C_RED,
             fontsize=10, bold=True, fontcolor=C_RED)
    draw_arrow(ax, 6.0, 3.5, 4.5, 2.75, color=C_RED)
    ax.text(5.0, 3.0, '高风险', fontproperties=fp_bold, fontsize=9, color=C_RED)

    # 中风险人工复审
    draw_box(ax, 8.0, 2.0, 3.5, 0.75, '【人工复审】\n审核员二次判定', fc='#FFF2CC', ec='#BF9000',
             fontsize=10, bold=True)
    draw_arrow(ax, 8.0, 3.5, 9.5, 2.75, color='#BF9000')
    ax.text(8.8, 3.0, '中风险', fontproperties=fp_bold, fontsize=9, color='#BF9000')

    # 复审结果回流
    draw_box(ax, 8.0, 0.7, 3.5, 0.7, '复审结果回流词库\n（更新白名单/规则库）', fc=C_PALE, ec=C_MID, fontsize=9.5)
    draw_arrow(ax, 9.75, 2.0, 9.75, 1.4)

    # 拦截日志
    draw_box(ax, 2.5, 0.7, 3.5, 0.7, '命中日志归档\n（审计/统计/复盘）', fc=C_PALE, ec=C_MID, fontsize=9.5)
    draw_arrow(ax, 4.25, 2.0, 4.25, 1.4)

    # 底部说明
    ax.text(7.0, 0.15, '注：橙色模块为二期新增核心能力；黄色菱形为判定节点；绿色为放行路径，红色为拦截路径',
            ha='center', fontproperties=fp, fontsize=8.5, color=C_GRAY, style='italic')

    plt.tight_layout()
    path = os.path.join(OUT_DIR, 'flowchart.png')
    plt.savefig(path, dpi=200, bbox_inches='tight', facecolor=C_WHITE)
    plt.close()
    print(f'[OK] 核心业务流程图: {path}')


# ============================================================
# 图3：角色泳道图
# ============================================================
def draw_swimlane():
    fig, ax = plt.subplots(1, 1, figsize=(15, 10))
    ax.set_xlim(0, 15)
    ax.set_ylim(0, 10)
    ax.axis('off')
    set_title(ax, '敏感词过滤系统角色泳道图', '多角色协同 · 全链路可追溯')

    # 泳道定义（从上到下）
    lanes = [
        ('用户 / 前端', '#DEEBF7', C_MID),
        ('API 网关', '#E2EFDA', C_GREEN),
        ('过滤引擎服务', '#FCE4D6', C_ACCENT),
        ('词库管理服务', '#FFF2CC', '#BF9000'),
        ('审核运营团队', '#FBE5E5', C_RED),
        ('数据存储层', '#F2F2F2', C_GRAY),
    ]
    lane_height = 1.35
    lane_start_y = 1.0
    label_width = 1.8

    # 绘制泳道
    for i, (name, fc, ec) in enumerate(lanes):
        y = lane_start_y + (len(lanes) - 1 - i) * lane_height
        # 泳道背景
        rect = mpatches.Rectangle((label_width, y), 13.0, lane_height,
                                    facecolor=fc, edgecolor='none', alpha=0.4)
        ax.add_patch(rect)
        # 泳道标签
        label_box = FancyBboxPatch((0.1, y + 0.15), label_width - 0.2, lane_height - 0.3,
                                     boxstyle="round,pad=0.01,rounding_size=0.05",
                                     facecolor=ec, edgecolor=ec, linewidth=1)
        ax.add_patch(label_box)
        ax.text((label_width) / 2, y + lane_height / 2, name, ha='center', va='center',
                fontproperties=fp_bold, fontsize=10, color=C_WHITE)
        # 泳道分隔线
        ax.axhline(y=y, xmin=0, xmax=1, color='#CCCCCC', linewidth=0.8, linestyle='--')

    # 顶部时间轴/阶段
    phases = ['请求发起', '引擎判定', '词库交互', '结果处理', '运营闭环']
    phase_x = [2.5, 5.0, 7.8, 10.5, 13.0]
    for px, ph in zip(phase_x, phases):
        ax.text(px, lane_start_y + len(lanes) * lane_height + 0.15, ph, ha='center',
                fontproperties=fp_bold, fontsize=9.5, color=C_DARK)
        ax.plot([px - 1.0, px + 1.0], [lane_start_y + len(lanes) * lane_height + 0.05,
                 lane_start_y + len(lanes) * lane_height + 0.05], color=C_DARK, linewidth=2)

    # 辅助函数：获取泳道中心线Y
    def lane_y(idx):
        return lane_start_y + (len(lanes) - 1 - idx) * lane_height + lane_height / 2

    # 步骤节点定义 (lane_idx, x, text, color)
    steps = [
        # 用户/前端
        (0, 2.5, '提交文本\n创作请求', C_MID),
        (0, 10.5, '接收结果\n展示提示', C_MID),
        # API网关
        (1, 3.8, '鉴权/限流\n路由转发', C_GREEN),
        # 过滤引擎
        (2, 5.2, '文本预处理\n+基础匹配', C_ACCENT),
        (2, 7.0, '组合词匹配\n+白名单校验', C_ACCENT),
        (2, 9.0, '风险分级\n输出判定', C_ACCENT),
        # 词库管理
        (3, 6.2, '查询词库\n返回标签', '#BF9000'),
        (3, 8.0, '查询组合规则\n+白名单配置', '#BF9000'),
        # 审核运营
        (4, 10.5, '中风险内容\n人工复审', C_RED),
        (4, 12.5, '更新词库\n配置规则', C_RED),
        # 数据存储
        (5, 9.0, '写入命中日志\n+审计记录', C_GRAY),
        (5, 12.5, '持久化词库\n版本管理', C_GRAY),
    ]

    node_w = 1.5
    node_h = 0.65
    for li, x, text, color in steps:
        y = lane_y(li)
        fc = C_WHITE
        box = FancyBboxPatch((x - node_w/2, y - node_h/2), node_w, node_h,
                              boxstyle="round,pad=0.01,rounding_size=0.06",
                              facecolor=fc, edgecolor=color, linewidth=1.8)
        ax.add_patch(box)
        ax.text(x, y, text, ha='center', va='center', fontproperties=fp, fontsize=8.5, color=C_TEXT)

    # 箭头连接
    arrows = [
        # 用户→网关
        (2.5 + node_w/2, lane_y(0), 3.8 - node_w/2, lane_y(1)),
        # 网关→引擎预处理
        (3.8 + node_w/2, lane_y(1), 5.2 - node_w/2, lane_y(2)),
        # 引擎预处理→词库查询
        (5.2, lane_y(2) - node_h/2, 6.2, lane_y(3) + node_h/2),
        # 词库返回→引擎组合匹配
        (6.2, lane_y(3) + node_h/2, 7.0, lane_y(2) - node_h/2),
        # 引擎组合匹配→词库规则查询
        (7.0, lane_y(2) - node_h/2, 8.0, lane_y(3) + node_h/2),
        # 词库规则返回→引擎风险分级
        (8.0, lane_y(3) + node_h/2, 9.0, lane_y(2) - node_h/2),
        # 引擎风险分级→数据存储日志
        (9.0, lane_y(2) - node_h/2, 9.0, lane_y(5) + node_h/2),
        # 引擎→用户（放行/拦截结果）
        (9.0 + node_w/2, lane_y(2), 10.5 - node_w/2, lane_y(0)),
        # 引擎→审核运营（中风险复审）
        (9.0 + node_w/2, lane_y(2), 10.5 - node_w/2, lane_y(4)),
        # 审核运营→用户（复审结果）
        (10.5, lane_y(4) - node_h/2, 10.5, lane_y(0) + node_h/2),
        # 审核运营→更新词库
        (10.5 + node_w/2, lane_y(4), 12.5 - node_w/2, lane_y(4)),
        # 更新词库→数据存储
        (12.5, lane_y(4) - node_h/2, 12.5, lane_y(5) + node_h/2),
        # 数据存储→词库管理（版本同步，虚线回流）
        (12.5 - node_w/2, lane_y(5), 8.0 + node_w/2, lane_y(3)),
    ]

    for i, (x1, y1, x2, y2) in enumerate(arrows):
        style = '->'
        lw = 1.5
        color = C_MID
        if i == len(arrows) - 1:  # 最后一个回流用虚线
            ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                        arrowprops=dict(arrowstyle='->', color=C_GRAY, lw=1.2,
                                        linestyle='dashed', connectionstyle='arc3,rad=-0.2'))
        else:
            ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                        arrowprops=dict(arrowstyle=style, color=color, lw=lw,
                                        connectionstyle='arc3,rad=0.05'))

    # 图例
    ax.text(0.3, 0.5, '图例：', fontproperties=fp_bold, fontsize=9, color=C_TEXT)
    legend_items = [('主流程调用', C_MID, '-'), ('数据回流/同步', C_GRAY, '--')]
    for i, (label, color, ls) in enumerate(legend_items):
        x = 1.2 + i * 3.0
        ax.plot([x, x + 0.5], [0.6, 0.6], color=color, linewidth=2, linestyle=ls)
        ax.annotate('', xy=(x + 0.6, 0.6), xytext=(x + 0.5, 0.6),
                    arrowprops=dict(arrowstyle='->', color=color, lw=1.5))
        ax.text(x + 0.75, 0.6, label, fontproperties=fp, fontsize=8.5, color=C_TEXT, va='center')

    ax.text(8.0, 0.5, '注：橙色泳道为二期核心引擎服务，承载组合词匹配与白名单校验逻辑',
            fontproperties=fp, fontsize=8.5, color=C_GRAY, style='italic', va='center')

    plt.tight_layout()
    path = os.path.join(OUT_DIR, 'swimlane.png')
    plt.savefig(path, dpi=200, bbox_inches='tight', facecolor=C_WHITE)
    plt.close()
    print(f'[OK] 角色泳道图: {path}')


if __name__ == '__main__':
    draw_architecture()
    draw_flowchart()
    draw_swimlane()
    print('\n全部图表生成完成！')
