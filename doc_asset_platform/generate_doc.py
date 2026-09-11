# -*- coding: utf-8 -*-
"""
生成AI内容生成平台——统一真人资产管理与多厂商适配方案 Word文档
全部使用微软雅黑字体
"""
from docx import Document
from docx.shared import Inches, Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml.ns import qn, nsdecls
from docx.oxml import parse_xml
import os

OUTPUT_DIR = r'D:\phpstudy_pro\WWW\ai-novel-workstation1.2.0\doc_asset_platform'
FONT_NAME = '微软雅黑'

doc = Document()

# ============================================================
# 全局样式设置
# ============================================================
def set_font(run, size=12, bold=False, color=None):
    """设置run的字体为微软雅黑"""
    run.font.name = FONT_NAME
    run.font.size = Pt(size)
    run.font.bold = bold
    if color:
        run.font.color.rgb = color
    # 设置中文字体
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

def set_paragraph_format(para, align=WD_ALIGN_PARAGRAPH.JUSTIFY, first_indent=True,
                          space_before=0, space_after=0, line_spacing=1.5):
    """设置段落格式"""
    para.alignment = align
    pf = para.paragraph_format
    pf.space_before = Pt(space_before)
    pf.space_after = Pt(space_after)
    pf.line_spacing = line_spacing
    if first_indent:
        pf.first_line_indent = Pt(24)  # 2字符缩进
    else:
        pf.first_line_indent = Pt(0)

def add_heading(text, level=1):
    """添加标题"""
    sizes = {1: 16, 2: 14, 3: 12}
    space_before_map = {1: 18, 2: 14, 3: 10}
    space_after_map = {1: 8, 2: 6, 3: 4}

    para = doc.add_paragraph()
    set_paragraph_format(para, align=WD_ALIGN_PARAGRAPH.LEFT, first_indent=False,
                         space_before=space_before_map.get(level, 10),
                         space_after=space_after_map.get(level, 4),
                         line_spacing=1.5)
    run = para.add_run(text)
    set_font(run, size=sizes.get(level, 12), bold=True, color=RGBColor(0, 0, 0))
    # 设置为真正的Heading样式
    para.style = doc.styles[f'Heading {level}']
    # 重新设置字体（因为style可能覆盖）
    for run in para.runs:
        set_font(run, size=sizes.get(level, 12), bold=True, color=RGBColor(0, 0, 0))
    return para

def add_body(text, bold=False, indent=True):
    """添加正文段落"""
    para = doc.add_paragraph()
    set_paragraph_format(para, first_indent=indent)
    run = para.add_run(text)
    set_font(run, size=12, bold=bold)
    return para

def add_caption(text):
    """添加图题/表题"""
    para = doc.add_paragraph()
    set_paragraph_format(para, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=False,
                         space_before=4, space_after=8, line_spacing=1.0)
    run = para.add_run(text)
    set_font(run, size=10.5, bold=False)
    return para

def add_image(image_path, width_inches=6.0):
    """插入图片并居中"""
    para = doc.add_paragraph()
    set_paragraph_format(para, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=False,
                         space_before=6, space_after=2, line_spacing=1.0)
    run = para.add_run()
    run.add_picture(image_path, width=Inches(width_inches))
    return para

def set_cell_text(cell, text, size=10.5, bold=False, align=WD_ALIGN_PARAGRAPH.LEFT,
                  bg_color=None):
    """设置单元格文本和格式"""
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
    if bg_color:
        shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{bg_color}"/>')
        cell._tc.get_or_add_tcPr().append(shading)

def add_table(headers, rows, col_widths=None):
    """添加表格"""
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = 'Table Grid'

    # 表头
    for i, header in enumerate(headers):
        set_cell_text(table.rows[0].cells[i], header, size=10.5, bold=True,
                      align=WD_ALIGN_PARAGRAPH.CENTER, bg_color='D9D9D9')

    # 数据行
    for r, row in enumerate(rows):
        for c, cell_text in enumerate(row):
            align = WD_ALIGN_PARAGRAPH.CENTER if c == 0 else WD_ALIGN_PARAGRAPH.LEFT
            set_cell_text(table.rows[r + 1].cells[c], str(cell_text), size=10.5,
                          align=align)

    # 设置列宽
    if col_widths:
        for i, width in enumerate(col_widths):
            for row in table.rows:
                row.cells[i].width = Cm(width)

    # 表格后空行
    doc.add_paragraph()
    return table

