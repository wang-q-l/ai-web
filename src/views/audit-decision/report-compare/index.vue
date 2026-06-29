<template>
  <!-- 统计报表比对 - 基准台账列表页：筛选 + 生成 + 列表（比对/删除） -->
  <PageContainer>
    <div class="ledger-list-container">
      <!-- 筛选区 -->
      <div class="filter-section">
        <el-form :model="query" inline>
          <el-form-item label="台账名称">
            <el-input
              v-model="query.name"
              placeholder="请输入名称关键字"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="报表类型">
            <el-select v-model="query.auditType" placeholder="全部" clearable style="width: 200px">
              <el-option
                v-for="opt in auditTypeOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="项目年度">
            <el-select
              v-model="query.projectYear"
              placeholder="全部"
              clearable
              style="width: 120px"
            >
              <el-option v-for="y in yearOptions" :key="y" :label="y" :value="y" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 操作栏 -->
      <div class="action-bar">
        <el-button type="primary" @click="generateVisible = true">
          <el-icon><Plus /></el-icon>
          生成报表
        </el-button>
      </div>

      <!-- 台账列表 -->
      <div class="table-section">
        <el-table :data="tableData" v-loading="loading" height="100%">
          <el-table-column type="index" label="序号" width="70" align="center" />
          <el-table-column prop="name" label="名称" min-width="240" show-overflow-tooltip>
            <template #default="{ row }">
              <el-button link type="primary" @click="handleView(row)">{{ row.name }}</el-button>
            </template>
          </el-table-column>
          <el-table-column
            prop="reportType"
            label="报表类型"
            min-width="180"
            show-overflow-tooltip
          />
          <el-table-column prop="projectYear" label="项目年度" width="210" align="center" />
          <el-table-column prop="createTime" label="创建时间" min-width="200" />
          <el-table-column label="操作" width="160" fixed="right" align="center">
            <template #default="{ row }">
              <!-- 已比对显示「比对结果」，未比对显示「比对」 -->
              <el-button v-if="row.comparison" link type="success" @click="handleResult(row)">
                比对结果
              </el-button>
              <el-button v-else link type="primary" @click="handleCompare(row)">比对</el-button>
              <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>

      <!-- 生成基准台账弹窗 -->
      <GenerateLedgerDialog
        v-model="generateVisible"
        :audit-type-options="auditTypeOptions"
        @success="handleQuery"
      />

      <!-- 报表查看抽屉（点名称打开，只读） -->
      <ReportViewDrawer v-model="viewVisible" :ledger="viewLedger" />
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
  /**
   * 统计报表比对 - 基准台账列表页
   * 列出已生成的基准台账（同年度可多次生成），支持筛选、生成、比对（跳转）、删除
   */
  import { ref, reactive, onMounted, onActivated } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Search, Refresh, Plus } from '@element-plus/icons-vue'
  import type { AuditTypeOption, BaselineLedger, LedgerQuery } from '@/types/report-compare'
  import { getAuditTypeOptions, getLedgerList, deleteLedger } from '@/api/report-compare'
  import GenerateLedgerDialog from './components/GenerateLedgerDialog.vue'
  import ReportViewDrawer from './components/ReportViewDrawer.vue'

  const router = useRouter()

  // 审计类型选项
  const auditTypeOptions = ref<AuditTypeOption[]>([])

  // 年度选项（近 6 年）
  const yearOptions = Array.from({ length: 6 }, (_, i) => String(new Date().getFullYear() - i))

  // 查询参数
  const query = reactive<LedgerQuery>({
    name: '',
    auditType: '',
    projectYear: '',
    page: 1,
    pageSize: 10
  })

  // 列表数据
  const tableData = ref<BaselineLedger[]>([])
  const total = ref(0)
  const loading = ref(false)

  // 生成弹窗显隐
  const generateVisible = ref(false)

  // 报表查看抽屉
  const viewVisible = ref(false)
  const viewLedger = ref<BaselineLedger | null>(null)

  // 获取审计类型选项
  const fetchAuditTypes = async () => {
    try {
      const res = await getAuditTypeOptions()
      auditTypeOptions.value = res.data || []
    } catch {
      ElMessage.error('获取审计类型失败')
    }
  }

  // 获取台账列表
  const fetchData = async () => {
    loading.value = true
    try {
      const res = await getLedgerList(query)
      tableData.value = res.data?.list || []
      total.value = res.data?.total || 0
    } catch {
      ElMessage.error('获取台账列表失败')
    } finally {
      loading.value = false
    }
  }

  // 查询
  const handleQuery = () => {
    query.page = 1
    fetchData()
  }

  // 重置
  const handleReset = () => {
    query.name = ''
    query.auditType = ''
    query.projectYear = ''
    query.page = 1
    fetchData()
  }

  // 比对：跳转独立比对页（可上传比对）
  const handleCompare = (row: BaselineLedger) => {
    router.push({ path: '/audit-decision/report-compare/detail', query: { id: row.id } })
  }

  // 比对结果：跳转比对页直接查看已有结果
  const handleResult = (row: BaselineLedger) => {
    router.push({
      path: '/audit-decision/report-compare/detail',
      query: { id: row.id, mode: 'result' }
    })
  }

  // 查看：点名称打开只读抽屉（仅看报表，无操作按钮）
  const handleView = (row: BaselineLedger) => {
    viewLedger.value = row
    viewVisible.value = true
  }

  // 删除台账
  const handleDelete = async (row: BaselineLedger) => {
    await ElMessageBox.confirm(`确定删除台账「${row.name}」吗？`, '提示', { type: 'warning' })
    try {
      await deleteLedger(row.id)
      ElMessage.success('删除成功')
      fetchData()
    } catch {
      ElMessage.error('删除失败')
    }
  }

  // 初始化
  onMounted(() => {
    fetchAuditTypes()
    fetchData()
  })

  // keepAlive 返回时刷新
  onActivated(() => {
    fetchData()
  })
</script>

<style scoped lang="scss">
  .ledger-list-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 16px;
    background: #fff;
    border-radius: 12px;
  }

  .filter-section {
    margin-bottom: 12px;

    :deep(.el-form-item) {
      margin-bottom: 8px;
    }
  }

  .action-bar {
    margin-bottom: 12px;
  }

  .table-section {
    flex: 1;
    overflow: hidden;
  }

  .pagination-section {
    display: flex;
    justify-content: flex-end;
    padding-top: 16px;
  }
</style>
