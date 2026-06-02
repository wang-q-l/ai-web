<script setup lang="ts">
  // 领域覆盖策略编辑抽屉：参数与全局策略一致，新增/编辑通用
  import { ref, reactive, computed, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { QuestionFilled } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { addDomainOverride, updateDomainOverride } from '@/api/recommendation-strategy'
  import type {
    DomainOverride,
    StrategyWeights,
    RegulationLevel
  } from '@/types/recommendation-strategy'

  // 法规层级选项
  const LEVEL_OPTIONS: { label: string; value: RegulationLevel }[] = [
    { label: '法律', value: 'law' },
    { label: '行政法规', value: 'admin' },
    { label: '部门规章', value: 'rule' },
    { label: '地方法规', value: 'local' },
    { label: '规范性文件', value: 'normative' }
  ]

  // 5 维权重的展示文案
  const WEIGHT_FIELDS: { key: keyof StrategyWeights; label: string; tip: string }[] = [
    { key: 'keywordMatch', label: '关键词匹配', tip: '问题描述与法规条款关键词命中数量' },
    { key: 'tagMatch', label: '标签匹配', tip: '法规条款自带的业务标签是否命中输入提示标签' },
    { key: 'levelPriority', label: '法规层级', tip: '法律 > 行政法规 > 部门规章，配合基准分使用' },
    { key: 'recency', label: '颁布年份新旧', tip: '颁布年份越近得分越高' },
    { key: 'adoptionRate', label: '历史采纳率', tip: '该条款历史采纳次数 / 推荐次数' }
  ]

  // 标签备选（与全局策略可选标签保持一致）
  const TAG_OPTIONS = ['财务', '采购', '医疗', '工程', '资产', '招投标']

  const props = defineProps<{
    open: boolean
    // 编辑时传入完整对象，新增时传 null
    editing: DomainOverride | null
    // 全局允许的标签，限制可选范围
    globalTags: string[]
  }>()

  const emit = defineEmits<{
    'update:open': [val: boolean]
    saved: []
  }>()

  const visible = computed({
    get: () => props.open,
    set: (v) => emit('update:open', v)
  })

  // 表单数据，支持新增/编辑两种模式
  const formRef = ref<FormInstance>()
  const form = reactive<{
    id: number | null
    domain: string
    enabled: boolean
    weights: StrategyWeights
    threshold: number
    topN: number
    regulationLevelFilter: RegulationLevel[]
    tagFilter: string[]
    llmRerankEnabled: boolean
  }>({
    id: null,
    domain: '',
    enabled: true,
    weights: {
      keywordMatch: 0.4,
      tagMatch: 0.25,
      levelPriority: 0.15,
      recency: 0.1,
      adoptionRate: 0.1
    },
    threshold: 0.55,
    topN: 5,
    regulationLevelFilter: ['law', 'admin', 'rule'],
    tagFilter: [],
    llmRerankEnabled: true
  })

  const rules: FormRules = {
    domain: [{ required: true, message: '请选择领域', trigger: 'change' }],
    topN: [{ required: true, message: '请输入 Top N', trigger: 'blur' }]
  }

  // 抽屉打开时根据 editing 初始化表单
  watch(
    () => props.open,
    (val) => {
      if (!val) return
      if (props.editing) {
        // 编辑模式：拷贝已有数据
        Object.assign(form, {
          id: props.editing.id,
          domain: props.editing.domain,
          enabled: props.editing.enabled,
          weights: { ...props.editing.weights },
          threshold: props.editing.threshold,
          topN: props.editing.topN,
          regulationLevelFilter: [...props.editing.regulationLevelFilter],
          tagFilter: [...props.editing.tagFilter],
          llmRerankEnabled: props.editing.llmRerankEnabled
        })
      } else {
        // 新增模式：恢复默认值
        Object.assign(form, {
          id: null,
          domain: '',
          enabled: true,
          weights: {
            keywordMatch: 0.4,
            tagMatch: 0.25,
            levelPriority: 0.15,
            recency: 0.1,
            adoptionRate: 0.1
          },
          threshold: 0.55,
          topN: 5,
          regulationLevelFilter: ['law', 'admin', 'rule'],
          tagFilter: [],
          llmRerankEnabled: true
        })
      }
    }
  )

  // 权重总和（用于归一化展示）
  const weightSum = computed(() => WEIGHT_FIELDS.reduce((sum, f) => sum + form.weights[f.key], 0))

  // 计算单个权重归一化后占比
  const normalizedRatio = (val: number) => (weightSum.value > 0 ? (val / weightSum.value) * 100 : 0)

  // 提交保存（提交前归一化权重）
  const saving = ref(false)
  const handleSubmit = async () => {
    await formRef.value?.validate().catch(() => {
      throw new Error('validate failed')
    })
    if (weightSum.value <= 0) {
      ElMessage.warning('权重总和不能为 0')
      return
    }
    // 归一化权重
    const normalized: StrategyWeights = {
      keywordMatch: form.weights.keywordMatch / weightSum.value,
      tagMatch: form.weights.tagMatch / weightSum.value,
      levelPriority: form.weights.levelPriority / weightSum.value,
      recency: form.weights.recency / weightSum.value,
      adoptionRate: form.weights.adoptionRate / weightSum.value
    }
    saving.value = true
    try {
      const payload = {
        domain: form.domain,
        enabled: form.enabled,
        weights: normalized,
        threshold: form.threshold,
        topN: form.topN,
        regulationLevelFilter: form.regulationLevelFilter,
        tagFilter: form.tagFilter,
        llmRerankEnabled: form.llmRerankEnabled
      }
      const res = form.id
        ? await updateDomainOverride({ ...payload, id: form.id, updatedAt: '' })
        : await addDomainOverride(payload)
      if (res.code === 200) {
        ElMessage.success(form.id ? '更新成功' : '新增成功')
        visible.value = false
        emit('saved')
      } else {
        ElMessage.error(res.message || '操作失败')
      }
    } finally {
      saving.value = false
    }
  }
</script>

<template>
  <el-drawer
    v-model="visible"
    :title="props.editing ? '编辑领域覆盖策略' : '新增领域覆盖策略'"
    size="720px"
    :close-on-click-modal="false"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="140px" class="override-form">
      <el-form-item label="领域" prop="domain">
        <el-select
          v-model="form.domain"
          placeholder="请选择领域"
          style="width: 240px"
          :disabled="!!props.editing"
        >
          <el-option v-for="d in TAG_OPTIONS" :key="d" :label="d" :value="d" />
        </el-select>
        <span class="form-tip">编辑模式下不允许修改领域</span>
      </el-form-item>

      <el-form-item label="启用状态">
        <el-switch v-model="form.enabled" />
      </el-form-item>

      <!-- 5 维权重 -->
      <el-divider content-position="left">打分权重</el-divider>
      <el-form-item v-for="f in WEIGHT_FIELDS" :key="f.key" :label="f.label">
        <div class="weight-row">
          <el-slider
            v-model="form.weights[f.key]"
            :min="0"
            :max="1"
            :step="0.01"
            class="weight-slider"
          />
          <div class="weight-value">
            <div class="raw">{{ form.weights[f.key].toFixed(2) }}</div>
            <div class="ratio" :class="{ 'ratio-warn': normalizedRatio(form.weights[f.key]) > 50 }">
              占 {{ normalizedRatio(form.weights[f.key]).toFixed(1) }}%
            </div>
          </div>
          <el-tooltip :content="f.tip" placement="top">
            <el-icon class="tip-icon"><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
      </el-form-item>

      <!-- 阈值 / Top N -->
      <el-divider content-position="left">召回控制</el-divider>
      <el-form-item label="相关度阈值">
        <el-slider v-model="form.threshold" :min="0" :max="1" :step="0.01" style="width: 320px" />
        <span class="form-tip">{{ form.threshold.toFixed(2) }}</span>
      </el-form-item>
      <el-form-item label="Top N" prop="topN">
        <el-input-number v-model="form.topN" :min="1" :max="20" />
      </el-form-item>

      <!-- 过滤条件 -->
      <el-divider content-position="left">过滤条件</el-divider>
      <el-form-item label="法规层级">
        <el-checkbox-group v-model="form.regulationLevelFilter">
          <el-checkbox v-for="opt in LEVEL_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="参与标签">
        <el-select
          v-model="form.tagFilter"
          multiple
          collapse-tags
          placeholder="留空表示该覆盖策略不限制标签"
          style="width: 320px"
        >
          <el-option v-for="d in props.globalTags" :key="d" :label="d" :value="d" />
        </el-select>
      </el-form-item>

      <!-- LLM 二排 -->
      <el-form-item label="LLM 二排">
        <el-switch v-model="form.llmRerankEnabled" />
        <span class="form-tip">对初步召回结果二次精排，提升准确率</span>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSubmit">保存</el-button>
    </template>
  </el-drawer>
</template>

<style lang="scss" scoped>
  .override-form {
    padding-right: 16px;
  }

  .weight-row {
    display: flex;
    gap: 12px;
    align-items: center;
    width: 100%;
  }

  .weight-slider {
    flex: 1;
  }

  .weight-value {
    flex: 0 0 80px;
    text-align: right;

    .raw {
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .ratio {
      margin-top: 2px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    .ratio-warn {
      color: var(--el-color-warning);
    }
  }

  .tip-icon {
    flex: 0 0 16px;
    color: var(--el-text-color-placeholder);
    cursor: help;
  }

  .form-tip {
    margin-left: 12px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
</style>
