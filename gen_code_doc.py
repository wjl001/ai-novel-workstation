import os
import re
import docx
from docx.shared import Pt
from docx.oxml.ns import qn

def clean_code(code):
    # Remove single line comments
    code = re.sub(r'//.*', '', code)
    # Remove multi-line comments
    code = re.sub(r'/\*.*?\*/', '', code, flags=re.DOTALL)
    # Remove empty lines
    lines = [line.strip() for line in code.split('\n') if line.strip()]
    return lines

def generate_code_doc(src_dir, output_path):
    all_lines = []
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.vue', '.ts', '.js')):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        all_lines.extend(clean_code(f.read()))
                except:
                    pass
    
    # 60 pages total, ~50 lines per page = 3000 lines
    # 30 pages start (1500 lines), 30 pages end (1500 lines)
    start_lines = all_lines[:1500]
    end_lines = all_lines[-1500:]
    final_lines = start_lines + end_lines
    
    doc = docx.Document()
    # Set font to SimSun
    style = doc.styles['Normal']
    font = style.font
    font.name = 'SimSun'
    font.size = Pt(10.5) # 5pt in Chinese
    style._element.rPr.rFonts.set(qn('w:eastAsia'), 'SimSun')

    for line in final_lines:
        doc.add_paragraph(line)
        
    doc.save(output_path)
    print(f"Generated {output_path} with {len(final_lines)} lines.")

# Ensure output directory exists
output_dir = r"D:\phpstudy_pro\WWW\ai-novel-workstation2.7\output_copyright"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

generate_code_doc(r"D:\phpstudy_pro\WWW\ai-novel-workstation2.7\src", os.path.join(output_dir, "01-软件代码.docx"))