# ============================================================
# 页面设置
# ============================================================
section = doc.sections[0]
section.page_width = Cm(21)
section.page_height = Cm(29.7)
section.top_margin = Cm(2.5)
section.bottom_margin = Cm(2.5)
section.left_margin = Cm(2.5)
section.right_margin = Cm(2.5)

# 设置默认Normal样式字体
normal_style = doc.styles['Normal']
normal_style.font.name = FONT_NAME
normal_style.font.size = Pt(12)
normal_style.element.rPr.rFonts.set(qn('w:eastAsia'), FONT_NAME)

# ============================================================
# 文档标题
# ============================================================
title_para = doc.add_paragraph()
title_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
title_para.paragraph_format.space_before = Pt(36)
title_para.paragraph_format.space_after = Pt(12)
title_run = title_para.add_run('AI内容生成平台')
set_font(title_run, size=22, bold=True)

title_para2 = doc.add_paragraph()
title_para2.alignment = WD_ALIGN_PARAGRAPH.CENTER
title_para2.paragraph_format.space_after = Pt(24)
title_run2 = title_para2.add_run('统一真人资产管理与多厂商适配方案')
set_font(title_run2, size=18, bold=True)

# 文档信息表
info_table = doc.add_table(rows=4, cols=2)
info_table.alignment = WD_TABLE_ALIGNMENT.CENTER
info_table.style = 'Table Grid'
info_data = [
    ('文档版本', 'V1.0'),
    ('编制日期', '2026-09-08'),
    ('文档状态', '初稿'),
    ('适用范围', '生文/生图/生视频全流程'),
]
for i, (k, v) in enumerate(info_data):
    set_cell_text(info_table.rows[i].cells[0], k, size=11, bold=True,
                  align=WD_ALIGN_PARAGRAPH.CENTER, bg_color='F2F2F2')
    set_cell_text(info_table.rows[i].cells[1], v, size=11,
                  align=WD_ALIGN_PARAGRAPH.LEFT)
for row in info_table.rows:
    row.cells[0].width = Cm(4)
    row.cells[1].width = Cm(8)

doc.add_page_break()

# ============================================================
# 1. 文档概述
# ============================================================
add_heading('1. 文档概述', level=1)

add_heading('1.1 背景与问题', level=2)
add_body('当前AI内容生成平台已接入生文、生图、生视频三大核心能力，底层依赖多家第三方大模型厂商提供服务。目前已接入的厂商包括：WeToken（第三方聚合平台）、火山引擎（直连Doubao系列模型），以及其他可扩展的模型服务厂商。')
add_body('在实际业务运行中，随着Doubao Seedance 2.0/2.5系列视频生成模型以及含真人的图片生成需求的引入，暴露出以下核心问题：')
add_body('（1）真人资产重复上传：同一真人素材需要分别上传到WeToken资产库、火山引擎资产库等多个厂商侧，操作繁琐且容易遗漏；', indent=False)
add_body('（2）厂商资产库割裂：各厂商资产库相互独立，资产ID、审核状态、同步进度无法统一管理，后端需要维护多套映射关系；', indent=False)
add_body('（3）生图与生视频流程不一致：生图场景下含真人时需要传入厂商资产ID，生视频场景下Seedance系列模型强制要求真人素材预先上传至厂商资产库，但当前流程缺乏统一的校验与阻断机制；', indent=False)
add_body('（4）扩展性差：新增一家模型厂商时，需要在后端多处硬编码资产上传逻辑，维护成本高。', indent=False)

