<template>
  <!-- 审计工作台静态页：顶部「项目统计」页签（7 状态卡片）+ 下方「待办事项」面板 -->
  <div class="audit-home">
    <!-- 页签切换：项目统计 / 待办事项 -->
    <div class="home-tabs">
      <span
        v-for="tab in tabs"
        :key="tab.key"
        class="home-tab"
        :class="{ 'is-active': activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </span>
    </div>

    <!-- 项目统计页签：7 种状态统计卡片 -->
    <section v-show="activeTab === 'stat'" class="stat-section">
      <div
        v-for="item in statusStats"
        :key="item.key"
        class="stat-card"
        :class="`stat-card--${item.theme}`"
      >
        <div class="stat-card__icon">
          <el-icon><component :is="item.icon" /></el-icon>
        </div>
        <div class="stat-card__body">
          <p class="stat-card__value">{{ item.count }}</p>
          <p class="stat-card__label">{{ item.label }}</p>
        </div>
      </div>
    </section>

    <!-- 待办事项面板 -->
    <section class="todo-panel">
      <div class="panel-title">
        <span class="panel-title__bar"></span>
        待办事项
      </div>
      <div class="todo-list">
        <div v-for="todo in todoList" :key="todo.id" class="todo-row">
          <span class="todo-row__name">
            <el-icon class="todo-row__arrow"><ArrowRight /></el-icon>
            {{ todo.name }}
            <em v-if="todo.badge" class="todo-row__badge">{{ todo.badge }}</em>
          </span>
          <span class="todo-row__text">{{ todo.text }}</span>
          <span class="todo-row__time">{{ todo.time }}</span>
        </div>
        <el-empty v-if="!todoList.length" description="暂无待办" :image-size="100" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  // 页面说明：审计工作台静态页，含项目状态统计卡片与待办事项列表，纯静态 mock
  import { ref } from 'vue'
  import {
    ArrowRight,
    Clock,
    Document,
    Loading,
    EditPen,
    Tools,
    Folder,
    Minus
  } from '@element-plus/icons-vue'

  defineOptions({ name: 'AuditHome' })

  // 页签配置
  const tabs = [
    { key: 'stat', label: '项目统计' },
    { key: 'todo', label: '待办事项' }
  ] as const
  const activeTab = ref<'stat' | 'todo'>('stat')

  // ==================== 项目状态统计卡片（静态 mock）====================
  // 7 种状态：待启动 / 准备阶段 / 实施阶段 / 报告阶段 / 整改阶段 / 已归档 / 已调减
  const statusStats = [
    { key: 'pending', label: '待启动', count: 12, icon: Clock, theme: 'gray' },
    { key: 'preparing', label: '准备阶段', count: 8, icon: Document, theme: 'blue' },
    { key: 'executing', label: '实施阶段', count: 15, icon: Loading, theme: 'cyan' },
    { key: 'reporting', label: '报告阶段', count: 6, icon: EditPen, theme: 'orange' },
    { key: 'rectifying', label: '整改阶段', count: 9, icon: Tools, theme: 'purple' },
    { key: 'archived', label: '已归档', count: 124, icon: Folder, theme: 'green' },
    { key: 'reduced', label: '已调减', count: 3, icon: Minus, theme: 'red' }
  ]

  // ==================== 待办事项列表（静态 mock）====================
  const todoList = [
    {
      id: 1,
      name: '作业审批',
      badge: '5',
      text: '出具审计报告 - XX项目建设有效审计',
      time: '2026-06-24 13:46'
    },
    {
      id: 2,
      name: '方案审核',
      badge: '2',
      text: '财务收支审计实施方案待审核',
      time: '2026-06-24 10:18'
    },
    {
      id: 3,
      name: '底稿复核',
      badge: '',
      text: '专项资金审计工作底稿待复核',
      time: '2026-06-23 16:30'
    }
  ]
</script>

