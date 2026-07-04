<script setup lang="ts">
  // 审计项目列表页
  import { ref, reactive, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { Plus, Download, Setting, ArrowDown } from '@element-plus/icons-vue'
  import { useUserStore } from '@/store/modules/user'
  import type { AuditProjectMember } from '@/types/audit'
  import MemberManageDialog from '@/views/audit/project/components/MemberManageDialog.vue'
  import WorkTransferWizard from '@/views/audit/project/components/WorkTransferWizard.vue'
  import TransferRecordDialog from '@/views/audit/project/components/TransferRecordDialog.vue'

  defineOptions({ name: 'AuditProjectList' })

  const router = useRouter()

  // ==================== Tab 分类 ====================
  const activeTab = ref('all')
  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'control', label: '内控评价' },
    { key: 'audit', label: '项目审计' },
    { key: 'finance', label: '经费审计' },
    { key: 'special', label: '专项审计' }
  ]

  // ==================== 视图切换 ====================
  const viewMode = ref<'list' | 'gantt'>('list')
  const myOnly = ref(false)

  // ==================== 项目进度状态 ====================
  const stageMap: Record<string, { label: string; color: string }> = {
    prepare: { label: '准备阶段', color: '#409EFF' },
    execute: { label: '实施阶段', color: '#F56C6C' },
    report: { label: '报告阶段', color: '#E6A23C' },
    done: { label: '已完成', color: '#67C23A' }
  }

  // ==================== 示例数据 ====================
  interface ProjectItem {
    id: string
    index: number
    year: number
    name: string
    category: string
    auditedUnit: string
    auditBody: string
    auditTarget: string
    stage: keyof typeof stageMap
    members: AuditProjectMember[]
  }

  // 公用示例成员，实际接入接口后由后端返回
  const defaultMembers: AuditProjectMember[] = [
    { id: 1, name: '张三', role: '组长', department: '审计部', phone: '13800000001' },
    { id: 2, name: '李四', role: '主审', department: '审计部', phone: '13800000002' },
    { id: 3, name: '王五', role: '组员', department: '审计部', phone: '13800000003' }
  ]

  const mockData: ProjectItem[] = [
    {
      id: '1',
      index: 1,
      year: 2026,
      name: 'BS科技刘超同志任中审计',
      category: '任中审计',
      auditedUnit: 'BS科技',
      auditBody: '总部审计部',
      auditTarget: '刘超',
      stage: 'prepare',
      members: defaultMembers
    },
    {
      id: '2',
      index: 2,
      year: 2026,
      name: 'ZY股份李明同志任中审计',
      category: '任中审计',
      auditedUnit: 'ZY股份',
      auditBody: '总部审计部',
      auditTarget: '李明',
      stage: 'prepare',
      members: defaultMembers
    },
    {
      id: '3',
      index: 3,
      year: 2026,
      name: '2026ZK科技内控评价',
      category: '内控评价',
      auditedUnit: 'ZK科技',
      auditBody: '总部审计部',
      auditTarget: '',
      stage: 'prepare',
      members: defaultMembers
    },
    {
      id: '4',
      index: 4,
      year: 2026,
      name: '马尾造船厂绿色智能船舶项目竣工结算审计',
      category: '竣工审计',
      auditedUnit: 'ZY股份',
      auditBody: '总部审计部',
      auditTarget: '马尾造船厂绿色智能船舶改造中心',
      stage: 'prepare',
      members: defaultMembers
    },
    {
      id: '5',
      index: 5,
      year: 2026,
      name: 'ZY智能交通协同建设项目全过程跟踪审计',
      category: '全过程审计',
      auditedUnit: 'ZY股份',
      auditBody: '总部审计部',
      auditTarget: '智能交通协同平台（福州都市圈试点）',
      stage: 'prepare',
      members: defaultMembers
    },
    {
      id: '6',
      index: 6,
      year: 2026,
      name: 'ZY股份罗斌同志离任审计',
      category: '离任审计',
      auditedUnit: 'ZY股份',
      auditBody: '总部审计部',
      auditTarget: '罗斌',
      stage: 'execute',
      members: defaultMembers
    },
    {
      id: '7',
      index: 7,
      year: 2026,
      name: 'ZY股份2025年财务专项审计',
      category: '专项审计',
      auditedUnit: 'ZY股份',
      auditBody: '总部审计部',
      auditTarget: '',
      stage: 'execute',
      members: defaultMembers
    }
  ]

  const tableData = ref<ProjectItem[]>(mockData)
  const total = ref(mockData.length)

  const query = reactive({ page: 1, pageSize: 20 })

  // ==================== Tab 切换筛选 ====================
  const handleTabChange = (key: string) => {
    activeTab.value = key
    if (key === 'all') {
      tableData.value = mockData
    } else {
      const catMap: Record<string, string[]> = {
        control: ['内控评价'],
        audit: ['任中审计', '离任审计', '竣工审计', '全过程审计'],
        finance: ['经费审计'],
        special: ['专项审计']
      }
      tableData.value = mockData.filter((r) => catMap[key]?.includes(r.category))
    }
    total.value = tableData.value.length
  }

  // ==================== 操作 ====================
  const handleAdd = () => ElMessage.info('新增项目（功能开发中）')
  const handleExport = () => ElMessage.info('导出（功能开发中）')
  const handleBatchAuth = () => ElMessage.info('批量授权（功能开发中）')
  const handleViewGantt = () => {
    viewMode.value = 'gantt'
    ElMessage.info('甘特图视图（功能开发中）')
  }
  const handleViewList = () => {
    viewMode.value = 'list'
  }
  const handleMyOnly = () => {
    myOnly.value = !myOnly.value
    ElMessage.info(`${myOnly.value ? '已开启' : '已关闭'}「我参与的」筛选`)
  }
  const handleProjectInfo = (row: ProjectItem) => {
    router.push({ path: '/audit/audit-project/work', query: { id: row.id, name: row.name } })
  }

  // ==================== 人员管理弹窗 ====================
  const userStore = useUserStore()
  const memberDialogVisible = ref(false)
  const wizardVisible = ref(false)
  const recordDialogVisible = ref(false)
  // 当前操作的项目行
  const activeProject = ref<ProjectItem | null>(null)
  // 当前正在变更（移交）的成员
  const changingMember = ref<AuditProjectMember | null>(null)

  // 发起人姓名（当前登录用户）
  const operatorName = computed(() => userStore.getUserInfo?.nickname || '当前用户')

  // 候选接收人：同项目其他成员，排除移出成员本人
  const transferCandidates = computed<AuditProjectMember[]>(() => {
    if (!activeProject.value) return []
    return activeProject.value.members.filter((m) => m.id !== changingMember.value?.id)
  })

  // 点击操作列「人员管理」：打开人员管理弹窗
  const handlePersonnel = (row: ProjectItem) => {
    activeProject.value = row
    memberDialogVisible.value = true
  }

  // 点击变更按钮：打开工作移交向导
  const handleChangeMember = (member: AuditProjectMember) => {
    changingMember.value = member
    wizardVisible.value = true
  }

  // 移交成功后提示
  const handleTransferSuccess = () => {
    ElMessage.success('工作已移交，可在「人员变更记录」中查看')
  }

  // ==================== 勾选列（与序号列合并） ====================
  // 已勾选的行ID（自行管理选中态）
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
  const rowClassName = ({ row }: { row: ProjectItem }) => {
    return selectedIds.value.includes(row.id) ? 'row-checked' : ''
  }
