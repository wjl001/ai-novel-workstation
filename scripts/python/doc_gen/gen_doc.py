# -*- coding: utf-8 -*-
"""
AI短剧系统 - 图片生成提示词优化产品方案
生成 .docx 格式文档，微软雅黑字体
"""
from docx import Document
from docx.shared import Inches, Pt, Cm, RGBColor, Emu
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.enum.section import WD_ORIENT
from docx.oxml.ns import qn, nsdecls
from docx.oxml import parse_xml
import os

# ========== 配置 ==========
OUTPUT_PATH = r'D:\phpstudy_pro\WWW\ai-novel-workstation1.2.0\AI短剧系统_图片生成提示词优化产品方案.docx'
CHART_DIR = r'D:\phpstudy_pro\WWW\ai-novel-workstation1.2.0\charts'

FONT_NAME = '微软雅黑'
COLOR_PRIMARY = RGBColor(0x4F, 0x46, 0xE5)   # 靛蓝
COLOR_SECONDARY = RGBColor(0x7C, 0x3A, 0xED)  # 紫色
COLOR_DARK = RGBColor(0x1E, 0x29, 0x3B)        # 深灰
COLOR_GRAY = RGBColor(0x64, 0x74, 0x8B)        # 中灰
COLOR_LIGHT = RGBColor(0x94, 0xA3, 0xB8)       # 浅灰
COLOR_WHITE = RGBColor(0xFF, 0xFF, 0xFF)
COLOR_DANGER = RGBColor(0xEF, 0x44, 0x44)
COLOR_SUCCESS = RGBColor(0x10, 0xB9, 0x81)
COLOR_WARNING = RGBColor(0xF5, 0x9E, 0x0B)

doc = Document()

# ========== 全局样式设置 ==========
def set_font(run, size=10.5, bold=False, color=COLOR_DARK, name=FONT_NAME):
    """设置字体"""
    run.font.name = name
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    # 设置中文字体
    r = run._element
    rPr = r.find(qn('w:rPr'))
    if rPr is None:
        rPr = parse_xml(f'<w:rPr {nsdecls("w")}></w:rPr>')
        r.insert(0, rPr)
    rFonts = rPr.find(qn('w:rFonts'))
    if rFonts is None:
        rFonts = parse_xml(f'<w:rFonts {nsdecls("w")} w:eastAsia="{name}" w:ascii="{name}" w:hAnsi="{name}"/>')
        rPr.insert(0, rFonts)
    else:
        rFonts.set(qn('w:eastAsia'), name)
        rFonts.set(qn('w:ascii'), name)
        rFonts.set(qn('w:hAnsi'), name)

def set_paragraph_format(para, align=WD_ALIGN_PARAGRAPH.LEFT, space_before=0, space_after=6, line_spacing=1.5, first_line_indent=None):
    """设置段落格式"""
    para.alignment = align
    pf = para.paragraph_format
    pf.space_before = Pt(space_before)
    pf.space_after = Pt(space_after)
    pf.line_spacing = line_spacing
    if first_line_indent:
        pf.first_line_indent = Pt(first_line_indent)

def add_heading_styled(text, level=1):
    """添加带样式的标题"""
    para = doc.add_paragraph()
    if level == 1:
        set_paragraph_format(para, align=WD_ALIGN_PARAGRAPH.LEFT, space_before=18, space_after=12, line_spacing=1.3)
        run = para.add_run(text)
        set_font(run, size=18, bold=True, color=COLOR_PRIMARY)
        # 添加底部边框
        pPr = para._element.get_or_add_pPr()
        pBdr = parse_xml(f'<w:pBdr {nsdecls("w")}><w:bottom w:val="single" w:sz="12" w:space="4" w:color="4F46E5"/></w:pBdr>')
        pPr.append(pBdr)
    elif level == 2:
        set_paragraph_format(para, align=WD_ALIGN_PARAGRAPH.LEFT, space_before=14, space_after=8, line_spacing=1.3)
        run = para.add_run(text)
        set_font(run, size=15, bold=True, color=COLOR_SECONDARY)
    elif level == 3:
        set_paragraph_format(para, align=WD_ALIGN_PARAGRAPH.LEFT, space_before=10, space_after=6, line_spacing=1.3)
        run = para.add_run(text)
        set_font(run, size=13, bold=True, color=COLOR_DARK)
    elif level == 4:
        set_paragraph_format(para, align=WD_ALIGN_PARAGRAPH.LEFT, space_before=8, space_after=4, line_spacing=1.3)
        run = para.add_run(text)
        set_font(run, size=11.5, bold=True, color=COLOR_DARK)
    return para

def add_body_text(text, indent=True, bold=False, color=COLOR_DARK):
    """添加正文段落"""
    para = doc.add_paragraph()
    set_paragraph_format(para, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_before=0, space_after=6, line_spacing=1.6,
                          first_line_indent=21 if indent else None)
    run = para.add_run(text)
    set_font(run, size=10.5, bold=bold, color=color)
    return para

def add_bullet(text, level=0, bold_prefix=None):
    """添加项目符号列表"""
    para = doc.add_paragraph()
    set_paragraph_format(para, align=WD_ALIGN_PARAGRAPH.LEFT, space_before=0, space_after=4, line_spacing=1.5)
    pf = para.paragraph_format
    pf.left_indent = Pt(21 + level * 21)
    pf.first_line_indent = Pt(-12)
    bullet_char = '● ' if level == 0 else '○ ' if level == 1 else '▪ '
    run = para.add_run(bullet_char)
    set_font(run, size=10.5, bold=True, color=COLOR_PRIMARY if level == 0 else COLOR_SECONDARY)
    if bold_prefix:
        run2 = para.add_run(bold_prefix)
        set_font(run2, size=10.5, bold=True, color=COLOR_DARK)
        run3 = para.add_run(text)
        set_font(run3, size=10.5, color=COLOR_DARK)
    else:
        run2 = para.add_run(text)
        set_font(run2, size=10.5, color=COLOR_DARK)
    return para

def add_table(headers, rows, col_widths=None, header_color='4F46E5'):
    """添加格式化表格"""
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = 'Table Grid'

    # 设置表头
    hdr_cells = table.rows[0].cells
    for i, header in enumerate(headers):
        hdr_cells[i].text = ''
        para = hdr_cells[i].paragraphs[0]
        para.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = para.add_run(header)
        set_font(run, size=10, bold=True, color=COLOR_WHITE)
        # 设置背景色
        shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{header_color}"/>')
        hdr_cells[i]._element.get_or_add_tcPr().append(shading)
        hdr_cells[i].vertical_alignment = WD_ALIGN_VERTICAL.CENTER

    # 设置数据行
    for r_idx, row_data in enumerate(rows):
        row_cells = table.rows[r_idx + 1].cells
        for c_idx, cell_text in enumerate(row_data):
            row_cells[c_idx].text = ''
            para = row_cells[c_idx].paragraphs[0]
            para.alignment = WD_ALIGN_PARAGRAPH.LEFT
            run = para.add_run(str(cell_text))
            set_font(run, size=9.5, color=COLOR_DARK)
            row_cells[c_idx].vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            # 斑马纹
            if r_idx % 2 == 1:
                shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="F8FAFC"/>')
                row_cells[c_idx]._element.get_or_add_tcPr().append(shading)

    # 设置列宽
    if col_widths:
        for i, width in enumerate(col_widths):
            for row in table.rows:
                row.cells[i].width = Cm(width)

    # 表格后空行
    doc.add_paragraph()
    return table

