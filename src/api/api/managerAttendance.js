import request from '@/utils/request'

// Upload 20 photos and punch out
export function punchOut(formData) {
  return request({
    url: '/api/manager-attendance/punchout',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000
  })
}

// List manager attendance records
export function listManagerAttendance(query) {
  return request({
    url: '/api/manager-attendance/list',
    method: 'get',
    params: query
  })
}
