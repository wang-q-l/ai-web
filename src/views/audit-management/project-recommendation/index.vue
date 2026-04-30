<template>
  <div class="ai-chat-container">
    <!-- 查看推荐列表按钮 -->
    <div class="view-recommendations-btn">
      <el-button type="primary" @click="handleViewRecommendations">
        <el-icon><List /></el-icon>
        查看推荐列表
      </el-button>
    </div>

    <!-- 聊天消息区域 -->
    <div class="chat-main">
      <el-scrollbar ref="scrollbarRef" class="chat-scrollbar">
        <div class="chat-messages">
          <!-- 欢迎消息 -->
          <div v-if="messages.length === 0" class="welcome-message">
            <div class="welcome-icon">
              <el-icon :size="64"><ChatDotRound /></el-icon>
            </div>
            <h2>审计项目智能推荐助手</h2>
            <p class="welcome-desc">您好！我是审计项目推荐助手，可以帮您智能分析和推荐审计项目</p>
            <div class="quick-questions">
              <div class="quick-title">快速开始</div>
              <div class="quick-buttons">
                <div
                  v-for="(question, index) in quickQuestions"
                  :key="index"
                  class="quick-button"
                  @click="handleQuickQuestion(question)"
                >
                  <el-icon><ChatLineRound /></el-icon>
                  <span>{{ question }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 消息列表 -->
          <div
            v-for="message in messages"
            :key="message.id"
            :class="['message-item', `message-${message.type}`]"
          >
            <div class="message-avatar">
              <el-icon v-if="message.type === 'user'" :size="20"><User /></el-icon>
              <el-icon v-else :size="20"><ChatDotRound /></el-icon>
            </div>
            <div class="message-bubble">
              <div class="message-text" v-html="message.content.replace(/\n/g, '<br>')"></div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>

          <!-- AI思考过程 -->
          <div v-if="thinkingSteps.length > 0" class="message-item message-assistant">
            <div class="message-avatar">
              <el-icon :size="20"><ChatDotRound /></el-icon>
            </div>
            <div class="message-bubble thinking-bubble">
              <div class="thinking-steps">
                <div
                  v-for="(step, index) in thinkingSteps"
                  :key="index"
                  class="thinking-step"
                  :class="{ active: index === thinkingSteps.length - 1 }"
                >
                  <el-icon class="step-icon"><Loading /></el-icon>
                  <span>{{ step }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 打字机效果的消息 -->
          <div v-if="typingMessage" class="message-item message-assistant">
            <div class="message-avatar">
              <el-icon :size="20"><ChatDotRound /></el-icon>
            </div>
            <div class="message-bubble">
              <div class="message-text typing-text" v-html="typingMessage"></div>
              <span class="typing-cursor">|</span>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input-wrapper">
      <div class="chat-input-container">
        <el-input
          ref="inputRef"
          v-model="inputMessage"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 4 }"
          placeholder="输入您的问题，按 Enter 发送，Shift + Enter 换行..."
          :disabled="loading"
          class="chat-input"
          @keydown.enter.exact.prevent="handleSend"
        />
        <button
          class="send-button"
          :class="{ active: inputMessage.trim() && !loading }"
          :disabled="!inputMessage.trim() || loading"
          @click="handleSend"
        >
          <el-icon v-if="loading" class="is-loading"><Loading /></el-icon>
          <el-icon v-else><Promotion /></el-icon>
        </button>
      </div>
      <div class="input-tip">按 Enter 发送，Shift + Enter 换行</div>
    </div>

    <!-- 推荐列表弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="审计项目推荐清单"
      width="80%"
      :close-on-click-modal="false"
      class="recommendations-dialog"
    >
      <div class="dialog-content">
        <!-- 统计信息 -->
        <div class="statistics-info">
          <el-tag type="info" size="large">
            共 {{ currentRecommendations.length }} 个推荐项目
          </el-tag>
          <el-tag v-if="p0Count > 0" type="danger" size="large">
            离任审计 {{ p0Count }} 项（P0）
          </el-tag>
          <el-tag v-if="p1Count > 0" type="warning" size="large">
            从未审计 {{ p1Count }} 项（P1）
          </el-tag>
          <el-tag v-if="p2Count > 0" type="warning" size="large">
            轮审到期 {{ p2Count }} 项（P2）
          </el-tag>
          <el-tag v-if="p3Count > 0" type="info" size="large">
            即将到期 {{ p3Count }} 项（P3）
          </el-tag>
        </div>

        <!-- 推荐列表表格 -->
        <el-table
          ref="tableRef"
          :data="currentRecommendations"
          style="width: 100%; margin-top: 20px"
          max-height="500"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="优先级" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getPriorityType(row.priority)" size="small">
                {{ row.priority }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="单位名称" prop="unitName" min-width="180" />
          <el-table-column label="被审计对象" prop="auditeeName" width="120" align="center" />
          <el-table-column label="职务" prop="position" width="150" />
          <el-table-column label="推荐原因" prop="reason" min-width="200" />
          <el-table-column label="上次审计年度" width="120" align="center">
            <template #default="{ row }">
              {{ row.lastAuditYear || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="距离周期结束（年）" width="150" align="center">
            <template #default="{ row }">
              {{ row.yearsToDeadline !== undefined ? row.yearsToDeadline : '-' }}
            </template>
          </el-table-column>
        </el-table>

        <!-- 操作按钮 -->
        <div class="dialog-actions">
          <el-button type="primary" @click="handleAddAllToPlan(currentRecommendations)">
            <el-icon><Plus /></el-icon>
            全部列入计划
          </el-button>
          <el-button @click="handleAddSelectedToPlan">
            <el-icon><Select /></el-icon>
            选择部分列入计划
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, nextTick, computed } from 'vue'
  import {
    ChatDotRound,
    User,
    Promotion,
    Loading,
    ChatLineRound,
    Plus,
    Select,
    List
  } from '@element-plus/icons-vue'
  import { chat } from '@/api/audit-management/project-recommendation'
  import type {
    ChatMessage,
    RecommendationItem
  } from '@/types/audit-management/project-recommendation'
  import { ElMessage, ElMessageBox } from 'element-plus'

  defineOptions({
    name: 'AuditProjectRecommendation'
  })

  // 快捷问题
  const quickQuestions = [
    '推荐审计项目',
    '哪些单位需要离任审计',
    '从未审计过的单位',
    '轮审到期的单位'
  ]

  // 消息列表
  const messages = ref<ChatMessage[]>([])

  // 输入内容
  const inputMessage = ref('')

  // 加载状态
  const loading = ref(false)

  // 思考步骤
  const thinkingSteps = ref<string[]>([])

  // 打字机效果的消息
  const typingMessage = ref('')

  // 滚动容器引用
  const scrollbarRef = ref()

  // 输入框引用
  const inputRef = ref()

  // 表格引用
  const tableRef = ref()

  // 选中的推荐项
  const selectedRecommendations = ref<RecommendationItem[]>([])

  // 当前推荐列表
  const currentRecommendations = ref<RecommendationItem[]>([])

  // 弹窗显示状态
  const dialogVisible = ref(false)

  // 统计信息
  const p0Count = computed(
    () => currentRecommendations.value.filter((item) => item.priority === 'P0').length
  )
  const p1Count = computed(
    () => currentRecommendations.value.filter((item) => item.priority === 'P1').length
  )
  const p2Count = computed(
    () => currentRecommendations.value.filter((item) => item.priority === 'P2').length
  )
  const p3Count = computed(
    () => currentRecommendations.value.filter((item) => item.priority === 'P3').length
  )

  /**
   * 获取优先级标签类型
   */
  const getPriorityType = (priority: string) => {
    const typeMap: Record<string, any> = {
      P0: 'danger',
      P1: 'warning',
      P2: 'warning',
      P3: 'info',
      P4: 'info',
      P5: 'success',
      P6: 'success'
    }
    return typeMap[priority] || 'info'
  }

  /**
   * 格式化时间
   */
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }

  /**
   * 滚动到底部
   */
  const scrollToBottom = async () => {
    await nextTick()
    if (scrollbarRef.value) {
      try {
        const scrollElement = scrollbarRef.value.$refs.wrap$
        if (scrollElement) {
          scrollElement.scrollTop = scrollElement.scrollHeight
        }
      } catch (error) {
        console.warn('滚动失败:', error)
      }
    }
  }

  /**
   * 显示思考步骤
   */
  const showThinkingSteps = async (steps: string[]) => {
    thinkingSteps.value = []
    for (const step of steps) {
      thinkingSteps.value.push(step)
      try {
        await scrollToBottom()
      } catch (error) {
        console.warn('滚动失败:', error)
      }
      await new Promise((resolve) => setTimeout(resolve, 400))
    }
  }

  /**
   * 打字机效果
   */
  const typewriterEffect = async (text: string, speed: number = 30) => {
    typingMessage.value = ''
    const lines = text.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      for (let j = 0; j < line.length; j++) {
        typingMessage.value += line[j]
        try {
          await scrollToBottom()
        } catch (error) {
          console.warn('滚动失败:', error)
        }
        await new Promise((resolve) => setTimeout(resolve, speed))
      }
      if (i < lines.length - 1) {
        typingMessage.value += '<br>'
        try {
          await scrollToBottom()
        } catch (error) {
          console.warn('滚动失败:', error)
        }
      }
    }
  }

  /**
   * 表格选择变化
   */
  const handleSelectionChange = (selection: RecommendationItem[]) => {
    selectedRecommendations.value = selection
  }

  /**
   * 全部列入计划
   */
  const handleAddAllToPlan = (recommendations: RecommendationItem[]) => {
    ElMessageBox.confirm(
      `确定将全部 ${recommendations.length} 个推荐项目列入审计计划吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
      .then(() => {
        // TODO: 调用后端接口将推荐项目列入计划
        ElMessage.success(`已将 ${recommendations.length} 个项目列入审计计划`)
      })
      .catch(() => {
        // 取消操作
      })
  }

  /**
   * 选择部分列入计划
   */
  const handleAddSelectedToPlan = () => {
    if (selectedRecommendations.value.length === 0) {
      ElMessage.warning('请先勾选需要列入计划的项目')
      return
    }

    ElMessageBox.confirm(
      `确定将选中的 ${selectedRecommendations.value.length} 个推荐项目列入审计计划吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
      .then(() => {
        // TODO: 调用后端接口将选中的推荐项目列入计划
        ElMessage.success(`已将 ${selectedRecommendations.value.length} 个项目列入审计计划`)
        selectedRecommendations.value = []
      })
      .catch(() => {
        // 取消操作
      })
  }

  /**
   * 查看推荐列表
   */
  const handleViewRecommendations = () => {
    if (currentRecommendations.value.length === 0) {
      ElMessage.warning('暂无推荐记录')
      return
    }
    dialogVisible.value = true
  }

  /**
   * 快捷问题点击
   */
  const handleQuickQuestion = (question: string) => {
    inputMessage.value = question
    handleSend()
  }

  /**
   * 发送消息
   */
  const handleSend = async () => {
    const message = inputMessage.value.trim()
    if (!message || loading.value) {
      return
    }

    // 添加用户消息
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: Date.now()
    }
    messages.value.push(userMessage)
    inputMessage.value = ''
    loading.value = true

    await scrollToBottom()

    try {
      // 调用 API
      const response = await chat({
        message,
        history: messages.value
      })

      if (response.code === 200) {
        const { reply, recommendations, thinkingSteps: steps } = response.data

        // 保存推荐列表
        if (recommendations && recommendations.length > 0) {
          currentRecommendations.value = recommendations
        }

        // 显示思考步骤（临时动画）
        if (steps && steps.length > 0) {
          await showThinkingSteps(steps)
        }

        // 清除临时思考步骤
        thinkingSteps.value = []

        // 合并思考过程和结果到一条消息
        let fullContent = ''
        if (steps && steps.length > 0) {
          fullContent = steps.join('\n') + (reply ? '\n\n' + reply : '')
        } else {
          fullContent = reply
        }

        // 打字机效果显示完整内容
        if (fullContent) {
          await typewriterEffect(fullContent)
        }

        // 添加助手消息
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: typingMessage.value.replace(/<br>/g, '\n'),
          timestamp: Date.now()
        }
        messages.value.push(assistantMessage)

        // 清除打字机消息
        typingMessage.value = ''

        await scrollToBottom()

        // 自动打开推荐列表弹窗
        if (recommendations && recommendations.length > 0) {
          setTimeout(() => {
            dialogVisible.value = true
          }, 500)
        }
      } else {
        ElMessage.error(response.message || '请求失败')
        thinkingSteps.value = []
      }
    } catch (error: any) {
      console.error('发送消息失败:', error)
      ElMessage.error(error.message || '发送消息失败，请稍后重试')
      thinkingSteps.value = []
    } finally {
      loading.value = false
      // 聚焦输入框
      nextTick(() => {
        if (inputRef.value) {
          inputRef.value.focus()
        }
      })
    }
  }
