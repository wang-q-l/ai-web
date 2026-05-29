<template>
  <PageContainer>
    <div class="decision-detail-container" v-loading="loading">
      <!-- 顶部标题栏 -->
      <div class="header-bar">
        <el-button link @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <span class="page-title">审计决定详情</span>
      </div>

      <!-- 内容区域 -->
      <div class="content-wrapper">
        <el-row :gutter="24" class="main-layout">
          <!-- 左侧区域：决定信息 + 关联问题 (75%) -->
          <el-col :span="18">
            <!-- 决定信息卡片 -->
            <el-card class="detail-card">
              <template #header>
                <div class="card-title">
                  <el-icon><Document /></el-icon>
                  <span>决定信息</span>
                </div>
              </template>

              <el-form label-width="140px" disabled>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="决定文书名称">
                      <el-input :model-value="decisionDetail?.decisionName" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="决定文书文号">
                      <el-input :model-value="decisionDetail?.decisionCode" />
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="文书出具时间">
                      <el-input :model-value="decisionDetail?.issueDate" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="整改期限">
                      <el-input :model-value="decisionDetail?.rectificationDeadline" />
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="决定主送部门">
                      <el-input :model-value="decisionDetail?.mainRecipient" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="决定抄送部门">
                      <el-input :model-value="decisionDetail?.ccRecipient || '-'" />
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="整改责任单位">
                      <el-input :model-value="decisionDetail?.responsibleUnit" />
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row :gutter="20">
                  <el-col :span="24">
                    <el-form-item label="决定信息描述">
                      <el-input
                        type="textarea"
                        :model-value="decisionDetail?.decisionDescription || '-'"
                        :rows="3"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row :gutter="20">
                  <el-col :span="24">
                    <el-form-item label="决定定性依据">
                      <el-input
                        type="textarea"
                        :model-value="decisionDetail?.legalBasis || '-'"
                        :rows="3"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row :gutter="20">
                  <el-col :span="24">
                    <el-form-item label="处理处罚意见">
                      <el-input
                        type="textarea"
                        :model-value="decisionDetail?.penaltyOpinion || '-'"
                        :rows="3"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row :gutter="20">
                  <el-col :span="24">
                    <el-form-item label="印证资料">
                      <div
                        v-if="decisionDetail?.attachments && decisionDetail.attachments.length > 0"
                        class="attachment-list"
                      >
                        <div
                          v-for="(file, index) in decisionDetail.attachments"
                          :key="index"
                          class="attachment-item"
                        >
                          <el-icon><Document /></el-icon>
                          <span class="file-name">{{ file.name }}</span>
                          <span class="file-size">({{ formatFileSize(file.size) }})</span>
                          <el-button link type="primary" @click="handleDownload(file)"
                            >下载</el-button
                          >
                        </div>
                      </div>
                      <span v-else>暂无附件</span>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </el-card>

            <!-- 关联问题卡片 -->
            <el-card class="detail-card">
              <template #header>
                <div class="card-title">
                  <el-icon><List /></el-icon>
                  <span>关联问题</span>
                </div>
              </template>

              <div class="statistics-row">
                <div class="stat-item">
                  <div class="stat-icon">
                    <el-icon><Money /></el-icon>
                  </div>
                  <div class="stat-content">
                    <span class="stat-label">涉及金额</span>
                    <span class="stat-value"
                      >{{ ((decisionDetail?.involvedAmount || 0) * 10000).toFixed(2) }}
                      <span class="unit">元</span></span
                    >
                  </div>
                </div>
                <div class="stat-item">
                  <div class="stat-icon">
                    <el-icon><Document /></el-icon>
                  </div>
                  <div class="stat-content">
                    <span class="stat-label">问题数量</span>
                    <span class="stat-value"
                      >{{ decisionDetail?.problemCount || 0 }} <span class="unit">个</span></span
                    >
                  </div>
                </div>
              </div>

              <el-table :data="problemList" border style="width: 100%">
                <el-table-column type="index" label="序号" width="60" align="center" />
                <el-table-column
                  prop="problemTitle"
                  label="问题标题"
                  min-width="250"
                  show-overflow-tooltip
                />
                <el-table-column
                  prop="problemCategory"
                  label="问题类别"
                  width="120"
                  align="center"
                />
                <el-table-column
                  prop="belongUnit"
                  label="问题归属单位"
                  width="180"
                  show-overflow-tooltip
                />
                <el-table-column
                  prop="involvedAmount"
                  label="涉及金额(元)"
                  width="160"
                  align="right"
                >
                  <template #default="{ row }">
                    {{ (row.involvedAmount * 10000).toFixed(2) }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="rectificationStatus"
                  label="整改状态"
                  width="100"
                  align="center"
                >
                  <template #default="{ row }">
                    <el-tag v-if="row.rectificationStatus === 1" type="danger" size="small"
                      >未整改</el-tag
                    >
                    <el-tag v-else-if="row.rectificationStatus === 2" type="warning" size="small"
                      >整改中</el-tag
                    >
                    <el-tag v-else type="success" size="small">已整改</el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>

          <!-- 右侧区域：状态信息 + 审批记录 (25%) -->
          <el-col :span="6" class="right-column">
            <!-- 状态信息卡片 -->
            <el-card class="detail-card side-card status-card">
              <template #header>
                <div class="card-title">
                  <el-icon><InfoFilled /></el-icon>
                  <span>状态信息</span>
                </div>
              </template>

              <div class="info-item">
                <span class="label">审核状态：</span>
                <div>
                  <el-tag v-if="decisionDetail?.reviewStatus === 1" type="info">草稿</el-tag>
                  <el-tag v-else-if="decisionDetail?.reviewStatus === 2" type="warning"
                    >审核中</el-tag
                  >
                  <el-tag v-else-if="decisionDetail?.reviewStatus === 3" type="success"
                    >审核通过</el-tag
                  >
                  <el-tag v-else type="danger">已退回</el-tag>
                </div>
              </div>

              <div class="info-item">
                <span class="label">下达状态：</span>
                <div>
                  <el-tag v-if="decisionDetail?.issueStatus === 0" type="info">未下达</el-tag>
                  <el-tag v-else type="success">已下达</el-tag>
                </div>
              </div>

              <div class="info-item">
                <span class="label">整改状态：</span>
                <div>
                  <el-tag v-if="decisionDetail?.rectificationStatus === 1" type="danger"
                    >未整改</el-tag
                  >
                  <el-tag v-else-if="decisionDetail?.rectificationStatus === 2" type="warning"
                    >整改中</el-tag
                  >
                  <el-tag v-else type="success">已整改</el-tag>
                </div>
              </div>
            </el-card>

            <!-- 审批记录卡片 -->
            <el-card class="detail-card side-card history-card">
              <template #header>
                <div class="card-title">
                  <el-icon><Clock /></el-icon>
                  <span>审批记录</span>
                  <span
                    class="history-tip-badge"
                    @click.stop="historyTipVisible = !historyTipVisible"
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
              <el-empty v-else description="暂无审核记录" :image-size="60" />
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 批注详情面板 -->
    <Teleport to="body">
      <AnnotationPanel
        v-if="historyTipVisible"
        :annotation="historyTipAnnotation"
        :index="0"
        :edit-mode="false"
        @close="historyTipVisible = false"
      />
    </Teleport>
  </PageContainer>
</template>

<script setup lang="ts">
  /**
   * 审计决定详情页面
   * 展示审计决定的完整信息，包括基本信息、关联问题、详细信息、印证资料、审核历史
   */
  import { ref, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { ArrowLeft, Document, List, InfoFilled, Clock, Money } from '@element-plus/icons-vue'
  import type { AuditDecision, RelatedProblem, ReviewRecord } from '@/types/audit-decision'
  import {
    getAuditDecisionDetail,
    getDecisionProblems,
    getReviewHistory
  } from '@/api/audit-decision'
  import { useRouter, useRoute } from 'vue-router'
  import AnnotationPanel from '@/components/Annotation/AnnotationPanel.vue'
  import type { AnnotationItem } from '@/components/Annotation/types'

  // 审批记录批注
  const historyTipVisible = ref(false)
  const historyTipAnnotation: AnnotationItem = {
    id: 'history-tip',
    type: 'position',
    selector: '',
    position: { x: 0, y: 0 },
    title: '审批记录',
    content:
      '显示信息新增的审批流程。如节点配置中设置为不需要审批，则审批记录展示区域显示未设置审批流程的缺省图。',
    category: 'rule',
    source: '',
    createdAt: '2026-05-28'
  }

  const router = useRouter()
  const route = useRoute()

  // 决定ID
  const decisionId = ref(Number(route.query.id))

  // 加载状态
  const loading = ref(false)

  // 决定详情
  const decisionDetail = ref<AuditDecision | null>(null)

  // 关联问题列表
  const problemList = ref<RelatedProblem[]>([])

  // 审核历史
  const reviewHistory = ref<ReviewRecord[]>([])

  // 获取决定详情
  const fetchDecisionDetail = async () => {
    loading.value = true
    try {
      const res = await getAuditDecisionDetail(decisionId.value)
      decisionDetail.value = res.data
    } catch {
      ElMessage.error('获取决定详情失败')
    } finally {
      loading.value = false
    }
  }

  // 获取关联问题
  const fetchProblems = async () => {
    try {
      const res = await getDecisionProblems(decisionId.value)
      problemList.value = res.data
    } catch {
      ElMessage.error('获取关联问题失败')
    }
  }

  // 获取审核历史
  const fetchReviewHistory = async () => {
    try {
      const res = await getReviewHistory(decisionId.value)
      reviewHistory.value = res.data
    } catch (error) {
      console.error('获取审核历史失败', error)
    }
  }

  // 格式化文件大小
  const formatFileSize = (size: number) => {
    if (size < 1024) {
      return size + 'B'
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(2) + 'KB'
    } else {
      return (size / (1024 * 1024)).toFixed(2) + 'MB'
    }
  }

  // 下载附件
  const handleDownload = () => {
    // 模拟下载
    ElMessage.info('下载功能开发中')
  }

  // 返回
  const handleBack = () => {
    const projectId = route.query.projectId
    if (projectId) {
      router.push(`/audit-decision/project/${projectId}`)
    } else {
      router.back()
    }
  }

  // 初始化
  onMounted(() => {
    fetchDecisionDetail()
    fetchProblems()
    fetchReviewHistory()
  })
</script>

<style scoped lang="scss">
  .decision-detail-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #f5f7fa;
  }

  .header-bar {
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 16px 24px;
    background: #fff;
    border-bottom: 1px solid #e4e7ed;

    .page-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      margin-left: auto;
    }
  }

  .content-wrapper {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
  }

  .main-layout {
    align-items: stretch;
    height: 100%;
  }

  .right-column {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .status-card {
    flex-shrink: 0;
  }

  .history-card {
    display: flex;
    flex: 1;
    flex-direction: column;

    :deep(.el-card__body) {
      flex: 1;
      overflow-y: auto;
    }
  }

  .detail-card {
    margin-bottom: 24px;
    border: none;
    border-radius: 12px;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 5%);

    &:last-child {
      margin-bottom: 0;
    }

    :deep(.el-card__header) {
      padding: 20px 24px;
      border-bottom: 1px solid #f0f0f0;
    }

    :deep(.el-card__body) {
      padding: 24px;
    }

    .card-title {
      display: flex;
      gap: 8px;
      align-items: center;
      font-size: 16px;
      font-weight: 600;
      color: #303133;

      .el-icon {
        font-size: 18px;
        color: #409eff;
      }

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
    }
  }

  .side-card {
    :deep(.el-card__body) {
      padding: 20px;
    }
  }

  .info-item {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      font-size: 13px;
      font-weight: 400;
      color: #909399;
      white-space: nowrap;
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

  .statistics-row {
    display: flex;
    gap: 20px;
    padding: 16px;
    margin-bottom: 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgb(102 126 234 / 30%);

    .stat-item {
      display: flex;
      flex: 1;
      gap: 12px;
      align-items: center;

      .stat-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: rgb(255 255 255 / 20%);
        backdrop-filter: blur(10px);
        border-radius: 8px;

        .el-icon {
          font-size: 20px;
          color: #fff;
        }
      }

      .stat-content {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .stat-label {
          font-size: 12px;
          color: rgb(255 255 255 / 80%);
        }

        .stat-value {
          font-size: 20px;
          font-weight: 600;
          color: #fff;

          .unit {
            margin-left: 4px;
            font-size: 13px;
            font-weight: normal;
          }
        }
      }
    }
  }

  .attachment-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 8px;
  }

  .attachment-item {
    display: flex;
    align-items: center;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 8px;

    .el-icon {
      margin-right: 8px;
      font-size: 20px;
      color: #409eff;
    }

    .file-name {
      flex: 1;
      color: #303133;
    }

    .file-size {
      margin-left: 8px;
      font-size: 12px;
      color: #909399;
    }
  }

  .compact-timeline {
    :deep(.el-timeline-item__timestamp) {
      font-size: 12px;
    }
  }

  .review-item-compact {
    padding: 12px;
    background: #f5f7fa;
    border-radius: 6px;

    .review-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;

      .review-level {
        font-size: 13px;
        font-weight: 600;
        color: #303133;
      }
    }

    .review-info {
      margin-bottom: 6px;
      font-size: 12px;
      color: #606266;
    }

    .review-opinion {
      font-size: 12px;
      line-height: 1.5;
      color: #606266;
    }
  }

  :deep(.el-divider) {
    margin: 24px 0;
  }

  :deep(.el-timeline) {
    padding-left: 0;
  }
</style>
