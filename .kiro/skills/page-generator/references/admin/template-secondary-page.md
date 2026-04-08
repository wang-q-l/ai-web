# 二级页面模版

二级页面是从列表页进入的详情或管理页面，需要添加面包屑卡片和返回按钮。

## 核心布局规范

### 滚动布局结构

**二级页面必须使用以下滚动布局结构，确保内容区域可以滚动：**

1. **固定的面包屑卡片** - 使用 `flex-shrink: 0` 固定在顶部
2. **滚动包装器** - 使用 `flex: 1` 和 `overflow: hidden`
3. **el-scrollbar 组件** - 包裹可滚动内容
4. **滚动内容区** - 使用 `padding-bottom: 20px` 确保底部有空隙

**布局结构示意：**

```vue
<template>
  <div class="page-container">
    <!-- 1. 固定的面包屑卡片 -->
    <el-card class="breadcrumb-card">
      <!-- 面包屑内容 -->
    </el-card>

    <!-- 2. 滚动包装器 -->
    <div class="scroll-wrapper">
      <!-- 3. el-scrollbar 组件 -->
      <el-scrollbar>
        <!-- 4. 滚动内容区 -->
        <div class="scroll-content">
          <!-- 筛选卡片 -->
          <el-card class="filter-card">
            <!-- 筛选表单 -->
          </el-card>

          <!-- 数据卡片 -->
          <el-card class="data-card">
            <!-- 表格内容 -->
          </el-card>

          <!-- 更多卡片... -->
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>
```

**样式规范：**

```scss
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// 1. 固定的面包屑卡片
.breadcrumb-card {
  flex-shrink: 0;  // 不压缩，固定在顶部
  border: none !important;
  box-shadow: none !important;
  border-radius: 12px;
}

// 2. 滚动包装器
.scroll-wrapper {
  flex: 1;  // 占据剩余空间
  overflow: hidden;  // 隐藏溢出

  :deep(.el-scrollbar) {
    height: 100%;
  }

  // 4. 滚动内容区
  .scroll-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-bottom: 20px;  // 底部留白，确保内容不被裁剪
  }
}
```

**关键点：**
- ✅ 面包屑卡片固定在顶部，不滚动
- ✅ 使用 `el-scrollbar` 组件，不使用原生滚动条
- ✅ 滚动内容区使用 `gap: 16px` 控制卡片间距
- ✅ 底部 `padding-bottom: 20px` 确保内容不被裁剪
- ❌ 不要把面包屑包进滚动区域
- ❌ 不要使用 `overflow-y: auto` 创建原生滚动条

---

## 完整代码示例

基于题目列表页面（`src/views/question-bank/question-list.vue`）

### Template 部分

```vue
<template>
  <div class="page-container">
    <!-- 面包屑卡片 -->
    <el-card class="breadcrumb-card">
      <div class="breadcrumb-content">
        <el-button text @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回题库列表
        </el-button>
        <span class="divider">|</span>
        <span class="page-info">
          {{ bankName }}（共 {{ total }} 题）
        </span>
      </div>
    </el-card>

    <!-- 滚动包装器 -->
    <div class="scroll-wrapper">
      <el-scrollbar>
        <div class="scroll-content">
          <!-- 筛选卡片 -->
          <el-card class="filter-card">
            <el-form :model="queryParams">
              <div class="filter-form-content">
                <el-form-item label="关键词">
                  <el-input
                    v-model="queryParams.keyword"
                    placeholder="请输入题干关键词"
                    style="width: 250px"
                    clearable
                  />
                </el-form-item>

                <el-form-item label="题型">
                  <el-select v-model="queryParams.type" style="width: 150px" clearable>
                    <el-option label="全部" value="" />
                    <el-option label="单选题" :value="1" />
                    <el-option label="多选题" :value="2" />
                  </el-select>
                </el-form-item>

                <el-form-item label=" ">
                  <div class="filter-buttons">
                    <el-button type="primary" @click="handleSearch">搜索</el-button>
                    <el-button @click="handleReset">重置</el-button>
                  </div>
                </el-form-item>
              </div>
            </el-form>
          </el-card>

          <!-- 数据表格卡片 -->
          <el-card class="data-card">
            <div class="table-header">
              <el-button type="primary" @click="handleAdd">
                <el-icon><Plus /></el-icon>
                添加题目
              </el-button>
            </div>

            <el-table
              :data="tableData"
              max-height="600"
              v-loading="loading"
            >
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column label="题型" width="100">
                <template #default="{ row }">
                  <el-tag :type="getQuestionTypeTag(row.type)">
                    {{ getQuestionTypeLabel(row.type) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="题干" min-width="250">
                <template #default="{ row }">
                  <div class="question-content">
                    {{ row.content.substring(0, 50) }}{{ row.content.length > 50 ? '...' : '' }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="{ row }">
                  <el-button link @click="handleEdit(row)">编辑</el-button>
                  <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>

            <el-pagination
              v-model:current-page="queryParams.page"
              v-model:page-size="queryParams.pageSize"
              :total="total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="fetchData"
              @current-change="fetchData"
            />
          </el-card>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>
```

