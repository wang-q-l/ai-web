<template>
  <!-- 可调整问题多选弹窗：同一申请单只能选同一项目的问题，进展审核中/在途调整的问题置灰不可选 -->
  <el-dialog
    :model-value="modelValue"
    title="选择需调整的问题"
    width="70%"
    @update:model-value="(v: boolean) => emit('update:modelValue', v)"
    @open="handleOpen"
  >
    <!-- 筛选条 -->
    <div class="selector-filter problem-selector-filter">
      <el-input v-model="keyword" placeholder="问题编号 / 标题" clearable style="width: 220px" />
      <el-select v-model="filterProjectId" placeholder="所属项目" clearable style="width: 220px">
        <el-option v-for="p in projectOptions" :key="p.id" :label="p.name" :value="p.id" />
      </el-select>
    </div>

    <!-- 提示条：同一申请单只能选同一项目 -->
    <div class="selector-tip">
      <el-icon><InfoFilled /></el-icon>
      <span>进展审核中、已有在途调整单的问题不可选；一个申请单只能选择同一个项目的问题。</span>
    </div>

    <!-- 问题表格（多选） -->
    <el-table
      ref="tableRef"
      :data="filteredList"
      v-loading="loading"
      height="460"
      row-key="problemId"
      @select="handleSelect"
      @select-all="handleSelectAll"
    >
      <el-table-column type="selection" :selectable="rowSelectable" width="50" />
      <el-table-column prop="problemCode" label="问题编号" width="130" />
      <el-table-column prop="problemTitle" label="问题标题" min-width="200" show-overflow-tooltip />
      <el-table-column prop="projectName" label="所属项目" min-width="160" show-overflow-tooltip />
      <el-table-column prop="originalDeadline" label="当前整改期限" width="120" />
      <el-table-column label="状态" width="160">
        <template #default="{ row }">
          <el-tag v-if="!row.disabled" type="warning" size="small">正在整改</el-tag>
          <el-tooltip v-else :content="row.disabledReason" placement="top">
            <el-tag type="info" size="small">不可选</el-tag>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <div class="selector-footer">
        <span class="selected-count">已选 {{ selectedRows.length }} 个问题</span>
        <div>
          <el-button @click="emit('update:modelValue', false)">取消</el-button>
          <el-button type="primary" :disabled="!selectedRows.length" @click="handleConfirm">
            确定
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  /**
   * 可调整问题选择弹窗
   * 同一申请单只能选同一项目的问题：选定首个问题后锁定项目，其他项目问题不可选
   */
  import { ref, computed } from 'vue'
  import { ElMessage, ElTable } from 'element-plus'
  import { InfoFilled } from '@element-plus/icons-vue'
  import { getAdjustableProblems } from '@/api/audit-decision'

  // 可调整问题项结构
  interface AdjustableProblem {
    problemId: number
    problemCode: string
    problemTitle: string
    projectId: number
    projectName: string
    originalDeadline: string
    delayTimes: number
    hasProgress: boolean
    originalPlan: { id: number; measure: string; responsible: string; planFinishDate: string }[]
    originalProgressBrief: string
    disabled: boolean
    disabledReason: string
  }

  const props = defineProps<{
    modelValue: boolean
    // 已选中的问题ID（用于回显，避免重复选）
    existingProblemIds?: number[]
    // 已锁定的项目ID（申请单已有明细时传入，限制只能选该项目）
    lockedProjectId?: number | null
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    confirm: [problems: AdjustableProblem[]]
  }>()

  const tableRef = ref<InstanceType<typeof ElTable>>()
  const loading = ref(false)
  const keyword = ref('')
  const filterProjectId = ref<number | null>(null)
  const rawList = ref<AdjustableProblem[]>([])
  const selectedRows = ref<AdjustableProblem[]>([])

  // 项目下拉选项（从问题列表去重生成）
  const projectOptions = computed(() => {
    const map = new Map<number, string>()
    rawList.value.forEach((p) => map.set(p.projectId, p.projectName))
    return Array.from(map, ([id, name]) => ({ id, name }))
  })

  // 关键词 + 项目筛选后的列表（按项目分组排在一起，同项目内按问题编号排序）
  const filteredList = computed(() => {
    return rawList.value
      .filter((p) => {
        const kw = keyword.value.trim()
        const matchKw = !kw || p.problemCode.includes(kw) || p.problemTitle.includes(kw)
        const matchProject = !filterProjectId.value || p.projectId === filterProjectId.value
        return matchKw && matchProject
      })
      .sort((a, b) => {
        // 先按项目ID聚合，同项目再按问题编号排序
        if (a.projectId !== b.projectId) return a.projectId - b.projectId
        return a.problemCode.localeCompare(b.problemCode)
      })
  })

  // 当前生效的锁定项目：优先取父级传入，其次取弹窗内已勾选问题的项目
  const activeProjectId = computed<number | null>(() => {
    if (props.lockedProjectId != null) return props.lockedProjectId
    return selectedRows.value.length ? selectedRows.value[0].projectId : null
  })

  // 行是否可选：不可选项、已存在于申请单的问题、非锁定项目的问题均禁选
  const rowSelectable = (row: AdjustableProblem) => {
    if (row.disabled) return false
    if ((props.existingProblemIds || []).includes(row.problemId)) return false
    // 已锁定项目时，仅允许同项目问题
    if (activeProjectId.value != null && row.projectId !== activeProjectId.value) return false
    return true
  }

  // 打开弹窗时加载数据
  const handleOpen = async () => {
    loading.value = true
    selectedRows.value = []
    try {
      const res = await getAdjustableProblems()
      rawList.value = res.data.list as AdjustableProblem[]
    } catch {
      ElMessage.error('获取可调整问题失败')
    } finally {
      loading.value = false
    }
  }

  // 勾选单行
  const handleSelect = (selection: AdjustableProblem[]) => {
    selectedRows.value = selection
  }

  // 全选
  const handleSelectAll = (selection: AdjustableProblem[]) => {
    selectedRows.value = selection
  }

  // 确认选择
  const handleConfirm = () => {
    emit('confirm', selectedRows.value)
    emit('update:modelValue', false)
  }
</script>

<style scoped lang="scss">
  /* 筛选条 */
  .selector-filter {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
  }

  /* 蓝色提示条 */
  .selector-tip {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 8px 12px;
    margin-bottom: 12px;
    font-size: 13px;
    color: #606266;
    background: #eaf2ff;
    border-radius: 8px;

    .el-icon {
      color: #409eff;
    }
  }

  /* 底部栏：已选计数 + 操作 */
  .selector-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .selected-count {
      font-size: 13px;
      color: #909399;
    }
  }
</style>
