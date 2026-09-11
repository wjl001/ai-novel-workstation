# -*- coding: utf-8 -*-
"""生成Word文档所需的所有图表"""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import os

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei', 'Arial Unicode MS']
plt.rcParams['axes.unicode_minus'] = False

OUT_DIR = r'D:\phpstudy_pro\WWW\ai-novel-workstation1.2.0\doc_hermes\images'

# 配色
COLOR_DARK = '#0D1326'
COLOR_BLUE = '#2563EB'
COLOR_LIGHT = '#BFD7FF'
COLOR_BG = '#F2F4F8'
COLOR_WHITE = '#FFFFFF'
COLOR_GRAY = '#536174'

def draw_box(ax, x, y, w, h, text, fc=COLOR_WHITE, ec=COLOR_LIGHT, tc=COLOR_DARK, fs=10, bold=False):
    """绘制带文字的圆角矩形"""
    box = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.02", 
                          facecolor=fc, edgecolor=ec, linewidth=1.2)
    ax.add_patch(box)
    weight = 'bold' if bold else 'normal'
    ax.text(x + w/2, y + h/2, text, ha='center', va='center', 
            fontsize=fs, color=tc, fontweight=weight, wrap=True)

def draw_arrow(ax, x1, y1, x2, y2, color=COLOR_BLUE, style='->'):
    """绘制箭头"""
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle=style, color=color, lw=1.5))

# ========== 图1：产品整体架构图 ==========
def draw_architecture():
    fig, ax = plt.subplots(1, 1, figsize=(10, 6.5))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 7)
    ax.axis('off')
    fig.patch.set_facecolor(COLOR_WHITE)
    
    # 标题
    ax.text(5, 6.6, '产品整体架构图', ha='center', va='center', 
            fontsize=16, color=COLOR_DARK, fontweight='bold')
    
    # 第一层：用户接入层
    draw_box(ax, 0.5, 5.0, 9, 1.0, '', fc=COLOR_BG, ec=COLOR_LIGHT)
    ax.text(0.8, 5.7, '用户接入层', ha='left', va='center', 
            fontsize=11, color=COLOR_BLUE, fontweight='bold')
    modules1 = ['分镜拆解\n输入', '镜头拆解\n输入', '批量处理\n入口', '结果展示\n面板']
    for i, m in enumerate(modules1):
        draw_box(ax, 1.0 + i*2.2, 5.1, 1.9, 0.7, m, fc=COLOR_WHITE, ec=COLOR_LIGHT, fs=9)
    
    # 箭头
    draw_arrow(ax, 5, 5.0, 5, 4.6)
    
    # 第二层：Hermes增强层（核心）
    draw_box(ax, 0.5, 2.5, 9, 2.0, '', fc=COLOR_DARK, ec=COLOR_DARK)
    ax.text(0.8, 4.2, 'Hermes 增强层（核心）', ha='left', va='center', 
            fontsize=11, color=COLOR_LIGHT, fontweight='bold')
    modules2 = ['分镜/镜头\n解析模块', '上下文\n管理模块', '多轮对话\n引擎', 'Skills\n知识库调用', '提示词\n自检模块']
    for i, m in enumerate(modules2):
        draw_box(ax, 0.7 + i*1.75, 2.7, 1.55, 1.2, m, fc=COLOR_BLUE, ec=COLOR_LIGHT, tc=COLOR_WHITE, fs=9, bold=True)
    
    # 箭头
    draw_arrow(ax, 5, 2.5, 5, 2.1)
    
    # 第三层：模型服务层
    draw_box(ax, 0.5, 0.5, 9, 1.4, '', fc=COLOR_BG, ec=COLOR_LIGHT)
    ax.text(0.8, 1.6, '模型服务层', ha='left', va='center', 
            fontsize=11, color=COLOR_BLUE, fontweight='bold')
    modules3 = ['Hermes Agent\n（大语言模型）', 'Seedance 2.0\n（视频生成）', 'Seedream\n（参考图生成）']
    for i, m in enumerate(modules3):
        draw_box(ax, 1.2 + i*2.8, 0.6, 2.4, 0.8, m, fc=COLOR_WHITE, ec=COLOR_LIGHT, fs=9)
    
    plt.tight_layout()
    plt.savefig(os.path.join(OUT_DIR, 'fig1_architecture.png'), dpi=200, bbox_inches='tight', facecolor=COLOR_WHITE)
    plt.close()
    print('fig1_architecture.png done')

