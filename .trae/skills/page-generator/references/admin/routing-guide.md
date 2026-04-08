# 路由配置指南

## 路由文件位置

- 路由模块：`src/router/modules/`
- 路由注册：`src/router/index.ts`
- 静态路由：`src/router/staticRoutes.ts`

## 一级菜单路由配置

### 基本结构

```typescript
import type { AppRouteRecord } from '@/types'

export const exampleRoutes: AppRouteRecord = {
  path: '/example',
  name: 'Example',
  component: () => import('@/views/index/index.vue'),  // 固定写法
  meta: {
    title: 'menus.example.title',  // 菜单翻译键
    icon: '&#xe88a;',  // 图标 Unicode
    isFirstLevel: true  // 标识为一级菜单
  },
  children: [
    {
      path: '',  // 空字符串
      name: 'ExamplePage',
      component: () => import('@/views/example/index.vue'),
      meta: {
        title: 'menus.example.title',
        keepAlive: true,  // 页面缓存
        isHide: true  // 隐藏子路由，避免菜单重复
      }
    }
  ]
}
```

### 关键点

1. **父路由 component 固定写法**
   ```typescript
   component: () => import('@/views/index/index.vue')
   ```

2. **子路由 path 为空字符串**
   ```typescript
   path: ''
   ```

3. **⚠️ 重要：子路由路径必须包含 `/` 字符**
   - ❌ 错误：`path: 'create'` - 会导致父菜单被过滤掉
   - ✅ 正确：`path: 'create/new'` - 父菜单正常显示
   - **原因**：菜单构建器使用 `!relativePath.includes('/')` 判断是否为直接子路由。不包含 `/` 的路径会被识别为直接子路由，导致父菜单因所有子路由都隐藏而被过滤掉
   - **规则**：所有带 `isHide: true` 的子路由，路径必须包含 `/`（如 `detail/:id`、`edit/:id`、`create/new`）
   - **示例**：
     ```typescript
     children: [
       {
         path: '',  // 空路径子路由，正常
         name: 'ExamplePage',
         component: () => import('@/views/example/index.vue'),
         meta: { isHide: true }
       },
       {
         path: 'create/new',  // ✅ 正确：包含 /
         name: 'ExampleCreate',
         component: () => import('@/views/example/create.vue'),
         meta: { isHide: true }
       },
       {
         path: 'edit/:id',  // ✅ 正确：包含 /
         name: 'ExampleEdit',
         component: () => import('@/views/example/create.vue'),
         meta: { isHide: true }
       }
     ]
     ```

4. **meta 配置**
   - `title` - 使用翻译键（如 `menus.example.title`）
   - `icon` - 使用 HTML 实体格式（如 `&#xe88a;`）
   - `isFirstLevel: true` - 标识为一级菜单
   - `isHide: true` - 子路由需要隐藏
   - `keepAlive: true` - 启用页面缓存

## 二级页面路由配置

### 基本结构

```typescript
export const questionBankRoutes: AppRouteRecord = {
  path: '/question-bank',
  name: 'QuestionBank',
  component: () => import('@/views/index/index.vue'),
  meta: {
    title: 'menus.questionBank.title',
    icon: '&#xe7ae;',
    isFirstLevel: true
  },
  children: [
    {
      path: '',
      name: 'QuestionBankList',
      component: () => import('@/views/question-bank/index.vue'),
      meta: {
        title: 'menus.questionBank.title',
        keepAlive: true,
        isHide: true
      }
    },
    {
      path: 'questions/:bankId',  // 带参数的路径
      name: 'QuestionManagement',
      component: () => import('@/views/question-bank/question-list.vue'),
      meta: {
        title: 'menus.questionBank.questionManagement',
        keepAlive: true,
        isHide: true,
        activePath: '/question-bank'  // 指定激活的菜单路径
      }
    }
  ]
}
```

### 关键点

