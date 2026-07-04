<script setup lang="ts">
  // 管理建议库主页面：左侧分类树 + 右侧建议列表
  // 顶部按钮：从问题清单引入 / 新增建议（导出按钮暂时隐藏）
  import { ref, reactive, computed, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    Plus,
    Edit,
    Delete,
    QuestionFilled,
    Document,
    FolderAdd,
    Search,
    Refresh
  } from '@element-plus/icons-vue'
  import {
    getCategoryTree,
    addCategory,
    updateCategory,
    deleteCategory,
    getSuggestionList,
    deleteSuggestion,
    batchDeleteSuggestion
  } from '@/api/suggestion-library'
  import type {
    SuggestionCategoryNode,
    Suggestion,
    SuggestionListQuery
  } from '@/types/suggestion-library'
  import SuggestionForm from './components/SuggestionForm.vue'
  import BatchMoveDialog from './components/BatchMoveDialog.vue'
  import ImportFromProblemsDialog from './import.vue'

  // 从问题清单引入弹窗开关
  const importDialogVisible = ref(false)

  // 「全部建议」虚拟根节点 id
  const ALL_NODE_ID = '__all__'

  // ==================== 分类树 ====================
  const categoryTree = ref<SuggestionCategoryNode[]>([])
  const treeLoading = ref(false)
  // 当前选中节点 id；默认「全部建议」
  const currentCategoryId = ref<string>(ALL_NODE_ID)
  // el-tree 实例
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

  // 全部建议数（树根 totalCount 之和）
  const allCount = computed(() =>
    categoryTree.value.reduce((sum, n) => sum + (n.totalCount ?? 0), 0)
  )

  // 节点点击 → 切换右侧筛选
  const handleNodeClick = (node: SuggestionCategoryNode) => {
    currentCategoryId.value = node.id
    listQuery.page = 1
    loadList()
  }

  // 点「全部建议」根
  const handleAllClick = () => {
    currentCategoryId.value = ALL_NODE_ID
    listQuery.page = 1
    loadList()
  }

  // 当前分类的全路径名（用于面包屑）
  const findCategoryPath = (
    nodes: SuggestionCategoryNode[],
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
    if (currentCategoryId.value === ALL_NODE_ID) return ['全部建议']
    return findCategoryPath(categoryTree.value, currentCategoryId.value) ?? ['全部建议']
  })

  // ==================== 分类操作 ====================

  // 同步问题分类目录：从问题模块拉取最新分类合并到建议库分类树（mock 仅提示）
  const handleSyncCategory = () => {
    ElMessage.success('已同步问题分类目录')
  }

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
  const handleRenameCategory = async (node: SuggestionCategoryNode) => {
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
  const handleDeleteCategory = async (node: SuggestionCategoryNode) => {
    try {
      await ElMessageBox.confirm(`确定删除分类「${node.name}」？`, '删除确认', {
        type: 'warning'
      })
      const res = await deleteCategory(node.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        // 若当前选中的是被删节点，回到「全部建议」
        if (currentCategoryId.value === node.id) {
          currentCategoryId.value = ALL_NODE_ID
        }
        await loadCategoryTree()
        await loadList()
      } else {
        // 业务防护错误，弹明确提示框
        ElMessageBox.alert(res.message, '不允许删除', { type: 'error' })
      }
    } catch {
      // 用户取消
    }
  }

  // ==================== 建议列表 ====================
  const list = ref<Suggestion[]>([])
  const listLoading = ref(false)
  const total = ref(0)
  // 已勾选的行ID（勾选列与序号列合并，自行管理选中态）
  const selectedIds = ref<(number | string)[]>([])
  // 批量操作仍使用 selectedRows，由 selectedIds 派生
  const selectedRows = computed(() =>
    list.value.filter((item) => selectedIds.value.includes(item.id))
  )
  // 全选态：当前页全部勾选时为 true
  const allChecked = computed(
    () => list.value.length > 0 && selectedIds.value.length === list.value.length
  )
  // 半选态：部分勾选
  const isIndeterminate = computed(
    () => selectedIds.value.length > 0 && selectedIds.value.length < list.value.length
  )
  // 表头全选/取消全选
  const handleCheckAll = (val: boolean | string | number) => {
    selectedIds.value = val ? list.value.map((item) => item.id) : []
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
  const rowClassName = ({ row }: { row: Suggestion }) => {
    return selectedIds.value.includes(row.id) ? 'row-checked' : ''
  }
  const listQuery = reactive<SuggestionListQuery>({
    page: 1,
    pageSize: 10,
    keyword: '',
    sortBy: 'updatedAt'
  })

  // 加载列表
  const loadList = async () => {
    listLoading.value = true
    try {
      const res = await getSuggestionList({
        ...listQuery,
        categoryId: currentCategoryId.value === ALL_NODE_ID ? undefined : currentCategoryId.value
      })
      list.value = res.data?.list ?? []
      total.value = res.data?.total ?? 0
      // 刷新数据时清空勾选
      selectedIds.value = []
    } finally {
      listLoading.value = false
    }
  }

  // 搜索
  const handleSearch = () => {
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

  // 引用量分档显示（0 / 1-9 / ≥10）
  const usageTagType = (n: number): 'info' | 'primary' | 'success' => {
    if (n === 0) return 'info'
    if (n < 10) return 'primary'
    return 'success'
  }

  // ==================== 单条操作 ====================
  const formOpen = ref(false)
  const editingItem = ref<Suggestion | null>(null)
  const handleAddSuggestion = () => {
    editingItem.value = null
    formOpen.value = true
  }
  const handleEditSuggestion = (row: Suggestion) => {
    editingItem.value = row
    formOpen.value = true
  }
  const handleDeleteSuggestion = async (row: Suggestion) => {
    try {
      await ElMessageBox.confirm('确定删除该建议？', '删除确认', { type: 'warning' })
      const res = await deleteSuggestion(row.id)
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

  // ==================== 批量操作 ====================
  const handleBatchDelete = async () => {
    if (!selectedRows.value.length) return
    try {
      await ElMessageBox.confirm(
        `确定删除选中的 ${selectedRows.value.length} 条建议？`,
        '批量删除确认',
        { type: 'warning' }
      )
      const ids = selectedRows.value.map((r) => r.id)
      const res = await batchDeleteSuggestion(ids)
      if (res.code === 200) {
        ElMessage.success(res.message)
        selectedIds.value = []
        await loadList()
        await loadCategoryTree()
      }
    } catch {
      // 用户取消
    }
  }
  const moveDialogOpen = ref(false)
  const handleBatchMove = () => {
    if (!selectedRows.value.length) return
    moveDialogOpen.value = true
  }
  const handleMoveSuccess = async () => {
    selectedIds.value = []
    await loadList()
    await loadCategoryTree()
  }

  // ==================== 顶部按钮 ====================
  // 打开「从问题清单引入」大弹窗
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

<template>
  <div class="suggestion-library-page">
    <!-- 顶部头部 + 操作按钮 -->
    <el-card class="header-card" shadow="never">
      <div class="header-content">
        <div class="header-left">
          <div class="page-title">管理建议库</div>
        </div>
        <div class="header-actions">
          <el-button @click="handleOpenImport">
            <el-icon><FolderAdd /></el-icon>
            从问题清单引入
          </el-button>
          <!-- Excel 导出按钮暂时隐藏，等需要时取消注释即可
          <el-button @click="handleExport">
            <el-icon><Download /></el-icon>
            Excel 导出
          </el-button>
          -->
          <el-button type="primary" @click="handleAddSuggestion">
            <el-icon><Plus /></el-icon>
            新增建议
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 主体：左树 + 右表 -->
    <div class="split-layout">
      <!-- 左侧分类树 -->
      <el-card class="left-card" shadow="never">
        <template #header>
          <div class="left-header">
            <span class="left-title">分类目录</span>
            <div class="left-header-actions">
              <el-tooltip content="同步问题分类目录" placement="top">
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

        <!-- 「全部建议」虚拟根 -->
        <div
          class="all-node"
          :class="{ 'all-node-active': currentCategoryId === ALL_NODE_ID }"
          @click="handleAllClick"
        >
          <el-icon class="all-icon"><Document /></el-icon>
          <span class="all-label">全部建议</span>
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
                  <el-tooltip content="该分类下有建议或子类时不允许删除" placement="top">
                    <el-icon class="node-icon node-icon-danger" @click="handleDeleteCategory(data)">
                      <Delete />
                    </el-icon>
                  </el-tooltip>
                </span>
              </div>
            </template>
          </el-tree>
        </el-scrollbar>
      </el-card>

      <!-- 右侧建议列表 -->
      <el-card class="right-card" shadow="never">
        <!-- 面包屑 + 工具栏 -->
        <div class="right-toolbar">
          <div class="breadcrumb">
            当前分类：
            <span class="crumb-path">{{ currentCategoryPath.join(' / ') }}</span>
          </div>
          <div class="toolbar-actions">
            <el-input
              v-model="listQuery.keyword"
              placeholder="搜索建议正文"
              clearable
              :prefix-icon="Search"
              style="width: 240px"
              @keyup.enter="handleSearch"
              @clear="handleSearch"
            />
            <el-divider direction="vertical" />
            <el-button :disabled="!selectedRows.length" @click="handleBatchMove">
              批量移动分类
            </el-button>
            <el-button
              :disabled="!selectedRows.length"
              type="danger"
              plain
              @click="handleBatchDelete"
            >
              批量删除
            </el-button>
          </div>
        </div>

        <!-- 建议表格 -->
        <el-table
          v-loading="listLoading"
          :data="list"
          empty-text="暂无建议"
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
                <span class="seq-num">{{
                  (listQuery.page - 1) * listQuery.pageSize + $index + 1
                }}</span>
                <el-checkbox
                  class="seq-check"
                  :model-value="selectedIds.includes(row.id)"
                  @change="(val) => handleCheckRow(row.id, !!val)"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="content" label="建议内容" min-width="380" show-overflow-tooltip />
          <el-table-column label="引用量" width="120">
            <template #header>
              <span>引用量</span>
              <el-tooltip content="业务实际选用建议时 +1，仅展示" placement="top">
                <el-icon class="header-tip"><QuestionFilled /></el-icon>
              </el-tooltip>
            </template>
            <template #default="{ row }">
              <el-tag :type="usageTagType(row.usageCount)" size="small">
                {{ row.usageCount }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="updatedAt" label="更新时间" width="170" />
          <el-table-column label="操作" width="140" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleEditSuggestion(row)">编辑</el-button>
              <el-button type="danger" link @click="handleDeleteSuggestion(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

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

    <!-- 新增/编辑建议弹窗 -->
    <SuggestionForm
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
      :selected-ids="selectedRows.map((r) => r.id)"
      @success="handleMoveSuccess"
    />

    <!-- 从问题清单引入大弹窗 -->
    <ImportFromProblemsDialog v-model="importDialogVisible" @success="handleImportSuccess" />
  </div>
</template>

<style lang="scss" scoped>
  .suggestion-library-page {
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
    padding: 10px 20px;
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
  }

  .toolbar-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .header-tip {
    margin-left: 4px;
    color: var(--el-text-color-placeholder);
    vertical-align: middle;
    cursor: help;
  }

  .pagination-wrap {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
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
