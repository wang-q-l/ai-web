<template>
  <el-drawer
    v-model="visible"
    title="AI 助手"
    direction="rtl"
    size="600px"
    :before-close="handleClose"
    class="ai-assistant-drawer"
  >
    <div class="drawer-content">
      <!-- 项目上下文 -->
      <ContextCard :context="projectContext" />

      <!-- 章节生成区域 -->
      <div class="sections-area">
        <div class="area-header">
          <span class="icon">📋</span>
          <span class="title">章节生成</span>
        </div>

        <div class="sections-list">
          <SectionCard
            v-for="section in sections"
            :key="section.id"
            :section="section"
            @generate="handleGenerateSection"
            @insert="handleInsertSection"
            @update="handleUpdateSection"
          />
        </div>

        <el-button
          class="generate-all-btn"
          type="primary"
          :loading="generatingAll"
          @click="showGenerateAllDialog = true"
        >
          一键生成全部章节
        </el-button>
      </div>

      <!-- 已生成内容区域 -->
      <div v-if="completedSections.length > 0" class="generated-area">
        <div class="area-header">
          <span class="icon">📄</span>
          <span class="title"
            >已生成内容 ({{ completedSections.length }}/{{ sections.length }})</span
          >
        </div>
        <div class="generated-info">
          <el-tag
            v-for="section in completedSections"
            :key="section.id"
            size="small"
            type="success"
            class="section-tag"
          >
            {{ section.name }}
          </el-tag>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleClear">清空</el-button>
        <el-button @click="handleSaveDraft">保存草稿</el-button>
        <el-button
          type="primary"
          :disabled="completedSections.length === 0"
          @click="handleInsertAll"
        >
          全部插入
        </el-button>
      </div>
    </template>
  </el-drawer>

  <!-- 一键生成对话框 -->
  <el-dialog
    v-model="showGenerateAllDialog"
    title="一键生成全部章节"
    width="500px"
    :close-on-click-modal="false"
  >
    <div class="generate-all-dialog">
      <p class="dialog-desc">检测到以下章节需要补充信息：</p>
      <ul class="pending-sections">
        <li v-for="section in pendingSections" :key="section.id">
          {{ section.name }} ({{ section.requiredQuestions }}个问题)
        </li>
      </ul>

      <p class="dialog-label">请选择生成方式：</p>
      <el-radio-group v-model="generateMode" class="mode-group">
        <el-radio value="quick">
          <div class="mode-option">
            <div class="mode-title">快速生成（推荐）</div>
            <div class="mode-desc">AI根据项目信息自动推断，快速生成所有章节</div>
          </div>
        </el-radio>
        <el-radio value="complete">
          <div class="mode-option">
            <div class="mode-title">完整生成</div>
            <div class="mode-desc">逐个回答问题后生成，内容更准确</div>
          </div>
        </el-radio>
      </el-radio-group>
    </div>

    <template #footer>
      <el-button @click="showGenerateAllDialog = false">取消</el-button>
      <el-button type="primary" :loading="generatingAll" @click="handleGenerateAll">
        开始生成
      </el-button>
    </template>
  </el-dialog>

  <!-- 生成进度对话框 -->
  <el-dialog
    v-model="showProgressDialog"
    title="正在生成内容"
    width="400px"
    :close-on-click-modal="false"
    :show-close="false"
  >
    <div class="progress-dialog">
      <el-progress :percentage="generateProgress" :status="generateStatus" />
      <p class="progress-text">{{ progressText }}</p>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import ContextCard from './ContextCard.vue'
  import SectionCard from './SectionCard.vue'
  import type { Section, ProjectContext, InsertMode, GenerateMode } from '@/types/ai-assistant'
  import { STANDARD_SECTIONS } from '@/mock/aiAssistant'
  import { generateSection, saveDraft, loadDraft } from '@/api/aiAssistant'

  defineOptions({
    name: 'AiAssistantDrawer'
  })

  interface Props {
    modelValue: boolean
    projectContext: ProjectContext
    editorContent?: string
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'insert-content', content: string, mode: InsertMode): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  // 章节列表
  const sections = ref<Section[]>([])

  // 生成相关
  const generatingAll = ref(false)
  const showGenerateAllDialog = ref(false)
  const generateMode = ref<GenerateMode>('quick')
  const showProgressDialog = ref(false)
  const generateProgress = ref(0)
  const generateStatus = ref<'success' | 'exception' | 'warning' | undefined>(undefined)
  const progressText = ref('')

  // 计算已完成的章节
  const completedSections = computed(() => {
    return sections.value.filter((s) => s.status === 'completed')
  })

  // 计算待生成的章节
  const pendingSections = computed(() => {
    return sections.value.filter((s) => s.status === 'pending' && s.requiredQuestions > 0)
  })

  // 初始化章节
  const initSections = () => {
    sections.value = STANDARD_SECTIONS.map((s) => ({
      ...s,
      content: '',
      isInserted: false,
      answers: []
    }))
  }

  // 生成单个章节
  const handleGenerateSection = async (sectionId: string, answers?: string[]) => {
    const section = sections.value.find((s) => s.id === sectionId)
    if (!section) return

    section.status = 'generating'

    try {
      const response = await generateSection({
        sectionId,
        context: props.projectContext,
        editorContent: props.editorContent,
        answers
      })

      // 处理 Mock 模式和真实 API 的不同响应格式
      const result = 'data' in response ? response.data : response

      if (result.success) {
        section.content = result.content
        section.status = 'completed'
        section.answers = answers
        ElMessage.success(`${section.name}已生成`)
      } else {
        section.status = section.requiredQuestions > 0 ? 'pending' : 'ready'
        ElMessage.error(result.message || '生成失败')
      }
    } catch {
      section.status = section.requiredQuestions > 0 ? 'pending' : 'ready'
      ElMessage.error('生成失败，请重试')
    }
  }

  // 插入单个章节
  const handleInsertSection = (sectionId: string, mode: InsertMode) => {
    const section = sections.value.find((s) => s.id === sectionId)
    if (!section || !section.content) return

    emit('insert-content', section.content, mode)
    section.isInserted = true
    ElMessage.success('内容已插入到编辑器')
  }

  // 更新章节内容
  const handleUpdateSection = (sectionId: string, content: string) => {
    const section = sections.value.find((s) => s.id === sectionId)
    if (section) {
      section.content = content
    }
  }

  // 一键生成全部
  const handleGenerateAll = async () => {
    showGenerateAllDialog.value = false
    generatingAll.value = true
    showProgressDialog.value = true
    generateProgress.value = 0
    generateStatus.value = undefined

    try {
      if (generateMode.value === 'quick') {
        // 快速生成模式
        progressText.value = '正在分析项目信息...'
        await new Promise((resolve) => setTimeout(resolve, 500))

        const total = sections.value.length
        let completed = 0

        for (const section of sections.value) {
          if (section.status === 'completed') {
            completed++
            continue
          }

          progressText.value = `正在生成 ${section.name}...`

          try {
            const response = await generateSection({
              sectionId: section.id,
              context: props.projectContext,
              editorContent: props.editorContent
            })

            // 处理 Mock 模式和真实 API 的不同响应格式
            const result = 'data' in response ? response.data : response

            if (result.success) {
              section.content = result.content
              section.status = 'completed'
            }
          } catch (error) {
            console.error(`生成${section.name}失败`, error)
          }

          completed++
          generateProgress.value = Math.round((completed / total) * 100)
        }

        generateStatus.value = 'success'
        progressText.value = '全部章节生成完成！'

        setTimeout(() => {
          showProgressDialog.value = false
          ElMessage.success('全部章节已生成')
        }, 1000)
      } else {
        // 完整生成模式 - 暂不实现，提示用户逐个生成
        showProgressDialog.value = false
        ElMessage.info('完整生成模式需要逐个回答问题，请点击各章节的"生成"按钮')
      }
    } catch {
      generateStatus.value = 'exception'
      progressText.value = '生成失败'
      ElMessage.error('生成失败，请重试')
    } finally {
      generatingAll.value = false
    }
  }

  // 全部插入
  const handleInsertAll = () => {
    const contents = completedSections.value.map((s) => s.content).join('\n\n')
    emit('insert-content', contents, 'append')

    completedSections.value.forEach((s) => {
      s.isInserted = true
    })

    ElMessage.success('所有内容已插入到编辑器')
  }

  // 保存草稿
  const handleSaveDraft = async () => {
    try {
      await saveDraft({
        context: props.projectContext,
        sections: sections.value,
        savedAt: new Date().toISOString()
      })
      ElMessage.success('草稿已保存')
    } catch {
      ElMessage.error('保存失败')
    }
  }

  // 清空
  const handleClear = async () => {
    try {
      await ElMessageBox.confirm('确定要清空所有已生成的内容吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      initSections()
      ElMessage.success('已清空')
    } catch {
      // 用户取消
    }
  }

  // 关闭抽屉
  const handleClose = (done: () => void) => {
    const hasUnsaved = completedSections.value.some((s) => !s.isInserted)

    if (hasUnsaved) {
      ElMessageBox.confirm('有未插入的内容，确定要关闭吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          done()
        })
        .catch(() => {
          // 用户取消
        })
    } else {
      done()
    }
  }

  // 监听抽屉打开
  watch(visible, async (val) => {
    if (val) {
      // 尝试加载草稿
      try {
        const response = await loadDraft()
        if (response.success && response.data) {
          sections.value = response.data.sections
          ElMessage.info('已加载草稿')
        } else {
          initSections()
        }
      } catch {
        initSections()
      }
    }
  })

  // 初始化
  initSections()
