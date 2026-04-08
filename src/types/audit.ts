/**
 * 审计管理系统 - 类型定义
 */

// ==================== 项目相关 ====================

/** 项目状态枚举 */
export enum ProjectStatus {
  /** 未启动 */
  Pending = 0,
  /** 准备中 */
  Preparing = 1,
  /** 实施中 */
  Executing = 2,
  /** 报告中 */
  Reporting = 3,
  /** 已完成 */
  Completed = 4
}

/** 组织形式枚举 */
export enum OrganizationType {
  /** 自主实施 */
  Self = 1,
  /** 完全委托 */
  FullDelegate = 2,
  /** 内外联合实施 */
  Joint = 3
}

/** 阶段状态枚举 */
export enum StageStatus {
  /** 未开始 */
  NotStarted = 0,
  /** 进行中 */
  InProgress = 1,
  /** 已完成 */
  Completed = 2,
  /** 已审核 */
  Approved = 3
}

/** 审计项目成员角色 */
export type MemberRole = '组长' | '主审' | '组员' | '项目经理' | '中介人员'

/** 审计项目成员 */
export interface AuditProjectMember {
  id: number
  name: string
  /** 角色：组长/主审/组员/项目经理/中介人员 */
  role: MemberRole
  department?: string
  phone?: string
}

/** 项目可查看人员 */
export interface ProjectViewer {
  id: number
  name: string
  /** 端类型：audit-审计端 reception-迎审端 */
  type: 'audit' | 'reception'
  department?: string
}

/** 审计项目 */
export interface AuditProject {
  id: number
  /** 项目名称 */
  name: string
  /** 项目编号 SJXM-YYYYMMDD-XXX */
  code: string
  /** 年度 */
  year: string
  /** 项目类型：财务审计/合规审计/专项审计/其他 */
  type: string
  /** 项目描述 */
  description: string
  /** 被审计单位 */
  auditedUnit: string
  /** 审计目标 */
  auditGoal: string
  /** 项目状态：0-未启动 1-准备中 2-实施中 3-报告中 4-已完成 */
  status: ProjectStatus
  /** 当前阶段 */
  currentStage: string
  /** 项目进度 0-100 */
  progress: number
  /** 整改完成率 */
  rectificationRate: number
  /** 创建人ID */
  creatorId: number
  /** 创建时间 */
  createTime: string
  /** 更新时间 */
  updateTime: string

  // ---- 启动后才有的字段 ----
  /** 组织形式 */
  organizationType?: OrganizationType
  /** 审计实施机构 */
  auditOrganization?: string
  /** 审计期间（开始日期） */
  auditPeriodStart?: string
  /** 审计期间（结束日期） */
  auditPeriodEnd?: string
  /** 中介机构名称（完全委托/内外联合时必填） */
  intermediaryName?: string
  /** 项目成员 */
  members: AuditProjectMember[]
  /** 可查看人员（审计端+迎审端） */
  viewers: ProjectViewer[]
}

/** 项目列表查询参数 */
export interface AuditProjectParams {
  name?: string
  year?: string
  status?: number | string | null
  auditedUnit?: string
  page: number
  pageSize: number
}

/** 新增/编辑项目请求（基础信息） */
export interface AuditProjectForm {
  id?: number
  name: string
  year: string
  type: string
  description?: string
  auditedUnit: string
  auditGoal: string
}

/** 启动项目请求 */
export interface LaunchProjectForm {
  /** 组织形式 */
  organizationType: OrganizationType
  /** 审计实施机构 */
  auditOrganization: string
  /** 审计期间开始 */
  auditPeriodStart: string
  /** 审计期间结束 */
  auditPeriodEnd: string
  /** 中介机构名称（完全委托/内外联合必填） */
  intermediaryName?: string
  /** 项目成员 */
  members: AuditProjectMember[]
}

/** 设置项目权限请求 */
export interface SetProjectViewersForm {
  /** 可查看人员列表 */
  viewers: ProjectViewer[]
}

// ==================== 项目阶段相关 ====================

/** 阶段文档 */
export interface StageDocument {
  id: number
  name: string
  url: string
  size: number
  uploadTime: string
}

/** 工作记录 */
export interface WorkRecord {
  id: number
  content: string
  createTime: string
  creatorName: string
}

/** 审计发现问题 */
export interface AuditFinding {
  id: number
  description: string
  /** 问题等级：1-严重、2-重要、3-一般 */
  level: number
  department: string
  evidence: StageDocument[]
  createTime: string
}

/** 审计事项 */
export interface AuditItem {
  id: number
  /** 事项名称 */
  name: string
  /** 事项描述 */
  description: string
  /** 审计内容 */
  content: string
  /** 分配的审计人员 */
  assignedMembers: AuditProjectMember[]
  /** 创建时间 */
  createTime: string
}

/** 准备阶段子节点枚举 */
export enum PrepareSubNode {
  /** 审计通知书 */
  Notice = 'notice',
  /** 审计事项 */
  Items = 'items',
  /** 审计方案 */
  Plan = 'plan'
}

/** 项目阶段 */
export interface ProjectStage {
  id: number
  projectId: number
  /** 阶段名称 */
  stageName: string
  /** 阶段顺序 */
  order: number
  /** 阶段状态 */
  status: StageStatus
  /** 审计计划内容 */
  auditPlan?: string
  /** 计划文档 */
  planDocuments: StageDocument[]
  /** 审计资料 */
  materials: StageDocument[]
  /** 工作记录 */
  workRecords: WorkRecord[]
  /** 审计发现（实施阶段） */
  findings: AuditFinding[]
  /** 审计报告内容（报告阶段） */
  reportContent?: string
  /** 报告文档 */
  reportDocuments: StageDocument[]
  /** 复审意见（后续审计） */
  reviewComment?: string
  /** 完成进度 0-100 */
  progress: number
  /** 开始时间 */
  startTime?: string
  /** 完成时间 */
  completeTime?: string

  // ---- 准备阶段专用字段 ----
  /** 当前子节点（准备阶段） */
  currentSubNode?: PrepareSubNode
  /** 审计通知书内容 */
  noticeContent?: string
  /** 审计事项列表 */
  auditItems?: AuditItem[]
  /** 审计实施方案（根据事项自动生成） */
  implementationPlan?: string
}
