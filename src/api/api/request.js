import request from '@/utils/request'

// 查询الاستذان列表
export function listRequest(query) {
  return request({
    url: '/api/request/list',
    method: 'get',
    params: query
  })
}

// 查询الاستذان详细
export function getRequest(id) {
  return request({
    url: '/api/request/' + id,
    method: 'get'
  })
}

// 新增الاستذان
export function addRequest(data) {
  return request({
    url: '/api/request',
    method: 'post',
    data: data
  })
}

// 修改الاستذان
export function updateRequest(data) {
  return request({
    url: '/api/request',
    method: 'put',
    data: data
  })
}

// 删除الاستذان
export function delRequest(id) {
  return request({
    url: '/api/request/' + id,
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
export function listSuperviseesRequests(supervisorId, query) {
  return request({
    url: '/api/request/supervisor/list/' + supervisorId,
    method: 'get',
    params: query
  })
}

/**
 * عدد إضافات المرؤوسين المعلقة
 * Count pending additions for supervisor's supervisees
 * @param {Long} supervisorId - معرف المشرف
 */
export function countPendingRequests(supervisorId) {
  return request({
    url: '/api/request/supervisor/pending/count/' + supervisorId,
    method: 'get'
  })
}

/**
 * الموافقة على استئذان
 * Approve a request
 * @param {Long} id - معرف الاستئذان
 */
export function approveRequest(id) {
  return request({
    url: '/api/request/approve/' + id,
    method: 'put'
  })
}

/**
 * رفض استئذان
 * Reject a request
 * @param {Long} id - معرف الاستئذان
 * @param {String} reason - سبب الرفض (optional)
 */
export function rejectRequest(id, reason) {
  return request({
    url: '/api/request/reject/' + id,
    method: 'put',
    data: { reason }
  })
}
