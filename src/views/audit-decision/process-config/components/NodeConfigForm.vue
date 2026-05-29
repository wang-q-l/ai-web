<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    label-position="top"
    class="node-config-form"
    @change="syncToParent"
  >
    <!-- 上级目录 -->
    <el-form-item label="上级目录">
      <el-select v-model="formData.parentId" disabled style="width: 100%">
        <el-option
          v-for="opt in parentOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
    </el-form-item>

    <!-- 节点名称 -->
    <el-form-item label="节点名称" prop="name" required>
      <el-input
        v-model="formData.name"
        placeholder="请输入节点名称"
        maxlength="50"
        @input="syncToParent"
      />
    </el-form-item>

    <!-- 节点类型 -->
    <el-form-item label="节点类型" prop="nodeType" required>
      <el-radio-group v-model="formData.nodeType" @change="syncToParent">
        <el-radio v-for="opt in nodeTypeOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- 节点是否有显示条件 -->
    <el-form-item label="节点是否有显示条件" prop="hasCondition" required>
      <el-radio-group v-model="formData.hasCondition" @change="syncToParent">
        <el-radio :value="true">是</el-radio>
        <el-radio :value="false">否</el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- 节点权限 -->
    <el-form-item label="节点权限" required>
      <el-table :data="formData.permissions" border style="width: 100%">
        <el-table-column prop="roleName" label="角色" min-width="160" />
        <el-table-column label="节点可见" width="120">
          <template #default="{ row }">
            <el-switch v-model="row.visible" @change="syncToParent" />
          </template>
        </el-table-column>
        <el-table-column label="操作权限" min-width="360">
          <template #default="{ row }">
            <div class="perm-checkboxes">
              <el-checkbox v-model="row.canMaintain" @change="syncToParent">维护</el-checkbox>
              <el-checkbox v-model="row.canSubmit" @change="syncToParent">提交</el-checkbox>
              <el-checkbox
                v-if="formData.nodeType === 5"
                v-model="row.canIssue"
                @change="syncToParent"
              >
                下达
              </el-checkbox>
              <el-checkbox
                v-if="formData.nodeType === 6"
                v-model="row.canFeedback"
                @change="syncToParent"
              >
                移送反馈
              </el-checkbox>
              <el-checkbox v-model="row.canExport" @change="syncToParent"
                >导出列表为excel</el-checkbox
              >
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>

    <!-- 关联表单（原"问题来源"） -->
    <el-form-item label="关联表单" prop="relatedForms" required>
      <el-select
        v-model="formData.relatedForms"
        multiple
        collapse-tags
        collapse-tags-tooltip
        placeholder="请选择关联表单"
        style="width: 100%"
        @change="syncToParent"
      >
        <el-option
          v-for="opt in relatedFormOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
    </el-form-item>

    <!-- 是否设置审批流程（原"进展提交方式"） -->
    <el-form-item label="是否设置审批流程" prop="hasApproval" required>
      <el-radio-group v-model="formData.hasApproval" @change="handleApprovalChange">
        <el-radio :value="true">是</el-radio>
        <el-radio :value="false">否</el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- 审批流程选择（hasApproval=true 时显示） -->
    <el-form-item
      v-if="formData.hasApproval"
      label="审批流程"
      prop="approvalFlowId"
      :rules="[{ required: true, message: '请选择审批流程', trigger: 'change' }]"
    >
      <el-select
        v-model="formData.approvalFlowId"
        placeholder="请选择审批流程"
        style="width: 100%"
        @change="syncToParent"
      >
        <el-option
          v-for="opt in approvalFlowOptions"
          :key="opt.id"
          :label="opt.name"
          :value="opt.id"
        />
      </el-select>
    </el-form-item>

    <!-- 是否下达（仅审计决定类型显示） -->
    <el-form-item
      v-if="formData.nodeType === 5"
      label="是否下达"
      prop="hasIssue"
      :rules="[{ required: true, message: '请选择是否下达', trigger: 'change' }]"
    >
      <el-radio-group v-model="formData.hasIssue" @change="syncToParent">
        <el-radio :value="true">是</el-radio>
        <el-radio :value="false">否</el-radio>
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
  /**
   * 节点配置表单
   * 包含节点名称、类型、显示条件、权限、关联表单、是否设置审批流程等
   * 表单变更通过 update 事件同步到父级树
   */
  import { ref, computed, watch, reactive } from 'vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import type {
    ProcessNode,
    NodeConfigForm as NodeFormType,
    NodeTypeOption,
    ApprovalFlowOption
  } from '@/types/process-config'

  interface Props {
    node: ProcessNode
    tree: ProcessNode[]
    nodeTypeOptions: NodeTypeOption[]
    approvalFlowOptions: ApprovalFlowOption[]
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    update: [form: NodeFormType]
  }>()

  const formRef = ref<FormInstance>()

  // 表单初始数据：克隆当前节点
  const buildInitForm = (n: ProcessNode): NodeFormType => ({
    id: n.id,
    parentId: n.parentId,
    name: n.name,
    nodeType: n.nodeType,
    isStage: n.isStage,
    hasCondition: n.hasCondition,
    permissions: JSON.parse(JSON.stringify(n.permissions || [])),
    relatedForms: [...(n.relatedForms || [])],
    hasApproval: n.hasApproval,
    approvalFlowId: n.approvalFlowId ?? null,
    hasIssue: n.hasIssue ?? false
  })

  const formData = reactive<NodeFormType>(buildInitForm(props.node))

  // 节点切换时重置表单
  watch(
    () => props.node,
    (n) => {
      Object.assign(formData, buildInitForm(n))
    }
  )

  // 上级目录选项（来自树）
  const parentOptions = computed(() => {
    const list: { label: string; value: number }[] = []
    const walk = (nodes: ProcessNode[]) => {
      for (const n of nodes) {
        if (n.isStage) list.push({ label: n.name, value: n.id })
        if (n.children?.length) walk(n.children)
      }
    }
    walk(props.tree)
    return list
  })

  // 关联表单选项（取所有非阶段节点，排除当前节点自身）
  const relatedFormOptions = computed(() => {
    const list: { label: string; value: number }[] = []
    const walk = (nodes: ProcessNode[]) => {
      for (const n of nodes) {
        if (!n.isStage && n.id !== formData.id) {
          list.push({ label: n.name, value: n.id })
        }
        if (n.children?.length) walk(n.children)
      }
    }
    walk(props.tree)
    return list
  })

  // 表单校验规则
  const rules: FormRules = {
    name: [{ required: true, message: '请输入节点名称', trigger: 'blur' }],
    nodeType: [{ required: true, message: '请选择节点类型', trigger: 'change' }],
    hasCondition: [{ required: true, message: '请选择是否有显示条件', trigger: 'change' }],
    relatedForms: [
      {
        required: true,
        validator: (_, val, cb) => {
          if (!val || val.length === 0) cb(new Error('请选择关联表单'))
          else cb()
        },
        trigger: 'change'
      }
    ],
    hasApproval: [{ required: true, message: '请选择是否设置审批流程', trigger: 'change' }]
  }

  // 同步到父级（树节点保持联动）
  const syncToParent = () => {
    emit('update', { ...formData, permissions: JSON.parse(JSON.stringify(formData.permissions)) })
  }

  // 切换"是否设置审批流程"，关闭时清空已选流程
  const handleApprovalChange = (val: string | number | boolean | undefined) => {
    if (!val) formData.approvalFlowId = null
    syncToParent()
  }

  // 暴露校验方法供父组件调用
  defineExpose({
    validate: () => formRef.value?.validate()
  })
</script>

<style lang="scss" scoped>
  .node-config-form {
    max-width: 1100px;
  }

  /* 操作权限多选水平排列 */
  .perm-checkboxes {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
  }

  /* 表单项之间的间距收紧，与图中排版一致 */
  :deep(.el-form-item) {
    margin-bottom: 18px;
  }

  :deep(.el-form-item__label) {
    padding-bottom: 6px;
    font-weight: 500;
    color: #303133;
  }

  /* 表格内 switch / checkbox 紧凑 */
  :deep(.el-table .cell) {
    display: flex;
    align-items: center;
  }
</style>
