<script setup lang="ts">
  // 批量移动分类弹窗：树选择器 + 提交批量移动
  import { ref, computed, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { updateReport } from '@/api/report-library'
  import type { ReportCategoryNode } from '@/types/report-library'

  const props = defineProps<{
    open: boolean
    categoryTree: ReportCategoryNode[]
    /** 待移动的报告 id 列表 */
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
      // 逐条更新分类（mock 无批量接口，循环调用 updateReport）
      let moved = 0
      for (const id of props.selectedIds) {
        const res = await updateReport(id, { categoryId: targetCategoryId.value })
        if (res.code === 200) moved++
      }
      ElMessage.success(`已移动 ${moved} 份报告`)
      visible.value = false
      emit('success')
    } finally {
      saving.value = false
    }
  }
</script>

<template>
  <el-dialog v-model="visible" title="批量移动分类" width="520px" :close-on-click-modal="false">
    <div class="hint">
      已选中 <strong>{{ props.selectedIds.length }}</strong> 份报告，请选择目标分类：
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
