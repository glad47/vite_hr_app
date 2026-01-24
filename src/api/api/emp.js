import request from '@/utils/request'

// 查询الموظفون列表
export function listEmp(query) {
  return request({
    url: '/api/emp/list',
    method: 'get',
    params: query
  })
}


export function listSalary(query) {
  return request({
    url: '/api/emp/listSalary',
    method: 'get',
    params: query
  })
}

// 查询الموظفون详细
export function getEmp(id) {
  return request({
    url: '/api/emp/' + id,
    method: 'get'
  })
}

// 新增الموظفون
export function addEmp(data) {
  return request({
    url: '/api/emp',
    method: 'post',
    data: data
  })
}

// 修改الموظفون
export function updateEmp(data) {
  return request({
    url: '/api/emp',
    method: 'put',
    data: data
  })
}

// 删除الموظفون
export function delEmp(id) {
  return request({
    url: '/api/emp/' + id,
    method: 'delete'
  })
}


// Assign supervisor to entire department
export function assignSupervisorToDept(deptId, supervisorId) {
  return request({
    url: '/api/emp/supervisor/dept',
    method: 'post',
    data: {
      deptId: deptId,
      supervisorId: supervisorId
    }
  })
}

// Assign supervisor to specific employees
export function assignSupervisorToEmployees(supervisorId, superviseesIds) {
  return request({
    url: '/api/emp/supervisor/employees',
    method: 'post',
    data: {
      supervisorId: supervisorId,
      superviseesIds: superviseesIds
    }
  })
}

// Get supervisees for a supervisor
export function getSupervisees(supervisorId) {
  return request({
    url: '/api/emp/supervisor/supervisees/' + supervisorId,
    method: 'get'
  })
}

// Get supervisees IDs as comma-separated string
export function getSuperviseesIds(supervisorId) {
  return request({
    url: '/api/emp/supervisor/superviseesIds/' + supervisorId,
    method: 'get'
  })
}

// Remove supervisor from department
export function removeSupervisorFromDept(deptId, supervisorId) {
  return request({
    url: '/api/emp/supervisor/dept',
    method: 'delete',
    params: {
      deptId: deptId,
      supervisorId: supervisorId
    }
  })
}

// Remove supervisor from specific employees
export function removeSupervisorFromEmployees(superviseesIds) {
  return request({
    url: '/api/emp/supervisor/employees',
    method: 'delete',
    params: {
      superviseesIds: superviseesIds
    }
  })
}
