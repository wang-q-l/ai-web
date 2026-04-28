import type {
  Personnel,
  Document,
  TransferRecord,
  PersonnelQueryParams,
  TransferParams
} from '@/types/audit-management/personnel-transfer'

// 人员数据
const personnelList: Personnel[] = [
  {
    id: 1,
    name: '张三',
    employeeNo: 'A001',
    department: '审计部',
    auditGroup: '第一审计组',
    documentCount: 15
  },
  {
    id: 2,
    name: '李四',
    employeeNo: 'A002',
    department: '审计部',
    auditGroup: '第一审计组',
    documentCount: 8
  },
  {
    id: 3,
    name: '王五',
    employeeNo: 'A003',
    department: '审计部',
    auditGroup: '第二审计组',
    documentCount: 12
  },
  {
    id: 4,
    name: '赵六',
    employeeNo: 'A004',
    department: '审计部',
    auditGroup: '第二审计组',
    documentCount: 0
  },
  {
    id: 5,
    name: '钱七',
    employeeNo: 'A005',
    department: '审计部',
    auditGroup: '第三审计组',
    documentCount: 20
  }
]

// 文书数据（按人员ID分组）
const documentsMap: Record<number, Document[]> = {
  1: [
    {
      id: 1,
      name: '2024年度财务审计报告',
      type: '审计报告',
      createTime: '2024-01-15 10:30:00',
      status: 1,
      statusText: '草稿'
    },
    {
      id: 2,
      name: '内部控制评估文书',
      type: '评估文书',
      createTime: '2024-02-20 14:20:00',
      status: 2,
      statusText: '审核中'
    },
    {
      id: 3,
      name: '风险评估报告',
      type: '评估报告',
      createTime: '2024-03-10 09:15:00',
      status: 1,
      statusText: '草稿'
    }
  ],
  2: [
    {
      id: 4,
      name: '合规性审计文书',
      type: '审计文书',
      createTime: '2024-01-25 11:00:00',
      status: 1,
      statusText: '草稿'
    },
    {
      id: 5,
      name: '专项审计报告',
      type: '审计报告',
      createTime: '2024-02-15 16:30:00',
      status: 3,
      statusText: '已完成'
    }
  ],
  3: [
    {
      id: 6,
      name: '经济责任审计报告',
      type: '审计报告',
      createTime: '2024-01-10 08:45:00',
      status: 2,
      statusText: '审核中'
    },
    {
      id: 7,
      name: '绩效审计文书',
      type: '审计文书',
      createTime: '2024-03-05 13:20:00',
      status: 1,
      statusText: '草稿'
    }
  ],
  5: [
    {
      id: 8,
      name: '投资项目审计报告',
      type: '审计报告',
      createTime: '2024-02-01 10:00:00',
      status: 1,
      statusText: '草稿'
    },
    {
      id: 9,
      name: '工程审计文书',
      type: '审计文书',
      createTime: '2024-03-15 15:30:00',
      status: 2,
      statusText: '审核中'
    }
  ]
}

// 移交记录
const transferRecords: TransferRecord[] = [
  {
    id: 1,
    fromPersonName: '周八',
    fromPersonNo: 'A006',
    toPersonName: '张三',
    toPersonNo: 'A001',
    documentCount: 5,
    reason: '人员离职',
    transferTime: '2024-01-05 14:30:00',
    operator: '管理员'
  },
  {
    id: 2,
    fromPersonName: '吴九',
    fromPersonNo: 'A007',
    toPersonName: '李四',
    toPersonNo: 'A002',
    documentCount: 3,
    reason: '岗位调动',
    transferTime: '2024-02-10 10:15:00',
    operator: '管理员'
  }
]

let nextRecordId = 3

/**
 * 获取人员列表 Mock
 */
export function getPersonnelListMock(params: PersonnelQueryParams) {
  let filteredData = [...personnelList]

  // 筛选
  if (params.name) {
    filteredData = filteredData.filter((item) => item.name.includes(params.name!))
  }
  if (params.employeeNo) {
    filteredData = filteredData.filter((item) => item.employeeNo.includes(params.employeeNo!))
  }
  if (params.auditGroup) {
    filteredData = filteredData.filter((item) => item.auditGroup === params.auditGroup)
  }

  return filteredData
}

/**
 * 获取人员文书列表 Mock
 */
export function getPersonnelDocumentsMock(personnelId: number) {
  return documentsMap[personnelId] || []
}

/**
 * 执行文书移交 Mock
 */
export function transferDocumentsMock(params: TransferParams) {
  const fromPerson = personnelList.find((p) => p.id === params.fromPersonId)
  const toPerson = personnelList.find((p) => p.id === params.toPersonId)

  if (!fromPerson || !toPerson) {
    throw new Error('人员不存在')
  }

  // 创建移交记录
  const record: TransferRecord = {
    id: nextRecordId++,
    fromPersonName: fromPerson.name,
    fromPersonNo: fromPerson.employeeNo,
    toPersonName: toPerson.name,
    toPersonNo: toPerson.employeeNo,
    documentCount: params.documentIds.length,
    reason: params.reason || '',
    transferTime: new Date().toLocaleString('zh-CN'),
    operator: '管理员'
  }
  transferRecords.unshift(record)

  // 更新人员文书数量
  if (fromPerson.documentCount) {
    fromPerson.documentCount -= params.documentIds.length
  }
  if (toPerson.documentCount !== undefined) {
    toPerson.documentCount += params.documentIds.length
  } else {
    toPerson.documentCount = params.documentIds.length
  }

  // 移动文书数据
  const fromDocs = documentsMap[params.fromPersonId] || []
  const toDocs = documentsMap[params.toPersonId] || []
  const transferDocs = fromDocs.filter((doc) => params.documentIds.includes(doc.id))

  documentsMap[params.fromPersonId] = fromDocs.filter((doc) => !params.documentIds.includes(doc.id))
  documentsMap[params.toPersonId] = [...toDocs, ...transferDocs]

  return record
}

/**
 * 获取移交记录列表 Mock
 */
export function getTransferRecordsMock() {
  return {
    list: transferRecords,
    total: transferRecords.length
  }
}
