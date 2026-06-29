/**
 * 审计统计台账数据比对 - Mock 数据与函数
 * 提供：审计类型选项、基准台账列表的增删查、获取台账详情、执行比对
 * 采用 USE_MOCK 开关 + 动态 import 函数式（与 process-config.ts 一致），非 mockjs 拦截
 */
import type {
  AuditTypeOption,
  ReportData,
  ReportRow,
  ReportHeader,
  ComparisonRow,
  ComparisonResult,
  ComparisonSummary,
  CompareStatus,
  BaselineLedger,
  LedgerQuery,
  GenerateLedgerForm
} from '@/types/report-compare'

// 模拟接口延迟
const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms))

// ==================== 基础选项 ====================

// 审计类型选项（仅两种：财政类、经济责任审计类）
const auditTypeOptions: AuditTypeOption[] = [
  { value: 'finance', label: '财政类审计情况报表' },
  { value: 'economic', label: '经济责任审计情况报表' }
]

// 指标模板项（名称 + 单位 + 层级），按样表「财政类审计情况报表」结构
interface IndicatorTemplate {
  name: string
  unit: string
  level: number
}

// 标准审计统计台账 - 完整指标模板（对照样表层级缩进，level 表示层级深度）
const standardIndicators: IndicatorTemplate[] = [
  { name: '一、审计单位', unit: '个', level: 0 },
  { name: '审计', unit: '个', level: 1 },
  { name: '二、延伸审计单位', unit: '个', level: 0 },
  { name: '三、审计专项资金总额', unit: '元', level: 0 },
  { name: '四、项目投资额', unit: '元', level: 0 },
  { name: '外资', unit: '元', level: 1 },
  { name: '其他', unit: '元', level: 1 },
  { name: '完成投资额', unit: '元', level: 2 },
  { name: '五、核减投资额（工程款）', unit: '元', level: 0 },
  { name: '概预算', unit: '元', level: 1 },
  { name: '结决算', unit: '元', level: 1 },
  { name: '六、审计报告情况', unit: '', level: 0 },
  { name: '审计报告', unit: '篇', level: 1 },
  { name: '审计报告', unit: '篇', level: 2 },
  { name: '中英文', unit: '篇', level: 2 },
  { name: '无保留意见', unit: '篇', level: 3 },
  { name: '其他', unit: '篇', level: 3 },
  { name: '被批示、采用审计报告', unit: '篇*次', level: 1 },
  { name: '七、审计查出主要问题金额', unit: '元', level: 0 },
  { name: '违规金额', unit: '元', level: 1 },
  { name: '预算编报不真实不完整', unit: '元', level: 2 },
  { name: '预算编制批复不规范', unit: '元', level: 2 },
  { name: '违规变更调整预算', unit: '元', level: 2 },
  { name: '未按规定纳入预算管理', unit: '元', level: 2 },
  { name: '未按规定征收缴纳收入', unit: '元', level: 2 },
  { name: '政策性税费流失', unit: '元', level: 3 },
  { name: '少计少缴税费', unit: '元', level: 3 },
  { name: '人为调节收入进度', unit: '元', level: 3 },
  { name: '违规批准减免税', unit: '元', level: 3 },
  { name: '其他', unit: '元', level: 3 },
  { name: '隐瞒转移截留资金', unit: '元', level: 2 },
  { name: '擅自动用支配国库库款', unit: '元', level: 2 },
  { name: '未落实收支两条线和专户管理规定', unit: '元', level: 2 },
  { name: '违规改变项目计划和资金用途', unit: '元', level: 2 },
  { name: '未按规定征提基金', unit: '元', level: 2 },
  { name: '乱收费乱摊派乱罚款', unit: '元', level: 2 },
  { name: '资金滞留闲置', unit: '元', level: 2 },
  { name: '违规使用发票', unit: '元', level: 2 },
  { name: '虚报冒领', unit: '元', level: 2 },
  { name: '虚列支出', unit: '元', level: 2 },
  { name: '扩大开支范围或提高开支标准列支', unit: '元', level: 2 },
  { name: '擅自处置国有资产', unit: '元', level: 2 },
  { name: '违规出借财政资金', unit: '元', level: 2 },
  { name: '违规采购', unit: '元', level: 2 },
  { name: '违规担保', unit: '元', level: 2 },
  { name: '决算草案编制不规范', unit: '元', level: 2 },
  { name: '违规办理结算或批复决算', unit: '元', level: 2 },
  { name: '决算草案编报不真实不完整', unit: '元', level: 2 },
  { name: '资金来源不合规', unit: '元', level: 2 },
  { name: '资金不到位不落实', unit: '元', level: 2 },
  { name: '配套资金', unit: '元', level: 3 },
  { name: '其他', unit: '元', level: 3 },
  { name: '工程结算款不实', unit: '元', level: 2 },
  { name: '多计', unit: '元', level: 3 },
  { name: '少计', unit: '元', level: 3 },
  { name: '未按进度支付工程款', unit: '元', level: 2 },
  { name: '投资概预算编报不规范', unit: '元', level: 2 },
  { name: '超规模超标准项目', unit: '元', level: 2 },
  { name: '违规分包非法转包', unit: '元', level: 2 },
  { name: '挤占建设成本', unit: '元', level: 2 },
  { name: '违规收取费用', unit: '元', level: 2 },
  { name: '套取项目资金', unit: '元', level: 2 },
  { name: '内资', unit: '元', level: 3 },
  { name: '外资', unit: '元', level: 3 },
  { name: '交付资产不实', unit: '元', level: 2 },
  { name: '工作量不实', unit: '元', level: 2 },
  { name: '倒卖项目物资', unit: '元', level: 2 },
  { name: '账外资产（含私存私放）', unit: '元', level: 2 },
  { name: '会计核算不实', unit: '元', level: 2 },
  { name: '未按规定补偿征地补偿款', unit: '元', level: 2 },
  { name: '未落实被征地农民社会保障金', unit: '元', level: 2 },
  { name: '高风险对外投资（担保）', unit: '元', level: 2 },
  { name: '其他', unit: '元', level: 2 },
  { name: '管理不规范金额', unit: '元', level: 1 },
  { name: '预算编报不真实不完整', unit: '元', level: 2 },
  { name: '预算编制批复不规范', unit: '元', level: 2 },
  { name: '违规变更调整预算', unit: '元', level: 2 },
  { name: '未按规定纳入预算管理', unit: '元', level: 2 },
  { name: '未按规定征收缴纳收入', unit: '元', level: 2 },
  { name: '政策性税费流失', unit: '元', level: 3 },
  { name: '少计少缴税费', unit: '元', level: 3 },
  { name: '人为调节收入进度', unit: '元', level: 3 },
  { name: '违规批准减免税', unit: '元', level: 3 },
  { name: '其他', unit: '元', level: 3 },
  { name: '隐瞒转移截留资金', unit: '元', level: 2 },
  { name: '擅自动用支配国库库款', unit: '元', level: 2 },
  { name: '未落实收支两条线和专户管理规定', unit: '元', level: 2 },
  { name: '违规改变项目计划和资金用途', unit: '元', level: 2 },
  { name: '未按规定征提基金', unit: '元', level: 2 },
  { name: '乱收费乱摊派乱罚款', unit: '元', level: 2 },
  { name: '资金滞留闲置', unit: '元', level: 2 },
  { name: '违规使用发票', unit: '元', level: 2 },
  { name: '虚报冒领', unit: '元', level: 2 },
  { name: '虚列支出', unit: '元', level: 2 },
  { name: '扩大开支范围或提高开支标准列支', unit: '元', level: 2 },
  { name: '擅自处置国有资产', unit: '元', level: 2 },
  { name: '违规出借财政资金', unit: '元', level: 2 },
  { name: '违规采购', unit: '元', level: 2 },
  { name: '违规担保', unit: '元', level: 2 },
  { name: '决算草案编制不规范', unit: '元', level: 2 },
  { name: '违规办理结算或批复决算', unit: '元', level: 2 },
  { name: '决算草案编报不真实不完整', unit: '元', level: 2 },
  { name: '资金来源不合规', unit: '元', level: 2 },
  { name: '资金不到位不落实', unit: '元', level: 2 },
  { name: '配套资金', unit: '元', level: 3 },
  { name: '其他', unit: '元', level: 3 },
  { name: '工程结算款不实', unit: '元', level: 2 },
  { name: '多计', unit: '元', level: 3 },
  { name: '少计', unit: '元', level: 3 },
  { name: '未按进度支付工程款', unit: '元', level: 2 },
  { name: '投资概预算编报不规范', unit: '元', level: 2 },
  { name: '超规模超标准项目', unit: '元', level: 2 },
  { name: '违规分包非法转包', unit: '元', level: 2 },
  { name: '挤占建设成本', unit: '元', level: 2 },
  { name: '违规收取费用', unit: '元', level: 2 },
  { name: '套取项目资金', unit: '元', level: 2 },
  { name: '内资', unit: '元', level: 3 },
  { name: '外资', unit: '元', level: 3 },
  { name: '交付资产不实', unit: '元', level: 2 },
  { name: '工作量不实', unit: '元', level: 2 },
  { name: '倒卖项目物资', unit: '元', level: 2 },
  { name: '账外资产', unit: '元', level: 2 },
  { name: '会计核算不实', unit: '元', level: 2 },
  { name: '未按规定补偿征地补偿款', unit: '元', level: 2 },
  { name: '未落实被征地农民社会保障金', unit: '元', level: 2 },
  { name: '高风险对外投资（担保）', unit: '元', level: 2 },
  { name: '其他', unit: '元', level: 3 },
  { name: '其他', unit: '元', level: 2 },
  { name: '损失浪费金额', unit: '元', level: 1 },
  { name: '管理不善', unit: '元', level: 2 },
  { name: '决策失误', unit: '元', level: 2 },
  { name: '八、审计发现非金额计量问题', unit: '个', level: 0 },
  { name: '违规决策', unit: '项', level: 1 },
  { name: '违规招投标签订合同', unit: '份', level: 1 },
  { name: '逾期未建成项目', unit: '个', level: 1 },
  { name: '违规招投标合同签订金额', unit: '元', level: 1 },
  { name: '项目工程质量存在问题', unit: '个', level: 1 },
  { name: '擅自调整项目建设内容', unit: '项', level: 1 },
  { name: '违规征地', unit: '亩', level: 1 },
  { name: '耕地', unit: '亩', level: 2 },
  { name: '基本农田', unit: '亩', level: 2 },
  { name: '其他', unit: '亩', level: 2 },
  { name: '违规占地', unit: '亩', level: 1 },
  { name: '耕地', unit: '亩', level: 2 },
  { name: '基本农田', unit: '亩', level: 2 },
  { name: '其他', unit: '亩', level: 2 },
  { name: '违规批地', unit: '亩', level: 1 },
  { name: '耕地', unit: '亩', level: 2 },
  { name: '基本农田', unit: '亩', level: 2 },
  { name: '其他', unit: '亩', level: 2 },
  { name: '违规供地', unit: '亩', level: 1 },
  { name: '违规出让土地', unit: '亩', level: 2 },
  { name: '违规划拨土地', unit: '亩', level: 2 },
  { name: '其他', unit: '亩', level: 2 },
  { name: '违规买卖、转让土地', unit: '亩', level: 1 },
  { name: '违规批准调整规划增加建筑面积', unit: '万平方米', level: 1 },
  { name: '违规拆迁面积', unit: '万平方米', level: 1 },
  { name: '补充耕地不足', unit: '亩', level: 1 },
  { name: '被征地农民未纳入社保范围', unit: '人', level: 1 },
  { name: '违规审批出让矿业权', unit: '宗', level: 1 },
  { name: '违规转让矿业权', unit: '宗', level: 1 },
  { name: '无证开采或违规生产', unit: '个', level: 1 },
  { name: '未按规定建成污染防治项目', unit: '个', level: 1 },
  { name: '未按规定建成污染防治比例', unit: '%', level: 1 },
  { name: '未严格执行环评制度', unit: '项', level: 1 },
  { name: '多耗能源—标准煤', unit: '万吨', level: 1 },
  { name: '多排放主要污染物', unit: '万吨', level: 1 },
  { name: '超标排放单位', unit: '个', level: 1 },
  { name: '违规取用水单位', unit: '个', level: 1 },
  { name: '违规取用水数量', unit: '万立方米', level: 1 },
  { name: '总体目标不明确或无考核标准', unit: '个', level: 1 },
  { name: '总体可行性研究有重大缺陷', unit: '个', level: 1 },
  { name: '未按规定进行项目结算或竣工结算', unit: '个', level: 1 },
  { name: '使用（运营）未达到总体设计目标', unit: '个', level: 1 },
  { name: '内部控制有重大缺陷', unit: '个', level: 1 },
  { name: '其他', unit: '项', level: 2 },
  { name: '其他', unit: '项', level: 1 },
  { name: '九、审计发现侵害人民群众利益', unit: '元', level: 0 },
  { name: '十、审计期间整改金额', unit: '元', level: 0 },
  { name: '十一、审计处理情况', unit: '', level: 0 },
  { name: '审计处理处罚', unit: '元', level: 1 },
  { name: '应归还原渠道资金', unit: '元', level: 2 },
  { name: '移送处理事项', unit: '件', level: 1 },
  { name: '司法机关', unit: '件', level: 2 },
  { name: '纪检监察机关', unit: '件', level: 2 },
  { name: '有关部门', unit: '件', level: 2 },
  { name: '移送处理人员', unit: '人', level: 1 },
  { name: '司法机关', unit: '人', level: 2 },
  { name: '地厅级及以上', unit: '人', level: 3 },
  { name: '县处级', unit: '人', level: 3 },
  { name: '乡科级及以下', unit: '人', level: 3 },
  { name: '其他', unit: '人', level: 3 },
  { name: '纪检监察机关', unit: '人', level: 2 },
  { name: '地厅级及以上', unit: '人', level: 3 },
  { name: '县处级', unit: '人', level: 3 },
  { name: '乡科级及以下', unit: '人', level: 3 },
  { name: '其他', unit: '人', level: 3 },
  { name: '有关部门', unit: '人', level: 2 },
  { name: '地厅级及以上', unit: '人', level: 3 },
  { name: '县处级', unit: '人', level: 3 },
  { name: '乡科级及以下', unit: '人', level: 3 },
  { name: '其他', unit: '人', level: 3 },
  { name: '移送处理金额', unit: '元', level: 1 },
  { name: '司法机关', unit: '元', level: 2 },
  { name: '纪检监察机关', unit: '元', level: 2 },
  { name: '有关部门', unit: '元', level: 2 },
  { name: '十二、审计处理结果落实情况', unit: '', level: 0 },
  { name: '审计促进拨付资金到位', unit: '元', level: 1 },
  { name: '审计后挽回（避免）损失', unit: '元', level: 1 },
  { name: '移送处理落实事项', unit: '件', level: 1 },
  { name: '司法机关已立案', unit: '件', level: 2 },
  { name: '纪检监察机关已处理', unit: '件', level: 2 },
  { name: '有关部门已处理', unit: '件', level: 2 },
  { name: '移送处理落实人员', unit: '人', level: 1 },
  { name: '已追究刑事责任', unit: '人', level: 2 },
  { name: '已给予党纪政纪处分', unit: '人', level: 2 },
  { name: '有关部门已处理人员', unit: '人', level: 2 },
  { name: '十三、审计成果利用情况', unit: '', level: 0 },
  { name: '审计提出建议', unit: '条', level: 1 },
  { name: '建议制定修改部门规定', unit: '条', level: 2 },
  { name: '建议制定修改法律法规', unit: '条', level: 2 },
  { name: '其他', unit: '条', level: 2 },
  { name: '被采纳审计建议', unit: '条', level: 1 },
  { name: '被审计单位制定整改措施', unit: '项', level: 1 },
  { name: '被审计单位建立健全规章制度', unit: '项', level: 1 },
  { name: '促进修改法律法规', unit: '条', level: 1 },
  { name: '提交审计信息', unit: '篇', level: 1 },
  { name: '审计专题、综合性报告', unit: '篇', level: 2 },
  { name: '信息简报', unit: '篇', level: 2 },
  { name: '重要审计信息', unit: '篇', level: 3 },
  { name: '其他', unit: '篇', level: 3 },
  { name: '被批示、采用审计信息', unit: '篇*次', level: 1 },
  { name: '审计专题、综合性报告', unit: '篇*次', level: 2 },
  { name: '信息简报', unit: '篇*次', level: 2 },
  { name: '重要审计信息', unit: '篇*次', level: 3 },
  { name: '其他', unit: '篇*次', level: 3 },
  { name: '审计信息移送案件事项', unit: '项', level: 1 },
  { name: '审计信息移送案件涉案人员', unit: '人', level: 1 },
  { name: '地厅级及以上', unit: '人', level: 2 },
  { name: '县处级', unit: '人', level: 2 },
  { name: '乡科级及以下', unit: '人', level: 2 },
  { name: '其他', unit: '人', level: 2 },
  { name: '审计信息移送案件涉案金额', unit: '元', level: 1 },
  { name: '十四、审计业务工作量', unit: '人*日', level: 0 },
  { name: '外勤工作量', unit: '人*日', level: 1 },
  { name: '业务工作利用外部人员工作量', unit: '人*日', level: 1 },
  { name: '聘请', unit: '人*日', level: 2 },
  { name: '借用', unit: '人*日', level: 2 },
  { name: '绩效审计工作量', unit: '人*日', level: 1 },
  { name: '十五、审计经费', unit: '元', level: 0 },
  { name: '审计项目支出', unit: '元', level: 1 },
  { name: '外勤经费支出', unit: '元', level: 2 },
  { name: '业务工作利用外部人员经费', unit: '元', level: 2 },
  { name: '聘请', unit: '元', level: 3 },
  { name: '借用', unit: '元', level: 3 }
]

