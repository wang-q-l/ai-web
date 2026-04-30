# 标准列表页模版

标准列表页包含：筛选卡片、数据表格、分页、新增/编辑对话框。

## 完整代码示例

基于角色管理页面（`src/views/permission/role/index.vue`）

### Template 部分

```vue
<template>
  <div class="page-container">
    <!-- 筛选卡片 -->
    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="角色名称">
          <el-input
            v-model="filterForm.name"
            placeholder="输入角色名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="角色状态">
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
        <el-table v-loading="loading" :data="tableData" height="100%" style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" align="center" />
          <el-table-column prop="name" label="名称" min-width="150" />
          <el-table-column prop="description" label="备注" min-width="200" show-overflow-tooltip />
          <el-table-column prop="createTime" label="创建时间" width="180" />
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
          @size-change="fetchList"
          @current-change="fetchList"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" @closed="resetForm">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入备注" />
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

### Script 部分

```vue
<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Search, Plus } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { Role } from '@/types/api'
  import {
    getRoleList,
    addRole,
    updateRole,
    deleteRole,
    updateRoleStatus
  } from '@/api/organization'

  defineOptions({ name: 'RolePage' })

  // 筛选表单
  const filterForm = reactive({
    name: '',
    status: undefined as number | undefined
  })

  // 表格数据
  const loading = ref(false)
  const tableData = ref<Role[]>([])

  // 分页
  const pagination = reactive({
    page: 1,
    pageSize: 10,
    total: 0
  })

  // 对话框
  const dialogVisible = ref(false)
  const dialogTitle = ref('')
  const formRef = ref<FormInstance>()
  const form = reactive<Partial<Role>>({
    name: '',
    description: '',
    sort: 0,
    status: 1
  })

  // 表单验证规则
  const formRules: FormRules = {
    name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
  }

  // 获取列表
  const fetchList = async () => {
    loading.value = true
    try {
      const params = {
        name: filterForm.name || undefined,
        status: filterForm.status,
        page: pagination.page,
        pageSize: pagination.pageSize
      }
      const res = await getRoleList(params)
      if (res.code === 200) {
        tableData.value = res.data.list || []
        pagination.total = res.data.total || 0
      }
    } catch (error) {
      console.error('获取列表失败:', error)
      ElMessage.error('获取列表失败')
    } finally {
      loading.value = false
    }
  }

  // 搜索
  const handleSearch = () => {
    pagination.page = 1
    fetchList()
  }

  // 新增
  const handleAdd = () => {
    dialogTitle.value = '新增角色'
    dialogVisible.value = true
  }

  // 编辑
  const handleEdit = (row: Role) => {
    dialogTitle.value = '编辑角色'
    Object.assign(form, {
      id: row.id,
      name: row.name,
      description: row.description,
      sort: row.sort,
      status: row.status
    })
    dialogVisible.value = true
  }

  // 删除
  const handleDelete = async (row: Role) => {
    try {
      await ElMessageBox.confirm('确定要删除该角色吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      const res = await deleteRole(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error('删除失败:', error)
        ElMessage.error(error.message || '删除失败')
      }
    }
  }

  // 状态切换
  const handleStatusChange = async (row: Role) => {
    try {
      const res = await updateRoleStatus(row.id, row.status!)
      if (res.code === 200) {
        ElMessage.success('状态更新成功')
      } else {
        ElMessage.error(res.message || '状态更新失败')
        row.status = row.status === 1 ? 0 : 1
      }
    } catch (error) {
      console.error('更新状态失败:', error)
      ElMessage.error('状态更新失败')
      row.status = row.status === 1 ? 0 : 1
    }
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          const data = { ...form }
          let res
          if (form.id) {
            res = await updateRole(form.id, data)
          } else {
            res = await addRole(data)
          }

          if (res.code === 200) {
            ElMessage.success(form.id ? '更新成功' : '新增成功')
            dialogVisible.value = false
            fetchList()
          } else {
            ElMessage.error(res.message || '操作失败')
          }
        } catch (error) {
          console.error('提交失败:', error)
          ElMessage.error('操作失败')
        }
      }
    })
  }

  // 重置表单
  const resetForm = () => {
    formRef.value?.resetFields()
    Object.assign(form, {
      id: undefined,
      name: '',
      description: '',
      sort: 0,
      status: 1
    })
  }

  // 初始化
  onMounted(() => {
    fetchList()
  })
</script>
```

### Style 部分

```vue
<style lang="scss" scoped>
  .page-container {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 140px);
    overflow: hidden;
    padding: 0;

    .filter-card {
      margin-bottom: 16px;
      border-radius: 12px;
      border: none !important;
      box-shadow: none !important;
      flex-shrink: 0;

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
      border-radius: 12px;
      border: none !important;
      box-shadow: none !important;

      :deep(.el-card__body) {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        padding: 16px;
      }

      .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
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
</style>
```

## 关键点说明

### 布局结构

1. 页面根容器使用 `height: calc(100vh - 140px)` 固定高度
2. 筛选卡片使用 `flex-shrink: 0` 不压缩
3. 表格卡片使用 `flex: 1` 占据剩余空间
4. 表格容器使用 `flex: 1` 和 `overflow: hidden`

### 表格配置

- `height="100%"` - 表头固定，数据滚动
- `v-loading` - 加载状态
- `show-overflow-tooltip` - 文本溢出显示提示

### 分页配置

- 双向绑定 `current-page` 和 `page-size`
- 监听 `size-change` 和 `current-change` 事件
- 布局：`total, sizes, prev, pager, next, jumper`

### CRUD 操作

- 新增/编辑共用一个对话框和表单
- 通过 `form.id` 判断是新增还是编辑
- 删除前使用 `ElMessageBox.confirm` 确认
- 状态切换失败时恢复原状态

### 表单验证

- 使用 `FormRules` 定义验证规则
- 提交前调用 `formRef.value.validate()`
- 对话框关闭时调用 `resetForm()` 重置表单
