/**
 * 审计决定模块Mock数据
 */
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
  ProblemDetail,
  RectificationAdjustment,
  AdjustmentItem,
  AdjustApprovalRecord
} from '@/types/audit-decision'

// 模拟延迟
const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms))

// 模拟整改项目数据
const mockProjects: RectificationProject[] = [
  {
    id: 1,
    projectName: '2026年度财务审计项目',
    projectCode: 'PROJ-2026-001',
    auditYear: '2026',
    auditedUnit: 'ZK审计部',
    auditType: 1,
    auditStartDate: '2026-01-01',
    auditEndDate: '2026-03-31',
    projectDescription: '对2025年度财务报表进行全面审计',
    decisionCount: 3,
    transferCount: 2,
    projectStatus: 1,
    createdBy: '张三',
    createdAt: '2026-01-01 09:00:00',
    updatedAt: '2026-04-10 15:51:53'
  },
  {
    id: 2,
    projectName: '合规性专项审计',
    projectCode: 'PROJ-2026-002',
    auditYear: '2026',
    auditedUnit: 'ZK审计部',
    auditType: 2,
    auditStartDate: '2026-02-01',
    auditEndDate: '2026-04-30',
    projectDescription: '对公司合规性进行专项审计',
    decisionCount: 1,
    transferCount: 1,
    projectStatus: 1,
    createdBy: '李四',
    createdAt: '2026-02-01 10:00:00',
    updatedAt: '2026-04-10 15:51:53'
  }
]

// 模拟审计决定数据
const mockDecisions: AuditDecision[] = [
  {
    id: 1,
    projectId: 1,
    projectName: '2026年度财务审计项目',
    decisionName: '关于财务报表审计的决定',
    decisionCode: 'ZG001',
    issueDate: '2026-04-10',
    involvedAmount: 150.5,
    problemCount: 5,
    mainRecipient: '江苏南京石油分公司',
    ccRecipient: '财务部、监察部',
    responsibleUnit: '江苏南京石油分公司',
    rectificationDeadline: '2026-04-30',
    decisionDescription: '经审计发现财务报表存在多处问题，需要整改',
    legalBasis: '《审计法》第三十条',
    penaltyOpinion: '责令限期整改',
    attachments: [
      {
        id: 1,
        name: '审计报告.pdf',
        url: '/files/audit-report.pdf',
        size: 1024000,
        type: 'application/pdf',
        uploadTime: '2026-04-10 15:00:00'
      },
      {
        id: 2,
        name: '财务报表分析.xlsx',
        url: '/files/financial-analysis.xlsx',
        size: 512000,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        uploadTime: '2026-04-10 15:10:00'
      },
      {
        id: 3,
        name: '问题清单.docx',
        url: '/files/problem-list.docx',
        size: 256000,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        uploadTime: '2026-04-10 15:20:00'
      }
    ],
    reviewStatus: 3,
    issueStatus: 1,
    rectificationStatus: 3,
    createdBy: '李三',
    createdAt: '2026-04-10 15:51:53',
    updatedAt: '2026-04-10 15:51:53',
    issuedBy: '张三',
    issuedAt: '2026-04-10 16:00:00'
  },
  {
    id: 2,
    projectId: 1,
    projectName: '2026年度财务审计项目',
    decisionName: '关于内部控制审计的决定',
    decisionCode: 'ZG002',
    issueDate: '2026-04-11',
    involvedAmount: 80.0,
    problemCount: 3,
    mainRecipient: '江苏无锡石油分公司',
    ccRecipient: '内控部',
    responsibleUnit: '江苏无锡石油分公司',
    rectificationDeadline: '2026-05-15',
    decisionDescription: '内部控制存在缺陷，需要加强管理',
    legalBasis: '《审计法》第三十条',
    penaltyOpinion: '责令限期整改',
    attachments: [
      {
        id: 4,
        name: '内部控制审计报告.pdf',
        url: '/files/internal-control-report.pdf',
        size: 896000,
        type: 'application/pdf',
        uploadTime: '2026-04-11 09:30:00'
      }
    ],
    reviewStatus: 2,
    issueStatus: 0,
    rectificationStatus: 2,
    createdBy: '李三',
    createdAt: '2026-04-11 10:00:00',
    updatedAt: '2026-04-11 10:00:00'
  },
  {
    id: 3,
    projectId: 1,
    projectName: '2026年度财务审计项目',
    decisionName: '关于资产管理审计的决定',
    decisionCode: 'ZG003',
    issueDate: '2026-04-12',
    involvedAmount: 200.0,
    problemCount: 4,
    mainRecipient: '江苏徐州石油分公司',
    ccRecipient: '资产管理部、财务部',
    responsibleUnit: '江苏徐州石油分公司',
    rectificationDeadline: '2026-05-20',
    decisionDescription: '资产管理不规范，需要整改',
    legalBasis: '《审计法》第三十条',
    penaltyOpinion: '责令限期整改',
    attachments: [
      {
        id: 5,
        name: '资产管理审计报告.pdf',
        url: '/files/asset-management-report.pdf',
        size: 1536000,
        type: 'application/pdf',
        uploadTime: '2026-04-12 08:30:00'
      },
      {
        id: 6,
        name: '资产盘点表.xlsx',
        url: '/files/asset-inventory.xlsx',
        size: 768000,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        uploadTime: '2026-04-12 08:45:00'
      }
    ],
    reviewStatus: 1,
    issueStatus: 0,
    rectificationStatus: 1,
    createdBy: '李三',
    createdAt: '2026-04-12 09:00:00',
    updatedAt: '2026-04-12 09:00:00'
  },
  {
    id: 4,
    projectId: 2,
    projectName: '合规性专项审计',
    decisionName: '关于合规性问题的审计决定',
    decisionCode: 'ZG004',
    issueDate: '2026-04-15',
    involvedAmount: 120.0,
    problemCount: 4,
    mainRecipient: '江苏南京石油分公司',
    ccRecipient: '法务部、合规部',
    responsibleUnit: '江苏南京石油分公司',
    rectificationDeadline: '2026-05-30',
    decisionDescription: '经审计发现合规性管理存在多处问题，需要立即整改',
    legalBasis: '《审计法》第三十条、《公司法》第一百四十七条',
    penaltyOpinion: '责令限期整改，并加强合规培训',
    attachments: [
      {
        id: 7,
        name: '合规性审计报告.pdf',
        url: '/files/compliance-report.pdf',
        size: 2048000,
        type: 'application/pdf',
        uploadTime: '2026-04-15 10:00:00'
      },
      {
        id: 8,
        name: '合规问题清单.xlsx',
        url: '/files/compliance-issues.xlsx',
        size: 384000,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        uploadTime: '2026-04-15 10:15:00'
      }
    ],
    reviewStatus: 3,
    issueStatus: 1,
    rectificationStatus: 2,
    createdBy: '王五',
    createdAt: '2026-04-15 09:00:00',
    updatedAt: '2026-04-15 14:00:00',
    issuedBy: '赵六',
    issuedAt: '2026-04-15 15:00:00'
  }
]

