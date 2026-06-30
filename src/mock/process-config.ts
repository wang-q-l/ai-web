/**
 * 决定节点配置（整改流程方案配置）Mock 数据
 */
import type {
  ProcessScheme,
  ProcessNode,
  NodeConfigForm,
  ApprovalFlowOption,
  NodeTypeOption,
  ProgressNodeConfig
} from '@/types/process-config'

// 模拟接口延迟
const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms))

// 角色列表（用于节点权限表格）
const mockRoles = [
  { roleId: 1, roleName: '整改跟进人' },
  { roleId: 2, roleName: '整改跟进负责人' },
  { roleId: 3, roleName: '单位整改负责人' },
  { roleId: 4, roleName: '单位整改经办人' },
  { roleId: 5, roleName: '单位整改责任人' }
]

// 节点类型选项（新增"审计决定""审计移送"两个选项）
const nodeTypeOptions: NodeTypeOption[] = [
  { value: 1, label: '整改清单' },
  { value: 2, label: '整改方案' },
  { value: 3, label: '整改进展' },
  { value: 4, label: '整改报告' },
  { value: 5, label: '审计决定' },
  { value: 6, label: '审计移送' }
]

// 审批流程选项
const approvalFlowOptions: ApprovalFlowOption[] = [
  { id: 1, name: '默认审批流程' },
  { id: 2, name: '两级审批流程' },
  { id: 3, name: '三级审批流程' }
]

// 默认节点权限模板（生成新节点时使用）
const buildDefaultPermissions = () =>
  mockRoles.map((r) => ({
    roleId: r.roleId,
    roleName: r.roleName,
    visible: true,
    canMaintain: false,
    canCancel: false,
    canExport: false,
    canSubmit: false,
    canIssue: false,
    canFeedback: false
  }))

// 整改进展默认配置（与图中字段配置一致）
const buildDefaultProgressConfig = (): ProgressNodeConfig => ({
  // 问题来源
  problemSource: ['整改方案'],
  // 进展提交方式：按项目提交
  submitMode: 'project',
  // 非立行立改问题的进展填报频率：整改完成填报
  reportFrequency: 'onComplete',
  // 是否需要审批
  needApproval: false,
  // 是否需要整改成效（默认需要）
  needEffect: true,
  // 未整改字段
  unrectifiedFields: [
    {
      key: 'unrectifiedReason',
      label: '未整改原因',
      enabled: true,
      enabledDisabled: true,
      displayName: '未整改原因',
      maxLength: 100,
      required: true,
      requiredDisabled: true
    },
    {
      key: 'measureStatus',
      label: '措施完成状态',
      enabled: false,
      displayName: '',
      maxLength: 100,
      required: false
    },
    {
      key: 'nextMeasure',
      label: '下一步整改措施',
      enabled: false,
      displayName: '',
      maxLength: 100,
      required: false
    },
    {
      key: 'planFinishTime',
      label: '计划完成时间',
      enabled: false,
      displayName: '',
      maxLength: 100,
      required: false
    }
  ],
  // 正在整改字段
  rectifyingFields: [
    {
      key: 'progressDesc',
      label: '整改进展情况',
      enabled: true,
      enabledDisabled: true,
      displayName: '整改进展情况',
      maxLength: 100,
      required: true,
      requiredDisabled: true
    },
    {
      key: 'measureStatus',
      label: '措施完成状态',
      enabled: false,
      displayName: '',
      maxLength: 100,
      required: false
    },
    {
      key: 'nextMeasure',
      label: '下一步整改措施',
      enabled: false,
      displayName: '',
      maxLength: 100,
      required: false
    },
    {
      key: 'planFinishTime',
      label: '计划完成时间',
      enabled: false,
      displayName: '',
      maxLength: 100,
      required: false
    },
    {
      key: 'progressNum',
      label: '整改进度（数字）',
      enabled: false,
      displayName: '',
      maxLength: 100,
      required: false,
      requiredDisabled: true,
      hasTip: true
    },
    {
      key: 'attachment',
      label: '佐证附件',
      enabled: true,
      enabledDisabled: true,
      displayName: '佐证附件',
      maxLength: 100,
      required: true,
      requiredDisabled: true
    }
  ],
  // 已整改字段
  rectifiedFields: [
    {
      key: 'progressDesc',
      label: '整改进展情况',
      enabled: true,
      enabledDisabled: true,
      displayName: '整改进展情况',
      maxLength: 100,
      required: true,
      requiredDisabled: true
    },
    {
      key: 'measureStatus',
      label: '措施完成状态',
      enabled: false,
      displayName: '',
      maxLength: 100,
      required: false
    },
    {
      key: 'progressNum',
      label: '整改进度（数字）',
      enabled: false,
      displayName: '',
      maxLength: 100,
      required: false,
      requiredDisabled: true,
      hasTip: true
    },
    {
      key: 'attachment',
      label: '佐证附件',
      enabled: true,
      enabledDisabled: true,
      displayName: '佐证附件',
      maxLength: 100,
      required: true,
      requiredDisabled: true
    }
  ],
  // 成效字段（全部勾选且必填）
  effectFields: [
    {
      key: 'correctedAmount',
      label: '已纠正违纪金（元）',
      enabled: true,
      displayName: '已纠正违纪金（元）',
      maxLength: 100,
      required: true
    },
    {
      key: 'recoveredAmount',
      label: '挽回损失金额（元）',
      enabled: true,
      displayName: '挽回损失金额（元）',
      maxLength: 100,
      required: true
    },
    {
      key: 'auditReduceAmount',
      label: '工程审减金额（元）',
      enabled: true,
      displayName: '工程审减金额（元）',
      maxLength: 100,
      required: true
    },
    {
      key: 'otherSaveAmount',
      label: '其他增收节支（元）',
      enabled: true,
      displayName: '其他增收节支（元）',
      maxLength: 100,
      required: true
    },
    {
      key: 'totalAmount',
      label: '合计金额（元）',
      enabled: true,
      displayName: '合计金额（元）',
      maxLength: 100,
      required: true
    }
  ],
  // 销号方式：自动销号
  cancelMode: 'auto',
  // 销号表单设置字段（手动销号时使用）
  cancelFormFields: [
    {
      key: 'checkTime',
      label: '检查时间',
      enabled: true,
      displayName: '检查时间',
      maxLength: 100,
      required: true
    },
    {
      key: 'checkMethod',
      label: '检查方式',
      enabled: true,
      displayName: '检查方式',
      maxLength: 100,
      required: true
    },
    {
      key: 'cancelDesc',
      label: '销号说明',
      enabled: true,
      displayName: '销号说明',
      maxLength: 100,
      required: true
    }
  ],
  // 销号是否需要审批
  cancelNeedApproval: false
})

