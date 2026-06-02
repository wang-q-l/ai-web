<script setup lang="ts">
  // AI 助理抽屉：法规推荐场景的可视化思考过程，分 5 个阶段流式输出
  // 阶段：关键词抽取 → 同义词扩展 → 候选召回 → 多维度打分 → 输出推荐卡片
  import { ref, reactive, computed, watch, nextTick } from 'vue'
  import { useWindowSize } from '@vueuse/core'
  import {
    Promotion,
    DArrowLeft,
    Search,
    Reading,
    Folder,
    Histogram,
    Loading,
    CircleCheckFilled,
    MagicStick,
    User,
    ChatRound
  } from '@element-plus/icons-vue'

  // 法规层级中文映射
  const LEVEL_LABEL: Record<string, string> = {
    law: '法律',
    admin: '行政法规',
    rule: '部门规章',
    local: '地方法规',
    normative: '规范性文件'
  }

  // 法规层级标签颜色
  const LEVEL_TAG_TYPE: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    law: 'primary',
    admin: 'success',
    rule: 'warning',
    local: 'warning',
    normative: 'info'
  }

  // 推荐卡片结构
  interface RecommendCard {
    rank: number
    regulationName: string
    articleNo: string
    articleText: string
    level: string
    year: number
    score: number
    reason: string
    lowConfidence: boolean
  }

  // 单条对话消息
  interface Message {
    id: number
    role: 'user' | 'ai'
    text?: string
    time: string
    // AI 思考阶段集合（仅 ai 角色）
    stages?: Stage[]
    // 推荐结果卡片
    cards?: RecommendCard[]
    // 结论文案（带打字机效果）
    conclusion?: string
    conclusionTyped?: string
  }

  // 思考阶段类型
  interface Stage {
    key: 'keyword' | 'synonym' | 'recall' | 'score' | 'rerank'
    iconKey: 'keyword' | 'synonym' | 'recall' | 'score'
    title: string
    loadingText: string
    doneText?: string
    status: 'pending' | 'running' | 'done'
    // 关键词阶段：chips
    keywordChips?: string[]
    // 同义词阶段：扩展行
    synonymRows?: { from: string; to: string[] }[]
    // 召回阶段：数字变化
    recallTotal?: number
    recallAfterLevel?: number
    recallAfterTag?: number
    // 打分阶段：5 个维度的进度
    scoreRows?: { name: string; weight: number; percent: number; targetPercent: number }[]
  }

  const props = defineProps<{
    open: boolean
    // 从右侧抽屉传入的问题描述，用于自动带入
    initialQuery: string
  }>()

  const emit = defineEmits<{
    'update:open': [val: boolean]
    // 用户点击卡片"引用"时，把内容回传给父组件写入定性依据
    cite: [text: string]
  }>()

  const visible = computed({
    get: () => props.open,
    set: (v) => emit('update:open', v)
  })

  // 让 AI 抽屉宽度 = 视口宽度 - 右侧问题抽屉 720px，二者无缝拼接
  const { width: winWidth } = useWindowSize()
  const drawerSize = computed(() => {
    const w = Math.max(360, winWidth.value - 720)
    return `${w}px`
  })

  // 对话消息列表
  const messages = ref<Message[]>([])
  // 输入框内容
  const inputText = ref('')
  // 是否正在生成
  const generating = ref(false)
  // 滚动容器引用
  const scrollRef = ref<HTMLElement>()
  // 消息 id 自增
  let msgSeq = 0

  // 当前时间格式化为 MM-DD HH:mm
  const formatTime = () => {
    const d = new Date()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const mi = String(d.getMinutes()).padStart(2, '0')
    return `2026-${mm}-${dd} ${hh}:${mi}`
  }

  // 滚动到底部
  const scrollToBottom = async () => {
    await nextTick()
    if (scrollRef.value) scrollRef.value.scrollTop = scrollRef.value.scrollHeight
  }

  // 抽屉打开且带有 initialQuery 时自动触发推荐
  watch(
    () => props.open,
    (val) => {
      if (val && props.initialQuery && !generating.value) {
        // 重置对话
        messages.value = []
        inputText.value = props.initialQuery
        // 给一个微延迟让抽屉滑入动画完成
        setTimeout(() => triggerRecommend(props.initialQuery), 350)
      }
    }
  )

  // 工具：等待若干毫秒
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

  // 4 个阶段的元信息（按顺序逐个加入消息）
  const STAGE_DEFS: Stage[] = [
    {
      key: 'keyword',
      iconKey: 'keyword',
      title: '分析问题描述',
      loadingText: '正在抽取问题描述中的关键信息',
      status: 'pending'
    },
    {
      key: 'synonym',
      iconKey: 'synonym',
      title: '同义词扩展',
      loadingText: '正在查询同义词表，扩展检索范围',
      status: 'pending'
    },
    {
      key: 'recall',
      iconKey: 'recall',
      title: '候选召回',
      loadingText: '正在从法规库筛选候选条款',
      status: 'pending'
    },
    {
      key: 'score',
      iconKey: 'score',
      title: '多维度打分',
      loadingText: '正在按 5 个维度对候选法规打分',
      status: 'pending'
    }
  ]

  // 创建一个阶段的副本（避免不同消息共享引用）
  const cloneStage = (idx: number): Stage => ({ ...STAGE_DEFS[idx] })

  // 触发推荐：完整流程
  const triggerRecommend = async (query: string) => {
    if (!query.trim()) return
    generating.value = true
    inputText.value = ''

    // 1. 追加用户消息
    messages.value.push({
      id: ++msgSeq,
      role: 'user',
      text: query,
      time: formatTime()
    })
    await scrollToBottom()
    await wait(300)

    // 2. 追加 AI 消息（用 reactive 包装，确保后续突变响应式）
    const aiMsg = reactive<Message>({
      id: ++msgSeq,
      role: 'ai',
      time: formatTime(),
      stages: [],
      cards: [],
      conclusion: '',
      conclusionTyped: ''
    })
    messages.value.push(aiMsg)
    await scrollToBottom()

    // 3. 逐阶段展示：追加 → running → 详情填充 → done → 切下一阶段
    await addAndRunStage(aiMsg, 0, runKeywordStage)
    await addAndRunStage(aiMsg, 1, runSynonymStage)
    await addAndRunStage(aiMsg, 2, runRecallStage)
    await addAndRunStage(aiMsg, 3, runScoreStage)
    await typeConclusion(aiMsg)
    await renderCards(aiMsg)

    generating.value = false
  }

  // 追加并运行单个阶段
  const addAndRunStage = async (
    msg: Message,
    idx: number,
    runner: (msg: Message) => Promise<void>
  ) => {
    // 卡片淡入
    msg.stages!.push(cloneStage(idx))
    await scrollToBottom()
    await wait(200)
    // 立即切到 running 状态，避免一闪而过的 pending
    msg.stages![idx].status = 'running'
    await scrollToBottom()
    // 执行阶段动效
    await runner(msg)
    // 阶段间留 250ms 间隔，避免过渡太急
    await wait(250)
  }

  // 阶段 1：关键词抽取
  const runKeywordStage = async (msg: Message) => {
    const stage = msg.stages![0]
    await wait(500)

    // running 期间初始化容器并逐个填入 chip
    stage.keywordChips = []
    const candidates = ['公立医院', '科室', '社会资本', '合作', '营利性', '医疗']
    for (const kw of candidates) {
      stage.keywordChips.push(kw)
      await scrollToBottom()
      await wait(120)
    }
    // 全部填完才标 done
    stage.doneText = '已识别 6 个关键信息'
    stage.status = 'done'
  }

  // 阶段 2：同义词扩展
  const runSynonymStage = async (msg: Message) => {
    const stage = msg.stages![1]
    await wait(400)

    stage.synonymRows = []
    const rows = [
      { from: '合作', to: ['联营', '承包', '外包'] },
      { from: '营利性', to: ['商业化', '对外经营'] },
      { from: '科室', to: ['内设科室', '诊室'] }
    ]
    for (const r of rows) {
      stage.synonymRows.push(r)
      await scrollToBottom()
      await wait(180)
    }
    stage.doneText = '同义词扩展完成（来自同义词表）'
    stage.status = 'done'
  }

  // 阶段 3：候选召回
  const runRecallStage = async (msg: Message) => {
    const stage = msg.stages![2]
    await wait(400)

    // running 期间初始化 + 数字跳动可视化
    stage.recallTotal = 0
    stage.recallAfterLevel = 0
    stage.recallAfterTag = 0
    await scrollToBottom()

    await tickNumber(stage, 'recallTotal', 8, 60)
    await wait(180)
    await tickNumber(stage, 'recallAfterLevel', 8, 60)
    await wait(180)
    await tickNumber(stage, 'recallAfterTag', 5, 100)

    stage.doneText = '已召回 5 条候选条款（按层级与标签过滤后）'
    stage.status = 'done'
  }

  // 数字跳动工具
  const tickNumber = async (stage: Stage, key: keyof Stage, target: number, stepMs: number) => {
    for (let i = 1; i <= target; i++) {
      ;(stage as any)[key] = i
      await wait(stepMs)
    }
  }

  // 阶段 4：多维度打分
  const runScoreStage = async (msg: Message) => {
    const stage = msg.stages![3]
    await wait(400)

    // running 期间逐条进度条增长
    stage.scoreRows = [
      { name: '关键词匹配', weight: 0.4, percent: 0, targetPercent: 85 },
      { name: '标签匹配', weight: 0.25, percent: 0, targetPercent: 100 },
      { name: '法规层级', weight: 0.15, percent: 0, targetPercent: 70 },
      { name: '颁布年份', weight: 0.1, percent: 0, targetPercent: 83 },
      { name: '历史采纳率', weight: 0.1, percent: 0, targetPercent: 88 }
    ]
    await scrollToBottom()

    for (const row of stage.scoreRows) {
      const steps = 15
      for (let i = 1; i <= steps; i++) {
        row.percent = Math.round((row.targetPercent * i) / steps)
        await wait(20)
      }
      await wait(120)
    }
    stage.doneText = '5 维度打分完成（综合得分降序排列）'
    stage.status = 'done'
  }

  // 结论打字机
  const typeConclusion = async (msg: Message) => {
    msg.conclusion =
      '我从《基本医疗卫生与健康促进法》等 5 部法规中筛选出 3 条最适用的定性依据，置信度均 ≥ 0.6。点击下方卡片可直接引用到「定性依据」字段：'
    for (let i = 1; i <= msg.conclusion.length; i++) {
      msg.conclusionTyped = msg.conclusion.slice(0, i)
      if (i % 4 === 0) await scrollToBottom()
      await wait(28)
    }
    await scrollToBottom()
  }

  // 渲染推荐卡片（依次淡入）
  const renderCards = async (msg: Message) => {
    const data: RecommendCard[] = [
      {
        rank: 1,
        regulationName: '中华人民共和国基本医疗卫生与健康促进法',
        articleNo: '第四十条第三款',
        articleText:
          '政府举办的医疗卫生机构不得与社会资本合作举办营利性医疗卫生机构，不得使用国有资产参与举办营利性医疗卫生机构。',
        level: 'law',
        year: 2020,
        score: 0.82,
        reason: '直接定性：公立医院与社会资本合作设立营利性项目违法',
        lowConfidence: false
      },
      {
        rank: 2,
        regulationName: '关于城镇医疗机构分类管理的实施意见',
        articleNo: '第三条第7项',
        articleText: '非营利性医疗机构不得变相出租、承包科室，不得与社会资本合作举办营利性项目。',
        level: 'normative',
        year: 2000,
        score: 0.61,
        reason: '细化情形：变相承包科室构成违规',
        lowConfidence: false
      },
      {
        rank: 3,
        regulationName: '行政事业性国有资产管理条例',
        articleNo: '第二十六条',
        articleText:
          '行政事业单位应当加强国有资产的日常管理，建立资产清查盘点制度，定期清查盘点，做到账实相符。',
        level: 'admin',
        year: 2021,
        score: 0.45,
        reason: '兜底依据：涉及国有医疗资产合规管理',
        lowConfidence: true
      }
    ]
    msg.cards = []
    for (const c of data) {
      msg.cards.push(c)
      await scrollToBottom()
      await wait(220)
    }
  }

  // 用户点击"引用"
  const handleCite = (card: RecommendCard) => {
    const text = `《${card.regulationName}》${card.articleNo}：${card.articleText}`
    emit('cite', text)
    // 追加一条 AI 回复
    messages.value.push({
      id: ++msgSeq,
      role: 'ai',
      text: `已为您引用《${card.regulationName}》${card.articleNo}`,
      time: formatTime()
    })
    scrollToBottom()
  }

  // 用户继续提问
  const handleSend = () => {
    if (!inputText.value.trim() || generating.value) return
    triggerRecommend(inputText.value)
  }

  // 关闭抽屉
  const handleClose = () => {
    visible.value = false
  }

  // 快捷按钮
  const QUICK_ACTIONS = [
    { label: '法规推荐', active: true },
    { label: '审计方案撰写', active: false },
    { label: '取证单撰写', active: false },
    { label: '审计底稿撰写', active: false },
    { label: '审计报告撰写', active: false }
  ]

  const handleQuickAction = (label: string) => {
    if (label === '法规推荐') return
    // 其它能力非本次范围
  }

  // Stage 图标映射（用 markRaw 避免 Vue 警告，但这里直接 map 也可）
  const STAGE_ICONS = {
    keyword: Search,
    synonym: Reading,
    recall: Folder,
    score: Histogram
  }
