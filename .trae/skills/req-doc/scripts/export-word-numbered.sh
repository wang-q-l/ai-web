#!/bin/bash
# 需求说明书 → Word 导出脚本（使用 Word 编号规则）
# 用法：bash .claude/skills/req-doc/scripts/export-word-numbered.sh <输入.md> [输出.docx]

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"
REFERENCE_DOC="$SKILL_DIR/assets/reference.docx"

INPUT="$1"
OUTPUT="${2:-${INPUT%.md}.docx}"

if [ -z "$INPUT" ]; then
  echo "❌ 用法: bash $0 <输入.md> [输出.docx]"
  exit 1
fi

if [ ! -f "$INPUT" ]; then
  echo "❌ 找不到输入文件: $INPUT"
  exit 1
fi

# 创建临时文件（移除编号）
TEMP_MD="${INPUT%.md}-temp.md"

echo "🔄 正在移除标题编号..."
python3 "$SCRIPT_DIR/remove-heading-numbers.py" "$INPUT" "$TEMP_MD"

echo "🔄 正在更新样式模板..."
python3 "$SCRIPT_DIR/create-cover-template.py" "$REFERENCE_DOC" > /dev/null

echo "📄 正在导出 Word（使用自动编号）..."
echo "   输入: $INPUT"
echo "   输出: $OUTPUT"
echo "   模板: $REFERENCE_DOC"

pandoc "$TEMP_MD" \
  --from markdown \
  --to docx \
  --reference-doc="$REFERENCE_DOC" \
  --number-sections \
  --toc \
  --toc-depth=3 \
  --resource-path="$(dirname "$INPUT")" \
  -o "$OUTPUT"

echo "📝 添加页码..."
python3 "$SCRIPT_DIR/adjust-cover-page.py" "$OUTPUT"

# 清理临时文件
rm -f "$TEMP_MD"

echo "✅ 导出完成: $OUTPUT"
echo "ℹ️  标题使用 Word 编号规则（可在 Word 中调整编号格式）"
