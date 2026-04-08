/**
 * 填报任务模块类型定义
 */

/**
 * 填报单位接收人
 */
export interface TaskReceiver {
  /** 单位ID */
  unitId: number
  /** 单位名称 */
  unitName: string
  /** 接收人ID */
  receiverId: number
  /** 接收人姓名 */
  receiverName: string
}

/**
 * 填报任务
 */
export interface AuditTask {
  /** 任务ID */
  id: number
  /** 年度 */
  year: string
  /** 任务标题 */
  title: string
  /** 通知正文 */
  content: string
  /** 附件列表 */
  attachments: string[]
  /** 是否上报附件 0-否 1-是 */
  requireAttachment: number
  /** 是否开启计划统筹 0-否 1-是 */
  enablePlanning: number
  /** 填报单位列表 */
  receivers: TaskReceiver[]
  /** 创建时间 */
  createTime: string
  /** 更新时间 */
  updateTime: string
}

/**
 * 填报任务列表查询参数
 */
export interface AuditTaskListParams {
  /** 年度 */
  year?: string
  /** 任务标题 */
  title?: string
  /** 是否开启计划统筹 */
  enablePlanning?: number | string | null
  /** 当前页码 */
  page: number
  /** 每页大小 */
  pageSize: number
}

/**
 * 单位选项
 */
export interface UnitOption {
  /** 单位ID */
  id: number
  /** 单位名称 */
  name: string
}

/**
 * 用户选项
 */
export interface UserOption {
  /** 用户ID */
  id: number
  /** 用户姓名 */
  name: string
  /** 所属单位ID */
  unitId: number
}
