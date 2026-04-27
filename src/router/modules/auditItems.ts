/**
 * 审计事项管理路由
 */

import type { AppRouteRecord } from '@/types'

export const auditItemsRoutes: AppRouteRecord = {
  path: '/audit-items',
  name: 'AuditItems',
  component: () => import('@/views/index/index.vue'),
  meta: {
    title: 'menus.auditItems.title',
    icon: '&#xe88a;',
    isFirstLevel: true
  },
  children: [
    {
      path: '',
      name: 'AuditItemsManage',
      component: () => import('@/views/audit/items/index.vue'),
      meta: {
        title: 'menus.auditItems.title',
        keepAlive: true,
        isHide: true
      }
    }
  ]
}
