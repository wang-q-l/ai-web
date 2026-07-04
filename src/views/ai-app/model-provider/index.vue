<script setup lang="ts">
  // 大模型厂商管理页面
  // Tab1 模型厂商：主从布局（左侧厂商列表 + 右侧厂商详情与模型列表）
  // Tab2 智能体：列表（区分内置/自建），绑定主备模型
  import { ref, computed, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Plus, Search, Star, StarFilled, Connection } from '@element-plus/icons-vue'
  import {
    getProviderList,
    deleteProvider,
    toggleProviderStatus,
    testProviderConn,
    getModelList,
    deleteModel,
    toggleModelStatus,
    setDefaultModel,
    getAllModels,
    getAgentList,
    deleteAgent,
    toggleAgentStatus
  } from '@/api/model-provider'
  import type {
    Provider,
    ModelItem,
    AgentItem,
    AgentQuery,
    ModelType,
    AgentSource,
    ConnStatus
  } from '@/types/model-provider'
  import ProviderDrawer from './components/ProviderDrawer.vue'
  import ModelDialog from './components/ModelDialog.vue'
  import AgentDrawer from './components/AgentDrawer.vue'

  // 当前激活 Tab
  const activeTab = ref<'provider' | 'agent'>('provider')

  // 模型类型标签映射（文案 + 颜色）
  const MODEL_TYPE_MAP: Record<
    ModelType,
    { label: string; type: 'primary' | 'success' | 'warning' | 'info' }
  > = {
    chat: { label: '对话', type: 'primary' },
    multimodal: { label: '多模态', type: 'success' },
    embedding: { label: '向量', type: 'info' },
    reasoning: { label: '推理', type: 'warning' }
  }

  // 连通性状态标签映射
  const CONN_MAP: Record<ConnStatus, { label: string; type: 'success' | 'danger' | 'info' }> = {
    success: { label: '连接正常', type: 'success' },
    failed: { label: '连接异常', type: 'danger' },
    testing: { label: '检测中', type: 'info' },
    unknown: { label: '未检测', type: 'info' }
  }

  // ==================== Tab1 模型厂商 ====================
  const providerLoading = ref(false)
  const providerList = ref<Provider[]>([])
  const providerKeyword = ref('') // 厂商搜索关键词
  const currentProviderId = ref<number | null>(null) // 当前选中厂商

  // 当前选中的厂商详情
  const currentProvider = computed(
    () => providerList.value.find((p) => p.id === currentProviderId.value) || null
  )

  // 获取厂商列表
  const fetchProviders = async () => {
    providerLoading.value = true
    try {
      const res = await getProviderList({ name: providerKeyword.value || undefined })
      providerList.value = res.data || []
      // 默认选中第一个，或保持当前选中
      if (providerList.value.length > 0) {
        const exists = providerList.value.some((p) => p.id === currentProviderId.value)
        if (!exists) currentProviderId.value = providerList.value[0].id
        await fetchModels()
      } else {
        currentProviderId.value = null
        modelList.value = []
      }
    } finally {
      providerLoading.value = false
    }
  }

  // 切换选中厂商
  const handleSelectProvider = async (id: number) => {
    if (currentProviderId.value === id) return
    currentProviderId.value = id
    await fetchModels()
  }

  // 厂商启停
  const handleToggleProvider = async (provider: Provider, val: boolean) => {
    const res = await toggleProviderStatus(provider.id, val)
    if (res.code === 200) {
      ElMessage.success(res.message)
    } else {
      provider.enabled = !val // 回滚
      ElMessage.error(res.message)
    }
  }

  // 连通性测试
  const testingId = ref<number | null>(null)
  const handleTestConn = async (provider: Provider) => {
    testingId.value = provider.id
    provider.connStatus = 'testing'
    try {
      const res = await testProviderConn(provider.id)
      if (res.code === 200 && res.data) {
        provider.connStatus = (res.data as { connStatus: ConnStatus }).connStatus
        if (res.message?.includes('成功')) {
          ElMessage.success(res.message)
        } else {
          ElMessage.warning(res.message)
        }
      }
    } finally {
      testingId.value = null
    }
  }

  // 厂商抽屉
  const providerDrawerOpen = ref(false)
  const editingProvider = ref<Provider | null>(null)
  const handleAddProvider = () => {
    editingProvider.value = null
    providerDrawerOpen.value = true
  }
  const handleEditProvider = (provider: Provider) => {
    editingProvider.value = provider
    providerDrawerOpen.value = true
  }
  const handleProviderSuccess = () => {
    fetchProviders()
  }

  // 删除厂商（其下有模型时后端阻止）
  const handleDeleteProvider = (provider: Provider) => {
    ElMessageBox.confirm(`确认删除厂商【${provider.name}】吗？`, '提示', {
      type: 'warning'
    })
      .then(async () => {
        const res = await deleteProvider(provider.id)
        if (res.code === 200) {
          ElMessage.success(res.message)
          if (currentProviderId.value === provider.id) currentProviderId.value = null
          fetchProviders()
        } else {
          ElMessage.error(res.message)
        }
      })
      .catch(() => {})
  }

  // ==================== 模型列表（右侧） ====================
  const modelLoading = ref(false)
  const modelList = ref<ModelItem[]>([])

  // 获取当前厂商的模型列表
  const fetchModels = async () => {
    if (!currentProviderId.value) {
      modelList.value = []
      return
    }
    modelLoading.value = true
    try {
      const res = await getModelList(currentProviderId.value)
      modelList.value = res.data || []
    } finally {
      modelLoading.value = false
    }
  }

  // 模型弹窗
  const modelDialogOpen = ref(false)
  const editingModel = ref<ModelItem | null>(null)
  const handleAddModel = () => {
    editingModel.value = null
    modelDialogOpen.value = true
  }
  const handleEditModel = (model: ModelItem) => {
    editingModel.value = model
    modelDialogOpen.value = true
  }
  const handleModelSuccess = () => {
    fetchModels()
    fetchProviders() // 同步左侧模型数量
  }

  // 模型启停
  const handleToggleModel = async (model: ModelItem, val: boolean) => {
    const res = await toggleModelStatus(model.id, val)
    if (res.code === 200) {
      ElMessage.success(res.message)
    } else {
      model.enabled = !val // 回滚
      ElMessage.error(res.message)
    }
  }

  // 设为默认模型
  const handleSetDefault = async (model: ModelItem) => {
    const res = await setDefaultModel(model.id)
    if (res.code === 200) {
      ElMessage.success(res.message)
      fetchModels()
    } else {
      ElMessage.error(res.message)
    }
  }

  // 删除模型（被引用 / 为默认时后端阻止）
  const handleDeleteModel = (model: ModelItem) => {
    ElMessageBox.confirm(`确认删除模型【${model.name}】吗？`, '提示', {
      type: 'warning'
    })
      .then(async () => {
        const res = await deleteModel(model.id)
        if (res.code === 200) {
          ElMessage.success(res.message)
          handleModelSuccess()
        } else {
          ElMessage.error(res.message)
        }
      })
      .catch(() => {})
  }

  // ==================== Tab2 智能体 ====================
  const agentLoading = ref(false)
  const agentList = ref<AgentItem[]>([])

  // 智能体筛选条件
  const agentQuery = ref<AgentQuery>({
    name: '',
    source: '',
    enabled: '',
    providerId: ''
  })

  // 全部模型选项（含厂商信息），供智能体表单级联选择 + 列表展示模型名
  interface ModelOption {
    id: number
    name: string
    modelKey: string
    type: ModelType
    enabled: boolean
    providerId: number
    providerName: string
    providerEnabled: boolean
  }
  const allModels = ref<ModelOption[]>([])

  // 根据模型 id 取展示名称
  const modelNameById = (id: number | null): string => {
    if (id === null) return '—'
    const m = allModels.value.find((x) => x.id === id)
    return m ? m.name : '—'
  }

  // 来源筛选选项
  const SOURCE_OPTIONS: { label: string; value: AgentSource | '' }[] = [
    { label: '全部', value: '' },
    { label: '内置', value: 'builtin' },
    { label: '自建', value: 'custom' }
  ]

  // 状态筛选选项
  const STATUS_OPTIONS: { label: string; value: boolean | '' }[] = [
    { label: '全部', value: '' },
    { label: '启用', value: true },
    { label: '禁用', value: false }
  ]

  // 获取全部模型（供级联与名称回显）
  const fetchAllModels = async () => {
    const res = await getAllModels()
    // mock 返回的模型附带了厂商信息，结构比 ModelItem 更宽，先转 unknown 再断言
    allModels.value = (res.data || []) as unknown as ModelOption[]
  }

  // 获取智能体列表
  const fetchAgents = async () => {
    agentLoading.value = true
    try {
      const res = await getAgentList({
        name: agentQuery.value.name || undefined,
        source: agentQuery.value.source || undefined,
        enabled: agentQuery.value.enabled,
        providerId: agentQuery.value.providerId
      })
      agentList.value = res.data || []
    } finally {
      agentLoading.value = false
    }
  }

  // 重置智能体筛选
  const handleResetAgentQuery = () => {
    agentQuery.value = { name: '', source: '', enabled: '', providerId: '' }
    fetchAgents()
  }

  // 智能体抽屉
  const agentDrawerOpen = ref(false)
  const editingAgent = ref<AgentItem | null>(null)
  const handleAddAgent = () => {
    editingAgent.value = null
    agentDrawerOpen.value = true
  }
  const handleEditAgent = (agent: AgentItem) => {
    editingAgent.value = agent
    agentDrawerOpen.value = true
  }
  const handleAgentSuccess = () => {
    fetchAgents()
  }

  // 智能体启停
  const handleToggleAgent = async (agent: AgentItem, val: boolean) => {
    const res = await toggleAgentStatus(agent.id, val)
    if (res.code === 200) {
      ElMessage.success(res.message)
    } else {
      agent.enabled = !val // 回滚
      ElMessage.error(res.message)
    }
  }

  // 删除智能体（内置不可删，后端阻止）
  const handleDeleteAgent = (agent: AgentItem) => {
    ElMessageBox.confirm(`确认删除智能体【${agent.name}】吗？`, '提示', {
      type: 'warning'
    })
      .then(async () => {
        const res = await deleteAgent(agent.id)
        if (res.code === 200) {
          ElMessage.success(res.message)
          fetchAgents()
        } else {
          ElMessage.error(res.message)
        }
      })
      .catch(() => {})
  }

  // Tab 切换：首次进入智能体 Tab 时加载数据
  const handleTabChange = (tab: string | number) => {
    if (tab === 'agent' && agentList.value.length === 0) {
      fetchAgents()
    }
  }

  // 初始化
  onMounted(async () => {
    await fetchAllModels()
    await fetchProviders()
  })
