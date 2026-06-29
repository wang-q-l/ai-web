<template>
  <!-- 整改调整-调整审批页（审计端）：左审核内容区（可改时限/措施）+ 右审批意见与流程 -->
  <div class="approval-container">
    <!-- 顶部标题栏 + 审批操作 -->
    <div class="header-bar">
      <div class="header-left">
        <el-button link @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <span class="page-title">调整审批</span>
        <el-tag v-if="detail" type="primary" size="small">审批中</el-tag>
      </div>
      <div class="header-actions">
        <el-button type="primary" :disabled="!detail" @click="handleApprove('通过')">
          <el-icon><Select /></el-icon>
          同意
        </el-button>
        <el-button type="danger" :disabled="!detail" @click="handleApprove('驳回')">
          <el-icon><RefreshLeft /></el-icon>
          退回
        </el-button>
      </div>
    </div>

    <!-- 左右分栏 -->
    <div class="content-wrapper" v-loading="loading">
      <!-- 左侧：审核内容区（可编辑时限/措施） -->
      <div class="review-area">
        <el-empty v-if="!detail" description="暂无待审批的调整申请" />
        <template v-else>
          <!-- 申请信息 -->
          <div class="form-card">
            <div class="card-title"><span class="bar" />申请信息</div>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="项目名称">{{ detail.projectName }}</el-descriptions-item>
              <el-descriptions-item label="发起单位">{{ detail.applyUnit }}</el-descriptions-item>
              <el-descriptions-item label="申请人">{{ detail.applyUser }}</el-descriptions-item>
              <el-descriptions-item label="申请时间">{{ detail.applyTime }}</el-descriptions-item>
              <el-descriptions-item label="调整说明" :span="2">
                {{ detail.applySummary || '-' }}
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 问题明细（审批人可改时限/措施） -->
          <div v-for="(item, index) in detail.items" :key="item.problemId" class="form-card">
            <div class="card-title">
              <span class="bar" />明细 {{ index + 1 }}：{{ item.problemCode }}
              {{ item.problemTitle }}
            </div>

            <!-- 调整类型 -->
            <div class="type-tags">
              <el-tag v-if="item.adjustTypes.includes(1)" type="primary" size="small">
                时限调整
              </el-tag>
              <el-tag v-if="item.adjustTypes.includes(2)" type="warning" size="small">
                方案调整
              </el-tag>
            </div>

            <!-- 整改时限调整（审批人可改申请整改期限） -->
            <div v-if="item.adjustTypes.includes(1)" class="sub-card">
              <div class="sub-card-title">整改时限调整</div>
              <el-row :gutter="24">
                <el-col :span="12">
                  <div class="field-label">原整改期限</div>
                  <el-input :model-value="item.originalDeadline" disabled />
                </el-col>
                <el-col :span="12">
                  <div class="field-label deadline-label">
                    申请整改期限
                    <!-- 编辑/保存切换：只读态显示编辑图标，编辑态显示保存按钮 -->
                    <el-icon
                      v-if="!deadlineEditable[item.problemId]"
                      class="edit-icon"
                      @click="toggleDeadlineEdit(item.problemId)"
                    >
                      <EditPen />
                    </el-icon>
                    <el-button
                      v-else
                      link
                      type="primary"
                      size="small"
                      @click="toggleDeadlineEdit(item.problemId)"
                    >
                      保存
                    </el-button>
                  </div>
                  <el-date-picker
                    v-model="item.newDeadline"
                    type="date"
                    value-format="YYYY-MM-DD"
                    placeholder="选择期限"
                    :disabled="!deadlineEditable[item.problemId]"
                    style="width: 100%"
                  />
                </el-col>
              </el-row>
            </div>

            <!-- 整改方案调整（审批人可改措施清单） -->
            <div v-if="item.adjustTypes.includes(2)" class="sub-card">
              <div class="sub-card-title">整改方案调整</div>
              <!-- 已填报进展：展示原方案 + 原进展（只读） -->
              <template v-if="item.hasProgress">
                <div class="field-label">原整改方案（只读）</div>
                <el-table
                  :data="item.originalPlanSnapshot || []"
                  border
                  size="small"
                  class="m-table"
                >
                  <el-table-column type="index" label="序号" width="56" align="center" />
                  <el-table-column prop="measure" label="原措施" min-width="180" />
                  <el-table-column prop="responsible" label="责任人" width="90" />
                  <el-table-column prop="planFinishDate" label="计划完成" width="120" />
                </el-table>
                <div class="origin-progress" v-if="item.originalProgressBrief">
                  原进展概要：{{ item.originalProgressBrief }}
                </div>
              </template>

              <!-- 整改措施（审批人可修改） -->
              <div class="block-header">
                <span class="field-label">
                  {{ item.hasProgress ? '新整改措施' : '整改措施' }}
                </span>
              </div>
              <el-table :data="item.newPlan || []" border size="small" class="m-table">
                <el-table-column type="index" label="序号" width="56" align="center" />
                <el-table-column label="具体措施" min-width="200">
                  <template #default="{ row }">
                    <el-input
                      v-if="measureEditable[row.id]"
                      v-model="row.measure"
                      placeholder="请输入"
                    />
                    <span v-else>{{ row.measure }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="责任人" width="110">
                  <template #default="{ row }">
                    <el-input
                      v-if="measureEditable[row.id]"
                      v-model="row.responsible"
                      placeholder="请输入"
                    />
                    <span v-else>{{ row.responsible }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="计划完成时间" width="160">
                  <template #default="{ row }">
                    <el-date-picker
                      v-if="measureEditable[row.id]"
                      v-model="row.planFinishDate"
                      type="date"
                      value-format="YYYY-MM-DD"
                      placeholder="选择"
                      style="width: 100%"
                    />
                    <span v-else>{{ row.planFinishDate }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="70">
                  <template #default="{ row }">
                    <el-button link type="primary" @click="toggleMeasureEdit(row.id)">
                      {{ measureEditable[row.id] ? '保存' : '编辑' }}
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div class="field-label" style="margin-top: 12px">方案调整说明</div>
              <div class="plan-desc">{{ item.planAdjustDesc || '-' }}</div>
            </div>

            <!-- 调整理由 -->
            <div class="item-reason">调整理由：{{ item.reason }}</div>
          </div>
        </template>
      </div>

      <!-- 右侧：审批区 -->
      <div class="approve-area">
        <div class="approve-title">审核</div>
        <!-- 审批意见 -->
        <el-input
          v-model="opinion"
          type="textarea"
          :rows="4"
          maxlength="500"
          show-word-limit
          placeholder="请输入审核意见"
        />
        <!-- 上传附件 -->
        <el-upload class="approve-upload" action="#" :auto-upload="false" :show-file-list="true">
          <el-button>
            <el-icon><Upload /></el-icon>
            上传附件
          </el-button>
        </el-upload>

        <!-- 审批流程时间线 -->
        <div class="flow-title">审批流程</div>
        <el-timeline class="flow-timeline">
          <el-timeline-item
            v-for="(rec, idx) in flowRecords"
            :key="idx"
            :timestamp="rec.approveTime"
            :type="flowDotType(rec)"
          >
            <div class="flow-level">{{ rec.level }} · {{ rec.approver }}</div>
            <div class="flow-result" v-if="rec.result">
              <span :class="rec.result === '通过' ? 'pass' : 'reject'">{{ rec.result }}</span>
            </div>
            <div class="flow-opinion" v-if="rec.opinion">{{ rec.opinion }}</div>
          </el-timeline-item>
          <!-- 当前待审批节点 -->
          <el-timeline-item v-if="detail" type="primary" :hollow="true" timestamp="当前节点">
            <div class="flow-level">待当前审批人处理</div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  /**
   * 整改调整-调整审批页（审计端）
   * 左侧审核内容区（审批人可直接修改申请的整改时限与整改措施），右侧审批意见输入 + 审批流程时间线
   */
  import { ref, computed, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { ArrowLeft, Select, RefreshLeft, Upload, EditPen } from '@element-plus/icons-vue'
  import type { RectificationAdjustment, AdjustApprovalRecord } from '@/types/audit-decision'
  import { getAdjustmentDetail, getPendingApprovals, approveAdjustment } from '@/api/audit-decision'

  const router = useRouter()
  const route = useRoute()

  const loading = ref(false)
  // 待审批申请列表（用于按路由 id / 默认第一条加载）
  const pendingList = ref<{ id: number; applyCode: string; title: string; projectName: string }[]>(
    []
  )
  // 当前申请详情（左侧审核内容，可编辑）
  const detail = ref<RectificationAdjustment | null>(null)
  // 审批意见
  const opinion = ref('')

  // 各问题"申请整改期限"是否可编辑（按 problemId 记录，默认只读）
  const deadlineEditable = ref<Record<number, boolean>>({})

  // 各措施行是否可编辑（按措施 id 记录，默认只读）
  const measureEditable = ref<Record<number, boolean>>({})

  // 切换某问题申请整改期限的可编辑状态（编辑↔保存）
  const toggleDeadlineEdit = (problemId: number) => {
    deadlineEditable.value[problemId] = !deadlineEditable.value[problemId]
    if (!deadlineEditable.value[problemId]) {
      ElMessage.success('已保存')
    }
  }

  // 切换某措施行的可编辑状态（编辑↔保存）
  const toggleMeasureEdit = (measureId: number) => {
    measureEditable.value[measureId] = !measureEditable.value[measureId]
    if (!measureEditable.value[measureId]) {
      ElMessage.success('已保存')
    }
  }

  // 审批流程记录（已发生的流转）
  const flowRecords = computed<AdjustApprovalRecord[]>(() => detail.value?.approvalRecords || [])

  // 时间线节点颜色
  const flowDotType = (rec: AdjustApprovalRecord) => {
    return rec.result === '驳回' ? 'danger' : 'success'
  }

  // 获取待审批列表，按路由 id 或默认第一条加载详情
  const fetchPending = async () => {
    try {
      const res = await getPendingApprovals()
      pendingList.value = res.data.list
      const queryId = route.query.id ? Number(route.query.id) : null
      const target =
        queryId && pendingList.value.some((p) => p.id === queryId)
          ? queryId
          : pendingList.value[0]?.id || null
      if (target) {
        await fetchDetail(target)
      } else {
        detail.value = null
      }
    } catch {
      ElMessage.error('获取待审批列表失败')
    }
  }

  // 获取申请详情
  const fetchDetail = async (id: number) => {
    loading.value = true
    try {
      const res = await getAdjustmentDetail(id)
      detail.value = res.data
      opinion.value = ''
      // 重置编辑态（默认只读）
      deadlineEditable.value = {}
      measureEditable.value = {}
    } catch {
      ElMessage.error('获取申请详情失败')
    } finally {
      loading.value = false
    }
  }

  // 提交审批（同意/退回）
  const handleApprove = async (result: '通过' | '驳回') => {
    if (!detail.value) return
    // 提交前二次校验：仅审批中(状态2)可审批
    if (detail.value.approvalStatus !== 2) {
      ElMessage.warning('该申请已不在审批中状态，请刷新后重试')
      return
    }
    if (!opinion.value.trim()) {
      ElMessage.warning('请输入审核意见')
      return
    }
    // 二次确认（用户取消时静默退出，不进入审批逻辑）
    try {
      await ElMessageBox.confirm(
        result === '通过'
          ? '确定同意该调整申请吗？审批通过后将按当前内容生效。'
          : '确定退回该调整申请吗？退回后将回到申请人修改。',
        '提示',
        { type: 'warning' }
      )
    } catch {
      return
    }
    try {
      await approveAdjustment({
        id: detail.value.id,
        result,
        opinion: opinion.value,
        // 审批人在审核区修改后的时限/措施一并提交
        items: detail.value.items
      })
      ElMessage.success(result === '通过' ? '已同意' : '已退回')
      // 刷新待审批列表，自动切换到下一条
      detail.value = null
      await fetchPending()
    } catch {
      ElMessage.error('审批失败')
    }
  }

  // 返回
  const handleBack = () => {
    router.back()
  }

  onMounted(() => {
    fetchPending()
  })
</script>

<style scoped lang="scss">
  .approval-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    background: #f5f7fa;
  }

  /* 顶部标题栏 */
  .header-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 24px;
    background: #fff;
    border-bottom: 1px solid #e4e7ed;

    .header-left {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .page-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  }

  /* 左右分栏 */
  .content-wrapper {
    display: flex;
    flex: 1;
    gap: 16px;
    min-height: 0;
    padding: 16px;
    overflow: hidden;
  }

  /* 左侧审核内容区（滚动） */
  .review-area {
    flex: 1;
    min-width: 0;
    height: 100%;
    overflow-y: auto;
  }

  /* 右侧审批区 */
  .approve-area {
    flex-shrink: 0;
    width: 360px;
    height: 100%;
    padding: 16px;
    overflow-y: auto;
    background: #fff;
    border-radius: 12px;

    .approve-title,
    .flow-title {
      margin-bottom: 12px;
      font-size: 15px;
      font-weight: 600;
      color: #303133;
    }

    .flow-title {
      margin-top: 24px;
    }

    .approve-upload {
      margin-top: 12px;
    }
  }

  /* 表单卡片 */
  .form-card {
    padding: 16px 20px;
    margin-bottom: 16px;
    background: #fff;
    border-radius: 12px;
  }

  /* 卡片标题（蓝色竖条） */
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
  }

  .type-tags {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }

  /* 子卡片（时限/方案） */
  .sub-card {
    padding: 16px;
    margin-bottom: 16px;
    background: #f7f9fc;
    border-radius: 8px;

    .sub-card-title {
      margin-bottom: 12px;
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }
  }

  .field-label {
    margin-bottom: 8px;
    font-size: 14px;
    color: #303133;
  }

  /* 申请整改期限标签（右侧带编辑图标） */
  .deadline-label {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .edit-icon {
      font-size: 16px;
      color: #909399;
      cursor: pointer;
      transition: color 0.2s;

      &:hover {
        color: #409eff;
      }
    }
  }

  .m-table {
    width: 100%;
    margin-bottom: 12px;
  }

  .origin-progress {
    margin-bottom: 12px;
    font-size: 13px;
    color: #909399;
  }

  .block-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 16px 0 12px;

    .field-label {
      margin-bottom: 0;
    }
  }

  .plan-desc {
    font-size: 14px;
    color: #606266;
  }

  .item-reason {
    margin-top: 16px;
    font-size: 14px;
    color: #606266;
  }

  /* 审批流程时间线 */
  .flow-level {
    font-weight: 600;
    color: #303133;
  }

  .flow-result {
    margin: 4px 0;
    font-size: 13px;

    .pass {
      color: #67c23a;
    }

    .reject {
      color: #f56c6c;
    }
  }

  .flow-opinion {
    font-size: 13px;
    color: #606266;
  }
</style>
