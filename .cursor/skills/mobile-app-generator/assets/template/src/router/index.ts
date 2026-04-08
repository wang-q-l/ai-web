/**
 * 路由配置主文件
 * 自动导入 modules 目录下的所有路由模块
 */

import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

// 导入路由模块
import baseRoutes from './modules/base'
import tabbarRoutes from './modules/tabbar'

// 合并所有路由
const routes: RouteRecordRaw[] = [
  ...baseRoutes,
  tabbarRoutes,
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
