<script setup lang="ts">
  // 从问题清单引入弹窗（大弹窗，2 步：选问题 → 预览 → 提交）
  // 第一步左项目树（年份→项目）+ 右问题表，第二步预览 + 分类决策；
  // 提交成功后关闭弹窗并 emit success，由列表页刷新 + 悬浮提示
  import { ref, computed, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Search } from '@element-plus/icons-vue'
  import {
    getCategoryTree,
    getAuditProjectTree,
    getAuditProblems,
    checkImportDuplicate,
    importFromProblems
  } from '@/api/suggestion-library'
  import type {
    SuggestionCategoryNode,
    AuditProjectNode,
    AuditProblem,
    ImportPreviewItem
  } from '@/types/suggestion-library'

  // 弹窗开关（v-model）+ 引入成功事件
  const visible = defineModel<boolean>({ default: false })
  const emit = defineEmits<{ success: [summary: string] }>()

  // ==================== 步骤控制 ====================
  // 1: 选问题 / 2: 预览（提交后跳回列表，由列表悬浮提示）
  const step = ref<1 | 2>(1)

  // ==================== 分类树（用于自动分类决策） ====================
  const categoryTree = ref<SuggestionCategoryNode[]>([])
  const loadCategoryTree = async () => {
    const res = await getCategoryTree()
    categoryTree.value = res.data ?? []
  }

  // ==================== 第一步：项目树 + 问题表 ====================
  const projectTree = ref<AuditProjectNode[]>([])
  const projectKeyword = ref('')
  const problems = ref<AuditProblem[]>([])
  const problemLoading = ref(false)
  const onlyWithAdvice = ref(true)
  const problemKeyword = ref('')
  const currentProjectId = ref('')

  // 当前项目名（用于右侧标题）
  const currentProjectName = computed(() => {
    for (const year of projectTree.value) {
      for (const p of year.children ?? []) {
        if (p.id === currentProjectId.value) return p.name
      }
    }
    return ''
  })

  // 项目树过滤（年份不参与匹配，只匹配项目名）
  const filteredProjectTree = computed(() => {
    if (!projectKeyword.value.trim()) return projectTree.value
    const kw = projectKeyword.value.toLowerCase()
    return projectTree.value
      .map((year) => ({
        ...year,
        children: year.children?.filter((p) => p.name.toLowerCase().includes(kw)) ?? []
      }))
      .filter((year) => (year.children?.length ?? 0) > 0)
  })

  // 已勾选的问题（跨项目累加）
  const selectedMap = ref<Map<string, AuditProblem>>(new Map())
  const selectedCount = computed(() => selectedMap.value.size)

  // 已存在于库中的建议正文集合（跨项目累加）——已引入过的问题在第一步即不可选
  const existingContents = ref<Set<string>>(new Set())

  // 行是否可勾选：无审计建议或已引入库中的，均不可选
  const isSelectable = (row: AuditProblem) => {
    const advice = row.auditAdvice?.trim()
    if (!advice) return false
    return !existingContents.value.has(advice)
  }

  // 当前项目下过滤后的问题
  const filteredProblems = computed(() => {
    let result = [...problems.value]
    if (onlyWithAdvice.value) {
      result = result.filter((p) => p.auditAdvice?.trim())
    }
    if (problemKeyword.value.trim()) {
      const kw = problemKeyword.value.toLowerCase()
      result = result.filter(
        (p) => p.title.toLowerCase().includes(kw) || p.auditAdvice.toLowerCase().includes(kw)
      )
    }
    return result
  })

  const tableRef = ref()

  // 已勾选的行ID（勾选列与序号列合并，自行管理选中态）
  const selectedIds = ref<(number | string)[]>([])

  // 全选态：当前页全部可选行全部勾选时为 true
  const allChecked = computed(
    () =>
      filteredProblems.value.length > 0 &&
      filteredProblems.value.filter(isSelectable).every((p) => selectedIds.value.includes(p.id))
  )
  // 半选态：部分勾选
  const isIndeterminate = computed(
    () =>
      selectedIds.value.length > 0 &&
      !filteredProblems.value.filter(isSelectable).every((p) => selectedIds.value.includes(p.id))
  )

  // 表头全选/取消全选（仅操作可选行）
  const handleCheckAll = (val: boolean | string | number) => {
    const selectableIds = filteredProblems.value.filter(isSelectable).map((p) => p.id)
    if (val) {
      // 合并已选与当前页可选
      const merged = new Set([...selectedIds.value, ...selectableIds])
      selectedIds.value = Array.from(merged)
    } else {
      // 移除当前页可选行
      const selectableSet = new Set(selectableIds)
      selectedIds.value = selectedIds.value.filter((id) => !selectableSet.has(id))
    }
    // 同步 selectedMap
    syncSelectedMap()
  }

  // 单行勾选/取消，同步 selectedMap
  const handleCheckRow = (id: number | string, val: boolean) => {
    if (val) {
      if (!selectedIds.value.includes(id)) selectedIds.value.push(id)
    } else {
      selectedIds.value = selectedIds.value.filter((item) => item !== id)
    }
    syncSelectedMap()
  }

  // 已勾选的行加类名，使其序号列常驻显示勾选框
  const rowClassName = ({ row }: { row: AuditProblem }) => {
    return selectedIds.value.includes(row.id) ? 'row-checked' : ''
  }

  // 将 selectedIds 同步回 selectedMap（跨项目累加的关键）
  const syncSelectedMap = () => {
    // 先移除当前项目的所有 key
    for (const p of problems.value) {
      selectedMap.value.delete(p.id)
    }
    // 再把当前项目中被勾选的加回
    for (const p of problems.value) {
      if (selectedIds.value.includes(p.id)) {
        selectedMap.value.set(p.id, p)
      }
    }
  }

  // 加载项目树
  const loadProjectTree = async () => {
    const res = await getAuditProjectTree()
    projectTree.value = res.data ?? []
  }

  // 切换项目 → 加载问题
  const handleProjectClick = async (node: AuditProjectNode) => {
    if (node.type !== 'project') return
    currentProjectId.value = node.id
    problemLoading.value = true
    try {
      const res = await getAuditProblems(node.id)
      problems.value = res.data ?? []
      // 查库去重：把已存在的建议正文标记为不可选
      const contents = problems.value
        .map((p) => p.auditAdvice?.trim())
        .filter((c): c is string => !!c)
      if (contents.length) {
        const dupRes = await checkImportDuplicate(contents)
        ;(dupRes.data?.duplicates ?? []).forEach((c) => existingContents.value.add(c))
      }
    } finally {
      problemLoading.value = false
    }
    // 切换项目后，从 selectedMap 恢复当前页的 selectedIds
    selectedIds.value = problems.value.filter((p) => selectedMap.value.has(p.id)).map((p) => p.id)
  }

  // ==================== 第二步：引入预览 ====================
  const previewItems = ref<ImportPreviewItem[]>([])
  const overrideTargetId = ref<string>('')
  const useUnifiedTarget = ref(false)

  // 按问题类别名找到匹配的分类 id（递归在分类树中按 name 严格匹配）
  const findCategoryByName = (
    nodes: SuggestionCategoryNode[],
    name: string
  ): SuggestionCategoryNode | null => {
    for (const n of nodes) {
      if (n.name === name) return n
      if (n.children?.length) {
        const r = findCategoryByName(n.children, name)
        if (r) return r
      }
    }
    return null
  }

  // 「未分类」分类 id（约定 cat-99，前端按 name 兜底查找）
  const unclassifiedId = computed(() => {
    const hit = findCategoryByName(categoryTree.value, '未分类')
    return hit?.id ?? 'cat-99'
  })

  // 进入预览页：构建预览项
  const buildPreview = async () => {
    // 仅引入有审计建议的问题，跳过空内容项
    const selected = Array.from(selectedMap.value.values()).filter((s) => s.auditAdvice?.trim())
    if (!selected.length) return

    // 1) 去重：与库内 content 严格相等（trim 后）
    const contents = selected.map((s) => s.auditAdvice.trim())
    const dupRes = await checkImportDuplicate(contents)
    const dupSet = new Set(dupRes.data?.duplicates ?? [])

    // 2) 本批互查：同 content 仅保留第一条
    const seen = new Set<string>()
    previewItems.value = selected.map((s, idx) => {
      const trimmed = s.auditAdvice.trim()
      let status: ImportPreviewItem['status'] = 'normal'
      let targetCategoryId: string | null = null

      if (dupSet.has(trimmed) || seen.has(trimmed)) {
        status = 'duplicate'
      } else {
        seen.add(trimmed)
        // 自动按问题类别命中分类
        const cat = findCategoryByName(categoryTree.value, s.category)
        if (cat) {
          targetCategoryId = cat.id
        } else {
          status = 'unclassified'
          targetCategoryId = unclassifiedId.value
        }
      }

      return {
        tempId: `tmp-${idx}-${s.id}`,
        problemId: s.id,
        problemTitle: s.title,
        problemCategory: s.category,
        content: trimmed,
        status,
        targetCategoryId
      }
    })

    // 重置覆盖选项
    useUnifiedTarget.value = false
    overrideTargetId.value = ''
  }

  // 统计三类数量
  const previewStat = computed(() => {
    const stat = { normal: 0, unclassified: 0, duplicate: 0 }
    previewItems.value.forEach((i) => stat[i.status]++)
    return stat
  })

  // 「确认引入」按钮是否可点（至少有一条非重复）
  const canSubmit = computed(() => previewItems.value.some((i) => i.status !== 'duplicate'))

  // 切换「统一指定目标分类」：覆盖所有非重复项的 target
  watch([useUnifiedTarget, overrideTargetId], ([enabled, targetId]) => {
    if (!enabled || !targetId) return
    previewItems.value.forEach((item) => {
      if (item.status !== 'duplicate') {
        item.targetCategoryId = targetId
        if (item.status === 'unclassified') item.status = 'normal'
      }
    })
  })

  // 单条改目标分类
  const handleItemTargetChange = (item: ImportPreviewItem, val: string) => {
    item.targetCategoryId = val
    if (item.status === 'unclassified' && val !== unclassifiedId.value) {
      item.status = 'normal'
    }
  }

  // ==================== 提交：成功后跳回列表，列表页悬浮提示 ====================
  const submitting = ref(false)

  const handleSubmit = async () => {
    submitting.value = true
    try {
      const res = await importFromProblems(previewItems.value)
      if (res.code === 200) {
        const r = res.data
        // 引入完成：关闭弹窗，把汇总信息抛给列表页悬浮提示
        emit('success', `引入完成：成功新增 ${r?.success ?? 0} 条；跳过重复 ${r?.skipped ?? 0} 条`)
        visible.value = false
      } else {
        ElMessage.error(res.message || '引入失败')
      }
    } finally {
      submitting.value = false
    }
  }

  // ==================== 步骤切换 ====================
  const handleNext = async () => {
    if (selectedCount.value === 0) {
      ElMessage.warning('请勾选要引入的问题')
      return
    }
    // 检查是否所有勾选问题的建议都为空
    const hasAdvice = Array.from(selectedMap.value.values()).some((p) => p.auditAdvice?.trim())
    if (!hasAdvice) {
      ElMessage.warning('所选问题均无审计建议，无法引入')
      return
    }
    step.value = 2
    await buildPreview()
  }

  const handlePrev = () => {
    step.value = 1
  }

  const handleCancel = () => {
    visible.value = false
  }

  // 重置弹窗内部状态（每次打开都从第一步、空选择开始）
  const resetState = () => {
    step.value = 1
    selectedMap.value = new Map()
    selectedIds.value = []
    existingContents.value = new Set()
    problems.value = []
    currentProjectId.value = ''
    projectKeyword.value = ''
    problemKeyword.value = ''
    previewItems.value = []
    useUnifiedTarget.value = false
    overrideTargetId.value = ''
  }

  // 弹窗打开时：重置状态并加载分类树/项目树
  watch(visible, async (val) => {
    if (!val) return
    resetState()
    await loadCategoryTree()
    await loadProjectTree()
  })
