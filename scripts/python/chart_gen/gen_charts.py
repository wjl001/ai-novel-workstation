# -*- coding: utf-8 -*-
"""生成短剧编剧篇和视频生成篇所需的全部架构图和流程图"""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import os

# 配置中文字体
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei', 'Arial Unicode MS']
plt.rcParams['axes.unicode_minus'] = False

OUT_DIR = r'D:\phpstudy_pro\WWW\ai-novel-workstation1.2.0\charts'
os.makedirs(OUT_DIR, exist_ok=True)

# 颜色方案
C_BG = '#f8f9fa'
C_LAYER1 = '#e3f2fd'  # 浅蓝 - 用户层
C_LAYER2 = '#fff3e0'  # 浅橙 - Hermes层
C_LAYER3 = '#e8f5e9'  # 浅绿 - 模型层
C_BOX = '#ffffff'
C_BORDER = '#455a64'
C_ARROW = '#37474f'
C_ACCENT = '#1565c0'
C_ACCENT2 = '#e65100'
C_ACCENT3 = '#2e7d32'

def draw_box(ax, x, y, w, h, text, color=C_BOX, border=C_BORDER, fontsize=9, bold=False):
    """绘制圆角矩形文本框"""
    box = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.02",
                         facecolor=color, edgecolor=border, linewidth=1.2)
    ax.add_patch(box)
    weight = 'bold' if bold else 'normal'
    ax.text(x + w/2, y + h/2, text, ha='center', va='center',
            fontsize=fontsize, fontweight=weight, wrap=True)

def draw_arrow(ax, x1, y1, x2, y2, color=C_ARROW, style='->', lw=1.5):
    """绘制箭头"""
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle=style, color=color, lw=lw))

# ============================================================
# 图1：短剧编剧篇 - 产品整体架构图
# ============================================================
def chart_drama_architecture():
    fig, ax = plt.subplots(1, 1, figsize=(14, 10))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 10)
    ax.axis('off')
    ax.set_facecolor(C_BG)
    fig.patch.set_facecolor(C_BG)

    ax.text(7, 9.5, '短剧编剧 Prompt 智能增强系统 — 整体架构图', ha='center',
            fontsize=16, fontweight='bold', color=C_BORDER)

    # 第一层：用户接入层
    ax.add_patch(FancyBboxPatch((0.3, 7.2), 13.4, 1.8, boxstyle="round,pad=0.05",
                 facecolor=C_LAYER1, edgecolor=C_ACCENT, linewidth=1.5, alpha=0.6))
    ax.text(0.6, 8.7, '第一层：用户接入层', fontsize=11, fontweight='bold', color=C_ACCENT)
    draw_box(ax, 1.0, 7.5, 2.8, 1.0, 'Web前端页面\n（创意输入/参数配置）', fontsize=9)
    draw_box(ax, 4.3, 7.5, 2.8, 1.0, '开放API接口\n（第三方系统接入）', fontsize=9)
    draw_box(ax, 7.6, 7.5, 2.8, 1.0, '批量任务入口\n（剧本/大纲批量处理）', fontsize=9)
    draw_box(ax, 10.9, 7.5, 2.5, 1.0, '结果展示面板\n（优化后Prompt输出）', fontsize=9)

    # 箭头向下
    for x in [2.4, 5.7, 9.0, 12.15]:
        draw_arrow(ax, x, 7.2, x, 6.9)

    # 第二层：Hermes多轮对话增强层（核心）
    ax.add_patch(FancyBboxPatch((0.3, 2.8), 13.4, 4.0, boxstyle="round,pad=0.05",
                 facecolor=C_LAYER2, edgecolor=C_ACCENT2, linewidth=2, alpha=0.5))
    ax.text(0.6, 6.5, '第二层：Hermes Agent 多轮对话增强层（系统核心）', fontsize=11,
            fontweight='bold', color=C_ACCENT2)

    # Hermes内部模块
    draw_box(ax, 0.6, 5.2, 2.5, 0.9, '需求解析器\n识别场景/提取参数', color='#fff8e1', border=C_ACCENT2, fontsize=8.5)
    draw_box(ax, 3.4, 5.2, 2.5, 0.9, '上下文管理器\n注入剧本/大纲/分镜', color='#fff8e1', border=C_ACCENT2, fontsize=8.5)
    draw_box(ax, 6.2, 5.2, 2.5, 0.9, '多轮对话引擎\n（界面不可见，底层自对话）', color='#ffe0b2', border=C_ACCENT2, fontsize=8.5, bold=True)
    draw_box(ax, 9.0, 5.2, 2.5, 0.9, 'Skills知识库\n编剧专业规则调用', color='#fff8e1', border=C_ACCENT2, fontsize=8.5)
    draw_box(ax, 11.8, 5.2, 1.8, 0.9, '自检修正器\n质量校验/迭代优化', color='#fff8e1', border=C_ACCENT2, fontsize=8.5)

    # 多轮对话内部流程示意
    ax.text(7.0, 4.6, '▼ Hermes 底层多轮自对话流程（界面不显示）▼', ha='center',
            fontsize=9, fontweight='bold', color=C_ACCENT2)
    rounds = ['第1轮\n需求理解\n&场景识别', '第2轮\n上下文加载\n&规则匹配', '第3轮\nPrompt初稿\n生成', '第4轮\n质量自检\n&问题诊断', '第5轮\n修正优化\n&最终输出']
    for i, r in enumerate(rounds):
        x = 0.8 + i * 2.6
        draw_box(ax, x, 3.2, 2.2, 1.0, r, color='#fff3e0', border=C_ACCENT2, fontsize=8)
        if i < 4:
            draw_arrow(ax, x+2.2, 3.7, x+2.6, 3.7, color=C_ACCENT2, lw=1.2)

    # 箭头向下
    draw_arrow(ax, 7.0, 2.8, 7.0, 2.5)

    # 第三层：模型服务层
    ax.add_patch(FancyBboxPatch((0.3, 0.3), 13.4, 2.1, boxstyle="round,pad=0.05",
                 facecolor=C_LAYER3, edgecolor=C_ACCENT3, linewidth=1.5, alpha=0.6))
    ax.text(0.6, 2.1, '第三层：模型服务层', fontsize=11, fontweight='bold', color=C_ACCENT3)
    draw_box(ax, 1.0, 0.6, 3.5, 1.1, '通用大语言模型\n（Hermes对话推理引擎）', fontsize=9)
    draw_box(ax, 5.2, 0.6, 3.5, 1.1, '短剧编剧专用模型\n（剧本/大纲/角色生成）', fontsize=9)
    draw_box(ax, 9.4, 0.6, 3.8, 1.1, '向量知识库\n（Skills模板/历史案例/风格库）', fontsize=9)

    plt.tight_layout()
    path = os.path.join(OUT_DIR, 'drama_architecture.png')
    plt.savefig(path, dpi=150, bbox_inches='tight', facecolor=C_BG)
    plt.close()
    print(f'已生成: {path}')

