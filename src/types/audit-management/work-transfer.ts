/**
 * 工作移交（人员变更）- 类型定义
 *
 * 项目内组长/主审在变更或移除某成员前，将其名下的审计事项、审计文书、
 * 审批数据分项指派给同项目其他成员，提交即时生效。
 */

/** 移交工作项类别（与向导页签一一对应） */
export type WorkCategory =
  | 'item' // 审计事项
  | 'document' // 审计文书
  | 'approval' // 审批数据
  | 'reception' // 迎审清单
  | 'doubt' // 审计疑点
  | 'issue' // 问题清单
  | 'defect' // 缺陷清单
  | 'evaluate' // 评价节点

/** 迎审清单项（工作移交中需交接的迎审确认单） */
export interface ReceptionItem {
  /** 清单ID */
  id: number
  /** 清单名称 */
  name: string
  /** 状态（待确认 / 已确认） */
  status: string
}

/** 问题清单项（工作移交中需交接的问题记录） */
export interface IssueItem {
  /** 问题ID */
  id: number
  /** 问题标题 */
  title: string
  /** 问题表述 */
  description: string
}

/** 审计疑点（工作移交中需交接的疑点数据） */
export interface DoubtItem {
  /** 疑点ID */
  id: number
  /** 疑点名称 */
  name: string
  /** 疑点关联数据数量 */
  dataCount: number
  /** 核实结果 */
  verifyResult: string
}

/** 单条工作项（归集某成员名下待移交的工作时返回） */
export interface WorkloadItem {
  /** 工作项ID（对应 AuditItem / Document / 审批单据的 id） */
  refId: number
  /** 工作项类别 */
  category: WorkCategory
  /** 工作项名称 */
  refName: string
  /** 编号（文书/审批文号等，无则为空） */
  refCode?: string
  /** 当前状态文本（如：进行中 / 审核中 / 待反馈） */
  statusText: string
  /** 是否已完结（已完成/已归档的工作项，移除时不阻断） */
  finished: boolean
}

/** 某成员在本项目的工作归集结果（分类） */
export interface MemberWorkload {
  /** 审计事项 */
  items: WorkloadItem[]
  /** 审计文书 */
  documents: WorkloadItem[]
  /** 审批数据 */
  approvals: WorkloadItem[]
  /** 迎审清单 */
  receptions: ReceptionItem[]
  /** 问题清单 */
  issues: IssueItem[]
  /** 审计疑点 */
  doubts: DoubtItem[]
}

/** 单条移交明细：一个工作项 → 一个接收人 */
export interface WorkTransferItem {
  /** 工作项类别 */
  category: WorkCategory
  /** 工作项ID */
  refId: number
  /** 工作项名称（冗余，便于记录展示） */
  refName: string
  /** 工作项状态文本（冗余，便于记录展示） */
  statusText?: string
  /** 接收人ID */
  toMemberId: number
}

/** 提交工作移交参数 */
export interface WorkTransferParams {
  /** 所属项目ID */
  projectId: number
  /** 移出成员ID */
  fromMemberId: number
  /** 移交原因 */
  reason: string
  /** 移交明细 */
  items: WorkTransferItem[]
}

/** 工作移交记录 */
export interface WorkTransferRecord {
  /** 记录ID */
  id: number
  /** 所属项目ID */
  projectId: number
  /** 移出成员姓名 */
  fromMemberName: string
  /** 移出成员角色（组长/主审/组员等） */
  fromMemberRole: string
  /** 移交原因 */
  reason: string
  /** 发起人姓名（组长/主审） */
  operatorName: string
  /** 移交时间 */
  transferTime: string
  /** 移交明细条数（事项+文书+审批） */
  itemCount: number
  /** 接收人维度汇总：每个接收人接收了哪些工作 */
  receivers: WorkTransferReceiver[]
}

/** 移交记录中按接收人维度的汇总 */
export interface WorkTransferReceiver {
  /** 接收人ID */
  toMemberId: number
  /** 接收人姓名 */
  toMemberName: string
  /** 接收人角色 */
  toMemberRole: string
  /** 接收的事项数 */
  itemCount: number
  /** 接收的文书数 */
  documentCount: number
  /** 接收的审批数 */
  approvalCount: number
  /** 接收的具体工作项明细（用于直观展示交接了哪些数据） */
  items: WorkTransferDetailItem[]
}

/** 移交记录中的单条工作项明细 */
export interface WorkTransferDetailItem {
  /** 工作项类别 */
  category: WorkCategory
  /** 工作项名称 */
  refName: string
  /** 工作项状态文本 */
  statusText: string
}
