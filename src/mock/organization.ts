/**
 * 组织管理 Mock 数据
 */

import type { Department, AdminUser, Role, Position, Menu } from '@/types/api'

// 模拟部门数据（基于江苏石油真实组织架构）
let mockDepartments: Department[] = [
  {
    id: 1,
    name: '江苏石油分公司',
    parentId: null,
    code: 'JSSY',
    type: '省公司',
    leader: '王建国',
    phone: '13800138001',
    sort: 1,
    status: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2025-03-01 09:00:00',
    children: [
      {
        id: 2,
        name: '江苏南京石油分公司',
        parentId: 1,
        code: 'JSSYNANJ',
        type: '分公司',
        leader: '刘志远',
        phone: '13800138002',
        sort: 1,
        status: 1,
        createTime: '2024-01-02 10:00:00',
        updateTime: '2025-03-01 09:00:00',
        children: [
          {
            id: 20,
            name: '江宁绕越团队',
            parentId: 2,
            code: 'NJJNRY',
            type: '片区',
            leader: '陈建平',
            phone: '13800138020',
            sort: 1,
            status: 1,
            createTime: '2024-01-02 10:00:00',
            updateTime: '2025-03-01 09:00:00',
            children: [
              { id: 200, name: '南京宁马高速西加油站', parentId: 20, code: 'NJNMGSX', type: '加能站', leader: '赵磊', phone: '13800138200', sort: 1, status: 1, createTime: '2024-01-02 10:00:00', updateTime: '2025-03-01 09:00:00' },
              { id: 201, name: '南京宁马高速东加油站', parentId: 20, code: 'NJNMGSD', type: '加能站', leader: '孙浩', phone: '13800138201', sort: 2, status: 1, createTime: '2024-01-02 10:00:00', updateTime: '2025-03-01 09:00:00' },
              { id: 202, name: '绕越高速方山服务区东加油站', parentId: 20, code: 'RYGSFSD', type: '加能站', leader: '李明', phone: '13800138202', sort: 3, status: 1, createTime: '2024-01-02 10:00:00', updateTime: '2025-03-01 09:00:00' }
            ]
          },
          {
            id: 21,
            name: '浦口汽油团队',
            parentId: 2,
            code: 'NJPKQY',
            type: '片区',
            leader: '张伟',
            phone: '13800138021',
            sort: 2,
            status: 1,
            createTime: '2024-01-02 10:00:00',
            updateTime: '2025-03-01 09:00:00',
            children: [
              { id: 210, name: '南京浦口永宁加油站', parentId: 21, code: 'NJPKYN', type: '加能站', leader: '王芳', phone: '13800138210', sort: 1, status: 1, createTime: '2024-01-02 10:00:00', updateTime: '2025-03-01 09:00:00' },
              { id: 211, name: '浦口北门加油站', parentId: 21, code: 'PKBM', type: '加能站', leader: '刘洋', phone: '13800138211', sort: 2, status: 1, createTime: '2024-01-02 10:00:00', updateTime: '2025-03-01 09:00:00' },
              { id: 212, name: '西葛加油站', parentId: 21, code: 'XG', type: '加能站', leader: '陈静', phone: '13800138212', sort: 3, status: 1, createTime: '2024-01-02 10:00:00', updateTime: '2025-03-01 09:00:00' }
            ]
          }
        ]
      },
      {
        id: 3,
        name: '江苏无锡石油分公司',
        parentId: 1,
        code: 'JSSYWUXI',
        type: '分公司',
        leader: '周海涛',
        phone: '13800138003',
        sort: 2,
        status: 1,
        createTime: '2024-01-03 10:00:00',
        updateTime: '2025-03-01 09:00:00',
        children: [
          {
            id: 30,
            name: '无锡统管一片区',
            parentId: 3,
            code: 'WXTG1',
            type: '片区',
            leader: '吴建华',
            phone: '13800138030',
            sort: 1,
            status: 1,
            createTime: '2024-01-03 10:00:00',
            updateTime: '2025-03-01 09:00:00',
            children: [
              { id: 300, name: '无锡市学前东路加油站', parentId: 30, code: 'WXXQDL', type: '加能站', leader: '赵强', phone: '13800138300', sort: 1, status: 1, createTime: '2024-01-03 10:00:00', updateTime: '2025-03-01 09:00:00' },
              { id: 301, name: '无锡锡洲加油站', parentId: 30, code: 'WXXZ', type: '加能站', leader: '钱伟', phone: '13800138301', sort: 2, status: 1, createTime: '2024-01-03 10:00:00', updateTime: '2025-03-01 09:00:00' },
              { id: 302, name: '无锡锡山后宅加油站', parentId: 30, code: 'WXXSHZ', type: '加能站', leader: '孙丽', phone: '13800138302', sort: 3, status: 1, createTime: '2024-01-03 10:00:00', updateTime: '2025-03-01 09:00:00' }
            ]
          },
          {
            id: 31,
            name: '无锡统管二片区',
            parentId: 3,
            code: 'WXTG2',
            type: '片区',
            leader: '李国庆',
            phone: '13800138031',
            sort: 2,
            status: 1,
            createTime: '2024-01-03 10:00:00',
            updateTime: '2025-03-01 09:00:00',
            children: [
              { id: 310, name: '无锡红星加油站', parentId: 31, code: 'WXHX', type: '加能站', leader: '周明', phone: '13800138310', sort: 1, status: 1, createTime: '2024-01-03 10:00:00', updateTime: '2025-03-01 09:00:00' },
              { id: 311, name: '无锡金城加油站', parentId: 31, code: 'WXJC', type: '加能站', leader: '吴刚', phone: '13800138311', sort: 2, status: 1, createTime: '2024-01-03 10:00:00', updateTime: '2025-03-01 09:00:00' },
              { id: 312, name: '无锡新光加油站', parentId: 31, code: 'WXXG', type: '加能站', leader: '郑华', phone: '13800138312', sort: 3, status: 1, createTime: '2024-01-03 10:00:00', updateTime: '2025-03-01 09:00:00' }
            ]
          },
          {
            id: 32,
            name: '宜兴自管一片区',
            parentId: 3,
            code: 'YXZG1',
            type: '片区',
            leader: '王志强',
            phone: '13800138032',
            sort: 3,
            status: 1,
            createTime: '2024-01-03 10:00:00',
            updateTime: '2025-03-01 09:00:00',
            children: [
              { id: 320, name: '宜兴茭渎加油站', parentId: 32, code: 'YXJD', type: '加能站', leader: '冯涛', phone: '13800138320', sort: 1, status: 1, createTime: '2024-01-03 10:00:00', updateTime: '2025-03-01 09:00:00' },
              { id: 321, name: '宜兴范蠡加油站', parentId: 32, code: 'YXFL', type: '加能站', leader: '陈勇', phone: '13800138321', sort: 2, status: 1, createTime: '2024-01-03 10:00:00', updateTime: '2025-03-01 09:00:00' },
              { id: 322, name: '正大加油站', parentId: 32, code: 'ZD', type: '加能站', leader: '杨帆', phone: '13800138322', sort: 3, status: 1, createTime: '2024-01-03 10:00:00', updateTime: '2025-03-01 09:00:00' }
            ]
          }
        ]
      },
      {
        id: 4,
        name: '江苏徐州石油分公司',
        parentId: 1,
        code: 'JSSYXZ',
        type: '分公司',
        leader: '马建军',
        phone: '13800138004',
        sort: 3,
        status: 1,
        createTime: '2024-01-04 10:00:00',
        updateTime: '2025-03-01 09:00:00',
        children: [
          {
            id: 40,
            name: '铜山县公司',
            parentId: 4,
            code: 'XZTS',
            type: '片区',
            leader: '徐明亮',
            phone: '13800138040',
            sort: 1,
            status: 1,
            createTime: '2024-01-04 10:00:00',
            updateTime: '2025-03-01 09:00:00',
            children: [
              { id: 400, name: '徐州兴华加油站', parentId: 40, code: 'XZXH', type: '加能站', leader: '刘强', phone: '13800138400', sort: 1, status: 1, createTime: '2024-01-04 10:00:00', updateTime: '2025-03-01 09:00:00' },
              { id: 401, name: '徐州响山路加油站', parentId: 40, code: 'XZXSL', type: '加能站', leader: '张磊', phone: '13800138401', sort: 2, status: 1, createTime: '2024-01-04 10:00:00', updateTime: '2025-03-01 09:00:00' },
              { id: 402, name: '徐州城南加油站', parentId: 40, code: 'XZCN', type: '加能站', leader: '王涛', phone: '13800138402', sort: 3, status: 1, createTime: '2024-01-04 10:00:00', updateTime: '2025-03-01 09:00:00' }
            ]
          },
          {
            id: 41,
            name: '丰县县公司',
            parentId: 4,
            code: 'XZFX',
            type: '片区',
            leader: '李建国',
            phone: '13800138041',
            sort: 2,
            status: 1,
            createTime: '2024-01-04 10:00:00',
            updateTime: '2025-03-01 09:00:00',
            children: [
              { id: 410, name: '丰县华山加油站', parentId: 41, code: 'FXHS', type: '加能站', leader: '赵军', phone: '13800138410', sort: 1, status: 1, createTime: '2024-01-04 10:00:00', updateTime: '2025-03-01 09:00:00' },
              { id: 411, name: '丰县北关加油站', parentId: 41, code: 'FXBG', type: '加能站', leader: '孙鹏', phone: '13800138411', sort: 2, status: 1, createTime: '2024-01-04 10:00:00', updateTime: '2025-03-01 09:00:00' },
              { id: 412, name: '丰县东环加油站', parentId: 41, code: 'FXDH', type: '加能站', leader: '钱进', phone: '13800138412', sort: 3, status: 1, createTime: '2024-01-04 10:00:00', updateTime: '2025-03-01 09:00:00' }
            ]
          }
        ]
      },
      {
        id: 5,
        name: '江苏常州石油分公司',
        parentId: 1,
        code: 'JSSYCZ',
        type: '分公司',
        leader: '胡志明',
        phone: '13800138005',
        sort: 4,
        status: 1,
        createTime: '2024-01-05 10:00:00',
        updateTime: '2025-03-01 09:00:00',
        children: [
          {
            id: 50,
            name: '常州武进武西片区',
            parentId: 5,
            code: 'CZWJWX',
            type: '片区',
            leader: '林海',
            phone: '13800138050',
            sort: 1,
            status: 1,
            createTime: '2024-01-05 10:00:00',
            updateTime: '2025-03-01 09:00:00',
            children: [
              { id: 500, name: '常州武进加油站', parentId: 50, code: 'CZWJ', type: '加能站', leader: '吴波', phone: '13800138500', sort: 1, status: 1, createTime: '2024-01-05 10:00:00', updateTime: '2025-03-01 09:00:00' },
              { id: 501, name: '常州西林加油站', parentId: 50, code: 'CZXL', type: '加能站', leader: '郑涛', phone: '13800138501', sort: 2, status: 1, createTime: '2024-01-05 10:00:00', updateTime: '2025-03-01 09:00:00' }
            ]
          }
        ]
      },
      {
        id: 6,
        name: '江苏苏州石油分公司',
        parentId: 1,
        code: 'JSSYSZ',
        type: '分公司',
        leader: '沈建华',
        phone: '13800138006',
        sort: 5,
        status: 1,
        createTime: '2024-01-06 10:00:00',
        updateTime: '2025-03-01 09:00:00',
        children: [
          {
            id: 60,
            name: '苏州吴中片区',
            parentId: 6,
            code: 'SZWZ',
            type: '片区',
            leader: '顾明',
            phone: '13800138060',
            sort: 1,
            status: 1,
            createTime: '2024-01-06 10:00:00',
            updateTime: '2025-03-01 09:00:00',
            children: [
              { id: 600, name: '苏州吴中加油站', parentId: 60, code: 'SZWZJYZ', type: '加能站', leader: '朱磊', phone: '13800138600', sort: 1, status: 1, createTime: '2024-01-06 10:00:00', updateTime: '2025-03-01 09:00:00' },
              { id: 601, name: '苏州木渎加油站', parentId: 60, code: 'SZMD', type: '加能站', leader: '许强', phone: '13800138601', sort: 2, status: 1, createTime: '2024-01-06 10:00:00', updateTime: '2025-03-01 09:00:00' }
            ]
          }
        ]
      },
      {
        id: 7,
        name: '江苏南通石油分公司',
        parentId: 1,
        code: 'JSSYNT',
        type: '分公司',
        leader: '曹建平',
        phone: '13800138007',
        sort: 6,
        status: 1,
        createTime: '2024-01-07 10:00:00',
        updateTime: '2025-03-01 09:00:00',
        children: [
          {
            id: 70,
            name: '南通市区片区',
            parentId: 7,
            code: 'NTSQ',
            type: '片区',
            leader: '袁志远',
            phone: '13800138070',
            sort: 1,
            status: 1,
            createTime: '2024-01-07 10:00:00',
            updateTime: '2025-03-01 09:00:00',
            children: [
              { id: 700, name: '南通学田加油站', parentId: 70, code: 'NTXT', type: '加能站', leader: '蒋涛', phone: '13800138700', sort: 1, status: 1, createTime: '2024-01-07 10:00:00', updateTime: '2025-03-01 09:00:00' },
              { id: 701, name: '南通港闸加油站', parentId: 70, code: 'NTGZ', type: '加能站', leader: '方明', phone: '13800138701', sort: 2, status: 1, createTime: '2024-01-07 10:00:00', updateTime: '2025-03-01 09:00:00' }
            ]
          }
        ]
      },
      {
        id: 8,
        name: '江苏扬州石油分公司',
        parentId: 1,
        code: 'JSSYYZ',
        type: '分公司',
        leader: '韩建国',
        phone: '13800138008',
        sort: 7,
        status: 1,
        createTime: '2024-01-08 10:00:00',
        updateTime: '2025-03-01 09:00:00',
        children: [
          {
            id: 80,
            name: '扬州市区片区',
            parentId: 8,
            code: 'YZSQ',
            type: '片区',
            leader: '唐志强',
            phone: '13800138080',
            sort: 1,
            status: 1,
            createTime: '2024-01-08 10:00:00',
            updateTime: '2025-03-01 09:00:00',
            children: [
              { id: 800, name: '扬州文昌路加油站', parentId: 80, code: 'YZWCL', type: '加能站', leader: '石磊', phone: '13800138800', sort: 1, status: 1, createTime: '2024-01-08 10:00:00', updateTime: '2025-03-01 09:00:00' },
              { id: 801, name: '扬州邗江加油站', parentId: 80, code: 'YZHJ', type: '加能站', leader: '卢涛', phone: '13800138801', sort: 2, status: 1, createTime: '2024-01-08 10:00:00', updateTime: '2025-03-01 09:00:00' }
            ]
          }
        ]
      },
      {
        id: 9,
        name: '江苏镇江石油分公司',
        parentId: 1,
        code: 'JSSYZJ',
        type: '分公司',
        leader: '程建华',
        phone: '13800138009',
        sort: 8,
        status: 1,
        createTime: '2024-01-09 10:00:00',
        updateTime: '2025-03-01 09:00:00',
        children: [
          {
            id: 90,
            name: '句容城区片区',
            parentId: 9,
            code: 'JRCQ',
            type: '片区',
            leader: '潘志远',
            phone: '13800138090',
            sort: 1,
            status: 1,
            createTime: '2024-01-09 10:00:00',
            updateTime: '2025-03-01 09:00:00',
            children: [
              { id: 900, name: '句容城区加油站', parentId: 90, code: 'JRCQJYZ', type: '加能站', leader: '姜涛', phone: '13800138900', sort: 1, status: 1, createTime: '2024-01-09 10:00:00', updateTime: '2025-03-01 09:00:00' },
              { id: 901, name: '镇江丹徒加油站', parentId: 90, code: 'ZJDT', type: '加能站', leader: '邓明', phone: '13800138901', sort: 2, status: 1, createTime: '2024-01-09 10:00:00', updateTime: '2025-03-01 09:00:00' }
            ]
          }
        ]
      },
      {
        id: 10,
        name: '江苏泰州石油分公司',
        parentId: 1,
        code: 'JSSYTZ',
        type: '分公司',
        leader: '傅建军',
        phone: '13800138010',
        sort: 9,
        status: 1,
        createTime: '2024-01-10 10:00:00',
        updateTime: '2025-03-01 09:00:00',
        children: [
          {
            id: 100,
            name: '城区北片区',
            parentId: 10,
            code: 'TZCQB',
            type: '片区',
            leader: '龚志强',
            phone: '13800138100',
            sort: 1,
            status: 1,
            createTime: '2024-01-10 10:00:00',
            updateTime: '2025-03-01 09:00:00',
            children: [
              { id: 1000, name: '泰州海陵加油站', parentId: 100, code: 'TZHL', type: '加能站', leader: '熊涛', phone: '13800139000', sort: 1, status: 1, createTime: '2024-01-10 10:00:00', updateTime: '2025-03-01 09:00:00' },
              { id: 1001, name: '泰州高港加油站', parentId: 100, code: 'TZGG', type: '加能站', leader: '雷明', phone: '13800139001', sort: 2, status: 1, createTime: '2024-01-10 10:00:00', updateTime: '2025-03-01 09:00:00' }
            ]
          }
        ]
      }
    ]
  }
]

