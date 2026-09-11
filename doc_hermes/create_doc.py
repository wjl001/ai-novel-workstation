# -*- coding: utf-8 -*-
"""创建Word文档：视频生成Prompt智能增强系统方案汇报"""
from docx import Document
from docx.shared import Inches, Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import os

IMG_DIR = r'D:\phpstudy_pro\WWW\ai-novel-workstation1.2.0\doc_hermes\images'
OUT_PATH = r'D:\phpstudy_pro\WWW\ai-novel-workstation1.2.0\doc_hermes\视频生成Prompt智能增强系统_汇报版.docx'

doc = Document()

# ========== 全局样式设置 ==========
style = doc.styles['Normal']
font = style.font
font.name = '微软雅黑'
font.size = Pt(11)
font.color.rgb = RGBColor(0x33, 0x33, 0x33)
style.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')

# 页面设置
section = doc.sections[0]
section.page_width = Cm(21)
section.page_height = Cm(29.7)
section.top_margin = Cm(2.5)
section.bottom_margin = Cm(2.5)
section.left_margin = Cm(2.5)
section.right_margin = Cm(2.5)

def set_cell_font(cell, text, size=10, bold=False, color=None, align='left'):
    """设置单元格文字"""
    cell.text = ''
    p = cell.paragraphs[0]
    if align == 'center':
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    elif align == 'right':
        p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run = p.add_run(text)
    run.font.name = '微软雅黑'
    run.font.size = Pt(size)
    run.font.bold = bold
    run.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')
    if color:
        run.font.color.rgb = color

def set_cell_bg(cell, color_hex):
    """设置单元格背景色"""
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), color_hex)
    tcPr.append(shd)

def add_heading(text, level=1):
    """添加标题"""
    p = doc.add_paragraph()
    if level == 1:
        p.space_before = Pt(18)
        p.space_after = Pt(8)
        run = p.add_run(text)
        run.font.size = Pt(16)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x0D, 0x13, 0x26)
    elif level == 2:
        p.space_before = Pt(12)
        p.space_after = Pt(6)
        run = p.add_run(text)
        run.font.size = Pt(13)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x25, 0x63, 0xEB)
    run.font.name = '微软雅黑'
    run.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')
    return p

def add_para(text, indent=True):
    """添加正文段落"""
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.5
    p.space_after = Pt(4)
    if indent:
        p.paragraph_format.first_line_indent = Pt(22)
    run = p.add_run(text)
    run.font.name = '微软雅黑'
    run.font.size = Pt(11)
    run.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')
    return p

def add_image(img_path, caption, width=Inches(6.0)):
    """插入图片和图题"""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run()
    run.add_picture(img_path, width=width)
    
    cap = doc.add_paragraph()
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap.space_before = Pt(4)
    cap.space_after = Pt(12)
    run = cap.add_run(caption)
    run.font.name = '微软雅黑'
    run.font.size = Pt(9)
    run.font.color.rgb = RGBColor(0x66, 0x66, 0x66)
    run.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')

def add_table_caption(text):
    """添加表题"""
    cap = doc.add_paragraph()
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap.space_before = Pt(8)
    cap.space_after = Pt(4)
    run = cap.add_run(text)
    run.font.name = '微软雅黑'
    run.font.size = Pt(10)
    run.font.bold = True
    run.font.color.rgb = RGBColor(0x33, 0x33, 0x33)
    run.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')

# ========== 文档内容 ==========

# 标题
title = doc.add_paragraph()
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
title.space_after = Pt(6)
run = title.add_run('视频生成 Prompt 智能增强系统')
run.font.name = '微软雅黑'
run.font.size = Pt(22)
run.font.bold = True
run.font.color.rgb = RGBColor(0x0D, 0x13, 0x26)
run.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')

subtitle = doc.add_paragraph()
subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
subtitle.space_after = Pt(18)
run = subtitle.add_run('—— Hermes Agent 多轮对话版 · 方案汇报 ——')
run.font.name = '微软雅黑'
run.font.size = Pt(12)
run.font.color.rgb = RGBColor(0x25, 0x63, 0xEB)
run.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')

