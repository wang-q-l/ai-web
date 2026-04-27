/**
 * AI助手相关类型定义
 */

/** 章节状态 */
export type SectionStatus = 'pending' | 'ready' | 'generating' | 'completed'

/** 插入模式 */
export type InsertMode = 'cursor' | 'replace' | 'append'

/** 生成模式 */
export type GenerateMode = 'quick' | 'complete'

/** 章节信息 */
export interface Section {
  /** 章节ID */
  id: string
  /** 章节名称 */
  name: string
  /** 章节状态 */
  status: SectionStatus
  /** 需要补充的问题数 */
  requiredQuestions: number
  /** 生成的内容 */
  content: string
  /** 是否已插入 */
  isInserted: boolean
  /** 是否可选 */
  optional?: boolean
  /** 问题列表 */
  questions?: Question[]
  /** 用户回答 */
  answers?: string[]
}

/** 问题信息 */
export interface Question {
  /** 问题ID */
  id: string
  /** 问题内容 */
  content: string
  /** 是否必填 */
  required: boolean
  /** 提示信息 */
  placeholder?: string
}

/** 项目上下文信息 */
export interface ProjectContext {
  /** 项目名称 */
  projectName: string
  /** 被审计单位 */
  auditedUnit: string
  /** 审计类型 */
  auditType: string
  /** 审计事项 */
  auditItem: string
  /** 审计事项描述 */
  auditItemDesc?: string
}

/** AI生成请求参数 */
export interface GenerateRequest {
  /** 章节ID */
  sectionId: string
  /** 项目上下文 */
  context: ProjectContext
  /** 编辑器已有内容 */
  editorContent?: string
  /** 用户回答 */
  answers?: string[]
}

/** AI生成响应 */
export interface GenerateResponse {
  /** 是否成功 */
  success: boolean
  /** 生成的内容 */
  content: string
  /** 错误信息 */
  message?: string
}

/** 草稿数据 */
export interface DraftData {
  /** 项目上下文 */
  context: ProjectContext
  /** 章节列表 */
  sections: Section[]
  /** 保存时间 */
  savedAt: string
}
