import request from '@/utils/request'

// 查询المناطق列表
export function listArea(query) {
  return request({
    url: '/api/area/list',
    method: 'get',
    params: query
  })
}

// 查询المناطق详细
export function getArea(id) {
  return request({
    url: '/api/area/' + id,
    method: 'get'
  })
}

// 新增المناطق
export function addArea(data) {
  return request({
    url: '/api/area',
    method: 'post',
    data: data
  })
}

// 修改المناطق
export function updateArea(data) {
  return request({
    url: '/api/area',
    method: 'put',
    data: data
  })
}

// 删除المناطق
export function delArea(id) {
  return request({
    url: '/api/area/' + id,
    method: 'delete'
  })
}
