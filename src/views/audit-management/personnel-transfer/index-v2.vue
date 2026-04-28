<template>
  <div class="personnel-transfer-container">
    <el-card class="steps-card">
      <div class="steps-wrapper">
        <el-steps :active="currentStep" finish-status="success" align-center>
          <el-step title="选择变更人员" />
          <el-step title="选择移交文书" />
          <el-step title="选择接收人员" />
          <el-step title="确认移交" />
        </el-steps>
      </div>
    </el-card>

    <el-card class="content-card">
      <div class="step-content">
        <h3>步骤 {{ currentStep + 1 }}</h3>
        <p>当前步骤：{{ currentStep }}</p>
        <el-button @click="nextStep">下一步</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  defineOptions({
    name: 'PersonnelTransfer'
  })

  const currentStep = ref(0)

  const nextStep = () => {
    if (currentStep.value < 3) {
      currentStep.value++
    }
  }
</script>

<style scoped lang="scss">
  .personnel-transfer-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
  }

  .steps-card {
    flex-shrink: 0;
  }

  .steps-wrapper {
    padding: 20px 0;
  }

  .content-card {
    flex: 1;
    overflow: hidden;
  }

  .step-content {
    padding: 20px;
  }
</style>
