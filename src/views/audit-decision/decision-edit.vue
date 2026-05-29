<template>
  <PageContainer>
    <div class="decision-form-container">
      <!-- 顶部标题栏 -->
      <div class="header-bar">
        <el-button link @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <span class="page-title">编辑审计决定</span>
        <div class="header-actions">
          <el-upload
            v-if="!documentViewMode"
            ref="documentUploadRef"
            :auto-upload="false"
            :show-file-list="false"
            accept=".pdf,.jpg,.jpeg,.png"
            :on-change="handleDocumentUpload"
          >
            <el-button type="default">
              <el-icon><FolderOpened /></el-icon>
              打开文书
            </el-button>
          </el-upload>
          <el-button v-if="documentViewMode" @click="closeDocumentView">
            <el-icon><Close /></el-icon>
            关闭文书
          </el-button>
          <el-button @click="handleBack">取消</el-button>
          <el-button type="primary" @click="handleSubmit(false)" :loading="submitLoading">
            保存
          </el-button>
          <el-button type="primary" @click="handleSubmit(true)" :loading="submitLoading">
            保存并提交审核
          </el-button>
        </div>
      </div>

      <!-- 表单内容 -->
      <div :class="['form-wrapper', { 'split-view': documentViewMode }]">
        <!-- 左侧：文书预览 -->
        <div v-if="documentViewMode" class="document-preview">
          <div class="preview-header">
            <span class="preview-title">{{ documentFileName }}</span>
          </div>
          <div class="preview-body">
            <!-- PDF 预览 -->
            <iframe
              v-if="documentType === 'pdf'"
              :src="documentUrl"
              class="pdf-viewer"
              frameborder="0"
            ></iframe>
            <!-- 图片预览 -->
            <img
              v-else-if="documentType === 'image'"
              :src="documentUrl"
              class="image-viewer"
              alt="文书预览"
            />
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
            <!-- 决定信息卡片 -->
            <el-card class="form-card">
              <template #header>
                <div class="card-title">
                  <el-icon><Document /></el-icon>
                  <span>决定信息</span>
                  <span class="required-tip">* 为必填项</span>
                </div>
              </template>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="整改项目" prop="projectId" required>
                    <el-select
                      v-model="formData.projectId"
                      placeholder="请选择整改项目"
                      filterable
                      disabled
                      style="width: 100%"
                    >
                      <el-option
                        v-for="project in projectList"
                        :key="project.id"
                        :label="project.projectName"
                        :value="project.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
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
              </el-row>

              <el-row :gutter="24">
                <el-col :span="24">
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

              <el-row :gutter="24">
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

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="决定主送部门" prop="mainRecipient" required>
                    <el-input
                      v-model="formData.mainRecipient"
                      placeholder="请输入决定主送部门"
                      maxlength="100"
                      show-word-limit
                      clearable
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="整改责任单位" prop="responsibleUnit" required>
                    <el-input
                      v-model="formData.responsibleUnit"
                      placeholder="请输入整改责任单位"
                      maxlength="100"
                      show-word-limit
                      clearable
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-divider />

              <el-row :gutter="24">
                <el-col :span="24">
                  <el-form-item label="决定信息描述" prop="decisionDescription">
                    <el-input
                      v-model="formData.decisionDescription"
                      type="textarea"
                      :rows="4"
                      placeholder="请输入决定信息描述"
                      maxlength="1000"
                      show-word-limit
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="24">
                  <el-form-item label="决定定性依据" prop="legalBasis">
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

              <el-row :gutter="24">
                <el-col :span="24">
                  <el-form-item label="处理处罚意见" prop="penaltyOpinion">
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

              <el-divider />

              <el-row :gutter="24">
                <el-col :span="24">
                  <el-form-item label="附件上传" prop="attachments">
                    <el-upload
                      v-model:file-list="fileList"
                      action="#"
                      :auto-upload="false"
                      :on-change="handleFileChange"
                      :on-remove="handleFileRemove"
                      multiple
                      drag
                      class="upload-area"
                    >
                      <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                      <div class="el-upload__text"> 将文件拖到此处，或<em>点击上传</em> </div>
                      <template #tip>
                        <div class="el-upload__tip">
                          支持 pdf、doc、docx、xls、xlsx、jpg、png、zip 格式，单个文件不超过10MB
                        </div>
                      </template>
                    </el-upload>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-card>

            <!-- 关联问题卡片 -->
            <el-card class="form-card">
              <template #header>
                <div class="card-title">
                  <el-icon><List /></el-icon>
                  <span>关联问题</span>
                  <span class="required-tip">* 至少关联一个问题</span>
                </div>
              </template>

              <el-form-item label="" prop="problemIds">
                <div class="select-problem-area">
                  <el-button type="primary" @click="handleSelectProblems" size="large">
                    <el-icon><Plus /></el-icon>
                    选择问题
                  </el-button>
                  <span class="tip-text" v-if="selectedProblems.length > 0">
                    已选择 <span class="highlight">{{ selectedProblems.length }}</span> 个问题
                  </span>
                  <span class="tip-text empty" v-else> 请点击按钮选择需要关联的问题 </span>
                </div>
              </el-form-item>

              <div v-if="selectedProblems.length > 0" class="statistics-row">
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

              <el-form-item label="" v-if="selectedProblems.length > 0">
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
                      <el-button
                        link
                        type="danger"
                        @click="handleRemoveProblem($index)"
                        size="small"
                      >
                        <el-icon><Delete /></el-icon>
                        删除
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-form-item>
            </el-card>
          </el-form>
        </div>
      </div>
    </div>

    <ProblemSelector
      v-model="problemSelectorVisible"
      :selected-ids="formData.problemIds"
      @confirm="handleProblemsConfirm"
    />
  </PageContainer>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue'
  import {
    ElMessage,
    type FormInstance,
    type FormRules,
    type UploadUserFile,
    type UploadFile
  } from 'element-plus'
  import {
    ArrowLeft,
    Document,
    List,
    Plus,
    UploadFilled,
    Money,
    Delete,
    FolderOpened,
    Close
  } from '@element-plus/icons-vue'
  import type {
    AuditDecisionForm,
    RectificationProject,
    RelatedProblem
  } from '@/types/audit-decision'
  import {
    getAuditDecisionDetail,
    updateAuditDecision,
    submitForReview,
    getRectificationProjectList,
    getDecisionProblems
  } from '@/api/audit-decision'
  import { useRouter, useRoute } from 'vue-router'
  import ProblemSelector from './components/ProblemSelector.vue'

  const router = useRouter()
  const route = useRoute()

  const decisionId = ref(Number(route.query.id))
  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)
  const loading = ref(false)
  const projectList = ref<RectificationProject[]>([])

  const formData = reactive<AuditDecisionForm>({
    id: decisionId.value,
    projectId: Number(route.query.projectId) || 0,
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
    projectId: [{ required: true, message: '请选择整改项目', trigger: 'change' }],
    decisionName: [{ required: true, message: '请输入决定文书名称', trigger: 'blur' }],
    decisionCode: [{ required: true, message: '请输入决定文书文号', trigger: 'blur' }],
    issueDate: [{ required: true, message: '请选择文书出具时间', trigger: 'change' }],
    mainRecipient: [{ required: true, message: '请输入决定主送部门', trigger: 'blur' }],
    responsibleUnit: [{ required: true, message: '请输入整改责任单位', trigger: 'blur' }],
    rectificationDeadline: [{ required: true, message: '请选择整改期限', trigger: 'change' }],
    problemIds: [
      {
        validator: (rule, value, callback) => {
          if (!value || value.length === 0) {
            callback(new Error('请至少关联一个问题'))
          } else {
            callback()
          }
        },
        trigger: 'change'
      }
    ]
  }

  const problemSelectorVisible = ref(false)
  const selectedProblems = ref<RelatedProblem[]>([])

  const totalAmount = computed(() => {
    return selectedProblems.value.reduce((sum, problem) => sum + problem.involvedAmount, 0)
  })

  const fileList = ref<UploadUserFile[]>([])

  // 文书查看器状态
  const documentViewMode = ref(false)
  const documentUrl = ref('')
  const documentType = ref<'pdf' | 'image'>('pdf')
  const documentFileName = ref('')
  const documentUploadRef = ref()

  const fetchProjectList = async () => {
    try {
      const res = await getRectificationProjectList({ page: 1, pageSize: 1000 } as any)
      projectList.value = res.data.list
    } catch {
      ElMessage.error('获取项目列表失败')
    }
  }

  const fetchDecisionDetail = async () => {
    loading.value = true
    try {
      const res = await getAuditDecisionDetail(decisionId.value)
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

      const problemsRes = await getDecisionProblems(decisionId.value)
      selectedProblems.value = problemsRes.data
      formData.problemIds = selectedProblems.value.map((p) => p.id)
    } catch {
      ElMessage.error('获取决定详情失败')
    } finally {
      loading.value = false
    }
  }

  const handleSelectProblems = () => {
    problemSelectorVisible.value = true
  }

  const handleProblemsConfirm = (problems: RelatedProblem[]) => {
    selectedProblems.value = problems
    formData.problemIds = problems.map((p) => p.id)
  }

  const handleRemoveProblem = (index: number) => {
    if (selectedProblems.value.length === 1) {
      ElMessage.warning('至少保留一个关联问题')
      return
    }
    selectedProblems.value.splice(index, 1)
    formData.problemIds = selectedProblems.value.map((p) => p.id)
  }

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

  const handleFileRemove = () => {
    updateAttachments()
  }

  const updateAttachments = () => {
    formData.attachments = fileList.value.map((file) => ({
      name: file.name,
      url: file.url || '',
      size: file.size || 0,
      type: file.name.split('.').pop() || ''
    }))
  }

  const handleSubmit = async (submitReview: boolean) => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (!valid) return

      submitLoading.value = true
      try {
        await updateAuditDecision(decisionId.value, formData)
        ElMessage.success('更新成功')

        if (submitReview) {
          await submitForReview(decisionId.value)
          ElMessage.success('已提交审核')
        }

        handleBack()
      } catch {
        ElMessage.error('更新失败')
      } finally {
        submitLoading.value = false
      }
    })
  }

  const handleBack = () => {
    const projectId = route.query.projectId
    if (projectId) {
      router.push(`/audit-decision/project/${projectId}`)
    } else {
      router.back()
    }
    // 关闭文书查看
    closeDocumentView()
  }

  // 处理文书上传
  const handleDocumentUpload = (file: UploadFile) => {
    const fileType = file.raw?.type || ''
    const fileName = file.name || ''

    // 判断文件类型
    if (fileType === 'application/pdf') {
      documentType.value = 'pdf'
    } else if (fileType.startsWith('image/')) {
      documentType.value = 'image'
    } else {
      ElMessage.error('仅支持 PDF 和图片格式')
      return
    }

    // 创建预览 URL
    documentUrl.value = URL.createObjectURL(file.raw!)
    documentFileName.value = fileName
    documentViewMode.value = true
  }

  // 关闭文书查看
  const closeDocumentView = () => {
    if (documentUrl.value) {
      URL.revokeObjectURL(documentUrl.value)
    }
    documentViewMode.value = false
    documentUrl.value = ''
    documentFileName.value = ''
    documentType.value = 'pdf'
  }

  onMounted(() => {
    fetchProjectList()
    fetchDecisionDetail()
  })
