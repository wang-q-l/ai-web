# 移动端项目通用规范

本文档定义移动端项目的通用开发规范，适用于 H5 应用、移动端网站等。

## 技术栈

### 核心框架

- **Vue 3.x** - 使用 Composition API（`<script setup>`）
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Vue Router** - 路由管理
- **Pinia** - 状态管理

### UI 组件库

- **Vant 4.x** - 移动端 UI 组件库
- 按需引入组件

## 核心设计原则

### 卡片式布局

**所有页面内容区域使用卡片式布局**。

**卡片默认样式：**

- **无边框**：`border: none`
- **无阴影**：`box-shadow: none`
- **圆角**：`border-radius: 12px`
- **背景色**：`background: #fff`

**重要提示：** 只有在特殊说明的情况下才添加投影和边框。

## 布局规范

### 1. 页面结构

```vue
<template>
  <div class="page-container">
    <!-- 导航栏 -->
    <van-nav-bar title="页面标题" left-arrow @click-left="onBack" />

    <!-- 内容区 -->
    <div class="page-content">
      <!-- 页面内容 -->
    </div>
  </div>
</template>

<style scoped>
  .page-container {
    min-height: 100vh;
    background: #f5f7fa;
  }

  .page-content {
    padding: 16px;
  }
</style>
```

### 2. 列表页结构

```vue
<template>
  <div class="list-page">
    <van-nav-bar title="列表" left-arrow @click-left="onBack" />

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div class="list-item" v-for="item in list" :key="item.id">
          <!-- 列表项内容 -->
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>
```

## 样式规范

### 1. 间距规范

```scss
$spacing-xs: 8px;
$spacing-sm: 12px;
$spacing-md: 16px;
$spacing-lg: 20px;
$spacing-xl: 24px;
```

### 2. 字体规范

```scss
$font-size-xs: 12px;
$font-size-sm: 14px;
$font-size-base: 16px;
$font-size-lg: 18px;
$font-size-xl: 20px;
```

### 3. 颜色规范

```scss
$primary-color: #1989fa;
$success-color: #07c160;
$warning-color: #ff976a;
$danger-color: #ee0a24;
```

## 常见页面类型

1. **列表页** - NavBar + 下拉刷新 + 上拉加载
2. **详情页** - NavBar + 内容区 + 底部操作栏
3. **表单页** - NavBar + 表单 + 提交按钮
4. **Tabbar 页面** - 底部导航栏 + 内容区
