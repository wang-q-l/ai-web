/**
 * 审计移送模块Mock数据
 */
import type {
  AuditTransfer,
  AuditTransferQuery,
  AuditTransferForm,
  TransferPersonnel,
  TransferFeedback,
  PersonnelFeedback
} from '@/types/audit-transfer'

// 模拟延迟
const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms))

// 模拟审计移送数据
const mockTransfers: AuditTransfer[] = [
  {
    id: 1,
    transferName: '关于张某违纪问题的审计移送',
    transferCode: 'YS001',
    issueDate: '2026-05-10',
    responsibleUnit: 'ZK审计部',
    transferType: 2,
    mainRecipient: '市纪委监委',
    ccRecipient: '市委组织部',
    transferContent:
      '经审计发现，张某在担任财务部门负责人期间，存在违规审批、挪用公款等违纪违法行为，涉及金额150万元。根据《审计法》相关规定，现将该问题移送贵单位处理。',
    personnelCount: 1,
    reviewStatus: 3,
    feedbackStatus: 2,
    attachments: [
      {
        id: 1,
        name: '审计移送文书.pdf',
        url: 'https://example.com/files/transfer-001.pdf',
        size: 1024000,
        type: 'pdf'
      }
    ],
    createdBy: '李三',
    createdAt: '2026-05-10 10:00:00',
    updatedAt: '2026-05-20 15:30:00'
  },
  {
    id: 2,
    transferName: '关于采购项目违规问题的审计移送',
    transferCode: 'YS002',
    issueDate: '2026-05-15',
    responsibleUnit: 'ZK审计部',
    transferType: 1,
    mainRecipient: '市监察委',
    ccRecipient: '市财政局',
    transferContent:
      '经审计发现，某采购项目存在违规操作、围标串标等问题，涉及金额300万元。根据《审计法》相关规定，现将该问题移送贵单位处理。',
    personnelCount: 0,
    reviewStatus: 2,
    feedbackStatus: 2,
    attachments: [
      {
        id: 2,
        name: '采购项目审计报告.pdf',
        url: 'https://example.com/files/transfer-002.pdf',
        size: 2048000,
        type: 'pdf'
      },
      {
        id: 3,
        name: '证据材料.pdf',
        url: 'https://example.com/files/evidence-002.pdf',
        size: 1536000,
        type: 'pdf'
      }
    ],
    createdBy: '李三',
    createdAt: '2026-05-15 14:00:00',
    updatedAt: '2026-05-18 09:00:00'
  },
  {
    id: 3,
    transferName: '关于王某、李某违纪问题的审计移送',
    transferCode: 'YS003',
    issueDate: '2026-05-20',
    responsibleUnit: 'ZK审计部',
    transferType: 2,
    mainRecipient: '市纪委监委',
    transferContent:
      '经审计发现，王某、李某在担任项目负责人期间，存在收受贿赂、滥用职权等违纪违法行为，涉及金额80万元。根据《审计法》相关规定，现将该问题移送贵单位处理。',
    personnelCount: 2,
    reviewStatus: 1,
    feedbackStatus: 1,
    createdBy: '李三',
    createdAt: '2026-05-20 16:00:00',
    updatedAt: '2026-05-20 16:00:00'
  },
  {
    id: 4,
    transferName: '关于资金挪用问题的审计移送',
    transferCode: 'YS004',
    issueDate: '2026-04-25',
    responsibleUnit: 'ZK审计部',
    transferType: 1,
    mainRecipient: '市纪委监委',
    ccRecipient: '市财政局',
    transferContent:
      '经审计发现，某项目存在挪用专项资金的问题，涉及金额200万元。根据《审计法》相关规定，现将该问题移送贵单位处理。',
    personnelCount: 0,
    reviewStatus: 5,
    feedbackStatus: 3,
    attachments: [
      {
        id: 4,
        name: '资金挪用审计移送文书.pdf',
        url: 'https://example.com/files/transfer-004.pdf',
        size: 1280000,
        type: 'pdf'
      }
    ],
    createdBy: '李三',
    createdAt: '2026-04-25 09:30:00',
    updatedAt: '2026-05-12 10:00:00'
  }
]

