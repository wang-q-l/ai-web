import request from '@/utils/http'
import type {
  AuditProject,
  AuditProjectParams,
  AuditProjectForm,
  LaunchProjectForm,
  ProjectStage,
  AuditFinding,
  WorkRecord,
  SetProjectViewersForm,
  AuditItem
} from '@/types/audit'
import {
  getProjectListMock,
  getProjectDetailMock,
  addProjectMock,
  updateProjectMock,
  deleteProjectMock,
  launchProjectMock,
  getProjectStagesMock,
  saveStageContentMock,
  completeStagesMock,
  addFindingMock,
  deleteFindingMock,
  addWorkRecordMock,
  setProjectViewersMock,
  addAuditItemMock,
  updateAuditItemMock,
  deleteAuditItemMock,
  generatePlanMock
} from '@/mock/audit'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/** 获取项目列表 */
export function getProjectList(params: AuditProjectParams) {
  if (USE_MOCK) {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        const data = getProjectListMock(params)
        resolve({ code: 200, message: 'success', data })
      }, 300)
    })
  }
  return request.get<{ list: AuditProject[]; total: number }>({
    url: '/audit/project/list',
    params
  })
}

/** 获取项目详情 */
export function getProjectDetail(id: number) {
  if (USE_MOCK) {
    return new Promise<any>((resolve, reject) => {
      setTimeout(() => {
        try {
          const data = getProjectDetailMock(id)
          resolve({ code: 200, message: 'success', data })
        } catch (error: any) {
          reject({ code: 404, message: error.message })
        }
      }, 300)
    })
  }
  return request.get<AuditProject>({ url: `/audit/project/${id}` })
}

/** 新增项目 */
export function addProject(form: AuditProjectForm) {
  if (USE_MOCK) {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        const data = addProjectMock(form)
        resolve({ code: 200, message: '新增成功', data })
      }, 300)
    })
  }
  return request.post<AuditProject>({ url: '/audit/project/add', data: form })
}

/** 编辑项目 */
export function updateProject(form: AuditProjectForm) {
  if (USE_MOCK) {
    return new Promise<any>((resolve, reject) => {
      setTimeout(() => {
        try {
          const data = updateProjectMock(form)
          resolve({ code: 200, message: '编辑成功', data })
        } catch (error: any) {
          reject({ code: 400, message: error.message })
        }
      }, 300)
    })
  }
  return request.put<AuditProject>({ url: '/audit/project/update', data: form })
}

/** 删除项目（仅未启动） */
export function deleteProject(id: number) {
  if (USE_MOCK) {
    return new Promise<any>((resolve, reject) => {
      setTimeout(() => {
        try {
          deleteProjectMock(id)
          resolve({ code: 200, message: '删除成功' })
        } catch (error: any) {
          reject({ code: 400, message: error.message })
        }
      }, 300)
    })
  }
  return request.del({ url: `/audit/project/${id}` })
}

/** 启动项目 */
export function launchProject(id: number, form: LaunchProjectForm) {
  if (USE_MOCK) {
    return new Promise<any>((resolve, reject) => {
      setTimeout(() => {
        try {
          const data = launchProjectMock(id, form)
          resolve({ code: 200, message: '启动成功', data })
        } catch (error: any) {
          reject({ code: 400, message: error.message })
        }
      }, 300)
    })
  }
  return request.post({ url: `/audit/project/${id}/launch`, data: form })
}

/** 获取项目阶段列表 */
export function getProjectStages(projectId: number) {
  if (USE_MOCK) {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        const data = getProjectStagesMock(projectId)
        resolve({ code: 200, message: 'success', data })
      }, 300)
    })
  }
  return request.get<ProjectStage[]>({ url: `/audit/project/${projectId}/stages` })
}

/** 保存阶段内容 */
export function saveStageContent(
  projectId: number,
  stageId: number,
  data: Partial<ProjectStage>
) {
  if (USE_MOCK) {
    return new Promise<any>((resolve, reject) => {
      setTimeout(() => {
        try {
          const result = saveStageContentMock(projectId, stageId, data)
          resolve({ code: 200, message: '保存成功', data: result })
        } catch (error: any) {
          reject({ code: 400, message: error.message })
        }
      }, 300)
    })
  }
  return request.put<ProjectStage>({
    url: `/audit/project/${projectId}/stage/${stageId}`,
    data
  })
}

/** 完成阶段 */
export function completeStage(projectId: number, stageId: number) {
  if (USE_MOCK) {
    return new Promise<any>((resolve, reject) => {
      setTimeout(() => {
        try {
          const data = completeStagesMock(projectId, stageId)
          resolve({ code: 200, message: '阶段已完成', data })
        } catch (error: any) {
          reject({ code: 400, message: error.message })
        }
      }, 300)
    })
  }
  return request.post({ url: `/audit/project/${projectId}/stage/${stageId}/complete` })
}

