import request from '@/utils/request'

// 查询جدول يحتوي على معلومات الوظائف داخل النظام列表
export function listPosition(query) {
  return request({
    url: '/api/position/list',
    method: 'get',
    params: query
  })
}

// 查询جدول يحتوي على معلومات الوظائف داخل النظام详细
export function getPosition(positionId) {
  return request({
    url: '/api/position/' + positionId,
    method: 'get'
  })
}

// 新增جدول يحتوي على معلومات الوظائف داخل النظام
export function addPosition(data) {
  return request({
    url: '/api/position',
    method: 'post',
    data: data
  })
}

// 修改جدول يحتوي على معلومات الوظائف داخل النظام
export function updatePosition(data) {
  return request({
    url: '/api/position',
    method: 'put',
    data: data
  })
}

// 删除جدول يحتوي على معلومات الوظائف داخل النظام
export function delPosition(positionId) {
  return request({
    url: '/api/position/' + positionId,
    method: 'delete'
  })
}
