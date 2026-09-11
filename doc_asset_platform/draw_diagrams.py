# -*- coding: utf-8 -*-
"""
绘制AI内容生成平台的流程图与泳道图
"""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import os

# 设置中文字体为微软雅黑
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei', 'Arial Unicode MS']
plt.rcParams['axes.unicode_minus'] = False

OUTPUT_DIR = r'D:\phpstudy_pro\WWW\ai-novel-workstation1.2.0\doc_asset_platform'

# 颜色方案
COLORS = {
    'frontend': '#E3F2FD',
    'backend': '#E8F5E9',
    'platform': '#FFF3E0',
    'vendor': '#FCE4EC',
    'asset': '#F3E5F5',
    'decision': '#FFF9C4',
    'arrow': '#424242',
    'border': '#37474F',
}

def draw_rounded_box(ax, x, y, w, h, text, color='#E3F2FD', fontsize=9, bold=False):
    """绘制圆角矩形"""
    box = FancyBboxPatch((x, y), w, h,
                          boxstyle="round,pad=0.02,rounding_size=0.08",
                          facecolor=color, edgecolor=COLORS['border'], linewidth=1.2)
    ax.add_patch(box)
    weight = 'bold' if bold else 'normal'
    ax.text(x + w/2, y + h/2, text, ha='center', va='center',
            fontsize=fontsize, fontweight=weight, wrap=True)

def draw_arrow(ax, x1, y1, x2, y2, text='', color=COLORS['arrow']):
    """绘制箭头"""
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle='->', color=color, lw=1.5))
    if text:
        mx, my = (x1+x2)/2, (y1+y2)/2
        ax.text(mx, my+0.05, text, ha='center', va='bottom', fontsize=7.5,
                color=COLORS['border'], style='italic')

def draw_diamond(ax, x, y, w, h, text, color=COLORS['decision'], fontsize=8):
    """绘制菱形（判断节点）"""
    diamond = mpatches.Polygon([
        (x + w/2, y + h),
        (x + w, y + h/2),
        (x + w/2, y),
        (x, y + h/2)
    ], facecolor=color, edgecolor=COLORS['border'], linewidth=1.2)
    ax.add_patch(diamond)
    ax.text(x + w/2, y + h/2, text, ha='center', va='center', fontsize=fontsize, wrap=True)