// 模拟关联问题数据
const mockProblems: RelatedProblem[] = [
  {
    id: 1,
    problemTitle: '财务报表数据不准确',
    problemCategory: '财务管理',
    belongUnit: 'ZK审计部',
    involvedAmount: 50.5,
    rectificationStatus: 3,
    rectificationProgress: '已完成整改，重新编制财务报表',
    updatedAt: '2026-04-15 10:00:00'
  },
  {
    id: 2,
    problemTitle: '内部控制流程不完善',
    problemCategory: '内部控制',
    belongUnit: 'ZK审计部',
    involvedAmount: 30.0,
    rectificationStatus: 2,
    rectificationProgress: '正在完善内部控制流程',
    updatedAt: '2026-04-16 11:00:00'
  },
  {
    id: 3,
    problemTitle: '资产盘点不及时',
    problemCategory: '资产管理',
    belongUnit: 'ZK审计部',
    involvedAmount: 40.0,
    rectificationStatus: 2,
    rectificationProgress: '正在进行资产盘点',
    updatedAt: '2026-04-17 09:00:00'
  },
  {
    id: 4,
    problemTitle: '费用报销审批不规范',
    problemCategory: '财务管理',
    belongUnit: 'ZK审计部',
    involvedAmount: 20.0,
    rectificationStatus: 2,
    rectificationProgress: '正在规范费用报销流程',
    updatedAt: '2026-04-18 14:00:00'
  },
  {
    id: 5,
    problemTitle: '固定资产管理混乱',
    problemCategory: '资产管理',
    belongUnit: 'ZK审计部',
    involvedAmount: 10.0,
    rectificationStatus: 1,
    rectificationProgress: '尚未开始整改',
    updatedAt: '2026-04-19 08:00:00'
  }
]

// 模拟审核记录数据
const mockReviewRecords: ReviewRecord[] = [
  {
    id: 1,
    decisionId: 1,
    reviewLevel: '一级审核',
    reviewer: '王五',
    reviewTime: '2026-04-10 16:00:00',
    reviewResult: 1,
    reviewOpinion: '审核通过，决定内容完整，法律依据充分，同意提交二级审核'
  },
  {
    id: 2,
    decisionId: 1,
    reviewLevel: '二级审核',
    reviewer: '赵六',
    reviewTime: '2026-04-10 17:00:00',
    reviewResult: 1,
    reviewOpinion: '最终审批通过，同意下达审计决定'
  },
  {
    id: 3,
    decisionId: 2,
    reviewLevel: '一级审核',
    reviewer: '王五',
    reviewTime: '2026-04-11 11:00:00',
    reviewResult: 1,
    reviewOpinion: '审核通过，内部控制问题描述清晰，整改措施合理'
  },
  {
    id: 4,
    decisionId: 2,
    reviewLevel: '二级审核',
    reviewer: '赵六',
    reviewTime: '2026-04-11 14:00:00',
    reviewResult: 1,
    reviewOpinion: '最终审批通过'
  },
  {
    id: 5,
    decisionId: 4,
    reviewLevel: '一级审核',
    reviewer: '李四',
    reviewTime: '2026-04-15 11:00:00',
    reviewResult: 1,
    reviewOpinion: '合规性问题描述详细，整改措施得当，同意提交二级审核'
  },
  {
    id: 6,
    decisionId: 4,
    reviewLevel: '二级审核',
    reviewer: '张三',
    reviewTime: '2026-04-15 14:00:00',
    reviewResult: 1,
    reviewOpinion: '最终审批通过，同意下达审计决定'
  }
]

// ==================== 整改项目管理 ====================

export const getRectificationProjectList = async (params: RectificationProjectQuery) => {
  await delay()
  let filteredProjects = [...mockProjects]

  // 筛选逻辑
  if (params.projectName) {
    filteredProjects = filteredProjects.filter((p) => p.projectName.includes(params.projectName!))
  }
  if (params.projectCode) {
    filteredProjects = filteredProjects.filter((p) => p.projectCode.includes(params.projectCode!))
  }
  if (params.auditedUnit) {
    filteredProjects = filteredProjects.filter((p) => p.auditedUnit.includes(params.auditedUnit!))
  }
  if (params.auditType) {
    filteredProjects = filteredProjects.filter((p) => p.auditType === Number(params.auditType))
  }
  if (params.projectStatus) {
    filteredProjects = filteredProjects.filter(
      (p) => p.projectStatus === Number(params.projectStatus)
    )
  }

  const total = filteredProjects.length
  const start = (params.page - 1) * params.pageSize
  const end = start + params.pageSize
  const list = filteredProjects.slice(start, end)

  return { code: 200, message: '成功', data: { list, total } }
}

export const getRectificationProjectDetail = async (id: number) => {
  await delay()
  const project = mockProjects.find((p) => p.id === id)
  if (!project) {
    return { code: 404, message: '项目不存在', data: null }
  }
  return { code: 200, message: '成功', data: project }
}

export const addRectificationProject = async (data: RectificationProjectForm) => {
  await delay()
  const newId = mockProjects.length + 1
  const newProject: RectificationProject = {
    id: newId,
    ...data,
    projectCode:
      data.projectCode || `PROJ-${new Date().getFullYear()}-${String(newId).padStart(3, '0')}`,
    decisionCount: 0,
    transferCount: 0,
    createdBy: '当前用户',
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
  }
  mockProjects.push(newProject)
  return { code: 200, message: '新增成功', data: newProject }
}

export const updateRectificationProject = async (id: number, data: RectificationProjectForm) => {
  await delay()
  const index = mockProjects.findIndex((p) => p.id === id)
  if (index === -1) {
    return { code: 404, message: '项目不存在', data: null }
  }
  mockProjects[index] = {
    ...mockProjects[index],
    ...data,
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
  }
  return { code: 200, message: '更新成功', data: mockProjects[index] }
}

export const deleteRectificationProject = async (id: number) => {
  await delay()
  const index = mockProjects.findIndex((p) => p.id === id)
  if (index === -1) {
    return { code: 404, message: '项目不存在', data: null }
  }
  if (mockProjects[index].decisionCount > 0) {
    return { code: 400, message: '该项目下有关联决定，无法删除', data: null }
  }
  mockProjects.splice(index, 1)
  return { code: 200, message: '删除成功', data: null }
}

// ==================== 审计决定管理 ====================

export const getAuditDecisionList = async (params: AuditDecisionQuery) => {
  await delay()
  let filteredDecisions = [...mockDecisions]

  // 筛选逻辑
  if (params.projectId) {
    filteredDecisions = filteredDecisions.filter((d) => d.projectId === Number(params.projectId))
  }
  if (params.decisionName) {
    filteredDecisions = filteredDecisions.filter((d) =>
      d.decisionName.includes(params.decisionName!)
    )
  }
  if (params.decisionCode) {
    filteredDecisions = filteredDecisions.filter((d) =>
      d.decisionCode.includes(params.decisionCode!)
    )
  }
  // 主送部门：下拉精确匹配
  if (params.mainRecipient) {
    filteredDecisions = filteredDecisions.filter((d) => d.mainRecipient === params.mainRecipient)
  }
  // 责任单位：机构树精确匹配
  if (params.responsibleUnit) {
    filteredDecisions = filteredDecisions.filter(
      (d) => d.responsibleUnit === params.responsibleUnit
    )
  }
  if (params.reviewStatus) {
    filteredDecisions = filteredDecisions.filter(
      (d) => d.reviewStatus === Number(params.reviewStatus)
    )
  }
  if (
    params.issueStatus !== undefined &&
    params.issueStatus !== null &&
    params.issueStatus !== ''
  ) {
    filteredDecisions = filteredDecisions.filter(
      (d) => d.issueStatus === Number(params.issueStatus)
    )
  }
  if (params.rectificationStatus) {
    filteredDecisions = filteredDecisions.filter(
      (d) => d.rectificationStatus === Number(params.rectificationStatus)
    )
  }

  const total = filteredDecisions.length
  const start = (params.page - 1) * params.pageSize
  const end = start + params.pageSize
  const list = filteredDecisions.slice(start, end)

  return { code: 200, message: '成功', data: { list, total } }
}

