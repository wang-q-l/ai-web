<template>
  <el-drawer
    v-model="visible"
    :title="isEdit ? '编辑审计移送' : '新增审计移送'"
    :size="documentViewMode ? '95%' : '60%'"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 分屏布局 -->
    <div :class="['drawer-content', { 'split-view': documentViewMode }]">
      <!-- 左侧：文书预览 -->
      <div v-if="documentViewMode" class="document-preview">
        <div class="preview-header">
          <span class="preview-title">{{ documentFileName }}</span>
        </div>
        <div class="preview-body">
          <!-- 模拟文书内容 -->
          <div class="document-content">
            <div class="document-header">
              <h2>审计移送书</h2>
              <p class="doc-number">{{ formData.transferCode || 'ZK审计移字〔2026〕第001号' }}</p>
            </div>

            <div class="document-body">
              <p class="recipient"
                ><strong>{{ formData.mainRecipient || '主送单位' }}：</strong></p
              >

              <p class="indent">
                根据《中华人民共和国审计法》及相关法律法规的规定，我部门在审计过程中发现以下问题，
                现依法移送贵单位处理。
              </p>

              <h3>一、移送事项</h3>
              <p class="indent"> <strong>移送文书名称：</strong>{{ formData.transferName }} </p>
              <p class="indent"> <strong>责任单位：</strong>{{ formData.responsibleUnit }} </p>
              <p class="indent">
                <strong>移送类型：</strong
                >{{ formData.transferType === 1 ? '事项移送' : '人员移送' }}
              </p>

              <h3>二、问题描述</h3>
              <p class="indent">
                {{
                  formData.transferContent ||
                  '经审计发现，被审计单位存在违规违纪行为，需要移送相关部门进行处理。'
                }}
              </p>

              <h3 v-if="formData.transferType === 2">三、涉及人员</h3>
              <div
                v-if="
                  formData.transferType === 2 &&
                  formData.personnelList &&
                  formData.personnelList.length > 0
                "
                class="personnel-list"
              >
                <p v-for="(person, index) in formData.personnelList" :key="index" class="indent">
                  {{ index + 1 }}. {{ person.personnelName }}， {{ person.personnelPosition }}，
                  {{ person.personnelUnit }}
                </p>
              </div>

              <h3>{{ formData.transferType === 2 ? '四' : '三' }}、移送要求</h3>
              <p class="indent">
                请贵单位收到本移送书后，依法依规进行调查处理，并将处理结果及时反馈我部门。
              </p>

              <div class="document-footer">
                <p class="signature">
                  <span class="org-name">{{ formData.responsibleUnit || '审计部门' }}</span>
                  <span class="date">{{ formData.issueDate || '2026年4月10日' }}</span>
                </p>
              </div>

              <div class="document-notes">
                <p v-if="formData.ccRecipient"><strong>抄送：</strong>{{ formData.ccRecipient }}</p>
                <p class="print-info"
                  >本移送书一式三份，主送单位一份，抄送单位一份，我部门存档一份。</p
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：表单 -->
      <div class="form-container">
        <el-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-width="120px"
          class="transfer-form"
        >
          <!-- 移送文书信息 -->
          <div class="form-section">
            <div class="section-title">
              <span>移送文书信息</span>
              <!-- 文书操作区域 -->
              <div class="document-actions-inline">
                <!-- 文书入口前的批注徽章 -->
                <span
                  v-if="!documentViewMode"
                  class="document-tip-badge"
                  @click.stop="documentTipVisible = !documentTipVisible"
                  >3</span
                >
                <!-- 只有一个文书时，显示文件名链接 -->
                <el-button
                  v-if="!documentViewMode && attachmentFiles.length === 1"
                  type="primary"
                  link
                  size="small"
                  @click="handleOpenDocument(attachmentFiles[0])"
                >
                  <el-icon><FolderOpened /></el-icon>
                  {{ attachmentFiles[0].name }}
                </el-button>
                <!-- 多个文书时，显示下拉选择 -->
                <el-dropdown
                  v-if="!documentViewMode && attachmentFiles.length > 1"
                  @command="handleOpenDocument"
                >
                  <el-button type="primary" link size="small">
                    <el-icon><FolderOpened /></el-icon>
                    打开文书
                    <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        v-for="file in attachmentFiles"
                        :key="file.uid"
                        :command="file"
                      >
                        {{ file.name }}
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <!-- 没有文书时，显示文书名称链接 -->
                <el-button
                  v-if="!documentViewMode && attachmentFiles.length === 0"
                  type="primary"
                  link
                  size="small"
                  @click="handlePreviewDocument"
                >
                  <el-icon><FolderOpened /></el-icon>
                  审计移送文书.pdf
                </el-button>
                <!-- 关闭文书按钮 -->
                <el-button v-if="documentViewMode" link size="small" @click="closeDocumentView">
                  <el-icon><Close /></el-icon>
                  关闭文书
                </el-button>
              </div>
            </div>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="移送文书名称" prop="transferName">
                  <el-input
                    v-model="formData.transferName"
                    placeholder="请输入移送文书名称"
                    maxlength="100"
                    show-word-limit
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="移送文书文号" prop="transferCode">
                  <el-input
                    v-model="formData.transferCode"
                    placeholder="请输入移送文书文号"
                    maxlength="50"
                    show-word-limit
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="文书出具时间" prop="issueDate">
                  <el-date-picker
                    v-model="formData.issueDate"
                    type="date"
                    placeholder="请选择文书出具时间"
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="责任单位" prop="responsibleUnit">
                  <template #label>
                    <span class="form-label-with-badge">
                      <span
                        class="form-label-badge"
                        @click.stop="responsibleUnitTipVisible = !responsibleUnitTipVisible"
                        >2</span
                      >
                      责任单位
                    </span>
                  </template>
                  <el-tree-select
                    v-model="formData.responsibleUnit"
                    :data="departmentTreeOptions"
                    :props="{ label: 'name' }"
                    node-key="name"
                    placeholder="请选择责任单位"
                    clearable
                    check-strictly
                    :render-after-expand="false"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="主送部门" prop="mainRecipient">
                  <template #label>
                    <span class="form-label-with-badge">
                      <span
                        class="form-label-badge"
                        @click.stop="mainRecipientTipVisible = !mainRecipientTipVisible"
                        >3</span
                      >
                      主送部门
                    </span>
                  </template>
                  <el-select
                    v-model="formData.mainRecipient"
                    placeholder="请选择主送部门"
                    clearable
                    style="width: 100%"
                  >
                    <el-option
                      v-for="item in MAIN_RECIPIENT_OPTIONS"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="抄送部门">
                  <el-input
                    v-model="formData.ccRecipient"
                    placeholder="请输入抄送部门"
                    maxlength="100"
                    show-word-limit
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="移送类型" prop="transferType">
                  <template #label>
                    <span class="form-label-with-badge">
                      <span
                        class="form-label-badge"
                        @click.stop="transferTypeTipVisible = !transferTypeTipVisible"
                        >1</span
                      >
                      移送类型
                    </span>
                  </template>
                  <el-radio-group v-model="formData.transferType">
                    <el-radio :value="1">事项</el-radio>
                    <el-radio :value="2">人员</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="移送内容" prop="transferContent">
                  <el-input
                    v-model="formData.transferContent"
                    type="textarea"
                    :rows="6"
                    placeholder="请输入移送内容"
                    maxlength="2000"
                    show-word-limit
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 移送人员信息（仅当移送类型为"人员"时显示） -->
          <div v-if="formData.transferType === 2" class="form-section">
            <div class="section-title">
              <span>移送人员信息</span>
              <div class="title-actions">
                <el-button size="small" @click="handleDownloadTemplate">
                  <el-icon><Download /></el-icon>
                  模板下载
                </el-button>
                <el-upload
                  ref="uploadRef"
                  :auto-upload="false"
                  :show-file-list="false"
                  accept=".xlsx,.xls"
                  :on-change="handleImportFile"
                >
                  <el-button size="small" type="success">
                    <el-icon><Upload /></el-icon>
                    批量导入
                  </el-button>
                </el-upload>
                <el-button type="primary" size="small" @click="handleAddPersonnel">
                  <el-icon><Plus /></el-icon>
                  添加人员
                </el-button>
              </div>
            </div>

            <el-table :data="formData.personnelList" border style="width: 100%">
              <el-table-column type="index" label="序号" width="60" />
              <el-table-column prop="personnelName" label="人员姓名" width="100" />
              <el-table-column prop="personnelCategory" label="人员类别" width="130">
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
                width="150"
                show-overflow-tooltip
              />
              <el-table-column
                prop="personnelPosition"
                label="人员职务"
                width="140"
                show-overflow-tooltip
              />
              <el-table-column prop="positionLevel" label="职务级别" width="110">
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
              <el-table-column label="操作" width="80" fixed="right">
                <template #default="{ $index }">
                  <el-button link type="danger" @click="handleDeletePersonnel($index)">
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form>
      </div>
    </div>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit"> 确定 </el-button>
      </div>
    </template>

    <!-- 人员信息弹窗 -->
    <PersonnelDialog
      v-model="personnelDialogVisible"
      :personnel-data="currentPersonnel"
      @confirm="handlePersonnelConfirm"
    />

    <!-- 移送类型批注详情面板 -->
    <Teleport to="body">
      <AnnotationPanel
        v-if="transferTypeTipVisible"
        :annotation="transferTypeAnnotation"
        :index="0"
        :edit-mode="false"
        @close="transferTypeTipVisible = false"
      />
      <AnnotationPanel
        v-if="responsibleUnitTipVisible"
        :annotation="responsibleUnitAnnotation"
        :index="1"
        :edit-mode="false"
        @close="responsibleUnitTipVisible = false"
      />
      <AnnotationPanel
        v-if="mainRecipientTipVisible"
        :annotation="mainRecipientAnnotation"
        :index="3"
        :edit-mode="false"
        @close="mainRecipientTipVisible = false"
      />
      <AnnotationPanel
        v-if="documentTipVisible"
        :annotation="documentTipAnnotation"
        :index="2"
        :edit-mode="false"
        @close="documentTipVisible = false"
      />
    </Teleport>
  </el-drawer>
