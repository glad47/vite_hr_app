import request from '@/utils/request'

// 查询الخصومات列表
export function listDedection(query) {
  return request({
    url: '/api/dedection/list',
    method: 'get',
    params: query
  })
}

// 查询الخصومات详细
export function getDedection(id) {
  return request({
    url: '/api/dedection/' + id,
    method: 'get'
  })
}

// 新增الخصومات
export function addDedection(data) {
  return request({
    url: '/api/dedection',
    method: 'post',
    data: data
  })
}

// 修改الخصومات
export function updateDedection(data) {
  return request({
    url: '/api/dedection',
    method: 'put',
    data: data
  })
}

// 删除الخصومات
export function delDedection(id) {
  return request({
    url: '/api/dedection/' + id,
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
export function listSuperviseesDedections(supervisorId, query) {
  return request({
    url: '/api/dedection/supervisor/list/' + supervisorId,
    method: 'get',
    params: query
  })
}

/**
 * عدد إضافات المرؤوسين المعلقة
 * Count pending additions for supervisor's supervisees
 * @param {Long} supervisorId - معرف المشرف
 */
export function countPendingDedections(supervisorId) {
  return request({
    url: '/api/dedection/supervisor/pending/count/' + supervisorId,
    method: 'get'
  })
}
