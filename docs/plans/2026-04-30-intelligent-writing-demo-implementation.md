# 智能撰写交互演示页面实现设计

**日期**：2026-04-30 **设计者**：Claude **状态**：已批准

## 一、需求概述

创建一个"智能撰写"一级菜单，实现一个终端可操作的交互演示页面，展示审计文书智能撰写系统的核心功能和交互流程。页面需要：

1. **完整的交互演示**：用户可以选择项目、选择文书类型、查看关联文书、生成章节内容
2. **Mock 数据驱动**：使用 3 套完整的项目数据，包含所有 6 种文书类型的完整内容
3. **真实的 AI 助手体验**：右侧抽屉展示 AI 助手界面，包含上下文面板、章节列表、对话面板等
4. **可操作性**：所有按钮和交互都是可点击的，能够完整演示整个流程

## 二、页面布局结构

### 2.1 整体布局

```
┌─────────────────────────────────────────────────────────────────┐
│ 面包屑卡片                                                       │
│ [返回] | 智能撰写演示                                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 项目选择卡片                                                     │
│ 当前项目：[项目下拉选择器]                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 文书类型选择卡片                                                 │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐         │
│ │审计  │ │审计  │ │审计  │ │审计  │ │审计  │ │审计  │         │
│ │通知书│ │方案  │ │取证单│ │底稿  │ │报告  │ │意见书│         │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 编辑器卡片                                                       │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 工具栏：[Mock数据] [AI助手]                                 │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │                                                             │ │
│ │ 富文本编辑器内容区域                                         │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ AI 助手抽屉（右侧，宽度 600px）                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 上下文面板                                                   │ │
│ │ - 项目信息                                                   │ │
│ │ - 关联文书                                                   │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ 章节列表                                                     │ │
│ │ [章节1] [生成] [插入]                                        │ │
│ │ [章节2] [生成] [插入]                                        │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ 对话面板（可选显示）                                         │ │
│ │ AI: 问题                                                     │ │
│ │ 用户: [输入框]                                               │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 布局特点

- **面包屑卡片**：固定在顶部，提供返回功能和页面标题
- **项目选择卡片**：下拉选择器切换不同的 Mock 项目数据
- **文书类型卡片**：6 个卡片横向排列，点击切换当前编辑的文书类型
- **编辑器卡片**：占据主要空间，使用 WangEditor 展示文书内容
- **AI 助手抽屉**：右侧滑出，宽度 600px，展示 AI 助手的完整界面

## 三、核心功能

### 3.1 项目切换

**功能描述**：

- 下拉选择器展示 3 个 Mock 项目
- 切换项目后，自动加载该项目的所有文书数据
- 编辑器内容更新为当前选中文书类型的内容

**交互流程**：

```
用户选择项目 → 加载项目数据 → 更新文书类型卡片状态 → 更新编辑器内容
```

### 3.2 文书类型切换

**功能描述**：

- 6 个文书类型卡片，显示文书名称和状态
- 点击卡片切换当前编辑的文书类型
- 编辑器内容更新为选中文书的内容
- 卡片状态：已完成（绿色）、进行中（蓝色）、未开始（灰色）

**交互流程**：

```
用户点击文书卡片 → 切换当前文书类型 → 更新编辑器内容 → 更新 AI 助手上下文
```

### 3.3 AI 助手

**功能描述**：

- 点击"AI 助手"按钮打开右侧抽屉
- 抽屉展示当前文书的上下文信息、章节列表、对话面板
- 用户可以生成单个章节或批量生成
- 生成的内容可以插入到编辑器

**交互流程**：

```
打开 AI 助手 → 查看上下文和章节 → 点击生成 → 查看生成内容 → 插入到编辑器
```

### 3.4 章节生成

**功能描述**：

- 章节列表展示当前文书的所有章节
- 每个章节显示状态：待生成、生成中、已完成
- 点击"生成"按钮模拟 AI 生成过程（加载动画 2 秒）
- 生成完成后显示"插入"按钮
- 点击"插入"将内容插入到编辑器

**交互流程**：

```
点击生成 → 显示加载状态 → 模拟生成（2秒） → 显示生成内容 → 点击插入 → 内容插入编辑器
```

### 3.5 关联文书展示

**功能描述**：

- 上下文面板展示当前文书的前置依赖文书
- 显示关联文书的名称、状态、可提取的数据
- 点击关联文书可以预览其内容

**交互流程**：

```
打开 AI 助手 → 查看关联文书列表 → 点击预览 → 查看关联文书内容
```

## 四、数据结构

### 4.1 Mock 项目数据结构

```typescript
interface MockProject {
  id: string
  name: string
  description: string
  documents: {
    auditNotice: DocumentData // 审计通知书
    auditPlan: DocumentData // 审计方案
    evidence: DocumentData // 审计取证单
    auditDraft: DocumentData // 审计底稿
    auditReport: DocumentData // 审计报告
    auditOpinion: DocumentData // 审计意见书
  }
}