export const getAuditDecisionDetail = async (id: number) => {
  await delay()
  const decision = mockDecisions.find((d) => d.id === id)
  if (!decision) {
    return { code: 404, message: '决定不存在', data: null }
  }
  return { code: 200, message: '成功', data: decision }
}

export const addAuditDecision = async (data: AuditDecisionForm) => {
  await delay()
  const project = mockProjects.find((p) => p.id === data.projectId)
  if (!project) {
    return { code: 404, message: '项目不存在', data: null }
  }

  // 计算涉及金额和问题数量
  const relatedProblems = mockProblems.filter((p) => data.problemIds.includes(p.id))
  const involvedAmount = relatedProblems.reduce((sum, p) => sum + p.involvedAmount, 0)
  const problemCount = relatedProblems.length

  const newDecision: AuditDecision = {
    id: mockDecisions.length + 1,
    projectId: data.projectId,
    projectName: project.projectName,
    decisionName: data.decisionName,
    decisionCode: data.decisionCode,
    issueDate: data.issueDate,
    involvedAmount,
    problemCount,
    mainRecipient: data.mainRecipient,
    responsibleUnit: data.responsibleUnit,
    rectificationDeadline: data.rectificationDeadline,
    decisionDescription: data.decisionDescription,
    legalBasis: data.legalBasis,
    penaltyOpinion: data.penaltyOpinion,
    attachments: data.attachments,
    reviewStatus: 1,
    issueStatus: 0,
    rectificationStatus: 1,
    createdBy: '当前用户',
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
  }
  mockDecisions.push(newDecision)

  // 更新项目的决定数量
  project.decisionCount++

  return { code: 200, message: '新增成功', data: newDecision }
}

export const updateAuditDecision = async (id: number, data: AuditDecisionForm) => {
  await delay()
  const index = mockDecisions.findIndex((d) => d.id === id)
  if (index === -1) {
    return { code: 404, message: '决定不存在', data: null }
  }

  const decision = mockDecisions[index]
  if (decision.reviewStatus !== 1 && decision.reviewStatus !== 4) {
    return { code: 400, message: '只能编辑草稿或已退回的决定', data: null }
  }

  // 重新计算涉及金额和问题数量
  const relatedProblems = mockProblems.filter((p) => data.problemIds.includes(p.id))
  const involvedAmount = relatedProblems.reduce((sum, p) => sum + p.involvedAmount, 0)
  const problemCount = relatedProblems.length

  mockDecisions[index] = {
    ...decision,
    decisionName: data.decisionName,
    decisionCode: data.decisionCode,
    issueDate: data.issueDate,
    involvedAmount,
    problemCount,
    mainRecipient: data.mainRecipient,
    responsibleUnit: data.responsibleUnit,
    rectificationDeadline: data.rectificationDeadline,
    decisionDescription: data.decisionDescription,
    legalBasis: data.legalBasis,
    penaltyOpinion: data.penaltyOpinion,
    attachments: data.attachments,
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
  }

  return { code: 200, message: '更新成功', data: mockDecisions[index] }
}

export const deleteAuditDecision = async (id: number) => {
  await delay()
  const index = mockDecisions.findIndex((d) => d.id === id)
  if (index === -1) {
    return { code: 404, message: '决定不存在', data: null }
  }

  const decision = mockDecisions[index]
  if (decision.reviewStatus !== 1) {
    return { code: 400, message: '只能删除草稿状态的决定', data: null }
  }

  // 更新项目的决定数量
  const project = mockProjects.find((p) => p.id === decision.projectId)
  if (project) {
    project.decisionCount--
  }

  mockDecisions.splice(index, 1)
  return { code: 200, message: '删除成功', data: null }
}

export const submitForReview = async (id: number) => {
  await delay()
  const decision = mockDecisions.find((d) => d.id === id)
  if (!decision) {
    return { code: 404, message: '决定不存在', data: null }
  }
  if (decision.reviewStatus !== 1 && decision.reviewStatus !== 4) {
    return { code: 400, message: '只能提交草稿或已退回的决定', data: null }
  }
  decision.reviewStatus = 2
  decision.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19)
  return { code: 200, message: '提交成功', data: decision }
}

export const reviewDecision = async (
  id: number,
  data: { reviewResult: number; reviewOpinion: string }
) => {
  await delay()
  const decision = mockDecisions.find((d) => d.id === id)
  if (!decision) {
    return { code: 404, message: '决定不存在', data: null }
  }
  if (decision.reviewStatus !== 2) {
    return { code: 400, message: '只能审核审核中的决定', data: null }
  }

  if (data.reviewResult === 1) {
    // 审核通过
    decision.reviewStatus = 3
  } else {
    // 审核不通过
    decision.reviewStatus = 4
  }
  decision.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19)

  // 添加审核记录
  const newRecord: ReviewRecord = {
    id: mockReviewRecords.length + 1,
    decisionId: id,
    reviewLevel: '一级审核',
    reviewer: '当前用户',
    reviewTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    reviewResult: data.reviewResult,
    reviewOpinion: data.reviewOpinion
  }
  mockReviewRecords.push(newRecord)

  return { code: 200, message: '审核成功', data: decision }
}

export const issueDecision = async (id: number) => {
  await delay()
  const decision = mockDecisions.find((d) => d.id === id)
  if (!decision) {
    return { code: 404, message: '决定不存在', data: null }
  }
  if (decision.reviewStatus !== 3) {
    return { code: 400, message: '只能下达审核通过的决定', data: null }
  }
  if (decision.issueStatus === 1) {
    return { code: 400, message: '该决定已下达', data: null }
  }
  decision.issueStatus = 1
  decision.issuedBy = '当前用户'
  decision.issuedAt = new Date().toISOString().replace('T', ' ').substring(0, 19)
  decision.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19)
  return { code: 200, message: '下达成功', data: decision }
}

export const batchIssueDecisions = async (ids: number[]) => {
  await delay()
  let successCount = 0
  let failCount = 0

  for (const id of ids) {
    const decision = mockDecisions.find((d) => d.id === id)
    if (decision && decision.reviewStatus === 3 && decision.issueStatus === 0) {
      decision.issueStatus = 1
      decision.issuedBy = '当前用户'
      decision.issuedAt = new Date().toISOString().replace('T', ' ').substring(0, 19)
      decision.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19)
      successCount++
    } else {
      failCount++
    }
  }

  return {
    code: 200,
    message: `批量下达完成，成功${successCount}个，失败${failCount}个`,
    data: { successCount, failCount }
  }
}

export const exportAuditDecisionList = async (params?: AuditDecisionQuery) => {
  await delay()
  // 模拟导出，实际应返回文件流；保留参数以兼容调用方
  void params
  return { code: 200, message: '导出成功', data: null }
}

// ==================== 关联问题管理 ====================

