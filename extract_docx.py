import zipfile
import xml.etree.ElementTree as ET

def get_docx_text(path):
    """
    Take the path of a docx file as argument, return the text in unicode.
    """
    document = zipfile.ZipFile(path)
    xml_content = document.read('word/document.xml')
    document.close()
    tree = ET.XML(xml_content)

    paragraphs = []
    for paragraph in tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
        texts = [node.text
                 for node in paragraph.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
                 if node.text]
        if texts:
            paragraphs.append("".join(texts))

    return '\n'.join(paragraphs)

if __name__ == '__main__':
    text = get_docx_text(r'd:\phpstudy_pro\WWW\ai-novel-workstation1.0.1\AI短剧 v1.0.0版本需求文档.docx')
    with open('v1.0.0_text.txt', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Text extracted to v1.0.0_text.txt")
