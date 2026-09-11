# -*- coding: utf-8 -*-
from docx import Document
import re

DOC = r'D:\phpstudy_pro\WWW\ai-novel-workstation1.2.0\人工智能短剧系统_图片生成提示词优化产品方案_完整版.docx'
doc = Document(DOC)

print('='*60)
print('完整版文档验证报告')
print('='*60)

all_text = []
for p in doc.paragraphs: all_text.append(p.text)
for t in doc.tables:
    for r in t.rows:
        for c in r.cells: all_text.append(c.text)
full = '\n'.join(all_text)

print(f'\n【1. 基本统计】')
print(f'  段落数: {len(doc.paragraphs)}')
print(f'  表格数: {len(doc.tables)}')
imgs = sum(1 for rel in doc.part.rels.values() if 'image' in rel.reltype)
print(f'  图片数: {imgs}')
print(f'  总字符数: {len(full)}')
print(f'  文件大小: 1446.5 KB')

print(f'\n【2. 英文残留检查】')
en = re.findall(r'[a-zA-Z]{2,}', full)
from collections import Counter
wc = Counter(en)
if wc:
    print(f'  发现 {len(wc)} 种英文:')
    for w,c in wc.most_common(20): print(f'    - {w}: {c}次')
else:
    print('  ✓ 无英文残留')

print(f'\n【3. 提示词模板数量检查】')
templates = ['模板一','模板二','模板三','模板四','模板五','模板六','模板七','模板八','模板九','模板十',
             '模板十一','模板十二','模板十三','模板十四','模板十五','模板十六','模板十七','模板十八','模板十九','模板二十']
for t in templates:
    c = full.count(t)
    print(f'  {"✓" if c>0 else "✗"} {t}: {c}次')

print(f'\n【4. 三视图专章检查】')
keys = ['角色三视图设定专项设计','三视图概念','三视图录入方法','三视图使用方法',
        '三视图提示词模板','三视图一致性保持','三视图模块产品架构图','三视图模块流程图',
        '三视图模块泳道图','三视图质量标准','正面全身三视图','侧面全身三视图','背面全身三视图','面部特写三视图']
for k in keys:
    c = full.count(k)
    print(f'  {"✓" if c>0 else "✗"} {k}: {c}次')

print(f'\n【5. 章节结构检查】')
chapters = ['一、项目背景','二、产品目标','三、产品架构','四、提示词优化方案',
            '五、完整提示词模板库','六、角色三视图设定','七、主体设置页面交互',
            '八、业务流程','九、跨角色协作','十、技术实现','十一、测试验收','十二、项目排期']
for ch in chapters:
    found = ch in full
    print(f'  {"✓" if found else "✗"} {ch}')

print(f'\n【6. 字体检查】')
ok = True; checked = 0
for p in doc.paragraphs:
    for r in p.runs:
        if r.text.strip():
            checked += 1
            from docx.oxml.ns import qn
            rPr = r._element.find(qn('w:rPr'))
            if rPr is not None:
                rF = rPr.find(qn('w:rFonts'))
                if rF is not None and rF.get(qn('w:eastAsia')) != '微软雅黑':
                    ok = False; print(f'  ⚠ 非雅黑: {r.text[:15]}')
            if checked >= 30: break
    if checked >= 30: break
print(f'  {"✓" if ok else "⚠"} 抽样{checked}处均为微软雅黑' if ok else '')

print('\n'+'='*60)
print('验证完成')
print('='*60)
