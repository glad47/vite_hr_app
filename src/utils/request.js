import config from '@/config'
import { getToken, removeToken } from '@/utils/auth'
import storage from '@/utils/storage'
import errorCode from '@/utils/errorCode'
import { toast, tansParams } from '@/utils/common'

let timeout = 30000
const baseUrl = config.baseUrl

// Flag to prevent multiple logout redirects
let isLoggingOut = false

console.log("=== HR App Config ===")
console.log("Environment:", config.env)
console.log("Base URL:", baseUrl || "(using nginx proxy)")

/**
 * Auto logout - clear all data and redirect to login
 */
const autoLogout = () => {
  if (isLoggingOut) return
  isLoggingOut = true
  
  // Clear token and storage
  removeToken()
  storage.clean()
  
  // Show message
  toast('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى')
  
  // Redirect to login after short delay
  setTimeout(() => {
    isLoggingOut = false
    uni.reLaunch({ url: '/pages/login' })
  }, 1500)
}

const request = (options) => {
  // 是否需要设置 token
  const isToken = (options.headers || {}).isToken === false
  options.header = options.header || {}
  if (getToken() && !isToken) {
    options.header['Authorization'] = 'Bearer ' + getToken()
  }
  // get请求映射params参数
  if (options.params) {
    let url = options.url + '?' + tansParams(options.params)
    url = url.slice(0, -1)
    options.url = url
  }
  
  return new Promise((resolve, reject) => {
    uni.request({
      method: options.method || 'GET',
      timeout: options.timeout || timeout,
      url: options.baseUrl || baseUrl + options.url,
      data: options.data,
      header: options.header,
      dataType: 'json',
      success: (res) => {
        const code = res.data.code || 200
        const msg = errorCode[code] || res.data.msg || errorCode['default']
        
        if (code === 401) {
          // Token expired - auto logout
          autoLogout()
          reject('انتهت صلاحية الجلسة')
        } else if (code === 500) {
          toast(msg)
          reject('500')
        } else if (code !== 200) {
          toast(msg)
          reject(code)
        } else {
          resolve(res.data)
        }
      },
      fail: (error) => {
        let message = error.errMsg || 'خطأ في الاتصال بالخادم'
        if (message.includes('Network Error') || message.includes('request:fail')) {
          message = 'خطأ في الاتصال بالخادم'
        } else if (message.includes('timeout')) {
          message = 'انتهت مهلة الطلب'
        }
        toast(message)
        reject(error)
      }
    })
  })
}

export default request
