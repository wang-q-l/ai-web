import request from '@/utils/http'
import type {
  CheckinRecord,
  CheckinListParams,
  CheckinSubmitParams,
  CheckinStatistics
} from '@/types/checkin'
import {
  getCheckinListMock,
  submitCheckinMock,
  getCheckinStatisticsMock
} from '@/mock/checkin'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/**
 * 获取打卡记录列表
 */
export function getCheckinList(params: CheckinListParams) {
  if (USE_MOCK) {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        const data = getCheckinListMock(params)
        resolve({
          code: 200,
          message: 'success',
          data
        })
      }, 300)
    })
  }

  return request.get<{
    list: CheckinRecord[]
    total: number
  }>({
    url: '/admin/checkin/list',
    params
  })
}

/**
 * 提交打卡
 */
export function submitCheckin(data: CheckinSubmitParams) {
  if (USE_MOCK) {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        const result = submitCheckinMock(data)
        resolve({
          code: 200,
          message: '打卡成功',
          data: result
        })
      }, 300)
    })
  }

  return request.post({
    url: '/admin/checkin/submit',
    data
  })
}

/**
 * 获取打卡统计数据
 */
export function getCheckinStatistics(params: { projectId?: number; startTime?: string; endTime?: string }) {
  if (USE_MOCK) {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        const data = getCheckinStatisticsMock(params)
        resolve({
          code: 200,
          message: 'success',
          data
        })
      }, 300)
    })
  }

  return request.get<CheckinStatistics>({
    url: '/admin/checkin/statistics',
    params
  })
}
