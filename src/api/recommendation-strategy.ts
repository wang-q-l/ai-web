/**
 * 法规推荐策略 API
 * USE_MOCK 开启时走 src/mock/recommendation-strategy.ts，关闭时走真实接口
 */
import request from '@/utils/http'
import type {
  StrategyConfig,
  DomainOverride,
  LevelBaseScore,
  SynonymGroup,
  ExperimentRequest,
  ExperimentResultItem
} from '@/types/recommendation-strategy'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// ==================== 全局策略 ====================

/** 获取全局推荐策略 */
export const getGlobalStrategy = () => {
  if (USE_MOCK) {
    return import('@/mock/recommendation-strategy').then((m) => m.getGlobalStrategy())
  }
  return request.get<StrategyConfig>({ url: '/api/recommendation-strategy/global' })
}

/** 更新全局推荐策略（提交前已做归一化） */
export const updateGlobalStrategy = (data: StrategyConfig) => {
  if (USE_MOCK) {
    return import('@/mock/recommendation-strategy').then((m) => m.updateGlobalStrategy(data))
  }
  return request.put<StrategyConfig>({ url: '/api/recommendation-strategy/global', data })
}

// ==================== 法规层级基准分 ====================

/** 获取法规层级基准分 */
export const getLevelBaseScore = () => {
  if (USE_MOCK) {
    return import('@/mock/recommendation-strategy').then((m) => m.getLevelBaseScore())
  }
  return request.get<LevelBaseScore>({ url: '/api/recommendation-strategy/level-base-score' })
}

/** 更新法规层级基准分 */
export const updateLevelBaseScore = (data: LevelBaseScore) => {
  if (USE_MOCK) {
    return import('@/mock/recommendation-strategy').then((m) => m.updateLevelBaseScore(data))
  }
  return request.put<LevelBaseScore>({
    url: '/api/recommendation-strategy/level-base-score',
    data
  })
}

// ==================== 领域覆盖策略 ====================

/** 领域覆盖策略列表 */
export const getDomainOverrideList = () => {
  if (USE_MOCK) {
    return import('@/mock/recommendation-strategy').then((m) => m.getDomainOverrideList())
  }
  return request.get<DomainOverride[]>({ url: '/api/recommendation-strategy/domain-overrides' })
}

/** 新增领域覆盖策略 */
export const addDomainOverride = (data: Omit<DomainOverride, 'id' | 'updatedAt'>) => {
  if (USE_MOCK) {
    return import('@/mock/recommendation-strategy').then((m) => m.addDomainOverride(data))
  }
  return request.post<DomainOverride>({
    url: '/api/recommendation-strategy/domain-overrides',
    data
  })
}

/** 更新领域覆盖策略 */
export const updateDomainOverride = (data: DomainOverride) => {
  if (USE_MOCK) {
    return import('@/mock/recommendation-strategy').then((m) => m.updateDomainOverride(data))
  }
  return request.put<DomainOverride>({
    url: '/api/recommendation-strategy/domain-overrides',
    data
  })
}

/** 删除领域覆盖策略 */
export const deleteDomainOverride = (id: number) => {
  if (USE_MOCK) {
    return import('@/mock/recommendation-strategy').then((m) => m.deleteDomainOverride(id))
  }
  return request.del({ url: `/api/recommendation-strategy/domain-overrides/${id}` })
}

/** 启停领域覆盖策略 */
export const toggleDomainOverride = (id: number, enabled: boolean) => {
  if (USE_MOCK) {
    return import('@/mock/recommendation-strategy').then((m) => m.toggleDomainOverride(id, enabled))
  }
  return request.put({
    url: `/api/recommendation-strategy/domain-overrides/${id}/toggle`,
    data: { enabled }
  })
}

// ==================== 同义词表 ====================

/** 同义词列表（支持按关键字 / 领域筛选） */
export const getSynonymList = (params: { keyword?: string; domain?: string }) => {
  if (USE_MOCK) {
    return import('@/mock/recommendation-strategy').then((m) => m.getSynonymList(params))
  }
  return request.get<SynonymGroup[]>({
    url: '/api/recommendation-strategy/synonyms',
    params
  })
}

/** 新增同义词组 */
export const addSynonym = (data: Omit<SynonymGroup, 'id' | 'updatedAt'>) => {
  if (USE_MOCK) {
    return import('@/mock/recommendation-strategy').then((m) => m.addSynonym(data))
  }
  return request.post<SynonymGroup>({ url: '/api/recommendation-strategy/synonyms', data })
}

/** 更新同义词组 */
export const updateSynonym = (data: SynonymGroup) => {
  if (USE_MOCK) {
    return import('@/mock/recommendation-strategy').then((m) => m.updateSynonym(data))
  }
  return request.put<SynonymGroup>({ url: '/api/recommendation-strategy/synonyms', data })
}

/** 删除同义词组 */
export const deleteSynonym = (id: number) => {
  if (USE_MOCK) {
    return import('@/mock/recommendation-strategy').then((m) => m.deleteSynonym(id))
  }
  return request.del({ url: `/api/recommendation-strategy/synonyms/${id}` })
}

// ==================== 推荐试验台 ====================

/** 推荐试验台 - 用当前内存策略试推荐，便于即调即验 */
export const runExperiment = (data: ExperimentRequest) => {
  if (USE_MOCK) {
    return import('@/mock/recommendation-strategy').then((m) => m.runExperiment(data))
  }
  return request.post<ExperimentResultItem[]>({
    url: '/api/recommendation-strategy/experiment',
    data
  })
}
