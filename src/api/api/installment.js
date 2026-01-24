import request from '@/utils/request'

// 查询أقساط السلف المالية列表
export function listInstallment(query) {
  return request({
    url: '/api/installment/list',
    method: 'get',
    params: query
  })
}

// 查询أقساط السلف المالية详细
export function getInstallment(id) {
  return request({
    url: '/api/installment/' + id,
    method: 'get'
  })
}

// 新增أقساط السلف المالية
export function addInstallment(data) {
  return request({
    url: '/api/installment',
    method: 'post',
    data: data
  })
}

// 修改أقساط السلف المالية
export function updateInstallment(data) {
  return request({
    url: '/api/installment',
    method: 'put',
    data: data
  })
}

// 删除أقساط السلف المالية
export function delInstallment(id) {
  return request({
    url: '/api/installment/' + id,
    method: 'delete'
  })
}
