# 审计文书智能撰写系统设计方案

**日期**：2026-04-30  
**设计者**：Claude  
**状态**：已批准

## 一、需求概述

设计一个统一的 AI 智能撰写审计文书系统，支持审计通知书、审计方案、审计取证单、审计底稿、审计报告、审计意见书等六种文书类型的智能生成。系统需要充分利用文书间的数据关联关系，并提供法律法规智能检索能力。

### 核心需求

1. **统一 AI 助手框架**：支持所有文书类型的智能生成
2. **文书关联管理**：自动识别和提取前置文书数据
3. **混合生成模式**：结合自动生成、对话生成和智能推荐
4. **法规智能检索**：支持法规条款匹配和全网搜索
5. **模板配置系统**：基础模板（文件）+ 自定义模板（数据库）
6. **双重实现**：Claude Code Skill + 前端业务组件

### 文书关联关系

```
审计通知书
    ↓ (项目基本信息)
审计方案
    ↓ (重点关注事项、风险点、审计程序)
审计取证单
    ↓ (审计事项摘要、取证内容)
审计底稿
    ↓ (审计发现、证据汇总)
审计报告
    ↓ (审计结论、建议)
审计意见书
```

## 二、整体架构设计

### 2.1 系统分层架构

```
┌─────────────────────────────────────────────────────────┐
│                    用户界面层                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │审计通知书│  │审计方案  │  │审计取证单│  │审计报告 │ │
│  │AI助手    │  │AI助手    │  │AI助手    │  │AI助手   │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  通用AI助手框架层                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │对话管理引擎 │  │内容生成引擎 │  │模板渲染引擎 │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         法律法规智能检索引擎                      │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │  │
│  │  │法规解析器  │  │条款匹配器  │  │全网搜索器  │ │  │
│  │  └────────────┘  └────────────┘  └────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  文书关联引擎层                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │关系图谱管理 │  │数据提取器   │  │智能推荐器   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  配置与数据层                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │文书模板配置 │  │关联规则配置 │  │生成策略配置 │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

### 2.2 核心组件职责

**通用 AI 助手框架**：

- 对话管理：多轮对话状态管理、问题生成、答案解析
- 内容生成：调用 AI API、内容结构化、质量检查
- 模板渲染：章节组装、格式转换、富文本生成

**法律法规智能检索引擎**：

- 法规解析：解析法规结构（章节条款）
- 条款匹配：基于问题描述匹配相关条款
- 全网搜索：搜索并筛选适用的法律法规

**文书关联引擎**：

- 关系图谱：定义文书间的依赖关系和数据流向
- 数据提取：从前置文书中提取相关内容
- 智能推荐：根据关联数据推荐生成内容

**配置系统**：

- 文书模板：基础模板（文件）+ 自定义模板（数据库）
- 关联规则：定义哪些字段可以从哪些文书提取
- 生成策略：每种文书的章节结构、必填项、生成逻辑

## 三、文书配置系统设计

### 3.1 文书类型配置结构

```typescript
interface DocumentTypeConfig {
  id: string // 文书类型ID
  name: string // 文书名称
  category: string // 分类
  order: number // 生成顺序

  // 章节配置
  sections: SectionConfig[]

  // 关联配置
  dependencies: DocumentDependency[]

  // 生成策略
  generationStrategy: GenerationStrategy
}

interface SectionConfig {
  id: string // 章节ID
  name: string // 章节名称
  required: boolean // 是否必填
  order: number // 章节顺序

  // 数据来源
  dataSources: DataSource[]

  // 生成配置
  generationMode: 'auto' | 'dialog' | 'hybrid'
  questions?: Question[]
  template?: string
}

