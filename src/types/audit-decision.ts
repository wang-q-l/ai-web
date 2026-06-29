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
  mainRecipient?: string
  responsibleUnit?: string
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

// ==================== 整改进展（整改单位端）====================

/**
 * 整改进展列表项（整改单位端）
 * 对应整改进展页表格中的每一条审计问题
 */
export interface RectificationProgressItem {
  id: number
  problemCode: string // 问题编号，如 ZGXM-2026-0020-zgwt-0003
  problemTitle: string // 问题标题
  problemDesc: string // 问题表述
  legalBasis: string // 定性依据
  problemType: string // 问题类别
  // 整改状态：1-未整改，2-整改中，3-已整改
  rectificationStatus: number
  // 流程状态：1-未整改，2-整改中，3-已完成
  processStatus: number
}

/**
 * 整改进展查询参数（整改单位端）
 */
export interface RectificationProgressQuery {
  keyword?: string // 编号、问题标题
  rectificationStatus?: number | null // 整改状态
  problemType?: string | null // 问题类别
  page: number
  pageSize: number
}

// ==================== 填报整改（进展填报，整改单位端）====================

/**
 * 整改进展情况——具体措施行
 */
export interface RectificationMeasure {
  id: number
  measure: string // 具体措施（目标）
  responsible: string // 措施整改责任人
  // 措施完成状态：1-未完成，2-进行中，3-已完成；null 表示未选择
  finishStatus: number | null
  progressDesc: string // 整改进展情况（≤1000字）
  lastProgressDesc?: string // 上一轮填报的整改进展情况（措施已完成时用于回显）
}

/**
 * 累计出台、修订制度行
 */
export interface SystemRecord {
  id: number
  systemName: string // 制度名称
  improveType: string // 制度完善类型
  systemFile: string // 制度文件
  docNo: string // 文号
  publishDate: string // 发布日期
}

/**
 * 累计完善优化业务流程行
 */
export interface ProcessRecord {
  id: number
  processName: string // 流程名称
  file: string // 文件
  publishDate: string // 发布日期
}

/**
 * 填报整改详情（单个问题）
 */
export interface RectificationReportDetail {
  problemId: number
  problemCode: string // 问题编号
  problemTitle: string // 问题标题
  // 整改状态：1-未整改，2-正在整改，3-已整改
  rectificationStatus: number
  measures: RectificationMeasure[] // 整改进展情况表
  attachments: string[] // 佐证附件
  // 整改成效——整改金额（单位：元）
  correctedAmount: number // 已纠正违纪金
  recoveredAmount: number // 挽回损失金额
  auditReducedAmount: number // 工程审减金额
  otherSavingAmount: number // 其他增收节支
  systemRecords: SystemRecord[] // 累计出台、修订制度
  processRecords: ProcessRecord[] // 累计完善优化业务流程
}

// ==================== 问题详情大弹窗（填报进展页）====================

/**
 * 整改进展——提交记录行
 */
export interface ProblemProgressRecord {
  id: number
  seq: number // 提交记录序号
  completedProgress: string // 完成整改-整改进展
  ongoingProgress: string // 正在整改-整改进展
  notRectifiedReason: string // 尚未整改-未整改原因
  reporter: string // 填报人
  reportTime: string // 填报时间
}

/**
 * 销号结果行
 */
export interface CancelResult {
  id: number
  checkTime: string // 检查时间
  checkMethod: string // 检查方式
  cancelDesc: string // 销号说明
}

/**
 * 整改方案——具体措施行
 */
export interface ProblemPlanItem {
  id: number
  seq: number // 序号
  measure: string // 具体的措施（目标）
  planFinishTime: string // 计划完成时间
  responsible: string // 措施整改责任人
}

/**
 * 问题详情（基础信息 + 整改进展 + 整改成效 + 销号结果）
 */