</script>

<template>
  <el-dialog
    v-model="visible"
    width="90%"
    top="5vh"
    :close-on-click-modal="false"
    append-to-body
    destroy-on-close
    class="import-dialog"
  >
    <!-- 弹窗标题：标题 + 步骤标签 + 步骤条 -->
    <template #header>
      <div class="dialog-header">
        <div class="header-title">
          <span>从问题清单引入</span>
          <el-tag type="info" effect="plain" class="step-tag">步骤 {{ step }} / 2</el-tag>
        </div>
        <el-steps :active="step - 1" simple class="wizard-steps">
          <el-step title="选择问题" />
          <el-step title="引入预览" />
        </el-steps>
      </div>
    </template>

    <!-- 第一步：选问题 -->
    <div v-if="step === 1" class="page-body">
      <el-alert
        type="info"
        :closable="false"
        show-icon
        class="step-alert"
        title="跨项目勾选累计；默认过滤无审计建议的问题。可在项目树间切换继续勾选，已勾选数会保留。"
      />
      <div class="step1-layout">
        <!-- 左侧项目树 -->
        <div class="left-panel">
          <div class="left-header">
            <el-input
              v-model="projectKeyword"
              placeholder="搜索项目名"
              clearable
              :prefix-icon="Search"
              size="small"
            />
          </div>
          <el-scrollbar class="project-scroll">
            <el-tree
              :data="filteredProjectTree"
              node-key="id"
              :props="{ label: 'name', children: 'children' }"
              :default-expand-all="true"
              :expand-on-click-node="false"
              :highlight-current="true"
              :current-node-key="currentProjectId"
              @node-click="handleProjectClick"
            >
              <template #default="{ data }">
                <span :class="{ 'project-leaf': data.type === 'project' }">
                  {{ data.name }}
                </span>
              </template>
            </el-tree>
          </el-scrollbar>
        </div>

        <!-- 右侧问题表 -->
        <div class="right-panel">
          <div class="right-toolbar">
            <span class="cur-project-title">{{ currentProjectName || '请选择项目' }}</span>
            <div class="toolbar-actions">
              <el-input
                v-model="problemKeyword"
                placeholder="搜索建议关键词"
                clearable
                :prefix-icon="Search"
                size="small"
                style="width: 200px"
              />
              <el-checkbox v-model="onlyWithAdvice">仅显示有审计建议</el-checkbox>
            </div>
          </div>
          <el-table
            ref="tableRef"
            v-loading="problemLoading"
            :data="filteredProblems"
            empty-text="左侧选择项目后查看问题清单"
            row-key="id"
            class="problem-table"
            :row-class-name="rowClassName"
          >
            <!-- 勾选列与序号列合并：默认显示序号，行 hover 或已勾选时显示勾选框 -->
            <el-table-column label="序号" width="80" align="center">
              <template #header>
                <el-checkbox
                  :model-value="allChecked"
                  :indeterminate="isIndeterminate"
                  @change="handleCheckAll"
                />
              </template>
              <template #default="{ row, $index }">
                <div class="seq-cell">
                  <span class="seq-num">{{ $index + 1 }}</span>
                  <el-checkbox
                    class="seq-check"
                    :model-value="selectedIds.includes(row.id)"
                    :disabled="!isSelectable(row)"
                    @change="(val) => handleCheckRow(row.id, !!val)"
                  />
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="title" label="问题标题" min-width="180" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.title }}
                <el-tag
                  v-if="row.auditAdvice?.trim() && existingContents.has(row.auditAdvice.trim())"
                  size="small"
                  type="info"
                  class="imported-tag"
                >
                  已引入
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="auditAdvice"
              label="审计建议"
              min-width="320"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <span v-if="row.auditAdvice">{{ row.auditAdvice }}</span>
                <span v-else class="empty-advice">— 未填写</span>
              </template>
            </el-table-column>
            <el-table-column label="问题类别" width="120">
              <template #default="{ row }">
                <el-tag size="small" type="info">{{ row.category }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <!-- 第二步：预览 -->
    <div v-else class="page-body">
      <div class="override-row">
        <el-checkbox v-model="useUnifiedTarget">统一指定目标分类（覆盖按类别自动分发）</el-checkbox>
        <el-tree-select
          v-model="overrideTargetId"
          :data="categoryTree"
          :props="{ label: 'name', children: 'children' }"
          node-key="id"
          placeholder="请选择目标分类"
          check-strictly
          default-expand-all
          :disabled="!useUnifiedTarget"
          style="width: 320px; margin-left: 12px"
        />
      </div>

      <el-table :data="previewItems" class="preview-table">
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="content" label="建议内容" min-width="320" show-overflow-tooltip />
        <el-table-column
          prop="problemTitle"
          label="来源问题"
          min-width="160"
          show-overflow-tooltip
        />
        <el-table-column label="问题类别" width="120">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.problemCategory }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="目标分类" width="280">
          <template #default="{ row }">
            <span v-if="row.status === 'duplicate'" class="dup-text">— 跳过</span>
            <el-tree-select
              v-else
              :model-value="row.targetCategoryId"
              :data="categoryTree"
              :props="{ label: 'name', children: 'children' }"
              node-key="id"
              check-strictly
              default-expand-all
              size="small"
              style="width: 100%"
              @update:model-value="(val: string) => handleItemTargetChange(row, val)"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 底部操作栏 -->
    <template #footer>
      <div class="dialog-footer">
        <span v-if="step === 1" class="select-stat">
          已选 <strong>{{ selectedCount }}</strong> 条问题
        </span>
        <span v-else class="select-stat">
          将引入 <strong>{{ previewStat.normal + previewStat.unclassified }}</strong> 条
        </span>
        <div class="footer-actions">
          <template v-if="step === 1">
            <el-button @click="handleCancel">取消</el-button>
            <el-button type="primary" :disabled="selectedCount === 0" @click="handleNext">
              下一步
            </el-button>
          </template>
          <template v-else>
            <el-button @click="handlePrev">上一步</el-button>
            <el-button
              type="primary"
              :loading="submitting"
              :disabled="!canSubmit"
              @click="handleSubmit"
            >
              确认引入
            </el-button>
          </template>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
  /* 弹窗内容区高度固定，body 内部滚动 */
  .import-dialog {
    :deep(.el-dialog__body) {
      padding-top: 8px;
    }
  }

  .dialog-header {
    display: flex;
    gap: 24px;
    align-items: center;

    .header-title {
      display: flex;
      flex-shrink: 0;
      gap: 12px;
      align-items: center;
      font-size: 16px;
      font-weight: 600;
    }

    .step-tag {
      font-size: 12px;
    }

    .wizard-steps {
      flex: 1;
      max-width: 600px;
    }
  }

  .page-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 62vh;
    overflow: auto;
  }

  .step-alert {
    flex-shrink: 0;
  }

  /* 第一步布局 */
  .step1-layout {
    display: flex;
    flex: 1;
    gap: 12px;
    min-height: 0;
    overflow: hidden;
  }

  .left-panel {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    width: 280px;
    overflow: hidden;
    background: #fff;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
  }

  .left-header {
    flex-shrink: 0;
    padding: 10px 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .project-scroll {
    flex: 1;
    padding: 8px 4px;
  }

  .project-leaf {
    color: var(--el-text-color-primary);
  }

  .right-panel {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
    background: #fff;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
  }

  .right-toolbar {
    display: flex;
    flex-shrink: 0;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .cur-project-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .toolbar-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  }

  .problem-table {
    flex: 1;
  }

  .empty-advice {
    font-style: italic;
    color: var(--el-text-color-placeholder);
  }

  /* 「已引入」标签：跟在问题标题后 */
  .imported-tag {
    margin-left: 6px;
  }

  /* 第二步预览 */
  .override-row {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    padding: 10px 16px;
    background: #fff;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
  }

  .preview-table {
    flex: 1;
  }

  .dup-text {
    font-style: italic;
    color: var(--el-text-color-placeholder);
  }

  /* 勾选框 / 序号 合并单元格：默认显示序号，hover 行或已勾选时显示勾选框 */
  .seq-cell {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;

    .seq-num {
      color: #606266;
    }

    /* 勾选框默认覆盖在序号位置但隐藏 */
    .seq-check {
      position: absolute;
      display: none;
      height: auto;
    }
  }

  /* 行 hover 或已勾选：隐藏序号，显示勾选框 */
  :deep(.el-table__row:hover) .seq-cell,
  :deep(.el-table__row.row-checked) .seq-cell {
    .seq-num {
      display: none;
    }

    .seq-check {
      display: inline-flex;
    }
  }

  /* 底部操作栏 */
  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .select-stat {
      font-size: 13px;
      color: var(--el-text-color-regular);

      strong {
        margin: 0 4px;
        font-weight: 600;
        color: var(--el-color-primary);
      }
    }

    .footer-actions {
      display: flex;
      gap: 8px;
    }
  }
</style>
