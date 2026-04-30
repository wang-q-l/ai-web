<template>
  <div class="personnel-transfer-container">
    <!-- 自定义步骤条 -->
    <div class="steps-card">
      <div class="steps-wrapper">
        <div class="step-item" :class="{ active: currentStep >= 0, completed: currentStep > 0 }">
          <div class="step-number">1</div>
          <div class="step-title">选择变更人员</div>
        </div>
        <div class="step-line" :class="{ active: currentStep > 0 }"></div>
        <div class="step-item" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
          <div class="step-number">2</div>
          <div class="step-title">选择移交文书</div>
        </div>
        <div class="step-line" :class="{ active: currentStep > 1 }"></div>
        <div class="step-item" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
          <div class="step-number">3</div>
          <div class="step-title">选择接收人员</div>
        </div>
        <div class="step-line" :class="{ active: currentStep > 2 }"></div>
        <div class="step-item" :class="{ active: currentStep >= 3 }">
          <div class="step-number">4</div>
          <div class="step-title">确认移交</div>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-card">
      <!-- 步骤1：选择变更人员 -->
      <div v-show="currentStep === 0" class="step-content">
        <div class="step-header">
          <h3>选择需要变更的审计人员</h3>
          <p class="step-desc">请选择离职或调岗的审计人员，系统将移交其创建的所有文书</p>
        </div>

        <div class="filter-section">
          <div class="filter-form">
            <div class="form-item">
              <label>姓名</label>
              <input v-model="personnelQuery.name" placeholder="请输入姓名" />
            </div>
            <div class="form-item">
              <label>工号</label>
              <input v-model="personnelQuery.employeeNo" placeholder="请输入工号" />
            </div>
            <div class="form-item">
              <label>审计组</label>
              <input v-model="personnelQuery.auditGroup" placeholder="请输入审计组" />
            </div>
            <div class="form-actions">
              <button class="btn-primary" @click="handleSearchPersonnel">查询</button>
              <button class="btn-default" @click="handleResetPersonnel">重置</button>
            </div>
          </div>
        </div>

        <div class="table-section">
          <table class="data-table">
            <thead>
              <tr>
                <th>姓名</th>
                <th>工号</th>
                <th>部门</th>
                <th>审计组</th>
                <th>待移交文书</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in personnelList" :key="item.id">
                <td>{{ item.name }}</td>
                <td>{{ item.employeeNo }}</td>
                <td>{{ item.department }}</td>
                <td>{{ item.auditGroup }}</td>
                <td>
                  <span class="tag-warning">{{ item.documentCount }} 份</span>
                </td>
                <td>
                  <button
                    class="btn-link"
                    :disabled="!item.documentCount || item.documentCount === 0"
                    @click="handleSelectFromPerson(item)"
                  >
                    选择
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 步骤2：选择移交文书 -->
      <div v-show="currentStep === 1" class="step-content">
        <div class="step-header">
          <h3>选择需要移交的文书</h3>
          <p class="step-desc">
            变更人员：<strong>{{ selectedFromPerson?.name }}</strong> ({{
              selectedFromPerson?.employeeNo
            }})
          </p>
        </div>

        <div class="table-section">
          <table class="data-table">
            <thead>
              <tr>
                <th width="50">
                  <input
                    type="checkbox"
                    :checked="isAllDocumentsSelected"
                    @change="handleSelectAllDocuments"
                  />
                </th>
                <th>文书名称</th>
                <th>文书类型</th>
                <th>创建时间</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in documentList" :key="item.id">
                <td>
                  <input
                    type="checkbox"
                    :checked="selectedDocumentIds.includes(item.id)"
                    @change="handleDocumentSelect(item.id)"
                  />
                </td>
                <td>{{ item.name }}</td>
                <td>{{ item.type }}</td>
                <td>{{ item.createTime }}</td>
                <td>
                  <span :class="'tag-' + getStatusClass(item.status)">{{ item.statusText }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="step-actions">
          <button class="btn-default" @click="handlePrevStep">上一步</button>
          <button
            class="btn-primary"
            :disabled="selectedDocumentIds.length === 0"
            @click="handleNextStep"
          >
            下一步
          </button>
        </div>
      </div>

      <!-- 步骤3：选择接收人员 -->
      <div v-show="currentStep === 2" class="step-content">
        <div class="step-header">
          <h3>选择接收文书的审计人员</h3>
          <p class="step-desc">请选择接收文书的审计人员</p>
        </div>

        <div class="filter-section">
          <div class="filter-form">
            <div class="form-item">
              <label>姓名</label>
              <input v-model="receiverQuery.name" placeholder="请输入姓名" />
            </div>
            <div class="form-item">
              <label>工号</label>
              <input v-model="receiverQuery.employeeNo" placeholder="请输入工号" />
            </div>
            <div class="form-item">
              <label>审计组</label>
              <input v-model="receiverQuery.auditGroup" placeholder="请输入审计组" />
            </div>
            <div class="form-actions">
              <button class="btn-primary" @click="handleSearchReceiver">查询</button>
              <button class="btn-default" @click="handleResetReceiver">重置</button>
            </div>
          </div>
        </div>

        <div class="table-section">
          <table class="data-table">
            <thead>
              <tr>
                <th>姓名</th>
                <th>工号</th>
                <th>部门</th>
                <th>审计组</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in receiverList"
                :key="item.id"
                :class="{ selected: selectedToPerson?.id === item.id }"
              >
                <td>{{ item.name }}</td>
                <td>{{ item.employeeNo }}</td>
                <td>{{ item.department }}</td>
                <td>{{ item.auditGroup }}</td>
                <td>
                  <button class="btn-link" @click="handleSelectToPerson(item)">选择</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="step-actions">
          <button class="btn-default" @click="handlePrevStep">上一步</button>
          <button class="btn-primary" :disabled="!selectedToPerson" @click="handleNextStep"
            >下一步</button
          >
        </div>
      </div>

      <!-- 步骤4：确认移交 -->
      <div v-show="currentStep === 3" class="step-content">
        <div class="step-header">
          <h3>确认移交信息</h3>
          <p class="step-desc">请确认以下移交信息无误后提交</p>
        </div>

        <div class="confirm-section">
          <div class="confirm-item">
            <label>变更人员：</label>
            <span>{{ selectedFromPerson?.name }} ({{ selectedFromPerson?.employeeNo }})</span>
          </div>
          <div class="confirm-item">
            <label>接收人员：</label>
            <span>{{ selectedToPerson?.name }} ({{ selectedToPerson?.employeeNo }})</span>
          </div>
          <div class="confirm-item">
            <label>移交文书数量：</label>
            <span>{{ selectedDocumentIds.length }} 份</span>
          </div>
          <div class="confirm-item full-width">
            <label>移交原因：</label>
            <textarea
              v-model="transferReason"
              placeholder="请输入移交原因（选填）"
              rows="4"
            ></textarea>
          </div>
        </div>

        <div class="step-actions">
          <button class="btn-default" @click="handlePrevStep">上一步</button>
          <button class="btn-primary" @click="handleConfirmTransfer">确认移交</button>
        </div>
      </div>
    </div>

    <!-- 移交记录 -->
    <div class="records-card">
      <div class="records-header">
        <h3>移交记录</h3>
        <button class="btn-default" @click="handleRefreshRecords">刷新</button>
      </div>
      <div class="table-section">
        <table class="data-table">
          <thead>
            <tr>
              <th>变更人员</th>
              <th>接收人员</th>
              <th>文书数量</th>
              <th>移交原因</th>
              <th>移交时间</th>
              <th>操作人</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in transferRecords" :key="item.id">
              <td>{{ item.fromPersonName }} ({{ item.fromPersonNo }})</td>
              <td>{{ item.toPersonName }} ({{ item.toPersonNo }})</td>
              <td>
                <span class="tag-warning">{{ item.documentCount }} 份</span>
              </td>
              <td>{{ item.reason || '-' }}</td>
              <td>{{ item.transferTime }}</td>
              <td>{{ item.operator }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
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

  const currentStep = ref(0)
  const personnelQuery = ref<PersonnelQueryParams>({})
  const receiverQuery = ref<PersonnelQueryParams>({})
  const personnelList = ref<Personnel[]>([])
  const documentList = ref<Document[]>([])
  const receiverList = ref<Personnel[]>([])
  const selectedFromPerson = ref<Personnel>()
  const selectedDocumentIds = ref<number[]>([])
  const selectedToPerson = ref<Personnel>()
  const transferReason = ref('')
  const transferRecords = ref<TransferRecord[]>([])

  const isAllDocumentsSelected = computed(() => {
    return (
      documentList.value.length > 0 &&
      selectedDocumentIds.value.length === documentList.value.length
    )
  })

  const loadPersonnelList = async () => {
    try {
      const res = await getPersonnelList(personnelQuery.value)
      personnelList.value = res.data
    } catch {
      ElMessage.error('加载人员列表失败')
    }
  }

  const handleSearchPersonnel = () => {
    loadPersonnelList()
  }

  const handleResetPersonnel = () => {
    personnelQuery.value = {}
    loadPersonnelList()
  }

  const handleSelectFromPerson = async (row: Personnel) => {
    selectedFromPerson.value = row
    try {
      const res = await getPersonnelDocuments(row.id)
      documentList.value = res.data
      currentStep.value = 1
    } catch {
      ElMessage.error('加载文书列表失败')
    }
  }

  const handleDocumentSelect = (id: number) => {
    const index = selectedDocumentIds.value.indexOf(id)
    if (index > -1) {
      selectedDocumentIds.value.splice(index, 1)
    } else {
      selectedDocumentIds.value.push(id)
    }
  }

  const handleSelectAllDocuments = () => {
    if (isAllDocumentsSelected.value) {
      selectedDocumentIds.value = []
    } else {
      selectedDocumentIds.value = documentList.value.map((item) => item.id)
    }
  }

  const loadReceiverList = async () => {
    try {
      const res = await getPersonnelList(receiverQuery.value)
      receiverList.value = res.data.filter((p: Personnel) => p.id !== selectedFromPerson.value?.id)
    } catch {
      ElMessage.error('加载接收人员列表失败')
    }
  }

  const handleSearchReceiver = () => {
    loadReceiverList()
  }

  const handleResetReceiver = () => {
    receiverQuery.value = {}
    loadReceiverList()
  }

  const handleSelectToPerson = (row: Personnel) => {
    selectedToPerson.value = row
  }

  const handlePrevStep = () => {
    if (currentStep.value > 0) {
      currentStep.value--
    }
  }

  const handleNextStep = () => {
    if (currentStep.value === 1) {
      loadReceiverList()
    }
    if (currentStep.value < 3) {
      currentStep.value++
    }
  }

  const handleConfirmTransfer = async () => {
    try {
      await ElMessageBox.confirm('确认要执行文书移交操作吗？', '确认移交', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await transferDocuments({
        fromPersonId: selectedFromPerson.value!.id,
        toPersonId: selectedToPerson.value!.id,
        documentIds: selectedDocumentIds.value,
        reason: transferReason.value
      })

      ElMessage.success('移交成功')
      handleReset()
      loadTransferRecords()
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error(error.message || '移交失败')
      }
    }
  }

  const handleReset = () => {
    currentStep.value = 0
    selectedFromPerson.value = undefined
    selectedDocumentIds.value = []
    selectedToPerson.value = undefined
    transferReason.value = ''
    loadPersonnelList()
  }

  const loadTransferRecords = async () => {
    try {
      const res = await getTransferRecords()
      transferRecords.value = res.data.list
    } catch {
      ElMessage.error('加载移交记录失败')
    }
  }

  const handleRefreshRecords = () => {
    loadTransferRecords()
  }

  const getStatusClass = (status: number) => {
    const map: Record<number, string> = {
      0: 'info',
      1: 'warning',
      2: 'success'
    }
    return map[status] || 'info'
  }

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
    overflow: auto;
  }

  .steps-card {
    flex-shrink: 0;
    padding: 30px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
  }

  .steps-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .step-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;

    .step-number {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      font-weight: bold;
      color: #999;
      background: #e0e0e0;
      border-radius: 50%;
      transition: all 0.3s;
    }

    .step-title {
      font-size: 14px;
      color: #999;
      transition: all 0.3s;
    }

    &.active {
      .step-number {
        color: white;
        background: #409eff;
      }

      .step-title {
        color: #409eff;
      }
    }

    &.completed {
      .step-number {
        color: white;
        background: #67c23a;
      }

      .step-title {
        color: #67c23a;
      }
    }
  }

  .step-line {
    width: 100px;
    height: 2px;
    background: #e0e0e0;
    transition: all 0.3s;

    &.active {
      background: #409eff;
    }
  }

  .content-card {
    flex: 1;
    padding: 30px;
    overflow: auto;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
  }

  .step-content {
    .step-header {
      margin-bottom: 24px;

      h3 {
        margin-bottom: 8px;
        font-size: 18px;
        color: #303133;
      }

      .step-desc {
        font-size: 14px;
        color: #909399;

        strong {
          color: #409eff;
        }
      }
    }
  }

  .filter-section {
    margin-bottom: 20px;
  }

  .filter-form {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: flex-end;

    .form-item {
      display: flex;
      flex-direction: column;
      gap: 8px;

      label {
        font-size: 14px;
        color: #606266;
      }

      input {
        width: 200px;
        padding: 8px 12px;
        font-size: 14px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;

        &:focus {
          border-color: #409eff;
          outline: none;
        }
      }
    }

    .form-actions {
      display: flex;
      gap: 8px;
    }
  }

  .table-section {
    overflow-x: auto;
  }

  .data-table {
    width: 100%;
    font-size: 14px;
    border-collapse: collapse;

    thead {
      background: #f5f7fa;

      th {
        padding: 12px;
        font-weight: 500;
        color: #909399;
        text-align: left;
        border-bottom: 1px solid #ebeef5;
      }
    }

    tbody {
      tr {
        border-bottom: 1px solid #ebeef5;
        transition: background 0.3s;

        &:hover {
          background: #f5f7fa;
        }

        &.selected {
          background: #ecf5ff;
        }

        td {
          padding: 12px;
          color: #606266;
        }
      }
    }
  }

  .tag-warning,
  .tag-info,
  .tag-success {
    padding: 4px 8px;
    font-size: 12px;
    border-radius: 4px;
  }

  .tag-warning {
    color: #e6a23c;
    background: #fdf6ec;
  }

  .tag-info {
    color: #909399;
    background: #f4f4f5;
  }

  .tag-success {
    color: #67c23a;
    background: #f0f9ff;
  }

  .btn-primary,
  .btn-default,
  .btn-link {
    padding: 8px 16px;
    font-size: 14px;
    cursor: pointer;
    border: none;
    border-radius: 4px;
    transition: all 0.3s;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    &:not(:disabled):hover {
      opacity: 0.8;
    }
  }

  .btn-primary {
    color: white;
    background: #409eff;
  }

  .btn-default {
    color: #606266;
    background: #f0f0f0;
  }

  .btn-link {
    padding: 4px 8px;
    color: #409eff;
    background: transparent;

    &:hover {
      text-decoration: underline;
    }
  }

  .step-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
  }

  .confirm-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
    background: #f5f7fa;
    border-radius: 8px;

    .confirm-item {
      display: flex;
      gap: 12px;

      &.full-width {
        flex-direction: column;
      }

      label {
        min-width: 120px;
        font-weight: 500;
        color: #606266;
      }

      span {
        color: #303133;
      }

      textarea {
        width: 100%;
        padding: 8px 12px;
        font-size: 14px;
        resize: vertical;
        border: 1px solid #dcdfe6;
        border-radius: 4px;

        &:focus {
          border-color: #409eff;
          outline: none;
        }
      }
    }
  }

  .records-card {
    flex-shrink: 0;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgb(0 0 0 / 10%);

    .records-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;

      h3 {
        font-size: 16px;
        color: #303133;
      }
    }
  }
</style>
