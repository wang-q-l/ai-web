<template>
  <div class="audit-detail-page">
    <!-- 面包屑卡片 -->
    <el-card class="breadcrumb-card">
      <div class="breadcrumb-content">
        <div class="breadcrumb-left">
          <el-button text @click="handleBack">
            <el-icon><ArrowLeft /></el-icon>
            返回项目列表
          </el-button>
          <span class="divider">|</span>
          <span class="page-info">项目详情：{{ project?.name }}</span>
        </div>
        <div class="breadcrumb-actions" v-if="project">
          <el-button
            v-if="project.status > 0 && project.status < 4"
            type="primary"
            @click="handleWork"
          >
            进入作业
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 内容区域 -->
    <el-scrollbar class="content-scrollbar" v-loading="loading">
      <div class="detail-content" v-if="project">
        <!-- 基本信息 -->
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <span>项目基本信息</span>
              <el-tag :type="getStatusTagType(project.status)" size="small">
                {{ getStatusLabel(project.status) }}
              </el-tag>
            </div>
          </template>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="项目名称" :span="2">{{ project.name }}</el-descriptions-item>
            <el-descriptions-item label="项目编号">{{ project.code }}</el-descriptions-item>
            <el-descriptions-item label="年度">{{ project.year }}</el-descriptions-item>
            <el-descriptions-item label="项目类型">{{ project.type }}</el-descriptions-item>
            <el-descriptions-item label="被审计单位">{{ project.auditedUnit }}</el-descriptions-item>
            <el-descriptions-item label="当前阶段">{{ project.currentStage || '-' }}</el-descriptions-item>
            <el-descriptions-item label="项目进度" :span="2">
              <el-progress :percentage="project.progress" :stroke-width="10" style="width: 200px" />
            </el-descriptions-item>
            <el-descriptions-item label="整改完成率">{{ project.rectificationRate }}%</el-descriptions-item>
            <el-descriptions-item v-if="project.organizationType" label="组织形式">
              {{ orgTypeLabel(project.organizationType) }}
            </el-descriptions-item>
            <el-descriptions-item v-if="project.auditOrganization" label="审计实施机构">
              {{ project.auditOrganization }}
            </el-descriptions-item>
            <el-descriptions-item v-if="project.intermediaryName" label="中介机构">
              {{ project.intermediaryName }}
            </el-descriptions-item>
            <el-descriptions-item v-if="project.auditPeriodStart" label="审计期间">
              {{ project.auditPeriodStart }} 至 {{ project.auditPeriodEnd }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ project.createTime }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ project.updateTime }}</el-descriptions-item>
            <el-descriptions-item label="审计目标" :span="3">
              {{ project.auditGoal || '-' }}
            </el-descriptions-item>
            <el-descriptions-item v-if="project.description" label="项目描述" :span="3">
              {{ project.description }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 项目成员 -->
        <el-card class="info-card">
          <template #header>项目成员</template>
          <el-table :data="project.members" size="small">
            <el-table-column label="姓名" prop="name" width="100" />
            <el-table-column label="角色" prop="role" width="100" />
            <el-table-column label="部门" prop="department" width="150" />
            <el-table-column label="联系电话" prop="phone" />
          </el-table>
        </el-card>

        <!-- 项目可查看人员 -->
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <span>项目可查看人员</span>
              <el-button type="primary" size="small" @click="handleManageViewers">
                设置权限
              </el-button>
            </div>
          </template>
          <div class="viewers-section">
            <div class="viewer-group">
              <div class="viewer-group-title">审计端人员</div>
              <div class="viewer-list">
                <el-tag
                  v-for="viewer in auditViewers"
                  :key="viewer.id"
                  size="small"
                  style="margin-right: 8px; margin-bottom: 8px"
                >
                  {{ viewer.name }}
                  <span v-if="viewer.department" class="viewer-dept">（{{ viewer.department }}）</span>
                </el-tag>
                <span v-if="auditViewers.length === 0" class="empty-text">暂无</span>
              </div>
            </div>
            <div class="viewer-group">
              <div class="viewer-group-title">迎审端人员</div>
              <div class="viewer-list">
                <el-tag
                  v-for="viewer in receptionViewers"
                  :key="viewer.id"
                  size="small"
                  type="success"
                  style="margin-right: 8px; margin-bottom: 8px"
                >
                  {{ viewer.name }}
                  <span v-if="viewer.department" class="viewer-dept">（{{ viewer.department }}）</span>
                </el-tag>
                <span v-if="receptionViewers.length === 0" class="empty-text">暂无</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 阶段进展 -->
        <el-card class="info-card" v-if="stages.length > 0">
          <template #header>阶段进展</template>
          <el-steps :active="activeStepIndex" finish-status="success" class="stage-steps">
            <el-step
              v-for="stage in stages"
              :key="stage.id"
              :title="stage.stageName"
              :description="getStageDesc(stage)"
            />
          </el-steps>
          <el-table :data="stages" style="margin-top: 20px" size="small">
            <el-table-column label="阶段" prop="stageName" width="120" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStageTagType(row.status)" size="small">
                  {{ getStageStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="进度" width="140">
              <template #default="{ row }">
                <el-progress :percentage="row.progress" :stroke-width="6" />
              </template>
            </el-table-column>
            <el-table-column label="发现问题数" width="100" align="center">
              <template #default="{ row }">
                {{ row.findings?.length || 0 }}
              </template>
            </el-table-column>
            <el-table-column label="开始时间" prop="startTime" width="180" />
            <el-table-column label="完成时间" prop="completeTime" width="180" />
          </el-table>
        </el-card>
      </div>
    </el-scrollbar>

    <!-- 设置权限弹窗 -->
    <el-dialog
      v-model="viewersDialogVisible"
      title="设置项目可查看人员"
      width="700px"
      :close-on-click-modal="false"
    >
      <div class="viewers-dialog-content">
        <div class="viewer-section">
          <div class="section-header">
            <span class="section-title">审计端人员</span>
            <el-button type="primary" size="small" @click="handleAddViewer('audit')">
              <el-icon><Plus /></el-icon>
              添加
            </el-button>
          </div>
          <el-table :data="viewersForm.audit" size="small" style="margin-top: 8px">
            <el-table-column label="姓名" width="150">
              <template #default="{ $index }">
                <el-input
                  v-model="viewersForm.audit[$index].name"
                  placeholder="姓名"
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column label="部门">
              <template #default="{ $index }">
                <el-input
                  v-model="viewersForm.audit[$index].department"
                  placeholder="部门（选填）"
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column label="" width="80" fixed="right">
              <template #default="{ $index }">
                <el-button link type="danger" @click="handleRemoveViewer('audit', $index)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="empty-hint" v-if="viewersForm.audit.length === 0">暂无审计端人员</div>
        </div>

        <div class="viewer-section">
          <div class="section-header">
            <span class="section-title">迎审端人员</span>
            <el-button type="success" size="small" @click="handleAddViewer('reception')">
              <el-icon><Plus /></el-icon>
              添加
            </el-button>
          </div>
          <el-table :data="viewersForm.reception" size="small" style="margin-top: 8px">
            <el-table-column label="姓名" width="150">
              <template #default="{ $index }">
                <el-input
                  v-model="viewersForm.reception[$index].name"
                  placeholder="姓名"
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column label="部门">
              <template #default="{ $index }">
                <el-input
                  v-model="viewersForm.reception[$index].department"
                  placeholder="部门（选填）"
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column label="" width="80" fixed="right">
              <template #default="{ $index }">
                <el-button link type="danger" @click="handleRemoveViewer('reception', $index)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="empty-hint" v-if="viewersForm.reception.length === 0">暂无迎审端人员</div>
        </div>
      </div>
      <template #footer>
        <el-button @click="viewersDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleViewersSubmit" :loading="viewersSubmitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getProjectDetail, getProjectStages, setProjectViewers } from '@/api/audit'
import { ProjectStatus, StageStatus, OrganizationType } from '@/types/audit'
import type { AuditProject, ProjectStage, ProjectViewer } from '@/types/audit'

defineOptions({ name: 'AuditProjectDetail' })

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const project = ref<AuditProject | null>(null)
const stages = ref<ProjectStage[]>([])

const statusMap: Record<number, { label: string; type: 'primary' | 'success' | 'info' | 'warning' | 'danger' | '' }> = {
  [ProjectStatus.Pending]: { label: '未启动', type: 'info' },
  [ProjectStatus.Preparing]: { label: '准备中', type: 'warning' },
  [ProjectStatus.Executing]: { label: '实施中', type: 'primary' },
  [ProjectStatus.Reporting]: { label: '报告中', type: '' },
  [ProjectStatus.Completed]: { label: '已完成', type: 'success' }
}

const orgTypeLabels: Record<number, string> = {
  [OrganizationType.Self]: '自主实施',
  [OrganizationType.FullDelegate]: '完全委托',
  [OrganizationType.Joint]: '内外联合实施'
}

function orgTypeLabel(type: number) {
  return orgTypeLabels[type] || '-'
}

const stageStatusMap: Record<number, { label: string; type: 'primary' | 'success' | 'info' | 'warning' | 'danger' | '' }> = {
  [StageStatus.NotStarted]: { label: '未开始', type: 'info' },
  [StageStatus.InProgress]: { label: '进行中', type: 'primary' },
  [StageStatus.Completed]: { label: '已完成', type: 'success' },
  [StageStatus.Approved]: { label: '已审核', type: 'success' }
}

const activeStepIndex = computed(() => {
  const idx = stages.value.findIndex((s) => s.status === StageStatus.InProgress)
  return idx === -1 ? stages.value.length : idx
})

function getStatusLabel(status: number) {
  return statusMap[status]?.label || '未知'
}

function getStatusTagType(status: number) {
  return statusMap[status]?.type || 'info'
}

function getStageStatusLabel(status: number) {
  return stageStatusMap[status]?.label || '未知'
}

function getStageTagType(status: number) {
  return stageStatusMap[status]?.type || 'info'
}

function getStageDesc(stage: ProjectStage) {
  if (stage.startTime) {
    return stage.completeTime ? `已完成` : `进行中`
  }
  return '未开始'
}

function handleBack() {
  router.push('/audit')
}

function handleWork() {
  router.push(`/audit/project/work/${route.params.id}`)
}

// ---- 权限管理 ----
const auditViewers = computed(() => project.value?.viewers.filter((v) => v.type === 'audit') || [])
const receptionViewers = computed(() => project.value?.viewers.filter((v) => v.type === 'reception') || [])

const viewersDialogVisible = ref(false)
const viewersSubmitting = ref(false)
let viewerNextId = 1000

const viewersForm = reactive<{
  audit: ProjectViewer[]
  reception: ProjectViewer[]
}>({
  audit: [],
  reception: []
})

function handleManageViewers() {
  // 初始化表单数据
  viewersForm.audit = auditViewers.value.map((v) => ({ ...v }))
  viewersForm.reception = receptionViewers.value.map((v) => ({ ...v }))
  viewersDialogVisible.value = true
}

function handleAddViewer(type: 'audit' | 'reception') {
  const viewer: ProjectViewer = {
    id: viewerNextId++,
    name: '',
    type,
    department: ''
  }
  viewersForm[type].push(viewer)
}

function handleRemoveViewer(type: 'audit' | 'reception', index: number) {
  viewersForm[type].splice(index, 1)
}

async function handleViewersSubmit() {
  // 校验姓名不能为空
  const allViewers = [...viewersForm.audit, ...viewersForm.reception]
  const emptyName = allViewers.some((v) => !v.name.trim())
  if (emptyName) {
    ElMessage.warning('请填写所有人员的姓名')
    return
  }

  viewersSubmitting.value = true
  try {
    await setProjectViewers(Number(route.params.id), { viewers: allViewers })
    ElMessage.success('权限设置成功')
    viewersDialogVisible.value = false
    await loadData()
  } finally {
    viewersSubmitting.value = false
  }
}

async function loadData() {
  const id = Number(route.params.id)
  loading.value = true
  try {
    const [projectRes, stagesRes] = await Promise.all([
      getProjectDetail(id),
      getProjectStages(id)
    ])
    project.value = projectRes.data
    stages.value = stagesRes.data
  } finally {
    loading.value = false
  }
}

loadData()
</script>

<style scoped lang="scss">
.audit-detail-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.breadcrumb-card {
  flex-shrink: 0;
  border: none !important;
  box-shadow: none !important;
  border-radius: 12px;

  :deep(.el-card__body) {
    padding: 0 20px;
    height: 60px;
    display: flex;
    align-items: center;
  }

  .breadcrumb-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 60px;

    .breadcrumb-left {
      display: flex;
      align-items: center;
      gap: 12px;

      .el-button {
        font-size: 14px;
        color: #606266;
        padding: 0;

        &:hover {
          color: var(--el-color-primary);
        }

        .el-icon {
          font-size: 16px;
        }
      }

      .divider {
        color: #dcdfe6;
        font-size: 14px;
      }

      .page-info {
        font-size: 14px;
        color: #303133;
        font-weight: 500;
      }
    }
  }
}

.content-scrollbar {
  flex: 1;
  overflow: hidden;

  :deep(.el-scrollbar__view) {
    padding-bottom: 20px;
  }
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  border: none !important;
  box-shadow: none !important;
  border-radius: 12px;

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 600;
  }
}

.stage-steps {
  padding: 8px 0;
}

// 权限管理
.viewers-section {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .viewer-group {
    .viewer-group-title {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 8px;
    }

    .viewer-list {
      display: flex;
      flex-wrap: wrap;
      align-items: center;

      .viewer-dept {
        font-size: 12px;
        color: #909399;
      }

      .empty-text {
        font-size: 13px;
        color: #c0c4cc;
      }
    }
  }
}

.viewers-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 24px;

  .viewer-section {
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;

      .section-title {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
      }
    }

    .empty-hint {
      padding: 16px;
      text-align: center;
      color: #c0c4cc;
      font-size: 13px;
    }
  }
}
</style>
