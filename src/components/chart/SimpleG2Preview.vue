<template>
  <div ref="containerRef" class="g2-preview-container"></div>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted, onUnmounted } from 'vue'
  import { Chart } from '@antv/g2'
  import { Renderer as CanvasRenderer } from '@antv/g-canvas'
  import { convertFunctionStrings } from '@/utils/chartUtils'

  // Props定义
  const props = defineProps<{
    chartConfig: any // 图表配置对象（G2格式）
  }>()

  const containerRef = ref<HTMLDivElement>()
  let chartInstance: Chart | null = null

  /**
   * 渲染图表
   */
  function renderChart(container: HTMLDivElement, config: any) {
    console.log('🎨 [Admin] 渲染图表', {
      type: config.type,
      dataLength: config.data?.value?.length || config.data?.length || 0,
      hasAxis: !!config.axis,
      autoFit: config.autoFit
    })

    // 创建Chart实例，显式使用Canvas渲染器（用于预览）
    const chart = new Chart({
      container,
      renderer: new CanvasRenderer() as any // 类型断言：绕过 @antv/g-lite 版本冲突
    })

    // 根据autoFit决定是否包含width和height
    const chartConfig = { ...config }
    if (chartConfig.autoFit) {
      // autoFit为true时,删除width和height
      delete chartConfig.width
      delete chartConfig.height
    }

    // 转换函数字符串为真正的函数
    const convertedConfig = convertFunctionStrings(chartConfig)
    console.log('🔄 [Admin] 转换后的配置:', convertedConfig)

    // 通过chart.options()传递配置
    chart.options(convertedConfig)
    chart.render()

    console.log('✅ [Admin] 图表渲染完成')
    return chart
  }

  /**
   * 更新图表
   */
  function updateChart(chart: Chart, config: any) {
    console.log('🔄 [Admin] 更新图表配置', {
      timestamp: new Date().toLocaleTimeString()
    })

    try {
      // 根据autoFit决定是否包含width和height
      const chartConfig = { ...config }
      if (chartConfig.autoFit) {
        // autoFit为true时,删除width和height
        delete chartConfig.width
        delete chartConfig.height
      }

      // 转换函数字符串为真正的函数
      const convertedConfig = convertFunctionStrings(chartConfig)

      // 使用options更新配置
      chart.options(convertedConfig)
      chart.render()
      console.log('✅ [Admin] 图表更新完成')
    } catch (error) {
      console.error('❌ [Admin] 图表更新失败:', error)
    }
  }

  // 监听配置变化（深度监听）
  watch(
    () => props.chartConfig,
    (newConfig) => {
      if (!newConfig) return

      if (chartInstance) {
        updateChart(chartInstance, newConfig)
      }
    },
    { deep: true }
  )

  // 组件挂载
  onMounted(() => {
    if (containerRef.value && props.chartConfig) {
      chartInstance = renderChart(containerRef.value, props.chartConfig)
    }
  })

  // 组件卸载
  onUnmounted(() => {
    if (chartInstance) {
      chartInstance.destroy()
      chartInstance = null
      console.log('🧹 图表已销毁')
    }
  })

  // 暴露图表实例（供导出功能使用）
  defineExpose({
    getChart: () => chartInstance
  })
</script>

<style scoped>
  .g2-preview-container {
    width: 100%;
    height: 100%;
    min-height: 400px;
    background: #fafafa;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
