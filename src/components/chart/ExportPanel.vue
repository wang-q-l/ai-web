<template>
  <div class="export-panel">
    <!-- 三个导出按钮（Admin后台不需要保存图表按钮）-->
    <el-button type="primary" @click="handleExportAxure">生成Axure代码</el-button>
    <el-button @click="handleExportSVG">生成SVG并复制</el-button>
    <el-button @click="handleExportPNG">生成PNG并下载</el-button>

    <!-- Axure代码展示 -->
    <el-dialog v-model="showAxureDialog" width="80%">
      <!-- 自定义标题栏，右侧添加格式切换按钮 -->
      <template #header>
        <div class="dialog-header">
          <span>Axure代码</span>
          <el-button :type="isMinified ? 'primary' : 'default'" size="small" @click="toggleMinify">
            {{ isMinified ? '压缩格式' : '标准格式' }}
          </el-button>
        </div>
      </template>

      <el-input v-model="displayedAxureCode" type="textarea" :rows="20" readonly />

      <template #footer>
        <el-button @click="copyAxureCode">复制代码</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Chart } from '@antv/g2'
  import { Renderer as SVGRenderer } from '@antv/g-svg'
  import { convertFunctionStrings } from '@/utils/chartUtils'
  import { minifyJavaScript } from '@/utils/codeMinifier'

  const props = defineProps<{
    chartConfig: any
    previewRef?: any
  }>()

  const showAxureDialog = ref(false)
  const axureCodeStandard = ref('') // 存储标准格式代码
  const isMinified = ref(true) // 默认为压缩格式

  /**
   * 显示的 Axure 代码（根据是否压缩动态计算）
   */
  const displayedAxureCode = computed(() => {
    if (isMinified.value) {
      return minifyJavaScript(axureCodeStandard.value)
    }
    return axureCodeStandard.value
  })

  /**
   * 切换代码格式（压缩 ↔ 标准）
   */
  function toggleMinify() {
    isMinified.value = !isMinified.value
  }

  /**
   * 生成Axure代码
   */
  async function handleExportAxure() {
    console.log('📝 生成Axure代码')

    // 根据autoFit决定是否包含width和height
    const config = { ...props.chartConfig }
    if (config.autoFit) {
      delete config.width
      delete config.height
    }

    // 序列化配置对象
    const configStr = formatConfigObject(config)

    // 生成标准格式代码并存储
    axureCodeStandard.value = `javascript:
(function() {
  function renderChart() {
    var dom = $('[data-label="[[This.name]]"]').get(0);
    $(dom).empty().css({
      'background': 'transparent',
      'position':'absolute'
    });
    var chart = new G2.Chart({
      container: dom
    });
    chart.options(${configStr});
    chart.render();
  }
  if (typeof G2 !== 'undefined') {
    renderChart();
  } else {
    window.G2Callbacks = window.G2Callbacks || [];
    window.G2Callbacks.push(renderChart);
    if (!window.loadG2) {
      window.loadG2 = true;
      var url;
      $axure.internal($ax => { url = $ax.globalVariableProvider.getVariableValue('G2JsLink') });
      var script = document.createElement('script');
      script.src = url || 'https://assets.axuremart.com/G2JsLink/g2.min.js';
      script.onload = () => { window.G2Callbacks.forEach(cb => cb()); window.G2Callbacks = []; };
      console.log(script.src);
      script.onerror = () => console.error('G2 加载失败: ' + script.src);
      document.head.appendChild(script);
    }
  }
})();`

    // 默认显示压缩格式
    isMinified.value = true
    showAxureDialog.value = true
    console.log('✅ Axure代码生成完成')
  }

  /**
   * 判断是否为简单类型（基本类型）
   */
  function isSimpleValue(value: any): boolean {
    return (
      value === null ||
      value === undefined ||
      typeof value === 'boolean' ||
      typeof value === 'number' ||
      typeof value === 'string'
    )
  }

  /**
   * 格式化配置对象为字符串
   * 优化后支持紧凑格式，提高可读性
   */
  function formatConfigObject(obj: any, indent = 2): string {
    const spaces = ' '.repeat(indent)

    if (obj === null) return 'null'
    if (obj === undefined) return 'undefined'
    if (typeof obj === 'boolean') return obj.toString()
    if (typeof obj === 'number') return obj.toString()
    if (typeof obj === 'string') {
      // 检测是否为函数字符串 (形如: "(value) => `${value} mm`")
      if (obj.trim().startsWith('(') && obj.includes('=>') && obj.includes('`')) {
        return obj // 直接返回函数字符串,不加引号
      }
      return `'${obj.replace(/'/g, "\\'")}'`
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]'

      // 判断是否为简单数组（所有元素都是基本类型且长度<=10）
      const isSimpleArray = obj.length <= 10 && obj.every(isSimpleValue)

      if (isSimpleArray) {
        // 单行紧凑显示
        const items = obj.map((item) => formatConfigObject(item, 0))
        return `[${items.join(', ')}]`
      } else {
        // 多行展开显示（复杂数组）
        const items = obj.map((item) => `${spaces}  ${formatConfigObject(item, indent + 2)}`)
        return `[\n${items.join(',\n')}\n${spaces}]`
      }
    }

    if (typeof obj === 'object') {
      const entries = Object.entries(obj)
      if (entries.length === 0) return '{}'

      // 判断是否为数据对象（包含 x 字段，如图表数据）
      const isDataObject = 'x' in obj

      // 判断是否为简单配置对象（<=5个属性且所有值都是基本类型）
      const isSimpleConfig =
        entries.length <= 5 && entries.every(([, value]) => isSimpleValue(value))

      if (isDataObject || isSimpleConfig) {
        // 单行紧凑显示
        const pairs = entries
          .filter(([, value]) => value !== undefined)
          .map(([key, value]) => `${key}: ${formatConfigObject(value, 0)}`)
        return `{${pairs.join(', ')}}`
      } else {
        // 多行展开显示（复杂对象）
        const priorityKeys = ['type', 'autoFit', 'width', 'height']
        const sortedEntries = [
          ...entries
            .filter(([key]) => priorityKeys.includes(key))
            .sort((a, b) => {
              return priorityKeys.indexOf(a[0]) - priorityKeys.indexOf(b[0])
            }),
          ...entries.filter(([key]) => !priorityKeys.includes(key))
        ]

        // 过滤掉 undefined 值
        const pairs = sortedEntries
          .filter(([, value]) => value !== undefined)
          .map(([key, value]) => `${spaces}  ${key}: ${formatConfigObject(value, indent + 2)}`)
        return `{\n${pairs.join(',\n')}\n${spaces}}`
      }
    }

    return String(obj)
  }

  /**
   * 复制Axure代码
   * 复制当前显示的代码（压缩或标准格式）
   */
  async function copyAxureCode() {
    try {
      await navigator.clipboard.writeText(displayedAxureCode.value)
      ElMessage.success('代码已复制到剪贴板')
    } catch {
      ElMessage.error('复制失败，请手动复制')
    }
  }

  /**
   * 生成SVG并复制
   */
  async function handleExportSVG() {
    console.log('📊 [Admin] 生成SVG')

    try {
      const config = { ...props.chartConfig }
      if (config.autoFit) {
        delete config.autoFit
        delete config.width
        delete config.height
      }

      const exportWidth = config.width || 500
      const exportHeight = config.height || 300
      config.width = exportWidth
      config.height = exportHeight

      // 转换函数字符串为真正的函数
      const convertedConfig = convertFunctionStrings(config)

      const tempContainer = document.createElement('div')
      tempContainer.style.position = 'absolute'
      tempContainer.style.left = '-9999px'
      tempContainer.style.width = `${exportWidth}px`
      tempContainer.style.height = `${exportHeight}px`
      document.body.appendChild(tempContainer)

      const tempChart = new Chart({
        container: tempContainer,
        renderer: new SVGRenderer() as any // 类型断言：绕过 @antv/g-lite 版本冲突
      })

      tempChart.options(convertedConfig)
      await tempChart.render()
      await new Promise((resolve) => setTimeout(resolve, 200))

      const svgElement = tempContainer.querySelector('svg')
      if (!svgElement) {
        throw new Error('未找到SVG元素')
      }

      const serializer = new XMLSerializer()
      const svgString = serializer.serializeToString(svgElement)

      await navigator.clipboard.writeText(svgString)

      tempChart.destroy()
      document.body.removeChild(tempContainer)

      ElMessage.success('SVG已复制到剪贴板')
      console.log('✅ [Admin] SVG复制成功')
    } catch (error: any) {
      console.error('❌ [Admin] SVG生成失败:', error)
      ElMessage.error(`SVG生成失败: ${error.message || '未知错误'}`)
    }
  }

  /**
   * 生成PNG并下载
   */
  async function handleExportPNG() {
    console.log('🖼️ [Admin] 生成PNG')

    try {
      const config = { ...props.chartConfig }
      if (config.autoFit) {
        delete config.autoFit
        delete config.width
        delete config.height
      }

      const exportWidth = config.width || 500
      const exportHeight = config.height || 300
      config.width = exportWidth
      config.height = exportHeight

      // 转换函数字符串为真正的函数
      const convertedConfig = convertFunctionStrings(config)

      const tempContainer = document.createElement('div')
      tempContainer.style.position = 'absolute'
      tempContainer.style.left = '-9999px'
      tempContainer.style.width = `${exportWidth}px`
      tempContainer.style.height = `${exportHeight}px`
      document.body.appendChild(tempContainer)

      const tempChart = new Chart({
        container: tempContainer,
        renderer: new SVGRenderer() as any // 类型断言：绕过 @antv/g-lite 版本冲突
      })

      tempChart.options(convertedConfig)
      await tempChart.render()
      await new Promise((resolve) => setTimeout(resolve, 200))

      const svgElement = tempContainer.querySelector('svg')
      if (!svgElement) {
        throw new Error('未找到SVG元素')
      }

      const serializer = new XMLSerializer()
      const svgString = serializer.serializeToString(svgElement)

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      const dpr = window.devicePixelRatio || 1
      canvas.width = exportWidth * dpr
      canvas.height = exportHeight * dpr
      canvas.style.width = `${exportWidth}px`
      canvas.style.height = `${exportHeight}px`
      ctx?.scale(dpr, dpr)

      if (ctx) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, exportWidth, exportHeight)
      }

      const img = new Image()
      const svgBlob = new Blob([svgString], {
        type: 'image/svg+xml;charset=utf-8'
      })
      const url = URL.createObjectURL(svgBlob)

      img.onload = async () => {
        ctx?.drawImage(img, 0, 0, exportWidth, exportHeight)
        const pngDataURL = canvas.toDataURL('image/png', 1.0)
        downloadImage(pngDataURL)

        URL.revokeObjectURL(url)
        tempChart.destroy()
        document.body.removeChild(tempContainer)

        ElMessage.success('PNG图片下载成功')
        console.log('✅ PNG下载成功')
      }

      img.onerror = (error) => {
        URL.revokeObjectURL(url)
        tempChart.destroy()
        document.body.removeChild(tempContainer)
        console.error('❌ 图片加载失败:', error)
        ElMessage.error('PNG生成失败: 图片加载错误')
      }

      img.src = url
    } catch (error: any) {
      console.error('❌ PNG生成失败:', error)
      ElMessage.error(`PNG生成失败: ${error.message || '未知错误'}`)
    }
  }

  /**
   * 下载图片
   */
  function downloadImage(dataURL: string) {
    const link = document.createElement('a')
    link.href = dataURL
    link.download = `chart-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
</script>

<style scoped>
  .export-panel {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  /* 弹窗标题栏样式 */
  :deep(.dialog-header) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    span {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }
</style>
