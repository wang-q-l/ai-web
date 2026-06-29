<script setup lang="ts">
  // 知识中心引用面板：左侧非模态抽屉，供问题维护时逐条引用管理建议库内容
  // 列表结构对齐 RegulationImportDrawer（顶部 header + 搜索条 + 左分类树 + 右卡片列表）
  // 引用时弹出目标字段选择，追加回填到问题表单，面板不关闭、可连续引用
  import { ref, reactive, computed, watch } from 'vue'
  import { useWindowSize } from '@vueuse/core'
  import { ElMessage } from 'element-plus'
  import {
    Collection,
    DArrowRight,
    Search,
    DocumentAdd,
    Aim,
    Star,
    StarFilled
  } from '@element-plus/icons-vue'
  import {
    getCategoryTree,
    getSuggestionList,
    incrementSuggestionUsage
  } from '@/api/suggestion-library'
  import {
    getProblemCategoryTree,
    getTypicalProblemList,
    toggleProblemFavorite
  } from '@/api/typical-problem'
  import type { SuggestionCategoryNode, Suggestion } from '@/types/suggestion-library'
  import type { ProblemCategoryNode, TypicalProblem } from '@/types/typical-problem'

  // 可回填的问题目标字段（与 ProblemDrawer 字段对应）
  type CiteTargetField = 'description' | 'qualitativeBasis' | 'auditAdvice'
  const TARGET_FIELDS: { value: CiteTargetField; label: string }[] = [
    { value: 'description', label: '问题表述' },
    { value: 'qualitativeBasis', label: '定性依据' },
    { value: 'auditAdvice', label: '审计建议' }
  ]

  const props = defineProps<{
    open: boolean
  }>()

  const emit = defineEmits<{
    'update:open': [val: boolean]
    // 引用一条内容：抛出文本与目标字段，由父组件追加回填
    cite: [payload: { text: string; targetField: CiteTargetField }]
  }>()

  // 抽屉显隐双向绑定
  const visible = computed({
    get: () => props.open,
    set: (v) => emit('update:open', v)
  })

  // 抽屉宽度 = 视口 - 720px（与问题抽屉并排，预留右侧表单空间）
  const { width: winWidth } = useWindowSize()
  const drawerSize = computed(() => `${Math.max(360, winWidth.value - 720)}px`)

  // ==================== 引用源切换 ====================
  // suggestion=管理建议库；problem=典型问题库
  const source = ref<'suggestion' | 'problem'>('suggestion')

  // 切换源：首次切到某源时懒加载其数据
  const handleSourceChange = (val: 'suggestion' | 'problem') => {
    if (source.value === val) return
    source.value = val
    if (val === 'problem' && !problemInited.value) {
      problemInited.value = true
      Promise.all([loadProblemTree(), loadProblemList()])
    }
  }

  // ==================== 分类树过滤 ====================
  const ALL_NODE_ID = '__all__'
  const categoryTree = ref<SuggestionCategoryNode[]>([])
  const treeLoading = ref(false)
  // 当前选中分类 id，默认「全部建议」
  const currentCategoryId = ref<string>(ALL_NODE_ID)
  // el-tree 默认属性
  const treeProps = { children: 'children', label: 'name' }

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

  // 扁平化分类 id→全路径名，用于卡片展示所属分类
  const categoryNameMap = computed(() => {
    const map: Record<string, string> = {}
    const walk = (nodes: SuggestionCategoryNode[], path: string[]) => {
      for (const n of nodes) {
        const cur = [...path, n.name]
        map[n.id] = cur.join(' / ')
        if (n.children?.length) walk(n.children, cur)
      }
    }
    walk(categoryTree.value, [])
    return map
  })

  // 点击分类节点 → 重置分页并加载
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

  // ==================== 搜索 + 排序 ====================
  const keyword = ref('')
  // 排序维度：updatedAt=最近更新 / usageCount=引用量
  const sortBy = ref<'updatedAt' | 'usageCount'>('updatedAt')

  // 搜索（回车或点按钮）
  const handleSearch = () => {
    listQuery.page = 1
    loadList()
  }

  // 排序切换
  const handleSortChange = () => {
    listQuery.page = 1
    loadList()
  }

  // ==================== 建议列表 ====================
  const suggestionList = ref<Suggestion[]>([])
  const total = ref(0)
  const listLoading = ref(false)
  const listQuery = reactive({ page: 1, pageSize: 20 })
  // 本次会话内已引用过的建议 id（用于卡片高亮）
  const citedIds = ref<Set<string>>(new Set())

  // 加载建议列表
  const loadList = async () => {
    listLoading.value = true
    try {
      const res = await getSuggestionList({
        categoryId: currentCategoryId.value === ALL_NODE_ID ? undefined : currentCategoryId.value,
        keyword: keyword.value || undefined,
        sortBy: sortBy.value,
        page: listQuery.page,
        pageSize: listQuery.pageSize
      })
      suggestionList.value = res.data?.list ?? []
      total.value = res.data?.total ?? 0
    } finally {
      listLoading.value = false
    }
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

  // 引用量分档徽标类型（0 / 1-9 / ≥10），与建议库列表页一致
  const usageTagType = (n: number): 'info' | 'primary' | 'success' => {
    if (n === 0) return 'info'
    if (n < 10) return 'primary'
    return 'success'
  }

  // ==================== 逐条引用 ====================
  // 当前打开 popover 的建议 id（同一时刻仅一个）
  const activeCiteId = ref<string>('')
  // popover 内选中的目标字段
  const selectedField = ref<CiteTargetField>('auditAdvice')

  // 打开某条建议的字段选择 popover：重置默认字段
  const handleOpenCite = (id: string) => {
    activeCiteId.value = id
    selectedField.value = 'auditAdvice'
  }

  // 确认引用：抛出文本与目标字段，引用量+1，面板保持打开
  const handleConfirmCite = async (item: Suggestion) => {
    const text = item.content.trim()
    // 空内容防护
    if (!text) {
      ElMessage.warning('该建议内容为空，无法引用')
      return
    }
    const fieldLabel = TARGET_FIELDS.find((f) => f.value === selectedField.value)?.label ?? ''
    emit('cite', { text, targetField: selectedField.value })
    citedIds.value.add(item.id)
    activeCiteId.value = ''
    ElMessage.success(`已引用至「${fieldLabel}」`)
    // 引用量自增：失败不阻断主流程，仅本地回滚显示
    try {
      const res = await incrementSuggestionUsage(item.id)
      if (res.code === 200 && res.data) {
        const target = suggestionList.value.find((s) => s.id === item.id)
        if (target) target.usageCount = res.data.usageCount
      }
    } catch {
      // 计数失败静默处理，不影响已完成的回填
    }
  }

  // 关闭面板
  const handleClose = () => {
    visible.value = false
  }

  // ==================== 典型问题库 ====================
  const problemInited = ref(false)
  // 问题分类树
  const problemTree = ref<ProblemCategoryNode[]>([])
  const problemTreeLoading = ref(false)
  const problemCategoryId = ref<string>(ALL_NODE_ID)
  const problemTreeProps = { children: 'children', label: 'name' }
  // 左侧分类树关键词过滤
  const treeFilterText = ref('')
  const problemTreeRef = ref()
  // 右侧表格：问题表述关键词 + 只看收藏
  const problemKeyword = ref('')
  const onlyFavorite = ref(false)
  // 问题列表
  const problemList = ref<TypicalProblem[]>([])
  const problemLoading = ref(false)
  const problemQuery = reactive({ page: 1, pageSize: 50 })
  const problemTotal = ref(0)
  // 本次会话内已引用过的问题 id（卡片高亮）
  const citedProblemIds = ref<Set<string>>(new Set())

  // 加载问题分类树
  const loadProblemTree = async () => {
    problemTreeLoading.value = true
    try {
      const res = await getProblemCategoryTree()
      problemTree.value = res.data ?? []
    } finally {
      problemTreeLoading.value = false
    }
  }

  // 全部问题数（树根 totalCount 之和）
  const problemAllCount = computed(() =>
    problemTree.value.reduce((sum, n) => sum + (n.totalCount ?? 0), 0)
  )

  // 加载问题列表
  const loadProblemList = async () => {
    problemLoading.value = true
    try {
      const res = await getTypicalProblemList({
        categoryId: problemCategoryId.value === ALL_NODE_ID ? undefined : problemCategoryId.value,
        keyword: problemKeyword.value || undefined,
        onlyFavorite: onlyFavorite.value,
        page: problemQuery.page,
        pageSize: problemQuery.pageSize
      })
      problemList.value = res.data?.list ?? []
      problemTotal.value = res.data?.total ?? 0
    } finally {
      problemLoading.value = false
    }
  }

  // 树关键词过滤
  watch(treeFilterText, (val) => {
    problemTreeRef.value?.filter(val)
  })
  const filterTreeNode = (value: string, data: any) => {
    if (!value) return true
    return (data as ProblemCategoryNode).name.includes(value)
  }

  // 点击问题分类节点
  const handleProblemNodeClick = (node: ProblemCategoryNode) => {
    problemCategoryId.value = node.id
    problemQuery.page = 1
    loadProblemList()
  }
  // 点「全部」
  const handleProblemAllClick = () => {
    problemCategoryId.value = ALL_NODE_ID
    problemQuery.page = 1
    loadProblemList()
  }

  // 问题表述搜索
  const handleProblemSearch = () => {
    problemQuery.page = 1
    loadProblemList()
  }
  // 只看收藏切换
  const handleFavoriteFilterChange = () => {
    problemQuery.page = 1
    loadProblemList()
  }
  // 分页
  const handleProblemPageChange = (page: number) => {
    problemQuery.page = page
    loadProblemList()
  }
  const handleProblemSizeChange = (size: number) => {
    problemQuery.pageSize = size
    problemQuery.page = 1
    loadProblemList()
  }

  // 切换收藏
  const handleToggleFavorite = async (row: TypicalProblem) => {
    const res = await toggleProblemFavorite(row.id)
    if (res.code === 200 && res.data) {
      row.favorited = res.data.favorited
      // 在「只看收藏」视图下取消收藏后，刷新列表移除该行
      if (onlyFavorite.value && !row.favorited) loadProblemList()
    }
  }

  // 问题引用：可引用的字段（部分内容为空则不展示）
  const activeProblemId = ref<string>('')
  // popover 内选中的待引用部分（problem 字段 → 目标表单字段）
  const PROBLEM_PARTS: {
    key: 'description' | 'qualitativeBasis' | 'advice'
    field: CiteTargetField
    label: string
  }[] = [
    { key: 'description', field: 'description', label: '问题表述 → 问题表述' },
    { key: 'qualitativeBasis', field: 'qualitativeBasis', label: '主要定性依据 → 定性依据' },
    { key: 'advice', field: 'auditAdvice', label: '处理意见或建议 → 审计建议' }
  ]
  const selectedParts = ref<string[]>(['description', 'qualitativeBasis', 'advice'])

  // 打开问题引用 popover：默认勾选全部有内容的部分
  const handleOpenProblemCite = (row: TypicalProblem) => {
    activeProblemId.value = row.id
    selectedParts.value = PROBLEM_PARTS.filter((p) => row[p.key]?.trim()).map((p) => p.key)
  }

  // 确认问题引用：按勾选的部分逐个回填到对应字段
  const handleConfirmProblemCite = (row: TypicalProblem) => {
    if (!selectedParts.value.length) {
      ElMessage.warning('请至少选择一项引用内容')
      return
    }
    let count = 0
    PROBLEM_PARTS.forEach((p) => {
      if (selectedParts.value.includes(p.key)) {
        const text = row[p.key]?.trim()
        if (text) {
          emit('cite', { text, targetField: p.field })
          count++
        }
      }
    })
    citedProblemIds.value.add(row.id)
    activeProblemId.value = ''
    if (count) ElMessage.success(`已引用 ${count} 项内容至对应字段`)
  }

  // ==================== 抽屉首次打开初始化 ====================
  const inited = ref(false)
  watch(
    () => props.open,
    async (val) => {
      if (val && !inited.value) {
        inited.value = true
        await Promise.all([loadCategoryTree(), loadList()])
      }
    },
    { immediate: true }
  )
</script>

<template>
  <el-drawer
    v-model="visible"
    :with-header="false"
    direction="ltr"
    :size="drawerSize"
    :modal="false"
    :close-on-click-modal="false"
    class="knowledge-cite-drawer"
  >
    <div class="kc-wrap">
      <!-- 顶部紫蓝渐变 header（与引入法规保持视觉一致） -->
      <div class="kc-header">
        <div class="kc-header-left">
          <div class="kc-avatar">
            <el-icon :size="20"><Collection /></el-icon>
          </div>
          <span class="kc-title">引用知识中心</span>
        </div>
        <el-tooltip content="收起" placement="bottom">
          <div class="kc-collapse-btn" @click="handleClose">
            <el-icon :size="18"><DArrowRight /></el-icon>
          </div>
        </el-tooltip>
      </div>

      <!-- 顶部蓝色渐变区：源切换 + 搜索条 -->
      <div class="kc-toolbar">
        <!-- 引用源切换：管理建议库 / 典型问题库 -->
        <div class="source-tabs">
          <div
            class="source-tab"
            :class="{ active: source === 'suggestion' }"
            @click="handleSourceChange('suggestion')"
          >
            管理建议库
          </div>
          <div
            class="source-tab"
            :class="{ active: source === 'problem' }"
            @click="handleSourceChange('problem')"
          >
            典型问题库
          </div>
        </div>
        <!-- 搜索条：管理建议库用 -->
        <div v-if="source === 'suggestion'" class="search-bar">
          <el-input
            v-model="keyword"
            placeholder="请输入建议关键词"
            clearable
            class="search-input"
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          />
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </div>
        <!-- 搜索条：典型问题库用（问题表述 + 只看我的收藏） -->
        <div v-else class="search-bar">
          <el-input
            v-model="problemKeyword"
            placeholder="请输入问题表述（表现形式）"
            clearable
            class="search-input"
            @keyup.enter="handleProblemSearch"
            @clear="handleProblemSearch"
          />
          <el-checkbox
            v-model="onlyFavorite"
            class="fav-checkbox"
            @change="handleFavoriteFilterChange"
          >
            只看我的收藏
          </el-checkbox>
          <el-button type="primary" @click="handleProblemSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </div>
      </div>

      <!-- 主体（管理建议库）：左分类树 + 右卡片列表 -->
      <div v-if="source === 'suggestion'" class="kc-body">
        <!-- 左侧分类树 -->
        <div class="tree-pane" v-loading="treeLoading">
          <div
            class="all-node"
            :class="{ active: currentCategoryId === ALL_NODE_ID }"
            @click="handleAllClick"
          >
            <span>全部建议</span>
            <span class="node-count">{{ allCount }}</span>
          </div>
          <el-tree
            :data="categoryTree"
            :props="treeProps"
            node-key="id"
            :highlight-current="true"
            :expand-on-click-node="false"
            @node-click="handleNodeClick"
          >
            <template #default="{ data }">
              <span class="tree-node">
                <span class="node-name">{{ data.name }}</span>
                <span class="node-count">{{ data.totalCount ?? 0 }}</span>
              </span>
            </template>
          </el-tree>
        </div>

        <!-- 右侧建议卡片列表 -->
        <div class="result-pane">
          <!-- 排序工具栏 -->
          <div class="result-toolbar">
            <span class="toolbar-label">排序：</span>
            <el-radio-group v-model="sortBy" size="small" @change="handleSortChange">
              <el-radio-button value="updatedAt">最近更新</el-radio-button>
              <el-radio-button value="usageCount">引用量</el-radio-button>
            </el-radio-group>
          </div>

          <!-- 卡片滚动区 -->
          <el-scrollbar class="card-scroll" v-loading="listLoading">
            <el-empty
              v-if="!suggestionList.length"
              :description="
                keyword || currentCategoryId !== ALL_NODE_ID
                  ? '未找到相关内容，请调整关键词或分类'
                  : '暂无建议内容'
              "
            />
            <div
              v-for="item in suggestionList"
              :key="item.id"
              class="sug-card"
              :class="{ cited: citedIds.has(item.id) }"
            >
              <!-- 建议正文 -->
              <div class="card-content">{{ item.content }}</div>
              <!-- 元信息行：分类 + 引用量 + 引用按钮 -->
              <div class="card-meta">
                <span class="meta-category">
                  {{ categoryNameMap[item.categoryId] || '未分类' }}
                </span>
                <span class="meta-right">
                  <span class="usage-badge" :class="usageTagType(item.usageCount)">
                    <el-icon><Aim /></el-icon>
                    {{ item.usageCount }} 次引用
                  </span>
                  <!-- 引用按钮 + 目标字段选择 popover（受控显隐，点击外部自动收起） -->
                  <el-popover
                    :visible="activeCiteId === item.id"
                    placement="top-end"
                    :width="240"
                    @hide="activeCiteId = ''"
                  >
                    <template #reference>
                      <el-button
                        type="primary"
                        size="small"
                        :icon="DocumentAdd"
                        @click="handleOpenCite(item.id)"
                      >
                        {{ citedIds.has(item.id) ? '再次引用' : '引用' }}
                      </el-button>
                    </template>
                    <div class="cite-popover">
                      <div class="popover-title">引用到字段</div>
                      <el-radio-group v-model="selectedField" class="field-group">
                        <el-radio v-for="f in TARGET_FIELDS" :key="f.value" :value="f.value">
                          {{ f.label }}
                        </el-radio>
                      </el-radio-group>
                      <div class="popover-footer">
                        <el-button size="small" @click="activeCiteId = ''">取消</el-button>
                        <el-button size="small" type="primary" @click="handleConfirmCite(item)">
                          确认引用
                        </el-button>
                      </div>
                    </div>
                  </el-popover>
                </span>
              </div>
            </div>
          </el-scrollbar>

          <!-- 分页 -->
          <div class="pagination-wrap">
            <span class="total-text">共 {{ total }} 条</span>
            <el-pagination
              v-model:current-page="listQuery.page"
              v-model:page-size="listQuery.pageSize"
              :total="total"
              :page-sizes="[20, 50, 100]"
              layout="sizes, prev, pager, next"
              small
              @current-change="handlePageChange"
              @size-change="handleSizeChange"
            />
          </div>
        </div>
      </div>

      <!-- 主体（典型问题库）：左关键词+分类树 + 右问题表格 -->
      <div v-else class="kc-body">
        <!-- 左侧：关键词过滤 + 分类树 -->
        <div class="tree-pane problem-tree-pane" v-loading="problemTreeLoading">
          <el-input
            v-model="treeFilterText"
            placeholder="请输入关键词"
            clearable
            size="small"
            class="tree-filter"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <div
            class="all-node"
            :class="{ active: problemCategoryId === ALL_NODE_ID }"
            @click="handleProblemAllClick"
          >
            <span>全部</span>
            <span class="node-count">{{ problemAllCount }}</span>
          </div>
          <el-tree
            ref="problemTreeRef"
            :data="problemTree"
            :props="problemTreeProps"
            node-key="id"
            :highlight-current="true"
            :expand-on-click-node="false"
            :default-expand-all="true"
            :filter-node-method="filterTreeNode"
            @node-click="handleProblemNodeClick"
          >
            <template #default="{ data }">
              <span class="tree-node">
                <span class="node-name">{{ data.name }}</span>
              </span>
            </template>
          </el-tree>
        </div>

        <!-- 右侧：问题表格 -->
        <div class="result-pane">
          <el-table
            :data="problemList"
            v-loading="problemLoading"
            height="100%"
            size="small"
            class="problem-table"
          >
            <el-table-column
              label="问题类别"
              prop="category"
              min-width="160"
              show-overflow-tooltip
            />
            <el-table-column
              label="问题表述（表现形式）"
              prop="description"
              min-width="240"
              show-overflow-tooltip
            />
            <el-table-column
              label="主要定性依据"
              prop="qualitativeBasis"
              min-width="240"
              show-overflow-tooltip
            />
            <el-table-column
              label="处理意见或建议"
              prop="advice"
              min-width="240"
              show-overflow-tooltip
            />
            <el-table-column label="操作" width="140" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleToggleFavorite(row)">
                  <el-icon>
                    <StarFilled v-if="row.favorited" />
                    <Star v-else />
                  </el-icon>
                </el-button>
                <el-popover
                  :visible="activeProblemId === row.id"
                  placement="left-end"
                  :width="280"
                  @hide="activeProblemId = ''"
                >
                  <template #reference>
                    <el-button
                      link
                      type="primary"
                      size="small"
                      :icon="DocumentAdd"
                      @click="handleOpenProblemCite(row)"
                    >
                      {{ citedProblemIds.has(row.id) ? '再次引用' : '引用' }}
                    </el-button>
                  </template>
                  <div class="cite-popover">
                    <div class="popover-title">选择引用内容</div>
                    <el-checkbox-group v-model="selectedParts" class="field-group">
                      <el-checkbox
                        v-for="p in PROBLEM_PARTS"
                        :key="p.key"
                        :value="p.key"
                        :disabled="!row[p.key]?.trim()"
                      >
                        {{ p.label }}
                      </el-checkbox>
                    </el-checkbox-group>
                    <div class="popover-footer">
                      <el-button size="small" @click="activeProblemId = ''">取消</el-button>
                      <el-button size="small" type="primary" @click="handleConfirmProblemCite(row)">
                        确认引用
                      </el-button>
                    </div>
                  </div>
                </el-popover>
              </template>
            </el-table-column>
            <template #empty>
              <el-empty description="暂无数据" />
            </template>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-wrap">
            <span class="total-text">共 {{ problemTotal }} 条数据</span>
            <el-pagination
              v-model:current-page="problemQuery.page"
              v-model:page-size="problemQuery.pageSize"
              :total="problemTotal"
              :page-sizes="[20, 50, 100]"
              layout="sizes, prev, pager, next, jumper"
              small
              @current-change="handleProblemPageChange"
              @size-change="handleProblemSizeChange"
            />
          </div>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<!-- PLACEHOLDER_STYLE -->

<style lang="scss" scoped>
  .kc-wrap {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--el-bg-color-page);
  }

  /* 顶部紫蓝渐变 header */
  .kc-header {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    color: #fff;
    background: linear-gradient(135deg, #6b7afd 0%, #5469f0 100%);
  }

  .kc-header-left {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .kc-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: rgb(255 255 255 / 20%);
    border-radius: 50%;
  }

  .kc-title {
    font-size: 16px;
    font-weight: 600;
  }

  .kc-collapse-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    color: #fff;
    cursor: pointer;
    background: rgb(255 255 255 / 20%);
    border-radius: 50%;
    transition:
      background 0.2s,
      transform 0.2s;

    &:hover {
      background: rgb(255 255 255 / 35%);
      transform: translateX(2px);
    }
  }

  /* 顶部蓝色渐变区：源切换 + 搜索条 */
  .kc-toolbar {
    flex-shrink: 0;
    background: linear-gradient(135deg, #d9e6ff 0%, #c1d4f9 100%);
  }

  .source-tabs {
    display: flex;
    gap: 8px;
    padding: 16px 28px 0;
  }

  .source-tab {
    position: relative;
    padding: 6px 16px;
    font-size: 14px;
    color: var(--el-text-color-regular);
    cursor: pointer;
    background: rgb(255 255 255 / 60%);
    border-radius: 6px 6px 0 0;
    transition: all 0.15s;

    &.active {
      font-weight: 600;
      color: var(--el-color-primary);
      background: #fff;
    }

    /* 典型问题库预留：置灰不可用 */
    &.is-disabled {
      color: var(--el-text-color-placeholder);
      cursor: not-allowed;
    }
  }

  /* 「即将开放」小标签 */
  .soon-tag {
    padding: 0 4px;
    margin-left: 4px;
    font-size: 10px;
    color: var(--el-color-warning);
    background: var(--el-color-warning-light-9);
    border-radius: 2px;
  }

  .search-bar {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 12px 28px 24px;
  }

  .search-input {
    flex: 1;
  }

  .search-input :deep(.el-input__wrapper) {
    background: #fff;
  }

  /* 只看我的收藏：白底胶囊，与搜索框同色系 */
  .fav-checkbox {
    flex-shrink: 0;
    height: 32px;
    padding: 0 10px;
    white-space: nowrap;
    background: #fff;
    border-radius: 4px;
  }

  /* PLACEHOLDER_STYLE_2 */

  /* ===== 主体：左树 + 右列表 ===== */
  .kc-body {
    display: flex;
    flex: 1;
    overflow: hidden;
    background: #fff;
  }

  /* 左侧分类树 */
  .tree-pane {
    flex: 0 0 200px;
    padding: 12px 8px;
    overflow-y: auto;
    border-right: 1px solid var(--el-border-color-lighter);
  }

  .all-node {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 12px;
    margin-bottom: 4px;
    font-size: 13px;
    color: var(--el-text-color-primary);
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.15s;

    &:hover {
      background: var(--el-fill-color-light);
    }

    /* 选中态：浅主色底 */
    &.active {
      font-weight: 600;
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }
  }

  .tree-node {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: space-between;
    padding-right: 8px;
    font-size: 13px;
  }

  /* 分类计数：灰色小数字 */
  .node-count {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }

  /* 右侧结果区 */
  .result-pane {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
  }

  .result-toolbar {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    align-items: center;
    padding: 10px 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .toolbar-label {
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }
  }

  .card-scroll {
    flex: 1;
  }

  .card-scroll :deep(.el-scrollbar__view) {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 16px;
  }

  /* 建议卡片 */
  .sug-card {
    padding: 12px 14px;
    background: #fff;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 4px;
    transition: border-color 0.15s;

    &:hover {
      border-color: var(--el-color-primary-light-5);
    }

    /* 本次已引用：浅主色底标记 */
    &.cited {
      background: var(--el-color-primary-light-9);
      border-color: var(--el-color-primary-light-5);
    }
  }

  .card-content {
    margin-bottom: 10px;
    font-size: 14px;
    line-height: 1.6;
    color: var(--el-text-color-primary);
    white-space: pre-wrap;
  }

  .card-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .meta-category {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    .meta-right {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  }

  /* 引用量徽标：内联胶囊，按分档着色 */
  .usage-badge {
    display: inline-flex;
    gap: 2px;
    align-items: center;
    padding: 1px 8px;
    font-size: 11px;
    border-radius: 10px;

    .el-icon {
      font-size: 12px;
    }

    &.info {
      color: var(--el-text-color-secondary);
      background: var(--el-fill-color);
    }

    &.primary {
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }

    &.success {
      color: var(--el-color-success);
      background: var(--el-color-success-light-9);
    }
  }

  /* 引用字段选择 popover */
  .cite-popover {
    .popover-title {
      margin-bottom: 10px;
      font-size: 13px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 12px;
    }

    .popover-footer {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
  }

  /* 分页 */
  .pagination-wrap {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    border-top: 1px solid var(--el-border-color-lighter);

    .total-text {
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }
  }

  /* ===== 典型问题库：左树关键词过滤 + 右表格 ===== */
  .problem-tree-pane {
    display: flex;
    flex-direction: column;

    .tree-filter {
      flex-shrink: 0;
      margin-bottom: 10px;
    }
  }

  /* 表格撑满结果区，自带滚动 */
  .problem-table {
    flex: 1;
  }
</style>
