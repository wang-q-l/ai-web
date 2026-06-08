/**
 * 大模型厂商管理 Mock 数据
 * 接口：
 *  厂商  GET    /api/model-provider/provider/list      列表（按名称筛选）
 *       POST   /api/model-provider/provider            新增
 *       PUT    /api/model-provider/provider/:id        更新
 *       DELETE /api/model-provider/provider/:id        删除（有模型时阻止）
 *       PUT    /api/model-provider/provider/:id/status 启停
 *       POST   /api/model-provider/provider/:id/test   连通性测试
 *  模型  GET    /api/model-provider/model/list          列表（按厂商筛选）
 *       POST   /api/model-provider/model               新增
 *       PUT    /api/model-provider/model/:id           更新
 *       DELETE /api/model-provider/model/:id           删除（被智能体引用时阻止）
 *       PUT    /api/model-provider/model/:id/status    启停
 *       PUT    /api/model-provider/model/:id/default    设为默认
 *  智能体 GET   /api/model-provider/agent/list          列表（按名称/来源/状态/厂商筛选）
 *       POST   /api/model-provider/agent               新增
 *       PUT    /api/model-provider/agent/:id           更新
 *       DELETE /api/model-provider/agent/:id           删除（内置不可删）
 *       PUT    /api/model-provider/agent/:id/status    启停
 */

import type {
  Provider,
  ProviderForm,
  ProviderQuery,
  ModelItem,
  ModelForm,
  AgentItem,
  AgentForm,
  AgentQuery,
  ConnStatus
} from '@/types/model-provider'

// 模拟接口延迟
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

// 生成当前时间字符串
const now = () => new Date().toLocaleString('zh-CN', { hour12: false })

// 将明文密钥脱敏为「前缀 + **** + 后 4 位」
const maskKey = (key: string): string => {
  if (!key) return ''
  const tail = key.slice(-4)
  const prefix = key.startsWith('sk-') ? 'sk-' : ''
  return `${prefix}****${tail}`
}

// ==================== 厂商数据 ====================
// 模块级变量持久化，增删改查共享同一数据源
let mockProviders: Provider[] = [
  {
    id: 1,
    name: '阿里云百炼',
    code: 'dashscope',
    apiBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    apiKeyMasked: 'sk-****a1b2',
    defaultModelId: 101,
    qps: 10,
    tokenQuota: 100,
    enabled: true,
    connStatus: 'success',
    modelCount: 3,
    createdAt: '2026-05-10 09:00:00'
  },
  {
    id: 2,
    name: '智谱 AI',
    code: 'zhipu',
    apiBaseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    apiKeyMasked: 'sk-****c3d4',
    defaultModelId: 201,
    qps: 5,
    tokenQuota: 50,
    enabled: true,
    connStatus: 'success',
    modelCount: 2,
    createdAt: '2026-05-12 14:30:00'
  },
  {
    id: 3,
    name: 'DeepSeek',
    code: 'deepseek',
    apiBaseUrl: 'https://api.deepseek.com/v1',
    apiKeyMasked: 'sk-****e5f6',
    defaultModelId: 301,
    qps: 8,
    tokenQuota: 80,
    enabled: true,
    connStatus: 'unknown',
    modelCount: 2,
    createdAt: '2026-05-15 10:20:00'
  },
  {
    id: 4,
    name: 'OpenAI',
    code: 'openai',
    apiBaseUrl: 'https://api.openai.com/v1',
    apiKeyMasked: 'sk-****g7h8',
    defaultModelId: 401,
    qps: 6,
    tokenQuota: 60,
    enabled: false,
    connStatus: 'failed',
    modelCount: 2,
    createdAt: '2026-05-18 16:00:00'
  }
]

