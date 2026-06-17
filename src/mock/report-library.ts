/**
 * 报告库 Mock 数据
 * 接口：
 * - GET    /api/report-category/tree              分类树（含每节点直接 count）
 * - POST   /api/report-category                   新增分类
 * - PUT    /api/report-category/{id}              更新分类
 * - DELETE /api/report-category/{id}              删除分类（防护检查）
 * - GET    /api/report/list                       报告分页列表
 * - POST   /api/report                            新增报告
 * - PUT    /api/report/{id}                        编辑报告
 * - DELETE /api/report/{id}                        删除报告
 * - POST   /api/report/{id}/favorite              切换收藏
 * - GET    /api/audit-project/tree                项目树（年份→项目）
 * - GET    /api/audit-project/{id}/reports        项目下报告附件清单
 * - POST   /api/report/check-duplicate            引入查重（文件名+URL）
 * - POST   /api/report/import-from-projects       批量引入
 */

import type {
  ReportCategory,
  ReportCategoryNode,
  Report,
  ReportListQuery,
  AuditProjectNode,
  ProjectReportAttachment,
  ReportImportPreviewItem,
  ImportResult
} from '@/types/report-library'

// 模拟接口延迟
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

// 当前时间字符串
const now = () => new Date().toLocaleString('zh-CN', { hour12: false })

// id 自增工具
let categorySeq = 100
const nextCategoryId = () => `rcat-${++categorySeq}`
let reportSeq = 1000
const nextReportId = () => `rpt-${++reportSeq}`

// ==================== 分类数据 ====================
// 模块级变量持久化，页面切换不丢失
// 预置 5 个项目类型分类 + 未分类兜底（preset=true 不可删）
const categories: ReportCategory[] = [
  { id: 'rcat-1', name: '财务审计', parentId: null, sortOrder: 1, preset: true },
  { id: 'rcat-2', name: '合规审计', parentId: null, sortOrder: 2, preset: true },
  { id: 'rcat-3', name: '绩效审计', parentId: null, sortOrder: 3, preset: true },
  { id: 'rcat-4', name: '专项审计', parentId: null, sortOrder: 4, preset: true },
  { id: 'rcat-5', name: '其他', parentId: null, sortOrder: 5, preset: true },
  { id: 'rcat-99', name: '未分类', parentId: null, sortOrder: 99, preset: true },
  // 自建二级分类示例
  { id: 'rcat-1-1', name: '年度财务报告', parentId: 'rcat-1', sortOrder: 1 },
  { id: 'rcat-1-2', name: '专项财务核查', parentId: 'rcat-1', sortOrder: 2 },
  { id: 'rcat-2-1', name: '制度合规检查', parentId: 'rcat-2', sortOrder: 1 }
]

// ==================== 报告数据 ====================
const reports: Report[] = []

