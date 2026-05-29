/**
 * 决定节点配置（整改流程方案配置）API 接口
 */
import request from '@/utils/http'
import type {
  ProcessScheme,
  NodeConfigForm,
  ProcessNode,
  NodeTypeOption,
  ApprovalFlowOption
} from '@/types/process-config'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/** 获取流程方案详情（含树结构） */
export const getProcessScheme = () => {
  if (USE_MOCK) {
    return import('@/mock/process-config').then((m) => m.getProcessScheme())
  }
  return request.get<ProcessScheme>({ url: '/api/audit-decision/process-scheme' })
}

/** 保存流程方案 */
export const saveProcessScheme = (scheme: ProcessScheme) => {
  if (USE_MOCK) {
    return import('@/mock/process-config').then((m) => m.saveProcessScheme(scheme))
  }
  return request.post({ url: '/api/audit-decision/process-scheme', data: scheme })
}

/** 新建阶段节点 */
export const addStage = (name: string) => {
  if (USE_MOCK) {
    return import('@/mock/process-config').then((m) => m.addStage(name))
  }
  return request.post<ProcessNode>({
    url: '/api/audit-decision/process-scheme/stage',
    data: { name }
  })
}

/** 在指定父节点下添加子节点 */
export const addChildNode = (parentId: number, name: string) => {
  if (USE_MOCK) {
    return import('@/mock/process-config').then((m) => m.addChildNode(parentId, name))
  }
  return request.post<ProcessNode>({
    url: '/api/audit-decision/process-scheme/node',
    data: { parentId, name }
  })
}

/** 更新节点配置 */
export const updateNode = (form: NodeConfigForm) => {
  if (USE_MOCK) {
    return import('@/mock/process-config').then((m) => m.updateNode(form))
  }
  return request.put({ url: `/api/audit-decision/process-scheme/node/${form.id}`, data: form })
}

/** 删除节点 */
export const deleteNode = (id: number) => {
  if (USE_MOCK) {
    return import('@/mock/process-config').then((m) => m.deleteNode(id))
  }
  return request.del({ url: `/api/audit-decision/process-scheme/node/${id}` })
}

/** 获取节点类型选项 */
export const getNodeTypeOptions = () => {
  if (USE_MOCK) {
    return import('@/mock/process-config').then((m) => m.getNodeTypeOptions())
  }
  return request.get<NodeTypeOption[]>({ url: '/api/audit-decision/process-scheme/node-types' })
}

/** 获取审批流程选项 */
export const getApprovalFlowOptions = () => {
  if (USE_MOCK) {
    return import('@/mock/process-config').then((m) => m.getApprovalFlowOptions())
  }
  return request.get<ApprovalFlowOption[]>({
    url: '/api/audit-decision/process-scheme/approval-flows'
  })
}

/** 获取角色列表（用于节点权限表格） */
export const getRoleOptions = () => {
  if (USE_MOCK) {
    return import('@/mock/process-config').then((m) => m.getRoleOptions())
  }
  return request.get({ url: '/api/audit-decision/process-scheme/roles' })
}
