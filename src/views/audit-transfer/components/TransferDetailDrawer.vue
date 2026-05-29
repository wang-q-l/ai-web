<template>
  <el-drawer
    v-model="visible"
    title="审计移送详情"
    size="80%"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="transfer-detail-content" v-loading="loading">
      <el-row :gutter="16">
        <el-col :span="18">
          <!-- 移送信息卡片 -->
          <el-card class="detail-card">
            <template #header>
              <div class="card-title">
                <el-icon><Document /></el-icon>
                <span>移送信息</span>
              </div>
            </template>

            <el-form label-width="120px" class="detail-form">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="移送文书名称">
                    <el-input :value="transferDetail?.transferName" disabled />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="移送文书文号">
                    <el-input :value="transferDetail?.transferCode" disabled />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="文书出具时间">
                    <el-input :value="transferDetail?.issueDate" disabled />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="责任单位">
                    <el-input :value="transferDetail?.responsibleUnit" disabled />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="移送类型">
                    <el-input
                      :value="transferDetail?.transferType === 1 ? '事项' : '人员'"
                      disabled
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="主送部门">
                    <el-input :value="transferDetail?.mainRecipient" disabled />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="抄送部门">
                    <el-input :value="transferDetail?.ccRecipient || '-'" disabled />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="移送内容">
                    <el-input
                      type="textarea"
                      :rows="6"
                      :value="transferDetail?.transferContent || '-'"
                      disabled
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-card>

          <!-- 事项类型：显示反馈信息 -->
          <el-card v-if="transferDetail?.transferType === 1" class="detail-card">
            <template #header>
              <div class="card-title">
                <el-icon><ChatDotRound /></el-icon>
                <span>反馈信息</span>
              </div>
            </template>

            <div v-if="feedbackInfo">
              <el-form label-width="160px" class="detail-form">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="受理机关">
                      <el-input v-model="feedbackInfo.acceptOrganization" disabled />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="受理日期">
                      <el-input v-model="feedbackInfo.acceptDate" disabled />
                    </el-form-item>
                  </el-col>
                </el-row>

                <template v-if="feedbackInfo.handleResult">
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="处理结果文件名称">
                        <el-input :value="feedbackInfo.resultFileName || '-'" disabled />
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="处理结果文件文号">
                        <el-input :value="feedbackInfo.resultFileCode || '-'" disabled />
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="处理机关">
                        <el-input :value="feedbackInfo.handleOrganization || '-'" disabled />
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="处理日期">
                        <el-input :value="feedbackInfo.handleDate || '-'" disabled />
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="处理结果">
                        <el-input
                          :value="
                            feedbackInfo.handleResult === 1
                              ? '党纪处分'
                              : feedbackInfo.handleResult === 2
                                ? '政务处分'
                                : feedbackInfo.handleResult === 3
                                  ? '第一种形态'
                                  : feedbackInfo.handleResult === 4
                                    ? '经济处罚'
                                    : feedbackInfo.handleResult === 5
                                      ? '其他'
                                      : '经核实不是问题'
                          "
                          disabled
                        />
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <el-row :gutter="20">
                    <el-col :span="24">
                      <el-form-item label="处理结果情况描述">
                        <el-input
                          type="textarea"
                          :rows="6"
                          :value="feedbackInfo.resultDescription || '-'"
                          disabled
                        />
                      </el-form-item>
                    </el-col>
                  </el-row>
                </template>
              </el-form>
            </div>
            <el-empty v-else description="暂无反馈信息" :image-size="120" />
          </el-card>

          <!-- 人员类型：显示移送人员列表 -->
          <el-card v-if="transferDetail?.transferType === 2" class="detail-card">
            <template #header>
              <div class="card-title">
                <el-icon><User /></el-icon>
                <span>移送人员</span>
                <span class="personnel-count">共 {{ personnelList.length }} 人</span>
              </div>
            </template>

            <el-table :data="personnelList" style="width: 100%">
              <el-table-column type="index" label="序号" width="60" />
              <el-table-column prop="personnelName" label="人员姓名" min-width="100" />
              <el-table-column prop="personnelCategory" label="人员类别" min-width="130">
                <template #default="{ row }">
                  <span v-if="row.personnelCategory === 1">国家公务员</span>
                  <span v-else-if="row.personnelCategory === 2">国有企业人员</span>
                  <span v-else-if="row.personnelCategory === 3">事业编制人员</span>
                  <span v-else>其他公职人员</span>
                </template>
              </el-table-column>
              <el-table-column
                prop="personnelUnit"
                label="人员所在单位"
                min-width="150"
                show-overflow-tooltip
              />
              <el-table-column
                prop="personnelPosition"
                label="人员职务"
                min-width="140"
                show-overflow-tooltip
              />
              <el-table-column prop="positionLevel" label="职务级别" min-width="110">
                <template #default="{ row }">
                  <span v-if="row.positionLevel === 1">地厅级</span>
                  <span v-else-if="row.positionLevel === 2">县处级</span>
                  <span v-else-if="row.positionLevel === 3">乡科级</span>
                  <span v-else-if="row.positionLevel === 4">乡科级以下</span>
                  <span v-else>其他</span>
                </template>
              </el-table-column>
              <el-table-column prop="isPartyMember" label="是否党员" width="90" align="center">
                <template #default="{ row }">
                  <el-tag v-if="row.isPartyMember === 1" type="success" size="small">是</el-tag>
                  <el-tag v-else type="info" size="small">否</el-tag>
                </template>
              </el-table-column>
              <el-table-column
                prop="problemOccurredUnit"
                label="问题发生时所在单位"
                min-width="150"
                show-overflow-tooltip
              />
              <el-table-column prop="feedbackStatus" label="反馈状态" width="90" align="center">
                <template #default="{ row }">
                  <el-tag v-if="row.feedbackStatus === 2" type="success">已反馈</el-tag>
                  <el-tag v-else type="info">未反馈</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" align="center" fixed="right">
                <template #default="{ row }">
                  <el-button link type="primary" @click="handleViewPersonnelFeedback(row)">
                    反馈查看
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>

        <!-- 右侧区域：审批记录 -->
        <el-col :span="6">
          <el-card class="detail-card side-card history-card">
            <template #header>
              <div class="card-title">
                <el-icon><Clock /></el-icon>
                <span>审批记录</span>
                <span class="history-tip-badge" @click.stop="historyTipVisible = !historyTipVisible"
                  >1</span
                >
              </div>
            </template>

            <el-timeline v-if="reviewHistory.length > 0" class="compact-timeline">
              <el-timeline-item
                v-for="record in reviewHistory"
                :key="record.id"
                :timestamp="record.reviewTime"
                placement="top"
              >
                <div class="review-item-compact">
                  <div class="review-header">
                    <span class="review-level">{{ record.reviewLevel }}</span>
                    <el-tag v-if="record.reviewResult === 1" type="success" size="small"
                      >通过</el-tag
                    >
                    <el-tag v-else type="danger" size="small">不通过</el-tag>
                  </div>
                  <div class="review-info">
                    <span>{{ record.reviewer }}</span>
                  </div>
                  <div class="review-opinion">
                    {{ record.reviewOpinion }}
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
            <el-empty v-else description="暂无审批记录" :image-size="60" />
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 人员反馈查看抽屉 -->
    <PersonnelFeedbackViewDrawer
      v-model="personnelFeedbackViewVisible"
      :personnel-id="currentPersonnelId"
      :personnel-name="currentPersonnelName"
    />

    <!-- 审批记录批注详情面板 -->
    <Teleport to="body">
      <AnnotationPanel
        v-if="historyTipVisible"
        :annotation="historyTipAnnotation"
        :index="0"
        :edit-mode="false"
        @close="historyTipVisible = false"
      />
    </Teleport>
  </el-drawer>
