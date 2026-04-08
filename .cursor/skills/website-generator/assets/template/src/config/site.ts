export interface SiteConfig {
  name: string
  logo: string
  description: string
  keywords: string
  company: {
    name: string
    address: string
    phone: string
    email: string
    icp: string
  }
  social: {
    wechat?: string
    weibo?: string
    github?: string
  }
}

export const siteConfig: SiteConfig = {
  name: 'Vue3 Website',
  logo: '/logo.svg',
  description: '基于 Vue3 + Element Plus 的企业官网模板',
  keywords: 'Vue3, Element Plus, 企业官网, 网站模板',
  company: {
    name: '某某科技有限公司',
    address: '北京市朝阳区某某大厦',
    phone: '400-123-4567',
    email: 'contact@example.com',
    icp: '京ICP备12345678号'
  },
  social: {
    wechat: '',
    weibo: '',
    github: 'https://github.com'
  }
}
