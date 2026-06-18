<script setup lang="ts">
  // 报告在线预览弹窗：自定义头部（标题 + 下载/关闭）；mock 阶段渲染模拟报告正文
  import { computed } from 'vue'
  import { Download, Close } from '@element-plus/icons-vue'
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

  // 文件大小（KB/MB 友好展示）
  const sizeText = computed(() => {
    const s = props.report?.fileSize ?? 0
    if (s >= 1024 * 1024) return `${(s / 1024 / 1024).toFixed(1)} MB`
    if (s >= 1024) return `${(s / 1024).toFixed(0)} KB`
    return `${s} B`
  })

  // 下载文件（mock 阶段仅提示，真实环境走 fileUrl）
  const handleDownload = () => {
    if (props.report?.fileUrl) {
      window.open(props.report.fileUrl, '_blank')
    }
  }

  const handleClose = () => {
    visible.value = false
  }
</script>

<template>
  <el-dialog
    v-model="visible"
    width="86%"
    top="4vh"
    :close-on-click-modal="false"
    :show-close="false"
    class="preview-dialog"
  >
    <!-- 自定义头部：标题 + 右上角下载/关闭 -->
    <template #header>
      <div class="preview-header">
        <span class="preview-title">{{ props.report?.name || '报告预览' }}</span>
        <div class="preview-header-actions">
          <el-button size="small" @click="handleDownload">
            <el-icon><Download /></el-icon>
            下载
          </el-button>
          <el-button size="small" @click="handleClose">
            <el-icon><Close /></el-icon>
            关闭
          </el-button>
        </div>
      </div>
    </template>

    <!-- 模拟报告正文（mock 阶段；真实环境改用 fileUrl 内嵌预览） -->
    <div v-if="props.report" class="preview-body">
      <div class="doc-paper">
        <h1 class="doc-title">{{ props.report.name }}</h1>
        <div class="doc-meta">
          <span>文件：{{ props.report.fileName }}</span>
          <span class="meta-divider">|</span>
          <span>大小：{{ sizeText }}</span>
          <span class="meta-divider">|</span>
          <span>创建日期：{{ props.report.createdAt }}</span>
        </div>
        <el-divider />
        <h2>一、审计概况</h2>
        <p>
          本次审计依据相关法律法规及审计工作方案，对被审计单位的财务收支、内部控制及相关业务活动进行了审查，现将审计情况报告如下。
        </p>
        <h2>二、审计发现</h2>
        <p>1. 财务核算总体规范，部分科目存在记账不及时的情况，已要求限期整改。</p>
        <p>2. 内部控制制度健全，执行环节存在个别流程未严格留痕的问题。</p>
        <p>3. 专项资金使用基本合规，建议进一步加强预算执行的过程监督。</p>
        <h2>三、审计建议</h2>
        <p
          >建议被审计单位健全财务管理制度，强化内部控制执行，规范专项资金使用，确保整改措施落实到位。</p
        >
        <p class="doc-tip">（以上为模拟预览内容，实际报告以原始文件为准。）</p>
      </div>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
  .preview-dialog {
    :deep(.el-dialog__header) {
      padding-right: 16px;
      margin-right: 0;
    }

    :deep(.el-dialog__body) {
      padding: 0 16px 16px;
    }
  }

  .preview-header {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;

    .preview-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .preview-header-actions {
      display: flex;
      flex-shrink: 0;
      gap: 8px;
    }
  }

  .preview-body {
    height: 76vh;
    padding: 12px;
    overflow: auto;
    background: var(--el-fill-color-light);
    border-radius: 4px;
  }

  /* 模拟公文纸张 */
  .doc-paper {
    max-width: 1100px;
    min-height: 100%;
    padding: 40px 64px;
    margin: 0 auto;
    line-height: 1.8;
    color: var(--el-text-color-primary);
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px rgb(0 0 0 / 8%);

    .doc-title {
      margin: 0 0 12px;
      font-size: 22px;
      font-weight: 700;
      text-align: center;
    }

    .doc-meta {
      font-size: 13px;
      color: var(--el-text-color-secondary);
      text-align: center;

      .meta-divider {
        margin: 0 8px;
        color: var(--el-border-color);
      }
    }

    h2 {
      margin: 20px 0 8px;
      font-size: 16px;
      font-weight: 600;
    }

    p {
      margin: 8px 0;
      font-size: 14px;
      text-indent: 2em;
    }

    .doc-tip {
      margin-top: 24px;
      font-size: 12px;
      color: var(--el-text-color-placeholder);
      text-align: center;
      text-indent: 0;
    }
  }
</style>
