<!--
  页面名称：Login - 登录页面

  功能描述：
    用户登录页面，简洁现代的卡片式设计
    支持手机号 + 密码登录

  路由信息：
    路径：/login
    名称：Login
    是否缓存：否
-->

<template>
  <div class="login-page">
    <!-- 顶部装饰区域 -->
    <div class="login-header">
      <div class="header-icon">📱</div>
      <h1 class="app-title">移动端应用</h1>
      <p class="app-subtitle">欢迎回来，请登录您的账号</p>
    </div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <van-form @submit="onSubmit">
        <!-- 手机号输入 -->
        <div class="form-item">
          <div class="input-wrapper">
            <van-icon name="phone-o" class="input-icon" />
            <van-field
              v-model="formData.phone"
              name="phone"
              type="tel"
              placeholder="请输入手机号"
              :border="false"
              :rules="[
                { required: true, message: '请输入手机号' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
              ]"
            />
          </div>
        </div>

        <!-- 密码输入 -->
        <div class="form-item">
          <div class="input-wrapper">
            <van-icon name="lock" class="input-icon" />
            <van-field
              v-model="formData.password"
              type="password"
              name="password"
              placeholder="请输入密码"
              :border="false"
              :rules="[{ required: true, message: '请输入密码' }]"
            />
          </div>
        </div>

        <!-- 功能选项 -->
        <div class="form-options">
          <van-checkbox v-model="formData.rememberMe" icon-size="16px">
            记住密码
          </van-checkbox>
          <span class="forgot-link" @click="goToForgotPassword">忘记密码？</span>
        </div>

        <!-- 登录按钮 -->
        <van-button
          round
          block
          type="primary"
          native-type="submit"
          :loading="loading"
          class="login-btn"
        >
          登录
        </van-button>
      </van-form>

      <!-- 快捷登录 -->
      <div class="quick-login">
        <div class="divider">
          <span>其他登录方式</span>
        </div>
        <div class="social-login">
          <div class="social-item" @click="showToast('功能开发中')">
            <van-icon name="wechat" size="24" color="#07c160" />
          </div>
          <div class="social-item" @click="showToast('功能开发中')">
            <van-icon name="alipay" size="24" color="#1677ff" />
          </div>
        </div>
      </div>
    </div>

    <!-- 底部提示 -->
    <div class="login-footer">
      <p class="footer-text">
        登录即表示同意
        <span class="link" @click="showAgreement">《用户协议》</span>
        和
        <span class="link" @click="showPrivacy">《隐私政策》</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

// 路由实例
const router = useRouter()

// 表单数据
const formData = reactive({
  phone: '', // 手机号
  password: '', // 密码
  rememberMe: false // 记住密码
})

// 加载状态
const loading = ref(false)

/**
 * 处理表单提交
 * @param {Object} values - 表单数据
 */
const onSubmit = async (values) => {
  loading.value = true

  try {
    // 模拟登录请求
    await new Promise(resolve => setTimeout(resolve, 1000))
    showToast('登录成功')
    router.push('/')
  } catch (error) {
    showToast('登录失败，请重试')
  } finally {
    loading.value = false
  }
}

/**
 * 显示用户服务协议
 */
const showAgreement = () => {
  showToast('功能开发中')
}

/**
 * 显示隐私政策
 */
const showPrivacy = () => {
  showToast('功能开发中')
}

/**
 * 跳转到忘记密码页面
 */
const goToForgotPassword = () => {
  showToast('功能开发中')
}
</script>

<style scoped>
/* 页面容器 - 固定高度不滚动 */
.login-page {
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #1171F8 0%, #00C7FF 100%);
  display: flex;
  flex-direction: column;
  padding: 20px var(--spacing-lg) 16px;
}

/* 顶部区域 */
.login-header {
  text-align: center;
  padding: 20px 0 16px;
  flex-shrink: 0;
}

.header-icon {
  font-size: 48px;
  margin-bottom: 12px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.app-title {
  font-size: 24px;
  font-weight: bold;
  color: #ffffff;
  margin: 0 0 6px 0;
}

.app-subtitle {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

/* 登录卡片 */
.login-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

/* 表单项 */
.form-item {
  margin-bottom: 16px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #f7f8fa;
  border-radius: 12px;
  padding: 0 16px;
  transition: all 0.3s;
}

.input-wrapper:focus-within {
  background: #f0f2f5;
  box-shadow: 0 0 0 2px rgba(17, 113, 248, 0.2);
}

.input-icon {
  color: #969799;
  margin-right: 12px;
  font-size: 20px;
}

.input-wrapper :deep(.van-cell) {
  background: transparent;
  padding: 12px 0;
}

.input-wrapper :deep(.van-field__control) {
  font-size: 15px;
}

.input-wrapper :deep(.van-field__control::placeholder) {
  color: #c8c9cc;
}

/* 功能选项 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 14px;
}

.form-options :deep(.van-checkbox__label) {
  color: #646566;
  font-size: 14px;
}

.forgot-link {
  color: #1171F8;
  cursor: pointer;
  font-weight: 500;
}

.forgot-link:active {
  opacity: 0.7;
}

/* 登录按钮 */
.login-btn {
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(135deg, #1171F8 0%, #00C7FF 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(17, 113, 248, 0.4);
}

.login-btn:active {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(17, 113, 248, 0.4);
}

/* 快捷登录 */
.quick-login {
  margin-top: 20px;
}

.divider {
  text-align: center;
  position: relative;
  margin-bottom: 16px;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 30%;
  height: 1px;
  background: #ebedf0;
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.divider span {
  font-size: 12px;
  color: #969799;
  background: #ffffff;
  padding: 0 12px;
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.social-item {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #f7f8fa;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.social-item:active {
  transform: scale(0.95);
  background: #ebedf0;
}

/* 底部提示 */
.login-footer {
  margin-top: auto;
  padding-top: 16px;
  padding-bottom: 8px;
  flex-shrink: 0;
}

.footer-text {
  text-align: center;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.5;
}

.footer-text .link {
  color: #ffffff;
  text-decoration: underline;
  cursor: pointer;
}

.footer-text .link:active {
  opacity: 0.7;
}
</style>
