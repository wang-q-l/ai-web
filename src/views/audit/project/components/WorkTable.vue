<template>
  <!-- 工作项表格：单个 Tab 内的工作清单，支持多选 + 行内指派接收人 -->
  <el-table :data="rows" size="default" max-height="380" :row-class-name="rowClassName">
    <!-- 勾选列与序号列合并：默认显示序号，行 hover 或已勾选时显示勾选框 -->
    <el-table-column label="序号" width="80" align="center">
      <template #header>
        <el-checkbox
          :model-value="allChecked"
          :indeterminate="isIndeterminate"
          @change="handleCheckAll"
        />
      </template>
      <template #default="{ row, $index }">
        <div class="seq-cell">
          <span class="seq-num">{{ $index + 1 }}</span>
          <el-checkbox
            class="seq-check"
            :model-value="selectedIds.includes(row.refId)"
            @change="(val) => handleCheckRow(row.refId, !!val)"
          />
        </div>
      </template>
    </el-table-column>
    <el-table-column label="名称" prop="refName" min-width="180" show-overflow-tooltip>
      <template #default="{ row }">
        <span class="wt-name">{{ row.refName }}</span>
      </template>
    </el-table-column>
    <el-table-column v-if="showCode" label="编号" prop="refCode" width="180" show-overflow-tooltip>
      <template #default="{ row }">{{ row.refCode || '-' }}</template>
    </el-table-column>
    <el-table-column label="当前状态" width="120">
      <template #default="{ row }">
        <el-tag size="small" :type="statusTag(row.statusText)" effect="light">
          {{ row.statusText }}
        </el-tag>
      </template>
    </el-table-column>
    <!-- 接收人列：审批数据不可移交，故审批 Tab 下不显示该列 -->
    <el-table-column
      v-if="!approval"
      label="接收人"
      width="200"
      label-class-name="col-receiver-header"
    >
      <template #default="{ row }">
        <el-select
          :model-value="modelAssign[row.refId]"
          placeholder="选择接收人"
          size="small"
          clearable
          style="width: 170px"
          @update:model-value="(v) => emit('assign', row.refId, v)"
        >
          <el-option
            v-for="m in candidates"
            :key="m.id"
            :label="`${m.name}（${m.role}）`"
            :value="m.id"
          />
        </el-select>
      </template>
    </el-table-column>
    <template #empty>
      <span class="wt-empty">该成员暂无此类工作</span>
    </template>
  </el-table>
</template>

<script setup lang="ts">
  // 工作项表格组件：被 WorkTransferWizard 的三个 Tab 复用
  import { inject, ref, computed, watch } from 'vue'
  import type { WorkloadItem } from '@/types/audit-management/work-transfer'
  import type { AuditProjectMember } from '@/types/audit'

  const props = defineProps<{
    /** 当前 Tab 的工作项列表 */
    rows: WorkloadItem[]
    /** 候选接收人 */
    candidates: AuditProjectMember[]
    /** 是否显示编号列（文书/审批） */
    showCode?: boolean
    /** 是否为审批类（显示转交提示） */
    approval?: boolean
  }>()

  const emit = defineEmits<{
    'selection-change': [rows: WorkloadItem[]]
    assign: [refId: number, toMemberId: number]
  }>()

  // 从父组件注入指派表（refId -> toMemberId），用于回显行内下拉
  const modelAssign = inject<Record<number, number>>('assignMap', {})

  // 已勾选的行ID（勾选列与序号列合并，自行管理选中态）
  const selectedIds = ref<(number | string)[]>([])

  // 全选态：当前页全部勾选时为 true
  const allChecked = computed(
    () => props.rows.length > 0 && selectedIds.value.length === props.rows.length
  )
  // 半选态：部分勾选
  const isIndeterminate = computed(
    () => selectedIds.value.length > 0 && selectedIds.value.length < props.rows.length
  )

  // 表头全选/取消全选
  const handleCheckAll = (val: boolean | string | number) => {
    selectedIds.value = val ? props.rows.map((item) => item.refId) : []
  }

  // 单行勾选/取消
  const handleCheckRow = (id: number | string, val: boolean) => {
    if (val) {
      if (!selectedIds.value.includes(id)) selectedIds.value.push(id)
    } else {
      selectedIds.value = selectedIds.value.filter((item) => item !== id)
    }
  }

  // 已勾选的行加类名，使其序号列常驻显示勾选框
  const rowClassName = ({ row }: { row: WorkloadItem }) => {
    return selectedIds.value.includes(row.refId) ? 'row-checked' : ''
  }

  // 数据切换时清空选中状态，并向父组件同步选中行
  watch(
    () => props.rows,
    () => {
      selectedIds.value = []
    }
  )

  // 选中变化时向父组件 emit selection-change（保持原有接口不变）
  watch(selectedIds, (ids) => {
    emit(
      'selection-change',
      props.rows.filter((item) => ids.includes(item.refId))
    )
  })

  // 状态文本映射到标签颜色
  function statusTag(text: string): 'primary' | 'success' | 'warning' | 'info' {
    if (text.includes('完成') || text.includes('已')) return 'success'
    if (text.includes('审核') || text.includes('反馈') || text.includes('下达')) return 'warning'
    if (text.includes('进行')) return 'primary'
    return 'info'
  }
</script>

<style scoped lang="scss">
  .wt-name {
    color: var(--el-color-primary);
  }

  .wt-empty {
    font-size: 13px;
    color: #c0c4cc;
  }

  /* 勾选框 / 序号 合并单元格：默认显示序号，hover 行或已勾选时显示勾选框 */
  .seq-cell {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;

    .seq-num {
      color: #606266;
    }

    /* 勾选框默认覆盖在序号位置但隐藏 */
    .seq-check {
      position: absolute;
      display: none;
      height: auto;
    }
  }

  /* 行 hover 或已勾选：隐藏序号，显示勾选框 */
  :deep(.el-table__row:hover) .seq-cell,
  :deep(.el-table__row.row-checked) .seq-cell {
    .seq-num {
      display: none;
    }

    .seq-check {
      display: inline-flex;
    }
  }
</style>
