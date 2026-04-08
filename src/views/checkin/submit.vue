<template>
  <div class="page-container">
    <!-- 面包屑卡片 -->
    <el-card class="breadcrumb-card">
      <div class="breadcrumb-content">
        <div class="breadcrumb-left">
          <el-button text @click="handleBack">
            <el-icon><ArrowLeft /></el-icon>
            返回打卡列表
          </el-button>
          <span class="divider">|</span>
          <span class="page-info">现场打卡</span>
        </div>
        <div class="breadcrumb-actions">
          <el-button @click="handleSaveDraft">
            <el-icon><FolderOpened /></el-icon>
            保存草稿
          </el-button>
          <el-button type="primary" @click="handleSubmit">
            <el-icon><Location /></el-icon>
            提交打卡
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 可滚动内容区域 -->
    <el-scrollbar class="content-scrollbar">
      <!-- 定位信息卡片 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">定位信息</span>
            <el-button type="primary" size="small" @click="handleGetLocation">
              <el-icon><Refresh /></el-icon>
              重新定位
            </el-button>
          </div>
        </template>
        <div class="location-info">
          <el-alert
            v-if="locationError"
            :title="locationError"
            type="error"
            :closable="false"
            show-icon
          />
          <el-alert
            v-else-if="!locationData.latitude"
            title="正在获取位置信息..."
            type="info"
            :closable="false"
            show-icon
          />
          <div v-else class="location-details">
            <div class="location-item">
              <span class="label">当前位置：</span>
              <span class="value">{{ locationData.address || '获取地址中...' }}</span>
            </div>
            <div class="location-item">
              <span class="label">GPS坐标：</span>
              <span class="value">经度 {{ locationData.longitude }}，纬度 {{ locationData.latitude }}</span>
            </div>
            <div class="location-item">
              <span class="label">定位精度：</span>
              <span class="value">{{ locationData.accuracy }} 米</span>
            </div>
            <div class="location-item">
              <span class="label">定位时间：</span>
              <span class="value">{{ locationData.time }}</span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 打卡信息卡片 -->
      <el-card class="info-card">
        <template #header>
          <span class="card-title">打卡信息</span>
        </template>
        <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
          <el-form-item label="选择项目" prop="projectId">
            <el-select v-model="formData.projectId" placeholder="请选择项目" style="width: 100%">
              <el-option label="2024年度财务审计项目" :value="1" />
              <el-option label="内控审计项目" :value="2" />
            </el-select>
          </el-form-item>

          <el-form-item label="打卡类型" prop="checkinType">
            <el-radio-group v-model="formData.checkinType">
              <el-radio :value="1">上班打卡</el-radio>
              <el-radio :value="2">下班打卡</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="工作内容" prop="workContent">
            <el-input
              v-model="formData.workContent"
              type="textarea"
              :rows="4"
              placeholder="请输入今日工作内容"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="备注说明">
            <el-input
              v-model="formData.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入备注说明（选填）"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 现场照片卡片 -->
      <el-card class="info-card">
        <template #header>
          <span class="card-title">现场照片</span>
        </template>
        <div class="photo-upload">
          <el-upload
            v-model:file-list="fileList"
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :limit="9"
            accept="image/*"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">
            <el-icon><InfoFilled /></el-icon>
            <span>最多上传9张照片，支持JPG、PNG格式，单张不超过5MB</span>
          </div>
        </div>
      </el-card>
    </el-scrollbar>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="previewVisible" title="图片预览" width="800px">
      <img :src="previewUrl" style="width: 100%" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules, type UploadUserFile } from 'element-plus'
import { ArrowLeft, Location, Refresh, FolderOpened, Plus, InfoFilled } from '@element-plus/icons-vue'
import { submitCheckin } from '@/api/checkin'

defineOptions({
  name: 'CheckinSubmit'
})

const router = useRouter()
const formRef = ref<FormInstance>()

// 定位数据
const locationData = reactive({
  latitude: 0,
  longitude: 0,
  accuracy: 0,
  address: '',
  time: ''
})

const locationError = ref('')

// 表单数据
const formData = reactive({
  projectId: undefined as number | undefined,
  checkinType: 1,
  workContent: '',
  remark: ''
})

// 表单验证规则
const rules: FormRules = {
  projectId: [{ required: true, message: '请选择项目', trigger: 'change' }],
  checkinType: [{ required: true, message: '请选择打卡类型', trigger: 'change' }],
  workContent: [{ required: true, message: '请输入工作内容', trigger: 'blur' }]
}

// 照片列表
const fileList = ref<UploadUserFile[]>([])
const previewVisible = ref(false)
const previewUrl = ref('')

