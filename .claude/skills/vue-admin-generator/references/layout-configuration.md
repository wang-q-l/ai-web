# 布局配置指南

## 布局类型

模板支持多种布局方式,默认为左右布局(侧边栏+内容区)。

### 1. 左右布局(默认)

当前 `src/layout/index.vue` 使用的布局结构:

```
┌─────────────────────────────┐
│  Logo                       │
├──────────┬──────────────────┤
│          │  Header          │
│  Sidebar ├──────────────────┤
│          │                  │
│          │  Main Content    │
│          │                  │
└──────────┴──────────────────┘
```

### 2. 顶部导航布局

修改 `src/layout/index.vue` 为顶部导航:

```vue
<template>
  <div class="layout-container">
    <el-container direction="vertical">
      <el-header class="top-header">
        <div class="logo">管理后台</div>
        <el-menu mode="horizontal" :default-active="activeMenu" router>
          <!-- 菜单项 -->
        </el-menu>
        <div class="user-info">...</div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>
```

### 3. 混合布局

顶部导航 + 左侧子菜单:

```
┌─────────────────────────────┐
│  Logo  │  Nav1  Nav2  Nav3  │
├──────────┬──────────────────┤
│          │                  │
│  SubMenu │  Main Content    │
│          │                  │
└──────────┴──────────────────┘
```

## 侧边栏宽度

在 `src/layout/index.vue` 中修改:

```vue
<el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar">
```

- 展开宽度: 修改 `'200px'` 为所需宽度
- 折叠宽度: 修改 `'64px'` 为所需宽度

## 头部高度

在 Element Plus 中,Header 默认高度为 60px,可通过 CSS 修改:

```css
.el-header {
  height: 60px !important;
}
```

## 固定头部/侧边栏

添加固定定位:

```css
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  overflow-y: auto;
}

.header {
  position: fixed;
  top: 0;
  right: 0;
  left: 200px; /* 侧边栏宽度 */
  z-index: 100;
}
```

## 面包屑导航

在 Header 中添加面包屑:

```vue
<el-breadcrumb separator="/">
  <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
  <el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item>
</el-breadcrumb>
```

## 标签页导航

添加多标签页功能,在 Header 下方插入:

```vue
<div class="tags-view">
  <el-tag
    v-for="tag in visitedViews"
    :key="tag.path"
    :closable="tag.path !== '/'"
    @close="closeTag(tag)"
    @click="router.push(tag.path)"
  >
    {{ tag.title }}
  </el-tag>
</div>
```
