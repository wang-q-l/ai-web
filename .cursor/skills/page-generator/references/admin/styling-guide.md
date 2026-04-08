# 样式规范指南

## 核心设计原则

### 卡片式布局

**所有页面必须使用卡片式布局**，这是项目的核心设计规范。

**卡片默认样式：**
- **无边框**：`border: none !important;`
- **无阴影**：`box-shadow: none !important;`
- **圆角**：`border-radius: 12px`
- **背景色**：`background: #fff`

**重要提示：** 只有在特殊说明的情况下才添加投影和边框，默认情况下卡片保持简洁的无边框无投影样式。

---

## 页面根容器

### 标准布局

```scss
.page-container {
  height: 100%;  // 继承父容器高度
  display: flex;
  flex-direction: column;
  gap: 16px;  // 卡片间距
}
```

### 关键点
- 使用 `height: 100%` 而不是 `calc(100vh - XXpx)`
- 使用 `gap` 控制卡片间距，不使用 `margin-bottom`
- 使用 `flex-direction: column` 垂直排列

## 卡片样式

### 筛选卡片

```scss
.filter-card {
  flex-shrink: 0;  // 不压缩
  border: none !important;
  box-shadow: none !important;
  border-radius: 12px;

  :deep(.el-card__body) {
    padding: 12px 20px;  // 上下12px，左右20px
  }

  .filter-form-content {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;

    :deep(.el-form-item) {
      margin-bottom: 0;
    }
  }

  .filter-buttons {
    display: flex;

    .el-button:not(:first-child) {
      margin-left: 12px;
    }
  }
}
```

### 数据卡片

```scss
.data-card {
  flex: 1;  // 占据剩余空间
  border: none !important;
  box-shadow: none !important;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  :deep(.el-card__body) {
    padding: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .table-header {
    flex-shrink: 0;
    display: flex;
    margin-bottom: 16px;

    .el-button:not(:first-child) {
      margin-left: 12px;
    }
  }

  .table-container {
    flex: 1;  // 表格占据剩余空间
    overflow: hidden;
  }

  .el-pagination {
    flex-shrink: 0;
    margin-top: 16px;
    justify-content: flex-end;
  }
}
```

### 面包屑卡片（二级页面）

```scss
.breadcrumb-card {
  flex-shrink: 0;
  border: none !important;
  box-shadow: none !important;
  border-radius: 12px;

  :deep(.el-card__body) {
    padding: 0 20px;
    height: 60px;
    display: flex;
    align-items: center;
  }

  .breadcrumb-content {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    height: 60px;

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

    .divider {
      color: #dcdfe6;
      font-size: 14px;
    }

    .page-info {
      font-size: 14px;
      color: #303133;
      font-weight: 500;
    }
  }
}
```

## 表格样式

### 基本配置

```vue
<el-table
  :data="tableData"
  height="100%"
  v-loading="loading"
>
```

### 列宽建议
- ID 列：80px
- 状态列：100px
- 时间列：180px
- 操作列：150-250px（根据按钮数量）
- 其他列：使用 `min-width` 自适应

### 固定列

```vue
<el-table-column prop="name" label="名称" width="120" fixed="left" />
<el-table-column label="操作" width="200" fixed="right" />
```

### 文本溢出

```vue
<el-table-column prop="description" label="备注" min-width="200" show-overflow-tooltip />
```

## 表单样式

### 筛选表单

```vue
<el-form :model="queryParams">
  <div class="filter-form-content">
    <el-form-item label="关键词">
      <el-input v-model="queryParams.keyword" style="width: 250px" />
    </el-form-item>

    <el-form-item label="状态">
      <el-select v-model="queryParams.status" style="width: 150px">
        <el-option label="启用" :value="1" />
        <el-option label="禁用" :value="0" />
      </el-select>
    </el-form-item>

    <el-form-item label=" ">
      <div class="filter-buttons">
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </el-form-item>
  </div>
</el-form>
```

样式：
```scss
.filter-form-content {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;

  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}
```

### 对话框表单

```vue
<el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
  <el-form-item label="名称" prop="name">
    <el-input v-model="form.name" placeholder="请输入名称" />
  </el-form-item>
  <el-form-item label="备注">
    <el-input
      v-model="form.description"
      type="textarea"
      :rows="3"
      placeholder="请输入备注"
    />
  </el-form-item>
</el-form>
```

## 按钮样式

### 按钮间距

```scss
.table-header {
  display: flex;
  margin-bottom: 16px;

  .el-button:not(:first-child) {
    margin-left: 12px;
  }
}
```

### 按钮类型
- 主要操作：`type="primary"`
- 危险操作：`type="danger"`
- 链接按钮：`link type="primary"`

### 图标按钮

```vue
<el-button type="primary" @click="handleAdd">
  <el-icon><Plus /></el-icon>
  添加
</el-button>
```

## 分页样式

```vue
<el-pagination
  v-model:current-page="pagination.page"
  v-model:page-size="pagination.pageSize"
  :total="pagination.total"
  :page-sizes="[10, 20, 50, 100]"
  layout="total, sizes, prev, pager, next, jumper"
  @size-change="fetchList"
  @current-change="fetchList"
/>
```

样式：
```scss
.el-pagination {
  flex-shrink: 0;
  margin-top: 16px;
  justify-content: flex-end;
}
```

