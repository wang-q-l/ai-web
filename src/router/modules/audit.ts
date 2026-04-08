/**
 * 审计管理路由
 */

import type { AppRouteRecord } from '@/types'

export const auditRoutes: AppRouteRecord = {
  path: '/audit',
  name: 'Audit',
  component: () => import('@/views/index/index.vue'),
  meta: {
    title: 'menus.audit.title',
    icon: '&#xe7ba;',
    isFirstLevel: true
  },
  children: [
    {
      path: '',
      name: 'AuditProject',
      component: () => import('@/views/audit/project/index.vue'),
      meta: {
        title: 'menus.audit.title',
        keepAlive: true,
        isHide: true
      }
    },
    {
      path: 'project/detail/:id',
      name: 'AuditProjectDetail',
      component: () => import('@/views/audit/project/detail.vue'),
      meta: {
        title: 'menus.audit.detail',
        keepAlive: false,
        isHide: true,
        activePath: '/audit'
      }
    },
    {
      path: 'project/work/:id',
      name: 'AuditProjectWork',
      component: () => import('@/views/audit/project/work.vue'),
      meta: {
        title: 'menus.audit.work',
        keepAlive: false,
        isHide: true,
        activePath: '/audit'
      }
    }
  ]
}
