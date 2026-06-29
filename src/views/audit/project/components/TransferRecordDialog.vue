<template>
  <!-- 人员变更记录抽屉：与「变更」一致的抽屉交互，卡片式展示每次变更的流向与交接内容 -->
  <el-drawer
    :model-value="visible"
    title="人员变更记录"
    size="600px"
    @update:model-value="(v) => emit('update:visible', v)"
    @open="loadRecords"
  >
    <div class="tr-list" v-loading="loading">
      <div v-for="rec in records" :key="rec.id" class="tr-card">
        <!-- 卡片头：变更流向概要 -->
        <div class="tr-card-head">
          <div class="tr-flow">
            <!-- 原成员 -->
            <div class="tr-person">
              <span class="tr-role">{{ rec.fromMemberRole }}</span>
              <span class="tr-person-name">{{ rec.fromMemberName }}</span>
            </div>
            <!-- 流向箭头 -->
            <div class="tr-arrow">
              <el-icon><Right /></el-icon>
              <span class="tr-arrow-text">移交 {{ rec.itemCount }} 项</span>
            </div>
            <!-- 接收人（可能多个） -->
            <div class="tr-receivers">
              <div v-for="rc in rec.receivers" :key="rc.toMemberId" class="tr-person tr-person--to">
                <span class="tr-role">{{ rc.toMemberRole }}</span>
                <span class="tr-person-name">{{ rc.toMemberName }}</span>
              </div>
            </div>
          </div>
          <el-tag size="small" type="info" effect="plain">{{ rec.reason }}</el-tag>
        </div>

        <!-- 卡片体：按接收人 + 页签（事项/文书/审批）展示交接的具体数据 -->
        <div class="tr-card-body">
          <div v-for="rc in rec.receivers" :key="rc.toMemberId" class="tr-receiver-block">
            <!-- 单接收人：接收人已在头部流向中体现，此处直接显示「交接内容」 -->
            <div v-if="rec.receivers.length === 1" class="tr-receiver-title">
              <el-icon><Tickets /></el-icon>
              <span class="tr-receiver-name">交接内容</span>
            </div>
            <!-- 多接收人：需标明每位接收人及其接收数量 -->
            <div v-else class="tr-receiver-title">
              <el-icon><User /></el-icon>
              <span class="tr-receiver-name">{{ rc.toMemberName }}</span>
              <span class="tr-receiver-sum">
                接收 {{ rc.itemCount }} 事项 / {{ rc.documentCount }} 文书 /
                {{ rc.approvalCount }} 审批
              </span>
            </div>
            <!-- 页签分类展示交接内容 -->
            <el-tabs :model-value="defaultTab(rc)" class="tr-tabs">
              <el-tab-pane
                v-for="cat in categoryTabs(rc)"
                :key="cat.value"
                :label="`${cat.label}（${cat.items.length}）`"
                :name="cat.value"
              >
                <el-table :data="cat.items" size="small" class="tr-tab-table">
                  <el-table-column label="名称" prop="refName" show-overflow-tooltip>
                    <template #default="{ row }">
                      <span class="tr-item-name">{{ row.refName }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="状态" prop="statusText" width="110" />
                </el-table>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </div>

      <el-empty
        v-if="!loading && records.length === 0"
        description="暂无变更记录"
        :image-size="90"
      />
    </div>

    <template #footer>
      <el-button type="primary" @click="emit('update:visible', false)">关闭</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
  // 人员变更记录弹窗：打开时按项目加载移交记录，卡片式直观展示交接流向与内容
  import { ref } from 'vue'
  import { Right, User, Tickets } from '@element-plus/icons-vue'
  import { getWorkTransferRecords } from '@/api/audit-management/work-transfer'
  import type {
    WorkTransferRecord,
    WorkTransferReceiver,
    WorkCategory
  } from '@/types/audit-management/work-transfer'

  const props = defineProps<{
    visible: boolean
    projectId: number
  }>()

  const emit = defineEmits<{
    'update:visible': [v: boolean]
  }>()

  const loading = ref(false)
  const records = ref<WorkTransferRecord[]>([])

  // 类别文案
  const categoryLabelMap: Record<WorkCategory, string> = {
    item: '审计事项',
    document: '审计文书',
    approval: '审批数据'
  }

  // 将接收人的工作项按类别分组为页签（只保留有内容的类别）
  function categoryTabs(rc: WorkTransferReceiver) {
    const order: WorkCategory[] = ['item', 'document', 'approval']
    return order
      .map((c) => ({
        value: c,
        label: categoryLabelMap[c],
        items: rc.items.filter((it) => it.category === c)
      }))
      .filter((t) => t.items.length > 0)
  }

  // 默认激活的页签：第一个有内容的类别
  function defaultTab(rc: WorkTransferReceiver): string {
    return categoryTabs(rc)[0]?.value || 'item'
  }

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
  .tr-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .tr-card {
    overflow: hidden;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 10px;
  }

  // 卡片头：流向概要
  .tr-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    background: var(--el-fill-color-light);

    .tr-flow {
      display: flex;
      gap: 14px;
      align-items: center;
    }

    .tr-person {
      display: flex;
      flex-direction: column;
      gap: 2px;
      line-height: 1.3;

      .tr-role {
        font-size: 12px;
        color: #909399;
      }

      .tr-person-name {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
      }
    }

    // 接收人名字蓝色强调，与变更页风格一致
    .tr-person--to .tr-person-name {
      color: var(--el-color-primary);
    }

    .tr-arrow {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: var(--el-color-primary);

      .tr-arrow-text {
        font-size: 11px;
        color: #909399;
        white-space: nowrap;
      }
    }

    .tr-receivers {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
  }

  // 卡片体：交接数据明细
  .tr-card-body {
    padding: 12px 14px;

    .tr-receiver-block {
      &:not(:last-child) {
        padding-bottom: 12px;
        margin-bottom: 12px;
        border-bottom: 1px dashed var(--el-border-color-lighter);
      }

      .tr-receiver-title {
        display: flex;
        gap: 6px;
        align-items: center;
        margin-bottom: 6px;
        font-size: 14px;
        font-weight: 600;
        color: #303133;

        .tr-receiver-sum {
          margin-left: 4px;
          font-size: 12px;
          font-weight: 400;
          color: #909399;
        }
      }
    }

    // 页签：交接内容分类展示
    .tr-tabs {
      :deep(.el-tabs__header) {
        margin-bottom: 8px;
      }

      .tr-tab-table {
        width: 100%;
        font-size: 13px;

        .tr-item-name {
          color: #606266;
        }
      }
    }
  }
</style>
