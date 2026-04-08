<template>
  <div class="contact-page page-content">
    <div class="container">
      <h1>联系我们</h1>
      <el-row :gutter="24">
        <el-col :xs="24" :md="12">
          <el-card>
            <h2>联系方式</h2>
            <div class="contact-info">
              <div class="info-item">
                <el-icon><Location /></el-icon>
                <div>
                  <strong>地址</strong>
                  <p>{{ siteConfig.company.address }}</p>
                </div>
              </div>
              <div class="info-item">
                <el-icon><Phone /></el-icon>
                <div>
                  <strong>电话</strong>
                  <p>{{ siteConfig.company.phone }}</p>
                </div>
              </div>
              <div class="info-item">
                <el-icon><Message /></el-icon>
                <div>
                  <strong>邮箱</strong>
                  <p>{{ siteConfig.company.email }}</p>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-card>
            <h2>在线留言</h2>
            <el-form :model="form" label-width="80px">
              <el-form-item label="姓名">
                <el-input v-model="form.name" />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input v-model="form.email" type="email" />
              </el-form-item>
              <el-form-item label="电话">
                <el-input v-model="form.phone" />
              </el-form-item>
              <el-form-item label="留言">
                <el-input v-model="form.message" type="textarea" :rows="4" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSubmit">提交</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Location, Phone, Message } from '@element-plus/icons-vue'
import { siteConfig } from '@/config/site'

const form = reactive({
  name: '',
  email: '',
  phone: '',
  message: ''
})

const handleSubmit = () => {
  ElMessage.success('留言提交成功！')
  Object.assign(form, { name: '', email: '', phone: '', message: '' })
}
</script>

<style scoped>
h1 {
  margin-bottom: var(--spacing-xl);
}

h2 {
  margin-bottom: var(--spacing-lg);
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.info-item {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-start;
}

.info-item .el-icon {
  font-size: 24px;
  color: var(--primary-color);
  margin-top: 4px;
}

.info-item strong {
  display: block;
  margin-bottom: var(--spacing-xs);
}

.info-item p {
  color: var(--text-secondary);
  margin: 0;
}
</style>
