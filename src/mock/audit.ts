import type {
  AuditProject,
  AuditProjectParams,
  AuditProjectForm,
  LaunchProjectForm,
  ProjectStage,
  AuditFinding,
  ProjectViewer,
  SetProjectViewersForm,
  AuditItem
} from '@/types/audit'
import { ProjectStatus, StageStatus, OrganizationType, PrepareSubNode } from '@/types/audit'

// ==================== Mock 数据 ====================

let nextProjectId = 4

let projects: AuditProject[] = [
  {
    id: 1,
    name: '2024年度财务合规审计',
    code: 'SJXM-20241101-001',
    year: '2024',
    type: '财务审计',
    description: '对公司2024年度财务报表进行全面审计，确保财务数据的准确性和合规性。',
    auditedUnit: '财务部',
    auditGoal: '检查财务报表准确性，核实收入确认政策合规性，评估内控有效性',
    status: ProjectStatus.Reporting,
    currentStage: '报告阶段',
    progress: 75,
    rectificationRate: 40,
    creatorId: 1,
    createTime: '2024-11-01 09:00:00',
    updateTime: '2024-12-15 10:30:00',
    organizationType: OrganizationType.Self,
    auditOrganization: '内部审计部',
    auditPeriodStart: '2024-11-01',
    auditPeriodEnd: '2025-01-31',
    members: [
      { id: 1, name: '张三', role: '组长', department: '审计部', phone: '13800000001' },
      { id: 2, name: '李四', role: '主审', department: '审计部', phone: '13800000002' },
      { id: 3, name: '王五', role: '组员', department: '审计部', phone: '13800000003' }
    ],
    viewers: [
      { id: 1, name: '张三', type: 'audit', department: '审计部' },
      { id: 2, name: '李四', type: 'audit', department: '审计部' },
      { id: 10, name: '财务部长', type: 'reception', department: '财务部' }
    ]
  },
  {
    id: 2,
    name: '供应链管理专项审计',
    code: 'SJXM-20241215-002',
    year: '2024',
    type: '专项审计',
    description: '对公司供应链管理流程进行专项审计，识别潜在风险和改进机会。',
    auditedUnit: '采购部、仓储部',
    auditGoal: '评估供应商管理体系，检查采购合规性，审查库存管理效率',
    status: ProjectStatus.Executing,
    currentStage: '实施阶段',
    progress: 45,
    rectificationRate: 0,
    creatorId: 1,
    createTime: '2024-12-15 14:00:00',
    updateTime: '2025-01-10 16:20:00',
    organizationType: OrganizationType.Joint,
    auditOrganization: '内部审计部',
    auditPeriodStart: '2024-12-15',
    auditPeriodEnd: '2025-02-28',
    intermediaryName: '某会计师事务所',
    members: [
      { id: 1, name: '张三', role: '组长', department: '审计部', phone: '13800000001' },
      { id: 4, name: '赵六', role: '主审', department: '审计部', phone: '13800000004' },
      { id: 5, name: '项目经理A', role: '项目经理', phone: '13900000001' },
      { id: 6, name: '中介人员B', role: '中介人员', phone: '13900000002' }
    ],
    viewers: [
      { id: 1, name: '张三', type: 'audit', department: '审计部' },
      { id: 11, name: '采购部长', type: 'reception', department: '采购部' },
      { id: 12, name: '仓储主管', type: 'reception', department: '仓储部' }
    ]
  },
  {
    id: 3,
    name: '信息系统安全合规审计',
    code: 'SJXM-20250101-003',
    year: '2025',
    type: '合规审计',
    description: '对公司信息系统安全策略和合规性进行审计。',
    auditedUnit: '信息技术部',
    auditGoal: '评估信息安全控制措施，检查数据保护合规性，审查访问控制有效性',
    status: ProjectStatus.Pending,
    currentStage: '',
    progress: 0,
    rectificationRate: 0,
    creatorId: 1,
    createTime: '2025-01-01 10:00:00',
    updateTime: '2025-01-15 09:00:00',
    members: [],
    viewers: []
  }
]

