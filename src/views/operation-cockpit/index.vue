<template>
  <div class="operation-cockpit-page">
    <div class="top-banner">
      <img :src="topBannerImg" alt="作业驾驶舱" />
    </div>
    <el-card>
      <div class="cockpit-content">
        <h2>作业驾驶舱</h2>
        <p>页面内容开发中...</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import topBannerImg from '@imgs/jsc/top_bj.png'

  defineOptions({
    name: 'OperationCockpit'
  })
</script>

<style scoped lang="scss">
  .operation-cockpit-page {
    width: 100%;
    height: 100vh;
    padding: 0;
    background: #08082a;

    .top-banner {
      width: 100%;
      display: flex;
      justify-content: center;

      img {
        width: 90%;
        height: auto;
        display: block;
      }
    }

    :deep(.el-card) {
      height: 100%;
      border: none !important;
      box-shadow: none !important;
      border-radius: 12px;
      background: #08082a;
    }

    :deep(.el-card__body) {
      height: 100%;
    }

    .cockpit-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #fff;

      h2 {
        margin-bottom: 20px;
        font-size: 24px;
      }
    }
  }
</style>
