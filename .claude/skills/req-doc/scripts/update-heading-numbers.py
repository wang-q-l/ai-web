#!/usr/bin/env python3
"""
更新需求说明书标题编号格式
将阿拉伯数字改为中文数字（一、二、三...）
"""
import sys
import re

# 中文数字映射
CHINESE_NUMBERS = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']

def update_heading_numbers(content):
    """更新标题编号"""
    lines = content.split('\n')
    result = []

    # 第一遍：找出所有一级标题（## 数字. 标题）
    h1_pattern = re.compile(r'^## (\d+)\. (.+)$')
    h1_map = {}  # 原编号 -> 新编号
    h1_count = 1  # 从"一"开始（跳过"文档信息"）

    for line in lines:
        match = h1_pattern.match(line)
        if match:
            old_num = int(match.group(1))
            h1_map[old_num] = h1_count + 1  # +1 因为"文档信息"是第一个
            h1_count += 1

    # 第二遍：替换标题
    for line in lines:
        # 处理一级标题（## 数字. 标题）
        match = h1_pattern.match(line)
        if match:
            old_num = int(match.group(1))
            title = match.group(2)
            new_num = h1_map[old_num]
            chinese_num = CHINESE_NUMBERS[new_num]
            result.append(f'## {chinese_num}、{title}')
            continue

        # 处理二级标题（### 数字.数字 标题）
        h2_pattern = re.compile(r'^### (\d+)\.(\d+) (.+)$')
        match = h2_pattern.match(line)
        if match:
            old_h1 = int(match.group(1))
            h2_num = match.group(2)
            title = match.group(3)
            new_h1 = h1_map.get(old_h1, old_h1)
            result.append(f'### {new_h1}.{h2_num} {title}')
            continue

        # 处理三级标题（#### 数字.数字.数字 标题）
        h3_pattern = re.compile(r'^#### (\d+)\.(\d+)\.(\d+) (.+)$')
        match = h3_pattern.match(line)
        if match:
            old_h1 = int(match.group(1))
            h2_num = match.group(2)
            h3_num = match.group(3)
            title = match.group(4)
            new_h1 = h1_map.get(old_h1, old_h1)
            result.append(f'#### {new_h1}.{h2_num}.{h3_num} {title}')
            continue

        # 处理四级标题（##### 数字.数字.数字.数字 标题）
        h4_pattern = re.compile(r'^##### (\d+)\.(\d+)\.(\d+)\.(\d+) (.+)$')
        match = h4_pattern.match(line)
        if match:
            old_h1 = int(match.group(1))
            h2_num = match.group(2)
            h3_num = match.group(3)
            h4_num = match.group(4)
            title = match.group(5)
            new_h1 = h1_map.get(old_h1, old_h1)
            result.append(f'##### {new_h1}.{h2_num}.{h3_num}.{h4_num} {title}')
            continue

        # 处理"文档信息"标题（特殊处理）
        if line == '## 文档信息':
            result.append('## 一、文档信息')
            continue

        # 其他行保持不变
        result.append(line)

    return '\n'.join(result)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('用法: python3 update-heading-numbers.py <文件路径>')
        sys.exit(1)

    file_path = sys.argv[1]

    # 读取文件
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 更新标题编号
    updated_content = update_heading_numbers(content)

    # 写回文件
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(updated_content)

    print(f'✅ 标题编号已更新: {file_path}')
