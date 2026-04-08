<template>
  <div class="orders-page page-content">
    <div class="container">
      <h1>订单管理</h1>
      <el-table :data="orders" style="width: 100%">
        <el-table-column prop="id" label="订单号" width="180" />
        <el-table-column prop="product" label="产品名称" />
        <el-table-column prop="amount" label="金额" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="下单时间" />
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button type="primary" text @click="viewOrder(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const orders = ref([
  {
    id: 'ORD20260220001',
    product: '产品 A',
    amount: '¥1,999',
    status: '已完成',
    date: '2026-02-15'
  },
  {
    id: 'ORD20260220002',
    product: '产品 B',
    amount: '¥2,999',
    status: '进行中',
    date: '2026-02-18'
  },
  {
    id: 'ORD20260220003',
    product: '产品 C',
    amount: '¥3,999',
    status: '待支付',
    date: '2026-02-20'
  }
])

const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    '已完成': 'success',
    '进行中': 'warning',
    '待支付': 'info'
  }
  return typeMap[status] || 'info'
}

const viewOrder = (order: any) => {
  ElMessage.info(`查看订单：${order.id}`)
}
</script>

<style scoped>
h1 {
  margin-bottom: var(--spacing-xl);
}
</style>
