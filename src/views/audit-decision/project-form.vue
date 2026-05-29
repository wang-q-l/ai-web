<template>
  <el-drawer
    v-model="visible"
    :title="isEdit ? '编辑项目' : '新建项目'"
    size="80%"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="form-scroll">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-position="top"
        class="project-form"
      >
        <!-- 基本信息 -->
        <div class="form-section">
          <div class="section-title">
            <el-icon class="section-icon"><Collection /></el-icon>
            <span>基本信息</span>
          </div>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="项目名称" prop="projectName" required>
                <el-input v-model="formData.projectName" placeholder="请输入" maxlength="100" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="项目编号">
                <el-input
                  v-model="formData.projectCode"
                  placeholder="创建项目后自动生成项目编号"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="实施审计的审计机关级别" prop="auditOrgLevel" required>
                <el-select
                  v-model="formData.auditOrgLevel"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option label="国家级" value="国家级" />
                  <el-option label="省级" value="省级" />
                  <el-option label="市级" value="市级" />
                  <el-option label="县级" value="县级" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="审计类型" prop="auditType" required>
                <el-select v-model="formData.auditType" placeholder="请选择" style="width: 100%">
                  <el-option label="财务审计" :value="1" />
                  <el-option label="合规审计" :value="2" />
                  <el-option label="绩效审计" :value="3" />
                  <el-option label="专项审计" :value="4" />
                  <el-option label="其他" :value="5" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="被审计单位" prop="auditedUnit" required>
                <el-tree-select
                  v-model="formData.auditedUnit"
                  :data="departmentTreeOptions"
                  :props="{ label: 'name' }"
                  node-key="name"
                  placeholder="请选择"
                  clearable
                  check-strictly
                  :render-after-expand="false"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="项目起止时间" required>
                <el-date-picker
                  v-model="auditDateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="进点时间"
                  end-placeholder="完成时间"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="牵头部门">
                <el-select
                  v-model="formData.leadDepartment"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option label="经济责任审计处" value="经济责任审计处" />
                  <el-option label="财务审计处" value="财务审计处" />
                  <el-option label="合规审计处" value="合规审计处" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="实施部门" prop="executeDepartment" required>
                <el-select
                  v-model="formData.executeDepartment"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option label="经济责任审计处" value="经济责任审计处" />
                  <el-option label="财务审计处" value="财务审计处" />
                  <el-option label="合规审计处" value="合规审计处" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="审计项目年度" prop="auditYearNumber" required>
                <el-date-picker
                  v-model="formData.auditYearNumber"
                  type="year"
                  placeholder="选择年份"
                  value-format="YYYY"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="审计组长">
                <el-select
                  v-model="formData.auditLeader"
                  placeholder="请选择"
                  style="width: 100%"
                  clearable
                >
                  <el-option label="张三" value="张三" />
                  <el-option label="李四" value="李四" />
                  <el-option label="王五" value="王五" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="副组长">
                <el-select
                  v-model="formData.deputyLeader"
                  placeholder="请选择"
                  style="width: 100%"
                  clearable
                >
                  <el-option label="赵六" value="赵六" />
                  <el-option label="孙七" value="孙七" />
                  <el-option label="周八" value="周八" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="主审">
                <el-select
                  v-model="formData.chiefAuditor"
                  placeholder="请选择"
                  style="width: 100%"
                  clearable
                >
                  <el-option label="吴九" value="吴九" />
                  <el-option label="郑十" value="郑十" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="审计组织方式">
                <el-select
                  v-model="formData.auditOrganizationMethod"
                  placeholder="请选择"
                  style="width: 100%"
                  clearable
                >
                  <el-option label="独立审计" value="独立审计" />
                  <el-option label="联合审计" value="联合审计" />
                  <el-option label="授权审计" value="授权审计" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="审计建议数量">
                <el-input-number
                  v-model="formData.auditSuggestionCount"
                  :min="0"
                  placeholder="请输入审计建议数量"
                  controls-position="right"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="是否外部项目">
                <el-radio-group v-model="formData.isExternal">
                  <el-radio :value="true">是</el-radio>
                  <el-radio :value="false">否</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 审计结论 -->
        <div class="form-section">
          <div class="section-title">
            <el-icon class="section-icon"><Document /></el-icon>
            <span>审计结论</span>
            <span
              class="section-tip-badge"
              @click.stop="conclusionTipVisible = !conclusionTipVisible"
              >1</span
            >
          </div>
          <el-checkbox v-model="formData.noAuditProblem" label="无审计问题" />
          <el-checkbox v-model="formData.noAuditDecision" label="无审计决定" />
          <el-checkbox v-model="formData.noAuditTransfer" label="无审计移送" />
        </div>

        <!-- 审计文书 -->
        <div class="form-section">
          <div class="section-title">
            <el-icon class="section-icon"><Files /></el-icon>
            <span>审计文书</span>
          </div>

          <!-- 审计报告 -->
          <div class="doc-block">
            <div class="doc-title required">审计报告</div>
            <div
              v-for="(item, index) in formData.auditReports"
              :key="`report-${index}`"
              class="doc-card"
            >
              <el-row :gutter="20">
                <el-col :span="6">
                  <el-form-item label="审计报告文号" required>
                    <el-input v-model="item.reportCode" placeholder="请输入" />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="报告送达时间" required>
                    <el-date-picker
                      v-model="item.deliveryDate"
                      type="date"
                      placeholder="选择日期"
                      value-format="YYYY-MM-DD"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="10">
                  <el-form-item label="上传附件" required>
                    <div class="upload-with-tip">
                      <el-upload
                        v-model:file-list="item.attachments"
                        :auto-upload="false"
                        :show-file-list="true"
                      >
                        <el-button>
                          <el-icon><Upload /></el-icon>
                          上传文件
                        </el-button>
                      </el-upload>
                      <span class="upload-tip">
                        <el-icon class="warn-icon"><WarningFilled /></el-icon>
                        严禁处理涉密文件和信息
                      </span>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-icon class="doc-card-close" @click="removeReport(index)">
                <CircleClose />
              </el-icon>
            </div>
          </div>

          <!-- 审计决定 -->
          <div class="doc-block">
            <div class="doc-title-row">
              <div class="doc-title" :class="{ required: !formData.noAuditDecision }">审计决定</div>
              <el-button link type="primary" @click="addDecision">
                <el-icon><Plus /></el-icon>
                添加文书
              </el-button>
            </div>
            <template v-if="!formData.noAuditDecision">
              <div
                v-for="(item, index) in formData.auditDecisions"
                :key="`decision-${index}`"
                class="doc-card"
              >
                <el-row :gutter="20">
                  <el-col :span="6">
                    <el-form-item label="审计决定文号" :required="!formData.noAuditDecision">
                      <el-input v-model="item.decisionCode" placeholder="请输入" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="文书出具时间" :required="!formData.noAuditDecision">
                      <el-date-picker
                        v-model="item.issueDate"
                        type="date"
                        placeholder="选择日期"
                        value-format="YYYY-MM-DD"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="10">
                    <el-form-item label="上传附件" :required="!formData.noAuditDecision">
                      <div class="upload-with-tip">
                        <el-upload
                          v-model:file-list="item.attachments"
                          :auto-upload="false"
                          :show-file-list="true"
                        >
                          <el-button>
                            <el-icon><Upload /></el-icon>
                            上传文件
                          </el-button>
                        </el-upload>
                        <span class="upload-tip">
                          <el-icon class="warn-icon"><WarningFilled /></el-icon>
                          严禁处理涉密文件和信息
                        </span>
                      </div>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-icon class="doc-card-close" @click="removeDecision(index)">
                  <CircleClose />
                </el-icon>
              </div>
            </template>
          </div>

          <!-- 审计移送 -->
          <div class="doc-block">
            <div class="doc-title-row">
              <div class="doc-title" :class="{ required: !formData.noAuditTransfer }">审计移送</div>
              <el-button link type="primary" @click="addTransfer">
                <el-icon><Plus /></el-icon>
                添加文书
              </el-button>
            </div>
            <template v-if="!formData.noAuditTransfer">
              <div
                v-for="(item, index) in formData.auditTransfers"
                :key="`transfer-${index}`"
                class="doc-card"
              >
                <el-row :gutter="20">
                  <el-col :span="6">
                    <el-form-item label="移送文书文号" :required="!formData.noAuditTransfer">
                      <el-input v-model="item.transferCode" placeholder="请输入" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="文书出具时间" :required="!formData.noAuditTransfer">
                      <el-date-picker
                        v-model="item.issueDate"
                        type="date"
                        placeholder="选择日期"
                        value-format="YYYY-MM-DD"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="10">
                    <el-form-item label="上传附件" :required="!formData.noAuditTransfer">
                      <div class="upload-with-tip">
                        <el-upload
                          v-model:file-list="item.attachments"
                          :auto-upload="false"
                          :show-file-list="true"
                        >
                          <el-button>
                            <el-icon><Upload /></el-icon>
                            上传文件
                          </el-button>
                        </el-upload>
                        <span class="upload-tip">
                          <el-icon class="warn-icon"><WarningFilled /></el-icon>
                          严禁处理涉密文件和信息
                        </span>
                      </div>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-icon class="doc-card-close" @click="removeTransfer(index)">
                  <CircleClose />
                </el-icon>
              </div>
            </template>
          </div>

          <!-- 其他文书 -->
          <div class="doc-block">
            <div class="doc-title-row">
              <div class="doc-title">其他文书</div>
              <el-button link type="primary" @click="addOtherDoc">
                <el-icon><Plus /></el-icon>
                添加文书
              </el-button>
            </div>
            <div
              v-for="(item, index) in formData.otherDocs"
              :key="`other-${index}`"
              class="doc-card"
            >
              <el-row :gutter="20">
                <el-col :span="6">
                  <el-form-item label="文书名称">
                    <el-input v-model="item.docName" placeholder="请输入" />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="文书出具时间">
                    <el-date-picker
                      v-model="item.issueDate"
                      type="date"
                      placeholder="选择日期"
                      value-format="YYYY-MM-DD"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="10">
                  <el-form-item label="上传附件">
                    <div class="upload-with-tip">
                      <el-upload
                        v-model:file-list="item.attachments"
                        :auto-upload="false"
                        :show-file-list="true"
                      >
                        <el-button>
                          <el-icon><Upload /></el-icon>
                          上传文件
                        </el-button>
                      </el-upload>
                      <span class="upload-tip">
                        <el-icon class="warn-icon"><WarningFilled /></el-icon>
                        严禁处理涉密文件和信息
                      </span>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-icon class="doc-card-close" @click="removeOtherDoc(index)">
                <CircleClose />
              </el-icon>
            </div>
          </div>
        </div>
      </el-form>
    </div>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSave">保存</el-button>
      </div>
    </template>

    <!-- 审计结论批注 -->
    <Teleport to="body">
      <AnnotationPanel
        v-if="conclusionTipVisible"
        :annotation="conclusionAnnotation"
        :index="0"
        :edit-mode="false"
        @close="conclusionTipVisible = false"
      />
    </Teleport>
  </el-drawer>
