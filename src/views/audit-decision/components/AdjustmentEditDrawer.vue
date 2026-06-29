<template>
  <!-- 整改调整申请抽屉（整改单位端）：主单信息 + 逐问题明细，新增/编辑共用 -->
  <el-drawer
    v-model="visible"
    :title="isEdit ? '编辑调整申请' : '新增调整申请'"
    size="62%"
    :close-on-click-modal="false"
    @open="handleOpen"
  >
    <div class="drawer-body" v-loading="loading">
      <!-- 主单信息 -->
      <div class="form-card">
        <div class="card-title"><span class="bar" />申请信息</div>
        <el-form :model="form" label-width="100px">
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="发起单位">
                <el-input v-model="form.applyUnit" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="申请人">
                <el-input v-model="form.applyUser" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="调整说明" required>
            <el-input
              v-model="form.applySummary"
              type="textarea"
              :rows="2"
              maxlength="500"
              show-word-limit
              placeholder="请填写调整说明"
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- 问题明细 -->
      <div class="form-card">
        <div class="card-title">
          <span class="bar" />问题明细（{{ form.items?.length || 0 }}）
          <el-button type="primary" size="small" class="add-btn" @click="selectorVisible = true">
            <el-icon><Plus /></el-icon>
            添加问题
          </el-button>
        </div>

        <!-- 空状态 -->
        <el-empty v-if="!form.items?.length" description="请添加需要调整的问题" />

        <!-- 明细折叠面板 -->
        <el-collapse v-else v-model="activeNames">
          <el-collapse-item
            v-for="(item, index) in form.items || []"
            :key="item.problemId"
            :name="item.problemId"
          >
            <template #title>
              <div class="item-title">
                <span class="item-code">{{ item.problemCode }}</span>
                <span class="item-name">{{ item.problemTitle }}</span>
                <el-button link type="danger" size="small" @click.stop="handleRemoveItem(index)">
                  移除
                </el-button>
              </div>
            </template>

            <!-- 调整类型多选 -->
            <div class="field-block">
              <div class="field-label required">调整类型（可多选）</div>
              <el-checkbox-group v-model="item.adjustTypes">
                <el-checkbox :value="1">整改时限调整</el-checkbox>
                <el-checkbox :value="2">整改方案调整</el-checkbox>
              </el-checkbox-group>
            </div>

            <!-- 时限调整表单 -->
            <div v-if="item.adjustTypes.includes(1)" class="sub-card">
              <div class="sub-card-title">整改时限调整</div>
              <el-row :gutter="24">
                <el-col :span="12">
                  <div class="field-label">原整改期限</div>
                  <el-input :model-value="item.originalDeadline" disabled />
                </el-col>
                <el-col :span="12">
                  <div class="field-label required">申请整改期限</div>
                  <el-date-picker
                    v-model="item.newDeadline"
                    type="date"
                    value-format="YYYY-MM-DD"
                    placeholder="选择新期限"
                    style="width: 100%"
                  />
                </el-col>
              </el-row>
            </div>

            <!-- 调整理由（移到时限下面） -->
            <div class="field-block">
              <div class="field-label required">调整理由</div>
              <el-input
                v-model="item.reason"
                type="textarea"
                :rows="2"
                maxlength="500"
                show-word-limit
                placeholder="说明本问题需要调整的原因"
              />
            </div>

            <!-- 方案调整表单 -->
            <div v-if="item.adjustTypes.includes(2)" class="sub-card">
              <div class="sub-card-title">
                整改方案调整
                <span v-if="item.hasProgress" class="plan-warn-inline">
                  <el-icon><WarningFilled /></el-icon>
                  方案调整通过后，原方案及已填报的整改进展将归档为历史版本，需按新措施重新填报进展
                </span>
                <span v-else class="plan-warn-inline">
                  <el-icon><WarningFilled /></el-icon>
                  未填报过进展的整改措施可直接修改，在调整查看页面可查看新旧措施；也可以添加新的措施
                </span>
              </div>

              <!-- 已填报进展：原方案只读 + 原进展概要，新措施另起清单 -->
              <template v-if="item.hasProgress">
                <div class="field-label">原整改方案（只读）</div>
                <el-table
                  :data="item.originalPlanSnapshot || []"
                  border
                  size="small"
                  class="plan-table"
                >
                  <el-table-column type="index" label="序号" width="60" align="center" />
                  <el-table-column prop="measure" label="具体措施" min-width="200" />
                  <el-table-column prop="responsible" label="责任人" width="100" />
                  <el-table-column prop="planFinishDate" label="计划完成时间" width="120" />
                </el-table>
                <div class="origin-progress" v-if="item.originalProgressBrief">
                  原进展概要：{{ item.originalProgressBrief }}
                </div>
              </template>

              <!-- 措施清单标题：未填报进展时为"整改措施"，可直接在列表改 -->
              <div class="block-header">
                <span class="field-label required">
                  {{ item.hasProgress ? '新整改措施' : '整改措施' }}
                </span>
                <el-button size="small" @click="handleAddMeasure(item)">
                  <el-icon><Plus /></el-icon>
                  添加措施
                </el-button>
              </div>
              <el-table :data="item.newPlan || []" border size="small" class="plan-table">
                <el-table-column type="index" label="序号" width="60" align="center" />
                <el-table-column label="具体措施" min-width="200">
                  <template #default="{ row }">
                    <el-input v-model="row.measure" placeholder="请输入" />
                  </template>
                </el-table-column>
                <el-table-column label="责任人" width="110">
                  <template #default="{ row }">
                    <el-input v-model="row.responsible" placeholder="请输入" />
                  </template>
                </el-table-column>
                <el-table-column label="计划完成时间" width="160">
                  <template #default="{ row }">
                    <el-date-picker
                      v-model="row.planFinishDate"
                      type="date"
                      value-format="YYYY-MM-DD"
                      placeholder="选择"
                      style="width: 100%"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="70">
                  <template #default="{ $index }">
                    <el-button link type="danger" @click="item.newPlan!.splice($index, 1)">
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <!-- 调整说明 -->
              <div class="field-label required" style="margin-top: 16px">方案调整说明</div>
              <el-input
                v-model="item.planAdjustDesc"
                type="textarea"
                :rows="2"
                maxlength="500"
                show-word-limit
                placeholder="说明为何变更方案"
              />
            </div>

            <!-- 佐证附件（选填，放最后） -->
            <div class="field-block" style="margin-top: 16px">
              <div class="field-label">佐证附件</div>
              <el-upload
                :auto-upload="false"
                :file-list="getFileList(item)"
                :on-change="(f: UploadFile, fs: UploadFiles) => handleAttachmentChange(item, fs)"
                :on-remove="(f: UploadFile, fs: UploadFiles) => handleAttachmentChange(item, fs)"
              >
                <el-button>
                  <el-icon><Upload /></el-icon>
                  上传
                </el-button>
              </el-upload>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>

    <!-- 底部操作 -->
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button @click="handleSave(false)" :loading="saving">
        <el-icon><Files /></el-icon>
        保存
      </el-button>
      <el-button type="primary" @click="handleSave(true)" :loading="saving">
        <el-icon><Promotion /></el-icon>
        提交审批
      </el-button>
    </template>

    <!-- 问题选择弹窗 -->
    <AdjustmentProblemSelector
      v-model="selectorVisible"
      :existing-problem-ids="existingProblemIds"
      :locked-project-id="lockedProjectId"
      @confirm="handleProblemsSelected"
    />
  </el-drawer>