# ============================================================
# 图2：短剧编剧篇 - Hermes多轮对话详细流程图
# ============================================================
def chart_drama_hermes_flow():
    fig, ax = plt.subplots(1, 1, figsize=(14, 12))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 12)
    ax.axis('off')
    ax.set_facecolor(C_BG)
    fig.patch.set_facecolor(C_BG)

    ax.text(7, 11.5, 'Hermes Agent 底层多轮对话优化流程图（界面不可见）', ha='center',
            fontsize=15, fontweight='bold', color=C_BORDER)

    steps = [
        (0.5, 10.0, '【用户输入】\n"帮我写一个都市逆袭短剧，80集，主角是隐藏身份的富二代"', '#e3f2fd', C_ACCENT),
        (0.5, 8.5, '第1轮对话（Hermes内部）\n系统→Agent：解析用户需求，识别为"骨架生成"场景\nAgent→系统：已识别，需要收集10项参数（题材/集数/主角类型/反派势力...）', '#fff3e0', C_ACCENT2),
        (0.5, 7.0, '第2轮对话（Hermes内部）\n系统→Agent：加载上下文——无历史剧本，首次创建\n加载Skills：骨架生成器模板+短剧创作速查卡\nAgent→系统：上下文已加载，开始生成3套方案', '#fff3e0', C_ACCENT2),
        (0.5, 5.5, '第3轮对话（Hermes内部）\n系统→Agent：生成方案A/B/C，每套含情绪曲线/分阶段结构/反转点/名场面\nAgent→系统：3套方案已生成，进入自检环节', '#fff3e0', C_ACCENT2),
        (0.5, 4.0, '第4轮对话（Hermes内部）\n系统→Agent：自检——方案A反转点不足3个？方案B场景超过AI制作能力？\n调用剧本审核师Skills进行质量评估\nAgent→系统：发现方案B第30集场景复杂，已调整为室内场景', '#fff3e0', C_ACCENT2),
        (0.5, 2.5, '第5轮对话（Hermes内部）\n系统→Agent：根据自检结果修正，输出最终优化版Prompt\nAgent→系统：优化完成，包含3套方案+可行性分析+推荐方案', '#fff3e0', C_ACCENT2),
        (0.5, 0.8, '【输出给用户】\n优化后的完整Prompt（含3套骨架方案+推荐分析）\n用户可直接使用或选择方案进入下一步', '#e8f5e9', C_ACCENT3),
    ]

    for x, y, text, color, border in steps:
        draw_box(ax, x, y, 13.0, 1.2, text, color=color, border=border, fontsize=9.5)

    # 箭头
    for i in range(len(steps)-1):
        y1 = steps[i][1]
        y2 = steps[i+1][1] + 1.2
        draw_arrow(ax, 7.0, y1, 7.0, y2, color=C_ARROW, lw=2)

    # 侧边标注
    ax.text(13.8, 9.25, '← 用户可见', fontsize=9, color=C_ACCENT, ha='right')
    ax.text(13.8, 5.75, '← 界面不可见\n  Hermes底层自对话', fontsize=9, color=C_ACCENT2, ha='right')
    ax.text(13.8, 1.4, '← 用户可见', fontsize=9, color=C_ACCENT3, ha='right')

    plt.tight_layout()
    path = os.path.join(OUT_DIR, 'drama_hermes_flow.png')
    plt.savefig(path, dpi=150, bbox_inches='tight', facecolor=C_BG)
    plt.close()
    print(f'已生成: {path}')

