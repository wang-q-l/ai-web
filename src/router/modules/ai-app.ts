/**
 * AI 应用一级菜单路由
 * 子菜单：智能撰写、法规推荐、法规推荐策略
 */

import type { AppRouteRecord } from '@/types'

export const aiAppRoutes: AppRouteRecord = {
  path: '/ai-app',
  name: 'AiApp',
  // 一级菜单使用空白容器，子路由分别渲染具体页面
  component: () => import('@/views/index/index.vue'),
  meta: {
    title: 'menus.aiApp.title',
    icon: '&#xe88a;',
    isFirstLevel: true
  },
  children: [
    {
      // 智能撰写
      path: '/ai-app/intelligent-writing',
      name: 'IntelligentWriting',
      component: () => import('@/views/intelligent-writing/index.vue'),
      meta: {
        title: 'menus.aiApp.intelligentWriting',
        keepAlive: true
      }
    },
    {
      // 法规推荐
      path: '/ai-app/regulation-recommend',
      name: 'AiAppRegulationRecommend',
      component: () => import('@/views/ai-app/regulation-recommend/index.vue'),
      meta: {
        title: 'menus.aiApp.regulationRecommend',
        keepAlive: true
      }
    },
    {
      // 法规推荐策略
      path: '/ai-app/recommendation-strategy',
      name: 'AiAppRecommendationStrategy',
      component: () => import('@/views/ai-app/recommendation-strategy/index.vue'),
      meta: {
        title: 'menus.aiApp.recommendationStrategy',
        keepAlive: true
      }
    },
    {
      // 大模型厂商管理
      path: '/ai-app/model-provider',
      name: 'AiAppModelProvider',
      component: () => import('@/views/ai-app/model-provider/index.vue'),
      meta: {
        title: 'menus.aiApp.modelProvider',
        keepAlive: true
      }
    }
  ]
}