// 初始化报告样本数据
const seedReports: Omit<Report, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'rpt-1',
    name: '2026年度财务收支审计报告',
    categoryId: 'rcat-1-1',
    fileName: '2026年度财务收支审计报告.pdf',
    fileUrl: '/files/report-finance-2026.pdf',
    fileType: 'pdf',
    fileSize: 2048000,
    isFavorite: true
  },
  {
    id: 'rpt-2',
    name: '开发区医院财务收支专项核查报告',
    categoryId: 'rcat-1-2',
    fileName: '开发区医院财务核查.pdf',
    fileUrl: '/files/report-hospital-finance.pdf',
    fileType: 'pdf',
    fileSize: 1536000,
    isFavorite: false
  },
  {
    id: 'rpt-3',
    name: '政府采购合规性审计报告',
    categoryId: 'rcat-2-1',
    fileName: '政府采购合规审计.docx',
    fileUrl: '/files/report-procurement-compliance.docx',
    fileType: 'docx',
    fileSize: 512000,
    isFavorite: true
  },
  {
    id: 'rpt-4',
    name: '制度执行合规检查报告',
    categoryId: 'rcat-2-1',
    fileName: '制度执行合规检查.pdf',
    fileUrl: '/files/report-rule-compliance.pdf',
    fileType: 'pdf',
    fileSize: 896000,
    isFavorite: false
  },
  {
    id: 'rpt-5',
    name: '专项资金使用绩效评价报告',
    categoryId: 'rcat-3',
    fileName: '专项资金绩效评价.xlsx',
    fileUrl: '/files/report-fund-performance.xlsx',
    fileType: 'xlsx',
    fileSize: 384000,
    isFavorite: false
  },
  {
    id: 'rpt-6',
    name: '市级储备粮库建设项目专项审计报告',
    categoryId: 'rcat-4',
    fileName: '储备粮库建设专项审计.pdf',
    fileUrl: '/files/report-grain-project.pdf',
    fileType: 'pdf',
    fileSize: 3072000,
    isFavorite: true
  },
  {
    id: 'rpt-7',
    name: '区交通局工程项目专项审计报告',
    categoryId: 'rcat-4',
    fileName: '交通局工程专项审计.pdf',
    fileUrl: '/files/report-traffic-project.pdf',
    fileType: 'pdf',
    fileSize: 2560000,
    isFavorite: false
  },
  {
    id: 'rpt-8',
    name: '某事业单位资产管理审计报告',
    categoryId: 'rcat-99',
    fileName: '事业单位资产管理审计.doc',
    fileUrl: '/files/report-asset-management.doc',
    fileType: 'doc',
    fileSize: 768000,
    isFavorite: false
  }
]
// 填充创建/更新时间（按倒序拉开时间梯度，便于排序演示）
seedReports.forEach((r, idx) => {
  const day = String(28 - idx).padStart(2, '0')
  reports.push({
    ...r,
    createdAt: `2026-05-${day} 10:00:00`,
    updatedAt: `2026-05-${day} 10:00:00`
  })
})

// ==================== 树形构建工具 ====================

/** 根据扁平 categories 数组构建树，并附 selfCount/totalCount */
function buildCategoryTree(): ReportCategoryNode[] {
  // 计算每个分类直接挂的报告数
  const selfCountMap = new Map<string, number>()
  for (const r of reports) {
    selfCountMap.set(r.categoryId, (selfCountMap.get(r.categoryId) ?? 0) + 1)
  }

  // 转树
  const map = new Map<string, ReportCategoryNode>()
  categories.forEach((c) => {
    map.set(c.id, {
      ...c,
      children: [],
      selfCount: selfCountMap.get(c.id) ?? 0,
      totalCount: 0
    })
  })
  const roots: ReportCategoryNode[] = []
  map.forEach((node) => {
    if (node.parentId === null) {
      roots.push(node)
    } else {
      const parent = map.get(node.parentId)
      if (parent) parent.children!.push(node)
    }
  })

  // 递归算 totalCount = self + 子孙合并
  const calc = (n: ReportCategoryNode): number => {
    let total = n.selfCount ?? 0
    if (n.children?.length) {
      for (const c of n.children) total += calc(c)
    }
    n.totalCount = total
    return total
  }
  roots.forEach(calc)

  // 同级按 sortOrder 排序
  const sortRecursive = (nodes: ReportCategoryNode[]) => {
    nodes.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    nodes.forEach((n) => n.children?.length && sortRecursive(n.children))
  }
  sortRecursive(roots)
  return roots
}

/** 根据分类 id 找它及子孙的所有 id（用于按分类筛报告） */
function getCategoryAndDescendantIds(categoryId: string): Set<string> {
  const result = new Set<string>([categoryId])
  const queue = [categoryId]
  while (queue.length) {
    const cur = queue.shift()!
    for (const c of categories) {
      if (c.parentId === cur && !result.has(c.id)) {
        result.add(c.id)
        queue.push(c.id)
      }
    }
  }
  return result
}

// ==================== 分类接口 ====================

