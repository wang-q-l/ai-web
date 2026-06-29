<template>
  <!-- 填报整改页面（整改单位端）：复刻审计系统进展填报页 -->
  <!-- 直接作为 .art-page-view 子节点，撑满高度，仅右侧表单区滚动 -->
  <div class="report-fill-container">
    <!-- 顶部标题栏 -->
    <div class="header-bar">
      <div class="header-left">
        <el-button link @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <span class="page-title">填报整改</span>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="handleSave(false)" :loading="saving">
          <el-icon><Files /></el-icon>
          保存
        </el-button>
        <el-button type="primary" @click="handleSave(true)" :loading="saving">
          <el-icon><DArrowRight /></el-icon>
          保存,下一个
        </el-button>
      </div>
    </div>

    <!-- 左右分栏 -->
    <div class="content-wrapper">
      <!-- 左侧问题列表 -->
      <div class="problem-list">
        <div
          v-for="item in problemList"
          :key="item.id"
          class="problem-item"
          :class="{ active: item.id === activeProblemId }"
          @click="handleProblemClick(item.id)"
        >
          <div class="problem-item-top">
            <span class="status-text">
              <span class="status-dot" />
              {{ rectificationStatusLabel(item.rectificationStatus) }}
            </span>
            <el-button link type="primary" @click.stop="handleViewProblem(item.id)">
              问题详情
            </el-button>
          </div>
          <div class="problem-item-title">{{ item.problemTitle }}</div>
        </div>
      </div>

      <!-- 右侧表单内容（可滚动） -->
      <div class="form-scroll" v-loading="loading">
        <!-- 整改情况 -->
        <div class="form-card">
          <div class="card-title"><span class="bar" />整改情况</div>

          <!-- 整改状态 -->
          <div class="field-block">
            <div class="field-label required">整改状态</div>
            <el-radio-group v-model="form.rectificationStatus">
              <el-radio :value="1">未整改</el-radio>
              <el-radio :value="2">正在整改</el-radio>
              <el-radio :value="3" disabled>已整改</el-radio>
            </el-radio-group>
          </div>

          <!-- 整改进展情况表 -->
          <div class="field-block">
            <div class="field-label">整改进展情况</div>
            <el-table :data="form.measures" border class="measure-table">
              <el-table-column type="index" label="序号" width="70" align="center" />
              <el-table-column label="具体措施（目标）" min-width="320">
                <template #default="{ row }">
                  <span class="measure-text">{{ row.measure }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="responsible" label="措施整改责任人" width="140" />
              <el-table-column label="措施完成状态" width="180">
                <template #default="{ row }">
                  <el-select v-model="row.finishStatus" placeholder="请选择" clearable>
                    <el-option label="未完成" :value="1" />
                    <el-option label="已完成" :value="3" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="整改进展情况" min-width="320">
                <template #default="{ row }">
                  <el-input
                    v-model="row.progressDesc"
                    type="textarea"
                    :rows="3"
                    maxlength="1000"
                    show-word-limit
                    resize="none"
                    placeholder=""
                  />
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 佐证附件 -->
          <div class="field-block">
            <div class="field-label required">佐证附件</div>
            <el-upload
              :auto-upload="false"
              :show-file-list="true"
              :on-change="handleAttachmentChange"
              :file-list="attachmentFileList"
            >
              <el-button>
                <el-icon><Upload /></el-icon>
                上传
              </el-button>
            </el-upload>
          </div>
        </div>

        <!-- 整改成效 -->
        <div class="form-card">
          <div class="card-title"><span class="bar" />整改成效</div>

          <!-- 整改金额 -->
          <div class="sub-title">整改金额</div>
          <div class="amount-block">
            <div class="amount-item full">
              <div class="amount-label">合计金额（元）（累计{{ totalAmount }}元）</div>
              <el-input :model-value="totalAmount" disabled />
            </div>
          </div>
          <el-row :gutter="24" class="amount-row">
            <el-col :span="12">
              <div class="amount-label">已纠正违纪金（元）（累计{{ form.correctedAmount }}元）</div>
              <el-input v-model.number="form.correctedAmount" />
            </el-col>
            <el-col :span="12">
              <div class="amount-label">挽回损失金额（元）（累计{{ form.recoveredAmount }}元）</div>
              <el-input v-model.number="form.recoveredAmount" />
            </el-col>
          </el-row>
          <el-row :gutter="24" class="amount-row">
            <el-col :span="12">
              <div class="amount-label"
                >工程审减金额（元）（累计{{ form.auditReducedAmount }}元）</div
              >
              <el-input v-model.number="form.auditReducedAmount" />
            </el-col>
            <el-col :span="12">
              <div class="amount-label"
                >其他增收节支（元）（累计{{ form.otherSavingAmount }}元）</div
              >
              <el-input v-model.number="form.otherSavingAmount" />
            </el-col>
          </el-row>

          <!-- 累计出台、修订制度 -->
          <div class="block-header">
            <span class="sub-title link-title">累计出台、修订制度</span>
            <div class="block-actions">
              <el-button @click="handleAddSystem">
                <el-icon><Plus /></el-icon>
                添加
              </el-button>
              <el-button>
                <el-icon><Upload /></el-icon>
                上传
              </el-button>
            </div>
          </div>
          <el-table :data="form.systemRecords" border empty-text="暂无数据" class="effect-table">
            <el-table-column prop="systemName" label="制度名称" min-width="180" />
            <el-table-column prop="improveType" label="制度完善类型" min-width="160" />
            <el-table-column prop="systemFile" label="制度文件" min-width="180" />
            <el-table-column prop="docNo" label="文号" min-width="160" />
            <el-table-column prop="publishDate" label="发布日期" min-width="160" />
            <el-table-column label="操作" width="100">
              <template #default="{ $index }">
                <el-button link type="danger" @click="form.systemRecords.splice($index, 1)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 累计完善优化业务流程 -->
          <div class="block-header">
            <span class="sub-title link-title">累计完善优化业务流程</span>
            <div class="block-actions">
              <el-button @click="handleAddProcess">
                <el-icon><Plus /></el-icon>
                添加
              </el-button>
              <el-button>
                <el-icon><Upload /></el-icon>
                上传
              </el-button>
            </div>
          </div>
          <el-table :data="form.processRecords" border empty-text="暂无数据" class="effect-table">
            <el-table-column prop="processName" label="流程名称" min-width="240" />
            <el-table-column prop="file" label="文件" min-width="280" />
            <el-table-column prop="publishDate" label="发布日期" min-width="220" />
            <el-table-column label="操作" width="100">
              <template #default="{ $index }">
                <el-button link type="danger" @click="form.processRecords.splice($index, 1)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <!-- 问题详情大弹窗 -->
    <ProblemDetailDialog v-model="detailVisible" :problem-id="detailProblemId" />
  </div>
</template>

<script setup lang="ts">
  /**
   * 填报整改页面（整改单位端）
   * 左侧问题列表切换，右侧填报「整改情况」与「整改成效」
   */
  import { ref, reactive, computed, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import type { UploadFile, UploadFiles } from 'element-plus'
  import { ArrowLeft, Files, DArrowRight, Upload, Plus } from '@element-plus/icons-vue'
  import type {
    RectificationProgressItem,
    RectificationReportDetail,
    SystemRecord,
    ProcessRecord
  } from '@/types/audit-decision'
  import {
    getRectificationProgressList,
    getRectificationReportDetail,
    saveRectificationReport
  } from '@/api/audit-decision'
  import ProblemDetailDialog from './components/ProblemDetailDialog.vue'

  const router = useRouter()
  const route = useRoute()

  // 当前填报的问题ID（从整改进展页跳转携带）
  const activeProblemId = ref<number>(Number(route.query.problemId) || 1)

  // 问题详情弹窗状态
  const detailVisible = ref(false)
  const detailProblemId = ref(0)

  // 左侧问题列表
  const problemList = ref<RectificationProgressItem[]>([])

  // 加载/保存状态
  const loading = ref(false)
  const saving = ref(false)

  // 佐证附件文件列表
  const attachmentFileList = ref<UploadFiles>([])

  // 填报表单
  const form = reactive<RectificationReportDetail>({
    problemId: activeProblemId.value,
    problemCode: '',
    problemTitle: '',
    rectificationStatus: 2,
    measures: [],
    attachments: [],
    correctedAmount: 0,
    recoveredAmount: 0,
    auditReducedAmount: 0,
    otherSavingAmount: 0,
    systemRecords: [],
    processRecords: []
  })

  // 合计金额 = 四项金额之和（只读）
  const totalAmount = computed(() => {
    const { correctedAmount, recoveredAmount, auditReducedAmount, otherSavingAmount } = form
    return (
      (Number(correctedAmount) || 0) +
      (Number(recoveredAmount) || 0) +
      (Number(auditReducedAmount) || 0) +
      (Number(otherSavingAmount) || 0)
    )
  })

  // 整改状态文案：1-未整改 2-正在整改 3-已整改
  const rectificationStatusLabel = (status: number) => {
    return { 1: '未整改', 2: '正在整改', 3: '已整改' }[status] ?? '未整改'
  }

  // 获取左侧问题列表
  const fetchProblemList = async () => {
    try {
      const res = await getRectificationProgressList({ page: 1, pageSize: 100 })
      problemList.value = res.data.list
    } catch {
      ElMessage.error('获取问题列表失败')
    }
  }

  // 获取当前问题的填报详情
  const fetchDetail = async () => {
    loading.value = true
    try {
      const res = await getRectificationReportDetail(activeProblemId.value)
      Object.assign(form, res.data)
    } catch {
      ElMessage.error('获取填报详情失败')
    } finally {
      loading.value = false
    }
  }

  // 切换左侧问题
  const handleProblemClick = (id: number) => {
    if (id === activeProblemId.value) return
    activeProblemId.value = id
    fetchDetail()
  }

  // 查看问题详情：打开大弹窗
  const handleViewProblem = (id: number) => {
    detailProblemId.value = id
    detailVisible.value = true
  }

  // 佐证附件变更
  const handleAttachmentChange = (_file: UploadFile, files: UploadFiles) => {
    attachmentFileList.value = files
    form.attachments = files.map((f) => f.name)
  }

  // 新增制度行
  const handleAddSystem = () => {
    const row: SystemRecord = {
      id: Date.now(),
      systemName: '',
      improveType: '',
      systemFile: '',
      docNo: '',
      publishDate: ''
    }
    form.systemRecords.push(row)
  }

  // 新增流程行
  const handleAddProcess = () => {
    const row: ProcessRecord = {
      id: Date.now(),
      processName: '',
      file: '',
      publishDate: ''
    }
    form.processRecords.push(row)
  }

  // 保存（toNext 为 true 时保存后切换到下一个问题）
  const handleSave = async (toNext: boolean) => {
    saving.value = true
    try {
      await saveRectificationReport({ ...form, problemId: activeProblemId.value })
      ElMessage.success('保存成功')
      if (toNext) {
        const idx = problemList.value.findIndex((i) => i.id === activeProblemId.value)
        const next = problemList.value[idx + 1]
        if (next) {
          handleProblemClick(next.id)
        } else {
          ElMessage.info('已经是最后一个问题')
        }
      }
    } catch {
      ElMessage.error('保存失败')
    } finally {
      saving.value = false
    }
  }

  // 返回上一页
  const handleBack = () => {
    router.back()
  }

  // 初始化
  onMounted(() => {
    fetchProblemList()
    fetchDetail()
  })
</script>

<style scoped lang="scss">
  .report-fill-container {
    display: flex;
    flex-direction: column;

    /* 顶层静态路由（无 AppLayout 包裹），用视口高度作为有界高度，使仅右侧表单区滚动 */
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
      gap: 8px;
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
    }
  }

  /* 左右分栏 */
  .content-wrapper {
    display: flex;
    flex: 1;
    gap: 16px;

    /* min-height:0 让子项可独立滚动，避免内容撑高导致整页滚动 */
    min-height: 0;
    padding: 16px;
    overflow: hidden;
  }

  /* 左侧问题列表 */
  .problem-list {
    flex-shrink: 0;
    width: 240px;
    height: 100%;
    padding: 12px;
    overflow-y: auto;
    background: #fff;
    border-radius: 12px;
  }

  .problem-item {
    padding: 12px;
    margin-bottom: 12px;
    cursor: pointer;
    background: #f7f9fc;
    border: 1px solid transparent;
    border-radius: 8px;
    transition: all 0.2s;

    &:last-child {
      margin-bottom: 0;
    }

    &:hover {
      background: #eef4ff;
    }

    &.active {
      background: #fff;
      border-color: #409eff;
      box-shadow: 0 0 0 2px rgb(64 158 255 / 12%);
    }

    .problem-item-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .problem-item-title {
      font-size: 14px;
      font-weight: 600;
      line-height: 1.5;
      color: #303133;
    }
  }

  /* 状态文案 + 圆点 */
  .status-text {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    font-size: 13px;
    color: #909399;

    .status-dot {
      width: 6px;
      height: 6px;
      background: #c0c4cc;
      border-radius: 50%;
    }
  }

  /* 右侧滚动表单区 */
  .form-scroll {
    flex: 1;

    /* min-width/min-height:0 让 flex 子项可收缩，仅本区域滚动 */
    min-width: 0;
    height: 100%;
    min-height: 0;
    padding-right: 4px;
    overflow-y: auto;
  }

  /* 表单卡片 */
  .form-card {
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
    margin-bottom: 20px;
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

  /* 字段块 */
  .field-block {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .field-label {
    margin-bottom: 12px;
    font-size: 14px;
    color: #303133;

    &.required::before {
      margin-right: 4px;
      color: #f56c6c;
      content: '*';
    }
  }

  /* 措施表格内文本 */
  .measure-text {
    line-height: 1.6;
    color: #606266;
  }

  .measure-table {
    width: 100%;
  }

  /* 整改成效——金额区 */
  .sub-title {
    margin-bottom: 16px;
    font-size: 14px;
    font-weight: 600;
    color: #303133;

    &.link-title {
      color: #409eff;
    }
  }

  .amount-block .amount-item.full {
    margin-bottom: 16px;
  }

  .amount-row {
    margin-bottom: 16px;
  }

  .amount-label {
    margin-bottom: 8px;
    font-size: 13px;
    color: #606266;
  }

  /* 制度/流程区块头部 */
  .block-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 24px 0 12px;

    .sub-title {
      margin-bottom: 0;
    }

    .block-actions {
      display: flex;
      gap: 12px;
    }
  }

  .effect-table {
    width: 100%;
  }
</style>
