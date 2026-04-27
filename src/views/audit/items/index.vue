<template>
  <div class="audit-items-page">
    <!-- 筛选卡片 -->
    <el-card class="filter-card">
      <el-form :model="queryParams">
        <div class="filter-form-content">
          <el-form-item>
            <el-input
              v-model="queryParams.name"
              placeholder="审计事项"
              clearable
              style="width: 250px"
            />
          </el-form-item>

          <el-form-item>
            <el-select
              v-model="queryParams.memberId"
              placeholder="负责人"
              clearable
              style="width: 200px"
            >
              <el-option
                v-for="member in members"
                :key="member.id"
                :label="member.name"
                :value="member.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          </el-form-item>

          <el-form-item>
            <el-checkbox v-model="queryParams.onlyMine">只看我负责</el-checkbox>
          </el-form-item>

          <el-form-item>
            <el-button @click="handleSelectItems">选择事项</el-button>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleAdd">新增</el-button>
          </el-form-item>

          <el-form-item>
            <el-button :type="activeTab === 'table' ? 'primary' : ''" @click="activeTab = 'table'">
              列表
            </el-button>
          </el-form-item>

          <el-form-item>
            <el-button :type="activeTab === 'gantt' ? 'primary' : ''" @click="activeTab = 'gantt'">
              甘特图
            </el-button>
          </el-form-item>
        </div>
      </el-form>
    </el-card>

    <!-- 内容卡片 -->
    <el-card class="content-card" v-loading="loading">
      <div class="content-wrapper">
        <!-- 列表视图 -->
        <ItemsTable v-if="activeTab === 'table'" :data="itemsData" />

        <!-- 甘特图视图 -->
        <ItemsGantt v-if="activeTab === 'gantt'" :data="itemsData" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { Search } from '@element-plus/icons-vue'
  import ItemsTable from './components/ItemsTable.vue'
  import ItemsGantt from './components/ItemsGantt.vue'
  import { getAuditItems, getAuditMembers } from '@/api/auditItems'
  import type { AuditItemExtended, AuditItemParams, AuditProjectMember } from '@/types/audit'

  defineOptions({
    name: 'AuditItems'
  })

  // 查询参数
  const queryParams = ref<AuditItemParams>({
    name: '',
    memberId: null,
    onlyMine: false,
    page: 1,
    pageSize: 1000
  })

  // 当前激活的标签页
  const activeTab = ref<'table' | 'gantt'>('table')

  // 加载状态
  const loading = ref(false)

  // 审计事项数据
  const itemsData = ref<AuditItemExtended[]>([])

  // 负责人列表
  const members = ref<AuditProjectMember[]>([])

  // 获取审计事项列表
  const fetchItems = async () => {
    loading.value = true
    try {
      const res = await getAuditItems(queryParams.value)
      if (res.code === 200) {
        itemsData.value = res.data.list
      }
    } catch (error) {
      console.error('获取审计事项失败', error)
    } finally {
      loading.value = false
    }
  }

  // 获取负责人列表
  const fetchMembers = async () => {
    try {
      const res = await getAuditMembers()
      if (res.code === 200) {
        members.value = res.data
      }
    } catch (error) {
      console.error('获取负责人列表失败', error)
    }
  }

  // 搜索
  const handleSearch = () => {
    queryParams.value.page = 1
    fetchItems()
  }

  // 选择事项
  const handleSelectItems = () => {
    console.log('选择事项')
  }

  // 新增
  const handleAdd = () => {
    console.log('新增')
  }

  onMounted(() => {
    fetchItems()
    fetchMembers()
  })
</script>

<style scoped lang="scss">
  .audit-items-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
  }

  .filter-card {
    flex-shrink: 0;
    border: none !important;
    border-radius: 12px;
    box-shadow: none !important;

    :deep(.el-card__body) {
      padding: 12px 20px;
    }

    .filter-form-content {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;

      :deep(.el-form-item) {
        margin-bottom: 0;
      }
    }
  }

  .content-card {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
    border: none !important;
    border-radius: 12px;
    box-shadow: none !important;

    :deep(.el-card__body) {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 20px;
    }

    .content-wrapper {
      flex: 1;
      overflow: hidden;
    }
  }
</style>
