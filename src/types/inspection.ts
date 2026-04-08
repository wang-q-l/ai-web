/**
 * 检查问题台账类型定义
 */

/** 严重程度：1-重大 2-较大 3-一般 */
export type SeverityLevel = 1 | 2 | 3

/** 整改状态：1-整改中 2-已完成整改 3-整改超时 */
export type RectifyStatus = 1 | 2 | 3

/** 时间范围类型 */
export type TimeRangeType = 'all' | 'month' | 'quarter' | 'year' | 'custom'

/** 检查问题记录 */
export interface InspectionIssue {
  id: number
  /** 问题描述 */
  description: string
  /** 所属单位（库站名称） */
  stationName: string
  /** 所属单位完整路径 */
  stationPath: string
  /** 严重程度 */
  severity: SeverityLevel
  /** 问题发生频次描述 */
  frequency: string
  /** 发生时间 */
  occurTime: string
  /** 要求整改时间（发现时间+7天） */
  rectifyDeadline: string
  /** 整改状态 */
  rectifyStatus: RectifyStatus
  /** 来源系统 */
  sourceSystem: string
  /** 问题图像URL */
  imageUrl?: string
}

/** 查询参数 */
export interface InspectionQueryParams {
  /** 时间范围类型 */
  timeRangeType: TimeRangeType
  /** 按月查询：年月，格式 YYYY-MM */
  queryMonth?: string
  /** 按季度查询：年份 */
  queryYear?: number
  /** 按季度查询：季度 1-4 */
  queryQuarter?: number
  /** 按年查询：年份 */
  queryYearOnly?: number
  /** 自定义区间：开始日期 */
  startDate?: string
  /** 自定义区间：结束日期 */
  endDate?: string
  /** 所属单位关键词 */
  stationName?: string
  /** 严重程度 */
  severity?: SeverityLevel | null
  /** 整改状态 */
  rectifyStatus?: RectifyStatus | null
  page: number
  pageSize: number
}