// ==================== 模型数据 ====================
let mockModels: ModelItem[] = [
  // 阿里云百炼
  {
    id: 101,
    providerId: 1,
    name: '通义千问-Max',
    modelKey: 'qwen-max',
    type: 'chat',
    contextLength: 32,
    isDefault: true,
    enabled: true,
    createdAt: '2026-05-10 09:05:00'
  },
  {
    id: 102,
    providerId: 1,
    name: '通义千问-VL',
    modelKey: 'qwen-vl-max',
    type: 'multimodal',
    contextLength: 32,
    isDefault: false,
    enabled: true,
    createdAt: '2026-05-10 09:06:00'
  },
  {
    id: 103,
    providerId: 1,
    name: '通义向量',
    modelKey: 'text-embedding-v2',
    type: 'embedding',
    contextLength: 8,
    isDefault: false,
    enabled: true,
    createdAt: '2026-05-10 09:07:00'
  },
  // 智谱 AI
  {
    id: 201,
    providerId: 2,
    name: 'GLM-4-Plus',
    modelKey: 'glm-4-plus',
    type: 'chat',
    contextLength: 128,
    isDefault: true,
    enabled: true,
    createdAt: '2026-05-12 14:35:00'
  },
  {
    id: 202,
    providerId: 2,
    name: 'GLM-4V',
    modelKey: 'glm-4v',
    type: 'multimodal',
    contextLength: 8,
    isDefault: false,
    enabled: true,
    createdAt: '2026-05-12 14:36:00'
  },
  // DeepSeek
  {
    id: 301,
    providerId: 3,
    name: 'DeepSeek-V3',
    modelKey: 'deepseek-chat',
    type: 'chat',
    contextLength: 64,
    isDefault: true,
    enabled: true,
    createdAt: '2026-05-15 10:25:00'
  },
  {
    id: 302,
    providerId: 3,
    name: 'DeepSeek-R1',
    modelKey: 'deepseek-reasoner',
    type: 'reasoning',
    contextLength: 64,
    isDefault: false,
    enabled: true,
    createdAt: '2026-05-15 10:26:00'
  },
  // OpenAI
  {
    id: 401,
    providerId: 4,
    name: 'GPT-4o',
    modelKey: 'gpt-4o',
    type: 'multimodal',
    contextLength: 128,
    isDefault: true,
    enabled: true,
    createdAt: '2026-05-18 16:05:00'
  },
  {
    id: 402,
    providerId: 4,
    name: 'o1',
    modelKey: 'o1',
    type: 'reasoning',
    contextLength: 200,
    isDefault: false,
    enabled: true,
    createdAt: '2026-05-18 16:06:00'
  }
]

// ==================== 智能体数据 ====================
let mockAgents: AgentItem[] = [
  {
    id: 1,
    name: '智能撰写助手',
    source: 'builtin',
    builtinKey: 'intelligent-writing',
    description: '公文、报告等文本的智能撰写与润色',
    systemPrompt: '你是一名专业的公文写作助手，擅长根据要点生成结构完整、用语规范的公文。',
    primaryModelId: 201,
    fallbackModelId: 101,
    params: { temperature: 0.7, maxTokens: 2048, topP: 0.9 },
    enabled: true,
    createdAt: '2026-05-10 09:30:00'
  },
  {
    id: 2,
    name: '法规推荐助手',
    source: 'builtin',
    builtinKey: 'regulation-recommend',
    description: '根据审计问题描述智能推荐适用法规条款',
    systemPrompt: '你是一名法规推荐专家，根据问题描述匹配最相关的法律法规条款并给出适用理由。',
    primaryModelId: 101,
    fallbackModelId: 301,
    params: { temperature: 0.3, maxTokens: 4096, topP: 0.8 },
    enabled: true,
    createdAt: '2026-05-12 15:00:00'
  },
  {
    id: 3,
    name: '合同审查助手',
    source: 'custom',
    description: '审查合同条款风险，标记不利条款并给出修改建议',
    systemPrompt: '你是一名合同审查专家，逐条分析合同条款，识别风险点并提出修改建议。',
    primaryModelId: 401,
    fallbackModelId: null,
    params: { temperature: 0.2, maxTokens: 4096, topP: 0.85 },
    enabled: true,
    createdAt: '2026-05-20 11:00:00'
  },
  {
    id: 4,
    name: '数据分析助手',
    source: 'custom',
    description: '解读业务数据，生成分析结论与图表建议',
    systemPrompt: '你是一名数据分析师，根据用户提供的数据给出洞察结论与可视化建议。',
    primaryModelId: 302,
    fallbackModelId: 201,
    params: { temperature: 0.5, maxTokens: 2048, topP: 0.9 },
    enabled: false,
    createdAt: '2026-05-22 09:40:00'
  }
]

