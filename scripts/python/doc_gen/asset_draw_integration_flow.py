# -*- coding: utf-8 -*-
"""
绘制新增厂商接入与新增模型接入流程图
"""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch
import os

plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei', 'Arial Unicode MS']
plt.rcParams['axes.unicode_minus'] = False

OUTPUT_DIR = r'D:\phpstudy_pro\WWW\ai-novel-workstation1.2.0\doc_asset_platform'

COLORS = {
    'config': '#E8F5E9',
    'dev': '#FFF3E0',
    'test': '#E3F2FD',
    'decision': '#FFF9C4',
    'done': '#C8E6C9',
    'border': '#37474F',
    'arrow': '#424242',
}

def draw_box(ax, x, y, w, h, text, color='#E3F2FD', fontsize=9, bold=False):
    box = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.02,rounding_size=0.06",
                          facecolor=color, edgecolor=COLORS['border'], linewidth=1.2)
    ax.add_patch(box)
    weight = 'bold' if bold else 'normal'
    ax.text(x + w/2, y + h/2, text, ha='center', va='center', fontsize=fontsize,
            fontweight=weight, wrap=True)

def draw_diamond(ax, x, y, w, h, text, color=COLORS['decision'], fontsize=8.5):
    diamond = mpatches.Polygon([
        (x + w/2, y + h), (x + w, y + h/2), (x + w/2, y), (x, y + h/2)
    ], facecolor=color, edgecolor=COLORS['border'], linewidth=1.2)
    ax.add_patch(diamond)
    ax.text(x + w/2, y + h/2, text, ha='center', va='center', fontsize=fontsize, wrap=True)

def draw_arrow(ax, x1, y1, x2, y2, text='', color=COLORS['arrow']):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle='->', color=color, lw=1.5))
    if text:
        ax.text((x1+x2)/2, (y1+y2)/2 + 0.06, text, ha='center', va='bottom',
                fontsize=7.5, color=COLORS['border'], style='italic')


# ============================================================
# 图1：新增厂商接入流程图
# ============================================================
def draw_new_vendor_flow():
    fig, ax = plt.subplots(1, 1, figsize=(11, 12))
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 13)
    ax.axis('off')

    # 图例
    legend_y = 12.3
    draw_box(ax, 0.5, legend_y, 1.5, 0.4, '配置型工作', COLORS['config'], 8, True)
    draw_box(ax, 2.3, legend_y, 1.5, 0.4, '开发型工作', COLORS['dev'], 8, True)
    draw_box(ax, 4.1, legend_y, 1.5, 0.4, '测试验证', COLORS['test'], 8, True)
    draw_box(ax, 5.9, legend_y, 1.5, 0.4, '完成上线', COLORS['done'], 8, True)

    # 开始
    draw_box(ax, 3.5, 11.3, 4.0, 0.6, '开始：确定接入新厂商', '#C8E6C9', 10, True)

    # Step 1: 需求与评估
    draw_box(ax, 3.5, 10.2, 4.0, 0.7, '① 需求评估与厂商选型\n确认模型类型、接口规范、商务报价', COLORS['config'], 9)

    # Step 2: 账号与配置
    draw_box(ax, 3.5, 9.1, 4.0, 0.7, '② 开通厂商账号、获取API密钥\n配置厂商基础信息（名称、端点、鉴权方式）', COLORS['config'], 8.5)

    # Step 3: 适配器开发
    draw_box(ax, 3.5, 7.8, 4.0, 0.9, '③ 厂商适配器开发\n• 实现统一适配器接口（上传/查询/删除）\n• 封装厂商特有鉴权与参数格式\n• 真人资产库对接（如厂商要求）', COLORS['dev'], 8.5)

    # Step 4: 模型注册
    draw_box(ax, 3.5, 6.5, 4.0, 0.8, '④ 模型注册与路由配置\n在模型管理后台注册该厂商下的模型\n配置路由规则、默认参数、限流策略', COLORS['config'], 8.5)

    # Step 5: 前端适配
    draw_diamond(ax, 3.5, 5.2, 4.0, 0.9, '⑤ 前端是否需要\n新增模型选项？', COLORS['decision'], 9)
    draw_box(ax, 0.3, 4.0, 3.0, 0.7, '⑤a 前端模型选择器\n新增选项与参数配置', COLORS['dev'], 8.5)
    draw_box(ax, 7.7, 4.0, 3.0, 0.7, '⑤b 无需前端改动\n复用现有模型选择器', COLORS['config'], 8.5)

    # Step 6: 联调测试
    draw_box(ax, 3.5, 2.7, 4.0, 0.8, '⑥ 联调测试\n• 生文/生图/生视频各场景验证\n• 真人资产上传与同步验证\n• 异常场景与限流测试', COLORS['test'], 8.5)

    # Step 7: 上线
    draw_box(ax, 3.5, 1.5, 4.0, 0.7, '⑦ 灰度发布与正式上线\n配置灰度比例、监控告警、账单核对', COLORS['done'], 9, True)

    # 箭头
    draw_arrow(ax, 5.5, 11.3, 5.5, 10.9)
    draw_arrow(ax, 5.5, 10.2, 5.5, 9.8)
    draw_arrow(ax, 5.5, 9.1, 5.5, 8.7)
    draw_arrow(ax, 5.5, 7.8, 5.5, 7.3)
    draw_arrow(ax, 5.5, 6.5, 5.5, 6.1)
    draw_arrow(ax, 4.5, 5.2, 1.8, 4.7, '是')
    draw_arrow(ax, 6.5, 5.2, 9.2, 4.7, '否')
    draw_arrow(ax, 1.8, 4.0, 4.5, 3.5)
    draw_arrow(ax, 9.2, 4.0, 6.5, 3.5)
    draw_arrow(ax, 5.5, 2.7, 5.5, 2.2)

    ax.text(5.5, 12.9, '图1  新增厂商接入流程图', ha='center', va='center',
            fontsize=14, fontweight='bold')

    plt.tight_layout()
    path = os.path.join(OUTPUT_DIR, 'fig_new_vendor_flow.png')
    plt.savefig(path, dpi=200, bbox_inches='tight', facecolor='white')
    plt.close()
    print(f'Saved: {path}')


