/**
 * 审计移送模块API接口
 */
import request from '@/utils/http'
import type {
  AuditTransfer,
  AuditTransferQuery,
  AuditTransferForm,
  TransferPersonnel,
  TransferFeedback,
  PersonnelFeedback
} from '@/types/audit-transfer'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/**
 * 获取审计移送列表
 */
export const getAuditTransferList = async (params: AuditTransferQuery) => {
  if (USE_MOCK) {
    const { getAuditTransferList: mockFn } = await import('@/mock/audit-transfer')
    return mockFn(params)
  }
  return request.get<{ list: AuditTransfer[]; total: number }>({
    url: '/api/audit-transfer/list',
    params
  })
}

/**
 * 获取审计移送详情
 */
export const getAuditTransferDetail = async (id: number) => {
  if (USE_MOCK) {
    const { getAuditTransferDetail: mockFn } = await import('@/mock/audit-transfer')
    return mockFn(id)
  }
  return request.get<AuditTransfer>({ url: `/api/audit-transfer/${id}` })
}

/**
 * 新增审计移送
 */
export const addAuditTransfer = async (data: AuditTransferForm) => {
  if (USE_MOCK) {
    const { addAuditTransfer: mockFn } = await import('@/mock/audit-transfer')
    return mockFn(data)
  }
  return request.post<{ id: number }>({ url: '/api/audit-transfer', data })
}

/**
 * 更新审计移送
 */
export const updateAuditTransfer = async (id: number, data: AuditTransferForm) => {
  if (USE_MOCK) {
    const { updateAuditTransfer: mockFn } = await import('@/mock/audit-transfer')
    return mockFn(id, data)
  }
  return request.put({ url: `/api/audit-transfer/${id}`, data })
}

/**
 * 删除审计移送
 */
export const deleteAuditTransfer = async (id: number) => {
  if (USE_MOCK) {
    const { deleteAuditTransfer: mockFn } = await import('@/mock/audit-transfer')
    return mockFn(id)
  }
  return request.del({ url: `/api/audit-transfer/${id}` })
}

/**
 * 提交审计移送进入审批流程
 */
export const submitAuditTransfer = async (id: number) => {
  if (USE_MOCK) {
    const { submitAuditTransfer: mockFn } = await import('@/mock/audit-transfer')
    return mockFn(id)
  }
  return request.post({ url: `/api/audit-transfer/${id}/submit` })
}

/**
 * 获取移送人员列表
 */
export const getTransferPersonnelList = async (transferId: number) => {
  if (USE_MOCK) {
    const { getTransferPersonnelList: mockFn } = await import('@/mock/audit-transfer')
    return mockFn(transferId)
  }
  return request.get<TransferPersonnel[]>({ url: `/api/audit-transfer/${transferId}/personnel` })
}

/**
 * 获取移送信息反馈
 */
export const getTransferFeedback = async (transferId: number) => {
  if (USE_MOCK) {
    const { getTransferFeedback: mockFn } = await import('@/mock/audit-transfer')
    return mockFn(transferId)
  }
  return request.get<TransferFeedback>({ url: `/api/audit-transfer/${transferId}/feedback` })
}

/**
 * 保存移送信息反馈
 */
export const saveTransferFeedback = async (data: TransferFeedback) => {
  if (USE_MOCK) {
    const { saveTransferFeedback: mockFn } = await import('@/mock/audit-transfer')
    return mockFn(data)
  }
  return request.post({ url: `/api/audit-transfer/${data.transferId}/feedback`, data })
}

/**
 * 获取人员反馈信息
 */
export const getPersonnelFeedback = async (personnelId: number) => {
  if (USE_MOCK) {
    const { getPersonnelFeedback: mockFn } = await import('@/mock/audit-transfer')
    return mockFn(personnelId)
  }
  return request.get<PersonnelFeedback>({
    url: `/api/audit-transfer/personnel/${personnelId}/feedback`
  })
}

/**
 * 保存人员反馈信息
 */
export const savePersonnelFeedback = async (data: PersonnelFeedback) => {
  if (USE_MOCK) {
    const { savePersonnelFeedback: mockFn } = await import('@/mock/audit-transfer')
    return mockFn(data)
  }
  return request.post({ url: `/api/audit-transfer/personnel/${data.personnelId}/feedback`, data })
}
