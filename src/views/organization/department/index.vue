<template>
  <div class="organization-department">
    <!-- 筛选卡片 -->
    <ElCard shadow="never" class="filter-card">
      <ElForm :inline="true" :model="filterForm" class="filter-form">
        <ElFormItem label="部门名称">
          <ElInput
            v-model="filterForm.name"
            placeholder="输入部门名称"
            clearable
            style="width: 200px"
          />
        </ElFormItem>
        <ElFormItem label="部门状态">
          <ElSelect v-model="filterForm.status" placeholder="请选择" clearable style="width: 150px">
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
        <ElButton type="primary" :icon="Plus" @click="handleAdd()">新增</ElButton>
        <ElButton @click="toggleExpand">{{ isExpanded ? '折叠' : '展开' }}</ElButton>
      </div>

      <div class="table-container">
        <ElTable
          ref="tableRef"
          v-loading="loading"
          :data="tableData"
          row-key="id"
          :tree-props="{ children: 'children' }"
          :default-expand-all="isExpanded"
          height="100%"
          style="width: 100%"
        >
          <ElTableColumn prop="name" label="部门名称" min-width="200" />
          <ElTableColumn prop="type" label="类型" width="100" align="center">
            <template #default="{ row }">
              <el-tag
                v-if="row.type"
                :type="typeTagMap[row.type]?.tagType"
                size="small"
                disable-transitions
              >{{ row.type }}</el-tag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="leader" label="负责人" width="120" />
          <ElTableColumn prop="sort" label="排序" width="100" align="center" />
          <ElTableColumn prop="updateTime" label="更新时间" width="180" />
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
          <ElTableColumn label="操作" width="200" align="center" fixed="right">
            <template #default="{ row }">
              <ElButton link type="primary" @click="handleAdd(row.id)">新增</ElButton>
              <ElButton link type="primary" @click="handleEdit(row)">编辑</ElButton>
              <ElButton link type="danger" @click="handleDelete(row)">删除</ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </ElCard>

    <!-- 新增/编辑对话框 -->
    <ElDialog v-model="dialogVisible" :title="dialogTitle" width="600px" @closed="resetForm">
      <ElForm ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <ElFormItem label="部门名称" prop="name">
          <ElInput v-model="form.name" placeholder="请输入部门名称" />
        </ElFormItem>
        <ElFormItem label="上级部门">
          <ElTreeSelect
            v-model="form.parentId"
            :data="departmentTreeOptions"
            :props="{ label: 'name' }"
            node-key="id"
            placeholder="请选择上级部门"
            clearable
            check-strictly
            :render-after-expand="false"
            style="width: 100%"
          />
        </ElFormItem>
        <ElFormItem label="部门类型" prop="type">
          <ElSelect v-model="form.type" placeholder="请选择部门类型" style="width: 100%">
            <ElOption label="省公司" value="province" />
            <ElOption label="分公司" value="branch" />
            <ElOption label="部门" value="department" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="负责人">
          <ElInput v-model="form.leader" placeholder="请输入负责人" />
        </ElFormItem>
        <ElFormItem label="联系电话">
          <ElInput v-model="form.phone" placeholder="请输入联系电话" />
        </ElFormItem>
        <ElFormItem label="排序">
          <ElInputNumber v-model="form.sort" :min="0" :max="9999" style="width: 100%" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitLoading" @click="handleSubmit"> 确定 </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue'
  import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
  import { Search, Plus } from '@element-plus/icons-vue'
  import type { Department } from '@/types/api'
  import {
    getDepartmentList,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    updateDepartmentStatus
  } from '@/api/organization'

  defineOptions({ name: 'OrganizationDepartment' })

  const typeTagMap: Record<string, { tagType: 'primary' | 'success' | 'info' | 'warning' | 'danger' }> = {
    省公司: { tagType: 'danger' },
    分公司: { tagType: 'warning' },
    片区: { tagType: 'primary' },
    加能站: { tagType: 'success' }
  }

  // 表格相关
  const tableRef = ref()
  const loading = ref(false)
  const tableData = ref<Department[]>([])
  const isExpanded = ref(true)

  // 筛选表单
  const filterForm = reactive({
    name: '',
    status: ''
  })

  // 对话框相关
  const dialogVisible = ref(false)
  const dialogTitle = computed(() => (isEditing.value ? '编辑部门' : '新增部门'))
  const isEditing = ref(false)
  const submitLoading = ref(false)

  // 表单相关
  const formRef = ref<FormInstance>()
  const form = reactive<Partial<Department>>({
    id: undefined,
    name: '',
    parentId: null,
    type: undefined,
    leader: '',
    phone: '',
    sort: 0
  })

  const formRules: FormRules = {
    name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
    type: [{ required: true, message: '请选择部门类型', trigger: 'change' }]
  }

  // 部门树形选项（用于上级部门选择）
  const departmentTreeOptions = computed(() => {
    // 如果是编辑模式，需要过滤掉当前部门及其子部门
    if (isEditing.value && form.id) {
      return filterCurrentDepartment(tableData.value, form.id)
    }
    return tableData.value
  })

  /**
   * 过滤掉当前部门及其子部门（避免选择自己作为上级）
   */
  function filterCurrentDepartment(departments: Department[], currentId: number): Department[] {
    return departments
      .filter((dept) => dept.id !== currentId)
      .map((dept) => ({
        ...dept,
        children: dept.children ? filterCurrentDepartment(dept.children, currentId) : []
      }))
  }

  /**
   * 加载部门列表
   */
  async function loadDepartmentList() {
    try {
      loading.value = true
      const res = await getDepartmentList(filterForm)
      tableData.value = res.data || []
    } catch (error: any) {
      ElMessage.error(error.message || '加载部门列表失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 搜索
   */
  function handleSearch() {
    loadDepartmentList()
  }

  /**
   * 展开/折叠
   */
  function toggleExpand() {
    isExpanded.value = !isExpanded.value
  }

  /**
   * 新增部门
   * @param parentId 上级部门ID（从行内点击新增时传入）
   */
  function handleAdd(parentId?: number) {
    isEditing.value = false
    dialogVisible.value = true
    if (parentId) {
      form.parentId = parentId
    }
  }

  /**
   * 编辑部门
   */
  function handleEdit(row: Department) {
    isEditing.value = true
    dialogVisible.value = true
    Object.assign(form, {
      id: row.id,
      name: row.name,
      parentId: row.parentId,
      type: row.type,
      leader: row.leader,
      phone: row.phone,
      sort: row.sort
    })
  }

  /**
   * 删除部门
   */
  async function handleDelete(row: Department) {
    try {
      await ElMessageBox.confirm(`确定要删除部门"${row.name}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await deleteDepartment(row.id!)
      ElMessage.success('删除成功')
      await loadDepartmentList()
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error(error.message || '删除失败')
      }
    }
  }

  /**
   * 状态切换
   */
  async function handleStatusChange(row: Department) {
    try {
      await updateDepartmentStatus(row.id!, row.status!)
      ElMessage.success('状态更新成功')
      await loadDepartmentList()
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
        await updateDepartment(form.id!, form)
        ElMessage.success('更新成功')
      } else {
        await addDepartment(form)
        ElMessage.success('新增成功')
      }

      dialogVisible.value = false
      await loadDepartmentList()
    } catch (error: any) {
      if (error !== false) {
        // 不是表单验证错误
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
      name: '',
      parentId: null,
      type: undefined,
      leader: '',
      phone: '',
      sort: 0
    })
  }

  // 初始化
  onMounted(() => {
    loadDepartmentList()
  })
</script>

<style lang="scss" scoped>
  .organization-department {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 140px); // 减去顶部导航和标签页的高度
    overflow: hidden;

    .page-title {
      margin: 20px 0 15px;
      font-size: 22px;
      font-weight: 500;
    }

    .filter-card {
      border-radius: 12px;
      border: none !important;
      box-shadow: none !important;
      margin-bottom: 16px;
      flex-shrink: 0; // 不允许压缩

      :deep(.el-card__body) {
        padding: 12px 20px; // 减少上下内边距
      }
    }

    .table-card {
      border-radius: 12px;
      border: none !important;
      box-shadow: none !important;
      flex: 1; // 占据剩余空间
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
    }

    .filter-form {
      margin-bottom: 0;
      display: flex;
      align-items: center; // 垂直居中

      :deep(.el-form-item) {
        margin-bottom: 0; // 移除表单项的底部边距
      }
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
  }
</style>
