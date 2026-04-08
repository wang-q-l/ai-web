# 通用开发规范

## 项目技术栈

- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **UI 组件库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **样式**: SCSS

## 核心开发规范

### 组件导入

- 所有组件都是自动导入，无需手动导入
- Vue API（ref、computed、watch 等）自动导入
- Element Plus 组件按需自动导入
- 类型定义自动生成在 `src/types/` 目录

### 国际化规范

- **页面内容统一使用中文** - 标签、按钮、提示信息等直接使用中文
- **只有菜单名称需要多语言** - 路由配置中的 `meta.title` 使用翻译键
- **不要导入 useI18n** - 页面组件中不需要国际化函数

示例：

```vue
<!-- ✅ 正确：直接使用中文 -->
<el-form-item label="用户名称">
  <el-input placeholder="请输入用户名称" />
</el-form-item>
<el-button>保存</el-button>

<!-- ❌ 错误：使用国际化函数 -->
<el-form-item :label="$t('user.name')">
  <el-input :placeholder="$t('user.enterName')" />
</el-form-item>
```

### 页面组件规范

- 使用 `<script setup>` 和 `defineOptions`
- 页面组件放在 `src/views/` 对应目录
- 使用 TypeScript 严格模式

### Mock 数据规范

- **项目使用手动 Mock 模式**，不使用 vite-plugin-mock 自动拦截
- Mock 文件需要导出具体的 Mock 函数，而不是 MockMethod 数组
- API 文件中需要判断 `USE_MOCK` 环境变量，手动调用 Mock 函数
- Mock 数据使用固定数据，不使用随机数据
- Mock API 延迟 300ms 返回结果

### API 请求方法规范

- **正确使用方式**：使用 `request.get()`、`request.post()`、`request.put()`、`request.del()` 方法
- **错误使用方式**：不要使用 `request()` 直接调用或使用 `method` 参数

示例：

```typescript
// ✅ 正确
export function getList(params: ListParams) {
  return request.get<{ list: Item[]; total: number }>({
    url: '/admin/list',
    params
  })
}

// ❌ 错误
export function getList(params: ListParams) {
  return request({
    url: '/admin/list',
    method: 'get', // 不要使用 method 参数
    params
  })
}
```

### 类型定义规范

- 类型定义统一放在 `src/types/` 目录下，按模块分文件
- **查询参数类型定义**：状态、类型、难度等筛选字段需要支持 `number | string | null` 类型
  - 原因：从 URL 查询参数传过来的值可能是字符串类型
  - 在 Mock 函数中需要进行类型转换：`typeof value === 'string' ? parseInt(value) : value`

示例：

```typescript
/**
 * 列表查询参数
 */
export interface ListParams {
  name?: string
  status?: number | string | null // 支持 number | string | null
  type?: number | string | null // 支持 number | string | null
  page: number
  pageSize: number
}
```

### API 函数命名规范

- 遵循 RESTful 风格：get/add/update/delete + 资源名称
- 批量操作：batch + 操作 + 资源名称（如 `batchDeleteItems`）

### 清理脚本规范

- **清理脚本已固定**：`scripts/clean-demo-modules.js` 已配置好保留的模块列表
- **实现新功能时不需要更新清理脚本**

## 页面布局核心原则

### 布局原则

1. **纯 Flex 布局** - 不写死页面高度，完全使用 flex 自动计算
2. **固定高度** - `.layout-content` 使用 `height: 100%` 确保页面不滚动
3. **统一内边距** - `.layout-content` 使用 `padding: 0 20px 0`（左右20px）
4. **底部空隙** - `.art-page-view` 使用 `padding-bottom: 20px`
5. **高度继承** - 页面组件使用 `height: 100%` 继承父容器高度
6. **自动撑满** - 数据卡片使用 `flex: 1` 自动占满剩余空间

### 页面根容器

```scss
.page-container {
  height: 100%; // 继承父容器高度
  display: flex;
  flex-direction: column;
  gap: 16px; // 卡片间距
}
```

### 卡片样式规范

- 无边框：`border: none !important;`
- 无阴影：`box-shadow: none !important;`
- 圆角：`border-radius: 12px`
- 筛选卡片 padding：`12px 20px`（上下12px，左右20px）
- 数据卡片 padding：`20px`
- 卡片内表单项：`margin-bottom: 0`

