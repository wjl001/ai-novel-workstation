#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""领导汇报版V2 - 基于V5完整版，以图为主，含四视图专项设计"""

from docx import Document
from docx.shared import Pt, RGBColor, Cm, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

def sf(run, name='微软雅黑', size=11, bold=False, color=None):
    run.font.name = name; run.font.size = Pt(size); run.font.bold = bold
    if color: run.font.color.rgb = RGBColor(*color)
    run._element.rPr.rFonts.set(qn('w:eastAsia'), name)

def H(doc, text, level=1):
    p = doc.add_paragraph(); r = p.add_run(text)
    sf(r, size={1:18,2:15,3:13,4:12}.get(level,12), bold=True, color=(30,58,138))
    p.paragraph_format.space_before = Pt(12); p.paragraph_format.space_after = Pt(6)

def P(doc, text, size=11, bold=False, indent=True, align=None):
    p = doc.add_paragraph()
    if indent: p.paragraph_format.first_line_indent = Pt(22)
    if align: p.alignment = align
    r = p.add_run(text); sf(r, size=size, bold=bold)
    p.paragraph_format.line_spacing = 1.5; p.paragraph_format.space_after = Pt(4)

def B(doc, text, size=11, level=0):
    p = doc.add_paragraph(); p.paragraph_format.left_indent = Pt(22 + level*22)
    r = p.add_run('● ' + text); sf(r, size=size)
    p.paragraph_format.line_spacing = 1.5; p.paragraph_format.space_after = Pt(2)

def T(doc, headers, rows, widths=None):
    t = doc.add_table(rows=1+len(rows), cols=len(headers))
    t.alignment = WD_TABLE_ALIGNMENT.CENTER; t.style = 'Table Grid'
    for i,h in enumerate(headers):
        c = t.rows[0].cells[i]; c.text=''
        p = c.paragraphs[0]; p.alignment=WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h); sf(r, size=10, bold=True, color=(255,255,255))
        s = OxmlElement('w:shd'); s.set(qn('w:fill'),'1E3A8A'); c._tc.get_or_add_tcPr().append(s)
    for ri,row in enumerate(rows):
        for ci,val in enumerate(row):
            c = t.rows[ri+1].cells[ci]; c.text=''
            p = c.paragraphs[0]; r = p.add_run(str(val)); sf(r, size=10)
            if ri%2==1:
                s = OxmlElement('w:shd'); s.set(qn('w:fill'),'F0F4FF'); c._tc.get_or_add_tcPr().append(s)
    if widths:
        for i,w in enumerate(widths):
            for row in t.rows: row.cells[i].width = Cm(w)

def IMG(doc, path, width=6.0):
    doc.add_picture(path, width=Inches(width))
    last_paragraph = doc.paragraphs[-1]
    last_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER

def CAP(doc, text):
    p = doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(text); sf(r, size=10, bold=True, color=(100,100,100))
    p.paragraph_format.space_after = Pt(8)

doc = Document()
style = doc.styles['Normal']; style.font.name = '微软雅黑'; style.font.size = Pt(11)
style._element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')

IMG_DIR = r'D:\phpstudy_pro\WWW\ai-novel-workstation1.2.0'

# ==================== 封面 ====================
for _ in range(4): doc.add_paragraph()
p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER
r=p.add_run('人工智能短剧创作系统'); sf(r,size=28,bold=True,color=(30,58,138))
p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER
r=p.add_run('图片生成提示词优化方案'); sf(r,size=24,bold=True,color=(30,58,138))
p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER
r=p.add_run('—— 基于 Hermes Agent 多轮对话智能优化 ——'); sf(r,size=16,color=(100,100,100))
for _ in range(2): doc.add_paragraph()
p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER
r=p.add_run('【领导汇报版 · 图解方案】'); sf(r,size=20,bold=True,color=(220,38,38))
for _ in range(2): doc.add_paragraph()
p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER
r=p.add_run('核心亮点：6张专业图 + 8张数据表，一图讲清一个模块'); sf(r,size=14,color=(100,100,100))
p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER
r=p.add_run('重点：角色四视图单模板生成方案'); sf(r,size=14,color=(124,58,237),bold=True)
for _ in range(4): doc.add_paragraph()
p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER
r=p.add_run('汇报人：产品部'); sf(r,size=12,color=(100,100,100))
p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER
r=p.add_run('版本：V2.0 图解汇报版（基于V5完整版）'); sf(r,size=12,color=(100,100,100))
doc.add_page_break()

