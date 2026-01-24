import request from '@/utils/request'

// 查询سجلات البصمة列表
export function listTransaction(query) {
  return request({
    url: '/api/transaction/list',
    method: 'get',
    params: query
  })
}

// 查询سجلات البصمة详细
export function getTransaction(id) {
  return request({
    url: '/api/transaction/' + id,
    method: 'get'
  })
}

// 新增سجلات البصمة
export function addTransaction(data) {
  return request({
    url: '/api/transaction',
    method: 'post',
    data: data
  })
}

// 修改سجلات البصمة
export function updateTransaction(data) {
  return request({
    url: '/api/transaction',
    method: 'put',
    data: data
  })
}

// 删除سجلات البصمة
export function delTransaction(id) {
  return request({
    url: '/api/transaction/' + id,
    method: 'delete'
  })
}
