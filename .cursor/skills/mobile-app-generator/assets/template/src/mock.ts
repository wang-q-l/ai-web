import Mock from 'mockjs'

// 配置 Mock
Mock.setup({
  timeout: '200-600'
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

  console.log('[Mock] Mock 数据已启用（开发和生产环境）')
} else {
  console.log('[Mock] Mock 数据已关闭，使用真实接口')
}