# ========== 图2：Hermes 5轮多轮对话流程图 ==========
def draw_hermes_flow():
    fig, ax = plt.subplots(1, 1, figsize=(11, 5))
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 5)
    ax.axis('off')
    fig.patch.set_facecolor(COLOR_WHITE)
    
    ax.text(5.5, 4.6, 'Hermes Agent 5 轮多轮对话机制', ha='center', va='center', 
            fontsize=15, color=COLOR_DARK, fontweight='bold')
    
    steps = [
        ('第1轮', '分镜解析\n与理解', '解析分镜内容\n识别镜头类型\n拆分单一动作'),
        ('第2轮', '上下文\n加载', '加载人物/场景设定\n匹配服装/时间变体\n关联参考图路径'),
        ('第3轮', '提示词\n初稿生成', '按v3.8六段式结构\n生成时间轴分段\n配置参考图与负面词'),
        ('第4轮', '10项\n专项自检', '帧对齐/时间轴/景别\n参考图/负面词/动作\n输出自检评分报告'),
        ('第5轮', '修正优化\n与输出', '针对自检问题修正\n优化提示词表述\n输出最终结果'),
    ]
    
    colors = [COLOR_WHITE, COLOR_WHITE, COLOR_BLUE, COLOR_DARK, COLOR_WHITE]
    text_colors = [COLOR_DARK, COLOR_DARK, COLOR_WHITE, COLOR_WHITE, COLOR_DARK]
    
    for i, (round_name, title, desc) in enumerate(steps):
        x = 0.3 + i * 2.15
        # 圆形编号
        circle = plt.Circle((x + 0.85, 3.8), 0.3, color=COLOR_BLUE, zorder=5)
        ax.add_patch(circle)
        ax.text(x + 0.85, 3.8, str(i+1), ha='center', va='center', 
                fontsize=12, color=COLOR_WHITE, fontweight='bold', zorder=6)
        ax.text(x + 0.85, 3.2, round_name, ha='center', va='center', 
                fontsize=9, color=COLOR_GRAY)
        
        # 主框
        draw_box(ax, x, 1.2, 1.9, 1.7, '', fc=colors[i], ec=COLOR_LIGHT, tc=text_colors[i])
        ax.text(x + 0.95, 2.5, title, ha='center', va='center', 
                fontsize=10, color=text_colors[i], fontweight='bold')
        ax.text(x + 0.95, 1.75, desc, ha='center', va='center', 
                fontsize=8, color=text_colors[i], linespacing=1.5)
        
        # 箭头
        if i < 4:
            draw_arrow(ax, x + 1.95, 2.05, x + 2.1, 2.05)
    
    # 底部说明
    ax.text(5.5, 0.5, '终止条件：自检全部通过 或 达到最大轮次（5轮），每轮对话维护完整上下文状态', 
            ha='center', va='center', fontsize=9, color=COLOR_GRAY, style='italic')
    
    plt.tight_layout()
    plt.savefig(os.path.join(OUT_DIR, 'fig2_hermes_flow.png'), dpi=200, bbox_inches='tight', facecolor=COLOR_WHITE)
    plt.close()
    print('fig2_hermes_flow.png done')