// 生成唯一ID
let nextId = 2000

/**
 * 获取部门列表
 */
export function getDepartmentListMock(params?: { name?: string; status?: number | string }) {
  let result = [...mockDepartments]

  // 筛选部门名称
  if (params?.name) {
    const filterByName = (depts: Department[]): Department[] => {
      return depts
        .map((dept) => {
          const matched = dept.name?.includes(params.name!)
          const filteredChildren = dept.children ? filterByName(dept.children) : []

          if (matched || filteredChildren.length > 0) {
            return {
              ...dept,
              children: filteredChildren.length > 0 ? filteredChildren : dept.children
            }
          }
          return null
        })
        .filter((dept) => dept !== null) as Department[]
    }
    result = filterByName(result)
  }

  // 筛选状态
  if (params?.status !== undefined && params?.status !== '') {
    const statusValue = typeof params.status === 'string' ? parseInt(params.status) : params.status
    const filterByStatus = (depts: Department[]): Department[] => {
      return depts
        .map((dept) => {
          const matched = dept.status === statusValue
          const filteredChildren = dept.children ? filterByStatus(dept.children) : []

          if (matched || filteredChildren.length > 0) {
            return {
              ...dept,
              children: filteredChildren.length > 0 ? filteredChildren : dept.children
            }
          }
          return null
        })
        .filter((dept) => dept !== null) as Department[]
    }
    result = filterByStatus(result)
  }

  return result
}

