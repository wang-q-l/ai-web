# 组件目录说明

本目录按功能模块化组织组件，便于维护和复用。

## 目录结构

```
src/components/
├── common/           # 通用组件
├── layout/           # 布局组件
├── business/         # 业务组件
└── page-templates/   # 页面模板组件
```

## 各目录说明

### common/ - 通用组件

存放项目中可复用的基础 UI 组件，与业务逻辑无关。

**适用组件**：

- 按钮组件（Button.vue）
- 图标组件（Icon.vue）
- 加载组件（Loading.vue）
- 空状态组件（Empty.vue）
- 对话框组件（Dialog.vue）
- 等...

**命名规范**：PascalCase，如 `CustomButton.vue`

### layout/ - 布局组件

存放页面布局相关的组件。

**适用组件**：

- 头部导航（Header.vue）
- 侧边栏（Sidebar.vue）
- 面包屑（Breadcrumb.vue）
- 页面容器（PageContainer.vue）
- 等...

**命名规范**：PascalCase，如 `AppHeader.vue`

### business/ - 业务组件

存放与具体业务逻辑相关的组件。

**适用组件**：

- 用户卡片（UserCard.vue）
- 数据表格（DataTable.vue）
- 搜索表单（SearchForm.vue）
- 统计卡片（StatCard.vue）
- 等...

**命名规范**：PascalCase，如 `UserProfileCard.vue`

### page-templates/ - 页面模板组件

存放可复用的页面模板组件（如果有）。

**命名规范**：PascalCase + Page 后缀，如 `ListPage.vue`

## 使用示例

### 导入通用组件

```vue
<script setup>
  import CustomButton from '@/components/common/CustomButton.vue'
</script>
```

### 导入业务组件

```vue
<script setup>
  import UserCard from '@/components/business/UserCard.vue'
</script>
```

## 组件开发规范

1. **单一职责**：每个组件只负责一个功能
2. **Props 定义**：明确定义 props 类型和默认值
3. **事件命名**：使用 kebab-case，如 `@update-value`
4. **样式隔离**：使用 `<style scoped>`
5. **文档注释**：添加组件说明和使用示例
6. **TypeScript**：使用 TypeScript 定义类型

## 最佳实践

- 优先使用 Element Plus 组件，避免重复造轮子
- 业务组件应该可配置，提高复用性
- 复杂组件拆分为多个小组件
- 使用组合式 API（Composition API）
- 合理使用 props 和 emits
