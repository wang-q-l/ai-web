<script setup lang="ts">
  // 推荐试验台抽屉：用当前内存策略快速试推荐，展示 Top N 与各维度评分明细 + 时效校验
  import { ref, computed, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Calendar, InfoFilled } from '@element-plus/icons-vue'
  import { runExperiment } from '@/api/recommendation-strategy'
  import type {
    StrategyConfig,
    ExperimentResultItem,
    OccurrencePeriod
  } from '@/types/recommendation-strategy'

  // 3 维度名映射，用于评分明细行
  const DIM_LABEL: Record<string, string> = {
    keywordMatch: '关键词匹配',
    caseMatch: '问题案例匹配',
    recency: '颁布年份'
  }

  const props = defineProps<{
    open: boolean
    // 当前内存中的策略（未保存也可试）
    draftStrategy: StrategyConfig
  }>()

  const emit = defineEmits<{
    'update:open': [val: boolean]
  }>()

  // 表单字段
  const problemDescription = ref('')
  const loading = ref(false)
  const results = ref<ExperimentResultItem[]>([])
  const lowConfidence = ref(false)
  // LLM 抽取出的问题发生时间
  const occurrence = ref<OccurrencePeriod | null>(null)

  // 时效徽章颜色映射
  const TEMPORAL_TAG: Record<
    string,
    { type: 'success' | 'warning' | 'danger' | 'info'; text: string }
  > = {
    valid: { type: 'success', text: '✓ 时效有效' },
    partial: { type: 'warning', text: '⚠ 时效部分冲突' },
    'conflict-with-replacement': { type: 'warning', text: '⚠ 时效冲突·有替代' },
    'conflict-no-replacement': { type: 'danger', text: '⚠ 时效冲突·无替代' },
    skipped: { type: 'info', text: '— 未校验' }
  }

  // 抽屉显隐双向绑定
  const visible = computed({
    get: () => props.open,
    set: (v) => emit('update:open', v)
  })

  // 抽屉关闭时清空结果，避免下次打开看到旧数据
  watch(visible, (val) => {
    if (!val) {
      results.value = []
      lowConfidence.value = false
      occurrence.value = null
    }
  })

  // 触发试推荐
  const handleRun = async () => {
    if (!problemDescription.value.trim()) {
      ElMessage.warning('请输入问题描述')
      return
    }
    loading.value = true
    try {
      const res = await runExperiment({
        problemDescription: problemDescription.value,
        draftStrategy: props.draftStrategy
      })
      results.value = res.data || []
      lowConfidence.value = res.message?.includes('低相关度') || false
      // mock 错误分支与正常分支返回结构略有不同，用断言安全访问
      occurrence.value = (res as { occurrence?: OccurrencePeriod }).occurrence ?? null
      if (results.value.length === 0) {
        ElMessage.info('未匹配到合适法规，可调整问题描述或权重后重试')
      }
    } finally {
      loading.value = false
    }
  }

  // 清空
  const handleClear = () => {
    problemDescription.value = ''
    results.value = []
    lowConfidence.value = false
    occurrence.value = null
  }
</script>

