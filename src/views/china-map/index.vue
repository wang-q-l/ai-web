<template>
  <div class="china-map-page">
    <el-card :body-style="{ padding: 0, height: '100%' }">
      <ChinaMap3D :config="mapConfig" :full-screen="isFullPage" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ChinaMap3D from '@/components/business/china-map-3d/index.vue'

defineOptions({
  name: 'ChinaMap'
})

const route = useRoute()
const isFullPage = computed(() => route.matched.some((r) => r.meta?.isFullPage))

const mapConfig = {
  showGUI: true,
  showBreadcrumb: true,
  showLoading: true
}
</script>

<style scoped lang="scss">
.china-map-page {
  width: 100%;
  height: v-bind('isFullPage ? "100%" : "calc(100vh - 140px)"');
  padding: 0;

  :deep(.el-card) {
    height: 100%;
    border: none !important;
    box-shadow: none !important;
    border-radius: 12px;
    background: #000;
  }

  :deep(.el-card__body) {
    height: 100%;
    padding: 0;
  }
}
</style>
