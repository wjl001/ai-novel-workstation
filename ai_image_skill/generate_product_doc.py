# -*- coding: utf-8 -*-
"""
生成AI文生图提示词导演产品方案文档
"""
from docx import Document
from docx.shared import Inches, Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml.ns import qn, nsdecls
from docx.oxml import parse_xml
import os

OUTPUT_DIR = r'D:\phpstudy_pro\WWW\ai-novel-workstation1.2.0\ai_image_skill'
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

def add_heading(text, level=1):
    sizes = {1: 16, 2: 14, 3: 12}
    sb_map = {1: 18, 2: 14, 3: 10}
    sa_map = {1: 8, 2: 6, 3: 4}
    para = doc.add_paragraph()
    para.alignment = WD_ALIGN_PARAGRAPH.LEFT
    pf = para.paragraph_format
    pf.space_before = Pt(sb_map.get(level, 10))
    pf.space_after = Pt(sa_map.get(level, 4))
    pf.line_spacing = 1.5
    run = para.add_run(text)
    set_font(run, size=sizes.get(level, 12), bold=True, color=RGBColor(0, 0, 0))
    para.style = doc.styles[f'Heading {level}']
    for run in para.runs:
        set_font(run, size=sizes.get(level, 12), bold=True, color=RGBColor(0, 0, 0))
    return para

def add_body(text, bold=False, indent=True):
    para = doc.add_paragraph()
    para.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    pf = para.paragraph_format
    pf.space_before = Pt(0)
    pf.space_after = Pt(0)
    pf.line_spacing = 1.5
    pf.first_line_indent = Pt(24) if indent else Pt(0)
    run = para.add_run(text)
    set_font(run, size=12, bold=bold)
    return para