export const getAvailableProblems = async (params: RelatedProblemQuery) => {
  await delay()
  let filteredProblems = [...mockProblems]

  // 筛选逻辑
  if (params.problemTitle) {
    filteredProblems = filteredProblems.filter((p) => p.problemTitle.includes(params.problemTitle!))
  }
  if (params.problemCategory) {
    filteredProblems = filteredProblems.filter((p) => p.problemCategory === params.problemCategory)
  }
  if (params.belongUnit) {
    filteredProblems = filteredProblems.filter((p) => p.belongUnit === params.belongUnit)
  }
  if (params.rectificationStatus) {
    filteredProblems = filteredProblems.filter(
      (p) => p.rectificationStatus === Number(params.rectificationStatus)
    )
  }

  const total = filteredProblems.length
  const start = (params.page - 1) * params.pageSize
  const end = start + params.pageSize
  const list = filteredProblems.slice(start, end)

  return { code: 200, message: '成功', data: { list, total } }
}

export const getDecisionProblems = async (decisionId: number) => {
  await delay()
  // 根据决定ID返回对应的关联问题
  let problems: RelatedProblem[] = []

  if (decisionId === 1) {
    // 决定1关联5个问题
    problems = mockProblems.slice(0, 5)
  } else if (decisionId === 2) {
    // 决定2关联3个问题
    problems = mockProblems.slice(1, 4)
  } else if (decisionId === 3) {
    // 决定3关联4个问题
    problems = mockProblems.slice(0, 4)
  } else if (decisionId === 4) {
    // 决定4关联4个问题
    problems = mockProblems.slice(0, 4)
  } else {
    // 其他决定返回前3个问题
    problems = mockProblems.slice(0, 3)
  }

  return { code: 200, message: '成功', data: problems }
}

// ==================== 审核记录 ====================

export const getReviewHistory = async (decisionId: number) => {
  await delay()
  const records = mockReviewRecords.filter((r) => r.decisionId === decisionId)
  return { code: 200, message: '成功', data: records }
}

// ==================== 整改情况 ====================

export const getRectificationStatistics = async (decisionId: number) => {
  await delay()
  const decision = mockDecisions.find((d) => d.id === decisionId)
  if (!decision) {
    return { code: 404, message: '决定不存在', data: null }
  }

  // 模拟整改情况统计
  const statistics: RectificationStatistics = {
    decisionId: decision.id,
    decisionName: decision.decisionName,
    decisionCode: decision.decisionCode,
    responsibleUnit: decision.responsibleUnit,
    rectificationDeadline: decision.rectificationDeadline,
    rectificationStatus: decision.rectificationStatus,
    totalProblems: decision.problemCount,
    completedProblems: 1,
    inProgressProblems: 3,
    notStartedProblems: 1,
    completionRate: 20
  }

  return { code: 200, message: '成功', data: statistics }
}

// ==================== 被审计单位查看 ====================

export const getAuditedUnitProjects = async (params: RectificationProjectQuery) => {
  await delay()
  // 模拟返回被审计单位的项目（这里简化处理，返回所有已下达的项目）
  const filteredProjects = mockProjects.filter((p) => p.decisionCount > 0)

  const total = filteredProjects.length
  const start = (params.page - 1) * params.pageSize
  const end = start + params.pageSize
  const list = filteredProjects.slice(start, end)

  return { code: 200, message: '成功', data: { list, total } }
}

export const getAuditedUnitDecisions = async (projectId: number) => {
  await delay()
  // 模拟返回被审计单位的决定（只返回已下达的决定）
  const decisions = mockDecisions.filter((d) => d.projectId === projectId && d.issueStatus === 1)
  return { code: 200, message: '成功', data: decisions }
}

// ==================== 整改进展（整改单位端）====================

// 整改进展Mock数据（复刻自审计系统整改进展页，每条为一个审计问题）
const mockProgressItems: RectificationProgressItem[] = [
  {
    id: 1,
    problemCode: 'ZGXM-2026-0020-zgwt-0003',
    problemTitle: '违规开立银行账户',
    problemDesc:
      '2013年12月，学校在工商银行**支行已开立银行账户的情况下，又在中国民生银行**分行设立临时账户，该账户主要是*****汽车总厂政策性破产清算组转入的破产清算余额1687.93万元及账户存款利息等28.58万元。2018年12月13日，国企办将民生银行...',
    legalBasis:
      '该账户开立未通过财政局审核和人民银行核准，不符合《***财政局中国人民银行**监察局关于规范预算单位银行账户管理的通知》(财库[2013]145)第四条(一)"开立:预算单位需要开立银行账户时，应报送有关材料，由财务部门报...',
    problemType: '财务管理',
    rectificationStatus: 1,
    processStatus: 1
  },
  {
    id: 2,
    problemCode: 'ZGXM-2026-0020-zgwt-0002',
    problemTitle: '银行账户资金未在法定账目上进行会计核算和管理',
    problemDesc:
      '根据学校提供的民生银行对账单显示，至2018年12月13日民生银行**支行账户余额资金1716.51万元，该账户2013年12月9日至2018年12月13日的财务活动均未在学校账目上进行会计记录，脱离单位财务的核算和管理。',
    legalBasis:
      '根据《财政违法行为处罚3处分条例》第四讲第七点"将财政资金或者其他公款私存私放的行为:将财政资金或者其他公款私存私放的行为，就是未将资金收入、支出等财务活动在法定账目按照会计制度进行会计记录，未按规定存放资金...',
    problemType: '会计核算',
    rectificationStatus: 1,
    processStatus: 1
  },
  {
    id: 3,
    problemCode: 'ZGXM-2026-0020-zgwt-0001',
    problemTitle: '资产交接不完整，存在流失隐患',
    problemDesc:
      '根据2013年11月30日学校(乙方)与***汽车总厂政策性破产清算组(甲方)签订《***汽车总厂政策性破产清算事务移交协议》第二条"清算组银行存款1690.44万元,甲乙双方确认的***汽车总厂政策性破产清算组存款全部汇入乙方。基准...',
    legalBasis:
      '根据《财政违法行为处罚处分条例》第四讲第七点"将财政资金或者其他公款私存私放的行为:将财政资金或者其他公款私存私放的行为，就是未将资金收入、支出等财务活动在法定账目按照会计制度进行会计记录，未按规定存放资金...',
    problemType: '资产管理',
    rectificationStatus: 1,
    processStatus: 1
  }
]

/** 获取整改进展列表，支持按关键字/整改状态/问题类别筛选与分页 */
export const getRectificationProgressList = async (params: RectificationProgressQuery) => {
  await delay()
  let list = [...mockProgressItems]

  // 按编号、问题标题筛选
  if (params.keyword) {
    const kw = params.keyword
    list = list.filter((item) => item.problemCode.includes(kw) || item.problemTitle.includes(kw))
  }
  // 按整改状态筛选
  if (params.rectificationStatus !== null && params.rectificationStatus !== undefined) {
    list = list.filter((item) => item.rectificationStatus === Number(params.rectificationStatus))
  }
  // 按问题类别筛选
  if (params.problemType) {
    list = list.filter((item) => item.problemType === params.problemType)
  }

  const total = list.length
  const start = (params.page - 1) * params.pageSize
  const end = start + params.pageSize
  const pageList = list.slice(start, end)

  return { code: 200, message: '成功', data: { list: pageList, total } }
}