// 经济责任审计类报表 - 完整指标模板（对照样表层级缩进）
const economicIndicators: IndicatorTemplate[] = [
  { name: '一、被审计领导干部', unit: '人', level: 0 },
  { name: '任中审计', unit: '人', level: 1 },
  { name: '省部级', unit: '人', level: 2 },
  { name: '地厅级', unit: '人', level: 2 },
  { name: '县处级', unit: '人', level: 2 },
  { name: '乡科级', unit: '人', level: 2 },
  { name: '中央企业、金融机构', unit: '人', level: 2 },
  { name: '地方企业、金融机构', unit: '人', level: 2 },
  { name: '其他', unit: '人', level: 2 },
  { name: '离任审计', unit: '人', level: 1 },
  { name: '省部级', unit: '人', level: 2 },
  { name: '地厅级', unit: '人', level: 2 },
  { name: '县处级', unit: '人', level: 2 },
  { name: '乡科级', unit: '人', level: 2 },
  { name: '中央企业、金融机构', unit: '人', level: 2 },
  { name: '地方企业、金融机构', unit: '人', level: 2 },
  { name: '其他', unit: '人', level: 2 },
  { name: '二、审计单位', unit: '个', level: 0 },
  { name: '三、审计查出主要问题金额', unit: '元', level: 0 },
  { name: '违规金额', unit: '元', level: 1 },
  { name: '领导责任(违规)', unit: '元', level: 2 },
  { name: '主管责任(违规)', unit: '元', level: 2 },
  { name: '直接责任(违规)', unit: '元', level: 2 },
  { name: '管理不规范金额', unit: '元', level: 1 },
  { name: '领导责任(管理不规范)', unit: '元', level: 2 },
  { name: '主管责任(管理不规范)', unit: '元', level: 2 },
  { name: '直接责任(管理不规范)', unit: '元', level: 2 },
  { name: '损失浪费金额', unit: '元', level: 1 },
  { name: '领导责任(损失浪费)', unit: '元', level: 2 },
  { name: '主管责任(损失浪费)', unit: '元', level: 2 },
  { name: '直接责任(损失浪费)', unit: '元', level: 2 },
  { name: '四、审计发现侵害人民群众利益', unit: '元', level: 0 },
  { name: '五、审计处理被审计领导干部情况', unit: '', level: 0 },
  { name: '涉嫌个人经济问题人数', unit: '人', level: 1 },
  { name: '涉嫌个人经济问题金额', unit: '元', level: 1 },
  { name: '撤职、降级', unit: '人', level: 1 },
  { name: '移送司法机关', unit: '人', level: 1 },
  { name: '移送纪检监察机关', unit: '人', level: 1 },
  { name: '其他处分', unit: '人', level: 1 },
  { name: '六、审计处理其他人员情况', unit: '', level: 0 },
  { name: '涉嫌个人经济问题人数', unit: '人', level: 1 },
  { name: '涉嫌个人经济问题金额', unit: '元', level: 1 },
  { name: '撤职、降级', unit: '人', level: 1 },
  { name: '移送司法机关', unit: '人', level: 1 },
  { name: '移送纪检监察机关', unit: '人', level: 1 },
  { name: '其他处分', unit: '人', level: 1 },
  { name: '七、增收节支', unit: '元', level: 0 },
  { name: '已上交财政', unit: '元', level: 1 },
  { name: '已减少财政拨款或补贴', unit: '元', level: 1 },
  { name: '已归还原渠道资金', unit: '元', level: 1 },
  { name: '八、审计结果利用情况', unit: '', level: 0 },
  { name: '提交审计报告和审计结果报告', unit: '篇', level: 1 },
  { name: '被批示采用审计报告和审计结果报告', unit: '篇*次', level: 1 },
  { name: '审计提出建议', unit: '条', level: 1 },
  { name: '被采纳的审计建议', unit: '条', level: 1 },
  { name: '提交审计信息', unit: '篇', level: 1 },
  { name: '审计专题、综合性报告', unit: '篇', level: 2 },
  { name: '信息简报', unit: '篇', level: 2 },
  { name: '被批示、采用审计信息', unit: '篇*次', level: 1 },
  { name: '审计专题、综合性报告', unit: '篇*次', level: 2 },
  { name: '信息简报', unit: '篇*次', level: 2 },
  { name: '审计信息移送案件涉案人员', unit: '人', level: 1 },
  { name: '审计信息移送案件涉案金额', unit: '元', level: 1 },
  { name: '举报或反映有问题的被审计领导干部', unit: '人', level: 1 },
  { name: '经审计澄清问题的被审计领导干部', unit: '人', level: 1 },
  { name: '参考审计结果得到肯定或使用的被审计领导干部', unit: '人', level: 1 },
  { name: '九、在一定范围内通报审计结果', unit: '篇*次', level: 0 },
  { name: '十、向社会公告审计结果', unit: '篇', level: 0 }
]