</script>

<template>
  <div class="audit-project-page">
    <!-- 标题卡 -->
    <el-card class="header-card" shadow="never">
      <div class="header-inner">
        <span class="page-title">项目管理</span>
        <div class="header-actions">
          <!-- 我参与的 -->
          <el-button :class="['btn-my', { active: myOnly }]" @click="handleMyOnly">
            我参与的
          </el-button>
          <!-- 视图切换 -->
          <div class="view-switch">
            <el-button :type="viewMode === 'list' ? 'primary' : 'default'" @click="handleViewList"
              >列表</el-button
            >
            <el-button :type="viewMode === 'gantt' ? 'primary' : 'default'" @click="handleViewGantt"
              >甘特图</el-button
            >
          </div>
          <!-- 批量授权 -->
          <el-button @click="handleBatchAuth">
            批量授权
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <!-- 导出 -->
          <el-button :icon="Download" @click="handleExport">导出</el-button>
          <!-- 新增 -->
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
        </div>
      </div>
    </el-card>

    <!-- 内容卡 -->
    <el-card class="body-card" shadow="never">
      <!-- Tab 分类 -->
      <div class="tab-bar">
        <div
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab-item', { active: activeTab === tab.key }]"
          @click="handleTabChange(tab.key)"
          >{{ tab.label }}</div
        >
      </div>

      <!-- 表格 -->
      <div class="table-wrap">
        <el-table
          :data="tableData"
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

          <el-table-column prop="year" label="年度" width="80" align="center" />
          <el-table-column prop="name" label="审计项目名称" min-width="200">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleProjectInfo(row)">{{
                row.name
              }}</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="category" label="项目类别" width="110" />
          <el-table-column prop="auditedUnit" label="被审计单位" width="110" />
          <el-table-column prop="auditBody" label="审计实施主体" width="120" />
          <el-table-column
            prop="auditTarget"
            label="审计对象"
            min-width="160"
            show-overflow-tooltip
          />
          <el-table-column label="项目进度" width="130">
            <template #default="{ row }">
              <span class="stage-dot" :style="{ background: stageMap[row.stage].color }" />
              <span class="stage-label">{{ stageMap[row.stage].label }}</span>
            </template>
          </el-table-column>

          <!-- 操作列 -->
          <el-table-column label="操作" width="160" align="center" fixed="right">
            <template #header>
              <span>操作</span>
              <el-icon style="margin-left: 4px; vertical-align: middle; cursor: pointer"
                ><Setting
              /></el-icon>
            </template>
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handlePersonnel(row)"
                >人员管理</el-button
              >
              <el-button type="primary" link size="small" @click="handleProjectInfo(row)"
                >项目信息</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页栏 -->
      <div class="pagination-bar">
        <span class="total-text">共 {{ total }} 条数据</span>
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

    <!-- 人员管理弹窗 -->
    <MemberManageDialog
      v-if="activeProject"
      v-model:visible="memberDialogVisible"
      :project-id="Number(activeProject.id)"
      :members="activeProject.members"
      @change="handleChangeMember"
      @open-records="recordDialogVisible = true"
    />

    <!-- 工作移交向导 -->
    <WorkTransferWizard
      v-if="activeProject"
      v-model:visible="wizardVisible"
      :project-id="Number(activeProject.id)"
      :from-member="changingMember"
      :candidates="transferCandidates"
      :operator-name="operatorName"
      @success="handleTransferSuccess"
    />

    <!-- 人员变更记录 -->
    <TransferRecordDialog
      v-if="activeProject"
      v-model:visible="recordDialogVisible"
      :project-id="Number(activeProject.id)"
    />
  </div>