// 阶段 Mock 数据
const stagesMap: Record<number, ProjectStage[]> = {
  1: [
    {
      id: 1,
      projectId: 1,
      stageName: '准备阶段',
      order: 1,
      status: StageStatus.Completed,
      auditPlan:
        '1. 收集财务报表及相关资料\n2. 制定审计程序\n3. 安排审计时间计划\n4. 准备审计底稿模板',
      planDocuments: [
        {
          id: 1,
          name: '2024年度审计计划书.pdf',
          url: '/mock/docs/plan.pdf',
          size: 245760,
          uploadTime: '2024-11-05 10:00:00'
        }
      ],
      materials: [
        {
          id: 2,
          name: '2024年度财务报表.xlsx',
          url: '/mock/docs/report.xlsx',
          size: 512000,
          uploadTime: '2024-11-08 14:00:00'
        }
      ],
      workRecords: [
        {
          id: 1,
          content: '完成审计计划制定，已与财务部门沟通审计时间安排',
          createTime: '2024-11-10 17:00:00',
          creatorName: '张三'
        }
      ],
      findings: [],
      reportDocuments: [],
      progress: 100,
      startTime: '2024-11-01 09:00:00',
      completeTime: '2024-11-15 18:00:00',
      currentSubNode: PrepareSubNode.Plan,
      noticeContent:
        '根据《中华人民共和国审计法》及相关规定，我部决定对财务部2024年度财务收支情况进行审计。现将有关事项通知如下：\n\n一、审计范围\n2024年1月1日至2024年12月31日期间的财务收支及相关经济活动。\n\n二、审计内容\n1. 财务报表的真实性、完整性和合规性\n2. 收入确认政策的合规性\n3. 费用支出的合理性和审批流程\n4. 内部控制制度的有效性\n\n三、审计时间\n2024年11月1日至2025年1月31日\n\n四、审计组成员\n组长：张三\n主审：李四\n组员：王五\n\n五、配合要求\n请被审计单位按照审计组要求，及时提供相关资料，配合审计工作。',
      auditItems: [
        {
          id: 1,
          name: '财务报表审计',
          description: '审查2024年度资产负债表、利润表、现金流量表的真实性和完整性',
          content:
            '1. 核对财务报表与账簿记录的一致性\n2. 抽查重要会计科目的原始凭证\n3. 分析财务指标的合理性\n4. 检查报表附注的完整性',
          assignedMembers: [
            { id: 1, name: '张三', role: '组长', department: '审计部', phone: '13800000001' },
            { id: 2, name: '李四', role: '主审', department: '审计部', phone: '13800000002' }
          ],
          createTime: '2024-11-02 10:00:00'
        },
        {
          id: 2,
          name: '收入确认审计',
          description: '审查收入确认政策的合规性及执行情况',
          content:
            '1. 检查收入确认政策是否符合会计准则\n2. 抽查销售合同与收入确认时点的匹配性\n3. 核实收入确认的完整性\n4. 检查是否存在提前或延后确认收入的情况',
          assignedMembers: [
            { id: 2, name: '李四', role: '主审', department: '审计部', phone: '13800000002' },
            { id: 3, name: '王五', role: '组员', department: '审计部', phone: '13800000003' }
          ],
          createTime: '2024-11-02 10:30:00'
        },
        {
          id: 3,
          name: '费用支出审计',
          description: '审查费用支出的合理性和审批流程的规范性',
          content:
            '1. 检查费用报销审批流程是否规范\n2. 核实费用支出的真实性和必要性\n3. 检查是否存在超标准支出\n4. 审查费用分摊的合理性',
          assignedMembers: [
            { id: 3, name: '王五', role: '组员', department: '审计部', phone: '13800000003' }
          ],
          createTime: '2024-11-02 11:00:00'
        }
      ],
      implementationPlan:
        '# 2024年度财务合规审计实施方案\n\n## 一、审计事项概述\n\n本次审计共包含3个审计事项：\n1. 财务报表审计\n2. 收入确认审计\n3. 费用支出审计\n\n## 二、审计事项详细方案\n\n### 2.1 财务报表审计\n\n**审计目标：** 审查2024年度资产负债表、利润表、现金流量表的真实性和完整性\n\n**审计内容：**\n1. 核对财务报表与账簿记录的一致性\n2. 抽查重要会计科目的原始凭证\n3. 分析财务指标的合理性\n4. 检查报表附注的完整性\n\n**责任人：** 张三（组长）、李四（主审）\n\n**实施时间：** 2024年11月1日 - 2024年11月20日\n\n---\n\n### 2.2 收入确认审计\n\n**审计目标：** 审查收入确认政策的合规性及执行情况\n\n**审计内容：**\n1. 检查收入确认政策是否符合会计准则\n2. 抽查销售合同与收入确认时点的匹配性\n3. 核实收入确认的完整性\n4. 检查是否存在提前或延后确认收入的情况\n\n**责任人：** 李四（主审）、王五（组员）\n\n**实施时间：** 2024年11月21日 - 2024年12月5日\n\n---\n\n### 2.3 费用支出审计\n\n**审计目标：** 审查费用支出的合理性和审批流程的规范性\n\n**审计内容：**\n1. 检查费用报销审批流程是否规范\n2. 核实费用支出的真实性和必要性\n3. 检查是否存在超标准支出\n4. 审查费用分摊的合理性\n\n**责任人：** 王五（组员）\n\n**实施时间：** 2024年12月6日 - 2024年12月20日\n\n---\n\n## 三、审计资源配置\n\n| 审计人员 | 角色 | 负责事项 |\n|---------|------|----------|\n| 张三 | 组长 | 财务报表审计 |\n| 李四 | 主审 | 财务报表审计、收入确认审计 |\n| 王五 | 组员 | 收入确认审计、费用支出审计 |\n\n## 四、审计进度安排\n\n- **第一阶段（11月1日-11月20日）：** 财务报表审计\n- **第二阶段（11月21日-12月5日）：** 收入确认审计\n- **第三阶段（12月6日-12月20日）：** 费用支出审计\n- **第四阶段（12月21日-12月31日）：** 审计总结与报告编制\n\n## 五、审计成果要求\n\n1. 各审计事项形成独立的审计工作底稿\n2. 发现的问题及时记录并分类\n3. 重大问题及时向审计组长汇报\n4. 审计结束后形成完整的审计报告'
    },
    {
      id: 2,
      projectId: 1,
      stageName: '实施阶段',
      order: 2,
      status: StageStatus.Completed,
      auditPlan: '',
      planDocuments: [],
      materials: [],
      workRecords: [
        {
          id: 2,
          content: '完成收入确认专项审查，发现3个问题',
          createTime: '2024-12-01 17:00:00',
          creatorName: '张三'
        }
      ],
      findings: [
        {
          id: 1,
          description: '部分收入确认时间点与合同约定不符，存在提前确认收入的情况',
          level: 1,
          department: '销售部',
          evidence: [],
          createTime: '2024-11-20 14:00:00'
        },
        {
          id: 2,
          description: '费用报销审批流程存在绕过授权审批的情况',
          level: 2,
          department: '行政部',
          evidence: [],
          createTime: '2024-11-25 10:00:00'
        }
      ],
      reportDocuments: [],
      progress: 100,
      startTime: '2024-11-16 09:00:00',
      completeTime: '2024-12-10 18:00:00'
    },
    {
      id: 3,
      projectId: 1,
      stageName: '报告阶段',
      order: 3,
      status: StageStatus.InProgress,
      auditPlan: '',
      planDocuments: [],
      materials: [],
      workRecords: [],
      findings: [],
      reportContent: '一、审计概述\n本次审计对2024年度财务报表进行全面审查...',
      reportDocuments: [],
      progress: 60,
      startTime: '2024-12-11 09:00:00'
    },
    {
      id: 4,
      projectId: 1,
      stageName: '后续审计',
      order: 4,
      status: StageStatus.NotStarted,
      auditPlan: '',
      planDocuments: [],
      materials: [],
      workRecords: [],
      findings: [],
      reportDocuments: [],
      progress: 0
    }
  ],
  2: [
    {
      id: 5,
      projectId: 2,
      stageName: '准备阶段',
      order: 1,
      status: StageStatus.Completed,
      auditPlan: '供应链审计准备方案',
      planDocuments: [],
      materials: [],
      workRecords: [],
      findings: [],
      reportDocuments: [],
      progress: 100,
      startTime: '2024-12-15 09:00:00',
      completeTime: '2024-12-25 18:00:00',
      currentSubNode: PrepareSubNode.Plan,
      noticeContent:
        '根据公司年度审计计划，我部决定对采购部、仓储部的供应链管理流程进行专项审计。现将有关事项通知如下：\n\n一、审计范围\n2024年度供应链管理全流程，包括供应商管理、采购流程、库存管理等。\n\n二、审计内容\n1. 供应商准入和评估机制\n2. 采购合同管理和审批流程\n3. 库存管理和盘点制度\n4. 供应链风险控制措施\n\n三、审计时间\n2024年12月15日至2025年2月28日\n\n四、审计组成员\n组长：张三\n主审：赵六\n项目经理：项目经理A\n中介人员：中介人员B\n\n五、配合要求\n请采购部、仓储部按照审计组要求，及时提供相关资料，配合审计工作。',
      auditItems: [
        {
          id: 4,
          name: '供应商管理审计',
          description: '审查供应商准入、评估和管理机制',
          content:
            '1. 检查供应商准入资质审核流程\n2. 评估供应商评价体系的有效性\n3. 审查供应商合同管理\n4. 检查供应商风险预警机制',
          assignedMembers: [
            { id: 1, name: '张三', role: '组长', department: '审计部', phone: '13800000001' },
            { id: 4, name: '赵六', role: '主审', department: '审计部', phone: '13800000004' }
          ],
          createTime: '2024-12-16 10:00:00'
        },
        {
          id: 5,
          name: '采购流程审计',
          description: '审查采购合同管理和审批流程的规范性',
          content:
            '1. 检查采购申请和审批流程\n2. 核实采购合同的合规性\n3. 审查采购价格的合理性\n4. 检查采购付款流程',
          assignedMembers: [
            { id: 4, name: '赵六', role: '主审', department: '审计部', phone: '13800000004' },
            { id: 5, name: '项目经理A', role: '项目经理', phone: '13900000001' }
          ],
          createTime: '2024-12-16 10:30:00'
        }
      ],
      implementationPlan:
        '# 供应链管理专项审计实施方案\n\n## 一、审计事项概述\n\n本次审计共包含2个审计事项：\n1. 供应商管理审计\n2. 采购流程审计\n\n## 二、审计事项详细方案\n\n### 2.1 供应商管理审计\n\n**审计目标：** 审查供应商准入、评估和管理机制\n\n**审计内容：**\n1. 检查供应商准入资质审核流程\n2. 评估供应商评价体系的有效性\n3. 审查供应商合同管理\n4. 检查供应商风险预警机制\n\n**责任人：** 张三（组长）、赵六（主审）\n\n**实施时间：** 2024年12月15日 - 2025年1月15日\n\n---\n\n### 2.2 采购流程审计\n\n**审计目标：** 审查采购合同管理和审批流程的规范性\n\n**审计内容：**\n1. 检查采购申请和审批流程\n2. 核实采购合同的合规性\n3. 审查采购价格的合理性\n4. 检查采购付款流程\n\n**责任人：** 赵六（主审）、项目经理A（项目经理）\n\n**实施时间：** 2025年1月16日 - 2025年2月15日\n\n---\n\n## 三、审计资源配置\n\n| 审计人员 | 角色 | 负责事项 |\n|---------|------|----------|\n| 张三 | 组长 | 供应商管理审计 |\n| 赵六 | 主审 | 供应商管理审计、采购流程审计 |\n| 项目经理A | 项目经理 | 采购流程审计 |\n| 中介人员B | 中介人员 | 协助审计工作 |\n\n## 四、审计进度安排\n\n- **第一阶段（12月15日-1月15日）：** 供应商管理审计\n- **第二阶段（1月16日-2月15日）：** 采购流程审计\n- **第三阶段（2月16日-2月28日）：** 审计总结与报告编制\n\n## 五、审计成果要求\n\n1. 各审计事项形成独立的审计工作底稿\n2. 发现的问题及时记录并分类\n3. 重大问题及时向审计组长汇报\n4. 审计结束后形成完整的审计报告'
    },
    {
      id: 6,
      projectId: 2,
      stageName: '实施阶段',
      order: 2,
      status: StageStatus.InProgress,
      auditPlan: '',
      planDocuments: [],
      materials: [],
      workRecords: [],
      findings: [
        {
          id: 3,
          description: '部分供应商准入资质审核不完整',
          level: 2,
          department: '采购部',
          evidence: [],
          createTime: '2025-01-05 14:00:00'
        }
      ],
      reportDocuments: [],
      progress: 45,
      startTime: '2024-12-26 09:00:00'
    },
    {
      id: 7,
      projectId: 2,
      stageName: '报告阶段',
      order: 3,
      status: StageStatus.NotStarted,
      auditPlan: '',
      planDocuments: [],
      materials: [],
      workRecords: [],
      findings: [],
      reportDocuments: [],
      progress: 0
    },
    {
      id: 8,
      projectId: 2,
      stageName: '后续审计',
      order: 4,
      status: StageStatus.NotStarted,
      auditPlan: '',
      planDocuments: [],
      materials: [],
      workRecords: [],
      findings: [],
      reportDocuments: [],
      progress: 0
    }
  ]
}

