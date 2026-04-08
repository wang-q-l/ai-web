#!/usr/bin/env python3
"""
创建包含完整文档样式的 reference.docx 模板
"""
import sys
import os
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

# 导入样式配置
sys.path.insert(0, os.path.dirname(__file__))
from cover_style_config import *

# 对齐方式映射
ALIGNMENT_MAP = {
    'left': WD_ALIGN_PARAGRAPH.LEFT,
    'center': WD_ALIGN_PARAGRAPH.CENTER,
    'right': WD_ALIGN_PARAGRAPH.RIGHT,
    'justify': WD_ALIGN_PARAGRAPH.JUSTIFY,
}

def apply_style(style, config):
    """应用完整样式配置"""
    # 字体设置
    style.font.name = config['font_name']
    style.font.size = Pt(config['font_size'])
    style.font.bold = config['bold']
    style.font.italic = config['italic']
    style.font.underline = config['underline']

    # 字体颜色
    if 'font_color' in config and config['font_color']:
        color_hex = config['font_color'].lstrip('#')
        r = int(color_hex[0:2], 16)
        g = int(color_hex[2:4], 16)
        b = int(color_hex[4:6], 16)
        style.font.color.rgb = RGBColor(r, g, b)

    # 设置中文字体
    rPr = style.element.rPr
    if rPr is None:
        rPr = OxmlElement('w:rPr')
        style.element.insert(0, rPr)

    rFonts = rPr.find(qn('w:rFonts'))
    if rFonts is None:
        rFonts = OxmlElement('w:rFonts')
        rPr.insert(0, rFonts)

    rFonts.set(qn('w:ascii'), config['font_name'])
    rFonts.set(qn('w:hAnsi'), config['font_name'])
    rFonts.set(qn('w:eastAsia'), config['font_name'])

    # 清除主题字体引用
    for attr in ['w:asciiTheme', 'w:hAnsiTheme', 'w:eastAsiaTheme', 'w:cstheme']:
        if rFonts.get(qn(attr)):
            del rFonts.attrib[qn(attr)]

    # 段落格式
    style.paragraph_format.alignment = ALIGNMENT_MAP[config['alignment']]
    style.paragraph_format.space_before = Pt(config['space_before'])
    style.paragraph_format.space_after = Pt(config['space_after'])
    style.paragraph_format.line_spacing = config['line_spacing']
    style.paragraph_format.first_line_indent = Pt(config['first_line_indent'])
    style.paragraph_format.left_indent = Pt(config['left_indent'])
    style.paragraph_format.right_indent = Pt(config['right_indent'])

