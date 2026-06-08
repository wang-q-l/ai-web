<script setup lang="ts">
  // 模型新增 / 编辑弹窗：隶属于某个厂商
  import { ref, computed, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { addModel, updateModel } from '@/api/model-provider'
  import type { ModelItem, ModelForm, ModelType } from '@/types/model-provider'

  const props = defineProps<{
    open: boolean
    // 编辑时传入当前模型记录，新增时为 null
    record: ModelItem | null
    // 所属厂商 id（新增时必传）
    providerId: number
  }>()

  const emit = defineEmits<{
    'update:open': [val: boolean]
    success: []
  }>()

  // 模型类型选项
  const TYPE_OPTIONS: { label: string; value: ModelType }[] = [
    { label: '对话', value: 'chat' },
    { label: '多模态', value: 'multimodal' },
    { label: '向量', value: 'embedding' },
    { label: '推理', value: 'reasoning' }
  ]

  // 弹窗显隐双向绑定
  const visible = computed({
    get: () => props.open,
    set: (v) => emit('update:open', v)
  })

  const isEdit = computed(() => !!props.record?.id)

  const formRef = ref<FormInstance>()
  const submitting = ref(false)

  // 表单默认值
  const createDefaultForm = (): ModelForm => ({
    providerId: props.providerId,
    name: '',
    modelKey: '',
    type: 'chat',
    contextLength: 32,
    enabled: true
  })

  const form = ref<ModelForm>(createDefaultForm())

  // 校验规则
  const rules: FormRules = {
    name: [{ required: true, message: '请输入模型名称', trigger: 'blur' }],
    modelKey: [{ required: true, message: '请输入型号标识', trigger: 'blur' }],
    type: [{ required: true, message: '请选择模型类型', trigger: 'change' }],
    contextLength: [{ required: true, message: '请输入上下文长度', trigger: 'blur' }]
  }

  // 打开弹窗时回填表单
  watch(visible, (val) => {
    if (val) {
      if (props.record) {
        form.value = {
          id: props.record.id,
          providerId: props.record.providerId,
          name: props.record.name,
          modelKey: props.record.modelKey,
          type: props.record.type,
          contextLength: props.record.contextLength,
          enabled: props.record.enabled
        }
      } else {
        form.value = createDefaultForm()
      }
    }
  })

  // 提交
  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (!valid) return
      submitting.value = true
      try {
        const res = isEdit.value
          ? await updateModel(props.record!.id, form.value)
          : await addModel(form.value)
        if (res.code === 200) {
          ElMessage.success(res.message || '保存成功')
          emit('success')
          visible.value = false
        } else {
          ElMessage.error(res.message || '保存失败')
        }
      } finally {
        submitting.value = false
      }
    })
  }

  const handleCancel = () => {
    visible.value = false
  }
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑模型' : '新增模型'"
    width="520px"
    destroy-on-close
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="模型名称" prop="name">
        <el-input v-model="form.name" placeholder="如：通义千问-Max" maxlength="30" />
      </el-form-item>
      <el-form-item label="型号标识" prop="modelKey">
        <el-input v-model="form.modelKey" placeholder="如：qwen-max" />
      </el-form-item>
      <el-form-item label="模型类型" prop="type">
        <el-select v-model="form.type" placeholder="请选择" style="width: 100%">
          <el-option v-for="t in TYPE_OPTIONS" :key="t.value" :label="t.label" :value="t.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="上下文长度" prop="contextLength">
        <el-input-number v-model="form.contextLength" :min="1" :max="2000" />
        <span class="form-tip">单位：K</span>
      </el-form-item>
      <el-form-item label="状态">
        <el-switch v-model="form.enabled" active-text="启用" inactive-text="禁用" inline-prompt />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
  .form-tip {
    margin-left: 12px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
</style>
