/**
 * 法规推荐策略 Mock 数据
 * 接口：
 * - GET    /api/recommendation-strategy/global              获取全局策略
 * - PUT    /api/recommendation-strategy/global              更新全局策略
 * - GET    /api/recommendation-strategy/level-base-score    获取法规层级基准分
 * - PUT    /api/recommendation-strategy/level-base-score    更新法规层级基准分
 * - GET    /api/recommendation-strategy/domain-overrides    领域覆盖列表
 * - POST   /api/recommendation-strategy/domain-overrides    新增领域覆盖
 * - PUT    /api/recommendation-strategy/domain-overrides    更新领域覆盖
 * - DELETE /api/recommendation-strategy/domain-overrides    删除领域覆盖
 * - PATCH  /api/recommendation-strategy/domain-overrides    切换启用状态
 * - GET    /api/recommendation-strategy/synonyms            同义词列表
 * - POST   /api/recommendation-strategy/synonyms            新增同义词
 * - PUT    /api/recommendation-strategy/synonyms            更新同义词
 * - DELETE /api/recommendation-strategy/synonyms            删除同义词
 * - POST   /api/recommendation-strategy/experiment          推荐试验台
 */

import type {
  StrategyConfig,
  DomainOverride,
  LevelBaseScore,
  SynonymGroup,
  ExperimentRequest,
  ExperimentResultItem,
  RegulationLevel
} from '@/types/recommendation-strategy'

// 模拟接口延迟
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

// 当前时间字符串（mock 写入更新时间用）
const now = () => new Date().toLocaleString('zh-CN', { hour12: false })

// ==================== 全局策略 ====================
// 模块级变量持久化，页面切换不丢失
let globalStrategy: StrategyConfig = {
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
  tagFilter: ['财务', '采购', '医疗', '工程', '资产', '招投标'],
  llmRerankEnabled: true
}

/** 获取全局策略 */
export async function getGlobalStrategy() {
  await delay()
  return { code: 200, message: '成功', data: { ...globalStrategy } }
}

/** 更新全局策略（前端已做归一化） */
export async function updateGlobalStrategy(data: StrategyConfig) {
  await delay()
  globalStrategy = { ...data }
  return { code: 200, message: '保存成功', data: { ...globalStrategy } }
}

// ==================== 法规层级基准分 ====================
let levelBaseScore: LevelBaseScore = {
  law: 1.0,
  admin: 0.85,
  rule: 0.7,
  local: 0.6,
  normative: 0.5
}

/** 获取法规层级基准分 */
export async function getLevelBaseScore() {
  await delay()
  return { code: 200, message: '成功', data: { ...levelBaseScore } }
}

/** 更新法规层级基准分 */
export async function updateLevelBaseScore(data: LevelBaseScore) {
  await delay()
  levelBaseScore = { ...data }
  return { code: 200, message: '保存成功', data: { ...levelBaseScore } }
}

// ==================== 领域覆盖策略 ====================
let domainOverrideSeq = 2
const domainOverrides: DomainOverride[] = [
  {
    id: 1,
    domain: '财务',
    enabled: true,
    weights: {
      keywordMatch: 0.45,
      tagMatch: 0.3,
      levelPriority: 0.1,
      recency: 0.05,
      adoptionRate: 0.1
    },
    threshold: 0.55,
    topN: 5,
    regulationLevelFilter: ['law', 'admin', 'rule'],
    tagFilter: ['财务'],
    llmRerankEnabled: true,
    updatedAt: '2026-05-20 10:30:00'
  },
  {
    id: 2,
    domain: '采购',
    enabled: true,
    weights: {
      keywordMatch: 0.35,
      tagMatch: 0.35,
      levelPriority: 0.15,
      recency: 0.05,
      adoptionRate: 0.1
    },
    threshold: 0.6,
    topN: 6,
    regulationLevelFilter: ['law', 'admin', 'rule', 'normative'],
    tagFilter: ['采购', '招投标'],
    llmRerankEnabled: false,
    updatedAt: '2026-05-22 15:20:00'
  }
]

/** 领域覆盖列表（无分页，整体返回） */
export async function getDomainOverrideList() {
  await delay()
  return {
    code: 200,
    message: '成功',
    data: domainOverrides.map((o) => ({ ...o }))
  }
}

