<template>
  <div class="category-page">
    <van-nav-bar title="分类" />

    <div class="category-content">
      <van-sidebar v-model="active">
        <van-sidebar-item v-for="item in categories" :key="item.id" :title="item.name" />
      </van-sidebar>

      <div class="category-detail">
        <van-grid :column-num="3" :border="false">
          <van-grid-item
            v-for="i in 9"
            :key="i"
            icon="shop-o"
            :text="`商品${i}`"
          />
        </van-grid>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const active = ref(0)

const categories = ref([
  { id: 1, name: '分类1' },
  { id: 2, name: '分类2' },
  { id: 3, name: '分类3' },
  { id: 4, name: '分类4' },
  { id: 5, name: '分类5' },
])
</script>

<style scoped>
.category-page {
  background-color: var(--background-color);
  min-height: 100vh;
}

.category-content {
  display: flex;
  height: calc(100vh - 46px - 50px);
}

.category-detail {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}
</style>
