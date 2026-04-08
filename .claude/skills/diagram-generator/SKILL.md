---
name: diagram-generator
description: >
  生成流程图、架构图、时序图、泳道图等图表，并将图片嵌入到 Markdown 文档中。 优先使用 D2 语言（连线不重叠，路由最优，ELK 引擎）； 次选 draw.io CLI（支持复杂泳道和自定义形状）； 无本地工具时降级到 kroki.io 在线 API。 触发场景：(1) 用户要求在需求说明书、设计文档中插入流程图/架构图/时序图/泳道图， (2) 用户说「画一个流程图」「生成架构图」「插入图表」「生成图片」「画个泳道图」， (3) 需要将业务流程、系统架构、数据流向可视化并嵌入文档。
---

# Diagram Generator

## 渲染策略（优先级顺序）

```
1. D2 + ELK 引擎（首选）：连线自动绕行，无重叠，语法简洁
   安装：brew install d2
   渲染：d2 -l elk input.d2 output.png

2. draw.io CLI（次选）：支持复杂泳道、自定义形状
   渲染：python3 scripts/render_drawio.py --file diagram.drawio --output images/xxx.png --scale 2

3. kroki.io（降级）：无需安装，在线渲染
   渲染：python3 scripts/render_drawio.py --file diagram.drawio --output images/xxx.svg --force-kroki
```

## D2 快速上手

```bash
# 检查是否安装
which d2

# 渲染（ELK 引擎，路由最优）
d2 -l elk input.d2 output.png

# 保存源文件到 images/src/ 目录，方便后续修改
```

调用 draw.io 脚本：

```bash
# draw.io XML → PNG（2x 清晰度）
python3 scripts/render_drawio.py --file diagram.drawio --output images/xxx.png --scale 2

# 强制使用 kroki.io（跳过 CLI 检测）
python3 scripts/render_drawio.py --file diagram.drawio --output images/xxx.svg --force-kroki

# 旧方案：mermaid/plantuml 通过 kroki.io 渲染
python3 scripts/render_diagram.py --type plantuml --file diagram.puml --output images/xxx.png
```

## 图表生成流程

1. 根据用户需求判断图表类型（见下方类型选择）
2. 生成 draw.io XML，写入临时 `.drawio` 文件
3. 调用 `render_drawio.py` 渲染为 SVG 或 PNG
4. 将图片保存到文档同级的 `images/` 目录
5. 在 Markdown 中插入 `![描述](images/文件名.svg)`

## 图表类型选择

| 场景         | 推荐格式    | 说明                       |
| ------------ | ----------- | -------------------------- |
| 业务流程图   | draw.io XML | 支持泳道、判断分支、子流程 |
| 系统架构图   | draw.io XML | 支持分组、容器、各种形状   |
| 泳道图       | draw.io XML | 多角色并行流程             |
| 数据库 ER 图 | draw.io XML | 实体关系、外键连线         |
| 时序图       | plantuml    | 消息交互更清晰             |
| 简单流程     | mermaid     | 代码简洁                   |

## draw.io XML 模板

### 基础流程图

```xml
<mxfile><diagram><mxGraphModel>
  <root>
    <mxCell id="0"/><mxCell id="1" parent="0"/>
    <!-- 开始节点（椭圆） -->
    <mxCell id="2" value="开始" style="ellipse;fillColor=#d5e8d4;strokeColor=#82b366;fontStyle=1;fontSize=13;" vertex="1" parent="1">
      <mxGeometry x="340" y="40" width="120" height="60" as="geometry"/>
    </mxCell>
    <!-- 步骤（圆角矩形） -->
    <mxCell id="3" value="步骤一" style="rounded=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=13;" vertex="1" parent="1">
      <mxGeometry x="300" y="160" width="200" height="60" as="geometry"/>
    </mxCell>
    <!-- 判断（菱形） -->
    <mxCell id="4" value="条件判断?" style="rhombus;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=12;" vertex="1" parent="1">
      <mxGeometry x="280" y="290" width="240" height="90" as="geometry"/>
    </mxCell>
    <!-- 结束节点（椭圆） -->
    <mxCell id="5" value="结束" style="ellipse;fillColor=#f8cecc;strokeColor=#b85450;fontStyle=1;fontSize=13;" vertex="1" parent="1">
      <mxGeometry x="340" y="460" width="120" height="60" as="geometry"/>
    </mxCell>
    <!-- 连接线 -->
    <mxCell id="6" style="edgeStyle=orthogonalEdgeStyle;endArrow=block;endFill=1;" edge="1" parent="1" source="2" target="3"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="7" style="edgeStyle=orthogonalEdgeStyle;endArrow=block;endFill=1;" edge="1" parent="1" source="3" target="4"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="8" value="是" style="edgeStyle=orthogonalEdgeStyle;endArrow=block;endFill=1;" edge="1" parent="1" source="4" target="5"><mxGeometry relative="1" as="geometry"/></mxCell>
  </root>
</mxGraphModel></diagram></mxfile>
```