### Script 部分

```vue
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Plus } from '@element-plus/icons-vue'
import { getQuestionList, getQuestionBankDetail } from '@/api/question-bank'
import type { Question } from '@/types/api'

defineOptions({ name: 'QuestionManagement' })

const route = useRoute()
const router = useRouter()

// 获取路由参数
const bankId = Number(route.params.bankId)
const bankName = ref('')

// 查询参数
const queryParams = reactive({
  bankId,
  keyword: '',
  type: undefined as number | undefined,
  page: 1,
  pageSize: 20
})

// 表格数据
const tableData = ref<Question[]>([])
const total = ref(0)
const loading = ref(false)

/**
 * 获取题库信息
 */
const fetchBankInfo = async () => {
  try {
    const res = await getQuestionBankDetail(bankId)
    bankName.value = res.data.name
  } catch (error: any) {
    ElMessage.error(error.message || '获取题库信息失败')
  }
}

/**
 * 获取数据
 */
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getQuestionList(queryParams)
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (error: any) {
    ElMessage.error(error.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

/**
 * 搜索
 */
const handleSearch = () => {
  queryParams.page = 1
  fetchData()
}

/**
 * 重置
 */
const handleReset = () => {
  queryParams.keyword = ''
  queryParams.type = undefined
  queryParams.page = 1
  fetchData()
}

/**
 * 返回
 */
const handleBack = () => {
  router.push({ name: 'QuestionBankList' })
}

/**
 * 添加
 */
const handleAdd = () => {
  router.push({ name: 'QuestionAdd', params: { bankId } })
}

/**
 * 编辑
 */
const handleEdit = (row: Question) => {
  router.push({ name: 'QuestionEdit', params: { id: row.id } })
}

/**
 * 删除
 */
const handleDelete = (row: Question) => {
  ElMessageBox.confirm('确定要删除这道题目吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    // 调用删除 API
    ElMessage.success('删除成功')
    fetchData()
  }).catch(() => {})
}

// 初始化
onMounted(() => {
  fetchBankInfo()
  fetchData()
})
</script>
```

### Style 部分

```vue
<style lang="scss" scoped>
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// 面包屑卡片
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
    gap: 12px;
    width: 100%;
    height: 60px;

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

// 滚动包装器
.scroll-wrapper {
  flex: 1;
  overflow: hidden;

  :deep(.el-scrollbar) {
    height: 100%;
  }

  .scroll-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-bottom: 20px;
  }
}

// 筛选卡片
.filter-card {
  flex-shrink: 0;
  border: none !important;
  box-shadow: none !important;
  border-radius: 12px;

  :deep(.el-card__body) {
    padding: 12px 20px;
  }

  .filter-form-content {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;

    :deep(.el-form-item) {
      margin-bottom: 0;
    }
  }

  .filter-buttons {
    display: flex;

    .el-button:not(:first-child) {
      margin-left: 12px;
    }
  }
}

// 数据卡片
.data-card {
  flex-shrink: 0;
  border: none !important;
  box-shadow: none !important;
  border-radius: 12px;

  :deep(.el-card__body) {
    padding: 20px;
  }

  .table-header {
    display: flex;
    margin-bottom: 16px;

    .el-button:not(:first-child) {
      margin-left: 12px;
    }
  }

  .el-pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }
}
</style>
```

---

## 关键点说明

### 1. 滚动布局结构

**必须使用的结构：**