<template>
  <el-drawer v-model="visible" title="推荐试验台" size="720px" :close-on-click-modal="false">
    <div class="experiment-body">
      <!-- 输入区 -->
      <el-card class="input-card" shadow="never">
        <el-form label-width="90px">
          <el-form-item label="问题描述" required>
            <el-input
              v-model="problemDescription"
              type="textarea"
              :rows="4"
              maxlength="500"
              show-word-limit
              placeholder="例如：开发区医院将健康管理中心等5个科室与社会资本合作设立营利性项目"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="loading" @click="handleRun">运行试推荐</el-button>
            <el-button @click="handleClear">清空</el-button>
            <el-tag class="hint-tag" type="info" effect="plain">使用当前未保存参数</el-tag>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 结果区 -->
      <el-card class="result-card" shadow="never">
        <template #header>
          <div class="result-header">
            <span class="result-title">推荐结果（Top {{ props.draftStrategy.topN }}）</span>
            <el-tag v-if="lowConfidence" type="warning">低相关度，建议人工确认</el-tag>
          </div>
        </template>

        <!-- 时效校验信息条 -->
        <div v-if="occurrence" class="occurrence-bar">
          <template v-if="occurrence.type === 'unknown'">
            <el-icon><InfoFilled /></el-icon>
            <span class="occ-text">未在描述中识别到问题发生时间，时效校验已跳过</span>
          </template>
          <template v-else>
            <el-icon><Calendar /></el-icon>
            <span class="occ-text">
              已识别问题发生时间：<strong>{{ occurrence.start }} 至 {{ occurrence.end }}</strong>
              <span class="occ-raw">（原文："{{ occurrence.rawText }}"）</span>
              <el-tag v-if="occurrence.confidence < 0.7" size="small" type="warning" class="occ-low"
                >低置信度</el-tag
              >
            </span>
          </template>
        </div>

        <!-- 空态 -->
        <el-empty v-if="!results.length" :image-size="80" description="尚未试推荐" />

        <!-- 结果列表 -->
        <div v-else class="result-list">
          <div v-for="(item, idx) in results" :key="item.id" class="result-item">
            <div class="item-head">
              <div class="item-title">
                <span class="rank">#{{ idx + 1 }}</span>
                <span class="reg-name">{{ item.regulationName }}</span>
                <span class="article-no">{{ item.articleNo }}</span>
                <el-tag size="small" type="info">{{ item.year }}</el-tag>
                <!-- 时效徽章 -->
                <el-tag
                  v-if="item.temporalStatus && TEMPORAL_TAG[item.temporalStatus]"
                  size="small"
                  :type="TEMPORAL_TAG[item.temporalStatus].type"
                >
                  {{ TEMPORAL_TAG[item.temporalStatus].text }}
                </el-tag>
              </div>
              <div class="item-score">
                <span class="score-label">综合得分</span>
                <span class="score-value">{{ item.score.toFixed(3) }}</span>
              </div>
            </div>
            <div class="item-text">{{ item.articleText }}</div>
            <div class="item-reason">{{ item.reason }}</div>

            <!-- 部分冲突分段建议 -->
            <div v-if="item.partialHint" class="temporal-hint warn">
              {{ item.partialHint }}
            </div>

            <!-- 时效冲突无替代提示 -->
            <div
              v-if="item.temporalStatus === 'conflict-no-replacement'"
              class="temporal-hint danger"
            >
              ⚠ 行为发生时该法规尚未颁布，且未找到当时生效的同类法规，请审计人员人工判断。
            </div>

            <!-- 时效冲突有替代：内嵌前身法规 -->
            <div v-if="item.predecessors?.length" class="predecessor-block">
              <div class="pre-title">
                ⚠ 行为发生于法规生效之前，依"法不溯及既往"原则不可作为定性依据。建议改用前身法规：
              </div>
              <div v-for="pre in item.predecessors" :key="pre.id" class="pre-card">
                <div class="pre-head">
                  <span class="pre-name">《{{ pre.regulationName }}》{{ pre.articleNo }}</span>
                  <el-tag size="small" type="success">生效 {{ pre.effectiveDate }}</el-tag>
                </div>
                <div class="pre-text">{{ pre.articleText }}</div>
              </div>
            </div>

            <!-- 评分明细：维度 + 进度条 + 数值 -->
            <div class="item-breakdown">
              <div
                v-for="key in Object.keys(item.scoreBreakdown) as Array<
                  keyof typeof item.scoreBreakdown
                >"
                :key="key"
                class="breakdown-row"
              >
                <span class="dim-name">{{ DIM_LABEL[key] }}</span>
                <el-progress
                  :percentage="Math.min(100, item.scoreBreakdown[key] * 250)"
                  :show-text="false"
                  :stroke-width="6"
                  class="dim-bar"
                />
                <span class="dim-value">{{ item.scoreBreakdown[key].toFixed(3) }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </el-drawer>
</template>

<style lang="scss" scoped>
  .experiment-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .input-card,
  .result-card {
    border-radius: 8px;
  }

  .hint-tag {
    margin-left: 12px;
  }

  .result-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .result-title {
      font-size: 14px;
      font-weight: 600;
    }
  }

  .result-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .result-item {
    padding: 12px 14px;
    background: var(--el-fill-color-blank);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
  }

  .item-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .item-title {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;

    .rank {
      font-weight: 700;
      color: var(--el-color-primary);
    }

    .reg-name {
      font-weight: 600;
    }

    .article-no {
      color: var(--el-text-color-regular);
    }
  }

  .item-score {
    display: flex;
    flex-direction: column;
    align-items: flex-end;

    .score-label {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    .score-value {
      font-size: 16px;
      font-weight: 700;
      color: var(--el-color-primary);
    }
  }

  .item-text {
    margin-bottom: 6px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-regular);
  }

  .item-reason {
    margin-bottom: 10px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .item-breakdown {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-top: 8px;
    border-top: 1px dashed var(--el-border-color-lighter);
  }

  /* 时效校验信息条 */
  .occurrence-bar {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 8px 12px;
    margin-bottom: 12px;
    font-size: 12px;
    color: var(--el-text-color-regular);
    background: var(--el-color-primary-light-9);
    border-radius: 6px;

    .occ-text {
      flex: 1;
    }

    .occ-raw {
      margin-left: 4px;
      color: var(--el-text-color-secondary);
    }

    .occ-low {
      margin-left: 6px;
    }
  }

  /* 时效冲突提示 */
  .temporal-hint {
    padding: 8px 10px;
    margin: 8px 0;
    font-size: 12px;
    line-height: 1.6;
    border-radius: 4px;

    &.warn {
      color: var(--el-color-warning-dark-2);
      background: var(--el-color-warning-light-9);
      border-left: 3px solid var(--el-color-warning);
    }

    &.danger {
      color: var(--el-color-danger-dark-2);
      background: var(--el-color-danger-light-9);
      border-left: 3px solid var(--el-color-danger);
    }
  }

  /* 前身法规迷你卡片 */
  .predecessor-block {
    padding: 10px 12px;
    margin: 10px 0;
    background: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;

    .pre-title {
      margin-bottom: 8px;
      font-size: 12px;
      font-weight: 500;
      color: var(--el-color-warning-dark-2);
    }

    .pre-card {
      padding: 8px 10px;
      margin-top: 6px;
      background: #fff;
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 4px;

      .pre-head {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-bottom: 4px;

        .pre-name {
          font-size: 13px;
          font-weight: 600;
        }
      }

      .pre-text {
        font-size: 12px;
        line-height: 1.5;
        color: var(--el-text-color-regular);
      }
    }
  }

  .breakdown-row {
    display: flex;
    gap: 12px;
    align-items: center;

    .dim-name {
      flex: 0 0 90px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    .dim-bar {
      flex: 1;
    }

    .dim-value {
      flex: 0 0 56px;
      font-size: 12px;
      color: var(--el-text-color-primary);
      text-align: right;
    }
  }
</style>
