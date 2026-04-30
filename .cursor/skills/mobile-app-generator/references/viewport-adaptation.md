# 视口适配指南

本文档介绍移动端应用的 Viewport 适配方案。

## postcss-px-to-viewport 配置

### 基本配置

在 `postcss.config.js` 中配置：

```javascript
export default {
  plugins: {
    'postcss-px-to-viewport': {
      viewportWidth: 375, // 设计稿宽度
      viewportUnit: 'vw', // 转换单位
      selectorBlackList: ['.ignore', '.hairlines'], // 不转换的类名
      minPixelValue: 1, // 最小转换值
      mediaQuery: false // 是否转换媒体查询中的 px
    }
  }
}
```

### 配置项说明

| 配置项            | 类型    | 默认值 | 说明                         |
| ----------------- | ------- | ------ | ---------------------------- |
| viewportWidth     | number  | 375    | 设计稿宽度                   |
| viewportHeight    | number  | 667    | 设计稿高度（可选）           |
| viewportUnit      | string  | 'vw'   | 转换单位（vw/vh/vmin/vmax）  |
| selectorBlackList | array   | []     | 不转换的类名                 |
| minPixelValue     | number  | 1      | 最小转换值（小于此值不转换） |
| mediaQuery        | boolean | false  | 是否转换媒体查询中的 px      |
| unitPrecision     | number  | 5      | 转换精度                     |

## 设计稿尺寸配置

### 常见设计稿尺寸

```javascript
// iPhone 6/7/8 (375px)
viewportWidth: 375

// iPhone 6/7/8 Plus (414px)
viewportWidth: 414

// iPhone X/XS/11 Pro (375px)
viewportWidth: 375

// iPhone XR/11 (414px)
viewportWidth: 414

// Android (360px)
viewportWidth: 360
```

### 根据设计稿调整

如果设计稿是 750px：

```javascript
{
  viewportWidth: 750,
  // 其他配置...
}
```

## 不需要转换的情况

### 使用黑名单

```javascript
{
  selectorBlackList: [
    '.ignore',      // 包含 ignore 的类名
    '.hairlines',   // 1px 边框
    '.van-',        // Vant 组件（如果需要）
  ],
}
```

### 在代码中使用

```vue
<template>
  <!-- 不转换 -->
  <div class="ignore" style="width: 100px"> 宽度保持 100px </div>

  <!-- 转换 -->
  <div style="width: 100px"> 宽度转换为 vw </div>
</template>
```

### 使用注释禁用

```css
/* 单行禁用 */
.box {
  width: 100px; /* px-to-viewport-ignore */
}

/* 整个规则禁用 */
/* px-to-viewport-ignore-next */
.box {
  width: 100px;
  height: 100px;
}
```

## Vant 组件适配

### Vant 4.x 已做适配

Vant 4.x 版本已经做了移动端适配，无需特殊处理：

```javascript
{
  // 不需要将 Vant 加入黑名单
  selectorBlackList: ['.ignore', '.hairlines'],
}
```

### 如果需要自定义 Vant 样式

```css
/* 会自动转换 */
.van-button {
  height: 50px; /* 转换为 vw */
}

/* 不转换 */
.van-button.ignore {
  height: 50px; /* 保持 50px */
}
```

## 1px 边框问题

### 使用 hairlines 类

```vue
<template>
  <div class="box hairlines"> 边框保持 1px </div>
</template>

<style scoped>
  .box {
    border: 1px solid #eee;
  }
</style>
```

### 使用 transform 方案

```css
.hairline {
  position: relative;
}

.hairline::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 200%;
  height: 200%;
  border: 1px solid #eee;
  transform: scale(0.5);
  transform-origin: 0 0;
}
```

## 常见适配问题

### 问题 1：字体大小转换后太小

**解决方案：**

```javascript
{
  minPixelValue: 2,  // 小于 2px 的不转换
}
```

或者使用黑名单：

```css
.text {
  font-size: 14px; /* px-to-viewport-ignore */
}
```

### 问题 2：固定尺寸元素被转换

**解决方案：**

```vue
<template>
  <div class="ignore" style="width: 100px"> 固定宽度 </div>
</template>
```

### 问题 3：第三方组件样式异常

**解决方案：**

将第三方组件的类名前缀加入黑名单：

```javascript
{
  selectorBlackList: ['.ignore', '.third-party-'],
}
```

## 最佳实践

### 1. 统一设计稿尺寸

团队统一使用 375px 或 750px 设计稿。

### 2. 合理使用黑名单

只对确实不需要转换的元素使用黑名单。

### 3. 测试不同屏幕

在不同尺寸的设备上测试适配效果：

- iPhone SE (375px)
- iPhone 12 (390px)
- iPhone 12 Pro Max (428px)
- Android 小屏 (360px)
- Android 大屏 (414px)

### 4. 注意最大最小宽度

```css
.container {
  max-width: 750px; /* 最大宽度 */
  min-width: 320px; /* 最小宽度 */
  margin: 0 auto;
}
```

### 5. 使用 CSS 变量

```css
:root {
  --container-padding: 16px;
}

.container {
  padding: var(--container-padding);
}
```

## 调试技巧

### 1. 浏览器开发者工具

使用 Chrome DevTools 的移动端模拟器：

1. 打开开发者工具（F12）
2. 点击设备工具栏图标（Ctrl+Shift+M）
3. 选择不同的设备进行测试

### 2. 查看转换结果

在浏览器中查看编译后的 CSS：

```css
/* 源代码 */
.box {
  width: 100px;
}

/* 编译后 */
.box {
  width: 26.66667vw;
}
```

### 3. 使用 vconsole

```bash
npm install vconsole
```

```typescript
// main.ts
import VConsole from 'vconsole'

if (process.env.NODE_ENV === 'development') {
  new VConsole()
}
```

## 其他适配方案

### rem 方案

```javascript
// 不推荐，但可以作为备选
{
  plugins: {
    'postcss-pxtorem': {
      rootValue: 37.5,
      propList: ['*'],
    },
  },
}
```

### viewport + rem 混合方案

```javascript
{
  plugins: {
    'postcss-px-to-viewport': {
      viewportWidth: 375,
      // 只转换部分属性
      propList: ['width', 'height', 'padding', 'margin'],
    },
    'postcss-pxtorem': {
      rootValue: 37.5,
      // 只转换字体相关
      propList: ['font-size', 'line-height'],
    },
  },
}
```

## 注意事项

1. **设计稿尺寸要统一**：确保 viewportWidth 与设计稿宽度一致
2. **测试多种设备**：在不同尺寸的设备上测试
3. **注意性能**：过多的 vw 计算可能影响性能
4. **兼容性**：vw 单位在现代浏览器中支持良好
5. **第三方组件**：注意第三方组件的适配问题

## 参考资源

- [postcss-px-to-viewport 文档](https://github.com/evrone/postcss-px-to-viewport)
- [Vant 适配方案](https://vant-ui.github.io/vant/#/zh-CN/advanced-usage#liu-lan-qi-gua-pei)
- [移动端适配最佳实践](https://github.com/amfe/article/issues/17)
