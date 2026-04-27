import type { Section, GenerateRequest, GenerateResponse } from '@/types/ai-assistant'

/**
 * 标准章节配置
 */
export const STANDARD_SECTIONS: Omit<Section, 'content' | 'isInserted'>[] = [
  {
    id: 'summary',
    name: '审计事项概要',
    status: 'ready',
    requiredQuestions: 0,
    questions: []
  },
  {
    id: 'risks',
    name: '风险点描述',
    status: 'ready',
    requiredQuestions: 0,
    questions: []
  },
  {
    id: 'procedures',
    name: '审计程序',
    status: 'pending',
    requiredQuestions: 2,
    questions: [
      {
        id: 'proc_q1',
        content: '请问审计程序的主要步骤有哪些？',
        required: true,
        placeholder: '例如：1.了解被审计单位情况 2.收集审计证据 3.编制审计底稿'
      },
      {
        id: 'proc_q2',
        content: '请问需要重点关注哪些审计风险？',
        required: true,
        placeholder: '例如：决策程序合规性风险、资金使用效益风险'
      }
    ]
  },
  {
    id: 'results',
    name: '预期结果',
    status: 'pending',
    requiredQuestions: 1,
    questions: [
      {
        id: 'result_q1',
        content: '请问审计的预期成果是什么？',
        required: true,
        placeholder: '例如：形成审计报告、提出整改建议'
      }
    ]
  },
  {
    id: 'requirements',
    name: '取证要求',
    status: 'pending',
    requiredQuestions: 3,
    questions: [
      {
        id: 'req_q1',
        content: '需要收集哪些类型的审计证据？',
        required: true,
        placeholder: '例如：会议纪要、财务报表、合同文件'
      },
      {
        id: 'req_q2',
        content: '证据的完整性要求是什么？',
        required: true,
        placeholder: '例如：原件或加盖公章的复印件'
      },
      {
        id: 'req_q3',
        content: '证据的时效性要求是什么？',
        required: false,
        placeholder: '例如：近三年的相关文件'
      }
    ]
  },
  {
    id: 'others',
    name: '其他说明',
    status: 'pending',
    requiredQuestions: 0,
    optional: true,
    questions: []
  }
]

/**
 * 生成内容模板
 */