def add_image_with_caption(image_path, caption, width_inches=6.0):
    """插入图片并添加图注"""
    if os.path.exists(image_path):
        para = doc.add_paragraph()
        para.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = para.add_run()
        run.add_picture(image_path, width=Inches(width_inches))
        # 图注
        cap_para = doc.add_paragraph()
        cap_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
        set_paragraph_format(cap_para, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=2, space_after=10, line_spacing=1.2)
        cap_run = cap_para.add_run(caption)
        set_font(cap_run, size=9, bold=True, color=COLOR_GRAY)
    else:
        add_body_text(f'[图表缺失: {caption}]', indent=False, color=COLOR_DANGER)

def add_callout(text, callout_type='info'):
    """添加提示框（用单格表格模拟）"""
    colors = {
        'info': ('E0F2FE', '0EA5E9', '提示'),
        'warning': ('FEF3C7', 'F59E0B', '注意'),
        'danger': ('FEE2E2', 'EF4444', '重要'),
        'success': ('D1FAE5', '10B981', '说明'),
    }
    bg, border, label = colors.get(callout_type, colors['info'])
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.rows[0].cells[0]
    cell.text = ''
    # 背景色
    shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{bg}"/>')
    cell._element.get_or_add_tcPr().append(shading)
    # 左边框加粗
    tcBorders = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:left w:val="single" w:sz="24" w:color="{border}"/></w:tcBorders>')
    cell._element.get_or_add_tcPr().append(tcBorders)

    para = cell.paragraphs[0]
    set_paragraph_format(para, align=WD_ALIGN_PARAGRAPH.LEFT, space_before=4, space_after=4, line_spacing=1.5)
    run1 = para.add_run(f'【{label}】')
    set_font(run1, size=10, bold=True, color=RGBColor(int(border[0:2],16), int(border[2:4],16), int(border[4:6],16)))
    run2 = para.add_run(text)
    set_font(run2, size=10, color=COLOR_DARK)
    doc.add_paragraph()

# ========== 页面设置 ==========
section = doc.sections[0]
section.page_width = Cm(21)
section.page_height = Cm(29.7)
section.top_margin = Cm(2.5)
section.bottom_margin = Cm(2.5)
section.left_margin = Cm(2.8)
section.right_margin = Cm(2.8)

# 设置默认样式
style = doc.styles['Normal']
style.font.name = FONT_NAME
style.font.size = Pt(10.5)
style.element.rPr.rFonts.set(qn('w:eastAsia'), FONT_NAME)

# ============================================================
# 封面
# ============================================================
for _ in range(4):
    doc.add_paragraph()

# 主标题
title_para = doc.add_paragraph()
title_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
set_paragraph_format(title_para, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=12, line_spacing=1.2)
title_run = title_para.add_run('AI短剧创作系统')
set_font(title_run, size=28, bold=True, color=COLOR_PRIMARY)

subtitle_para = doc.add_paragraph()
subtitle_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
set_paragraph_format(subtitle_para, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=24, line_spacing=1.2)
subtitle_run = subtitle_para.add_run('图片生成提示词优化产品方案')
set_font(subtitle_run, size=22, bold=True, color=COLOR_SECONDARY)

# 分隔线
div_para = doc.add_paragraph()
div_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
div_run = div_para.add_run('—' * 30)
set_font(div_run, size=12, color=COLOR_LIGHT)

for _ in range(2):
    doc.add_paragraph()

# 问题标签
issues = ['图片生成精度不高', '人物图片色彩异常', '斗鸡眼问题', '人脸崩坏']
issue_para = doc.add_paragraph()
issue_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
set_paragraph_format(issue_para, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=6, line_spacing=1.8)
for i, issue in enumerate(issues):
    run = issue_para.add_run(f'  {issue}  ')
    set_font(run, size=11, bold=True, color=COLOR_WHITE)
    # 这里用文字背景模拟标签
    r = run._element
    rPr = r.get_or_add_rPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:val="clear" w:color="auto" w:fill="4F46E5"/>')
    rPr.append(shd)

for _ in range(6):
    doc.add_paragraph()

# 文档信息表
info_table = doc.add_table(rows=4, cols=2)
info_table.alignment = WD_TABLE_ALIGNMENT.CENTER
info_data = [
    ('文档版本', 'V1.0'),
    ('编制日期', '2026年8月25日'),
    ('适用对象', '产品领导 / 开发团队 / 测试团队'),
    ('密级', '内部公开'),
]
for i, (k, v) in enumerate(info_data):
    cell_k = info_table.rows[i].cells[0]
    cell_v = info_table.rows[i].cells[1]
    cell_k.text = ''
    cell_v.text = ''
    pk = cell_k.paragraphs[0]
    pk.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    rk = pk.add_run(k)
    set_font(rk, size=10.5, bold=True, color=COLOR_GRAY)
    pv = cell_v.paragraphs[0]
    pv.alignment = WD_ALIGN_PARAGRAPH.LEFT
    rv = pv.add_run(v)
    set_font(rv, size=10.5, color=COLOR_DARK)
    cell_k.width = Cm(4)
    cell_v.width = Cm(8)

# 分页
doc.add_page_break()

# ============================================================
# 目录（手动）
# ============================================================
add_heading_styled('目录', level=1)
toc_items = [
    ('一、项目背景与问题分析', '3'),
    ('二、产品目标与核心价值', '5'),
    ('三、产品架构设计', '6'),
    ('四、提示词优化方案设计', '8'),
    ('五、主体设置页面交互设计（含用户确认）', '12'),
    ('六、业务流程设计', '15'),
    ('七、跨角色协作泳道设计', '17'),
    ('八、技术实现方案', '18'),
    ('九、测试验收方案', '21'),
    ('十、项目排期与风险管理', '23'),
]
for item, page in toc_items:
    para = doc.add_paragraph()
    set_paragraph_format(para, align=WD_ALIGN_PARAGRAPH.LEFT, space_before=2, space_after=2, line_spacing=1.8)
    run = para.add_run(item)
    set_font(run, size=11, color=COLOR_DARK)
    # 点线
    dots = '·' * (60 - len(item) * 2)
    run2 = para.add_run(f' {dots} {page}')
    set_font(run2, size=10, color=COLOR_LIGHT)

doc.add_page_break()

# ============================================================
# 一、项目背景与问题分析
# ============================================================
add_heading_styled('一、项目背景与问题分析', level=1)

add_heading_styled('1.1 项目背景', level=2)
add_body_text('AI短剧创作系统是一款面向短剧创作者的全流程AI辅助工具，覆盖剧本生成、大纲拆解、主体资产管理、分镜生成、视频合成等核心环节。其中，主体资产管理模块（角色、场景、道具）作为整个短剧视觉一致性的基石，其图片生成质量直接决定了后续分镜画面和视频成片的品质。')
add_body_text('当前系统已实现主体图片的批量生成与单张重生成功能，但在实际使用过程中，用户反馈图片生成质量不稳定，尤其在人物角色图片方面存在多种典型问题，严重影响创作效率和成品质量。')

add_heading_styled('1.2 现存问题详细分析', level=2)
add_body_text('通过对近一个月用户生成图片的抽样分析与用户反馈收集，我们梳理出以下四类高频问题：', indent=False)

