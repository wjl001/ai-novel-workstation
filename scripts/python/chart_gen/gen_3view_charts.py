# -*- coding: utf-8 -*-
"""生成三视图角色设定模块的三张图表"""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Polygon, Rectangle
import os

plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

OUT_DIR = r'D:\phpstudy_pro\WWW\ai-novel-workstation1.2.0\charts'
os.makedirs(OUT_DIR, exist_ok=True)

C_PRI = '#4F46E5'; C_SEC = '#7C3AED'; C_ACC = '#0EA5E9'
C_SUC = '#10B981'; C_WAR = '#F59E0B'; C_DAN = '#EF4444'
C_BG = '#F8FAFC'; C_TXT = '#1E293B'; C_GRY = '#64748B'

def box(ax, x, y, w, h, text, color=C_PRI, tc='white', fs=9.5, bold=True):
    b = FancyBboxPatch((x,y), w, h, boxstyle="round,pad=0.02,rounding_size=0.08",
                       facecolor=color, edgecolor='none', alpha=0.92, zorder=2)
    ax.add_patch(b)
    ax.text(x+w/2, y+h/2, text, ha='center', va='center', fontsize=fs,
            color=tc, fontweight='bold' if bold else 'normal', zorder=3)

def arrow(ax, x1, y1, x2, y2, color=C_GRY, lw=1.5):
    ax.annotate('', xy=(x2,y2), xytext=(x1,y1),
                arrowprops=dict(arrowstyle='->', color=color, lw=lw))

# ====== 图1：三视图模块产品架构图 ======
def gen_3view_arch():
    fig, ax = plt.subplots(figsize=(14, 10))
    ax.set_xlim(0,14); ax.set_ylim(0,10); ax.axis('off')
    fig.patch.set_facecolor(C_BG)
    ax.text(7, 9.6, '角色三视图设定模块 · 产品架构图', ha='center', fontsize=16, fontweight='bold', color=C_TXT)

    # 用户层
    ax.text(0.3, 8.8, '用户层', fontsize=11, fontweight='bold', color=C_PRI, va='center')
    box(ax, 1.5, 8.3, 3.5, 0.7, '创作者（录入角色信息）', C_PRI, fs=10)
    box(ax, 5.5, 8.3, 3.5, 0.7, '审核人员（确认三视图质量）', C_SEC, fs=10)
    box(ax, 9.5, 8.3, 3.5, 0.7, '运营人员（维护模板库）', C_ACC, fs=10)

    # 应用层
    ax.text(0.3, 7.3, '应用层', fontsize=11, fontweight='bold', color=C_PRI, va='center')
    apps = [
        (0.8, 6.5, 2.8, 0.9, '角色信息录入\n（姓名/年龄/职业/外貌）', C_PRI),
        (4.0, 6.5, 2.8, 0.9, '三视图生成面板\n（正/侧/背/特写）', C_SEC),
        (7.2, 6.5, 2.8, 0.9, '三视图预览与确认\n（四宫格展示）', C_ACC),
        (10.4, 6.5, 2.8, 0.9, '视图管理\n（设为基准/重生成/替换）', C_SUC),
    ]
    for x,y,w,h,t,c in apps: box(ax, x,y,w,h,t,c,fs=9)

    # 服务层
    ax.text(0.3, 5.5, '服务层', fontsize=11, fontweight='bold', color=C_PRI, va='center')
    svcs = [
        (0.6, 4.5, 2.4, 0.9, '角色特征提取服务\n（外貌/服饰/体型标准化）', C_WAR),
        (3.3, 4.5, 2.4, 0.9, '三视图提示词引擎\n（视角转换/一致性保持）', C_WAR),
        (6.0, 4.5, 2.4, 0.9, '多视图生成调度\n（顺序生成/并行生成）', C_WAR),
        (8.7, 4.5, 2.4, 0.9, '一致性校验服务\n（人物特征跨视图比对）', C_WAR),
        (11.4, 4.5, 2.0, 0.9, '质量检测服务\n（人脸/色彩/精度）', C_WAR),
    ]
    for x,y,w,h,t,c in svcs: box(ax, x,y,w,h,t,c,fs=8.5)

    # 数据层
    ax.text(0.3, 3.5, '数据层', fontsize=11, fontweight='bold', color=C_PRI, va='center')
    datas = [
        (1.0, 2.7, 2.8, 0.9, '角色资产库\n（含四视图数据）', C_DAN),
        (4.2, 2.7, 2.8, 0.9, '三视图模板库\n（视角/风格/职业模板）', C_DAN),
        (7.4, 2.7, 2.8, 0.9, '生成历史库\n（每次视图生成记录）', C_DAN),
        (10.6, 2.7, 2.8, 0.9, '一致性规则库\n（特征锁定/约束规则）', C_DAN),
    ]
    for x,y,w,h,t,c in datas: box(ax, x,y,w,h,t,c,fs=9)

    # 连接
    for x in [3.25, 7.25, 11.25]: arrow(ax, x, 8.3, x, 7.45)
    for x in [2.2, 5.4, 8.6, 11.8]: arrow(ax, x, 6.5, x, 5.45)
    for x in [1.8, 4.5, 7.2, 9.9, 12.4]: arrow(ax, x, 4.5, x, 3.65)

    # 核心标注
    rect = Rectangle((0.5, 4.3), 13.2, 2.4, linewidth=1.5, edgecolor=C_DAN,
                     facecolor='none', linestyle='--', alpha=0.5, zorder=1)
    ax.add_patch(rect)
    ax.text(13.8, 5.5, '核心\n三视\n图模\n块', fontsize=9, color=C_DAN, fontweight='bold', ha='center', va='center', rotation=90)

    plt.tight_layout()
    p = os.path.join(OUT_DIR, '3view_architecture.png')
    plt.savefig(p, dpi=180, bbox_inches='tight', facecolor=C_BG); plt.close()
    print(f'三视图架构图: {p}')

