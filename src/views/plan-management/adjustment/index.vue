<script setup lang="ts">
  // 计划调整页面
  import { ref, reactive, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Document, Refresh, Setting, Plus } from '@element-plus/icons-vue'

  const router = useRouter()

  // ==================== 筛选条件 ====================
  const query = reactive({
    title: '',
    year: '',
    status: '',
    page: 1,
    pageSize: 20
  })

  const yearOptions = [
    { label: '2025年', value: '2025' },
    { label: '2024年', value: '2024' },
    { label: '2023年', value: '2023' }
  ]

  const statusOptions = [
    { label: '待审核', value: 'pending' },
    { label: '审核中', value: 'reviewing' },
    { label: '已通过', value: 'approved' },
    { label: '已驳回', value: 'rejected' }
  ]

  // ==================== 示例数据 ====================
  interface AdjustmentItem {
    id: string
    title: string
    status: string
    year: string
    adjustCount: number
    submitter: string
    submitUnit: string
    submitTime: string
  }

  const mockData: AdjustmentItem[] = [
    {
      id: '1',
      title: '2025年度第一季度审计计划调整申请',
      status: 'approved',
      year: '2025',
      adjustCount: 3,
      submitter: '张明华',
      submitUnit: '财务审计部',
      submitTime: '2025-03-12 14:30'
    },
    {
      id: '2',
      title: '2025年专项资金审计项目增补申请',
      status: 'reviewing',
      year: '2025',
      adjustCount: 1,
      submitter: '李秀云',
      submitUnit: '经济责任审计部',
      submitTime: '2025-04-05 09:15'
    },
    {
      id: '3',
      title: '2025年信息系统审计计划调整（新增2个项目）',
      status: 'pending',
      year: '2025',
      adjustCount: 2,
      submitter: '王建国',
      submitUnit: '信息技术审计部',
      submitTime: '2025-04-18 16:42'
    },
    {
      id: '4',
      title: '2024年第四季度计划延期调整申请',
      status: 'rejected',
      year: '2024',
      adjustCount: 4,
      submitter: '陈志远',
      submitUnit: '综合审计部',
      submitTime: '2024-12-20 10:08'
    },
    {
      id: '5',
      title: '2024年重点工程跟踪审计项目变更申请',
      status: 'approved',
      year: '2024',
      adjustCount: 2,
      submitter: '刘美玲',
      submitUnit: '工程造价审计部',
      submitTime: '2024-11-03 13:55'
    },
    {
      id: '6',
      title: '2025年境外投资审计计划调整（延期3个月）',
      status: 'reviewing',
      year: '2025',
      adjustCount: 1,
      submitter: '赵天宇',
      submitUnit: '境外审计部',
      submitTime: '2025-05-06 11:22'
    },
    {
      id: '7',
      title: '2023年度绩效审计项目补充申请',
      status: 'approved',
      year: '2023',
      adjustCount: 5,
      submitter: '孙丽华',
      submitUnit: '绩效审计部',
      submitTime: '2023-09-14 08:30'
    }
  ]

  const tableData = ref<AdjustmentItem[]>(mockData)
  const total = ref(mockData.length)
  const loading = ref(false)

  const statusTagMap: Record<
    string,
    { type: 'success' | 'warning' | 'info' | 'danger' | ''; label: string }
  > = {
    pending: { type: 'info', label: '待审核' },
    reviewing: { type: 'warning', label: '审核中' },
    approved: { type: 'success', label: '已通过' },
    rejected: { type: 'danger', label: '已驳回' }
  }

  const handleSearch = () => {
    loading.value = true
    setTimeout(() => {
      const filtered = mockData.filter((item) => {
        const matchTitle = !query.title || item.title.includes(query.title)
        const matchYear = !query.year || item.year === query.year
        const matchStatus = !query.status || item.status === query.status
        return matchTitle && matchYear && matchStatus
      })
      tableData.value = filtered
      total.value = filtered.length
      query.page = 1
      selectedIds.value = []
      loading.value = false
    }, 300)
  }

  const handleReset = () => {
    query.title = ''
    query.year = ''
    query.status = ''
    query.page = 1
    tableData.value = mockData
    total.value = mockData.length
  }

  const handleAdd = () => router.push('/plan-management/adjustment/apply')
  const handleView = (row: AdjustmentItem) => ElMessage.info(`查看：${row.title}`)
  const handleEdit = (row: AdjustmentItem) => ElMessage.info(`编辑：${row.title}`)

  // ==================== 勾选管理（seq/checkbox 合并列） ====================
  // 已勾选的行ID
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
  const rowClassName = ({ row }: { row: AdjustmentItem }) => {
    return selectedIds.value.includes(row.id) ? 'row-checked' : ''
  }

  const handleDelete = async (row: AdjustmentItem) => {
    try {
      await ElMessageBox.confirm(`确定删除「${row.title}」？`, '删除确认', {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      })
      tableData.value = tableData.value.filter((item) => item.id !== row.id)
      total.value = tableData.value.length
      ElMessage.success('删除成功')
    } catch {
      /* 用户取消 */
    }
  }