// 各审计类型对应的指标模板
const indicatorTemplateMap: Record<string, IndicatorTemplate[]> = {
  finance: standardIndicators,
  economic: economicIndicators
}

// 全半角统一 + 去前后空格，构造归一化文本（用于匹配键）
const normalize = (text: string): string => {
  return text
    .replace(/[！-～]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0)) // 全角转半角
    .replace(/\u3000/g, ' ') // 全角空格转半角
    .trim()
}

// 由模板生成带层级路径的匹配键：父级路径用 / 拼接，避免同名指标在不同层级错配
const buildMatchKeys = (items: IndicatorTemplate[]): ReportRow[] => {
  const pathStack: string[] = [] // 各层级最近一次出现的指标名
  return items.map((item) => {
    pathStack[item.level] = normalize(item.name)
    pathStack.length = item.level + 1 // 截断更深层级的残留
    const matchKey = pathStack.slice(0, item.level + 1).join('/')
    return {
      indicatorName: item.name,
      unit: item.unit,
      value: '',
      level: item.level,
      matchKey
    }
  })
}

// 伪随机指标值：依据审计类型与年度生成稳定数据（同参数多次生成结果一致）
const seededValue = (seed: string, unit: string): string => {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) & 0x7fffffff
  }
  // 金额类（元）给较大数值，计数类（个/篇）给较小整数
  if (unit === '元') return String((hash % 9000000) + 10000)
  if (unit === '篇*次') return String(hash % 30)
  return String(hash % 50)
}

