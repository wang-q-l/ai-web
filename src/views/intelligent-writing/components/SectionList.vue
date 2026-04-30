<template>
  <div class="section-list">
    <div class="list-header">
      <h4>章节列表</h4>
      <el-button type="primary" size="small" @click="handleGenerateAll">
        一键生成全部
      </el-button>
    </div>
    <div class="list-content">
      <SectionCard
        v-for="section in sections"
        :key="section.id"
        :section="section"
        @generate="handleGenerate"
        @insert="handleInsert"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SectionCard from './SectionCard.vue'

defineOptions({
  name: 'SectionList'
})

const props = defineProps<{
  currentDocType: string
}>()

const emit = defineEmits<{
  generateSection: [sectionId: string]
  insertSection: [content: string]
}>()

const sections = computed(() => {
  const sectionConfigs: Record<string, any[]> = {
    auditNotice: [
      { id: 'notice-1', name: '通知对象', status: 'completed' },
      { id: 'notice-2', name: '审计目的', status: 'completed' },
      { id: 'notice-3', name: '审计范围', status: 'completed' },
      { id: 'notice-4', name: '审计时间', status: 'completed' },
      { id: 'notice-5', name: '审计组成员', status: 'completed' }
    ],
    auditPlan: [
      { id: 'plan-1', name: '审计目标', status: 'completed' },
      { id: 'plan-2', name: '重点关注事项', status: 'completed' },
      { id: 'plan-3', name: '风险关注', status: 'completed' },
      { id: 'plan-4', name: '审计程序与方法', status: 'completed' },
      { id: 'plan-5', name: '时间安排', status: 'completed' }
    ],
    evidence: [
      { id: 'evidence-1', name: '审计事项摘要', status: 'completed' },
      { id: 'evidence-2', name: '风险点描述', status: 'completed' },
      { id: 'evidence-3', name: '审计程序', status: 'pending' },
      { id: 'evidence-4', name: '预期结果', status: 'pending' },
      { id: 'evidence-5', name: '取证要求', status: 'pending' }
    ],
    auditDraft: [
      { id: 'draft-1', name: '审计过程', status: 'pending' },
      { id: 'draft-2', name: '审计发现', status: 'pending' },
      { id: 'draft-3', name: '证据清单', status: 'pending' },
      { id: 'draft-4', name: '初步结论', status: 'pending' },
      { id: 'draft-5', name: '定性依据', status: 'pending' }
    ],
    auditReport: [
      { id: 'report-1', name: '审计概况', status: 'pending' },
      { id: 'report-2', name: '审计发现', status: 'pending' },
      { id: 'report-3', name: '审计结论', status: 'pending' },
      { id: 'report-4', name: '审计建议', status: 'pending' }
    ],
    auditOpinion: [
      { id: 'opinion-1', name: '审计意见', status: 'pending' },
      { id: 'opinion-2', name: '整改要求', status: 'pending' },
      { id: 'opinion-3', name: '整改期限', status: 'pending' },
      { id: 'opinion-4', name: '后续跟踪', status: 'pending' }
    ]
  }

  return sectionConfigs[props.currentDocType] || []
})

const handleGenerate = (sectionId: string) => {
  emit('generateSection', sectionId)
}

const handleInsert = (content: string) => {
  emit('insertSection', content)
}

const handleGenerateAll = () => {
  console.log('一键生成全部章节')
}
</script>

<style scoped lang="scss">
.section-list {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;

  .list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
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

  .list-content {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 500px;
    overflow-y: auto;
  }
}
</style>