// ==================== Mock 函数 ====================

/** 获取项目列表 */
export function getProjectListMock(params: AuditProjectParams) {
  const { name, year, status, auditedUnit, page = 1, pageSize = 10 } = params
  let filtered = [...projects]

  if (name) {
    filtered = filtered.filter((p) => p.name.includes(name) || p.code.includes(name))
  }
  if (year) {
    filtered = filtered.filter((p) => p.year === year)
  }
  if (status !== undefined && status !== null && status !== '') {
    const s = typeof status === 'string' ? parseInt(status) : status
    filtered = filtered.filter((p) => p.status === s)
  }
  if (auditedUnit) {
    filtered = filtered.filter((p) => p.auditedUnit.includes(auditedUnit))
  }

  const start = (page - 1) * pageSize
  return {
    list: filtered.slice(start, start + Number(pageSize)),
    total: filtered.length
  }
}

/** 获取项目详情 */
export function getProjectDetailMock(id: number) {
  const project = projects.find((p) => p.id === id)
  if (!project) throw new Error('项目不存在')
  return project
}

/** 新增项目 */
export function addProjectMock(form: AuditProjectForm) {
  const now = new Date().toLocaleString('zh-CN')
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const seq = String(nextProjectId).padStart(3, '0')
  const project: AuditProject = {
    id: nextProjectId++,
    name: form.name,
    code: `SJXM-${dateStr}-${seq}`,
    year: form.year,
    type: form.type,
    description: form.description || '',
    auditedUnit: form.auditedUnit,
    auditGoal: form.auditGoal,
    status: ProjectStatus.Pending,
    currentStage: '',
    progress: 0,
    rectificationRate: 0,
    creatorId: 1,
    createTime: now,
    updateTime: now,
    members: [],
    viewers: []
  }
  projects.push(project)
  return project
}

