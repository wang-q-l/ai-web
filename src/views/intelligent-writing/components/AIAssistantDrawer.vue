<template>
  <el-drawer
    v-model="drawerVisible"
    title="AI 助手"
    direction="rtl"
    size="600px"
    @close="handleClose"
  >
    <div class="ai-assistant-content">
      <!-- 上下文面板 -->
      <ContextPanel :project-id="projectId" :current-doc-type="currentDocType" />

      <!-- 章节列表 -->
      <SectionList
        :current-doc-type="currentDocType"
        @generate-section="handleGenerateSection"
        @insert-section="handleInsertSection"
      />
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ContextPanel from './ContextPanel.vue'
import SectionList from './SectionList.vue'

defineOptions({
  name: 'AIAssistantDrawer'
})

const props = defineProps<{
  visible: boolean
  currentDocType: string
  projectId: string
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  insertContent: [content: string]
}>()

const drawerVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const handleClose = () => {
  emit('update:visible', false)
}

const handleGenerateSection = (sectionId: string) => {
  console.log('生成章节:', sectionId)
}

const handleInsertSection = (content: string) => {
  emit('insertContent', content)
  emit('update:visible', false)
}
</script>

<style scoped lang="scss">
.ai-assistant-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}
</style>
