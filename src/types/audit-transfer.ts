/**
 * 审计移送模块类型定义
 */

/**
 * 审计移送
 */
export interface AuditTransfer {
  id: number
  transferName: string // 移送文书名称
  transferCode: string // 移送文书文号
  issueDate: string // 文书出具时间
  responsibleUnit: string // 责任单位
  transferType: number // 移送类型：1-事项，2-人员
  mainRecipient: string // 主送部门
  ccRecipient?: string // 抄送部门
  transferContent: string // 移送内容
  personnelCount: number // 移送人员数量
  reviewStatus?: number // 审批状态：1-待提交，2-待审批，3-待反馈，4-已退回，5-已反馈
  feedbackStatus: number // 反馈状态：1-未反馈，2-已受理，3-已处理
  attachments?: Attachment[] // 附件列表
  createdBy: string // 创建人
  createdAt: string // 创建时间
  updatedAt: string // 更新时间
}

/**
 * 审计移送查询参数
 */
export interface AuditTransferQuery {
  transferName?: string
  transferCode?: string
  transferType?: number | string | null
  mainRecipient?: string
  feedbackStatus?: number | string | null
  issueDateStart?: string
  issueDateEnd?: string
  createdAtStart?: string
  createdAtEnd?: string
  page: number
  pageSize: number
}

/**
 * 审计移送表单
 */
export interface AuditTransferForm {
  id?: number
  transferName: string
  transferCode: string
  issueDate: string
  responsibleUnit: string
  transferType: number
  mainRecipient: string
  ccRecipient?: string
  transferContent: string
  personnelList?: TransferPersonnel[] // 移送人员列表
  attachments?: Attachment[] // 附件列表
}

/**
 * 附件信息
 */
export interface Attachment {
  id?: number
  name: string // 文件名
  url: string // 文件地址
  size?: number // 文件大小
  type?: string // 文件类型
}

/**
 * 移送人员
 */
export interface TransferPersonnel {
  id?: number
  transferId?: number // 移送ID
  personnelName: string // 人员姓名
  personnelCategory: number // 人员类别：1-国家公务员，2-国有企业人员，3-事业编制人员，4-其他公职人员
  personnelUnit: string // 人员所在单位
  personnelPosition: string // 人员职务
  positionLevel: number // 职务级别：1-地厅级，2-县处级，3-乡科级，4-乡科级以下，5-其他
  isPartyMember: number // 是否党员：0-否，1-是
  problemOccurredUnit: string // 问题发生时所在单位
  feedbackStatus?: number // 反馈状态：1-未反馈，2-已受理，3-已处理
}

/**
 * 人员反馈信息
 */
export interface PersonnelFeedback {
  id?: number
  personnelId: number // 人员ID
  transferId: number // 移送ID
  acceptOrganization: string // 受理机关
  acceptDate: string // 受理日期
  resultFileName?: string // 处理结果文件名称
  resultFileCode?: string // 处理结果文件文号
  handleOrganization?: string // 处理机关
  handleDate?: string // 处理日期
  handleResult?: number // 处理结果：1-党纪处分，2-政务处分，3-第一种形态，4-经济处罚，5-其他，6-经核实不是问题
  resultDescription?: string // 处理结果情况描述
  createdAt?: string // 创建时间
  updatedAt?: string // 更新时间
}

/**
 * 移送信息反馈
 */
export interface TransferFeedback {
  id?: number
  transferId: number // 移送ID
  acceptOrganization: string // 受理机关
  acceptDate: string // 受理日期
  resultFileName?: string // 处理结果文件名称
  handleOrganization?: string // 处理机关
  handleDate?: string // 处理日期
  resultFileCode?: string // 处理结果文件文号
  handleResult?: number // 处理结果：1-党纪处分，2-政务处分，3-第一种形态，4-经济处罚，5-其他，6-经核实不是问题
  resultDescription?: string // 处理结果情况描述
  createdAt?: string // 创建时间
  updatedAt?: string // 更新时间
}

/**
 * 移送类型枚举
 */
export enum TransferType {
  MATTER = 1, // 事项
  PERSONNEL = 2 // 人员
}

/**
 * 反馈状态枚举
 */
export enum FeedbackStatus {
  NOT_FEEDBACK = 1, // 未反馈
  ACCEPTED = 2, // 已受理
  HANDLED = 3 // 已处理
}

/**
 * 人员类别枚举
 */
export enum PersonnelCategory {
  CIVIL_SERVANT = 1, // 国家公务员
  STATE_ENTERPRISE = 2, // 国有企业人员
  INSTITUTION = 3, // 事业编制人员
  OTHER_PUBLIC = 4 // 其他公职人员
}

/**
 * 职务级别枚举
 */
export enum PositionLevel {
  PROVINCIAL = 1, // 地厅级
  COUNTY = 2, // 县处级
  TOWNSHIP = 3, // 乡科级
  BELOW_TOWNSHIP = 4, // 乡科级以下
  OTHER = 5 // 其他
}

/**
 * 处理结果枚举
 */
export enum HandleResult {
  PARTY_DISCIPLINE = 1, // 党纪处分
  ADMINISTRATIVE_DISCIPLINE = 2, // 政务处分
  FIRST_FORM = 3, // 第一种形态
  ECONOMIC_PENALTY = 4, // 经济处罚
  OTHER = 5, // 其他
  NOT_PROBLEM = 6 // 经核实不是问题
}
