<template>
  <div class="profile-page">
    <div class="profile-header">
      <van-image
        round
        width="80"
        height="80"
        src="https://via.placeholder.com/80"
      />
      <div class="user-info">
        <h3>用户名</h3>
        <p>这是个人简介</p>
      </div>
    </div>

    <van-cell-group inset style="margin-top: 20px">
      <van-cell title="我的订单" is-link icon="orders-o" />
      <van-cell title="我的收藏" is-link icon="star-o" />
      <van-cell title="收货地址" is-link icon="location-o" />
      <van-cell title="优惠券" is-link icon="coupon-o" />
    </van-cell-group>

    <van-cell-group inset style="margin-top: 20px">
      <van-cell title="暗黑模式" icon="moon-o">
        <template #right-icon>
          <van-switch v-model="isDark" size="24" @change="toggleTheme" />
        </template>
      </van-cell>
      <van-cell title="设置" is-link icon="setting-o" />
    </van-cell-group>

    <div class="logout-btn">
      <van-button round block type="danger" @click="onLogout">
        退出登录
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import { useTheme } from '@/composables/useTheme'

const router = useRouter()
const { theme, toggleTheme: toggle } = useTheme()
const isDark = ref(theme.value === 'dark')

const toggleTheme = () => {
  toggle()
}

const onLogout = () => {
  showConfirmDialog({
    title: '提示',
    message: '确定要退出登录吗？',
  })
    .then(() => {
      showToast('已退出登录')
      router.push('/login')
    })
    .catch(() => {
      // 取消
    })
}
</script>

<style scoped>
.profile-page {
  background-color: var(--background-color);
  min-height: 100vh;
  padding-bottom: 20px;
}

.profile-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, #667eea 100%);
  padding: 40px 20px;
  display: flex;
  align-items: center;
  color: #fff;
}

.user-info {
  margin-left: 20px;
}

.user-info h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
}

.user-info p {
  margin: 0;
  opacity: 0.8;
  font-size: 14px;
}

.logout-btn {
  padding: 20px;
}
</style>
