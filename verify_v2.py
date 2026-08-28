# -*- coding: utf-8 -*-
"""验证文档：检查英文残留和提示词模板完整性"""
from docx import Document
import re

DOC_PATH = r'D:\phpstudy_pro\WWW\ai-novel-workstation1.2.0\人工智能短剧系统_图片生成提示词优化产品方案.docx'
doc = Document(DOC_PATH)

print('=' * 60)
print('文档验证报告（中文版）')
print('=' * 60)

# 收集所有文本
all_text = []
for para in doc.paragraphs:
    all_text.append(para.text)
for table in doc.tables:
    for row in table.rows:
        for cell in row.cells:
            all_text.append(cell.text)
full_text = '\n'.join(all_text)

# 1. 检查英文单词（连续的英文字母，排除纯数字和常见单位）
print('\n【1. 英文残留检查】')
# 匹配连续2个以上英文字母的单词
english_words = re.findall(r'[a-zA-Z]{2,}', full_text)
# 过滤掉一些可能是正常的（但用户要求不要英文，所以都列出来）
from collections import Counter
word_counts = Counter(english_words)
if word_counts:
    print(f'  发现 {len(word_counts)} 种英文词汇，共 {sum(word_counts.values())} 处:')
    for word, count in word_counts.most_common(30):
        print(f'    - {word}: {count}次')
else:
    print('  ✓ 未发现连续英文字母')

# 2. 检查提示词模板完整性
print('\n【2. 提示词模板完整性检查】')
template_keywords = [
    '模板编号', '适用场景', '正面提示词', '负面提示词', '推荐参数', '使用说明',
    '角色写实特写', '角色写实半身', '角色写实全身', '角色国风', '角色动漫',
    '场景室内日景', '场景室内夜景', '场景室外日景', '场景室外夜景', '道具特写',
    '第一层主体描述', '第二层特征锁定', '第三层构图视角', '第四层质量增强', '第五层风格光影',
]
for kw in template_keywords:
    count = full_text.count(kw)
    status = '✓' if count > 0 else '✗'
    print(f'  {status} "{kw}": {count}次')

# 3. 基本统计
print('\n【3. 文档基本统计】')
print(f'  段落数: {len(doc.paragraphs)}')
print(f'  表格数: {len(doc.tables)}')
image_count = sum(1 for rel in doc.part.rels.values() if 'image' in rel.reltype)
print(f'  图片数: {image_count}')
print(f'  总字符数: {len(full_text)}')

# 4. 字体检查
print('\n【4. 字体检查】')
font_ok = True
checked = 0
for para in doc.paragraphs:
    for run in para.runs:
        if run.text.strip():
            checked += 1
            from docx.oxml.ns import qn
            rPr = run._element.find(qn('w:rPr'))
            if rPr is not None:
                rFonts = rPr.find(qn('w:rFonts'))
                if rFonts is not None:
                    ea = rFonts.get(qn('w:eastAsia'))
                    if ea != '微软雅黑':
                        font_ok = False
                        print(f'  ⚠ 发现非微软雅黑字体: {ea} (文本: {run.text[:20]})')
            if checked >= 30:
                break
    if checked >= 30:
        break
if font_ok:
    print('  ✓ 抽样检查均为微软雅黑字体')

print('\n' + '=' * 60)
print('验证完成')
print('=' * 60)