/** 新增领域覆盖（领域唯一） */
export async function addDomainOverride(data: Omit<DomainOverride, 'id' | 'updatedAt'>) {
  await delay()
  // 校验领域唯一
  if (domainOverrides.some((o) => o.domain === data.domain)) {
    return { code: 400, message: `领域「${data.domain}」已存在`, data: null }
  }
  const item: DomainOverride = {
    ...data,
    id: ++domainOverrideSeq,
    updatedAt: now()
  }
  domainOverrides.push(item)
  return { code: 200, message: '新增成功', data: { ...item } }
}

/** 更新领域覆盖 */
export async function updateDomainOverride(data: DomainOverride) {
  await delay()
  const idx = domainOverrides.findIndex((o) => o.id === data.id)
  if (idx === -1) return { code: 404, message: '记录不存在', data: null }
  // 校验领域唯一（排除自身）
  if (domainOverrides.some((o) => o.domain === data.domain && o.id !== data.id)) {
    return { code: 400, message: `领域「${data.domain}」已存在`, data: null }
  }
  domainOverrides[idx] = { ...data, updatedAt: now() }
  return { code: 200, message: '更新成功', data: { ...domainOverrides[idx] } }
}

/** 删除领域覆盖 */
export async function deleteDomainOverride(id: number) {
  await delay()
  const idx = domainOverrides.findIndex((o) => o.id === id)
  if (idx === -1) return { code: 404, message: '记录不存在', data: null }
  domainOverrides.splice(idx, 1)
  return { code: 200, message: '删除成功', data: null }
}

/** 切换启用状态 */
export async function toggleDomainOverride(id: number, enabled: boolean) {
  await delay()
  const item = domainOverrides.find((o) => o.id === id)
  if (!item) return { code: 404, message: '记录不存在', data: null }
  item.enabled = enabled
  item.updatedAt = now()
  return { code: 200, message: enabled ? '已启用' : '已停用', data: { ...item } }
}

// ==================== 同义词表 ====================
let synonymSeq = 4
const synonyms: SynonymGroup[] = [
  {
    id: 1,
    canonical: '三公经费',
    aliases: ['公车私用', '公款吃喝', '公款旅游'],
    domain: '财务',
    updatedAt: '2026-05-18 09:00:00'
  },
  {
    id: 2,
    canonical: '违规招投标',
    aliases: ['围标', '串标', '陪标', '虚假招标'],
    domain: '招投标',
    updatedAt: '2026-05-19 14:20:00'
  },
  {
    id: 3,
    canonical: '资产流失',
    aliases: ['国有资产流失', '资产闲置', '资产损毁'],
    domain: '资产',
    updatedAt: '2026-05-21 11:15:00'
  },
  {
    id: 4,
    canonical: '医疗合作违规',
    aliases: ['院中院', '科室外包', '违规承包'],
    domain: '医疗',
    updatedAt: '2026-05-23 16:40:00'
  }
]

/** 同义词列表（按领域筛选可选） */
export async function getSynonymList(params: { keyword?: string; domain?: string }) {
  await delay()
  let result = synonyms.map((s) => ({ ...s }))
  // 关键词模糊匹配（标准词或同义词命中即可）
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    result = result.filter(
      (s) =>
        s.canonical.toLowerCase().includes(kw) ||
        s.aliases.some((a) => a.toLowerCase().includes(kw))
    )
  }
  if (params.domain) result = result.filter((s) => s.domain === params.domain)
  return { code: 200, message: '成功', data: result }
}

/** 新增同义词组（标准词唯一） */
export async function addSynonym(data: Omit<SynonymGroup, 'id' | 'updatedAt'>) {
  await delay()
  if (synonyms.some((s) => s.canonical === data.canonical)) {
    return { code: 400, message: `标准词「${data.canonical}」已存在`, data: null }
  }
  const item: SynonymGroup = { ...data, id: ++synonymSeq, updatedAt: now() }
  synonyms.push(item)
  return { code: 200, message: '新增成功', data: { ...item } }
}

/** 更新同义词组 */
export async function updateSynonym(data: SynonymGroup) {
  await delay()
  const idx = synonyms.findIndex((s) => s.id === data.id)
  if (idx === -1) return { code: 404, message: '记录不存在', data: null }
  if (synonyms.some((s) => s.canonical === data.canonical && s.id !== data.id)) {
    return { code: 400, message: `标准词「${data.canonical}」已存在`, data: null }
  }
  synonyms[idx] = { ...data, updatedAt: now() }
  return { code: 200, message: '更新成功', data: { ...synonyms[idx] } }
}

