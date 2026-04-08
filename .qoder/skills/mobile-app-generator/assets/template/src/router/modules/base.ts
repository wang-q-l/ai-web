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
