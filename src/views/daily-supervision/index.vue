<template>
  <!-- 流程说明页：展示大监督风险疑点闭环管理系统业务流程图 -->
  <div class="daily-supervision-page">
    <!-- 标题区 -->
    <div class="page-header">
      <h2 class="page-title">大监督风险疑点闭环管理系统 · 业务流程</h2>
    </div>

    <!-- 流程图：点击可放大预览（原图较宽，支持查看大图） -->
    <div class="diagram-wrap">
      <el-image
        :src="diagramImg"
        :preview-src-list="[diagramImg]"
        :initial-index="0"
        fit="contain"
        preview-teleported
        class="diagram-img"
      >
        <template #error>
          <div class="img-error">流程图加载失败</div>
        </template>
      </el-image>
      <p class="diagram-tip">点击图片可放大查看</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  // 流程说明页面：以图片形式展示业务流程图，支持点击放大预览
  import diagramImg from '@/assets/img/daily-supervision/flow-phases.png'
</script>

<style scoped lang="scss">
  .daily-supervision-page {
    height: 100%;
    padding: 20px;
    overflow-y: auto;
    background: #f5f7fa;
  }

  /* 标题区 */
  .page-header {
    padding: 12px 24px;
    background: #fff;
    border-radius: 8px;

    .page-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #1d2129;
    }
  }

  /* 流程图容器 */
  .diagram-wrap {
    padding: 24px;
    margin-top: 16px;
    text-align: center;
    background: #fff;
    border-radius: 8px;

    .diagram-img {
      width: 100%;
      max-width: 900px; /* 四阶段流程图，限制最大宽度保持清晰比例 */
      cursor: zoom-in; /* 提示可点击放大 */
    }

    .diagram-tip {
      margin: 16px 0 0;
      font-size: 13px;
      color: #909399;
    }

    .img-error {
      padding: 40px;
      color: #909399;
    }
  }
</style>
