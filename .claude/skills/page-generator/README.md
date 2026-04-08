# Page Generator 技能优化说明

## 优化内容

### 1. 目录结构重组

按照端分类重新组织了目录结构：

```
.claude/skills/page-generator/
├── SKILL.md                          # 主入口文件
├── README.md                         # 本说明文档
└── references/
    ├── admin/                        # 管理后台相关
    │   ├── general-specs.md          # 通用规范
    │   ├── routing-guide.md          # 路由配置
    │   ├── styling-guide.md          # 样式规范
    │   ├── template-list-page.md     # 列表页模版
    │   ├── template-tree-page.md     # 树形表格页模版
    │   ├── template-secondary-page.md # 二级页面模版
    │   └── template-split-layout.md  # 分栏布局模版
    ├── web/                          # Web 前台相关
    │   ├── general-specs.md          # 通用规范
    │   ├── routing-guide.md          # 路由配置
    │   ├── styling-guide.md          # 样式规范
    │   ├── template-home-page.md     # 首页模版
    │   ├── template-list-page.md     # 列表页模版
    │   ├── template-detail-page.md   # 详情页模版
    │   └── template-form-page.md     # 表单页模版
    └── mobile/                       # 移动端相关
        ├── general-specs.md          # 通用规范
        ├── routing-guide.md          # 路由配置
        ├── styling-guide.md          # 样式规范
        ├── template-tabbar-page.md   # Tabbar 页面模版
        ├── template-list-page.md     # 列表页模版
        ├── template-detail-page.md   # 详情页模版
        └── template-form-page.md     # 表单页模版
```

### 2. 核心设计原则

在所有规范文档中强调了**卡片式布局**的核心设计原则：

**卡片默认样式：**

- **无边框**：`border: none !important;`
- **无阴影**：`box-shadow: none !important;`
- **圆角**：`border-radius: 12px`
- **背景色**：`background: #fff`

**重要提示：** 只有在特殊说明的情况下才添加投影和边框。

### 3. 结合项目实际情况

在主 SKILL.md 中添加了"结合项目实际情况"的说明：

1. **参考项目现有页面** - 查看项目中已有的页面实现，保持风格一致
2. **遵循项目规范** - 严格遵循项目的 CLAUDE.md 或其他规范文档
3. **使用项目组件** - 优先使用项目中已有的公共组件
4. **保持代码风格** - 与项目现有代码保持一致的命名和结构
5. **适配项目布局** - 根据项目的实际布局框架调整页面结构

### 4. 自动识别项目类型

技能会自动识别当前项目类型（管理后台/Web前台/移动端），并加载对应的规范和模版。

识别规则：

1. 检查 package.json 依赖
2. 检查项目目录结构
3. 检查路由配置方式
4. 询问用户确认（如果无法自动识别）

## 使用方式

### 调用技能

```
/page-generator
```

或直接描述需求：

```
生成一个用户管理列表页
```

### 工作流程

1. **自动识别项目类型** → 管理后台/Web前台/移动端
2. **加载对应规范** → references/admin/ 或 web/ 或 mobile/
3. **选择页面模版** → 根据需求选择合适的模版
4. **生成页面代码** → 包含 Vue 组件、路由、API、Mock、类型定义
5. **验证代码** → 运行 npm run build 验证

## 优化效果

1. **规范分类清晰** - 三种端的规范完全分离，不会混淆
2. **卡片式布局统一** - 所有端都强调卡片式布局，默认无边框无投影
3. **结合项目实际** - 生成页面时会参考项目现有代码，保持风格一致
4. **自动识别类型** - 无需手动指定项目类型，技能自动识别
5. **易于维护** - 目录结构清晰，后续添加新模版很方便

## 后续工作

以下模版文件已创建占位，后续可根据需要补充完整内容：

**Web 前台：**

- template-list-page.md
- template-detail-page.md
- template-form-page.md

**移动端：**

- template-tabbar-page.md
- template-list-page.md
- template-detail-page.md
- template-form-page.md

## 注意事项

1. 生成页面时必须遵循卡片式布局规范
2. 卡片默认无边框无投影，除非特殊说明
3. 必须参考项目现有页面，保持风格一致
4. 生成代码后必须运行 npm run build 验证