1. **路由参数**
   ```typescript
   path: 'questions/:bankId'
   ```

2. **activePath 配置**
   ```typescript
   activePath: '/question-bank'
   ```
   确保访问二级页面时，一级菜单保持高亮状态。

3. **页面中获取参数**
   ```typescript
   import { useRoute } from 'vue-router'

   const route = useRoute()
   const bankId = Number(route.params.bankId)
   ```

4. **返回上级页面**
   ```typescript
   import { useRouter } from 'vue-router'

   const router = useRouter()

   const handleBack = () => {
     router.push({ name: 'QuestionBankList' })
   }
   ```

## 新窗口打开配置

### 路由配置

```typescript
export const exampleRoutes: AppRouteRecord = {
  path: '/example',
  name: 'Example',
  component: () => import('@/views/index/index.vue'),
  meta: {
    title: 'menus.example.title',
    icon: '&#xe88a;',
    isFirstLevel: true,
    openInNewWindow: true,  // 启用新窗口打开
    newWindowPath: '/example-full'  // 新窗口路径
  },
  children: [
    {
      path: '',
      name: 'ExamplePage',
      component: () => import('@/views/example/index.vue'),
      meta: {
        title: 'menus.example.title',
        keepAlive: true,
        isHide: true
      }
    }
  ]
}
```

### 静态路由配置

在 `src/router/staticRoutes.ts` 中添加全屏路由：

```typescript
{
  path: '/example-full',
  name: 'ExampleFull',
  component: () => import('@views/example/index.vue'),
  meta: {
    title: 'menus.example.title',
    isHideTab: true,  // 隐藏标签页
    isFullPage: true,  // 全屏页面
    isHide: true  // 隐藏菜单
  }
}
```

## 路由注册

在 `src/router/index.ts` 中注册路由：

```typescript
import { exampleRoutes } from './modules/example'

// 动态路由列表
const dynamicRoutes: AppRouteRecord[] = [
  exampleRoutes,
  // ... 其他路由
]
```

## 菜单翻译配置

### 中文翻译（src/locales/zh.json）

```json
{
  "menus": {
    "example": {
      "title": "示例管理",
      "detail": "示例详情"
    }
  }
}
```

### 英文翻译（src/locales/en.json）

```json
{
  "menus": {
    "example": {
      "title": "Example Management",
      "detail": "Example Detail"
    }
  }
}
```

## 路由守卫

路由守卫已在 `src/router/index.ts` 中配置，主要功能：

- 认证检查
- 权限控制
- 页面标题设置
- 进度条显示

## 常见问题

### 1. 菜单不显示
- **检查子路由路径是否包含 `/`**：如果子路由路径不包含 `/`（如 `path: 'create'`），会导致父菜单被过滤掉。应改为包含 `/` 的路径（如 `path: 'create/new'` 或 `path: 'edit/:id'`）
- 检查 `isHide` 是否设置正确
- 检查路由是否正确注册
- 检查翻译文件是否配置

### 2. 二级页面菜单不高亮
- 确保配置了 `activePath`
- `activePath` 值应为一级菜单的路径

### 3. 页面缓存不生效
- 确保配置了 `keepAlive: true`
- 确保组件使用了 `defineOptions({ name: 'ComponentName' })`

### 4. 路由参数获取失败
- 使用 `useRoute()` 而不是 `this.$route`
- 参数类型转换：`Number(route.params.id)`

## 最佳实践

1. **路由命名规范**
   - 使用 PascalCase 命名
   - 名称应具有描述性
   - 避免使用缩写

2. **路径规范**
   - 使用 kebab-case
   - 路径应简洁明了
   - 避免过深的嵌套

3. **组件懒加载**
   - 所有路由组件使用动态导入
   - 使用路径别名简化导入路径

4. **Meta 配置**
   - 必要的 meta 信息应完整配置
   - 使用翻译键而不是硬编码文本
   - 合理使用 keepAlive 避免性能问题
