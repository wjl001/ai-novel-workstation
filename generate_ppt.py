
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

prs = Presentation()
prs.slide_width = Inches(10)
prs.slide_height = Inches(5.625)

def add_title_slide(title, subtitle):
    slide_layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(slide_layout)
    
    background = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height
    )
    background.fill.solid()
    background.fill.fore_color.rgb = RGBColor(25, 35, 60)
    
    title_shape = slide.shapes.add_textbox(
        Inches(0.8), Inches(1.5), Inches(8.4), Inches(1.2)
    )
    title_tf = title_shape.text_frame
    title_tf.text = title
    title_para = title_tf.paragraphs[0]
    title_para.font.size = Pt(44)
    title_para.font.bold = True
    title_para.font.color.rgb = RGBColor(255, 255, 255)
    title_para.alignment = PP_ALIGN.CENTER
    
    subtitle_shape = slide.shapes.add_textbox(
        Inches(0.8), Inches(3.0), Inches(8.4), Inches(0.8)
    )
    subtitle_tf = subtitle_shape.text_frame
    subtitle_tf.text = subtitle
    subtitle_para = subtitle_tf.paragraphs[0]
    subtitle_para.font.size = Pt(24)
    subtitle_para.font.color.rgb = RGBColor(180, 200, 255)
    subtitle_para.alignment = PP_ALIGN.CENTER

def add_content_slide(title, content_list, layout="single"):
    slide_layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(slide_layout)
    
    background = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height
    )
    background.fill.solid()
    background.fill.fore_color.rgb = RGBColor(245, 248, 255)
    
    title_bar = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, Inches(0.8)
    )
    title_bar.fill.solid()
    title_bar.fill.fore_color.rgb = RGBColor(41, 128, 185)
    
    title_shape = slide.shapes.add_textbox(
        Inches(0.5), Inches(0.15), Inches(9), Inches(0.5)
    )
    title_tf = title_shape.text_frame
    title_tf.text = title
    title_para = title_tf.paragraphs[0]
    title_para.font.size = Pt(28)
    title_para.font.bold = True
    title_para.font.color.rgb = RGBColor(255, 255, 255)
    
    content_box = slide.shapes.add_textbox(
        Inches(0.6), Inches(1.0), Inches(8.8), Inches(4.2)
    )
    tf = content_box.text_frame
    tf.word_wrap = True
    
    for i, (point, detail) in enumerate(content_list):
        if i == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
        p.text = f"• {point}"
        p.font.size = Pt(16)
        p.font.color.rgb = RGBColor(44, 62, 80)
        p.space_after = Pt(8)
        
        if detail:
            p_detail = tf.add_paragraph()
            p_detail.text = f"  {detail}"
            p_detail.font.size = Pt(14)
            p_detail.font.color.rgb = RGBColor(80, 95, 120)
            p_detail.space_after = Pt(12)

def add_comparison_slide(title, left_title, left_content, right_title, right_content):
    slide_layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(slide_layout)
    
    background = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height
    )
    background.fill.solid()
    background.fill.fore_color.rgb = RGBColor(245, 248, 255)
    
    title_bar = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, Inches(0.8)
    )
    title_bar.fill.solid()
    title_bar.fill.fore_color.rgb = RGBColor(39, 174, 96)
    
    title_shape = slide.shapes.add_textbox(
        Inches(0.5), Inches(0.15), Inches(9), Inches(0.5)
    )
    title_tf = title_shape.text_frame
    title_tf.text = title
    title_para = title_tf.paragraphs[0]
    title_para.font.size = Pt(28)
    title_para.font.bold = True
    title_para.font.color.rgb = RGBColor(255, 255, 255)
    
    left_box = slide.shapes.add_textbox(
        Inches(0.3), Inches(1.0), Inches(4.5), Inches(4.2)
    )
    left_tf = left_box.text_frame
    left_tf.word_wrap = True
    left_header = left_tf.paragraphs[0]
    left_header.text = left_title
    left_header.font.size = Pt(20)
    left_header.font.bold = True
    left_header.font.color.rgb = RGBColor(41, 128, 185)
    left_header.space_after = Pt(12)
    
    for item in left_content:
        p = left_tf.add_paragraph()
        p.text = f"• {item}"
        p.font.size = Pt(14)
        p.font.color.rgb = RGBColor(44, 62, 80)
        p.space_after = Pt(6)
    
    right_box = slide.shapes.add_textbox(
        Inches(5.2), Inches(1.0), Inches(4.5), Inches(4.2)
    )
    right_tf = right_box.text_frame
    right_tf.word_wrap = True
    right_header = right_tf.paragraphs[0]
    right_header.text = right_title
    right_header.font.size = Pt(20)
    right_header.font.bold = True
    right_header.font.color.rgb = RGBColor(231, 76, 60)
    right_header.space_after = Pt(12)
    
    for item in right_content:
        p = right_tf.add_paragraph()
        p.text = f"• {item}"
        p.font.size = Pt(14)
        p.font.color.rgb = RGBColor(44, 62, 80)
        p.space_after = Pt(6)

