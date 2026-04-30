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
│   ├── Footer.vue
│   └── ...
├── business/         # 业务组件
│   ├── UserCard.vue
│   ├── ProductCard.vue
│   └── ...
└── page-templates/   # 页面模板组件
    ├── ListPage.vue
    ├── FormPage.vue
    ├── DetailPage.vue
    └── SearchPage.vue
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
  <button :class="['custom-btn', `custom-btn--${type}`]" @click="handleClick">
    <slot />
  </button>
</template>

<script setup lang="ts">
  interface Props {
    type?: 'primary' | 'default' | 'danger'
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'default'
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

**定义**：页面布局相关的组件，如头部、底部、侧边栏等。

**适用场景**：

- 页面头部导航
- 底部信息栏
- 侧边栏菜单
- 面包屑导航

**示例**：

```vue
<!-- components/layout/AppHeader.vue -->
<template>
  <header class="app-header">
    <div class="logo">{{ title }}</div>
    <nav class="nav">
      <slot name="nav" />
    </nav>
  </header>
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
- 商品展示卡片
- 订单列表项
- 评论组件

**示例**：

```vue
<!-- components/business/UserCard.vue -->
<template>
  <div class="user-card">
    <img :src="user.avatar" class="avatar" />
    <div class="info">
      <h3>{{ user.name }}</h3>
      <p>{{ user.email }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  interface User {
    avatar: string
    name: string
    email: string
  }

  interface Props {
    user: User
  }

  defineProps<Props>()
</script>
```

### 4. page-templates/ - 页面模板组件

**定义**：可复用的页面级模板组件，提供标准化的页面结构。

**适用场景**：

- 列表页模板
- 表单页模板
- 详情页模板
- 搜索页模板

**示例**：

```vue
<!-- components/page-templates/ListPage.vue -->
<template>
  <div class="list-page">
    <div class="search-bar">
      <slot name="search" />
    </div>
    <div class="list-content">
      <slot name="list" />
    </div>
    <div class="pagination">
      <slot name="pagination" />
    </div>
  </div>
</template>
```

## 组件命名规范

### 文件命名

- 使用 PascalCase（大驼峰）
- 多个单词组合，清晰表达组件用途
- 避免使用缩写

**正确示例**：

- `CustomButton.vue`
- `UserProfileCard.vue`
- `ProductListItem.vue`

**错误示例**：

- `button.vue`（应使用 PascalCase）
- `usrCard.vue`（避免缩写）
- `comp1.vue`（名称不清晰）

### 组件名称

- 与文件名保持一致
- 使用 `<script setup>` 时，组件名自动推断

```vue
<!-- 推荐：使用 script setup -->
<script setup lang="ts">
  // 组件名自动推断为 CustomButton
</script>

<!-- 不推荐：手动定义组件名 -->
<script lang="ts">
  export default {
    name: 'CustomButton'
  }
</script>
```

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

### 3. 插槽使用

提供清晰的插槽命名：

```vue
<template>
  <div class="card">
    <div class="card-header">
      <slot name="header" />
    </div>
    <div class="card-body">
      <slot />
    </div>
    <div class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>
```

### 4. 样式隔离

使用 scoped 样式：

```vue
<style scoped>
  .card {
    border: 1px solid #eee;
    border-radius: 8px;
  }
</style>
```

### 5. 组件文档

添加组件说明注释：

```vue
<!--
  组件名称：UserCard - 用户信息卡片

  功能描述：
    展示用户基本信息，包括头像、姓名、邮箱等

  使用方式：
    <UserCard :user="userData" @click="handleClick" />

  Props:
    - user: 用户信息对象
      - avatar: 头像 URL
      - name: 用户名
      - email: 邮箱

  Events:
    - click: 点击卡片时触发
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

  // 导入页面模板
  import ListPage from '@/components/page-templates/ListPage.vue'
</script>
```

### 使用组件

```vue
<template>
  <ListPage>
    <template #search>
      <CustomButton type="primary" @click="handleSearch"> 搜索 </CustomButton>
    </template>

    <template #list>
      <UserCard v-for="user in users" :key="user.id" :user="user" @click="handleUserClick(user)" />
    </template>
  </ListPage>
</template>
```

## 最佳实践

1. **单一职责**：每个组件只负责一个功能
2. **可配置性**：通过 props 提供配置选项
3. **可扩展性**：使用插槽支持内容定制
4. **类型安全**：使用 TypeScript 定义类型
5. **样式隔离**：使用 scoped 避免样式污染
6. **文档完善**：添加清晰的注释和使用说明
7. **测试覆盖**：编写单元测试确保质量

## 组件拆分原则

### 何时拆分组件？

1. **代码超过 200 行**：考虑拆分为多个小组件
2. **重复代码**：提取为独立组件复用
3. **独立功能**：可以独立使用的功能模块
4. **复杂逻辑**：逻辑复杂时拆分便于维护

### 拆分示例

```vue
<!-- 拆分前：一个大组件 -->
<template>
  <div class="user-page">
    <div class="user-header">...</div>
    <div class="user-info">...</div>
    <div class="user-posts">...</div>
  </div>
</template>

<!-- 拆分后：多个小组件 -->
<template>
  <div class="user-page">
    <UserHeader :user="user" />
    <UserInfo :user="user" />
    <UserPosts :posts="posts" />
  </div>
</template>
```

## 常见问题

### Q: 组件应该放在哪个目录？

**A**: 根据组件的用途判断：

- 与业务无关的基础组件 → `common/`
- 页面布局相关 → `layout/`
- 特定业务功能 → `business/`
- 页面级模板 → `page-templates/`

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

### Q: 如何避免组件过度封装？

**A**: 遵循以下原则：

- 只在有复用需求时才封装
- 避免为了封装而封装
- 保持组件简单易用
- 优先使用 UI 库组件