# ============================================================
# 图1：整体架构泳道图
# ============================================================
def draw_architecture_swimlane():
    fig, ax = plt.subplots(1, 1, figsize=(14, 9))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 10)
    ax.axis('off')

    # 泳道标题
    lanes = [
        ('前端层', 0, 2.8, COLORS['frontend']),
        ('后端服务层', 2.8, 2.8, COLORS['backend']),
        ('模型平台层', 5.6, 2.8, COLORS['platform']),
        ('第三方厂商层', 8.4, 5.6, COLORS['vendor']),
    ]
    for name, x, w, color in lanes:
        # 泳道背景
        rect = plt.Rectangle((x, 0.5), w, 9, facecolor=color, alpha=0.3,
                             edgecolor=COLORS['border'], linewidth=1)
        ax.add_patch(rect)
        # 泳道标题
        ax.text(x + w/2, 9.3, name, ha='center', va='center',
                fontsize=12, fontweight='bold',
                bbox=dict(boxstyle='round,pad=0.3', facecolor=color, edgecolor=COLORS['border']))

    # 前端层节点
    draw_rounded_box(ax, 0.4, 7.5, 2.0, 0.8, '用户操作界面\n(生文/生图/生视频)', COLORS['frontend'], 9, True)
    draw_rounded_box(ax, 0.4, 6.0, 2.0, 0.8, '真人素材上传\n组件', COLORS['frontend'], 9)
    draw_rounded_box(ax, 0.4, 4.5, 2.0, 0.8, '任务进度\n与结果展示', COLORS['frontend'], 9)

    # 后端服务层节点
    draw_rounded_box(ax, 3.2, 7.5, 2.0, 0.8, 'API网关\n(统一入口)', COLORS['backend'], 9, True)
    draw_rounded_box(ax, 3.2, 6.0, 2.0, 0.8, '真人资产管理\n服务', COLORS['asset'], 9)
    draw_rounded_box(ax, 3.2, 4.5, 2.0, 0.8, '内容生成调度\n服务', COLORS['backend'], 9)
    draw_rounded_box(ax, 3.2, 3.0, 2.0, 0.8, '任务状态\n管理服务', COLORS['backend'], 9)

    # 模型平台层节点
    draw_rounded_box(ax, 6.0, 7.5, 2.0, 0.8, '模型路由\n与适配层', COLORS['platform'], 9, True)
    draw_rounded_box(ax, 6.0, 6.0, 2.0, 0.8, '厂商适配器\n(统一接口)', COLORS['platform'], 9)
    draw_rounded_box(ax, 6.0, 4.5, 2.0, 0.8, '资产库同步\n管理器', COLORS['asset'], 9)
    draw_rounded_box(ax, 6.0, 3.0, 2.0, 0.8, '回调与结果\n处理', COLORS['platform'], 9)

    # 第三方厂商层 - 分两列
    draw_rounded_box(ax, 8.8, 8.0, 2.2, 0.7, 'WeToken\n(聚合平台)', COLORS['vendor'], 9, True)
    draw_rounded_box(ax, 8.8, 6.8, 2.2, 0.7, 'WeToken资产库', COLORS['asset'], 8.5)
    draw_rounded_box(ax, 8.8, 5.6, 2.2, 0.7, '生文/生图/生视频\n模型接口', COLORS['vendor'], 8.5)

    draw_rounded_box(ax, 11.3, 8.0, 2.2, 0.7, '火山引擎\n(直连)', COLORS['vendor'], 9, True)
    draw_rounded_box(ax, 11.3, 6.8, 2.2, 0.7, '火山引擎资产库', COLORS['asset'], 8.5)
    draw_rounded_box(ax, 11.3, 5.6, 2.2, 0.7, 'Doubao Seedance\n2.0/2.5 接口', COLORS['vendor'], 8.5)

    draw_rounded_box(ax, 10.0, 4.0, 2.5, 0.7, '其他厂商\n(可扩展)', COLORS['vendor'], 9)
    draw_rounded_box(ax, 10.0, 2.8, 2.5, 0.7, '对应资产库\n(可扩展)', COLORS['asset'], 8.5)

    # 箭头连接 - 前端到后端
    draw_arrow(ax, 2.4, 7.9, 3.2, 7.9, '请求')
    draw_arrow(ax, 2.4, 6.4, 3.2, 6.4, '上传')
    draw_arrow(ax, 3.2, 4.9, 2.4, 4.9, '结果')

    # 后端内部
    draw_arrow(ax, 4.2, 7.5, 4.2, 6.8)
    draw_arrow(ax, 4.2, 6.0, 4.2, 5.3)
    draw_arrow(ax, 4.2, 4.5, 4.2, 3.8)

    # 后端到模型平台
    draw_arrow(ax, 5.2, 7.9, 6.0, 7.9, '转发')
    draw_arrow(ax, 5.2, 6.4, 6.0, 4.9, '资产同步')
    draw_arrow(ax, 5.2, 4.9, 6.0, 6.4, '生成请求')
    draw_arrow(ax, 6.0, 3.4, 5.2, 3.4, '回调')

    # 模型平台到厂商
    draw_arrow(ax, 8.0, 7.9, 8.8, 8.35, '路由')
    draw_arrow(ax, 8.0, 7.9, 11.3, 8.35, '路由')
    draw_arrow(ax, 7.0, 4.9, 8.8, 6.8, '上传资产')
    draw_arrow(ax, 7.0, 4.9, 11.3, 6.8, '上传资产')
    draw_arrow(ax, 8.0, 6.4, 8.8, 5.95, '调用')
    draw_arrow(ax, 8.0, 6.4, 11.3, 5.95, '调用')

    # 标题
    ax.text(7, 9.85, '图1  AI内容生成平台整体架构泳道图', ha='center', va='center',
            fontsize=14, fontweight='bold')

    plt.tight_layout()
    path = os.path.join(OUTPUT_DIR, 'fig1_architecture_swimlane.png')
    plt.savefig(path, dpi=200, bbox_inches='tight', facecolor='white')
    plt.close()
    print(f'Saved: {path}')


