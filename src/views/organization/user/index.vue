<template>
  <div class="organization-user">
    <div class="user-layout">
      <!-- 左侧：部门树卡片 -->
      <ElCard shadow="never" class="dept-tree-card">
        <div class="tree-header">
          <span class="tree-title">部门列表</span>
        </div>
        <ElInput
          v-model="deptFilterText"
          placeholder="请输入内容"
          clearable
          class="tree-search"
        />
        <ElScrollbar class="tree-container">
          <ElTree
            ref="treeRef"
            :data="departmentTree"
            :props="{ label: 'name', children: 'children' }"
            :filter-node-method="filterNode"
            node-key="id"
            default-expand-all
            highlight-current
            @node-click="handleDeptClick"
          />
        </ElScrollbar>
      </ElCard>

      <!-- 右侧：筛选 + 表格 -->
      <div class="user-content">
        <!-- 筛选卡片 -->
        <ElCard shadow="never" class="filter-card">
          <ElForm :inline="true" :model="filterForm" class="filter-form">
            <ElFormItem label="员工查询">
              <ElInput
                v-model="filterForm.keyword"
                placeholder="输入部门名称"
                clearable
                style="width: 200px"
              />
            </ElFormItem>
            <ElFormItem label="员工状态">
              <ElSelect
                v-model="filterForm.status"
                placeholder="请选择"
                clearable
                style="width: 150px"
              >
                <ElOption label="启用" :value="1" />
                <ElOption label="禁用" :value="0" />
              </ElSelect>
            </ElFormItem>
            <ElFormItem>
              <ElButton type="primary" :icon="Search" @click="handleSearch">搜索</ElButton>
            </ElFormItem>
          </ElForm>
        </ElCard>

        <!-- 表格卡片 -->
<ElCard shadow="never" class="table-card">
          <div class="table-header">
            <ElButton type="primary" :icon="Plus" @click="handleAdd">新增</ElButton>
            <ElButton @click="handleImport">导入</ElButton>
            <ElButton @click="handleExport">导出</ElButton>
            <ElButton :disabled="selectedRows.length === 0" @click="handleBatchSetPosition">
              设置岗位
            </ElButton>
            <ElButton :disabled="selectedRows.length === 0" @click="handleBatchSetRole">
              设置角色
            </ElButton>
            <ElButton
              type="danger"
              :disabled="selectedRows.length === 0"
              @click="handleBatchDelete"
            >
              批量删除
            </ElButton>
          </div>

          <div class="table-container">
            <ElTable
              ref="tableRef"
              v-loading="loading"
              :data="tableData"
              @selection-change="handleSelectionChange"
            >
              <ElTableColumn type="selection" width="55" fixed="left" />
              <ElTableColumn prop="nickname" label="姓名" width="120" fixed="left" />
              <ElTableColumn prop="username" label="账号" width="120" />
              <ElTableColumn prop="departmentPath" label="所属部门" min-width="200" />
              <ElTableColumn prop="position" label="岗位" width="120" />
              <ElTableColumn label="角色" width="120">
                <template #default="{ row }">
                  {{ getRoleNames(row.roles) }}
                </template>
              </ElTableColumn>
              <ElTableColumn prop="phone" label="手机号" width="130" />
              <ElTableColumn label="状态" width="100" align="center">
                <template #default="{ row }">
                  <ElSwitch
                    v-model="row.status"
                    :active-value="1"
                    :inactive-value="0"
                    @change="handleStatusChange(row)"
                  />
                </template>
              </ElTableColumn>
              <ElTableColumn label="操作" width="150" align="center" fixed="right">
                <template #default="{ row }">
                  <ElButton link type="primary" @click="handleEdit(row)">编辑</ElButton>
                  <ElButton link type="danger" @click="handleDelete(row)">删除</ElButton>
                </template>
              </ElTableColumn>
            </ElTable>
          </div>

          <!-- 分页 -->
          <div class="pagination-container">
            <ElPagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :total="pagination.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </ElCard>
      </div>
    </div>

    <!-- 新增/编辑对话框 -->
    <ElDialog v-model="dialogVisible" :title="dialogTitle" width="600px" @closed="resetForm">
      <ElForm ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <ElFormItem label="姓名" prop="nickname">
          <ElInput v-model="form.nickname" placeholder="请输入姓名" />
        </ElFormItem>
        <ElFormItem label="账号" prop="username">
          <ElInput v-model="form.username" :disabled="isEditing" placeholder="请输入账号" />
        </ElFormItem>
        <ElFormItem label="所属部门" prop="departmentId">
          <ElTreeSelect
            v-model="form.departmentId"
            :data="departmentTree"
            :props="{ label: 'name' }"
            node-key="id"
            placeholder="请选择部门"
            clearable
            style="width: 100%"
          />
        </ElFormItem>
        <ElFormItem label="岗位">
          <ElInput v-model="form.position" placeholder="请输入岗位" />
        </ElFormItem>
        <ElFormItem label="手机号">
          <ElInput v-model="form.phone" placeholder="请输入手机号" />
        </ElFormItem>
        <ElFormItem label="邮箱">
          <ElInput v-model="form.email" placeholder="请输入邮箱" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 批量设置岗位对话框 -->
    <ElDialog v-model="positionDialogVisible" title="设置岗位" width="400px">
      <ElForm :model="positionForm" label-width="80px">
        <ElFormItem label="岗位">
          <ElInput v-model="positionForm.position" placeholder="请输入岗位" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="positionDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleConfirmSetPosition">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 批量设置角色对话框 -->
    <ElDialog v-model="roleDialogVisible" title="设置角色" width="400px">
      <ElForm :model="roleForm" label-width="80px">
        <ElFormItem label="角色">
          <ElSelect v-model="roleForm.roleIds" multiple placeholder="请选择角色" style="width: 100%">
            <ElOption label="系统管理员" :value="1" />
            <ElOption label="普通用户" :value="2" />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="roleDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleConfirmSetRole">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import type { Department, AdminUser, Role } from '@/types/api'
