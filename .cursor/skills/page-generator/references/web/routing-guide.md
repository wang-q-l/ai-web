# Web 前台路由配置指南

本文档说明 Web 前台项目的路由配置规范。

## 路由结构

Web 前台项目通常使用扁平化的路由结构：

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/home/index.vue'),
    meta: {
      title: '首页 - 网站名称',
      description: '网站首页描述'
    }
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('@/views/products/index.vue'),
    meta: {
      title: '产品中心 - 网站名称'
    }
  },
  {
    path: '/products/:id',
    name: 'ProductDetail',
    component: () => import('@/views/products/detail.vue'),
    meta: {
      title: '产品详情 - 网站名称'
    }
  },
  {
    path: '/news',
    name: 'News',
    component: () => import('@/views/news/index.vue'),
    meta: {
      title: '新闻动态 - 网站名称'
    }
  },
  {
    path: '/news/:id',
    name: 'NewsDetail',
    component: () => import('@/views/news/detail.vue'),
    meta: {
      title: '新闻详情 - 网站名称'
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/about/index.vue'),
    meta: {
      title: '关于我们 - 网站名称'
    }
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('@/views/contact/index.vue'),
    meta: {
      title: '联系我们 - 网站名称'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router
```

## 路由守卫

### 设置页面标题

```typescript
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title as string
  }

  // 设置 meta 标签
  if (to.meta.description) {
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', to.meta.description as string)
    }
  }

  next()
})
```

## 路由命名规范

- 首页：`Home`
- 列表页：`Products`、`News`、`Cases`
- 详情页：`ProductDetail`、`NewsDetail`、`CaseDetail`
- 表单页：`Contact`、`Feedback`
- 关于页：`About`、`AboutUs`、`AboutCompany`