/** 添加审计发现 */
export function addFinding(
  projectId: number,
  stageId: number,
  finding: Omit<AuditFinding, 'id' | 'createTime'>
) {
  if (USE_MOCK) {
    return new Promise<any>((resolve, reject) => {
      setTimeout(() => {
        try {
          const data = addFindingMock(projectId, stageId, finding)
          resolve({ code: 200, message: '添加成功', data })
        } catch (error: any) {
          reject({ code: 400, message: error.message })
        }
      }, 300)
    })
  }
  return request.post<AuditFinding>({
    url: `/audit/project/${projectId}/stage/${stageId}/finding`,
    data: finding
  })
}

/** 删除审计发现 */
export function deleteFinding(projectId: number, stageId: number, findingId: number) {
  if (USE_MOCK) {
    return new Promise<any>((resolve, reject) => {
      setTimeout(() => {
        try {
          deleteFindingMock(projectId, stageId, findingId)
          resolve({ code: 200, message: '删除成功' })
        } catch (error: any) {
          reject({ code: 400, message: error.message })
        }
      }, 300)
    })
  }
  return request.del({
    url: `/audit/project/${projectId}/stage/${stageId}/finding/${findingId}`
  })
}

/** 添加工作记录 */
export function addWorkRecord(projectId: number, stageId: number, content: string) {
  if (USE_MOCK) {
    return new Promise<any>((resolve, reject) => {
      setTimeout(() => {
        try {
          const data = addWorkRecordMock(projectId, stageId, content)
          resolve({ code: 200, message: '添加成功', data })
        } catch (error: any) {
          reject({ code: 400, message: error.message })
        }
      }, 300)
    })
  }
  return request.post<WorkRecord>({
    url: `/audit/project/${projectId}/stage/${stageId}/record`,
    data: { content }
  })
}

/** 设置项目可查看人员 */
export function setProjectViewers(projectId: number, form: SetProjectViewersForm) {
  if (USE_MOCK) {
    return new Promise<any>((resolve, reject) => {
      setTimeout(() => {
        try {
          const data = setProjectViewersMock(projectId, form)
          resolve({ code: 200, message: '设置成功', data })
        } catch (error: any) {
          reject({ code: 400, message: error.message })
        }
      }, 300)
    })
  }
  return request.post<AuditProject>({
    url: `/audit/project/${projectId}/viewers`,
    data: form
  })
}

/** 添加审计事项 */
export function addAuditItem(
  projectId: number,
  stageId: number,
  item: Omit<AuditItem, 'id' | 'createTime'>
) {
  if (USE_MOCK) {
    return new Promise<any>((resolve, reject) => {
      setTimeout(() => {
        try {
          const data = addAuditItemMock(projectId, stageId, item)
          resolve({ code: 200, message: '添加成功', data })
        } catch (error: any) {
          reject({ code: 400, message: error.message })
        }
      }, 300)
    })
  }
  return request.post<AuditItem>({
    url: `/audit/project/${projectId}/stage/${stageId}/item`,
    data: item
  })
}

/** 更新审计事项 */
export function updateAuditItem(
  projectId: number,
  stageId: number,
  item: Partial<AuditItem> & { id: number }
) {
  if (USE_MOCK) {
    return new Promise<any>((resolve, reject) => {
      setTimeout(() => {
        try {
          const data = updateAuditItemMock(projectId, stageId, item)
          resolve({ code: 200, message: '更新成功', data })
        } catch (error: any) {
          reject({ code: 400, message: error.message })
        }
      }, 300)
    })
  }
  return request.put<AuditItem>({
    url: `/audit/project/${projectId}/stage/${stageId}/item/${item.id}`,
    data: item
  })
}

/** 删除审计事项 */
export function deleteAuditItem(projectId: number, stageId: number, itemId: number) {
  if (USE_MOCK) {
    return new Promise<any>((resolve, reject) => {
      setTimeout(() => {
        try {
          deleteAuditItemMock(projectId, stageId, itemId)
          resolve({ code: 200, message: '删除成功' })
        } catch (error: any) {
          reject({ code: 400, message: error.message })
        }
      }, 300)
    })
  }
  return request.del({
    url: `/audit/project/${projectId}/stage/${stageId}/item/${itemId}`
  })
}

/** 生成审计实施方案 */
export function generatePlan(projectId: number, stageId: number) {
  if (USE_MOCK) {
    return new Promise<any>((resolve, reject) => {
      setTimeout(() => {
        try {
          const data = generatePlanMock(projectId, stageId)
          resolve({ code: 200, message: '生成成功', data })
        } catch (error: any) {
          reject({ code: 400, message: error.message })
        }
      }, 300)
    })
  }
  return request.post<ProjectStage>({
    url: `/audit/project/${projectId}/stage/${stageId}/generate-plan`
  })
}
