<script setup lang="ts">
  // 报告在线预览弹窗：PDF 内嵌 iframe 预览；非 PDF 降级为下载 / 新窗口打开
  import { computed } from 'vue'
  import { Document, Download } from '@element-plus/icons-vue'
  import type { Report } from '@/types/report-library'

  const props = defineProps<{
    open: boolean
    /** 当前预览的报告 */
    report: Report | null
  }>()

  const emit = defineEmits<{
    'update:open': [val: boolean]
  }>()

  const visible = computed({
    get: () => props.open,
    set: (v) => emit('update:open', v)
  })

  // 是否 PDF（可内嵌预览）
  const isPdf = computed(() => props.report?.fileType === 'pdf')

  // 在新窗口打开 / 下载文件
  const handleOpenFile = () => {
    if (props.report?.fileUrl) {
      window.open(props.report.fileUrl, '_blank')
    }
  }
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="props.report?.name || '报告预览'"
    width="80%"
    top="6vh"
    :close-on-click-modal="false"
    class="preview-dialog"
  >
    <div v-if="props.report" class="preview-body">
      <!-- PDF：内嵌 iframe 预览 -->
      <iframe v-if="isPdf" :src="props.report.fileUrl" class="pdf-frame" title="报告预览"></iframe>

      <!-- 非 PDF：降级提示，提供下载 / 新窗口打开 -->
      <div v-else class="fallback">
        <el-icon class="fallback-icon"><Document /></el-icon>
        <div class="fallback-text">
          该文件类型（{{ props.report.fileType.toUpperCase() }}）暂不支持在线预览
        </div>
        <el-button type="primary" @click="handleOpenFile">
          <el-icon><Download /></el-icon>
          下载 / 在新窗口打开
        </el-button>
      </div>
    </div>

    <template #footer>
      <el-button v-if="props.report" @click="handleOpenFile">
        <el-icon><Download /></el-icon>
        下载
      </el-button>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
  .preview-dialog {
    :deep(.el-dialog__body) {
      padding: 0 12px 8px;
    }
  }

  .preview-body {
    height: 70vh;
  }

  .pdf-frame {
    width: 100%;
    height: 100%;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 4px;
  }

  .fallback {
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
    justify-content: center;
    height: 100%;

    .fallback-icon {
      font-size: 56px;
      color: var(--el-text-color-placeholder);
    }

    .fallback-text {
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
  }
</style>
