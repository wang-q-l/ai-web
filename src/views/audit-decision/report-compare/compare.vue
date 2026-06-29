<template>
  <!-- 统计报表比对 - 比对详情页：台账表头 + 上传 + 双栏对照 -->
  <PageContainer>
    <div class="compare-container">
      <!-- 顶部：返回 + 标题 + 操作 -->
      <div class="page-head">
        <div class="head-left">
          <el-button link @click="handleBack">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
          <span class="page-title">{{ ledger?.name || '台账比对' }}</span>
        </div>
        <div class="head-right">
          <el-button v-if="!viewMode" :disabled="!ledger" @click="handleExportTemplate">
            <el-icon><Download /></el-icon>
            导出标准模板
          </el-button>
          <el-button
            v-if="!viewMode"
            type="primary"
            :disabled="!ledger"
            @click="uploadVisible = true"
          >
            <el-icon><Upload /></el-icon>
            上传比对台账
          </el-button>
        </div>
      </div>

      <!-- 比对结果区 -->
      <div v-if="comparison" class="result-card">
        <!-- 汇总条 -->
        <div class="summary-bar">
          <div class="summary-left">
            <span class="summary-total">共 {{ comparison.summary.total }} 项</span>
            <span class="summary-item consistent">
              <i class="dot"></i>一致 {{ comparison.summary.consistent }}
            </span>
            <span class="summary-item diff">
              <i class="dot"></i>差异 {{ comparison.summary.diff }}
            </span>
            <span class="summary-item missing">
              <i class="dot"></i>缺失 {{ comparison.summary.missing }}
            </span>
            <span class="summary-item extra">
              <i class="dot"></i>多余 {{ comparison.summary.extra }}
            </span>
          </div>
          <!-- 全部一致整体提示 -->
          <div v-if="comparison.summary.isAllConsistent" class="all-consistent-tag">
            <el-icon><CircleCheck /></el-icon>
            数据完全一致
          </div>
        </div>

        <!-- 工具栏：仅看差异 + 差异导航 -->
        <div class="result-toolbar" :class="{ 'diff-mode': showDiffOnly }">
          <div class="toolbar-left">
            <span class="switch-label">仅看差异</span>
            <el-switch v-model="showDiffOnly" />
          </div>
          <div class="toolbar-right">
            <el-button-group>
              <el-button size="small" :disabled="diffKeys.length === 0" @click="navDiff(-1)">
                <el-icon><ArrowUp /></el-icon>上一处差异
              </el-button>
              <el-button size="small" :disabled="diffKeys.length === 0" @click="navDiff(1)">
                下一处差异<el-icon><ArrowDown /></el-icon>
              </el-button>
            </el-button-group>
            <span class="diff-nav-info">
              {{ diffKeys.length ? `差异 ${currentDiffIndex + 1}/${diffKeys.length}` : '无差异项' }}
            </span>
          </div>
        </div>

        <!-- 双栏并排对照表 -->
        <div ref="tableScrollRef" class="compare-table-wrapper">
          <table class="compare-table">
            <thead>
              <tr>
                <th class="col-name">指标名称（系统）</th>
                <th class="col-unit">单位</th>
                <th class="col-value">系统值</th>
                <th class="col-divider"></th>
                <th class="col-name">指标名称（上传）</th>
                <th class="col-unit">单位</th>
                <th class="col-value">上传值</th>
                <th class="col-status">比对结果</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in displayRows"
                :key="row.matchKey"
                :ref="(el) => setRowRef(row.matchKey, el)"
                :class="`row-${row.status}`"
              >
                <!-- 系统侧 -->
                <td class="col-name" :style="{ paddingLeft: 12 + row.level * 16 + 'px' }">
                  {{ row.status === 'extra' ? '—' : row.indicatorName }}
                </td>
                <td class="col-unit">{{ row.status === 'extra' ? '' : row.unit }}</td>
                <td class="col-value num" :class="{ 'diff-cell': row.status === 'diff' }">
                  {{ formatValue(row.baselineValue) }}
                </td>
                <td class="col-divider"></td>
                <!-- 上传侧 -->
                <td class="col-name" :style="{ paddingLeft: 12 + row.level * 16 + 'px' }">
                  {{ row.status === 'missing' ? '—' : row.indicatorName }}
                </td>
                <td class="col-unit">{{ row.status === 'missing' ? '' : row.unit }}</td>
                <td class="col-value num" :class="{ 'diff-cell': row.status === 'diff' }">
                  {{ formatValue(row.uploadedValue) }}
                </td>
                <!-- 状态 -->
                <td class="col-status">
                  <el-tag
                    size="small"
                    effect="light"
                    :type="statusTagType(row.status)"
                    :class="{ 'tag-extra': row.status === 'extra' }"
                  >
                    {{ statusText(row.status) }}
                  </el-tag>
                </td>
              </tr>
            </tbody>
          </table>
          <el-empty v-if="displayRows.length === 0" description="无符合条件的比对项" />
        </div>
      </div>

      <!-- 未比对：左屏系统报表 +（非只读时）右屏上传提示 -->
      <div v-else-if="ledger" class="preview-split">
        <!-- 左屏：系统按模板生成的报表 -->
        <div class="preview-pane">
          <div class="pane-head">{{ ledger.report.header.reportType || '审计统计台账' }}</div>
          <div class="preview-table-wrapper">
            <table class="compare-table single">
              <thead>
                <tr>
                  <th class="col-name">指标名称</th>
                  <th class="col-unit">单位</th>
                  <th class="col-value">指标值</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in ledger.report.rows" :key="row.matchKey">
                  <td class="col-name" :style="{ paddingLeft: 12 + row.level * 16 + 'px' }">
                    {{ row.indicatorName }}
                  </td>
                  <td class="col-unit">{{ row.unit }}</td>
                  <td class="col-value num">{{ formatValue(row.value) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 右屏：上传提示（只读查看模式下不显示） -->
        <div v-if="!viewMode" class="preview-pane upload-pane">
          <el-empty description="点击右上角「上传比对台账」上传同模板文件进行比对">
            <el-button type="primary" @click="uploadVisible = true">
              <el-icon><Upload /></el-icon>
              上传比对台账
            </el-button>
          </el-empty>
        </div>
      </div>

      <!-- 上传比对面板 -->
      <UploadComparePanel
        v-model="uploadVisible"
        @parsed="handleUploadParsed"
        @download-template="handleExportTemplate"
      />
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
  /**
   * 统计报表比对 - 比对详情页
   * 按路由 id 加载基准台账，上传同模板文件后严格比对，双栏对照展示差异
   */
  import { ref, computed, onMounted, nextTick, type ComponentPublicInstance } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import {
    ArrowLeft,
    Download,
    Upload,
    CircleCheck,
    ArrowUp,
    ArrowDown
  } from '@element-plus/icons-vue'
  import * as XLSX from 'xlsx'
  import type {
    BaselineLedger,
    ReportData,
    ComparisonResult,
    ComparisonRow,
    CompareStatus
  } from '@/types/report-compare'
  import { getLedgerDetail, executeComparison, getTemplateIndicators } from '@/api/report-compare'
  import UploadComparePanel from './components/UploadComparePanel.vue'

  const route = useRoute()
  const router = useRouter()

  // 当前台账
  const ledger = ref<BaselineLedger | null>(null)

  // 只读查看模式（从列表点名称进入，仅看报表，无上传/导出操作）
  const viewMode = computed(() => route.query.mode === 'view')

  // 比对结果
  const comparison = ref<ComparisonResult | null>(null)

  // 仅看差异开关
  const showDiffOnly = ref(false)

  // 上传弹窗显隐
  const uploadVisible = ref(false)

  // 显示行：仅看差异时过滤一致项
  const displayRows = computed<ComparisonRow[]>(() => {
    if (!comparison.value) return []
    if (!showDiffOnly.value) return comparison.value.rows
    return comparison.value.rows.filter((r) => r.status !== 'consistent')
  })

  // 差异项（差异/缺失/多余）matchKey 列表，用于导航
  const diffKeys = computed<string[]>(() => {
    if (!comparison.value) return []
    return comparison.value.rows.filter((r) => r.status !== 'consistent').map((r) => r.matchKey)
  })

  // 当前差异导航索引
  const currentDiffIndex = ref(-1)

  // 行 DOM 引用（差异导航滚动定位）
  const rowRefs = new Map<string, HTMLElement>()
  const tableScrollRef = ref<HTMLElement>()
  const setRowRef = (key: string, el: Element | ComponentPublicInstance | null) => {
    if (el) rowRefs.set(key, el as HTMLElement)
    else rowRefs.delete(key)
  }

  // 数值展示：千分位格式化（仅展示层）；空值占位
  const formatValue = (val: string | null): string => {
    if (val === null || val === '') return '—'
    if (/^-?\d+(\.\d+)?$/.test(val)) return Number(val).toLocaleString('zh-CN')
    return val
  }

  // 状态文案
  const statusTextMap: Record<CompareStatus, string> = {
    consistent: '一致',
    diff: '差异',
    missing: '缺失',
    extra: '多余'
  }
  const statusText = (s: CompareStatus) => statusTextMap[s]

  // 状态对应 Tag 颜色
  const statusTagType = (s: CompareStatus) => {
    return ({ consistent: 'success', diff: 'danger', missing: 'warning', extra: 'warning' }[s] ??
      'info') as 'success' | 'danger' | 'warning' | 'info'
  }

  // 加载台账详情
  const fetchLedger = async () => {
    const id = Number(route.query.id)
    if (!id) {
      ElMessage.error('缺少台账参数')
      return
    }
    try {
      const res = await getLedgerDetail(id)
      if (res.code !== 200 || !res.data) {
        ElMessage.error(res.message || '台账不存在')
        return
      }
      ledger.value = res.data
      // 已有比对结果快照时（从「比对结果」入口进入）直接展示
      if (res.data.comparison) {
        comparison.value = res.data.comparison
      }
    } catch {
      ElMessage.error('加载台账失败')
    }
  }

  // 上传面板解析完成：执行比对
  const handleUploadParsed = async (uploaded: ReportData, fileName: string) => {
    if (!ledger.value) return
    try {
      const res = await executeComparison({ ledgerId: ledger.value.id, uploaded, fileName })
      if (res.code !== 200 || !res.data) {
        ElMessage.error(res.message || '比对失败')
        return
      }
      comparison.value = res.data
      currentDiffIndex.value = -1
      uploadVisible.value = false
      ElMessage.success('比对完成')
    } catch {
      ElMessage.error('比对执行失败')
    }
  }

  // 差异项导航：dir=1 下一处，dir=-1 上一处
  const navDiff = (dir: number) => {
    if (diffKeys.value.length === 0) return
    let next = currentDiffIndex.value + dir
    if (next < 0) next = diffKeys.value.length - 1
    if (next >= diffKeys.value.length) next = 0
    currentDiffIndex.value = next
    const key = diffKeys.value[next]
    nextTick(() => {
      const el = rowRefs.get(key)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.classList.add('row-focus')
        setTimeout(() => el.classList.remove('row-focus'), 1200)
      }
    })
  }

  // 导出标准模板（空白值，供线下填报）
  const handleExportTemplate = async () => {
    if (!ledger.value) return
    try {
      const res = await getTemplateIndicators(ledger.value.auditType)
      if (res.code !== 200 || !res.data) {
        ElMessage.warning(res.message || '该审计类型暂无模板')
        return
      }
      const aoa = [
        ['指标名称', '指标单位', '指标值'],
        ...res.data.map((r) => ['  '.repeat(r.level) + r.indicatorName, r.unit, ''])
      ]
      const ws = XLSX.utils.aoa_to_sheet(aoa)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, '审计统计台账')
      XLSX.writeFile(wb, `${ledger.value.reportType || '审计统计台账'}-标准模板.xlsx`)
    } catch {
      ElMessage.error('导出模板失败')
    }
  }

  // 返回列表
  const handleBack = () => {
    router.push({ path: '/audit-decision/report-compare' })
  }

  // 初始化
  onMounted(() => {
    fetchLedger()
  })