// 按审计类型聚合生成基准台账（mock：用模板 + 伪随机值模拟整改系统聚合结果）
const generateBaseline = (auditType: string, projectYear: string): ReportData => {
  const template = indicatorTemplateMap[auditType] || []
  const rows = buildMatchKeys(template).map((row) => ({
    ...row,
    // 非分组标题行（有单位）才填值，纯标题行（无单位）留空
    value: row.unit ? seededValue(`${auditType}-${projectYear}-${row.matchKey}`, row.unit) : ''
  }))
  const typeName = auditTypeOptions.find((t) => t.value === auditType)?.label || ''
  const header: ReportHeader = {
    ledgerNo: `TZ-${auditType.toUpperCase()}-${projectYear}`,
    projectName: `${projectYear}年度${typeName}汇总`,
    projectYear,
    auditOrg: '国家审计署',
    auditedUnit: `${typeName.replace('审计情况报表', '')}相关单位（汇总）`,
    reportType: typeName,
    detailCategory: '汇总',
    fillUnit: '审计统计处',
    fillUser: '系统自动生成',
    fillDate: `${projectYear}-12-31`,
    auditDoc: '审计统计台账',
    docNo: `审统〔${projectYear}〕${(parseInt(projectYear, 10) % 100) + 1}号`
  }
  return { header, rows }
}

