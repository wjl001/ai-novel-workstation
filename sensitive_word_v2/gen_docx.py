# -*- coding: utf-8 -*-
"""
敏感词过滤引擎（二期）产品方案 - Word文档生成脚本
要求：微软雅黑中文字体、领导汇报版、含流程图/架构图/泳道图
"""
from docx import Document
from docx.shared import Inches, Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml.ns import qn, nsdecls
from docx.oxml import parse_xml
import os

OUT_DIR = r'D:\phpstudy_pro\WWW\ai-novel-workstation1.2.0\sensitive_word_v2'
IMG_ARCH = os.path.join(OUT_DIR, 'architecture.png')
IMG_FLOW = os.path.join(OUT_DIR, 'flowchart.png')
IMG_SWIM = os.path.join(OUT_DIR, 'swimlane.png')
OUTPUT = os.path.join(OUT_DIR, '敏感词过滤引擎二期产品方案.docx')

# 颜色
C_DARK = RGBColor(0x1F, 0x4E, 0x79)
C_MID = RGBColor(0x2E, 0x75, 0xB6)
C_ACCENT = RGBColor(0xED, 0x7D, 0x31)
C_TEXT = RGBColor(0x26, 0x26, 0x26)
C_GRAY = RGBColor(0x7F, 0x7F, 0x7F)
C_WHITE = RGBColor(0xFF, 0xFF, 0xFF)
C_LIGHT_BG = RGBColor(0xDE, 0xEB, 0xF7)

FONT_NAME = '微软雅黑'


def set_run_font(run, size=11, bold=False, color=C_TEXT, font_name=FONT_NAME):
    """统一设置run字体（中英文均为微软雅黑）"""
    run.font.name = font_name
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    rPr = run._element.get_or_add_rPr()
    rFonts = rPr.find(qn('w:rFonts'))
    if rFonts is None:
        rFonts = parse_xml(f'<w:rFonts {nsdecls("w")} w:eastAsia="{font_name}" w:ascii="{font_name}" w:hAnsi="{font_name}"/>')
        rPr.insert(0, rFonts)
    else:
        rFonts.set(qn('w:eastAsia'), font_name)
        rFonts.set(qn('w:ascii'), font_name)
        rFonts.set(qn('w:hAnsi'), font_name)


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
    """一级标题：深蓝加粗16pt，段前段后间距"""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    pf = p.paragraph_format
    pf.space_before = Pt(18)
    pf.space_after = Pt(10)
    pf.line_spacing = 1.3
    # 左侧蓝色竖线装饰（通过边框实现）
    pPr = p._element.get_or_add_pPr()
    pBdr = parse_xml(
        f'<w:pBdr {nsdecls("w")}>'
        f'  <w:left w:val="single" w:sz="18" w:space="8" w:color="1F4E79"/>'
        f'</w:pBdr>'
    )
    pPr.append(pBdr)
    run = p.add_run(text)
    set_run_font(run, size=16, bold=True, color=C_DARK)
    return p


def add_heading2(doc, text):
    """二级标题：中蓝加粗13pt"""
    p = doc.add_paragraph()
    pf = p.paragraph_format
    pf.space_before = Pt(12)
    pf.space_after = Pt(6)
    pf.line_spacing = 1.3
    run = p.add_run(text)
    set_run_font(run, size=13, bold=True, color=C_MID)
    return p


def add_heading3(doc, text):
    """三级标题：深色加粗11.5pt"""
    p = doc.add_paragraph()
    pf = p.paragraph_format
    pf.space_before = Pt(8)
    pf.space_after = Pt(4)
    pf.line_spacing = 1.3
    run = p.add_run(text)
    set_run_font(run, size=11.5, bold=True, color=C_TEXT)
    return p


def add_bullet(doc, text, level=0, size=11):
    """项目符号段落"""
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
    """插入居中图片，可选图注"""
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
        set_run_font(crun, size=9.5, bold=False, color=C_GRAY)