add_table(
    ['问题类型', '问题表现', '发生频率', '影响程度', '根因分析'],
    [
        ['图片精度不高', '画面模糊、细节丢失、边缘锯齿、纹理不清晰，整体分辨率感知低于预期', '约35%', '高', '提示词缺少质量控制关键词（如8K、高清、细节丰富等）；未指定渲染风格与画质参数'],
        ['人物色彩异常', '人物皮肤出现非自然色偏（偏蓝/偏绿/偏红），服饰颜色与描述不符，背景色溢出到人物身上', '约28%', '高', '提示词未明确肤色/发色/服饰色的具体色值；缺少色彩一致性约束词；未使用负面提示词排除色偏'],
        ['斗鸡眼', '人物双眼视线不统一，瞳孔向内聚拢或双眼看向不同方向，呈现斗鸡眼或斜视状态', '约22%', '中高', '提示词未指定视线方向与眼神状态；AI模型对多人/特写镜头的眼部细节处理能力不足；缺少眼部质量约束词'],
        ['人脸崩坏', '面部五官扭曲变形、五官缺失、多脸/融脸、面部比例失调、年龄与描述不符', '约15%', '极高', '提示词缺少面部细节描述与五官约束；未使用面部质量增强词；负面提示词缺失；复杂构图下AI处理能力不足'],
    ],
    col_widths=[2.5, 4.5, 1.8, 1.8, 4.5]
)

add_heading_styled('1.3 问题根因总结', level=2)
add_body_text('综合以上分析，当前图片生成质量问题的核心根因可归纳为以下三点：', indent=False)
add_bullet('提示词结构过于简单：现有提示词仅包含基础描述+通用风格词（如"写实风格，电影级光影，8k分辨率"），缺少结构化的质量控制层、特征锁定层、负面排除层。', bold_prefix='① ')
add_bullet('缺少用户确认环节：当前批量生成流程为"一键生成"模式，用户在生成前无法预览和确认系统组装的提示词，导致生成结果与预期偏差较大时只能事后重生成。', bold_prefix='② ')
add_bullet('无质量检测与自动优化闭环：生成后缺少AI自动质量检测环节，问题图片无法被自动识别和重试优化，全部依赖用户人工判断和手动重生成。', bold_prefix='③ ')

add_callout('本方案将围绕"提示词结构化优化 + 用户确认交互 + 质量检测闭环"三大核心方向，系统性解决上述图片生成质量问题。', 'info')

doc.add_page_break()

# ============================================================
# 二、产品目标与核心价值
# ============================================================
add_heading_styled('二、产品目标与核心价值', level=1)

add_heading_styled('2.1 产品目标', level=2)
add_table(
    ['目标维度', '具体指标', '当前基线', '目标值', '衡量方式'],
    [
        ['图片精度', '高清/细节丰富图片占比', '约65%', '≥90%', 'AI图像质量评估+人工抽检'],
        ['色彩准确率', '人物肤色/服饰色与描述一致率', '约72%', '≥95%', '色彩一致性检测算法+人工审核'],
        ['眼部正常率', '非斗鸡眼/斜视图片占比', '约78%', '≥95%', '人脸关键点检测+视线方向分析'],
        ['人脸完整率', '五官完整无崩坏图片占比', '约85%', '≥98%', '人脸检测+五官完整性校验'],
        ['一次生成满意度', '用户无需重生成即采纳的比例', '约50%', '≥80%', '用户行为数据（采纳/重生成比）'],
        ['平均生成轮次', '单个主体达到满意所需的平均生成次数', '约2.8次', '≤1.5次', '系统日志统计'],
    ],
    col_widths=[2.2, 4.0, 2.0, 2.0, 4.5]
)

add_heading_styled('2.2 核心价值', level=2)
add_bullet('对创作者：大幅提升图片生成质量与一次成功率，减少反复调整和重生成的时间成本，让创作者更专注于内容创作本身。', bold_prefix='用户价值：')
add_bullet('对产品：建立"提示词优化引擎+质量检测闭环"的技术壁垒，提升产品核心竞争力和用户留存率。', bold_prefix='产品价值：')
add_bullet('对团队：通过结构化提示词模板库和用户确认机制，降低AI生成结果的不可控性，减少售后问题和用户投诉。', bold_prefix='团队价值：')

doc.add_page_break()

# ============================================================
# 三、产品架构设计
# ============================================================
add_heading_styled('三、产品架构设计', level=1)

add_heading_styled('3.1 整体架构概述', level=2)
add_body_text('本方案在现有AI短剧系统架构基础上，新增"提示词优化引擎"和"图像质量检测服务"两大核心模块，并在主体设置页面增加"用户确认"交互环节，形成"用户输入→智能优化→用户确认→AI生成→质量检测→反馈优化"的完整闭环。')

add_heading_styled('3.2 产品架构图', level=2)
add_image_with_caption(
    os.path.join(CHART_DIR, 'architecture.png'),
    '图3-1  AI短剧系统·图片生成提示词优化产品架构图',
    width_inches=6.2
)

add_heading_styled('3.3 架构分层说明', level=2)

add_heading_styled('3.3.1 用户层', level=3)
add_bullet('创作者/运营人员：使用主体设置模块进行角色/场景/道具的创建、编辑和图片生成，是提示词优化功能的主要使用者。')
add_bullet('审核/质检人员：对生成图片进行质量抽检和审核，反馈问题案例用于提示词模板的持续优化。')
add_bullet('系统管理员：维护提示词模板库、质量检测规则和AI模型配置。')

add_heading_styled('3.3.2 应用层', level=3)
add_bullet('主体设置模块：升级现有主体设置页面，增加提示词预览、编辑和用户确认交互。')
add_bullet('提示词优化引擎：核心新增模块，负责特征提取、模板匹配、正负提示词智能组装和校验。')
add_bullet('图片生成模块：在现有生成能力基础上，接入优化后的提示词和多模型调度策略。')
add_bullet('质量检测与反馈：新增模块，对生成图片进行AI自动质量检测，并支持用户人工确认反馈。')

add_heading_styled('3.3.3 服务层', level=3)
add_bullet('提示词模板库：存储正面提示词模板、负面提示词模板、风格模板、质量词模板等。')
add_bullet('人物特征锁定服务：从用户描述中提取并标准化人物特征（面部、肤色、发型、服饰等）。')
add_bullet('AI模型网关：统一调度多个AI图片生成模型，支持按场景/主体类型智能路由。')
add_bullet('图像质量分析服务：集成人脸检测、色彩分析、清晰度评估、眼部检测等算法。')
add_bullet('用户确认与反馈服务：管理用户确认状态、反馈数据收集和提示词优化建议。')

add_heading_styled('3.3.4 数据层', level=3)
add_bullet('主体资产库：存储角色、场景、道具的基础信息、参考图和生成图片历史。')
add_bullet('提示词知识库：存储优化规则、最佳实践案例、问题-解决方案映射。')
add_bullet('生成历史库：记录每次生成的图片、提示词参数、模型版本、质量评分。')
add_bullet('用户行为日志：记录用户确认、修改、重生成、采纳等行为数据。')

doc.add_page_break()

# ============================================================
# 四、提示词优化方案设计
# ============================================================
add_heading_styled('四、提示词优化方案设计', level=1)

add_heading_styled('4.1 提示词结构化设计', level=2)
add_body_text('将原有简单的提示词重构为六层结构化提示词，每一层承担明确的功能，通过模板化+动态填充的方式实现智能组装。', indent=False)

