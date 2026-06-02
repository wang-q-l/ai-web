/**
 * 法规推荐策略 - 类型定义
 * 包含：策略权重、领域覆盖、同义词、法规层级基准分、推荐试验台
 */

/** 法规层级 */
export type RegulationLevel =
  | 'law' // 法律
  | 'admin' // 行政法规
  | 'rule' // 部门规章
  | 'local' // 地方法规
  | 'normative' // 规范性文件

/** 推荐打分维度（5 个权重） */
export interface StrategyWeights {
  /** 关键词匹配 */
  keywordMatch: number
  /** 标签匹配 */
  tagMatch: number
  /** 法规层级 */
  levelPriority: number
  /** 颁布年份新旧 */
  recency: number
  /** 历史采纳率 */
  adoptionRate: number
}

/** 全局策略 / 领域覆盖策略 共用结构 */
export interface StrategyConfig {
  /** 5 维权重（提交前归一化） */
  weights: StrategyWeights
  /** 相关度阈值 0~1 */
  threshold: number
  /** 推荐结果数 */
  topN: number
  /** 允许的法规层级 */
  regulationLevelFilter: RegulationLevel[]
  /** 参与匹配的法规标签 */
  tagFilter: string[]
  /** LLM 二排开关 */
  llmRerankEnabled: boolean
}

/** 领域覆盖策略表项 */
export interface DomainOverride extends StrategyConfig {
  id: number
  /** 领域名（唯一） */
  domain: string
  /** 是否启用 */
  enabled: boolean
  updatedAt: string
}

/** 法规层级基准分 */
export type LevelBaseScore = Record<RegulationLevel, number>

/** 同义词组 */
export interface SynonymGroup {
  id: number
  /** 标准词（唯一） */
  canonical: string
  /** 同义词数组 */
  aliases: string[]
  /** 所属领域，空表示全局 */
  domain: string
  updatedAt: string
}

/** 推荐试验台 - 输入 */
export interface ExperimentRequest {
  /** 问题描述 */
  problemDescription: string
  /** 标签提示，可选 */
  tagHint?: string
  /** 当前内存策略，未保存也可试推荐 */
  draftStrategy: StrategyConfig
  /** 当前层级基准分 */
  levelBaseScore: LevelBaseScore
}

/** 推荐试验台 - 单条结果 */
export interface ExperimentResultItem {
  regulationName: string
  articleNo: string
  articleText: string
  level: RegulationLevel
  year: number
  score: number
  /** 各维度评分明细（已乘权重） */
  scoreBreakdown: StrategyWeights
  /** 一句话适用理由 */
  reason: string
}
