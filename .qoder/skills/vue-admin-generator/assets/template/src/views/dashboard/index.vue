<template>
  <div class="empty-page">
    <div class="empty-content">
      <h2 class="page-title">首页</h2>
      <p class="page-subtitle">页面开发中...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.empty-page {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 12px;
}

.empty-content {
  text-align: center;
}

.page-title {
  font-size: 24px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 12px;
}

.page-subtitle {
  font-size: 14px;
  color: #909399;
}
</style>
