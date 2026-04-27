<template>
  <el-card class="section-card" shadow="never">
    <div class="section-header">
      <div class="header-left">
        <el-icon :class="['status-icon', statusClass]">
          <component :is="statusIcon" />
        </el-icon>
        <span class="section-name">{{ section.name }}</span>
        <span
          v-if="section.requiredQuestions > 0 && section.status !== 'completed'"
          class="questions-badge"
        >
          需补充{{ section.requiredQuestions }}个问题
        </span>
        <el-tag v-if="section.optional" size="small" type="info">可选</el-tag>
        <el-tag v-if="section.isInserted" size="small" type="success">已插入</el-tag>
      </div>
      <div class="header-right">
        <el-button
          v-if="section.status !== 'completed'"
          size="small"
          type="primary"
          :loading="section.status === 'generating'"
          @click="handleGenerate"
        >
          {{ section.status === 'generating' ? '生成中...' : '生成' }}
        </el-button>
      </div>
    </div>

    <!-- 对话区域 -->
    <el-collapse-transition>
      <div v-if="showDialog" class="dialog-area">
        <div class="dialog-messages">
          <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.role]">
            <div class="message-avatar">{{ msg.role === 'ai' ? '🤖' : '👤' }}</div>
            <div class="message-content">{{ msg.content }}</div>
          </div>
        </div>

        <div v-if="currentQuestion" class="input-area">
          <el-input
            v-model="currentAnswer"
            type="textarea"
            :rows="3"
            :placeholder="currentQuestion.placeholder"
            @keydown.ctrl.enter="handleSendAnswer"
          />
          <div class="input-actions">
            <el-button size="small" @click="handleSkipQuestion">跳过此问题</el-button>
            <el-button size="small" type="primary" @click="handleSendAnswer">发送</el-button>
          </div>
        </div>
      </div>
    </el-collapse-transition>

    <!-- 已生成内容 -->
    <el-collapse-transition>
      <div v-if="section.status === 'completed' && section.content" class="content-area">
        <div class="content-preview" v-html="section.content"></div>
        <div class="content-actions">
          <el-button size="small" @click="handleEdit">编辑</el-button>
          <el-button size="small" @click="handleRegenerate">重新生成</el-button>
          <el-dropdown @command="handleInsert">
            <el-button size="small" type="primary">
              插入 <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="cursor">插入到光标位置</el-dropdown-item>
                <el-dropdown-item command="replace">替换全部内容</el-dropdown-item>
                <el-dropdown-item command="append">追加到末尾</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-collapse-transition>

    <!-- 编辑对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑内容" width="600px">
      <el-input v-model="editContent" type="textarea" :rows="10" />
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit">保存修改</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import { ArrowDown, Check, Warning, CircleClose } from '@element-plus/icons-vue'
  import type { Section, Question, InsertMode } from '@/types/ai-assistant'

  defineOptions({
    name: 'SectionCard'
  })

  interface Props {
    section: Section
  }

  interface Emits {
    (e: 'generate', sectionId: string, answers?: string[]): void
    (e: 'insert', sectionId: string, mode: InsertMode): void
    (e: 'update', sectionId: string, content: string): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 对话相关
  const showDialog = ref(false)
  const messages = ref<Array<{ role: 'ai' | 'user'; content: string }>>([])
  const currentQuestionIndex = ref(0)
  const currentAnswer = ref('')
  const answers = ref<string[]>([])

  // 编辑相关
  const editDialogVisible = ref(false)
  const editContent = ref('')

  // 计算当前问题
  const currentQuestion = computed<Question | null>(() => {
    if (!props.section.questions || currentQuestionIndex.value >= props.section.questions.length) {
      return null
    }
    return props.section.questions[currentQuestionIndex.value]
  })

  // 状态图标
  const statusIcon = computed(() => {
    switch (props.section.status) {
      case 'ready':
        return Check
      case 'pending':
        return Warning
      case 'completed':
        return Check
      default:
        return CircleClose
    }
  })

  const statusClass = computed(() => {
    switch (props.section.status) {
      case 'ready':
        return 'ready'
      case 'pending':
        return 'pending'
      case 'completed':
        return 'completed'
      default:
        return 'default'
    }
  })

  // 生成内容
  const handleGenerate = () => {
    if (
      props.section.requiredQuestions > 0 &&
      props.section.questions &&
      props.section.questions.length > 0
    ) {
      // 需要对话式生成
      showDialog.value = true
      messages.value = []
      currentQuestionIndex.value = 0
      answers.value = []

      // 显示第一个问题
      if (currentQuestion.value) {
        messages.value.push({
          role: 'ai',
          content: currentQuestion.value.content
        })
      }
    } else {
      // 可以直接生成
      emit('generate', props.section.id)
    }
  }

  // 发送答案
  const handleSendAnswer = () => {
    if (!currentAnswer.value.trim()) {
      ElMessage.warning('请输入答案')
      return
    }

    // 添加用户消息
    messages.value.push({
      role: 'user',
      content: currentAnswer.value
    })

    // 保存答案
    answers.value.push(currentAnswer.value)
    currentAnswer.value = ''

    // 下一个问题
    currentQuestionIndex.value++

    if (currentQuestion.value) {
      // 还有问题，继续提问
      setTimeout(() => {
        messages.value.push({
          role: 'ai',
          content: currentQuestion.value!.content
        })
      }, 300)
    } else {
      // 所有问题回答完毕，开始生成
      setTimeout(() => {
        messages.value.push({
          role: 'ai',
          content: '信息已收集完成，正在生成内容...'
        })
        showDialog.value = false
        emit('generate', props.section.id, answers.value)
      }, 500)
    }
  }

  // 跳过问题
  const handleSkipQuestion = () => {
    answers.value.push('')
    currentQuestionIndex.value++

    if (currentQuestion.value) {
      messages.value.push({
        role: 'ai',
        content: currentQuestion.value.content
      })
    } else {
      setTimeout(() => {
        messages.value.push({
          role: 'ai',
          content: '信息已收集完成，正在生成内容...'
        })
        showDialog.value = false
        emit('generate', props.section.id, answers.value)
      }, 500)
    }
  }

  // 编辑内容
  const handleEdit = () => {
    editContent.value = props.section.content
    editDialogVisible.value = true
  }

  // 保存编辑
  const handleSaveEdit = () => {
    emit('update', props.section.id, editContent.value)
    editDialogVisible.value = false
    ElMessage.success('内容已更新')
  }

  // 重新生成
  const handleRegenerate = () => {
    emit('generate', props.section.id)
  }

  // 插入内容
  const handleInsert = (mode: InsertMode) => {
    emit('insert', props.section.id, mode)
  }
</script>

<style scoped lang="scss">
  .section-card {
    margin-bottom: 12px;
    border: 1px solid var(--el-border-color-light) !important;
    border-radius: 8px;
    box-shadow: none !important;

    :deep(.el-card__body) {
      padding: 0;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;

      .header-left {
        display: flex;
        flex: 1;
        gap: 8px;
        align-items: center;

        .status-icon {
          font-size: 16px;

          &.ready {
            color: var(--el-color-success);
          }

          &.pending {
            color: var(--el-color-warning);
          }

          &.completed {
            color: var(--el-color-primary);
          }
        }

        .section-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--el-text-color-primary);
        }

        .questions-badge {
          font-size: 12px;
          color: var(--el-color-warning);
        }
      }
    }

    .dialog-area {
      padding: 16px;
      background: var(--el-fill-color-lighter);
      border-top: 1px solid var(--el-border-color-lighter);

      .dialog-messages {
        max-height: 300px;
        margin-bottom: 12px;
        overflow-y: auto;

        .message {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;

          &:last-child {
            margin-bottom: 0;
          }

          .message-avatar {
            display: flex;
            flex-shrink: 0;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            font-size: 18px;
          }

          .message-content {
            flex: 1;
            padding: 8px 12px;
            font-size: 13px;
            line-height: 1.6;
            border-radius: 8px;
          }

          &.ai .message-content {
            color: var(--el-text-color-primary);
            background: var(--el-color-primary-light-9);
          }

          &.user .message-content {
            color: var(--el-text-color-primary);
            background: var(--el-color-success-light-9);
          }
        }
      }

      .input-area {
        .input-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          margin-top: 8px;
        }
      }
    }

    .content-area {
      padding: 16px;
      border-top: 1px solid var(--el-border-color-lighter);

      .content-preview {
        max-height: 400px;
        padding: 12px;
        margin-bottom: 12px;
        overflow-y: auto;
        font-size: 13px;
        line-height: 1.8;
        background: var(--el-fill-color-lighter);
        border-radius: 4px;

        :deep(h3) {
          margin: 0 0 12px;
          font-size: 15px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        :deep(p) {
          margin: 0 0 8px;
        }

        :deep(ol),
        :deep(ul) {
          padding-left: 24px;
          margin: 8px 0;
        }

        :deep(li) {
          margin-bottom: 4px;
        }

        :deep(strong) {
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
      }

      .content-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }
    }
  }
</style>
