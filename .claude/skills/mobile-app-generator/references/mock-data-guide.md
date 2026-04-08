# Mock 数据指南

本文档介绍如何配置和使用 Mock 数据。

## Mock 文件结构

```
mock/
├── user.ts       # 用户相关接口
├── product.ts    # 商品相关接口
└── order.ts      # 订单相关接口（可选）
```

## 基本配置

### vite.config.ts 配置

```typescript
import { defineConfig } from 'vite'
import { viteMockServe } from 'vite-plugin-mock'

export default defineConfig({
  plugins: [
    viteMockServe({
      mockPath: 'mock', // mock 文件目录
      enable: true // 是否启用
    })
  ]
})
```

## Mock 文件编写

### 基本格式

```typescript
import { MockMethod } from 'vite-plugin-mock'

export default [
  {
    url: '/api/example',     // 接口地址
    method: 'get',           // 请求方法
    response: () => {        // 响应数据
      return {
        code: 200,
        data: { ... },
        message: 'success',
      }
    },
  },
] as MockMethod[]
```

### 用户接口示例

```typescript
// mock/user.ts
import { MockMethod } from 'vite-plugin-mock'

export default [
  // 登录
  {
    url: '/api/login',
    method: 'post',
    response: ({ body }: any) => {
      const { username, password } = body
      if (username === 'admin' && password === '123456') {
        return {
          code: 200,
          data: {
            token: 'mock-token-' + Date.now(),
            userInfo: {
              id: 1,
              username: 'admin',
              nickname: '管理员',
              avatar: 'https://via.placeholder.com/80'
            }
          },
          message: '登录成功'
        }
      } else {
        return {
          code: 400,
          data: null,
          message: '用户名或密码错误'
        }
      }
    }
  },
  // 获取用户信息
  {
    url: '/api/user/info',
    method: 'get',
    response: () => {
      return {
        code: 200,
        data: {
          id: 1,
          username: 'admin',
          nickname: '管理员',
          avatar: 'https://via.placeholder.com/80',
          email: 'admin@example.com',
          phone: '13800138000'
        },
        message: '获取成功'
      }
    }
  }
] as MockMethod[]
```

### 商品接口示例

```typescript
// mock/product.ts
import { MockMethod } from 'vite-plugin-mock'
import Mock from 'mockjs'

export default [
  // 商品列表（分页）
  {
    url: '/api/products/list',
    method: 'get',
    response: ({ query }: any) => {
      const { page = 1, pageSize = 10 } = query
      const total = 50

      const list = Mock.mock({
        [`list|${pageSize}`]: [
          {
            'id|+1': (Number(page) - 1) * Number(pageSize) + 1,
            title: '@ctitle(5, 15)',
            desc: '@csentence(10, 30)',
            'price|10-500.2': 1,
            image: 'https://via.placeholder.com/80',
            'stock|10-1000': 1
          }
        ]
      })

      return {
        code: 200,
        data: {
          list: list.list,
          total,
          page: Number(page),
          pageSize: Number(pageSize),
          hasMore: Number(page) * Number(pageSize) < total
        },
        message: '获取成功'
      }
    }
  },
  // 商品详情
  {
    url: '/api/products/detail',
    method: 'get',
    response: ({ query }: any) => {
      const { id } = query
      return {
        code: 200,
        data: Mock.mock({
          id: Number(id),
          title: '@ctitle(5, 15)',
          desc: '@cparagraph(3, 5)',
          'price|10-500.2': 1,
          image: 'https://via.placeholder.com/300',
          'stock|10-1000': 1,
          'sales|100-10000': 1,
          images: [
            'https://via.placeholder.com/300',
            'https://via.placeholder.com/300',
            'https://via.placeholder.com/300'
          ]
        }),
        message: '获取成功'
      }
    }
  }
] as MockMethod[]
```

## 移动端数据格式

### 列表数据格式

```typescript
{
  code: 200,
  data: {
    list: [...],           // 列表数据
    total: 50,             // 总数
    page: 1,               // 当前页
    pageSize: 10,          // 每页数量
    hasMore: true,         // 是否还有更多（重要）
  },
  message: 'success',
}
```

### 详情数据格式

```typescript
{
  code: 200,
  data: {
    id: 1,
    title: '商品名称',
    desc: '商品描述',
    price: 99.99,
    images: ['url1', 'url2'],
    // 其他字段...
  },
  message: 'success',
}
```

### 操作结果格式

```typescript
{
  code: 200,
  data: null,
  message: '操作成功',
}
```

## Mock.js 使用

### 安装

```bash
npm install mockjs -D
```

### 基本语法

```typescript
import Mock from 'mockjs'

// 生成随机数据
const data = Mock.mock({
  // 字符串
  title: '@ctitle(5, 15)', // 中文标题，5-15 个字
  name: '@cname', // 中文姓名
  email: '@email', // 邮箱
  url: '@url', // URL

  // 数字
  'age|18-60': 1, // 18-60 之间的整数
  'price|10-500.2': 1, // 10-500 之间的小数，保留 2 位

  // 布尔值
  'isVip|1': true, // 随机布尔值

  // 日期
  date: '@date', // 日期
  time: '@time', // 时间
  datetime: '@datetime', // 日期时间

  // 图片
  image: '@image(200x200)', // 图片

  // 数组
  'list|10': [
    // 生成 10 个元素
    {
      'id|+1': 1, // 自增 id
      title: '@ctitle'
    }
  ]
})
```