def apply_table_style(doc):
    """应用表格样式到文档"""
    from docx.oxml.shared import OxmlElement
    from docx.oxml.ns import qn

    # 获取或创建 Table Grid 样式
    try:
        table_style = doc.styles['Table Grid']
    except KeyError:
        # 如果不存在，创建一个新的表格样式
        from docx.enum.style import WD_STYLE_TYPE
        table_style = doc.styles.add_style('Table Grid', WD_STYLE_TYPE.TABLE)

    # 获取样式的 XML 元素
    style_element = table_style._element

    # 查找或创建 tblPr 元素
    tblPr = style_element.find(qn('w:tblPr'))
    if tblPr is None:
        tblPr = OxmlElement('w:tblPr')
        style_element.append(tblPr)

    # 设置表格边框
    tblBorders = OxmlElement('w:tblBorders')

    border_config = TABLE_STYLE['border']
    for border_name in ['top', 'bottom', 'left', 'right', 'insideH', 'insideV']:
        border = OxmlElement(f'w:{border_name}')
        border.set(qn('w:val'), 'single')  # 边框类型：单线
        border.set(qn('w:sz'), str(border_config[border_name]['size']))  # 边框粗细
        border.set(qn('w:color'), border_config[border_name]['color'].lstrip('#'))  # 边框颜色
        tblBorders.append(border)

    # 移除旧的边框设置（如果存在）
    old_borders = tblPr.find(qn('w:tblBorders'))
    if old_borders is not None:
        tblPr.remove(old_borders)
    tblPr.append(tblBorders)

    # 设置单元格内边距
    tblCellMar = OxmlElement('w:tblCellMar')
    margins = TABLE_STYLE['cell_margins']
    for margin_name in ['top', 'bottom', 'left', 'right']:
        margin = OxmlElement(f'w:{margin_name}')
        margin.set(qn('w:w'), str(int(margins[margin_name] * 20)))  # pt转换为twips (1pt = 20 twips)
        margin.set(qn('w:type'), 'dxa')  # 单位类型
        tblCellMar.append(margin)

    # 移除旧的单元格边距设置（如果存在）
    old_margins = tblPr.find(qn('w:tblCellMar'))
    if old_margins is not None:
        tblPr.remove(old_margins)
    tblPr.append(tblCellMar)

    # 设置表头样式（第一行）
    header_config = TABLE_STYLE['header']
    tblStylePr_firstRow = OxmlElement('w:tblStylePr')
    tblStylePr_firstRow.set(qn('w:type'), 'firstRow')

    # 表头文字属性
    tcPr = OxmlElement('w:tcPr')
    shd = OxmlElement('w:shd')
    shd.set(qn('w:fill'), header_config['background_color'].lstrip('#'))
    tcPr.append(shd)
    tblStylePr_firstRow.append(tcPr)

    # 表头段落属性
    pPr = OxmlElement('w:pPr')
    jc = OxmlElement('w:jc')
    jc.set(qn('w:val'), header_config['alignment'])
    pPr.append(jc)
    tblStylePr_firstRow.append(pPr)

    # 表头字体属性
    rPr = OxmlElement('w:rPr')
    if header_config['bold']:
        rPr.append(OxmlElement('w:b'))
    rFonts = OxmlElement('w:rFonts')
    rFonts.set(qn('w:ascii'), header_config['font_name'])
    rFonts.set(qn('w:hAnsi'), header_config['font_name'])
    rFonts.set(qn('w:eastAsia'), header_config['font_name'])
    rPr.append(rFonts)
    sz = OxmlElement('w:sz')
    sz.set(qn('w:val'), str(header_config['font_size'] * 2))
    rPr.append(sz)
    color = OxmlElement('w:color')
    color.set(qn('w:val'), header_config['font_color'].lstrip('#'))
    rPr.append(color)
    tblStylePr_firstRow.append(rPr)

    style_element.append(tblStylePr_firstRow)

    # 设置内容样式（其他行）
    content_config = TABLE_STYLE['content']

    # 内容段落属性
    pPr_content = style_element.find(qn('w:pPr'))
    if pPr_content is None:
        pPr_content = OxmlElement('w:pPr')
        style_element.append(pPr_content)
    jc_content = OxmlElement('w:jc')
    jc_content.set(qn('w:val'), content_config['alignment'])
    pPr_content.append(jc_content)

    # 内容字体属性
    rPr_content = style_element.find(qn('w:rPr'))
    if rPr_content is None:
        rPr_content = OxmlElement('w:rPr')
        style_element.append(rPr_content)
    rFonts_content = OxmlElement('w:rFonts')
    rFonts_content.set(qn('w:ascii'), content_config['font_name'])
    rFonts_content.set(qn('w:hAnsi'), content_config['font_name'])
    rFonts_content.set(qn('w:eastAsia'), content_config['font_name'])
    rPr_content.append(rFonts_content)
    sz_content = OxmlElement('w:sz')
    sz_content.set(qn('w:val'), str(content_config['font_size'] * 2))
    rPr_content.append(sz_content)
    color_content = OxmlElement('w:color')
    color_content.set(qn('w:val'), content_config['font_color'].lstrip('#'))
    rPr_content.append(color_content)

def set_page_settings(doc, settings):
    """设置页面参数"""
    section = doc.sections[0]
    section.page_width = Cm(settings['page_width'])
    section.page_height = Cm(settings['page_height'])
    section.top_margin = Cm(settings['margin_top'])
    section.bottom_margin = Cm(settings['margin_bottom'])
    section.left_margin = Cm(settings['margin_left'])
    section.right_margin = Cm(settings['margin_right'])

