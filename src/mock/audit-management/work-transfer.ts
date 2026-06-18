/**
 * 工作移交（人员变更）- Mock 数据
 *
 * 数据按 projectId + memberId 组织：归集某成员名下的事项/文书/审批，
 * 移交后从原成员移除、追加到接收人，并写入移交记录。模块级变量持久化。
 */
import type {
  MemberWorkload,
  WorkloadItem,
  WorkTransferParams,
  WorkTransferRecord,
  WorkTransferReceiver,
  WorkCategory
} from '@/types/audit-management/work-transfer'

/** 工作项归属表：projectId -> memberId -> 三类工作 */
const workloadStore: Record<number, Record<number, MemberWorkload>> = {
  // 项目1（2024年度财务合规审计）成员：1张三(组长) 2李四(主审) 3王五(组员)
  1: {
    // 李四(主审) 名下工作
    2: {
      items: [
        {
          refId: 101,
          category: 'item',
          refName: '财务报表审计',
          statusText: '进行中',
          finished: false
        },
        {
          refId: 102,
          category: 'item',
          refName: '收入确认审计',
          statusText: '进行中',
          finished: false
        },
        {
          refId: 103,
          category: 'item',
          refName: '内控有效性测试',
          statusText: '待开始',
          finished: false
        }
      ],
      documents: [
        {
          refId: 201,
          category: 'document',
          refName: '王-W取证单（3）',
          refCode: 'QZD-ZXSJ-2026-0014-01',
          statusText: '草稿',
          finished: false
        },
        {
          refId: 202,
          category: 'document',
          refName: '审计取证单',
          refCode: '001',
          statusText: '审核中',
          finished: false
        },
        {
          refId: 203,
          category: 'document',
          refName: '2024年度财务审计报告',
          refCode: 'BG-2024-001',
          statusText: '已完成',
          finished: true
        }
      ],
      approvals: [
        {
          refId: 301,
          category: 'approval',
          refName: '财务部审计决定',
          refCode: 'JD-2024-008',
          statusText: '审核中',
          finished: false
        },
        {
          refId: 302,
          category: 'approval',
          refName: '违规资金移送',
          refCode: 'YS-2024-003',
          statusText: '待反馈',
          finished: false
        }
      ]
    },
    // 王五(组员) 名下工作
    3: {
      items: [
        {
          refId: 111,
          category: 'item',
          refName: '费用支出审计',
          statusText: '进行中',
          finished: false
        }
      ],
      documents: [
        {
          refId: 211,
          category: 'document',
          refName: '费用支出取证单',
          refCode: '002',
          statusText: '草稿',
          finished: false
        }
      ],
      approvals: []
    }
  },
  // 项目2（供应链管理专项审计）成员：1张三(组长) 4赵六(主审) 5项目经理A 6中介人员B
  2: {
    4: {
      items: [
        {
          refId: 121,
          category: 'item',
          refName: '采购合规检查',
          statusText: '进行中',
          finished: false
        }
      ],
      documents: [
        {
          refId: 221,
          category: 'document',
          refName: '供应商资质核查单',
          refCode: 'QZD-2024-021',
          statusText: '草稿',
          finished: false
        }
      ],
      approvals: [
        {
          refId: 321,
          category: 'approval',
          refName: '采购违规审计决定',
          refCode: 'JD-2024-015',
          statusText: '待下达',
          finished: false
        }
      ]
    }
  }
}

/** 移交记录：projectId -> 记录列表 */
const recordStore: Record<number, WorkTransferRecord[]> = {
  1: [
    {
      id: 1,
      projectId: 1,
      fromMemberName: '周八',
      reason: '人员离职',
      operatorName: '张三',
      transferTime: '2025-01-05 14:30:00',
      itemCount: 5,
      receivers: [
        { toMemberId: 2, toMemberName: '李四', itemCount: 2, documentCount: 2, approvalCount: 1 }
      ]
    }
  ]
}

let nextRecordId = 100

/** 空归集结果 */
function emptyWorkload(): MemberWorkload {
  return { items: [], documents: [], approvals: [] }
}

/**
 * 归集某成员在本项目名下的全部待移交工作（分三类）
 */
export function getMemberWorkloadMock(projectId: number, memberId: number): MemberWorkload {
  const wl = workloadStore[projectId]?.[memberId]
  // 返回深拷贝，避免外部直接改动 store
  return wl
    ? {
        items: wl.items.map((i) => ({ ...i })),
        documents: wl.documents.map((i) => ({ ...i })),
        approvals: wl.approvals.map((i) => ({ ...i }))
      }
    : emptyWorkload()
}

/**
 * 判断某成员名下是否还有未完结工作（用于移除前校验）
 */
export function hasUnfinishedWorkMock(projectId: number, memberId: number): boolean {
  const wl = workloadStore[projectId]?.[memberId]
  if (!wl) return false
  return [...wl.items, ...wl.documents, ...wl.approvals].some((i) => !i.finished)
}

/** 按类别取成员某类工作数组的引用 */
function pickCategory(wl: MemberWorkload, category: WorkCategory): WorkloadItem[] {
  if (category === 'item') return wl.items
  if (category === 'document') return wl.documents
  return wl.approvals
}

/**
 * 提交工作移交（即时生效）
 * 逐项把工作从移出成员迁移到接收人，并生成移交记录
 */
export function submitWorkTransferMock(
  params: WorkTransferParams,
  fromMemberName: string,
  operatorName: string,
  memberNameMap: Record<number, string>
): WorkTransferRecord {
  const { projectId, fromMemberId, reason, items } = params
  const fromWl = workloadStore[projectId]?.[fromMemberId]
  if (!fromWl) throw new Error('该成员暂无可移交的工作')

  // 接收人维度汇总
  const receiverMap: Record<number, WorkTransferReceiver> = {}

  items.forEach((it) => {
    const fromArr = pickCategory(fromWl, it.category)
    const idx = fromArr.findIndex((w) => w.refId === it.refId)
    if (idx === -1) return // 已被移走，跳过

    const [moved] = fromArr.splice(idx, 1)

    // 追加到接收人名下（接收人无归集结构时初始化）
    workloadStore[projectId] = workloadStore[projectId] || {}
    const toWl = workloadStore[projectId][it.toMemberId] || emptyWorkload()
    pickCategory(toWl, it.category).push(moved)
    workloadStore[projectId][it.toMemberId] = toWl

    // 汇总
    const r =
      receiverMap[it.toMemberId] ||
      (receiverMap[it.toMemberId] = {
        toMemberId: it.toMemberId,
        toMemberName: memberNameMap[it.toMemberId] || '',
        itemCount: 0,
        documentCount: 0,
        approvalCount: 0
      })
    if (it.category === 'item') r.itemCount++
    else if (it.category === 'document') r.documentCount++
    else r.approvalCount++
  })

  const record: WorkTransferRecord = {
    id: nextRecordId++,
    projectId,
    fromMemberName,
    reason,
    operatorName,
    transferTime: new Date().toLocaleString('zh-CN', { hour12: false }),
    itemCount: items.length,
    receivers: Object.values(receiverMap)
  }
  recordStore[projectId] = recordStore[projectId] || []
  recordStore[projectId].unshift(record)

  return record
}

/**
 * 获取某项目的工作移交记录列表
 */
export function getWorkTransferRecordsMock(projectId: number) {
  const list = recordStore[projectId] || []
  return { list: list.map((r) => ({ ...r })), total: list.length }
}
