<template>
  <div class="login-container">
    <div class="login-card">
      <!-- 左侧品牌区域 -->
      <div class="login-left">
        <div class="brand-content">
          <div class="brand-logo">
            <svg viewBox="0 0 1024 1024" width="60" height="60">
              <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" fill="#ffffff"/>
              <path d="M512 140c-205.4 0-372 166.6-372 372s166.6 372 372 372 372-166.6 372-372-166.6-372-372-372z m193.4 225.7l-210.6 292c-12.7 17.7-39 17.7-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.3 0 19.9 4.9 25.9 13.2l71.2 98.8 157.2-218c6-8.4 15.7-13.2 25.9-13.2H699c6.5 0 10.3 7.4 6.4 12.7z" fill="#ffffff"/>
            </svg>
          </div>
          <h1 class="brand-title">{{ systemName }}</h1>
          <p class="brand-subtitle">{{ systemSubtitle }}</p>
        </div>
      </div>

      <!-- 右侧登录表单区域 -->
      <div class="login-right">
        <h2 class="form-title">{{ loginTitle }}</h2>
        <el-form :model="loginForm" :rules="rules" ref="formRef" class="login-form">
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              clearable
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              show-password
              @keyup.enter="handleLogin"
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item>
            <el-checkbox v-model="rememberMe">记住账号</el-checkbox>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              :loading="loading"
              @click="handleLogin"
              class="login-button"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 底部版权信息 -->
    <div class="login-footer">
      <p>{{ footerText }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { login } from '@/api/user'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const rememberMe = ref(false)

// 可自定义的配置
const systemName = ref('管理后台系统')
const systemSubtitle = ref('快速开发前后端分离管理后台')
const loginTitle = ref('系统登录')
const footerText = ref('© 2024 All Rights Reserved')

const loginForm = reactive({
  username: 'admin',
  password: '123456'
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await login(loginForm)
        localStorage.setItem('token', res.data.token)

        // 如果勾选了记住账号,保存用户名
        if (rememberMe.value) {
          localStorage.setItem('rememberedUsername', loginForm.username)
        } else {
          localStorage.removeItem('rememberedUsername')
        }

        ElMessage.success('登录成功')
        router.push('/')
      } catch (error) {
        ElMessage.error('登录失败')
      } finally {
        loading.value = false
      }
    }
  })
}

// 页面加载时检查是否有记住的账号
const rememberedUsername = localStorage.getItem('rememberedUsername')
if (rememberedUsername) {
  loginForm.username = rememberedUsername
  rememberMe.value = true
}
</script>

<style scoped lang="scss">
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
  padding: 20px;
}

.login-card {
  display: flex;
  width: 900px;
  max-width: 100%;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  }

  .brand-content {
    position: relative;
    z-index: 1;
    text-align: center;
    color: white;

    .brand-logo {
      margin-bottom: 30px;

      svg {
        filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15));
      }
    }

    .brand-title {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 12px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .brand-subtitle {
      font-size: 14px;
      opacity: 0.9;
      font-weight: 300;
      line-height: 1.6;
    }
  }
}

.login-right {
  flex: 1;
  padding: 60px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .form-title {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 32px;
    text-align: center;
  }

  .login-form {
    .el-form-item {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    :deep(.el-input) {
      height: 38px;

      .el-input__wrapper {
        height: 38px;
        padding: 0 12px;
        border-radius: 8px;
        box-shadow: 0 0 0 1px #e4e7ed inset;
        transition: all 0.3s;
        box-sizing: border-box;

        &:hover {
          box-shadow: 0 0 0 1px #c0c4cc inset;
        }

        &.is-focus {
          box-shadow: 0 0 0 1px var(--el-color-primary) inset;
        }
      }

      .el-input__inner {
        height: 38px;
        line-height: 38px;
      }
    }

    :deep(.el-input__prefix) {
      font-size: 16px;
      color: #909399;
    }

    .login-button {
      width: 100%;
      height: 38px;
      font-size: 14px;
      font-weight: 500;
      margin-top: 8px;
    }
  }
}

.login-footer {
  position: absolute;
  bottom: 20px;
  text-align: center;

  p {
    font-size: 13px;
    color: #909399;
  }
}

// 响应式设计
@media (max-width: 900px) {
  .login-card {
    width: 100%;
    max-width: 500px;
  }

  .login-left {
    display: none;
  }

  .login-right {
    padding: 40px 30px;
  }
}
</style>