interface DocumentData {
  id: string
  name: string
  type: string
  status: 'completed' | 'in-progress' | 'not-started'
  content: string // 富文本 HTML
  sections: SectionData[]
  dependencies: string[] // 依赖的文书类型
  createTime: string
  updateTime: string
}

interface SectionData {
  id: string
  name: string
  content: string // 富文本 HTML
  status: 'pending' | 'generating' | 'completed'
  generationMode: 'auto' | 'dialog' | 'hybrid'
}
```

### 4.2 Mock 数据内容

**项目 1：某市财政局 2023 年度预算执行审计**

- 审计通知书：已完成
- 审计方案：已完成
- 审计取证单：已完成
- 审计底稿：进行中
- 审计报告：未开始
- 审计意见书：未开始

**项目 2：某国企固定资产管理审计**

- 审计通知书：已完成
- 审计方案：已完成
- 审计取证单：进行中
- 审计底稿：未开始
- 审计报告：未开始
- 审计意见书：未开始

**项目 3：某高校科研经费使用审计**

- 审计通知书：已完成
- 审计方案：进行中
- 审计取证单：未开始
- 审计底稿：未开始
- 审计报告：未开始
- 审计意见书：未开始

## 五、UI 组件规范

### 5.1 面包屑卡片

```vue
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
```

**样式**：

- 高度：60px
- 无边框、无阴影
- 圆角：12px
- 内边距：0 20px

### 5.2 项目选择卡片

```vue
<el-card class="project-card">
  <div class="project-selector">
    <span class="label">当前项目：</span>
    <el-select v-model="currentProjectId" @change="handleProjectChange">
      <el-option
        v-for="project in mockProjects"
        :key="project.id"
        :label="project.name"
        :value="project.id"
      />
    </el-select>
  </div>
</el-card>
```

**样式**：

- 无边框、无阴影
- 圆角：12px
- 内边距：20px

### 5.3 文书类型卡片

```vue
<el-card class="document-types-card">
  <div class="document-types-grid">
    <DocumentTypeCard
      v-for="docType in documentTypes"
      :key="docType.id"
      :type="docType"
      :active="currentDocType === docType.id"
      @click="handleDocTypeChange(docType.id)"
    />
  </div>
</el-card>
```

**DocumentTypeCard 组件**：

- 宽度：150px
- 高度：120px
- 显示文书名称、图标、状态
- 状态颜色：已完成（绿色）、进行中（蓝色）、未开始（灰色）
- 选中状态：边框高亮

### 5.4 编辑器卡片

```vue
<el-card class="editor-card">
  <EditorToolbar
    @open-ai-assistant="handleOpenAIAssistant"
    @load-mock-data="handleLoadMockData"
  />
  <div class="editor-container">
    <div ref="editorRef" class="editor-content"></div>
  </div>
</el-card>
```

**EditorToolbar 组件**：

- 高度：50px
- 包含两个按钮：Mock 数据、AI 助手
- 按钮样式：默认尺寸，带图标

**编辑器容器**：

- 使用 WangEditor
- 高度：flex: 1（自动占满剩余空间）
- 工具栏：简化版（加粗、斜体、标题、列表）

### 5.5 AI 助手抽屉

```vue
<el-drawer v-model="aiAssistantVisible" title="AI 助手" direction="rtl" size="600px">
  <AIAssistantDrawer
    :project="currentProject"
    :document="currentDocument"
    @insert-content="handleInsertContent"
  />