def set_cell_shading(cell, color_hex):
    """设置单元格背景色"""
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
    """添加专业样式表格"""
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = 'Table Grid'
    # 表头
    for i, h in enumerate(headers):
        cell = table.rows[0].cells[i]
        set_cell_shading(cell, header_color)
        set_cell_text(cell, h, size=10.5, bold=True, color=C_WHITE, align=WD_ALIGN_PARAGRAPH.CENTER)
    # 数据行
    for r_idx, row in enumerate(rows):
        for c_idx, val in enumerate(row):
            cell = table.rows[r_idx + 1].cells[c_idx]
            if r_idx % 2 == 1:
                set_cell_shading(cell, 'F2F7FB')
            set_cell_text(cell, str(val), size=10, color=C_TEXT)
    # 列宽
    if col_widths:
        for i, w in enumerate(col_widths):
            for row in table.rows:
                row.cells[i].width = Cm(w)
    # 表后间距
    add_para(doc, '', size=6, space_after=4)
    return table


def add_page_break(doc):
    doc.add_page_break()


# ============================================================
# 开始构建文档
# ============================================================
doc = Document()

# 全局默认字体
style = doc.styles['Normal']
style.font.name = FONT_NAME
style.font.size = Pt(11)
style.element.rPr.rFonts.set(qn('w:eastAsia'), FONT_NAME)

# 页面设置
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

# 分隔线
p_line = doc.add_paragraph()
p_line.alignment = WD_ALIGN_PARAGRAPH.CENTER
run_line = p_line.add_run('━' * 30)
set_run_font(run_line, size=14, color=C_ACCENT)

add_para(doc, '', size=11)
add_para(doc, '正向组合拦截  ·  反向语境豁免  ·  精细化词库体系', size=14, bold=False, color=C_GRAY,
         align=WD_ALIGN_PARAGRAPH.CENTER, space_after=30, line_spacing=1.5)

for _ in range(6):
    add_para(doc, '', size=11)

# 封面信息表
info_table = doc.add_table(rows=4, cols=2)
info_table.alignment = WD_TABLE_ALIGNMENT.CENTER
info_data = [
    ('文档版本', 'V1.0'),
    ('文档类型', '产品方案（领导汇报版）'),
    ('编制日期', '2026年9月'),
    ('密级等级', '内部公开'),
]
for i, (k, v) in enumerate(info_data):
    set_cell_text(info_table.rows[i].cells[0], k, size=11, bold=True, color=C_DARK, align=WD_ALIGN_PARAGRAPH.RIGHT)
    set_cell_text(info_table.rows[i].cells[1], v, size=11, color=C_TEXT, align=WD_ALIGN_PARAGRAPH.LEFT)
    info_table.rows[i].cells[0].width = Cm(4)
    info_table.rows[i].cells[1].width = Cm(8)

add_page_break(doc)

# ==================== 一、项目概述 ====================
add_heading1(doc, '一、项目概述')

add_heading2(doc, '1.1 项目背景')
add_para(doc, '随着模型平台内容生成业务的快速发展，用户创作场景日益丰富，现有敏感词过滤系统（一期）采用基于单一词库的精确匹配机制，在实际运行中逐渐暴露出"一刀切"式的误杀问题。',
         first_indent=22)
add_para(doc, '一方面，部分单独使用时属于安全范畴的词汇，在特定组合语境下会构成违规表达，一期系统无法识别此类组合风险；另一方面，部分在通用词库中被标记为违规的词汇，在专业领域讨论或固定搭配中属于正常用法，机械式拦截导致正常创作被阻断，用户投诉量持续上升。',
         first_indent=22)
add_para(doc, '为解决上述痛点，模型平台启动敏感词过滤引擎二期升级项目，旨在建立更精细的词库标签体系及正则/语义匹配算法，实现"精准风控"与"用户体验"的平衡。',
         first_indent=22)

add_heading2(doc, '1.2 项目目标')
add_bullet(doc, '精准风控：解决"一刀切"导致的误封问题，在保障合规的前提下大幅提升用户创作体验；')
add_bullet(doc, '降低客诉：减少因正常词汇被误判为违规而引发的用户投诉，目标误杀率下降60%以上；')
add_bullet(doc, '合规深化：满足更深层次的内容安全审核标准，有效规避隐晦违规内容的生成风险；')
add_bullet(doc, '体系建设：建立可扩展、可配置的精细化词库标签体系，支撑后续多场景、多领域的灵活运营。')

