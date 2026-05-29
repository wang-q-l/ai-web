<template>
  <PageContainer>
    <div class="project-detail-container">
      <!-- 顶部标题栏 -->
      <div class="header-bar">
        <el-button link @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <span class="project-title">{{ projectInfo?.projectName }}</span>
        <div class="header-tabs">
          <el-button text>项目信息</el-button>
          <el-button text>项目成员</el-button>
          <el-button text>项目设置</el-button>
        </div>
      </div>

      <!-- 左右分栏布局 -->
      <div class="content-wrapper">
        <!-- 左侧导航 -->
        <div class="left-sidebar">
          <div class="nav-section">
            <div
              class="nav-item"
              :class="{ active: activeNav === 'audit-problem', expanded: auditProblemExpanded }"
              @click="toggleAuditProblem"
            >
              <span class="nav-title">审计问题</span>
              <el-icon class="expand-icon" :class="{ rotated: auditProblemExpanded }">
                <ArrowDown />
              </el-icon>
            </div>
            <transition name="slide-fade">
              <div class="sub-nav" v-show="auditProblemExpanded">
                <div
                  class="sub-nav-item"
                  :class="{
                    active: activeNav === 'audit-problem' && activeSubNav === 'rectification-list'
                  }"
                  @click="handleSubNavClick('audit-problem', 'rectification-list')"
                >
                  <span class="dot"></span>
                  <span>整改清单</span>
                </div>
                <div
                  class="sub-nav-item"
                  :class="{
                    active: activeNav === 'audit-problem' && activeSubNav === 'rectification-plan'
                  }"
                  @click="handleSubNavClick('audit-problem', 'rectification-plan')"
                >
                  <span class="dot"></span>
                  <span>整改方案</span>
                </div>
                <div
                  class="sub-nav-item"
                  :class="{
                    active:
                      activeNav === 'audit-problem' && activeSubNav === 'rectification-progress'
                  }"
                  @click="handleSubNavClick('audit-problem', 'rectification-progress')"
                >
                  <span class="dot"></span>
                  <span>整改进展</span>
                </div>
              </div>
            </transition>
          </div>

          <div class="nav-section">
            <div
              class="nav-item"
              :class="{ active: activeNav === 'audit-decision', expanded: auditDecisionExpanded }"
              @click="toggleAuditDecision"
            >
              <span class="nav-title">审计决定</span>
              <el-icon class="expand-icon" :class="{ rotated: auditDecisionExpanded }">
                <ArrowDown />
              </el-icon>
            </div>
            <transition name="slide-fade">
              <div class="sub-nav" v-show="auditDecisionExpanded">
                <div
                  class="sub-nav-item"
                  :class="{
                    active: activeNav === 'audit-decision' && activeSubNav === 'decision-list'
                  }"
                  @click="handleSubNavClick('audit-decision', 'decision-list')"
                >
                  <span class="dot"></span>
                  <span>决定清单</span>
                </div>
              </div>
            </transition>
          </div>

          <div class="nav-section">
            <div
              class="nav-item"
              :class="{ active: activeNav === 'audit-transfer', expanded: auditTransferExpanded }"
              @click="toggleAuditTransfer"
            >
              <span class="nav-title">审计移送</span>
              <el-icon class="expand-icon" :class="{ rotated: auditTransferExpanded }">
                <ArrowDown />
              </el-icon>
            </div>
            <transition name="slide-fade">
              <div class="sub-nav" v-show="auditTransferExpanded">
                <div
                  class="sub-nav-item"
                  :class="{
                    active: activeNav === 'audit-transfer' && activeSubNav === 'transfer-list'
                  }"
                  @click="handleSubNavClick('audit-transfer', 'transfer-list')"
                >
                  <span class="dot"></span>
                  <span>移送清单</span>
                </div>
              </div>
            </transition>
          </div>
        </div>

        <!-- 右侧内容区 -->
        <div class="right-content">
          <!-- 决定清单 -->
          <DecisionList v-if="activeNav === 'audit-decision'" :project-id="projectId" />

          <!-- 移送清单 -->
          <TransferList v-else-if="activeNav === 'audit-transfer'" :project-id="projectId" />

          <!-- 其他导航项的占位内容 -->
          <div v-else class="placeholder-content">
            <el-empty description="功能开发中" />
          </div>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
  /**
   * 整改项目详情页面
   * 左右分栏布局：左侧导航菜单，右侧内容区域
   */
  import { ref, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { ArrowLeft, ArrowDown } from '@element-plus/icons-vue'
  import type { RectificationProject } from '@/types/audit-decision'
  import { getRectificationProjectDetail } from '@/api/audit-decision'
  import DecisionList from './components/DecisionList.vue'
  import TransferList from './components/TransferList.vue'

  const router = useRouter()
  const route = useRoute()

  // 项目ID
  const projectId = ref(Number(route.params.id))

  // 项目信息
  const projectInfo = ref<RectificationProject | null>(null)

  // 当前激活的导航项
  const activeNav = ref('audit-decision')
  const activeSubNav = ref('decision-list')

  // 导航展开状态（默认全展开）
  const auditProblemExpanded = ref(true)
  const auditDecisionExpanded = ref(true)
  const auditTransferExpanded = ref(true)

  // 切换审计问题展开状态
  const toggleAuditProblem = () => {
    auditProblemExpanded.value = !auditProblemExpanded.value
    if (auditProblemExpanded.value) {
      activeNav.value = 'audit-problem'
      activeSubNav.value = 'rectification-list'
    }
  }

  // 切换审计决定展开状态
  const toggleAuditDecision = () => {
    auditDecisionExpanded.value = !auditDecisionExpanded.value
    if (auditDecisionExpanded.value) {
      activeNav.value = 'audit-decision'
      activeSubNav.value = 'decision-list'
    }
  }

  // 切换审计移送展开状态
  const toggleAuditTransfer = () => {
    auditTransferExpanded.value = !auditTransferExpanded.value
    if (auditTransferExpanded.value) {
      activeNav.value = 'audit-transfer'
      activeSubNav.value = 'transfer-list'
    }
  }

  // 处理子导航点击
  const handleSubNavClick = (nav: string, subNav: string) => {
    activeNav.value = nav
    activeSubNav.value = subNav
  }

  // 获取项目详情
  const fetchProjectDetail = async () => {
    try {
      const res = await getRectificationProjectDetail(projectId.value)
      projectInfo.value = res.data
    } catch {
      ElMessage.error('获取项目详情失败')
    }
  }

  // 返回列表
  const handleBack = () => {
    router.push('/audit-decision')
  }

  // 初始化
  onMounted(() => {
    fetchProjectDetail()
  })
</script>

<style scoped lang="scss">
  .project-detail-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #f5f7fa;
  }

  .header-bar {
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 16px 24px;
    background: #fff;
    border-bottom: 1px solid #e4e7ed;

    .project-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .header-tabs {
      display: flex;
      gap: 8px;
      margin-left: auto;
    }
  }

  .content-wrapper {
    display: flex;
    flex: 1;
    gap: 16px;
    padding: 16px;
    overflow: hidden;
  }

  .left-sidebar {
    width: 200px;
    padding: 8px 0;
    overflow-y: auto;
    background: #fff;
    border-radius: 12px;

    .nav-section {
      margin-bottom: 4px;

      &:last-child {
        margin-bottom: 0;
      }

      .nav-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        font-size: 14px;
        font-weight: 500;
        color: #303133;
        cursor: pointer;
        transition: all 0.2s;

        .nav-title {
          flex: 1;
        }

        .expand-icon {
          font-size: 14px;
          color: #909399;
          transition: transform 0.3s;

          &.rotated {
            transform: rotate(180deg);
          }
        }

        &:hover {
          color: #409eff;
          background: #f5f7fa;

          .expand-icon {
            color: #409eff;
          }
        }

        &.active {
          color: #409eff;
          background: #ecf5ff;

          .expand-icon {
            color: #409eff;
          }
        }
      }

      .sub-nav {
        padding-left: 0;

        .sub-nav-item {
          position: relative;
          display: flex;
          align-items: center;
          padding: 10px 16px 10px 32px;
          font-size: 14px;
          color: #606266;
          cursor: pointer;
          transition: all 0.2s;

          .dot {
            width: 6px;
            height: 6px;
            margin-right: 8px;
            background: #909399;
            border-radius: 50%;
            transition: all 0.2s;
          }

          &:hover {
            color: #409eff;
            background: #f5f7fa;

            .dot {
              background: #409eff;
            }
          }

          &.active {
            font-weight: 500;
            color: #409eff;
            background: #ecf5ff;

            .dot {
              background: #409eff;
            }
          }
        }
      }
    }
  }

  /* 展开/收起动画 */
  .slide-fade-enter-active {
    transition: all 0.3s ease;
  }

  .slide-fade-leave-active {
    transition: all 0.3s ease;
  }

  .slide-fade-enter-from {
    opacity: 0;
    transform: translateY(-10px);
  }

  .slide-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }

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