/**
 * 新增部门
 */
export function addDepartmentMock(data: Partial<Department>) {
  const newDept: Department = {
    id: nextId++,
    name: data.name || '',
    parentId: data.parentId || null,
    code: data.code,
    leader: data.leader,
    phone: data.phone,
    sort: data.sort || 0,
    status: data.status ?? 1,
    createTime: new Date().toLocaleString('zh-CN', { hour12: false }),
    updateTime: new Date().toLocaleString('zh-CN', { hour12: false }),
    children: []
  }

  // 如果有父部门，添加到父部门的children中
  if (newDept.parentId) {
    const addToParent = (depts: Department[]): boolean => {
      for (const dept of depts) {
        if (dept.id === newDept.parentId) {
          if (!dept.children) {
            dept.children = []
          }
          dept.children.push(newDept)
          return true
        }
        if (dept.children && addToParent(dept.children)) {
          return true
        }
      }
      return false
    }
    addToParent(mockDepartments)
  } else {
    // 没有父部门，添加到根级别
    mockDepartments.push(newDept)
  }

  return newDept
}

/**
 * 更新部门
 */
export function updateDepartmentMock(id: number, data: Partial<Department>) {
  const updateInTree = (depts: Department[]): boolean => {
    for (const dept of depts) {
      if (dept.id === id) {
        Object.assign(dept, {
          ...data,
          id: dept.id, // 保持ID不变
          updateTime: new Date().toLocaleString('zh-CN', { hour12: false })
        })
        return true
      }
      if (dept.children && updateInTree(dept.children)) {
        return true
      }
    }
    return false
  }

  const success = updateInTree(mockDepartments)
  return success
}

