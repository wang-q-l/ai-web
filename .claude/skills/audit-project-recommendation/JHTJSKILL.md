# 经济责任审计项目推荐技能

## 技能信息

**技能名称**: audit-project-recommendation

**技能描述**: 经济责任审计项目智能推荐技能。根据历史审计项目数据、领导干部数据和组织机构数据，智能推荐需要立项的经济责任审计项目。遵循三年或五年轮审规则和离任审计规则，按优先级排序推荐结果。

## 触发场景

当用户说以下内容时，此技能会自动触发：

1. "推荐审计项目"
2. "审计立项推荐"
3. "经济责任审计推荐"
4. "哪些单位需要审计"
5. "生成审计项目推荐"
6. 需要分析审计覆盖情况
7. 需要制定审计计划

## 核心规则

### 1. 离任审计规则

领导干部离职必须进行离任审计（最高优先级 P0）

**筛选条件**：

- 领导干部状态 = 离职
- 离任审计完成状态 = 未完成
- 单位状态 = 正常

### 2. 轮审规则

五年内必须完成一轮全部单位的经济责任审计

**计算方式**：

- 上次审计时间 = MAX(该单位最近一次完成经济责任审计项目的年度)
- 距离轮审周期结束时间 = 轮审周期年数（5） - (当前年度 - 上次审计年度)
- 如果上次审计时间为空，则该单位从未审计过

**优先级规则**：

- 从未审计过：优先级（P1）
- 距离轮审周期结束 = 0：优先级（P2）
- 距离轮审周期结束 =1：优先级（P3）
- 距离轮审周期结束 =2：优先级（P4）
- 距离轮审周期结束 =3：优先级（P5）
- 距离轮审周期结束 =4：优先级（P6）

### 3. 优先级排序

推荐列表按以下顺序排列：

1. **离任审计**（P0）- 最高优先级
2. **距离轮审周期结束最短**（P1）- 高优先级
3. **从未审计过的单位**（P1）- 高优先级
4. **其他需要轮审的单位**（P2/P3）- 中低优先级

## 工作流程

### 步骤 1：数据收集

收集以下三类数据：

#### 1. 历史审计项目数据

- 项目名称
- 审计单位
- 被审计对象
- 审计时间（开始时间、结束时间）
- 审计类型（任中审计、离任审计）
- 项目状态（已完成、进行中、已立项）

#### 2. 领导干部数据

- 姓名
- 职务
- 所在单位
- 任职状态（在职、离职）
- 任职时间
- 离职时间
- 是否已完成离任审计

#### 3. 组织机构数据

- 单位名称
- 单位级别
- 上级单位
- 下级单位
- 单位状态（正常、撤销、合并）

### 步骤 2：数据分析

#### 离任审计分析

```
筛选条件：
- 领导干部状态 = 离职
- 离任审计完成状态 = 未完成
- 单位状态 = 正常

优先级：最高（P0）
```

#### 轮审分析

```
对每个单位计算：
1. 上次审计时间 = MAX(该单位所有已完成审计项目的结束时间)
2. 距离轮审周期结束天数 = 轮审周期天数 - (当前日期 - 上次审计时间)
3. 如果上次审计时间为空，则该单位从未审计过

优先级规则：
- 从未审计过：优先级（P1）
- 距离轮审周期结束 = 0：优先级（P2）
- 距离轮审周期结束 =1：优先级（P3）
- 距离轮审周期结束 =2：优先级（P4）
- 距离轮审周期结束 =3：优先级（P5）
- 距离轮审周期结束 =4：优先级（P6）
```

### 步骤 3：生成推荐列表

#### 推荐列表字段

- 单位名称
- 被审计对象（领导干部姓名）
- 职务
- 推荐原因（离任审计/轮审到期/从未审计）
- 上次审计年度（如有）
- 距离轮审周期结束年数（轮审项目）
- 优先级（P0/P1/P2/P3）

#### 排序规则

1. 按优先级排序（P0 > P1 > P2 > P3）
2. 同优先级内，离任审计按离职时间排序（越早离职越靠前）
3. 同优先级内，轮审项目按距离周期结束年数排序（越短越靠前）

### 步骤 4：实现页面

#### 页面结构

```
1. 筛选区域
   - 优先级筛选（全部/P0/P1/P2/P3）
   - 单位名称搜索
   - 被审计对象搜索

2. 推荐列表
   - 表格展示推荐结果
   - 支持按字段排序
   - 支持导出 Excel

3. 操作按钮
   - 刷新推荐
   - 导出列表
   - 批量立项
```

#### 表格列配置

