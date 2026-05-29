<template>
  <el-drawer
    v-model="visible"
    :title="`人员反馈 - ${personnelName}`"
    size="50%"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="140px"
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
   * 人员反馈组件
   * 用于填写和编辑移送人员的反馈信息
   */
  import { ref, reactive, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { PersonnelFeedback } from '@/types/audit-transfer'
  import { getPersonnelFeedback, savePersonnelFeedback } from '@/api/audit-transfer'

  // Props
  interface Props {
    modelValue: boolean
    personnelId?: number
    personnelName?: string
    transferId?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    personnelId: undefined,
    personnelName: '',
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
      if (val && props.personnelId) {
        fetchFeedback()
      }
    }
  )
  watch(visible, (val) => {
    emit('update:modelValue', val)
  })

  // 表单引用
  const formRef = ref<FormInstance>()

  // 表单数据
  const formData = reactive<PersonnelFeedback>({
    personnelId: 0,
    transferId: 0,
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

  // 获取反馈信息
  const fetchFeedback = async () => {
    if (!props.personnelId) return

    try {
      const res = await getPersonnelFeedback(props.personnelId)
      if (res.data) {
        // 填充表单数据
        formData.personnelId = props.personnelId
        formData.transferId = props.transferId || 0
        formData.acceptOrganization = res.data.acceptOrganization || ''
        formData.acceptDate = res.data.acceptDate || ''
        formData.resultFileName = res.data.resultFileName || ''
        formData.resultFileCode = res.data.resultFileCode || ''
        formData.handleOrganization = res.data.handleOrganization || ''
        formData.handleDate = res.data.handleDate || ''
        formData.handleResult = res.data.handleResult
        formData.resultDescription = res.data.resultDescription || ''
      } else {
        // 新增反馈
        resetForm()
        formData.personnelId = props.personnelId
        formData.transferId = props.transferId || 0
      }
    } catch {
      // 如果没有反馈记录，初始化表单
      resetForm()
      formData.personnelId = props.personnelId
      formData.transferId = props.transferId || 0
    }
  }

  // 重置表单
  const resetForm = () => {
    formData.personnelId = 0
    formData.transferId = 0
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
        await savePersonnelFeedback(formData)
        ElMessage.success('保存成功')
        emit('success')
        handleClose()
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
  }
</script>

<style scoped lang="scss">
  .feedback-form {
    padding: 0 20px;

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
