/**
 * 审计项目推荐相关类型定义
 */

/**
 * 推荐项优先级
 */
export type RecommendationPriority = 'P0' | 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6'

/**
 * 推荐原因类型
 */
export type ReasonType = 'resignation' | 'cycle' | 'never'

/**
 * 推荐项
 */
export interface RecommendationItem {
  /** ID */
  id: number
  /** 单位ID */
  unitId: number
  /** 单位名称 */
  unitName: string
  /** 被审计对象ID */
  auditeeId: number
  /** 被审计对象姓名 */
  auditeeName: string
  /** 职务 */
  position: string
  /** 推荐原因 */
  reason: string
  /** 推荐原因类型 */
  reasonType: ReasonType
  /** 上次审计年度 */
  lastAuditYear?: string
  /** 距离轮审周期结束年数 */
  yearsToDeadline?: number
  /** 优先级 */
  priority: RecommendationPriority
  /** 离职日期 */
  resignationDate?: string
}

/**
 * 查询参数
 */
export interface RecommendationParams {
  /** 优先级筛选 */
  priority?: string
  /** 单位名称 */
  unitName?: string
  /** 被审计对象 */
  auditee?: string
  /** 当前页码 */
  page: number
  /** 每页大小 */
  pageSize: number
}

/**
 * 消息类型
 */
export type MessageType = 'user' | 'assistant'

/**
 * 聊天消息
 */
export interface ChatMessage {
  /** 消息ID */
  id: string
  /** 消息类型 */
  type: MessageType
  /** 消息内容 */
  content: string
  /** 推荐列表（仅assistant类型） */
  recommendations?: RecommendationItem[]
  /** 时间戳 */
  timestamp: number
}

/**
 * AI对话请求参数
 */
export interface ChatRequest {
  /** 用户消息 */
  message: string
  /** 会话历史 */
  history?: ChatMessage[]
}

/**
 * AI对话响应
 */
export interface ChatResponse {
  /** 回复内容 */
  reply: string
  /** 推荐列表 */
  recommendations?: RecommendationItem[]
  /** 思考步骤 */
  thinkingSteps?: string[]
}
