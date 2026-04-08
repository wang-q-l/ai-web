# 路由和菜单配置指南

## 添加新页面

### 1. 创建页面组件

在 `src/views/` 下创建新页面,例如 `src/views/users/index.vue`:

```vue
<template>
  <div class="users-page">
    <el-card>
      <template #header>
        <span>用户管理</span>
      </template>
      <!-- 页面内容 -->
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 页面逻辑
</script>
```

### 2. 配置路由

在 `src/router/index.ts` 中添加路由:

```typescript
{
  path: '/',
  component: () => import('@/layout/index.vue'),
  redirect: '/dashboard',
  children: [
    {
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index.vue'),
      meta: { title: '首页', icon: 'HomeFilled' }
    },
    {
      path: 'users',
      name: 'Users',
      component: () => import('@/views/users/index.vue'),
      meta: { title: '用户管理', icon: 'User' }
    }
  ]
}
```

### 3. 菜单自动生成

菜单会根据路由配置自动生成,`meta` 字段说明:
- `title`: 菜单显示名称
- `icon`: 菜单图标(Element Plus Icons)
- `hidden`: 是否隐藏菜单(可选)

## 多级菜单

### 二级菜单示例

```typescript
{
  path: '/system',
  component: () => import('@/layout/index.vue'),
  meta: { title: '系统管理', icon: 'Setting' },
  children: [
    {
      path: 'users',
      name: 'SystemUsers',
      component: () => import('@/views/system/users/index.vue'),
      meta: { title: '用户管理' }
    },
    {
      path: 'roles',
      name: 'SystemRoles',
      component: () => import('@/views/system/roles/index.vue'),
      meta: { title: '角色管理' }
    }
  ]
}
```

## 常用图标

Element Plus Icons 常用图标名称:
- `HomeFilled` - 首页
- `User` - 用户
- `Setting` - 设置
- `Document` - 文档
- `ShoppingCart` - 购物车
- `DataAnalysis` - 数据分析
- `List` - 列表
- `Edit` - 编辑
- `Delete` - 删除
- `Plus` - 添加
- `Search` - 搜索
- `View` - 查看
- `Money` - 金钱
- `Bell` - 通知

完整图标列表: https://element-plus.org/zh-CN/component/icon.html

## 路由守卫

在 `src/router/index.ts` 中已配置基础路由守卫:

```typescript
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')  // 未登录跳转登录页
  } else if (to.path === '/login' && token) {
    next('/')  // 已登录跳转首页
  } else {
    next()
  }
})
```

可根据需求添加权限验证、页面标题设置等逻辑。

## 动态路由

如需根据用户权限动态加载路由,可使用 `router.addRoute()`:

```typescript
// 获取用户权限后动态添加路由
const addDynamicRoutes = (routes: RouteRecordRaw[]) => {
  routes.forEach(route => {
    router.addRoute(route)
  })
}
```
