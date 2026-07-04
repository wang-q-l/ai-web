/**
 * 工作移交（人员变更）- Mock 数据
 *
 * 数据按 projectId + memberId 组织：归集某成员名下的事项/文书/审批，
 * 移交后从原成员移除、追加到接收人，并写入移交记录。模块级变量持久化。
 */
import type {
  MemberWorkload,
  WorkloadItem,
  ReceptionItem,
  IssueItem,
  DoubtItem,
  WorkTransferParams,
  WorkTransferRecord,
  WorkTransferReceiver,
  WorkCategory
} from '@/types/audit-management/work-transfer'

/** 工作项归属表：projectId -> memberId -> 三类工作 */
const workloadStore: Record<number, Record<number, MemberWorkload>> = {
  // 项目1（2024年度财务合规审计）成员：1张三(组长) 2李四(主审) 3王五(组员)
  1: {
    // 张三(组长) 名下工作
    1: {
      items: [
        {
          refId: 91,
          category: 'item',
          refName: '审计方案编制',
          statusText: '进行中',
          finished: false
        },
        {
          refId: 92,
          category: 'item',
          refName: '审计组工作统筹',
          statusText: '进行中',
          finished: false
        }
      ],
      documents: [
        {
          refId: 191,
          category: 'document',
          refName: '审计实施方案',
          refCode: 'FA-2024-001',
          statusText: '审核中',
          finished: false
        },
        {
          refId: 192,
          category: 'document',
          refName: '审计通知书',
          refCode: 'TZ-2024-001',
          statusText: '已下达',
          finished: true
        }
      ],
      approvals: [
        {
          refId: 291,
          category: 'approval',
          refName: '审计方案审批',
          refCode: 'SP-2024-001',
          statusText: '审核中',
          finished: false
        }
      ],
      receptions: [],
      issues: [],
      doubts: []
    },
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
      ],
      receptions: [
        { id: 2001, name: '财务报表审计迎审清单', status: '待确认' },
        { id: 2002, name: '收入确认专项迎审清单', status: '待确认' }
      ] as ReceptionItem[],
      issues: [
        {
          id: 3001,
          title: '预付款项余额异常',
          description: '存在大额预付款项长期挂账，未见对应合同或验收凭证，涉及金额约 320 万元'
        },
        {
          id: 3002,
          title: '收入确认时点不当',
          description: '部分收入在合同签订时即确认，与实际商品交付及服务完成时点不符'
        }
      ] as IssueItem[],
      doubts: [
        { id: 1001, name: '预付款项真实性疑点', dataCount: 2, verifyResult: '待核实' },
        { id: 1002, name: '收入确认时点合规性疑点', dataCount: 3, verifyResult: '待核实' }
      ] as DoubtItem[]
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
      approvals: [],
      receptions: [],
      issues: [],
      doubts: []
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
      ],
      receptions: [],
      issues: [],
      doubts: []
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
      fromMemberRole: '组员',
      reason: '人员离职',
      operatorName: '张三',
      transferTime: '2025-01-05 14:30:00',
      itemCount: 5,
      receivers: [
        {
          toMemberId: 2,
          toMemberName: '李四',
          toMemberRole: '主审',
          itemCount: 2,
          documentCount: 2,
          approvalCount: 0,
          items: [
            { category: 'item', refName: '往来款项审计', statusText: '进行中' },
            { category: 'item', refName: '存货监盘', statusText: '已完成' },
            { category: 'document', refName: '往来款项取证单', statusText: '草稿' },
            { category: 'document', refName: '存货监盘记录', statusText: '审核中' },
            { category: 'reception', refName: '往来款项迎审确认单', statusText: '待确认' },
            { category: 'doubt', refName: '往来款项真实性疑点', statusText: '待核实' }
          ]
        }
      ]
    },
    // 单接收人记录：王五名下工作移交给张三
    {
      id: 3,
      projectId: 1,
      fromMemberName: '王五',
      fromMemberRole: '组员',
      reason: '工作调整，原组员转岗，相关审计工作由组长接手统筹。',
      operatorName: '张三',
      transferTime: '2025-06-15 10:45:00',
      itemCount: 3,
      receivers: [
        {
          toMemberId: 1,
          toMemberName: '张三',
          toMemberRole: '组长',
          itemCount: 1,
          documentCount: 1,
          approvalCount: 0,
          items: [
            { category: 'item', refName: '费用支出审计', statusText: '进行中' },
            { category: 'document', refName: '费用支出取证单', statusText: '草稿' },
            { category: 'reception', refName: '费用支出迎审确认单', statusText: '已确认' },
            { category: 'doubt', refName: '费用报销合规性疑点', statusText: '待核实' }
          ]
        }
      ]
    }
  ]
}

