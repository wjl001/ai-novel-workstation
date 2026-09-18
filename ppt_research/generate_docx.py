# -*- coding: utf-8 -*-
"""生成AI短剧创作平台竞品积分收费与商业模式调研报告 docx"""
from docx import Document
from docx.shared import Pt, Cm, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

doc = Document()

# 设置默认字体为微软雅黑
style = doc.styles['Normal']
font = style.font
font.name = '微软雅黑'
font.size = Pt(11)
style.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')

# 设置页边距
for section in doc.sections:
    section.top_margin = Cm(2.5)
    section.bottom_margin = Cm(2.5)
    section.left_margin = Cm(2.8)
    section.right_margin = Cm(2.8)

def set_cell_font(cell, text, size=10, bold=False, color=None, align='center'):
    cell.text = ''
    p = cell.paragraphs[0]
    if align == 'center':
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    elif align == 'left':
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    run = p.add_run(text)
    run.font.name = '微软雅黑'
    run.font.size = Pt(size)
    run.font.bold = bold
    run.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')
    if color:
        run.font.color.rgb = RGBColor(*color)

def add_heading(text, level=1):
    h = doc.add_heading(text, level=level)
    for run in h.runs:
        run.font.name = '微软雅黑'
        run.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')
        if level == 1:
            run.font.size = Pt(18)
            run.font.color.rgb = RGBColor(27, 58, 92)
        elif level == 2:
            run.font.size = Pt(15)
            run.font.color.rgb = RGBColor(27, 58, 92)
        elif level == 3:
            run.font.size = Pt(13)
            run.font.color.rgb = RGBColor(27, 58, 92)
    return h

def add_para(text, size=11, bold=False, color=None, indent=False):
    p = doc.add_paragraph()
    if indent:
        p.paragraph_format.first_line_indent = Pt(22)
    run = p.add_run(text)
    run.font.name = '微软雅黑'
    run.font.size = Pt(size)
    run.font.bold = bold
    run.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')
    if color:
        run.font.color.rgb = RGBColor(*color)
    p.paragraph_format.line_spacing = 1.5
    return p

def add_table(headers, rows, col_widths=None):
    table = doc.add_table(rows=1+len(rows), cols=len(headers))
    table.style = 'Table Grid'
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    # 表头
    for i, h in enumerate(headers):
        cell = table.rows[0].cells[i]
        set_cell_font(cell, h, size=10, bold=True, color=(255,255,255))
        # 设置表头背景色
        shading = OxmlElement('w:shd')
        shading.set(qn('w:fill'), '1B3A5C')
        cell._tc.get_or_add_tcPr().append(shading)
    # 数据行
    for r_idx, row in enumerate(rows):
        for c_idx, val in enumerate(row):
            cell = table.rows[r_idx+1].cells[c_idx]
            set_cell_font(cell, str(val), size=9)
    if col_widths:
        for i, w in enumerate(col_widths):
            for row in table.rows:
                row.cells[i].width = Cm(w)
    return table

# ==================== 封面 ====================
title = doc.add_paragraph()
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
title.paragraph_format.space_before = Pt(120)
run = title.add_run('AI短剧创作平台\n竞品积分收费与商业模式调研报告')
run.font.name = '微软雅黑'
run.font.size = Pt(26)
run.font.bold = True
run.font.color.rgb = RGBColor(27, 58, 92)
run.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')

subtitle = doc.add_paragraph()
subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
subtitle.paragraph_format.space_before = Pt(40)
run = subtitle.add_run('——LibTV、小云雀、纳米AI、天工AI、万兴喵影五家竞品深度调研')
run.font.name = '微软雅黑'
run.font.size = Pt(14)
run.font.color.rgb = RGBColor(100, 100, 100)
run.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')

info = doc.add_paragraph()
info.alignment = WD_ALIGN_PARAGRAPH.CENTER
info.paragraph_format.space_before = Pt(180)
run = info.add_run('调研时间：2026年9月\n数据来源：各平台官方定价页、App Store、第三方评测、公开财报\n字体：微软雅黑')
run.font.name = '微软雅黑'
run.font.size = Pt(11)
run.font.color.rgb = RGBColor(120, 120, 120)
run.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')

doc.add_page_break()