export interface ProblemDetail {
  // 基础信息
  problemCode: string // 问题编号
  problemTitle: string // 问题标题
  problemDesc: string // 问题表述
  legalBasis: string // 定性依据
  auditSuggestion: string // 审计建议（意见）
  problemType: string // 问题类别
  isAmountType: boolean // 是否金额类问题
  involvedAmount: number // 涉及金额（万元）
  rectificationType: string // 整改类型
  rectificationDeadline: string // 整改时限
  leadUnit: string // 整改牵头单位
  belongUnit: string // 问题归属单位
  // 整改方案
  planItems: ProblemPlanItem[] // 整改方案措施
  // 整改进展
  progressRecords: ProblemProgressRecord[] // 提交记录
  evidenceCount: number // 佐证材料数量
  // 整改成效
  correctedAmount: number // 已纠正违纪金
  recoveredAmount: number // 挽回损失金额
  auditReducedAmount: number // 工程审减金额
  otherSavingAmount: number // 其他增收节支
  systemRecords: SystemRecord[] // 累计出台、修订制度
  // 销号结果
  cancelResults: CancelResult[]
}

// ==================== 整改调整（整改单位端）====================

/** 整改措施项（原方案快照与新方案共用） */
export interface AdjustMeasure {
  id: number
  measure: string // 具体措施/目标
  responsible: string // 措施责任人
  planFinishDate: string // 计划完成时间
}

/** 审批流转记录 */
export interface AdjustApprovalRecord {
  level: string // 审批级别
  approver: string // 审批人
  approveTime: string // 审批时间
  result: '通过' | '驳回' // 审批结果
  opinion: string // 审批意见
}

/**
 * 调整申请问题明细
 * 一个问题的一次调整，时限/方案可单选也可同时选（adjustTypes 含 1 和/或 2）
 */
export interface AdjustmentItem {
  id: number
  projectId: number // 所属整改项目（可与同单其他明细不同）
  projectName: string
  problemId: number
  problemCode: string
  problemTitle: string
  adjustTypes: number[] // 调整类型集合：1-时限 2-方案，至少一项
  reason: string // 该明细的调整/延期理由（必填）
  attachments: AttachmentFile[] // 佐证附件
  // —— 时限调整：申请前/申请后（adjustTypes 含 1 时填写）——
  originalDeadline?: string // 申请前·原整改期限（快照）
  newDeadline?: string // 申请后·新整改期限
  delayTimes?: number // 该问题历史累计延期次数
  // —— 方案调整：申请前/申请后（adjustTypes 含 2 时填写）——
  hasProgress?: boolean // 该问题是否已填报过进展（false 时方案可直接在列表中修改）
  originalPlanSnapshot?: AdjustMeasure[] // 申请前·原方案快照
  originalProgressBrief?: string // 申请前·原已填进展概要
  newPlan?: AdjustMeasure[] // 申请后·新措施清单（未填报进展时直接承载可编辑方案）
  planAdjustDesc?: string // 方案调整说明
  archivedProgressId?: number // 归档的原进展版本ID
}

/**
 * 调整申请主单
 * 一次申请可含多个问题、可跨项目，整单走一条审批流
 */
export interface RectificationAdjustment {
  id: number
  applyCode: string // 申请编号
  title: string // 标题（自动生成：申请调整X个问题）
  applyUnit: string // 发起单位
  applyUser: string // 申请人
  applySummary?: string // 申请总说明
  items: AdjustmentItem[] // 问题明细（≥1 条，可跨项目）
  projectName: string // 涉及项目名称（多个时取首个 + 等，用于列表展示/筛选）
  projectCount: number // 涉及项目数
  problemCount: number // 涉及问题数
  adjustTypeText: string // 调整类型构成（如"时限2/方案1"）
  approvalStatus: number // 1-草稿 2-审批中 3-已通过 4-已驳回（撤回后回到草稿）
  approvalRecords?: AdjustApprovalRecord[] // 审批流转记录
  effected: boolean // 是否已生效
  effectedAt?: string // 生效时间
  applyTime: string // 申请时间
  createdAt: string
  updatedAt: string
}
