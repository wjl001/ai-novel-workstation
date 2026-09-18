# -*- coding: utf-8 -*-
"""
敏感词过滤引擎（二期）产品方案 - Word文档生成脚本 V2
更新：三层过滤架构、商用API对比、白名单语境豁免方案（含具体案例）、新泳道图
"""
from docx import Document
from docx.shared import Inches, Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml.ns import qn, nsdecls
from docx.oxml import parse_xml
import os

OUT_DIR = r'D:\phpstudy_pro\WWW\ai-novel-workstation1.2.0\sensitive_word_v2'
IMG_ARCH = os.path.join(OUT_DIR, 'architecture.png')
IMG_FLOW = os.path.join(OUT_DIR, 'flowchart.png')
IMG_SWIM = os.path.join(OUT_DIR, 'swimlane.png')
IMG_SEQ = os.path.join(OUT_DIR, 'sequence.png')
OUTPUT = os.path.join(OUT_DIR, '敏感词过滤引擎二期产品方案_V3.docx')

C_DARK = RGBColor(0x1F, 0x4E, 0x79)
C_MID = RGBColor(0x2E, 0x75, 0xB6)
C_ACCENT = RGBColor(0xED, 0x7D, 0x31)
C_TEXT = RGBColor(0x26, 0x26, 0x26)
C_GRAY = RGBColor(0x7F, 0x7F, 0x7F)
C_WHITE = RGBColor(0xFF, 0xFF, 0xFF)
C_RED = RGBColor(0xC0, 0x00, 0x00)
C_GREEN = RGBColor(0x54, 0x82, 0x35)
FONT_NAME = '微软雅黑'


def set_run_font(run, size=11, bold=False, color=C_TEXT):
    run.font.name = FONT_NAME
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    rPr = run._element.get_or_add_rPr()
    rFonts = rPr.find(qn('w:rFonts'))
    if rFonts is None:
        rFonts = parse_xml(f'<w:rFonts {nsdecls("w")} w:eastAsia="{FONT_NAME}" w:ascii="{FONT_NAME}" w:hAnsi="{FONT_NAME}"/>')
        rPr.insert(0, rFonts)
    else:
        rFonts.set(qn('w:eastAsia'), FONT_NAME)
        rFonts.set(qn('w:ascii'), FONT_NAME)
        rFonts.set(qn('w:hAnsi'), FONT_NAME)


def add_para(doc, text='', size=11, bold=False, color=C_TEXT, align=WD_ALIGN_PARAGRAPH.LEFT,
              space_before=0, space_after=6, line_spacing=1.5, first_indent=0):
    p = doc.add_paragraph()
    p.alignment = align
    pf = p.paragraph_format
    pf.space_before = Pt(space_before)
    pf.space_after = Pt(space_after)
    pf.line_spacing = line_spacing
    if first_indent:
        pf.first_line_indent = Pt(first_indent)
    if text:
        run = p.add_run(text)
        set_run_font(run, size=size, bold=bold, color=color)
    return p


def add_heading1(doc, text):
    p = doc.add_paragraph()
    pf = p.paragraph_format
    pf.space_before = Pt(18)
    pf.space_after = Pt(10)
    pf.line_spacing = 1.3
    pPr = p._element.get_or_add_pPr()
    pBdr = parse_xml(f'<w:pBdr {nsdecls("w")}><w:left w:val="single" w:sz="18" w:space="8" w:color="1F4E79"/></w:pBdr>')
    pPr.append(pBdr)
    run = p.add_run(text)
    set_run_font(run, size=16, bold=True, color=C_DARK)
    return p


def add_heading2(doc, text):
    p = doc.add_paragraph()
    pf = p.paragraph_format
    pf.space_before = Pt(12)
    pf.space_after = Pt(6)
    pf.line_spacing = 1.3
    run = p.add_run(text)
    set_run_font(run, size=13, bold=True, color=C_MID)
    return p


def add_heading3(doc, text):
    p = doc.add_paragraph()
    pf = p.paragraph_format
    pf.space_before = Pt(8)
    pf.space_after = Pt(4)
    pf.line_spacing = 1.3
    run = p.add_run(text)
    set_run_font(run, size=11.5, bold=True, color=C_TEXT)
    return p


def add_bullet(doc, text, level=0, size=11):
    p = doc.add_paragraph()
    pf = p.paragraph_format
    pf.space_before = Pt(2)
    pf.space_after = Pt(2)
    pf.line_spacing = 1.5
    pf.left_indent = Pt(24 + level * 18)
    pf.first_line_indent = Pt(-12)
    bullet_char = '● ' if level == 0 else '○ '
    run = p.add_run(bullet_char + text)
    set_run_font(run, size=size, color=C_TEXT)
    return p


def add_image(doc, img_path, width_inches=6.2, caption=None):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    pf = p.paragraph_format
    pf.space_before = Pt(8)
    pf.space_after = Pt(4)
    run = p.add_run()
    run.add_picture(img_path, width=Inches(width_inches))
    if caption:
        cp = doc.add_paragraph()
        cp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        cpf = cp.paragraph_format
        cpf.space_before = Pt(2)
        cpf.space_after = Pt(10)
        crun = cp.add_run(caption)
        set_run_font(crun, size=9.5, color=C_GRAY)


def set_cell_shading(cell, color_hex):
    shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}" w:val="clear"/>')
    cell._tc.get_or_add_tcPr().append(shading)


def set_cell_text(cell, text, size=10, bold=False, color=C_TEXT, align=WD_ALIGN_PARAGRAPH.LEFT):
    cell.text = ''
    p = cell.paragraphs[0]
    p.alignment = align
    pf = p.paragraph_format
    pf.space_before = Pt(2)
    pf.space_after = Pt(2)
    pf.line_spacing = 1.3
    run = p.add_run(text)
    set_run_font(run, size=size, bold=bold, color=color)
    cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER


