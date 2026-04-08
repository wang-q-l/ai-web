# 左右分栏布局模版

左右分栏布局适用于左侧树形导航 + 右侧列表的场景，如用户管理、组织架构等。

## 完整代码示例

基于用户管理页面（`src/views/organization/user/index.vue`）

### Template 部分

```vue
<template>
  <div class="page-container">
    <div class="split-layout">
      <!-- 左侧：部门树卡片 -->
      <el-card shadow="never" class="left-card">
        <div class="tree-header">
          <span class="tree-title">部门列表</span>
        </div>
        <el-input
          v-model="deptFilterText"
          placeholder="请输入内容"
          clearable
          class="tree-search"
        />
        <div class="tree-container">
          <el-tree
            ref="treeRef"
            :data="departmentTree"
            :props="{ label: 'name', children: 'children' }"
            :filter-node-method="filterNode"
            node-key="id"
            default-expand-all
            highlight-current
            @node-click="handleDeptClick"
          />
        </div>
      </el-card>

      <!-- 右侧：筛选 + 表格 -->
      <div class="right-content">
        <!-- 筛选卡片 -->
        <el-card shadow="never" class="filter-card">
          <el-form :inline="true" :model="filterForm" class="filter-form">
            <el-form-item label="员工查询">
              <el-input
                v-model="filterForm.keyword"
                placeholder="输入员工名称"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="员工状态">
              <el-select
                v-model="filterForm.status"
                placeholder="请选择"
                clearable
                style="width: 150px"
              >
                <el-option label="启用" :value="1" />
                <el-option label="禁用" :value="0" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 表格卡片 -->
        <el-card shadow="never" class="table-card">
          <div class="table-header">
            <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
          </div>

          <div class="table-container">
            <el-table
              ref="tableRef"
              v-loading="loading"
              :data="tableData"
              height="100%"
            >
              <el-table-column prop="nickname" label="姓名" width="120" fixed="left" />
              <el-table-column prop="username" label="账号" width="120" />
              <el-table-column prop="departmentPath" label="所属部门" min-width="200" />
              <el-table-column prop="position" label="岗位" width="120" />
              <el-table-column label="状态" width="100" align="center">
                <template #default="{ row }">
                  <el-switch
                    v-model="row.status"
                    :active-value="1"
                    :inactive-value="0"
                    @change="handleStatusChange(row)"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" align="center" fixed="right">
                <template #default="{ row }">
                  <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
                  <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :total="pagination.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>
```

### Script 部分

```vue
<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import type { User, Department } from '@/types/api'
import { getUserList, getDepartmentTree } from '@/api/organization'

defineOptions({ name: 'UserManagement' })

// 部门树
const deptFilterText = ref('')
const treeRef = ref()
const departmentTree = ref<Department[]>([])
const selectedDeptId = ref<number>()

// 筛选表单
const filterForm = reactive({
  keyword: '',
  status: undefined as number | undefined
})

// 表格数据
const loading = ref(false)
const tableData = ref<User[]>([])

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 获取部门树
const fetchDepartmentTree = async () => {
  try {
    const res = await getDepartmentTree()
    if (res.code === 200) {
      departmentTree.value = res.data || []
    }
  } catch (error) {
    console.error('获取部门树失败:', error)
    ElMessage.error('获取部门树失败')
  }
}

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true
  try {
    const params = {
      departmentId: selectedDeptId.value,
      keyword: filterForm.keyword || undefined,
      status: filterForm.status,
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    const res = await getUserList(params)
    if (res.code === 200) {
      tableData.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 部门节点点击
const handleDeptClick = (data: Department) => {
  selectedDeptId.value = data.id
  pagination.page = 1
  fetchUserList()
}

// 树节点过滤
const filterNode = (value: string, data: Department) => {
  if (!value) return true
  return data.name.includes(value)
}

// 监听搜索文本变化
watch(deptFilterText, (val) => {
  treeRef.value?.filter(val)
})

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchUserList()
}

// 初始化
onMounted(() => {
  fetchDepartmentTree()
  fetchUserList()
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
}

.split-layout {
  display: flex;
  gap: 16px;
  height: 100%;
  overflow: hidden;

  .left-card {
    width: 280px;
    flex-shrink: 0;
    border: none !important;
    box-shadow: none !important;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    :deep(.el-card__body) {
      padding: 16px;
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .tree-header {
      margin-bottom: 12px;

      .tree-title {
        font-size: 16px;
        font-weight: 500;
        color: #303133;
      }
    }

    .tree-search {
      margin-bottom: 12px;
    }

    .tree-container {
      flex: 1;
      overflow: auto;
    }
  }

  .right-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow: hidden;

    .filter-card {
      flex-shrink: 0;
      border: none !important;
      box-shadow: none !important;
      border-radius: 12px;

      :deep(.el-card__body) {
        padding: 12px 20px;
      }

      .filter-form {
        margin-bottom: 0;
        display: flex;
        align-items: center;

        :deep(.el-form-item) {
          margin-bottom: 0;
        }
      }
    }

    .table-card {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: none !important;
      box-shadow: none !important;
      border-radius: 12px;

      :deep(.el-card__body) {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        padding: 16px;
      }

      .table-header {
        display: flex;
        margin-bottom: 16px;

        .el-button:not(:first-child) {
          margin-left: 12px;
        }
      }

      .table-container {
        flex: 1;
        overflow: hidden;
      }

      .pagination-container {
        display: flex;
        justify-content: flex-end;
        margin-top: 16px;
      }
    }
  }
}
</style>
```

## 关键点说明

### 分栏布局结构
```scss
.split-layout {
  display: flex;
  gap: 16px;
  height: 100%;
  overflow: hidden;
}
```

- 使用 `display: flex` 实现左右分栏
- `gap: 16px` 控制左右间距
- `height: 100%` 和 `overflow: hidden` 确保高度固定

### 左侧卡片
```scss
.left-card {
  width: 280px;
  flex-shrink: 0;  // 不压缩
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
```

- 固定宽度 280px
- `flex-shrink: 0` 确保不被压缩
- 内部使用 flex 布局，树容器自动占满剩余空间

### 右侧内容
```scss
.right-content {
  flex: 1;  // 占据剩余空间
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
}
```

- `flex: 1` 自动占满剩余空间
- 内部垂直排列筛选卡片和表格卡片

### 树组件配置
```vue
<el-tree
  ref="treeRef"
  :data="departmentTree"
  :props="{ label: 'name', children: 'children' }"
  :filter-node-method="filterNode"
  node-key="id"
  default-expand-all
  highlight-current
  @node-click="handleDeptClick"
/>
```

- `highlight-current` - 高亮当前选中节点
- `@node-click` - 点击节点触发事件
- `:filter-node-method` - 自定义过滤方法

### 树节点过滤
```typescript
const filterNode = (value: string, data: Department) => {
  if (!value) return true
  return data.name.includes(value)
}

watch(deptFilterText, (val) => {
  treeRef.value?.filter(val)
})
```

### 联动交互
```typescript
const handleDeptClick = (data: Department) => {
  selectedDeptId.value = data.id
  pagination.page = 1  // 重置页码
  fetchUserList()  // 重新获取列表
}
```

点击左侧树节点时，右侧列表根据选中的部门进行过滤。

### 数据结构
```typescript
interface Department {
  id: number
  name: string
  children?: Department[]
}
```
