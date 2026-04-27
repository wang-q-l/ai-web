/**
 * 审计文书编辑路由
 */

import type { AppRouteRecord } from '@/types'

export const auditDocumentRoutes: AppRouteRecord = {
  path: '/audit-document',
  name: 'AuditDocument',
  component: () => import('@/views/index/index.vue'),
  meta: {
    title: 'menus.auditDocument.title',
    icon: '&#xe88a;',
    isFirstLevel: true
  },
  children: [
    {
      path: 'edit/:id',
      name: 'AuditDocumentEdit',
      component: () => import('@/views/audit/document/edit.vue'),
      meta: {
        title: 'menus.auditDocument.edit',
        keepAlive: false,
        isHide: true,
        activePath: '/audit-document'
      }
    }
  ]
}
