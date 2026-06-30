<template>
  <!-- 整改进展字段配置单行：勾选项 + 显示名输入 + 是否必填 -->
  <div class="progress-field-row" :class="{ 'is-disabled': disabled }">
    <!-- 左侧：字段勾选 -->
    <div class="field-check">
      <el-checkbox
        v-model="field.enabled"
        :disabled="disabled || field.enabledDisabled"
        @change="emitChange"
      >
        {{ field.label }}
      </el-checkbox>
      <!-- 带提示图标的字段（如"整改进度（数字）"） -->
      <el-tooltip v-if="field.hasTip" content="该字段为系统自动计算字段" placement="top">
        <el-icon class="tip-icon"><Warning /></el-icon>
      </el-tooltip>
    </div>

    <!-- 中间：显示名输入 -->
    <div class="field-display">
      <span class="display-label"><span class="req-star">*</span> 显示名：</span>
      <el-input
        v-model="field.displayName"
        placeholder="请输入"
        :maxlength="field.maxLength || 100"
        :disabled="disabled"
        show-word-limit
        class="display-input"
        @input="emitChange"
      />
    </div>

    <!-- 右侧：是否必填 -->
    <div class="field-required">
      <span class="req-label">是否必填：</span>
      <el-radio-group
        v-model="field.required"
        :disabled="disabled || field.requiredDisabled"
        @change="emitChange"
      >
        <el-radio :value="true">是</el-radio>
        <el-radio :value="false">否</el-radio>
      </el-radio-group>
    </div>
  </div>
</template>

<script setup lang="ts">
  /**
   * 整改进展字段配置单行组件
   * 用于未整改/正在整改/已整改/成效/销号表单各分组下的字段配置
   * 通过 v-model 双向绑定字段对象，变更时向父级 emit change
   * disabled=true 时整行灰显且不可勾选/编辑（如"不需要整改成效"时的成效字段）
   */
  import { Warning } from '@element-plus/icons-vue'
  import type { ProgressFieldItem } from '@/types/process-config'

  const field = defineModel<ProgressFieldItem>('field', { required: true })
  // 整行禁用（灰显且不可操作）
  withDefaults(defineProps<{ disabled?: boolean }>(), { disabled: false })
  const emit = defineEmits<{ change: [] }>()

  // 任意子控件变更时通知父级同步
  const emitChange = () => emit('change')
</script>

<style lang="scss" scoped>
  .progress-field-row {
    display: flex;
    gap: 24px;
    align-items: center;
    padding: 8px 0;

    /* 整行禁用：整体灰显（控件本身已 disabled，此处统一压低标签/星号颜色） */
    &.is-disabled {
      .display-label,
      .req-label,
      .req-star {
        color: #c0c4cc;
      }
    }

    /* 左侧勾选项固定宽度，保证显示名对齐 */
    .field-check {
      display: flex;
      gap: 4px;
      align-items: center;
      width: 200px;
      min-width: 200px;

      .tip-icon {
        font-size: 14px;
        color: #909399;
      }
    }

    /* 中间显示名区域 */
    .field-display {
      display: flex;
      align-items: center;

      .display-label {
        margin-right: 8px;
        font-size: 14px;
        color: #303133;
        white-space: nowrap;

        .req-star {
          color: var(--el-color-danger);
        }
      }

      /* 显示名输入框定宽，贴合图中样式 */
      .display-input {
        width: 280px;
      }
    }

    /* 右侧是否必填 */
    .field-required {
      display: flex;
      align-items: center;

      .req-label {
        margin-right: 8px;
        font-size: 14px;
        color: #303133;
        white-space: nowrap;
      }
    }
  }
</style>
