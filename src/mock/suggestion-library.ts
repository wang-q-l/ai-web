/**
 * 管理建议库 Mock 数据
 * 接口：
 * - GET    /api/suggestion-category/tree              分类树（含每节点直接 count）
 * - POST   /api/suggestion-category                   新增分类
 * - PUT    /api/suggestion-category/{id}              更新分类
 * - DELETE /api/suggestion-category/{id}              删除分类（防护检查）
 * - GET    /api/suggestion/list                       建议分页列表
 * - POST   /api/suggestion                            新增建议
 * - PUT    /api/suggestion/{id}                       编辑建议
 * - DELETE /api/suggestion/{id}                       删除建议
 * - POST   /api/suggestion/batch-delete               批量删除
 * - POST   /api/suggestion/batch-move                 批量移动分类
 * - POST   /api/suggestion/{id}/usage                 引用量自增
 * - GET    /api/audit-project/tree                    项目树（年份→项目）
 * - GET    /api/audit-project/{id}/problems           项目下问题清单
 * - POST   /api/suggestion/check-duplicate            引入预览查重
 * - POST   /api/suggestion/import-from-problems       批量引入
 */

import type {
  SuggestionCategory,
  SuggestionCategoryNode,
  Suggestion,
  SuggestionListQuery,
  AuditProjectNode,
  AuditProblem,
  ImportPreviewItem,
  ImportResult
} from '@/types/suggestion-library'

// 模拟接口延迟
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

// 当前时间字符串
const now = () => new Date().toLocaleString('zh-CN', { hour12: false })

// id 自增工具
let categorySeq = 100
const nextCategoryId = () => `cat-${++categorySeq}`
let suggestionSeq = 1000
const nextSuggestionId = () => `sug-${++suggestionSeq}`

// ==================== 分类数据 ====================
// 模块级变量持久化，页面切换不丢失
const categories: SuggestionCategory[] = [
  // 一级分类
  { id: 'cat-1', name: '财务管理', parentId: null, sortOrder: 1 },
  { id: 'cat-2', name: '采购招标', parentId: null, sortOrder: 2 },
  { id: 'cat-3', name: '资产管理', parentId: null, sortOrder: 3 },
  { id: 'cat-4', name: '医疗违规', parentId: null, sortOrder: 4 },
  { id: 'cat-5', name: '工程项目', parentId: null, sortOrder: 5 },
  { id: 'cat-99', name: '未分类', parentId: null, sortOrder: 99 },
  // 财务管理 → 二级
  { id: 'cat-1-1', name: '预算执行', parentId: 'cat-1', sortOrder: 1 },
  { id: 'cat-1-2', name: '财务报告', parentId: 'cat-1', sortOrder: 2 },
  { id: 'cat-1-3', name: '内部控制', parentId: 'cat-1', sortOrder: 3 },
  // 财务管理/预算执行 → 三级
  { id: 'cat-1-1-1', name: '预算编制', parentId: 'cat-1-1', sortOrder: 1 },
  { id: 'cat-1-1-2', name: '预算调整', parentId: 'cat-1-1', sortOrder: 2 },
  // 采购招标 → 二级
  { id: 'cat-2-1', name: '公开招标', parentId: 'cat-2', sortOrder: 1 },
  { id: 'cat-2-2', name: '邀请招标', parentId: 'cat-2', sortOrder: 2 }
]

