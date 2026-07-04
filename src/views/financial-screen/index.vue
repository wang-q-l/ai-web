<template>
  <!-- 财务数据分析大屏：暗色科技风，纯静态展示 -->
  <div class="fin-screen">
    <!-- 顶部标题栏 -->
    <header class="fin-header">
      <div class="fin-header__title">
        <span class="fin-header__bar"></span>
        <div>
          <h1>新疆医科大学财务数据分析大屏</h1>
          <p>实时财务数据监控与分析</p>
        </div>
      </div>
      <div class="fin-header__time">
        <el-icon><Clock /></el-icon>
        <span>数据更新时间：</span>
        <em>{{ updateTime }}</em>
      </div>
    </header>

    <!-- 页签切换：财务分析 / 专项分析 -->
    <nav class="fin-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="fin-tab"
        :class="{ 'is-active': activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </nav>

    <!-- 财务分析页签 -->
    <div v-show="activeTab === 'financial'">
      <!-- 指标卡片区：5 张不同主题色渐变卡片 -->
      <section class="fin-cards">
        <div
          v-for="card in metricCards"
          :key="card.key"
          class="fin-card"
          :class="`fin-card--${card.theme}`"
        >
          <div class="fin-card__head">
            <span class="fin-card__icon">
              <el-icon><component :is="card.icon" /></el-icon>
            </span>
            <span class="fin-card__name">{{ card.name }}</span>
          </div>
          <!-- 多指标卡片（预算数/执行数/执行率） -->
          <div v-if="card.metrics" class="fin-card__metrics">
            <div v-for="m in card.metrics" :key="m.label" class="fin-card__metric">
              <p class="fin-card__metric-label">{{ m.label }}</p>
              <p class="fin-card__metric-value" :class="{ 'is-rate': m.highlight }">{{
                m.value
              }}</p>
            </div>
          </div>
          <!-- 单值卡片（合计金额 / 比率） -->
          <div v-else class="fin-card__single">{{ card.value }}</div>
        </div>
      </section>

      <!-- 收支明细汇总表 -->
      <section class="fin-table-panel">
        <div class="fin-panel-title">
          <span class="fin-panel-title__bar"></span>
          收支明细汇总表
        </div>
        <el-table
          :data="tableData"
          border
          class="fin-table"
          :header-cell-style="headerCellStyle"
          :cell-style="cellStyle"
        >
          <!-- 单位名称：上下两行合并（单列自动跨两行表头） -->
          <el-table-column prop="unit" label="单位名称" min-width="160" fixed="left" />
          <!-- 预算收入分组（colspan 横跨三列） -->
          <el-table-column label="预算收入" align="center">
            <el-table-column
              prop="incomeBudget"
              label="预算数(万元)"
              min-width="130"
              align="right"
            />
            <el-table-column
              prop="incomeActual"
              label="执行数(万元)"
              min-width="130"
              align="right"
            />
            <el-table-column prop="incomeRate" label="执行率" min-width="110" align="center" />
          </el-table-column>
          <!-- 支出分组 -->
          <el-table-column label="支出" align="center">
            <el-table-column
              prop="expenseBudget"
              label="预算数(万元)"
              min-width="130"
              align="right"
            />
            <el-table-column
              prop="expenseActual"
              label="执行数(万元)"
              min-width="130"
              align="right"
            />
            <el-table-column prop="expenseRate" label="执行率" min-width="110" align="center" />
          </el-table-column>
          <!-- 银行存款：上下两行合并 -->
          <el-table-column
            prop="bankDeposit"
            label="银行存款(万元)"
            min-width="140"
            align="right"
          />
          <!-- 应付工程款：上下两行合并 -->
          <el-table-column prop="payable" label="应付工程款(万元)" min-width="150" align="right" />
          <!-- 资产负债率：上下两行合并 -->
          <el-table-column prop="debtRatio" label="资产负债率" min-width="120" align="center" />
        </el-table>
      </section>

      <!-- 分析项：四个图表同行排列 -->
      <section class="fin-analysis">
        <!-- 学校收入分析：6 维度收入预算 vs 收入执行对比 -->
        <div class="fin-analysis__panel">
          <div class="fin-panel-title">
            <span class="fin-panel-title__bar"></span>
            学校收入分析
          </div>
          <div ref="incomeChartRef" class="fin-analysis__chart"></div>
        </div>

        <!-- 学校统筹管理收入执行率排名（前五 / 后五） -->
        <div class="fin-analysis__panel">
          <div class="fin-panel-title">
            <span class="fin-panel-title__bar"></span>
            学校统筹管理收入执行率排名（部门前五 / 后五）
          </div>
          <div ref="rankChartRef" class="fin-analysis__chart"></div>
        </div>

        <!-- 学校支出分析：12 维度支出预算 vs 支出执行对比 -->
        <div class="fin-analysis__panel">
          <div class="fin-panel-title">
            <span class="fin-panel-title__bar"></span>
            学校支出分析
          </div>
          <div ref="expenseChartRef" class="fin-analysis__chart"></div>
        </div>

        <!-- 支出执行率排名（前五 / 后五） -->
        <div class="fin-analysis__panel">
          <div class="fin-panel-title">
            <span class="fin-panel-title__bar"></span>
            支出执行率排名（部门前五 / 后五）
          </div>
          <div ref="expenseRankChartRef" class="fin-analysis__chart"></div>
        </div>
      </section>
    </div>

    <!-- 专项分析页签 -->
    <div v-show="activeTab === 'special'">
      <!-- 专项项目统计卡片：中央专项 / 自治区专项 -->
      <section class="fin-special-cards">
        <div
          v-for="item in specialFunds"
          :key="item.key"
          class="fin-special-card"
          :class="`fin-special-card--${item.theme}`"
        >
          <div class="fin-special-card__head">
            <span class="fin-special-card__name">{{ item.name }}</span>
            <!-- 点击总数穿透查看项目分布明细 -->
            <span class="fin-special-card__total is-clickable" @click="openDistribution(item)">
              <em>{{ item.total }}</em> 个
            </span>
          </div>
          <!-- 历年结转专项 / 当年专项 -->
          <div class="fin-special-card__split">
            <div class="fin-special-card__part">
              <p class="fin-special-card__part-label">历年结转专项</p>
              <p class="fin-special-card__part-value">{{ item.carryover }}</p>
            </div>
            <div class="fin-special-card__part">
              <p class="fin-special-card__part-label">当年专项</p>
              <p class="fin-special-card__part-value">{{ item.current }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 专项明细表 -->
      <section class="fin-table-panel">
        <div class="fin-panel-title">
          <span class="fin-panel-title__bar"></span>
          专项明细表
        </div>
        <el-table
          :data="specialDetailData"
          border
          class="fin-table"
          :header-cell-style="headerCellStyle"
          :cell-style="cellStyle"
          :span-method="specialSpanMethod"
        >
          <!-- 项目来源：相同来源上下合并单元格 -->
          <el-table-column prop="source" label="项目来源" min-width="200" />
          <el-table-column prop="name" label="项目名称" min-width="380" />
          <el-table-column prop="allocated" label="到位数(万元)" min-width="130" align="right" />
          <el-table-column prop="executed" label="执行数(万元)" min-width="130" align="right" />
          <el-table-column prop="rate" label="执行率" min-width="110" align="center" />
        </el-table>
      </section>
    </div>

    <!-- 项目分布明细弹窗：点击专项总数穿透查看，按部门排序 -->
    <el-dialog
      v-model="distributionVisible"
      :title="`${distributionTitle} - 项目分布明细`"
      width="66.67%"
      top="8vh"
      class="fin-dialog"
      append-to-body
    >
      <el-table
        :data="distributionData"
        border
        max-height="70vh"
        class="fin-table"
        :header-cell-style="headerCellStyle"
        :cell-style="cellStyle"
        :span-method="distributionSpanMethod"
      >
        <!-- 部门：同部门相邻行合并单元格 -->
        <el-table-column prop="dept" label="部门" min-width="160" />
        <el-table-column prop="name" label="项目名称" min-width="320" />
        <el-table-column prop="allocated" label="到位数(万元)" min-width="120" align="right" />
        <el-table-column prop="executed" label="执行数(万元)" min-width="120" align="right" />
        <el-table-column prop="rate" label="执行率" min-width="100" align="center" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  // 页面说明：新疆医科大学财务数据分析大屏，纯静态展示，使用模拟数据
  import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
  import * as echarts from 'echarts'
  import { Money, Clock, TrendCharts, OfficeBuilding, Document } from '@element-plus/icons-vue'

  defineOptions({
    name: 'FinancialScreen'
  })

  // 数据更新时间（静态展示，固定示例时间）
  const updateTime = '2026/06/11 17:35:54'

  // 页签配置与当前激活页签
  const tabs = [
    { key: 'financial', label: '财务分析' },
    { key: 'special', label: '专项分析' }
  ] as const
  const activeTab = ref<'financial' | 'special'>('financial')

  // 顶部 5 张指标卡片数据
  const metricCards = [
    {
      key: 'income',
      name: '预算收入合计',
      theme: 'blue',
      icon: Money,
      metrics: [
        { label: '预算数', value: '¥33.50亿' },
        { label: '执行数', value: '¥30.79亿' },
        { label: '执行率', value: '91.9%', highlight: true }
      ]
    },
    {
      key: 'expense',
      name: '支出合计',
      theme: 'red',
      icon: TrendCharts,
      metrics: [
        { label: '预算数', value: '¥31.85亿' },
        { label: '执行数', value: '¥29.88亿' },
        { label: '执行率', value: '93.8%', highlight: true }
      ]
    },
    { key: 'bank', name: '银行存款合计', theme: 'green', icon: OfficeBuilding, value: '¥10.03亿' },
    { key: 'payable', name: '应付工程款合计', theme: 'amber', icon: Document, value: '¥2.13亿' },
    { key: 'debt', name: '平均资产负债率', theme: 'purple', icon: TrendCharts, value: '42.0%' }
  ]

  // 收支明细汇总表数据（模拟数据）
  const tableData = [
    {
      unit: '新疆医科大学',
      incomeBudget: '52000.00',
      incomeActual: '48500.00',
      incomeRate: '93.3%',
      expenseBudget: '48000.00',
      expenseActual: '45200.00',
      expenseRate: '94.2%',
      bankDeposit: '38500.00',
      payable: '8200.00',
      debtRatio: '40.5%'
    },
    {
      unit: '一附院',
      incomeBudget: '45000.00',
      incomeActual: '42100.00',
      incomeRate: '93.6%',
      expenseBudget: '42000.00',
      expenseActual: '40500.00',
      expenseRate: '96.4%',
      bankDeposit: '26800.00',
      payable: '5600.00',
      debtRatio: '43.2%'
    },
    {
      unit: '二附院',
      incomeBudget: '38000.00',
      incomeActual: '35200.00',
      incomeRate: '92.6%',
      expenseBudget: '36000.00',
      expenseActual: '34800.00',
      expenseRate: '96.7%',
      bankDeposit: '19200.00',
      payable: '4100.00',
      debtRatio: '44.8%'
    },
    {
      unit: '三附院',
      incomeBudget: '32000.00',
      incomeActual: '29800.00',
      incomeRate: '93.1%',
      expenseBudget: '31000.00',
      expenseActual: '30200.00',
      expenseRate: '97.4%',
      bankDeposit: '12600.00',
      payable: '3400.00',
      debtRatio: '46.1%'
    },
    {
      unit: '四附院',
      incomeBudget: '28000.00',
      incomeActual: '26100.00',
      incomeRate: '93.2%',
      expenseBudget: '27000.00',
      expenseActual: '25800.00',
      expenseRate: '95.6%',
      bankDeposit: '9800.00',
      payable: '2700.00',
      debtRatio: '41.7%'
    },
    {
      unit: '五附院',
      incomeBudget: '24000.00',
      incomeActual: '22500.00',
      incomeRate: '93.8%',
      expenseBudget: '23500.00',
      expenseActual: '22900.00',
      expenseRate: '97.4%',
      bankDeposit: '7300.00',
      payable: '2100.00',
      debtRatio: '45.3%'
    },
    {
      unit: '中医学院',
      incomeBudget: '18000.00',
      incomeActual: '16900.00',
      incomeRate: '93.9%',
      expenseBudget: '17200.00',
      expenseActual: '16400.00',
      expenseRate: '95.3%',
      bankDeposit: '5100.00',
      payable: '1500.00',
      debtRatio: '38.9%'
    }
  ]

  // 表头单元格样式：暗色背景 + 统一边框
  const headerCellStyle = {
    background: '#111a30',
    color: '#cdd7ea',
    borderColor: '#243049',
    fontWeight: '500'
  }

  // 表体单元格样式：透明背景 + 统一边框 + 文字色
  const cellStyle = {
    background: 'transparent',
    color: '#c4cee0',
    borderColor: '#1d2740'
  }

  // ===== 分析项一：学校收入分析（6 维度 预算 vs 执行 对比）=====
  // 收入维度名称
  const incomeDimensions = [
    '学校统筹管理收入',
    '新校区共建及置换经费',
    '科研收入',
    '食堂收入',
    '历年结转资金',
    '缴入国库非税收入'
  ]
  // 各维度收入预算数（万元）
  const incomeBudgetData = [185000, 96000, 72000, 38000, 52000, 28000]
  // 各维度收入执行数（万元）
  const incomeActualData = [172000, 88000, 67500, 35200, 49800, 26100]

  // ===== 分析项二：学校统筹管理收入执行率排名（前五 / 后五）=====
  // 执行率前五部门
  const rankTop = [
    { dept: '财务处', rate: 98.6 },
    { dept: '一附院', rate: 97.4 },
    { dept: '科研院', rate: 96.8 },
    { dept: '后勤管理处', rate: 96.1 },
    { dept: '教务处', rate: 95.3 }
  ]
  // 执行率后五部门
  const rankBottom = [
    { dept: '继续教育学院', rate: 84.2 },
    { dept: '资产管理处', rate: 85.7 },
    { dept: '基建处', rate: 86.9 },
    { dept: '中医学院', rate: 88.1 },
    { dept: '国际教育学院', rate: 89.5 }
  ]

  // ===== 分析项三：学校支出分析（12 维度 预算 vs 执行 对比）=====
  // 支出维度名称
  const expenseDimensions = [
    '人员类经费',
    '运转类经费',
    '各部门业务经费',
    '教学日常运行经费',
    '高层次人才经费',
    '信息化建设经费',
    '学科建设经费',
    '学校还本付息经费',
    '校内科研经费',
    '大额设备购置类',
    '基本建设经费',
    '学校预备经费'
  ]
  // 各维度支出预算数（万元）
  const expenseBudgetData = [
    156000, 88000, 64000, 52000, 36000, 28000, 42000, 31000, 24000, 38000, 96000, 18000
  ]
  // 各维度支出执行数（万元）
  const expenseActualData = [
    148500, 82300, 60100, 49600, 33200, 25800, 39400, 30200, 21800, 34500, 88600, 12400
  ]

  // ===== 分析项四：支出执行率排名（前五 / 后五）=====
  // 执行率前五部门
  const expenseRankTop = [
    { dept: '人事处', rate: 98.1 },
    { dept: '二附院', rate: 97.2 },
    { dept: '研究生院', rate: 96.5 },
    { dept: '基础医学院', rate: 95.8 },
    { dept: '宣传部', rate: 95.1 }
  ]
  // 执行率后五部门
  const expenseRankBottom = [
    { dept: '审计处', rate: 82.6 },
    { dept: '保卫处', rate: 84.3 },
    { dept: '工会', rate: 85.9 },
    { dept: '图书馆', rate: 87.4 },
    { dept: '公共卫生学院', rate: 88.8 }
  ]

  // ===== 专项分析：中央专项 / 自治区专项 项目数量统计 =====
  // 规则：历年结转专项 + 当年专项 = 项目总数
  const specialFunds = [
    { key: 'central', name: '中央专项', theme: 'blue', carryover: 86, current: 52, total: 138 },
    { key: 'region', name: '自治区专项', theme: 'green', carryover: 64, current: 41, total: 105 }
  ]

  // 专项明细表数据（项目来源相同的行将合并单元格）
  // 执行率 = 执行数 / 到位数
  const specialDetailData = [
    {
      source: '中央专项',
      name: '2026年中央支持地方高校改革发展资金预算(第一批建设项目资金)',
      allocated: '12800.00',
      executed: '11500.00',
      rate: '89.8%'
    },
    {
      source: '中央专项',
      name: '中央支持地方高校改革发展专项',
      allocated: '9600.00',
      executed: '9100.00',
      rate: '94.8%'
    },
    {
      source: '中央专项',
      name: '2026年中央学生资助补助经费(第二批)',
      allocated: '5400.00',
      executed: '5200.00',
      rate: '96.3%'
    },
    {
      source: '中央重点项目（中央支持）',
      name: '2026年中央支持公共卫生防控救治能力建设项目',
      allocated: '8200.00',
      executed: '7600.00',
      rate: '92.7%'
    },
    {
      source: '中央重点项目（中央支持）',
      name: '中央支持临床医学研究中心建设项目',
      allocated: '6300.00',
      executed: '5850.00',
      rate: '92.9%'
    },
    {
      source: '中央重点项目（两重两新）',
      name: '“两重两新”医学院校实验实训设备更新项目',
      allocated: '7500.00',
      executed: '6900.00',
      rate: '92.0%'
    },
    {
      source: '中央重点项目（两重两新）',
      name: '“两重两新”附属医院诊疗设备购置项目',
      allocated: '10200.00',
      executed: '8800.00',
      rate: '86.3%'
    },
    {
      source: '自治区专项',
      name: '2026年度新疆人才发展基金第一轮支持资金（第二次）',
      allocated: '4800.00',
      executed: '4350.00',
      rate: '90.6%'
    }
  ]

  // 合并「项目来源」列相同来源的相邻单元格
  const specialSpanMethod = ({
    row,
    column,
    rowIndex
  }: {
    row: (typeof specialDetailData)[number]
    column: { property?: string }
    rowIndex: number
  }) => {
    if (column.property !== 'source') return
    // 与上一行来源相同则被合并（行数置 0）
    if (rowIndex > 0 && specialDetailData[rowIndex - 1].source === row.source) {
      return { rowspan: 0, colspan: 0 }
    }
    // 向下统计相同来源的连续行数作为合并跨度
    let span = 1
    for (let i = rowIndex + 1; i < specialDetailData.length; i++) {
      if (specialDetailData[i].source === row.source) span++
      else break
    }
    return { rowspan: span, colspan: 1 }
  }

  // ===== 专项项目分布明细（穿透弹窗数据）=====
  // 同一项目可能涉及多个部门，故按部门拆分为多行；列表按部门排序
  // 数据已按部门聚合排序，相同部门相邻展示便于合并单元格
  const distributionMap: Record<
    string,
    Array<{ dept: string; name: string; allocated: string; executed: string; rate: string }>
  > = {
    // 中央专项项目分布
    central: [
      {
        dept: '财务处',
        name: '中央支持地方高校改革发展专项',
        allocated: '4200.00',
        executed: '4050.00',
        rate: '96.4%'
      },
      {
        dept: '财务处',
        name: '2026年中央学生资助补助经费(第二批)',
        allocated: '5400.00',
        executed: '5200.00',
        rate: '96.3%'
      },
      {
        dept: '基建处',
        name: '2026年中央支持地方高校改革发展资金预算(第一批建设项目资金)',
        allocated: '6800.00',
        executed: '6000.00',
        rate: '88.2%'
      },
      {
        dept: '教务处',
        name: '中央支持地方高校改革发展专项',
        allocated: '3100.00',
        executed: '2980.00',
        rate: '96.1%'
      },
      {
        dept: '科研院',
        name: '2026年中央支持地方高校改革发展资金预算(第一批建设项目资金)',
        allocated: '3500.00',
        executed: '3200.00',
        rate: '91.4%'
      },
      {
        dept: '科研院',
        name: '中央支持地方高校改革发展专项',
        allocated: '2300.00',
        executed: '2070.00',
        rate: '90.0%'
      },
      {
        dept: '实验室管理处',
        name: '2026年中央支持地方高校改革发展资金预算(第一批建设项目资金)',
        allocated: '2500.00',
        executed: '2300.00',
        rate: '92.0%'
      }
    ],
    // 自治区专项项目分布
    region: [
      {
        dept: '人事处',
        name: '2026年度新疆人才发展基金第一轮支持资金（第二次）',
        allocated: '2600.00',
        executed: '2420.00',
        rate: '93.1%'
      },
      {
        dept: '科研院',
        name: '2026年度新疆人才发展基金第一轮支持资金（第二次）',
        allocated: '1400.00',
        executed: '1230.00',
        rate: '87.9%'
      },
      {
        dept: '研究生院',
        name: '2026年度新疆人才发展基金第一轮支持资金（第二次）',
        allocated: '800.00',
        executed: '700.00',
        rate: '87.5%'
      }
    ]
  }

  // 弹窗状态
  const distributionVisible = ref(false)
  const distributionTitle = ref('')
  const distributionData = ref<(typeof distributionMap)['central']>([])

  // 打开项目分布明细弹窗（按部门排序后展示）
  const openDistribution = (item: (typeof specialFunds)[number]) => {
    distributionTitle.value = item.name
    // 按部门排序，保证相同部门相邻便于合并单元格
    distributionData.value = [...(distributionMap[item.key] || [])].sort((a, b) =>
      a.dept.localeCompare(b.dept, 'zh')
    )
    distributionVisible.value = true
  }

  // 合并弹窗「部门」列相同部门的相邻单元格
  const distributionSpanMethod = ({
    row,
    column,
    rowIndex
  }: {
    row: (typeof distributionMap)['central'][number]
    column: { property?: string }
    rowIndex: number
  }) => {
    if (column.property !== 'dept') return
    const list = distributionData.value
    if (rowIndex > 0 && list[rowIndex - 1].dept === row.dept) {
      return { rowspan: 0, colspan: 0 }
    }
    let span = 1
    for (let i = rowIndex + 1; i < list.length; i++) {
      if (list[i].dept === row.dept) span++
      else break
    }
    return { rowspan: span, colspan: 1 }
  }

  // 图表 DOM 引用
  const incomeChartRef = ref<HTMLElement>()
  const rankChartRef = ref<HTMLElement>()
  const expenseChartRef = ref<HTMLElement>()
  const expenseRankChartRef = ref<HTMLElement>()
  let incomeChart: echarts.ECharts | null = null
  let rankChart: echarts.ECharts | null = null
  let expenseChart: echarts.ECharts | null = null
  let expenseRankChart: echarts.ECharts | null = null

  // 暗色大屏图表通用配色
  const axisLineColor = 'rgba(255,255,255,0.15)'
  const axisLabelColor = '#9fb0cf'
  const splitLineColor = 'rgba(255,255,255,0.06)'

  // 渲染「学校收入分析」分组柱状图
  const renderIncomeChart = () => {
    if (!incomeChartRef.value) return
    if (!incomeChart) incomeChart = echarts.init(incomeChartRef.value)
    incomeChart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: ['收入预算', '收入执行'], textStyle: { color: axisLabelColor }, top: 0 },
      grid: { left: 10, right: 20, top: 40, bottom: 10, containLabel: true },
      xAxis: {
        type: 'category',
        data: incomeDimensions,
        axisLine: { lineStyle: { color: axisLineColor } },
        // 面板变窄，标签旋转 30° 防重叠
        axisLabel: { color: axisLabelColor, interval: 0, fontSize: 10, rotate: 30 }
      },
      yAxis: {
        type: 'value',
        name: '万元',
        nameTextStyle: { color: axisLabelColor },
        axisLabel: { color: axisLabelColor },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: splitLineColor } }
      },
      series: [
        {
          name: '收入预算',
          type: 'bar',
          data: incomeBudgetData,
          barWidth: 9,
          itemStyle: {
            borderRadius: [3, 3, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#67b9ff' },
              { offset: 1, color: '#1d4ed8' }
            ])
          }
        },
        {
          name: '收入执行',
          type: 'bar',
          data: incomeActualData,
          barWidth: 9,
          itemStyle: {
            borderRadius: [3, 3, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#5eead4' },
              { offset: 1, color: '#0e9488' }
            ])
          }
        }
      ]
    })
  }

  // 渲染「执行率排名」横向条形图（前五绿色、后五琥珀色）
  const renderRankChart = () => {
    if (!rankChartRef.value) return
    if (!rankChart) rankChart = echarts.init(rankChartRef.value)
    // 合并前五后五，按执行率升序排列（条形图自下而上，高值在顶部）
    const merged = [...rankBottom, ...rankTop].sort((a, b) => a.rate - b.rate)
    const topDepts = new Set(rankTop.map((i) => i.dept))
    rankChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        valueFormatter: (v: number) => `${v}%`
      },
      grid: { left: 10, right: 50, top: 10, bottom: 10, containLabel: true },
      xAxis: {
        type: 'value',
        max: 100,
        axisLabel: { color: axisLabelColor, formatter: '{value}%' },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: splitLineColor } }
      },
      yAxis: {
        type: 'category',
        data: merged.map((i) => i.dept),
        axisLine: { lineStyle: { color: axisLineColor } },
        axisLabel: { color: axisLabelColor, fontSize: 12 }
      },
      series: [
        {
          type: 'bar',
          barWidth: 13,
          data: merged.map((i) => ({
            value: i.rate,
            // 前五绿色，后五琥珀色
            itemStyle: {
              borderRadius: [0, 3, 3, 0],
              color: topDepts.has(i.dept) ? '#2dd4bf' : '#fbbf24'
            }
          })),
          label: { show: true, position: 'right', color: '#d7e2f5', formatter: '{c}%' }
        }
      ]
    })
  }

  // 渲染「学校支出分析」分组柱状图（12 维度）
  const renderExpenseChart = () => {
    if (!expenseChartRef.value) return
    if (!expenseChart) expenseChart = echarts.init(expenseChartRef.value)
    expenseChart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: ['支出预算', '支出执行'], textStyle: { color: axisLabelColor }, top: 0 },
      grid: { left: 10, right: 20, top: 40, bottom: 10, containLabel: true },
      xAxis: {
        type: 'category',
        data: expenseDimensions,
        axisLine: { lineStyle: { color: axisLineColor } },
        // 支出分析面板较宽，标签旋转 30° 即可
        axisLabel: { color: axisLabelColor, interval: 0, fontSize: 10, rotate: 30 }
      },
      yAxis: {
        type: 'value',
        name: '万元',
        nameTextStyle: { color: axisLabelColor },
        axisLabel: { color: axisLabelColor },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: splitLineColor } }
      },
      series: [
        {
          name: '支出预算',
          type: 'bar',
          data: expenseBudgetData,
          barWidth: 8,
          itemStyle: {
            borderRadius: [3, 3, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#f87171' },
              { offset: 1, color: '#b91c1c' }
            ])
          }
        },
        {
          name: '支出执行',
          type: 'bar',
          data: expenseActualData,
          barWidth: 8,
          itemStyle: {
            borderRadius: [3, 3, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#fbbf24' },
              { offset: 1, color: '#b45309' }
            ])
          }
        }
      ]
    })
  }

  // 渲染「支出执行率排名」横向条形图（前五绿色、后五琥珀色）
  const renderExpenseRankChart = () => {
    if (!expenseRankChartRef.value) return
    if (!expenseRankChart) expenseRankChart = echarts.init(expenseRankChartRef.value)
    // 合并前五后五，按执行率升序排列（条形图自下而上，高值在顶部）
    const merged = [...expenseRankBottom, ...expenseRankTop].sort((a, b) => a.rate - b.rate)
    const topDepts = new Set(expenseRankTop.map((i) => i.dept))
    expenseRankChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        valueFormatter: (v: number) => `${v}%`
      },
      grid: { left: 10, right: 50, top: 10, bottom: 10, containLabel: true },
      xAxis: {
        type: 'value',
        max: 100,
        axisLabel: { color: axisLabelColor, formatter: '{value}%' },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: splitLineColor } }
      },
      yAxis: {
        type: 'category',
        data: merged.map((i) => i.dept),
        axisLine: { lineStyle: { color: axisLineColor } },
        axisLabel: { color: axisLabelColor, fontSize: 12 }
      },
      series: [
        {
          type: 'bar',
          barWidth: 13,
          data: merged.map((i) => ({
            value: i.rate,
            // 前五绿色，后五琥珀色
            itemStyle: {
              borderRadius: [0, 3, 3, 0],
              color: topDepts.has(i.dept) ? '#2dd4bf' : '#fbbf24'
            }
          })),
          label: { show: true, position: 'right', color: '#d7e2f5', formatter: '{c}%' }
        }
      ]
    })
  }

  // 窗口缩放时自适应
  const handleResize = () => {
    incomeChart?.resize()
    rankChart?.resize()
    expenseChart?.resize()
    expenseRankChart?.resize()
  }

  onMounted(() => {
    nextTick(() => {
      renderIncomeChart()
      renderRankChart()
      renderExpenseChart()
      renderExpenseRankChart()
      window.addEventListener('resize', handleResize)
    })
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
    incomeChart?.dispose()
    rankChart?.dispose()
    expenseChart?.dispose()
    expenseRankChart?.dispose()
  })
