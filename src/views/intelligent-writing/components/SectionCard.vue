<template>
  <div class="section-card" :class="section.status">
    <div class="section-header">
      <div class="section-info">
        <span class="section-name">{{ section.name }}</span>
        <el-tag
          :type="statusType"
          size="small"
        >
          {{ statusText }}
        </el-tag>
      </div>
      <div class="section-actions">
        <el-button
          v-if="section.status === 'pending'"
          type="primary"
          size="small"
          :loading="generating"
          @click="handleGenerate"
        >
          生成
        </el-button>
        <el-button
          v-if="section.status === 'completed'"
          type="success"
          size="small"
          @click="handleInsert"
        >
          插入
        </el-button>
      </div>
    </div>
    <div v-if="section.status === 'completed'" class="section-preview">
      <div class="preview-content">
        {{ previewContent }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

defineOptions({
  name: 'SectionCard'
})

interface Section {
  id: string
  name: string
  status: 'pending' | 'generating' | 'completed'
}

const props = defineProps<{
  section: Section
}>()

const emit = defineEmits<{
  generate: [sectionId: string]
  insert: [content: string]
}>()

const generating = ref(false)

const statusType = computed(() => {
  const typeMap: Record<string, any> = {
    pending: 'info',
    generating: 'warning',
    completed: 'success'
  }
  return typeMap[props.section.status] || 'info'
})

const statusText = computed(() => {
  const textMap: Record<string, string> = {
    pending: '待生成',
    generating: '生成中',
    completed: '已完成'
  }
  return textMap[props.section.status] || '未知'
})

const previewContent = computed(() => {
  return `这是${props.section.name}的内容预览...`
})

const handleGenerate = async () => {
  generating.value = true
  emit('generate', props.section.id)

  // 模拟生成过程
  setTimeout(() => {
    generating.value = false
  }, 2000)
}

const handleInsert = () => {
  const content = `<h3>${props.section.name}</h3><p>${previewContent.value}</p>`
  emit('insert', content)
}
</script>

<style scoped lang="scss">
.section-card {
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: #fff;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &.completed {
    border-color: #67c23a;
    background: #f0f9ff;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;

    .section-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .section-name {
        font-size: 14px;
        color: #303133;
        font-weight: 500;
      }
    }

    .section-actions {
      display: flex;
      gap: 8px;
    }
  }

  .section-preview {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #e4e7ed;

    .preview-content {
      font-size: 13px;
      color: #606266;
      line-height: 1.6;
      max-height: 60px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }
  }
}
</style>
