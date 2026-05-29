<template>
  <PageContainer>
    <div class="process-config-container">
      <!-- 左右分栏布局 -->
      <div class="content-wrapper">
        <!-- 左侧二级导航 -->
        <div class="left-sidebar">
          <div class="nav-section">
            <div
              v-for="item in navList"
              :key="item.key"
              class="nav-item"
              :class="{ active: activeNav === item.key }"
              @click="handleNavClick(item.key)"
            >
              <el-icon class="nav-icon"><Document /></el-icon>
              <span class="nav-title">{{ item.label }}</span>
            </div>
          </div>
        </div>

        <!-- 右侧内容区 -->
        <div class="right-content">
          <!-- 整改流程配置 -->
          <ProcessConfigMain v-if="activeNav === 'process-config'" />

          <!-- 整改角色（占位） -->
          <div v-else-if="activeNav === 'rectification-role'" class="placeholder-content">
            <el-empty description="整改角色配置（开发中）" />
          </div>

          <!-- 业务规则设置（占位） -->
          <div v-else class="placeholder-content">
            <el-empty description="业务规则设置（开发中）" />
          </div>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
  /**
   * 决定节点配置 - 主入口
   * 左侧二级导航（整改角色/整改流程配置/业务规则设置） + 右侧内容
   */
  import { ref } from 'vue'
  import { Document } from '@element-plus/icons-vue'
  import ProcessConfigMain from './components/ProcessConfigMain.vue'

  // 左侧导航列表
  const navList = [
    { key: 'rectification-role', label: '整改角色' },
    { key: 'process-config', label: '整改流程配置' },
    { key: 'business-rule', label: '业务规则设置' }
  ]

  // 默认选中"整改流程配置"
  const activeNav = ref<'rectification-role' | 'process-config' | 'business-rule'>('process-config')

  // 切换导航
  const handleNavClick = (key: string) => {
    activeNav.value = key as typeof activeNav.value
  }
</script>

<style lang="scss" scoped>
  .process-config-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--art-bg-color, #f2f2f6);
  }

  .content-wrapper {
    display: flex;
    flex: 1;
    gap: 16px;
    padding: 16px;
    overflow: hidden;
  }

  /* 左侧二级导航 */
  .left-sidebar {
    width: 200px;
    padding: 8px 0;
    overflow-y: auto;
    background: #fff;
    border-radius: 12px;

    .nav-section {
      .nav-item {
        display: flex;
        gap: 8px;
        align-items: center;
        padding: 12px 16px;
        font-size: 14px;
        font-weight: 500;
        color: #303133;
        cursor: pointer;
        transition: all 0.2s;

        .nav-icon {
          font-size: 16px;
          color: #909399;
        }

        &:hover {
          color: var(--el-color-primary);
          background: #f5f7fa;

          .nav-icon {
            color: var(--el-color-primary);
          }
        }

        &.active {
          color: var(--el-color-primary);
          background: rgb(40 118 255 / 8%);

          .nav-icon {
            color: var(--el-color-primary);
          }
        }
      }
    }
  }

  /* 右侧内容区 */
  .right-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
    background: #fff;
    border-radius: 12px;
  }

  .placeholder-content {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
  }
</style>