def create_cover_page_template(output_path):
    """创建包含完整文档样式的模板"""
    doc = Document()

    # 设置页面参数
    set_page_settings(doc, PAGE_SETTINGS)

    # 封面页样式
    apply_style(doc.styles['Title'], TITLE_STYLE)
    apply_style(doc.styles['Subtitle'], SUBTITLE_STYLE)

    # Author 样式
    try:
        author_style = doc.styles['Author']
    except:
        author_style = doc.styles.add_style('Author', 1)
    apply_style(author_style, AUTHOR_STYLE)

    # Date 样式
    try:
        date_style = doc.styles['Date']
    except:
        date_style = doc.styles.add_style('Date', 1)
    apply_style(date_style, DATE_STYLE)

    # 正文样式
    apply_style(doc.styles['Normal'], NORMAL_STYLE)

    # 标题样式
    apply_style(doc.styles['Heading 1'], H1_STYLE)
    apply_style(doc.styles['Heading 2'], H2_STYLE)
    apply_style(doc.styles['Heading 3'], H3_STYLE)

    # Heading 4
    try:
        apply_style(doc.styles['Heading 4'], H4_STYLE)
    except:
        pass

    # Heading 5
    try:
        apply_style(doc.styles['Heading 5'], H5_STYLE)
    except:
        pass

    # Heading 6
    try:
        apply_style(doc.styles['Heading 6'], H6_STYLE)
    except:
        pass

    # 列表样式
    try:
        apply_style(doc.styles['List Paragraph'], LIST_PARAGRAPH_STYLE)
    except:
        pass

    try:
        apply_style(doc.styles['List Bullet'], LIST_BULLET_STYLE)
    except:
        pass

    try:
        apply_style(doc.styles['List Number'], LIST_NUMBER_STYLE)
    except:
        pass

    # 引用样式
    try:
        apply_style(doc.styles['Quote'], QUOTE_STYLE)
    except:
        pass

    # 图表标题样式
    try:
        apply_style(doc.styles['Caption'], CAPTION_STYLE)
    except:
        pass

    # 代码块样式
    try:
        source_code_style = doc.styles['Source Code']
        apply_style(source_code_style, SOURCE_CODE_STYLE)
        # 设置代码块背景色
        from docx.oxml import OxmlElement
        from docx.oxml.ns import qn
        pPr = source_code_style._element.get_or_add_pPr()
        shd = OxmlElement('w:shd')
        shd.set(qn('w:fill'), SOURCE_CODE_STYLE['background_color'].lstrip('#'))
        pPr.append(shd)
    except:
        pass

    # 目录样式
    try:
        apply_style(doc.styles['TOC Heading'], TOC_HEADING_STYLE)
    except:
        pass

    try:
        apply_style(doc.styles['toc 1'], TOC_1_STYLE)
    except:
        pass

    try:
        apply_style(doc.styles['toc 2'], TOC_2_STYLE)
    except:
        pass

    try:
        apply_style(doc.styles['toc 3'], TOC_3_STYLE)
    except:
        pass

    # 应用表格样式
    apply_table_style(doc)

    # 保存模板
    doc.save(output_path)
    print(f'✅ 完整文档样式模板已创建: {output_path}')
    print(f'   页面设置: {PAGE_SETTINGS["page_width"]}×{PAGE_SETTINGS["page_height"]}cm')
    print(f'   边距: 上{PAGE_SETTINGS["margin_top"]} 下{PAGE_SETTINGS["margin_bottom"]} 左{PAGE_SETTINGS["margin_left"]} 右{PAGE_SETTINGS["margin_right"]}cm')
    print(f'   表格样式: 已应用边框和单元格样式')
    print('   样式配置来自: cover_style_config.py')

if __name__ == '__main__':
    output = sys.argv[1] if len(sys.argv) > 1 else '.claude/skills/req-doc/assets/reference.docx'
    create_cover_page_template(output)
