import { AppRouteRecord } from '@/types/router'
// import { workbenchRoutes } from './workbench'
// import { organizationTemplateRoutes } from './organization-template'
// import { permissionTemplateRoutes } from './permission-template'
import { auditRoutes } from './audit'
import { checkinRoutes } from './checkin'
export const routeModules: AppRouteRecord[] = [
  // workbenchRoutes,
  // organizationTemplateRoutes,
  // permissionTemplateRoutes,
  auditRoutes,
  checkinRoutes,
]
