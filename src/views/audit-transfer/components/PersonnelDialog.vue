<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑人员信息' : '添加人员信息'"
    width="650px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="160px">
      <el-form-item label="人员姓名" prop="personnelName">
        <el-input
          v-model="formData.personnelName"
          placeholder="请输入人员姓名"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="人员类别" prop="personnelCategory">
        <el-select
          v-model="formData.personnelCategory"
          placeholder="请选择人员类别"
          style="width: 100%"
        >
          <el-option label="国家公务员" :value="1" />
          <el-option label="国有企业人员" :value="2" />
          <el-option label="事业编制人员" :value="3" />
          <el-option label="其他公职人员" :value="4" />
        </el-select>
      </el-form-item>

      <el-form-item label="人员所在单位" prop="personnelUnit">
        <el-input
          v-model="formData.personnelUnit"
          placeholder="请输入人员所在单位"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="人员职务" prop="personnelPosition">
        <el-input
          v-model="formData.personnelPosition"
          placeholder="请输入人员职务"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="职务级别" prop="positionLevel">
        <el-select
          v-model="formData.positionLevel"
          placeholder="请选择职务级别"
          style="width: 100%"
        >
          <el-option label="地厅级" :value="1" />
          <el-option label="县处级" :value="2" />
          <el-option label="乡科级" :value="3" />
          <el-option label="乡科级以下" :value="4" />
          <el-option label="其他" :value="5" />
        </el-select>
      </el-form-item>

      <el-form-item label="是否党员" prop="isPartyMember">
        <el-radio-group v-model="formData.isPartyMember">
          <el-radio :value="1">是</el-radio>
          <el-radio :value="0">否</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="问题发生时所在单位" prop="problemOccurredUnit">
        <el-input
          v-model="formData.problemOccurredUnit"
          placeholder="请输入问题发生时所在单位"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  /**
   * 移送人员信息弹窗组件
   * 用于添加和编辑移送人员信息
   */
  import { ref, reactive, watch } from 'vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { TransferPersonnel } from '@/types/audit-transfer'

  // Props
  interface Props {
    modelValue: boolean
    personnelData?: TransferPersonnel | null
  }

  const props = withDefaults(defineProps<Props>(), {
    personnelData: null
  })

  // Emits
  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    confirm: [personnel: TransferPersonnel]
  }>()

  // 弹窗显示状态
  const visible = ref(false)
  watch(
    () => props.modelValue,
    (val) => {
      visible.value = val
      if (val) {
        if (props.personnelData) {
          // 编辑模式，填充数据
          Object.assign(formData, props.personnelData)
          isEdit.value = true
        } else {
          // 新增模式，重置表单
          resetForm()
          isEdit.value = false
        }
      }
    }
  )
  watch(visible, (val) => {
    emit('update:modelValue', val)
  })

  // 是否编辑模式
  const isEdit = ref(false)

  // 表单引用
  const formRef = ref<FormInstance>()

  // 表单数据
  const formData = reactive<TransferPersonnel>({
    personnelName: '',
    personnelCategory: 1,
    personnelUnit: '',
    personnelPosition: '',
    positionLevel: 1,
    isPartyMember: 1,
    problemOccurredUnit: ''
  })

  // 表单验证规则
  const rules: FormRules = {
    personnelName: [{ required: true, message: '请输入人员姓名', trigger: 'blur' }],
    personnelCategory: [{ required: true, message: '请选择人员类别', trigger: 'change' }],
    personnelUnit: [{ required: true, message: '请输入人员所在单位', trigger: 'blur' }],
    personnelPosition: [{ required: true, message: '请输入人员职务', trigger: 'blur' }],
    positionLevel: [{ required: true, message: '请选择职务级别', trigger: 'change' }],
    isPartyMember: [{ required: true, message: '请选择是否党员', trigger: 'change' }],
    problemOccurredUnit: [{ required: true, message: '请输入问题发生时所在单位', trigger: 'blur' }]
  }

  // 重置表单
  const resetForm = () => {
    formData.personnelName = ''
    formData.personnelCategory = 1
    formData.personnelUnit = ''
    formData.personnelPosition = ''
    formData.positionLevel = 1
    formData.isPartyMember = 1
    formData.problemOccurredUnit = ''
    formRef.value?.clearValidate()
  }

  // 提交
  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate((valid) => {
      if (!valid) return

      // 返回人员数据
      emit('confirm', { ...formData })
      handleClose()
    })
  }

  // 关闭
  const handleClose = () => {
    visible.value = false
    resetForm()
  }
</script>

<style scoped lang="scss">
  .dialog-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
</style>