# 一、方案背景与业务痛点
add_heading('一、方案背景与业务痛点', 1)
add_para('随着 AI 视频生成技术的快速发展，Seedance 2.0 等模型已能够基于参考图和提示词生成高质量视频。然而在实际短剧生产流程中，提示词编写成为制约生产效率的核心瓶颈。当前团队主要依赖人工编写提示词，存在六大业务痛点：一是提示词质量参差不齐，严重依赖个人经验，新人上手周期长；二是帧对齐困难，相邻镜头首帧与上一镜尾帧不一致，导致视频拼接时出现跳变；三是角色和场景一致性差，同一角色在不同分镜中外观差异大，同一场景环境不统一；四是单分镜处理耗时长，平均需要 15 至 20 分钟反复调试；五是一次生成合格率低，仅约 30%，平均需要抽卡 5 至 8 次才能获得可用结果；六是缺乏标准化质量校验，提示词结构不完整、负面提示词遗漏等问题频发。')

add_para('为解决上述痛点，本方案提出基于 Hermes Agent 多轮对话机制的视频生成 Prompt 智能增强系统，将资深提示词工程师的"生成—自检—修正"工作流程自动化，实现提示词质量的标准化和生产效率的大幅提升。')

# 二、建设目标与核心思路
add_heading('二、建设目标与核心思路', 1)
add_para('系统建设分为三个阶段推进。第一阶段（2 至 3 周）完成核心能力上线，包括 Hermes 多轮对话引擎、分镜与镜头解析、上下文管理器、基础提示词生成与自检能力，灰度上线验证效果。第二阶段（3 至 4 周）实现全流程覆盖，扩充专业知识库、完善 10 项自检体系、增加后期转场清单自动生成、接入参考图生成联动，正式上线。第三阶段持续迭代，建立 Bad Case 反馈机制，优质案例沉淀为知识库，形成数据驱动的自循环优化体系。')

add_para('核心设计思路是"三层架构 + 多轮对话"：用户输入层负责分镜和镜头的输入与结果展示；Hermes 增强层是系统核心，负责分镜解析、上下文管理、多轮对话编排、知识库调用和提示词自检；模型服务层提供大语言模型、视频生成和参考图生成能力。Hermes Agent 对每个分镜独立执行 3 至 5 轮自我对话，模拟资深工程师的工作流程，最终输出经过自检和修正的高质量提示词。')

# 三、产品整体架构
add_heading('三、产品整体架构', 1)
add_para('系统采用三层架构设计，各层职责清晰、耦合度低，便于独立迭代和扩展。')
add_image(os.path.join(IMG_DIR, 'fig1_architecture.png'), '图1  产品整体架构图')

add_para('用户接入层提供分镜拆解输入、镜头拆解输入、批量处理入口和结果展示面板四个模块，负责与用户的交互和任务提交。Hermes 增强层是系统核心，包含五个子模块：分镜与镜头解析模块负责语义理解和镜头类型识别；上下文管理模块负责加载人物设定、场景设定和全局属性；多轮对话引擎负责编排 3 至 5 轮对话流程；知识库调用模块负责按需加载专业规范；提示词自检模块负责执行 10 项专项校验。模型服务层集成 Hermes Agent 大语言模型、Seedance 2.0 视频生成模型和 Seedream 参考图生成模型，通过 HTTP API 统一调用。')

# 四、Hermes多轮对话机制
add_heading('四、Hermes 多轮对话机制', 1)
add_para('多轮对话是本系统的核心创新点。区别于传统的"一次生成"模式，Hermes Agent 对每个分镜独立执行 5 轮自我对话，每轮有明确的目标和产出，形成"生成—自检—修正"的完整闭环。')
add_image(os.path.join(IMG_DIR, 'fig2_hermes_flow.png'), '图2  Hermes Agent 5 轮多轮对话机制')

add_para('第 1 轮为分镜解析与理解，Hermes 解析分镜内容，识别镜头类型（对话、动作、情绪、环境等），按单一动作单元原则拆分镜头，动态分配时长。第 2 轮为上下文加载，自动加载人物设定（含服装变体）、场景设定（含时间变体）、全局属性和参考图路径。第 3 轮为提示词初稿生成，按照 v3.8 六段式结构生成完整提示词，包含时间轴分段描述。第 4 轮为 10 项专项自检，逐项校验帧对齐、时间轴连贯性、总时长控制、景别变化、参考图配置、负面提示词、台词情绪描述、动作连贯性、单一动作原则和提示词语言，输出自检评分和问题清单。第 5 轮为修正优化与输出，针对自检发现的问题逐一修正，优化提示词表述，输出最终结果。对话终止条件为自检全部通过或达到最大轮次（5 轮）。')

# 五、上下文注入机制
add_heading('五、上下文注入机制', 1)
add_para('为确保每个分镜的提示词都与全局设定一致，系统设计了上下文注入机制，将 7 类数据源自动注入 Hermes 对话上下文。')
add_image(os.path.join(IMG_DIR, 'fig4_context.png'), '图3  上下文注入机制')

