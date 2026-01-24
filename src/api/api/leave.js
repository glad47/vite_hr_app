import request from '@/utils/request'

// 查询طلبات الإجازات列表
export function listLeave(query) {
  return request({
    url: '/api/leave/list',
    method: 'get',
    params: query
  })
}

// 查询طلبات الإجازات详细
export function getLeave(id) {
  return request({
    url: '/api/leave/' + id,
    method: 'get'
  })
}

// 新增طلبات الإجازات
export function addLeave(data) {
  return request({
    url: '/api/leave',
    method: 'post',
    data: data
  })
}

// 修改طلبات الإجازات
export function updateLeave(data) {
  return request({
    url: '/api/leave',
    method: 'put',
    data: data
  })
}

// 删除طلبات الإجازات
export function delLeave(id) {
  return request({
    url: '/api/leave/' + id,
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
export function listSuperviseesLeaves(supervisorId, query) {
  return request({
    url: '/api/leave/supervisor/list/' + supervisorId,
    method: 'get',
    params: query
  })
}

/**
 * عدد إضافات المرؤوسين المعلقة
 * Count pending additions for supervisor's supervisees
 * @param {Long} supervisorId - معرف المشرف
 */
export function countPendingLeaves(supervisorId) {
  return request({
    url: '/api/leave/supervisor/pending/count/' + supervisorId,
    method: 'get'
  })
}
