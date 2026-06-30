<template>
  <div class="process-config-main">
    <!-- 顶部标题栏 + 操作按钮 -->
    <div class="header-bar">
      <div class="header-left">
        <el-button link @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <span class="scheme-title">{{ scheme.name }}</span>
        <span class="scheme-version">版本: {{ scheme.version }}</span>
      </div>
      <div class="header-actions">
        <el-button @click="handleAddStage">
          <el-icon><Plus /></el-icon>
          新建阶段
        </el-button>
        <el-button @click="handleCommonNode">
          <el-icon><Plus /></el-icon>
          通用节点
        </el-button>
        <el-button>
          <el-icon><Calendar /></el-icon>
          项目定期任务
        </el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">
          <el-icon><Document /></el-icon>
          保存
        </el-button>
      </div>
    </div>

    <!-- 主体：左侧流程树 + 右侧节点配置表单 -->
    <div class="config-body" v-loading="loading">
      <!-- 左侧流程树面板 -->
      <ProcessTreePanel
        :tree="scheme.tree"
        :selected-id="selectedNodeId"
        @select="handleSelectNode"
        @add-child="handleAddChild"
        @delete="handleDeleteNode"
      />

      <!-- 右侧节点配置表单 -->
      <div class="form-area">
        <!-- 整改进展节点：专属配置表单 -->
        <ProgressNodeConfigForm
          v-if="selectedNode && !selectedNode.isStage && selectedNode.nodeType === 3"
          :key="selectedNode.id"
          :node="selectedNode"
          :tree="scheme.tree"
          :node-type-options="nodeTypeOptions"
          @update="handleUpdateNode"
        />
        <!-- 其他节点：通用配置表单 -->
        <NodeConfigForm
          v-else-if="selectedNode && !selectedNode.isStage"
          :key="selectedNode.id"
          :node="selectedNode"
          :tree="scheme.tree"
          :node-type-options="nodeTypeOptions"
          :approval-flow-options="approvalFlowOptions"
          @update="handleUpdateNode"
        />
        <div v-else-if="selectedNode && selectedNode.isStage" class="stage-tip">
          <el-empty description="阶段节点不可配置详情，请选择具体节点" />
        </div>
        <div v-else class="empty-tip">
          <el-empty description="请从左侧选择节点查看配置" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  /**
   * 整改流程方案配置主体
   * 顶部操作按钮 + 中部分栏（流程树 + 节点表单）
   */
  import { ref, computed, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { ArrowLeft, Plus, Calendar, Document } from '@element-plus/icons-vue'
  import ProcessTreePanel from './ProcessTreePanel.vue'
  import NodeConfigForm from './NodeConfigForm.vue'
  import ProgressNodeConfigForm from './ProgressNodeConfigForm.vue'
  import {
    getProcessScheme,
    saveProcessScheme,
    addStage,
    addChildNode,
    deleteNode,
    getNodeTypeOptions,
    getApprovalFlowOptions
  } from '@/api/process-config'
  import type {
    ProcessScheme,
    ProcessNode,
    NodeConfigForm as NodeFormType,
    NodeTypeOption,
    ApprovalFlowOption
  } from '@/types/process-config'

  // 流程方案数据
  const scheme = ref<ProcessScheme>({ id: 0, name: '', version: '', tree: [] })
  // 当前选中节点 ID
  const selectedNodeId = ref<number | null>(null)
  // 节点类型选项
  const nodeTypeOptions = ref<NodeTypeOption[]>([])
  // 审批流程选项
  const approvalFlowOptions = ref<ApprovalFlowOption[]>([])
  // loading 状态
  const loading = ref(false)
  const saving = ref(false)

  // 递归查找节点
  const findNodeById = (nodes: ProcessNode[], id: number): ProcessNode | null => {
    for (const n of nodes) {
      if (n.id === id) return n
      if (n.children?.length) {
        const found = findNodeById(n.children, id)
        if (found) return found
      }
    }
    return null
  }

  // 当前选中节点对象
  const selectedNode = computed(() => {
    if (selectedNodeId.value === null) return null
    return findNodeById(scheme.value.tree, selectedNodeId.value)
  })

  // 加载流程方案
  const loadScheme = async () => {
    loading.value = true
    try {
      const res = await getProcessScheme()
      scheme.value = res.data
      // 默认选中第一个非阶段节点
      if (!selectedNodeId.value) {
        const firstStage = scheme.value.tree[0]
        const firstChild = firstStage?.children?.find((c) => !c.isStage)
        // 优先选中"审计决定"
        const auditDecisionNode = firstStage?.children?.find((c) => c.name === '审计决定')
        selectedNodeId.value = auditDecisionNode?.id ?? firstChild?.id ?? null
      }
    } finally {
      loading.value = false
    }
  }

  // 加载选项
  const loadOptions = async () => {
    const [typesRes, flowsRes] = await Promise.all([getNodeTypeOptions(), getApprovalFlowOptions()])
    nodeTypeOptions.value = typesRes.data
    approvalFlowOptions.value = flowsRes.data
  }

  // 选中节点
  const handleSelectNode = (id: number) => {
    selectedNodeId.value = id
  }

  // 在指定父节点下添加子节点
  const handleAddChild = async (parentId: number) => {
    try {
      const { value: name } = await ElMessageBox.prompt('请输入节点名称', '新增节点', {
        inputPattern: /\S/,
        inputErrorMessage: '节点名称不能为空'
      })
      const res = await addChildNode(parentId, name)
      if (res.code === 200) {
        ElMessage.success('添加成功')
        await loadScheme()
        // 自动选中新建的节点
        if (res.data?.id) selectedNodeId.value = res.data.id
      } else {
        ElMessage.error(res.message)
      }
    } catch {
      // 用户取消
    }
  }

  // 删除节点
  const handleDeleteNode = async (id: number) => {
    try {
      await ElMessageBox.confirm('确定要删除该节点？删除后无法恢复', '删除确认', {
        type: 'warning'
      })
      const res = await deleteNode(id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        if (selectedNodeId.value === id) selectedNodeId.value = null
        await loadScheme()
      } else {
        ElMessage.error(res.message)
      }
    } catch {
      // 用户取消
    }
  }

  // 新建阶段
  const handleAddStage = async () => {
    try {
      const { value: name } = await ElMessageBox.prompt('请输入阶段名称', '新建阶段', {
        inputPattern: /\S/,
        inputErrorMessage: '阶段名称不能为空'
      })
      const res = await addStage(name)
      if (res.code === 200) {
        ElMessage.success('新建成功')
        await loadScheme()
      } else {
        ElMessage.error(res.message)
      }
    } catch {
      // 用户取消
    }
  }

  // 通用节点（占位）
  const handleCommonNode = () => {
    ElMessage.info('通用节点配置功能开发中')
  }

  // 更新节点（来自表单 emit）
  const handleUpdateNode = (form: NodeFormType) => {
    // 直接同步到本地树（保存按钮统一提交后端）
    const node = findNodeById(scheme.value.tree, form.id)
    if (node) Object.assign(node, form)
  }

  // 保存整体方案
  const handleSave = async () => {
    saving.value = true
    try {
      const res = await saveProcessScheme(scheme.value)
      if (res.code === 200) {
        ElMessage.success('保存成功')
      } else {
        ElMessage.error(res.message)
      }
    } finally {
      saving.value = false
    }
  }

  // 返回（占位：滚到顶部或后续接入路由）
  const handleBack = () => {
    // 可调用 router.back() 或回到列表，本期保持当前页
  }

  onMounted(() => {
    loadOptions()
    loadScheme()
  })
</script>

<style lang="scss" scoped>
  .process-config-main {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  /* 顶部操作栏 */
  .header-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid #eaebf1;

    .header-left {
      display: flex;
      gap: 12px;
      align-items: center;

      .scheme-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }

      .scheme-version {
        font-size: 13px;
        color: #909399;
      }
    }

    .header-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }

  /* 主体：左侧树 + 右侧表单 */
  .config-body {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .form-area {
    flex: 1;
    padding: 16px 20px;
    overflow: auto;
  }

  .empty-tip,
  .stage-tip {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
</style>
