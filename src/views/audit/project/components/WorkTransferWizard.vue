<template>
  <!-- 成员变更向导：两步分页（选人 → 交接内容） -->
  <el-drawer
    :model-value="visible"
    :title="fromMember?.role ? `${fromMember.role}变更` : '成员变更'"
    size="50%"
    :close-on-click-modal="false"
    @update:model-value="(v) => emit('update:visible', v)"
    @closed="handleClosed"
  >
    <div class="wt-wizard" v-loading="loading">
      <!-- 在途审批提示：有在途审批数据时显示在内容区顶部，两步均可见 -->
      <el-alert
        v-if="workload.approvals.length > 0"
        class="wt-approval-alert"
        :closable="false"
        type="warning"
        show-icon
        title="在途审批数据无法移交，需完成审批后再进行人员变更操作。"
        style="flex-shrink: 0; margin-bottom: 16px"
      />

      <!-- 步骤条 -->
      <el-steps :active="step - 1" finish-status="success" class="wt-steps" simple>
        <el-step title="选择接替人员" />
        <el-step title="维护交接内容" />
      </el-steps>

      <!-- ===== 第一步：选择接替人员 ===== -->
      <div v-if="step === 1" class="wt-step-select">
        <!-- 变更原因（在来源上方填写） -->
        <div class="wt-reason-section">
          <div class="wt-field-label"><span class="wt-required">*</span>变更原因</div>
          <el-input
            v-model="reason"
            type="textarea"
            :rows="2"
            placeholder="请输入变更原因，例如：岗位调动、人员离职、工作调整等"
            maxlength="200"
            show-word-limit
          />
        </div>

        <!-- 来源单选 -->
        <div class="wt-field-row">
          <span class="wt-field-label"><span class="wt-required">*</span>来源</span>
          <el-radio-group v-model="personSource">
            <el-radio value="project">项目组人员</el-radio>
            <el-radio value="auditor">审计人员</el-radio>
          </el-radio-group>
        </div>

        <!-- 项目组人员：单列搜索 + 表格 -->
        <template v-if="personSource === 'project'">
          <div class="wt-search-row">
            <el-input
              v-model="personKeyword"
              placeholder="请输入关键词搜索"
              :prefix-icon="Search"
              clearable
              class="wt-search-input"
            />
          </div>
          <el-table
            :data="filteredPersonList"
            class="wt-person-table"
            highlight-current-row
            @current-change="(row) => (selectedPerson = row)"
          >
            <el-table-column width="50" align="center">
              <template #default="{ row }">
                <el-radio
                  :model-value="selectedPerson?.id"
                  :value="row.id"
                  @change="selectedPerson = row"
                />
              </template>
            </el-table-column>
            <el-table-column label="姓名" prop="name" min-width="140">
              <template #default="{ row }">
                <span>{{ row.name }}</span>
                <el-tag
                  v-if="row.currentRole"
                  size="small"
                  type="info"
                  effect="plain"
                  style="margin-left: 6px"
                >
                  {{ row.currentRole }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="120">
              <template #default="{ row }">
                <span class="wt-status-dot" /><span class="wt-status-text">{{ row.status }}</span>
              </template>
            </el-table-column>
            <el-table-column label="所属单位" prop="unit" min-width="180" show-overflow-tooltip />
          </el-table>
          <div class="wt-pagination">
            <span class="wt-total">共 {{ filteredPersonList.length }} 条数据</span>
            <el-pagination
              v-model:current-page="personPage"
              :page-size="10"
              :total="filteredPersonList.length"
              layout="prev, pager, next"
              background
              small
            />
          </div>
        </template>

        <!-- 审计人员：左机构树 + 右人员表 -->
        <template v-else>
          <div class="wt-auditor-layout">
            <!-- 左：机构树 -->
            <div class="wt-org-panel">
              <div class="wt-org-search-wrap">
                <el-input
                  v-model="orgKeyword"
                  placeholder="请输入机构名称"
                  :prefix-icon="Search"
                  clearable
                />
              </div>
              <el-tree
                :data="orgTree"
                :props="{ label: 'name', children: 'children' }"
                :filter-node-method="filterOrgNode"
                :ref="(el) => (orgTreeRef = el)"
                node-key="id"
                default-expand-all
                highlight-current
                class="wt-org-tree"
                @node-click="handleOrgClick"
              >
                <template #default="{ node, data }">
                  <span class="wt-org-node">
                    <el-icon v-if="data.children?.length"><Folder /></el-icon>
                    {{ node.label }}
                  </span>
                </template>
              </el-tree>
            </div>

            <!-- 右：人员表 -->
            <div class="wt-auditor-right">
              <div class="wt-auditor-search-wrap">
                <el-input
                  v-model="personKeyword"
                  placeholder="请搜索姓名"
                  :prefix-icon="Search"
                  clearable
                  style="width: 200px"
                />
              </div>
              <el-table
                :data="pagedAuditorList"
                class="wt-person-table"
                highlight-current-row
                @current-change="(row) => (selectedPerson = row)"
                @row-click="(row) => (selectedPerson = row)"
              >
                <!-- 单选列，宽30，与项目组人员保持一致 -->
                <el-table-column width="30" align="center">
                  <template #default="{ row }">
                    <el-radio
                      :model-value="selectedPerson?.id"
                      :value="row.id"
                      @change="selectedPerson = row"
                    />
                  </template>
                </el-table-column>
                <!-- 姓名均分 -->
                <el-table-column label="姓名" min-width="100">
                  <template #default="{ row }">
                    <el-button type="primary" link style="padding-left: 10px">{{
                      row.name
                    }}</el-button>
                  </template>
                </el-table-column>
                <el-table-column label="性别" prop="gender" min-width="100" align="center" />
                <el-table-column
                  label="所属单位"
                  prop="unit"
                  min-width="100"
                  show-overflow-tooltip
                />
                <el-table-column label="状态" min-width="100" align="center">
                  <template #default="{ row }">
                    <span
                      :class="['wt-auditor-status', row.status === '审计中' ? 'is-active' : '']"
                    >
                      <span class="wt-dot" />{{ row.status }}
                    </span>
                  </template>
                </el-table-column>
              </el-table>
              <div class="wt-pagination">
                <span class="wt-total">共 {{ filteredAuditorList.length }} 条数据</span>
                <el-pagination
                  v-model:current-page="auditorPage"
                  :page-size="auditorPageSize"
                  :page-sizes="[20, 50]"
                  :total="filteredAuditorList.length"
                  layout="sizes, prev, pager, next"
                  background
                  small
                />
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- ===== 第二步：维护交接内容 ===== -->
      <div v-if="step === 2" class="wt-step-content">
        <!-- 移出成员 + 变更原因 -->
        <div class="wt-header">
          <div class="wt-from">
            移出成员：<span class="wt-from-name">{{ fromMember?.name }}</span>
            <el-tag size="small" type="info" effect="plain" style="margin-left: 8px">{{
              fromMember?.role
            }}</el-tag>
          </div>
          <div class="wt-to">
            接替人员：<span class="wt-from-name">{{ selectedPerson?.name }}</span>
          </div>
        </div>

        <!-- 八 Tab 交接清单 -->
        <el-tabs v-model="activeTab" class="wt-tabs">
          <el-tab-pane :label="`审计事项（${workload.items.length}）`" name="item">
            <work-table
              :rows="workload.items"
              :candidates="candidates"
              @selection-change="(rows) => (selected.item = rows)"
              @assign="onAssign"
            />
          </el-tab-pane>
          <el-tab-pane :label="`审计文书（${workload.documents.length}）`" name="document">
            <work-table
              :rows="workload.documents"
              :candidates="candidates"
              show-code
              @selection-change="(rows) => (selected.document = rows)"
              @assign="onAssign"
            />
          </el-tab-pane>
          <el-tab-pane :label="`迎审清单（${workload.receptions.length}）`" name="reception">
            <el-table :data="workload.receptions" size="default" max-height="380">
              <el-table-column label="序号" width="80" align="center" type="index" />
              <el-table-column label="名称" prop="name" min-width="180" show-overflow-tooltip>
                <template #default="{ row }">
                  <el-link type="primary" :underline="false">{{ row.name }}</el-link>
                </template>
              </el-table-column>
              <el-table-column label="状态" prop="status" width="120" align="center">
                <template #default="{ row }">
                  <span class="reception-status">
                    <span class="reception-status__dot" />{{ row.status }}
                  </span>
                </template>
              </el-table-column>
              <!-- 接收人列：默认回显接替人员，可修改 -->
              <el-table-column label="接收人" width="200">
                <template #default="{ row }: { row: ReceptionItem }">
                  <el-select
                    :model-value="receptionAssignMap[row.id]"
                    placeholder="选择接收人"
                    size="small"
                    style="width: 100%"
                    @change="(v: number) => (receptionAssignMap[row.id] = v)"
                  >
                    <el-option
                      v-for="m in candidates"
                      :key="m.id"
                      :label="`${m.name}（${m.role}）`"
                      :value="m.id"
                    />
                  </el-select>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane :label="`审计疑点（${workload.doubts.length}）`" name="doubt">
            <el-table
              :data="workload.doubts"
              size="default"
              max-height="380"
              :row-class-name="doubtRowClass"
            >
              <!-- 序号列：与审计事项页签保持一致，表头为全选框，行内默认显示序号，hover/已选时切为勾选框 -->
              <el-table-column label="序号" width="80" align="center">
                <template #header>
                  <el-checkbox
                    :model-value="allDoubtsChecked"
                    :indeterminate="isDoubtsIndeterminate"
                    @change="handleDoubtCheckAll"
                  />
                </template>
                <template #default="{ row, $index }">
                  <div class="doubt-seq-cell">
                    <span class="doubt-seq-num">{{ $index + 1 }}</span>
                    <el-checkbox
                      class="doubt-seq-check"
                      :model-value="doubtSelectedIds.includes(row.id)"
                      @change="(val) => handleDoubtCheckRow(row.id, !!val)"
                    />
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="疑点名称" prop="name" min-width="180" show-overflow-tooltip />
              <el-table-column label="疑点数据" prop="dataCount" width="120" align="center" />
              <el-table-column label="核实结果" prop="verifyResult" width="120" align="center" />
              <!-- 接收人列：默认回显接替人员，可修改 -->
              <el-table-column label="接收人" width="200">
                <template #default="{ row }">
                  <el-select
                    :model-value="doubtAssignMap[row.id]"
                    placeholder="选择接收人"
                    size="small"
                    clearable
                    style="width: 170px"
                    @update:model-value="(v) => (doubtAssignMap[row.id] = v)"
                  >
                    <el-option
                      v-for="m in candidates"
                      :key="m.id"
                      :label="`${m.name}（${m.role}）`"
                      :value="m.id"
                    />
                  </el-select>
                </template>
              </el-table-column>
              <template #empty>
                <span class="wt-empty">该成员暂无审计疑点</span>
              </template>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- footer -->
    <template #footer>
      <div class="wt-footer">
        <div class="wt-footer-left"></div>
        <div class="wt-footer-right">
          <el-button @click="emit('update:visible', false)">取消</el-button>
          <el-button v-if="step === 2" @click="step--">上一步</el-button>
          <el-button v-if="step === 1" type="primary" @click="goNext">下一步</el-button>
          <el-button v-if="step === 2" type="primary" :loading="submitting" @click="handleSubmit"
            >确认移交</el-button
          >
        </div>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
  // 成员变更向导：两步分页（选人 → 交接内容）
  import { ref, reactive, computed, watch, provide } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Search, Folder } from '@element-plus/icons-vue'
  import WorkTable from './WorkTable.vue'
  import { getMemberWorkload, submitWorkTransfer } from '@/api/audit-management/work-transfer'
  import type { AuditProjectMember } from '@/types/audit'
  import type {
    MemberWorkload,
    WorkloadItem,
    ReceptionItem,
    DoubtItem,
    WorkCategory,
    WorkTransferItem
  } from '@/types/audit-management/work-transfer'

  const props = defineProps<{
    visible: boolean
    projectId: number
    fromMember: AuditProjectMember | null
    candidates: AuditProjectMember[]
    operatorName: string
  }>()

  const emit = defineEmits<{
    'update:visible': [v: boolean]
    success: []
  }>()

  const loading = ref(false)
  const submitting = ref(false)
  const step = ref<1 | 2>(1)
  const reason = ref('')
  const activeTab = ref<WorkCategory>('item')
  const batchReceiver = ref<number | undefined>()

  // ===== 第一步：选人 =====
  const personSource = ref<'project' | 'auditor'>('project')
  const personKeyword = ref('')
  const personPage = ref(1)
  const selectedPerson = ref<PersonItem | null>(null)

  // 审计人员：机构树相关
  const orgKeyword = ref('')
  const orgTreeRef = ref<any>(null)
  const selectedOrgId = ref<number | null>(null) // null = 全部
  const auditorPage = ref(1)
  const auditorPageSize = ref(20)

  interface OrgNode {
    id: number
    name: string
    children?: OrgNode[]
  }
  interface PersonItem {
    id: number
    name: string
    status: string
    unit: string
    orgId?: number
    gender?: string
    currentRole?: string
  }

  // 机构树数据（mock）
  const orgTree: OrgNode[] = [
    {
      id: 0,
      name: '全部',
      children: [
        {
          id: 1,
          name: '总部审计部',
          children: [
            { id: 11, name: 'ZK审计部' },
            { id: 12, name: 'BS审计部' }
          ]
        }
      ]
    }
  ]

  // 机构树过滤
  watch(orgKeyword, (v) => {
    orgTreeRef.value?.filter(v)
  })
  function filterOrgNode(value: string, data: OrgNode) {
    if (!value) return true
    return data.name.includes(value)
  }
  function handleOrgClick(data: OrgNode) {
    selectedOrgId.value = data.id === 0 ? null : data.id
    auditorPage.value = 1
  }

  // 审计人员列表（mock，含 orgId 关联机构）
  const allAuditorList: PersonItem[] = [
    { id: 101, name: '王-W', gender: '', status: '暂无', unit: '总部审计部', orgId: 1 },
    { id: 102, name: '白-J', gender: '男', status: '暂无', unit: '总部审计部', orgId: 1 },
    { id: 103, name: '蔡-Y', gender: '男', status: '暂无', unit: '总部审计部', orgId: 1 },
    { id: 104, name: '李-S', gender: '男', status: '审计中', unit: 'ZK审计部', orgId: 11 },
    { id: 105, name: '李-SS', gender: '男', status: '暂无', unit: 'ZK审计部', orgId: 11 },
    { id: 106, name: '张-S', gender: '', status: '暂无', unit: 'ZK审计部', orgId: 11 },
    { id: 107, name: '张-SS', gender: '男', status: '暂无', unit: 'ZK审计部', orgId: 11 },
    { id: 108, name: 'zk负责人', gender: '男', status: '审计中', unit: 'BS审计部', orgId: 12 }
  ]

  // 根据机构 + 姓名关键词过滤，orgId=null 表示全部
  const filteredAuditorList = computed<PersonItem[]>(() => {
    let list = allAuditorList
    // 机构筛选：选中子机构时只过滤该机构，选中父机构时包含所有子机构
    if (selectedOrgId.value !== null) {
      const id = selectedOrgId.value
      // 收集该机构及其子孙的所有 id
      const collectIds = (nodes: OrgNode[]): number[] =>
        nodes.flatMap((n) => [n.id, ...collectIds(n.children ?? [])])
      const findNode = (nodes: OrgNode[], target: number): OrgNode | null => {
        for (const n of nodes) {
          if (n.id === target) return n
          const found = findNode(n.children ?? [], target)
          if (found) return found
        }
        return null
      }
      const node = findNode(orgTree, id)
      const ids = node ? collectIds([node]) : [id]
      list = list.filter((p) => p.orgId !== undefined && ids.includes(p.orgId))
    }
    const kw = personKeyword.value.trim().toLowerCase()
    if (kw) list = list.filter((p) => p.name.toLowerCase().includes(kw))
    return list
  })

  const pagedAuditorList = computed<PersonItem[]>(() => {
    const start = (auditorPage.value - 1) * auditorPageSize.value
    return filteredAuditorList.value.slice(start, start + auditorPageSize.value)
  })

  const projectPersonList = computed<PersonItem[]>(() =>
    props.candidates.map((m) => ({
      id: m.id,
      name: m.name,
      status: '审计中',
      unit: m.department || '审计部',
      currentRole: m.role
    }))
  )

  const basePersonList = computed<PersonItem[]>(() => projectPersonList.value)

  const filteredPersonList = computed<PersonItem[]>(() => {
    const kw = personKeyword.value.trim().toLowerCase()
    if (!kw) return basePersonList.value
    return basePersonList.value.filter(
      (p) => p.name.toLowerCase().includes(kw) || p.unit.toLowerCase().includes(kw)
    )
  })

  watch(personSource, () => {
    selectedPerson.value = null
    personKeyword.value = ''
    personPage.value = 1
    orgKeyword.value = ''
    selectedOrgId.value = null
    auditorPage.value = 1
  })

  // ===== 第二步：交接内容 =====
  const workload = reactive<MemberWorkload>({
    items: [],
    documents: [],
    approvals: [],
    receptions: [],
    doubts: []
  })
  const assignMap = reactive<Record<number, number>>({})
  // 迎审清单接收人指派表：receptionId -> toMemberId
  const receptionAssignMap = reactive<Record<number, number>>({})
  // 疑点接收人指派表：doubtId -> toMemberId
  const doubtAssignMap = reactive<Record<number, number>>({})

  // 疑点表格选中状态（序号/勾选合并列）
  const doubtSelectedIds = ref<number[]>([])
  const allDoubtsChecked = computed(
    () => workload.doubts.length > 0 && doubtSelectedIds.value.length === workload.doubts.length
  )
  const isDoubtsIndeterminate = computed(
    () =>
      doubtSelectedIds.value.length > 0 && doubtSelectedIds.value.length < workload.doubts.length
  )
  const doubtRowClass = ({ row }: { row: DoubtItem }) =>
    doubtSelectedIds.value.includes(row.id) ? 'row-checked' : ''
  const handleDoubtCheckAll = (val: boolean | string | number) => {
    doubtSelectedIds.value = val ? workload.doubts.map((d) => d.id) : []
  }
  const handleDoubtCheckRow = (id: number, val: boolean) => {
    if (val) {
      if (!doubtSelectedIds.value.includes(id)) doubtSelectedIds.value.push(id)
    } else {
      doubtSelectedIds.value = doubtSelectedIds.value.filter((i) => i !== id)
    }
  }
  provide('assignMap', assignMap)

  const selected = reactive<Record<WorkCategory, WorkloadItem[]>>({
    item: [],
    document: [],
    approval: []
  })

  // 候选接收人 = 项目成员 + 接替人员（若接替人员不在项目成员中则追加）
  const candidates = computed<AuditProjectMember[]>(() => {
    if (!selectedPerson.value) return props.candidates
    const exists = props.candidates.some((m) => m.id === selectedPerson.value!.id)
    if (exists) return props.candidates
    // 把外部审计人员包装成 AuditProjectMember 追加
    const extra: AuditProjectMember = {
      id: selectedPerson.value.id,
      name: selectedPerson.value.name,
      role: selectedPerson.value.currentRole || ('接替人员' as any),
      department: selectedPerson.value.unit
    }
    return [...props.candidates, extra]
  })

  watch(
    () => props.visible,
    async (v) => {
      if (v && props.fromMember) await loadWorkload()
    }
  )

  async function loadWorkload() {
    if (!props.fromMember) return
    loading.value = true
    try {
      const res = await getMemberWorkload(props.projectId, props.fromMember.id)
      workload.items = res.data.items
      workload.documents = res.data.documents
      workload.approvals = res.data.approvals
      workload.receptions = res.data.receptions || []
      workload.doubts = res.data.doubts || []
      // 预填接收人为接替人员（若已选人且未手动覆盖）
      if (selectedPerson.value) {
        const toId = selectedPerson.value.id
        ;[...workload.items, ...workload.documents].forEach((r) => {
          if (!assignMap[r.refId]) assignMap[r.refId] = toId
        })
        workload.receptions.forEach((r) => {
          if (!receptionAssignMap[r.id]) receptionAssignMap[r.id] = toId
        })
        workload.doubts.forEach((d) => {
          if (!doubtAssignMap[d.id]) doubtAssignMap[d.id] = toId
        })
      }
    } finally {
      loading.value = false
    }
  }

  function onAssign(refId: number, toMemberId: number) {
    assignMap[refId] = toMemberId
  }

  const allRows = computed<WorkloadItem[]>(() => [...workload.items, ...workload.documents])

  function goNext() {
    if (!selectedPerson.value) {
      ElMessage.warning('请选择接替人员')
      return
    }
    // 进入第二步：预填所有工作项接收人为接替人员，可单独修改
    const toId = selectedPerson.value.id
    ;[...workload.items, ...workload.documents].forEach((r) => {
      if (!assignMap[r.refId]) assignMap[r.refId] = toId
    })
    workload.receptions.forEach((r) => {
      if (!receptionAssignMap[r.id]) receptionAssignMap[r.id] = toId
    })
    workload.doubts.forEach((d) => {
      if (!doubtAssignMap[d.id]) doubtAssignMap[d.id] = toId
    })
    step.value = 2
  }

  async function handleSubmit() {
    if (!props.fromMember) return
    if (!reason.value.trim()) {
      ElMessage.warning('请输入变更原因')
      return
    }
    const assignedCount = allRows.value.filter((r) => assignMap[r.refId]).length
    if (assignedCount === 0) {
      ElMessage.warning('请至少为一个工作项指派接收人')
      return
    }
    const items: WorkTransferItem[] = allRows.value
      .filter((r) => assignMap[r.refId])
      .map((r) => ({
        category: r.category,
        refId: r.refId,
        refName: r.refName,
        statusText: r.statusText,
        toMemberId: assignMap[r.refId]
      }))
    // 迎审清单移交项
    const receptionItems: WorkTransferItem[] = workload.receptions
      .filter((r) => receptionAssignMap[r.id])
      .map((r) => ({
        category: 'reception' as const,
        refId: r.id,
        refName: r.name,
        statusText: r.status,
        toMemberId: receptionAssignMap[r.id]
      }))
    // 疑点移交项：有指派接收人的审计疑点一并提交
    const doubtItems: WorkTransferItem[] = workload.doubts
      .filter((d) => doubtAssignMap[d.id])
      .map((d) => ({
        category: 'doubt' as const,
        refId: d.id,
        refName: d.name,
        statusText: d.verifyResult,
        toMemberId: doubtAssignMap[d.id]
      }))
    const memberMap: Record<number, { name: string; role: string }> = {}
    props.candidates.forEach((m) => (memberMap[m.id] = { name: m.name, role: m.role }))
    submitting.value = true
    try {
      await submitWorkTransfer(
        {
          projectId: props.projectId,
          fromMemberId: props.fromMember.id,
          reason: reason.value,
          items: [...items, ...receptionItems, ...doubtItems]
        },
        props.fromMember.name,
        props.fromMember.role,
        props.operatorName,
        memberMap
      )
      ElMessage.success('工作移交成功')
      emit('update:visible', false)
      emit('success')
    } catch (e: any) {
      ElMessage.error(e?.message || '移交失败')
    } finally {
      submitting.value = false
    }
  }

  function handleClosed() {
    step.value = 1
    reason.value = ''
    activeTab.value = 'item'
    batchReceiver.value = undefined
    selectedPerson.value = null
    personSource.value = 'project'
    personKeyword.value = ''
    personPage.value = 1
    Object.keys(assignMap).forEach((k) => delete assignMap[Number(k)])
    Object.keys(receptionAssignMap).forEach((k) => delete receptionAssignMap[Number(k)])
    Object.keys(doubtAssignMap).forEach((k) => delete doubtAssignMap[Number(k)])
    doubtSelectedIds.value = []
    selected.item = []
    selected.document = []
    selected.approval = []
    workload.items = []
    workload.documents = []
    workload.approvals = []
    workload.receptions = []
    workload.doubts = []
  }
