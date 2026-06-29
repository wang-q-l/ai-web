<!-- 标注覆盖层：全局挂载，整合标注点、详情面板、编辑器 -->
<template>
  <div class="annotation-overlay">
    <!-- 浮动控制按钮（可拖动，鼠标离开后半透明） -->
    <div
      class="annotation-fab"
      :class="{ 'annotation-fab-idle': fabIdle }"
      :style="{ bottom: fabPos.bottom + 'px', right: fabPos.right + 'px' }"
      @mousedown.stop="handleFabDragStart"
      @mouseenter="fabIdle = false"
      @mouseleave="startFabIdleTimer"
      @click.stop="handleFabClick"
    >
      <span class="fab-icon">📌</span>
      <span v-if="annotations.length > 0" class="fab-badge">{{ annotations.length }}</span>
    </div>

    <!-- 标注点：每个 dot 自己决定是否显示及渲染到哪个容器 -->
    <template v-if="visible">
      <AnnotationDot
        v-for="(ann, idx) in annotations"
        :key="ann.id"
        :annotation="ann"
        :index="idx"
        :is-active="activeId === ann.id"
        :edit-mode="editMode"
        :modal-open="modalOpen"
        :drawer-open="drawerOpen"
        @click="handleDotClick"
        @move="handleDotMove"
      />
    </template>

    <!-- 详情面板：teleport 到 body -->
    <Teleport to="body">
      <AnnotationPanel
        :annotation="activeAnnotation"
        :index="activeIndex"
        :edit-mode="editMode"
        @close="activeId = ''"
        @edit="openEditor"
        @delete="handleDelete"
      />
    </Teleport>

    <!-- 编辑模式工具栏 -->
    <div v-if="editMode" class="annotation-toolbar">
      <span class="toolbar-label">标注编辑模式</span>
      <span class="toolbar-hint">点击页面添加标注</span>
      <button class="toolbar-btn" @click="exportAnnotations">导出</button>
      <button class="toolbar-btn toolbar-btn-exit" @click="toggleEditMode">退出编辑</button>
    </div>

    <!-- 点击页面添加标注（编辑模式下，弹窗打开时隐藏避免遮挡） -->
    <div
      v-if="editMode && !editorVisible"
      class="annotation-click-layer"
      @click="handleAddClick"
    ></div>

    <!-- 编辑器弹窗：teleport 到 body，避免被 overlay stacking context 限制 -->
    <Teleport to="body">
      <AnnotationEditor
        :visible="editorVisible"
        :edit-item="editorItem"
        @save="handleEditorSave"
        @cancel="editorVisible = false"
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
  /**
   * 标注覆盖层组件
   * 全局挂载在 MainLayout 中，提供标注查看和编辑功能
   * 快捷键 Ctrl+Shift+A 切换编辑模式
   */
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import AnnotationDot from './AnnotationDot.vue'
  import AnnotationPanel from './AnnotationPanel.vue'
  import AnnotationEditor from './AnnotationEditor.vue'
  import { useAnnotation } from './useAnnotation'
  import type { AnnotationItem, AnnotationCategory } from './types'

  const {
    visible,
    editMode,
    activeId,
    annotations,
    addAnnotation,
    updateAnnotation,
    removeAnnotation,
    exportAnnotations,
    toggleVisible,
    toggleEditMode
  } = useAnnotation()

  // FAB 位置（距右下角距离，支持拖动）
  const fabPos = ref({ bottom: 24, right: 24 })
  // FAB 闲置状态（鼠标离开 2s 后半透明）
  const fabIdle = ref(false)
  let fabIdleTimer: number | null = null

  const startFabIdleTimer = () => {
    if (fabIdleTimer) clearTimeout(fabIdleTimer)
    fabIdleTimer = window.setTimeout(() => {
      fabIdle.value = true
    }, 2000)
  }

  // FAB 拖动
  let fabMoved = false

  const handleFabDragStart = (e: MouseEvent) => {
    fabMoved = false
    fabIdle.value = false
    if (fabIdleTimer) clearTimeout(fabIdleTimer)

    const startX = e.clientX
    const startY = e.clientY
    const startRight = fabPos.value.right
    const startBottom = fabPos.value.bottom

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      if (!fabMoved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) fabMoved = true
      if (fabMoved) {
        fabPos.value = {
          right: Math.max(8, startRight - dx),
          bottom: Math.max(8, startBottom - dy)
        }
      }
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      startFabIdleTimer()
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  // 点击 FAB（非拖动时才切换显隐）
  const handleFabClick = () => {
    if (!fabMoved) toggleVisible()
  }

  // 当前选中的标注
  const activeAnnotation = computed(
    () => annotations.value.find((a) => a.id === activeId.value) || null
  )
  const activeIndex = computed(() => annotations.value.findIndex((a) => a.id === activeId.value))

  // 点击标注点
  const handleDotClick = (id: string) => {
    activeId.value = activeId.value === id ? '' : id
  }

  // 拖拽移动标注点：直接存屏幕坐标
  const handleDotMove = (id: string, pos: { x: number; y: number }) => {
    updateAnnotation(id, { position: pos, type: 'position', selector: '' })
  }

  // 编辑器状态
  const editorVisible = ref(false)
  const editorItem = ref<AnnotationItem | null>(null)
  const pendingPosition = ref<{ x: number; y: number }>({ x: 0, y: 0 })

  // 编辑模式下点击页面添加标注
  const handleAddClick = (e: MouseEvent) => {
    // 直接存屏幕坐标，dot 渲染时用 fixed 定位
    pendingPosition.value = { x: e.clientX, y: e.clientY }
    editorItem.value = null
    editorVisible.value = true
  }

  // 打开编辑器（编辑已有标注）
  const openEditor = (id: string) => {
    editorItem.value = annotations.value.find((a) => a.id === id) || null
    editorVisible.value = true
  }

  // 编辑器保存
  const handleEditorSave = (data: {
    title: string
    content: string
    category: AnnotationCategory
    source: string
    color: string
  }) => {
    if (editorItem.value) {
      updateAnnotation(editorItem.value.id, data)
    } else {
      const newItem: AnnotationItem = {
        id: `ann-${Date.now()}`,
        type: 'position',
        selector: '',
        position: pendingPosition.value,
        title: data.title,
        content: data.content,
        category: data.category,
        source: data.source,
        color: data.color || undefined,
        createdAt: new Date().toISOString().split('T')[0]
      }
      addAnnotation(newItem)
    }
    editorVisible.value = false
  }

  // 删除标注
  const handleDelete = (id: string) => {
    removeAnnotation(id)
    activeId.value = ''
  }

  // 快捷键 Ctrl+Shift+A 切换编辑模式
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
      e.preventDefault()
      toggleEditMode()
    }
  }

  // 弹窗/抽屉状态检测：监听 body 变化，区分 modal 和 drawer
  // 支持 Ant Design（ant-scrolling-effect）和 Element Plus（el-popup-parent--hidden）
  const modalOpen = ref(false)
  const drawerOpen = ref(false)
  let modalObserver: MutationObserver | null = null

  const checkOverlayState = () => {
    // 元素存在且可见（排除 display:none / visibility:hidden / opacity:0 / 0 宽度）
    const isShown = (el: Element | null): boolean => {
      if (!el) return false
      const style = getComputedStyle(el as HTMLElement)
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return false
      }
      return (el as HTMLElement).getBoundingClientRect().width > 0
    }
    const zIndexOf = (el: Element): number => {
      // Element Plus 的层级 z-index 在 .el-overlay 祖先上，Ant Design 在元素自身
      const target = (el.closest('.el-overlay') as HTMLElement | null) || (el as HTMLElement)
      const z = parseInt(getComputedStyle(target).zIndex, 10)
      return Number.isNaN(z) ? 0 : z
    }

    // 收集所有可见浮层（弹窗 / 抽屉），按 z-index 取最顶层，据此判定当前上下文
    // 兼容 Ant Design 与 Element Plus；可正确处理"抽屉内打开弹窗"等嵌套场景
    type Layer = { kind: 'modal' | 'drawer'; z: number }
    const layers: Layer[] = []
    const collect = (sel: string, kind: 'modal' | 'drawer') => {
      document.querySelectorAll(sel).forEach((el) => {
        if (isShown(el)) layers.push({ kind, z: zIndexOf(el) })
      })
    }
    collect('.ant-modal-wrap', 'modal')
    collect('.el-overlay-dialog', 'modal')
    collect('.ant-drawer-open', 'drawer')
    collect('.el-drawer', 'drawer')

    if (layers.length === 0) {
      modalOpen.value = false
      drawerOpen.value = false
      return
    }
    // 取 z-index 最大的浮层为当前激活上下文
    const top = layers.reduce((a, b) => (b.z >= a.z ? b : a))
    modalOpen.value = top.kind === 'modal'
    drawerOpen.value = top.kind === 'drawer'
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
    startFabIdleTimer()
    document.addEventListener('click', handleOutsideClick, true)

    // 监听 body 子树变化：弹窗/抽屉的挂载与卸载（Element Plus teleport 到 body）
    // 都会增删 body 下的节点，据此实时判断弹窗/抽屉开关状态
    modalObserver = new MutationObserver(checkOverlayState)
    modalObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    })
    checkOverlayState()
  })
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
    if (fabIdleTimer) clearTimeout(fabIdleTimer)
    document.removeEventListener('click', handleOutsideClick, true)
    modalObserver?.disconnect()
  })

  // 点击外部关闭详情面板（标注点、面板本身、编辑器弹窗打开时除外）
  const handleOutsideClick = (e: MouseEvent) => {
    if (!activeId.value) return
    if (editorVisible.value) return // 编辑器弹窗打开时不关闭详情面板
    const target = e.target as Element
    if (
      target.closest('.annotation-panel') ||
      target.closest('.annotation-dot') ||
      target.closest('.annotation-fab')
    )
      return
    activeId.value = ''
  }