/** 获取分类树 */
export async function getCategoryTree() {
  await delay()
  return { code: 200, message: '成功', data: buildCategoryTree() }
}

/** 新增分类（同级唯一校验） */
export async function addCategory(data: { name: string; parentId: string | null }) {
  await delay()
  if (categories.some((c) => c.parentId === data.parentId && c.name === data.name)) {
    return { code: 400, message: '同级已存在同名分类', data: null }
  }
  const item: ReportCategory = {
    id: nextCategoryId(),
    name: data.name,
    parentId: data.parentId,
    sortOrder: Date.now()
  }
  categories.push(item)
  return { code: 200, message: '新增成功', data: item }
}

/** 更新分类（重命名 / 移动父级） */
export async function updateCategory(
  id: string,
  data: { name?: string; parentId?: string | null }
) {
  await delay()
  const idx = categories.findIndex((c) => c.id === id)
  if (idx === -1) return { code: 404, message: '分类不存在', data: null }

  // 重命名场景：检查同级唯一
  if (data.name) {
    const parentId = data.parentId ?? categories[idx].parentId
    if (categories.some((c) => c.id !== id && c.parentId === parentId && c.name === data.name)) {
      return { code: 400, message: '同级已存在同名分类', data: null }
    }
  }

  // 移动场景：检查环（不能拖到自己的子孙下）
  if (data.parentId !== undefined && data.parentId !== null) {
    const descendants = getCategoryAndDescendantIds(id)
    if (descendants.has(data.parentId)) {
      return { code: 400, message: '不能将分类移动到自己的子级', data: null }
    }
  }

  Object.assign(categories[idx], data)
  return { code: 200, message: '更新成功', data: categories[idx] }
}

/** 删除分类（严格防护：预置分类不可删、含子或含报告时不允许删） */
export async function deleteCategory(id: string) {
  await delay()
  const target = categories.find((c) => c.id === id)
  if (!target) return { code: 404, message: '分类不存在', data: null }
  // 预置分类（项目类型分类与「未分类」）不可删
  if (target.preset) {
    return { code: 400, message: '系统预置分类不可删除', data: null }
  }
  const hasChild = categories.some((c) => c.parentId === id)
  const hasReport = reports.some((r) => r.categoryId === id)
  if (hasChild || hasReport) {
    const childCount = categories.filter((c) => c.parentId === id).length
    const rptCount = reports.filter((r) => r.categoryId === id).length
    return {
      code: 400,
      message: `该分类下仍有 ${rptCount} 份报告、${childCount} 个子分类，请先清空或移动后再删除`,
      data: null
    }
  }
  const idx = categories.findIndex((c) => c.id === id)
  categories.splice(idx, 1)
  return { code: 200, message: '删除成功', data: null }
}

// ==================== 报告接口 ====================

/** 获取报告列表（分页 + 筛选 + 排序 + 收藏过滤） */
export async function getReportList(params: ReportListQuery) {
  await delay()
  let result = [...reports]

  // 按分类筛选（含子孙）
  if (params.categoryId) {
    const idSet = getCategoryAndDescendantIds(params.categoryId)
    result = result.filter((r) => idSet.has(r.categoryId))
  }

  // 仅看收藏
  if (params.onlyFavorite) {
    result = result.filter((r) => r.isFavorite)
  }

  // 关键词模糊匹配报告名称
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    result = result.filter((r) => r.name.toLowerCase().includes(kw))
  }

  // 排序
  const sortBy = params.sortBy ?? 'createdAt'
  if (sortBy === 'name') {
    result.sort((a, b) => a.name.localeCompare(b.name, 'zh'))
  } else {
    result.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  const total = result.length
  const start = (params.page - 1) * params.pageSize
  const list = result.slice(start, start + params.pageSize)

  return { code: 200, message: '成功', data: { list, total } }
}

