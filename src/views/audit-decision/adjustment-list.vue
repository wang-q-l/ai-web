<template>
  <!-- 整改调整申请列表页（整改单位端）：筛选 + 申请单列表 + 行操作 -->
  <PageContainer>
    <div class="adjustment-list-container">
      <!-- 筛选区 -->
      <div class="filter-section">
        <el-form :model="queryParams" inline>
          <el-form-item label="项目名称">
            <el-input
              v-model="queryParams.projectName"
              placeholder="请输入项目名称关键字"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="queryParams.approvalStatus"
              placeholder="请选择"
              clearable
              style="width: 140px"
            >
              <el-option
                v-for="(text, val) in statusTextMap"
                :key="val"
                :label="text"
                :value="Number(val)"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="提交单位">
            <el-select
              v-model="queryParams.applyUnit"
              placeholder="请选择"
              clearable
              style="width: 200px"
            >
              <el-option v-for="u in unitOptions" :key="u" :label="u" :value="u" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 操作栏 -->
      <div class="action-bar">
        <el-button class="btn-add" type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增调整申请
        </el-button>
        <!-- 批量提交：勾选待提交数据后可用 -->
        <el-button
          type="success"
          :disabled="!selectedSubmittable.length"
          @click="handleBatchSubmit"
        >
          <el-icon><Promotion /></el-icon>
          提交{{ selectedSubmittable.length ? `（${selectedSubmittable.length}）` : '' }}
        </el-button>
      </div>

      <!-- 表格区 -->
      <div class="table-section">
        <el-table
          ref="tableRef"
          :data="tableData"
          v-loading="loading"
          height="100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="50" :selectable="rowSelectable" />
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="title" label="标题" min-width="180">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleView(row)">{{ row.title }}</el-button>
            </template>
          </el-table-column>
          <el-table-column
            prop="projectName"
            label="项目名称"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column label="调整数量" width="100" align="center">
            <template #default="{ row }">{{ row.problemCount }}</template>
          </el-table-column>
          <el-table-column
            prop="applyUnit"
            label="提交单位"
            min-width="150"
            show-overflow-tooltip
          />
          <el-table-column prop="applyUser" label="提交人" width="100" />
          <el-table-column prop="applyTime" label="提交时间" width="160" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.approvalStatus)" size="small">
                {{ statusTextMap[row.approvalStatus] }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="230" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleView(row)">查看</el-button>
              <el-button v-if="canEdit(row)" link type="primary" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button
                v-if="row.approvalStatus === 2"
                link
                type="warning"
                @click="handleWithdraw(row)"
              >
                撤回
              </el-button>
              <el-button
                v-if="row.approvalStatus !== 1"
                link
                type="primary"
                @click="handleApprovalRecords(row)"
              >
                审批记录
              </el-button>
              <el-button
                v-if="row.approvalStatus === 1"
                link
                type="success"
                @click="handleSubmit(row)"
              >
                提交
              </el-button>
              <el-button
                v-if="row.approvalStatus === 1"
                link
                type="danger"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>

      <!-- 审批记录弹窗 -->
      <el-dialog v-model="recordsVisible" title="审批记录" width="640px">
        <el-timeline v-if="approvalRecords.length">
          <el-timeline-item
            v-for="(rec, idx) in approvalRecords"
            :key="idx"
            :timestamp="rec.approveTime"
            :type="rec.result === '通过' ? 'success' : 'danger'"
          >
            <div class="record-level">{{ rec.level }} · {{ rec.approver }}</div>
            <div class="record-result">
              结果：<span :class="rec.result === '通过' ? 'pass' : 'reject'">{{ rec.result }}</span>
            </div>
            <div class="record-opinion">意见：{{ rec.opinion }}</div>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-else description="暂无审批记录" />
      </el-dialog>

      <!-- 新增/编辑调整申请抽屉 -->
      <AdjustmentEditDrawer v-model="editDrawerVisible" :edit-id="editingId" @saved="fetchData" />
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
  /**
   * 整改调整申请列表页（整改单位端）
   * 筛选 + 申请单列表 + 行操作（查看/编辑/撤回/审批记录/提交/删除）+ 批量提交
   */
  import { ref, reactive, computed, onMounted, onActivated } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage, ElMessageBox, ElTable } from 'element-plus'
  import { Search, Refresh, Plus, Promotion } from '@element-plus/icons-vue'
  import type { RectificationAdjustment, AdjustApprovalRecord } from '@/types/audit-decision'
  import AdjustmentEditDrawer from './components/AdjustmentEditDrawer.vue'
  import {
    getAdjustmentList,
    getAdjustmentUnitOptions,
    getAdjustmentApprovalRecords,
    withdrawAdjustment,
    submitAdjustment,
    deleteAdjustment,
    type AdjustmentQuery
  } from '@/api/audit-decision'

  const router = useRouter()

  // 审批状态文案映射：1-待提交 2-审批中 3-已通过 4-已驳回（撤回后回到待提交）
  const statusTextMap: Record<number, string> = {
    1: '待提交',
    2: '审批中',
    3: '已通过',
    4: '已驳回'
  }

  // 状态标签颜色
  const statusTagType = (status: number) => {
    return ({ 1: 'info', 2: 'primary', 3: 'success', 4: 'danger' }[status] ?? 'info') as
      | 'info'
      | 'primary'
      | 'success'
      | 'danger'
  }

  // 提交单位下拉选项
  const unitOptions = ref<string[]>([])

  // 查询参数
  const queryParams = reactive<AdjustmentQuery>({
    projectName: '',
    approvalStatus: null,
    applyUnit: '',
    page: 1,
    pageSize: 20
  })

  // 表格数据
  const tableData = ref<RectificationAdjustment[]>([])
  const total = ref(0)
  const loading = ref(false)

  // 表格多选
  const tableRef = ref<InstanceType<typeof ElTable>>()
  const selectedRows = ref<RectificationAdjustment[]>([])
  // 勾选中可提交的（待提交态）申请
  const selectedSubmittable = computed(() =>
    selectedRows.value.filter((r) => r.approvalStatus === 1)
  )

  // 仅待提交(状态1)行可勾选
  const rowSelectable = (row: RectificationAdjustment) => row.approvalStatus === 1

  // 勾选变化
  const handleSelectionChange = (rows: RectificationAdjustment[]) => {
    selectedRows.value = rows
  }

  // 审批记录弹窗
  const recordsVisible = ref(false)
  const approvalRecords = ref<AdjustApprovalRecord[]>([])

  // 新增/编辑抽屉
  const editDrawerVisible = ref(false)
  const editingId = ref<number | null>(null)

  // 待提交/已驳回可编辑
  const canEdit = (row: RectificationAdjustment) => {
    return row.approvalStatus === 1 || row.approvalStatus === 4
  }

  // 获取列表数据
  const fetchData = async () => {
    loading.value = true
    try {
      const res = await getAdjustmentList(queryParams)
      tableData.value = res.data.list
      total.value = res.data.total
    } catch {
      ElMessage.error('获取调整申请列表失败')
    } finally {
      loading.value = false
    }
  }

  // 获取提交单位下拉选项
  const fetchUnitOptions = async () => {
    try {
      const res = await getAdjustmentUnitOptions()
      unitOptions.value = res.data || []
    } catch {
      // 选项获取失败不阻塞列表
    }
  }

  // 查询
  const handleQuery = () => {
    queryParams.page = 1
    fetchData()
  }

  // 重置筛选
  const handleReset = () => {
    queryParams.projectName = ''
    queryParams.approvalStatus = null
    queryParams.applyUnit = ''
    queryParams.page = 1
    fetchData()
  }

  // 新增调整申请（打开抽屉）
  const handleAdd = () => {
    editingId.value = null
    editDrawerVisible.value = true
  }

  // 查看详情
  const handleView = (row: RectificationAdjustment) => {
    router.push({
      path: '/audit-decision/rectification-unit/adjustment-detail',
      query: { id: row.id }
    })
  }

  // 编辑（打开抽屉）
  const handleEdit = (row: RectificationAdjustment) => {
    editingId.value = row.id
    editDrawerVisible.value = true
  }

  // 撤回
  const handleWithdraw = async (row: RectificationAdjustment) => {
    await ElMessageBox.confirm('确定要撤回该调整申请吗？撤回后将回到待提交状态。', '提示', {
      type: 'warning'
    })
    try {
      await withdrawAdjustment(row.id)
      ElMessage.success('撤回成功')
      fetchData()
    } catch {
      ElMessage.error('撤回失败')
    }
  }

  // 单行提交（待提交 → 审批中）
  const handleSubmit = async (row: RectificationAdjustment) => {
    await ElMessageBox.confirm('确定要提交该调整申请进入审批吗？', '提示', { type: 'warning' })
    try {
      await submitAdjustment([row.id])
      ElMessage.success('提交成功')
      fetchData()
    } catch {
      ElMessage.error('提交失败')
    }
  }

  // 批量提交（勾选的待提交申请）
  const handleBatchSubmit = async () => {
    const ids = selectedSubmittable.value.map((r) => r.id)
    if (!ids.length) return
    await ElMessageBox.confirm(`确定要提交选中的 ${ids.length} 条调整申请吗？`, '提示', {
      type: 'warning'
    })
    try {
      await submitAdjustment(ids)
      ElMessage.success('提交成功')
      tableRef.value?.clearSelection()
      fetchData()
    } catch {
      ElMessage.error('提交失败')
    }
  }

  // 删除
  const handleDelete = async (row: RectificationAdjustment) => {
    await ElMessageBox.confirm('确定要删除该待提交申请吗？', '提示', { type: 'warning' })
    try {
      await deleteAdjustment(row.id)
      ElMessage.success('删除成功')
      fetchData()
    } catch {
      ElMessage.error('删除失败')
    }
  }

  // 查看审批记录
  const handleApprovalRecords = async (row: RectificationAdjustment) => {
    try {
      const res = await getAdjustmentApprovalRecords(row.id)
      approvalRecords.value = (res.data || []) as AdjustApprovalRecord[]
      recordsVisible.value = true
    } catch {
      ElMessage.error('获取审批记录失败')
    }
  }

  // 初始化
  onMounted(() => {
    fetchData()
    fetchUnitOptions()
  })

  // keepAlive 返回时刷新（编辑/详情返回后同步最新数据）
  onActivated(() => {
    fetchData()
  })
</script>

<style scoped lang="scss">
  .adjustment-list-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 16px;
    background: #fff;
    border-radius: 12px;
  }

  .filter-section {
    margin-bottom: 12px;

    :deep(.el-form-item) {
      margin-bottom: 8px;
    }
  }

  /* 操作栏 */
  .action-bar {
    margin-bottom: 12px;
  }

  .table-section {
    flex: 1;
    overflow: hidden;
  }

  .pagination-section {
    display: flex;
    justify-content: flex-end;
    padding-top: 16px;
  }

  /* 审批记录时间线 */
  .record-level {
    font-weight: 600;
    color: #303133;
  }

  .record-result {
    margin: 4px 0;
    font-size: 13px;
    color: #606266;

    .pass {
      color: #67c23a;
    }

    .reject {
      color: #f56c6c;
    }
  }

  .record-opinion {
    font-size: 13px;
    color: #606266;
  }
</style>
