<template>
  <div class="decision-list-wrapper">
    <!-- 筛选区域 -->
    <div class="filter-section">
      <el-form :model="queryParams" inline>
        <el-form-item label="请输入">
          <el-input
            v-model="queryParams.decisionName"
            placeholder="请输入"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="填报单位">
          <el-input
            v-model="queryParams.decisionName"
            placeholder="请输入"
            clearable
            style="width: 200px"
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
              >3</span
            >
          </span>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格区域 -->
    <div class="table-section">
      <el-table
        :data="tableData"
        height="100%"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="80" />
        <el-table-column
          prop="decisionName"
          label="审计决定文书名称"
          min-width="200"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">{{
              row.decisionName
            }}</el-button>
          </template>
        </el-table-column>
        <el-table-column
          prop="mainRecipient"
          label="审计决定主送部门"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column
          prop="problemCount"
          label="涉及的审计问题数量"
          width="160"
          align="center"
        />
        <el-table-column
          prop="involvedAmount"
          label="审计决定涉及金额(元)"
          width="180"
          align="right"
        >
          <template #default="{ row }">
            {{ (row.involvedAmount * 10000).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="legalBasis"
          label="审计决定定性依据"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column
          prop="penaltyOpinion"
          label="处理处罚意见"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column
          prop="rectificationStatus"
          label="审计决定整改进展"
          width="140"
          align="center"
          class-name="col-rectification-status"
          label-class-name="col-rectification-status-header"
        >
          <template #default="{ row }">
            <el-tag v-if="row.rectificationStatus === 1" type="danger">未整改</el-tag>
            <el-tag v-else-if="row.rectificationStatus === 2" type="warning">整改中</el-tag>
            <el-tag v-else type="success">已整改</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="reviewStatus"
          label="状态"
          width="100"
          align="center"
          label-class-name="col-review-status-header"
        >
          <template #default="{ row }">
            <el-tag v-if="row.reviewStatus === 1" type="info">待提交</el-tag>
            <el-tag v-else-if="row.reviewStatus === 2" type="warning">待审批</el-tag>
            <el-tag v-else-if="row.reviewStatus === 3 && row.issueStatus === 1" type="success"
              >已下达</el-tag
            >
            <el-tag v-else-if="row.reviewStatus === 3" type="primary">待下达</el-tag>
            <el-tag v-else type="danger">已退回</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right" align="left">
          <template #header>
            <span class="action-header">
              操作
              <span class="action-tip-badge" @click.stop="issueTipVisible = !issueTipVisible"
                >4</span
              >
            </span>
          </template>
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              :disabled="row.reviewStatus === 2 || row.reviewStatus === 3"
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
              v-if="row.reviewStatus === 3 && row.issueStatus !== 1"
              link
              type="primary"
              @click="handleIssue(row)"
              >下达</el-button
            >
            <el-button
              link
              type="danger"
              :disabled="row.reviewStatus === 2 || row.reviewStatus === 3"
              @click="handleDelete(row)"
              >删除</el-button
            >
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
        @size-change="fetchList"
        @current-change="fetchList"
      />
    </div>

    <!-- 新增/编辑抽屉 -->
    <DecisionDrawer
      v-model="drawerVisible"
      :decision-id="currentDecisionId"
      :project-id="props.projectId"
      @success="handleDrawerSuccess"
    />

    <!-- 批量提交批注详情面板 -->
    <Teleport to="body">
      <AnnotationPanel
        v-if="batchSubmitTipVisible"
        :annotation="batchSubmitAnnotation"
        :index="2"
        :edit-mode="false"
        @close="batchSubmitTipVisible = false"
      />
      <AnnotationPanel
        v-if="issueTipVisible"
        :annotation="issueAnnotation"
        :index="3"
        :edit-mode="false"
        @close="issueTipVisible = false"
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
  /**
   * 决定列表组件
   * 作为整改项目详情页的右侧内容区
   */
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { AuditDecision, AuditDecisionQuery } from '@/types/audit-decision'
  import {
    getAuditDecisionList,
    deleteAuditDecision,
    submitForReview,
    issueDecision
  } from '@/api/audit-decision'
  import DecisionDrawer from './DecisionDrawer.vue'
  import AnnotationPanel from '@/components/Annotation/AnnotationPanel.vue'
  import type { AnnotationItem } from '@/components/Annotation/types'

  // Props
  const props = defineProps<{
    projectId: number
  }>()

  const router = useRouter()

  // 加载状态
  const loading = ref(false)

  // 查询参数
  const queryParams = ref<AuditDecisionQuery>({
    projectId: props.projectId,
    decisionName: '',
    page: 1,
    pageSize: 20
  })

  // 表格数据
  const tableData = ref<AuditDecision[]>([])
  const total = ref(0)

  // 抽屉状态
  const drawerVisible = ref(false)
  const currentDecisionId = ref<number | undefined>(undefined)

  // 表格选中行
  const selectedRows = ref<AuditDecision[]>([])
  const handleSelectionChange = (rows: AuditDecision[]) => {
    selectedRows.value = rows
  }

  // 批量提交批注
  const batchSubmitTipVisible = ref(false)
  const batchSubmitAnnotation: AnnotationItem = {
    id: 'batch-submit-tip',
    type: 'position',
    selector: '',
    position: { x: 0, y: 0 },
    title: '批量提交规则',
    content: '不勾选指定数据时，默认提交所有待提交的数据。提交后操作列的按钮禁用。',
    category: 'rule',
    source: '',
    createdAt: '2026-05-28'
  }

  // 下达批注
  const issueTipVisible = ref(false)
  const issueAnnotation: AnnotationItem = {
    id: 'decision-issue-tip',
    type: 'position',
    selector: '',
    position: { x: 0, y: 0 },
    title: '下达',
    content:
      '当节点配置需要下达时，决定信息审批通过后显示下达按钮，下达操作同问题清单，下达记录的页面同问题清单，名称默认显示"审计决定"，不显示签收期限与签收时间两列。',
    category: 'rule',
    source: '',
    createdAt: '2026-05-29'
  }

  // 获取列表数据
  const fetchList = async () => {
    loading.value = true
    try {
      const res = await getAuditDecisionList(queryParams.value)
      tableData.value = res.data.list
      total.value = res.data.total
    } catch {
      ElMessage.error('获取决定列表失败')
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
    queryParams.value = {
      projectId: props.projectId,
      decisionName: '',
      page: 1,
      pageSize: 20
    }
    fetchList()
  }

  // 新增
  const handleAdd = () => {
    currentDecisionId.value = undefined
    drawerVisible.value = true
  }

  // 查看详情
  const handleView = (row: AuditDecision) => {
    router.push({
      path: '/audit-decision/decision-detail',
      query: { id: row.id, projectId: props.projectId }
    })
  }

  // 编辑
  const handleEdit = (row: AuditDecision) => {
    currentDecisionId.value = row.id
    drawerVisible.value = true
  }

  // 抽屉操作成功回调
  const handleDrawerSuccess = () => {
    fetchList()
  }

  // 删除
  const handleDelete = async (row: AuditDecision) => {
    try {
      await ElMessageBox.confirm('确定要删除该审计决定吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await deleteAuditDecision(row.id)
      ElMessage.success('删除成功')
      fetchList()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
      }
    }
  }

  // 单条提交：仅待提交（1）/已退回（4）状态可提交
  const handleSubmit = async (row: AuditDecision) => {
    try {
      await ElMessageBox.confirm('确定要提交该审计决定进入审核流程吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await submitForReview(row.id)
      ElMessage.success('提交成功')
      fetchList()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('提交失败')
      }
    }
  }

  // 下达：审批通过（reviewStatus=3）且未下达（issueStatus !== 1）时可下达
  const handleIssue = async (row: AuditDecision) => {
    try {
      await ElMessageBox.confirm('确定要下达该审计决定吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await issueDecision(row.id)
      ElMessage.success('下达成功')
      fetchList()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('下达失败')
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
        `确定要提交 ${submittable.length} 条审计决定进入审核流程吗？`,
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
          await submitForReview(row.id)
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

  // 初始化
  onMounted(() => {
    fetchList()
  })
</script>

<style scoped lang="scss">
  /* 操作列表头批注 */
  .action-header {
    display: inline-flex;
    gap: 4px;
    align-items: center;
  }

  .action-tip-badge {
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

  .decision-list-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 16px;
  }

  .filter-section {
    margin-bottom: 16px;

    :deep(.el-form) {
      .el-form-item {
        margin-bottom: 0;
      }
    }
  }

  /* 批量提交按钮 + 批注徽章包裹 */
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

  .info-banner {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 12px 16px;
    margin-bottom: 16px;
    font-size: 14px;
    color: #606266;
    background: #ecf5ff;
    border-radius: 8px;
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
</style>