// ==================== 填报整改（进展填报，整改单位端）====================

// 复刻截图的措施文本
const sampleMeasureText =
  '加大银行账户资金的监管力度，增强法律观念和责任意识，确保公共资金安全。加大银行账户资金的监管力度，增强法律观念和责任意识，确保公共资金安全。加大银行账户资金的监管力度，增强法律观念和责任意识，确保公共资金安全。'

// 填报整改详情持久化数据（按 problemId 存储）
const mockReportDetails: Record<number, RectificationReportDetail> = {
  1: {
    problemId: 1,
    problemCode: 'ZGXM-2026-0020-zgwt-0003',
    problemTitle: '违规开立银行账户',
    rectificationStatus: 2,
    measures: [
      {
        id: 1,
        measure: sampleMeasureText,
        responsible: '赵六',
        finishStatus: null,
        progressDesc: ''
      },
      {
        id: 2,
        measure: sampleMeasureText,
        responsible: '赵六',
        // 措施已完成：状态与进展情况均锁定，回显上一轮填报内容
        finishStatus: 3,
        progressDesc:
          '已完成该措施整改：已加大银行账户资金的监管力度，组织全员法律培训增强法律观念和责任意识，并建立资金使用台账与定期核查机制，确保公共资金安全。相关制度已印发执行。',
        lastProgressDesc:
          '已完成该措施整改：已加大银行账户资金的监管力度，组织全员法律培训增强法律观念和责任意识，并建立资金使用台账与定期核查机制，确保公共资金安全。相关制度已印发执行。'
      }
    ],
    attachments: [],
    correctedAmount: 0,
    recoveredAmount: 0,
    auditReducedAmount: 0,
    otherSavingAmount: 0,
    systemRecords: [],
    processRecords: []
  },
  2: {
    problemId: 2,
    problemCode: 'ZGXM-2026-0020-zgwt-0002',
    problemTitle: '银行账户资金未在法定账目上进行会计核算和管理',
    rectificationStatus: 1,
    measures: [
      {
        id: 1,
        measure: '将账户资金纳入单位法定账目统一核算管理。',
        responsible: '钱七',
        finishStatus: null,
        progressDesc: ''
      }
    ],
    attachments: [],
    correctedAmount: 0,
    recoveredAmount: 0,
    auditReducedAmount: 0,
    otherSavingAmount: 0,
    systemRecords: [],
    processRecords: []
  },
  3: {
    problemId: 3,
    problemCode: 'ZGXM-2026-0020-zgwt-0001',
    problemTitle: '资产交接不完整，存在流失隐患',
    rectificationStatus: 1,
    measures: [
      {
        id: 1,
        measure: '完善资产交接清单，明确交接责任，杜绝资产流失。',
        responsible: '孙八',
        finishStatus: null,
        progressDesc: ''
      }
    ],
    attachments: [],
    correctedAmount: 0,
    recoveredAmount: 0,
    auditReducedAmount: 0,
    otherSavingAmount: 0,
    systemRecords: [],
    processRecords: []
  }
}

/** 获取填报整改详情，按 problemId 返回（含措施表与整改成效） */
export const getRectificationReportDetail = async (problemId: number) => {
  await delay()
  const detail = mockReportDetails[problemId] || mockReportDetails[1]
  return { code: 200, message: '成功', data: detail }
}

/** 保存填报整改详情（持久化到模块级变量，保证再次进入数据一致） */
export const saveRectificationReport = async (data: RectificationReportDetail) => {
  await delay()
  mockReportDetails[data.problemId] = { ...data }
  // 同步整改进展列表中的整改状态
  const item = mockProgressItems.find((i) => i.id === data.problemId)
  if (item) {
    item.rectificationStatus = data.rectificationStatus
    item.processStatus = data.rectificationStatus
  }
  return { code: 200, message: '保存成功', data: true }
}

// ==================== 问题详情大弹窗（填报进展页）====================

// 问题详情持久化数据（按 problemId 存储），复刻自截图
const mockProblemDetails: Record<number, ProblemDetail> = {
  1: {
    problemCode: 'ZGXM-2026-0020-zgwt-0003',
    problemTitle: '违规开立银行账户',
    problemDesc:
      '2013年12月，学校在工商银行**支行已开立银行账户的情况下，又在中国民生银行**分行设立临时账户，该账户主要是*****汽车总厂政策性破产清算组转入的破产清算余额1687.93万元及银行存款利息等28.58万元。2018年12月13日，国企办将民生银行账户上资金1716.51万元转入该办在工商银行开设的账户，撤销了中国民生银行账户。',
    legalBasis:
      '该账户开立未通过财政局审核和人民银行核准，不符合《***财政局中国人民银行**监察局关于规范预算单位银行账户管理的通知》(财库[2013]145)第四条(一)"开立:预算单位需要开立银行账户时，应报送有关材料，由财务部门报财政局审核。......审核通过的，预算单位应及时持财政局盖章的"预算单位开立银行账户申请表"......及时到商业银行办理开户申请，经人民银行核准后依法使用......"的规定。',
    auditSuggestion: '加大银行账户资金的监管力度，增强法律观念和责任意识，确保公共资金安全。',
    problemType: '资金管理',
    isAmountType: true,
    involvedAmount: 1716.51,
    rectificationType: '持续整改',
    rectificationDeadline: '2031-06-12 18:09:43',
    leadUnit: 'ZY股份',
    belongUnit: '',
    planItems: [
      {
        id: 1,
        seq: 1,
        measure: '加大银行账户资金的监管力度，增强法律观念和责任意识，确保公共资金安全。',
        planFinishTime: '2031-06-12',
        responsible: '赵六'
      }
    ],
    progressRecords: [
      {
        id: 1,
        seq: 1,
        completedProgress: '',
        ongoingProgress:
          '完成该措施，加大了银行账户资金的监管力度，增强法律观念和责任意识，确保公共资金安全。\n完成了部分整改',
        notRectifiedReason: '',
        reporter: '单位经办人员',
        reportTime: '2026-06-26 16:17:33'
      },
      {
        id: 2,
        seq: 2,
        completedProgress: '',
        ongoingProgress: '1\n增强法律观念和责任意识，确保公共资金安全。',
        notRectifiedReason: '',
        reporter: '单位经办人员',
        reportTime: '2026-06-26 16:46:29'
      }
    ],
    evidenceCount: 2,
    correctedAmount: 0,
    recoveredAmount: 0,
    auditReducedAmount: 0,
    otherSavingAmount: 0,
    systemRecords: [],
    cancelResults: []
  }
}

// 由整改进展列表项构造默认问题详情（用于截图外的其他问题）
const buildDefaultProblemDetail = (problemId: number): ProblemDetail => {
  const item = mockProgressItems.find((i) => i.id === problemId)
  return {
    problemCode: item?.problemCode || '',
    problemTitle: item?.problemTitle || '',
    problemDesc: item?.problemDesc || '',
    legalBasis: item?.legalBasis || '',
    auditSuggestion: '',
    problemType: item?.problemType || '',
    isAmountType: false,
    involvedAmount: 0,
    rectificationType: '持续整改',
    rectificationDeadline: '',
    leadUnit: 'ZY股份',
    belongUnit: '',
    planItems: [],
    progressRecords: [],
    evidenceCount: 0,
    correctedAmount: 0,
    recoveredAmount: 0,
    auditReducedAmount: 0,
    otherSavingAmount: 0,
    systemRecords: [],
    cancelResults: []
  }
}

