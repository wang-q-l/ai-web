# 审计项目推荐AI助手 - 弹窗版本实现指南

## 当前状态

已完成：

- ✅ Mock数据修改：思考步骤最后一句改为"已为您打开推荐列表"
- ✅ Mock数据修改：移除回复中的"详细推荐列表如下："
- ✅ 创建设计文档
- ✅ 创建新分支 feature/recommendation-dialog

## 需要修改的文件

### 1. src/views/audit-management/project-recommendation/index.vue

#### 修改点1：添加导入

```typescript
// 在 import 部分添加
import { ref, nextTick, computed } from 'vue' // 添加 computed
import { List } from '@element-plus/icons-vue' // 添加 List 图标
```

#### 修改点2：添加状态变量（在 script setup 中）

```typescript
// 当前推荐列表
const currentRecommendations = ref<RecommendationItem[]>([])

// 弹窗显示状态
const dialogVisible = ref(false)

// 统计信息（使用 computed）
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
```

#### 修改点3：添加查看推荐列表函数

```typescript
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
```

#### 修改点4：修改 handleSend 函数

在 API 返回成功后，添加：

```typescript
if (response.code === 200) {
  const { reply, recommendations, thinkingSteps: steps } = response.data

  // 保存推荐列表
  if (recommendations && recommendations.length > 0) {
    currentRecommendations.value = recommendations
  }

  // 显示思考步骤
  if (steps && steps.length > 0) {
    await showThinkingSteps(steps)
  }

  // 清除临时思考步骤
  thinkingSteps.value = []

  // 打字机效果显示回复（如果有回复内容）
  if (reply) {
    let fullContent = ''
    if (steps && steps.length > 0) {
      fullContent = steps.join('\n') + '\n\n' + reply
    } else {
      fullContent = reply
    }
    await typewriterEffect(fullContent)
  } else {
    // 如果没有回复内容，只显示思考过程
    if (steps && steps.length > 0) {
      await typewriterEffect(steps.join('\n'))
    }
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
    }, 500) // 延迟500ms打开，让用户看到思考过程
  }
}
```

#### 修改点5：模板修改 - 移除消息中的表格

找到消息列表部分，删除这段代码：

```vue
<!-- 推荐列表 -->
<div v-if="message.recommendations && message.recommendations.length > 0" class="recommendations-list">
  <el-table ...>
    ...
  </el-table>
  <div class="action-buttons">
    ...
  </div>
</div>
```

#### 修改点6：模板修改 - 添加查看推荐按钮

在 `<div class="ai-chat-container">` 开始后添加：

```vue
<!-- 查看推荐列表按钮 -->
<div class="view-recommendations-btn">
  <el-button type="primary" @click="handleViewRecommendations">
    <el-icon><List /></el-icon>
    查看推荐列表
  </el-button>
</div>
```

#### 修改点7：模板修改 - 添加推荐列表弹窗

在 `</template>` 结束前添加：

```vue
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
```

#### 修改点8：样式修改

在 `<style scoped lang="scss">` 中添加：

```scss
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
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }

    .dialog-actions {
      display: flex;
      gap: 12px;
      margin-top: 20px;
      justify-content: center;
    }
  }
}

// 调整对话框宽度，为右上角按钮留出空间
.message-bubble {
  max-width: 70%; // 改回70%，因为不再显示表格
}
```

## 测试步骤

1. 刷新页面
2. 输入"推荐审计项目"
3. 观察AI思考过程
4. 确认推荐列表弹窗自动打开
5. 测试表格复选框功能
6. 测试"全部列入计划"和"选择部分列入计划"按钮
7. 关闭弹窗
8. 点击右上角"查看推荐列表"按钮
9. 确认弹窗再次打开

## 预期效果

- 对话框中只显示思考过程，不显示表格
- 思考完成后自动弹出推荐列表弹窗
- 弹窗显示统计信息和完整表格
- 可以通过右上角按钮随时查看推荐列表
- 如果没有推荐记录，点击按钮会提示"暂无推荐记录"