```typescript
columns: [
  { label: '优先级', prop: 'priority', width: 100 },
  { label: '单位名称', prop: 'unitName', width: 200 },
  { label: '被审计对象', prop: 'auditee', width: 120 },
  { label: '职务', prop: 'position', width: 150 },
  { label: '推荐原因', prop: 'reason', width: 150 },
  { label: '上次审计年度', prop: 'lastAuditYear', width: 120 },
  { label: '距离周期结束（年）', prop: 'yearsToDeadline', width: 150 },
  { label: '操作', fixed: 'right', width: 150 }
]
```

## 技术实现

### API 接口

#### 获取推荐列表

```typescript
// src/api/audit-management/project-recommendation.ts
export function getRecommendationList(params: RecommendationParams) {
  return request.get<{
    list: RecommendationItem[]
    total: number
  }>({
    url: '/admin/audit/recommendation/list',
    params
  })
}
```

#### 查询参数类型

```typescript
interface RecommendationParams {
  priority?: string // 优先级筛选
  unitName?: string // 单位名称
  auditee?: string // 被审计对象
  page: number
  pageSize: number
}
```

#### 推荐项类型

```typescript
interface RecommendationItem {
  id: number
  unitId: number
  unitName: string
  auditeeId: number
  auditeeName: string
  position: string
  reason: string
  reasonType: 'resignation' | 'cycle' | 'never'
  lastAuditTime?: string
  daysToDeadline?: number
  priority: 'P0' | 'P1' | 'P2' | 'P3'
  resignationDate?: string
}
```

### Mock 数据

创建固定的 Mock 数据，包含：

- 10-15 个推荐项
- 包含各种优先级（P0/P1/P2/P3）
- 包含各种推荐原因（离任/轮审到期/从未审计）
- 真实的单位名称和职务

### 路由配置

```typescript
// src/router/modules/audit-management.ts
{
  path: 'recommendation/list',
  name: 'AuditProjectRecommendation',
  component: () => import('@/views/audit-management/project-recommendation/index.vue'),
  meta: {
    title: 'menus.auditManagement.projectRecommendation',
    keepAlive: true,
    isHide: true,
    activePath: '/audit-management'
  }
}
```

## 优先级标识

使用 Element Plus 的 Tag 组件显示优先级：

```vue
<el-tag :type="getPriorityType(row.priority)" size="small">
  {{ row.priority }}
</el-tag>
```

```typescript
const getPriorityType = (priority: string) => {
  const typeMap = {
    P0: 'danger',
    P1: 'warning',
    P2: 'info',
    P3: 'success'
  }
  return typeMap[priority] || 'info'
}
```

## 推荐原因显示

```typescript
const getReasonText = (item: RecommendationItem) => {
  switch (item.reasonType) {
    case 'resignation':
      return `离任审计（${item.resignationDate} 离职）`
    case 'cycle':
      return `轮审到期（剩余 ${item.yearsToDeadline} 年）`
    case 'never':
      return '从未审计'
    default:
      return item.reason
  }
}
```

## 导出功能

支持导出 Excel 文件，包含所有推荐项信息：

```typescript
import * as XLSX from 'xlsx'

const handleExport = () => {
  const data = tableData.value.map((item) => ({
    优先级: item.priority,
    单位名称: item.unitName,
    被审计对象: item.auditeeName,
    职务: item.position,
    推荐原因: getReasonText(item),
    上次审计年度: item.lastAuditYear || '从未审计',
    '距离周期结束（年）': item.yearsToDeadline || '-'
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '审计项目推荐')
  XLSX.writeFile(wb, `审计项目推荐_${new Date().toLocaleDateString()}.xlsx`)
}
```

## 注意事项

1. **数据准确性**：确保历史审计数据、领导干部数据和组织机构数据的准确性和及时更新
2. **轮审周期配置**：支持可在页面上设置轮审周期年数
3. **优先级计算**：离任审计始终为最高优先级（P0），不受轮审周期影响
4. **单位状态**：只推荐状态为"正常"的单位，已撤销或合并的单位不推荐
5. **重复审计**：如果某单位已有进行中或已立项的审计项目，不再重复推荐
6. **实时刷新**：提供刷新按钮，重新计算推荐列表

## 使用示例

### 示例 1：查询离任审计推荐

```
用户：推荐需要离任审计的项目
系统：根据领导干部离职情况，推荐以下单位需要进行离任审计...
```

### 示例 2：查询轮审推荐

```
用户：哪些单位需要审计？使用5年轮审周期
系统：根据5年轮审规则，以下单位需要进行审计...
```

### 示例 3：生成审计计划

```
用户：生成本年度审计项目推荐
系统：根据优先级排序，推荐以下审计项目...
```

---

**最后更新时间**: 2026-04-28 **版本**: 1.0.0
