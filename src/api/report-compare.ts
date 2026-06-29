/**
 * 审计统计台账数据比对 API 接口
 * 提供：审计类型选项、基准台账列表增删查、台账详情、执行比对、模板指标
 */
import request from '@/utils/http'
import type {
  AuditTypeOption,
  ReportData,
  ReportRow,
  ComparisonResult,
  BaselineLedger,
  LedgerQuery,
  GenerateLedgerForm
} from '@/types/report-compare'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/** 获取审计类型选项 */
export const getAuditTypeOptions = () => {
  if (USE_MOCK) {
    return import('@/mock/report-compare').then((m) => m.getAuditTypeOptions())
  }
  return request.get<AuditTypeOption[]>({ url: '/api/audit-decision/report-compare/audit-types' })
}

/** 获取基准台账列表（筛选 + 分页） */
export const getLedgerList = (query: LedgerQuery) => {
  if (USE_MOCK) {
    return import('@/mock/report-compare').then((m) => m.getLedgerList(query))
  }
  return request.get<{ list: BaselineLedger[]; total: number }>({
    url: '/api/audit-decision/report-compare/ledger',
    params: query
  })
}

/** 生成基准台账（同审计类型+年度可多次生成） */
export const generateLedger = (form: GenerateLedgerForm) => {
  if (USE_MOCK) {
    return import('@/mock/report-compare').then((m) => m.generateLedger(form))
  }
  return request.post<BaselineLedger>({
    url: '/api/audit-decision/report-compare/ledger',
    data: form
  })
}

/** 获取台账详情（含完整基准报表） */
export const getLedgerDetail = (id: number) => {
  if (USE_MOCK) {
    return import('@/mock/report-compare').then((m) => m.getLedgerDetail(id))
  }
  return request.get<BaselineLedger>({
    url: `/api/audit-decision/report-compare/ledger/${id}`
  })
}

/** 删除基准台账 */
export const deleteLedger = (id: number) => {
  if (USE_MOCK) {
    return import('@/mock/report-compare').then((m) => m.deleteLedger(id))
  }
  return request.del({ url: `/api/audit-decision/report-compare/ledger/${id}` })
}

/** 执行比对（台账 ID + 上传数据 + 文件名，返回比对结果并回存台账） */
export const executeComparison = (params: {
  ledgerId: number
  uploaded: ReportData
  fileName?: string
}) => {
  if (USE_MOCK) {
    return import('@/mock/report-compare').then((m) => m.executeComparison(params))
  }
  return request.post<ComparisonResult>({
    url: '/api/audit-decision/report-compare/compare',
    data: params
  })
}

/** 获取标准模板指标项（供导出空白模板使用） */
export const getTemplateIndicators = (auditType: string) => {
  if (USE_MOCK) {
    return import('@/mock/report-compare').then((m) => m.getTemplateIndicators(auditType))
  }
  return request.get<ReportRow[]>({
    url: '/api/audit-decision/report-compare/template',
    params: { auditType }
  })
}
