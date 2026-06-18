/**
 * 工作移交（人员变更）- 类型定义
 *
 * 项目内组长/主审在变更或移除某成员前，将其名下的审计事项、审计文书、
 * 审批数据分项指派给同项目其他成员，提交即时生效。
 */

/** 移交工作项类别：事项 / 文书 / 审批 */
export type WorkCategory = 'item' | 'document' | 'approval'

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

/** 某成员在本项目的工作归集结果（分三类） */
export interface MemberWorkload {
  /** 审计事项 */
  items: WorkloadItem[]
  /** 审计文书 */
  documents: WorkloadItem[]
  /** 审批数据 */
  approvals: WorkloadItem[]
}

/** 单条移交明细：一个工作项 → 一个接收人 */
export interface WorkTransferItem {
  /** 工作项类别 */
  category: WorkCategory
  /** 工作项ID */
  refId: number
  /** 工作项名称（冗余，便于记录展示） */
  refName: string
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
  /** 接收的事项数 */
  itemCount: number
  /** 接收的文书数 */
  documentCount: number
  /** 接收的审批数 */
  approvalCount: number
}
