import type {
  RecommendationItem,
  RecommendationParams,
  ChatRequest,
  ChatResponse
} from '@/types/audit-management/project-recommendation'

/**
 * 固定的推荐项数据
 */
const recommendations: RecommendationItem[] = [
  {
    id: 1,
    unitId: 101,
    unitName: '市财政局',
    auditeeId: 1001,
    auditeeName: '张三',
    position: '局长',
    reason: '离任审计（2026-03-15 离职）',
    reasonType: 'resignation',
    priority: 'P0',
    resignationDate: '2026-03-15'
  },
  {
    id: 2,
    unitId: 102,
    unitName: '市教育局',
    auditeeId: 1002,
    auditeeName: '李四',
    position: '局长',
    reason: '离任审计（2026-04-01 离职）',
    reasonType: 'resignation',
    priority: 'P0',
    resignationDate: '2026-04-01'
  },
  {
    id: 3,
    unitId: 103,
    unitName: '市卫生健康委员会',
    auditeeId: 1003,
    auditeeName: '王五',
    position: '主任',
    reason: '从未审计',
    reasonType: 'never',
    priority: 'P1'
  },
  {
    id: 4,
    unitId: 104,
    unitName: '市交通运输局',
    auditeeId: 1004,
    auditeeName: '赵六',
    position: '局长',
    reason: '从未审计',
    reasonType: 'never',
    priority: 'P1'
  },
  {
    id: 5,
    unitId: 105,
    unitName: '市住房和城乡建设局',
    auditeeId: 1005,
    auditeeName: '孙七',
    position: '局长',
    reason: '轮审到期（剩余 0 年）',
    reasonType: 'cycle',
    lastAuditYear: '2021',
    yearsToDeadline: 0,
    priority: 'P2'
  },
  {
    id: 6,
    unitId: 106,
    unitName: '市水利局',
    auditeeId: 1006,
    auditeeName: '周八',
    position: '局长',
    reason: '轮审到期（剩余 0 年）',
    reasonType: 'cycle',
    lastAuditYear: '2021',
    yearsToDeadline: 0,
    priority: 'P2'
  },
  {
    id: 7,
    unitId: 107,
    unitName: '市农业农村局',
    auditeeId: 1007,
    auditeeName: '吴九',
    position: '局长',
    reason: '轮审到期（剩余 1 年）',
    reasonType: 'cycle',
    lastAuditYear: '2022',
    yearsToDeadline: 1,
    priority: 'P3'
  },
  {
    id: 8,
    unitId: 108,
    unitName: '市文化和旅游局',
    auditeeId: 1008,
    auditeeName: '郑十',
    position: '局长',
    reason: '轮审到期（剩余 1 年）',
    reasonType: 'cycle',
    lastAuditYear: '2022',
    yearsToDeadline: 1,
    priority: 'P3'
  },
  {
    id: 9,
    unitId: 109,
    unitName: '市市场监督管理局',
    auditeeId: 1009,
    auditeeName: '冯十一',
    position: '局长',
    reason: '轮审到期（剩余 2 年）',
    reasonType: 'cycle',
    lastAuditYear: '2023',
    yearsToDeadline: 2,
    priority: 'P4'
  },
  {
    id: 10,
    unitId: 110,
    unitName: '市生态环境局',
    auditeeId: 1010,
    auditeeName: '陈十二',
    position: '局长',
    reason: '轮审到期（剩余 2 年）',
    reasonType: 'cycle',
    lastAuditYear: '2023',
    yearsToDeadline: 2,
    priority: 'P4'
  },
  {
    id: 11,
    unitId: 111,
    unitName: '市应急管理局',
    auditeeId: 1011,
    auditeeName: '褚十三',
    position: '局长',
    reason: '轮审到期（剩余 3 年）',
    reasonType: 'cycle',
    lastAuditYear: '2024',
    yearsToDeadline: 3,
    priority: 'P5'
  },
  {
    id: 12,
    unitId: 112,
    unitName: '市统计局',
    auditeeId: 1012,
    auditeeName: '卫十四',
    position: '局长',
    reason: '轮审到期（剩余 3 年）',
    reasonType: 'cycle',
    lastAuditYear: '2024',
    yearsToDeadline: 3,
    priority: 'P5'
  },
  {
    id: 13,
    unitId: 113,
    unitName: '市审计局',
    auditeeId: 1013,
    auditeeName: '蒋十五',
    position: '局长',
    reason: '轮审到期（剩余 4 年）',
    reasonType: 'cycle',
    lastAuditYear: '2025',
    yearsToDeadline: 4,
    priority: 'P6'
  },
  {
    id: 14,
    unitId: 114,
    unitName: '市人力资源和社会保障局',
    auditeeId: 1014,
    auditeeName: '沈十六',
    position: '局长',
    reason: '轮审到期（剩余 4 年）',
    reasonType: 'cycle',
    lastAuditYear: '2025',
    yearsToDeadline: 4,
    priority: 'P6'
  },
  {
    id: 15,
    unitId: 115,
    unitName: '市民政局',
    auditeeId: 1015,
    auditeeName: '韩十七',
    position: '局长',
    reason: '轮审到期（剩余 4 年）',
    reasonType: 'cycle',
    lastAuditYear: '2025',
    yearsToDeadline: 4,
    priority: 'P6'
  }
]