</script>

<style scoped lang="scss">
  .wt-wizard {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .wt-steps {
    flex-shrink: 0;
    margin-bottom: 24px;
  }

  /* ===== 第一步：选人 ===== */
  .wt-step-select {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
  }

  .wt-field-row {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-bottom: 16px;
  }

  .wt-field-label {
    flex-shrink: 0;
    font-size: 14px;
    color: #606266;

    .wt-required {
      margin-right: 2px;
      color: var(--el-color-danger);
    }
  }

  .wt-search-row {
    margin-bottom: 12px;

    .wt-search-input {
      width: 280px;
    }
  }

  .wt-person-table {
    flex: 1;
  }

  .wt-status-dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    margin-right: 5px;
    vertical-align: middle;
    background: var(--el-color-primary);
    border-radius: 50%;
  }

  .wt-status-text {
    font-size: 13px;
    color: var(--el-color-primary);
  }

  .wt-pagination {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    padding-top: 12px;

    .wt-total {
      font-size: 13px;
      color: #909399;
    }
  }

  /* 审计人员：左机构 + 右人员 */
  .wt-auditor-layout {
    display: flex;
    flex: 1;
    gap: 0;
    overflow: hidden;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
  }

  .wt-org-panel {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    width: 200px;
    overflow: hidden;
    border-right: 1px solid var(--el-border-color-lighter);

    .wt-org-search-wrap {
      flex-shrink: 0;
      padding: 10px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    .wt-org-tree {
      flex: 1;
      padding: 8px 4px;
      overflow-y: auto;
    }
  }

  .wt-org-node {
    display: flex;
    gap: 4px;
    align-items: center;
    font-size: 13px;
  }

  .wt-auditor-right {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 12px 16px;
    overflow: hidden;

    .wt-auditor-search-wrap {
      flex-shrink: 0;
      margin-bottom: 12px;
    }
  }

  /* 状态标识：暂无=灰，审计中=蓝 */
  .wt-auditor-status {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    font-size: 13px;
    color: #909399;

    &.is-active {
      color: var(--el-color-primary);

      .wt-dot {
        background: var(--el-color-primary);
      }
    }
  }

  .wt-dot {
    display: inline-block;
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    background: #c0c4cc;
    border-radius: 50%;
  }

  /* ===== 第二步：交接内容 ===== */
  .wt-step-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
  }

  .wt-header {
    display: flex;
    gap: 32px;
    align-items: center;
    padding: 10px 16px;
    margin-bottom: 12px;
    font-size: 14px;
    background: var(--el-fill-color-light);
    border-radius: 8px;

    .wt-from-name {
      font-weight: 600;
      color: #303133;
    }
  }

  .wt-reason-section {
    margin-bottom: 12px;

    .wt-field-label {
      margin-bottom: 6px;
      font-size: 14px;
      color: #606266;
    }
  }

  /* 第二步只读回显变更原因 */
  .wt-reason-readonly {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 8px 0;
    font-size: 13px;

    .wt-reason-label {
      flex-shrink: 0;
      color: #909399;
    }

    .wt-reason-text {
      font-weight: 500;
      color: #303133;
    }
  }

  .wt-batch {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;

    .wt-batch-tip {
      font-size: 13px;
      color: #909399;
    }

    .wt-batch-right {
      display: flex;
      gap: 8px;
      align-items: center;

      .wt-batch-label {
        font-size: 13px;
        color: #606266;
      }
    }
  }

  .wt-tabs {
    flex: 1;
  }

  /* 默认接收人提示文案 */
  .wt-default-receiver-tip {
    flex-shrink: 0;
    padding: 8px 0 0;
    font-size: 13px;
    color: var(--el-color-warning);
    text-align: center;
  }

  /* 疑点表格：序号/勾选合并单元格，hover 或已选时切为勾选框 */
  // 迎审清单状态：圆点 + 文字
  .reception-status {
    display: inline-flex;
    gap: 5px;
    align-items: center;

    &__dot {
      display: inline-block;
      flex-shrink: 0;
      width: 6px;
      height: 6px;
      background: var(--el-color-warning);
      border-radius: 50%;
    }
  }

  .doubt-seq-cell {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;

    .doubt-seq-num {
      color: #606266;
    }

    .doubt-seq-check {
      position: absolute;
      display: none;
      height: auto;
    }
  }

  :deep(.el-table__row:hover) .doubt-seq-cell,
  :deep(.el-table__row.row-checked) .doubt-seq-cell {
    .doubt-seq-num {
      display: none;
    }

    .doubt-seq-check {
      display: inline-flex;
    }
  }

  /* footer */
  .wt-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    .wt-footer-left {
      flex: 1;
      margin-right: 16px;

      .footer-alert {
        padding: 6px 12px;

        :deep(.el-alert__title) {
          font-size: 13px;
        }
      }
    }

    .wt-footer-right {
      display: flex;
      flex-shrink: 0;
      gap: 8px;
    }
  }
</style>