add_heading('1.2 目标与范围', level=2)
add_body('本方案旨在设计一套统一的真人资产管理与多厂商适配机制，实现"一次上传、多端分发、统一管理、流程闭环"的目标。具体目标包括：')
add_body('（1）建立统一真人资产管理中心，对真人素材的元数据、同步状态、厂商资产ID映射进行集中管理；', indent=False)
add_body('（2）设计厂商适配器模式，实现新增厂商时仅需扩展适配器而无需修改核心流程；', indent=False)
add_body('（3）明确生文、生图、生视频三大场景下真人资产的依赖关系与校验规则；', indent=False)
add_body('（4）提供完整的流程图、泳道图、数据模型与接口设计，以及开发工作量评估。', indent=False)
add_body('本方案覆盖范围：前端真人素材上传组件、后端真人资产管理服务、模型平台资产库同步管理器、厂商适配器层。不覆盖具体厂商接口的底层协议实现细节。')

add_heading('1.3 术语定义', level=2)
add_table(
    ['术语', '定义'],
    [
        ['真人资产', '用户上传的包含真人肖像的图片或视频素材，用于AI生成时的人物参考'],
        ['厂商资产库', '第三方模型厂商提供的素材存储与管理服务，如WeToken资产库、火山引擎资产库'],
        ['资产同步', '将后端存储的真人资产上传至一个或多个厂商资产库并获取厂商侧资产ID的过程'],
        ['厂商适配器', '封装特定厂商接口差异的标准化组件，对外提供统一的上传、查询、删除接口'],
        ['Seedance', '字节跳动旗下的视频生成大模型系列，包括2.0和2.5版本，对真人素材有强制资产库要求'],
    ],
    col_widths=[3.5, 12]
)

# ============================================================
# 2. 现状分析
# ============================================================
add_heading('2. 现状分析', level=1)

add_heading('2.1 当前架构', level=2)
add_body('当前系统采用四层架构：前端层 → 后端服务层 → 模型平台层 → 第三方厂商层。前端通过统一API网关向后端发起请求，后端根据业务类型调用模型平台提供的统一接口，模型平台再根据路由规则调用具体的第三方厂商接口。')
add_body('在真人资产管理方面，当前采用的是"各流程独立上传"模式：生图流程中如果需要真人，由生图业务模块直接调用对应厂商的资产上传接口；生视频流程中如果使用Seedance系列模型，由视频业务模块单独处理资产上传。这种模式导致相同的上传逻辑在多个业务模块中重复实现。')

add_heading('2.2 核心痛点', level=2)
add_table(
    ['痛点编号', '痛点描述', '影响范围', '严重程度'],
    [
        ['P1', '真人资产需在多个业务模块重复上传至不同厂商资产库', '生图、生视频', '高'],
        ['P2', '各厂商资产ID与审核状态无统一管理，查询困难', '全平台', '高'],
        ['P3', '生视频Seedance系列缺乏资产前置校验，可能导致生成失败', '生视频', '高'],
        ['P4', '生图含真人时资产依赖逻辑散落在业务代码中', '生图', '中'],
        ['P5', '新增模型厂商时需修改多处业务代码', '架构扩展性', '中'],
        ['P6', '资产上传失败后缺乏统一的重试与告警机制', '稳定性', '中'],
    ],
    col_widths=[2, 7, 3, 2.5]
)

# ============================================================
# 3. 功能点设计
# ============================================================
add_heading('3. 功能点设计', level=1)

add_heading('3.1 统一真人资产管理中心', level=2)

add_heading('3.1.1 真人资产上传与审核', level=3)
add_body('用户在前端通过统一的真人素材上传组件提交图片或视频文件，后端接收后保存至对象存储，并生成全局唯一的资产ID。系统自动对上传素材进行基础校验（文件格式、大小、分辨率、是否包含真人面部），校验通过后进入资产元数据登记流程。')

add_heading('3.1.2 资产元数据管理', level=3)
add_body('每条真人资产在数据库中维护完整的元数据记录，包括：资产ID、文件名、文件类型、文件大小、分辨率/时长、存储路径、上传用户、上传时间、资产标签、审核状态、删除标记等。同时维护与各厂商资产库的映射关系表。')

add_heading('3.1.3 资产状态追踪', level=3)
add_body('资产状态包括：待同步、同步中、已同步、同步失败、审核中、审核通过、审核拒绝、已过期。系统提供资产状态查询接口，前端可实时展示每个资产在各厂商侧的同步进度与审核状态。对于同步失败的资产，系统自动进入重试队列（最多3次，指数退避），超过重试上限后触发告警并标记为"需人工处理"。')

