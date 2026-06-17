/**
 * 报告库 API
 * USE_MOCK 开启时走 src/mock/report-library.ts，关闭时走真实接口
 */
import request from '@/utils/http'
import type {
  ReportCategoryNode,
  Report,
  ReportListQuery,
  ReportListResult,
  AuditProjectNode,
  ProjectReportAttachment,
  ReportImportPreviewItem,
  ImportResult
} from '@/types/report-library'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// ==================== 分类 ====================

/** 获取报告分类树（含每节点直接 count，前端再算 totalCount） */
export const getCategoryTree = () => {
  if (USE_MOCK) {
    return import('@/mock/report-library').then((m) => m.getCategoryTree())
  }
  return request.get<ReportCategoryNode[]>({ url: '/api/report-category/tree' })
}

/** 新增分类（同级唯一） */
export const addCategory = (data: { name: string; parentId: string | null }) => {
  if (USE_MOCK) {
    return import('@/mock/report-library').then((m) => m.addCategory(data))
  }
  return request.post<{ id: string }>({ url: '/api/report-category', data })
}

/** 更新分类（重命名 / 移动父级） */
export const updateCategory = (id: string, data: { name?: string; parentId?: string | null }) => {
  if (USE_MOCK) {
    return import('@/mock/report-library').then((m) => m.updateCategory(id, data))
  }
  return request.put({ url: `/api/report-category/${id}`, data })
}

/** 删除分类（防护：预置分类、含子或含报告时不允许） */
export const deleteCategory = (id: string) => {
  if (USE_MOCK) {
    return import('@/mock/report-library').then((m) => m.deleteCategory(id))
  }
  return request.del({ url: `/api/report-category/${id}` })
}

// ==================== 报告条目 ====================

/** 报告分页列表 */
export const getReportList = (params: ReportListQuery) => {
  if (USE_MOCK) {
    return import('@/mock/report-library').then((m) => m.getReportList(params))
  }
  return request.get<ReportListResult>({ url: '/api/report/list', params })
}

/** 新增报告 */
export const addReport = (data: {
  name: string
  categoryId: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
}) => {
  if (USE_MOCK) {
    return import('@/mock/report-library').then((m) => m.addReport(data))
  }
  return request.post<Report>({ url: '/api/report', data })
}

/** 编辑报告 */
export const updateReport = (
  id: string,
  data: {
    name?: string
    categoryId?: string
    fileName?: string
    fileUrl?: string
    fileType?: string
    fileSize?: number
  }
) => {
  if (USE_MOCK) {
    return import('@/mock/report-library').then((m) => m.updateReport(id, data))
  }
  return request.put({ url: `/api/report/${id}`, data })
}

/** 删除报告 */
export const deleteReport = (id: string) => {
  if (USE_MOCK) {
    return import('@/mock/report-library').then((m) => m.deleteReport(id))
  }
  return request.del({ url: `/api/report/${id}` })
}

/** 批量删除报告 */
export const batchDeleteReport = (ids: string[]) => {
  if (USE_MOCK) {
    return import('@/mock/report-library').then((m) => m.batchDeleteReport(ids))
  }
  return request.del({ url: '/api/report/batch', data: { ids } })
}

/** 切换收藏状态 */
export const toggleFavorite = (id: string) => {
  if (USE_MOCK) {
    return import('@/mock/report-library').then((m) => m.toggleFavorite(id))
  }
  return request.post<{ isFavorite: boolean }>({ url: `/api/report/${id}/favorite` })
}

// ==================== 引入向导 ====================

/** 项目树（按年份分组） */
export const getAuditProjectTree = () => {
  if (USE_MOCK) {
    return import('@/mock/report-library').then((m) => m.getAuditProjectTree())
  }
  return request.get<AuditProjectNode[]>({ url: '/api/audit-project/tree' })
}

/** 项目下报告附件清单 */
export const getProjectReports = (projectId: string) => {
  if (USE_MOCK) {
    return import('@/mock/report-library').then((m) => m.getProjectReports(projectId))
  }
  return request.get<ProjectReportAttachment[]>({
    url: `/api/audit-project/${projectId}/reports`
  })
}

/** 引入查重（按文件名 + URL 严格匹配，传入 fileName||fileUrl 键数组） */
export const checkImportDuplicate = (keys: string[]) => {
  if (USE_MOCK) {
    return import('@/mock/report-library').then((m) => m.checkImportDuplicate(keys))
  }
  return request.post<{ duplicates: string[] }>({
    url: '/api/report/check-duplicate',
    data: { keys }
  })
}

/** 批量引入（确认页提交） */
export const importFromProjects = (items: ReportImportPreviewItem[]) => {
  if (USE_MOCK) {
    return import('@/mock/report-library').then((m) => m.importFromProjects(items))
  }
  return request.post<ImportResult>({
    url: '/api/report/import-from-projects',
    data: { items }
  })
}