def add_table(doc, headers, rows, col_widths=None, header_color='1F4E79'):
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = 'Table Grid'
    for i, h in enumerate(headers):
        cell = table.rows[0].cells[i]
        set_cell_shading(cell, header_color)
        set_cell_text(cell, h, size=10.5, bold=True, color=C_WHITE, align=WD_ALIGN_PARAGRAPH.CENTER)
    for r_idx, row in enumerate(rows):
        for c_idx, val in enumerate(row):
            cell = table.rows[r_idx + 1].cells[c_idx]
            if r_idx % 2 == 1:
                set_cell_shading(cell, 'F2F7FB')
            set_cell_text(cell, str(val), size=10, color=C_TEXT)
    if col_widths:
        for i, w in enumerate(col_widths):
            for row in table.rows:
                row.cells[i].width = Cm(w)
    add_para(doc, '', size=6, space_after=4)
    return table


def add_page_break(doc):
    doc.add_page_break()


# ============================================================
doc = Document()
style = doc.styles['Normal']
style.font.name = FONT_NAME
style.font.size = Pt(11)
style.element.rPr.rFonts.set(qn('w:eastAsia'), FONT_NAME)

section = doc.sections[0]
section.page_width = Cm(21)
section.page_height = Cm(29.7)
section.top_margin = Cm(2.5)
section.bottom_margin = Cm(2.5)
section.left_margin = Cm(2.8)
section.right_margin = Cm(2.8)

# ==================== 封面 ====================
for _ in range(4):
    add_para(doc, '', size=11)
add_para(doc, '敏感词过滤引擎（二期）', size=28, bold=True, color=C_DARK,
         align=WD_ALIGN_PARAGRAPH.CENTER, space_after=8, line_spacing=1.2)
add_para(doc, '产品方案', size=24, bold=True, color=C_MID,
         align=WD_ALIGN_PARAGRAPH.CENTER, space_after=20, line_spacing=1.2)
p_line = doc.add_paragraph()
p_line.alignment = WD_ALIGN_PARAGRAPH.CENTER
run_line = p_line.add_run('━' * 30)
set_run_font(run_line, size=14, color=C_ACCENT)
add_para(doc, '', size=11)
add_para(doc, '三层过滤流水线  ·  前置+后置双审核  ·  白名单语境豁免', size=14, color=C_GRAY,
         align=WD_ALIGN_PARAGRAPH.CENTER, space_after=30, line_spacing=1.5)
for _ in range(6):
    add_para(doc, '', size=11)
info_table = doc.add_table(rows=4, cols=2)
info_table.alignment = WD_TABLE_ALIGNMENT.CENTER
info_data = [
    ('文档版本', 'V2.0'),
    ('文档类型', '产品方案（领导汇报版）'),
    ('编制日期', '2026年9月'),
    ('密级等级', '内部公开'),
]
for i, (k, v) in enumerate(info_data):
    set_cell_text(info_table.rows[i].cells[0], k, size=11, bold=True, color=C_DARK, align=WD_ALIGN_PARAGRAPH.RIGHT)
    set_cell_text(info_table.rows[i].cells[1], v, size=11, color=C_TEXT)
    info_table.rows[i].cells[0].width = Cm(4)
    info_table.rows[i].cells[1].width = Cm(8)
add_page_break(doc)

# ==================== 一、项目概述 ====================
add_heading1(doc, '一、项目概述')
add_heading2(doc, '1.1 项目背景')
add_para(doc, '模型平台采用"平台转发请求到外部厂商大模型"的架构，需要在请求阶段前置过滤用户Prompt、在返回阶段后置过滤模型输出结果。现有敏感词过滤系统（一期）仅采用精确字符串匹配，只能命中完全一致的词汇，无法应对变形、谐音、拆分、异体、语义规避等对抗性内容。', first_indent=22)
add_para(doc, '产品需求大概率包含：同音字/形近字/拆字/插符号规避（如"敏 @感""敏 感""敏 gan"）、变体缩写黑话网络代称、以及语义层面违规（句子本身无敏感词但整句意图违规）。同时需兼顾误判率、高并发性能、可运维性、合规留痕、旁路/阻断双模式。', first_indent=22)
add_para(doc, '核心结论：精确匹配只能做基础兜底；完整需求需搭建"多层级流水线"，从低成本规则层→轻量文本分类模型→可选语义大模型审核，分层拦截、控制成本。', first_indent=22, bold=True, color=C_ACCENT)

add_heading2(doc, '1.2 项目目标')
add_bullet(doc, '精准风控：解决"一刀切"误封问题，同时识别组合违规和语义违规，保障合规底线；')
add_bullet(doc, '降低客诉：减少正常词汇被误判，目标误杀率下降60%以上；')
add_bullet(doc, '合规深化：满足更深层次内容安全审核标准，规避隐晦违规生成风险；')
add_bullet(doc, '体系建设：建立三层过滤流水线+精细化词库标签体系，支撑多场景灵活运营。')

add_heading2(doc, '1.3 核心价值')
add_table(doc,
    ['价值维度', '一期现状', '二期目标', '衡量指标'],
    [
        ['风控精准度', '仅精确匹配，无法识别变形/语义违规', '三层流水线，规则+语义+大模型兜底', '违规漏检率下降50%'],
        ['用户体验', '正常词汇机械拦截，创作受阻', '白名单语境豁免，专业内容正常通行', '误杀率下降60%'],
        ['运营效率', '词库维护粗放，调整周期长', '标签化词库+可视化配置，分钟级生效', '词库更新效率提升80%'],
        ['成本控制', '无差别全量审核', '分层拦截，高成本大模型仅复核中风险', '审核成本下降40%'],
    ],
    col_widths=[2.8, 4.0, 4.2, 3.5])
add_page_break(doc)

