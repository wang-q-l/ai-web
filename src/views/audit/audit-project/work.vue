<script setup lang="ts">
  // 审计项目详情页（全屏，isFullPage）：左侧阶段导航 + 右侧内容区
  import { ref, computed } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import {
    ArrowLeft,
    Document,
    Clock,
    UserFilled,
    Setting,
    Search,
    Upload,
    Plus,
    MoreFilled
  } from '@element-plus/icons-vue'
  import { useUserStore } from '@/store/modules/user'
  import type { AuditProjectMember } from '@/types/audit'
  import MemberManageDialog from '@/views/audit/project/components/MemberManageDialog.vue'
  import WorkTransferWizard from '@/views/audit/project/components/WorkTransferWizard.vue'
  import TransferRecordDialog from '@/views/audit/project/components/TransferRecordDialog.vue'

  const router = useRouter()
  const route = useRoute()

  // 从路由参数取项目名，fallback 用静态名
  const projectName = (route.query.name as string) || 'BS科技刘超同志任中审计'
  const projectId = Number(route.query.id) || 1

  // ==================== 左侧导航树 ====================
  const activeNode = ref('审计通知书')

  const stageGroups = [
    {
      title: '准备阶段',
      nodes: ['审计通知书', '审前调查', '审计事项', '审计方案']
    },
    {
      title: '实施阶段',
      nodes: ['审计疑点', '问题清单', '取证单', '审计底稿', '风险评估', '缺陷清单']
    },
    {
      title: '报告阶段',
      nodes: ['报告初稿', '征求意见稿', '报告终稿']
    },
    {
      title: '后续审计',
      nodes: ['项目评价', '项目归档']
    }
  ]

  // ==================== 搜索 ====================
  const searchText = ref('')

  // ==================== 人员管理弹窗 ====================
  // 与项目列表「人员管理」保持一致：共用同一套成员数据（mock）
  const defaultMembers: AuditProjectMember[] = [
    { id: 1, name: '张三', role: '组长', department: '审计部', phone: '13800000001' },
    { id: 2, name: '李四', role: '主审', department: '审计部', phone: '13800000002' },
    { id: 3, name: '王五', role: '组员', department: '审计部', phone: '13800000003' }
  ]
  const memberDialogVisible = ref(false)
  const wizardVisible = ref(false)
  const recordDialogVisible = ref(false)
  // 当前正在变更的成员
  const changingMember = ref<AuditProjectMember | null>(null)
  // 发起人姓名（当前登录用户）
  const userStore = useUserStore()
  const operatorName = computed(() => userStore.getUserInfo?.nickname || '当前用户')
  // 候选接收人：排除移出成员本人
  const transferCandidates = computed<AuditProjectMember[]>(() =>
    defaultMembers.filter((m) => m.id !== changingMember.value?.id)
  )

  // 点击"变更"打开工作移交向导
  const handleChangeMember = (member: AuditProjectMember) => {
    changingMember.value = member
    wizardVisible.value = true
  }
  // 移交成功提示
  const handleTransferSuccess = () => {
    ElMessage.success('工作已移交，可在「人员变更记录」中查看')
  }

  // ==================== 操作 ====================
  const handleBack = () => router.back()
  const handleProjectInfo = () => ElMessage.info('项目信息（功能开发中）')
  const handleTimedTask = () => ElMessage.info('定期任务（功能开发中）')
  // 打开人员管理弹窗（与项目列表「人员管理」入口效果一致）
  const handleMembers = () => {
    memberDialogVisible.value = true
  }
  const handleSettings = () => ElMessage.info('项目设置（功能开发中）')
  const handleUpload = () => ElMessage.info('上传文件（功能开发中）')
  const handleAdd = () => ElMessage.info('新增（功能开发中）')
  const handleMore = () => ElMessage.info('更多操作（功能开发中）')

  // ==================== 勾选列（与序号列合并） ====================
  // 表格数据（当前为空stub，后续接口接入时替换）
  const tableData = ref<any[]>([])

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
  const rowClassName = ({ row }: { row: any }) => {
    return selectedIds.value.includes(row.id) ? 'row-checked' : ''
  }
