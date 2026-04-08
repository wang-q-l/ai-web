import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface UserInfo {
  id: string
  name: string
  email: string
  avatar: string
  phone?: string
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo>({
    id: '',
    name: '',
    email: '',
    avatar: ''
  })

  const isLoggedIn = ref<boolean>(!!token.value)

  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
    isLoggedIn.value = true
  }

  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info
  }

  const logout = () => {
    token.value = ''
    userInfo.value = {
      id: '',
      name: '',
      email: '',
      avatar: ''
    }
    isLoggedIn.value = false
    localStorage.removeItem('token')
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    setToken,
    setUserInfo,
    logout
  }
})
