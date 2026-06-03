<script setup lang="ts">
  // 同义词组新增/编辑弹窗：标准词、同义词数组、适用场景
  import { ref, reactive, computed, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { addSynonym, updateSynonym } from '@/api/recommendation-strategy'
  import type { SynonymGroup } from '@/types/recommendation-strategy'

  // 业务场景选项（与全局策略可选标签集合保持一致）
  const TAG_OPTIONS = ['财务', '采购', '医疗', '工程', '资产', '招投标']

  const props = defineProps<{
    open: boolean
    editing: SynonymGroup | null
  }>()

  const emit = defineEmits<{
    'update:open': [val: boolean]
    saved: []
  }>()

  const visible = computed({
    get: () => props.open,
    set: (v) => emit('update:open', v)
  })

  const formRef = ref<FormInstance>()
  const form = reactive<{
    id: number | null
    canonical: string
    aliases: string[]
    domain: string
  }>({
    id: null,
    canonical: '',
    aliases: [],
    domain: ''
  })

  // 别名输入临时变量
  const aliasInput = ref('')
  const inputRef = ref()

  const rules: FormRules = {
    canonical: [{ required: true, message: '请输入标准词', trigger: 'blur' }]
  }

  // 弹窗打开时根据 editing 初始化
  watch(
    () => props.open,
    (val) => {
      if (!val) return
      if (props.editing) {
        Object.assign(form, {
          id: props.editing.id,
          canonical: props.editing.canonical,
          aliases: [...props.editing.aliases],
          domain: props.editing.domain
        })
      } else {
        Object.assign(form, { id: null, canonical: '', aliases: [], domain: '' })
      }
      aliasInput.value = ''
    }
  )

  // 添加同义词标签（去重 + 非空）
  const handleAddAlias = () => {
    const v = aliasInput.value.trim()
    if (!v) return
    if (form.aliases.includes(v)) {
      ElMessage.warning('该同义词已存在')
      aliasInput.value = ''
      return
    }
    form.aliases.push(v)
    aliasInput.value = ''
  }

  // 移除同义词标签
  const handleRemoveAlias = (alias: string) => {
    form.aliases = form.aliases.filter((a) => a !== alias)
  }

  const saving = ref(false)
  const handleSubmit = async () => {
    await formRef.value?.validate().catch(() => {
      throw new Error('validate failed')
    })
    if (form.aliases.length === 0) {
      ElMessage.warning('请至少添加一个同义词')
      return
    }
    saving.value = true
    try {
      const payload = {
        canonical: form.canonical.trim(),
        aliases: form.aliases,
        domain: form.domain
      }
      const res = form.id
        ? await updateSynonym({ ...payload, id: form.id, updatedAt: '' })
        : await addSynonym(payload)
      if (res.code === 200) {
        ElMessage.success(form.id ? '更新成功' : '新增成功')
        visible.value = false
        emit('saved')
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
    :title="props.editing ? '编辑同义词' : '新增同义词'"
    width="560px"
    :close-on-click-modal="false"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="标准词" prop="canonical">
        <el-input
          v-model="form.canonical"
          placeholder="如：三公经费"
          maxlength="30"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="所属领域">
        <el-select
          v-model="form.domain"
          placeholder="留空表示全局生效"
          clearable
          style="width: 240px"
        >
          <el-option v-for="d in TAG_OPTIONS" :key="d" :label="d" :value="d" />
        </el-select>
      </el-form-item>
      <el-form-item label="同义词" required>
        <div class="alias-edit">
          <!-- 已添加的同义词，以 tag 展示 -->
          <el-tag
            v-for="alias in form.aliases"
            :key="alias"
            closable
            class="alias-tag"
            @close="handleRemoveAlias(alias)"
          >
            {{ alias }}
          </el-tag>
          <!-- 输入框 + 添加按钮 -->
          <el-input
            ref="inputRef"
            v-model="aliasInput"
            placeholder="输入后回车或点添加"
            class="alias-input"
            @keyup.enter="handleAddAlias"
          />
          <el-button @click="handleAddAlias">添加</el-button>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
  .alias-edit {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    width: 100%;
  }

  .alias-tag {
    margin-right: 4px;
  }

  .alias-input {
    width: 200px;
  }
</style>
