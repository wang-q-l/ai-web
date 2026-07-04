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
      // 审计项目列表（二级菜单）
      path: '/audit/audit-project',
      name: 'AuditProjectList',
      component: () => import('@/views/audit/audit-project/index.vue'),
      meta: {
        title: 'menus.audit.auditProject',
        keepAlive: false
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
    },
    {
      path: 'personnel/transfer',
      name: 'AuditPersonnelTransfer',
      component: () => import('@/views/audit-management/personnel-transfer/index-new.vue'),
      meta: {
        title: 'menus.audit.personnelTransfer',
        keepAlive: true,
        isHide: true,
        activePath: '/audit'
      }
    },
    {
      // 管理建议库：审计建议的集中管理与复用
      path: '/audit/suggestion-library',
      name: 'AuditSuggestionLibrary',
      component: () => import('@/views/audit/suggestion-library/index.vue'),
      meta: {
        title: 'menus.audit.suggestionLibrary',
        keepAlive: true
      }
    },
    {
      // 报告库：审计报告的集中管理、收藏、预览与从项目引入
      path: '/audit/report-library',
      name: 'AuditReportLibrary',
      component: () => import('@/views/audit/report-library/index.vue'),
      meta: {
        title: 'menus.audit.reportLibrary',
        keepAlive: true
      }
    },
    {
      // 审计项目详情页（标准三卡片布局，进入方式：点击项目名称）
      path: '/audit/audit-project/work',
      name: 'AuditProjectWorkPage',
      component: () => import('@/views/audit/audit-project/work.vue'),
      meta: {
        title: '项目详情',
        isHide: true,
        hideSidebar: true,
        activePath: '/audit/audit-project'
      }
    },
    {
      // 项目打卡
      path: '/audit/checkin',
      name: 'AuditCheckin',
      component: () => import('@/views/checkin/statistics.vue'),
      meta: {
        title: 'menus.checkin.title',
        keepAlive: true
      }
    },
    {
      // 项目打卡 - 现场打卡（详情页，不在菜单中显示）
      path: '/audit/checkin/submit/new',
      name: 'AuditCheckinSubmit',
      component: () => import('@/views/checkin/submit.vue'),
      meta: {
        title: 'menus.checkin.submit',
        keepAlive: false,
        isHide: true,
        activePath: '/audit/checkin'
      }
    }
  ]
}