add_table(
    ['层级', '名称', '功能说明', '示例内容', '必填'],
    [
        ['L1', '主体描述层', '核心主体的基础描述，从用户输入直接提取', '1个年轻女性，25岁，亚洲面孔', '是'],
        ['L2', '特征锁定层', '人物/场景/道具的精细化特征标签，确保视觉一致性', '黑色长直发，杏仁眼，高鼻梁，白皙皮肤，红色连衣裙', '是'],
        ['L3', '构图与视角层', '画面构图、镜头视角、主体位置等', '半身特写，正面视角，居中构图，视线平视镜头', '是'],
        ['L4', '质量增强层', '画质、分辨率、细节、渲染质量等控制词', '8K分辨率，超高清晰度，细节丰富，锐利聚焦，专业摄影', '是'],
        ['L5', '风格与光影层', '艺术风格、光线氛围、色调倾向', '写实风格，电影级光影，柔和自然光，暖色调，浅景深', '是'],
        ['L6', '负面排除层', '需要排除的不良效果和问题类型', '低质量，模糊，人脸崩坏，斗鸡眼，色偏，变形，多手指', '是'],
    ],
    col_widths=[1.2, 2.2, 4.0, 5.0, 1.2]
)

add_heading_styled('4.2 正面提示词优化策略', level=2)

add_heading_styled('4.2.1 针对"图片精度不高"的优化', level=3)
add_bullet('强制注入高质量关键词组："8K分辨率, 超高清晰度, 细节丰富, 锐利聚焦, 专业摄影, 杰作(masterpiece), 最佳质量(best quality)"。')
add_bullet('增加渲染方式指定：根据主体类型自动选择"摄影级真实渲染(photorealistic)"或"电影级渲染(cinematic rendering)"。')
add_bullet('明确细节描述要求：增加"精细的皮肤纹理, 清晰的面部细节, 丰富的材质质感"等细节引导词。')
add_bullet('指定相机与镜头参数：如"50mm定焦镜头, f/1.8大光圈, ISO100, 专业单反拍摄"，提升画面专业感。')

add_heading_styled('4.2.2 针对"人物色彩异常"的优化', level=3)
add_bullet('肤色精确描述：将"白皙皮肤"细化为"自然白皙肤色，暖调肤色，健康肤色，无 unnatural skin tone"。')
add_bullet('服饰颜色锁定：使用具体色值描述，如"正红色(#FF0000)连衣裙"而非"红色裙子"。')
add_bullet('增加色彩一致性约束词："色彩准确，自然色彩，真实肤色，无色彩溢出，无偏色，白平衡准确"。')
add_bullet('指定光线与白平衡："自然光，准确白平衡，柔和均匀光照，无强烈色光照射"。')

add_heading_styled('4.2.3 针对"斗鸡眼"的优化', level=3)
add_bullet('明确视线方向：根据构图自动添加"双眼平视镜头，视线统一，目光坚定，正常眼神交流"。')
add_bullet('增加眼部质量词："精致的双眼，正常瞳孔位置，对称的双眼，自然眼神，无斜视"。')
add_bullet('避免触发斗鸡眼的构图：对特写镜头自动建议"适度拉远，避免极端大特写，保持面部完整"。')
add_bullet('人物数量控制：多人场景提示"每个人物视线方向明确，各自独立，无眼神错位"。')

add_heading_styled('4.2.4 针对"人脸崩坏"的优化', level=3)
add_bullet('面部完整性约束："完整的面部，五官端正，比例协调，对称的脸庞，无面部变形"。')
add_bullet('五官精细描述："清晰的双眼，精致的鼻子，自然的嘴唇，整齐的牙齿，圆润的下巴"。')
add_bullet('增加人脸质量增强词："完美的脸庞，精美的面部细节，专业人像摄影，面部聚焦清晰"。')
add_bullet('避免复杂构图：单人优先，多人场景明确"每个人物面部完整清晰，无融合，无重叠"。')

add_heading_styled('4.3 负面提示词（Negative Prompt）设计', level=2)
add_body_text('负面提示词是解决AI生成质量问题的关键手段。本方案建立分级负面提示词库，根据主体类型和生成场景自动组合。', indent=False)

add_table(
    ['负面词分类', '包含关键词', '适用场景', '优先级'],
    [
        ['通用低质量', 'low quality, worst quality, blurry, pixelated, jpeg artifacts, compressed, low resolution', '所有场景', 'P0'],
        ['人脸崩坏类', 'deformed face, distorted face, ugly face, disfigured, missing face, extra face, fused face, malformed face', '人物角色', 'P0'],
        ['眼部问题类', 'cross-eyed, crossed eyes, strabismus, lazy eye, asymmetric eyes, weird eyes, missing eyes, extra eyes', '人物角色', 'P0'],
        ['色彩异常类', 'unnatural skin tone, color cast, color overflow, weird colors, oversaturated, desaturated, wrong colors', '人物/场景', 'P1'],
        ['肢体畸形类', 'deformed hands, extra fingers, missing fingers, fused fingers, mutated hands, bad anatomy, wrong proportions', '人物角色', 'P1'],
        ['构图问题类', 'cropped, out of frame, cut off, bad composition, poorly drawn, messy, cluttered', '所有场景', 'P2'],
        ['艺术风格排除', 'cartoon, anime, 3d render, cgi, painting, illustration, sketch, drawing（当目标为写实风格时）', '写实风格', 'P2'],
    ],
    col_widths=[2.2, 5.5, 2.5, 1.5]
)

add_heading_styled('4.4 提示词模板库设计', level=2)
add_body_text('建立可扩展的提示词模板库，支持按主体类型（角色/场景/道具）、风格类型（写实/国风/动漫）、镜头类型（特写/半身/全身/远景）进行组合匹配。', indent=False)

add_heading_styled('4.4.1 模板结构', level=3)
add_bullet('模板ID：唯一标识，如 CHAR_REALISTIC_CLOSEUP_001')
add_bullet('适用条件：主体类型 + 风格 + 镜头 + 其他标签')
add_bullet('正面提示词模板：含占位符的六层结构模板')
add_bullet('负面提示词模板：分级负面词组合')
add_bullet('推荐参数：采样步数、CFG Scale、种子策略等')
add_bullet('版本号与更新记录：支持模板迭代和A/B测试')

add_heading_styled('4.4.2 模板示例（角色-写实-半身）', level=3)
add_callout(
    '正面提示词：{L1主体描述}，{L2特征锁定}，{L3构图：半身像，正面视角，居中构图}，'
    '{L4质量：8K分辨率，超高清晰度，细节丰富，锐利聚焦，专业摄影，杰作，最佳质量}，'
    '{L5风格：写实风格，电影级光影，柔和自然光，准确白平衡，浅景深}，'
    '50mm定焦镜头，f/1.8，专业单反拍摄\n\n'
    '负面提示词：low quality, worst quality, blurry, deformed face, distorted face, cross-eyed, '
    'unnatural skin tone, color cast, deformed hands, extra fingers, bad anatomy, cartoon, anime, 3d render',
    'success'
)

add_heading_styled('4.5 提示词智能组装引擎逻辑', level=2)
add_body_text('提示词优化引擎接收用户输入的主体信息后，按以下流程完成智能组装：', indent=False)
add_bullet('步骤1 - 信息解析：解析用户填写的主体名称、描述、参考图、风格偏好、镜头类型等信息。')
add_bullet('步骤2 - 特征提取：从描述文本中提取人物特征（年龄/性别/发型/服饰/肤色等）或场景/道具特征。')
add_bullet('步骤3 - 模板匹配：根据主体类型+风格+镜头等标签，从模板库中匹配最佳模板。')
add_bullet('步骤4 - 动态填充：将提取的特征填入模板占位符，生成初始正面提示词。')
add_bullet('步骤5 - 质量增强：根据主体类型自动注入对应质量增强词和问题预防词。')
add_bullet('步骤6 - 负面词组合：按优先级组合负面提示词，控制总长度在合理范围。')
add_bullet('步骤7 - 校验优化：检查关键词冲突、重复、长度超限，进行去重和优化排序。')
add_bullet('步骤8 - 输出结果：输出正面提示词、负面提示词、推荐生成参数，供前端预览和用户确认。')

