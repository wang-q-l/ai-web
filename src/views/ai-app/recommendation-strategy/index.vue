<script setup lang="ts">
  // 法规推荐策略页面：4 个 Tab（全局策略 / 领域覆盖 / 同义词 / 法规层级基准分）+ 顶部「推荐试验台」抽屉
  import { ref, reactive, computed, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { MagicStick, QuestionFilled, Plus, Upload } from '@element-plus/icons-vue'
  import {
    getGlobalStrategy,
    updateGlobalStrategy,
    getLevelBaseScore,
    updateLevelBaseScore,
    getDomainOverrideList,
    deleteDomainOverride,
    toggleDomainOverride,
    getSynonymList,
    deleteSynonym
  } from '@/api/recommendation-strategy'
  import type {
    StrategyConfig,
    StrategyWeights,
    RegulationLevel,
    DomainOverride,
    LevelBaseScore,
    SynonymGroup
  } from '@/types/recommendation-strategy'
  import ExperimentDrawer from './components/ExperimentDrawer.vue'
  import DomainOverrideDrawer from './components/DomainOverrideDrawer.vue'
  import SynonymDialog from './components/SynonymDialog.vue'

  // 法规层级选项
  const LEVEL_OPTIONS: { label: string; value: RegulationLevel }[] = [
    { label: '法律', value: 'law' },
    { label: '行政法规', value: 'admin' },
    { label: '部门规章', value: 'rule' },
    { label: '地方法规', value: 'local' },
    { label: '规范性文件', value: 'normative' }
  ]

  // 5 维权重定义（含 tooltip 文案）
  const WEIGHT_FIELDS: { key: keyof StrategyWeights; label: string; tip: string }[] = [
    { key: 'keywordMatch', label: '关键词匹配', tip: '问题描述与法规条款关键词命中数量' },
    { key: 'tagMatch', label: '标签匹配', tip: '法规条款自带的业务标签是否命中输入提示标签' },
    { key: 'levelPriority', label: '法规层级', tip: '法律 > 行政法规 > 部门规章，配合基准分使用' },
    { key: 'recency', label: '颁布年份新旧', tip: '颁布年份越近得分越高' },
    { key: 'adoptionRate', label: '历史采纳率', tip: '该条款历史采纳次数 / 推荐次数' }
  ]

  // 标签候选（全局可选，用作领域覆盖策略与同义词所属领域的标签备选）
  const TAG_OPTIONS = ['财务', '采购', '医疗', '工程', '资产', '招投标']

  // 当前激活 Tab
  const activeTab = ref<'global' | 'override' | 'synonym' | 'level'>('global')

  // ===================== 全局策略 =====================
  // 当前编辑中的全局策略（同时作为试验台的输入参数，未保存也可试）
  const globalStrategy = reactive<StrategyConfig>({
    weights: {
      keywordMatch: 0.4,
      tagMatch: 0.25,
      levelPriority: 0.15,
      recency: 0.1,
      adoptionRate: 0.1
    },
    threshold: 0.5,
    topN: 5,
    regulationLevelFilter: ['law', 'admin', 'rule', 'local', 'normative'],
    tagFilter: [...TAG_OPTIONS],
    llmRerankEnabled: true
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
    // 归一化权重，避免后端再算一遍
    const normalized: StrategyWeights = {
      keywordMatch: globalStrategy.weights.keywordMatch / weightSum.value,
      tagMatch: globalStrategy.weights.tagMatch / weightSum.value,
      levelPriority: globalStrategy.weights.levelPriority / weightSum.value,
      recency: globalStrategy.weights.recency / weightSum.value,
      adoptionRate: globalStrategy.weights.adoptionRate / weightSum.value
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
      weights: {
        keywordMatch: 0.4,
        tagMatch: 0.25,
        levelPriority: 0.15,
        recency: 0.1,
        adoptionRate: 0.1
      },
      threshold: 0.5,
      topN: 5,
      regulationLevelFilter: ['law', 'admin', 'rule', 'local', 'normative'],
      tagFilter: [...TAG_OPTIONS],
      llmRerankEnabled: true
    })
    ElMessage.info('已重置为默认值，记得点保存')
  }

  // ===================== 领域覆盖策略 =====================
  const overrideList = ref<DomainOverride[]>([])
  const overrideLoading = ref(false)
  const overrideDrawerOpen = ref(false)
  const editingOverride = ref<DomainOverride | null>(null)

  // 法规层级中文映射，用于覆盖表格展示
  const LEVEL_LABEL: Record<RegulationLevel, string> = {
    law: '法律',
    admin: '行政法规',
    rule: '部门规章',
    local: '地方法规',
    normative: '规范性文件'
  }

  const loadOverrideList = async () => {
    overrideLoading.value = true
    try {
      const res = await getDomainOverrideList()
      overrideList.value = res.data || []
    } finally {
      overrideLoading.value = false
    }
  }

  const handleAddOverride = () => {
    editingOverride.value = null
    overrideDrawerOpen.value = true
  }

  const handleEditOverride = (row: DomainOverride) => {
    editingOverride.value = row
    overrideDrawerOpen.value = true
  }

  const handleDeleteOverride = async (row: DomainOverride) => {
    await ElMessageBox.confirm(`确定删除领域「${row.domain}」的覆盖策略？`, '删除确认', {
      type: 'warning'
    })
    const res = await deleteDomainOverride(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadOverrideList()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  }

  const handleToggleOverride = async (row: DomainOverride) => {
    const res = await toggleDomainOverride(row.id, row.enabled)
    if (res.code === 200) {
      ElMessage.success(res.message)
    } else {
      // 切换失败回滚状态
      row.enabled = !row.enabled
      ElMessage.error(res.message || '切换失败')
    }
  }

  // ===================== 同义词表 =====================
  const synonymList = ref<SynonymGroup[]>([])
  const synonymLoading = ref(false)
  const synonymKeyword = ref('')
  const synonymDomain = ref('')
  const synonymDialogOpen = ref(false)
  const editingSynonym = ref<SynonymGroup | null>(null)

  const loadSynonymList = async () => {
    synonymLoading.value = true
    try {
      const res = await getSynonymList({
        keyword: synonymKeyword.value || undefined,
        domain: synonymDomain.value || undefined
      })
      synonymList.value = res.data || []
    } finally {
      synonymLoading.value = false
    }
  }

  const handleAddSynonym = () => {
    editingSynonym.value = null
    synonymDialogOpen.value = true
  }

  const handleEditSynonym = (row: SynonymGroup) => {
    editingSynonym.value = row
    synonymDialogOpen.value = true
  }

  const handleDeleteSynonym = async (row: SynonymGroup) => {
    await ElMessageBox.confirm(`确定删除标准词「${row.canonical}」？`, '删除确认', {
      type: 'warning'
    })
    const res = await deleteSynonym(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadSynonymList()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  }

  // CSV 批量导入：仅做交互骨架，仅提示「已上传，待解析」
  const handleCsvUpload = (file: File) => {
    ElMessage.success(`已上传：${file.name}（待解析）`)
    // 阻止 el-upload 自动上传
    return false
  }

  // ===================== 法规层级基准分 =====================
  const levelBaseScore = reactive<LevelBaseScore>({
    law: 1.0,
    admin: 0.85,
    rule: 0.7,
    local: 0.6,
    normative: 0.5
  })
  const savingLevel = ref(false)

  const loadLevelBaseScore = async () => {
    const res = await getLevelBaseScore()
    if (res.code === 200 && res.data) Object.assign(levelBaseScore, res.data)
  }

  const handleSaveLevelScore = async () => {
    savingLevel.value = true
    try {
      const res = await updateLevelBaseScore({ ...levelBaseScore })
      if (res.code === 200) ElMessage.success('基准分已保存')
      else ElMessage.error(res.message || '保存失败')
    } finally {
      savingLevel.value = false
    }
  }

  const handleResetLevelScore = () => {
    Object.assign(levelBaseScore, {
      law: 1.0,
      admin: 0.85,
      rule: 0.7,
      local: 0.6,
      normative: 0.5
    })
    ElMessage.info('已重置为默认值，记得点保存')
  }

  // ===================== 推荐试验台 =====================
  const experimentOpen = ref(false)
  const handleOpenExperiment = () => {
    experimentOpen.value = true
  }

  // 初始化：加载所有数据
  onMounted(() => {
    loadGlobalStrategy()
    loadLevelBaseScore()
    loadOverrideList()
    loadSynonymList()
  })
</script>

<template>
  <div class="strategy-page">
    <!-- 页面头部：标题 + 推荐试验台按钮 -->
    <el-card class="header-card" shadow="never">
      <div class="header-content">
        <div class="header-left">
          <div class="page-title">法规推荐策略</div>
          <div class="page-desc">
            配置审计问题推荐法规依据时使用的打分权重、阈值、过滤条件与同义词表
          </div>
        </div>
        <el-button type="primary" @click="handleOpenExperiment">
          <el-icon><MagicStick /></el-icon>
          推荐试验台
        </el-button>
      </div>
    </el-card>

    <!-- 4 个 Tab 区块 -->
    <el-card class="tabs-card" shadow="never">
      <el-tabs v-model="activeTab">
        <!-- ============ Tab A：全局策略 ============ -->
        <el-tab-pane label="全局策略" name="global">
          <el-form label-width="160px" class="form-block">
            <!-- 5 维权重 -->
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
                    :class="{ 'ratio-warn': normalizedRatio(globalStrategy.weights[f.key]) > 50 }"
                  >
                    占 {{ normalizedRatio(globalStrategy.weights[f.key]).toFixed(1) }}%
                  </div>
                </div>
              </div>
            </el-form-item>

            <!-- 阈值 / Top N -->
            <el-divider content-position="left">召回控制</el-divider>
            <el-form-item label="相关度阈值">
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
            </el-form-item>

            <!-- 过滤条件 -->
            <el-divider content-position="left">过滤条件</el-divider>
            <el-form-item label="法规层级">
              <el-checkbox-group v-model="globalStrategy.regulationLevelFilter">
                <el-checkbox v-for="opt in LEVEL_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="参与标签">
              <el-select
                v-model="globalStrategy.tagFilter"
                multiple
                collapse-tags
                placeholder="留空表示不限制标签"
                style="width: 360px"
              >
                <el-option v-for="d in TAG_OPTIONS" :key="d" :label="d" :value="d" />
              </el-select>
            </el-form-item>

            <!-- LLM 二排 -->
            <el-form-item label="LLM 二排">
              <el-switch v-model="globalStrategy.llmRerankEnabled" />
              <span class="form-tip">对初步召回结果二次精排，提升准确率</span>
            </el-form-item>

            <!-- 操作按钮 -->
            <el-form-item>
              <el-button type="primary" :loading="savingGlobal" @click="handleSaveGlobal">
                保存全局策略
              </el-button>
              <el-button @click="handleResetGlobal">重置默认</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- ============ Tab B：领域覆盖策略 ============ -->
        <el-tab-pane label="领域覆盖策略" name="override">
          <div class="table-toolbar">
            <el-button type="primary" @click="handleAddOverride">
              <el-icon><Plus /></el-icon>
              新增覆盖策略
            </el-button>
            <span class="form-tip">未配置覆盖的领域将使用全局策略</span>
          </div>
          <el-table
            v-loading="overrideLoading"
            :data="overrideList"
            class="override-table"
            empty-text="暂无领域覆盖策略"
          >
            <el-table-column prop="domain" label="领域" min-width="100" />
            <el-table-column label="阈值" width="100">
              <template #default="{ row }">{{ row.threshold.toFixed(2) }}</template>
            </el-table-column>
            <el-table-column prop="topN" label="Top N" width="80" />
            <el-table-column label="允许层级" min-width="220">
              <template #default="{ row }">
                <el-tag
                  v-for="lv in row.regulationLevelFilter"
                  :key="lv"
                  size="small"
                  type="info"
                  class="level-tag"
                >
                  {{ LEVEL_LABEL[lv as RegulationLevel] }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="LLM 二排" width="100">
              <template #default="{ row }">
                <el-tag :type="row.llmRerankEnabled ? 'success' : 'info'" size="small">
                  {{ row.llmRerankEnabled ? '启用' : '关闭' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="启用状态" width="100">
              <template #default="{ row }">
                <el-switch v-model="row.enabled" @change="handleToggleOverride(row)" />
              </template>
            </el-table-column>
            <el-table-column prop="updatedAt" label="更新时间" width="170" />
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="handleEditOverride(row)">编辑</el-button>
                <el-button type="danger" link @click="handleDeleteOverride(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- ============ Tab C：同义词表 ============ -->
        <el-tab-pane label="同义词表" name="synonym">
          <!-- 筛选 + 操作 -->
          <div class="table-toolbar">
            <el-input
              v-model="synonymKeyword"
              placeholder="搜索标准词或同义词"
              clearable
              style="width: 240px"
              @keyup.enter="loadSynonymList"
              @clear="loadSynonymList"
            />
            <el-select
              v-model="synonymDomain"
              placeholder="按领域筛选"
              clearable
              style="width: 160px"
              @change="loadSynonymList"
            >
              <el-option v-for="d in TAG_OPTIONS" :key="d" :label="d" :value="d" />
            </el-select>
            <el-button @click="loadSynonymList">查询</el-button>
            <div class="toolbar-right">
              <!-- CSV 导入：仅交互骨架 -->
              <el-upload
                action="#"
                :show-file-list="false"
                accept=".csv"
                :before-upload="handleCsvUpload"
              >
                <el-button>
                  <el-icon><Upload /></el-icon>
                  CSV 批量导入
                </el-button>
              </el-upload>
              <el-button type="primary" @click="handleAddSynonym">
                <el-icon><Plus /></el-icon>
                新增同义词
              </el-button>
            </div>
          </div>
          <el-table v-loading="synonymLoading" :data="synonymList" empty-text="暂无同义词">
            <el-table-column prop="canonical" label="标准词" min-width="140" />
            <el-table-column label="同义词" min-width="320">
              <template #default="{ row }">
                <el-tag v-for="alias in row.aliases" :key="alias" size="small" class="alias-tag">
                  {{ alias }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="所属领域" width="120">
              <template #default="{ row }">
                <span v-if="row.domain">{{ row.domain }}</span>
                <el-tag v-else size="small" type="info">全局</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="updatedAt" label="更新时间" width="170" />
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="handleEditSynonym(row)">编辑</el-button>
                <el-button type="danger" link @click="handleDeleteSynonym(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- ============ Tab D：法规层级基准分 ============ -->
        <el-tab-pane label="法规层级基准分" name="level">
          <el-form label-width="160px" class="form-block">
            <el-form-item v-for="opt in LEVEL_OPTIONS" :key="opt.value" :label="opt.label">
              <div class="weight-row">
                <el-slider
                  v-model="levelBaseScore[opt.value]"
                  :min="0"
                  :max="1"
                  :step="0.05"
                  class="weight-slider"
                />
                <div class="weight-value">
                  <div class="raw">{{ levelBaseScore[opt.value].toFixed(2) }}</div>
                </div>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="savingLevel" @click="handleSaveLevelScore">
                保存基准分
              </el-button>
              <el-button @click="handleResetLevelScore">重置默认</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 推荐试验台抽屉 -->
    <ExperimentDrawer
      v-model:open="experimentOpen"
      :draft-strategy="globalStrategy"
      :level-base-score="levelBaseScore"
    />

    <!-- 领域覆盖编辑抽屉 -->
    <DomainOverrideDrawer
      v-model:open="overrideDrawerOpen"
      :editing="editingOverride"
      :global-tags="globalStrategy.tagFilter"
      @saved="loadOverrideList"
    />

    <!-- 同义词新增/编辑弹窗 -->
    <SynonymDialog
      v-model:open="synonymDialogOpen"
      :editing="editingSynonym"
      @saved="loadSynonymList"
    />
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
  .tabs-card {
    border-radius: 8px;
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

  .table-toolbar {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 16px;

    .toolbar-right {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-left: auto;
    }
  }

  .override-table .level-tag,
  .alias-tag {
    margin-right: 4px;
    margin-bottom: 4px;
  }
</style>
