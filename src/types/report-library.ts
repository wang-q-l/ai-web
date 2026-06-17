/**
 * 报告库 - 类型定义
 * 包含：报告分类树、报告条目、从项目引入向导相关类型
 */

/** 报告分类 */
export interface ReportCategory {
  id: string
  /** 分类名（同级唯一） */
  name: string
  /** 父级 id；根分类为 null */
  parentId: string | null
  sortOrder?: number
  /** 是否系统预置（项目类型分类与「未分类」不可删） */
  preset?: boolean
}

/** 树形分类节点（带子节点 + 计数） */
export interface ReportCategoryNode extends ReportCategory {
  children?: ReportCategoryNode[]
  /** 该节点直接挂的报告数 */
  selfCount?: number
  /** 含子孙合并的报告总数（前端递归计算） */
  totalCount?: number
}

/** 报告条目 */
export interface Report {
  id: string
  /** 报告名称（必填） */
  name: string
  /** 所属分类 id */
  categoryId: string
  /** 文件名（含扩展名） */
  fileName: string
  /** 文件 URL（预览/下载） */
  fileUrl: string
  /** 文件类型（扩展名小写：pdf/doc/docx/xls/xlsx） */
  fileType: string
  /** 文件大小（字节） */
  fileSize: number
  /** 是否收藏 */
  isFavorite: boolean
  createdAt: string
  updatedAt: string
  /** 来源项目 id（从项目引入时填充） */
  sourceProjectId?: string
}

/** 列表查询参数 */
export interface ReportListQuery {
  /** 分类 id；空表示全部 */
  categoryId?: string
  /** 关键词模糊匹配报告名称 */
  keyword?: string
  /** 排序：createdAt（默认）或 name */
  sortBy?: 'createdAt' | 'name'
  /** 仅看收藏 */
  onlyFavorite?: boolean
  page: number
  pageSize: number
}

/** 列表响应 */
export interface ReportListResult {
  list: Report[]
  total: number
}

/** 审计项目（引入向导左树用） */
export interface AuditProjectNode {
  /** 年份分组 id 或项目 id */
  id: string
  /** 显示名（年份或项目名） */
  name: string
  /** 类型：year 年份分组 / project 具体项目 */
  type: 'year' | 'project'
  children?: AuditProjectNode[]
}

/** 项目报告附件（引入向导右表用） */
export interface ProjectReportAttachment {
  /** 附件 id */
  id: string
  projectId: string
  projectName: string
  /** 报告名称 */
  name: string
  /** 文件名 */
  fileName: string
  /** 文件 URL */
  fileUrl: string
  /** 文件类型 */
  fileType: string
  /** 文件大小（字节） */
  fileSize: number
  /** 项目类型（用于自动分类决策，如「财务审计」） */
  category: string
}

/** 引入预览项 */
export interface ReportImportPreviewItem {
  /** 临时 id */
  tempId: string
  /** 原始附件 id */
  attachmentId: string
  /** 报告名称 */
  reportName: string
  /** 来源项目名 */
  projectName: string
  /** 项目类型（用于展示） */
  projectCategory: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  /** 来源项目 id */
  projectId: string
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