/** 编辑项目（仅未启动状态可编辑基础信息） */
export function updateProjectMock(form: AuditProjectForm) {
  const idx = projects.findIndex((p) => p.id === form.id)
  if (idx === -1) throw new Error('项目不存在')
  const now = new Date().toLocaleString('zh-CN')
  projects[idx] = {
    ...projects[idx],
    name: form.name,
    year: form.year,
    type: form.type,
    description: form.description || '',
    auditedUnit: form.auditedUnit,
    auditGoal: form.auditGoal,
    updateTime: now
  }
  return projects[idx]
}

/** 删除项目（仅未启动状态） */
export function deleteProjectMock(id: number) {
  const idx = projects.findIndex((p) => p.id === id)
  if (idx === -1) throw new Error('项目不存在')
  if (projects[idx].status !== ProjectStatus.Pending) throw new Error('只能删除未启动状态的项目')
  projects.splice(idx, 1)
  delete stagesMap[id]
  return true
}

/** 启动项目 */
export function launchProjectMock(id: number, form: LaunchProjectForm) {
  const project = projects.find((p) => p.id === id)
  if (!project) throw new Error('项目不存在')
  if (project.status !== ProjectStatus.Pending) throw new Error('项目已启动')

  const now = new Date().toLocaleString('zh-CN')
  Object.assign(project, {
    organizationType: form.organizationType,
    auditOrganization: form.auditOrganization,
    auditPeriodStart: form.auditPeriodStart,
    auditPeriodEnd: form.auditPeriodEnd,
    intermediaryName: form.intermediaryName,
    members: form.members,
    status: ProjectStatus.Preparing,
    currentStage: '准备阶段',
    updateTime: now
  })

  // 初始化四大阶段
  const stages: ProjectStage[] = ['准备阶段', '实施阶段', '报告阶段', '后续审计'].map(
    (name, i) => {
      const stage: ProjectStage = {
        id: Date.now() + i,
        projectId: id,
        stageName: name,
        order: i + 1,
        status: i === 0 ? StageStatus.InProgress : StageStatus.NotStarted,
        auditPlan: '',
        planDocuments: [],
        materials: [],
        workRecords: [],
        findings: [],
        reportDocuments: [],
        progress: 0
      }

      // 准备阶段初始化子节点数据
      if (i === 0) {
        stage.currentSubNode = PrepareSubNode.Notice
        stage.noticeContent = `根据《中华人民共和国审计法》及相关规定，我部决定对${project.auditedUnit}${project.year}年度财务收支情况进行审计。现将有关事项通知如下：

一、审计范围
${project.year}年度的财务收支及相关经济活动。

二、审计内容
${project.auditGoal}

三、审计时间
${form.auditPeriodStart} 至 ${form.auditPeriodEnd}

四、审计组成员
${form.members.map((m) => `${m.role}：${m.name}`).join('\n')}

五、配合要求
请被审计单位按照审计组要求，及时提供相关资料，配合审计工作。`
        stage.auditItems = []
        stage.implementationPlan = ''
        stage.startTime = now
      }

      return stage
    }
  )
  stagesMap[id] = stages
  return project
}

