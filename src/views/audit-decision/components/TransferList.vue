<template>
  <div class="transfer-list-container">
    <!-- 筛选区域 -->
    <el-form :model="queryParams" inline class="filter-form">
      <el-form-item label="文书名称">
        <el-input
          v-model="queryParams.transferName"
          placeholder="请输入文书名称"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="主送部门">
        <el-select
          v-model="queryParams.mainRecipient"
          placeholder="请选择"
          clearable
          style="width: 180px"
        >
          <el-option
            v-for="item in MAIN_RECIPIENT_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="责任单位">
        <el-tree-select
          v-model="queryParams.responsibleUnit"
          :data="departmentTreeOptions"
          :props="{ label: 'name' }"
          node-key="name"
          placeholder="请选择"
          clearable
          check-strictly
          :render-after-expand="false"
          style="width: 180px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleAdd">+ 新增</el-button>
        <span class="batch-submit-wrapper">
          <el-button type="primary" plain @click="handleBatchSubmit">批量提交</el-button>
          <span
            class="batch-submit-badge"
            @click.stop="batchSubmitTipVisible = !batchSubmitTipVisible"
            >4</span
          >
        </span>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <el-table
      :data="tableData"
      v-loading="loading"
      style="margin-top: 16px"
      :row-class-name="rowClassName"
    >
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
            <span class="seq-num">{{
              (queryParams.page - 1) * queryParams.pageSize + $index + 1
            }}</span>
            <el-checkbox
              class="seq-check"
              :model-value="selectedIds.includes(row.id)"
              @change="(val) => handleCheckRow(row.id, !!val)"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="transferName"
        label="移送文书名称"
        min-width="200"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <el-button link type="primary" @click="handleView(row)">
            {{ row.transferName }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column prop="transferCode" label="移送文书文号" width="150" />
      <el-table-column prop="mainRecipient" label="主送部门" width="150" />
      <el-table-column prop="transferType" label="移送类型" width="100" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.transferType === 1" type="info">事项</el-tag>
          <el-tag v-else type="warning">人员</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="responsibleUnit" label="责任单位" width="150" show-overflow-tooltip />
      <el-table-column
        prop="reviewStatus"
        label="状态"
        width="160"
        align="left"
        label-class-name="col-transfer-review-status-header"
      >
        <template #header>
          <span class="status-header-cell">
            状态
            <span
              class="status-header-badge"
              @click.stop="statusHeaderTipVisible = !statusHeaderTipVisible"
              >3</span
            >
          </span>
        </template>
        <template #default="{ row }">
          <span class="status-cell">
            <el-tag v-if="row.reviewStatus === 1" type="info">待提交</el-tag>
            <el-tag v-else-if="row.reviewStatus === 2" type="warning">待审批</el-tag>
            <el-tag v-else-if="row.reviewStatus === 3" type="primary">待反馈</el-tag>
            <el-tag v-else-if="row.reviewStatus === 4" type="danger">已退回</el-tag>
            <el-tag v-else-if="row.reviewStatus === 5" type="success">已反馈</el-tag>
            <span
              v-if="row.reviewStatus === 5"
              class="status-tip-badge"
              @click.stop="feedbackedTipVisible = !feedbackedTipVisible"
              >5</span
            >
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <!-- 待反馈/已反馈：仅显示移送反馈，不显示编辑/删除 -->
          <el-button
            v-if="row.reviewStatus === 3 || row.reviewStatus === 5"
            link
            type="primary"
            @click="handleFeedback(row)"
            >移送反馈</el-button
          >
          <!-- 其他状态：显示编辑/提交/删除；待审批时编辑/删除禁用 -->
          <template v-else>
            <el-button
              link
              type="primary"
              :disabled="row.reviewStatus === 2"
              @click="handleEdit(row)"
              >编辑</el-button
            >
            <el-button
              v-if="row.reviewStatus === 1 || row.reviewStatus === 4"
              link
              type="primary"
              @click="handleSubmit(row)"
              >提交</el-button
            >
            <el-button
              link
              type="danger"
              :disabled="row.reviewStatus === 2"
              @click="handleDelete(row)"
              >删除</el-button
            >
          </template>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="queryParams.page"
      v-model:page-size="queryParams.pageSize"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      style="justify-content: flex-end; margin-top: 16px"
      @size-change="fetchList"
      @current-change="fetchList"
    />

    <!-- 新增/编辑抽屉 -->
    <TransferDrawer
      v-model="drawerVisible"
      :transfer-id="currentTransferId"
      @success="handleDrawerSuccess"
    />

    <!-- 详情抽屉 -->
    <TransferDetailDrawer v-model="detailDrawerVisible" :transfer-id="detailTransferId" />

    <!-- 反馈抽屉 -->
    <FeedbackDrawer
      v-model="feedbackDrawerVisible"
      :transfer-id="feedbackTransferId"
      @success="handleFeedbackSuccess"
    />

    <!-- 批量提交批注详情面板 -->
    <Teleport to="body">
      <AnnotationPanel
        v-if="batchSubmitTipVisible"
        :annotation="batchSubmitAnnotation"
        :index="3"
        :edit-mode="false"
        @close="batchSubmitTipVisible = false"
      />
      <AnnotationPanel
        v-if="feedbackedTipVisible"
        :annotation="feedbackedAnnotation"
        :index="4"
        :edit-mode="false"
        @close="feedbackedTipVisible = false"
      />
      <AnnotationPanel
        v-if="statusHeaderTipVisible"
        :annotation="statusHeaderAnnotation"
        :index="2"
        :edit-mode="false"
        @close="statusHeaderTipVisible = false"
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
  /**
   * 移送清单组件
   * 在项目详情页面中展示该项目的审计移送列表
   */
  import { ref, computed, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { AuditTransfer, AuditTransferQuery } from '@/types/audit-transfer'
  import {
    getAuditTransferList,
    deleteAuditTransfer,
    submitAuditTransfer
  } from '@/api/audit-transfer'
  import TransferDrawer from '@/views/audit-transfer/components/TransferDrawer.vue'
  import TransferDetailDrawer from '@/views/audit-transfer/components/TransferDetailDrawer.vue'
  import FeedbackDrawer from '@/views/audit-transfer/components/FeedbackDrawer.vue'
  import AnnotationPanel from '@/components/Annotation/AnnotationPanel.vue'
  import type { AnnotationItem } from '@/components/Annotation/types'
  import { getDepartmentList } from '@/api/organization'

  // Props
  interface Props {
    projectId: number
  }

  defineProps<Props>()

  // 加载状态
  const loading = ref(false)

  // 主送部门字典（与移送维护一致：纪委监察部门 / 公安检察机关 / 主管部门 / 其他）
  const MAIN_RECIPIENT_OPTIONS = [
    { label: '纪委监察部门', value: '纪委监察部门' },
    { label: '公安检察机关', value: '公安检察机关' },
    { label: '主管部门', value: '主管部门' },
    { label: '其他', value: '其他' }
  ]

  // 责任单位机构树（与移送维护抽屉同源）
  const departmentTreeOptions = ref<any[]>([])
  const loadDepartmentTree = async () => {
    try {
      const res = await getDepartmentList()
      departmentTreeOptions.value = res.data || []
    } catch {
      departmentTreeOptions.value = []
    }
  }
  loadDepartmentTree()

  // 查询参数
  const queryParams = ref<AuditTransferQuery>({
    transferName: '',
    mainRecipient: '',
    responsibleUnit: '',
    page: 1,
    pageSize: 20
  })

  // 表格数据
  const tableData = ref<AuditTransfer[]>([])
  const total = ref(0)

  // 抽屉状态
  const drawerVisible = ref(false)
  const currentTransferId = ref<number>()

  // 详情抽屉状态
  const detailDrawerVisible = ref(false)
  const detailTransferId = ref<number>()

  // 反馈抽屉状态
  const feedbackDrawerVisible = ref(false)
  const feedbackTransferId = ref<number>()

  // 已勾选的行ID（勾选列与序号列合并，自行管理选中态）
  const selectedIds = ref<(number | string)[]>([])

  // 全选态：当前页全部勾选时为 true
  const allChecked = computed(
    () => tableData.value.length > 0 && selectedIds.value.length === tableData.value.length
  )
  // 半选态：部分勾选
  const isIndeterminate = computed(
    () => selectedIds.value.length > 0 && selectedIds.value.length < tableData.value.length
  )

  // 表头全选/取消全选
  const handleCheckAll = (val: boolean | string | number) => {
    selectedIds.value = val ? tableData.value.map((item) => item.id) : []
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
  const rowClassName = ({ row }: { row: AuditTransfer }) => {
    return selectedIds.value.includes(row.id) ? 'row-checked' : ''
  }

  // 已勾选的完整行数据（批量提交使用）
  const selectedRows = computed(() =>
    tableData.value.filter((item) => selectedIds.value.includes(item.id))
  )

  // 批量提交批注（项目详情页第 4 个批注）
  const batchSubmitTipVisible = ref(false)
  const batchSubmitAnnotation: AnnotationItem = {
    id: 'transfer-batch-submit-tip',
    type: 'position',
    selector: '',
    position: { x: 0, y: 0 },
    title: '批量提交规则',
    content: '不勾选指定数据时，默认提交所有待提交的数据。提交后操作列的按钮禁用。',
    category: 'rule',
    source: '',
    createdAt: '2026-05-28'
  }

  // 已反馈状态批注（项目详情页第 5 个批注）
  const feedbackedTipVisible = ref(false)
  const feedbackedAnnotation: AnnotationItem = {
    id: 'transfer-feedbacked-tip',
    type: 'position',
    selector: '',
    position: { x: 0, y: 0 },
    title: '已反馈状态说明',
    content:
      '多次进入"移送反馈"按钮时，反馈页面回显上一次保存过的内容，可以在已有内容的基础上编辑。',
    category: 'rule',
    source: '',
    createdAt: '2026-05-28'
  }

  // 状态列表头批注（项目详情页第 3 个批注）
  const statusHeaderTipVisible = ref(false)
  const statusHeaderAnnotation: AnnotationItem = {
    id: 'transfer-status-header-tip',
    type: 'position',
    selector: '',
    position: { x: 0, y: 0 },
    title: '移送清单状态列说明',
    content:
      '状态分为五种：\n\n- **待提交**：保存未提交，可编辑和删除\n- **待审批**：已提交未审批，编辑和删除禁用\n- **已退回**：审批退回，可编辑和删除\n- **待反馈**：审核通过、未维护移送反馈信息，可维护移送反馈\n- **已反馈**：已保存移送反馈信息，可维护移送反馈',
    category: 'rule',
    source: '',
    createdAt: '2026-05-29'
  }

  // 获取列表数据
  const fetchList = async () => {
    loading.value = true
    try {
      const res = await getAuditTransferList(queryParams.value)
      tableData.value = res.data.list
      total.value = res.data.total
      selectedIds.value = []
    } catch {
      ElMessage.error('获取列表失败')
    } finally {
      loading.value = false
    }
  }

  // 查询
  const handleQuery = () => {
    queryParams.value.page = 1
    fetchList()
  }

  // 重置
  const handleReset = () => {
    queryParams.value.transferName = ''
    queryParams.value.mainRecipient = ''
    queryParams.value.responsibleUnit = ''
    queryParams.value.page = 1
    fetchList()
  }

  // 新增
  const handleAdd = () => {
    currentTransferId.value = undefined
    drawerVisible.value = true
  }

  // 编辑
  const handleEdit = (row: AuditTransfer) => {
    currentTransferId.value = row.id
    drawerVisible.value = true
  }

  // 查看详情
  const handleView = (row: AuditTransfer) => {
    detailTransferId.value = row.id
    detailDrawerVisible.value = true
  }

  // 移送反馈
  const handleFeedback = (row: AuditTransfer) => {
    feedbackTransferId.value = row.id
    feedbackDrawerVisible.value = true
  }

  // 删除
  const handleDelete = async (row: AuditTransfer) => {
    try {
      await ElMessageBox.confirm(`确定要删除移送记录"${row.transferName}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await deleteAuditTransfer(row.id)
      ElMessage.success('删除成功')
      fetchList()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
      }
    }
  }

  // 单条提交：仅待提交（1）/已退回（4）状态可提交
  const handleSubmit = async (row: AuditTransfer) => {
    try {
      await ElMessageBox.confirm('确定要提交该移送记录进入审批流程吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await submitAuditTransfer(row.id)
      ElMessage.success('提交成功')
      fetchList()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('提交失败')
      }
    }
  }

  // 批量提交：勾选时只提交勾选中处于待提交/已退回的；未勾选时默认提交所有待提交/已退回的
  const handleBatchSubmit = async () => {
    const submittable = (
      selectedRows.value.length > 0 ? selectedRows.value : tableData.value
    ).filter((d) => d.reviewStatus === 1 || d.reviewStatus === 4)

    if (submittable.length === 0) {
      ElMessage.warning('没有可提交的数据')
      return
    }

    try {
      await ElMessageBox.confirm(
        `确定要提交 ${submittable.length} 条移送记录进入审批流程吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      let success = 0
      let fail = 0
      for (const row of submittable) {
        try {
          await submitAuditTransfer(row.id)
          success++
        } catch {
          fail++
        }
      }
      ElMessage.success(`批量提交完成，成功${success}条${fail > 0 ? `，失败${fail}条` : ''}`)
      fetchList()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('批量提交失败')
      }
    }
  }

  // 抽屉成功回调
  const handleDrawerSuccess = () => {
    fetchList()
  }

  // 反馈成功回调
  const handleFeedbackSuccess = () => {
    fetchList()
  }

  // 初始化
  onMounted(() => {
    fetchList()
  })
</script>

<style scoped lang="scss">
  .transfer-list-container {
    padding: 20px;
    background: #fff;
    border-radius: 8px;

    .filter-form {
      :deep(.el-form-item) {
        margin-bottom: 0;
      }
    }
  }

  /* 状态单元格内联布局 */
  .status-cell {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  /* 状态列表头批注徽章 */
  .status-header-cell {
    display: inline-flex;
    gap: 4px;
    align-items: center;
  }

  .status-header-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    font-size: 11px;
    font-weight: 600;
    line-height: 1;
    color: #fff;
    cursor: pointer;
    user-select: none;
    background: #1677ff;
    border-radius: 50%;
  }

  /* 状态后批注徽章：绝对定位到状态标签右外侧，不影响列表左对齐 */
  .status-tip-badge {
    position: absolute;
    top: 50%;
    left: calc(100% + 4px);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    font-size: 11px;
    font-weight: 600;
    line-height: 1;
    color: #fff;
    cursor: pointer;
    user-select: none;
    background: #1677ff;
    border-radius: 50%;
    box-shadow: 0 2px 6px rgb(22 119 255 / 40%);
    transform: translateY(-50%);
  }

  /* 批量提交按钮 + 批注徽章 */
  .batch-submit-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
    margin-left: 12px;
  }

  .batch-submit-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    font-size: 11px;
    font-weight: 600;
    line-height: 1;
    color: #fff;
    cursor: pointer;
    user-select: none;
    background: #1677ff;
    border-radius: 50%;
    box-shadow: 0 2px 6px rgb(22 119 255 / 40%);
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
