/**
 * 典型问题库 Mock 数据
 * 接口：
 * - GET    /api/typical-problem/category/tree      问题分类树
 * - GET    /api/typical-problem/list               典型问题分页列表（分类/关键词/收藏筛选）
 * - POST   /api/typical-problem/{id}/favorite       切换收藏状态
 */

import type {
  ProblemCategoryNode,
  TypicalProblem,
  TypicalProblemQuery
} from '@/types/typical-problem'

// 模拟接口延迟
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

// ==================== 分类树 ====================
// 模块级变量持久化，页面切换不丢失（结构参考截图：科研管理/内控评价类/财务管理与会计核算/资产管理类...）
const categoryTree: ProblemCategoryNode[] = [
  {
    id: 'p-cat-1',
    name: '科研管理',
    children: [
      { id: 'p-cat-1-1', name: '科研服务与支撑体系' },
      { id: 'p-cat-1-2', name: '科研成果与转化管理' },
      { id: 'p-cat-1-3', name: '科研项目实施与过程管理' },
      { id: 'p-cat-1-4', name: '科研经费管理' }
    ]
  },
  {
    id: 'p-cat-2',
    name: '内控评价类',
    children: [
      { id: 'p-cat-2-1', name: '监督管理' },
      { id: 'p-cat-2-2', name: '信息系统控制' },
      { id: 'p-cat-2-3', name: '印章管理' },
      { id: 'p-cat-2-4', name: '关键业务活动控制' },
      { id: 'p-cat-2-5', name: '内部控制环境与体系' },
      { id: 'p-cat-2-6', name: '决策管理' }
    ]
  },
  {
    id: 'p-cat-3',
    name: '财务管理与会计核算',
    children: [
      { id: 'p-cat-3-1', name: '会计核算与基础工作' },
      { id: 'p-cat-3-2', name: '支出管理' },
      { id: 'p-cat-3-3', name: '收入管理' },
      { id: 'p-cat-3-4', name: '资金管理' },
      { id: 'p-cat-3-5', name: '预算管理' }
    ]
  },
  {
    id: 'p-cat-4',
    name: '资产管理类',
    children: [
      { id: 'p-cat-4-1', name: '资产出租与处置' },
      { id: 'p-cat-4-2', name: '存货与出入库管理' }
    ]
  }
]
// PLACEHOLDER_MOCK

