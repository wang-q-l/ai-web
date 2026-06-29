/**
 * 审计决定模块路由配置
 */
import type { AppRouteRecord } from '@/types'

export const auditDecisionRoutes: AppRouteRecord = {
  path: '/audit-decision',
  name: 'AuditDecision',
  // 一级菜单使用空白容器，子路由分别渲染具体页面
  component: () => import('@/views/index/index.vue'),
  meta: {
    title: '整改管理',
    icon: '&#xe7f0;',
    order: 5,
    isFirstLevel: true
  },
  children: [
    {
      // 整改项目列表（原默认入口）
      path: '/audit-decision',
      name: 'AuditDecisionProjectList',
      component: () => import('@/views/audit-decision/project-list.vue'),
      meta: {
        title: '整改项目',
        keepAlive: true
      }
    },
    {
      // 决定节点配置（新增二级菜单）
      path: '/audit-decision/process-config',
      name: 'AuditDecisionProcessConfig',
      component: () => import('@/views/audit-decision/process-config/index.vue'),
      meta: {
        title: '节点配置',
        keepAlive: true
      }
    },
    {
      // 统计报表比对（新增二级菜单）
      path: '/audit-decision/report-compare',
      name: 'AuditDecisionReportCompare',
      component: () => import('@/views/audit-decision/report-compare/index.vue'),
      meta: {
        title: '统计报表比对',
        keepAlive: true
      }
    },
    {
      // 整改单位端（新增二级菜单，下含三级菜单）
      path: '/audit-decision/rectification-unit',
      name: 'RectificationUnit',
      // 二级菜单透传容器，由三级子路由渲染具体页面
      component: () => import('@/views/index/router-view.vue'),
      meta: {
        title: '整改单位端'
      },
      children: [
        {
          // 整改进展（三级菜单）
          path: '/audit-decision/rectification-unit/progress',
          name: 'RectificationUnitProgress',
          component: () => import('@/views/audit-decision/rectification-progress.vue'),
          meta: {
            title: '整改进展',
            keepAlive: true
          }
        },
        {
          // 整改调整（三级菜单，容器，下含调整申请、调整审批页）
          path: '/audit-decision/rectification-unit/adjustment',
          name: 'RectificationUnitAdjustment',
          // 三级菜单透传容器，由四级子路由渲染具体页面
          component: () => import('@/views/index/router-view.vue'),
          meta: {
            title: '整改调整'
          },
          children: [
            {
              // 调整申请（四级菜单，原列表页）
              path: '/audit-decision/rectification-unit/adjustment/list',
              name: 'RectificationUnitAdjustmentList',
              component: () => import('@/views/audit-decision/adjustment-list.vue'),
              meta: {
                title: '调整申请',
                keepAlive: true
              }
            },
            {
              // 调整审批页（四级菜单）
              path: '/audit-decision/rectification-unit/adjustment/approval',
              name: 'RectificationUnitAdjustmentApproval',
              component: () => import('@/views/audit-decision/adjustment-approval.vue'),
              meta: {
                title: '调整审批页',
                keepAlive: false
              }
            }
          ]
        }
      ]
    }
  ]
}