# ============================================================
# 图3：短剧编剧篇 - 端到端业务流程泳道图
# ============================================================
def chart_drama_swimlane():
    fig, ax = plt.subplots(1, 1, figsize=(16, 10))
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 10)
    ax.axis('off')
    ax.set_facecolor(C_BG)
    fig.patch.set_facecolor(C_BG)

    ax.text(8, 9.5, '短剧编剧 Prompt 增强 — 端到端业务流程泳道图', ha='center',
            fontsize=15, fontweight='bold', color=C_BORDER)

    # 泳道
    lanes = [
        ('用户', 0, '#e3f2fd', C_ACCENT),
        ('前端系统', 2, '#f3e5f5', '#7b1fa2'),
        ('Hermes Agent', 4, '#fff3e0', C_ACCENT2),
        ('Skills知识库', 6, '#e0f7fa', '#00838f'),
        ('大模型服务', 8, '#e8f5e9', C_ACCENT3),
    ]
    for name, y, color, border in lanes:
        ax.add_patch(plt.Rectangle((0, y), 16, 2, facecolor=color, alpha=0.3, edgecolor=border, linewidth=1))
        ax.text(0.3, y+1, name, fontsize=11, fontweight='bold', color=border, va='center')

    # 流程节点
    nodes = [
        (1.5, 1.0, '输入创意需求\n选择编剧场景', '#e3f2fd', C_ACCENT),
        (3.5, 1.0, '接收请求\n透传原始Prompt', '#f3e5f5', '#7b1fa2'),
        (5.5, 5.0, '启动多轮对话\n需求解析+上下文加载', '#fff3e0', C_ACCENT2),
        (7.5, 7.0, '查询编剧模板\n获取创作规则', '#e0f7fa', '#00838f'),
        (9.5, 9.0, '执行对话推理\n生成优化Prompt', '#e8f5e9', C_ACCENT3),
        (11.5, 5.0, '自检修正\n质量校验', '#fff3e0', C_ACCENT2),
        (13.5, 1.0, '展示优化结果\n提供编辑/导出', '#f3e5f5', '#7b1fa2'),
        (15.0, 1.0, '确认使用\n或反馈调整', '#e3f2fd', C_ACCENT),
    ]

    for x, y, text, color, border in nodes:
        draw_box(ax, x-0.8, y-0.4, 1.6, 0.8, text, color=color, border=border, fontsize=8)

    # 箭头连接
    arrows = [
        (2.3, 1.0, 2.7, 1.0),
        (4.3, 1.0, 4.7, 3.0),  # 前端到Hermes
        (6.3, 5.0, 6.7, 6.6),  # Hermes到Skills
        (8.3, 7.0, 8.7, 8.6),  # Skills到大模型
        (10.3, 9.0, 10.7, 5.4),  # 大模型到Hermes自检
        (12.3, 5.0, 12.7, 1.4),  # Hermes到前端
        (14.3, 1.0, 14.2, 1.0),
    ]
    for x1, y1, x2, y2 in arrows:
        draw_arrow(ax, x1, y1, x2, y2, color=C_ARROW, lw=1.5)

    # 反馈循环箭头
    ax.annotate('', xy=(5.9, 4.6), xytext=(14.8, 0.6),
                arrowprops=dict(arrowstyle='->', color='#c62828', lw=1.5, linestyle='dashed',
                                connectionstyle='arc3,rad=-0.3'))
    ax.text(10.5, 0.3, '用户反馈 → 触发新一轮Hermes优化', fontsize=9, color='#c62828', ha='center')

    plt.tight_layout()
    path = os.path.join(OUT_DIR, 'drama_swimlane.png')
    plt.savefig(path, dpi=150, bbox_inches='tight', facecolor=C_BG)
    plt.close()
    print(f'已生成: {path}')

