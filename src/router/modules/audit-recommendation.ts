/**
 * 审计项目推荐路由
 */

import type { AppRouteRecord } from '@/types'

export const auditRecommendationRoutes: AppRouteRecord = {
  path: '/audit-recommendation',
  name: 'AuditRecommendation',
  component: () => import('@/views/index/index.vue'),
  meta: {
    title: 'menus.auditRecommendation.title',
    icon: '&#xe7ba;',
    isFirstLevel: true
  },
  children: [
    {
      path: '',
      name: 'AuditRecommendationAI',
      component: () => import('@/views/audit-management/project-recommendation/index.vue'),
      meta: {
        title: 'menus.auditRecommendation.title',
        keepAlive: true,
        isHide: true
      }
    }
  ]
}