/** 新增报告 */
export async function addReport(data: {
  name: string
  categoryId: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
}) {
  await delay()
  if (!data.name?.trim()) return { code: 400, message: '报告名称不能为空', data: null }
  if (!data.fileName) return { code: 400, message: '请上传报告文件', data: null }

  const item: Report = {
    id: nextReportId(),
    name: data.name.trim(),
    categoryId: data.categoryId,
    fileName: data.fileName,
    fileUrl: data.fileUrl,
    fileType: data.fileType,
    fileSize: data.fileSize,
    isFavorite: false,
    createdAt: now(),
    updatedAt: now()
  }
  reports.push(item)
  return { code: 200, message: '新增成功', data: item }
}

/** 编辑报告 */
export async function updateReport(
  id: string,
  data: {
    name?: string
    categoryId?: string
    fileName?: string
    fileUrl?: string
    fileType?: string
    fileSize?: number
  }
) {
  await delay()
  const idx = reports.findIndex((r) => r.id === id)
  if (idx === -1) return { code: 404, message: '报告不存在', data: null }
  Object.assign(reports[idx], data, { updatedAt: now() })
  return { code: 200, message: '更新成功', data: reports[idx] }
}

/** 删除报告 */
export async function deleteReport(id: string) {
  await delay()
  const idx = reports.findIndex((r) => r.id === id)
  if (idx === -1) return { code: 404, message: '报告不存在', data: null }
  reports.splice(idx, 1)
  return { code: 200, message: '删除成功', data: null }
}

/** 批量删除报告 */
export async function batchDeleteReport(ids: string[]) {
  await delay()
  // 过滤掉待删除的报告，保留其余
  const before = reports.length
  for (let i = reports.length - 1; i >= 0; i--) {
    if (ids.includes(reports[i].id)) reports.splice(i, 1)
  }
  return { code: 200, message: '删除成功', data: { deleted: before - reports.length } }
}

/** 切换收藏状态 */
export async function toggleFavorite(id: string) {
  await delay(150)
  const item = reports.find((r) => r.id === id)
  if (!item) return { code: 404, message: '报告不存在', data: null }
  item.isFavorite = !item.isFavorite
  return {
    code: 200,
    message: item.isFavorite ? '已收藏' : '已取消收藏',
    data: { isFavorite: item.isFavorite }
  }
}

// ==================== 引入向导：项目树与报告附件 ====================

const mockProjectTree: AuditProjectNode[] = [
  {
    id: 'year-2026',
    name: '2026 年',
    type: 'year',
    children: [
      { id: 'p-2026-1', name: '2026年度财务审计项目', type: 'project' },
      { id: 'p-2026-2', name: '开发区医院财务收支审计', type: 'project' },
      { id: 'p-2026-3', name: '市级储备粮中心库建设项目专项审计', type: 'project' }
    ]
  },
  {
    id: 'year-2025',
    name: '2025 年',
    type: 'year',
    children: [
      { id: 'p-2025-1', name: '市政府采购中心年度审计', type: 'project' },
      { id: 'p-2025-2', name: '某事业单位资产管理审计', type: 'project' }
    ]
  }
]