# ========== 图3：端到端业务流程泳道图 ==========
def draw_swimlane():
    fig, ax = plt.subplots(1, 1, figsize=(11, 6.5))
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 7)
    ax.axis('off')
    fig.patch.set_facecolor(COLOR_WHITE)
    
    ax.text(5.5, 6.6, '端到端业务流程泳道图', ha='center', va='center', 
            fontsize=15, color=COLOR_DARK, fontweight='bold')
    
    # 泳道
    lanes = [
        ('用户', 5.5, 1.0),
        ('前端', 4.2, 1.0),
        ('Hermes Agent', 2.6, 1.4),
        ('模型服务', 1.0, 1.4),
    ]
    
    for name, y, h in lanes:
        # 泳道背景
        ax.add_patch(plt.Rectangle((1.2, y), 9.5, h, facecolor=COLOR_BG, edgecolor=COLOR_LIGHT, linewidth=0.8))
        # 泳道标题
        ax.add_patch(plt.Rectangle((0.2, y), 1.0, h, facecolor=COLOR_DARK, edgecolor=COLOR_DARK))
        ax.text(0.7, y + h/2, name, ha='center', va='center', 
                fontsize=10, color=COLOR_WHITE, fontweight='bold', rotation=0)
    
    # 步骤
    steps = [
        # (x, lane_y, text)
        (1.5, 5.7, '输入分镜\n/剧本'),
        (3.2, 5.7, '提交任务\n显示进度'),
        (3.2, 4.4, '接收请求\n参数校验'),
        (4.9, 4.4, '调用Hermes\n多轮对话'),
        (4.9, 3.0, '执行5轮\n对话优化'),
        (6.6, 3.0, '调用Skills\n知识库'),
        (8.3, 3.0, '执行10项\n自检修正'),
        (6.6, 1.4, '调用Seedance\n生成视频'),
        (8.3, 4.4, '返回结果\n展示面板'),
        (10.0, 5.7, '查看/导出\n提示词'),
    ]
    
    for x, y, text in steps:
        draw_box(ax, x, y-0.35, 1.4, 0.7, text, fc=COLOR_WHITE, ec=COLOR_BLUE, fs=8, bold=True)
    
    # 箭头连接
    arrows = [
        (2.9, 5.7, 3.2, 5.7),   # 1->2
        (3.9, 5.35, 3.9, 4.75),  # 2->3
        (4.6, 4.4, 4.9, 4.4),    # 3->4
        (5.6, 4.05, 5.6, 3.35),  # 4->5
        (6.3, 3.0, 6.6, 3.0),    # 5->6
        (8.0, 3.0, 8.3, 3.0),    # 6->7
        (9.0, 2.65, 9.0, 1.75),  # 7->8 (down to model)
        (7.3, 1.4, 7.3, 1.4),    # 8 internal
        (8.3, 1.75, 8.3, 4.05),  # 8->9 (up)
        (9.0, 4.4, 9.7, 4.4),    # 9->?
        (9.7, 4.75, 9.7, 5.35),  # ->10
    ]
    
    for x1, y1, x2, y2 in arrows:
        if x1 == x2 and y1 == y2:
            continue
        draw_arrow(ax, x1, y1, x2, y2)
    
    plt.tight_layout()
    plt.savefig(os.path.join(OUT_DIR, 'fig3_swimlane.png'), dpi=200, bbox_inches='tight', facecolor=COLOR_WHITE)
    plt.close()
    print('fig3_swimlane.png done')

# ========== 图4：上下文注入机制图 ==========
def draw_context():
    fig, ax = plt.subplots(1, 1, figsize=(10, 5.5))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis('off')
    fig.patch.set_facecolor(COLOR_WHITE)
    
    ax.text(5, 5.5, '上下文注入机制：7 类数据源自动注入', ha='center', va='center', 
            fontsize=15, color=COLOR_DARK, fontweight='bold')
    
    # 左侧：7类数据源
    sources = [
        '人物设定（含服装变体）',
        '场景设定（含时间变体）',
        '全局属性（比例/时长/风格）',
        '帧连续状态（复用/独立首帧）',
        '参考图路径与配置',
        '历史对话与分镜上下文',
        'Skills 规范与校验规则',
    ]
    
    for i, s in enumerate(sources):
        y = 4.5 - i * 0.55
        draw_box(ax, 0.3, y-0.2, 3.2, 0.4, s, fc=COLOR_WHITE, ec=COLOR_LIGHT, fs=9)
    
    # 中间：上下文管理器
    draw_box(ax, 4.0, 1.8, 2.0, 2.5, '上下文\n管理器', fc=COLOR_DARK, ec=COLOR_DARK, tc=COLOR_WHITE, fs=12, bold=True)
    
    # 箭头：数据源 -> 管理器
    for i in range(7):
        y = 4.5 - i * 0.55
        draw_arrow(ax, 3.5, y, 4.0, 3.05)
    
    # 右侧：注入Hermes对话
    draw_box(ax, 6.8, 2.0, 2.8, 2.0, '', fc=COLOR_BG, ec=COLOR_LIGHT)
    ax.text(8.2, 3.6, '注入 Hermes 对话', ha='center', va='center', 
            fontsize=11, color=COLOR_BLUE, fontweight='bold')
    
    inject_items = [
        '第1轮：人物/场景/全局属性',
        '第2轮：帧连续/参考图配置',
        '第3轮：历史对话上下文',
        '第4轮：Skills自检规则',
    ]
    for i, item in enumerate(inject_items):
        ax.text(8.2, 3.1 - i*0.35, item, ha='center', va='center', 
                fontsize=8.5, color=COLOR_DARK)
    
    # 箭头：管理器 -> 对话
    draw_arrow(ax, 6.0, 3.05, 6.8, 3.05)
    
    # 底部说明
    ax.text(5, 0.8, '确保每个分镜的提示词都与全局设定一致，角色和场景跨分镜保持统一', 
            ha='center', va='center', fontsize=9.5, color=COLOR_GRAY, style='italic')
    
    plt.tight_layout()
    plt.savefig(os.path.join(OUT_DIR, 'fig4_context.png'), dpi=200, bbox_inches='tight', facecolor=COLOR_WHITE)
    plt.close()
    print('fig4_context.png done')

