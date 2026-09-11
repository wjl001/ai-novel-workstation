#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""生成基于 Hermes Agent 多轮对话的图片生成提示词优化产品方案 - 完整版（详细版）"""

from docx import Document
from docx.shared import Inches, Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

def set_font(run, name='微软雅黑', size=12, bold=False, color=None):
    run.font.name = name
    run.font.size = Pt(size)
    run.font.bold = bold
    if color:
        run.font.color.rgb = RGBColor(*color)
    run._element.rPr.rFonts.set(qn('w:eastAsia'), name)

def add_heading(doc, text, level=1):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    run = p.add_run(text)
    sizes = {1: 18, 2: 15, 3: 13, 4: 12}
    set_font(run, size=sizes.get(level, 12), bold=True, color=(30, 58, 138))
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(6)
    return p

def add_para(doc, text, size=11, bold=False, indent=True, color=None):
    p = doc.add_paragraph()
    if indent:
        p.paragraph_format.first_line_indent = Pt(22)
    run = p.add_run(text)
    set_font(run, size=size, bold=bold, color=color)
    p.paragraph_format.line_spacing = 1.5
    p.paragraph_format.space_after = Pt(4)
    return p

def add_bullet(doc, text, size=11, level=0):
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Pt(22 + level * 22)
    run = p.add_run('● ' + text)
    set_font(run, size=size)
    p.paragraph_format.line_spacing = 1.5
    p.paragraph_format.space_after = Pt(2)
    return p

def add_table(doc, headers, rows, col_widths=None):
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = 'Table Grid'
    for i, h in enumerate(headers):
        cell = table.rows[0].cells[i]
        cell.text = ''
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run(h)
        set_font(run, size=10, bold=True, color=(255, 255, 255))
        shading = OxmlElement('w:shd')
        shading.set(qn('w:fill'), '1E3A8A')
        cell._tc.get_or_add_tcPr().append(shading)
    for r_idx, row in enumerate(rows):
        for c_idx, val in enumerate(row):
            cell = table.rows[r_idx + 1].cells[c_idx]
            cell.text = ''
            p = cell.paragraphs[0]
            run = p.add_run(str(val))
            set_font(run, size=10)
            if r_idx % 2 == 1:
                shading = OxmlElement('w:shd')
                shading.set(qn('w:fill'), 'F0F4FF')
                cell._tc.get_or_add_tcPr().append(shading)
    if col_widths:
        for i, w in enumerate(col_widths):
            for row in table.rows:
                row.cells[i].width = Cm(w)
    return table

def add_flow_box(doc, title, content='', color=(30, 58, 138)):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.rows[0].cells[0]
    cell.text = ''
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run(title)
    set_font(run, size=11, bold=True, color=(255, 255, 255))
    shading = OxmlElement('w:shd')
    shading.set(qn('w:fill'), '%02X%02X%02X' % color)
    cell._tc.get_or_add_tcPr().append(shading)
    if content:
        p2 = cell.add_paragraph()
        p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run2 = p2.add_run(content)
        set_font(run2, size=9, color=(255, 255, 255))
    return table

def add_arrow(doc):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run('↓')
    set_font(run, size=16, bold=True, color=(30, 58, 138))

def add_code_block(doc, text, title=''):
    if title:
        p = doc.add_paragraph()
        run = p.add_run(title)
        set_font(run, size=10, bold=True, color=(100, 100, 100))
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.rows[0].cells[0]
    cell.text = ''
    shading = OxmlElement('w:shd')
    shading.set(qn('w:fill'), 'F8F9FA')
    cell._tc.get_or_add_tcPr().append(shading)
    for line in text.split('\n'):
        p = cell.add_paragraph()
        run = p.add_run(line)
        set_font(run, size=10, color=(50, 50, 50))
        p.paragraph_format.space_after = Pt(2)

# 创建文档
doc = Document()
style = doc.styles['Normal']
style.font.name = '微软雅黑'
style.font.size = Pt(11)
style._element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')