add_heading2(doc, '1.3 核心价值')
add_table(doc,
    ['价值维度', '一期现状', '二期目标', '衡量指标'],
    [
        ['风控精准度', '单一词库精确匹配，无法识别组合违规', '支持组合词正向匹配，识别隐晦违规', '违规漏检率下降50%'],
        ['用户体验', '正常词汇被机械拦截，创作受阻', '白名单语境豁免，专业内容正常通行', '误杀率下降60%'],
        ['运营效率', '词库维护粗放，调整周期长', '标签化词库+可视化配置，分钟级生效', '词库更新效率提升80%'],
        ['合规能力', '仅覆盖显性违规', '覆盖组合违规、变体违规等深层风险', '审核通过率提升，客诉量下降'],
    ],
    col_widths=[2.8, 4.0, 4.2, 3.5])

add_page_break(doc)

# ==================== 二、一期现状与痛点分析 ====================
add_heading1(doc, '二、一期现状与痛点分析')

add_heading2(doc, '2.1 一期能力回顾')
add_para(doc, '一期敏感词过滤系统已具备基础的内容安全防护能力，主要包括：', first_indent=22)
add_bullet(doc, '通用违规词库：覆盖政治敏感、色情、暴力、辱骂等基础违规类别，词库规模约X万条；')
add_bullet(doc, '精确匹配引擎：基于字符串精确匹配及编辑距离模糊匹配，支持实时过滤；')
add_bullet(doc, '基础拦截策略：命中即拦截，返回统一违规提示，不区分风险等级；')
add_bullet(doc, '人工复审通道：部分疑似内容进入人工审核队列，由审核员二次判定。')

add_heading2(doc, '2.2 核心痛点')

add_heading3(doc, '痛点一：组合违规无法识别（漏检风险）')
add_para(doc, '一期系统仅对单个词汇进行匹配，无法识别"前缀+核心词"构成的组合违规。例如：单独"共产党"为安全词，但组合为"打倒共产党"时构成严重违规，一期系统可能因未命中单个违规词而放行，存在合规风险。',
         first_indent=22)

add_heading3(doc, '痛点二：专业语境机械误杀（体验问题）')
add_para(doc, '部分词汇在通用词库中被标记为违规，但在特定专业段落或固定搭配中属于合规用法。例如：医学讨论中的某些术语、历史研究中的特定表述，一期系统无法区分语境，一律拦截，导致正常用户创作受阻，客诉量居高不下。',
         first_indent=22)

add_heading3(doc, '痛点三：词库管理粗放（运营低效）')
add_para(doc, '一期词库缺乏精细化标签体系，词汇仅按大类划分，无法支持按场景、按领域、按语境的灵活配置。新增或调整词库规则需要技术人员介入，运营周期长，无法快速响应热点事件和新型违规变体。',
         first_indent=22)

add_heading2(doc, '2.3 典型误杀场景统计')
add_table(doc,
    ['场景类型', '典型示例', '一期处理', '二期优化方向', '占比预估'],
    [
        ['专业术语', '医学/法律/金融领域专有名词', '机械拦截', '行业白名单豁免', '35%'],
        ['固定搭配', '成语、历史典故、学术引用', '机械拦截', '语境白名单匹配', '28%'],
        ['反向表述', '批判、反对违规行为的正面表述', '命中即拦', '组合规则+语义判定', '20%'],
        ['变体绕过', '谐音、拆字、符号插入等变体', '部分漏检', '正则+语义增强匹配', '17%'],
    ],
    col_widths=[2.2, 4.0, 2.2, 3.8, 2.0])

add_page_break(doc)

# ==================== 三、二期核心功能设计 ====================
add_heading1(doc, '三、二期核心功能设计')

add_heading2(doc, '3.1 正向组合拦截机制')

add_heading3(doc, '3.1.1 机制原理')
add_para(doc, '正向组合拦截支持配置"前缀+核心词"的组合规则，当文本中同时出现指定前缀词与核心词，且满足位置关系约束（如相邻、间隔不超过N字、同句等）时，触发拦截。该机制有效解决一期系统无法识别组合违规的漏检问题。',
         first_indent=22)

add_heading3(doc, '3.1.2 规则配置模型')
add_table(doc,
    ['配置字段', '说明', '示例'],
    [
        ['规则ID', '组合规则唯一标识', 'RULE_COMBO_001'],
        ['前缀词列表', '触发组合的前缀词汇（可多个）', '打倒、反对、推翻'],
        ['核心词列表', '被组合的核心目标词汇（可多个）', '共产党、政府、国旗'],
        ['位置约束', '前缀与核心词的位置关系', '同句、间隔≤5字、相邻'],
        ['风险等级', '命中后判定的风险级别', '高风险/中风险'],
        ['生效范围', '规则适用的业务场景', '全场景/对话/创作'],
        ['生效时间', '规则的生效与失效时间', '2026-10-01起生效'],
    ],
    col_widths=[2.5, 5.5, 6.5])