// 获取位置信息
const handleGetLocation = () => {
  if (!navigator.geolocation) {
    locationError.value = '您的浏览器不支持地理定位功能'
    return
  }

  locationError.value = ''
  ElMessage.info('正在获取位置信息...')

  navigator.geolocation.getCurrentPosition(
    (position) => {
      locationData.latitude = position.coords.latitude
      locationData.longitude = position.coords.longitude
      locationData.accuracy = Math.round(position.coords.accuracy)
      locationData.time = new Date().toLocaleString('zh-CN')

      // 模拟地址解析（实际项目中应调用地图API）
      locationData.address = `北京市朝阳区建国路88号（经度${locationData.longitude.toFixed(6)}，纬度${locationData.latitude.toFixed(6)}）`

      ElMessage.success('定位成功')
    },
    (error) => {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          locationError.value = '用户拒绝了地理定位请求，请在浏览器设置中允许定位权限'
          break
        case error.POSITION_UNAVAILABLE:
          locationError.value = '位置信息不可用，请检查设备GPS是否开启'
          break
        case error.TIMEOUT:
          locationError.value = '获取位置信息超时，请重试'
          break
        default:
          locationError.value = '获取位置信息失败，请重试'
      }
      ElMessage.error(locationError.value)
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  )
}

// 预览图片
const handlePreview = (file: UploadUserFile) => {
  previewUrl.value = file.url || ''
  previewVisible.value = true
}

// 删除图片
const handleRemove = () => {
  // 文件列表会自动更新
}

// 返回
const handleBack = () => {
  router.push('/checkin')
}

// 保存草稿
const handleSaveDraft = async () => {
  ElMessage.success('草稿已保存')
}

// 提交打卡
const handleSubmit = async () => {
  if (!formRef.value) return

  // 验证定位信息
  if (!locationData.latitude || !locationData.longitude) {
    ElMessage.error('请先获取位置信息')
    return
  }

  // 验证表单
  try {
    await formRef.value.validate()
  } catch {
    ElMessage.error('请完善打卡信息')
    return
  }

  // 验证照片
  if (fileList.value.length === 0) {
    const result = await ElMessageBox.confirm(
      '未上传现场照片，是否继续提交？',
      '提示',
      {
        confirmButtonText: '继续提交',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).catch(() => false)

    if (!result) return
  }

  try {
    // 构建提交数据
    const submitData = {
      projectId: formData.projectId!,
      checkinType: formData.checkinType,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      location: locationData.address,
      workContent: formData.workContent,
      remark: formData.remark,
      photos: fileList.value.map(file => file.url || '')
    }

    const res = await submitCheckin(submitData)
    if (res.code === 200) {
      ElMessage.success('打卡成功')
      router.push('/checkin')
    }
  } catch (error) {
    ElMessage.error('打卡失败，请重试')
  }
}

onMounted(() => {
  // 页面加载时自动获取位置
  handleGetLocation()
})
</script>

<style scoped lang="scss">
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.breadcrumb-card {
  flex-shrink: 0;
  border: none !important;
  box-shadow: none !important;
  border-radius: 12px;

  :deep(.el-card__body) {
    padding: 0 20px;
    height: 60px;
    display: flex;
    align-items: center;
  }

  .breadcrumb-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 60px;

    .breadcrumb-left {
      display: flex;
      align-items: center;
      gap: 12px;

      .el-button {
        font-size: 14px;
        color: #606266;
        padding: 0;

        &:hover {
          color: var(--el-color-primary);
        }

        .el-icon {
          font-size: 16px;
        }
      }

      .divider {
        color: #dcdfe6;
        font-size: 14px;
      }

      .page-info {
        font-size: 14px;
        color: #303133;
        font-weight: 500;
      }
    }

    .breadcrumb-actions {
      display: flex;

      .el-button:not(:first-child) {
        margin-left: 12px;
      }
    }
  }
}

.content-scrollbar {
  flex: 1;
  overflow: hidden;

  :deep(.el-scrollbar__view) {
    padding-bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}

.info-card {
  border: none !important;
  box-shadow: none !important;
  border-radius: 12px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .card-title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }
  }

  .location-info {
    .location-details {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .location-item {
        display: flex;
        align-items: center;
        font-size: 14px;

        .label {
          color: #909399;
          min-width: 100px;
        }

        .value {
          color: #303133;
          font-weight: 500;
        }
      }
    }
  }

  .photo-upload {
    .upload-tip {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      font-size: 13px;
      color: #909399;

      .el-icon {
        font-size: 16px;
      }
    }
  }
}
</style>