// 重新统计某厂商的模型数量并回写
const refreshModelCount = (providerId: number) => {
  const provider = mockProviders.find((p) => p.id === providerId)
  if (provider) {
    provider.modelCount = mockModels.filter((m) => m.providerId === providerId).length
  }
}

// ==================== 厂商 CRUD ====================

/** 获取厂商列表（按名称筛选，附带模型数量） */
export const getProviderList = async (params: ProviderQuery) => {
  await delay()
  let list = [...mockProviders]
  if (params.name) {
    list = list.filter((p) => p.name.includes(params.name!))
  }
  // 实时校准模型数量
  list.forEach((p) => (p.modelCount = mockModels.filter((m) => m.providerId === p.id).length))
  return { code: 200, message: '成功', data: list }
}

/** 新增厂商 */
export const addProvider = async (data: ProviderForm) => {
  await delay()
  const newProvider: Provider = {
    id: Date.now(),
    name: data.name,
    code: data.code,
    apiBaseUrl: data.apiBaseUrl,
    apiKeyMasked: maskKey(data.apiKey || ''),
    defaultModelId: null,
    qps: data.qps,
    tokenQuota: data.tokenQuota,
    enabled: data.enabled,
    connStatus: 'unknown',
    modelCount: 0,
    createdAt: now()
  }
  mockProviders.push(newProvider)
  return { code: 200, message: '新增成功', data: { id: newProvider.id } }
}

/** 更新厂商（apiKey 留空表示不修改原密钥） */
export const updateProvider = async (id: number, data: ProviderForm) => {
  await delay()
  const idx = mockProviders.findIndex((p) => p.id === id)
  if (idx === -1) return { code: 404, message: '厂商不存在', data: null }
  mockProviders[idx] = {
    ...mockProviders[idx],
    name: data.name,
    code: data.code,
    apiBaseUrl: data.apiBaseUrl,
    // 留空表示不修改，仅在填写了新密钥时才更新脱敏值
    apiKeyMasked: data.apiKey ? maskKey(data.apiKey) : mockProviders[idx].apiKeyMasked,
    defaultModelId: data.defaultModelId,
    qps: data.qps,
    tokenQuota: data.tokenQuota,
    enabled: data.enabled
  }
  return { code: 200, message: '更新成功', data: null }
}

/** 删除厂商（其下有模型时阻止删除） */
export const deleteProvider = async (id: number) => {
  await delay()
  const models = mockModels.filter((m) => m.providerId === id)
  if (models.length > 0) {
    return {
      code: 400,
      message: `该厂商下还有 ${models.length} 个模型，请先删除其下所有模型`,
      data: null
    }
  }
  mockProviders = mockProviders.filter((p) => p.id !== id)
  return { code: 200, message: '删除成功', data: null }
}

/** 厂商启用 / 禁用 */
export const toggleProviderStatus = async (id: number, enabled: boolean) => {
  await delay()
  const provider = mockProviders.find((p) => p.id === id)
  if (!provider) return { code: 404, message: '厂商不存在', data: null }
  provider.enabled = enabled
  return { code: 200, message: enabled ? '已启用' : '已禁用', data: null }
}

