<script setup lang="ts">
  // 问题新增抽屉：静态 UI 骨架，包含字段填写 + 全屏切换 + 暂存/保存/取消按钮
  import { ref, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import { FullScreen, DocumentChecked, Close } from '@element-plus/icons-vue'

  // 问题类别下拉选项（静态）
  const CATEGORY_OPTIONS = [
    '预算管理',
    '财务问题',
    '采购问题',
    '医疗违规事项',
    '工程问题',
    '资产问题',
    '招投标问题'
  ]

  const props = defineProps<{
    open: boolean
  }>()

  const emit = defineEmits<{
    'update:open': [val: boolean]
    // 用户点击「法规推荐」按钮，把当前问题表述传给父组件，由父组件打开 AI 助理抽屉
    recommend: [query: string]
  }>()

  // 抽屉显隐双向绑定
  const visible = computed({
    get: () => props.open,
    set: (v) => emit('update:open', v)
  })

  // 全屏状态：true 时宽度切到 100%
  const isFullscreen = ref(false)
  const drawerSize = computed(() => (isFullscreen.value ? '100%' : '720px'))

  // 表单字段（无校验、无联动，仅 UI 数据绑定）
  const form = ref({
    title: '违规设立经营性项目',
    description: '2016-2018年，开发区医院将健康管理中心等5个科室与社会资本合作设立营利性项目。',
    category: '医疗违规事项',
    isAmountIssue: 'yes',
    amount: undefined as number | undefined,
    qualitativeBasis: '',
    auditAdvice: ''
  })

  // 切换全屏
  const toggleFullscreen = () => {
    isFullscreen.value = !isFullscreen.value
  }

  // 法规推荐：必须先填问题表述
  const handleRegulationRecommend = () => {
    const query = form.value.description.trim()
    if (!query) {
      ElMessage.warning('请先填写「问题表述」后再点击法规推荐')
      return
    }
    // 抛给父组件打开 AI 助理抽屉
    emit('recommend', query)
  }

  // 父组件回填定性依据：追加到末尾，避免覆盖已有内容
  const appendQualitativeBasis = (text: string) => {
    if (!text) return
    if (form.value.qualitativeBasis) {
      form.value.qualitativeBasis = form.value.qualitativeBasis + '\n' + text
    } else {
      form.value.qualitativeBasis = text
    }
    ElMessage.success('已引用至定性依据')
  }

  // 暴露给父组件调用
  defineExpose({ appendQualitativeBasis })

  // 暂存：仅 UI 提示
  const handleSaveDraft = () => {
    ElMessage.success('已暂存')
  }

  // 保存：仅 UI 提示并关闭
  const handleSubmit = () => {
    ElMessage.success('保存成功')
    visible.value = false
  }

  // 取消：直接关闭
  const handleCancel = () => {
    visible.value = false
  }
</script>

<template>
  <el-drawer
    v-model="visible"
    :size="drawerSize"
    :show-close="false"
    :modal="false"
    :close-on-click-modal="false"
    class="problem-drawer"
  >
    <!-- 自定义 header：标题 + 全屏 + 关闭 -->
    <template #header>
      <div class="drawer-header">
        <span class="drawer-title">问题新增</span>
        <div class="drawer-actions">
          <el-button text @click="toggleFullscreen">
            <el-icon><FullScreen /></el-icon>
            <span>{{ isFullscreen ? '退出全屏' : '全屏' }}</span>
          </el-button>
          <el-button text class="close-btn" @click="handleCancel">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </div>
    </template>

    <!-- 表单内容 -->
    <el-form :model="form" label-position="top" class="problem-form">
      <el-form-item label="问题标题" required>
        <el-input v-model="form.title" maxlength="1000" show-word-limit placeholder="请输入" />
      </el-form-item>

      <el-form-item label="问题表述" required>
        <el-input
          v-model="form.description"
          type="textarea"
          :autosize="{ minRows: 2 }"
          maxlength="1000"
          show-word-limit
          resize="none"
        />
      </el-form-item>

      <el-form-item label="问题类别" required>
        <el-select v-model="form.category" placeholder="请选择" style="width: 100%">
          <el-option v-for="c in CATEGORY_OPTIONS" :key="c" :label="c" :value="c" />
        </el-select>
      </el-form-item>

      <el-form-item label="是否金额类问题">
        <el-radio-group v-model="form.isAmountIssue">
          <el-radio value="yes">是</el-radio>
          <el-radio value="no">否</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="涉及金额（万元）">
        <el-input-number
          v-model="form.amount"
          :min="0"
          :precision="2"
          controls-position="right"
          placeholder="请输入"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="定性依据">
        <template #label>
          <div class="label-with-action">
            <span>定性依据</span>
            <el-button type="primary" link @click="handleRegulationRecommend">法规推荐</el-button>
          </div>
        </template>
        <el-input
          v-model="form.qualitativeBasis"
          type="textarea"
          :autosize="{ minRows: 2 }"
          maxlength="1000"
          show-word-limit
          resize="none"
        />
      </el-form-item>

      <el-form-item label="审计建议（意见）">
        <el-input
          v-model="form.auditAdvice"
          type="textarea"
          :autosize="{ minRows: 2 }"
          maxlength="1000"
          show-word-limit
          resize="none"
        />
      </el-form-item>
    </el-form>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleSaveDraft">
          <el-icon><DocumentChecked /></el-icon>
          <span>暂存</span>
        </el-button>
        <el-button type="primary" @click="handleSubmit">
          <el-icon><DocumentChecked /></el-icon>
          <span>保存</span>
        </el-button>
        <el-button @click="handleCancel">
          <el-icon><Close /></el-icon>
          <span>取消</span>
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<style lang="scss" scoped>
  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    .drawer-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .drawer-actions {
      display: flex;
      gap: 4px;
      align-items: center;
    }

    .close-btn {
      padding: 6px;
    }
  }

  .problem-form {
    padding: 0 4px;
  }

  .label-with-action {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .drawer-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-start;
  }
</style>
