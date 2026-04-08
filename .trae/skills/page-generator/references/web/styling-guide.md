# Web 前台样式规范

本文档定义 Web 前台项目的样式规范，重点说明卡片式布局的使用。

## 核心设计原则

### 1. 卡片式布局

**所有页面必须使用卡片式布局**，这是项目的核心设计规范。

**卡片默认样式：**
- **无边框**：`border: none !important;`
- **无阴影**：`box-shadow: none !important;`
- **圆角**：`border-radius: 12px`
- **背景色**：`background: #fff`

**示例：**

```vue
<template>
  <div class="page-container">
    <!-- 筛选卡片 -->
    <el-card class="filter-card">
      <el-form>
        <!-- 筛选表单 -->
      </el-form>
    </el-card>

    <!-- 内容卡片 -->
    <el-card class="content-card">
      <!-- 页面内容 -->
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.page-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-card,
.content-card {
  border: none !important;
  box-shadow: none !important;
  border-radius: 12px;
}

.filter-card {
  :deep(.el-card__body) {
    padding: 12px 20px;
  }
}

.content-card {
  :deep(.el-card__body) {
    padding: 20px;
  }
}
</style>
```

### 2. 何时使用投影和边框

**只有在特殊说明的情况下才添加投影和边框：**

- **悬浮效果**：鼠标悬停时显示投影
  ```scss
  .card {
    transition: box-shadow 0.3s;

    &:hover {
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    }
  }
  ```

- **强调重点**：需要突出显示的卡片
  ```scss
  .highlight-card {
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
    border: 1px solid #409EFF;
  }
  ```

- **分层效果**：需要明确层级关系时
  ```scss
  .elevated-card {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }
  ```

## 布局规范

### 1. Container 容器

所有内容区域使用 Container 容器包裹：

```vue
<template>
  <div class="page-section">
    <div class="container">
      <!-- 页面内容 -->
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }
}
</style>
```

### 2. 卡片间距

卡片之间使用 `gap` 控制间距，不使用 `margin-bottom`：

```scss
.page-container {
  display: flex;
  flex-direction: column;
  gap: 16px;  // 卡片间距 16px
}
```

### 3. 卡片内边距

```scss
// 筛选卡片：上下 12px，左右 20px
.filter-card {
  :deep(.el-card__body) {
    padding: 12px 20px;
  }
}

// 内容卡片：统一 20px
.content-card {
  :deep(.el-card__body) {
    padding: 20px;
  }
}

// 紧凑卡片：统一 16px
.compact-card {
  :deep(.el-card__body) {
    padding: 16px;
  }
}
```

## 颜色规范

### 1. 主色调

```scss
$primary-color: #409EFF;
$success-color: #67C23A;
$warning-color: #E6A23C;
$danger-color: #F56C6C;
$info-color: #909399;
```

### 2. 文字颜色

```scss
$text-primary: #303133;    // 主要文字
$text-regular: #606266;    // 常规文字
$text-secondary: #909399;  // 次要文字
$text-placeholder: #C0C4CC; // 占位文字
```

### 3. 背景颜色

```scss
$bg-white: #FFFFFF;        // 卡片背景
$bg-light: #F5F7FA;        // 页面背景
$bg-lighter: #FAFAFA;      // 浅色背景
```

### 4. 边框颜色

```scss
$border-base: #DCDFE6;
$border-light: #E4E7ED;
$border-lighter: #EBEEF5;
```

## 间距规范

使用 8px 基准间距：

```scss
$spacing-xs: 8px;
$spacing-sm: 16px;
$spacing-md: 24px;
$spacing-lg: 32px;
$spacing-xl: 48px;
$spacing-xxl: 64px;
```

## 字体规范

### 1. 字体大小

```scss
$font-size-xs: 12px;
$font-size-sm: 14px;
$font-size-base: 16px;
$font-size-lg: 18px;
$font-size-xl: 20px;
$font-size-xxl: 24px;
```

### 2. 标题字体

```scss
$h1-font-size: 32px;
$h2-font-size: 28px;
$h3-font-size: 24px;
$h4-font-size: 20px;
$h5-font-size: 18px;
$h6-font-size: 16px;
```

### 3. 字体粗细

```scss
$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-bold: 700;
```

## 圆角规范

