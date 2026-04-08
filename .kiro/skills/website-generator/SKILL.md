---
name: website-generator
description: 官网前台框架生成器。采用 Vue3 + Element Plus + Vite + TypeScript + Mock.js。用于快速创建完整的企业官网、产品官网等用户前台系统。使用场景：(1) 需要创建新的官网项目，(2) 用户描述了导航结构、页面类型（首页/产品/关于我们/新闻/联系我们等）、主题颜色等需求，(3) 用户提供官网设计稿，通过分析图片中的导航结构、配色方案、页面布局来生成官网，(4) 需要一个带 Mock 数据的前端项目（无需后端），(5) 快速搭建官网原型。
---

# 官网前台生成器

## 概述

根据用户描述的需求（导航结构、页面类型、主题颜色等）或提供的设计稿，快速生成一个完整的 Vue3 + Element Plus 官网前台项目，包含完整的项目结构、路由配置、Mock 数据，开箱即用。

**支持两种输入方式：**
1. 文字描述：用户直接描述需求
2. 设计稿：分析图片中的布局结构、配色方案、导航结构

## 工作流程

### 1. 收集需求信息

**支持两种方式提供需求：**

#### 方式一：文字描述

从用户描述中提取以下信息：

**必需信息：**
- 网站类型：企业官网 / 产品官网 / 个人网站 / 其他
- 功能列表：用户需要哪些功能页面（如：首页、产品展示、服务介绍、关于我们、新闻资讯、联系我们、用户中心等）
- 权限要求：哪些页面需要登录才能访问，哪些页面公开访问

**可选信息：**
- 主题色：默认 `#409eff`
- 导航栏背景色：默认 `#ffffff`
- 导航栏文字色：默认 `#333333`
- 页脚背景色：默认 `#2c3e50`
- 布局风格：简约 / 商务 / 科技 / 创意
- 其他自定义需求

**功能分类示例：**

1. **公开访问页面**（无需登录）：
   - 首页
   - 产品/服务介绍
   - 关于我们
   - 新闻资讯
   - 联系我们
   - 帮助中心

2. **需要登录的页面**：
   - 用户中心
   - 个人资料
   - 订单管理
   - 收藏夹
   - 消息通知
   - 账户设置

**询问用户的问题：**
1. "请描述您需要哪些功能页面？"
2. "哪些页面需要用户登录后才能访问？"
3. "是否需要用户注册/登录功能？"
4. "是否需要搜索功能？"
5. "是否需要多语言支持？"

#### 方式二：设计稿分析

**当用户提供设计稿时，需要分析以下内容：**

1. **布局结构分析：**
   - 识别整体布局方式（顶部导航 + 内容区 + 底部）
   - 确定各个区域的位置：
     - 顶部导航栏（Logo、菜单、搜索、语言切换等）
     - Banner 区域（首页轮播图、标题等）
     - 内容区域布局
     - 底部信息栏（公司信息、友情链接、版权等）

2. **颜色提取：**
   - 导航栏背景色
   - 导航栏文字颜色
   - 导航栏激活状态颜色
   - 主题色（按钮、链接等）
   - 页脚背景色
   - 页脚文字颜色
   - 内容区域背景色

3. **导航结构识别：**
   - 识别导航菜单项名称
   - 识别菜单层级（一级菜单 / 下拉菜单）
   - 识别特殊功能（搜索、语言切换、登录等）

4. **其他视觉元素：**
   - Logo 样式和位置
   - 圆角大小
   - 间距规范
   - 字体大小
   - 动画效果

**分析步骤：**
1. 仔细观察图片，识别布局结构
2. 使用取色工具或视觉估计提取主要颜色
3. 列出所有导航菜单项
4. 总结布局特点和配色方案
5. 向用户确认分析结果是否准确

**注意事项：**
- 页面内容区域的具体内容不需要实现，只需要创建基础页面结构
- 重点关注布局结构、配色方案、导航结构
- 如果图片不清晰或信息不完整，询问用户补充

如信息不完整，使用默认值或询问用户。

### 2. 复制模板项目