/**
 * 获取推荐列表 Mock 函数
 */
export function getRecommendationListMock(params: RecommendationParams) {
  const { priority, unitName, auditee, page = 1, pageSize = 20 } = params
  let filteredData = [...recommendations]

  // 筛选
  if (priority) {
    filteredData = filteredData.filter((item) => item.priority === priority)
  }
  if (unitName) {
    filteredData = filteredData.filter((item) => item.unitName.includes(unitName))
  }
  if (auditee) {
    filteredData = filteredData.filter((item) => item.auditeeName.includes(auditee))
  }

  // 分页
  const start = (page - 1) * pageSize
  const end = start + Number(pageSize)
  const list = filteredData.slice(start, end)

  return {
    list,
    total: filteredData.length
  }
}

/**
 * 生成思考步骤
 */
export function generateThinkingSteps(message: string): string[] {
  const steps: string[] = []

  // 根据不同场景生成不同的思考过程
  if (message.includes('离任')) {
    steps.push('💭 让我全面分析一下当前的审计情况...')
    steps.push('📊 发现2位领导干部已离职但未完成离任审计')
    steps.push('⚙️ 按照优先级：离任审计最紧急，然后是从未审计的单位，最后是轮审到期的')
    steps.push(
      '✅ 给您推荐了一个建议立项的被审计单位清单，您可以一键全部列入计划或选择部分单位列入计划'
    )
  } else if (message.includes('从未审计')) {
    steps.push('💭 让我全面分析一下当前的审计情况...')
    steps.push('📊 发现2个单位从未进行过经济责任审计')
    steps.push('⚙️ 按照优先级：离任审计最紧急，然后是从未审计的单位，最后是轮审到期的')
    steps.push(
      '✅ 给您推荐了一个建议立项的被审计单位清单，您可以一键全部列入计划或选择部分单位列入计划'
    )
  } else if (message.includes('轮审') || message.includes('到期')) {
    steps.push('💭 让我全面分析一下当前的审计情况...')
    steps.push('📊 发现2个单位的5年轮审期已到期，2个单位即将到期')
    steps.push('⚙️ 按照优先级：离任审计最紧急，然后是从未审计的单位，最后是轮审到期的')
    steps.push(
      '✅ 给您推荐了一个建议立项的被审计单位清单，您可以一键全部列入计划或选择部分单位列入计划'
    )
  } else {
    steps.push('💭 让我全面分析一下当前的审计情况...')
    steps.push('📊 发现2位领导干部已离职但未完成离任审计')
    steps.push('📊 发现2个单位从未进行过经济责任审计')
    steps.push('📊 发现2个单位的5年轮审期已到期，2个单位即将到期')
    steps.push('⚙️ 按照优先级：离任审计最紧急，然后是从未审计的单位，最后是轮审到期的')
    steps.push(
      '✅ 给您推荐了一个建议立项的被审计单位清单，您可以一键全部列入计划或选择部分单位列入计划'
    )
  }

  return steps
}

/**
 * AI对话 Mock 函数
 */
export function chatMock(request: ChatRequest): ChatResponse {
  const message = request.message.toLowerCase()

  // 识别用户意图
  if (
    message.includes('推荐') ||
    message.includes('审计项目') ||
    message.includes('哪些单位') ||
    message.includes('需要审计') ||
    message.includes('立项') ||
    message.includes('计划')
  ) {
    // 检查是否有优先级筛选
    let filteredRecommendations = [...recommendations]
    let replyText = ''

    if (message.includes('离任') || message.includes('p0')) {
      filteredRecommendations = recommendations.filter((item) => item.priority === 'P0')
      replyText = `详细推荐列表如下：`
    } else if (message.includes('从未审计') || message.includes('p1')) {
      filteredRecommendations = recommendations.filter((item) => item.priority === 'P1')
      replyText = `详细推荐列表如下：`
    } else if (message.includes('轮审到期') || message.includes('到期')) {
      filteredRecommendations = recommendations.filter(
        (item) => item.priority === 'P2' || item.priority === 'P3'
      )
      replyText = `详细推荐列表如下：`
    } else {
      replyText = `详细推荐列表如下：`
    }

    return {
      reply: replyText,
      recommendations: filteredRecommendations,
      thinkingSteps: generateThinkingSteps(message)
    }
  }

  // 默认回复
  return {
    reply:
      '您好！我是审计项目推荐助手。\n\n我可以帮您：\n• 推荐需要立项的经济责任审计项目\n• 分析离任审计和轮审到期情况\n• 按优先级排序推荐结果\n\n请告诉我您需要什么帮助？',
    recommendations: [],
    thinkingSteps: []
  }
}
