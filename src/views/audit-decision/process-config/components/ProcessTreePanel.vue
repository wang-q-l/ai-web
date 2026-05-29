<template>
  <div class="tree-panel">
    <el-tree
      ref="treeRef"
      :data="tree"
      node-key="id"
      :default-expand-all="true"
      :expand-on-click-node="false"
      :highlight-current="true"
      :current-node-key="selectedId ?? undefined"
      @node-click="handleNodeClick"
    >
      <template #default="{ data }">
        <div class="tree-node-row" :class="{ 'is-stage': data.isStage }">
          <div class="node-label">
            <el-icon class="node-icon">
              <FolderOpened v-if="data.isStage" />
              <Document v-else />
            </el-icon>
            <el-icon class="drag-icon"><Rank /></el-icon>
            <span class="node-name">{{ data.name }}</span>
          </div>
          <el-dropdown
            trigger="click"
            placement="bottom-end"
            @command="(cmd: string) => handleCommand(cmd, data)"
            @click.stop
          >
            <el-icon class="more-icon"><MoreFilled /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-if="data.isStage" command="add">添加节点</el-dropdown-item>
                <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </template>
    </el-tree>
  </div>
</template>

<script setup lang="ts">
  /**
   * 流程方案树形面板
   * 展示阶段及节点，支持选中、添加子节点、删除
   */
  import { ref, watch, nextTick } from 'vue'
  import { FolderOpened, Document, MoreFilled, Rank } from '@element-plus/icons-vue'
  import type { ProcessNode } from '@/types/process-config'

  interface Props {
    tree: ProcessNode[]
    selectedId: number | null
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    select: [id: number]
    'add-child': [parentId: number]
    delete: [id: number]
  }>()

  const treeRef = ref()

  // 节点点击：仅非阶段节点触发选中（阶段也允许选中以便查看，但表单端会显示提示）
  const handleNodeClick = (data: ProcessNode) => {
    emit('select', data.id)
  }

  // 操作菜单命令处理
  const handleCommand = (cmd: string, data: ProcessNode) => {
    if (cmd === 'add') emit('add-child', data.id)
    if (cmd === 'delete') emit('delete', data.id)
  }

  // 选中态联动到 el-tree
  watch(
    () => props.selectedId,
    async (id) => {
      await nextTick()
      if (id !== null && treeRef.value) {
        treeRef.value.setCurrentKey(id)
      }
    },
    { immediate: true }
  )
</script>

<style lang="scss" scoped>
  .tree-panel {
    width: 280px;
    min-width: 280px;
    padding: 12px 8px;
    overflow-y: auto;
    border-right: 1px solid #eaebf1;
  }

  /* 节点行样式 */
  .tree-node-row {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: space-between;
    padding: 4px 8px;
    border-radius: 6px;

    .node-label {
      display: flex;
      flex: 1;
      gap: 6px;
      align-items: center;
      min-width: 0;

      .node-icon {
        font-size: 14px;
        color: #909399;
      }

      .drag-icon {
        font-size: 14px;
        color: #c0c4cc;
        cursor: move;
      }

      .node-name {
        overflow: hidden;
        font-size: 14px;
        color: #303133;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .more-icon {
      padding: 2px;
      font-size: 16px;
      color: #909399;
      cursor: pointer;
      border-radius: 4px;

      &:hover {
        color: var(--el-color-primary);
        background: #ecf5ff;
      }
    }
  }

  /* 选中节点高亮（覆盖 el-tree 默认） */
  :deep(.el-tree-node__content) {
    height: 36px;
    padding-right: 0 !important;
    border-radius: 6px;

    &:hover {
      background: #f5f7fa;
    }
  }

  :deep(.el-tree-node.is-current > .el-tree-node__content) {
    background: rgb(40 118 255 / 8%) !important;

    .node-name {
      font-weight: 500;
      color: var(--el-color-primary);
    }

    .node-icon {
      color: var(--el-color-primary);
    }
  }
</style>
