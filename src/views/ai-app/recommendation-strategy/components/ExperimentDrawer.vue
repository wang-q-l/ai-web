<script setup lang="ts">
  // 推荐试验台抽屉：用当前内存策略快速试推荐，展示 Top N 与各维度评分明细
  import { ref, computed, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { runExperiment } from '@/api/recommendation-strategy'
  import type {
    StrategyConfig,
    LevelBaseScore,
    ExperimentResultItem
  } from '@/types/recommendation-strategy'

  // 法规层级中文映射，用于结果展示
  const LEVEL_LABEL: Record<string, string> = {
    law: '法律',
    admin: '行政法规',
    rule: '部门规章',
    local: '地方法规',
    normative: '规范性文件',
    internal: '内部规章制度'
  }

  // 5 维度名映射，用于评分明细行
  const DIM_LABEL: Record<string, string> = {
    keywordMatch: '关键词匹配',
    tagMatch: '标签匹配',
    levelPriority: '法规层级',
    recency: '颁布年份',
    adoptionRate: '历史采纳率'
  }

  const props = defineProps<{
    open: boolean
    // 当前内存中的策略与基准分（未保存也可试）
    draftStrategy: StrategyConfig
    levelBaseScore: LevelBaseScore
  }>()

  const emit = defineEmits<{
    'update:open': [val: boolean]
  }>()

  // 表单字段
  const problemDescription = ref('')
  const tagHint = ref('')
  const loading = ref(false)
  const results = ref<ExperimentResultItem[]>([])
  const lowConfidence = ref(false)

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
        tagHint: tagHint.value || undefined,
        draftStrategy: props.draftStrategy,
        levelBaseScore: props.levelBaseScore
      })
      results.value = res.data || []
      lowConfidence.value = res.message?.includes('低相关度') || false
      if (results.value.length === 0) {
        ElMessage.info('未匹配到合适法规，可调整关键词或同义词表后重试')
      }
    } finally {
      loading.value = false
    }
  }

  // 清空
  const handleClear = () => {
    problemDescription.value = ''
    tagHint.value = ''
    results.value = []
    lowConfidence.value = false
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
          <el-form-item label="标签提示">
            <el-select
              v-model="tagHint"
              placeholder="可选，命中标签时打分更高"
              clearable
              style="width: 240px"
            >
              <el-option
                v-for="d in props.draftStrategy.tagFilter"
                :key="d"
                :label="d"
                :value="d"
              />
            </el-select>
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

        <!-- 空态 -->
        <el-empty v-if="!results.length" :image-size="80" description="尚未试推荐" />

        <!-- 结果列表 -->
        <div v-else class="result-list">
          <div v-for="(item, idx) in results" :key="idx" class="result-item">
            <div class="item-head">
              <div class="item-title">
                <span class="rank">#{{ idx + 1 }}</span>
                <span class="reg-name">{{ item.regulationName }}</span>
                <span class="article-no">{{ item.articleNo }}</span>
                <el-tag size="small" type="primary">{{ LEVEL_LABEL[item.level] }}</el-tag>
                <el-tag size="small" type="info">{{ item.year }}</el-tag>
              </div>
              <div class="item-score">
                <span class="score-label">综合得分</span>
                <span class="score-value">{{ item.score.toFixed(3) }}</span>
              </div>
            </div>
            <div class="item-text">{{ item.articleText }}</div>
            <div class="item-reason">{{ item.reason }}</div>

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
                  :percentage="Math.min(100, item.scoreBreakdown[key] * 200)"
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

  .breakdown-row {
    display: flex;
    gap: 12px;
    align-items: center;

    .dim-name {
      flex: 0 0 84px;
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
