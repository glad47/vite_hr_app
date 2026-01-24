import request from '@/utils/request'

// 查询قوالب الشيفتات列表
export function listShift(query) {
  return request({
    url: '/api/shift/list',
    method: 'get',
    params: query
  })
}

// 查询قوالب الشيفتات详细
export function getShift(id) {
  return request({
    url: '/api/shift/' + id,
    method: 'get'
  })
}

// 新增قوالب الشيفتات
export function addShift(data) {
  return request({
    url: '/api/shift',
    method: 'post',
    data: data
  })
}

// 修改قوالب الشيفتات
export function updateShift(data) {
  return request({
    url: '/api/shift',
    method: 'put',
    data: data
  })
}

// 删除قوالب الشيفتات
export function delShift(id) {
  return request({
    url: '/api/shift/' + id,
    method: 'delete'
  })
}