# ==================== 二、一期现状与痛点分析 ====================
add_heading1(doc, '二、一期现状与痛点分析')
add_heading2(doc, '2.1 一期能力回顾')
add_para(doc, '一期系统仅具备基础精确字符串匹配能力：对用户输入文本执行 contains(敏感词) 检查，命中即拦截。词库为人工维护的原始敏感词列表，无变体、无语义、无组合规则。', first_indent=22)

add_heading2(doc, '2.2 核心痛点')
add_heading3(doc, '痛点一：字符变形类规避完全失效（漏检）')
add_para(doc, '用户通过插符号、空格、谐音、拆字、形近字、拼音等方式轻松绕过精确匹配。例如"敏 @感""敏 感""敏 gan""㥍感"等变体，一期系统完全无法识别，违规内容大量漏检。', first_indent=22)

add_heading3(doc, '痛点二：语义层面违规无法识别（漏检）')
add_para(doc, '句子本身不包含任何敏感词，但整句话表达违规意图（如诱导、隐喻、暗语）。精确匹配完全解决不了这类问题，是内容安全的最大盲区。', first_indent=22)

add_heading3(doc, '痛点三：专业语境机械误杀（体验问题）')
add_para(doc, '部分词汇在通用词库中标记为违规，但在专业领域、文学创作、固定搭配中属于正常用法。一期系统不区分语境，一律拦截，导致正常用户创作受阻。典型案例如"胸口射箭""狭小逼仄"等文学描写被误判。', first_indent=22)

add_heading3(doc, '痛点四：词库管理粗放（运营低效）')
add_para(doc, '词库缺乏标签体系，仅按大类划分，无法按场景/领域/语境灵活配置。新增规则需技术介入，运营周期长，无法快速响应热点事件和新型变体。', first_indent=22)

add_heading2(doc, '2.3 对抗性规避类型统计')
add_table(doc,
    ['规避类型', '典型示例', '一期处理', '二期应对层', '占比预估'],
    [
        ['插符号/空格', '敏@感、敏 感、敏*感', '漏检', '第一层：归一化+AC自动机', '30%'],
        ['谐音/拼音', '敏gan、闽感、敏敢', '漏检', '第一层：拼音映射+变体词库', '22%'],
        ['拆字/形近字', '每攵感、㥍感、慜感', '漏检', '第一层：形近字映射+模糊匹配', '18%'],
        ['变体/黑话/代称', '网络新造词、缩写代称', '漏检', '第二层：轻量语义模型识别', '15%'],
        ['语义规避', '无敏感词但意图违规', '完全漏检', '第二层+第三层：语义模型+大模型复核', '15%'],
    ],
    col_widths=[2.2, 3.5, 1.8, 4.0, 1.8])
add_page_break(doc)

# ==================== 三、二期核心功能设计 ====================
add_heading1(doc, '三、二期核心功能设计')

add_heading2(doc, '3.1 整体架构：三层过滤流水线')
add_para(doc, '二期采用"分层渐进拦截"架构，从低成本到高成本依次部署三层过滤，每层拦截后剩余流量进入下一层，既保障安全又控制成本：', first_indent=22)
add_table(doc,
    ['层级', '名称', '核心能力', '性能', '成本', '定位'],
    [
        ['第一层', '增强规则引擎', 'AC自动机+文本归一化+组合规则', '毫秒级，极高并发', '极低', '第一道关卡，挡掉字符变形类攻击'],
        ['第二层', '轻量语义分类模型', '开源小模型多标签分类+风险评分', '几十ms，高并发', '低', '核心层，解决语义违规，算力可控'],
        ['第三层', '审核大模型（可选）', '意图理解+隐喻暗语识别+理由输出', '秒级，低并发', '高', '兜底层，仅复核中风险样本，不全量'],
    ],
    col_widths=[1.5, 2.8, 4.0, 2.2, 1.2, 3.5])
add_para(doc, '设计原则：精确匹配做基础兜底→规则引擎挡变形→语义模型抓意图→大模型复核疑难，分层拦截、逐级收紧、成本可控。', first_indent=22, bold=True, color=C_ACCENT)

# ---- 第一层 ----
add_heading2(doc, '3.2 第一层：增强规则引擎（AC自动机）')
add_heading3(doc, '3.2.1 定位与价值')
add_para(doc, '在原有精确匹配基础上升级，快速拦截字符变形类敏感内容，性能极高（毫秒级），适合高并发接口，作为第一道关卡。成本最低，优先落地。', first_indent=22)

add_heading3(doc, '3.2.2 文本预处理（归一化）')
add_para(doc, '对原始文本生成归一化副本（仅用于审核匹配，原始文本原样保存留痕，绝不篡改用户输入）：', first_indent=22)
add_bullet(doc, '剔除干扰字符：空格、特殊符号@#$%*、零宽字符、emoji；')
add_bullet(doc, '简体/繁体转换；形近字映射（如"㥍"→"感"、"慜"→"敏"）；')
add_bullet(doc, '拼音、拼音首字母转汉字映射（如"min gan"→"敏感"）；')
add_bullet(doc, '统一大小写，去除换行。')
add_para(doc, '⚠ 关键约束：预处理只用于审核匹配，原始文本必须原样保存留痕，不能修改后传给大模型。', first_indent=22, bold=True, color=C_RED)

add_heading3(doc, '3.2.3 AC自动机多模式匹配')
add_para(doc, '算法选型：AC自动机（Aho-Corasick），适合大批量敏感词同时扫描，性能远高于循环 contains。词库不再只是原始敏感词，人工维护变体词、谐音词、拆字词、缩写。支持部分匹配、最短匹配，命中后返回位置和命中词。', first_indent=22)

add_heading3(doc, '3.2.4 组合规则（关键词同现）')
add_para(doc, '单个词安全，但多个词同时出现即触发风险。支持配置"词A AND 词B"同现规则，例如前缀词+核心词组合（"打倒"+"共产党"）。规则可配置位置约束（同句、间隔≤N字、相邻）。', first_indent=22)

