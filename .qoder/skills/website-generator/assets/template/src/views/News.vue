<template>
  <div class="news-page page-content">
    <div class="container">
      <h1>新闻动态</h1>
      <el-row :gutter="24">
        <el-col :xs="24" :md="16">
          <el-card v-for="news in newsList" :key="news.id" class="news-card" shadow="hover">
            <div class="news-header">
              <h3>{{ news.title }}</h3>
              <span class="news-date">{{ news.date }}</span>
            </div>
            <p>{{ news.summary }}</p>
            <el-button type="primary" text>阅读全文</el-button>
          </el-card>
        </el-col>
        <el-col :xs="24" :md="8">
          <el-card class="sidebar">
            <h4>热门文章</h4>
            <ul>
              <li v-for="item in hotNews" :key="item.id">
                <a href="#">{{ item.title }}</a>
              </li>
            </ul>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const newsList = ref([
  {
    id: 1,
    title: '公司发布新产品',
    summary: '我们很高兴地宣布推出全新的产品系列...',
    date: '2026-02-15'
  },
  {
    id: 2,
    title: '参加行业展会',
    summary: '公司将参加即将举行的行业展会...',
    date: '2026-02-10'
  }
])

const hotNews = ref([
  { id: 1, title: '2026年度战略规划' },
  { id: 2, title: '技术创新成果展示' },
  { id: 3, title: '客户成功案例分享' }
])
</script>

<style scoped>
h1 {
  margin-bottom: var(--spacing-xl);
}

.news-card {
  margin-bottom: var(--spacing-lg);
}

.news-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.news-date {
  color: var(--text-secondary);
  font-size: 14px;
}

.news-card p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

.sidebar h4 {
  margin-bottom: var(--spacing-md);
}

.sidebar ul {
  list-style: none;
}

.sidebar li {
  margin-bottom: var(--spacing-sm);
}

.sidebar a {
  color: var(--text-regular);
}
</style>
