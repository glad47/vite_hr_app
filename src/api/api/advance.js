import request from '@/utils/request'

// 查询طلبات السلف المالية列表
export function listAdvance(query) {
  return request({
    url: '/api/advance/list',
    method: 'get',
    params: query
  })
}

// 查询طلبات السلف المالية详细
export function getAdvance(id) {
  return request({
    url: '/api/advance/' + id,
    method: 'get'
  })
}

// 新增طلبات السلف المالية
export function addAdvance(data) {
  return request({
    url: '/api/advance',
    method: 'post',
    data: data
  })
}

// 修改طلبات السلف المالية
export function updateAdvance(data) {
  return request({
    url: '/api/advance',
    method: 'put',
    data: data
  })
}

// 删除طلبات السلف المالية
export function delAdvance(id) {
  return request({
    url: '/api/advance/' + id,
    method: 'delete'
  })
}
