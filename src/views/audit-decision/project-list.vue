<template>
  <PageContainer>
    <el-card>
      <!-- 筛选表单 -->
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
          <el-button type="primary" @click="handleAdd">+ 新建项目</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table :data="tableData" v-loading="loading" style="margin-top: 16px">
        <el-table-column type="index" label="序号" width="60" />
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
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
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

      <!-- 项目新增/编辑抽屉 -->
      <ProjectFormDrawer
        v-model="formDrawerVisible"
        :project-id="currentProjectId"
        @success="handleFormSuccess"
      />
    </el-card>
  </PageContainer>
</template>

<script setup lang="ts">
  /**
   * 整改项目列表页面
   * 只展示项目列表，点击项目名称进入详情
   */
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage, ElMessageBox } from 'element-plus'
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
  :deep(.el-card) {
    border: none;
    border-radius: 12px;
    box-shadow: none;
  }
</style>
