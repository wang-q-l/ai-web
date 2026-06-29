<template>
  <!-- 问题详情大弹窗：基础信息 + 整改进展 + 整改成效 + 销号结果 -->
  <el-dialog
    v-model="visible"
    title="问题详情"
    width="80%"
    top="6vh"
    class="problem-detail-dialog"
    @close="handleClose"
  >
    <div class="detail-body" v-loading="loading">
      <el-collapse v-model="activeNames">
        <!-- 基础信息 -->
        <el-collapse-item name="base" title="基础信息">
          <el-descriptions :column="2" border class="base-desc" label-width="110px">
            <el-descriptions-item label="问题编号">{{ detail.problemCode }}</el-descriptions-item>
            <el-descriptions-item label="问题表述" :rowspan="2">
              <span class="multiline">{{ detail.problemDesc }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="问题标题">
              {{ detail.problemTitle }}
            </el-descriptions-item>
            <el-descriptions-item label="定性依据">
              <span class="multiline">{{ detail.legalBasis }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="审计建议（意见）">
              <span class="multiline">{{ detail.auditSuggestion }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="问题类别">{{ detail.problemType }}</el-descriptions-item>
            <el-descriptions-item label="是否金额类问题">
              {{ detail.isAmountType ? '是' : '否' }}
            </el-descriptions-item>
            <el-descriptions-item label="涉及金额（万元）">
              {{ detail.involvedAmount }}
            </el-descriptions-item>
            <el-descriptions-item label="整改类型">
              {{ detail.rectificationType }}
            </el-descriptions-item>
            <el-descriptions-item label="整改时限">
              {{ detail.rectificationDeadline }}
            </el-descriptions-item>
            <el-descriptions-item label="整改牵头单位">{{ detail.leadUnit }}</el-descriptions-item>
            <el-descriptions-item label="问题归属单位">
              {{ detail.belongUnit }}
            </el-descriptions-item>
          </el-descriptions>
        </el-collapse-item>

        <!-- 整改方案 -->
        <el-collapse-item name="plan" title="整改方案">
          <el-table :data="detail.planItems" border empty-text="暂无数据" class="plan-table">
            <el-table-column prop="seq" label="序号" width="80" align="center" />
            <el-table-column label="具体的措施（目标）" min-width="320">
              <template #default="{ row }">
                <span class="multiline">{{ row.measure }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="planFinishTime" label="计划完成时间" width="180" />
            <el-table-column prop="responsible" label="措施整改责任人" width="160" />
          </el-table>
        </el-collapse-item>

        <!-- 整改进展 -->
        <el-collapse-item name="progress" title="整改进展">
          <el-table :data="detail.progressRecords" border class="progress-table">
            <el-table-column prop="seq" label="提交记录" width="90" align="center" />
            <el-table-column label="完成整改" align="center">
              <el-table-column label="整改进展" min-width="200">
                <template #default="{ row }">
                  <span class="multiline">{{ row.completedProgress || '–' }}</span>
                </template>
              </el-table-column>
            </el-table-column>
            <el-table-column label="正在整改" align="center">
              <el-table-column label="整改进展" min-width="240">
                <template #default="{ row }">
                  <span class="multiline">{{ row.ongoingProgress || '–' }}</span>
                </template>
              </el-table-column>
            </el-table-column>
            <el-table-column label="尚未整改" align="center">
              <el-table-column label="未整改原因" min-width="160">
                <template #default="{ row }">
                  <span class="multiline">{{ row.notRectifiedReason || '–' }}</span>
                </template>
              </el-table-column>
            </el-table-column>
            <el-table-column prop="reporter" label="填报人" width="120" align="center" />
            <el-table-column prop="reportTime" label="填报时间" width="170" align="center" />
            <el-table-column label="进展记录" width="100" align="center">
              <template #default>
                <el-link type="primary" :underline="false">查看</el-link>
              </template>
            </el-table-column>
          </el-table>
          <!-- 佐证材料 -->
          <div class="evidence-row">
            <span class="evidence-label">佐证材料</span>
            <el-link type="primary" :underline="false">查看（{{ detail.evidenceCount }}）</el-link>
          </div>
        </el-collapse-item>

        <!-- 整改成效 -->
        <el-collapse-item name="effect" title="整改成效">
          <el-descriptions :column="4" border class="amount-desc">
            <el-descriptions-item label="已纠正违纪金额（元）">
              {{ detail.correctedAmount }}
            </el-descriptions-item>
            <el-descriptions-item label="挽回损失金额（元）">
              {{ detail.recoveredAmount }}
            </el-descriptions-item>
            <el-descriptions-item label="工程审减金额（元）">
              {{ detail.auditReducedAmount }}
            </el-descriptions-item>
            <el-descriptions-item label="其他增收节支（元）">
              {{ detail.otherSavingAmount }}
            </el-descriptions-item>
            <el-descriptions-item label="合计金额（元）" :span="4">
              {{ totalAmount }}
            </el-descriptions-item>
          </el-descriptions>

          <div class="sub-title">累计出台、修订制度（{{ detail.systemRecords.length }}）</div>
          <el-table :data="detail.systemRecords" border empty-text="暂无数据" class="effect-table">
            <el-table-column prop="systemName" label="制度名称" min-width="160" />
            <el-table-column prop="improveType" label="制度完善类型" min-width="140" />
            <el-table-column prop="systemFile" label="制度文件" min-width="160" />
            <el-table-column prop="docNo" label="文号" min-width="140" />
            <el-table-column prop="publishDate" label="发布日期" min-width="140" />
          </el-table>
        </el-collapse-item>

        <!-- 销号结果 -->
        <el-collapse-item name="cancel" title="销号结果">
          <el-table :data="detail.cancelResults" border empty-text="暂无数据" class="effect-table">
            <el-table-column prop="checkTime" label="检查时间" min-width="200" />
            <el-table-column prop="checkMethod" label="检查方式" min-width="200" />
            <el-table-column prop="cancelDesc" label="销号说明" min-width="240" />
          </el-table>
        </el-collapse-item>
      </el-collapse>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
  /**
   * 问题详情大弹窗
   * 展示完整问题详情：基础信息 / 整改进展 / 整改成效 / 销号结果
   */
  import { ref, computed, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { ProblemDetail } from '@/types/audit-decision'
  import { getProblemDetail } from '@/api/audit-decision'

  // Props：v-model 控制显隐，problemId 决定加载哪个问题
  const props = defineProps<{
    modelValue: boolean
    problemId: number
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', val: boolean): void
  }>()

  // 弹窗显隐（与父组件 v-model 双向绑定）
  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  // 默认展开全部区块
  const activeNames = ref(['base', 'plan', 'progress', 'effect', 'cancel'])

  const loading = ref(false)

  // 问题详情数据
  const detail = ref<ProblemDetail>(createEmptyDetail())

  // 合计金额 = 四项金额之和
  const totalAmount = computed(() => {
    const d = detail.value
    return (
      (Number(d.correctedAmount) || 0) +
      (Number(d.recoveredAmount) || 0) +
      (Number(d.auditReducedAmount) || 0) +
      (Number(d.otherSavingAmount) || 0)
    )
  })

  // 构造空详情，避免渲染时字段缺失
  function createEmptyDetail(): ProblemDetail {
    return {
      problemCode: '',
      problemTitle: '',
      problemDesc: '',
      legalBasis: '',
      auditSuggestion: '',
      problemType: '',
      isAmountType: false,
      involvedAmount: 0,
      rectificationType: '',
      rectificationDeadline: '',
      leadUnit: '',
      belongUnit: '',
      planItems: [],
      progressRecords: [],
      evidenceCount: 0,
      correctedAmount: 0,
      recoveredAmount: 0,
      auditReducedAmount: 0,
      otherSavingAmount: 0,
      systemRecords: [],
      cancelResults: []
    }
  }

  // 获取问题详情
  const fetchDetail = async () => {
    loading.value = true
    try {
      const res = await getProblemDetail(props.problemId)
      detail.value = res.data
    } catch {
      ElMessage.error('获取问题详情失败')
    } finally {
      loading.value = false
    }
  }

  // 弹窗打开时按当前 problemId 拉取数据
  watch(
    () => props.modelValue,
    (val) => {
      if (val && props.problemId) {
        fetchDetail()
      }
    }
  )

  // 关闭弹窗
  const handleClose = () => {
    visible.value = false
  }
</script>

<style scoped lang="scss">
  /* 弹窗内容区限高滚动，避免内容过长撑爆视口 */
  .detail-body {
    max-height: 74vh;
    padding-right: 4px;
    overflow-y: auto;
  }

  /* 多行文本：保留换行并正常折行 */
  .multiline {
    line-height: 1.7;
    color: #606266;
    word-break: break-word;
    white-space: pre-line;
  }

  .base-desc {
    margin-bottom: 4px;
  }

  /* 基础信息标签不换行（如"问题编号""问题标题"等四字标签保持一行） */
  :deep(.base-desc .el-descriptions__label) {
    white-space: nowrap;
  }

  /* 整改方案表格 */
  .plan-table {
    width: 100%;
  }

  /* 整改进展表格 */
  .progress-table {
    width: 100%;
  }

  /* 佐证材料行 */
  .evidence-row {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 12px 16px;
    border: 1px solid var(--el-border-color-lighter);
    border-top: none;

    .evidence-label {
      font-size: 14px;
      color: #606266;
    }
  }

  /* 整改成效金额区 */
  .amount-desc {
    margin-bottom: 16px;
  }

  .sub-title {
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }

  .effect-table {
    width: 100%;
  }

  :deep(.el-collapse-item__header) {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
  }
</style>
