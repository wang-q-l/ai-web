<script setup lang="ts">
  // 法规推荐策略页面：单一全局策略表单 + 推荐试验台
  // 3 维度打分：关键词匹配 / 问题案例匹配 / 颁布年份新旧
  import { ref, reactive, computed, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { MagicStick, QuestionFilled } from '@element-plus/icons-vue'
  import { getGlobalStrategy, updateGlobalStrategy } from '@/api/recommendation-strategy'
  import type { StrategyConfig, StrategyWeights } from '@/types/recommendation-strategy'
  import ExperimentDrawer from './components/ExperimentDrawer.vue'

  // 3 维权重定义（含 tooltip 文案）
  const WEIGHT_FIELDS: { key: keyof StrategyWeights; label: string; tip: string }[] = [
    {
      key: 'keywordMatch',
      label: '关键词匹配',
      tip: '问题描述与法规条款关键词命中数量越多，得分越高'
    },
    {
      key: 'caseMatch',
      label: '问题案例匹配',
      tip: '与历史相似问题案例引用过的法规获得加分（协同推荐）'
    },
    {
      key: 'recency',
      label: '颁布年份新旧',
      tip: '颁布年份越近得分越高'
    }
  ]

  // 当前编辑中的全局策略（同时作为试验台的输入参数，未保存也可试）
  const globalStrategy = reactive<StrategyConfig>({
    weights: {
      keywordMatch: 0.4,
      caseMatch: 0.4,
      recency: 0.2
    },
    threshold: 0.5,
    topN: 5
  })

  // 权重总和（用于归一化展示）
  const weightSum = computed(() =>
    WEIGHT_FIELDS.reduce((sum, f) => sum + globalStrategy.weights[f.key], 0)
  )
  // 单维度归一化占比
  const normalizedRatio = (val: number) => (weightSum.value > 0 ? (val / weightSum.value) * 100 : 0)

  // 加载全局策略
  const loadGlobalStrategy = async () => {
    const res = await getGlobalStrategy()
    if (res.code === 200 && res.data) {
      Object.assign(globalStrategy, res.data)
    }
  }

  // 保存全局策略（提交前归一化权重）
  const savingGlobal = ref(false)
  const handleSaveGlobal = async () => {
    if (weightSum.value <= 0) {
      ElMessage.warning('权重总和不能为 0')
      return
    }
    // 归一化权重
    const normalized: StrategyWeights = {
      keywordMatch: globalStrategy.weights.keywordMatch / weightSum.value,
      caseMatch: globalStrategy.weights.caseMatch / weightSum.value,
      recency: globalStrategy.weights.recency / weightSum.value
    }
    savingGlobal.value = true
    try {
      const res = await updateGlobalStrategy({ ...globalStrategy, weights: normalized })
      if (res.code === 200) {
        ElMessage.success('全局策略已保存')
        // 写回归一化后的值，让用户看到生效结果
        Object.assign(globalStrategy.weights, normalized)
      } else {
        ElMessage.error(res.message || '保存失败')
      }
    } finally {
      savingGlobal.value = false
    }
  }

  // 重置为系统默认
  const handleResetGlobal = () => {
    Object.assign(globalStrategy, {
      weights: { keywordMatch: 0.4, caseMatch: 0.4, recency: 0.2 },
      threshold: 0.5,
      topN: 5
    })
    ElMessage.info('已重置为默认值，记得点保存')
  }

  // 推荐试验台
  const experimentOpen = ref(false)
  const handleOpenExperiment = () => {
    experimentOpen.value = true
  }

  // 初始化
  onMounted(() => {
    loadGlobalStrategy()
  })
</script>

<template>
  <div class="strategy-page">
    <!-- 页面头部 -->
    <el-card class="header-card" shadow="never">
      <div class="header-content">
        <div class="header-left">
          <div class="page-title">法规推荐策略</div>
          <div class="page-desc">配置审计问题推荐法规依据时使用的打分权重与最低推荐阈值</div>
        </div>
        <el-button type="primary" @click="handleOpenExperiment">
          <el-icon><MagicStick /></el-icon>
          推荐试验台
        </el-button>
      </div>
    </el-card>

    <!-- 全局策略表单 -->
    <el-card class="form-card" shadow="never">
      <el-form label-width="160px" class="form-block">
        <!-- 3 维权重 -->
        <el-divider content-position="left">打分权重</el-divider>
        <el-form-item v-for="f in WEIGHT_FIELDS" :key="f.key">
          <template #label>
            <span>{{ f.label }}</span>
            <el-tooltip :content="f.tip" placement="top">
              <el-icon class="tip-icon"><QuestionFilled /></el-icon>
            </el-tooltip>
          </template>
          <div class="weight-row">
            <el-slider
              v-model="globalStrategy.weights[f.key]"
              :min="0"
              :max="1"
              :step="0.01"
              class="weight-slider"
            />
            <div class="weight-value">
              <div class="raw">{{ globalStrategy.weights[f.key].toFixed(2) }}</div>
              <div
                class="ratio"
                :class="{ 'ratio-warn': normalizedRatio(globalStrategy.weights[f.key]) > 60 }"
              >
                占 {{ normalizedRatio(globalStrategy.weights[f.key]).toFixed(1) }}%
              </div>
            </div>
          </div>
        </el-form-item>

        <!-- 输出控制 -->
        <el-divider content-position="left">输出控制</el-divider>
        <el-form-item label="最低推荐阈值">
          <el-slider
            v-model="globalStrategy.threshold"
            :min="0"
            :max="1"
            :step="0.01"
            style="width: 360px"
          />
          <span class="form-tip">{{ globalStrategy.threshold.toFixed(2) }}</span>
        </el-form-item>
        <el-form-item label="Top N">
          <el-input-number v-model="globalStrategy.topN" :min="1" :max="20" />
          <span class="form-tip">推荐结果最多展示几条</span>
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button type="primary" :loading="savingGlobal" @click="handleSaveGlobal">
            保存全局策略
          </el-button>
          <el-button @click="handleResetGlobal">重置默认</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 推荐试验台抽屉 -->
    <ExperimentDrawer v-model:open="experimentOpen" :draft-strategy="globalStrategy" />
  </div>
</template>

<style lang="scss" scoped>
  .strategy-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }

  .header-card,
  .form-card {
    border-radius: 8px;
  }

  .header-card :deep(.el-card__body) {
    padding: 16px 20px;
    overflow: visible;
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .page-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .page-desc {
    margin-top: 4px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .form-block {
    max-width: 880px;
  }

  .weight-row {
    display: flex;
    gap: 16px;
    align-items: center;
    width: 100%;
  }

  .weight-slider {
    flex: 1;
    max-width: 480px;
  }

  .weight-value {
    flex: 0 0 90px;
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
    margin-left: 4px;
    color: var(--el-text-color-placeholder);
    cursor: help;
  }

  .form-tip {
    margin-left: 12px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
</style>
