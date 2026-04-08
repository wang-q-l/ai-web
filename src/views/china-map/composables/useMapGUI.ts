import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import * as dat from 'dat.gui'
import * as THREE from 'three'
import { mapConfig } from '@/utils/map3d/mapConfig'

export function useMapGUI(
  sceneRef: Ref<THREE.Scene | null>,
  mapObjectRef: Ref<THREE.Object3D | null>,
  cameraRef: Ref<THREE.PerspectiveCamera | null>,
  lightRef: Ref<THREE.PointLight | null>,
  cameraHelperRef: Ref<THREE.CameraHelper | null>,
  axesHelperRef: Ref<THREE.AxesHelper | null>,
  lightHelperRef: Ref<THREE.PointLightHelper | null>
) {
  let gui: dat.GUI | null = null

  const initGUI = () => {
    gui = new dat.GUI()
    gui.width = 300

    // 颜色配置
    const colorConfig = {
      mapColor: mapConfig.mapColor,
      mapHoverColor: mapConfig.mapHoverColor,
      mapSideColor1: mapConfig.mapSideColor1,
      mapSideColor2: mapConfig.mapSideColor2,
      topLineColor:
        typeof mapConfig.topLineColor === 'number'
          ? `#${mapConfig.topLineColor.toString(16).padStart(6, '0')}`
          : mapConfig.topLineColor
    }

    const colorFolder = gui.addFolder('颜色配置')

    colorFolder
      .addColor(colorConfig, 'mapColor')
      .name('地图颜色')
      .onChange((value: string) => {
        mapConfig.mapColor = value
        if (mapObjectRef.value) {
          mapObjectRef.value.traverse((obj: any) => {
            if (obj.material && obj.material[0] && obj.userData.isChangeColor) {
              obj.material[0].color.set(value)
            }
          })
        }
      })

    colorFolder
      .addColor(colorConfig, 'mapHoverColor')
      .name('地图Hover颜色')
      .onChange((value: string) => {
        mapConfig.mapHoverColor = value
      })

    colorFolder
      .addColor(colorConfig, 'mapSideColor1')
      .name('侧面渐变1')
      .onChange((value: string) => {
        mapConfig.mapSideColor1 = value
        if (mapObjectRef.value) {
          mapObjectRef.value.traverse((obj: any) => {
            if (
              obj.material &&
              obj.material[1] &&
              obj.material[1].uniforms &&
              obj.material[1].uniforms.color1
            ) {
              obj.material[1].uniforms.color1.value.set(value)
            }
          })
        }
      })

    colorFolder
      .addColor(colorConfig, 'mapSideColor2')
      .name('侧面渐变2')
      .onChange((value: string) => {
        mapConfig.mapSideColor2 = value
        if (mapObjectRef.value) {
          mapObjectRef.value.traverse((obj: any) => {
            if (
              obj.material &&
              obj.material[1] &&
              obj.material[1].uniforms &&
              obj.material[1].uniforms.color2
            ) {
              obj.material[1].uniforms.color2.value.set(value)
            }
          })
        }
      })

    colorFolder
      .addColor(colorConfig, 'topLineColor')
      .name('顶线颜色')
      .onChange((value: string) => {
        mapConfig.topLineColor = parseInt(value.replace('#', ''), 16)
        if (mapObjectRef.value) {
          mapObjectRef.value.traverse((obj: any) => {
            if (obj.type === 'Line2' && obj.material) {
              obj.material.color.set(value)
            }
          })
        }
      })

    colorFolder.open()

    // 辅助对象配置
    const helperFolder = gui.addFolder('辅助对象')
    const helperConfig = {
      cameraHelper: false,
      axesHelper: false,
      lightHelper: false
    }

    helperFolder
      .add(helperConfig, 'cameraHelper')
      .name('显示CameraHelper')
      .onChange((v: boolean) => {
        if (!sceneRef.value || !cameraHelperRef.value) return
        if (v) {
          sceneRef.value.add(cameraHelperRef.value)
        } else {
          sceneRef.value.remove(cameraHelperRef.value)
        }
      })

    helperFolder
      .add(helperConfig, 'axesHelper')
      .name('显示AxesHelper')
      .onChange((v: boolean) => {
        if (!sceneRef.value || !axesHelperRef.value) return
        if (v) {
          sceneRef.value.add(axesHelperRef.value)
        } else {
          sceneRef.value.remove(axesHelperRef.value)
        }
      })

    helperFolder
      .add(helperConfig, 'lightHelper')
      .name('显示LightHelper')
      .onChange((v: boolean) => {
        if (!sceneRef.value || !lightHelperRef.value) return
        if (v) {
          sceneRef.value.add(lightHelperRef.value)
        } else {
          sceneRef.value.remove(lightHelperRef.value)
        }
      })

    // 光强度配置
    if (lightRef.value) {
      const lightConfig = { intensity: lightRef.value.intensity }
      gui
        .add(lightConfig, 'intensity', 0, 5)
        .name('光强度')
        .onChange((v: number) => {
          if (lightRef.value) {
            lightRef.value.intensity = v
          }
        })
    }
  }

  onMounted(() => {
    initGUI()
  })

  onUnmounted(() => {
    gui?.destroy()
  })
}