add_heading3(doc, '3.1.3 匹配优先级')
add_para(doc, '组合规则匹配遵循"精确优先、长规则优先"原则：优先匹配位置约束更严格（如相邻）的规则；同优先级下，前缀词+核心词总长度更长的规则优先命中，避免短规则误覆盖长规则的精准判定。',
         first_indent=22)

add_heading2(doc, '3.2 反向语境豁免机制')

add_heading3(doc, '3.2.1 机制原理')
add_para(doc, '反向语境豁免支持配置特定语境下的白名单，当某词在通用词库中为违规词，但在特定专业段落、固定搭配或正面表述中出现时，判定为合规并放行。该机制从根本上解决"一刀切"式的误杀问题。',
         first_indent=22)

add_heading3(doc, '3.2.2 白名单类型')
add_table(doc,
    ['白名单类型', '适用场景', '匹配方式', '示例'],
    [
        ['固定搭配白名单', '成语、典故、常用短语', '精确短语匹配', '"历史研究中的XXX"'],
        ['专业领域白名单', '医疗、法律、金融、学术', '领域标签+词汇匹配', '医学论文中的专业术语'],
        ['正面表述白名单', '批判、反对违规的正面内容', '语义方向判定', '"我们坚决反对XXX"'],
        ['引用标注白名单', '引用文献、新闻、法规', '上下文标记匹配', '带引用标记的原文摘录'],
    ],
    col_widths=[2.8, 3.5, 3.2, 4.5])

add_heading3(doc, '3.2.3 豁免判定流程')
add_bullet(doc, '第一步：基础词库命中违规词后，不立即拦截，进入白名单校验环节；')
add_bullet(doc, '第二步：检查命中词汇是否属于任一白名单类型，匹配对应豁免条件；')
add_bullet(doc, '第三步：若满足豁免条件（如处于专业领域上下文、属于固定搭配等），判定为合规放行；')
add_bullet(doc, '第四步：若不满足任何豁免条件，维持违规判定，进入风险分级流程；')
add_bullet(doc, '第五步：所有豁免判定均记录日志，包含命中词、豁免类型、上下文摘要，供审计复盘。')

add_heading2(doc, '3.3 精细化词库标签体系')

add_heading3(doc, '3.3.1 标签维度设计')
add_para(doc, '二期建立多维度词库标签体系，每个词汇可挂载多个标签，支持按标签组合进行灵活配置和查询：', first_indent=22)
add_table(doc,
    ['标签维度', '标签取值示例', '用途说明'],
    [
        ['违规类别', '政治敏感/色情/暴力/辱骂/其他', '基础分类，决定拦截策略'],
        ['风险等级', '高风险/中风险/低风险', '决定拦截/复审/放行路径'],
        ['适用场景', '对话/创作/审核/全场景', '按业务场景差异化配置'],
        ['领域标签', '通用/医疗/法律/金融/教育', '支撑专业领域白名单豁免'],
        ['词型标签', '精确词/组合前缀/组合核心/白名单词', '标识词汇在匹配引擎中的角色'],
        ['来源标签', '人工录入/审核回流/热点同步/第三方', '追溯词汇来源，支撑质量评估'],
        ['时效标签', '永久/临时（含起止时间）', '支持热点事件词的自动过期'],
    ],
    col_widths=[2.2, 5.0, 6.5])

add_heading3(doc, '3.3.2 词库版本管理')
add_para(doc, '所有词库变更均纳入版本管理，支持版本快照、差异对比、一键回滚。每次变更记录操作人、变更时间、变更内容、审批状态，确保词库变更可追溯、可审计。热词通过Redis缓存实现分钟级生效，全量词库通过MySQL持久化存储。',
         first_indent=22)

add_heading2(doc, '3.4 匹配算法升级')

add_heading3(doc, '3.4.1 正则匹配增强')
add_para(doc, '在精确匹配基础上，引入正则表达式匹配能力，支持对变体违规（如谐音替换、拆字、符号插入、同音字等）的识别。运营人员可通过可视化界面配置正则规则，无需技术人员介入。',
         first_indent=22)

