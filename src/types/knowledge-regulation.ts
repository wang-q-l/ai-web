/**
 * 知识中心 - 法规与条款类型定义
 */

/** 法规层级 */
export type RegulationLevel =
  | 'law' // 法律
  | 'admin' // 行政法规
  | 'rule' // 部门规章
  | 'local' // 地方法规
  | 'normative' // 规范性文件
  | 'internal' // 内部规章制度

/** 法规时效性 */
export type EffectStatus =
  | 'active' // 现行有效
  | 'repealed' // 已废止
  | 'pending' // 尚未生效

/** 效力位阶（一级分类） */
export type Hierarchy = 'external' | 'internal'

/** 法规类型（与 RegulationLevel 等价，二级分类，便于 UI 文案） */
export type RegulationType = RegulationLevel

/** 知识中心 - 法规元信息 */
export interface KnowledgeRegulation {
  id: string
  /** 法规名（不含书名号） */
  name: string
  /** 效力位阶（外部法律法规 / 内部规章制度） */
  hierarchy: Hierarchy
  /** 类型（即原 level：法律 / 行政法规 / 部门规章…） */
  level: RegulationLevel
  status: EffectStatus
  /** 颁布日期 YYYY-MM-DD */
  promulgationDate: string
  /** 生效日期 YYYY-MM-DD */
  effectiveDate: string
  /** 废止日期（仅 repealed 时有值） */
  repealedDate?: string
  /** 颁布机关 */
  promulgationOrg: string
  /** 颁布年份（用于年份 facet 筛选） */
  year: number
  /** 文号 / 编号（如「021」「001」） */
  docNo?: string
  /** 摘要（卡片中展示的"亮点条款"，1-2 句） */
  summary?: string
  /** 全文预览 URL（PDF/HTML，模拟知识中心提供） */
  fileUrl?: string
  /** 全文内容（mock 阶段直接渲染；真实环境改用 fileUrl 嵌入） */
  fullText?: string
}

/** 知识中心 - 法规条款 */
export interface KnowledgeArticle {
  id: string
  /** 所属法规 id */
  regulationId: string
  /** 条款号（如「第五十七条」「第十二条第三款」） */
  articleNo: string
  /** 条款原文 */
  articleText: string
  /** 在该法规中的顺序 */
  sortOrder: number
}

/** 法规列表查询参数 */
export interface RegulationListQuery {
  /** 搜索范围：全文 / 法规名 */
  searchScope?: 'fulltext' | 'name'
  /** 关键词 */
  keyword?: string
  /** 效力位阶：external / internal */
  hierarchy?: Hierarchy
  /** 类型（即 level） */
  level?: RegulationLevel
  /** 时效性 */
  status?: EffectStatus
  /** 颁布年份（精确匹配） */
  year?: number
  /** 排序：promulgationDate / effectiveDate */
  sortBy?: 'promulgationDate' | 'effectiveDate'
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc'
  page: number
  pageSize: number
}

/** 法规列表响应 */
export interface RegulationListResult {
  list: KnowledgeRegulation[]
  total: number
}

/** 各层级数量统计（按当前时效性过滤） */
export interface LevelCounts {
  /** 「全部」总数 */
  all: number
  law: number
  admin: number
  rule: number
  local: number
  normative: number
  internal: number
}
