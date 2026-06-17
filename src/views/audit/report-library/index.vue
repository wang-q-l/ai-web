<script setup lang="ts">
  // 报告库主页面：左侧分类树 + 右侧报告卡片列表
  // 顶部按钮：从项目引入 / 新增报告
  import { ref, reactive, computed, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    Plus,
    Edit,
    Delete,
    Document,
    FolderAdd,
    Search,
    Star,
    StarFilled,
    View,
    Files,
    Refresh
  } from '@element-plus/icons-vue'
  import {
    getCategoryTree,
    addCategory,
    updateCategory,
    deleteCategory,
    getReportList,
    deleteReport,
    batchDeleteReport,
    toggleFavorite
  } from '@/api/report-library'
  import type { ReportCategoryNode, Report, ReportListQuery } from '@/types/report-library'
  import ReportForm from './components/ReportForm.vue'
  import BatchMoveDialog from './components/BatchMoveDialog.vue'
  import ReportPreviewDialog from './components/ReportPreviewDialog.vue'
  import ImportFromProjectsDialog from './import.vue'
  import AnnotationPanel from '@/components/Annotation/AnnotationPanel.vue'
  import type { AnnotationItem } from '@/components/Annotation/types'

  // 从项目引入弹窗开关
  const importDialogVisible = ref(false)

  // 「全部报告」虚拟根节点 id
  const ALL_NODE_ID = '__all__'

  // 同步项目类型分类（mock 仅提示）
  const handleSyncCategory = () => {
    ElMessage.success('已同步项目类型数据')
  }

  // 列表排序说明批注（页面数据按创建时间倒序）
  const sortTipVisible = ref(false)
  const sortAnnotation: AnnotationItem = {
    id: 'report-sort-tip',
    type: 'position',
    selector: '',
    position: { x: 0, y: 0 },
    title: '报告排序说明',
    content: '页面数据按创建时间倒序。',
    category: 'rule',
    source: '',
    createdAt: '2026-06-15'
  }

  // ==================== 分类树 ====================
  const categoryTree = ref<ReportCategoryNode[]>([])
  const treeLoading = ref(false)
  // 当前选中节点 id；默认「全部报告」
  const currentCategoryId = ref<string>(ALL_NODE_ID)
  const treeRef = ref()

  // 加载分类树
  const loadCategoryTree = async () => {
    treeLoading.value = true
    try {
      const res = await getCategoryTree()
      categoryTree.value = res.data ?? []
    } finally {
      treeLoading.value = false
    }
  }

  // 全部报告数（树根 totalCount 之和）
  const allCount = computed(() =>
    categoryTree.value.reduce((sum, n) => sum + (n.totalCount ?? 0), 0)
  )

  // 节点点击 → 切换右侧筛选
  const handleNodeClick = (node: ReportCategoryNode) => {
    currentCategoryId.value = node.id
    listQuery.page = 1
    loadList()
  }

  // 点「全部报告」根
  const handleAllClick = () => {
    currentCategoryId.value = ALL_NODE_ID
    listQuery.page = 1
    loadList()
  }

  // 当前分类的全路径名（用于面包屑）
  const findCategoryPath = (
    nodes: ReportCategoryNode[],
    targetId: string,
    path: string[] = []
  ): string[] | null => {
    for (const n of nodes) {
      const cur = [...path, n.name]
      if (n.id === targetId) return cur
      if (n.children?.length) {
        const r = findCategoryPath(n.children, targetId, cur)
        if (r) return r
      }
    }
    return null
  }
  const currentCategoryPath = computed(() => {
    if (currentCategoryId.value === ALL_NODE_ID) return ['全部报告']
    return findCategoryPath(categoryTree.value, currentCategoryId.value) ?? ['全部报告']
  })

  // ==================== 分类操作 ====================

  // 新增分类（同级 / 子级）
  const handleAddCategory = async (parentId: string | null) => {
    try {
      const result = await ElMessageBox.prompt('请输入分类名称', '新增分类', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S+/,
        inputErrorMessage: '分类名不能为空'
      })
      const res = await addCategory({ name: result.value.trim(), parentId })
      if (res.code === 200) {
        ElMessage.success('新增成功')
        await loadCategoryTree()
      } else {
        ElMessage.error(res.message)
      }
    } catch {
      // 用户取消
    }
  }

  // 重命名分类
  const handleRenameCategory = async (node: ReportCategoryNode) => {
    try {
      const result = await ElMessageBox.prompt('修改分类名称', '重命名分类', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: node.name,
        inputPattern: /\S+/,
        inputErrorMessage: '分类名不能为空'
      })
      const res = await updateCategory(node.id, { name: result.value.trim() })
      if (res.code === 200) {
        ElMessage.success('重命名成功')
        await loadCategoryTree()
      } else {
        ElMessage.error(res.message)
      }
    } catch {
      // 用户取消
    }
  }

  // 删除分类（严格防护，详细提示由后端返回）
  const handleDeleteCategory = async (node: ReportCategoryNode) => {
    try {
      await ElMessageBox.confirm(`确定删除分类「${node.name}」？`, '删除确认', {
        type: 'warning'
      })
      const res = await deleteCategory(node.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        if (currentCategoryId.value === node.id) {
          currentCategoryId.value = ALL_NODE_ID
        }
        await loadCategoryTree()
        await loadList()
      } else {
        ElMessageBox.alert(res.message, '不允许删除', { type: 'error' })
      }
    } catch {
      // 用户取消
    }
  }

  // ==================== 报告列表 ====================
  const list = ref<Report[]>([])
  const listLoading = ref(false)
  const total = ref(0)
  const listQuery = reactive<ReportListQuery>({
    page: 1,
    pageSize: 10,
    keyword: '',
    sortBy: 'createdAt',
    onlyFavorite: false
  })

  // 加载列表
  const loadList = async () => {
    listLoading.value = true
    try {
      const res = await getReportList({
        ...listQuery,
        categoryId: currentCategoryId.value === ALL_NODE_ID ? undefined : currentCategoryId.value
      })
      list.value = res.data?.list ?? []
      total.value = res.data?.total ?? 0
    } finally {
      listLoading.value = false
    }
  }

  // 搜索
  const handleSearch = () => {
    listQuery.page = 1
    loadList()
  }

  // 排序 / 只看收藏切换
  const handleFilterChange = () => {
    listQuery.page = 1
    loadList()
  }

  // 分页
  const handlePageChange = (page: number) => {
    listQuery.page = page
    loadList()
  }
  const handleSizeChange = (size: number) => {
    listQuery.pageSize = size
    listQuery.page = 1
    loadList()
  }

  // 文件类型对应的标签颜色
  const fileTypeTag = (type: string): 'danger' | 'primary' | 'success' | 'info' => {
    if (type === 'pdf') return 'danger'
    if (type === 'doc' || type === 'docx') return 'primary'
    if (type === 'xls' || type === 'xlsx') return 'success'
    return 'info'
  }

  // ==================== 单条操作 ====================
  const formOpen = ref(false)
  const editingItem = ref<Report | null>(null)
  const handleAddReport = () => {
    editingItem.value = null
    formOpen.value = true
  }
  const handleEditReport = (row: Report) => {
    editingItem.value = row
    formOpen.value = true
  }
  const handleDeleteReport = async (row: Report) => {
    try {
      await ElMessageBox.confirm(`确定删除报告「${row.name}」？`, '删除确认', { type: 'warning' })
      const res = await deleteReport(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        await loadList()
        await loadCategoryTree()
      } else {
        ElMessage.error(res.message)
      }
    } catch {
      // 用户取消
    }
  }

  // 收藏切换
  const handleToggleFavorite = async (row: Report) => {
    const res = await toggleFavorite(row.id)
    if (res.code === 200) {
      row.isFavorite = res.data?.isFavorite ?? !row.isFavorite
      ElMessage.success(res.message)
      // 「只看收藏」状态下取消收藏需从列表移除
      if (listQuery.onlyFavorite && !row.isFavorite) {
        await loadList()
      }
    } else {
      ElMessage.error(res.message)
    }
  }

  // ==================== 预览 ====================
  const previewOpen = ref(false)
  const previewReport = ref<Report | null>(null)
  const handlePreview = (row: Report) => {
    previewReport.value = row
    previewOpen.value = true
  }

  // ==================== 批量移动 ====================
  const moveDialogOpen = ref(false)
  // 卡片多选（用 id 集合）
  const selectedIds = ref<string[]>([])
  const toggleSelect = (id: string) => {
    const idx = selectedIds.value.indexOf(id)
    if (idx === -1) selectedIds.value.push(id)
    else selectedIds.value.splice(idx, 1)
  }
  const handleBatchMove = () => {
    if (!selectedIds.value.length) return
    moveDialogOpen.value = true
  }

  // 批量删除选中报告
  const handleBatchDelete = async () => {
    if (!selectedIds.value.length) return
    try {
      await ElMessageBox.confirm(
        `确定删除选中的 ${selectedIds.value.length} 份报告？`,
        '批量删除确认',
        { type: 'warning' }
      )
      const res = await batchDeleteReport(selectedIds.value)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        selectedIds.value = []
        await loadList()
        await loadCategoryTree()
      } else {
        ElMessage.error(res.message)
      }
    } catch {
      // 用户取消
    }
  }
  const handleMoveSuccess = async () => {
    selectedIds.value = []
    await loadList()
    await loadCategoryTree()
  }

  // ==================== 顶部按钮 ====================
  const handleOpenImport = () => {
    importDialogVisible.value = true
  }

  // 引入成功：刷新列表 + 分类树，悬浮提示
  const handleImportSuccess = async (summary: string) => {
    await loadList()
    await loadCategoryTree()
    ElMessage.success(summary)
  }

  // 表单保存成功
  const handleFormSuccess = async () => {
    await loadList()
    await loadCategoryTree()
  }

  // ==================== 初始化 ====================
  onMounted(async () => {
    await loadCategoryTree()
    await loadList()
  })
