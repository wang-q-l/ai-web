<template>
  <el-drawer
    v-model="visible"
    title="移送信息反馈"
    size="50%"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="feedback-container">
      <!-- 移送人员列表（仅当移送类型为人员时显示） -->
      <div v-if="isPersonnelType && personnelList.length > 0" class="personnel-section">
        <div class="section-title">移送人员信息</div>
        <el-table
          :data="personnelList"
          highlight-current-row
          @current-change="handlePersonnelChange"
          style="width: 100%"
          :row-class-name="getRowClassName"
        >
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="personnelName" label="人员姓名" width="100" />
          <el-table-column prop="personnelCategory" label="人员类别" width="120">
            <template #default="{ row }">
              <span v-if="row.personnelCategory === 1">国家公务员</span>
              <span v-else-if="row.personnelCategory === 2">国有企业人员</span>
              <span v-else-if="row.personnelCategory === 3">事业编制人员</span>
              <span v-else>其他公职人员</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="personnelUnit"
            label="人员所在单位"
            width="140"
            show-overflow-tooltip
          />
          <el-table-column prop="personnelPosition" label="人员职务" width="120" />
          <el-table-column prop="positionLevel" label="职务级别" width="110">
            <template #default="{ row }">
              <span v-if="row.positionLevel === 1">地厅级</span>
              <span v-else-if="row.positionLevel === 2">县处级</span>
              <span v-else-if="row.positionLevel === 3">乡科级</span>
              <span v-else-if="row.positionLevel === 4">乡科级以下</span>
              <span v-else>其他</span>
            </template>
          </el-table-column>
          <el-table-column prop="isPartyMember" label="是否党员" width="90" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.isPartyMember === 1" type="success" size="small">是</el-tag>
              <el-tag v-else type="info" size="small">否</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="problemOccurredUnit"
            label="问题发生时所在单位"
            width="150"
            show-overflow-tooltip
          />
          <el-table-column
            prop="feedbackStatus"
            label="反馈状态"
            width="90"
            align="center"
            fixed="right"
          >
            <template #default="{ row }">
              <el-tag v-if="row.feedbackStatus === 2" type="success" size="small">已反馈</el-tag>
              <el-tag v-else type="info" size="small">未反馈</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 反馈表单 -->
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="160px"
        class="feedback-form"
      >
        <!-- 受理信息 -->
        <div class="form-section">
          <div class="section-title">受理信息</div>
          <el-form-item label="受理机关" prop="acceptOrganization">
            <el-input
              v-model="formData.acceptOrganization"
              placeholder="请输入受理机关"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="受理日期" prop="acceptDate">
            <el-date-picker
              v-model="formData.acceptDate"
              type="date"
              placeholder="请选择受理日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </div>

        <!-- 处理信息 -->
        <div class="form-section">
          <div class="section-title">处理信息</div>
          <el-form-item label="处理结果文件名称">
            <el-input
              v-model="formData.resultFileName"
              placeholder="请输入处理结果文件名称"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="处理结果文件文号">
            <el-input
              v-model="formData.resultFileCode"
              placeholder="请输入处理结果文件文号"
              maxlength="50"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="处理机关">
            <el-input
              v-model="formData.handleOrganization"
              placeholder="请输入处理机关"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="处理日期">
            <el-date-picker
              v-model="formData.handleDate"
              type="date"
              placeholder="请选择处理日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="处理结果">
            <el-select
              v-model="formData.handleResult"
              placeholder="请选择处理结果"
              clearable
              style="width: 100%"
            >
              <el-option label="党纪处分" :value="1" />
              <el-option label="政务处分" :value="2" />
              <el-option label="第一种形态" :value="3" />
              <el-option label="经济处罚" :value="4" />
              <el-option label="其他" :value="5" />
              <el-option label="经核实不是问题" :value="6" />
            </el-select>
          </el-form-item>

          <el-form-item label="处理结果情况描述">
            <el-input
              v-model="formData.resultDescription"
              type="textarea"
              :rows="6"
              placeholder="请输入处理结果情况描述"
              maxlength="2000"
              show-word-limit
            />
          </el-form-item>
        </div>
      </el-form>
    </div>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit"> 保存 </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
  /**
   * 移送信息反馈组件
   * 支持事项类型和人员类型的移送反馈
   * 人员类型时显示人员列表，选中人员后填写反馈信息
   */
  import { ref, reactive, watch, nextTick } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import type {
    TransferFeedback,
    TransferPersonnel,
    PersonnelFeedback
  } from '@/types/audit-transfer'
  import {
    getTransferFeedback,
    saveTransferFeedback,
    getTransferPersonnelList,
    getPersonnelFeedback,
    savePersonnelFeedback,
    getAuditTransferDetail
  } from '@/api/audit-transfer'

  // Props
  interface Props {
    modelValue: boolean
    transferId?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    transferId: undefined
  })

  // Emits
  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    success: []
  }>()

  // 抽屉显示状态
  const visible = ref(false)
  watch(
    () => props.modelValue,
    (val) => {
      visible.value = val
      if (val && props.transferId) {
        init()
      }
    }
  )
  watch(visible, (val) => {
    emit('update:modelValue', val)
  })

  // 表单引用
  const formRef = ref<FormInstance>()

  // 移送类型（1-事项，2-人员）
  const transferType = ref<number>(1)
  const isPersonnelType = ref(false)

  // 人员列表
  const personnelList = ref<TransferPersonnel[]>([])
  const currentPersonnel = ref<TransferPersonnel | null>(null)

  // 表单数据（用于事项类型或人员类型）
  const formData = reactive<any>({
    transferId: 0,
    personnelId: 0,
    acceptOrganization: '',
    acceptDate: '',
    resultFileName: '',
    resultFileCode: '',
    handleOrganization: '',
    handleDate: '',
    handleResult: undefined,
    resultDescription: ''
  })

  // 表单验证规则
  const rules: FormRules = {
    acceptOrganization: [{ required: true, message: '请输入受理机关', trigger: 'blur' }],
    acceptDate: [{ required: true, message: '请选择受理日期', trigger: 'change' }]
  }

  // 提交加载状态
  const submitLoading = ref(false)

  // 初始化
  const init = async () => {
    if (!props.transferId) return

    try {
      // 获取移送详情，判断移送类型
      const detailRes = await getAuditTransferDetail(props.transferId)
      if (!detailRes.data) return

      transferType.value = detailRes.data.transferType
      isPersonnelType.value = detailRes.data.transferType === 2

      if (isPersonnelType.value) {
        // 人员类型：获取人员列表
        await fetchPersonnelList()
      } else {
        // 事项类型：获取移送反馈
        await fetchTransferFeedback()
      }
    } catch {
      ElMessage.error('初始化失败')
    }
  }

  // 获取人员列表
  const fetchPersonnelList = async () => {
    if (!props.transferId) return

    try {
      const res = await getTransferPersonnelList(props.transferId)
      personnelList.value = res.data || []

      // 默认选中第一个人员
      if (personnelList.value.length > 0) {
        await nextTick()
        currentPersonnel.value = personnelList.value[0]
        await fetchPersonnelFeedback(personnelList.value[0].id!)
      }
    } catch {
      ElMessage.error('获取人员列表失败')
    }
  }

  // 获取移送反馈（事项类型）
  const fetchTransferFeedback = async () => {
    if (!props.transferId) return

    try {
      const res = await getTransferFeedback(props.transferId)
      if (res.data) {
        formData.transferId = props.transferId
        formData.acceptOrganization = res.data.acceptOrganization || ''
        formData.acceptDate = res.data.acceptDate || ''
        formData.resultFileName = res.data.resultFileName || ''
        formData.resultFileCode = res.data.resultFileCode || ''
        formData.handleOrganization = res.data.handleOrganization || ''
        formData.handleDate = res.data.handleDate || ''
        formData.handleResult = res.data.handleResult
        formData.resultDescription = res.data.resultDescription || ''
      } else {
        resetForm()
        formData.transferId = props.transferId
      }
    } catch {
      resetForm()
      formData.transferId = props.transferId
    }
  }

  // 获取人员反馈（人员类型）
  const fetchPersonnelFeedback = async (personnelId: number) => {
    try {
      const res = await getPersonnelFeedback(personnelId)
      if (res.data) {
        formData.personnelId = personnelId
        formData.transferId = props.transferId
        formData.acceptOrganization = res.data.acceptOrganization || ''
        formData.acceptDate = res.data.acceptDate || ''
        formData.resultFileName = res.data.resultFileName || ''
        formData.resultFileCode = res.data.resultFileCode || ''
        formData.handleOrganization = res.data.handleOrganization || ''
        formData.handleDate = res.data.handleDate || ''
        formData.handleResult = res.data.handleResult
        formData.resultDescription = res.data.resultDescription || ''
      } else {
        resetForm()
        formData.personnelId = personnelId
        formData.transferId = props.transferId
      }
    } catch {
      resetForm()
      formData.personnelId = personnelId
      formData.transferId = props.transferId
    }
  }

  // 人员选择变化
  const handlePersonnelChange = (row: TransferPersonnel | null) => {
    if (!row || !row.id) return
    currentPersonnel.value = row
    fetchPersonnelFeedback(row.id)
  }

  // 表格行样式
  const getRowClassName = ({ row }: { row: TransferPersonnel }) => {
    return row.id === currentPersonnel.value?.id ? 'current-row' : ''
  }

  // 重置表单
  const resetForm = () => {
    formData.transferId = 0
    formData.personnelId = 0
    formData.acceptOrganization = ''
    formData.acceptDate = ''
    formData.resultFileName = ''
    formData.resultFileCode = ''
    formData.handleOrganization = ''
    formData.handleDate = ''
    formData.handleResult = undefined
    formData.resultDescription = ''
    formRef.value?.clearValidate()
  }

  // 提交
  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (!valid) return

      submitLoading.value = true
      try {
        if (isPersonnelType.value) {
          // 人员类型：保存人员反馈
          await savePersonnelFeedback(formData as PersonnelFeedback)
        } else {
          // 事项类型：保存移送反馈
          await saveTransferFeedback(formData as TransferFeedback)
        }
        ElMessage.success('保存成功')
        emit('success')

        // 如果是人员类型，刷新人员列表
        if (isPersonnelType.value) {
          await fetchPersonnelList()
        }
      } catch {
        ElMessage.error('保存失败')
      } finally {
        submitLoading.value = false
      }
    })
  }

  // 关闭
  const handleClose = () => {
    visible.value = false
    resetForm()
    personnelList.value = []
    currentPersonnel.value = null
    isPersonnelType.value = false
  }
</script>

<style scoped lang="scss">
  .feedback-container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .personnel-section {
    padding: 0 20px;
    margin-bottom: 24px;

    .section-title {
      padding-bottom: 12px;
      margin-bottom: 16px;
      font-size: 16px;
      font-weight: 500;
      color: #303133;
      border-bottom: 1px solid #e4e7ed;
    }

    :deep(.el-table) {
      .current-row {
        background-color: #ecf5ff;
      }
    }
  }

  .feedback-form {
    flex: 1;
    padding: 0 20px;
    overflow-y: auto;

    .form-section {
      margin-bottom: 32px;

      .section-title {
        padding-bottom: 12px;
        margin-bottom: 20px;
        font-size: 16px;
        font-weight: 500;
        color: #303133;
        border-bottom: 1px solid #e4e7ed;
      }
    }
  }

  .drawer-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
</style>
