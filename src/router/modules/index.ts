import { AppRouteRecord } from '@/types/router'
// import { workbenchRoutes } from './workbench'
// import { organizationTemplateRoutes } from './organization-template'
// import { permissionTemplateRoutes } from './permission-template'
import { planManagementRoutes } from './plan-management'
import { auditRoutes } from './audit'
// import { auditItemsRoutes } from './auditItems'
// import { auditDocumentRoutes } from './auditDocument'
// import { checkinRoutes } from './checkin'           // 已迁移至 audit 模块二级菜单
// import { auditRecommendationRoutes } from './audit-recommendation'  // 已迁移至 plan-management 模块
import { aiAppRoutes } from './ai-app'
import { auditDecisionRoutes } from './audit-decision'
// import { dataScreenRoutes } from './data-screen'
import { auditedObjectRoutes } from './audited-object'
import { dailySupervisionRoutes } from './daily-supervision'

// 一级菜单顺序：计划管理 → 项目管理 → 整改管理 → 被审计对象 → AI应用 → 日常监督
export const routeModules: AppRouteRecord[] = [
  // workbenchRoutes,
  // organizationTemplateRoutes,
  // permissionTemplateRoutes,
  planManagementRoutes,
  auditRoutes,
  // auditItemsRoutes,
  // auditDocumentRoutes,
  auditDecisionRoutes,
  // dataScreenRoutes,
  auditedObjectRoutes,
  aiAppRoutes,
  dailySupervisionRoutes
]
