# -*- coding: utf-8 -*-
"""
生成新增厂商/新增模型接入流程与工作量评估文档（面向领导汇报）
"""
from docx import Document
from docx.shared import Inches, Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml.ns import qn, nsdecls
from docx.oxml import parse_xml
import os

OUTPUT_DIR = r'D:\phpstudy_pro\WWW\ai-novel-workstation1.2.0\doc_asset_platform'
FONT_NAME = '微软雅黑'

doc = Document()

def set_font(run, size=12, bold=False, color=None):
    run.font.name = FONT_NAME
    run.font.size = Pt(size)
    run.font.bold = bold
    if color:
        run.font.color.rgb = color
    r = run._element
    rPr = r.find(qn('w:rPr'))
    if rPr is None:
        rPr = parse_xml(f'<w:rPr {nsdecls("w")}></w:rPr>')
        r.insert(0, rPr)
    rFonts = rPr.find(qn('w:rFonts'))
    if rFonts is None:
        rFonts = parse_xml(f'<w:rFonts {nsdecls("w")} w:eastAsia="{FONT_NAME}" w:ascii="{FONT_NAME}" w:hAnsi="{FONT_NAME}"/>')
        rPr.insert(0, rFonts)
    else:
        rFonts.set(qn('w:eastAsia'), FONT_NAME)
        rFonts.set(qn('w:ascii'), FONT_NAME)
        rFonts.set(qn('w:hAnsi'), FONT_NAME)

def set_para_format(para, align=WD_ALIGN_PARAGRAPH.JUSTIFY, indent=True,
                     sb=0, sa=0, ls=1.5):
    para.alignment = align
    pf = para.paragraph_format
    pf.space_before = Pt(sb)
    pf.space_after = Pt(sa)
    pf.line_spacing = ls
    pf.first_line_indent = Pt(24) if indent else Pt(0)

def add_heading(text, level=1):
    sizes = {1: 16, 2: 14, 3: 12}
    sb_map = {1: 18, 2: 14, 3: 10}
    sa_map = {1: 8, 2: 6, 3: 4}
    para = doc.add_paragraph()
    set_para_format(para, align=WD_ALIGN_PARAGRAPH.LEFT, indent=False,
                     sb=sb_map.get(level, 10), sa=sa_map.get(level, 4))
    run = para.add_run(text)
    set_font(run, size=sizes.get(level, 12), bold=True, color=RGBColor(0, 0, 0))
    para.style = doc.styles[f'Heading {level}']
    for run in para.runs:
        set_font(run, size=sizes.get(level, 12), bold=True, color=RGBColor(0, 0, 0))
    return para

def add_body(text, bold=False, indent=True):
    para = doc.add_paragraph()
    set_para_format(para, indent=indent)
    run = para.add_run(text)
    set_font(run, size=12, bold=bold)
    return para

def add_caption(text):
    para = doc.add_paragraph()
    set_para_format(para, align=WD_ALIGN_PARAGRAPH.CENTER, indent=False, sb=4, sa=8, ls=1.0)
    run = para.add_run(text)
    set_font(run, size=10.5)
    return para

def add_image(path, width=6.0):
    para = doc.add_paragraph()
    set_para_format(para, align=WD_ALIGN_PARAGRAPH.CENTER, indent=False, sb=6, sa=2, ls=1.0)
    run = para.add_run()
    run.add_picture(path, width=Inches(width))
    return para

def set_cell(cell, text, size=10.5, bold=False, align=WD_ALIGN_PARAGRAPH.LEFT, bg=None):
    cell.text = ''
    para = cell.paragraphs[0]
    para.alignment = align
    pf = para.paragraph_format
    pf.first_line_indent = Pt(0)
    pf.space_before = Pt(2)
    pf.space_after = Pt(2)
    pf.line_spacing = 1.15
    run = para.add_run(text)
    set_font(run, size=size, bold=bold)
    cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    if bg:
        shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{bg}"/>')
        cell._tc.get_or_add_tcPr().append(shading)