// 各项目下的报告附件（category 为项目类型，用于自动分发到同名分类）
const mockProjectReports: Record<string, ProjectReportAttachment[]> = {
  'p-2026-1': [
    {
      id: 'pr-2026-1-1',
      projectId: 'p-2026-1',
      projectName: '2026年度财务审计项目',
      name: '2026年度财务审计总报告',
      fileName: '2026财务审计总报告.pdf',
      fileUrl: '/files/proj-finance-2026-main.pdf',
      fileType: 'pdf',
      fileSize: 2200000,
      category: '财务审计'
    },
    {
      id: 'pr-2026-1-2',
      projectId: 'p-2026-1',
      projectName: '2026年度财务审计项目',
      name: '2026年度财务收支审计报告',
      // 与库内 rpt-1 同名同 URL，演示查重
      fileName: '2026年度财务收支审计报告.pdf',
      fileUrl: '/files/report-finance-2026.pdf',
      fileType: 'pdf',
      fileSize: 2048000,
      category: '财务审计'
    }
  ],
  'p-2026-2': [
    {
      id: 'pr-2026-2-1',
      projectId: 'p-2026-2',
      projectName: '开发区医院财务收支审计',
      name: '开发区医院财务收支审计报告',
      fileName: '开发区医院财务审计.pdf',
      fileUrl: '/files/proj-hospital-audit.pdf',
      fileType: 'pdf',
      fileSize: 1800000,
      category: '财务审计'
    }
  ],
  'p-2026-3': [
    {
      id: 'pr-2026-3-1',
      projectId: 'p-2026-3',
      projectName: '市级储备粮中心库建设项目专项审计',
      name: '储备粮库建设项目专项审计报告',
      fileName: '储备粮库专项审计.pdf',
      fileUrl: '/files/proj-grain-audit.pdf',
      fileType: 'pdf',
      fileSize: 2900000,
      category: '专项审计'
    },
    {
      // category 不在分类树中，演示「未分类」兜底
      id: 'pr-2026-3-2',
      projectId: 'p-2026-3',
      projectName: '市级储备粮中心库建设项目专项审计',
      name: '储备粮库建设廉政风险评估报告',
      fileName: '储备粮库廉政评估.docx',
      fileUrl: '/files/proj-grain-risk.docx',
      fileType: 'docx',
      fileSize: 640000,
      category: '廉政评估'
    }
  ],
  'p-2025-1': [
    {
      id: 'pr-2025-1-1',
      projectId: 'p-2025-1',
      projectName: '市政府采购中心年度审计',
      name: '政府采购中心年度合规审计报告',
      fileName: '采购中心合规审计.docx',
      fileUrl: '/files/proj-procurement-audit.docx',
      fileType: 'docx',
      fileSize: 580000,
      category: '合规审计'
    }
  ],
  'p-2025-2': [
    {
      id: 'pr-2025-2-1',
      projectId: 'p-2025-2',
      projectName: '某事业单位资产管理审计',
      name: '事业单位资产管理绩效审计报告',
      fileName: '事业单位资产绩效审计.xlsx',
      fileUrl: '/files/proj-asset-performance.xlsx',
      fileType: 'xlsx',
      fileSize: 420000,
      category: '绩效审计'
    }
  ]
}

/** 项目树（按年份分组） */
export async function getAuditProjectTree() {
  await delay()
  return { code: 200, message: '成功', data: mockProjectTree }
}

/** 项目下报告附件清单 */
export async function getProjectReports(projectId: string) {
  await delay()
  return { code: 200, message: '成功', data: mockProjectReports[projectId] ?? [] }
}

/** 引入查重：按文件名 + URL 严格匹配库内已有，返回重复的标识键（fileName||fileUrl） */
export async function checkImportDuplicate(keys: string[]) {
  await delay(200)
  const existed = new Set(reports.map((r) => `${r.fileName}||${r.fileUrl}`))
  const duplicates = keys.filter((k) => existed.has(k))
  return { code: 200, message: '成功', data: { duplicates } }
}

/** 批量引入：根据预览项一次性入库，返回 success/skipped 统计 */
export async function importFromProjects(items: ReportImportPreviewItem[]) {
  await delay(500)
  let success = 0
  let skipped = 0
  for (const item of items) {
    if (item.status === 'duplicate') {
      skipped++
      continue
    }
    const targetCategoryId = item.targetCategoryId ?? 'rcat-99'
    reports.push({
      id: nextReportId(),
      name: item.reportName,
      categoryId: targetCategoryId,
      fileName: item.fileName,
      fileUrl: item.fileUrl,
      fileType: item.fileType,
      fileSize: item.fileSize,
      isFavorite: false,
      createdAt: now(),
      updatedAt: now(),
      sourceProjectId: item.projectId
    })
    success++
  }
  const result: ImportResult = { success, skipped, failed: 0 }
  return { code: 200, message: '引入完成', data: result }
}
