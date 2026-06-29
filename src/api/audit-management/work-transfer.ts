/**
 * 工作移交（人员变更）- API 接口
 *
 * Mock 模式下直接返回 Promise，真实模式走 request。沿用项目统一响应格式。
 */
import request from '@/utils/http'
import type {
  MemberWorkload,
  WorkTransferParams,
  WorkTransferRecord
} from '@/types/audit-management/work-transfer'
import {
  getMemberWorkloadMock,
  submitWorkTransferMock,
  getWorkTransferRecordsMock
} from '@/mock/audit-management/work-transfer'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/**
 * 归集某成员在本项目名下的全部待移交工作（分事项/文书/审批三类）
 * @param projectId 项目ID
 * @param memberId 移出成员ID
 */
export function getMemberWorkload(projectId: number, memberId: number) {
  if (USE_MOCK) {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        resolve({ code: 200, message: 'success', data: getMemberWorkloadMock(projectId, memberId) })
      }, 300)
    })
  }
  return request.get<MemberWorkload>({
    url: `/admin/audit/project/${projectId}/member/${memberId}/workload`
  })
}

/**
 * 提交工作移交（即时生效）
 * @param params 移交参数（项目、移出成员、原因、明细）
 * @param fromMemberName 移出成员姓名（mock 记录用）
 * @param fromMemberRole 移出成员角色（mock 记录用）
 * @param operatorName 发起人姓名（mock 记录用）
 * @param memberMap 成员ID→{name,role} 映射（mock 汇总用）
 */
export function submitWorkTransfer(
  params: WorkTransferParams,
  fromMemberName = '',
  fromMemberRole = '',
  operatorName = '',
  memberMap: Record<number, { name: string; role: string }> = {}
) {
  if (USE_MOCK) {
    return new Promise<any>((resolve, reject) => {
      setTimeout(() => {
        try {
          const data = submitWorkTransferMock(
            params,
            fromMemberName,
            fromMemberRole,
            operatorName,
            memberMap
          )
          resolve({ code: 200, message: '移交成功', data })
        } catch (error: any) {
          reject({ code: 400, message: error.message })
        }
      }, 300)
    })
  }
  return request.post<WorkTransferRecord>({
    url: '/admin/audit/project/work-transfer',
    data: params
  })
}

/**
 * 获取某项目的工作移交（人员变更）记录列表
 * @param projectId 项目ID
 */
export function getWorkTransferRecords(projectId: number) {
  if (USE_MOCK) {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        resolve({ code: 200, message: 'success', data: getWorkTransferRecordsMock(projectId) })
      }, 300)
    })
  }
  return request.get<{ list: WorkTransferRecord[]; total: number }>({
    url: `/admin/audit/project/${projectId}/work-transfer/records`
  })
}
