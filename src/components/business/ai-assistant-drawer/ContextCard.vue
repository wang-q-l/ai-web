<template>
  <el-card class="context-card" shadow="never">
    <template #header>
      <div class="card-header" @click="collapsed = !collapsed">
        <div class="header-left">
          <span class="icon">📊</span>
          <span class="title">项目上下文</span>
        </div>
        <el-icon :class="['arrow', { collapsed }]">
          <ArrowDown />
        </el-icon>
      </div>
    </template>

    <el-collapse-transition>
      <div v-show="!collapsed" class="context-content">
        <div class="context-item">
          <span class="label">项目名称：</span>
          <span class="value">{{ context.projectName }}</span>
        </div>
        <div class="context-item">
          <span class="label">被审计单位：</span>
          <span class="value">{{ context.auditedUnit }}</span>
        </div>
        <div class="context-item">
          <span class="label">审计类型：</span>
          <span class="value">{{ context.auditType }}</span>
        </div>
        <div class="context-item">
          <span class="label">审计事项：</span>
          <span class="value">{{ context.auditItem }}</span>
        </div>
        <div v-if="context.auditItemDesc" class="context-item">
          <span class="label">事项描述：</span>
          <span class="value">{{ context.auditItemDesc }}</span>
        </div>
      </div>
    </el-collapse-transition>
  </el-card>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { ArrowDown } from '@element-plus/icons-vue'
  import type { ProjectContext } from '@/types/ai-assistant'

  defineOptions({
    name: 'ContextCard'
  })

  interface Props {
    context: ProjectContext
  }

  defineProps<Props>()

  const collapsed = ref(false)
</script>

<style scoped lang="scss">
  .context-card {
    background: var(--el-fill-color-light);
    border: none !important;
    border-radius: 8px;
    box-shadow: none !important;

    :deep(.el-card__header) {
      padding: 12px 16px;
      border-bottom: none;
    }

    :deep(.el-card__body) {
      padding: 0 16px 12px;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      user-select: none;

      .header-left {
        display: flex;
        gap: 8px;
        align-items: center;

        .icon {
          font-size: 18px;
        }

        .title {
          font-size: 14px;
          font-weight: 500;
          color: var(--el-text-color-primary);
        }
      }

      .arrow {
        font-size: 14px;
        color: var(--el-text-color-secondary);
        transition: transform 0.3s;

        &.collapsed {
          transform: rotate(-90deg);
        }
      }
    }

    .context-content {
      .context-item {
        display: flex;
        margin-bottom: 8px;
        font-size: 13px;
        line-height: 1.6;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          flex-shrink: 0;
          min-width: 90px;
          color: var(--el-text-color-secondary);
        }

        .value {
          flex: 1;
          color: var(--el-text-color-primary);
          word-break: break-all;
        }
      }
    }
  }
</style>
