<template>
  <el-dialog v-model="visible" title="关联问题清单" width="1200px" @close="handleClose">
    <!-- 筛选区域 -->
    <el-form :model="queryParams" inline class="filter-form">
      <el-form-item label="问题标题">
        <el-input
          v-model="queryParams.problemTitle"
          placeholder="请输入问题标题"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="问题类别">
        <el-select
          v-model="queryParams.problemCategory"
          placeholder="请选择问题类别"
          clearable
          style="width: 150px"
        >
          <el-option label="财务管理" value="财务管理" />
          <el-option label="内部控制" value="内部控制" />
          <el-option label="资产管理" value="资产管理" />
        </el-select>
      </el-form-item>
      <el-form-item label="整改状态">
        <el-select
          v-model="queryParams.rectificationStatus"
          placeholder="请选择整改状态"
          clearable
          style="width: 150px"
        >
          <el-option label="未整改" :value="1" />
          <el-option label="整改中" :value="2" />
          <el-option label="已整改" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格区域 -->
    <div class="table-wrapper">
      <!-- 批注徽章：覆盖在复选框列上方，点击弹出说明面板 -->
      <span class="annotation-badge" @click="annotationPanelVisible = !annotationPanelVisible"
        >1</span
      >
      <el-table
        ref="tableRef"
        :data="tableData"
        height="500px"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <!-- 已关联的问题禁用复选框，避免重复关联 -->
        <el-table-column
          type="selection"
          width="55"
          :reserve-selection="true"
          :selectable="isSelectable"
        />
        <el-table-column
          prop="problemTitle"
          label="问题标题"
          min-width="250"
          show-overflow-tooltip
        />
        <el-table-column prop="problemCategory" label="问题类别" width="120" align="center" />
        <el-table-column prop="belongUnit" label="问题归属单位" width="180" show-overflow-tooltip />
        <el-table-column prop="involvedAmount" label="涉及金额(元)" width="160" align="right">
          <template #default="{ row }">
            {{ (row.involvedAmount * 10000).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="rectificationStatus" label="整改状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.rectificationStatus === 1" type="danger" size="small">未整改</el-tag>
            <el-tag v-else-if="row.rectificationStatus === 2" type="warning" size="small"
              >整改中</el-tag
            >
            <el-tag v-else type="success" size="small">已整改</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="queryParams.page"
      v-model:page-size="queryParams.pageSize"
      :total="total"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next"
      @size-change="fetchData"
      @current-change="fetchData"
      class="pagination"
    />

    <template #footer>
      <div class="dialog-footer">
        <span class="selected-info">已选择 {{ selectedProblems.length }} 个问题</span>
        <div>
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleConfirm">确定</el-button>
        </div>
      </div>
    </template>

    <!-- 批注详情面板：与列表批注一致的可拖动/可调整大小面板 -->
    <Teleport to="body">
      <AnnotationPanel
        v-if="annotationPanelVisible"
        :annotation="duplicateTipAnnotation"
        :index="0"
        :edit-mode="false"
        @close="annotationPanelVisible = false"
      />
    </Teleport>
  </el-dialog>
</template>

<script setup lang="ts">
  /**
   * 关联问题清单选择弹窗组件
   * 支持多选问题、筛选查询、分页
   */
  import { ref, reactive, watch } from 'vue'
  import { ElMessage, type ElTable } from 'element-plus'
  import type { RelatedProblem, RelatedProblemQuery } from '@/types/audit-decision'
  import { getAvailableProblems } from '@/api/audit-decision'
  import AnnotationPanel from '@/components/Annotation/AnnotationPanel.vue'
  import type { AnnotationItem } from '@/components/Annotation/types'

  // 批注详情面板
  const annotationPanelVisible = ref(false)
  const duplicateTipAnnotation: AnnotationItem = {
    id: 'duplicate-tip',
    type: 'position',
    selector: '',
    position: { x: 0, y: 0 },
    title: '关联问题选择规则',
    content: '同一个决定信息中，已关联的问题不能重复关联。已被关联的问题复选框显示为禁用状态。',
    category: 'rule',
    source: '',
    createdAt: '2026-05-28'
  }

  // Props
  interface Props {
    modelValue: boolean
    selectedIds?: number[]
  }

  const props = withDefaults(defineProps<Props>(), {
    selectedIds: () => []
  })

  // Emits
  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    confirm: [problems: RelatedProblem[]]
  }>()

  // 弹窗显示状态
  const visible = ref(false)

  // 查询参数
  const queryParams = reactive<RelatedProblemQuery>({
    problemTitle: '',
    problemCategory: null,
    belongUnit: null,
    rectificationStatus: null,
    page: 1,
    pageSize: 20
  })

  // 表格数据
  const tableData = ref<RelatedProblem[]>([])
  const total = ref(0)
  const loading = ref(false)
  const tableRef = ref<InstanceType<typeof ElTable>>()

  // 已选择的问题
  const selectedProblems = ref<RelatedProblem[]>([])

  // 监听 modelValue 变化
  watch(
    () => props.modelValue,
    (val) => {
      visible.value = val
      if (val) {
        // 打开弹窗时重置并加载数据
        handleReset()
        fetchData()
      }
    },
    { immediate: true }
  )

  // 监听 visible 变化
  watch(visible, (val) => {
    emit('update:modelValue', val)
  })

  // 获取列表数据
  const fetchData = async () => {
    loading.value = true
    try {
      const res = await getAvailableProblems(queryParams)
      tableData.value = res.data.list
      total.value = res.data.total
    } catch {
      ElMessage.error('获取数据失败')
    } finally {
      loading.value = false
    }
  }

  // 已关联的问题不可再次关联（禁用复选框）
  const isSelectable = (row: RelatedProblem) => !props.selectedIds.includes(row.id)

  // 查询
  const handleQuery = () => {
    queryParams.page = 1
    fetchData()
  }

  // 重置
  const handleReset = () => {
    queryParams.problemTitle = ''
    queryParams.problemCategory = null
    queryParams.belongUnit = null
    queryParams.rectificationStatus = null
    queryParams.page = 1
    fetchData()
  }

  // 选择变化
  const handleSelectionChange = (selection: RelatedProblem[]) => {
    selectedProblems.value = selection
  }

  // 确定
  const handleConfirm = () => {
    if (selectedProblems.value.length === 0) {
      ElMessage.warning('请至少选择一个问题')
      return
    }
    emit('confirm', selectedProblems.value)
    handleClose()
  }

  // 关闭
  const handleClose = () => {
    visible.value = false
    // 清空选择
    tableRef.value?.clearSelection()
    selectedProblems.value = []
  }
</script>

<style scoped lang="scss">
  .filter-form {
    margin-bottom: 16px;
  }

  /* 表格容器：作为批注徽章的定位参考 */
  .table-wrapper {
    position: relative;
  }

  /* 批注徽章：覆盖在复选框列表头上方 */
  .annotation-badge {
    position: absolute;
    top: -10px;
    left: 18px;
    z-index: 10;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    font-size: 11px;
    font-weight: 600;
    line-height: 1;
    color: #fff;
    cursor: pointer;
    user-select: none;
    background: #1677ff;
    border-radius: 50%;
    box-shadow: 0 2px 6px rgb(22 119 255 / 40%);
  }

  .annotation-badge:hover {
    transform: scale(1.1);
  }

  .pagination {
    justify-content: flex-end;
    margin-top: 16px;
  }

  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .selected-info {
      font-size: 14px;
      color: #606266;
    }
  }
</style>