add_heading3(doc, '3.4.2 语义匹配辅助')
add_para(doc, '对于难以通过规则覆盖的隐晦违规场景，引入语义模型辅助判定。当规则匹配结果为"疑似"时，调用语义模型进行二次确认，输出违规概率评分，结合阈值决定拦截或放行。语义匹配作为规则匹配的补充，不替代规则引擎的主流程地位。',
         first_indent=22)

add_heading3(doc, '3.4.3 性能保障')
add_table(doc,
    ['性能指标', '一期水平', '二期目标', '保障措施'],
    [
        ['单次过滤延迟', 'P99 ≤ 50ms', 'P99 ≤ 80ms', '多级缓存+AC自动机+并行匹配'],
        ['组合规则匹配', '不支持', '支持万级规则', '前缀索引+倒排链+位置剪枝'],
        ['白名单校验', '不支持', '毫秒级完成', '短语索引+领域标签预过滤'],
        ['吞吐量', '5000 QPS', '8000 QPS', '引擎水平扩展+无状态设计'],
    ],
    col_widths=[2.8, 2.8, 2.8, 5.5])

add_page_break(doc)

# ==================== 四、产品架构设计 ====================
add_heading1(doc, '四、产品架构设计')

add_para(doc, '二期产品采用四层分层架构设计，自下而上分别为数据存储层、词库管理层、过滤引擎核心层和接入层，右侧配套运营管理后台实现全链路可视化运维。',
         first_indent=22)

add_image(doc, IMG_ARCH, width_inches=6.2, caption='图4-1 敏感词过滤引擎（二期）产品架构图')

add_heading2(doc, '4.1 接入层')
add_para(doc, '对接模型平台各类业务场景，包括对话生成接口、文本创作接口、内容审核接口及第三方API接入。接入层负责协议转换、请求路由和基础鉴权，将用户文本统一转发至过滤引擎核心层。',
         first_indent=22)

add_heading2(doc, '4.2 过滤引擎核心层（二期新增）')
add_para(doc, '核心层是二期升级的重点，包含五大匹配模块和三大支撑模块：', first_indent=22)
add_bullet(doc, '文本预处理：分词、大小写归一、特殊字符过滤，为后续匹配提供标准化输入；')
add_bullet(doc, '基础词库匹配：精确匹配+模糊匹配（编辑距离），兼容一期能力；')
add_bullet(doc, '组合词匹配引擎（二期核心）：扫描"前缀+核心词"组合规则，支持位置约束判定；')
add_bullet(doc, '白名单反向排除（二期核心）：检查是否属于豁免语境/固定搭配，实现精准放行；')
add_bullet(doc, '语义匹配增强：正则匹配+语义模型辅助，覆盖变体违规和隐晦表达；')
add_bullet(doc, '风险分级决策器：综合所有匹配结果，输出放行/拦截/人工复审决策；')
add_bullet(doc, '命中日志与上下文追踪：记录完整匹配路径和词库版本，支撑审计复盘；')
add_bullet(doc, '实时性能监控：监控延迟、命中率、误杀率等核心指标，异常告警。')

add_heading2(doc, '4.3 词库管理层')
add_para(doc, '管理五大类词库，全部挂载精细化标签体系：', first_indent=22)
add_bullet(doc, '通用违规词库：政治敏感、色情、暴力、辱骂等基础词（一期已有，补充标签）；')
add_bullet(doc, '组合规则词库（二期新增）：前缀词+核心词关联配置，支持位置约束；')
add_bullet(doc, '白名单词库（二期新增）：专业术语、固定搭配、语境豁免配置；')
add_bullet(doc, '行业专属词库：医疗、金融、法律等领域定制词，支撑差异化策略；')
add_bullet(doc, '动态更新词库：热点事件、新型变体实时同步，支持时效自动过期。')

add_heading2(doc, '4.4 数据存储层')
add_para(doc, '采用多存储引擎组合，满足不同场景的读写需求：', first_indent=22)
add_bullet(doc, 'Redis热词缓存：高频访问词汇和组合规则的毫秒级缓存；')
add_bullet(doc, 'MySQL词库配置：词库全量数据、标签体系、版本管理的持久化存储；')
add_bullet(doc, 'Elasticsearch命中日志：海量命中记录的全文检索和统计分析；')
add_bullet(doc, '对象存储审计归档：长期审计数据和历史版本快照的低成本归档。')

