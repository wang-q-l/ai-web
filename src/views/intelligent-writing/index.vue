<template>
  <div class="intelligent-writing-container">
    <!-- 面包屑卡片 -->
    <el-card class="breadcrumb-card">
      <div class="breadcrumb-content">
        <div class="breadcrumb-left">
          <el-button text @click="handleBack">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
          <span class="divider">|</span>
          <span class="page-info">智能撰写演示</span>
        </div>
      </div>
    </el-card>

    <!-- 项目选择卡片 -->
    <el-card class="project-card">
      <div class="project-selector">
        <span class="label">当前项目：</span>
        <el-select v-model="currentProjectId" @change="handleProjectChange" style="width: 400px">
          <el-option label="某市财政局2023年度预算执行审计" value="project1" />
          <el-option label="某国企固定资产管理审计" value="project2" />
          <el-option label="某高校科研经费使用审计" value="project3" />
        </el-select>
      </div>
    </el-card>

    <!-- 文书类型选择卡片 -->
    <el-card class="document-types-card">
      <div class="document-types-grid">
        <DocumentTypeCard
          v-for="docType in documentTypes"
          :key="docType.id"
          :doc-type="docType"
          :selected="currentDocType === docType.id"
          @click="handleDocTypeChange(docType.id)"
        />
      </div>
    </el-card>

    <!-- 编辑器卡片 -->
    <el-card class="editor-card">
      <EditorToolbar @open-ai-assistant="handleOpenAIAssistant" />
      <div class="editor-container">
        <div ref="editorRef" class="editor-content"></div>
      </div>
    </el-card>

    <!-- AI 助手抽屉 -->
    <AIAssistantDrawer
      v-model:visible="aiAssistantVisible"
      :current-doc-type="currentDocType"
      :project-id="currentProjectId"
      @insert-content="handleInsertContent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { createEditor, IEditorConfig } from '@wangeditor/editor'
import DocumentTypeCard from './components/DocumentTypeCard.vue'
import EditorToolbar from './components/EditorToolbar.vue'
import AIAssistantDrawer from './components/AIAssistantDrawer.vue'
import '@wangeditor/editor/dist/css/style.css'

defineOptions({
  name: 'IntelligentWritingDemo'
})

const router = useRouter()
const editorRef = ref()
let editor: any = null

const currentProjectId = ref('project1')
const currentDocType = ref('auditNotice')
const aiAssistantVisible = ref(false)

interface DocType {
  id: string
  name: string
  icon: string
  status: 'completed' | 'in-progress' | 'not-started'
}

const documentTypes = ref<DocType[]>([
  { id: 'auditNotice', name: '审计通知书', icon: '📋', status: 'completed' },
  { id: 'auditPlan', name: '审计方案', icon: '📝', status: 'completed' },
  { id: 'evidence', name: '审计取证单', icon: '🔍', status: 'in-progress' },
  { id: 'auditDraft', name: '审计底稿', icon: '📄', status: 'not-started' },
  { id: 'auditReport', name: '审计报告', icon: '📊', status: 'not-started' },
  { id: 'auditOpinion', name: '审计意见书', icon: '✍️', status: 'not-started' }
])

const handleBack = () => {
  router.push('/audit')
}

const handleProjectChange = () => {
  loadDocumentContent()
}

const handleDocTypeChange = (docType: string) => {
  currentDocType.value = docType
  loadDocumentContent()
}

const handleOpenAIAssistant = () => {
  aiAssistantVisible.value = true
}

const handleInsertContent = (content: string) => {
  if (editor) {
    editor.dangerouslyInsertHtml(content)
  }
}

const loadDocumentContent = () => {
  if (!editor) return

  // 模拟加载文书内容
  const mockContent = `<h2>${documentTypes.value.find(d => d.id === currentDocType.value)?.name}</h2><p>这里是文书内容...</p>`
  editor.setHtml(mockContent)
}

const initEditor = () => {
  if (!editorRef.value) return

  const editorConfig: Partial<IEditorConfig> = {
    placeholder: '请输入内容...',
    MENU_CONF: {}
  }

  editor = createEditor({
    selector: editorRef.value,
    config: editorConfig,
    mode: 'default'
  })

  loadDocumentContent()
}

onMounted(() => {
  setTimeout(() => {
    initEditor()
  }, 100)
})

onBeforeUnmount(() => {
  if (editor) {
    editor.destroy()
  }
})
</script>

<style scoped lang="scss">
.intelligent-writing-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.breadcrumb-card {
  flex-shrink: 0;
  border: none !important;
  box-shadow: none !important;
  border-radius: 12px;

  :deep(.el-card__body) {
    padding: 0 20px;
    height: 60px;
    display: flex;
    align-items: center;
  }

  .breadcrumb-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .breadcrumb-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .el-button {
      font-size: 14px;
      color: #606266;
      padding: 0;

      &:hover {
        color: var(--el-color-primary);
      }

      .el-icon {
        font-size: 16px;
      }
    }

    .divider {
      color: #dcdfe6;
      font-size: 14px;
    }

    .page-info {
      font-size: 14px;
      color: #303133;
      font-weight: 500;
    }
  }
}

.project-card {
  flex-shrink: 0;
  border: none !important;
  box-shadow: none !important;
  border-radius: 12px;

  :deep(.el-card__body) {
    padding: 20px;
  }

  .project-selector {
    display: flex;
    align-items: center;
    gap: 12px;

    .label {
      font-size: 14px;
      color: #606266;
      font-weight: 500;
    }
  }
}

.document-types-card {
  flex-shrink: 0;
  border: none !important;
  box-shadow: none !important;
  border-radius: 12px;

  :deep(.el-card__body) {
    padding: 20px;
  }

  .document-types-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 16px;
  }
}

.editor-card {
  flex: 1;
  border: none !important;
  box-shadow: none !important;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  :deep(.el-card__body) {
    padding: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .editor-container {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .editor-content {
      flex: 1;
      overflow-y: auto;
    }
  }
}
</style>
