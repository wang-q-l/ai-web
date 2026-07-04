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
        :row-class-name="rowClassName"
      >
        <!-- 勾选列与序号列合并：默认显示序号，行 hover 或已勾选时显示勾选框 -->
        <el-table-column label="序号" width="80" align="center">
          <template #header>
            <el-checkbox
              :model-value="allChecked"
              :indeterminate="isIndeterminate"
              @change="handleCheckAll"
            />
          </template>
          <template #default="{ row, $index }">
            <div class="seq-cell">
              <span class="seq-num">{{
                (queryParams.page - 1) * queryParams.pageSize + $index + 1
              }}</span>
              <el-checkbox
                class="seq-check"
                :model-value="checkedIds.includes(row.id)"
                :disabled="!isSelectable(row)"
                @change="(val) => handleCheckRow(row.id, !!val)"
              />
            </div>
          </template>
        </el-table-column>
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
  import { ref, reactive, computed, watch } from 'vue'
  import { ElMessage } from 'element-plus'
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
  const tableRef = ref()

  // 已勾选的行ID（勾选列与序号列合并，自行管理选中态；内部命名 checkedIds 以区分同名 prop）
  const checkedIds = ref<(number | string)[]>([])

  // 已选择的问题（供确认操作使用）
  const selectedProblems = computed(() =>
    tableData.value.filter((item) => checkedIds.value.includes(item.id))
  )

  // 全选态：当前页全部可选行全部勾选时为 true
  const allChecked = computed(
    () => tableData.value.length > 0 && checkedIds.value.length === tableData.value.length
  )
  // 半选态：部分勾选
  const isIndeterminate = computed(
    () => checkedIds.value.length > 0 && checkedIds.value.length < tableData.value.length
  )

  // 表头全选/取消全选
  const handleCheckAll = (val: boolean | string | number) => {
    checkedIds.value = val ? tableData.value.map((item) => item.id) : []
  }

  // 单行勾选/取消
  const handleCheckRow = (id: number | string, val: boolean) => {
    if (val) {
      if (!checkedIds.value.includes(id)) checkedIds.value.push(id)
    } else {
      checkedIds.value = checkedIds.value.filter((item) => item !== id)
    }
  }

  // 已勾选的行加类名，使其序号列常驻显示勾选框
  const rowClassName = ({ row }: { row: RelatedProblem }) => {
    return checkedIds.value.includes(row.id) ? 'row-checked' : ''
  }

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
      // 切换分页时清空选中态
      checkedIds.value = []
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
    checkedIds.value = []
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

  /* 勾选框 / 序号 合并单元格：默认显示序号，hover 行或已勾选时显示勾选框 */
  .seq-cell {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;

    .seq-num {
      color: #606266;
    }

    /* 勾选框默认覆盖在序号位置但隐藏 */
    .seq-check {
      position: absolute;
      display: none;
      height: auto;
    }
  }

  /* 行 hover 或已勾选：隐藏序号，显示勾选框 */
  :deep(.el-table__row:hover) .seq-cell,
  :deep(.el-table__row.row-checked) .seq-cell {
    .seq-num {
      display: none;
    }

    .seq-check {
      display: inline-flex;
    }
  }
</style>