</script>

<style scoped lang="scss">
  // 大屏底色：径向渐变营造科技纵深感
  .fin-screen {
    box-sizing: border-box;
    width: 100%;
    min-height: 100vh;
    padding: 20px 24px 28px;
    font-family: 'Fira Sans', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    color: #e6ecf7;
    background: radial-gradient(120% 80% at 50% 0%, #0c1f33 0%, #060d1c 55%, #03060f 100%);
  }

  // ===== 顶部标题栏 =====
  .fin-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 16px;
    margin-bottom: 18px;
    border-bottom: 1px solid rgb(45 200 220 / 18%);

    &__title {
      display: flex;
      gap: 12px;
      align-items: center;

      h1 {
        margin: 0;
        font-size: 26px;
        font-weight: 700;
        line-height: 1.2;
        // 标题渐变文字，青绿科技感
        background: linear-gradient(90deg, #5eead4 0%, #67b9ff 100%);
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      p {
        margin: 4px 0 0;
        font-size: 13px;
        color: #7d8bab;
      }
    }

    // 标题左侧高亮竖条
    &__bar {
      width: 5px;
      height: 40px;
      background: linear-gradient(180deg, #5eead4, #2dd4bf);
      border-radius: 3px;
      box-shadow: 0 0 10px rgb(45 212 191 / 60%);
    }

    &__time {
      display: flex;
      gap: 6px;
      align-items: center;
      font-size: 13px;
      color: #8a97b6;

      em {
        font-style: normal;
        font-weight: 600;
        color: #d7e2f5;
        letter-spacing: 0.5px;
      }
    }
  }

  // ===== 页签切换 =====
  .fin-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 18px;
  }

  .fin-tab {
    padding: 8px 24px;
    font-size: 15px;
    font-weight: 600;
    color: #8a97b6;
    cursor: pointer;
    background: rgb(255 255 255 / 4%);
    border: 1px solid rgb(255 255 255 / 8%);
    border-radius: 8px;
    transition: all 0.2s ease;

    &:hover {
      color: #cdd7ea;
    }

    // 激活态：青绿渐变高亮
    &.is-active {
      color: #04121a;
      background: linear-gradient(135deg, #5eead4, #2dd4bf);
      border-color: transparent;
    }
  }

  // ===== 指标卡片区 =====
  .fin-cards {
    display: grid;
    // 前两张卡片各含 3 个指标，留更宽空间；后三张单值卡片较窄
    grid-template-columns: 1.35fr 1.35fr 1fr 1fr 1fr;
    gap: 16px;
    margin-bottom: 20px;
  }

  .fin-card {
    box-sizing: border-box;
    height: 138px;
    padding: 18px 20px;
    // 各主题色由 modifier 覆盖背景
    background: #0f1a2e;
    border: 1px solid rgb(255 255 255 / 8%);
    border-radius: 12px;
    transition: all 0.2s ease;

    &:hover {
      border-color: rgb(255 255 255 / 18%);
      transform: translateY(-2px);
    }

    &__head {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-bottom: 16px;
    }

    &__icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      font-size: 18px;
      color: #fff;
      background: rgb(255 255 255 / 14%);
      border-radius: 8px;
    }

    &__name {
      font-size: 16px;
      font-weight: 600;
      color: #f2f6ff;
    }

    // 多指标卡：预算数/执行数/执行率 三列
    &__metrics {
      display: flex;
      gap: 8px;
    }

    &__metric {
      flex: 1;
    }

    &__metric-label {
      margin: 0 0 6px;
      font-size: 12px;
      color: #9fb0cf;
    }

    &__metric-value {
      margin: 0;
      font-family: 'Fira Code', monospace;
      font-size: 18px;
      font-weight: 700;
      color: #fff;

      // 执行率高亮为绿色
      &.is-rate {
        color: #4ade80;
      }
    }

    // 单值卡：合计金额 / 比率（字号与多指标卡保持一致）
    &__single {
      font-family: 'Fira Code', monospace;
      font-size: 18px;
      font-weight: 700;
      color: #fff;
    }

    // —— 5 种主题渐变 ——
    &--blue {
      background: linear-gradient(135deg, #123a52 0%, #0d1f33 60%);

      .fin-card__icon {
        background: linear-gradient(135deg, #f59e0b, #d97706);
      }
    }

    &--red {
      background: linear-gradient(135deg, #4a1620 0%, #1a0f1a 60%);

      .fin-card__icon {
        background: linear-gradient(135deg, #f87171, #b91c1c);
      }
    }

    &--green {
      background: linear-gradient(135deg, #0c3a2a 0%, #07221c 60%);

      .fin-card__icon {
        background: linear-gradient(135deg, #34d399, #059669);
      }
    }

    &--amber {
      background: linear-gradient(135deg, #4a2a0c 0%, #1f1408 60%);

      .fin-card__icon {
        background: linear-gradient(135deg, #fbbf24, #b45309);
      }
    }

    &--purple {
      background: linear-gradient(135deg, #2e1a52 0%, #160f2e 60%);

      .fin-card__icon {
        background: linear-gradient(135deg, #a78bfa, #7c3aed);
      }
    }
  }

  // ===== 收支明细汇总表 =====
  .fin-table-panel {
    padding: 18px 20px 20px;
    margin-bottom: 20px;
    background: rgb(15 26 46 / 60%);
    border: 1px solid rgb(255 255 255 / 6%);
    border-radius: 12px;
  }

  // ===== 分析项区：两个图表同行排列 =====
  .fin-analysis {
    display: grid;
    // 四项同行：收入分析 / 收入排名 / 支出分析 / 支出排名
    // 两个排名图较窄，把空间留给支出分析（12 维度最需要宽度）
    grid-template-columns: 1.2fr 0.85fr 1.5fr 0.85fr;
    gap: 16px;
    margin-bottom: 20px;

    &__panel {
      padding: 18px 20px 20px;
      background: rgb(15 26 46 / 60%);
      border: 1px solid rgb(255 255 255 / 6%);
      border-radius: 12px;
    }

    // 图表容器固定高度，保证 echarts 正常渲染（容纳旋转标签）
    &__chart {
      width: 100%;
      height: 300px;
    }
  }

  .fin-panel-title {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 16px;
    font-size: 17px;
    font-weight: 600;
    color: #eaf1ff;

    &__bar {
      width: 4px;
      height: 16px;
      background: #2dd4bf;
      border-radius: 2px;
    }
  }

  // el-table 暗色覆盖
  .fin-table {
    background: transparent;

    // 表格整体透明 + 去除默认底色
    :deep(.el-table__inner-wrapper),
    :deep(.el-table__header-wrapper),
    :deep(.el-table__body-wrapper) {
      background: transparent;
    }

    :deep(tr),
    :deep(.el-table__row) {
      background: transparent;
    }

    // 外边框与表头分隔线
    :deep(.el-table__border-left-patch),
    &::before,
    &::after {
      background: transparent;
    }

    // hover 行高亮
    :deep(.el-table__body tr:hover > td.el-table__cell) {
      background: rgb(45 212 191 / 8%) !important;
    }

    // 单元格行高
    :deep(.el-table__cell) {
      padding: 10px 0;
    }
  }

  // ===== 专项分析：统计卡片 =====
  .fin-special-cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 20px;
  }

  .fin-special-card {
    padding: 22px 26px;
    background: #0f1a2e;
    border: 1px solid rgb(255 255 255 / 8%);
    border-radius: 12px;

    &--blue {
      background: linear-gradient(135deg, #123a52 0%, #0d1f33 60%);
    }

    &--green {
      background: linear-gradient(135deg, #0c3a2a 0%, #07221c 60%);
    }

    &__head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      padding-bottom: 16px;
      margin-bottom: 18px;
      border-bottom: 1px solid rgb(255 255 255 / 10%);
    }

    &__name {
      font-size: 18px;
      font-weight: 600;
      color: #f2f6ff;
    }

    &__total {
      font-size: 14px;
      color: #9fb0cf;

      em {
        font-family: 'Fira Code', monospace;
        font-size: 30px;
        font-style: normal;
        font-weight: 700;
        color: #fff;
      }

      // 可点击穿透：悬停高亮 + 下划线提示
      &.is-clickable {
        cursor: pointer;
        transition: color 0.2s ease;

        &:hover {
          color: #5eead4;

          em {
            color: #5eead4;
            text-decoration: underline;
            text-underline-offset: 4px;
          }
        }
      }
    }

    // 历年结转专项 / 当年专项
    &__split {
      display: flex;
      align-items: center;
    }

    &__part {
      flex: 1;
      text-align: center;
    }

    &__part-label {
      margin: 0 0 8px;
      font-size: 13px;
      color: #9fb0cf;
    }

    &__part-value {
      margin: 0;
      font-family: 'Fira Code', monospace;
      font-size: 26px;
      font-weight: 700;
      color: #e6ecf7;
    }
  }
</style>

<!-- 穿透弹窗样式：弹窗 append-to-body 渲染在组件外，需用非 scoped 样式覆盖为暗色 -->
<style lang="scss">
  .fin-dialog.el-dialog {
    background: #0c1830;
    border: 1px solid rgb(255 255 255 / 10%);
    border-radius: 12px;

    .el-dialog__title {
      font-weight: 600;
      color: #eaf1ff;
    }

    .el-dialog__headerbtn .el-dialog__close {
      color: #9fb0cf;
    }

    .el-dialog__body {
      padding-top: 12px;
    }
  }
</style>
