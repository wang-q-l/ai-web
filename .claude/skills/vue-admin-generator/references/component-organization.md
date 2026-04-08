# 组件组织规范

本文档说明如何组织和管理项目中的组件。

## 目录结构

```
src/components/
├── common/           # 通用组件
│   ├── Button.vue
│   ├── Icon.vue
│   └── ...
├── layout/           # 布局组件
│   ├── Header.vue
│   ├── Sidebar.vue
│   └── ...
├── business/         # 业务组件
│   ├── UserCard.vue
│   ├── DataTable.vue
│   └── ...
└── page-templates/   # 页面模板组件（可选）
```

## 组件分类

### 1. common/ - 通用组件

**定义**：与业务逻辑无关的基础 UI 组件，可在任何项目中复用。

**适用场景**：

- 自定义按钮、输入框等基础组件
- 图标、加载动画等视觉元素
- 空状态、错误提示等通用状态组件

**示例**：

```vue
<!-- components/common/CustomButton.vue -->
<template>
  <el-button :type="type" @click="handleClick">
    <slot />
  </el-button>
</template>

<script setup lang="ts">
  interface Props {
    type?: 'primary' | 'success' | 'warning' | 'danger'
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'primary'
  })

  const emit = defineEmits<{
    click: []
  }>()

  const handleClick = () => {
    emit('click')
  }
</script>
```

### 2. layout/ - 布局组件

**定义**：页面布局相关的组件，如头部、侧边栏等。

**适用场景**：

- 页面头部导航
- 侧边栏菜单
- 面包屑导航
- 页面容器

**示例**：

```vue
<!-- components/layout/AppHeader.vue -->
<template>
  <div class="app-header">
    <div class="logo">{{ title }}</div>
    <el-menu mode="horizontal">
      <slot name="menu" />
    </el-menu>
  </div>
</template>

<script setup lang="ts">
  interface Props {
    title: string
  }

  defineProps<Props>()
</script>
```

### 3. business/ - 业务组件

**定义**：与具体业务逻辑相关的组件，封装特定业务功能。

**适用场景**：

- 用户信息卡片
- 数据表格
- 搜索表单
- 统计卡片

**示例**：

```vue
<!-- components/business/UserCard.vue -->
<template>
  <el-card class="user-card">
    <template #header>
      <span>{{ user.name }}</span>
    </template>
    <div class="user-info">
      <p>邮箱：{{ user.email }}</p>
      <p>角色：{{ user.role }}</p>
    </div>
  </el-card>
</template>

<script setup lang="ts">
  interface User {
    name: string
    email: string
    role: string
  }

  interface Props {
    user: User
  }

  defineProps<Props>()
</script>
```

## 组件命名规范

### 文件命名

- 使用 PascalCase（大驼峰）
- 多个单词组合，清晰表达组件用途
- 避免使用缩写

**正确示例**：

- `CustomButton.vue`
- `UserProfileCard.vue`
- `DataTable.vue`

**错误示例**：

- `button.vue`（应使用 PascalCase）
- `usrCard.vue`（避免缩写）
- `comp1.vue`（名称不清晰）

## 组件开发规范

### 1. Props 定义

使用 TypeScript 定义 props 类型：

```vue
<script setup lang="ts">
  interface Props {
    title: string
    count?: number
    disabled?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    count: 0,
    disabled: false
  })
</script>
```

### 2. Emits 定义

明确声明所有事件：

```vue
<script setup lang="ts">
  const emit = defineEmits<{
    update: [value: string]
    delete: [id: number]
    change: [data: { name: string; value: any }]
  }>()
</script>
```

### 3. 样式隔离

使用 scoped 样式：

```vue
<style scoped>
  .user-card {
    padding: 20px;
    border-radius: 8px;
  }
</style>
```

### 4. 组件文档

添加组件说明注释：

```vue
<!--
  组件名称：UserCard - 用户信息卡片

  功能描述：
    展示用户基本信息

  使用方式：
    <UserCard :user="userData" />

  Props:
    - user: 用户信息对象
-->
```

## 组件使用示例

### 导入组件

```vue
<script setup lang="ts">
  // 导入通用组件
  import CustomButton from '@/components/common/CustomButton.vue'

  // 导入布局组件
  import AppHeader from '@/components/layout/AppHeader.vue'

  // 导入业务组件
  import UserCard from '@/components/business/UserCard.vue'
</script>
```

### 使用组件

```vue
<template>
  <div>
    <AppHeader title="管理后台">
      <template #menu>
        <el-menu-item>首页</el-menu-item>
      </template>
    </AppHeader>

    <UserCard :user="userData" />

    <CustomButton type="primary" @click="handleClick"> 提交 </CustomButton>
  </div>
</template>
```

## 最佳实践

1. **优先使用 Element Plus 组件**：避免重复造轮子
2. **单一职责**：每个组件只负责一个功能
3. **可配置性**：通过 props 提供配置选项
4. **类型安全**：使用 TypeScript 定义类型
5. **样式隔离**：使用 scoped 避免样式污染
6. **文档完善**：添加清晰的注释和使用说明

## 组件拆分原则

### 何时拆分组件？

1. **代码超过 200 行**：考虑拆分为多个小组件
2. **重复代码**：提取为独立组件复用
3. **独立功能**：可以独立使用的功能模块
4. **复杂逻辑**：逻辑复杂时拆分便于维护

## 常见问题

### Q: 组件应该放在哪个目录？

**A**: 根据组件的用途判断：

- 与业务无关的基础组件 → `common/`
- 页面布局相关 → `layout/`
- 特定业务功能 → `business/`

### Q: 组件太多怎么办？

**A**: 在各目录下继续细分子目录：

```
components/
└── business/
    ├── user/
    │   ├── UserCard.vue
    │   └── UserList.vue
    └── product/
        ├── ProductCard.vue
        └── ProductList.vue
```