# ========== 图5：分镜级提示词架构图 ==========
def draw_prompt_arch():
    fig, ax = plt.subplots(1, 1, figsize=(10, 6))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6.5)
    ax.axis('off')
    fig.patch.set_facecolor(COLOR_WHITE)
    
    ax.text(5, 6.0, '分镜级统一提示词架构（v3.8）：六段式结构', ha='center', va='center', 
            fontsize=14, color=COLOR_DARK, fontweight='bold')
    
    segments = [
        ('① 固定风格前缀', '3D漫剧渲染风格，电影级画质', COLOR_LIGHT),
        ('② 场景整体描述', '古风仙侠庭院深夜，月色清冷，女子与妖物对峙', COLOR_LIGHT),
        ('③ 参考图配置', '图片1=脸部，图片2=服装，图片3=场景（最多9张）', COLOR_LIGHT),
        ('④ 时间轴分段描述（核心）', '0-2秒：远景，女子静立凝神，镜头缓推\n2-4秒：中景，女子睁眼冲锋，镜头跟拍\n4-6秒：近景，女子击退妖物，镜头拉远', COLOR_BLUE),
        ('⑤ 全分镜统一收尾要求', '运镜节奏协调，建模精细，特效克制', COLOR_LIGHT),
        ('⑥ 负面提示词', '畸形肢体、文字水印、穿模、比例失调、穿帮', '#C9302C'),
    ]
    
    for i, (title, desc, color) in enumerate(segments):
        y = 5.0 - i * 0.75
        tc = COLOR_WHITE if color == COLOR_BLUE else COLOR_DARK
        fc = color if color == COLOR_BLUE else COLOR_WHITE
        ec = COLOR_BLUE if color == COLOR_BLUE else COLOR_LIGHT
        
        # 编号框
        ax.add_patch(plt.Rectangle((0.3, y-0.28), 0.5, 0.56, facecolor=COLOR_DARK, edgecolor=COLOR_DARK))
        ax.text(0.55, y, str(i+1), ha='center', va='center', 
                fontsize=12, color=COLOR_WHITE, fontweight='bold')
        
        # 内容框
        draw_box(ax, 0.9, y-0.28, 8.8, 0.56, '', fc=fc, ec=ec)
        ax.text(1.1, y+0.1, title, ha='left', va='center', 
                fontsize=10, color=tc, fontweight='bold')
        ax.text(1.1, y-0.12, desc, ha='left', va='center', 
                fontsize=8.5, color=tc, linespacing=1.3)
    
    plt.tight_layout()
    plt.savefig(os.path.join(OUT_DIR, 'fig5_prompt_arch.png'), dpi=200, bbox_inches='tight', facecolor=COLOR_WHITE)
    plt.close()
    print('fig5_prompt_arch.png done')

if __name__ == '__main__':
    draw_architecture()
    draw_hermes_flow()
    draw_swimlane()
    draw_context()
    draw_prompt_arch()
    print('All figures generated!')