// 模拟初始流程方案数据（与图中保持一致，根节点"整改阶段"，下挂"整改清单/整改方案/整改进展"）
const mockScheme: ProcessScheme = {
  id: 1,
  name: '整改流程方案1（清单节点反馈方案与进展）',
  version: 'v1',
  description: '默认整改流程方案',
  tree: [
    {
      id: 100,
      parentId: 0,
      name: '整改阶段',
      nodeType: 0,
      isStage: true,
      hasCondition: false,
      permissions: [],
      relatedForms: [],
      hasApproval: false,
      approvalFlowId: null,
      children: [
        {
          id: 101,
          parentId: 100,
          name: '整改清单',
          nodeType: 1,
          isStage: false,
          hasCondition: false,
          permissions: buildDefaultPermissions(),
          relatedForms: [],
          hasApproval: false,
          approvalFlowId: null
        },
        {
          id: 102,
          parentId: 100,
          name: '审计决定',
          nodeType: 5,
          isStage: false,
          hasCondition: false,
          // 与图中权限设置一致：单位整改经办人/责任人 拥有维护和提交权限
          permissions: mockRoles.map((r) => ({
            roleId: r.roleId,
            roleName: r.roleName,
            visible: true,
            canMaintain: r.roleId === 4 || r.roleId === 5,
            canCancel: false,
            canExport: false,
            canSubmit: r.roleId === 4 || r.roleId === 5,
            canIssue: false,
            canFeedback: false
          })),
          relatedForms: [],
          hasApproval: false,
          approvalFlowId: null,
          hasIssue: false
        },
        {
          id: 103,
          parentId: 100,
          name: '整改进展',
          nodeType: 3,
          isStage: false,
          hasCondition: false,
          // 与图1权限一致：四类角色节点可见，且均勾选"导出列表为excel"
          permissions: mockRoles.map((r) => ({
            roleId: r.roleId,
            roleName: r.roleName,
            visible: true,
            canMaintain: false,
            canCancel: false,
            canExport: r.roleId !== 5,
            canSubmit: false,
            canIssue: false,
            canFeedback: false
          })),
          relatedForms: [],
          hasApproval: false,
          approvalFlowId: null,
          // 整改进展专属配置
          progressConfig: buildDefaultProgressConfig()
        }
      ]
    }
  ]
}