// ==================== 建议数据 ====================
const suggestions: Suggestion[] = [
  // 财务管理 / 预算编制
  {
    id: 'sug-1',
    content:
      '建议加强预算编制的科学性，按实际工程进度分年度编制建设项目预算，避免预算与实际支出严重脱节。',
    categoryId: 'cat-1-1-1',
    usageCount: 45,
    createdAt: '2026-04-10 09:00:00',
    updatedAt: '2026-05-20 14:30:00'
  },
  {
    id: 'sug-2',
    content: '建议建立预算编制审核机制，对部门预算申报材料的合理性、必要性进行实质性审核。',
    categoryId: 'cat-1-1-1',
    usageCount: 32,
    createdAt: '2026-04-12 10:00:00',
    updatedAt: '2026-05-15 11:00:00'
  },
  // 财务管理 / 预算调整
  {
    id: 'sug-3',
    content: '建议规范预算调整程序，重大预算调整必须提交本级人大常委会审批，不得擅自调整。',
    categoryId: 'cat-1-1-2',
    usageCount: 28,
    createdAt: '2026-04-15 11:30:00',
    updatedAt: '2026-05-10 16:00:00'
  },
  // 财务管理 / 财务报告
  {
    id: 'sug-4',
    content: '建议加强财务报告的真实性审查，杜绝虚假列支、重复列支、隐匿收入等违规行为。',
    categoryId: 'cat-1-2',
    usageCount: 38,
    createdAt: '2026-03-20 14:00:00',
    updatedAt: '2026-05-22 09:30:00'
  },
  {
    id: 'sug-5',
    content: '建议建立财务报告定期公示制度，主动接受社会监督，提升财务透明度。',
    categoryId: 'cat-1-2',
    usageCount: 15,
    createdAt: '2026-03-25 09:30:00',
    updatedAt: '2026-04-30 15:20:00'
  },
  // 财务管理 / 内部控制
  {
    id: 'sug-6',
    content: '建议建立健全内部控制制度，形成"决策、执行、监督"相互制衡的内控体系。',
    categoryId: 'cat-1-3',
    usageCount: 22,
    createdAt: '2026-03-15 10:30:00',
    updatedAt: '2026-05-05 11:45:00'
  },
  {
    id: 'sug-7',
    content: '建议加强不相容职务分离，财务岗位人员不得同时兼任出纳与会计。',
    categoryId: 'cat-1-3',
    usageCount: 18,
    createdAt: '2026-03-18 13:00:00',
    updatedAt: '2026-04-20 10:15:00'
  },
  // 采购招标 / 公开招标
  {
    id: 'sug-8',
    content: '建议严格执行公开招标程序，达到招标限额的项目必须公开招标，不得化整为零规避招标。',
    categoryId: 'cat-2-1',
    usageCount: 52,
    createdAt: '2026-03-01 09:00:00',
    updatedAt: '2026-05-25 14:00:00'
  },
  {
    id: 'sug-9',
    content: '建议建立招标过程留痕机制，所有评标记录、评标过程必须可追溯、可核查。',
    categoryId: 'cat-2-1',
    usageCount: 19,
    createdAt: '2026-03-05 10:30:00',
    updatedAt: '2026-04-25 16:00:00'
  },
  {
    id: 'sug-10',
    content:
      '建议加强对围标串标行为的识别与查处，对发现的违规投标人列入黑名单，限制其后续投标资格。',
    categoryId: 'cat-2-1',
    usageCount: 25,
    createdAt: '2026-03-10 11:00:00',
    updatedAt: '2026-05-12 09:45:00'
  },
  // 采购招标 / 邀请招标
  {
    id: 'sug-11',
    content:
      '建议规范邀请招标的供应商选取程序，邀请对象必须从合格供应商库中随机抽取，避免人为指定。',
    categoryId: 'cat-2-2',
    usageCount: 12,
    createdAt: '2026-03-12 14:30:00',
    updatedAt: '2026-04-15 10:00:00'
  },
  {
    id: 'sug-12',
    content: '建议邀请招标项目至少邀请 3 家以上合格供应商参与，确保竞争充分。',
    categoryId: 'cat-2-2',
    usageCount: 8,
    createdAt: '2026-03-15 15:00:00',
    updatedAt: '2026-04-10 11:30:00'
  },
  // 资产管理
  {
    id: 'sug-13',
    content: '建议建立国有资产清查盘点制度，每年至少盘点一次，做到账实相符、账账相符。',
    categoryId: 'cat-3',
    usageCount: 35,
    createdAt: '2026-02-20 09:30:00',
    updatedAt: '2026-05-18 13:00:00'
  },
  {
    id: 'sug-14',
    content: '建议加强对低值易耗品的管理，建立领用台账，定期清查。',
    categoryId: 'cat-3',
    usageCount: 7,
    createdAt: '2026-02-25 10:00:00',
    updatedAt: '2026-04-05 14:30:00'
  },
  {
    id: 'sug-15',
    content: '建议规范资产处置程序，资产报废、转让、对外捐赠必须经集体决策并报上级主管部门审批。',
    categoryId: 'cat-3',
    usageCount: 21,
    createdAt: '2026-03-01 11:30:00',
    updatedAt: '2026-05-08 15:45:00'
  },
  {
    id: 'sug-16',
    content: '建议加强车辆资产管理，公车实行集中管理、统一调度，杜绝公车私用。',
    categoryId: 'cat-3',
    usageCount: 16,
    createdAt: '2026-03-08 14:00:00',
    updatedAt: '2026-04-28 09:30:00'
  },
  // 医疗违规
  {
    id: 'sug-17',
    content: '建议公立医疗机构不得与社会资本合作举办营利性项目，不得变相出租、承包科室。',
    categoryId: 'cat-4',
    usageCount: 41,
    createdAt: '2026-02-15 10:00:00',
    updatedAt: '2026-05-26 11:00:00'
  },
  {
    id: 'sug-18',
    content: '建议加强医疗机构对外合作项目的审批管理，所有对外合作必须报主管部门备案。',
    categoryId: 'cat-4',
    usageCount: 14,
    createdAt: '2026-02-20 11:30:00',
    updatedAt: '2026-04-22 13:30:00'
  },
  {
    id: 'sug-19',
    content: '建议规范医疗收费行为，严禁超标准收费、自立项目收费、分解收费等违规行为。',
    categoryId: 'cat-4',
    usageCount: 26,
    createdAt: '2026-02-28 09:00:00',
    updatedAt: '2026-05-15 16:30:00'
  },
  {
    id: 'sug-20',
    content: '建议加强医疗设备采购管理，大型医疗设备采购必须经集体决策，避免一人决断。',
    categoryId: 'cat-4',
    usageCount: 11,
    createdAt: '2026-03-05 13:30:00',
    updatedAt: '2026-04-18 10:30:00'
  },
  // 工程项目
  {
    id: 'sug-21',
    content: '建议工程项目立项前必须开展可行性研究，可研报告应包含技术、经济、风险等多维度论证。',
    categoryId: 'cat-5',
    usageCount: 33,
    createdAt: '2026-02-10 09:30:00',
    updatedAt: '2026-05-20 14:30:00'
  },
  {
    id: 'sug-22',
    content: '建议加强工程变更管理，重大设计变更须经原审批部门重新审批，避免随意变更。',
    categoryId: 'cat-5',
    usageCount: 23,
    createdAt: '2026-02-18 11:00:00',
    updatedAt: '2026-05-10 09:30:00'
  },
  {
    id: 'sug-23',
    content: '建议工程结算审计要严格按合同约定与现场签证执行，对未发生的工程量不予结算。',
    categoryId: 'cat-5',
    usageCount: 29,
    createdAt: '2026-02-22 14:00:00',
    updatedAt: '2026-05-05 11:30:00'
  },
  {
    id: 'sug-24',
    content: '建议加强对工程监理的过程管理，监理单位履职情况应纳入年度考核。',
    categoryId: 'cat-5',
    usageCount: 9,
    createdAt: '2026-03-01 10:30:00',
    updatedAt: '2026-04-15 13:00:00'
  },
  {
    id: 'sug-25',
    content: '建议建立工程项目质保金管理制度，质保期满后无质量问题方可释放质保金。',
    categoryId: 'cat-5',
    usageCount: 6,
    createdAt: '2026-03-08 15:30:00',
    updatedAt: '2026-04-08 10:00:00'
  },
  // 财务管理（一级直接挂的，无二级分类）
  {
    id: 'sug-26',
    content: '建议加强对"三公"经费的管理，严格控制公务接待、公务用车、因公出国（境）经费支出。',
    categoryId: 'cat-1',
    usageCount: 47,
    createdAt: '2026-02-05 09:00:00',
    updatedAt: '2026-05-28 10:30:00'
  },
  {
    id: 'sug-27',
    content: '建议规范专项资金的使用与拨付，做到专款专用，不得截留、挪用、滞留。',
    categoryId: 'cat-1',
    usageCount: 31,
    createdAt: '2026-02-12 10:30:00',
    updatedAt: '2026-05-22 14:00:00'
  },
  // 未分类（兜底分类，演示引入兜底场景）
  {
    id: 'sug-28',
    content: '建议进一步完善信息公开制度，将经批准的预算、决算等信息及时公开。',
    categoryId: 'cat-99',
    usageCount: 4,
    createdAt: '2026-04-15 11:00:00',
    updatedAt: '2026-04-25 09:00:00'
  },
  {
    id: 'sug-29',
    content: '建议加强对下属单位的财务管理指导，定期组织财务培训，提升整体财务管理水平。',
    categoryId: 'cat-99',
    usageCount: 2,
    createdAt: '2026-04-18 14:30:00',
    updatedAt: '2026-04-28 13:30:00'
  },
  {
    id: 'sug-30',
    content: '建议建立审计整改长效机制，对反复出现的同类问题深入分析根因并跟踪整改落实情况。',
    categoryId: 'cat-2',
    usageCount: 17,
    createdAt: '2026-04-20 10:00:00',
    updatedAt: '2026-05-18 11:30:00'
  }
]