add_heading3(doc, '3.2.5 优缺点与适用场景')
add_table(doc,
    ['维度', '说明'],
    [
        ['优点', '速度快、可解释、可审计、容易人工调词库；毫秒级响应，支撑高并发'],
        ['缺点', '解决不了语义规避；用户换一种隐晦说法，不出现任何敏感词变体，规则完全识别不出'],
        ['适用场景', '拦截字符规避类内容，作为第一道过滤，低成本挡掉大部分简单攻击（约60%-70%违规）'],
    ],
    col_widths=[2.0, 12.0])

# ---- 第二层 ----
add_heading2(doc, '3.3 第二层：轻量内容安全分类模型（开源免费）')
add_heading3(doc, '3.3.1 定位与价值')
add_para(doc, '规则放行之后，送入轻量审核模型，判断整段文本语义是否违规。不需要大模型推理，算力可控，是解决语义风险的核心层。', first_indent=22)

add_heading3(doc, '3.3.2 选型方案：开源小模型（推荐，免费）')
add_bullet(doc, '模型选型：中文内容安全/文本风控分类模型，如 ERNIE 文本分类模型、RoBERTa 微调内容安全数据集；')
add_bullet(doc, '输出：多标签分类（暴力/涉政/色情/广告/辱骂等）+ 风险分数（0~1）；')
add_bullet(doc, '推理性能：单条文本几十ms，可部署在平台内部，数据不出服务；')
add_bullet(doc, '训练方式：基于公开中文安全数据集 + 业务积累的正负样本（Prompt/模型返回样本）做微调；')
add_bullet(doc, '使用策略：设置阈值，高分直接阻断，中低分人工复核，低分放行。')

add_heading3(doc, '3.3.3 备选方案：商用内容安全API（快速落地）')
add_para(doc, '阿里云/腾讯云/百度内容安全文本审核接口，内部已封装规则+语义模型，适合不想维护AI模型、快速上线的场景。但文本需传给第三方，需评估数据合规风险。三家对比如下：', first_indent=22)
add_table(doc,
    ['对比维度', '阿里云内容安全', '腾讯云内容安全（TMS）', '百度内容安全（TextCensor）'],
    [
        ['核心能力', '文本反垃圾、关键词检测、语义向量审核', '文本恶意检测、关键词过滤、语义识别', '文本审核、关键词命中、多维度语义分类'],
        ['违规类别', '涉政/暴恐/色情/辱骂/广告/引流等', '违法/色情/辱骂/广告/政治敏感等', '违禁/色情/暴力/政治/广告/辱骂等'],
        ['返回结构', '标签+分数+命中关键词', '标签+分数+建议处置', '标签+分数+命中详情'],
        ['计费方式', '按调用量计费，有免费额度', '按调用量计费，新用户免费额度', '按调用量计费，有免费测试额度'],
        ['数据合规', '文本上传阿里云，需签DPA', '文本上传腾讯云，需签DPA', '文本上传百度云，需签DPA'],
        ['适用场景', '快速试点、评估语义能力', '快速上线、腾讯生态集成', '百度生态、中文语义较强'],
        ['建议', '备选，用于快速验证语义效果', '备选，生态友好', '备选，中文语义识别强'],
    ],
    col_widths=[2.0, 3.8, 3.8, 3.8])
add_para(doc, '⚠ 关键区分：前置审核（用户输入Prompt）和后置审核（外部大模型返回内容）样本分布不一样，必须单独调阈值。', first_indent=22, bold=True, color=C_RED)

# ---- 第三层 ----
add_heading2(doc, '3.4 第三层：审核大模型（可选兜底，小流量）')
add_heading3(doc, '3.4.1 定位与价值')
add_para(doc, '只给中风险样本做深度复核，不全量调用（成本高、延迟高、并发扛不住）。轻量模型输出"可疑中风险"的文本，再调用审核专用大模型做意图理解和理由输出。', first_indent=22)

add_heading3(doc, '3.4.2 核心能力')
add_bullet(doc, '意图理解：识别改写、隐喻、暗语、多层委婉暗示等高级对抗内容；')
add_bullet(doc, '理由输出：输出判定违规的具体原因，方便人工审计和复核；')
add_bullet(doc, '上下文推理：结合多轮对话上下文判断意图，弥补单句模型的不足。')

add_heading3(doc, '3.4.3 使用约束')
add_para(doc, '不建议全量流量走大模型审核——并发扛不住，成本爆炸。仅作为中风险样本的兜底复核，预计调用量占总流量的5%-10%。', first_indent=22, bold=True, color=C_ACCENT)

# ---- 白名单语境豁免方案 ----
add_heading2(doc, '3.5 白名单语境豁免方案')
add_heading3(doc, '3.5.1 豁免机制概述')
add_para(doc, '反向语境豁免支持配置特定语境下的白名单，当某词在通用词库中为违规词，但在特定专业段落、固定搭配、文学创作或正面表述中出现时，判定为合规并放行。从根本上解决"一刀切"式误杀。', first_indent=22)

add_heading3(doc, '3.5.2 白名单类型体系')
add_table(doc,
    ['白名单类型', '适用场景', '匹配方式', '配置示例'],
    [
        ['固定搭配白名单', '成语、典故、常用短语、文学描写', '精确短语匹配', '"狭小逼仄""胸口射箭""干脆挂掉"'],
        ['专业领域白名单', '医疗、法律、金融、学术讨论', '领域标签+词汇匹配', '医学论文中的专业术语、法律条文引用'],
        ['文学创作白名单', '小说、剧本、故事等创意写作场景', '场景标签+词性分析', 'scene=creative_writing 时放宽暴力描写词'],
        ['正面表述白名单', '批判、反对违规行为的正面内容', '语义方向判定', '"我们坚决反对XXX""严厉打击XXX"'],
        ['引用标注白名单', '引用文献、新闻、法规、历史资料', '上下文标记匹配', '带引用标记的原文摘录、历史研究表述'],
    ],
    col_widths=[2.5, 3.5, 3.0, 4.5])