# ============================================================
# 图2：真人资产上传与分发流程图
# ============================================================
def draw_asset_upload_flow():
    fig, ax = plt.subplots(1, 1, figsize=(12, 10))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 11)
    ax.axis('off')

    # 开始
    draw_rounded_box(ax, 4.5, 10.0, 3.0, 0.6, '开始：用户上传真人素材', '#C8E6C9', 10, True)

    # 步骤1：前端上传
    draw_rounded_box(ax, 4.5, 9.0, 3.0, 0.7, '① 前端上传真人图片/视频\n至后端存储服务', COLORS['frontend'], 9)

    # 步骤2：后端存储
    draw_rounded_box(ax, 4.5, 7.9, 3.0, 0.7, '② 后端保存原始文件\n生成资产ID与元数据', COLORS['backend'], 9)

    # 步骤3：判断需要同步的厂商
    draw_diamond(ax, 4.5, 6.5, 3.0, 1.0, '③ 根据已配置厂商\n确定需同步的资产库', COLORS['decision'], 8.5)

    # 分支：WeToken
    draw_rounded_box(ax, 0.5, 4.8, 3.2, 0.8, '④a 调用WeToken资产上传接口\n上传至WeToken资产库', COLORS['vendor'], 8.5)
    draw_rounded_box(ax, 0.5, 3.6, 3.2, 0.7, '⑤a 获取WeToken侧\n资产ID与审核状态', COLORS['vendor'], 8.5)

    # 分支：火山引擎
    draw_rounded_box(ax, 4.4, 4.8, 3.2, 0.8, '④b 调用火山引擎资产上传接口\n上传至火山引擎资产库', COLORS['vendor'], 8.5)
    draw_rounded_box(ax, 4.4, 3.6, 3.2, 0.7, '⑤b 获取火山引擎侧\n资产ID与审核状态', COLORS['vendor'], 8.5)

    # 分支：其他厂商
    draw_rounded_box(ax, 8.3, 4.8, 3.2, 0.8, '④c 调用其他厂商资产上传接口\n上传至对应资产库', COLORS['vendor'], 8.5)
    draw_rounded_box(ax, 8.3, 3.6, 3.2, 0.7, '⑤c 获取其他厂商侧\n资产ID与审核状态', COLORS['vendor'], 8.5)

    # 步骤6：汇总状态
    draw_rounded_box(ax, 3.5, 2.2, 5.0, 0.8, '⑥ 资产同步管理器汇总各厂商\n资产ID、审核状态、同步时间', COLORS['platform'], 9)

    # 步骤7：判断全部成功
    draw_diamond(ax, 4.0, 0.8, 4.0, 1.0, '⑦ 全部厂商同步成功？', COLORS['decision'], 9)

    # 失败处理
    draw_rounded_box(ax, 8.5, 0.8, 3.0, 0.7, '⑧ 标记失败项\n进入重试队列(最多3次)', '#FFCDD2', 8.5)

    # 结束
    draw_rounded_box(ax, 0.5, 0.8, 2.5, 0.7, '⑨ 资产就绪\n可用于生图/生视频', '#C8E6C9', 9, True)

    # 箭头
    draw_arrow(ax, 6.0, 10.0, 6.0, 9.7)
    draw_arrow(ax, 6.0, 9.0, 6.0, 8.6)
    draw_arrow(ax, 6.0, 7.9, 6.0, 7.5)
    draw_arrow(ax, 5.0, 6.5, 2.1, 5.6, 'WeToken')
    draw_arrow(ax, 6.0, 6.5, 6.0, 5.6, '火山引擎')
    draw_arrow(ax, 7.0, 6.5, 9.9, 5.6, '其他厂商')
    draw_arrow(ax, 2.1, 4.8, 2.1, 4.3)
    draw_arrow(ax, 6.0, 4.8, 6.0, 4.3)
    draw_arrow(ax, 9.9, 4.8, 9.9, 4.3)
    draw_arrow(ax, 2.1, 3.6, 4.5, 3.0)
    draw_arrow(ax, 6.0, 3.6, 6.0, 3.0)
    draw_arrow(ax, 9.9, 3.6, 7.5, 3.0)
    draw_arrow(ax, 6.0, 2.2, 6.0, 1.8)
    draw_arrow(ax, 8.0, 1.3, 8.5, 1.15, '否')
    draw_arrow(ax, 4.0, 1.3, 3.0, 1.15, '是')
    # 重试回到判断
    ax.annotate('', xy=(7.5, 2.6), xytext=(10.0, 1.5),
                arrowprops=dict(arrowstyle='->', color='#E53935', lw=1.2, linestyle='dashed'))
    ax.text(9.0, 2.2, '重试', fontsize=7.5, color='#E53935', style='italic')

    # 标题
    ax.text(6, 10.85, '图2  真人资产上传与多厂商分发流程图', ha='center', va='center',
            fontsize=14, fontweight='bold')

    plt.tight_layout()
    path = os.path.join(OUTPUT_DIR, 'fig2_asset_upload_flow.png')
    plt.savefig(path, dpi=200, bbox_inches='tight', facecolor='white')
    plt.close()
    print(f'Saved: {path}')


