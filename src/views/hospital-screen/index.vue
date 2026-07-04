<template>
  <!-- 年度医院数据展示大屏：医疗数智清醒风（深靛蓝），纯静态展示，支持年度切换 -->
  <div class="hos-screen">
    <!-- 顶部标题栏：院名 + 年度切换 + 数据更新时间 -->
    <header class="hos-header">
      <div class="hos-header__title">
        <span class="hos-header__bar"></span>
        <div>
          <h1>医院年度数据分析大屏</h1>
          <p>收入 · 支出 · 账户 全景统计分析</p>
        </div>
      </div>
      <!-- 年度切换器：切换后所有指标与图表联动刷新 -->
      <div class="hos-header__years">
        <button
          v-for="y in years"
          :key="y"
          class="hos-year"
          :class="{ 'is-active': activeYear === y }"
          @click="activeYear = y"
        >
          {{ y }} 年度
        </button>
      </div>
      <div class="hos-header__time">
        <el-icon><Clock /></el-icon>
        <span>数据更新时间：</span>
        <em>{{ updateTime }}</em>
      </div>
    </header>

    <!-- 主体内容区：三组指标行平分剩余高度，整屏可见无需滚动 -->
    <main class="hos-main">
      <!-- ============ 一、收入类 ============ -->
      <section class="hos-groups hos-groups--income">
        <!-- 指标1：医院总收入（总额 + 7 类构成占比，总额与构成同属一个整体） -->
        <div class="hos-group hos-group--blue">
          <div class="hos-group__head">
            <div class="hos-group__name">
              <span class="hos-group__icon hos-group__icon--blue"
                ><el-icon><Money /></el-icon
              ></span>
              医院总收入
            </div>
            <div class="hos-group__total"
              ><em>{{ formatNum(metrics.totalIncome) }}</em
              ><i>万元</i></div
            >
          </div>
          <div class="hos-group__body">
            <div ref="totalIncomeChartRef" class="hos-chart hos-chart--lg"></div>
          </div>
        </div>
        <!-- 指标2：医疗收入（总额 + 门诊/住院 + 四类结构占比，三块同属一个整体） -->
        <div class="hos-group hos-group--cyan">
          <div class="hos-group__head">
            <div class="hos-group__name">
              <span class="hos-group__icon hos-group__icon--cyan"
                ><el-icon><FirstAidKit /></el-icon
              ></span>
              医疗收入
            </div>
            <div class="hos-group__total"
              ><em>{{ formatNum(metrics.medIncome) }}</em
              ><i>万元</i></div
            >
          </div>
          <div class="hos-group__body hos-group__body--multi">
            <div class="hos-cell">
              <div class="hos-cell__cap">门诊 / 住院占比</div>
              <div ref="medOutInChartRef" class="hos-chart hos-chart--lg"></div>
            </div>
            <div class="hos-cell">
              <div class="hos-cell__cap">收入结构占比</div>
              <div ref="medStructChartRef" class="hos-chart hos-chart--lg"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 二、支出类 ============ -->
      <section class="hos-groups hos-groups--expense">
        <!-- 医院总支出（总额 + 4 类构成占比，总额与构成同属一个整体） -->
        <div class="hos-group hos-group--red">
          <div class="hos-group__head">
            <div class="hos-group__name">
              <span class="hos-group__icon hos-group__icon--red"
                ><el-icon><TrendCharts /></el-icon
              ></span>
              医院总支出
            </div>
            <div class="hos-group__total"
              ><em>{{ formatNum(metrics.totalExpense) }}</em
              ><i>万元</i></div
            >
          </div>
          <div class="hos-group__body">
            <div ref="totalExpenseChartRef" class="hos-chart hos-chart--lg"></div>
          </div>
        </div>
        <!-- 医院支出（两个维度占比：按项目类型 + 按经济结构，圆环图体现占比） -->
        <div class="hos-group hos-group--red">
          <div class="hos-group__head">
            <div class="hos-group__name">
              <span class="hos-group__icon hos-group__icon--red"
                ><el-icon><Histogram /></el-icon
              ></span>
              医院支出
            </div>
            <div class="hos-group__total"
              ><em>{{ formatNum(metrics.totalExpense) }}</em
              ><i>万元</i></div
            >
          </div>
          <div class="hos-group__body hos-group__body--multi">
            <div class="hos-cell">
              <div class="hos-cell__cap">按项目类型占比</div>
              <div ref="expenseProjChartRef" class="hos-chart hos-chart--lg"></div>
            </div>
            <div class="hos-cell">
              <div class="hos-cell__cap">按经济结构占比</div>
              <div ref="expenseStructChartRef" class="hos-chart hos-chart--lg"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 三、账户类 ============ -->
      <section class="hos-groups hos-groups--account">
        <!-- 银行存款（当前存款总额 + 月度存款情况） -->
        <div class="hos-group hos-group--green">
          <div class="hos-group__head">
            <div class="hos-group__name">
              <span class="hos-group__icon hos-group__icon--amber"
                ><el-icon><CreditCard /></el-icon
              ></span>
              银行存款
            </div>
            <div class="hos-group__total"
              ><em>{{ formatNum(account.bankCurrent) }}</em
              ><i>万元</i></div
            >
          </div>
          <div class="hos-group__body">
            <div class="hos-cell__cap">月度存款情况</div>
            <div ref="bankChartRef" class="hos-chart hos-chart--lg"></div>
          </div>
        </div>
        <!-- 本期盈余（盈余总额 + 分项盈余构成 + 月度盈余金额） -->
        <div class="hos-group hos-group--green">
          <div class="hos-group__head">
            <div class="hos-group__name">
              <span class="hos-group__icon hos-group__icon--green"
                ><el-icon><Wallet /></el-icon
              ></span>
              本期盈余
            </div>
            <div class="hos-group__total"
              ><em>{{ formatNum(account.surplusTotal) }}</em
              ><i>万元</i></div
            >
          </div>
          <div class="hos-group__body hos-group__body--multi">
            <div class="hos-cell">
              <div class="hos-cell__cap">分项盈余占比</div>
              <div ref="surplusPieChartRef" class="hos-chart hos-chart--lg"></div>
            </div>
            <div class="hos-cell">
              <div class="hos-cell__cap">月度盈余金额</div>
              <div ref="surplusMonthChartRef" class="hos-chart hos-chart--lg"></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
  // 页面说明：年度医院数据分析大屏，纯静态展示，内置多年度模拟数据，支持年度切换联动刷新
  import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
  import * as echarts from 'echarts'
  import {
    Clock,
    Money,
    FirstAidKit,
    Wallet,
    CreditCard,
    TrendCharts,
    Histogram
  } from '@element-plus/icons-vue'

  defineOptions({ name: 'HospitalScreen' })

  // 数据更新时间（静态展示）
  const updateTime = '2026/06/15 09:30:00'

  // 可切换年度列表与当前激活年度
  const years = [2024, 2025, 2026] as const
  type Year = (typeof years)[number]
  const activeYear = ref<Year>(2026)

  // 统一数据色板（医疗数智清醒风）
  const palette = ['#1677FF', '#00C48C', '#FF8C42', '#00D4FF', '#7B61FF', '#FFD166', '#36CFC9']

  // 各年度完整数据集（单位：万元）。所有占比/结构数据均符合业务勾稽关系
  // 月度数组按 1~12 月顺序排列
  interface YearData {
    // 收入-医院总收入 7 类构成
    income: { name: string; value: number }[]
    // 收入-医疗收入 门诊/住院
    medByVisit: { outpatient: number; inpatient: number }
    // 收入-医疗收入 4 类结构（合计 = 门诊+住院）
    medByStruct: { name: string; value: number }[]
    // 支出-医院总支出 4 类构成
    expenseTotal: { name: string; value: number }[]
    // 支出-医院支出 维度1（按项目类型 3 类）
    expenseByProj: { name: string; value: number }[]
    // 支出-医院支出 维度2（按经济结构 4 类）
    expenseByStruct: { name: string; value: number }[]
    // 账户-银行存款：当前存款 + 月度存款
    bankCurrent: number
    bankMonthly: number[]
    // 账户-本期盈余：分项盈余 3 类 + 月度盈余
    surplusByItem: { name: string; value: number }[]
    surplusMonthly: number[]
  }
  // PLACEHOLDER_DATASET
  const dataset: Record<Year, YearData> = {
    2026: {
      income: [
        { name: '财政拨款', value: 28600 },
        { name: '事业收入', value: 92400 },
        { name: '上级补助收入', value: 6800 },
        { name: '非同级财政拨款收入', value: 4200 },
        { name: '捐赠收入', value: 1800 },
        { name: '利息收入', value: 1200 },
        { name: '其他收入', value: 3500 }
      ],
      medByVisit: { outpatient: 38600, inpatient: 49200 },
      medByStruct: [
        { name: '药品收入', value: 26400 },
        { name: '卫生耗材收入', value: 19800 },
        { name: '检验检查收入', value: 22600 },
        { name: '医疗服务收入', value: 19000 }
      ],
      expenseTotal: [
        { name: '业务活动费用', value: 96800 },
        { name: '单位管理费用', value: 18600 },
        { name: '资产处置费用', value: 2400 },
        { name: '其他费用', value: 5200 }
      ],
      expenseByProj: [
        { name: '财政项目支出', value: 24600 },
        { name: '科教项目支出', value: 9800 },
        { name: '医疗活动支出', value: 88600 }
      ],
      expenseByStruct: [
        { name: '人员经费支出', value: 52400 },
        { name: '日常公用支出', value: 24800 },
        { name: '药品支出', value: 23600 },
        { name: '卫生材料支出', value: 22200 }
      ],
      bankCurrent: 42600,
      bankMonthly: [
        31000, 32400, 33600, 35200, 36800, 37500, 38900, 39600, 40200, 41000, 41800, 42600
      ],
      surplusByItem: [
        { name: '财政项目盈余', value: 4200 },
        { name: '科教项目盈余', value: 1800 },
        { name: '医疗活动盈余', value: 8700 }
      ],
      surplusMonthly: [820, 760, 980, 1120, 1050, 1240, 1180, 1320, 1280, 1410, 1360, 1480]
    },
    2025: {
      income: [
        { name: '财政拨款', value: 26200 },
        { name: '事业收入', value: 84600 },
        { name: '上级补助收入', value: 6100 },
        { name: '非同级财政拨款收入', value: 3800 },
        { name: '捐赠收入', value: 1500 },
        { name: '利息收入', value: 1050 },
        { name: '其他收入', value: 3100 }
      ],
      medByVisit: { outpatient: 35200, inpatient: 44800 },
      medByStruct: [
        { name: '药品收入', value: 24600 },
        { name: '卫生耗材收入', value: 18200 },
        { name: '检验检查收入', value: 20400 },
        { name: '医疗服务收入', value: 16800 }
      ],
      expenseTotal: [
        { name: '业务活动费用', value: 88600 },
        { name: '单位管理费用', value: 17200 },
        { name: '资产处置费用', value: 2100 },
        { name: '其他费用', value: 4700 }
      ],
      expenseByProj: [
        { name: '财政项目支出', value: 22400 },
        { name: '科教项目支出', value: 8900 },
        { name: '医疗活动支出', value: 81300 }
      ],
      expenseByStruct: [
        { name: '人员经费支出', value: 48200 },
        { name: '日常公用支出', value: 22600 },
        { name: '药品支出', value: 21400 },
        { name: '卫生材料支出', value: 20400 }
      ],
      bankCurrent: 38400,
      bankMonthly: [
        28200, 29400, 30600, 31800, 32600, 33400, 34200, 35100, 35900, 36700, 37600, 38400
      ],
      surplusByItem: [
        { name: '财政项目盈余', value: 3600 },
        { name: '科教项目盈余', value: 1500 },
        { name: '医疗活动盈余', value: 7200 }
      ],
      surplusMonthly: [680, 720, 860, 940, 1010, 1080, 1040, 1160, 1120, 1240, 1190, 1280]
    },
    2024: {
      income: [
        { name: '财政拨款', value: 23800 },
        { name: '事业收入', value: 76200 },
        { name: '上级补助收入', value: 5400 },
        { name: '非同级财政拨款收入', value: 3300 },
        { name: '捐赠收入', value: 1300 },
        { name: '利息收入', value: 920 },
        { name: '其他收入', value: 2700 }
      ],
      medByVisit: { outpatient: 31800, inpatient: 40200 },
      medByStruct: [
        { name: '药品收入', value: 22400 },
        { name: '卫生耗材收入', value: 16400 },
        { name: '检验检查收入', value: 18200 },
        { name: '医疗服务收入', value: 15000 }
      ],
      expenseTotal: [
        { name: '业务活动费用', value: 80400 },
        { name: '单位管理费用', value: 15800 },
        { name: '资产处置费用', value: 1800 },
        { name: '其他费用', value: 4200 }
      ],
      expenseByProj: [
        { name: '财政项目支出', value: 20200 },
        { name: '科教项目支出', value: 7900 },
        { name: '医疗活动支出', value: 74100 }
      ],
      expenseByStruct: [
        { name: '人员经费支出', value: 43800 },
        { name: '日常公用支出', value: 20400 },
        { name: '药品支出', value: 19200 },
        { name: '卫生材料支出', value: 18800 }
      ],
      bankCurrent: 34200,
      bankMonthly: [
        25400, 26200, 27100, 28000, 28900, 29700, 30600, 31400, 32100, 32900, 33600, 34200
      ],
      surplusByItem: [
        { name: '财政项目盈余', value: 3100 },
        { name: '科教项目盈余', value: 1200 },
        { name: '医疗活动盈余', value: 6100 }
      ],
      surplusMonthly: [560, 620, 740, 820, 880, 940, 910, 1020, 980, 1080, 1040, 1120]
    }
  }
  // PLACEHOLDER_COMPUTED
  // 当前年度数据
  const cur = computed(() => dataset[activeYear.value])

  // 千分位格式化金额
  const formatNum = (n: number) => n.toLocaleString('zh-CN')
  // 求和工具
  const sum = (arr: { value: number }[]) => arr.reduce((s, i) => s + i.value, 0)

  // 账户区头部需要的当前存款/盈余总额（模板直接引用）
  const account = computed(() => ({
    bankCurrent: cur.value.bankCurrent,
    surplusTotal: sum(cur.value.surplusByItem)
  }))

  // 各指标分组的总额（随年度联动，展示在分组卡片头部）
  const metrics = computed(() => {
    const d = cur.value
    return {
      totalIncome: sum(d.income), // 医院总收入
      medIncome: d.medByVisit.outpatient + d.medByVisit.inpatient, // 医疗收入合计
      totalExpense: sum(d.expenseTotal) // 医院总支出
    }
  })
  // PLACEHOLDER_CHARTS
  // 图表 DOM 引用
  const totalIncomeChartRef = ref<HTMLElement>()
  const medOutInChartRef = ref<HTMLElement>()
  const medStructChartRef = ref<HTMLElement>()
  const totalExpenseChartRef = ref<HTMLElement>()
  const expenseProjChartRef = ref<HTMLElement>()
  const expenseStructChartRef = ref<HTMLElement>()
  const bankChartRef = ref<HTMLElement>()
  const surplusPieChartRef = ref<HTMLElement>()
  const surplusMonthChartRef = ref<HTMLElement>()

  // 图表实例集合（key -> 实例），便于统一刷新/销毁
  const charts = reactive<Record<string, echarts.ECharts | null>>({})

  // 暗色大屏图表通用配色
  const axisLineColor = 'rgba(255,255,255,0.12)'
  const axisLabelColor = '#8BA4CC'
  const splitLineColor = 'rgba(255,255,255,0.05)'
  const monthLabels = [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月'
  ]

  // 构建圆环图 option（内径 60%，中心显示总计）
  const buildDonut = (data: { name: string; value: number }[], unitTitle: string) => {
    const total = data.reduce((s, i) => s + i.value, 0)
    return {
      color: palette,
      tooltip: { trigger: 'item', formatter: '{b}<br/>{c} 万元 ({d}%)' },
      legend: {
        type: 'scroll',
        orient: 'vertical',
        right: 8,
        top: 'center',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: axisLabelColor, fontSize: 12 },
        formatter: (name: string) => {
          const item = data.find((d) => d.name === name)
          const pct = item ? ((item.value / total) * 100).toFixed(1) : '0'
          return `${name}  ${pct}%`
        }
      },
      series: [
        {
          type: 'pie',
          radius: ['52%', '74%'],
          center: ['34%', '52%'],
          avoidLabelOverlap: true,
          itemStyle: { borderColor: '#142040', borderWidth: 2, borderRadius: 4 },
          label: { show: false },
          emphasis: { label: { show: false }, scaleSize: 6 },
          data
        }
      ],
      graphic: {
        type: 'text',
        left: '34%',
        top: '46%',
        style: {
          text: `${unitTitle}\n${total.toLocaleString('zh-CN')}`,
          textAlign: 'center',
          fill: '#E8F0FF',
          fontSize: 16,
          fontWeight: 600,
          lineHeight: 22
        }
      }
    }
  }
  // PLACEHOLDER_BUILDERS2
  // 构建月度折线面积图 option（银行存款 / 月度盈余）
  const buildLine = (values: number[], lineColor: string, areaTop: string) => ({
    tooltip: {
      trigger: 'axis',
      valueFormatter: (v: number) => `${v.toLocaleString('zh-CN')} 万元`
    },
    grid: { left: 10, right: 24, top: 24, bottom: 10, containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: monthLabels,
      axisLine: { lineStyle: { color: axisLineColor } },
      axisLabel: { color: axisLabelColor, fontSize: 11 }
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
        type: 'line',
        data: values,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2, color: lineColor },
        itemStyle: { color: lineColor, borderColor: '#142040', borderWidth: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: areaTop },
            { offset: 1, color: 'rgba(20,32,64,0.05)' }
          ])
        }
      }
    ]
  })
  // PLACEHOLDER_RENDER
  // 初始化或获取图表实例（懒初始化，复用已有实例）
  const getChart = (key: string, el?: HTMLElement) => {
    if (!el) return null
    if (!charts[key]) charts[key] = echarts.init(el)
    return charts[key]
  }

  // 按当前年度数据渲染全部图表
  const renderAll = () => {
    const d = cur.value

    // 收入-医院总收入构成（圆环）
    getChart('totalIncome', totalIncomeChartRef.value)?.setOption(
      buildDonut(d.income, '总收入'),
      true
    )
    // 收入-医疗收入 门诊 vs 住院（圆环）
    getChart('medOutIn', medOutInChartRef.value)?.setOption(
      buildDonut(
        [
          { name: '门诊收入', value: d.medByVisit.outpatient },
          { name: '住院收入', value: d.medByVisit.inpatient }
        ],
        '医疗收入'
      ),
      true
    )
    // 收入-医疗收入 4 类结构（圆环）
    getChart('medStruct', medStructChartRef.value)?.setOption(
      buildDonut(d.medByStruct, '结构合计'),
      true
    )

    // 支出-医院总支出构成（圆环）
    getChart('totalExpense', totalExpenseChartRef.value)?.setOption(
      buildDonut(d.expenseTotal, '总支出'),
      true
    )
    // 支出-医院支出 维度1 按项目类型（圆环，体现占比）
    getChart('expenseProj', expenseProjChartRef.value)?.setOption(
      buildDonut(d.expenseByProj, '项目支出'),
      true
    )
    // 支出-医院支出 维度2 按经济结构（圆环，体现占比）
    getChart('expenseStruct', expenseStructChartRef.value)?.setOption(
      buildDonut(d.expenseByStruct, '结构支出'),
      true
    )

    // 账户-银行存款 月度（折线面积）
    getChart('bank', bankChartRef.value)?.setOption(
      buildLine(d.bankMonthly, '#00D4FF', 'rgba(0,212,255,0.35)'),
      true
    )
    // 账户-本期盈余构成（圆环）
    getChart('surplusPie', surplusPieChartRef.value)?.setOption(
      buildDonut(d.surplusByItem, '盈余总额'),
      true
    )
    // 账户-本期盈余 月度（折线面积）
    getChart('surplusMonth', surplusMonthChartRef.value)?.setOption(
      buildLine(d.surplusMonthly, '#00C48C', 'rgba(0,196,140,0.35)'),
      true
    )
  }

  // 年度切换时重新渲染全部图表
  watch(activeYear, () => nextTick(renderAll))

  // 窗口缩放自适应
  const handleResize = () => Object.values(charts).forEach((c) => c?.resize())

  onMounted(() => {
    nextTick(() => {
      renderAll()
      window.addEventListener('resize', handleResize)
    })
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
    Object.values(charts).forEach((c) => c?.dispose())
  })
