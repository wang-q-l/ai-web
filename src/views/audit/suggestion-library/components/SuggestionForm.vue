<script setup lang="ts">
  // 建议新增/编辑弹窗：建议内容（textarea）+ 所属分类（树选择器）
  import { ref, reactive, computed, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { addSuggestion, updateSuggestion } from '@/api/suggestion-library'
  import type { Suggestion, SuggestionCategoryNode } from '@/types/suggestion-library'

  const props = defineProps<{
    open: boolean
    /** 编辑时传入完整对象，新增时传 null */
    editing: Suggestion | null
    /** 分类树（来自父组件，避免重复请求） */
    categoryTree: SuggestionCategoryNode[]
    /** 默认分类 id（新增时若当前选中了某具体分类，自动填入） */
    defaultCategoryId?: string
  }>()

  const emit = defineEmits<{
    'update:open': [val: boolean]
    success: []
  }>()

  // 抽屉显隐双向绑定
  const visible = computed({
    get: () => props.open,
    set: (v) => emit('update:open', v)
  })

  // 表单字段
  const formRef = ref<FormInstance>()
  const form = reactive({
    content: '',
    categoryId: ''
  })

  const rules: FormRules = {
    content: [
      { required: true, message: '请输入建议内容', trigger: 'blur' },
      { max: 1000, message: '建议内容不能超过 1000 字', trigger: 'blur' }
    ],
    categoryId: [{ required: true, message: '请选择所属分类', trigger: 'change' }]
  }

  // 弹窗打开时初始化表单
  watch(
    () => props.open,
    (val) => {
      if (!val) return
      if (props.editing) {
        form.content = props.editing.content
        form.categoryId = props.editing.categoryId
      } else {
        form.content = ''
        // 新增时，若用户在主页面选中了具体分类（非全部），默认填入
        form.categoryId = props.defaultCategoryId ?? ''
      }
    }
  )

  // 提交保存
  const saving = ref(false)
  const handleSubmit = async () => {
    await formRef.value?.validate().catch(() => {
      throw new Error('validate failed')
    })
    saving.value = true
    try {
      const res = props.editing
        ? await updateSuggestion(props.editing.id, {
            content: form.content.trim(),
            categoryId: form.categoryId
          })
        : await addSuggestion({
            content: form.content.trim(),
            categoryId: form.categoryId
          })
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
    :title="props.editing ? '编辑建议' : '新增建议'"
    width="640px"
    :close-on-click-modal="false"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="建议内容" prop="content">
        <el-input
          v-model="form.content"
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 10 }"
          maxlength="1000"
          show-word-limit
          placeholder="请输入审计建议正文"
          resize="none"
        />
      </el-form-item>
      <el-form-item label="所属分类" prop="categoryId">
        <el-tree-select
          v-model="form.categoryId"
          :data="props.categoryTree"
          :props="{ label: 'name', children: 'children' }"
          node-key="id"
          placeholder="请选择分类"
          check-strictly
          default-expand-all
          style="width: 100%"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>
