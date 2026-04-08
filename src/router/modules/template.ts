import { AppRouteRecord } from '@/types/router'

export const templateRoutes: AppRouteRecord = {
  path: '/template',
  name: 'Template',
  component: () => import('@/views/index/index.vue'),
  meta: {
    title: 'menus.template.title',
    icon: '&#xe860;'
  },
  children: [
    {
      path: 'cards',
      name: 'Cards',
      component: () => import('@/views/template/cards/index.vue'),
      meta: {
        title: 'menus.template.cards',
        keepAlive: false
      }
    },
    {
      path: 'banners',
      name: 'Banners',
      component: () => import('@/views/template/banners/index.vue'),
      meta: {
        title: 'menus.template.banners',
        keepAlive: false
      }
    },
    {
      path: 'charts',
      name: 'Charts',
      component: () => import('@/views/template/charts/index.vue'),
      meta: {
        title: 'menus.template.charts',
        keepAlive: false
      }
    },
    {
      path: 'map',
      name: 'Map',
      component: () => import('@/views/template/map/index.vue'),
      meta: {
        title: 'menus.template.map',
        keepAlive: true
      }
    },
    {
      path: 'chat',
      name: 'Chat',
      component: () => import('@/views/template/chat/index.vue'),
      meta: {
        title: 'menus.template.chat',
        keepAlive: true
      }
    },
    {
      path: 'calendar',
      name: 'Calendar',
      component: () => import('@/views/template/calendar/index.vue'),
      meta: {
        title: 'menus.template.calendar',
        keepAlive: true
      }
    },
    {
      path: 'pricing',
      name: 'Pricing',
      component: () => import('@/views/template/pricing/index.vue'),
      meta: {
        title: 'menus.template.pricing',
        keepAlive: true,
        isFullPage: true
      }
    }
  ]
}