def add_table(headers, rows, widths=None):
    table = doc.add_table(rows=1+len(rows), cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = 'Table Grid'
    for i, h in enumerate(headers):
        set_cell(table.rows[0].cells[i], h, size=10.5, bold=True,
                 align=WD_ALIGN_PARAGRAPH.CENTER, bg='D9D9D9')
    for r, row in enumerate(rows):
        for c, val in enumerate(row):
            al = WD_ALIGN_PARAGRAPH.CENTER if c == 0 else WD_ALIGN_PARAGRAPH.LEFT
            set_cell(table.rows[r+1].cells[c], str(val), size=10.5, align=al)
    if widths:
        for i, w in enumerate(widths):
            for row in table.rows:
                row.cells[i].width = Cm(w)
    doc.add_paragraph()
    return table

# 页面设置
section = doc.sections[0]
section.page_width = Cm(21)
section.page_height = Cm(29.7)
section.top_margin = Cm(2.5)
section.bottom_margin = Cm(2.5)
section.left_margin = Cm(2.5)
section.right_margin = Cm(2.5)

normal_style = doc.styles['Normal']
normal_style.font.name = FONT_NAME
normal_style.font.size = Pt(12)
normal_style.element.rPr.rFonts.set(qn('w:eastAsia'), FONT_NAME)

# ============================================================
# 标题
# ============================================================
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(40)
p.paragraph_format.space_after = Pt(8)
r = p.add_run('AI内容生成平台')
set_font(r, size=22, bold=True)

p2 = doc.add_paragraph()
p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
p2.paragraph_format.space_after = Pt(20)
r2 = p2.add_run('新增厂商与新增模型接入流程及工作量评估')
set_font(r2, size=18, bold=True)

p3 = doc.add_paragraph()
p3.alignment = WD_ALIGN_PARAGRAPH.CENTER
p3.paragraph_format.space_after = Pt(30)
r3 = p3.add_run('（含模型价格成本测算）')
set_font(r3, size=14, bold=False, color=RGBColor(100, 100, 100))

# 信息表
info = doc.add_table(rows=4, cols=2)
info.alignment = WD_TABLE_ALIGNMENT.CENTER
info.style = 'Table Grid'
info_data = [('文档版本', 'V1.0'), ('编制日期', '2026-09-08'),
             ('文档状态', '汇报稿'), ('适用对象', '技术管理层 / 项目决策层')]
for i, (k, v) in enumerate(info_data):
    set_cell(info.rows[i].cells[0], k, size=11, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, bg='F2F2F2')
    set_cell(info.rows[i].cells[1], v, size=11)
for row in info.rows:
    row.cells[0].width = Cm(4)
    row.cells[1].width = Cm(8)

doc.add_page_break()

# ============================================================
# 1. 核心结论（领导先看结论）
# ============================================================
add_heading('1. 核心结论', level=1)

add_body('基于现有平台已完成的统一模型接入架构、厂商适配器模式和真人资产管理能力，新增厂商或新增模型的接入工作量已大幅降低。核心结论如下：', bold=False)

add_table(
    ['场景', '典型工作量', '周期', '主要工作类型'],
    [
        ['已有厂商新增模型（同类型）', '0.5 ~ 1.5 人天', '1 ~ 2 个工作日', '以配置为主，少量开发'],
        ['已有厂商新增模型（新类型）', '2 ~ 4 人天', '3 ~ 5 个工作日', '适配器扩展 + 配置 + 测试'],
        ['新增厂商接入（含资产库）', '5 ~ 8 人天', '1 ~ 2 周', '适配器开发 + 配置 + 联调'],
        ['新增厂商接入（无资产库，纯API）', '3 ~ 5 人天', '1 周左右', '适配器开发 + 配置 + 联调'],
    ],
    widths=[4.5, 3, 3, 4.5]
)

add_body('说明：以上估算基于1名后端开发 + 0.5名前端开发（按需）的投入，不含商务谈判、账号开通等待时间。若厂商接口规范、文档完善，实际工作量可进一步压缩。')

# ============================================================
# 2. 新增厂商接入流程与工作量
# ============================================================
add_heading('2. 新增厂商接入流程与工作量', level=1)

add_heading('2.1 接入流程', level=2)
add_body('新增厂商接入遵循"评估 → 配置 → 开发 → 注册 → 测试 → 上线"六步流程。由于平台已抽象出统一的厂商适配器接口，新增厂商只需实现该接口并注册即可，无需修改核心业务流程。')

add_image(os.path.join(OUTPUT_DIR, 'fig_new_vendor_flow.png'), width=5.5)
add_caption('图1  新增厂商接入流程图')

add_heading('2.2 工作量明细', level=2)
add_table(
    ['步骤', '工作内容', '类型', '人天', '说明'],
    [
        ['① 需求评估', '确认厂商模型能力、接口规范、商务报价、是否需要资产库', '配置', '0.5', '与产品/商务协同'],
        ['② 账号与配置', '开通厂商账号、获取API密钥、配置厂商基础信息', '配置', '0.5', '含鉴权方式配置'],
        ['③ 适配器开发', '实现统一适配器接口（生文/生图/生视频调用）；如厂商有资产库要求，额外实现资产上传/查询/删除接口', '开发', '2 ~ 4', '核心开发工作量；有资产库的厂商取上限'],
        ['④ 模型注册', '在模型管理后台注册该厂商下的所有模型，配置路由规则、默认参数、限流策略', '配置', '0.5 ~ 1', '模型数量多取上限'],
        ['⑤ 前端适配', '如前端模型选择器为静态配置，需新增选项；如为动态读取则无需改动', '开发', '0 ~ 0.5', '多数情况无需改动'],
        ['⑥ 联调测试', '生文/生图/生视频各场景验证、真人资产同步验证、异常与限流测试', '测试', '1 ~ 1.5', '含前后端联调'],
        ['⑦ 上线发布', '灰度配置、监控告警、账单核对、正式发布', '配置', '0.5', ''],
        ['合计', '', '', '5 ~ 8.5', '含资产库的新增厂商约7-8人天；纯API厂商约5-6人天'],
    ],
    widths=[2, 5.5, 1.5, 1.5, 4.5]
)

add_heading('2.3 关键影响因素', level=2)
add_body('新增厂商的实际工作量主要受以下因素影响：')
add_body('（1）厂商接口规范程度：接口文档完善、遵循OpenAI兼容协议的厂商，适配器开发可压缩至1-2人天；接口私有、文档缺失的厂商可能需要额外1-2人天用于逆向和调试。', indent=False)
add_body('（2）是否需要资产库：如火山引擎Seedance系列、WeToken等要求真人素材上传至厂商资产库，需额外开发资产同步接口，约增加1-2人天；纯文本生成或不要求资产库的厂商无需此部分。', indent=False)
add_body('（3）鉴权复杂度：简单API Key鉴权配置快；OAuth2、签名算法等复杂鉴权方式增加开发时间。', indent=False)
add_body('（4）模型数量：单个厂商下接入的模型数量越多，模型注册和测试工作量越大，但单模型增量成本很低（约0.1-0.2人天/模型）。', indent=False)

# ============================================================
# 3. 已有厂商新增模型流程与工作量
# ============================================================
add_heading('3. 已有厂商新增模型流程与工作量', level=1)

add_heading('3.1 接入流程', level=2)
add_body('已有厂商新增模型是最高频的场景。由于厂商适配器已存在，新增模型通常以配置为主，仅在模型类型或调用方式有差异时需要少量开发。')

add_image(os.path.join(OUTPUT_DIR, 'fig_new_model_flow.png'), width=5.5)
add_caption('图2  已有厂商新增模型接入流程图')

add_heading('3.2 工作量明细（按场景区分）', level=2)

add_body('场景A：同类型模型新增（如已有Seedance 2.0，新增Seedance 2.5；已有Seedream 4.5，新增Seedream 5.0）', bold=True, indent=False)
add_table(
    ['步骤', '工作内容', '类型', '人天'],
    [
        ['① 模型信息确认', '确认模型ID、计费方式、参数差异、能力边界', '配置', '0.1'],
        ['② 适配器复用', '无需开发，直接复用现有适配器', '—', '0'],
        ['③ 模型注册配置', '后台新增模型记录，配置价格、默认参数、限流、开关', '配置', '0.2 ~ 0.3'],
        ['④ 前端适配', '动态读取模型列表，无需改动；静态配置则加一个选项', '开发', '0 ~ 0.1'],
        ['⑤ 测试上线', '功能验证 + 账单核对 + 发布', '测试', '0.2 ~ 0.3'],
        ['合计', '', '', '0.5 ~ 0.8'],
    ],
    widths=[3, 7, 2, 2]
)

add_body('场景B：新类型模型新增（如厂商原本只有生文，新增生图能力；或新增一种全新的视频生成范式）', bold=True, indent=False)
add_table(
    ['步骤', '工作内容', '类型', '人天'],
    [
        ['① 模型信息确认', '确认新类型模型的接口规范、请求/响应格式、特殊参数', '配置', '0.2'],
        ['② 适配器扩展', '在现有适配器中新增该类型模型的调用方法、参数封装、响应解析', '开发', '1 ~ 2'],
        ['③ 模型注册配置', '后台新增模型记录，配置价格、默认参数、限流', '配置', '0.3'],
        ['④ 前端适配', '如新类型需要新的UI组件（如视频时长选择器），需前端开发', '开发', '0.5 ~ 1'],
        ['⑤ 测试上线', '全场景测试 + 账单核对 + 发布', '测试', '0.5 ~ 0.8'],
        ['合计', '', '', '2.5 ~ 4.3'],
    ],
    widths=[3, 7, 2, 2]
)

add_heading('3.3 小结', level=2)
add_body('对于已有厂商，新增同类型模型的成本极低（约0.5人天），基本可以做到"当天配置、当天上线"。即使是新类型模型，由于适配器框架已存在，也只需在现有适配器中扩展方法，无需从零开发，工作量控制在3-4人天以内。')

# ============================================================
# 4. 模型价格成本测算
# ============================================================
add_heading('4. 模型价格成本测算', level=1)

add_heading('4.1 主流模型定价一览', level=2)
add_body('以下为当前主流模型厂商的公开API定价（2026年9月），用于成本测算参考。实际采购价格可能因商务谈判、用量阶梯、聚合平台折扣而有所不同。')

add_heading('4.1.1 文本生成模型（按Token计费）', level=3)
add_table(
    ['厂商/平台', '模型名称', '输入价格\n(元/百万Token)', '输出价格\n(元/百万Token)', '备注'],
    [
        ['火山引擎', 'Doubao-Seed-2.1-pro', '6', '30', '旗舰推理模型'],
        ['火山引擎', 'Doubao-Seed-Evolving', '6', '30', '深度思考模型'],
        ['火山引擎', 'Doubao-lite-32k', '0.3', '0.6', '轻量高速模型'],
        ['WeToken聚合', '通用文本模型', '1', '2', '聚合平台均价，具体模型有差异'],
        ['阿里云PAI', 'GLM-5.1', '9.6', '33.6', '智谱旗舰模型'],
    ],
    widths=[2.5, 4, 2.5, 2.5, 3.5]
)

add_heading('4.1.2 图片生成模型（按张计费）', level=3)
add_table(
    ['厂商/平台', '模型名称', '价格(元/张)', '分辨率', '备注'],
    [
        ['火山引擎', 'Doubao-Seedream-5.0-lite', '0.22', '最高2K', '文生图/图生图同价'],
        ['火山引擎', 'Doubao-Seedream-5.0-pro', '0.30起', '最高4K', '高分辨率价格上浮'],
        ['聚合平台', 'Qwen-Image', '0.25', '最高2K', '阿里图像模型'],
        ['聚合平台', 'FLUX.1-dev', '0.10', '1024×1024', '开源图像模型'],
        ['聚合平台', 'FLUX-kontext-pro', '0.35', '最高4K', '参考图编辑模型'],
    ],
    widths=[2.5, 4, 2.5, 2.5, 3.5]
)

add_heading('4.1.3 视频生成模型（按Token或按秒计费）', level=3)
add_table(
    ['厂商/平台', '模型名称', '计费方式', '参考价格', '备注'],
    [
        ['火山引擎', 'Seedance 2.0 (720p)', '按Token', '输出26-51元/百万Token', '5秒720p约5-12元/条'],
        ['火山引擎', 'Seedance 2.5 (720p)', '按Token', '不含视频输入70元/百万Token', '比2.0贵约50%'],
        ['火山引擎', 'Seedance 2.5 (1080p)', '按Token', '不含视频输入77元/百万Token', '高分辨率溢价'],
        ['第三方渠道', 'Seedance 2.0 标准版', '按条', '约5.4-12.1元/条(5秒720p)', '不同渠道价格有差异'],
        ['第三方渠道', 'Seedance 2.0 1080p', '按条', '约13.6-30.1元/条(5秒)', '高分辨率版本'],
    ],
    widths=[2.5, 3.5, 2, 4, 3.5]
)

add_body('视频Token用量估算公式：视频Token ≈ (宽 × 高 × 帧率 × 时长) / 1024。以720p(1280×720)、24fps、5秒为例：Token ≈ 1280×720×24×5/1024 ≈ 108万Token，按Seedance 2.5输出价70元/百万Token计算，约7.6元/条。')

add_heading('4.2 单用户月度成本测算（示例）', level=2)
add_body('以一个中度活跃用户的月度使用量为例，测算不同模型组合下的API成本：')

add_table(
    ['使用场景', '月度用量', '选用模型', '单价', '月度成本(元)', '占比'],
    [
        ['文本生成', '输入200万Token + 输出100万Token', 'Doubao-Seed-2.1-pro', '入6元/出30元每百万', '42.0', '6.2%'],
        ['图片生成', '200张', 'Seedream-5.0-lite', '0.22元/张', '44.0', '6.5%'],
        ['视频生成(720p 5秒)', '50条', 'Seedance 2.0', '约8元/条', '400.0', '59.1%'],
        ['视频生成(1080p 10秒)', '10条', 'Seedance 2.5', '约25元/条', '250.0', '36.9%'],
        ['真人资产存储', '50个资产', '对象存储', '约0.1元/个/月', '5.0', '0.7%'],
        ['合计', '', '', '', '741.0', '100%'],
    ],
    widths=[3, 3.5, 3, 2.5, 2, 1.5]
)

add_body('从成本结构可以看出：视频生成是成本大头，占比超过95%；文本和图片生成成本相对较低。建议在产品设计中对视频生成设置使用配额或付费点，以控制成本。')

add_heading('4.3 成本优化建议', level=2)
add_body('（1）模型路由策略：根据任务复杂度自动选择模型，简单任务用低价模型（如Doubao-lite），复杂任务用旗舰模型，可降低文本生成成本30%-50%。', indent=False)
add_body('（2）视频分辨率降级：默认720p输出，用户主动选择1080p时额外收费或扣减更多配额。', indent=False)
add_body('（3）聚合平台比价：WeToken等聚合平台通常提供比官方更低的价格（部分模型低30%-50%），可作为官方直连的补充渠道，在成本敏感场景优先调用。', indent=False)
add_body('（4）缓存与复用：对高频重复的文本生成请求启用缓存命中（火山引擎缓存命中价仅为输入价的20%）；对常用真人资产避免重复上传。', indent=False)
add_body('（5）用量阶梯谈判：当月度用量达到一定规模后，可与厂商洽谈阶梯折扣或资源包采购，进一步降低单位成本。', indent=False)

# ============================================================
# 5. 总结与建议
# ============================================================
add_heading('5. 总结与建议', level=1)

add_heading('5.1 工作量总结', level=2)
add_body('现有平台的统一接入架构已将新增厂商和新增模型的开发成本降至较低水平：')
add_body('• 已有厂商新增同类型模型：约0.5人天，基本当天可上线；', indent=False)
add_body('• 已有厂商新增新类型模型：约3-4人天，1周内可完成；', indent=False)
add_body('• 新增厂商接入（含资产库）：约7-8人天，1-2周可完成；', indent=False)
add_body('• 新增厂商接入（纯API）：约5-6人天，1周内可完成。', indent=False)

add_heading('5.2 成本总结', level=2)
add_body('模型调用成本中，视频生成占绝对大头（约95%以上），文本和图片生成成本较低。单中度活跃用户月度API成本约700-800元，其中视频生成约700元。建议在产品策略上对视频生成设置合理的使用配额或付费机制。')

add_heading('5.3 后续建议', level=2)
add_body('（1）建立模型接入SOP：将新增厂商/新增模型的接入流程标准化为checklist，减少对个人经验的依赖，进一步压缩接入周期。', indent=False)
add_body('（2）完善模型管理后台：将模型注册、配置、开关、限流全部后台化，做到"零代码新增模型"，让运营人员也能完成模型上架。', indent=False)
add_body('（3）搭建成本监控看板：实时监控各模型的调用量、成本、成功率，为模型路由和成本优化提供数据支撑。', indent=False)
add_body('（4）预留多厂商容灾：同一类型模型至少接入2家厂商，当一家出现故障或涨价时可快速切换，保障业务稳定性。', indent=False)

# 保存
output_path = os.path.join(OUTPUT_DIR, '新增厂商与新增模型接入流程及工作量评估.docx')
doc.save(output_path)
print(f'Document saved: {output_path}')
