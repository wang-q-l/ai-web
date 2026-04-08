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
    {
      path: 'category',
      name: 'Category',
      component: () => import('@/views/category/index.vue'),
      meta: { title: '分类', icon: 'apps-o', tabbar: true },
    },
    {
      path: 'cart',
      name: 'Cart',
      component: () => import('@/views/cart/index.vue'),
      meta: { title: '购物车', icon: 'shopping-cart-o', tabbar: true, badge: 0 },
    },
    {
      path: 'profile',
      name: 'Profile',
      component: () => import('@/views/profile/index.vue'),
      meta: { title: '我的', icon: 'user-o', tabbar: true },
    },
  ],
}

export default tabbarRoutes