</template>

<script setup lang="ts">
  /**
   * 审计移送详情抽屉组件
   * 展示审计移送的完整信息
   * - 事项类型：显示移送信息 + 反馈信息
   * - 人员类型：显示移送信息 + 移送人员列表
   */
  import { ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Document, User, ChatDotRound, Clock } from '@element-plus/icons-vue'
  import type { AuditTransfer, TransferPersonnel, TransferFeedback } from '@/types/audit-transfer'
  import type { ReviewRecord } from '@/types/audit-decision'
  import {
    getAuditTransferDetail,
    getTransferPersonnelList,
    getTransferFeedback
  } from '@/api/audit-transfer'
  import PersonnelFeedbackViewDrawer from './PersonnelFeedbackViewDrawer.vue'
  import AnnotationPanel from '@/components/Annotation/AnnotationPanel.vue'
  import type { AnnotationItem } from '@/components/Annotation/types'

  // 审批记录批注
  const historyTipVisible = ref(false)
  const historyTipAnnotation: AnnotationItem = {
    id: 'transfer-history-tip',
    type: 'position',
    selector: '',
    position: { x: 0, y: 0 },
    title: '审批记录',
    content:
      '显示移送信息新增的审批流程。如节点配置中设置为不需要审批，则审批记录区域就展示未设置审批流程的缺省图。',
    category: 'rule',
    source: '',
    createdAt: '2026-05-29'
  }

  // Props
  interface Props {
    modelValue: boolean
    transferId?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    transferId: undefined
  })

  // Emits
  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
  }>()

  // 抽屉显示状态
  const visible = ref(false)
  watch(
    () => props.modelValue,
    (val) => {
      visible.value = val
      if (val && props.transferId) {
        fetchDetail()
      }
    }
  )
  watch(visible, (val) => {
    emit('update:modelValue', val)
  })

  // 加载状态
  const loading = ref(false)

  // 移送详情
  const transferDetail = ref<AuditTransfer | null>(null)

  // 移送人员列表
  const personnelList = ref<TransferPersonnel[]>([])

  // 反馈信息
  const feedbackInfo = ref<TransferFeedback | null>(null)

  // 审批记录
  const reviewHistory = ref<ReviewRecord[]>([])

  // 根据移送状态构造审批记录示例（待审批之后的状态都有审批历史）
  const buildReviewHistory = (detail: AuditTransfer): ReviewRecord[] => {
    const status = detail.reviewStatus
    if (!status || status === 1) return []

    const records: ReviewRecord[] = []
    const baseTime = detail.updatedAt || detail.createdAt || ''

    if (status === 2) {
      // 待审批：仅有提交记录
      records.push({
        id: 1,
        decisionId: detail.id,
        reviewLevel: '一级审批',
        reviewer: '审批人',
        reviewTime: baseTime,
        reviewResult: 0,
        reviewOpinion: '审批中…'
      })
    } else if (status === 4) {
      records.push({
        id: 1,
        decisionId: detail.id,
        reviewLevel: '一级审批',
        reviewer: '王五',
        reviewTime: baseTime,
        reviewResult: 2,
        reviewOpinion: '内容描述不完整，请补充后重新提交。'
      })
    } else if (status === 3 || status === 5) {
      records.push({
        id: 1,
        decisionId: detail.id,
        reviewLevel: '一级审批',
        reviewer: '王五',
        reviewTime: baseTime,
        reviewResult: 1,
        reviewOpinion: '审批通过，决定内容完整，法律依据充分，同意提交二级审批。'
      })
      records.push({
        id: 2,
        decisionId: detail.id,
        reviewLevel: '二级审批',
        reviewer: '赵六',
        reviewTime: baseTime,
        reviewResult: 1,
        reviewOpinion: '最终审批通过。'
      })
    }
    return records
  }

  // 人员反馈查看抽屉状态
  const personnelFeedbackViewVisible = ref(false)
  const currentPersonnelId = ref<number>()
  const currentPersonnelName = ref<string>('')

  // 获取详情
  const fetchDetail = async () => {
    if (!props.transferId) return

    loading.value = true
    try {
      // 获取移送详情
      const detailRes = await getAuditTransferDetail(props.transferId)
      if (!detailRes.data) return

      transferDetail.value = detailRes.data

      // 加载审批记录（根据状态构造时间线示例）
      reviewHistory.value = buildReviewHistory(detailRes.data)

      // 根据移送类型加载不同数据
      if (detailRes.data.transferType === 2) {
        // 人员类型：获取人员列表
        const personnelRes = await getTransferPersonnelList(props.transferId)
        personnelList.value = personnelRes.data
      } else {
        // 事项类型：获取反馈信息
        try {
          const feedbackRes = await getTransferFeedback(props.transferId)
          feedbackInfo.value = feedbackRes.data
        } catch {
          feedbackInfo.value = null
        }
      }
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      loading.value = false
    }
  }

  // 查看人员反馈
  const handleViewPersonnelFeedback = (row: TransferPersonnel) => {
    currentPersonnelId.value = row.id
    currentPersonnelName.value = row.personnelName
    personnelFeedbackViewVisible.value = true
  }

  // 关闭
  const handleClose = () => {
    visible.value = false
    transferDetail.value = null
    personnelList.value = []
    feedbackInfo.value = null
  }
