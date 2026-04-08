#!/usr/bin/env python3
"""
完整文档样式配置文件
修改这里的参数，然后运行 create-cover-template.py 即可更新样式

配置说明：
- font_name: 字体名称（如"仿宋_GB2312"、"宋体"、"黑体"）
- font_size: 字号（pt）
- bold: 是否加粗（True/False）
- italic: 是否斜体（True/False）
- underline: 是否下划线（True/False）
- font_color: 字体颜色（十六进制格式，如'#000000'表示黑色，None表示使用默认颜色）
- alignment: 对齐方式（'left'左对齐, 'center'居中, 'right'右对齐, 'justify'两端对齐）
- space_before: 段前间距（pt）
- space_after: 段后间距（pt）
- line_spacing: 行距（1.0=单倍, 1.5=1.5倍, 2.0=2倍）
- first_line_indent: 首行缩进（pt，0=无缩进）
- left_indent: 左缩进（pt）
- right_indent: 右缩进（pt）

中文字号对照表：
- 初号 = 42pt
- 小初 = 36pt
- 一号 = 26pt
- 小一 = 24pt
- 二号 = 22pt
- 小二 = 18pt
- 三号 = 16pt
- 小三 = 15pt
- 四号 = 14pt
- 小四 = 12pt
- 五号 = 10.5pt
- 小五 = 9pt
"""

# ============================================
# 页面设置
# ============================================
PAGE_SETTINGS = {
    'page_width': 21.0,      # 页面宽度（cm），A4=21.0
    'page_height': 29.7,     # 页面高度（cm），A4=29.7
    'margin_top': 2.54,      # 上边距（cm）
    'margin_bottom': 2.54,   # 下边距（cm）
    'margin_left': 3.17,     # 左边距（cm）
    'margin_right': 3.17,    # 右边距（cm）
}

# ============================================
# 封面页样式
# ============================================
#
# YAML 字段映射（实现独立配置）：
# - title → TITLE_STYLE（文档标题："需求说明书"）
# - subtitle → SUBTITLE_STYLE（项目名称）
# - author → AUTHOR_STYLE（客户名称）
# - date → DATE_STYLE（编制单位和日期）

# Title 样式（文档标题："需求说明书"）
TITLE_STYLE = {
    'font_name': '仿宋_GB2312',
    'font_size': 20,
    'bold': True,
    'italic': False,
    'underline': False,
    'font_color': '#000000',
    'alignment': 'center',
    'space_before': 150,
    'space_after': 12,
    'line_spacing': 1.0,
    'first_line_indent': 0,
    'left_indent': 0,
    'right_indent': 0,
}

# Subtitle 样式（项目名称）
SUBTITLE_STYLE = {
    'font_name': '仿宋_GB2312',
    'font_size': 30,
    'bold': True,
    'italic': False,
    'underline': False,
    'font_color': '#000000',
    'alignment': 'center',
    'space_before': 0,
    'space_after': 0,
    'line_spacing': 1.2,
    'first_line_indent': 0,
    'left_indent': 0,
    'right_indent': 0,
}

# Author 样式（客户名称）
AUTHOR_STYLE = {
    'font_name': '仿宋_GB2312',
    'font_size': 20,
    'bold': True,
    'italic': False,
    'underline': False,
    'font_color': '#000000',
    'alignment': 'center',
    'space_before': 0,
    'space_after': 350,
    'line_spacing': 1.0,
    'first_line_indent': 0,
    'left_indent': 0,
    'right_indent': 0,
}

# Date 样式（编制单位和日期）
DATE_STYLE = {
    'font_name': '仿宋_GB2312',
    'font_size': 14,
    'bold': False,
    'italic': False,
    'underline': False,
    'font_color': '#000000',
    'alignment': 'center',
    'space_before': 6,
    'space_after': 12,
    'line_spacing': 1.0,
    'first_line_indent': 0,
    'left_indent': 0,
    'right_indent': 0,
}

# ============================================
# 正文样式
# ============================================

# Normal 样式（正文）
NORMAL_STYLE = {
    'font_name': '仿宋_GB2312',
    'font_size': 16,
    'bold': False,
    'italic': False,
    'underline': False,
    'font_color': '#000000',
    'alignment': 'justify',  # 两端对齐
    'space_before': 0,
    'space_after': 0,
    'line_spacing': 1.5,
    'first_line_indent': 32,  # 首行缩进2字符（16pt × 2）
    'left_indent': 0,
    'right_indent': 0,
}

# ============================================
# 标题样式
# ============================================

