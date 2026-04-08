import type { AppRouteRecord } from '@/types'

export const checkinRoutes: AppRouteRecord = {
  path: '/checkin',
  name: 'Checkin',
  component: () => import('@/views/index/index.vue'),
  meta: {
    title: 'menus.checkin.title',
    icon: '&#xe7ae;',
    isFirstLevel: true
  },
  children: [
    {
      path: '',
      name: 'CheckinStatistics',
      component: () => import('@/views/checkin/statistics.vue'),
      meta: {
        title: 'menus.checkin.title',
        keepAlive: true,
        isHide: true
      }
    },
    {
      path: 'submit/new',
      name: 'CheckinSubmit',
      component: () => import('@/views/checkin/submit.vue'),
      meta: {
        title: 'menus.checkin.submit',
        keepAlive: false,
        isHide: true,
        activePath: '/checkin'
      }
    }
  ]
}