// 执行严格精确比对：以 matchKey 为唯一键配对，输出四种状态
const compareReports = (baseline: ReportData, uploaded: ReportData): ComparisonResult => {
  // 上传侧建索引（matchKey -> 行）
  const uploadedMap = new Map<string, ReportRow>()
  uploaded.rows.forEach((r) => uploadedMap.set(r.matchKey, r))

  const rows: ComparisonRow[] = []
  const matchedKeys = new Set<string>()

  // 1. 遍历基准侧：判定一致 / 差异 / 缺失
  baseline.rows.forEach((base) => {
    const up = uploadedMap.get(base.matchKey)
    matchedKeys.add(base.matchKey)
    let status: CompareStatus
    if (!up) {
      status = 'missing' // 系统有、上传无
    } else if (normalize(base.value) === normalize(up.value)) {
      status = 'consistent' // 严格精确匹配（归一化后完全相同）
    } else {
      status = 'diff' // 双方都有但值不同
    }
    rows.push({
      matchKey: base.matchKey,
      indicatorName: base.indicatorName,
      unit: base.unit,
      level: base.level,
      baselineValue: base.value,
      uploadedValue: up ? up.value : null,
      status
    })
  })

  // 2. 遍历上传侧：找出模板外多余项
  uploaded.rows.forEach((up) => {
    if (!matchedKeys.has(up.matchKey)) {
      rows.push({
        matchKey: up.matchKey,
        indicatorName: up.indicatorName,
        unit: up.unit,
        level: up.level,
        baselineValue: null,
        uploadedValue: up.value,
        status: 'extra'
      })
    }
  })

  // 3. 汇总统计
  const summary: ComparisonSummary = {
    total: rows.length,
    consistent: rows.filter((r) => r.status === 'consistent').length,
    diff: rows.filter((r) => r.status === 'diff').length,
    missing: rows.filter((r) => r.status === 'missing').length,
    extra: rows.filter((r) => r.status === 'extra').length,
    isAllConsistent: false
  }
  summary.isAllConsistent =
    summary.diff === 0 && summary.missing === 0 && summary.extra === 0 && summary.total > 0

  return { summary, rows }
}