// 模拟移送人员数据
const mockPersonnel: TransferPersonnel[] = [
  {
    id: 1,
    transferId: 1,
    personnelName: '张某',
    personnelCategory: 1,
    personnelUnit: '市财政局',
    personnelPosition: '财务部门负责人',
    positionLevel: 2,
    isPartyMember: 1,
    problemOccurredUnit: '市财政局',
    feedbackStatus: 2
  },
  {
    id: 2,
    transferId: 3,
    personnelName: '王某',
    personnelCategory: 1,
    personnelUnit: '市建设局',
    personnelPosition: '项目负责人',
    positionLevel: 3,
    isPartyMember: 1,
    problemOccurredUnit: '市建设局',
    feedbackStatus: 1
  },
  {
    id: 3,
    transferId: 3,
    personnelName: '李某',
    personnelCategory: 2,
    personnelUnit: '市建设集团',
    personnelPosition: '副总经理',
    positionLevel: 2,
    isPartyMember: 0,
    problemOccurredUnit: '市建设集团',
    feedbackStatus: 2
  }
]

// 模拟人员反馈数据
const mockPersonnelFeedbacks: PersonnelFeedback[] = [
  {
    id: 1,
    personnelId: 1,
    transferId: 1,
    acceptOrganization: '市纪委监委',
    acceptDate: '2026-05-12',
    resultFileName: '关于张某违纪问题的处理决定',
    resultFileCode: 'JW-2026-015',
    handleOrganization: '市纪委监委',
    handleDate: '2026-05-20',
    handleResult: 1,
    resultDescription:
      '经查，张某在担任财务部门负责人期间，存在违规审批、挪用公款等违纪违法行为。根据《中国共产党纪律处分条例》相关规定，给予张某开除党籍处分，并移送司法机关处理。',
    createdAt: '2026-05-12 09:00:00',
    updatedAt: '2026-05-20 15:30:00'
  },
  {
    id: 2,
    personnelId: 3,
    transferId: 3,
    acceptOrganization: '市纪委监委',
    acceptDate: '2026-05-22',
    createdAt: '2026-05-22 10:00:00',
    updatedAt: '2026-05-22 10:00:00'
  }
]

// 模拟移送信息反馈数据
const mockFeedbacks: TransferFeedback[] = [
  {
    id: 1,
    transferId: 1,
    acceptOrganization: '市纪委监委',
    acceptDate: '2026-05-12',
    resultFileName: '关于张某违纪问题的处理决定',
    handleOrganization: '市纪委监委',
    handleDate: '2026-05-20',
    resultFileCode: 'JW-2026-015',
    handleResult: 1,
    resultDescription:
      '经查，张某在担任财务部门负责人期间，存在违规审批、挪用公款等违纪违法行为。根据《中国共产党纪律处分条例》相关规定，给予张某开除党籍处分，并移送司法机关处理。',
    createdAt: '2026-05-12 09:00:00',
    updatedAt: '2026-05-20 15:30:00'
  },
  {
    id: 2,
    transferId: 2,
    acceptOrganization: '市监察委',
    acceptDate: '2026-05-18',
    createdAt: '2026-05-18 09:00:00',
    updatedAt: '2026-05-18 09:00:00'
  },
  {
    id: 3,
    transferId: 4,
    acceptOrganization: '市纪委监委',
    acceptDate: '2026-04-28',
    resultFileName: '关于资金挪用问题的处理决定',
    resultFileCode: 'JW-2026-022',
    handleOrganization: '市纪委监委',
    handleDate: '2026-05-10',
    handleResult: 4,
    resultDescription:
      '经查，相关项目存在挪用专项资金问题，按照《财政违法行为处罚处分条例》相关规定，对责任人给予经济处罚，并责令限期整改，全额追缴挪用资金。',
    createdAt: '2026-04-28 10:00:00',
    updatedAt: '2026-05-10 09:30:00'
  }
]

/**
 * 获取审计移送列表
 */
