<template>
  <ElDrawer
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="图表预览"
    direction="rtl"
    size="60%"
  >
    <div class="drawer-content" v-if="chartConfig">
      <!-- 图表预览区域 -->
      <div class="chart-preview-section">
        <div class="section-header">
          <h4>图表预览</h4>
          <!-- 缩放控制 -->
          <div class="zoom-controls">
            <ElDropdown @command="handleZoomChange" trigger="click">
              <ElButton size="small" :icon="ZoomIn">
                {{ currentZoom }}%
                <ElIcon class="el-icon--right"><ArrowDown /></ElIcon>
              </ElButton>
              <template #dropdown>
                <ElDropdownMenu>
                  <ElDropdownItem :command="50">50 %</ElDropdownItem>
                  <ElDropdownItem :command="75">75 %</ElDropdownItem>
                  <ElDropdownItem :command="100">100 %</ElDropdownItem>
                  <ElDropdownItem :command="125">125 %</ElDropdownItem>
                  <ElDropdownItem :command="150">150 %</ElDropdownItem>
                  <ElDropdownItem :command="200">200 %</ElDropdownItem>
                  <ElDropdownItem divided :command="'fit'">适应画布</ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>
            <ElButton size="small" :icon="ZoomOut" @click="zoomOut" :disabled="currentZoom <= 50" />
            <ElButton size="small" :icon="ZoomIn" @click="zoomIn" :disabled="currentZoom >= 200" />
          </div>
        </div>
        <div class="preview-container">
          <div
            class="preview-wrapper"
            :style="{
              width: `${currentZoom}%`,
              height: `${currentZoom}%`,
              minWidth: `${currentZoom}%`,
              minHeight: getMinHeight()
            }"
          >
            <SimpleG2Preview ref="previewRef" :chart-config="scaledChartConfig" />
          </div>
        </div>
      </div>

      <!-- 导出操作区域 -->
      <div class="chart-export-section">
        <h4>导出操作</h4>
        <ExportPanel :chart-config="chartConfig" :preview-ref="previewRef" />
      </div>
    </div>
  </ElDrawer>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { ZoomIn, ZoomOut, ArrowDown } from '@element-plus/icons-vue'
  import SimpleG2Preview from '@/components/chart/SimpleG2Preview.vue'
  import ExportPanel from '@/components/chart/ExportPanel.vue'

  /**
   * Props定义
   */
  const props = defineProps<{
    modelValue: boolean
    chartConfig: any
  }>()

  /**
   * Emits定义
   */
  defineEmits<{
    (e: 'update:modelValue', value: boolean): void
  }>()

  /**
   * 预览组件引用
   */
  const previewRef = ref()

  /**
   * 缩放比例
   */
  const currentZoom = ref(100)

  /**
   * 根据缩放比例调整图表配置
   */
  const scaledChartConfig = computed(() => {
    if (!props.chartConfig) return null

    const config = { ...props.chartConfig }
    const scale = currentZoom.value / 100

    // 关闭autoFit，使用固定尺寸
    config.autoFit = false

    // 设置默认尺寸（如果原配置没有指定）
    const defaultWidth = 800
    const defaultHeight = 600

    // 如果配置中有 width 和 height，按比例缩放；否则使用默认值
    config.width = Math.floor((config.width || defaultWidth) * scale)
    config.height = Math.floor((config.height || defaultHeight) * scale)

    return config
  })

  /**
   * 计算最小高度
   */
  function getMinHeight() {
    const baseHeight = 400
    return `${Math.floor(baseHeight * (currentZoom.value / 100))}px`
  }

  /**
   * 处理缩放变化
   */
  function handleZoomChange(command: number | string) {
    if (command === 'fit') {
      currentZoom.value = 100
    } else {
      currentZoom.value = command as number
    }
  }

  /**
   * 放大
   */
  function zoomIn() {
    if (currentZoom.value < 200) {
      currentZoom.value = Math.min(200, currentZoom.value + 25)
    }
  }

  /**
   * 缩小
   */
  function zoomOut() {
    if (currentZoom.value > 50) {
      currentZoom.value = Math.max(50, currentZoom.value - 25)
    }
  }
</script>

<style lang="scss" scoped>
  .drawer-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
    height: 100%;
    padding: 0 20px 20px;
  }

  .chart-preview-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 400px;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h4 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }

      .zoom-controls {
        display: flex;
        gap: 8px;
        align-items: center;
      }
    }

    .preview-container {
      flex: 1;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      background: #fff;
      overflow: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .preview-wrapper {
      transition: all 0.3s ease;
    }
  }

  .chart-export-section {
    border-top: 1px solid #ebeef5;
    padding-top: 20px;

    h4 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }
</style>
