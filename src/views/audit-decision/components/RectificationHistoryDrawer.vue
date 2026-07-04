<template>
  <!-- 整改历史抽屉（整改单位端）：只读复刻填报整改页，按提交时间倒序展示历次填报快照 -->
  <el-drawer v-model="visible" title="整改历史" size="860px" @open="handleOpen">
    <div class="history-body" v-loading="loading">
      <template v-for="(rec, idx) in records" :key="rec.reportTime || idx">
        <!-- 单期提交记录：提交日期栏 + 可展开/收起的填报内容 -->
        <div class="record-panel">
          <!-- 提交日期栏（点击整栏或图标展开/收起）；第一条挂载气泡批注锚点 -->
          <div class="record-header" @click="toggle(idx)">
            <span class="record-date" :class="{ 'js-anno-first-record': idx === 0 }">
              <span class="record-date-label">提交日期：</span>{{ rec.reportTime || 'xxxx-xx-xx' }}
            </span>
            <el-icon class="record-toggle">
              <component :is="isExpanded(idx) ? ArrowUp : ArrowDown" />
            </el-icon>
          </div>

          <!-- 可展开/收起的历史填报内容 -->
          <div v-show="isExpanded(idx)" class="record-body">
            <!-- 整改情况 -->
            <div class="form-card">
              <div class="card-title"><span class="bar" />整改情况</div>

              <!-- 整改状态（只读，全部禁用） -->
              <div class="field-block">
                <div class="field-label required">整改状态</div>
                <el-radio-group :model-value="rec.rectificationStatus" disabled>
                  <el-radio :value="1">未整改</el-radio>
                  <el-radio :value="2">正在整改</el-radio>
                  <el-radio :value="3">已整改</el-radio>
                </el-radio-group>
              </div>

              <!-- 整改进展情况表（纯文本只读） -->
              <div class="field-block">
                <div class="field-label">整改进展情况</div>
                <el-table :data="rec.measures" border class="measure-table">
                  <el-table-column type="index" label="序号" width="56" align="center" />
                  <el-table-column label="具体措施（目标）" min-width="240">
                    <template #default="{ row }">
                      <span class="measure-text">{{ row.measure }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="措施完成状态" width="100" align="center">
                    <template #default="{ row }">
                      <span>{{ finishStatusLabel(row.finishStatus) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="整改进展情况" min-width="240">
                    <template #default="{ row }">
                      <span class="measure-text">{{ row.progressDesc || '-' }}</span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <!-- 佐证附件（只读文件卡，带查看/下载） -->
              <div class="field-block">
                <div class="field-label required">佐证附件</div>
                <template v-if="rec.attachments.length">
                  <div v-for="(file, i) in rec.attachments" :key="i" class="attach-card">
                    <div class="attach-info">
                      <span class="file-type-icon">W</span>
                      <span class="file-name">{{ file.name }}</span>
                    </div>
                    <div class="attach-actions">
                      <el-icon class="attach-op" @click="handlePreview(file)"><View /></el-icon>
                      <el-icon class="attach-op" @click="handleDownload(file)"
                        ><Download
                      /></el-icon>
                    </div>
                  </div>
                </template>
                <div v-else class="attach-empty">暂无附件</div>
              </div>
            </div>

            <!-- 整改成效 -->
            <div class="form-card">
              <div class="card-title"><span class="bar" />整改成效</div>

              <!-- 整改金额（只读） -->
              <div class="sub-title link-title">整改金额</div>
              <div class="amount-block">
                <div class="amount-item full">
                  <div class="amount-label">合计金额（元）（累计{{ getTotalAmount(rec) }}元）</div>
                  <el-input :model-value="getTotalAmount(rec)" disabled />
                </div>
              </div>
              <el-row :gutter="24" class="amount-row">
                <el-col :span="12">
                  <div class="amount-label"
                    >已纠正违纪金（元）（累计{{ rec.correctedAmount }}元）</div
                  >
                  <el-input :model-value="rec.correctedAmount" disabled />
                </el-col>
                <el-col :span="12">
                  <div class="amount-label"
                    >挽回损失金额（元）（累计{{ rec.recoveredAmount }}元）</div
                  >
                  <el-input :model-value="rec.recoveredAmount" disabled />
                </el-col>
              </el-row>
              <el-row :gutter="24" class="amount-row">
                <el-col :span="12">
                  <div class="amount-label"
                    >工程审减金额（元）（累计{{ rec.auditReducedAmount }}元）</div
                  >
                  <el-input :model-value="rec.auditReducedAmount" disabled />
                </el-col>
                <el-col :span="12">
                  <div class="amount-label"
                    >其他增收节支（元）（累计{{ rec.otherSavingAmount }}元）</div
                  >
                  <el-input :model-value="rec.otherSavingAmount" disabled />
                </el-col>
              </el-row>

              <!-- 累计出台、修订制度（只读，无操作列） -->
              <div class="sub-title link-title block-title">累计出台、修订制度</div>
              <el-table :data="rec.systemRecords" border class="effect-table">
                <el-table-column prop="systemName" label="制度名称" min-width="180" />
                <el-table-column prop="improveType" label="制度完善类型" min-width="160" />
                <el-table-column prop="systemFile" label="制度文件" min-width="180" />
                <el-table-column prop="docNo" label="文号" min-width="160" />
                <el-table-column prop="publishDate" label="发布日期" min-width="160" />
                <template #empty>
                  <el-empty description="暂无数据" :image-size="120" />
                </template>
              </el-table>

              <!-- 累计完善优化业务流程（只读，无操作列） -->
              <div class="sub-title link-title block-title">累计完善优化业务流程</div>
              <el-table :data="rec.processRecords" border class="effect-table">
                <el-table-column prop="processName" label="流程名称" min-width="240" />
                <el-table-column prop="file" label="文件" min-width="280" />
                <el-table-column prop="publishDate" label="发布日期" min-width="220" />
                <template #empty>
                  <el-empty description="暂无数据" :image-size="120" />
                </template>
              </el-table>
            </div>
          </div>
        </div>
      </template>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
  /**
   * 整改历史抽屉（整改单位端）
   * 按提交时间倒序展示某个问题历次已提交的填报快照，默认仅展开最新一期，其余收起
   */
  import { ref, watch, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import { View, Download, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
  import type {
    RectificationHistoryDetail,
    RectificationHistoryAttachment
  } from '@/types/audit-decision'
  import { getRectificationHistoryDetail } from '@/api/audit-decision'

  const props = defineProps<{
    modelValue: boolean
    problemId: number
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
  }>()

  // 抽屉显隐（与父级 v-model 双向绑定）
  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  // 加载状态
  const loading = ref(false)

  // 历次提交记录（已按提交时间倒序）
  const records = ref<RectificationHistoryDetail[]>([])

  // 当前展开的记录索引集合（默认仅最新一期，即排序后的第 0 条）
  const expandedIdx = ref<number[]>([])

  const isExpanded = (idx: number) => expandedIdx.value.includes(idx)

  // 展开/收起某一期
  const toggle = (idx: number) => {
    if (isExpanded(idx)) {
      expandedIdx.value = expandedIdx.value.filter((i) => i !== idx)
    } else {
      expandedIdx.value.push(idx)
    }
  }

  // 单期合计金额 = 四项金额之和（只读）
  const getTotalAmount = (rec: RectificationHistoryDetail) => {
    return (
      (Number(rec.correctedAmount) || 0) +
      (Number(rec.recoveredAmount) || 0) +
      (Number(rec.auditReducedAmount) || 0) +
      (Number(rec.otherSavingAmount) || 0)
    )
  }

  // 措施完成状态文案：1-未完成 2-进行中 3-已完成
  const finishStatusLabel = (status: number | null) => {
    return { 1: '未完成', 2: '进行中', 3: '已完成' }[status ?? 0] ?? '-'
  }

  // 获取历史列表并按提交时间倒序排列，默认展开最新一期
  const fetchDetail = async () => {
    loading.value = true
    try {
      const res = await getRectificationHistoryDetail(props.problemId)
      // 按提交时间字符串倒序（YYYY-MM-DD HH:mm:ss 可直接字典序比较）
      records.value = [...res.data].sort((a, b) =>
        (b.reportTime || '') > (a.reportTime || '') ? 1 : -1
      )
      // 默认仅展开最新一期，其余收起
      expandedIdx.value = records.value.length ? [0] : []
    } catch {
      ElMessage.error('获取整改历史失败')
    } finally {
      loading.value = false
    }
  }

  // 抽屉打开时加载数据
  const handleOpen = () => {
    fetchDetail()
  }

  // 查看附件（Mock 无真实地址，仅提示）
  const handlePreview = (file: RectificationHistoryAttachment) => {
    if (file.url && file.url !== '#') {
      window.open(file.url, '_blank')
    } else {
      ElMessage.info('暂无可预览的文件地址')
    }
  }

  // 下载附件（Mock 无真实地址，仅提示）
  const handleDownload = (file: RectificationHistoryAttachment) => {
    if (file.url && file.url !== '#') {
      window.open(file.url, '_blank')
    } else {
      ElMessage.info('暂无可下载的文件地址')
    }
  }

  // problemId 变化且抽屉打开时重新加载
  watch(
    () => props.problemId,
    () => {
      if (props.modelValue) fetchDetail()
    }
  )
</script>

<style scoped lang="scss">
  /* 去除抽屉 body 默认内边距，避免内容外层出现多余留白框 */
  :deep(.el-drawer__body) {
    padding: 0;
  }

  /* 抽屉内容区（浅灰背景，仅本区域滚动）；两侧仅留 2px 边距，内容近全宽 */
  .history-body {
    padding: 16px 2px;
    background: #f5f7fa;
  }

  /* 单期提交记录容器 */
  .record-panel {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  /* 提交日期栏：左侧日期 + 右侧展开/收起图标，整栏可点击 */
  .record-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    cursor: pointer;
    background: #eef1f6;
    border-radius: 8px;

    .record-date {
      font-size: 14px;
      font-weight: 600;
      color: #303133;

      .record-date-label {
        font-weight: 400;
        color: #606266;
      }
    }

    .record-toggle {
      font-size: 18px;
      color: #909399;
    }

    &:hover .record-toggle {
      color: #409eff;
    }
  }

  .record-body {
    margin-top: 12px;
  }

  /* 表单卡片 */
  .form-card {
    padding: 20px 16px;
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

  /* 措施/进展表格内文本 */
  .measure-text {
    line-height: 1.6;
    color: #606266;
  }

  .measure-table {
    width: 100%;
  }

  /* 佐证附件——只读文件卡 */
  .attach-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    margin-bottom: 8px;

    /* 浅蓝底，呼应填报页已上传附件的视觉 */
    background: #eef4ff;
    border-radius: 8px;

    &:last-child {
      margin-bottom: 0;
    }

    .attach-info {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    /* Word 文件类型角标 */
    .file-type-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      font-size: 12px;
      font-weight: 700;
      color: #fff;
      background: #2b579a; /* Word 品牌蓝 */
      border-radius: 3px;
    }

    .file-name {
      font-size: 14px;
      color: #303133;
    }

    .attach-actions {
      display: flex;
      gap: 16px;
    }

    /* 查看/下载图标按钮 */
    .attach-op {
      font-size: 16px;
      color: #606266;
      cursor: pointer;

      &:hover {
        color: #409eff;
      }
    }
  }

  /* 无附件占位 */
  .attach-empty {
    padding: 12px 0;
    font-size: 13px;
    color: #c0c4cc;
    text-align: center;
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

    /* 制度/流程区块标题上间距 */
    &.block-title {
      margin-top: 24px;
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

  .effect-table {
    width: 100%;
  }
</style>