interface DocumentDependency {
  sourceDocType: string // 来源文书类型
  required: boolean // 是否必须存在
  dataMapping: DataMapping[] // 数据映射关系
}
```

### 3.2 六种文书的配置

**1. 审计通知书**

- 章节：通知对象、审计目的、审计范围、审计时间、审计组成员
- 依赖：无（首个文书）
- 生成模式：对话式为主

**2. 审计方案**

- 章节：审计目标、重点关注事项、风险关注、审计程序与方法、时间安排
- 依赖：审计通知书（项目信息、审计组）
- 生成模式：混合（自动提取 + 对话补充）

**3. 审计取证单**

- 章节：审计事项摘要、风险点描述、审计程序、预期结果、取证要求
- 依赖：审计方案（重点关注事项、审计程序）
- 生成模式：混合

**4. 审计底稿**

- 章节：审计过程、审计发现、证据清单、初步结论、定性依据
- 依赖：审计取证单（审计事项、取证内容）
- 生成模式：混合（自动汇总 + 补充说明）

**5. 审计报告**

- 章节：审计概况、审计发现、审计结论、审计建议
- 依赖：审计底稿（审计发现、证据）
- 生成模式：混合（自动汇总 + 优化润色）

**6. 审计意见书**

- 章节：审计意见、整改要求、整改期限、后续跟踪
- 依赖：审计报告（审计结论、建议）
- 生成模式：混合（提取结论 + 补充要求）

### 3.3 配置文件存储

```
/src/config/document-templates/
  ├── audit-notice.json          # 审计通知书配置
  ├── audit-plan.json            # 审计方案配置
  ├── evidence.json              # 审计取证单配置
  ├── audit-draft.json           # 审计底稿配置
  ├── audit-report.json          # 审计报告配置
  ├── audit-opinion.json         # 审计意见书配置
  └── relationships.json         # 文书关联关系配置
```

## 四、文书关联引擎设计

### 4.1 数据提取器

```typescript
class DocumentDataExtractor {
  // 提取指定文书的数据
  async extractData(
    sourceDocType: string,
    projectId: string,
    extractRules: DataMapping[]
  ): Promise<ExtractedData>

  // 智能提取（基于语义理解）
  async smartExtract(
    sourceContent: string,
    targetSection: string,
    context: ProjectContext
  ): Promise<string>
}

interface DataMapping {
  sourceField: string // 来源字段路径
  targetField: string // 目标字段路径
  transform?: TransformRule // 转换规则
  required: boolean // 是否必需
}
```

### 4.2 关联关系示例

**审计方案 → 审计取证单**：

```json
{
  "sourceDocType": "audit-plan",
  "targetDocType": "evidence",
  "mappings": [
    {
      "sourceField": "sections.重点关注事项.content",
      "targetField": "sections.审计事项摘要.suggestedContent",
      "transform": "summarize",
      "required": true
    },
    {
      "sourceField": "sections.风险关注.content",
      "targetField": "sections.风险点描述.suggestedContent",
      "transform": "extract_risks",
      "required": true
    }
  ]
}
```

### 4.3 智能推荐器

```typescript
class SmartRecommender {
  // 推荐关联文书
  async recommendSources(targetDocType: string, projectId: string): Promise<RecommendedSource[]>

  // 评估数据质量
  async evaluateDataQuality(sourceDoc: Document, extractRules: DataMapping[]): Promise<QualityScore>
}

interface RecommendedSource {
  docType: string // 文书类型
  docId: string // 文书ID
  docName: string // 文书名称
  confidence: number // 推荐置信度 0-1
  availableFields: string[] // 可用字段列表
  preview: string // 内容预览
}
```

### 4.4 关联数据流转流程

```
用户创建新文书
    ↓
智能推荐器识别前置文书
    ↓
展示推荐列表（带预览）
    ↓
用户确认或调整选择
    ↓
数据提取器提取关联数据
    ↓
AI生成器基于提取数据生成初稿
    ↓
用户通过对话补充完善
    ↓
