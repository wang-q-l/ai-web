<template>
  <el-drawer
    v-model="visible"
    :title="isEdit ? '编辑审计决定' : '新增审计决定'"
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
              <h2>审计决定书</h2>
              <p class="doc-number">{{ formData.decisionCode || 'ZK审计决字〔2026〕第001号' }}</p>
            </div>

            <div class="document-body">
              <p class="recipient"
                ><strong>{{ formData.mainRecipient || '主送单位' }}：</strong></p
              >

              <p class="indent">
                根据《中华人民共和国审计法》及相关法律法规的规定，我部门对相关事项进行了审计。
                经审计发现存在以下问题，现依法作出如下审计决定：
              </p>

              <h3>一、审计发现的主要问题</h3>
              <p class="indent">
                {{
                  formData.decisionDescription ||
                  '经审计发现，被审计单位在财务管理、资金使用等方面存在不规范行为，涉及金额较大，需要进行整改。'
                }}
              </p>

              <h3>二、决定定性依据</h3>
              <p class="indent">
                {{
                  formData.legalBasis ||
                  '依据《中华人民共和国审计法》第四十五条、《财政违法行为处罚处分条例》第三条等相关规定。'
                }}
              </p>

              <h3>三、处理处罚意见</h3>
              <p class="indent">
                {{
                  formData.penaltyOpinion ||
                  '责令被审计单位限期整改，并对相关责任人员进行问责处理。'
                }}
              </p>

              <h3>四、整改要求</h3>
              <p class="indent">
                请贵单位收到本决定书后，认真组织整改，并于{{
                  formData.rectificationDeadline || '规定期限'
                }}前将整改情况书面报告我部门。
              </p>

              <div class="document-footer">
                <p class="signature">
                  <span class="org-name">{{ formData.responsibleUnit || '审计部门' }}</span>
                  <span class="date">{{ formData.issueDate || '2026年4月10日' }}</span>
                </p>
              </div>

              <div class="document-notes">
                <p class="print-info"
                  >本决定书一式三份，主送单位一份，抄送单位一份，我部门存档一份。</p
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
          :rules="formRules"
          label-width="140px"
          class="decision-form"
        >
          <!-- 决定信息 -->
          <div class="form-section">
            <div class="section-title">
              <el-icon><Document /></el-icon>
              <span>决定信息</span>
              <!-- 文书操作区域 -->
              <div class="document-actions-inline">
                <!-- 只有一个文书时，显示文件名链接 -->
                <el-button
                  v-if="!documentViewMode && fileList.length === 1"
                  type="primary"
                  link
                  size="small"
                  @click="handleOpenDocument(fileList[0])"
                >
                  <el-icon><FolderOpened /></el-icon>
                  {{ fileList[0].name }}
                </el-button>
                <!-- 多个文书时或没有文书时，显示下拉选择 -->
                <el-dropdown
                  v-if="!documentViewMode && fileList.length !== 1"
                  @command="handleDocumentCommand"
                >
                  <el-button type="primary" link size="small">
                    <el-icon><FolderOpened /></el-icon>
                    打开文书
                    <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <!-- 有附件时显示附件列表 -->
                      <template v-if="fileList.length > 1">
                        <el-dropdown-item
                          v-for="file in fileList"
                          :key="file.uid"
                          :command="{ type: 'file', data: file }"
                        >
                          {{ file.name }}
                        </el-dropdown-item>
                      </template>
                      <!-- 无附件时显示预设文书选项 -->
                      <template v-else>
                        <el-dropdown-item :command="{ type: 'preview', name: '审计决定书' }">
                          审计决定书
                        </el-dropdown-item>
                        <el-dropdown-item
                          :command="{ type: 'preview', name: '审计决定书（正式）' }"
                        >
                          审计决定书（正式）
                        </el-dropdown-item>
                        <el-dropdown-item
                          :command="{ type: 'preview', name: '审计决定书（草稿）' }"
                        >
                          审计决定书（草稿）
                        </el-dropdown-item>
                      </template>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <!-- 关闭文书按钮 -->
                <el-button v-if="documentViewMode" link size="small" @click="closeDocumentView">
                  <el-icon><Close /></el-icon>
                  关闭文书
                </el-button>
                <!-- 批注提示：点击徽章弹出与列表批注一致的详情面板 -->
                <span
                  v-if="!documentViewMode"
                  class="document-tip-badge"
                  @click.stop="annotationPanelVisible = !annotationPanelVisible"
                  >1</span
                >
              </div>
            </div>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="决定文书文号" prop="decisionCode" required>
                  <el-input
                    v-model="formData.decisionCode"
                    placeholder="请输入决定文书文号"
                    maxlength="50"
                    show-word-limit
                    clearable
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="决定文书名称" prop="decisionName" required>
                  <el-input
                    v-model="formData.decisionName"
                    placeholder="请输入决定文书名称"
                    maxlength="100"
                    show-word-limit
                    clearable
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="文书出具时间" prop="issueDate" required>
                  <el-date-picker
                    v-model="formData.issueDate"
                    type="date"
                    placeholder="请选择文书出具时间"
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                    clearable
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="整改期限" prop="rectificationDeadline" required>
                  <el-date-picker
                    v-model="formData.rectificationDeadline"
                    type="date"
                    placeholder="请选择整改期限"
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                    clearable
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="决定主送部门" prop="mainRecipient" required>
                  <el-tree-select
                    v-model="formData.mainRecipient"
                    :data="departmentTreeOptions"
                    :props="{ label: 'name' }"
                    node-key="name"
                    placeholder="请选择决定主送部门"
                    clearable
                    check-strictly
                    :render-after-expand="false"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="整改责任单位" prop="responsibleUnit" required>
                  <template #label>
                    <span class="form-label-with-badge">
                      <span
                        class="form-label-badge"
                        @click.stop="responsibleUnitTipVisible = !responsibleUnitTipVisible"
                        >2</span
                      >
                      整改责任单位
                    </span>
                  </template>
                  <el-tree-select
                    v-model="formData.responsibleUnit"
                    :data="departmentTreeOptions"
                    :props="{ label: 'name' }"
                    node-key="name"
                    placeholder="请选择整改责任单位"
                    clearable
                    check-strictly
                    :render-after-expand="false"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="决定信息描述" prop="decisionDescription" required>
                  <el-input
                    v-model="formData.decisionDescription"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入决定信息描述"
                    maxlength="1000"
                    show-word-limit
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="决定定性依据" prop="legalBasis" required>
                  <el-input
                    v-model="formData.legalBasis"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入决定定性依据"
                    maxlength="500"
                    show-word-limit
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="处理处罚意见" prop="penaltyOpinion" required>
                  <el-input
                    v-model="formData.penaltyOpinion"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入处理处罚意见"
                    maxlength="500"
                    show-word-limit
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="附件上传">
                  <el-upload
                    v-model:file-list="fileList"
                    action="#"
                    :auto-upload="false"
                    :on-change="handleFileChange"
                    :on-remove="handleFileRemove"
                    multiple
                    class="compact-upload"
                  >
                    <el-button size="small">
                      <el-icon><Upload /></el-icon>
                      点击上传
                    </el-button>
                    <template #tip>
                      <div class="el-upload__tip">
                        支持 pdf、doc、docx、xls、xlsx、jpg、png、zip 格式，单个文件不超过10MB
                      </div>
                    </template>
                  </el-upload>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 关联问题 -->
          <div class="form-section">
            <div class="section-title">
              <el-icon><List /></el-icon>
              <span>关联问题</span>
              <el-button
                type="primary"
                size="small"
                @click="handleSelectProblems"
                style="margin-left: auto"
              >
                <el-icon><Plus /></el-icon>
                选择问题
              </el-button>
            </div>

            <div v-if="selectedProblems.length === 0" class="empty-state">
              <el-empty description="请点击按钮选择需要关联的问题" :image-size="80" />
            </div>

            <div v-else>
              <div class="statistics-row">
                <div class="stat-item">
                  <div class="stat-icon">
                    <el-icon><Money /></el-icon>
                  </div>
                  <div class="stat-content">
                    <span class="stat-label">涉及金额</span>
                    <span class="stat-value"
                      >{{ (totalAmount * 10000).toFixed(2) }} <span class="unit">元</span></span
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
                      >{{ selectedProblems.length }} <span class="unit">个</span></span
                    >
                  </div>
                </div>
              </div>

              <el-table :data="selectedProblems" border style="width: 100%" class="problem-table">
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
                <el-table-column label="操作" width="80" align="center" fixed="right">
                  <template #default="{ $index }">
                    <el-button link type="danger" @click="handleRemoveProblem($index)" size="small">
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-form>
      </div>
    </div>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit(false)" :loading="submitLoading">
          保存
        </el-button>
        <el-button type="primary" @click="handleSubmit(true)" :loading="submitLoading">
          保存并提交审核
        </el-button>
      </div>
    </template>

    <ProblemSelector
      v-model="problemSelectorVisible"
      :selected-ids="formData.problemIds"
      @confirm="handleProblemsConfirm"
    />

    <!-- 批注详情面板：与列表批注一致的可拖动/可调整大小面板 -->
    <Teleport to="body">
      <AnnotationPanel
        v-if="annotationPanelVisible"
        :annotation="documentTipAnnotation"
        :index="0"
        :edit-mode="false"
        @close="annotationPanelVisible = false"
      />
      <AnnotationPanel
        v-if="responsibleUnitTipVisible"
        :annotation="responsibleUnitAnnotation"
        :index="1"
        :edit-mode="false"
        @close="responsibleUnitTipVisible = false"
      />
    </Teleport>
  </el-drawer>
