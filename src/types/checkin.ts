/**
 * 打卡类型枚举
 */
export enum CheckinTypeEnum {
  /** 上班打卡 */
  CLOCK_IN = 1,
  /** 下班打卡 */
  CLOCK_OUT = 2
}

/**
 * 打卡记录
 */
export interface CheckinRecord {
  /** 打卡ID */
  id: number
  /** 项目ID */
  projectId: number
  /** 项目名称 */
  projectName: string
  /** 打卡人员ID */
  userId: number
  /** 打卡人员姓名 */
  userName: string
  /** 打卡时间 */
  checkinTime: string
  /** 打卡类型：1-上班打卡，2-下班打卡 */
  checkinType: number
  /** 打卡地点 */
  location: string
  /** GPS经度 */
  longitude: number
  /** GPS纬度 */
  latitude: number
  /** 工作内容 */
  workContent: string
  /** 现场照片列表 */
  photos: string[]
  /** 备注说明 */
  remark?: string
  /** 创建时间 */
  createTime: string
}

/**
 * 打卡记录查询参数
 */
export interface CheckinListParams {
  /** 项目ID */
  projectId?: number
  /** 打卡人员ID */
  userId?: number | string | null
  /** 打卡类型 */
  checkinType?: number | string | null
  /** 开始时间 */
  startTime?: string
  /** 结束时间 */
  endTime?: string
  /** 当前页码 */
  page: number
  /** 每页大小 */
  pageSize: number
}

/**
 * 打卡提交参数
 */
export interface CheckinSubmitParams {
  /** 项目ID */
  projectId: number
  /** 打卡类型：1-上班打卡，2-下班打卡 */
  checkinType: number
  /** 打卡地点 */
  location: string
  /** GPS经度 */
  longitude: number
  /** GPS纬度 */
  latitude: number
  /** 工作内容 */
  workContent: string
  /** 现场照片列表 */
  photos: string[]
  /** 备注说明 */
  remark?: string
}

/**
 * 打卡统计数据
 */
export interface CheckinStatistics {
  /** 总打卡次数 */
  totalCount: number
  /** 上班打卡次数 */
  clockInCount: number
  /** 下班打卡次数 */
  clockOutCount: number
  /** 参与人数 */
  userCount: number
  /** 涉及项目数 */
  projectCount: number
  /** 打卡天数 */
  dateCount: number
  /** 按人员统计 */
  userStats: UserCheckinStats[]
  /** 按项目统计 */
  projectStats: ProjectCheckinStats[]
  /** 按日期统计 */
  dateStats: DateCheckinStats[]
}

/**
 * 按人员统计
 */
export interface UserCheckinStats {
  /** 人员ID */
  userId: number
  /** 人员姓名 */
  userName: string
  /** 打卡次数 */
  checkinCount: number
  /** 工作时长（小时） */
  workHours: number
  /** 打卡记录 */
  records?: CheckinRecord[]
}

/**
 * 按项目统计
 */
export interface ProjectCheckinStats {
  /** 项目ID */
  projectId: number
  /** 项目名称 */
  projectName: string
  /** 打卡次数 */
  checkinCount: number
  /** 参与人数 */
  userCount: number
}

/**
 * 按日期统计
 */
export interface DateCheckinStats {
  /** 日期 */
  date: string
  /** 打卡次数 */
  checkinCount: number
  /** 参与人数 */
  userCount: number
}

/**
 * GPS位置信息
 */
export interface GPSLocation {
  /** 经度 */
  longitude: number
  /** 纬度 */
  latitude: number
  /** 地址 */
  address: string
}
