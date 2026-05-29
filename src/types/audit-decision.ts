/**
 * 审计决定模块类型定义
 */

/**
 * 整改项目
 */
export interface RectificationProject {
  id: number
  projectName: string // 项目名称
  projectCode: string // 项目编号
  auditYear: string // 审计年度
  auditedUnit: string // 被审计单位
  auditType: number // 审计类型：1-财务审计，2-合规审计，3-绩效审计，4-专项审计，5-其他
  auditStartDate: string // 审计开始时间
  auditEndDate: string // 审计结束时间
  projectDescription?: string // 项目描述
  decisionCount: number // 关联决定数量
  transferCount: number // 移送数量
  projectStatus: number // 项目状态：1-进行中，2-已完成，3-已归档
  createdBy: string // 创建人
  createdAt: string // 创建时间
  updatedAt: string // 更新时间

  // 新建/编辑表单扩展字段
  auditOrgLevel?: string // 实施审计的审计机关级别
  leadDepartment?: string // 牵头部门
  executeDepartment?: string // 实施部门
  auditYearNumber?: string // 审计项目年度
  auditLeader?: string // 审计组长
  deputyLeader?: string // 副组长
  chiefAuditor?: string // 主审
  auditOrganizationMethod?: string // 审计组织方式
  auditSuggestionCount?: number // 审计建议数量
  isExternal?: boolean // 是否外部项目
  // 整改问题
  noAuditProblem?: boolean // 无审计问题
  noAuditDecision?: boolean // 无审计决定
  noAuditTransfer?: boolean // 无审计移送
  // 审计文书
  auditReports?: AuditReportItem[]
  auditDecisions?: AuditDecisionDocItem[]
  auditTransfers?: AuditTransferDocItem[]
  otherDocs?: AuditOtherDocItem[]
}

/** 审计报告项 */
export interface AuditReportItem {
  reportCode: string
  deliveryDate: string
  attachments: any[]
}

/** 审计决定文书项 */
export interface AuditDecisionDocItem {
  decisionCode: string
  issueDate: string
  attachments: any[]
}

/** 审计移送文书项 */
export interface AuditTransferDocItem {
  transferCode: string
  issueDate: string
  attachments: any[]
}

/** 其他文书项 */
export interface AuditOtherDocItem {
  docName: string
  issueDate?: string
  attachments: any[]
}

/**
 * 整改项目查询参数
 */
export interface RectificationProjectQuery {
  projectName?: string
  projectCode?: string
  auditedUnit?: string
  auditType?: number | string | null
  projectStatus?: number | string | null
  startDate?: string
  endDate?: string
  page: number
  pageSize: number
}

/**
 * 整改项目表单
 */
export interface RectificationProjectForm {
  id?: number
  projectName: string
  projectCode: string
  auditYear: string
  auditedUnit: string
  auditType: number
  auditStartDate: string
  auditEndDate: string
  projectDescription?: string
  projectStatus: number

  auditOrgLevel?: string
  leadDepartment?: string
  executeDepartment?: string
  auditYearNumber?: string
  auditLeader?: string
  deputyLeader?: string
  chiefAuditor?: string
  auditOrganizationMethod?: string
  auditSuggestionCount?: number
  isExternal?: boolean

  noAuditProblem?: boolean
  noAuditDecision?: boolean
  noAuditTransfer?: boolean

  auditReports?: AuditReportItem[]
  auditDecisions?: AuditDecisionDocItem[]
  auditTransfers?: AuditTransferDocItem[]
  otherDocs?: AuditOtherDocItem[]
}

/**
 * 审计决定
 */
export interface AuditDecision {
  id: number
  projectId: number // 整改项目ID
  projectName: string // 整改项目名称
  decisionName: string // 决定文书名称
  decisionCode: string // 决定文书文号
  issueDate: string // 文书出具时间
  involvedAmount: number // 涉及金额（万元）
  problemCount: number // 涉及问题数量
  mainRecipient: string // 决定主送部门
  ccRecipient?: string // 决定抄送部门
  responsibleUnit: string // 整改责任单位
  rectificationDeadline: string // 整改期限
  decisionDescription?: string // 决定信息描述
  legalBasis?: string // 决定定性依据
  penaltyOpinion?: string // 处理处罚意见
  attachments: AttachmentFile[] // 印证资料
  reviewStatus: number // 审核状态：1-草稿，2-审核中，3-审核通过，4-已退回
  issueStatus: number // 下达状态：0-未下达，1-已下达
  rectificationStatus: number // 整改状态：1-未整改，2-整改中，3-已整改
  createdBy: string // 创建人
  createdAt: string // 创建时间
  updatedAt: string // 更新时间
  issuedBy?: string // 下达人
  issuedAt?: string // 下达时间
}