# ========== 封面 ==========
for _ in range(4):
    doc.add_paragraph()

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run('人工智能短剧创作系统')
set_font(run, size=28, bold=True, color=(30, 58, 138))

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run('图片生成提示词优化产品方案')
set_font(run, size=24, bold=True, color=(30, 58, 138))

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run('—— 基于 Hermes Agent 多轮对话智能优化 ——')
set_font(run, size=16, color=(100, 100, 100))

for _ in range(2):
    doc.add_paragraph()

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run('【完整版 · 详细实施手册】')
set_font(run, size=18, bold=True, color=(220, 38, 38))

for _ in range(5):
    doc.add_paragraph()

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run('面向：产品部 · 研发部 · 测试部 · 运营部')
set_font(run, size=12, color=(100, 100, 100))

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run('版本：V2.0（Hermes Agent 多轮对话详细版）')
set_font(run, size=12, color=(100, 100, 100))

doc.add_page_break()

# ========== 目录 ==========
add_heading(doc, '目录', level=1)
toc_items = [
    '一、项目背景与问题分析',
    '二、产品目标与核心价值',
    '三、产品架构设计（含详细架构图）',
    '四、Hermes Agent 多轮对话优化机制（详细实施）',
    '五、提示词 Skills 模板库详解（92套完整列举）',
    '六、角色三视图设定专项设计（详细实施）',
    '七、主体设置页面交互设计（含用户确认）',
    '八、业务流程设计（含详细流程图）',
    '九、跨角色协作泳道设计',
    '十、技术实现方案',
    '十一、测试验收方案',
    '十二、项目排期与风险管理',
]
for item in toc_items:
    p = doc.add_paragraph()
    run = p.add_run(item)
    set_font(run, size=12)
    p.paragraph_format.space_after = Pt(6)

doc.add_page_break()

# ========== 第一章 ==========
add_heading(doc, '一、项目背景与问题分析', level=1)

add_heading(doc, '1.1 项目背景', level=2)
add_para(doc, '人工智能短剧创作系统是一款面向短剧创作者的全流程人工智能辅助工具，覆盖剧本生成、大纲拆解、主体资产管理、分镜生成、视频合成等核心环节。其中，主体资产管理模块（角色、场景、道具）是整个系统的视觉基础，其图片生成质量直接决定了最终短剧视频的视觉效果和用户体验。')
add_para(doc, '当前系统已实现主体图片的批量生成与单张重生成功能，但在实际使用过程中，用户反馈图片生成质量不稳定，尤其在人物角色图片方面存在多种典型问题，严重影响创作效率和成品质量。')
add_para(doc, '为解决上述问题，本方案提出基于 Hermes Agent 底层多轮对话的提示词智能优化方案。与传统基于规则的模板匹配不同，本方案借鉴短剧编剧模块（骨架生成器、大纲填充器、主模板）和视频生成模块（分镜拆解、镜头拆解）的成熟多轮对话经验，通过 Hermes Agent 底层进行多轮隐式对话，反复迭代优化提示词。')
add_para(doc, '核心特点：界面不显示对话内容，所有优化过程在 Hermes 底层通过多轮隐式对话完成，用户仅需确认最终优化结果。同时，多轮对话的上下文会自动融入当前剧集和剧本的相关信息，确保优化方向与剧情需求一致。')

add_heading(doc, '1.2 现存问题详细分析', level=2)
add_para(doc, '通过对近一个月用户生成图片的抽样分析与用户反馈收集，我们梳理出以下四类高频问题：')

problems = [
    ['问题类型', '表现描述', '发生频率', '影响程度', '典型案例'],
    ['图片生成精度不高', '画面模糊、细节丢失、纹理不清晰、边缘锯齿明显，整体画质偏低', '约45%', '高', '角色服装纹理模糊，场景建筑细节丢失'],
    ['人物图片色彩异常', '人物皮肤出现非自然色块、服饰颜色溢出、背景色污染主体、色彩断层', '约32%', '高', '角色脸部出现紫色色块，红色衣服染到背景'],
    ['斗鸡眼问题', '人物双眼视线不聚焦、瞳孔位置偏移、双眼朝向不一致，呈现斗鸡眼状态', '约28%', '极高', '角色双眼看向不同方向，瞳孔向内靠拢'],
    ['人脸崩坏', '面部五官扭曲、脸型变形、五官比例失调、多脸或残脸现象', '约25%', '极高', '角色嘴巴歪斜，眼睛一大一小，出现两张脸'],
]
add_table(doc, problems[0], problems[1:], col_widths=[2.5, 4.5, 1.8, 1.8, 3.5])