</el-drawer>
```

**AIAssistantDrawer 组件结构**：

```vue
<div class="ai-assistant-container">
  <ContextPanel :project="project" :document="document" />
  <SectionList
    :sections="document.sections"
    @generate="handleGenerate"
    @insert="handleInsert"
  />
  <DialogPanel v-if="showDialog" :messages="dialogMessages" />
</div>
```

**ContextPanel 组件**：

- 显示项目信息（名称、描述）
- 显示关联文书列表（名称、状态、可提取数据）
- 可折叠

**SectionList 组件**：

- 显示所有章节
- 每个章节显示：名称、状态、生成按钮、插入按钮
- 章节状态：待生成、生成中、已完成

**DialogPanel 组件**：

- 显示 AI 和用户的对话
- 输入框用于用户回答
- 自动滚动到最新消息

## 六、技术实现细节

### 6.1 状态管理

使用 Vue 3 Composition API 的 ref 和 reactive：

```typescript
const currentProjectId = ref('project1')
const currentDocType = ref('auditNotice')
const currentProject = computed(() => mockProjects[currentProjectId.value])
const currentDocument = computed(() => currentProject.value.documents[currentDocType.value])
const aiAssistantVisible = ref(false)
const editorInstance = ref<any>(null)
```

### 6.2 编辑器初始化

```typescript
import { createEditor, createToolbar } from '@wangeditor/editor'

const initEditor = () => {
  const editor = createEditor({
    selector: editorRef.value,
    html: currentDocument.value.content,
    config: {
      placeholder: '请选择文书类型...',
      MENU_CONF: {
        // 简化工具栏配置
      }
    }
  })

  const toolbar = createToolbar({
    editor,
    selector: toolbarRef.value,
    config: {
      toolbarKeys: ['bold', 'italic', 'header1', 'header2', 'bulletedList', 'numberedList']
    }
  })

  editorInstance.value = editor
}
```

### 6.3 章节生成模拟

```typescript
const handleGenerate = async (sectionId: string) => {
  const section = currentDocument.value.sections.find((s) => s.id === sectionId)
  if (!section) return

  // 设置生成中状态
  section.status = 'generating'

  // 模拟 AI 生成（2 秒延迟）
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // 设置已完成状态
  section.status = 'completed'

  // 显示成功提示
  ElMessage.success('章节生成完成')
}
```

### 6.4 内容插入

```typescript
const handleInsert = (sectionId: string) => {
  const section = currentDocument.value.sections.find((s) => s.id === sectionId)
  if (!section || !editorInstance.value) return

  // 获取当前编辑器内容
  const currentHtml = editorInstance.value.getHtml()

  // 插入章节内容
  const newHtml = currentHtml + section.content

  // 更新编辑器
  editorInstance.value.setHtml(newHtml)

  // 更新文书内容
  currentDocument.value.content = newHtml

  // 显示成功提示
  ElMessage.success('内容已插入')
}
```

### 6.5 项目切换

```typescript
const handleProjectChange = (projectId: string) => {
  currentProjectId.value = projectId

  // 重置文书类型为第一个
  currentDocType.value = 'auditNotice'

  // 更新编辑器内容
  if (editorInstance.value) {
    editorInstance.value.setHtml(currentDocument.value.content)
  }

  // 显示提示
  ElMessage.success(`已切换到项目：${currentProject.value.name}`)
}
```

### 6.6 文书类型切换

```typescript
const handleDocTypeChange = (docType: string) => {
  currentDocType.value = docType

  // 更新编辑器内容
  if (editorInstance.value) {
    editorInstance.value.setHtml(currentDocument.value.content)
  }

  // 显示提示
  ElMessage.success(`已切换到：${currentDocument.value.name}`)
}
```

## 七、集成要点

### 7.1 路由配置

```typescript
// src/router/modules/intelligent-writing.ts
export const intelligentWritingRoutes: AppRouteRecord = {
  path: '/intelligent-writing',
  name: 'IntelligentWriting',
  component: () => import('@/views/index/index.vue'),
  meta: {
    title: 'menus.intelligentWriting.title',
    icon: '&#xe88a;',
    isFirstLevel: true
  },
  children: [
    {
      path: '',
      name: 'IntelligentWritingDemo',
      component: () => import('@/views/intelligent-writing/index.vue'),
      meta: {
        title: 'menus.intelligentWriting.title',
        keepAlive: true,
        isHide: true
      }
    }
  ]
}
```

### 7.2 国际化配置

```json
// src/locales/lang/zh.json
{
  "menus": {
    "intelligentWriting": {
      "title": "智能撰写"
    }
  }
}