# ====== 图2：三视图生成流程图 ======
def gen_3view_flow():
    fig, ax = plt.subplots(figsize=(12, 18))
    ax.set_xlim(0,12); ax.set_ylim(0,18); ax.axis('off')
    fig.patch.set_facecolor(C_BG)
    ax.text(6, 17.6, '角色三视图生成 · 完整流程图', ha='center', fontsize=15, fontweight='bold', color=C_TXT)

    nodes = [
        (6, 16.8, 3, 0.6, '开始：进入角色编辑页面', C_SUC, 'start'),
        (6, 15.8, 4, 0.7, '录入角色基础信息\n（姓名/年龄/性别/职业/身高/体型）', C_PRI, 'proc'),
        (6, 14.6, 4.5, 0.8, '填写外貌特征描述\n（发型/面部/肤色/服饰/配饰/特殊标记）', C_PRI, 'proc'),
        (6, 13.4, 4.5, 0.8, '系统提取并标准化特征标签\n生成角色特征档案（锁定基准）', C_SEC, 'proc'),
        (6, 12.2, 5, 0.9, '三视图提示词引擎组装\n正面图提示词 + 侧面图提示词 + 背面图提示词 + 面部特写提示词\n（共用特征档案，仅切换视角描述）', C_ACC, 'proc'),
        (3, 10.8, 2.5, 0.7, '用户预览四视图提示词', C_PRI, 'io'),
        (9, 10.8, 2.5, 0.7, '用户可逐个编辑调整', C_PRI, 'io'),
        (6, 9.6, 3.5, 0.7, '用户确认并提交生成', C_SUC, 'proc'),
        (6, 8.4, 4, 0.8, '多视图调度服务\n按顺序生成：正面→侧面→背面→特写\n每张图传入相同特征档案+对应视角词', C_SEC, 'proc'),
        (6, 7.2, 4.5, 0.9, '自动质量检测 + 一致性校验\n人脸完整/色彩准确/精度达标\n跨视图人物特征一致性比对', C_WAR, 'proc'),
        (3, 5.8, 2.5, 0.8, '全部通过？', C_DAN, 'decision'),
        (9, 5.8, 2.5, 0.7, '自动优化对应视图提示词\n重新生成（最多2次）', C_DAN, 'proc'),
        (6, 4.4, 4.5, 0.8, '四宫格展示三视图结果\n正面 | 侧面 | 背面 | 面部特写\n用户逐张查看质量', C_PRI, 'proc'),
        (6, 3.2, 4, 0.7, '用户确认：采纳/单张重生成/全部重生成', C_SUC, 'proc'),
        (6, 2.0, 4, 0.7, '保存为角色基准三视图\n关联到角色资产，供后续分镜复用', C_SEC, 'proc'),
        (6, 1.0, 3, 0.6, '结束', C_SUC, 'end'),
    ]
    pos = {}
    for i,(x,y,w,h,t,c,nt) in enumerate(nodes):
        nid = f'n{i}'; pos[nid] = (x,y,w,h)
        if nt == 'decision':
            d = Polygon([(x,y+h/2),(x+w/2,y),(x,y-h/2),(x-w/2,y)], facecolor=c, alpha=0.9, zorder=2)
            ax.add_patch(d); ax.text(x,y,t,ha='center',va='center',fontsize=9,color='white',fontweight='bold',zorder=3)
        elif nt in ('start','end'):
            box(ax, x-w/2, y-h/2, w, h, t, c, fs=10)
        elif nt == 'io':
            off=0.15
            para = Polygon([(x-w/2+off,y-h/2),(x+w/2,y-h/2),(x+w/2-off,y+h/2),(x-w/2,y+h/2)],
                           facecolor=c, alpha=0.9, zorder=2)
            ax.add_patch(para); ax.text(x,y,t,ha='center',va='center',fontsize=9,color='white',fontweight='bold',zorder=3)
        else:
            box(ax, x-w/2, y-h/2, w, h, t, c, fs=9)

    # 主流程连接
    for a,b in [('n0','n1'),('n1','n2'),('n2','n3'),('n3','n4'),('n4','n5'),
                ('n5','n7'),('n6','n7'),('n7','n8'),('n8','n9'),('n9','n10'),
                ('n12','n13'),('n13','n14'),('n14','n15')]:
        x1,y1,w1,h1 = pos[a]; x2,y2,w2,h2 = pos[b]
        arrow(ax, x1, y1-h1/2, x2, y2+h2/2)
    # 预览和编辑双向
    x5,y5,_,_ = pos['n5']; x6,y6,_,_ = pos['n6']
    ax.annotate('', xy=(x6-1.25,y6), xytext=(x5+1.25,y5),
                arrowprops=dict(arrowstyle='<->', color=C_GRY, lw=1.2))
    # 决策：是 -> 用户确认展示
    x10,y10,w10,h10 = pos['n10']; x12,y12,w12,h12 = pos['n12']
    arrow(ax, x10, y10-h10/2, x12, y12+h12/2)
    ax.text(x10-0.5, (y10+y12)/2, '是', fontsize=10, color=C_SUC, fontweight='bold')
    # 决策：否 -> 自动优化
    x11,y11,w11,h11 = pos['n11']
    arrow(ax, x10+w10/2, y10, x11-w11/2, y11)
    ax.text((x10+x11)/2, y10+0.2, '否', fontsize=10, color=C_DAN, fontweight='bold')
    # 自动优化 -> 回到生成调度
    arrow(ax, x11, y11+h11/2, x11, 8.4+0.4, color=C_DAN, lw=1.2)
    ax.text(x11+0.2, (y11+8.4)/2, '重试', fontsize=8, color=C_DAN, rotation=90)

    plt.tight_layout()
    p = os.path.join(OUT_DIR, '3view_flowchart.png')
    plt.savefig(p, dpi=180, bbox_inches='tight', facecolor=C_BG); plt.close()
    print(f'三视图流程图: {p}')

