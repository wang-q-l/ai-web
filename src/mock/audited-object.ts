/**
 * 被审计对象 - 领导人员详情 Mock 数据
 * 提供基础信息、迎审项目、审计文书、问题清单、附件的模拟数据与查询逻辑
 */
import type {
  LeaderBaseInfo,
  AuditMeetingProject,
  AuditMeetingProjectParams,
  AuditDocument,
  AuditDocumentParams,
  AuditProblem,
  AuditProblemParams,
  AuditAttachment,
  AuditAttachmentParams,
  UnitBaseInfo,
  UnitLeader,
  UnitLeaderParams,
  EngineeringProject,
  EngineeringProjectParams,
  PageResult
} from '@/types/audited-object'

// ==================== Mock 数据 ====================

// 领导人员基础信息（截图：罗斌）
const leaderBaseInfo: LeaderBaseInfo = {
  name: '罗斌',
  gender: '男',
  position: '总经理',
  tenureStatus: '在任',
  tenureStart: '2024-02-01',
  tenureEnd: '',
  phone: '',
  organization: 'ZY股份',
  remark: ''
}

// 迎审项目列表（截图：1 条数据）
const meetingProjects: AuditMeetingProject[] = [
  {
    id: 1,
    year: '2026',
    projectName: 'ZY股份罗斌同志离任审计',
    category: '离任审计',
    auditObject: '罗斌',
    auditedUnit: 'ZY股份',
    auditSubject: '总部审计部',
    progress: '实施阶段'
  }
]

// 审计文书列表（截图：1 条数据）
const auditDocuments: AuditDocument[] = [
  {
    id: 1,
    docName: '审计取证单',
    docNode: '取证单',
    year: '2026',
    projectName: 'ZY股份罗斌同志离任审计',
    creator: '王-W',
    createTime: '2026-06-05 16:04'
  }
]

// 附件列表（截图：暂无数据）
const attachments: AuditAttachment[] = []

// 问题清单列表
const problems: AuditProblem[] = [
  {
    id: 1,
    problemCode: 'WT-2026-001',
    title: '部分费用报销凭证不完整',
    description: '抽查发现2024年度部分差旅费、招待费报销缺少原始发票及审批单据。',
    legalBasis: '《企业财务通则》第三十条',
    suggestion: '完善费用报销审批流程，补齐缺失的原始凭证。',
    rectifyType: '立行立改',
    rectifyDeadline: '2026-07-31'
  },
  {
    id: 2,
    problemCode: 'WT-2026-002',
    title: '固定资产盘点台账与实物不符',
    description: '部分办公设备账面记录与实物盘点结果存在差异，未及时更新台账。',
    legalBasis: '《国有资产管理办法》第十八条',
    suggestion: '组织全面资产盘点，及时更新固定资产台账并落实责任人。',
    rectifyType: '限期整改',
    rectifyDeadline: '2026-08-31'
  }
]

// ==================== 查询逻辑 ====================

/** 获取领导人员基础信息 */
export function getLeaderBaseInfoMock(): LeaderBaseInfo {
  return { ...leaderBaseInfo }
}

/** 获取迎审项目列表（支持按项目名称、年度筛选 + 分页） */
export function getMeetingProjectListMock(
  params: AuditMeetingProjectParams
): PageResult<AuditMeetingProject> {
  const { projectName, year, page = 1, pageSize = 20 } = params
  let list = [...meetingProjects]
  // 按项目名称模糊筛选
  if (projectName) list = list.filter((item) => item.projectName.includes(projectName))
  // 按年度精确筛选
  if (year) list = list.filter((item) => item.year === year)
  return {
    list: list.slice((page - 1) * pageSize, page * pageSize),
    total: list.length
  }
}

/** 获取审计文书列表（支持按文书名称、年度、文书节点筛选 + 分页） */
export function getAuditDocumentListMock(params: AuditDocumentParams): PageResult<AuditDocument> {
  const { docName, year, docNode, page = 1, pageSize = 20 } = params
  let list = [...auditDocuments]
  // 按文书名称模糊筛选
  if (docName) list = list.filter((item) => item.docName.includes(docName))
  // 按年度精确筛选
  if (year) list = list.filter((item) => item.year === year)
  // 按文书节点精确筛选
  if (docNode) list = list.filter((item) => item.docNode === docNode)
  return {
    list: list.slice((page - 1) * pageSize, page * pageSize),
    total: list.length
  }
}