</script>

<style scoped lang="scss">
  .ai-chat-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  }

  .chat-main {
    flex: 1;
    padding: 20px;
    overflow: hidden;
  }

  .chat-scrollbar {
    height: 100%;

    :deep(.el-scrollbar__view) {
      padding-bottom: 20px;
    }
  }

  .chat-messages {
    max-width: 1200px;
    margin: 0 auto;
  }

  // 欢迎消息
  .welcome-message {
    padding: 60px 20px;
    text-align: center;
    animation: fadeIn 0.6s ease-in;

    .welcome-icon {
      margin-bottom: 24px;
      color: var(--el-color-primary);
    }

    h2 {
      margin-bottom: 12px;
      font-size: 28px;
      font-weight: 600;
      color: #303133;
    }

    .welcome-desc {
      margin-bottom: 40px;
      font-size: 16px;
      color: #606266;
    }

    .quick-questions {
      .quick-title {
        margin-bottom: 16px;
        font-size: 14px;
        color: #909399;
      }

      .quick-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        justify-content: center;

        .quick-button {
          display: flex;
          gap: 8px;
          align-items: center;
          padding: 12px 20px;
          font-size: 14px;
          color: #606266;
          cursor: pointer;
          background: white;
          border: 1px solid #dcdfe6;
          border-radius: 20px;
          transition: all 0.3s;

          &:hover {
            color: var(--el-color-primary);
            border-color: var(--el-color-primary);
            box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
            transform: translateY(-2px);
          }

          .el-icon {
            font-size: 16px;
          }
        }
      }
    }
  }

  // 消息项
  .message-item {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
    animation: slideIn 0.3s ease-out;

    &.message-user {
      flex-direction: row-reverse;

      .message-avatar {
        color: white;
        background: var(--el-color-primary);
      }

      .message-bubble {
        color: white;
        background: var(--el-color-primary);
        border-radius: 18px 18px 4px;
      }
    }

    &.message-assistant {
      .message-avatar {
        color: var(--el-color-primary);
        background: #f0f2f5;
      }

      .message-bubble {
        background: white;
        border-radius: 18px 18px 18px 4px;
      }
    }
  }

  .message-avatar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
  }

  .message-bubble {
    position: relative;
    max-width: 85%;
    padding: 12px 16px;
    box-shadow: 0 2px 8px rgb(0 0 0 / 8%);

    .message-text {
      font-size: 15px;
      line-height: 1.6;
      word-wrap: break-word;
      white-space: pre-wrap;
    }

    .message-time {
      margin-top: 8px;
      font-size: 12px;
      color: #909399;
      opacity: 0.7;
    }

    .recommendations-list {
      margin-top: 16px;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      margin-top: 12px;
    }
  }

  // 思考气泡
  .thinking-bubble {
    background: white !important;
    border: 1px dashed var(--el-color-primary);

    .thinking-steps {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .thinking-step {
        display: flex;
        gap: 8px;
        align-items: center;
        font-size: 14px;
        color: #606266;
        opacity: 0.5;
        transition: opacity 0.3s;

        &.active {
          color: var(--el-color-primary);
          opacity: 1;
        }

        .step-icon {
          font-size: 16px;
          animation: rotate 1s linear infinite;
        }
      }
    }
  }

  // 打字机效果
  .typing-text {
    display: inline;
  }

  .typing-cursor {
    display: inline-block;
    width: 2px;
    height: 1em;
    margin-left: 2px;
    background: currentcolor;
    animation: blink 1s step-end infinite;
  }

  // 输入区域
  .chat-input-wrapper {
    flex-shrink: 0;
    padding: 20px;
    background: white;
    border-top: 1px solid #e4e7ed;
  }

  .chat-input-container {
    display: flex;
    gap: 12px;
    align-items: flex-end;
    max-width: 1200px;
    margin: 0 auto;

    .chat-input {
      flex: 1;

      :deep(.el-textarea__inner) {
        padding: 12px 16px;
        font-size: 15px;
        line-height: 1.6;
        resize: none;
        border: 2px solid #e4e7ed;
        border-radius: 12px;
        transition: all 0.3s;

        &:focus {
          border-color: var(--el-color-primary);
          box-shadow: 0 0 0 3px rgb(64 158 255 / 10%);
        }

        &:disabled {
          background: #f5f7fa;
        }
      }
    }

    .send-button {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      font-size: 20px;
      color: #909399;
      cursor: pointer;
      background: #e4e7ed;
      border: none;
      border-radius: 50%;
      transition: all 0.3s;

      &.active {
        color: white;
        background: var(--el-color-primary);

        &:hover {
          background: var(--el-color-primary-light-3);
          transform: scale(1.05);
        }
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }

      .is-loading {
        animation: rotate 1s linear infinite;
      }
    }
  }

  .input-tip {
    margin-top: 8px;
    font-size: 12px;
    color: #909399;
    text-align: center;
  }

  // 动画
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }

    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }

    50% {
      opacity: 0;
    }
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  // 查看推荐按钮
  .view-recommendations-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 10;
  }

  // 推荐列表弹窗
  .recommendations-dialog {
    .dialog-content {
      .statistics-info {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 20px;
      }

      .dialog-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
        margin-top: 20px;
      }
    }
  }
</style>
