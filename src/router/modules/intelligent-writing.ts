/**
 * 智能撰写路由
 */

import type { AppRouteRecord } from '@/types'

export const intelligentWritingRoutes: AppRouteRecord = {
  path: '/intelligent-writing',
  name: 'IntelligentWriting',
  component: () => import('@/views/index/index.vue'),
  meta: {
    title: 'menus.intelligentWriting.title',
    icon: '&#xe88a;',
    isFirstLevel: true
  },
  children: [
    {
      path: '',
      name: 'IntelligentWritingDemo',
      component: () => import('@/views/intelligent-writing/index.vue'),
      meta: {
        title: 'menus.intelligentWriting.title',
        keepAlive: true,
        isHide: true
      }
    }
  ]
}
