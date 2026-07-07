import os
from docx import Document

def count_docx_chars(path):
    try:
        doc = Document(path)
        full_text = []
        for para in doc.paragraphs:
            full_text.append(para.text)
        text = "\n".join(full_text)
        return len(text)
    except Exception as e:
        return f"Error: {e}"

ref_dir = r"D:\恒昌-小恒科技\软著\2026\软著参考资料"
print("Reference Document Word Counts:")
for f in os.listdir(ref_dir):
    if f.endswith(".docx") and not f.startswith("~$"):
        path = os.path.join(ref_dir, f)
        count = count_docx_chars(path)
        print(f"{f}: {count}")