</script>

<template>
  <el-drawer
    v-model="visible"
    :with-header="false"
    direction="ltr"
    :size="drawerSize"
    :modal="false"
    :close-on-click-modal="false"
    class="ai-assistant-drawer"
  >
    <div class="ai-wrap">
      <!-- 顶部 header -->
      <div class="ai-header">
        <div class="ai-header-left">
          <div class="ai-avatar">
            <el-icon :size="20"><ChatRound /></el-icon>
          </div>
          <span class="ai-title">AI 助理</span>
        </div>
        <!-- 收起按钮：醒目的圆形白色背景 -->
        <el-tooltip content="收起" placement="bottom">
          <div class="ai-collapse-btn" @click="handleClose">
            <el-icon :size="18"><DArrowLeft /></el-icon>
          </div>
        </el-tooltip>
      </div>

      <!-- 消息流 -->
      <div ref="scrollRef" class="ai-body">
        <template v-for="msg in messages" :key="msg.id">
          <!-- 用户消息：右侧 -->
          <div v-if="msg.role === 'user'" class="msg-row msg-user">
            <div class="msg-bubble msg-bubble-user">
              <div class="msg-text">{{ msg.text }}</div>
              <div class="msg-time">{{ msg.time }}</div>
            </div>
            <div class="msg-avatar msg-avatar-user">
              <el-icon :size="18"><User /></el-icon>
            </div>
          </div>

          <!-- AI 消息：左侧 -->
          <div v-else class="msg-row msg-ai">
            <div class="msg-avatar msg-avatar-ai">
              <el-icon :size="18"><ChatRound /></el-icon>
            </div>
            <div class="msg-bubble msg-bubble-ai">
              <!-- 简单文本回复 -->
              <div v-if="msg.text" class="msg-text">{{ msg.text }}</div>

              <!-- 思考过程：4 个阶段（卡片纵向排列） -->
              <div v-if="msg.stages" class="thinking">
                <div
                  v-for="(stage, idx) in msg.stages"
                  :key="stage.key"
                  class="stage"
                  :class="{
                    'stage-running': stage.status === 'running',
                    'stage-done': stage.status === 'done'
                  }"
                >
                  <!-- 阶段卡片头部 -->
                  <div class="stage-head">
                    <!-- 序号圆点 -->
                    <div class="stage-no">{{ idx + 1 }}</div>
                    <!-- 主图标 -->
                    <el-icon class="stage-icon" :size="16">
                      <component :is="STAGE_ICONS[stage.iconKey]" />
                    </el-icon>
                    <!-- 阶段标题 -->
                    <span class="stage-title">{{ stage.title }}</span>
                    <!-- 状态指示 -->
                    <div class="stage-status">
                      <template v-if="stage.status === 'running'">
                        <el-icon class="stage-loading-icon is-loading" :size="14">
                          <Loading />
                        </el-icon>
                        <span class="stage-status-text running">进行中</span>
                      </template>
                      <template v-else-if="stage.status === 'done'">
                        <el-icon class="stage-check-icon" :size="14">
                          <CircleCheckFilled />
                        </el-icon>
                        <span class="stage-status-text done">已完成</span>
                      </template>
                      <template v-else>
                        <span class="stage-status-text pending">等待中</span>
                        <span class="pending-dots"> <i></i><i></i><i></i> </span>
                      </template>
                    </div>
                  </div>

                  <!-- 阶段副标题：进行中/已完成的提示文案 -->
                  <div v-if="stage.status !== 'pending'" class="stage-subtitle">
                    {{ stage.status === 'running' ? stage.loadingText : stage.doneText }}
                  </div>

                  <!-- 阶段详情：running/done 状态下，只要有内容就展示（让内容边跑边出） -->
                  <div
                    v-if="
                      stage.status !== 'pending' &&
                      (stage.keywordChips?.length ||
                        stage.synonymRows?.length ||
                        stage.recallTotal !== undefined ||
                        stage.scoreRows?.length)
                    "
                    class="stage-detail"
                  >
                    <!-- 关键词 chips -->
                    <div
                      v-if="stage.key === 'keyword' && stage.keywordChips?.length"
                      class="kw-chips"
                    >
                      <el-tag
                        v-for="kw in stage.keywordChips"
                        :key="kw"
                        size="small"
                        class="kw-tag"
                      >
                        {{ kw }}
                      </el-tag>
                    </div>

                    <!-- 同义词扩展 -->
                    <div
                      v-if="stage.key === 'synonym' && stage.synonymRows?.length"
                      class="syn-rows"
                    >
                      <div v-for="row in stage.synonymRows" :key="row.from" class="syn-row">
                        <span class="syn-from">{{ row.from }}</span>
                        <span class="syn-arrow">→</span>
                        <el-tag
                          v-for="t in row.to"
                          :key="t"
                          size="small"
                          type="info"
                          class="syn-tag"
                        >
                          {{ t }}
                        </el-tag>
                      </div>
                    </div>

                    <!-- 召回数字 -->
                    <div
                      v-if="stage.key === 'recall' && stage.recallTotal !== undefined"
                      class="recall-info"
                    >
                      <div class="recall-line">
                        <span>初步召回：</span>
                        <span class="num">{{ stage.recallTotal }}</span>
                        <span>条</span>
                      </div>
                      <div class="recall-line sub">
                        <span>通过法规层级过滤：</span>
                        <span class="num">{{ stage.recallAfterLevel }}</span>
                        <span>条</span>
                      </div>
                      <div class="recall-line sub">
                        <span>通过参与标签过滤：</span>
                        <span class="num">{{ stage.recallAfterTag }}</span>
                        <span>条</span>
                      </div>
                    </div>

                    <!-- 打分进度 -->
                    <div v-if="stage.key === 'score' && stage.scoreRows?.length" class="score-rows">
                      <div v-for="row in stage.scoreRows" :key="row.name" class="score-row">
                        <span class="score-name">{{ row.name }}</span>
                        <el-progress
                          :percentage="row.percent"
                          :show-text="false"
                          :stroke-width="6"
                          class="score-bar"
                        />
                        <span class="score-percent">{{ row.percent }}%</span>
                        <span class="score-weight">权重 {{ row.weight }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 结论 -->
                <div v-if="msg.conclusionTyped" class="conclusion">
                  <el-icon class="conclusion-icon" :size="14"><MagicStick /></el-icon>
                  <span>{{ msg.conclusionTyped }}</span>
                </div>
              </div>

              <!-- 推荐卡片 -->
              <div v-if="msg.cards?.length" class="rec-cards">
                <div v-for="card in msg.cards" :key="card.rank" class="rec-card">
                  <div class="rec-card-head">
                    <span class="rec-rank">#{{ card.rank }}</span>
                    <span class="rec-name">{{ card.regulationName }}</span>
                    <el-tag size="small" :type="LEVEL_TAG_TYPE[card.level]">{{
                      LEVEL_LABEL[card.level]
                    }}</el-tag>
                    <el-tag size="small" type="info">{{ card.year }}</el-tag>
                  </div>
                  <div class="rec-card-no">{{ card.articleNo }}</div>
                  <div class="rec-card-text">{{ card.articleText }}</div>
                  <div class="rec-card-bottom">
                    <div class="rec-score-wrap">
                      <span class="rec-score-label">综合得分</span>
                      <span
                        class="rec-score-value"
                        :class="{ 'rec-score-low': card.lowConfidence }"
                        >{{ card.score.toFixed(2) }}</span
                      >
                      <el-progress
                        :percentage="Math.round(card.score * 100)"
                        :show-text="false"
                        :stroke-width="4"
                        :status="card.lowConfidence ? 'warning' : ''"
                        class="rec-score-bar"
                      />
                    </div>
                    <el-button type="primary" size="small" @click="handleCite(card)"
                      >引用 →</el-button
                    >
                  </div>
                  <div v-if="card.reason" class="rec-card-reason">💡 {{ card.reason }}</div>
                  <div v-if="card.lowConfidence" class="rec-card-warn">
                    ⚠ 低相关度，建议人工确认
                  </div>
                </div>
              </div>

              <div class="msg-time">{{ msg.time }}</div>
            </div>
          </div>
        </template>

        <!-- 生成中占位（首次进入还未输出时） -->
        <div v-if="generating && !messages.length" class="msg-row msg-ai">
          <div class="msg-avatar msg-avatar-ai">
            <el-icon :size="18"><ChatRound /></el-icon>
          </div>
          <div class="msg-bubble msg-bubble-ai">
            <span class="dots"><i></i><i></i><i></i></span>
          </div>
        </div>
      </div>

      <!-- 底部输入区 -->
      <div class="ai-footer">
        <div class="ai-input-wrap">
          <span class="ai-input-label">法规推荐</span>
          <el-input
            v-model="inputText"
            placeholder="请输入您的问题描述"
            :rows="3"
            type="textarea"
            resize="none"
            class="ai-input"
            @keydown.enter.exact.prevent="handleSend"
          />
          <el-button
            type="primary"
            circle
            :loading="generating"
            class="ai-send"
            @click="handleSend"
          >
            <el-icon v-if="!generating"><Promotion /></el-icon>
          </el-button>
        </div>
        <!-- 快捷能力 -->
        <div class="ai-quicks">
          <el-button
            v-for="q in QUICK_ACTIONS"
            :key="q.label"
            size="small"
            :type="q.active ? 'primary' : ''"
            :plain="!q.active"
            class="ai-quick"
            @click="handleQuickAction(q.label)"
          >
            {{ q.label }}
          </el-button>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<style lang="scss" scoped>
  .ai-wrap {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--el-bg-color-page);
  }

  .ai-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    color: #fff;
    background: linear-gradient(135deg, #6b7afd 0%, #5469f0 100%);
  }

  .ai-header-left {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .ai-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    font-size: 18px;
    background: rgb(255 255 255 / 20%);
    border-radius: 50%;
  }

  .ai-title {
    font-size: 16px;
    font-weight: 600;
  }

  .ai-collapse-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    color: #fff;
    cursor: pointer;
    background: rgb(255 255 255 / 20%);
    border-radius: 50%;
    transition:
      background 0.2s,
      transform 0.2s;
  }

  .ai-collapse-btn:hover {
    background: rgb(255 255 255 / 35%);
    transform: translateX(-2px);
  }

  .ai-collapse-btn:active {
    transform: translateX(0);
  }

  .ai-body {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    background: #f5f7fa;
  }

  .msg-row {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }

  .msg-user {
    flex-direction: row-reverse;
  }

  .msg-avatar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    font-size: 18px;
    border-radius: 50%;
  }

  .msg-avatar-ai {
    background: var(--el-color-primary-light-9);
  }

  .msg-avatar-user {
    color: #fff;
    background: var(--el-color-primary);
  }

  .msg-bubble {
    max-width: 85%;
    padding: 12px 14px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgb(0 0 0 / 5%);
  }

  .msg-bubble-user {
    background: var(--el-color-primary-light-8);
  }

  .msg-text {
    font-size: 13px;
    line-height: 1.7;
    color: var(--el-text-color-primary);
    white-space: pre-wrap;
  }

  .msg-time {
    margin-top: 6px;
    font-size: 11px;
    color: var(--el-text-color-secondary);
  }

  /* ============ 思考过程 ============ */
  .thinking {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* 单个阶段卡片 */
  .stage {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 14px;
    background: #fff;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    transition:
      border-color 0.2s,
      box-shadow 0.2s;
    animation: stage-in 0.3s ease;
  }

  @keyframes stage-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .stage-running {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 0 0 2px var(--el-color-primary-light-9);
  }

  .stage-done {
    border-color: var(--el-border-color-lighter);
  }

  .stage-head {
    display: flex;
    flex-wrap: nowrap;
    gap: 8px;
    align-items: center;
  }

  .stage-no {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    background: var(--el-color-primary);
    border-radius: 50%;
  }

  .stage-done .stage-no {
    background: var(--el-color-success);
  }

  .stage-icon {
    flex-shrink: 0;
    color: var(--el-color-primary);
  }

  .stage-title {
    flex: 1;
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .stage-status {
    display: flex;
    flex-shrink: 0;
    gap: 4px;
    align-items: center;
  }

  .stage-status-text {
    font-size: 12px;
  }

  .stage-status-text.running {
    color: var(--el-color-primary);
  }

  .stage-status-text.done {
    color: var(--el-color-success);
  }

  .stage-status-text.pending {
    color: var(--el-text-color-placeholder);
  }

  /* 等待中的三个跳动点 */
  .pending-dots {
    display: inline-flex;
    gap: 2px;
    align-items: center;
    margin-left: 2px;
  }

  .pending-dots i {
    display: block;
    width: 3px;
    height: 3px;
    background: var(--el-text-color-placeholder);
    border-radius: 50%;
    animation: pending-bounce 1.4s infinite ease-in-out;
  }

  .pending-dots i:nth-child(2) {
    animation-delay: 0.2s;
  }

  .pending-dots i:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes pending-bounce {
    0%,
    80%,
    100% {
      opacity: 0.4;
      transform: translateY(0);
    }

    40% {
      opacity: 1;
      transform: translateY(-3px);
    }
  }

  .stage-loading-icon {
    color: var(--el-color-primary);
  }

  .stage-check-icon {
    color: var(--el-color-success);
  }

  .stage-subtitle {
    padding-left: 30px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--el-text-color-regular);
  }

  .stage-detail {
    padding: 10px 12px;
    margin-top: 2px;
    background: var(--el-fill-color-light);
    border-radius: 6px;
  }

  /* 关键词 chips */
  .kw-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .kw-tag {
    animation: chip-in 0.25s ease;
  }

  @keyframes chip-in {
    from {
      opacity: 0;
      transform: scale(0.7);
    }

    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* 同义词扩展 */
  .syn-rows {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .syn-row {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
    font-size: 12px;
    animation: row-in 0.25s ease;
  }

  .syn-from {
    font-weight: 500;
    color: var(--el-color-primary);
  }

  .syn-arrow {
    color: var(--el-text-color-secondary);
  }

  @keyframes row-in {
    from {
      opacity: 0;
      transform: translateY(4px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* 召回信息 */
  .recall-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
  }

  .recall-line {
    display: flex;
    gap: 4px;
    align-items: baseline;
    color: var(--el-text-color-primary);
  }

  .recall-line.sub {
    color: var(--el-text-color-regular);
  }

  .recall-info .num {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-color-primary);
  }

  /* 打分进度 */
  .score-rows {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .score-row {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 12px;
  }

  .score-name {
    flex: 0 0 78px;
    color: var(--el-text-color-regular);
  }

  .score-bar {
    flex: 1;
  }

  .score-percent {
    flex: 0 0 38px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    text-align: right;
  }

  .score-weight {
    flex: 0 0 60px;
    font-size: 11px;
    color: var(--el-text-color-secondary);
  }

  /* 结论 */
  .conclusion {
    display: flex;
    gap: 6px;
    align-items: flex-start;
    padding: 10px 12px;
    margin-top: 4px;
    font-size: 13px;
    line-height: 1.7;
    color: var(--el-text-color-primary);
    background: var(--el-color-primary-light-9);
    border-radius: 8px;
  }

  .conclusion-icon {
    flex-shrink: 0;
    margin-top: 4px;
    color: var(--el-color-primary);
  }

  /* ============ 推荐卡片 ============ */
  .rec-cards {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 12px;
  }

  .rec-card {
    padding: 12px;
    cursor: default;
    background: #fff;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    transition:
      box-shadow 0.2s,
      transform 0.2s;
    animation: card-in 0.3s ease;
  }

  .rec-card:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 2px 8px rgb(64 158 255 / 15%);
  }

  @keyframes card-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .rec-card-head {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    margin-bottom: 6px;
  }

  .rec-rank {
    font-size: 13px;
    font-weight: 700;
    color: var(--el-color-primary);
  }

  .rec-name {
    flex: 1;
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .rec-card-no {
    margin-bottom: 6px;
    font-size: 12px;
    color: var(--el-text-color-regular);
  }

  .rec-card-text {
    margin-bottom: 8px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--el-text-color-regular);
  }

  .rec-card-bottom {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
  }

  .rec-score-wrap {
    display: flex;
    flex: 1;
    gap: 8px;
    align-items: center;
  }

  .rec-score-label {
    font-size: 11px;
    color: var(--el-text-color-secondary);
  }

  .rec-score-value {
    font-size: 14px;
    font-weight: 700;
    color: var(--el-color-primary);
  }

  .rec-score-low {
    color: var(--el-color-warning);
  }

  .rec-score-bar {
    flex: 1;
    max-width: 90px;
  }

  .rec-card-reason {
    padding-top: 6px;
    margin-top: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    border-top: 1px dashed var(--el-border-color-lighter);
  }

  .rec-card-warn {
    margin-top: 4px;
    font-size: 11px;
    color: var(--el-color-warning);
  }

  /* ============ 底部输入 ============ */
  .ai-footer {
    padding: 12px 16px 16px;
    background: #fff;
    border-top: 1px solid var(--el-border-color-lighter);
  }

  .ai-input-wrap {
    position: relative;
    display: flex;
    gap: 8px;
    align-items: flex-start;
    padding: 10px 12px;
    background: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color);
    border-radius: 10px;
    transition: border-color 0.2s;
  }

  .ai-input-wrap:focus-within {
    border-color: var(--el-color-primary);
  }

  .ai-input-label {
    flex-shrink: 0;
    padding: 2px 8px;
    margin-top: 6px;
    font-size: 12px;
    font-weight: 500;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-radius: 4px;
  }

  .ai-input {
    flex: 1;
  }

  .ai-input :deep(.el-textarea__inner) {
    padding: 4px 0;
    font-size: 13px;
    background: transparent;
    border: none;
    box-shadow: none;
  }

  .ai-send {
    flex-shrink: 0;
  }

  .ai-quicks {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 10px;
  }

  .ai-quick {
    font-size: 12px;
  }
</style>
