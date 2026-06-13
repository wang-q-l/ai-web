/**
 * 知识中心 - 法规库 Mock 数据
 * 接口：
 * - GET /api/knowledge/regulation/list             法规分页列表（多维过滤 + 排序）
 * - GET /api/knowledge/regulation/year-facets      可选年份列表（按当前过滤条件）
 * - GET /api/knowledge/regulation/{id}             法规详情
 */
import type {
  KnowledgeRegulation,
  RegulationListQuery,
  RegulationLevel,
  EffectStatus
} from '@/types/knowledge-regulation'

// 模拟接口延迟
const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms))

// ==================== 全文模板生成器 ====================
// 真实环境从知识中心拉取文件流；mock 阶段按法规名拼出有真实感的全文
// 截取自《社会保险法》第一章作为通用模板的语言风格参考
function buildFullText(name: string, summary?: string): string {
  return `第一章 总则

第一条 为了规范${name.replace(/^中华人民共和国/, '')}相关活动，维护当事人的合法权益，促进社会和谐稳定，根据宪法，制定本法。

第二条 国家建立健全相关制度，保障公民、法人和其他组织的合法权益，依法从国家和社会获得相应的权利。

第三条 本法制度坚持广覆盖、保基本、多层次、可持续的方针，相关水平应当与经济社会发展水平相适应。

第四条 中华人民共和国境内的用人单位和个人依法履行本法规定的义务，有权查询相关记录，要求经办机构提供咨询等相关服务。

个人依法享受本法规定的待遇，有权监督本单位为其履行本法规定义务的情况。

第五条 县级以上人民政府将本法规定事项纳入国民经济和社会发展规划。

国家多渠道筹集资金。县级以上人民政府对本法规定事项给予必要的经费支持。

国家通过税收优惠政策支持本法规定事业。

第六条 国家对相关基金实行严格监管。

国务院和省、自治区、直辖市人民政府建立健全监督管理制度，保障基金安全、有效运行。

县级以上人民政府采取措施，鼓励和支持社会各方面参与监督。

第二章 主要规定

第七条 国务院相关行政部门负责全国的管理工作，国务院其他有关部门在各自的职责范围内负责有关工作。

县级以上地方人民政府相关行政部门负责本行政区域的管理工作，县级以上地方人民政府其他有关部门在各自的职责范围内负责有关工作。

第八条 经办机构提供相关服务，负责登记、个人权益记录、待遇支付等工作。

第九条 工会依法维护职工的合法权益，有权参与本法重大事项的研究，参加监督委员会，对与职工权益有关的事项进行监督。${
    summary
      ? `

第十条 ${summary.replace(/^第[一二三四五六七八九十百零\d]+条\s*/, '')}`
      : ''
  }

第十一条 违反本法规定的，由有关行政部门责令限期改正；逾期不改正的，对单位处以罚款，对负责的主管人员和其他直接责任人员依法给予处分。

第十二条 本法自公布之日起施行。`
}

