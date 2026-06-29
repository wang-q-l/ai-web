/**
 * 被审计对象 - 领导人员/被审单位详情 API 接口
 * 遵循项目 USE_MOCK 开关约定：开启时走本地 mock 函数，关闭时走真实接口
 */
import request from '@/utils/http'
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
import {
  getLeaderBaseInfoMock,
  getMeetingProjectListMock,
  getAuditDocumentListMock,
  getProblemListMock,
  getAttachmentListMock,
  getUnitBaseInfoMock,
  getUnitLeaderListMock,
  getEngineeringProjectListMock,
  getUnitMeetingProjectListMock,
  getUnitDocumentListMock,
  getUnitAttachmentListMock
} from '@/mock/audited-object'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/** 获取领导人员基础信息 */
export function getLeaderBaseInfo(id?: number | string) {
  if (USE_MOCK) {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        resolve({ code: 200, message: 'success', data: getLeaderBaseInfoMock() })
      }, 300)
    })
  }
  return request.get<LeaderBaseInfo>({ url: `/audited-object/leader/${id}` })
}

/** 获取迎审项目列表（分页 + 筛选） */
export function getMeetingProjectList(params: AuditMeetingProjectParams) {
  if (USE_MOCK) {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        resolve({ code: 200, message: 'success', data: getMeetingProjectListMock(params) })
      }, 300)
    })
  }
  return request.get<PageResult<AuditMeetingProject>>({
    url: '/audited-object/leader/meeting-project/list',
    params
  })
}

/** 获取审计文书列表（分页 + 筛选） */
export function getAuditDocumentList(params: AuditDocumentParams) {
  if (USE_MOCK) {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        resolve({ code: 200, message: 'success', data: getAuditDocumentListMock(params) })
      }, 300)
    })
  }
  return request.get<PageResult<AuditDocument>>({
    url: '/audited-object/leader/document/list',
    params
  })
}

/** 获取附件列表（分页 + 筛选） */
export function getAttachmentList(params: AuditAttachmentParams) {
  if (USE_MOCK) {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        resolve({ code: 200, message: 'success', data: getAttachmentListMock(params) })
      }, 300)
    })
  }
  return request.get<PageResult<AuditAttachment>>({
    url: '/audited-object/leader/attachment/list',
    params
  })
}

/** 获取问题清单列表（分页） */
export function getProblemList(params: AuditProblemParams) {
  if (USE_MOCK) {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        resolve({ code: 200, message: 'success', data: getProblemListMock(params) })
      }, 300)
    })
  }
  return request.get<PageResult<AuditProblem>>({
    url: '/audited-object/leader/problem/list',
    params
  })
}

// ==================== 被审单位 ====================

/** 获取被审单位基础信息 */
export function getUnitBaseInfo(id?: number | string) {
  if (USE_MOCK) {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        resolve({ code: 200, message: 'success', data: getUnitBaseInfoMock() })
      }, 300)
    })
  }
  return request.get<UnitBaseInfo>({ url: `/audited-object/unit/${id}` })
}

/** 获取被审单位迎审项目列表（分页 + 筛选） */
export function getUnitMeetingProjectList(params: AuditMeetingProjectParams) {
  if (USE_MOCK) {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        resolve({ code: 200, message: 'success', data: getUnitMeetingProjectListMock(params) })
      }, 300)
    })
  }
  return request.get<PageResult<AuditMeetingProject>>({
    url: '/audited-object/unit/meeting-project/list',
    params
  })
}

/** 获取被审单位审计文书列表（分页 + 筛选） */
export function getUnitDocumentList(params: AuditDocumentParams) {
  if (USE_MOCK) {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        resolve({ code: 200, message: 'success', data: getUnitDocumentListMock(params) })
      }, 300)
    })
  }
  return request.get<PageResult<AuditDocument>>({
    url: '/audited-object/unit/document/list',
    params
  })
}

/** 获取被审单位下的领导人员列表（分页） */
export function getUnitLeaderList(params: UnitLeaderParams) {
  if (USE_MOCK) {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        resolve({ code: 200, message: 'success', data: getUnitLeaderListMock(params) })
      }, 300)
    })
  }
  return request.get<PageResult<UnitLeader>>({
    url: '/audited-object/unit/leader/list',
    params
  })
}

/** 获取工程项目列表（分页） */
export function getEngineeringProjectList(params: EngineeringProjectParams) {
  if (USE_MOCK) {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        resolve({ code: 200, message: 'success', data: getEngineeringProjectListMock(params) })
      }, 300)
    })
  }
  return request.get<PageResult<EngineeringProject>>({
    url: '/audited-object/unit/engineering-project/list',
    params
  })
}

/** 获取被审单位附件列表（分页 + 筛选） */
export function getUnitAttachmentList(params: AuditAttachmentParams) {
  if (USE_MOCK) {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        resolve({ code: 200, message: 'success', data: getUnitAttachmentListMock(params) })
      }, 300)
    })
  }
  return request.get<PageResult<AuditAttachment>>({
    url: '/audited-object/unit/attachment/list',
    params
  })
}
