/**
 * 大模型厂商管理模块类型定义
 * 包含：模型厂商、模型、智能体三类实体及其查询/表单类型
 */

/** 连通性测试状态：未知 / 检测中 / 成功 / 失败 */
export type ConnStatus = 'unknown' | 'testing' | 'success' | 'failed'

/** 模型类型：对话 / 多模态 / 向量 / 推理 */
export type ModelType = 'chat' | 'multimodal' | 'embedding' | 'reasoning'

/** 智能体来源：平台内置 / 用户自建 */
export type AgentSource = 'builtin' | 'custom'

/**
 * 模型厂商
 */
export interface Provider {
  id: number
  name: string // 厂商名称，如 阿里云百炼
  code: string // 唯一标识，如 dashscope
  apiBaseUrl: string // API 地址 / Endpoint
  apiKeyMasked: string // 脱敏后的 API Key，仅展示后 4 位，如 sk-****abcd
  defaultModelId: number | null // 默认模型 id
  qps: number // 限流：每秒请求数
  tokenQuota: number // 限流：Token 配额（单位：万 token）
  enabled: boolean // 启用 / 禁用
  connStatus: ConnStatus // 连通性测试状态
  modelCount: number // 该厂商下模型数量（列表展示用）
  createdAt: string
}

/**
 * 厂商查询参数
 */
export interface ProviderQuery {
  name?: string // 按厂商名称搜索
}

/**
 * 厂商表单
 * apiKey 留空表示不修改原密钥
 */
export interface ProviderForm {
  id?: number
  name: string
  code: string
  apiBaseUrl: string
  apiKey?: string // 明文密钥，提交时使用；编辑留空表示不修改
  defaultModelId: number | null
  qps: number
  tokenQuota: number
  enabled: boolean
}

/**
 * 模型（隶属厂商）
 */
export interface ModelItem {
  id: number
  providerId: number // 所属厂商 id
  name: string // 模型名称，如 通义千问-Max
  modelKey: string // 型号标识，如 qwen-max
  type: ModelType // 模型类型
  contextLength: number // 上下文长度（单位：K）
  isDefault: boolean // 是否为厂商默认模型
  enabled: boolean // 启用 / 禁用
  createdAt: string
}

/**
 * 模型表单
 */
export interface ModelForm {
  id?: number
  providerId: number
  name: string
  modelKey: string
  type: ModelType
  contextLength: number
  enabled: boolean
}

/**
 * 智能体参数（模型调用参数）
 */
export interface AgentParams {
  temperature: number // 随机性 0~2
  maxTokens: number // 单次最大输出 token
  topP: number // 核采样 0~1
}

/**
 * 智能体
 */
export interface AgentItem {
  id: number
  name: string // 智能体名称
  source: AgentSource // 来源：内置 / 自建
  builtinKey?: string // 内置标识，关联具体 AI 应用（仅内置体有）
  description: string // 用途描述
  systemPrompt: string // 系统提示词
  primaryModelId: number | null // 主模型 id
  fallbackModelId: number | null // 备用模型 id（主模型不可用时降级）
  params: AgentParams // 调用参数
  enabled: boolean // 启用 / 禁用
  createdAt: string
}

/**
 * 智能体查询参数
 */
export interface AgentQuery {
  name?: string // 按名称搜索
  source?: AgentSource | '' // 按来源筛选
  enabled?: boolean | '' // 按状态筛选
  providerId?: number | '' // 按绑定厂商筛选（匹配主模型所属厂商）
}

/**
 * 智能体表单
 */
export interface AgentForm {
  id?: number
  name: string
  source: AgentSource
  description: string
  systemPrompt: string
  primaryModelId: number | null
  fallbackModelId: number | null
  params: AgentParams
  enabled: boolean
}
