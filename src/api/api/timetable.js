import request from '@/utils/request'

// 查询الجدول الزمني الخاص بالأقسام فقط列表
export function listTimetable(query) {
  return request({
    url: '/api/timetable/list',
    method: 'get',
    params: query
  })
}

// 查询الجدول الزمني الخاص بالأقسام فقط详细
export function getTimetable(id) {
  return request({
    url: '/api/timetable/' + id,
    method: 'get'
  })
}

// 新增الجدول الزمني الخاص بالأقسام فقط
export function addTimetable(data) {
  return request({
    url: '/api/timetable',
    method: 'post',
    data: data
  })
}

// 修改الجدول الزمني الخاص بالأقسام فقط
export function updateTimetable(data) {
  return request({
    url: '/api/timetable',
    method: 'put',
    data: data
  })
}

// 删除الجدول الزمني الخاص بالأقسام فقط
export function delTimetable(id) {
  return request({
    url: '/api/timetable/' + id,
    method: 'delete'
  })
}
