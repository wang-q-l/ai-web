<template>
  <PageContainer>
    <!-- 筛选区域 -->
    <el-card class="filter-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="整改项目">
          <el-select
            v-model="queryParams.projectId"
            placeholder="请选择整改项目"
            clearable
            filterable
            style="width: 200px"
          >
            <el-option
              v-for="project in projectList"
              :key="project.id"
              :label="project.projectName"
              :value="project.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="决定文书名称">
          <el-input
            v-model="queryParams.decisionName"
            placeholder="请输入决定文书名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="决定文书文号">
          <el-input
            v-model="queryParams.decisionCode"
            placeholder="请输入决定文书文号"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select
            v-model="queryParams.reviewStatus"
            placeholder="请选择审核状态"
            clearable
            style="width: 150px"
          >
            <el-option label="草稿" :value="1" />
            <el-option label="审核中" :value="2" />
            <el-option label="审核通过" :value="3" />
            <el-option label="已退回" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="下达状态">
          <el-select
            v-model="queryParams.issueStatus"
            placeholder="请选择下达状态"
            clearable
            style="width: 150px"
          >
            <el-option label="未下达" :value="0" />
            <el-option label="已下达" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="整改状态">
          <el-select
            v-model="queryParams.rectificationStatus"
            placeholder="请选择整改状态"
            clearable
            style="width: 150px"
          >
            <el-option label="未整改" :value="1" />
            <el-option label="整改中" :value="2" />
            <el-option label="已整改" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮区域 -->
    <el-card class="toolbar-card">
      <el-button type="primary" @click="handleAdd">新增决定</el-button>
      <el-button @click="handleExport">导出</el-button>
    </el-card>

    <!-- 表格区域 -->
    <el-card class="table-card">
      <el-table :data="tableData" height="100%" v-loading="loading">
        <el-table-column
          prop="projectName"
          label="整改项目"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column
          prop="decisionName"
          label="决定文书名称"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column prop="decisionCode" label="决定文书文号" width="150" />
        <el-table-column prop="issueDate" label="文书出具时间" width="120" />
        <el-table-column prop="involvedAmount" label="涉及金额(元)" width="160" align="right">
          <template #default="{ row }">
            {{ (row.involvedAmount * 10000).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="problemCount" label="涉及问题数" width="110" align="center" />
        <el-table-column
          prop="mainRecipient"
          label="决定主送部门"
          width="150"
          show-overflow-tooltip
        />
        <el-table-column
          prop="responsibleUnit"
          label="整改责任单位"
          width="150"
          show-overflow-tooltip
        />
        <el-table-column prop="rectificationDeadline" label="整改期限" width="120" />
        <el-table-column prop="reviewStatus" label="审核状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.reviewStatus === 1" type="info">草稿</el-tag>
            <el-tag v-else-if="row.reviewStatus === 2" type="warning">审核中</el-tag>
            <el-tag v-else-if="row.reviewStatus === 3" type="success">审核通过</el-tag>
            <el-tag v-else type="danger">已退回</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="issueStatus" label="下达状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.issueStatus === 0" type="info">未下达</el-tag>
            <el-tag v-else type="success">已下达</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="rectificationStatus" width="140" label="整改状态">
          <template #default="{ row }">
            <el-tag v-if="row.rectificationStatus === 1" type="danger">未整改</el-tag>
            <el-tag v-else-if="row.rectificationStatus === 2" type="warning">整改中</el-tag>
            <el-tag v-else type="success">已整改</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdBy" label="创建人" width="100" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button
              v-if="row.reviewStatus === 1 || row.reviewStatus === 4"
              link
              type="primary"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button v-if="row.reviewStatus === 1" link type="danger" @click="handleDelete(row)">
              删除
            </el-button>
            <el-button
              v-if="row.reviewStatus === 1 || row.reviewStatus === 4"
              link
              type="primary"
              @click="handleSubmitReview(row)"
            >
              提交审核
            </el-button>
            <el-button v-if="row.reviewStatus === 2" link type="primary" @click="handleReview(row)">
              审核
            </el-button>
            <el-button
              v-if="row.reviewStatus === 3 && row.issueStatus === 0"
              link
              type="primary"
              @click="handleIssue(row)"
            >
              下达
            </el-button>
            <el-button
              v-if="row.reviewStatus === 3 && row.issueStatus === 1"
              link
              type="primary"
              @click="handleViewRectification(row)"
            >
              整改情况
            </el-button>
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
        @size-change="fetchData"
        @current-change="fetchData"
      />
    </el-card>

    <!-- 审核弹窗 -->
    <el-dialog v-model="reviewDialogVisible" title="审核审计决定" width="600px">
      <el-form ref="reviewFormRef" :model="reviewForm" :rules="reviewRules" label-width="100px">
        <el-form-item label="审核结果" prop="reviewResult">
          <el-radio-group v-model="reviewForm.reviewResult">
            <el-radio :value="1">通过</el-radio>
            <el-radio :value="2">不通过</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见" prop="reviewOpinion">
          <el-input
            v-model="reviewForm.reviewOpinion"
            type="textarea"
            :rows="4"
            placeholder="请输入审核意见"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleReviewSubmit" :loading="reviewSubmitLoading">
          提交
        </el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script setup lang="ts">
  /**
   * 审计决定列表页面
   * 提供审计决定的列表展示、新增、编辑、删除、提交审核、审核、下达等功能
   */
  import { ref, reactive, onMounted } from 'vue'
  import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
  import type {
    AuditDecision,
    AuditDecisionQuery,
    RectificationProject
  } from '@/types/audit-decision'
  import {
    getAuditDecisionList,
    deleteAuditDecision,
    submitForReview,
    reviewDecision,
    issueDecision,
    getRectificationProjectList
  } from '@/api/audit-decision'
  import { useRouter } from 'vue-router'

  const router = useRouter()

  // 查询参数
  const queryParams = reactive<AuditDecisionQuery>({
    projectId: null,
    decisionName: '',
    decisionCode: '',
    reviewStatus: null,
    issueStatus: null,
    rectificationStatus: null,
    issueDateStart: '',
    issueDateEnd: '',
    createdAtStart: '',
    createdAtEnd: '',
    page: 1,
    pageSize: 20
  })

  // 表格数据
  const tableData = ref<AuditDecision[]>([])
  const total = ref(0)
  const loading = ref(false)

  // 项目列表（用于筛选）
  const projectList = ref<RectificationProject[]>([])

  // 审核弹窗
  const reviewDialogVisible = ref(false)
  const reviewFormRef = ref<FormInstance>()
  const reviewSubmitLoading = ref(false)
  const currentReviewId = ref(0)

  // 审核表单
  const reviewForm = reactive({
    reviewResult: 1,
    reviewOpinion: ''
  })

  // 审核表单验证规则
  const reviewRules: FormRules = {
    reviewResult: [{ required: true, message: '请选择审核结果', trigger: 'change' }],
    reviewOpinion: [{ required: true, message: '请输入审核意见', trigger: 'blur' }]
  }

  // 获取项目列表（用于筛选）
  const fetchProjectList = async () => {
    try {
      const res = await getRectificationProjectList({ page: 1, pageSize: 1000 } as any)
      projectList.value = res.data.list
    } catch (error) {
      console.error('获取项目列表失败', error)
    }
  }

  // 获取列表数据
  const fetchData = async () => {
    loading.value = true
    try {
      const res = await getAuditDecisionList(queryParams)
      tableData.value = res.data.list
      total.value = res.data.total
    } catch {
      ElMessage.error('获取数据失败')
    } finally {
      loading.value = false
    }
  }

  // 查询
  const handleQuery = () => {
    queryParams.page = 1
    fetchData()
  }

  // 重置
  const handleReset = () => {
    queryParams.projectId = null
    queryParams.decisionName = ''
    queryParams.decisionCode = ''
    queryParams.reviewStatus = null
    queryParams.issueStatus = null
    queryParams.rectificationStatus = null
    queryParams.issueDateStart = ''
    queryParams.issueDateEnd = ''
    queryParams.createdAtStart = ''
    queryParams.createdAtEnd = ''
    queryParams.page = 1
    fetchData()
  }

  // 新增
  const handleAdd = () => {
    router.push('/audit-decision/decision-add')
  }

  // 编辑
  const handleEdit = (row: AuditDecision) => {
    router.push({
      path: '/audit-decision/decision-edit',
      query: { id: row.id }
    })
  }

  // 查看详情
  const handleView = (row: AuditDecision) => {
    router.push({
      path: '/audit-decision/decision-detail',
      query: { id: row.id }
    })
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
      fetchData()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
      }
    }
  }

  // 提交审核
  const handleSubmitReview = async (row: AuditDecision) => {
    try {
      await ElMessageBox.confirm('确定要提交审核吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await submitForReview(row.id)
      ElMessage.success('提交成功')
      fetchData()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('提交失败')
      }
    }
  }

  // 审核
  const handleReview = (row: AuditDecision) => {
    currentReviewId.value = row.id
    reviewForm.reviewResult = 1
    reviewForm.reviewOpinion = ''
    reviewDialogVisible.value = true
  }

  // 提交审核意见
  const handleReviewSubmit = async () => {
    if (!reviewFormRef.value) return

    await reviewFormRef.value.validate(async (valid) => {
      if (!valid) return

      reviewSubmitLoading.value = true
      try {
        await reviewDecision(currentReviewId.value, reviewForm)
        ElMessage.success('审核成功')
        reviewDialogVisible.value = false
        fetchData()
      } catch {
        ElMessage.error('审核失败')
      } finally {
        reviewSubmitLoading.value = false
      }
    })
  }

  // 下达
  const handleIssue = async (row: AuditDecision) => {
    try {
      await ElMessageBox.confirm('确定要将该审计决定下达给被审计单位吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await issueDecision(row.id)
      ElMessage.success('下达成功')
      fetchData()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('下达失败')
      }
    }
  }

  // 查看整改情况
  const handleViewRectification = (row: AuditDecision) => {
    router.push({
      path: '/audit-decision/rectification-detail',
      query: { id: row.id }
    })
  }

  // 导出
  const handleExport = () => {
    ElMessage.info('导出功能开发中')
  }

  // 初始化
  onMounted(() => {
    fetchProjectList()
    fetchData()
  })
</script>

<style scoped lang="scss">
  .filter-card {
    margin-bottom: 16px;
  }

  .toolbar-card {
    margin-bottom: 16px;
  }

  .table-card {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;

    :deep(.el-card__body) {
      display: flex;
      flex: 1;
      flex-direction: column;
      overflow: hidden;
    }
  }

  .el-pagination {
    justify-content: flex-end;
    margin-top: 16px;
  }
</style>