### 常用占位符

```typescript
// 中文
'@ctitle' // 中文标题
'@cname' // 中文姓名
'@csentence' // 中文句子
'@cparagraph' // 中文段落

// 英文
'@title' // 英文标题
'@name' // 英文姓名
'@sentence' // 英文句子
'@paragraph' // 英文段落

// 数字
'@integer(1, 100)' // 1-100 的整数
'@float(1, 100, 2)' // 1-100 的小数，2 位小数

// 日期
'@date' // 日期 YYYY-MM-DD
'@time' // 时间 HH:mm:ss
'@datetime' // 日期时间
'@now' // 当前时间

// 图片
'@image(200x200)' // 200x200 的图片
'@image(200x200, #ff0000)' // 带背景色

// 其他
'@email' // 邮箱
'@url' // URL
'@ip' // IP 地址
'@id' // ID
'@guid' // GUID
```

## 延迟响应

### 固定延迟

```typescript
{
  url: '/api/example',
  method: 'get',
  timeout: 1000,  // 延迟 1 秒
  response: () => ({ ... }),
}
```

### 随机延迟

```typescript
{
  url: '/api/example',
  method: 'get',
  response: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          data: { ... },
        })
      }, Math.random() * 2000)  // 0-2 秒随机延迟
    })
  },
}
```

## 请求参数处理

### GET 请求参数

```typescript
{
  url: '/api/products/list',
  method: 'get',
  response: ({ query }: any) => {
    const { page, pageSize, keyword } = query
    // 使用参数...
  },
}
```

### POST 请求参数

```typescript
{
  url: '/api/login',
  method: 'post',
  response: ({ body }: any) => {
    const { username, password } = body
    // 使用参数...
  },
}
```

### 动态路由参数

```typescript
{
  url: '/api/products/:id',
  method: 'get',
  response: ({ query }: any) => {
    const { id } = query
    // 使用 id...
  },
}
```

## 错误模拟

### 模拟错误响应

```typescript
{
  url: '/api/example',
  method: 'get',
  response: () => {
    // 随机返回错误
    if (Math.random() > 0.8) {
      return {
        code: 500,
        data: null,
        message: '服务器错误',
      }
    }
    return {
      code: 200,
      data: { ... },
      message: 'success',
    }
  },
}
```

### 模拟网络错误

```typescript
{
  url: '/api/example',
  method: 'get',
  response: () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.8) {
          reject(new Error('网络错误'))
        } else {
          resolve({
            code: 200,
            data: { ... },
          })
        }
      }, 1000)
    })
  },
}
```

## 图片占位

### 使用 placeholder 服务

```typescript
// 固定尺寸
image: 'https://via.placeholder.com/200'

// 带文字
image: 'https://via.placeholder.com/200?text=Product'

// 带背景色
image: 'https://via.placeholder.com/200/ff0000'
```

### 使用 Mock.js 生成

```typescript
image: Mock.Random.image('200x200', '#ff0000', '#fff', 'Mock')
```

## 生产环境处理

### 禁用 Mock

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    viteMockServe({
      mockPath: 'mock',
      enable: process.env.NODE_ENV === 'development' // 只在开发环境启用
    })
  ]
})
```

### 切换到真实 API

```typescript
// src/utils/request.ts
const request = axios.create({
  baseURL:
    process.env.NODE_ENV === 'development'
      ? '/api' // 开发环境使用 Mock
      : 'https://api.example.com', // 生产环境使用真实 API
  timeout: 10000
})
```

## 最佳实践

1. **统一响应格式**：所有接口使用相同的响应格式
2. **合理使用 Mock.js**：生成真实感的随机数据
3. **模拟真实场景**：包括成功、失败、加载等状态
4. **添加延迟**：模拟真实网络延迟
5. **分文件管理**：按模块分文件管理 Mock 数据
6. **注释清晰**：为每个接口添加注释说明
7. **及时更新**：与后端接口保持同步

## 常见问题

### Mock 不生效？

1. 检查 vite.config.ts 配置
2. 检查 Mock 文件路径
3. 检查接口 URL 是否匹配
4. 重启开发服务器

### 如何调试 Mock 数据？

```typescript
{
  url: '/api/example',
  method: 'get',
  response: ({ query }: any) => {
    console.log('Mock 请求参数:', query)
    const result = { ... }
    console.log('Mock 响应数据:', result)
    return result
  },
}
```

### 如何模拟分页？

参考上面的商品列表示例，使用 page 和 pageSize 参数。

## 参考资源

- [vite-plugin-mock 文档](https://github.com/vbenjs/vite-plugin-mock)
- [Mock.js 文档](http://mockjs.com/)
- [Mock.js 示例](http://mockjs.com/examples.html)
