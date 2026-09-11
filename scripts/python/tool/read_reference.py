import docx
import os

def read_docx(file_path):
    if not os.path.exists(file_path):
        return f"File not found: {file_path}"
    doc = docx.Document(file_path)
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    return '\n'.join(full_text)

files = [
    r"D:\恒昌-小恒科技\软著\2026\软著参考资料\03-软件操作说明书.docx",
    r"D:\恒昌-小恒科技\软著\2026\软著参考资料\通用中台智签宝系统立项报告.docx",
    r"D:\恒昌-小恒科技\软著\2026\软著参考资料\通用中台智签宝系统结题报告.docx",
    r"D:\恒昌-小恒科技\软著\2026\软著参考资料\通用中台智签宝系统项目决议书--君禾2025.docx"
]

for f in files:
    print(f"--- Content of {os.path.basename(f)} ---")
    content = read_docx(f)
    print(content[:2000]) # Print first 2000 chars to understand format
    print(f"\nTotal characters: {len(content)}")
    print("-" * 50)
