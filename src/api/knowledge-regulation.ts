/**
 * 知识中心 - 法规库 API
 * USE_MOCK 开启时走 src/mock/knowledge-regulation.ts，关闭时走真实接口
 */
import request from '@/utils/http'
import type {
  KnowledgeRegulation,
  RegulationListQuery,
  RegulationListResult,
  RegulationLevel,
  EffectStatus
} from '@/types/knowledge-regulation'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/** 获取法规分页列表（多维过滤 + 排序） */
export const getRegulationList = (params: RegulationListQuery) => {
  if (USE_MOCK) {
    return import('@/mock/knowledge-regulation').then((m) => m.getRegulationList(params))
  }
  return request.get<RegulationListResult>({
    url: '/api/knowledge/regulation/list',
    params
  })
}

/** 获取当前过滤条件下可选的年份集合（年份 facet） */
export const getYearFacets = (filters: {
  hierarchy?: 'external' | 'internal'
  level?: RegulationLevel
  status?: EffectStatus
}) => {
  if (USE_MOCK) {
    return import('@/mock/knowledge-regulation').then((m) => m.getYearFacets(filters))
  }
  return request.get<number[]>({
    url: '/api/knowledge/regulation/year-facets',
    params: filters
  })
}

/** 获取法规详情（含全文 url） */
export const getRegulationDetail = (id: string) => {
  if (USE_MOCK) {
    return import('@/mock/knowledge-regulation').then((m) => m.getRegulationDetail(id))
  }
  return request.get<KnowledgeRegulation>({ url: `/api/knowledge/regulation/${id}` })
}
