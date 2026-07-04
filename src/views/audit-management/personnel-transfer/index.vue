<template>
  <div class="personnel-transfer-container">
    <!-- 步骤条卡片 -->
    <el-card class="steps-card">
      <el-steps :active="currentStep" align-center finish-status="success">
        <el-step title="选择变更人员" />
        <el-step title="选择移交文书" />
        <el-step title="选择接收人员" />
        <el-step title="确认移交" />
      </el-steps>
    </el-card>

    <!-- 内容卡片 -->
    <el-card class="content-card">
      <!-- 步骤1：选择变更人员 -->
      <div v-show="currentStep === 0" class="step-content">
        <div class="step-header">
          <h3>选择需要变更的审计人员</h3>
          <p class="step-desc">请选择离职或调岗的审计人员，系统将移交其创建的所有文书</p>
        </div>

        <div class="filter-section">
          <el-form :model="personnelQuery" inline>
            <el-form-item label="姓名">
              <el-input
                v-model="personnelQuery.name"
                placeholder="请输入姓名"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="工号">
              <el-input
                v-model="personnelQuery.employeeNo"
                placeholder="请输入工号"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="审计组">
              <el-select
                v-model="personnelQuery.auditGroup"
                placeholder="请选择审计组"
                clearable
                style="width: 200px"
              >
                <el-option label="第一审计组" value="第一审计组" />
                <el-option label="第二审计组" value="第二审计组" />
                <el-option label="第三审计组" value="第三审计组" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearchPersonnel">搜索</el-button>
              <el-button @click="handleResetPersonnel">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-table
          :data="personnelList"
          highlight-current-row
          @current-change="handleSelectPerson"
          style="margin-top: 16px"
        >
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="name" label="姓名" width="120" />
          <el-table-column prop="employeeNo" label="工号" width="120" />
          <el-table-column prop="department" label="部门" width="150" />
          <el-table-column prop="auditGroup" label="审计组" width="150" />
          <el-table-column prop="documentCount" label="待移交文书数量" width="150">
            <template #default="{ row }">
              <el-tag v-if="row.documentCount > 0" type="warning">
                {{ row.documentCount }} 份
              </el-tag>
              <el-tag v-else type="info">0 份</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button
                link
                type="primary"
                :disabled="!row.documentCount || row.documentCount === 0"
                @click="handleSelectFromPerson(row)"
              >
                选择
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 步骤2：选择移交文书 -->
      <div v-show="currentStep === 1" class="step-content">
        <div class="step-header">
          <h3>选择需要移交的文书</h3>
          <p class="step-desc">
            变更人员：<strong>{{ selectedFromPerson?.name }}</strong
            >（{{ selectedFromPerson?.employeeNo }}） - {{ selectedFromPerson?.auditGroup }}
          </p>
        </div>

        <el-table :data="documentList" :row-class-name="rowClassName" style="margin-top: 16px">
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
          <el-table-column prop="name" label="文书名称" min-width="200" />
          <el-table-column prop="type" label="文书类型" width="120" />
          <el-table-column prop="createTime" label="创建时间" width="180" />
          <el-table-column prop="statusText" label="状态" width="100">
            <template #default="{ row }">
              <el-tag v-if="row.status === 1" type="info">{{ row.statusText }}</el-tag>
              <el-tag v-else-if="row.status === 2" type="warning">{{ row.statusText }}</el-tag>
              <el-tag v-else type="success">{{ row.statusText }}</el-tag>
            </template>
          </el-table-column>
        </el-table>

        <div class="selection-info">
          已选择 <strong>{{ selectedDocuments.length }}</strong> 份文书
        </div>
      </div>

      <!-- 步骤3：选择接收人员 -->
      <div v-show="currentStep === 2" class="step-content">
        <div class="step-header">
          <h3>选择接收文书的审计人员</h3>
          <p class="step-desc">请选择接收文书的审计人员，建议选择同一审计组的人员</p>
        </div>

        <div class="filter-section">
          <el-form :model="receiverQuery" inline>
            <el-form-item label="姓名">
              <el-input
                v-model="receiverQuery.name"
                placeholder="请输入姓名"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="审计组">
              <el-select
                v-model="receiverQuery.auditGroup"
                placeholder="请选择审计组"
                clearable
                style="width: 200px"
              >
                <el-option label="第一审计组" value="第一审计组" />
                <el-option label="第二审计组" value="第二审计组" />
                <el-option label="第三审计组" value="第三审计组" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearchReceiver">搜索</el-button>
              <el-button @click="handleResetReceiver">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-table
          :data="receiverList"
          highlight-current-row
          @current-change="handleSelectReceiver"
          style="margin-top: 16px"
        >
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="name" label="姓名" width="120" />
          <el-table-column prop="employeeNo" label="工号" width="120" />
          <el-table-column prop="department" label="部门" width="150" />
          <el-table-column prop="auditGroup" label="审计组" width="150">
            <template #default="{ row }">
              <el-tag v-if="row.auditGroup === selectedFromPerson?.auditGroup" type="success">
                {{ row.auditGroup }}（推荐）
              </el-tag>
              <span v-else>{{ row.auditGroup }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="documentCount" label="当前文书数量" width="150" />
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button
                link
                type="primary"
                :disabled="row.id === selectedFromPerson?.id"
                @click="handleSelectToPerson(row)"
              >
                选择
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 步骤4：确认移交 -->
      <div v-show="currentStep === 3" class="step-content">
        <div class="step-header">
          <h3>确认移交信息</h3>
          <p class="step-desc">请仔细核对移交信息，确认无误后提交</p>
        </div>

        <div class="confirm-info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="变更人员">
              {{ selectedFromPerson?.name }}（{{ selectedFromPerson?.employeeNo }}）
            </el-descriptions-item>
            <el-descriptions-item label="所属审计组">
              {{ selectedFromPerson?.auditGroup }}
            </el-descriptions-item>
            <el-descriptions-item label="接收人员">
              {{ selectedToPerson?.name }}（{{ selectedToPerson?.employeeNo }}）
            </el-descriptions-item>
            <el-descriptions-item label="所属审计组">
              {{ selectedToPerson?.auditGroup }}
            </el-descriptions-item>
            <el-descriptions-item label="移交文书数量" :span="2">
              <el-tag type="warning">{{ selectedDocuments.length }} 份</el-tag>
            </el-descriptions-item>
          </el-descriptions>

          <div class="reason-section">
            <h4>移交原因</h4>
            <el-input
              v-model="transferReason"
              type="textarea"
              :rows="4"
              placeholder="请输入移交原因（选填），如：人员离职、岗位调动等"
              maxlength="200"
              show-word-limit
            />
          </div>

          <div class="document-list-section">
            <h4>移交文书清单</h4>
            <el-table :data="selectedDocuments" max-height="300">
              <el-table-column type="index" label="序号" width="60" />
              <el-table-column prop="name" label="文书名称" min-width="200" />
              <el-table-column prop="type" label="文书类型" width="120" />
              <el-table-column prop="statusText" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag v-if="row.status === 1" type="info">{{ row.statusText }}</el-tag>
                  <el-tag v-else-if="row.status === 2" type="warning">{{ row.statusText }}</el-tag>
                  <el-tag v-else type="success">{{ row.statusText }}</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>

      <!-- 底部操作按钮 -->
      <div class="step-actions">
        <el-button v-if="currentStep > 0" @click="handlePrevStep">上一步</el-button>
        <el-button
          v-if="currentStep < 3"
          type="primary"
          :disabled="!canNextStep"
          @click="handleNextStep"
        >
          下一步
        </el-button>
        <el-button
          v-if="currentStep === 3"
          type="primary"
          :loading="submitting"
          @click="handleSubmit"
        >
          确认移交
        </el-button>
        <el-button @click="handleCancel">取消</el-button>
      </div>
    </el-card>

    <!-- 移交记录卡片 -->
    <el-card class="records-card">
      <template #header>
        <div class="card-header">
          <span>移交记录</span>
          <el-button link type="primary" @click="handleRefreshRecords">刷新</el-button>
        </div>
      </template>

      <el-table :data="transferRecords" max-height="400">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column label="变更人员" width="150">
          <template #default="{ row }">
            {{ row.fromPersonName }}（{{ row.fromPersonNo }}）
          </template>
        </el-table-column>
        <el-table-column label="接收人员" width="150">
          <template #default="{ row }"> {{ row.toPersonName }}（{{ row.toPersonNo }}） </template>
        </el-table-column>
        <el-table-column prop="documentCount" label="移交文书数量" width="120">
          <template #default="{ row }">
            <el-tag type="warning">{{ row.documentCount }} 份</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="移交原因" min-width="150" show-overflow-tooltip />
        <el-table-column prop="transferTime" label="移交时间" width="180" />
        <el-table-column prop="operator" label="操作人" width="100" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type {
    Personnel,
    Document,
    TransferRecord,
    PersonnelQueryParams
  } from '@/types/audit-management/personnel-transfer'
  import {
    getPersonnelList,
    getPersonnelDocuments,
    transferDocuments,
    getTransferRecords
  } from '@/api/audit-management/personnel-transfer'

  defineOptions({
    name: 'PersonnelTransfer'
  })

  // 当前步骤
  const currentStep = ref(0)

  // 人员查询参数
  const personnelQuery = ref<PersonnelQueryParams>({
    name: '',
    employeeNo: '',
    auditGroup: ''
  })

  // 接收人员查询参数
  const receiverQuery = ref<PersonnelQueryParams>({
    name: '',
    auditGroup: ''
  })

  // 人员列表
  const personnelList = ref<Personnel[]>([])
  const receiverList = ref<Personnel[]>([])

  // 选中的人员
  const selectedFromPerson = ref<Personnel>()
  const selectedToPerson = ref<Personnel>()

  // 文书列表
  const documentList = ref<Document[]>([])

  // 已勾选的行ID（勾选列与序号列合并，自行管理选中态）
  const selectedIds = ref<(number | string)[]>([])

  // selectedDocuments 由 selectedIds 派生，供后续步骤使用
  const selectedDocuments = computed(() =>
    documentList.value.filter((item) => selectedIds.value.includes(item.id))
  )

  // 全选态：当前页全部勾选时为 true
  const allChecked = computed(
    () => documentList.value.length > 0 && selectedIds.value.length === documentList.value.length
  )
  // 半选态：部分勾选
  const isIndeterminate = computed(
    () => selectedIds.value.length > 0 && selectedIds.value.length < documentList.value.length
  )

  // 表头全选/取消全选
  const handleCheckAll = (val: boolean | string | number) => {
    selectedIds.value = val ? documentList.value.map((item) => item.id) : []
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
  const rowClassName = ({ row }: { row: Document }) => {
    return selectedIds.value.includes(row.id) ? 'row-checked' : ''
  }

  // 移交原因
  const transferReason = ref('')

  // 移交记录
  const transferRecords = ref<TransferRecord[]>([])

  // 提交状态
  const submitting = ref(false)

  // 是否可以进入下一步
  const canNextStep = computed(() => {
    if (currentStep.value === 0) {
      return !!selectedFromPerson.value
    }
    if (currentStep.value === 1) {
      return selectedDocuments.value.length > 0
    }
    if (currentStep.value === 2) {
      return !!selectedToPerson.value
    }
    return false
  })

  // 加载人员列表
  const loadPersonnelList = async () => {
    try {
      const res = await getPersonnelList(personnelQuery.value)
      personnelList.value = res.data
    } catch {
      ElMessage.error('加载人员列表失败')
    }
  }

  // 搜索人员
  const handleSearchPersonnel = () => {
    loadPersonnelList()
  }

  // 重置人员搜索
  const handleResetPersonnel = () => {
    personnelQuery.value = {
      name: '',
      employeeNo: '',
      auditGroup: ''
    }
    loadPersonnelList()
  }

  // 选择变更人员
  const handleSelectPerson = (row: Personnel | undefined) => {
    if (row && row.documentCount && row.documentCount > 0) {
      selectedFromPerson.value = row
    }
  }

  // 确认选择变更人员
  const handleSelectFromPerson = async (row: Personnel) => {
    selectedFromPerson.value = row
    // 加载文书列表
    try {
      const res = await getPersonnelDocuments(row.id)
      documentList.value = res.data
      // 切换人员时清空已选文书
      selectedIds.value = []
      currentStep.value = 1
    } catch {
      ElMessage.error('加载文书列表失败')
    }
  }

  // 加载接收人员列表
  const loadReceiverList = async () => {
    try {
      const res = await getPersonnelList(receiverQuery.value)
      // 过滤掉变更人员自己
      receiverList.value = res.data.filter((p: Personnel) => p.id !== selectedFromPerson.value?.id)
    } catch {
      ElMessage.error('加载接收人员列表失败')
    }
  }

  // 搜索接收人员
  const handleSearchReceiver = () => {
    loadReceiverList()
  }

  // 重置接收人员搜索
  const handleResetReceiver = () => {
    receiverQuery.value = {
      name: '',
      auditGroup: ''
    }
    loadReceiverList()
  }

  // 选择接收人员
  const handleSelectReceiver = (row: Personnel | undefined) => {
    if (row && row.id !== selectedFromPerson.value?.id) {
      selectedToPerson.value = row
    }
  }

  // 确认选择接收人员
  const handleSelectToPerson = (row: Personnel) => {
    selectedToPerson.value = row
    currentStep.value = 3
  }

  // 上一步
  const handlePrevStep = () => {
    if (currentStep.value > 0) {
      currentStep.value--
    }
  }

  // 下一步
  const handleNextStep = () => {
    if (currentStep.value === 0 && selectedFromPerson.value) {
      // 已在 handleSelectFromPerson 中处理
      return
    }
    if (currentStep.value === 1 && selectedDocuments.value.length > 0) {
      loadReceiverList()
      currentStep.value = 2
    }
    if (currentStep.value === 2 && selectedToPerson.value) {
      // 已在 handleSelectToPerson 中处理
      return
    }
  }

  // 提交移交
  const handleSubmit = async () => {
    if (
      !selectedFromPerson.value ||
      !selectedToPerson.value ||
      selectedDocuments.value.length === 0
    ) {
      ElMessage.warning('请完成所有步骤')
      return
    }

    try {
      await ElMessageBox.confirm(
        `确认将 ${selectedFromPerson.value.name} 的 ${selectedDocuments.value.length} 份文书移交给 ${selectedToPerson.value.name}？`,
        '确认移交',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      submitting.value = true
      await transferDocuments({
        fromPersonId: selectedFromPerson.value.id,
        toPersonId: selectedToPerson.value.id,
        documentIds: selectedDocuments.value.map((d) => d.id),
        reason: transferReason.value
      })

      ElMessage.success('移交成功')
      handleReset()
      loadTransferRecords()
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error(error.message || '移交失败')
      }
    } finally {
      submitting.value = false
    }
  }

  // 取消
  const handleCancel = () => {
    ElMessageBox.confirm('确认取消移交操作？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        handleReset()
      })
      .catch(() => {
        // 取消操作
      })
  }

  // 重置
  const handleReset = () => {
    currentStep.value = 0
    selectedFromPerson.value = undefined
    selectedToPerson.value = undefined
    documentList.value = []
    selectedIds.value = []
    transferReason.value = ''
    loadPersonnelList()
  }

  // 加载移交记录
  const loadTransferRecords = async () => {
    try {
      const res = await getTransferRecords()
      transferRecords.value = res.data.list
    } catch {
      ElMessage.error('加载移交记录失败')
    }
  }

  // 刷新移交记录
  const handleRefreshRecords = () => {
    loadTransferRecords()
  }

  // 初始化
  onMounted(() => {
    loadPersonnelList()
    loadTransferRecords()
  })
</script>

<style scoped lang="scss">
  .personnel-transfer-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
  }

  .steps-card {
    flex-shrink: 0;
    border: none !important;
    border-radius: 12px;
    box-shadow: none !important;

    :deep(.el-card__body) {
      padding: 24px;
    }
  }

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
      flex-direction: column;
      height: 100%;
      padding: 24px;
    }
  }

  .step-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
  }

  .step-header {
    flex-shrink: 0;
    margin-bottom: 24px;

    h3 {
      margin: 0 0 8px;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }

    .step-desc {
      margin: 0;
      font-size: 14px;
      color: #909399;

      strong {
        font-weight: 600;
        color: #303133;
      }
    }
  }

  .filter-section {
    flex-shrink: 0;
    padding: 16px;
    margin-bottom: 16px;
    background: #f5f7fa;
    border-radius: 8px;

    :deep(.el-form) {
      margin-bottom: 0;
    }

    :deep(.el-form-item) {
      margin-bottom: 0;
    }
  }

  .selection-info {
    flex-shrink: 0;
    padding: 12px 16px;
    margin-top: 16px;
    font-size: 14px;
    color: #409eff;
    background: #ecf5ff;
    border-radius: 8px;

    strong {
      font-size: 16px;
      font-weight: 600;
    }
  }

  .confirm-info {
    flex: 1;
    overflow-y: auto;

    .reason-section {
      margin-top: 24px;

      h4 {
        margin: 0 0 12px;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }

    .document-list-section {
      margin-top: 24px;

      h4 {
        margin: 0 0 12px;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }
  }

  .step-actions {
    display: flex;
    flex-shrink: 0;
    gap: 12px;
    justify-content: center;
    padding-top: 24px;
    margin-top: 24px;
    border-top: 1px solid #ebeef5;
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

  .records-card {
    border: none !important;
    border-radius: 12px;
    box-shadow: none !important;

    :deep(.el-card__body) {
      padding: 20px;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }
</style>
