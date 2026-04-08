import request from '@/utils/request'

// 登录
export function login(data: { username: string; password: string }) {
  return request.post('/login', data)
}

// 获取用户信息
export function getUserInfo() {
  return request.get('/user/info')
}

// 退出登录
export function logout() {
  return request.post('/logout')
}