</script>

<!-- PLACEHOLDER_TEMPLATE -->
<template>
  <div class="report-library-page">
    <!-- 顶部头部 + 操作按钮 -->
    <el-card class="header-card" shadow="never">
      <div class="header-content">
        <div class="header-left">
          <div class="page-title">报告库</div>
          <div class="page-desc">集中管理审计报告，支持分类组织、收藏、在线预览与从项目引入</div>
        </div>
        <div class="header-actions">
          <el-button @click="handleOpenImport">
            <el-icon><FolderAdd /></el-icon>
            从项目引入
          </el-button>
          <el-button type="primary" @click="handleAddReport">
            <el-icon><Plus /></el-icon>
            新增报告
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 主体：左树 + 右卡片列表 -->
    <div class="split-layout">
      <!-- 左侧分类树 -->
      <el-card class="left-card" shadow="never">
        <template #header>
          <div class="left-header">
            <span class="left-title">分类目录</span>
            <div class="left-header-actions">
              <el-tooltip content="同步项目类型数据" placement="top">
                <el-button text size="small" @click="handleSyncCategory">
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="新增一级分类" placement="top">
                <el-button text size="small" @click="handleAddCategory(null)">
                  <el-icon><Plus /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </div>
        </template>

        <!-- 「全部报告」虚拟根 -->
        <div
          class="all-node"
          :class="{ 'all-node-active': currentCategoryId === ALL_NODE_ID }"
          @click="handleAllClick"
        >
          <el-icon class="all-icon"><Files /></el-icon>
          <span class="all-label">全部报告</span>
          <span class="node-count">{{ allCount }}</span>
        </div>

        <!-- 分类树 -->
        <el-scrollbar class="tree-scroll">
          <el-tree
            ref="treeRef"
            v-loading="treeLoading"
            :data="categoryTree"
            node-key="id"
            :expand-on-click-node="false"
            :highlight-current="true"
            :current-node-key="currentCategoryId"
            class="cat-tree"
            @node-click="handleNodeClick"
          >
            <template #default="{ data }">
              <div class="tree-node">
                <span class="tree-label" :title="data.name">{{ data.name }}</span>
                <span class="node-count">{{ data.totalCount }}</span>
                <!-- hover 操作图标 -->
                <span class="node-actions" @click.stop>
                  <el-tooltip content="新增子分类" placement="top">
                    <el-icon class="node-icon" @click="handleAddCategory(data.id)">
                      <Plus />
                    </el-icon>
                  </el-tooltip>
                  <el-tooltip content="重命名" placement="top">
                    <el-icon class="node-icon" @click="handleRenameCategory(data)">
                      <Edit />
                    </el-icon>
                  </el-tooltip>
                  <el-tooltip
                    :content="data.preset ? '系统预置分类不可删除' : '删除分类'"
                    placement="top"
                  >
                    <el-icon
                      class="node-icon node-icon-danger"
                      :class="{ 'node-icon-disabled': data.preset }"
                      @click="!data.preset && handleDeleteCategory(data)"
                    >
                      <Delete />
                    </el-icon>
                  </el-tooltip>
                </span>
              </div>
            </template>
          </el-tree>
        </el-scrollbar>
      </el-card>

      <!-- 右侧报告卡片列表 -->
      <el-card class="right-card" shadow="never">
        <!-- 面包屑 + 工具栏 -->
        <div class="right-toolbar">
          <div class="breadcrumb">
            当前分类：
            <span class="crumb-path">{{ currentCategoryPath.join(' / ') }}</span>
            <span class="crumb-badge" @click.stop="sortTipVisible = !sortTipVisible"> 1 </span>
          </div>
          <div class="toolbar-actions">
            <el-input
              v-model="listQuery.keyword"
              placeholder="搜索报告名称"
              clearable
              :prefix-icon="Search"
              style="width: 220px"
              @keyup.enter="handleSearch"
              @clear="handleSearch"
            />
            <span class="fav-switch">
              <span class="fav-label">只看收藏</span>
              <el-switch v-model="listQuery.onlyFavorite" @change="handleFilterChange" />
            </span>
            <el-divider direction="vertical" />
            <el-button :disabled="!selectedIds.length" @click="handleBatchMove">
              批量移动分类
            </el-button>
            <el-button type="danger" :disabled="!selectedIds.length" @click="handleBatchDelete">
              批量删除
            </el-button>
          </div>
        </div>

        <!-- 报告卡片列表（一行一个卡片） -->
        <el-scrollbar v-loading="listLoading" class="card-scroll">
          <el-empty v-if="!list.length" description="暂无报告" />
          <div v-else class="card-list">
            <div
              v-for="item in list"
              :key="item.id"
              class="report-card"
              :class="{ 'report-card-selected': selectedIds.includes(item.id) }"
            >
              <!-- 多选框 -->
              <el-checkbox
                class="card-checkbox"
                :model-value="selectedIds.includes(item.id)"
                @change="toggleSelect(item.id)"
              />

              <!-- 文件图标 -->
              <div class="file-icon" :class="`file-icon-${fileTypeTag(item.fileType)}`">
                <el-icon><Document /></el-icon>
              </div>

              <!-- 中间主信息：报告名 + 元信息 -->
              <div class="card-main" @click="handlePreview(item)">
                <div class="report-name" :title="item.name">{{ item.name }}</div>
                <div class="card-meta">
                  <el-tag size="small" type="info">
                    {{
                      (findCategoryPath(categoryTree, item.categoryId) || ['未分类']).slice(-1)[0]
                    }}
                  </el-tag>
                  <span class="card-date">{{ item.createdAt }}</span>
                </div>
              </div>

              <!-- 收藏星标 -->
              <el-tooltip :content="item.isFavorite ? '取消收藏' : '收藏'" placement="top">
                <el-icon
                  class="fav-star"
                  :class="{ 'fav-star-active': item.isFavorite }"
                  @click="handleToggleFavorite(item)"
                >
                  <StarFilled v-if="item.isFavorite" />
                  <Star v-else />
                </el-icon>
              </el-tooltip>

              <!-- 右侧操作 -->
              <div class="card-actions">
                <el-button type="primary" link @click="handlePreview(item)">
                  <el-icon><View /></el-icon>预览
                </el-button>
                <el-button type="primary" link @click="handleEditReport(item)">
                  <el-icon><Edit /></el-icon>编辑
                </el-button>
                <el-button type="danger" link @click="handleDeleteReport(item)">
                  <el-icon><Delete /></el-icon>删除
                </el-button>
              </div>
            </div>
          </div>
        </el-scrollbar>

        <!-- 分页 -->
        <div class="pagination-wrap">
          <el-pagination
            v-model:current-page="listQuery.page"
            v-model:page-size="listQuery.pageSize"
            :total="total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 新增/编辑报告弹窗 -->
    <ReportForm
      v-model:open="formOpen"
      :editing="editingItem"
      :category-tree="categoryTree"
      :default-category-id="currentCategoryId === ALL_NODE_ID ? '' : currentCategoryId"
      @success="handleFormSuccess"
    />

    <!-- 批量移动分类弹窗 -->
    <BatchMoveDialog
      v-model:open="moveDialogOpen"
      :category-tree="categoryTree"
      :selected-ids="selectedIds"
      @success="handleMoveSuccess"
    />

    <!-- 在线预览弹窗 -->
    <ReportPreviewDialog v-model:open="previewOpen" :report="previewReport" />

    <!-- 从项目引入大弹窗 -->
    <ImportFromProjectsDialog v-model="importDialogVisible" @success="handleImportSuccess" />

    <!-- 排序说明批注面板 -->
    <Teleport to="body">
      <AnnotationPanel
        v-if="sortTipVisible"
        :annotation="sortAnnotation"
        :index="0"
        :edit-mode="false"
        @close="sortTipVisible = false"
      />
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
  .report-library-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
    padding: 16px;
    overflow: hidden;
  }

  .header-card {
    flex-shrink: 0;
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

  .header-actions {
    display: flex;
    gap: 8px;
  }

  .split-layout {
    display: flex;
    flex: 1;
    gap: 12px;
    overflow: hidden;
  }

  .left-card {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    width: 280px;
    border-radius: 8px;
  }

  .left-card :deep(.el-card__body) {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 0 8px 8px;
    overflow: hidden;
  }

  .left-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .left-title {
      font-size: 14px;
      font-weight: 600;
    }

    .left-header-actions {
      display: flex;
      gap: 2px;
      align-items: center;
    }
  }

  .all-node {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 8px 12px;
    margin: 4px 0 8px;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.15s;

    &:hover {
      background: var(--el-fill-color-light);
    }

    .all-icon {
      color: var(--el-color-primary);
    }

    .all-label {
      flex: 1;
      font-size: 13px;
      font-weight: 500;
    }
  }

  .all-node-active {
    background: var(--el-color-primary-light-9);

    .all-label {
      color: var(--el-color-primary);
    }
  }

  .tree-scroll {
    flex: 1;
  }

  .cat-tree {
    --el-tree-node-content-height: 32px;

    background: transparent;
  }

  .tree-node {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    padding-right: 6px;

    .tree-label {
      flex: 1;
      overflow: hidden;
      font-size: 13px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .node-actions {
      display: none;
      gap: 4px;
      align-items: center;
      margin-left: 6px;
    }

    &:hover .node-actions {
      display: inline-flex;
    }

    &:hover .node-count {
      display: none;
    }

    .node-icon {
      padding: 2px;
      font-size: 14px;
      color: var(--el-text-color-secondary);
      cursor: pointer;
      border-radius: 2px;

      &:hover {
        color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
      }
    }

    .node-icon-danger:hover {
      color: var(--el-color-danger);
      background: var(--el-color-danger-light-9);
    }

    /* 预置分类的删除图标置灰、禁用 */
    .node-icon-disabled {
      color: var(--el-text-color-disabled);
      cursor: not-allowed;

      &:hover {
        color: var(--el-text-color-disabled);
        background: transparent;
      }
    }
  }

  .node-count {
    min-width: 24px;
    padding: 0 6px;
    font-size: 12px;
    line-height: 18px;
    color: var(--el-text-color-secondary);
    text-align: center;
    background: var(--el-fill-color);
    border-radius: 8px;
  }

  /* PLACEHOLDER_STYLE_2 */
  .right-card {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
    border-radius: 8px;
  }

  .right-card :deep(.el-card__body) {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 16px 20px;
    overflow: hidden;
  }

  .right-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .breadcrumb {
    font-size: 13px;
    color: var(--el-text-color-secondary);

    .crumb-path {
      font-weight: 500;
      color: var(--el-text-color-primary);
    }

    /* 排序说明批注徽标 */
    .crumb-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      margin-left: 6px;
      font-size: 11px;
      font-weight: 600;
      line-height: 1;
      color: #fff;
      vertical-align: middle;
      cursor: pointer;
      user-select: none;
      background: #1677ff;
      border-radius: 50%;
    }
  }

  .toolbar-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .fav-switch {
    display: flex;
    gap: 6px;
    align-items: center;

    .fav-label {
      font-size: 13px;
      color: var(--el-text-color-regular);
    }
  }

  /* 卡片滚动区 */
  .card-scroll {
    flex: 1;
  }

  /* 卡片列表：一行一个卡片，纵向排列 */
  .card-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-bottom: 4px;
  }

  /* 单个卡片：横向布局（多选 + 图标 + 主信息 + 星标 + 操作） */
  .report-card {
    display: flex;
    gap: 14px;
    align-items: center;
    padding: 12px 16px;
    background: #fff;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    transition:
      box-shadow 0.15s,
      border-color 0.15s;

    &:hover {
      border-color: var(--el-color-primary-light-5);
      box-shadow: 0 2px 12px rgb(0 0 0 / 8%);
    }
  }

  .report-card-selected {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary);
  }

  .card-checkbox {
    flex-shrink: 0;
  }

  /* 文件图标 */
  .file-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    font-size: 24px;
    border-radius: 8px;
  }

  .file-icon-danger {
    color: var(--el-color-danger);
    background: var(--el-color-danger-light-9);
  }

  .file-icon-primary {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }

  .file-icon-success {
    color: var(--el-color-success);
    background: var(--el-color-success-light-9);
  }

  .file-icon-info {
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color);
  }

  /* 中间主信息：报告名 + 元信息行，占据剩余宽度 */
  .card-main {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
    cursor: pointer;

    .report-name {
      overflow: hidden;
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &:hover .report-name {
      color: var(--el-color-primary);
    }
  }

  .card-meta {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .card-date {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  /* 收藏星标 */
  .fav-star {
    flex-shrink: 0;
    font-size: 18px;
    color: var(--el-text-color-placeholder);
    cursor: pointer;
    transition: color 0.15s;

    &:hover {
      color: var(--el-color-warning);
    }
  }

  .fav-star-active {
    color: var(--el-color-warning);
  }

  /* 右侧操作 */
  .card-actions {
    display: flex;
    flex-shrink: 0;
    gap: 4px;

    .el-button {
      padding: 0 4px;
    }
  }

  .pagination-wrap {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
  }
</style>
