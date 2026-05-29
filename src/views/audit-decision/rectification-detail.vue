<template>
  <PageContainer>
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>整改情况</span>
          <el-button link @click="handleBack">返回</el-button>
        </div>
      </template>

      <div class="detail-content">
        <el-descriptions title="整改概况" :column="2" border>
          <el-descriptions-item label="决定文书名称">
            {{ statistics?.decisionName }}
          </el-descriptions-item>
          <el-descriptions-item label="决定文书文号">
            {{ statistics?.decisionCode }}
          </el-descriptions-item>
          <el-descriptions-item label="整改责任单位">
            {{ statistics?.responsibleUnit }}
          </el-descriptions-item>
          <el-descriptions-item label="整改期限">
            {{ statistics?.rectificationDeadline }}
          </el-descriptions-item>
          <el-descriptions-item label="整改状态">
            <el-tag v-if="statistics?.rectificationStatus === 1" type="danger">未整改</el-tag>
            <el-tag v-else-if="statistics?.rectificationStatus === 2" type="warning">整改中</el-tag>
            <el-tag v-else type="success">已整改</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="整改进度">
            <div class="progress-info">
              <span class="progress-text">
                {{ statistics?.completedProblems }} / {{ statistics?.totalProblems }} ({{
                  statistics?.completionRate
                }}%)
              </span>
              <el-progress
                :percentage="statistics?.completionRate || 0"
                :color="getProgressColor(statistics?.completionRate || 0)"
                style="margin-top: 8px"
              />
            </div>
          </el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <div class="statistics-cards">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-label">总问题数</div>
              <div class="stat-value">{{ statistics?.totalProblems || 0 }}</div>
            </div>
          </el-card>
          <el-card class="stat-card completed">
            <div class="stat-content">
              <div class="stat-label">已整改</div>
              <div class="stat-value">{{ statistics?.completedProblems || 0 }}</div>
            </div>
          </el-card>
          <el-card class="stat-card in-progress">
            <div class="stat-content">
              <div class="stat-label">整改中</div>
              <div class="stat-value">{{ statistics?.inProgressProblems || 0 }}</div>
            </div>
          </el-card>
          <el-card class="stat-card not-started">
            <div class="stat-content">
              <div class="stat-label">未整改</div>
              <div class="stat-value">{{ statistics?.notStartedProblems || 0 }}</div>
            </div>
          </el-card>
        </div>

        <el-divider />

        <div class="section-title">关联问题整改详情</div>
        <el-table :data="problemList" border>
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column
            prop="problemTitle"
            label="问题标题"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column prop="problemCategory" label="问题类别" width="120" />
          <el-table-column prop="involvedAmount" label="涉及金额(元)" width="160" align="right">
            <template #default="{ row }">
              {{ (row.involvedAmount * 10000).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="rectificationStatus" label="整改状态" width="100">
            <template #default="{ row }">
              <el-tag v-if="row.rectificationStatus === 1" type="danger">未整改</el-tag>
              <el-tag v-else-if="row.rectificationStatus === 2" type="warning">整改中</el-tag>
              <el-tag v-else type="success">已整改</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="rectificationProgress"
            label="整改进展"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column prop="updatedAt" label="最后更新时间" width="180" />
        </el-table>
      </div>
    </el-card>
  </PageContainer>
</template>

<script setup lang="ts">
  /**
   * 整改情况查看页面
   * 展示审计决定的整改状态、整改进度、关联问题的整改详情
   */
  import { ref, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { RectificationStatistics, RelatedProblem } from '@/types/audit-decision'
  import { getRectificationStatistics, getDecisionProblems } from '@/api/audit-decision'
  import { useRouter, useRoute } from 'vue-router'

  const router = useRouter()
  const route = useRoute()

  // 决定ID
  const decisionId = ref(Number(route.query.id))

  // 加载状态
  const loading = ref(false)

  // 整改统计
  const statistics = ref<RectificationStatistics | null>(null)

  // 关联问题列表
  const problemList = ref<RelatedProblem[]>([])

  // 获取整改统计
  const fetchStatistics = async () => {
    loading.value = true
    try {
      const res = await getRectificationStatistics(decisionId.value)
      statistics.value = res.data
    } catch {
      ElMessage.error('获取整改统计失败')
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

  // 获取进度条颜色
  const getProgressColor = (percentage: number) => {
    if (percentage === 0) {
      return '#f56c6c'
    } else if (percentage < 50) {
      return '#e6a23c'
    } else if (percentage < 100) {
      return '#409eff'
    } else {
      return '#67c23a'
    }
  }

  // 返回
  const handleBack = () => {
    router.back()
  }

  // 初始化
  onMounted(() => {
    fetchStatistics()
    fetchProblems()
  })
</script>

<style scoped lang="scss">
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .detail-content {
    padding: 16px 0;
  }

  .progress-info {
    display: flex;
    flex-direction: column;

    .progress-text {
      font-weight: bold;
      color: #303133;
    }
  }

  .statistics-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin: 24px 0;

    .stat-card {
      text-align: center;

      &.completed {
        :deep(.el-card__body) {
          color: #fff;
          background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
        }
      }

      &.in-progress {
        :deep(.el-card__body) {
          color: #fff;
          background: linear-gradient(135deg, #e6a23c 0%, #f0c78a 100%);
        }
      }

      &.not-started {
        :deep(.el-card__body) {
          color: #fff;
          background: linear-gradient(135deg, #f56c6c 0%, #f89898 100%);
        }
      }

      .stat-content {
        .stat-label {
          margin-bottom: 8px;
          font-size: 14px;
          opacity: 0.9;
        }

        .stat-value {
          font-size: 32px;
          font-weight: bold;
        }
      }
    }
  }

  .section-title {
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: bold;
    color: #303133;
  }

  .el-divider {
    margin: 24px 0;
  }
</style>