/** 获取附件列表（支持按名称关键字筛选 + 分页） */
export function getAttachmentListMock(params: AuditAttachmentParams): PageResult<AuditAttachment> {
  const { keyword, page = 1, pageSize = 20 } = params
  let list = [...attachments]
  // 按附件名称模糊筛选
  if (keyword) list = list.filter((item) => item.fileName.includes(keyword))
  return {
    list: list.slice((page - 1) * pageSize, page * pageSize),
    total: list.length
  }
}

/** 获取问题清单列表（分页） */
export function getProblemListMock(params: AuditProblemParams): PageResult<AuditProblem> {
  const { page = 1, pageSize = 20 } = params
  const list = [...problems]
  return {
    list: list.slice((page - 1) * pageSize, page * pageSize),
    total: list.length
  }
}

// ==================== 被审单位 Mock 数据 ====================

// 被审单位基础信息（截图：ZY科技）
const unitBaseInfo: UnitBaseInfo = {
  orgName: 'ZY科技',
  orgType: '',
  parentOrg: 'ZY股份',
  alias: '',
  formerName: '',
  remark: ''
}

// 被审单位下的领导人员列表（截图：暂无数据）
const unitLeaders: UnitLeader[] = []

// 工程项目列表（截图：1 条数据）
const engineeringProjects: EngineeringProject[] = [
  {
    id: 1,
    projectName: '闽侯县生态智慧水务一体化项目',
    organization: 'ZY科技'
  }
]

/** 获取被审单位基础信息 */
export function getUnitBaseInfoMock(): UnitBaseInfo {
  return { ...unitBaseInfo }
}

/** 获取被审单位下的领导人员列表（分页） */
export function getUnitLeaderListMock(params: UnitLeaderParams): PageResult<UnitLeader> {
  const { page = 1, pageSize = 20 } = params
  const list = [...unitLeaders]
  return {
    list: list.slice((page - 1) * pageSize, page * pageSize),
    total: list.length
  }
}

/** 获取工程项目列表（分页） */
export function getEngineeringProjectListMock(
  params: EngineeringProjectParams
): PageResult<EngineeringProject> {
  const { page = 1, pageSize = 20 } = params
  const list = [...engineeringProjects]
  return {
    list: list.slice((page - 1) * pageSize, page * pageSize),
    total: list.length
  }
}

// 被审单位的迎审项目/审计文书/附件均为空数据（截图：暂无数据）
const unitMeetingProjects: AuditMeetingProject[] = []
const unitDocuments: AuditDocument[] = []
const unitAttachments: AuditAttachment[] = []

/** 获取被审单位迎审项目列表（支持按项目名称、年度筛选 + 分页） */
export function getUnitMeetingProjectListMock(
  params: AuditMeetingProjectParams
): PageResult<AuditMeetingProject> {
  const { projectName, year, page = 1, pageSize = 20 } = params
  let list = [...unitMeetingProjects]
  if (projectName) list = list.filter((item) => item.projectName.includes(projectName))
  if (year) list = list.filter((item) => item.year === year)
  return {
    list: list.slice((page - 1) * pageSize, page * pageSize),
    total: list.length
  }
}

/** 获取被审单位审计文书列表（支持按文书名称、年度、文书节点筛选 + 分页） */
export function getUnitDocumentListMock(params: AuditDocumentParams): PageResult<AuditDocument> {
  const { docName, year, docNode, page = 1, pageSize = 20 } = params
  let list = [...unitDocuments]
  if (docName) list = list.filter((item) => item.docName.includes(docName))
  if (year) list = list.filter((item) => item.year === year)
  if (docNode) list = list.filter((item) => item.docNode === docNode)
  return {
    list: list.slice((page - 1) * pageSize, page * pageSize),
    total: list.length
  }
}

/** 获取被审单位附件列表（支持按名称关键字筛选 + 分页） */
export function getUnitAttachmentListMock(
  params: AuditAttachmentParams
): PageResult<AuditAttachment> {
  const { keyword, page = 1, pageSize = 20 } = params
  let list = [...unitAttachments]
  if (keyword) list = list.filter((item) => item.fileName.includes(keyword))
  return {
    list: list.slice((page - 1) * pageSize, page * pageSize),
    total: list.length
  }
}
