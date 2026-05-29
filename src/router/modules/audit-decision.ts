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
    }
  ]
}