# ==================== 一、调研背景与方法论 ====================
add_heading('一、调研背景与方法论', level=1)
add_heading('1.1 调研背景', level=2)
add_para('本项目为AI短剧创作平台，采用"算力豆"积分体系与三档会员订阅制相结合的收费模式。随着AI视频生成赛道竞争加剧，LibTV、小云雀、纳米AI、天工AI、万兴喵影等竞品纷纷推出各自的积分收费体系。为明确本项目在市场中的定价定位与竞争优势，特开展本次竞品调研。', indent=True)
add_heading('1.2 调研对象', level=2)
add_para('本次调研覆盖五家主流竞品：LibTV（LiblibAI旗下）、小云雀（字节Seedance模型）、纳米AI（全模态聚合平台）、天工AI（昆仑万维）、万兴喵影（万兴科技桌面剪辑软件）。', indent=True)
add_heading('1.3 调研维度', level=2)
add_para('（1）积分收费规格：会员档位、价格、月度积分额度、积分包定价；\n（2）生文/生图/生视频消耗：各功能的积分消耗及人民币换算；\n（3）商业模式与盈利来源：核心收入、增量收入、定价策略；\n（4）有效期规则：会员积分与充值积分的过期/清零规则；\n（5）与本项目对比：人民币价格横向对比，尤其是视频生成单价差距。', indent=True)
add_heading('1.4 汇率换算说明', level=2)
add_para('本报告所有竞品价格均按各平台会员/积分包汇率换算为人民币。本项目汇率为1元=100算力豆。由于各家积分定义与消耗单位不同，单积分成本不可直接比较，报告以"生成单位内容的人民币成本"为统一对比口径。', indent=True)

doc.add_page_break()

# ==================== 二、本项目积分体系 ====================
add_heading('二、本项目积分体系（算力豆）', level=1)
add_heading('2.1 算力豆基本规则', level=2)
add_para('本项目采用"算力豆"作为统一计费单位，核心规则如下：', indent=True)
add_para('• 汇率：1元 = 100算力豆（等面值发放，无赠送比例差异）\n• 会员算力豆：随会员套餐赠送，随会员到期清零，升级时合并\n• 充值算力豆：充值购买，永久有效，无会员状态下可继续使用\n• 跨档升级：全额购买新档，新档算力豆合并到现有池，到期时间延长', indent=True)

add_heading('2.2 会员套餐', level=2)
add_table(
    ['档位', '月费（元）', '年费（元）', '月度算力豆', '并发', '核心权益'],
    [
        ['基础版', '99', '950', '9,900', '2', '480P/720P，标准队列'],
        ['专业版', '299', '2,870', '29,900', '4', '1080P/4K，去水印，商用授权，优先队列'],
        ['工作室版', '999', '9,590', '99,900', '8', 'API接入，8并发，工单优先'],
    ],
    col_widths=[2, 2, 2, 2.5, 1.5, 5]
)

add_heading('2.3 模型定价（生图/生视频）', level=2)
add_table(
    ['模型', '类型', '档位', '单价（算力豆）', '人民币价格'],
    [
        ['doubao-seedance-2.0', '视频', '基础', '0.005豆/秒', '¥0.00005/秒'],
        ['HappyHorse 1.1', '视频', '基础', '0.005豆/秒', '¥0.00005/秒'],
        ['gemini-3.1-flash-lite-image', '图片', '基础', '5豆/张', '¥0.05/张'],
        ['doubao-seedream-5.0-lite', '图片', '基础', '5豆/张', '¥0.05/张'],
        ['doubao-seedance-2.5', '视频', '高端', '0.05豆/秒', '¥0.0005/秒'],
        ['ChatGPT Images 2.0', '图片', '高端', '50豆/张', '¥0.50/张'],
        ['可灵3.0 Omni', '视频', '旗舰', '0.1豆/秒', '¥0.001/秒'],
    ],
    col_widths=[4.5, 1.5, 1.5, 3, 3]
)
add_para('注：生文功能未单独定价，包含在会员权益中。视频生成按秒计费，生图按张计费。', size=9, color=(120,120,120))

doc.add_page_break()

# ==================== 三、五家竞品详细分析 ====================
add_heading('三、五家竞品详细分析', level=1)