## 对话框样式

### 基本配置

```vue
<el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" @closed="resetForm">
  <el-form>...</el-form>
  <template #footer>
    <el-button @click="dialogVisible = false">取消</el-button>
    <el-button type="primary" @click="handleSubmit">确定</el-button>
  </template>
</el-dialog>
```

### 宽度建议
- 简单表单：500-600px
- 复杂表单：700-800px
- 预览对话框：700-900px

## 二级页面滚动布局

### 核心结构

二级页面必须使用以下滚动布局结构，确保内容区域可以滚动：

```vue
<template>
  <div class="page-container">
    <!-- 1. 固定的面包屑卡片 -->
    <el-card class="breadcrumb-card">
      <!-- 面包屑内容 -->
    </el-card>

    <!-- 2. 滚动包装器 -->
    <div class="scroll-wrapper">
      <!-- 3. el-scrollbar 组件 -->
      <el-scrollbar>
        <!-- 4. 滚动内容区 -->
        <div class="scroll-content">
          <!-- 筛选卡片 -->
          <el-card class="filter-card">...</el-card>

          <!-- 数据卡片 -->
          <el-card class="data-card">...</el-card>

          <!-- 更多卡片... -->
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>
```

### 样式规范

```scss
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// 1. 固定的面包屑卡片
.breadcrumb-card {
  flex-shrink: 0;  // 不压缩，固定在顶部
  border: none !important;
  box-shadow: none !important;
  border-radius: 12px;
}

// 2. 滚动包装器
.scroll-wrapper {
  flex: 1;  // 占据剩余空间
  overflow: hidden;  // 隐藏溢出

  :deep(.el-scrollbar) {
    height: 100%;
  }

  // 4. 滚动内容区
  .scroll-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-bottom: 20px;  // 底部留白，确保内容不被裁剪
  }
}

// 滚动内容区中的卡片
.scroll-content {
  .filter-card,
  .data-card {
    flex-shrink: 0;  // 防止被压缩
  }
}
```

### 关键点

- ✅ 面包屑卡片固定在顶部，不滚动
- ✅ 使用 `el-scrollbar` 组件，不使用原生滚动条
- ✅ 滚动内容区使用 `gap: 16px` 控制卡片间距
- ✅ 底部 `padding-bottom: 20px` 确保内容不被裁剪
- ✅ 表格使用 `max-height` 而不是 `height="100%"`
- ❌ 不要把面包屑包进滚动区域
- ❌ 不要使用 `overflow-y: auto` 创建原生滚动条

### 参考示例

- 监考页面：`src/views/exam/monitor.vue`
- 成绩详情页：`src/views/exam/score-detail.vue`

---

## 左右分栏布局

```scss
.split-layout {
  display: flex;
  gap: 16px;
  height: 100%;
  overflow: hidden;

  .left-card {
    width: 280px;
    flex-shrink: 0;
    border: none !important;
    box-shadow: none !important;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    :deep(.el-card__body) {
      padding: 16px;
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .tree-container {
      flex: 1;
      overflow: auto;
    }
  }

  .right-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow: hidden;
  }
}
```

## 图标样式

```scss
.iconfont-sys {
  font-size: 18px;
}
```

使用方式：
```vue
<i class="iconfont-sys" v-html="'&#xe88a;'"></i>
```

## 颜色变量

使用 Element Plus 的 CSS 变量：

```scss
// 主色
var(--el-color-primary)

// 文本颜色
#303133  // 主要文字
#606266  // 常规文字
#909399  // 次要文字
#C0C4CC  // 占位文字

// 边框颜色
#DCDFE6  // 一级边框
#E4E7ED  // 二级边框
#EBEEF5  // 三级边框
#F2F6FC  // 四级边框
```

## 间距规范

- 卡片间距：16px（使用 `gap`）
- 表单项间距：16px（使用 `gap`）
- 按钮间距：12px（使用 `margin-left`）
- 表格与分页间距：16px（使用 `margin-top`）
- 卡片内边距：
  - 筛选卡片：12px 20px
  - 数据卡片：20px
  - 树形卡片：16px

## 响应式设计

### 表单自动换行

```scss
.filter-form-content {
  display: flex;
  flex-wrap: wrap;  // 支持换行
  gap: 16px;
  align-items: center;
}
```

### 表格滚动

```scss
.table-container {
  flex: 1;
  overflow: hidden;  // 容器不滚动

  .el-table {
    height: 100%;  // 表头固定，数据滚动
  }
}
```

## 深度选择器

使用 `:deep()` 修改 Element Plus 组件样式：

```scss
:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-form-item) {
  margin-bottom: 0;
}
```

## 最佳实践

1. **使用 Flex 布局** - 不写死高度，使用 flex 自动计算
2. **统一间距** - 使用 `gap` 而不是 `margin`
3. **卡片无边框无阴影** - 使用 `border: none !important` 和 `box-shadow: none !important`
4. **圆角统一** - 所有卡片使用 `border-radius: 12px`
5. **按钮间距** - 使用 `.el-button:not(:first-child) { margin-left: 12px; }`
6. **表格固定表头** - 使用 `height="100%"` 确保表头固定
7. **分页右对齐** - 使用 `justify-content: flex-end`
