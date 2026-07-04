<template>
  <div class="workbench-page">
    <div class="placeholder-content">
      <p class="page-title">{{ $t('menus.workbench.title') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'Workbench' })
</script>

<style lang="scss" scoped>
  .workbench-page {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 140px);
    padding: 0;
    overflow: hidden;

    .placeholder-content {
      display: flex;
      flex: 1;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #909399;

      .page-title {
        margin-bottom: 12px;
        font-size: 24px;
        font-weight: 500;
      }

      .page-desc {
        font-size: 14px;
      }
    }
  }
</style>