# Heading 1 样式（一级标题）
H1_STYLE = {
    'font_name': '仿宋_GB2312',
    'font_size': 22,
    'bold': True,
    'italic': False,
    'underline': False,
    'font_color': '#000000',
    'alignment': 'left',
    'space_before': 12,
    'space_after': 6,
    'line_spacing': 1.0,
    'first_line_indent': 0,
    'left_indent': 0,
    'right_indent': 0,
}

# Heading 2 样式（二级标题）
H2_STYLE = {
    'font_name': '仿宋_GB2312',
    'font_size': 18,
    'bold': True,
    'italic': False,
    'underline': False,
    'font_color': '#000000',
    'alignment': 'left',
    'space_before': 12,
    'space_after': 6,
    'line_spacing': 1.0,
    'first_line_indent': 0,
    'left_indent': 0,
    'right_indent': 0,
}

# Heading 3 样式（三级标题）
H3_STYLE = {
    'font_name': '仿宋_GB2312',
    'font_size': 16,
    'bold': True,
    'italic': False,
    'underline': False,
    'font_color': '#000000',
    'alignment': 'left',
    'space_before': 12,
    'space_after': 6,
    'line_spacing': 1.0,
    'first_line_indent': 0,
    'left_indent': 0,
    'right_indent': 0,
}

# Heading 4 样式（四级标题）
H4_STYLE = {
    'font_name': '仿宋_GB2312',
    'font_size': 14,
    'bold': True,
    'italic': False,
    'underline': False,
    'font_color': '#000000',
    'alignment': 'left',
    'space_before': 12,
    'space_after': 6,
    'line_spacing': 1.0,
    'first_line_indent': 0,
    'left_indent': 0,
    'right_indent': 0,
}

# Heading 5 样式（五级标题）
H5_STYLE = {
    'font_name': '仿宋_GB2312',
    'font_size': 12,
    'bold': True,
    'italic': False,
    'underline': False,
    'font_color': '#000000',
    'alignment': 'left',
    'space_before': 12,
    'space_after': 6,
    'line_spacing': 1.0,
    'first_line_indent': 0,
    'left_indent': 0,
    'right_indent': 0,
}

# Heading 6 样式（六级标题）
H6_STYLE = {
    'font_name': '仿宋_GB2312',
    'font_size': 12,
    'bold': False,
    'italic': False,
    'underline': False,
    'font_color': '#000000',
    'alignment': 'left',
    'space_before': 12,
    'space_after': 6,
    'line_spacing': 1.0,
    'first_line_indent': 0,
    'left_indent': 0,
    'right_indent': 0,
}

# ============================================
# 列表样式
# ============================================

# List Paragraph 样式（列表段落）
LIST_PARAGRAPH_STYLE = {
    'font_name': '仿宋_GB2312',
    'font_size': 16,
    'bold': False,
    'italic': False,
    'underline': False,
    'font_color': '#000000',
    'alignment': 'left',
    'space_before': 0,
    'space_after': 0,
    'line_spacing': 1.5,
    'first_line_indent': 0,
    'left_indent': 32,  # 列表缩进
    'right_indent': 0,
}

# List Bullet 样式（无序列表）
LIST_BULLET_STYLE = {
    'font_name': '仿宋_GB2312',
    'font_size': 16,
    'bold': False,
    'italic': False,
    'underline': False,
    'font_color': '#000000',
    'alignment': 'left',
    'space_before': 0,
    'space_after': 0,
    'line_spacing': 1.5,
    'first_line_indent': 0,
    'left_indent': 32,  # 列表缩进
    'right_indent': 0,
}

# List Number 样式（有序列表）
LIST_NUMBER_STYLE = {
    'font_name': '仿宋_GB2312',
    'font_size': 16,
    'bold': False,
    'italic': False,
    'underline': False,
    'font_color': '#000000',
    'alignment': 'left',
    'space_before': 0,
    'space_after': 0,
    'line_spacing': 1.5,
    'first_line_indent': 0,
    'left_indent': 32,  # 列表缩进
    'right_indent': 0,
}

# ============================================
# 特殊样式
# ============================================

# Quote 样式（引用）
QUOTE_STYLE = {
    'font_name': '仿宋_GB2312',
    'font_size': 14,
    'bold': False,
    'italic': True,
    'underline': False,
    'font_color': '#000000',
    'alignment': 'left',
    'space_before': 6,
    'space_after': 6,
    'line_spacing': 1.5,
    'first_line_indent': 0,
    'left_indent': 32,
    'right_indent': 32,
}

# Caption 样式（图表标题）
CAPTION_STYLE = {
    'font_name': '仿宋_GB2312',
    'font_size': 12,
    'bold': False,
    'italic': False,
    'underline': False,
    'font_color': '#000000',
    'alignment': 'center',
    'space_before': 6,
    'space_after': 12,
    'line_spacing': 1.0,
    'first_line_indent': 0,
    'left_indent': 0,
    'right_indent': 0,
}

