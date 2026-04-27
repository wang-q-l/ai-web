import request from '@/utils/http'
import type { AuditItemExtended, AuditItemParams } from '@/types/audit'
import { getAuditItemsMock } from '@/mock/auditItems'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/**
 * 获取审计事项列表
 */
export function getAuditItems(params: AuditItemParams) {
  if (USE_MOCK) {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        const data = getAuditItemsMock(params)
        resolve({
          code: 200,
          message: 'success',
          data
        })
      }, 300)
    })
  }

  return request.get<{
    list: AuditItemExtended[]
    total: number
  }>({
    url: '/audit/items/list',
    params
  })
}

/**
 * 获取所有负责人列表（用于筛选下拉框）
 */
export function getAuditMembers() {
  if (USE_MOCK) {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        const members = [
          { id: 1, name: '王一W(总部审计部)', role: '组长', department: '总部审计部' },
          { id: 2, name: '蔡一Y(总部审计部)', role: '主审', department: '总部审计部' },
          { id: 3, name: '吕一M(总部审计部)', role: '组员', department: '总部审计部' }
        ]
        resolve({
          code: 200,
          message: 'success',
          data: members
        })
      }, 300)
    })
  }

  return request.get({
    url: '/audit/members/list'
  })
}
