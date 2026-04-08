# 路由配置指南

本文档介绍移动端应用的路由配置、模块化管理、过渡动画和路由守卫。

## 路由模块化结构

### 目录结构

```
src/router/
├── index.ts          # 主路由文件，导入所有模块
└── modules/          # 路由模块目录
    ├── base.ts       # 基础路由（登录等）
    ├── tabbar.ts     # Tabbar 路由
    └── ...           # 其他业务模块路由
```

### 主路由文件 (index.ts)

```typescript
/**
 * 路由配置主文件
 * 自动导入 modules 目录下的所有路由模块
 */

import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

// 导入路由模块
import baseRoutes from './modules/base'
import tabbarRoutes from './modules/tabbar'

// 合并所有路由
const routes: RouteRecordRaw[] = [
  ...baseRoutes,
  tabbarRoutes,
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
```

### 基础路由模块 (modules/base.ts)

```typescript
/**
 * 基础路由模块
 * 包含登录等不需要布局的页面
 */

import { RouteRecordRaw } from 'vue-router'

const baseRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' },
  },
]

export default baseRoutes
```

### Tabbar 路由模块 (modules/tabbar.ts)

```typescript
/**
 * Tabbar 路由模块
 * 包含底部导航栏的所有页面
 */

import { RouteRecordRaw } from 'vue-router'

const tabbarRoutes: RouteRecordRaw = {
  path: '/',
  component: () => import('@/layout/TabbarLayout.vue'),
  redirect: '/home',
  children: [
    {
      path: 'home',
      name: 'Home',
      component: () => import('@/views/home/index.vue'),
      meta: { title: '首页', icon: 'home-o', tabbar: true },
    },
    // 更多 Tabbar 页面...
  ],
}

export default tabbarRoutes
```

### 添加新的路由模块

1. 在 `src/router/modules/` 下创建新文件，如 `user.ts`
2. 定义路由配置并导出
3. 在 `index.ts` 中导入并合并到 routes 数组

```typescript
// modules/user.ts
import { RouteRecordRaw } from 'vue-router'

const userRoutes: RouteRecordRaw[] = [
  {
    path: '/user/profile',
    name: 'UserProfile',
    component: () => import('@/views/user/profile.vue'),
    meta: { title: '个人资料' },
  },
]

export default userRoutes

// index.ts
import userRoutes from './modules/user'

const routes: RouteRecordRaw[] = [
  ...baseRoutes,
  tabbarRoutes,
  ...userRoutes,  // 添加新模块
]
```

## 路由结构

### 基本结构

```typescript
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  // 登录页（独立路由）
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' },
  },
  // Tabbar 路由（嵌套路由）
  {
    path: '/',
    component: () => import('@/layout/TabbarLayout.vue'),
    redirect: '/home',
    children: [
      // Tabbar 页面
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/home/index.vue'),
        meta: { title: '首页', icon: 'home-o', tabbar: true },
      },
      // 二级页面（不显示 Tabbar）
      {
        path: 'detail/:id',
        name: 'Detail',
        component: () => import('@/views/detail/index.vue'),
        meta: { title: '详情', tabbar: false },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
```

## 路由 Meta 字段

### 常用字段

```typescript
meta: {
  title: '页面标题',        // 页面标题
  icon: 'home-o',          // Tabbar 图标
  tabbar: true,            // 是否显示 Tabbar
  badge: 0,                // Tabbar 徽标
  transition: 'slide-left', // 过渡动画
  requiresAuth: true,      // 是否需要登录
  keepAlive: true,         // 是否缓存页面
}
```

## 路由过渡动画

### 配置动画

在 `src/App.vue` 中：

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="route.meta.transition || 'slide-left'" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<style>
/* 左滑动画（前进） */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* 右滑动画（后退） */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

### 动态设置动画

根据路由层级自动设置动画：

```typescript
router.beforeEach((to, from, next) => {
  const toDepth = to.path.split('/').length
  const fromDepth = from.path.split('/').length

  if (toDepth > fromDepth) {
    to.meta.transition = 'slide-left'  // 前进
  } else {
    to.meta.transition = 'slide-right' // 后退
  }

  next()
})
```

## 路由守卫

### 登录验证

```typescript
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  // 需要登录的页面
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})
```

### 页面标题

```typescript
router.afterEach((to) => {
  document.title = (to.meta.title as string) || '移动端应用'
})
```

### 完整示例

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import { showToast } from 'vant'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 1. 登录验证
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    showToast('请先登录')
    next('/login')
    return
  }

  // 2. 设置过渡动画
  const toDepth = to.path.split('/').length
  const fromDepth = from.path.split('/').length
  to.meta.transition = toDepth > fromDepth ? 'slide-left' : 'slide-right'

  next()
})

