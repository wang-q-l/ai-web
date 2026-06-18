<template>
  <!-- 人员变更记录弹窗：展示本项目历史工作移交记录 -->
  <el-dialog
    :model-value="visible"
    title="人员变更记录"
    width="820px"
    @update:model-value="(v) => emit('update:visible', v)"
    @open="loadRecords"
  >
    <el-table :data="records" border v-loading="loading" max-height="460">
      <el-table-column label="移出成员" prop="fromMemberName" width="100" />
      <el-table-column label="接收情况" min-width="240">
        <template #default="{ row }">
          <div v-for="rc in row.receivers" :key="rc.toMemberId" class="tr-receiver">
            <span class="tr-name">{{ rc.toMemberName }}</span>
            <span class="tr-detail">
              接收 {{ rc.itemCount }} 事项 / {{ rc.documentCount }} 文书 /
              {{ rc.approvalCount }} 审批
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="移交原因" prop="reason" width="100" />
      <el-table-column label="移交项数" prop="itemCount" width="90" align="center" />
      <el-table-column label="发起人" prop="operatorName" width="90" />
      <el-table-column label="移交时间" prop="transferTime" width="170" />
      <template #empty>
        <el-empty description="暂无变更记录" :image-size="80" />
      </template>
    </el-table>

    <template #footer>
      <el-button type="primary" @click="emit('update:visible', false)">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  // 人员变更记录弹窗：打开时按项目加载移交记录
  import { ref } from 'vue'
  import { getWorkTransferRecords } from '@/api/audit-management/work-transfer'
  import type { WorkTransferRecord } from '@/types/audit-management/work-transfer'

  const props = defineProps<{
    visible: boolean
    projectId: number
  }>()

  const emit = defineEmits<{
    'update:visible': [v: boolean]
  }>()

  const loading = ref(false)
  const records = ref<WorkTransferRecord[]>([])

  // 加载本项目移交记录
  async function loadRecords() {
    loading.value = true
    try {
      const res = await getWorkTransferRecords(props.projectId)
      records.value = res.data.list
    } finally {
      loading.value = false
    }
  }
</script>

<style scoped lang="scss">
  .tr-receiver {
    display: flex;
    gap: 8px;
    align-items: center;
    line-height: 1.8;

    .tr-name {
      font-weight: 600;
      color: #303133;
    }

    .tr-detail {
      font-size: 12px;
      color: #909399;
    }
  }
</style>