add_page_break(doc)

# ==================== 五、核心业务流程 ====================
add_heading1(doc, '五、核心业务流程')

add_para(doc, '二期核心业务流程在一期基础上新增组合词匹配和白名单校验两个关键环节，形成"基础匹配→组合匹配→白名单校验→风险分级"的四步判定链路，确保既不漏检组合违规，也不误杀合规内容。',
         first_indent=22)

add_image(doc, IMG_FLOW, width_inches=6.2, caption='图5-1 敏感词过滤核心业务流程图')

add_heading2(doc, '5.1 流程步骤说明')

add_heading3(doc, '步骤①：文本预处理')
add_para(doc, '对用户提交的文本进行分词、大小写归一、特殊字符过滤等标准化处理，为后续匹配模块提供统一输入格式。', first_indent=22)

add_heading3(doc, '步骤②：基础违规词库匹配')
add_para(doc, '使用精确匹配和模糊匹配（编辑距离）扫描通用违规词库，判断文本中是否存在基础违规词汇。', first_indent=22)

add_heading3(doc, '步骤③：组合词匹配引擎（未命中基础词时执行）')
add_para(doc, '若基础词库未命中，进入组合词匹配引擎，扫描"前缀+核心词"组合规则。当文本中同时出现指定前缀和核心词，且满足位置约束时，判定为组合违规命中。', first_indent=22)

add_heading3(doc, '步骤④：白名单反向排除校验（命中违规时执行）')
add_para(doc, '无论是基础词命中还是组合规则命中，均不立即拦截，而是进入白名单校验环节。检查命中词汇是否属于固定搭配、专业领域、正面表述或引用标注等豁免语境。若满足豁免条件，记录豁免日志后放行；若不满足，进入风险分级判定。',
         first_indent=22)

add_heading3(doc, '步骤⑤：风险分级判定')
add_para(doc, '综合所有匹配结果和白名单校验结果，按风险等级分流处理：', first_indent=22)
add_bullet(doc, '高风险：直接拦截，返回命中词、规则ID和风险等级提示，写入命中日志归档；')
add_bullet(doc, '中风险：进入人工复审队列，由审核员二次判定，复审结果回流更新词库；')
add_bullet(doc, '低风险（经白名单豁免）：直接放行，记录豁免日志供后续复盘优化。')

add_heading2(doc, '5.2 流程关键设计点')
add_table(doc,
    ['设计点', '设计思路', '解决的问题'],
    [
        ['双引擎并行', '基础匹配与组合匹配覆盖不同违规形态', '避免漏检组合违规'],
        ['命中先校验后拦截', '所有命中均经过白名单校验再决定是否拦截', '从根源减少误杀'],
        ['风险三级分流', '高风险拦截/中风险复审/低风险放行', '平衡安全与效率'],
        ['全链路日志', '记录匹配路径、词库版本、豁免原因', '支撑审计复盘与持续优化'],
        ['复审结果回流', '人工复审结论自动更新词库规则和白名单', '形成运营闭环，持续提升精准度'],
    ],
    col_widths=[2.5, 5.5, 5.5])

add_page_break(doc)

# ==================== 六、角色协作与职责划分 ====================
add_heading1(doc, '六、角色协作与职责划分')

add_para(doc, '二期系统涉及六个核心角色的协同配合，从用户请求发起到运营闭环，各角色职责清晰、链路可追溯。',
         first_indent=22)

add_image(doc, IMG_SWIM, width_inches=6.5, caption='图6-1 敏感词过滤系统角色泳道图')

add_heading2(doc, '6.1 角色职责说明')
add_table(doc,
    ['角色', '核心职责', '关键动作'],
    [
        ['用户/前端', '提交创作内容，接收过滤结果', '提交文本请求、展示拦截/放行结果、用户反馈'],
        ['API网关', '请求鉴权、限流、路由转发', '身份校验、流量控制、负载均衡、请求路由'],
        ['过滤引擎服务', '执行核心过滤判定逻辑', '文本预处理、基础匹配、组合匹配、白名单校验、风险分级'],
        ['词库管理服务', '提供词库数据查询与配置管理', '词库查询、标签检索、规则配置、版本管理、热词缓存同步'],
        ['审核运营团队', '人工复审与词库运营维护', '中风险内容复审、词库规则配置、白名单维护、热点词同步'],
        ['数据存储层', '数据持久化与日志检索', '词库配置存储、命中日志写入、审计归档、统计分析'],
    ],
    col_widths=[2.2, 4.5, 6.8])

