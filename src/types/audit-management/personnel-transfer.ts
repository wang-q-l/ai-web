/**
 * 审计人员变更 - 文书移交
 */

/**
 * 人员信息
 */
export interface Personnel {
  /** 人员ID */
  id: number
  /** 姓名 */
  name: string
  /** 工号 */
  employeeNo: string
  /** 部门 */
  department: string
  /** 审计组 */
  auditGroup: string
  /** 待移交文书数量 */
  documentCount?: number
}

/**
 * 文书信息
 */
export interface Document {
  /** 文书ID */
  id: number
  /** 文书名称 */
  name: string
  /** 文书类型 */
  type: string
  /** 创建时间 */
  createTime: string
  /** 状态 */
  status: number
  /** 状态文本 */
  statusText: string
}

/**
 * 移交记录
 */
export interface TransferRecord {
  /** 记录ID */
  id: number
  /** 变更人员姓名 */
  fromPersonName: string
  /** 变更人员工号 */
  fromPersonNo: string
  /** 接收人员姓名 */
  toPersonName: string
  /** 接收人员工号 */
  toPersonNo: string
  /** 移交文书数量 */
  documentCount: number
  /** 移交原因 */
  reason: string
  /** 移交时间 */
  transferTime: string
  /** 操作人 */
  operator: string
}

/**
 * 人员查询参数
 */
export interface PersonnelQueryParams {
  /** 姓名 */
  name?: string
  /** 工号 */
  employeeNo?: string
  /** 审计组 */
  auditGroup?: string
}

/**
 * 文书移交参数
 */
export interface TransferParams {
  /** 变更人员ID */
  fromPersonId: number
  /** 接收人员ID */
  toPersonId: number
  /** 文书ID列表 */
  documentIds: number[]
  /** 移交原因 */
  reason?: string
}
