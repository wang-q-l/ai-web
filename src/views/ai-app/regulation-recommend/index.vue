<script setup lang="ts">
  // 法规推荐页面：默认弹出问题新增抽屉；左侧两个面板（AI 助理 / 引入法规）互斥打开
  import { ref, onMounted, watch } from 'vue'
  import { Plus } from '@element-plus/icons-vue'
  import ProblemDrawer from './components/ProblemDrawer.vue'
  import AiAssistantDrawer from './components/AiAssistantDrawer.vue'
  import RegulationImportDrawer from './components/RegulationImportDrawer.vue'
  import KnowledgeCiteDrawer from './components/KnowledgeCiteDrawer.vue'

  // 抽屉显隐状态
  const drawerOpen = ref(false)
  // AI 助理抽屉
  const aiOpen = ref(false)
  // 引入法规面板
  const regulationImportOpen = ref(false)
  // 知识引用面板（管理建议库 / 典型问题库）
  const knowledgeCiteOpen = ref(false)
  // AI 助理初始查询内容
  const aiQuery = ref('')
  // 问题抽屉组件引用，用于从左侧面板回填到对应字段
  const problemDrawerRef = ref<InstanceType<typeof ProblemDrawer>>()

  // 进入页面默认打开问题抽屉
  onMounted(() => {
    drawerOpen.value = true
  })

  // 重新打开问题抽屉
  const handleOpen = () => {
    drawerOpen.value = true
  }

  // 子组件抛出「法规推荐」事件 → 打开 AI 助理抽屉
  const handleRecommend = (query: string) => {
    aiQuery.value = query
    aiOpen.value = true
  }

  // 子组件抛出「引入法规」事件 → 打开法规查询面板
  const handleOpenRegulationImport = () => {
    regulationImportOpen.value = true
  }

  // 子组件抛出「引用知识中心」事件 → 打开知识引用面板
  const handleOpenKnowledgeCite = () => {
    knowledgeCiteOpen.value = true
  }

  // 左侧面板回填定性依据：AI 助理与引入法规共用
  const handleCite = (text: string) => {
    problemDrawerRef.value?.appendQualitativeBasis(text)
  }

  // 知识引用面板回填：按用户选择的目标字段追加
  const handleKnowledgeCite = (payload: {
    text: string
    targetField: 'description' | 'qualitativeBasis' | 'auditAdvice'
  }) => {
    problemDrawerRef.value?.appendToField(payload.targetField, payload.text)
  }

  // 互斥：打开 AI 助理时关闭其他左侧面板
  watch(aiOpen, (val) => {
    if (val) {
      regulationImportOpen.value = false
      knowledgeCiteOpen.value = false
    }
  })

  // 互斥：打开引入法规时关闭其他左侧面板
  watch(regulationImportOpen, (val) => {
    if (val) {
      aiOpen.value = false
      knowledgeCiteOpen.value = false
    }
  })

  // 互斥：打开知识引用时关闭其他左侧面板
  watch(knowledgeCiteOpen, (val) => {
    if (val) {
      aiOpen.value = false
      regulationImportOpen.value = false
    }
  })
</script>

<template>
  <div class="regulation-recommend-page">
    <!-- 顶部操作区 -->
    <el-card class="header-card" shadow="never">
      <div class="header-content">
        <div class="header-left">
          <div class="page-title">法规推荐</div>
          <div class="page-desc">点击右侧按钮可重新打开「问题新增」抽屉</div>
        </div>
        <el-button type="primary" @click="handleOpen">
          <el-icon><Plus /></el-icon>
          新增问题
        </el-button>
      </div>
    </el-card>

    <!-- 空白占位区 -->
    <el-card class="placeholder-card" shadow="never">
      <el-empty description="暂无内容，可点击右上角「新增问题」打开问题新增抽屉" />
    </el-card>

    <!-- 问题新增抽屉 -->
    <ProblemDrawer
      ref="problemDrawerRef"
      v-model:open="drawerOpen"
      @recommend="handleRecommend"
      @open-regulation-import="handleOpenRegulationImport"
      @open-knowledge-cite="handleOpenKnowledgeCite"
    />

    <!-- 左侧 AI 助理抽屉 -->
    <AiAssistantDrawer v-model:open="aiOpen" :initial-query="aiQuery" @cite="handleCite" />

    <!-- 左侧引入法规面板（与其他左侧面板互斥） -->
    <RegulationImportDrawer v-model:open="regulationImportOpen" @cite="handleCite" />

    <!-- 左侧知识引用面板（与其他左侧面板互斥） -->
    <KnowledgeCiteDrawer v-model:open="knowledgeCiteOpen" @cite="handleKnowledgeCite" />
  </div>
</template>

<style lang="scss" scoped>
  .regulation-recommend-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }

  .header-card,
  .placeholder-card {
    border-radius: 8px;
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .page-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .page-desc {
    margin-top: 4px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .placeholder-card {
    flex: 1;
  }
</style>