// ==================== 基准台账存储（模块级变量持久化） ====================

const ledgerList: BaselineLedger[] = []
let ledgerIdSeed = 1000

// 预置两条示例台账，便于列表展示（其中经济责任台账预置一份比对结果，便于查看「比对结果」）
const seedLedgers = () => {
  if (ledgerList.length) return
  const presets: GenerateLedgerForm[] = [
    { name: '2026年度财政类审计情况汇总（一季度）', auditType: 'finance', projectYear: '2026' },
    {
      name: '2025年度经济责任审计情况汇总',
      auditType: 'economic',
      projectYear: '2025'
    }
  ]
  presets.forEach((p) => createLedgerRecord(p))

  // 给经济责任台账造一份示例比对结果：克隆基准 → 改几处值 / 删一项 / 加一项
  const econ = ledgerList.find((l) => l.auditType === 'economic')
  if (econ) {
    const uploadedRows: ReportRow[] = econ.report.rows
      // 删除最后一项，制造「缺失」
      .slice(0, -1)
      .map((r, idx) => {
        // 改动第 3、8、15 项的值，制造「差异」
        if ([3, 8, 15].includes(idx) && r.value) {
          return { ...r, value: String(Number(r.value) + 12345) }
        }
        return { ...r }
      })
    // 追加一项模板外指标，制造「多余」
    uploadedRows.push({
      indicatorName: '其他自定义指标',
      unit: '项',
      value: '3',
      level: 0,
      matchKey: '其他自定义指标'
    })
    econ.comparison = compareReports(econ.report, { header: {}, rows: uploadedRows })
    econ.comparedFileName = '2025年度经济责任审计情况汇总(上传).xlsx'
  }
}