# ==================== 目录 ====================
H(doc,'目录',1)
toc = [
    '一、项目背景与问题（问题分布图）',
    '二、产品目标与核心指标（目标对比表）',
    '三、产品整体架构（图1：五层架构图）',
    '四、Hermes Agent 八轮对话优化机制（图2：八轮流程图）',
    '五、角色四视图设定专项设计（图3：四视图结构图 + 图4：用户参考图）',
    '六、主体创建与图片生成主流程（图5：主流程图）',
    '七、跨角色协作泳道（图6：五泳道协作图）',
    '八、质量迭代优化闭环（图7：闭环图）',
    '九、预期收益与实施排期（收益对比表 + 排期表）',
]
for item in toc:
    p=doc.add_paragraph(); r=p.add_run(item); sf(r,size=12); p.paragraph_format.space_after=Pt(8)
doc.add_page_break()

# ==================== 一、项目背景与问题 ====================
H(doc,'一、项目背景与问题',1)
P(doc,'当前系统主体图片生成质量不稳定，用户反馈四类高频问题，导致平均每个主体需重生成2.8次，严重影响创作效率。本方案通过引入 Hermes Agent 多轮对话优化引擎，从提示词层面系统性解决这些问题。')

CAP(doc,'图1-1  四类高频问题分布与影响')
T(doc,['问题类型','发生频率','影响程度','典型表现','根因分析'],
[['图片精度不高','45%','高','画面模糊、细节丢失、纹理不清晰','提示词缺少质量增强层'],
['人物色彩异常','32%','高','皮肤色块、服饰颜色溢出、背景污染','缺少色彩控制和负面排除'],
['斗鸡眼问题','28%','极高','双眼视线不聚焦、瞳孔偏移','缺少眼部特征锁定词'],
['人脸崩坏','25%','极高','五官扭曲、脸型变形、多脸残脸','缺少面部结构稳定词']],
widths=[2.5,1.8,1.8,4,3.5])

P(doc,'核心根因：现有提示词为一次性生成，缺少多轮迭代优化机制，且未融入剧情上下文，导致优化方向与剧情需求脱节。角色图片缺少标准化的四视图设定，导致多角度生成时人物特征不一致。')
doc.add_page_break()

# ==================== 二、产品目标与核心指标 ====================
H(doc,'二、产品目标与核心指标',1)
CAP(doc,'表2-1  核心指标对比（优化前 vs 优化后）')
T(doc,['指标维度','当前基线','目标值','提升幅度','衡量方式'],
[['图片一次成功率','55%','≥85%','+30%','用户调研+系统统计'],
['人脸崩坏率','25%','≤5%','-80%','批量生成+人工审核'],
['斗鸡眼发生率','28%','≤3%','-89%','批量生成+算法检测'],
['色彩异常率','32%','≤8%','-75%','批量生成+算法检测'],
['角色四视图一致性','无标准','≥95%','新增','四视图特征比对'],
['用户重生成次数','2.8次','≤1.2次','-57%','系统日志统计'],
['提示词优化耗时','无优化','≤8秒','新增','性能测试'],
['用户满意度','6.2分','≥8.5分','+37%','用户调研问卷']],
widths=[3,2,2,2,3.5])
doc.add_page_break()

# ==================== 三、产品整体架构 ====================
H(doc,'三、产品整体架构',1)
P(doc,'本方案采用五层架构设计，核心是新增的 Hermes Agent 多轮对话层，所有优化在底层通过隐式对话完成，用户界面不显示对话内容。')

CAP(doc,'图3-1  产品整体五层架构图')
IMG(doc, f'{IMG_DIR}\\architecture_diagram.png', width=6.2)

CAP(doc,'表3-1  核心层职责说明')
T(doc,['层级','核心组件','关键职责'],
[['用户层','创作者/运营/质检','输入主体描述，确认优化结果，生成图片'],
['应用层','主体设置/图片生成/质量检测','提供用户交互界面，展示优化结果，执行生成和检测'],
['Hermes Agent层','6大Agent组件','通过8轮隐式对话完成提示词优化，注入剧情上下文',],
['服务层','5大服务','提供模板库、特征锁定、模型调用、质量分析、剧情上下文等能力'],
['数据层','5大数据库','存储主体资产、提示词知识、生成历史、对话上下文、剧本剧集']],
widths=[2.5,4,7.5])
doc.add_page_break()