# ============================================================
# 图4：短剧编剧篇 - 上下文注入机制图
# ============================================================
def chart_drama_context():
    fig, ax = plt.subplots(1, 1, figsize=(14, 9))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 9)
    ax.axis('off')
    ax.set_facecolor(C_BG)
    fig.patch.set_facecolor(C_BG)

    ax.text(7, 8.5, '多轮对话上下文注入机制 — 剧本/大纲/分镜信息传递', ha='center',
            fontsize=15, fontweight='bold', color=C_BORDER)

    # 左侧：上下文来源
    ax.text(2.5, 7.8, '上下文数据源', fontsize=12, fontweight='bold', color=C_ACCENT, ha='center')
    sources = [
        (0.5, 6.0, '剧本大纲\n（人物设定/分幕结构/情绪曲线）'),
        (0.5, 4.5, '逐集大纲\n（每集核心事件/结尾钩子/反转点）'),
        (0.5, 3.0, '分集剧本\n（已生成集数的台词/场景/金句）'),
        (0.5, 1.5, '分镜脚本\n（场景/角色/动作/镜头信息）'),
    ]
    for x, y, text in sources:
        draw_box(ax, x, y, 4.0, 1.0, text, color='#e3f2fd', border=C_ACCENT, fontsize=9)

    # 中间：上下文管理器
    draw_box(ax, 5.5, 3.5, 3.0, 2.0, '上下文管理器\n（Context Manager）\n\n• 自动检索相关内容\n• 按轮次选择性注入\n• 控制Token预算\n• 维护对话历史',
             color='#fff3e0', border=C_ACCENT2, fontsize=9, bold=True)

    # 右侧：Hermes多轮对话
    ax.text(11.5, 7.8, 'Hermes 多轮对话', fontsize=12, fontweight='bold', color=C_ACCENT2, ha='center')
    rounds = [
        (10.0, 6.2, '第1轮：需求理解\n+ 加载全量上下文'),
        (10.0, 4.8, '第2轮：结合剧本内容\n分析优化方向'),
        (10.0, 3.4, '第3轮：生成初稿\n（引用具体集数/角色）'),
        (10.0, 2.0, '第4轮：对照上下文自检\n确保一致性'),
    ]
    for x, y, text in rounds:
        draw_box(ax, x, y, 3.5, 1.0, text, color='#fff3e0', border=C_ACCENT2, fontsize=8.5)

    # 箭头
    for y in [6.5, 5.0, 3.5, 2.0]:
        draw_arrow(ax, 4.5, y, 5.5, 4.5, color=C_ACCENT, lw=1)
    draw_arrow(ax, 8.5, 4.5, 10.0, 6.7, color=C_ACCENT2, lw=1.5)
    for i in range(3):
        y1 = 6.2 - i*1.4
        draw_arrow(ax, 11.75, y1, 11.75, y1-0.4, color=C_ACCENT2, lw=1.2)

    # 底部说明
    ax.text(7, 0.5, '核心价值：每一轮对话都携带具体的剧本/大纲/分镜信息，确保优化方向精准、角色一致、剧情连贯',
            ha='center', fontsize=10, fontweight='bold', color=C_BORDER,
            bbox=dict(boxstyle='round', facecolor='#fff9c4', alpha=0.8))

    plt.tight_layout()
    path = os.path.join(OUT_DIR, 'drama_context.png')
    plt.savefig(path, dpi=150, bbox_inches='tight', facecolor=C_BG)
    plt.close()
    print(f'已生成: {path}')

# ============================================================
# 图5：短剧编剧篇 - Skills模板库结构图
# ============================================================
def chart_drama_skills():
    fig, ax = plt.subplots(1, 1, figsize=(14, 9))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 9)
    ax.axis('off')
    ax.set_facecolor(C_BG)
    fig.patch.set_facecolor(C_BG)

    ax.text(7, 8.5, '短剧编剧 Skills 模板库结构图', ha='center',
            fontsize=15, fontweight='bold', color=C_BORDER)

    # 顶层
    draw_box(ax, 4.5, 7.2, 5.0, 0.8, '短剧编剧 Skills 知识库\n（Hermes Agent 可调用的专业规则包）',
             color='#fff3e0', border=C_ACCENT2, fontsize=11, bold=True)

    # 四大类
    categories = [
        (0.3, 4.5, '创意生成类 Skills', '#e3f2fd', C_ACCENT,
         ['骨架生成器（3套方案）', '大纲填充器（逐集展开）', '主模板（分集剧本生成）', '剧本审核师（质量诊断）']),
        (3.8, 4.5, '创作规则类 Skills', '#e8f5e9', C_ACCENT3,
         ['快爽炸钩核心原则', '台词风格公式（短句/金句）', '情绪节奏公式（压抑→爆发）', '反转设计原则（身份/立场/情节）']),
        (7.3, 4.5, '角色场景类 Skills', '#f3e5f5', '#7b1fa2',
         ['人物档案模板（主角/反派/配角）', '场景复杂度控制（竖屏适配）', '名场面设计规范', '钩子类型速查（5种结尾钩子）']),
        (10.8, 4.5, '质量保障类 Skills', '#ffebee', '#c62828',
         ['防重复检测（剧情/台词/场景）', '风格一致性校验', '剧情连续性检查', 'AI制作可行性评估']),
    ]

    for x, y, title, color, border, items in categories:
        draw_box(ax, x, y+1.2, 2.9, 0.7, title, color=color, border=border, fontsize=9.5, bold=True)
        for i, item in enumerate(items):
            draw_box(ax, x, y-i*0.75, 2.9, 0.65, item, color='white', border=border, fontsize=8)

    # 连接线
    for x in [1.75, 5.25, 8.75, 12.25]:
        draw_arrow(ax, 7.0, 7.2, x, 6.4, color=C_BORDER, lw=1)

    # 底部说明
    ax.text(7, 0.5, '说明：Skills不是硬编码的关键词匹配模板，而是Hermes可理解、可调用、可组合的专业知识包\nHermes在多轮对话中根据需求自动选择并组合相关Skills，无需人工配置触发规则',
            ha='center', fontsize=9.5, color=C_BORDER,
            bbox=dict(boxstyle='round', facecolor='#fff9c4', alpha=0.8))

    plt.tight_layout()
    path = os.path.join(OUT_DIR, 'drama_skills.png')
    plt.savefig(path, dpi=150, bbox_inches='tight', facecolor=C_BG)
    plt.close()
    print(f'已生成: {path}')