# ====== 图3：三视图泳道图 ======
def gen_3view_swimlane():
    fig, ax = plt.subplots(figsize=(16, 10))
    ax.set_xlim(0,16); ax.set_ylim(0,10); ax.axis('off')
    fig.patch.set_facecolor(C_BG)
    ax.text(8, 9.6, '角色三视图设定 · 跨角色协作泳道图', ha='center', fontsize=15, fontweight='bold', color=C_TXT)

    lanes = [
        ('用户/创作者', 8.0, 1.4, C_PRI),
        ('前端应用层', 6.4, 1.4, C_SEC),
        ('三视图提示词引擎', 4.8, 1.4, C_ACC),
        ('多视图生成服务', 3.2, 1.4, C_WAR),
        ('一致性校验服务', 1.6, 1.4, C_SUC),
    ]
    for name,y,h,c in lanes:
        rect = Rectangle((1.5,y), 14, h, facecolor=c, alpha=0.06, edgecolor='#E2E8F0', lw=0.8, zorder=1)
        ax.add_patch(rect)
        lb = FancyBboxPatch((0.1,y+0.1), 1.3, h-0.2, boxstyle="round,pad=0.01,rounding_size=0.05",
                            facecolor=c, alpha=0.85, zorder=2)
        ax.add_patch(lb)
        ax.text(0.75, y+h/2, name, ha='center', va='center', fontsize=9.5, color='white', fontweight='bold', rotation=90, zorder=3)

    acts = [
        (0, 2.0, 1.8, '录入角色信息\n填写外貌描述', C_PRI),
        (0, 4.2, 1.8, '上传参考图（可选）\n选择风格', C_PRI),
        (1, 2.0, 1.8, '收集表单数据\n校验必填项', C_SEC),
        (1, 4.2, 1.8, '发送角色信息\n至提示词引擎', C_SEC),
        (2, 4.2, 1.8, '提取特征标签\n生成特征档案', C_ACC),
        (2, 6.4, 1.8, '组装四视图提示词\n（正/侧/背/特写）', C_ACC),
        (1, 6.4, 1.8, '渲染四视图提示词\n预览面板', C_SEC),
        (0, 6.4, 1.8, '预览并确认提示词\n可逐个编辑', C_PRI),
        (0, 8.6, 1.5, '确认提交生成', C_SUC),
        (1, 8.6, 1.5, '提交生成请求\n（含四视图提示词）', C_SEC),
        (3, 8.6, 1.8, '调度模型顺序生成\n正面→侧面→背面→特写', C_WAR),
        (3, 11.0, 1.8, '返回四张生成图片\n及元数据', C_WAR),
        (4, 11.0, 1.8, '质量检测\n一致性校验', C_SUC),
        (4, 13.2, 1.5, '输出检测报告\n一致性评分', C_SUC),
        (1, 11.0, 1.8, '四宫格展示结果\n附检测报告', C_SEC),
        (0, 11.0, 1.8, '查看四视图\n确认质量', C_PRI),
        (0, 13.2, 1.5, '采纳/单张重生\n/全部重生', C_PRI),
        (1, 13.2, 1.5, '保存三视图\n关联角色资产', C_SEC),
    ]
    apos = {}
    for idx,(li,x,w,t,c) in enumerate(acts):
        _,y,h,_ = lanes[li]
        ay = y + h/2 - 0.35; ah = 0.7
        box(ax, x, ay, w, ah, t, c, fs=8)
        apos[idx] = (x, ay, w, ah)

    # 连接（简化：垂直+水平折线）
    def vconn(i,j):
        x1,y1,w1,h1 = apos[i]; x2,y2,w2,h2 = apos[j]
        mx = (x1+w1 + x2)/2 if x1 < x2 else (x1 + x2+w2)/2
        ax.plot([x1+w1, mx],[y1+h1/2, y1+h1/2], color=C_GRY, lw=1.2, zorder=1)
        ax.plot([mx, mx],[y1+h1/2, y2+h2/2], color=C_GRY, lw=1.2, zorder=1)
        ax.annotate('', xy=(x2,y2+h2/2), xytext=(mx,y2+h2/2),
                    arrowprops=dict(arrowstyle='->', color=C_GRY, lw=1.2))

    # 主要流程连接
    vconn(0,2); vconn(1,3); vconn(2,4); vconn(3,4)
    vconn(4,5); vconn(5,6); vconn(6,7); vconn(7,8)
    vconn(8,9); vconn(9,10); vconn(10,11); vconn(11,12)
    vconn(12,13); vconn(11,14); vconn(14,15); vconn(15,16); vconn(16,17)

    # 不满意回退（虚线）
    x16,y16,w16,h16 = apos[16]
    x5,y5,w5,h5 = apos[5]
    ax.annotate('', xy=(x5+w5, y5+h5/2), xytext=(x16+w16/2, y16),
                arrowprops=dict(arrowstyle='->', color=C_DAN, lw=1.2, linestyle='dashed',
                               connectionstyle="arc3,rad=0.3"))
    ax.text(14.5, 6.0, '不满意\n重新生成', fontsize=8, color=C_DAN, ha='center')

    plt.tight_layout()
    p = os.path.join(OUT_DIR, '3view_swimlane.png')
    plt.savefig(p, dpi=180, bbox_inches='tight', facecolor=C_BG); plt.close()
    print(f'三视图泳道图: {p}')

if __name__ == '__main__':
    gen_3view_arch()
    gen_3view_flow()
    gen_3view_swimlane()
    print('三视图模块图表全部生成完成')