/** 获取问题详情（基础信息+整改进展+整改成效+销号结果） */
export const getProblemDetail = async (problemId: number) => {
  await delay()
  const detail = mockProblemDetails[problemId] || buildDefaultProblemDetail(problemId)
  return { code: 200, message: '成功', data: detail }
}

// ==================== 整改调整（整改单位端）Mock ====================

// 可调整问题源（正在整改、未销号；status 标记 normal/progress-review/in-adjust 用于置灰）
// progress-review：进展审核中（不可选）；in-adjust：已有在途调整单（不可选）
interface AdjustableProblemMock {
  problemId: number
  problemCode: string
  problemTitle: string
  projectId: number
  projectName: string
  originalDeadline: string
  delayTimes: number
  status: 'normal' | 'progress-review' | 'in-adjust'
  hasProgress: boolean // 是否已填报过整改进展（false 时方案可直接在列表中修改）
  originalPlan: { id: number; measure: string; responsible: string; planFinishDate: string }[]
  originalProgressBrief: string
}

// 可调整问题数据（跨多个项目）
const mockAdjustableProblems: AdjustableProblemMock[] = [
  {
    problemId: 101,
    problemCode: 'WT-2026-001',
    problemTitle: '应收账款长期挂账未清理',
    projectId: 1,
    projectName: '2026年度财务审计项目',
    originalDeadline: '2026-07-31',
    delayTimes: 0,
    status: 'in-adjust',
    hasProgress: true,
    originalPlan: [
      {
        id: 1,
        measure: '清查应收账款台账，逐笔核对',
        responsible: '张明',
        planFinishDate: '2026-06-30'
      },
      {
        id: 2,
        measure: '对超期账款制定催收计划',
        responsible: '李华',
        planFinishDate: '2026-07-20'
      }
    ],
    originalProgressBrief: '已完成台账清查，催收计划制定中（约 40%）'
  },
  {
    problemId: 102,
    problemCode: 'WT-2026-002',
    problemTitle: '固定资产盘点账实不符',
    projectId: 1,
    projectName: '2026年度财务审计项目',
    originalDeadline: '2026-08-15',
    delayTimes: 1,
    status: 'normal',
    hasProgress: true,
    originalPlan: [
      { id: 1, measure: '组织全面资产盘点', responsible: '王芳', planFinishDate: '2026-07-31' }
    ],
    originalProgressBrief: '盘点工作进行中，已完成约 60%'
  },
  {
    problemId: 103,
    problemCode: 'WT-2026-003',
    problemTitle: '采购合同审批流程不规范',
    projectId: 2,
    projectName: '合规性专项审计',
    originalDeadline: '2026-07-10',
    delayTimes: 0,
    status: 'progress-review',
    hasProgress: true,
    originalPlan: [
      { id: 1, measure: '修订采购管理制度', responsible: '赵强', planFinishDate: '2026-06-30' }
    ],
    originalProgressBrief: '制度修订初稿已提交审核'
  },
  {
    problemId: 104,
    problemCode: 'WT-2026-004',
    problemTitle: '专项资金使用未及时入账',
    projectId: 2,
    projectName: '合规性专项审计',
    originalDeadline: '2026-09-01',
    delayTimes: 0,
    status: 'normal',
    hasProgress: false,
    originalPlan: [
      { id: 1, measure: '规范资金入账流程', responsible: '陈静', planFinishDate: '2026-08-15' }
    ],
    originalProgressBrief: '尚未开始填报进展'
  },
  {
    problemId: 105,
    problemCode: 'WT-2026-005',
    problemTitle: '内控制度执行不到位',
    projectId: 3,
    projectName: '绩效审计专项',
    originalDeadline: '2026-08-31',
    delayTimes: 0,
    status: 'in-adjust',
    hasProgress: true,
    originalPlan: [
      { id: 1, measure: '梳理内控薄弱环节', responsible: '刘洋', planFinishDate: '2026-07-31' },
      { id: 2, measure: '组织内控培训', responsible: '孙莉', planFinishDate: '2026-08-20' }
    ],
    originalProgressBrief: '已梳理薄弱环节清单'
  },
  {
    problemId: 106,
    problemCode: 'WT-2026-006',
    problemTitle: '差旅费报销单据不规范',
    projectId: 1,
    projectName: '2026年度财务审计项目',
    originalDeadline: '2026-09-15',
    delayTimes: 0,
    status: 'in-adjust',
    hasProgress: false,
    originalPlan: [
      {
        id: 1,
        measure: '修订差旅费报销管理办法',
        responsible: '周敏',
        planFinishDate: '2026-08-20'
      },
      { id: 2, measure: '组织报销规范培训', responsible: '周敏', planFinishDate: '2026-09-10' }
    ],
    originalProgressBrief: '尚未开始填报进展'
  }
]

