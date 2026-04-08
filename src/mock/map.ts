import type { MapGeoJsonResponse } from '@/types/api'

// 中国地图 GeoJSON 数据（简化版，仅包含主要省份）
const chinaMapData: MapGeoJsonResponse = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        name: '北京市',
        adcode: '110000',
        center: [116.405285, 39.904989],
        centroid: [116.41995, 40.18994],
        childrenNum: 16,
        level: 'province',
        parent: { adcode: '100000' },
        subFeatureIndex: 0,
        acroutes: [100000]
      },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [116.4, 39.9],
              [116.5, 39.9],
              [116.5, 40.0],
              [116.4, 40.0],
              [116.4, 39.9]
            ]
          ]
        ]
      }
    }
  ]
}

/**
 * Mock 地图数据 API
 */
export default [
  {
    url: '/api/map/data',
    method: 'get',
    response: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            code: 200,
            message: 'success',
            data: chinaMapData,
            success: true,
            timestamp: Date.now()
          })
        }, 300)
      })
    }
  }
]