// ==================== 法规库 ====================
// 20+ 部法规，覆盖 6 个类型 + 3 种时效性 + 内外部位阶
const regulations: KnowledgeRegulation[] = [
  // ===== 外部 · 法律 =====
  {
    id: 'kr-001',
    name: '中华人民共和国预算法',
    hierarchy: 'external',
    level: 'law',
    status: 'active',
    promulgationDate: '2018-12-29',
    effectiveDate: '2018-12-29',
    promulgationOrg: '全国人民代表大会常务委员会',
    year: 2018,
    docNo: '012',
    summary:
      '第五十七条 各级政府、各部门、各单位的支出必须按照预算执行，不得虚假列支，不得擅自改变用途。',
    fileUrl: '/mock-files/regulation/kr-001.html'
  },
  {
    id: 'kr-002',
    name: '中华人民共和国政府采购法',
    hierarchy: 'external',
    level: 'law',
    status: 'active',
    promulgationDate: '2014-08-31',
    effectiveDate: '2003-01-01',
    promulgationOrg: '全国人民代表大会常务委员会',
    year: 2014,
    docNo: '008',
    summary:
      '第七十一条 采购人、采购代理机构应当采用公开招标方式而擅自采用其他方式采购的，责令限期改正……',
    fileUrl: '/mock-files/regulation/kr-002.html'
  },
  {
    // 社保法（含真实第一章全文样例）
    id: 'kr-006',
    name: '中华人民共和国社会保险法',
    hierarchy: 'external',
    level: 'law',
    status: 'active',
    promulgationDate: '2010-10-28',
    effectiveDate: '2011-07-01',
    promulgationOrg: '全国人民代表大会常务委员会',
    year: 2010,
    docNo: '035',
    summary:
      '第十六条 职工因工作原因受到事故伤害或者患职业病，且经工伤认定的，享受工伤保险待遇；其依法享受社会保险待遇。',
    fileUrl: '/mock-files/regulation/kr-006.html',
    fullText: `第一章 总则

第一条 为了规范社会保险关系，维护公民参加社会保险和享受社会保险待遇的合法权益，使公民共享发展成果，促进社会和谐稳定，根据宪法，制定本法。

第二条 国家建立基本养老保险、基本医疗保险、工伤保险、失业保险、生育保险等社会保险制度，保障公民在年老、疾病、工伤、失业、生育等情况下依法从国家和社会获得物质帮助的权利。

第三条 社会保险制度坚持广覆盖、保基本、多层次、可持续的方针，社会保险水平应当与经济社会发展水平相适应。

第四条 中华人民共和国境内的用人单位和个人依法缴纳社会保险费，有权查询缴费记录、个人权益记录，要求社会保险经办机构提供社会保险咨询等相关服务。

个人依法享受社会保险待遇，有权监督本单位为其缴费情况。

第五条 县级以上人民政府将社会保险事业纳入国民经济和社会发展规划。

国家多渠道筹集社会保险资金。县级以上人民政府对社会保险事业给予必要的经费支持。

国家通过税收优惠政策支持社会保险事业。

第六条 国家对社会保险基金实行严格监管。

国务院和省、自治区、直辖市人民政府建立健全社会保险基金监督管理制度，保障社会保险基金安全、有效运行。

县级以上人民政府采取措施，鼓励和支持社会各方面参与社会保险基金的监督。

第七条 国务院社会保险行政部门负责全国的社会保险管理工作，国务院其他有关部门在各自的职责范围内负责有关的社会保险工作。

县级以上地方人民政府社会保险行政部门负责本行政区域的社会保险管理工作，县级以上地方人民政府其他有关部门在各自的职责范围内负责有关的社会保险工作。

第八条 社会保险经办机构提供社会保险服务，负责社会保险登记、个人权益记录、社会保险待遇支付等工作。

第九条 工会依法维护职工的合法权益，有权参与社会保险重大事项的研究，参加社会保险监督委员会，对与职工社会保险权益有关的事项进行监督。`
  },
  {
    id: 'kr-003',
    name: '中华人民共和国招标投标法',
    hierarchy: 'external',
    level: 'law',
    status: 'active',
    promulgationDate: '2017-12-27',
    effectiveDate: '2000-01-01',
    promulgationOrg: '全国人民代表大会常务委员会',
    year: 2017,
    docNo: '021',
    summary:
      '第五十三条 投标人相互串通投标或者与招标人串通投标的……中标无效，处中标项目金额千分之五以上千分之十以下罚款。',
    fileUrl: '/mock-files/regulation/kr-003.html'
  },
  {
    id: 'kr-004',
    name: '中华人民共和国基本医疗卫生与健康促进法',
    hierarchy: 'external',
    level: 'law',
    status: 'active',
    promulgationDate: '2019-12-28',
    effectiveDate: '2020-06-01',
    promulgationOrg: '全国人民代表大会常务委员会',
    year: 2019,
    docNo: '040',
    summary: '第四十条 政府举办的医疗卫生机构不得与社会资本合作举办营利性医疗卫生机构。',
    fileUrl: '/mock-files/regulation/kr-004.html'
  },
  {
    id: 'kr-005',
    name: '中华人民共和国会计法（旧版）',
    hierarchy: 'external',
    level: 'law',
    status: 'repealed',
    promulgationDate: '1999-10-31',
    effectiveDate: '2000-07-01',
    repealedDate: '2024-07-01',
    promulgationOrg: '全国人民代表大会常务委员会',
    year: 1999,
    docNo: '003',
    summary: '本版已废止，请参见 2024 年新版会计法。',
    fileUrl: '/mock-files/regulation/kr-005.html'
  },

  // ===== 外部 · 行政法规 =====
  {
    id: 'kr-101',
    name: '行政事业性国有资产管理条例',
    hierarchy: 'external',
    level: 'admin',
    status: 'active',
    promulgationDate: '2021-02-26',
    effectiveDate: '2021-04-01',
    promulgationOrg: '国务院',
    year: 2021,
    docNo: '738',
    summary:
      '第二十六条 行政事业单位应当加强国有资产的日常管理，建立资产清查盘点制度，做到账实相符。',
    fileUrl: '/mock-files/regulation/kr-101.html'
  },
  {
    id: 'kr-102',
    name: '财政违法行为处罚处分条例',
    hierarchy: 'external',
    level: 'admin',
    status: 'active',
    promulgationDate: '2004-11-30',
    effectiveDate: '2005-02-01',
    promulgationOrg: '国务院',
    year: 2004,
    docNo: '427',
    summary: '第六条 财政收入执收单位将应当上缴的财政收入截留、占用、挪用或者私分的，责令改正。',
    fileUrl: '/mock-files/regulation/kr-102.html'
  },
  {
    id: 'kr-103',
    name: '中华人民共和国政府信息公开条例',
    hierarchy: 'external',
    level: 'admin',
    status: 'active',
    promulgationDate: '2019-04-03',
    effectiveDate: '2019-05-15',
    promulgationOrg: '国务院',
    year: 2019,
    docNo: '711',
    summary: '第二十条 行政机关应当依照本条例的规定主动公开本机关的政府信息。',
    fileUrl: '/mock-files/regulation/kr-103.html'
  },
  {
    id: 'kr-104',
    name: '某综合类条例（修订草案）',
    hierarchy: 'external',
    level: 'admin',
    status: 'pending',
    promulgationDate: '2026-04-15',
    effectiveDate: '2027-01-01',
    promulgationOrg: '国务院',
    year: 2026,
    docNo: '草案',
    summary: '本条例自 2027 年 1 月 1 日起施行。',
    fileUrl: '/mock-files/regulation/kr-104.html'
  },

  // ===== 外部 · 部门规章 =====
  {
    id: 'kr-201',
    name: '会计基础工作规范',
    hierarchy: 'external',
    level: 'rule',
    status: 'active',
    promulgationDate: '1996-06-17',
    effectiveDate: '1996-06-17',
    promulgationOrg: '财政部',
    year: 1996,
    docNo: '财会字[1996]19号',
    summary: '第六十二条 出纳人员不得兼任稽核、会计档案保管和收入、费用、债权债务账目的登记工作。',
    fileUrl: '/mock-files/regulation/kr-201.html'
  },
  {
    id: 'kr-202',
    name: '政府采购品目分类目录',
    hierarchy: 'external',
    level: 'rule',
    status: 'active',
    promulgationDate: '2022-03-01',
    effectiveDate: '2022-03-01',
    promulgationOrg: '财政部',
    year: 2022,
    docNo: '财库[2022]9号',
    summary: '采购品目按照货物、工程、服务三大类进行划分。',
    fileUrl: '/mock-files/regulation/kr-202.html'
  },
  {
    id: 'kr-203',
    name: '行政事业单位内部控制规范（试行）',
    hierarchy: 'external',
    level: 'rule',
    status: 'active',
    promulgationDate: '2012-11-29',
    effectiveDate: '2014-01-01',
    promulgationOrg: '财政部',
    year: 2012,
    docNo: '财会[2012]21号',
    summary:
      '第十四条 不相容岗位主要包括：预算编制与审批；预算执行与监督；采购需求确定与采购执行；财产保管与会计核算等。',
    fileUrl: '/mock-files/regulation/kr-203.html'
  },

  // ===== 外部 · 地方法规 =====
  {
    id: 'kr-301',
    name: '北京市政府采购实施办法',
    hierarchy: 'external',
    level: 'local',
    status: 'active',
    promulgationDate: '2015-09-25',
    effectiveDate: '2016-01-01',
    promulgationOrg: '北京市人民代表大会常务委员会',
    year: 2015,
    docNo: '京政发[2015]45号',
    summary: '第二十一条 采购单位应当按照规定编制部门政府采购预算，并按规定程序报送审核。',
    fileUrl: '/mock-files/regulation/kr-301.html'
  },
  {
    id: 'kr-302',
    name: '上海市国有资产管理条例',
    hierarchy: 'external',
    level: 'local',
    status: 'active',
    promulgationDate: '2010-07-29',
    effectiveDate: '2011-01-01',
    promulgationOrg: '上海市人民代表大会常务委员会',
    year: 2010,
    docNo: '沪人发[2010]12号',
    summary: '第二十五条 出资人代表机构应当依法对所出资企业的重大事项进行监督。',
    fileUrl: '/mock-files/regulation/kr-302.html'
  },

  // ===== 外部 · 规范性文件 =====
  {
    id: 'kr-401',
    name: '关于党政机关厉行节约反对浪费条例',
    hierarchy: 'external',
    level: 'normative',
    status: 'active',
    promulgationDate: '2013-11-25',
    effectiveDate: '2013-11-25',
    promulgationOrg: '中共中央 国务院',
    year: 2013,
    docNo: '中办发[2013]18号',
    summary: '第十二条 严格控制公务接待范围和标准，不得用公款大吃大喝。',
    fileUrl: '/mock-files/regulation/kr-401.html'
  },
  {
    id: 'kr-402',
    name: '关于城镇医疗机构分类管理的实施意见',
    hierarchy: 'external',
    level: 'normative',
    status: 'active',
    promulgationDate: '2000-09-15',
    effectiveDate: '2000-09-15',
    promulgationOrg: '国务院体改办、卫生部等八部门',
    year: 2000,
    docNo: '体改发[2000]233号',
    summary:
      '第三条第7项 非营利性医疗机构不得变相出租、承包科室，不得与社会资本合作举办营利性项目。',
    fileUrl: '/mock-files/regulation/kr-402.html'
  },
  {
    id: 'kr-403',
    name: '关于规范财政专项资金管理的通知（旧版）',
    hierarchy: 'external',
    level: 'normative',
    status: 'repealed',
    promulgationDate: '2008-03-12',
    effectiveDate: '2008-03-12',
    repealedDate: '2020-12-31',
    promulgationOrg: '财政部',
    year: 2008,
    docNo: '财综[2008]17号',
    summary: '本通知已于 2020-12-31 废止，请引用替代文件。',
    fileUrl: '/mock-files/regulation/kr-403.html'
  },

  // ===== 内部 · 规章制度 =====
  {
    id: 'kr-501',
    name: 'XX 集团采购管理办法',
    hierarchy: 'internal',
    level: 'internal',
    status: 'active',
    promulgationDate: '2024-06-01',
    effectiveDate: '2024-07-01',
    promulgationOrg: 'XX 集团总裁办',
    year: 2024,
    docNo: 'CG-2024-01',
    summary: '第八条 采购金额超过 50 万元的项目，必须经集团采购委员会集体决策。',
    fileUrl: '/mock-files/regulation/kr-501.html'
  },
  {
    id: 'kr-502',
    name: 'XX 集团财务管理细则',
    hierarchy: 'internal',
    level: 'internal',
    status: 'active',
    promulgationDate: '2023-10-15',
    effectiveDate: '2023-11-01',
    promulgationOrg: 'XX 集团财务部',
    year: 2023,
    docNo: 'CW-2023-05',
    summary: '第十五条 集团各下属单位的财务支出必须按预算执行，超预算支出须事前报集团财务部审批。',
    fileUrl: '/mock-files/regulation/kr-502.html'
  },
  {
    id: 'kr-503',
    name: 'XX 集团固定资产管理实施细则（修订稿）',
    hierarchy: 'internal',
    level: 'internal',
    status: 'pending',
    promulgationDate: '2026-05-20',
    effectiveDate: '2026-08-01',
    promulgationOrg: 'XX 集团总裁办',
    year: 2026,
    docNo: 'ZC-2026-03',
    summary:
      '本细则自 2026-08-01 起施行；固定资产标准为单位价值 5000 元以上、使用年限超过一年的有形资产。',
    fileUrl: '/mock-files/regulation/kr-503.html'
  }
]

