<template>
  <!-- 生成基准台账弹窗：选审计类型 + 年度 + 名称，确认后生成一条台账记录 -->
  <el-dialog
    :model-value="modelValue"
    title="生成基准台账"
    width="480px"
    @update:model-value="(v) => emit('update:modelValue', v)"
    @open="initForm"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="报表类型" prop="auditType">
        <el-select
          v-model="form.auditType"
          placeholder="请选择审计类型"
          style="width: 100%"
          @change="handleTypeChange"
        >
          <el-option
            v-for="opt in auditTypeOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="项目年度" prop="projectYear">
        <el-select v-model="form.projectYear" placeholder="请选择年度" style="width: 100%">
          <el-option v-for="y in yearOptions" :key="y" :label="y" :value="y" />
        </el-select>
      </el-form-item>
      <el-form-item label="台账名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入台账名称" maxlength="60" show-word-limit />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">生成</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  /**
   * 生成基准台账弹窗组件
   * 选审计类型+年度+名称，调用接口生成一条台账记录，成功后通知父组件刷新列表
   */
  import { ref, reactive } from 'vue'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import type { AuditTypeOption, GenerateLedgerForm } from '@/types/report-compare'
  import { generateLedger } from '@/api/report-compare'

  const props = defineProps<{
    modelValue: boolean
    auditTypeOptions: AuditTypeOption[]
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    // 生成成功：通知父组件刷新列表
    success: []
  }>()

  // 年度选项（近 6 年）
  const yearOptions = Array.from({ length: 6 }, (_, i) => String(new Date().getFullYear() - i))

  // 表单实例与数据
  const formRef = ref<FormInstance>()
  const form = reactive<GenerateLedgerForm>({
    name: '',
    auditType: '',
    projectYear: yearOptions[0]
  })
  const submitting = ref(false)

  // 校验规则
  const rules: FormRules = {
    auditType: [{ required: true, message: '请选择报表类型', trigger: 'change' }],
    projectYear: [{ required: true, message: '请选择项目年度', trigger: 'change' }],
    name: [{ required: true, message: '请输入台账名称', trigger: 'blur' }]
  }

  // 打开时初始化表单
  const initForm = () => {
    form.name = ''
    form.auditType = props.auditTypeOptions[0]?.value || ''
    form.projectYear = yearOptions[0]
    autoFillName()
  }

  // 切换类型时自动补全默认名称
  const handleTypeChange = () => {
    autoFillName()
  }

  // 依据类型+年度生成默认名称（用户可改）
  const autoFillName = () => {
    const typeName = props.auditTypeOptions.find((t) => t.value === form.auditType)?.label || ''
    if (typeName) form.name = `${form.projectYear}年度${typeName}汇总`
  }

  // 提交生成
  const handleSubmit = async () => {
    await formRef.value?.validate()
    submitting.value = true
    try {
      const res = await generateLedger({ ...form })
      if (res.code !== 200) {
        ElMessage.warning(res.message || '生成失败')
        return
      }
      ElMessage.success('生成成功')
      emit('success')
      emit('update:modelValue', false)
    } catch {
      ElMessage.error('生成台账失败')
    } finally {
      submitting.value = false
    }
  }

  // 关闭
  const handleClose = () => {
    emit('update:modelValue', false)
  }
</script>
