<script setup lang="ts">
  // 引入法规面板：手动从知识中心法规库挑选法规引入到「定性依据」
  // 列表态（顶部蓝色搜索条 + 左 4 维度过滤树 + 右卡片列表）↔ 详情态（文件预览模式）
  import { ref, reactive, computed, watch, nextTick } from 'vue'
  import { useWindowSize } from '@vueuse/core'
  import { ElMessage } from 'element-plus'
  import {
    DArrowRight,
    Search,
    ArrowLeft,
    Document,
    Download,
    Star,
    StarFilled,
    CaretTop,
    CaretBottom
  } from '@element-plus/icons-vue'
  import { getRegulationList, getYearFacets, getRegulationDetail } from '@/api/knowledge-regulation'
  import type {
    KnowledgeRegulation,
    RegulationListQuery,
    RegulationLevel,
    EffectStatus,
    Hierarchy
  } from '@/types/knowledge-regulation'

  // 法规层级中文映射
  const LEVEL_LABEL: Record<RegulationLevel, string> = {
    law: '法律',
    admin: '行政法规',
    rule: '部门规章',
    local: '地方法规',
    normative: '规范性文件',
    internal: '内部规章制度'
  }

  // 时效性映射（卡片元信息使用）
  const STATUS_LABEL: Record<EffectStatus, string> = {
    active: '现行有效',
    repealed: '已废止',
    pending: '尚未实施'
  }

  // 效力位阶选项（一级分类）
  const HIERARCHY_OPTIONS: { value: Hierarchy; label: string }[] = [
    { value: 'external', label: '外部法律法规' },
    { value: 'internal', label: '内部规章制度' }
  ]

  // 类型选项（按位阶分组）
  const EXTERNAL_TYPE_OPTIONS: { value: RegulationLevel; label: string }[] = [
    { value: 'law', label: '法律' },
    { value: 'admin', label: '行政法规' },
    { value: 'rule', label: '部门规章' },
    { value: 'local', label: '地方法规' },
    { value: 'normative', label: '规范性文件' }
  ]
  const INTERNAL_TYPE_OPTIONS: { value: RegulationLevel; label: string }[] = [
    { value: 'internal', label: '内部规章制度' }
  ]

  // 时效性选项
  const STATUS_OPTIONS: { value: EffectStatus; label: string }[] = [
    { value: 'active', label: '现行有效' },
    { value: 'repealed', label: '废止或失效' },
    { value: 'pending', label: '尚未实施' }
  ]

  const props = defineProps<{
    open: boolean
  }>()

  const emit = defineEmits<{
    'update:open': [val: boolean]
    cite: [text: string]
  }>()

  const visible = computed({
    get: () => props.open,
    set: (v) => emit('update:open', v)
  })

  // 抽屉宽度 = 视口 - 720px
  const { width: winWidth } = useWindowSize()
  const drawerSize = computed(() => {
    const w = Math.max(360, winWidth.value - 720)
    return `${w}px`
  })

  // 列表态 / 详情态切换
  const viewMode = ref<'list' | 'detail'>('list')

  // ==================== 列表态 · 顶部搜索 ====================
  // 搜索范围：全文 / 法规名
  const searchScope = ref<'fulltext' | 'name'>('fulltext')
  const keyword = ref('')

  // ==================== 列表态 · 左侧 4 维度过滤 ====================
  // 4 个维度均允许"单选 + 取消选中"，对应一个值或 undefined
  const filterHierarchy = ref<Hierarchy | ''>('')
  const filterLevel = ref<RegulationLevel | ''>('')
  const filterStatus = ref<EffectStatus | ''>('')
  const filterYear = ref<number | ''>('')
  const yearFacets = ref<number[]>([])

  // 维度展开状态
  const expanded = reactive({
    hierarchy: true,
    level: true,
    status: true,
    year: true
  })

  // ==================== 列表态 · 排序 ====================
  // sortBy 与 sortOrder（点击列头切换：default → desc → asc → desc）
  const sortBy = ref<'promulgationDate' | 'effectiveDate'>('promulgationDate')
  const sortOrder = ref<'asc' | 'desc'>('desc')

  // ==================== 列表态 · 数据 ====================
  const regulationList = ref<KnowledgeRegulation[]>([])
  const total = ref(0)
  const listLoading = ref(false)
  const listQuery = reactive({ page: 1, pageSize: 50 })
  // 表格滚动位置（详情态返回时恢复）
  const listScrollTop = ref(0)
  const listScrollRef = ref<HTMLElement>()
  // 选中的法规 id（批量操作 + 全选）
  const selectedIds = ref<string[]>([])
  // 收藏的法规 id（前端内存）
  const favoriteIds = ref<Set<string>>(new Set())

  // ==================== 加载列表 ====================
  const loadList = async () => {
    listLoading.value = true
    try {
      const params: RegulationListQuery = {
        ...listQuery,
        keyword: keyword.value || undefined,
        searchScope: searchScope.value,
        hierarchy: filterHierarchy.value || undefined,
        level: filterLevel.value || undefined,
        status: filterStatus.value || undefined,
        year: filterYear.value || undefined,
        sortBy: sortBy.value,
        sortOrder: sortOrder.value
      }
      const res = await getRegulationList(params)
      regulationList.value = res.data?.list ?? []
      total.value = res.data?.total ?? 0
      // 选中状态需在新列表中保留
      selectedIds.value = selectedIds.value.filter((id) =>
        regulationList.value.some((r) => r.id === id)
      )
    } finally {
      listLoading.value = false
    }
  }

  // 加载年份 facet（按当前其他维度过滤）
  const loadYearFacets = async () => {
    const res = await getYearFacets({
      hierarchy: filterHierarchy.value || undefined,
      level: filterLevel.value || undefined,
      status: filterStatus.value || undefined
    })
    yearFacets.value = res.data ?? []
  }

  // 4 维度变化都会触发列表 + 年份重算
  const handleFilterChange = async () => {
    listQuery.page = 1
    selectedIds.value = []
    await Promise.all([loadList(), loadYearFacets()])
  }

  // 搜索
  const handleSearch = () => {
    listQuery.page = 1
    loadList()
  }

  // 排序点击：default desc → asc → desc 循环
  const handleSortClick = (field: 'promulgationDate' | 'effectiveDate') => {
    if (sortBy.value !== field) {
      sortBy.value = field
      sortOrder.value = 'desc'
    } else {
      sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
    }
    loadList()
  }

  // 全选切换
  const allSelected = computed(
    () =>
      regulationList.value.length > 0 && selectedIds.value.length === regulationList.value.length
  )
  const handleAllSelect = (val: boolean) => {
    selectedIds.value = val ? regulationList.value.map((r) => r.id) : []
  }

  // 单条收藏切换
  const toggleFavorite = (id: string) => {
    if (favoriteIds.value.has(id)) favoriteIds.value.delete(id)
    else favoriteIds.value.add(id)
  }

  // 单条下载（mock 仅提示）
  const handleDownload = (item: KnowledgeRegulation) => {
    ElMessage.success(`已下载《${item.name}》`)
  }

  // 批量下载/收藏（仅 toast）
  const handleBatchDownload = () => {
    if (!selectedIds.value.length) return
    ElMessage.success(`已批量下载 ${selectedIds.value.length} 条`)
  }
  const handleBatchFavorite = () => {
    if (!selectedIds.value.length) return
    selectedIds.value.forEach((id) => favoriteIds.value.add(id))
    ElMessage.success(`已批量收藏 ${selectedIds.value.length} 条`)
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

  // ==================== 详情态 · 文件预览模式 ====================
  const detailRegulation = ref<KnowledgeRegulation | null>(null)
  const detailLoading = ref(false)
  // 当前选中的条款索引（在 fullTextParagraphs 中的 idx）；默认选中首个"第 X 条"
  const selectedArticleIdx = ref<number>(-1)

  // 全文按空行切段，标记章节/条款类型
  const fullTextParagraphs = computed<
    { idx: number; text: string; type: 'chapter' | 'article' | 'normal' }[]
  >(() => {
    const text = detailRegulation.value?.fullText
    if (!text) return []
    return text
      .split(/\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
      .map((p, idx) => {
        let type: 'chapter' | 'article' | 'normal' = 'normal'
        if (/^第[一二三四五六七八九十百零\d]+章/.test(p)) type = 'chapter'
        else if (/^第[一二三四五六七八九十百零\d]+条/.test(p)) type = 'article'
        return { idx, text: p, type }
      })
  })

  // 进入详情或全文变化时：默认选中第一个"第 X 条"
  watch(fullTextParagraphs, (list) => {
    const firstArticle = list.find((p) => p.type === 'article')
    selectedArticleIdx.value = firstArticle?.idx ?? -1
  })

  // 点击条款 → 切换选中（同条再次点击不取消，保持始终有选中项）
  const handleArticleClick = (item: { idx: number; type: 'chapter' | 'article' | 'normal' }) => {
    if (item.type !== 'article') return
    selectedArticleIdx.value = item.idx
  }

  // 选中条款的内容（用于引用）
  const selectedArticleText = computed(() => {
    if (selectedArticleIdx.value < 0) return ''
    return fullTextParagraphs.value.find((p) => p.idx === selectedArticleIdx.value)?.text ?? ''
  })

  // 解析"第 X 条"标题与正文（同段内可能拼在一起）
  const parseArticle = (text: string) => {
    const m = text.match(
      /^(第[一二三四五六七八九十百零\d]+条(?:第[一二三四五六七八九十百零\d]+款)?)\s*(.*)$/s
    )
    if (m) return { articleNo: m[1], body: m[2].trim() }
    return { articleNo: '', body: text }
  }

  // 进入详情：点击法规名时触发
  const handleViewDetail = async (row: KnowledgeRegulation) => {
    if (listScrollRef.value) {
      listScrollTop.value = listScrollRef.value.scrollTop
    }
    detailLoading.value = true
    viewMode.value = 'detail'
    try {
      const res = await getRegulationDetail(row.id)
      detailRegulation.value = res.data ?? null
    } finally {
      detailLoading.value = false
    }
  }

  // 返回列表
  const handleBackToList = async () => {
    viewMode.value = 'list'
    detailRegulation.value = null
    await nextTick()
    if (listScrollRef.value) listScrollRef.value.scrollTop = listScrollTop.value
  }

  // 引入选中的条款：拼接《法规名》第 X 条：原文，emit 给父组件回填
  const handleCiteArticle = () => {
    if (!detailRegulation.value || selectedArticleIdx.value < 0) return
    const { articleNo, body } = parseArticle(selectedArticleText.value)
    const text = articleNo
      ? `《${detailRegulation.value.name}》${articleNo}：${body}`
      : `《${detailRegulation.value.name}》：${body}`
    emit('cite', text)
    ElMessage.success('已引用至定性依据')
  }

  // 关闭面板
  const handleClose = () => {
    visible.value = false
  }

  // ==================== 抽屉打开时初始化 ====================
  const inited = ref(false)
  watch(
    () => props.open,
    async (val) => {
      if (val && !inited.value) {
        inited.value = true
        await Promise.all([loadList(), loadYearFacets()])
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
    class="regulation-import-drawer"
  >
    <div class="ri-wrap">
      <!-- 顶部紫蓝色 header（保持系统视觉一致） -->
      <div class="ri-header">
        <div class="ri-header-left">
          <div class="ri-avatar">
            <el-icon :size="20"><Document /></el-icon>
          </div>
          <span class="ri-title">引入法规</span>
        </div>
        <el-tooltip content="收起" placement="bottom">
          <div class="ri-collapse-btn" @click="handleClose">
            <el-icon :size="18"><DArrowRight /></el-icon>
          </div>
        </el-tooltip>
      </div>

      <!-- 列表态 -->
      <div v-show="viewMode === 'list'" class="ri-body">
        <!-- 顶部蓝色搜索条 -->
        <div class="search-bar">
          <el-select v-model="searchScope" class="search-scope" @change="handleSearch">
            <el-option label="全文" value="fulltext" />
            <el-option label="法规名" value="name" />
          </el-select>
          <el-input
            v-model="keyword"
            placeholder="请输入法规名称"
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

        <div class="list-content">
          <!-- 左侧 4 维度过滤 -->
          <div class="filter-pane">
            <!-- 效力位阶 -->
            <div class="filter-group">
              <div class="filter-title" @click="expanded.hierarchy = !expanded.hierarchy">
                <el-icon class="title-arrow" :class="{ collapsed: !expanded.hierarchy }">
                  <CaretBottom />
                </el-icon>
                <span>效力位阶</span>
              </div>
              <div v-show="expanded.hierarchy" class="filter-options">
                <el-checkbox
                  v-for="opt in HIERARCHY_OPTIONS"
                  :key="opt.value"
                  :model-value="filterHierarchy === opt.value"
                  @change="
                    (val: any) => {
                      filterHierarchy = val ? opt.value : ''
                      // 切换位阶时清空类型筛选，避免无效组合
                      filterLevel = ''
                      handleFilterChange()
                    }
                  "
                >
                  {{ opt.label }}
                </el-checkbox>
              </div>
            </div>

            <!-- 类型（按位阶动态显示选项） -->
            <div class="filter-group">
              <div class="filter-title" @click="expanded.level = !expanded.level">
                <el-icon class="title-arrow" :class="{ collapsed: !expanded.level }">
                  <CaretBottom />
                </el-icon>
                <span>类型</span>
              </div>
              <div v-show="expanded.level" class="filter-options">
                <!-- 外部位阶 → 5 类外部类型；内部位阶 → 1 类；未选位阶 → 全部 -->
                <template v-if="filterHierarchy === 'internal'">
                  <el-checkbox
                    v-for="opt in INTERNAL_TYPE_OPTIONS"
                    :key="opt.value"
                    :model-value="filterLevel === opt.value"
                    @change="
                      (val: any) => {
                        filterLevel = val ? opt.value : ''
                        handleFilterChange()
                      }
                    "
                  >
                    {{ opt.label }}
                  </el-checkbox>
                </template>
                <template v-else>
                  <el-checkbox
                    v-for="opt in EXTERNAL_TYPE_OPTIONS"
                    :key="opt.value"
                    :model-value="filterLevel === opt.value"
                    @change="
                      (val: any) => {
                        filterLevel = val ? opt.value : ''
                        handleFilterChange()
                      }
                    "
                  >
                    {{ opt.label }}
                  </el-checkbox>
                  <el-checkbox
                    v-if="!filterHierarchy"
                    :model-value="filterLevel === 'internal'"
                    @change="
                      (val: any) => {
                        filterLevel = val ? 'internal' : ''
                        handleFilterChange()
                      }
                    "
                  >
                    内部规章制度
                  </el-checkbox>
                </template>
              </div>
            </div>

            <!-- 时效性 -->
            <div class="filter-group">
              <div class="filter-title" @click="expanded.status = !expanded.status">
                <el-icon class="title-arrow" :class="{ collapsed: !expanded.status }">
                  <CaretBottom />
                </el-icon>
                <span>时效性</span>
              </div>
              <div v-show="expanded.status" class="filter-options">
                <el-checkbox
                  v-for="opt in STATUS_OPTIONS"
                  :key="opt.value"
                  :model-value="filterStatus === opt.value"
                  @change="
                    (val: any) => {
                      filterStatus = val ? opt.value : ''
                      handleFilterChange()
                    }
                  "
                >
                  {{ opt.label }}
                </el-checkbox>
              </div>
            </div>

            <!-- 公布年份（来自 facet） -->
            <div class="filter-group">
              <div class="filter-title" @click="expanded.year = !expanded.year">
                <el-icon class="title-arrow" :class="{ collapsed: !expanded.year }">
                  <CaretBottom />
                </el-icon>
                <span>公布年份</span>
              </div>
              <div v-show="expanded.year" class="filter-options">
                <el-checkbox
                  v-for="y in yearFacets"
                  :key="y"
                  :model-value="filterYear === y"
                  @change="
                    (val: any) => {
                      filterYear = val ? y : ''
                      handleFilterChange()
                    }
                  "
                >
                  {{ y }}
                </el-checkbox>
                <span v-if="!yearFacets.length" class="empty-hint">无可用年份</span>
              </div>
            </div>
          </div>

          <!-- 右侧法规卡片列表 -->
          <div class="result-pane">
            <!-- 工具栏：全选 + 排序 + 批量操作 -->
            <div class="result-toolbar">
              <el-checkbox :model-value="allSelected" @change="(v: any) => handleAllSelect(!!v)">
                全选
              </el-checkbox>
              <span class="sort-label">排序：</span>
              <span
                class="sort-item"
                :class="{ active: sortBy === 'promulgationDate' }"
                @click="handleSortClick('promulgationDate')"
              >
                公布日期
                <span class="sort-arrows">
                  <el-icon
                    :class="{
                      active: sortBy === 'promulgationDate' && sortOrder === 'asc'
                    }"
                  >
                    <CaretTop />
                  </el-icon>
                  <el-icon
                    :class="{
                      active: sortBy === 'promulgationDate' && sortOrder === 'desc'
                    }"
                  >
                    <CaretBottom />
                  </el-icon>
                </span>
              </span>
              <span
                class="sort-item"
                :class="{ active: sortBy === 'effectiveDate' }"
                @click="handleSortClick('effectiveDate')"
              >
                施行日期
                <span class="sort-arrows">
                  <el-icon
                    :class="{
                      active: sortBy === 'effectiveDate' && sortOrder === 'asc'
                    }"
                  >
                    <CaretTop />
                  </el-icon>
                  <el-icon
                    :class="{
                      active: sortBy === 'effectiveDate' && sortOrder === 'desc'
                    }"
                  >
                    <CaretBottom />
                  </el-icon>
                </span>
              </span>
              <el-button size="small" :disabled="!selectedIds.length" @click="handleBatchDownload">
                <el-icon><Download /></el-icon>
                批量下载
              </el-button>
              <el-button size="small" :disabled="!selectedIds.length" @click="handleBatchFavorite">
                <el-icon><Star /></el-icon>
                批量收藏
              </el-button>
            </div>

            <!-- 卡片列表区 -->
            <div ref="listScrollRef" class="card-list" v-loading="listLoading">
              <el-empty v-if="!regulationList.length" description="未匹配到法规，请调整筛选条件" />
              <div
                v-for="item in regulationList"
                :key="item.id"
                class="reg-card"
                :class="{ selected: selectedIds.includes(item.id) }"
              >
                <!-- 卡片头部：复选框 + 法规名（可点击查看）+ 下载/收藏 -->
                <div class="card-head">
                  <el-checkbox
                    :model-value="selectedIds.includes(item.id)"
                    @change="
                      (val: any) => {
                        if (val) selectedIds.push(item.id)
                        else selectedIds = selectedIds.filter((i) => i !== item.id)
                      }
                    "
                  />
                  <a class="reg-name" @click="handleViewDetail(item)">
                    {{ item.name }}
                  </a>
                  <div class="card-actions">
                    <span class="action-btn" @click="handleDownload(item)">
                      <el-icon><Download /></el-icon>
                      下载
                    </span>
                    <span class="action-btn" @click="toggleFavorite(item.id)">
                      <el-icon>
                        <StarFilled v-if="favoriteIds.has(item.id)" />
                        <Star v-else />
                      </el-icon>
                      {{ favoriteIds.has(item.id) ? '已收藏' : '收藏' }}
                    </span>
                  </div>
                </div>
                <!-- 摘要 -->
                <div v-if="item.summary" class="card-summary">
                  <span class="summary-bullet">·</span>
                  {{ item.summary }}
                </div>
                <!-- 元信息行 -->
                <div class="card-meta">
                  <span class="meta-item">
                    {{ item.hierarchy === 'external' ? '外部法律法规' : '内部规章制度' }}
                  </span>
                  <span class="meta-divider">|</span>
                  <span class="meta-item">{{ LEVEL_LABEL[item.level] }}</span>
                  <span class="meta-divider">|</span>
                  <span class="meta-item">
                    {{ item.year }}
                    <template v-if="item.docNo">【{{ item.docNo }}】</template>
                  </span>
                  <span class="meta-divider">|</span>
                  <span class="meta-item">公布日期：{{ item.promulgationDate }}</span>
                  <span class="meta-divider">|</span>
                  <span class="meta-item">施行日期：{{ item.effectiveDate }}</span>
                  <span v-if="item.status !== 'active'" class="meta-status">
                    {{ STATUS_LABEL[item.status] }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 分页 -->
            <div class="pagination-wrap">
              <span class="total-text">共 {{ total }} 条数据</span>
              <el-pagination
                v-model:current-page="listQuery.page"
                v-model:page-size="listQuery.pageSize"
                :total="total"
                :page-sizes="[20, 50, 100]"
                layout="sizes, prev, pager, next, jumper"
                small
                @current-change="handlePageChange"
                @size-change="handleSizeChange"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 详情态：文件预览 -->
      <div v-show="viewMode === 'detail'" class="ri-body detail-body" v-loading="detailLoading">
        <div class="detail-header">
          <el-button text @click="handleBackToList">
            <el-icon><ArrowLeft /></el-icon>
            返回列表
          </el-button>
          <span v-if="detailRegulation" class="detail-title">
            《{{ detailRegulation.name }}》
          </span>
        </div>

        <div v-if="detailRegulation" class="detail-meta">
          <span>{{
            detailRegulation.hierarchy === 'external' ? '外部法律法规' : '内部规章制度'
          }}</span>
          <span class="meta-divider">|</span>
          <span>{{ LEVEL_LABEL[detailRegulation.level] }}</span>
          <span class="meta-divider">|</span>
          <span>颁布机关：{{ detailRegulation.promulgationOrg }}</span>
          <span class="meta-divider">|</span>
          <span>公布日期：{{ detailRegulation.promulgationDate }}</span>
          <span class="meta-divider">|</span>
          <span>施行日期：{{ detailRegulation.effectiveDate }}</span>
        </div>

        <!-- 文件预览区：直接渲染 fullText 内容（公文样式） -->
        <div class="file-preview">
          <el-empty v-if="!detailRegulation" description="该法规已不存在或被删除" />
          <div v-else class="preview-doc">
            <div class="doc-title">《{{ detailRegulation.name }}》</div>
            <div class="doc-org">
              {{ detailRegulation.promulgationOrg }} · {{ detailRegulation.promulgationDate }} 公布
            </div>

            <!-- 状态警示 -->
            <div v-if="detailRegulation.status === 'repealed'" class="doc-warn">
              ⚠ 该法规已废止{{
                detailRegulation.repealedDate
                  ? `（废止日期：${detailRegulation.repealedDate}）`
                  : ''
              }}，谨慎引用。
            </div>
            <div v-else-if="detailRegulation.status === 'pending'" class="doc-warn warn-pending">
              ⚠ 该法规尚未生效（生效日期：{{ detailRegulation.effectiveDate }}），引用前请确认。
            </div>

            <!-- 法规全文（按段落渲染：章节加粗居中、条款可点击选中） -->
            <div class="doc-fulltext">
              <p
                v-for="para in fullTextParagraphs"
                :key="para.idx"
                :class="{
                  'is-chapter': para.type === 'chapter',
                  'is-article': para.type === 'article',
                  'is-selected': para.type === 'article' && selectedArticleIdx === para.idx
                }"
                @click="handleArticleClick(para)"
              >
                {{ para.text }}
                <!-- 引用按钮：紧跟在选中条款文字末尾 -->
                <el-button
                  v-if="para.type === 'article' && selectedArticleIdx === para.idx"
                  class="cite-inline-btn"
                  type="primary"
                  size="small"
                  @click.stop="handleCiteArticle"
                >
                  引用此条款
                </el-button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<style lang="scss" scoped>
  .ri-wrap {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--el-bg-color-page);
  }

  /* 顶部紫蓝渐变 header */
  .ri-header {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    color: #fff;
    background: linear-gradient(135deg, #6b7afd 0%, #5469f0 100%);
  }

  .ri-header-left {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .ri-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: rgb(255 255 255 / 20%);
    border-radius: 50%;
  }

  .ri-title {
    font-size: 16px;
    font-weight: 600;
  }

  .ri-collapse-btn {
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

  /* body 通用 */
  .ri-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
  }

  /* ===== 顶部蓝色搜索条 ===== */
  .search-bar {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    align-items: center;
    padding: 24px 28px;
    background: linear-gradient(135deg, #d9e6ff 0%, #c1d4f9 100%);
  }

  .search-scope {
    flex-shrink: 0;
    width: 100px;
  }

  .search-scope :deep(.el-input__wrapper) {
    background: #fff;
  }

  .search-input {
    flex: 1;
  }

  .search-input :deep(.el-input__wrapper) {
    background: #fff;
  }

  /* ===== 列表内容（左过滤 + 右卡片） ===== */
  .list-content {
    display: flex;
    flex: 1;
    overflow: hidden;
    background: #fff;
  }

  /* 左侧过滤区 */
  .filter-pane {
    flex: 0 0 180px;
    padding: 12px 8px 12px 16px;
    overflow-y: auto;
    font-size: 13px;
    border-right: 1px solid var(--el-border-color-lighter);
  }

  .filter-group {
    margin-bottom: 10px;
  }

  .filter-title {
    display: flex;
    gap: 4px;
    align-items: center;
    padding: 6px 0;
    font-size: 13px;
    color: var(--el-text-color-primary);
    cursor: pointer;
    user-select: none;

    .title-arrow {
      color: var(--el-text-color-secondary);
      transition: transform 0.15s;

      &.collapsed {
        transform: rotate(-90deg);
      }
    }
  }

  .filter-options {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 4px 0 4px 18px;

    :deep(.el-checkbox) {
      height: 24px;
      margin-right: 0;

      .el-checkbox__label {
        font-size: 13px;
        color: var(--el-text-color-regular);
      }
    }
  }

  .empty-hint {
    padding-left: 4px;
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
    gap: 16px;
    align-items: center;
    padding: 10px 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .sort-label {
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }

    .sort-item {
      display: inline-flex;
      gap: 2px;
      align-items: center;
      font-size: 13px;
      color: var(--el-text-color-regular);
      cursor: pointer;
      user-select: none;

      &:hover {
        color: var(--el-color-primary);
      }

      &.active {
        color: var(--el-color-primary);
      }

      .sort-arrows {
        display: inline-flex;
        flex-direction: column;
        line-height: 0.6;

        .el-icon {
          font-size: 10px;
          color: var(--el-text-color-placeholder);

          &.active {
            color: var(--el-color-primary);
          }
        }
      }
    }
  }

  .card-list {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 8px;
    padding: 12px 16px;
    overflow-y: auto;
  }

  .reg-card {
    padding: 12px 14px;
    background: #fff;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 4px;
    transition: border-color 0.15s;

    &:hover {
      border-color: var(--el-color-primary-light-5);
    }

    &.selected {
      background: var(--el-color-primary-light-9);
      border-color: var(--el-color-primary-light-5);
    }
  }

  .card-head {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 6px;

    .reg-name {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);
      cursor: pointer;
      transition: color 0.15s;

      &:hover {
        color: var(--el-color-primary);
        text-decoration: underline;
      }
    }

    .card-actions {
      display: flex;
      gap: 12px;

      .action-btn {
        display: inline-flex;
        gap: 2px;
        align-items: center;
        font-size: 13px;
        color: var(--el-text-color-secondary);
        cursor: pointer;

        &:hover {
          color: var(--el-color-primary);
        }
      }
    }
  }

  .card-summary {
    padding: 8px 12px;
    margin: 6px 0;
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-regular);
    background: var(--el-fill-color-light);
    border-radius: 2px;

    .summary-bullet {
      margin-right: 4px;
      color: var(--el-color-primary);
    }
  }

  .card-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    font-size: 12px;
    color: var(--el-text-color-secondary);

    .meta-divider {
      color: var(--el-text-color-placeholder);
    }

    .meta-status {
      padding: 1px 6px;
      margin-left: 8px;
      font-size: 11px;
      color: var(--el-color-warning);
      background: var(--el-color-warning-light-9);
      border-radius: 2px;
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

  /* ===== 详情态 · 文件预览 ===== */
  .detail-body {
    background: #fff;
  }

  .detail-header {
    display: flex;
    flex-shrink: 0;
    gap: 12px;
    align-items: center;
    padding: 12px 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .detail-title {
      flex: 1;
      font-size: 15px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  .detail-meta {
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    padding: 10px 20px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color-light);

    .meta-divider {
      color: var(--el-text-color-placeholder);
    }
  }

  .file-preview {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
  }

  .preview-doc {
    max-width: 800px;
    padding: 32px 40px;
    margin: 0 auto;
    background: #fff;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 4px;

    .doc-title {
      margin-bottom: 8px;
      font-size: 22px;
      font-weight: 700;
      color: var(--el-text-color-primary);
      text-align: center;
    }

    .doc-org {
      padding-bottom: 16px;
      margin-bottom: 24px;
      font-size: 13px;
      color: var(--el-text-color-secondary);
      text-align: center;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    .doc-body {
      font-size: 14px;
      line-height: 1.9;
      color: var(--el-text-color-regular);

      p {
        margin: 0 0 12px;
      }

      .doc-highlight {
        padding: 12px 16px;
        background: var(--el-color-primary-light-9);
        border-left: 3px solid var(--el-color-primary);
        border-radius: 2px;
      }
    }

    /* 全文段落样式：章节加粗居中、条款可点击选中 */
    .doc-fulltext {
      font-size: 14px;
      line-height: 1.9;
      color: var(--el-text-color-primary);

      p {
        padding: 4px 8px;
        margin: 0 0 12px;
        text-align: justify;
        text-indent: 2em;
        border-radius: 4px;
        transition: background 0.15s;
      }

      .is-chapter {
        margin: 20px 0 12px;
        font-size: 16px;
        font-weight: 700;
        color: var(--el-text-color-primary);
        text-align: center;
        text-indent: 0;
        cursor: default;
      }

      .is-article {
        position: relative;
        text-indent: 2em;
        cursor: pointer;

        &:hover {
          background: var(--el-fill-color);
        }
      }

      /* 选中条款：左红色边 + 浅红底，与截图一致 */
      .is-selected {
        background: var(--el-color-danger-light-9);
        outline: 2px solid var(--el-color-danger-light-5);
        outline-offset: -2px;

        &:hover {
          background: var(--el-color-danger-light-9);
        }
      }

      /* 引用按钮：紧跟选中条款文字末尾，内联不换行、不缩进 */
      .cite-inline-btn {
        margin-left: 8px;
        text-indent: 0;
        vertical-align: baseline;
      }
    }

    .doc-warn {
      padding: 10px 14px;
      margin: 0 0 16px;
      font-size: 13px;
      color: var(--el-color-danger-dark-2);
      background: var(--el-color-danger-light-9);
      border-left: 3px solid var(--el-color-danger);
      border-radius: 2px;
    }

    .warn-pending {
      color: var(--el-color-warning-dark-2);
      background: var(--el-color-warning-light-9);
      border-left-color: var(--el-color-warning);
    }
  }
</style>
