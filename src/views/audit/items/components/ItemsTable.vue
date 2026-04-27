<template>
  <div class="items-table-container">
    <el-table
      :data="tableData"
      row-key="id"
      :tree-props="{ children: 'children' }"
      height="100%"
      style="width: 100%"
    >
      <!-- 拖动手柄列 -->
      <el-table-column width="60" align="center">
        <template #default>
          <span class="drag-handle">☰</span>
        </template>
      </el-table-column>

      <!-- 排序列 -->
      <el-table-column prop="sortNumber" label="排序" width="100" />

      <!-- 审计事项列 -->
      <el-table-column prop="name" label="审计事项" width="300" show-overflow-tooltip />

      <!-- 重点关注与风险点列 -->
      <el-table-column
        prop="riskPoints"
        label="重点关注与风险点"
        min-width="400"
        show-overflow-tooltip
      />

      <!-- 负责人列 -->
      <el-table-column label="负责人" width="200">
        <template #default="{ row }">
          <div class="member-tags">
            <el-tag
              v-for="member in row.assignedMembers"
              :key="member.id"
              closable
              size="small"
              style="margin-right: 8px"
            >
              {{ member.name }}
            </el-tag>
          </div>
        </template>
      </el-table-column>

      <!-- 状态列 -->
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-select v-model="row.status" size="small" style="width: 100%">
            <el-option label="待开始" :value="0" />
            <el-option label="进行中" :value="1" />
            <el-option label="已完成" :value="2" />
          </el-select>
        </template>
      </el-table-column>

      <!-- 开始时间列 -->
      <el-table-column label="开始时间" width="150">
        <template #default="{ row }">
          <el-date-picker
            v-model="row.startTime"
            type="date"
            placeholder="请选择日期"
            size="small"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button link @click="handleEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>

      <!-- 设置列 -->
      <el-table-column width="60" fixed="right" align="center">
        <template #default>
          <el-icon style="font-size: 18px; cursor: pointer"><Setting /></el-icon>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
  import { Setting } from '@element-plus/icons-vue'
  import type { AuditItemExtended } from '@/types/audit'

  defineOptions({
    name: 'ItemsTable'
  })

  interface Props {
    data: AuditItemExtended[]
  }

  const props = defineProps<Props>()

  const tableData = computed(() => props.data)

  const handleEdit = (row: AuditItemExtended) => {
    console.log('编辑', row)
  }

  const handleDelete = (row: AuditItemExtended) => {
    console.log('删除', row)
  }
</script>

<style scoped lang="scss">
  .items-table-container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .drag-handle {
    font-size: 16px;
    color: #909399;
    cursor: move;

    &:hover {
      color: #606266;
    }
  }

  .member-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
</style>
