<template>
  <div class="products-page page-content">
    <div class="container">
      <h1>产品中心</h1>
      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="8" v-for="product in products" :key="product.id">
          <el-card class="product-card" shadow="hover">
            <img :src="product.image" :alt="product.name" />
            <h3>{{ product.name }}</h3>
            <p>{{ product.description }}</p>
            <el-button type="primary" text>了解更多</el-button>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const products = ref([
  {
    id: 1,
    name: '产品 A',
    description: '这是产品 A 的简介',
    image: 'https://via.placeholder.com/300x200'
  },
  {
    id: 2,
    name: '产品 B',
    description: '这是产品 B 的简介',
    image: 'https://via.placeholder.com/300x200'
  },
  {
    id: 3,
    name: '产品 C',
    description: '这是产品 C 的简介',
    image: 'https://via.placeholder.com/300x200'
  }
])
</script>

<style scoped>
h1 {
  margin-bottom: var(--spacing-xl);
}

.product-card {
  margin-bottom: var(--spacing-lg);
}

.product-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  margin-bottom: var(--spacing-md);
}

.product-card h3 {
  margin-bottom: var(--spacing-sm);
}

.product-card p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}
</style>
