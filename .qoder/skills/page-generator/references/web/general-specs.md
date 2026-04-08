# Web 前台项目通用规范

本文档定义 Web 前台项目的通用开发规范，适用于企业官网、产品官网、门户网站等前台展示类项目。

## 技术栈

### 核心框架
- **Vue 3.x** - 使用 Composition API（`<script setup>`）
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Vue Router** - 路由管理
- **Pinia** - 状态管理

### UI 组件库
- **Element Plus** - 主要 UI 组件库
- 使用组件：Card、Carousel、Timeline、Pagination、Form、Button 等

### 工具库
- **VueUse** - Vue 组合式工具库
- **Axios** - HTTP 请求
- **Day.js** - 日期处理

## 项目结构

```
src/
├── assets/              # 静态资源
│   ├── images/         # 图片资源
│   ├── styles/         # 全局样式
│   └── fonts/          # 字体文件
├── components/          # 公共组件
│   ├── common/         # 通用组件（Header、Footer、Breadcrumb）
│   └── business/       # 业务组件
├── views/              # 页面组件
│   ├── home/           # 首页
│   ├── products/       # 产品相关
│   ├── news/           # 新闻相关
│   ├── about/          # 关于我们
│   └── contact/        # 联系我们
├── router/             # 路由配置
├── api/                # API 接口
├── utils/              # 工具函数
└── types/              # TypeScript 类型定义
```

## 布局规范

### 1. 整体布局结构

```vue
<template>
  <div class="app-container">
    <!-- 顶部导航 -->
    <AppHeader />

    <!-- 主内容区 -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- 底部 -->
    <AppFooter />
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}
</style>
```

### 2. Container 容器规范

所有内容区域使用 Container 容器包裹，确保内容居中且有合适的最大宽度：

```vue
<template>
  <div class="page-section">
    <div class="container">
      <!-- 页面内容 -->
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }
}
</style>
```

### 3. 响应式布局

使用 Element Plus 的栅格系统实现响应式布局：

```vue
<el-row :gutter="24">
  <el-col :xs="24" :sm="12" :md="8" :lg="6">
    <!-- 内容 -->
  </el-col>
</el-row>
```

**断点说明：**
- `xs` - <768px（手机）
- `sm` - ≥768px（平板）
- `md` - ≥992px（小屏电脑）
- `lg` - ≥1200px（大屏电脑）

## 样式规范

### 1. 颜色规范

```scss
// 主色调
$primary-color: #409EFF;
$success-color: #67C23A;
$warning-color: #E6A23C;
$danger-color: #F56C6C;
$info-color: #909399;

// 文字颜色
$text-primary: #303133;
$text-regular: #606266;
$text-secondary: #909399;
$text-placeholder: #C0C4CC;

// 边框颜色
$border-base: #DCDFE6;
$border-light: #E4E7ED;
$border-lighter: #EBEEF5;

// 背景颜色
$bg-white: #FFFFFF;
$bg-light: #F5F7FA;
$bg-lighter: #FAFAFA;
```

### 2. 间距规范

```scss
// 统一使用 8px 基准间距
$spacing-xs: 8px;
$spacing-sm: 16px;
$spacing-md: 24px;
$spacing-lg: 32px;
$spacing-xl: 48px;
$spacing-xxl: 64px;
```

### 3. 字体规范

```scss
// 字体大小
$font-size-xs: 12px;
$font-size-sm: 14px;
$font-size-base: 16px;
$font-size-lg: 18px;
$font-size-xl: 20px;
$font-size-xxl: 24px;

// 标题字体大小
$h1-font-size: 32px;
$h2-font-size: 28px;
$h3-font-size: 24px;
$h4-font-size: 20px;
$h5-font-size: 18px;
$h6-font-size: 16px;

// 字体粗细
$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-bold: 700;
```

### 4. 圆角规范

```scss
$border-radius-sm: 4px;
$border-radius-base: 8px;
$border-radius-lg: 12px;
$border-radius-xl: 16px;
```

### 5. 阴影规范

```scss
$box-shadow-light: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
$box-shadow-base: 0 2px 16px 0 rgba(0, 0, 0, 0.12);
$box-shadow-dark: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
```

## 组件使用规范

### 1. Header 组件

```vue
<template>
  <header class="app-header">
    <div class="container">
      <div class="header-content">
        <!-- Logo -->
        <div class="logo">
          <img src="@/assets/images/logo.png" alt="Logo" />
          <span class="site-name">网站名称</span>
        </div>

        <!-- 导航菜单 -->
        <nav class="nav-menu">
          <router-link to="/" class="nav-item">首页</router-link>
          <router-link to="/products" class="nav-item">产品中心</router-link>
          <router-link to="/news" class="nav-item">新闻动态</router-link>
          <router-link to="/about" class="nav-item">关于我们</router-link>
          <router-link to="/contact" class="nav-item">联系我们</router-link>
        </nav>

        <!-- 移动端菜单按钮 -->
        <el-button class="mobile-menu-btn" @click="toggleMobileMenu">
          <el-icon><Menu /></el-icon>
        </el-button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo img {
  height: 40px;
}

.nav-menu {
  display: flex;
  gap: 32px;
}

.nav-item {
  color: #606266;
  text-decoration: none;
  font-size: 16px;
  transition: color 0.3s;
}

.nav-item:hover,
.nav-item.router-link-active {
  color: #409EFF;
}

.mobile-menu-btn {
  display: none;
}

@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }

  .mobile-menu-btn {
    display: block;
  }
}
</style>
```

