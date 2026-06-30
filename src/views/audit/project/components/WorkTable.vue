<template>
  <!-- 工作项表格：单个 Tab 内的工作清单，支持多选 + 行内指派接收人 -->
  <el-table
    :data="rows"
    size="default"
    max-height="380"
    @selection-change="(rows) => emit('selection-change', rows)"
  >
    <el-table-column type="selection" width="44" />
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
  import { inject } from 'vue'
  import type { WorkloadItem } from '@/types/audit-management/work-transfer'
  import type { AuditProjectMember } from '@/types/audit'

  defineProps<{
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
</style>
