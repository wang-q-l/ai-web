<template>
  <div class="audit-document-edit-page">
    <!-- 面包屑卡片 -->
    <el-card class="breadcrumb-card">
      <div class="breadcrumb-content">
        <div class="breadcrumb-left">
          <el-button text @click="handleBack">
            <el-icon><ArrowLeft /></el-icon>
            返回审计项目
          </el-button>
          <span class="divider">|</span>
          <span class="page-info">编辑文书 - 审计取证单</span>
        </div>
        <div class="breadcrumb-right">
          <el-button @click="drawerVisible = true">
            <el-icon><MagicStick /></el-icon>
            AI助手
          </el-button>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </div>
      </div>
    </el-card>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧文书树 -->
      <el-card class="tree-card">
        <template #header>
          <span>文书目录</span>
        </template>
        <el-tree
          :data="treeData"
          :props="treeProps"
          default-expand-all
          highlight-current
          @node-click="handleNodeClick"
        >
          <template #default="{ node, data }">
            <span class="tree-node">
              <el-icon v-if="data.icon"><component :is="data.icon" /></el-icon>
              <span>{{ node.label }}</span>
            </span>
          </template>
        </el-tree>
      </el-card>

      <!-- 右侧编辑器 -->
      <el-card class="editor-card">
        <template #header>
          <div class="editor-header">
            <span>文书名称：</span>
            <el-input v-model="documentName" placeholder="请输入文书名称" style="width: 300px" />
            <span class="editor-number">编号：</span>
            <el-input v-model="documentNumber" placeholder="请输入编号" style="width: 200px" />
          </div>
        </template>

        <ArtWangEditor
          ref="editorRef"
          v-model="editorContent"
          height="calc(100vh - 280px)"
          placeholder="请输入审计取证单内容，或使用右侧AI助手快速生成..."
        />
      </el-card>
    </div>

    <!-- AI助手抽屉 -->
    <AiAssistantDrawer
      v-model="drawerVisible"
      :project-context="projectContext"
      :editor-content="editorContent"
      @insert-content="handleInsertContent"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { ArrowLeft, MagicStick, Document, Folder } from '@element-plus/icons-vue'
  import ArtWangEditor from '@/components/core/forms/art-wang-editor/index.vue'
  import AiAssistantDrawer from '@/components/business/ai-assistant-drawer/index.vue'
  import type { ProjectContext, InsertMode } from '@/types/ai-assistant'

  defineOptions({
    name: 'AuditDocumentEdit'
  })

  const router = useRouter()
  const editorRef = ref()

  // 文书信息
  const documentName = ref('审计取证单')
  const documentNumber = ref('')
  const editorContent = ref('')

  // AI助手
  const drawerVisible = ref(false)

  // 项目上下文（模拟数据）
  const projectContext = ref<ProjectContext>({
    projectName: 'ZY科技2026年度经济决策审计',
    auditedUnit: 'ZY科技集团',
    auditType: '财务审计',
    auditItem: '重大经济决策审计',
    auditItemDesc: '针对重大项目立项、预算调整、对外投资等决策的合规性审计'
  })

  // 文书树数据
  const treeData = ref([
    {
      id: 1,
      label: '重大经济决策审计',
      icon: Folder,
      children: [
        {
          id: 11,
          label: '审计取证单',
          icon: Document
        },
        {
          id: 12,
          label: '审计通知书',
          icon: Document
        },
        {
          id: 13,
          label: '审计报告',
          icon: Document
        }
      ]
    },
    {
      id: 2,
      label: '内控体系及公司治理',
      icon: Folder,
      children: [
        {
          id: 21,
          label: '审计取证单',
          icon: Document
        }
      ]
    }
  ])

  const treeProps = {
    children: 'children',
    label: 'label'
  }

  // 返回
  const handleBack = () => {
    router.back()
  }

  // 保存
  const handleSave = () => {
    if (!editorContent.value) {
      ElMessage.warning('请输入文书内容')
      return
    }

    // 模拟保存
    ElMessage.success('保存成功')
  }

  // 树节点点击
  const handleNodeClick = (data: any) => {
    console.log('点击节点:', data)
    // 这里可以加载对应文书的内容
  }

  // 插入内容
  const handleInsertContent = (content: string, mode: InsertMode) => {
    const editor = editorRef.value?.getEditor()
    if (!editor) {
      ElMessage.error('编辑器未初始化')
      return
    }

    switch (mode) {
      case 'cursor': {
        // 插入到光标位置
        editor.dangerouslyInsertHtml(content)
        break
      }
      case 'replace': {
        // 替换全部内容
        editor.setHtml(content)
        break
      }
      case 'append': {
        // 追加到末尾
        const currentHtml = editor.getHtml()
        editor.setHtml(currentHtml + '<br/>' + content)
        break
      }
    }

    ElMessage.success('内容已插入')
  }

  onMounted(() => {
    // 初始化时可以加载草稿或已保存的内容
    console.log('页面已加载')
  })
</script>

<style scoped lang="scss">
  .audit-document-edit-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
  }

  .breadcrumb-card {
    flex-shrink: 0;
    border: none !important;
    border-radius: 12px;
    box-shadow: none !important;

    :deep(.el-card__body) {
      display: flex;
      align-items: center;
      height: 60px;
      padding: 0 20px;
    }

    .breadcrumb-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: 60px;

      .breadcrumb-left {
        display: flex;
        gap: 12px;
        align-items: center;

        .el-button {
          padding: 0;
          font-size: 14px;
          color: #606266;

          &:hover {
            color: var(--el-color-primary);
          }

          .el-icon {
            font-size: 16px;
          }
        }

        .divider {
          font-size: 14px;
          color: #dcdfe6;
        }

        .page-info {
          font-size: 14px;
          font-weight: 500;
          color: #303133;
        }
      }

      .breadcrumb-right {
        display: flex;
        gap: 12px;
      }
    }
  }

  .main-content {
    display: flex;
    flex: 1;
    gap: 16px;
    overflow: hidden;
  }

  .tree-card {
    flex-shrink: 0;
    width: 250px;
    overflow: hidden;
    border: none !important;
    border-radius: 12px;
    box-shadow: none !important;

    :deep(.el-card__header) {
      padding: 16px 20px;
      font-weight: 500;
    }

    :deep(.el-card__body) {
      height: calc(100% - 57px);
      padding: 0 20px 20px;
      overflow-y: auto;
    }

    .tree-node {
      display: flex;
      gap: 6px;
      align-items: center;
      font-size: 14px;

      .el-icon {
        font-size: 16px;
        color: var(--el-text-color-secondary);
      }
    }
  }

  .editor-card {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
    border: none !important;
    border-radius: 12px;
    box-shadow: none !important;

    :deep(.el-card__header) {
      flex-shrink: 0;
      padding: 16px 20px;
    }

    :deep(.el-card__body) {
      display: flex;
      flex: 1;
      flex-direction: column;
      padding: 20px;
      overflow: hidden;
    }

    .editor-header {
      display: flex;
      gap: 12px;
      align-items: center;
      font-size: 14px;

      .editor-number {
        margin-left: 20px;
      }
    }
  }
</style>
