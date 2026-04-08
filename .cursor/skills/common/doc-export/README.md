# 通用文档导出工具

通用的 Markdown → Word 文档导出工具，支持自动样式配置和封面生成。

## 功能特性

- ✅ 自动从 Markdown YAML frontmatter 读取文档标题
- ✅ 统一的样式配置（字体、字号、间距、颜色）
- ✅ 代码块自动转换为单元格表格
- ✅ 图片自动居中
- ✅ 表头样式自动应用
- ✅ 自动生成目录
- ✅ 自动添加页码

## 使用方法

### 基本用法

```bash
bash .claude/skills/common/doc-export/scripts/export-word.sh <输入.md> [输出.docx]
```

### 示例

```bash
# 导出需求说明书
bash .claude/skills/common/doc-export/scripts/export-word.sh 需求说明书.md

# 导出测试用例
bash .claude/skills/common/doc-export/scripts/export-word.sh 测试用例.md

# 导出操作手册
bash .claude/skills/common/doc-export/scripts/export-word.sh 操作手册.md

# 指定输出文件名
bash .claude/skills/common/doc-export/scripts/export-word.sh 输入.md 输出.docx
```

## Markdown 文件要求

文档必须包含 YAML frontmatter，至少包含 `title` 字段：

```yaml
---
title: "需求说明书"
subtitle: "[项目名称]\n\n[客户名称]"
author: "编制单位：[编制单位名称]"
date: "[年月]"
lang: zh-CN
toc: true
toc-depth: 3
numbersections: false
geometry: "left=3.17cm,right=3.17cm,top=2.54cm,bottom=2.54cm"
---
```

## 样式配置

样式配置文件位于 `config/style_config.py`，包含：

- 封面页样式（Title、Subtitle、Author、Date）
- 正文样式（Normal、Heading 1-6）
- 列表样式（List Paragraph、List Bullet、List Number）
- 特殊样式（Quote、Caption、Source Code）
- 目录样式（TOC Heading、TOC 1-3）
- 表格样式（边框、内边距、表头、内容）

修改样式后运行以下命令更新模板：

```bash
python3 .claude/skills/common/doc-export/scripts/create-cover-template.py \
  .claude/skills/common/doc-export/assets/reference.docx
```

## 系统依赖

- Python 3.7+
- Pandoc
- python-docx

安装方法：

```bash
# macOS
brew install python3 pandoc
pip3 install python-docx

# Windows
choco install python3 pandoc
pip3 install python-docx

# Linux
sudo apt install python3 python3-pip pandoc
pip3 install python-docx
```

## 目录结构

```
doc-export/
├── README.md              # 本文件
├── config/
│   └── style_config.py    # 样式配置文件
├── scripts/
│   ├── export-word.sh     # 主导出脚本
│   ├── create-cover-template.py
│   ├── adjust-cover-page.py
│   ├── center-images.py
│   ├── apply-table-header-style.py
│   ├── convert-code-to-table.py
│   ├── toc-title-filter.lua
│   └── image-resize.lua
└── assets/
    └── reference.docx     # Word 样式模板
```

## 支持的文档类型

- 需求说明书（req-doc）
- 测试用例（pm-test-cases）
- 操作手册（pm-operation-manual）
- 其他任何包含 YAML frontmatter 的 Markdown 文档