/**
 * 审计决定查询参数
 */
export interface AuditDecisionQuery {
  projectId?: number | string | null
  decisionName?: string
  decisionCode?: string
  reviewStatus?: number | string | null
  issueStatus?: number | string | null
  rectificationStatus?: number | string | null
  issueDateStart?: string
  issueDateEnd?: string
  createdAtStart?: string
  createdAtEnd?: string
  page: number
  pageSize: number
}

/**
 * 审计决定表单
 */
export interface AuditDecisionForm {
  id?: number
  projectId: number
  decisionName: string
  decisionCode: string
  issueDate: string
  mainRecipient: string
  ccRecipient?: string
  responsibleUnit: string
  rectificationDeadline: string
  decisionDescription?: string
  legalBasis?: string
  penaltyOpinion?: string
  attachments: AttachmentFile[]
  problemIds: number[] // 关联问题ID列表
}

/**
 * 附件文件
 */
export interface AttachmentFile {
  id?: number
  name: string
  url: string
  size: number
  type: string
  uploadTime?: string
}

/**
 * 关联问题
 */
export interface RelatedProblem {
  id: number
  problemTitle: string // 问题标题
  problemCategory: string // 问题类别
  belongUnit: string // 问题归属单位
  involvedAmount: number // 涉及金额（万元）
  rectificationStatus: number // 整改状态：1-未整改，2-整改中，3-已整改
  rectificationProgress?: string // 整改进展描述
  updatedAt: string // 最后更新时间
}

/**
 * 关联问题查询参数
 */
export interface RelatedProblemQuery {
  problemTitle?: string
  problemCategory?: string | null
  belongUnit?: string | null
  rectificationStatus?: number | string | null
  page: number
  pageSize: number
}

/**
 * 审核记录
 */
export interface ReviewRecord {
  id: number
  decisionId: number
  reviewLevel: string // 审核级别
  reviewer: string // 审核人
  reviewTime: string // 审核时间
  reviewResult: number // 审核结果：1-通过，2-不通过
  reviewOpinion: string // 审核意见
}

/**
 * 整改情况统计
 */
export interface RectificationStatistics {
  decisionId: number
  decisionName: string
  decisionCode: string
  responsibleUnit: string
  rectificationDeadline: string
  rectificationStatus: number
  totalProblems: number // 总问题数
  completedProblems: number // 已整改问题数
  inProgressProblems: number // 整改中问题数
  notStartedProblems: number // 未整改问题数
  completionRate: number // 完成率（百分比）
}

/**
 * 审计类型枚举
 */
export enum AuditType {
  FINANCIAL = 1, // 财务审计
  COMPLIANCE = 2, // 合规审计
  PERFORMANCE = 3, // 绩效审计
  SPECIAL = 4, // 专项审计
  OTHER = 5 // 其他
}

/**
 * 项目状态枚举
 */
export enum ProjectStatus {
  IN_PROGRESS = 1, // 进行中
  COMPLETED = 2, // 已完成
  ARCHIVED = 3 // 已归档
}

/**
 * 审核状态枚举
 */
export enum ReviewStatus {
  DRAFT = 1, // 草稿
  REVIEWING = 2, // 审核中
  APPROVED = 3, // 审核通过
  REJECTED = 4 // 已退回
}

/**
 * 下达状态枚举
 */
export enum IssueStatus {
  NOT_ISSUED = 0, // 未下达
  ISSUED = 1 // 已下达
}

/**
 * 整改状态枚举
 */
export enum RectificationStatus {
  NOT_STARTED = 1, // 未整改
  IN_PROGRESS = 2, // 整改中
  COMPLETED = 3 // 已整改
}

/**
 * 审核结果枚举
 */
export enum ReviewResult {
  APPROVED = 1, // 通过
  REJECTED = 2 // 不通过
}
