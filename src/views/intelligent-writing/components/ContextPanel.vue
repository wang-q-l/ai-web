<template>
  <div class="context-panel">
    <div class="panel-header">
      <h4>上下文信息</h4>
    </div>
    <div class="panel-content">
      <!-- 项目信息 -->
      <div class="info-section">
        <div class="section-title">项目信息</div>
        <div class="info-item">
          <span class="label">项目名称：</span>
          <span class="value">{{ projectInfo.name }}</span>
        </div>
        <div class="info-item">
          <span class="label">当前文书：</span>
          <span class="value">{{ currentDocName }}</span>
        </div>
      </div>

      <!-- 关联文书 -->
      <div class="info-section" v-if="relatedDocs.length > 0">
        <div class="section-title">关联文书</div>
        <div class="related-docs">
          <div
            v-for="doc in relatedDocs"
            :key="doc.id"
            class="related-doc-item"
          >
            <span class="doc-name">{{ doc.name }}</span>
            <el-tag :type="doc.status === 'completed' ? 'success' : 'info'" size="small">
              {{ doc.status === 'completed' ? '已完成' : '未完成' }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  name: 'ContextPanel'
})

const props = defineProps<{
  projectId: string
  currentDocType: string
}>()

const projectInfo = computed(() => {
  const projects: Record<string, any> = {
    project1: { name: '某市财政局2023年度预算执行审计' },
    project2: { name: '某国企固定资产管理审计' },
    project3: { name: '某高校科研经费使用审计' }
  }
  return projects[props.projectId] || { name: '未知项目' }
})

const currentDocName = computed(() => {
  const docNames: Record<string, string> = {
    auditNotice: '审计通知书',
    auditPlan: '审计方案',
    evidence: '审计取证单',
    auditDraft: '审计底稿',
    auditReport: '审计报告',
    auditOpinion: '审计意见书'
  }
  return docNames[props.currentDocType] || '未知文书'
})

const relatedDocs = computed(() => {
  const dependencies: Record<string, string[]> = {
    auditNotice: [],
    auditPlan: ['auditNotice'],
    evidence: ['auditPlan'],
    auditDraft: ['evidence'],
    auditReport: ['auditDraft'],
    auditOpinion: ['auditReport']
  }

  const docNames: Record<string, string> = {
    auditNotice: '审计通知书',
    auditPlan: '审计方案',
    evidence: '审计取证单',
    auditDraft: '审计底稿',
    auditReport: '审计报告',
    auditOpinion: '审计意见书'
  }

  const deps = dependencies[props.currentDocType] || []
  return deps.map(id => ({
    id,
    name: docNames[id],
    status: 'completed'
  }))
})
</script>

<style scoped lang="scss">
.context-panel {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;

  .panel-header {
    padding: 12px 16px;
    background: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;

    h4 {
      margin: 0;
      font-size: 14px;
      color: #303133;
      font-weight: 500;
    }
  }

  .panel-content {
    padding: 16px;

    .info-section {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      .section-title {
        font-size: 13px;
        color: #606266;
        font-weight: 500;
        margin-bottom: 8px;
      }

      .info-item {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        font-size: 13px;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          color: #909399;
          min-width: 80px;
        }

        .value {
          color: #303133;
        }
      }

      .related-docs {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .related-doc-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: #f5f7fa;
          border-radius: 4px;
          font-size: 13px;

          .doc-name {
            color: #303133;
          }
        }
      }
    }
  }
}
</style>