/** 删除同义词组 */
export async function deleteSynonym(id: number) {
  await delay()
  const idx = synonyms.findIndex((s) => s.id === id)
  if (idx === -1) return { code: 404, message: '记录不存在', data: null }
  synonyms.splice(idx, 1)
  return { code: 200, message: '删除成功', data: null }
}

// ==================== 推荐试验台 ====================
// 预置候选条款（试推荐时基于关键词与标签命中后做打分，标签来自法规条本身）
interface MockClause {
  regulationName: string
  articleNo: string
  articleText: string
  level: RegulationLevel
  year: number
  /** 法规条自带的业务标签 */
  tags: string[]
  keywords: string[]
  /** 历史采纳率 0~1 */
  adoptionRate: number
}

const mockClauses: MockClause[] = [
  {
    regulationName: '中华人民共和国预算法',
    articleNo: '第五十七条',
    articleText: '各级政府、各部门、各单位的支出必须按照预算执行，不得虚假列支，不得擅自改变用途。',
    level: 'law',
    year: 2018,
    tags: ['财务'],
    keywords: ['预算', '支出', '虚假', '列支', '三公经费', '公款'],
    adoptionRate: 0.82
  },
  {
    regulationName: '中华人民共和国政府采购法',
    articleNo: '第七十一条',
    articleText:
      '采购人、采购代理机构有下列情形之一的，责令限期改正，给予警告，可以并处罚款：（一）应当采用公开招标方式而擅自采用其他方式采购的……',
    level: 'law',
    year: 2014,
    tags: ['采购', '招投标'],
    keywords: ['采购', '招标', '公开招标', '违规', '围标', '串标'],
    adoptionRate: 0.75
  },
  {
    regulationName: '中华人民共和国招标投标法',
    articleNo: '第五十三条',
    articleText:
      '投标人相互串通投标或者与招标人串通投标的，投标人以向招标人或者评标委员会成员行贿的手段谋取中标的，中标无效，处中标项目金额千分之五以上千分之十以下的罚款……',
    level: 'law',
    year: 2017,
    tags: ['招投标', '采购'],
    keywords: ['串通', '投标', '中标', '陪标', '围标', '招标'],
    adoptionRate: 0.78
  },
  {
    regulationName: '基本医疗卫生与健康促进法',
    articleNo: '第四十条第三款',
    articleText:
      '政府举办的医疗卫生机构不得与社会资本合作举办营利性医疗卫生机构，不得使用国有资产参与举办营利性医疗卫生机构。',
    level: 'law',
    year: 2020,
    tags: ['医疗'],
    keywords: ['公立医院', '院中院', '合作', '营利性', '科室', '社会资本'],
    adoptionRate: 0.88
  },
  {
    regulationName: '行政事业性国有资产管理条例',
    articleNo: '第二十六条',
    articleText:
      '行政事业单位应当加强国有资产的日常管理，建立资产清查盘点制度，定期清查盘点，做到账实相符。',
    level: 'admin',
    year: 2021,
    tags: ['资产', '财务'],
    keywords: ['资产', '清查', '盘点', '账实相符', '国有资产', '流失'],
    adoptionRate: 0.7
  },
  {
    regulationName: '财政违法行为处罚处分条例',
    articleNo: '第六条',
    articleText:
      '财政收入执收单位及其工作人员违反规定将应当上缴的财政收入截留、占用、挪用或者私分的，责令改正，调整有关会计账目……',
    level: 'admin',
    year: 2011,
    tags: ['财务'],
    keywords: ['财政收入', '挪用', '截留', '私分', '上缴'],
    adoptionRate: 0.65
  },
  {
    regulationName: '关于党政机关厉行节约反对浪费条例',
    articleNo: '第十二条',
    articleText:
      '严格控制公务接待范围和标准，不得用公款大吃大喝，不得用公款支付应由个人负担的费用。',
    level: 'normative',
    year: 2013,
    tags: ['财务'],
    keywords: ['公务接待', '公款', '三公经费', '吃喝', '浪费'],
    adoptionRate: 0.58
  },
  {
    regulationName: '关于城镇医疗机构分类管理的实施意见',
    articleNo: '第三条第7项',
    articleText: '非营利性医疗机构不得变相出租、承包科室，不得与社会资本合作举办营利性项目。',
    level: 'normative',
    year: 2000,
    tags: ['医疗'],
    keywords: ['医疗机构', '出租', '承包', '科室', '院中院', '营利'],
    adoptionRate: 0.72
  }
]