# ==================== 四、Hermes Agent 八轮对话优化机制 ====================
H(doc,'四、Hermes Agent 八轮对话优化机制',1)
P(doc,'这是本方案的核心机制。Hermes Agent 通过8轮底层隐式对话，模拟资深提示词工程师的思考过程，逐步完善提示词。界面不显示对话内容，用户仅看到最终优化结果。')

CAP(doc,'图4-1  Hermes Agent 八轮隐式对话优化流程图')
IMG(doc, f'{IMG_DIR}\\eight_round_flow.png', width=6.2)

CAP(doc,'表4-1  八轮对话详细说明')
T(doc,['轮次','Agent角色','核心动作','关键输出'],
[['第1轮','信息解析Agent','解析主体信息，自动注入剧集剧本上下文','主体信息摘要+剧情上下文'],
['第2轮','特征提取Agent','提取人物/场景/道具特征，标准化为关键词','标准化特征清单'],
['第3轮','模板匹配Agent','根据类型+风格+镜头，匹配最佳模板','匹配的Skills模板ID'],
['第4轮','动态填充Agent','将特征填入模板，融入剧情上下文','初始正面提示词V1'],
['第5轮','质量增强Agent','注入质量增强词+四类问题预防词','增强后正面提示词V2'],
['第6轮','负面词组合Agent','按优先级组合负面词，控制长度','负面提示词V1'],
['第7轮','校验优化Agent','去重、冲突检查、长度控制、排序优化','最终提示词'],
['第8轮','结果输出Agent','输出正面/负面提示词+推荐参数+优化说明','供用户确认的结果包']],
widths=[1.5,2.5,5.5,4.5])
doc.add_page_break()

# ==================== 五、角色四视图设定专项设计（重点） ====================
H(doc,'五、角色四视图设定专项设计（重点）',1)

H(doc,'5.1 什么是角色四视图',2)
P(doc,'角色四视图是指在同一张图片上，同时展示角色的面部特写视图、正面全身视图、侧面全身视图、背面全身视图四个标准角度的参考图。四个角度从左到右并排排列，共享统一的纯白色背景和标准化姿势。')
P(doc,'重要设计原则：四视图是一次性生成在同一张图片上的，使用一个统一的Skills模板生成，确保四个角度的人物特征（脸型、五官、发型、发色、服饰颜色、身材比例）完全一致，从根本上避免多模板生成导致的一致性问题。')

CAP(doc,'图5-1  角色四视图结构示意图（单模板一次性生成）')
IMG(doc, f'{IMG_DIR}\\four_view_structure.png', width=6.2)

CAP(doc,'表5-1  四视图各角度作用说明')
T(doc,['视图角度','展示内容','核心作用'],
[['面部特写','角色头部和肩部，重点展示五官、发型、表情、肤色','精准锁定面部特征，预防人脸崩坏、斗鸡眼'],
['正面全身','角色正面全身，展示身材比例、服饰正面、整体造型','建立角色整体形象基准'],
['侧面全身','角色侧面全身，展示侧面轮廓、鼻梁、发型侧面、服饰侧面','补充侧面特征，确保多角度一致性'],
['背面全身','角色背面全身，展示后脑勺、发型背面、服饰背面设计','完善360度形象，避免背面生成崩坏']],
widths=[2.5,5,5])

H(doc,'5.2 四视图设计参考',2)
P(doc,'以下为用户提供的四视图设计参考，角色为古风侠女"沈青黛"，四个角度在同一张图片上从左到右排列：')
CAP(doc,'图5-2  用户提供的四视图设计参考图（沈青黛）')
IMG(doc, f'{IMG_DIR}\\four_view_reference.png', width=6.2)

H(doc,'5.3 单模板 vs 多模板方案对比',2)
CAP(doc,'表5-2  单模板方案与多模板方案对比')
T(doc,['对比维度','单模板方案（推荐采用）','多模板方案（已弃用）'],
[['一致性保障','四个角度同一次生成，特征天然一致','分别生成4次，容易出现脸型/发色不一致'],
['生成效率','一次生成完成，约15-20秒','需生成4次+合成，约60-80秒'],
['提示词结构','一个完整提示词，总体描述+四角分别描述','四个独立提示词，维护困难'],
['用户体验','一次确认，简单直观','需分别确认四个角度，操作繁琐'],
['质量控制','统一的质量标准和负面词','每个角度单独控制，标准不统一']],
widths=[2.5,5,5])

