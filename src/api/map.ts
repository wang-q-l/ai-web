import request from '@/utils/http'
import type { MapGeoJsonResponse } from '@/types/api'

/**
 * 获取地图 GeoJSON 数据
 * 先尝试 _full.json（含子级），404 时降级为只含自身边界的 .json
 */
export async function fetchMapData(adcode: string = '100000') {
  const isDev = import.meta.env.DEV
  const base = isDev
    ? `/map-api/areas_v3/bound`
    : `https://geo.datav.aliyun.com/areas_v3/bound`

  try {
    return await request.get<MapGeoJsonResponse>({
      url: `${base}/${adcode}_full.json`,
      skipResponseValidation: true,
      showErrorMessage: false  // 静默失败，由降级逻辑处理 404
    })
  } catch {
    // _full.json 不存在（县级等），降级为只含自身边界
    return await request.get<MapGeoJsonResponse>({
      url: `${base}/${adcode}.json`,
      skipResponseValidation: true
    })
  }
}