/**
 * 删除部门
 */
export function deleteDepartmentMock(id: number) {
  const deleteFromTree = (depts: Department[], parentDepts?: Department[]): boolean => {
    for (let i = 0; i < depts.length; i++) {
      if (depts[i].id === id) {
        // 检查是否有子部门
        if (depts[i].children && depts[i].children!.length > 0) {
          throw new Error('该部门下有子部门，无法删除')
        }
        depts.splice(i, 1)
        return true
      }
      if (depts[i].children && deleteFromTree(depts[i].children!, depts)) {
        return true
      }
    }
    return false
  }

  try {
    const success = deleteFromTree(mockDepartments)
    return success
  } catch (error) {
    throw error
  }
}

/**
 * 更新部门状态
 */
export function updateDepartmentStatusMock(id: number, status: number) {
  return updateDepartmentMock(id, { status })
}

// ================================ 用户管理 Mock 数据 ================================

// 模拟角色数据
let mockRoles: Role[] = [
  {
    id: 1,
    code: 'sys_admin',
    name: '系统管理员',
    description: '系统技术管理人员，拥有全量数据及系统管理功能权限',
    menuIds: [1, 2, 21, 22, 3, 4, 5, 51, 52, 6, 7, 71, 72, 73, 8, 81, 82, 83, 9, 91, 92],
    userCount: 2,
    sort: 1,
    status: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    code: 'province_admin',
    name: '省公司管理员',
    description: '省公司级别的管理人员，可查看全省所有组织的风险数据',
    menuIds: [1, 2, 21, 22, 3, 4, 5, 51, 52, 6, 8, 81, 82],
    userCount: 8,
    sort: 2,
    status: 1,
    createTime: '2024-01-02 10:00:00',
    updateTime: '2024-01-02 10:00:00'
  },
  {
    id: 3,
    code: 'branch_admin',
    name: '分公司管理员',
    description: '分公司级别的管理人员，可查看本分公司及下属区/片公司、库站的风险数据',
    menuIds: [1, 2, 21, 22, 3, 4, 5, 51, 52, 6],
    userCount: 14,
    sort: 3,
    status: 1,
    createTime: '2024-01-03 10:00:00',
    updateTime: '2024-01-03 10:00:00'
  },
  {
    id: 4,
    code: 'district_admin',
    name: '区/片公司管理员',
    description: '区/片公司级别的管理人员，可查看本区/片公司及下属库站的风险数据',
    menuIds: [1, 2, 21, 22, 3, 4, 5, 51, 52],
    userCount: 36,
    sort: 4,
    status: 1,
    createTime: '2024-01-04 10:00:00',
    updateTime: '2024-01-04 10:00:00'
  },
  {
    id: 5,
    code: 'station_admin',
    name: '库站管理员',
    description: '库站级别的管理人员，可查看和维护本库站的风险数据',
    menuIds: [1, 2, 21, 22, 3, 4],
    userCount: 120,
    sort: 5,
    status: 1,
    createTime: '2024-01-05 10:00:00',
    updateTime: '2024-01-05 10:00:00'
  }
]

let nextRoleId = 6