</template>

<!-- SCRIPT-MARKER -->
<script setup lang="ts">
  /**
   * 整改调整申请抽屉（整改单位端）
   * 主单信息 + 逐问题明细，每条明细可多选时限/方案调整，新增/编辑共用
   */
  import { ref, reactive, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { UploadFile, UploadFiles } from 'element-plus'
  import { Files, Promotion, Plus, WarningFilled, Upload } from '@element-plus/icons-vue'
  import type {
    RectificationAdjustment,
    AdjustmentItem,
    AdjustMeasure,
    AttachmentFile
  } from '@/types/audit-decision'
  import { getAdjustmentDetail, addAdjustment, updateAdjustment } from '@/api/audit-decision'
  import AdjustmentProblemSelector from './AdjustmentProblemSelector.vue'

  const props = defineProps<{
    modelValue: boolean
    // 编辑时传入申请单ID，新增时为 null
    editId?: number | null
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    saved: []
  }>()

  // 抽屉显隐（受控）
  const visible = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v)
  })

  // 编辑模式判定
  const isEdit = computed(() => props.editId != null)

  const loading = ref(false)
  const saving = ref(false)
  const selectorVisible = ref(false)
  // 折叠面板展开项
  const activeNames = ref<number[]>([])

  // 申请单表单（主单 + 明细）
  const form = reactive<Partial<RectificationAdjustment>>({
    applyUnit: 'ZY股份财务部',
    applyUser: '张明',
    applySummary: '',
    items: []
  })

  // 重置表单为新增初始态
  const resetForm = () => {
    form.applyUnit = 'ZY股份财务部'
    form.applyUser = '张明'
    form.applySummary = ''
    form.items = []
    activeNames.value = []
  }

  // 已存在明细的问题ID（传给选择器避免重复选）
  const existingProblemIds = computed(() => (form.items || []).map((it) => it.problemId))

  // 已锁定项目：申请单已有明细时取首条明细的项目，限制只能选同一项目
  const lockedProjectId = computed<number | null>(() => {
    return form.items && form.items.length ? form.items[0].projectId : null
  })

  // 抽屉打开：编辑模式拉详情回显，新增模式重置
  const handleOpen = async () => {
    if (isEdit.value) {
      await fetchDetail()
    } else {
      resetForm()
    }
  }

  // 编辑模式回显
  const fetchDetail = async () => {
    loading.value = true
    try {
      const res = await getAdjustmentDetail(props.editId!)
      if (res.data) {
        Object.assign(form, res.data)
        activeNames.value = (form.items || []).map((it) => it.problemId)
      }
    } catch {
      ElMessage.error('获取申请详情失败')
    } finally {
      loading.value = false
    }
  }

  // 选择器确认：将选中问题转为明细
  const handleProblemsSelected = (problems: any[]) => {
    problems.forEach((p) => {
      const item: AdjustmentItem = {
        id: 0,
        projectId: p.projectId,
        projectName: p.projectName,
        problemId: p.problemId,
        problemCode: p.problemCode,
        problemTitle: p.problemTitle,
        adjustTypes: [],
        reason: '',
        attachments: [],
        originalDeadline: p.originalDeadline,
        newDeadline: '',
        delayTimes: p.delayTimes,
        hasProgress: p.hasProgress,
        originalPlanSnapshot: p.originalPlan,
        originalProgressBrief: p.originalProgressBrief,
        // 未填报进展：用原方案副本预填，供直接在列表中编辑；已填报：留空待新增
        newPlan: p.hasProgress ? [] : (p.originalPlan || []).map((m: AdjustMeasure) => ({ ...m })),
        planAdjustDesc: ''
      }
      form.items!.push(item)
      activeNames.value.push(p.problemId)
    })
  }

  // 移除明细
  const handleRemoveItem = (index: number) => {
    form.items!.splice(index, 1)
  }

  // 为某明细新增一条措施
  const handleAddMeasure = (item: AdjustmentItem) => {
    if (!item.newPlan) item.newPlan = []
    item.newPlan.push({
      id: Date.now(),
      measure: '',
      responsible: '',
      planFinishDate: ''
    } as AdjustMeasure)
  }

  // 佐证附件回显列表
  const getFileList = (item: AdjustmentItem) => {
    return (item.attachments || []).map((a) => ({ name: a.name, url: a.url }))
  }

  // 佐证附件变更：同步到明细 attachments
  const handleAttachmentChange = (item: AdjustmentItem, files: UploadFiles) => {
    item.attachments = files.map(
      (f) =>
        ({
          name: f.name,
          url: f.url || '',
          size: f.size || 0,
          type: f.raw?.type || ''
        }) as AttachmentFile
    )
  }

  // 提交前校验：调整说明必填 + 每条明细必填项齐全
  const validate = (): string | null => {
    if (!form.applySummary || !form.applySummary.trim()) {
      return '请填写调整说明'
    }
    if (!form.items || !form.items.length) {
      return '请至少添加一个问题'
    }
    for (const item of form.items) {
      const label = `问题「${item.problemCode}」`
      if (!item.adjustTypes.length) return `${label} 请至少选择一种调整类型`
      if (!item.reason.trim()) return `${label} 请填写调整理由`
      // 时限调整校验
      if (item.adjustTypes.includes(1)) {
        if (!item.newDeadline) return `${label} 请选择申请整改期限`
        if (item.originalDeadline && item.newDeadline <= item.originalDeadline) {
          return `${label} 申请整改期限必须晚于原期限（${item.originalDeadline}）`
        }
      }
      // 方案调整校验
      if (item.adjustTypes.includes(2)) {
        const plan = item.newPlan || []
        if (!plan.length) return `${label} 请至少添加一条新措施`
        if (plan.some((m) => !m.measure.trim() || !m.responsible.trim() || !m.planFinishDate)) {
          return `${label} 新措施清单存在未填写完整的行`
        }
        if (!item.planAdjustDesc || !item.planAdjustDesc.trim()) {
          return `${label} 请填写方案调整说明`
        }
      }
    }
    return null
  }

  // 保存（submit=true 提交审批，false 存草稿）
  const handleSave = async (submit: boolean) => {
    if (submit) {
      const err = validate()
      if (err) {
        ElMessage.warning(err)
        return
      }
    } else if (!form.items || !form.items.length) {
      ElMessage.warning('请至少添加一个问题')
      return
    }
    saving.value = true
    const payload: Partial<RectificationAdjustment> = {
      ...form,
      approvalStatus: submit ? 2 : 1
    }
    try {
      if (isEdit.value) {
        await updateAdjustment(props.editId!, payload)
      } else {
        await addAdjustment(payload)
      }
      ElMessage.success(submit ? '提交成功' : '保存成功')
      visible.value = false
      emit('saved')
    } catch {
      ElMessage.error('保存失败')
    } finally {
      saving.value = false
    }
  }
