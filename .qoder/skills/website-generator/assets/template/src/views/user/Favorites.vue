<template>
  <div class="favorites-page page-content">
    <div class="container">
      <h1>我的收藏</h1>
      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="8" v-for="item in favorites" :key="item.id">
          <el-card class="favorite-card" shadow="hover">
            <img :src="item.image" :alt="item.title" />
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
            <div class="card-actions">
              <el-button type="primary" text>查看详情</el-button>
              <el-button type="danger" text @click="removeFavorite(item.id)">
                取消收藏
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-empty v-if="favorites.length === 0" description="暂无收藏" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const favorites = ref([
  {
    id: 1,
    title: '产品 A',
    description: '这是一个很棒的产品',
    image: 'https://via.placeholder.com/300x200'
  },
  {
    id: 2,
    title: '产品 B',
    description: '这是另一个很棒的产品',
    image: 'https://via.placeholder.com/300x200'
  }
])

const removeFavorite = (id: number) => {
  favorites.value = favorites.value.filter(item => item.id !== id)
  ElMessage.success('已取消收藏')
}
</script>

<style scoped>
h1 {
  margin-bottom: var(--spacing-xl);
}

.favorite-card {
  margin-bottom: var(--spacing-lg);
}

.favorite-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  margin-bottom: var(--spacing-md);
}

.favorite-card h3 {
  margin-bottom: var(--spacing-sm);
}

.favorite-card p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

.card-actions {
  display: flex;
  justify-content: space-between;
}
</style>
