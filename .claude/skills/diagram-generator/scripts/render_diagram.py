#!/usr/bin/env python3
"""
render_diagram.py - 通过 kroki.io 在线 API 将图表代码渲染为 PNG 并保存到本地

支持格式: mermaid (推荐), plantuml, graphviz, blockdiag, seqdiag, actdiag,
          nwdiag, packetdiag, rackdiag, c4plantuml, d2, dbml, ditaa,
          erd, excalidraw, nomnoml, pikchr, structurizr, svgbob, vega,
          vega-lite, wavedrom, wireviz

用法:
  python3 render_diagram.py --type mermaid --code "graph TD\n  A-->B" --output out.png
  python3 render_diagram.py --type mermaid --file diagram.mmd --output out.png
  python3 render_diagram.py --type plantuml --file diagram.puml --output out.png
"""

import argparse
import base64
import json
import os
import ssl
import sys
import urllib.request
import urllib.error
import zlib

KROKI_URL = "https://kroki.io"

# 忽略 SSL 验证（兼容企业内网证书问题）
_ssl_ctx = ssl.create_default_context()
_ssl_ctx.check_hostname = False
_ssl_ctx.verify_mode = ssl.CERT_NONE


def render_to_png(diagram_type: str, code: str, output_path: str) -> bool:
    """调用 kroki.io API 渲染 PNG"""
    url = f"{KROKI_URL}/{diagram_type}/png"
    payload = json.dumps({"diagram_source": code}).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "diagram-generator-skill/1.0",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=30, context=_ssl_ctx) as resp:
            data = resp.read()
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"[ERROR] HTTP {e.code}: {body[:200]}", file=sys.stderr)
        return False
    except urllib.error.URLError as e:
        print(f"[ERROR] 网络请求失败: {e}", file=sys.stderr)
        return False

    if not data.startswith(b"\x89PNG"):
        print(f"[ERROR] 响应不是有效的 PNG ({len(data)} bytes)", file=sys.stderr)
        print(f"[ERROR] 内容: {data[:100]}", file=sys.stderr)
        return False

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, "wb") as f:
        f.write(data)

    print(f"[OK] 图片已保存: {output_path} ({len(data)} bytes)")
    return True


def main():
    parser = argparse.ArgumentParser(description="通过 kroki.io 将图表代码渲染为 PNG")
    parser.add_argument(
        "--type", required=True,
        help="图表类型，如 mermaid, plantuml, graphviz 等"
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--code", help="图表代码字符串（支持 \\n 换行）")
    group.add_argument("--file", help="图表代码文件路径")
    parser.add_argument("--output", required=True, help="输出 PNG 文件路径")
    args = parser.parse_args()

    if args.file:
        with open(args.file, "r", encoding="utf-8") as f:
            code = f.read()
    else:
        code = args.code.replace("\\n", "\n")

    sys.exit(0 if render_to_png(args.type, code, args.output) else 1)


if __name__ == "__main__":
    main()
