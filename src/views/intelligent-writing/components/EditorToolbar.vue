<template>
  <div class="editor-toolbar">
    <div class="toolbar-left">
      <span class="toolbar-title">文书编辑器</span>
    </div>
    <div class="toolbar-right">
      <el-button @click="handleOpenAI">
        <el-icon><MagicStick /></el-icon>
        AI 助手
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MagicStick } from '@element-plus/icons-vue'

defineOptions({
  name: 'EditorToolbar'
})

const emit = defineEmits<{
  openAiAssistant: []
}>()

const handleOpenAI = () => {
  emit('openAiAssistant')
}
</script>

<style scoped lang="scss">
.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 20px;
  border-bottom: 1px solid #e4e7ed;
  background: #fff;

  .toolbar-left {
    .toolbar-title {
      font-size: 14px;
      color: #303133;
      font-weight: 500;
    }
  }

  .toolbar-right {
    display: flex;
    gap: 12px;
  }
}
</style>