</script>

<template>
  <div class="provider-page">
    <!-- 页面头部 -->
    <el-card class="header-card" shadow="never">
      <div class="header-content">
        <div class="header-left">
          <div class="page-title">大模型厂商管理</div>
        </div>
      </div>
    </el-card>

    <!-- Tab 区 -->
    <el-card class="body-card" shadow="never">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- ========== Tab1 模型厂商（主从布局） ========== -->
        <el-tab-pane label="模型厂商" name="provider">
          <div class="master-detail">
            <!-- 左侧：厂商列表 -->
            <div class="master-panel" v-loading="providerLoading">
              <div class="master-toolbar">
                <el-input
                  v-model="providerKeyword"
                  placeholder="搜索厂商名称"
                  clearable
                  :prefix-icon="Search"
                  @input="fetchProviders"
                  @clear="fetchProviders"
                />
                <el-button type="primary" :icon="Plus" @click="handleAddProvider">新增</el-button>
              </div>
              <el-scrollbar class="master-list">
                <div
                  v-for="p in providerList"
                  :key="p.id"
                  class="provider-item"
                  :class="{ active: p.id === currentProviderId }"
                  @click="handleSelectProvider(p.id)"
                >
                  <span class="status-dot" :class="p.enabled ? 'dot-on' : 'dot-off'"></span>
                  <span class="provider-name">{{ p.name }}</span>
                  <el-badge :value="p.modelCount" :max="99" type="info" class="model-badge" />
                </div>
                <el-empty
                  v-if="!providerLoading && providerList.length === 0"
                  description="暂无厂商"
                  :image-size="80"
                />
              </el-scrollbar>
            </div>

            <!-- 右侧：厂商详情 + 模型列表 -->
            <div class="detail-panel">
              <template v-if="currentProvider">
                <!-- 厂商详情卡 -->
                <div class="detail-header">
                  <div class="detail-title">
                    <span class="name">{{ currentProvider.name }}</span>
                    <el-tag size="small" type="info">{{ currentProvider.code }}</el-tag>
                    <el-switch
                      v-model="currentProvider.enabled"
                      inline-prompt
                      active-text="启用"
                      inactive-text="禁用"
                      @change="(val) => handleToggleProvider(currentProvider!, val as boolean)"
                    />
                  </div>
                  <div class="detail-actions">
                    <el-button
                      :icon="Connection"
                      :loading="testingId === currentProvider.id"
                      @click="handleTestConn(currentProvider)"
                    >
                      连通性测试
                    </el-button>
                    <el-button @click="handleEditProvider(currentProvider)">编辑</el-button>
                    <el-button type="danger" plain @click="handleDeleteProvider(currentProvider)">
                      删除
                    </el-button>
                  </div>
                </div>

                <el-descriptions :column="2" border class="detail-desc">
                  <el-descriptions-item label="API 地址" :span="2">
                    {{ currentProvider.apiBaseUrl }}
                  </el-descriptions-item>
                  <el-descriptions-item label="API Key">
                    {{ currentProvider.apiKeyMasked }}
                  </el-descriptions-item>
                  <el-descriptions-item label="连通性">
                    <el-tag :type="CONN_MAP[currentProvider.connStatus].type" size="small">
                      {{ CONN_MAP[currentProvider.connStatus].label }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="默认模型">
                    {{
                      modelList.find((m) => m.id === currentProvider!.defaultModelId)?.name || '—'
                    }}
                  </el-descriptions-item>
                  <el-descriptions-item label="限流配额">
                    {{ currentProvider.qps }} QPS / {{ currentProvider.tokenQuota }} 万 Token
                  </el-descriptions-item>
                </el-descriptions>

                <!-- 模型列表 -->
                <div class="model-section-header">
                  <span class="section-title">模型列表</span>
                  <el-button type="primary" :icon="Plus" size="small" @click="handleAddModel">
                    新增模型
                  </el-button>
                </div>
                <el-table :data="modelList" v-loading="modelLoading" border>
                  <el-table-column label="模型名称" prop="name" min-width="140">
                    <template #default="{ row }">
                      <el-icon v-if="row.isDefault" class="default-star"><StarFilled /></el-icon>
                      {{ row.name }}
                    </template>
                  </el-table-column>
                  <el-table-column label="型号标识" prop="modelKey" min-width="140" />
                  <el-table-column label="类型" width="90">
                    <template #default="{ row }">
                      <el-tag :type="MODEL_TYPE_MAP[row.type as ModelType].type" size="small">
                        {{ MODEL_TYPE_MAP[row.type as ModelType].label }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="上下文" width="90" align="center">
                    <template #default="{ row }">{{ row.contextLength }}K</template>
                  </el-table-column>
                  <el-table-column label="状态" width="80" align="center">
                    <template #default="{ row }">
                      <el-switch
                        v-model="row.enabled"
                        size="small"
                        @change="(val) => handleToggleModel(row, val as boolean)"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="180" fixed="right">
                    <template #default="{ row }">
                      <el-button
                        link
                        type="primary"
                        :icon="Star"
                        :disabled="row.isDefault"
                        @click="handleSetDefault(row)"
                      >
                        设默认
                      </el-button>
                      <el-button link type="primary" @click="handleEditModel(row)">编辑</el-button>
                      <el-button link type="danger" @click="handleDeleteModel(row)">删除</el-button>
                    </template>
                  </el-table-column>
                  <template #empty>
                    <el-empty description="该厂商下暂无模型" :image-size="80" />
                  </template>
                </el-table>
              </template>

              <!-- 未选中厂商时的空态 -->
              <el-empty v-else description="请在左侧选择厂商" :image-size="120" />
            </div>
          </div>
        </el-tab-pane>

        <!-- ========== Tab2 智能体 ========== -->
        <el-tab-pane label="智能体" name="agent">
          <!-- 筛选区 -->
          <div class="agent-filter">
            <el-input
              v-model="agentQuery.name"
              placeholder="搜索智能体名称"
              clearable
              :prefix-icon="Search"
              class="filter-item"
              @keyup.enter="fetchAgents"
              @clear="fetchAgents"
            />
            <el-select
              v-model="agentQuery.source"
              placeholder="来源"
              class="filter-item filter-select"
              @change="fetchAgents"
            >
              <el-option
                v-for="o in SOURCE_OPTIONS"
                :key="String(o.value)"
                :label="o.label"
                :value="o.value"
              />
            </el-select>
            <el-select
              v-model="agentQuery.enabled"
              placeholder="状态"
              class="filter-item filter-select"
              @change="fetchAgents"
            >
              <el-option
                v-for="o in STATUS_OPTIONS"
                :key="String(o.value)"
                :label="o.label"
                :value="o.value"
              />
            </el-select>
            <el-select
              v-model="agentQuery.providerId"
              placeholder="绑定厂商"
              clearable
              class="filter-item filter-select"
              @change="fetchAgents"
            >
              <el-option label="全部" value="" />
              <el-option v-for="p in providerList" :key="p.id" :label="p.name" :value="p.id" />
            </el-select>
            <el-button type="primary" @click="fetchAgents">查询</el-button>
            <el-button @click="handleResetAgentQuery">重置</el-button>
            <el-button type="primary" :icon="Plus" class="add-btn" @click="handleAddAgent">
              新建智能体
            </el-button>
          </div>

          <!-- 智能体表格 -->
          <el-table :data="agentList" v-loading="agentLoading" border>
            <el-table-column label="名称" prop="name" min-width="140" />
            <el-table-column label="来源" width="90" align="center">
              <template #default="{ row }">
                <el-tag :type="row.source === 'builtin' ? 'warning' : 'info'" size="small">
                  {{ row.source === 'builtin' ? '内置' : '自建' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              label="用途"
              prop="description"
              min-width="200"
              show-overflow-tooltip
            />
            <el-table-column label="主模型" min-width="130">
              <template #default="{ row }">{{ modelNameById(row.primaryModelId) }}</template>
            </el-table-column>
            <el-table-column label="备用模型" min-width="130">
              <template #default="{ row }">{{ modelNameById(row.fallbackModelId) }}</template>
            </el-table-column>
            <el-table-column label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-switch
                  v-model="row.enabled"
                  size="small"
                  @change="(val) => handleToggleAgent(row, val as boolean)"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleEditAgent(row)">
                  {{ row.source === 'builtin' ? '配置' : '编辑' }}
                </el-button>
                <el-button
                  link
                  type="danger"
                  :disabled="row.source === 'builtin'"
                  @click="handleDeleteAgent(row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
            <template #empty>
              <el-empty description="暂无智能体" :image-size="80" />
            </template>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 厂商新增 / 编辑抽屉 -->
    <ProviderDrawer
      v-model:open="providerDrawerOpen"
      :record="editingProvider"
      :models="modelList"
      @success="handleProviderSuccess"
    />

    <!-- 模型新增 / 编辑弹窗 -->
    <ModelDialog
      v-model:open="modelDialogOpen"
      :record="editingModel"
      :provider-id="currentProviderId || 0"
      @success="handleModelSuccess"
    />

    <!-- 智能体新建 / 编辑抽屉 -->
    <AgentDrawer
      v-model:open="agentDrawerOpen"
      :record="editingAgent"
      :model-options="allModels"
      @success="handleAgentSuccess"
    />
  </div>
</template>

<style lang="scss" scoped>
  .provider-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }

  .header-card,
  .body-card {
    border-radius: 8px;
  }

  .header-card :deep(.el-card__body) {
    padding: 10px 20px;
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .page-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .page-desc {
    margin-top: 4px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  // ===== 主从布局 =====
  .master-detail {
    display: flex;
    gap: 16px;
    align-items: stretch;
    min-height: 520px;
  }

  // 左侧厂商列表，固定宽度 280px
  .master-panel {
    display: flex;
    flex: 0 0 280px;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
  }

  .master-toolbar {
    display: flex;
    gap: 8px;
    padding: 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .master-list {
    flex: 1;
    padding: 8px;
  }

  // 厂商列表项
  .provider-item {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 10px 12px;
    cursor: pointer;
    border-radius: 6px;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    // 选中态高亮
    &.active {
      background-color: var(--el-color-primary-light-9);
    }
  }

  // 状态点：启用绿 / 禁用灰
  .status-dot {
    flex: 0 0 8px;
    width: 8px;
    height: 8px;
    border-radius: 50%;

    &.dot-on {
      background-color: var(--el-color-success);
    }

    &.dot-off {
      background-color: var(--el-text-color-placeholder);
    }
  }

  .provider-name {
    flex: 1;
    overflow: hidden;
    font-size: 14px;
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .model-badge {
    margin-right: 6px;
  }

  // 右侧详情区
  .detail-panel {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    padding: 16px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
  }

  .detail-header {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .detail-title {
    display: flex;
    gap: 10px;
    align-items: center;

    .name {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  .detail-desc {
    margin-bottom: 20px;
  }

  .model-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  // 默认模型星标
  .default-star {
    margin-right: 2px;
    color: var(--el-color-warning);
    vertical-align: middle;
  }

  // ===== 智能体筛选区 =====
  .agent-filter {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    margin-bottom: 16px;
  }

  .filter-item {
    width: 200px;
  }

  .filter-select {
    width: 140px;
  }

  // 新建按钮靠右
  .add-btn {
    margin-left: auto;
  }
</style>