</template>

<script setup lang="ts">
  /**
   * 审计移送新增/编辑抽屉组件
   * 支持新增和编辑审计移送记录，包括移送人员信息管理
   */
  import { ref, reactive, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import {
    Plus,
    Delete,
    Download,
    Upload,
    FolderOpened,
    Close,
    ArrowDown
  } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules, UploadFile, UploadUserFile } from 'element-plus'
  import type { AuditTransferForm, TransferPersonnel } from '@/types/audit-transfer'
  import {
    getAuditTransferDetail,
    addAuditTransfer,
    updateAuditTransfer
  } from '@/api/audit-transfer'
  import PersonnelDialog from './PersonnelDialog.vue'
  import * as XLSX from 'xlsx'
  import AnnotationPanel from '@/components/Annotation/AnnotationPanel.vue'
  import type { AnnotationItem } from '@/components/Annotation/types'
  import { getDepartmentList } from '@/api/organization'

  // 移送类型批注
  const transferTypeTipVisible = ref(false)
  const transferTypeAnnotation: AnnotationItem = {
    id: 'transfer-type-tip',
    type: 'position',
    selector: '',
    position: { x: 0, y: 0 },
    title: '移送类型',
    content: '当类型为人员时显示人员维护信息，如为事项则不显示人员信息部分。',
    category: 'rule',
    source: '',
    createdAt: '2026-05-28'
  }

  // 责任单位批注
  const responsibleUnitTipVisible = ref(false)
  const responsibleUnitAnnotation: AnnotationItem = {
    id: 'transfer-responsible-unit-tip',
    type: 'position',
    selector: '',
    position: { x: 0, y: 0 },
    title: '责任单位',
    content: '机构树单选。',
    category: 'rule',
    source: '',
    createdAt: '2026-05-28'
  }

  // 主送部门批注（字典维护）
  const mainRecipientTipVisible = ref(false)
  const mainRecipientAnnotation: AnnotationItem = {
    id: 'transfer-main-recipient-tip',
    type: 'position',
    selector: '',
    position: { x: 0, y: 0 },
    title: '字典维护',
    content:
      '主送部门为下拉单选，下拉值来源于字典维护，包括：纪委监察部门、公安检察机关、主管部门、其他。',
    category: 'rule',
    source: '',
    createdAt: '2026-06-10'
  }

  // 打开文书批注
  const documentTipVisible = ref(false)
  const documentTipAnnotation: AnnotationItem = {
    id: 'transfer-document-tip',
    type: 'position',
    selector: '',
    position: { x: 0, y: 0 },
    title: '打开文书',
    content:
      '文书来源于整改项目信息里的移送文书，如文书只有一份则直接显示文书名称，如文书有多份则移入时显示文书目录，根据情况打开对应文书。',
    category: 'rule',
    source: '',
    createdAt: '2026-05-29'
  }

  // 部门树
  const departmentTreeOptions = ref<any[]>([])
  const loadDepartmentTree = async () => {
    try {
      const res = await getDepartmentList()
      departmentTreeOptions.value = res.data || []
    } catch {
      departmentTreeOptions.value = []
    }
  }
  loadDepartmentTree()

  // 主送部门字典（字典维护：纪委监察部门 / 公安检察机关 / 主管部门 / 其他）
  const MAIN_RECIPIENT_OPTIONS = [
    { label: '纪委监察部门', value: '纪委监察部门' },
    { label: '公安检察机关', value: '公安检察机关' },
    { label: '主管部门', value: '主管部门' },
    { label: '其他', value: '其他' }
  ]

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
    success: []
  }>()

  // 抽屉显示状态
  const visible = ref(false)
  watch(
    () => props.modelValue,
    (val) => {
      visible.value = val
      if (val) {
        if (props.transferId) {
          fetchDetail()
        } else {
          resetForm()
        }
      }
    }
  )
  watch(visible, (val) => {
    emit('update:modelValue', val)
  })

  // 是否编辑模式
  const isEdit = ref(false)

  // 表单引用
  const formRef = ref<FormInstance>()

  // 表单数据
  const formData = reactive<AuditTransferForm>({
    transferName: '',
    transferCode: '',
    issueDate: '',
    responsibleUnit: '',
    transferType: 1,
    mainRecipient: '',
    ccRecipient: '',
    transferContent: '',
    personnelList: []
  })

  // 表单验证规则
  const rules: FormRules = {
    transferName: [{ required: true, message: '请输入移送文书名称', trigger: 'blur' }],
    transferCode: [{ required: true, message: '请输入移送文书文号', trigger: 'blur' }],
    issueDate: [{ required: true, message: '请选择文书出具时间', trigger: 'change' }],
    responsibleUnit: [{ required: true, message: '请选择责任单位', trigger: 'change' }],
    transferType: [{ required: true, message: '请选择移送类型', trigger: 'change' }],
    mainRecipient: [{ required: true, message: '请输入主送部门', trigger: 'blur' }],
    transferContent: [{ required: true, message: '请输入移送内容', trigger: 'blur' }]
  }

  // 提交加载状态
  const submitLoading = ref(false)

  // 人员信息弹窗
  const personnelDialogVisible = ref(false)
  const currentPersonnel = ref<TransferPersonnel | null>(null)
  const currentPersonnelIndex = ref<number>(-1)

  // 文书查看器状态
  const documentViewMode = ref(false)
  const documentUrl = ref('')
  const documentType = ref<'pdf' | 'image'>('pdf')
  const documentFileName = ref('')

  // 附件文件列表（用于文书查看）
  const attachmentFiles = ref<UploadUserFile[]>([])

  // 获取详情
  const fetchDetail = async () => {
    if (!props.transferId) return

    try {
      const res = await getAuditTransferDetail(props.transferId)
      const detail = res.data
      if (!detail) return

      isEdit.value = true

      // 填充表单数据
      formData.transferName = detail.transferName
      formData.transferCode = detail.transferCode
      formData.issueDate = detail.issueDate
      formData.responsibleUnit = detail.responsibleUnit
      formData.transferType = detail.transferType
      formData.mainRecipient = detail.mainRecipient
      formData.ccRecipient = detail.ccRecipient || ''
      formData.transferContent = detail.transferContent

      // 如果是人员类型，获取人员列表
      if (detail.transferType === 2) {
        const { getTransferPersonnelList } = await import('@/api/audit-transfer')
        const personnelRes = await getTransferPersonnelList(props.transferId)
        formData.personnelList = personnelRes.data
      }

      // 加载附件列表（用于文书查看）
      if (detail.attachments && detail.attachments.length > 0) {
        attachmentFiles.value = detail.attachments.map((file: any) => ({
          name: file.name,
          url: file.url,
          uid: file.id || Date.now(),
          status: 'success'
        }))
      }
    } catch {
      ElMessage.error('获取详情失败')
    }
  }

  // 重置表单
  const resetForm = () => {
    isEdit.value = false
    formData.transferName = ''
    formData.transferCode = ''
    formData.issueDate = ''
    formData.responsibleUnit = ''
    formData.transferType = 1
    formData.mainRecipient = ''
    formData.ccRecipient = ''
    formData.transferContent = ''
    formData.personnelList = []
    attachmentFiles.value = []
    formRef.value?.clearValidate()
  }

  // 添加人员
  const handleAddPersonnel = () => {
    currentPersonnel.value = null
    currentPersonnelIndex.value = -1
    personnelDialogVisible.value = true
  }

  // 删除人员
  const handleDeletePersonnel = (index: number) => {
    formData.personnelList!.splice(index, 1)
  }

  // 人员信息确认
  const handlePersonnelConfirm = (personnel: TransferPersonnel) => {
    if (currentPersonnelIndex.value === -1) {
      // 新增
      if (!formData.personnelList) {
        formData.personnelList = []
      }
      formData.personnelList.push(personnel)
    } else {
      // 编辑
      formData.personnelList![currentPersonnelIndex.value] = personnel
    }
  }

  // 下载模板
  const handleDownloadTemplate = () => {
    // 创建模板数据
    const templateData = [
      {
        人员姓名: '张三',
        人员类别: '国家公务员',
        人员所在单位: '市财政局',
        人员职务: '财务部门负责人',
        职务级别: '县处级',
        是否党员: '是',
        问题发生时所在单位: '市财政局'
      }
    ]

    // 创建工作簿
    const ws = XLSX.utils.json_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '移送人员信息')

    // 下载文件
    XLSX.writeFile(wb, '移送人员信息导入模板.xlsx')
    ElMessage.success('模板下载成功')
  }

  // 批量导入
  const handleImportFile = (file: UploadFile) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[]

        if (jsonData.length === 0) {
          ElMessage.warning('导入文件为空')
          return
        }

        // 转换数据格式
        const personnelList: TransferPersonnel[] = jsonData.map((row) => {
          // 人员类别映射
          const categoryMap: Record<string, number> = {
            国家公务员: 1,
            国有企业人员: 2,
            事业编制人员: 3,
            其他公职人员: 4
          }

          // 职务级别映射
          const levelMap: Record<string, number> = {
            地厅级: 1,
            县处级: 2,
            乡科级: 3,
            乡科级以下: 4,
            其他: 5
          }

          return {
            personnelName: row['人员姓名'] || '',
            personnelCategory: categoryMap[row['人员类别']] || 4,
            personnelUnit: row['人员所在单位'] || '',
            personnelPosition: row['人员职务'] || '',
            positionLevel: levelMap[row['职务级别']] || 5,
            isPartyMember: row['是否党员'] === '是' ? 1 : 0,
            problemOccurredUnit: row['问题发生时所在单位'] || ''
          }
        })

        // 添加到表单数据
        if (!formData.personnelList) {
          formData.personnelList = []
        }
        formData.personnelList.push(...personnelList)
        ElMessage.success(`成功导入 ${personnelList.length} 条人员信息`)
      } catch {
        ElMessage.error('导入失败，请检查文件格式')
      }
    }
    reader.readAsArrayBuffer(file.raw!)
  }

  // 提交
  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (!valid) return

      // 如果是人员类型，检查是否添加了人员
      if (
        formData.transferType === 2 &&
        (!formData.personnelList || formData.personnelList.length === 0)
      ) {
        ElMessage.warning('请至少添加一个移送人员')
        return
      }

      submitLoading.value = true
      try {
        if (isEdit.value && props.transferId) {
          await updateAuditTransfer(props.transferId, formData)
          ElMessage.success('编辑成功')
        } else {
          await addAuditTransfer(formData)
          ElMessage.success('新增成功')
        }
        emit('success')
        handleClose()
      } catch {
        ElMessage.error(isEdit.value ? '编辑失败' : '新增失败')
      } finally {
        submitLoading.value = false
      }
    })
  }

  // 关闭
  const handleClose = () => {
    visible.value = false
    resetForm()
    // 关闭文书查看
    closeDocumentView()
  }

  // 打开文书
  const handleOpenDocument = (file: UploadUserFile) => {
    if (!file.url) {
      ElMessage.error('文件地址不存在')
      return
    }

    // 判断文件类型
    const fileName = file.name || ''
    const fileExt = fileName.split('.').pop()?.toLowerCase()

    if (fileExt === 'pdf') {
      documentType.value = 'pdf'
    } else if (['jpg', 'jpeg', 'png'].includes(fileExt || '')) {
      documentType.value = 'image'
    } else {
      ElMessage.error('仅支持 PDF 和图片格式')
      return
    }

    // 设置预览 URL
    documentUrl.value = file.url
    documentFileName.value = fileName
    documentViewMode.value = true
  }

  // 关闭文书查看
  const closeDocumentView = () => {
    documentViewMode.value = false
    documentUrl.value = ''
    documentFileName.value = ''
    documentType.value = 'pdf'
  }

  // 预览文书（无附件时）
  const handlePreviewDocument = () => {
    documentFileName.value = '审计移送书预览'
    documentViewMode.value = true
  }
