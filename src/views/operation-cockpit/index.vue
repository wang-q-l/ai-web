<template>
  <!-- 审计驾驶舱大屏：深色科技风，1920×1080 基准，纯静态展示 -->
  <div class="audit-screen">
    <!-- 顶部标题栏：标题 + 实时时钟 -->
    <header class="audit-header">
      <div class="audit-header__side">
        <span class="audit-header__dot"></span>
        <span class="audit-header__sub">AUDIT COCKPIT</span>
      </div>
      <h1 class="audit-header__title">审计驾驶舱数据大屏</h1>
      <div class="audit-header__side audit-header__side--right">
        <el-icon><Clock /></el-icon>
        <span class="audit-header__time">{{ nowTime }}</span>
      </div>
    </header>

    <!-- KPI 指标条：5 项核心指标并排 -->
    <section class="audit-kpi">
      <div v-for="kpi in kpiList" :key="kpi.key" class="audit-kpi__item">
        <span class="audit-kpi__icon" :style="{ color: kpi.color }">
          <el-icon><component :is="kpi.icon" /></el-icon>
        </span>
        <div class="audit-kpi__body">
          <p class="audit-kpi__value" :style="{ color: kpi.color }">
            {{ kpi.value }}<em class="audit-kpi__unit">{{ kpi.unit }}</em>
          </p>
          <p class="audit-kpi__label">{{ kpi.label }}</p>
        </div>
      </div>
    </section>

    <!-- 主体三列布局 -->
    <section class="audit-main">
      <!-- 左列：整改完成率环形 + 风险等级分布 -->
      <div class="audit-col">
        <div class="audit-panel">
          <div class="audit-panel__title"><span></span>整改完成率</div>
          <div ref="rectifyChartRef" class="audit-panel__chart audit-panel__chart--sm"></div>
        </div>
        <div class="audit-panel">
          <div class="audit-panel__title"><span></span>风险等级分布</div>
          <div ref="riskChartRef" class="audit-panel__chart audit-panel__chart--md"></div>
        </div>
      </div>

      <!-- 中列：问题趋势主图 + 部门问题排行 -->
      <div class="audit-col audit-col--center">
        <div class="audit-panel">
          <div class="audit-panel__title"><span></span>审计发现问题趋势（近 12 月）</div>
          <div ref="trendChartRef" class="audit-panel__chart audit-panel__chart--lg"></div>
        </div>
        <div class="audit-panel">
          <div class="audit-panel__title"><span></span>各部门问题数排行 TOP8</div>
          <div ref="deptChartRef" class="audit-panel__chart audit-panel__chart--md"></div>
        </div>
      </div>

      <!-- 右列：问题类型分布环图 + 审计动态滚动列表 -->
      <div class="audit-col">
        <div class="audit-panel">
          <div class="audit-panel__title"><span></span>问题类型分布</div>
          <div ref="typeChartRef" class="audit-panel__chart audit-panel__chart--md"></div>
        </div>
        <div class="audit-panel audit-panel--flex">
          <div class="audit-panel__title"><span></span>审计动态</div>
          <!-- 自动滚动列表：复制一份数据实现无缝循环 -->
          <div class="audit-feed">
            <div class="audit-feed__track" :class="{ 'is-paused': feedPaused }">
              <div
                v-for="(item, idx) in feedLoopList"
                :key="idx"
                class="audit-feed__row"
                @mouseenter="feedPaused = true"
                @mouseleave="feedPaused = false"
              >
                <span class="audit-feed__tag" :class="`is-${item.level}`">{{
                  item.levelText
                }}</span>
                <span class="audit-feed__text">{{ item.text }}</span>
                <span class="audit-feed__time">{{ item.time }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  // 页面说明：审计驾驶舱数据大屏，深色科技风，纯静态 mock 展示
  import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
  import * as echarts from 'echarts'
  import {
    Clock,
    Folder,
    Loading,
    CircleCheck,
    Warning,
    TrendCharts
  } from '@element-plus/icons-vue'

  defineOptions({
    name: 'OperationCockpit'
  })

  // jimubi「科技」命名色板，作为大屏统一配色基准
  const PALETTE = {
    cyan: '#05f8d6',
    blue: '#0082fc',
    yellow: '#fdd845',
    green: '#22ed7c',
    teal: '#09b0d3',
    indigo: '#1d27c9',
    gold: '#f9e264',
    red: '#f47a75',
    deepTeal: '#009db2'
  }

  // 暗色大屏图表通用配色
  const axisLineColor = 'rgba(120,180,220,0.25)'
  const axisLabelColor = '#8ab8d0'
  const splitLineColor = 'rgba(120,180,220,0.08)'

  // ===== 实时时钟 =====
  const nowTime = ref('')
  let clockTimer: ReturnType<typeof setInterval> | null = null
  // 格式化当前时间为 YYYY/MM/DD HH:mm:ss
  const updateClock = () => {
    const d = new Date()
    const p = (n: number) => String(n).padStart(2, '0')
    nowTime.value = `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
  }

  // ===== KPI 指标条数据（静态 mock）=====
  const kpiList = [
    {
      key: 'total',
      label: '审计项目总数',
      value: '186',
      unit: '个',
      icon: Folder,
      color: PALETTE.blue
    },
    { key: 'doing', label: '进行中', value: '32', unit: '个', icon: Loading, color: PALETTE.cyan },
    {
      key: 'done',
      label: '已完成',
      value: '154',
      unit: '个',
      icon: CircleCheck,
      color: PALETTE.green
    },
    {
      key: 'issues',
      label: '发现问题数',
      value: '1,248',
      unit: '项',
      icon: Warning,
      color: PALETTE.gold
    },
    {
      key: 'rate',
      label: '整改完成率',
      value: '87.6',
      unit: '%',
      icon: TrendCharts,
      color: PALETTE.cyan
    }
  ]

  // ===== 审计动态滚动列表数据（静态 mock）=====
  // level 用于标签配色：high 高风险 / mid 中风险 / low 低风险
  const feedList = [
    {
      level: 'high',
      levelText: '高',
      text: '财务处「专项资金使用」审计发现 3 项重大问题',
      time: '10:42'
    },
    { level: 'mid', levelText: '中', text: '基建处「工程招投标」整改完成验收通过', time: '10:18' },
    { level: 'low', levelText: '低', text: '后勤处「物资采购」例行审计已立项', time: '09:55' },
    {
      level: 'mid',
      levelText: '中',
      text: '一附院「医保结算」审计进入数据核查阶段',
      time: '09:30'
    },
    { level: 'high', levelText: '高', text: '资产处「固定资产盘点」发现账实不符', time: '09:02' },
    { level: 'low', levelText: '低', text: '教务处「教学经费」审计报告已归档', time: '08:46' },
    { level: 'mid', levelText: '中', text: '科研院「课题结题」专项审计启动', time: '08:20' }
  ]
  // 复制一份用于无缝循环滚动
  const feedLoopList = [...feedList, ...feedList]
  // 鼠标悬停暂停滚动
  const feedPaused = ref(false)

  // ===== 图表 DOM 引用 =====
  const rectifyChartRef = ref<HTMLElement>()
  const riskChartRef = ref<HTMLElement>()
  const trendChartRef = ref<HTMLElement>()
  const deptChartRef = ref<HTMLElement>()
  const typeChartRef = ref<HTMLElement>()
  let rectifyChart: echarts.ECharts | null = null
  let riskChart: echarts.ECharts | null = null
  let trendChart: echarts.ECharts | null = null
  let deptChart: echarts.ECharts | null = null
  let typeChart: echarts.ECharts | null = null

  // ===== 图表一：整改完成率（环形进度，发光）=====
  const RECTIFY_RATE = 87.6
  const renderRectifyChart = () => {
    if (!rectifyChartRef.value) return
    if (!rectifyChart) rectifyChart = echarts.init(rectifyChartRef.value)
    rectifyChart.setOption({
      series: [
        {
          type: 'pie',
          radius: ['68%', '82%'],
          center: ['50%', '50%'],
          silent: true,
          label: { show: false },
          data: [
            {
              value: RECTIFY_RATE,
              itemStyle: {
                // 青→蓝渐变环 + 发光
                color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                  { offset: 0, color: PALETTE.cyan },
                  { offset: 1, color: PALETTE.blue }
                ]),
                shadowColor: 'rgba(5,248,214,0.5)',
                shadowBlur: 12
              }
            },
            // 剩余部分用暗色底环
            { value: 100 - RECTIFY_RATE, itemStyle: { color: 'rgba(120,180,220,0.1)' } }
          ]
        }
      ],
      // 中心百分比文字
      graphic: {
        type: 'text',
        left: 'center',
        top: 'center',
        style: {
          text: `${RECTIFY_RATE}%`,
          fill: PALETTE.cyan,
          fontSize: 30,
          fontWeight: 'bold',
          fontFamily: 'Fira Code, monospace'
        }
      }
    })
  }

  // ===== 图表二：风险等级分布（玫瑰图）=====
  // 高/中/低三档风险问题数
  const riskData = [
    { name: '高风险', value: 186, color: PALETTE.red },
    { name: '中风险', value: 432, color: PALETTE.gold },
    { name: '低风险', value: 630, color: PALETTE.green }
  ]
  const renderRiskChart = () => {
    if (!riskChartRef.value) return
    if (!riskChart) riskChart = echarts.init(riskChartRef.value)
    riskChart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c} 项 ({d}%)' },
      legend: {
        bottom: 0,
        textStyle: { color: axisLabelColor },
        icon: 'circle'
      },
      series: [
        {
          type: 'pie',
          radius: ['25%', '62%'],
          center: ['50%', '44%'],
          roseType: 'radius',
          itemStyle: { borderRadius: 4 },
          label: { color: axisLabelColor, fontSize: 11, formatter: '{b}\n{c}' },
          labelLine: { lineStyle: { color: axisLineColor } },
          data: riskData.map((i) => ({
            name: i.name,
            value: i.value,
            itemStyle: { color: i.color }
          }))
        }
      ]
    })
  }

  // ===== 图表三：问题类型分布（环形 donut）=====
  // 各审计问题类型占比
  const typeData = [
    { name: '财务管理', value: 320, color: PALETTE.blue },
    { name: '工程项目', value: 268, color: PALETTE.cyan },
    { name: '采购招标', value: 215, color: PALETTE.green },
    { name: '资产管理', value: 178, color: PALETTE.gold },
    { name: '内控制度', value: 142, color: PALETTE.teal },
    { name: '其他', value: 125, color: PALETTE.red }
  ]
  const renderTypeChart = () => {
    if (!typeChartRef.value) return
    if (!typeChart) typeChart = echarts.init(typeChartRef.value)
    typeChart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c} 项 ({d}%)' },
      legend: {
        type: 'scroll',
        orient: 'vertical',
        right: 0,
        top: 'center',
        textStyle: { color: axisLabelColor, fontSize: 11 },
        icon: 'circle'
      },
      series: [
        {
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['38%', '50%'],
          avoidLabelOverlap: true,
          itemStyle: { borderColor: '#081226', borderWidth: 2 },
          label: { show: false },
          data: typeData.map((i) => ({
            name: i.name,
            value: i.value,
            itemStyle: { color: i.color }
          }))
        }
      ]
    })
  }

  // ===== 图表四：审计发现问题趋势（近 12 月面积折线）=====
  const trendMonths = [
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
  // 每月新发现问题数
  const trendFound = [86, 102, 95, 128, 110, 135, 142, 118, 156, 138, 165, 148]
  // 每月已整改问题数
  const trendFixed = [70, 88, 82, 105, 96, 120, 125, 108, 138, 122, 150, 130]
  const renderTrendChart = () => {
    if (!trendChartRef.value) return
    if (!trendChart) trendChart = echarts.init(trendChartRef.value)
    // 生成面积渐变填充
    const areaGradient = (c: string) =>
      new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: c.replace(')', ',0.35)').replace('rgb', 'rgba') },
        { offset: 1, color: c.replace(')', ',0.02)').replace('rgb', 'rgba') }
      ])
    trendChart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['发现问题', '已整改'], textStyle: { color: axisLabelColor }, top: 0 },
      grid: { left: 10, right: 20, top: 40, bottom: 10, containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: trendMonths,
        axisLine: { lineStyle: { color: axisLineColor } },
        axisLabel: { color: axisLabelColor }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: axisLabelColor },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: splitLineColor } }
      },
      series: [
        {
          name: '发现问题',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          data: trendFound,
          lineStyle: { width: 2.5, color: PALETTE.gold },
          itemStyle: { color: PALETTE.gold },
          areaStyle: { color: areaGradient('rgb(249,226,100)') }
        },
        {
          name: '已整改',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          data: trendFixed,
          lineStyle: { width: 2.5, color: PALETTE.cyan },
          itemStyle: { color: PALETTE.cyan },
          areaStyle: { color: areaGradient('rgb(5,248,214)') }
        }
      ]
    })
  }

  // ===== 图表五：各部门问题数排行 TOP8（横向条形）=====
  // 已按问题数降序排列
  const deptRank = [
    { dept: '财务处', value: 168 },
    { dept: '基建处', value: 142 },
    { dept: '资产管理处', value: 126 },
    { dept: '一附院', value: 115 },
    { dept: '后勤管理处', value: 98 },
    { dept: '科研院', value: 86 },
    { dept: '教务处', value: 72 },
    { dept: '采购中心', value: 65 }
  ]
  const renderDeptChart = () => {
    if (!deptChartRef.value) return
    if (!deptChart) deptChart = echarts.init(deptChartRef.value)
    // 条形图自下而上渲染，故数据倒序使最大值在顶部
    const ordered = [...deptRank].reverse()
    deptChart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 10, right: 40, top: 10, bottom: 10, containLabel: true },
      xAxis: {
        type: 'value',
        axisLabel: { color: axisLabelColor },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: splitLineColor } }
      },
      yAxis: {
        type: 'category',
        data: ordered.map((i) => i.dept),
        axisLine: { lineStyle: { color: axisLineColor } },
        axisLabel: { color: axisLabelColor, fontSize: 12 }
      },
      series: [
        {
          type: 'bar',
          barWidth: 12,
          data: ordered.map((i) => i.value),
          itemStyle: {
            borderRadius: [0, 6, 6, 0],
            // 蓝→青横向渐变
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: PALETTE.blue },
              { offset: 1, color: PALETTE.cyan }
            ])
          },
          label: { show: true, position: 'right', color: '#cfe6f5', fontSize: 12 }
        }
      ]
    })
  }

  // ===== 统一渲染 + 自适应 + 生命周期 =====
  // 渲染全部图表
  const renderAll = () => {
    renderRectifyChart()
    renderRiskChart()
    renderTypeChart()
    renderTrendChart()
    renderDeptChart()
  }

  // 窗口缩放时所有图表自适应
  const handleResize = () => {
    rectifyChart?.resize()
    riskChart?.resize()
    typeChart?.resize()
    trendChart?.resize()
    deptChart?.resize()
  }

  onMounted(() => {
    updateClock()
    clockTimer = setInterval(updateClock, 1000)
    nextTick(() => {
      renderAll()
      window.addEventListener('resize', handleResize)
    })
  })

  onBeforeUnmount(() => {
    if (clockTimer) clearInterval(clockTimer)
    window.removeEventListener('resize', handleResize)
    rectifyChart?.dispose()
    riskChart?.dispose()
    typeChart?.dispose()
    trendChart?.dispose()
    deptChart?.dispose()
  })
</script>

<style scoped lang="scss">
  // 大屏底色：径向渐变深空蓝，营造科技纵深
  .audit-screen {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100vh;
    padding: 18px 22px;
    overflow: hidden;
    font-family: 'Fira Sans', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    color: #e6ecf7;
    background: radial-gradient(120% 80% at 50% 0%, #0c2238 0%, #07101f 55%, #03060f 100%);
  }

  // ===== 顶部标题栏 =====
  .audit-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
    margin-bottom: 14px;
    border-bottom: 1px solid rgb(5 248 214 / 18%);

    &__side {
      display: flex;
      gap: 8px;
      align-items: center;
      width: 240px;
      font-size: 13px;
      color: #6fa8c4;

      &--right {
        justify-content: flex-end;
      }
    }

    // 左侧呼吸光点
    &__dot {
      width: 9px;
      height: 9px;
      background: #05f8d6;
      border-radius: 50%;
      box-shadow: 0 0 10px #05f8d6;
      animation: audit-blink 1.4s ease-in-out infinite;
    }

    &__sub {
      letter-spacing: 2px;
    }

    &__title {
      flex: 1;
      margin: 0;
      font-size: 30px;
      font-weight: 700;
      text-align: center;
      text-shadow: 0 0 20px rgb(5 248 214 / 25%);
      letter-spacing: 4px;
      // 标题青蓝渐变文字
      background: linear-gradient(90deg, #05f8d6 0%, #0082fc 100%);
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    &__time {
      font-family: 'Fira Code', monospace;
      color: #cfe6f5;
      letter-spacing: 1px;
    }
  }

  // 呼吸光点动画
  @keyframes audit-blink {
    0%,
    100% {
      opacity: 1;
    }

    50% {
      opacity: 0.3;
    }
  }

  // ===== KPI 指标条 =====
  .audit-kpi {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 14px;
    height: 96px;
    margin-bottom: 14px;

    &__item {
      display: flex;
      gap: 14px;
      align-items: center;
      padding: 0 22px;
      background: linear-gradient(135deg, rgb(13 38 64 / 80%) 0%, rgb(8 18 34 / 80%) 100%);
      border: 1px solid rgb(5 248 214 / 12%);
      border-radius: 10px;
    }

    &__icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      font-size: 24px;
      background: rgb(5 248 214 / 8%);
      border-radius: 10px;
    }

    &__value {
      margin: 0;
      font-family: 'Fira Code', monospace;
      font-size: 28px;
      font-weight: 700;
      line-height: 1;
    }

    &__unit {
      margin-left: 4px;
      font-size: 14px;
      font-style: normal;
      font-weight: 500;
      color: #8ab8d0;
    }

    &__label {
      margin: 8px 0 0;
      font-size: 13px;
      color: #8ab8d0;
    }
  }

  // ===== 主体三列布局 =====
  .audit-main {
    display: grid;
    flex: 1;
    // 左右两列等宽，中列更宽（承载主图与排行）
    grid-template-columns: 1fr 1.5fr 1fr;
    gap: 14px;
    min-height: 0;
  }

  // 每列内部上下两个面板，纵向均分
  .audit-col {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-height: 0;
  }

  // ===== 通用面板 =====
  .audit-panel {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    padding: 14px 16px;
    background: rgb(11 28 48 / 60%);
    border: 1px solid rgb(5 248 214 / 10%);
    border-radius: 10px;

    // 动态列表面板内容需撑满
    &--flex {
      overflow: hidden;
    }

    // 面板标题：左侧发光竖条 + 文字
    &__title {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 10px;
      font-size: 15px;
      font-weight: 600;
      color: #eaf3ff;

      span {
        width: 4px;
        height: 14px;
        background: linear-gradient(180deg, #05f8d6, #0082fc);
        border-radius: 2px;
        box-shadow: 0 0 8px rgb(5 248 214 / 60%);
      }
    }

    // 图表容器：按尺寸分档撑满剩余高度
    &__chart {
      flex: 1;
      width: 100%;
      min-height: 0;

      &--sm {
        min-height: 150px;
      }

      &--md {
        min-height: 180px;
      }

      &--lg {
        min-height: 220px;
      }
    }
  }

  // ===== 审计动态滚动列表 =====
  .audit-feed {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow: hidden;

    // 滚动轨道：CSS 动画上移，复制数据实现无缝循环
    &__track {
      display: flex;
      flex-direction: column;
      gap: 8px;
      animation: audit-scroll 18s linear infinite;

      // 悬停暂停
      &.is-paused {
        animation-play-state: paused;
      }
    }

    &__row {
      display: flex;
      gap: 10px;
      align-items: center;
      padding: 9px 10px;
      background: rgb(255 255 255 / 3%);
      border: 1px solid rgb(255 255 255 / 5%);
      border-left: 2px solid rgb(5 248 214 / 50%);
      border-radius: 6px;
    }

    // 风险等级标签
    &__tag {
      flex-shrink: 0;
      width: 22px;
      height: 22px;
      font-size: 12px;
      line-height: 22px;
      text-align: center;
      border-radius: 4px;

      &.is-high {
        color: #f47a75;
        background: rgb(244 122 117 / 15%);
      }

      &.is-mid {
        color: #f9e264;
        background: rgb(249 226 100 / 15%);
      }

      &.is-low {
        color: #22ed7c;
        background: rgb(34 237 124 / 15%);
      }
    }

    &__text {
      flex: 1;
      overflow: hidden;
      font-size: 13px;
      color: #c4d6e6;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__time {
      flex-shrink: 0;
      font-family: 'Fira Code', monospace;
      font-size: 12px;
      color: #6fa8c4;
    }
  }

  // 无缝滚动：上移一半高度（因数据复制了两份）
  @keyframes audit-scroll {
    0% {
      transform: translateY(0);
    }

    100% {
      transform: translateY(-50%);
    }
  }
</style>