</template>

<script setup lang="ts">
  /**
   * 整改项目新增/编辑页面
   * 支持基本信息、整改问题、审计文书三大区域
   */
  import { ref, reactive, computed, watch } from 'vue'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import {
    Collection,
    Document,
    Files,
    Upload,
    Plus,
    CircleClose,
    WarningFilled
  } from '@element-plus/icons-vue'
  import {
    getRectificationProjectDetail,
    addRectificationProject,
    updateRectificationProject
  } from '@/api/audit-decision'
  import { getDepartmentList } from '@/api/organization'
  import AnnotationPanel from '@/components/Annotation/AnnotationPanel.vue'
  import type { AnnotationItem } from '@/components/Annotation/types'

  // 审计结论批注
  const conclusionTipVisible = ref(false)
  const conclusionAnnotation: AnnotationItem = {
    id: 'project-conclusion-tip',
    type: 'position',
    selector: '',
    position: { x: 0, y: 0 },
    title: '审计结论',
    content: '当审计结论勾选了无审计决定和无审计移送后，对应文书为非必填项。',
    category: 'rule',
    source: '',
    createdAt: '2026-05-29'
  }

  // Props
  interface Props {
    modelValue: boolean
    projectId?: number
  }
  const props = withDefaults(defineProps<Props>(), {
    projectId: undefined
  })

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    success: []
  }>()

  // 抽屉显隐
  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const isEdit = computed(() => !!props.projectId)

  const formRef = ref<FormInstance>()

  // 表单数据
  const formData = reactive<any>({
    projectName: '',
    projectCode: '',
    auditOrgLevel: '',
    auditType: undefined,
    auditedUnit: '',
    auditStartDate: '',
    auditEndDate: '',
    leadDepartment: '经济责任审计处',
    executeDepartment: '经济责任审计处',
    auditYearNumber: '',
    auditLeader: '',
    deputyLeader: '',
    chiefAuditor: '',
    auditOrganizationMethod: '',
    auditSuggestionCount: undefined,
    isExternal: false,
    noAuditProblem: false,
    noAuditDecision: false,
    noAuditTransfer: false,
    auditReports: [{ reportCode: '', deliveryDate: '', attachments: [] }],
    auditDecisions: [{ decisionCode: '', issueDate: '', attachments: [] }],
    auditTransfers: [{ transferCode: '', issueDate: '', attachments: [] }],
    otherDocs: []
  })

  // 项目起止时间联动
  const auditDateRange = ref<[string, string] | null>(null)
  watch(auditDateRange, (val) => {
    if (val) {
      formData.auditStartDate = val[0]
      formData.auditEndDate = val[1]
    } else {
      formData.auditStartDate = ''
      formData.auditEndDate = ''
    }
  })

  // 校验规则
  const formRules: FormRules = {
    projectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
    auditOrgLevel: [{ required: true, message: '请选择实施审计的审计机关级别', trigger: 'change' }],
    auditType: [{ required: true, message: '请选择审计类型', trigger: 'change' }],
    auditedUnit: [{ required: true, message: '请选择被审计单位', trigger: 'change' }],
    executeDepartment: [{ required: true, message: '请选择实施部门', trigger: 'change' }],
    auditYearNumber: [{ required: true, message: '请选择审计项目年度', trigger: 'change' }]
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

  // 加载详情
  const loadDetail = async () => {
    if (!props.projectId) return
    try {
      const res = await getRectificationProjectDetail(props.projectId)
      if (res.data) {
        Object.assign(formData, res.data)
        if (res.data.auditStartDate && res.data.auditEndDate) {
          auditDateRange.value = [res.data.auditStartDate, res.data.auditEndDate]
        }
        if (!formData.auditReports || formData.auditReports.length === 0) {
          formData.auditReports = [{ reportCode: '', deliveryDate: '', attachments: [] }]
        }
        if (!formData.auditDecisions || formData.auditDecisions.length === 0) {
          formData.auditDecisions = [{ decisionCode: '', issueDate: '', attachments: [] }]
        }
        if (!formData.auditTransfers || formData.auditTransfers.length === 0) {
          formData.auditTransfers = [{ transferCode: '', issueDate: '', attachments: [] }]
        }
        if (!formData.otherDocs) formData.otherDocs = []
      }
    } catch {
      ElMessage.error('加载项目详情失败')
    }
  }

  // 重置表单
  const resetForm = () => {
    formData.projectName = ''
    formData.projectCode = ''
    formData.auditOrgLevel = ''
    formData.auditType = undefined
    formData.auditedUnit = ''
    formData.auditStartDate = ''
    formData.auditEndDate = ''
    formData.leadDepartment = '经济责任审计处'
    formData.executeDepartment = '经济责任审计处'
    formData.auditYearNumber = ''
    formData.auditLeader = ''
    formData.deputyLeader = ''
    formData.chiefAuditor = ''
    formData.auditOrganizationMethod = ''
    formData.auditSuggestionCount = undefined
    formData.isExternal = false
    formData.noAuditProblem = false
    formData.noAuditDecision = false
    formData.noAuditTransfer = false
    formData.auditReports = [{ reportCode: '', deliveryDate: '', attachments: [] }]
    formData.auditDecisions = [{ decisionCode: '', issueDate: '', attachments: [] }]
    formData.auditTransfers = [{ transferCode: '', issueDate: '', attachments: [] }]
    formData.otherDocs = []
    auditDateRange.value = null
    formRef.value?.clearValidate()
  }

  // 抽屉打开时加载部门 + 详情
  watch(
    () => props.modelValue,
    (val) => {
      if (val) {
        resetForm()
        loadDepartmentTree()
        if (props.projectId) loadDetail()
      }
    },
    { immediate: true }
  )

  // 文书操作
  const addDecision = () => {
    formData.auditDecisions.push({ decisionCode: '', issueDate: '', attachments: [] })
  }
  const removeDecision = (index: number) => {
    if (formData.auditDecisions.length === 1) {
      ElMessage.warning('至少保留一条审计决定')
      return
    }
    formData.auditDecisions.splice(index, 1)
  }
  const addTransfer = () => {
    formData.auditTransfers.push({ transferCode: '', issueDate: '', attachments: [] })
  }
  const removeTransfer = (index: number) => {
    if (formData.auditTransfers.length === 1) {
      ElMessage.warning('至少保留一条审计移送')
      return
    }
    formData.auditTransfers.splice(index, 1)
  }
  const removeReport = (index: number) => {
    if (formData.auditReports.length === 1) {
      ElMessage.warning('至少保留一条审计报告')
      return
    }
    formData.auditReports.splice(index, 1)
  }
  const addOtherDoc = () => {
    formData.otherDocs.push({ docName: '', issueDate: '', attachments: [] })
  }
  const removeOtherDoc = (index: number) => {
    formData.otherDocs.splice(index, 1)
  }

  // 保存
  const submitLoading = ref(false)
  const handleSave = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (!valid) {
        ElMessage.warning('请完整填写必填项')
        return
      }
      submitLoading.value = true
      try {
        const payload: any = {
          ...formData,
          auditYear: formData.auditYearNumber || new Date().getFullYear().toString(),
          projectStatus: 1
        }
        if (isEdit.value) {
          await updateRectificationProject(props.projectId!, payload)
          ElMessage.success('保存成功')
        } else {
          await addRectificationProject(payload)
          ElMessage.success('创建成功')
        }
        emit('success')
        visible.value = false
      } catch {
        ElMessage.error('保存失败')
      } finally {
        submitLoading.value = false
      }
    })
  }

  // 关闭
  const handleClose = () => {
    visible.value = false
  }

  // 删除原 onMounted，已通过 watch(modelValue) 处理
