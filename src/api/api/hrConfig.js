import request from '@/utils/request'

// Get request limit configuration
export function getRequestLimit() {
  return request({
    url: '/api/hr-config/request-limit',
    method: 'get'
  })
}

// Update request limit (admin only)
export function updateRequestLimit(limit) {
  return request({
    url: '/api/hr-config/request-limit',
    method: 'put',
    data: { limit }
  })
}