</script>

<style scoped>
  /* 覆盖层：fixed 覆盖整个视口，pointer-events: none 不阻断页面交互 */

  /* AnnotationDot 的 position: absolute 相对此容器定位，坐标用视口百分比 */
  .annotation-overlay {
    position: fixed;
    inset: 0;
    z-index: 9980;
    pointer-events: none;
  }

  /* 需要响应点击的子元素单独开启 pointer-events */
  .annotation-fab,
  .annotation-toolbar,
  .annotation-click-layer {
    pointer-events: auto;
  }

  /* 浮动按钮 */
  .annotation-fab {
    position: fixed;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    color: #fff;
    cursor: grab;
    user-select: none;
    background: #1677ff;
    border-radius: 50%;
    box-shadow: 0 4px 12px rgb(22 119 255 / 40%);
    opacity: 1;
    transition:
      opacity 0.3s,
      transform 0.2s;
  }

  .annotation-fab:hover {
    opacity: 1 !important;
    transform: scale(1.1);
  }

  .annotation-fab:active {
    cursor: grabbing;
  }

  /* 闲置状态：透明度降低，不干扰页面 */
  .annotation-fab-idle {
    opacity: 0.25;
  }

  .fab-icon {
    font-size: 20px;
  }

  .fab-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    font-size: 10px;
    color: #fff;
    background: #ff4d4f;
    border-radius: 9px;
  }

  /* 编辑模式工具栏 */
  .annotation-toolbar {
    position: fixed;
    top: 60px;
    left: 50%;
    z-index: 9999;
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 8px 16px;
    font-size: 13px;
    color: #fff;
    background: rgb(0 0 0 / 85%);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgb(0 0 0 / 20%);
    transform: translateX(-50%);
  }

  .toolbar-label {
    font-weight: 600;
  }

  .toolbar-hint {
    font-size: 12px;
    color: rgb(255 255 255 / 60%);
  }

  .toolbar-btn {
    padding: 3px 10px;
    font-size: 12px;
    color: #fff;
    cursor: pointer;
    background: transparent;
    border: 1px solid rgb(255 255 255 / 30%);
    border-radius: 4px;
  }

  .toolbar-btn:hover {
    background: rgb(255 255 255 / 15%);
  }

  .toolbar-btn-exit {
    color: #ff4d4f;
    border-color: #ff4d4f;
  }

  /* 编辑模式点击层 */
  .annotation-click-layer {
    position: fixed;
    inset: 0;
    z-index: 9989;
    cursor: crosshair;
  }
</style>