</script>

<template>
  <div class="project-work-page">
    <!-- 卡片1：标题栏（作为独立白色卡片） -->
    <el-card class="work-header-card" shadow="never">
      <div class="work-header">
        <div class="header-left">
          <el-icon class="back-icon" @click="handleBack"><ArrowLeft /></el-icon>
          <span class="project-name">{{ projectName }}</span>
        </div>
        <div class="header-actions">
          <el-button :icon="Document" @click="handleProjectInfo">项目信息</el-button>
          <el-button :icon="Clock" @click="handleTimedTask">定期任务 (0)</el-button>
          <el-button :icon="UserFilled" @click="handleMembers">项目成员</el-button>
          <el-button :icon="Setting" @click="handleSettings">项目设置</el-button>
        </div>
      </div>
    </el-card>

    <!-- 主体区：左侧步骤条卡片 + 右侧内容卡片（两个独立卡片，中间露出背景） -->
    <div class="work-body">
      <!-- 左侧步骤条卡片 -->
      <el-card class="nav-card" shadow="never">
        <div v-for="group in stageGroups" :key="group.title" class="nav-group">
          <div class="nav-group-title">
            <span>{{ group.title }}</span>
            <el-icon class="nav-collapse-icon"><ArrowLeft /></el-icon>
          </div>
          <div
            v-for="node in group.nodes"
            :key="node"
            :class="['nav-node', { 'is-active': activeNode === node }]"
            @click="activeNode = node"
          >
            <span class="node-dot" :class="{ 'is-active': activeNode === node }" />
            <span class="node-label">{{ node }}</span>
          </div>
        </div>
      </el-card>

      <!-- 右侧内容卡片 -->
      <el-card class="content-card" shadow="never">
        <!-- Tab 标签栏 -->
        <div class="content-tabs">
          <span class="tab-item is-active">全部</span>
        </div>

        <!-- 工具栏 -->
        <div class="content-toolbar">
          <el-input
            v-model="searchText"
            placeholder="请搜索名称"
            :prefix-icon="Search"
            class="search-input"
            clearable
          />
          <div class="toolbar-right">
            <el-button :icon="Upload" @click="handleUpload">上传</el-button>
            <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
            <el-button :icon="MoreFilled" @click="handleMore">更多</el-button>
          </div>
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
                  <span class="seq-num">{{ $index + 1 }}</span>
                  <el-checkbox
                    class="seq-check"
                    :model-value="selectedIds.includes(row.id)"
                    @change="(val) => handleCheckRow(row.id, !!val)"
                  />
                </div>
              </template>
            </el-table-column>
            <el-table-column label="编号" prop="code" width="140" />
            <el-table-column label="单位" prop="unit" width="160" />
            <el-table-column label="名称" prop="name" min-width="200" />
            <el-table-column label="创建人" prop="creator" width="100" align="center" />
            <el-table-column label="创建时间" prop="createTime" width="160" align="center" />
            <el-table-column label="下达至" prop="assignTo" width="100" align="center" />
            <el-table-column label="下达时间" prop="assignTime" width="160" align="center" />
            <el-table-column label="操作" width="100" align="center" fixed="right" />
          </el-table>
        </div>

        <!-- 分页栏 -->
        <div class="pagination-bar">
          <span class="total-text">共 0 条数据</span>
          <el-pagination
            :current-page="1"
            :page-size="20"
            :total="0"
            :page-sizes="[20, 50, 100]"
            layout="sizes, prev, pager, next"
            background
          />
        </div>
      </el-card>
    </div>

    <!-- 人员管理弹窗（与项目列表「人员管理」入口共用同一组件） -->
    <MemberManageDialog
      v-model:visible="memberDialogVisible"
      :project-id="projectId"
      :members="defaultMembers"
      @change="handleChangeMember"
      @open-records="recordDialogVisible = true"
    />

    <!-- 工作移交向导 -->
    <WorkTransferWizard
      v-model:visible="wizardVisible"
      :project-id="projectId"
      :from-member="changingMember"
      :candidates="transferCandidates"
      :operator-name="operatorName"
      @success="handleTransferSuccess"
    />

    <!-- 人员变更记录 -->
    <TransferRecordDialog v-model:visible="recordDialogVisible" :project-id="projectId" />
  </div>