</template>

<script setup lang="ts">
  /**
   * 审计决定抽屉组件
   * 用于新增和编辑审计决定
   */
  import { ref, reactive, computed, watch } from 'vue'
  import { ElMessage, type FormInstance, type FormRules, type UploadUserFile } from 'element-plus'
  import {
    Document,
    List,
    Plus,
    Upload,
    Money,
    Delete,
    FolderOpened,
    Close,
    ArrowDown
  } from '@element-plus/icons-vue'
  import type {
    AuditDecisionForm,
    RectificationProject,
    RelatedProblem
  } from '@/types/audit-decision'
  import {
    getAuditDecisionDetail,
    addAuditDecision,
    updateAuditDecision,
    submitForReview,
    getRectificationProjectList,
    getDecisionProblems
  } from '@/api/audit-decision'
  import ProblemSelector from './ProblemSelector.vue'
  import AnnotationPanel from '@/components/Annotation/AnnotationPanel.vue'
  import type { AnnotationItem } from '@/components/Annotation/types'
  import { getDepartmentList } from '@/api/organization'

  // 批注详情面板：点击数字徽章打开
  const annotationPanelVisible = ref(false)
  const documentTipAnnotation: AnnotationItem = {
    id: 'doc-tip',
    type: 'position',
    selector: '',
    position: { x: 0, y: 0 },
    title: '打开文书',
    content:
      '文书内容来源于整改项目信息中上传的决定文书，当文书只有一份时，直接显示文书名称，点击名称在左屏查看；当文书有多份时如原型页面示例，移入时显示文书列表，点击名称在左屏查看。',
    category: 'rule',
    source: '',
    createdAt: '2026-05-28'
  }

  // 整改责任单位批注
  const responsibleUnitTipVisible = ref(false)
  const responsibleUnitAnnotation: AnnotationItem = {
    id: 'responsible-unit-tip',
    type: 'position',
    selector: '',
    position: { x: 0, y: 0 },
    title: '整改责任单位',
    content: '责任单位从机构树中选择，单选。',
    category: 'rule',
    source: '',
    createdAt: '2026-05-28'
  }

  // 部门树（用于整改责任单位选择）
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

  // Props
  const props = defineProps<{
    modelValue: boolean
    decisionId?: number
    projectId: number
  }>()

  // Emits
  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    success: []
  }>()

  // 抽屉显示状态
  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  // 是否编辑模式
  const isEdit = computed(() => !!props.decisionId)

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)
  const loading = ref(false)
  const projectList = ref<RectificationProject[]>([])

  const formData = reactive<AuditDecisionForm>({
    projectId: props.projectId,
    decisionName: '',
    decisionCode: '',
    issueDate: '',
    mainRecipient: '',
    responsibleUnit: '',
    rectificationDeadline: '',
    decisionDescription: '',
    legalBasis: '',
    penaltyOpinion: '',
    attachments: [],
    problemIds: []
  })

  const formRules: FormRules = {
    decisionName: [{ required: true, message: '请输入决定文书名称', trigger: 'blur' }],
    decisionCode: [{ required: true, message: '请输入决定文书文号', trigger: 'blur' }],
    issueDate: [{ required: true, message: '请选择文书出具时间', trigger: 'change' }],
    mainRecipient: [{ required: true, message: '请选择决定主送部门', trigger: 'change' }],
    responsibleUnit: [{ required: true, message: '请选择整改责任单位', trigger: 'change' }],
    rectificationDeadline: [{ required: true, message: '请选择整改期限', trigger: 'change' }],
    decisionDescription: [{ required: true, message: '请输入决定信息描述', trigger: 'blur' }],
    legalBasis: [{ required: true, message: '请输入决定定性依据', trigger: 'blur' }],
    penaltyOpinion: [{ required: true, message: '请输入处理处罚意见', trigger: 'blur' }]
  }

  const problemSelectorVisible = ref(false)
  const selectedProblems = ref<RelatedProblem[]>([])

  const totalAmount = computed(() => {
    return selectedProblems.value.reduce((sum, problem) => sum + (problem.involvedAmount || 0), 0)
  })

  const fileList = ref<UploadUserFile[]>([])

  // 文书查看器状态
  const documentViewMode = ref(false)
  const documentUrl = ref('')
  const documentType = ref<'pdf' | 'image'>('pdf')
  const documentFileName = ref('')

  // 获取项目列表
  const fetchProjectList = async () => {
    try {
      const res = await getRectificationProjectList({ page: 1, pageSize: 1000 } as any)
      projectList.value = res.data.list
    } catch {
      ElMessage.error('获取项目列表失败')
    }
  }

  // 获取决定详情
  const fetchDecisionDetail = async () => {
    if (!props.decisionId) return

    loading.value = true
    try {
      const res = await getAuditDecisionDetail(props.decisionId)
      const decision = res.data

      if (!decision) {
        ElMessage.error('决定不存在')
        return
      }

      Object.assign(formData, {
        id: decision.id,
        projectId: decision.projectId,
        decisionName: decision.decisionName,
        decisionCode: decision.decisionCode,
        issueDate: decision.issueDate,
        mainRecipient: decision.mainRecipient,
        responsibleUnit: decision.responsibleUnit,
        rectificationDeadline: decision.rectificationDeadline,
        decisionDescription: decision.decisionDescription,
        legalBasis: decision.legalBasis,
        penaltyOpinion: decision.penaltyOpinion,
        attachments: decision.attachments
      })

      fileList.value = decision.attachments.map((file) => ({
        name: file.name,
        url: file.url,
        uid: file.id || Date.now(),
        status: 'success'
      }))

      const problemsRes = await getDecisionProblems(props.decisionId)
      selectedProblems.value = problemsRes.data
      formData.problemIds = selectedProblems.value.map((p) => p.id)
    } catch {
      ElMessage.error('获取决定详情失败')
    } finally {
      loading.value = false
    }
  }

  // 重置表单
  const resetForm = () => {
    formRef.value?.resetFields()
    Object.assign(formData, {
      projectId: props.projectId,
      decisionName: '',
      decisionCode: '',
      issueDate: '',
      mainRecipient: '',
      responsibleUnit: '',
      rectificationDeadline: '',
      decisionDescription: '',
      legalBasis: '',
      penaltyOpinion: '',
      attachments: [],
      problemIds: []
    })
    selectedProblems.value = []
    fileList.value = []
  }

  // 选择问题
  const handleSelectProblems = () => {
    problemSelectorVisible.value = true
  }

  // 确认选择问题
  const handleProblemsConfirm = (problems: RelatedProblem[]) => {
    selectedProblems.value = problems
    formData.problemIds = problems.map((p) => p.id)
  }

  // 删除问题
  const handleRemoveProblem = (index: number) => {
    if (selectedProblems.value.length === 1) {
      ElMessage.warning('至少保留一个关联问题')
      return
    }
    selectedProblems.value.splice(index, 1)
    formData.problemIds = selectedProblems.value.map((p) => p.id)
  }

  // 文件变化
  const handleFileChange = (file: UploadUserFile) => {
    if (file.size && file.size > 10 * 1024 * 1024) {
      ElMessage.error('文件大小不能超过10MB')
      fileList.value = fileList.value.filter((f) => f.uid !== file.uid)
      return
    }

    const allowedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png', 'zip']
    const fileType = file.name.split('.').pop()?.toLowerCase()
    if (!fileType || !allowedTypes.includes(fileType)) {
      ElMessage.error('不支持的文件格式')
      fileList.value = fileList.value.filter((f) => f.uid !== file.uid)
      return
    }

    updateAttachments()
  }

  // 删除文件
  const handleFileRemove = () => {
    updateAttachments()
  }

  // 更新附件
  const updateAttachments = () => {
    formData.attachments = fileList.value.map((file) => ({
      name: file.name,
      url: file.url || '',
      size: file.size || 0,
      type: file.name.split('.').pop() || ''
    }))
  }

  // 提交
  const handleSubmit = async (submitReview: boolean) => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (!valid) return

      submitLoading.value = true
      try {
        if (isEdit.value && props.decisionId) {
          await updateAuditDecision(props.decisionId, formData)
          ElMessage.success('更新成功')

          if (submitReview) {
            await submitForReview(props.decisionId)
            ElMessage.success('已提交审核')
          }
        } else {
          const res = await addAuditDecision(formData)
          ElMessage.success('新增成功')

          if (submitReview && res.data) {
            await submitForReview(res.data.id)
            ElMessage.success('已提交审核')
          }
        }

        emit('success')
        handleClose()
      } catch {
        ElMessage.error(isEdit.value ? '更新失败' : '新增失败')
      } finally {
        submitLoading.value = false
      }
    })
  }

  // 关闭抽屉
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

  // 处理下拉菜单命令
  const handleDocumentCommand = (command: any) => {
    if (command.type === 'file') {
      // 打开附件文件
      handleOpenDocument(command.data)
    } else if (command.type === 'preview') {
      // 预览文书
      documentFileName.value = command.name
      documentViewMode.value = true
    }
  }

  // 关闭文书查看
  const closeDocumentView = () => {
    documentViewMode.value = false
    documentUrl.value = ''
    documentFileName.value = ''
    documentType.value = 'pdf'
  }

  // 监听抽屉打开
  watch(visible, (val) => {
    if (val) {
      fetchProjectList()
      if (isEdit.value) {
        fetchDecisionDetail()
      } else {
        resetForm()
      }
    }
  })
