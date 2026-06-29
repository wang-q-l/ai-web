/**
 * 典型问题库 API
 * USE_MOCK 开启时走 src/mock/typical-problem.ts，关闭时走真实接口
 */
import request from '@/utils/http'
import type {
  ProblemCategoryNode,
  TypicalProblemQuery,
  TypicalProblemResult
} from '@/types/typical-problem'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/** 获取问题分类树（含每节点问题总数） */
export const getProblemCategoryTree = () => {
  if (USE_MOCK) {
    return import('@/mock/typical-problem').then((m) => m.getProblemCategoryTree())
  }
  return request.get<ProblemCategoryNode[]>({ url: '/api/typical-problem/category/tree' })
}

/** 典型问题分页列表（支持分类 / 关键词 / 收藏筛选） */
export const getTypicalProblemList = (params: TypicalProblemQuery) => {
  if (USE_MOCK) {
    return import('@/mock/typical-problem').then((m) => m.getTypicalProblemList(params))
  }
  return request.get<TypicalProblemResult>({ url: '/api/typical-problem/list', params })
}

/** 切换某条典型问题的收藏状态 */
export const toggleProblemFavorite = (id: string) => {
  if (USE_MOCK) {
    return import('@/mock/typical-problem').then((m) => m.toggleProblemFavorite(id))
  }
  return request.post<{ id: string; favorited: boolean }>({
    url: `/api/typical-problem/${id}/favorite`
  })
}
