<script setup lang="ts">
  // 报告新增/编辑弹窗：报告名称 + 所属分类（树选择器）+ 文件上传
  import { ref, reactive, computed, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules, UploadFile, UploadRawFile } from 'element-plus'
  import { UploadFilled } from '@element-plus/icons-vue'
  import { addReport, updateReport } from '@/api/report-library'
  import type { Report, ReportCategoryNode } from '@/types/report-library'

  const props = defineProps<{
    open: boolean
    /** 编辑时传入完整对象，新增时传 null */
    editing: Report | null
    /** 分类树（来自父组件，避免重复请求） */
    categoryTree: ReportCategoryNode[]
    /** 默认分类 id（新增时若当前选中了某具体分类，自动填入） */
    defaultCategoryId?: string
  }>()

  const emit = defineEmits<{
    'update:open': [val: boolean]
    success: []
  }>()

  // 弹窗显隐双向绑定
  const visible = computed({
    get: () => props.open,
    set: (v) => emit('update:open', v)
  })

  // 允许的文件类型与大小上限
  const ACCEPT_EXT = ['pdf', 'doc', 'docx', 'xls', 'xlsx']
  const MAX_SIZE = 10 * 1024 * 1024 // 10MB

  // 表单字段
  const formRef = ref<FormInstance>()
  const form = reactive({
    name: '',
    categoryId: '',
    fileName: '',
    fileUrl: '',
    fileType: '',
    fileSize: 0
  })

  const rules: FormRules = {
    name: [
      { required: true, message: '请输入报告名称', trigger: 'blur' },
      { max: 100, message: '报告名称不能超过 100 字', trigger: 'blur' }
    ],
    categoryId: [{ required: true, message: '请选择报告分类', trigger: 'change' }],
    fileName: [{ required: true, message: '请上传报告文件', trigger: 'change' }]
  }

  // 已上传文件列表（el-upload 展示用）
  const fileList = ref<UploadFile[]>([])

  // 弹窗打开时初始化表单
  watch(
    () => props.open,
    (val) => {
      if (!val) return
      if (props.editing) {
        form.name = props.editing.name
        form.categoryId = props.editing.categoryId
        form.fileName = props.editing.fileName
        form.fileUrl = props.editing.fileUrl
        form.fileType = props.editing.fileType
        form.fileSize = props.editing.fileSize
        fileList.value = props.editing.fileName
          ? [{ name: props.editing.fileName, url: props.editing.fileUrl } as UploadFile]
          : []
      } else {
        form.name = ''
        form.categoryId = props.defaultCategoryId ?? ''
        form.fileName = ''
        form.fileUrl = ''
        form.fileType = ''
        form.fileSize = 0
        fileList.value = []
      }
    }
  )

  // 上传前校验类型与大小（mock 模式不真实上传，仅记录文件信息）
  const beforeUpload = (file: UploadRawFile) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!ACCEPT_EXT.includes(ext)) {
      ElMessage.error(`仅支持 ${ACCEPT_EXT.join('/')} 格式`)
      return false
    }
    if (file.size > MAX_SIZE) {
      ElMessage.error('单个文件不能超过 10MB')
      return false
    }
    return true
  }

  // 选择文件后：mock 模式直接记录文件信息（不真实上传）
  const handleFileChange = (file: UploadFile) => {
    const raw = file.raw
    if (!raw) return
    if (!beforeUpload(raw)) {
      fileList.value = []
      return
    }
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    form.fileName = file.name
    form.fileType = ext
    form.fileSize = raw.size
    // mock 阶段用本地 URL 占位；真实环境改为后端返回的文件 URL
    form.fileUrl = `/files/${file.name}`
    fileList.value = [file]
    // 若报告名称为空，默认填入去扩展名的文件名
    if (!form.name.trim()) {
      form.name = file.name.replace(/\.[^.]+$/, '')
    }
  }

  // 移除文件
  const handleFileRemove = () => {
    form.fileName = ''
    form.fileUrl = ''
    form.fileType = ''
    form.fileSize = 0
    fileList.value = []
  }

  // 提交保存
  const saving = ref(false)
  const handleSubmit = async () => {
    await formRef.value?.validate().catch(() => {
      throw new Error('validate failed')
    })
    saving.value = true
    try {
      const payload = {
        name: form.name.trim(),
        categoryId: form.categoryId,
        fileName: form.fileName,
        fileUrl: form.fileUrl,
        fileType: form.fileType,
        fileSize: form.fileSize
      }
      const res = props.editing
        ? await updateReport(props.editing.id, payload)
        : await addReport(payload)
      if (res.code === 200) {
        ElMessage.success(props.editing ? '更新成功' : '新增成功')
        visible.value = false
        emit('success')
      } else {
        ElMessage.error(res.message || '操作失败')
      }
    } finally {
      saving.value = false
    }
  }
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="props.editing ? '编辑报告' : '新增报告'"
    width="640px"
    :close-on-click-modal="false"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="报告名称" prop="name">
        <el-input
          v-model="form.name"
          maxlength="100"
          show-word-limit
          placeholder="请输入报告名称"
          clearable
        />
      </el-form-item>
      <el-form-item label="报告分类" prop="categoryId">
        <el-tree-select
          v-model="form.categoryId"
          :data="props.categoryTree"
          :props="{ label: 'name', children: 'children' }"
          node-key="id"
          placeholder="请选择报告分类"
          check-strictly
          default-expand-all
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="报告文件" prop="fileName">
        <el-upload
          drag
          :auto-upload="false"
          :limit="1"
          :file-list="fileList"
          accept=".pdf,.doc,.docx,.xls,.xlsx"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          style="width: 100%"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <template #tip>
            <div class="upload-tip">支持 pdf/doc/docx/xls/xlsx，单个文件不超过 10MB</div>
          </template>
        </el-upload>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
  .upload-tip {
    margin-top: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
</style>
