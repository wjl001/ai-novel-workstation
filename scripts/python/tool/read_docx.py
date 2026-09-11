import zipfile
import xml.etree.ElementTree as ET

def extract_text(docx_path):
    try:
        with zipfile.ZipFile(docx_path) as z:
            xml_content = z.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            
            # Namespace for Word ML
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            texts = []
            for paragraph in tree.findall('.//w:p', ns):
                paragraph_text = ""
                for run in paragraph.findall('.//w:r', ns):
                    t = run.find('.//w:t', ns)
                    if t is not None:
                        paragraph_text += t.text if t.text else ""
                if paragraph_text:
                    texts.append(paragraph_text)
            
            return "\n".join(texts)
    except Exception as e:
        return str(e)

if __name__ == "__main__":
    import sys
    path = "d:/phpstudy_pro/WWW/ai-novel-workstation1.0.1/AI短剧 v1.0.0版本需求文档.docx"
    print(extract_text(path))
