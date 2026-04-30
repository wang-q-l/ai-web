---
name: page-generator
description: 多端页面生成器规范。根据项目类型（管理后台/Web前台/移动端）自动识别并提供对应的页面模版、布局规范、路由配置和样式指南。支持管理后台列表页、Web前台内容页、移动端列表/详情/表单页等常见页面类型。
---

# 页面生成器规范

本 skill 提供标准化的页面开发规范和模版，根据项目类型自动识别并提供对应的页面生成方案。

## 使用流程

### 步骤 1: 自动识别项目类型

**技能会自动识别当前项目类型，这决定了使用哪套页面模版和规范。**

识别规则：

1. **检查项目依赖（package.json）**：
   - 包含 `element-plus` + 有侧边栏布局组件 → **管理后台项目**
   - 包含 `element-plus` + 无侧边栏布局 → **Web 前台项目**
   - 包含 `vant` → **移动端项目**

2. **检查项目结构**：
   - 有 `src/components/core/layouts/art-sidebar-menu/` → **管理后台项目**
   - 有 `src/layout/` 且包含 Header/Footer 组件 → **Web 前台项目**
   - 有 Tabbar 相关组件 → **移动端项目**

3. **检查路由配置**：
   - 路由文件在 `src/router/modules/` 且有菜单配置 → **管理后台项目**
   - 路由文件简单扁平结构 → **Web 前台项目**

4. **询问用户确认**：
   - 如果无法自动识别，询问用户项目类型

### 步骤 2: 根据项目类型加载对应规范

识别出项目类型后，自动加载对应的规范文档：

- **管理后台项目** → 使用 `references/admin/` 下的规范和模版
- **Web 前台项目** → 使用 `references/web/` 下的规范和模版
- **移动端项目** → 使用 `references/mobile/` 下的规范和模版

---

## 项目类型说明

### 1. 管理后台项目

**特征：**

- Vue3 + Element Plus + TypeScript
- 侧边栏菜单 + 顶部栏布局
- 表格、表单、树形结构等数据管理功能
- 权限控制、路由守卫

**适用场景：**

- 后台管理系统
- CMS 内容管理
- 数据管理平台
- 企业内部系统

**参考文档：**

- [管理后台通用规范](references/admin/general-specs.md)
- [路由配置指南](references/admin/routing-guide.md)
- [样式规范](references/admin/styling-guide.md)
- [标准列表页模版](references/admin/template-list-page.md)
- [树形表格页模版](references/admin/template-tree-page.md)
- [二级页面模版](references/admin/template-secondary-page.md)
- [左右分栏布局模版](references/admin/template-split-layout.md)

---

### 2. Web 前台项目

**特征：**

- Vue3 + Element Plus + TypeScript
- Header + Footer 布局
- 响应式设计，支持移动端
- 内容展示、产品介绍、新闻列表

**适用场景：**

- 企业官网
- 产品官网
- 门户网站
- 营销页面

**参考文档：**

- [Web 前台通用规范](references/web/general-specs.md)
- [路由配置指南](references/web/routing-guide.md)
- [样式规范](references/web/styling-guide.md)
- [首页模版](references/web/template-home-page.md)
- [列表页模版](references/web/template-list-page.md)
- [详情页模版](references/web/template-detail-page.md)
- [表单页模版](references/web/template-form-page.md)

---

### 3. 移动端项目

**特征：**

- Vue3 + Vant + TypeScript
- NavBar + Tabbar 布局
- 触摸优化、下拉刷新、上拉加载
- 移动端交互体验

**适用场景：**

- H5 应用
- 移动端网站
- 小程序（H5 版本）
- 移动端商城

**参考文档：**

- [移动端通用规范](references/mobile/general-specs.md)
- [路由配置指南](references/mobile/routing-guide.md)
- [样式规范](references/mobile/styling-guide.md)
- [Tabbar 页面模版](references/mobile/template-tabbar-page.md)
- [列表页模版](references/mobile/template-list-page.md)
- [详情页模版](references/mobile/template-detail-page.md)
- [表单页模版](references/mobile/template-form-page.md)

---

## 核心设计原则

### 卡片式布局规范

**所有页面必须使用卡片式布局**，这是项目的核心设计规范。

**卡片默认样式：**

- **无边框**：`border: none !important;`
- **无阴影**：`box-shadow: none !important;`
- **圆角**：`border-radius: 12px`
- **背景色**：`background: #fff`

**重要提示：** 只有在特殊说明的情况下才添加投影和边框，默认情况下卡片保持简洁的无边框无投影样式。

### 结合项目实际情况

生成页面时必须：