</script>

<style scoped lang="scss">
  .ai-assistant-drawer {
    :deep(.el-drawer__header) {
      padding: 20px;
      margin-bottom: 16px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    :deep(.el-drawer__body) {
      display: flex;
      flex-direction: column;
      padding: 0;
    }

    :deep(.el-drawer__footer) {
      padding: 16px 20px;
      border-top: 1px solid var(--el-border-color-lighter);
    }

    .drawer-content {
      flex: 1;
      padding: 20px;
      overflow-y: auto;

      .sections-area,
      .generated-area {
        margin-top: 20px;

        .area-header {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-bottom: 12px;

          .icon {
            font-size: 18px;
          }

          .title {
            font-size: 15px;
            font-weight: 500;
            color: var(--el-text-color-primary);
          }
        }
      }

      .sections-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .generate-all-btn {
        width: 100%;
        margin-top: 16px;
      }

      .generated-info {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .section-tag {
          cursor: default;
        }
      }
    }

    .drawer-footer {
      display: flex;
      gap: 12px;
      justify-content: space-between;

      .el-button {
        flex: 1;
      }
    }
  }

  .generate-all-dialog {
    .dialog-desc {
      margin-bottom: 12px;
      font-size: 14px;
      color: var(--el-text-color-regular);
    }

    .pending-sections {
      padding: 0;
      margin: 0 0 20px 20px;
      list-style: disc;

      li {
        margin-bottom: 8px;
        font-size: 13px;
        color: var(--el-text-color-secondary);
      }
    }

    .dialog-label {
      margin-bottom: 12px;
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }

    .mode-group {
      display: flex;
      flex-direction: column;
      gap: 12px;

      :deep(.el-radio) {
        align-items: flex-start;
        height: auto;
        margin-right: 0;
      }

      .mode-option {
        margin-left: 8px;

        .mode-title {
          margin-bottom: 4px;
          font-size: 14px;
          font-weight: 500;
          color: var(--el-text-color-primary);
        }

        .mode-desc {
          font-size: 12px;
          line-height: 1.5;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }

  .progress-dialog {
    .progress-text {
      margin-top: 16px;
      font-size: 14px;
      color: var(--el-text-color-regular);
      text-align: center;
    }
  }
</style>
