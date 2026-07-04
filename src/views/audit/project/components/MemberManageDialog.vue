<template>
  <!-- 人员管理弹窗：按角色行展示项目成员，每行提供「变更」操作，纯权限位保留直接选择 -->
  <el-dialog
    :model-value="visible"
    title="人员管理"
    width="760px"
    :close-on-click-modal="false"
    @update:model-value="(v) => emit('update:visible', v)"
  >
    <div class="mm-content">
      <!-- 顶部说明 + 记录入口 -->
      <div class="mm-toolbar">
        <span class="mm-section-title">项目成员</span>
        <el-button link type="primary" @click="emit('open-records')">人员变更记录</el-button>
      </div>

      <!-- 项目成员（含工作归属，通过变更发起工作移交） -->
      <el-table :data="memberRows" border class="mm-table">
        <el-table-column label="角色" prop="role" width="120" />
        <el-table-column label="成员">
          <template #default="{ row }">
            <el-tag size="small" effect="plain" class="mm-member-tag">
              {{ row.name }}
              <span v-if="row.department" class="mm-dept">（{{ row.department }}）</span>
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button class="btn-change-member" link type="primary" @click="emit('change', row)">
              变更
            </el-button>
            <el-button
              v-if="row.role !== '组长' && row.role !== '主审'"
              link
              type="primary"
              @click="handleAdd(row)"
              >添加</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 单位默认收件人（纯权限位，保留直接选择） -->
      <div class="mm-toolbar mm-mt">
        <span class="mm-section-title">单位默认收件人</span>
      </div>
      <el-table :data="recipientRows" border class="mm-table">
        <el-table-column label="单位" prop="unit" width="120" />
        <el-table-column label="收件人">
          <template #default="{ row }">
            <el-tag v-if="row.name" size="small" effect="plain" class="mm-member-tag">
              {{ row.name }}
            </el-tag>
            <span v-else class="mm-empty">未设置</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template #default>
            <el-button link type="primary">选择</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <template #footer>
      <el-button @click="emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="emit('update:visible', false)">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  // 人员管理弹窗：变更触发工作移交向导；纯权限位（收件人）保留直接选择
  import { computed } from 'vue'
  import type { AuditProjectMember } from '@/types/audit'

  const props = defineProps<{
    visible: boolean
    projectId: number
    /** 项目成员 */
    members: AuditProjectMember[]
  }>()

  const emit = defineEmits<{
    'update:visible': [v: boolean]
    /** 发起变更（打开工作移交向导） */
    change: [member: AuditProjectMember]
    /** 添加同角色成员 */
    add: [member: AuditProjectMember]
    /** 打开变更记录 */
    'open-records': []
  }>()

  const memberRows = computed(() => props.members)

  // 单位默认收件人（示例占位，纯权限位）
  const recipientRows = computed(() => [{ unit: 'ZY股份', name: '单位经办人员（ZY股份）' }])

  // 添加同角色成员
  const handleAdd = (row: AuditProjectMember) => {
    emit('add', row)
  }
</script>

<style scoped lang="scss">
  .mm-content {
    display: flex;
    flex-direction: column;
  }

  .mm-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;

    // 小节标题左侧蓝色竖条，与截图一致
    .mm-section-title {
      position: relative;
      padding-left: 10px;
      font-size: 14px;
      font-weight: 600;
      color: #303133;

      &::before {
        position: absolute;
        top: 2px;
        left: 0;
        width: 3px;
        height: 14px;
        content: '';
        background: var(--el-color-primary);
        border-radius: 2px;
      }
    }
  }

  .mm-mt {
    margin-top: 20px;
  }

  .mm-table {
    width: 100%;

    .mm-member-tag {
      .mm-dept {
        color: #909399;
      }
    }

    .mm-empty {
      font-size: 13px;
      color: #c0c4cc;
    }
  }
</style>
