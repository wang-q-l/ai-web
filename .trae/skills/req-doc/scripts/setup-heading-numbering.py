#!/usr/bin/env python3
"""
为 reference.docx 配置标题编号样式
使标题使用 Word 的内置编号系统
"""
import sys
from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def create_numbering_definition(doc):
    """创建编号定义"""
    # 获取编号部分
    numbering_part = doc.part.numbering_part
    if numbering_part is None:
        # 如果没有编号部分，创建一个
        from docx.opc.constants import RELATIONSHIP_TYPE as RT
        numbering_part = doc.part.relate_to(
            doc.part.package.part_related_by(doc.part, RT.NUMBERING),
            RT.NUMBERING
        )

    # 创建抽象编号定义
    abstractNum = OxmlElement('w:abstractNum')
    abstractNum.set(qn('w:abstractNumId'), '0')

    # 多级列表
    multiLevelType = OxmlElement('w:multiLevelType')
    multiLevelType.set(qn('w:val'), 'multilevel')
    abstractNum.append(multiLevelType)

    # 定义各级编号格式
    levels = [
        {'ilvl': '0', 'start': '1', 'numFmt': 'decimal', 'lvlText': '%1', 'lvlJc': 'left'},  # 1, 2, 3...
        {'ilvl': '1', 'start': '1', 'numFmt': 'decimal', 'lvlText': '%1.%2', 'lvlJc': 'left'},  # 1.1, 1.2...
        {'ilvl': '2', 'start': '1', 'numFmt': 'decimal', 'lvlText': '%1.%2.%3', 'lvlJc': 'left'},  # 1.1.1...
        {'ilvl': '3', 'start': '1', 'numFmt': 'decimal', 'lvlText': '%1.%2.%3.%4', 'lvlJc': 'left'},  # 1.1.1.1...
    ]

    for level_def in levels:
        lvl = OxmlElement('w:lvl')
        lvl.set(qn('w:ilvl'), level_def['ilvl'])

        # 起始值
        start = OxmlElement('w:start')
        start.set(qn('w:val'), level_def['start'])
        lvl.append(start)

        # 编号格式
        numFmt = OxmlElement('w:numFmt')
        numFmt.set(qn('w:val'), level_def['numFmt'])
        lvl.append(numFmt)

        # 编号文本
        lvlText = OxmlElement('w:lvlText')
        lvlText.set(qn('w:val'), level_def['lvlText'])
        lvl.append(lvlText)

        # 对齐方式
        lvlJc = OxmlElement('w:lvlJc')
        lvlJc.set(qn('w:val'), level_def['lvlJc'])
        lvl.append(lvlJc)

        abstractNum.append(lvl)

    return abstractNum

def apply_numbering_to_headings(doc_path):
    """为标题样式应用编号"""
    doc = Document(doc_path)

    print('⚠️  警告：python-docx 对编号的支持有限')
    print('⚠️  建议手动在 Word 中配置标题编号：')
    print('   1. 打开 reference.docx')
    print('   2. 右键点击"标题 1" → 修改')
    print('   3. 点击"格式" → "编号"')
    print('   4. 选择编号样式（1, 2, 3...）')
    print('   5. 对"标题 2"、"标题 3"重复此操作')
    print('   6. 保存文件')

    return False

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('用法: python3 setup-heading-numbering.py <reference.docx>')
        sys.exit(1)

    doc_path = sys.argv[1]
    apply_numbering_to_headings(doc_path)