doc.add_page_break()

# ============================================================
# 五、主体设置页面交互设计（含用户确认）
# ============================================================
add_heading_styled('五、主体设置页面交互设计（含用户确认）', level=1)

add_heading_styled('5.1 交互设计原则', level=2)
add_bullet('用户可控：生成前必须让用户预览并确认提示词，用户可随时编辑调整。', bold_prefix='原则一：')
add_bullet('渐进披露：默认展示优化后的提示词摘要，需要时可展开查看完整六层结构和负面提示词。', bold_prefix='原则二：')
add_bullet('智能推荐：系统自动推荐最优模板和参数，用户一键确认即可，降低使用门槛。', bold_prefix='原则三：')
add_bullet('反馈闭环：生成后展示质量检测报告，用户可基于报告选择采纳/重生成/修改提示词。', bold_prefix='原则四：')

add_heading_styled('5.2 主体编辑弹窗升级设计', level=2)
add_body_text('在现有主体编辑弹窗（SubjectEditDialog）中新增"提示词优化与确认"区域，作为生成图片前的必经环节。', indent=False)

add_heading_styled('5.2.1 弹窗布局结构', level=3)
add_table(
    ['区域', '位置', '内容说明', '交互方式'],
    [
        ['基础信息区', '弹窗上部', '主体名称、类型、描述、参考图上传（现有功能，保持不变）', '文本输入/文件上传'],
        ['特征标签区', '基础信息下方', '系统自动提取的特征标签（可增删改），如发型/服饰/肤色/年龄等', '标签选择/自定义输入'],
        ['风格与镜头选择', '特征标签下方', '风格选择（写实/国风/动漫）、镜头类型（特写/半身/全身/远景）', '下拉选择/单选按钮'],
        ['提示词预览区', '弹窗中部（核心新增）', '展示优化后的正面提示词摘要+完整展开，负面提示词摘要', '只读预览/展开收起'],
        ['提示词编辑区', '预览区下方（折叠）', '用户可手动编辑正面和负面提示词，支持恢复系统推荐', '文本域编辑/一键恢复'],
        ['生成参数区', '提示词下方', '分辨率选择、模型选择、生成数量（现有功能整合）', '下拉/数字输入'],
        ['用户确认操作区', '弹窗底部（核心新增）', '「确认并生成」主按钮 + 「仅保存不生成」次按钮 + 提示文案', '按钮点击'],
    ],
    col_widths=[2.2, 2.5, 6.0, 3.0]
)

add_heading_styled('5.2.2 用户确认操作详细设计', level=3)
add_body_text('用户确认操作是本次方案的核心交互点，确保用户在生成前明确知晓并认可系统组装的提示词。', indent=False)

add_heading_styled('确认按钮状态与逻辑', level=4)
add_bullet('默认状态：按钮文案为「确认并生成图片」，主按钮样式（靛蓝渐变），可点击。')
add_bullet('未填写必填信息时：按钮禁用，Tooltip提示"请完善主体描述信息"。')
add_bullet('用户修改过提示词时：按钮旁显示「已自定义」标签，提示用户当前使用的是自定义提示词。')
add_bullet('生成中：按钮变为加载状态，文案"生成中..."，禁止重复点击。')

add_heading_styled('确认前校验', level=4)
add_bullet('主体描述非空校验：确保有足够的描述信息用于生成。')
add_bullet('提示词长度校验：正面提示词建议50-300词，负面提示词建议20-100词，超限时给出警告但不强制阻断。')
add_bullet('敏感词校验：检查提示词中是否包含违规内容。')
add_bullet('特征完整性提醒：人物角色缺少关键特征（如性别/年龄）时，弹出确认框"检测到特征信息不完整，是否继续生成？"。')

add_heading_styled('二次确认场景', level=4)
add_bullet('用户从未修改过提示词，首次点击生成时：弹出轻量确认"系统已为您智能优化提示词，确认使用该提示词生成图片？"，含「确认生成」和「再看看」按钮。')
add_bullet('用户选择高分辨率（如4K）或多图生成时：提示"高分辨率/多图生成将消耗更多时间和资源，确认继续？"。')

add_heading_styled('5.3 生成后质量反馈交互', level=2)
add_body_text('图片生成完成后，在主体编辑弹窗和资产卡片中展示质量检测结果和用户反馈入口。', indent=False)

add_heading_styled('5.3.1 质量检测报告展示', level=3)
add_bullet('在生成图片旁展示AI质量评分（如"综合评分：92/100"）和分项评分（人脸/色彩/精度/眼部）。')
add_bullet('检测通过的项显示绿色对勾，存在风险的项显示黄色警告并给出建议。')
add_bullet('用户可展开查看详细检测报告，包括检测到的问题位置和优化建议。')

add_heading_styled('5.3.2 用户反馈操作', level=3)
add_table(
    ['操作按钮', '位置', '功能说明', '后续行为'],
    [
        ['采纳并保存', '图片下方主按钮', '用户确认图片质量满意，设为当前主体基准图', '保存到资产库，记录为成功案例'],
        ['重新生成', '图片下方次按钮', '使用相同提示词重新生成（更换随机种子）', '再次调用生成服务，保留历史图'],
        ['修改提示词后生成', '图片下方次按钮', '返回提示词编辑区，用户调整后重新生成', '记录修改内容，用于模板优化'],
        ['标记问题', '图片右上角图标', '用户标记图片存在的具体问题（人脸崩坏/色偏/斗鸡眼/精度低）', '问题数据进入反馈库，用于模型和模板优化'],
    ],
    col_widths=[2.5, 2.5, 5.0, 4.0]
)

add_heading_styled('5.4 批量生成场景的用户确认', level=2)
add_body_text('对于批量生成角色/场景/道具图片的场景，采用"批量预览+逐个确认"的混合模式，兼顾效率和质量。', indent=False)
add_bullet('步骤1：用户选择多个主体，点击「批量生成」。')
add_bullet('步骤2：系统为每个主体生成优化后的提示词，展示批量预览列表（可展开查看每个主体的提示词）。')
add_bullet('步骤3：用户可逐个调整提示词，或点击「全部使用推荐提示词」一键确认。')
add_bullet('步骤4：用户点击「确认批量生成」，系统按顺序逐个生成，生成过程中可随时取消。')
add_bullet('步骤5：全部生成完成后，展示批量结果概览（成功数/需优化数/失败数），用户可逐个查看和处理。')

add_callout('批量生成场景下，系统默认对每个主体执行AI质量检测，检测不通过的自动重试1次（使用优化后的提示词），仍不通过的标记为"需人工确认"，不自动覆盖原有基准图。', 'warning')

doc.add_page_break()

# ============================================================
# 六、业务流程设计
# ============================================================
add_heading_styled('六、业务流程设计', level=1)

add_heading_styled('6.1 单主体图片生成完整流程', level=2)
add_body_text('以下为单个主体（角色/场景/道具）从信息填写到图片生成完成的完整业务流程，涵盖提示词优化、用户确认、AI生成、质量检测和反馈闭环。', indent=False)

add_image_with_caption(
    os.path.join(CHART_DIR, 'flowchart.png'),
    '图6-1  主体设置·提示词优化与图片生成流程图',
    width_inches=5.5
)

add_heading_styled('6.2 流程关键节点说明', level=2)

add_heading_styled('节点1：主体信息填写', level=3)
add_body_text('用户在主体编辑弹窗中填写主体名称、描述、上传参考图（可选）、选择风格和镜头类型。系统实时解析描述内容，提取特征标签并展示给用户确认。')