// 调整申请单数据（模块级变量持久化）
let mockAdjustments: RectificationAdjustment[] = [
  {
    id: 1,
    applyCode: 'TZ-2026-001',
    title: '申请调整2个问题',
    applyUnit: 'ZY股份财务部',
    applyUser: '张明',
    applySummary: '部分问题受客观条件限制需延期，个别方案需调整',
    items: [
      {
        id: 1,
        projectId: 1,
        projectName: '2026年度财务审计项目',
        problemId: 101,
        problemCode: 'WT-2026-001',
        problemTitle: '应收账款长期挂账未清理',
        adjustTypes: [1],
        reason: '部分债务单位经营困难，催收周期延长，原期限内无法完成',
        attachments: [],
        originalDeadline: '2026-07-31',
        newDeadline: '2026-09-30',
        delayTimes: 0
      },
      {
        id: 2,
        projectId: 2,
        projectName: '合规性专项审计',
        problemId: 105,
        problemCode: 'WT-2026-005',
        problemTitle: '内控制度执行不到位',
        adjustTypes: [1, 2],
        reason: '原方案可操作性不足，同时需要延长整改周期',
        attachments: [],
        originalDeadline: '2026-08-31',
        newDeadline: '2026-10-31',
        delayTimes: 0,
        originalPlanSnapshot: [
          { id: 1, measure: '梳理内控薄弱环节', responsible: '刘洋', planFinishDate: '2026-07-31' }
        ],
        originalProgressBrief: '已梳理薄弱环节清单',
        newPlan: [
          {
            id: 1,
            measure: '梳理内控薄弱环节并形成整改台账',
            responsible: '刘洋',
            planFinishDate: '2026-09-15'
          },
          {
            id: 2,
            measure: '建立内控月度自查机制',
            responsible: '孙莉',
            planFinishDate: '2026-10-15'
          }
        ]
      }
    ],
    projectName: '2026年度财务审计项目 等2个项目',
    projectCount: 2,
    problemCount: 2,
    adjustTypeText: '时限2/方案1',
    approvalStatus: 2,
    approvalRecords: [
      {
        level: '一级审核',
        approver: '审计主管-周平',
        approveTime: '2026-06-20 10:30:00',
        result: '通过',
        opinion: '情况属实，同意提交上级审批'
      }
    ],
    effected: false,
    applyTime: '2026-06-19 16:20:00',
    createdAt: '2026-06-19 16:20:00',
    updatedAt: '2026-06-20 10:30:00'
  },
  {
    id: 2,
    applyCode: 'TZ-2026-002',
    title: '申请调整1个问题',
    applyUnit: 'ZY股份财务部',
    applyUser: '张明',
    applySummary: '固定资产盘点方案调整',
    items: [
      {
        id: 1,
        projectId: 1,
        projectName: '2026年度财务审计项目',
        problemId: 102,
        problemCode: 'WT-2026-002',
        problemTitle: '固定资产盘点账实不符',
        adjustTypes: [2],
        reason: '原盘点方案范围不全，需补充分公司资产',
        attachments: [],
        originalPlanSnapshot: [
          { id: 1, measure: '组织全面资产盘点', responsible: '王芳', planFinishDate: '2026-07-31' }
        ],
        originalProgressBrief: '盘点工作进行中，已完成约 60%',
        newPlan: [
          {
            id: 1,
            measure: '组织总部全面资产盘点',
            responsible: '王芳',
            planFinishDate: '2026-08-10'
          },
          {
            id: 2,
            measure: '补充各分公司资产盘点',
            responsible: '王芳',
            planFinishDate: '2026-08-31'
          }
        ]
      }
    ],
    projectName: '2026年度财务审计项目',
    projectCount: 1,
    problemCount: 1,
    adjustTypeText: '方案1',
    approvalStatus: 3,
    approvalRecords: [
      {
        level: '一级审核',
        approver: '审计主管-周平',
        approveTime: '2026-06-10 09:30:00',
        result: '通过',
        opinion: '同意'
      },
      {
        level: '二级审核',
        approver: '审计部门负责人-钱伟',
        approveTime: '2026-06-11 14:00:00',
        result: '通过',
        opinion: '同意调整，注意留痕'
      }
    ],
    effected: true,
    effectedAt: '2026-06-11 14:00:00',
    applyTime: '2026-06-09 11:00:00',
    createdAt: '2026-06-09 11:00:00',
    updatedAt: '2026-06-11 14:00:00'
  },
  {
    id: 3,
    applyCode: 'TZ-2026-003',
    title: '申请调整1个问题',
    applyUnit: 'ZY股份财务部',
    applyUser: '张明',
    applySummary: '',
    items: [
      {
        id: 1,
        projectId: 2,
        projectName: '合规性专项审计',
        problemId: 104,
        problemCode: 'WT-2026-004',
        problemTitle: '专项资金使用未及时入账',
        adjustTypes: [1],
        reason: '系统升级延误，入账流程规范需顺延',
        attachments: [],
        originalDeadline: '2026-09-01',
        newDeadline: '2026-10-15',
        delayTimes: 0
      }
    ],
    projectName: '合规性专项审计',
    projectCount: 1,
    problemCount: 1,
    adjustTypeText: '时限1',
    approvalStatus: 1,
    approvalRecords: [],
    effected: false,
    applyTime: '2026-06-25 15:40:00',
    createdAt: '2026-06-25 15:40:00',
    updatedAt: '2026-06-25 15:40:00'
  },
  {
    id: 4,
    applyCode: 'TZ-2026-004',
    title: '申请调整1个问题',
    applyUnit: 'ZY股份财务部',
    applyUser: '李华',
    applySummary: '差旅费报销方案需优化，申请调整整改措施',
    items: [
      {
        id: 1,
        projectId: 1,
        projectName: '2026年度财务审计项目',
        problemId: 106,
        problemCode: 'WT-2026-006',
        problemTitle: '差旅费报销单据不规范',
        adjustTypes: [2],
        reason: '原方案颗粒度不足，需细化报销审核流程',
        attachments: [],
        originalDeadline: '2026-09-15',
        delayTimes: 0,
        hasProgress: false,
        originalPlanSnapshot: [
          {
            id: 1,
            measure: '修订差旅费报销管理办法',
            responsible: '周敏',
            planFinishDate: '2026-08-20'
          },
          { id: 2, measure: '组织报销规范培训', responsible: '周敏', planFinishDate: '2026-09-10' }
        ],
        originalProgressBrief: '尚未开始填报进展',
        newPlan: [
          {
            id: 1,
            measure: '修订差旅费报销管理办法并明确审核要点',
            responsible: '周敏',
            planFinishDate: '2026-08-25'
          },
          {
            id: 2,
            measure: '组织全员报销规范线上培训',
            responsible: '周敏',
            planFinishDate: '2026-09-12'
          },
          {
            id: 3,
            measure: '上线报销单据自动校验规则',
            responsible: '陈静',
            planFinishDate: '2026-09-30'
          }
        ],
        planAdjustDesc: '细化措施颗粒度，增加系统校验环节'
      }
    ],
    projectName: '2026年度财务审计项目',
    projectCount: 1,
    problemCount: 1,
    adjustTypeText: '方案1',
    approvalStatus: 2,
    approvalRecords: [
      {
        level: '一级审核',
        approver: '审计主管-周平',
        approveTime: '2026-06-26 09:10:00',
        result: '通过',
        opinion: '情况合理，提交上级审批'
      }
    ],
    effected: false,
    applyTime: '2026-06-26 08:30:00',
    createdAt: '2026-06-26 08:30:00',
    updatedAt: '2026-06-26 09:10:00'
  }
]

let adjustmentIdSeq = 100

// 根据明细计算调整类型构成文案（如"时限2/方案1"）
const calcAdjustTypeText = (items: AdjustmentItem[]) => {
  let timeline = 0
  let plan = 0
  items.forEach((it) => {
    if (it.adjustTypes.includes(1)) timeline++
    if (it.adjustTypes.includes(2)) plan++
  })
  const parts: string[] = []
  if (timeline) parts.push(`时限${timeline}`)
  if (plan) parts.push(`方案${plan}`)
  return parts.join('/') || '-'
}

// 自动生成标题：申请调整X个问题
const calcTitle = (items: AdjustmentItem[]) => `申请调整${items.length}个问题`

// 计算涉及项目名称展示（多个项目时取首个 + 等N个项目）
const calcProjectName = (items: AdjustmentItem[]) => {
  const names = Array.from(new Set(items.map((it) => it.projectName)))
  if (!names.length) return ''
  return names.length === 1 ? names[0] : `${names[0]} 等${names.length}个项目`
}

// 获取可调整问题列表（跨项目；progress-review/in-adjust 标记为不可选）
export const getAdjustableProblems = async () => {
  await delay()
  const list = mockAdjustableProblems.map((p) => {
    const disabled = p.status !== 'normal'
    const disabledReason =
      p.status === 'progress-review'
        ? '该问题整改进展正在审核中'
        : p.status === 'in-adjust'
          ? '该问题有调整申请正在审批中'
          : ''
    return {
      problemId: p.problemId,
      problemCode: p.problemCode,
      problemTitle: p.problemTitle,
      projectId: p.projectId,
      projectName: p.projectName,
      originalDeadline: p.originalDeadline,
      delayTimes: p.delayTimes,
      originalPlan: p.originalPlan,
      originalProgressBrief: p.originalProgressBrief,
      hasProgress: p.hasProgress,
      disabled,
      disabledReason
    }
  })
  return { code: 200, message: '成功', data: { list } }
}