# ============================================================
# 图6：视频生成篇 - 产品整体架构图
# ============================================================
def chart_video_architecture():
    fig, ax = plt.subplots(1, 1, figsize=(14, 10))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 10)
    ax.axis('off')
    ax.set_facecolor(C_BG)
    fig.patch.set_facecolor(C_BG)

    ax.text(7, 9.5, '视频生成 Prompt 智能增强系统 — 整体架构图', ha='center',
            fontsize=16, fontweight='bold', color=C_BORDER)

    # 第一层
    ax.add_patch(FancyBboxPatch((0.3, 7.2), 13.4, 1.8, boxstyle="round,pad=0.05",
                 facecolor=C_LAYER1, edgecolor=C_ACCENT, linewidth=1.5, alpha=0.6))
    ax.text(0.6, 8.7, '第一层：用户接入层', fontsize=11, fontweight='bold', color=C_ACCENT)
    draw_box(ax, 0.8, 7.5, 2.8, 1.0, '分镜拆解入口\n（上传剧本/选择集数）', fontsize=8.5)
    draw_box(ax, 4.0, 7.5, 2.8, 1.0, '镜头拆解入口\n（上传分镜/选择集数）', fontsize=8.5)
    draw_box(ax, 7.2, 7.5, 2.8, 1.0, '提示词优化入口\n（单条/批量优化）', fontsize=8.5)
    draw_box(ax, 10.4, 7.5, 3.0, 1.0, '结果面板\n（分镜级AI视频提示词输出）', fontsize=8.5)

    for x in [2.2, 5.4, 8.6, 11.9]:
        draw_arrow(ax, x, 7.2, x, 6.9)

    # 第二层
    ax.add_patch(FancyBboxPatch((0.3, 2.8), 13.4, 4.0, boxstyle="round,pad=0.05",
                 facecolor=C_LAYER2, edgecolor=C_ACCENT2, linewidth=2, alpha=0.5))
    ax.text(0.6, 6.5, '第二层：Hermes Agent 多轮对话增强层（系统核心）', fontsize=11,
            fontweight='bold', color=C_ACCENT2)

    draw_box(ax, 0.5, 5.2, 2.3, 0.9, '分镜/镜头解析器\n识别场景类型/动作', color='#fff8e1', border=C_ACCENT2, fontsize=8)
    draw_box(ax, 3.1, 5.2, 2.3, 0.9, '上下文管理器\n注入剧本/分镜/人物设定', color='#fff8e1', border=C_ACCENT2, fontsize=8)
    draw_box(ax, 5.7, 5.2, 2.6, 0.9, '多轮对话引擎\n（底层自对话优化提示词）', color='#ffe0b2', border=C_ACCENT2, fontsize=8, bold=True)
    draw_box(ax, 8.6, 5.2, 2.3, 0.9, 'Skills知识库\n分镜/镜头专业规则', color='#fff8e1', border=C_ACCENT2, fontsize=8)
    draw_box(ax, 11.2, 5.2, 2.4, 0.9, '提示词自检器\n帧对齐/时间轴/参考图校验', color='#fff8e1', border=C_ACCENT2, fontsize=8)

    ax.text(7.0, 4.6, '▼ Hermes 底层多轮自对话流程（界面不显示）▼', ha='center',
            fontsize=9, fontweight='bold', color=C_ACCENT2)
    rounds = ['第1轮\n解析分镜内容\n识别镜头类型', '第2轮\n加载人物/场景\n设定+参考图', '第3轮\n生成分镜级\nAI视频提示词', '第4轮\n帧对齐/时间轴\n参考图配置校验', '第5轮\n修正优化\n输出最终提示词']
    for i, r in enumerate(rounds):
        x = 0.6 + i * 2.65
        draw_box(ax, x, 3.2, 2.3, 1.0, r, color='#fff3e0', border=C_ACCENT2, fontsize=7.5)
        if i < 4:
            draw_arrow(ax, x+2.3, 3.7, x+2.65, 3.7, color=C_ACCENT2, lw=1.2)

    draw_arrow(ax, 7.0, 2.8, 7.0, 2.5)

    # 第三层
    ax.add_patch(FancyBboxPatch((0.3, 0.3), 13.4, 2.1, boxstyle="round,pad=0.05",
                 facecolor=C_LAYER3, edgecolor=C_ACCENT3, linewidth=1.5, alpha=0.6))
    ax.text(0.6, 2.1, '第三层：模型服务层', fontsize=11, fontweight='bold', color=C_ACCENT3)
    draw_box(ax, 0.8, 0.6, 3.8, 1.1, '通用大语言模型\n（Hermes对话推理）', fontsize=9)
    draw_box(ax, 5.1, 0.6, 3.8, 1.1, 'Seedance 2.0\n（视频生成最终执行）', fontsize=9)
    draw_box(ax, 9.4, 0.6, 3.8, 1.1, '向量知识库\n（分镜规则/镜头模板/历史案例）', fontsize=9)

    plt.tight_layout()
    path = os.path.join(OUT_DIR, 'video_architecture.png')
    plt.savefig(path, dpi=150, bbox_inches='tight', facecolor=C_BG)
    plt.close()
    print(f'已生成: {path}')

