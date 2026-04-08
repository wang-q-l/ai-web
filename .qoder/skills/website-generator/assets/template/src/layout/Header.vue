<template>
  <header class="site-header">
    <div class="container">
      <div class="header-content">
        <div class="logo">
          <router-link to="/">
            <img :src="siteConfig.logo" :alt="siteConfig.name" />
            <span>{{ siteConfig.name }}</span>
          </router-link>
        </div>

        <nav class="nav-menu">
          <el-menu
            :default-active="activeMenu"
            mode="horizontal"
            :ellipsis="false"
            @select="handleMenuSelect"
          >
            <el-menu-item
              v-for="item in menuConfig"
              :key="item.id"
              :index="item.path"
            >
              <el-icon v-if="item.icon">
                <component :is="item.icon" />
              </el-icon>
              <span>{{ item.label }}</span>
            </el-menu-item>
          </el-menu>
        </nav>

        <div class="header-actions">
          <el-button
            v-if="!isLoggedIn"
            type="primary"
            @click="handleLogin"
          >
            登录
          </el-button>
          <el-dropdown v-else @command="handleUserCommand">
            <span class="user-info">
              <el-avatar :size="32" :src="userInfo.avatar" />
              <span class="username">{{ userInfo.name }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="orders">我的订单</el-dropdown-item>
                <el-dropdown-item command="favorites">我的收藏</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { menuConfig } from '@/config/menu'
import { siteConfig } from '@/config/site'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isLoggedIn = computed(() => userStore.isLoggedIn)
const userInfo = computed(() => userStore.userInfo)

const activeMenu = computed(() => route.path)

const handleMenuSelect = (path: string) => {
  router.push(path)
}

const handleLogin = () => {
  router.push('/login')
}

const handleUserCommand = (command: string) => {
  if (command === 'logout') {
    userStore.logout()
    router.push('/')
  } else {
    router.push(`/user/${command}`)
  }
}
</script>

<style scoped>
.site-header {
  height: var(--header-height);
  background-color: var(--bg-color);
  box-shadow: var(--box-shadow-base);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.logo a {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 20px;
  font-weight: bold;
  color: var(--primary-color);
}

.logo img {
  height: 40px;
}

.nav-menu {
  flex: 1;
  display: flex;
  justify-content: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
}

.username {
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }
}
</style>