add_heading('3.2 多厂商资产库自动同步', level=2)

add_heading('3.2.1 厂商适配器模式', level=3)
add_body('采用适配器设计模式，为每个接入的厂商实现一个标准适配器。所有适配器实现统一的接口契约：')
add_body('• uploadAsset(filePath, metadata) → vendorAssetId：上传资产至厂商资产库', indent=False)
add_body('• getAssetStatus(vendorAssetId) → status：查询资产审核状态', indent=False)
add_body('• deleteAsset(vendorAssetId) → boolean：删除厂商侧资产', indent=False)
add_body('• getVendorName() → string：返回厂商标识', indent=False)
add_body('新增厂商时，只需实现该适配器接口并在适配器工厂中注册，核心业务流程无需任何修改。')

add_heading('3.2.2 一次上传、多端分发', level=3)
add_body('用户上传一次真人资产后，资产同步管理器根据系统配置的已接入厂商列表，自动调用对应适配器将资产分发至所有厂商资产库。分发过程支持并行上传以提高效率，每个厂商的上传结果独立记录，互不影响。')

add_heading('3.2.3 同步状态与重试机制', level=3)
add_body('资产同步管理器维护每个资产在每个厂商侧的同步记录，包括：同步任务ID、厂商标识、厂商资产ID、同步状态、重试次数、最后同步时间、错误信息。同步失败时自动重试，重试策略为：第1次失败后等待30秒，第2次失败后等待2分钟，第3次失败后等待10分钟。3次均失败则标记为人工处理状态并发送告警通知。')

add_heading('3.3 生文流程', level=2)
add_body('生文（文本生成）流程不依赖真人资产，无需进行资产校验。用户提交提示词与模型参数后，后端直接通过模型平台调用对应厂商的文本生成接口，同步或异步返回生成结果。生文流程不在本次改造范围内，保持现有逻辑不变。')

add_heading('3.4 生图流程（含真人资产依赖）', level=2)
add_body('生图流程在用户提交请求时，后端需判断请求参数中是否包含真人素材引用。若包含真人素材，则执行以下校验逻辑：')
add_body('（1）根据资产ID查询该资产在目标厂商侧的同步记录；', indent=False)
add_body('（2）确认资产已同步至目标厂商资产库且审核状态为"通过"；', indent=False)
add_body('（3）若资产未同步或审核未通过，返回明确错误提示，引导用户先完成资产上传；', indent=False)
add_body('（4）校验通过后，将厂商侧资产ID作为参数传入生图接口。', indent=False)
add_body('若生图请求不包含真人素材，则直接走正常生成流程，无需资产校验。')

add_heading('3.5 生视频流程（Seedance系列强制资产要求）', level=2)
add_body('生视频流程根据所选模型类型区分处理逻辑：')
add_body('（1）普通视频生成（非真人驱动）：无需真人资产校验，直接调用厂商视频生成接口；', indent=False)
add_body('（2）Seedance 2.0/2.5系列含真人视频：强制要求真人素材已上传至目标厂商资产库并审核通过。后端在接收请求时进行前置校验，若资产未就绪则直接阻断请求并返回提示，避免提交后因资产缺失导致生成任务失败；', indent=False)
add_body('（3）首帧图含真人的视频生成：首帧图中若包含真人，同样需要该真人资产已在厂商资产库中注册，校验逻辑同上。', indent=False)
add_body('视频生成任务为异步任务，后端提交后获取任务ID，通过轮询或回调方式获取最终视频URL，并更新任务状态。')

# ============================================================
# 4. 流程图与泳道图
# ============================================================
add_heading('4. 流程图与泳道图', level=1)

add_heading('4.1 整体架构泳道图', level=2)
add_body('下图展示了AI内容生成平台的整体架构，按前端层、后端服务层、模型平台层、第三方厂商层四个泳道划分，清晰展示了各层之间的交互关系以及真人资产在各层之间的流转路径。')
add_image(os.path.join(OUTPUT_DIR, 'fig1_architecture_swimlane.png'), width_inches=6.2)
add_caption('图1  AI内容生成平台整体架构泳道图')

