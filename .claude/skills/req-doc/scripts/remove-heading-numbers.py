#!/usr/bin/env python3
"""
移除 Markdown 标题中的编号
将 "## 二、项目概述" 转换为 "## 项目概述"
将 "### 2.1 项目背景" 转换为 "### 项目背景"
"""
import sys
import re

def remove_heading_numbers(content):
    """移除标题编号"""
    lines = content.split('\n')
    result = []

    for line in lines:
        # 处理一级标题（## 二、标题）
        if line.startswith('## '):
            # 移除中文数字编号（一、二、三...）
            line = re.sub(r'^## [一二三四五六七八九十]+、', '## ', line)

        # 处理二级标题（### 2.1 标题）
        elif line.startswith('### '):
            # 移除数字编号（2.1, 2.2 等）
            line = re.sub(r'^### \d+\.\d+ ', '### ', line)

        # 处理三级标题（#### 2.1.1 标题）
        elif line.startswith('#### '):
            # 移除数字编号（2.1.1, 2.1.2 等）
            line = re.sub(r'^#### \d+\.\d+\.\d+ ', '#### ', line)

        # 处理四级标题（##### 2.1.1.1 标题）
        elif line.startswith('##### '):
            # 移除数字编号（2.1.1.1 等）
            line = re.sub(r'^##### \d+\.\d+\.\d+\.\d+ ', '##### ', line)

        result.append(line)

    return '\n'.join(result)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('用法: python3 remove-heading-numbers.py <输入文件> [输出文件]')
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else input_file.replace('.md', '-no-numbers.md')

    # 读取文件
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 移除编号
    updated_content = remove_heading_numbers(content)

    # 写入文件
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(updated_content)

    print(f'✅ 已移除标题编号: {output_file}')