// 模拟用户数据
let mockUsers: AdminUser[] = [
  {
    id: 1,
    username: 'wangjg001',
    nickname: '王建国',
    phone: '138****0001',
    email: 'wangjg@jssy.com',
    status: 1,
    departmentId: 1,
    position: '总经理',
    roles: [mockRoles[0]],
    createTime: '2024-01-01 10:00:00',
    updateTime: '2025-03-01 09:00:00'
  },
  {
    id: 2,
    username: 'liuzhy002',
    nickname: '刘志远',
    phone: '138****0002',
    email: 'liuzhy@jssy.com',
    status: 1,
    departmentId: 2,
    position: '分公司经理',
    roles: [mockRoles[1]],
    createTime: '2024-01-02 10:00:00',
    updateTime: '2025-03-01 09:00:00'
  },
  {
    id: 3,
    username: 'zhouht003',
    nickname: '周海涛',
    phone: '138****0003',
    email: 'zhouht@jssy.com',
    status: 1,
    departmentId: 3,
    position: '分公司经理',
    roles: [mockRoles[1]],
    createTime: '2024-01-03 10:00:00',
    updateTime: '2025-03-01 09:00:00'
  },
  {
    id: 4,
    username: 'chenjp004',
    nickname: '陈建平',
    phone: '138****0004',
    email: 'chenjp@jssy.com',
    status: 1,
    departmentId: 20,
    position: '片区经理',
    roles: [mockRoles[2]],
    createTime: '2024-01-04 10:00:00',
    updateTime: '2025-03-01 09:00:00'
  },
  {
    id: 5,
    username: 'zhaolei005',
    nickname: '赵磊',
    phone: '138****0005',
    email: 'zhaolei@jssy.com',
    status: 1,
    departmentId: 200,
    position: '站长',
    roles: [mockRoles[3]],
    createTime: '2024-01-05 10:00:00',
    updateTime: '2025-03-01 09:00:00'
  },
  {
    id: 6,
    username: 'majjun006',
    nickname: '马建军',
    phone: '138****0006',
    email: 'majjun@jssy.com',
    status: 1,
    departmentId: 4,
    position: '分公司经理',
    roles: [mockRoles[1]],
    createTime: '2024-01-06 10:00:00',
    updateTime: '2025-03-01 09:00:00'
  },
  {
    id: 7,
    username: 'huzm007',
    nickname: '胡志明',
    phone: '138****0007',
    email: 'huzm@jssy.com',
    status: 0,
    departmentId: 5,
    position: '分公司经理',
    roles: [mockRoles[1]],
    createTime: '2024-01-07 10:00:00',
    updateTime: '2025-03-01 09:00:00'
  },
  {
    id: 8,
    username: 'wugang008',
    nickname: '吴刚',
    phone: '138****0008',
    email: 'wugang@jssy.com',
    status: 1,
    departmentId: 311,
    position: '站长',
    roles: [mockRoles[3]],
    createTime: '2024-01-08 10:00:00',
    updateTime: '2025-03-01 09:00:00'
  }
]

let nextUserId = 9

// 生成岗位 Mock 数据的辅助函数
function generatePositions(): Position[] {
  const positions: Position[] = []
  const positionNames = [
    '设备管理岗', '巡检专员', '维修工程师', '备件管理岗', '设备档案管理员',
    '技术支持岗', '质量检验员', '安全管理员', '培训专员', '数据分析员',
    '项目经理', '系统管理员', '运维工程师', '客服专员', '采购专员'
  ]

  const descriptions = [
    '负责设备日常管理工作', '负责设备巡检与维护', '负责设备故障维修',
    '负责备件库存管理', '负责设备档案整理', '提供技术支持服务',
    '负责质量检验工作', '负责安全管理工作', '负责员工培训',
    '负责数据分析与报表', '负责项目管理', '负责系统运维',
    '负责运维保障', '负责客户服务', '负责物资采购'
  ]

  for (let i = 1; i <= 400; i++) {
    const nameIndex = (i - 1) % positionNames.length
    const descIndex = (i - 1) % descriptions.length
    const status = i % 5 === 0 ? 0 : 1 // 每5个有1个禁用

    positions.push({
      id: i,
      code: `SBGL${String(i).padStart(3, '0')}`,
      name: positionNames[nameIndex],
      description: descriptions[descIndex],
      sort: i,
      status,
      createTime: '2024-01-01 10:00:00',
      updateTime: `2025-07-${String(Math.min(25, (i % 25) + 1)).padStart(2, '0')} ${String((i % 24)).padStart(2, '0')}:${String((i % 60)).padStart(2, '0')}:00`
    })
  }

  return positions
}

// 模拟岗位数据
let mockPositions: Position[] = generatePositions()

let nextPositionId = 401

/**
 * 获取部门全路径
 */
function getDepartmentPath(departmentId: number): string {
  const path: string[] = []

  function findPath(id: number, depts: Department[]): boolean {
    for (const dept of depts) {
      if (dept.id === id) {
        path.unshift(dept.name)
        return true
      }
      if (dept.children && dept.children.length > 0) {
        if (findPath(id, dept.children)) {
          path.unshift(dept.name)
          return true
        }
      }
    }
    return false
  }

  findPath(departmentId, mockDepartments)
  return path.join('/')
}

/**
 * 获取用户列表
 */
export function getUserListMock(params?: {
  keyword?: string
  departmentId?: number
  status?: number | string
  page?: number
  pageSize?: number
}) {
  let result = [...mockUsers]

  // 筛选关键词（姓名或账号）
  if (params?.keyword) {
    result = result.filter(
      (user) =>
        user.nickname?.includes(params.keyword!) || user.username?.includes(params.keyword!)
    )
  }

  // 筛选部门
  if (params?.departmentId) {
    result = result.filter((user) => user.departmentId === params.departmentId)
  }

  // 筛选状态
  if (params?.status !== undefined && params?.status !== '') {
    const statusValue = typeof params.status === 'string' ? parseInt(params.status) : params.status
    result = result.filter((user) => user.status === statusValue)
  }

  // 添加部门全路径
  result = result.map((user) => ({
    ...user,
    departmentPath: user.departmentId ? getDepartmentPath(user.departmentId) : '-'
  }))

  // 分页
  const page = params?.page || 1
  const pageSize = params?.pageSize || 10
  const total = result.length
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = result.slice(start, end)

  return {
    list,
    total,
    page,
    pageSize
  }
}

/**
 * 新增用户
 */
export function addUserMock(data: Partial<AdminUser>) {
  const newUser: AdminUser = {
    id: nextUserId++,
    username: data.username || '',
    nickname: data.nickname || '',
    phone: data.phone,
    email: data.email,
    status: data.status ?? 1,
    departmentId: data.departmentId,
    position: data.position,
    roles: data.roles || [],
    createTime: new Date().toLocaleString('zh-CN', { hour12: false }),
    updateTime: new Date().toLocaleString('zh-CN', { hour12: false })
  }

  mockUsers.push(newUser)
  return newUser
}

