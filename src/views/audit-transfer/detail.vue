<template>
  <PageContainer>
    <div class="transfer-detail-container" v-loading="loading">
      <!-- 顶部标题栏 -->
      <div class="header-bar">
        <el-button link @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <span class="page-title">审计移送详情</span>
      </div>

      <!-- 内容区域 -->
      <div class="content-wrapper">
        <el-row :gutter="24" class="main-layout">
          <!-- 左侧区域：移送信息 + 移送人员 (75%) -->
          <el-col :span="18">
            <!-- 移送信息卡片 -->
            <el-card class="detail-card">
              <template #header>
                <div class="card-title">
                  <el-icon><Document /></el-icon>
                  <span>移送信息</span>
                </div>
              </template>

              <el-row :gutter="24">
                <el-col :span="12">
                  <div class="info-item-horizontal">
                    <span class="label">移送文书名称：</span>
                    <span class="value">{{ transferDetail?.transferName }}</span>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="info-item-horizontal">
                    <span class="label">移送文书文号：</span>
                    <span class="value">{{ transferDetail?.transferCode }}</span>
                  </div>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="12">
                  <div class="info-item-horizontal">
                    <span class="label">文书出具时间：</span>
                    <span class="value">{{ transferDetail?.issueDate }}</span>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="info-item-horizontal">
                    <span class="label">责任单位：</span>
                    <span class="value">{{ transferDetail?.responsibleUnit }}</span>
                  </div>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="12">
                  <div class="info-item-horizontal">
                    <span class="label">移送类型：</span>
                    <span class="value">
                      <el-tag v-if="transferDetail?.transferType === 1" type="info">事项</el-tag>
                      <el-tag v-else type="warning">人员</el-tag>
                    </span>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="info-item-horizontal">
                    <span class="label">移送人员数量：</span>
                    <span class="value">{{ transferDetail?.personnelCount || 0 }} 人</span>
                  </div>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="12">
                  <div class="info-item-horizontal">
                    <span class="label">主送部门：</span>
                    <span class="value">{{ transferDetail?.mainRecipient }}</span>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="info-item-horizontal">
                    <span class="label">抄送部门：</span>
                    <span class="value">{{ transferDetail?.ccRecipient || '-' }}</span>
                  </div>
                </el-col>
              </el-row>

              <el-divider />

              <el-row :gutter="24">
                <el-col :span="24">
                  <div class="info-item">
                    <span class="label">移送内容：</span>
                    <div class="value text-content">{{
                      transferDetail?.transferContent || '-'
                    }}</div>
                  </div>
                </el-col>
              </el-row>
            </el-card>

            <!-- 移送人员卡片（仅当移送类型为"人员"时显示） -->
            <el-card v-if="transferDetail?.transferType === 2" class="detail-card">
              <template #header>
                <div class="card-title">
                  <el-icon><User /></el-icon>
                  <span>移送人员</span>
                </div>
              </template>

              <el-table :data="personnelList" border style="width: 100%">
                <el-table-column type="index" label="序号" width="60" />
                <el-table-column prop="personnelName" label="人员姓名" width="120" />
                <el-table-column prop="personnelCategory" label="人员类别" width="140">
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
                <el-table-column prop="personnelPosition" label="人员职务" width="120" />
                <el-table-column prop="positionLevel" label="职务级别" width="120">
                  <template #default="{ row }">
                    <span v-if="row.positionLevel === 1">地厅级</span>
                    <span v-else-if="row.positionLevel === 2">县处级</span>
                    <span v-else-if="row.positionLevel === 3">乡科级</span>
                    <span v-else-if="row.positionLevel === 4">乡科级以下</span>
                    <span v-else>其他</span>
                  </template>
                </el-table-column>
                <el-table-column prop="isPartyMember" label="是否党员" width="100" align="center">
                  <template #default="{ row }">
                    <el-tag v-if="row.isPartyMember === 1" type="success">是</el-tag>
                    <el-tag v-else type="info">否</el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="problemOccurredUnit"
                  label="问题发生时所在单位"
                  min-width="150"
                  show-overflow-tooltip
                />
              </el-table>
            </el-card>
          </el-col>

          <!-- 右侧区域：反馈状态 + 反馈信息 (25%) -->
          <el-col :span="6" class="right-column">
            <!-- 反馈状态卡片 -->
            <el-card class="detail-card side-card status-card">
              <template #header>
                <div class="card-title">
                  <el-icon><InfoFilled /></el-icon>
                  <span>反馈状态</span>
                </div>
              </template>

              <div class="info-item">
                <span class="label">反馈状态：</span>
                <div>
                  <el-tag v-if="transferDetail?.feedbackStatus === 1" type="info">未反馈</el-tag>
                  <el-tag v-else-if="transferDetail?.feedbackStatus === 2" type="warning"
                    >已受理</el-tag
                  >
                  <el-tag v-else type="success">已处理</el-tag>
                </div>
              </div>

              <div class="info-item">
                <span class="label">创建人：</span>
                <div class="value">{{ transferDetail?.createdBy }}</div>
              </div>

              <div class="info-item">
                <span class="label">创建时间：</span>
                <div class="value">{{ transferDetail?.createdAt }}</div>
              </div>

              <div class="info-item">
                <span class="label">更新时间：</span>
                <div class="value">{{ transferDetail?.updatedAt }}</div>
              </div>
            </el-card>

            <!-- 反馈信息卡片 -->
            <el-card class="detail-card side-card feedback-card">
              <template #header>
                <div class="card-title">
                  <el-icon><ChatDotRound /></el-icon>
                  <span>反馈信息</span>
                </div>
              </template>

              <div v-if="feedbackInfo">
                <div class="info-item">
                  <span class="label">受理机关：</span>
                  <div class="value">{{ feedbackInfo.acceptOrganization }}</div>
                </div>

                <div class="info-item">
                  <span class="label">受理日期：</span>
                  <div class="value">{{ feedbackInfo.acceptDate }}</div>
                </div>

                <template v-if="feedbackInfo.handleResult">
                  <el-divider />

                  <div class="info-item">
                    <span class="label">处理机关：</span>
                    <div class="value">{{ feedbackInfo.handleOrganization || '-' }}</div>
                  </div>

                  <div class="info-item">
                    <span class="label">处理日期：</span>
                    <div class="value">{{ feedbackInfo.handleDate || '-' }}</div>
                  </div>

                  <div class="info-item">
                    <span class="label">处理结果文件名称：</span>
                    <div class="value">{{ feedbackInfo.resultFileName || '-' }}</div>
                  </div>

                  <div class="info-item">
                    <span class="label">处理结果文件文号：</span>
                    <div class="value">{{ feedbackInfo.resultFileCode || '-' }}</div>
                  </div>

                  <div class="info-item">
                    <span class="label">处理结果：</span>
                    <div>
                      <el-tag v-if="feedbackInfo.handleResult === 1" type="danger">党纪处分</el-tag>
                      <el-tag v-else-if="feedbackInfo.handleResult === 2" type="warning"
                        >政务处分</el-tag
                      >
                      <el-tag v-else-if="feedbackInfo.handleResult === 3" type="info"
                        >第一种形态</el-tag
                      >
                      <el-tag v-else-if="feedbackInfo.handleResult === 4" type="warning"
                        >经济处罚</el-tag
                      >
                      <el-tag v-else-if="feedbackInfo.handleResult === 5" type="info">其他</el-tag>
                      <el-tag v-else type="success">经核实不是问题</el-tag>
                    </div>
                  </div>

                  <div class="info-item">
                    <span class="label">处理结果情况描述：</span>
                    <div class="value text-content">{{
                      feedbackInfo.resultDescription || '-'
                    }}</div>
                  </div>
                </template>
              </div>
              <el-empty v-else description="暂无反馈信息" :image-size="60" />
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
  /**
   * 审计移送详情页面
   * 展示审计移送的完整信息，包括基本信息、移送人员、反馈信息
   */
  import { ref, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { ArrowLeft, Document, User, InfoFilled, ChatDotRound } from '@element-plus/icons-vue'
  import type { AuditTransfer, TransferPersonnel, TransferFeedback } from '@/types/audit-transfer'
  import {
    getAuditTransferDetail,
    getTransferPersonnelList,
    getTransferFeedback
  } from '@/api/audit-transfer'
  import { useRouter, useRoute } from 'vue-router'

  const router = useRouter()
  const route = useRoute()

  // 移送ID
  const transferId = ref(Number(route.query.id))

  // 加载状态
  const loading = ref(false)

  // 移送详情
  const transferDetail = ref<AuditTransfer | null>(null)

  // 移送人员列表
  const personnelList = ref<TransferPersonnel[]>([])

  // 反馈信息
  const feedbackInfo = ref<TransferFeedback | null>(null)

  // 获取移送详情
  const fetchTransferDetail = async () => {
    loading.value = true
    try {
      const res = await getAuditTransferDetail(transferId.value)
      transferDetail.value = res.data
    } catch {
      ElMessage.error('获取移送详情失败')
    } finally {
      loading.value = false
    }
  }

  // 获取移送人员
  const fetchPersonnel = async () => {
    try {
      const res = await getTransferPersonnelList(transferId.value)
      personnelList.value = res.data
    } catch {
      ElMessage.error('获取移送人员失败')
    }
  }

  // 获取反馈信息
  const fetchFeedback = async () => {
    try {
      const res = await getTransferFeedback(transferId.value)
      feedbackInfo.value = res.data
    } catch (error) {
      console.error('获取反馈信息失败', error)
    }
  }

  // 返回
  const handleBack = () => {
    router.back()
  }

  // 初始化
  onMounted(() => {
    fetchTransferDetail()
    fetchPersonnel()
    fetchFeedback()
  })
</script>

<style scoped lang="scss">
  .transfer-detail-container {
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

  .feedback-card {
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

  :deep(.el-divider) {
    margin: 24px 0;
  }
</style>