```vue
<div class="page-container">
  <!-- 固定的面包屑 -->
  <el-card class="breadcrumb-card">...</el-card>

  <!-- 滚动包装器 -->
  <div class="scroll-wrapper">
    <el-scrollbar>
      <div class="scroll-content">
        <!-- 所有可滚动的内容 -->
      </div>
    </el-scrollbar>
  </div>
</div>
```

**样式要点：**

```scss
.page-container {
  height: 100%;  // 继承父容器高度
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.breadcrumb-card {
  flex-shrink: 0;  // 固定，不压缩
}

.scroll-wrapper {
  flex: 1;  // 占据剩余空间
  overflow: hidden;  // 隐藏溢出

  :deep(.el-scrollbar) {
    height: 100%;
  }

  .scroll-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-bottom: 20px;  // 底部留白
  }
}
```

### 2. 路由参数获取

```typescript
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 获取路由参数
const bankId = Number(route.params.bankId)
```

### 3. 面包屑卡片

- 高度固定为 60px
- 包含返回按钮、分隔符、页面信息
- 使用 `flex-shrink: 0` 不压缩
- 使用 `gap: 16px` 与滚动区域保持间距

### 4. 返回功能

```typescript
const handleBack = () => {
  router.push({ name: 'QuestionBankList' })
}
```

使用路由名称而不是路径，更加可靠。

### 5. 页面信息显示

```vue
<span class="page-info">
  {{ bankName }}（共 {{ total }} 题）
</span>
```

从 API 获取并显示相关信息。

### 6. 路由配置（重要）

二级页面需要在路由配置中添加 `activePath`：

```typescript
{
  path: 'questions/:bankId',
  name: 'QuestionManagement',
  component: () => import('@/views/question-bank/question-list.vue'),
  meta: {
    title: 'menus.questionBank.questionManagement',
    keepAlive: true,
    isHide: true,
    activePath: '/question-bank'  // 指定激活的菜单路径
  }
}
```

`activePath` 确保访问二级页面时，一级菜单保持高亮状态。

### 7. 表格使用 max-height

在滚动布局中，表格不需要使用 `height="100%"`，而是使用 `max-height`：

```vue
<el-table
  :data="tableData"
  max-height="600"
  v-loading="loading"
>
```

这样表格会根据内容自动调整高度，不会超过 600px。

### 8. 卡片使用 flex-shrink: 0

滚动内容区中的所有卡片都使用 `flex-shrink: 0`，防止被压缩：

```scss
.filter-card,
.data-card {
  flex-shrink: 0;
}
```

---

## 常见错误

### ❌ 错误 1：把面包屑包进滚动区域

```vue
<!-- 错误 -->
<div class="scroll-wrapper">
  <el-scrollbar>
    <el-card class="breadcrumb-card">...</el-card>
    <el-card class="filter-card">...</el-card>
  </el-scrollbar>
</div>
```

**问题：** 面包屑会跟着内容一起滚动，用户看不到返回按钮。

### ❌ 错误 2：不使用 el-scrollbar

```vue
<!-- 错误 -->
<div class="scroll-wrapper" style="overflow-y: auto">
  <el-card class="filter-card">...</el-card>
</div>
```

**问题：** 使用原生滚动条，样式不统一，用户体验差。

### ❌ 错误 3：表格使用 height="100%"

```vue
<!-- 错误 -->
<el-table :data="tableData" height="100%">
```

**问题：** 在滚动布局中，表格会撑满整个容器，导致其他内容被挤压。

### ✅ 正确做法

```vue
<template>
  <div class="page-container">
    <!-- 固定的面包屑 -->
    <el-card class="breadcrumb-card">...</el-card>

    <!-- 滚动包装器 -->
    <div class="scroll-wrapper">
      <el-scrollbar>
        <div class="scroll-content">
          <!-- 筛选卡片 -->
          <el-card class="filter-card">...</el-card>

          <!-- 数据卡片 -->
          <el-card class="data-card">
            <el-table :data="tableData" max-height="600">
              ...
            </el-table>
          </el-card>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>
```

---

## 参考示例

可以参考以下页面的滚动实现：

- 监考页面：`src/views/exam/monitor.vue`
- 成绩详情页：`src/views/exam/score-detail.vue`

这些页面都使用了正确的滚动布局结构。
