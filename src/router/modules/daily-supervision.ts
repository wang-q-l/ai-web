/**
 * 日常监督一级菜单路由配置
 */
import type { AppRouteRecord } from '@/types'

export const dailySupervisionRoutes: AppRouteRecord = {
  path: '/daily-supervision',
  name: 'DailySupervision',
  // 一级菜单使用空白容器，子路由渲染具体页面
  component: () => import('@/views/index/index.vue'),
  meta: {
    title: '日常监督',
    icon: '&#xe812;',
    order: 8,
    isFirstLevel: true
  },
  children: [
    {
      // 流程说明（业务流程图展示页）
      path: '/daily-supervision/flow',
      name: 'DailySupervisionFlow',
      component: () => import('@/views/daily-supervision/index.vue'),
      meta: {
        title: '流程说明',
        keepAlive: true
      }
    }
  ]
}
