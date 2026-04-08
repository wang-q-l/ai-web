<template>
  <div class="audit-project-page">
    <!-- 筛选卡片 -->
    <el-card class="filter-card">
      <el-form :model="queryParams">
        <div class="filter-form-content">
          <el-form-item label="项目名称">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入项目名称或编号"
              clearable
              style="width: 220px"
            />
          </el-form-item>
          <el-form-item label="年度">
            <el-select
              v-model="queryParams.year"
              placeholder="全部年度"
              clearable
              style="width: 120px"
            >
              <el-option v-for="y in yearOptions" :key="y" :label="y" :value="y" />
            </el-select>
          </el-form-item>
          <el-form-item label="项目状态">
            <el-select
              v-model="queryParams.status"
              placeholder="全部状态"
              clearable
              style="width: 130px"
            >
              <el-option label="未启动" :value="0" />
              <el-option label="准备中" :value="1" />
              <el-option label="实施中" :value="2" />
              <el-option label="报告中" :value="3" />
              <el-option label="已完成" :value="4" />
            </el-select>
          </el-form-item>
          <el-form-item label="被审计单位">
            <el-input
              v-model="queryParams.auditedUnit"
              placeholder="请输入被审计单位"
              clearable
              style="width: 180px"
            />
          </el-form-item>
          <el-form-item label=" ">
            <div class="filter-buttons">
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button @click="handleReset">重置</el-button>
            </div>
          </el-form-item>
        </div>
      </el-form>
    </el-card>

    <!-- 数据卡片 -->
    <el-card class="data-card">
      <template #header>
        <div class="table-header">
          <span class="table-title">审计项目列表</span>
          <div class="header-buttons">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              新增项目
            </el-button>
          </div>
        </div>
      </template>
      <div class="table-container">
        <el-table :data="tableData" height="100%" v-loading="loading">
          <el-table-column label="序号" type="index" width="60" align="center" />
          <el-table-column label="年度" prop="year" width="80" align="center" />
          <el-table-column label="项目编号" prop="code" width="190" />
          <el-table-column label="项目名称" prop="name" min-width="180">
            <template #default="{ row }">
              <el-button
                v-if="row.status > 0"
                link
                type="primary"
                @click="handleWork(row)"
              >
                {{ row.name }}
              </el-button>
              <span v-else class="name-plain">{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="项目类型" prop="type" width="110" />
          <el-table-column label="被审计单位" prop="auditedUnit" min-width="140" />
          <el-table-column label="当前阶段" prop="currentStage" width="100">
            <template #default="{ row }">
              {{ row.currentStage || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="项目进度" width="130">
            <template #default="{ row }">
              <el-progress :percentage="row.progress" :stroke-width="8" />
            </template>
          </el-table-column>
          <el-table-column label="状态" width="90">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)" size="small">
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleDetail(row)">查看详情</el-button>
              <el-button
                v-if="row.status === 0"
                link
                type="primary"
                @click="handleLaunch(row)"
              >
                启动项目
              </el-button>
              <el-button
                v-if="row.status === 0"
                link
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button
                v-if="row.status === 0"
                link
                type="danger"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @change="loadData"
      />
    </el-card>

    <!-- 新增/编辑项目弹窗 -->
    <el-dialog
      v-model="projectDialogVisible"
      :title="projectDialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="projectFormRef"
        :model="projectForm"
        :rules="projectRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="项目名称" prop="name">
              <el-input v-model="projectForm.name" placeholder="请输入项目名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年度" prop="year">
              <el-select v-model="projectForm.year" placeholder="请选择年度" style="width: 100%">
                <el-option v-for="y in yearOptions" :key="y" :label="y" :value="y" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目类型" prop="type">
              <el-select v-model="projectForm.type" placeholder="请选择类型" style="width: 100%">
                <el-option label="财务审计" value="财务审计" />
                <el-option label="合规审计" value="合规审计" />
                <el-option label="专项审计" value="专项审计" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="被审计单位" prop="auditedUnit">
              <el-input v-model="projectForm.auditedUnit" placeholder="请输入被审计单位" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="审计目标" prop="auditGoal">
              <el-input
                v-model="projectForm.auditGoal"
                type="textarea"
                :rows="3"
                placeholder="请输入审计目标"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="项目描述">
              <el-input
                v-model="projectForm.description"
                type="textarea"
                :rows="2"
                placeholder="请输入项目描述（选填）"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="projectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleProjectSubmit" :loading="projectSubmitting">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 启动项目弹窗 -->
    <el-dialog
      v-model="launchDialogVisible"
      title="启动项目"
      width="720px"
      :close-on-click-modal="false"
    >
      <div class="launch-project-name">
        项目：<strong>{{ launchTargetProject?.name }}</strong>
      </div>
      <el-form
        ref="launchFormRef"
        :model="launchForm"
        :rules="launchRules"
        label-width="110px"
        style="margin-top: 16px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="组织形式" prop="organizationType">
              <el-select
                v-model="launchForm.organizationType"
                placeholder="请选择组织形式"
                style="width: 100%"
                @change="handleOrgTypeChange"
              >
                <el-option label="自主实施" :value="1" />
                <el-option label="完全委托" :value="2" />
                <el-option label="内外联合实施" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="审计实施机构" prop="auditOrganization">
              <el-input v-model="launchForm.auditOrganization" placeholder="请输入审计实施机构" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="审计期间" prop="auditPeriodStart">
              <el-date-picker
                v-model="launchForm.auditPeriodStart"
                type="date"
                placeholder="开始日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="至" prop="auditPeriodEnd" label-width="30px">
              <el-date-picker
                v-model="launchForm.auditPeriodEnd"
                type="date"
                placeholder="结束日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <!-- 完全委托/内外联合才显示中介机构 -->
          <el-col :span="24" v-if="needIntermediary">
            <el-form-item label="中介机构" prop="intermediaryName">
              <el-input
                v-model="launchForm.intermediaryName"
                placeholder="请输入中介机构名称"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 项目成员 -->
        <div class="member-section">
          <div class="member-section-header">
            <span class="section-title">项目成员</span>
            <el-button type="primary" size="small" @click="handleAddMember">
              <el-icon><Plus /></el-icon>
              添加成员
            </el-button>
          </div>
          <el-table :data="launchForm.members" size="small" style="margin-top: 8px">
            <el-table-column label="姓名" width="120">
              <template #default="{ $index }">
                <el-input
                  v-model="launchForm.members[$index].name"
                  placeholder="姓名"
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column label="角色" width="150">
              <template #default="{ $index }">
                <el-select
                  v-model="launchForm.members[$index].role"
                  placeholder="请选择角色"
                  size="small"
                  style="width: 100%"
                >
                  <el-option label="组长" value="组长" />
                  <el-option label="主审" value="主审" />
                  <el-option label="组员" value="组员" />
                  <el-option v-if="needIntermediary" label="项目经理" value="项目经理" />
                  <el-option v-if="needIntermediary" label="中介人员" value="中介人员" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="部门">
              <template #default="{ $index }">
                <el-input
                  v-model="launchForm.members[$index].department"
                  placeholder="部门（选填）"
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column label="联系电话" width="140">
              <template #default="{ $index }">
                <el-input
                  v-model="launchForm.members[$index].phone"
                  placeholder="电话（选填）"
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column label="" width="60" fixed="right">
              <template #default="{ $index }">
                <el-button link type="danger" @click="handleRemoveMember($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="member-empty" v-if="launchForm.members.length === 0">
            请添加项目成员
          </div>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="launchDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleLaunchSubmit" :loading="launchSubmitting">
          启动项目
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getProjectList, addProject, updateProject, deleteProject, launchProject } from '@/api/audit'
import { ProjectStatus, OrganizationType } from '@/types/audit'
import type { AuditProject, AuditProjectForm, LaunchProjectForm, AuditProjectMember, MemberRole } from '@/types/audit'

defineOptions({ name: 'AuditProject' })

const router = useRouter()

// ---- 列表 ----
const loading = ref(false)
const tableData = ref<AuditProject[]>([])
const total = ref(0)

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 6 }, (_, i) => String(currentYear - 2 + i))