// ==================== 接口实现 ====================

/** 法规分页列表（多维过滤 + 排序） */
export async function getRegulationList(params: RegulationListQuery) {
  await delay()
  let result = [...regulations]

  // 效力位阶
  if (params.hierarchy) {
    result = result.filter((r) => r.hierarchy === params.hierarchy)
  }
  // 类型
  if (params.level) {
    result = result.filter((r) => r.level === params.level)
  }
  // 时效性
  if (params.status) {
    result = result.filter((r) => r.status === params.status)
  }
  // 年份
  if (params.year) {
    result = result.filter((r) => r.year === params.year)
  }
  // 关键词：全文 / 法规名
  if (params.keyword?.trim()) {
    const kw = params.keyword.toLowerCase()
    if (params.searchScope === 'fulltext') {
      // 全文检索：法规名 + 摘要 + 颁布机关均参与
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(kw) ||
          r.summary?.toLowerCase().includes(kw) ||
          r.promulgationOrg.toLowerCase().includes(kw)
      )
    } else {
      // 默认按法规名匹配
      result = result.filter((r) => r.name.toLowerCase().includes(kw))
    }
  }

  // 排序
  const sortBy = params.sortBy ?? 'promulgationDate'
  const dir = params.sortOrder === 'asc' ? 1 : -1
  result.sort((a, b) => {
    const av = sortBy === 'promulgationDate' ? a.promulgationDate : a.effectiveDate
    const bv = sortBy === 'promulgationDate' ? b.promulgationDate : b.effectiveDate
    return av.localeCompare(bv) * dir
  })

  const total = result.length
  const start = (params.page - 1) * params.pageSize
  const list = result.slice(start, start + params.pageSize)

  return { code: 200, message: '成功', data: { list, total } }
}

/** 当前过滤条件下可选的年份集合（用于年份 facet） */
export async function getYearFacets(filters: {
  hierarchy?: 'external' | 'internal'
  level?: RegulationLevel
  status?: EffectStatus
}) {
  await delay(80)
  let base = [...regulations]
  if (filters.hierarchy) base = base.filter((r) => r.hierarchy === filters.hierarchy)
  if (filters.level) base = base.filter((r) => r.level === filters.level)
  if (filters.status) base = base.filter((r) => r.status === filters.status)
  const years = Array.from(new Set(base.map((r) => r.year))).sort((a, b) => b - a)
  return { code: 200, message: '成功', data: years }
}

/** 法规详情（元信息 + 全文 url） */
export async function getRegulationDetail(id: string) {
  await delay()
  const item = regulations.find((r) => r.id === id)
  if (!item) return { code: 404, message: '该法规已不存在或被删除', data: null }
  // 详情态注入 fullText（真实环境由后端返回；mock 按法规名生成）
  const data = { ...item, fullText: item.fullText ?? buildFullText(item.name, item.summary) }
  return { code: 200, message: '成功', data }
}
