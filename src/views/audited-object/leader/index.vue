<template>
  <!-- 领导人员详情页：顶部栏 + 姓名Banner + 基础信息/迎审项目/审计文书/附件 + 右侧目录锚点 -->
  <div class="leader-detail-page">
    <!-- 顶部标题栏 -->
    <div class="header-bar">
      <div class="header-left">
        <el-icon class="back-icon" @click="handleBack"><ArrowLeft /></el-icon>
        <span class="page-title">领导人员详情</span>
      </div>
      <el-button class="next-btn" @click="handleNext">下一个</el-button>
    </div>

    <!-- 内容区：左侧主体滚动 + 右侧目录 -->
    <div class="detail-body">
      <div ref="scrollRef" class="detail-main" @scroll="handleScroll">
        <!-- 姓名 Banner -->
        <div class="name-banner">
          <h1 class="leader-name">{{ baseInfo.name }}</h1>
          <!-- 装饰性楼宇插画 -->
          <div class="banner-illustration"></div>
        </div>

        <!-- 基础信息 -->
        <section id="section-basic" class="detail-section">
          <div class="section-header">
            <span class="section-bar"></span>
            <span class="section-title">基础信息</span>
          </div>
          <div class="section-body">
            <el-descriptions :column="3" border>
              <el-descriptions-item label="姓名">{{ baseInfo.name }}</el-descriptions-item>
              <el-descriptions-item label="性别">{{ baseInfo.gender }}</el-descriptions-item>
              <el-descriptions-item label="职务">{{ baseInfo.position }}</el-descriptions-item>
              <el-descriptions-item label="在任/离任">{{
                baseInfo.tenureStatus
              }}</el-descriptions-item>
              <el-descriptions-item label="任职日期(启)">{{
                baseInfo.tenureStart
              }}</el-descriptions-item>
              <el-descriptions-item label="任职日期(止)">{{
                baseInfo.tenureEnd
              }}</el-descriptions-item>
              <el-descriptions-item label="手机号">{{ baseInfo.phone }}</el-descriptions-item>
              <el-descriptions-item label="所在机构">{{
                baseInfo.organization
              }}</el-descriptions-item>
              <el-descriptions-item label="备注">{{ baseInfo.remark }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </section>
        <!-- 迎审项目 -->
        <section id="section-meeting" class="detail-section">
          <div class="section-header">
            <span class="section-bar"></span>
            <span class="section-title">迎审项目</span>
          </div>
          <div class="section-body">
            <!-- 筛选区 -->
            <el-form class="filter-form" :inline="true">
              <el-form-item label="项目名称">
                <el-input
                  v-model="meetingQuery.projectName"
                  placeholder="请输入"
                  clearable
                  style="width: 200px"
                />
              </el-form-item>
              <el-form-item label="年度">
                <el-date-picker
                  v-model="meetingQuery.year"
                  type="year"
                  placeholder="请选择年份"
                  value-format="YYYY"
                  style="width: 160px"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleMeetingSearch">查询</el-button>
                <el-button @click="handleMeetingReset">重置</el-button>
              </el-form-item>
            </el-form>

            <!-- 表格 -->
            <el-table :data="meetingList" v-loading="meetingLoading" stripe>
              <el-table-column type="index" label="序号" width="80" />
              <el-table-column prop="year" label="年度" width="100" />
              <el-table-column prop="projectName" label="审计项目名称" min-width="200">
                <template #default="{ row }">
                  <el-link type="primary" :underline="false">{{ row.projectName }}</el-link>
                </template>
              </el-table-column>
              <el-table-column prop="category" label="项目类别" width="120" />
              <el-table-column prop="auditObject" label="审计对象" width="120" />
              <el-table-column prop="auditedUnit" label="被审计单位" width="120" />
              <el-table-column prop="auditSubject" label="审计实施主体" width="140" />
              <el-table-column prop="progress" label="项目进度" width="120">
                <template #default="{ row }">
                  <span class="progress-tag">● {{ row.progress }}</span>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-bar">
              <span class="total-text">共 {{ meetingTotal }} 条数据</span>
              <el-pagination
                v-model:current-page="meetingQuery.page"
                v-model:page-size="meetingQuery.pageSize"
                :total="meetingTotal"
                :page-sizes="[20, 50, 100]"
                layout="sizes, prev, pager, next"
                @current-change="fetchMeetingList"
                @size-change="fetchMeetingList"
              />
            </div>
          </div>
        </section>

        <!-- 审计文书 -->
        <section id="section-document" class="detail-section">
          <div class="section-header">
            <span class="section-bar"></span>
            <span class="section-title">审计文书</span>
          </div>
          <div class="section-body">
            <!-- 筛选区 -->
            <el-form class="filter-form" :inline="true">
              <el-form-item label="文书名称">
                <el-input
                  v-model="documentQuery.docName"
                  placeholder="请输入"
                  clearable
                  style="width: 180px"
                />
              </el-form-item>
              <el-form-item label="年度">
                <el-date-picker
                  v-model="documentQuery.year"
                  type="year"
                  placeholder="请选择年份"
                  value-format="YYYY"
                  style="width: 150px"
                />
              </el-form-item>
              <el-form-item label="审计类型">
                <el-select
                  v-model="documentQuery.auditType"
                  placeholder="请选择"
                  clearable
                  style="width: 150px"
                >
                  <el-option label="离任审计" value="离任审计" />
                  <el-option label="经济责任审计" value="经济责任审计" />
                  <el-option label="财务审计" value="财务审计" />
                </el-select>
              </el-form-item>
              <el-form-item label="文书节点">
                <el-select
                  v-model="documentQuery.docNode"
                  placeholder="请选择"
                  clearable
                  style="width: 150px"
                >
                  <el-option label="取证单" value="取证单" />
                  <el-option label="审计通知书" value="审计通知书" />
                  <el-option label="审计报告" value="审计报告" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleDocumentSearch">查询</el-button>
                <el-button @click="handleDocumentReset">重置</el-button>
              </el-form-item>
            </el-form>

            <!-- 表格 -->
            <el-table :data="documentList" v-loading="documentLoading" stripe>
              <el-table-column prop="docName" label="文书名称" min-width="140">
                <template #default="{ row }">
                  <el-link type="primary" :underline="false">{{ row.docName }}</el-link>
                </template>
              </el-table-column>
              <el-table-column prop="docNode" label="文书节点" width="120" />
              <el-table-column prop="year" label="年度" width="100" />
              <el-table-column prop="projectName" label="项目名称" min-width="200" />
              <el-table-column prop="creator" label="创建人" width="120" />
              <el-table-column prop="createTime" label="创建时间" width="180" />
              <el-table-column label="操作" width="100" fixed="right">
                <template #default>
                  <el-link type="primary" :underline="false">查看</el-link>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-bar">
              <span class="total-text">共 {{ documentTotal }} 条数据</span>
              <el-pagination
                v-model:current-page="documentQuery.page"
                v-model:page-size="documentQuery.pageSize"
                :total="documentTotal"
                :page-sizes="[20, 50, 100]"
                layout="sizes, prev, pager, next"
                @current-change="fetchDocumentList"
                @size-change="fetchDocumentList"
              />
            </div>
          </div>
        </section>

        <!-- 问题清单 -->
        <section id="section-problem" class="detail-section">
          <div class="section-header">
            <span class="section-bar"></span>
            <span class="section-title">问题清单</span>
          </div>
          <div class="section-body">
            <!-- 表格 -->
            <el-table :data="problemList" v-loading="problemLoading" stripe>
              <el-table-column type="index" label="序号" width="80" />
              <el-table-column prop="problemCode" label="问题编号" width="140" />
              <el-table-column
                prop="title"
                label="问题标题"
                min-width="180"
                show-overflow-tooltip
              />
              <el-table-column
                prop="description"
                label="问题表述"
                min-width="220"
                show-overflow-tooltip
              />
              <el-table-column
                prop="legalBasis"
                label="定性依据"
                min-width="180"
                show-overflow-tooltip
              />
              <el-table-column
                prop="suggestion"
                label="审计建议"
                min-width="200"
                show-overflow-tooltip
              />
              <el-table-column prop="rectifyType" label="整改类型" width="120" />
              <el-table-column prop="rectifyDeadline" label="整改期限" width="140" />
            </el-table>

            <!-- 分页 -->
            <div class="pagination-bar">
              <span class="total-text">共 {{ problemTotal }} 条数据</span>
              <el-pagination
                v-model:current-page="problemQuery.page"
                v-model:page-size="problemQuery.pageSize"
                :total="problemTotal"
                :page-sizes="[20, 50, 100]"
                layout="sizes, prev, pager, next"
                @current-change="fetchProblemList"
                @size-change="fetchProblemList"
              />
            </div>
          </div>
        </section>

        <!-- 附件 -->
        <section id="section-attachment" class="detail-section">
          <div class="section-header">
            <span class="section-bar"></span>
            <span class="section-title">附件</span>
          </div>
          <div class="section-body">
            <!-- 搜索框 -->
            <el-input
              v-model="attachmentQuery.keyword"
              placeholder="请输入"
              clearable
              style="width: 220px; margin-bottom: 16px"
              @keyup.enter="handleAttachmentSearch"
            >
              <template #suffix>
                <el-icon class="search-icon" @click="handleAttachmentSearch"><Search /></el-icon>
              </template>
            </el-input>

            <!-- 表格 -->
            <el-table :data="attachmentList" v-loading="attachmentLoading" stripe>
              <el-table-column type="selection" width="50" />
              <el-table-column prop="fileName" label="附件名称" min-width="200" />
              <el-table-column prop="size" label="大小" width="120" />
              <el-table-column prop="remark" label="备注" min-width="160" />
              <el-table-column prop="uploader" label="上传人" width="120" />
              <el-table-column prop="uploadTime" label="上传时间" width="180" />
              <el-table-column label="操作" width="120" fixed="right">
                <template #default>
                  <el-link type="primary" :underline="false">下载</el-link>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-bar">
              <span class="total-text">共 {{ attachmentTotal }} 条数据</span>
              <el-pagination
                v-model:current-page="attachmentQuery.page"
                v-model:page-size="attachmentQuery.pageSize"
                :total="attachmentTotal"
                :page-sizes="[20, 50, 100]"
                layout="sizes, prev, pager, next"
                @current-change="fetchAttachmentList"
                @size-change="fetchAttachmentList"
              />
            </div>
          </div>
        </section>
      </div>

      <!-- 右侧目录锚点 -->
      <div class="catalog">
        <div class="catalog-title">目录</div>
        <ul class="catalog-list">
          <li
            v-for="item in catalog"
            :key="item.id"
            class="catalog-item"
            :class="{ active: activeAnchor === item.id }"
            @click="scrollToSection(item.id)"
          >
            <span class="catalog-dot"></span>
            <span class="catalog-label">{{ item.label }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  /**
   * 领导人员详情页面
   * 包含：基础信息、迎审项目、审计文书、问题清单、附件（均含表格+分页，部分含筛选）
   * 右侧目录锚点支持点击定位与滚动高亮
   */
  import { ref, reactive, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { ArrowLeft, Search } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import type {
    LeaderBaseInfo,
    AuditMeetingProject,
    AuditDocument,
    AuditProblem,
    AuditAttachment
  } from '@/types/audited-object'
  import {
    getLeaderBaseInfo,
    getMeetingProjectList,
    getAuditDocumentList,
    getProblemList,
    getAttachmentList
  } from '@/api/audited-object'

  const router = useRouter()

  // ==================== 基础信息 ====================
  const baseInfo = ref<LeaderBaseInfo>({
    name: '',
    gender: '',
    position: '',
    tenureStatus: '',
    tenureStart: '',
    tenureEnd: '',
    phone: '',
    organization: '',
    remark: ''
  })

  // 获取基础信息
  const fetchBaseInfo = async () => {
    const res: any = await getLeaderBaseInfo()
    baseInfo.value = res.data
  }

  // ==================== 迎审项目 ====================
  const meetingList = ref<AuditMeetingProject[]>([])
  const meetingTotal = ref(0)
  const meetingLoading = ref(false)
  const meetingQuery = reactive({
    projectName: '',
    year: '',
    page: 1,
    pageSize: 20
  })

  // 获取迎审项目列表
  const fetchMeetingList = async () => {
    meetingLoading.value = true
    try {
      const res: any = await getMeetingProjectList({ ...meetingQuery })
      meetingList.value = res.data.list
      meetingTotal.value = res.data.total
    } finally {
      meetingLoading.value = false
    }
  }

  // 迎审项目查询
  const handleMeetingSearch = () => {
    meetingQuery.page = 1
    fetchMeetingList()
  }

  // 迎审项目重置
  const handleMeetingReset = () => {
    meetingQuery.projectName = ''
    meetingQuery.year = ''
    meetingQuery.page = 1
    fetchMeetingList()
  }

  // ==================== 审计文书 ====================
  const documentList = ref<AuditDocument[]>([])
  const documentTotal = ref(0)
  const documentLoading = ref(false)
  const documentQuery = reactive({
    docName: '',
    year: '',
    auditType: '',
    docNode: '',
    page: 1,
    pageSize: 20
  })

  // 获取审计文书列表
  const fetchDocumentList = async () => {
    documentLoading.value = true
    try {
      const res: any = await getAuditDocumentList({ ...documentQuery })
      documentList.value = res.data.list
      documentTotal.value = res.data.total
    } finally {
      documentLoading.value = false
    }
  }

  // 审计文书查询
  const handleDocumentSearch = () => {
    documentQuery.page = 1
    fetchDocumentList()
  }

  // 审计文书重置
  const handleDocumentReset = () => {
    documentQuery.docName = ''
    documentQuery.year = ''
    documentQuery.auditType = ''
    documentQuery.docNode = ''
    documentQuery.page = 1
    fetchDocumentList()
  }

  // ==================== 问题清单 ====================
  const problemList = ref<AuditProblem[]>([])
  const problemTotal = ref(0)
  const problemLoading = ref(false)
  const problemQuery = reactive({
    page: 1,
    pageSize: 20
  })

  // 获取问题清单列表
  const fetchProblemList = async () => {
    problemLoading.value = true
    try {
      const res: any = await getProblemList({ ...problemQuery })
      problemList.value = res.data.list
      problemTotal.value = res.data.total
    } finally {
      problemLoading.value = false
    }
  }

  // ==================== 附件 ====================
  const attachmentList = ref<AuditAttachment[]>([])
  const attachmentTotal = ref(0)
  const attachmentLoading = ref(false)
  const attachmentQuery = reactive({
    keyword: '',
    page: 1,
    pageSize: 20
  })

  // 获取附件列表
  const fetchAttachmentList = async () => {
    attachmentLoading.value = true
    try {
      const res: any = await getAttachmentList({ ...attachmentQuery })
      attachmentList.value = res.data.list
      attachmentTotal.value = res.data.total
    } finally {
      attachmentLoading.value = false
    }
  }

  // 附件搜索
  const handleAttachmentSearch = () => {
    attachmentQuery.page = 1
    fetchAttachmentList()
  }

  // ==================== 目录锚点 ====================
  const scrollRef = ref<HTMLElement>()
  const activeAnchor = ref('section-basic')
  // 目录项配置
  const catalog = [
    { id: 'section-basic', label: '基础信息' },
    { id: 'section-meeting', label: '迎审项目' },
    { id: 'section-document', label: '审计文书' },
    { id: 'section-problem', label: '问题清单' },
    { id: 'section-attachment', label: '附件' }
  ]

  // 点击目录项滚动到对应区块
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el && scrollRef.value) {
      scrollRef.value.scrollTo({ top: el.offsetTop - 16, behavior: 'smooth' })
    }
  }

  // 滚动时高亮当前区块（取最靠近顶部且已进入视口的区块）
  const handleScroll = () => {
    if (!scrollRef.value) return
    const scrollTop = scrollRef.value.scrollTop
    let current = catalog[0].id
    for (const item of catalog) {
      const el = document.getElementById(item.id)
      if (el && el.offsetTop - 80 <= scrollTop) {
        current = item.id
      }
    }
    activeAnchor.value = current
  }

  // ==================== 顶部操作 ====================
  // 返回上一页
  const handleBack = () => {
    router.back()
  }

  // 下一个（占位：暂提示）
  const handleNext = () => {
    ElMessage.info('已是最后一个')
  }

  // 初始化加载
  onMounted(() => {
    fetchBaseInfo()
    fetchMeetingList()
    fetchDocumentList()
    fetchProblemList()
    fetchAttachmentList()
  })
</script>

<style scoped lang="scss">
  .leader-detail-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #f5f7fa;
  }

  /* 顶部标题栏 */
  .header-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 24px;
    background: #fff;
    border-radius: 8px;

    .header-left {
      display: flex;
      gap: 12px;
      align-items: center;

      .back-icon {
        font-size: 20px;
        color: #303133;
        cursor: pointer;

        &:hover {
          color: #409eff;
        }
      }

      .page-title {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }
  }

  /* 内容区：左主体 + 右目录 */
  .detail-body {
    display: flex;
    flex: 1;
    gap: 16px;
    margin-top: 12px;
    overflow: hidden;
  }

  .detail-main {
    flex: 1;
    padding-right: 4px;
    overflow-y: auto;
  }

  /* STYLE_CHUNK_2 */

  /* 姓名 Banner：渐变蓝底 + 右侧装饰插画 */
  .name-banner {
    position: relative;
    display: flex;
    align-items: center;
    height: 150px;
    padding: 0 40px;
    overflow: hidden;
    background: linear-gradient(120deg, #dfe9ff 0%, #eaf1ff 45%, #f3f7ff 100%);
    border-radius: 8px;

    .leader-name {
      z-index: 2;
      margin: 0;
      font-size: 40px;
      font-weight: 700;
      color: #1d2129;
      letter-spacing: 2px;
    }

    /* 右侧楼宇渐变装饰块（纯样式，无业务含义） */
    .banner-illustration {
      position: absolute;
      top: 0;
      right: 0;
      width: 420px;
      height: 100%;
      background:
        radial-gradient(circle at 80% 60%, rgb(255 255 255 / 60%) 0%, transparent 55%),
        linear-gradient(135deg, transparent 0%, rgb(135 170 255 / 25%) 100%);
    }
  }

  /* 区块卡片 */
  .detail-section {
    margin-top: 16px;
    overflow: hidden;
    background: #fff;
    border-radius: 8px;

    .section-header {
      display: flex;
      align-items: center;
      padding: 16px 20px;
      background: #f7f8fa;

      .section-bar {
        width: 3px;
        height: 15px;
        margin-right: 8px;
        background: #409eff;
        border-radius: 2px;
      }

      .section-title {
        font-size: 15px;
        font-weight: 600;
        color: #1d2129;
      }
    }

    .section-body {
      padding: 20px;
    }
  }

  /* STYLE_CHUNK_3 */

  /* 筛选表单 */
  .filter-form {
    margin-bottom: 4px;
  }

  /* 项目进度文字标签 */
  .progress-tag {
    font-size: 13px;
    color: #f5319d; /* 截图中进度为粉紫色文字 */
  }

  /* 搜索图标可点击 */
  .search-icon {
    cursor: pointer;

    &:hover {
      color: #409eff;
    }
  }

  /* 分页栏：左侧总数 + 右侧分页器 */
  .pagination-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 16px;

    .total-text {
      font-size: 13px;
      color: #909399;
    }
  }

  /* STYLE_CHUNK_4 */

  /* 右侧目录锚点 */
  .catalog {
    flex-shrink: 0;
    align-self: flex-start;
    width: 180px;
    padding: 16px 0;
    background: #fff;
    border-radius: 8px;

    .catalog-title {
      padding: 0 20px 12px;
      font-size: 15px;
      font-weight: 600;
      color: #1d2129;
    }

    .catalog-list {
      padding: 0;
      margin: 0;
      list-style: none;

      .catalog-item {
        display: flex;
        align-items: center;
        padding: 10px 20px;
        cursor: pointer;
        transition: all 0.2s;

        .catalog-dot {
          width: 6px;
          height: 6px;
          margin-right: 10px;
          background: #c0c4cc;
          border-radius: 50%;
          transition: all 0.2s;
        }

        .catalog-label {
          font-size: 14px;
          color: #606266;
        }

        &:hover .catalog-label {
          color: #409eff;
        }

        /* 当前选中：蓝底高亮 + 实心圆点 */
        &.active {
          background: #ecf5ff;

          .catalog-dot {
            background: #409eff;
          }

          .catalog-label {
            font-weight: 500;
            color: #409eff;
          }
        }
      }
    }
  }
</style>
