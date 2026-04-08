/**
 * 工作台路由
 */

import type { AppRouteRecord } from '@/types'

export const workbenchRoutes: AppRouteRecord = {
  path: '/workbench',
  name: 'Workbench',
  component: () => import('@/views/index/index.vue'),
  meta: {
    title: 'menus.workbench.title',
    icon: '&#xe81a;',
    isFirstLevel: true
  },
  children: [
    {
      path: '',
      name: 'WorkbenchPage',
      component: () => import('@/views/workbench/index.vue'),
      meta: {
        title: 'menus.workbench.title',
        keepAlive: true,
        isHide: true
      }
    }
  ]
}