def add_table(headers, rows, widths=None):
    table = doc.add_table(rows=1+len(rows), cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = 'Table Grid'
    for i, h in enumerate(headers):
        cell = table.rows[0].cells[i]
        cell.text = ''
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run(h)
        set_font(run, size=10.5, bold=True)
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="D9D9D9"/>')
        cell._tc.get_or_add_tcPr().append(shading)
    for r, row in enumerate(rows):
        for c, val in enumerate(row):
            cell = table.rows[r+1].cells[c]
            cell.text = ''
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if c == 0 else WD_ALIGN_PARAGRAPH.LEFT
            run = p.add_run(str(val))
            set_font(run, size=10.5)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
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

# ===== 标题页 =====
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(60)
p.paragraph_format.space_after = Pt(12)
r = p.add_run('AI文生图提示词导演')
set_font(r, size=26, bold=True)

p2 = doc.add_paragraph()
p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
p2.paragraph_format.space_after = Pt(8)
r2 = p2.add_run('产品方案设计')
set_font(r2, size=20, bold=True)

p3 = doc.add_paragraph()
p3.alignment = WD_ALIGN_PARAGRAPH.CENTER
p3.paragraph_format.space_after = Pt(30)
r3 = p3.add_run('—— 从"碰运气生图"到"可视化导演决策" ——')
set_font(r3, size=14, color=RGBColor(100, 100, 100))

info_table = doc.add_table(rows=4, cols=2)
info_table.alignment = WD_TABLE_ALIGNMENT.CENTER
info_table.style = 'Table Grid'
info_data = [('文档版本', 'V1.0'), ('编制日期', '2026-09-14'),
              ('文档状态', '初稿'), ('适用范围', 'AI短剧/AI内容生成平台')]
for i, (k, v) in enumerate(info_data):
    c1 = info_table.rows[i].cells[0]
    c1.text = ''
    pp = c1.paragraphs[0]
    pp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    rr = pp.add_run(k)
    set_font(rr, size=11, bold=True)
    c1.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="F2F2F2"/>')
    c1._tc.get_or_add_tcPr().append(shading)
    c2 = info_table.rows[i].cells[1]
    c2.text = ''
    pp2 = c2.paragraphs[0]
    rr2 = pp2.add_run(v)
    set_font(rr2, size=11)
    c2.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
for row in info_table.rows:
    row.cells[0].width = Cm(4)
    row.cells[1].width = Cm(8)

doc.add_page_break()

# ===== 1. 产品概述 =====
add_heading('1. 产品概述', level=1)

add_heading('1.1 背景与问题', level=2)
add_body('当前AI内容生成平台（尤其是AI短剧制作流程）中，图片生成是视频生成的基础——首帧图决定了人物、场景、光影等基础条件，图片质量直接影响后续视频生成的效果和一致性。')
add_body('然而在实际使用中，用户（尤其是非专业用户）在写提示词时普遍存在以下问题：')
add_body('（1）凭感觉写词：哪里不满意补一句，哪里不对改一句，最终生成效果靠运气；', indent=False)
add_body('（2）结构缺失：只描述主体，忽略风格、视角、构图、光影、色调等关键维度；', indent=False)
add_body('（3）辞藻堆砌：一上来就堆"超高清、8K、电影感、顶级、震撼、大师"，但主体、构图、光线都没说清楚；', indent=False)
add_body('（4）人物"模型脸"：人物高清但一眼就是AI，皮肤过度磨皮、高光整张脸油亮、情绪描述无法转化为动作；', indent=False)
add_body('（5）专业知识门槛高：摄影、布光、构图、色彩等专业知识需要长期积累，普通用户难以掌握。', indent=False)

add_heading('1.2 产品目标', level=2)
add_body('本产品旨在将专业电影摄影与视觉导演的方法论产品化，让普通用户也能写出结构化、可复现、高质量的专业级提示词。核心目标：')
add_body('（1）将"碰运气生图"升级为"可控制生图"——通过七维框架确保提示词结构完整；', indent=False)
add_body('（2）将"专业知识门槛"转化为"可视化操作"——通过词库、模板、引导式交互降低使用门槛；', indent=False)
add_body('（3）将"AI模型脸"升级为"真人真实感"——通过皮肤纹理、高光控制、情绪转动作等专项优化；', indent=False)
add_body('（4）将"单张图思维"升级为"AI短剧镜头思维"——支持多视角组合、镜头组、色调资产库等短剧专属能力。', indent=False)

add_heading('1.3 产品定位', level=2)
add_table(
    ['维度', '定位'],
    [
        ['产品名称', 'AI文生图提示词导演（Prompt Director）'],
        ['核心价值', '将专业视觉导演方法论产品化，让人人都能写出专业级提示词'],
        ['目标用户', 'AI短剧创作者、AI内容生成平台用户、设计师、运营人员'],
        ['使用场景', 'AI短剧首帧图生成、角色设定图、场景概念图、道具设计图、营销素材图'],
        ['产品形态', '内嵌于AI内容生成平台的提示词优化模块 + 独立Skill能力包'],
        ['核心方法论', '七维框架（风格+视角+主体+背景+细节+光影+质量）'],
    ],
    widths=[3, 12]
)

# ===== 2. 核心功能设计 =====
add_heading('2. 核心功能设计', level=1)

add_heading('2.1 功能架构总览', level=2)
add_body('产品由六大核心功能模块组成，覆盖从提示词生成、优化、诊断到真实感专项的全流程：')
add_table(
    ['模块', '核心功能', '解决的问题'],
    [
        ['七维框架提示词生成', '按风格/视角/主体/背景/细节/光影/质量七维度引导式生成提示词', '提示词结构缺失、凭感觉写词'],
        ['提示词优化诊断', '分析现有提示词的缺失维度，给出针对性优化建议', '不知道提示词哪里不好、怎么改'],
        ['六大控制模块', '风格控制、视角/镜头语言、构图控制、光影控制、色调控制、人物真实感', '专业知识门槛高'],
        ['固定模板库', '角色四视图模板、场景概念图模板、道具产品图模板等', '重复劳动、格式不统一'],
        ['提示词词库', '按七维度分类的专业词汇库，支持搜索和一键插入', '不知道用什么专业词汇'],
        ['优化检查清单', '生成后逐项检查提示词质量，确保七维度全覆盖', '遗漏关键维度、质量不稳定'],
    ],
    widths=[3, 7, 5]
)

add_heading('2.2 七维框架提示词生成', level=2)
add_body('这是产品的核心功能。用户只需提供简单描述，系统按七维度引导用户补充信息，最终输出结构化的专业级提示词。')
add_table(
    ['维度', '用户输入方式', '系统辅助', '输出内容'],
    [
        ['风格', '选择/输入风格类型', '风格词库推荐、风格逆向工程、风格融合建议', '明确的风格描述'],
        ['视角', '选择镜头参数组合', '视角组合推荐、短剧常用三视角、镜头语言说明', '多参数组合的视角描述'],
        ['主体', '输入主体描述', '人物DNA模板、道具描述模板、场景分层模板', '详细的主体特征描述'],
        ['背景', '选择/输入背景', '背景类型推荐、前中后景分层引导', '有内容的环境描述'],
        ['细节', '输入细节要求', '材质词库、服饰细节词库、环境细节词库', '匹配景别的细节描述'],
        ['光影', '选择光影方案', '五维度光影控制、专业布光术语、自然语言写光', '可控的光源/方向/明暗/色温'],
        ['质量', '选择质量等级', '分辨率建议、质量词推荐、避免过度锐化提醒', '适度的质量提升词'],
    ],
    widths=[2, 3, 5, 4]
)

add_heading('2.3 提示词优化诊断', level=2)
add_body('用户粘贴现有提示词后，系统自动进行七维诊断，分析每个维度的覆盖情况和质量问题，并给出具体的优化建议。')
add_body('诊断输出包含：')
add_body('（1）七维覆盖度雷达图——直观展示哪些维度缺失、哪些维度薄弱；', indent=False)
add_body('（2）逐维度问题分析——指出每个维度的具体问题（如视角只有一个词建议多参数组合、光影只说光线很好未说明光源方向）；', indent=False)
add_body('（3）优先级排序——先补结构（风格/视角/主体），再补氛围（背景/光影），最后补细节；', indent=False)
add_body('（4）优化版提示词——保留原文有效内容，补充缺失维度，输出完整优化版。', indent=False)

add_heading('2.4 人物真实感专项优化（告别模型脸）', level=2)
add_body('这是产品的差异化核心功能，专门解决AI人物"高清但一眼就是AI"的问题。')
add_table(
    ['优化项', '问题', '解决方案', '效果'],
    [
        ['皮肤纹理', '过度磨皮、皮肤像塑料', '按景别匹配皮肤细节量，区域差异化纹理描述', '皮肤有毛孔/细纹/绒毛，真实感强'],
        ['高光控制', '整张脸油亮、高光错误', '强调高光"小、碎、局部"，服从骨骼结构（鼻梁/颧骨/下唇）', '高光自然，不再塑料感'],
        ['瑕疵保留', '皮肤过于完美不真实', '引导保留适当瑕疵（雀斑/痘印/肤色不均/细小绒毛）', '真实源于瑕疵，更像真人'],
        ['情绪转动作', '只描述心理，镜头拍不到', '将"害羞/愤怒/悲伤"等情绪翻译为连续可见的微动作', '人物表情自然，视频动作连贯'],
        ['描述顺序', '脸没稳定就写情绪', '强制"脸→肤质→光线→情绪"顺序，先修骨肉再注入灵魂', '人物一致性提升，不易跑偏'],
        ['分辨率控制', '盲目追求高分辨率', '推荐2K人物模板，提醒过度锐化会失去真实感', '清晰度与真实感平衡'],
    ],
    widths=[2.5, 3, 5.5, 3]
)

add_heading('2.5 固定模板库', level=2)
add_body('预设多种高频场景的固定提示词模板，用户只需填写占位符即可快速生成专业提示词：')
add_table(
    ['模板名称', '适用场景', '核心结构', '优化后字数'],
    [
        ['角色四视图模板', '角色设定、人物一致性', '画质+人物DNA+发型+服饰+四视角分别描述+负面词', '约400-500字'],
        ['场景概念图模板', '场景设计、环境概念', '画质+整体+前中后景分层+光线+色彩+构图+负面词', '约300-400字'],
        ['道具产品图模板', '道具设计、产品展示', '画质+整体+材质表现+光影+构图+色彩+负面词', '约250-350字'],
        ['人物肖像模板', '人物近景/特写', '画质+人物+皮肤真实感+布光+背景+情绪动作', '约200-300字'],
        ['电影场景模板', 'AI短剧首帧图', '画质+风格+视角组合+主体+背景+光影+色调+负面词', '约300-500字'],
    ],
    widths=[3, 3.5, 6, 2.5]
)

# ===== 3. 用户使用流程 =====
add_heading('3. 用户使用流程', level=1)

add_heading('3.1 核心使用流程', level=2)
add_body('用户使用"提示词导演"功能的核心流程如下：')
add_table(
    ['步骤', '用户操作', '系统响应', '输出'],
    [
        ['1. 选择模式', '选择"从零生成"或"优化现有提示词"', '进入对应流程', '模式选择页'],
        ['2a. 从零生成', '输入简单描述（如"古代侠女"）', '自动识别主体类型，进入七维引导', '主体类型识别结果'],
        ['2b. 优化现有', '粘贴现有提示词', '七维诊断分析，输出缺失维度和优化建议', '诊断报告+优化版'],
        ['3. 七维填充', '按引导逐维度选择/输入，可跳过非必填项', '每维度提供词库推荐和模板辅助', '实时预览提示词'],
        ['4. 真实感优化', '（人物图）开启真实感优化，选择皮肤模板', '自动补充皮肤纹理、高光控制、情绪转动作', '真实感增强版提示词'],
        ['5. 检查清单', '查看优化检查清单，确认七维度全覆盖', '逐项检查，标记未覆盖维度', '检查结果'],
        ['6. 生成图片', '点击生成，调用生图模型', '传入优化后提示词，生成图片', '生成结果'],
        ['7. 反馈迭代', '对结果不满意，点击对应维度调整', '快速修改对应维度，重新生成', '迭代优化'],
    ],
    widths=[2, 4, 5, 3]
)

add_heading('3.2 典型使用场景', level=2)
add_body('场景一：AI短剧首帧图生成——用户输入"古代客栈夜晚"，系统识别为场景类，引导按前中后景分层描述，推荐窗户侧光+油灯暖光的光影方案，选择暖木色调，输出电影级场景提示词。')
add_body('场景二：角色设定图——用户输入"侠女"，系统识别为角色类，自动调用角色四视图模板，引导填写年龄/五官/发型/服饰，开启成年人皮肤真实感模板，输出四视图一致的角色设定图。')
add_body('场景三：提示词优化——用户粘贴一段自己写的提示词，系统诊断发现"只有主体描述，缺少视角、光影、色调"，自动补充缺失维度，输出优化版并说明改了什么。')

# ===== 4. 技术架构方案 =====
add_heading('4. 技术架构方案', level=1)

add_heading('4.1 系统架构', level=2)
add_body('产品采用前后端分离架构，核心能力封装为独立的提示词引擎服务，可内嵌于AI内容生成平台，也可作为独立Skill调用。')
add_table(
    ['层级', '组件', '职责'],
    [
        ['前端层', '提示词编辑器、七维引导界面、诊断可视化、模板选择器', '用户交互、实时预览、可视化诊断'],
        ['后端服务层', '提示词引擎服务、模板管理服务、词库管理服务、用户配置服务', '核心业务逻辑、模板/词库管理、用户数据'],
        ['能力层', '七维框架引擎、诊断分析引擎、真实感优化引擎、风格融合引擎', '核心算法能力，可独立调用'],
        ['数据层', '提示词模板库、专业词库、用户历史、风格资产库、色调资产库', '数据存储与管理'],
        ['集成层', '生图模型API对接、AI内容生成平台集成、Skill能力包导出', '与外部系统对接'],
    ],
    widths=[2.5, 5.5, 7]
)

add_heading('4.2 核心数据模型', level=2)
add_table(
    ['数据表', '核心字段', '说明'],
    [
        ['prompt_template', '模板ID、名称、类型、七维结构、占位符定义、适用场景', '固定提示词模板'],
        ['prompt_vocabulary', '词汇ID、维度、词汇、释义、适用场景、标签', '七维度专业词库'],
        ['skin_template', '模板ID、名称、适用人群/景别、皮肤描述文本、高光描述', '皮肤真实感模板'],
        ['emotion_action_map', '情绪ID、情绪名称、动作序列、适用场景', '情绪转动作映射库'],
        ['user_prompt_history', '记录ID、用户ID、原始提示词、优化后提示词、使用模板、生成结果', '用户使用历史'],
        ['style_asset', '风格ID、名称、风格关键词、参考图、融合搭配建议', '风格资产库'],
        ['color_asset', '色调ID、名称、主色调、点缀色、情绪表达、适用场景', '色调资产库'],
    ],
    widths=[3, 6, 6]
)

add_heading('4.3 关键技术点', level=2)
add_body('（1）七维框架解析引擎：基于规则+NLP的提示词维度识别与解析，自动判断现有提示词覆盖了哪些维度、缺失哪些维度；', indent=False)
add_body('（2）模板占位符填充引擎：支持动态占位符定义、条件填充、默认值推荐，用户输入简单描述后自动匹配并填充模板；', indent=False)
add_body('（3）真实感优化引擎：基于人物描述顺序检查、皮肤细节量匹配（按景别）、高光控制、情绪转动作翻译，输出真实感增强版提示词；', indent=False)
add_body('（4）风格融合推荐引擎：基于风格互补性分析，推荐适合融合的风格组合，避免错误融合（如水墨+赛博朋克）；', indent=False)
add_body('（5）提示词质量评分：基于七维覆盖度、结构合理性、细节匹配度、真实感指标等多维度评分，为用户提供量化的质量反馈。', indent=False)

# ===== 5. 商业模式与定价 =====
add_heading('5. 商业模式与定价', level=1)

add_heading('5.1 商业模式', level=2)
add_body('产品采用"基础功能免费+高级功能订阅+企业定制"的三层商业模式：')
add_table(
    ['层级', '功能范围', '定价', '目标用户'],
    [
        ['免费版', '七维框架生成、基础模板库（3套）、基础词库、提示词诊断', '免费', '普通用户、轻度使用者'],
        ['专业版（订阅）', '全部模板库（10+套）、完整词库、人物真实感优化、风格融合、色调资产库、历史记录', '¥29/月 或 ¥299/年', 'AI短剧创作者、设计师、重度用户'],
        ['企业版', 'API接口、私有化部署、定制模板/词库、团队协作、SLA保障、专属客服', '¥9999/年起', 'AI内容平台、MCN机构、企业团队'],
    ],
    widths=[2.5, 6, 3, 3.5]
)

add_heading('5.2 增值服务', level=2)
add_body('（1）提示词代优化服务：用户提供需求，专业团队代为优化提示词，按次收费（¥9.9/次）；', indent=False)
add_body('（2）风格/色调定制：为企业客户定制专属风格资产库和色调资产库，按项目收费；', indent=False)
add_body('（3）培训课程：基于本产品方法论的AI文生图专业培训课程，线上¥199/人，线下企业定制¥9999/场。', indent=False)

add_heading('5.3 成本与收益测算', level=2)
add_table(
    ['指标', '估算', '说明'],
    [
        ['研发成本（首年）', '约80-120万元', '前端2人+后端2人+算法1人+产品1人，6个月开发+6个月迭代'],
        ['运营成本（首年）', '约20-30万元', '服务器、词库维护、用户运营、客服'],
        ['盈亏平衡用户数', '约5000专业版订阅用户', '按¥299/年计算，5000×299≈150万/年'],
        ['预期首年收入', '约100-200万元', '免费转付费率5%-10%，企业客户3-5家'],
        ['投资回收期', '约12-18个月', '基于保守收入预测'],
    ],
    widths=[3.5, 3.5, 8]
)

# ===== 6. 开发工作量评估 =====
add_heading('6. 开发工作量评估', level=1)

add_heading('6.1 任务拆解与人天估算', level=2)
add_table(
    ['模块', '任务项', '前端(人天)', '后端(人天)', '说明'],
    [
        ['基础框架', '七维框架数据结构与引擎', '5', '10', '核心解析与生成逻辑'],
        ['', '提示词编辑器与实时预览', '8', '2', '富文本编辑器、占位符高亮'],
        ['', '七维引导交互界面', '10', '3', '分步引导、维度选择、词库推荐'],
        ['模板库', '模板管理后台', '3', '5', '模板CRUD、版本管理'],
        ['', '5套基础模板开发', '2', '5', '角色四视图/场景/道具/肖像/电影场景'],
        ['词库', '七维度词库建设', '2', '8', '约500+专业词汇录入与分类'],
        ['', '词库搜索与推荐', '3', '3', '关键词搜索、维度筛选、一键插入'],
        ['诊断优化', '七维诊断分析引擎', '3', '8', '维度识别、缺失分析、优化建议'],
        ['', '诊断可视化（雷达图等）', '5', '2', '覆盖度可视化、问题标注'],
        ['真实感', '皮肤模板库建设', '1', '5', '4套皮肤模板+景别匹配逻辑'],
        ['', '情绪转动作映射库', '1', '4', '20+情绪的动作序列映射'],
        ['', '真实感优化引擎', '2', '6', '顺序检查、细节匹配、高光控制'],
        ['用户系统', '用户历史记录', '3', '4', '历史保存、搜索、复用'],
        ['', '用户偏好配置', '2', '3', '默认模板、风格偏好、快捷设置'],
        ['集成', '生图模型API对接', '2', '5', '对接现有生图模型，支持多模型'],
        ['', '平台内嵌集成', '3', '3', '嵌入AI内容生成平台'],
        ['测试', '功能测试与联调', '5', '5', '全功能测试、场景覆盖'],
        ['', 'Bug修复与优化', '3', '3', '测试阶段问题修复'],
        ['合计', '', '63', '84', '总计147人天'],
    ],
    widths=[2, 4.5, 2, 2, 4.5]
)

add_heading('6.2 排期建议', level=2)
add_table(
    ['阶段', '周期', '主要工作', '里程碑'],
    [
        ['第一阶段：基础能力', '第1-4周（20人天）', '七维框架引擎、提示词编辑器、基础模板（3套）、基础词库', '可生成基础提示词'],
        ['第二阶段：诊断与模板', '第5-8周（25人天）', '七维诊断引擎、诊断可视化、完整模板库（5套）、完整词库', '提示词诊断优化可用'],
        ['第三阶段：真实感专项', '第9-11周（15人天）', '皮肤模板库、情绪转动作库、真实感优化引擎', '人物真实感优化上线'],
        ['第四阶段：用户与集成', '第12-14周（15人天）', '用户历史、偏好配置、生图API对接、平台集成', '平台内嵌可用'],
        ['第五阶段：测试上线', '第15-16周（10人天）', '全功能测试、Bug修复、性能优化、上线部署', '正式上线'],
    ],
    widths=[3, 3, 6.5, 3]
)
add_body('总排期约16周（4个月），投入前端2人+后端2人+算法1人+产品1人。若需压缩排期，可增加1名前端开发，重点加速引导界面和编辑器开发，预计可压缩至12-14周。')

# ===== 7. 风险与应对 =====
add_heading('7. 风险与应对', level=1)
add_table(
    ['风险类型', '风险描述', '影响程度', '应对措施'],
    [
        ['技术风险', '七维框架解析准确率不足，维度识别错误', '中', '基于规则+关键词匹配，持续优化识别规则；提供手动修正入口'],
        ['技术风险', '不同生图模型对提示词响应差异大，优化效果不稳定', '中', '建立模型适配层，针对不同模型调整提示词结构；提供模型选择和效果对比'],
        ['产品风险', '用户觉得流程复杂，不愿按七维度逐步填写', '高', '提供快速模式（仅必填3项）和专业模式（全七维）；支持一键套用模板；智能推荐默认值'],
        ['产品风险', '真实感优化效果不明显，用户感知价值低', '中', '提供优化前后对比图；建立真实感评分指标；持续优化皮肤模板和高光控制'],
        ['商业风险', '免费用户不愿付费，转化率低', '中', '高级功能（真实感优化、完整模板库）设置为付费；提供免费试用次数；企业客户拓展'],
        ['内容风险', '词库和模板覆盖场景有限，无法满足所有用户需求', '低', '支持用户自定义模板和词库；建立UGC贡献机制；持续扩充官方模板库'],
        ['竞争风险', '同类提示词优化工具出现，差异化不足', '中', '强化人物真实感和AI短剧场景适配；建立方法论壁垒（七维框架+导演思维）'],
    ],
    widths=[2, 5, 1.5, 6.5]
)

# ===== 8. 总结与建议 =====
add_heading('8. 总结与建议', level=1)

add_heading('8.1 核心价值总结', level=2)
add_body('AI文生图提示词导演产品的核心价值在于将专业电影摄影与视觉导演的方法论产品化，解决AI内容生成中"提示词写不好、图片质量不稳定、人物不真实"三大痛点。')
add_body('（1）方法论价值：七维框架（风格+视角+主体+背景+细节+光影+质量）将提示词写作从"艺术"变为"工程"，可复现、可优化、可传承；', indent=False)
add_body('（2）差异化价值：人物真实感专项优化（皮肤纹理+高光控制+情绪转动作）是市场空白，直接解决"AI模型脸"痛点；', indent=False)
add_body('（3）场景价值：深度适配AI短剧制作流程（首帧图、角色四视图、场景概念图、色调资产库），与现有AI内容生成平台形成协同。', indent=False)

add_heading('8.2 实施建议', level=2)
add_body('（1）MVP优先：第一阶段先上线七维框架生成+3套基础模板+基础词库，验证核心价值和用户接受度，再逐步迭代高级功能；', indent=False)
add_body('（2）与AI短剧平台深度集成：将提示词导演内嵌于AI短剧制作流程，首帧图生成时自动调用，降低用户使用门槛；', indent=False)
add_body('（3）建立内容运营机制：持续扩充模板库和词库，鼓励用户贡献和分享优质提示词，形成内容生态；', indent=False)
add_body('（4）数据驱动优化：收集用户使用数据（哪些维度最常缺失、哪些模板最常用、优化前后效果对比），持续优化产品和算法。', indent=False)

add_heading('8.3 一句话总结', level=2)
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(12)
p.paragraph_format.space_after = Pt(12)
r = p.add_run('提示词不是堆词，而是在给AI做导演决策——让人人都能成为视觉导演。')
set_font(r, size=14, bold=True, color=RGBColor(31, 78, 121))

# 保存
output_path = os.path.join(OUTPUT_DIR, 'AI文生图提示词导演_产品方案.docx')
doc.save(output_path)
print(f'Document saved: {output_path}')
