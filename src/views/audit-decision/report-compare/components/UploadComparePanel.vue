<template>
  <!-- 上传比对台账弹窗：拖拽/点击上传 Excel/CSV，前端解析 + 模板校验 -->
  <el-dialog
    :model-value="modelValue"
    title="上传比对台账"
    width="560px"
    @update:model-value="(v) => emit('update:modelValue', v)"
    @close="handleClose"
  >
    <!-- 上传拖拽区 -->
    <el-upload
      drag
      :auto-upload="false"
      :show-file-list="false"
      :accept="acceptTypes"
      :on-change="handleFileChange"
    >
      <el-icon class="upload-icon"><UploadFilled /></el-icon>
      <div class="upload-text">将文件拖到此处，或<em>点击上传</em></div>
      <div class="upload-tip">仅支持 .xlsx / .xls / .csv，且需与所选审计类型模板一致</div>
    </el-upload>

    <!-- 下载标准模板入口（避免用户填错模板） -->
    <div class="template-tip">
      <span>不确定模板格式？</span>
      <el-button link type="primary" @click="emit('download-template')">
        <el-icon><Download /></el-icon>
        下载标准模板
      </el-button>
    </div>

    <!-- 已选文件信息 -->
    <div v-if="fileName" class="file-info">
      <el-icon><Document /></el-icon>
      <span class="file-name">{{ fileName }}</span>
      <el-tag v-if="parsedRows.length" type="success" size="small">
        已解析 {{ parsedRows.length }} 项
      </el-tag>
    </div>

    <!-- 解析错误提示 -->
    <el-alert
      v-if="errorMsg"
      :title="errorMsg"
      type="error"
      :closable="false"
      show-icon
      class="error-alert"
    />

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :disabled="parsedRows.length === 0" @click="handleConfirm">
        开始比对
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  /**
   * 上传比对台账弹窗组件
   * 解析上传的 Excel/CSV，校验模板（关键列存在性），归一化指标后通过 parsed 事件回传父组件比对
   */
  import { ref } from 'vue'
  import { ElMessage, type UploadFile } from 'element-plus'
  import { UploadFilled, Document, Download } from '@element-plus/icons-vue'
  import * as XLSX from 'xlsx'
  import type { ReportData, ReportRow, ReportHeader } from '@/types/report-compare'

  defineProps<{
    modelValue: boolean
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    // 解析成功：回传上传报表数据 + 文件名
    parsed: [data: ReportData, fileName: string]
    // 请求下载标准模板（由父组件按当前审计类型导出）
    'download-template': []
  }>()

  // 允许的文件类型
  const acceptTypes = '.xlsx,.xls,.csv'

  // 文件名、解析结果、错误信息
  const fileName = ref('')
  const parsedRows = ref<ReportRow[]>([])
  const parsedHeader = ref<ReportHeader>({})
  const errorMsg = ref('')

  // 全半角统一 + 去前后空格（与后端归一化规则一致）
  const normalize = (text: string): string => {
    return String(text ?? '')
      .replace(/[！-～]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
      .replace(/\u3000/g, ' ')
      .trim()
  }

  // APPEND-MARKER-UPLOAD

  // 由缩进推断层级（模板导出时每层用 2 个空格缩进），并构建层级路径匹配键
  const buildRows = (aoa: string[][]): ReportRow[] => {
    const pathStack: string[] = []
    const rows: ReportRow[] = []
    aoa.forEach((cols) => {
      const rawName = cols[0] ?? ''
      if (!normalize(rawName)) return // 跳过空行
      // 计算前导空格数 → 层级（2 空格 1 级），兼容全角空格
      const leading = rawName.match(/^[\s\u3000]*/)?.[0].replace(/\u3000/g, '  ').length ?? 0
      const level = Math.floor(leading / 2)
      const name = normalize(rawName)
      pathStack[level] = name
      pathStack.length = level + 1
      const matchKey = pathStack.slice(0, level + 1).join('/')
      rows.push({
        indicatorName: name,
        unit: normalize(cols[1] ?? ''),
        value: normalize(cols[2] ?? ''),
        level,
        matchKey
      })
    })
    return rows
  }

  // 校验表头是否含关键列（指标名称/指标单位/指标值），返回数据起始行索引；不符返回 -1
  const validateAndLocate = (aoa: string[][]): number => {
    for (let i = 0; i < Math.min(aoa.length, 10); i++) {
      const joined = (aoa[i] || []).map((c) => normalize(c)).join('|')
      if (joined.includes('指标名称') && joined.includes('指标值')) {
        return i + 1 // 表头下一行起为数据
      }
    }
    return -1
  }

  // 解析文件（统一用 xlsx 读取，CSV 也由 xlsx 解析）
  const parseFile = (file: File) => {
    errorMsg.value = ''
    parsedRows.value = []
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array' })
        if (!wb.SheetNames.length) {
          errorMsg.value = '文件为空或无有效工作表，请检查后重新上传'
          return
        }
        const ws = wb.Sheets[wb.SheetNames[0]]
        // 转为二维数组（保留空单元格，按文本读取）
        const aoa = XLSX.utils.sheet_to_json<string[]>(ws, {
          header: 1,
          blankrows: false,
          raw: false,
          defval: ''
        })
        if (!aoa.length) {
          errorMsg.value = '文件内容为空，请检查后重新上传'
          return
        }
        // 模板校验
        const dataStart = validateAndLocate(aoa)
        if (dataStart === -1) {
          errorMsg.value = '模板不匹配：未找到「指标名称/指标值」列，请下载标准模板后填报'
          return
        }
        const rows = buildRows(aoa.slice(dataStart))
        if (rows.length === 0) {
          errorMsg.value = '未解析到任何指标数据，请检查文件内容'
          return
        }
        parsedRows.value = rows
        parsedHeader.value = { reportType: '上传台账' }
      } catch {
        errorMsg.value = '文件解析失败，可能已损坏或格式不正确，请重新上传'
      }
    }
    reader.onerror = () => {
      errorMsg.value = '文件读取失败，请重试'
    }
    reader.readAsArrayBuffer(file)
  }

  // 选择文件（el-upload on-change）
  const handleFileChange = (uploadFile: UploadFile) => {
    const raw = uploadFile.raw
    if (!raw) return
    // 类型校验
    const ext = raw.name.slice(raw.name.lastIndexOf('.')).toLowerCase()
    if (!['.xlsx', '.xls', '.csv'].includes(ext)) {
      errorMsg.value = '仅支持 .xlsx / .xls / .csv 格式文件'
      return
    }
    // 大小校验（10MB）
    if (raw.size > 10 * 1024 * 1024) {
      errorMsg.value = '文件过大（超过 10MB），请精简后重新上传'
      return
    }
    fileName.value = raw.name
    parseFile(raw)
  }

  // 确认比对：回传解析结果
  const handleConfirm = () => {
    if (parsedRows.value.length === 0) {
      ElMessage.warning('请先上传并成功解析文件')
      return
    }
    emit('parsed', { header: parsedHeader.value, rows: parsedRows.value }, fileName.value)
  }

  // 关闭并重置
  const handleClose = () => {
    fileName.value = ''
    parsedRows.value = []
    parsedHeader.value = {}
    errorMsg.value = ''
    emit('update:modelValue', false)
  }
</script>

<style scoped lang="scss">
  .upload-icon {
    margin-bottom: 12px;
    font-size: 48px;
    color: #c0c4cc;
  }

  .upload-text {
    font-size: 14px;
    color: #606266;

    em {
      font-style: normal;
      color: var(--el-color-primary);
    }
  }

  .upload-tip {
    margin-top: 8px;
    font-size: 12px;
    color: #99a1b7;
  }

  /* 下载模板入口 */
  .template-tip {
    display: flex;
    gap: 4px;
    align-items: center;
    margin-top: 12px;
    font-size: 13px;
    color: #78829d;
  }

  .file-info {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-top: 16px;
    font-size: 13px;
    color: #1d2129;

    .file-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .error-alert {
    margin-top: 12px;
  }
</style>