# ============================================================
# 图3：生图（含真人）业务流程图
# ============================================================
def draw_image_gen_flow():
    fig, ax = plt.subplots(1, 1, figsize=(11, 10))
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 11)
    ax.axis('off')

    draw_rounded_box(ax, 3.5, 10.2, 4.0, 0.6, '开始：用户发起生图请求', '#C8E6C9', 10, True)

    draw_rounded_box(ax, 3.5, 9.2, 4.0, 0.7, '① 前端提交生图参数\n(提示词、尺寸、模型、真人素材)', COLORS['frontend'], 9)

    draw_rounded_box(ax, 3.5, 8.1, 4.0, 0.7, '② 后端校验参数\n解析真人素材引用', COLORS['backend'], 9)

    draw_diamond(ax, 3.5, 6.7, 4.0, 1.0, '③ 是否包含真人素材？', COLORS['decision'], 9.5)

    # 含真人分支
    draw_rounded_box(ax, 0.3, 5.0, 4.0, 0.8, '④a 查询资产同步状态\n确认厂商资产库ID有效', COLORS['asset'], 8.5)
    draw_diamond(ax, 0.3, 3.6, 4.0, 1.0, '⑤a 资产已同步\n至目标厂商？', COLORS['decision'], 8.5)
    draw_rounded_box(ax, 0.3, 2.2, 4.0, 0.8, '⑥a 触发资产同步\n等待同步完成(轮询/回调)', COLORS['platform'], 8.5)

    # 不含真人分支
    draw_rounded_box(ax, 6.7, 5.0, 4.0, 0.8, '④b 无需资产校验\n直接进入生成流程', COLORS['backend'], 9)

    # 汇合
    draw_rounded_box(ax, 3.0, 0.8, 5.0, 0.9, '⑦ 模型平台组装请求\n(含厂商资产ID) → 调用厂商生图接口\n→ 轮询/回调获取结果 → 返回前端', COLORS['platform'], 8.5)

    # 箭头
    draw_arrow(ax, 5.5, 10.2, 5.5, 9.9)
    draw_arrow(ax, 5.5, 9.2, 5.5, 8.8)
    draw_arrow(ax, 5.5, 8.1, 5.5, 7.7)
    draw_arrow(ax, 4.5, 6.7, 2.3, 5.8, '是')
    draw_arrow(ax, 6.5, 6.7, 8.7, 5.8, '否')
    draw_arrow(ax, 2.3, 5.0, 2.3, 4.6)
    draw_arrow(ax, 2.3, 3.6, 2.3, 3.0, '否')
    draw_arrow(ax, 4.3, 4.1, 5.5, 1.7, '是')
    draw_arrow(ax, 8.7, 5.0, 7.0, 1.7)
    draw_arrow(ax, 2.3, 2.2, 4.0, 1.7)

    ax.text(5.5, 11.0, '图3  生图（含真人）业务流程图', ha='center', va='center',
            fontsize=14, fontweight='bold')

    plt.tight_layout()
    path = os.path.join(OUTPUT_DIR, 'fig3_image_gen_flow.png')
    plt.savefig(path, dpi=200, bbox_inches='tight', facecolor='white')
    plt.close()
    print(f'Saved: {path}')


