<template>
  <div
    class="document-type-card"
    :class="{
      selected: selected,
      completed: docType.status === 'completed',
      'in-progress': docType.status === 'in-progress',
      'not-started': docType.status === 'not-started'
    }"
  >
    <div class="icon">{{ docType.icon }}</div>
    <div class="name">{{ docType.name }}</div>
    <div class="status-badge">
      <span v-if="docType.status === 'completed'" class="badge completed">已完成</span>
      <span v-else-if="docType.status === 'in-progress'" class="badge in-progress">进行中</span>
      <span v-else class="badge not-started">未开始</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'DocumentTypeCard'
})

interface DocType {
  id: string
  name: string
  icon: string
  status: 'completed' | 'in-progress' | 'not-started'
}

defineProps<{
  docType: DocType
  selected: boolean
}>()
</script>

<style scoped lang="scss">
.document-type-card {
  padding: 16px;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: #fff;

  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
  }

  &.selected {
    border-color: var(--el-color-primary);
    background: #ecf5ff;
  }

  .icon {
    font-size: 32px;
  }

  .name {
    font-size: 14px;
    color: #303133;
    font-weight: 500;
    text-align: center;
  }

  .status-badge {
    .badge {
      padding: 2px 8px;
      font-size: 12px;
      border-radius: 4px;

      &.completed {
        color: #67c23a;
        background: #f0f9ff;
      }

      &.in-progress {
        color: #409eff;
        background: #ecf5ff;
      }

      &.not-started {
        color: #909399;
        background: #f4f4f5;
      }
    }
  }
}
</style>