# LibTV
add_heading('3.1 LibTV', level=2)
add_heading('3.1.1 产品定位与商业模式', level=3)
add_para('LibTV是LiblibAI推出的一站式AI视频创作平台，采用"订阅制+积分消耗"混合计费，年仅付无月付选项。核心收入来自会员订阅，高端档含商用授权溢价。2026年7月高端档涨价1000元，显示强定价权。', indent=True)
add_heading('3.1.2 积分收费规格', level=3)
add_table(
    ['档位', '年费（元）', '月度积分', '并发', '定位'],
    [
        ['专业版', '499', '1,800', '6', '独立创作者'],
        ['大师版', '1,299', '5,800', '10', '专业团队'],
        ['旗舰版', '3,299', '18,000', '20', '规模化团队'],
        ['至尊版', '5,599', '34,000', '30', '企业级'],
        ['定制版', '6,599', '定制', '定制', '大客户定制'],
    ],
    col_widths=[2.5, 2.5, 2.5, 1.5, 4]
)
add_para('积分汇率：约0.023元/积分（专业版折算）。每日登录赠送20积分。', size=10)
add_heading('3.1.3 生文/生图/生视频价格（人民币）', level=3)
add_table(
    ['功能', '消耗', '人民币价格', '说明'],
    [
        ['生文', '未单独定价', '含于会员', '剧本生成等功能包含在会员中'],
        ['生图', '约0.25积分/张', '约¥0.006/张', '按专业版估算，因模型而异'],
        ['生视频', 'Seedance2.0低至0.35元/秒', '¥0.35/秒', '真人模式，会员39折后'],
    ],
    col_widths=[2, 4, 3, 5]
)

# 小云雀
add_heading('3.2 小云雀', level=2)
add_heading('3.2.1 产品定位与商业模式', level=3)
add_para('小云雀背靠字节跳动Seedance模型，是AI视频生成领域的主流平台。采用月付/季付/年付会员制，积分高汇率（0.095元/积分），视频消耗大（10-26积分/秒），驱动高频复购。设有创作者现金激励计划。', indent=True)
add_heading('3.2.2 积分收费规格', level=3)
add_table(
    ['档位', '月费（元）', '月度积分', '单积分成本'],
    [
        ['基础会员', '79', '830', '¥0.095'],
        ['标准会员', '209', '2,320', '¥0.090'],
        ['高级会员', '529', '6,330', '¥0.084'],
    ],
    col_widths=[3, 3, 3, 3]
)
add_para('积分充值包：750积分/75元，1500积分/150元。', size=10)
add_heading('3.2.3 生文/生图/生视频价格（人民币）', level=3)
add_table(
    ['功能', '模型/规格', '积分消耗', '人民币价格'],
    [
        ['生文', '—', '未单独定价', '含于会员'],
        ['生图', '—', '未公开标准', '—'],
        ['生视频', '智能混剪', '3积分/秒', '¥0.285/秒'],
        ['生视频', 'Lite（标准画质）', '10积分/秒', '¥0.95/秒'],
        ['生视频', 'Turbo（快速）', '15积分/秒', '¥1.425/秒'],
        ['生视频', 'Pro（Seedance2.0）', '25积分/秒', '¥2.375/秒'],
        ['生视频', 'Seedance2.5 720P', '26积分/秒', '¥2.47/秒'],
    ],
    col_widths=[2, 4, 3, 3]
)
add_para('注：Seedance2.5生成30秒720P需780积分，约74元/条。', size=9, color=(120,120,120))

doc.add_page_break()

# 纳米AI
add_heading('3.3 纳米AI', level=2)
add_heading('3.3.1 产品定位与商业模式', level=3)
add_para('纳米AI是全模态AI聚合平台，采用"纳米币+算力"双单位制。月卡39元低价获客，年卡399元锁定用户，至尊年卡月赠15000算力。盈利模式为低价获客+年卡锁定+高端溢价。', indent=True)
add_heading('3.3.2 积分收费规格', level=3)
add_table(
    ['档位', '价格', '月度算力/纳米币', '说明'],
    [
        ['月卡', '39元/月', '1,180算力', '入门体验'],
        ['季卡', '99元/季', '1,180算力/月', '短期使用'],
        ['年卡', '399元/年', '1,180算力/月', '标准用户'],
        ['尊享年卡', '—', '5,000算力/月', '进阶用户'],
        ['至尊年卡', '—', '15,000算力/月', '重度用户'],
    ],
    col_widths=[2.5, 3, 3.5, 4]
)
add_para('纳米币汇率：1纳米币 = 0.1元。API图像生成低至0.07元/次。', size=10)
add_heading('3.3.3 生文/生图/生视频价格（人民币）', level=3)
add_table(
    ['功能', '消耗', '人民币价格', '说明'],
    [
        ['生文', '未单独定价', '含于会员', '智能体调用可能额外收费'],
        ['生图', 'API低至0.07元/次', '¥0.07/张', '基于Gemini图像模型'],
        ['生视频', 'Seedance2.0 15秒720P约200纳米币', '约¥1.33/秒', '满血版Seedance2.0'],
    ],
    col_widths=[2, 5, 3, 4]
)