// ==================== 树形构建工具 ====================

/** 根据扁平 categories 数组构建树，并附 selfCount/totalCount */
function buildCategoryTree(): SuggestionCategoryNode[] {
  // 计算每个分类直接挂的建议数
  const selfCountMap = new Map<string, number>()
  for (const s of suggestions) {
    selfCountMap.set(s.categoryId, (selfCountMap.get(s.categoryId) ?? 0) + 1)
  }

  // 转树
  const map = new Map<string, SuggestionCategoryNode>()
  categories.forEach((c) => {
    map.set(c.id, {
      ...c,
      children: [],
      selfCount: selfCountMap.get(c.id) ?? 0,
      totalCount: 0
    })
  })
  const roots: SuggestionCategoryNode[] = []
  map.forEach((node) => {
    if (node.parentId === null) {
      roots.push(node)
    } else {
      const parent = map.get(node.parentId)
      if (parent) parent.children!.push(node)
    }
  })

  // 递归算 totalCount = self + 子孙合并
  const calc = (n: SuggestionCategoryNode): number => {
    let total = n.selfCount ?? 0
    if (n.children?.length) {
      for (const c of n.children) total += calc(c)
    }
    n.totalCount = total
    return total
  }
  roots.forEach(calc)

  // 同级按 sortOrder 排序
  const sortRecursive = (nodes: SuggestionCategoryNode[]) => {
    nodes.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    nodes.forEach((n) => n.children?.length && sortRecursive(n.children))
  }
  sortRecursive(roots)
  return roots
}

