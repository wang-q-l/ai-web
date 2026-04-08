<template>
  <div class="cart-page">
    <van-nav-bar title="购物车" />

    <van-checkbox-group v-model="checkedGoods">
      <van-swipe-cell v-for="item in cartList" :key="item.id">
        <van-card
          :num="item.num"
          :price="item.price"
          :title="item.title"
          :thumb="item.image"
        >
          <template #tags>
            <van-tag plain type="danger">标签</van-tag>
          </template>
          <template #footer>
            <van-stepper v-model="item.num" />
          </template>
        </van-card>
        <template #right>
          <van-button square type="danger" text="删除" class="delete-button" />
        </template>
      </van-swipe-cell>
    </van-checkbox-group>

    <van-submit-bar
      :price="totalPrice"
      button-text="结算"
      @submit="onSubmit"
    >
      <van-checkbox v-model="checkedAll">全选</van-checkbox>
    </van-submit-bar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { showToast } from 'vant'

const checkedGoods = ref<number[]>([])
const checkedAll = ref(false)

const cartList = ref([
  {
    id: 1,
    title: '商品1',
    price: 99.99,
    num: 1,
    image: 'https://via.placeholder.com/80',
  },
  {
    id: 2,
    title: '商品2',
    price: 199.99,
    num: 2,
    image: 'https://via.placeholder.com/80',
  },
])

const totalPrice = computed(() => {
  return cartList.value.reduce((total, item) => {
    return total + item.price * item.num * 100
  }, 0)
})

const onSubmit = () => {
  showToast('结算功能开发中')
}
</script>

<style scoped>
.cart-page {
  background-color: var(--background-color);
  min-height: 100vh;
  padding-bottom: 50px;
}

.delete-button {
  height: 100%;
}
</style>