/**
 * 推荐试验台核心算法（mock 版）
 * 1) 抽关键词 → 候选召回
 * 2) 5 维打分 → 阈值过滤
 * 3) 按 score 降序，取 Top N
 */
export async function runExperiment(req: ExperimentRequest) {
  await delay(500)
  const { problemDescription, tagHint, draftStrategy, levelBaseScore: lbs } = req

  if (!problemDescription || !problemDescription.trim()) {
    return { code: 400, message: '问题描述不能为空', data: [] }
  }

  // 简单分词：标点切分 + 长度过滤
  const text = problemDescription.toLowerCase()
  const tokens = text
    .split(/[\s,，。.;；、:：!！?？()（）"'""\\/]+/)
    .filter((t) => t && t.length >= 2)

  // 当前年份用于 recency 归一化
  const currentYear = new Date().getFullYear()

  // 候选召回：层级过滤 + 标签过滤 + 命中关键词或标签
  const candidates = mockClauses.filter((c) => {
    if (!draftStrategy.regulationLevelFilter.includes(c.level)) return false
    if (
      draftStrategy.tagFilter.length > 0 &&
      !c.tags.some((t) => draftStrategy.tagFilter.includes(t))
    ) {
      return false
    }
    // 命中检查：关键词命中或标签命中
    const keywordHit = c.keywords.some(
      (kw) => text.includes(kw) || tokens.some((t) => kw.includes(t))
    )
    const tagHit = tagHint ? c.tags.includes(tagHint) : false
    return keywordHit || tagHit
  })

  // 各维度打分（0~1），再乘以归一化后的权重
  const scored: ExperimentResultItem[] = candidates.map((c) => {
    const hits = c.keywords.filter(
      (kw) => text.includes(kw) || tokens.some((t) => kw.includes(t))
    ).length
    const keywordMatchRaw = Math.min(1, hits / Math.max(1, Math.min(c.keywords.length, 4)))
    // 标签匹配：命中 tagHint 满分，未命中但有标签给基础分
    const tagMatchRaw = tagHint && c.tags.includes(tagHint) ? 1 : c.tags.length ? 0.4 : 0
    const levelPriorityRaw = lbs[c.level] ?? 0.5
    // 颁布年份新旧：1990~currentYear 归一化
    const recencyRaw = Math.max(0, Math.min(1, (c.year - 1990) / (currentYear - 1990)))
    const adoptionRateRaw = c.adoptionRate

    const w = draftStrategy.weights
    const breakdown = {
      keywordMatch: keywordMatchRaw * w.keywordMatch,
      tagMatch: tagMatchRaw * w.tagMatch,
      levelPriority: levelPriorityRaw * w.levelPriority,
      recency: recencyRaw * w.recency,
      adoptionRate: adoptionRateRaw * w.adoptionRate
    }
    const score =
      breakdown.keywordMatch +
      breakdown.tagMatch +
      breakdown.levelPriority +
      breakdown.recency +
      breakdown.adoptionRate

    return {
      regulationName: c.regulationName,
      articleNo: c.articleNo,
      articleText: c.articleText,
      level: c.level,
      year: c.year,
      score: Math.round(score * 1000) / 1000,
      scoreBreakdown: {
        keywordMatch: Math.round(breakdown.keywordMatch * 1000) / 1000,
        tagMatch: Math.round(breakdown.tagMatch * 1000) / 1000,
        levelPriority: Math.round(breakdown.levelPriority * 1000) / 1000,
        recency: Math.round(breakdown.recency * 1000) / 1000,
        adoptionRate: Math.round(breakdown.adoptionRate * 1000) / 1000
      },
      reason:
        hits > 0
          ? `命中关键词 ${hits} 项${tagHint && c.tags.includes(tagHint) ? '，且标签匹配' : ''}`
          : '标签匹配命中'
    }
  })

  // 阈值过滤：低于 threshold 时放宽到 threshold/2 取 Top 3，并标注低相关度
  let filtered = scored.filter((s) => s.score >= draftStrategy.threshold)
  let lowConfidence = false
  if (filtered.length === 0 && scored.length > 0) {
    filtered = scored.filter((s) => s.score >= draftStrategy.threshold / 2).slice(0, 3)
    lowConfidence = true
  }
  filtered.sort((a, b) => b.score - a.score)
  const topResults = filtered.slice(0, draftStrategy.topN)

  return {
    code: 200,
    message: lowConfidence ? '低相关度结果，建议人工确认' : '成功',
    data: topResults
  }
}