add_para('7 类数据源包括：人物设定（含日常、战斗等服装变体）、场景设定（含日景、夜景、黄昏等时间变体）、全局属性（画面比例、总时长、渲染风格）、帧连续状态（复用首帧或独立首帧）、参考图路径与配置、历史对话与分镜上下文、专业规范与校验规则。上下文管理器统一管理这些数据源，根据对话轮次按需注入：第 1 轮注入人物、场景和全局属性，第 2 轮注入帧连续状态和参考图配置，第 3 轮注入历史对话上下文，第 4 轮注入自检规则。这一机制确保了角色和场景跨分镜的一致性，避免了传统模式下每个分镜独立生成导致的设定漂移问题。')

# 六、分镜级提示词架构
add_heading('六、分镜级提示词架构', 1)
add_para('系统采用 v3.8 分镜级统一提示词架构，每个分镜生成一段完整提示词，通过时间轴分段指定镜头动作，替代旧版"逐镜头首尾帧提示词"模式。')
add_image(os.path.join(IMG_DIR, 'fig5_prompt_arch.png'), '图4  分镜级统一提示词架构（v3.8）')

add_para('六段式结构包括：固定风格前缀（如"3D 漫剧渲染风格，电影级画质"）、场景整体描述（时间、地点、氛围、人物关系）、参考图配置（图片 1 等于脸部，图片 2 等于服装，最多 9 张）、时间轴分段描述（核心，按时间段指定景别、环境、动作、运镜、音效）、全分镜统一收尾要求（运镜节奏、建模精度、特效克制度）、负面提示词（畸形肢体、文字水印、穿模等）。其中时间轴分段是核心，每段必须包含时间范围、景别、环境氛围、角色动作、运镜方式和音效描述六个要素。这种架构的优势在于一个分镜一次生成，帧对齐在时间轴内自动完成，大幅降低了镜头拼接成本。')

# 七、端到端业务流程
add_heading('七、端到端业务流程', 1)
add_para('系统端到端业务流程涉及用户、前端、Hermes Agent 和模型服务四个角色，通过泳道图清晰展示各角色的职责和交互关系。')
add_image(os.path.join(IMG_DIR, 'fig3_swimlane.png'), '图5  端到端业务流程泳道图')

add_para('用户在前端输入分镜或剧本，提交任务后前端显示实时处理进度。前端接收请求并进行参数校验后，调用 Hermes Agent 执行多轮对话优化。Hermes Agent 在执行过程中按需调用知识库获取专业规范，执行 10 项自检和修正，必要时调用 Seedance 生成视频进行效果验证。处理完成后，前端将结果展示在结果面板中，用户可查看和导出提示词、参考图上传顺序清单、镜头列表和后期转场清单。整个流程支持批量处理，系统自动排队依次处理每个分镜，并实时反馈当前处理进度（第 X 集第 Y 分镜）。')

# 八、提示词自检体系
add_heading('八、提示词自检体系', 1)
add_para('提示词自检是系统质量保障的核心环节，在第 4 轮对话中执行 10 项专项校验，每项都有明确的检查内容、通过标准和修正方式。')

add_table_caption('表1  提示词 10 项自检体系')
table = doc.add_table(rows=11, cols=3)
table.alignment = WD_TABLE_ALIGNMENT.CENTER
table.style = 'Table Grid'

headers = ['自检项', '检查内容与通过标准', '修正方式']
for i, h in enumerate(headers):
    set_cell_font(table.rows[0].cells[i], h, size=10, bold=True, color=RGBColor(0xFF,0xFF,0xFF), align='center')
    set_cell_bg(table.rows[0].cells[i], '0D1326')

self_check_data = [
    ('帧对齐链', '相邻镜头首帧等于上一镜尾帧；同场景连续动作必须帧对齐', '补充帧对齐标注，调整首帧配置'),
    ('时间轴连贯性', '各时间段首尾严密衔接，上一段结束秒等于下一段起始秒，无重叠无断裂', '调整时间段，确保首尾衔接'),
    ('总时长控制', '分镜总时长在 4 至 15 秒范围内，最佳 4 至 8 秒', '增加或减少镜头，调整各镜头时长'),
    ('景别变化', '无连续 3 个以上相同景别，无特写到极大远景的跳跃', '调整中间镜头景别，增加过渡'),
    ('参考图配置', '参考图数量不超过 9 张，引用格式正确，路径清单完整', '补充或删除参考图，修正引用格式'),
    ('负面提示词', '基础负面词必含，行走场景必含 14 项走路专属负面词', '补充缺失的负面提示词'),
    ('台词情绪描述', '有台词的镜头包含声学情绪特征，格式为"声学特征。台词：原话"', '补充声学描述，替换抽象情绪词'),
    ('动作连贯性', '角色位置、姿态、表情相邻镜头连贯，无瞬移、姿态跳跃或情绪突变', '调整动作描述，增加过渡镜头'),
    ('单一动作原则', '每个时间段只有一个核心动作，不需要移动目光就能看完', '拆分包含多个动作的时间段'),
    ('提示词语言', '提示词全部使用中文，无英文混杂（专业术语除外）', '翻译为中文'),
]

