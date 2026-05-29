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
  RectificationStatistics
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
    mainRecipient: 'ZK审计部',
    ccRecipient: '财务部、监察部',
    responsibleUnit: 'ZK审计部',
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
    mainRecipient: 'ZK审计部',
    ccRecipient: '内控部',
    responsibleUnit: 'ZK审计部',
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
    mainRecipient: 'ZK审计部',
    ccRecipient: '资产管理部、财务部',
    responsibleUnit: 'ZK审计部',
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
    mainRecipient: 'ZK审计部',
    ccRecipient: '法务部、合规部',
    responsibleUnit: 'ZK审计部',
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