1. **参考项目现有页面** - 查看项目中已有的页面实现，保持风格一致
2. **遵循项目规范** - 严格遵循项目的 CLAUDE.md 或其他规范文档
3. **使用项目组件** - 优先使用项目中已有的公共组件
4. **保持代码风格** - 与项目现有代码保持一致的命名和结构
5. **适配项目布局** - 根据项目的实际布局框架调整页面结构

---

## 工作流程

当用户请求生成页面时，按照以下流程执行：

### 1. 识别项目类型

```
检查 package.json 依赖
    ↓
检查项目目录结构
    ↓
检查路由配置方式
    ↓
确定项目类型（管理后台/Web前台/移动端）
```

### 2. 加载对应规范

根据识别出的项目类型，加载对应目录下的规范文档：

- **管理后台** → `references/admin/`
- **Web 前台** → `references/web/`
- **移动端** → `references/mobile/`

### 3. 选择页面模版

根据用户需求，选择合适的页面模版：

**管理后台：**

- 标准列表页（带筛选、表格、分页）
- 树形表格页（层级数据展示）
- 二级页面（详情、编辑页面）
- 左右分栏布局（树形导航 + 列表）

**Web 前台：**

- 首页（Banner + 产品展示 + 新闻动态）
- 列表页（产品列表、新闻列表）
- 详情页（产品详情、新闻详情）
- 表单页（联系我们、留言反馈）

**移动端：**

- Tabbar 页面（首页、分类、购物车、我的）
- 列表页（商品列表、订单列表）
- 详情页（商品详情、订单详情）
- 表单页（地址编辑、个人信息）

### 4. 生成页面代码

根据选择的模版和用户需求，生成完整的页面代码，包括：

- Vue 组件代码（template + script + style）
- 路由配置代码
- API 接口定义
- Mock 数据
- 类型定义

### 5. 验证代码

生成代码后，运行构建命令验证：

```bash
npm run build
```

确保代码符合规范，没有 TypeScript 错误。

---

## 通用注意事项

**所有项目类型：**

1. **开发完成后必须验证**：
   - 运行 `npm run build` 验证代码是否合规
   - 不要运行 `npm run dev`，由用户自行启动

2. **遵循项目规范**：
   - 严格遵循对应项目类型的布局规范
   - 使用项目已有的组件和样式
   - 保持代码风格一致

3. **组件使用**：
   - 管理后台：Element Plus 组件
   - Web 前台：Element Plus 组件 + 响应式布局
   - 移动端：Vant 组件

4. **代码质量**：
   - TypeScript 类型定义完整
   - 代码注释清晰
   - 变量命名规范

---

## 快速开始

### 示例 1: 生成管理后台列表页

```
用户：生成一个用户管理列表页

技能执行流程：
1. 识别项目类型 → 管理后台项目
2. 加载 references/admin/ 规范
3. 选择模版 → template-list-page.md
4. 生成代码：
   - src/views/user/index.vue
   - src/router/modules/user.ts
   - src/api/user.ts
   - src/mock/user.ts
   - src/types/user.ts
5. 验证构建 → npm run build
```

### 示例 2: 生成 Web 前台产品列表页

```
用户：生成一个产品列表页

技能执行流程：
1. 识别项目类型 → Web 前台项目
2. 加载 references/web/ 规范
3. 选择模版 → template-list-page.md
4. 生成代码：
   - src/views/products/index.vue
   - src/router/index.ts（添加路由）
   - src/api/products.ts
5. 验证构建 → npm run build
```

### 示例 3: 生成移动端商品列表页

```
用户：生成一个商品列表页

技能执行流程：
1. 识别项目类型 → 移动端项目
2. 加载 references/mobile/ 规范
3. 选择模版 → template-list-page.md
4. 生成代码：
   - src/views/goods/list.vue
   - src/router/index.ts（添加路由）
   - src/api/goods.ts
5. 验证构建 → npm run build
```

---

## 项目类型识别示例

### 当前项目识别

**检查依赖：**

```json
{
  "dependencies": {
    "vue": "^3.x",
    "element-plus": "^2.x",
    "pinia": "^2.x"
  }
}
```

**检查目录结构：**

```
src/
├── components/
│   └── core/
│       └── layouts/
│           └── art-sidebar-menu/  ← 有侧边栏菜单
├── router/
│   └── modules/                   ← 路由模块化
└── views/
```

**识别结果：** 管理后台项目

**加载规范：** `references/admin/`

---

## 总结

page-generator 技能通过自动识别项目类型，为不同端提供专门的页面生成方案：

- **管理后台** - 数据管理、表格、表单
- **Web 前台** - 内容展示、响应式布局
- **移动端** - 触摸优化、下拉刷新

每种项目类型都有独立的规范文档和页面模版，确保生成的代码符合对应端的开发规范。