add_heading2(doc, '6.2 协作流程要点')
add_bullet(doc, '请求发起阶段：用户提交文本→API网关鉴权限流→转发过滤引擎，全链路毫秒级完成；')
add_bullet(doc, '引擎判定阶段：过滤引擎调用词库管理服务获取词库数据，依次执行基础匹配、组合匹配和白名单校验；')
add_bullet(doc, '词库交互阶段：词库管理服务从Redis热词缓存或MySQL读取词库配置，返回标签化结果给引擎；')
add_bullet(doc, '结果处理阶段：引擎输出判定结果，高风险直接拦截返回用户，中风险推送审核运营团队复审；')
add_bullet(doc, '运营闭环阶段：审核运营团队完成复审后，将结论回流更新词库规则和白名单配置，数据持久化到存储层，新版本通过缓存同步即时生效。')

add_page_break(doc)

# ==================== 七、实施计划与里程碑 ====================
add_heading1(doc, '七、实施计划与里程碑')

add_heading2(doc, '7.1 总体排期')
add_table(doc,
    ['阶段', '时间周期', '核心交付物', '负责团队'],
    [
        ['需求与设计', '第1-2周', 'PRD文档、架构设计、词库标签体系设计', '产品+架构'],
        ['词库体系建设', '第2-4周', '组合规则词库、白名单词库初始化、标签迁移', '运营+后端'],
        ['引擎开发', '第3-7周', '组合匹配引擎、白名单校验模块、正则匹配增强', '后端+算法'],
        ['运营后台开发', '第5-8周', '词库可视化配置、版本管理、监控看板', '前端+后端'],
        ['联调测试', '第8-9周', '功能测试、性能压测、灰度验证报告', '测试+全团队'],
        ['灰度上线', '第10周', '灰度发布、指标监控、问题修复', '运维+全团队'],
        ['全量上线', '第11周', '全量发布、运营培训、文档交付', '运维+运营'],
    ],
    col_widths=[2.2, 2.0, 5.8, 3.0])

add_heading2(doc, '7.2 关键里程碑')
add_bullet(doc, 'M1（第2周末）：完成需求评审与架构设计，词库标签体系定稿；')
add_bullet(doc, 'M2（第4周末）：完成词库体系初始化，组合规则和白名单基础数据就绪；')
add_bullet(doc, 'M3（第7周末）：过滤引擎核心模块开发完成，进入联调阶段；')
add_bullet(doc, 'M4（第9周末）：完成全量测试，性能指标达标，具备上线条件；')
add_bullet(doc, 'M5（第11周末）：全量上线，运营团队完成培训，项目交付验收。')

add_heading2(doc, '7.3 资源需求')
add_table(doc,
    ['角色', '人数', '投入周期', '主要职责'],
    [
        ['产品经理', '1人', '全程（11周）', '需求管理、方案设计、跨团队协调'],
        ['后端工程师', '3人', '第3-10周', '过滤引擎、词库服务、API接口开发'],
        ['算法工程师', '1人', '第3-8周', '语义匹配模型、正则规则优化'],
        ['前端工程师', '1人', '第5-9周', '运营管理后台、配置界面开发'],
        ['测试工程师', '2人', '第7-10周', '功能测试、性能测试、灰度验证'],
        ['运营专员', '2人', '第2周起全程', '词库配置、规则维护、复审运营'],
        ['运维工程师', '1人', '第8-11周', '部署上线、监控告警、灰度管理'],
    ],
    col_widths=[2.2, 1.5, 2.8, 6.5])

add_page_break(doc)

# ==================== 八、预期收益与风险评估 ====================
add_heading1(doc, '八、预期收益与风险评估')

add_heading2(doc, '8.1 预期收益')

add_heading3(doc, '8.1.1 业务收益')
add_table(doc,
    ['收益指标', '当前基线', '二期目标', '测算依据'],
    [
        ['误杀率', '约8%（预估）', '≤3%', '白名单豁免覆盖35%专业术语+28%固定搭配'],
        ['违规漏检率', '约5%（组合违规）', '≤2%', '组合规则覆盖主要前缀+核心词组合'],
        ['用户投诉量', '月均X件', '下降60%', '误杀减少直接降低投诉量'],
        ['人工复审量', '月均Y件', '下降30%', '风险分级精准分流，低风险直接放行'],
        ['词库更新效率', '天级（需技术介入）', '分钟级（运营自助）', '可视化配置+热词缓存即时生效'],
    ],
    col_widths=[2.5, 2.8, 2.8, 5.0])