# 天工AI
add_heading('3.4 天工AI', level=2)
add_heading('3.4.1 产品定位与商业模式', level=3)
add_para('天工AI是昆仑万维的全品类AI工作空间，覆盖PPT/文档/表格/图片/视频。采用"会员+积分包"模式，SkyProduction短剧工作台以4折低价抢占市场。短剧平台业务月流水超4800万美元，形成"工具+内容+平台"三轮驱动。', indent=True)
add_heading('3.4.2 积分收费规格', level=3)
add_table(
    ['类型', '规格', '价格', '单积分成本'],
    [
        ['Basic会员', '连续包月', '45元/月', '—'],
        ['Plus会员', '连续包月', '85元/月', '—'],
        ['积分包', '10,000积分', '48元', '¥0.0048'],
        ['积分包', '20,000积分', '91元', '¥0.0046'],
        ['积分包', '50,000积分', '200元', '¥0.0040'],
    ],
    col_widths=[2.5, 3, 2.5, 3]
)
add_para('免费用户：新注册赠2500积分，每日赠1200积分。', size=10)
add_heading('3.4.3 生文/生图/生视频价格（人民币）', level=3)
add_table(
    ['功能', '消耗', '人民币价格', '说明'],
    [
        ['生文', '约300-800积分/次', '¥1.44-3.84/次', '按任务复杂度'],
        ['生图', '约30积分/张', '约¥0.14/张', '第三方实测估算'],
        ['生视频', 'Wan 3.0', '¥0.05/秒', '限时低价，竞品中最低'],
        ['生视频', 'Seedance2.5 720P', '¥0.40/秒', 'SkyProduction 4折价格战'],
    ],
    col_widths=[2, 4, 3, 5]
)

doc.add_page_break()

# 万兴喵影
add_heading('3.5 万兴喵影', level=2)
add_heading('3.5.1 产品定位与商业模式', level=3)
add_para('万兴喵影是万兴科技旗下桌面视频剪辑软件，内建1500万素材。采用"软件订阅+AI积分包"双轨制，软件订阅为基础盘，AI功能以积分制单独收费形成增量。积分包有效期1年，SVIP月度积分当月清零。', indent=True)
add_heading('3.5.2 积分收费规格', level=3)
add_table(
    ['类型', '规格', '价格', '说明'],
    [
        ['VIP会员', '1年', '269元', '赠3000积分（1年有效）'],
        ['VIP会员', '3年', '419元', '赠3000积分'],
        ['SVIP订阅', '月度', '订阅制', '月赠4000积分（当月清零）'],
        ['积分包', '1,000积分', '9.99元', '有效期1年'],
        ['积分包', '10,000积分', '69元', '有效期1年'],
        ['积分包', '200,000积分', '1,299元', '有效期1年，最划算'],
    ],
    col_widths=[2.5, 3, 2.5, 4.5]
)
add_para('积分汇率：约0.0065-0.01元/积分。', size=10)
add_heading('3.5.3 生文/生图/生视频价格（人民币）', level=3)
add_table(
    ['功能', '积分消耗', '人民币价格', '说明'],
    [
        ['生文（智小喵）', '40积分/次', '¥0.40/次', 'AI文案生成'],
        ['生图（AI绘画）', '40积分/次', '¥0.40/张', '标准图像生成'],
        ['文生场景参考图', '20积分/次', '¥0.20/张', '灵感成片功能'],
        ['图生视频', '60-1500积分/次', '¥0.6-15/次', '因模型和时长而异'],
        ['文生视频', '55-740积分/次', '¥0.55-7.4/次', '因复杂度而异'],
        ['灵感成片分镜', '240-1200积分/分镜', '¥2.4-12/分镜', '文生图/首尾帧/复杂方案'],
    ],
    col_widths=[3, 3.5, 3, 4]
)