</script>
<!-- PLACEHOLDER_STYLE -->

<style scoped lang="scss">
  // 大屏底色：靛蓝径向渐变（医疗数智清醒风，区别于 financial-screen 的近黑系）
  .hos-screen {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100vh; // 整屏高度，内部分区平分剩余空间，无需滚动
    padding: 14px 20px 16px;
    overflow: hidden;
    font-family:
      'DIN Alternate', Inter, 'Source Han Sans CN', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    color: #e8f0ff;
    background: radial-gradient(120% 80% at 50% 0%, #142f5a 0%, #0a1628 55%, #060f1f 100%);
  }

  // ===== 顶部标题栏 =====
  .hos-header {
    display: flex;
    flex-shrink: 0; // 标题栏高度固定，不参与剩余空间分配
    align-items: center;
    justify-content: space-between;
    padding-bottom: 10px;
    margin-bottom: 12px;
    border-bottom: 1px solid rgb(22 119 255 / 22%);

    &__title {
      display: flex;
      gap: 12px;
      align-items: center;

      h1 {
        margin: 0;
        font-size: 22px;
        font-weight: 700;
        line-height: 1.2;
        // 标题渐变文字：医疗蓝 → 薄荷绿
        background: linear-gradient(90deg, #67b9ff 0%, #00c48c 100%);
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      p {
        margin: 3px 0 0;
        font-size: 12px;
        color: #6b80a8;
      }
    }

    // 标题左侧高亮竖条
    &__bar {
      width: 5px;
      height: 34px;
      background: linear-gradient(180deg, #1677ff, #00c48c);
      border-radius: 3px;
      box-shadow: 0 0 12px rgb(22 119 255 / 60%);
    }

    // 年度切换按钮组
    &__years {
      display: flex;
      gap: 10px;
    }

    &__time {
      display: flex;
      gap: 6px;
      align-items: center;
      font-size: 13px;
      color: #8ba4cc;

      em {
        font-style: normal;
        font-weight: 600;
        color: #d7e2f5;
        letter-spacing: 0.5px;
      }
    }
  }

  // 年度切换按钮
  .hos-year {
    padding: 6px 18px;
    font-size: 14px;
    font-weight: 600;
    color: #8ba4cc;
    cursor: pointer;
    background: rgb(22 119 255 / 6%);
    border: 1px solid rgb(22 119 255 / 16%);
    border-radius: 8px;
    transition: all 0.2s ease;

    &:hover {
      color: #cdd9f0;
    }

    // 激活态：医疗蓝渐变高亮
    &.is-active {
      color: #fff;
      background: linear-gradient(135deg, #1677ff, #0e5fcc);
      border-color: transparent;
      box-shadow: 0 4px 14px rgb(22 119 255 / 40%);
    }
  }

  /* PLACEHOLDER_STYLE2 */
  // ===== 主体内容区：三组指标行平分剩余高度 =====
  .hos-main {
    display: flex;
    flex: 1; // 占满标题栏以外的全部高度
    flex-direction: column;
    gap: 12px;
    min-height: 0; // 允许内部图表收缩，避免溢出滚动
  }

  // ===== 指标分组卡片：总额（头部）+ 分析图表（主体）同属一个整体 =====
  .hos-groups {
    display: grid;
    flex: 1; // 三行等高平分主体高度
    gap: 12px;
    min-height: 0;

    // 收入类：总收入 1 图 / 医疗收入 2 图
    &--income {
      grid-template-columns: 1fr 1.7fr;
    }
    // 支出类：总支出 1 图 / 医院支出 2 图
    &--expense {
      grid-template-columns: 1fr 1.7fr;
    }
    // 账户类：银行存款 1 图 / 本期盈余 2 图
    &--account {
      grid-template-columns: 1.2fr 1.7fr;
    }
  }

  .hos-group {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    min-height: 0; // 允许内部图表区收缩到分配高度
    overflow: hidden;
    background: rgb(20 32 64 / 60%);
    backdrop-filter: blur(8px); // 轻玻璃拟态
    border: 1px solid rgb(22 119 255 / 18%);
    border-radius: 14px;

    // 分组头部：左侧指标名 + 右侧总额（替代原顶部独立 KPI）
    &__head {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: space-between;
      padding: 8px 18px;
      border-bottom: 1px solid rgb(255 255 255 / 8%);
    }

    &__name {
      display: flex;
      gap: 8px;
      align-items: center;
      font-size: 15px;
      font-weight: 600;
      color: #f2f6ff;
    }

    &__icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      font-size: 16px;
      color: #fff;
      border-radius: 7px;

      // 图标主题色
      &--blue {
        background: linear-gradient(135deg, #1677ff, #0e5fcc);
      }

      &--cyan {
        background: linear-gradient(135deg, #00d4ff, #0891b2);
      }

      &--red {
        background: linear-gradient(135deg, #ff6b78, #b91c1c);
      }

      &--amber {
        background: linear-gradient(135deg, #ffb066, #b5481d);
      }

      &--green {
        background: linear-gradient(135deg, #00c48c, #059669);
      }
    }

    // 分组总额：大号等宽数字
    &__total {
      em {
        font-size: 22px;
        font-style: normal;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        color: #fff;
      }

      i {
        margin-left: 4px;
        font-size: 12px;
        font-style: normal;
        color: #8ba4cc;
      }
    }

    // 分组主体：单图或双图
    &__body {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0; // 关键：图表区按剩余高度自适应，不撑高卡片
      padding: 6px 14px 10px;

      // 双图并排（医疗收入 / 医院支出 / 本期盈余）
      &--multi {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
    }

    // 顶部主题色条
    &--blue {
      border-top: 2px solid #1677ff;
    }

    &--cyan {
      border-top: 2px solid #00d4ff;
    }

    &--red {
      border-top: 2px solid #ff4757;
    }

    &--green {
      border-top: 2px solid #00c48c;
    }
  }

  // 双图单元格：图表小标题 + 图表
  .hos-cell {
    display: flex;
    flex-direction: column;
    min-height: 0;

    &__cap {
      flex-shrink: 0;
      margin-bottom: 2px;
      font-size: 12px;
      color: #8ba4cc;
    }
  }

  /* PLACEHOLDER_STYLE3 */
  // 图表容器：填满分组主体剩余高度，保证 echarts 自适应渲染、整屏无滚动
  .hos-chart {
    flex: 1;
    width: 100%;
    min-height: 0;

    &--lg {
      height: 100%;
    }
  }
</style>