/** 获取项目阶段列表 */
export function getProjectStagesMock(projectId: number) {
  return stagesMap[projectId] || []
}

/** 保存阶段内容（草稿） */
export function saveStageContentMock(
  projectId: number,
  stageId: number,
  data: Partial<ProjectStage>
) {
  const stages = stagesMap[projectId]
  if (!stages) throw new Error('项目不存在')
  const stage = stages.find((s) => s.id === stageId)
  if (!stage) throw new Error('阶段不存在')
  Object.assign(stage, data, { updateTime: new Date().toLocaleString('zh-CN') })
  return stage
}

/** 完成阶段 */
export function completeStagesMock(projectId: number, stageId: number) {
  const stages = stagesMap[projectId]
  if (!stages) throw new Error('项目不存在')
  const stageIdx = stages.findIndex((s) => s.id === stageId)
  if (stageIdx === -1) throw new Error('阶段不存在')

  stages[stageIdx].status = StageStatus.Completed
  stages[stageIdx].progress = 100
  stages[stageIdx].completeTime = new Date().toLocaleString('zh-CN')

  if (stageIdx + 1 < stages.length) {
    stages[stageIdx + 1].status = StageStatus.InProgress
    stages[stageIdx + 1].startTime = new Date().toLocaleString('zh-CN')
  }

  const project = projects.find((p) => p.id === projectId)
  if (project) {
    const completedCount = stages.filter((s) => s.status >= StageStatus.Completed).length
    project.progress = Math.round((completedCount / stages.length) * 100)
    project.currentStage = stages[stageIdx + 1]?.stageName || '已完成'

    if (stageIdx === stages.length - 1) {
      project.status = ProjectStatus.Completed
      project.progress = 100
    } else {
      const statusMap: Record<number, ProjectStatus> = {
        1: ProjectStatus.Executing,
        2: ProjectStatus.Reporting,
        3: ProjectStatus.Completed
      }
      project.status = statusMap[stageIdx + 1] ?? project.status
    }
  }

  return stages
}

