# 底部导航配置指南

本文档介绍如何配置移动端应用的底部 Tabbar 导航。

## Tabbar 路由配置

### 基本配置

在 `src/router/index.ts` 中配置 Tabbar 路由：

```typescript
{
  path: '/',
  component: () => import('@/layout/TabbarLayout.vue'),
  redirect: '/home',
  children: [
    {
      path: 'home',
      name: 'Home',
      component: () => import('@/views/home/index.vue'),
      meta: {
        title: '首页',        // 标签文字
        icon: 'home-o',       // Vant 图标名称
        tabbar: true,         // 显示在 Tabbar
      },
    },
    {
      path: 'category',
      name: 'Category',
      component: () => import('@/views/category/index.vue'),
      meta: {
        title: '分类',
        icon: 'apps-o',
        tabbar: true,
      },
    },
    {
      path: 'cart',
      name: 'Cart',
      component: () => import('@/views/cart/index.vue'),
      meta: {
        title: '购物车',
        icon: 'shopping-cart-o',
        tabbar: true,
        badge: 0,             // 徽标数量（可选）
      },
    },
    {
      path: 'profile',
      name: 'Profile',
      component: () => import('@/views/profile/index.vue'),
      meta: {
        title: '我的',
        icon: 'user-o',
        tabbar: true,
      },
    },
  ],
}
```

### Meta 字段说明

- `title`: 标签文字，显示在图标下方
- `icon`: Vant 图标名称，参考下方图标列表
- `tabbar`: 是否显示在 Tabbar，设置为 `true` 才会显示
- `badge`: 徽标数量，可选，用于显示未读消息数等

## 常用 Vant 图标

### 电商类应用

```typescript
// 首页
icon: 'home-o'

// 分类
icon: 'apps-o'

// 购物车
icon: 'shopping-cart-o'

// 订单
icon: 'orders-o'

// 我的
icon: 'user-o'
```

### 社交类应用

```typescript
// 首页/动态
icon: 'home-o'

// 消息
icon: 'chat-o'

// 发现
icon: 'fire-o'

// 我的
icon: 'user-o'
```

### 工具类应用

```typescript
// 首页
icon: 'home-o'

// 搜索
icon: 'search'

// 收藏
icon: 'star-o'

// 设置
icon: 'setting-o'
```

### 更多图标

```typescript
// 基础图标
'home-o' // 首页
'user-o' // 用户
'setting-o' // 设置
'search' // 搜索
'star-o' // 收藏
'like-o' // 点赞
'chat-o' // 聊天
'bell-o' // 通知

// 商业图标
'shop-o' // 商店
'cart-o' // 购物车
'shopping-cart-o' // 购物车（另一种）
'orders-o' // 订单
'coupon-o' // 优惠券
'gift-o' // 礼物
'gold-coin-o' // 金币

// 功能图标
'apps-o' // 应用
'fire-o' // 热门
'location-o' // 位置
'photo-o' // 图片
'video-o' // 视频
'music-o' // 音乐
'calendar-o' // 日历
```

完整图标列表请参考：[Vant Icon 组件文档](https://vant-ui.github.io/vant/#/zh-CN/icon)

## 徽标（Badge）配置

### 静态徽标

在路由 meta 中配置固定数量：

```typescript
meta: {
  title: '购物车',
  icon: 'shopping-cart-o',
  tabbar: true,
  badge: 5,  // 显示数字 5
}
```

### 动态徽标

使用状态管理动态更新徽标：

```typescript
// stores/cart.ts
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    count: 0
  }),
  actions: {
    updateCount(count: number) {
      this.count = count
    }
  }
})
```

在 TabbarLayout 中使用：

```vue
<template>
  <van-tabbar-item
    v-for="item in tabbarRoutes"
    :key="item.path"
    :icon="item.meta.icon"
    :badge="getBadge(item)"
    :to="item.path"
  >
    {{ item.meta.title }}
  </van-tabbar-item>
</template>

<script setup lang="ts">
  import { useCartStore } from '@/stores/cart'

  const cartStore = useCartStore()

  const getBadge = (route: any) => {
    if (route.name === 'Cart') {
      return cartStore.count || undefined
    }
    return route.meta.badge
  }
</script>
```

### 红点徽标

显示红点而不是数字：

```typescript
meta: {
  title: '消息',
  icon: 'chat-o',
  tabbar: true,
  badge: '',  // 空字符串显示红点
}
```

## Tabbar 样式定制

### 修改颜色

在 `src/styles/variables.css` 中：

```css
:root {
  --tabbar-background: #ffffff; /* 背景色 */
  --tabbar-active-color: #1989fa; /* 激活颜色 */
  --tabbar-inactive-color: #646566; /* 未激活颜色 */
}
```

### 修改高度

在 `src/styles/vant-custom.css` 中：

```css
.van-tabbar {
  height: 60px; /* 默认 50px */
}

.van-tabbar-item {
  font-size: 12px;
}
```

### 自定义图标大小

```css
.van-tabbar-item__icon {
  font-size: 24px; /* 默认 22px */
}
```

## 显示/隐藏 Tabbar

### 方式一：路由 Meta 控制

在路由配置中设置 `tabbar: false`：

```typescript
{
  path: 'detail/:id',
  name: 'Detail',
  component: () => import('@/views/detail/index.vue'),
  meta: {
    title: '详情',
    tabbar: false,  // 不显示 Tabbar
  },
}
```

### 方式二：动态控制

在 TabbarLayout 中：

```vue
<template>
  <van-tabbar v-model="active" v-if="showTabbar">
    <!-- ... -->
  </van-tabbar>
</template>

<script setup lang="ts">
  const showTabbar = computed(() => {
    return route.meta.tabbar === true
  })
</script>
```

## Tabbar 数量建议

- **3 个标签**：适合功能简单的应用
- **4 个标签**：最常见的配置，推荐
- **5 个标签**：功能较多的应用，但不建议超过 5 个

## 常见配置示例

### 电商应用（4 个标签）

```typescript
children: [
  { path: 'home', meta: { title: '首页', icon: 'home-o', tabbar: true } },
  { path: 'category', meta: { title: '分类', icon: 'apps-o', tabbar: true } },
  { path: 'cart', meta: { title: '购物车', icon: 'shopping-cart-o', tabbar: true, badge: 0 } },
  { path: 'profile', meta: { title: '我的', icon: 'user-o', tabbar: true } }
]
```

### 社交应用（4 个标签）

```typescript
children: [
  { path: 'home', meta: { title: '首页', icon: 'home-o', tabbar: true } },
  { path: 'message', meta: { title: '消息', icon: 'chat-o', tabbar: true, badge: '' } },
  { path: 'discover', meta: { title: '发现', icon: 'fire-o', tabbar: true } },
  { path: 'profile', meta: { title: '我的', icon: 'user-o', tabbar: true } }
]
```

### 工具应用（3 个标签）

```typescript
children: [
  { path: 'home', meta: { title: '首页', icon: 'home-o', tabbar: true } },
  { path: 'tools', meta: { title: '工具', icon: 'apps-o', tabbar: true } },
  { path: 'profile', meta: { title: '我的', icon: 'user-o', tabbar: true } }
]
```

## 注意事项

1. Tabbar 标签数量建议 3-5 个，不要太多
2. 图标和文字要简洁明了，易于理解
3. 激活颜色要与主题色保持一致
4. 徽标数字不要太大，超过 99 可以显示 "99+"
5. 测试不同屏幕尺寸下的显示效果
