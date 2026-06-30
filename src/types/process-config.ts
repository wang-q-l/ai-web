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

// 整改进展字段项（未整改/正在整改/已整改/成效/销号表单 中的单行字段配置）
export interface ProgressFieldItem {
  // 字段唯一 key
  key: string
  // 字段名称（左侧勾选项文案）
  label: string
  // 是否启用该字段（左侧复选框）
  enabled: boolean
  // 复选框是否禁用（固定字段不可取消勾选）
  enabledDisabled?: boolean
  // 显示名（输入框内容）
  displayName: string
  // 显示名最大长度
  maxLength?: number
  // 是否必填
  required: boolean
  // 是否必填单选是否禁用（部分字段固定必填/固定非必填）
  requiredDisabled?: boolean
  // 字段名右侧是否带提示图标
  hasTip?: boolean
}

// 整改进展节点专属配置
export interface ProgressNodeConfig {
  // 问题来源（可多选，存来源名称）
  problemSource: string[]
  // 进展提交方式：project=按项目提交 issue=按问题提交
  submitMode: 'project' | 'issue'
  // 非立行立改问题的进展填报频率：onComplete=整改完成填报 quarter=每季度填报一次 year=每年填报一次
  reportFrequency: 'onComplete' | 'quarter' | 'year'
  // 是否需要审批
  needApproval: boolean
  // 是否需要整改成效（默认 true；为 false 时成效字段无需勾选，可隐藏/灰显）
  needEffect: boolean
  // 未整改字段
  unrectifiedFields: ProgressFieldItem[]
  // 正在整改字段
  rectifyingFields: ProgressFieldItem[]
  // 已整改字段
  rectifiedFields: ProgressFieldItem[]
  // 成效字段
  effectFields: ProgressFieldItem[]
  // 销号方式：auto=自动销号 manual=手动销号
  cancelMode: 'auto' | 'manual'
  // 销号表单设置字段（仅手动销号时使用）
  cancelFormFields: ProgressFieldItem[]
  // 销号是否需要审批
  cancelNeedApproval: boolean
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
  // 整改进展专属配置（仅 nodeType=3 时有效）
  progressConfig?: ProgressNodeConfig
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
  // 整改进展专属配置（仅 nodeType=3 时有效）
  progressConfig?: ProgressNodeConfig
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