</script>

<!-- STYLE-MARKER -->
<style scoped lang="scss">
  .drawer-body {
    padding-right: 4px;
  }

  /* 表单卡片 */
  .form-card {
    padding: 16px 20px;
    margin-bottom: 16px;
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 12px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  /* 卡片标题（带蓝色竖条） */
  .card-title {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    margin-bottom: 16px;
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    background: #f5f7fa;
    border-radius: 6px;

    .bar {
      width: 3px;
      height: 14px;
      margin-right: 8px;
      background: #409eff;
      border-radius: 2px;
    }

    .add-btn {
      margin-left: auto;
    }
  }

  /* 明细标题行 */
  .item-title {
    display: flex;
    gap: 10px;
    align-items: center;
    width: 100%;

    .item-code {
      font-weight: 600;
      color: #409eff;
    }

    .item-name {
      color: #303133;
    }
  }

  /* 字段块 */
  .field-block {
    margin-bottom: 20px;
  }

  .field-label {
    margin-bottom: 8px;
    font-size: 14px;
    color: #303133;

    &.required::before {
      margin-right: 4px;
      color: #f56c6c;
      content: '*';
    }
  }

  /* 子卡片（时限/方案表单区） */
  .sub-card {
    padding: 16px;
    margin-bottom: 16px;
    background: #f7f9fc;
    border-radius: 8px;

    .sub-card-title {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      margin-bottom: 12px;
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }
  }

  /* 方案调整提示语（内联在小标题后） */
  .plan-warn-inline {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    margin-left: 12px;
    font-size: 12px;
    font-weight: 400;
    color: #e6a23c;
  }

  .plan-table {
    width: 100%;
    margin-bottom: 12px;
  }

  /* 原进展概要 */
  .origin-progress {
    margin-bottom: 12px;
    font-size: 13px;
    color: #909399;
  }

  /* 措施区块头部 */
  .block-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 16px 0 12px;

    .field-label {
      margin-bottom: 0;
    }
  }
</style>
