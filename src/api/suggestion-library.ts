/**
 * 管理建议库 API
 * USE_MOCK 开启时走 src/mock/suggestion-library.ts，关闭时走真实接口
 */
import request from '@/utils/http'
import type {
  SuggestionCategoryNode,
  Suggestion,
  SuggestionListQuery,
  SuggestionListResult,
  AuditProjectNode,
  AuditProblem,
  ImportPreviewItem,
  ImportResult
} from '@/types/suggestion-library'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// ==================== 分类 ====================

/** 获取建议分类树（含每节点直接 count，前端再算 totalCount） */
export const getCategoryTree = () => {
  if (USE_MOCK) {
    return import('@/mock/suggestion-library').then((m) => m.getCategoryTree())
  }
  return request.get<SuggestionCategoryNode[]>({ url: '/api/suggestion-category/tree' })
}

/** 新增分类（同级唯一） */
export const addCategory = (data: { name: string; parentId: string | null }) => {
  if (USE_MOCK) {
    return import('@/mock/suggestion-library').then((m) => m.addCategory(data))
  }
  return request.post<{ id: string }>({ url: '/api/suggestion-category', data })
}

/** 更新分类（重命名 / 移动父级） */
export const updateCategory = (id: string, data: { name?: string; parentId?: string | null }) => {
  if (USE_MOCK) {
    return import('@/mock/suggestion-library').then((m) => m.updateCategory(id, data))
  }
  return request.put({ url: `/api/suggestion-category/${id}`, data })
}

/** 删除分类（防护：含子或含建议时不允许） */
export const deleteCategory = (id: string) => {
  if (USE_MOCK) {
    return import('@/mock/suggestion-library').then((m) => m.deleteCategory(id))
  }
  return request.del({ url: `/api/suggestion-category/${id}` })
}

// ==================== 建议条目 ====================

/** 建议分页列表 */
export const getSuggestionList = (params: SuggestionListQuery) => {
  if (USE_MOCK) {
    return import('@/mock/suggestion-library').then((m) => m.getSuggestionList(params))
  }
  return request.get<SuggestionListResult>({ url: '/api/suggestion/list', params })
}

/** 新增建议 */
export const addSuggestion = (data: { content: string; categoryId: string }) => {
  if (USE_MOCK) {
    return import('@/mock/suggestion-library').then((m) => m.addSuggestion(data))
  }
  return request.post<Suggestion>({ url: '/api/suggestion', data })
}

/** 编辑建议 */
export const updateSuggestion = (id: string, data: { content?: string; categoryId?: string }) => {
  if (USE_MOCK) {
    return import('@/mock/suggestion-library').then((m) => m.updateSuggestion(id, data))
  }
  return request.put({ url: `/api/suggestion/${id}`, data })
}

/** 删除建议 */
export const deleteSuggestion = (id: string) => {
  if (USE_MOCK) {
    return import('@/mock/suggestion-library').then((m) => m.deleteSuggestion(id))
  }
  return request.del({ url: `/api/suggestion/${id}` })
}

/** 批量删除建议 */
export const batchDeleteSuggestion = (ids: string[]) => {
  if (USE_MOCK) {
    return import('@/mock/suggestion-library').then((m) => m.batchDeleteSuggestion(ids))
  }
  return request.post({ url: '/api/suggestion/batch-delete', data: { ids } })
}

/** 批量移动建议到目标分类 */
export const batchMoveSuggestion = (ids: string[], targetCategoryId: string) => {
  if (USE_MOCK) {
    return import('@/mock/suggestion-library').then((m) =>
      m.batchMoveSuggestion(ids, targetCategoryId)
    )
  }
  return request.post({
    url: '/api/suggestion/batch-move',
    data: { ids, targetCategoryId }
  })
}

/** Excel 导出（mock 仅成功提示） */
export const exportSuggestion = () => {
  if (USE_MOCK) {
    return import('@/mock/suggestion-library').then((m) => m.exportSuggestion())
  }
  return request.get({ url: '/api/suggestion/export' })
}

// ==================== 引入向导 ====================

/** 项目树（按年份分组） */
export const getAuditProjectTree = () => {
  if (USE_MOCK) {
    return import('@/mock/suggestion-library').then((m) => m.getAuditProjectTree())
  }
  return request.get<AuditProjectNode[]>({ url: '/api/audit-project/tree' })
}

/** 项目下问题清单 */
export const getAuditProblems = (projectId: string) => {
  if (USE_MOCK) {
    return import('@/mock/suggestion-library').then((m) => m.getAuditProblems(projectId))
  }
  return request.get<AuditProblem[]>({ url: `/api/audit-project/${projectId}/problems` })
}

/** 引入预览查重（按建议正文 trim 后严格相等） */
export const checkImportDuplicate = (contents: string[]) => {
  if (USE_MOCK) {
    return import('@/mock/suggestion-library').then((m) => m.checkImportDuplicate(contents))
  }
  return request.post<{ duplicates: string[] }>({
    url: '/api/suggestion/check-duplicate',
    data: { contents }
  })
}

/** 批量引入（确认页提交） */
export const importFromProblems = (items: ImportPreviewItem[]) => {
  if (USE_MOCK) {
    return import('@/mock/suggestion-library').then((m) => m.importFromProblems(items))
  }
  return request.post<ImportResult>({
    url: '/api/suggestion/import-from-problems',
    data: { items }
  })
}
