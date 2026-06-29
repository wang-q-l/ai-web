/**
 * 典型问题库 - 类型定义
 * 用于「引用知识中心」面板的典型问题库标签：分类树 + 问题列表 + 引用
 */

/** 问题分类节点（树形） */
export interface ProblemCategoryNode {
  id: string
  /** 分类名 */
  name: string
  /** 子分类 */
  children?: ProblemCategoryNode[]
  /** 含子孙的问题总数（前端展示用，可选） */
  totalCount?: number
}

/** 典型问题条目 */
export interface TypicalProblem {
  id: string
  /** 所属分类 id */
  categoryId: string
  /** 问题类别（冗余展示名，对应表格「问题类别」列） */
  category: string
  /** 问题表述（表现形式） */
  description: string
  /** 主要定性依据 */
  qualitativeBasis: string
  /** 处理意见或建议 */
  advice: string
  /** 是否已被当前用户收藏 */
  favorited: boolean
}

/** 列表查询参数 */
export interface TypicalProblemQuery {
  /** 分类 id；空表示全部 */
  categoryId?: string
  /** 关键词，模糊匹配问题表述 */
  keyword?: string
  /** 仅看我的收藏 */
  onlyFavorite?: boolean
  page: number
  pageSize: number
}

/** 列表响应 */
export interface TypicalProblemResult {
  list: TypicalProblem[]
  total: number
}
