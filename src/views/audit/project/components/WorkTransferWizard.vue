<template>
  <!-- 工作移交向导：单页三 Tab（审计事项/审计文书/审批数据），逐项指派接收人后汇总确认提交 -->
  <el-drawer
    :model-value="visible"
    :title="step === 1 ? '工作移交' : '移交确认'"
    size="64%"
    :close-on-click-modal="false"
    @update:model-value="(v) => emit('update:visible', v)"
    @closed="handleClosed"
  >
    <div class="wt-wizard" v-loading="loading">
      <!-- 顶部：移出成员 + 移交原因 -->
      <div class="wt-header">
        <div class="wt-from">
          移出成员：<span class="wt-from-name">{{ fromMember?.name }}</span>
          <el-tag size="small" type="info" effect="plain" style="margin-left: 8px">
            {{ fromMember?.role }}
          </el-tag>
        </div>
        <div class="wt-reason">
          <span class="wt-reason-label"><span class="wt-required">*</span>移交原因</span>
          <el-select
            v-model="reason"
            placeholder="请选择移交原因"
            style="width: 220px"
            :disabled="step === 2"
          >
            <el-option label="人员离职" value="人员离职" />
            <el-option label="岗位调动" value="岗位调动" />
            <el-option label="工作调整" value="工作调整" />
            <el-option label="其他" value="其他" />
          </el-select>
        </div>
      </div>

      <!-- 步骤1：分类清单分项指派 -->
      <div class="wt-body" v-show="step === 1">
        <div class="wt-batch">
          <span class="wt-batch-tip">已勾选 {{ selectedCount }} 项</span>
          <div class="wt-batch-right">
            <span class="wt-batch-label">批量指派接收人：</span>
            <el-select
              v-model="batchReceiver"
              placeholder="选择接收人"
              style="width: 180px"
              clearable
            >
              <el-option
                v-for="m in candidates"
                :key="m.id"
                :label="`${m.name}（${m.role}）`"
                :value="m.id"
              />
            </el-select>
            <el-button type="primary" :disabled="!batchReceiver" @click="applyBatch">
              应用到勾选项
            </el-button>
          </div>
        </div>
        <el-tabs v-model="activeTab" class="wt-tabs">
          <el-tab-pane :label="`审计事项（${workload.items.length}）`" name="item">
            <work-table
              :rows="workload.items"
              :candidates="candidates"
              @selection-change="(rows) => (selected.item = rows)"
              @assign="onAssign"
            />
          </el-tab-pane>
          <el-tab-pane :label="`审计文书（${workload.documents.length}）`" name="document">
            <work-table
              :rows="workload.documents"
              :candidates="candidates"
              show-code
              @selection-change="(rows) => (selected.document = rows)"
              @assign="onAssign"
            />
          </el-tab-pane>
          <el-tab-pane :label="`审批数据（${workload.approvals.length}）`" name="approval">
            <work-table
              :rows="workload.approvals"
              :candidates="candidates"
              show-code
              approval
              @selection-change="(rows) => (selected.approval = rows)"
              @assign="onAssign"
            />
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 步骤2：按接收人维度汇总确认 -->
      <div class="wt-confirm" v-show="step === 2">
        <el-alert
          :closable="false"
          type="info"
          show-icon
          title="提交后即时生效：工作项归属立即转移，在途审批将转交接收人继续处理。"
          style="margin-bottom: 16px"
        />
        <div v-for="rc in confirmReceivers" :key="rc.toMemberId" class="wt-receiver">
          <div class="wt-receiver-title">
            <el-icon><User /></el-icon>
            <span>{{ rc.toMemberName }}</span>
            <span class="wt-receiver-sum">
              将接收 {{ rc.items.length }} 个事项、{{ rc.documents.length }} 份文书、{{
                rc.approvals.length
              }}
              条审批
            </span>
          </div>
          <el-table :data="rc.rows" size="small" class="wt-confirm-table">
            <el-table-column label="类别" width="100">
              <template #default="{ row }">
                <el-tag size="small" :type="categoryTag(row.category)">
                  {{ categoryLabel(row.category) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="名称" prop="refName" show-overflow-tooltip />
            <el-table-column label="当前状态" prop="statusText" width="120" />
          </el-table>
        </div>
        <el-empty v-if="confirmReceivers.length === 0" description="尚未指派任何工作项" />
      </div>
    </div>

    <template #footer>
      <el-button @click="emit('update:visible', false)">取消</el-button>
      <el-button v-if="step === 2" @click="step = 1">上一步</el-button>
      <el-button v-if="step === 1" type="primary" @click="goConfirm">下一步</el-button>
      <el-button v-else type="primary" :loading="submitting" @click="handleSubmit">
        确认移交
      </el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
  // 工作移交向导：归集移出成员名下三类工作，逐项指派接收人，汇总确认后即时提交
  import { ref, reactive, computed, watch, provide } from 'vue'
  import { ElMessage } from 'element-plus'
  import { User } from '@element-plus/icons-vue'
  import WorkTable from './WorkTable.vue'
  import { getMemberWorkload, submitWorkTransfer } from '@/api/audit-management/work-transfer'
  import type { AuditProjectMember } from '@/types/audit'
  import type {
    MemberWorkload,
    WorkloadItem,
    WorkCategory,
    WorkTransferItem
  } from '@/types/audit-management/work-transfer'

  const props = defineProps<{
    visible: boolean
    projectId: number
    /** 移出成员 */
    fromMember: AuditProjectMember | null
    /** 同项目其他在职成员（候选接收人） */
    candidates: AuditProjectMember[]
    /** 发起人姓名 */
    operatorName: string
  }>()

  const emit = defineEmits<{
    'update:visible': [v: boolean]
    success: []
  }>()

  const loading = ref(false)
  const submitting = ref(false)
  const step = ref<1 | 2>(1)
  const reason = ref('')
  const activeTab = ref<WorkCategory>('item')
  const batchReceiver = ref<number | undefined>()

  // 三类工作归集结果
  const workload = reactive<MemberWorkload>({ items: [], documents: [], approvals: [] })

  // 每项的接收人指派：refId -> toMemberId
  const assignMap = reactive<Record<number, number>>({})
  // 提供给子表格 WorkTable 回显行内接收人下拉
  provide('assignMap', assignMap)

  // 各 Tab 当前勾选的行
  const selected = reactive<Record<WorkCategory, WorkloadItem[]>>({
    item: [],
    document: [],
    approval: []
  })

  const candidates = computed(() => props.candidates)

  // 加载某成员名下工作
  watch(
    () => props.visible,
    async (v) => {
      if (v && props.fromMember) {
        await loadWorkload()
      }
    }
  )

  async function loadWorkload() {
    if (!props.fromMember) return
    loading.value = true
    try {
      const res = await getMemberWorkload(props.projectId, props.fromMember.id)
      workload.items = res.data.items
      workload.documents = res.data.documents
      workload.approvals = res.data.approvals
    } finally {
      loading.value = false
    }
  }

  // 行内指派接收人
  function onAssign(refId: number, toMemberId: number) {
    assignMap[refId] = toMemberId
  }

  // 批量指派：把当前 Tab 勾选项统一指派给批量接收人
  function applyBatch() {
    if (!batchReceiver.value) return
    const rows = selected[activeTab.value]
    if (rows.length === 0) {
      ElMessage.warning('请先在列表中勾选要指派的工作项')
      return
    }
    rows.forEach((r) => (assignMap[r.refId] = batchReceiver.value!))
    ElMessage.success(`已为 ${rows.length} 项指派接收人`)
  }

  // 已勾选总数
  const selectedCount = computed(
    () => selected.item.length + selected.document.length + selected.approval.length
  )

  const categoryLabelMap: Record<WorkCategory, string> = {
    item: '审计事项',
    document: '审计文书',
    approval: '审批数据'
  }
  function categoryLabel(c: WorkCategory) {
    return categoryLabelMap[c]
  }
  function categoryTag(c: WorkCategory): 'primary' | 'success' | 'warning' {
    return c === 'item' ? 'primary' : c === 'document' ? 'success' : 'warning'
  }

  // 全部已指派的工作项（过滤出 assignMap 中有接收人的）
  const allRows = computed<WorkloadItem[]>(() => [
    ...workload.items,
    ...workload.documents,
    ...workload.approvals
  ])

  // 按接收人维度汇总（确认页用）
  interface ReceiverGroup {
    toMemberId: number
    toMemberName: string
    rows: WorkloadItem[]
    items: WorkloadItem[]
    documents: WorkloadItem[]
    approvals: WorkloadItem[]
  }
  const confirmReceivers = computed<ReceiverGroup[]>(() => {
    const map: Record<number, ReceiverGroup> = {}
    allRows.value.forEach((row) => {
      const toId = assignMap[row.refId]
      if (!toId) return
      const member = props.candidates.find((m) => m.id === toId)
      const g =
        map[toId] ||
        (map[toId] = {
          toMemberId: toId,
          toMemberName: member?.name || '',
          rows: [],
          items: [],
          documents: [],
          approvals: []
        })
      g.rows.push(row)
      if (row.category === 'item') g.items.push(row)
      else if (row.category === 'document') g.documents.push(row)
      else g.approvals.push(row)
    })
    return Object.values(map)
  })

  // 下一步：校验后进入确认页
  function goConfirm() {
    if (!reason.value) {
      ElMessage.warning('请选择移交原因')
      return
    }
    const assignedCount = allRows.value.filter((r) => assignMap[r.refId]).length
    if (assignedCount === 0) {
      ElMessage.warning('请至少为一个工作项指派接收人')
      return
    }
    step.value = 2
  }

  // 提交移交
  async function handleSubmit() {
    if (!props.fromMember) return
    const items: WorkTransferItem[] = allRows.value
      .filter((r) => assignMap[r.refId])
      .map((r) => ({
        category: r.category,
        refId: r.refId,
        refName: r.refName,
        toMemberId: assignMap[r.refId]
      }))

    const nameMap: Record<number, string> = {}
    props.candidates.forEach((m) => (nameMap[m.id] = m.name))

    submitting.value = true
    try {
      await submitWorkTransfer(
        {
          projectId: props.projectId,
          fromMemberId: props.fromMember.id,
          reason: reason.value,
          items
        },
        props.fromMember.name,
        props.operatorName,
        nameMap
      )
      ElMessage.success('工作移交成功')
      emit('update:visible', false)
      emit('success')
    } catch (e: any) {
      ElMessage.error(e?.message || '移交失败')
    } finally {
      submitting.value = false
    }
  }

  // 关闭时重置状态
  function handleClosed() {
    step.value = 1
    reason.value = ''
    activeTab.value = 'item'
    batchReceiver.value = undefined
    Object.keys(assignMap).forEach((k) => delete assignMap[Number(k)])
    selected.item = []
    selected.document = []
    selected.approval = []
    workload.items = []
    workload.documents = []
    workload.approvals = []
  }
</script>

<style scoped lang="scss">
  .wt-wizard {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .wt-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    margin-bottom: 16px;
    background: var(--el-fill-color-light);
    border-radius: 8px;

    .wt-from-name {
      font-weight: 600;
      color: #303133;
    }

    .wt-reason {
      display: flex;
      gap: 8px;
      align-items: center;

      .wt-reason-label {
        font-size: 14px;
        color: #606266;
      }

      // 必填星号，与 el-form 风格一致
      .wt-required {
        margin-right: 2px;
        color: var(--el-color-danger);
      }
    }
  }

  .wt-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
  }

  .wt-batch {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;

    .wt-batch-tip {
      font-size: 13px;
      color: #909399;
    }

    .wt-batch-right {
      display: flex;
      gap: 8px;
      align-items: center;

      .wt-batch-label {
        font-size: 13px;
        color: #606266;
      }
    }
  }

  .wt-tabs {
    flex: 1;
  }

  .wt-confirm {
    flex: 1;
    overflow: auto;

    .wt-receiver {
      margin-bottom: 20px;

      .wt-receiver-title {
        display: flex;
        gap: 6px;
        align-items: center;
        margin-bottom: 8px;
        font-weight: 600;
        color: #303133;

        .wt-receiver-sum {
          margin-left: 8px;
          font-size: 13px;
          font-weight: 400;
          color: #909399;
        }
      }
    }
  }
</style>
