<template>
  <div class="solutions-page page-content">
    <div class="container">
      <h1>解决方案</h1>
      <el-timeline>
        <el-timeline-item
          v-for="solution in solutions"
          :key="solution.id"
          :timestamp="solution.category"
          placement="top"
        >
          <el-card>
            <h3>{{ solution.title }}</h3>
            <p>{{ solution.description }}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const solutions = ref([
  {
    id: 1,
    category: '企业级',
    title: '企业数字化转型解决方案',
    description: '帮助企业实现全面数字化转型，提升运营效率'
  },
  {
    id: 2,
    category: '行业解决方案',
    title: '智能制造解决方案',
    description: '为制造业提供智能化生产管理系统'
  },
  {
    id: 3,
    category: '技术方案',
    title: '云原生架构解决方案',
    description: '基于云原生技术构建现代化应用架构'
  }
])
</script>

<style scoped>
h1 {
  margin-bottom: var(--spacing-xl);
}

h3 {
  margin-bottom: var(--spacing-sm);
}

p {
  color: var(--text-secondary);
}
</style>
