<template>
  <div class="transfer-list-container">
    <!-- 筛选区域 -->
    <el-form :model="queryParams" inline class="filter-form">
      <el-form-item label="请输入">
        <el-input
          v-model="queryParams.transferName"
          placeholder="请输入"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="填报单位">
        <el-input
          v-model="queryParams.mainRecipient"
          placeholder="请输入"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
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
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column type="index" label="序号" width="60" />
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
    </Teleport>
  </div>
</template>

<script setup lang="ts">
  /**
   * 移送清单组件
   * 在项目详情页面中展示该项目的审计移送列表
   */
  import { ref, onMounted } from 'vue'
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

  // Props
  interface Props {
    projectId: number
  }

  defineProps<Props>()

  // 加载状态
  const loading = ref(false)

  // 查询参数
  const queryParams = ref<AuditTransferQuery>({
    transferName: '',
    mainRecipient: '',
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

  // 表格选中行
  const selectedRows = ref<AuditTransfer[]>([])
  const handleSelectionChange = (rows: AuditTransfer[]) => {
    selectedRows.value = rows
  }

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

  // 获取列表数据
  const fetchList = async () => {
    loading.value = true
    try {
      const res = await getAuditTransferList(queryParams.value)
      tableData.value = res.data.list
      total.value = res.data.total
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
</style>
