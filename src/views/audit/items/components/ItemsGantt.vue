<template>
  <div class="items-gantt-container">
    <!-- 工具栏 -->
    <div class="gantt-toolbar">
      <!-- 维度切换 -->
      <el-radio-group v-model="viewMode" size="default">
        <el-radio-button value="task">按事项查看</el-radio-button>
        <el-radio-button value="member">按负责人查看</el-radio-button>
      </el-radio-group>

      <!-- 时间粒度 -->
      <el-radio-group v-model="timeScale" size="default" style="margin-left: 16px">
        <el-radio-button value="day">日</el-radio-button>
        <el-radio-button value="week">周</el-radio-button>
        <el-radio-button value="month">月</el-radio-button>
      </el-radio-group>

      <!-- 功能按钮 -->
      <div style="display: flex; gap: 12px; margin-left: auto">
        <el-button @click="handleExport">导出PNG</el-button>
      </div>
    </div>

    <!-- 甘特图 -->
    <div class="gantt-chart-wrapper">
      <div ref="chartRef" class="gantt-chart" style="width: 100%; height: 100%"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch, nextTick } from 'vue'
  import * as echarts from 'echarts'
  import type { AuditItemExtended } from '@/types/audit'

  defineOptions({
    name: 'ItemsGantt'
  })

  interface Props {
    data: AuditItemExtended[]
  }

  const props = defineProps<Props>()

  const chartRef = ref<HTMLElement>()
  let chartInstance: echarts.ECharts | null = null

  // 视图模式：task-按事项查看，member-按负责人查看
  const viewMode = ref<'task' | 'member'>('task')

  // 时间粒度：day-日，week-周，month-月
  const timeScale = ref<'day' | 'week' | 'month'>('month')

  // 状态颜色映射
  const statusColors = {
    0: '#E5E7EB', // 待开始
    1: '#60A5FA', // 进行中 - 浅蓝色
    2: '#10B981' // 已完成
  }

  // 状态文本映射
  const statusText = {
    0: '待开始',
    1: '进行中',
    2: '已完成'
  }

  // 扁平化树形数据
  const flattenItems = (items: AuditItemExtended[], level = 0): any[] => {
    const result: any[] = []
    items.forEach((item) => {
      result.push({ ...item, level })
      if (item.children && item.children.length > 0) {
        result.push(...flattenItems(item.children, level + 1))
      }
    })
    return result
  }

  // 按事项查看的数据
  const taskData = computed(() => {
    const flatItems = flattenItems(props.data)
    return flatItems.map((item: any, index: number) => {
      const memberNames = item.assignedMembers.map((m: any) => m.name.split('(')[0]).join('、')
      return {
        name: item.name,
        value: [
          index,
          new Date(item.startTime).getTime(),
          new Date(item.endTime || item.startTime).getTime(),
          item.status
        ],
        itemStyle: {
          color: statusColors[item.status as keyof typeof statusColors],
          borderRadius: 4
        },
        label: {
          show: true,
          position: 'inside',
          formatter: () => {
            return `${item.name}\n${memberNames}`
          },
          color: item.status === 0 ? '#606266' : '#FFFFFF',
          fontSize: 12,
          overflow: 'truncate',
          width: 150
        },
        tooltip: {
          formatter: () => {
            return `
            <div style="padding: 8px;">
              <div style="font-weight: bold; margin-bottom: 4px;">${item.name}</div>
              <div>负责人：${item.assignedMembers.map((m: any) => m.name).join('、')}</div>
              <div>状态：${statusText[item.status as keyof typeof statusText]}</div>
              <div>开始时间：${item.startTime}</div>
              <div>结束时间：${item.endTime || '未设置'}</div>
            </div>
          `
          }
        },
        originalData: item
      }
    })
  })

  // 按负责人查看的数据
  const memberData = computed(() => {
    const memberMap = new Map<number, { name: string; tasks: any[] }>()

    const collectTasks = (items: AuditItemExtended[]) => {
      items.forEach((item) => {
        item.assignedMembers.forEach((member) => {
          if (!memberMap.has(member.id)) {
            memberMap.set(member.id, { name: member.name, tasks: [] })
          }
          memberMap.get(member.id)!.tasks.push(item)
        })
        if (item.children && item.children.length > 0) {
          collectTasks(item.children)
        }
      })
    }

    collectTasks(props.data)

    const result: any[] = []
    let index = 0
    memberMap.forEach((member) => {
      member.tasks.forEach((task) => {
        result.push({
          name: member.name,
          value: [
            index,
            new Date(task.startTime).getTime(),
            new Date(task.endTime || task.startTime).getTime(),
            task.status
          ],
          itemStyle: {
            color: statusColors[task.status as keyof typeof statusColors],
            borderRadius: 4
          },
          label: {
            show: true,
            position: 'inside',
            formatter: () => {
              return task.name
            },
            color: task.status === 0 ? '#606266' : '#FFFFFF',
            fontSize: 12,
            overflow: 'truncate',
            width: 150
          },
          tooltip: {
            formatter: () => {
              return `
              <div style="padding: 8px;">
                <div style="font-weight: bold; margin-bottom: 4px;">${member.name}</div>
                <div>事项：${task.name}</div>
                <div>状态：${statusText[task.status as keyof typeof statusText]}</div>
                <div>开始时间：${task.startTime}</div>
                <div>结束时间：${task.endTime || '未设置'}</div>
              </div>
            `
            }
          }
        })
      })
      index++
    })

    return result
  })

  // Y轴类别
  const yAxisData = computed(() => {
    if (viewMode.value === 'task') {
      const flatItems = flattenItems(props.data)
      return flatItems.map((item: any) => {
        const indent = '　'.repeat(item.level)
        return `${indent}${item.sortNumber} ${item.name}`
      })
    } else {
      const memberMap = new Map<number, string>()
      const collectMembers = (items: AuditItemExtended[]) => {
        items.forEach((item) => {
          item.assignedMembers.forEach((member) => {
            memberMap.set(member.id, member.name)
          })
          if (item.children && item.children.length > 0) {
            collectMembers(item.children)
          }
        })
      }
      collectMembers(props.data)
      return Array.from(memberMap.values())
    }
  })

  // 渲染图表
  const renderChart = () => {
    if (!chartRef.value) return

    if (!chartInstance) {
      chartInstance = echarts.init(chartRef.value)
    }

    const data = viewMode.value === 'task' ? taskData.value : memberData.value

    const option = {
      tooltip: {
        trigger: 'item',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: 250,
        right: 50,
        top: 80,
        bottom: 30,
        containLabel: false
      },
      xAxis: {
        type: 'time',
        position: 'top',
        axisLabel: {
          formatter: (value: number) => {
            const date = new Date(value)
            if (timeScale.value === 'month') {
              return `${date.getMonth() + 1}月`
            } else if (timeScale.value === 'week') {
              return `${date.getMonth() + 1}/${date.getDate()}`
            } else {
              return `${date.getMonth() + 1}/${date.getDate()}`
            }
          },
          fontSize: 13,
          color: '#606266'
        },
        axisLine: {
          lineStyle: {
            color: '#E4E7ED'
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#F2F3F5',
            type: 'solid'
          }
        },
        min: new Date('2026-04-01').getTime(),
        max: new Date('2027-05-31').getTime()
      },
      yAxis: {
        type: 'category',
        data: yAxisData.value,
        axisLabel: {
          fontSize: 13,
          color: '#303133',
          width: 230,
          overflow: 'truncate'
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#F2F3F5',
            type: 'solid'
          }
        }
      },
      series: [
        {
          type: 'custom',
          renderItem: (params: any, api: any) => {
            const categoryIndex = api.value(0)
            const start = api.coord([api.value(1), categoryIndex])
            const end = api.coord([api.value(2), categoryIndex])
            const height = api.size([0, 1])[1] * 0.6

            const rectShape = echarts.graphic.clipRectByRect(
              {
                x: start[0],
                y: start[1] - height / 2,
                width: end[0] - start[0],
                height: height
              },
              {
                x: params.coordSys.x,
                y: params.coordSys.y,
                width: params.coordSys.width,
                height: params.coordSys.height
              }
            )

            return (
              rectShape && {
                type: 'rect',
                transition: ['shape'],
                shape: rectShape,
                style: {
                  ...api.style(),
                  fill: data[params.dataIndex].itemStyle.color,
                  stroke: 'transparent'
                }
              }
            )
          },
          encode: {
            x: [1, 2],
            y: 0
          },
          data: data
        }
      ]
    }

    chartInstance.setOption(option, true)
  }

  // 导出PNG
  const handleExport = () => {
    if (chartInstance) {
      const url = chartInstance.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#fff'
      })
      const link = document.createElement('a')
      link.href = url
      link.download = `甘特图_${viewMode.value === 'task' ? '按事项' : '按负责人'}_${new Date().getTime()}.png`
      link.click()
    }
  }

  // 监听数据变化
  watch(
    () => [props.data, viewMode.value, timeScale.value],
    () => {
      nextTick(() => {
        renderChart()
      })
    },
    { deep: true }
  )

  // 监听窗口大小变化
  const handleResize = () => {
    chartInstance?.resize()
  }

  onMounted(() => {
    nextTick(() => {
      renderChart()
      window.addEventListener('resize', handleResize)
    })
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
    chartInstance?.dispose()
  })
</script>

<style scoped lang="scss">
  .items-gantt-container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .gantt-toolbar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    padding: 16px 20px;
    background: #fff;
    border-bottom: 1px solid #e4e7ed;
  }

  .gantt-chart-wrapper {
    flex: 1;
    padding: 20px;
    overflow: hidden;
    background: #fff;
  }

  .gantt-chart {
    width: 100%;
    height: 100%;
  }

  .loading,
  .no-data {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 14px;
    color: #909399;
  }
</style>
