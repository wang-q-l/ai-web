/**
 * 法规推荐策略 Mock 数据（简化版）
 * 接口：
 * - GET    /api/recommendation-strategy/global       获取全局策略
 * - PUT    /api/recommendation-strategy/global       更新全局策略
 * - POST   /api/recommendation-strategy/experiment   推荐试验台
 */

import type {
  StrategyConfig,
  Clause,
  ProblemCase,
  ExperimentRequest,
  ExperimentResultItem,
  OccurrencePeriod,
  TemporalStatus,
  PredecessorClause
} from '@/types/recommendation-strategy'

// 模拟接口延迟
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

// ==================== 全局策略 ====================
// 模块级变量持久化，页面切换不丢失
let globalStrategy: StrategyConfig = {
  weights: {
    keywordMatch: 0.4,
    caseMatch: 0.4,
    recency: 0.2
  },
  threshold: 0.5,
  topN: 5
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

// ==================== 法规库 ====================
const mockClauses: Clause[] = [
  {
    id: 'clause-001',
    regulationName: '中华人民共和国预算法',
    articleNo: '第五十七条',
    articleText: '各级政府、各部门、各单位的支出必须按照预算执行，不得虚假列支，不得擅自改变用途。',
    year: 2018,
    effectiveDate: '2018-12-29',
    keywords: ['预算', '支出', '虚假', '列支', '三公经费', '公款']
  },
  {
    id: 'clause-002',
    regulationName: '中华人民共和国政府采购法',
    articleNo: '第七十一条',
    articleText:
      '采购人、采购代理机构有下列情形之一的，责令限期改正，给予警告，可以并处罚款：（一）应当采用公开招标方式而擅自采用其他方式采购的……',
    year: 2014,
    effectiveDate: '2003-01-01',
    keywords: ['采购', '招标', '公开招标', '违规', '围标', '串标']
  },
  {
    id: 'clause-003',
    regulationName: '中华人民共和国招标投标法',
    articleNo: '第五十三条',
    articleText:
      '投标人相互串通投标或者与招标人串通投标的，投标人以向招标人或者评标委员会成员行贿的手段谋取中标的，中标无效，处中标项目金额千分之五以上千分之十以下的罚款……',
    year: 2017,
    effectiveDate: '2000-01-01',
    keywords: ['串通', '投标', '中标', '陪标', '围标', '招标']
  },
  {
    id: 'clause-004',
    regulationName: '基本医疗卫生与健康促进法',
    articleNo: '第四十条第三款',
    articleText:
      '政府举办的医疗卫生机构不得与社会资本合作举办营利性医疗卫生机构，不得使用国有资产参与举办营利性医疗卫生机构。',
    year: 2020,
    effectiveDate: '2020-06-01',
    supersedes: ['clause-008'],
    keywords: ['公立医院', '院中院', '合作', '营利性', '科室', '社会资本']
  },
  {
    id: 'clause-005',
    regulationName: '行政事业性国有资产管理条例',
    articleNo: '第二十六条',
    articleText:
      '行政事业单位应当加强国有资产的日常管理，建立资产清查盘点制度，定期清查盘点，做到账实相符。',
    year: 2021,
    effectiveDate: '2021-04-01',
    keywords: ['资产', '清查', '盘点', '账实相符', '国有资产', '流失']
  },
  {
    id: 'clause-006',
    regulationName: '财政违法行为处罚处分条例',
    articleNo: '第六条',
    articleText:
      '财政收入执收单位及其工作人员违反规定将应当上缴的财政收入截留、占用、挪用或者私分的，责令改正，调整有关会计账目……',
    year: 2011,
    effectiveDate: '2005-02-01',
    keywords: ['财政收入', '挪用', '截留', '私分', '上缴']
  },
  {
    id: 'clause-007',
    regulationName: '关于党政机关厉行节约反对浪费条例',
    articleNo: '第十二条',
    articleText:
      '严格控制公务接待范围和标准，不得用公款大吃大喝，不得用公款支付应由个人负担的费用。',
    year: 2013,
    effectiveDate: '2013-11-25',
    keywords: ['公务接待', '公款', '三公经费', '吃喝', '浪费']
  },
  {
    id: 'clause-008',
    regulationName: '关于城镇医疗机构分类管理的实施意见',
    articleNo: '第三条第7项',
    articleText: '非营利性医疗机构不得变相出租、承包科室，不得与社会资本合作举办营利性项目。',
    year: 2000,
    effectiveDate: '2000-09-15',
    supersededBy: 'clause-004',
    keywords: ['医疗机构', '出租', '承包', '科室', '院中院', '营利']
  }
]

// ==================== 历史问题案例库 ====================
const mockHistoryCases: ProblemCase[] = [
  {
    id: 'case-001',
    problemDescription: '某市医院出租科室给私营公司经营',
    citedClauseIds: ['clause-004', 'clause-008'],
    createdAt: '2026-04-10 10:00:00'
  },
  {
    id: 'case-002',
    problemDescription: '公立医院与社会资本合作设立营利性项目',
    citedClauseIds: ['clause-004'],
    createdAt: '2026-04-15 14:30:00'
  },
  {
    id: 'case-003',
    problemDescription: '医院承包科室违规',
    citedClauseIds: ['clause-008'],
    createdAt: '2026-04-20 09:15:00'
  },
  {
    id: 'case-004',
    problemDescription: '采购未走公开招标流程',
    citedClauseIds: ['clause-002', 'clause-003'],
    createdAt: '2026-04-22 11:30:00'
  },
  {
    id: 'case-005',
    problemDescription: '招投标过程中存在围标串标行为',
    citedClauseIds: ['clause-003', 'clause-002'],
    createdAt: '2026-04-25 15:00:00'
  },
  {
    id: 'case-006',
    problemDescription: '公款用于接待吃喝浪费',
    citedClauseIds: ['clause-007', 'clause-001'],
    createdAt: '2026-04-28 09:00:00'
  },
  {
    id: 'case-007',
    problemDescription: '财政资金被挪用截留',
    citedClauseIds: ['clause-006'],
    createdAt: '2026-05-05 16:20:00'
  },
  {
    id: 'case-008',
    problemDescription: '国有资产清查盘点不规范，账实不符',
    citedClauseIds: ['clause-005'],
    createdAt: '2026-05-10 10:45:00'
  }
]

// ==================== 推荐试验台 ====================

/**
 * mock 模拟 LLM 关键词识别：基于简单分词 + 内置同义词映射
 * 真实场景应调用大模型 API
 */
function mockLlmKeywordExtract(query: string): string[] {
  const text = query.toLowerCase()
  const tokens = text
    .split(/[\s,，。.;；、:：!！?？()（）"'""\\/-]+/)
    .filter((t) => t && t.length >= 2)

  // 内置一些常见同义词映射，模拟 LLM 的扩展能力
  const synonymMap: Record<string, string[]> = {
    医院: ['公立医院', '医疗机构'],
    科室: ['内设科室', '诊室', '院中院'],
    合作: ['联营', '承包', '外包'],
    营利: ['营利性', '商业化'],
    采购: ['招标', '招投标'],
    挪用: ['截留', '私分', '占用'],
    公款: ['三公经费', '公务接待']
  }

  const expanded = new Set(tokens)
  for (const token of tokens) {
    for (const [key, syns] of Object.entries(synonymMap)) {
      if (token.includes(key) || key.includes(token)) {
        syns.forEach((s) => expanded.add(s))
        expanded.add(key)
      }
    }
  }
  return Array.from(expanded)
}

/**
 * mock 模拟 LLM 时间抽取：用正则识别常见时间表达
 * 真实场景应调用大模型 API
 */
function mockLlmExtractOccurrence(query: string): OccurrencePeriod {
  const currentYear = new Date().getFullYear()

  // 模式 1：年份区间「2016-2018年」「2016年至2018年」「2016~2018年」
  const periodMatch = query.match(/(\d{4})\s*[-至到~~]\s*(\d{4})\s*年?/)
  if (periodMatch) {
    const startYear = parseInt(periodMatch[1])
    const endYear = parseInt(periodMatch[2])
    if (startYear >= 1990 && endYear <= currentYear + 1 && startYear <= endYear) {
      return {
        type: 'period',
        start: `${startYear}-01-01`,
        end: `${endYear}-12-31`,
        rawText: periodMatch[0],
        confidence: 0.95
      }
    }
  }

  // 模式 2：「2020年5月」精确到月
  const monthMatch = query.match(/(\d{4})\s*年\s*(\d{1,2})\s*月/)
  if (monthMatch) {
    const y = parseInt(monthMatch[1])
    const m = parseInt(monthMatch[2])
    if (y >= 1990 && y <= currentYear + 1 && m >= 1 && m <= 12) {
      const mm = String(m).padStart(2, '0')
      // 月末日期简化为 28 号（避免月份天数计算）
      return {
        type: 'point',
        start: `${y}-${mm}-01`,
        end: `${y}-${mm}-28`,
        rawText: monthMatch[0],
        confidence: 0.92
      }
    }
  }

  // 模式 3：单独年份「2018年」
  const yearMatch = query.match(/(\d{4})\s*年/)
  if (yearMatch) {
    const y = parseInt(yearMatch[1])
    if (y >= 1990 && y <= currentYear + 1) {
      return {
        type: 'point',
        start: `${y}-01-01`,
        end: `${y}-12-31`,
        rawText: yearMatch[0],
        confidence: 0.85
      }
    }
  }

  // 模式 4：模糊表达
  if (/去年/.test(query)) {
    const y = currentYear - 1
    return {
      type: 'point',
      start: `${y}-01-01`,
      end: `${y}-12-31`,
      rawText: '去年',
      confidence: 0.65
    }
  }
  if (/前年/.test(query)) {
    const y = currentYear - 2
    return {
      type: 'point',
      start: `${y}-01-01`,
      end: `${y}-12-31`,
      rawText: '前年',
      confidence: 0.65
    }
  }
  const recentNMatch = query.match(/近\s*([一二三四五六七八九十\d])\s*年/)
  if (recentNMatch) {
    const numMap: Record<string, number> = {
      一: 1,
      二: 2,
      三: 3,
      四: 4,
      五: 5,
      六: 6,
      七: 7,
      八: 8,
      九: 9,
      十: 10
    }
    const n = numMap[recentNMatch[1]] ?? parseInt(recentNMatch[1])
    if (n >= 1 && n <= 10) {
      return {
        type: 'period',
        start: `${currentYear - n}-01-01`,
        end: `${currentYear}-12-31`,
        rawText: recentNMatch[0],
        confidence: 0.6
      }
    }
  }

  return {
    type: 'unknown',
    start: '',
    end: '',
    rawText: '',
    confidence: 0
  }
}

/**
 * 时效校验：比对问题发生时间与法规生效日期
 */
function checkTemporal(
  occurrence: OccurrencePeriod,
  clause: Clause,
  clauseDb: Clause[]
): {
  status: TemporalStatus
  predecessors?: PredecessorClause[]
  partialHint?: string
} {
  if (occurrence.type === 'unknown') return { status: 'skipped' }

  const ce = clause.effectiveDate || `${clause.year}-01-01`
  const ps = occurrence.start
  const pe = occurrence.end

  // 法规生效早于问题最早期，全程有效
  if (ce <= ps) return { status: 'valid' }

  // 法规生效落在问题区间内，部分冲突
  if (ce <= pe) {
    return {
      status: 'partial',
      partialHint: `${ps} 至 ${ce} 期间该法规未生效，建议结合前身法规分段定性；${ce} 之后可使用本法规。`
    }
  }

  // 全程冲突：查找前身
  const predecessors = (clause.supersedes ?? [])
    .map((id) => clauseDb.find((c) => c.id === id))
    .filter((c): c is Clause => Boolean(c))
    .filter((c) => (c.effectiveDate || `${c.year}-01-01`) <= ps)
    .map((c) => ({
      id: c.id,
      regulationName: c.regulationName,
      articleNo: c.articleNo,
      articleText: c.articleText,
      year: c.year,
      effectiveDate: c.effectiveDate
    }))

  if (predecessors.length > 0) {
    return { status: 'conflict-with-replacement', predecessors }
  }
  return { status: 'conflict-no-replacement' }
}

/**
 * mock 模拟 LLM 找历史相似案例：基于关键词重合度
 * 真实场景应调用大模型做语义相似度
 */
function mockLlmFindSimilarCases(
  query: string,
  cases: ProblemCase[],
  topN = 5,
  minSimilarity = 0.3
) {
  const queryTokens = new Set(mockLlmKeywordExtract(query))

  return cases
    .map((c) => {
      const caseTokens = new Set(mockLlmKeywordExtract(c.problemDescription))
      // Jaccard 相似度（两个集合交集 / 并集）
      const intersection = [...queryTokens].filter((t) => caseTokens.has(t)).length
      const union = new Set([...queryTokens, ...caseTokens]).size
      const similarity = union > 0 ? intersection / union : 0
      return { case: c, similarity }
    })
    .filter((x) => x.similarity >= minSimilarity)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topN)
}

/**
 * 推荐试验台核心算法（简化版）
 * 1) LLM 抽取扩展关键词
 * 2) LLM 找历史相似案例
 * 3) 候选召回（关键词命中）
 * 4) 三维度打分
 * 5) 阈值过滤 + Top N
 */
export async function runExperiment(req: ExperimentRequest) {
  await delay(500)
  const { problemDescription, draftStrategy } = req

  if (!problemDescription || !problemDescription.trim()) {
    return { code: 400, message: '问题描述不能为空', data: [], occurrence: null }
  }

  // ① 问题理解：关键词识别 + 时间抽取（mock LLM）
  const expandedTokens = mockLlmKeywordExtract(problemDescription)
  const occurrence = mockLlmExtractOccurrence(problemDescription)

  // 找历史相似案例（支撑维度 2）
  const similarCases = mockLlmFindSimilarCases(problemDescription, mockHistoryCases, 5, 0.2)

  // 构建"法规命中权重表"：法规 ID → 累计权重
  const caseHitWeight = new Map<string, number>()
  for (const sc of similarCases) {
    for (const clauseId of sc.case.citedClauseIds) {
      const prev = caseHitWeight.get(clauseId) ?? 0
      caseHitWeight.set(clauseId, prev + sc.similarity)
    }
  }
  const maxCaseWeight = Math.max(...Array.from(caseHitWeight.values()), 1)

  // ② 候选召回：关键词命中即纳入候选
  const text = problemDescription.toLowerCase()
  const candidates = mockClauses.filter((c) => {
    return c.keywords.some(
      (kw) => text.includes(kw) || expandedTokens.some((t) => kw.includes(t) || t.includes(kw))
    )
  })

  // 候选超过 200 截断
  const limited = candidates.length > 200 ? candidates.slice(0, 200) : candidates

  // 当前年份用于 recency 归一化
  const currentYear = new Date().getFullYear()

  // ③ 三维度打分
  const scored: ExperimentResultItem[] = limited.map((c) => {
    // 维度 1：关键词匹配
    const hits = c.keywords.filter(
      (kw) => text.includes(kw) || expandedTokens.some((t) => kw.includes(t) || t.includes(kw))
    ).length
    const keywordMatchRaw = Math.min(1, hits / Math.max(1, Math.min(c.keywords.length, 4)))

    // 维度 2：问题案例匹配
    const caseMatchRaw = (caseHitWeight.get(c.id) ?? 0) / maxCaseWeight

    // 维度 3：颁布年份新旧
    const recencyRaw = Math.max(0, Math.min(1, (c.year - 1990) / (currentYear - 1990)))

    const w = draftStrategy.weights
    const breakdown = {
      keywordMatch: keywordMatchRaw * w.keywordMatch,
      caseMatch: caseMatchRaw * w.caseMatch,
      recency: recencyRaw * w.recency
    }
    const score = breakdown.keywordMatch + breakdown.caseMatch + breakdown.recency

    // 适用理由
    let reason = '综合相关度较高'
    if (caseMatchRaw > 0.7) {
      reason = '历史相似案例频繁引用'
    } else if (hits >= 3) {
      reason = `命中关键词 ${hits} 项，高度相关`
    } else if (hits > 0) {
      reason = `命中关键词 ${hits} 项`
    }

    return {
      id: c.id,
      regulationName: c.regulationName,
      articleNo: c.articleNo,
      articleText: c.articleText,
      year: c.year,
      effectiveDate: c.effectiveDate,
      score: Math.round(score * 1000) / 1000,
      scoreBreakdown: {
        keywordMatch: Math.round(breakdown.keywordMatch * 1000) / 1000,
        caseMatch: Math.round(breakdown.caseMatch * 1000) / 1000,
        recency: Math.round(breakdown.recency * 1000) / 1000
      },
      reason
    }
  })

  // ④ 阈值过滤 + 兜底
  let filtered = scored.filter((s) => s.score >= draftStrategy.threshold)
  let lowConfidence = false
  if (filtered.length === 0 && scored.length > 0) {
    filtered = scored.filter((s) => s.score >= draftStrategy.threshold / 2).slice(0, 3)
    lowConfidence = true
    filtered.forEach((f) => (f.lowConfidence = true))
  }
  filtered.sort((a, b) => b.score - a.score)
  const topResults = filtered.slice(0, draftStrategy.topN)

  // ⑤ 时效校验：按问题发生时间比对法规生效日期
  const temporalSummary = { valid: 0, partial: 0, conflict: 0, skipped: 0 }
  for (const item of topResults) {
    const clause = mockClauses.find((c) => c.id === item.id)
    if (!clause) continue
    const tc = checkTemporal(occurrence, clause, mockClauses)
    item.temporalStatus = tc.status
    item.predecessors = tc.predecessors
    item.partialHint = tc.partialHint
    if (tc.status === 'valid') temporalSummary.valid++
    else if (tc.status === 'partial') temporalSummary.partial++
    else if (tc.status === 'skipped') temporalSummary.skipped++
    else temporalSummary.conflict++
  }

  return {
    code: 200,
    message: lowConfidence ? '低相关度结果，建议人工确认' : '成功',
    data: topResults,
    occurrence,
    temporalSummary
  }
}