for i, (item, check, fix) in enumerate(self_check_data):
    row = table.rows[i+1]
    set_cell_font(row.cells[0], item, size=9, bold=True, align='center')
    set_cell_font(row.cells[1], check, size=9)
    set_cell_font(row.cells[2], fix, size=9)
    if i % 2 == 1:
        for cell in row.cells:
            set_cell_bg(cell, 'F5F7FA')

# 九、异常降级机制
add_heading('九、异常降级机制', 1)
add_para('为保障系统在各种异常情况下仍能提供可用输出，系统设计了 5 类异常场景的降级策略。')

add_table_caption('表2  异常降级机制')
table2 = doc.add_table(rows=6, cols=3)
table2.alignment = WD_TABLE_ALIGNMENT.CENTER
table2.style = 'Table Grid'

headers2 = ['异常场景', '降级策略', '用户体验']
for i, h in enumerate(headers2):
    set_cell_font(table2.rows[0].cells[i], h, size=10, bold=True, color=RGBColor(0xFF,0xFF,0xFF), align='center')
    set_cell_bg(table2.rows[0].cells[i], '0D1326')

degrade_data = [
    ('Hermes 服务不可用', '降级为基础模板模式，分镜拆解模板加镜头拆解模板直接填充，跳过多轮对话和自检', '仍可获得基础提示词，结果标记为"基础版"'),
    ('单轮对话超时', '终止当前分镜优化，使用已有最优结果，继续处理下一分镜，超时阈值 30 秒', '部分分镜标记为"基础版"，不影响其他分镜'),
    ('上下文文件缺失', '提示用户补充文件，或使用无上下文模式，仅基于当前分镜内容生成', '提示"未检测到人物/场景设定"，用户可后续补充'),
    ('参考图文件缺失', '提示词中标注"待补充参考图"，保留参考图配置的位置和说明', '提示词结构完整，参考图部分留空待补充'),
    ('Seedance API 不可用', '仅生成提示词，不执行视频生成，跳过最终视频生成步骤', '用户获得完整提示词后可手动在其他平台生成'),
]

for i, (scene, strategy, experience) in enumerate(degrade_data):
    row = table2.rows[i+1]
    set_cell_font(row.cells[0], scene, size=9, bold=True, align='center')
    set_cell_font(row.cells[1], strategy, size=9)
    set_cell_font(row.cells[2], experience, size=9)
    if i % 2 == 1:
        for cell in row.cells:
            set_cell_bg(cell, 'F5F7FA')

# 十、技术选型
add_heading('十、技术选型', 1)
add_para('系统基于现有技术栈构建，无新增学习成本，核心模型通过 HTTP API 集成。')

add_table_caption('表3  技术选型')
table3 = doc.add_table(rows=7, cols=3)
table3.alignment = WD_TABLE_ALIGNMENT.CENTER
table3.style = 'Table Grid'

headers3 = ['技术领域', '选型方案', '选型理由']
for i, h in enumerate(headers3):
    set_cell_font(table3.rows[0].cells[i], h, size=10, bold=True, color=RGBColor(0xFF,0xFF,0xFF), align='center')
    set_cell_bg(table3.rows[0].cells[i], '0D1326')

tech_data = [
    ('后端框架', 'Spring Boot + MyBatis', '现有项目技术栈，团队熟悉，可快速开发，与现有系统无缝集成'),
    ('大语言模型', 'Hermes Agent（豆包）', '支持多轮对话和工具调用，中文理解能力强，API 稳定，成本可控'),
    ('视频生成模型', 'Seedance 2.0（图生视频）', '支持参考图控制，中文提示词理解好，生成质量高，与 Seedream 联动'),
    ('前端框架', 'Vue 3 + Element Plus', '现有前端技术栈，组件丰富，开发效率高，与现有系统 UI 风格统一'),
    ('数据存储', 'MySQL + 文件存储', '结构化数据存 MySQL，参考图和导出文件存本地或对象存储'),
    ('知识库', 'Markdown 文件 + 语义检索', '知识库以 Markdown 格式维护便于编辑，通过语义检索加载相关规范'),
]

