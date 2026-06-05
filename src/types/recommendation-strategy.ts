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

/** 推荐试验台 - 单条结果 */
export interface ExperimentResultItem {
  id: string
  regulationName: string
  articleNo: string
  articleText: string
  year: number
  score: number
  /** 各维度评分明细（已乘权重） */
  scoreBreakdown: StrategyWeights
  /** 一句话适用理由 */
  reason: string
  /** 是否标记为低相关度 */
  lowConfidence?: boolean
}
