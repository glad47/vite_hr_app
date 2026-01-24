import request from '@/utils/request'

// 查询الشركات列表
export function listCompany(query) {
  return request({
    url: '/api/company/list',
    method: 'get',
    params: query
  })
}

// 查询الشركات详细
export function getCompany(companyId) {
  return request({
    url: '/api/company/' + companyId,
    method: 'get'
  })
}

// 新增الشركات
export function addCompany(data) {
  return request({
    url: '/api/company',
    method: 'post',
    data: data
  })
}

// 修改الشركات
export function updateCompany(data) {
  return request({
    url: '/api/company',
    method: 'put',
    data: data
  })
}

// 删除الشركات
export function delCompany(companyId) {
  return request({
    url: '/api/company/' + companyId,
    method: 'delete'
  })
}