# ============================================================
# 图2：已有厂商新增模型流程图
# ============================================================
def draw_new_model_flow():
    fig, ax = plt.subplots(1, 1, figsize=(11, 10))
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 11)
    ax.axis('off')

    # 图例
    legend_y = 10.3
    draw_box(ax, 0.5, legend_y, 1.5, 0.4, '配置型工作', COLORS['config'], 8, True)
    draw_box(ax, 2.3, legend_y, 1.5, 0.4, '开发型工作', COLORS['dev'], 8, True)
    draw_box(ax, 4.1, legend_y, 1.5, 0.4, '测试验证', COLORS['test'], 8, True)
    draw_box(ax, 5.9, legend_y, 1.5, 0.4, '完成上线', COLORS['done'], 8, True)

    draw_box(ax, 3.5, 9.3, 4.0, 0.6, '开始：已有厂商下新增模型', '#C8E6C9', 10, True)

    draw_box(ax, 3.5, 8.2, 4.0, 0.7, '① 确认模型信息\n模型名称、类型（文/图/视频）、计费方式、能力差异', COLORS['config'], 8.5)

    draw_diamond(ax, 3.5, 6.8, 4.0, 0.9, '② 现有适配器是否\n已支持该模型类型？', COLORS['decision'], 9)

    draw_box(ax, 0.2, 5.3, 3.2, 0.9, '②a 适配器扩展开发\n• 新增模型类型的请求/响应封装\n• 特殊参数适配（如视频分辨率、时长）\n• 约0.5-1人天', COLORS['dev'], 8)
    draw_box(ax, 7.6, 5.3, 3.2, 0.9, '②b 无需开发\n复用现有适配器能力\n仅需配置注册', COLORS['config'], 8.5)

    draw_box(ax, 3.5, 3.9, 4.0, 0.8, '③ 模型注册与配置\n在模型管理后台新增模型记录\n配置模型ID、价格、默认参数、限流、开关', COLORS['config'], 8.5)

    draw_diamond(ax, 3.5, 2.6, 4.0, 0.8, '④ 前端是否需要\n展示新模型？', COLORS['decision'], 9)
    draw_box(ax, 0.5, 1.3, 2.8, 0.7, '④a 前端模型列表\n新增选项（约0.5人天）', COLORS['dev'], 8)
    draw_box(ax, 7.7, 1.3, 2.8, 0.7, '④b 无需改动\n动态读取模型列表', COLORS['config'], 8)

    draw_box(ax, 3.5, 0.2, 4.0, 0.7, '⑤ 测试验证 → 上线\n功能测试 + 账单核对 → 灰度发布', COLORS['test'], 8.5, True)

    # 箭头
    draw_arrow(ax, 5.5, 9.3, 5.5, 8.9)
    draw_arrow(ax, 5.5, 8.2, 5.5, 7.7)
    draw_arrow(ax, 4.5, 6.8, 1.8, 6.2, '否')
    draw_arrow(ax, 6.5, 6.8, 9.2, 6.2, '是')
    draw_arrow(ax, 1.8, 5.3, 4.5, 4.7)
    draw_arrow(ax, 9.2, 5.3, 6.5, 4.7)
    draw_arrow(ax, 5.5, 3.9, 5.5, 3.4)
    draw_arrow(ax, 4.5, 2.6, 1.9, 2.0, '是')
    draw_arrow(ax, 6.5, 2.6, 9.1, 2.0, '否')
    draw_arrow(ax, 1.9, 1.3, 4.5, 0.9)
    draw_arrow(ax, 9.1, 1.3, 6.5, 0.9)

    ax.text(5.5, 10.9, '图2  已有厂商新增模型接入流程图', ha='center', va='center',
            fontsize=14, fontweight='bold')

    plt.tight_layout()
    path = os.path.join(OUTPUT_DIR, 'fig_new_model_flow.png')
    plt.savefig(path, dpi=200, bbox_inches='tight', facecolor='white')
    plt.close()
    print(f'Saved: {path}')


if __name__ == '__main__':
    draw_new_vendor_flow()
    draw_new_model_flow()
    print('All diagrams generated.')
