<template>
  <el-scrollbar height="100vh">
    <router-view />
  </el-scrollbar>
</template>

<script setup lang="ts">
</script>

<style>
/* 隐藏原生滚动条 */
html, body {
  overflow: hidden;
  height: 100vh;
}

#app {
  height: 100vh;
}
</style>
