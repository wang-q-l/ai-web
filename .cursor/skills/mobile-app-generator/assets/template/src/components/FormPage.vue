<template>
  <div class="form-page">
    <van-nav-bar :title="title" left-arrow @click-left="onBack" />

    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="formData.name"
          name="name"
          label="姓名"
          placeholder="请输入姓名"
          :rules="[{ required: true, message: '请输入姓名' }]"
        />
        <van-field
          v-model="formData.phone"
          name="phone"
          label="手机号"
          placeholder="请输入手机号"
          :rules="[{ required: true, message: '请输入手机号' }]"
        />
        <van-field
          v-model="formData.email"
          name="email"
          label="邮箱"
          placeholder="请输入邮箱"
        />
        <van-field
          v-model="formData.address"
          name="address"
          label="地址"
          placeholder="请输入地址"
          type="textarea"
          rows="3"
        />
      </van-cell-group>

      <div class="submit-btn">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          提交
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

interface Props {
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '表单页',
})

const router = useRouter()
const loading = ref(false)

const formData = ref({
  name: '',
  phone: '',
  email: '',
  address: '',
})

const onSubmit = async () => {
  loading.value = true
  try {
    // 模拟 API 请求
    await new Promise(resolve => setTimeout(resolve, 1000))
    showToast('提交成功')
    router.back()
  } catch (error) {
    showToast('提交失败')
  } finally {
    loading.value = false
  }
}

const onBack = () => {
  router.back()
}
</script>

<style scoped>
.form-page {
  background-color: var(--background-color);
  min-height: 100vh;
}

.submit-btn {
  padding: 20px;
}
</style>
