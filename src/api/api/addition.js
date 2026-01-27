import request from '@/utils/request'

// ===================== العمليات الأساسية - Basic Operations =====================

// 查询الإضافات列表
export function listAddition(query) {
  return request({
    url: '/api/addition/list',
    method: 'get',
    params: query
  })
}

// 查询الإضافات详细
export function getAddition(id) {
  return request({
    url: '/api/addition/' + id,
    method: 'get'
  })
}

// 新增الإضافات
export function addAddition(data) {
  return request({
    url: '/api/addition',
    method: 'post',
    data: data
  })
}

// 修改الإضافات
export function updateAddition(data) {
  return request({
    url: '/api/addition',
    method: 'put',
    data: data
  })
}

// 删除الإضافات
export function delAddition(id) {
  return request({
    url: '/api/addition/' + id,
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
export function listSuperviseesAdditions(supervisorId, query) {
  return request({
    url: '/api/addition/supervisor/list/' + supervisorId,
    method: 'get',
    params: query
  })
}

/**
 * عدد إضافات المرؤوسين المعلقة
 * Count pending additions for supervisor's supervisees
 * @param {Long} supervisorId - معرف المشرف
 */
export function countPendingAdditions(supervisorId) {
  return request({
    url: '/api/addition/supervisor/pending/count/' + supervisorId,
    method: 'get'
  })
}

/**
 * الموافقة على إضافة
 * Approve an addition
 * @param {Long} id - معرف الإضافة
 */
export function approveAddition(id) {
  return request({
    url: '/api/addition/approve/' + id,
    method: 'put'
  })
}

/**
 * رفض إضافة
 * Reject an addition
 * @param {Long} id - معرف الإضافة
 * @param {String} reason - سبب الرفض (optional)
 */
export function rejectAddition(id, reason) {
  return request({
    url: '/api/addition/reject/' + id,
    method: 'put',
    data: { reason }
  })
}