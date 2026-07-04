/**
 * 计划管理路由
 */

import type { AppRouteRecord } from '@/types'

export const planManagementRoutes: AppRouteRecord = {
  path: '/plan-management',
  name: 'PlanManagement',
  component: () => import('@/views/index/index.vue'),
  meta: {
    title: 'menus.planManagement.title',
    icon: '&#xe600;',
    isFirstLevel: true
  },
  children: [
    {
      // 填报通知
      path: '/plan-management/notification',
      name: 'PlanNotification',
      component: () => import('@/views/plan-management/notification/index.vue'),
      meta: {
        title: 'menus.planManagement.notification',
        keepAlive: true
      }
    },
    {
      // 计划填报
      path: '/plan-management/report',
      name: 'PlanReport',
      component: () => import('@/views/plan-management/report/index.vue'),
      meta: {
        title: 'menus.planManagement.report',
        keepAlive: true
      }
    },
    {
      // 计划统筹
      path: '/plan-management/coordination',
      name: 'PlanCoordination',
      component: () => import('@/views/plan-management/coordination/index.vue'),
      meta: {
        title: 'menus.planManagement.coordination',
        keepAlive: true
      }
    },
    {
      // 计划调整
      path: '/plan-management/adjustment',
      name: 'PlanAdjustment',
      component: () => import('@/views/plan-management/adjustment/index.vue'),
      meta: {
        title: 'menus.planManagement.adjustment',
        keepAlive: true
      }
    },
    {
      // 申请调整（新增，不在菜单中显示）
      path: '/plan-management/adjustment/apply',
      name: 'PlanAdjustmentApply',
      component: () => import('@/views/plan-management/adjustment/apply.vue'),
      meta: {
        title: '申请调整',
        keepAlive: false,
        isHide: true,
        activePath: '/plan-management/adjustment'
      }
    },
    {
      // 计划配置
      path: '/plan-management/config',
      name: 'PlanConfig',
      component: () => import('@/views/plan-management/config/index.vue'),
      meta: {
        title: 'menus.planManagement.config',
        keepAlive: true
      }
    },
    {
      // 项目推荐（从 audit-recommendation 模块迁移至此）
      path: '/plan-management/recommendation',
      name: 'PlanRecommendation',
      component: () => import('@/views/audit-management/project-recommendation/index.vue'),
      meta: {
        title: 'menus.auditRecommendation.title',
        keepAlive: true
      }
    }
  ]
}