add_heading3(doc, '3.5.3 典型案例分析：文学描写误杀豁免')
add_para(doc, '以用户反馈的典型误杀案例为例，原文为一段小说描写："胸口射箭，狭小逼仄，电话被干脆挂掉"。一期系统可能因命中"射""逼""挂"等字而机械拦截，二期通过多层豁免机制精准放行：', first_indent=22)

add_table(doc,
    ['片段', '一期误判原因', '二期豁免策略', '豁免类型', '判定结果'],
    [
        ['胸口射箭', '"射"字可能触发暴力词规则', '①scene=creative_writing场景标签豁免；②"胸口射箭"为固定描写短语，加入固定搭配白名单；③词性分析：描写性陈述而非指令性表述', '文学创作白名单+固定搭配白名单', '豁免放行'],
        ['狭小逼仄', '"逼"字触发敏感词规则', '①"狭小逼仄"为汉语固定成语，形容空间狭窄，整体加入固定搭配白名单；②专业词典验证："逼仄"为正规书面语', '固定搭配白名单', '豁免放行'],
        ['电话被干脆挂掉', '"挂"字在某些语境指死亡，可能触发规则', '①上下文分析：前文为"电话"，明确是通话场景，非死亡隐喻；②"干脆挂掉"为日常口语固定搭配', '上下文窗口豁免+固定搭配白名单', '豁免放行'],
    ],
    col_widths=[2.0, 2.8, 4.5, 2.5, 1.7])

add_heading3(doc, '3.5.4 豁免判定流程')
add_bullet(doc, '第一步：基础词库或组合规则命中违规词后，不立即拦截，进入白名单校验环节；')
add_bullet(doc, '第二步：检查命中词汇是否属于固定搭配白名单（精确短语匹配）；')
add_bullet(doc, '第三步：检查当前请求场景标签（scene参数），如creative_writing/medical/legal等，匹配领域白名单；')
add_bullet(doc, '第四步：词性与句法分析，区分"描写性陈述"与"指令性表述"，描写性内容优先豁免；')
add_bullet(doc, '第五步：上下文窗口分析，结合前后文判断真实语义（如"电话"上下文排除"挂"的死亡隐喻）；')
add_bullet(doc, '第六步：满足任一豁免条件即放行，记录豁免类型和原因；不满足则维持违规判定，进入风险分级。')

add_heading3(doc, '3.5.5 白名单管理要求')
add_bullet(doc, '白名单变更需双人审核，防止恶意添加导致漏检；')
add_bullet(doc, '所有豁免判定记录日志，包含命中词、豁免类型、上下文摘要，供审计复盘；')
add_bullet(doc, '白名单设置有效期，定期复审清理无效白名单；')
add_bullet(doc, '白名单与词库版本联动，词库变更时自动校验白名单有效性。')

# ---- 词库标签体系 ----
add_heading2(doc, '3.6 精细化词库标签体系')
add_para(doc, '每个词汇可挂载多个标签，支持按标签组合灵活配置和查询：', first_indent=22)
add_table(doc,
    ['标签维度', '标签取值示例', '用途说明'],
    [
        ['违规类别', '政治敏感/色情/暴力/辱骂/其他', '基础分类，决定拦截策略'],
        ['风险等级', '高风险/中风险/低风险', '决定拦截/复审/放行路径'],
        ['适用场景', '对话/创作/审核/全场景', '按业务场景差异化配置'],
        ['领域标签', '通用/医疗/法律/金融/教育/文学', '支撑专业领域白名单豁免'],
        ['词型标签', '精确词/组合前缀/组合核心/白名单词/变体词', '标识词汇在匹配引擎中的角色'],
        ['来源标签', '人工录入/审核回流/热点同步/第三方', '追溯词汇来源，支撑质量评估'],
        ['时效标签', '永久/临时（含起止时间）', '支持热点事件词自动过期'],
    ],
    col_widths=[2.2, 5.0, 6.5])

add_heading2(doc, '3.7 匹配算法与性能保障')
add_table(doc,
    ['性能指标', '一期水平', '二期目标', '保障措施'],
    [
        ['单次过滤延迟', 'P99 ≤ 20ms（仅精确匹配）', 'P99 ≤ 100ms（规则+语义）', '多级缓存+AC自动机+模型推理优化'],
        ['规则匹配吞吐', '5000 QPS', '10000 QPS', 'AC自动机线性时间复杂度+无状态水平扩展'],
        ['语义模型吞吐', '不支持', '2000 QPS', '批量推理+GPU加速+模型蒸馏'],
        ['组合规则匹配', '不支持', '支持万级规则', '前缀索引+倒排链+位置剪枝'],
        ['白名单校验', '不支持', '毫秒级完成', '短语索引+领域标签预过滤'],
    ],
    col_widths=[2.8, 3.0, 3.0, 5.0])
add_page_break(doc)

# ==================== 四、产品架构设计 ====================
add_heading1(doc, '四、产品架构设计')
add_para(doc, '二期产品采用四层分层架构设计，自下而上为数据存储层、词库管理层、过滤引擎核心层和接入层，右侧配套运营管理后台。过滤引擎核心层内部实现三层过滤流水线（规则→语义→大模型）。', first_indent=22)
add_image(doc, IMG_ARCH, width_inches=6.2, caption='图4-1 敏感词过滤引擎（二期）产品架构图')

add_heading2(doc, '4.1 接入层')
add_para(doc, '对接模型平台各类业务场景，包括对话生成接口、文本创作接口、内容审核接口及第三方API接入。统一转发至过滤引擎核心层。', first_indent=22)

