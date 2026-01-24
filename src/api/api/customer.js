import request from '@/utils/request'

// 查询العملاء列表
export function listCustomer(query) {
  return request({
    url: '/api/customer/list',
    method: 'get',
    params: query
  })
}

// 查询العملاء详细
export function getCustomer(customerId) {
  return request({
    url: '/api/customer/' + customerId,
    method: 'get'
  })
}

// 新增العملاء
export function addCustomer(data) {
  return request({
    url: '/api/customer',
    method: 'post',
    data: data
  })
}

// 修改العملاء
export function updateCustomer(data) {
  return request({
    url: '/api/customer',
    method: 'put',
    data: data
  })
}

// 删除العملاء
export function delCustomer(customerId) {
  return request({
    url: '/api/customer/' + customerId,
    method: 'delete'
  })
}
