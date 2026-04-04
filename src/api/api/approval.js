import request from '@/utils/request'

// Get supervisor pending items
export function getSupervisorPendingItems(supervisorId) {
  return request({
    url: '/api/approval/supervisor/pending/' + supervisorId,
    method: 'get'
  })
}

// Get supervisor pending counts
export function getSupervisorPendingCounts(supervisorId) {
  return request({
    url: '/api/approval/supervisor/pending/counts/' + supervisorId,
    method: 'get'
  })
}

// Supervisor approve
export function supervisorApprove(data) {
  return request({
    url: '/api/approval/supervisor/approve',
    method: 'post',
    data: data
  })
}

// Supervisor reject
export function supervisorReject(data) {
  return request({
    url: '/api/approval/supervisor/reject',
    method: 'post',
    data: data
  })
}

// Supervisor batch approve
export function supervisorBatchApprove(data) {
  return request({
    url: '/api/approval/supervisor/batch-approve',
    method: 'post',
    data: data
  })
}

// Supervisor batch reject
export function supervisorBatchReject(data) {
  return request({
    url: '/api/approval/supervisor/batch-reject',
    method: 'post',
    data: data
  })
}