add_heading('4.2 真人资产上传与分发流程图', level=2)
add_body('下图展示了真人资产从用户上传到分发至各厂商资产库的完整流程，包括多厂商并行上传、状态汇总、失败重试等关键环节。')
add_image(os.path.join(OUTPUT_DIR, 'fig2_asset_upload_flow.png'), width_inches=5.5)
add_caption('图2  真人资产上传与多厂商分发流程图')

add_heading('4.3 生图（含真人）业务流程图', level=2)
add_body('下图展示了生图业务在包含真人素材时的处理流程，重点突出资产状态校验分支与资产同步触发逻辑。')
add_image(os.path.join(OUTPUT_DIR, 'fig3_image_gen_flow.png'), width_inches=5.2)
add_caption('图3  生图（含真人）业务流程图')

add_heading('4.4 生视频（含真人）业务流程图', level=2)
add_body('下图展示了生视频业务在使用Seedance 2.0/2.5系列模型且包含真人时的处理流程，强调了真人资产的强制前置校验与阻断机制。')
add_image(os.path.join(OUTPUT_DIR, 'fig4_video_gen_flow.png'), width_inches=5.2)
add_caption('图4  生视频（含真人/Seedance系列）业务流程图')

# ============================================================
# 5. 技术方案设计
# ============================================================
add_heading('5. 技术方案设计', level=1)

add_heading('5.1 系统架构设计', level=2)
add_body('系统在现有四层架构基础上，新增以下核心组件：')
add_body('（1）真人资产管理服务（后端）：负责资产上传、元数据管理、状态查询、资产生命周期管理；', indent=False)
add_body('（2）资产库同步管理器（模型平台）：负责资产的多厂商分发、同步状态追踪、失败重试与告警；', indent=False)
add_body('（3）厂商适配器层（模型平台）：封装各厂商资产库接口差异，提供统一的上传/查询/删除接口；', indent=False)
add_body('（4）真人素材上传组件（前端）：统一的素材上传UI，支持拖拽上传、进度展示、状态预览。', indent=False)
add_body('各组件之间通过RESTful API和消息队列进行通信，资产同步任务通过消息队列异步处理以提高系统吞吐量。')

add_heading('5.2 核心数据模型', level=2)
add_body('核心数据表设计如下：')

add_heading('5.2.1 真人资产主表（human_asset）', level=3)
add_table(
    ['字段名', '类型', '说明'],
    [
        ['asset_id', 'varchar(64)', '全局唯一资产ID（主键）'],
        ['user_id', 'varchar(64)', '上传用户ID'],
        ['file_name', 'varchar(255)', '原始文件名'],
        ['file_type', 'varchar(32)', '文件类型（image/jpg, video/mp4等）'],
        ['file_size', 'bigint', '文件大小（字节）'],
        ['resolution', 'varchar(32)', '分辨率（图片）或时长（视频）'],
        ['storage_path', 'varchar(512)', '对象存储路径'],
        ['asset_tags', 'varchar(512)', '资产标签（JSON数组）'],
        ['audit_status', 'tinyint', '平台审核状态（0待审/1通过/2拒绝）'],
        ['status', 'tinyint', '资产状态（1正常/2已删除）'],
        ['created_at', 'datetime', '上传时间'],
        ['updated_at', 'datetime', '更新时间'],
    ],
    col_widths=[3.5, 3, 9]
)

add_heading('5.2.2 厂商资产映射表（vendor_asset_mapping）', level=3)
add_table(
    ['字段名', '类型', '说明'],
    [
        ['id', 'bigint', '自增主键'],
        ['asset_id', 'varchar(64)', '关联真人资产主表'],
        ['vendor_code', 'varchar(32)', '厂商标识（wetoken/volcano/...）'],
        ['vendor_asset_id', 'varchar(255)', '厂商侧资产ID'],
        ['sync_status', 'tinyint', '同步状态（0待同步/1同步中/2已同步/3失败）'],
        ['audit_status', 'tinyint', '厂商审核状态（0待审/1通过/2拒绝/3未知）'],
        ['retry_count', 'int', '已重试次数'],
        ['last_sync_time', 'datetime', '最后同步时间'],
        ['error_message', 'varchar(1024)', '最近一次错误信息'],
        ['created_at', 'datetime', '创建时间'],
        ['updated_at', 'datetime', '更新时间'],
    ],
    col_widths=[3.5, 3, 9]
)

