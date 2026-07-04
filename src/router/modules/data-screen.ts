/**
 * 数据大屏一级菜单路由
 * 子菜单：财务数据分析大屏（全屏页面，在当前窗口全屏展示）
 */
import type { AppRouteRecord } from '@/types'

export const dataScreenRoutes: AppRouteRecord = {
  path: '/data-screen',
  name: 'DataScreen',
  // 一级菜单使用空白容器，子路由分别渲染具体页面
  component: () => import('@/views/index/index.vue'),
  meta: {
    title: '数据大屏',
    icon: '&#xe812;',
    order: 7,
    isFirstLevel: true
  },
  children: [
    {
      // 国审首页：项目状态统计卡片 + 待办事项，常规页面（非全屏大屏）
      path: '/data-screen/home',
      name: 'DataScreenHome',
      component: () => import('@/views/audit/home/index.vue'),
      meta: {
        title: '国审首页'
      }
    },
    {
      // 财务数据分析大屏：全屏静态展示，isFullPage 让布局以全屏覆盖方式渲染
      path: '/data-screen/financial',
      name: 'DataScreenFinancial',
      component: () => import('@/views/financial-screen/index.vue'),
      meta: {
        title: '财务数据分析大屏',
        isFullPage: true
      }
    },
    {
      // 年度医院数据分析大屏：全屏静态展示，支持年度切换
      path: '/data-screen/hospital-annual',
      name: 'DataScreenHospitalAnnual',
      component: () => import('@/views/hospital-screen/index.vue'),
      meta: {
        title: '年度医院数据大屏',
        isFullPage: true
      }
    }
  ]
}
