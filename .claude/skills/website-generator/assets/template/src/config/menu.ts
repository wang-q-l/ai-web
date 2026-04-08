export interface MenuItem {
  id: string
  label: string
  path: string
  icon?: string
  children?: MenuItem[]
}

export const menuConfig: MenuItem[] = [
  {
    id: 'home',
    label: '首页',
    path: '/',
    icon: 'House'
  },
  {
    id: 'products',
    label: '产品中心',
    path: '/products',
    icon: 'Box'
  },
  {
    id: 'solutions',
    label: '解决方案',
    path: '/solutions',
    icon: 'Document'
  },
  {
    id: 'news',
    label: '新闻动态',
    path: '/news',
    icon: 'Notification'
  },
  {
    id: 'about',
    label: '关于我们',
    path: '/about',
    icon: 'InfoFilled'
  },
  {
    id: 'contact',
    label: '联系我们',
    path: '/contact',
    icon: 'Phone'
  }
]

export const userMenuConfig: MenuItem[] = [
  {
    id: 'profile',
    label: '个人资料',
    path: '/user/profile',
    icon: 'User'
  },
  {
    id: 'orders',
    label: '订单管理',
    path: '/user/orders',
    icon: 'List'
  },
  {
    id: 'favorites',
    label: '我的收藏',
    path: '/user/favorites',
    icon: 'Star'
  },
  {
    id: 'messages',
    label: '消息通知',
    path: '/user/messages',
    icon: 'Bell'
  }
]