**重要：项目必须在当前工作目录直接创建，不要创建子目录！**

将 `assets/template/` 目录下的完整项目复制到当前工作目录：

```bash
cp -r assets/template/* ./
```

**注意事项：**
- 直接在当前目录创建项目文件，不要使用 `/path/to/new-project/` 这样的子目录
- 如果当前目录已有文件，先确认是否可以覆盖
- 项目创建后，所有文件应该与技能所在的 `.claude` 目录同级

模板包含：
- 完整的项目配置（package.json、vite.config.ts、tsconfig.json）
- 基础布局组件（导航栏、页脚、主布局）
- 路由配置（模块化路由）
- Mock 数据配置（src/mock.ts）
- 样式文件（包含 Element Plus 自定义样式）
- 组件目录结构（common、layout、business、page-templates）

### 3. 自定义配置

根据收集的需求信息，修改以下文件：

#### 3.1 主题色配置

修改 `src/styles/variables.css`：

```css
:root {
  /* 主题色 */
  --primary-color: #409eff;  /* 根据需求修改 */

  /* 导航栏 */
  --nav-bg-color: #ffffff;
  --nav-text-color: #333333;
  --nav-active-color: #409eff;

  /* 页脚 */
  --footer-bg-color: #2c3e50;
  --footer-text-color: #ffffff;
}
```

#### 3.2 路由配置

根据导航菜单，修改 `src/router/modules/` 下的路由文件：

```typescript
// src/router/modules/main.ts
import { RouteRecordRaw } from 'vue-router'

const mainRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/home/index.vue'),
    meta: { title: '首页' },
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('@/views/products/index.vue'),
    meta: { title: '产品中心' },
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/about/index.vue'),
    meta: { title: '关于我们' },
  },
  // 根据需求添加更多路由...
]

export default mainRoutes
```

#### 3.3 导航菜单配置

修改 `src/config/menu.ts`：

```typescript
export const menuConfig = [
  { name: '首页', path: '/' },
  { name: '产品中心', path: '/products' },
  { name: '解决方案', path: '/solutions' },
  { name: '关于我们', path: '/about' },
  { name: '新闻动态', path: '/news' },
  { name: '联系我们', path: '/contact' },
]
```

#### 3.4 网站信息配置

修改 `src/config/site.ts`：

```typescript
export const siteConfig = {
  name: '公司名称',
  logo: '/logo.png',
  description: '公司简介',
  keywords: 'SEO关键词',

  // 联系信息
  contact: {
    phone: '400-xxx-xxxx',
    email: 'contact@example.com',
    address: '公司地址',
  },

  // 社交媒体
  social: {
    wechat: '',
    weibo: '',
    linkedin: '',
  },
}
```

### 4. 创建页面文件

根据路由配置，在 `src/views/` 下创建对应的页面文件：

```bash
# 创建页面目录
mkdir -p src/views/{home,products,about,news,contact}

# 创建页面文件
touch src/views/home/index.vue
touch src/views/products/index.vue
touch src/views/about/index.vue
touch src/views/news/index.vue
touch src/views/contact/index.vue
```

每个页面使用统一的模板结构：

```vue
<template>
  <div class="page-container">
    <h1>{{ title }}</h1>
    <p>页面内容待完善</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const title = ref('页面标题')
</script>

<style scoped>
.page-container {
  padding: 40px 20px;
  min-height: 500px;
}
</style>
```

### 5. 安装依赖并启动

项目创建完成后，按以下顺序执行命令：

**步骤 1: 安装依赖**
```bash
cd /path/to/new-project
npm install
```

**步骤 2: 验证构建（重要！）**
```bash
npm run build
```

这一步非常重要，可以提前发现：
- TypeScript 类型错误
- 导入路径错误
- 语法错误
- 配置问题

**如果构建失败：**
1. 根据错误信息修复问题
2. 再次运行 `npm run build` 验证
3. 重复此过程直到构建成功

只有构建成功后，才进行下一步。

**步骤 3: 启动开发服务器**
```bash
npm run dev
```

## 技术栈