add_heading2(doc, '4.2 过滤引擎核心层')
add_para(doc, '核心层内部实现三层过滤流水线，包含五大匹配模块和三大支撑模块：', first_indent=22)
add_bullet(doc, '文本预处理：分词、归一化、去噪，为后续匹配提供标准化输入（原始文本不动）；')
add_bullet(doc, '基础词库匹配（第一层-规则）：AC自动机+精确/模糊匹配，兼容一期能力；')
add_bullet(doc, '组合词匹配引擎（第一层-规则）：扫描"前缀+核心词"组合规则，支持位置约束；')
add_bullet(doc, '白名单反向排除：检查豁免语境/固定搭配/场景标签，实现精准放行；')
add_bullet(doc, '轻量语义模型（第二层）：开源小模型多标签分类+风险评分，解决语义违规；')
add_bullet(doc, '审核大模型（第三层，可选）：中风险样本深度复核，意图理解+理由输出；')
add_bullet(doc, '风险分级决策器：综合所有匹配结果，输出放行/拦截/人工复审决策；')
add_bullet(doc, '命中日志与上下文追踪：记录完整匹配路径和词库版本，支撑审计复盘；')
add_bullet(doc, '实时性能监控：监控延迟、命中率、误杀率等核心指标，异常告警。')

add_heading2(doc, '4.3 词库管理层')
add_para(doc, '管理五大类词库，全部挂载精细化标签体系：通用违规词库、组合规则词库、白名单词库、行业专属词库、动态更新词库。', first_indent=22)

add_heading2(doc, '4.4 数据存储层')
add_para(doc, 'Redis热词缓存（毫秒级）、MySQL词库配置（持久化+版本管理）、Elasticsearch命中日志（全文检索+统计）、对象存储审计归档（长期合规留存）。', first_indent=22)

add_heading2(doc, '4.5 架构集成建议')
add_bullet(doc, '独立服务：单独拆一个内容安全审核服务，提供接口 text_scan(text, scan_type: prompt/response)，模型平台作为调用方；')
add_bullet(doc, '解耦：模型平台业务逻辑和审核逻辑分离，方便独立扩容、版本迭代；')
add_bullet(doc, '熔断降级：审核服务异常时，可配置降级策略（旁路记录，不阻断），避免整个模型平台雪崩。')
add_page_break(doc)

# ==================== 五、核心业务流程 ====================
add_heading1(doc, '五、核心业务流程')
add_para(doc, '二期核心业务流程实现"前置Prompt审核+后置Response审核"双环节，每个环节均跑通三层过滤流水线，确保既不漏检组合违规和语义违规，也不误杀合规内容。', first_indent=22)
add_image(doc, IMG_FLOW, width_inches=6.2, caption='图5-1 敏感词过滤核心业务流程图')

add_heading2(doc, '5.1 完整流水线串联（生产流程）')
add_bullet(doc, '步骤1-留痕：原始文本（用户Prompt/模型输出）落日志，合规审计必须；')
add_bullet(doc, '步骤2-预处理：生成归一化文本（仅用于审核，原始文本不动）；')
add_bullet(doc, '步骤3-第一层规则匹配：AC自动机增强敏感词匹配，命中高风险词→直接阻断；未命中→进入下一级；')
add_bullet(doc, '步骤4-第二层语义模型：轻量分类模型输出风险标签+分数，高风险→阻断，中风险→人工审核/大模型复核，低风险→放行；')
add_bullet(doc, '步骤5-第三层大模型复核（可选）：中风险样本调用审核大模型做深度意图理解，输出最终判定和理由。')

add_heading2(doc, '5.2 双环节审核')
add_heading3(doc, '① 请求阶段（Prompt前置审核）')
add_para(doc, '用户输入Prompt先跑一遍流水线，不通过直接拒绝调用外部大模型——既保障合规，又节省外部模型调用额度。高风险直接阻断，不浪费外部厂商调用成本。', first_indent=22)

add_heading3(doc, '② 返回阶段（Response后置审核）')
add_para(doc, '拿到外部厂商模型返回结果后，再次跑一遍流水线，过滤模型输出违规内容，再返回前端。外部厂商返回的内容也可能违规，必须双端审核。', first_indent=22)

add_heading2(doc, '5.3 流程关键设计点')
add_table(doc,
    ['设计点', '设计思路', '解决的问题'],
    [
        ['三层渐进拦截', '规则→语义→大模型，低成本层先挡，高成本层兜底', '平衡安全与成本，大模型仅复核5%-10%流量'],
        ['双环节审核', 'Prompt前置+Response后置，两端都跑流水线', '防止用户输入违规和模型输出违规'],
        ['命中先校验后拦截', '所有命中均经过白名单校验再决定是否拦截', '从根源减少误杀，保护正常创作'],
        ['风险三级分流', '高风险拦截/中风险复审/低风险放行', '平衡安全与效率，减少人工压力'],
        ['全链路日志', '记录原始文本、归一化文本、各阶段命中、风险分数、处置动作', '满足合规追溯，支撑持续优化'],
        ['复审结果回流', '人工复审结论自动更新词库规则和白名单', '形成运营闭环，持续提升精准度'],
        ['旁路/阻断双模式', '上线初期旁路观测，稳定后切换阻断', '灰度上线，降低风险'],
    ],
    col_widths=[2.5, 5.5, 5.5])
add_page_break(doc)

# ==================== 六、角色协作与职责划分 ====================
add_heading1(doc, '六、角色协作与职责划分')
add_para(doc, '二期系统涉及七个核心角色的协同配合，从用户请求发起到Prompt前置审核、外部大模型调用、Response后置审核，再到运营闭环，各角色职责清晰、链路可追溯。', first_indent=22)
add_image(doc, IMG_SWIM, width_inches=6.5, caption='图6-1 敏感词过滤系统角色泳道图（前置+后置双审核·三层流水线）')

