import request from '@/utils/request'

// 查询جدول القسائم列表
export function listCoupon(query) {
  return request({
    url: '/api/coupon/list',
    method: 'get',
    params: query
  })
}

// 查询جدول القسائم详细
export function getCoupon(couponId) {
  return request({
    url: '/api/coupon/' + couponId,
    method: 'get'
  })
}

// 新增جدول القسائم
export function addCoupon(data) {
  return request({
    url: '/api/coupon',
    method: 'post',
    data: data
  })
}

// 修改جدول القسائم
export function updateCoupon(data) {
  return request({
    url: '/api/coupon',
    method: 'put',
    data: data
  })
}

// 删除جدول القسائم
export function delCoupon(couponId) {
  return request({
    url: '/api/coupon/' + couponId,
    method: 'delete'
  })
}
