<script setup lang="ts">
  // 智能体新增 / 编辑抽屉
  // 内置智能体：名称 / 用途 / 系统提示词只读，仅可改主备模型、参数、启停
  // 自建智能体：全字段可编辑
  // 主备模型仅可选 chat / reasoning / multimodal 类型，且主备不可相同
  import { ref, computed, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { addAgent, updateAgent } from '@/api/model-provider'
  import type { AgentItem, AgentForm, ModelType } from '@/types/model-provider'

  // 级联选择用的模型选项（含厂商信息）
  interface ModelOption {
    id: number
    name: string
    modelKey: string
    type: ModelType
    enabled: boolean
    providerId: number
    providerName: string
    providerEnabled: boolean
  }

  const props = defineProps<{
    open: boolean
    // 编辑时传入当前智能体记录，新增时为 null
    record: AgentItem | null
    // 全部模型选项（含厂商启用状态）
    modelOptions: ModelOption[]
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

  const isEdit = computed(() => !!props.record?.id)
  // 是否内置智能体（部分字段只读）
  const isBuiltin = computed(() => props.record?.source === 'builtin')

  const formRef = ref<FormInstance>()
  const submitting = ref(false)

  // 表单默认值
  const createDefaultForm = (): AgentForm => ({
    name: '',
    source: 'custom',
    description: '',
    systemPrompt: '',
    primaryModelId: null,
    fallbackModelId: null,
    params: { temperature: 0.7, maxTokens: 2048, topP: 0.9 },
    enabled: true
  })

  const form = ref<AgentForm>(createDefaultForm())

  // 可选模型：仅 chat / reasoning / multimodal 类型（排除向量模型）
  // 按厂商分组，禁用厂商下的模型置灰不可选
  const groupedModels = computed(() => {
    const allowedTypes: ModelType[] = ['chat', 'reasoning', 'multimodal']
    const usable = props.modelOptions.filter((m) => allowedTypes.includes(m.type))
    const groups = new Map<
      number,
      { providerName: string; providerEnabled: boolean; models: ModelOption[] }
    >()
    usable.forEach((m) => {
      if (!groups.has(m.providerId)) {
        groups.set(m.providerId, {
          providerName: m.providerName,
          providerEnabled: m.providerEnabled,
          models: []
        })
      }
      groups.get(m.providerId)!.models.push(m)
    })
    return Array.from(groups.values())
  })

  // 备用模型选项：排除已选中的主模型
  const fallbackDisabled = (modelId: number, providerEnabled: boolean, modelEnabled: boolean) => {
    return !providerEnabled || !modelEnabled || modelId === form.value.primaryModelId
  }

  // 主模型选项禁用判断：厂商或模型本身禁用则不可选
  const primaryDisabled = (providerEnabled: boolean, modelEnabled: boolean) => {
    return !providerEnabled || !modelEnabled
  }

  // 校验规则
  const rules: FormRules = {
    name: [{ required: true, message: '请输入智能体名称', trigger: 'blur' }],
    description: [{ required: true, message: '请输入用途描述', trigger: 'blur' }],
    primaryModelId: [{ required: true, message: '请选择主模型', trigger: 'change' }]
  }

  // 主模型变更时，若备用模型与之相同则清空备用
  const handlePrimaryChange = () => {
    if (form.value.fallbackModelId === form.value.primaryModelId) {
      form.value.fallbackModelId = null
    }
  }

  // 打开抽屉时回填表单
  watch(visible, (val) => {
    if (val) {
      if (props.record) {
        form.value = {
          id: props.record.id,
          name: props.record.name,
          source: props.record.source,
          description: props.record.description,
          systemPrompt: props.record.systemPrompt,
          primaryModelId: props.record.primaryModelId,
          fallbackModelId: props.record.fallbackModelId,
          params: { ...props.record.params },
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
      // 主备模型不可相同
      if (
        form.value.fallbackModelId !== null &&
        form.value.fallbackModelId === form.value.primaryModelId
      ) {
        ElMessage.warning('主模型与备用模型不可相同')
        return
      }
      submitting.value = true
      try {
        const res = isEdit.value
          ? await updateAgent(props.record!.id, form.value)
          : await addAgent(form.value)
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
    :title="isEdit ? (isBuiltin ? '配置内置智能体' : '编辑智能体') : '新建智能体'"
    size="480px"
    destroy-on-close
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <!-- 内置智能体名称/用途/提示词只读 -->
      <el-divider content-position="left">基本信息</el-divider>
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入智能体名称"
          maxlength="30"
          :disabled="isBuiltin"
        />
      </el-form-item>
      <el-form-item label="来源" v-if="isEdit">
        <el-tag :type="isBuiltin ? 'warning' : 'info'" size="small">
          {{ isBuiltin ? '内置' : '自建' }}
        </el-tag>
        <span v-if="isBuiltin" class="form-tip">内置智能体仅可调整模型与参数</span>
      </el-form-item>
      <el-form-item label="用途" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="2"
          placeholder="简要描述该智能体的用途"
          :disabled="isBuiltin"
        />
      </el-form-item>
      <el-form-item label="系统提示词">
        <el-input
          v-model="form.systemPrompt"
          type="textarea"
          :rows="4"
          placeholder="定义智能体的角色与行为"
          :disabled="isBuiltin"
        />
      </el-form-item>

      <!-- 模型绑定：主模型 + 备用模型（降级） -->
      <el-divider content-position="left">模型绑定</el-divider>
      <el-form-item label="主模型" prop="primaryModelId">
        <el-select
          v-model="form.primaryModelId"
          placeholder="请选择主模型"
          filterable
          style="width: 100%"
          @change="handlePrimaryChange"
        >
          <el-option-group
            v-for="g in groupedModels"
            :key="g.providerName"
            :label="g.providerEnabled ? g.providerName : `${g.providerName}（已禁用）`"
          >
            <el-option
              v-for="m in g.models"
              :key="m.id"
              :label="`${m.name}（${m.modelKey}）`"
              :value="m.id"
              :disabled="primaryDisabled(g.providerEnabled, m.enabled)"
            />
          </el-option-group>
        </el-select>
      </el-form-item>
      <el-form-item label="备用模型">
        <el-select
          v-model="form.fallbackModelId"
          placeholder="主模型不可用时降级使用（可不选）"
          filterable
          clearable
          style="width: 100%"
        >
          <el-option-group
            v-for="g in groupedModels"
            :key="g.providerName"
            :label="g.providerEnabled ? g.providerName : `${g.providerName}（已禁用）`"
          >
            <el-option
              v-for="m in g.models"
              :key="m.id"
              :label="`${m.name}（${m.modelKey}）`"
              :value="m.id"
              :disabled="fallbackDisabled(m.id, g.providerEnabled, m.enabled)"
            />
          </el-option-group>
        </el-select>
      </el-form-item>

      <!-- 调用参数 -->
      <el-divider content-position="left">调用参数</el-divider>
      <el-form-item label="Temperature">
        <el-slider
          v-model="form.params.temperature"
          :min="0"
          :max="2"
          :step="0.1"
          show-input
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="Max Tokens">
        <el-input-number v-model="form.params.maxTokens" :min="1" :max="32768" :step="256" />
      </el-form-item>
      <el-form-item label="Top P">
        <el-slider
          v-model="form.params.topP"
          :min="0"
          :max="1"
          :step="0.05"
          show-input
          style="width: 100%"
        />
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
