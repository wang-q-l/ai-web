<template>
  <div class="home-page">
    <van-nav-bar title="首页" />

    <!-- 轮播图 -->
    <van-swipe class="banner" :autoplay="3000" indicator-color="white">
      <van-swipe-item v-for="i in 3" :key="i">
        <div class="banner-item" :style="{ backgroundColor: colors[i - 1] }">
          轮播图 {{ i }}
        </div>
      </van-swipe-item>
    </van-swipe>

    <!-- 分类入口 -->
    <van-grid :column-num="4" :border="false">
      <van-grid-item icon="shop-o" text="分类1" />
      <van-grid-item icon="gift-o" text="分类2" />
      <van-grid-item icon="coupon-o" text="分类3" />
      <van-grid-item icon="star-o" text="分类4" />
    </van-grid>

    <!-- 商品列表 -->
    <div class="product-list">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <van-cell v-for="item in list" :key="item.id" :title="item.title" :label="item.desc">
            <template #icon>
              <van-image
                width="80"
                height="80"
                :src="item.image"
                style="margin-right: 10px"
              />
            </template>
            <template #value>
              <div class="price">¥{{ item.price }}</div>
            </template>
          </van-cell>
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const colors = ['#1989fa', '#07c160', '#ff976a']

const list = ref<any[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)

const onLoad = () => {
  loading.value = true
  setTimeout(() => {
    for (let i = 0; i < 10; i++) {
      list.value.push({
        id: list.value.length + 1,
        title: `商品 ${list.value.length + 1}`,
        desc: '商品描述信息',
        price: (Math.random() * 100 + 10).toFixed(2),
        image: `https://via.placeholder.com/80`,
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
</script>

<style scoped>
.home-page {
  background-color: var(--background-color);
  min-height: 100vh;
}

.banner {
  height: 200px;
}

.banner-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #fff;
  font-size: 20px;
}

.product-list {
  margin-top: 10px;
}

.price {
  color: var(--danger-color);
  font-size: 16px;
  font-weight: bold;
}
</style>
