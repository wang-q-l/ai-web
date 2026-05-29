/**
 * 审计决定模块API接口
 */
import request from '@/utils/http'
import type {
  RectificationProject,
  RectificationProjectQuery,
  RectificationProjectForm,
  AuditDecision,
  AuditDecisionQuery,
  AuditDecisionForm,
  RelatedProblem,
  RelatedProblemQuery,
  ReviewRecord,
  RectificationStatistics
} from '@/types/audit-decision'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// ==================== 整改项目管理 ====================

/**
 * 获取整改项目列表
 */
export const getRectificationProjectList = (params: RectificationProjectQuery) => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.getRectificationProjectList(params))
  }
  return request.get<{ list: RectificationProject[]; total: number }>({
    url: '/api/audit-decision/projects',
    params
  })
}

/**
 * 获取整改项目详情
 */
export const getRectificationProjectDetail = (id: number) => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.getRectificationProjectDetail(id))
  }
  return request.get<RectificationProject>({ url: `/api/audit-decision/projects/${id}` })
}

/**
 * 新增整改项目
 */
export const addRectificationProject = (data: RectificationProjectForm) => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.addRectificationProject(data))
  }
  return request.post<{ id: number }>({ url: '/api/audit-decision/projects', data })
}

/**
 * 编辑整改项目
 */
export const updateRectificationProject = (id: number, data: RectificationProjectForm) => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.updateRectificationProject(id, data))
  }
  return request.put<null>({ url: `/api/audit-decision/projects/${id}`, data })
}

/**
 * 删除整改项目
 */
export const deleteRectificationProject = (id: number) => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.deleteRectificationProject(id))
  }
  return request.del<null>({ url: `/api/audit-decision/projects/${id}` })
}

// ==================== 审计决定管理 ====================

/**
 * 获取审计决定列表
 */
export const getAuditDecisionList = (params: AuditDecisionQuery) => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.getAuditDecisionList(params))
  }
  return request.get<{ list: AuditDecision[]; total: number }>({
    url: '/api/audit-decision/decisions',
    params
  })
}

/**
 * 获取审计决定详情
 */
export const getAuditDecisionDetail = (id: number) => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.getAuditDecisionDetail(id))
  }
  return request.get<AuditDecision>({ url: `/api/audit-decision/decisions/${id}` })
}

/**
 * 新增审计决定
 */
export const addAuditDecision = (data: AuditDecisionForm) => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.addAuditDecision(data))
  }
  return request.post<{ id: number }>({ url: '/api/audit-decision/decisions', data })
}

/**
 * 编辑审计决定
 */
export const updateAuditDecision = (id: number, data: AuditDecisionForm) => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.updateAuditDecision(id, data))
  }
  return request.put<null>({ url: `/api/audit-decision/decisions/${id}`, data })
}

/**
 * 删除审计决定
 */
export const deleteAuditDecision = (id: number) => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.deleteAuditDecision(id))
  }
  return request.del<null>({ url: `/api/audit-decision/decisions/${id}` })
}

/**
 * 提交审核
 */
export const submitForReview = (id: number) => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.submitForReview(id))
  }
  return request.post<null>({ url: `/api/audit-decision/decisions/${id}/submit` })
}

/**
 * 审核决定
 */
export const reviewDecision = (
  id: number,
  data: { reviewResult: number; reviewOpinion: string }
) => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.reviewDecision(id, data))
  }
  return request.post<null>({ url: `/api/audit-decision/decisions/${id}/review`, data })
}

/**
 * 下达决定
 */
export const issueDecision = (id: number) => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.issueDecision(id))
  }
  return request.post<null>({ url: `/api/audit-decision/decisions/${id}/issue` })
}

/**
 * 批量下达决定
 */
export const batchIssueDecisions = (ids: number[]) => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.batchIssueDecisions(ids))
  }
  return request.post<null>({ url: '/api/audit-decision/decisions/batch-issue', data: { ids } })
}

/**
 * 导出审计决定列表
 */
export const exportAuditDecisionList = (params: AuditDecisionQuery) => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.exportAuditDecisionList(params))
  }
  return request.get<Blob>({
    url: '/api/audit-decision/decisions/export',
    params,
    responseType: 'blob'
  })
}

// ==================== 关联问题管理 ====================

/**
 * 获取可关联的问题列表
 */
export const getAvailableProblems = (params: RelatedProblemQuery) => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.getAvailableProblems(params))
  }
  return request.get<{ list: RelatedProblem[]; total: number }>({
    url: '/api/audit-decision/problems/available',
    params
  })
}

/**
 * 获取决定关联的问题列表
 */
export const getDecisionProblems = (decisionId: number) => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.getDecisionProblems(decisionId))
  }
  return request.get<RelatedProblem[]>({
    url: `/api/audit-decision/decisions/${decisionId}/problems`
  })
}

// ==================== 审核记录 ====================

/**
 * 获取审核历史记录
 */
export const getReviewHistory = (decisionId: number) => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.getReviewHistory(decisionId))
  }
  return request.get<ReviewRecord[]>({
    url: `/api/audit-decision/decisions/${decisionId}/reviews`
  })
}

// ==================== 整改情况 ====================

/**
 * 获取整改情况统计
 */
export const getRectificationStatistics = (decisionId: number) => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.getRectificationStatistics(decisionId))
  }
  return request.get<RectificationStatistics>({
    url: `/api/audit-decision/decisions/${decisionId}/rectification`
  })
}

// ==================== 被审计单位查看 ====================

/**
 * 获取被审计单位的项目列表
 */
export const getAuditedUnitProjects = (params: RectificationProjectQuery) => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.getAuditedUnitProjects(params))
  }
  return request.get<{ list: RectificationProject[]; total: number }>({
    url: '/api/audit-decision/audited-unit/projects',
    params
  })
}

/**
 * 获取被审计单位的决定列表
 */
export const getAuditedUnitDecisions = (projectId: number) => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.getAuditedUnitDecisions(projectId))
  }
  return request.get<AuditDecision[]>({
    url: `/api/audit-decision/audited-unit/projects/${projectId}/decisions`
  })
}