### 间距规范

- 卡片间距：使用 `gap: 16px`，不使用 `margin-bottom`
- 表单项间距：使用 `gap: 16px`
- 按钮间距：使用 `.el-button:not(:first-child) { margin-left: 12px; }`
- 表格与分页间距：`margin-top: 16px`

## 组件使用规范

### 滚动条组件

- **必须使用 Element Plus 的 `el-scrollbar` 组件**，不使用原生浏览器滚动条
- **适用场景**：所有需要滚动的内容区域（表单页面、详情页面、长列表等）
- **基本用法**：

  ```vue
  <template>
    <div class="page-container">
      <!-- 固定内容（如面包屑）放在外面 -->
      <el-card class="breadcrumb-card">
        <!-- 面包屑内容 -->
      </el-card>

      <!-- 需要滚动的内容包裹在 el-scrollbar 中 -->
      <el-scrollbar class="content-scrollbar">
        <!-- 可滚动的内容 -->
      </el-scrollbar>
    </div>
  </template>

  <style scoped lang="scss">
    .page-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .content-scrollbar {
      flex: 1;
      overflow: hidden;

      :deep(.el-scrollbar__view) {
        padding-bottom: 20px; // 底部留白
      }
    }
  </style>
  ```

**关键点**：

- 固定内容（如面包屑、顶部操作栏）放在 `el-scrollbar` 外面
- 可滚动内容包裹在 `el-scrollbar` 内
- 滚动容器使用 `flex: 1` 占据剩余空间
- 滚动视图底部添加 `padding-bottom: 20px` 确保底部有空隙
- ❌ 错误：使用 `overflow-y: auto` 创建原生滚动条
- ✅ 正确：使用 `<el-scrollbar>` 组件

### 表格组件

- 使用 Element Plus 的 ElTable，不使用项目内 artTable 组件
- **表格边框**：默认不使用 `border` 属性，表格只有横向分隔线，没有竖边框
  - ✅ 正确：`<el-table :data="tableData" height="100%">`
  - ❌ 错误：`<el-table :data="tableData" height="100%" border>`
  - 除非特殊说明需要完整边框，否则都不添加 `border` 属性
- 表头固定：给 ElTable 添加 `height="100%"` 属性
- 表格容器：设置 `flex: 1; overflow: hidden;`
- 树形表格：使用 `row-key="id"` 和 `:tree-props="{ children: 'children' }"`
- 列宽建议：操作列 200px，状态列 100px，时间列 180px
- 表头不能滚动，数据滚动

### 按钮规范

**按钮分类**：

- **操作按钮**：面包屑区域、卡片头部的功能按钮（如"保存草稿"、"发布考试"、"创建考试"）
- **表格按钮**：表格操作列中的按钮（如"编辑"、"删除"、"查看详情"）
- **返回按钮**：面包屑左侧的返回按钮

**按钮间距**：

- 按钮组使用 `.el-button:not(:first-child) { margin-left: 12px; }` 控制间距
- 不使用 `gap` 属性，因为按钮本身有 `margin-left: 12px`

**按钮类型**：

- 主要操作：`type="primary"`（如"搜索"、"保存"、"确定"）
- 次要操作：不设置 type（如"重置"、"取消"）
- 危险操作：`type="danger"`（如"删除"）
- 成功操作：`type="success"`（如"发布"）
- 警告操作：`type="warning"`（如"警告"、"发布考试"）

**按钮尺寸**：

- 默认尺寸：不设置 size（用于表单、筛选区域、操作按钮）
- 小尺寸：`size="small"`（用于特殊场景）
- 大尺寸：`size="large"`（用于重要的主操作）

**按钮图标**：

- 使用 Element Plus 图标：`<el-icon><Plus /></el-icon>`
- 图标位置：图标在文字左侧

**⚠️ 操作按钮规范**（面包屑区域、卡片头部）：

- **保持 Element Plus 默认样式**，不添加自定义的 font-size、color、padding 等样式
- **不添加 `size` 属性**（保持默认尺寸）
- 根据操作性质设置 `type` 属性
- 可以添加图标使用 `:icon` 属性
- ❌ 错误：给操作按钮添加自定义样式
  ```scss
  // ❌ 错误：不要这样写
  .breadcrumb-content .el-button {
    font-size: 14px;
    color: #606266;
    padding: 0;
  }
  ```
