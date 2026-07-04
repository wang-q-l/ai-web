<script setup lang="ts">
  // 从项目列表引入弹窗（大弹窗，2 步：选项目报告 → 预览 → 提交）
  // 第一步左项目树（年份→项目）+ 右报告附件表，第二步预览 + 分类决策；
  // 提交成功后关闭弹窗并 emit success，由列表页刷新 + 悬浮提示
  import { ref, computed, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Search } from '@element-plus/icons-vue'
  import {
    getCategoryTree,
    getAuditProjectTree,
    getProjectReports,
    checkImportDuplicate,
    importFromProjects
  } from '@/api/report-library'
  import type {
    ReportCategoryNode,
    AuditProjectNode,
    ProjectReportAttachment,
    ReportImportPreviewItem
  } from '@/types/report-library'

  // 弹窗开关（v-model）+ 引入成功事件
  const visible = defineModel<boolean>({ default: false })
  const emit = defineEmits<{ success: [summary: string] }>()

  // 查重标识键：文件名 + URL
  const dupKey = (a: { fileName: string; fileUrl: string }) => `${a.fileName}||${a.fileUrl}`

  // ==================== 步骤控制 ====================
  const step = ref<1 | 2>(1)

  // ==================== 分类树（用于自动分类决策） ====================
  const categoryTree = ref<ReportCategoryNode[]>([])
  const loadCategoryTree = async () => {
    const res = await getCategoryTree()
    categoryTree.value = res.data ?? []
  }

  // ==================== 第一步：项目树 + 报告附件表 ====================
  const projectTree = ref<AuditProjectNode[]>([])
  const projectKeyword = ref('')
  const attachments = ref<ProjectReportAttachment[]>([])
  const attachmentLoading = ref(false)
  const attachmentKeyword = ref('')
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

  // 已勾选的报告附件（跨项目累加，以 selectedIds 为源，按 attachments 全集查找行数据）
  const selectedMap = computed(() => {
    const map = new Map<string, ProjectReportAttachment>()
    // 遍历所有已加载附件，将 id 在 selectedIds 中的条目收录
    for (const a of attachments.value) {
      if (selectedIds.value.includes(a.id)) map.set(a.id, a)
    }
    return map
  })
  const selectedCount = computed(() => selectedIds.value.length)

  // 已存在于库中的报告标识键集合（跨项目累加）——已引入过的在第一步即不可选
  const existingKeys = ref<Set<string>>(new Set())

  // 行是否可勾选：已引入库中的不可选
  const isSelectable = (row: ProjectReportAttachment) => !existingKeys.value.has(dupKey(row))

  // 当前项目下过滤后的报告附件
  const filteredAttachments = computed(() => {
    let result = [...attachments.value]
    if (attachmentKeyword.value.trim()) {
      const kw = attachmentKeyword.value.toLowerCase()
      result = result.filter((a) => a.name.toLowerCase().includes(kw))
    }
    return result
  })

  // 已勾选的行ID（勾选列与序号列合并，自行管理选中态）
  const selectedIds = ref<(number | string)[]>([])

  // 全选态：当前页全部可选行全部勾选时为 true
  const allChecked = computed(
    () =>
      filteredAttachments.value.length > 0 &&
      filteredAttachments.value
        .filter((a) => isSelectable(a))
        .every((a) => selectedIds.value.includes(a.id))
  )
  // 半选态：部分勾选
  const isIndeterminate = computed(
    () =>
      selectedIds.value.length > 0 &&
      !filteredAttachments.value
        .filter((a) => isSelectable(a))
        .every((a) => selectedIds.value.includes(a.id))
  )

  // 表头全选/取消全选（仅操作当前视图中可选行）
  const handleCheckAll = (val: boolean | string | number) => {
    const selectableIds = filteredAttachments.value.filter((a) => isSelectable(a)).map((a) => a.id)
    if (val) {
      selectableIds.forEach((id) => {
        if (!selectedIds.value.includes(id)) selectedIds.value.push(id)
      })
    } else {
      selectedIds.value = selectedIds.value.filter((id) => !selectableIds.includes(id))
    }
  }

  // 单行勾选/取消
  const handleCheckRow = (id: number | string, val: boolean) => {
    if (val) {
      if (!selectedIds.value.includes(id)) selectedIds.value.push(id)
    } else {
      selectedIds.value = selectedIds.value.filter((item) => item !== id)
    }
  }

  // 已勾选的行加类名，使其序号列常驻显示勾选框
  const rowClassName = ({ row }: { row: ProjectReportAttachment }) => {
    return selectedIds.value.includes(row.id) ? 'row-checked' : ''
  }

  // 加载项目树
  const loadProjectTree = async () => {
    const res = await getAuditProjectTree()
    projectTree.value = res.data ?? []
  }

  // 切换项目 → 加载报告附件
  const handleProjectClick = async (node: AuditProjectNode) => {
    if (node.type !== 'project') return
    currentProjectId.value = node.id
    attachmentLoading.value = true
    try {
      const res = await getProjectReports(node.id)
      attachments.value = res.data ?? []
      // 查库去重：把已存在的报告（文件名+URL）标记为不可选
      const keys = attachments.value.map(dupKey)
      if (keys.length) {
        const dupRes = await checkImportDuplicate(keys)
        ;(dupRes.data?.duplicates ?? []).forEach((k) => existingKeys.value.add(k))
      }
    } finally {
      attachmentLoading.value = false
    }
  }

  // ==================== 第二步：引入预览 ====================
  const previewItems = ref<ReportImportPreviewItem[]>([])
  const overrideTargetId = ref<string>('')
  const useUnifiedTarget = ref(false)

  // 按项目类型名找到匹配的分类 id（递归在分类树中按 name 严格匹配）
  const findCategoryByName = (
    nodes: ReportCategoryNode[],
    name: string
  ): ReportCategoryNode | null => {
    for (const n of nodes) {
      if (n.name === name) return n
      if (n.children?.length) {
        const r = findCategoryByName(n.children, name)
        if (r) return r
      }
    }
    return null
  }

  // 「未分类」分类 id（约定 rcat-99，前端按 name 兜底查找）
  const unclassifiedId = computed(() => {
    const hit = findCategoryByName(categoryTree.value, '未分类')
    return hit?.id ?? 'rcat-99'
  })

  // 进入预览页：构建预览项
  const buildPreview = async () => {
    const selected = Array.from(selectedMap.value.values())
    if (!selected.length) return

    // 1) 去重：与库内 文件名+URL 严格相等
    const keys = selected.map(dupKey)
    const dupRes = await checkImportDuplicate(keys)
    const dupSet = new Set(dupRes.data?.duplicates ?? [])

    // 2) 本批互查：同 key 仅保留第一条
    const seen = new Set<string>()
    previewItems.value = selected.map((a, idx) => {
      const key = dupKey(a)
      let status: ReportImportPreviewItem['status'] = 'normal'
      let targetCategoryId: string | null = null

      if (dupSet.has(key) || seen.has(key)) {
        status = 'duplicate'
      } else {
        seen.add(key)
        // 自动按项目类型命中分类
        const cat = findCategoryByName(categoryTree.value, a.category)
        if (cat) {
          targetCategoryId = cat.id
        } else {
          status = 'unclassified'
          targetCategoryId = unclassifiedId.value
        }
      }

      return {
        tempId: `tmp-${idx}-${a.id}`,
        attachmentId: a.id,
        reportName: a.name,
        projectName: a.projectName,
        projectCategory: a.category,
        fileName: a.fileName,
        fileUrl: a.fileUrl,
        fileType: a.fileType,
        fileSize: a.fileSize,
        projectId: a.projectId,
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
  const handleItemTargetChange = (item: ReportImportPreviewItem, val: string) => {
    item.targetCategoryId = val
    if (item.status === 'unclassified' && val !== unclassifiedId.value) {
      item.status = 'normal'
    }
  }

  // ==================== 提交：成功后关闭弹窗，列表页悬浮提示 ====================
  const submitting = ref(false)

  const handleSubmit = async () => {
    submitting.value = true
    try {
      const res = await importFromProjects(previewItems.value)
      if (res.code === 200) {
        const r = res.data
        emit('success', `引入完成：成功新增 ${r?.success ?? 0} 份；跳过重复 ${r?.skipped ?? 0} 份`)
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
      ElMessage.warning('请勾选要引入的报告')
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
    selectedIds.value = []
    existingKeys.value = new Set()
    attachments.value = []
    currentProjectId.value = ''
    projectKeyword.value = ''
    attachmentKeyword.value = ''
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

  // 文件大小格式化
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }
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
          <span>从项目列表引入</span>
          <el-tag type="info" effect="plain" class="step-tag">步骤 {{ step }} / 2</el-tag>
        </div>
        <el-steps :active="step - 1" simple class="wizard-steps">
          <el-step title="选择报告" />
          <el-step title="引入预览" />
        </el-steps>
      </div>
    </template>

    <!-- 第一步：选报告 -->
    <div v-if="step === 1" class="page-body">
      <el-alert
        type="info"
        :closable="false"
        show-icon
        class="step-alert"
        title="跨项目勾选累计；已引入库中的报告不可勾选。可在项目树间切换继续勾选，已勾选数会保留。"
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

        <!-- 右侧报告附件表 -->
        <div class="right-panel">
          <div class="right-toolbar">
            <span class="cur-project-title">{{ currentProjectName || '请选择项目' }}</span>
            <div class="toolbar-actions">
              <el-input
                v-model="attachmentKeyword"
                placeholder="搜索报告名称"
                clearable
                :prefix-icon="Search"
                size="small"
                style="width: 200px"
              />
            </div>
          </div>
          <el-table
            v-loading="attachmentLoading"
            :data="filteredAttachments"
            empty-text="左侧选择项目后查看报告清单"
            row-key="id"
            class="attachment-table"
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
            <el-table-column prop="name" label="报告名称" min-width="240" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.name }}
                <el-tag
                  v-if="existingKeys.has(`${row.fileName}||${row.fileUrl}`)"
                  size="small"
                  type="info"
                  class="imported-tag"
                >
                  已引入
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="fileName" label="文件" min-width="200" show-overflow-tooltip />
            <el-table-column label="项目类型" width="120">
              <template #default="{ row }">
                <el-tag size="small" type="info">{{ row.category }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="大小" width="100">
              <template #default="{ row }">{{ formatSize(row.fileSize) }}</template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <!-- 第二步：预览 -->
    <div v-else class="page-body">
      <div class="override-row">
        <el-checkbox v-model="useUnifiedTarget"
          >统一指定目标分类（覆盖按项目类型自动分发）</el-checkbox
        >
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
        <el-table-column prop="reportName" label="报告名称" min-width="240" show-overflow-tooltip />
        <el-table-column
          prop="projectName"
          label="来源项目"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column label="项目类型" width="110">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.projectCategory }}</el-tag>
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
          已选 <strong>{{ selectedCount }}</strong> 份报告
        </span>
        <span v-else class="select-stat">
          将引入 <strong>{{ previewStat.normal + previewStat.unclassified }}</strong> 份
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

  .attachment-table {
    flex: 1;
  }

  /* 「已引入」标签：跟在报告名称后 */
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
</style>
