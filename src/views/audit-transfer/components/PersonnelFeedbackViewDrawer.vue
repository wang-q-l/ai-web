<template>
  <el-drawer
    v-model="visible"
    :title="`反馈信息 - ${personnelName}`"
    size="40%"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="feedback-view-content" v-loading="loading">
      <div v-if="feedbackInfo">
        <el-form label-width="160px" class="feedback-view-form">
          <!-- 受理信息 -->
          <div class="form-section">
            <div class="section-title">受理信息</div>
            <el-form-item label="受理机关">
              <el-input v-model="feedbackInfo.acceptOrganization" disabled />
            </el-form-item>
            <el-form-item label="受理日期">
              <el-input v-model="feedbackInfo.acceptDate" disabled />
            </el-form-item>
          </div>

          <!-- 处理信息 -->
          <div v-if="feedbackInfo.handleResult" class="form-section">
            <div class="section-title">处理信息</div>
            <el-form-item label="处理结果文件名称">
              <el-input :value="feedbackInfo.resultFileName || '-'" disabled />
            </el-form-item>
            <el-form-item label="处理结果文件文号">
              <el-input :value="feedbackInfo.resultFileCode || '-'" disabled />
            </el-form-item>
            <el-form-item label="处理机关">
              <el-input :value="feedbackInfo.handleOrganization || '-'" disabled />
            </el-form-item>
            <el-form-item label="处理日期">
              <el-input :value="feedbackInfo.handleDate || '-'" disabled />
            </el-form-item>
            <el-form-item label="处理结果">
              <el-input
                :value="
                  feedbackInfo.handleResult === 1
                    ? '党纪处分'
                    : feedbackInfo.handleResult === 2
                      ? '政务处分'
                      : feedbackInfo.handleResult === 3
                        ? '第一种形态'
                        : feedbackInfo.handleResult === 4
                          ? '经济处罚'
                          : feedbackInfo.handleResult === 5
                            ? '其他'
                            : '经核实不是问题'
                "
                disabled
              />
            </el-form-item>
            <el-form-item label="处理结果情况描述">
              <el-input
                type="textarea"
                :rows="6"
                :value="feedbackInfo.resultDescription || '-'"
                disabled
              />
            </el-form-item>
          </div>
        </el-form>
      </div>
      <el-empty v-else description="暂无反馈信息" :image-size="120" />
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
  /**
   * 人员反馈查看抽屉组件
   * 用于查看移送人员的反馈信息（只读）
   */
  import { ref, watch } from 'vue'
  import type { PersonnelFeedback } from '@/types/audit-transfer'
  import { getPersonnelFeedback } from '@/api/audit-transfer'

  // Props
  interface Props {
    modelValue: boolean
    personnelId?: number
    personnelName?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    personnelId: undefined,
    personnelName: ''
  })

  // Emits
  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
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

  // 加载状态
  const loading = ref(false)

  // 反馈信息
  const feedbackInfo = ref<PersonnelFeedback | null>(null)

  // 获取反馈信息
  const fetchFeedback = async () => {
    if (!props.personnelId) return

    loading.value = true
    try {
      const res = await getPersonnelFeedback(props.personnelId)
      feedbackInfo.value = res.data
    } catch {
      feedbackInfo.value = null
    } finally {
      loading.value = false
    }
  }

  // 关闭
  const handleClose = () => {
    visible.value = false
    feedbackInfo.value = null
  }
</script>

<style scoped lang="scss">
  .feedback-view-content {
    padding: 0 20px;
  }

  .feedback-view-form {
    .form-section {
      margin-bottom: 32px;

      &:last-child {
        margin-bottom: 0;
      }

      .section-title {
        padding-bottom: 12px;
        margin-bottom: 20px;
        font-size: 16px;
        font-weight: 500;
        color: #303133;
        border-bottom: 1px solid #e4e7ed;
      }
    }

    :deep(.el-form-item) {
      margin-bottom: 18px;
    }

    :deep(.el-input.is-disabled .el-input__wrapper) {
      background-color: #f5f7fa;
      box-shadow: 0 0 0 1px #e4e7ed inset;
    }

    :deep(.el-textarea.is-disabled .el-textarea__inner) {
      color: #606266;
      background-color: #f5f7fa;
    }
  }
</style>
