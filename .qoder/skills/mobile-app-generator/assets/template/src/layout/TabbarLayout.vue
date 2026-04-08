<template>
  <div class="tabbar-layout">
    <div class="content">
      <router-view v-slot="{ Component, route }">
        <transition :name="route.meta.transition || 'slide-left'" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </div>
    <van-tabbar v-model="active" v-if="showTabbar" :fixed="true" :placeholder="true">
      <van-tabbar-item
        v-for="item in tabbarRoutes"
        :key="item.path"
        :icon="item.meta.icon"
        :badge="item.meta.badge"
        :to="item.path"
      >
        {{ item.meta.title }}
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 当前激活的 tabbar 索引
const active = ref(0)

// 获取所有 tabbar 路由
const tabbarRoutes = computed(() => {
  const parentRoute = router.getRoutes().find(r => r.path === '/')
  if (!parentRoute || !parentRoute.children) return []
  return parentRoute.children.filter(r => r.meta?.tabbar)
})

// 是否显示 tabbar
const showTabbar = computed(() => {
  return route.meta.tabbar === true
})

// 监听路由变化，更新 active 索引
watch(
  () => route.path,
  (newPath) => {
    const index = tabbarRoutes.value.findIndex(r => `/${r.path}` === newPath)
    if (index !== -1) {
      active.value = index
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.tabbar-layout {
  min-height: 100vh;
  background-color: var(--background-color);
}

.content {
  padding-bottom: 50px;
}

/* 路由过渡动画 */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