/**
 * 更新用户
 */
export function updateUserMock(id: number, data: Partial<AdminUser>) {
  const index = mockUsers.findIndex((user) => user.id === id)
  if (index === -1) {
    return false
  }

  mockUsers[index] = {
    ...mockUsers[index],
    ...data,
    id: mockUsers[index].id,
    updateTime: new Date().toLocaleString('zh-CN', { hour12: false })
  }
  return true
}

/**
 * 删除用户
 */
export function deleteUserMock(id: number) {
  const index = mockUsers.findIndex((user) => user.id === id)
  if (index === -1) {
    return false
  }
  mockUsers.splice(index, 1)
  return true
}

/**
 * 批量删除用户
 */
export function batchDeleteUsersMock(ids: number[]) {
  mockUsers = mockUsers.filter((user) => !ids.includes(user.id))
  return true
}

/**
 * 更新用户状态
 */
export function updateUserStatusMock(id: number, status: number) {
  return updateUserMock(id, { status })
}

/**
 * 批量设置岗位
 */
export function batchSetPositionMock(ids: number[], position: string) {
  ids.forEach((id) => {
    updateUserMock(id, { position })
  })
  return true
}

/**
 * 批量设置角色
 */
export function batchSetRoleMock(ids: number[], roleIds: number[]) {
  const roles = mockRoles.filter((role) => roleIds.includes(role.id))
  ids.forEach((id) => {
    updateUserMock(id, { roles })
  })
  return true
}

// ================================ 角色管理 Mock 函数 ================================

/**
 * 获取角色列表（支持分页）
 */
export function getRoleListMock(params?: {
  name?: string
  status?: number | string
  page?: number
  pageSize?: number
}) {
  let filteredRoles = [...mockRoles]

  // 角色名称筛选
  if (params?.name) {
    filteredRoles = filteredRoles.filter((role) => role.name.includes(params.name!))
  }

  // 状态筛选
  if (params?.status !== undefined && params?.status !== '') {
    const status = typeof params.status === 'string' ? parseInt(params.status) : params.status
    filteredRoles = filteredRoles.filter((role) => role.status === status)
  }

  // 分页
  const page = params?.page || 1
  const pageSize = params?.pageSize || 10
  const total = filteredRoles.length
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = filteredRoles.slice(start, end)

  return {
    list,
    total,
    page,
    pageSize
  }
}

/**
 * 新增角色
 */
export function addRoleMock(role: Partial<Role>) {
  const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
  const newRole: Role = {
    id: nextRoleId++,
    code: role.code || '',
    name: role.name || '',
    description: role.description,
    menuIds: role.menuIds || [],
    userCount: 0,
    sort: role.sort || 0,
    status: role.status ?? 1,
    createTime: now,
    updateTime: now
  }
  mockRoles.push(newRole)
  return newRole
}

/**
 * 更新角色
 */
export function updateRoleMock(id: number, updates: Partial<Role>) {
  const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
  const index = mockRoles.findIndex((role) => role.id === id)
  if (index === -1) {
    return false
  }
  mockRoles[index] = {
    ...mockRoles[index],
    ...updates,
    updateTime: now
  }
  return true
}

/**
 * 删除角色
 */
export function deleteRoleMock(id: number) {
  const index = mockRoles.findIndex((role) => role.id === id)
  if (index === -1) {
    return false
  }
  // 检查是否有用户使用该角色
  const role = mockRoles[index]
  if (role.userCount && role.userCount > 0) {
    throw new Error('该角色下有用户，无法删除')
  }
  mockRoles.splice(index, 1)
  return true
}

/**
 * 更新角色状态
 */
export function updateRoleStatusMock(id: number, status: number) {
  return updateRoleMock(id, { status })
}

/**
 * 分配角色权限
 */
export function assignRolePermissionsMock(id: number, menuIds: number[]) {
  return updateRoleMock(id, { menuIds })
}

// ================================ 岗位管理 Mock 函数 ================================

/**
 * 获取岗位列表（支持分页）
 */
export function getPositionListMock(params?: {
  keyword?: string
  status?: number | string
  page?: number
  pageSize?: number
}) {
  let filteredPositions = [...mockPositions]

  // 关键词筛选
  if (params?.keyword) {
    const keyword = params.keyword.toLowerCase()
    filteredPositions = filteredPositions.filter(
      (position) =>
        position.name.toLowerCase().includes(keyword) ||
        position.code.toLowerCase().includes(keyword)
    )
  }

  // 状态筛选
  if (params?.status !== undefined && params?.status !== '') {
    const status = Number(params.status)
    filteredPositions = filteredPositions.filter((position) => position.status === status)
  }

  const total = filteredPositions.length
  const page = params?.page || 1
  const pageSize = params?.pageSize || 10
  const start = (page - 1) * pageSize
  const end = start + pageSize

  return {
    list: filteredPositions.slice(start, end),
    total,
    page,
    pageSize
  }
}

/**
 * 新增岗位
 */
export function addPositionMock(data: Partial<Position>) {
  const newPosition: Position = {
    id: nextPositionId++,
    code: data.code || '',
    name: data.name || '',
    description: data.description,
    sort: data.sort || 0,
    status: data.status ?? 1,
    createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
  }

  mockPositions.unshift(newPosition)
  return newPosition
}

/**
 * 更新岗位
 */
export function updatePositionMock(id: number, data: Partial<Position>) {
  const index = mockPositions.findIndex((position) => position.id === id)
  if (index === -1) {
    return false
  }

  mockPositions[index] = {
    ...mockPositions[index],
    ...data,
    updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
  }
  return true
}

/**
 * 删除岗位
 */
export function deletePositionMock(id: number) {
  const index = mockPositions.findIndex((position) => position.id === id)
  if (index === -1) {
    return false
  }

  mockPositions.splice(index, 1)
  return true
}

/**
 * 更新岗位状态
 */
export function updatePositionStatusMock(id: number, status: number) {
  return updatePositionMock(id, { status })
}

// ==================== 菜单管理 Mock 数据 ====================