### 泳道图

```xml
<mxfile><diagram><mxGraphModel>
  <root>
    <mxCell id="0"/><mxCell id="1" parent="0"/>
    <!-- 泳道1 -->
    <mxCell id="10" value="角色A" style="swimlane;startSize=30;fillColor=#dae8fc;strokeColor=#6c8ebf;fontStyle=1;" vertex="1" parent="1">
      <mxGeometry x="40" y="40" width="280" height="300" as="geometry"/>
    </mxCell>
    <!-- 泳道2 -->
    <mxCell id="11" value="角色B" style="swimlane;startSize=30;fillColor=#d5e8d4;strokeColor=#82b366;fontStyle=1;" vertex="1" parent="1">
      <mxGeometry x="360" y="40" width="280" height="300" as="geometry"/>
    </mxCell>
    <!-- 泳道内元素（parent 指向泳道 id） -->
    <mxCell id="20" value="步骤1" style="rounded=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="10">
      <mxGeometry x="40" y="60" width="200" height="50" as="geometry"/>
    </mxCell>
    <mxCell id="21" value="步骤2" style="rounded=1;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="11">
      <mxGeometry x="40" y="60" width="200" height="50" as="geometry"/>
    </mxCell>
    <!-- 跨泳道连线（parent 必须是 "1"，不是泳道） -->
    <mxCell id="30" style="edgeStyle=orthogonalEdgeStyle;endArrow=block;endFill=1;" edge="1" parent="1" source="20" target="21">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel></diagram></mxfile>
```

### 架构图（含分组容器）

```xml
<mxfile><diagram><mxGraphModel>
  <root>
    <mxCell id="0"/><mxCell id="1" parent="0"/>
    <!-- 分组容器 -->
    <mxCell id="10" value="前端层" style="swimlane;fillColor=#f5f5f5;strokeColor=#666666;fontStyle=1;startSize=30;" vertex="1" parent="1">
      <mxGeometry x="40" y="40" width="400" height="120" as="geometry"/>
    </mxCell>
    <!-- 容器内元素 -->
    <mxCell id="11" value="Web App" style="rounded=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="10">
      <mxGeometry x="30" y="50" width="140" height="50" as="geometry"/>
    </mxCell>
    <mxCell id="12" value="Mobile App" style="rounded=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="10">
      <mxGeometry x="230" y="50" width="140" height="50" as="geometry"/>
    </mxCell>
    <!-- 数据库（圆柱体） -->
    <mxCell id="20" value="MySQL" style="shape=cylinder;fillColor=#fff2cc;strokeColor=#d6b656;" vertex="1" parent="1">
      <mxGeometry x="180" y="240" width="120" height="80" as="geometry"/>
    </mxCell>
    <!-- 连接 -->
    <mxCell id="30" style="edgeStyle=orthogonalEdgeStyle;endArrow=block;endFill=1;" edge="1" parent="1" source="11" target="20">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel></diagram></mxfile>
```

## 常用形状 style 速查

```
圆角矩形：  rounded=1;fillColor=#dae8fc;strokeColor=#6c8ebf;
菱形判断：  rhombus;fillColor=#fff2cc;strokeColor=#d6b656;
椭圆开始：  ellipse;fillColor=#d5e8d4;strokeColor=#82b366;
椭圆结束：  ellipse;fillColor=#f8cecc;strokeColor=#b85450;
圆柱数据库：shape=cylinder;fillColor=#fff2cc;strokeColor=#d6b656;
云形：      shape=cloud;fillColor=#e1d5e7;strokeColor=#9673a6;
便签：      shape=note;fillColor=#ffffcc;strokeColor=#999900;
六边形：    shape=hexagon;fillColor=#f0a30a;strokeColor=#BD7000;
文档形：    shape=document;fillColor=#dae8fc;strokeColor=#6c8ebf;
```

## 连接线 style 速查

```
正交箭头（推荐）：edgeStyle=orthogonalEdgeStyle;endArrow=block;endFill=1;
曲线箭头：        curved=1;endArrow=block;endFill=1;
虚线箭头：        dashed=1;edgeStyle=orthogonalEdgeStyle;endArrow=open;
双向箭头：        edgeStyle=orthogonalEdgeStyle;startArrow=block;startFill=1;endArrow=block;endFill=1;
无箭头连线：      edgeStyle=orthogonalEdgeStyle;endArrow=none;
```

## 注意事项

- 所有 mxCell 必须是 `<root>` 的直接子元素（不能嵌套）
- 泳道内元素的 `parent` 指向泳道 id，跨泳道连线的 `parent` 必须是 `"1"`
- 每个 mxCell 的 `id` 必须唯一，从 `"2"` 开始（`"0"` 和 `"1"` 是保留根节点）
- 连接线的 `source`/`target` 引用对应 mxCell 的 `id`
- 图片统一保存到文档同级的 `images/` 目录，文件名用英文