/** 添加审计发现 */
export function addFindingMock(
  projectId: number,
  stageId: number,
  finding: Omit<AuditFinding, 'id' | 'createTime'>
) {
  const stages = stagesMap[projectId]
  if (!stages) throw new Error('项目不存在')
  const stage = stages.find((s) => s.id === stageId)
  if (!stage) throw new Error('阶段不存在')

  const newFinding: AuditFinding = {
    id: Date.now(),
    ...finding,
    createTime: new Date().toLocaleString('zh-CN')
  }
  stage.findings.push(newFinding)
  return newFinding
}

/** 删除审计发现 */
export function deleteFindingMock(projectId: number, stageId: number, findingId: number) {
  const stages = stagesMap[projectId]
  if (!stages) throw new Error('项目不存在')
  const stage = stages.find((s) => s.id === stageId)
  if (!stage) throw new Error('阶段不存在')
  const idx = stage.findings.findIndex((f) => f.id === findingId)
  if (idx === -1) throw new Error('发现不存在')
  stage.findings.splice(idx, 1)
  return true
}

/** 添加工作记录 */
export function addWorkRecordMock(projectId: number, stageId: number, content: string) {
  const stages = stagesMap[projectId]
  if (!stages) throw new Error('项目不存在')
  const stage = stages.find((s) => s.id === stageId)
  if (!stage) throw new Error('阶段不存在')
  const record = {
    id: Date.now(),
    content,
    createTime: new Date().toLocaleString('zh-CN'),
    creatorName: '张三'
  }
  stage.workRecords.push(record)
  return record
}