add_heading_styled('节点2：提示词智能优化', level=3)
add_body_text('提示词优化引擎根据用户输入，自动完成特征提取、模板匹配、六层结构组装、负面词组合和校验优化，输出优化后的正面提示词和负面提示词。')

add_heading_styled('节点3：用户预览与确认（核心新增）', level=3)
add_body_text('前端展示优化后的提示词预览，用户可选择：①直接确认使用系统推荐提示词；②展开编辑区手动调整提示词；③修改特征标签后重新生成提示词。确认后才进入生成环节。')

add_heading_styled('节点4：AI图片生成', level=3)
add_body_text('系统将用户确认后的正负提示词和生成参数传入AI模型网关，调度最优模型进行图片生成。支持多模型对比和自动重试机制。')

add_heading_styled('节点5：AI自动质量检测', level=3)
add_body_text('生成完成后，图像质量分析服务自动执行人脸完整性检测、色彩一致性检测、清晰度评估、眼部正常率检测，输出综合评分和分项报告。')

add_heading_styled('节点6：检测结果分支处理', level=3)
add_bullet('检测通过（综合评分≥阈值）：直接展示给用户进行人工确认。')
add_bullet('检测不通过且重试次数<2：系统自动调整提示词（如增强负面词、调整质量参数）后重新生成，最多重试2次。')
add_bullet('重试后仍不通过：标记为"需人工确认"，展示检测报告和问题说明，由用户决定是否采纳或重新生成。')

add_heading_styled('节点7：用户人工确认与反馈', level=3)
add_body_text('用户查看生成图片和质量报告，可选择采纳保存、重新生成、修改提示词后生成，或标记具体问题。用户反馈数据同步到提示词知识库，用于持续优化模板和规则。')

doc.add_page_break()

# ============================================================
# 七、跨角色协作泳道设计
# ============================================================
add_heading_styled('七、跨角色协作泳道设计', level=1)

add_heading_styled('7.1 泳道图概述', level=2)
add_body_text('以下泳道图展示了从用户进入主体设置页面到图片生成完成并保存的完整跨角色协作流程，涵盖用户、前端应用、提示词优化引擎、AI生成服务、质量检测服务五个参与方。', indent=False)

add_image_with_caption(
    os.path.join(CHART_DIR, 'swimlane.png'),
    '图7-1  主体设置与图片生成·跨角色协作泳道图',
    width_inches=6.5
)

add_heading_styled('7.2 各泳道职责说明', level=2)
add_table(
    ['参与方', '核心职责', '关键操作', '输入', '输出'],
    [
        ['用户/创作者', '提供主体信息，确认提示词，判断图片质量', '填写信息、预览确认、编辑提示词、采纳/重生成/标记问题', '主体描述、参考图、风格偏好', '确认的提示词、图片质量反馈'],
        ['前端应用层', '用户交互界面，数据收集与展示，请求转发', '表单收集、提示词渲染、生成请求提交、结果展示、历史记录', '用户输入、引擎返回的提示词、生成服务返回的图片', '主体信息请求、生成请求、用户反馈数据'],
        ['提示词优化引擎', '提示词智能组装与优化，模板管理', '特征提取、模板匹配、六层组装、负面词组合、校验优化、接收反馈迭代', '主体信息、用户编辑内容、反馈数据', '优化后的正负提示词、推荐参数、优化建议'],
        ['AI生成服务', '图片生成模型调度与执行', '模型选择、参数配置、生成执行、结果返回、重试管理', '正负提示词、生成参数、模型配置', '生成图片、生成元数据（模型/种子/耗时）'],
        ['质量检测服务', '生成图片的自动质量评估', '人脸检测、色彩分析、清晰度评估、眼部检测、综合评分', '生成图片、检测规则配置', '质量评分报告、问题标记、优化建议'],
    ],
    col_widths=[2.2, 3.0, 3.5, 3.0, 3.0]
)

add_heading_styled('7.3 关键协作节点', level=2)
add_bullet('用户↔前端：信息填写与提示词预览确认是最频繁的交互节点，前端需提供流畅的编辑体验和实时预览。', bold_prefix='节点A：')
add_bullet('前端↔提示词引擎：提示词生成请求是同步调用，要求引擎响应时间<2秒，避免用户等待。', bold_prefix='节点B：')
add_bullet('前端↔AI生成服务：图片生成是异步调用，前端需展示生成进度和取消机制，生成时间通常10-30秒。', bold_prefix='节点C：')
add_bullet('AI生成↔质量检测：生成完成后自动触发检测，检测过程异步执行，不阻塞用户操作。', bold_prefix='节点D：')
add_bullet('用户反馈↔提示词引擎：用户标记的问题和修改的提示词异步同步到引擎，用于模板持续优化，形成数据闭环。', bold_prefix='节点E：')

doc.add_page_break()

# ============================================================
# 八、技术实现方案
# ============================================================
add_heading_styled('八、技术实现方案', level=1)

add_heading_styled('8.1 前端技术实现', level=2)

add_heading_styled('8.1.1 涉及文件与组件', level=3)
add_table(
    ['文件/组件', '路径', '修改类型', '说明'],
    [
        ['AssetsView.vue', 'src/views/AIShortDrama/AssetsView.vue', '修改', '主体设置主页面，整合批量生成确认流程'],
        ['SubjectEditDialog.vue', 'src/components/AIShortDrama/SubjectEditDialog.vue', '重大修改', '主体编辑弹窗，新增提示词预览/编辑/确认区域'],
        ['PromptPreview.vue', 'src/components/AIShortDrama/PromptPreview.vue', '新增', '提示词预览组件，展示六层结构和负面提示词'],
        ['PromptEditor.vue', 'src/components/AIShortDrama/PromptEditor.vue', '新增', '提示词编辑组件，支持手动编辑和一键恢复'],
        ['QualityReport.vue', 'src/components/AIShortDrama/QualityReport.vue', '新增', '质量检测报告展示组件'],
        ['FeatureTagSelector.vue', 'src/components/AIShortDrama/FeatureTagSelector.vue', '新增', '特征标签选择器组件'],
        ['imageGenerator.ts', 'src/utils/imageGenerator.ts', '修改', '图片生成工具，增加负面提示词和优化参数传递'],
    ],
    col_widths=[3.5, 5.5, 2.0, 4.0]
)

add_heading_styled('8.1.2 核心数据结构', level=3)
add_callout(
    '// 优化后的提示词数据结构\n'
    'interface OptimizedPrompt {\n'
    '  positive: string;           // 完整正面提示词\n'
    '  negative: string;           // 完整负面提示词\n'
    '  layers: {                   // 六层结构（用于预览展示）\n'
    '    subject: string;          // L1 主体描述\n'
    '    features: string;         // L2 特征锁定\n'
    '    composition: string;      // L3 构图视角\n'
    '    quality: string;          // L4 质量增强\n'
    '    style: string;            // L5 风格光影\n'
    '  };\n'
    '  negativeCategories: string[]; // 负面词分类标签\n'
    '  templateId: string;         // 使用的模板ID\n'
    '  recommendedParams: {        // 推荐生成参数\n'
    '    steps: number;\n'
    '    cfgScale: number;\n'
    '    sampler: string;\n'
    '  };\n'
    '  isCustomized: boolean;      // 用户是否修改过\n'
    '}',
    'info'
)

add_heading_styled('8.2 后端技术实现', level=2)

