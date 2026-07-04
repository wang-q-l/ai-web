<template>
  <div class="rectification-project-page">
    <!-- 标题卡：页面标题 + 右侧主操作 -->
    <el-card class="header-card" shadow="never">
      <div class="header-inner">
        <span class="page-title">整改项目</span>
        <div class="header-actions">
          <el-button type="primary" :icon="Plus" @click="handleAdd">新建项目</el-button>
        </div>
      </div>
    </el-card>

    <!-- 内容卡：筛选栏 + 表格 + 分页栏 -->
    <el-card class="body-card" shadow="never">
      <!-- 筛选栏 -->
      <div class="filter-bar">
        <el-form :model="queryParams" inline>
          <el-form-item label="项目名称">
            <el-input
              v-model="queryParams.projectName"
              placeholder="请输入项目名称"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="项目编号">
            <el-input
              v-model="queryParams.projectCode"
              placeholder="请输入项目编号"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="被审计单位">
            <el-input
              v-model="queryParams.auditedUnit"
              placeholder="请输入被审计单位"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格：撑满内容卡剩余高度 -->
      <div class="table-wrap">
        <el-table :data="tableData" v-loading="loading" border height="100%" style="width: 100%">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="projectCode" label="项目编号" width="150" />
          <el-table-column prop="projectName" label="项目名称" min-width="200">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleViewDetail(row)">
                {{ row.projectName }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column prop="auditYear" label="审计年度" width="100" />
          <el-table-column prop="auditedUnit" label="被审计单位" min-width="180" />
          <el-table-column prop="auditTypeName" label="审计类型" width="120">
            <template #default="{ row }">
              <span>{{ getAuditTypeName(row.auditType) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="decisionCount" label="决定数量" width="100" align="center" />
          <el-table-column prop="transferCount" label="移送数量" width="100" align="center" />
          <el-table-column prop="statusName" label="项目状态" width="100">
            <template #default="{ row }">
              <el-tag v-if="row.projectStatus === 1" type="warning">进行中</el-tag>
              <el-tag v-else-if="row.projectStatus === 2" type="success">已完成</el-tag>
              <el-tag v-else type="info">已归档</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdBy" label="创建人" width="100" />
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column label="操作" width="160" align="center" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
              <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页栏：左侧总条数 + 右侧分页器 -->
      <div class="pagination-bar">
        <span class="total-text">共 {{ total }} 条数据</span>
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[20, 50, 100]"
          layout="sizes, prev, pager, next"
          background
          @size-change="fetchList"
          @current-change="fetchList"
        />
      </div>
    </el-card>

    <!-- 项目新增/编辑抽屉 -->
    <ProjectFormDrawer
      v-model="formDrawerVisible"
      :project-id="currentProjectId"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
  /**
   * 整改项目列表页面
   * 只展示项目列表，点击项目名称进入详情
   */
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Plus } from '@element-plus/icons-vue'
  import type { RectificationProject, RectificationProjectQuery } from '@/types/audit-decision'
  import { getRectificationProjectList, deleteRectificationProject } from '@/api/audit-decision'
  import ProjectFormDrawer from './project-form.vue'

  const router = useRouter()

  // 加载状态
  const loading = ref(false)

  // 查询参数
  const queryParams = ref<RectificationProjectQuery>({
    projectName: '',
    projectCode: '',
    auditedUnit: '',
    page: 1,
    pageSize: 20
  })

  // 表格数据
  const tableData = ref<RectificationProject[]>([])
  const total = ref(0)

  // 抽屉
  const formDrawerVisible = ref(false)
  const currentProjectId = ref<number | undefined>(undefined)

  // 审计类型映射
  const getAuditTypeName = (type: number) => {
    const map: Record<number, string> = {
      1: '财务审计',
      2: '合规审计',
      3: '绩效审计',
      4: '专项审计',
      5: '其他'
    }
    return map[type] || '-'
  }

  // 获取列表数据
  const fetchList = async () => {
    loading.value = true
    try {
      const res = await getRectificationProjectList(queryParams.value)
      tableData.value = res.data.list
      total.value = res.data.total
    } catch {
      ElMessage.error('获取项目列表失败')
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
      projectName: '',
      projectCode: '',
      auditedUnit: '',
      page: 1,
      pageSize: 20
    }
    fetchList()
  }

  // 新增项目
  const handleAdd = () => {
    currentProjectId.value = undefined
    formDrawerVisible.value = true
  }

  // 编辑项目
  const handleEdit = (row: RectificationProject) => {
    currentProjectId.value = row.id
    formDrawerVisible.value = true
  }

  // 抽屉操作成功回调
  const handleFormSuccess = () => {
    fetchList()
  }

  // 删除项目
  const handleDelete = async (row: RectificationProject) => {
    try {
      await ElMessageBox.confirm(`确定要删除项目"${row.projectName}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await deleteRectificationProject(row.id)
      ElMessage.success('删除成功')
      fetchList()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
      }
    }
  }

  // 查看详情
  const handleViewDetail = (row: RectificationProject) => {
    router.push({
      path: `/audit-decision/project/${row.id}`
    })
  }

  // 初始化
  onMounted(() => {
    fetchList()
  })
</script>

<style scoped lang="scss">
  /* 标准双卡片框架（参照审计项目模块） */
  .rectification-project-page {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-top: 20px;
  }

  /* ── 标题卡 ── */
  .header-card {
    flex-shrink: 0;
    border: none !important;
    border-radius: 12px;
    box-shadow: none !important;

    :deep(.el-card__body) {
      padding: 12px 20px;
    }
  }

  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .page-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .header-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  /* ── 内容卡 ── */
  .body-card {
    display: flex;
    flex-direction: column;

    /* 固定高度，仅卡内表格滚动，与审计项目模块保持一致 */
    height: calc(100vh - 60px - 20px - 44px - 16px - 20px - 40px);
    overflow: hidden;
    border: none !important;
    border-radius: 12px;
    box-shadow: none !important;

    :deep(.el-card__body) {
      display: flex;
      flex: 1;
      flex-direction: column;
      padding: 20px;
      overflow: hidden;
    }
  }

  /* 筛选栏 */
  .filter-bar {
    flex-shrink: 0;
    margin-bottom: 12px;

    :deep(.el-form-item) {
      margin-bottom: 0;
    }
  }

  /* 表格：撑满剩余高度 */
  .table-wrap {
    flex: 1;
    overflow: hidden;
  }

  /* 分页栏 */
  .pagination-bar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    margin-top: 16px;

    .total-text {
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }
  }
</style>