最终生成完整文书
```

## 五、AI 生成引擎设计

### 5.1 生成模式

**模式 1：自动生成（Auto）**

- 适用场景：有充足的前置数据，无需用户输入
- 流程：提取关联数据 → AI 整合生成 → 直接输出

**模式 2：对话生成（Dialog）**

- 适用场景：需要用户提供特定信息
- 流程：AI 提问 → 用户回答 → 收集完整后生成

**模式 3：混合生成（Hybrid）**

- 适用场景：有部分前置数据，需要用户补充
- 流程：提取关联数据生成初稿 → 展示给用户 → 对话补充完善

### 5.2 生成引擎架构

```typescript
class AIGenerationEngine {
  // 生成章节内容
  async generateSection(
    docType: string,
    sectionId: string,
    context: GenerationContext
  ): Promise<GeneratedContent>

  // 批量生成多个章节
  async generateBatch(
    docType: string,
    sectionIds: string[],
    context: GenerationContext
  ): Promise<GeneratedContent[]>

  // 优化已有内容
  async optimizeContent(
    content: string,
    optimizeType: 'polish' | 'expand' | 'summarize'
  ): Promise<string>
}

interface GenerationContext {
  projectInfo: ProjectInfo
  extractedData: ExtractedData
  userInputs: Record<string, any>
  template: SectionTemplate
  generationMode: GenerationMode
}

interface GeneratedContent {
  sectionId: string
  content: string // 富文本HTML
  confidence: number // 生成置信度
  dataSources: string[] // 数据来源
  suggestions: string[] // 优化建议
}
```

### 5.3 AI Prompt 设计策略

**分层 Prompt 结构**：

```
系统角色定义
    ↓
文书类型说明
    ↓
章节要求说明
    ↓
关联数据上下文
    ↓
用户补充信息
    ↓
输出格式要求
```

### 5.4 内容质量控制

```typescript
class ContentQualityChecker {
  // 检查内容完整性
  checkCompleteness(content: string, requirements: string[]): QualityReport

  // 检查内容规范性
  checkCompliance(content: string, docType: string): QualityReport

  // 检查内容一致性
  checkConsistency(content: string, relatedDocs: Document[]): QualityReport
}
```

## 六、法律法规智能检索设计

### 6.1 核心能力

**能力 1：法规条款智能匹配**

- 输入：用户提供的法律法规文本 + 问题描述
- 处理：AI 分析法规内容，匹配最相关的条款
- 输出：定性依据法条（法规名称 + 具体条款内容）

**能力 2：全网法规智能搜索**

- 输入：问题描述（无法规提供）
- 处理：全网搜索相关法律法规 → AI 分析匹配度 → 提取适用条款
- 输出：法律法规名称 + 对应法条内容 + 适用性说明

### 6.2 法规检索引擎

```typescript
class LegalRegulationEngine {
  // 场景1：从提供的法规中匹配条款
  async matchArticles(
    regulation: RegulationDocument,
    issueDescription: string
  ): Promise<MatchedArticle[]>

  // 场景2：全网搜索相关法规
  async searchRegulations(
    issueDescription: string,
    context: AuditContext
  ): Promise<SearchedRegulation[]>

  // 解析法规文档结构
  async parseRegulation(content: string): Promise<RegulationStructure>

  // 评估条款适用性
  async evaluateApplicability(
    article: Article,
    issueDescription: string
  ): Promise<ApplicabilityScore>
}

interface MatchedArticle {
  regulationName: string // 法规名称
  articleNumber: string // 条款编号
  articleContent: string // 条款内容
  relevanceScore: number // 相关度评分 0-1
  reasoning: string // 匹配理由
  context?: string // 上下文
}

interface SearchedRegulation {
  name: string // 法规名称
  authority: string // 发布机关
  issueDate: string // 发布日期
  effectiveDate: string // 生效日期
  status: 'effective' | 'amended' | 'abolished'
  matchedArticles: MatchedArticle[]
  source: string // 来源URL
  confidence: number // 置信度 0-1
}
```

### 6.3 工作流程

**流程 1：有法规提供的情况**

```
用户输入问题描述 + 上传/粘贴法规文本
    ↓