</template>

<style scoped lang="scss">
  /* 标准三卡片框架 */
  .project-work-page {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-top: 20px;
  }

  /* ── 卡片1：标题栏 ── */
  .work-header-card {
    flex-shrink: 0;
    border: none !important;
    border-radius: 12px;
    box-shadow: none !important;

    :deep(.el-card__body) {
      padding: 0;
    }
  }

  .work-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;

    .header-left {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .back-icon {
      font-size: 18px;
      color: var(--el-text-color-regular);
      cursor: pointer;

      &:hover {
        color: var(--el-color-primary);
      }
    }

    .project-name {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }
  }

  /* ── 主体行：左侧卡片 + 右侧卡片（中间 12px gap 露出背景） ── */
  .work-body {
    display: flex;
    gap: 12px;

    /* 100vh - 顶部导航60px - 上方留白20px - 标题卡44px - gap12px - 下方留白30px */
    height: calc(100vh - 60px - 20px - 44px - 12px - 30px);
    overflow: hidden;
  }

  /* ── 卡片2：左侧步骤条 ── */
  .nav-card {
    flex-shrink: 0;
    width: 240px;
    overflow: hidden auto;
    border: none !important;
    border-radius: 12px;
    box-shadow: none !important;

    :deep(.el-card__body) {
      padding: 12px 8px;
      overflow: hidden;
    }
  }

  .nav-group {
    margin-bottom: 4px;
  }

  .nav-group-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    margin-bottom: 2px;
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
    cursor: default;
    background: var(--el-fill-color-light);
    border-radius: 6px;

    .nav-collapse-icon {
      font-size: 12px;
      color: var(--el-text-color-placeholder);
      transform: rotate(-90deg);
    }
  }

  .nav-node {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 8px 12px 8px 20px;
    font-size: 13px;
    color: var(--el-text-color-regular);
    cursor: pointer;
    border-radius: 6px;
    transition:
      background 0.15s,
      color 0.15s;

    &:hover {
      background: var(--el-fill-color-light);
    }

    &.is-active {
      font-weight: 500;
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }
  }

  .node-dot {
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    background: var(--el-border-color);
    border-radius: 50%;

    &.is-active {
      background: var(--el-color-primary);
    }
  }

  /* ── 卡片3：右侧内容区 ── */
  .content-card {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
    border: none !important;
    border-radius: 12px;
    box-shadow: none !important;

    :deep(.el-card__body) {
      display: flex;
      flex: 1;
      flex-direction: column;
      padding: 16px 20px 20px;
      overflow: hidden;
    }
  }

  /* Tab 标签栏 */
  .content-tabs {
    flex-shrink: 0;
    margin-bottom: 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .tab-item {
    display: inline-block;
    padding: 0 4px 10px;
    font-size: 14px;
    color: var(--el-text-color-regular);
    cursor: pointer;

    &.is-active {
      font-weight: 500;
      color: var(--el-color-primary);
      border-bottom: 2px solid var(--el-color-primary);
    }
  }

  /* 工具栏 */
  .content-toolbar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    .search-input {
      width: 220px;
    }

    .toolbar-right {
      display: flex;
      gap: 8px;
    }
  }

  /* 表格 */
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
    margin-top: 12px;

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
