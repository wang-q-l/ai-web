/**
 * 被审计对象模块路由配置
 * 一级菜单「被审计对象」下含两个二级菜单：领导人员、被审单位
 */
import type { AppRouteRecord } from '@/types'

export const auditedObjectRoutes: AppRouteRecord = {
  path: '/audited-object',
  name: 'AuditedObject',
  // 一级菜单使用空白容器，子路由分别渲染具体页面
  component: () => import('@/views/index/index.vue'),
  meta: {
    title: '被审计对象',
    icon: '&#xe608;', // iconfont: user
    order: 6,
    isFirstLevel: true
  },
  children: [
    {
      // 领导人员（点击打开复刻的详情页）
      path: '/audited-object/leader',
      name: 'AuditedObjectLeader',
      component: () => import('@/views/audited-object/leader/index.vue'),
      meta: {
        title: '领导人员',
        keepAlive: true
      }
    },
    {
      // 被审单位（占位页）
      path: '/audited-object/unit',
      name: 'AuditedObjectUnit',
      component: () => import('@/views/audited-object/unit/index.vue'),
      meta: {
        title: '被审单位',
        keepAlive: true
      }
    }
  ]
}
