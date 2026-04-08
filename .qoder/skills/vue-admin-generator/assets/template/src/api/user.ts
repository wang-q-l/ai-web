import request from '@/utils/request'

export interface LoginParams {
  username: string
  password: string
}

export const login = (data: LoginParams) => {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

export const getUserInfo = () => {
  return request({
    url: '/user/info',
    method: 'get'
  })
}