add_heading_styled('8.2.1 提示词优化引擎服务', level=3)
add_bullet('接口设计：POST /api/prompt/optimize，入参为主体信息（名称/类型/描述/参考图/风格/镜头），出参为OptimizedPrompt结构。')
add_bullet('特征提取：基于规则+NLP的混合方案，从描述文本中提取人物特征关键词，支持自定义词典扩展。')
add_bullet('模板匹配：基于标签的精确匹配+相似度匹配，支持模板版本管理和A/B测试。')
add_bullet('组装与校验：按六层结构组装，执行去重、冲突检测、长度优化、关键词权重排序。')

add_heading_styled('8.2.2 图像质量检测服务', level=3)
add_table(
    ['检测项', '技术方案', '输出指标', '阈值建议'],
    [
        ['人脸完整性', '人脸检测模型（如MTCNN/RetinaFace）+ 五官关键点检测', '人脸数量、五官完整度、面部置信度', '置信度≥0.85，五官关键点≥68个'],
        ['眼部正常率', '眼部区域裁剪 + 瞳孔位置检测 + 对称性分析', '瞳孔间距比、双眼对称度、视线方向一致性', '对称度≥0.8，瞳孔位置正常'],
        ['色彩一致性', '肤色区域提取 + 色彩分布分析 + 白平衡评估', '肤色均值/方差、色偏角度、白平衡误差', '色偏角度≤15°，肤色在正常范围'],
        ['清晰度/精度', '拉普拉斯方差 + 频域分析 + 边缘密度评估', '清晰度评分、边缘密度、噪声水平', '清晰度评分≥70（百分制）'],
        ['综合评分', '加权融合各分项得分，结合历史数据校准', '0-100综合评分 + 等级（优秀/良好/一般/较差）', '≥80为通过，60-80为警告，<60为不通过'],
    ],
    col_widths=[2.2, 4.5, 4.0, 4.0]
)

add_heading_styled('8.2.3 数据库设计变更', level=3)
add_bullet('prompt_template表：新增，存储提示词模板（ID/类型/适用条件/正面模板/负面模板/参数/版本/状态）。')
add_bullet('prompt_optimization_log表：新增，记录每次提示词优化的输入输出和用户反馈。')
add_bullet('image_quality_report表：新增，存储每张生成图片的质量检测报告。')
add_bullet('subject表扩展：增加 optimized_prompt（JSON）、quality_score、user_feedback 等字段。')

add_heading_styled('8.3 API接口设计', level=2)
add_table(
    ['接口', '方法', '路径', '功能说明', '关键入参', '关键出参'],
    [
        ['优化提示词', 'POST', '/api/prompt/optimize', '根据主体信息生成优化后的提示词', 'subjectInfo(名称/类型/描述/风格/镜头)', 'optimizedPrompt(正面/负面/六层结构/参数)'],
        ['生成图片', 'POST', '/api/image/generate', '使用优化后的提示词生成图片', 'prompt(正面/负面), params(分辨率/模型/数量)', 'imageUrl, taskId, metadata'],
        ['质量检测', 'POST', '/api/image/quality-check', '对生成图片进行AI质量检测', 'imageUrl', 'score, details(人脸/色彩/精度/眼部), suggestions'],
        ['反馈提交', 'POST', '/api/prompt/feedback', '提交用户反馈用于模板优化', 'imageId, promptId, feedback(采纳/重生成/问题标记)', 'success, message'],
        ['模板管理', 'GET/PUT', '/api/prompt/templates', '查询/更新提示词模板', 'templateId, templateData', 'templateList或更新结果'],
    ],
    col_widths=[2.0, 1.2, 3.5, 3.0, 3.5, 3.5]
)

doc.add_page_break()

# ============================================================
# 九、测试验收方案
# ============================================================
add_heading_styled('九、测试验收方案', level=1)

add_heading_styled('9.1 测试策略', level=2)
add_body_text('采用"单元测试+集成测试+功能测试+性能测试+用户验收测试"五层测试策略，确保提示词优化功能的质量和稳定性。', indent=False)

add_heading_styled('9.2 功能测试用例', level=2)

add_heading_styled('9.2.1 提示词优化引擎测试', level=3)
add_table(
    ['用例编号', '测试场景', '前置条件', '操作步骤', '预期结果', '优先级'],
    [
        ['TC-PO-001', '角色主体提示词优化', '有角色描述信息', '输入角色名称+描述，调用优化接口', '返回六层结构完整的正面提示词+分级负面提示词，特征词与输入匹配', 'P0'],
        ['TC-PO-002', '场景主体提示词优化', '有场景描述信息', '输入场景名称+描述，调用优化接口', '返回场景类提示词，包含环境/光线/氛围等关键词，负面词适配场景', 'P0'],
        ['TC-PO-003', '道具主体提示词优化', '有道具描述信息', '输入道具名称+描述，调用优化接口', '返回道具类提示词，包含材质/颜色/细节等关键词', 'P0'],
        ['TC-PO-004', '空描述容错', '描述为空', '仅输入名称，调用优化接口', '返回基于名称的基础提示词，给出"描述信息不足"的提示', 'P1'],
        ['TC-PO-005', '风格切换验证', '选择不同风格', '分别选择写实/国风/动漫风格调用', '不同风格返回的风格层关键词有明显差异，匹配对应风格特征', 'P1'],
        ['TC-PO-006', '负面词完整性', '任意主体', '调用优化接口后检查负面提示词', '包含通用低质量词+主体类型专属问题词（如角色含人脸崩坏/斗鸡眼）', 'P0'],
        ['TC-PO-007', '提示词长度控制', '长描述输入', '输入500字以上描述', '优化后正面提示词控制在合理范围，无冗余重复，关键信息不丢失', 'P1'],
    ],
    col_widths=[1.8, 2.5, 2.0, 3.0, 4.0, 1.2]
)

add_heading_styled('9.2.2 用户确认交互测试', level=3)
add_table(
    ['用例编号', '测试场景', '操作步骤', '预期结果', '优先级'],
    [
        ['TC-UC-001', '提示词预览展示', '打开主体编辑弹窗，填写信息后查看预览区', '正确展示优化后的提示词摘要，可展开查看六层结构和负面词', 'P0'],
        ['TC-UC-002', '提示词手动编辑', '点击编辑，修改正面提示词后保存', '修改后的提示词被使用，显示"已自定义"标签，可一键恢复推荐', 'P0'],
        ['TC-UC-003', '确认按钮状态', '分别测试必填信息完整/不完整场景', '信息完整时按钮可点击，不完整时禁用并提示原因', 'P0'],
        ['TC-UC-004', '首次生成二次确认', '首次点击确认生成按钮', '弹出轻量确认框，用户确认后才开始生成', 'P1'],
        ['TC-UC-005', '特征不完整提醒', '人物角色缺少性别/年龄等关键特征', '点击生成时弹出确认框，提示特征不完整，用户可选择继续或补充', 'P1'],
        ['TC-UC-006', '批量生成确认', '选择多个主体批量生成', '展示批量提示词预览列表，支持逐个调整和全部确认，确认后按顺序生成', 'P0'],
    ],
    col_widths=[1.8, 2.5, 4.0, 4.5, 1.2]
)

