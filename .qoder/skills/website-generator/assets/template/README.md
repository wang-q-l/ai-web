# Vue3 Website Template

基于 Vue3 + Element Plus + Vite + TypeScript 的企业官网前台模板。

## 技术栈

- Vue 3 - 渐进式 JavaScript 框架
- Element Plus - Vue 3 组件库
- Vite - 下一代前端构建工具
- TypeScript - JavaScript 的超集
- Vue Router - Vue.js 官方路由
- Pinia - Vue 状态管理库
- Mock.js - 模拟数据生成

## 项目结构

```
template/
├── src/
│   ├── components/        # 组件目录
│   │   ├── common/       # 通用组件
│   │   ├── layout/       # 布局组件
│   │   ├── business/     # 业务组件
│   │   └── page-templates/ # 页面模板组件
│   ├── layout/           # 布局文件
│   │   ├── Header.vue    # 顶部导航
│   │   ├── Footer.vue    # 页脚
│   │   └── MainLayout.vue # 主布局
│   ├── router/           # 路由配置
│   │   ├── index.ts      # 主路由文件
│   │   └── modules/      # 路由模块
│   │       ├── base.ts   # 基础路由（登录、注册）
│   │       ├── public.ts # 公开路由（首页、产品等）
│   │       └── user.ts   # 用户路由（需要登录）
│   ├── views/            # 页面视图
│   │   ├── auth/         # 认证页面
│   │   └── user/         # 用户中心页面
│   ├── stores/           # 状态管理
│   ├── styles/           # 样式文件
│   │   ├── variables.css # CSS 变量
│   │   └── main.css      # 全局样式
│   ├── config/           # 配置文件
│   │   ├── menu.ts       # 菜单配置
│   │   └── site.ts       # 网站配置
│   ├── utils/            # 工具函数
│   ├── api/              # API 接口
│   ├── mock/             # Mock 数据
│   ├── App.vue           # 根组件
│   └── main.ts           # 入口文件
├── index.html            # HTML 模板
├── package.json          # 项目配置
├── vite.config.ts        # Vite 配置
├── tsconfig.json         # TypeScript 配置
└── tsconfig.node.json    # Node TypeScript 配置
```

## 功能特性

### 公开页面
- 首页 - 展示企业形象和核心特性
- 产品中心 - 产品展示
- 解决方案 - 解决方案展示
- 新闻动态 - 新闻列表
- 关于我们 - 公司介绍
- 联系我们 - 联系方式和在线留言

### 用户中心（需要登录）
- 个人资料 - 查看和编辑个人信息
- 订单管理 - 查看订单列表
- 我的收藏 - 管理收藏的内容
- 消息通知 - 查看系统消息

### 认证功能
- 用户登录
- 用户注册
- 路由守卫（自动跳转到登录页）

## 安装使用

### 安装依赖

\`\`\`bash
npm install
\`\`\`

### 开发模式

\`\`\`bash
npm run dev
\`\`\`

访问 http://localhost:3000

### 构建生产版本

\`\`\`bash
npm run build
\`\`\`

### 预览生产版本

\`\`\`bash
npm run preview
\`\`\`

## 配置说明

### 网站配置

编辑 `src/config/site.ts` 修改网站基本信息：

- 网站名称
- Logo
- 公司信息
- 联系方式
- ICP 备案号

### 菜单配置

编辑 `src/config/menu.ts` 修改导航菜单：

- 主导航菜单
- 用户中心菜单

### 样式定制

编辑 `src/styles/variables.css` 修改 CSS 变量：

- 主题色
- 文字颜色
- 边框颜色
- 背景色
- 布局尺寸
- 间距
- 圆角
- 阴影

## 路由说明

### 公开路由
- `/` - 首页
- `/products` - 产品中心
- `/solutions` - 解决方案
- `/news` - 新闻动态
- `/about` - 关于我们
- `/contact` - 联系我们

### 认证路由
- `/login` - 登录
- `/register` - 注册

### 用户路由（需要登录）
- `/user/profile` - 个人资料
- `/user/orders` - 订单管理
- `/user/favorites` - 我的收藏
- `/user/messages` - 消息通知

## 开发建议

1. 组件开发：在 `src/components` 目录下创建可复用组件
2. 页面开发：在 `src/views` 目录下创建页面组件
3. API 接口：在 `src/api` 目录下定义接口
4. Mock 数据：在 `src/mock` 目录下创建 Mock 数据
5. 工具函数：在 `src/utils` 目录下创建工具函数

## 注意事项

- 本模板使用 TypeScript，建议遵循 TypeScript 最佳实践
- 使用 Element Plus 组件时，参考官方文档
- 路由守卫已配置，需要登录的页面会自动跳转到登录页
- 用户信息存储在 Pinia store 中，刷新页面会保持登录状态

## License

MIT
