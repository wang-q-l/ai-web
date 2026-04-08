#!/bin/bash
# 需求说明书 → Word 导出脚本
# 用法：bash .claude/skills/req-doc/scripts/export-word.sh <输入.md> [输出.docx]

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"
REFERENCE_DOC="$SKILL_DIR/assets/reference.docx"
LOG_FILE="/tmp/req-doc-export-$(date +%Y%m%d-%H%M%S).log"

# 启用日志记录
exec 1> >(tee -a "$LOG_FILE")
exec 2>&1

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

echo "📝 日志文件：$LOG_FILE"
echo ""

# 检查依赖
echo "🔍 检查依赖..."

# 检查并安装包管理器
if [[ "$OSTYPE" == "darwin"* ]]; then
  if ! command -v brew &> /dev/null; then
    echo "❌ 未检测到 Homebrew"
    echo "📦 正在安装 Homebrew（可能需要 3-5 分钟）..."
    if /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"; then
      echo "✅ Homebrew 安装完成"
    else
      echo "❌ Homebrew 安装失败，请手动安装："
      echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
      exit 1
    fi
  fi
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  # 优先使用 winget（Windows 10+ 自带）
  if command -v winget &> /dev/null; then
    PKG_MANAGER="winget"
  elif command -v choco &> /dev/null; then
    PKG_MANAGER="choco"
  else
    echo "❌ 未检测到 winget 或 Chocolatey"
    echo "📦 请手动安装 Chocolatey："
    echo "   以管理员身份运行 PowerShell，执行："
    echo "   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
    exit 1
  fi
fi

# 检查 Python 版本
if ! command -v python3 &> /dev/null; then
  echo "❌ 未检测到 Python 3"
  if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📦 正在通过 Homebrew 安装 Python 3（可能需要 2-5 分钟）..."
    if brew install python3 2>&1 | grep -v "^==>"; then
      echo "✅ Python 3 安装完成"
    else
      echo "❌ Python 3 安装失败，可能原因："
      echo "   1. 网络连接问题"
      echo "   2. Homebrew 需要更新：brew update"
      echo "   3. 磁盘空间不足"
      exit 1
    fi
  elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    echo "📦 正在安装 Python 3（可能需要 3-5 分钟）..."
    if [ "$PKG_MANAGER" = "winget" ]; then
      winget install Python.Python.3 --silent
    else
      choco install python -y
    fi
    echo "✅ Python 3 安装完成，请重新运行此脚本"
    exit 0
  else
    echo "📦 正在安装 Python 3..."
    if sudo apt update && sudo apt install -y python3 python3-pip; then
      echo "✅ Python 3 安装完成"
    else
      echo "❌ Python 3 安装失败"
      exit 1
    fi
  fi
else
  # 检查 Python 版本
  PYTHON_VERSION=$(python3 --version 2>&1 | sed -n 's/Python \([0-9]*\.[0-9]*\).*/\1/p')
  REQUIRED_VERSION="3.7"
  if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$PYTHON_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Python 版本过低：$PYTHON_VERSION，需要 3.7+"
    exit 1
  fi
  echo "✅ Python 3 版本：$PYTHON_VERSION"
fi

# 检查 Pandoc
if ! command -v pandoc &> /dev/null; then
  echo "❌ 未检测到 Pandoc"
  if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📦 正在通过 Homebrew 安装 Pandoc（可能需要 1-3 分钟）..."
    if brew install pandoc 2>&1 | grep -v "^==>"; then
      echo "✅ Pandoc 安装完成"
    else
      echo "❌ Pandoc 安装失败"
      exit 1
    fi
  elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    echo "📦 正在安装 Pandoc（可能需要 2-3 分钟）..."
    if [ "$PKG_MANAGER" = "winget" ]; then
      winget install Pandoc.Pandoc --silent
    else
      choco install pandoc -y
    fi
    echo "✅ Pandoc 安装完成，请重新运行此脚本"
    exit 0
  else
    echo "📦 正在安装 Pandoc..."
    if sudo apt update && sudo apt install -y pandoc; then
      echo "✅ Pandoc 安装完成"
    else
      echo "❌ Pandoc 安装失败"
      exit 1
    fi
  fi
else
  echo "✅ Pandoc 已安装"
fi

# 检查 Python 依赖
if ! python3 -c "import docx" &> /dev/null; then
  echo "❌ 未检测到 python-docx 库"
  echo "📦 正在安装 python-docx（可能需要 30 秒）..."
  if pip3 install python-docx 2>&1 | tail -5; then
    echo "✅ python-docx 安装完成"
  else
    echo "❌ python-docx 安装失败，可能原因："
    echo "   1. 网络连接问题"
    echo "   2. pip 需要更新：pip3 install --upgrade pip"
    exit 1
  fi
else
  echo "✅ python-docx 已安装"
fi

echo ""
echo "✅ 所有依赖检查通过"
echo ""

echo "🔄 正在更新样式模板..."
python3 "$SCRIPT_DIR/create-cover-template.py" "$REFERENCE_DOC" > /dev/null

echo "📄 正在导出 Word..."
echo "   输入: $INPUT"
echo "   输出: $OUTPUT"
echo "   模板: $REFERENCE_DOC"

pandoc "$INPUT" \
  --from markdown \
  --to docx \
  --reference-doc="$REFERENCE_DOC" \
  --toc \
  --toc-depth=3 \
  --resource-path="$(dirname "$INPUT")" \
  --lua-filter="$SCRIPT_DIR/toc-title-filter.lua" \
  --lua-filter="$SCRIPT_DIR/image-resize.lua" \
  -o "$OUTPUT"

echo "📝 添加页码..."
python3 "$SCRIPT_DIR/adjust-cover-page.py" "$OUTPUT"

echo "📝 设置图片居中..."
python3 "$SCRIPT_DIR/center-images.py" "$OUTPUT"

echo "📝 应用表头样式..."
python3 "$SCRIPT_DIR/apply-table-header-style.py" "$OUTPUT"

echo "📝 转换代码块为表格..."
python3 "$SCRIPT_DIR/convert-code-to-table.py" "$OUTPUT"

echo "✅ 导出完成: $OUTPUT"