</script>

<style scoped lang="scss">
  .decision-form-container {
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

  .form-wrapper {
    display: flex;
    flex: 1;
    gap: 16px;
    padding: 24px;
    overflow-y: auto;

    &.split-view {
      padding: 16px 24px;
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
      overflow: hidden;
      background: #f5f7fa;
      border-radius: 8px;

      .pdf-viewer,
      .image-viewer {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
  }

  // 表单容器
  .form-container {
    flex: 1;
    overflow-y: auto;
  }

  .decision-form {
    max-width: 1200px;
    margin: 0 auto;
  }

  .form-card {
    margin-bottom: 24px;
    border: none;
    border-radius: 12px;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 5%);

    &:last-child {
      margin-bottom: 0;
    }

    :deep(.el-card__header) {
      padding: 20px 24px;
      background: linear-gradient(to right, #fafbfc, #fff);
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

      .required-tip {
        margin-left: auto;
        font-size: 12px;
        font-weight: normal;
        color: #f56c6c;
      }
    }
  }

  .select-problem-area {
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 20px;
    background: linear-gradient(135deg, #f5f7fa 0%, #fff 100%);
    border: 2px dashed #dcdfe6;
    border-radius: 8px;
    transition: all 0.3s;

    &:hover {
      background: linear-gradient(135deg, #ecf5ff 0%, #fff 100%);
      border-color: #409eff;
    }

    .tip-text {
      font-size: 14px;
      color: #606266;

      .highlight {
        margin: 0 4px;
        font-size: 18px;
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
    gap: 24px;
    padding: 20px;
    margin-bottom: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    box-shadow: 0 4px 12px rgb(102 126 234 / 30%);

    .stat-item {
      display: flex;
      flex: 1;
      gap: 16px;
      align-items: center;

      .stat-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        background: rgb(255 255 255 / 20%);
        backdrop-filter: blur(10px);
        border-radius: 12px;

        .el-icon {
          font-size: 24px;
          color: #fff;
        }
      }

      .stat-content {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .stat-label {
          font-size: 13px;
          color: rgb(255 255 255 / 80%);
        }

        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: #fff;

          .unit {
            margin-left: 4px;
            font-size: 14px;
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

  :deep(.el-divider) {
    margin: 24px 0;
  }

  :deep(.el-form-item) {
    margin-bottom: 22px;

    .el-form-item__label {
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
