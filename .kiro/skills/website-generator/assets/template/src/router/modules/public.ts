import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '@/layout/MainLayout.vue'

const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: {
          title: '首页'
        }
      },
      {
        path: '/products',
        name: 'Products',
        component: () => import('@/views/Products.vue'),
        meta: {
          title: '产品中心'
        }
      },
      {
        path: '/solutions',
        name: 'Solutions',
        component: () => import('@/views/Solutions.vue'),
        meta: {
          title: '解决方案'
        }
      },
      {
        path: '/news',
        name: 'News',
        component: () => import('@/views/News.vue'),
        meta: {
          title: '新闻动态'
        }
      },
      {
        path: '/about',
        name: 'About',
        component: () => import('@/views/About.vue'),
        meta: {
          title: '关于我们'
        }
      },
      {
        path: '/contact',
        name: 'Contact',
        component: () => import('@/views/Contact.vue'),
        meta: {
          title: '联系我们'
        }
      }
    ]
  }
]

export default publicRoutes