- ✅ 正确：只给特定按钮（如返回按钮）添加样式
  ```scss
  // ✅ 正确：使用精确的选择器
  .breadcrumb-left .el-button {
    font-size: 14px;
    color: #606266;
    padding: 0;
  }
  ```

**⚠️ 表格操作列按钮规范**：

- **必须使用 `link` 类型**，不使用 `text` 类型
- **不添加 `size` 属性**（保持默认尺寸）
- 根据操作性质设置 `type` 属性
- Element Plus 的 `link` 类型按钮自带合适的间距
- 示例：
  ```vue
  <el-table-column label="操作" width="200" fixed="right">
    <template #default="{ row }">
      <el-button link @click="handleEdit(row)">
        编辑
      </el-button>
      <el-button link type="danger" @click="handleDelete(row)">
        删除
      </el-button>
      <el-button link type="primary" @click="handleView(row)">
        查看详情
      </el-button>
    </template>
  </el-table-column>
  ```
- ❌ 错误：`<el-button text size="small">` 或 `<el-button link size="small">`
- ✅ 正确：`<el-button link>`

**返回按钮规范**（面包屑左侧）：

- 使用 `text` 类型
- 可以添加自定义样式，但 CSS 选择器必须精确，避免影响其他按钮
- 示例：

  ```scss
  .breadcrumb-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .el-button {
      font-size: 14px;
      color: #606266;
      padding: 0;

      &:hover {
        color: var(--el-color-primary);
      }

      .el-icon {
        font-size: 16px;
      }
    }
  }
  ```

### 拖动排序规范

使用 `vue-draggable-plus` 库实现拖动排序功能。

**基本用法**：

```vue
<VueDraggable
  v-model="list"
  :animation="200"
  handle=".drag-handle"
  @end="handleDragEnd"
  class="draggable-container"
>
  <el-card v-for="item in list" :key="item.id">
    <span class="drag-handle" style="cursor: move; margin-right: 8px; color: #909399">
      ☰
    </span>
    <span>{{ item.name }}</span>
  </el-card>
</VueDraggable>
```

**关键配置**：

- `v-model`：绑定数据列表
- `:animation="200"`：拖动动画时长（毫秒）
- `handle=".drag-handle"`：指定拖动手柄的 CSS 选择器
- `@end`：拖动结束事件，用于保存排序

**注意事项**：

- 必须为每个项目设置唯一的 `key`（通常使用 `id`）
- 拖动手柄使用 `☰` 符号（Unicode: U+2630）
- 拖动结束后需要更新每个项目的 `order` 字段
- 建议在拖动结束后调用 API 保存新的排序

### 图标使用

- 使用 `iconfont-sys` 类显示图标，不使用 `iconfont` 类
- 图标代码使用 HTML 实体格式（如 `&#xe88a;`）
- 在 template 中使用 `v-html` 渲染：`<i class="iconfont-sys" v-html="icon"></i>`
- 图标字体大小一般设置为 18px

### 表单组件

- 筛选表单不使用 `inline` 属性，使用自定义 flexbox 布局
- 表单项容器使用 `gap: 16px` 控制间距
- 按钮的 form-item 使用 `label=" "` 确保对齐
- 支持多行自动换行（`flex-wrap: wrap`）

## 路径别名

```typescript
'@' → 'src/'
'@views' → 'src/views'
'@imgs' → 'src/assets/img'
'@icons' → 'src/assets/icons'
'@utils' → 'src/utils'
'@stores' → 'src/store'
'@plugins' → 'src/plugins'
'@styles' → 'src/assets/styles'
```

## 开发流程

1. 在 `src/router/modules/` 添加路由配置
2. 在 `src/router/index.ts` 注册路由
3. 在 `src/views/` 创建页面组件
4. 在 `src/locales/zh.json` 和 `en.json` 添加菜单翻译
5. 开发完成后运行 `pnpm build` 验证代码是否合规

## 注意事项

- 开发完不要 `npm run dev`，由用户自行 dev
- 但是需要 build 一下验证代码是否合规，没有报错
- Mock 模式必须保持启用（`.env` 中 `VITE_USE_MOCK = true`）
- 一级菜单 component 固定为 `() => import('@/views/index/index.vue')`
