import request from '@/utils/request'

// 查询جدول يحتوي على معلومات الأقسام داخل النظام列表
export function listDept(query) {
  return request({
    url: '/api/dept/list',
    method: 'get',
    params: query
  })
}

// 查询جدول يحتوي على معلومات الأقسام داخل النظام详细
export function getDept(deptId) {
  return request({
    url: '/api/dept/' + deptId,
    method: 'get'
  })
}

// 新增جدول يحتوي على معلومات الأقسام داخل النظام
export function addDept(data) {
  return request({
    url: '/api/dept',
    method: 'post',
    data: data
  })
}

// 修改جدول يحتوي على معلومات الأقسام داخل النظام
export function updateDept(data) {
  return request({
    url: '/api/dept',
    method: 'put',
    data: data
  })
}

// 删除جدول يحتوي على معلومات الأقسام داخل النظام
export function delDept(deptId) {
  return request({
    url: '/api/dept/' + deptId,
    method: 'delete'
  })
}
