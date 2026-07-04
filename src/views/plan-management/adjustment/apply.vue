<script setup lang="ts">
  // 申请调整页面：新增计划调整申请
  import { ref, reactive, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { ArrowLeft, Close, Finished, Upload, Document } from '@element-plus/icons-vue'

  const router = useRouter()

  // ==================== 表单数据 ====================
  const today = new Date()
  const defaultTitle = `${today.getFullYear()}年${String(today.getMonth() + 1).padStart(2, '0')}月${String(today.getDate()).padStart(2, '0')}日ZY股份申请调整`

  const form = reactive({
    name: defaultTitle,
    year: String(today.getFullYear()), // 默认回显当前年度
    remark: ''
  })

  const yearOptions = [
    { label: '2026年', value: '2026' },
    { label: '2025年', value: '2025' },
    { label: '2024年', value: '2024' },
    { label: '2023年', value: '2023' }
  ]

  // ==================== 三个子表格：调增、调减、要素调整 ====================
  interface AdjustItem {
    id: string
    code: string
    name: string
    version: string
    year: string
    auditedUnit: string
    auditTarget: string
    orgForm: string
    auditOrg: string
  }

  const increaseList = ref<AdjustItem[]>([])
  const decreaseList = ref<AdjustItem[]>([])
  const elementList = ref<AdjustItem[]>([])

  // ==================== 勾选状态：三个表格各自独立管理 ====================

  // 调增表格勾选
  const selectedIds1 = ref<(number | string)[]>([])
  const allChecked1 = computed(
    () => increaseList.value.length > 0 && selectedIds1.value.length === increaseList.value.length
  )
  const isIndeterminate1 = computed(
    () => selectedIds1.value.length > 0 && selectedIds1.value.length < increaseList.value.length
  )
  const handleCheckAll1 = (val: boolean | string | number) => {
    selectedIds1.value = val ? increaseList.value.map((item) => item.id) : []
  }
  const handleCheckRow1 = (id: number | string, val: boolean) => {
    if (val) {
      if (!selectedIds1.value.includes(id)) selectedIds1.value.push(id)
    } else {
      selectedIds1.value = selectedIds1.value.filter((item) => item !== id)
    }
  }
  const rowClassName1 = ({ row }: { row: AdjustItem }) => {
    return selectedIds1.value.includes(row.id) ? 'row-checked' : ''
  }

  // 调减表格勾选
  const selectedIds2 = ref<(number | string)[]>([])
  const allChecked2 = computed(
    () => decreaseList.value.length > 0 && selectedIds2.value.length === decreaseList.value.length
  )
  const isIndeterminate2 = computed(
    () => selectedIds2.value.length > 0 && selectedIds2.value.length < decreaseList.value.length
  )
  const handleCheckAll2 = (val: boolean | string | number) => {
    selectedIds2.value = val ? decreaseList.value.map((item) => item.id) : []
  }
  const handleCheckRow2 = (id: number | string, val: boolean) => {
    if (val) {
      if (!selectedIds2.value.includes(id)) selectedIds2.value.push(id)
    } else {
      selectedIds2.value = selectedIds2.value.filter((item) => item !== id)
    }
  }
  const rowClassName2 = ({ row }: { row: AdjustItem }) => {
    return selectedIds2.value.includes(row.id) ? 'row-checked' : ''
  }

  // 要素调整表格勾选
  const selectedIds3 = ref<(number | string)[]>([])
  const allChecked3 = computed(
    () => elementList.value.length > 0 && selectedIds3.value.length === elementList.value.length
  )
  const isIndeterminate3 = computed(
    () => selectedIds3.value.length > 0 && selectedIds3.value.length < elementList.value.length
  )
  const handleCheckAll3 = (val: boolean | string | number) => {
    selectedIds3.value = val ? elementList.value.map((item) => item.id) : []
  }
  const handleCheckRow3 = (id: number | string, val: boolean) => {
    if (val) {
      if (!selectedIds3.value.includes(id)) selectedIds3.value.push(id)
    } else {
      selectedIds3.value = selectedIds3.value.filter((item) => item !== id)
    }
  }
  const rowClassName3 = ({ row }: { row: AdjustItem }) => {
    return selectedIds3.value.includes(row.id) ? 'row-checked' : ''
  }

  // ==================== 操作 ====================
  const handleBack = async () => {
    try {
      await ElMessageBox.confirm('确定要离开吗？未保存的内容将丢失。', '提示', {
        type: 'warning',
        confirmButtonText: '确定离开',
        cancelButtonText: '取消'
      })
      router.back()
    } catch {
      // 用户取消
    }
  }

  const handleCancel = () => handleBack()

  const handleSave = () => {
    ElMessage.success('暂存成功')
  }

  const handleSubmit = () => {
    if (!form.name.trim()) {
      ElMessage.warning('请输入调整名称')
      return
    }
    if (!form.year) {
      ElMessage.warning('请选择调整年度')
      return
    }
    ElMessage.success('提交成功')
    router.back()
  }

  const handleUploadFile = () => {
    ElMessage.info('上传文件功能开发中')
  }

  const handleViewFiles = () => {
    ElMessage.info('查看文件功能开发中')
  }

  // 调增项目操作
  const handleIncreaseAdd = () => ElMessage.info('新增调增项目（功能开发中）')
  const handleIncreaseExport = () => ElMessage.info('移出调增项目（功能开发中）')
  const handleIncreaseDelete = (row: AdjustItem) => {
    increaseList.value = increaseList.value.filter((i) => i.id !== row.id)
  }

  // 调减项目操作
  const handleDecreaseSelect = () => ElMessage.info('选择调减项目（功能开发中）')
  const handleDecreaseExport = () => ElMessage.info('移出调减项目（功能开发中）')
  const handleDecreaseDelete = (row: AdjustItem) => {
    decreaseList.value = decreaseList.value.filter((i) => i.id !== row.id)
  }

  // 要素调整操作
  const handleElementSelect = () => ElMessage.info('选择要素调整项目（功能开发中）')
  const handleElementExport = () => ElMessage.info('移出要素调整项目（功能开发中）')
  const handleElementDelete = (row: AdjustItem) => {
    elementList.value = elementList.value.filter((i) => i.id !== row.id)
  }
</script>

<template>
  <div class="apply-page">
    <!-- 标题卡：返回箭头 + 页面名称，右侧操作按钮 -->
    <el-card class="header-card" shadow="never">
      <div class="header-inner">
        <div class="header-left">
          <el-icon class="back-icon" @click="handleBack"><ArrowLeft /></el-icon>
          <span class="page-title">申请调整</span>
        </div>
        <div class="header-actions">
          <el-button :icon="Close" @click="handleCancel">取消</el-button>
          <el-button :icon="Finished" @click="handleSave">暂存</el-button>
          <el-button type="primary" :icon="Finished" @click="handleSubmit">提交</el-button>
        </div>
      </div>
    </el-card>

    <!-- 内容卡：表单 + 三个子表格 -->
    <el-card class="body-card" shadow="never">
      <el-scrollbar>
        <!-- 基本信息表单 -->
        <div class="form-section">
          <el-form :model="form" label-width="80px" class="base-form">
            <el-row :gutter="24">
              <!-- 调整名称 -->
              <el-col :span="10">
                <el-form-item label="调整名称" required>
                  <el-input v-model="form.name" placeholder="请输入调整名称" clearable />
                </el-form-item>
              </el-col>

              <!-- 调整年度 -->
              <el-col :span="6">
                <el-form-item label="调整年度" required>
                  <el-select v-model="form.year" placeholder="请选择" style="width: 100%">
                    <el-option
                      v-for="opt in yearOptions"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>

              <!-- 批注说明 -->
              <el-col :span="8">
                <el-form-item label="附件">
                  <div class="attachment-actions">
                    <el-button class="btn-gray" :icon="Upload" @click="handleUploadFile"
                      >上传文件</el-button
                    >
                    <el-button class="btn-gray" :icon="Document" @click="handleViewFiles"
                      >查看文件 (0)</el-button
                    >
                  </div>
                </el-form-item>
              </el-col>

              <!-- 调整说明 -->
              <el-col :span="24">
                <el-form-item label="调整说明">
                  <el-input
                    v-model="form.remark"
                    type="textarea"
                    :rows="2"
                    :maxlength="1000"
                    show-word-limit
                    placeholder="请输入调整说明"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>

        <!-- 调增项目 -->
        <div class="sub-table-section">
          <div class="sub-table-header">
            <div class="sub-table-title-row">
              <span class="sub-table-label">调增项目</span>
              <div class="sub-table-actions">
                <el-button type="primary" size="small" @click="handleIncreaseAdd">新增</el-button>
                <el-button size="small" @click="handleIncreaseExport">移出</el-button>
              </div>
            </div>
            <span class="sub-table-count">{{ increaseList.length }} 条数据</span>
          </div>
          <el-table :data="increaseList" border style="width: 100%" :row-class-name="rowClassName1">
            <!-- 勾选列与序号列合并：默认显示序号，行 hover 或已勾选时显示勾选框 -->
            <el-table-column label="序号" width="80" align="center">
              <template #header>
                <el-checkbox
                  :model-value="allChecked1"
                  :indeterminate="isIndeterminate1"
                  @change="handleCheckAll1"
                />
              </template>
              <template #default="{ row, $index }">
                <div class="seq-cell">
                  <span class="seq-num">{{ $index + 1 }}</span>
                  <el-checkbox
                    class="seq-check"
                    :model-value="selectedIds1.includes(row.id)"
                    @change="(val) => handleCheckRow1(row.id, !!val)"
                  />
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="code" label="编号" width="120" />
            <el-table-column prop="name" label="审计项目名称" min-width="180" />
            <el-table-column prop="version" label="版本" width="80" align="center" />
            <el-table-column prop="year" label="年度" width="80" align="center" />
            <el-table-column prop="auditedUnit" label="被审计单位" min-width="140" />
            <el-table-column prop="auditTarget" label="审计对象" min-width="120" />
            <el-table-column prop="orgForm" label="组织形式" width="100" align="center" />
            <el-table-column prop="auditOrg" label="审计实施机构" min-width="140" />
            <el-table-column label="操作" width="80" align="center" fixed="right">
              <template #default="{ row }">
                <el-button type="danger" link size="small" @click="handleIncreaseDelete(row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 调减项目 -->
        <div class="sub-table-section">
          <div class="sub-table-header">
            <div class="sub-table-title-row">
              <span class="sub-table-label">调减项目</span>
              <div class="sub-table-actions">
                <el-button type="primary" size="small" @click="handleDecreaseSelect"
                  >选择</el-button
                >
                <el-button size="small" @click="handleDecreaseExport">移出</el-button>
              </div>
            </div>
            <span class="sub-table-count">{{ decreaseList.length }} 条数据</span>
          </div>
          <el-table :data="decreaseList" border style="width: 100%" :row-class-name="rowClassName2">
            <!-- 勾选列与序号列合并：默认显示序号，行 hover 或已勾选时显示勾选框 -->
            <el-table-column label="序号" width="80" align="center">
              <template #header>
                <el-checkbox
                  :model-value="allChecked2"
                  :indeterminate="isIndeterminate2"
                  @change="handleCheckAll2"
                />
              </template>
              <template #default="{ row, $index }">
                <div class="seq-cell">
                  <span class="seq-num">{{ $index + 1 }}</span>
                  <el-checkbox
                    class="seq-check"
                    :model-value="selectedIds2.includes(row.id)"
                    @change="(val) => handleCheckRow2(row.id, !!val)"
                  />
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="code" label="编号" width="120" />
            <el-table-column prop="name" label="审计项目名称" min-width="180" />
            <el-table-column prop="version" label="版本" width="80" align="center" />
            <el-table-column prop="year" label="年度" width="80" align="center" />
            <el-table-column prop="auditedUnit" label="被审计单位" min-width="140" />
            <el-table-column prop="auditTarget" label="审计对象" min-width="120" />
            <el-table-column prop="orgForm" label="组织形式" width="100" align="center" />
            <el-table-column prop="auditOrg" label="审计实施机构" min-width="140" />
            <el-table-column label="操作" width="80" align="center" fixed="right">
              <template #default="{ row }">
                <el-button type="danger" link size="small" @click="handleDecreaseDelete(row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 要素调整 -->
        <div class="sub-table-section">
          <div class="sub-table-header">
            <div class="sub-table-title-row">
              <span class="sub-table-label">要素调整</span>
              <div class="sub-table-actions">
                <el-button type="primary" size="small" @click="handleElementSelect">选择</el-button>
                <el-button size="small" @click="handleElementExport">移出</el-button>
              </div>
            </div>
            <span class="sub-table-count">{{ elementList.length }} 条数据</span>
          </div>
          <el-table :data="elementList" border style="width: 100%" :row-class-name="rowClassName3">
            <!-- 勾选列与序号列合并：默认显示序号，行 hover 或已勾选时显示勾选框 -->
            <el-table-column label="序号" width="80" align="center">
              <template #header>
                <el-checkbox
                  :model-value="allChecked3"
                  :indeterminate="isIndeterminate3"
                  @change="handleCheckAll3"
                />
              </template>
              <template #default="{ row, $index }">
                <div class="seq-cell">
                  <span class="seq-num">{{ $index + 1 }}</span>
                  <el-checkbox
                    class="seq-check"
                    :model-value="selectedIds3.includes(row.id)"
                    @change="(val) => handleCheckRow3(row.id, !!val)"
                  />
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="code" label="编号" width="120" />
            <el-table-column prop="name" label="审计项目名称" min-width="180" />
            <el-table-column prop="version" label="版本" width="80" align="center" />
            <el-table-column prop="year" label="年度" width="80" align="center" />
            <el-table-column prop="auditedUnit" label="被审计单位" min-width="140" />
            <el-table-column prop="auditTarget" label="审计对象" min-width="120" />
            <el-table-column prop="orgForm" label="组织形式" width="100" align="center" />
            <el-table-column prop="auditOrg" label="审计实施机构" min-width="140" />
            <el-table-column label="操作" width="80" align="center" fixed="right">
              <template #default="{ row }">
                <el-button type="danger" link size="small" @click="handleElementDelete(row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-scrollbar>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
  /* 标准双卡片框架 */
  .apply-page {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-top: 20px;
  }

  /* 标题卡 */
  .header-card {
    flex-shrink: 0;
    border: none !important;
    border-radius: 12px;
    box-shadow: none !important;

    :deep(.el-card__body) {
      padding: 12px 20px;
    }
  }

  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .header-left {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .back-icon {
    font-size: 18px;
    color: var(--el-text-color-regular);
    cursor: pointer;

    &:hover {
      color: var(--el-color-primary);
    }
  }

  .page-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }

  /* 内容卡：固定高度，内部可滚动 */
  .body-card {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 60px - 20px - 44px - 16px - 20px - 40px);
    overflow: hidden;
    border: none !important;
    border-radius: 12px;
    box-shadow: none !important;

    :deep(.el-card__body) {
      display: flex;
      flex: 1;
      flex-direction: column;
      padding: 0;
      overflow: hidden;
    }

    :deep(.el-scrollbar) {
      flex: 1;
    }

    :deep(.el-scrollbar__view) {
      padding: 20px;
    }
  }

  /* 基本信息表单 */
  .form-section {
    margin-bottom: 8px;

    .base-form {
      :deep(.el-form-item) {
        margin-bottom: 12px;
      }
    }
  }

  .attachment-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  /* 灰色边框按钮（上传文件、查看文件） */
  .btn-gray {
    color: var(--el-text-color-regular) !important;
    border-color: var(--el-border-color) !important;

    &:hover {
      color: var(--el-text-color-secondary) !important;
      background-color: var(--el-fill-color-light) !important;
      border-color: var(--el-border-color-hover) !important;
    }

    :deep(.el-icon) {
      color: inherit;
    }
  }

  /* 子表格区块（调增/调减/要素调整） */
  .sub-table-section {
    margin-bottom: 24px;
  }

  .sub-table-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .sub-table-title-row {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .sub-table-label {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .sub-table-actions {
    display: flex;
    gap: 6px;
  }

  .sub-table-count {
    font-size: 12px;
    color: var(--el-text-color-secondary);
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
