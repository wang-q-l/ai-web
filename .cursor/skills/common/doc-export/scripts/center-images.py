#!/usr/bin/env python3
"""
设置 Word 文档中的图片居中对齐
"""
import sys
from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH

def center_images(doc_path):
    """将文档中的所有图片设置为居中对齐"""
    doc = Document(doc_path)
    image_count = 0

    for paragraph in doc.paragraphs:
        # 检查段落是否包含图片
        if paragraph._element.xpath('.//pic:pic'):
            # 清除段落中的所有文本内容（保留图片）
            for run in paragraph.runs:
                if not run._element.xpath('.//pic:pic'):
                    run.text = ''

            # 设置段落居中对齐
            paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER

            # 清除首行缩进
            paragraph.paragraph_format.first_line_indent = None

            image_count += 1

    # 保存文档
    doc.save(doc_path)
    print(f'✅ 图片已居中对齐（共 {image_count} 张图片）')

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('用法: python3 center-images.py <Word文件>')
        sys.exit(1)

    center_images(sys.argv[1])
