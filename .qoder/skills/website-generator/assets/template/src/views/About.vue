<template>
  <div class="about-page page-content">
    <div class="container">
      <h1>关于我们</h1>
      <el-card class="about-card">
        <h2>公司简介</h2>
        <p>
          我们是一家专注于技术创新的科技公司，致力于为客户提供优质的产品和服务。
          公司成立以来，始终坚持以客户为中心，以技术为驱动，不断创新发展。
        </p>
      </el-card>

      <el-card class="about-card">
        <h2>企业文化</h2>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="6" v-for="value in values" :key="value.id">
            <div class="value-item">
              <el-icon :size="40" color="#409eff">
                <component :is="value.icon" />
              </el-icon>
              <h3>{{ value.title }}</h3>
              <p>{{ value.description }}</p>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <el-card class="about-card">
        <h2>发展历程</h2>
        <el-timeline>
          <el-timeline-item
            v-for="milestone in milestones"
            :key="milestone.id"
            :timestamp="milestone.year"
          >
            {{ milestone.event }}
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const values = ref([
  {
    id: 1,
    icon: 'Star',
    title: '创新',
    description: '持续创新，引领行业发展'
  },
  {
    id: 2,
    icon: 'Trophy',
    title: '卓越',
    description: '追求卓越，精益求精'
  },
  {
    id: 3,
    icon: 'User',
    title: '客户至上',
    description: '以客户需求为导向'
  },
  {
    id: 4,
    icon: 'Connection',
    title: '合作共赢',
    description: '携手合作，共创未来'
  }
])

const milestones = ref([
  { id: 1, year: '2020', event: '公司成立' },
  { id: 2, year: '2022', event: '推出首款产品' },
  { id: 3, year: '2024', event: '业务拓展至全国' },
  { id: 4, year: '2026', event: '成为行业领先企业' }
])
</script>

<style scoped>
h1 {
  margin-bottom: var(--spacing-xl);
}

.about-card {
  margin-bottom: var(--spacing-xl);
}

.about-card h2 {
  margin-bottom: var(--spacing-lg);
  color: var(--primary-color);
}

.about-card p {
  line-height: 1.8;
  color: var(--text-regular);
}

.value-item {
  text-align: center;
  padding: var(--spacing-lg);
}

.value-item h3 {
  margin: var(--spacing-md) 0;
}

.value-item p {
  color: var(--text-secondary);
  font-size: 14px;
}
</style>
