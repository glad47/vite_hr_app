import request from '@/utils/request'

// 查询الاشهر列表
export function listMonth(query) {
  return request({
    url: '/api/month/list',
    method: 'get',
    params: query
  })
}

// 查询الاشهر详细
export function getMonth(id) {
  return request({
    url: '/api/month/' + id,
    method: 'get'
  })
}

// 新增الاشهر
export function addMonth(data) {
  return request({
    url: '/api/month',
    method: 'post',
    data: data
  })
}

// 修改الاشهر
export function updateMonth(data) {
  return request({
    url: '/api/month',
    method: 'put',
    data: data
  })
}

// 删除الاشهر
export function delMonth(id) {
  return request({
    url: '/api/month/' + id,
    method: 'delete'
  })
}
