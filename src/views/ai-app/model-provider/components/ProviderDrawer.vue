<script setup lang="ts">
  // 厂商新增 / 编辑抽屉：编辑时 API Key 留空表示不修改原密钥
  import { ref, computed, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { addProvider, updateProvider } from '@/api/model-provider'
  import type { Provider, ProviderForm, ModelItem } from '@/types/model-provider'

  const props = defineProps<{
    open: boolean
    // 编辑时传入当前厂商记录，新增时为 null
    record: Provider | null
    // 当前厂商下的模型列表（用于选择默认模型），新增时为空
    models: ModelItem[]
  }>()

  const emit = defineEmits<{
    'update:open': [val: boolean]
    success: []
  }>()

  // 抽屉显隐双向绑定
  const visible = computed({
    get: () => props.open,
    set: (v) => emit('update:open', v)
  })

  // 是否编辑模式
  const isEdit = computed(() => !!props.record?.id)

  const formRef = ref<FormInstance>()
  const submitting = ref(false)

  // 表单默认值
  const createDefaultForm = (): ProviderForm => ({
    name: '',
    code: '',
    apiBaseUrl: '',
    apiKey: '',
    defaultModelId: null,
    qps: 10,
    tokenQuota: 100,
    enabled: true
  })

  const form = ref<ProviderForm>(createDefaultForm())

  // 校验规则
  const rules: FormRules = {
    name: [{ required: true, message: '请输入厂商名称', trigger: 'blur' }],
    code: [
      { required: true, message: '请输入厂商标识', trigger: 'blur' },
      {
        pattern: /^[a-z0-9-]+$/,
        message: '仅支持小写字母、数字和短横线',
        trigger: 'blur'
      }
    ],
    apiBaseUrl: [
      { required: true, message: '请输入 API 地址', trigger: 'blur' },
      {
        pattern: /^https?:\/\/.+/,
        message: '请输入以 http(s):// 开头的合法地址',
        trigger: 'blur'
      }
    ],
    // 新增时密钥必填，编辑时可留空（不修改）
    apiKey: [
      {
        validator: (_rule, value, callback) => {
          if (!isEdit.value && !value) {
            callback(new Error('请输入 API Key'))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ],
    qps: [{ required: true, message: '请输入 QPS', trigger: 'blur' }],
    tokenQuota: [{ required: true, message: '请输入 Token 配额', trigger: 'blur' }]
  }

  // 打开抽屉时回填表单
  watch(visible, (val) => {
    if (val) {
      if (props.record) {
        // 编辑：回填，API Key 留空（不回显原值）
        form.value = {
          id: props.record.id,
          name: props.record.name,
          code: props.record.code,
          apiBaseUrl: props.record.apiBaseUrl,
          apiKey: '',
          defaultModelId: props.record.defaultModelId,
          qps: props.record.qps,
          tokenQuota: props.record.tokenQuota,
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
          ? await updateProvider(props.record!.id, form.value)
          : await addProvider(form.value)
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
  <el-drawer
    v-model="visible"
    :title="isEdit ? '编辑厂商' : '新增厂商'"
    size="480px"
    destroy-on-close
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
      <el-form-item label="厂商名称" prop="name">
        <el-input v-model="form.name" placeholder="如：阿里云百炼" maxlength="30" />
      </el-form-item>
      <el-form-item label="厂商标识" prop="code">
        <el-input v-model="form.code" placeholder="唯一标识，如：dashscope" :disabled="isEdit" />
      </el-form-item>
      <el-form-item label="API 地址" prop="apiBaseUrl">
        <el-input v-model="form.apiBaseUrl" placeholder="https://..." />
      </el-form-item>
      <el-form-item label="API Key" prop="apiKey">
        <el-input
          v-model="form.apiKey"
          type="password"
          show-password
          :placeholder="isEdit ? '留空表示不修改原密钥' : '请输入 API Key'"
        />
      </el-form-item>
      <!-- 默认模型仅编辑态可选（新增时尚无模型） -->
      <el-form-item v-if="isEdit" label="默认模型">
        <el-select
          v-model="form.defaultModelId"
          placeholder="请选择默认模型"
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="m in models"
            :key="m.id"
            :label="`${m.name}（${m.modelKey}）`"
            :value="m.id"
            :disabled="!m.enabled"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="QPS 限流" prop="qps">
        <el-input-number v-model="form.qps" :min="1" :max="1000" />
        <span class="form-tip">每秒最大请求数</span>
      </el-form-item>
      <el-form-item label="Token 配额" prop="tokenQuota">
        <el-input-number v-model="form.tokenQuota" :min="1" :max="100000" />
        <span class="form-tip">单位：万 Token</span>
      </el-form-item>
      <el-form-item label="状态">
        <el-switch v-model="form.enabled" active-text="启用" inactive-text="禁用" inline-prompt />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
    </template>
  </el-drawer>
</template>

<style lang="scss" scoped>
  .form-tip {
    margin-left: 12px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
</style>
