<template>
  <div class="audit-work-page">
    <!-- 面包屑卡片 -->
    <el-card class="breadcrumb-card">
      <div class="breadcrumb-content">
        <div class="breadcrumb-left">
          <el-button text @click="handleBack">
            <el-icon><ArrowLeft /></el-icon>
            返回项目列表
          </el-button>
          <span class="divider">|</span>
          <span class="page-info">{{ project?.name }}</span>
        </div>
        <div class="breadcrumb-actions" v-if="currentStage">
          <el-tag :type="getStageTagType(currentStage.status)" size="small" style="margin-right: 12px">
            {{ getStageStatusLabel(currentStage.status) }}
          </el-tag>
          <el-button
            v-if="currentStage.status === StageStatus.InProgress"
            type="primary"
            @click="handleSaveStage"
            :loading="saving"
          >
            保存内容
          </el-button>
          <el-button
            v-if="currentStage.status === StageStatus.InProgress"
            type="success"
            @click="handleCompleteStage"
            :loading="completing"
          >
            完成阶段
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 主体内容 -->
    <div class="work-main" v-loading="loading">
      <!-- 左侧阶段导航 -->
      <el-card class="stage-nav-card">
        <template #header>作业阶段</template>
        <div class="stage-nav">
          <div
            v-for="stage in stages"
            :key="stage.id"
            class="stage-nav-item"
            :class="{
              'is-active': activeStageId === stage.id,
              'is-completed': stage.status === StageStatus.Completed || stage.status === StageStatus.Approved,
              'is-inprogress': stage.status === StageStatus.InProgress
            }"
            @click="handleSelectStage(stage)"
          >
            <div class="stage-icon">
              <el-icon v-if="stage.status === StageStatus.Completed || stage.status === StageStatus.Approved">
                <CircleCheck />
              </el-icon>
              <el-icon v-else-if="stage.status === StageStatus.InProgress">
                <Loading />
              </el-icon>
              <el-icon v-else><Clock /></el-icon>
            </div>
            <div class="stage-info">
              <div class="stage-name">{{ stage.stageName }}</div>
              <div class="stage-status-text">{{ getStageStatusLabel(stage.status) }}</div>
            </div>
            <el-progress
              :percentage="stage.progress"
              :stroke-width="4"
              :show-text="false"
              class="stage-progress"
            />
          </div>
        </div>
      </el-card>

      <!-- 右侧阶段内容 -->
      <div class="stage-content-wrap">
        <el-scrollbar class="stage-scrollbar" v-if="currentStage">
          <div class="stage-detail">
            <!-- 准备阶段 -->
            <template v-if="currentStage.stageName === '准备阶段'">
              <!-- 子节点导航 -->
              <el-card class="content-card sub-node-nav-card">
                <div class="sub-node-nav">
                  <div
                    v-for="node in prepareSubNodes"
                    :key="node.value"
                    class="sub-node-item"
                    :class="{ 'is-active': activeSubNode === node.value }"
                    @click="handleSelectSubNode(node.value)"
                  >
                    <div class="sub-node-icon">
                      <el-icon v-if="node.value === 'notice'"><Document /></el-icon>
                      <el-icon v-else-if="node.value === 'items'"><List /></el-icon>
                      <el-icon v-else><Tickets /></el-icon>
                    </div>
                    <div class="sub-node-name">{{ node.label }}</div>
                  </div>
                </div>
              </el-card>

              <!-- 审计通知书 -->
              <template v-if="activeSubNode === 'notice'">
                <el-card class="content-card">
                  <template #header>审计通知书</template>
                  <div class="notice-content">{{ currentStage.noticeContent || '暂无通知书内容' }}</div>
                </el-card>
              </template>

              <!-- 审计事项 -->
              <template v-if="activeSubNode === 'items'">
                <el-card class="content-card">
                  <template #header>
                    <div class="card-header">
                      <span>审计事项（{{ currentStage.auditItems?.length || 0 }}项）</span>
                      <div v-if="currentStage.status === StageStatus.InProgress">
                        <el-button type="primary" size="small" @click="handleAddItem">
                          <el-icon><Plus /></el-icon>
                          新增事项
                        </el-button>
                        <el-button type="success" size="small" @click="handleGeneratePlan" :loading="generating">
                          生成方案
                        </el-button>
                      </div>
                    </div>
                  </template>
                  <el-table :data="currentStage.auditItems" size="small">
                    <el-table-column label="事项名称" prop="name" width="150" />
                    <el-table-column label="事项描述" prop="description" min-width="200" show-overflow-tooltip />
                    <el-table-column label="审计内容" prop="content" min-width="200" show-overflow-tooltip />
                    <el-table-column label="分配人员" width="200">
                      <template #default="{ row }">
                        <span v-if="row.assignedMembers?.length">
                          {{ row.assignedMembers.map((m: any) => m.name).join('、') }}
                        </span>
                        <span v-else style="color: #c0c4cc">未分配</span>
                      </template>
                    </el-table-column>
                    <el-table-column label="创建时间" prop="createTime" width="180" />
                    <el-table-column
                      v-if="currentStage.status === StageStatus.InProgress"
                      label="操作"
                      width="150"
                      fixed="right"
                    >
                      <template #default="{ row }">
                        <el-button link @click="handleEditItem(row)">编辑</el-button>
                        <el-button link type="danger" @click="handleDeleteItem(row.id)">删除</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                  <el-empty v-if="!currentStage.auditItems?.length" description="暂无审计事项" :image-size="60" />
                </el-card>
              </template>

              <!-- 审计方案 -->
              <template v-if="activeSubNode === 'plan'">
                <el-card class="content-card">
                  <template #header>审计实施方案</template>
                  <div class="plan-content" v-if="currentStage.implementationPlan">
                    <div v-html="renderMarkdown(currentStage.implementationPlan)"></div>
                  </div>
                  <el-empty v-else description="请先添加审计事项并生成方案" :image-size="80" />
                </el-card>
              </template>
            </template>

            <!-- 实施阶段 -->
            <template v-if="currentStage.stageName === '实施阶段'">
              <!-- 审计发现 -->
              <el-card class="content-card">
                <template #header>
                  <div class="card-header">
                    <span>审计发现问题（{{ currentStage.findings?.length || 0 }}项）</span>
                    <el-button
                      v-if="currentStage.status === StageStatus.InProgress"
                      type="primary"
                      size="small"
                      @click="handleAddFinding"
                    >
                      <el-icon><Plus /></el-icon>
                      添加发现
                    </el-button>
                  </div>
                </template>
                <el-table :data="currentStage.findings" size="small">
                  <el-table-column label="问题等级" width="100">
                    <template #default="{ row }">
                      <el-tag
                        :type="row.level === 1 ? 'danger' : row.level === 2 ? 'warning' : 'info'"
                        size="small"
                      >
                        {{ row.level === 1 ? '严重' : row.level === 2 ? '重要' : '一般' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="问题描述" prop="description" min-width="200" />
                  <el-table-column label="涉及部门" prop="department" width="120" />
                  <el-table-column label="发现时间" prop="createTime" width="180" />
                  <el-table-column
                    v-if="currentStage.status === StageStatus.InProgress"
                    label="操作"
                    width="80"
                    fixed="right"
                  >
                    <template #default="{ row }">
                      <el-button link type="danger" @click="handleDeleteFinding(row.id)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <el-empty v-if="!currentStage.findings?.length" description="暂无审计发现" :image-size="60" />
              </el-card>
              <!-- 审计资料 -->
              <el-card class="content-card">
                <template #header>
                  <div class="card-header">
                    <span>审计资料</span>
                    <el-button
                      v-if="currentStage.status === StageStatus.InProgress"
                      type="primary"
                      size="small"
                      @click="handleUploadMaterial"
                    >上传资料</el-button>
                  </div>
                </template>
                <div class="doc-list" v-if="currentStage.materials?.length">
                  <div v-for="doc in currentStage.materials" :key="doc.id" class="doc-item">
                    <el-icon><Document /></el-icon>
                    <span class="doc-name">{{ doc.name }}</span>
                    <span class="doc-size">{{ formatSize(doc.size) }}</span>
                    <span class="doc-time">{{ doc.uploadTime }}</span>
                  </div>
                </div>
                <el-empty v-else description="暂无审计资料" :image-size="60" />
              </el-card>
            </template>

            <!-- 报告阶段 -->
            <template v-if="currentStage.stageName === '报告阶段'">
              <!-- 审计报告 -->
              <el-card class="content-card">
                <template #header>审计报告内容</template>
                <el-input
                  v-model="stageForm.reportContent"
                  type="textarea"
                  :rows="10"
                  placeholder="请录入审计报告内容，包括审计概述、发现问题汇总、审计结论及建议..."
                  :disabled="currentStage.status !== StageStatus.InProgress"
                />
              </el-card>
              <!-- 报告文档 -->
              <el-card class="content-card">
                <template #header>
                  <div class="card-header">
                    <span>报告文档</span>
                    <el-button
                      v-if="currentStage.status === StageStatus.InProgress"
                      type="primary"
                      size="small"
                      @click="handleUploadReport"
                    >上传报告</el-button>
                  </div>
                </template>
                <div class="doc-list" v-if="currentStage.reportDocuments?.length">
                  <div v-for="doc in currentStage.reportDocuments" :key="doc.id" class="doc-item">
                    <el-icon><Document /></el-icon>
                    <span class="doc-name">{{ doc.name }}</span>
                    <span class="doc-size">{{ formatSize(doc.size) }}</span>
                    <span class="doc-time">{{ doc.uploadTime }}</span>
                  </div>
                </div>
                <el-empty v-else description="暂无报告文档" :image-size="60" />
              </el-card>
            </template>

            <!-- 后续审计 -->
            <template v-if="currentStage.stageName === '后续审计'">
              <!-- 复审意见 -->
              <el-card class="content-card">
                <template #header>复审意见</template>
                <el-input
                  v-model="stageForm.reviewComment"
                  type="textarea"
                  :rows="6"
                  placeholder="请录入后续审计意见和整改跟踪情况..."
                  :disabled="currentStage.status !== StageStatus.InProgress"
                />
              </el-card>
              <!-- 问题整改情况汇总 -->
              <el-card class="content-card">
                <template #header>问题整改情况汇总</template>
                <el-empty description="整改数据将从整改管理模块同步" :image-size="80" />
              </el-card>
            </template>

            <!-- 工作记录（所有阶段通用） -->
            <el-card class="content-card">
              <template #header>
                <div class="card-header">
                  <span>工作记录</span>
                </div>
              </template>
              <div class="work-record-input" v-if="currentStage.status === StageStatus.InProgress">
                <el-input
                  v-model="newRecord"
                  type="textarea"
                  :rows="2"
                  placeholder="请录入本次工作情况记录..."
                  style="margin-bottom: 8px"
                />
                <el-button type="primary" size="small" @click="handleAddRecord" :loading="addingRecord">
                  添加记录
                </el-button>
              </div>
              <div class="record-list">
                <div
                  v-for="record in currentStage.workRecords"
                  :key="record.id"
                  class="record-item"
                >
                  <div class="record-header">
                    <span class="record-creator">{{ record.creatorName }}</span>
                    <span class="record-time">{{ record.createTime }}</span>
                  </div>
                  <div class="record-content">{{ record.content }}</div>
                </div>
                <el-empty v-if="!currentStage.workRecords?.length" description="暂无工作记录" :image-size="60" />
              </div>
            </el-card>
          </div>
        </el-scrollbar>
      </div>
    </div>

    <!-- 添加审计发现弹窗 -->
    <el-dialog v-model="findingDialogVisible" title="添加审计发现" width="560px">
      <el-form :model="findingForm" label-width="90px" ref="findingFormRef">
        <el-form-item label="问题等级" prop="level" :rules="[{ required: true, message: '请选择问题等级' }]">
          <el-select v-model="findingForm.level" style="width: 100%">
            <el-option label="严重" :value="1" />
            <el-option label="重要" :value="2" />
            <el-option label="一般" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="涉及部门" prop="department" :rules="[{ required: true, message: '请输入涉及部门' }]">
          <el-input v-model="findingForm.department" placeholder="请输入涉及部门" />
        </el-form-item>
        <el-form-item label="问题描述" prop="description" :rules="[{ required: true, message: '请输入问题描述' }]">
          <el-input
            v-model="findingForm.description"
            type="textarea"
            :rows="4"
            placeholder="请详细描述审计发现的问题"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="findingDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitFinding" :loading="addingFinding">确定</el-button>
      </template>
    </el-dialog>

    <!-- 添加/编辑审计事项弹窗 -->
    <el-dialog
      v-model="itemDialogVisible"
      :title="itemForm.id ? '编辑审计事项' : '新增审计事项'"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form :model="itemForm" label-width="90px" ref="itemFormRef">
        <el-form-item label="事项名称" prop="name" :rules="[{ required: true, message: '请输入事项名称' }]">
          <el-input v-model="itemForm.name" placeholder="请输入事项名称" />
        </el-form-item>
        <el-form-item label="事项描述" prop="description" :rules="[{ required: true, message: '请输入事项描述' }]">
          <el-input
            v-model="itemForm.description"
            type="textarea"
            :rows="2"
            placeholder="请简要描述审计事项的目标"
          />
        </el-form-item>
        <el-form-item label="审计内容" prop="content" :rules="[{ required: true, message: '请输入审计内容' }]">
          <el-input
            v-model="itemForm.content"
            type="textarea"
            :rows="4"
            placeholder="请详细描述审计的具体内容和步骤"
          />
        </el-form-item>
        <el-form-item label="分配人员">
          <el-select
            v-model="itemForm.assignedMemberIds"
            multiple
            placeholder="请选择审计人员"
            style="width: 100%"
          >
            <el-option
              v-for="member in project?.members"
              :key="member.id"
              :label="`${member.name}（${member.role}）`"
              :value="member.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="itemDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitItem" :loading="submittingItem">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInstance } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Plus, CircleCheck, Loading, Clock, Document, List, Tickets } from '@element-plus/icons-vue'
import {
  getProjectDetail,
  getProjectStages,
  saveStageContent,
  completeStage,
  addFinding,
  deleteFinding,
  addWorkRecord,
  addAuditItem,
  updateAuditItem,
  deleteAuditItem,
  generatePlan
} from '@/api/audit'
import { StageStatus, PrepareSubNode } from '@/types/audit'
import type { AuditProject, ProjectStage, AuditProjectMember } from '@/types/audit'

defineOptions({ name: 'AuditProjectWork' })

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const saving = ref(false)
const completing = ref(false)
const addingRecord = ref(false)
const addingFinding = ref(false)
const submittingItem = ref(false)
const generating = ref(false)

const project = ref<AuditProject | null>(null)
const stages = ref<ProjectStage[]>([])
const activeStageId = ref<number>(0)
const activeSubNode = ref<string>(PrepareSubNode.Notice)
const newRecord = ref('')

const findingDialogVisible = ref(false)
const findingFormRef = ref<FormInstance>()
const findingForm = reactive({
  level: 2 as number,
  department: '',
  description: ''
})

const itemDialogVisible = ref(false)
const itemFormRef = ref<FormInstance>()
const itemForm = reactive({
  id: 0,
  name: '',
  description: '',
  content: '',
  assignedMemberIds: [] as number[]
})

const stageForm = reactive({
  auditPlan: '',
  reportContent: '',
  reviewComment: ''
})

const prepareSubNodes = [
  { label: '审计通知书', value: PrepareSubNode.Notice },
  { label: '审计事项', value: PrepareSubNode.Items },
  { label: '审计方案', value: PrepareSubNode.Plan }
]

const currentStage = computed(() => {
  return stages.value.find((s) => s.id === activeStageId.value) || null
})

const stageStatusMap: Record<number, { label: string; type: 'primary' | 'success' | 'info' | 'warning' | 'danger' | '' }> = {
  [StageStatus.NotStarted]: { label: '未开始', type: 'info' },
  [StageStatus.InProgress]: { label: '进行中', type: 'primary' },
  [StageStatus.Completed]: { label: '已完成', type: 'success' },
  [StageStatus.Approved]: { label: '已审核', type: 'success' }
}

function getStageStatusLabel(status: number) {
  return stageStatusMap[status]?.label || '未知'
}

function getStageTagType(status: number) {
  return stageStatusMap[status]?.type || 'info'
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + 'B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB'
  return (bytes / 1024 / 1024).toFixed(1) + 'MB'
}

function renderMarkdown(text: string) {
  return text
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^\*\*(.+?)\*\*$/gm, '<strong>$1</strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^---$/gm, '<hr>')
    .replace(/^\| (.+) \|$/gm, (match) => {
      const cells = match.split('|').filter(c => c.trim())
      return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>'
    })
    .replace(/\n/g, '<br>')
}

function handleSelectStage(stage: ProjectStage) {
  activeStageId.value = stage.id
  syncStageForm(stage)
  if (stage.stageName === '准备阶段') {
    activeSubNode.value = stage.currentSubNode || PrepareSubNode.Notice
  }
}

function handleSelectSubNode(node: string) {
  activeSubNode.value = node
}

function syncStageForm(stage: ProjectStage) {
  stageForm.auditPlan = stage.auditPlan || ''
  stageForm.reportContent = stage.reportContent || ''
  stageForm.reviewComment = stage.reviewComment || ''
}

function handleBack() {
  router.push('/audit')
}

async function handleSaveStage() {
  if (!currentStage.value) return
  saving.value = true
  try {
    const data: any = {}
    const stageName = currentStage.value.stageName
    if (stageName === '准备阶段') data.auditPlan = stageForm.auditPlan
    if (stageName === '报告阶段') data.reportContent = stageForm.reportContent
    if (stageName === '后续审计') data.reviewComment = stageForm.reviewComment

    await saveStageContent(Number(route.params.id), activeStageId.value, data)
    ElMessage.success('保存成功')
    await refreshStages()
  } finally {
    saving.value = false
  }
}

async function handleCompleteStage() {
  if (!currentStage.value) return
  try {
    await ElMessageBox.confirm(
      `确认完成"${currentStage.value.stageName}"？完成后将自动进入下一阶段。`,
      '提示',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
    completing.value = true
    await completeStage(Number(route.params.id), activeStageId.value)
    ElMessage.success('阶段已完成')
    await loadData()
  } catch {
    // 用户取消
  } finally {
    completing.value = false
  }
}

function handleAddFinding() {
  findingForm.level = 2
  findingForm.department = ''
  findingForm.description = ''
  findingDialogVisible.value = true
}

async function handleSubmitFinding() {
  const valid = await findingFormRef.value?.validate().catch(() => false)
  if (!valid) return
  addingFinding.value = true
  try {
    await addFinding(Number(route.params.id), activeStageId.value, {
      level: findingForm.level,
      department: findingForm.department,
      description: findingForm.description,
      evidence: []
    })
    ElMessage.success('添加成功')
    findingDialogVisible.value = false
    await refreshStages()
  } finally {
    addingFinding.value = false
  }
}

async function handleDeleteFinding(findingId: number) {
  try {
    await ElMessageBox.confirm('确认删除该审计发现？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteFinding(Number(route.params.id), activeStageId.value, findingId)
    ElMessage.success('删除成功')
    await refreshStages()
  } catch {
    // 用户取消
  }
}

async function handleAddRecord() {
  if (!newRecord.value.trim()) {
    ElMessage.warning('请输入工作记录内容')
    return
  }
  addingRecord.value = true
  try {
    await addWorkRecord(Number(route.params.id), activeStageId.value, newRecord.value.trim())
    newRecord.value = ''
    ElMessage.success('记录已添加')
    await refreshStages()
  } finally {
    addingRecord.value = false
  }
}

function handleAddItem() {
  itemForm.id = 0
  itemForm.name = ''
  itemForm.description = ''
  itemForm.content = ''
  itemForm.assignedMemberIds = []
  itemDialogVisible.value = true
}

function handleEditItem(item: any) {
  itemForm.id = item.id
  itemForm.name = item.name
  itemForm.description = item.description
  itemForm.content = item.content
  itemForm.assignedMemberIds = item.assignedMembers?.map((m: AuditProjectMember) => m.id) || []
  itemDialogVisible.value = true
}

async function handleSubmitItem() {
  const valid = await itemFormRef.value?.validate().catch(() => false)
  if (!valid) return

  const assignedMembers = project.value?.members.filter((m) =>
    itemForm.assignedMemberIds.includes(m.id)
  ) || []

  submittingItem.value = true
  try {
    if (itemForm.id) {
      await updateAuditItem(Number(route.params.id), activeStageId.value, {
        id: itemForm.id,
        name: itemForm.name,
        description: itemForm.description,
        content: itemForm.content,
        assignedMembers
      })
      ElMessage.success('更新成功')
    } else {
      await addAuditItem(Number(route.params.id), activeStageId.value, {
        name: itemForm.name,
        description: itemForm.description,
        content: itemForm.content,
        assignedMembers
      })
      ElMessage.success('添加成功')
    }
    itemDialogVisible.value = false
    await refreshStages()
  } finally {
    submittingItem.value = false
  }
}

async function handleDeleteItem(itemId: number) {
  try {
    await ElMessageBox.confirm('确认删除该审计事项？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteAuditItem(Number(route.params.id), activeStageId.value, itemId)
    ElMessage.success('删除成功')
    await refreshStages()
  } catch {
    // 用户取消
  }
}

async function handleGeneratePlan() {
  if (!currentStage.value?.auditItems?.length) {
    ElMessage.warning('请先添加审计事项')
    return
  }
  try {
    await ElMessageBox.confirm(
      '确认根据当前审计事项生成审计实施方案？',
      '提示',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'info' }
    )
    generating.value = true
    await generatePlan(Number(route.params.id), activeStageId.value)
    ElMessage.success('方案生成成功')
    await refreshStages()
    activeSubNode.value = PrepareSubNode.Plan
  } catch {
    // 用户取消
  } finally {
    generating.value = false
  }
}

function handleUploadPlan() {
  ElMessage.info('文件上传功能待对接实际存储服务')
}

function handleUploadMaterial() {
  ElMessage.info('文件上传功能待对接实际存储服务')
}

function handleUploadReport() {
  ElMessage.info('文件上传功能待对接实际存储服务')
}

async function refreshStages() {
  const res = await getProjectStages(Number(route.params.id))
  stages.value = res.data
  if (currentStage.value) {
    syncStageForm(currentStage.value)
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

    // 默认选中进行中的阶段，否则选第一个
    const inProgressStage = stagesRes.data.find(
      (s: ProjectStage) => s.status === StageStatus.InProgress
    )
    const firstStage = inProgressStage || stagesRes.data[0]
    if (firstStage) {
      activeStageId.value = firstStage.id
      syncStageForm(firstStage)
      if (firstStage.stageName === '准备阶段') {
        activeSubNode.value = firstStage.currentSubNode || PrepareSubNode.Notice
      }
    }
  } finally {
    loading.value = false
  }
}

loadData()
</script>

<style scoped lang="scss">
.audit-work-page {
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

    .breadcrumb-actions {
      display: flex;
      align-items: center;

      .el-button:not(:first-child) {
        margin-left: 12px;
      }
    }
  }
}

.work-main {
  flex: 1;
  display: flex;
  gap: 16px;
  overflow: hidden;
}

.stage-nav-card {
  width: 200px;
  flex-shrink: 0;
  border: none !important;
  box-shadow: none !important;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  :deep(.el-card__body) {
    padding: 0;
    flex: 1;
    overflow-y: auto;
  }

  .stage-nav {
    display: flex;
    flex-direction: column;
  }

  .stage-nav-item {
    padding: 14px 16px;
    cursor: pointer;
    border-bottom: 1px solid #f0f0f0;
    transition: background 0.2s;

    &:hover {
      background: #f5f7fa;
    }

    &.is-active {
      background: var(--el-color-primary-light-9);
      border-left: 3px solid var(--el-color-primary);
    }

    &.is-completed .stage-icon {
      color: var(--el-color-success);
    }

    &.is-inprogress .stage-icon {
      color: var(--el-color-primary);
    }

    .stage-icon {
      font-size: 16px;
      margin-bottom: 4px;
      color: #c0c4cc;
    }

    .stage-info {
      .stage-name {
        font-size: 13px;
        color: #303133;
        font-weight: 500;
      }

      .stage-status-text {
        font-size: 11px;
        color: #909399;
        margin-top: 2px;
      }
    }

    .stage-progress {
      margin-top: 8px;
    }
  }
}

.stage-content-wrap {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .stage-scrollbar {
    flex: 1;
    overflow: hidden;

    :deep(.el-scrollbar__view) {
      padding-bottom: 20px;
    }
  }
}

.stage-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.content-card {
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

.doc-list {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .doc-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #f5f7fa;
    border-radius: 6px;
    font-size: 13px;

    .el-icon {
      color: #409eff;
      font-size: 16px;
    }

    .doc-name {
      flex: 1;
      color: #303133;
    }

    .doc-size {
      color: #909399;
      font-size: 12px;
    }

    .doc-time {
      color: #c0c4cc;
      font-size: 12px;
    }
  }
}

.work-record-input {
  margin-bottom: 16px;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .record-item {
    padding: 12px;
    background: #f9fafb;
    border-radius: 8px;
    border-left: 3px solid var(--el-color-primary-light-5);

    .record-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 6px;

      .record-creator {
        font-size: 13px;
        font-weight: 500;
        color: #303133;
      }

      .record-time {
        font-size: 12px;
        color: #909399;
      }
    }

    .record-content {
      font-size: 13px;
      color: #606266;
      line-height: 1.6;
    }
  }
}

.sub-node-nav-card {
  :deep(.el-card__body) {
    padding: 16px;
  }

  .sub-node-nav {
    display: flex;
    gap: 12px;

    .sub-node-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px;
      background: #f5f7fa;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #e8edf3;
      }

      &.is-active {
        background: var(--el-color-primary-light-9);
        border: 2px solid var(--el-color-primary);

        .sub-node-icon {
          color: var(--el-color-primary);
        }

        .sub-node-name {
          color: var(--el-color-primary);
          font-weight: 600;
        }
      }

      .sub-node-icon {
        font-size: 24px;
        color: #909399;
        margin-bottom: 8px;
      }

      .sub-node-name {
        font-size: 14px;
        color: #606266;
      }
    }
  }
}

.notice-content {
  white-space: pre-wrap;
  line-height: 1.8;
  font-size: 14px;
  color: #303133;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.plan-content {
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  line-height: 1.8;
  font-size: 14px;
  color: #303133;

  :deep(h1) {
    font-size: 20px;
    font-weight: 600;
    margin: 16px 0 12px;
    color: #303133;
  }

  :deep(h2) {
    font-size: 18px;
    font-weight: 600;
    margin: 14px 0 10px;
    color: #303133;
  }

  :deep(h3) {
    font-size: 16px;
    font-weight: 600;
    margin: 12px 0 8px;
    color: #303133;
  }

  :deep(strong) {
    font-weight: 600;
    color: #303133;
  }

  :deep(hr) {
    margin: 16px 0;
    border: none;
    border-top: 1px solid #e4e7ed;
  }

  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;

    tr {
      border-bottom: 1px solid #e4e7ed;
    }

    td {
      padding: 8px 12px;
      border-right: 1px solid #e4e7ed;

      &:last-child {
        border-right: none;
      }
    }
  }
}
</style>