// 全局后置守卫
router.afterEach((to) => {
  // 设置页面标题
  document.title = (to.meta.title as string) || '移动端应用'
})

export default router
```

## 页面缓存（Keep-Alive）

### 配置缓存

在 `src/App.vue` 中：

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="route.meta.transition || 'slide-left'" mode="out-in">
      <keep-alive :include="cachedViews">
        <component :is="Component" :key="route.path" />
      </keep-alive>
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 需要缓存的页面
const cachedViews = computed(() => {
  return router.getRoutes()
    .filter(route => route.meta.keepAlive)
    .map(route => route.name as string)
})
</script>
```

### 路由配置

```typescript
{
  path: 'home',
  name: 'Home',
  component: () => import('@/views/home/index.vue'),
  meta: {
    title: '首页',
    keepAlive: true,  // 缓存此页面
  },
}
```

### 清除缓存

在组件中：

```vue
<script setup lang="ts">
import { onActivated, onDeactivated } from 'vue'

// 页面激活时
onActivated(() => {
  console.log('页面激活')
  // 刷新数据
})

// 页面失活时
onDeactivated(() => {
  console.log('页面失活')
})
</script>
```

## 路由传参

### 动态路由参数

```typescript
// 路由配置
{
  path: 'detail/:id',
  name: 'Detail',
  component: () => import('@/views/detail/index.vue'),
}

// 跳转
router.push(`/detail/${id}`)

// 获取参数
const route = useRoute()
const id = route.params.id
```

### Query 参数

```typescript
// 跳转
router.push({
  path: '/detail',
  query: { id: 1, type: 'product' }
})

// 获取参数
const route = useRoute()
const id = route.query.id
const type = route.query.type
```

### Props 传参

```typescript
// 路由配置
{
  path: 'detail/:id',
  name: 'Detail',
  component: () => import('@/views/detail/index.vue'),
  props: true,  // 将 params 作为 props 传递
}

// 组件中接收
<script setup lang="ts">
interface Props {
  id: string
}

const props = defineProps<Props>()
</script>
```

## 编程式导航

### 基本用法

```typescript
import { useRouter } from 'vue-router'

const router = useRouter()

// 跳转到指定路径
router.push('/home')

// 跳转到命名路由
router.push({ name: 'Home' })

// 带参数跳转
router.push({ path: '/detail', query: { id: 1 } })

// 后退
router.back()

// 前进
router.forward()

// 替换当前页面（不会留下历史记录）
router.replace('/home')
```

### 在 Vant 组件中使用

```vue
<template>
  <van-cell title="商品详情" is-link @click="goDetail" />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goDetail = () => {
  router.push('/detail/1')
}
</script>
```

## 路由懒加载

### 基本用法

```typescript
// 推荐：使用箭头函数
component: () => import('@/views/home/index.vue')

// 不推荐：直接导入
import Home from '@/views/home/index.vue'
component: Home
```

### 分组懒加载

```typescript
// 将多个组件打包到同一个 chunk
component: () => import(/* webpackChunkName: "group-user" */ '@/views/profile/index.vue')
component: () => import(/* webpackChunkName: "group-user" */ '@/views/settings/index.vue')
```

## 常见问题

### 如何实现 Tabbar 页面切换不刷新？

使用 keep-alive 缓存 Tabbar 页面：

```typescript
meta: {
  keepAlive: true,
}
```

### 如何实现返回时使用不同的动画？

在路由守卫中根据导航方向设置动画：

```typescript
router.beforeEach((to, from, next) => {
  const toDepth = to.path.split('/').length
  const fromDepth = from.path.split('/').length
  to.meta.transition = toDepth > fromDepth ? 'slide-left' : 'slide-right'
  next()
})
```

### 如何在路由跳转时显示加载状态？

```typescript
import { showLoadingToast, closeToast } from 'vant'

router.beforeEach((to, from, next) => {
  showLoadingToast({ message: '加载中...', forbidClick: true })
  next()
})

router.afterEach(() => {
  closeToast()
})
```

## 最佳实践

1. **使用路由懒加载**：提高首屏加载速度
2. **合理使用 keep-alive**：缓存需要保持状态的页面
3. **统一管理路由**：将路由配置集中管理
4. **使用命名路由**：便于维护和重构
5. **添加路由守卫**：实现登录验证、权限控制等
6. **设置页面标题**：提升用户体验
7. **配置过渡动画**：让页面切换更流畅
