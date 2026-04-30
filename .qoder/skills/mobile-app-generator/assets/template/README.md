# 移动端应用

基于 Vue 3 + Vant + Vite + TypeScript + Mock.js 的移动端 H5 应用框架。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vant 4** - 轻量、可靠的移动端组件库
- **Vite** - 下一代前端构建工具
- **TypeScript** - JavaScript 的超集
- **Pinia** - Vue 状态管理库
- **Vue Router** - Vue 官方路由
- **Axios** - HTTP 客户端
- **Mock.js** - 模拟数据生成器
- **postcss-px-to-viewport** - 移动端适配方案

## 功能特性

- ✅ 底部 Tabbar 导航
- ✅ 移动端 Viewport 适配
- ✅ 亮色/暗色主题切换
- ✅ 下拉刷新 + 上拉加载
- ✅ 路由过渡动画
- ✅ Mock 数据支持
- ✅ TypeScript 类型支持
- ✅ 页面模板（列表/表单/详情/搜索）
- ✅ 移动端登录页

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
src/
├── api/                  # API 接口
├── assets/               # 静态资源
├── components/           # 页面模板组件
│   ├── ListPage.vue      # 列表页模板
│   ├── FormPage.vue      # 表单页模板
│   ├── DetailPage.vue    # 详情页模板
│   └── SearchPage.vue    # 搜索页模板
├── composables/          # 组合式函数
│   ├── useList.ts        # 列表逻辑复用
│   └── useTheme.ts       # 主题切换
├── layout/               # 布局组件
│   └── TabbarLayout.vue  # 底部导航布局
├── router/               # 路由配置
├── styles/               # 样式文件
│   ├── index.css         # 全局样式
│   ├── variables.css     # CSS 变量
│   └── vant-custom.css   # Vant 定制
├── utils/                # 工具函数
│   └── request.ts        # 请求封装
├── views/                # 页面组件
│   ├── login/            # 登录页
│   ├── home/             # 首页
│   ├── category/         # 分类页
│   ├── cart/             # 购物车
│   └── profile/          # 我的
├── App.vue               # 根组件
└── main.ts               # 应用入口
```

## 配置说明

### 主题定制

修改 `src/styles/variables.css` 中的 CSS 变量：

```css
:root {
  --primary-color: #1989fa; /* 主题色 */
  --success-color: #07c160; /* 成功色 */
  --warning-color: #ff976a; /* 警告色 */
  --danger-color: #ee0a24; /* 危险色 */
}
```

### Tabbar 配置

在 `src/router/index.ts` 中配置底部导航：

```typescript
{
  path: 'home',
  name: 'Home',
  component: () => import('@/views/home/index.vue'),
  meta: {
    title: '首页',
    icon: 'home-o',      // Vant 图标
    tabbar: true,        // 显示在 Tabbar
    badge: 0,            // 徽标数量（可选）
  },
}
```

### Viewport 适配

修改 `postcss.config.js` 中的配置：

```javascript
{
  viewportWidth: 375,  // 设计稿宽度
  viewportUnit: 'vw',  // 转换单位
  selectorBlackList: ['.ignore', '.hairlines'],  // 不转换的类名
}
```

### Mock 数据

在 `mock/` 目录下创建 Mock 文件：

```typescript
export default [
  {
    url: '/api/example',
    method: 'get',
    response: () => ({
      code: 200,
      data: { ... },
      message: 'success',
    }),
  },
]
```

## 页面模板使用

### 列表页模板

```vue
<template>
  <ListPage title="列表页" :show-back="true" />
</template>

<script setup lang="ts">
  import ListPage from '@/components/ListPage.vue'
</script>
```

### 表单页模板

```vue
<template>
  <FormPage title="表单页" />
</template>

<script setup lang="ts">
  import FormPage from '@/components/FormPage.vue'
</script>
```

### 详情页模板

```vue
<template>
  <DetailPage title="详情页" />
</template>

<script setup lang="ts">
  import DetailPage from '@/components/DetailPage.vue'
</script>
```

### 搜索页模板

```vue
<template>
  <SearchPage />
</template>

<script setup lang="ts">
  import SearchPage from '@/components/SearchPage.vue'
</script>
```

## Composables 使用

### useList - 列表逻辑复用

```vue
<script setup lang="ts">
  import { useList } from '@/composables/useList'

  const { list, loading, finished, refreshing, onLoad, onRefresh } = useList({
    fetchApi: '/api/products/list',
    pageSize: 10
  })
</script>
```

### useTheme - 主题切换

```vue
<script setup lang="ts">
  import { useTheme } from '@/composables/useTheme'

  const { theme, toggleTheme } = useTheme()
</script>
```

## 常见问题

### 如何添加新的 Tabbar 页面？

1. 在 `src/views/` 下创建新页面组件
2. 在 `src/router/index.ts` 中添加路由配置
3. 设置 `meta.tabbar: true`

### 如何修改主题颜色？

修改 `src/styles/variables.css` 中的 CSS 变量即可。

### 如何禁用某些元素的 px 转换？

在元素上添加 `.ignore` 类名，或在 `postcss.config.js` 的 `selectorBlackList` 中添加类名。

### 如何使用真实 API？

1. 修改 `src/utils/request.ts` 中的 `baseURL`
2. 删除或禁用 `vite.config.ts` 中的 Mock 插件
3. 修改 API 调用代码

## 浏览器支持

- 现代浏览器
- iOS Safari 10+
- Android Chrome 4.4+

## 许可证

MIT