const CONTENT_TEMPLATES: Record<string, (context: any, answers?: string[]) => string> = {
  summary: (context) => `
    <h3>审计事项概要</h3>
    <p>${context.auditItem}主要针对${context.auditedUnit}在${new Date().getFullYear()}年度的相关事项进行审计。</p>
    <p><strong>审计目标：</strong>评估${context.auditItem}的合规性、合理性和有效性。</p>
    <p><strong>审计范围：</strong>涵盖${context.auditedUnit}及下属单位的相关业务活动。</p>
    <p><strong>审计期间：</strong>${new Date().getFullYear()}年1月1日至${new Date().getFullYear()}年12月31日。</p>
  `,

  risks: (context) => `
    <h3>风险点描述</h3>
    <p>根据${context.auditItem}的特点，主要关注以下风险点：</p>
    <ol>
      <li><strong>决策程序风险：</strong>重大事项是否经过"三重一大"决策程序，是否存在未经集体决策的情况。</li>
      <li><strong>合规性风险：</strong>相关决策是否符合国家法律法规和公司制度要求。</li>
      <li><strong>效益性风险：</strong>决策实施后是否达到预期效果，是否存在资源浪费。</li>
      <li><strong>信息披露风险：</strong>重大事项信息披露是否及时、准确、完整。</li>
    </ol>
  `,

  procedures: (context, answers = []) => `
    <h3>审计程序</h3>
    <p>本次审计将按照以下程序开展：</p>
    <ol>
      <li><strong>准备阶段：</strong>
        <ul>
          <li>了解被审计单位基本情况和内部控制制度</li>
          <li>制定详细的审计实施方案</li>
          <li>组建审计工作组并明确分工</li>
        </ul>
      </li>
      <li><strong>实施阶段：</strong>
        <ul>
          ${answers[0] ? `<li>${answers[0]}</li>` : '<li>收集和分析相关审计证据</li>'}
          <li>开展现场审计和访谈工作</li>
          <li>编制审计工作底稿</li>
        </ul>
      </li>
      <li><strong>报告阶段：</strong>
        <ul>
          <li>汇总审计发现并形成审计报告</li>
          <li>与被审计单位沟通审计结果</li>
          <li>提出审计建议和整改要求</li>
        </ul>
      </li>
    </ol>
    ${answers[1] ? `<p><strong>重点关注：</strong>${answers[1]}</p>` : ''}
  `,

  results: (context, answers = []) => `
    <h3>预期结果</h3>
    <p>通过本次审计，预期达到以下成果：</p>
    <ol>
      <li><strong>审计报告：</strong>形成完整的审计报告，客观反映${context.auditItem}的实际情况。</li>
      <li><strong>问题清单：</strong>列明发现的问题及其严重程度，提供详细的问题描述和证据支持。</li>
      <li><strong>整改建议：</strong>针对发现的问题提出切实可行的整改建议和措施。</li>
      ${answers[0] ? `<li><strong>其他成果：</strong>${answers[0]}</li>` : ''}
    </ol>
    <p><strong>时间要求：</strong>审计报告应在审计结束后15个工作日内完成。</p>
  `,

  requirements: (context, answers = []) => `
    <h3>取证要求</h3>
    <p>审计取证应遵循以下要求：</p>
    <ol>
      <li><strong>证据类型：</strong>
        <ul>
          ${answers[0] ? `<li>${answers[0]}</li>` : '<li>书面文件：会议纪要、决议文件、合同协议等</li>'}
          <li>财务资料：财务报表、凭证、账簿等</li>
          <li>电子数据：邮件记录、系统数据等</li>
          <li>访谈记录：关键人员访谈笔录</li>
        </ul>
      </li>
      <li><strong>完整性要求：</strong>
        ${answers[1] ? `<p>${answers[1]}</p>` : '<p>所有证据应保持完整性，原件或加盖公章的复印件均可。电子数据应确保未被篡改。</p>'}
      </li>
      <li><strong>时效性要求：</strong>
        ${answers[2] ? `<p>${answers[2]}</p>` : '<p>证据应涵盖审计期间的所有相关事项，必要时可追溯至更早期间。</p>'}
      </li>
      <li><strong>保密要求：</strong>
        <p>所有审计证据应妥善保管，严格遵守保密规定，未经授权不得对外披露。</p>
      </li>
    </ol>
  `,

  others: (context) => `
    <h3>其他说明</h3>
    <p><strong>审计依据：</strong></p>
    <ul>
      <li>《中华人民共和国审计法》</li>
      <li>《内部审计准则》</li>
      <li>${context.auditedUnit}相关管理制度</li>
    </ul>
    <p><strong>注意事项：</strong></p>
    <ul>
      <li>审计过程中应保持独立性和客观性</li>
      <li>发现重大问题应及时报告</li>
      <li>审计工作底稿应完整保存</li>
    </ul>
  `
}

/**
 * 模拟AI生成内容
 */
export function generateSectionMock(request: GenerateRequest): Promise<GenerateResponse> {
  return new Promise((resolve) => {
    // 模拟网络延迟
    setTimeout(() => {
      const template = CONTENT_TEMPLATES[request.sectionId]

      if (!template) {
        resolve({
          success: false,
          content: '',
          message: '未找到对应的章节模板'
        })
        return
      }

      const content = template(request.context, request.answers)

      resolve({
        success: true,
        content: content.trim()
      })
    }, 1500) // 1.5秒延迟
  })
}

/**
 * 批量生成所有章节
 */
export function generateAllSectionsMock(
  context: any,
  mode: 'quick' | 'complete'
): Promise<Record<string, string>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const contents: Record<string, string> = {}

      STANDARD_SECTIONS.forEach((section) => {
        const template = CONTENT_TEMPLATES[section.id]
        if (template) {
          // 快速模式：AI自动推断答案
          const autoAnswers = mode === 'quick' ? ['自动推断的内容'] : undefined
          contents[section.id] = template(context, autoAnswers).trim()
        }
      })

      resolve(contents)
    }, 3000) // 3秒延迟
  })
}
