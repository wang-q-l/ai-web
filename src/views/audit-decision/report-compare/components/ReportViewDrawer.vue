<template>
  <!-- 报表查看抽屉：只读展示基准报表（指标名称/单位/指标值） -->
  <el-drawer
    :model-value="modelValue"
    :title="ledger?.name || '报表查看'"
    size="640px"
    @update:model-value="(v) => emit('update:modelValue', v)"
  >
    <div v-if="ledger" class="view-body">
      <div class="report-title">{{ ledger.report.header.reportType || '审计统计台账' }}</div>
      <div class="view-table-wrapper">
        <table class="view-table">
          <thead>
            <tr>
              <th class="col-name">指标名称</th>
              <th class="col-unit">单位</th>
              <th class="col-value">指标值</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in ledger.report.rows" :key="row.matchKey">
              <td class="col-name" :style="{ paddingLeft: 12 + row.level * 16 + 'px' }">
                {{ row.indicatorName }}
              </td>
              <td class="col-unit">{{ row.unit }}</td>
              <td class="col-value num">{{ formatValue(row.value) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
  /**
   * 报表查看抽屉组件
   * 列表点台账名称时打开，只读展示该台账的完整基准报表
   */
  import type { BaselineLedger } from '@/types/report-compare'

  defineProps<{
    modelValue: boolean
    ledger: BaselineLedger | null
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
  }>()

  // 数值展示：千分位格式化（仅展示层）；空值占位
  const formatValue = (val: string): string => {
    if (val === null || val === '') return '—'
    if (/^-?\d+(\.\d+)?$/.test(val)) return Number(val).toLocaleString('zh-CN')
    return val
  }
</script>

<style scoped lang="scss">
  .view-body {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .report-title {
    flex-shrink: 0;
    padding-bottom: 12px;
    font-size: 16px;
    font-weight: 600;
    color: #1d2129;
    text-align: center;
  }

  .view-table-wrapper {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }

  .view-table {
    width: 100%;
    font-size: 13px;
    border-collapse: collapse;

    th,
    td {
      padding: 0 12px;
      text-align: left;
      border-bottom: 1px solid #eaebf1;
    }

    thead th {
      position: sticky;
      top: 0;
      z-index: 1;
      height: 38px;
      font-size: 13px;
      font-weight: 500;
      color: #4b5675;
      background: #f5f7fa;
    }

    tbody tr {
      height: 38px;
    }

    .col-unit {
      width: 70px;
      color: #78829d;
    }

    .col-value {
      width: 130px;
    }

    /* 数值列右对齐 + 等宽数字 */
    .num {
      font-variant-numeric: tabular-nums;
      text-align: right;
    }
  }
</style>