// 获取调整申请列表（分页 + 筛选：项目名称关键字 / 状态 / 提交单位）
export const getAdjustmentList = async (params: {
  projectName?: string
  approvalStatus?: number | null
  applyUnit?: string
  page: number
  pageSize: number
}) => {
  await delay()
  let list = [...mockAdjustments]
  // 按项目名称关键字筛选（主单冗余的 projectName 或任一明细项目名命中）
  if (params.projectName) {
    const kw = params.projectName
    list = list.filter(
      (a) => a.projectName.includes(kw) || a.items.some((it) => it.projectName.includes(kw))
    )
  }
  // 按审批状态筛选
  if (params.approvalStatus) {
    list = list.filter((a) => a.approvalStatus === params.approvalStatus)
  }
  // 按提交单位筛选
  if (params.applyUnit) {
    list = list.filter((a) => a.applyUnit === params.applyUnit)
  }
  const total = list.length
  const start = (params.page - 1) * params.pageSize
  const pageList = list.slice(start, start + params.pageSize)
  return { code: 200, message: '成功', data: { list: pageList, total } }
}

// 获取提交单位选项（从申请单去重，用于筛选下拉）
export const getAdjustmentUnitOptions = async () => {
  await delay(100)
  const units = Array.from(new Set(mockAdjustments.map((a) => a.applyUnit)))
  return { code: 200, message: '成功', data: units }
}

// 获取调整申请详情
export const getAdjustmentDetail = async (id: number) => {
  await delay()
  const detail = mockAdjustments.find((a) => a.id === id)
  if (!detail) {
    return { code: 404, message: '调整申请不存在', data: null }
  }
  return { code: 200, message: '成功', data: detail }
}

// 新增调整申请（草稿或提交）
export const addAdjustment = async (data: Partial<RectificationAdjustment>) => {
  await delay()
  const items = (data.items || []) as AdjustmentItem[]
  const projectIds = new Set(items.map((it) => it.projectId))
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const newItem: RectificationAdjustment = {
    id: ++adjustmentIdSeq,
    applyCode: `TZ-2026-${String(adjustmentIdSeq).padStart(3, '0')}`,
    title: calcTitle(items),
    applyUnit: data.applyUnit || 'ZY股份财务部',
    applyUser: data.applyUser || '张明',
    applySummary: data.applySummary || '',
    items,
    projectName: calcProjectName(items),
    projectCount: projectIds.size,
    problemCount: items.length,
    adjustTypeText: calcAdjustTypeText(items),
    approvalStatus: data.approvalStatus ?? 1,
    approvalRecords: [],
    effected: false,
    applyTime: now,
    createdAt: now,
    updatedAt: now
  }
  mockAdjustments.unshift(newItem)
  return { code: 200, message: '提交成功', data: { id: newItem.id } }
}

// 编辑调整申请
export const updateAdjustment = async (id: number, data: Partial<RectificationAdjustment>) => {
  await delay()
  const index = mockAdjustments.findIndex((a) => a.id === id)
  if (index === -1) {
    return { code: 404, message: '调整申请不存在', data: null }
  }
  const items = (data.items || mockAdjustments[index].items) as AdjustmentItem[]
  const projectIds = new Set(items.map((it) => it.projectId))
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
  mockAdjustments[index] = {
    ...mockAdjustments[index],
    ...data,
    title: calcTitle(items),
    items,
    projectName: calcProjectName(items),
    projectCount: projectIds.size,
    problemCount: items.length,
    adjustTypeText: calcAdjustTypeText(items),
    updatedAt: now
  }
  return { code: 200, message: '更新成功', data: mockAdjustments[index] }
}

// 撤回调整申请（审批中 → 草稿）
export const withdrawAdjustment = async (id: number) => {
  await delay()
  const item = mockAdjustments.find((a) => a.id === id)
  if (!item) {
    return { code: 404, message: '调整申请不存在', data: null }
  }
  if (item.approvalStatus !== 2) {
    return { code: 400, message: '仅审批中的申请可撤回', data: null }
  }
  item.approvalStatus = 1
  item.updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
  return { code: 200, message: '撤回成功', data: null }
}

// 提交调整申请（待提交 → 审批中，支持批量）
export const submitAdjustment = async (ids: number[]) => {
  await delay()
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
  let success = 0
  ids.forEach((id) => {
    const item = mockAdjustments.find((a) => a.id === id)
    // 仅待提交(状态1)可提交，进入审批中(状态2)
    if (item && item.approvalStatus === 1) {
      item.approvalStatus = 2
      item.updatedAt = now
      success++
    }
  })
  return { code: 200, message: `成功提交 ${success} 条`, data: { success } }
}

// 删除调整申请（仅草稿）
export const deleteAdjustment = async (id: number) => {
  await delay()
  const item = mockAdjustments.find((a) => a.id === id)
  if (!item) {
    return { code: 404, message: '调整申请不存在', data: null }
  }
  if (item.approvalStatus !== 1) {
    return { code: 400, message: '仅草稿状态可删除', data: null }
  }
  mockAdjustments = mockAdjustments.filter((a) => a.id !== id)
  return { code: 200, message: '删除成功', data: null }
}

// 获取审批记录
export const getAdjustmentApprovalRecords = async (id: number) => {
  await delay()
  const item = mockAdjustments.find((a) => a.id === id)
  if (!item) {
    return { code: 404, message: '调整申请不存在', data: null }
  }
  return {
    code: 200,
    message: '成功',
    data: (item.approvalRecords || []) as AdjustApprovalRecord[]
  }
}

// 获取待审批的调整申请列表（审批中态，供审批页选择）
export const getPendingApprovals = async () => {
  await delay()
  const list = mockAdjustments
    .filter((a) => a.approvalStatus === 2)
    .map((a) => ({
      id: a.id,
      applyCode: a.applyCode,
      title: a.title,
      projectName: a.projectName,
      problemCount: a.problemCount,
      adjustTypeText: a.adjustTypeText,
      applyUnit: a.applyUnit,
      applyUser: a.applyUser,
      applyTime: a.applyTime
    }))
  return { code: 200, message: '成功', data: { list } }
}

/**
 * 提交审批（同意/退回）
 * result：'通过' | '驳回'；审批人可在审批时直接修改时限/措施，通过 items 一并提交保存
 */
export const approveAdjustment = async (params: {
  id: number
  result: '通过' | '驳回'
  opinion: string
  approver?: string
  level?: string
  items?: AdjustmentItem[] // 审批人修改后的明细（可选）
}) => {
  await delay()
  const item = mockAdjustments.find((a) => a.id === params.id)
  if (!item) {
    return { code: 404, message: '调整申请不存在', data: null }
  }
  if (item.approvalStatus !== 2) {
    return { code: 400, message: '仅审批中的申请可审批', data: null }
  }
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
  // 审批人若修改了时限/措施，覆盖保存到申请明细
  if (params.items && params.items.length) {
    item.items = params.items
    item.adjustTypeText = calcAdjustTypeText(params.items)
  }
  // 追加审批流转记录
  if (!item.approvalRecords) item.approvalRecords = []
  item.approvalRecords.push({
    level: params.level || '审批',
    approver: params.approver || '审计主管-周平',
    approveTime: now,
    result: params.result,
    opinion: params.opinion
  })
  // 通过 → 已通过并生效；驳回 → 已驳回
  if (params.result === '通过') {
    item.approvalStatus = 3
    item.effected = true
    item.effectedAt = now
  } else {
    item.approvalStatus = 4
  }
  item.updatedAt = now
  return { code: 200, message: '审批完成', data: null }
}