# ============================================================
# 图4：生视频（含真人）业务流程图
# ============================================================
def draw_video_gen_flow():
    fig, ax = plt.subplots(1, 1, figsize=(11, 11))
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 12)
    ax.axis('off')

    draw_rounded_box(ax, 3.5, 11.2, 4.0, 0.6, '开始：用户发起生视频请求', '#C8E6C9', 10, True)

    draw_rounded_box(ax, 3.5, 10.2, 4.0, 0.7, '① 前端提交视频参数\n(提示词、时长、模型、首帧图/真人素材)', COLORS['frontend'], 8.5)

    draw_rounded_box(ax, 3.5, 9.1, 4.0, 0.7, '② 后端校验参数\n识别模型类型(Seedance 2.0/2.5)', COLORS['backend'], 9)

    draw_diamond(ax, 3.5, 7.7, 4.0, 1.0, '③ 是否为真人视频\n或包含真人首帧？', COLORS['decision'], 9)

    # 含真人分支
    draw_rounded_box(ax, 0.2, 6.0, 4.2, 0.8, '④a 强制校验真人资产\n必须已上传至目标厂商资产库', '#FFCDD2', 8.5)
    draw_diamond(ax, 0.2, 4.6, 4.2, 1.0, '⑤a 资产已同步\n且审核通过？', COLORS['decision'], 8.5)
    draw_rounded_box(ax, 0.2, 3.2, 4.2, 0.8, '⑥a 阻断请求并提示\n"请先完成真人资产上传与审核"', '#FFCDD2', 8.5)

    # 不含真人分支
    draw_rounded_box(ax, 6.6, 6.0, 4.2, 0.8, '④b 普通视频生成\n无需真人资产校验', COLORS['backend'], 9)

    # 汇合 - 生成
    draw_rounded_box(ax, 2.5, 1.8, 6.0, 1.0, '⑦ 模型平台调用厂商生视频接口\n(Seedance 2.0/2.5，传入厂商资产ID)\n→ 异步任务提交 → 轮询/回调获取视频URL', COLORS['platform'], 8.5)

    draw_rounded_box(ax, 3.5, 0.5, 4.0, 0.7, '⑧ 后端保存结果\n返回视频URL给前端', COLORS['backend'], 9)

    # 箭头
    draw_arrow(ax, 5.5, 11.2, 5.5, 10.9)
    draw_arrow(ax, 5.5, 10.2, 5.5, 9.8)
    draw_arrow(ax, 5.5, 9.1, 5.5, 8.7)
    draw_arrow(ax, 4.5, 7.7, 2.3, 6.8, '是')
    draw_arrow(ax, 6.5, 7.7, 8.7, 6.8, '否')
    draw_arrow(ax, 2.3, 6.0, 2.3, 5.6)
    draw_arrow(ax, 2.3, 4.6, 2.3, 4.0, '否')
    draw_arrow(ax, 4.4, 5.1, 5.5, 2.8, '是')
    draw_arrow(ax, 8.7, 6.0, 7.0, 2.8)
    draw_arrow(ax, 5.5, 1.8, 5.5, 1.2)

    ax.text(5.5, 11.9, '图4  生视频（含真人/Seedance系列）业务流程图', ha='center', va='center',
            fontsize=14, fontweight='bold')

    plt.tight_layout()
    path = os.path.join(OUTPUT_DIR, 'fig4_video_gen_flow.png')
    plt.savefig(path, dpi=200, bbox_inches='tight', facecolor='white')
    plt.close()
    print(f'Saved: {path}')


if __name__ == '__main__':
    draw_architecture_swimlane()
    draw_asset_upload_flow()
    draw_image_gen_flow()
    draw_video_gen_flow()
    print('All diagrams generated.')
