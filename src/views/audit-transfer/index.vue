<template>
  <PageContainer>
    <div class="audit-transfer-container">
      <!-- 筛选区域 -->
      <el-card class="filter-card">
        <el-form :model="queryParams" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="移送文书名称">
                <el-input
                  v-model="queryParams.transferName"
                  placeholder="请输入移送文书名称"
                  clearable
                  @keyup.enter="handleQuery"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="移送文书文号">
                <el-input
                  v-model="queryParams.transferCode"
                  placeholder="请输入移送文书文号"
                  clearable
                  @keyup.enter="handleQuery"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="移送类型">
                <el-select
                  v-model="queryParams.transferType"
                  placeholder="请选择移送类型"
                  clearable
                  style="width: 100%"
                >
                  <el-option label="事项" :value="1" />
                  <el-option label="人员" :value="2" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="主送部门">
                <el-input
                  v-model="queryParams.mainRecipient"
                  placeholder="请输入主送部门"
                  clearable
                  @keyup.enter="handleQuery"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="反馈状态">
                <el-select
                  v-model="queryParams.feedbackStatus"
                  placeholder="请选择反馈状态"
                  clearable
                  style="width: 100%"
                >
                  <el-option label="未反馈" :value="1" />
                  <el-option label="已反馈" :value="2" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="文书出具时间">
                <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
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
            </el-col>
          </el-row>
        </el-form>
      </el-card>

      <!-- 表格区域 -->
      <el-card class="table-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">审计移送列表</span>
            <div class="card-actions">
              <el-button type="primary" @click="handleAdd">
                <el-icon><Plus /></el-icon>
                新增
              </el-button>
              <el-button @click="handleExport">
                <el-icon><Download /></el-icon>
                导出
              </el-button>
            </div>
          </div>
        </template>

        <el-table
          v-loading="loading"
          :data="tableData"
          height="100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="50" />
          <el-table-column
            prop="transferName"
            label="移送文书名称"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column prop="transferCode" label="移送文书文号" width="150" />
          <el-table-column prop="issueDate" label="文书出具时间" width="120" />
          <el-table-column
            prop="responsibleUnit"
            label="责任单位"
            width="150"
            show-overflow-tooltip
          />
          <el-table-column prop="transferType" label="移送类型" width="100" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.transferType === 1" type="info">事项</el-tag>
              <el-tag v-else type="warning">人员</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="mainRecipient"
            label="主送部门"
            width="150"
            show-overflow-tooltip
          />
          <el-table-column prop="personnelCount" label="移送人员数量" width="120" align="center" />
          <el-table-column prop="feedbackStatus" label="反馈状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.feedbackStatus === 1" type="info">未反馈</el-tag>
              <el-tag v-else type="success">已反馈</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdBy" label="创建人" width="100" />
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column label="操作" width="250" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleView(row)">
                <el-icon><View /></el-icon>
                查看
              </el-button>
              <el-button link type="primary" @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button link type="primary" @click="handleFeedback(row)">
                <el-icon><ChatDotRound /></el-icon>
                反馈
              </el-button>
              <el-button link type="danger" @click="handleDelete(row)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchList"
          @current-change="fetchList"
        />
      </el-card>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
  /**
   * 审计移送列表页面
   * 展示审计移送记录，支持筛选、新增、编辑、删除、查看详情、反馈等操作
   */
  import { ref, reactive, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    Search,
    Refresh,
    Plus,
    Download,
    View,
    Edit,
    ChatDotRound,
    Delete
  } from '@element-plus/icons-vue'
  import { useRouter } from 'vue-router'
  import type { AuditTransfer, AuditTransferQuery } from '@/types/audit-transfer'
  import { getAuditTransferList, deleteAuditTransfer } from '@/api/audit-transfer'

  const router = useRouter()

  // 加载状态
  const loading = ref(false)

  // 查询参数
  const queryParams = reactive<AuditTransferQuery>({
    transferName: '',
    transferCode: '',
    transferType: null,
    mainRecipient: '',
    feedbackStatus: null,
    page: 1,
    pageSize: 20
  })

  // 日期范围
  const dateRange = ref<[string, string] | null>(null)

  // 表格数据
  const tableData = ref<AuditTransfer[]>([])
  const total = ref(0)

  // 选中的行
  const selectedRows = ref<AuditTransfer[]>([])

  // 获取列表数据
  const fetchList = async () => {
    loading.value = true
    try {
      // 处理日期范围
      if (dateRange.value) {
        queryParams.issueDateStart = dateRange.value[0]
        queryParams.issueDateEnd = dateRange.value[1]
      } else {
        queryParams.issueDateStart = undefined
        queryParams.issueDateEnd = undefined
      }

      const res = await getAuditTransferList(queryParams)
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
    queryParams.page = 1
    fetchList()
  }

  // 重置
  const handleReset = () => {
    queryParams.transferName = ''
    queryParams.transferCode = ''
    queryParams.transferType = null
    queryParams.mainRecipient = ''
    queryParams.feedbackStatus = null
    dateRange.value = null
    queryParams.page = 1
    fetchList()
  }

  // 新增
  const handleAdd = () => {
    router.push('/audit-transfer/add')
  }

  // 编辑
  const handleEdit = (row: AuditTransfer) => {
    router.push(`/audit-transfer/edit?id=${row.id}`)
  }

  // 查看详情
  const handleView = (row: AuditTransfer) => {
    router.push(`/audit-transfer/detail?id=${row.id}`)
  }

  // 反馈
  const handleFeedback = (row: AuditTransfer) => {
    router.push(`/audit-transfer/feedback?id=${row.id}`)
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

  // 导出
  const handleExport = () => {
    ElMessage.info('导出功能开发中')
  }

  // 表格选择变化
  const handleSelectionChange = (rows: AuditTransfer[]) => {
    selectedRows.value = rows
  }

  // 初始化
  onMounted(() => {
    fetchList()
  })
</script>

<style scoped lang="scss">
  .audit-transfer-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
  }

  .filter-card {
    border: none;
    border-radius: 12px;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 5%);

    :deep(.el-card__body) {
      padding: 20px;
    }

    :deep(.el-form-item) {
      margin-bottom: 0;
    }
  }

  .table-card {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
    border: none;
    border-radius: 12px;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 5%);

    :deep(.el-card__header) {
      padding: 20px;
      border-bottom: 1px solid #f0f0f0;
    }

    :deep(.el-card__body) {
      display: flex;
      flex: 1;
      flex-direction: column;
      padding: 20px;
      overflow: hidden;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }

      .card-actions {
        display: flex;
        gap: 12px;
      }
    }

    :deep(.el-table) {
      flex: 1;
      overflow: auto;
    }

    :deep(.el-pagination) {
      justify-content: flex-end;
      margin-top: 16px;
    }
  }
</style>
