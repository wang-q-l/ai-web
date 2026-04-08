# 移动端路由配置指南

移动端项目使用扁平化路由结构。

## 基本配置

```typescript
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    component: () => import('@/views/home/index.vue')
  },
  {
    path: '/list',
    component: () => import('@/views/list/index.vue')
  },
  {
    path: '/detail/:id',
    component: () => import('@/views/detail/index.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```