add_heading('5.3 接口设计', level=2)
add_body('以下为核心API接口设计（RESTful风格）：')

add_table(
    ['接口', '方法', '路径', '说明'],
    [
        ['资产上传', 'POST', '/api/v1/assets/human', '上传真人素材文件，返回资产ID'],
        ['资产列表', 'GET', '/api/v1/assets/human', '分页查询当前用户的真人资产列表'],
        ['资产详情', 'GET', '/api/v1/assets/human/{asset_id}', '查询资产详情及各厂商同步状态'],
        ['资产删除', 'DELETE', '/api/v1/assets/human/{asset_id}', '删除资产（同时触发各厂商侧删除）'],
        ['触发同步', 'POST', '/api/v1/assets/human/{asset_id}/sync', '手动触发资产同步至指定厂商'],
        ['生图请求', 'POST', '/api/v1/generate/image', '生图接口（含真人时自动校验资产状态）'],
        ['生视频请求', 'POST', '/api/v1/generate/video', '生视频接口（Seedance系列强制资产校验）'],
        ['任务状态', 'GET', '/api/v1/generate/tasks/{task_id}', '查询异步生成任务状态'],
    ],
    col_widths=[2.5, 1.5, 5, 6.5]
)

add_heading('5.4 厂商适配器设计', level=2)
add_body('厂商适配器采用策略模式+工厂模式实现，核心类结构如下：')
add_body('（1）VendorAdapter（抽象基类）：定义uploadAsset、getAssetStatus、deleteAsset三个抽象方法；', indent=False)
add_body('（2）WeTokenAdapter（实现类）：封装WeToken资产库API，处理WeToken特有的鉴权与参数格式；', indent=False)
add_body('（3）VolcanoAdapter（实现类）：封装火山引擎资产库API，处理火山引擎特有的签名与上传协议；', indent=False)
add_body('（4）VendorAdapterFactory（工厂类）：根据vendor_code返回对应的适配器实例，支持运行时注册新适配器；', indent=False)
add_body('（5）AssetSyncManager（同步管理器）：调用适配器工厂获取对应厂商适配器，执行同步任务并记录结果。', indent=False)
add_body('适配器配置化：各厂商的API地址、鉴权密钥、超时时间等配置统一存放在配置中心，适配器启动时自动加载，无需硬编码。')

# ============================================================
# 6. 开发工作量评估
# ============================================================
add_heading('6. 开发工作量评估', level=1)

add_heading('6.1 任务拆解与人天估算', level=2)
add_body('按模块拆解开发任务，以"人天"为单位进行估算（1人天=1名开发工程师1个工作日）。估算包含编码、单元测试与代码审查时间，不含集成测试与UAT时间。')

add_table(
    ['模块', '任务项', '前端(人天)', '后端(人天)', '说明'],
    [
        ['真人资产管理', '数据库表设计与初始化脚本', '0', '2', '含主表、映射表、索引设计'],
        ['', '资产上传接口（含文件存储）', '0', '3', '对接对象存储，支持断点续传'],
        ['', '资产列表/详情/删除接口', '0', '2', '含分页、筛选、软删除'],
        ['', '前端真人素材上传组件', '4', '0', '拖拽上传、进度条、预览'],
        ['', '前端资产管理页面', '3', '0', '列表展示、状态标签、操作按钮'],
        ['资产同步引擎', '厂商适配器基类与接口定义', '0', '2', '抽象基类、工厂模式'],
        ['', 'WeToken适配器实现', '0', '3', '上传/查询/删除接口封装'],
        ['', '火山引擎适配器实现', '0', '4', '含签名算法、分片上传'],
        ['', '资产同步管理器（并行+重试）', '0', '4', '消息队列消费、指数退避重试'],
        ['', '同步状态查询与告警', '0', '2', '告警通知对接'],
        ['生图流程改造', '生图接口资产校验逻辑', '0', '2', '含真人时校验同步状态'],
        ['', '前端生图页面资产选择器', '2', '0', '从资产库选择已上传真人素材'],
        ['生视频流程改造', '生视频接口强制资产校验', '0', '3', 'Seedance系列前置阻断'],
        ['', '视频任务状态轮询/回调优化', '0', '2', '异步任务状态管理'],
        ['', '前端生视频页面适配', '2', '0', '资产必填提示、状态展示'],
        ['测试与联调', '接口联调与集成测试', '2', '3', '前后端联调、场景覆盖'],
        ['', 'Bug修复与优化', '1', '2', '测试阶段问题修复'],
        ['合计', '', '14', '38', '总计52人天'],
    ],
    col_widths=[2.5, 4.5, 1.8, 1.8, 4.9]
)

