# Mock 数据配置指南

## Mock.js 基础

项目使用 `vite-plugin-mock` 插件实现 Mock 数据,所有 Mock 文件放在 `mock/` 目录下。

## Mock 文件结构

每个 Mock 文件导出一个数组,包含多个接口定义:

```typescript
import { MockMethod } from 'vite-plugin-mock'

export default [
  {
    url: '/api/xxx',      // 接口路径
    method: 'get',        // 请求方法
    response: () => {     // 响应数据
      return {
        code: 200,
        data: {}
      }
    }
  }
] as MockMethod[]
```

## 常用 Mock 示例

### 列表数据

```typescript
{
  url: '/api/users/list',
  method: 'get',
  response: ({ query }: any) => {
    const { page = 1, pageSize = 10 } = query
    const list = []
    for (let i = 0; i < pageSize; i++) {
      list.push({
        id: (page - 1) * pageSize + i + 1,
        name: `用户${(page - 1) * pageSize + i + 1}`,
        email: `user${i}@example.com`,
        status: Math.random() > 0.5 ? 1 : 0,
        createTime: new Date().toISOString()
      })
    }
    return {
      code: 200,
      data: {
        list,
        total: 100,
        page: Number(page),
        pageSize: Number(pageSize)
      }
    }
  }
}
```

### 详情数据

```typescript
{
  url: '/api/users/:id',
  method: 'get',
  response: ({ query }: any) => {
    return {
      code: 200,
      data: {
        id: query.id,
        name: '张三',
        email: 'zhangsan@example.com',
        phone: '13800138000',
        status: 1,
        createTime: '2024-01-15 10:30:00'
      }
    }
  }
}
```

### 新增/编辑

```typescript
{
  url: '/api/users',
  method: 'post',
  response: ({ body }: any) => {
    return {
      code: 200,
      message: '操作成功',
      data: {
        id: Date.now(),
        ...body
      }
    }
  }
}
```

### 删除

```typescript
{
  url: '/api/users/:id',
  method: 'delete',
  response: () => {
    return {
      code: 200,
      message: '删除成功'
    }
  }
}
```

## 使用 Mock.js 生成随机数据

安装 mockjs 后可使用其随机数据生成功能:

```typescript
import Mock from 'mockjs'

{
  url: '/api/users/list',
  method: 'get',
  response: () => {
    return {
      code: 200,
      data: Mock.mock({
        'list|10': [{
          'id|+1': 1,
          name: '@cname',           // 中文名
          email: '@email',          // 邮箱
          'age|18-60': 1,          // 18-60随机数
          address: '@city(true)',   // 城市
          date: '@datetime',        // 日期时间
          avatar: '@image("200x200")', // 图片
          'status|1': [0, 1]       // 随机选择
        }],
        total: 100
      })
    }
  }
}
```

## Mock.js 常用占位符

- `@cname` - 中文姓名
- `@name` - 英文姓名
- `@email` - 邮箱
- `@id` - ID
- `@guid` - GUID
- `@datetime` - 日期时间
- `@date` - 日期
- `@time` - 时间
- `@image` - 图片
- `@url` - URL
- `@ip` - IP地址
- `@city(true)` - 城市(含省份)
- `@county(true)` - 区县(含省市)
- `@paragraph` - 段落
- `@sentence` - 句子
- `@word` - 单词
- `@title` - 标题

## 延迟响应

模拟网络延迟:

```typescript
{
  url: '/api/users',
  method: 'get',
  timeout: 1000,  // 延迟1秒
  response: () => {
    return { code: 200, data: [] }
  }
}
```

## 条件响应

根据请求参数返回不同数据:

```typescript
{
  url: '/api/users/login',
  method: 'post',
  response: ({ body }: any) => {
    if (body.username === 'admin' && body.password === '123456') {
      return {
        code: 200,
        message: '登录成功',
        data: { token: 'mock-token' }
      }
    }
    return {
      code: 400,
      message: '用户名或密码错误'
    }
  }
}
```