// ==================== 问题数据 ====================
// 模块级变量持久化
const problems: TypicalProblem[] = [
  {
    id: 'tp-1',
    categoryId: 'p-cat-3-5',
    category: '财务管理与会计核算 / 预算管理',
    description: '预算编制不科学，未按实际进度分年度编制，预算与实际支出严重脱节。',
    qualitativeBasis:
      '《预算法》第三十二条：各级预算应当根据年度经济社会发展目标、国家宏观调控总体要求和跨年度预算平衡的需要，参考上一年预算执行情况编制。',
    advice:
      '建议加强预算编制的科学性，按实际工程进度分年度编制建设项目预算，避免预算与实际支出严重脱节。',
    favorited: true
  },
  {
    id: 'tp-2',
    categoryId: 'p-cat-3-2',
    category: '财务管理与会计核算 / 支出管理',
    description: '"三公"经费支出管理不规范，存在超标准列支公务接待、公务用车费用的情形。',
    qualitativeBasis: '《党政机关厉行节约反对浪费条例》第十六条：严格控制"三公"经费规模和比例。',
    advice: '建议加强对"三公"经费的管理，严格控制公务接待、公务用车、因公出国（境）经费支出。',
    favorited: false
  },
  {
    id: 'tp-3',
    categoryId: 'p-cat-2-4',
    category: '内控评价类 / 关键业务活动控制',
    description: '公立医疗机构与社会资本合作举办营利性项目，存在变相出租、承包科室的情形。',
    qualitativeBasis:
      '《关于城市公立医院综合改革试点的指导意见》：公立医院不得与社会资本合作举办营利性医疗机构。',
    advice: '建议公立医疗机构不得与社会资本合作举办营利性项目，不得变相出租、承包科室。',
    favorited: true
  },
  {
    id: 'tp-4',
    categoryId: 'p-cat-2-4',
    category: '内控评价类 / 关键业务活动控制',
    description: '招标活动不规范，达到招标限额的项目未公开招标，存在化整为零规避招标的情形。',
    qualitativeBasis:
      '《招标投标法》第四条：任何单位和个人不得将依法必须进行招标的项目化整为零或者以其他任何方式规避招标。',
    advice: '建议严格执行公开招标程序，达到招标限额的项目必须公开招标，不得化整为零规避招标。',
    favorited: false
  },
  {
    id: 'tp-5',
    categoryId: 'p-cat-3-4',
    category: '财务管理与会计核算 / 资金管理',
    description: '专项资金使用不规范，存在截留、挪用、滞留专项资金的情形。',
    qualitativeBasis:
      '《财政违法行为处罚处分条例》第六条：截留、挪用财政资金的，责令改正并追究责任。',
    advice: '建议规范专项资金的使用与拨付，做到专款专用，不得截留、挪用、滞留。',
    favorited: false
  },
  {
    id: 'tp-6',
    categoryId: 'p-cat-3-1',
    category: '财务管理与会计核算 / 会计核算与基础工作',
    description: '财务报告真实性存疑，存在虚假列支、重复列支、隐匿收入等违规行为。',
    qualitativeBasis:
      '《会计法》第九条：各单位必须根据实际发生的经济业务事项进行会计核算，不得以虚假的经济业务事项进行会计核算。',
    advice: '建议加强财务报告的真实性审查，杜绝虚假列支、重复列支、隐匿收入等违规行为。',
    favorited: true
  },
  {
    id: 'tp-7',
    categoryId: 'p-cat-1-3',
    category: '科研管理 / 科研项目实施与过程管理',
    description: '科研项目立项论证不充分，未开展可行性研究即立项实施。',
    qualitativeBasis:
      '《科研项目管理办法》：重大科研项目立项前应开展可行性研究，包含技术、经济、风险等维度论证。',
    advice: '建议科研项目立项前必须开展可行性研究，可研报告应包含技术、经济、风险等多维度论证。',
    favorited: false
  },
  {
    id: 'tp-8',
    categoryId: 'p-cat-1-4',
    category: '科研管理 / 科研经费管理',
    description: '科研经费使用不规范，存在使用科研经费报销与项目无关支出的情形。',
    qualitativeBasis: '《科研经费管理办法》：科研经费应专款专用，不得用于与科研活动无关的支出。',
    advice: '建议规范科研经费使用，严格区分科研支出与非科研支出，不得报销与项目无关的费用。',
    favorited: false
  }
]
// PLACEHOLDER_MOCK_2

// 收集某分类及其所有子孙的 id
const getCategoryAndDescendantIds = (categoryId: string): Set<string> => {
  const ids = new Set<string>()
  const walk = (nodes: ProblemCategoryNode[], matched: boolean) => {
    for (const n of nodes) {
      const hit = matched || n.id === categoryId
      if (hit) ids.add(n.id)
      if (n.children?.length) walk(n.children, hit)
    }
  }
  walk(categoryTree, false)
  return ids
}

/** 获取问题分类树（含每节点 totalCount，前端递归计算） */
export async function getProblemCategoryTree() {
  await delay()
  // 递归回填每节点的问题总数（含子孙）
  const fill = (node: ProblemCategoryNode): number => {
    const idSet = getCategoryAndDescendantIds(node.id)
    const self = problems.filter((p) => idSet.has(p.categoryId)).length
    node.totalCount = self
    node.children?.forEach((c) => fill(c))
    return self
  }
  categoryTree.forEach((n) => fill(n))
  return { code: 200, message: '成功', data: categoryTree }
}

/** 典型问题分页列表（分类 / 关键词 / 收藏筛选） */
export async function getTypicalProblemList(params: TypicalProblemQuery) {
  await delay()
  let result = [...problems]

  // 按分类筛选（含子孙）
  if (params.categoryId) {
    const idSet = getCategoryAndDescendantIds(params.categoryId)
    result = result.filter((p) => idSet.has(p.categoryId))
  }

  // 关键词模糊匹配问题表述
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    result = result.filter((p) => p.description.toLowerCase().includes(kw))
  }

  // 仅看我的收藏
  if (params.onlyFavorite) {
    result = result.filter((p) => p.favorited)
  }

  const total = result.length
  const start = (params.page - 1) * params.pageSize
  const list = result.slice(start, start + params.pageSize)

  return { code: 200, message: '成功', data: { list, total } }
}

/** 切换收藏状态 */
export async function toggleProblemFavorite(id: string) {
  await delay(150)
  const target = problems.find((p) => p.id === id)
  if (!target) return { code: 404, message: '问题不存在', data: null }
  target.favorited = !target.favorited
  return { code: 200, message: '操作成功', data: { id, favorited: target.favorited } }
}