### 2. Footer 组件

```vue
<template>
  <footer class="app-footer">
    <div class="container">
      <div class="footer-content">
        <el-row :gutter="32">
          <el-col :xs="24" :sm="12" :md="6">
            <h4>关于我们</h4>
            <p>公司简介内容...</p>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <h4>产品服务</h4>
            <ul>
              <li><a href="#">产品1</a></li>
              <li><a href="#">产品2</a></li>
            </ul>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <h4>联系方式</h4>
            <p>电话：xxx-xxxx-xxxx</p>
            <p>邮箱：xxx@example.com</p>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <h4>关注我们</h4>
            <!-- 社交媒体图标 -->
          </el-col>
        </el-row>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2024 公司名称. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background: #2c3e50;
  color: #fff;
  padding: 48px 0 24px;
}

.footer-content {
  margin-bottom: 32px;
}

.footer-content h4 {
  margin-bottom: 16px;
  font-size: 18px;
}

.footer-content ul {
  list-style: none;
  padding: 0;
}

.footer-content li {
  margin-bottom: 8px;
}

.footer-content a {
  color: #bdc3c7;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-content a:hover {
  color: #fff;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 24px;
  text-align: center;
  color: #95a5a6;
}
</style>
```

### 3. 面包屑组件

```vue
<template>
  <div class="breadcrumb-wrapper">
    <div class="container">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item
          v-for="item in breadcrumbs"
          :key="item.path"
          :to="item.path ? { path: item.path } : undefined"
        >
          {{ item.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
  </div>
</template>

<style scoped>
.breadcrumb-wrapper {
  background: #f5f7fa;
  padding: 16px 0;
}
</style>
```

## 图片优化

### 1. 图片懒加载

使用 VueUse 的 `useIntersectionObserver` 实现图片懒加载：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

const imgRef = ref<HTMLImageElement>()
const isVisible = ref(false)

useIntersectionObserver(
  imgRef,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      isVisible.value = true
    }
  }
)
</script>

<template>
  <img
    ref="imgRef"
    :src="isVisible ? actualSrc : placeholderSrc"
    alt="图片描述"
  />
</template>
```

### 2. 图片尺寸规范

```
Banner 图：1920x600px
产品缩略图：400x300px
新闻缩略图：360x240px
详情页图片：最大宽度 800px
```

## SEO 优化

### 1. 页面标题和描述

```typescript
// 在路由配置中定义
{
  path: '/products',
  component: () => import('@/views/products/index.vue'),
  meta: {
    title: '产品中心 - 网站名称',
    description: '产品描述...',
    keywords: '关键词1, 关键词2'
  }
}

// 在路由守卫中设置
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title as string
  }
  next()
})
```

### 2. 语义化 HTML

使用语义化标签：

```html
<header>  <!-- 页头 -->
<nav>     <!-- 导航 -->
<main>    <!-- 主内容 -->
<article> <!-- 文章 -->
<section> <!-- 章节 -->
<aside>   <!-- 侧边栏 -->
<footer>  <!-- 页脚 -->
```

## 性能优化

### 1. 路由懒加载

```typescript
const routes = [
  {
    path: '/products',
    component: () => import('@/views/products/index.vue')
  }
]
```

### 2. 组件懒加载

```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const HeavyComponent = defineAsyncComponent(() =>
  import('@/components/HeavyComponent.vue')
)
</script>
```

### 3. 图片压缩

- 使用 WebP 格式
- 提供多种尺寸的图片
- 使用 CDN 加速

## 开发规范

### 1. 组件命名

- 页面组件：大驼峰命名（ProductList.vue）
- 公共组件：大驼峰命名（AppHeader.vue）
- 业务组件：大驼峰命名（ProductCard.vue）

### 2. 文件组织

```
views/products/
├── index.vue           # 产品列表页
├── detail.vue          # 产品详情页
├── components/         # 页面专用组件
│   └── ProductCard.vue
└── types.ts            # 类型定义
```

### 3. 代码风格

- 使用 `<script setup>` 语法
- 使用 TypeScript 类型定义
- 使用 Composition API
- 遵循 ESLint 规则

## 常见页面类型

1. **首页** - Banner + 产品展示 + 新闻动态 + 合作伙伴
2. **列表页** - 面包屑 + 筛选 + 卡片列表 + 分页
3. **详情页** - 面包屑 + 标题 + 内容 + 相关推荐
4. **表单页** - 面包屑 + 表单 + 提交按钮

每种页面类型都有对应的模版文件，详见各模版文档。