</template>

<style scoped lang="scss">
  /* 标准双卡片框架 */
  .audit-project-page {
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

  /* 我参与的 切换按钮 */
  .btn-my {
    color: var(--el-text-color-regular);
    border-color: var(--el-border-color);

    &.active {
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
      border-color: var(--el-color-primary);
    }
  }

  /* 列表/甘特图 视图切换组 */
  .view-switch {
    display: flex;

    .el-button:first-child {
      border-radius: 4px 0 0 4px;
    }

    .el-button:last-child {
      margin-left: -1px;
      border-radius: 0 4px 4px 0;
    }
  }

  /* ── 内容卡 ── */
  .body-card {
    display: flex;
    flex-direction: column;
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

  /* Tab 标签栏 */
  .tab-bar {
    display: flex;
    flex-shrink: 0;
    gap: 0;
    padding-top: 4px;
    margin-bottom: 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .tab-item {
    position: relative;
    padding: 10px 16px;
    font-size: 14px;
    color: var(--el-text-color-regular);
    white-space: nowrap;
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: var(--el-color-primary);
    }

    &.active {
      font-weight: 500;
      color: var(--el-color-primary);

      &::after {
        position: absolute;
        right: 0;
        bottom: -1px;
        left: 0;
        height: 2px;
        content: '';
        background: var(--el-color-primary);
        border-radius: 2px 2px 0 0;
      }
    }
  }

  /* 表格 */
  .table-wrap {
    flex: 1;
    overflow: hidden;
  }

  /* 项目进度 */
  .stage-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    margin-right: 6px;
    vertical-align: middle;
    border-radius: 50%;
  }

  .stage-label {
    font-size: 13px;
    vertical-align: middle;
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