add_heading_styled('9.2.3 质量检测与反馈测试', level=3)
add_table(
    ['用例编号', '测试场景', '操作步骤', '预期结果', '优先级'],
    [
        ['TC-QC-001', '正常图片检测', '生成一张质量良好的图片，触发检测', '综合评分≥80，各分项正常，无问题标记', 'P0'],
        ['TC-QC-002', '人脸崩坏图片识别', '使用已知人脸崩坏的图片进行检测', '人脸完整性项评分低，标记"人脸崩坏"风险，给出优化建议', 'P0'],
        ['TC-QC-003', '斗鸡眼图片识别', '使用已知斗鸡眼的图片进行检测', '眼部正常率项评分低，标记"眼部异常"风险', 'P0'],
        ['TC-QC-004', '色彩异常图片识别', '使用已知色偏的图片进行检测', '色彩一致性项评分低，标记"色彩异常"风险', 'P1'],
        ['TC-QC-005', '低精度图片识别', '使用模糊/低分辨率图片进行检测', '清晰度项评分低，标记"精度不足"风险', 'P1'],
        ['TC-QC-006', '自动重试机制', '生成图片检测不通过', '系统自动优化提示词并重试，最多2次，重试过程有状态展示', 'P0'],
        ['TC-QC-007', '用户问题标记', '用户点击"标记问题"并选择问题类型', '问题数据被记录，同步到反馈库，提示词模板收到优化信号', 'P1'],
    ],
    col_widths=[1.8, 2.5, 4.0, 4.5, 1.2]
)

add_heading_styled('9.3 性能测试指标', level=2)
add_table(
    ['测试项', '指标要求', '测试方法', '备注'],
    [
        ['提示词优化接口响应时间', 'P95 ≤ 2秒', '压测工具模拟100并发请求', '含特征提取+模板匹配+组装校验'],
        ['图片生成接口响应时间', 'P95 ≤ 30秒（单图）', '实际生成请求统计', '受AI模型服务性能影响'],
        ['质量检测接口响应时间', 'P95 ≤ 5秒', '压测工具模拟50并发', '含多模型推理调用'],
        ['前端页面加载时间', '≤ 3秒', '浏览器性能监控', '主体设置页面首次加载'],
        ['提示词预览渲染时间', '≤ 500ms', '前端性能埋点', '从收到优化结果到渲染完成'],
    ],
    col_widths=[3.5, 3.0, 4.0, 4.5]
)

add_heading_styled('9.4 验收标准', level=2)
add_bullet('功能验收：所有P0级测试用例100%通过，P1级测试用例通过率≥95%，无阻塞性Bug。', bold_prefix='标准一：')
add_bullet('性能验收：提示词优化接口P95响应时间≤2秒，页面交互流畅无明显卡顿。', bold_prefix='标准二：')
add_bullet('质量验收：在标准测试集（100张角色图）上，人脸完整率≥95%，眼部正常率≥95%，色彩一致率≥90%，综合评分≥80分占比≥85%。', bold_prefix='标准三：')
add_bullet('用户体验验收：产品经理+5名内测用户试用，满意度评分≥4分（5分制），核心流程无理解障碍。', bold_prefix='标准四：')
add_bullet('文档验收：技术文档、接口文档、用户操作手册齐全，测试报告完整。', bold_prefix='标准五：')

doc.add_page_break()

# ============================================================
# 十、项目排期与风险管理
# ============================================================
add_heading_styled('十、项目排期与风险管理', level=1)

add_heading_styled('10.1 项目排期', level=2)
add_table(
    ['阶段', '周期', '主要任务', '交付物', '负责人'],
    [
        ['需求评审与设计', '第1周', '需求评审、产品原型设计、UI设计、技术方案评审', '产品原型图、UI设计稿、技术方案文档', '产品/设计/技术负责人'],
        ['前端开发', '第2-3周', '主体编辑弹窗升级、提示词预览/编辑组件、特征标签选择器、质量报告组件、批量确认流程', '前端代码、组件库', '前端开发'],
        ['后端开发', '第2-3周', '提示词优化引擎、模板库管理、质量检测服务、API接口、数据库变更', '后端服务、API文档、数据库脚本', '后端开发'],
        ['AI模型集成', '第3周', '质量检测模型集成调优、多模型调度策略、提示词模板初始化', '模型配置、模板库初始数据', '算法工程师'],
        ['联调测试', '第4周', '前后端联调、功能测试、性能测试、Bug修复、测试报告', '测试报告、Bug修复记录', '测试团队'],
        ['用户验收与上线', '第5周', '内测用户验收、产品验收、生产环境部署、上线监控、用户操作手册', '上线版本、用户手册、运维文档', '产品/运维'],
    ],
    col_widths=[2.2, 1.5, 5.0, 3.5, 2.5]
)

add_heading_styled('10.2 风险管理', level=2)
add_table(
    ['风险编号', '风险描述', '风险等级', '影响分析', '应对措施', '负责人'],
    [
        ['R001', '质量检测模型准确率不达预期', '高', '自动检测和重试机制失效，用户体验提升有限', '提前进行模型选型和测试集验证；预留人工确认兜底；分阶段上线（先检测不自动重试）', '算法负责人'],
        ['R002', '提示词优化效果不稳定，不同模型差异大', '中高', '部分模型生成质量提升不明显，用户满意度不均', '建立模型-模板映射关系，针对主流模型单独调优；支持用户选择模型后动态调整模板', '产品/算法'],
        ['R003', '用户确认环节增加操作步骤，影响批量生成效率', '中', '重度用户可能觉得流程变长，影响使用体验', '提供"记住我的选择"和"一键全部确认"快捷操作；批量场景优化预览效率；新用户引导说明价值', '产品/设计'],
        ['R004', '前端弹窗内容过多，页面布局拥挤', '中', '用户体验下降，关键信息被忽略', '采用分区折叠设计，默认展示核心信息；优化弹窗尺寸和滚动体验；UI设计阶段充分评审', '设计/前端'],
        ['R005', '提示词模板库维护成本高，需要持续运营', '中低', '模板覆盖不全时优化效果打折', '建立模板贡献和审核流程；基于用户反馈数据自动推荐模板优化方向；初期覆盖Top场景，后续迭代扩展', '产品/运营'],
        ['R006', 'AI生成服务接口变更或限流', '低', '生成功能不稳定或失败率上升', '做好多模型容灾备份；接口适配层隔离变更；监控告警机制；降级方案（使用基础提示词）', '后端/运维'],
    ],
    col_widths=[1.2, 3.0, 1.2, 3.0, 4.5, 1.8]
)

add_heading_styled('10.3 后续迭代规划', level=2)
add_bullet('V1.1（上线后1个月）：基于用户反馈数据优化提示词模板，新增风格模板（赛博朋克/复古/水墨等），优化质量检测模型准确率。', bold_prefix='短期迭代：')
add_bullet('V1.2（上线后2-3个月）：支持用户自定义提示词模板保存和分享；增加A/B测试能力，自动选择最优模板；支持参考图的特征提取（图生提示词）。', bold_prefix='中期迭代：')
add_bullet('V2.0（上线后6个月）：基于大模型的提示词自动优化（用户描述→大模型直接生成高质量提示词）；跨主体一致性优化（同一角色在不同场景下的视觉一致性）；视频生成环节的提示词优化复用。', bold_prefix='长期规划：')

# 文档末尾
doc.add_paragraph()
end_para = doc.add_paragraph()
end_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
set_paragraph_format(end_para, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=20, space_after=6, line_spacing=1.5)
end_run = end_para.add_run('— 文档结束 —')
set_font(end_run, size=11, bold=True, color=COLOR_LIGHT)

info_para = doc.add_paragraph()
info_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
set_paragraph_format(info_para, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=6, line_spacing=1.5)
info_run = info_para.add_run('本文档为AI短剧创作系统内部产品方案，请勿外传')
set_font(info_run, size=9, color=COLOR_LIGHT)

# ========== 保存文档 ==========
doc.save(OUTPUT_PATH)
print(f'文档已生成: {OUTPUT_PATH}')
print(f'文件大小: {os.path.getsize(OUTPUT_PATH) / 1024:.1f} KB')