export const getAuditTransferList = async (params: AuditTransferQuery) => {
  await delay()

  let filteredData = [...mockTransfers]

  // 筛选条件
  if (params.transferName) {
    filteredData = filteredData.filter((item) => item.transferName.includes(params.transferName!))
  }
  if (params.transferCode) {
    filteredData = filteredData.filter((item) => item.transferCode.includes(params.transferCode!))
  }
  if (
    params.transferType !== null &&
    params.transferType !== undefined &&
    params.transferType !== ''
  ) {
    filteredData = filteredData.filter((item) => item.transferType === Number(params.transferType))
  }
  if (params.mainRecipient) {
    filteredData = filteredData.filter((item) => item.mainRecipient.includes(params.mainRecipient!))
  }
  if (
    params.feedbackStatus !== null &&
    params.feedbackStatus !== undefined &&
    params.feedbackStatus !== ''
  ) {
    filteredData = filteredData.filter(
      (item) => item.feedbackStatus === Number(params.feedbackStatus)
    )
  }

  // 分页
  const start = (params.page - 1) * params.pageSize
  const end = start + params.pageSize
  const list = filteredData.slice(start, end)

  return {
    code: 200,
    message: '成功',
    data: {
      list,
      total: filteredData.length
    }
  }
}

/**
 * 获取审计移送详情
 */
export const getAuditTransferDetail = async (id: number) => {
  await delay()
  const transfer = mockTransfers.find((item) => item.id === id)
  if (!transfer) {
    return { code: 404, message: '移送记录不存在', data: null }
  }
  return { code: 200, message: '成功', data: transfer }
}

/**
 * 新增审计移送
 */
export const addAuditTransfer = async (data: AuditTransferForm) => {
  await delay()
  const newTransfer: AuditTransfer = {
    id: mockTransfers.length + 1,
    transferName: data.transferName,
    transferCode: data.transferCode,
    issueDate: data.issueDate,
    responsibleUnit: data.responsibleUnit,
    transferType: data.transferType,
    mainRecipient: data.mainRecipient,
    ccRecipient: data.ccRecipient,
    transferContent: data.transferContent,
    personnelCount: data.personnelList?.length || 0,
    feedbackStatus: 1,
    createdBy: '李三',
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
  }
  mockTransfers.push(newTransfer)

  // 保存移送人员
  if (data.personnelList && data.personnelList.length > 0) {
    data.personnelList.forEach((personnel) => {
      mockPersonnel.push({
        id: mockPersonnel.length + 1,
        transferId: newTransfer.id,
        ...personnel
      })
    })
  }

  return { code: 200, message: '新增成功', data: { id: newTransfer.id } }
}

/**
 * 更新审计移送
 */
export const updateAuditTransfer = async (id: number, data: AuditTransferForm) => {
  await delay()
  const index = mockTransfers.findIndex((item) => item.id === id)
  if (index === -1) {
    return { code: 404, message: '移送记录不存在', data: null }
  }

  mockTransfers[index] = {
    ...mockTransfers[index],
    transferName: data.transferName,
    transferCode: data.transferCode,
    issueDate: data.issueDate,
    responsibleUnit: data.responsibleUnit,
    transferType: data.transferType,
    mainRecipient: data.mainRecipient,
    ccRecipient: data.ccRecipient,
    transferContent: data.transferContent,
    personnelCount: data.personnelList?.length || 0,
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
  }

  // 更新移送人员：先删除旧的，再添加新的
  const oldPersonnelIndices = mockPersonnel
    .map((p, idx) => (p.transferId === id ? idx : -1))
    .filter((idx) => idx !== -1)
    .reverse()
  oldPersonnelIndices.forEach((idx) => mockPersonnel.splice(idx, 1))

  if (data.personnelList && data.personnelList.length > 0) {
    data.personnelList.forEach((personnel) => {
      mockPersonnel.push({
        id: mockPersonnel.length + 1,
        transferId: id,
        ...personnel
      })
    })
  }

  return { code: 200, message: '更新成功', data: null }
}

/**
 * 删除审计移送
 */
export const deleteAuditTransfer = async (id: number) => {
  await delay()
  const index = mockTransfers.findIndex((item) => item.id === id)
  if (index === -1) {
    return { code: 404, message: '移送记录不存在', data: null }
  }
  mockTransfers.splice(index, 1)
  return { code: 200, message: '删除成功', data: null }
}

/**
 * 提交审计移送进入审批流程
 */
