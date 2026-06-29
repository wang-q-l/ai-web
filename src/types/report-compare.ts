/**
 * 审计统计台账数据比对 - 类型定义
 * 覆盖：基准/上传报表行、比对结果行、比对汇总、比对历史记录
 */

/** 比对单元的四种状态 */
export type CompareStatus =
  | 'consistent' // 一致：双方都存在且指标值完全相同
  | 'diff' // 差异：双方都存在但指标值不同
  | 'missing' // 缺失：系统有、上传无
  | 'extra' // 多余：上传有、系统模板无

/** 审计类型选项 */
export interface AuditTypeOption {
  /** 审计类型编码 */
  value: string
  /** 审计类型名称（如：财政类审计情况报表） */
  label: string
}

/** 报表表头信息区（项目基本信息） */
export interface ReportHeader {
  ledgerNo?: string // 台账编号
  projectName?: string // 项目名称
  projectYear?: string // 项目年度
  auditOrg?: string // 审计机关
  auditedUnit?: string // 被审计单位
  reportType?: string // 报表类型
  detailCategory?: string // 明细分类
  fillUnit?: string // 填报单位
  fillUser?: string // 填报人
  fillDate?: string // 填报日期
  projectEndDate?: string // 项目结束日期
  projectFinishDate?: string // 项目完成日期
  auditDoc?: string // 审计文书
  docNo?: string // 文号
}

/** 报表指标明细行（基准 / 上传通用） */
export interface ReportRow {
  /** 指标名称 */
  indicatorName: string
  /** 指标单位（如：个、元、篇） */
  unit: string
  /** 指标值（保留原始字符串用于严格比对） */
  value: string
  /** 层级深度，0 为顶级，用于缩进展示 */
  level: number
  /** 层级路径 + 名称构成的唯一键，用于跨表匹配 */
  matchKey: string
}

/** 完整报表（表头 + 指标明细） */
export interface ReportData {
  header: ReportHeader
  rows: ReportRow[]
}

/** 比对结果行（一行对应一个匹配键） */
export interface ComparisonRow {
  /** 匹配唯一键（层级路径 + 指标名称） */
  matchKey: string
  /** 指标名称（展示用，取系统或上传任一侧） */
  indicatorName: string
  /** 指标单位 */
  unit: string
  /** 层级深度，用于缩进 */
  level: number
  /** 系统基准值（缺失状态时为 null） */
  baselineValue: string | null
  /** 上传值（多余状态时为 null） */
  uploadedValue: string | null
  /** 比对状态 */
  status: CompareStatus
}

/** 比对汇总统计 */
export interface ComparisonSummary {
  /** 总项数 */
  total: number
  /** 一致数 */
  consistent: number
  /** 差异数 */
  diff: number
  /** 缺失数 */
  missing: number
  /** 多余数 */
  extra: number
  /** 是否完全一致 */
  isAllConsistent: boolean
}

/** 比对结果（汇总 + 明细行） */
export interface ComparisonResult {
  summary: ComparisonSummary
  rows: ComparisonRow[]
}

/** 基准台账记录（列表项 + 完整数据） */
export interface BaselineLedger {
  /** 台账 ID */
  id: number
  /** 台账名称 */
  name: string
  /** 审计类型编码 */
  auditType: string
  /** 报表类型名称（审计类型名称） */
  reportType: string
  /** 项目年度 */
  projectYear: string
  /** 出台人（生成人） */
  creator: string
  /** 出台时间（生成时间） */
  createTime: string
  /** 基准报表数据（表头 + 指标明细） */
  report: ReportData
  /** 比对结果快照（已比对过才有；用于列表显示「比对结果」入口与回看） */
  comparison?: ComparisonResult
  /** 最近一次上传的比对文件名 */
  comparedFileName?: string
}

/** 台账列表查询参数 */
export interface LedgerQuery {
  /** 审计类型筛选 */
  auditType?: string
  /** 名称关键字 */
  name?: string
  /** 项目年度筛选 */
  projectYear?: string
  page: number
  pageSize: number
}

/** 生成基准台账的表单参数 */
export interface GenerateLedgerForm {
  /** 台账名称 */
  name: string
  /** 审计类型编码 */
  auditType: string
  /** 项目年度 */
  projectYear: string
}