/** 设置项目可查看人员 */
export function setProjectViewersMock(projectId: number, form: SetProjectViewersForm) {
  const project = projects.find((p) => p.id === projectId)
  if (!project) throw new Error('项目不存在')
  project.viewers = form.viewers
  project.updateTime = new Date().toLocaleString('zh-CN')
  return project
}

/** 添加审计事项 */
export function addAuditItemMock(
  projectId: number,
  stageId: number,
  item: Omit<AuditItem, 'id' | 'createTime'>
) {
  const stages = stagesMap[projectId]
  if (!stages) throw new Error('项目不存在')
  const stage = stages.find((s) => s.id === stageId)
  if (!stage) throw new Error('阶段不存在')
  if (!stage.auditItems) stage.auditItems = []

  const newItem: AuditItem = {
    id: Date.now(),
    ...item,
    createTime: new Date().toLocaleString('zh-CN')
  }
  stage.auditItems.push(newItem)
  return newItem
}

/** 更新审计事项 */
export function updateAuditItemMock(
  projectId: number,
  stageId: number,
  item: Partial<AuditItem> & { id: number }
) {
  const stages = stagesMap[projectId]
  if (!stages) throw new Error('项目不存在')
  const stage = stages.find((s) => s.id === stageId)
  if (!stage) throw new Error('阶段不存在')
  if (!stage.auditItems) throw new Error('审计事项列表不存在')

  const idx = stage.auditItems.findIndex((i) => i.id === item.id)
  if (idx === -1) throw new Error('审计事项不存在')

  stage.auditItems[idx] = {
    ...stage.auditItems[idx],
    ...item
  }
  return stage.auditItems[idx]
}

