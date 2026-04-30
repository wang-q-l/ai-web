# 树形表格页模版

树形表格页支持层级展开的数据结构，适用于菜单管理、部门管理等场景。

## 完整代码示例

基于菜单管理页面（`src/views/permission/menu/index.vue`）

### Template 部分

```vue
<template>
  <div class="page-container">
    <!-- 筛选卡片 -->
    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="菜单名称">
          <el-input
            v-model="filterForm.name"
            placeholder="输入菜单名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="菜单状态">
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
        <el-button type="primary" :icon="Plus" @click="handleAdd()">新增</el-button>
        <el-button @click="toggleExpand">{{ isExpanded ? '折叠' : '展开' }}</el-button>
      </div>

      <div class="table-container">
        <el-table
          ref="tableRef"
          v-loading="loading"
          :data="tableData"
          :key="tableKey"
          row-key="id"
          :tree-props="{ children: 'children' }"
          :default-expand-all="isExpanded"
          height="100%"
          style="width: 100%"
        >
          <el-table-column prop="title" label="菜单名称" min-width="200" />
          <el-table-column label="类型" width="100" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.type === 'directory'" type="warning">目录</el-tag>
              <el-tag v-else-if="row.type === 'menu'" type="success">菜单</el-tag>
              <el-tag v-else-if="row.type === 'button'" type="info">按钮</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="图标" width="80" align="center">
            <template #default="{ row }">
              <i v-if="row.icon" class="iconfont-sys" v-html="row.icon"></i>
            </template>
          </el-table-column>
          <el-table-column prop="sort" label="排序" width="100" align="center" />
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
          <el-table-column label="操作" width="200" align="center" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleAdd(row.id)">新增</el-button>
              <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
              <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" @closed="resetForm">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio value="directory">目录</el-radio>
            <el-radio value="menu">菜单</el-radio>
            <el-radio value="button">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="上级菜单">
          <el-tree-select
            v-model="form.parentId"
            :data="menuTreeOptions"
            :props="{ label: 'title' }"
            node-key="id"
            placeholder="请选择上级菜单"
            clearable
            check-strictly
            :render-after-expand="false"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" :max="9999" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
```

### Script 部分（核心逻辑）

```vue
<script setup lang="ts">
  import { ref, reactive, onMounted, computed } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Search, Plus } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { Menu } from '@/types/api'
  import {
    getMenuList,
    addMenu,
    updateMenu,
    deleteMenu,
    updateMenuStatus
  } from '@/api/organization'

  defineOptions({ name: 'MenuPage' })

  // 表格数据
  const loading = ref(false)
  const tableData = ref<Menu[]>([])
  const isExpanded = ref(true)
  const tableRef = ref()
  const tableKey = ref(0)

  // 菜单树选项（用于上级菜单选择）
  const menuTreeOptions = computed(() => {
    // 过滤掉按钮类型的菜单，只显示目录和菜单
    const filterButtons = (menus: Menu[]): Menu[] => {
      return menus
        .filter((menu) => menu.type !== 'button')
        .map((menu) => ({
          ...menu,
          children: menu.children ? filterButtons(menu.children) : undefined
        }))
    }
    return filterButtons(tableData.value)
  })

  // 展开/折叠
  const toggleExpand = () => {
    isExpanded.value = !isExpanded.value
    tableKey.value++
  }

  // 新增（支持添加子项）
  const handleAdd = (parentId?: number) => {
    dialogTitle.value = '新增菜单'
    form.parentId = parentId
    dialogVisible.value = true
  }

  // ... 其他 CRUD 操作类似标准列表页
</script>
```

## 关键点说明

### 树形表格配置

```vue
<el-table
  row-key="id"
  :tree-props="{ children: 'children' }"
  :default-expand-all="isExpanded"
>
```

- `row-key="id"` - 必须指定唯一标识
- `:tree-props` - 指定子节点字段名
- `:default-expand-all` - 控制默认展开状态

### 展开/折叠功能

```typescript
const isExpanded = ref(true)
const tableKey = ref(0)

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
  tableKey.value++ // 强制重新渲染
}
```

### 新增子项功能

```typescript
const handleAdd = (parentId?: number) => {
  dialogTitle.value = '新增菜单'
  form.parentId = parentId // 设置父节点ID
  dialogVisible.value = true
}
```

在操作列中：

```vue
<el-button link type="primary" @click="handleAdd(row.id)">新增</el-button>
```

### 上级菜单选择

使用 `el-tree-select` 组件：

```vue
<el-tree-select
  v-model="form.parentId"
  :data="menuTreeOptions"
  :props="{ label: 'title' }"
  node-key="id"
  check-strictly
  clearable
/>
```

- `check-strictly` - 允许选择任意节点
- `menuTreeOptions` - 过滤掉按钮类型的菜单

### 图标显示

```vue
<i v-if="row.icon" class="iconfont-sys" v-html="row.icon"></i>
```

样式：

```scss
.iconfont-sys {
  font-size: 18px;
}
```

### 数据结构

```typescript
interface Menu {
  id: number
  title: string
  type: 'directory' | 'menu' | 'button'
  icon?: string
  sort: number
  status: number
  parentId?: number
  children?: Menu[]
}
```