/**
 * 菜单 Mock 数据
 */
let mockMenus: Menu[] = [
  {
    id: 1,
    name: 'Workbench',
    title: '工作台',
    type: 'menu',
    icon: '&#xe88a;',
    path: '/workbench',
    component: '@/views/workbench/index.vue',
    permission: 'workbench:view',
    sort: 1,
    status: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    name: 'Report',
    title: '报表中心',
    type: 'directory',
    icon: '&#xe8b6;',
    path: '/report',
    sort: 2,
    status: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
    children: [
      {
        id: 21,
        parentId: 2,
        name: 'ReportInspection',
        title: '巡检统计',
        type: 'menu',
        path: '/report/inspection',
        component: '@/views/report/inspection/index.vue',
        permission: 'report:inspection:view',
        sort: 1,
        status: 1,
        createTime: '2024-01-01 10:00:00',
        updateTime: '2024-01-01 10:00:00'
      },
      {
        id: 22,
        parentId: 2,
        name: 'ReportEquipment',
        title: '设备统计',
        type: 'menu',
        path: '/report/equipment',
        component: '@/views/report/equipment/index.vue',
        permission: 'report:equipment:view',
        sort: 2,
        status: 1,
        createTime: '2024-01-01 10:00:00',
        updateTime: '2024-01-01 10:00:00'
      }
    ]
  },
  {
    id: 3,
    name: 'Equipment',
    title: '设备管理',
    type: 'menu',
    icon: '&#xe851;',
    path: '/equipment',
    component: '@/views/equipment/index.vue',
    permission: 'equipment:view',
    sort: 3,
    status: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: 4,
    name: 'InspectionPoint',
    title: '巡检点管理',
    type: 'menu',
    icon: '&#xe6ef;',
    path: '/inspection-point',
    component: '@/views/inspection-point/index.vue',
    permission: 'inspection-point:view',
    sort: 4,
    status: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: 5,
    name: 'Inspection',
    title: '巡检管理',
    type: 'directory',
    icon: '&#xe81d;',
    path: '/inspection',
    sort: 5,
    status: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
    children: [
      {
        id: 51,
        parentId: 5,
        name: 'InspectionPlan',
        title: '巡检计划',
        type: 'menu',
        path: '/inspection/plan',
        component: '@/views/inspection/plan/index.vue',
        permission: 'inspection:plan:view',
        sort: 1,
        status: 1,
        createTime: '2024-01-01 10:00:00',
        updateTime: '2024-01-01 10:00:00'
      },
      {
        id: 52,
        parentId: 5,
        name: 'InspectionTask',
        title: '巡检任务',
        type: 'menu',
        path: '/inspection/task',
        component: '@/views/inspection/task/index.vue',
        permission: 'inspection:task:view',
        sort: 2,
        status: 1,
        createTime: '2024-01-01 10:00:00',
        updateTime: '2024-01-01 10:00:00'
      }
    ]
  },
  {
    id: 6,
    name: 'WorkOrder',
    title: '工单管理',
    type: 'menu',
    icon: '&#xe70f;',
    path: '/work-order',
    component: '@/views/work-order/index.vue',
    permission: 'work-order:view',
    sort: 6,
    status: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: 7,
    name: 'Basic',
    title: '基础管理',
    type: 'directory',
    icon: '&#xe72b;',
    path: '/basic',
    sort: 7,
    status: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
    children: [
      {
        id: 71,
        parentId: 7,
        name: 'BasicEquipmentCategory',
        title: '设备分类',
        type: 'menu',
        path: '/basic/equipment-category',
        component: '@/views/basic/equipment-category/index.vue',
        permission: 'basic:equipment-category:view',
        sort: 1,
        status: 1,
        createTime: '2024-01-01 10:00:00',
        updateTime: '2024-01-01 10:00:00'
      },
      {
        id: 72,
        parentId: 7,
        name: 'BasicEquipmentLevel',
        title: '设备等级',
        type: 'menu',
        path: '/basic/equipment-level',
        component: '@/views/basic/equipment-level/index.vue',
        permission: 'basic:equipment-level:view',
        sort: 2,
        status: 1,
        createTime: '2024-01-01 10:00:00',
        updateTime: '2024-01-01 10:00:00'
      },
      {
        id: 73,
        parentId: 7,
        name: 'BasicInspectionChecklist',
        title: '巡检清单',
        type: 'menu',
        path: '/basic/inspection-checklist',
        component: '@/views/basic/inspection-checklist/index.vue',
        permission: 'basic:inspection-checklist:view',
        sort: 3,
        status: 1,
        createTime: '2024-01-01 10:00:00',
        updateTime: '2024-01-01 10:00:00'
      }
    ]
  },
  {
    id: 8,
    name: 'Organization',
    title: '组织管理',
    type: 'directory',
    icon: '&#xe8c4;',
    path: '/organization',
    sort: 8,
    status: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
    children: [
      {
        id: 81,
        parentId: 8,
        name: 'OrganizationDepartment',
        title: '部门管理',
        type: 'menu',
        path: '/organization/department',
        component: '@/views/organization/department/index.vue',
        permission: 'organization:department:view',
        sort: 1,
        status: 1,
        createTime: '2024-01-01 10:00:00',
        updateTime: '2024-01-01 10:00:00',
        children: [
          {
            id: 811,
            parentId: 81,
            name: 'OrganizationDepartmentAdd',
            title: '新增部门',
            type: 'button',
            permission: 'organization:department:add',
            sort: 1,
            status: 1,
            createTime: '2024-01-01 10:00:00',
            updateTime: '2024-01-01 10:00:00'
          },
          {
            id: 812,
            parentId: 81,
            name: 'OrganizationDepartmentEdit',
            title: '编辑部门',
            type: 'button',
            permission: 'organization:department:edit',
            sort: 2,
            status: 1,
            createTime: '2024-01-01 10:00:00',
            updateTime: '2024-01-01 10:00:00'
          },
          {
            id: 813,
            parentId: 81,
            name: 'OrganizationDepartmentDelete',
            title: '删除部门',
            type: 'button',
            permission: 'organization:department:delete',
            sort: 3,
            status: 1,
            createTime: '2024-01-01 10:00:00',
            updateTime: '2024-01-01 10:00:00'
          }
        ]
      },
      {
        id: 82,
        parentId: 8,
        name: 'OrganizationUser',
        title: '用户管理',
        type: 'menu',
        path: '/organization/user',
        component: '@/views/organization/user/index.vue',
        permission: 'organization:user:view',
        sort: 2,
        status: 1,
        createTime: '2024-01-01 10:00:00',
        updateTime: '2024-01-01 10:00:00'
      },
      {
        id: 83,
        parentId: 8,
        name: 'OrganizationPosition',
        title: '岗位管理',
        type: 'menu',
        path: '/organization/position',
        component: '@/views/organization/position/index.vue',
        permission: 'organization:position:view',
        sort: 3,
        status: 1,
        createTime: '2024-01-01 10:00:00',
        updateTime: '2024-01-01 10:00:00'
      }
    ]
  },
  {
    id: 9,
    name: 'Permission',
    title: '权限管理',
    type: 'directory',
    icon: '&#xe817;',
    path: '/permission',
    sort: 9,
    status: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
    children: [
      {
        id: 91,
        parentId: 9,
        name: 'PermissionRole',
        title: '角色管理',
        type: 'menu',
        path: '/permission/role',
        component: '@/views/permission/role/index.vue',
        permission: 'permission:role:view',
        sort: 1,
        status: 1,
        createTime: '2024-01-01 10:00:00',
        updateTime: '2024-01-01 10:00:00'
      },
      {
        id: 92,
        parentId: 9,
        name: 'PermissionMenu',
        title: '菜单管理',
        type: 'menu',
        path: '/permission/menu',
        component: '@/views/permission/menu/index.vue',
        permission: 'permission:menu:view',
        sort: 2,
        status: 1,
        createTime: '2024-01-01 10:00:00',
        updateTime: '2024-01-01 10:00:00'
      }
    ]
  }
]