```scss
$border-radius-sm: 4px;
$border-radius-base: 8px;
$border-radius-lg: 12px;   // 卡片默认圆角
$border-radius-xl: 16px;
```

## 响应式设计

### 1. 断点定义

```scss
$breakpoint-xs: 768px;   // 手机
$breakpoint-sm: 992px;   // 平板
$breakpoint-md: 1200px;  // 小屏电脑
$breakpoint-lg: 1920px;  // 大屏电脑
```

### 2. 媒体查询

```scss
// 手机端
@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }

  .card {
    border-radius: 8px;  // 手机端使用较小圆角
  }
}

// 平板端
@media (min-width: 768px) and (max-width: 992px) {
  .container {
    padding: 0 20px;
  }
}

// 电脑端
@media (min-width: 992px) {
  .container {
    max-width: 1200px;
  }
}
```

## 常见布局模式

### 1. 首页 Banner 区域

```vue
<template>
  <section class="banner-section">
    <el-carousel height="600px" indicator-position="outside">
      <el-carousel-item v-for="item in banners" :key="item.id">
        <img :src="item.image" :alt="item.title" />
        <div class="banner-content">
          <h1>{{ item.title }}</h1>
          <p>{{ item.description }}</p>
          <el-button type="primary" size="large">了解更多</el-button>
        </div>
      </el-carousel-item>
    </el-carousel>
  </section>
</template>

<style scoped>
.banner-section {
  width: 100%;
}

.banner-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #fff;
}

.banner-content h1 {
  font-size: 48px;
  margin-bottom: 16px;
}

.banner-content p {
  font-size: 20px;
  margin-bottom: 32px;
}
</style>
```

### 2. 产品展示区域（卡片式）

```vue
<template>
  <section class="products-section">
    <div class="container">
      <h2 class="section-title">我们的产品</h2>
      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="item in products" :key="item.id">
          <el-card class="product-card">
            <img :src="item.image" :alt="item.title" class="product-image" />
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
            <div class="product-footer">
              <span class="price">¥{{ item.price }}</span>
              <el-button type="primary" size="small">查看详情</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </section>
</template>

<style scoped lang="scss">
.products-section {
  padding: 64px 0;
  background: #f5f7fa;
}

.section-title {
  text-align: center;
  font-size: 32px;
  margin-bottom: 48px;
}

.product-card {
  border: none !important;
  box-shadow: none !important;
  border-radius: 12px;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
  }

  :deep(.el-card__body) {
    padding: 16px;
  }
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 16px;
}

.product-card h3 {
  font-size: 18px;
  margin-bottom: 8px;
}

.product-card p {
  color: #909399;
  font-size: 14px;
  margin-bottom: 16px;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  color: #f56c6c;
  font-size: 20px;
  font-weight: bold;
}
</style>
```

### 3. 新闻列表区域（卡片式）

```vue
<template>
  <section class="news-section">
    <div class="container">
      <h2 class="section-title">新闻动态</h2>
      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="8" v-for="item in news" :key="item.id">
          <el-card class="news-card" @click="viewDetail(item.id)">
            <img :src="item.image" :alt="item.title" class="news-image" />
            <div class="news-content">
              <h3>{{ item.title }}</h3>
              <p class="news-date">{{ item.date }}</p>
              <p class="news-desc">{{ item.description }}</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </section>
</template>

<style scoped lang="scss">
.news-section {
  padding: 64px 0;
}

.section-title {
  text-align: center;
  font-size: 32px;
  margin-bottom: 48px;
}

.news-card {
  border: none !important;
  box-shadow: none !important;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
  }

  :deep(.el-card__body) {
    padding: 0;
  }
}

.news-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.news-content {
  padding: 20px;
}

.news-content h3 {
  font-size: 18px;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.news-date {
  color: #909399;
  font-size: 14px;
  margin-bottom: 12px;
}

.news-desc {
  color: #606266;
  font-size: 14px;
  height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
```

## 注意事项

1. **卡片默认无投影无边框**，除非特殊说明
2. **使用 gap 控制间距**，不使用 margin-bottom
3. **响应式设计**，支持移动端和桌面端
4. **悬浮效果**，鼠标悬停时可以添加投影和位移
5. **圆角统一**，卡片使用 12px 圆角
6. **内边距统一**，筛选卡片 12px 20px，内容卡片 20px