/** 根据分类 id 找它及子孙的所有 id（用于按分类筛建议） */
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
  // 同级重名校验
  if (categories.some((c) => c.parentId === data.parentId && c.name === data.name)) {
    return { code: 400, message: '同级已存在同名分类', data: null }
  }
  const item: SuggestionCategory = {
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

/** 删除分类（严格防护：含子或含建议时不允许删） */
export async function deleteCategory(id: string) {
  await delay()
  // 「全部建议」根（id='all' 虚拟节点）和「未分类」cat-99 不可删
  if (id === 'cat-99') {
    return { code: 400, message: '「未分类」是系统默认分类，不可删除', data: null }
  }
  const hasChild = categories.some((c) => c.parentId === id)
  const hasSuggestion = suggestions.some((s) => s.categoryId === id)
  if (hasChild || hasSuggestion) {
    const childCount = categories.filter((c) => c.parentId === id).length
    const sugCount = suggestions.filter((s) => s.categoryId === id).length
    return {
      code: 400,
      message: `该分类下仍有 ${sugCount} 条建议、${childCount} 个子分类，请先清空或移动后再删除`,
      data: null
    }
  }
  const idx = categories.findIndex((c) => c.id === id)
  if (idx === -1) return { code: 404, message: '分类不存在', data: null }
  categories.splice(idx, 1)
  return { code: 200, message: '删除成功', data: null }
}

// ==================== 建议接口 ====================

/** 获取建议列表（分页 + 筛选 + 排序） */
export async function getSuggestionList(params: SuggestionListQuery) {
  await delay()
  let result = [...suggestions]

  // 按分类筛选（含子孙）
  if (params.categoryId) {
    const idSet = getCategoryAndDescendantIds(params.categoryId)
    result = result.filter((s) => idSet.has(s.categoryId))
  }

  // 关键词模糊匹配
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    result = result.filter((s) => s.content.toLowerCase().includes(kw))
  }

  // 排序
  const sortBy = params.sortBy ?? 'updatedAt'
  if (sortBy === 'usageCount') {
    result.sort((a, b) => b.usageCount - a.usageCount)
  } else {
    result.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  const total = result.length
  const start = (params.page - 1) * params.pageSize
  const list = result.slice(start, start + params.pageSize)

  return { code: 200, message: '成功', data: { list, total } }
}

/** 引用量自增（业务实际选用某条建议时 +1） */
export async function incrementSuggestionUsage(id: string) {
  await delay(150)
  const target = suggestions.find((s) => s.id === id)
  if (!target) return { code: 404, message: '建议不存在', data: null }
  // 选用一次，引用量累加
  target.usageCount += 1
  return { code: 200, message: '更新成功', data: { id, usageCount: target.usageCount } }
}

/** 新增建议 */
export async function addSuggestion(data: { content: string; categoryId: string }) {
  await delay()
  if (!data.content?.trim()) return { code: 400, message: '建议内容不能为空', data: null }
  if (data.content.length > 1000)
    return { code: 400, message: '建议内容不能超过 1000 字', data: null }

  const item: Suggestion = {
    id: nextSuggestionId(),
    content: data.content.trim(),
    categoryId: data.categoryId,
    usageCount: 0,
    createdAt: now(),
    updatedAt: now()
  }
  suggestions.push(item)
  return { code: 200, message: '新增成功', data: item }
}

/** 编辑建议 */
export async function updateSuggestion(
  id: string,
  data: { content?: string; categoryId?: string }
) {
  await delay()
  const idx = suggestions.findIndex((s) => s.id === id)
  if (idx === -1) return { code: 404, message: '建议不存在', data: null }
  if (data.content && data.content.length > 1000) {
    return { code: 400, message: '建议内容不能超过 1000 字', data: null }
  }
  Object.assign(suggestions[idx], data, { updatedAt: now() })
  return { code: 200, message: '更新成功', data: suggestions[idx] }
}

/** 删除建议 */
export async function deleteSuggestion(id: string) {
  await delay()
  const idx = suggestions.findIndex((s) => s.id === id)
  if (idx === -1) return { code: 404, message: '建议不存在', data: null }
  suggestions.splice(idx, 1)
  return { code: 200, message: '删除成功', data: null }
}

/** 批量删除 */
export async function batchDeleteSuggestion(ids: string[]) {
  await delay()
  let deleted = 0
  for (const id of ids) {
    const idx = suggestions.findIndex((s) => s.id === id)
    if (idx !== -1) {
      suggestions.splice(idx, 1)
      deleted++
    }
  }
  return { code: 200, message: `已删除 ${deleted} 条`, data: { deleted } }
}

/** 批量移动分类 */
export async function batchMoveSuggestion(ids: string[], targetCategoryId: string) {
  await delay()
  // 校验目标分类存在
  if (!categories.some((c) => c.id === targetCategoryId)) {
    return { code: 400, message: '目标分类不存在', data: null }
  }
  let moved = 0
  for (const id of ids) {
    const item = suggestions.find((s) => s.id === id)
    if (item) {
      item.categoryId = targetCategoryId
      item.updatedAt = now()
      moved++
    }
  }
  return { code: 200, message: `已移动 ${moved} 条`, data: { moved } }
}

// ==================== 引入向导：项目树与问题清单 ====================

const mockProjectTree: AuditProjectNode[] = [
  {
    id: 'year-2026',
    name: '2026 年',
    type: 'year',
    children: [
      { id: 'p-2026-1', name: 'ZY 科技李红同志任中经责审计', type: 'project' },
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
  },
  {
    id: 'year-2024',
    name: '2024 年',
    type: 'year',
    children: [
      { id: 'p-2024-1', name: '区交通局工程项目专项审计', type: 'project' },
      { id: 'p-2024-2', name: '市第二医院经济责任审计', type: 'project' }
    ]
  }
]

const mockProblems: Record<string, AuditProblem[]> = {
  'p-2026-1': [
    {
      id: 'pb-2026-1-1',
      projectId: 'p-2026-1',
      projectName: 'ZY 科技李红同志任中经责审计',
      title: '违规设立经营性项目',
      auditAdvice: '建议公立医疗机构不得与社会资本合作举办营利性项目，不得变相出租、承包科室。',
      category: '医疗违规'
    },
    {
      id: 'pb-2026-1-2',
      projectId: 'p-2026-1',
      projectName: 'ZY 科技李红同志任中经责审计',
      title: '"三公"经费超支',
      auditAdvice: '建议严格控制公务接待范围与标准，加强对"三公"经费的预算管理与执行监督。',
      category: '财务管理'
    },
    {
      id: 'pb-2026-1-3',
      projectId: 'p-2026-1',
      projectName: 'ZY 科技李红同志任中经责审计',
      title: '资产盘点不规范',
      auditAdvice: '建议建立国有资产清查盘点制度，每年至少盘点一次，做到账实相符。',
      category: '资产管理'
    },
    {
      id: 'pb-2026-1-4',
      projectId: 'p-2026-1',
      projectName: 'ZY 科技李红同志任中经责审计',
      title: '部分采购未走集体决策',
      auditAdvice: '', // 空建议，演示过滤
      category: '采购招标'
    },
    {
      // 演示「未分类兜底」：category="合规风险" 不在分类树中，预览页将归为未分类
      id: 'pb-2026-1-5',
      projectId: 'p-2026-1',
      projectName: 'ZY 科技李红同志任中经责审计',
      title: '关联交易未及时披露',
      auditAdvice:
        '建议建立关联交易台账与披露机制，所有关联交易必须按规定向董事会报告并对外披露，避免利益输送风险。',
      category: '合规风险'
    }
  ],
  'p-2026-2': [
    {
      id: 'pb-2026-2-1',
      projectId: 'p-2026-2',
      projectName: '开发区医院财务收支审计',
      title: '医疗收费不规范',
      auditAdvice: '建议规范医疗收费行为，严禁超标准收费、自立项目收费、分解收费等违规行为。',
      category: '医疗违规'
    },
    {
      id: 'pb-2026-2-2',
      projectId: 'p-2026-2',
      projectName: '开发区医院财务收支审计',
      title: '医疗设备采购流程不严',
      auditAdvice: '建议加强医疗设备采购管理，大型医疗设备采购必须经集体决策，避免一人决断。',
      category: '医疗违规'
    },
    {
      id: 'pb-2026-2-3',
      projectId: 'p-2026-2',
      projectName: '开发区医院财务收支审计',
      title: '部分内控制度未执行',
      auditAdvice: '建议加强不相容职务分离，财务岗位人员不得同时兼任出纳与会计。', // 与库内 sug-7 重复，演示去重
      category: '内部控制'
    }
  ],
  'p-2026-3': [
    {
      id: 'pb-2026-3-1',
      projectId: 'p-2026-3',
      projectName: '市级储备粮中心库建设项目专项审计',
      title: '未按实际工程进度编制建设项目各年度预算',
      auditAdvice:
        '建议加强预算编制的科学性，按实际工程进度分年度编制建设项目预算，避免预算与实际支出严重脱节。', // 与库内 sug-1 重复
      category: '预算管理'
    },
    {
      id: 'pb-2026-3-2',
      projectId: 'p-2026-3',
      projectName: '市级储备粮中心库建设项目专项审计',
      title: '工程结算审核不严',
      auditAdvice: '建议工程结算审计要严格按合同约定与现场签证执行，对未发生的工程量不予结算。',
      category: '工程项目'
    }
  ],
  'p-2025-1': [
    {
      id: 'pb-2025-1-1',
      projectId: 'p-2025-1',
      projectName: '市政府采购中心年度审计',
      title: '化整为零规避招标',
      auditAdvice:
        '建议严格执行公开招标程序，达到招标限额的项目必须公开招标，不得化整为零规避招标。', // 与 sug-8 重复
      category: '采购招标'
    },
    {
      id: 'pb-2025-1-2',
      projectId: 'p-2025-1',
      projectName: '市政府采购中心年度审计',
      title: '邀请招标供应商选取不规范',
      auditAdvice:
        '建议规范邀请招标的供应商选取程序，邀请对象必须从合格供应商库中随机抽取，避免人为指定。',
      category: '采购招标'
    }
  ],
  'p-2025-2': [
    {
      id: 'pb-2025-2-1',
      projectId: 'p-2025-2',
      projectName: '某事业单位资产管理审计',
      title: '低值易耗品管理混乱',
      auditAdvice: '建议加强对低值易耗品的管理，建立领用台账，定期清查。',
      category: '资产管理'
    },
    {
      id: 'pb-2025-2-2',
      projectId: 'p-2025-2',
      projectName: '某事业单位资产管理审计',
      title: '公车管理不规范',
      auditAdvice: '建议加强车辆资产管理，公车实行集中管理、统一调度，杜绝公车私用。',
      category: '资产管理'
    }
  ],
  'p-2024-1': [
    {
      id: 'pb-2024-1-1',
      projectId: 'p-2024-1',
      projectName: '区交通局工程项目专项审计',
      title: '工程变更未审批',
      auditAdvice: '建议加强工程变更管理，重大设计变更须经原审批部门重新审批，避免随意变更。',
      category: '工程项目'
    },
    {
      id: 'pb-2024-1-2',
      projectId: 'p-2024-1',
      projectName: '区交通局工程项目专项审计',
      title: '工程监理履职不到位',
      auditAdvice: '建议加强对工程监理的过程管理，监理单位履职情况应纳入年度考核。',
      category: '工程项目'
    },
    {
      id: 'pb-2024-1-3',
      projectId: 'p-2024-1',
      projectName: '区交通局工程项目专项审计',
      title: '质保金管理松散',
      auditAdvice: '建议建立工程项目质保金管理制度，质保期满后无质量问题方可释放质保金。',
      category: '工程项目'
    }
  ],
  'p-2024-2': [
    {
      id: 'pb-2024-2-1',
      projectId: 'p-2024-2',
      projectName: '市第二医院经济责任审计',
      title: '院中院问题',
      auditAdvice: '建议加强医疗机构对外合作项目的审批管理，所有对外合作必须报主管部门备案。',
      category: '医疗违规'
    },
    {
      id: 'pb-2024-2-2',
      projectId: 'p-2024-2',
      projectName: '市第二医院经济责任审计',
      title: '财务报告失真',
      auditAdvice: '建议加强财务报告的真实性审查，杜绝虚假列支、重复列支、隐匿收入等违规行为。', // 与 sug-4 重复
      category: '财务管理'
    }
  ]
}

/** 项目树（按年份分组） */
export async function getAuditProjectTree() {
  await delay()
  return { code: 200, message: '成功', data: mockProjectTree }
}

/** 项目下问题清单 */
export async function getAuditProblems(projectId: string) {
  await delay()
  return { code: 200, message: '成功', data: mockProblems[projectId] ?? [] }
}

/** 引入预览查重：对每条 content 检查是否已在库中存在（trim 后严格相等） */
export async function checkImportDuplicate(contents: string[]) {
  await delay(200)
  const existed = new Set(suggestions.map((s) => s.content.trim()))
  const duplicates = contents.filter((c) => existed.has(c.trim()))
  return { code: 200, message: '成功', data: { duplicates } }
}

/** 批量引入：根据预览项一次性入库，返回 success/skipped 统计 */
export async function importFromProblems(items: ImportPreviewItem[]) {
  await delay(500)
  let success = 0
  let skipped = 0
  for (const item of items) {
    if (item.status === 'duplicate') {
      skipped++
      continue
    }
    const targetCategoryId = item.targetCategoryId ?? 'cat-99'
    suggestions.push({
      id: nextSuggestionId(),
      content: item.content.trim(),
      categoryId: targetCategoryId,
      usageCount: 0,
      createdAt: now(),
      updatedAt: now(),
      sourceProblemId: item.problemId
    })
    success++
  }
  const result: ImportResult = { success, skipped, failed: 0 }
  return { code: 200, message: '引入完成', data: result }
}

/** Excel 导出（mock 仅返回成功提示） */
export async function exportSuggestion() {
  await delay(800)
  return { code: 200, message: '导出成功', data: null }
}
