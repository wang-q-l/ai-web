#!/usr/bin/env python3
"""
诊断 Word 文档中的图片段落结构
"""
import sys
from docx import Document

def diagnose_images(doc_path):
    """诊断图片段落的详细结构"""
    doc = Document(doc_path)

    for i, paragraph in enumerate(doc.paragraphs):
        # 检查段落是否包含图片
        if paragraph._element.xpath('.//pic:pic'):
            print(f'\n=== 图片段落 #{i} ===')
            print(f'段落文本: "{paragraph.text}"')
            print(f'段落文本长度: {len(paragraph.text)}')
            print(f'段落对齐方式: {paragraph.alignment}')
            print(f'Run 数量: {len(paragraph.runs)}')

            # 检查段落格式
            pf = paragraph.paragraph_format
            print(f'左缩进: {pf.left_indent}')
            print(f'右缩进: {pf.right_indent}')
            print(f'首行缩进: {pf.first_line_indent}')

            for j, run in enumerate(paragraph.runs):
                has_image = bool(run._element.xpath('.//pic:pic'))
                print(f'  Run #{j}: 文本="{run.text}" (长度={len(run.text)}), 包含图片={has_image}')

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('用法: python3 diagnose-images.py <Word文件>')
        sys.exit(1)

    diagnose_images(sys.argv[1])
