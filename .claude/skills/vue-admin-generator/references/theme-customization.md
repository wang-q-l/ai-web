# 主题自定义指南

## CSS 变量配置

在 `src/styles/index.css` 中修改 CSS 变量来自定义主题颜色:

```css
:root {
  --primary-color: #409eff;      /* 主题色 */
  --success-color: #67c23a;      /* 成功色 */
  --warning-color: #e6a23c;      /* 警告色 */
  --danger-color: #f56c6c;       /* 危险色 */
  --info-color: #909399;         /* 信息色 */

  --bg-color: #f0f2f5;           /* 背景色 */
  --sidebar-bg: #001529;         /* 侧边栏背景色 */
  --sidebar-text: #ffffff;       /* 侧边栏文字色 */
  --sidebar-active-bg: #1890ff;  /* 侧边栏激活背景色 */
}
```

## 侧边栏颜色配置

在 `src/layout/index.vue` 中修改侧边栏颜色:

```typescript
const sidebarBg = ref('#001529')        // 侧边栏背景色
const sidebarText = ref('#ffffff')      // 侧边栏文字色
const sidebarActiveText = ref('#1890ff') // 激活状态文字色
```

## 登录页背景

在 `src/views/login/index.vue` 中修改登录页背景渐变:

```css
.login-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

常用渐变配色:
- 蓝紫色: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- 蓝绿色: `linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)`
- 橙红色: `linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 100%)`
- 绿色: `linear-gradient(135deg, #52E5E7 0%, #130CB7 100%)`

## Element Plus 主题定制

如需深度定制 Element Plus 组件样式,在 `src/main.ts` 中配置:

```typescript
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

app.use(ElementPlus, {
  size: 'default',
  zIndex: 3000
})
```

或使用 SCSS 变量覆盖(需安装 sass):

```scss
// src/styles/element-variables.scss
@forward 'element-plus/theme-chalk/src/common/var.scss' with (
  $colors: (
    'primary': (
      'base': #409eff,
    ),
  ),
);
```