def add_table_slide(title, headers, rows):
    slide_layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(slide_layout)
    
    background = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height
    )
    background.fill.solid()
    background.fill.fore_color.rgb = RGBColor(245, 248, 255)
    
    title_bar = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, Inches(0.8)
    )
    title_bar.fill.solid()
    title_bar.fill.fore_color.rgb = RGBColor(155, 89, 182)
    
    title_shape = slide.shapes.add_textbox(
        Inches(0.5), Inches(0.15), Inches(9), Inches(0.5)
    )
    title_tf = title_shape.text_frame
    title_tf.text = title
    title_para = title_tf.paragraphs[0]
    title_para.font.size = Pt(28)
    title_para.font.bold = True
    title_para.font.color.rgb = RGBColor(255, 255, 255)
    
    table = slide.shapes.add_table(
        rows=len(rows)+1,
        cols=len(headers),
        left=Inches(0.3),
        top=Inches(1.0),
        width=Inches(9.4),
        height=Inches(4.0)
    ).table
    
    for i, header in enumerate(headers):
        cell = table.cell(0, i)
        cell.text = header
        cell.fill.solid()
        cell.fill.fore_color.rgb = RGBColor(41, 128, 185)
        for paragraph in cell.text_frame.paragraphs:
            paragraph.font.size = Pt(12)
            paragraph.font.bold = True
            paragraph.font.color.rgb = RGBColor(255, 255, 255)
    
    for row_idx, row_data in enumerate(rows):
        for col_idx, cell_data in enumerate(row_data):
            cell = table.cell(row_idx+1, col_idx)
            cell.text = cell_data
            cell.fill.solid()
            if row_idx % 2 == 0:
                cell.fill.fore_color.rgb = RGBColor(236, 240, 241)
            else:
                cell.fill.fore_color.rgb = RGBColor(255, 255, 255)
            for paragraph in cell.text_frame.paragraphs:
                paragraph.font.size = Pt(10)
                paragraph.font.color.rgb = RGBColor(44, 62, 80)

def add_conclusion_slide(title, conclusion_points):
    slide_layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(slide_layout)
    
    background = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height
    )
    background.fill.solid()
    background.fill.fore_color.rgb = RGBColor(25, 35, 60)
    
    title_shape = slide.shapes.add_textbox(
        Inches(0.8), Inches(0.5), Inches(8.4), Inches(0.8)
    )
    title_tf = title_shape.text_frame
    title_tf.text = title
    title_para = title_tf.paragraphs[0]
    title_para.font.size = Pt(32)
    title_para.font.bold = True
    title_para.font.color.rgb = RGBColor(255, 255, 255)
    title_para.alignment = PP_ALIGN.CENTER
    
    content_box = slide.shapes.add_textbox(
        Inches(0.8), Inches(1.5), Inches(8.4), Inches(3.5)
    )
    tf = content_box.text_frame
    tf.word_wrap = True
    
    for i, point in enumerate(conclusion_points):
        if i == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
        p.text = f"✓ {point}"
        p.font.size = Pt(18)
        p.font.color.rgb = RGBColor(180, 220, 255)
        p.space_after = Pt(10)

add_title_slide("国内短剧平台竞品调研报告", "移动端功能分析与差异化竞争策略")

add_content_slide("市场概览", [
    ("2026年AI短剧市场规模预计突破677.9亿元", "用户规模从1.2亿增至2.8亿"),
    ("AI仿真人短剧在漫剧百强榜占比从7%飙升至38%", "日均上线新作超过600部"),
    ("爆款率仅0.16%，64%作品播放量无法突破100万", "选择合适工具是破局关键")
])

