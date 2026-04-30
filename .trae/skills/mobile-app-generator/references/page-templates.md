# 页面模板使用指南

本文档介绍如何使用内置的页面模板快速创建移动端页面。

## 列表页模板（ListPage）

### 功能特点

- 下拉刷新
- 上拉加载更多
- 空状态提示
- 返回按钮（可选）

### 基本使用

```vue
<template>
  <ListPage title="商品列表" :show-back="true" />
</template>

<script setup lang="ts">
  import ListPage from '@/components/ListPage.vue'
</script>
```

### Props 参数

| 参数     | 类型    | 默认值   | 说明             |
| -------- | ------- | -------- | ---------------- |
| title    | string  | '列表页' | 页面标题         |
| showBack | boolean | false    | 是否显示返回按钮 |
| fetchApi | string  | -        | API 接口地址     |

### 自定义列表项

```vue
<template>
  <div class="list-page">
    <van-nav-bar :title="title" :left-arrow="showBack" @click-left="onBack" />

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list v-model:loading="loading" :finished="finished" @load="onLoad">
        <!-- 自定义列表项 -->
        <van-card
          v-for="item in list"
          :key="item.id"
          :num="item.num"
          :price="item.price"
          :title="item.title"
          :thumb="item.image"
        />
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
  import { useList } from '@/composables/useList'

  const { list, loading, finished, refreshing, onLoad, onRefresh } = useList()
</script>
```

## 表单页模板（FormPage）

### 功能特点

- 表单验证
- 提交加载状态
- 返回按钮

### 基本使用

```vue
<template>
  <FormPage title="添加地址" />
</template>

<script setup lang="ts">
  import FormPage from '@/components/FormPage.vue'
</script>
```

### 自定义表单

```vue
<template>
  <div class="form-page">
    <van-nav-bar title="添加地址" left-arrow @click-left="onBack" />

    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="formData.name"
          label="姓名"
          placeholder="请输入姓名"
          :rules="[{ required: true, message: '请输入姓名' }]"
        />
        <van-field
          v-model="formData.phone"
          label="手机号"
          placeholder="请输入手机号"
          :rules="[{ required: true, message: '请输入手机号' }]"
        />
        <van-field
          v-model="formData.address"
          label="详细地址"
          type="textarea"
          placeholder="请输入详细地址"
          :rules="[{ required: true, message: '请输入详细地址' }]"
        />
        <van-field name="switch" label="设为默认">
          <template #input>
            <van-switch v-model="formData.isDefault" />
          </template>
        </van-field>
      </van-cell-group>

      <div class="submit-btn">
        <van-button round block type="primary" native-type="submit"> 保存 </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { showToast } from 'vant'

  const router = useRouter()

  const formData = ref({
    name: '',
    phone: '',
    address: '',
    isDefault: false
  })

  const onSubmit = async () => {
    showToast('保存成功')
    router.back()
  }

  const onBack = () => {
    router.back()
  }
</script>
```

## 详情页模板（DetailPage）

### 功能特点

- 图片展示
- 详细信息
- 底部操作栏

### 基本使用

```vue
<template>
  <DetailPage title="商品详情" />
</template>

<script setup lang="ts">
  import DetailPage from '@/components/DetailPage.vue'
</script>
```

### 自定义详情

```vue
<template>
  <div class="detail-page">
    <van-nav-bar title="商品详情" left-arrow @click-left="onBack" />

    <!-- 轮播图 -->
    <van-swipe :autoplay="3000">
      <van-swipe-item v-for="image in detail.images" :key="image">
        <van-image width="100%" height="300" :src="image" />
      </van-swipe-item>
    </van-swipe>

    <!-- 商品信息 -->
    <van-cell-group inset style="margin-top: 10px">
      <van-cell>
        <template #title>
          <div class="product-title">{{ detail.title }}</div>
          <div class="product-price">¥{{ detail.price }}</div>
        </template>
      </van-cell>
      <van-cell title="库存" :value="detail.stock" />
      <van-cell title="销量" :value="detail.sales" />
    </van-cell-group>

    <!-- 商品详情 -->
    <van-cell-group inset style="margin-top: 10px">
      <van-cell title="商品详情" />
      <div class="product-desc">{{ detail.desc }}</div>
    </van-cell-group>

    <!-- 底部操作栏 -->
    <van-goods-action>
      <van-goods-action-icon icon="chat-o" text="客服" />
      <van-goods-action-icon icon="cart-o" text="购物车" :badge="cartCount" />
      <van-goods-action-icon icon="star-o" text="收藏" />
      <van-goods-action-button type="warning" text="加入购物车" @click="onAddCart" />
      <van-goods-action-button type="danger" text="立即购买" @click="onBuy" />
    </van-goods-action>
  </div>
</template>
```

