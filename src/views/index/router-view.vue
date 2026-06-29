<template>
  <!-- 路由透传容器：用于渲染多级菜单的子路由，自身不带任何布局 -->
  <router-view />
</template>

<script setup lang="ts">
  /**
   * 空白路由容器
   * 仅作为多级菜单（二级菜单含三级子菜单）的中间层路由出口使用
   */
  defineOptions({ name: 'RouterViewLayout' })
</script>
