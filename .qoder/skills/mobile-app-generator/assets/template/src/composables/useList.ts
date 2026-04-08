import { ref } from 'vue'

interface UseListOptions {
  fetchApi?: string
  pageSize?: number
}

export function useList(options: UseListOptions = {}) {
  const { pageSize = 10 } = options

  const list = ref<any[]>([])
  const loading = ref(false)
  const finished = ref(false)
  const refreshing = ref(false)
  const page = ref(1)

  const onLoad = async () => {
    loading.value = true
    try {
      // 模拟 API 请求
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 模拟数据
      const newData = Array.from({ length: pageSize }, (_, i) => ({
        id: list.value.length + i + 1,
        title: `项目 ${list.value.length + i + 1}`,
        desc: '这是描述信息',
      }))

      list.value.push(...newData)
      page.value++

      // 模拟没有更多数据
      if (page.value > 3) {
        finished.value = true
      }
    } catch (error) {
      console.error('加载失败:', error)
    } finally {
      loading.value = false
    }
  }

  const onRefresh = async () => {
    list.value = []
    page.value = 1
    finished.value = false
    await onLoad()
    refreshing.value = false
  }

  return {
    list,
    loading,
    finished,
    refreshing,
    page,
    onLoad,
    onRefresh,
  }
}