H(doc,'5.4 四视图统一提示词模板结构',2)
P(doc,'R-4VIEW-001 角色四视图统一生成模板，采用五层结构：')
CAP(doc,'表5-3  四视图提示词五层结构')
T(doc,['层次','内容','作用'],
[['第一层：总体质量描述','8K超高清、风格、纯白背景、四视图布局要求','建立整体质量标准和布局'],
['第二层：人物总体描述','身份、身姿、五官、面容、气质','统一人物核心特征'],
['第三层：发型统一描述','发型类型、发色、发饰、发丝质感','确保四个角度发型一致'],
['第四层：服饰统一描述','服饰类型、色系、上衣、腰带、下装、鞋履','确保四个角度服饰一致'],
['第五层：四角度分别描述','面部特写/正面/侧面/背面的具体要求','分别细化每个角度的展示重点']],
widths=[3,5,5])

P(doc,'负面提示词按优先级分为四类：面部问题预防（最高优先级）、发型服饰问题预防（高优先级）、构图与背景问题预防（中优先级）、风格与质量问题预防（低优先级）。')

H(doc,'5.5 四视图在主体设置页面的应用',2)
B(doc,'默认生成模式：用户在主体设置页面添加角色后，系统自动调用四视图统一模板生成。')
B(doc,'一次性生成：用户确认后，一次性生成包含四个角度的四视图图片，不是分别生成再合成。')
B(doc,'特征一致性：单模板一次性生成，四个角度人物特征天然一致。')
B(doc,'资产保存：用户确认后保存为角色主体资产，后续分镜和视频生成自动参考。')
doc.add_page_break()

# ==================== 六、主体创建与图片生成主流程 ====================
H(doc,'六、主体创建与图片生成主流程',1)
P(doc,'用户从进入主体设置页到最终生成合格图片的完整流程，包含用户确认、质量检测、迭代优化等关键环节。')

CAP(doc,'图6-1  主体创建与图片生成主流程图')
IMG(doc, f'{IMG_DIR}\\main_flow_diagram.png', width=5.2)

CAP(doc,'表6-1  流程关键节点说明')
T(doc,['节点','关键动作','设计要点'],
[['自动识别风格镜头','根据描述文本自动判断风格和镜头','降低用户操作门槛，描述≥5字即可识别'],
['Hermes 8轮优化','核心环节，底层隐式对话优化','注入剧情上下文，匹配Skills模板，≤8秒'],
['用户确认','用户可查看优化结果，一键采纳或手动编辑','确保生成前用户明确认可，特征不完整时二次确认'],
['质量检测','自动检测四类问题（人脸崩坏/斗鸡眼/色彩/精度）','不达标时自动触发迭代，最多3轮'],
['迭代优化','针对性调整提示词和生成参数','形成自优化闭环，持续提升成功率']],
widths=[2.5,4.5,6])
doc.add_page_break()

# ==================== 七、跨角色协作泳道 ====================
H(doc,'七、跨角色协作泳道',1)
P(doc,'提示词优化过程涉及五个角色的协作，通过泳道图清晰展示各角色的职责和交互节点。')

CAP(doc,'图7-1  提示词优化跨角色协作泳道图')
IMG(doc, f'{IMG_DIR}\\swimlane_diagram.png', width=6.5)

CAP(doc,'表7-1  关键协作节点说明')
T(doc,['节点','交互方向','关键内容','异常处理'],
[['节点1','用户→前端','输入主体描述，点击优化按钮','描述为空时提示'],
['节点2','前端→Hermes','传递主体信息+剧情上下文','8秒超时降级为规则优化'],
['节点3','Hermes→前端','返回8轮优化结果','报错时降级并记录日志'],
['节点4','用户确认','用户确认或编辑提示词','特征不完整时二次确认'],
['节点5','前端→生成','提交优化后提示词+参数','生成失败时重试'],
['节点6','前端→检测','提交图片进行质量检测','检测失败时跳过，用户手动判断'],
['节点7','前端→Hermes','不达标时触发迭代优化','最多3轮，超过后提示用户手动调整']],
widths=[1.5,2.5,5.5,4.5])
doc.add_page_break()

# ==================== 八、质量迭代优化闭环 ====================
H(doc,'八、质量迭代优化闭环',1)
P(doc,'图片生成后自动进行质量检测，不达标时自动触发迭代优化，形成自优化闭环，最多迭代3轮。')

CAP(doc,'图8-1  质量迭代优化闭环图')
IMG(doc, f'{IMG_DIR}\\quality_loop.png', width=5.5)