let nextRecordId = 100

/** 空归集结果 */
function emptyWorkload(): MemberWorkload {
  return { items: [], documents: [], approvals: [], receptions: [], issues: [], doubts: [] }
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
        approvals: wl.approvals.map((i) => ({ ...i })),
        receptions: (wl.receptions || []).map((r) => ({ ...r })),
        issues: (wl.issues || []).map((i) => ({ ...i })),
        doubts: (wl.doubts || []).map((d) => ({ ...d }))
      }
    : emptyWorkload()
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
 * @param memberMap 成员ID -> { name, role } 映射（用于记录展示）
 */
export function submitWorkTransferMock(
  params: WorkTransferParams,
  fromMemberName: string,
  fromMemberRole: string,
  operatorName: string,
  memberMap: Record<number, { name: string; role: string }>
): WorkTransferRecord {
  const { projectId, fromMemberId, reason, items } = params
  const fromWl = workloadStore[projectId]?.[fromMemberId]
  if (!fromWl) throw new Error('该成员暂无可移交的工作')

  // 接收人维度汇总
  const receiverMap: Record<number, WorkTransferReceiver> = {}

  items.forEach((it) => {
    // 初始化接收人汇总条目
    const r =
      receiverMap[it.toMemberId] ||
      (receiverMap[it.toMemberId] = {
        toMemberId: it.toMemberId,
        toMemberName: memberMap[it.toMemberId]?.name || '',
        toMemberRole: memberMap[it.toMemberId]?.role || '',
        itemCount: 0,
        documentCount: 0,
        approvalCount: 0,
        items: []
      })

    workloadStore[projectId] = workloadStore[projectId] || {}
    const toWl = workloadStore[projectId][it.toMemberId] || emptyWorkload()
    workloadStore[projectId][it.toMemberId] = toWl

    if (it.category === 'doubt') {
      // 疑点使用 id 字段，单独从 doubts 数组中移走
      const fromDoubts = fromWl.doubts || []
      const idx = fromDoubts.findIndex((d) => d.id === it.refId)
      if (idx === -1) return
      const [moved] = fromDoubts.splice(idx, 1)
      if (!toWl.doubts) toWl.doubts = []
      toWl.doubts.push(moved)
      r.items.push({ category: 'doubt', refName: moved.name, statusText: moved.verifyResult })
      return
    }

    // 审计事项 / 文书 / 审批：通用处理
    const fromArr = pickCategory(fromWl, it.category)
    const idx = fromArr.findIndex((w) => w.refId === it.refId)
    if (idx === -1) return // 已被移走，跳过
    const [moved] = fromArr.splice(idx, 1)
    pickCategory(toWl, it.category).push(moved)
    if (it.category === 'item') r.itemCount++
    else if (it.category === 'document') r.documentCount++
    else r.approvalCount++
    // 记录具体工作项明细，便于变更记录直观展示交接内容
    r.items.push({ category: it.category, refName: moved.refName, statusText: moved.statusText })
  })

  const record: WorkTransferRecord = {
    id: nextRecordId++,
    projectId,
    fromMemberName,
    fromMemberRole,
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
