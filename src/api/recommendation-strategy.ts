/**
 * 法规推荐策略 API（简化版）
 * USE_MOCK 开启时走 src/mock/recommendation-strategy.ts，关闭时走真实接口
 */
import request from '@/utils/http'
import type {
  StrategyConfig,
  ExperimentRequest,
  ExperimentResultItem
} from '@/types/recommendation-strategy'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

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
