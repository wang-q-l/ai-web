<template>
  <!-- 项目工作台首页：模拟审计项目工作区，顶部「项目成员」按钮打开人员变更交互 -->
  <div class="workspace-page" v-loading="loading">
    <!-- 顶部标题栏 -->
    <div class="workspace-header">
      <div class="header-left">
        <span class="project-title">{{ project?.name || '审计项目' }}</span>
        <el-select v-model="currentStageName" size="small" class="stage-select" placeholder="阶段">
          <el-option v-for="s in stages" :key="s.id" :label="s.stageName" :value="s.stageName" />
        </el-select>
      </div>
      <div class="header-actions">
        <el-button :icon="Document">项目信息</el-button>
        <el-button :icon="Clock">定期任务（0）</el-button>
        <!-- 项目成员：打开人员变更交互弹窗 -->
        <el-button :icon="UserFilled" @click="memberDialogVisible = true">项目成员</el-button>
        <el-button :icon="Setting">项目设置</el-button>
      </div>
    </div>

    <!-- 主体：左侧阶段导航 + 右侧内容 -->
    <div class="workspace-main">
      <!-- 左侧阶段导航 -->
      <div class="stage-nav-panel">
        <div v-for="group in stageGroups" :key="group.title" class="nav-group">
          <div class="nav-group-title">{{ group.title }}</div>
          <div
            v-for="node in group.nodes"
            :key="node"
            class="nav-node"
            :class="{ 'is-active': activeNode === node }"
            @click="activeNode = node"
          >
            <span class="node-dot" :class="{ 'is-active': activeNode === node }"></span>
            <span class="node-label">{{ node }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧内容区 -->
      <div class="content-panel">
        <div class="content-tabs">
          <span class="tab-item is-active">全部</span>
        </div>
        <div class="content-toolbar">
          <el-input
            v-model="searchText"
            placeholder="请搜索名称"
            :prefix-icon="Search"
            class="search-input"
          />
          <div class="toolbar-right">
            <el-button :icon="Upload">上传</el-button>
            <el-button type="primary" :icon="Top">提交</el-button>
            <el-button type="primary" :icon="Plus">新增</el-button>
          </div>
        </div>
        <el-table :data="[]" class="content-table">
          <el-table-column type="selection" width="48" />
          <el-table-column label="编号" prop="code" width="160" />
          <el-table-column label="名称" prop="name" />
          <el-table-column label="审核状态" prop="reviewStatus" width="120" />
          <el-table-column label="创建人" prop="creator" width="120" />
          <el-table-column label="创建时间" prop="createTime" width="160" />
          <el-table-column label="操作" width="120" />
          <template #empty>
            <el-empty description="暂无数据" :image-size="120" />
          </template>
        </el-table>
      </div>
    </div>

    <!-- 人员管理弹窗（人员变更交互） -->
    <MemberManageDialog
      v-if="project"
      v-model:visible="memberDialogVisible"
      :project-id="project.id"
      :members="project.members"
      @change="handleChangeMember"
      @open-records="recordDialogVisible = true"
    />

    <!-- 工作移交向导 -->
    <WorkTransferWizard
      v-if="project"
      v-model:visible="wizardVisible"
      :project-id="project.id"
      :from-member="changingMember"
      :candidates="transferCandidates"
      :operator-name="operatorName"
      @success="handleTransferSuccess"
    />

    <!-- 人员变更记录 -->
    <TransferRecordDialog
      v-if="project"
      v-model:visible="recordDialogVisible"
      :project-id="project.id"
    />
  </div>
</template>

<script setup lang="ts">
  // 项目工作台首页：作为默认主页，承载顶部「项目成员」入口的人员变更交互
  import { ref, computed, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import {
    Document,
    Clock,
    UserFilled,
    Setting,
    Search,
    Upload,
    Top,
    Plus
  } from '@element-plus/icons-vue'
  import { getProjectList } from '@/api/audit'
  import { ProjectStatus } from '@/types/audit'
  import type { AuditProject, ProjectStage, AuditProjectMember } from '@/types/audit'
  import { getProjectStages } from '@/api/audit'
  import { useUserStore } from '@/store/modules/user'
  import MemberManageDialog from '@/views/audit/project/components/MemberManageDialog.vue'
  import WorkTransferWizard from '@/views/audit/project/components/WorkTransferWizard.vue'
  import TransferRecordDialog from '@/views/audit/project/components/TransferRecordDialog.vue'

  defineOptions({ name: 'AuditWorkspace' })

  const userStore = useUserStore()

  // ==================== 项目与阶段数据 ====================
  const loading = ref(false)
  const project = ref<AuditProject | null>(null)
  const stages = ref<ProjectStage[]>([])
  const currentStageName = ref('')
  const activeNode = ref('审计方案')
  const searchText = ref('')

  // 左侧阶段导航分组（静态结构，贴合截图）
  const stageGroups = [
    { title: '项目概览', nodes: ['项目概览'] },
    { title: '准备阶段', nodes: ['审计方案', '审计通知书', '迎审清单', '审计事项'] },
    { title: '实施阶段', nodes: ['访谈', '风险评估', '工作底稿', '缺陷清单', '问题清单'] },
    { title: '报告阶段', nodes: ['初稿', '征求意见稿', '终稿'] }
  ]

  // 加载首个可用项目作为工作台默认项目
  async function loadData() {
    loading.value = true
    try {
      const res = await getProjectList({ page: 1, pageSize: 100 })
      const list: AuditProject[] = res.data.list
      // 优先选已启动且有成员的项目
      const target =
        list.find((p) => p.status !== ProjectStatus.Pending && p.members.length > 0) || list[0]
      project.value = target || null
      if (target) {
        currentStageName.value = target.currentStage || '准备阶段'
        const stagesRes = await getProjectStages(target.id)
        stages.value = stagesRes.data
      }
    } finally {
      loading.value = false
    }
  }

  // ==================== 人员变更交互 ====================
  const memberDialogVisible = ref(false)
  const wizardVisible = ref(false)
  const recordDialogVisible = ref(false)
  const changingMember = ref<AuditProjectMember | null>(null)

  const operatorName = computed(() => userStore.getUserInfo?.nickname || '当前用户')

  // 候选接收人：同项目其他成员，排除移出成员本人
  const transferCandidates = computed<AuditProjectMember[]>(() => {
    if (!project.value) return []
    return project.value.members.filter((m) => m.id !== changingMember.value?.id)
  })

  // 发起变更：打开工作移交向导
  function handleChangeMember(member: AuditProjectMember) {
    changingMember.value = member
    wizardVisible.value = true
  }

  // 移交成功后刷新
  function handleTransferSuccess() {
    ElMessage.success('工作已移交，可在「人员变更记录」中查看')
    loadData()
  }

  onMounted(loadData)
</script>

<style scoped lang="scss">
  .workspace-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    background: var(--el-bg-color);
    border-radius: 12px;
  }

  // 顶部标题栏
  .workspace-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .header-left {
      display: flex;
      gap: 12px;
      align-items: center;

      .project-title {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }

      .stage-select {
        width: 130px;
      }
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }
  }

  // 主体布局
  .workspace-main {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  // 左侧阶段导航
  .stage-nav-panel {
    flex-shrink: 0;
    width: 220px;
    padding: 16px 12px;
    overflow-y: auto;
    border-right: 1px solid var(--el-border-color-lighter);

    .nav-group {
      margin-bottom: 8px;

      .nav-group-title {
        padding: 8px 12px;
        margin-bottom: 4px;
        font-size: 13px;
        font-weight: 600;
        color: #606266;
        background: var(--el-fill-color-light);
        border-radius: 6px;
      }

      .nav-node {
        display: flex;
        gap: 8px;
        align-items: center;
        padding: 8px 12px 8px 20px;
        font-size: 14px;
        color: #606266;
        cursor: pointer;
        border-radius: 6px;

        &:hover {
          background: var(--el-fill-color-light);
        }

        // 选中态：蓝底高亮，与截图一致
        &.is-active {
          font-weight: 500;
          color: var(--el-color-primary);
          background: var(--el-color-primary-light-9);
        }

        .node-dot {
          width: 6px;
          height: 6px;
          background: #c0c4cc;
          border-radius: 50%;

          &.is-active {
            background: var(--el-color-primary);
          }
        }
      }
    }
  }

  // 右侧内容区
  .content-panel {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 16px 24px;
    overflow: hidden;

    .content-tabs {
      margin-bottom: 16px;
      border-bottom: 1px solid var(--el-border-color-lighter);

      .tab-item {
        display: inline-block;
        padding: 0 4px 12px;
        font-size: 14px;
        color: #606266;
        cursor: pointer;

        // 当前选中 Tab 下划线
        &.is-active {
          font-weight: 500;
          color: var(--el-color-primary);
          border-bottom: 2px solid var(--el-color-primary);
        }
      }
    }

    .content-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;

      .search-input {
        width: 240px;
      }

      .toolbar-right {
        display: flex;
        gap: 8px;
      }
    }

    .content-table {
      flex: 1;
    }
  }
</style>