let nextMenuId = 100

/**
 * 获取菜单列表
 */
export function getMenuListMock(params?: { name?: string; status?: number }) {
  let result = JSON.parse(JSON.stringify(mockMenus))

  // 递归过滤函数
  const filterMenus = (menus: Menu[]): Menu[] => {
    return menus
      .filter((menu) => {
        // 状态过滤
        if (params?.status !== undefined && menu.status !== params.status) {
          return false
        }
        // 名称过滤
        if (params?.name && !menu.title.includes(params.name)) {
          // 如果当前节点不匹配，检查子节点是否有匹配的
          if (menu.children && menu.children.length > 0) {
            const filteredChildren = filterMenus(menu.children)
            if (filteredChildren.length > 0) {
              menu.children = filteredChildren
              return true
            }
          }
          return false
        }
        return true
      })
      .map((menu) => {
        // 递归处理子节点
        if (menu.children && menu.children.length > 0) {
          menu.children = filterMenus(menu.children)
        }
        return menu
      })
  }

  result = filterMenus(result)

  return {
    code: 200,
    message: '获取成功',
    data: result,
    success: true,
    timestamp: Date.now()
  }
}

/**
 * 新增菜单
 */
export function addMenuMock(menu: Partial<Menu>) {
  const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
  const newMenu: Menu = {
    id: nextMenuId++,
    name: menu.name || '',
    title: menu.title || '',
    type: menu.type || 'menu',
    icon: menu.icon,
    path: menu.path,
    component: menu.component,
    permission: menu.permission,
    sort: menu.sort || 0,
    status: menu.status ?? 1,
    createTime: now,
    updateTime: now,
    parentId: menu.parentId
  }

  // 如果有父级ID，添加到对应父级的children中
  if (menu.parentId) {
    const addToParent = (menus: Menu[]): boolean => {
      for (const m of menus) {
        if (m.id === menu.parentId) {
          if (!m.children) {
            m.children = []
          }
          m.children.push(newMenu)
          return true
        }
        if (m.children && addToParent(m.children)) {
          return true
        }
      }
      return false
    }
    addToParent(mockMenus)
  } else {
    // 没有父级ID，添加到根级
    mockMenus.push(newMenu)
  }

  return {
    code: 200,
    message: '新增成功',
    data: newMenu,
    success: true,
    timestamp: Date.now()
  }
}

/**
 * 更新菜单
 */
export function updateMenuMock(id: number, updates: Partial<Menu>) {
  const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')

  const updateInTree = (menus: Menu[]): boolean => {
    for (const menu of menus) {
      if (menu.id === id) {
        Object.assign(menu, updates, { updateTime: now })
        return true
      }
      if (menu.children && updateInTree(menu.children)) {
        return true
      }
    }
    return false
  }

  const found = updateInTree(mockMenus)

  if (!found) {
    return {
      code: 404,
      message: '菜单不存在',
      data: null,
      success: false,
      timestamp: Date.now()
    }
  }

  return {
    code: 200,
    message: '更新成功',
    data: null,
    success: true,
    timestamp: Date.now()
  }
}

/**
 * 删除菜单
 */
export function deleteMenuMock(id: number) {
  const deleteFromTree = (menus: Menu[], parentArray: Menu[]): boolean => {
    for (let i = 0; i < menus.length; i++) {
      if (menus[i].id === id) {
        // 检查是否有子菜单
        if (menus[i].children && menus[i].children!.length > 0) {
          return false // 有子菜单，不能删除
        }
        parentArray.splice(i, 1)
        return true
      }
      if (menus[i].children && menus[i].children!.length > 0) {
        if (deleteFromTree(menus[i].children!, menus[i].children!)) {
          return true
        }
      }
    }
    return false
  }

  const deleted = deleteFromTree(mockMenus, mockMenus)

  if (!deleted) {
    return {
      code: 400,
      message: '删除失败，菜单不存在或存在子菜单',
      data: null,
      success: false,
      timestamp: Date.now()
    }
  }

  return {
    code: 200,
    message: '删除成功',
    data: null,
    success: true,
    timestamp: Date.now()
  }
}

/**
 * 更新菜单状态
 */
export function updateMenuStatusMock(id: number, status: number) {
  return updateMenuMock(id, { status })
}