# ============================================================
# 图7：视频生成篇 - 分镜级提示词生成流程图
# ============================================================
def chart_video_prompt_flow():
    fig, ax = plt.subplots(1, 1, figsize=(14, 11))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 11)
    ax.axis('off')
    ax.set_facecolor(C_BG)
    fig.patch.set_facecolor(C_BG)

    ax.text(7, 10.5, '分镜级 AI 视频提示词生成 — Hermes 多轮对话详细流程', ha='center',
            fontsize=15, fontweight='bold', color=C_BORDER)

    steps = [
        (0.5, 9.2, '【输入】第3集分镜1：古风庭院，仙侠女子与黑袍妖物对峙\n剧本上下文：第2集结尾女子已觉醒灵力，本集为首次战斗', '#e3f2fd', C_ACCENT),
        (0.5, 7.9, '第1轮：分镜解析\nHermes内部对话——识别为"动作+情绪"混合分镜，需拆3个镜头\n确定分镜总时长6秒（4-15秒范围内）', '#fff3e0', C_ACCENT2),
        (0.5, 6.6, '第2轮：上下文加载\n加载人物设定（仙侠女子_战斗变体）、场景设定（古风庭院_夜景）\n加载固定风格前缀（3D漫剧渲染）、匹配参考图（脸部/服装/场景）', '#fff3e0', C_ACCENT2),
        (0.5, 5.3, '第3轮：提示词初稿生成\n生成时间轴分段：0-2秒远景静立→2-4秒中景冲锋→4-6秒近景击退\n配置参考图：图片1脸部+图片2服装+图片3场景', '#fff3e0', C_ACCENT2),
        (0.5, 4.0, '第4轮：质量自检\n校验：时间轴首尾衔接✓ 总时长6秒✓ 景别变化（远→中→近）✓\n帧对齐：分镜1尾帧=分镜2首帧？需标注桢连续✓ 负面提示词已包含✓', '#fff3e0', C_ACCENT2),
        (0.5, 2.7, '第5轮：修正输出\n补充走路动作专属负面提示词（如有行走）、完善台词情绪声学描述\n输出最终分镜级AI视频提示词+参考图上传顺序清单', '#fff3e0', C_ACCENT2),
        (0.5, 1.0, '【输出】分镜级统一AI视频提示词（一段完整提示词，含时间轴分段）\n+ 参考图上传顺序清单 + 转场与衔接说明', '#e8f5e9', C_ACCENT3),
    ]

    for x, y, text, color, border in steps:
        draw_box(ax, x, y, 13.0, 1.1, text, color=color, border=border, fontsize=9.5)

    for i in range(len(steps)-1):
        y1 = steps[i][1]
        y2 = steps[i+1][1] + 1.1
        draw_arrow(ax, 7.0, y1, 7.0, y2, color=C_ARROW, lw=2)

    plt.tight_layout()
    path = os.path.join(OUT_DIR, 'video_prompt_flow.png')
    plt.savefig(path, dpi=150, bbox_inches='tight', facecolor=C_BG)
    plt.close()
    print(f'已生成: {path}')

