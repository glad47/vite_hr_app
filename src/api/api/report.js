import request from '@/utils/request'

// 查询التقارير المحفوظه列表
export function listReport(query) {
  return request({
    url: '/api/report/list',
    method: 'get',
    params: query
  })
}

// 查询التقارير المحفوظه详细
export function getReport(id) {
  return request({
    url: '/api/report/' + id,
    method: 'get'
  })
}

// 新增التقارير المحفوظه
export function addReport(data) {
  return request({
    url: '/api/report',
    method: 'post',
    data: data
  })
}

// 修改التقارير المحفوظه
export function updateReport(data) {
  return request({
    url: '/api/report',
    method: 'put',
    data: data
  })
}

// 删除التقارير المحفوظه
export function delReport(id) {
  return request({
    url: '/api/report/' + id,
    method: 'delete'
  })
}
