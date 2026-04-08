<template>
  <div class="search-page">
    <van-search
      v-model="keyword"
      show-action
      placeholder="请输入搜索关键词"
      @search="onSearch"
      @cancel="onCancel"
    />

    <div v-if="!keyword && history.length > 0" class="search-history">
      <div class="history-header">
        <span>搜索历史</span>
        <van-icon name="delete-o" @click="clearHistory" />
      </div>
      <van-tag
        v-for="item in history"
        :key="item"
        plain
        size="large"
        style="margin: 5px"
        @click="keyword = item"
      >
        {{ item }}
      </van-tag>
    </div>

    <van-list
      v-if="keyword"
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <van-cell
        v-for="item in list"
        :key="item.id"
        :title="item.title"
        :label="item.desc"
        is-link
      />
    </van-list>

    <van-empty v-if="keyword && !loading && list.length === 0" description="暂无搜索结果" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()

const keyword = ref('')
const history = ref(['关键词1', '关键词2', '关键词3'])
const list = ref<any[]>([])
const loading = ref(false)
const finished = ref(false)

const onSearch = () => {
  if (!keyword.value) {
    showToast('请输入搜索关键词')
    return
  }
  // 添加到搜索历史
  if (!history.value.includes(keyword.value)) {
    history.value.unshift(keyword.value)
    if (history.value.length > 10) {
      history.value.pop()
    }
  }
  // 重置列表
  list.value = []
  finished.value = false
  onLoad()
}

const onLoad = () => {
  loading.value = true
  // 模拟 API 请求
  setTimeout(() => {
    for (let i = 0; i < 10; i++) {
      list.value.push({
        id: list.value.length + 1,
        title: `搜索结果 ${list.value.length + 1}`,
        desc: `包含关键词: ${keyword.value}`,
      })
    }
    loading.value = false
    finished.value = true
  }, 1000)
}

const clearHistory = () => {
  history.value = []
  showToast('已清空搜索历史')
}

const onCancel = () => {
  router.back()
}
</script>

<style scoped>
.search-page {
  background-color: var(--background-color);
  min-height: 100vh;
}

.search-history {
  padding: 20px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  color: var(--text-color);
}
</style>