add_heading(doc, '1.3 问题根因总结', level=2)
add_para(doc, '综合以上分析，当前图片生成质量问题的核心根因可归纳为以下四点：')
add_bullet(doc, '第一点：提示词结构过于简单。现有提示词仅包含基础描述加通用风格词（如"写实风格，电影级光影，超高清分辨率"），缺少结构化的质量控制层、特征锁定层、负面排除层，无法有效引导模型生成高质量图片。')
add_bullet(doc, '第二点：缺少迭代优化机制。当前提示词为一次性生成，缺少多轮迭代优化过程，无法根据模型反馈和问题特征进行针对性调整。')
add_bullet(doc, '第三点：缺少剧情上下文。提示词优化时未考虑主体所属的剧集、剧本、场景情绪等上下文信息，导致优化方向与剧情需求脱节。')
add_bullet(doc, '第四点：无质量检测与自动优化闭环。生成后缺少自动质量检测环节，问题图片无法被自动识别和重试优化，全部依赖用户人工判断和手动重生成。')

doc.add_page_break()

# ========== 第二章 ==========
add_heading(doc, '二、产品目标与核心价值', level=1)

add_heading(doc, '2.1 产品目标', level=2)
goals = [
    ['目标维度', '具体指标', '当前基线', '目标值', '衡量方式'],
    ['图片一次成功率', '首次生成即满足用户需求的比例', '约55%', '≥85%', '用户调研+系统统计'],
    ['人脸崩坏率', '人物图片出现面部五官扭曲的比例', '约25%', '≤5%', '批量生成+人工审核'],
    ['斗鸡眼发生率', '人物图片出现双眼视线异常的比例', '约28%', '≤3%', '批量生成+算法检测'],
    ['色彩异常率', '图片出现非自然色块或颜色溢出的比例', '约32%', '≤8%', '批量生成+算法检测'],
    ['用户重生成次数', '平均每个主体需要重生成的次数', '2.8次', '≤1.2次', '系统日志统计'],
    ['提示词优化耗时', '系统完成提示词优化的平均时间', '无优化', '≤8秒', '性能测试'],
    ['用户满意度', '用户对图片生成质量的满意度评分', '6.2分', '≥8.5分', '用户调研问卷'],
]
add_table(doc, goals[0], goals[1:], col_widths=[2.5, 4, 2, 2, 3])

add_heading(doc, '2.2 核心价值', level=2)
add_bullet(doc, '用户价值：对创作者，大幅提升图片生成质量与一次成功率，减少反复调整和重生成的时间成本，让创作者更专注于内容创作本身。')
add_bullet(doc, '产品价值：对产品，建立"Hermes Agent 多轮对话提示词优化引擎加质量检测闭环"的技术壁垒，提升产品核心竞争力和用户留存率。')
add_bullet(doc, '团队价值：对团队，通过 Hermes Agent 多轮对话的隐式优化机制和用户确认机制，降低生成结果的不可控性，减少售后问题和用户投诉。')
add_bullet(doc, '技术价值：对技术，探索 Hermes Agent 在视觉生成提示词优化领域的应用，为后续视频生成提示词优化、分镜脚本优化等场景积累经验。')

doc.add_page_break()

print('第一、二章完成，继续编写第三章...')

# 保存中间结果
output_path = r'D:\phpstudy_pro\WWW\ai-novel-workstation1.2.0\人工智能短剧系统_图片生成提示词优化产品方案_HermesAgent完整版V2.docx'
doc.save(output_path)
print(f'中间文档已保存：{output_path}')
