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
  RectificationStatistics,
  RectificationProgressItem,
  RectificationProgressQuery,
  RectificationReportDetail,
  RectificationHistoryDetail,
  ProblemDetail,
  RectificationAdjustment,
  AdjustApprovalRecord,
  AdjustmentItem
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

// ==================== 整改进展（整改单位端）====================

/** 获取整改进展列表（整改单位端），支持关键字/整改状态/问题类别筛选与分页 */
export const getRectificationProgressList = (params: RectificationProgressQuery) => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.getRectificationProgressList(params))
  }
  return request.get<{ list: RectificationProgressItem[]; total: number }>({
    url: '/api/audit-decision/rectification-unit/progress',
    params
  })
}

// ==================== 填报整改（进展填报，整改单位端）====================

/** 获取填报整改详情（按问题ID），含措施表与整改成效 */
export const getRectificationReportDetail = (problemId: number) => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.getRectificationReportDetail(problemId))
  }
  return request.get<RectificationReportDetail>({
    url: `/api/audit-decision/rectification-unit/report-detail/${problemId}`
  })
}

/** 保存填报整改详情 */
export const saveRectificationReport = (data: RectificationReportDetail) => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.saveRectificationReport(data))
  }
  return request.post<boolean>({
    url: '/api/audit-decision/rectification-unit/report-save',
    data
  })
}

/** 获取整改历史列表（按问题ID），返回历次已提交的填报快照，用于填报页「整改历史」抽屉 */
export const getRectificationHistoryDetail = (problemId: number) => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.getRectificationHistoryDetail(problemId))
  }
  return request.get<RectificationHistoryDetail[]>({
    url: `/api/audit-decision/rectification-unit/report-history/${problemId}`
  })
}

/** 获取问题详情（基础信息+整改进展+整改成效+销号结果），用于填报进展页大弹窗 */
export const getProblemDetail = (problemId: number) => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.getProblemDetail(problemId))
  }
  return request.get<ProblemDetail>({
    url: `/api/audit-decision/rectification-unit/problem-detail/${problemId}`
  })
}

// ==================== 整改调整（整改单位端）====================

/** 调整申请查询参数（筛选：项目名称关键字 / 状态 / 提交单位） */
export interface AdjustmentQuery {
  projectName?: string
  approvalStatus?: number | null
  applyUnit?: string
  page: number
  pageSize: number
}

/** 获取可调整问题列表（跨项目，含不可选标记） */
export const getAdjustableProblems = () => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.getAdjustableProblems())
  }
  return request.get<{ list: any[] }>({
    url: '/api/audit-decision/adjustment/adjustable-problems'
  })
}

/** 获取调整申请列表（分页 + 筛选） */
export const getAdjustmentList = (params: AdjustmentQuery) => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.getAdjustmentList(params))
  }
  return request.get<{ list: RectificationAdjustment[]; total: number }>({
    url: '/api/audit-decision/adjustment/list',
    params
  })
}

/** 获取提交单位选项（用于列表筛选下拉） */
export const getAdjustmentUnitOptions = () => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.getAdjustmentUnitOptions())
  }
  return request.get<string[]>({
    url: '/api/audit-decision/adjustment/unit-options'
  })
}

/** 获取调整申请详情 */
export const getAdjustmentDetail = (id: number) => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.getAdjustmentDetail(id))
  }
  return request.get<RectificationAdjustment>({
    url: `/api/audit-decision/adjustment/${id}`
  })
}

/** 新增调整申请（草稿或提交，approvalStatus=1 草稿 / 2 提交审批） */
export const addAdjustment = (data: Partial<RectificationAdjustment>) => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.addAdjustment(data))
  }
  return request.post<{ id: number }>({
    url: '/api/audit-decision/adjustment',
    data
  })
}

/** 编辑调整申请 */
export const updateAdjustment = (id: number, data: Partial<RectificationAdjustment>) => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.updateAdjustment(id, data))
  }
  return request.put<null>({
    url: `/api/audit-decision/adjustment/${id}`,
    data
  })
}

/** 撤回调整申请（审批中 → 草稿） */
export const withdrawAdjustment = (id: number) => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.withdrawAdjustment(id))
  }
  return request.post<null>({
    url: `/api/audit-decision/adjustment/${id}/withdraw`
  })
}

/** 提交调整申请（待提交 → 审批中，支持批量） */
export const submitAdjustment = (ids: number[]) => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.submitAdjustment(ids))
  }
  return request.post<{ success: number }>({
    url: '/api/audit-decision/adjustment/submit',
    data: { ids }
  })
}

/** 删除调整申请（仅草稿） */
export const deleteAdjustment = (id: number) => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.deleteAdjustment(id))
  }
  return request.del<null>({
    url: `/api/audit-decision/adjustment/${id}`
  })
}

/** 获取调整申请审批记录 */
export const getAdjustmentApprovalRecords = (id: number) => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.getAdjustmentApprovalRecords(id))
  }
  return request.get<AdjustApprovalRecord[]>({
    url: `/api/audit-decision/adjustment/${id}/approval-records`
  })
}

/** 获取待审批的调整申请列表（审批中态） */
export const getPendingApprovals = () => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.getPendingApprovals())
  }
  return request.get<{ list: any[] }>({
    url: '/api/audit-decision/adjustment/pending-approvals'
  })
}

/** 提交审批（同意/退回，审批人可附带修改后的时限/措施明细） */
export const approveAdjustment = (params: {
  id: number
  result: '通过' | '驳回'
  opinion: string
  approver?: string
  level?: string
  items?: AdjustmentItem[]
}) => {
  if (USE_MOCK) {
    return import('@/mock/audit-decision').then((m) => m.approveAdjustment(params))
  }
  return request.post<null>({
    url: `/api/audit-decision/adjustment/${params.id}/approve`,
    data: params
  })
}
