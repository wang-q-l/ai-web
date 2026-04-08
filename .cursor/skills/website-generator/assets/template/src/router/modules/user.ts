import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '@/layout/MainLayout.vue'

const userRoutes: RouteRecordRaw[] = [
  {
    path: '/user',
    component: MainLayout,
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('@/views/user/Profile.vue'),
        meta: {
          title: '个人资料',
          requiresAuth: true
        }
      },
      {
        path: 'orders',
        name: 'UserOrders',
        component: () => import('@/views/user/Orders.vue'),
        meta: {
          title: '订单管理',
          requiresAuth: true
        }
      },
      {
        path: 'favorites',
        name: 'UserFavorites',
        component: () => import('@/views/user/Favorites.vue'),
        meta: {
          title: '我的收藏',
          requiresAuth: true
        }
      },
      {
        path: 'messages',
        name: 'UserMessages',
        component: () => import('@/views/user/Messages.vue'),
        meta: {
          title: '消息通知',
          requiresAuth: true
        }
      }
    ]
  }
]

export default userRoutes
