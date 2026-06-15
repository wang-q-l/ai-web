/**
 * 管理建议库 - 类型定义
 * 包含：建议分类树、建议条目、引入向导相关类型
 */

/** 建议分类 */
export interface SuggestionCategory {
  id: string
  /** 分类名（同级唯一） */
  name: string
  /** 父级 id；根分类为 null */
  parentId: string | null
  sortOrder?: number
}

/** 树形分类节点（带子节点 + 计数） */
export interface SuggestionCategoryNode extends SuggestionCategory {
  children?: SuggestionCategoryNode[]
  /** 该节点直接挂的建议数 */
  selfCount?: number
  /** 含子孙合并的建议总数（前端递归计算） */
  totalCount?: number
}

/** 管理建议条目 */
export interface Suggestion {
  id: string
  /** 建议正文（必填，最大 1000 字） */
  content: string
  /** 所属分类 id */
  categoryId: string
  /** 引用量（业务实际选用时 +1） */
  usageCount: number
  createdAt: string
  updatedAt: string
  /** 来源问题 ID（引入时填充，前端不展示） */
  sourceProblemId?: string
}

/** 列表查询参数 */
export interface SuggestionListQuery {
  /** 分类 id；空表示全部 */
  categoryId?: string
  /** 关键词模糊匹配建议正文 */
  keyword?: string
  /** 排序：updatedAt（默认）或 usageCount */
  sortBy?: 'updatedAt' | 'usageCount'
  page: number
  pageSize: number
}

/** 列表响应 */
export interface SuggestionListResult {
  list: Suggestion[]
  total: number
}

/** 审计项目（引入向导左树用） */
export interface AuditProjectNode {
  /** 年份分组 id（如 'year-2026'） */
  id: string
  /** 显示名（年份或项目名） */
  name: string
  /** 类型：year 年份分组 / project 具体项目 */
  type: 'year' | 'project'
  children?: AuditProjectNode[]
}

/** 审计问题（引入向导右表用） */
export interface AuditProblem {
  id: string
  projectId: string
  projectName: string
  /** 问题标题 */
  title: string
  /** 审计建议字段（可能为空） */
  auditAdvice: string
  /** 问题类别（用于自动分类决策） */
  category: string
}

/** 引入预览项 */
export interface ImportPreviewItem {
  /** 临时 id */
  tempId: string
  /** 原始问题 id */
  problemId: string
  /** 来源问题标题 */
  problemTitle: string
  /** 问题类别 */
  problemCategory: string
  /** 建议正文 */
  content: string
  /** 决策状态：normal 自动分发 / unclassified 未分类 / duplicate 重复跳过 */
  status: 'normal' | 'unclassified' | 'duplicate'
  /** 目标分类 id（duplicate 状态时为空） */
  targetCategoryId: string | null
}

/** 引入提交结果 */
export interface ImportResult {
  success: number
  skipped: number
  failed: number
}