</script>

<style scoped lang="scss">
  .compare-container {
    display: flex;
    flex-direction: column;
    gap: 12px;

    /* PageContainer 为透传元素无确定高度，改用项目全局高度变量，避免整页滚动 */
    height: var(--art-full-height, calc(100vh - 120px));
    padding: 16px;
    overflow: hidden; /* 页面整体不滚动，滚动交给内部表格 */
    background: var(--art-bg-color, #f2f2f6);
  }

  /* 顶部头 */
  .page-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: #fff;
    border-radius: 12px;

    .head-left {
      display: flex;
      gap: 12px;
      align-items: center;

      .page-title {
        font-size: 16px;
        font-weight: 600;
        color: #1d2129;
      }
    }

    .head-right {
      display: flex;
      gap: 8px;
    }
  }

  /* 未比对：左右分屏 */
  .preview-split {
    display: flex;
    flex: 1;
    gap: 12px;
    min-height: 0; /* 允许子项在固定高度内滚动 */
    overflow: hidden;
  }

  .preview-pane {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
    background: #fff;
    border-radius: 12px;

    .pane-head {
      flex-shrink: 0;
      padding: 14px 16px;
      font-size: 15px;
      font-weight: 600;
      color: #1d2129;
      text-align: center;
      border-bottom: 1px solid #eaebf1;
    }
  }

  /* 右屏上传提示居中（始终在一屏可视范围内） */
  .upload-pane {
    align-items: center;
    justify-content: center;
  }

  .preview-table-wrapper {
    flex: 1;
    min-height: 0;
    overflow: auto; /* 仅表体滚动，表头 sticky 固定 */
  }

  /* APPEND-STYLE-2 */

  /* 比对结果区 */
  .result-card {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0; /* 撑满剩余高度，内部表格滚动 */
    background: #fff;
    border-radius: 12px;
  }

  /* 汇总条 */
  .summary-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 52px;
    padding: 0 16px;
    border-bottom: 1px solid #eaebf1;

    .summary-left {
      display: flex;
      gap: 20px;
      align-items: center;
    }

    .summary-total {
      font-size: 15px;
      font-weight: 600;
      color: #1d2129;
    }

    .summary-item {
      display: flex;
      gap: 6px;
      align-items: center;
      font-size: 14px;
      font-weight: 600;
      font-variant-numeric: tabular-nums;

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      &.consistent {
        color: #166534;

        .dot {
          background: #4ade80;
        }
      }

      &.diff {
        color: #b91c1c;

        .dot {
          background: #ef4444;
        }
      }

      &.missing {
        color: #92400e;

        .dot {
          background: #fbbf24;
        }
      }

      &.extra {
        color: #9a3412;

        .dot {
          background: #fb923c;
        }
      }
    }

    .all-consistent-tag {
      display: flex;
      gap: 6px;
      align-items: center;
      padding: 4px 12px;
      font-size: 14px;
      font-weight: 600;
      color: #166534;
      background: #f0fdf4;
      border: 1px solid #86efac;
      border-radius: 6px;
    }
  }

  /* 结果工具栏 */
  .result-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 48px;
    padding: 0 16px;
    border-bottom: 1px solid #eaebf1;
    transition: background 0.2s;

    &.diff-mode {
      background: rgb(40 118 255 / 4%);
    }

    .toolbar-left {
      display: flex;
      gap: 8px;
      align-items: center;

      .switch-label {
        font-size: 13px;
        color: #4b5675;
      }
    }

    .toolbar-right {
      display: flex;
      gap: 12px;
      align-items: center;

      .diff-nav-info {
        font-size: 12px;
        color: #78829d;
      }
    }
  }

  /* APPEND-STYLE-3 */

  /* 双栏对照表 */
  .compare-table-wrapper {
    flex: 1;
    min-height: 0;
    overflow: auto; /* 仅表体滚动，表头 sticky 固定 */
  }

  .compare-table {
    width: 100%;
    font-size: 13px;
    border-collapse: collapse;

    th,
    td {
      padding: 0 12px;
      text-align: left;
      border-bottom: 1px solid #eaebf1;
    }

    thead th {
      position: sticky;
      top: 0;
      z-index: 1;
      height: 38px;
      font-size: 13px;
      font-weight: 500;
      color: #4b5675;
      background: #f5f7fa;
    }

    tbody tr {
      height: 40px;
      transition: background 0.15s;

      &:hover {
        filter: brightness(0.985);
      }
    }

    .col-name {
      min-width: 200px;
    }

    .col-unit {
      width: 70px;
      color: #78829d;
    }

    .col-value {
      width: 130px;
    }

    /* 数值列右对齐 + 等宽数字 */
    .num {
      font-variant-numeric: tabular-nums;
      text-align: right;
    }

    .col-divider {
      width: 12px;
      padding: 0;
      background: #f2f2f6;
      border-bottom: none;
    }

    .col-status {
      width: 90px;
      text-align: center;
    }

    /* 四种状态整行着色 + 左侧标记条 */
    .row-consistent {
      background: #f0fdf4;

      td:first-child {
        border-left: 3px solid #86efac;
      }
    }

    .row-diff {
      background: #fef2f2;

      td:first-child {
        border-left: 3px solid #ef4444;
      }

      .diff-cell {
        font-weight: 600;
        color: #b91c1c;
        border-bottom: 1px dashed #ef4444;
      }
    }

    .row-missing {
      background: #fefce8;

      td:first-child {
        border-left: 3px solid #fbbf24;
      }
    }

    .row-extra {
      background: #fff7ed;

      td:first-child {
        border-left: 3px solid #fb923c;
      }
    }

    /* 差异导航定位高亮闪烁 */
    .row-focus {
      animation: row-flash 1.2s ease;
    }
  }

  @keyframes row-flash {
    0%,
    100% {
      box-shadow: inset 0 0 0 0 transparent;
    }

    30% {
      box-shadow: inset 0 0 0 2px var(--el-color-primary);
    }
  }

  /* 多余状态 Tag 用橙色（区别于缺失的黄色） */
  :deep(.el-tag.tag-extra) {
    color: #9a3412;
    background: #fff7ed;
    border-color: #fed7aa;
  }

  /* 单栏预览表（左屏系统报表）列宽 */
  .compare-table.single {
    .col-name {
      min-width: 280px;
    }

    .col-value {
      width: 160px;
    }
  }
</style>
