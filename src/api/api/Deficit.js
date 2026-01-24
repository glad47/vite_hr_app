import request from '@/utils/request'

// 查询العجوزات列表
export function listDeficit(query) {
  return request({
    url: '/api/Deficit/list',
    method: 'get',
    params: query
  })
}

// 查询العجوزات详细
export function getDeficit(id) {
  return request({
    url: '/api/Deficit/' + id,
    method: 'get'
  })
}

// 新增العجوزات
export function addDeficit(data) {
  return request({
    url: '/api/Deficit',
    method: 'post',
    data: data
  })
}

// 修改العجوزات
export function updateDeficit(data) {
  return request({
    url: '/api/Deficit',
    method: 'put',
    data: data
  })
}

// 删除العجوزات
export function delDeficit(id) {
  return request({
    url: '/api/Deficit/' + id,
    method: 'delete'
  })
}


// ===================== وظائف المشرف - Supervisor Functions =====================

/**
 * استعلام إضافات المرؤوسين للمشرف
 * Get supervisees' additions for supervisor
 * @param {Long} supervisorId - معرف المشرف
 * @param {Object} query - معايير البحث (empId, dueYear, dueMonth, status, pageNum, pageSize)
 */
export function listSuperviseesDeficits(supervisorId, query) {
  return request({
    url: '/api/Deficit/supervisor/list/' + supervisorId,
    method: 'get',
    params: query
  })
}

/**
 * عدد إضافات المرؤوسين المعلقة
 * Count pending additions for supervisor's supervisees
 * @param {Long} supervisorId - معرف المشرف
 */
export function countPendingDeficits(supervisorId) {
  return request({
    url: '/api/Deficit/supervisor/pending/count/' + supervisorId,
    method: 'get'
  })
}
