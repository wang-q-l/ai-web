import request from '@/utils/http'
import type {
  Personnel,
  Document,
  TransferRecord,
  PersonnelQueryParams,
  TransferParams
} from '@/types/audit-management/personnel-transfer'
import {
  getPersonnelListMock,
  getPersonnelDocumentsMock,
  transferDocumentsMock,
  getTransferRecordsMock
} from '@/mock/audit-management/personnel-transfer'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/**
 * 获取人员列表
 */
export function getPersonnelList(params: PersonnelQueryParams) {
  if (USE_MOCK) {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        const data = getPersonnelListMock(params)
        resolve({
          code: 200,
          message: 'success',
          data
        })
      }, 300)
    })
  }

  return request.get<Personnel[]>({
    url: '/admin/audit/personnel/list',
    params
  })
}

/**
 * 获取人员文书列表
 */
export function getPersonnelDocuments(personnelId: number) {
  if (USE_MOCK) {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        const data = getPersonnelDocumentsMock(personnelId)
        resolve({
          code: 200,
          message: 'success',
          data
        })
      }, 300)
    })
  }

  return request.get<Document[]>({
    url: `/admin/audit/personnel/${personnelId}/documents`
  })
}

/**
 * 执行文书移交
 */
export function transferDocuments(params: TransferParams) {
  if (USE_MOCK) {
    return new Promise<any>((resolve, reject) => {
      setTimeout(() => {
        try {
          const result = transferDocumentsMock(params)
          resolve({
            code: 200,
            message: '移交成功',
            data: result
          })
        } catch (error: any) {
          reject({
            code: 400,
            message: error.message
          })
        }
      }, 300)
    })
  }

  return request.post({
    url: '/admin/audit/personnel/transfer',
    data: params
  })
}

/**
 * 获取移交记录列表
 */
export function getTransferRecords() {
  if (USE_MOCK) {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        const data = getTransferRecordsMock()
        resolve({
          code: 200,
          message: 'success',
          data
        })
      }, 300)
    })
  }

  return request.get<{
    list: TransferRecord[]
    total: number
  }>({
    url: '/admin/audit/personnel/transfer/records'
  })
}
