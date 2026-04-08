# Mock 数据配置规范

## 方案说明

采用 **Mock.js 前端拦截** 方案，无需额外的 Mock 服务器，开发和生产环境都使用同一套 Mock 配置。

## 配置步骤

### 1. 安装依赖

在 `package.json` 的 `dependencies` 中添加：

```json
{
  "dependencies": {
    "mockjs": "^1.1.0"
  }
}
```

### 2. 创建 Mock 配置文件

在 `src/mock.ts` 中配置所有 Mock 接口：

```typescript
import Mock from 'mockjs'

// 配置 Mock
Mock.setup({
  timeout: '200-600' // 模拟网络延迟
})

// Mock 开关（默认开启，手动修改为 false 可关闭）
const MOCK_ENABLED = true

if (MOCK_ENABLED) {
  // 登录接口
  Mock.mock(/\/user\/login/, 'post', () => {
    return {
      code: 200,
      data: {
        token: 'mock-token-' + Date.now()
      },
      message: '登录成功'
    }
  })

  // 用户信息接口
  Mock.mock(/\/user\/info/, 'get', () => {
    return {
      code: 200,
      data: {
        username: 'admin',
        nickname: '管理员',
        avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
      }
    }
  })

  // 列表接口示例
  Mock.mock(/\/api\/list/, 'get', () => {
    return {
      code: 200,
      data: {
        list: Mock.mock({
          'list|10': [
            {
              'id|+1': 1,
              name: '@cname',
              email: '@email',
              createTime: '@datetime'
            }
          ]
        }).list,
        total: 100
      }
    }
  })

  console.log('[Mock] Mock 数据已启用')
} else {
  console.log('[Mock] Mock 数据已关闭，使用真实接口')
}
```

### 3. 在 main.ts 中导入

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import './mock' // 导入 Mock 配置

const app = createApp(App)
app.mount('#app')
```

### 4. Vite 配置

`vite.config.ts` 必须包含 `base: '/'`：

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  base: '/', // 必须配置
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    host: true,
    open: true
  }
})
```

## Mock 开关说明

- **默认状态**：Mock 永远开启（`MOCK_ENABLED = true`）
- **关闭方式**：手动修改 `src/mock.ts` 中的 `MOCK_ENABLED` 为 `false`
- **使用场景**：
  - 开发环境：使用 Mock 数据
  - 生产环境：使用 Mock 数据（演示项目）
  - 对接真实后端：手动关闭 Mock 开关

## Mock.js 常用语法

### 基础数据类型

```typescript
Mock.mock({
  string: '@string',
  number: '@integer(1, 100)',
  boolean: '@boolean',
  date: '@date',
  datetime: '@datetime',
  now: '@now'
})
```

### 中文数据

```typescript
Mock.mock({
  name: '@cname', // 中文姓名
  title: '@ctitle', // 中文标题
  sentence: '@csentence', // 中文句子
  paragraph: '@cparagraph' // 中文段落
})
```

### 网络相关

```typescript
Mock.mock({
  email: '@email',
  url: '@url',
  ip: '@ip',
  domain: '@domain'
})
```

### 图片

```typescript
Mock.mock({
  avatar: '@image("200x200", "#50B347", "#FFF", "Avatar")',
  cover: '@image("800x600")'
})
```

### 数组

```typescript
Mock.mock({
  'list|10': [
    {
      // 生成 10 条数据
      'id|+1': 1, // id 自增
      name: '@cname',
      'age|18-60': 1 // 18-60 之间的随机数
    }
  ]
})
```

### 获取请求参数

```typescript
Mock.mock(/\/api\/detail/, 'get', (options) => {
  const url = new URL(options.url, 'http://localhost')
  const id = url.searchParams.get('id')

  return {
    code: 200,
    data: {
      id: id,
      name: Mock.mock('@cname')
    }
  }
})
```

## 注意事项

1. **路径匹配**：确保 Mock 路径与实际 API 路径匹配
2. **请求方法**：指定正确的 HTTP 方法（'get', 'post', 'put', 'delete'）
3. **生产环境**：Mock.js 会被打包到生产环境，增加约 375KB 的体积
4. **性能影响**：Mock.js 使用 eval，仅用于演示项目

## 参考资源

- [Mock.js 官方文档](http://mockjs.com/)
- [Mock.js 示例](http://mockjs.com/examples.html)
