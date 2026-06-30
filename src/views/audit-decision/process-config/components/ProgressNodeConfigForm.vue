<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    label-position="top"
    class="progress-node-form"
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
        <el-table-column label="操作权限" min-width="420">
          <template #default="{ row }">
            <div class="perm-checkboxes">
              <el-checkbox v-model="row.canMaintain" @change="syncToParent">维护</el-checkbox>
              <el-checkbox v-model="row.canCancel" @change="syncToParent">销号</el-checkbox>
              <el-checkbox v-model="row.canExport" @change="syncToParent"
                >导出列表为excel</el-checkbox
              >
              <el-checkbox v-model="row.canSubmit" @change="syncToParent">提交</el-checkbox>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>

    <!-- 问题来源 -->
    <el-form-item label="问题来源" prop="problemSource" required>
      <el-select
        v-model="progress.problemSource"
        multiple
        placeholder="请选择问题来源"
        style="width: 100%"
        @change="syncToParent"
      >
        <el-option v-for="opt in problemSourceOptions" :key="opt" :label="opt" :value="opt" />
      </el-select>
    </el-form-item>

    <!-- 进展提交方式 -->
    <el-form-item label="进展提交方式" required>
      <el-radio-group v-model="progress.submitMode" @change="syncToParent">
        <el-radio value="project">按项目提交</el-radio>
        <el-radio value="issue">按问题提交</el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- 非立行立改问题的进展填报频率 -->
    <el-form-item label="非立行立改问题的进展填报频率" required>
      <el-radio-group
        v-model="progress.reportFrequency"
        class="vertical-radio"
        @change="syncToParent"
      >
        <el-radio value="onComplete">整改完成填报</el-radio>
        <el-radio value="quarter">每季度填报一次</el-radio>
        <el-radio value="year">每年填报一次</el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- 是否需要审批 -->
    <el-form-item required>
      <template #label>
        <span class="label-with-tip">
          是否需要审批
          <el-tooltip content="开启后，整改进展填报需经过审批流程" placement="top">
            <el-icon class="tip-icon"><Warning /></el-icon>
          </el-tooltip>
        </span>
      </template>
      <el-radio-group v-model="progress.needApproval" @change="syncToParent">
        <el-radio :value="true">是</el-radio>
        <el-radio :value="false">否</el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- 未整改字段 -->
    <div class="field-group">
      <div class="group-title">未整改字段</div>
      <ProgressFieldRow
        v-for="(item, idx) in progress.unrectifiedFields"
        :key="item.key"
        v-model:field="progress.unrectifiedFields[idx]"
        @change="syncToParent"
      />
    </div>

    <!-- 正在整改字段 -->
    <div class="field-group">
      <div class="group-title">正在整改字段</div>
      <ProgressFieldRow
        v-for="(item, idx) in progress.rectifyingFields"
        :key="item.key"
        v-model:field="progress.rectifyingFields[idx]"
        @change="syncToParent"
      />
    </div>

    <!-- 已整改字段 -->
    <div class="field-group">
      <div class="group-title">已整改字段</div>
      <ProgressFieldRow
        v-for="(item, idx) in progress.rectifiedFields"
        :key="item.key"
        v-model:field="progress.rectifiedFields[idx]"
        @change="syncToParent"
      />
    </div>

    <!-- 是否需要整改成效（成效字段上方）：默认"是"，选"否"时成效字段去勾选+必填置否并灰显 -->
    <el-form-item label="是否需要整改成效" required>
      <el-radio-group v-model="progress.needEffect" @change="handleNeedEffectChange">
        <el-radio :value="true">是</el-radio>
        <el-radio :value="false">否</el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- 成效字段（"不需要整改成效"时整组灰显且不可勾选） -->
    <div class="field-group">
      <div class="group-title" :class="{ 'is-disabled': !progress.needEffect }">成效字段</div>
      <ProgressFieldRow
        v-for="(item, idx) in progress.effectFields"
        :key="item.key"
        v-model:field="progress.effectFields[idx]"
        :disabled="!progress.needEffect"
        @change="syncToParent"
      />
    </div>

    <!-- 销号方式 -->
    <el-form-item label="销号方式" required class="mt-group">
      <el-radio-group v-model="progress.cancelMode" @change="syncToParent">
        <el-radio value="auto">自动销号</el-radio>
        <el-radio value="manual">手动销号</el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- 销号表单设置（仅手动销号显示） -->
    <div v-if="progress.cancelMode === 'manual'" class="field-group">
      <div class="group-title">销号表单设置</div>
      <ProgressFieldRow
        v-for="(item, idx) in progress.cancelFormFields"
        :key="item.key"
        v-model:field="progress.cancelFormFields[idx]"
        @change="syncToParent"
      />
    </div>

    <!-- 销号是否需要审批 -->
    <el-form-item required>
      <template #label>
        <span class="label-with-tip">
          销号是否需要审批
          <el-tooltip content="开启后，销号操作需经过审批流程" placement="top">
            <el-icon class="tip-icon dark"><Warning /></el-icon>
          </el-tooltip>
        </span>
      </template>
      <el-radio-group v-model="progress.cancelNeedApproval" @change="syncToParent">
        <el-radio :value="true">是</el-radio>
        <el-radio :value="false">否</el-radio>
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
  /**
   * 整改进展节点配置表单
   * 复刻整改进展节点的完整配置：基本信息、节点权限、问题来源、进展提交方式、
   * 填报频率、是否需要审批、未整改/正在整改/已整改字段、成效字段、
   * 销号方式、销号表单设置、销号是否需要审批
   * 表单变更通过 update 事件同步到父级树
   */
  import { ref, computed, watch, reactive } from 'vue'
  import { Warning } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import ProgressFieldRow from './ProgressFieldRow.vue'
  import type {
    ProcessNode,
    NodeConfigForm as NodeFormType,
    NodeTypeOption,
    ProgressNodeConfig
  } from '@/types/process-config'

  interface Props {
    node: ProcessNode
    tree: ProcessNode[]
    nodeTypeOptions: NodeTypeOption[]
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    update: [form: NodeFormType]
  }>()

  const formRef = ref<FormInstance>()

  // 问题来源可选项（与图1一致）
  const problemSourceOptions = ['整改清单', '整改方案', '整改进展', '整改报告']

  // 整改进展默认配置（节点缺失 progressConfig 时兜底）
  const buildDefaultProgressConfig = (): ProgressNodeConfig => ({
    problemSource: ['整改方案'],
    submitMode: 'project',
    reportFrequency: 'onComplete',
    needApproval: false,
    needEffect: true,
    unrectifiedFields: [],
    rectifyingFields: [],
    rectifiedFields: [],
    effectFields: [],
    cancelMode: 'auto',
    cancelFormFields: [],
    cancelNeedApproval: false
  })

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
    progressConfig: n.progressConfig
      ? JSON.parse(JSON.stringify(n.progressConfig))
      : buildDefaultProgressConfig()
  })

  const formData = reactive<NodeFormType>(buildInitForm(props.node))
  // progressConfig 一定存在（buildInitForm 已兜底）
  const progress = computed(() => formData.progressConfig as ProgressNodeConfig)

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

  // 表单校验规则
  const rules: FormRules = {
    name: [{ required: true, message: '请输入节点名称', trigger: 'blur' }],
    nodeType: [{ required: true, message: '请选择节点类型', trigger: 'change' }],
    hasCondition: [{ required: true, message: '请选择是否有显示条件', trigger: 'change' }]
  }

  // 同步到父级（深拷贝避免引用串改）
  const syncToParent = () => {
    emit('update', JSON.parse(JSON.stringify(formData)))
  }

  // 切换"是否需要整改成效"：选"否"时成效字段去勾选、必填全部置否
  const handleNeedEffectChange = (val: string | number | boolean | undefined) => {
    if (val === false) {
      progress.value.effectFields.forEach((f) => {
        f.enabled = false
        f.required = false
      })
    }
    syncToParent()
  }

  // 暴露校验方法供父组件调用
  defineExpose({
    validate: () => formRef.value?.validate()
  })
</script>

<style lang="scss" scoped>
  .progress-node-form {
    max-width: 1100px;
  }

  /* 操作权限多选水平排列 */
  .perm-checkboxes {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
  }

  /* 表单项间距，与图中排版一致 */
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

  /* 竖向单选（填报频率） */
  .vertical-radio {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  /* 字段分组 */
  .field-group {
    margin-bottom: 24px;

    .group-title {
      margin-bottom: 8px;
      font-size: 15px;
      font-weight: 600;
      color: #303133;

      /* 不需要整改成效时标题灰显 */
      &.is-disabled {
        color: #c0c4cc;
      }
    }
  }

  /* 销号方式与上方字段分组留出间距 */
  .mt-group {
    margin-top: 8px;
  }

  /* 带提示图标的标题 */
  .label-with-tip {
    display: inline-flex;
    gap: 4px;
    align-items: center;

    .tip-icon {
      font-size: 14px;
      color: #909399;

      /* 销号审批用深色实心提示，贴合图4 */
      &.dark {
        color: #303133;
      }
    }
  }
</style>