add_heading2(doc, '6.1 角色职责说明')
add_table(doc,
    ['角色', '核心职责', '关键动作'],
    [
        ['用户/前端', '提交创作内容，接收过滤结果', '提交Prompt请求、展示拦截/放行结果、用户反馈'],
        ['模型平台', '业务逻辑编排，调用审核服务和外部大模型', '接收请求→调用前置审核→转发外部模型→调用后置审核→返回结果'],
        ['内容安全审核服务', '执行三层过滤流水线核心逻辑', '文本预处理→AC规则匹配→轻量语义模型→大模型复核→风险分级→白名单校验'],
        ['词库与模型管理', '提供词库数据查询与配置管理', '词库查询、标签检索、规则配置、版本管理、热词缓存同步、模型版本管理'],
        ['审核运营团队', '人工复审与词库运营维护', '中风险内容复审、词库规则配置、白名单维护、热点词同步、模型样本标注'],
        ['外部大模型厂商', '提供大模型推理服务', '接收Prompt→大模型推理→生成返回内容'],
        ['数据存储/审计', '数据持久化与全链路日志', '词库配置存储、命中日志写入、原始文本留痕、审计归档、统计分析'],
    ],
    col_widths=[2.2, 4.5, 6.8])

add_heading2(doc, '6.2 协作流程要点')
add_bullet(doc, 'Prompt前置审核：用户提交→模型平台调用审核服务→审核服务跑三层流水线→高风险直接阻断（不调用外部模型，省钱）→低风险通过转发外部大模型；')
add_bullet(doc, '大模型调用：模型平台转发Prompt至外部厂商→大模型推理生成返回内容→返回模型平台；')
add_bullet(doc, 'Response后置审核：模型平台接收返回→调用审核服务（后置）→再次跑三层流水线→通过则返回用户，不通过则返回违规提示；')
add_bullet(doc, '运营闭环：中风险样本推送审核运营团队人工复核→复核结论回流更新词库规则和白名单→热更新即时生效→全链路日志持久化存储。')

add_heading2(doc, '6.3 系统交互时序')
add_para(doc, '下图展示从用户提交Prompt到最终返回结果的完整交互时序，涵盖Prompt前置审核、外部大模型调用、Response后置审核三个核心环节，以及高风险阻断分支和异步留痕操作。', first_indent=22)
add_image(doc, IMG_SEQ, width_inches=6.2, caption='图6-2 敏感词过滤系统时序图（Prompt前置审核→大模型调用→Response后置审核）')
add_para(doc, '时序关键节点说明：', first_indent=22, bold=True)
add_bullet(doc, '步骤1-7：Prompt前置审核，模型平台调用审核服务执行三层流水线，高风险直接返回违规提示（不调用外部模型，节省调用成本）；')
add_bullet(doc, '步骤8-10：低风险通过后，模型平台转发Prompt至外部大模型厂商，等待推理生成返回内容；')
add_bullet(doc, '步骤11-16：Response后置审核，对外部大模型返回内容再次执行三层流水线审核，确保输出合规；')
add_bullet(doc, '步骤17：后置审核通过后，将最终结果返回用户端；如不通过则返回违规提示；')
add_bullet(doc, '异步操作：步骤6和步骤15为异步留痕，不阻塞主流程，原始文本和命中记录持久化到数据存储层。')
add_page_break(doc)

# ==================== 七、实施计划与里程碑 ====================
add_heading1(doc, '七、实施计划与里程碑')
add_heading2(doc, '7.1 分阶段落地规划')
add_table(doc,
    ['阶段', '时间周期', '核心内容', '交付物', '审核模式'],
    [
        ['阶段一', '第1-2周', '精确匹配升级为AC自动机+文本归一化预处理+词库后台管理', '规则引擎服务、词库管理后台', '旁路模式'],
        ['阶段二', '第3-5周', '接入轻量语义分类模型；完善分级处置、人工复核队列；规则+语义双引擎', '语义模型服务、审核队列、灰度阻断', '灰度阻断'],
        ['阶段三', '第6-8周', '中风险样本小流量兜底大模型复核；样本回流持续微调模型；全量切换阻断模式', '大模型复核模块、运营闭环', '全量阻断'],
        ['阶段四', '持续迭代', '样本回流持续微调语义模型、扩充敏感词库和白名单；性能优化', '持续运营优化', '全量阻断'],
    ],
    col_widths=[1.5, 2.0, 4.5, 3.5, 2.0])

add_heading2(doc, '7.2 关键里程碑')
add_bullet(doc, 'M1（第2周末）：完成AC自动机+归一化规则引擎上线，旁路模式收集命中数据；')
add_bullet(doc, 'M2（第5周末）：轻量语义模型接入，规则+语义双引擎灰度运行，开始切换阻断模式；')
add_bullet(doc, 'M3（第8周末）：大模型复核模块上线，全量切换阻断模式，运营闭环跑通；')
add_bullet(doc, 'M4（持续）：指标达标验收，进入持续迭代运营阶段。')

add_heading2(doc, '7.3 方案对比与选型')
add_table(doc,
    ['方案', '开发量', '性能', '能力', '适合阶段'],
    [
        ['仅精确匹配', '极低', '极高', '只能匹配完全相同词', '当前现状，仅兜底'],
        ['AC自动机+归一化规则引擎', '低', '极高', '解决变形、拆字、谐音规避', '第一阶段（1-2周可上线）'],
        ['规则+自研轻量分类模型', '中', '高', '规则+语义理解，解决大部分违规语义', '第二阶段，核心能力'],
        ['规则+轻量模型+商用安全API', '低', '中', '快速获得语义能力，但数据外发', '快速试点，评估数据合规风险'],
        ['全量大模型审核', '高', '低，成本高', '强语义，不适合全流量', '只做可疑样本兜底复核'],
    ],
    col_widths=[3.5, 1.5, 1.5, 4.0, 3.5])
add_page_break(doc)

