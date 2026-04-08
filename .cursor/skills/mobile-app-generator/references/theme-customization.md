# 主题定制指南

本文档介绍如何定制移动端应用的主题颜色和暗黑模式。

## CSS 变量配置

### 亮色主题

在 `src/styles/variables.css` 中定义亮色主题变量：

```css
:root {
  /* 主题色 */
  --primary-color: #1989fa;    /* 主色调 */
  --success-color: #07c160;    /* 成功色 */
  --warning-color: #ff976a;    /* 警告色 */
  --danger-color: #ee0a24;     /* 危险色 */

  /* 文字颜色 */
  --text-color: #323233;              /* 主要文字 */
  --text-color-secondary: #646566;    /* 次要文字 */
  --text-color-disabled: #c8c9cc;     /* 禁用文字 */

  /* 背景色 */
  --background-color: #f7f8fa;   /* 页面背景 */
  --card-background: #ffffff;    /* 卡片背景 */

  /* Tabbar */
  --tabbar-background: #ffffff;        /* Tabbar 背景 */
  --tabbar-active-color: #1989fa;      /* 激活颜色 */
  --tabbar-inactive-color: #646566;    /* 未激活颜色 */

  /* 边框 */
  --border-color: #ebedf0;
}
```

### 暗黑主题

定义暗黑主题变量：

```css
[data-theme='dark'] {
  /* 主题色保持不变 */
  --primary-color: #1989fa;
  --success-color: #07c160;
  --warning-color: #ff976a;
  --danger-color: #ee0a24;

  /* 文字颜色 */
  --text-color: #f5f5f5;
  --text-color-secondary: #b0b0b0;
  --text-color-disabled: #707070;

  /* 背景色 */
  --background-color: #141414;
  --card-background: #1c1c1c;

  /* Tabbar */
  --tabbar-background: #1c1c1c;
  --tabbar-active-color: #1989fa;
  --tabbar-inactive-color: #969799;

  /* 边框 */
  --border-color: #2c2c2c;
}
```

## Vant 组件主题配置

### 方式一：CSS 变量覆盖

在 `src/styles/vant-custom.css` 中覆盖 Vant 组件变量：

```css
[data-theme='dark'] {
  /* NavBar */
  --van-nav-bar-background: var(--card-background);
  --van-nav-bar-text-color: var(--text-color);

  /* Cell */
  --van-cell-background: var(--card-background);
  --van-cell-text-color: var(--text-color);

  /* Tabbar */
  --van-tabbar-background: var(--tabbar-background);
  --van-tabbar-item-active-color: var(--tabbar-active-color);

  /* Button */
  --van-button-primary-background: var(--primary-color);
  --van-button-primary-border-color: var(--primary-color);
}
```

### 方式二：ConfigProvider 全局配置

在 `src/main.ts` 中使用 ConfigProvider：

```typescript
import { ConfigProvider } from 'vant'

app.use(ConfigProvider, {
  themeVars: {
    primaryColor: '#1989fa',
    successColor: '#07c160',
    warningColor: '#ff976a',
    dangerColor: '#ee0a24',
  },
})
```

## 暗黑模式实现

### useTheme Composable

在 `src/composables/useTheme.ts` 中实现主题切换逻辑：

```typescript
import { ref, watch } from 'vue'

type Theme = 'light' | 'dark'

export function useTheme() {
  const theme = ref<Theme>(
    (localStorage.getItem('theme') as Theme) || 'light'
  )

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  watch(
    theme,
    (newTheme) => {
      document.documentElement.setAttribute('data-theme', newTheme)
      localStorage.setItem('theme', newTheme)
    },
    { immediate: true }
  )

  return { theme, toggleTheme }
}
```

### 在组件中使用

```vue
<template>
  <van-cell title="暗黑模式">
    <template #right-icon>
      <van-switch v-model="isDark" @change="toggleTheme" />
    </template>
  </van-cell>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { theme, toggleTheme } = useTheme()
const isDark = ref(theme.value === 'dark')
</script>
```

## 常用颜色配置

### 电商类应用

```css
:root {
  --primary-color: #ff6034;    /* 橙红色 */
  --success-color: #52c41a;    /* 绿色 */
  --warning-color: #faad14;    /* 黄色 */
  --danger-color: #f5222d;     /* 红色 */
}
```

### 社交类应用

```css
:root {
  --primary-color: #07c160;    /* 微信绿 */
  --success-color: #52c41a;
  --warning-color: #faad14;
  --danger-color: #f5222d;
}
```

### 工具类应用

```css
:root {
  --primary-color: #1890ff;    /* 蓝色 */
  --success-color: #52c41a;
  --warning-color: #faad14;
  --danger-color: #f5222d;
}
```

## 渐变背景配置

### 登录页渐变

在 `src/views/login/index.vue` 中：

```css
.login-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, #667eea 100%);
}
```

### 个人中心渐变

在 `src/views/profile/index.vue` 中：

```css
.profile-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, #667eea 100%);
}
```

### 自定义渐变色

```css
/* 蓝紫渐变 */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* 橙红渐变 */
background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);

/* 绿色渐变 */
background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
```

## 主题切换最佳实践

1. **使用 CSS 变量**：所有颜色都通过 CSS 变量定义，方便统一管理
2. **持久化存储**：使用 localStorage 保存用户的主题选择
3. **自动适配**：Vant 组件通过 CSS 变量自动适配主题
4. **平滑过渡**：可以添加 transition 实现主题切换动画

```css
* {
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

## 注意事项

1. 修改主题色后，需要同时修改 CSS 变量和 Vant 组件变量
2. 暗黑模式下，注意文字和背景的对比度，确保可读性
3. 图片和图标在暗黑模式下可能需要特殊处理
4. 测试所有页面在两种主题下的显示效果
