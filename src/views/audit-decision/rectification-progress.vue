<template>
  <!-- 整改进展页面（整改单位端）：复刻审计系统整改进展页 -->
  <PageContainer>
    <div class="progress-detail-container">
      <!-- 顶部标题栏 -->
      <div class="header-bar">
        <el-button link @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <span class="project-title">{{ projectName }}</span>
        <div class="header-tabs">
          <el-button text>
            <el-icon><Document /></el-icon>
            项目信息
          </el-button>
          <el-button text>
            <el-icon><User /></el-icon>
            项目成员
          </el-button>
          <el-button text>
            <el-icon><Setting /></el-icon>
            项目设置
          </el-button>
        </div>
      </div>

      <!-- 左右分栏布局 -->
      <div class="content-wrapper">
        <!-- 左侧整改阶段导航 -->
        <div class="left-sidebar">
          <div class="sidebar-header">
            <span class="sidebar-title">整改阶段</span>
            <el-icon class="collapse-icon"><Minus /></el-icon>
          </div>
          <div class="stage-nav">
            <div
              v-for="stage in stageList"
              :key="stage.key"
              class="stage-item"
              :class="{ active: activeStage === stage.key }"
              @click="handleStageClick(stage.key)"
            >
              <span class="dot" />
              <span>{{ stage.label }}</span>
            </div>
          </div>
        </div>

        <!-- 右侧内容区 -->
        <div class="right-content">
          <!-- 筛选区 -->
          <div class="filter-section">
            <el-form :model="queryParams" inline>
              <el-form-item label="编号、问题标题">
                <el-input
                  v-model="queryParams.keyword"
                  placeholder="请输入"
                  clearable
                  style="width: 200px"
                />
              </el-form-item>
              <el-form-item label="整改状态">
                <el-select
                  v-model="queryParams.rectificationStatus"
                  placeholder="请选择"
                  clearable
                  style="width: 180px"
                >
                  <el-option label="未整改" :value="1" />
                  <el-option label="整改中" :value="2" />
                  <el-option label="已整改" :value="3" />
                </el-select>
              </el-form-item>
              <el-form-item label="问题类别">
                <el-select
                  v-model="queryParams.problemType"
                  placeholder="请选择"
                  clearable
                  style="width: 180px"
                >
                  <el-option
                    v-for="type in problemTypeOptions"
                    :key="type"
                    :label="type"
                    :value="type"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button @click="handleQuery">
                  <el-icon><Document /></el-icon>
                  查询
                </el-button>
                <el-button @click="handleReset">
                  <el-icon><Refresh /></el-icon>
                  重置
                </el-button>
                <el-button link type="primary" @click="filterExpanded = !filterExpanded">
                  展开
                  <el-icon><ArrowDown /></el-icon>
                </el-button>
                <el-button link>收起固定列</el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 信息提示条 -->
          <div class="info-banner">
            <el-icon class="info-icon"><InfoFilled /></el-icon>
            <span>需要将所有的问题填报后才能进行数据的提交</span>
          </div>

          <!-- 表格区 -->
          <div class="table-section">
            <el-table
              :data="tableData"
              v-loading="loading"
              height="100%"
              :row-class-name="rowClassName"
            >
              <!-- 勾选列与序号列合并：默认显示序号，行 hover 或已勾选时显示勾选框 -->
              <el-table-column label="序号" width="90" align="center">
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
              <el-table-column prop="problemCode" label="问题编号" width="150" />
              <el-table-column prop="problemTitle" label="问题标题" min-width="160">
                <template #default="{ row }">
                  <span class="title-link clamp-text" @click="handleView(row)">
                    {{ row.problemTitle }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="problemDesc" label="问题表述" min-width="260">
                <template #default="{ row }">
                  <el-tooltip placement="top" :show-after="200" popper-class="cell-full-tooltip">
                    <template #content>
                      <div class="full-content">{{ row.problemDesc }}</div>
                    </template>
                    <span class="clamp-text">{{ row.problemDesc }}</span>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column prop="legalBasis" label="定性依据" min-width="260">
                <template #default="{ row }">
                  <el-tooltip placement="top" :show-after="200" popper-class="cell-full-tooltip">
                    <template #content>
                      <div class="full-content">{{ row.legalBasis }}</div>
                    </template>
                    <span class="clamp-text">{{ row.legalBasis }}</span>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column label="整改状态" width="100">
                <template #default="{ row }">
                  <span class="status-text">
                    <span class="status-dot" :class="statusClass(row.rectificationStatus)" />
                    {{ rectificationStatusLabel(row.rectificationStatus) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="流程状态" width="100">
                <template #default="{ row }">
                  <span class="status-text">
                    <span class="status-dot" :class="statusClass(row.processStatus)" />
                    {{ processStatusLabel(row.processStatus) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="220" fixed="right">
                <template #default="{ row }">
                  <div class="action-cell">
                    <el-button link type="primary" @click="handleView(row)">查看</el-button>
                    <el-button link type="primary" @click="handleReport(row)">填报进展</el-button>
                    <el-button link type="primary" @click="handleApproval(row)">审批记录</el-button>
                  </div>
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
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
  /**
   * 整改进展列表页（整改单位端）
   * 左侧整改阶段导航，右侧筛选 + 信息提示条 + 问题表格
   */
  import { ref, reactive, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import {
    ArrowLeft,
    ArrowDown,
    Document,
    User,
    Setting,
    Minus,
    Refresh,
    InfoFilled
  } from '@element-plus/icons-vue'
  import type {
    RectificationProgressItem,
    RectificationProgressQuery
  } from '@/types/audit-decision'
  import { getRectificationProgressList } from '@/api/audit-decision'

  const router = useRouter()

  // 项目名称（复刻截图标题）
  const projectName = ref('ZY股份2025年专项审计')

  // 左侧整改阶段导航，整改进展默认选中
  const activeStage = ref('rectification-progress')
  const stageList = [
    { key: 'rectification-list', label: '整改清单' },
    { key: 'rectification-plan', label: '整改方案' },
    { key: 'rectification-progress', label: '整改进展' },
    { key: 'rectification-report', label: '整改报告' }
  ]

  // 筛选展开状态
  const filterExpanded = ref(false)

  // 问题类别下拉选项
  const problemTypeOptions = ['财务管理', '会计核算', '资产管理']

  // 查询参数
  const queryParams = reactive<RectificationProgressQuery>({
    keyword: '',
    rectificationStatus: null,
    problemType: null,
    page: 1,
    pageSize: 20
  })

  // 表格数据
  const tableData = ref<RectificationProgressItem[]>([])
  const total = ref(0)
  const loading = ref(false)

  // 已勾选的行ID（勾选列与序号列合并，自行管理选中态）
  const selectedIds = ref<number[]>([])

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
  const handleCheckRow = (id: number, val: boolean) => {
    if (val) {
      if (!selectedIds.value.includes(id)) selectedIds.value.push(id)
    } else {
      selectedIds.value = selectedIds.value.filter((item) => item !== id)
    }
  }

  // 已勾选的行加类名，使其序号列常驻显示勾选框（hover 行也显示，见样式）
  const rowClassName = ({ row }: { row: RectificationProgressItem }) => {
    return selectedIds.value.includes(row.id) ? 'row-checked' : ''
  }

  // 整改状态文案：1-未整改 2-整改中 3-已整改
  const rectificationStatusLabel = (status: number) => {
    return { 1: '未整改', 2: '整改中', 3: '已整改' }[status] ?? '未整改'
  }

  // 流程状态文案：1-待填报 2-待提交 3-已提交
  const processStatusLabel = (status: number) => {
    return { 1: '待填报', 2: '待提交', 3: '已提交' }[status] ?? '待填报'
  }

  // 状态圆点颜色样式
  const statusClass = (status: number) => {
    return { 1: 'is-pending', 2: 'is-progress', 3: 'is-done' }[status] ?? 'is-pending'
  }

  // 获取列表数据
  const fetchData = async () => {
    loading.value = true
    try {
      const res = await getRectificationProgressList(queryParams)
      tableData.value = res.data.list
      total.value = res.data.total
      // 数据刷新后清空勾选
      selectedIds.value = []
    } catch {
      ElMessage.error('获取整改进展列表失败')
    } finally {
      loading.value = false
    }
  }

  // 查询
  const handleQuery = () => {
    queryParams.page = 1
    fetchData()
  }

  // 重置筛选
  const handleReset = () => {
    queryParams.keyword = ''
    queryParams.rectificationStatus = null
    queryParams.problemType = null
    queryParams.page = 1
    fetchData()
  }

  // 切换整改阶段（当前仅整改进展可用，其余为占位）
  const handleStageClick = (key: string) => {
    if (key === 'rectification-progress') {
      activeStage.value = key
      return
    }
    ElMessage.info('该阶段功能开发中')
  }

  // 查看问题详情
  const handleView = (row: RectificationProgressItem) => {
    ElMessage.info(`查看问题：${row.problemTitle}`)
  }

  // 填报整改进展：跳转到填报整改页面，携带问题ID
  const handleReport = (row: RectificationProgressItem) => {
    router.push({
      path: '/audit-decision/rectification-unit/report-fill',
      query: { problemId: row.id }
    })
  }

  // 查看审批记录
  const handleApproval = (row: RectificationProgressItem) => {
    ElMessage.info(`审批记录：${row.problemTitle}`)
  }

  // 返回上一页
  const handleBack = () => {
    router.back()
  }

  // 初始化
  onMounted(() => {
    fetchData()
  })
</script>

<style scoped lang="scss">
  .progress-detail-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #f5f7fa;
  }

  /* 顶部标题栏 */
  .header-bar {
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 14px 24px;
    background: #fff;
    border-bottom: 1px solid #e4e7ed;

    .project-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .header-tabs {
      display: flex;
      gap: 16px;
      margin-left: auto;
    }
  }

  /* 左右分栏 */
  .content-wrapper {
    display: flex;
    flex: 1;
    gap: 16px;
    padding: 16px;
    overflow: hidden;
  }

  /* 左侧整改阶段导航 */
  .left-sidebar {
    flex-shrink: 0;
    width: 220px;
    padding: 12px 0;
    overflow-y: auto;
    background: #fff;
    border-radius: 12px;

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px 12px;
      margin: 0 12px 8px;
      background: #f5f7fa;
      border-radius: 8px;

      .sidebar-title {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
      }

      .collapse-icon {
        font-size: 14px;
        color: #909399;
        cursor: pointer;
      }
    }
  }

  .stage-nav {
    position: relative;

    /* 阶段项之间的竖向连接线 */
    &::before {
      position: absolute;
      top: 20px;
      bottom: 20px;
      left: 21px;
      width: 1px;
      content: '';
      background: #e4e7ed;
    }
  }

  .stage-item {
    position: relative;
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 11px 16px;
    font-size: 14px;
    color: #303133;
    cursor: pointer;
    transition: all 0.2s;

    .dot {
      z-index: 1;
      width: 8px;
      height: 8px;
      background: #c0c4cc;
      border: 2px solid #fff;
      border-radius: 50%;
    }

    &:hover {
      color: #409eff;
    }

    &.active {
      font-weight: 500;
      color: #409eff;
      background: #ecf5ff;

      .dot {
        background: #409eff;
      }
    }
  }

  /* 右侧内容区 */
  .right-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    padding: 16px;
    overflow: hidden;
    background: #fff;
    border-radius: 12px;
  }

  .filter-section {
    margin-bottom: 12px;

    :deep(.el-form-item) {
      margin-bottom: 8px;
    }
  }

  /* 蓝色信息提示条 */
  .info-banner {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 10px 16px;
    margin-bottom: 16px;
    font-size: 14px;
    color: #606266;
    background: #eaf2ff;
    border-radius: 8px;

    .info-icon {
      font-size: 16px;
      color: #409eff;
    }
  }

  .table-section {
    flex: 1;
    overflow: hidden;
  }

  /* 表述/依据：默认显示两行，超出用"..."省略（hover 由 tooltip 显示全文） */
  .clamp-text {
    display: -webkit-box;
    overflow: hidden;
    line-height: 1.6;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  /* 问题标题链接：蓝色可点击，两行截断 */
  .title-link {
    color: #409eff;
    cursor: pointer;

    &:hover {
      color: #66b1ff;
    }
  }

  /* 操作列按钮一行显示，不换行 */
  .action-cell {
    display: flex;
    flex-wrap: nowrap;
    gap: 4px;
    align-items: center;
    white-space: nowrap;
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

  /* 带圆点的状态文案 */
  .status-text {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    color: #606266;

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;

      &.is-pending {
        background: #c0c4cc;
      }

      &.is-progress {
        background: #e6a23c;
      }

      &.is-done {
        background: #67c23a;
      }
    }
  }

  .pagination-section {
    display: flex;
    justify-content: flex-end;
    padding-top: 16px;
  }
</style>

<!-- tooltip 弹层被 teleport 到 body，需用非 scoped 样式限制全文宽度并保留换行 -->
<style lang="scss">
  .cell-full-tooltip {
    max-width: 480px;

    .full-content {
      line-height: 1.7;
      word-break: break-word;
      white-space: normal;
    }
  }
</style>
