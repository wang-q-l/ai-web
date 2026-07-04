<!-- 框架二顶部Header组件 -->
<template>
  <div class="art-top-header">
    <div class="header-container">
      <!-- 左侧：系统Logo和标题 -->
      <div class="header-left">
        <div class="top-header" @click="toHome">
          <!-- 九宫格应用图标块（对齐截图最左侧白色方点） -->
          <div class="app-grid-icon">
            <span v-for="n in 4" :key="n"></span>
          </div>
          <span class="title-divider"></span>
          <p>{{ AppConfig.systemInfo.name }}</p>
        </div>

        <!-- 水平菜单（框架二） -->
        <ArtHorizontalMenu
          v-if="isTopMenu"
          :list="menuList"
          class="framework-two-horizontal-menu"
        />

        <!-- 混合菜单（框架二） -->
        <ArtMixedMenu v-if="isTopLeftMenu" :list="menuList" class="framework-two-mixed-menu" />
      </div>

      <!-- 右侧：工具栏（按截图复刻：待办中心 / 消息 / 传输 / 机构下拉 / 用户） -->
      <div class="header-right">
        <!-- 待办中心（带未读角标） -->
        <div class="entry-item" @click="toHome">
          <ElBadge :value="22" :max="99" class="entry-badge">
            <i class="iconfont-sys">&#xe6e9;</i>
          </ElBadge>
          <span class="entry-text">待办中心</span>
        </div>

        <!-- 消息 -->
        <div class="entry-item" @click="toHome">
          <i class="iconfont-sys">&#xe6c3;</i>
          <span class="entry-text">消息</span>
        </div>

        <!-- 传输 -->
        <div class="entry-item" @click="toHome">
          <i class="iconfont-sys">&#xe70d;</i>
          <span class="entry-text">传输</span>
        </div>

        <!-- 机构 / 主体下拉切换 -->
        <div class="org-select">
          <ElDropdown trigger="click" popper-class="org-dropdown-popper">
            <div class="org-select-inner">
              <span class="org-name">{{ currentOrg }}</span>
              <i class="iconfont-sys arrow">&#xe625;</i>
            </div>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem v-for="org in orgOptions" :key="org" @click="currentOrg = org">
                  {{ org }}
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </div>

        <!-- 用户头像、姓名、菜单 -->
        <div class="user">
          <ElPopover
            ref="userMenuPopover"
            placement="bottom-end"
            :width="240"
            :hide-after="0"
            :offset="10"
            trigger="hover"
            :show-arrow="false"
            popper-class="user-menu-popover"
          >
            <template #reference>
              <div class="user-inner">
                <img class="cover" src="@imgs/user/avatar.webp" alt="avatar" />
                <span class="user-name">{{ userInfo.username || '王-W' }}</span>
              </div>
            </template>
            <template #default>
              <div class="user-menu-box">
                <div class="user-head">
                  <img class="cover" src="@imgs/user/avatar.webp" style="float: left" />
                  <div class="user-wrap">
                    <span class="name">{{ userInfo.username }}</span>
                    <span class="email">{{ userInfo.email }}</span>
                  </div>
                </div>
                <ul class="user-menu">
                  <li @click="lockScreen()">
                    <i class="menu-icon iconfont-sys">&#xe817;</i>
                    <span class="menu-txt">{{ $t('topBar.user.lockScreen') }}</span>
                  </li>
                  <div class="line"></div>
                  <div class="logout-btn" @click="loginOut">{{ $t('topBar.user.logout') }}</div>
                </ul>
              </div>
            </template>
          </ElPopover>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  /* eslint-disable @typescript-eslint/no-unused-vars */
  import { ref, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'
  import { storeToRefs } from 'pinia'
  import { ElMessageBox } from 'element-plus'
  import { useFullscreen } from '@vueuse/core'
  import { LanguageEnum, MenuTypeEnum } from '@/enums/appEnum'
  import { useSettingStore } from '@/store/modules/setting'
  import { useUserStore } from '@/store/modules/user'
  import { useMenuStore } from '@/store/modules/menu'
  import AppConfig from '@/config'
  import { languageOptions } from '@/locales'
  import { WEB_LINKS } from '@/utils/constants'
  import { mittBus } from '@/utils/sys'
  import { themeAnimation } from '@/utils/theme/animation'
  import { useHeaderBar } from '@/composables/useHeaderBar'

  // 检测操作系统
  const isWindows = navigator.userAgent.includes('Windows')

  // 初始化
  const router = useRouter()
  const { locale, t } = useI18n()
  const settingStore = useSettingStore()
  const userStore = useUserStore()
  const menuStore = useMenuStore()

  // 功能配置
  const {
    shouldShowGlobalSearch,
    shouldShowFullscreen,
    shouldShowNotification,
    shouldShowChat,
    shouldShowLanguage,
    shouldShowSettings,
    shouldShowThemeToggle
  } = useHeaderBar()

  // Store 状态
  const { systemThemeColor, showSettingGuide, isDark, menuType } = storeToRefs(settingStore)
  const { language, getUserInfo: userInfo } = storeToRefs(userStore)
  const { menuList } = storeToRefs(menuStore)

  // 菜单类型判断
  const isTopMenu = computed(() => menuType.value === MenuTypeEnum.TOP)
  const isTopLeftMenu = computed(() => menuType.value === MenuTypeEnum.TOP_LEFT)

  // 本地状态
  const showNotice = ref(false)
  const userMenuPopover = ref()

  // 机构 / 审计主体切换（静态展示，无真实业务接口）
  const orgOptions = ['ZY股份——总部审计部', 'ZK科技——审计部', '马尾造船厂——审计部']
  const currentOrg = ref(orgOptions[0])

  // 全屏相关
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()
  const toggleFullScreen = (): void => {
    toggleFullscreen()
  }

  // 通知相关
  const visibleNotice = (): void => {
    showNotice.value = !showNotice.value
  }

  // 聊天相关
  const openChat = (): void => {
    mittBus.emit('openChat')
  }

  // 语言切换
  const changeLanguage = (lang: LanguageEnum): void => {
    if (locale.value === lang) return
    locale.value = lang
    userStore.setLanguage(lang)
    // 刷新页面
    setTimeout(() => {
      window.location.reload()
    }, 50)
  }

  // 设置面板
  const openSetting = (): void => {
    mittBus.emit('openSetting')
    if (showSettingGuide.value) {
      settingStore.hideSettingGuide()
    }
  }

  // 搜索对话框
  const openSearchDialog = (): void => {
    mittBus.emit('openSearchDialog')
  }

  // 锁屏
  const lockScreen = (): void => {
    mittBus.emit('openLockScreen')
  }

  // 关闭用户菜单
  const closeUserMenu = (): void => {
    if (userMenuPopover.value) {
      userMenuPopover.value.hide()
    }
  }

  // 登出
  const loginOut = (): void => {
    closeUserMenu()
    setTimeout(() => {
      ElMessageBox.confirm(t('common.logOutTips'), t('common.tips'), {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        customClass: 'login-out-dialog'
      }).then(() => {
        userStore.logOut()
      })
    }, 200)
  }

  // 文档和GitHub
  const toDocs = (): void => {
    window.open(WEB_LINKS.DOCS)
  }

  const toGithub = (): void => {
    window.open(WEB_LINKS.GITHUB)
  }

  // 跳转首页
  const toHome = (): void => {
    router.push('/')
  }
</script>

<style scoped lang="scss">
  .art-top-header {
    width: 100%;
    height: 60px;
    // 蓝色渐变 + 淡科技线条纹理（纯 CSS，无需图片资源）
    background-color: var(--el-color-primary);
    background-image:
      // 右侧淡色电路/线条纹理

      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='60' viewBox='0 0 400 60'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.08' stroke-width='1'%3E%3Cpath d='M0 15 H120 L140 30 H260 M300 8 H400 M180 50 H400 M60 45 H160 L180 30'/%3E%3Ccircle cx='140' cy='30' r='3'/%3E%3Ccircle cx='180' cy='30' r='3'/%3E%3Ccircle cx='300' cy='8' r='2.5'/%3E%3C/g%3E%3C/svg%3E"),
      linear-gradient(90deg, #1677ff 0%, #2b7fff 55%, #3b8cff 100%);
    background-repeat: no-repeat, no-repeat;
    background-position:
      right center,
      center;
    background-size:
      auto 100%,
      100% 100%;
    box-shadow: 0 2px 8px rgb(0 0 0 / 10%);

    .header-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      padding: 0 20px;
    }

    .header-left {
      display: flex;
      flex: 1;
      align-items: center;
      min-width: 0;
      overflow: hidden;

      .top-header {
        display: flex;
        flex-shrink: 0;
        gap: 10px;
        align-items: center;
        cursor: pointer;
        transition: opacity 0.3s;

        &:hover {
          opacity: 0.85;
        }

        // 九宫格应用图标块（2x2 白色圆点）
        .app-grid-icon {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 3px;
          width: 22px;
          height: 22px;

          span {
            display: block;
            width: 100%;
            height: 100%;
            background: #fff;
            border-radius: 2px;
          }
        }

        // Logo 与标题之间的竖线分隔
        .title-divider {
          width: 1px;
          height: 22px;
          background: rgb(255 255 255 / 35%);
        }

        p {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #fff;
          letter-spacing: 1px;
          white-space: nowrap;
        }
      }

      .framework-two-horizontal-menu {
        flex: 1;
        max-width: calc(100% - 200px); // 限制最大宽度，为右侧工具栏留出空间
        margin-left: 20px;
        overflow: hidden;

        // 通过 CSS 变量覆盖水平菜单的颜色
        --el-menu-text-color: rgb(255 255 255 / 85%);
        --el-menu-hover-text-color: #fff;
        --el-menu-active-color: #fff;
        --el-menu-hover-bg-color: rgb(255 255 255 / 10%);

        :deep(.el-menu) {
          background-color: transparent !important;
          border: none !important;
        }

        :deep(.el-menu-item) {
          color: rgb(255 255 255 / 85%) !important;
          border-bottom: 2px solid transparent !important;

          &:hover {
            color: #fff !important;
            background-color: transparent !important;
          }

          &.is-active {
            color: #fff !important;
            background-color: rgb(255 255 255 / 15%) !important;
            border-bottom-color: transparent !important;
          }
        }

        :deep(.el-sub-menu__title) {
          padding: 0 30px 0 10px !important;
          color: rgb(255 255 255 / 85%) !important;
          border: 0 !important;
          border-bottom: 2px solid transparent !important;

          &:hover {
            color: #fff !important;
            background-color: transparent !important;
          }
        }

        :deep(.el-sub-menu.is-active .el-sub-menu__title) {
          color: #fff !important;
          background-color: rgb(255 255 255 / 15%) !important;
          border-bottom-color: transparent !important;
        }

        :deep(.el-icon) {
          color: rgb(255 255 255 / 85%) !important;
        }
      }

      .framework-two-mixed-menu {
        flex: 1;
        margin-left: 20px;
        overflow: hidden;

        // 通过 CSS 变量覆盖混合菜单的颜色
        --main-color: #fff;
        --main-bg-color: rgb(255 255 255 / 15%);
        --art-text-gray-600: rgb(255 255 255 / 85%);
        --art-text-gray-700: rgb(255 255 255 / 85%);
        --art-text-gray-900: #fff;
        --art-gray-200-rgb: 255, 255, 255;

        :deep(.mixed-top-menu) {
          .scroll-bar {
            .item {
              color: rgb(255 255 255 / 85%) !important;

              i {
                color: rgb(255 255 255 / 85%) !important;
              }

              &:hover {
                color: #fff !important;
                background-color: transparent !important;
              }

              &.active {
                position: relative;
                color: #fff !important;
                background-color: transparent !important;

                // 激活态：底部白色下划线指示条（对齐截图）
                &::after {
                  position: absolute !important;
                  right: 10px !important;
                  bottom: -2px !important;
                  left: 10px !important;
                  height: 3px !important;
                  content: '' !important;
                  background-color: #fff !important;
                  border-radius: 2px 2px 0 0 !important;
                }
              }
            }
          }

          .scroll-btn {
            color: rgb(255 255 255 / 85%) !important;

            &:hover {
              color: #fff !important;
              background-color: rgb(255 255 255 / 10%) !important;
            }
          }
        }
      }
    }

    .header-right {
      display: flex;
      flex-shrink: 0;
      gap: 4px;
      align-items: center;

      // 待办中心 / 消息 / 传输 入口按钮
      .entry-item {
        display: flex;
        gap: 6px;
        align-items: center;
        height: 36px;
        padding: 0 10px;
        color: rgb(255 255 255 / 92%);
        cursor: pointer;
        border-radius: 6px;
        transition: background 0.3s;

        &:hover {
          background: rgb(255 255 255 / 15%);
        }

        i {
          font-size: 18px;
          color: #fff;
        }

        .entry-text {
          font-size: 14px;
          white-space: nowrap;
        }

        // 角标定位在图标右上角
        .entry-badge {
          line-height: 1;

          :deep(.el-badge__content) {
            border: none;
          }
        }
      }

      // 机构 / 审计主体下拉
      .org-select {
        margin: 0 4px 0 8px;

        .org-select-inner {
          display: flex;
          gap: 6px;
          align-items: center;
          max-width: 200px;
          height: 32px;
          padding: 0 10px;
          cursor: pointer;
          background: rgb(255 255 255 / 15%);
          border: 1px solid rgb(255 255 255 / 25%);
          border-radius: 4px;
          transition: background 0.3s;

          &:hover {
            background: rgb(255 255 255 / 25%);
          }

          .org-name {
            overflow: hidden;
            font-size: 13px;
            color: #fff;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .arrow {
            font-size: 12px;
            color: rgb(255 255 255 / 85%);
          }
        }
      }

      .user {
        display: flex;
        align-items: center;
        margin-left: 4px;
        cursor: pointer;

        .user-inner {
          display: flex;
          gap: 8px;
          align-items: center;
          height: 40px;
          padding: 0 8px;
          border-radius: 6px;
          transition: background 0.3s;

          &:hover {
            background: rgb(255 255 255 / 15%);
          }
        }

        .cover {
          width: 32px;
          height: 32px;
          object-fit: cover;
          border: 2px solid rgb(255 255 255 / 40%);
          border-radius: 50%;
          transition: all 0.3s;
        }

        .user-name {
          max-width: 80px;
          overflow: hidden;
          font-size: 14px;
          color: #fff;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }

  .dark {
    .art-top-header {
      background-color: #1a1a1a;

      .framework-two-horizontal-menu {
        :deep(.el-menu-item) {
          color: rgb(255 255 255 / 85%) !important;

          &:hover {
            color: #fff !important;
            background-color: rgb(255 255 255 / 10%) !important;
          }

          &.is-active {
            color: #fff !important;
            border-bottom-color: #fff !important;
          }
        }

        :deep(.el-sub-menu__title) {
          color: rgb(255 255 255 / 85%) !important;

          &:hover {
            color: #fff !important;
            background-color: rgb(255 255 255 / 10%) !important;
          }
        }

        :deep(.el-sub-menu.is-active .el-sub-menu__title) {
          color: #fff !important;
          border-bottom-color: #fff !important;
        }
      }

      .framework-two-mixed-menu {
        :deep(.mixed-top-menu) {
          .scroll-bar {
            .item {
              color: rgb(255 255 255 / 85%) !important;

              i {
                color: rgb(255 255 255 / 85%) !important;
              }

              &:hover {
                color: #fff !important;
                background-color: rgb(255 255 255 / 10%) !important;
              }

              &.active {
                position: relative;
                color: #fff !important;
                background-color: transparent !important;

                &::after {
                  position: absolute !important;
                  right: 10px !important;
                  bottom: -2px !important;
                  left: 10px !important;
                  height: 3px !important;
                  content: '' !important;
                  background-color: #fff !important;
                  border-radius: 2px 2px 0 0 !important;
                }
              }
            }
          }

          .scroll-btn {
            color: rgb(255 255 255 / 85%) !important;

            &:hover {
              color: #fff !important;
              background-color: rgb(255 255 255 / 10%) !important;
            }
          }
        }
      }
    }
  }
</style>

<style lang="scss">
  @use '@styles/variables.scss' as *;

  .user-menu-popover {
    padding: 0 !important;

    .user-menu-box {
      padding: 10px 16px 0;

      .user-head {
        display: flex;
        align-items: center;
        padding: 0 0 4px;

        .cover {
          width: 40px;
          height: 40px;
          margin: 0 10px 0 0;
          overflow: hidden;
          background: #eee;
          border-radius: 50%;
        }

        .user-wrap {
          width: calc(100% - 60px);
          height: 100%;

          span {
            display: block;
          }

          .name {
            font-size: 14px;
            font-weight: 500;
            color: var(--art-gray-800);

            @include ellipsis();
          }

          .email {
            margin-top: 3px;
            font-size: 12px;
            color: var(--art-gray-500);

            @include ellipsis();
          }
        }
      }

      .user-menu {
        padding: 16px 0;
        margin-top: 10px;
        border-top: 1px solid var(--art-border-color);

        li {
          display: flex;
          align-items: center;
          padding: 8px;
          margin-bottom: 10px;
          cursor: pointer;
          user-select: none;
          border-radius: 6px;

          &:last-of-type {
            margin-bottom: 0;
          }

          i {
            display: block;
            width: 25px;
            font-size: 16px;
            color: var(--art-text-gray-800);
          }

          span {
            font-size: 14px;
            color: var(--art-text-gray-800);
          }

          &:hover {
            background-color: rgb(var(--art-gray-200-rgb), 0.7);
          }
        }

        .line {
          width: 100%;
          height: 1px;
          margin: 10px 0;
          background-color: var(--art-border-color);
        }

        .logout-btn {
          box-sizing: border-box;
          width: 100%;
          padding: 7px 0;
          margin-top: 20px;
          font-size: 13px;
          color: var(--art-text-gray-800);
          text-align: center;
          cursor: pointer;
          border: 1px solid var(--art-border-dashed-color);
          border-radius: 7px;
          transition: all 0.2s;

          &:hover {
            box-shadow: 0 0 10px rgb(var(--art-gray-300-rgb), 0.7);
          }
        }
      }
    }
  }

  // 框架二混合菜单白色样式（非 scoped，使用最高优先级强制覆盖）
  .art-top-header .header-left .framework-two-mixed-menu {
    // 覆盖 CSS 变量
    --main-color: #fff;
    --main-bg-color: rgb(255 255 255 / 15%);
    --art-text-gray-600: rgb(255 255 255 / 85%);
    --art-text-gray-700: rgb(255 255 255 / 85%);
    --art-text-gray-900: #fff;
    --art-gray-200-rgb: 255, 255, 255;
  }

  // 强制覆盖所有混合菜单元素的颜色
  .art-top-header .header-left .framework-two-mixed-menu .mixed-top-menu .scroll-bar .item {
    color: rgb(255 255 255 / 85%) !important;
  }

  .art-top-header .header-left .framework-two-mixed-menu .mixed-top-menu .scroll-bar .item i {
    color: rgb(255 255 255 / 85%) !important;
  }

  .art-top-header .header-left .framework-two-mixed-menu .mixed-top-menu .scroll-bar .item span {
    color: rgb(255 255 255 / 85%) !important;
  }

  .art-top-header .header-left .framework-two-mixed-menu .mixed-top-menu .scroll-bar .item:hover {
    color: #fff !important;
    background-color: rgb(255 255 255 / 10%) !important;
  }

  .art-top-header .header-left .framework-two-mixed-menu .mixed-top-menu .scroll-bar .item:hover i {
    color: #fff !important;
  }

  .art-top-header
    .header-left
    .framework-two-mixed-menu
    .mixed-top-menu
    .scroll-bar
    .item:hover
    span {
    color: #fff !important;
  }

  .art-top-header .header-left .framework-two-mixed-menu .mixed-top-menu .scroll-bar .item.active {
    position: relative;
    color: #fff !important;
    background-color: transparent !important;
  }

  .art-top-header
    .header-left
    .framework-two-mixed-menu
    .mixed-top-menu
    .scroll-bar
    .item.active
    i {
    color: #fff !important;
  }

  .art-top-header
    .header-left
    .framework-two-mixed-menu
    .mixed-top-menu
    .scroll-bar
    .item.active
    span {
    color: #fff !important;
  }

  .art-top-header
    .header-left
    .framework-two-mixed-menu
    .mixed-top-menu
    .scroll-bar
    .item.active::after {
    position: absolute !important;
    right: 10px !important;
    bottom: -2px !important;
    left: 10px !important;
    height: 3px !important;
    content: '' !important;
    background-color: #fff !important;
    border-radius: 2px 2px 0 0 !important;
  }

  .art-top-header .header-left .framework-two-mixed-menu .mixed-top-menu .scroll-btn {
    color: rgb(255 255 255 / 85%) !important;
  }

  .art-top-header .header-left .framework-two-mixed-menu .mixed-top-menu .scroll-btn:hover {
    color: #fff !important;
    background-color: rgb(255 255 255 / 10%) !important;
  }

  // 暗黑模式
  .dark .art-top-header .header-left .framework-two-mixed-menu {
    --main-color: #fff;
    --main-bg-color: rgb(255 255 255 / 15%);
    --art-text-gray-600: rgb(255 255 255 / 85%);
    --art-text-gray-700: rgb(255 255 255 / 85%);
    --art-text-gray-900: #fff;
    --art-gray-200-rgb: 255, 255, 255;
  }

  .dark .art-top-header .header-left .framework-two-mixed-menu .mixed-top-menu .scroll-bar .item {
    color: rgb(255 255 255 / 85%) !important;
  }

  .dark .art-top-header .header-left .framework-two-mixed-menu .mixed-top-menu .scroll-bar .item i {
    color: rgb(255 255 255 / 85%) !important;
  }

  .dark
    .art-top-header
    .header-left
    .framework-two-mixed-menu
    .mixed-top-menu
    .scroll-bar
    .item
    span {
    color: rgb(255 255 255 / 85%) !important;
  }

  .dark
    .art-top-header
    .header-left
    .framework-two-mixed-menu
    .mixed-top-menu
    .scroll-bar
    .item:hover {
    color: #fff !important;
    background-color: rgb(255 255 255 / 10%) !important;
  }

  .dark
    .art-top-header
    .header-left
    .framework-two-mixed-menu
    .mixed-top-menu
    .scroll-bar
    .item:hover
    i {
    color: #fff !important;
  }

  .dark
    .art-top-header
    .header-left
    .framework-two-mixed-menu
    .mixed-top-menu
    .scroll-bar
    .item:hover
    span {
    color: #fff !important;
  }

  .dark
    .art-top-header
    .header-left
    .framework-two-mixed-menu
    .mixed-top-menu
    .scroll-bar
    .item.active {
    position: relative;
    color: #fff !important;
    background-color: transparent !important;
  }

  .dark
    .art-top-header
    .header-left
    .framework-two-mixed-menu
    .mixed-top-menu
    .scroll-bar
    .item.active
    i {
    color: #fff !important;
  }

  .dark
    .art-top-header
    .header-left
    .framework-two-mixed-menu
    .mixed-top-menu
    .scroll-bar
    .item.active
    span {
    color: #fff !important;
  }

  .dark
    .art-top-header
    .header-left
    .framework-two-mixed-menu
    .mixed-top-menu
    .scroll-bar
    .item.active::after {
    position: absolute !important;
    right: 10px !important;
    bottom: -2px !important;
    left: 10px !important;
    height: 3px !important;
    content: '' !important;
    background-color: #fff !important;
    border-radius: 2px 2px 0 0 !important;
  }

  .dark .art-top-header .header-left .framework-two-mixed-menu .mixed-top-menu .scroll-btn {
    color: rgb(255 255 255 / 85%) !important;
  }

  .dark .art-top-header .header-left .framework-two-mixed-menu .mixed-top-menu .scroll-btn:hover {
    color: #fff !important;
    background-color: rgb(255 255 255 / 10%) !important;
  }
</style>