// src/locales/lang/en.json
{
  "menus": {
    "intelligentWriting": {
      "title": "Intelligent Writing"
    }
  }
}
```

### 7.3 Mock 数据配置

```typescript
// src/config/intelligent-writing-mock.ts
export const mockProjects = {
  project1: {
    id: 'project1',
    name: '某市财政局 2023 年度预算执行审计',
    description: '对某市财政局 2023 年度预算执行情况进行全面审计',
    documents: {
      auditNotice: {
        /* 完整数据 */
      },
      auditPlan: {
        /* 完整数据 */
      },
      evidence: {
        /* 完整数据 */
      },
      auditDraft: {
        /* 完整数据 */
      },
      auditReport: {
        /* 完整数据 */
      },
      auditOpinion: {
        /* 完整数据 */
      }
    }
  },
  project2: {
    /* 项目 2 数据 */
  },
  project3: {
    /* 项目 3 数据 */
  }
}
```

### 7.4 组件文件结构

```
src/views/intelligent-writing/
├── index.vue                          # 主页面
├── components/
│   ├── DocumentTypeCard.vue           # 文书类型卡片
│   ├── EditorToolbar.vue              # 编辑器工具栏
│   ├── AIAssistantDrawer.vue          # AI 助手抽屉
│   ├── ContextPanel.vue               # 上下文面板
│   ├── SectionList.vue                # 章节列表
│   ├── SectionCard.vue                # 章节卡片
│   └── DialogPanel.vue                # 对话面板
```

## 八、验收标准

### 8.1 功能验收

- [ ] 可以切换 3 个不同的 Mock 项目
- [ ] 可以切换 6 种不同的文书类型
- [ ] 编辑器正确显示当前文书内容
- [ ] AI 助手抽屉可以正常打开和关闭
- [ ] 上下文面板正确显示项目信息和关联文书
- [ ] 章节列表正确显示所有章节和状态
- [ ] 点击生成按钮可以模拟生成过程（2 秒加载）
- [ ] 生成完成后可以插入内容到编辑器
- [ ] 文书类型卡片正确显示状态（已完成、进行中、未开始）
- [ ] 所有交互都有适当的提示信息

### 8.2 UI 验收

- [ ] 页面布局符合设计规范
- [ ] 卡片样式统一（无边框、无阴影、圆角 12px）
- [ ] 按钮样式符合规范（操作按钮默认尺寸）
- [ ] 编辑器高度自适应，不出现双滚动条
- [ ] AI 助手抽屉宽度 600px，滑动流畅
- [ ] 文书类型卡片选中状态明显
- [ ] 章节生成加载动画流畅

### 8.3 体验验收

- [ ] 项目切换响应迅速
- [ ] 文书类型切换响应迅速
- [ ] 章节生成过程有明确的状态反馈
- [ ] 内容插入后编辑器自动滚动到底部
- [ ] 所有操作都有成功/失败提示
- [ ] 页面无明显卡顿

## 九、后续扩展

### 短期扩展

- 添加更多 Mock 项目数据
- 支持批量生成所有章节
- 添加内容预览功能
- 支持撤销和重做

### 中期扩展

- 集成真实的 AI API
- 支持保存草稿
- 添加历史记录
- 支持导出文档

### 长期扩展

- 支持多人协作
- 添加版本控制
- 集成法规检索
- 智能质量检查

---

**批准人**：用户 **批准日期**：2026-04-30