// 创建一条台账记录（内部复用）
const createLedgerRecord = (form: GenerateLedgerForm): BaselineLedger => {
  const report = generateBaseline(form.auditType, form.projectYear)
  const reportType = auditTypeOptions.find((t) => t.value === form.auditType)?.label || ''
  const record: BaselineLedger = {
    id: ++ledgerIdSeed,
    name: form.name,
    auditType: form.auditType,
    reportType,
    projectYear: form.projectYear,
    creator: '当前审计员',
    createTime: new Date().toLocaleString('zh-CN', { hour12: false }),
    report
  }
  ledgerList.unshift(record)
  return record
}

// ==================== 导出接口函数 ====================

/** 获取审计类型选项 */
export const getAuditTypeOptions = async () => {
  await delay(100)
  return { code: 200, data: auditTypeOptions, message: 'success' }
}

/** 获取基准台账列表（支持审计类型/名称/年度筛选 + 分页） */
export const getLedgerList = async (query: LedgerQuery) => {
  await delay()
  seedLedgers()
  let list = [...ledgerList]
  if (query.auditType) list = list.filter((l) => l.auditType === query.auditType)
  if (query.name) list = list.filter((l) => l.name.includes(query.name!))
  if (query.projectYear) list = list.filter((l) => l.projectYear === query.projectYear)
  const total = list.length
  const start = (query.page - 1) * query.pageSize
  const pageList = list.slice(start, start + query.pageSize)
  return { code: 200, data: { list: pageList, total }, message: 'success' }
}

