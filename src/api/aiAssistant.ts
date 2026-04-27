import request from '@/utils/http'
import type { GenerateRequest, GenerateResponse, ProjectContext } from '@/types/ai-assistant'
import { generateSectionMock, generateAllSectionsMock } from '@/mock/aiAssistant'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/**
 * 生成单个章节内容
 */
export function generateSection(data: GenerateRequest) {
  if (USE_MOCK) {
    return generateSectionMock(data)
  }

  return request.post<GenerateResponse>({
    url: '/ai/generate-section',
    data
  })
}

/**
 * 批量生成所有章节
 */
export function generateAllSections(context: ProjectContext, mode: 'quick' | 'complete') {
  if (USE_MOCK) {
    return generateAllSectionsMock(context, mode)
  }

  return request.post<Record<string, string>>({
    url: '/ai/generate-all-sections',
    data: { context, mode }
  })
}

/**
 * 保存草稿
 */
export function saveDraft(data: any) {
  if (USE_MOCK) {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        localStorage.setItem('ai-assistant-draft', JSON.stringify(data))
        resolve({
          success: true,
          message: '草稿已保存'
        })
      }, 300)
    })
  }

  return request.post({
    url: '/ai/save-draft',
    data
  })
}

/**
 * 加载草稿
 */
export function loadDraft() {
  if (USE_MOCK) {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        const draft = localStorage.getItem('ai-assistant-draft')
        resolve({
          success: true,
          data: draft ? JSON.parse(draft) : null
        })
      }, 300)
    })
  }

  return request.get({
    url: '/ai/load-draft'
  })
}