doc.add_page_break()

# ==================== 四、横向对比 ====================
add_heading('四、横向对比分析', level=1)

add_heading('4.1 生文/生图/生视频人民币价格总览', level=2)
add_table(
    ['平台', '生文（元/次）', '生图（元/张）', '生视频（元/秒）', '积分汇率'],
    [
        ['本项目', '含于会员', '基础¥0.05 / 高端¥0.50', '2.0:¥0.00005 / 2.5:¥0.0005 / 可灵:¥0.001', '¥0.01/豆'],
        ['LibTV', '含于会员', '约¥0.006', 'Seedance2.0低至¥0.35', '约¥0.023/积分'],
        ['小云雀', '含于会员', '未公开', 'Lite:¥0.95 / Pro:¥2.38 / 2.5:¥2.47', '¥0.095/积分'],
        ['纳米AI', '含于会员', 'API¥0.07', 'Seedance2.0约¥1.33', '¥0.1/纳米币'],
        ['天工AI', '¥1.44-3.84', '约¥0.14', 'Wan3.0:¥0.05 / 2.5:¥0.40', '¥0.0048/积分'],
        ['万兴喵影', '¥0.40', '¥0.40', '图生视频¥0.12-3 / 文生¥0.55-7.4', '¥0.01/积分'],
    ],
    col_widths=[2, 2.5, 3, 4.5, 2.5]
)

add_heading('4.2 视频生成单价深度对比（核心发现）', level=2)
add_para('视频生成是AI短剧创作的核心成本项。以下为各平台主力模型的视频生成单价对比，以本项目seedance-2.5（¥0.0005/秒）为基准：', indent=True)
add_table(
    ['平台/模型', '单价（元/秒）', '10秒成本', '1分钟成本', 'vs本项目2.5差距', '备注'],
    [
        ['本项目 seedance-2.0', '¥0.00005', '¥0.0005', '¥0.003', '低10倍', '稳定经典'],
        ['本项目 seedance-2.5', '¥0.0005', '¥0.005', '¥0.03', '基准1倍', '新一代高质量'],
        ['本项目 可灵3.0', '¥0.001', '¥0.01', '¥0.06', '2倍', '顶级物理模拟'],
        ['天工 Wan 3.0', '¥0.05', '¥0.5', '¥3.0', '100倍', '竞品中最低'],
        ['LibTV Seedance2.0', '¥0.35', '¥3.5', '¥21.0', '700倍', '真人模式'],
        ['天工 Seedance2.5 720P', '¥0.40', '¥4.0', '¥24.0', '800倍', '4折价格战'],
        ['万兴喵影 图生视频', '¥0.12-3.0', '¥1.2-30', '¥7.2-180', '240-6000倍', '复杂度差异大'],
        ['小云雀 Lite', '¥0.95', '¥9.5', '¥57.0', '1900倍', '标准画质'],
        ['纳米AI Seedance2.0', '¥1.33', '¥13.3', '¥79.8', '2660倍', '15秒720P'],
        ['小云雀 Seedance2.5', '¥2.47', '¥24.7', '¥148.2', '4940倍', '30秒720P需780积分'],
    ],
    col_widths=[3.5, 2, 2, 2, 2.5, 2.5]
)

add_heading('4.3 核心结论', level=2)
add_para('本项目视频生成单价处于行业绝对低位。以seedance-2.5为例，本项目¥0.0005/秒，生成1分钟仅需3分钱；竞品中最低的天工Wan 3.0也要¥0.05/秒（贵100倍），最高的小云雀Seedance2.5达¥2.47/秒（贵4940倍）。', indent=True, bold=True, color=(200,134,26))
add_para('同样生成一条1分钟720P视频，本项目花费¥0.03，小云雀需¥148.2，差距近5000倍。极低的视频成本是本项目最核心的价格护城河，应作为定价页和营销页的第一卖点。', indent=True)

