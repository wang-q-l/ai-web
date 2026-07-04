<template>
  <!-- 人员变更记录抽屉：与「变更」一致的抽屉交互，卡片式展示每次变更的流向与交接内容 -->
  <el-drawer
    :model-value="visible"
    title="人员变更记录"
    size="1000px"
    @update:model-value="(v) => emit('update:visible', v)"
    @open="loadRecords"
  >
    <div class="tr-list" v-loading="loading">
      <div v-for="rec in records" :key="rec.id" class="tr-card">
        <!-- 卡片头：移出/接替人员（匹配向导头部样式） -->
        <div class="tr-card-head">
          <div class="tr-head-from">
            移出成员：<span class="tr-member-name">{{ rec.fromMemberName }}</span>
            <el-tag size="small" type="info" effect="plain" style="margin-left: 6px">{{
              rec.fromMemberRole
            }}</el-tag>
          </div>
          <div class="tr-head-to">
            接替人员：
            <template v-for="(rc, idx) in rec.receivers" :key="rc.toMemberId">
              <span v-if="idx > 0" class="tr-to-sep">、</span>
              <span class="tr-member-name tr-member-name--to">{{ rc.toMemberName }}</span>
            </template>
          </div>
        </div>

        <!-- 卡片体：变更原因 + 交接内容 -->
        <div class="tr-card-body">
          <!-- 变更原因：只读展示 -->
          <div class="tr-reason-section">
            <div class="tr-section-label">变更原因</div>
            <el-input
              :model-value="rec.reason"
              type="textarea"
              :rows="2"
              readonly
              resize="none"
              class="tr-reason-input"
            />
          </div>

          <!-- 按接收人展示交接内容 -->
          <div v-for="rc in rec.receivers" :key="rc.toMemberId" class="tr-receiver-block">
            <!-- 多接收人时显示接收人名及数量摘要 -->
            <div v-if="rec.receivers.length > 1" class="tr-receiver-title">
              <el-icon><User /></el-icon>
              <span class="tr-receiver-name">{{ rc.toMemberName }}</span>
              <span class="tr-receiver-sum">{{ receiverSummary(rc) }}</span>
            </div>
            <!-- 横向页签：有数据的类别才显示页签，点击切换内容 -->
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
                  <el-table-column label="状态" prop="statusText" width="100" />
                  <el-table-column label="接收人" width="160">
                    <template #default> {{ rc.toMemberName }}（{{ rc.toMemberRole }}） </template>
                  </el-table-column>
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
  </el-drawer>
</template>

<script setup lang="ts">
  // 人员变更记录弹窗：打开时按项目加载移交记录，卡片式直观展示交接流向与内容
  import { ref } from 'vue'
  import { User } from '@element-plus/icons-vue'
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

  // 与向导页签保持一致的类别文案
  const categoryLabelMap: Record<WorkCategory, string> = {
    item: '审计事项',
    document: '审计文书',
    approval: '审批数据',
    reception: '迎审清单',
    doubt: '审计疑点',
    issue: '问题清单',
    defect: '缺陷清单',
    evaluate: '评价节点'
  }

  // 与向导保持一致：仅展示四类已实现的交接节点
  const categoryOrder: WorkCategory[] = ['item', 'document', 'reception', 'doubt']

  // 将接收人的工作项按类别分组，只返回有数据的类别（作为横向页签展示）
  function categoryTabs(rc: WorkTransferReceiver) {
    return categoryOrder
      .map((c) => ({
        value: c,
        label: categoryLabelMap[c],
        items: rc.items.filter((it) => it.category === c)
      }))
      .filter((t) => t.items.length > 0)
  }

  // 默认激活第一个有数据的页签
  function defaultTab(rc: WorkTransferReceiver): string {
    return categoryTabs(rc)[0]?.value || 'item'
  }

  // 多接收人摘要文案：动态汇总各类数量，无数据的类别不显示
  function receiverSummary(rc: WorkTransferReceiver): string {
    const parts: string[] = []
    const ic = rc.items.filter((i) => i.category === 'item').length
    const dc = rc.items.filter((i) => i.category === 'document').length
    const dtc = rc.items.filter((i) => i.category === 'doubt').length
    if (ic > 0) parts.push(`${ic} 事项`)
    if (dc > 0) parts.push(`${dc} 文书`)
    if (dtc > 0) parts.push(`${dtc} 疑点`)
    return parts.length ? `接收 ${parts.join(' / ')}` : '暂无交接内容'
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

  // 卡片头：匹配向导 wt-header 样式
  .tr-card-head {
    display: flex;
    gap: 32px;
    align-items: center;
    padding: 10px 16px;
    font-size: 14px;
    color: #606266;
    background: var(--el-fill-color-light);

    .tr-head-from,
    .tr-head-to {
      display: flex;
      align-items: center;
    }

    .tr-member-name {
      font-weight: 600;
      color: #303133;
    }

    .tr-member-name--to {
      color: var(--el-color-primary);
    }

    .tr-to-sep {
      margin: 0 2px;
      color: #909399;
    }
  }

  // 卡片体：变更原因 + 交接数据明细
  .tr-card-body {
    padding: 12px 16px;

    // 变更原因只读展示区
    .tr-reason-section {
      margin-bottom: 14px;

      .tr-section-label {
        margin-bottom: 6px;
        font-size: 13px;
        color: #606266;
      }

      // 去掉 readonly textarea 的禁用灰色，保持干净展示样式
      .tr-reason-input :deep(.el-textarea__inner) {
        color: #303133;
        cursor: default;
        resize: none;
        background: var(--el-fill-color-lighter);
        border-color: var(--el-border-color-lighter);
        box-shadow: none;
      }
    }

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

    // 横向页签：交接内容分类展示
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
