<template>
  <div class="profile-page page-content">
    <div class="container">
      <h1>个人资料</h1>
      <el-card>
        <el-form :model="profileForm" label-width="100px">
          <el-form-item label="头像">
            <el-avatar :size="80" :src="profileForm.avatar" />
          </el-form-item>
          <el-form-item label="用户名">
            <el-input v-model="profileForm.name" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="profileForm.email" type="email" />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="profileForm.phone" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSave">保存</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const profileForm = reactive({
  name: userStore.userInfo.name,
  email: userStore.userInfo.email,
  phone: userStore.userInfo.phone || '',
  avatar: userStore.userInfo.avatar
})

const handleSave = () => {
  userStore.setUserInfo({
    ...userStore.userInfo,
    ...profileForm
  })
  ElMessage.success('保存成功')
}
</script>

<style scoped>
h1 {
  margin-bottom: var(--spacing-xl);
}
</style>