- **Vue 3.4+**：使用 Composition API 和 `<script setup>`
- **Element Plus**：UI 组件库
- **Vite 5.0+**：构建工具
- **TypeScript**：类型安全
- **Vue Router 4.x**：路由管理
- **Pinia**：状态管理
- **Axios**：HTTP 请求
- **Mock.js**：模拟数据

## 项目结构

```
project/
├── public/              # 静态资源
│   └── logo.png
├── src/
│   ├── assets/          # 资源文件
│   │   ├── images/
│   │   └── styles/
│   ├── components/      # 组件
│   │   ├── common/      # 通用组件
│   │   ├── layout/      # 布局组件
│   │   ├── business/    # 业务组件
│   │   └── page-templates/  # 页面模板
│   ├── config/          # 配置文件
│   │   ├── menu.ts      # 菜单配置
│   │   └── site.ts      # 网站配置
│   ├── layout/          # 布局
│   │   ├── Header.vue   # 导航栏
│   │   ├── Footer.vue   # 页脚
│   │   └── MainLayout.vue  # 主布局
│   ├── router/          # 路由
│   │   ├── index.ts
│   │   └── modules/     # 路由模块
│   ├── stores/          # 状态管理
│   ├── styles/          # 样式
│   │   ├── variables.css
│   │   └── main.css
│   ├── utils/           # 工具函数
│   ├── views/           # 页面
│   │   ├── home/        # 首页
│   │   ├── products/    # 产品页
│   │   ├── about/       # 关于我们
│   │   ├── news/        # 新闻动态
│   │   └── contact/     # 联系我们
│   ├── App.vue
│   └── main.ts
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 默认页面

生成的项目默认包含以下页面：

1. **首页（Home）**：Banner + 产品展示 + 公司介绍
2. **产品中心（Products）**：产品列表 + 筛选
3. **关于我们（About）**：公司介绍 + 团队介绍
4. **新闻动态（News）**：新闻列表 + 详情
5. **联系我们（Contact）**：联系方式 + 留言表单

## 特性

- ✅ 响应式设计，支持移动端
- ✅ SEO 友好
- ✅ 路由模块化管理
- ✅ 组件模块化组织
- ✅ TypeScript 类型安全
- ✅ Mock 数据支持
- ✅ Element Plus 主题定制
- ✅ Element Plus 滚动条（替代原生滚动条，统一视觉风格）
- ✅ 代码规范（ESLint + Prettier）

## 注意事项

1. **页面内容**：生成的页面只包含基础结构，具体内容需要根据实际需求填充
2. **图片资源**：需要用户提供 Logo 和其他图片资源
3. **Mock 数据**：默认提供示例数据，需要根据实际接口调整
4. **SEO 优化**：需要配置 meta 标签和 sitemap
5. **性能优化**：大型项目需要考虑懒加载和代码分割

## 参考文档

生成项目后，可以参考以下文档：

- `references/layout-configuration.md` - 布局配置指南
- `references/theme-customization.md` - 主题定制指南
- `references/router-configuration.md` - 路由配置指南
- `references/component-organization.md` - 组件组织规范
- `references/seo-optimization.md` - SEO 优化指南

## 示例

### 示例 1：企业官网

```
需求：
- 网站类型：企业官网
- 导航菜单：首页、产品中心、解决方案、关于我们、新闻动态、联系我们
- 主题色：#1890ff
- 风格：商务简约
```

### 示例 2：产品官网

```
需求：
- 网站类型：产品官网
- 导航菜单：首页、产品特性、定价、文档、博客、登录
- 主题色：#52c41a
- 风格：科技感
```

## 常见问题

### Q: 如何添加新页面？

A:
1. 在 `src/views/` 下创建新页面目录和文件
2. 在 `src/router/modules/` 中添加路由配置
3. 在 `src/config/menu.ts` 中添加菜单项

### Q: 如何修改主题色？

A: 修改 `src/styles/variables.css` 中的 CSS 变量

### Q: 如何自定义导航栏？

A: 修改 `src/layout/Header.vue` 组件

### Q: 如何添加多语言支持？

A: 需要集成 vue-i18n 插件，参考官方文档配置
