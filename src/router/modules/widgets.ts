import { AppRouteRecord } from '@/types/router'

export const widgetsRoutes: AppRouteRecord = {
  path: '/widgets',
  name: 'Widgets',
  component: () => import('@/views/index/index.vue'),
  meta: {
    title: 'menus.widgets.title',
    icon: '&#xe81a;'
  },
  children: [
    {
      path: 'icon-list',
      name: 'IconList',
      component: () => import('@/views/widgets/icon-list/index.vue'),
      meta: {
        title: 'menus.widgets.iconList',
        keepAlive: true
      }
    },
    {
      path: 'icon-selector',
      name: 'IconSelector',
      component: () => import('@/views/widgets/icon-selector/index.vue'),
      meta: {
        title: 'menus.widgets.iconSelector',
        keepAlive: true
      }
    },
    {
      path: 'image-crop',
      name: 'ImageCrop',
      component: () => import('@/views/widgets/image-crop/index.vue'),
      meta: {
        title: 'menus.widgets.imageCrop',
        keepAlive: true
      }
    },
    {
      path: 'excel',
      name: 'Excel',
      component: () => import('@/views/widgets/excel/index.vue'),
      meta: {
        title: 'menus.widgets.excel',
        keepAlive: true
      }
    },
    {
      path: 'video',
      name: 'Video',
      component: () => import('@/views/widgets/video/index.vue'),
      meta: {
        title: 'menus.widgets.video',
        keepAlive: true
      }
    },
    {
      path: 'count-to',
      name: 'CountTo',
      component: () => import('@/views/widgets/count-to/index.vue'),
      meta: {
        title: 'menus.widgets.countTo',
        keepAlive: false
      }
    },
    {
      path: 'wang-editor',
      name: 'WangEditor',
      component: () => import('@/views/widgets/wang-editor/index.vue'),
      meta: {
        title: 'menus.widgets.wangEditor',
        keepAlive: true
      }
    },
    {
      path: 'watermark',
      name: 'Watermark',
      component: () => import('@/views/widgets/watermark/index.vue'),
      meta: {
        title: 'menus.widgets.watermark',
        keepAlive: true
      }
    },
    {
      path: 'context-menu',
      name: 'ContextMenu',
      component: () => import('@/views/widgets/context-menu/index.vue'),
      meta: {
        title: 'menus.widgets.contextMenu',
        keepAlive: true
      }
    },
    {
      path: 'qrcode',
      name: 'Qrcode',
      component: () => import('@/views/widgets/qrcode/index.vue'),
      meta: {
        title: 'menus.widgets.qrcode',
        keepAlive: true
      }
    },
    {
      path: 'drag',
      name: 'Drag',
      component: () => import('@/views/widgets/drag/index.vue'),
      meta: {
        title: 'menus.widgets.drag',
        keepAlive: true
      }
    },
    {
      path: 'text-scroll',
      name: 'TextScroll',
      component: () => import('@/views/widgets/text-scroll/index.vue'),
      meta: {
        title: 'menus.widgets.textScroll',
        keepAlive: true
      }
    },
    {
      path: 'fireworks',
      name: 'Fireworks',
      component: () => import('@/views/widgets/fireworks/index.vue'),
      meta: {
        title: 'menus.widgets.fireworks',
        keepAlive: true,
        showTextBadge: 'Hot'
      }
    }
  ]
}