## 搜索页模板（SearchPage）

### 功能特点

- 搜索框
- 搜索历史
- 搜索结果列表
- 空状态提示

### 基本使用

```vue
<template>
  <SearchPage />
</template>

<script setup lang="ts">
  import SearchPage from '@/components/SearchPage.vue'
</script>
```

### 自定义搜索

```vue
<template>
  <div class="search-page">
    <van-search
      v-model="keyword"
      show-action
      placeholder="请输入搜索关键词"
      @search="onSearch"
      @cancel="onCancel"
    />

    <!-- 搜索历史 -->
    <div v-if="!keyword && history.length > 0" class="search-history">
      <div class="history-header">
        <span>搜索历史</span>
        <van-icon name="delete-o" @click="clearHistory" />
      </div>
      <van-tag
        v-for="item in history"
        :key="item"
        plain
        size="large"
        @click="
          keyword = item
          onSearch()
        "
      >
        {{ item }}
      </van-tag>
    </div>

    <!-- 搜索结果 -->
    <van-list v-if="keyword" v-model:loading="loading" :finished="finished" @load="onLoad">
      <van-cell
        v-for="item in list"
        :key="item.id"
        :title="item.title"
        is-link
        @click="goDetail(item.id)"
      />
    </van-list>

    <!-- 空状态 -->
    <van-empty v-if="keyword && !loading && list.length === 0" description="暂无搜索结果" />
  </div>
</template>
```

## useList Composable

### 功能特点

- 封装列表逻辑
- 下拉刷新
- 上拉加载
- 分页管理

### 基本使用

```typescript
import { useList } from '@/composables/useList'

const { list, loading, finished, refreshing, onLoad, onRefresh } = useList({
  fetchApi: '/api/products/list',
  pageSize: 10
})
```

### 返回值

| 属性       | 类型         | 说明         |
| ---------- | ------------ | ------------ |
| list       | Ref<any[]>   | 列表数据     |
| loading    | Ref<boolean> | 加载状态     |
| finished   | Ref<boolean> | 是否加载完成 |
| refreshing | Ref<boolean> | 刷新状态     |
| page       | Ref<number>  | 当前页码     |
| onLoad     | Function     | 加载更多     |
| onRefresh  | Function     | 下拉刷新     |

### 自定义 API 请求

```typescript
import { ref } from 'vue'
import { getProductList } from '@/api/product'

export function useProductList() {
  const list = ref<any[]>([])
  const loading = ref(false)
  const finished = ref(false)
  const refreshing = ref(false)
  const page = ref(1)

  const onLoad = async () => {
    loading.value = true
    try {
      const res = await getProductList({ page: page.value, pageSize: 10 })
      list.value.push(...res.list)
      page.value++
      if (!res.hasMore) {
        finished.value = true
      }
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  const onRefresh = async () => {
    list.value = []
    page.value = 1
    finished.value = false
    await onLoad()
    refreshing.value = false
  }

  return { list, loading, finished, refreshing, onLoad, onRefresh }
}
```

## 空状态页面

### 使用 Vant Empty 组件

```vue
<template>
  <van-empty v-if="!loading && list.length === 0" description="暂无数据" />
</template>
```

### 自定义空状态

```vue
<template>
  <van-empty image="https://via.placeholder.com/200" description="暂无商品">
    <van-button round type="primary" @click="goHome"> 去首页看看 </van-button>
  </van-empty>
</template>
```

## 加载状态

### 使用 Vant Loading 组件

```vue
<template>
  <van-loading v-if="loading" type="spinner" />
</template>
```

### 使用 Toast 提示

```typescript
import { showLoadingToast, closeToast } from 'vant'

const loading = showLoadingToast({
  message: '加载中...',
  forbidClick: true,
  duration: 0
})

// 关闭加载
closeToast()
```

## 最佳实践

1. **使用页面模板**：快速创建标准页面
2. **使用 Composables**：复用通用逻辑
3. **统一错误处理**：在请求拦截器中统一处理
4. **添加空状态**：提升用户体验
5. **添加加载状态**：让用户知道正在加载
6. **优化列表性能**：使用虚拟列表（大数据量时）
7. **合理使用缓存**：避免重复请求