</script>

<style scoped lang="scss">
  .form-scroll {
    padding: 0 4px 16px;
  }

  .project-form {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .drawer-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding: 12px 24px;
    background: #fff;
    border-top: 1px solid #ebeef5;
  }

  /* 让 el-drawer 默认 footer 内边距与我们的样式协调 */
  :deep(.el-drawer__footer) {
    padding: 0;
    border-top: none;
  }

  .form-section {
    padding: 12px 20px;
    background: #fff;
    border-radius: 8px;

    .section-title {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 10px;
      font-size: 16px;
      font-weight: 600;
      color: #303133;

      .section-icon {
        color: #409eff;
      }
    }

    .section-tip-badge {
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

    .sub-title {
      margin-bottom: 8px;
      font-size: 14px;
      color: #606266;
    }
  }

  .doc-block {
    margin-bottom: 16px;

    .doc-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .doc-title {
      margin-bottom: 12px;
      font-size: 14px;
      font-weight: 500;
      color: #303133;

      &.required::before {
        margin-right: 4px;
        color: #f56c6c;
        content: '*';
      }
    }
  }

  .doc-card {
    position: relative;
    padding: 16px 32px 0 16px;
    margin-bottom: 12px;
    background: #fafafa;
    border: 1px solid #ebeef5;
    border-radius: 6px;

    .doc-card-close {
      position: absolute;
      top: 12px;
      right: 12px;
      font-size: 18px;
      color: #c0c4cc;
      cursor: pointer;

      &:hover {
        color: #f56c6c;
      }
    }
  }

  .upload-with-tip {
    display: flex;
    gap: 12px;
    align-items: center;

    .upload-tip {
      display: inline-flex;
      gap: 4px;
      align-items: center;
      font-size: 12px;
      color: #f56c6c;

      .warn-icon {
        color: #f56c6c;
      }
    }
  }
</style>