</script>

<style scoped lang="scss">
  .transfer-detail-content {
    padding: 0 20px 20px;
  }

  .detail-card {
    margin-bottom: 24px;
    background: #fff;
    border: none;
    border-radius: 12px;
    box-shadow: none;

    &:last-child {
      margin-bottom: 0;
    }

    :deep(.el-card__header) {
      padding: 16px 20px;
      border-bottom: 1px solid #f0f0f0;
    }

    :deep(.el-card__body) {
      padding: 20px;
    }

    .card-title {
      display: flex;
      gap: 8px;
      align-items: center;
      font-size: 15px;
      font-weight: 500;
      color: #303133;

      .el-icon {
        font-size: 16px;
        color: #409eff;
      }

      .personnel-count {
        margin-left: auto;
        font-size: 14px;
        font-weight: 400;
        color: #606266;
      }
    }
  }

  .detail-form {
    :deep(.el-form-item) {
      margin-bottom: 18px;
    }

    :deep(.el-input.is-disabled .el-input__wrapper) {
      background-color: #f5f7fa;
      box-shadow: 0 0 0 1px #e4e7ed inset;
    }

    :deep(.el-textarea.is-disabled .el-textarea__inner) {
      color: #606266;
      background-color: #f5f7fa;
    }
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      font-size: 13px;
      font-weight: 400;
      color: #909399;
    }

    .value {
      font-size: 14px;
      line-height: 1.6;
      color: #303133;
    }

    .text-content {
      line-height: 1.6;
      white-space: pre-wrap;
    }
  }

  .info-item-simple {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      font-size: 14px;
      font-weight: 400;
      color: #606266;
      white-space: nowrap;
    }

    .value {
      flex: 1;
      font-size: 14px;
      color: #303133;
    }
  }

  .info-item-horizontal {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 12px 16px;
    margin-bottom: 16px;
    background: #f8f9fa;
    border-left: 3px solid #409eff;
    border-radius: 6px;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      font-size: 13px;
      font-weight: 600;
      color: #606266;
      white-space: nowrap;
    }

    .value {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
      color: #303133;
    }
  }

  :deep(.el-divider) {
    margin: 20px 0;
  }

  /* 侧边栏卡片：状态信息 / 审批记录 */
  .side-card {
    margin-bottom: 16px;

    :deep(.el-card__body) {
      padding: 16px 20px;
    }
  }

  /* 审批记录卡片标题旁的批注徽章 */
  .history-tip-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    margin-left: 4px;
    font-size: 11px;
    font-weight: 600;
    line-height: 1;
    color: #fff;
    cursor: pointer;
    user-select: none;
    background: #1677ff;
    border-radius: 50%;
  }

  .history-card {
    .compact-timeline {
      padding-left: 0;

      :deep(.el-timeline-item__timestamp) {
        margin-bottom: 8px;
        font-size: 12px;
        color: #909399;
      }
    }

    .review-item-compact {
      padding: 8px 12px;
      background: #f5f7fa;
      border-radius: 6px;

      .review-header {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-bottom: 6px;

        .review-level {
          font-size: 13px;
          font-weight: 600;
          color: #303133;
        }
      }

      .review-info {
        margin-bottom: 4px;
        font-size: 12px;
        color: #606266;
      }

      .review-opinion {
        font-size: 12px;
        line-height: 1.6;
        color: #606266;
      }
    }
  }
</style>