import {
  getDepartmentList,
  getUserList,
  addUser,
  updateUser,
  deleteUser,
  batchDeleteUsers,
  updateUserStatus,
  batchSetPosition,
  batchSetRole
} from '@/api/organization'

defineOptions({ name: 'OrganizationUser' })

// 部门树相关
const treeRef = ref()
const deptFilterText = ref('')
const departmentTree = ref<Department[]>([])
const selectedDeptId = ref<number>()

// 表格相关
const tableRef = ref()
const loading = ref(false)
const tableData = ref<AdminUser[]>([])
const selectedRows = ref<AdminUser[]>([])

// 筛选表单
const filterForm = reactive({
  keyword: '',
  status: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = computed(() => (isEditing.value ? '编辑用户' : '新增用户'))
const isEditing = ref(false)
const submitLoading = ref(false)

// 表单相关
const formRef = ref<FormInstance>()
const form = reactive<Partial<AdminUser>>({
  id: undefined,
  nickname: '',
  username: '',
  departmentId: undefined,
  position: '',
  phone: '',
  email: ''
})

const formRules: FormRules = {
  nickname: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  departmentId: [{ required: true, message: '请选择部门', trigger: 'change' }]
}

// 批量设置岗位对话框
const positionDialogVisible = ref(false)
const positionForm = reactive({
  position: ''
})

// 批量设置角色对话框
const roleDialogVisible = ref(false)
const roleForm = reactive({
  roleIds: [] as number[]
})

/**
 * 加载部门列表
 */
async function loadDepartmentList() {
  try {
    const res = await getDepartmentList()
    const deptList = res.data || []
    // 在顶部添加"全部"节点
    departmentTree.value = [
      { id: 0, name: '全部', children: [] } as Department,
      ...deptList
    ]
  } catch (error: any) {
    ElMessage.error(error.message || '加载部门列表失败')
  }
}

/**
 * 部门树筛选
 */
watch(deptFilterText, (val) => {
  treeRef.value?.filter(val)
})

const filterNode = (value: string, data: any) => {
  if (!value) return true
  return data.name.includes(value)
}

/**
 * 部门树节点点击
 */
function handleDeptClick(data: Department) {
  // 如果点击的是"全部"节点，清空部门筛选
  selectedDeptId.value = data.id === 0 ? undefined : data.id
  pagination.page = 1
  loadUserList()
}

/**
 * 加载用户列表
 */
async function loadUserList() {
  try {
    loading.value = true
    const res = await getUserList({
      keyword: filterForm.keyword,
      departmentId: selectedDeptId.value,
      status: filterForm.status,
      page: pagination.page,
      pageSize: pagination.pageSize
    })
    tableData.value = res.data.list || []
    pagination.total = res.data.total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '加载用户列表失败')
  } finally {
    loading.value = false
  }
}

/**
 * 搜索
 */
function handleSearch() {
  pagination.page = 1
  loadUserList()
}

/**
 * 分页变化
 */
function handleSizeChange() {
  pagination.page = 1
  loadUserList()
}

function handlePageChange() {
  loadUserList()
}

/**
 * 表格选择变化
 */
function handleSelectionChange(selection: AdminUser[]) {
  selectedRows.value = selection
}

/**
 * 获取角色名称
 */
function getRoleNames(roles?: Role[]): string {
  if (!roles || roles.length === 0) return '-'
  return roles.map((r) => r.name).join(', ')
}

/**
 * 新增用户
 */
function handleAdd() {
  isEditing.value = false
  dialogVisible.value = true
}

/**
 * 编辑用户
 */
function handleEdit(row: AdminUser) {
  isEditing.value = true
  dialogVisible.value = true
  Object.assign(form, {
    id: row.id,
    nickname: row.nickname,
    username: row.username,
    departmentId: row.departmentId,
    position: row.position,
    phone: row.phone,
    email: row.email
  })
}

/**
 * 删除用户
 */
async function handleDelete(row: AdminUser) {
  try {
    await ElMessageBox.confirm(`确定要删除用户"${row.nickname}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteUser(row.id!)
    ElMessage.success('删除成功')
    await loadUserList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

/**
 * 状态切换
 */
async function handleStatusChange(row: AdminUser) {
  try {
    await updateUserStatus(row.id!, row.status!)
    ElMessage.success('状态更新成功')
    await loadUserList()
  } catch (error: any) {
    ElMessage.error(error.message || '状态更新失败')
    // 恢复原状态
    row.status = row.status === 1 ? 0 : 1
  }
}

/**
 * 提交表单
 */
async function handleSubmit() {
  try {
    await formRef.value?.validate()
    submitLoading.value = true

    if (isEditing.value) {
      await updateUser(form.id!, form)
      ElMessage.success('更新成功')
    } else {
      await addUser(form)
      ElMessage.success('新增成功')
    }

    dialogVisible.value = false
    await loadUserList()
  } catch (error: any) {
    if (error !== false) {
      ElMessage.error(error.message || '操作失败')
    }
  } finally {
    submitLoading.value = false
  }
}

/**
 * 重置表单
 */
function resetForm() {
  formRef.value?.resetFields()
  Object.assign(form, {
    id: undefined,
    nickname: '',
    username: '',
    departmentId: undefined,
    position: '',
    phone: '',
    email: ''
  })
}

/**
 * 批量删除
 */
async function handleBatchDelete() {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个用户吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const ids = selectedRows.value.map((row) => row.id!)
    await batchDeleteUsers(ids)
    ElMessage.success('批量删除成功')
    await loadUserList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '批量删除失败')
    }
  }
}

/**
 * 批量设置岗位
 */
function handleBatchSetPosition() {
  positionDialogVisible.value = true
}

/**
 * 确认设置岗位
 */
async function handleConfirmSetPosition() {
  try {
    if (!positionForm.position) {
      ElMessage.warning('请输入岗位')
      return
    }

    const ids = selectedRows.value.map((row) => row.id!)
    await batchSetPosition(ids, positionForm.position)
    ElMessage.success('设置岗位成功')
    positionDialogVisible.value = false
    positionForm.position = ''
    await loadUserList()
  } catch (error: any) {
    ElMessage.error(error.message || '设置岗位失败')
  }
}

/**
 * 批量设置角色
 */
function handleBatchSetRole() {
  roleDialogVisible.value = true
}

/**
 * 确认设置角色
 */
async function handleConfirmSetRole() {
  try {
    if (roleForm.roleIds.length === 0) {
      ElMessage.warning('请选择角色')
      return
    }

    const ids = selectedRows.value.map((row) => row.id!)
    await batchSetRole(ids, roleForm.roleIds)
    ElMessage.success('设置角色成功')
    roleDialogVisible.value = false
    roleForm.roleIds = []
    await loadUserList()
  } catch (error: any) {
    ElMessage.error(error.message || '设置角色失败')
  }
}

/**
 * 导入
 */
function handleImport() {
  ElMessage.info('导入功能开发中')
}

/**
 * 导出
 */
function handleExport() {
  ElMessage.info('导出功能开发中')
}

// 初始化
onMounted(async () => {
  await loadDepartmentList()
  // 等待 DOM 更新后，默认选中"全部"节点
  await nextTick()
  treeRef.value?.setCurrentKey(0)
  loadUserList()
})

</script>

<style lang="scss" scoped>
.organization-user {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 140px);
  overflow: hidden;

  .user-layout {
    display: flex;
    gap: 16px;
    height: 100%;
    overflow: hidden;

    .dept-tree-card {
      width: 280px;
      flex-shrink: 0;
      border-radius: 12px;
      border: none !important;
      box-shadow: none !important;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      :deep(.el-card__body) {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        padding: 20px;
      }

      .tree-header {
        margin-bottom: 16px;

        .tree-title {
          font-size: 16px;
          font-weight: 500;
        }
      }

      .tree-search {
        margin-bottom: 16px;
      }

      .tree-container {
        flex: 1;
        overflow: hidden;
      }
    }

    .user-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .filter-card {
        border-radius: 12px;
        border: none !important;
        box-shadow: none !important;
        margin-bottom: 16px;
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
        border-radius: 12px;
        border: none !important;
        box-shadow: none !important;
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        :deep(.el-card__body) {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          padding: 20px;
        }

        .table-header {
          display: flex;
          margin-bottom: 16px;
          flex-shrink: 0;

          .el-button:not(:first-child) {
            margin-left: 12px;
          }
        }

        .table-container {
          flex: 1;
          overflow: auto;
        }

        .pagination-container {
          display: flex;
          justify-content: flex-end;
          margin-top: 16px;
          flex-shrink: 0;
        }
      }
    }
  }
}
</style>
