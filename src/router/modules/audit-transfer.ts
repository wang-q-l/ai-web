/**
 * 审计移送模块路由配置
 */
import type { AppRouteRecord } from '@/types'

export const auditTransferRoutes: AppRouteRecord = {
  path: '/audit-transfer',
  name: 'AuditTransfer',
  component: () => import('@/views/index/index.vue'),
  meta: {
    title: 'menus.auditTransfer.title',
    icon: '&#xe88b;',
    order: 6,
    isFirstLevel: true
  },
  children: [
    {
      path: 'list',
      name: 'AuditTransferList',
      component: () => import('@/views/audit-transfer/index.vue'),
      meta: {
        title: 'menus.auditTransfer.list',
        keepAlive: true
      }
    },
    {
      path: 'detail',
      name: 'AuditTransferDetail',
      component: () => import('@/views/audit-transfer/detail.vue'),
      meta: {
        title: '移送详情',
        isHide: true
      }
    }
  ]
}