</script>

<style scoped lang="scss">
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
    padding: 0 20px;
    overflow-y: auto;
  }

  .decision-form {
    padding-bottom: 20px;
  }

  .form-section {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }

    .section-title {
      display: flex;
      gap: 8px;
      align-items: center;
      padding-bottom: 10px;
      margin-bottom: 16px;
      font-size: 15px;
      font-weight: 600;
      color: #303133;
      border-bottom: 1px solid #f0f0f0;

      .el-icon {
        font-size: 16px;
        color: #409eff;
      }

      .required-tip {
        margin-left: auto;
        font-size: 12px;
        font-weight: normal;
        color: #f56c6c;
      }

      .document-actions-inline {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-left: auto;

        .document-tip-badge {
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
  }

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

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 180px;
    padding: 20px 0;
  }

  .select-problem-area {
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 12px 16px;
    background: #f5f7fa;
    border: 1px solid #dcdfe6;
    border-radius: 6px;

    .tip-text {
      font-size: 14px;
      color: #606266;

      .highlight {
        margin: 0 4px;
        font-size: 16px;
        font-weight: 600;
        color: #409eff;
      }

      &.empty {
        color: #909399;
      }
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

  .problem-table {
    :deep(.el-table__header) {
      th {
        font-weight: 600;
        color: #606266;
        background: #f5f7fa;
      }
    }
  }

  .upload-area {
    width: 100%;

    :deep(.el-upload) {
      width: 100%;
    }

    :deep(.el-upload-dragger) {
      width: 100%;
      padding: 40px 20px;
      border: 2px dashed #dcdfe6;
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        background: #ecf5ff;
        border-color: #409eff;
      }

      .el-icon--upload {
        margin-bottom: 16px;
        font-size: 48px;
        color: #409eff;
      }

      .el-upload__text {
        font-size: 14px;
        color: #606266;

        em {
          font-style: normal;
          color: #409eff;
        }
      }
    }
  }

  .compact-upload {
    :deep(.el-upload-list) {
      margin-top: 8px;
    }
  }

  .drawer-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding: 16px 20px;
    border-top: 1px solid #f0f0f0;
  }

  :deep(.el-form-item) {
    margin-bottom: 18px;

    .el-form-item__label {
      font-size: 14px;
      font-weight: 500;
      color: #606266;

      &::before {
        margin-right: 4px;
        color: #f56c6c;
      }
    }

    .el-input__inner,
    .el-textarea__inner {
      transition: all 0.3s;

      &:focus {
        border-color: #409eff;
        box-shadow: 0 0 0 2px rgb(64 158 255 / 10%);
      }
    }
  }

  :deep(.el-upload__tip) {
    margin-top: 8px;
    font-size: 12px;
    line-height: 1.5;
    color: #909399;
  }
</style>