add_heading('6.2 排期建议', level=2)
add_body('建议按以下阶段进行排期，假设投入1名前端开发 + 2名后端开发并行工作：')

add_table(
    ['阶段', '周期', '主要工作', '里程碑'],
    [
        ['第一阶段：基础搭建', '第1-2周（10人天）', '数据库设计、资产上传接口、前端上传组件、适配器基类', '资产可上传并存储'],
        ['第二阶段：同步引擎', '第3-4周（10人天）', 'WeToken/火山适配器、同步管理器、重试机制、状态查询', '资产可自动同步至两厂商'],
        ['第三阶段：业务改造', '第5-6周（10人天）', '生图/生视频资产校验、前端资产选择器、页面适配', '含真人生图/生视频流程跑通'],
        ['第四阶段：测试上线', '第7周（5人天）', '集成测试、Bug修复、性能优化、上线部署', '正式上线'],
    ],
    col_widths=[3, 3.5, 6, 3]
)
add_body('总排期约7周（约35个自然日），其中有效开发人天52人天。若需压缩排期，可考虑增加1名后端开发人员，重点加速适配器实现与同步引擎开发，预计可压缩至5-6周。')

add_heading('6.3 依赖与风险', level=2)
add_table(
    ['类型', '描述', '影响', '应对措施'],
    [
        ['外部依赖', 'WeToken资产库接口的可用性与文档完整性', '高', '提前对接WeToken技术支持，确认接口规范'],
        ['外部依赖', '火山引擎资产库上传协议（可能涉及分片上传）', '中', '预留火山适配器开发缓冲时间'],
        ['技术风险', '多厂商并行上传时的资源竞争与超时处理', '中', '设置合理的并发数与超时阈值，做好熔断'],
        ['业务风险', '真人资产审核标准各厂商不一致，可能出现一方通过一方拒绝', '中', '在前端明确展示各厂商审核状态，引导用户更换素材'],
        ['进度风险', '适配器开发可能因厂商接口问题延期', '中', '优先开发WeToken适配器，火山引擎适配器并行跟进'],
    ],
    col_widths=[2, 5.5, 1.5, 6.5]
)

# ============================================================
# 7. 风险与应对
# ============================================================
add_heading('7. 总结与后续建议', level=1)
add_body('本方案针对AI内容生成平台中真人资产管理分散、多厂商适配困难、生图生视频流程不一致等问题，提出了统一真人资产管理中心 + 厂商适配器模式的解决方案。通过"一次上传、多端分发"的机制，可显著降低用户操作成本与后端维护成本；通过标准化的适配器接口，可实现新增厂商时的快速扩展；通过生图生视频流程中的资产前置校验，可有效减少因资产缺失导致的生成失败。')
add_body('后续建议：')
add_body('（1）优先实现WeToken与火山引擎两家厂商的适配器，验证方案可行性后再扩展其他厂商；', indent=False)
add_body('（2）考虑引入资产CDN加速，减少重复上传带来的带宽消耗；', indent=False)
add_body('（3）建立真人资产审核的自动化流水线，结合人脸检测与内容安全审核，提高审核效率；', indent=False)
add_body('（4）定期评估各厂商资产库的稳定性与审核通过率，作为模型路由决策的参考因素。', indent=False)

# ============================================================
# 保存文档
# ============================================================
output_path = os.path.join(OUTPUT_DIR, 'AI内容生成平台_统一真人资产管理与多厂商适配方案.docx')
doc.save(output_path)
print(f'Document saved: {output_path}')
