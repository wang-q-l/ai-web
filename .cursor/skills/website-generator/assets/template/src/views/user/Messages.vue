<template>
  <div class="messages-page page-content">
    <div class="container">
      <h1>消息通知</h1>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="全部消息" name="all">
          <el-timeline>
            <el-timeline-item
              v-for="message in messages"
              :key="message.id"
              :timestamp="message.time"
              :type="message.type"
            >
              <el-card>
                <h4>{{ message.title }}</h4>
                <p>{{ message.content }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>
        <el-tab-pane label="系统消息" name="system">
          <el-timeline>
            <el-timeline-item
              v-for="message in systemMessages"
              :key="message.id"
              :timestamp="message.time"
            >
              <el-card>
                <h4>{{ message.title }}</h4>
                <p>{{ message.content }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>
        <el-tab-pane label="订单消息" name="order">
          <el-timeline>
            <el-timeline-item
              v-for="message in orderMessages"
              :key="message.id"
              :timestamp="message.time"
            >
              <el-card>
                <h4>{{ message.title }}</h4>
                <p>{{ message.content }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const activeTab = ref('all')

const messages = ref([
  {
    id: 1,
    type: 'primary',
    title: '系统通知',
    content: '您的账户已成功激活',
    time: '2026-02-20 10:00'
  },
  {
    id: 2,
    type: 'success',
    title: '订单通知',
    content: '您的订单已发货',
    time: '2026-02-19 15:30'
  },
  {
    id: 3,
    type: 'warning',
    title: '活动通知',
    content: '新春促销活动即将开始',
    time: '2026-02-18 09:00'
  }
])

const systemMessages = computed(() =>
  messages.value.filter(m => m.title.includes('系统'))
)

const orderMessages = computed(() =>
  messages.value.filter(m => m.title.includes('订单'))
)
</script>

<style scoped>
h1 {
  margin-bottom: var(--spacing-xl);
}

h4 {
  margin-bottom: var(--spacing-sm);
}

p {
  color: var(--text-secondary);
  margin: 0;
}
</style>