add_heading3(doc, '8.1.2 战略价值')
add_bullet(doc, '合规能力升级：从"显性违规拦截"升级为"组合违规+隐晦违规"的深度识别，满足更严格的内容安全标准；')
add_bullet(doc, '用户体验提升：精准豁免正常创作内容，减少用户创作阻碍，提升平台用户满意度和留存率；')
add_bullet(doc, '运营体系沉淀：建立可扩展的标签化词库体系，为后续多场景、多领域的内容安全运营奠定基础；')
add_bullet(doc, '技术能力复用：组合匹配和白名单校验引擎可复用于其他内容安全场景，如图片OCR审核、视频字幕审核等。')

add_heading2(doc, '8.2 风险评估与应对')
add_table(doc,
    ['风险类别', '风险描述', '影响等级', '应对措施'],
    [
        ['规则配置风险', '组合规则或白名单配置不当，导致漏检或误杀', '高', '建立规则审批流程，配置变更需双人审核；灰度验证后全量生效'],
        ['性能风险', '新增组合匹配和白名单校验导致过滤延迟上升', '中', '多级缓存+索引优化+并行匹配；压测达标后上线；预留降级开关'],
        ['词库质量风险', '初始词库覆盖不全，影响二期效果', '中', '运营团队提前2周启动词库梳理；上线后持续根据复审结果优化'],
        ['语义模型风险', '语义辅助判定准确率不足，引入新的误判', '低', '语义模型仅作辅助，最终决策以规则为主；设置置信度阈值，低置信度走人工复审'],
        ['上线风险', '新引擎上线影响存量业务稳定性', '高', '采用灰度发布，按流量比例逐步放量；配置一键回滚开关；上线期间7×24小时监控'],
    ],
    col_widths=[2.0, 4.5, 1.5, 5.5])

add_page_break(doc)

# ==================== 九、总结与下一步 ====================
add_heading1(doc, '九、总结与下一步')

add_heading2(doc, '9.1 方案总结')
add_para(doc, '敏感词过滤引擎二期升级方案围绕"正向组合拦截"和"反向语境豁免"两大核心能力展开，通过建立精细化词库标签体系和升级匹配算法，从根本上解决一期系统"一刀切"式的误杀问题，同时有效弥补组合违规漏检的合规短板。',
         first_indent=22)
add_para(doc, '方案采用四层分层架构，核心引擎模块化设计，具备良好的可扩展性和可维护性；配套运营管理后台实现词库可视化配置和全链路监控，支撑运营团队自助高效运维。',
         first_indent=22)
add_para(doc, '项目预计11周完成全量上线，上线后预期误杀率下降60%以上、违规漏检率下降50%以上、用户投诉量显著降低，实现"精准风控"与"用户体验"的双重提升。',
         first_indent=22)

add_heading2(doc, '9.2 下一步行动')
add_table(doc,
    ['序号', '行动项', '负责人', '时间节点', '交付物'],
    [
        ['1', '方案评审与立项确认', '产品经理', '本周内', '评审通过的PRD文档'],
        ['2', '架构设计评审与技术选型', '架构师', '第1周', '架构设计文档、技术选型报告'],
        ['3', '词库标签体系定稿', '运营+产品', '第2周', '词库标签规范、初始词库清单'],
        ['4', '开发团队组建与任务拆解', '研发负责人', '第1周', '开发计划、任务分配表'],
        ['5', '灰度环境准备与监控配置', '运维工程师', '第7周', '灰度环境、监控看板'],
    ],
    col_widths=[1.2, 4.5, 2.0, 2.0, 3.8])

add_para(doc, '', size=11)
add_para(doc, '—— 文档结束 ——', size=11, bold=False, color=C_GRAY,
         align=WD_ALIGN_PARAGRAPH.CENTER, space_before=20)

# 保存
doc.save(OUTPUT)
print(f'[OK] Word文档已生成: {OUTPUT}')
print(f'文件大小: {os.path.getsize(OUTPUT) / 1024:.1f} KB')
