#!/usr/bin/env python3
"""
从现有 Word 文档提取样式并生成 reference.docx 模板
用法：python3 create-reference-template.py <源文档.docx> <输出模板.docx>
"""
import sys
from docx import Document
from docx.shared import Pt

def extract_font_style(style):
    """提取字体样式"""
    font = style.font
    return {
        'name': font.name,
        'size': font.size.pt if font.size else None,
        'bold': font.bold,
        'italic': font.italic,
        'underline': font.underline
    }

def extract_paragraph_format(style):
    """提取段落格式"""
    pf = style.paragraph_format
    return {
        'alignment': pf.alignment,
        'space_before': pf.space_before.pt if pf.space_before else None,
        'space_after': pf.space_after.pt if pf.space_after else None,
        'line_spacing': pf.line_spacing,
        'first_line_indent': pf.first_line_indent.pt if pf.first_line_indent else None,
        'left_indent': pf.left_indent.pt if pf.left_indent else None,
        'right_indent': pf.right_indent.pt if pf.right_indent else None
    }

def apply_font_style(target_style, font_info):
    """应用字体样式"""
    if font_info['name']:
        target_style.font.name = font_info['name']
    if font_info['size']:
        target_style.font.size = Pt(font_info['size'])
    if font_info['bold'] is not None:
        target_style.font.bold = font_info['bold']
    if font_info['italic'] is not None:
        target_style.font.italic = font_info['italic']
    if font_info['underline'] is not None:
        target_style.font.underline = font_info['underline']

def apply_paragraph_format(target_style, para_info):
    """应用段落格式"""
    pf = target_style.paragraph_format
    if para_info['alignment'] is not None:
        pf.alignment = para_info['alignment']
    if para_info['space_before'] is not None:
        pf.space_before = Pt(para_info['space_before'])
    if para_info['space_after'] is not None:
        pf.space_after = Pt(para_info['space_after'])
    if para_info['line_spacing'] is not None:
        pf.line_spacing = para_info['line_spacing']
    if para_info['first_line_indent'] is not None:
        pf.first_line_indent = Pt(para_info['first_line_indent'])
    if para_info['left_indent'] is not None:
        pf.left_indent = Pt(para_info['left_indent'])
    if para_info['right_indent'] is not None:
        pf.right_indent = Pt(para_info['right_indent'])

def extract_and_create_template(source_path, output_path):
    """从源文档提取样式并创建模板"""
    source_doc = Document(source_path)
    section = source_doc.sections[0]
    page_settings = {
        'width': section.page_width,
        'height': section.page_height,
        'top_margin': section.top_margin,
        'bottom_margin': section.bottom_margin,
        'left_margin': section.left_margin,
        'right_margin': section.right_margin
    }

    styles_to_extract = [
        'Title', 'Subtitle', 'Author', 'Date',
        'Normal', 'Heading 1', 'Heading 2', 'Heading 3', 'Heading 4',
        'List Paragraph', 'Quote', 'Caption'
    ]

    extracted_styles = {}
    for style_name in styles_to_extract:
        try:
            style = source_doc.styles[style_name]
            extracted_styles[style_name] = {
                'font': extract_font_style(style),
                'paragraph': extract_paragraph_format(style)
            }
            print(f'✅ 提取样式: {style_name}')
        except KeyError:
            print(f'⚠️  样式不存在: {style_name}')

    template_doc = Document()
    template_section = template_doc.sections[0]
    template_section.page_width = page_settings['width']
    template_section.page_height = page_settings['height']
    template_section.top_margin = page_settings['top_margin']
    template_section.bottom_margin = page_settings['bottom_margin']
    template_section.left_margin = page_settings['left_margin']
    template_section.right_margin = page_settings['right_margin']

    for style_name, style_info in extracted_styles.items():
        try:
            target_style = template_doc.styles[style_name]
        except KeyError:
            target_style = template_doc.styles.add_style(style_name, 1)

        apply_font_style(target_style, style_info['font'])
        apply_paragraph_format(target_style, style_info['paragraph'])
        print(f'✅ 应用样式: {style_name}')

    template_doc.save(output_path)
    print(f'\n✅ 模板已创建: {output_path}')
    print(f'   页面: {page_settings["width"].cm:.1f}×{page_settings["height"].cm:.1f}cm')
    print(f'   边距: 上{page_settings["top_margin"].cm:.2f} 下{page_settings["bottom_margin"].cm:.2f} 左{page_settings["left_margin"].cm:.2f} 右{page_settings["right_margin"].cm:.2f}cm')

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print('用法: python3 create-reference-template.py <源文档.docx> <输出模板.docx>')
        print('示例: python3 create-reference-template.py 我的文档.docx reference.docx')
        sys.exit(1)

    extract_and_create_template(sys.argv[1], sys.argv[2])