CAP(doc,'表8-1  迭代优化策略')
T(doc,['迭代轮次','优化策略','调整内容','预期效果'],
[['第1次','提示词优化','根据检测到的问题，增加对应负面词和质量增强词','解决70%的问题'],
['第2次','参数优化','调整生成步数（+5）、相关性（±0.5）、更换采样器','解决20%的问题'],
['第3次','人工介入','提示用户手动编辑提示词或更换参考图','剩余10%需人工处理']],
widths=[2,2.5,5.5,4])

CAP(doc,'表8-2  质量检测维度（按主体类型区分）')
T(doc,['主体类型','检测维度','达标标准'],
[['角色','人脸/眼部/色彩/精度','四项均≥80分'],
['场景','透视/色彩/细节/氛围','四项均≥80分'],
['道具','形态/材质/色彩/精度','四项均≥80分']],
widths=[2.5,5,5])
doc.add_page_break()

# ==================== 九、预期收益与实施排期 ====================
H(doc,'九、预期收益与实施排期',1)

CAP(doc,'表9-1  预期收益对比')
T(doc,['收益维度','优化前','优化后','提升幅度'],
[['图片一次成功率','55%','85%','+30%'],
['人脸崩坏率','25%','5%','-80%'],
['斗鸡眼发生率','28%','3%','-89%'],
['色彩异常率','32%','8%','-75%'],
['四视图一致性','无标准','95%','新增'],
['重生成次数','2.8次','1.2次','-57%'],
['生成成本','基准','降低30%','-30%'],
['用户满意度','6.2分','8.5分','+37%']],
widths=[3.5,2.5,2.5,3])

CAP(doc,'表9-2  项目实施排期（共8.5周）')
T(doc,['阶段','任务','工期','负责人'],
[['第一阶段','需求评审与技术方案确认','1周','产品+技术'],
['第二阶段','Hermes Agent Skills模板开发（90套）','2周','算法+产品'],
['第三阶段','前端主体设置页面升级（含四视图）','2周','前端'],
['第四阶段','后端接口与Hermes集成','2周','后端'],
['第五阶段','质量检测服务开发','1.5周','算法'],
['第六阶段','集成测试与联调','1周','测试+全团队'],
['第七阶段','灰度发布与反馈收集','1周','运营+产品']],
widths=[2,5,1.5,4])

CAP(doc,'表9-3  核心风险与应对')
T(doc,['风险','等级','应对措施'],
[['Hermes响应时间过长','高','8秒超时降级，异步处理，优化Skills减少轮次'],
['优化效果不稳定','高','A/B测试机制，持续优化模板，人工审核'],
['四视图一致性不足','高','单模板生成方案，特征锁定校验，人工抽检'],
['用户不接受新交互','中','提供新旧模式切换，逐步过渡，用户教育'],
['并发量过大','中','限流+排队机制，弹性扩容，缓存优化']],
widths=[4,1.5,8])

# 总结页
doc.add_page_break()
H(doc,'方案总结',1)
P(doc,'本方案通过引入 Hermes Agent 多轮对话优化引擎，从提示词层面系统性解决图片生成质量问题，核心亮点如下：')
B(doc,'技术创新：首次将 Hermes Agent 多轮对话机制应用于图片生成提示词优化，8轮隐式对话模拟资深工程师思考过程。')
B(doc,'剧情感知：自动注入剧集剧本上下文，确保优化方向与剧情需求一致，大幅提升准确性。')
B(doc,'四视图单模板：角色四视图采用单模板一次性生成，四个角度在同一张图片上，从根本上确保人物特征一致性。')
B(doc,'问题导向：针对人脸崩坏、斗鸡眼、色彩异常、精度不高四类高频问题，专项注入预防词和排除词。')
B(doc,'闭环迭代：生成后自动质量检测，不达标时自动触发最多3轮迭代优化，形成自优化闭环。')
B(doc,'用户确认：完善的用户确认机制，确保用户在生成前明确知晓并认可优化结果。')
P(doc,'预期效果：图片一次成功率从55%提升至85%，人脸崩坏率降低80%，用户重生成次数减少57%，生成成本降低30%。')

# 保存
output_path = r'D:\phpstudy_pro\WWW\ai-novel-workstation1.2.0\人工智能短剧系统_图片生成提示词优化方案_领导汇报版V3_含四视图.docx'
doc.save(output_path)
print(f'文档已生成：{output_path}')