// ID 自增计数器
let idSeed = 1000

// 递归查找节点
const findNode = (nodes: ProcessNode[], id: number): ProcessNode | null => {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children?.length) {
      const found = findNode(n.children, id)
      if (found) return found
    }
  }
  return null
}

// 递归更新节点
const updateNodeInTree = (
  nodes: ProcessNode[],
  id: number,
  patch: Partial<ProcessNode>
): boolean => {
  for (const n of nodes) {
    if (n.id === id) {
      Object.assign(n, patch)
      return true
    }
    if (n.children?.length && updateNodeInTree(n.children, id, patch)) {
      return true
    }
  }
  return false
}

// 递归删除节点
const removeNodeInTree = (nodes: ProcessNode[], id: number): boolean => {
  const idx = nodes.findIndex((n) => n.id === id)
  if (idx > -1) {
    nodes.splice(idx, 1)
    return true
  }
  for (const n of nodes) {
    if (n.children?.length && removeNodeInTree(n.children, id)) return true
  }
  return false
}

// ==================== 流程方案接口 ====================

/** 获取流程方案详情（含树结构） */
export const getProcessScheme = async () => {
  await delay()
  return {
    code: 200,
    data: JSON.parse(JSON.stringify(mockScheme)) as ProcessScheme,
    message: 'success'
  }
}

/** 保存流程方案树结构 */
export const saveProcessScheme = async (scheme: ProcessScheme) => {
  await delay()
  mockScheme.tree = scheme.tree
  mockScheme.name = scheme.name
  mockScheme.version = scheme.version
  return { code: 200, data: null, message: '保存成功' }
}

/** 新建阶段（在根级别添加阶段节点） */
export const addStage = async (name: string) => {
  await delay()
  const newStage: ProcessNode = {
    id: ++idSeed,
    parentId: 0,
    name,
    nodeType: 0,
    isStage: true,
    hasCondition: false,
    permissions: [],
    relatedForms: [],
    hasApproval: false,
    approvalFlowId: null,
    children: []
  }
  mockScheme.tree.push(newStage)
  return { code: 200, data: newStage, message: '新建阶段成功' }
}

/** 在指定父节点下添加子节点 */
export const addChildNode = async (parentId: number, name: string) => {
  await delay()
  const parent = findNode(mockScheme.tree, parentId)
  if (!parent) return { code: 500, data: null, message: '父节点不存在' }
  const newNode: ProcessNode = {
    id: ++idSeed,
    parentId,
    name,
    nodeType: 1,
    isStage: false,
    hasCondition: false,
    permissions: buildDefaultPermissions(),
    relatedForms: [],
    hasApproval: false,
    approvalFlowId: null
  }
  if (!parent.children) parent.children = []
  parent.children.push(newNode)
  return { code: 200, data: newNode, message: '添加成功' }
}

/** 更新节点配置 */
export const updateNode = async (form: NodeConfigForm) => {
  await delay()
  const ok = updateNodeInTree(mockScheme.tree, form.id, form)
  return ok
    ? { code: 200, data: null, message: '保存成功' }
    : { code: 500, data: null, message: '节点不存在' }
}

/** 删除节点 */
export const deleteNode = async (id: number) => {
  await delay()
  const ok = removeNodeInTree(mockScheme.tree, id)
  return ok
    ? { code: 200, data: null, message: '删除成功' }
    : { code: 500, data: null, message: '节点不存在' }
}

/** 获取节点类型选项 */
export const getNodeTypeOptions = async () => {
  await delay(100)
  return { code: 200, data: nodeTypeOptions, message: 'success' }
}

/** 获取审批流程选项 */
export const getApprovalFlowOptions = async () => {
  await delay(100)
  return { code: 200, data: approvalFlowOptions, message: 'success' }
}

/** 获取角色列表（用于节点权限） */
export const getRoleOptions = async () => {
  await delay(100)
  return { code: 200, data: mockRoles, message: 'success' }
}