# Source Code 样式（代码块）
SOURCE_CODE_STYLE = {
    'font_name': '仿宋_GB2312',
    'font_size': 10,
    'bold': False,
    'italic': False,
    'underline': False,
    'font_color': '#000000',
    'background_color': '#F5F5F5',  # 浅灰色背景
    'alignment': 'left',
    'space_before': 6,
    'space_after': 6,
    'line_spacing': 1.5,
    'first_line_indent': 0,
    'left_indent': 20,
    'right_indent': 20,
}

# ============================================
# 目录样式
# ============================================

# TOC Heading 样式（目录标题："目录"）
TOC_HEADING_STYLE = {
    'font_name': '仿宋_GB2312',
    'font_size': 16,
    'bold': True,
    'italic': False,
    'underline': False,
    'font_color': '#000000',
    'alignment': 'center',
    'space_before': 0,
    'space_after': 0,
    'line_spacing': 1.5,
    'first_line_indent': 0,
    'left_indent': 0,
    'right_indent': 0,
}

# TOC 1 样式（目录一级条目）
TOC_1_STYLE = {
    'font_name': '仿宋_GB2312',
    'font_size': 14,
    'bold': False,
    'italic': False,
    'underline': False,
    'font_color': '#000000',
    'alignment': 'left',
    'space_before': 0,
    'space_after': 0,
    'line_spacing': 1.5,
    'first_line_indent': 0,
    'left_indent': 0,
    'right_indent': 0,
}

# TOC 2 样式（目录二级条目）
TOC_2_STYLE = {
    'font_name': '仿宋_GB2312',
    'font_size': 14,
    'bold': False,
    'italic': False,
    'underline': False,
    'font_color': '#000000',
    'alignment': 'left',
    'space_before': 0,
    'space_after': 0,
    'line_spacing': 1.5,
    'first_line_indent': 0,
    'left_indent': 21,
    'right_indent': 0,
}

# TOC 3 样式（目录三级条目）
TOC_3_STYLE = {
    'font_name': '仿宋_GB2312',
    'font_size': 14,
    'bold': False,
    'italic': False,
    'underline': False,
    'font_color': '#000000',
    'alignment': 'left',
    'space_before': 0,
    'space_after': 0,
    'line_spacing': 1.5,
    'first_line_indent': 0,
    'left_indent': 42,
    'right_indent': 0,
}

# ============================================
# 表格样式
# ============================================

# 表格样式配置
TABLE_STYLE = {
    # 边框设置
    'border': {
        'top': {'size': 4, 'color': '#000000'},      # 上边框：粗细4磅，黑色
        'bottom': {'size': 4, 'color': '#000000'},   # 下边框：粗细4磅，黑色
        'left': {'size': 4, 'color': '#000000'},     # 左边框：粗细4磅，黑色
        'right': {'size': 4, 'color': '#000000'},    # 右边框：粗细4磅，黑色
        'insideH': {'size': 4, 'color': '#000000'},  # 内部横线：粗细4磅，黑色
        'insideV': {'size': 4, 'color': '#000000'},  # 内部竖线：粗细4磅，黑色
    },

    # 单元格内边距（单位：pt）
    'cell_margins': {
        'top': 4,      # 上内边距：4pt
        'bottom': 4,   # 下内边距：4pt
        'left': 4,     # 左内边距：8pt
        'right': 4,    # 右内边距：8pt
    },

    # 表头样式
    'header': {
        'font_name': '仿宋_GB2312',      # 表头字体
        'font_size': 14,                 # 表头字号：14pt（小四）
        'bold': True,                    # 表头加粗
        'font_color': '#000000',         # 表头字体颜色：黑色
        'background_color': '#C1DBF3',   # 表头背景色：浅灰色
        'alignment': 'center',           # 表头对齐方式：居中
    },

    # 表格内容样式
    'content': {
        'font_name': '仿宋_GB2312',      # 内容字体
        'font_size': 12,                 # 内容字号：12pt（小四）
        'bold': False,                   # 内容不加粗
        'font_color': '#000000',         # 内容字体颜色：黑色
        'alignment': 'left',             # 内容对齐方式：左对齐
    },

    # 行高设置
    'row_height': {
        'header': 400,   # 表头行高：400缇（约0.7cm）
        'content': 350,  # 内容行高：350缇（约0.6cm）
    },

    # 表格宽度
    'width': {
        'type': 'auto',  # 宽度类型：auto（自动）/ pct（百分比）/ dxa（绝对值）
        'value': 100,    # 宽度值：100%（当type为pct时）
    },
}
