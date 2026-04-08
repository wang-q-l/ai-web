<template>
  <div class="detail-page">
    <van-nav-bar :title="title" left-arrow @click-left="onBack" />

    <van-image width="100%" height="300" :src="detail.image" />

    <van-cell-group inset style="margin-top: 10px">
      <van-cell title="标题" :value="detail.title" />
      <van-cell title="价格" :value="`¥${detail.price}`" />
      <van-cell title="库存" :value="detail.stock" />
      <van-cell title="描述" :label="detail.desc" />
    </van-cell-group>

    <van-goods-action>
      <van-goods-action-icon icon="chat-o" text="客服" />
      <van-goods-action-icon icon="cart-o" text="购物车" />
      <van-goods-action-icon icon="star-o" text="收藏" />
      <van-goods-action-button type="warning" text="加入购物车" @click="onAddCart" />
      <van-goods-action-button type="danger" text="立即购买" @click="onBuy" />
    </van-goods-action>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

interface Props {
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '详情页',
})

const router = useRouter()

const detail = ref({
  image: 'https://via.placeholder.com/300',
  title: '商品名称',
  price: '99.99',
  stock: '100',
  desc: '这是商品的详细描述信息，可以包含多行文字。',
})

const onAddCart = () => {
  showToast('已加入购物车')
}

const onBuy = () => {
  showToast('立即购买功能开发中')
}

const onBack = () => {
  router.back()
}
</script>

<style scoped>
.detail-page {
  background-color: var(--background-color);
  min-height: 100vh;
  padding-bottom: 50px;
}
</style>
