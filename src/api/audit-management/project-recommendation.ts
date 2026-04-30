import request from '@/utils/http'
import type {
  RecommendationItem,
  RecommendationParams,
  ChatRequest,
  ChatResponse
} from '@/types/audit-management/project-recommendation'
import { getRecommendationListMock, chatMock } from '@/mock/audit-management/project-recommendation'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/**
 * 获取推荐列表
 */
export function getRecommendationList(params: RecommendationParams) {
  if (USE_MOCK) {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        const data = getRecommendationListMock(params)
        resolve({
          code: 200,
          message: 'success',
          data
        })
      }, 300)
    })
  }

  return request.get<{
    list: RecommendationItem[]
    total: number
  }>({
    url: '/admin/audit/recommendation/list',
    params
  })
}

/**
 * AI对话接口
 */
export function chat(data: ChatRequest) {
  if (USE_MOCK) {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        const result = chatMock(data)
        resolve({
          code: 200,
          message: 'success',
          data: result
        })
      }, 800)
    })
  }

  return request.post<ChatResponse>({
    url: '/admin/audit/recommendation/chat',
    data
  })
}