export const submitAuditTransfer = async (id: number) => {
  await delay()
  const transfer = mockTransfers.find((item) => item.id === id)
  if (!transfer) {
    return { code: 404, message: '移送记录不存在', data: null }
  }
  if (transfer.reviewStatus !== 1 && transfer.reviewStatus !== 4) {
    return { code: 400, message: '只能提交待提交或已退回的记录', data: null }
  }
  transfer.reviewStatus = 2
  transfer.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19)
  return { code: 200, message: '提交成功', data: transfer }
}

/**
 * 获取移送人员列表
 */
export const getTransferPersonnelList = async (transferId: number) => {
  await delay()
  const personnel = mockPersonnel.filter((item) => item.transferId === transferId)
  return { code: 200, message: '成功', data: personnel }
}

/**
 * 获取移送信息反馈
 */
export const getTransferFeedback = async (transferId: number) => {
  await delay()
  const feedback = mockFeedbacks.find((item) => item.transferId === transferId)
  return { code: 200, message: '成功', data: feedback || null }
}

/**
 * 保存移送信息反馈
 */
export const saveTransferFeedback = async (data: TransferFeedback) => {
  await delay()
  const index = mockFeedbacks.findIndex((item) => item.transferId === data.transferId)

  if (index === -1) {
    // 新增反馈
    const newFeedback: TransferFeedback = {
      id: mockFeedbacks.length + 1,
      ...data,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }
    mockFeedbacks.push(newFeedback)
  } else {
    // 更新反馈
    mockFeedbacks[index] = {
      ...mockFeedbacks[index],
      ...data,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }
  }

  // 更新移送记录的反馈状态
  const transferIndex = mockTransfers.findIndex((item) => item.id === data.transferId)
  if (transferIndex !== -1) {
    // 只要填写了受理信息就算已反馈
    let feedbackStatus = 1 // 未反馈
    if (data.acceptOrganization && data.acceptDate) {
      feedbackStatus = 2 // 已反馈
    }
    mockTransfers[transferIndex].feedbackStatus = feedbackStatus
  }

  return { code: 200, message: '保存成功', data: null }
}

/**
 * 获取人员反馈信息
 */
export const getPersonnelFeedback = async (personnelId: number) => {
  await delay()
  const feedback = mockPersonnelFeedbacks.find((item) => item.personnelId === personnelId)
  return { code: 200, message: '获取成功', data: feedback || null }
}

/**
 * 保存人员反馈信息
 */
export const savePersonnelFeedback = async (data: PersonnelFeedback) => {
  await delay()
  const index = mockPersonnelFeedbacks.findIndex((item) => item.personnelId === data.personnelId)

  if (index === -1) {
    // 新增反馈
    const newFeedback: PersonnelFeedback = {
      id: mockPersonnelFeedbacks.length + 1,
      ...data,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }
    mockPersonnelFeedbacks.push(newFeedback)
  } else {
    // 更新反馈
    mockPersonnelFeedbacks[index] = {
      ...mockPersonnelFeedbacks[index],
      ...data,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }
  }

  // 更新人员的反馈状态
  const personnelIndex = mockPersonnel.findIndex((item) => item.id === data.personnelId)
  if (personnelIndex !== -1) {
    // 只要填写了受理信息就算已反馈
    let feedbackStatus = 1 // 未反馈
    if (data.acceptOrganization && data.acceptDate) {
      feedbackStatus = 2 // 已反馈
    }
    mockPersonnel[personnelIndex].feedbackStatus = feedbackStatus
  }

  // 更新移送记录的反馈状态（根据所有人员的反馈状态）
  const transferIndex = mockTransfers.findIndex((item) => item.id === data.transferId)
  if (transferIndex !== -1 && mockTransfers[transferIndex].transferType === 2) {
    const transferPersonnel = mockPersonnel.filter((p) => p.transferId === data.transferId)
    const allFeedback = transferPersonnel.every((p) => p.feedbackStatus === 2)

    if (allFeedback) {
      mockTransfers[transferIndex].feedbackStatus = 2 // 已反馈（所有人员都已反馈）
    } else {
      mockTransfers[transferIndex].feedbackStatus = 1 // 未反馈
    }
  }

  return { code: 200, message: '保存成功', data: null }
}
