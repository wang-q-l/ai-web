<template>
  <div class="list-page">
    <van-nav-bar :title="title" :left-arrow="showBack" @click-left="onBack" />

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
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
          @click="onItemClick(item)"
        />
      </van-list>
    </van-pull-refresh>

    <van-empty v-if="!loading && list.length === 0" description="暂无数据" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  title?: string
  showBack?: boolean
  fetchApi?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '列表页',
  showBack: false,
})

const router = useRouter()

const list = ref<any[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)

const onLoad = () => {
  loading.value = true
  // 模拟 API 请求
  setTimeout(() => {
    for (let i = 0; i < 10; i++) {
      list.value.push({
        id: list.value.length + 1,
        title: `项目 ${list.value.length + 1}`,
        desc: '这是描述信息',
      })
    }
    loading.value = false
    page.value++
    if (page.value > 3) {
      finished.value = true
    }
  }, 1000)
}

const onRefresh = () => {
  list.value = []
  page.value = 1
  finished.value = false
  loading.value = true
  onLoad()
  refreshing.value = false
}

const onItemClick = (item: any) => {
  console.log('点击了项目:', item)
}

const onBack = () => {
  router.back()
}
</script>

<style scoped>
.list-page {
  background-color: var(--background-color);
  min-height: 100vh;
}
</style>
