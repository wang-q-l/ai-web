/**
 * 法规推荐策略 - 类型定义（简化版）
 * 3 维度打分：关键词匹配 / 问题案例匹配 / 颁布年份新旧
 */

/** 推荐打分维度（3 个权重） */
export interface StrategyWeights {
  /** 关键词匹配 */
  keywordMatch: number
  /** 问题案例匹配（与历史相似案例引用过的法规） */
  caseMatch: number
  /** 颁布年份新旧 */
  recency: number
}

/** 全局策略 */
export interface StrategyConfig {
  /** 3 维权重（提交前归一化） */
  weights: StrategyWeights
  /** 最低推荐阈值 0~1 */
  threshold: number
  /** 推荐结果数 */
  topN: number
}

/** 法规条款 */
export interface Clause {
  id: string
  regulationName: string
  articleNo: string
  articleText: string
  year: number
  /** 生效日期 YYYY-MM-DD，缺失时用 `${year}-01-01` 兜底 */
  effectiveDate: string
  /** 该条款替代了哪些前身条款（前身的 id 数组） */
  supersedes?: string[]
  /** 该条款被哪条新法规替代 */
  supersededBy?: string
  /** 由 LLM 离线提取的关键词 */
  keywords: string[]
}

/** 历史问题案例 */
export interface ProblemCase {
  id: string
  problemDescription: string
  /** 该案例引用过的法规 ID 列表 */
  citedClauseIds: string[]
  createdAt: string
}

/** 推荐试验台 - 输入 */
export interface ExperimentRequest {
  /** 问题描述 */
  problemDescription: string
  /** 当前内存策略，未保存也可试推荐 */
  draftStrategy: StrategyConfig
}

/** LLM 抽取的问题发生时间 */
export interface OccurrencePeriod {
  type: 'point' | 'period' | 'unknown'
  /** YYYY-MM-DD */
  start: string
  /** YYYY-MM-DD */
  end: string
  /** 原文片段（用于回显与人工修正） */
  rawText: string
  /** 0~1 置信度 */
  confidence: number
}

/** 时效校验状态 */
export type TemporalStatus =
  | 'valid' // 时效有效
  | 'partial' // 部分冲突（法规生效落在问题区间内）
  | 'conflict-with-replacement' // 全程冲突，有前身可替代
  | 'conflict-no-replacement' // 全程冲突，无前身
  | 'skipped' // 跳过（occurrence=unknown 或未启用）

/** 简化版前身法规（仅展示用） */
export interface PredecessorClause {
  id: string
  regulationName: string
  articleNo: string
  articleText: string
  year: number
  effectiveDate: string
}

/** 推荐试验台 - 单条结果 */
export interface ExperimentResultItem {
  id: string
  regulationName: string
  articleNo: string
  articleText: string
  year: number
  /** 法规生效日期，用于卡片展示 */
  effectiveDate: string
  score: number
  /** 各维度评分明细（已乘权重） */
  scoreBreakdown: StrategyWeights
  /** 一句话适用理由 */
  reason: string
  /** 是否标记为低相关度 */
  lowConfidence?: boolean
  /** 时效校验状态 */
  temporalStatus?: TemporalStatus
  /** 时效冲突时的前身法规建议（status 为 conflict-with-replacement 时填充） */
  predecessors?: PredecessorClause[]
  /** 部分冲突时的分段建议文案（status 为 partial 时填充） */
  partialHint?: string
}
