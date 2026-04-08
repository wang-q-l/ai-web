<template>
  <footer class="site-footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3>{{ siteConfig.name }}</h3>
          <p>{{ siteConfig.description }}</p>
        </div>

        <div class="footer-section">
          <h4>快速链接</h4>
          <ul>
            <li v-for="item in menuConfig" :key="item.id">
              <router-link :to="item.path">{{ item.label }}</router-link>
            </li>
          </ul>
        </div>

        <div class="footer-section">
          <h4>联系我们</h4>
          <ul class="contact-info">
            <li>
              <el-icon><Location /></el-icon>
              <span>{{ siteConfig.company.address }}</span>
            </li>
            <li>
              <el-icon><Phone /></el-icon>
              <span>{{ siteConfig.company.phone }}</span>
            </li>
            <li>
              <el-icon><Message /></el-icon>
              <span>{{ siteConfig.company.email }}</span>
            </li>
          </ul>
        </div>

        <div class="footer-section">
          <h4>关注我们</h4>
          <div class="social-links">
            <a v-if="siteConfig.social.github" :href="siteConfig.social.github" target="_blank">
              <el-icon><Link /></el-icon>
            </a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} {{ siteConfig.company.name }}. All rights reserved.</p>
        <p>{{ siteConfig.company.icp }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { menuConfig } from '@/config/menu'
import { siteConfig } from '@/config/site'
import { Location, Phone, Message, Link } from '@element-plus/icons-vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.site-footer {
  background-color: #2c3e50;
  color: #ecf0f1;
  padding: var(--spacing-xl) 0 var(--spacing-md);
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
}

.footer-section h3,
.footer-section h4 {
  margin-bottom: var(--spacing-md);
  color: #fff;
}

.footer-section ul {
  list-style: none;
}

.footer-section li {
  margin-bottom: var(--spacing-sm);
}

.footer-section a {
  color: #ecf0f1;
  transition: color 0.3s;
}

.footer-section a:hover {
  color: var(--primary-color);
}

.contact-info li {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.social-links {
  display: flex;
  gap: var(--spacing-md);
}

.social-links a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  transition: background-color 0.3s;
}

.social-links a:hover {
  background-color: var(--primary-color);
}

.footer-bottom {
  text-align: center;
  padding-top: var(--spacing-md);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-bottom p {
  margin: var(--spacing-xs) 0;
  font-size: 14px;
  color: #95a5a6;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
  }
}
</style>
