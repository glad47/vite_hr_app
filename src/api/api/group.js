import request from '@/utils/request'

// 查询مجموعات الكوبونات列表
export function listGroup(query) {
  return request({
    url: '/api/group/list',
    method: 'get',
    params: query
  })
}

// 查询مجموعات الكوبونات详细
export function getGroup(groupId) {
  return request({
    url: '/api/group/' + groupId,
    method: 'get'
  })
}

// 新增مجموعات الكوبونات
export function addGroup(data) {
  return request({
    url: '/api/group',
    method: 'post',
    data: data
  })
}

// 修改مجموعات الكوبونات
export function updateGroup(data) {
  return request({
    url: '/api/group',
    method: 'put',
    data: data
  })
}

// 删除مجموعات الكوبونات
export function delGroup(groupId) {
  return request({
    url: '/api/group/' + groupId,
    method: 'delete'
  })
}
