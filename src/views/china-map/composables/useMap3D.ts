import { ref, shallowRef, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { fetchMapData } from '@/api/map'
import {
  initScene,
  initCamera,
  generateMapObject3D,
  generateMapLabel2D,
  generateMapSpot,
  drawRadar,
  radarData,
  getDynamicMapScale
} from '@/utils/map3d'
import { mapConfig } from '@/utils/map3d/mapConfig'
import { generateFlyLines } from '@/utils/map3d/flyLine'
import { loadConeModels } from '@/utils/map3d/modelLoader'
import { useMapGUI } from './useMapGUI'
import { MapScale } from '@/utils/map3d/config'
import type { GeoJsonData, TooltipData } from '@/types/map'
import gsap from 'gsap'

export function useMap3D(containerRef: Ref<HTMLElement | null>) {
  // 场景引用（使用 shallowRef 避免深度响应式）
  const sceneRef = shallowRef<THREE.Scene | null>(null)
  const cameraRef = shallowRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = shallowRef<THREE.WebGLRenderer | null>(null)
  const css2dRendererRef = shallowRef<CSS2DRenderer | null>(null)
  const controlsRef = shallowRef<OrbitControls | null>(null)
  const mapObjectRef = shallowRef<THREE.Object3D | null>(null)
  const lightRef = shallowRef<THREE.PointLight | null>(null)
  const cameraHelperRef = shallowRef<THREE.CameraHelper | null>(null)
  const axesHelperRef = shallowRef<THREE.AxesHelper | null>(null)
  const lightHelperRef = shallowRef<THREE.PointLightHelper | null>(null)

  // 响应式状态
  const mapData = ref<GeoJsonData | null>(null)
  const loading = ref(true)
  const tooltip = ref<TooltipData>({
    visible: false,
    x: 0,
    y: 0,
    name: ''
  })

  // 地图层级状态
  const currentAdcode = ref('100000')
  const currentLevel = ref<'country' | 'province' | 'city'>('country')
  const projectionParams = ref({
    center: [105, 36] as [number, number],
    scale: 100
  })

  // 面包屑导航
  const breadcrumb = ref<Array<{ name: string; adcode: string }>>([
    { name: '中国', adcode: '100000' }
  ])

  // 动画相关
  let animationId: number | null = null
  const radarMeshList = shallowRef<THREE.Mesh[]>([])
  const spotList = shallowRef<any[]>([])
  const flyLineList = shallowRef<THREE.Line[]>([])
  const flySpotList = shallowRef<any[]>([])
  const modelMixers = shallowRef<THREE.AnimationMixer[]>([])
  const clock = new THREE.Clock()
  const ratio = { value: 0 }

  // 鼠标交互相关
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  let lastPick: any = null

  // 初始化场景
  const initThreeScene = () => {
    if (!containerRef.value) return

    const container = containerRef.value

    // 创建场景
    const scene = initScene()
    sceneRef.value = scene

    // 创建相机
    const { camera, cameraHelper } = initCamera(container)
    cameraRef.value = camera
    cameraHelperRef.value = cameraHelper

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)
    rendererRef.value = renderer

    // 创建 CSS2D 渲染器
    const css2dRenderer = new CSS2DRenderer()
    css2dRenderer.setSize(container.clientWidth, container.clientHeight)
    css2dRenderer.domElement.style.position = 'absolute'
    css2dRenderer.domElement.style.top = '0'
    css2dRenderer.domElement.style.pointerEvents = 'none'
    container.appendChild(css2dRenderer.domElement)
    css2dRendererRef.value = css2dRenderer

    // 创建控制器
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controlsRef.value = controls

    // 添加光源
    const light = new THREE.PointLight(0xffffff, 1.5)
    light.position.set(0, -5, 30)
    scene.add(light)
    lightRef.value = light

    // 创建辅助对象
    axesHelperRef.value = new THREE.AxesHelper(100)
    lightHelperRef.value = new THREE.PointLightHelper(light)
  }

  // 加载地图数据
  const loadMapData = async (adcode: string = '100000') => {
    try {
      loading.value = true
      const response = await fetchMapData(adcode)
      mapData.value = response
      drawMap(response)
    } catch (error) {
      console.error('Failed to load map data:', error)
    } finally {
      loading.value = false
    }
  }

  // 绘制地图
  const drawMap = async (data: GeoJsonData) => {
    if (!sceneRef.value) return

    // 保存光源和辅助对象
    const lights: THREE.Light[] = []
    const helpers: THREE.Object3D[] = []
    sceneRef.value.traverse((child) => {
      if (child instanceof THREE.Light) {
        lights.push(child)
      }
      if (
        child instanceof THREE.CameraHelper ||
        child instanceof THREE.AxesHelper ||
        child instanceof THREE.PointLightHelper
      ) {
        helpers.push(child)
      }
    })

    // 清理 CSS2D 标签的 DOM 元素
    sceneRef.value.traverse((child) => {
      if (child instanceof CSS2DObject) {
        child.element?.remove()
      }
    })

    // 清空整个场景
    while (sceneRef.value.children.length > 0) {
      sceneRef.value.remove(sceneRef.value.children[0])
    }

    // 重新添加光源和辅助对象
    lights.forEach((light) => sceneRef.value?.add(light))
    helpers.forEach((helper) => sceneRef.value?.add(helper))

    // 清空引用
    mapObjectRef.value = null
    spotList.value = []
    radarMeshList.value = []
    flyLineList.value = []
    flySpotList.value = []
    modelMixers.value = []

    // 生成地图 3D 模型
    const { mapObject3D, label2dData } = generateMapObject3D(data, projectionParams.value)
    mapObjectRef.value = mapObject3D
    sceneRef.value.add(mapObject3D)

    // 计算动态缩放并应用 GSAP 动画
    if (containerRef.value) {
      const mapScale = getDynamicMapScale(mapObject3D, containerRef.value)
      gsap.to(mapObject3D.scale, {
        x: mapScale,
        y: mapScale,
        z: 1,
        duration: 1
      })
    }

    // 生成 2D 标签
    const labelObject2D = generateMapLabel2D(label2dData)
    labelObject2D.userData.isLabel = true
    mapObject3D.add(labelObject2D)

    // 生成点位
    const { spotObject3D, spotList: spots } = generateMapSpot(label2dData)
    spotObject3D.userData.isSpot = true
    mapObject3D.add(spotObject3D)
    spotList.value = spots

    // 添加雷达
    const radarMeshes: THREE.Mesh[] = []
    radarData.forEach((item) => {
      const radarMesh = drawRadar(item, ratio)
      radarMesh.userData.isRadar = true
      radarMeshes.push(radarMesh)
      sceneRef.value?.add(radarMesh)
    })
    radarMeshList.value = radarMeshes

    // 生成飞线
    if (label2dData.length > 1) {
      const { flyLines, flySpots } = generateFlyLines(label2dData, 5)
      flyLineList.value = flyLines
      flySpotList.value = flySpots

      flyLines.forEach((line) => {
        line.userData.isFlyLine = true
        sceneRef.value?.add(line)
      })
      flySpots.forEach((spot) => {
        spot.userData.isFlyLine = true
        sceneRef.value?.add(spot)
      })
    }

    // 加载 3D 模型
    try {
      const { modelObject3D, modelMixers: mixers } = await loadConeModels(label2dData)
      modelObject3D.userData.isModel = true
      sceneRef.value.add(modelObject3D)
      modelMixers.value = mixers
    } catch (error) {
      console.warn('Failed to load 3D models:', error)
    }
  }

  // 动画循环
  const animate = () => {
    animationId = requestAnimationFrame(animate)

    if (controlsRef.value) {
      controlsRef.value.update()
    }

    // 更新雷达动画
    ratio.value += 0.01

    // 更新模型动画
    const delta = clock.getDelta()
    modelMixers.value.forEach((mixer) => mixer.update(delta))

    // 更新点位动画
    spotList.value.forEach((mesh: any) => {
      mesh._s += 0.01
      mesh.scale.set(1 * mesh._s, 1 * mesh._s, 1 * mesh._s)
      if (mesh._s <= 2) {
        mesh.material.opacity = 2 - mesh._s
      } else {
        mesh._s = 1
      }
    })

    // 更新飞行点位置
    flySpotList.value.forEach((mesh: any) => {
      mesh._s += 0.003
      const tankPosition = mesh.curve.getPointAt(mesh._s % 1)
      mesh.position.set(tankPosition.x, tankPosition.y, tankPosition.z)
    })

    // 更新 raycaster 和高亮效果
    if (cameraRef.value && sceneRef.value) {
      raycaster.setFromCamera(pointer, cameraRef.value)
      const intersects = raycaster.intersectObjects(sceneRef.value.children, true)

      // 重置上一个高亮对象
      if (lastPick) {
        const color = mapConfig.mapColorGradient[Math.floor(Math.random() * 4)]
        lastPick.object.material[0].color.set(color)
        lastPick.object.material[0].opacity = mapConfig.mapOpacity
      }
      lastPick = null

      // 查找新的高亮对象
      lastPick = intersects.find((item: any) => item.object.userData.isChangeColor)

      if (lastPick) {
        const properties = lastPick.object.parent?.userData || {}
        if (lastPick.object.material[0]) {
          lastPick.object.material[0].color.set(mapConfig.mapHoverColor)
          lastPick.object.material[0].opacity = 1
        }

        tooltip.value = {
          visible: true,
          x: pointer.x,
          y: pointer.y,
          name: properties.name || '未知'
        }
      } else {
        tooltip.value.visible = false
      }
    }

    if (rendererRef.value && sceneRef.value && cameraRef.value) {
      rendererRef.value.render(sceneRef.value, cameraRef.value)
    }

    if (css2dRendererRef.value && sceneRef.value && cameraRef.value) {
      css2dRendererRef.value.render(sceneRef.value, cameraRef.value)
    }
  }

  // 处理窗口大小调整
  const handleResize = () => {
    if (!containerRef.value || !cameraRef.value || !rendererRef.value || !css2dRendererRef.value)
      return

    const container = containerRef.value
    const width = container.clientWidth
    const height = container.clientHeight

    cameraRef.value.aspect = width / height
    cameraRef.value.updateProjectionMatrix()

    rendererRef.value.setSize(width, height)
    css2dRendererRef.value.setSize(width, height)
  }

  // 处理鼠标移动
  const handleMouseMove = (event: MouseEvent) => {
    if (!containerRef.value) return

    const rect = containerRef.value.getBoundingClientRect()
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  }

  // 处理双击下钻
  const handleDblClick = async (event: MouseEvent) => {
    if (!containerRef.value || !cameraRef.value || !sceneRef.value) return

    const container = containerRef.value
    const rect = container.getBoundingClientRect()
    const pointer = new THREE.Vector2()
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(pointer, cameraRef.value)
    const intersects = raycaster.intersectObjects(sceneRef.value.children, true)

    const target = intersects.find((item: any) => item.object.userData.isChangeColor)
    if (target && target.object.parent) {
      const properties = (target.object.parent as any).customProperties
      if (!properties || !properties.adcode) return

      // 更新状态
      currentAdcode.value = properties.adcode
      currentLevel.value = properties.level || 'province'

      // 更新投影参数
      const scale = MapScale[currentLevel.value] || 200
      projectionParams.value = {
        center: properties.centroid || properties.center || [105, 36],
        scale
      }

      // 添加到面包屑
      breadcrumb.value.push({
        name: properties.name,
        adcode: properties.adcode
      })

      // 相机动画过渡
      if (cameraRef.value) {
        gsap.to(cameraRef.value.position, {
          duration: 1.5,
          z: 80 - (scale - 100) / 10,
          ease: 'power2.inOut'
        })
      }

      // 加载新地图数据
      await loadMapData(properties.adcode)
    }
  }

  // 返回上一级
  const goBack = async (index: number) => {
    const target = breadcrumb.value[index]
    breadcrumb.value = breadcrumb.value.slice(0, index + 1)

    currentAdcode.value = target.adcode
    currentLevel.value = index === 0 ? 'country' : 'province'

    // 更新投影参数
    const scale = index === 0 ? 100 : 200
    projectionParams.value = {
      center: index === 0 ? [105, 36] : projectionParams.value.center,
      scale
    }

    // 相机动画
    if (cameraRef.value) {
      gsap.to(cameraRef.value.position, {
        duration: 1.5,
        z: 80,
        ease: 'power2.inOut'
      })
    }

    await loadMapData(target.adcode)
  }

  // 清理资源
  const cleanup = () => {
    if (animationId) {
      cancelAnimationFrame(animationId)
    }

    if (sceneRef.value) {
      sceneRef.value.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry?.dispose()
          if (Array.isArray(object.material)) {
            object.material.forEach((m) => m.dispose())
          } else {
            object.material?.dispose()
          }
        }
      })
    }

    if (rendererRef.value) {
      rendererRef.value.dispose()
      rendererRef.value.domElement.remove()
    }

    if (css2dRendererRef.value) {
      css2dRendererRef.value.domElement.remove()
    }

    if (controlsRef.value) {
      controlsRef.value.dispose()
    }

    window.removeEventListener('resize', handleResize)
    containerRef.value?.removeEventListener('mousemove', handleMouseMove)
    containerRef.value?.removeEventListener('dblclick', handleDblClick)
  }

  // 初始化
  onMounted(() => {
    initThreeScene()
    loadMapData()
    animate()

    window.addEventListener('resize', handleResize)
    containerRef.value?.addEventListener('mousemove', handleMouseMove)
    containerRef.value?.addEventListener('dblclick', handleDblClick)
  })

  onUnmounted(() => {
    cleanup()
  })

  // 初始化 GUI
  useMapGUI(
    sceneRef,
    mapObjectRef,
    cameraRef,
    lightRef,
    cameraHelperRef,
    axesHelperRef,
    lightHelperRef
  )

  return {
    loading,
    tooltip,
    mapData,
    breadcrumb,
    goBack
  }
}