for i, (domain, solution, reason) in enumerate(tech_data):
    row = table3.rows[i+1]
    set_cell_font(row.cells[0], domain, size=9, bold=True, align='center')
    set_cell_font(row.cells[1], solution, size=9, align='center')
    set_cell_font(row.cells[2], reason, size=9)
    if i % 2 == 1:
        for cell in row.cells:
            set_cell_bg(cell, 'F5F7FA')

# 十一、效果衡量指标
add_heading('十一、效果衡量指标', 1)
add_para('系统上线后通过 12 项指标衡量效果，核心目标是一次生成合格率从 30% 提升至 80%，抽卡次数从 5 至 8 次降至 1 至 2 次。')

add_table_caption('表4  效果衡量指标（基线 vs 目标）')
table4 = doc.add_table(rows=9, cols=4)
table4.alignment = WD_TABLE_ALIGNMENT.CENTER
table4.style = 'Table Grid'

headers4 = ['指标名称', '当前基线', '目标值', '提升幅度']
for i, h in enumerate(headers4):
    set_cell_font(table4.rows[0].cells[i], h, size=10, bold=True, color=RGBColor(0xFF,0xFF,0xFF), align='center')
    set_cell_bg(table4.rows[0].cells[i], '0D1326')

metric_data = [
    ('一次生成合格率', '30%', '80%', '+50 个百分点'),
    ('平均抽卡次数', '5-8 次', '1-2 次', '降低 70%'),
    ('帧对齐准确率', '40%', '90%', '+50 个百分点'),
    ('角色一致性', '50%', '85%', '+35 个百分点'),
    ('场景一致性', '55%', '88%', '+33 个百分点'),
    ('单分镜处理时长', '15-20 分钟', '2-3 分钟', '降低 85%'),
    ('提示词结构完整率', '60%', '98%', '+38 个百分点'),
    ('负面提示词覆盖率', '30%', '100%', '+70 个百分点'),
]

for i, (name, baseline, target, improvement) in enumerate(metric_data):
    row = table4.rows[i+1]
    set_cell_font(row.cells[0], name, size=9, bold=True)
    set_cell_font(row.cells[1], baseline, size=9, align='center', color=RGBColor(0xC9,0x30,0x2C))
    set_cell_font(row.cells[2], target, size=9, align='center', color=RGBColor(0x25,0x63,0xEB), bold=True)
    set_cell_font(row.cells[3], improvement, size=9, align='center')
    if i % 2 == 1:
        for cell in row.cells:
            set_cell_bg(cell, 'F5F7FA')

# 十二、方案核心优势与长期价值
add_heading('十二、方案核心优势与长期价值', 1)
add_para('本方案具有五大核心优势：一是多轮对话自我优化机制，通过 3 至 5 轮自我对话完成生成、自检、修正闭环，模拟资深工程师的工作流程；二是分镜级统一提示词架构，v3.8 六段式结构配合时间轴分段，一个分镜一次生成，帧对齐自动完成；三是上下文注入机制，7 类数据源自动注入，确保角色和场景跨分镜一致性；四是 10 项专项自检体系，覆盖视频生成场景的关键质量维度，每项有明确通过标准和修正方式；五是低门槛快速落地，复用现有 Java 加 Vue 技术栈，2 至 3 周核心能力上线，无新增人员编制。')

add_para('从长期价值来看，系统不仅是一个提效工具，更是一个方法论沉淀平台。通过 Bad Case 反馈机制，优质案例持续沉淀为知识库，系统越用越聪明，形成数据飞轮。提示词自动生成为 AI 视频全自动化生产打下基础，后续可扩展剧本自动生成、分镜自动拆解、视频自动生成、后期自动剪辑的全链路，为 AI 短剧工业化生产提供核心能力支撑。')

add_para('综上所述，本方案通过 Hermes Agent 多轮对话机制，将资深提示词工程师的工作流程自动化，配合分镜级统一提示词架构、上下文注入和 10 项自检体系，能够显著提升提示词质量和生产效率，方案技术可行、落地路径清晰、效果可衡量，建议尽快启动阶段一开发。')

# 保存
doc.save(OUT_PATH)
print(f'Document saved: {OUT_PATH}')

# 统计字数
total_chars = 0
for para in doc.paragraphs:
    total_chars += len(para.text)
for table in doc.tables:
    for row in table.rows:
        for cell in row.cells:
            total_chars += len(cell.text)
print(f'Total characters (approx): {total_chars}')
