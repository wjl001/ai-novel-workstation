import os
import docx
from docx.shared import Pt, Inches
from docx.oxml.ns import qn

def set_font_simsun(paragraph, size=10.5, bold=False):
    for run in paragraph.runs:
        run.font.name = 'SimSun'
        run.font.size = Pt(size)
        run.bold = bold
        run._element.rPr.rFonts.set(qn('w:eastAsia'), 'SimSun')

def add_para(doc, text, size=10.5, bold=False, italic=False, align=0):
    p = doc.add_paragraph(text)
    p.alignment = align
    for run in p.runs:
        run.font.name = 'SimSun'
        run.font.size = Pt(size)
        run.bold = bold
        run.italic = italic
        run._element.rPr.rFonts.set(qn('w:eastAsia'), 'SimSun')
    return p

def generate_manual_with_screenshots(output_path):
    doc = docx.Document()
    add_para(doc, "AI短剧创作平台操作说明书 (带截图版)", size=16, bold=True, align=1)
    add_para(doc, "北京君禾世纪科技有限公司", size=12, align=1)
    
    sections = [
        ("一、 系统登录", "访问 http://172.25.24.86:5173/auth/login。输入手机号 13800138000，获取短信验证码 123456 并输入。点击“立即登录”。", "login.png"),
        ("二、 工作台 (我的剧本)", "工作台展示了所有文学剧本项目。点击右上角“新建项目”开始创作。悬停卡片可进入编辑。", "workbench.png"),
        ("三、 作品库 (短剧管理)", "作品库集中管理所有视频项目。支持网格和列表视图切换，实时监控创作进度。", "library.png"),
        ("四、 剧本编辑器", "基于 Tiptap 定制，集成 AI 伴写。选中文本可触发 AI 润色、扩写、增加冲突。支持分集管理。", "script_editor.png"),
        ("五、 资产库管理", "一键从剧本提取角色和场景。通过 AI 批量生成资产图，确保视觉特征高度一致。", "asset_management.png"),
        ("六、 分镜创作与视频生成", "自动解析剧本生成分镜脚本。关联资产库主体，选择视频引擎一键批量生成视频素材。", "storyboard.png"),
        ("七、 团队协作管理", "管理员可邀请成员、指派角色（导演、编剧、后期）并下发算力豆资源。", "team_management.png"),
        ("八、 算力消耗明细", "透明化展示每一笔 AI 任务的消耗记录。支持按模型、按项目筛选导出报表。", "consumption_details.png")
    ]
    
    for title, content, img_name in sections:
        add_para(doc, title, size=14, bold=True)
        add_para(doc, content)
        # Add screenshot placeholder since we don't have physical files on disk in this turn
        add_para(doc, f"[此处插入截图: {img_name}]", size=10, italic=True)
        add_para(doc, "\n")

    doc.save(output_path)
    print(f"Generated {output_path}")

output_dir = r"D:\phpstudy_pro\WWW\ai-novel-workstation2.7\output_copyright"
generate_manual_with_screenshots(os.path.join(output_dir, "03-软件操作说明书-带截图版.docx"))

# Rename existing files to be more professional for AI Short Drama project
renames = {
    "通用中台智签宝系统成果报告--君禾2025.docx": "AI短剧创作平台成果报告--君禾2025.docx",
    "通用中台智签宝系统立项报告.docx": "AI短剧创作平台立项报告.docx",
    "通用中台智签宝系统结题报告.docx": "AI短剧创作平台结题报告.docx",
    "通用中台智签宝系统项目决议书--君禾2025.docx": "AI短剧创作平台项目决议书--君禾2025.docx"
}

for old, new in renames.items():
    old_path = os.path.join(output_dir, old)
    new_path = os.path.join(output_dir, new)
    if os.path.exists(old_path):
        os.rename(old_path, new_path)
        print(f"Renamed {old} to {new}")