# ============================================================
# 图8：视频生成篇 - 端到端业务流程泳道图
# ============================================================
def chart_video_swimlane():
    fig, ax = plt.subplots(1, 1, figsize=(16, 10))
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 10)
    ax.axis('off')
    ax.set_facecolor(C_BG)
    fig.patch.set_facecolor(C_BG)

    ax.text(8, 9.5, '视频生成 Prompt 增强 — 端到端业务流程泳道图', ha='center',
            fontsize=15, fontweight='bold', color=C_BORDER)

    lanes = [
        ('用户', 0, '#e3f2fd', C_ACCENT),
        ('前端系统', 2, '#f3e5f5', '#7b1fa2'),
        ('Hermes Agent', 4, '#fff3e0', C_ACCENT2),
        ('Skills知识库', 6, '#e0f7fa', '#00838f'),
        ('Seedance 2.0', 8, '#e8f5e9', C_ACCENT3),
    ]
    for name, y, color, border in lanes:
        ax.add_patch(plt.Rectangle((0, y), 16, 2, facecolor=color, alpha=0.3, edgecolor=border, linewidth=1))
        ax.text(0.3, y+1, name, fontsize=11, fontweight='bold', color=border, va='center')

    nodes = [
        (1.5, 1.0, '上传剧本\n选择集数区间', '#e3f2fd', C_ACCENT),
        (3.5, 1.0, '接收请求\n定位剧本文件', '#f3e5f5', '#7b1fa2'),
        (5.5, 5.0, '启动多轮对话\n分镜拆解+镜头拆解', '#fff3e0', C_ACCENT2),
        (7.5, 7.0, '查询分镜规则\n镜头拆解规范', '#e0f7fa', '#00838f'),
        (9.5, 5.0, '生成提示词\n自检修正', '#fff3e0', C_ACCENT2),
        (11.5, 9.0, '图生视频执行\n生成视频片段', '#e8f5e9', C_ACCENT3),
        (13.5, 1.0, '展示提示词+视频\n提供编辑/导出', '#f3e5f5', '#7b1fa2'),
        (15.0, 1.0, '确认使用\n或反馈调整', '#e3f2fd', C_ACCENT),
    ]

    for x, y, text, color, border in nodes:
        draw_box(ax, x-0.8, y-0.4, 1.6, 0.8, text, color=color, border=border, fontsize=8)

    arrows = [
        (2.3, 1.0, 2.7, 1.0),
        (4.3, 1.0, 4.7, 3.0),
        (6.3, 5.0, 6.7, 6.6),
        (8.3, 7.0, 8.7, 5.4),
        (10.3, 5.0, 10.7, 8.6),
        (12.3, 9.0, 12.7, 1.4),
        (14.3, 1.0, 14.2, 1.0),
    ]
    for x1, y1, x2, y2 in arrows:
        draw_arrow(ax, x1, y1, x2, y2, color=C_ARROW, lw=1.5)

    ax.annotate('', xy=(5.9, 4.6), xytext=(14.8, 0.6),
                arrowprops=dict(arrowstyle='->', color='#c62828', lw=1.5, linestyle='dashed',
                                connectionstyle='arc3,rad=-0.3'))
    ax.text(10.5, 0.3, '用户反馈 → 触发新一轮Hermes优化', fontsize=9, color='#c62828', ha='center')

    plt.tight_layout()
    path = os.path.join(OUT_DIR, 'video_swimlane.png')
    plt.savefig(path, dpi=150, bbox_inches='tight', facecolor=C_BG)
    plt.close()
    print(f'已生成: {path}')

# ============================================================
# 图9：视频生成篇 - 上下文注入机制图
# ============================================================
def chart_video_context():
    fig, ax = plt.subplots(1, 1, figsize=(14, 9))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 9)
    ax.axis('off')
    ax.set_facecolor(C_BG)
    fig.patch.set_facecolor(C_BG)

    ax.text(7, 8.5, '视频生成上下文注入机制 — 剧本/分镜/人物场景设定传递', ha='center',
            fontsize=15, fontweight='bold', color=C_BORDER)

    ax.text(2.5, 7.8, '上下文数据源', fontsize=12, fontweight='bold', color=C_ACCENT, ha='center')
    sources = [
        (0.5, 6.0, '剧本解析文档\n（分镜公共属性/画面比例/时长限制）'),
        (0.5, 4.5, '分镜列表\n（每镜画面描述/原始剧本/时长建议）'),
        (0.5, 3.0, '人物设定文档\n（角色描述/变体/脸部特征/服装）'),
        (0.5, 1.5, '场景设定文档\n（场景描述/光影/时间变体/参考图）'),
    ]
    for x, y, text in sources:
        draw_box(ax, x, y, 4.0, 1.0, text, color='#e3f2fd', border=C_ACCENT, fontsize=9)

    draw_box(ax, 5.5, 3.5, 3.0, 2.0, '上下文管理器\n（Context Manager）\n\n• 自动匹配角色变体\n• 自动匹配场景时间变体\n• 帧连续链状态追踪\n• 参考图路径自动关联',
             color='#fff3e0', border=C_ACCENT2, fontsize=9, bold=True)

    ax.text(11.5, 7.8, 'Hermes 多轮对话', fontsize=12, fontweight='bold', color=C_ACCENT2, ha='center')
    rounds = [
        (10.0, 6.2, '第1轮：解析分镜\n+ 加载人物/场景设定'),
        (10.0, 4.8, '第2轮：匹配参考图\n确定帧连续关系'),
        (10.0, 3.4, '第3轮：生成时间轴\n分段提示词'),
        (10.0, 2.0, '第4轮：校验帧对齐\n+参考图配置'),
    ]
    for x, y, text in rounds:
        draw_box(ax, x, y, 3.5, 1.0, text, color='#fff3e0', border=C_ACCENT2, fontsize=8.5)

    for y in [6.5, 5.0, 3.5, 2.0]:
        draw_arrow(ax, 4.5, y, 5.5, 4.5, color=C_ACCENT, lw=1)
    draw_arrow(ax, 8.5, 4.5, 10.0, 6.7, color=C_ACCENT2, lw=1.5)
    for i in range(3):
        y1 = 6.2 - i*1.4
        draw_arrow(ax, 11.75, y1, 11.75, y1-0.4, color=C_ACCENT2, lw=1.2)

    ax.text(7, 0.5, '核心价值：提示词优化时自动关联具体角色的服装变体、场景的时间光影、上一分镜的尾帧状态\n确保人物一致性、场景连贯性、帧对齐无缝衔接',
            ha='center', fontsize=10, fontweight='bold', color=C_BORDER,
            bbox=dict(boxstyle='round', facecolor='#fff9c4', alpha=0.8))

    plt.tight_layout()
    path = os.path.join(OUT_DIR, 'video_context.png')
    plt.savefig(path, dpi=150, bbox_inches='tight', facecolor=C_BG)
    plt.close()
    print(f'已生成: {path}')

