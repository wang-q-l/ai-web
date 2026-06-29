/**
 * 被审计对象 - 类型定义
 * 包含领导人员详情所需的基础信息、迎审项目、审计文书、附件等结构
 */

/** 领导人员基础信息 */
export interface LeaderBaseInfo {
  /** 姓名 */
  name: string
  /** 性别 */
  gender: string
  /** 职务 */
  position: string
  /** 在任/离任状态 */
  tenureStatus: string
  /** 任职日期(启) */
  tenureStart: string
  /** 任职日期(止) */
  tenureEnd: string
  /** 手机号 */
  phone: string
  /** 所在机构 */
  organization: string
  /** 备注 */
  remark: string
}

/** 迎审项目记录 */
export interface AuditMeetingProject {
  /** 主键 */
  id: number
  /** 年度 */
  year: string
  /** 审计项目名称 */
  projectName: string
  /** 项目类别 */
  category: string
  /** 审计对象 */
  auditObject: string
  /** 被审计单位 */
  auditedUnit: string
  /** 审计实施主体 */
  auditSubject: string
  /** 项目进度 */
  progress: string
}

/** 迎审项目查询参数 */
export interface AuditMeetingProjectParams {
  /** 项目名称 */
  projectName?: string
  /** 年度 */
  year?: string
  /** 当前页 */
  page?: number
  /** 每页条数 */
  pageSize?: number
}

/** 审计文书记录 */
export interface AuditDocument {
  /** 主键 */
  id: number
  /** 文书名称 */
  docName: string
  /** 文书节点 */
  docNode: string
  /** 年度 */
  year: string
  /** 项目名称 */
  projectName: string
  /** 创建人 */
  creator: string
  /** 创建时间 */
  createTime: string
}

/** 审计文书查询参数 */
export interface AuditDocumentParams {
  /** 文书名称 */
  docName?: string
  /** 年度 */
  year?: string
  /** 审计类型 */
  auditType?: string
  /** 文书节点 */
  docNode?: string
  /** 当前页 */
  page?: number
  /** 每页条数 */
  pageSize?: number
}

/** 附件记录 */
export interface AuditAttachment {
  /** 主键 */
  id: number
  /** 附件名称 */
  fileName: string
  /** 大小 */
  size: string
  /** 备注 */
  remark: string
  /** 上传人 */
  uploader: string
  /** 上传时间 */
  uploadTime: string
}

/** 附件查询参数 */
export interface AuditAttachmentParams {
  /** 关键字 */
  keyword?: string
  /** 当前页 */
  page?: number
  /** 每页条数 */
  pageSize?: number
}

/** 问题清单记录 */
export interface AuditProblem {
  /** 主键 */
  id: number
  /** 问题编号 */
  problemCode: string
  /** 问题标题 */
  title: string
  /** 问题表述 */
  description: string
  /** 定性依据 */
  legalBasis: string
  /** 审计建议 */
  suggestion: string
  /** 整改类型 */
  rectifyType: string
  /** 整改期限 */
  rectifyDeadline: string
}

/** 问题清单查询参数 */
export interface AuditProblemParams {
  /** 当前页 */
  page?: number
  /** 每页条数 */
  pageSize?: number
}

/** 被审单位基础信息 */
export interface UnitBaseInfo {
  /** 机构名称 */
  orgName: string
  /** 机构类型 */
  orgType: string
  /** 上级机构 */
  parentOrg: string
  /** 别称 */
  alias: string
  /** 曾用名 */
  formerName: string
  /** 备注 */
  remark: string
}

/** 被审单位下的领导人员记录 */
export interface UnitLeader {
  /** 主键 */
  id: number
  /** 在任/离任 */
  tenureStatus: string
  /** 任职日期(启) */
  tenureStart: string
  /** 任职日期(止) */
  tenureEnd: string
  /** 姓名 */
  name: string
  /** 性别 */
  gender: string
  /** 职务 */
  position: string
  /** 手机号 */
  phone: string
  /** 所在机构 */
  organization: string
  /** 备注 */
  remark: string
}

/** 被审单位下的领导人员查询参数 */
export interface UnitLeaderParams {
  /** 当前页 */
  page?: number
  /** 每页条数 */
  pageSize?: number
}

/** 工程项目记录 */
export interface EngineeringProject {
  /** 主键 */
  id: number
  /** 项目名称 */
  projectName: string
  /** 所在机构 */
  organization: string
}

/** 工程项目查询参数 */
export interface EngineeringProjectParams {
  /** 当前页 */
  page?: number
  /** 每页条数 */
  pageSize?: number
}

/** 分页结果通用结构 */
export interface PageResult<T> {
  list: T[]
  total: number
}