/** 连通性测试（mock 随机返回成功 / 失败） */
export const testProviderConn = async (id: number) => {
  await delay(800)
  const provider = mockProviders.find((p) => p.id === id)
  if (!provider) return { code: 404, message: '厂商不存在', data: null }
  // mock：禁用的厂商直接失败，其余 80% 概率成功
  const ok = provider.enabled && Math.random() > 0.2
  const status: ConnStatus = ok ? 'success' : 'failed'
  provider.connStatus = status
  return {
    code: 200,
    message: ok ? '连接成功' : '连接失败，请检查 API 地址与密钥',
    data: { connStatus: status }
  }
}

// ==================== 模型 CRUD ====================

/** 获取指定厂商的模型列表 */
export const getModelList = async (providerId: number) => {
  await delay()
  const list = mockModels.filter((m) => m.providerId === providerId)
  return { code: 200, message: '成功', data: list }
}

/** 获取全部模型（供智能体主备模型级联选择，附带厂商启用状态） */
export const getAllModels = async () => {
  await delay()
  // 仅返回可作为对话主体的类型 + 标注所属厂商是否启用，供前端置灰处理
  const list = mockModels.map((m) => {
    const provider = mockProviders.find((p) => p.id === m.providerId)
    return {
      ...m,
      providerName: provider?.name || '',
      providerEnabled: provider?.enabled ?? false
    }
  })
  return { code: 200, message: '成功', data: list }
}

/** 新增模型 */
export const addModel = async (data: ModelForm) => {
  await delay()
  const newModel: ModelItem = {
    id: Date.now(),
    providerId: data.providerId,
    name: data.name,
    modelKey: data.modelKey,
    type: data.type,
    contextLength: data.contextLength,
    isDefault: false,
    enabled: data.enabled,
    createdAt: now()
  }
  mockModels.push(newModel)
  refreshModelCount(data.providerId)
  return { code: 200, message: '新增成功', data: { id: newModel.id } }
}

/** 更新模型 */
export const updateModel = async (id: number, data: ModelForm) => {
  await delay()
  const idx = mockModels.findIndex((m) => m.id === id)
  if (idx === -1) return { code: 404, message: '模型不存在', data: null }
  mockModels[idx] = {
    ...mockModels[idx],
    name: data.name,
    modelKey: data.modelKey,
    type: data.type,
    contextLength: data.contextLength,
    enabled: data.enabled
  }
  return { code: 200, message: '更新成功', data: null }
}

/** 删除模型（被智能体作为主 / 备模型引用时阻止） */
export const deleteModel = async (id: number) => {
  await delay()
  const refAgents = mockAgents.filter((a) => a.primaryModelId === id || a.fallbackModelId === id)
  if (refAgents.length > 0) {
    const names = refAgents.map((a) => a.name).join('、')
    return {
      code: 400,
      message: `该模型已被智能体【${names}】引用，请先解除绑定`,
      data: null
    }
  }
  const model = mockModels.find((m) => m.id === id)
  if (!model) return { code: 404, message: '模型不存在', data: null }
  // 删除默认模型需先改默认
  if (model.isDefault) {
    return { code: 400, message: '该模型为厂商默认模型，请先将其他模型设为默认', data: null }
  }
  const providerId = model.providerId
  mockModels = mockModels.filter((m) => m.id !== id)
  refreshModelCount(providerId)
  return { code: 200, message: '删除成功', data: null }
}

/** 模型启用 / 禁用 */
export const toggleModelStatus = async (id: number, enabled: boolean) => {
  await delay()
  const model = mockModels.find((m) => m.id === id)
  if (!model) return { code: 404, message: '模型不存在', data: null }
  // 默认模型不允许停用
  if (!enabled && model.isDefault) {
    return { code: 400, message: '默认模型不可停用，请先切换默认模型', data: null }
  }
  model.enabled = enabled
  return { code: 200, message: enabled ? '已启用' : '已禁用', data: null }
}

