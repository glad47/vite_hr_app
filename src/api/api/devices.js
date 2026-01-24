import request from '@/utils/request'

// 查询الاجهزة列表
export function listDevices(query) {
  return request({
    url: '/api/devices/list',
    method: 'get',
    params: query
  })
}

// 查询الاجهزة详细
export function getDevices(deviceId) {
  return request({
    url: '/api/devices/' + deviceId,
    method: 'get'
  })
}

// 新增الاجهزة
export function addDevices(data) {
  return request({
    url: '/api/devices',
    method: 'post',
    data: data
  })
}


export function connectDevices(data) {
  return request({
    url: '/api/devices/connect',
    method: 'post',
    data: data
  })
}


// 修改الاجهزة
export function updateDevices(data) {
  return request({
    url: '/api/devices',
    method: 'put',
    data: data
  })
}

// 删除الاجهزة
export function delDevices(deviceId) {
  return request({
    url: '/api/devices/' + deviceId,
    method: 'delete'
  })
}