/** 生成基准台账（同审计类型+年度可多次生成，每次为独立记录） */
export const generateLedger = async (form: GenerateLedgerForm) => {
  await delay()
  const template = indicatorTemplateMap[form.auditType]
  // 该审计类型无模板/无数据
  if (!template || template.length === 0) {
    return { code: 500, data: null, message: '该审计类型暂无可比对数据' }
  }
  const record = createLedgerRecord(form)
  return { code: 200, data: record, message: '生成成功' }
}

/** 获取台账详情（含完整基准报表，供比对页使用） */
export const getLedgerDetail = async (id: number) => {
  await delay()
  const record = ledgerList.find((l) => l.id === id)
  return record
    ? { code: 200, data: record, message: 'success' }
    : { code: 500, data: null, message: '台账不存在' }
}

/** 删除基准台账 */
export const deleteLedger = async (id: number) => {
  await delay()
  const idx = ledgerList.findIndex((l) => l.id === id)
  if (idx === -1) return { code: 500, data: null, message: '台账不存在' }
  ledgerList.splice(idx, 1)
  return { code: 200, data: null, message: '删除成功' }
}

/** 执行比对（传入台账 ID + 上传数据，比对结果回存台账，供列表「比对结果」入口回看） */
export const executeComparison = async (params: {
  ledgerId: number
  uploaded: ReportData
  fileName?: string
}) => {
  await delay()
  const ledger = ledgerList.find((l) => l.id === params.ledgerId)
  if (!ledger) return { code: 500, data: null, message: '台账不存在' }
  const result = compareReports(ledger.report, params.uploaded)
  // 回存比对结果快照
  ledger.comparison = result
  ledger.comparedFileName = params.fileName
  return { code: 200, data: result, message: 'success' }
}

/** 获取标准模板的指标项（供前端导出空白模板使用） */
export const getTemplateIndicators = async (auditType: string) => {
  await delay(100)
  const template = indicatorTemplateMap[auditType]
  if (!template || template.length === 0) {
    return { code: 500, data: null, message: '该审计类型暂无模板' }
  }
  const rows = buildMatchKeys(template)
  return { code: 200, data: rows, message: 'success' }
}