/** 设为默认模型（必须为启用状态，同厂商内其他模型取消默认） */
export const setDefaultModel = async (id: number) => {
  await delay()
  const model = mockModels.find((m) => m.id === id)
  if (!model) return { code: 404, message: '模型不存在', data: null }
  if (!model.enabled) {
    return { code: 400, message: '仅启用状态的模型可设为默认', data: null }
  }
  // 同厂商内其他模型取消默认
  mockModels.forEach((m) => {
    if (m.providerId === model.providerId) m.isDefault = m.id === id
  })
  // 回写厂商默认模型 id
  const provider = mockProviders.find((p) => p.id === model.providerId)
  if (provider) provider.defaultModelId = id
  return { code: 200, message: '已设为默认模型', data: null }
}

// ==================== 智能体 CRUD ====================

/** 获取智能体列表（按名称 / 来源 / 状态 / 绑定厂商筛选） */
export const getAgentList = async (params: AgentQuery) => {
  await delay()
  let list = [...mockAgents]
  if (params.name) {
    list = list.filter((a) => a.name.includes(params.name!))
  }
  if (params.source) {
    list = list.filter((a) => a.source === params.source)
  }
  if (params.enabled !== '' && params.enabled !== undefined) {
    list = list.filter((a) => a.enabled === params.enabled)
  }
  // 按绑定厂商筛选：匹配主模型所属厂商
  if (params.providerId !== '' && params.providerId !== undefined) {
    list = list.filter((a) => {
      const model = mockModels.find((m) => m.id === a.primaryModelId)
      return model?.providerId === Number(params.providerId)
    })
  }
  return { code: 200, message: '成功', data: list }
}

/** 新增智能体（自建） */
export const addAgent = async (data: AgentForm) => {
  await delay()
  const newAgent: AgentItem = {
    id: Date.now(),
    name: data.name,
    source: 'custom', // 新增一律为自建
    description: data.description,
    systemPrompt: data.systemPrompt,
    primaryModelId: data.primaryModelId,
    fallbackModelId: data.fallbackModelId,
    params: { ...data.params },
    enabled: data.enabled,
    createdAt: now()
  }
  mockAgents.push(newAgent)
  return { code: 200, message: '新增成功', data: { id: newAgent.id } }
}

/** 更新智能体（内置体仅可改主备模型 / 参数 / 启停，名称等只读字段不更新） */
export const updateAgent = async (id: number, data: AgentForm) => {
  await delay()
  const idx = mockAgents.findIndex((a) => a.id === id)
  if (idx === -1) return { code: 404, message: '智能体不存在', data: null }
  const current = mockAgents[idx]
  if (current.source === 'builtin') {
    // 内置：仅更新可改字段
    mockAgents[idx] = {
      ...current,
      primaryModelId: data.primaryModelId,
      fallbackModelId: data.fallbackModelId,
      params: { ...data.params },
      enabled: data.enabled
    }
  } else {
    // 自建：全字段可改
    mockAgents[idx] = {
      ...current,
      name: data.name,
      description: data.description,
      systemPrompt: data.systemPrompt,
      primaryModelId: data.primaryModelId,
      fallbackModelId: data.fallbackModelId,
      params: { ...data.params },
      enabled: data.enabled
    }
  }
  return { code: 200, message: '更新成功', data: null }
}

/** 删除智能体（内置不可删除） */
export const deleteAgent = async (id: number) => {
  await delay()
  const agent = mockAgents.find((a) => a.id === id)
  if (!agent) return { code: 404, message: '智能体不存在', data: null }
  if (agent.source === 'builtin') {
    return { code: 400, message: '内置智能体不可删除', data: null }
  }
  mockAgents = mockAgents.filter((a) => a.id !== id)
  return { code: 200, message: '删除成功', data: null }
}

/** 智能体启用 / 禁用 */
export const toggleAgentStatus = async (id: number, enabled: boolean) => {
  await delay()
  const agent = mockAgents.find((a) => a.id === id)
  if (!agent) return { code: 404, message: '智能体不存在', data: null }
  agent.enabled = enabled
  return { code: 200, message: enabled ? '已启用' : '已禁用', data: null }
}