/** 删除审计事项 */
export function deleteAuditItemMock(projectId: number, stageId: number, itemId: number) {
  const stages = stagesMap[projectId]
  if (!stages) throw new Error('项目不存在')
  const stage = stages.find((s) => s.id === stageId)
  if (!stage) throw new Error('阶段不存在')
  if (!stage.auditItems) throw new Error('审计事项列表不存在')

  const idx = stage.auditItems.findIndex((i) => i.id === itemId)
  if (idx === -1) throw new Error('审计事项不存在')

  stage.auditItems.splice(idx, 1)
  return true
}

/** 生成审计实施方案 */
export function generatePlanMock(projectId: number, stageId: number) {
  const stages = stagesMap[projectId]
  if (!stages) throw new Error('项目不存在')
  const stage = stages.find((s) => s.id === stageId)
  if (!stage) throw new Error('阶段不存在')
  if (!stage.auditItems || stage.auditItems.length === 0) {
    throw new Error('请先添加审计事项')
  }

  const project = projects.find((p) => p.id === projectId)
  if (!project) throw new Error('项目不存在')

  // 生成审计实施方案
  let plan = `# ${project.name}审计实施方案\n\n`
  plan += `## 一、审计事项概述\n\n`
  plan += `本次审计共包含${stage.auditItems.length}个审计事项：\n`
  stage.auditItems.forEach((item, index) => {
    plan += `${index + 1}. ${item.name}\n`
  })
  plan += `\n## 二、审计事项详细方案\n\n`

  stage.auditItems.forEach((item, index) => {
    plan += `### 2.${index + 1} ${item.name}\n\n`
    plan += `**审计目标：** ${item.description}\n\n`
    plan += `**审计内容：**\n${item.content}\n\n`
    plan += `**责任人：** ${item.assignedMembers.map((m) => `${m.name}（${m.role}）`).join('、')}\n\n`
    plan += `**实施时间：** 待定\n\n`
    plan += `---\n\n`
  })

  // 生成审计资源配置表
  plan += `## 三、审计资源配置\n\n`
  plan += `| 审计人员 | 角色 | 负责事项 |\n`
  plan += `|---------|------|----------|\n`

  const memberMap = new Map<string, { role: string; items: string[] }>()
  stage.auditItems.forEach((item) => {
    item.assignedMembers.forEach((member) => {
      if (!memberMap.has(member.name)) {
        memberMap.set(member.name, { role: member.role, items: [] })
      }
      memberMap.get(member.name)!.items.push(item.name)
    })
  })

  memberMap.forEach((value, name) => {
    plan += `| ${name} | ${value.role} | ${value.items.join('、')} |\n`
  })

  plan += `\n## 四、审计进度安排\n\n`
  stage.auditItems.forEach((item, index) => {
    plan += `- **第${index + 1}阶段：** ${item.name}\n`
  })
  plan += `- **最后阶段：** 审计总结与报告编制\n`

  plan += `\n## 五、审计成果要求\n\n`
  plan += `1. 各审计事项形成独立的审计工作底稿\n`
  plan += `2. 发现的问题及时记录并分类\n`
  plan += `3. 重大问题及时向审计组长汇报\n`
  plan += `4. 审计结束后形成完整的审计报告`

  stage.implementationPlan = plan
  stage.currentSubNode = PrepareSubNode.Plan
  return stage
}