const queryParams = reactive({
  name: '',
  year: '',
  status: null as number | null,
  auditedUnit: '',
  page: 1,
  pageSize: 10
})

const statusMap: Record<number, { label: string; type: 'primary' | 'success' | 'info' | 'warning' | 'danger' | '' }> = {
  [ProjectStatus.Pending]: { label: '未启动', type: 'info' },
  [ProjectStatus.Preparing]: { label: '准备中', type: 'warning' },
  [ProjectStatus.Executing]: { label: '实施中', type: 'primary' },
  [ProjectStatus.Reporting]: { label: '报告中', type: '' },
  [ProjectStatus.Completed]: { label: '已完成', type: 'success' }
}

function getStatusLabel(status: number) {
  return statusMap[status]?.label || '未知'
}
function getStatusTagType(status: number) {
  return statusMap[status]?.type || 'info'
}

async function loadData() {
  loading.value = true
  try {
    const res = await getProjectList(queryParams)
    tableData.value = res.data.list
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  queryParams.page = 1
  loadData()
}

function handleReset() {
  queryParams.name = ''
  queryParams.year = ''
  queryParams.status = null
  queryParams.auditedUnit = ''
  queryParams.page = 1
  loadData()
}

function handleWork(row: AuditProject) {
  router.push(`/audit/project/work/${row.id}`)
}

function handleDetail(row: AuditProject) {
  router.push(`/audit/project/detail/${row.id}`)
}

async function handleDelete(row: AuditProject) {
  try {
    await ElMessageBox.confirm(`确认删除项目"${row.name}"？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteProject(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch {
    // 用户取消
  }
}

// ---- 新增/编辑弹窗 ----
const projectDialogVisible = ref(false)
const projectDialogTitle = ref('新增项目')
const projectSubmitting = ref(false)
const projectFormRef = ref<FormInstance>()
const isEdit = ref(false)

const projectForm = reactive<AuditProjectForm>({
  name: '',
  year: String(currentYear),
  type: '',
  description: '',
  auditedUnit: '',
  auditGoal: ''
})

const projectRules: FormRules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  year: [{ required: true, message: '请选择年度', trigger: 'change' }],
  type: [{ required: true, message: '请选择项目类型', trigger: 'change' }],
  auditedUnit: [{ required: true, message: '请输入被审计单位', trigger: 'blur' }],
  auditGoal: [{ required: true, message: '请输入审计目标', trigger: 'blur' }]
}

function handleAdd() {
  isEdit.value = false
  projectDialogTitle.value = '新增项目'
  Object.assign(projectForm, {
    id: undefined,
    name: '',
    year: String(currentYear),
    type: '',
    description: '',
    auditedUnit: '',
    auditGoal: ''
  })
  projectFormRef.value?.clearValidate()
  projectDialogVisible.value = true
}

function handleEdit(row: AuditProject) {
  isEdit.value = true
  projectDialogTitle.value = '编辑项目'
  Object.assign(projectForm, {
    id: row.id,
    name: row.name,
    year: row.year,
    type: row.type,
    description: row.description,
    auditedUnit: row.auditedUnit,
    auditGoal: row.auditGoal
  })
  projectFormRef.value?.clearValidate()
  projectDialogVisible.value = true
}

async function handleProjectSubmit() {
  const valid = await projectFormRef.value?.validate().catch(() => false)
  if (!valid) return
  projectSubmitting.value = true
  try {
    if (isEdit.value) {
      await updateProject(projectForm)
      ElMessage.success('编辑成功')
    } else {
      await addProject(projectForm)
      ElMessage.success('新增成功')
    }
    projectDialogVisible.value = false
    loadData()
  } finally {
    projectSubmitting.value = false
  }
}

// ---- 启动项目弹窗 ----
const launchDialogVisible = ref(false)
const launchSubmitting = ref(false)
const launchFormRef = ref<FormInstance>()
const launchTargetProject = ref<AuditProject | null>(null)
let memberNextId = 200

const launchForm = reactive<LaunchProjectForm>({
  organizationType: OrganizationType.Self,
  auditOrganization: '',
  auditPeriodStart: '',
  auditPeriodEnd: '',
  intermediaryName: '',
  members: []
})

const needIntermediary = computed(
  () =>
    launchForm.organizationType === OrganizationType.FullDelegate ||
    launchForm.organizationType === OrganizationType.Joint
)

const launchRules: FormRules = {
  organizationType: [{ required: true, message: '请选择组织形式', trigger: 'change' }],
  auditOrganization: [{ required: true, message: '请输入审计实施机构', trigger: 'blur' }],
  auditPeriodStart: [{ required: true, message: '请选择审计期间开始日期', trigger: 'change' }],
  auditPeriodEnd: [{ required: true, message: '请选择审计期间结束日期', trigger: 'change' }],
  intermediaryName: [
    {
      validator: (_rule, _value, callback) => {
        if (needIntermediary.value && !launchForm.intermediaryName) {
          callback(new Error('请输入中介机构名称'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

function handleLaunch(row: AuditProject) {
  launchTargetProject.value = row
  Object.assign(launchForm, {
    organizationType: OrganizationType.Self,
    auditOrganization: '',
    auditPeriodStart: '',
    auditPeriodEnd: '',
    intermediaryName: '',
    members: []
  })
  launchFormRef.value?.clearValidate()
  launchDialogVisible.value = true
}

function handleOrgTypeChange() {
  // 切换组织形式时，移除不合适的角色成员
  if (!needIntermediary.value) {
    launchForm.members = launchForm.members.filter(
      (m) => m.role !== '项目经理' && m.role !== '中介人员'
    )
  }
  launchForm.intermediaryName = ''
  launchFormRef.value?.clearValidate()
}

function handleAddMember() {
  const member: AuditProjectMember = {
    id: memberNextId++,
    name: '',
    role: '组员' as MemberRole,
    department: '',
    phone: ''
  }
  launchForm.members.push(member)
}

function handleRemoveMember(index: number) {
  launchForm.members.splice(index, 1)
}

async function handleLaunchSubmit() {
  const valid = await launchFormRef.value?.validate().catch(() => false)
  if (!valid) return

  if (launchForm.members.length === 0) {
    ElMessage.warning('请至少添加一名项目成员')
    return
  }
  const hasLeader = launchForm.members.some((m) => m.role === '组长')
  if (!hasLeader) {
    ElMessage.warning('项目成员中必须包含组长')
    return
  }
  const emptyName = launchForm.members.some((m) => !m.name.trim())
  if (emptyName) {
    ElMessage.warning('请填写所有成员的姓名')
    return
  }

  launchSubmitting.value = true
  try {
    await launchProject(launchTargetProject.value!.id, launchForm)
    ElMessage.success('项目启动成功')
    launchDialogVisible.value = false
    loadData()
  } finally {
    launchSubmitting.value = false
  }
}

loadData()
</script>

<style scoped lang="scss">
.audit-project-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-card {
  flex-shrink: 0;
  border: none !important;
  box-shadow: none !important;
  border-radius: 12px;

  :deep(.el-card__body) {
    padding: 12px 20px;
  }

  .filter-form-content {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;

    :deep(.el-form-item) {
      margin-bottom: 0;
    }
  }

  .filter-buttons {
    display: flex;

    .el-button:not(:first-child) {
      margin-left: 12px;
    }
  }
}

.data-card {
  flex: 1;
  border: none !important;
  box-shadow: none !important;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  :deep(.el-card__body) {
    padding: 0 20px 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .table-title {
      font-size: 15px;
      font-weight: 600;
      color: #303133;
    }

    .header-buttons {
      .el-button:not(:first-child) {
        margin-left: 12px;
      }
    }
  }

  .table-container {
    flex: 1;
    overflow: hidden;
    margin-top: 16px;
  }

  .el-pagination {
    flex-shrink: 0;
    margin-top: 16px;
    justify-content: flex-end;
  }
}

.name-plain {
  font-size: 13px;
  color: #303133;
}

// 启动弹窗
.launch-project-name {
  padding: 10px 16px;
  background: #f5f7fa;
  border-radius: 6px;
  font-size: 13px;
  color: #606266;
  margin-bottom: 4px;
}

.member-section {
  margin-top: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 12px 16px;

  .member-section-header {
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

  .member-empty {
    padding: 16px;
    text-align: center;
    color: #c0c4cc;
    font-size: 13px;
  }
}
</style>
