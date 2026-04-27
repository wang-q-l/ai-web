import type { AuditItemExtended, AuditItemParams } from '@/types/audit'

// Mock 数据存储
const auditItems: AuditItemExtended[] = [
  {
    id: 1,
    sortNumber: '1',
    name: '重大经济决策审计',
    riskPoints: '统筹监督管理大额济决策合规性...',
    assignedMembers: [{ id: 1, name: '王一W(总部审计部)', role: '组长', department: '总部审计部' }],
    status: 0,
    startTime: '2026-04-15',
    endTime: '2026-05-15',
    progress: 0,
    children: [
      {
        id: 2,
        sortNumber: '1.1',
        name: '重大项目立项是否经 "三重一大"...',
        riskPoints: '1. 重大项目立项是否经"三重一大"...',
        assignedMembers: [
          { id: 1, name: '王一W(总部审计部)', role: '组长', department: '总部审计部' }
        ],
        status: 1,
        startTime: '2026-04-30',
        endTime: '2026-05-30',
        progress: 30,
        parentId: 1,
        children: [
          {
            id: 3,
            sortNumber: '1.1.1',
            name: '基建项目决策审批',
            riskPoints: '1. 有无未经"三重一大"...',
            assignedMembers: [
              { id: 1, name: '王一W(总部审计部)', role: '组长', department: '总部审计部' }
            ],
            status: 0,
            startTime: '2026-05-01',
            endTime: '2026-05-15',
            progress: 0,
            parentId: 2
          },
          {
            id: 4,
            sortNumber: '1.1.2',
            name: '对外投资前是否组织织风险...',
            riskPoints: '1. 对外投资前是否组织织风险...',
            assignedMembers: [
              { id: 1, name: '王一W(总部审计部)', role: '组长', department: '总部审计部' }
            ],
            status: 1,
            startTime: '2026-05-01',
            endTime: '2026-05-20',
            progress: 50,
            parentId: 2
          }
        ]
      },
      {
        id: 5,
        sortNumber: '1.2',
        name: '预算是否大调整是否经集体决策',
        riskPoints: '1. 预算调整是否经集体决策...',
        assignedMembers: [
          { id: 2, name: '蔡一Y(总部审计部)', role: '主审', department: '总部审计部' }
        ],
        status: 0,
        startTime: '2026-04-30',
        endTime: '2026-05-25',
        progress: 0,
        parentId: 1,
        children: [
          {
            id: 6,
            sortNumber: '1.2.1',
            name: '预算总额调整审批',
            riskPoints: '1. 预算总额调整是否报主...',
            assignedMembers: [
              { id: 2, name: '蔡一Y(总部审计部)', role: '主审', department: '总部审计部' }
            ],
            status: 0,
            startTime: '2026-04-30',
            endTime: '2026-05-10',
            progress: 0,
            parentId: 5
          },
          {
            id: 7,
            sortNumber: '1.2.2',
            name: '专项经费调剂使用',
            riskPoints: '1. 专项经费调剂是否履行...',
            assignedMembers: [
              { id: 2, name: '蔡一Y(总部审计部)', role: '主审', department: '总部审计部' }
            ],
            status: 0,
            startTime: '2026-04-30',
            endTime: '2026-05-15',
            progress: 0,
            parentId: 5
          }
        ]
      }
    ]
  },
  {
    id: 8,
    sortNumber: '2',
    name: '内控体系及公司治理',
    riskPoints: '1.制度是否健全完善；2.内...',
    assignedMembers: [{ id: 3, name: '吕一M(总部审计部)', role: '组员', department: '总部审计部' }],
    status: 1,
    startTime: '2026-05-15',
    endTime: '2026-06-15',
    progress: 20,
    children: [
      {
        id: 9,
        sortNumber: '2.1',
        name: '内部控制体系建设',
        riskPoints: '1.制度是否健全完善；2.内...',
        assignedMembers: [
          { id: 3, name: '吕一M(总部审计部)', role: '组员', department: '总部审计部' }
        ],
        status: 1,
        startTime: '2026-05-15',
        endTime: '2026-06-01',
        progress: 40,
        parentId: 8
      }
    ]
  }
]

// let nextId = 10

/**
 * 获取审计事项列表 Mock 函数
 */
export function getAuditItemsMock(params: AuditItemParams) {
  const { name, memberId, onlyMine, page = 1, pageSize = 20 } = params
  let filteredData = [...auditItems]

  // 筛选：事项名称
  if (name) {
    const filterByName = (items: AuditItemExtended[]): AuditItemExtended[] => {
      return items
        .map((item) => {
          const matchesName = item.name.includes(name)
          const filteredChildren = item.children ? filterByName(item.children) : []

          if (matchesName || filteredChildren.length > 0) {
            return {
              ...item,
              children: filteredChildren.length > 0 ? filteredChildren : item.children
            }
          }
          return null
        })
        .filter((item) => item !== null) as AuditItemExtended[]
    }
    filteredData = filterByName(filteredData)
  }

  // 筛选：负责人
  if (memberId !== undefined && memberId !== null && memberId !== '') {
    const memberIdNum = typeof memberId === 'string' ? parseInt(memberId) : memberId
    const filterByMember = (items: AuditItemExtended[]): AuditItemExtended[] => {
      return items
        .map((item) => {
          const hasMember = item.assignedMembers.some((m) => m.id === memberIdNum)
          const filteredChildren = item.children ? filterByMember(item.children) : []

          if (hasMember || filteredChildren.length > 0) {
            return {
              ...item,
              children: filteredChildren.length > 0 ? filteredChildren : item.children
            }
          }
          return null
        })
        .filter((item) => item !== null) as AuditItemExtended[]
    }
    filteredData = filterByMember(filteredData)
  }

  // 筛选：只看我负责（假设当前用户ID为1）
  if (onlyMine) {
    const currentUserId = 1
    const filterByCurrentUser = (items: AuditItemExtended[]): AuditItemExtended[] => {
      return items
        .map((item) => {
          const isMyTask = item.assignedMembers.some((m) => m.id === currentUserId)
          const filteredChildren = item.children ? filterByCurrentUser(item.children) : []

          if (isMyTask || filteredChildren.length > 0) {
            return {
              ...item,
              children: filteredChildren.length > 0 ? filteredChildren : item.children
            }
          }
          return null
        })
        .filter((item) => item !== null) as AuditItemExtended[]
    }
    filteredData = filterByCurrentUser(filteredData)
  }

  // 计算总数（扁平化计数）
  const countItems = (items: AuditItemExtended[]): number => {
    return items.reduce((count, item) => {
      return count + 1 + (item.children ? countItems(item.children) : 0)
    }, 0)
  }
  const total = countItems(filteredData)

  // 分页（对于树形数据，这里简化处理，只对顶层分页）
  const start = (page - 1) * pageSize
  const end = start + Number(pageSize)
  const list = filteredData.slice(start, end)

  return {
    list,
    total
  }
}

/**
 * 获取所有负责人列表 Mock 函数
 */
export function getAuditMembersMock() {
  const members = [
    { id: 1, name: '王一W(总部审计部)', role: '组长', department: '总部审计部' },
    { id: 2, name: '蔡一Y(总部审计部)', role: '主审', department: '总部审计部' },
    { id: 3, name: '吕一M(总部审计部)', role: '组员', department: '总部审计部' }
  ]
  return members
}