add_heading('4.4 会员档位与权益对比', level=2)
add_table(
    ['平台', '档位数', '入门月费', '月度积分', '并发', '有效期规则'],
    [
        ['本项目', '3档', '¥99', '9,900豆', '2-8', '会员积分到期清零；充值永久有效'],
        ['LibTV', '5档', '¥499/年', '1,800', '6-30', '年仅付；月度积分当月清零'],
        ['小云雀', '3档', '¥79', '830', '按档提速', '月/季/年付；积分当月有效'],
        ['纳米AI', '3档+', '¥39', '1,180算力', '标准/极速', '月卡/年卡；算力周期重置'],
        ['天工AI', '2档+免费', '¥45', '每日赠1200', '标准/优先', '月付；积分包长期有效'],
        ['万兴喵影', '3档+免费', '¥269/年', '赠3000+月4000', '无限制', '积分包1年；SVIP月赠当月清零'],
    ],
    col_widths=[2, 1.5, 2, 2.5, 2, 5]
)

doc.add_page_break()

# ==================== 五、启示与建议 ====================
add_heading('五、对本项目的启示与行动建议', level=1)

add_heading('5.1 定价与积分体系优化', level=2)
add_para('（1）增设入门档：参考纳米AI 39元、天工45元，新增49-69元轻量版，降低首单转化门槛。\n（2）突出永久有效："充值算力豆永不过期"是独家卖点，应在定价页首屏强化。\n（3）积分包阶梯定价：参考万兴喵影，推出1000/5000/10000豆充值包，大额包折扣。\n（4）月度任务奖励：参考天工每日赠积分，设置签到/分享任务赠豆，提升活跃度。', indent=True)

add_heading('5.2 盈利模式拓展', level=2)
add_para('（1）API企业服务：工作室版已含API，可单独推出按调用量计费的API套餐。\n（2）创作者激励：参考小云雀，上线作品分享/分销机制，优质创作者获现金或豆奖励。\n（3）商用授权溢价：参考LibTV高端档，为企业用户提供商用授权和品牌定制服务。\n（4）素材生态：参考万兴喵影，搭建剧本/分镜/音乐素材商城，抽成变现。', indent=True)

add_heading('5.3 竞争策略优先级', level=2)
add_table(
    ['优先级', '行动项', '具体做法', '预期效果'],
    [
        ['P0', '新增轻量入门档', '49-69元/月，含基础算力和1并发', '付费转化率提升30%+'],
        ['P1', '上线算力豆充值包', '三档充值包，大额8折，永久有效', 'ARPU值提升20%+'],
        ['P2', '强化视频低价卖点', '定价页首屏突出"1分钟视频3分钱"', '提升价格竞争力认知'],
        ['P3', 'API按量计费', '单独推出API调用套餐', '拓展B端收入'],
    ],
    col_widths=[1.5, 3, 6, 3.5]
)

# ==================== 六、总结 ====================
add_heading('六、总结', level=1)
add_heading('6.1 五家竞品积分体系的三大共性规律', level=2)
add_para('（1）混合收费是标配：会员订阅打底 + 积分消耗增量，无一例外。\n（2）过期焦虑促复购：会员积分当月清零是主流，充值积分设1年/长期有效期。\n（3）视频消耗是核心引擎：高消耗功能（视频生成）驱动积分包复购和会员升级。', indent=True)

add_heading('6.2 本项目的差异化优势', level=2)
add_para('（1）充值算力豆永久有效：六家中最宽松的政策，独家优势。\n（2）多模型聚合：seedance/HappyHorse/可灵/ChatGPT Images等多模型可选。\n（3）视频生成单价行业最低：seedance-2.5仅¥0.0005/秒，低于竞品100-4940倍。\n（4）生图价格极低：基础生图仅¥0.05/张，远低于万兴喵影¥0.40/张。', indent=True, bold=True, color=(200,134,26))

add_heading('6.3 立即行动项', level=2)
add_para('（1）新增49-69元轻量入门档（P0）；\n（2）上线三档算力豆充值包（P1）；\n（3）在定价页和营销页首屏突出"1分钟视频3分钱"的极致低价卖点；\n（4）中期布局API按量计费、创作者激励、商用授权、素材生态四位一体拓展。', indent=True)

# 保存
output_path = r'D:\phpstudy_pro\WWW\ai-novel-workstation1.2.0\ppt_research\AI短剧创作平台竞品积分收费与商业模式调研报告.docx'
doc.save(output_path)
print(f'DOCX saved to: {output_path}')
