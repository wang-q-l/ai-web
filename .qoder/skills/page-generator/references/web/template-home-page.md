# Web 前台首页模版

首页模版包含：Banner 轮播、产品展示、新闻动态、合作伙伴等模块。

## 完整代码示例

```vue
<template>
  <div class="home-page">
    <!-- Banner 区域 -->
    <section class="banner-section">
      <el-carousel height="600px" indicator-position="outside">
        <el-carousel-item v-for="item in banners" :key="item.id">
          <img :src="item.image" :alt="item.title" />
          <div class="banner-content">
            <h1>{{ item.title }}</h1>
            <p>{{ item.description }}</p>
            <el-button type="primary" size="large">了解更多</el-button>
          </div>
        </el-carousel-item>
      </el-carousel>
    </section>

    <!-- 产品展示区 -->
    <section class="products-section">
      <div class="container">
        <h2 class="section-title">我们的产品</h2>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="6" v-for="item in products" :key="item.id">
            <el-card class="product-card" @click="viewProduct(item.id)">
              <img :src="item.image" :alt="item.title" class="product-image" />
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </section>

    <!-- 新闻动态区 -->
    <section class="news-section">
      <div class="container">
        <h2 class="section-title">新闻动态</h2>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="8" v-for="item in news" :key="item.id">
            <el-card class="news-card" @click="viewNews(item.id)">
              <img :src="item.image" :alt="item.title" class="news-image" />
              <div class="news-content">
                <h3>{{ item.title }}</h3>
                <p class="news-date">{{ item.date }}</p>
                <p class="news-desc">{{ item.description }}</p>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const banners = ref([])
const products = ref([])
const news = ref([])

const viewProduct = (id: number) => {
  router.push(`/products/${id}`)
}

const viewNews = (id: number) => {
  router.push(`/news/${id}`)
}

onMounted(() => {
  // 加载数据
})
</script>

<style scoped lang="scss">
.home-page {
  min-height: 100vh;
}

.banner-section {
  width: 100%;

  .banner-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: #fff;

    h1 {
      font-size: 48px;
      margin-bottom: 16px;
    }

    p {
      font-size: 20px;
      margin-bottom: 32px;
    }
  }
}

.products-section,
.news-section {
  padding: 64px 0;
}

.products-section {
  background: #f5f7fa;
}

.section-title {
  text-align: center;
  font-size: 32px;
  margin-bottom: 48px;
}

.product-card,
.news-card {
  border: none !important;
  box-shadow: none !important;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
  }
}

.product-image,
.news-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}
</style>
```