# ============================================================
# 图10：视频生成篇 - Skills模板库结构图
# ============================================================
def chart_video_skills():
    fig, ax = plt.subplots(1, 1, figsize=(14, 9))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 9)
    ax.axis('off')
    ax.set_facecolor(C_BG)
    fig.patch.set_facecolor(C_BG)

    ax.text(7, 8.5, '视频生成 Skills 模板库结构图', ha='center',
            fontsize=15, fontweight='bold', color=C_BORDER)

    draw_box(ax, 4.5, 7.2, 5.0, 0.8, '视频生成 Skills 知识库\n（Hermes Agent 可调用的专业规则包）',
             color='#fff3e0', border=C_ACCENT2, fontsize=11, bold=True)

    categories = [
        (0.3, 4.5, '分镜拆解类 Skills', '#e3f2fd', C_ACCENT,
         ['分镜拆解模板（剧本→分镜）', '剧本解析文档生成', '人物设定文档生成', '场景设定文档生成']),
        (3.8, 4.5, '镜头拆解类 Skills', '#e8f5e9', C_ACCENT3,
         ['镜头拆解模板（分镜→镜头）', '单一动作单元原则', '动态时长控制（4-15秒）', '分镜级统一提示词生成']),
        (7.3, 4.5, '视觉一致性类 Skills', '#f3e5f5', '#7b1fa2',
         ['帧对齐链原则（首帧=上一镜尾帧）', '景别变化原则（避免连续相同景别）', '运镜设计原则（固定/推/拉为主）', '动作连贯性原则（位置/姿态/情绪）']),
        (10.8, 4.5, '提示词工程类 Skills', '#ffebee', '#c62828',
         ['时间轴分段编写规范', '参考图配置规范（最多9张）', '负面提示词库（含走路专属14项）', '台词情绪声学描述规范']),
    ]

    for x, y, title, color, border, items in categories:
        draw_box(ax, x, y+1.2, 2.9, 0.7, title, color=color, border=border, fontsize=9.5, bold=True)
        for i, item in enumerate(items):
            draw_box(ax, x, y-i*0.75, 2.9, 0.65, item, color='white', border=border, fontsize=8)

    for x in [1.75, 5.25, 8.75, 12.25]:
        draw_arrow(ax, 7.0, 7.2, x, 6.4, color=C_BORDER, lw=1)

    ax.text(7, 0.5, '说明：Skills为Hermes提供专业领域知识底座，替代原方案的硬编码关键词匹配\nHermes在多轮对话中自动理解分镜内容，组合调用相关Skills生成高质量提示词',
            ha='center', fontsize=9.5, color=C_BORDER,
            bbox=dict(boxstyle='round', facecolor='#fff9c4', alpha=0.8))

    plt.tight_layout()
    path = os.path.join(OUT_DIR, 'video_skills.png')
    plt.savefig(path, dpi=150, bbox_inches='tight', facecolor=C_BG)
    plt.close()
    print(f'已生成: {path}')

# 执行所有图表生成
if __name__ == '__main__':
    chart_drama_architecture()
    chart_drama_hermes_flow()
    chart_drama_swimlane()
    chart_drama_context()
    chart_drama_skills()
    chart_video_architecture()
    chart_video_prompt_flow()
    chart_video_swimlane()
    chart_video_context()
    chart_video_skills()
    print('\n全部图表生成完成！')
