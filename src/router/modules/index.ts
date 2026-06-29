import { AppRouteRecord } from '@/types/router'
// import { workbenchRoutes } from './workbench'
// import { organizationTemplateRoutes } from './organization-template'
// import { permissionTemplateRoutes } from './permission-template'
import { auditRoutes } from './audit'
// import { auditItemsRoutes } from './auditItems'
// import { auditDocumentRoutes } from './auditDocument'
import { checkinRoutes } from './checkin'
import { auditRecommendationRoutes } from './audit-recommendation'
import { aiAppRoutes } from './ai-app'
import { auditDecisionRoutes } from './audit-decision'
import { auditedObjectRoutes } from './audited-object'

export const routeModules: AppRouteRecord[] = [
  // workbenchRoutes,
  // organizationTemplateRoutes,
  // permissionTemplateRoutes,
  auditRoutes,
  // auditItemsRoutes,
  // auditDocumentRoutes,
  checkinRoutes,
  auditRecommendationRoutes,
  aiAppRoutes,
  auditDecisionRoutes,
  auditedObjectRoutes
]