法规解析器：解析法规结构
    ↓
条款匹配器：AI 分析问题与各条款的相关性
    ↓
排序：按相关度排序匹配结果
    ↓
展示：Top 3-5 条最相关条款
    ↓
用户确认或调整选择
    ↓
插入到文书的"定性依据"章节
```

**流程 2：无法规提供的情况**

```
用户输入问题描述
    ↓
全网搜索器：搜索相关法律法规
    ↓
法规筛选：AI 评估法规适用性
    ↓
条款匹配：从筛选后的法规中匹配具体条款
    ↓
展示：推荐的法规和条款（带置信度）
    ↓
用户确认或调整
    ↓
插入到文书
```

### 6.4 技术实现要点

**法规解析**：

- 使用 NLP 技术识别法规结构
- 提取条款编号、标题、内容
- 建立条款间的层级关系

**条款匹配**：

- 语义相似度计算（向量嵌入）
- 关键词匹配
- 上下文理解

**全网搜索**：

- 集成法律法规数据库 API
- 使用 WebSearch 工具搜索政府网站
- 结果去重和效力验证

## 七、前端组件设计

### 7.1 通用 AI 助手组件结构

```
AIDocumentAssistant (通用组件)
├── AssistantDrawer (抽屉容器)
│   ├── ContextPanel (上下文面板)
│   │   ├── ProjectInfo (项目信息)
│   │   ├── RelatedDocuments (关联文书)
│   │   └── DataPreview (数据预览)
│   ├── SectionList (章节列表)
│   │   └── SectionCard (章节卡片)
│   ├── DialogPanel (对话面板)
│   ├── ContentPreview (内容预览)
│   ├── LegalSearchPanel (法规检索面板)
│   └── ActionBar (操作栏)
```

### 7.2 组件接口设计

```typescript
interface AIDocumentAssistantProps {
  docType: string // 文书类型
  projectId: string // 项目ID
  editorInstance: any // 编辑器实例
  visible: boolean
  onClose: () => void
}

type SectionStatus =
  | 'pending' // 待生成
  | 'ready' // 可直接生成
  | 'need-input' // 需要用户输入
  | 'generating' // 生成中
  | 'completed' // 已完成
  | 'error' // 生成失败
```

### 7.3 交互流程

**打开 AI 助手**：

```
点击"AI助手"按钮 → 加载配置 → 识别关联文书 →
提取数据 → 分析章节状态 → 展示界面
```

**生成单个章节**：

```
点击"生成"按钮 → 判断模式 →
[Auto] 直接生成 / [Dialog] 对话收集 / [Hybrid] 初稿+补充 →
展示结果 → 确认插入
```

**批量生成**：

```
点击"一键生成全部" → 选择模式 →
按顺序生成 → 展示进度 → 统一预览 → 批量插入
```

### 7.4 法规检索面板

```
┌─────────────────────────────────────┐
│ 📖 定性依据检索                     │
├─────────────────────────────────────┤
│ 问题描述：                          │
│ [文本框]                            │
├─────────────────────────────────────┤
│ 法律法规：                          │
│ ○ 我已有法规文本                    │
│ ● 全网搜索法规                      │
├─────────────────────────────────────┤
│ 匹配结果：                          │
│ ✓ 《XX法》第X条 (相关度: 95%)      │
│   [条款内容...]                     │
│   [选择此条]                        │
└─────────────────────────────────────┘
```

## 八、Claude Code Skill 设计

### 8.1 Skill 基本信息

```markdown
# Skill: wszx (文书撰写)

## 触发场景

- 用户说"生成审计文书方案"、"文书撰写"、"wszx"
- 需要设计审计文书AI助手功能

## 核心能力

