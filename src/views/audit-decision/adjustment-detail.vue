<template>
  <!-- 整改调整申请详情页（整改单位端）：主单 + 逐问题"申请前/申请后"对照 + 审批记录 -->
  <div class="adjustment-detail-container" v-loading="loading">
    <!-- 顶部标题栏 -->
    <div class="header-bar">
      <div class="header-left">
        <el-button link @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <span class="page-title">调整申请详情</span>
        <el-tag v-if="detail" :type="statusTagType(detail.approvalStatus)" size="small">
          {{ statusTextMap[detail.approvalStatus] }}
        </el-tag>
      </div>
    </div>

    <!-- 内容滚动区 -->
    <div class="content-scroll" v-if="detail">
      <!-- 主单信息 -->
      <div class="detail-card">
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

      <!-- 逐问题明细：申请前/申请后对照 -->
      <div v-for="(item, index) in detail.items" :key="item.problemId" class="detail-card">
        <div class="card-title">
          <span class="bar" />明细 {{ index + 1 }}：{{ item.problemCode }} {{ item.problemTitle }}
        </div>

        <!-- 调整类型标签 -->
        <div class="type-tags">
          <el-tag v-if="item.adjustTypes.includes(1)" type="primary" size="small">时限调整</el-tag>
          <el-tag v-if="item.adjustTypes.includes(2)" type="warning" size="small">方案调整</el-tag>
        </div>

        <!-- 时限调整对照 -->
        <div v-if="item.adjustTypes.includes(1)" class="compare-block">
          <div class="compare-title">整改时限调整</div>
          <div class="compare-row">
            <div class="compare-col before">
              <div class="compare-label">申请前</div>
              <div class="compare-item">原整改期限：{{ item.originalDeadline || '-' }}</div>
            </div>
            <el-icon class="compare-arrow"><Right /></el-icon>
            <div class="compare-col after">
              <div class="compare-label">
                申请后
                <el-tag v-if="!detail.effected" type="info" size="small" class="pending-tag">
                  待生效
                </el-tag>
              </div>
              <div class="compare-item">新整改期限：{{ item.newDeadline || '-' }}</div>
            </div>
          </div>
        </div>

        <!-- 方案调整对照 -->
        <div v-if="item.adjustTypes.includes(2)" class="compare-block">
          <div class="compare-title">整改方案调整</div>
          <div class="compare-row">
            <div class="compare-col before">
              <div class="compare-label">申请前（原方案 + 原进展）</div>
              <el-table :data="item.originalPlanSnapshot || []" border size="small">
                <el-table-column type="index" label="序号" width="56" align="center" />
                <el-table-column prop="measure" label="原措施" min-width="160" />
                <el-table-column prop="responsible" label="责任人" width="90" />
              </el-table>
              <div class="origin-progress" v-if="item.originalProgressBrief">
                原进展概要：{{ item.originalProgressBrief }}
              </div>
            </div>
            <el-icon class="compare-arrow"><Right /></el-icon>
            <div class="compare-col after">
              <div class="compare-label">
                申请后（新方案）
                <el-tag v-if="!detail.effected" type="info" size="small" class="pending-tag">
                  待生效
                </el-tag>
              </div>
              <el-table :data="item.newPlan || []" border size="small">
                <el-table-column type="index" label="序号" width="56" align="center" />
                <el-table-column prop="measure" label="新措施" min-width="160" />
                <el-table-column prop="responsible" label="责任人" width="90" />
                <el-table-column prop="planFinishDate" label="计划完成" width="120" />
              </el-table>
              <div class="origin-progress" v-if="item.planAdjustDesc">
                方案调整说明：{{ item.planAdjustDesc }}
              </div>
              <div v-if="detail.effected" class="archived-link">
                <el-icon><FolderOpened /></el-icon>
                <el-button link type="primary" @click="handleViewArchive(item)">
                  查看归档历史版本（原方案 + 原进展）
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 调整理由（放到调整内容下面） -->
        <div class="item-reason">调整理由：{{ item.reason }}</div>
      </div>

      <!-- 审批记录 -->
      <div class="detail-card">
        <div class="card-title"><span class="bar" />审批记录</div>
        <el-timeline v-if="detail.approvalRecords && detail.approvalRecords.length">
          <el-timeline-item
            v-for="(rec, idx) in detail.approvalRecords"
            :key="idx"
            :timestamp="rec.approveTime"
            :type="rec.result === '通过' ? 'success' : 'danger'"
          >
            <div class="record-level">{{ rec.level }} · {{ rec.approver }}</div>
            <div class="record-result">
              结果：<span :class="rec.result === '通过' ? 'pass' : 'reject'">{{ rec.result }}</span>
            </div>
            <div class="record-opinion">意见：{{ rec.opinion }}</div>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-else description="暂无审批记录" :image-size="80" />
      </div>
    </div>

    <!-- 归档历史版本弹窗（方案调整生效后，原方案 + 原进展只读） -->
    <el-dialog v-model="archiveVisible" title="归档历史版本（只读）" width="700px">
      <template v-if="archiveItem">
        <div class="archive-section-title">原整改方案</div>
        <el-table :data="archiveItem.originalPlanSnapshot || []" border size="small">
          <el-table-column type="index" label="序号" width="56" align="center" />
          <el-table-column prop="measure" label="措施" min-width="200" />
          <el-table-column prop="responsible" label="责任人" width="100" />
          <el-table-column prop="planFinishDate" label="计划完成时间" width="130" />
        </el-table>
        <div class="archive-section-title" style="margin-top: 16px">原整改进展</div>
        <div class="archive-progress">{{
          archiveItem.originalProgressBrief || '暂无进展记录'
        }}</div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  /**
   * 整改调整申请详情页（整改单位端）
   * 展示主单信息 + 逐问题"申请前/申请后"对照（同选两类则并列） + 审批记录
   */
  import { ref, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { ArrowLeft, Right, FolderOpened } from '@element-plus/icons-vue'
  import type { RectificationAdjustment, AdjustmentItem } from '@/types/audit-decision'
  import { getAdjustmentDetail } from '@/api/audit-decision'

  const router = useRouter()
  const route = useRoute()

  const loading = ref(false)
  const detail = ref<RectificationAdjustment | null>(null)

  // 归档历史版本弹窗
  const archiveVisible = ref(false)
  const archiveItem = ref<AdjustmentItem | null>(null)

  // 查看归档历史版本（原方案 + 原进展，只读）
  const handleViewArchive = (item: AdjustmentItem) => {
    archiveItem.value = item
    archiveVisible.value = true
  }

  // 审批状态文案
  const statusTextMap: Record<number, string> = {
    1: '待提交',
    2: '审批中',
    3: '已通过',
    4: '已驳回'
  }

  // 状态标签颜色
  const statusTagType = (status: number) => {
    return ({ 1: 'info', 2: 'primary', 3: 'success', 4: 'danger' }[status] ?? 'info') as
      | 'info'
      | 'primary'
      | 'success'
      | 'danger'
  }

  // 获取详情
  const fetchDetail = async () => {
    const id = Number(route.query.id)
    if (!id) {
      ElMessage.error('缺少申请ID')
      return
    }
    loading.value = true
    try {
      const res = await getAdjustmentDetail(id)
      detail.value = res.data
    } catch {
      ElMessage.error('获取申请详情失败')
    } finally {
      loading.value = false
    }
  }

  // 返回
  const handleBack = () => {
    router.back()
  }

  onMounted(() => {
    fetchDetail()
  })
</script>

<style scoped lang="scss">
  .adjustment-detail-container {
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
  }

  /* 内容滚动区 */
  .content-scroll {
    flex: 1;
    min-height: 0;
    padding: 16px;
    overflow-y: auto;
  }

  /* 详情卡片 */
  .detail-card {
    padding: 20px 24px;
    margin-bottom: 16px;
    background: #fff;
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
  }

  /* 调整类型标签 */
  .type-tags {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }

  .item-reason {
    margin-top: 16px;
    font-size: 14px;
    color: #606266;
  }

  /* 对照区块 */
  .compare-block {
    padding: 16px;
    margin-bottom: 16px;
    background: #f7f9fc;
    border-radius: 8px;

    .compare-title {
      margin-bottom: 12px;
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }
  }

  /* 申请前/申请后左右对照 */
  .compare-row {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .compare-col {
    flex: 1;
    min-width: 0;
    padding: 12px;
    background: #fff;
    border-radius: 8px;

    &.before {
      border-left: 3px solid #c0c4cc;
    }

    &.after {
      border-left: 3px solid #409eff;
    }

    .compare-label {
      margin-bottom: 8px;
      font-size: 13px;
      font-weight: 600;
      color: #909399;
    }

    .compare-item {
      margin-bottom: 6px;
      font-size: 14px;
      color: #303133;
    }
  }

  .compare-arrow {
    flex-shrink: 0;
    font-size: 20px;
    color: #409eff;
  }

  /* 原进展/调整说明 */
  .origin-progress {
    margin-top: 8px;
    font-size: 13px;
    color: #909399;
  }

  /* 审批记录时间线 */
  .record-level {
    font-weight: 600;
    color: #303133;
  }

  .record-result {
    margin: 4px 0;
    font-size: 13px;
    color: #606266;

    .pass {
      color: #67c23a;
    }

    .reject {
      color: #f56c6c;
    }
  }

  .record-opinion {
    font-size: 13px;
    color: #606266;
  }

  /* 待生效标签 */
  .pending-tag {
    margin-left: 8px;
  }

  /* 归档历史版本入口 */
  .archived-link {
    display: flex;
    gap: 4px;
    align-items: center;
    margin-top: 10px;
    color: #409eff;
  }

  /* 归档弹窗 */
  .archive-section-title {
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }

  .archive-progress {
    padding: 10px 12px;
    font-size: 13px;
    color: #606266;
    background: #f7f9fc;
    border-radius: 6px;
  }
</style>