table_headers = ["平台", "所属公司", "有移动端", "主要特色", "PC端引流"]
table_rows = [
    ["小云雀", "字节跳动", "✅有", "一句话生成短剧，短剧Agent", "暂无PC版"],
    ["即梦AI", "字节跳动", "✅有", "AI绘画+视频+数字人", "字节生态联动"],
    ["可灵AI", "快手", "✅有", "长视频生成（120秒）", "网页/APP/小程序多端同步"],
    ["纳米漫剧", "360", "✗无", "工业级流水线", "PC端为主"],
    ["天工短剧", "昆仑万维", "✗无", "传统分镜+一键生成", "PC端为主"],
    ["万兴剧厂", "万兴科技", "✗无", "精品漫剧全链路", "PC端为主，后剪辑闭环"]
]
add_table_slide("六家产品对比总览", table_headers, table_rows)

add_content_slide("小云雀 - 移动端功能分析", [
    ("核心定位：移动端专属AI短剧创作工具", "暂无PC版，仅移动端APP"),
    ("主要功能：智能成片、数字人视频、AI设计、AI换背景", "支持2D、3D、仿真人多种画风"),
    ("特色功能：短剧Agent，5人8天完成60集短剧", "角色一致性强，百集不崩脸"),
    ("与PC端关系：独立移动端产品", "通过抖音生态实现流量转化")
])

add_content_slide("即梦AI & 可灵AI - 移动端分析", [
    ("即梦AI：AI创意生成平台", "移动端APP，文生图、文生视频、图生视频"),
    ("即梦特色：无限画布、数字人创作", "与剪映无缝衔接，字节生态联动"),
    ("可灵AI：AI视频生成平台", "移动端APP「快手可灵」，网页/APP/小程序多端同步"),
    ("可灵特色：长视频生成（120秒）、物理仿真", "续写功能延至3分钟，适合短剧创作")
])

add_content_slide("纳米、天工、万兴 - PC端为主", [
    ("纳米漫剧流水线（360）", "工业级量产平台，PC端为主，单集30-60分钟"),
    ("天工短剧工作台（昆仑万维）", "PC端平台，传统分镜与一键生成两种方式"),
    ("万兴剧厂（万兴科技）", "精品漫剧全链路，PC端为主，与万兴喵影打通"),
    ("共同特点：无专门移动端APP", "侧重B端批量生产，不注重C端移动体验")
])

add_comparison_slide(
    "移动端vs PC端功能对比",
    "移动端（小云雀、即梦、可灵）",
    ["零门槛，一句话生成", "随时随地创作", "侧重C端用户", "社交分享便捷", "字节/快手生态支持"],
    "PC端（纳米、天工、万兴）",
    ["专业深度创作", "工业级批量生产", "侧重B端团队", "后剪辑功能完善", "成本控制精细"]
)

add_content_slide("移动端与PC端关系分析", [
    ("引流关系：字节/快手生态实现自然流量转化", "可灵支持网页/APP/小程序多端同步"),
    ("功能互补：移动端灵感捕捉 + PC端深度创作", "但多数平台未实现两端打通"),
    ("差异化定位：移动端C端，PC端B端", "形成用户分层，避免直接竞争"),
    ("机会点：建立PC→移动端引流闭环", "通过作品分享、社区互动实现流量流转")
])

add_content_slide("差异化竞争策略建议", [
    ("移动端策略：突出轻量化、社交化", "一句话生成、社区灵感分享、一键发布抖音/快手"),
    ("PC端策略：强化专业工具链", "深度分镜编辑、批量生成、成本核算看板"),
    ("差异化功能：短剧AI导演、角色IP管理库", "内置爆款剧本库、题材热度预测"),
    ("生态建设：建立创作者社区+变现通道", "接单广场、版权交易、流量扶持计划")
])

add_conclusion_slide("总结与建议", [
    "小云雀是移动端标杆：纯移动端，短剧Agent模式值得借鉴",
    "即梦、可灵多端同步：网页/APP/小程序数据互通，创作不间断",
    "纳米、天工、万兴缺移动端：这是我们的机会窗口",
    "建议：PC端做专业工具，移动端做轻量创作+社区，两端联动引流",
    "差异化：内置爆款剧本库、题材热度预测、AI导演系统"
])

prs.save("d:\\phpstudy_pro\\WWW\\ai-novel-workstation2.3\\短剧平台竞品调研报告.pptx")
print("PPT生成成功！保存位置：d:\\phpstudy_pro\\WWW\\ai-novel-workstation2.3\\短剧平台竞品调研报告.pptx")