<style scoped lang="scss">
  .audit-home {
    box-sizing: border-box;
    min-height: 100%;
    padding: 20px 24px;
    background: var(--el-bg-color);
  }

  // ===== 页签 =====
  .home-tabs {
    display: flex;
    gap: 28px;
    margin-bottom: 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .home-tab {
    position: relative;
    padding-bottom: 12px;
    font-size: 16px;
    font-weight: 600;
    color: #606266;
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: var(--el-color-primary);
    }

    // 选中态：主色文字 + 底部下划线
    &.is-active {
      color: var(--el-color-primary);

      &::after {
        position: absolute;
        right: 0;
        bottom: -1px;
        left: 0;
        height: 2px;
        content: '';
        background: var(--el-color-primary);
        border-radius: 2px;
      }
    }
  }

  // ===== 项目统计卡片区 =====
  .stat-section {
    display: grid;
    // 7 张卡片自适应换行，最小宽度保证内容不挤
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
    margin-bottom: 28px;
  }

  .stat-card {
    display: flex;
    gap: 14px;
    align-items: center;
    padding: 18px 20px;
    background: #fff;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 12px;
    transition: all 0.2s ease;

    &:hover {
      box-shadow: 0 6px 18px rgb(0 0 0 / 8%);
      transform: translateY(-2px);
    }

    &__icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      font-size: 24px;
      color: #fff;
      border-radius: 12px;
    }

    &__value {
      margin: 0;
      font-size: 26px;
      font-weight: 700;
      line-height: 1.1;
      color: #303133;
    }

    &__label {
      margin: 4px 0 0;
      font-size: 13px;
      color: #909399;
    }

    // —— 7 种状态主题色（图标底色 + 左侧细边）——
    &--gray {
      border-left: 3px solid #909399;

      .stat-card__icon {
        background: linear-gradient(135deg, #b0b4bd, #8a8e99);
      }
    }

    &--blue {
      border-left: 3px solid #409eff;

      .stat-card__icon {
        background: linear-gradient(135deg, #66b1ff, #2d8cf0);
      }
    }

    &--cyan {
      border-left: 3px solid #17c0c0;

      .stat-card__icon {
        background: linear-gradient(135deg, #4dd0d0, #0fa8a8);
      }
    }

    &--orange {
      border-left: 3px solid #e6a23c;

      .stat-card__icon {
        background: linear-gradient(135deg, #f0b860, #d98e1e);
      }
    }

    &--purple {
      border-left: 3px solid #8e6fde;

      .stat-card__icon {
        background: linear-gradient(135deg, #a98ee8, #7654cf);
      }
    }

    &--green {
      border-left: 3px solid #67c23a;

      .stat-card__icon {
        background: linear-gradient(135deg, #87d65f, #52a82a);
      }
    }

    &--red {
      border-left: 3px solid #f56c6c;

      .stat-card__icon {
        background: linear-gradient(135deg, #f88e8e, #e84c4c);
      }
    }
  }

  // ===== 待办事项面板 =====
  .panel-title {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 14px;
    font-size: 16px;
    font-weight: 600;
    color: #303133;

    &__bar {
      width: 4px;
      height: 16px;
      background: var(--el-color-primary);
      border-radius: 2px;
    }
  }

  .todo-row {
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 14px 16px;
    margin-bottom: 10px;
    background: var(--el-fill-color-light);
    border-radius: 8px;
    transition: background 0.2s ease;

    &:hover {
      background: var(--el-color-primary-light-9);
    }

    &__name {
      display: flex;
      flex-shrink: 0;
      gap: 4px;
      align-items: center;
      width: 130px;
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }

    &__arrow {
      font-size: 12px;
      color: var(--el-color-primary);
    }

    // 数字角标：主色小圆点
    &__badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      font-size: 12px;
      font-style: normal;
      color: #fff;
      background: var(--el-color-danger);
      border-radius: 9px;
    }

    &__text {
      flex: 1;
      overflow: hidden;
      font-size: 14px;
      color: #606266;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__time {
      flex-shrink: 0;
      font-size: 13px;
      color: #909399;
    }
  }
</style>
