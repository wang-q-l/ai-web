/**
 * 决定节点配置（整改流程方案配置）相关类型定义
 */

// 节点类型枚举：1=整改清单 2=整改方案 3=整改进展 4=整改报告 5=审计决定 6=审计移送
export type NodeType = 1 | 2 | 3 | 4 | 5 | 6

// 节点权限项（每个角色一行）
export interface NodePermission {
  // 角色 ID
  roleId: number
  // 角色名称
  roleName: string
  // 节点是否可见
  visible: boolean
  // 操作权限：维护/销号/导出列表/提交/下达（仅审计决定）/移送反馈（仅审计移送）
  canMaintain: boolean
  canCancel: boolean
  canExport: boolean
  canSubmit: boolean
  canIssue: boolean
  canFeedback: boolean
}

// 流程节点
export interface ProcessNode {
  // 节点 ID（前端临时 ID 或后端 ID）
  id: number
  // 父节点 ID，根节点为 0
  parentId: number
  // 节点名称
  name: string
  // 节点类型，根节点（整改阶段）此字段为 0
  nodeType: NodeType | 0
  // 是否阶段节点（根/分组节点）
  isStage: boolean
  // 是否有显示条件
  hasCondition: boolean
  // 节点权限列表
  permissions: NodePermission[]
  // 关联表单（原"问题来源"），存节点 ID
  relatedForms: number[]
  // 是否设置审批流程
  hasApproval: boolean
  // 审批流程 ID（hasApproval=true 时有效）
  approvalFlowId?: number | null
  // 是否下达（仅审计决定类型有效）
  hasIssue?: boolean
  // 子节点
  children?: ProcessNode[]
}

// 流程方案
export interface ProcessScheme {
  // 方案 ID
  id: number
  // 方案名称
  name: string
  // 版本号
  version: string
  // 描述
  description?: string
  // 树结构
  tree: ProcessNode[]
}

// 节点表单提交体（去除 children 等树结构字段）
export interface NodeConfigForm {
  id: number
  parentId: number
  name: string
  nodeType: NodeType | 0
  isStage: boolean
  hasCondition: boolean
  permissions: NodePermission[]
  relatedForms: number[]
  hasApproval: boolean
  approvalFlowId?: number | null
  hasIssue?: boolean
}

// 审批流程选项
export interface ApprovalFlowOption {
  id: number
  name: string
}

// 节点类型选项
export interface NodeTypeOption {
  value: NodeType
  label: string
}
