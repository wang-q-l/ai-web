<script setup lang="ts">
  // 批量移动分类弹窗：树选择器 + 提交批量移动
  import { ref, computed, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { batchMoveSuggestion } from '@/api/suggestion-library'
  import type { SuggestionCategoryNode } from '@/types/suggestion-library'

  const props = defineProps<{
    open: boolean
    categoryTree: SuggestionCategoryNode[]
    /** 待移动的建议 id 列表 */
    selectedIds: string[]
  }>()

  const emit = defineEmits<{
    'update:open': [val: boolean]
    success: []
  }>()

  const visible = computed({
    get: () => props.open,
    set: (v) => emit('update:open', v)
  })

  const targetCategoryId = ref<string>('')

  // 弹窗打开时清空上次选择
  watch(
    () => props.open,
    (val) => {
      if (val) targetCategoryId.value = ''
    }
  )

  const saving = ref(false)
  const handleSubmit = async () => {
    if (!targetCategoryId.value) {
      ElMessage.warning('请选择目标分类')
      return
    }
    saving.value = true
    try {
      const res = await batchMoveSuggestion(props.selectedIds, targetCategoryId.value)
      if (res.code === 200) {
        ElMessage.success(res.message)
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
  <el-dialog v-model="visible" title="批量移动分类" width="520px" :close-on-click-modal="false">
    <div class="hint">
      已选中 <strong>{{ props.selectedIds.length }}</strong> 条建议，请选择目标分类：
    </div>
    <el-tree-select
      v-model="targetCategoryId"
      :data="props.categoryTree"
      :props="{ label: 'name', children: 'children' }"
      node-key="id"
      placeholder="请选择目标分类"
      check-strictly
      default-expand-all
      style="width: 100%; margin-top: 12px"
    />
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSubmit">确认移动</el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
  .hint {
    font-size: 13px;
    color: var(--el-text-color-regular);

    strong {
      margin: 0 2px;
      color: var(--el-color-primary);
    }
  }
</style>
