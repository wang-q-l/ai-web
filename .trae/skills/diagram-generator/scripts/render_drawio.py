#!/usr/bin/env python3
"""
render_drawio.py - 将 draw.io XML 渲染为 SVG 或 PNG

渲染策略（自动降级）：
  1. draw.io 桌面版 CLI（已安装时，效果最好，支持所有形状）
  2. kroki.io 在线 API（降级方案，无需安装任何软件）

用法:
  python3 render_drawio.py --file diagram.drawio --output out.svg
  python3 render_drawio.py --file diagram.drawio --output out.png --scale 2
  python3 render_drawio.py --xml "<mxfile>...</mxfile>" --output out.svg
"""

import argparse
import json
import os
import platform
import shutil
import ssl
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request

# ── draw.io CLI 候选路径 ──────────────────────────────────────────────────────

DRAWIO_CANDIDATES = {
    "Darwin": [
        "/Applications/draw.io.app/Contents/MacOS/draw.io",
        os.path.expanduser("~/Applications/draw.io.app/Contents/MacOS/draw.io"),
    ],
    "Windows": [
        r"C:\Program Files\draw.io\draw.io.exe",
        r"C:\Program Files (x86)\draw.io\draw.io.exe",
        os.path.expanduser(r"~\AppData\Local\Programs\draw.io\draw.io.exe"),
    ],
    "Linux": [
        "/usr/bin/drawio",
        "/usr/local/bin/drawio",
        os.path.expanduser("~/.local/bin/drawio"),
    ],
}

KROKI_URL = "https://kroki.io"

_ssl_ctx = ssl.create_default_context()
_ssl_ctx.check_hostname = False
_ssl_ctx.verify_mode = ssl.CERT_NONE


# ── 检测 draw.io CLI ──────────────────────────────────────────────────────────

def find_drawio_cli() -> str | None:
    """查找 draw.io CLI 可执行文件路径"""
    # 先检查 PATH
    found = shutil.which("drawio") or shutil.which("draw.io")
    if found:
        return found

    system = platform.system()
    for path in DRAWIO_CANDIDATES.get(system, []):
        if os.path.isfile(path) and os.access(path, os.X_OK):
            return path

    return None


# ── draw.io CLI 渲染 ──────────────────────────────────────────────────────────

def render_via_cli(cli: str, xml: str, output_path: str, scale: float = 2.0) -> bool:
    """使用 draw.io CLI 渲染"""
    fmt = os.path.splitext(output_path)[1].lstrip(".").lower()
    if fmt not in ("svg", "png", "pdf", "jpg"):
        fmt = "svg"

    with tempfile.NamedTemporaryFile(suffix=".drawio", mode="w",
                                     encoding="utf-8", delete=False) as tmp:
        tmp.write(xml)
        tmp_path = tmp.name

    try:
        cmd = [cli, "--export", "--format", fmt, tmp_path, "-o", output_path]
        if fmt == "png":
            cmd += ["--scale", str(scale)]

        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

        if result.returncode != 0:
            print(f"[ERROR] draw.io CLI 失败: {result.stderr.strip()}", file=sys.stderr)
            return False

        if not os.path.isfile(output_path):
            print("[ERROR] draw.io CLI 未生成输出文件", file=sys.stderr)
            return False

        size = os.path.getsize(output_path)
        print(f"[OK] draw.io CLI 渲染成功: {output_path} ({size} bytes)")
        return True

    except subprocess.TimeoutExpired:
        print("[ERROR] draw.io CLI 超时", file=sys.stderr)
        return False
    finally:
        os.unlink(tmp_path)


# ── kroki.io 降级渲染 ─────────────────────────────────────────────────────────

def render_via_kroki(xml: str, output_path: str) -> bool:
    """通过 kroki.io 渲染（降级方案，仅支持 SVG/PNG）"""
    fmt = os.path.splitext(output_path)[1].lstrip(".").lower()
    if fmt not in ("svg", "png"):
        fmt = "svg"

    url = f"{KROKI_URL}/drawio/{fmt}"
    payload = json.dumps({"diagram_source": xml}).encode("utf-8")

    req = urllib.request.Request(
        url, data=payload,
        headers={"Content-Type": "application/json",
                 "User-Agent": "diagram-generator-skill/1.0"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=30, context=_ssl_ctx) as resp:
            data = resp.read()
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"[ERROR] kroki.io HTTP {e.code}: {body[:300]}", file=sys.stderr)
        return False
    except urllib.error.URLError as e:
        print(f"[ERROR] kroki.io 网络失败: {e}", file=sys.stderr)
        return False

    if fmt == "png" and not data.startswith(b"\x89PNG"):
        print(f"[ERROR] kroki.io 返回非 PNG 数据 ({len(data)} bytes)", file=sys.stderr)
        return False

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, "wb") as f:
        f.write(data)

    print(f"[OK] kroki.io 渲染成功: {output_path} ({len(data)} bytes)")
    return True


# ── 主入口 ────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="将 draw.io XML 渲染为 SVG/PNG")
    src = parser.add_mutually_exclusive_group(required=True)
    src.add_argument("--file", help="draw.io XML 文件路径（.drawio）")
    src.add_argument("--xml", help="draw.io XML 字符串")
    parser.add_argument("--output", required=True, help="输出文件路径（.svg 或 .png）")
    parser.add_argument("--scale", type=float, default=2.0,
                        help="PNG 缩放倍数（默认 2.0，仅 CLI 模式有效）")
    parser.add_argument("--force-kroki", action="store_true",
                        help="强制使用 kroki.io（跳过 CLI 检测）")
    args = parser.parse_args()

    # 读取 XML
    if args.file:
        with open(args.file, "r", encoding="utf-8") as f:
            xml = f.read()
    else:
        xml = args.xml

    os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)

    # 策略 1：draw.io CLI
    if not args.force_kroki:
        cli = find_drawio_cli()
        if cli:
            print(f"[INFO] 使用 draw.io CLI: {cli}")
            if render_via_cli(cli, xml, args.output, args.scale):
                sys.exit(0)
            print("[WARN] CLI 渲染失败，降级到 kroki.io", file=sys.stderr)
        else:
            print("[INFO] 未检测到 draw.io 桌面版，使用 kroki.io")

    # 策略 2：kroki.io
    if render_via_kroki(xml, args.output):
        sys.exit(0)

    print("[ERROR] 所有渲染方案均失败", file=sys.stderr)
    sys.exit(1)


if __name__ == "__main__":
    main()
