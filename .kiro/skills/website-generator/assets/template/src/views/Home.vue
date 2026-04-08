<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="container">
        <h1>欢迎来到 Vue3 Website</h1>
        <p>基于 Vue3 + Element Plus 的现代化企业官网解决方案</p>
        <div class="hero-actions">
          <el-button type="primary" size="large" @click="router.push('/products')">
            了解产品
          </el-button>
          <el-button size="large" @click="router.push('/contact')">
            联系我们
          </el-button>
        </div>
      </div>
    </section>

    <section class="features-section">
      <div class="container">
        <h2>核心特性</h2>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="8" v-for="feature in features" :key="feature.id">
            <el-card class="feature-card" shadow="hover">
              <el-icon :size="48" :color="feature.color">
                <component :is="feature.icon" />
              </el-icon>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const features = [
  {
    id: 1,
    icon: 'Lightning',
    title: '快速开发',
    description: '基于 Vue3 和 Vite，提供极速的开发体验',
    color: '#409eff'
  },
  {
    id: 2,
    icon: 'Grid',
    title: '组件丰富',
    description: 'Element Plus 提供丰富的 UI 组件库',
    color: '#67c23a'
  },
  {
    id: 3,
    icon: 'Setting',
    title: '灵活配置',
    description: '模块化设计，易于定制和扩展',
    color: '#e6a23c'
  }
]
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 120px 0;
  text-align: center;
}

.hero-section h1 {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
}

.hero-section p {
  font-size: 20px;
  margin-bottom: var(--spacing-xl);
}

.hero-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}

.features-section {
  padding: 80px 0;
}

.features-section h2 {
  text-align: center;
  font-size: 36px;
  margin-bottom: var(--spacing-xl);
}

.feature-card {
  text-align: center;
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.feature-card h3 {
  margin: var(--spacing-md) 0;
}

.feature-card p {
  color: var(--text-secondary);
}
</style>
