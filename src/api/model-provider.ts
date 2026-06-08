/**
 * 大模型厂商管理 API
 * USE_MOCK 开启时走 src/mock/model-provider.ts，关闭时走真实接口
 */
import request from '@/utils/http'
import type {
  Provider,
  ProviderForm,
  ProviderQuery,
  ModelItem,
  ModelForm,
  AgentItem,
  AgentForm,
  AgentQuery
} from '@/types/model-provider'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// ==================== 厂商 ====================

/** 获取厂商列表（按名称筛选） */
export const getProviderList = async (params: ProviderQuery = {}) => {
  if (USE_MOCK) {
    return import('@/mock/model-provider').then((m) => m.getProviderList(params))
  }
  return request.get<Provider[]>({ url: '/api/model-provider/provider/list', params })
}

/** 新增厂商 */
export const addProvider = async (data: ProviderForm) => {
  if (USE_MOCK) {
    return import('@/mock/model-provider').then((m) => m.addProvider(data))
  }
  return request.post<{ id: number }>({ url: '/api/model-provider/provider', data })
}

/** 更新厂商（apiKey 留空表示不修改原密钥） */
export const updateProvider = async (id: number, data: ProviderForm) => {
  if (USE_MOCK) {
    return import('@/mock/model-provider').then((m) => m.updateProvider(id, data))
  }
  return request.put({ url: `/api/model-provider/provider/${id}`, data })
}

/** 删除厂商（其下有模型时阻止删除） */
export const deleteProvider = async (id: number) => {
  if (USE_MOCK) {
    return import('@/mock/model-provider').then((m) => m.deleteProvider(id))
  }
  return request.del({ url: `/api/model-provider/provider/${id}` })
}

/** 厂商启用 / 禁用 */
export const toggleProviderStatus = async (id: number, enabled: boolean) => {
  if (USE_MOCK) {
    return import('@/mock/model-provider').then((m) => m.toggleProviderStatus(id, enabled))
  }
  return request.put({ url: `/api/model-provider/provider/${id}/status`, data: { enabled } })
}

/** 厂商连通性测试 */
export const testProviderConn = async (id: number) => {
  if (USE_MOCK) {
    return import('@/mock/model-provider').then((m) => m.testProviderConn(id))
  }
  return request.post({ url: `/api/model-provider/provider/${id}/test` })
}

// ==================== 模型 ====================

/** 获取指定厂商的模型列表 */
export const getModelList = async (providerId: number) => {
  if (USE_MOCK) {
    return import('@/mock/model-provider').then((m) => m.getModelList(providerId))
  }
  return request.get<ModelItem[]>({
    url: '/api/model-provider/model/list',
    params: { providerId }
  })
}

/** 获取全部模型（供智能体主备模型级联选择） */
export const getAllModels = async () => {
  if (USE_MOCK) {
    return import('@/mock/model-provider').then((m) => m.getAllModels())
  }
  return request.get<ModelItem[]>({ url: '/api/model-provider/model/all' })
}

/** 新增模型 */
export const addModel = async (data: ModelForm) => {
  if (USE_MOCK) {
    return import('@/mock/model-provider').then((m) => m.addModel(data))
  }
  return request.post<{ id: number }>({ url: '/api/model-provider/model', data })
}

/** 更新模型 */
export const updateModel = async (id: number, data: ModelForm) => {
  if (USE_MOCK) {
    return import('@/mock/model-provider').then((m) => m.updateModel(id, data))
  }
  return request.put({ url: `/api/model-provider/model/${id}`, data })
}

/** 删除模型（被智能体引用时阻止删除） */
export const deleteModel = async (id: number) => {
  if (USE_MOCK) {
    return import('@/mock/model-provider').then((m) => m.deleteModel(id))
  }
  return request.del({ url: `/api/model-provider/model/${id}` })
}

/** 模型启用 / 禁用 */
export const toggleModelStatus = async (id: number, enabled: boolean) => {
  if (USE_MOCK) {
    return import('@/mock/model-provider').then((m) => m.toggleModelStatus(id, enabled))
  }
  return request.put({ url: `/api/model-provider/model/${id}/status`, data: { enabled } })
}

/** 设为默认模型 */
export const setDefaultModel = async (id: number) => {
  if (USE_MOCK) {
    return import('@/mock/model-provider').then((m) => m.setDefaultModel(id))
  }
  return request.put({ url: `/api/model-provider/model/${id}/default` })
}

// ==================== 智能体 ====================

/** 获取智能体列表（按名称 / 来源 / 状态 / 厂商筛选） */
export const getAgentList = async (params: AgentQuery = {}) => {
  if (USE_MOCK) {
    return import('@/mock/model-provider').then((m) => m.getAgentList(params))
  }
  return request.get<AgentItem[]>({ url: '/api/model-provider/agent/list', params })
}

/** 新增智能体（自建） */
export const addAgent = async (data: AgentForm) => {
  if (USE_MOCK) {
    return import('@/mock/model-provider').then((m) => m.addAgent(data))
  }
  return request.post<{ id: number }>({ url: '/api/model-provider/agent', data })
}

/** 更新智能体 */
export const updateAgent = async (id: number, data: AgentForm) => {
  if (USE_MOCK) {
    return import('@/mock/model-provider').then((m) => m.updateAgent(id, data))
  }
  return request.put({ url: `/api/model-provider/agent/${id}`, data })
}

/** 删除智能体（内置不可删除） */
export const deleteAgent = async (id: number) => {
  if (USE_MOCK) {
    return import('@/mock/model-provider').then((m) => m.deleteAgent(id))
  }
  return request.del({ url: `/api/model-provider/agent/${id}` })
}

/** 智能体启用 / 禁用 */
export const toggleAgentStatus = async (id: number, enabled: boolean) => {
  if (USE_MOCK) {
    return import('@/mock/model-provider').then((m) => m.toggleAgentStatus(id, enabled))
  }
  return request.put({ url: `/api/model-provider/agent/${id}/status`, data: { enabled } })
}