</script>

<style scoped lang="scss">
  /* 表单标签前的批注徽章 */
  .form-label-with-badge {
    display: inline-flex;
    gap: 6px;
    align-items: center;
  }

  .form-label-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    font-size: 11px;
    font-weight: 600;
    line-height: 1;
    color: #fff;
    cursor: pointer;
    user-select: none;
    background: #1677ff;
    border-radius: 50%;
  }

  /* 打开文书前的批注徽章 */
  .document-tip-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    margin-right: 4px;
    font-size: 11px;
    font-weight: 600;
    line-height: 1;
    color: #fff;
    cursor: pointer;
    user-select: none;
    background: #1677ff;
    border-radius: 50%;
  }

  // 分屏布局
  .drawer-content {
    display: flex;
    flex-direction: column;
    height: calc(100% - 60px);

    &.split-view {
      flex-direction: row;
      gap: 16px;
    }
  }

  // 文书预览区域
  .document-preview {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding-right: 16px;
    border-right: 1px solid #e4e7ed;

    .preview-header {
      padding: 12px 20px;
      margin-bottom: 12px;
      background: #f5f7fa;
      border-radius: 8px;

      .preview-title {
        font-size: 14px;
        font-weight: 500;
        color: #303133;
      }
    }

    .preview-body {
      flex: 1;
      padding: 20px;
      overflow: auto;
      background: #fff;
      border-radius: 8px;

      .document-content {
        max-width: 800px;
        margin: 0 auto;
        font-family: SimSun, '宋体', serif;
        font-size: 14px;
        line-height: 2;
        color: #333;
        user-select: text;

        .document-header {
          padding-bottom: 20px;
          margin-bottom: 40px;
          text-align: center;
          border-bottom: 2px solid #333;

          h2 {
            margin: 0 0 10px;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 8px;
          }

          .doc-number {
            margin: 10px 0 0;
            font-size: 14px;
            color: #666;
          }
        }

        .document-body {
          .recipient {
            margin-bottom: 20px;
          }

          .indent {
            margin-bottom: 15px;
            text-indent: 2em;
          }

          h3 {
            margin: 30px 0 15px;
            font-size: 16px;
            font-weight: bold;
          }

          .personnel-list {
            margin: 15px 0;
          }

          .document-footer {
            margin-top: 60px;
            text-align: right;

            .signature {
              display: flex;
              flex-direction: column;
              gap: 20px;
              align-items: flex-end;

              .org-name {
                font-weight: bold;
              }

              .date {
                margin-top: 10px;
              }
            }
          }

          .document-notes {
            padding-top: 20px;
            margin-top: 40px;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;

            p {
              margin: 5px 0;
            }

            .print-info {
              margin-top: 10px;
              font-style: italic;
            }
          }
        }
      }
    }
  }

  // 表单容器
  .form-container {
    flex: 1;
    overflow-y: auto;
  }

  .transfer-form {
    padding: 0 20px;

    .form-section {
      margin-bottom: 32px;

      .section-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 12px;
        margin-bottom: 20px;
        font-size: 16px;
        font-weight: 500;
        color: #303133;
        border-bottom: 1px solid #e4e7ed;

        .title-actions {
          display: flex;
          gap: 8px;
        }

        .document-actions-inline {
          display: flex;
          gap: 8px;
          align-items: center;
        }
      }
    }

    // 表头字体不要太粗
    :deep(.el-table th) {
      font-weight: 500;
    }
  }

  .drawer-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
</style>