1. 生成审计文书AI助手的设计方案
2. 输出技术实现文档
3. 生成文书配置模板
4. 提供最佳实践建议
5. 法规条款智能匹配
6. 全网法规智能搜索
```

### 8.2 Skill 目录结构

```
.claude/skills/wszx/
├── SKILL.md
├── assets/
│   ├── document-flow.png
│   └── architecture.png
├── references/
│   ├── document-types.md
│   ├── generation-modes.md
│   ├── legal-search.md
│   └── best-practices.md
└── templates/
    ├── document-config.json
    ├── section-config.json
    └── relationship-config.json
```

### 8.3 Skill 与前端组件的关系

```
Skill (设计阶段)
    ↓ 输出设计文档和配置
前端组件 (实现阶段)
    ↓ 读取配置，实现功能
实际业务 (使用阶段)
```

## 九、实施计划

### 9.1 阶段划分

**阶段 1：基础框架搭建（2-3 周）**

- 搭建通用 AI 助手框架
- 实现配置系统
- 开发文书关联引擎
- 完成基础 UI 组件

**阶段 2：文书类型实现（3-4 周）**

- 配置 6 种文书类型
- 实现各文书的生成逻辑
- 完善文书间的关联关系
- 测试数据流转

**阶段 3：法规检索功能（2-3 周）**

- 开发法规解析器
- 实现条款匹配算法
- 集成全网搜索能力
- 优化匹配准确度

**阶段 4：优化与测试（1-2 周）**

- 性能优化
- 用户体验优化
- 全面测试
- 文档完善

### 9.2 技术栈

**前端**：

- Vue 3 + TypeScript
- Element Plus
- WangEditor
- Pinia

**AI 集成**：

- Claude API
- WebSearch
- 向量嵌入

**数据存储**：

- 文件系统（基础模板）
- 数据库（自定义模板）
- LocalStorage（草稿）

## 十、验收标准

### 10.1 功能验收

- [ ] 6 种文书类型的 AI 助手全部可用
- [ ] 文书间关联数据自动提取准确率 > 90%
- [ ] 智能推荐关联文书准确率 > 95%
- [ ] 自动生成模式内容可用率 > 85%
- [ ] 对话生成流程完整无阻塞
- [ ] 混合生成模式体验流畅
- [ ] 法规条款匹配准确率 > 80%
- [ ] 全网法规搜索能找到相关结果 > 90%
- [ ] 内容插入编辑器格式正确
- [ ] 草稿保存和恢复功能正常

### 10.2 性能验收

- [ ] 单章节生成时间 < 5 秒
- [ ] 批量生成 6 个章节 < 30 秒
- [ ] 法规匹配响应时间 < 3 秒
- [ ] 全网搜索响应时间 < 10 秒
- [ ] 界面操作流畅无卡顿

### 10.3 用户体验验收

- [ ] 操作流程直观易懂
- [ ] 错误提示清晰友好
- [ ] 支持撤销和重新生成
- [ ] 支持内容编辑和优化
- [ ] 移动端适配良好

## 十一、风险与应对

### 风险 1：AI 生成质量不稳定

**应对**：提供多次生成、人工编辑、模板优化机制

### 风险 2：法规数据源不完整

**应对**：集成多个数据源、支持手动补充、建立法规库

### 风险 3：文书关联逻辑复杂

**应对**：充分测试、提供手动调整、逐步完善规则

### 风险 4：性能问题

**应对**：异步处理、进度提示、缓存优化

## 十二、后续扩展方向

### 短期扩展

- 支持更多文书类型
- 优化 AI 生成质量
- 增加模板管理功能
- 支持批量导出

### 中期扩展

- 建立法规知识库
- 支持多语言生成
- 增加协同编辑
- 智能质量检查

### 长期扩展

- 文书智能审核
- 历史数据分析
- 个性化推荐
- 知识图谱构建

---

**批准人**：用户  
**批准日期**：2026-04-30
