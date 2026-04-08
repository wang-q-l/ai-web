# 移动端样式规范

## 核心设计原则

### 卡片式布局

**所有内容区域使用卡片式布局**。

**卡片默认样式：**
- **无边框**：`border: none`
- **无阴影**：`box-shadow: none`
- **圆角**：`border-radius: 12px`
- **背景色**：`background: #fff`

## 布局规范

```scss
.page-content {
  padding: 16px;
  background: #f5f7fa;
}

.content-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}
```

## 触摸优化

- 按钮最小高度：44px
- 可点击区域最小尺寸：44x44px
- 间距适当增大，方便手指操作