# ==================== 八、预期收益与风险评估 ====================
add_heading1(doc, '八、预期收益与风险评估')
add_heading2(doc, '8.1 预期收益')
add_table(doc,
    ['收益指标', '当前基线', '二期目标', '测算依据'],
    [
        ['规则漏判率', '变形敏感词未命中比例约30%', '< 2%', '归一化+AC自动机+变体词库覆盖'],
        ['语义误判率', '正常文本被判定违规比例约8%', '< 3%', '白名单语境豁免+阈值调优'],
        ['语义漏判率', '违规文本判定为正常比例约15%', '< 5%', '轻量语义模型+大模型复核兜底'],
        ['用户投诉量', '月均X件', '下降60%', '误杀减少直接降低投诉量'],
        ['审核接口延迟', '仅规则匹配P99<20ms', '规则+语义P99<100ms', '多级缓存+模型推理优化'],
        ['外部模型调用成本', '全量调用', '高风险Prompt直接阻断，节省10%-15%调用', '前置审核命中即不调用外部模型'],
    ],
    col_widths=[2.5, 3.0, 2.8, 5.0])

add_heading2(doc, '8.2 风险评估与应对')
add_table(doc,
    ['风险类别', '风险描述', '影响等级', '应对措施'],
    [
        ['规则配置风险', '组合规则或白名单配置不当，导致漏检或误杀', '高', '建立规则审批流程，双人审核；灰度验证后全量生效'],
        ['语义模型风险', '语义模型准确率不足，阈值调优周期长', '中', '开源模型+业务样本微调；设置置信度阈值，低置信度走人工复审'],
        ['性能风险', '新增语义模型导致过滤延迟上升，影响高并发', '中', '模型蒸馏+批量推理+GPU加速；压测达标后上线；预留降级开关'],
        ['数据合规风险', '商用API方案需将文本外发第三方', '中', '优先自研开源模型，数据不出平台；如用商用API需签DPA并评估'],
        ['大模型成本风险', '第三层大模型复核调用量超预期，成本爆炸', '中', '严格控制仅中风险样本调用，预计占比5%-10%；设置调用量上限告警'],
        ['上线风险', '新引擎上线影响存量业务稳定性', '高', '灰度发布，按流量比例逐步放量；一键回滚开关；上线期间7×24小时监控'],
        ['词库质量风险', '初始词库和白名单覆盖不全，影响二期效果', '中', '运营团队提前启动词库梳理；上线后持续根据复审结果优化'],
    ],
    col_widths=[2.0, 4.5, 1.5, 5.5])

add_heading2(doc, '8.3 能力边界说明（必须同步产品）')
add_bullet(doc, '无法100%拦截所有违规内容：对抗性内容（隐喻、暗语、多层委婉暗示、上下文强推理）属于持续对抗场景，会存在漏判，任何方案都无法做到零漏判；')
add_bullet(doc, '语义模型存在误判概率：依靠阈值控制，调高阈值减少误杀会增加漏杀，反之亦然，需要业务侧接受一定人工复核量，灰度调参；')
add_bullet(doc, '规则引擎只能识别字符层面变形，不能理解语义：如果文本没有任何敏感词变体，只是隐晦表达违规意图，规则无法识别，必须依赖语义模型；')
add_bullet(doc, '预处理归一化只用于审核匹配，不会修改原始用户输入文本，原始请求原样留存审计；')
add_bullet(doc, '人工复核是必要环节，中风险样本必须人工介入，无法完全自动化。')
add_page_break(doc)

# ==================== 九、总结与下一步 ====================
add_heading1(doc, '九、总结与下一步')
add_heading2(doc, '9.1 方案总结')
add_para(doc, '敏感词过滤引擎二期升级方案围绕"三层过滤流水线"核心架构展开：第一层增强规则引擎（AC自动机+归一化）解决字符变形类规避，第二层开源轻量语义模型解决语义违规，第三层审核大模型对中风险样本兜底复核。三层渐进拦截，既保障安全底线又控制审核成本。', first_indent=22)
add_para(doc, '方案同时实现"Prompt前置审核+Response后置审核"双环节，前置审核命中高风险直接阻断，不调用外部大模型，既合规又省钱。配套白名单语境豁免方案，通过固定搭配、场景标签、词性分析、上下文窗口等多层豁免机制，精准解决"胸口射箭""狭小逼仄"等文学描写误杀问题。', first_indent=22)
add_para(doc, '项目预计8周完成全量上线（分三阶段渐进落地），上线后预期规则漏判率<2%、语义误判率<3%、用户投诉量下降60%，实现"精准风控"与"用户体验"的双重提升。', first_indent=22)

add_heading2(doc, '9.2 下一步行动')
add_table(doc,
    ['序号', '行动项', '负责人', '时间节点', '交付物'],
    [
        ['1', '方案评审与立项确认', '产品经理', '本周内', '评审通过的PRD文档'],
        ['2', '架构设计评审与技术选型', '架构师', '第1周', '架构设计文档、技术选型报告'],
        ['3', '词库标签体系与白名单规则定稿', '运营+产品', '第1-2周', '词库标签规范、初始词库与白名单清单'],
        ['4', 'AC自动机规则引擎开发', '后端工程师', '第1-2周', '规则引擎服务、归一化模块'],
        ['5', '轻量语义模型选型与微调', '算法工程师', '第2-4周', '语义模型服务、阈值配置'],
        ['6', '灰度环境准备与监控配置', '运维工程师', '第5周', '灰度环境、监控看板、告警规则'],
    ],
    col_widths=[1.2, 4.5, 2.0, 2.0, 3.8])

add_para(doc, '', size=11)
add_para(doc, '—— 文档结束 ——', size=11, color=C_GRAY, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=20)

doc.save(OUTPUT)
print(f'[OK] Word文档已生成: {OUTPUT}')
print(f'文件大小: {os.path.getsize(OUTPUT) / 1024:.1f} KB')