</script>

<template>
  <div class="adjustment-page">
    <!-- 标题卡片 -->
    <el-card class="header-card" shadow="never">
      <div class="header-inner">
        <span class="page-title">计划调整</span>
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
      </div>
    </el-card>

    <!-- 内容卡片：搜索 + 表格 + 分页（flex:1，固定高度，下方留白由框架提供） -->
    <el-card class="body-card" shadow="never">
      <!-- 搜索行 -->
      <div class="search-bar">
        <el-form :model="query" inline>
          <el-form-item label="标题">
            <el-input
              v-model="query.title"
              placeholder="请输入"
              clearable
              style="width: 180px"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="计划年度">
            <el-select v-model="query.year" placeholder="请选择" clearable style="width: 140px">
              <el-option
                v-for="opt in yearOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="query.status" placeholder="请选择" clearable style="width: 140px">
              <el-option
                v-for="opt in statusOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Document" @click="handleSearch">查询</el-button>
            <el-button plain :icon="Refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格 -->
      <div class="table-wrap">
        <el-table
          v-loading="loading"
          :data="tableData"
          row-key="id"
          border
          height="100%"
          style="width: 100%"
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
                <span class="seq-num">{{ (query.page - 1) * query.pageSize + $index + 1 }}</span>
                <el-checkbox
                  class="seq-check"
                  :model-value="selectedIds.includes(row.id)"
                  @change="(val) => handleCheckRow(row.id, !!val)"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="标题" min-width="280" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="statusTagMap[row.status]?.type" size="small" effect="light">
                {{ statusTagMap[row.status]?.label ?? row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="year" label="计划年度" width="100" align="center">
            <template #default="{ row }">{{ row.year }}年</template>
          </el-table-column>
          <el-table-column prop="adjustCount" label="调整数量" width="100" align="center">
            <template #default="{ row }">
              <span class="count-cell">{{ row.adjustCount }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="submitter" label="提交人" width="100" align="center" />
          <el-table-column
            prop="submitUnit"
            label="提交单位"
            min-width="160"
            show-overflow-tooltip
          />
          <el-table-column prop="submitTime" label="提交时间" width="160" align="center" />
          <el-table-column label="操作" width="200" align="center" fixed="right">
            <template #header>
              <span>操作</span>
              <el-icon style="margin-left: 4px; vertical-align: middle; cursor: pointer"
                ><Setting
              /></el-icon>
            </template>
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleView(row)">查看</el-button>
              <el-button
                type="primary"
                link
                size="small"
                :disabled="row.status === 'approved'"
                @click="handleEdit(row)"
                >编辑</el-button
              >
              <el-button
                type="danger"
                link
                size="small"
                :disabled="row.status === 'reviewing' || row.status === 'approved'"
                @click="handleDelete(row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页：左侧共x条，右侧分页控件，固定在内容卡片底部 -->
      <div class="pagination-bar">
        <span class="total-text">共 {{ total }} 条</span>
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.pageSize"
          :total="total"
          :page-sizes="[20, 50, 100]"
          layout="sizes, prev, pager, next"
          background
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
  /*
  布局框架：
    art-page-view（height:100%; padding-bottom:20px; box-sizing:border-box）
    └── .adjustment-page（height:100%; flex-col; padding-top:20px; box-sizing:border-box）
          ├── .header-card   flex-shrink:0  标题卡，自然高度
          └── .body-card     flex:1; overflow:hidden  内容卡，撑满剩余，底部由 padding-bottom:20px 留白
*/
  .adjustment-page {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-top: 20px;
  }

  /* ── 标题卡片 ── */
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

  /* ── 内容卡片：固定高度，底部留白 20px 露出背景 ── */
  .body-card {
    display: flex;
    flex-direction: column;

    /* 100vh - 顶部导航60px - 上方留白20px - 标题卡44px - gap16px - 下方留白20px + 补偿60px */
    height: calc(100vh - 60px - 20px - 44px - 16px - 20px - 40px);
    overflow: hidden;
    border: none !important;
    border-radius: 12px;
    box-shadow: none !important;

    :deep(.el-card__body) {
      display: flex;
      flex: 1;
      flex-direction: column;
      padding: 0 20px 20px;
      overflow: hidden;
    }
  }

  /* 搜索行 */
  .search-bar {
    flex-shrink: 0;
    padding-top: 12px;

    :deep(.el-form--inline .el-form-item) {
      margin-right: 16px;
      margin-bottom: 12px;
    }
  }

  /* 表格（flex:1 撑满剩余空间） */
  .table-wrap {
    flex: 1;
    overflow: hidden;

    .count-cell {
      font-weight: 600;
      color: var(--el-color-primary);
    }
  }

  /* 分页栏：左侧总数，右侧分页控件 */
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
